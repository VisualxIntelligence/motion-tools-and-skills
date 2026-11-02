// Gerstner-wave ocean: one wave set evaluated identically on the GPU (surface) and the CPU (boat buoyancy).
// Shading is custom: fresnel sky + planar reflection, green subsurface in wave backs, crest/rock/wake foam,
// and the lighthouse beams, lamp glint, lightning, flares and the dawn sun all light the water directly.
import { THREE } from '../../src/core/engine.js';

// [direction (deg), wavelength, steepness at full storm, steepness at dawn]
const WAVES = [
  [18, 52, 0.16, 0.06],
  [-14, 34, 0.15, 0.035],
  [40, 21, 0.14, 0.012],
  [-40, 13.5, 0.13, 0.008],
  [72, 8.4, 0.11, 0.006],
  [4, 5.1, 0.09, 0.004],
];
const N = WAVES.length;
const G = 7.2;       // gravity in scene units (1 unit ≈ 1.8 m) — slightly slowed for weight
export const ROCK = { c: new THREE.Vector2(0.1, -0.45), half: new THREE.Vector2(3.35, 3.05), r: 0.9 };

export class Waves {
  constructor() {
    this.dir = WAVES.map(w => new THREE.Vector2(Math.cos(w[0] * Math.PI / 180), Math.sin(w[0] * Math.PI / 180)));
    this.k = WAVES.map(w => 2 * Math.PI / w[1]);
    this.w = this.k.map(k => Math.sqrt(G * k));
    this.steep = WAVES.map(w => w[2]);
    this.u = {
      uWA: { value: WAVES.map(() => new THREE.Vector4()) },   // dir.x, dir.y, k, amplitude
      uWS: { value: new Array(N).fill(0) },                  // steepness (a*k)
      uWO: { value: this.w.slice() },                        // omega
      uWTime: { value: 0 },
      uRock: { value: ROCK.c },
    };
    this.setStorm(1);
  }

  setStorm(s) {
    this.storm = s;
    for (let i = 0; i < N; i++) {
      const st = WAVES[i][3] + (WAVES[i][2] - WAVES[i][3]) * s;
      this.steep[i] = st;
      const d = this.dir[i];
      this.u.uWA.value[i].set(d.x, d.y, this.k[i], st / this.k[i]);
      this.u.uWS.value[i] = st;
    }
  }

  set time(t) { this.u.uWTime.value = t; }
  get time() { return this.u.uWTime.value; }

  rockAtt(x, z) {
    const dx = x - ROCK.c.x, dz = z - ROCK.c.y;
    const d = Math.hypot(dx, dz);
    const t = Math.min(1, Math.max(0, (d - 4.5) / (15 - 4.5)));
    return 0.28 + 0.72 * t * t * (3 - 2 * t);
  }

  /** Displacement of the base point (x,z) → out {x,y,z} (absolute world position). */
  displace(x, z, out) {
    const t = this.time, att = this.rockAtt(x, z);
    let dx = 0, dy = 0, dz = 0;
    for (let i = 0; i < N; i++) {
      const d = this.dir[i], k = this.k[i], a = this.steep[i] / k * att;
      const f = k * (d.x * x + d.y * z) - this.w[i] * t;
      const c = Math.cos(f);
      dx += d.x * a * c; dz += d.y * a * c; dy += a * Math.sin(f);
    }
    out.x = x + dx; out.y = dy; out.z = z + dz;
    return out;
  }

  /** Surface height at world (x,z): invert the horizontal displacement with a few fixed-point steps. */
  height(x, z) {
    const o = this._o ??= { x: 0, y: 0, z: 0 };
    let bx = x, bz = z;
    for (let i = 0; i < 3; i++) { this.displace(bx, bz, o); bx += x - o.x; bz += z - o.z; }
    return this.displace(bx, bz, o).y;
  }
}

export const WAVE_GLSL = /* glsl */`
  uniform vec4 uWA[${N}];
  uniform float uWS[${N}];
  uniform float uWO[${N}];
  uniform float uWTime;
  uniform vec2 uRock;
  float rockAtt(vec2 p){ float d = length(p - uRock); return 0.28 + 0.72 * smoothstep(4.5, 15.0, d); }
  // Short waves fade with distance so the horizon never aliases.
  float waveLod(int i, float dist){ return uWA[i].z > 0.4 ? 1.0 - smoothstep(110.0, 320.0, dist) : 1.0; }
  vec3 gerstner(vec2 p, float dist){
    float att = rockAtt(p);
    vec3 d = vec3(0.0);
    for (int i = 0; i < ${N}; i++) {
      vec4 w = uWA[i];
      float f = w.z * dot(w.xy, p) - uWO[i] * uWTime;
      float a = w.w * att * waveLod(i, dist);
      float c = cos(f);
      d += vec3(w.x * a * c, a * sin(f), w.y * a * c);
    }
    return d;
  }
  // Analytic normal + Jacobian (foam where the surface folds).
  vec3 gerstnerNormal(vec2 p, float dist, out float jac){
    float att = rockAtt(p);
    float sxx = 0.0, szz = 0.0, sxz = 0.0, nx = 0.0, nz = 0.0;
    for (int i = 0; i < ${N}; i++) {
      vec4 w = uWA[i];
      float f = w.z * dot(w.xy, p) - uWO[i] * uWTime;
      float s = uWS[i] * att * waveLod(i, dist);
      float sn = sin(f), cs = cos(f);
      sxx += w.x * w.x * s * sn; szz += w.y * w.y * s * sn; sxz += w.x * w.y * s * sn;
      nx += w.x * s * cs; nz += w.y * s * cs;
    }
    vec3 tx = vec3(1.0 - sxx, nx, -sxz);
    vec3 tz = vec3(-sxz, nz, 1.0 - szz);
    jac = (1.0 - sxx) * (1.0 - szz) - sxz * sxz;
    return normalize(cross(tz, tx));
  }
`;

/** Polar grid centred on the rock: dense around it, stretching to the horizon. */
export function oceanGeometry({ segs = 640, r0 = 1.2, rMax = 1400, dr0 = 0.14, grow = 0.017 } = {}) {
  const radii = [];
  for (let r = r0; r < rMax; r += Math.max(dr0, r * grow)) radii.push(r);
  radii.push(rMax);
  const R = radii.length;
  const pos = new Float32Array(R * segs * 3);
  for (let i = 0; i < R; i++) for (let j = 0; j < segs; j++) {
    const a = j / segs * Math.PI * 2, k = (i * segs + j) * 3;
    pos[k] = ROCK.c.x + Math.cos(a) * radii[i]; pos[k + 1] = 0; pos[k + 2] = ROCK.c.y + Math.sin(a) * radii[i];
  }
  const idx = new Uint32Array((R - 1) * segs * 6);
  let n = 0;
  for (let i = 0; i < R - 1; i++) for (let j = 0; j < segs; j++) {
    const a = i * segs + j, b = i * segs + (j + 1) % segs, c = (i + 1) * segs + j, d = (i + 1) * segs + (j + 1) % segs;
    idx[n++] = a; idx[n++] = b; idx[n++] = c; idx[n++] = b; idx[n++] = d; idx[n++] = c;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), rMax + 10);
  return g;
}

export function oceanMaterial({ waves, refl, foamTex, detailN, env }) {
  const uniforms = {
    ...waves.u,
    ...refl.uniforms,
    uTime: { value: 0 },
    uFoamTex: { value: foamTex },
    uDetailN: { value: detailN },
    uStorm: { value: 1 },
    uDawn: { value: 0 },
    uWind: { value: new THREE.Vector2(0.94, 0.34) },
    // palette (animated from JS)
    uDeep: { value: new THREE.Color() },
    uSSS: { value: new THREE.Color() },
    uSkyZen: { value: new THREE.Color() },
    uSkyHor: { value: new THREE.Color() },
    uAmb: { value: new THREE.Color() },
    uFogCol: { value: new THREE.Color() },
    uFogDen: { value: 0.006 },
    // lighthouse
    uLamp: { value: new THREE.Vector3() },
    uBeamDir: { value: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)] },
    uBeamCos: { value: new THREE.Vector2(0.99, 0.997) },
    uBeamCol: { value: new THREE.Color() },
    uGlintCol: { value: new THREE.Color() },
    // lightning, flare, sun
    uFlash: { value: 0 },
    uFlashDir: { value: new THREE.Vector3(0, 1, 0) },
    uFlashCol: { value: new THREE.Color(0.75, 0.82, 1.0) },
    uFlarePos: { value: new THREE.Vector3(0, -100, 0) },
    uFlareCol: { value: new THREE.Color(0, 0, 0) },
    uSunDir: { value: new THREE.Vector3(0, 0.05, -1).normalize() },
    uSunCol: { value: new THREE.Color(0, 0, 0) },
    uMoonDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() },
    uMoonCol: { value: new THREE.Color(0, 0, 0) },
    // boat (for hull foam + wake)
    uBoat: { value: new THREE.Vector4(0, 0, 0, 1) },    // x, z, heading, visible
    uWake: { value: 0 },
    uReflAmt: { value: 0.5 },
    uDebug: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      ${WAVE_GLSL}
      varying vec2 vBase;
      varying vec3 vWorld;
      varying float vDist;
      void main(){
        vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
        float dist = length(wp.xz - cameraPosition.xz);
        vec3 d = gerstner(wp.xz, dist);
        vBase = wp.xz; vDist = dist;
        wp += d;
        vWorld = wp;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */`
      ${WAVE_GLSL}
      uniform float uTime, uStorm, uDawn, uFogDen, uFlash, uWake, uReflAmt, uDebug;
      uniform vec2 uWind;
      uniform sampler2D uFoamTex, uDetailN, uRefl;
      uniform mat4 uReflMat;
      uniform vec3 uDeep, uSSS, uSkyZen, uSkyHor, uAmb, uFogCol;
      uniform vec3 uLamp, uBeamDir[2], uBeamCol, uGlintCol;
      uniform vec2 uBeamCos;
      uniform vec3 uFlashDir, uFlashCol, uFlarePos, uFlareCol, uSunDir, uSunCol, uMoonDir, uMoonCol;
      uniform vec4 uBoat;
      varying vec2 vBase;
      varying vec3 vWorld;
      varying float vDist;

      float sdRock(vec2 p){
        vec2 q = abs(p - uRock) - vec2(${ROCK.half.x.toFixed(2)}, ${ROCK.half.y.toFixed(2)}) + ${ROCK.r.toFixed(2)};
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - ${ROCK.r.toFixed(2)};
      }
      float ggx(vec3 N, vec3 V, vec3 L, float r){
        vec3 H = normalize(V + L);
        float nh = max(dot(N, H), 0.0), a2 = r * r * r * r;
        float d = nh * nh * (a2 - 1.0) + 1.0;
        return a2 / (3.14159 * d * d) * max(dot(N, L), 0.0);
      }
      vec3 skyCol(vec3 R){
        float y = max(R.y, 0.0);
        vec3 c = mix(uSkyHor, uSkyZen, pow(smoothstep(0.0, 0.7, y), 0.7));
        float sd = max(dot(R, uSunDir), 0.0);
        c += uSunCol * (pow(sd, 6.0) * 0.12 + pow(sd, 60.0) * 0.8);
        c += uFlashCol * uFlash * uFlash * (0.12 + 1.3 * pow(max(dot(R, uFlashDir), 0.0), 4.0));
        return c;
      }
      void main(){
        float jac;
        vec3 N = gerstnerNormal(vBase, vDist, jac);
        vec3 P = vWorld;
        vec3 V = normalize(cameraPosition - P);
        float dist = length(cameraPosition - P);

        // Wind chop: two scrolling detail normal layers, fading with distance.
        float chop = mix(0.18, 1.0, uStorm) * (1.0 - smoothstep(40.0, 260.0, dist));
        vec2 w = uWind * uTime;
        vec3 n1 = texture2D(uDetailN, vBase * 0.045 + w * 0.012).xyz * 2.0 - 1.0;
        vec3 n2 = texture2D(uDetailN, vBase * 0.11 - w.yx * 0.02).xyz * 2.0 - 1.0;
        vec3 n3 = texture2D(uDetailN, vBase * 0.31 + w * 0.05).xyz * 2.0 - 1.0;
        vec2 dn = (n1.xy * 0.55 + n2.xy * 0.35 + n3.xy * 0.22 * (1.0 - smoothstep(10.0, 60.0, dist))) * chop;
        N = normalize(N + vec3(dn.x, 0.0, dn.y) * 0.9);

        // ── Foam: folding crests, wind streaks, the rock, the boat.
        float h = P.y;
        vec2 fuv = vBase * 0.07 + w * 0.006;
        vec4 ft = texture2D(uFoamTex, fuv);
        vec4 ft2 = texture2D(uFoamTex, vBase * 0.19 - w * 0.011);
        float lace = ft.r * 0.6 + ft2.r * 0.55;
        float crest = smoothstep(0.98, 0.42, jac) * smoothstep(-0.2, 1.4, h) + smoothstep(1.1, 2.6, h) * 0.6;
        float streak = texture2D(uFoamTex, vec2(dot(vBase, uWind) * 0.012 + uTime * 0.01, dot(vBase, vec2(-uWind.y, uWind.x)) * 0.09)).g;
        float foam = crest * (0.35 + lace) * uStorm;
        foam += smoothstep(0.52, 0.86, streak) * 0.36 * uStorm * smoothstep(0.1, 0.8, lace + ft.g * 0.4);
        // churning surf around the rock, with pulses rolling outward
        float rd = sdRock(vBase + (ft2.gb - 0.5) * 1.6);
        float surf = exp(-max(rd, 0.0) * mix(0.42, 1.6, 1.0 - uStorm));
        float pulse = 0.55 + 0.45 * sin(rd * 2.4 - uTime * 1.7 + ft.g * 4.0);
        foam += surf * (0.5 + lace * 0.9) * mix(0.35, 1.0, uStorm) * mix(1.0, pulse, smoothstep(0.3, 3.5, rd));
        // the boat: hull wash + Kelvin wake
        if (uBoat.w > 0.0) {
          vec2 bf = vec2(sin(uBoat.z), cos(uBoat.z));
          vec2 rel = vBase - uBoat.xy;
          float u = dot(rel, bf), v = dot(rel, vec2(bf.y, -bf.x));
          float hull = length(vec2(u / 2.9, v / 0.95));
          foam += smoothstep(1.18, 0.92, hull) * (0.25 + lace * 0.9) * uBoat.w;
          float back = max(-u, 0.0);
          float arm = abs(abs(v) - back * 0.36);
          float wake = smoothstep(1.2, 0.0, arm) * smoothstep(0.0, 2.0, back) * exp(-back * 0.045);
          float wash = smoothstep(1.4, 0.0, abs(v) - back * 0.06) * smoothstep(0.0, 1.5, -u + 0.5) * exp(-back * 0.07);
          foam += (wake * 0.7 + wash * 0.9) * (0.35 + lace) * uWake * uBoat.w;
        }
        foam = clamp(foam, 0.0, 1.0);
        foam *= 1.0 - smoothstep(180.0, 420.0, dist);

        // ── Lighting
        float ndv = max(dot(N, V), 0.0);
        float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
        vec3 R = reflect(-V, N);
        vec3 refl = skyCol(vec3(R.x, abs(R.y), R.z));
        // planar reflection of the lighthouse, boat and sky (rough sea blurs it)
        {
          vec4 rp = uReflMat * vec4(vBase.x, 0.0, vBase.y, 1.0);
          vec2 ruv = rp.xy / rp.w + N.xz * mix(0.035, 0.09, uStorm);
          float lod = mix(1.0, 3.5, uStorm);
          vec3 pr = textureLod(uRefl, ruv, lod).rgb;
          float edge = smoothstep(0.0, 0.05, ruv.x) * smoothstep(1.0, 0.95, ruv.x) * smoothstep(0.0, 0.05, ruv.y) * smoothstep(1.0, 0.95, ruv.y);
          refl = mix(refl, pr, edge * uReflAmt);
        }

        // lighthouse beams hitting the sea
        vec3 Lv = P - uLamp;
        float Ld = length(Lv);
        vec3 T = Lv / Ld;               // travel direction of lamp light
        vec3 L = -T;
        float cone = 0.0;
        for (int i = 0; i < 2; i++) cone += smoothstep(uBeamCos.x, uBeamCos.y, dot(T, uBeamDir[i]));
        vec3 E = uBeamCol * cone / (1.0 + Ld * Ld * 0.0009);
        float thick = smoothstep(-0.6, 2.2, h);
        vec3 lit = vec3(0.0);
        lit += E * ggx(N, V, L, 0.22) * 0.9;
        lit += E * (uSSS * (0.015 + 0.5 * pow(max(dot(T, V), 0.0), 3.0) * thick) + vec3(0.012, 0.009, 0.005) * max(dot(N, L), 0.0));
        // the lantern itself glints on every wave between it and you
        lit += uGlintCol * ggx(N, V, L, 0.3) / (1.0 + Ld * Ld * 0.0006);
        // moon sheen behind the storm
        lit += uMoonCol * ggx(N, V, uMoonDir, 0.32) * 0.9;

        // lightning
        lit += uFlashCol * uFlash * uFlash * (ggx(N, V, uFlashDir, 0.3) * 0.6 + uSSS * 2.0 * thick * 0.3 + 0.012);
        // flare
        vec3 fv = uFlarePos - P; float fd = length(fv); vec3 fl = fv / fd;
        vec3 FE = uFlareCol / (1.0 + fd * fd * 0.01);
        lit += FE * (0.006 + 0.02 * max(dot(N, fl), 0.0) + uSSS * 0.12 * thick);
        // dawn sun: glitter path + light through the swell
        lit += uSunCol * (ggx(N, V, uSunDir, mix(0.07, 0.25, uStorm)) * 1.2 + uSSS * 1.1 * pow(max(dot(-uSunDir, V), 0.0), 4.0) * thick);

        vec3 body = uDeep * (0.6 + 0.4 * N.y) + uAmb * 0.35 + uSSS * uAmb * 2.0 * thick;
        vec3 col = mix(body, refl, F) + lit;

        // foam is lit, not glowing
        vec3 foamLight = uAmb * 3.0 + uSkyHor * 3.5 + vec3(0.03, 0.036, 0.046) * uStorm + uMoonCol * 0.3 + uGlintCol * 7.0 / (1.0 + Ld * Ld * 0.012) + E * max(dot(N, L), 0.0) * 1.1 + uFlashCol * uFlash * uFlash * 0.6 + FE * 0.03 + uSunCol * 0.35 * max(uSunDir.y + 0.3, 0.0) + uGlintCol * 0.004;
        col = mix(col, vec3(0.9, 0.93, 0.95) * foamLight, foam * 0.92);

        // fog (rain haze thickens it)
        float fog = 1.0 - exp(-pow(dist * uFogDen, 2.0));
        vec3 fogc = uFogCol + uFlashCol * uFlash * uFlash * 0.05;
        col = mix(col, fogc, fog);
        if (uDebug > 0.5) col = vec3(foam, jac * 0.5, max(h, 0.0) * 0.3);
        if (uDebug > 1.5) col = vec3(surf, clamp(rd * 0.05, 0.0, 1.0), lace);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  mat.extensions = { derivatives: true };
  return mat;
}
