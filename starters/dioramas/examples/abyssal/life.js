// Everything procedural that lives in the water column.
import * as THREE from 'three';
import { patchWater } from './ocean.js';

const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);

// Floodlight cone test shared by particle shaders.
const FLOOD_GLSL = /* glsl */`
uniform vec3 uLPos[3]; uniform vec3 uLDir[3]; uniform float uLCos; uniform float uLPow;
float floodAt(vec3 p) {
  float l = 0.0;
  for (int i = 0; i < 3; i++) {
    vec3 d = p - uLPos[i]; float dd = length(d);
    float c = smoothstep(uLCos, uLCos + 0.05, dot(d / max(dd, 1e-3), uLDir[i]));
    l += c * smoothstep(0.4, 2.2, dd) / (1.0 + dd * dd * 0.018);
  }
  return l * uLPow;
}`;
export const floodUniforms = {
  uLPos: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
  uLDir: { value: [new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1)] },
  uLCos: { value: 0.95 },
  uLPow: { value: 0 },
};

/** Marine snow: a box of flakes wrapped around the camera (or fixed, for silt). Lit by sun ambient + floodlights. */
export function marineSnow({ count = 7000, box = 28, fixed = null, size = 1, color = new THREE.Color(0.8, 0.95, 1) } = {}) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) { pos[i * 3] = Math.random(); pos[i * 3 + 1] = Math.random(); pos[i * 3 + 2] = Math.random(); seed[i] = Math.random(); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      ...floodUniforms,
      uCam: { value: new THREE.Vector3() }, uBox: { value: fixed ? new THREE.Vector3(...fixed.size) : new THREE.Vector3(box, box, box) },
      uCenter: { value: fixed ? new THREE.Vector3(...fixed.center) : new THREE.Vector3() }, uWrap: { value: fixed ? 0 : 1 },
      uT: { value: 0 }, uStretch: { value: 0 }, uAmb: { value: 1 }, uAmbCol: { value: color.clone() }, uFogD: { value: 0.05 },
      uDpr: { value: 1 }, uSize: { value: size }, uWarm: { value: 0 }, uFloodMul: { value: 1 },
    },
    vertexShader: /* glsl */`
      attribute float seed;
      uniform vec3 uCam, uBox, uCenter; uniform float uWrap, uT, uStretch, uAmb, uFogD, uDpr, uSize, uFloodMul;
      ${FLOOD_GLSL}
      varying float vA; varying float vS; varying float vF;
      void main(){
        vec3 p = position * uBox;
        float t = uT;
        p += vec3(sin(t * 0.13 + seed * 30.0) * 0.5, -t * (0.04 + seed * 0.05), cos(t * 0.11 + seed * 17.0) * 0.5);
        if (uWrap > 0.5) p = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5 + uCam;
        else p = mod(p, uBox) - uBox * 0.5 + uCenter;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = max(-mv.z, 0.1);
        float fl = floodAt(p);
        vF = fl / (fl + uAmb + 1e-4);
        vA = min(uAmb * 0.55 + fl * uFloodMul, 1.6) * (0.3 + 0.7 * fract(seed * 91.7)) * exp(-dist * uFogD) * smoothstep(0.4, 1.4, dist);
        vS = uStretch;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min((0.9 + seed * seed * 2.8) * uSize * uDpr * (7.0 / dist) * (1.0 + uStretch), 40.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uAmbCol; uniform float uWarm;
      varying float vA; varying float vS; varying float vF;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        c.x *= 1.0 + vS;
        float a = smoothstep(0.5, 0.05, length(c));
        vec3 col = mix(uAmbCol, mix(vec3(0.92, 0.97, 1.0), vec3(1.0, 0.8, 0.55), uWarm), vF);
        gl_FragColor = vec4(col * a * vA, 1.0);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 5;
  return { points: pts, mat };
}

/** Bioluminescent plankton trail + air bubbles, spawned along the pointer ray. Ring buffer on the GPU. */
export function spawner(count = 4000) {
  const pos = new Float32Array(count * 3), birth = new Float32Array(count).fill(-100), seed = new Float32Array(count), kind = new Float32Array(count);
  for (let i = 0; i < count; i++) seed[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('birth', new THREE.BufferAttribute(birth, 1));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('kind', new THREE.BufferAttribute(kind, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uDpr: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float birth, seed, kind; uniform float uT, uDpr;
      varying float vA; varying float vK; varying float vAge;
      void main(){
        float age = uT - birth;
        float life = kind > 0.5 ? 3.2 : 2.6;
        vec3 p = position;
        if (kind > 0.5) {
          p.y += age * (0.7 + seed * 0.8) + age * age * 0.12;
          p.x += sin(age * 9.0 + seed * 40.0) * 0.04 * age;
          p.z += cos(age * 8.0 + seed * 20.0) * 0.04 * age;
        } else {
          p += vec3(sin(seed * 60.0 + age * 0.9), 0.4 + sin(seed * 13.0 + age), cos(seed * 31.0 + age * 0.8)) * 0.06 * age;
        }
        float alive = step(0.0, age) * step(age, life);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = max(-mv.z, 0.1);
        if (kind > 0.5) vA = alive * smoothstep(0.0, 0.15, age) * smoothstep(life, life * 0.5, age) * 0.6;
        else vA = alive * (smoothstep(0.0, 0.04, age) * exp(-age * 2.0) * 3.4 + exp(-age * 0.8) * 0.5 * smoothstep(life, life * 0.6, age)) * (0.75 + 0.25 * sin(age * 31.0 + seed * 90.0));
        vK = kind; vAge = age;
        gl_Position = projectionMatrix * mv;
        float s = kind > 0.5 ? (1.5 + seed * 5.0) : (2.2 + seed * 3.2) * (1.0 + 1.5 * exp(-age * 5.0));
        gl_PointSize = alive * min(s * uDpr * (6.0 / dist), 48.0);
      }`,
    fragmentShader: /* glsl */`
      varying float vA; varying float vK; varying float vAge;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        vec3 col; float a;
        if (vK > 0.5) {
          a = smoothstep(0.5, 0.42, d) * (0.25 + smoothstep(0.3, 0.46, d) * 0.9) + smoothstep(0.2, 0.0, length(gl_PointCoord - vec2(0.36, 0.34))) * 0.8;
          col = vec3(0.75, 0.95, 1.0);
        } else {
          a = smoothstep(0.5, 0.0, d); a *= a;
          col = mix(vec3(0.8, 1.0, 1.0), mix(vec3(0.25, 0.84, 0.79), vec3(0.08, 0.35, 0.9), smoothstep(0.4, 2.2, vAge)), smoothstep(0.0, 0.25, vAge));
        }
        gl_FragColor = vec4(col * a * vA, 1.0);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 6;
  let head = 0, dirty = false;
  return {
    points: pts, mat,
    emit(x, y, z, t, k = 0) {
      const i = head; head = (head + 1) % count;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; birth[i] = t; kind[i] = k; dirty = true;
    },
    flush() {
      if (!dirty) return;
      geo.attributes.position.needsUpdate = true; geo.attributes.birth.needsUpdate = true; geo.attributes.kind.needsUpdate = true;
      dirty = false;
    },
  };
}

// ─── Jellyfish ───────────────────────────────────────────────────────────
const bellGeo = (() => {
  const pts = [];
  for (let i = 0; i <= 28; i++) {
    const a = i / 28, phi = a * 1.78;
    const r = Math.sin(phi) * (1 + 0.06 * Math.sin(a * Math.PI)), y = Math.cos(phi) * 0.72 + (a > 0.85 ? -(a - 0.85) * 0.25 : 0);
    pts.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  return new THREE.LatheGeometry(pts, 64);
})();
const jellyBellMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uT: { value: 0 }, uPhase: { value: 0 }, uRate: { value: 1 }, uColA: { value: new THREE.Color() }, uColB: { value: new THREE.Color() }, uGlow: { value: 1 }, uFogD: { value: 0.05 } },
  vertexShader: /* glsl */`
    uniform float uT, uPhase, uRate;
    varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying float vPulse; varying float vDist;
    float pulseAt(float t) { float s = fract(t); return smoothstep(0.0, 0.18, s) * (1.0 - smoothstep(0.18, 0.75, s)); }
    void main(){
      vec3 p = position;
      float pu = pulseAt(uT * uRate + uPhase);
      float along = uv.y;
      float k = pu * 0.24 * smoothstep(0.15, 1.0, along);
      p.xz *= 1.0 - k;
      p.y += pu * 0.1 * along - k * 0.12;
      float ang = atan(p.z, p.x);
      p.xz *= 1.0 + 0.035 * sin(ang * 8.0 + uT * 1.3) * along;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vN = normalize(normalMatrix * normal); vV = -mv.xyz; vUv = uv; vPulse = pu; vDist = -mv.z;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 uColA, uColB; uniform float uGlow, uFogD;
    varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying float vPulse; varying float vDist;
    void main(){
      float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
      float ang = vUv.x * 6.28318;
      float canal = smoothstep(0.9, 1.0, cos(ang * 8.0)) * smoothstep(0.08, 0.5, vUv.y) * 0.8;
      float gon = smoothstep(0.55, 1.0, cos(ang * 4.0)) * smoothstep(0.1, 0.26, vUv.y) * smoothstep(0.5, 0.3, vUv.y);
      float rim = smoothstep(0.82, 1.0, vUv.y);
      float dots = smoothstep(0.8, 1.0, cos(ang * 32.0)) * smoothstep(0.9, 0.97, vUv.y) * smoothstep(1.0, 0.97, vUv.y);
      vec3 col = uColA * (fres * 0.9 + rim * 0.9 + canal * 0.5 + 0.05) + uColB * (gon * 1.3 + dots * 5.0 * (0.4 + vPulse * 2.0));
      col *= uGlow * (0.8 + vPulse * 0.8);
      col *= exp(-vDist * uFogD);
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const tentacleMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uT: { value: 0 }, uPhase: { value: 0 }, uRate: { value: 1 }, uColA: { value: new THREE.Color() }, uGlow: { value: 1 }, uLen: { value: 2.5 }, uFogD: { value: 0.05 } },
  vertexShader: /* glsl */`
    attribute float aT, aAng, aR;
    uniform float uT, uPhase, uRate, uLen;
    varying float vT; varying float vDist;
    float pulseAt(float t) { float s = fract(t); return smoothstep(0.0, 0.18, s) * (1.0 - smoothstep(0.18, 0.75, s)); }
    void main(){
      float pu = pulseAt(uT * uRate + uPhase - aT * 0.35);
      float r = aR * (1.0 - pu * 0.2);
      vec3 p = vec3(cos(aAng) * r, -0.08 - aT * uLen * aR, sin(aAng) * r);
      float sway = aT * aT;
      p.x += sin(uT * 0.9 + aT * 5.0 + aAng * 3.0) * 0.18 * sway * uLen * 0.4;
      p.z += cos(uT * 0.7 + aT * 4.0 + aAng * 2.0) * 0.18 * sway * uLen * 0.4;
      p.xz *= 1.0 - aT * 0.5;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vT = aT; vDist = -mv.z;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 uColA; uniform float uGlow, uFogD; varying float vT; varying float vDist;
    void main(){ gl_FragColor = vec4(uColA * (1.0 - vT) * 0.7 * uGlow * exp(-vDist * uFogD), 1.0); }`,
});
function tentacleGeo(count, segs, spread = 0.92) {
  const n = count * segs * 2;
  const aT = new Float32Array(n), aAng = new Float32Array(n), aR = new Float32Array(n), pos = new Float32Array(n * 3);
  let k = 0;
  for (let c = 0; c < count; c++) {
    const ang = (c / count) * Math.PI * 2 + rnd(-0.1, 0.1);
    const r = c % 5 === 0 ? 0.25 : spread * rnd(0.9, 1.0);   // a few oral arms from the centre
    const len = c % 5 === 0 ? 0.55 : rnd(0.7, 1.15);
    for (let s = 0; s < segs; s++) {
      for (const e of [s, s + 1]) { aT[k] = (e / segs) * len; aAng[k] = ang; aR[k] = r; k++; }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  g.setAttribute('aAng', new THREE.BufferAttribute(aAng, 1));
  g.setAttribute('aR', new THREE.BufferAttribute(aR, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
  return g;
}
export function jellyfish({ scale = 1, colA = 0x7fe8ff, colB = 0xff4fa8, rate = 0.55, len = 3 } = {}) {
  const g = new THREE.Group();
  const bm = jellyBellMat();
  bm.uniforms.uColA.value.set(colA); bm.uniforms.uColB.value.set(colB); bm.uniforms.uRate.value = rate; bm.uniforms.uPhase.value = Math.random();
  const bell = new THREE.Mesh(bellGeo, bm);
  const tm = tentacleMat();
  tm.uniforms.uColA.value.set(colA); tm.uniforms.uRate.value = rate; tm.uniforms.uPhase.value = bm.uniforms.uPhase.value; tm.uniforms.uLen.value = len;
  const tent = new THREE.LineSegments(tentacleGeo(30, 36), tm);
  bell.renderOrder = 7; tent.renderOrder = 7;
  g.add(tent, bell);
  g.scale.setScalar(scale);
  g.userData = { mats: [bm, tm], vel: rnd(0.04, 0.1), spin: rnd(-0.1, 0.1) };
  return g;
}

// ─── A school of silver scad ────────────────────────────────────────────
export function fishSchool(count = 280) {
  const base = new THREE.SphereGeometry(1, 14, 8);
  const p = base.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const taper = x < 0 ? 1 + x * 0.72 : 1 - x * x * 0.25;
    y *= 0.3 * taper; z *= 0.11 * taper;
    p.setXYZ(i, x, y, z);
  }
  base.computeVertexNormals();
  // Forked tail.
  const tail = new THREE.BufferGeometry();
  tail.setAttribute('position', new THREE.Float32BufferAttribute([-0.9, 0, 0, -1.35, 0.32, 0, -1.2, 0, 0, -0.9, 0, 0, -1.2, 0, 0, -1.35, -0.32, 0], 3));
  tail.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  tail.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(12).fill(0.5), 2));
  const geo = mergeSimple([base.toNonIndexed(), tail]);
  const mat = new THREE.MeshStandardMaterial({ color: 0xd9e4e8, metalness: 0.92, roughness: 0.26, side: THREE.DoubleSide, envMapIntensity: 1.6 });
  mat.name = 'fish';
  patchWater(mat, {
    extra(sh) {
      sh.uniforms.uFishT = { value: 0 };
      mat.userData.shader = sh;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uFishT;\nvarying float vFy;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          float ph = float(gl_InstanceID) * 1.618;
          float tailw = smoothstep(0.4, -1.3, position.x);
          transformed.z += sin(uFishT * 11.0 + ph - position.x * 3.2) * 0.2 * tailw;
          vFy = position.y;`);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vFy;')
        .replace('#include <map_fragment>', `#include <map_fragment>
          diffuseColor.rgb *= mix(vec3(0.16, 0.26, 0.3), vec3(1.0), smoothstep(0.12, -0.04, vFy));`);
    },
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  const fish = Array.from({ length: count }, () => ({ th: rnd(0, Math.PI * 2), dr: rnd(-1, 1) ** 3 * 1.6, dy: rnd(-1, 1) * 1.1, sp: rnd(0.85, 1.15), s: rnd(0.13, 0.19), wob: rnd(0, 10) }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  return {
    mesh, mat,
    update(t, center, R = 3.2) {
      if (mat.userData.shader) mat.userData.shader.uniforms.uFishT.value = t;
      for (let i = 0; i < count; i++) {
        const f = fish[i];
        const th = f.th + t * 0.3 * f.sp;
        const r = R + f.dr + Math.sin(t * 0.4 + f.wob) * 0.3;
        v.set(center.x + Math.cos(th) * r, center.y + f.dy + Math.sin(th * 2 + f.wob) * 0.35, center.z + Math.sin(th) * r * 0.75);
        // heading: tangent of the ellipse (counter-clockwise when seen from above)
        const tx = -Math.sin(th) * r, tz = Math.cos(th) * r * 0.75;
        e.set(0, Math.atan2(-tz, tx), Math.cos(th * 2 + f.wob) * 0.25);
        q.setFromEuler(e);
        sc.setScalar(f.s);
        m4.compose(v, q, sc);
        mesh.setMatrixAt(i, m4);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
function mergeSimple(geos) {
  const attrs = ['position', 'normal', 'uv'];
  const out = new THREE.BufferGeometry();
  for (const a of attrs) {
    const arrs = geos.map(g => g.attributes[a].array);
    const len = arrs.reduce((s, x) => s + x.length, 0);
    const buf = new Float32Array(len);
    let o = 0; for (const x of arrs) { buf.set(x, o); o += x.length; }
    out.setAttribute(a, new THREE.BufferAttribute(buf, geos[0].attributes[a].itemSize));
  }
  return out;
}

// ─── Hydrothermal vent: plume smoke, mineral sparks ─────────────────────
export function ventPlume({ top, count = 900 }) {
  const seed = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) seed[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('sd', new THREE.BufferAttribute(seed, 3));
  const common = {
    uT: { value: 0 }, uTop: { value: top.clone() }, uDpr: { value: 1 }, uAmt: { value: 1 },
  };
  const smoke = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    uniforms: { ...common },
    vertexShader: /* glsl */`
      attribute vec3 sd; uniform float uT, uDpr; uniform vec3 uTop;
      varying float vA; varying float vH;
      void main(){
        float ph = fract(uT * (0.05 + sd.x * 0.03) + sd.y);
        float h = ph * 7.0;
        float spread = 0.12 + h * 0.2;
        float ang = sd.z * 6.2831 + uT * 0.2 + h * 0.6;
        vec3 p = uTop + vec3(cos(ang) * spread * sd.x + sin(uT * 0.3 + h) * 0.25 * ph, h, sin(ang) * spread * sd.x);
        p.x += h * h * 0.02;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = smoothstep(0.0, 0.06, ph) * (1.0 - ph);
        vH = ph;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min((50.0 + h * 50.0) * uDpr / -mv.z, 180.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uAmt; varying float vA; varying float vH;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 col = mix(vec3(0.5, 0.2, 0.06), vec3(0.03, 0.028, 0.03), smoothstep(0.0, 0.35, vH));
        gl_FragColor = vec4(col, a * vA * 0.32 * uAmt);
      }`,
  });
  const sparks = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...common },
    vertexShader: /* glsl */`
      attribute vec3 sd; uniform float uT, uDpr; uniform vec3 uTop;
      varying float vA; varying float vH;
      void main(){
        float ph = fract(uT * (0.08 + sd.x * 0.1) + sd.y);
        float h = ph * (3.0 + sd.z * 4.0);
        float ang = sd.z * 40.0 + uT * (0.5 + sd.x);
        float r = (0.08 + h * 0.3) * sd.x;
        vec3 p = uTop + vec3(cos(ang) * r, h - 0.3, sin(ang) * r);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = smoothstep(0.0, 0.05, ph) * pow(1.0 - ph, 2.0) * (0.4 + 0.6 * sd.x);
        vH = ph;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min((1.5 + sd.z * 2.5) * uDpr * 6.0 / -mv.z, 20.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uAmt; varying float vA; varying float vH;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 col = mix(vec3(1.0, 0.72, 0.35), vec3(1.0, 0.3, 0.06), vH) * 2.4;
        gl_FragColor = vec4(col * a * vA * uAmt, 1.0);
      }`,
  });
  const a = new THREE.Points(geo, smoke), b = new THREE.Points(geo, sparks);
  a.frustumCulled = b.frustumCulled = false;
  a.renderOrder = 8; b.renderOrder = 9;
  return { smoke: a, sparks: b, mats: [smoke, sparks] };
}

// ─── Terrain: the abyssal shelf at the trench lip, the cliff, the hadal floor ─
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }

export function terrain({ shelfY, floorY, edgeZ, w = 110, d = 110, seg = 260 }) {
  const geo = new THREE.PlaneGeometry(w, d, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const heightAt = (x, z) => {
    const edge = edgeZ + (fbm(x * 0.08, 3.1) - 0.5) * 7 + Math.sin(x * 0.11) * 2;
    const t = smoothstepJS(edge - 5.5, edge + 4.5, z);
    const shelf = shelfY + (fbm(x * 0.12, z * 0.12) - 0.5) * 1.6 + (fbm(x * 0.5, z * 0.5, 3) - 0.5) * 0.35;
    const floor = floorY + (fbm(x * 0.05 + 7, z * 0.05) - 0.5) * 1.4 + Math.sin(x * 0.9 + z * 0.3) * 0.05;
    // Cliff face: rough, ledged.
    const ledges = (fbm(x * 0.35, z * 0.35 + 4) - 0.5) * 2.2 * Math.sin(t * Math.PI);
    return shelf + (floor - shelf) * t + ledges;
  };
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, heightAt(x, z));
  }
  geo.computeVertexNormals();
  const n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
    const slope = 1 - n.getY(i);
    const silt = smoothstepJS(0.35, 0.08, slope);
    const blot = fbm(x * 0.3, z * 0.3, 4);
    const deep = smoothstepJS(shelfY - 3, floorY + 2, y);
    // Hadal silt is pale diatom ooze; the shelf is darker basalt with sediment dusting.
    const sr = 0.30 + blot * 0.1, sg = 0.29 + blot * 0.09, sb = 0.26 + blot * 0.07;
    const rr = 0.07 + blot * 0.05, rg = 0.066 + blot * 0.045, rb = 0.063 + blot * 0.04;
    const k = silt * (0.55 + deep * 0.45);
    col[i * 3] = rr + (sr - rr) * k; col[i * 3 + 1] = rg + (sg - rg) * k; col[i * 3 + 2] = rb + (sb - rb) * k;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return { geo, heightAt };
}
export const smoothstepJS = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

// ─── Beacon 07 on the trench floor ──────────────────────────────────────
export function beacon() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x5b6266, metalness: 0.85, roughness: 0.42 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x15191b, metalness: 0.6, roughness: 0.5 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xff5a14, metalness: 0.0, roughness: 0.55 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0b2224, emissive: new THREE.Color(0x3fd6c9), emissiveIntensity: 0, roughness: 0.15, metalness: 0 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.95, 8), metal);
    leg.position.set(Math.cos(a) * 0.32, 0.42, Math.sin(a) * 0.32);
    leg.lookAt(0, 0.95, 0); leg.rotateX(Math.PI / 2);
    leg.castShadow = true;
    g.add(leg);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.03, 12), dark);
    foot.position.set(Math.cos(a) * 0.62, 0.015, Math.sin(a) * 0.62);
    g.add(foot);
  }
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 20), dark);
  body.position.y = 0.95; body.castShadow = true; g.add(body);
  const bands = new THREE.Mesh(new THREE.CylinderGeometry(0.104, 0.104, 0.05, 20), metal);
  bands.position.y = 0.72; g.add(bands);
  const b2 = bands.clone(); b2.position.y = 1.18; g.add(b2);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 20), glass);
  lamp.position.y = 1.33; g.add(lamp);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 20), metal);
  cap.position.y = 1.415; g.add(cap);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 6), metal);
  mast.position.y = 1.66; g.add(mast);
  const float = new THREE.Mesh(new THREE.SphereGeometry(0.2, 28, 18), orange);
  float.position.set(0, 2.1, 0); float.castShadow = true; g.add(float);
  const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 4), dark);
  tether.position.y = 1.9; g.add(tether);
  const light = new THREE.PointLight(0x5fe6da, 0, 7, 1.6);
  light.position.y = 1.33;
  for (const m of [metal, dark, orange]) patchWater(m, { caustics: false });
  return { group: g, glass, light, float };
}
