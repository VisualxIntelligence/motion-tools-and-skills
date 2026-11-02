import { Engine, THREE, normalize, prepModel, damp, clamp, smooth, lerp, studioEnvironment } from '../../src/core/engine.js';
import { Assets } from '../../src/core/assets.js';
import { Pointer } from '../../src/core/input.js';
import { smoothScroll, gsap, reveal } from '../../src/core/scroll.js';
import { preloader, cursor, magnetic, worldNav } from '../../src/core/ui.js';
import { FloodBeamEffect } from './beams.js';
import { fbmNormal, fbmTexture } from '../../src/core/textures.js';
import { AbyssEffect, waterSurface, waterDome, patchWater, waterUniforms } from './ocean.js';
import { marineSnow, spawner, jellyfish, fishSchool, ventPlume, terrain, beacon, floodUniforms } from './life.js';
import { odometer, tempAt, pressureAt, lightAt, fmtLight, fmtTime, zoneAt, LOG } from './hud.js';

const DBG = new URLSearchParams(location.search);
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const MOBILE = matchMedia('(max-width: 900px)').matches;

// ─── The water column ─────────────────────────────────────────────────────────
// World y is linear in "station" s (one station per section); the gauge maps s to real depth.
const STEP = 14, Y0 = -4;
const descY = s => Y0 - STEP * clamp(s, 0, 5);
const SHELF_Y = -62.6, FLOOR_Y = -76.6, EDGE_Z = -1.4;
const DKEYS = [[0, 0], [0.5, 30], [1, 110], [1.5, 200], [2, 600], [2.5, 1000], [3, 2400], [3.5, 4000], [4, 4970], [4.5, 6000], [5, 10935]];
function depthAt(s) {
  if (s <= 0) return 0;
  for (let i = 1; i < DKEYS.length; i++) if (s <= DKEYS[i][0]) {
    const [a, da] = DKEYS[i - 1], [b, db] = DKEYS[i];
    return da + (db - da) * (s - a) / (b - a);
  }
  return 10935;
}
const WATER = [[0, 0x2aa5b4], [50, 0x178aa3], [140, 0x0e6190], [240, 0x0a3f73], [450, 0x06214b], [700, 0x030d24], [1000, 0x01040b], [1800, 0x000103], [11000, 0x000000]]
  .map(([d, c]) => [d, new THREE.Color(c)]);
const waterCol = new THREE.Color();
function waterAt(d, out) {
  for (let i = 1; i < WATER.length; i++) if (d <= WATER[i][0]) {
    const [a, ca] = WATER[i - 1], [b, cb] = WATER[i];
    return out.copy(ca).lerp(cb, (d - a) / (b - a));
  }
  return out.set(0, 0, 0);
}

// Camera + submersible choreography. x/z are world, y is relative to descY(s).
const D = Math.PI / 180;
const STATIONS = [
  { sub: [1.35, 0, 0], yaw: -2.5, cam: [-1.4, -1.7, 8.2], look: [0.05, 0.9, 0] },            // 0 hero
  { sub: [2.4, 0.9, -3.2], yaw: -2.95, cam: [-1.0, 0.2, 8.6], look: [1.3, -0.1, 0.6] },        // 1 sunlight · nautilus
  { sub: [1.6, 0, -0.5], yaw: -2.85, cam: [-1.6, 0.8, 9.2], look: [-0.4, 0, 0] },              // 2 twilight · jellies
  { sub: [0.9, -1.4, 2.0], yaw: 0.62, cam: [3.0, 1.2, 12.4], look: [0.6, -0.1, -0.6] },        // 3 midnight · angler
  { sub: [-1.5, -0.3, -0.6], yaw: 2.75, cam: [-7.6, 0.3, 8.8], look: [-3.3, -0.9, -2.8] },     // 4 abyss · vent
  { sub: [1.4, -1.28, 5.0], yaw: 0.25, cam: [-2.6, -0.9, 13.2], look: [1.2, -1.9, 3.0] },      // 5 hadal · landing
  { sub: [1.4, -1.28, 5.0], yaw: 0.25, orbit: true, look: [1.4, -1.3, 5.0] },                 // 6 pelagia
  { sub: [1.4, -1.28, 5.0], yaw: 0.25, cam: [-4.5, 5.2, 15.5], look: [-2.2, -1.8, 3.4] },      // 7 book
  { sub: [1.4, -1.28, 5.0], yaw: 0.25, cam: [6.0, 1.4, 14.0], look: [-4.6, -1.4, 2.6] },       // 8 crew
  { sub: [1.4, -1.28, 5.0], yaw: 0.25, cam: [-5.5, 0.2, 17.0], look: [-2.6, -0.2, 2.0] },      // 9 surface · beams point home
];
if (MOBILE) for (const st of STATIONS) { if (st.cam) { st.cam = [st.cam[0] * 1.1, st.cam[1], st.cam[2] * 1.3]; } }
// Phones: lens-shift the frame so subjects sit in the upper half, above the copy.
const LENS = MOBILE ? [0.13, 0.2] : [0, 0];
function applyLens(cam, w, h, ly = LENS[1]) { if (LENS[0] || LENS[1]) cam.setViewOffset(w, h, w * LENS[0], h * ly, w, h); }
let lensY = -1;

// ─── Engine ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gl');
let vol, fx;
const engine = new Engine({
  canvas, fov: 40, near: 0.08, far: 260, dpr: 1.5, background: 0x2aa5b4,
  post: {
    ao: { aoRadius: 1.3, intensity: 1.9, distanceFalloff: 1.0 },
    bloom: { intensity: 1.0, luminanceThreshold: 0.62, luminanceSmoothing: 0.32, radius: 0.82 },
    pre: cam => {
      vol = new FloodBeamEffect(cam, { density: 0.032, noise: 0.55, noiseScale: 0.7, maxDist: 36, floorY: -1000, wind: V3(0.02, 0.06, 0.01) });
      fx = new AbyssEffect(cam);
      return [...(DBG.has('novol') ? [] : [vol]), ...(DBG.has('nofx') ? [] : [fx])];
    },
    tone: DBG.get('tone') ?? 'aces',
    vignette: { offset: 0.22, darkness: 0.72 },
    noise: 0.055,
    ca: false,
  },
});
const { scene, camera, renderer } = engine;
const bloomLum = engine.post?.bloom?.luminanceMaterial ?? null;
engine.onResize((w, h) => applyLens(camera, w, h));
scene.background = new THREE.Color(0x2aa5b4);
scene.fog = DBG.has('nofog') ? null : new THREE.FogExp2(0x2aa5b4, 0.028);
const envShallow = studioEnvironment(renderer, {
  top: 0x6fd9e4, bottom: 0x03141d,
  panels: [{ pos: [0, 10, 0], size: [16, 16], intensity: 5, color: 0xe4fdff }, { pos: [-9, 3, 5], size: [5, 5], intensity: 0.7, color: 0x3fb8d0 }, { pos: [8, 1, -6], size: [3, 8], intensity: 0.5, color: 0x1f7fa8 }],
});
const envDeep = studioEnvironment(renderer, {
  top: 0x1d4f9a, bottom: 0x010308,
  panels: [{ pos: [0, 10, 0], size: [16, 16], intensity: 2.2, color: 0x5d8fff }],
});
const envFlood = studioEnvironment(renderer, {
  top: 0x05070a, bottom: 0x000000,
  panels: [{ pos: [0, 7, 6], size: [3, 1.2], intensity: 1.2, color: 0xe6f3ff }, { pos: [-6, 4, -2], size: [1.2, 4], intensity: 0.4, color: 0xbfe9ff }],
});
scene.environment = envShallow;

const hemi = new THREE.HemisphereLight(0x9ae9f0, 0x06283a, 1.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff8ea, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 40 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const assets = new Assets();
const pointer = new Pointer({ lambda: 6 });

// ─── Loader ─────────────────────────────────────────────────────────────────
const loaderEl = document.querySelector('.loader');
const pctEl = loaderEl.querySelector('.scope-pct em');
const checks = [...loaderEl.querySelectorAll('.checks li')];
const loader = preloader({
  assets, el: loaderEl, minTime: 1600,
  onValue: v => {
    pctEl.textContent = String(Math.round(v * 100)).padStart(3, '0');
    for (const li of checks) if (v >= +li.dataset.at && !li.classList.contains('ok')) { li.classList.add('ok'); li.querySelector('b').textContent = 'OK'; }
  },
});

// ─── Surface, snow, plankton ───────────────────────────────────────────────
const surface = waterSurface();
scene.add(surface);
const dome = waterDome();
scene.add(dome);
const domeTop = new THREE.Color(), domeBot = new THREE.Color();
const snow = marineSnow({ count: MOBILE ? 3500 : 7500, box: 30 });
scene.add(snow.points);
const silt = marineSnow({ count: 1800, fixed: { center: [1.5, FLOOR_Y + 2.2, 3.5], size: [26, 4.4, 20] }, size: 1.3, color: new THREE.Color(0.7, 0.66, 0.6) });
scene.add(silt.points);
silt.mat.uniforms.uFloodMul.value = 0.45;
const plankton = spawner(5000);
scene.add(plankton.points);
engine.onResize((w, h, dpr) => {
  for (const m of [snow.mat, silt.mat, plankton.mat]) m.uniforms.uDpr.value = dpr;
});

// ─── Terrain ────────────────────────────────────────────────────────────────
const ground = terrain({ shelfY: SHELF_Y, floorY: FLOOR_Y, edgeZ: EDGE_Z - 8, w: 120, d: 120, seg: MOBILE ? 180 : 280 });
const groundN = fbmNormal(renderer, { size: 1024, scale: 8, octaves: 7, strength: 2.2 });
const groundD = fbmTexture(renderer, { size: 512, scale: 6, octaves: 6, contrast: 1.6 });
const groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0, envMapIntensity: 0.3 });
groundMat.name = 'ground';
// Triplanar rock/silt: world-space projections so the cliff face never stretches.
patchWater(groundMat, {
  caustics: false,
  extra(sh) {
    sh.uniforms.uRockN = { value: groundN };
    sh.uniforms.uRockD = { value: groundD };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uRockN, uRockD;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec3 tpN0 = normalize((vec4(normalize(vNormal), 0.0) * viewMatrix).xyz);
        vec3 tpB = pow(abs(tpN0), vec3(4.0)); tpB /= dot(tpB, vec3(1.0));
        float det = texture2D(uRockD, vCW.zy * 0.11).r * tpB.x + texture2D(uRockD, vCW.xz * 0.11).r * tpB.y + texture2D(uRockD, vCW.xy * 0.11).r * tpB.z;
        float det2 = texture2D(uRockD, vCW.xz * 0.9).r;
        diffuseColor.rgb *= (0.55 + det * 0.9) * (0.85 + det2 * 0.3);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          vec3 wN = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          vec3 bw = pow(abs(wN), vec3(4.0)); bw /= dot(bw, vec3(1.0));
          float sc = 0.42;
          vec3 nx = texture2D(uRockN, vCW.zy * sc).xyz * 2.0 - 1.0;
          vec3 ny = texture2D(uRockN, vCW.xz * sc).xyz * 2.0 - 1.0;
          vec3 nz = texture2D(uRockN, vCW.xy * sc).xyz * 2.0 - 1.0;
          nx = vec3(nx.xy + wN.zy, abs(nx.z) * wN.x);
          ny = vec3(ny.xy + wN.xz, abs(ny.z) * wN.y);
          nz = vec3(nz.xy + wN.xy, abs(nz.z) * wN.z);
          vec3 wn = normalize(nx.zyx * bw.x + ny.xzy * bw.y + nz.xyz * bw.z);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`);
  },
});
const groundMesh = new THREE.Mesh(ground.geo, groundMat);
groundMesh.position.set(0, 0, 8);
groundMesh.receiveShadow = true;
scene.add(groundMesh);
const heightAt = (x, z) => ground.heightAt(x, z - 8);

// ─── Submersible ────────────────────────────────────────────────────────────
const SUB_L = 3.4;
const sub = new THREE.Group();
scene.add(sub);
const subInner = new THREE.Group();
sub.add(subInner);
let subScale = 1, subModel = null, anglerModel = null;
const toWorld = (model, raw, out) => (model ? model.localToWorld(out.copy(raw)) : out.copy(raw));
const floodCol = new THREE.Color(0xe8f4ff);
const lampGlow = { value: new THREE.Color(0, 0, 0) };
const FLOOD_LOCAL = [V3(0.68, 0.33, -0.23), V3(0.68, 0.37, 0), V3(0.68, 0.33, 0.23)];
const floods = FLOOD_LOCAL.map((p, i) => {
  const L = new THREE.SpotLight(floodCol, 0, 34, 0.2, 0.24, 1.2);
  L.castShadow = i === 1 && !DBG.has('noshadow');
  L.shadow.mapSize.set(1024, 1024);
  L.shadow.camera.near = 0.3; L.shadow.camera.far = 30;
  L.shadow.bias = -0.0002; L.shadow.normalBias = 0.02;
  scene.add(L, L.target);
  return L;
});
for (const L of floods) vol.add(L, { scale: 0.012, range: 0.05, softness: 0.16 });
const floodState = { power: 0, target: 0, on: false };
const lampHalos = floods.map(() => { const h = makeGlowSprite(0xeaf6ff, 0.34); scene.add(h); return h; });
const strobe = new THREE.PointLight(0xffffff, 0, 5, 2);
scene.add(strobe);
const strobeDot = makeGlowSprite(0xffffff, 0.22);
scene.add(strobeDot);
const fill = new THREE.DirectionalLight(0x3b6a9e, 0);
scene.add(fill, fill.target);

const subLoad = assets.gltf('models/abyssal/sub.glb').then(g => {
  const m = g.scene;
  normalize(m, SUB_L, { ground: false });
  subScale = m.scale.x;
  prepModel(m, renderer, {
    env: 1.1,
    onMat: mat => {
      mat.name = 'sub';
      patchWater(mat, { caustics: !DBG.has("nocaus"), glow: DBG.has("noglow") ? [] : [
        // object-space (quantized) coordinates: model = obj * 0.9462 + offset
        { center: V3(0.595, 0.357, -0.233), radius: 0.17, color: lampGlow, lum: 0.5 },
        { center: V3(0.595, 0.357, 0.233), radius: 0.17, color: lampGlow, lum: 0.5 },
      ] });
    },
  });
  subInner.add(m);
  subModel = m;
});

// ─── Creatures ──────────────────────────────────────────────────────────────
const nautilus = new THREE.Group();
scene.add(nautilus);
const NAUT_BASE = V3(1.6, descY(1) - 0.35, 2.4);
const nautLoad = assets.gltf('models/abyssal/nautilus.glb').then(g => {
  const m = g.scene;
  normalize(m, 1.25, { ground: false });
  prepModel(m, renderer, { env: 1.0, onMat: mat => { mat.name = 'naut'; patchWater(mat); } });
  nautilus.add(m);
});

const school = fishSchool(MOBILE ? 160 : 300);
scene.add(school.mesh);
const SCHOOL_C = V3(5.5, descY(0.75), -10);

// Placed in screen space from the twilight camera (x, y in 0..1, distance), so the card and gauge stay clear.
const JELLIES = [
  { at: [0.47, 0.24, 13], s: 0.55, a: 0x74e4ff, b: 0xff4f9a },
  { at: [0.73, 0.2, 15], s: 0.42, a: 0x8f9cff, b: 0x3fffd8 },
  { at: [0.57, 0.8, 7.5], s: 0.3, a: 0x7fe8ff, b: 0xff6ab0, light: true },
  { at: [0.69, 0.68, 10], s: 0.46, a: 0x5fd8ff, b: 0xff4f7a, light: true },
  { at: [0.63, 0.3, 27], s: 0.8, a: 0x6fa8ff, b: 0x40ffe0 },
  { at: [0.62, 0.06, 11], s: 0.26, a: 0x9ff2ff, b: 0xff7ac0 },
  { at: [0.42, 0.7, 12], s: 0.4, a: 0x74e4ff, b: 0xb06bff },
  { at: [0.68, 0.97, 14], s: 0.36, a: 0x8fe0ff, b: 0xff4f9a },
  { at: [0.54, -0.3, 13], s: 0.5, a: 0x6fd0ff, b: 0x3fffd8 },
  { at: [0.36, -0.1, 20], s: 0.34, a: 0x9ff2ff, b: 0xff7ac0 },
  { at: [0.84, 0.88, 18], s: 0.3, a: 0x74e4ff, b: 0x40ffe0 },
];
const jellies = JELLIES.map(j => {
  const g = jellyfish({ scale: j.s, colA: j.a, colB: j.b, rate: rnd(0.4, 0.62), len: rnd(2.4, 3.6) });
  g.userData.base = V3(0, descY(2), 0);
  g.userData.at = j.at;
  g.userData.off = rnd(0, 20);
  // Lights live in the scene root and never toggle visibility: a changing light count recompiles every material.
  if (j.light) { const l = new THREE.PointLight(j.a, 0, 5, 1.8); scene.add(l); g.userData.light = l; }
  scene.add(g);
  return g;
});

const angler = new THREE.Group();
const anglerInner = new THREE.Group();
angler.add(anglerInner);
scene.add(angler);
const ANGLER_BASE = V3(3.3, descY(3) + 0.5, -0.6);   // re-placed from screen space at boot
angler.position.copy(ANGLER_BASE);
const lureCol = { value: new THREE.Color(0, 0, 0) };
const LURE_RAW = V3(0.007, 0.478, 0.919);   // model space
const LURE_OBJ = V3(0.008, 0.501, 0.966);   // quantized object space
const lureLight = new THREE.PointLight(0x7fe9ff, 0, 6, 2);
scene.add(lureLight);
const lureHalo = makeGlowSprite(0x8ff0ff, 0.9);
scene.add(lureHalo);
let anglerScale = 1;
const angLoad = assets.gltf('models/abyssal/angler.glb').then(g => {
  const m = g.scene;
  normalize(m, 3.6, { ground: false });
  anglerScale = m.scale.x;
  prepModel(m, renderer, { env: 0.8, onMat: mat => { mat.name = 'angler'; patchWater(mat, { caustics: false, glow: [{ center: LURE_OBJ, radius: 0.07, color: lureCol, inner: 0.2 }] }); } });
  anglerInner.add(m);
  anglerModel = m;
});
const lureWorld = V3();
const anglerState = { yaw: 0, lit: 0, look: 0, focus: 0 };
// She rides with the camera between these stations (screen-locked, distance shrinking), static outside them.
const RIDE = [2.72, 3.82];
const anglerEntry = V3(), anglerExit = V3(), idleFocus = V3();
const rideCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
function rideSpot(s) {
  const k = smooth(RIDE[0], 3.25, s);
  // After the zone's centre she lets you pass: drifts up and out through the top of the frame, clear of the gauge.
  const up = smooth(3.45, RIDE[1], s);
  return MOBILE ? [0.52, lerp(0.27, 0.02, up), lerp(13, 10, k)] : [lerp(lerp(0.66, 0.6, smooth(RIDE[0], 3.4, s)), 0.54, up), lerp(0.46, 0.08, up), lerp(10.5, 7.4, k)];
}
function rideAt(s, out) {
  // rig is already solved for this frame; use it without the pointer parallax so she keeps some depth.
  rideCam.fov = camera.fov; rideCam.aspect = camera.aspect;
  rideCam.updateProjectionMatrix(); applyLens(rideCam, innerWidth, innerHeight, MOBILE ? lensY : undefined);
  rideCam.position.copy(rig.cam); rideCam.lookAt(rig.look); rideCam.updateMatrixWorld();
  const [sx, sy, dist] = rideSpot(s);
  const dir = tmp.c.set(sx * 2 - 1, 1 - sy * 2, 0.5).unproject(rideCam).sub(rideCam.position).normalize();
  return out.copy(rideCam.position).addScaledVector(dir, dist);
}

// Vent on the trench lip.
const vent = new THREE.Group();
scene.add(vent);
const VENT_XZ = [-2.3, -5.6];
const ventGlow = { value: new THREE.Color(0, 0, 0) };
const ventTop = V3();
let plume;
const ventLights = [new THREE.PointLight(0xff6a1e, 0, 11, 1.6), new THREE.PointLight(0xff8a3a, 0, 6, 1.8)];
for (const l of ventLights) scene.add(l);
const ventLoad = assets.gltf('models/abyssal/vent.glb').then(g => {
  const m = g.scene;
  normalize(m, 5.8, { ground: true });
  const s = m.scale.x;
  prepModel(m, renderer, {
    env: 0.7,
    onMat: mat => {
      mat.name = 'vent';
      patchWater(mat, {
        caustics: false,
        extra(sh) {
          sh.uniforms.uVentGlow = ventGlow;
          sh.fragmentShader = sh.fragmentShader
            .replace('#include <common>', '#include <common>\nuniform vec3 uVentGlow;')
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
              float rust = smoothstep(0.06, 0.26, diffuseColor.r - diffuseColor.b) * smoothstep(0.14, 0.64, vObj.y) * smoothstep(0.32, 0.1, length(vObj.xz - vec2(-0.094, 0.009)));
              totalEmissiveRadiance += uVentGlow * (rust * 1.5 + smoothstep(0.74, 0.82, vObj.y) * 1.2);`);
        },
      });
    },
  });
  const [vx, vz] = VENT_XZ;
  vent.position.set(vx, heightAt(vx, vz) - 0.9, vz);
  vent.rotation.y = 0.5;
  vent.add(m);
  vent.updateMatrixWorld(true);
  // Chimney top in world space.
  ventTop.set(-0.093, 0.793, 0.01);
  m.updateMatrixWorld(true);
  m.localToWorld(ventTop);
  plume = ventPlume({ top: ventTop });
  scene.add(plume.smoke, plume.sparks);
  ventLights[0].position.copy(ventTop).add(V3(0, 0.5, 0.4));
  ventLights[1].position.copy(vent.position).add(V3(0.6, 1.0, 1.2));
  void s;
});

// Beacon 07 on the floor.
const bcn = beacon();
const BEACON_XZ = [4.3, 3.2];
bcn.group.position.set(BEACON_XZ[0], heightAt(...BEACON_XZ) - 0.02, BEACON_XZ[1]);
bcn.group.rotation.y = 0.4;
scene.add(bcn.group);
scene.add(bcn.light);
const beaconHalo = makeGlowSprite(0x5fe6da, 0.7);
scene.add(beaconHalo);
// Acoustic ping drawn on the silt: a ring that runs out from the beacon every two seconds.
const beaconRing = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uP: { value: 0 }, uVis: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uP, uVis; varying vec2 vUv;
    void main(){ float d = length(vUv - 0.5) * 2.0; float r = uP;
      float ring = smoothstep(r - 0.035, r, d) * smoothstep(r + 0.006, r, d);
      float a = ring * pow(1.0 - uP, 1.6) * smoothstep(0.02, 0.08, d) * 1.4 * uVis;
      gl_FragColor = vec4(vec3(0.25, 0.9, 0.84) * a, 1.0); }`,
}));
beaconRing.rotation.x = -Math.PI / 2;
beaconRing.position.set(BEACON_XZ[0], heightAt(...BEACON_XZ) + 0.06, BEACON_XZ[1]);
beaconRing.renderOrder = 4;
scene.add(beaconRing);

// Companion ROV light for the vessel sections: a soft key from the camera side.
const rov = new THREE.SpotLight(0xfff1e0, 0, 30, 0.42, 0.9, 1.3);
scene.add(rov, rov.target);

function makeGlowSprite(color, size) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.12, 'rgba(255,255,255,.7)'); grd.addColorStop(0.35, 'rgba(255,255,255,.14)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  s.scale.setScalar(size);
  s.renderOrder = 10;
  s.userData.size = size;
  return s;
}

// ─── Scroll → station ─────────────────────────────────────────────────────────
const stages = [...document.querySelectorAll('.stage')];
let anchors = [];
function measure() {
  const maxS = document.documentElement.scrollHeight - innerHeight;
  anchors = stages.map((el, i) => {
    if (i === 0) return 0;
    const top = el.getBoundingClientRect().top + scrollY;
    return Math.min(maxS, top + el.offsetHeight / 2 - innerHeight / 2);
  });
  anchors[anchors.length - 1] = maxS;
}
function sFromScroll(y) {
  for (let i = 0; i < anchors.length - 1; i++) if (y <= anchors[i + 1]) return i + clamp((y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]));
  return anchors.length - 1;
}
function scrollFromS(s) {
  const i = Math.min(anchors.length - 2, Math.floor(s)), f = s - i;
  return lerp(anchors[i], anchors[i + 1], f);
}
measure();
addEventListener('resize', measure);
document.fonts?.ready.then(measure);

const lerpA = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };
const tmp = { sub: V3(), cam: V3(), look: V3(), a: V3(), b: V3(), c: V3() };
function stationState(i, s, o) {
  const st = STATIONS[i];
  o.sub.set(st.sub[0], st.sub[1], st.sub[2]);
  o.look.set(st.look[0], st.look[1], st.look[2]);
  if (st.orbit) {
    const k = clamp(s - 5.4, 0, 1.2);
    const a = lerp(-0.95, 0.75, smooth(0, 1.2, k));
    const R = MOBILE ? 9.5 : 7.2;
    o.cam.set(st.sub[0] + Math.sin(a) * R, st.sub[1] + 1.1 + Math.cos(a * 1.3) * 0.5, st.sub[2] + Math.cos(a) * R);
    if (!MOBILE) o.look.x -= Math.cos(a) * 1.4, o.look.z += Math.sin(a) * 1.4;
  } else o.cam.set(st.cam[0], st.cam[1], st.cam[2]);
  o.yaw = st.yaw;
  return o;
}
const SA = { sub: V3(), cam: V3(), look: V3(), yaw: 0 }, SB = { sub: V3(), cam: V3(), look: V3(), yaw: 0 };
const rig = { sub: V3(), cam: V3(), look: V3(), yaw: 0 };
function rigAt(s) {
  const n = STATIONS.length - 1;
  const i = Math.min(n - 1, Math.max(0, Math.floor(s)));
  const f = smooth(0.1, 0.9, clamp(s - i));
  stationState(i, s, SA); stationState(i + 1, s, SB);
  const y = descY(s);
  rig.sub.lerpVectors(SA.sub, SB.sub, f); rig.sub.y += y;
  rig.cam.lerpVectors(SA.cam, SB.cam, f); rig.cam.y += y;
  rig.look.lerpVectors(SA.look, SB.look, f); rig.look.y += y;
  rig.yaw = lerpA(SA.yaw, SB.yaw, f);
  // Mid-transition swing: the camera drifts out a little so passes feel like a dive, not a dolly.
  const sw = Math.sin(f * Math.PI);
  rig.cam.z += sw * 1.2;
  return rig;
}

// ─── HUD ────────────────────────────────────────────────────────────────────
const odo = odometer(document.querySelector('.odo'));
const rootStyle = document.documentElement.style;
const gaugeEl = document.querySelector('.gauge');
const railLis = [...document.querySelectorAll('.rail-zones li')];
const rTemp = document.querySelector('.r-temp'), rPress = document.querySelector('.r-press'), rLight = document.querySelector('.r-light');
const markZone = document.querySelector('.mark-zone'), markTime = document.querySelector('.mark-time');
const logEl = document.querySelector('.divelog');
const logItems = LOG.map(([d, time, text]) => {
  const li = document.createElement('li');
  li.innerHTML = `<time>${time}</time><span>${text}</span>`;
  li.dataset.d = d;
  return li;
});
const toastEl = document.querySelector('.toast');
let toastTimer;
function toast(html, ms = 3200) {
  toastEl.innerHTML = html;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms);
}
const hud = { d: -1, temp: '', press: '', light: '', zone: '', time: '', logN: -1 };
function updateHud(d, s) {
  odo.set(d);
  const rail = clamp(s / 5);
  gaugeEl.style.setProperty('--d', rail.toFixed(4));
  for (const li of railLis) li.classList.toggle('near', Math.abs(parseFloat(li.style.getPropertyValue('--p')) - rail) < 0.07);
  const t = tempAt(d).toFixed(1), p = Math.round(pressureAt(d)).toLocaleString('en-US'), l = fmtLight(lightAt(d)), z = zoneAt(d), tm = fmtTime(d / 1.0);
  if (t !== hud.temp) rTemp.textContent = hud.temp = t;
  if (p !== hud.press) rPress.textContent = hud.press = p;
  if (l !== hud.light) rLight.textContent = hud.light = l;
  if (z !== hud.zone) markZone.textContent = hud.zone = z;
  if (tm !== hud.time) markTime.textContent = hud.time = tm;
  // Dive log: entries up to the current depth, last three visible.
  const n = logItems.filter(li => d >= +li.dataset.d).length;
  if (n !== hud.logN) {
    hud.logN = n;
    const show = logItems.slice(Math.max(0, n - 3), n);
    for (const li of logItems) if (!show.includes(li) && li.parentNode) li.remove();
    for (const li of show) if (!li.parentNode) { logEl.appendChild(li); requestAnimationFrame(() => li.classList.add('on')); }
  }
}

// ─── Sonar ping + contacts ───────────────────────────────────────────────────
const tagsEl = document.querySelector('.tags');
const CONTACTS = [
  { key: 'school', name: 'Bigeye scad', latin: 'Selar crumenophthalmus · school of ~300', pos: () => SCHOOL_C },
  { key: 'naut', name: 'Chambered nautilus', latin: 'Nautilus pompilius', pos: () => nautilus.position },
  { key: 'jelly', name: 'Crown jellyfish', latin: 'Atolla wyvillei', pos: () => nearestJelly() },
  { key: 'angler', name: 'Humpback anglerfish', latin: 'Melanocetus johnsonii', pos: () => tmp.c.copy(angler.position).add(V3(0, 0.3, 0)) },
  { key: 'vent', name: 'Black smoker', latin: 'Sulphide chimney · fluid 380 °C', pos: () => tmp.b.copy(vent.position).add(V3(0, 3.2, 0)) },
  { key: 'beacon', name: 'Beacon 07', latin: 'Acoustic marker · 12 kHz · placed 2024', pos: () => tmp.a.copy(bcn.group.position).add(V3(0, 1.3, 0)) },
];
for (const c of CONTACTS) {
  c.el = document.createElement('div');
  c.el.className = 'tag';
  c.el.innerHTML = `<div class="tag-box"></div><div class="tag-text mono"><b>Contact</b><span class="tag-name"></span><i></i></div>`;
  tagsEl.appendChild(c.el);
  c.until = 0; c.hit = false; c.p = V3();
}
function nearestJelly() {
  let best = jellies[0], bd = 1e9;
  for (const j of jellies) { const dd = j.position.distanceToSquared(camera.position); if (dd < bd) { bd = dd; best = j; } }
  return best.position;
}
const pingState = { t0: -100, origin: V3(), n: 0 };
function ping() {
  pingState.t0 = engine.time;
  toWorld(subModel, V3(0.9, -0.1, 0), pingState.origin);
  pingState.n++;
  for (const c of CONTACTS) c.hit = false;
  sound.ping();
}
function updatePing(t) {
  const age = t - pingState.t0;
  const R = age * 15;
  const amt = age < 5 ? Math.exp(-age * 0.45) * smooth(0, 0.05, age) : 0;
  fx.uniforms.get('uPing').value.set(pingState.origin.x, pingState.origin.y, pingState.origin.z, R);
  fx.uniforms.get('uPingAmt').value = amt;
  let k = 0;
  for (const c of CONTACTS) {
    const p = c.pos();
    const dist = p.distanceTo(pingState.origin);
    if (!c.hit && amt > 0 && R >= dist) {
      c.hit = true;
      tmp.a.copy(p).project(camera);
      const onScreen = Math.abs(tmp.a.x) < 0.92 && Math.abs(tmp.a.y) < 0.9 && tmp.a.z < 1 && p.distanceTo(camera.position) < 42;
      if (onScreen) {
        c.until = t + 3.4;
        c.el.querySelector('.tag-name').textContent = `${c.name} · ${(p.distanceTo(sub.position) * 1.35).toFixed(1)} m`;
        c.el.querySelector('i').textContent = c.latin;
        c.el.querySelector('b').textContent = `Sonar contact ${String(++k).padStart(2, '0')}`;
      }
    }
    const on = t < c.until;
    c.el.classList.toggle('on', on);
    if (on) {
      tmp.a.copy(p).project(camera);
      const x = (tmp.a.x + 1) / 2 * innerWidth, y = (1 - tmp.a.y) / 2 * innerHeight;
      c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }
}

// ─── Vessel hotspots (Pelagia section) ──────────────────────────────────────
const HOTSPOTS = [
  { p: V3(0.9, -0.08, -0.16), n: V3(1, 0, -0.35), num: '01', title: 'Crew sphere', sub: 'Titanium · 2.1 m inside', text: 'Forged Ti-6Al-4V, 94 mm thick, three acrylic viewports. At the bottom it shrinks by 1.4 mm. You will not feel it.' },
  { p: V3(0.62, 0.4, -0.24), n: V3(0.6, 0.6, -0.5), num: '02', title: 'Floodlight array', sub: '6 × 20,000 lm · steerable', text: 'The only light most of what you see has ever received. Below 1,000 m the pilot hands you the joystick.' },
  { p: V3(-0.15, -0.5, -0.43), n: V3(0, -0.2, -1), num: '03', title: 'Life support', sub: '16 h mission · 96 h reserve', text: 'Oxygen from two banks, CO₂ scrubbed by lithium hydroxide, cabin held at 1 atm and a steady 16 °C.' },
  { p: V3(0.8, -0.46, -0.3), n: V3(0.7, -0.2, -0.7), num: '04', title: 'Manipulator & basket', sub: '7-function arm · 40 kg', text: 'Takes a core of hadal silt on every dive. The ship’s lab has your sample before you have had lunch.' },
];
const hsEl = document.querySelector('.hotspots');
const hsDetail = document.querySelector('.hs-detail');
let hsActive = -1;
for (const h of HOTSPOTS) {
  h.el = document.createElement('div');
  h.el.className = 'hs';
  h.el.innerHTML = `<i class="hs-dot"></i><i class="hs-line"></i><div class="hs-card"><p class="mono">${h.num} · ${h.sub}</p><h3>${h.title}</h3></div>`;
  hsEl.appendChild(h.el);
  h.w = V3(); h.nw = V3();
}
function updateHotspots(s) {
  const vis = smooth(5.55, 5.8, s) * (1 - smooth(6.35, 6.6, s));
  hsEl.style.opacity = vis.toFixed(3);
  if (vis <= 0.001) return;
  const toCam = tmp.a;
  const k = clamp(s - 5.6, 0, 1);
  tmp.c.copy(sub.position).project(camera);
  const subScr = { x: (tmp.c.x + 1) / 2 * innerWidth, y: (1 - tmp.c.y) / 2 * innerHeight };
  const active = Math.min(HOTSPOTS.length - 1, Math.floor(k * 4.4));
  if (active !== hsActive) {
    hsActive = active;
    const h = HOTSPOTS[active];
    hsDetail.querySelector('.hs-d-num').textContent = h.num;
    hsDetail.querySelector('.hs-d-sub').textContent = h.sub;
    hsDetail.querySelector('.hs-d-title').textContent = h.title;
    hsDetail.querySelector('.hs-d-text').textContent = h.text;
    gsap.fromTo(hsDetail, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }
  const copyRight = document.querySelector('.pelagia-copy .specs').getBoundingClientRect().right + 30;
  HOTSPOTS.forEach((h, i) => {
    h.el.classList.toggle('active', i === active);
    toWorld(subModel, h.p, h.w);
    h.nw.copy(h.n).transformDirection(subInner.matrixWorld);
    toCam.copy(camera.position).sub(h.w).normalize();
    const facing = h.nw.dot(toCam) > -0.05;
    // Reveal one after another as the orbit progresses.
    const show = facing && k > i * 0.16;
    h.el.classList.toggle('on', show);
    tmp.b.copy(h.w).project(camera);
    const x = (tmp.b.x + 1) / 2 * innerWidth, y = (1 - tmp.b.y) / 2 * innerHeight;
    const cw = h.el.querySelector('.hs-card').offsetWidth + 110;
    h.el.classList.toggle('flip', x < subScr.x && x - cw > copyRight || x + cw > innerWidth - 20);
    h.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });
}

// ─── Sound (optional, off by default) ─────────────────────────────────────────
const sound = (() => {
  let ctx = null, master = null, on = false;
  const btn = document.querySelector('.sound');
  function init() {
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // Hull rumble: brown noise through a low-pass that breathes.
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 60; lfo.connect(lg).connect(lp.frequency); lfo.start();
    const g = ctx.createGain(); g.gain.value = 0.5;
    src.connect(lp).connect(g).connect(master); src.start();
  }
  function toggle() {
    on = !on;
    if (!ctx) init();
    ctx.resume();
    master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.4);
    btn.setAttribute('aria-pressed', on);
    btn.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
  }
  btn.addEventListener('click', toggle);
  return {
    ping() {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      for (const [delay, gain] of [[0, 0.28], [0.42, 0.07], [0.9, 0.025]]) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(1480, t + delay); o.frequency.exponentialRampToValueAtTime(1320, t + delay + 1.2);
        const g = ctx.createGain(); g.gain.setValueAtTime(0, t + delay); g.gain.linearRampToValueAtTime(gain, t + delay + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.5);
        o.connect(g).connect(master); o.start(t + delay); o.stop(t + delay + 1.6);
      }
    },
  };
})();

// ─── Input ──────────────────────────────────────────────────────────────────
let lastMove = -10;
pointer.on('move', () => { lastMove = engine.time; });
const ray = new THREE.Raycaster();
const aimNdc = new THREE.Vector2();
const aimPoint = V3(0, -40, -10);
const prevNdc = new THREE.Vector2();
// click, not pointerdown: on touch screens a scroll gesture must never fire the sonar.
addEventListener('click', e => {
  if (e.button !== 0 || e.target.closest('a,button,.glass,.zone-card,.nav,.pelagia-copy,table')) return;
  ping();
});
const DBG_AIM = DBG.get('aim')?.split(',').map(Number);

// ─── Frame loop ─────────────────────────────────────────────────────────────
let sNow = 0, sTarget = 0;
const intro = { k: DBG.has('nointro') ? 1 : 0 };
const envState = { depth: 0 };
const fwd = V3(), right = V3(), up = V3(0, 1, 0), dirTmp = V3(), camPrev = V3();
const cTmp = new THREE.Color();
const aimSide = V3(1, 0, 0), perpTmp = V3();
function keepOffAxis(d, axis, minAngle, side) {
  const cosA = d.dot(axis), cosMin = Math.cos(minAngle);
  if (cosA <= cosMin) return;
  perpTmp.copy(d).addScaledVector(axis, -cosA);
  if (perpTmp.lengthSq() < 1e-3) perpTmp.copy(side).addScaledVector(axis, -side.dot(axis));
  perpTmp.normalize();
  d.copy(axis).multiplyScalar(cosMin).addScaledVector(perpTmp, Math.sin(minAngle)).normalize();
}
let camVy = 0, lastSpawnDepth = 0;
engine.onTick((dt, t) => {
  pointer.update(dt);
  sTarget = sFromScroll(scrollY);
  sNow = damp(sNow, sTarget, 5, dt);
  const s = sNow;
  const d = depthAt(s);
  envState.depth = d;
  const dark = smooth(250, 900, d);

  // ── rig
  if (MOBILE) {
    // The hero headline owns the lower half of a phone: lift the sub higher there.
    const ly = Math.round(lerp(0.34, LENS[1], smooth(0.1, 0.9, s)) * 200) / 200;
    if (ly !== lensY) { lensY = ly; applyLens(camera, innerWidth, innerHeight, ly); }
  }
  rigAt(s);
  const introE = 1 - Math.pow(1 - intro.k, 3);
  // While the anglerfish is in frame the pilot turns to keep her in the lights.
  const track = anglerState.focus * smooth(3.15, 3.4, s) * (1 - smooth(3.72, 3.88, s));
  if (track > 0.001) rig.yaw = lerpA(rig.yaw, Math.atan2(-(angler.position.z - rig.sub.z), angler.position.x - rig.sub.x), track * 0.9);
  sub.position.copy(rig.sub);
  sub.position.y += Math.sin(t * 0.55) * 0.07 + (1 - introE) * 4.6;
  sub.rotation.set(Math.sin(t * 0.4) * 0.025, rig.yaw + Math.sin(t * 0.12) * 0.1 + (1 - introE) * 0.5, Math.sin(t * 0.33) * 0.03);
  const pAmt = MOBILE ? 0.25 : 1;
  camera.position.copy(rig.cam).add(tmp.a.set(pointer.sx * 0.35 * pAmt, pointer.sy * 0.18 * pAmt + Math.sin(t * 0.3) * 0.05, 0));
  camera.position.y += (1 - introE) * 0.8;
  camera.lookAt(rig.look);
  camera.updateMatrixWorld();
  camVy = damp(camVy, (camera.position.y - camPrev.y) / Math.max(dt, 1e-3), 6, dt);
  camPrev.copy(camera.position);

  // ── water & light by depth
  waterAt(d, waterCol);
  scene.background.copy(waterCol);
  dome.position.copy(camera.position);
  domeTop.copy(waterCol).multiplyScalar(1.25 + 1.1 * Math.exp(-d / 40));
  groundMesh.visible = d > 2500;
  waterAt(d + 160, domeBot).multiplyScalar(0.8);
  dome.material.uniforms.uTop.value.copy(domeTop);
  dome.material.uniforms.uMid.value.copy(waterCol);
  dome.material.uniforms.uBot.value.copy(domeBot);
  dome.material.uniforms.uSun.value = Math.exp(-d / 60);
  dome.visible = d < 2400;
  if (scene.fog) scene.fog.color.copy(waterCol);
  if (scene.fog) scene.fog.density = lerp(0.03, 0.05, smooth(0, 1200, d));
  const sunK = Math.exp(-d / 110);
  const ambK = Math.exp(-d / 330);
  sun.intensity = 3.4 * sunK;
  sun.color.setRGB(Math.exp(-d * 0.012), Math.exp(-d * 0.0035), Math.exp(-d * 0.0017));
  sun.position.copy(sub.position).add(tmp.a.set(-3.5, 14, 4));
  sun.target.position.copy(sub.position);
  sun.shadow.autoUpdate = sunK > 0.02;
  hemi.intensity = 1.25 * ambK;
  hemi.color.copy(waterCol).multiplyScalar(2.2).lerp(cTmp.setRGB(0.6, 0.95, 1), 0.3 * sunK);
  hemi.groundColor.copy(waterCol).multiplyScalar(0.25);
  scene.environment = d < 230 ? envShallow : (d < 1100 ? envDeep : envFlood);
  scene.environmentIntensity = d < 230 ? 0.9 * ambK + 0.05 : (d < 1100 ? 1.1 * ambK + 0.02 : 0.03 + 0.12 * floodState.power);
  waterUniforms.uCausT.value = t * 0.55;
  waterUniforms.uCausAmt.value = 2.8 * Math.exp(-d / 42);
  surface.material.uniforms.uT.value = t;
  surface.material.uniforms.uFog.value.copy(domeTop);
  surface.material.uniforms.uAmt.value = 1;
  surface.visible = d < 260;
  fx.uniforms.get('uSun').value = Math.exp(-d / 75) * 1.15;
  // Bright shallows bloom less; in the dark every living light should bleed.
  if (bloomLum) bloomLum.threshold = lerp(0.9, 0.55, smooth(40, 500, d));
  vol.uniforms.get('uDensity').value = lerp(0.05, 0.028, smooth(4.4, 5.2, s));
  fx.uniforms.get('uSunCol').value.copy(sun.color).multiplyScalar(0.075).lerp(cTmp.setRGB(0.05, 0.14, 0.15), 0.3);

  // ── floodlights: on at 750 m, steered by the pointer
  const wantOn = d > 740;
  if (wantOn !== floodState.on) {
    floodState.on = wantOn;
    gsap.killTweensOf(floodState);
    if (wantOn) {
      gsap.timeline()
        .to(floodState, { power: 0.8, duration: 0.05 }).to(floodState, { power: 0.05, duration: 0.08, delay: 0.08 })
        .to(floodState, { power: 1, duration: 0.05, delay: 0.14 }).to(floodState, { power: 0.3, duration: 0.05, delay: 0.05 })
        .to(floodState, { power: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
      toast('<b>Floodlights on</b> · 750 m · move to steer them');
    } else gsap.to(floodState, { power: 0, duration: 0.6 });
  }
  const fp = floodState.power;
  const user = DBG_AIM ? 1 : clamp(1 - (t - lastMove - 4) / 2.5);
  const wx = Math.sin(t * 0.27) * 0.45 + Math.sin(t * 0.61) * 0.12, wy = Math.cos(t * 0.37) * 0.18 - 0.05;
  const px = DBG_AIM ? DBG_AIM[0] : pointer.sx, py = DBG_AIM ? DBG_AIM[1] : pointer.sy;
  aimNdc.set(lerp(wx, px, user), lerp(wy, py, user));
  ray.setFromCamera(aimNdc, camera);
  // ── anglerfish: rides with the camera through the midnight zone, looming closer as you sink.
  angler.visible = d > 700 && d < 5200;
  if (angler.visible) {
    if (s <= RIDE[0]) angler.position.copy(anglerEntry);
    else if (s >= RIDE[1]) angler.position.copy(anglerExit);
    else rideAt(s, angler.position);
    angler.position.add(tmp.b.set(Math.sin(t * 0.21) * 0.25, Math.sin(t * 0.5) * 0.1, 0));
    angler.position.addScaledVector(tmp.c.copy(sub.position).sub(angler.position).normalize(), anglerState.lit * 0.5);
    tmp.b.copy(angler.position).project(camera);
    anglerState.focus = damp(anglerState.focus, Math.abs(tmp.b.x) < 0.9 && Math.abs(tmp.b.y) < 0.9 && tmp.b.z < 1 ? 1 : 0, 3, dt);
  } else anglerState.focus = 0;
  // Where the pointer sits on the plane through the hull (facing the camera), pushed along the sub's heading:
  // the beams sweep across the frame toward the cursor instead of running down the line of sight.
  sub.updateMatrixWorld();
  fwd.set(1, 0, 0).transformDirection(subInner.matrixWorld);
  camera.getWorldDirection(tmp.c);
  const tPlane = tmp.b.copy(sub.position).sub(ray.ray.origin).dot(tmp.c) / Math.max(0.2, ray.ray.direction.dot(tmp.c));
  tmp.a.copy(ray.ray.origin).addScaledVector(ray.ray.direction, tPlane);
  tmp.b.copy(tmp.a).sub(sub.position);
  aimSide.copy(tmp.b).lengthSq() < 0.01 && aimSide.copy(right);
  tmp.a.addScaledVector(tmp.b, 0.6).addScaledVector(fwd, s > 4.6 ? 2.5 : 2);
  // Hands off the cursor, the pilot keeps the lights on whatever is out there: the anglerfish, then the
  // chimney, then the beacon — each zone's subject, with a slow searching wobble.
  const wob = tmp.c.set(Math.sin(t * 0.6) * 0.35, Math.cos(t * 0.45) * 0.25, 0);
  if (anglerState.focus > 0.01) idleFocus.copy(angler.position).add(wob).y += 0.2;
  else if (s > 3.7 && s < 4.6) idleFocus.copy(ventTop).add(wob).y -= 1.4;
  else if (s >= 4.6) idleFocus.copy(bcn.group.position).add(wob).y += 0.3;
  // Point near her and the lights lock on (a little magnetism makes searching the dark feel skilled, not fiddly).
  let magnet = 0;
  if (anglerState.focus > 0.01 || (s > 3.7 && s < 4.6)) {
    tmp.b.copy(idleFocus).project(camera);
    const dn = Math.hypot((tmp.b.x - px) * camera.aspect, tmp.b.y - py);
    magnet = 1 - smooth(0.32, 0.6, dn);
  }
  const focusK = Math.max((1 - user) * Math.max(anglerState.focus, smooth(3.7, 3.95, s)), user * magnet);
  if (focusK > 0.001) tmp.a.lerp(idleFocus, focusK);
  // On the bottom the beams land where you point on the silt.
  if (s > 4.5 && ray.ray.direction.y < -0.04) {
    const tFloor = (FLOOR_Y + 0.3 - ray.ray.origin.y) / ray.ray.direction.y;
    if (tFloor > 0 && tFloor < 40) tmp.a.lerp(tmp.b.copy(ray.ray.origin).addScaledVector(ray.ray.direction, tFloor), smooth(4.5, 4.9, s) * user);
  }
  // At the very end the floodlights turn upward: eleven kilometres of dark between you and the surface.
  const upK = smooth(8.3, 8.9, s);
  if (upK > 0) tmp.a.lerp(tmp.b.copy(sub.position).add(tmp.c.set(0.8 + aimNdc.x * 6, 24, -5 - aimNdc.y * 4)), upK);
  aimPoint.lerp(tmp.a, 1 - Math.exp(-9 * dt));
  sub.updateMatrixWorld();
  fwd.set(1, 0, 0).transformDirection(subInner.matrixWorld);
  right.crossVectors(ray.ray.direction, up).normalize();
  floods.forEach((L, i) => {
    toWorld(subModel, FLOOD_LOCAL[i], L.position);
    dirTmp.copy(aimPoint).addScaledVector(right, (i - 1) * 0.55).sub(L.position).normalize();
    // Pan/tilt limits: beams cannot swing behind the hull.
    const dp = dirTmp.dot(fwd);
    if (dp < 0.2) dirTmp.addScaledVector(fwd, 0.2 - dp).normalize();
    // Never into the lens, and never straight down the line of sight (the beam collapses into one glaring disc):
    // keep every beam at least 60° off the viewer and 42° off the view axis, swung toward the cursor's side.
    tmp.c.copy(camera.position).sub(L.position).normalize();
    keepOffAxis(dirTmp, tmp.c, 60 * D, aimSide);
    keepOffAxis(dirTmp, tmp.c.negate(), 42 * D, aimSide);
    L.target.position.copy(L.position).addScaledVector(dirTmp, 10);
    L.intensity = fp * (i === 1 ? 110 : 90) * lerp(1, 0.3, smooth(4.4, 5, s)) * lerp(1, 4.2, upK) * (1 + Math.sin(t * 37 + i) * 0.01);
  });
  lampGlow.value.copy(floodCol).multiplyScalar(fp * 3.5);
  floods.forEach((L, i) => {
    const h = lampHalos[i];
    h.position.copy(L.position);
    h.material.opacity = fp * 0.6;
    h.visible = fp > 0.01;
  });
  floodUniforms.uLCos.value = Math.cos(floods[0].angle * 0.92);
  floodUniforms.uLPow.value = fp * 5;
  floods.forEach((L, i) => {
    floodUniforms.uLPos.value[i].copy(L.position);
    floodUniforms.uLDir.value[i].copy(L.target.position).sub(L.position).normalize();
  });
  // Recovery strobe on the sail.
  const sPh = (t % 2.4);
  const strobeOn = sPh < 0.04 || (sPh > 0.14 && sPh < 0.17) ? 1 : 0;
  toWorld(subModel, tmp.a.set(-0.35, 0.66, 0), strobeDot.position);
  strobe.position.copy(strobeDot.position);
  strobe.intensity = strobeOn * 3 * dark;
  strobeDot.material.opacity = strobeOn * dark;
  strobeDot.scale.setScalar(0.28 * dark + 0.02);

  // ── marine snow & plankton
  for (const sm of [snow, silt]) {
    const u = sm.mat.uniforms;
    u.uT.value = t; u.uCam.value.copy(camera.position);
    u.uAmb.value = ambK * 0.9;
    u.uAmbCol.value.copy(waterCol).multiplyScalar(1.6).lerp(cTmp.setRGB(0.85, 0.97, 1), 0.45);
    u.uFogD.value = lerp(0.03, 0.06, dark);
    u.uStretch.value = sm === snow ? clamp(Math.abs(camVy) * 0.09, 0, 5) : 0;
  }
  silt.points.visible = s > 4.4;
  plankton.mat.uniforms.uT.value = t;
  const speed = Math.hypot(pointer.vx, pointer.vy);
  if (pointer.active && speed > 1.1 && intro.k > 0.9) {
    const n = Math.min(40, Math.ceil(speed * 5));
    const bubbles = d < 300;
    for (let k = 0; k < n; k++) {
      const f = k / n;
      tmp.b.set(lerp(prevNdc.x, pointer.x, f) + rnd(-0.012, 0.012), lerp(prevNdc.y, pointer.y, f) + rnd(-0.012, 0.012));
      ray.setFromCamera(tmp.b, camera);
      const dist = rnd(2.2, 7.5);
      const p = tmp.c.copy(ray.ray.origin).addScaledVector(ray.ray.direction, dist);
      plankton.emit(p.x + rnd(-0.16, 0.16), p.y + rnd(-0.16, 0.16), p.z + rnd(-0.16, 0.16), t - rnd(0, dt), bubbles ? 1 : 0);
    }
  }
  prevNdc.set(pointer.x, pointer.y);
  // Stirred by the descent: plankton flashes along the hull when you scroll fast in the dark.
  if (dark > 0.3 && Math.abs(camVy) > 1.2) {
    const n = Math.min(10, Math.floor(Math.abs(camVy) * 0.8));
    for (let k = 0; k < n; k++) {
      tmp.c.set(rnd(-2.2, 2.2), rnd(-1.2, 1.5), rnd(-1.6, 1.6)).add(sub.position);
      plankton.emit(tmp.c.x, tmp.c.y, tmp.c.z, t, 0);
    }
  }
  // Bubbles from the thrusters near the surface, and the splash on entry.
  if (d < 120 && Math.random() < 0.5 * (1 - d / 120)) {
    toWorld(subModel, tmp.a.set(-0.9, rnd(-0.2, 0.2), rnd(-0.4, 0.4)), tmp.c);
    plankton.emit(tmp.c.x, tmp.c.y, tmp.c.z, t, 1);
  }
  plankton.flush();
  lastSpawnDepth = d;

  // ── creatures
  if (d < 900) {
    school.update(t, SCHOOL_C, 3.6);
    school.mesh.visible = true;
  } else school.mesh.visible = false;
  nautilus.visible = d < 1200;
  if (nautilus.visible) {
    const jet = Math.pow(0.5 + 0.5 * Math.sin(t * 0.9), 6);
    nautilus.position.copy(NAUT_BASE).add(tmp.a.set(Math.sin(t * 0.16) * 0.7 - jet * 0.1, Math.sin(t * 0.45) * 0.18, Math.cos(t * 0.13) * 0.45));
    nautilus.rotation.set(Math.sin(t * 0.4) * 0.08, -1.72 + Math.sin(t * 0.16) * 0.22, Math.sin(t * 0.3) * 0.06);
  }
  const jellyOn = d > 80 && d < 2600;
  for (const j of jellies) {
    j.visible = jellyOn;
    if (j.userData.light) { j.userData.light.intensity = jellyOn ? 2.4 * (0.7 + 0.3 * Math.sin(t * 2 + j.userData.off)) : 0; j.userData.light.position.copy(j.position).y -= 0.15; }
    if (!jellyOn) continue;
    const u = j.userData;
    j.position.copy(u.base).add(tmp.a.set(Math.sin(t * 0.1 + u.off) * 0.5, Math.sin(t * u.vel * 2.2 + u.off) * 1.1, Math.cos(t * 0.08 + u.off) * 0.4));
    j.rotation.set(Math.sin(t * 0.2 + u.off) * 0.18, t * u.spin, Math.cos(t * 0.17 + u.off) * 0.16);
    const fogD = lerp(0.025, 0.055, dark);
    for (const m of u.mats) { m.uniforms.uT.value = t; m.uniforms.uGlow.value = lerp(0.35, 1.25, smooth(150, 700, d)); m.uniforms.uFogD.value = fogD; }
  }
  // Anglerfish: the lure is always on; she turns toward whichever beam finds her.
  if (angler.visible) {
    tmp.a.copy(angler.position).sub(floods[1].position).normalize();
    const inBeam = fp > 0.2 && tmp.a.angleTo(floodUniforms.uLDir.value[1]) < 0.42 ? 1 : 0;
    anglerState.lit = damp(anglerState.lit, inBeam, inBeam ? 2.2 : 0.5, dt);
    const toSub = Math.atan2(sub.position.x - angler.position.x, sub.position.z - angler.position.z);
    const toCam = Math.atan2(camera.position.x - angler.position.x, camera.position.z - angler.position.z);
    const idle = toCam + 0.42 + Math.sin(t * 0.18) * 0.22;
    anglerState.yaw = damp(anglerState.yaw, lerp(idle, toSub, anglerState.lit), 1.4, dt);
    angler.rotation.set(Math.sin(t * 0.7) * 0.03 - anglerState.lit * 0.08, anglerState.yaw, Math.sin(t * 0.45) * 0.05);
    anglerInner.rotation.y = Math.sin(t * 2.1) * 0.02;
    angler.updateMatrixWorld();
    toWorld(anglerModel, LURE_RAW, lureWorld);
    const flick = 0.85 + 0.15 * Math.sin(t * 3.1) * Math.sin(t * 1.7);
    lureCol.value.setRGB(2.2, 5.5, 5.8).multiplyScalar(flick);
    lureLight.position.copy(lureWorld);
    lureLight.intensity = 13 * flick;
    lureHalo.position.copy(lureWorld);
    lureHalo.material.opacity = 0.75 * flick;
  }
  lureHalo.visible = angler.visible;
  if (!angler.visible) lureLight.intensity = 0;
  // Vent.
  const ventOn = d > 3000 && d < 9000;
  vent.visible = ventOn;
  if (plume) {
    plume.smoke.visible = plume.sparks.visible = ventOn;
    for (const m of plume.mats) { m.uniforms.uT.value = t; }
    const vf = 0.8 + 0.2 * Math.sin(t * 5.3) * Math.sin(t * 2.1);
    ventLights[0].intensity = ventOn ? 55 * vf : 0;
    ventLights[1].intensity = ventOn ? 14 * vf : 0;
    ventGlow.value.setRGB(1.6, 0.42, 0.08).multiplyScalar(vf);
    // Heat haze above the chimney.
    tmp.a.copy(ventTop).add(V3(0, 0.4, 0)).project(camera);
    const onS = ventOn && tmp.a.z < 1 && Math.abs(tmp.a.x) < 1.3 && Math.abs(tmp.a.y) < 1.3;
    const distV = camera.position.distanceTo(ventTop);
    fx.uniforms.get('uHaze').value.set((tmp.a.x + 1) / 2, (tmp.a.y + 1) / 2, clamp(1.6 / distV, 0.02, 0.4), onS ? 1 : 0);
  }
  // Beacon: a 12 kHz ping every two seconds, shown as a cyan pulse.
  const bph = (t % 2.0) / 2.0;
  const bp = Math.exp(-bph * 9) + 0.12;
  bcn.glass.emissiveIntensity = bp * 6;
  bcn.light.intensity = bp * 6 * smooth(6000, 8000, d);
  bcn.light.position.copy(bcn.group.position).y += 1.33;
  bcn.group.getWorldPosition(beaconHalo.position); beaconHalo.position.y += 1.33;
  beaconHalo.material.opacity = bp;
  beaconHalo.scale.setScalar(0.5 + bp * 0.9);
  bcn.group.visible = beaconHalo.visible = beaconRing.visible = d > 6000;
  beaconRing.material.uniforms.uP.value = bph;
  beaconRing.material.uniforms.uVis.value = smooth(0.1, 0.35, (camera.position.y - beaconRing.position.y) / Math.max(1, camera.position.distanceTo(beaconRing.position)));
  // Faint cool fill in the dark so the hull separates from the black.
  fill.intensity = dark * (0.5 + 0.4 * smooth(4.3, 5, s));
  fill.position.copy(camera.position).add(tmp.a.set(-6, 9, 2));
  fill.target.position.copy(sub.position);
  // Companion light: the vessel sections need the sub itself lit.
  const rovK = smooth(5.3, 5.9, s);
  rov.intensity = rovK * 60 + smooth(4.6, 5.0, s) * 22;
  rov.position.copy(camera.position).add(tmp.a.set(-2.5, 3.5, 0));
  rov.target.position.copy(sub.position);

  // ── post
  const sonarDark = 1;
  updatePing(t);
  void sonarDark;

  // ── HUD & UI state
  updateHud(Math.abs(sTarget - sNow) < 0.002 ? Math.round(d) : d, s);
  document.body.classList.toggle('is-dark', d > 700 && s < 5.4);
  document.body.classList.toggle('is-deep-ui', s > 5.4);
  document.body.classList.toggle('is-docked', s > 5.3);
  updateHotspots(s);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
worldNav('abyssal', { theme: 'dark' });
cursor({ color: '#3fd6c9', blend: 'normal', size: 34 });
magnetic();
const lenis = smoothScroll({ lerp: 0.08 });
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  const el = id === '#top' ? 0 : document.querySelector(id);
  if (el === null) return;
  e.preventDefault();
  lenis.scrollTo(el === 0 ? 0 : el, { duration: 2.4, offset: 0 });
}));
document.querySelector('.ascend').addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 7, easing: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2) });
  toast('<b>Ascent</b> · drop weights released · 3 h 02 min to the surface', 4200);
});
reveal('.glass h2, .foot-title', { type: 'lines', stagger: 0.08 });
document.querySelectorAll('.zone-card, .pelagia-copy').forEach(el => {
  gsap.from(el.querySelectorAll('header, h2, .stats, .see, .eyebrow, .specs'), { y: 40, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
});
reveal('.zone-card .lede, .pelagia .lede', { type: 'lines', stagger: 0.05, y: '100%' });

// Frame creatures from their station cameras (keeps composition right at any aspect ratio).
function placeFromStation(s, [sx, sy, dist], out) {
  rigAt(s);
  const c = new THREE.PerspectiveCamera(camera.fov, innerWidth / innerHeight, 0.1, 100);
  applyLens(c, innerWidth, innerHeight);
  c.position.copy(rig.cam); c.lookAt(rig.look); c.updateMatrixWorld();
  const dir = V3(sx * 2 - 1, 1 - sy * 2, 0.5).unproject(c).sub(c.position).normalize();
  return out.copy(c.position).addScaledVector(dir, dist);
}
for (const j of jellies) {
  const [x, y, dd] = j.userData.at;
  placeFromStation(2, MOBILE ? [0.12 + (x - 0.3) * 1.3, y * 0.72 - 0.04, dd * 1.1] : j.userData.at, j.userData.base);
}
placeFromStation(3, MOBILE ? [0.58, 0.27, 12] : [0.67, 0.47, 9.5], ANGLER_BASE);
placeFromStation(RIDE[0], rideSpot(RIDE[0]), anglerEntry);
placeFromStation(RIDE[1], rideSpot(RIDE[1]), anglerExit);
{
  // Beacon 07 sits in the pool of the floodlights, between the landed sub and the camera.
  const bp = placeFromStation(5, MOBILE ? [0.36, 0.4, 11] : [0.43, 0.64, 9.2], V3());
  BEACON_XZ[0] = bp.x; BEACON_XZ[1] = bp.z;
  bcn.group.position.set(bp.x, heightAt(bp.x, bp.z) - 0.02, bp.z);
  beaconRing.position.set(bp.x, heightAt(bp.x, bp.z) + 0.06, bp.z);
  const [sx, , sz] = STATIONS[5].sub;
  const yawB = Math.atan2(-(bp.z - sz), bp.x - sx) - 0.25;
  for (const st of STATIONS.slice(5)) st.yaw = yawB;
}

await Promise.all([subLoad, nautLoad, angLoad, ventLoad].map(p => p.catch(e => console.warn('model missing', e.message))));
if (DBG.has('s')) {
  const target = scrollFromS(+DBG.get('s'));
  lenis.scrollTo(target, { immediate: true });
  sNow = +DBG.get('s');
}
// Warm every program: floodlights, vent and beacon on, every creature visible.
floodState.power = 1;
for (const L of floods) L.intensity = 100;
ventLights[0].intensity = 10; bcn.light.intensity = 1; lureLight.intensity = 1; strobe.intensity = 1; rov.intensity = 1;
renderer.compile(scene, camera);
floodState.power = 0;
engine.start();
await loader.finish();
if (!DBG.has('nointro')) {
  gsap.to(intro, { k: 1, duration: 3.4, ease: 'power2.out' });
  // Splash: a burst of bubbles around the hull as she enters.
  for (let i = 0; i < 520; i++) {
    toWorld(subModel, tmp.a.set(rnd(-1.1, 1.1), rnd(-0.6, 0.7), rnd(-0.6, 0.6)), tmp.c);
    plankton.emit(tmp.c.x, tmp.c.y, tmp.c.z, engine.time + rnd(0, 1.2), 1);
  }
  plankton.flush();
}
gsap.from('.hero h1 .l > span', { yPercent: 100, opacity: 0, duration: 1.8, ease: 'expo.out', stagger: 0.1, delay: 0.25 });
gsap.from('.hero .eyebrow, .hero .sub, .hero .cta, .nav, .gauge, .hint', { opacity: 0, y: 16, duration: 1.4, ease: 'power3.out', stagger: 0.07, delay: 0.7, clearProps: 'opacity,transform' });
if (DBG.has('ping')) setTimeout(ping, +DBG.get('ping') || 400);
window.__abyss = { dbg: { lampHalos, floods, lampGlow, strobeDot, beaconHalo, lureHalo, bcn, subInner }, engine, scene, camera, renderer, THREE, ping, get s() { return sNow; }, scrollFromS, depthAt };
