// scenes/demo.js: an 8 s demo that touches the OGL pieces most motion work needs, every one a pure
// function of `t`:
//   - full-screen shader backdrop (Triangle) with a warped-noise gradient
//   - a hero Torus with a fresnel rim, rotated by absolute angles
//   - 360 instanced boxes whose orbit, spin and size are computed in the vertex shader from uTime and a seeded
//     per-instance random vector (no per-frame JS work, no state)
//   - a camera move written as a formula (ease-in-out dolly plus a slow orbit)
//   - a 120 bpm beat pulse as exp(-fract(beat) * k), the beat lock used elsewhere in this repo
import { Camera, Transform, Program, Mesh, Geometry, Box, Torus, Triangle, Vec3 } from '../vendor/ogl/src/index.js';
import { mulberry32, easeInOut, hit } from '../src/util.js';

const BPM = 120, OFFSET = 0;
const N = 360;

const backdrop = {
  vertex: /* glsl */ `
    attribute vec2 position; attribute vec2 uv; varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`,
  fragment: /* glsl */ `
    precision highp float;
    uniform float uTime; uniform float uPulse; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
    void main() {
      vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
      vec2 q = p * 1.6 + vec2(0.0, uTime * 0.05);
      float w = fbm(q + 1.4 * vec2(fbm(q + uTime * 0.07), fbm(q - uTime * 0.05)));
      vec3 deep = vec3(0.012, 0.016, 0.045), glow = vec3(0.10, 0.20, 0.55);
      vec3 col = mix(deep, glow, smoothstep(0.25, 0.85, w) * (0.55 + 0.25 * uPulse));
      col *= 1.0 - 0.9 * dot(p, p);                       // vignette
      gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
    }`,
};

const lit = /* glsl */ `
  float fres(vec3 n, vec3 v) { return pow(1.0 - max(dot(n, v), 0.0), 3.0); }
  vec3 pal(float t) { return 0.5 + 0.5 * cos(6.2831853 * (vec3(1.0, 1.0, 1.0) * t + vec3(0.0, 0.33, 0.67))); }
`;

export default function setup({ gl, stage }) {
  const camera = new Camera(gl, { fov: 35, aspect: stage.w / stage.h, near: 0.1, far: 60 });
  const scene = new Transform();

  // backdrop: renderOrder -1, no depth, always drawn
  const bgProg = new Program(gl, { ...backdrop, depthTest: false, depthWrite: false, cullFace: false,
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uRes: { value: [stage.w, stage.h] } } });
  const bg = new Mesh(gl, { geometry: new Triangle(gl), program: bgProg });
  bg.renderOrder = -1; bg.frustumCulled = false; bg.setParent(scene);

  // hero torus
  const heroProg = new Program(gl, {
    vertex: /* glsl */ `
      attribute vec3 position; attribute vec3 normal;
      uniform mat4 modelViewMatrix, projectionMatrix; uniform mat3 normalMatrix;
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragment: /* glsl */ `
      precision highp float; uniform float uTime; uniform float uPulse; varying vec3 vN; varying vec3 vV;
      ${lit}
      void main() {
        vec3 n = normalize(vN), v = normalize(vV), l = normalize(vec3(0.5, 0.8, 0.6));
        float d = max(dot(n, l), 0.0), f = fres(n, v);
        vec3 base = pal(0.55 + 0.15 * dot(n, vec3(0.0, 1.0, 0.0)) + uTime * 0.02);
        vec3 col = base * (0.10 + 0.9 * d) + f * (0.6 + 0.8 * uPulse) * vec3(0.45, 0.75, 1.0);
        gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
      }`,
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 } },
  });
  const hero = new Mesh(gl, { geometry: new Torus(gl, { radius: 0.9, tube: 0.28, radialSegments: 96, tubularSegments: 48 }), program: heroProg });
  hero.setParent(scene);

  // instanced boxes. The per-instance random vector is seeded, so every run gets the same field.
  const rnd = mulberry32(20261026), data = new Float32Array(N * 4);
  for (let i = 0; i < data.length; i++) data[i] = rnd();
  const boxGeo = new Box(gl, { width: 1, height: 1, depth: 1 });
  boxGeo.addAttribute('aRand', { instanced: 1, size: 4, data });
  const boxProg = new Program(gl, {
    vertex: /* glsl */ `
      attribute vec3 position; attribute vec3 normal; attribute vec4 aRand;
      uniform mat4 modelViewMatrix, projectionMatrix, viewMatrix; uniform mat3 normalMatrix;
      uniform float uTime; uniform float uPulse;
      varying vec3 vN; varying float vR; varying float vDepth;
      mat3 rot(vec3 a, float t) { a = normalize(a); float c = cos(t), s = sin(t), k = 1.0 - c;
        return mat3(a.x*a.x*k + c, a.x*a.y*k + a.z*s, a.x*a.z*k - a.y*s,
                    a.x*a.y*k - a.z*s, a.y*a.y*k + c, a.y*a.z*k + a.x*s,
                    a.x*a.z*k + a.y*s, a.y*a.z*k - a.x*s, a.z*a.z*k + c); }
      void main() {
        float ang = aRand.x * 6.2831853 + uTime * (0.12 + 0.30 * aRand.y);
        float rad = 2.0 + aRand.z * 1.8;
        vec3 c = vec3(cos(ang) * rad, (aRand.w - 0.5) * 1.4 + sin(uTime * 0.9 + aRand.x * 20.0) * 0.12, sin(ang) * rad);
        float s = (0.045 + 0.075 * aRand.y) * (1.0 + 0.9 * uPulse * step(0.5, aRand.w));
        mat3 R = rot(vec3(aRand.y - 0.5, 1.0, aRand.z - 0.5), uTime * (0.6 + aRand.w) + aRand.x * 9.0);
        vec3 p = c + R * (position * s);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * (R * normal)); vR = aRand.x; vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragment: /* glsl */ `
      precision highp float; uniform float uPulse; varying vec3 vN; varying float vR; varying float vDepth;
      ${lit}
      void main() {
        vec3 n = normalize(vN); float d = max(dot(n, normalize(vec3(0.5, 0.8, 0.6))), 0.0);
        vec3 col = pal(vR * 0.6 + 0.05) * (0.18 + 0.95 * d) * (0.8 + 0.5 * uPulse);
        col = mix(col, vec3(0.012, 0.016, 0.045), smoothstep(5.0, 14.0, vDepth));   // depth fade into the backdrop
        gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
      }`,
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 } },
  });
  const boxes = new Mesh(gl, { geometry: boxGeo, program: boxProg });
  boxes.frustumCulled = false; boxes.setParent(scene);

  const dur = 8, target = new Vec3(0, 0, 0);

  return {
    dur,
    render(t) {
      const pulse = hit(t, BPM, OFFSET, 6);
      for (const p of [bgProg, heroProg, boxProg]) { p.uniforms.uTime.value = t; p.uniforms.uPulse.value = pulse; }

      // everything below is assigned absolutely from t (never `+=`)
      hero.rotation.x = t * 0.55; hero.rotation.y = t * 0.85; hero.rotation.z = Math.sin(t * 0.4) * 0.3;
      const s = 1 + 0.06 * pulse; hero.scale.set(s, s, s);

      const k = easeInOut(Math.min(1, t / dur));
      const dist = 10.5 - 4.6 * k, ang = 0.9 * Math.sin(t / dur * Math.PI) + k * 0.6;
      camera.position.set(Math.sin(ang) * dist, 1.6 - 0.9 * k, Math.cos(ang) * dist);
      camera.lookAt(target);

      stage.renderer.render({ scene, camera });
    },
  };
}

