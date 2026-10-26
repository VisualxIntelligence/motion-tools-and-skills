// scenes/post-demo.js: an 8 s neon scene that needs the post chain. Emissive values go well above 1.0 in linear
// HDR; PostChain blooms, tone maps and grades them. Every animated value, including the chain's params, is
// assigned from `t`. Installed by ../scripts/install.mjs; run it by setting scene: 'post-demo' in src/config.js.
import { Camera, Transform, Program, Mesh, Geometry, Box, Torus, Triangle, Vec3 } from '../vendor/ogl/src/index.js';
import { PostChain } from '../src/post/chain.js';
import { mulberry32, easeInOut, smoothstep, hit } from '../src/util.js';

export const stage = { msaa: false };   // the chain's FXAA does the antialiasing

const BPM = 120, OFFSET = 0, N = 420, DUR = 8;

const pal = /* glsl */ `vec3 pal(float t) { return 0.5 + 0.5 * cos(6.2831853 * (t + vec3(0.0, 0.33, 0.67))); }`;

export default function setup({ gl, stage }) {
  const camera = new Camera(gl, { fov: 35, aspect: stage.w / stage.h, near: 0.1, far: 60 });
  const scene = new Transform();
  const chain = new PostChain(gl, { width: stage.w, height: stage.h });

  // backdrop: dark gradient in linear light, drawn first with no depth
  const bgProg = new Program(gl, {
    vertex: /* glsl */ `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`,
    fragment: /* glsl */ `precision highp float; varying vec2 vUv; uniform float uPulse;
      void main() { vec2 p = vUv - 0.5; float v = 1.0 - 1.4 * dot(p, p);
        gl_FragColor = vec4(mix(vec3(0.0015, 0.002, 0.006), vec3(0.01, 0.018, 0.05), v) * (1.0 + 0.5 * uPulse), 1.0); }`,
    uniforms: { uPulse: { value: 0 } }, depthTest: false, depthWrite: false, cullFace: false,
  });
  const bg = new Mesh(gl, { geometry: new Triangle(gl), program: bgProg });
  bg.renderOrder = -1; bg.frustumCulled = false; bg.setParent(scene);

  // hero torus: dark glossy body, emissive rim well above 1.0
  const heroProg = new Program(gl, {
    vertex: /* glsl */ `attribute vec3 position; attribute vec3 normal; uniform mat4 modelViewMatrix, projectionMatrix; uniform mat3 normalMatrix;
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragment: /* glsl */ `precision highp float; uniform float uTime; uniform float uPulse; varying vec3 vN; varying vec3 vV; ${pal}
      void main() { vec3 n = normalize(vN), v = normalize(vV);
        float f = pow(1.0 - max(dot(n, v), 0.0), 2.5), d = max(dot(n, normalize(vec3(0.4, 0.9, 0.5))), 0.0);
        vec3 col = vec3(0.01, 0.012, 0.02) + 0.05 * d + f * pal(0.55 + 0.1 * sin(uTime * 0.5)) * (4.0 + 9.0 * uPulse);
        gl_FragColor = vec4(col, 1.0); }`,
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 } },
  });
  const hero = new Mesh(gl, { geometry: new Torus(gl, { radius: 0.9, tube: 0.26, radialSegments: 128, tubularSegments: 56 }), program: heroProg });
  hero.setParent(scene);

  // instanced emissive shards, seeded
  const rnd = mulberry32(777), data = new Float32Array(N * 4);
  for (let i = 0; i < data.length; i++) data[i] = rnd();
  const geo = new Box(gl, { width: 1, height: 1, depth: 1 });
  geo.addAttribute('aRand', { instanced: 1, size: 4, data });
  const shardProg = new Program(gl, {
    vertex: /* glsl */ `attribute vec3 position; attribute vec3 normal; attribute vec4 aRand;
      uniform mat4 modelViewMatrix, projectionMatrix; uniform float uTime; uniform float uPulse; varying float vR; varying float vGlow; varying float vDepth;
      mat3 rot(vec3 a, float t) { a = normalize(a); float c = cos(t), s = sin(t), k = 1.0 - c;
        return mat3(a.x*a.x*k + c, a.x*a.y*k + a.z*s, a.x*a.z*k - a.y*s, a.x*a.y*k - a.z*s, a.y*a.y*k + c, a.y*a.z*k + a.x*s, a.x*a.z*k + a.y*s, a.y*a.z*k - a.x*s, a.z*a.z*k + c); }
      void main() {
        float ang = aRand.x * 6.2831853 + uTime * (0.10 + 0.28 * aRand.y), rad = 2.1 + aRand.z * 1.9;
        vec3 c = vec3(cos(ang) * rad, (aRand.w - 0.5) * 1.5 + sin(uTime * 0.8 + aRand.x * 17.0) * 0.14, sin(ang) * rad);
        float hot = step(0.82, aRand.y);                                   // about one in five glows hard
        float s = (0.035 + 0.06 * aRand.z) * (1.0 + 0.8 * uPulse * hot);
        mat3 R = rot(vec3(aRand.y - 0.5, 1.0, aRand.z - 0.5), uTime * (0.5 + aRand.w) + aRand.x * 9.0);
        vec4 mv = modelViewMatrix * vec4(c + R * (position * s * vec3(1.0, 1.0, 2.6)), 1.0);
        vR = aRand.x; vGlow = hot; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragment: /* glsl */ `precision highp float; uniform float uPulse; varying float vR; varying float vGlow; varying float vDepth; ${pal}
      void main() { vec3 col = pal(vR * 0.5 + 0.55) * (0.12 + vGlow * (2.5 + 7.0 * uPulse));   // HDR: hot shards reach about 9.5
        col = mix(col, vec3(0.002, 0.003, 0.008), smoothstep(6.0, 16.0, vDepth));
        gl_FragColor = vec4(col, 1.0); }`,
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 } },
  });
  const shards = new Mesh(gl, { geometry: geo, program: shardProg });
  shards.frustumCulled = false; shards.setParent(scene);

  const target = new Vec3(0, 0, 0);

  return {
    dur: DUR,
    render(t, frame) {
      const pulse = hit(t, BPM, OFFSET, 6);
      for (const p of [bgProg, heroProg, shardProg]) { if (p.uniforms.uTime) p.uniforms.uTime.value = t; p.uniforms.uPulse.value = pulse; }

      hero.rotation.x = t * 0.5; hero.rotation.y = t * 0.8; hero.rotation.z = Math.sin(t * 0.4) * 0.3;
      const k = easeInOut(Math.min(1, t / DUR)), dist = 10.5 - 4.4 * k, ang = 0.9 * Math.sin(t / DUR * Math.PI) + 0.6 * k;
      camera.position.set(Math.sin(ang) * dist, 1.5 - 0.8 * k, Math.cos(ang) * dist);
      camera.lookAt(target);

      // the chain's params are a function of t as well
      const p = chain.params;
      p.exposure = smoothstep(0, 0.7, t) * (1 - smoothstep(DUR - 0.5, DUR, t));   // fade in from black and out at the end
      p.bloom = 0.4 + 0.25 * pulse;
      p.aberration = 0.012 + 0.03 * pulse;
      chain.render({ scene, camera, frame });
    },
  };
}
