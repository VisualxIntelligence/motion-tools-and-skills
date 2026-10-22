// Lighthouse beams as a post effect. Unlike a generic raymarch, each view ray is first intersected
// analytically with the two beam cones, so all samples land inside the light: crisp shafts to the horizon
// for ~24 samples a pixel. Rain sheets and wind-blown mist modulate the density; Henyey-Greenstein
// phase makes the beam blaze when it swings toward you. An analytic point-light integral adds the halo
// around the lantern, and a glare streak fires when a beam crosses the lens.
import * as THREE from 'three';
import { Effect, EffectAttribute, BlendFunction } from 'postprocessing';

const frag = /* glsl */`
uniform mat4 uProjInv;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform vec3 uLamp;
uniform vec3 uDir0;
uniform vec3 uDir1;
uniform vec2 uCos;
uniform vec3 uCol;
uniform float uDensity;
uniform float uRange;
uniform float uTime;
uniform float uRain;
uniform float uMaxDist;
uniform vec3 uWind;
uniform vec3 uHalo;
uniform vec3 uGlare;
uniform vec2 uLampUV;
uniform float uLampDist;
uniform float uAspect;
uniform float uFlash;

float h31(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}

// Is the lantern visible from the camera? (average a few depth taps so glazing bars don't flicker it)
float lampVis(){
  if (uLampUV.x < 0.0 || uLampUV.x > 1.0 || uLampUV.y < 0.0 || uLampUV.y > 1.0) return 0.0;
  float v = 0.0;
  for (int i = 0; i < 5; i++) {
    vec2 o = i == 0 ? vec2(0.0) : vec2(cos(float(i) * 1.5708), sin(float(i) * 1.5708)) * 0.006;
    vec2 q = uLampUV + o;
    vec4 c = vec4(q * 2. - 1., readDepth(q) * 2. - 1., 1.);
    vec4 p = uProjInv * c; p /= p.w;
    v += step(uLampDist - 1.3, length(p.xyz));
  }
  return v / 5.0;
}

vec2 isect(vec2 a, vec2 b){ return vec2(max(a.x, b.x), min(a.y, b.y)); }

// Interval of the ray inside the forward nappe of a cone (apex A, axis D, cos half-angle c), clipped to [0, tmax].
vec2 coneSpan(vec3 ro, vec3 rd, vec3 A, vec3 D, float c, float tmax){
  vec3 co = ro - A;
  float rdD = dot(rd, D), coD = dot(co, D);
  float c2 = c * c;
  float a = rdD * rdD - c2;
  float b = 2.0 * (rdD * coD - dot(rd, co) * c2);
  float cc = coD * coD - dot(co, co) * c2;
  vec2 lim = vec2(0.0, tmax);
  // forward half-line: dot(P - A, D) > 0
  vec2 fwd = abs(rdD) < 1e-5 ? (coD > 0.0 ? vec2(-1e9, 1e9) : vec2(1.0, 0.0))
           : (rdD > 0.0 ? vec2(-coD / rdD, 1e9) : vec2(-1e9, -coD / rdD));
  float disc = b * b - 4.0 * a * cc;
  if (disc < 0.0) {
    if (cc > 0.0) return isect(isect(vec2(-1e9, 1e9), fwd), lim);
    return vec2(1.0, 0.0);
  }
  float sq = sqrt(disc);
  float r0 = (-b - sq) / (2.0 * a), r1 = (-b + sq) / (2.0 * a);
  if (r0 > r1) { float t = r0; r0 = r1; r1 = t; }
  if (a < 0.0) return isect(isect(vec2(r0, r1), fwd), lim);
  vec2 p1 = isect(isect(vec2(-1e9, r0), fwd), lim);
  vec2 p2 = isect(isect(vec2(r1, 1e9), fwd), lim);
  return p1.y > p1.x ? p1 : p2;
}

float hg(float c, float g){ float g2 = g * g; return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * c, 1.5) * 0.0796; }

vec3 marchBeam(vec3 ro, vec3 rd, vec3 D, float tmax, float jit){
  vec2 s = coneSpan(ro, rd, uLamp, D, uCos.x, tmax);
  if (s.y <= s.x) return vec3(0.0);
  const int STEPS = 24;
  float len = s.y - s.x;
  // spend samples near the lamp where the beam is narrow and bright
  float acc = 0.0;
  float prevT = s.x;
  for (int i = 0; i < STEPS; i++) {
    float u = (float(i) + jit) / float(STEPS);
    float t = s.x + len * u * u;
    float dt = len * (2.0 * u) / float(STEPS);
    vec3 p = ro + rd * t;
    vec3 l = p - uLamp;
    float dist = max(length(l), 1e-3);
    vec3 T = l / dist;
    float cosA = dot(T, D);
    float cone = smoothstep(uCos.x, uCos.y, cosA);
    // hot core down the middle of the shaft
    cone *= 0.55 + 0.45 * smoothstep(uCos.y, 1.0, cosA);
    float att = 1.0 / (1.0 + dist * dist * uRange) * smoothstep(0.3, 1.2, dist);
    vec3 q = p * 0.33 + uWind * uTime * 1.6;
    float n = vn(q) * 0.6 + vn(q * 2.7 + 3.7) * 0.4;
    // rain: thin fast streaks slanted by the wind, plus slow sheets of heavier rain
    vec3 rq = vec3(p.x * 5.5 + p.y * 1.6, p.y * 0.28 + uTime * 13.0, p.z * 5.5);
    float streak = vn(rq);
    streak = smoothstep(0.55, 0.95, streak);
    float sheet = vn(vec3(p.x * 0.12 + uTime * 0.35, p.y * 0.05, p.z * 0.12));
    float dens = uDensity * (0.55 + 0.9 * n) * mix(1.0, 0.35 + 2.4 * streak + 0.6 * sheet, uRain);
    float ph = hg(dot(T, -rd), 0.38) * 6.0 + 0.5;
    acc += cone * att * dens * ph * dt;
  }
  return uCol * acc;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec4 clip = vec4(uv * 2. - 1., depth * 2. - 1., 1.);
  vec4 vp = uProjInv * clip; vp /= vp.w;
  vec3 wp = (uCamWorld * vec4(vp.xyz, 1.)).xyz;
  vec3 ro = uCamPos;
  vec3 rd = wp - ro;
  float sceneD = length(rd);
  rd /= sceneD;
  float tmax = min(sceneD, uMaxDist);
  float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))) + uTime * 0.618);
  vec3 acc = marchBeam(ro, rd, uDir0, tmax, jit) + marchBeam(ro, rd, uDir1, tmax, jit);

  // Halo: analytic in-scattering of the lantern (the glass itself doesn't count as an occluder).
  vec3 toL = uLamp - ro;
  float tc = dot(toL, rd);
  float dp = max(length(ro + rd * tc - uLamp), 0.05);
  float T = sceneD > uLampDist - 1.2 ? 1e5 : sceneD;
  float hi = (atan((T - tc) / dp) - atan(-tc / dp)) / dp;
  acc += uHalo * hi;

  // Glare: a beam crossing the lens flares the whole frame and streaks horizontally.
  if (uGlare.r + uGlare.g > 0.001) {
    vec2 dl = (uv - uLampUV) * vec2(uAspect, 1.0);
    float streak = exp(-abs(dl.y) * 140.0) * exp(-abs(dl.x) * 2.4);
    float star = exp(-length(dl) * 10.0);
    acc += uGlare * lampVis() * (streak * 1.3 + star * 0.8 + 0.012);
  }

  outputColor = vec4(inputColor.rgb + acc, inputColor.a);
}`;

export class BeamEffect extends Effect {
  constructor(camera, { density = 0.06, range = 0.00035, maxDist = 900, cone = [0.084, 0.05] } = {}) {
    super('BeamEffect', frag, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uProjInv', new THREE.Uniform(new THREE.Matrix4())],
        ['uCamWorld', new THREE.Uniform(new THREE.Matrix4())],
        ['uCamPos', new THREE.Uniform(new THREE.Vector3())],
        ['uLamp', new THREE.Uniform(new THREE.Vector3())],
        ['uDir0', new THREE.Uniform(new THREE.Vector3(1, 0, 0))],
        ['uDir1', new THREE.Uniform(new THREE.Vector3(-1, 0, 0))],
        ['uCos', new THREE.Uniform(new THREE.Vector2(Math.cos(cone[0]), Math.cos(cone[1])))],
        ['uCol', new THREE.Uniform(new THREE.Color())],
        ['uDensity', new THREE.Uniform(density)],
        ['uRange', new THREE.Uniform(range)],
        ['uTime', new THREE.Uniform(0)],
        ['uRain', new THREE.Uniform(1)],
        ['uMaxDist', new THREE.Uniform(maxDist)],
        ['uWind', new THREE.Uniform(new THREE.Vector3(0.9, -0.4, 0.3))],
        ['uHalo', new THREE.Uniform(new THREE.Color())],
        ['uGlare', new THREE.Uniform(new THREE.Color())],
        ['uLampUV', new THREE.Uniform(new THREE.Vector2(0.5, 0.5))],
        ['uLampDist', new THREE.Uniform(10)],
        ['uAspect', new THREE.Uniform(1.6)],
        ['uFlash', new THREE.Uniform(0)],
      ]),
    });
    this.camera = camera;
    this.cone = cone;
    this._v = new THREE.Vector3();
  }

  setCone(outer, inner) {
    this.cone = [outer, inner];
    this.uniforms.get('uCos').value.set(Math.cos(outer), Math.cos(inner));
  }

  update(renderer, inputBuffer, dt) {
    const u = this.uniforms, cam = this.camera;
    u.get('uProjInv').value.copy(cam.projectionMatrixInverse);
    u.get('uCamWorld').value.copy(cam.matrixWorld);
    u.get('uCamPos').value.setFromMatrixPosition(cam.matrixWorld);
    u.get('uTime').value += dt;
    u.get('uAspect').value = cam.aspect;
    const lamp = u.get('uLamp').value;
    const p = this._v.copy(lamp).applyMatrix4(cam.matrixWorldInverse);
    const behind = p.z > 0;
    p.applyMatrix4(cam.projectionMatrix);
    if (behind) u.get('uLampUV').value.set(-10, -10);
    else u.get('uLampUV').value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);
    u.get('uLampDist').value = lamp.distanceTo(u.get('uCamPos').value);
  }
}
