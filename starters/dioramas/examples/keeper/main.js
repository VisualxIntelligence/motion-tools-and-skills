import { Engine, THREE, normalize, prepModel, damp, clamp, smooth, lerp, studioEnvironment } from '../../src/core/engine.js';
import { Assets } from '../../src/core/assets.js';
import { Pointer } from '../../src/core/input.js';
import { smoothScroll, gsap, reveal, ScrollTrigger } from '../../src/core/scroll.js';
import { preloader, cursor, magnetic, worldNav } from '../../src/core/ui.js';
import { PlanarReflection } from '../../src/core/reflector.js';
import { bakeTexture, fbmNormal } from '../../src/core/textures.js';
import { Waves, oceanGeometry, oceanMaterial } from './ocean.js';
import { createSky } from './sky.js';
import { BeamEffect } from './beams.js';
import { createRain, createSpray, createBolt, createFlare, lightUniforms } from './fx.js';
import { StormAudio } from './audio.js';

const DBG = new URLSearchParams(location.search);
const D2R = Math.PI / 180;
const MOBILE = matchMedia('(max-width: 900px)').matches;
const TOUCH = matchMedia('(pointer: coarse)').matches;

// ─── The rock and its light (model-space facts measured from the GLB) ─────────────
const LH_H = 14;                        // lighthouse model height in scene units (1 u ≈ 1.8 m)
const WATER_F = 0.12;                   // sea level as a fraction of model height (hides the diorama base)
const K = LH_H / 1.91;
const AXIS = new THREE.Vector2(-0.161 * K, -0.1905 * K);           // tower axis
const Y = f => f * LH_H - WATER_F * LH_H;                           // model height fraction → world y
const LAMP = new THREE.Vector3(AXIS.x, Y(0.887), AXIS.y);
const GLASS = { y0: Y(0.858), y1: Y(0.918), r: 0.083 * K };
const BEAM = { outer: 0.072, inner: 0.05, period: 14 };
const LAMP_COL = new THREE.Color('#ffd27a');

// ─── Engine ────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gl');
let beams;
const engine = new Engine({
  canvas, fov: 32, near: 0.3, far: 3600, dpr: MOBILE ? 1.5 : 1.5, background: 0x05080c,
  post: {
    ao: { aoRadius: 1.6, intensity: 2.2, distanceFalloff: 1.2 },
    bloom: { intensity: 1.05, luminanceThreshold: 0.42, luminanceSmoothing: 0.4, radius: 0.82 },
    pre: cam => [(beams = new BeamEffect(cam, { density: 0.05, range: 0.012, cone: [BEAM.outer, BEAM.inner] }))],
    tone: DBG.get('tone') ?? 'aces',
    vignette: { offset: 0.2, darkness: 0.72 },
    noise: 0.075,
    ca: 0.0012,
  },
});
const { scene, camera, renderer } = engine;
if (DBG.has('noao') && engine.post.ao) engine.post.ao.enabled = false;
scene.fog = new THREE.FogExp2(0x0a0e14, 0.008);
scene.environment = studioEnvironment(renderer, {
  top: 0x1c2230, bottom: 0x040506,
  panels: [
    { pos: [0, 7, -6], size: [10, 3], intensity: 1.4, color: 0x9fb2d8 },
    { pos: [-8, 2, 4], size: [3, 5], intensity: 1.0, color: 0xffd6a0 },
    { pos: [8, 2, 3], size: [3, 6], intensity: 0.8, color: 0xb8c6e8 },
  ],
});
scene.environmentIntensity = 0.18;

const assets = new Assets();
const pointer = new Pointer({ lambda: 8 });
const loaderEl = document.querySelector('.loader');
const loader = preloader({
  assets, el: loaderEl, minTime: 1600,
  onValue: v => {
    loaderEl.querySelector('.loader-pct').textContent = Math.round(v * 100) + '%';
    loaderEl.style.setProperty('--p', v.toFixed(3));
  },
});

// ─── Lights ────────────────────────────────────────────────────────────────────
const hemi = new THREE.HemisphereLight(0x2a3548, 0x05070a, 0.35);
scene.add(hemi);
// moon (storm) → sun (dawn): the only shadow-casting light
const key = new THREE.DirectionalLight(0x8aa0d0, 0.3);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -13, right: 13, top: 14, bottom: -8, near: 1, far: 90 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
key.target.position.set(AXIS.x, 4, AXIS.y);
scene.add(key, key.target);
// lightning
const bolt = new THREE.DirectionalLight(0xcad6ff, 0);
bolt.target.position.set(0, 0, 0);
scene.add(bolt, bolt.target);
// the lamp's own spill onto gallery and dome
const lampGlow = new THREE.PointLight(0xffc774, 0, 9, 1.4);
lampGlow.position.copy(LAMP);
scene.add(lampGlow);
// twin beam spots (light the boat, spray and rock when they pass)
const spots = [0, 1].map(() => {
  const s = new THREE.SpotLight(LAMP_COL, 0, 0, BEAM.outer * 1.1, 0.55, 0.6);
  s.position.copy(LAMP);
  scene.add(s, s.target);
  return s;
});
// flares
const flareLight = new THREE.PointLight(0xff3a24, 0, 70, 1.4);
scene.add(flareLight);
// the keeper's window
const hearth = new THREE.PointLight(0xffa04a, 0, 9, 1.6);
hearth.position.set(0.9, 3.4, 0.9);
scene.add(hearth);

// ─── Procedural textures ───────────────────────────────────────────────────────
const foamTex = bakeTexture(renderer, 1024, `
  void main(){
    float r = ridge(vUv * 6.0, 6.0, 6);
    float lace = smoothstep(0.64, 0.94, r);
    float blot = fbm(vUv * 5.0 + 3.1, 5.0, 5, 0.55) * 0.5 + 0.5;
    float streak = fbm(vec2(vUv.x * 3.0, vUv.y * 22.0), 22.0, 5, 0.5) * 0.5 + 0.5;
    float g = fbm(vUv * 9.0 + 7.3, 9.0, 4, 0.5) * 0.5 + 0.5;
    gl_FragColor = vec4(lace * smoothstep(0.35, 0.7, blot), streak, g, 1.0);
  }`);
const detailN = fbmNormal(renderer, { size: 1024, scale: 9, octaves: 6, strength: 2.4, ridged: true });

// ─── Ocean ─────────────────────────────────────────────────────────────────────
const waves = new Waves();
const reflection = new PlanarReflection(renderer, { resolution: 0.5 });
engine.onResize((w, h, dpr) => reflection.setSize(w, h, dpr));
const oceanMat = oceanMaterial({ waves, refl: reflection, foamTex, detailN });
const ocean = new THREE.Mesh(oceanGeometry(MOBILE ? { segs: 480, dr0: 0.18, grow: 0.02 } : {}), oceanMat);
ocean.frustumCulled = false;
scene.add(ocean);
reflection.hidden.push(ocean);
const OU = oceanMat.uniforms;
OU.uDebug.value = DBG.has('foam') ? +DBG.get('foam') || 1 : 0;
OU.uLamp.value.copy(LAMP);
OU.uBeamCos.value.set(Math.cos(BEAM.outer), Math.cos(BEAM.inner));

// ─── Sky ───────────────────────────────────────────────────────────────────────
const sky = createSky();
scene.add(sky.mesh);
const SU = sky.uniforms;

// ─── Weather ───────────────────────────────────────────────────────────────────
const LU = lightUniforms();
LU.uLamp.value.copy(LAMP);
LU.uBeamCos.value.set(Math.cos(BEAM.outer * 1.05), Math.cos(BEAM.inner));
const rain = createRain(LU, { count: MOBILE ? 22000 : 42000 });
scene.add(rain.mesh);
const spray = createSpray(LU);
scene.add(spray.points);
engine.onResize((w, h, dpr) => { spray.uniforms.uDpr.value = dpr; spray.uniforms.uH.value = h * dpr; });
const lightning = createBolt();
scene.add(lightning.mesh);
const redFlare = createFlare(0xff3322);
const greenFlare = createFlare(0x3dff8a);
scene.add(redFlare.sprite, greenFlare.sprite);
reflection.hidden.push(rain.mesh, spray.points);

// Harbour lights: Ardcarra, nine miles off, a smudge of sodium on the horizon.
const harbour = (() => {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  const lights = [];
  for (let i = 0; i < 11; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(1, 0.62, 0.3).multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const s = new THREE.Sprite(m);
    s.position.set((i - 5) * 6 + Math.sin(i * 7.1) * 3, 0.5 + Math.abs(Math.sin(i * 3.3)) * 1.1, Math.cos(i * 2.7) * 4);
    s.scale.setScalar(1.1 + Math.random() * 0.8);
    s.userData.seed = Math.random() * 10;
    g.add(s); lights.push(s);
  }
  scene.add(g);
  return { group: g, lights };
})();

// ─── Lighthouse ────────────────────────────────────────────────────────────────
const lhU = {
  uLampPow: { value: 0 }, uLampCol: { value: LAMP_COL.clone().multiplyScalar(1) },
  uAxis: { value: AXIS }, uGlass: { value: new THREE.Vector3(GLASS.y0, GLASS.y1, GLASS.r) },
  uB0: { value: new THREE.Vector2(1, 0) }, uB1: { value: new THREE.Vector2(-1, 0) }, uWet: { value: 1 },
};
function patchLighthouse(mat) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, lhU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vWp; uniform float uLampPow, uWet; uniform vec3 uLampCol, uGlass; uniform vec2 uAxis, uB0, uB1;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        float wet = (1.0 - smoothstep(0.1, 2.9, vWp.y)) * uWet;
        diffuseColor.rgb *= mix(1.0, 0.62, wet);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.32 + 0.04, wet);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          float band = smoothstep(uGlass.x, uGlass.x + 0.1, vWp.y) * (1.0 - smoothstep(uGlass.y - 0.1, uGlass.y, vWp.y));
          vec2 rel = vWp.xz - uAxis; float rad = length(rel);
          float inside = 1.0 - smoothstep(uGlass.z, uGlass.z + 0.14, rad);
          vec2 az = rel / max(rad, 1e-3);
          float face = pow(max(max(dot(az, uB0), dot(az, uB1)), 0.0), 10.0);
          float lum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
          totalEmissiveRadiance += uLampCol * band * inside * (0.5 + 9.0 * face) * (0.25 + smoothstep(0.03, 0.3, lum)) * uLampPow;
        }`);
  };
  mat.customProgramCacheKey = () => 'keeper-lh';
  mat.needsUpdate = true;
}
const lighthouse = new THREE.Group();
scene.add(lighthouse);

// Boulders around the waterline break the diorama's square footprint.
{
  const rockN = fbmNormal(renderer, { size: 512, scale: 5, octaves: 6, strength: 2.2, ridged: true });
  const mat = new THREE.MeshStandardMaterial({ color: 0x1b1917, roughness: 0.42, metalness: 0, normalMap: rockN, normalScale: new THREE.Vector2(1.4, 1.4), envMapIntensity: 0.8 });
  const base = new THREE.IcosahedronGeometry(1, 3);
  const p = base.attributes.position, v = new THREE.Vector3();
  const rnd = (i, k) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
  const geos = [0, 1, 2, 3].map(g => {
    const geo = base.clone(); const q = geo.attributes.position;
    for (let i = 0; i < q.count; i++) {
      v.fromBufferAttribute(q, i);
      const n = Math.sin(v.x * 3.1 + g) * Math.sin(v.y * 2.7 + g * 2) * Math.sin(v.z * 3.7 - g) * 0.22 + Math.sin(v.x * 7 + v.z * 5 + g) * 0.05;
      v.multiplyScalar(1 + n); v.y *= 0.62; if (v.y < -0.1) v.y *= 0.4;
      q.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  });
  const hx = 3.25, hz = 2.95, cx = 0.1, cz = -0.45;
  let i = 0;
  for (let side = 0; side < 4; side++) for (let k = 0; k < 6; k++, i++) {
    const u = (k + 0.5) / 6 * 2 - 1 + (rnd(i, 1) - 0.5) * 0.2;
    const out = 0.15 + rnd(i, 2) * 0.9;
    const [x, z] = side === 0 ? [cx + hx + out, cz + u * hz] : side === 1 ? [cx - hx - out, cz + u * hz] : side === 2 ? [cx + u * hx, cz + hz + out] : [cx + u * hx, cz - hz - out];
    const b = new THREE.Mesh(geos[i % 4], mat);
    const s = 0.45 + rnd(i, 3) * 0.95;
    b.scale.set(s * (1 + rnd(i, 4) * 0.6), s * (0.7 + rnd(i, 5) * 0.7), s * (1 + rnd(i, 6) * 0.5));
    b.position.set(x, -0.25 + rnd(i, 7) * 0.35 - s * 0.2, z);
    b.rotation.set(rnd(i, 8) * 0.5, rnd(i, 9) * 6.28, rnd(i, 10) * 0.4);
    b.castShadow = b.receiveShadow = true;
    lighthouse.add(b);
  }
}
const lhLoad = assets.gltf('models/keeper/lighthouse.glb').then(g => {
  const m = g.scene;
  normalize(m, LH_H, { axis: 'y' });
  m.position.y -= WATER_F * LH_H;
  prepModel(m, renderer, { env: 0.6, onMat: patchLighthouse });
  lighthouse.add(m);
});

// ─── The boat ──────────────────────────────────────────────────────────────────
const boat = {
  group: new THREE.Group(), inner: new THREE.Group(), ready: false,
  state: 'hidden', pos: new THREE.Vector2(30, 20), heading: 0, speed: 0, hold: 0, t: 0, fade: 0,
  pitch: 0, roll: 0, y: 0, wake: 0, lightsOn: 0, name: '', flareT: 0, saved: 0, found: false,
};
boat.group.rotation.order = 'YXZ';
boat.group.add(boat.inner);
scene.add(boat.group);
const navDot = (color, size) => {
  const m = new THREE.SpriteMaterial({ map: harbour.lights[0].material.map, color: new THREE.Color(color), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(m); s.scale.setScalar(size); s.userData.base = new THREE.Color(color); return s;
};
const boatLights = {
  mast: navDot(0xffffff, 0.2), port: navDot(0xff2a20, 0.17), star: navDot(0x20ff60, 0.17), cabin: navDot(0xffb050, 0.55),
};
boatLights.mast.position.set(0, 3.55, -0.35);
boatLights.port.position.set(0.62, 2.05, 0.9);
boatLights.star.position.set(-0.62, 2.05, 0.9);
boatLights.cabin.position.set(0, 1.9, 1.1);
for (const s of Object.values(boatLights)) boat.group.add(s);
const deckLight = new THREE.PointLight(0xffb866, 0, 9, 1.5);
deckLight.position.set(0, 3.2, -0.6);
boat.group.add(deckLight);
const boatLoad = assets.gltf('models/keeper/boat.glb').then(g => {
  const m = g.scene;
  normalize(m, 5.4, { axis: 'x' });
  prepModel(m, renderer, { env: 0.7 });
  m.rotation.y = Math.PI / 2;           // model bow is −X; the boat group sails along +Z
  boat.inner.add(m);
  boat.inner.position.y = -0.62;
  boat.ready = true;
});
boat.group.visible = false;
const NAMES = ['Kittiwake', 'Morven Lass', 'Silver Darling', 'Brothers’ Pride', 'Grace of Ness', 'Mary Tait', 'Northern Star', 'Endeavour II', 'Sula', 'Good Intent'];

// ─── Camera choreography ──────────────────────────────────────────────────────
// Positions are cylindrical around the tower (az° from +Z toward +X, radius, height); moves orbit, never cut.
const A = (x, y, z) => new THREE.Vector3(x, y, z);
const KF = [
  { id: 'hero', az: 30, r: 33, y: 3.1, look: A(AXIS.x, 5.2, AXIS.y), shift: [0.2, 0.035], fov: 32, storm: 1, dawn: 0, lamp: 1 },
  { id: 'storm', az: 62, r: 37, y: 5.2, look: A(-11, 3.4, 5), shift: [-0.02, 0.1], fov: 36, storm: 1, dawn: 0, lamp: 1 },
  { id: 'quarters', az: 16, r: 13.5, y: 4.3, look: A(0.8, 4.1, -0.6), shift: [0.2, 0.02], fov: 34, storm: 0.86, dawn: 0.04, lamp: 1 },
  { id: 'fog', az: 66, r: 13, y: 5.2, look: A(2.3, 4.4, -1.2), shift: [0.2, 0.02], fov: 34, storm: 0.76, dawn: 0.08, lamp: 1 },
  { id: 'watch', az: 30, r: 10.5, y: 9.7, look: A(AXIS.x, 9.6, AXIS.y), shift: [0.2, 0.0], fov: 34, storm: 0.64, dawn: 0.13, lamp: 1 },
  { id: 'lamp', az: 4, r: 10, y: 12.2, look: A(AXIS.x, 10.7, AXIS.y), shift: [0.2, -0.02], fov: 34, storm: 0.52, dawn: 0.2, lamp: 1 },
  { id: 'crossing', az: -38, r: 40, y: 1.9, look: A(AXIS.x - 2, 4.4, AXIS.y), shift: [0.12, 0.08], fov: 34, storm: 0.22, dawn: 0.5, lamp: 0.85 },
  { id: 'dawn', az: 122, r: 58, y: 3.6, look: A(AXIS.x, 5.2, AXIS.y), shift: [-0.02, -0.06], fov: 32, storm: 0.02, dawn: 1, lamp: 0 },
  { id: 'foot', az: 128, r: 78, y: 7, look: A(AXIS.x, 7, AXIS.y), shift: [0.26, 0.2], fov: 30, storm: 0, dawn: 1, lamp: 0 },
];
if (MOBILE) {
  // portrait framings: [radius, height, shift, look?]
  const portrait = {
    hero: [50, 2.8, [0, -0.13]], storm: [50, 8, [0, 0.03], A(AXIS.x - 4, 3, AXIS.y + 3)], quarters: [22, 5, [0, 0.2]], fog: [22, 5.5, [0, 0.2]],
    watch: [19, 10, [0, 0.18]], lamp: [18, 12, [0, 0.16]], crossing: [52, 2.2, [0, 0.08]], dawn: [60, 3.6, [0, -0.1]], foot: [100, 22, [0, 0.12]],
  };
  for (const k of KF) { const p = portrait[k.id]; k.r = p[0]; k.y = p[1]; k.shift = p[2]; if (p[3]) k.look = p[3]; k.fov = 42; }
}
const sectionEls = {
  hero: document.querySelector('.hero'), storm: document.querySelector('.storm'), rooms: document.querySelector('.rooms'),
  crossing: document.querySelector('.crossing'), dawn: document.querySelector('.dawn'), foot: document.querySelector('.foot'),
};
let stops = [];
function layoutStops() {
  const vh = innerHeight, top = el => el.getBoundingClientRect().top + scrollY;
  const st = top(sectionEls.storm), ro = top(sectionEls.rooms), cr = top(sectionEls.crossing), da = top(sectionEls.dawn), fo = top(sectionEls.foot);
  const maxY = document.documentElement.scrollHeight - vh;
  stops = [
    [0, 0], [vh * 0.1, 0],
    [st, 1], [st + sectionEls.storm.offsetHeight - vh * 1.2, 1],
    [ro + vh * 0.6, 2], [ro + vh * 1.15, 2],
    [ro + vh * 1.75, 3], [ro + vh * 2.3, 3],
    [ro + vh * 2.9, 4], [ro + vh * 3.45, 4],
    [ro + vh * 4.05, 5], [ro + vh * 4.6, 5],
    [cr + vh * 0.25, 6], [cr + vh * 1.2, 6],
    [da + vh * 0.35, 7], [da + sectionEls.dawn.offsetHeight - vh * 0.9, 7],
    [maxY, 8],
  ];
}
function storyAt(y) {
  if (y <= stops[0][0]) return 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const [y0, k0] = stops[i], [y1, k1] = stops[i + 1];
    if (y <= y1) return k0 === k1 ? k0 : lerp(k0, k1, smooth(0, 1, (y - y0) / Math.max(1, y1 - y0)));
  }
  return stops[stops.length - 1][1];
}
const camState = { az: 0, r: 0, y: 0, look: new THREE.Vector3(), sx: 0, sy: 0, fov: 32, storm: 1, dawn: 0, lamp: 1 };
function sampleKF(s, out) {
  const i = Math.min(KF.length - 2, Math.floor(s)), f = s - i;
  const a = KF[i], b = KF[i + 1];
  let daz = b.az - a.az;
  out.az = a.az + daz * f;
  out.r = lerp(a.r, b.r, f);
  out.y = lerp(a.y, b.y, f) + Math.sin(f * Math.PI) * (Math.abs(b.y - a.y) < 3 ? Math.min(a.r, b.r) * 0.06 : 0);
  out.look.lerpVectors(a.look, b.look, f);
  out.sx = lerp(a.shift[0], b.shift[0], f); out.sy = lerp(a.shift[1], b.shift[1], f);
  out.fov = lerp(a.fov, b.fov, f);
  out.storm = lerp(a.storm, b.storm, f); out.dawn = lerp(a.dawn, b.dawn, f); out.lamp = lerp(a.lamp, b.lamp, f);
  return out;
}
function camPosFrom(st, out) {
  return out.set(AXIS.x + Math.sin(st.az * D2R) * st.r, st.y, AXIS.y + Math.cos(st.az * D2R) * st.r);
}

// ─── Atmosphere: storm night → pink dawn ───────────────────────────────────────
const C = (r, g, b) => new THREE.Color(r, g, b);
const PAL = {
  zen: [C(0.0011, 0.0017, 0.0032), C(0.012, 0.017, 0.04), C(0.03, 0.036, 0.1)],
  hor: [C(0.0085, 0.012, 0.018), C(0.08, 0.065, 0.11), C(0.44, 0.19, 0.22)],
  cDark: [C(0.0009, 0.0013, 0.0021), C(0.022, 0.022, 0.04), C(0.06, 0.04, 0.075)],
  cLit: [C(0.017, 0.023, 0.035), C(0.1, 0.08, 0.13), C(0.62, 0.25, 0.26)],
  deep: [C(0.0006, 0.0018, 0.003), C(0.007, 0.01, 0.02), C(0.012, 0.014, 0.034)],
  sss: [C(0.02, 0.15, 0.11), C(0.04, 0.14, 0.13), C(0.1, 0.2, 0.19)],
  amb: [C(0.0035, 0.0055, 0.009), C(0.03, 0.03, 0.05), C(0.16, 0.11, 0.15)],
  hemiSky: [C(0.16, 0.2, 0.3), C(0.26, 0.26, 0.38), C(0.7, 0.55, 0.66)],
  hemiGround: [C(0.02, 0.025, 0.035), C(0.05, 0.05, 0.07), C(0.2, 0.12, 0.14)],
};
const ramp = (arr, t, out) => t < 0.5 ? out.copy(arr[0]).lerp(arr[1], t * 2) : out.copy(arr[1]).lerp(arr[2], (t - 0.5) * 2);
const tmpC = new THREE.Color();
const sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3();
function kfCamera(i, cam = new THREE.PerspectiveCamera()) {
  // the camera a keyframe describes, independent of where we are now
  const st = sampleKF(i, { look: new THREE.Vector3() });
  cam.fov = st.fov; cam.aspect = innerWidth / innerHeight; cam.near = 0.3; cam.far = 3000;
  camPosFrom(st, cam.position); cam.lookAt(st.look);
  cam.setViewOffset(innerWidth, innerHeight, -st.sx * innerWidth, st.sy * innerHeight, innerWidth, innerHeight);
  cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
}
function placeSky() {
  // the moon glows just right of the tower in the hero; the sun rises beside it at dawn
  const r = new THREE.Raycaster();
  r.setFromCamera(new THREE.Vector2(MOBILE ? 0.5 : 0.78, 0.62), kfCamera(0));
  moonDir.copy(r.ray.direction).setY(Math.max(r.ray.direction.y, 0.2)).normalize();
  r.setFromCamera(new THREE.Vector2(MOBILE ? -0.3 : -0.24, 0), kfCamera(7));
  sunDir.copy(r.ray.direction).setY(0).normalize().setY(0.014).normalize();
  SU.uMoonDir.value.copy(moonDir); OU.uMoonDir.value.copy(moonDir);
  SU.uSunDir.value.copy(sunDir); OU.uSunDir.value.copy(sunDir);
}
const sunColor = new THREE.Color(1.0, 0.52, 0.34);

function applyAtmosphere(storm, dawn, lampPow, t) {
  ramp(PAL.zen, dawn, SU.uZen.value); ramp(PAL.hor, dawn, SU.uHor.value);
  ramp(PAL.cDark, dawn, SU.uCloudDark.value); ramp(PAL.cLit, dawn, SU.uCloudLit.value);
  SU.uCover.value = lerp(0.56, 0.97, smooth(0, 1, storm * 0.9 + (1 - dawn) * 0.1));
  SU.uStorm.value = storm; SU.uDawn.value = dawn; SU.uTime.value = t;
  OU.uMoonCol.value.copy(SU.uMoonCol.value).multiplyScalar(1 - dawn);
  const sunI = smooth(0.35, 1, dawn);
  SU.uSunCol.value.copy(sunColor).multiplyScalar(1.6 * sunI * sunI);
  OU.uSunCol.value.copy(sunColor).multiplyScalar(1.8 * sunI * sunI);
  // sea
  OU.uSkyZen.value.copy(SU.uZen.value); OU.uSkyHor.value.copy(SU.uHor.value).lerp(SU.uCloudLit.value, 0.3);
  ramp(PAL.deep, dawn, OU.uDeep.value); ramp(PAL.sss, dawn, OU.uSSS.value); ramp(PAL.amb, dawn, OU.uAmb.value);
  OU.uStorm.value = storm; OU.uDawn.value = dawn; OU.uTime.value = t;
  OU.uReflAmt.value = lerp(0.9, 0.35, storm);
  waves.setStorm(DBG.has('calm') ? 0 : storm);
  // fog = horizon haze; rain thickens it
  const fogDen = lerp(0.0013, 0.0105, storm);
  scene.fog.density = fogDen;
  scene.fog.color.copy(SU.uHor.value).multiplyScalar(0.92);
  OU.uFogCol.value.copy(scene.fog.color); OU.uFogDen.value = fogDen;
  // lights
  ramp(PAL.hemiSky, dawn, hemi.color); ramp(PAL.hemiGround, dawn, hemi.groundColor);
  hemi.intensity = lerp(0.14, 0.6, dawn);
  scene.environmentIntensity = lerp(0.09, 0.32, dawn);
  const moonW = 1 - smooth(0.2, 0.7, dawn);
  key.color.set(0x8aa0d0).lerp(tmpC.copy(sunColor), 1 - moonW);
  key.intensity = lerp(0.75, 2.3, 1 - moonW) * (moonW > 0.5 ? 1 : smooth(0.2, 1, dawn) + 0.05);
  const kd = tmpV.copy(moonDir).lerp(sunDir, 1 - moonW).normalize();
  key.position.copy(key.target.position).addScaledVector(kd, 50);
  lhU.uWet.value = lerp(0.35, 1, storm);
  // rain
  const rainAmt = smooth(0.32, 0.8, storm);
  rain.uniforms.uAmount.value = rainAmt;
  rain.uniforms.uTime.value = t;
  LU.uAmb.value = lerp(0.075, 0.2, dawn) * (0.4 + rainAmt * 0.6);
  beams.uniforms.get('uRain').value = rainAmt;
  beams.uniforms.get('uDensity').value = lerp(0.006, 0.052, smooth(0.05, 0.85, storm));
  // harbour
  harbour.group.visible = camState.story < 2.4;
  for (const s of harbour.lights) s.material.opacity = (1 - smooth(0.3, 0.8, dawn)) * (0.55 + 0.25 * Math.sin(t * 2.1 + s.userData.seed * 3));
}
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpV3 = new THREE.Vector3();

// ─── Beam control: the cursor takes the light ──────────────────────────────────
const beam = { yaw: 0.6, pitch: -0.03, vel: (Math.PI * 2) / BEAM.period, control: 0, spin: 1, tYaw: 0, tPitch: -0.03, lastInput: -99, aimed: 0 };
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const beamDir = [new THREE.Vector3(), new THREE.Vector3()];
let interactive = true;
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
function aimAt(nx, ny) {
  ndc.set(nx, ny);
  ray.setFromCamera(ndc, camera);
  const o = ray.ray.origin, d = ray.ray.direction;
  let target;
  if (d.y < -0.004) {
    const t = -o.y / d.y;
    target = tmpV.copy(o).addScaledVector(d, t);
    // keep the aim point off the rock itself
    const hx = target.x - LAMP.x, hz = target.z - LAMP.z, hd = Math.hypot(hx, hz);
    if (hd < 9) { target.x = LAMP.x + hx / (hd || 1) * 9; target.z = LAMP.z + hz / (hd || 1) * 9; }
    target.y = 0.4;
  } else target = tmpV.copy(o).addScaledVector(d, 600);
  const dx = target.x - LAMP.x, dz = target.z - LAMP.z, dy = target.y - LAMP.y;
  beam.tYaw = Math.atan2(dx, dz);
  beam.tPitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.85, 0.14);
}
pointer.on('move', e => {
  if (!interactive || (e.pointerType === 'touch' && !pointer.down)) return;
  beam.lastInput = engine.time;
});
pointer.on('down', e => {
  if (!interactive || e.target.closest?.('a,button,.rates')) return;
  beam.lastInput = engine.time + (e.pointerType === 'touch' ? 2.0 : 0);
});
addEventListener('pointerleave', () => { beam.lastInput = -99; });
document.documentElement.addEventListener('mouseleave', () => { beam.lastInput = -99; });

function updateBeam(dt, t) {
  const hold = TOUCH ? 3.6 : 2.6;
  const want = interactive && t - beam.lastInput < hold ? 1 : 0;
  beam.control = damp(beam.control, want, want ? 7 : 1.6, dt);
  if (want) {
    aimAt(pointer.x, pointer.y);
    // magnetic aim: near the boat, the beam settles on her
    if (boat.state === 'lost' && boat.fade > 0.6 && boat.screen) {
      const d = Math.hypot(boat.screen[0] - pointer.px, boat.screen[1] - pointer.py);
      if (d < (TOUCH ? 90 : 70)) {
        const dx = boat.pos.x - LAMP.x, dz = boat.pos.y - LAMP.z, dy = boat.y + 1.2 - LAMP.y;
        beam.tYaw = Math.atan2(dx, dz);
        beam.tPitch = Math.atan2(dy, Math.hypot(dx, dz));
      }
    }
    // take whichever of the twin beams is nearer the cursor
    const d0 = angDiff(beam.yaw, beam.tYaw), d1 = angDiff(beam.yaw + Math.PI, beam.tYaw);
    const d = Math.abs(d0) < Math.abs(d1) ? d0 : d1;
    const step = d * (1 - Math.exp(-7 * dt));
    beam.yaw += step;
    beam.vel = step / Math.max(dt, 1e-4);
    beam.pitch = damp(beam.pitch, Math.abs(d0) < Math.abs(d1) ? beam.tPitch : beam.tPitch, 6, dt);
    beam.aimed += dt;
    if (beam.aimed > 1.2) document.body.classList.add('has-aimed');
  } else {
    // hand the lamp back to its clockwork: ease back up to the rotation period
    beam.vel = damp(beam.vel, (Math.PI * 2) / BEAM.period, 1.1, dt);
    beam.yaw += beam.vel * dt;
    beam.pitch = damp(beam.pitch, -0.028, 1.2, dt);
  }
  if (beam.freeze != null) { beam.yaw = beam.freeze; beam.vel = 0; }
  for (let i = 0; i < 2; i++) {
    const y = beam.yaw + i * Math.PI;
    beamDir[i].set(Math.sin(y) * Math.cos(beam.pitch), Math.sin(beam.pitch), Math.cos(y) * Math.cos(beam.pitch)).normalize();
    spots[i].target.position.copy(LAMP).addScaledVector(beamDir[i], 50);
  }
}

// ─── The boat game ─────────────────────────────────────────────────────────────
const markEl = document.querySelector('.boat-mark');
const markFill = markEl.querySelector('.bm-fill');
const markLabel = markEl.querySelector('.bm-label');
const tallyEl = document.querySelector('.tally');
const tallyN = document.querySelector('.tally-n');
const tallyLog = document.querySelector('.tally-log');
const toastEl = document.querySelector('.toast');
let toastTimer;
function toast(html, ms = 3200) {
  toastEl.innerHTML = html; toastEl.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms);
}
const harbourPos = new THREE.Vector3();
const stormCam = new THREE.PerspectiveCamera();
// boats always spawn inside the storm keyframe's frame
const stormCamera = () => kfCamera(1, stormCam);
function placeHarbour() {
  const cam = stormCamera();
  ray.setFromCamera(ndc.set(MOBILE ? -0.7 : -0.86, 0), cam);
  const d = ray.ray.direction.clone().setY(0).normalize();
  harbourPos.copy(cam.position).addScaledVector(d, 520).setY(0);
  harbour.group.position.copy(harbourPos);
  harbour.group.lookAt(cam.position.x, 0, cam.position.z);
}
let spawnIdx = 0;
const SPAWNS = MOBILE ? [[-0.25, -0.3], [0.3, -0.25], [-0.1, -0.4], [0.2, -0.18]] : [[-0.2, -0.42], [0.08, -0.5], [-0.34, -0.3], [0.2, -0.34], [-0.05, -0.32]];
function spawnBoat() {
  const cam = stormCamera();
  for (let tries = 0; tries < 8; tries++) {
    const s = SPAWNS[(spawnIdx + tries) % SPAWNS.length];
    ray.setFromCamera(ndc.set(s[0] + (Math.random() - 0.5) * 0.1, s[1] + (Math.random() - 0.5) * 0.06), cam);
    const o = ray.ray.origin, d = ray.ray.direction;
    if (d.y > -0.01) continue;
    const p = o.clone().addScaledVector(d, -o.y / d.y);
    const r = Math.hypot(p.x - AXIS.x, p.z - AXIS.y);
    if (r < 18 || r > 70) continue;
    boat.pos.set(p.x, p.z);
    break;
  }
  spawnIdx++;
  boat.heading = Math.random() * Math.PI * 2;
  boat.state = 'lost'; boat.hold = 0; boat.t = 0; boat.fade = 0; boat.speed = 0.12; boat.wake = 0; boat.lightsOn = 0;
  boat.flareT = 1.4; boat.name = NAMES[boat.saved % NAMES.length];
  boat.group.visible = true;
  boat.pending = false;
}
function guideBoat() {
  boat.state = 'guided'; boat.t = 0;
  boat.saved++;
  const now = logTime();
  tallyN.textContent = boat.saved;
  tallyEl.classList.remove('bump'); void tallyEl.offsetWidth; tallyEl.classList.add('bump');
  const li = document.createElement('li');
  li.innerHTML = `<b>${now}</b>${boat.name} — guided home`;
  tallyLog.prepend(li);
  while (tallyLog.children.length > 4) tallyLog.lastElementChild.remove();
  toast(`<b>Boats guided home: ${boat.saved}</b>The <i>${boat.name}</i> has seen the light and is making for Ardcarra.`);
  greenFlare.fire(tmpV.set(boat.pos.x, 2.5, boat.pos.y), wind2);
  audio.horn();
  gsap.fromTo(beamFlash, { v: 1 }, { v: 0, duration: 1.4, ease: 'power2.out' });
}
const beamFlash = { v: 0 };
const wind2 = new THREE.Vector2(0.94, 0.34);
const boatCentre = new THREE.Vector3();
let _ferry = null;
function ferryPath() {
  if (_ferry) return _ferry;
  const st = sampleKF(6, { look: new THREE.Vector3() });
  const cam = camPosFrom(st, new THREE.Vector3());
  const fwd = st.look.clone().sub(cam).setY(0).normalize();
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const start = cam.clone().addScaledVector(fwd, 15).addScaledVector(right, MOBILE ? 1.2 : 4.2).setY(0);
  const end = cam.clone().addScaledVector(fwd, 34).addScaledVector(right, MOBILE ? 0 : 0.8).setY(0);
  return (_ferry = { start, end });
}
addEventListener('resize', () => { _ferry = null; });
function updateBoat(dt, t, story) {
  if (!boat.ready) return;
  const gameOn = story < 1.9;
  const ferry = story >= 5.4;
  if (ferry) {
    // The Morag Ann on her scheduled crossing: scroll drives her in toward the landing.
    const f = clamp((story - 5.4) / 1.4);
    boat.state = 'ferry';
    const { start, end } = ferryPath();
    const p = tmpV.lerpVectors(start, end, f);
    boat.pos.set(p.x, p.z);
    boat.heading = Math.atan2(end.x - start.x, end.z - start.z);
    boat.speed = 3; boat.wake = damp(boat.wake, 1, 2, dt); boat.lightsOn = damp(boat.lightsOn, 1 - smooth(0.6, 1, camState.dawn), 2, dt);
    boat.fade = damp(boat.fade, story < 7.6 ? 1 : 0, 2, dt);
    boat.group.visible = boat.fade > 0.01;
  } else if (gameOn) {
    if (boat.state === 'ferry' || (boat.state === 'hidden' && !boat.pending)) spawnBoat();
    boat.t += dt;
    if (boat.state === 'lost') {
      boat.fade = damp(boat.fade, story > 0.45 ? 1 : 0, 1.5, dt);
      boat.heading += Math.sin(t * 0.3 + boat.saved) * dt * 0.12;
      const drift = story > 0.4 ? 1 : 0;   // she only drifts once you can see her
      boat.pos.x += (wind2.x * 0.1 + Math.sin(boat.heading) * boat.speed) * dt * drift;
      boat.pos.y += (wind2.y * 0.1 + Math.cos(boat.heading) * boat.speed) * dt * drift;
      // is a beam on her?
      boatCentre.set(boat.pos.x, 1.4, boat.pos.y);
      const dir = tmpV2.copy(boatCentre).sub(LAMP).normalize();
      const on = Math.max(dir.dot(beamDir[0]), dir.dot(beamDir[1])) > Math.cos(BEAM.outer * 1.25) && story < 1.7 && boat.fade > 0.6;
      boat.hold = clamp(boat.hold + (on ? dt : -dt * 0.8), 0, 2);
      boat.found ||= on;
      if (boat.hold >= 2) guideBoat();
      boat.flareT -= dt;
      if (boat.flareT <= 0 && story > 0.55 && story < 1.75) { redFlare.fire(tmpV.set(boat.pos.x, 2.4, boat.pos.y), wind2); boat.flareT = 9 + Math.random() * 3; }
    } else if (boat.state === 'guided') {
      const want = Math.atan2(harbourPos.x - boat.pos.x, harbourPos.z - boat.pos.y);
      boat.heading += angDiff(boat.heading, want) * (1 - Math.exp(-2.2 * dt));
      boat.speed = damp(boat.speed, boat.t < 1.2 ? 0.6 : 5.2, 0.5, dt);
      boat.wake = damp(boat.wake, 1, 1.2, dt);
      boat.lightsOn = damp(boat.lightsOn, 1, 3, dt);
      boat.pos.x += Math.sin(boat.heading) * boat.speed * dt;
      boat.pos.y += Math.cos(boat.heading) * boat.speed * dt;
      if (boat.t > 9) boat.fade = damp(boat.fade, 0, 1.2, dt);
      if (boat.t > 12.5) { boat.state = 'hidden'; boat.pending = true; boat.group.visible = false; setTimeout(() => { boat.pending = false; }, 1800); }
    }
  } else if (boat.state !== 'hidden') {
    boat.state = 'hidden'; boat.group.visible = false;
  }
  if (!boat.group.visible) { OU.uBoat.value.w = 0; return; }
  // ride the swell: sample bow, stern and both beams
  const h = boat.heading, fx = Math.sin(h), fz = Math.cos(h), px = Math.cos(h), pz = -Math.sin(h);
  const x = boat.pos.x, z = boat.pos.y;
  const hb = waves.height(x + fx * 2.3, z + fz * 2.3), hs = waves.height(x - fx * 2.3, z - fz * 2.3);
  const hp = waves.height(x + px * 0.95, z + pz * 0.95), hst = waves.height(x - px * 0.95, z - pz * 0.95);
  boat.y = damp(boat.y, (hb + hs + hp + hst) * 0.25, 6, dt);
  boat.pitch = damp(boat.pitch, Math.atan2(hb - hs, 4.6) * 0.9, 5, dt);
  boat.roll = damp(boat.roll, Math.atan2(hp - hst, 1.9) * 0.55 + Math.sin(t * 1.3) * 0.03 * waves.storm, 4, dt);
  const sink = (1 - boat.fade) * 4.5;
  boat.inner.visible = boat.fade > 0.03;
  boat.group.position.set(x, boat.y - sink, z);
  boat.group.rotation.set(-boat.pitch, h, boat.roll);
  OU.uBoat.value.set(x, z, h, boat.fade);
  OU.uWake.value = boat.wake;
  const lost = boat.state === 'lost';
  const blink = lost ? (Math.sin(t * 6) > 0 ? 1 : 0.25) : 1;
  boatLights.mast.material.color.copy(boatLights.mast.userData.base).multiplyScalar(2.2 * boat.fade * blink);
  boatLights.port.material.color.copy(boatLights.port.userData.base).multiplyScalar(2.6 * boat.fade);
  boatLights.star.material.color.copy(boatLights.star.userData.base).multiplyScalar(2.6 * boat.fade);
  const cab = lost ? 0.35 * (0.7 + 0.3 * Math.sin(t * 13) * Math.sin(t * 5.3)) : boat.lightsOn;
  boatLights.cabin.material.color.copy(boatLights.cabin.userData.base).multiplyScalar(1.6 * boat.fade * cab);
  deckLight.intensity = (14 * boat.lightsOn + (lost ? 2.5 : 0)) * boat.fade;
}

// ─── Lightning ─────────────────────────────────────────────────────────────────
const flashEl = document.querySelector('.flash');
const flash = { v: 0 };
let nextStrike = 3.5;
const boltTop = new THREE.Vector3(), boltBot = new THREE.Vector3();
function strike(power = 1) {
  // pick a spot the camera can see, far out over the sea
  const nx = (Math.random() * 2 - 1) * 0.85;
  ray.setFromCamera(ndc.set(nx, 0.05), camera);
  const d = ray.ray.direction.clone().setY(0).normalize();
  const dist = 260 + Math.random() * 260;
  boltBot.copy(camera.position).addScaledVector(d, dist).setY(0);
  boltTop.copy(boltBot).add(tmpV.set((Math.random() - 0.5) * 80, 150 + Math.random() * 40, (Math.random() - 0.5) * 80));
  lightning.build(boltTop, boltBot);
  SU.uFlashDir.value.copy(boltTop).lerp(boltBot, 0.35).sub(camera.position).normalize();
  const toBolt = tmpV.copy(boltTop).sub(tmpV2.set(0, 0, 0)).normalize();
  OU.uFlashDir.value.copy(toBolt);
  bolt.position.copy(toBolt).multiplyScalar(60);
  flashEl.style.setProperty('--fx', ((nx + 1) * 50).toFixed(0) + '%');
  const p = Math.min(1, power * (0.75 + Math.random() * 0.5));
  // short strobes: the frame is only hot for a frame or two, then an afterglow that stays well below white
  gsap.killTweensOf(flash);
  gsap.timeline()
    .set(flash, { v: p })
    .to(flash, { v: 0.08 * p, duration: 0.035, ease: 'power2.in' })
    .to(flash, { v: 0.55 * p, duration: 0.025 })
    .to(flash, { v: 0.12 * p, duration: 0.09 })
    .to(flash, { v: 0.42 * p, duration: 0.03, delay: 0.06 })
    .to(flash, { v: 0, duration: 0.42, ease: 'power3.out' });
  audio.thunder(dist / 180, p);
}

// ─── HUD: conditions log, rooms, route ─────────────────────────────────────────
const logEls = Object.fromEntries([...document.querySelectorAll('[data-log]')].map(e => [e.dataset.log, e]));
let lastLog = '';
function logTime() {
  const s = camState.story ?? 0;
  const mins = 2 * 60 + 47 + s * 26 + (engine.time / 60);
  const hh = Math.floor(mins / 60) % 24, mm = Math.floor(mins % 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
function updateLog(storm) {
  const i = storm > 0.88 ? 0 : storm > 0.7 ? 1 : storm > 0.5 ? 2 : storm > 0.25 ? 3 : 4;
  const wind = ['SW 9, severe gale', 'SW 8, gale', 'W 6, strong breeze', 'W 4, moderate', 'W 2, light air'][i];
  const sea = ['Very high', 'High', 'Rough', 'Moderate', 'Smooth'][i];
  const vis = ['0.4 NM, heavy rain', '1 NM, rain', '4 NM, showers', '10 NM, clearing', 'Excellent'][i];
  const time = logTime();
  const key = time + i;
  if (key === lastLog) return;
  lastLog = key;
  logEls.time.textContent = time; logEls.wind.textContent = wind; logEls.sea.textContent = sea; logEls.vis.textContent = vis;
}
const rooms = [...document.querySelectorAll('.room')];
const pins = [...document.querySelectorAll('.pin')];
const roomIdx = [...document.querySelectorAll('.room-index li')];
const PIN_AT = [A(0.7, 3.9, -0.02), A(2.35, 4.6, -1.3), A(AXIS.x, 9.62, AXIS.y + 1.08), A(AXIS.x, 10.72, AXIS.y + 0.66)];
let activeRoom = -1;
function setRoom(i) {
  if (i === activeRoom) return;
  const prev = rooms[activeRoom];
  activeRoom = i;
  rooms.forEach(r => { if (r !== prev) { gsap.killTweensOf(r); gsap.set(r, { autoAlpha: 0 }); } });
  if (prev) { gsap.killTweensOf(prev); gsap.to(prev, { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' }); }
  const cur = rooms[i];
  if (cur) {
    gsap.fromTo(cur, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: prev ? 0.28 : 0 });
    gsap.fromTo(cur.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'expo.out', delay: prev ? 0.28 : 0 });
  }
  roomIdx.forEach((li, k) => li.classList.toggle('on', k === i));
}
const routeEl = document.querySelector('.route');
const navLinks = [...document.querySelectorAll('.links a')];

const ratesEl = document.querySelector('.rates');
document.querySelector('.rates-toggle').addEventListener('click', e => {
  const open = ratesEl.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', open);
  e.currentTarget.firstChild.textContent = open ? 'Close ' : 'All rooms ';
});

// ─── Audio ─────────────────────────────────────────────────────────────────────
const audio = new StormAudio();
const soundBtn = document.querySelector('.sound');
soundBtn.addEventListener('click', () => {
  const on = audio.toggle();
  soundBtn.setAttribute('aria-pressed', on);
  soundBtn.querySelector('.sound-label').textContent = on ? 'Sound on' : 'Sound off';
});

// ─── Frame loop ────────────────────────────────────────────────────────────────
let story = 0, storySm = 0;
const camPos = new THREE.Vector3();
const glareV = new THREE.Vector3();
let sprayT = 0;
const rockEdge = new THREE.Vector3();
const cursorApi = cursor({ color: '#ffe2a6', blend: 'normal', size: 30 });
let cursorLabel = '';

engine.onTick((dt, t) => {
  pointer.update(dt);
  story = storyAt(scrollY);
  storySm = damp(storySm, story, 4.5, dt);
  sampleKF(storySm, camState);
  camState.story = storySm;
  interactive = storySm < 1.75;
  document.body.classList.toggle('is-past-hero', storySm > 0.5);
  document.body.classList.toggle('is-foot', storySm > 7.7);

  // camera: orbit + slow sea-swell drift + a little parallax from the pointer
  camPosFrom(camState, camPos);
  const sway = camState.storm;
  camPos.x += Math.sin(t * 0.21) * 0.25 * sway + pointer.sx * 0.5;
  camPos.y += Math.sin(t * 0.33) * 0.18 * sway + pointer.sy * 0.25;
  camera.position.copy(camPos);
  camera.lookAt(tmpV.copy(camState.look).add(tmpV2.set(pointer.sx * 0.35, pointer.sy * 0.2, 0)));
  camera.rotateZ(Math.sin(t * 0.27) * 0.004 * sway);
  camera.fov = camState.fov;
  const W = innerWidth, H = innerHeight;
  camera.setViewOffset(W, H, -camState.sx * W, camState.sy * H, W, H);
  camera.updateMatrixWorld();
  sky.mesh.position.copy(camera.position);

  // weather and light
  const storm = camState.storm, dawn = camState.dawn;
  waves.time = t;
  applyAtmosphere(storm, dawn, camState.lamp, t);
  updateBeam(dt, t);
  const lampPow = camState.lamp * intro.lamp;
  const bcol = tmpC.copy(LAMP_COL);
  const glareDot = Math.max(beamDir[0].dot(glareV.copy(camera.position).sub(LAMP).normalize()), beamDir[1].dot(glareV));
  const glare = smooth(Math.cos(0.17), Math.cos(0.015), glareDot) * lampPow;
  const bu = beams.uniforms;
  bu.get('uLamp').value.copy(LAMP);
  bu.get('uDir0').value.copy(beamDir[0]); bu.get('uDir1').value.copy(beamDir[1]);
  const lock = boat.state === 'lost' ? boat.hold / 2 : 0;   // the beam gathers itself as you hold it on her
  bu.get('uCol').value.copy(bcol).multiplyScalar(lampPow * (26 + beamFlash.v * 30 + lock * 12));
  bu.get('uHalo').value.copy(bcol).multiplyScalar(lampPow * (0.018 + glare * 0.1) * (0.4 + storm * 0.6));
  bu.get('uGlare').value.copy(bcol).multiplyScalar(glare * glare * 1.1);
  bu.get('uWind').value.set(wind2.x * 1.4, -0.9, wind2.y * 1.4);
  OU.uBeamDir.value[0].copy(beamDir[0]); OU.uBeamDir.value[1].copy(beamDir[1]);
  OU.uBeamCol.value.copy(bcol).multiplyScalar(lampPow * 26 * (1 + beamFlash.v));
  OU.uGlintCol.value.copy(bcol).multiplyScalar(lampPow * (0.009 + glare * 0.3));
  LU.uBeamDir.value[0].copy(beamDir[0]); LU.uBeamDir.value[1].copy(beamDir[1]);
  LU.uBeamI.value = lampPow * 1.3;
  SU.uBeamDir.value[0].copy(beamDir[0]); SU.uBeamDir.value[1].copy(beamDir[1]);
  SU.uBeamGlow.value.copy(bcol).multiplyScalar(lampPow * 0.05 * storm);
  lhU.uLampPow.value = lampPow * (1 + glare * 2);
  lhU.uB0.value.set(beamDir[0].x, beamDir[0].z).normalize(); lhU.uB1.value.set(beamDir[1].x, beamDir[1].z).normalize();
  for (const s of spots) s.intensity = lampPow * 70;
  lampGlow.intensity = lampPow * 9;
  hearth.intensity = 5 * (1 - smooth(0.4, 1, dawn)) * intro.lamp;
  engine.post.bloom.luminanceMaterial.threshold = lerp(0.42, 0.75, dawn);

  // lightning
  if (storm > 0.62 && t > nextStrike && intro.done && !DBG.has('nolit')) { strike(storm); nextStrike = t + 5 + Math.random() * 8; }
  const f = flash.v;
  // soft exposure cap for everything the flash floods; only the bolt itself uses the raw value
  const fg = f / (1 + f * 1.1);
  SU.uFlash.value = fg * 1.1; OU.uFlash.value = fg * 1.1; LU.uFlash.value = fg * 0.45;
  bolt.intensity = fg * fg * 9;
  lightning.mesh.visible = f > 0.06;
  lightning.uniforms.uI.value = f;
  flashEl.style.opacity = (fg * 0.1).toFixed(3);
  engine.post.bloom.intensity = lerp(1.0, 0.45, dawn) + glare * 0.35 + fg * 0.1;

  // flares
  if (storySm > 2.2) { redFlare.state.t = -1; greenFlare.state.t = -1; }
  redFlare.update(dt, wind2); greenFlare.update(dt, wind2);
  const fl = redFlare.state.power > greenFlare.state.power ? redFlare : greenFlare;
  flareLight.color.copy(fl.color);
  flareLight.position.copy(fl.state.p);
  flareLight.intensity = fl.state.power * 18;
  const flareCol = tmpC.copy(fl.color).multiplyScalar(fl.state.power * 2.2);
  OU.uFlarePos.value.copy(fl.state.p); OU.uFlareCol.value.copy(flareCol);
  LU.uFlarePos.value.copy(fl.state.p); LU.uFlareCol.value.copy(flareCol).multiplyScalar(0.4);

  // rain follows the camera; wind gusts
  const gust = 1 + Math.sin(t * 0.7) * 0.25 + Math.sin(t * 1.9) * 0.1;
  rain.uniforms.uCam.value.copy(camera.position);
  rain.uniforms.uVel.value.set(wind2.x * 13 * gust * storm + 1, -30, wind2.y * 13 * gust * storm);

  // surf bursting on the rock
  sprayT -= dt;
  if (sprayT <= 0 && storm > 0.15) {
    sprayT = lerp(1.6, 0.35, storm) * (0.5 + Math.random());
    const side = Math.floor(Math.random() * 4);
    const u = Math.random() * 2 - 1;
    const hx = 3.3, hz = 3.0, cx = 0.1, cz = -0.45;
    const [x, z, nx, nz] = side === 0 ? [cx + hx, cz + u * hz, 1, 0] : side === 1 ? [cx - hx, cz + u * hz, -1, 0] : side === 2 ? [cx + u * hx, cz + hz, 0, 1] : [cx + u * hx, cz - hz, 0, -1];
    rockEdge.set(x + nx * 0.6, waves.height(x + nx, z + nz) - 0.2, z + nz * 0.6);
    spray.burst(rockEdge, nx, nz, Math.round(lerp(40, 280, storm)), lerp(0.4, 1.15, storm));
  }
  spray.update(dt, wind2);

  // the boat
  updateBoat(dt, t, storySm);

  // boat marker
  if (boat.group.visible && (boat.state === 'lost' || (boat.state === 'guided' && boat.t < 3.2)) && storySm < 1.7) {
    tmpV.set(boat.pos.x, boat.y + 1.6, boat.pos.y).project(camera);
    const on = tmpV.z < 1 && Math.abs(tmpV.x) < 1.05 && Math.abs(tmpV.y) < 1.05;
    boat.screen = on ? [(tmpV.x * 0.5 + 0.5) * W, (-tmpV.y * 0.5 + 0.5) * H] : null;
    markEl.classList.toggle('on', on && boat.fade > 0.5 && (storySm > 0.35 || boat.found));
    const sx = (tmpV.x * 0.5 + 0.5) * W, sy = (-tmpV.y * 0.5 + 0.5) * H;
    markEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
    const p = boat.state === 'guided' ? 1 : boat.hold / 2;
    markFill.style.strokeDashoffset = (188.5 * (1 - p)).toFixed(1);
    markEl.classList.toggle('hold', boat.state === 'lost' && boat.hold > 0.02);
    markEl.classList.toggle('home', boat.state === 'guided');
    const label = boat.state === 'guided' ? `${boat.name} — heading home` : boat.hold > 0.02 ? `Hold the light · ${(2 - boat.hold).toFixed(1)}s` : 'Boat in distress';
    if (label !== markLabel.textContent) markLabel.textContent = label;
    const over = on && Math.hypot(sx - pointer.px, sy - pointer.py) < 60;
    const cl = over && boat.state === 'lost' ? 'hold' : '';
    if (cursorApi && cl !== cursorLabel) { cursorLabel = cl; cursorApi.set(cl ? 'drag' : '', cl ? 'Hold' : ''); }
  } else markEl.classList.remove('on');

  // rooms: cards + pins
  const ri = storySm > 1.62 && storySm < 5.45 ? clamp(Math.round(storySm - 2), 0, 3) : -1;
  setRoom(ri);
  pins.forEach((pin, k) => {
    const on = k === ri && Math.abs(storySm - (k + 2)) < 0.3;
    pin.classList.toggle('on', on);
    if (Math.abs(storySm - (k + 2)) < 0.8) {
      tmpV.copy(PIN_AT[k]).project(camera);
      pin.style.transform = `translate3d(${((tmpV.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-tmpV.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
    }
  });
  routeEl.style.setProperty('--rp', clamp((storySm - 5.4) / 1.3).toFixed(3));
  const sec = storySm < 0.5 ? -1 : storySm < 1.6 ? 0 : storySm < 5.5 ? 1 : storySm < 6.5 ? 2 : 3;
  navLinks.forEach((a, k) => a.classList.toggle('on', k === sec));
  updateLog(storm);
  audio.setStorm(storm);

  // planar reflection only matters once the sea has calmed enough to hold an image
  reflection.enabled = !DBG.has('norefl');
  if (reflection.enabled) reflection.update(scene, camera);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const intro = { lamp: 0, done: false };
worldNav('keeper', { theme: 'dark', corner: 'bl' });
magnetic();
const lenis = smoothScroll({ lerp: 0.08 });
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  const el = id === '#top' ? 0 : document.querySelector(id);
  if (el === null) return;
  e.preventDefault();
  let y = el === 0 ? 0 : el.getBoundingClientRect().top + scrollY;
  if (id === '#reserve' || id === '#dawn') y = stops.find(s => s[1] === 7)?.[0] ?? y;
  if (id === '#storm') y = stops.find(s => s[1] === 1)?.[0] ?? y;
  lenis.scrollTo(y, { duration: 2.2 });
}));
layoutStops();
addEventListener('resize', () => { layoutStops(); placeHarbour(); placeSky(); });
reveal('.storm h2, .crossing h2, .dawn h2, .rooms-head h2, .foot-title', { type: 'lines', stagger: 0.1 });
// each chapter's copy lifts away as the next scene takes the frame
for (const [sec, inner] of [['.hero', '.hero-inner'], ['.storm', '.storm-sticky'], ['.rooms', '.rooms-sticky'], ['.crossing', '.crossing-sticky'], ['.dawn', '.dawn-sticky']]) {
  gsap.fromTo(inner, { opacity: 1, y: 0 }, { opacity: 0, y: -50, ease: 'none', immediateRender: false,
    scrollTrigger: { trigger: sec, start: 'bottom 98%', end: 'bottom 45%', scrub: true } });
}
reveal('.storm .lede, .crossing .lede, .dawn .lede', { type: 'lines', stagger: 0.05, y: '100%' });

await Promise.all([lhLoad, boatLoad]);
placeHarbour();
placeSky();
spawnBoat();
// Compile every program up front with every light on, so nothing hitches later.
intro.lamp = 1; flash.v = 1; boat.group.visible = true;
sampleKF(0, camState);
camPosFrom(camState, camera.position); camera.lookAt(camState.look);
applyAtmosphere(1, 0, 1, 0);
renderer.compile(scene, camera);
flash.v = 0; intro.lamp = 0;
engine.start();
await loader.finish();

// Intro: darkness, the lamp stutters on, then the storm shows itself.
gsap.timeline({ delay: 0.15 })
  .to(intro, { lamp: 0.6, duration: 0.05 })
  .to(intro, { lamp: 0.05, duration: 0.08, delay: 0.06 })
  .to(intro, { lamp: 0.85, duration: 0.05, delay: 0.16 })
  .to(intro, { lamp: 0.25, duration: 0.07, delay: 0.05 })
  .to(intro, { lamp: 1, duration: 0.9, ease: 'power2.out', delay: 0.1 })
  .add(() => { intro.done = true; if (!DBG.has('nolit')) strike(1.1); nextStrike = engine.time + 6; }, '-=0.3');
gsap.from('.title span', { yPercent: 60, opacity: 0, duration: 2, ease: 'expo.out', stagger: 0.14, delay: 0.5 });
gsap.from('.hero .eyebrow, .hero-foot, .nav', { opacity: 0, y: 16, duration: 1.4, ease: 'power3.out', stagger: 0.08, delay: 1.1 });
setTimeout(() => document.body.classList.add('is-ready'), 1700);

if (DBG.has('s')) { const s = +DBG.get('s'); const y = (() => { for (const [yy, k] of stops) if (k >= s) return yy; return 0; })(); lenis.scrollTo(y, { immediate: true }); }
window.__keeperReady = true;
window.__keeper = {
  scene, camera, THREE,
  boatScreen() {
    const v = new THREE.Vector3(boat.pos.x, boat.y + 1.2, boat.pos.y).project(camera);
    return [v.x * 0.5 + 0.5, -v.y * 0.5 + 0.5];
  }, boat, beam, strike, guideBoat, spawnBoat, camState, stops, waves, ocean, OU, SU, engine, flash };
