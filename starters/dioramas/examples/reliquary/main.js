import { Engine, THREE, normalize, prepModel, damp, clamp, smooth, lerp, studioEnvironment } from '../../src/core/engine.js';
import { Assets } from '../../src/core/assets.js';
import { Pointer } from '../../src/core/input.js';
import { smoothScroll, gsap, reveal, elementProgress } from '../../src/core/scroll.js';
import { preloader, cursor, magnetic, worldNav } from '../../src/core/ui.js';
import { PlanarReflection } from '../../src/core/reflector.js';
import { VolumetricSpotEffect } from '../../src/core/volumetric.js';
import { bakeTexture, fbmNormal } from '../../src/core/textures.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ─── The collection ────────────────────────────────────────────────────────────
const D = Math.PI / 180;
const DBG = new URLSearchParams(location.search);
const RELICS = [
  { key: 'guardian', file: 'models/reliquary/guardian.glb', num: 'I', name: 'Guardian Lion', meta: 'Granite · Fujian, Ming dynasty · c. 1520',
    desc: 'One of a pair that flanked a temple gate for four centuries. The ball beneath its paw is the world; the lichen is its own.',
    pos: [0.95, 0, 0], plinth: [1.75, 0.34, 1.35], h: 1.75, yaw: 22 * D, lampPower: 30, view: [0.05, 1.08, 4.35], look: [0.55, 1.28, 0] },
  { key: 'helmet', file: 'models/reliquary/helmet.glb', num: 'II', name: 'Corinthian Helmet', meta: 'Bronze · Argos, Greece · c. 480 BC',
    desc: 'Beaten from a single sheet. The dent above the left eye was made by a spear, not by time. Whoever wore it survived the blow.',
    pos: [-2.4, 0, -8], plinth: [0.9, 1.12, 0.9], h: 0.44, yaw: 56 * D, view: [-0.85, 1.5, -6.55], look: [-2.4, 1.33, -8] },
  { key: 'mask', file: 'models/reliquary/mask.glb', num: 'III', name: 'Jade Funerary Mask', meta: 'Jade, shell, obsidian · Palenque · 7th c.',
    desc: 'Three hundred and forty tesserae, fitted without a pattern book. It was made to be seen by one person, once, in the dark.',
    pos: [2.4, 0, -15], plinth: [0.9, 1.04, 0.9], h: 0.56, yaw: -56 * D, view: [0.85, 1.5, -13.55], look: [2.4, 1.32, -15] },
  { key: 'bust', file: 'models/reliquary/bust.glb', num: 'IV', name: 'Portrait of a Young Woman', meta: 'Carrara marble · Rome · c. AD 120',
    desc: 'Her braids were fashionable for about eleven years. The sculptor left one chisel stroke in her hair unpolished. Find it.',
    pos: [-2.4, 0, -22], plinth: [0.9, 1.0, 0.9], h: 0.74, yaw: 50 * D, view: [-0.85, 1.52, -20.5], look: [-2.4, 1.36, -22] },
  { key: 'amphora', file: 'models/reliquary/amphora.glb', num: 'V', name: 'Black-figure Amphora', meta: 'Terracotta · Athens · c. 530 BC',
    desc: 'A prize for the footrace. It held forty litres of olive oil from the sacred trees. The runners have not stopped running since.',
    pos: [2.4, 0, -29], plinth: [0.9, 0.62, 0.9], h: 0.98, yaw: -40 * D, view: [0.85, 1.45, -27.4], look: [2.4, 1.1, -29] },
  { key: 'astrolabe', file: 'models/reliquary/astrolabe.glb', num: 'VI', name: 'Planispheric Astrolabe', meta: 'Brass, walnut · Toledo · 1068',
    desc: 'A computer for the sky, accurate to a few minutes of arc. Set the rete to tonight and it will still tell you when dawn comes.',
    pos: [0, 0, -37], plinth: [1.0, 0.98, 0.8], h: 0.74, yaw: 0, rough: 1.5, env: 0.8, lampPower: 7, view: [0, 1.5, -34.75], look: [0, 1.34, -37] },
];
const END = { view: [0, 1.66, -38.2], look: [0, 2.35, -47] };
const HALL = { x: 5.2, len: 66, z0: 9, z1: -48, h: 10.5 };

// ─── Engine ────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gl');
let vol;
const engine = new Engine({
  canvas, fov: 38, near: 0.05, far: 80, dpr: 1.6, background: 0x050404,
  post: {
    ao: { aoRadius: 0.9, intensity: 2.6, distanceFalloff: 0.8 },
    bloom: { intensity: 0.85, luminanceThreshold: 0.55, luminanceSmoothing: 0.35, radius: 0.78 },
    pre: cam => [(vol = new VolumetricSpotEffect(cam, { density: 0.024, noise: 0.95, noiseScale: 0.9, maxDist: 22, floorY: 0 }))],
    vignette: { offset: 0.22, darkness: 0.78 },
    noise: 0.085,
    ca: 0.0011,
  },
});
const { scene, camera, renderer } = engine;
scene.fog = new THREE.FogExp2(0x050404, 0.034);
scene.environment = studioEnvironment(renderer, { top: 0x2a2622, bottom: 0x060505 });
scene.environmentIntensity = 0.035;
scene.add(new THREE.HemisphereLight(0x2a3040, 0x0b0907, 0.05));

const assets = new Assets();
const pointer = new Pointer({ lambda: 7 });
const loaderEl = document.querySelector('.loader');
const loader = preloader({
  assets, el: loaderEl, minTime: 1300,
  onValue: v => {
    loaderEl.querySelector('.loader-pct').textContent = Math.round(v * 100);
    loaderEl.style.setProperty('--p', 0.15 + v * 0.85);
  },
});

// ─── Materials & procedural textures ──────────────────────────────────────────
// Stone slab floor: per-slab tone and roughness variation, darker seams.
const floorAlbedo = bakeTexture(renderer, 1024, `
  void main(){
    vec2 g = vUv * vec2(4.0, 4.0);
    vec2 id = floor(g); vec2 f = fract(g);
    float slab = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
    float seam = smoothstep(0.0, 0.012, f.x) * smoothstep(0.0, 0.012, f.y) * smoothstep(1.0, 0.988, f.x) * smoothstep(1.0, 0.988, f.y);
    float n = fbm(vUv * 18.0, 18.0, 6, 0.55);
    float veins = smoothstep(0.02, 0.0, abs(fbm(vUv * 5.0 + slab, 5.0, 5, 0.6) + 0.05)) * 0.35;
    vec3 base = mix(vec3(0.050, 0.044, 0.038), vec3(0.085, 0.074, 0.062), slab);
    base *= 0.85 + n * 0.5;
    base += veins * vec3(0.05, 0.045, 0.04);
    gl_FragColor = vec4(base * mix(0.25, 1.0, seam), 1.0);
  }`);
const floorRough = bakeTexture(renderer, 1024, `
  void main(){
    vec2 g = vUv * vec2(4.0, 4.0);
    vec2 id = floor(g); vec2 f = fract(g);
    float slab = fract(sin(dot(id, vec2(41.3, 17.7))) * 43758.5453);
    float seam = smoothstep(0.0, 0.015, f.x) * smoothstep(0.0, 0.015, f.y) * smoothstep(1.0, 0.985, f.x) * smoothstep(1.0, 0.985, f.y);
    float wear = fbm(vUv * 7.0, 7.0, 5, 0.5);
    float r = 0.16 + slab * 0.14 + wear * 0.22 + fbm(vUv * 40.0, 40.0, 3, 0.5) * 0.06;
    r = mix(0.95, r, seam);
    gl_FragColor = vec4(1.0, clamp(r, 0.05, 1.0), 0.0, 1.0);
  }`);
const plasterN = fbmNormal(renderer, { size: 512, scale: 8, octaves: 6, strength: 1.6 });
const stoneN = fbmNormal(renderer, { size: 512, scale: 5, octaves: 6, strength: 1.2 });

const floorMat = new THREE.MeshStandardMaterial({ map: floorAlbedo, roughnessMap: floorRough, roughness: 1, metalness: 0, envMapIntensity: 0.2 });
floorAlbedo.repeat.set(3, 14); floorRough.repeat.set(3, 14);
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1f1b17, roughness: 0.93, normalMap: plasterN, normalScale: new THREE.Vector2(0.9, 0.9) });
plasterN.repeat.set(10, 3);
const trimMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.78, normalMap: stoneN, normalScale: new THREE.Vector2(0.5, 0.5) });
const plinthRough = bakeTexture(renderer, 512, `void main(){ float r = 0.42 + fbm(vUv * 3.0, 3.0, 5, 0.55) * 0.35 + fbm(vUv * 24.0, 24.0, 3, 0.5) * 0.08; gl_FragColor = vec4(1., clamp(r, .1, 1.), 0., 1.); }`);
const lipMat = new THREE.MeshStandardMaterial({ color: 0x1b1814, roughness: 0.55, metalness: 0, envMapIntensity: 0.6 });
const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0f0d0b, roughness: 1, roughnessMap: plinthRough, metalness: 0, envMapIntensity: 0.6 });
function placardTexture(num) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 80;
  const g = c.getContext('2d');
  g.fillStyle = '#4a3820'; g.fillRect(0, 0, 256, 80);
  g.strokeStyle = '#21180c'; g.lineWidth = 3; g.strokeRect(8, 8, 240, 64);
  g.fillStyle = '#140e06'; g.font = 'italic 44px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, 128, 42);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ─── The hall ──────────────────────────────────────────────────────────────────
const hall = new THREE.Group();
scene.add(hall);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL.x * 2, HALL.len), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.z = (HALL.z0 + HALL.z1) / 2;
floor.receiveShadow = true;
hall.add(floor);

const reflection = new PlanarReflection(renderer, { resolution: 0.5 });
reflection.hidden.push(floor);
if (!DBG.has('norefl')) reflection.patch(floorMat, { strength: 1.25, distort: 0.012, lodScale: 7.5, lodBias: 0.3, f0: 0.06 });
engine.onResize((w, h, dpr) => reflection.setSize(w, h, dpr));

for (const s of [-1, 1]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, HALL.h, HALL.len), wallMat);
  wall.position.set(s * (HALL.x + 0.2), HALL.h / 2, floor.position.z);
  wall.receiveShadow = true;
  hall.add(wall);
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, HALL.len), trimMat);
  skirting.position.set(s * (HALL.x - 0.04), 0.17, floor.position.z);
  skirting.receiveShadow = true;
  hall.add(skirting);
}
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HALL.x * 2, HALL.len), new THREE.MeshStandardMaterial({ color: 0x0d0b0a, roughness: 1 }));
ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, HALL.h, floor.position.z);
hall.add(ceiling);

// Pilasters and transverse arches every bay.
const bays = [4.2, -4.5, -11.5, -18.5, -25.5, -32.5, -41];
const pilGeo = new RoundedBoxGeometry(0.62, HALL.h, 0.7, 2, 0.03);
const capGeo = new RoundedBoxGeometry(0.86, 0.26, 0.9, 2, 0.03);
const archGeo = new THREE.TorusGeometry(HALL.x - 0.3, 0.26, 10, 72, Math.PI);
for (const z of bays) {
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(pilGeo, trimMat);
    p.position.set(s * (HALL.x - 0.3), HALL.h / 2, z);
    p.castShadow = p.receiveShadow = true;
    hall.add(p);
    const c = new THREE.Mesh(capGeo, trimMat);
    c.position.set(s * (HALL.x - 0.36), 4.9, z);
    c.castShadow = c.receiveShadow = true;
    hall.add(c);
  }
  const a = new THREE.Mesh(archGeo, trimMat);
  a.position.set(0, 5.0, z);
  a.receiveShadow = true;
  hall.add(a);
}

// End wall with an arched doorway onto a moonlit court.
{
  const w = HALL.x * 2, h = HALL.h;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, h); shape.lineTo(-w / 2, h); shape.lineTo(-w / 2, 0);
  const door = new THREE.Path();
  const dw = 1.3, dh = 3.3;
  door.moveTo(-dw, 0); door.lineTo(-dw, dh); door.absarc(0, dh, dw, Math.PI, 0, true); door.lineTo(dw, 0); door.lineTo(-dw, 0);
  shape.holes.push(door);
  const end = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false }), wallMat);
  end.position.set(0, 0, HALL.z1 + 1.6);
  end.receiveShadow = true;
  hall.add(end);
  // The court beyond: a moonlit cloister plate, lifted slightly so the bloom catches the moon.
  const courtTex = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}img/reliquary/court.webp`);
  courtTex.colorSpace = THREE.SRGBColorSpace;
  const court = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4 * 2200 / 1160), new THREE.MeshBasicMaterial({ map: courtTex, fog: false, color: new THREE.Color(0.62, 0.72, 0.95) }));
  court.position.set(0, 2.5, HALL.z1 - 0.6);
  hall.add(court);
  const moonSpot = new THREE.SpotLight(0x9fb4ff, 60, 20, 0.5, 0.8, 1.6);
  moonSpot.position.set(0, 4.5, HALL.z1 + 0.5);
  moonSpot.target.position.set(0, 0, HALL.z1 + 7);
  hall.add(moonSpot, moonSpot.target);
}

// ─── Lantern ──────────────────────────────────────────────────────────────────
function cookieTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, '#fff'); grd.addColorStop(0.18, '#fff6e6'); grd.addColorStop(0.3, '#d9c7aa');
  grd.addColorStop(0.36, '#fff3de'); grd.addColorStop(0.55, '#8c7a62'); grd.addColorStop(0.8, '#2b241b'); grd.addColorStop(1, '#000');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  // Imperfections in the reflector.
  g.globalCompositeOperation = 'multiply';
  g.filter = 'blur(10px)';
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 60;
    g.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.05})`;
    g.beginPath(); g.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 14 + Math.random() * 20, 0, Math.PI * 2); g.fill();
  }
  g.filter = 'none';
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const lantern = new THREE.SpotLight(0xffd8a6, 0, 26, 0.29, 0.42, 1.7);
if (!DBG.has('nomap')) lantern.map = cookieTexture();
lantern.castShadow = !DBG.has('noshadow');
lantern.shadow.mapSize.set(2048, 2048);
lantern.shadow.camera.near = 0.15; lantern.shadow.camera.far = 24;
lantern.shadow.bias = -0.0004; lantern.shadow.normalBias = 0.06;
scene.add(lantern, lantern.target);
vol.add(lantern, { scale: 0.0028, range: 0.09, softness: 0.35 });
const LANTERN_ON = 95;
const lanternState = { power: 0 };

// Moonlight from the court door rims the guardian and the hall's silhouettes.
const moonRim = new THREE.SpotLight(0x8ea6ff, 16, 14, 0.42, 0.9, 1.4);
moonRim.position.set(-2.6, 4.2, -5.5);
moonRim.target.position.set(0.95, 1.1, 0);
scene.add(moonRim, moonRim.target);
const flash = new THREE.PointLight(0xfff1e0, 0, 30, 1.6);
scene.add(flash);

// Dust that only exists where the lantern falls.
const dust = (() => {
  const N = 7000;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * HALL.x;
    pos[i * 3 + 1] = Math.random() * 5.5 + 0.1;
    pos[i * 3 + 2] = lerp(HALL.z0, HALL.z1 + 4, Math.random());
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uLPos: { value: new THREE.Vector3() }, uLDir: { value: new THREE.Vector3(0, 0, -1) }, uCos: { value: 0.93 }, uPower: { value: 0 }, uDpr: { value: 1 } },
    vertexShader: `
      attribute float seed; uniform float uTime, uCos, uPower, uDpr; uniform vec3 uLPos, uLDir; varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * (0.05 + seed * 0.06);
        p += vec3(sin(t * 3.1 + seed * 40.), sin(t * 2.3 + seed * 13.) * 0.6 - t * 0.1, cos(t * 2.7 + seed * 27.)) * 0.35;
        p.y = mod(p.y, 5.6) + 0.1;
        vec3 d = p - uLPos; float dist = length(d);
        float cone = smoothstep(uCos, uCos + 0.03, dot(d / dist, uLDir));
        vA = cone * uPower / (1.0 + dist * dist * 0.12) * (0.4 + 0.6 * fract(seed * 91.7));
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.2 + seed * 2.6) * uDpr * (5.0 / -mv.z);
      }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d); gl_FragColor = vec4(vec3(1.0, .86, .66) * a * vA * 2.2, 1.); }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);
  engine.onResize((w, h, dpr) => { mat.uniforms.uDpr.value = dpr; });
  return mat;
})();

// ─── Relics ────────────────────────────────────────────────────────────────────
const cardsEl = document.querySelector('.cards');
const slotsEl = document.querySelector('.journal-slots');
const relics = RELICS.map((r, i) => {
  const group = new THREE.Group();
  group.position.set(...r.pos);
  scene.add(group);
  const [pw, ph, pd] = r.plinth;
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(pw, ph, pd, 3, 0.025), plinthMat);
  plinth.position.y = ph / 2;
  plinth.castShadow = plinth.receiveShadow = true;
  group.add(plinth);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(pw + 0.06, 0.05, pd + 0.06, 2, 0.015), lipMat);
  lip.position.y = ph + 0.025; lip.receiveShadow = true; lip.castShadow = true;
  group.add(lip);
  // Brass placard facing the visitor.
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.0625), new THREE.MeshStandardMaterial({ map: placardTexture(r.num), metalness: 0.9, roughness: 0.42, envMapIntensity: 1.5 }));
  plate.position.set(0, Math.max(ph - 0.16, ph * 0.72), pd / 2 + 0.002);
  group.add(plate);
  const holder = new THREE.Group();
  holder.position.y = ph + 0.05;
  holder.rotation.y = r.yaw;
  group.add(holder);
  // Exhibit lamp, earned by documenting the relic.
  const lamp = new THREE.SpotLight(0xffd4a0, 0, 9, 0.3, 0.75, 1.5);
  const worldPos = new THREE.Vector3(...r.pos);
  lamp.position.copy(worldPos).add(new THREE.Vector3(0, ph + 2.8, 0.9));
  lamp.target.position.copy(worldPos).add(new THREE.Vector3(0, ph + r.h * 0.45, 0));
  scene.add(lamp, lamp.target);

  const card = document.createElement('article');
  card.className = 'card right';
  card.innerHTML = `<p class="num mono"><span>Relic ${r.num}</span><span class="status">Undocumented</span></p>
    <h3>${r.name}</h3><p class="meta mono">${r.meta}</p><p class="desc">${r.desc}</p>`;
  cardsEl.appendChild(card);
  const li = document.createElement('li');
  li.textContent = r.num;
  slotsEl.appendChild(li);
  return {
    ...r, i, group, holder, lamp, card, li, lit: 0, shot: false, lampPower: r.lampPower ?? 14,
    center: worldPos.clone().add(new THREE.Vector3(0, ph + 0.05 + r.h * 0.5, 0)),
    view: new THREE.Vector3(...r.view), look: new THREE.Vector3(...r.look),
  };
});
const stations = [...relics.map(r => ({ view: r.view.clone(), look: r.look.clone(), desk: { view: r.view.clone(), look: r.look.clone() }, r })),
  { view: new THREE.Vector3(...END.view), look: new THREE.Vector3(...END.look) }];
// Portrait screens: widen the lens and aim each station straight at its relic.
engine.onResize((w, h) => {
  const portrait = w / h < 0.8;
  camera.fov = portrait ? 62 : 38;
  camera.updateProjectionMatrix();
  for (const st of stations) {
    if (!st.r) continue;
    st.view.copy(st.desk.view); st.look.copy(st.desk.look);
    if (portrait) { st.look.x = st.r.center.x; st.look.z = st.r.center.z; st.view.lerp(st.r.center, -0.12); st.view.y = st.desk.view.y; }
  }
});

const loads = relics.map(r => assets.gltf(r.file).then(g => {
  const m = g.scene;
  normalize(m, r.h, { axis: 'y' });
  prepModel(m, renderer, { env: r.env ?? 1.2, onMat: mat => { if (r.rough) mat.roughness = r.rough; } });
  r.holder.add(m);
  r.model = m;
}).catch(e => console.warn('relic missing', r.key, e.message)));

// ─── Camera choreography ──────────────────────────────────────────────────────
const walkEl = document.querySelector('.walk');
const camPos = new THREE.Vector3().copy(stations[0].view);
const camLook = new THREE.Vector3().copy(stations[0].look);
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
let walkT = 0;
let exposureDist = 5;
const idleC = { x: 0.2, y: 0.05 };
function stationAt(t, outPos, outLook) {
  const n = stations.length - 1;
  const i = Math.min(n - 1, Math.floor(t));
  const f = smooth(0.18, 0.82, t - i);
  const a = stations[i], b = stations[i + 1];
  outPos.lerpVectors(a.view, b.view, f);
  outLook.lerpVectors(a.look, b.look, f);
  // Drift toward the hall's centre line mid-walk so we never clip a plinth.
  outPos.x *= 1 - Math.sin(f * Math.PI) * 0.7;
  outPos.y += Math.sin(f * Math.PI) * 0.08;
}

// ─── Aim, lantern and hero mask ───────────────────────────────────────────────
const ray = new THREE.Raycaster();
const aimNdc = new THREE.Vector2();
const aimDir = new THREE.Vector3();
const lightDir = new THREE.Vector3();
let lastMove = -10;
pointer.on('move', () => { lastMove = engine.time; });
const heroTitle = document.querySelector('.title');
const heroEl = document.querySelector('.hero');
const rootStyle = document.documentElement.style;

// ─── Photography ──────────────────────────────────────────────────────────────
const flashEl = document.querySelector('.flash');
const toastEl = document.querySelector('.toast');
let captureAt = null;
let toastTimer;
function toast(msg, ms = 2600) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms);
}
let audio;
function shutterSound() {
  try {
    audio ??= new AudioContext();
    const t = audio.currentTime;
    const len = 0.12, buf = audio.createBuffer(1, audio.sampleRate * len, audio.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) { const k = i / d.length; d[i] = (Math.random() * 2 - 1) * (k < 0.08 ? 1 : Math.exp(-k * 22)) * (k > 0.45 && k < 0.5 ? 2 : 1); }
    const src = audio.createBufferSource(); src.buffer = buf;
    const bp = audio.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.9;
    const g = audio.createGain(); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(bp).connect(g).connect(audio.destination); src.start(t);
  } catch { /* audio is a nicety */ }
}
function photograph() {
  if (lanternState.power < 0.5) return;
  shutterSound();
  gsap.fromTo(flash, { intensity: 42 }, { intensity: 0, duration: 0.7, ease: 'power3.out' });
  gsap.fromTo(flashEl, { opacity: 0.5 }, { opacity: 0, duration: 0.8, ease: 'expo.out', delay: 0.05 });
  captureAt = { x: pointer.px, y: pointer.py, frames: 3 };
}
addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.target.closest('a,button,.tier,.panel')) return;
  photograph();
});

function finishCapture(cap) {
  // Which relic sits in the beam?
  let best = null, bestA = 0.16;
  const cp = camera.position;
  for (const r of relics) {
    if (!r.model) continue;
    tmpA.copy(r.center).sub(cp);
    const dist = tmpA.length();
    if (dist > 9.5) continue;
    const a = tmpA.normalize().angleTo(aimDir);
    if (a < bestA) { bestA = a; best = r; }
  }
  const src = renderer.domElement;
  const sw = src.width, sh = src.height, s = sw / innerWidth;
  const cw = Math.min(sw, 520 * s), ch = cw / 1.5;
  const sx = clamp(cap.x * s - cw / 2, 0, sw - cw), sy = clamp(cap.y * s - ch / 2, 0, sh - ch);
  const c2 = document.createElement('canvas'); c2.width = 420; c2.height = 280;
  c2.getContext('2d').drawImage(src, sx, sy, cw, ch, 0, 0, 420, 280);
  const url = c2.toDataURL('image/jpeg', 0.85);

  if (!best) { toast('Only darkness. Aim the lantern at a relic.'); return; }
  if (best.shot) { toast(`${best.name} is already in your journal.`); return; }
  best.shot = true;
  best.card.classList.add('shot');
  best.card.querySelector('.status').textContent = 'Documented ✓';
  gsap.to(best.lamp, { intensity: best.lampPower, duration: 2.8, ease: 'power2.inOut', delay: 0.9 });
  // Polaroid flies into the journal.
  const pol = document.createElement('div');
  pol.className = 'polaroid';
  pol.innerHTML = `<img alt=""><span>${best.num}. ${best.name}</span>`;
  pol.firstElementChild.src = url;
  document.body.appendChild(pol);
  document.body.classList.add('has-photos');
  const slot = best.li.getBoundingClientRect();
  gsap.set(pol, { x: cap.x - 107, y: cap.y - 81, rotation: gsap.utils.random(-8, 8), scale: 0.7, opacity: 0 });
  gsap.timeline()
    .to(pol, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' })
    .to(pol, { x: slot.left - 107 + slot.width / 2, y: slot.top - 81 + slot.height / 2, scale: 0.3, rotation: 0, duration: 0.9, ease: 'power3.inOut', delay: 0.55 })
    .to(pol, { opacity: 0, duration: 0.25, onComplete: () => {
      pol.remove();
      const img = new Image(); img.src = url; img.alt = best.name;
      best.li.appendChild(img); best.li.classList.add('filled');
      const n = relics.filter(r => r.shot).length;
      document.querySelector('.journal-count').textContent = n;
      if (n === relics.length) {
        toast('Every relic is documented. The hall is yours tonight.', 4200);
        for (const r of relics) gsap.to(r.lamp, { intensity: r.lampPower * 1.25, duration: 3 });
      } else toast(`${best.name} documented — its lamp is waking up.`);
    } }, '-=0.1');
}

engine.onAfterRender(() => {
  if (!captureAt) return;
  if (captureAt.frames-- > 0) return; // capture on the frame after the flash peaks
  const c = captureAt; captureAt = null;
  finishCapture(c);
});

// ─── Frame loop ────────────────────────────────────────────────────────────────
const quotesEl = document.querySelector('.quotes');
engine.onTick((dt, t) => {
  pointer.update(dt);
  walkT = damp(walkT, elementProgress(walkEl) * (stations.length - 1), 5, dt);
  document.body.classList.toggle('is-walking', walkT > 0.08 && walkT < stations.length - 1.4);

  stationAt(walkT, tmpA, tmpB);
  camPos.copy(tmpA); camLook.copy(tmpB);
  // Breath and hand-held drift.
  camera.position.copy(camPos).add(tmpA.set(pointer.sx * 0.12 + Math.sin(t * 0.37) * 0.02, pointer.sy * 0.06 + Math.sin(t * 0.61) * 0.012, 0));
  camera.lookAt(camLook);

  // Aim: the pointer when it is being used, otherwise a slow searching sweep.
  const user = clamp(1 - (t - lastMove - 3.5) / 2.5);
  // Idle sweep circles the relic at the current station so it is never left in the dark.
  const cur = relics[clamp(Math.round(walkT), 0, relics.length - 1)];
  tmpB.copy(cur.center).project(camera);
  if (Math.abs(walkT - cur.i) < 0.45) { idleC.x = damp(idleC.x, clamp(tmpB.x, -0.8, 0.8), 2, dt); idleC.y = damp(idleC.y, clamp(tmpB.y, -0.6, 0.6), 2, dt); }
  else { idleC.x = damp(idleC.x, 0, 2, dt); idleC.y = damp(idleC.y, 0.05, 2, dt); }
  const wx = idleC.x + Math.sin(t * 0.33) * 0.3 + Math.sin(t * 0.71) * 0.08, wy = idleC.y + Math.cos(t * 0.47) * 0.14;
  aimNdc.set(lerp(wx, pointer.sx, user), lerp(wy, pointer.sy, user));
  ray.setFromCamera(aimNdc, camera);
  aimDir.copy(ray.ray.direction);

  // Lantern hangs from the right hand, lags slightly behind the aim.
  const hand = tmpA.set(0.2, -0.2, -0.05).applyQuaternion(camera.quaternion).add(camera.position);
  lantern.position.copy(hand);
  lightDir.lerp(aimDir, 1 - Math.exp(-12 * dt)).normalize();
  lantern.target.position.copy(camera.position).addScaledVector(lightDir, 6);
  const flicker = 1 + Math.sin(t * 41) * Math.sin(t * 17.3) * 0.025;
  // Keep the pool of light at a steady exposure: a real torch blows out close objects, this one is kind.
  let hit = 6;
  for (const r of relics) { tmpB.copy(r.center).sub(camera.position); const d = tmpB.length(); if (d < hit && tmpB.normalize().angleTo(lightDir) < 0.35) hit = d; }
  exposureDist = damp(exposureDist, hit, 3, dt);
  lantern.intensity = LANTERN_ON * lanternState.power * flicker * clamp(Math.pow(exposureDist / 4.6, 1.6), 0.4, 1.25);
  flash.position.copy(camera.position);

  dust.uniforms.uTime.value = t;
  dust.uniforms.uLPos.value.copy(lantern.position);
  dust.uniforms.uLDir.value.copy(lightDir);
  dust.uniforms.uCos.value = Math.cos(lantern.angle * 0.95);
  dust.uniforms.uPower.value = lanternState.power;

  // Hero title is lit only where the lantern falls.
  rootStyle.setProperty('--mx', ((aimNdc.x + 1) / 2 * 100).toFixed(2) + 'vw');
  rootStyle.setProperty('--my', ((1 - aimNdc.y) / 2 * 100).toFixed(2) + 'vh');
  rootStyle.setProperty('--beam', (0.2 + lanternState.power * 0.8).toFixed(3));
  heroEl.style.opacity = 1 - smooth(0.04, 0.2, walkT);

  // Relic cards: visible at their station while the lantern (or their lamp) is on them.
  const right = tmpB.set(1, 0, 0).applyQuaternion(camera.quaternion);
  for (const r of relics) {
    tmpA.copy(r.center).sub(lantern.position).normalize();
    const inBeam = tmpA.angleTo(lightDir) < lantern.angle * 1.05 ? 1 : 0;
    r.lit = damp(r.lit, Math.max(inBeam * lanternState.power, r.shot ? 1 : 0), inBeam ? 5 : 1.4, dt);
    const near = Math.abs(walkT - r.i) < 0.34 && (r.i > 0 || walkT > 0.12);
    const on = near && r.lit > 0.45 && !!r.model;
    r.card.classList.toggle('on', on);
    if (near && innerWidth / innerHeight < 0.8) {
      r.card.style.transform = `translate3d(16px, ${(innerHeight - r.card.offsetHeight - 150).toFixed(0)}px, 0)`;
    } else if (near) {
      tmpA.copy(r.center).addScaledVector(right, r.h * 0.55 + 0.32).project(camera);
      const x = (tmpA.x + 1) / 2 * innerWidth, y = (1 - tmpA.y) / 2 * innerHeight - 60;
      r.card.style.transform = `translate3d(${Math.min(x + 20, innerWidth - r.card.offsetWidth - 150).toFixed(1)}px, ${clamp(y, 90, innerHeight - 320).toFixed(1)}px, 0)`;
    }
  }

  if (!DBG.has('norefl')) reflection.update(scene, camera);
  // Nothing to draw once the content panels fully cover the canvas.
  engine.paused = quotesEl.getBoundingClientRect().top < 0;
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
worldNav('reliquary', { theme: 'dark' });
cursor({ color: '#ffe9c4', blend: 'normal', size: 30 });
magnetic();
const lenis = smoothScroll({ lerp: 0.075 });
reveal('.panel h2', { type: 'lines', stagger: 0.1 });
reveal('.lede, blockquote p', { type: 'lines', stagger: 0.06, y: '100%' });

await Promise.all(loads);
// Warm the GPU before revealing: compile every program with the lantern at full power.
lanternState.power = 1;
renderer.compile(scene, camera);
lanternState.power = 0;
engine.start();
await loader.finish();
// The lantern stutters on.
gsap.timeline({ delay: 0.25 })
  .to(lanternState, { power: 0.7, duration: 0.05 })
  .to(lanternState, { power: 0.05, duration: 0.08, delay: 0.07 })
  .to(lanternState, { power: 0.9, duration: 0.05, delay: 0.18 })
  .to(lanternState, { power: 0.3, duration: 0.06, delay: 0.05 })
  .to(lanternState, { power: 1, duration: 0.6, ease: 'power2.out', delay: 0.12 });
gsap.from('.title span', { yPercent: 40, opacity: 0, duration: 2.2, ease: 'expo.out', stagger: 0.12, delay: 0.3 });
gsap.from('.eyebrow, .sub, .hint, .nav', { opacity: 0, y: 14, duration: 1.4, ease: 'power3.out', stagger: 0.08, delay: 0.9 });
