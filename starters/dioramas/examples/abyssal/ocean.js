// The water itself: wavelength-dependent fog, caustics injected into every lit material,
// a post effect for sun shafts / sonar sweep / vent heat haze, and the surface seen from below.
import * as THREE from 'three';
import { Effect, EffectAttribute, BlendFunction } from 'postprocessing';

// Seawater absorbs red first, then green: fog reaches the water colour per channel at different distances.
THREE.ShaderChunk.fog_fragment = /* glsl */`
#ifdef USE_FOG
  #ifdef FOG_EXP2
    vec3 fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth * vec3( 2.1, 1.1, 0.78 ) );
  #else
    vec3 fogFactor = vec3( smoothstep( fogNear, fogFar, vFogDepth ) );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, clamp( fogFactor, 0.0, 1.0 ) );
#endif`;

export const CAUSTIC_GLSL = /* glsl */`
float causticAt(vec2 uv, float time) {
  // After Dave Hoskins' tileable water caustic.
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float t = time * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}`;

/** Shared uniforms every patched material reads (updated once per frame by main). */
export const waterUniforms = {
  uCausT: { value: 0 },
  uCausAmt: { value: 1 },
  uCausCol: { value: new THREE.Color(0.8, 1.0, 0.95) },
  uCausScale: { value: 0.32 },
};

/**
 * Patch a MeshStandardMaterial: world-space caustics falling from above, plus optional emissive masks
 * in object space (`glow: [{ center, radius, color: Uniform, lum }]`) for lamps and lures baked into the texture.
 */
export function patchWater(mat, { caustics = true, glow = [], extra = null } = {}) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev?.call(mat, sh, r);
    Object.assign(sh.uniforms, waterUniforms);
    glow.forEach((g, k) => {
      sh.uniforms['uGlowC' + k] = { value: g.center };
      sh.uniforms['uGlowCol' + k] = g.color;
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCW;\nvarying vec3 vObj;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 cwp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          cwp = instanceMatrix * cwp;
        #endif
        vCW = (modelMatrix * cwp).xyz;
        vObj = position;`);
    let glowDecl = '', glowCode = '';
    glow.forEach((g, k) => {
      glowDecl += `uniform vec3 uGlowC${k}; uniform vec3 uGlowCol${k};\n`;
      const lum = g.lum ? `* smoothstep(${g.lum.toFixed(2)}, 1.0, dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15)))` : '';
      glowCode += `totalEmissiveRadiance += uGlowCol${k} * smoothstep(${g.radius.toFixed(4)}, ${(g.radius * (g.inner ?? 0.35)).toFixed(4)}, distance(vObj, uGlowC${k})) ${lum};\n`;
    });
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vCW; varying vec3 vObj;
        uniform float uCausT, uCausAmt, uCausScale; uniform vec3 uCausCol;
        ${glowDecl}
        ${CAUSTIC_GLSL}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${glowCode}`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        ${caustics ? `
        if (uCausAmt > 0.002) {
          vec3 cwN = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          float up = clamp(cwN.y * 0.6 + 0.42, 0.0, 1.0);
          vec2 cuv = (vCW.xz + vec2(0.18, 0.1) * vCW.y) * uCausScale;
          float cs = causticAt(cuv, uCausT) + causticAt(cuv * 1.37 + 3.1, uCausT * 1.21) * 0.6;
          reflectedLight.directDiffuse += material.diffuseColor * uCausCol * cs * up * uCausAmt;
        }` : ''}`);
    if (extra) extra(sh);
  };
  mat.customProgramCacheKey = () => 'water' + (caustics ? 1 : 0) + glow.length + (extra ? 'x' : '') + (mat.name || '');
  mat.needsUpdate = true;
  return mat;
}

// ─── Post: sun shafts, sonar sweep, heat haze ──────────────────────────────
const frag = /* glsl */`
uniform mat4 uProjInv;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform float uT;
uniform float uSun;
uniform vec3 uSunCol;
uniform float uSurfY;
uniform vec4 uPing;      // xyz origin, w radius
uniform float uPingAmt;
uniform vec4 uHaze;      // xy uv, z radius, w amount
uniform float uAspect;

float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn2(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float shaft(vec2 q) {
  float n = vn2(q * 0.36 + vec2(uT * 0.05, uT * 0.03)) * 0.6 + vn2(q * 0.95 - vec2(uT * 0.07, -uT * 0.05)) * 0.4;
  return pow(smoothstep(0.5, 0.98, n), 2.6);
}

void mainUv(inout vec2 uv) {
  if (uHaze.w > 0.001) {
    vec2 d = (uv - uHaze.xy) * vec2(uAspect, 1.0);
    float up = d.y / uHaze.z;
    float w = uHaze.z * (0.35 + max(up, 0.0) * 0.28);
    float m = exp(-pow(d.x / w, 2.0)) * smoothstep(-0.2, 0.25, up) * exp(-max(up, 0.0) * 0.45);
    float n1 = sin(uv.y * 150.0 - uT * 7.0 + sin(uv.x * 70.0 + uT * 2.3) * 1.7);
    float n2 = sin(uv.x * 120.0 + uT * 4.9 + uv.y * 50.0);
    uv += vec2(n1, n2 * 0.6) * 0.0055 * m * uHaze.w;
  }
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec3 col = inputColor.rgb;
  vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 vp = uProjInv * clip; vp /= vp.w;
  vec3 wp = (uCamWorld * vec4(vp.xyz, 1.0)).xyz;
  vec3 ro = uCamPos;
  vec3 rd = wp - ro;
  float dist = length(rd);
  rd /= dist;

  if (uSun > 0.001) {
    float len = min(dist, 46.0);
    const int N = 26;
    float stepL = len / float(N);
    float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float acc = 0.0;
    for (int i = 0; i < N; i++) {
      float t = (float(i) + jit) * stepL;
      vec3 p = ro + rd * t;
      float below = uSurfY - p.y;
      if (below < 0.0) continue;
      vec2 q = p.xz + vec2(0.18, 0.1) * below;
      acc += shaft(q) * exp(-below * 0.06 - t * 0.035) * stepL;
    }
    col += uSunCol * acc * uSun;
  }

  if (uPingAmt > 0.001 && depth < 0.99999) {
    float d = distance(wp, uPing.xyz);
    float behind = uPing.w - d;
    float front = exp(-behind * behind * 5.0);
    float trail = behind > 0.0 ? exp(-behind * 0.3) : 0.0;
    float rings = smoothstep(0.93, 1.0, fract(d * 1.1)) * trail;
    float contour = smoothstep(0.9, 1.0, fract(wp.y * 2.0)) * trail * 0.6;
    float fadeD = exp(-dist * 0.035);
    col += vec3(0.22, 0.95, 0.86) * (front * 1.5 + rings * 0.5 + contour * 0.55 + trail * 0.025) * uPingAmt * fadeD;
  }
  // The pressure wave itself, seen in open water: an expanding shell with a bright limb.
  if (uPingAmt > 0.001) {
    vec3 oc = uPing.xyz - ro;
    float R = uPing.w;
    float b = dot(oc, rd);
    float p = sqrt(max(dot(oc, oc) - b * b, 0.0));
    float w = 0.1 + R * 0.018;
    float limb = exp(-pow((R - p) / w, 2.0)) + smoothstep(R, 0.0, p) * 0.015;
    float vis = step(0.0, b) * step(b - 0.5, dist);
    float outside = smoothstep(0.0, 3.0, length(oc) - R);
    col += vec3(0.25, 0.95, 0.88) * limb * vis * outside * uPingAmt * 0.7;
  }
  outputColor = vec4(col, inputColor.a);
}`;

export class AbyssEffect extends Effect {
  constructor(camera) {
    super('AbyssEffect', frag, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uProjInv', new THREE.Uniform(new THREE.Matrix4())],
        ['uCamWorld', new THREE.Uniform(new THREE.Matrix4())],
        ['uCamPos', new THREE.Uniform(new THREE.Vector3())],
        ['uT', new THREE.Uniform(0)],
        ['uSun', new THREE.Uniform(1)],
        ['uSunCol', new THREE.Uniform(new THREE.Color(0.1, 0.25, 0.28))],
        ['uSurfY', new THREE.Uniform(0)],
        ['uPing', new THREE.Uniform(new THREE.Vector4(0, 0, 0, 0))],
        ['uPingAmt', new THREE.Uniform(0)],
        ['uHaze', new THREE.Uniform(new THREE.Vector4(0.5, 0.5, 0.1, 0))],
        ['uAspect', new THREE.Uniform(1)],
      ]),
    });
    this.camera = camera;
  }
  update(renderer, inputBuffer, dt) {
    const u = this.uniforms, cam = this.camera;
    u.get('uProjInv').value.copy(cam.projectionMatrixInverse);
    u.get('uCamWorld').value.copy(cam.matrixWorld);
    u.get('uCamPos').value.setFromMatrixPosition(cam.matrixWorld);
    u.get('uT').value += dt;
    u.get('uAspect').value = cam.aspect;
  }
}

// ─── The water around you: brighter toward the surface, darker below ───────
export function waterDome() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uBot: { value: new THREE.Color() }, uSun: { value: 1 }, uT: { value: 0 } },
    vertexShader: /* glsl */`varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uTop, uMid, uBot; uniform float uSun, uT; varying vec3 vD;
      void main(){
        vec3 d = normalize(vD);
        float y = d.y;
        vec3 col = mix(uMid, uTop, smoothstep(0.0, 0.85, y));
        col = mix(col, uBot, smoothstep(0.02, -0.7, y));
        // the sun, smeared by the water above
        float s = pow(max(dot(d, normalize(vec3(-0.18, 1.0, -0.1))), 0.0), 6.0);
        col += uTop * s * 0.8 * uSun;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 24), mat);
  m.renderOrder = -10;
  m.frustumCulled = false;
  return m;
}

// ─── The surface, seen from below ──────────────────────────────────────────
export function waterSurface() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    fog: false, transparent: true, depthWrite: false,
    uniforms: {
      uT: { value: 0 }, uAmt: { value: 1 },
      uSky: { value: new THREE.Color(1.7, 2.6, 2.6) },
      uDeep: { value: new THREE.Color(0.04, 0.28, 0.34) },
      uFog: { value: new THREE.Color(0.05, 0.4, 0.45) },
    },
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */`
      uniform float uT, uAmt; uniform vec3 uSky, uDeep, uFog;
      varying vec3 vW;
      ${CAUSTIC_GLSL}
      vec2 waves(vec2 p) {
        vec2 g = vec2(0.0);
        g += vec2(cos(p.x * 0.9 + uT * 1.1), cos(p.y * 0.7 + uT * 0.8)) * 0.16;
        g += vec2(cos(dot(p, vec2(1.7, 1.1)) - uT * 1.7), cos(dot(p, vec2(-1.3, 1.9)) + uT * 1.4)) * 0.09;
        g += vec2(cos(dot(p, vec2(4.1, -2.3)) + uT * 2.9), cos(dot(p, vec2(2.7, 3.9)) - uT * 2.5)) * 0.05;
        return g;
      }
      void main() {
        vec3 v = vW - cameraPosition;
        float dist = length(v);
        v /= dist;
        vec2 g = waves(vW.xz * 0.45);
        vec3 n = normalize(vec3(g.x, 1.0, g.y));
        float c = dot(v, n);
        // Snell's window, widened a touch so the light reaches into a landscape frame.
        float win = smoothstep(0.3, 0.78, c);
        float glint = causticAt(vW.xz * 0.11 + g * 0.3, uT * 0.45);
        float fine = causticAt(vW.xz * 0.29 - g * 0.2, uT * 0.6);
        float web = smoothstep(0.08, 0.6, fine) * 0.9 + smoothstep(0.1, 0.7, glint) * 0.6;
        vec3 sky = uSky * (0.32 + 1.6 * web) * (0.8 + 0.6 * smoothstep(0.85, 1.0, c));
        vec3 refl = uDeep * (0.5 + 1.4 * web + g.x * 0.6);
        vec3 col = mix(refl, sky, win);
        col = mix(col, uFog, 1.0 - exp(-dist * 0.006));
        gl_FragColor = vec4(col * uAmt, exp(-dist * 0.011) * uAmt);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(700, 700, 1, 1), mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.frustumCulled = false;
  return mesh;
}
