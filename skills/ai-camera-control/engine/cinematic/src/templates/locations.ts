// Cinematic locations for the camera moves and angles, drawn as loose ink sketches. Each one has a place, a light plan
// (where the key comes from, what glows, what is dark) and a palette note that goes into the prompt. The set only gives
// the camera something to read against: volumes, openings, beams and practicals, never every detail. The prompt does the rest.
// Subjects stand at the origin; every location keeps 5 m round the middle clear (rooms are at least 9 m wide).
import * as THREE from "three";
import { clay, GREY, type Sky } from "../kit/clay";
import type { KitWorld } from "../kit/stage";

const M = (hex = "#b0b0ae", r = 1) => clay(hex, r);
const sh = <T extends THREE.Object3D>(o: T) => { o.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };
const box = (w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, hex = "#b0b0ae") => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(hex)); m.position.set(x, y, z); m.rotation.y = ry; return sh(m); };
const cyl = (r: number, h: number, x: number, y: number, z: number, seg = 20, hex = "#b3b3b1") => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), M(hex)); m.position.set(x, y, z); return sh(m); };
const cone = (r: number, h: number, x: number, y: number, z: number, seg = 6, hex = "#b0b0ae") => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), M(hex)); m.position.set(x, y + h / 2, z); return sh(m); };
const floor = (w: number, d: number, hex = "#b4b4b2", y = 0) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(hex, 0.92)); f.rotation.x = -Math.PI / 2; f.position.y = y; f.receiveShadow = true; return f; };
/** how many real point lights this set has used (a set keeps to a handful: each is a real light the clay surfaces answer to) */
/** the blockout is coarse and colourless: the mood comes from the reference image and the prompt, so the lit look (coloured lights, halos, shafts) stays off */
const MOOD_LIGHT = false;
const LIGHTS = { n: 0, max: 7 };
const halo = (() => { let t: THREE.Texture | null = null; return () => { if (t || typeof document === "undefined") return t; const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.22, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); return t; }; })();
/** a lamp, a window pane, a sign: a glowing disc with a soft halo around it, and (up to a budget) a real light of its colour */
const glow = (r: number, x: number, y: number, z: number, hex = "#fff1d6", ei = 2.4) => {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 28), clay("#ffffff", 0.5, { emissive: hex, ei })); m.position.set(x, y, z); m.userData.noPathTrace = true;
  const tex = MOOD_LIGHT ? halo() : null;
  if (tex) { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: hex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: Math.min(0.85, 0.22 + ei * 0.1), fog: false })); h.scale.setScalar(Math.max(0.8, r * 8)); h.userData.noPathTrace = true; m.add(h); }
  if (MOOD_LIGHT && ei >= 1.2 && LIGHTS.n < LIGHTS.max) { LIGHTS.n++; const pl = new THREE.PointLight(hex, ei * 3.6 * Math.max(0.6, Math.min(2, r * 2)), 16, 2); pl.position.set(0, 0, 0.35); m.add(pl); }
  return m;
};
/** a shaft of light: a thin tapered cone from `a` to `b`, fading at both ends and at its edges (it adds light, it is not a solid), and a soft pool where it lands */
const shaftMat = (hex: string, k: number) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  uniforms: { c: { value: new THREE.Color(hex) }, k: { value: k } },
  vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
  fragmentShader: "uniform vec3 c; uniform float k; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float along = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.45, vUv.y); float edge = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(c * k * along * edge, 1.0); }",
});
const beam = (a: THREE.Vector3, b: THREE.Vector3, wd = 1.2, hex = "#fff1d6", k = 0.5) => {
  const g = new THREE.Group(); if (!MOOD_LIGHT) return g;
  const len = a.distanceTo(b), dir = b.clone().sub(a).normalize();
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(wd * 0.16, wd * 0.34, len, 20, 1, true), shaftMat(hex, k));
  cone.position.copy(a.clone().add(b).multiplyScalar(0.5)); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); cone.userData.noPathTrace = true; g.add(cone);
  const tex = halo();
  if (tex && Math.abs(dir.y) > 0.1) { const pool = new THREE.Mesh(new THREE.PlaneGeometry(wd * 2.4, wd * 2.4), new THREE.MeshBasicMaterial({ map: tex, color: hex, transparent: true, opacity: 0.3 * k * 2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(b.x, 0.03, b.z); pool.userData.noPathTrace = true; g.add(pool); }
  g.userData.noPathTrace = true; return g;
};
const room = (w: number, d: number, h: number, hex = "#b4b4b2") => {
  const g = new THREE.Group(); g.add(floor(w, d, hex), box(w, h, 0.3, 0, h / 2, -d / 2), box(0.3, h, d, -w / 2, h / 2, 0), box(0.3, h, d, w / 2, h / 2, 0)); return g;   // the front wall (the camera side) is left out so the camera can stand back
};
/** a window frame on the far wall (z = zw): a frame of bars and mullions, `cols` x `rows` panes */
const windowFrame = (cx: number, cy: number, zw: number, w: number, h: number, cols: number, rows: number) => {
  const g = new THREE.Group(), t = 0.12;
  g.add(box(w, t, 0.2, cx, cy - h / 2, zw), box(w, t, 0.2, cx, cy + h / 2, zw), box(t, h, 0.2, cx - w / 2, cy, zw), box(t, h, 0.2, cx + w / 2, cy, zw));
  for (let i = 1; i < cols; i++) g.add(box(0.08, h, 0.14, cx - w / 2 + (w * i) / cols, cy, zw));
  for (let j = 1; j < rows; j++) g.add(box(w, 0.08, 0.14, cx, cy - h / 2 + (h * j) / rows, zw));
  g.add(glow(Math.min(w, h) * 0.2, cx, cy, zw - 0.12, "#e8f1ff", 1.2)); return g;
};
const tree = (x: number, z: number, h: number) => { const g = new THREE.Group(); g.add(cyl(0.18 * h / 8, h * 0.25, x, h * 0.125, z, 8)); for (let i = 0; i < 3; i++) g.add(cone(h * 0.2 - i * h * 0.035, h * 0.4, x, h * 0.2 + i * h * 0.2, z, 7)); return g; };
const lamp = (x: number, z: number, h = 5.2, hex = "#ffb15a") => { const g = new THREE.Group(); g.add(cyl(0.07, h, x, h / 2, z, 8), box(0.9, 0.12, 0.25, x + 0.4, h, z)); g.add(glow(0.28, x + 0.75, h - 0.1, z + 0.14, hex, 3)); return g; };
const car = (x: number, z: number, ry: number) => { const g = new THREE.Group(); g.add(box(4.2, 0.9, 1.8, 0, 0.7, 0), box(2.3, 0.7, 1.7, -0.2, 1.4, 0)); g.position.set(x, 0, z); g.rotation.y = ry; return sh(g); };


const wall = (x: number, y: number, z: number, w: number, h: number, ry = 0) => box(w, h, 0.06, x, y, z, ry);
/** a picture frame / poster on a wall */
const picture = (x: number, y: number, z: number, w = 0.6, h = 0.8, ry = 0) => { const g = new THREE.Group(); g.add(box(w, h, 0.04, 0, 0, 0)); g.add(box(w * 0.78, h * 0.78, 0.05, 0, 0, 0.01)); g.position.set(x, y, z); g.rotation.y = ry; return g; };
/** a row of books / bottles on a shelf */
const row = (x: number, y: number, z: number, n: number, step = 0.14, h = 0.3, axis: "x" | "z" = "x") => { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(box(axis === "x" ? 0.09 : 0.3, h * (0.8 + (i % 3) * 0.15), axis === "x" ? 0.3 : 0.09, axis === "x" ? i * step : 0, (h * (0.8 + (i % 3) * 0.15)) / 2, axis === "z" ? i * step : 0)); g.position.set(x, y, z); return g; };
/** a tower with a grid of windows on its front face */
const tower = (x: number, z: number, w: number, h: number, d = 8, ry = 0, floors = 0) => { const g = new THREE.Group(); g.add(box(w, h, d, 0, h / 2, 0)); const n = floors || Math.floor(h / 3); for (let i = 1; i < n; i++) g.add(box(w, 0.06, d + 0.12, 0, (h * i) / n, 0)); for (let k = 1; k < Math.floor(w / 3); k++) g.add(box(0.06, h, d + 0.12, -w / 2 + (w * k) / Math.floor(w / 3), h / 2, 0)); g.position.set(x, 0, z); g.rotation.y = ry; return sh(g); };
const bed = (x: number, z: number, ry = 0) => { const g = new THREE.Group(); g.add(box(2, 0.45, 2.2, 0, 0.3, 0), box(2, 0.12, 0.7, 0, 0.58, -0.7), box(2.1, 1.1, 0.12, 0, 0.8, -1.15)); g.position.set(x, 0, z); g.rotation.y = ry; return sh(g); };
const chair = (x: number, z: number, ry = 0) => { const g = new THREE.Group(); g.add(box(0.5, 0.06, 0.5, 0, 0.46, 0), box(0.5, 0.55, 0.06, 0, 0.78, -0.22)); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(box(0.04, 0.46, 0.04, a * 0.22, 0.23, b * 0.22)); g.position.set(x, 0, z); g.rotation.y = ry; return sh(g); };
const hang = (x: number, y: number, z: number) => { const g = new THREE.Group(); g.add(cyl(0.01, 0.8, 0, 0.4, 0, 4), cone(0.28, 0.22, 0, -0.1, 0, 14)); g.position.set(x, y, z); g.add(glow(0.1, 0, -0.14, 0, "#ffc878", 3)); return g; };

export type Location = { look?: { bloom?: number; exposure?: number; warm?: number }; name: string; sky: Sky; build: (w: KitWorld) => void; light: string; palette: string; keyDir?: [number, number, number] };

const lake: Location = { name: "Lake at blue hour", sky: "dusk", keyDir: [-0.3, 0.25, -0.9],
  light: "Low cold light from the far shore, a pale band on the horizon, one warm lamp at the end of the jetty, thin mist on the water.", palette: "steel blue, teal shadows, one amber point",
  build: (w) => {
    w.add(floor(900, 900, "#a9aeb2"));
    for (let r = 5; r <= 80; r += 5) { const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.06, 72), M("#9fa4a8")); ring.rotation.x = -Math.PI / 2; ring.position.set(-20, 0.01, -25); w.add(ring); }   // ripples
    w.add(box(2.4, 0.3, 44, 0, 0.35, 10)); for (let z = -10; z < 32; z += 3) { w.add(cyl(0.12, 1.4, -1.05, 0.0, z, 8)); w.add(cyl(0.12, 1.4, 1.05, 0.0, z, 8)); w.add(box(2.4, 0.04, 0.05, 0, 0.52, z)); }   // a jetty with its posts and planks
    w.add(lamp(1.2, 30, 3.4)); w.add(box(0.5, 0.3, 1.8, 6, 0.1, 16, 0.3)); w.add(box(0.12, 2.4, 0.12, 6, 1.2, 16)); w.add(box(1.6, 0.04, 0.9, 6.5, 1.6, 16, 0.3));   // a rowing boat and its mast
    for (let i = 0; i < 40; i++) { const x = -90 + (i % 14) * 4 + (i * 7) % 3, z = -12 - (i * 5) % 14; w.add(cyl(0.03, 1.6, x, 0.8, z, 4)); }   // reeds
    w.add(box(160, 1.4, 16, -40, 0.7, -60, 0.05)); w.add(box(120, 1.8, 20, 100, 0.9, -70, -0.1));   // the far shore
    for (let i = 0; i < 38; i++) w.add(tree(-140 + i * 8 + (i % 3) * 2, -72 - (i % 4) * 6, 11 + (i % 5) * 3));
    for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.65, s = 70 + (i * 41) % 60; w.add(cone(s * 0.8, s, Math.sin(a) * 260, 0, -Math.cos(a) * 260, 5)); }   // hills all round
    w.add(glow(6, 0, 14, -240, "#cfe0ff", 1.6)); w.add(cone(0.15, 6, 36, 0, 8, 4));
  } };

const mountain: Location = { name: "Mountain ridge", sky: "day", keyDir: [-0.85, 0.35, 0.3],
  light: "Low sun raking across the ridge from the left, long hard shadows, thin cold air, one bright snow face in the distance.", palette: "ice white, slate, one warm face of rock",
  build: (w) => {
    w.add(floor(1200, 1200, "#b6b7b6"));
    for (let i = 0; i < 13; i++) { const a = i * 0.5, r = 150 + (i % 4) * 50, s = 120 + (i * 37) % 120; const x = Math.sin(a * 2.0 + 0.3) * r, z = -Math.cos(a * 2.0 + 0.3) * r; w.add(cone(s * 0.55, s, x, 0, z, 5)); w.add(cone(s * 0.2, s * 0.35, x, s * 0.65, z, 5, "#e4e4e2")); w.add(cone(s * 0.3, s * 0.55, x + s * 0.4, 0, z + 14, 4)); }   // ring of peaks, snow caps
    for (let i = 0; i < 22; i++) { const a = i * 2.4, r = 9 + (i % 6) * 6; const sz = 0.9 + (i % 5) * 0.9; const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(sz, 0), M()); rock.position.set(Math.cos(a) * r, sz * 0.45, Math.sin(a) * r - 4); rock.scale.set(1.3, 0.8, 1); rock.rotation.set(a, a * 2, 0); w.add(sh(rock)); }
    w.add(box(16, 5, 3, -16, 2.5, -10, 0.5)); w.add(box(10, 2.4, 3, 20, 1.2, -16, -0.3)); for (let i = 0; i < 9; i++) w.add(box(0.5, 0.05, 1.4, i * 0.3 - 1, 0.03, 8 + i * 4, 0.2 * i));   // a ledge, a step, a footpath
    for (let i = 0; i < 6; i++) { const x = -30 + i * 6, h = 4 + (i % 3) * 2; w.add(cone(1.8, h, x, 0, -30 - (i % 2) * 5, 6)); }   // a few stunted pines
    w.add(cyl(0.05, 2.4, 3.5, 1.2, -5, 6)); w.add(box(0.5, 0.35, 0.03, 3.5, 2.3, -5));   // a trail marker
  } };

const street: Location = { name: "Night street", sky: "dusk", keyDir: [0.2, 0.2, 0.9],
  light: "Sodium amber from the street lamps, teal shade in the doorways, a lit shop front, wet road that doubles every light.", palette: "amber and teal, black asphalt, one red sign",
  build: (w) => {
    w.add(floor(16, 260, "#a7a8a8"));
    for (let z = -120; z <= 120; z += 8) w.add(box(0.18, 0.015, 3, 0, 0.01, z));   // the centre dashes
    for (let z = -118; z <= 118; z += 10) for (let k = 0; k < 6; k++) w.add(box(0.5, 0.012, 0.9, -3 + k, 0.012, z));   // a crossing every so often is too much: just paint
    for (const s of [-1, 1]) { w.add(box(5, 0.22, 260, s * 10.5, 0.11, 0)); for (let z = -116; z <= 116; z += 16) w.add(lamp(s * 8.4, z + (s > 0 ? 8 : 0), 5.4)); }
    for (let z = -110; z <= 110; z += 20) { const h = 12 + ((z / 20 + 6) % 4) * 5; w.add(tower(-18, z, 12, h, 16)); w.add(tower(18, z + 6, 12, h * 0.8, 16)); }
    w.add(box(9, 3.4, 0.4, -12.1, 2.6, -14)); w.add(box(10, 0.5, 0.6, -12, 4.6, -14)); w.add(glow(1.2, -11.6, 4.7, -13.5, "#ff5a40", 2)); for (let i = 0; i < 5; i++) w.add(box(1.4, 0.04, 0.06, -12, 1.2 + i * 0.5, -13.8));   // a shop front, its sign, shelves seen through the glass
    w.add(box(7, 0.5, 5, 12.5, 4.2, 14)); for (let i = 0; i < 3; i++) w.add(box(1.8, 1.2, 0.1, 10 + i * 2.6, 2.4, 11.6));   // a canopy and shop windows opposite
    w.add(car(-4.6, -12, 0.05)); w.add(car(4.8, 16, 3.2)); w.add(car(-4.6, 34, 0)); w.add(cyl(0.08, 5, 7.2, 2.5, -30, 8)); w.add(box(0.4, 1.1, 0.3, 7.2, 4.9, -30)); w.add(glow(0.12, 7.2, 5.3, -29.8, "#ff3a2a", 3));
    w.add(cyl(0.35, 1.0, 9.2, 0.5, 3, 12)); w.add(box(0.9, 0.9, 0.4, 9.4, 0.45, -3));   // a bin and a utility box
    for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(1 + i * 0.4, 24), M("#a0a0a0")); p.rotation.x = -Math.PI / 2; p.position.set(-5 + i * 3, 0.015, -4 + i * 5); w.add(p); }   // puddles
  } };

const forest: Location = { name: "Forest with light shafts", sky: "day", keyDir: [-0.5, 0.55, -0.6],
  light: "Low sun behind the trees, long shafts through the trunks, dust in the air, deep green shade around a warm pool of light.", palette: "moss green, gold shafts, black trunks",
  build: (w) => {
    w.add(floor(500, 500, "#aaaea8"));
    for (let i = 0; i < 90; i++) { const a = i * 2.39996, r = 7 + (i % 19) * 4.4, x = Math.cos(a) * r, z = Math.sin(a) * r - 4, h = 13 + (i % 6) * 3; w.add(cyl(0.3 + (i % 3) * 0.14, h, x, h / 2, z, 8)); for (let b = 0; b < 3; b++) w.add(box(0.1, 0.1, 2.2 + b, x + 1.0, h * (0.5 + b * 0.14), z, a + b)); if (i % 3 === 0) w.add(cone(2.8, 5, x, h - 2, z, 7)); }   // trunks with branches
    for (let i = 0; i < 7; i++) w.add(beam(new THREE.Vector3(-30 + i * 3.4, 32, -50), new THREE.Vector3(-8 + i * 3.4, 0.05, -2 + (i % 3) * 2), 1.4));
    w.add(box(8, 0.8, 1, 5, 0.4, 2, 0.6)); w.add(box(5, 1.1, 1, -6, 0.5, -5, -0.4)); w.add(box(1.4, 0.7, 5, 9, 0.35, -4, 0.2));   // fallen trunks
    for (let i = 0; i < 16; i++) { const a = i * 1.7, r = 5 + (i % 5) * 3; const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + (i % 3) * 0.35, 0), M()); m.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r); m.scale.y = 0.6; w.add(sh(m)); }   // moss rocks
    for (let i = 0; i < 12; i++) w.add(box(0.5, 0.04, 1.8, 0.2 * Math.sin(i), 0.02, 12 - i * 3.5, 0.15 * i));   // a path
  } };

const rooftop: Location = { name: "Rooftop at dusk", sky: "dusk", keyDir: [0, 0.1, -1],
  light: "Last orange light low on the horizon behind the skyline, teal sky overhead, a few windows already lit, haze between the towers.", palette: "orange horizon, teal sky, black towers",
  build: (w) => {
    w.add(floor(20, 20, "#aaaaa8", 0)); for (const [x, z, a, b] of [[0, -10, 20, 0.4], [0, 10, 20, 0.4], [-10, 0, 0.4, 20], [10, 0, 0.4, 20]] as const) w.add(box(a, 1.1, b, x, 0.55, z));   // the parapet
    for (let i = -3; i <= 3; i++) w.add(box(0.03, 0.01, 20, i * 2.8, 0.02, 0));
    w.add(cyl(1.6, 2.6, -7, 1.3, -6.5, 18)); for (let i = 0; i < 5; i++) w.add(cyl(1.65, 0.05, -7, 0.5 + i * 0.45, -6.5, 18)); w.add(cone(1.8, 1, -7, 2.6, -6.5, 18));   // a water tank with its bands and cap
    w.add(box(2.2, 2.4, 1.6, 7, 1.2, -7)); w.add(box(0.9, 2, 0.1, 7, 1.0, -6.16)); w.add(cyl(0.05, 7, 8, 3.5, 7.4, 6)); for (let i = 0; i < 4; i++) w.add(box(1.4 - i * 0.2, 0.03, 0.03, 8, 2.2 + i * 1.2, 7.4));   // a stair hut with its door, an antenna
    w.add(cyl(0.3, 1.2, 4, 0.6, 6, 14)); w.add(box(3, 0.05, 0.9, -5, 0.05, 6.5)); w.add(chair(-6.5, 5.5, 0.6)); w.add(chair(-4.5, 7, -0.4));
    for (let i = 0; i < 46; i++) { const a = -Math.PI * 1.0 + (i / 45) * Math.PI * 2.0, r = 55 + (i % 7) * 18, h = 20 + ((i * 37) % 80); w.add(tower(Math.sin(a) * r, -Math.cos(a) * r - 20, 9 + (i % 3) * 4, h, 9 + (i % 4) * 3, a)); }   // a skyline all round, with window floors
    w.add(glow(14, 0, 8, -230, "#ff9a4a", 2.2));
  } };

const road: Location = { name: "Empty road at golden hour", sky: "dusk", keyDir: [-0.2, 0.18, -0.95],
  light: "Low golden sun straight down the road, long shadows toward the camera, heat haze, dust on the air.", palette: "gold, dusty orange, pale blue sky",
  build: (w) => {
    w.add(floor(700, 700, "#b4b2ae")); w.add(box(7, 0.04, 480, 0, 0.02, -80, 0, "#a3a3a1")); for (const s of [-1, 1]) w.add(box(0.1, 0.05, 480, s * 3.2, 0.05, -80));
    for (let z = -300; z < 150; z += 9) w.add(box(0.2, 0.05, 4, 0, 0.05, z));
    for (let z = -290; z < 100; z += 30) { w.add(cyl(0.12, 9, 5.6, 4.5, z, 8)); w.add(box(2.4, 0.15, 0.15, 5.6, 8.6, z)); for (const k of [-0.9, 0, 0.9]) w.add(box(0.05, 0.3, 0.05, 5.6 + k, 8.8, z)); }   // poles with cross-arms
    w.add(box(0.12, 1.6, 0.12, -4.4, 0.8, -40)); w.add(box(1.1, 0.8, 0.05, -4.4, 1.9, -40)); w.add(box(5, 1.4, 0.2, 7, 0.9, 20)); for (let i = 0; i < 6; i++) w.add(box(0.12, 1.4, 0.12, 4.6 + i * 0.8, 0.7, 20));   // a road sign and a fence
    for (const [x, z, sx, sy] of [[-40, -60, 18, 4], [30, -90, 22, 5], [-70, -110, 30, 6], [60, -30, 14, 3], [-50, 40, 20, 4], [70, 60, 24, 5]] as const) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), M()); d.scale.set(sx, sy, sx * 0.7); d.position.set(x, sy * 0.3, z); w.add(sh(d)); }   // dunes
    w.add(box(60, 18, 14, 140, 9, -170)); w.add(box(40, 12, 12, -150, 6, -190)); w.add(box(20, 26, 12, 180, 13, 120)); w.add(box(7, 3.4, 3, 7.5, 1.7, -60)); w.add(box(1.4, 0.7, 0.6, 7.5, 0.4, -58));   // a mesa, a butte, a roadside shack
    w.add(glow(7, 4, 10, -280, "#ffc27a", 3));
  } };

const windowRoom: Location = { name: "Apartment window room", sky: "interior", keyDir: [0.1, 0.4, -1],
  light: "One big window behind the subject, a hard grey-white backlight, the room itself almost black, dust in the beam.", palette: "grey daylight, deep blue-black room",
  build: (w) => {
    w.add(room(11, 12, 3.4, "#a9a9a8")); w.add(windowFrame(0, 1.9, -5.7, 6.2, 2.1, 3, 2)); w.add(box(6.6, 0.1, 0.5, 0, 0.85, -5.5));   // the window and its sill
    w.add(beam(new THREE.Vector3(0, 1.9, -5.6), new THREE.Vector3(-1, 0.02, 2), 2.4)); w.add(beam(new THREE.Vector3(1.6, 1.9, -5.6), new THREE.Vector3(1.4, 0.02, 3), 1.2));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { w.add(box(1.3, 1.1, 0.12, -10 + c * 3.4, 4 + r * 2.1, -26)); w.add(box(1.3, 0.08, 0.2, -10 + c * 3.4, 3.4 + r * 2.1, -25.9)); }   // the block opposite, windows and sills
    w.add(box(24, 12, 0.5, 0, 6, -27)); w.add(box(5, 0.4, 0.3, 4, 12.2, -25));
    w.add(box(2.2, 0.5, 1.2, -3.6, 0.25, 2.4)); w.add(box(1.6, 0.45, 1.6, 3.8, 0.22, -2.4)); w.add(chair(3.4, 2.2, 2.6));   // a sofa, a table, a chair
    w.add(box(2.4, 2.1, 0.08, 0, 1.05, 5.9)); w.add(box(0.12, 0.12, 0.2, 0.9, 1.0, 5.8)); w.add(picture(-3.4, 1.9, 5.8, 0.9, 0.6, Math.PI)); w.add(box(0.9, 1.9, 0.5, -4.8, 0.95, 4.9)); w.add(row(-5.1, 1.9, 5.2, 6, 0.1, 0.25));   // a door, a picture, a bookcase on the back wall
    w.add(box(0.4, 0.04, 0.3, -5.3, 0.9, -1)); w.add(cyl(0.06, 1.3, -4.8, 0.65, -3.5, 8)); w.add(hang(-4.8, 1.4, -3.5));
  } };

const deskRoom: Location = { name: "Lamp-lit desk room", sky: "interior", keyDir: [0.5, 0.6, 0.2],
  light: "One warm desk lamp as the only key, green-teal wall behind, shelves and paper pinned in the dark, a cool screen glow on one side.", palette: "tungsten yellow, bottle green, black shadow",
  build: (w) => {
    w.add(room(10, 10, 3.2, "#a8aaa6"));
    w.add(box(3.8, 0.1, 1.5, 0, 0.8, -3.6)); for (const s of [-1, 1]) w.add(box(0.1, 0.8, 1.3, s * 1.8, 0.4, -3.6)); w.add(chair(0.2, -2.3, Math.PI));   // a desk and its chair
    const arm = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 14), M("#b6b6b4")); arm.position.set(1.2, 1.8, -3.3); arm.rotation.z = -0.9; w.add(sh(arm)); w.add(cyl(0.03, 1, 1.4, 1.3, -3.4, 6)); w.add(glow(0.18, 1.0, 1.7, -3.2, "#ffc060", 3)); w.add(box(0.8, 0.05, 0.5, 1.4, 0.86, -3.4));
    w.add(box(0.7, 0.55, 0.6, -1.3, 1.2, -3.9)); w.add(box(0.8, 0.5, 0.05, -1.3, 1.25, -4.0)); w.add(glow(0.24, -1.3, 1.25, -3.55, "#9fd8ff", 1.6)); w.add(box(0.5, 0.04, 0.35, -1.3, 0.86, -3.3));   // a screen and keyboard
    for (let i = 0; i < 14; i++) w.add(box(0.5 + (i % 2) * 0.3, 0.7, 0.01, -2.2 + (i % 7) * 0.7, 2.0 + Math.floor(i / 7) * 0.8, -4.92, 0.05 * i));   // notes and papers pinned all over the wall
    for (let k = 0; k < 4; k++) { w.add(box(0.5, 0.05, 4.2, -4.6, 0.5 + k * 0.7, 0.5)); w.add(row(-4.6, 0.52 + k * 0.7, -1.4, 12, 0.3, 0.45, "z")); }   // shelving with boxes and files
    w.add(box(1.1, 0.8, 1.1, 2.4, 0.4, 3)); w.add(box(0.8, 0.6, 0.8, -3, 0.3, 3.4)); w.add(box(2.4, 2.1, 0.08, 1.8, 1.05, 4.95)); w.add(picture(-1.2, 1.8, 4.9, 0.8, 1, Math.PI)); w.add(hang(-2.6, 2.4, 0.4));
  } };

const cafe: Location = { name: "Hazy café", sky: "interior", keyDir: [-0.7, 0.3, 0.1],
  light: "Tall windows on one side, a low sun full of haze and steam, long soft shafts cutting across the tables, warm dark wood behind.", palette: "honey gold, milky haze, brown shadow",
  build: (w) => {
    w.add(room(15, 13, 4.6, "#abaaa6"));
    for (let i = 0; i < 4; i++) { const z = -4.5 + i * 3.2; const f = windowFrame(0, 2.3, 0, 2.6, 3.2, 2, 3); f.rotation.y = Math.PI / 2; f.position.set(-7.45, 0, z); w.add(f); w.add(beam(new THREE.Vector3(-7.3, 2.3, z), new THREE.Vector3(2.5 + i, 0.03, z + 1.5), 1.5)); }
    for (const [x, z] of [[-3.4, -3.8], [3.2, -3], [4.4, 3.6], [-2.8, 3.8], [0.8, 5.2], [-5, 1]] as const) { w.add(cyl(0.45, 0.06, x, 0.78, z, 20)); w.add(cyl(0.05, 0.78, x, 0.39, z, 8)); for (const k of [-1, 1]) { w.add(chair(x + k * 0.85, z, k * 1.57)); } w.add(cyl(0.08, 0.18, x + 0.1, 0.9, z, 10)); }   // tables, chairs, cups
    w.add(box(5.6, 1.1, 0.8, 4.4, 0.55, -6)); w.add(box(5.6, 0.08, 0.5, 4.4, 2.2, -6.2)); w.add(box(5.6, 0.08, 0.5, 4.4, 2.8, -6.2)); w.add(row(2.2, 2.28, -6.2, 18, 0.2, 0.35)); w.add(box(0.9, 0.5, 0.7, 6.4, 1.35, -6)); w.add(cyl(0.12, 0.3, 4.2, 1.25, -6, 12));   // a counter, shelves of cups, a machine
    for (let i = 0; i < 5; i++) { w.add(cyl(0.01, 1.2, -1 + i * 1.4, 3.8, -1 + (i % 2), 4)); w.add(cyl(0.22, 0.4, -1 + i * 1.4, 3.1, -1 + (i % 2), 10)); }   // hanging plants
    w.add(box(0.5, 0.06, 5, 7.3, 0.9, 1)); w.add(box(2, 2.2, 0.08, 4.6, 1.1, 6.45)); w.add(picture(0.5, 2.2, 6.4, 1.2, 0.8, Math.PI));
  } };

const bus: Location = { name: "Bus interior", sky: "interior", keyDir: [0, 0.8, 0.1],
  light: "Flat cold fluorescent from the ceiling strip, mint-green plastic everywhere, grey daylight in the windows, a few bright reflections on the glass.", palette: "mint, teal, grey, one red pole",
  build: (w) => {
    w.add(floor(3.1, 19, "#a8adab")); w.add(box(0.1, 2.5, 19, -1.55, 1.6, 0)); w.add(box(0.1, 2.5, 19, 1.55, 1.6, 0)); w.add(box(3.1, 0.12, 19, 0, 2.9, 0)); w.add(box(3.1, 2.6, 0.1, 0, 1.6, -9.5)); w.add(box(3.1, 2.6, 0.1, 0, 1.6, 9.5));
    for (let z = -8; z <= 8; z += 2.0) for (const s of [-1, 1]) { w.add(box(0.9, 0.14, 1, s * 1.05, 0.5, z)); w.add(box(0.14, 0.9, 1, s * 1.5, 0.98, z)); w.add(box(0.9, 0.05, 0.9, s * 1.05, 0.9, z + 0.4, 0)); w.add(cyl(0.02, 2.4, s * 0.45, 1.7, z + 1.0, 6)); w.add(box(0.1, 0.5, 0.1, s * 1.05, 0.25, z)); }
    for (let z = -8.5; z <= 8.5; z += 2.0) for (const s of [-1, 1]) { w.add(box(0.03, 1.0, 1.5, s * 1.52, 1.95, z)); w.add(box(0.04, 1.1, 0.04, s * 1.5, 1.95, z + 0.75)); }
    for (let z = -8; z <= 8; z += 3) { w.add(glow(0.18, 0, 2.84, z, "#e6fff4", 1.4)); w.add(box(0.4, 0.04, 0.05, 0, 2.6, z)); w.add(box(0.03, 0.12, 0.03, 0, 2.5, z)); }   // strip lights, hanging straps
    w.add(box(1.1, 0.7, 0.05, 0, 2.3, -9.4)); w.add(box(0.6, 0.4, 0.04, 0.9, 1.4, 9.4));
  } };

const kitchen: Location = { name: "Night kitchen", sky: "interior", keyDir: [0, 0.5, -0.6],
  light: "Teal glow from the window and under-cabinet strips at the back, a warm amber pool over the cooker on the right, the rest in deep brown dark.", palette: "teal and amber split, brown cabinets, red accents",
  build: (w) => {
    w.add(room(8, 7, 2.9, "#a9a8a4")); w.add(box(7.6, 0.9, 0.7, 0, 0.45, -3.1)); w.add(box(0.7, 0.9, 4.4, 3.6, 0.45, -1)); for (let i = 0; i < 8; i++) w.add(box(0.9, 0.02, 0.02, -3.4 + i * 0.95, 0.5, -2.74));   // counters, cabinet doors
    w.add(windowFrame(-0.6, 1.75, -3.45, 2.4, 1.1, 1, 6)); w.add(box(0.9, 0.1, 0.6, -0.6, 0.97, -3.0)); w.add(cyl(0.02, 0.3, -0.3, 1.15, -3.0, 6));   // the window with blinds, a sink, a tap
    w.add(box(7.6, 0.8, 0.45, 0, 2.4, -3.2)); w.add(box(1.4, 0.7, 0.7, 3.5, 2.3, -1)); w.add(cone(0.7, 0.8, 3.5, 1.5, -1, 4)); w.add(box(0.1, 0.9, 0.1, 3.5, 2.15, -1));   // wall cabinets, hood, flue
    for (let i = 0; i < 5; i++) w.add(glow(0.06, -3 + i * 1.3, 1.99, -2.88, "#7de0ff", 3));
    w.add(box(1.0, 0.08, 0.6, 3.6, 0.96, -1.4)); for (const k of [0, 1, 2, 3]) w.add(cyl(0.12, 0.04, 3.45 + (k % 2) * 0.3, 1.0, -1.65 + Math.floor(k / 2) * 0.3, 14));   // a cooker with four rings
    w.add(row(-3.6, 0.96, -3.0, 4, 0.18, 0.3)); w.add(row(1.6, 0.96, -3.05, 5, 0.16, 0.34)); w.add(cyl(0.1, 0.3, 2.4, 1.1, -3.05, 10)); w.add(box(0.3, 0.2, 0.2, -2.2, 1.06, -3));
    w.add(box(0.9, 1.9, 0.6, -3.5, 0.95, 1.8)); w.add(box(1.0, 2.1, 0.08, 1.4, 1.05, 3.45)); w.add(picture(-1.8, 1.5, 3.4, 0.5, 0.5, Math.PI));   // a fridge, a door, a picture
    w.add(box(1.2, 0.04, 1.2, 0, 0.74, 1.2)); for (const k of [-1, 1]) for (const j of [-1, 1]) w.add(box(0.04, 0.74, 0.04, k * 0.52, 0.37, 1.2 + j * 0.52));   // a small table
  } };

const bedroom: Location = { name: "Bedroom with curtain light", sky: "interior", keyDir: [0, 0.4, -1],
  light: "Streetlight or dawn glowing through a thin patterned curtain, the bed and the subject a dark silhouette in front of it, a small warm lamp on the left.", palette: "deep brown, faded rose curtain, one warm bulb",
  build: (w) => {
    w.add(room(7.5, 9, 2.8, "#a8a7a4")); w.add(box(3.2, 1.8, 0.1, 0, 1.6, -4.3)); w.add(glow(1.4, 0, 1.6, -4.2, "#ffe9d0", 1.4));
    for (let i = 0; i < 14; i++) { w.add(box(0.2, 1.95, 0.1, -1.65 + i * 0.255, 1.6, -4.15)); w.add(box(0.14, 0.14, 0.02, -1.65 + i * 0.255, 1.3 + (i % 3) * 0.2, -4.08)); } w.add(box(3.8, 0.2, 0.3, 0, 2.72, -4.15)); w.add(box(4.4, 0.06, 0.06, 0, 2.85, -4.15));   // the folds, a pattern, a valance and a rail
    w.add(bed(0, -2.6)); w.add(box(0.5, 0.5, 0.5, -2.2, 0.25, -3.5)); w.add(cyl(0.02, 0.5, -2.2, 0.75, -3.5, 4)); w.add(cone(0.22, 0.28, -2.2, 0.95, -3.5, 14)); w.add(glow(0.12, -2.2, 1.0, -3.5, "#ffb866", 2.4));   // the bed, a bedside lamp
    w.add(chair(2.6, 1.6, 0.6)); w.add(box(1.4, 0.04, 0.5, 2.9, 0.55, 2.4)); w.add(box(1.0, 1.7, 0.5, -3.2, 0.85, 1.6)); w.add(box(0.9, 2.1, 0.08, 1.4, 1.05, 4.45)); w.add(picture(-1.4, 1.7, 4.4, 0.7, 0.5, Math.PI)); w.add(picture(-0.4, 1.9, 4.4, 0.4, 0.5, Math.PI));   // a chair, a wardrobe, a door, pictures
    w.add(beam(new THREE.Vector3(0, 1.6, -4.1), new THREE.Vector3(0.4, 0.02, 3), 2.2));
  } };

const subway: Location = { name: "Subway escalator hall", sky: "interior", keyDir: [0, 0.9, 0],
  light: "Cold cyan overhead, hard white light on the metal escalator ends, a green safety strip on the edge of every step, black tiled walls.", palette: "cyan and teal, black tile, one acid-green line",
  build: (w) => {
    w.add(floor(18, 56, "#a5a8aa")); w.add(box(0.4, 7, 56, -9, 3.5, 0)); w.add(box(0.4, 7, 56, 9, 3.5, 0)); w.add(box(18, 0.5, 56, 0, 7, 0)); w.add(box(18, 7, 0.4, 0, 3.5, 28));
    for (let z = -26; z <= 26; z += 2) { w.add(box(0.03, 7, 0.03, -8.78, 3.5, z)); w.add(box(0.03, 7, 0.03, 8.78, 3.5, z)); }   // tile joints on the walls
    for (let y = 0.6; y < 7; y += 0.6) { w.add(box(0.03, 0.03, 56, -8.78, y, 0)); w.add(box(0.03, 0.03, 56, 8.78, y, 0)); }
    for (const s of [-1, 1]) { for (let k = 0; k < 20; k++) { w.add(box(2.2, 0.22, 0.7, s * 4.4, 0.4 + k * 0.38, -6 - k * 0.7)); w.add(box(2.2, 0.025, 0.05, s * 4.4, 0.52 + k * 0.38, -6 - k * 0.7 + 0.32)); } w.add(box(0.15, 1, 15, s * 3.3, 4.7, -13)); w.add(box(0.3, 0.12, 15, s * 5.5, 4.2, -13)); w.add(box(2.4, 0.9, 1.4, s * 4.4, 0.45, -5)); }
    for (let k = 0; k < 22; k++) w.add(box(3.2, 0.2, 0.8, 0, 0.3 + k * 0.38, -6 - k * 0.72));   // the middle stair
    for (let z = -26; z <= 12; z += 6) { w.add(glow(0.5, 0, 6.7, z, "#bfefff", 1.6)); w.add(box(7, 0.06, 0.4, 0, 6.8, z)); }
    for (const s of [-1, 1]) for (let z = -2; z <= 20; z += 8) { w.add(box(0.5, 6.8, 0.5, s * 6.2, 3.4, z)); w.add(box(0.7, 0.12, 0.7, s * 6.2, 0.06, z)); }   // pillars
    w.add(box(0.25, 0.01, 12, -5.2, 6.5, -12)); w.add(glow(0.3, 4.4, 2, -2, "#b8ff90", 2)); for (const x of [-3, 0, 3]) { w.add(box(0.9, 1.1, 0.5, x, 0.55, 16)); w.add(box(0.05, 0.3, 0.7, x + 0.5, 1.2, 16)); }   // ticket gates
    w.add(box(6, 1.4, 0.1, 0, 4, 27.7)); w.add(glow(0.4, 0, 4, 27.6, "#8affc8", 2));
  } };

const bathroom: Location = { name: "Tiled bathroom", sky: "interior", keyDir: [-0.5, 0.9, 0],
  light: "A single small window high on one wall throws a warm hard beam across a pale tiled floor, everything else in soft shade, honey and cream tones.", palette: "honey, cream tile, dark brown shade",
  build: (w) => {
    w.add(room(5, 5.5, 2.7, "#b2b0ab"));
    for (let i = -2; i <= 2; i++) { w.add(box(0.02, 0.01, 5.5, i, 0.02, 0)); w.add(box(5, 0.01, 0.02, 0, 0.02, i * 1.1)); }   // tile joints
    for (let y = 0.3; y < 2.6; y += 0.3) { w.add(box(0.02, 0.02, 5.4, -2.34, y, 0)); w.add(box(0.02, 0.02, 5.4, 2.34, y, 0)); w.add(box(4.9, 0.02, 0.02, 0, y, -2.64)); }   // wall tiles
    { const f = windowFrame(0, 1.95, 0, 1.2, 0.8, 2, 2); f.rotation.y = Math.PI / 2; f.position.set(-2.45, 0, 0); w.add(f); }
    w.add(beam(new THREE.Vector3(-2.3, 1.95, 0.2), new THREE.Vector3(1.4, 0.02, 1), 1.3));
    w.add(cyl(0.3, 0.42, 1.9, 0.21, -2.1, 18)); w.add(box(0.6, 0.55, 0.22, 1.9, 0.7, -2.6)); w.add(cyl(0.3, 0.05, 1.9, 0.44, -2.1, 18));   // a toilet
    w.add(box(1.8, 0.65, 0.75, -1.5, 0.33, -2.2)); w.add(box(1.6, 0.04, 0.6, -1.5, 0.66, -2.2)); w.add(cyl(0.02, 0.3, -1.5, 0.85, -2.5, 6));   // a bath
    w.add(box(0.6, 0.12, 0.45, 0.4, 0.92, -2.5)); w.add(cyl(0.2, 0.06, 0.4, 0.96, -2.5, 16)); w.add(box(0.5, 0.7, 0.04, 0.4, 1.5, -2.62)); w.add(box(0.4, 0.5, 0.04, 0.4, 1.6, -2.6));   // a basin and a mirror
    w.add(box(0.9, 2.0, 0.08, 1.6, 1.0, 2.7)); w.add(box(0.4, 0.12, 0.2, 2.2, 1.2, 2.5)); w.add(box(0.5, 0.2, 0.4, -1.8, 0.1, 1.9)); w.add(cyl(0.25, 0.25, -2, 0.12, 1.2, 12));   // a door, towel pile, a bin
  } };

const lot: Location = { name: "Parking lot, pastel wall", sky: "day", keyDir: [0.4, 0.7, 0.5],
  light: "Flat bright overcast daylight, soft shadows, a pastel building face as the only colour, painted bay lines on grey asphalt, a lone parked car.", palette: "pale pink wall, cool grey ground, faded paint",
  build: (w) => {
    w.add(floor(220, 220, "#b0b0ae")); for (let i = -8; i <= 8; i++) w.add(box(0.12, 0.01, 5, i * 3, 0.01, -8));   // bay lines
    for (let i = -8; i <= 8; i++) w.add(box(0.12, 0.01, 5, i * 3, 0.01, 12)); w.add(box(48, 0.01, 0.12, 0, 0.01, -5.5)); w.add(box(48, 0.01, 0.12, 0, 0.01, 9.5));
    w.add(box(34, 6.8, 3, 0, 3.4, -28)); w.add(box(36, 0.5, 3.6, 0, 6.9, -28)); w.add(box(6, 4.2, 0.4, -5, 2.1, -26.4)); w.add(box(6, 4.2, 0.4, 5, 2.1, -26.4)); w.add(box(4, 0.4, 5, 0.5, 4.8, -25)); for (let i = 0; i < 6; i++) { w.add(box(0.06, 4, 0.1, -7.8 + i * 0.5, 2.1, -26.1)); w.add(box(0.06, 4, 0.1, 2.3 + i * 0.5, 2.1, -26.1)); }   // the pastel front, two glazed doors, a canopy
    for (let i = 0; i < 4; i++) { w.add(box(2.6, 1.6, 0.1, -13 + i * 6 + (i > 1 ? 14 : 0), 3.8, -26.4)); }
    w.add(car(-9, -14, 0.1)); w.add(car(11, -2, 1.7)); w.add(lamp(14, -10, 7, "#fff0d0")); w.add(lamp(-16, 6, 7, "#fff0d0")); w.add(box(0.4, 0.4, 2.4, -16, 7, 8)); w.add(box(0.7, 2, 0.2, 18, 1, 14)); w.add(box(0.4, 1.0, 0.4, 10, 0.5, 6));
    for (let i = 0; i < 8; i++) w.add(cone(0.35, 0.8, 12 + i * 0.7, 0, 6 + i * 0.4, 8, "#b8b8b6"));   // loose cones
    for (let i = 0; i < 5; i++) w.add(tree(-40 + i * 20, -50, 10)); w.add(box(50, 0.8, 1, 0, 0.4, -36));   // a hedge line and trees behind
  } };


// ---------------------------------------------------------------- the 9 sets the 24 environments needed beyond the first fifteen
const parking: Location = { name: "Parking structure", sky: "interior", keyDir: [0, 0.8, 0], light: "Crimson spill and green fluorescent strips in a concrete garage.", palette: "crimson, petrol green, black",
  build: (w) => {
    w.add(floor(46, 34, "#a2a3a2")); w.add(box(46, 0.8, 34, 0, 3.4, 0)); w.add(box(46, 3, 0.4, 0, 1.5, -17)); w.add(box(0.4, 3, 34, -23, 1.5, 0));
    for (let x = -18; x <= 18; x += 9) for (let z = -10; z <= 10; z += 10) w.add(box(0.8, 3, 0.8, x, 1.5, z));
    for (let i = -8; i <= 8; i++) { w.add(box(0.1, 0.01, 4.5, i * 2.6, 0.01, -9)); w.add(box(0.1, 0.01, 4.5, i * 2.6, 0.01, 9)); }
    for (const [x, z, c] of [[-14, -7, "#ff2a2a"], [4, -7, "#ff2a2a"], [-4, 7, "#35ff7a"], [14, 7, "#35ff7a"]] as const) { w.add(box(3.4, 0.08, 0.2, x, 2.9, z)); w.add(glow(0.3, x, 2.85, z, c, 3)); }
    w.add(car(-8, 6, 0.1)); w.add(box(7, 1.1, 0.2, 20, 0.55, 14)); for (let i = 0; i < 8; i++) w.add(box(0.12, 1.1, 0.12, 17 + i * 0.9, 0.55, 14));
  } };
const darkRoom: Location = { name: "Dark room, one light", sky: "interior", keyDir: [0, 0.3, 0.5], light: "A single small light swallowed by darkness: a CRT, a candle cluster, an amber doorway.", palette: "cobalt, amber, black",
  build: (w) => {
    w.add(room(8, 8, 2.8, "#9fa09f")); w.add(box(0.9, 0.7, 0.8, -2.8, 0.75, -3)); w.add(box(0.7, 0.55, 0.05, -2.8, 0.8, -2.58)); w.add(glow(0.36, -2.8, 0.8, -2.55, "#4a8cff", 3)); w.add(box(1.4, 0.4, 0.9, -2.8, 0.2, -3));
    w.add(box(1.6, 0.06, 0.9, 2.6, 0.75, -2.8)); w.add(cyl(0.1, 0.3, 2.6, 1.0, -2.8, 12)); for (let i = 0; i < 5; i++) { w.add(cyl(0.025, 0.12, 3.4 + (i % 3) * 0.1, 0.1, 2.6 + i * 0.12, 6)); w.add(glow(0.03, 3.4 + (i % 3) * 0.1, 0.2, 2.6 + i * 0.12, "#ffb050", 4)); }
    w.add(box(1.1, 2.2, 0.1, 3.9, 1.1, 0.5)); w.add(glow(0.5, 3.8, 1.1, 0.5, "#ffa030", 2.5)); w.add(chair(0.5, 1.8, 0.4));
  } };
const austere: Location = { name: "Austere pale-blue room", sky: "interior", keyDir: [-0.5, 0.6, 0.3], light: "Cold diffuse daylight, a curtain moving at the window.", palette: "powder blue, bone white, muted wood",
  build: (w) => {
    w.add(room(6.4, 6.4, 2.8, "#aeb4b8")); w.add(box(1.1, 0.5, 2.1, -1.8, 0.28, -2.0)); w.add(box(1.1, 0.8, 0.1, -1.8, 0.7, -3.05)); w.add(chair(1.8, -1.6, 0.4));
    w.add(box(0.08, 0.5, 0.05, 0, 2.0, -3.1)); w.add(box(0.3, 0.07, 0.05, 0, 2.2, -3.1)); { const f = windowFrame(0, 1.5, 0, 1.4, 1.5, 2, 3); f.rotation.y = Math.PI / 2; f.position.set(3.1, 0, 0.4); w.add(f); }
    w.add(box(0.06, 1.7, 0.5, 3.0, 1.0, 1.4, 0.2)); w.add(box(0.06, 1.7, 0.5, 3.0, 1.0, -0.6, -0.2)); w.add(box(0.8, 2.0, 0.08, -1.2, 1.0, 3.15)); w.add(box(0.6, 0.04, 0.4, -2.4, 0.5, -3.0)); w.add(cyl(0.06, 0.12, -1.0, 0.55, -3.0, 10));
  } };
const platform: Location = { name: "Metro platform", sky: "interior", keyDir: [0, 0.9, 0], light: "Cold cream fluorescent ceiling, ochre train streaking past, rust-red columns.", palette: "teal-green, ochre, rust red",
  build: (w) => {
    w.add(floor(12, 80, "#a6a8a4")); w.add(box(0.4, 4.6, 80, -6, 2.3, 0)); w.add(box(14, 0.5, 80, 9, -0.5, 0));
    for (let z = -34; z <= 34; z += 7) { w.add(box(0.7, 4.4, 0.7, -2.5, 2.2, z)); w.add(box(0.7, 4.4, 0.7, 2.5, 2.2, z)); w.add(box(3.6, 0.12, 0.3, 0, 4.5, z)); w.add(glow(0.25, 0, 4.45, z, "#fff3d8", 2)); }
    w.add(box(0.2, 0.05, 80, 5.3, 0.02, 0)); w.add(box(3, 3.2, 28, 11, 1.6, -4)); for (let z = -16; z <= 8; z += 4.6) w.add(box(0.05, 1, 2.6, 9.46, 1.9, z));
    w.add(box(1.6, 0.5, 4, -4.8, 0.25, 8)); w.add(box(2.4, 0.9, 0.1, 0, 3.0, -39.6));
  } };
const corridorSet: Location = { name: "Sterile corridor", sky: "interior", keyDir: [0, 0.9, 0], light: "Cream fluorescent ceiling on pale cyan glazed brick, polished floor.", palette: "pale cyan, mint, grey",
  build: (w) => {
    w.add(floor(4.4, 70, "#aeb1ad")); w.add(box(0.2, 2.8, 70, -2.2, 1.4, 0)); w.add(box(0.2, 2.8, 70, 2.2, 1.4, 0)); w.add(box(4.4, 0.2, 70, 0, 2.9, 0)); w.add(box(4.4, 2.8, 0.2, 0, 1.4, -35));
    for (let z = -32; z <= 28; z += 4) { w.add(box(0.1, 2.1, 1.0, -2.1, 1.05, z)); w.add(box(0.1, 2.1, 1.0, 2.1, 1.05, z + 2)); w.add(box(1.4, 0.05, 0.4, 0, 2.78, z + 1)); w.add(glow(0.3, 0, 2.74, z + 1, "#fff2cf", 1.8)); }
    for (let y = 0.5; y < 2.6; y += 0.5) { w.add(box(0.02, 0.02, 70, -2.08, y, 0)); w.add(box(0.02, 0.02, 70, 2.08, y, 0)); }
    w.add(box(0.8, 0.9, 0.5, 0.9, 0.45, 3)); w.add(box(0.9, 0.04, 0.5, 0.9, 0.95, 3)); for (const [x, z] of [[0.6, 2.8], [1.2, 2.8], [0.6, 3.2], [1.2, 3.2]]) w.add(cyl(0.05, 0.06, x, 0.05, z, 8));
    w.add(box(0.1, 0.5, 0.6, -2.1, 1.6, 8));
  } };
const plaza: Location = { name: "Abandoned plaza in orange dust", sky: "dusk", keyDir: [-0.4, 0.3, -0.8], light: "Burnt-orange dust, black building silhouettes, wind-driven sand.", palette: "burnt orange, terracotta, ochre",
  build: (w) => {
    w.add(floor(900, 900, "#b3a89c"));
    for (let i = 0; i < 18; i++) { const a = i * 0.7, r = 60 + (i % 5) * 28, h = 18 + (i * 29) % 70; w.add(tower(Math.sin(a) * r, -Math.cos(a) * r, 16 + (i % 3) * 8, h, 16, a * 0.4)); }
    for (let i = 0; i < 9; i++) { w.add(box(26, 0.3 * (i + 1), 1.4, -6, 0.15 * (i + 1), 26 + i * 1.4)); }   // wide steps
    w.add(box(5, 7, 1.4, 14, 3.5, -4)); w.add(box(5, 7, 1.4, 22, 3.5, -4)); w.add(box(13, 1.4, 1.4, 18, 7.6, -4));   // an industrial doorway frame
    w.add(tower(-60, -90, 30, 90, 30)); for (let i = 0; i < 12; i++) w.add(box(1.5, 1.5, 1.5, -20 + i * 4, 0.75, -20 + (i % 3) * 6, i));
  } };
const coast: Location = { name: "Coast: dunes, sea, pier", sky: "dusk", keyDir: [-0.3, 0.25, -0.9], light: "Overcast late-evening horizon, wind in the grass, stormy sea beyond.", palette: "sand, taupe, charcoal, silver",
  build: (w) => {
    w.add(floor(800, 800, "#a9a69e")); for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), M()); d.scale.set(16 + (i % 3) * 6, 2.6 + (i % 4), 9); d.position.set(-50 + i * 14, 0.5, 14 + (i % 3) * 7); w.add(sh(d)); }
    for (let i = 0; i < 70; i++) w.add(cone(0.05, 1.2 + (i % 4) * 0.3, -12 + (i * 3.7) % 28, 0, 6 + (i * 1.9) % 14, 4));
    w.add(floor(800, 400, "#8d949a", 0.02)); for (let r = 10; r <= 150; r += 10) { const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.08, 64, 1, 0, Math.PI), M("#7f868c")); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.04, -40); w.add(ring); }
    w.add(box(2.2, 0.08, 1, 3, 0.5, -3)); w.add(box(0.1, 0.5, 0.8, 2.3, 0.25, -3)); w.add(box(0.1, 0.5, 0.8, 3.7, 0.25, -3)); w.add(box(2.2, 0.5, 0.08, 3, 0.8, -3.4));
    w.add(box(2.4, 0.3, 50, 14, 0.5, -30)); for (let z = -50; z < -4; z += 3) { w.add(cyl(0.14, 2, 12.9, 0.0, z, 8)); w.add(cyl(0.14, 2, 15.1, 0.0, z, 8)); }
    w.add(box(60, 3, 4, -30, 1.5, -70)); w.add(cyl(2.5, 26, -80, 13, -120, 14)); w.add(cone(3, 4, -80, 26, -120, 14)); w.add(box(7, 8, 12, 60, 4, -100));
  } };
const hotel: Location = { name: "Pink hotel interior", sky: "interior", keyDir: [0, 0.8, 0.2], light: "Dusty rose, cream window daylight, brass elevator doors, a curtain lifting in a draft.", palette: "dusty rose, peach, burgundy",
  build: (w) => {
    w.add(floor(4.6, 36, "#b9a8a6")); w.add(box(0.2, 3, 36, -2.3, 1.5, 0)); w.add(box(0.2, 3, 36, 2.3, 1.5, 0)); w.add(box(4.6, 0.2, 36, 0, 3.1, 0));
    for (let z = -16; z <= 12; z += 4) { w.add(box(0.1, 2.2, 1.0, -2.2, 1.1, z)); w.add(box(0.1, 2.2, 1.0, 2.2, 1.1, z + 2)); w.add(hang(0, 2.9, z + 1)); }
    w.add(box(2.2, 2.4, 0.2, 0, 1.2, 12.8)); w.add(box(0.06, 2.4, 0.1, 0, 1.2, 12.65)); w.add(box(2.8, 0.2, 0.3, 0, 2.5, 12.7));
    { const f = windowFrame(0, 1.7, -17.8, 1.8, 2.2, 2, 3); w.add(f); } w.add(box(0.12, 2.2, 0.5, -1.2, 1.2, -17.4)); w.add(box(0.12, 2.2, 0.5, 1.2, 1.2, -17.4));
    w.add(box(2.6, 1.1, 0.8, -1.2, 0.55, 6)); w.add(box(0.5, 0.05, 0.4, -1.2, 1.15, 6)); w.add(box(0.3, 0.3, 0.3, -1.6, 1.3, 6.1));
  } };
const workshop: Location = { name: "Workshop under one ceiling light", sky: "interior", keyDir: [0, 1, 0], light: "A single rectangular warm ceiling fixture, a mustard-amber pool of light, dark corners.", palette: "mustard amber, olive black",
  build: (w) => {
    w.add(room(8, 7, 3, "#a5a49d")); w.add(box(1.8, 0.1, 0.5, 0, 2.9, 0)); w.add(glow(0.6, 0, 2.84, 0, "#ffd58a", 3.5));
    w.add(box(2.6, 0.9, 0.9, 0, 0.45, 1.0)); w.add(box(2.6, 0.08, 0.9, 0, 0.94, 1.0)); w.add(box(0.5, 0.08, 0.4, 0.8, 1.02, 1.0)); w.add(cyl(0.08, 0.04, -0.6, 1.0, 1.0, 12));
    w.add(box(1.2, 0.9, 0.6, -3.0, 0.45, -2.8)); w.add(box(0.7, 0.2, 0.5, -3.0, 0.95, -2.8)); w.add(cyl(0.02, 0.4, -3.4, 1.2, -2.9, 6)); w.add(cyl(0.12, 0.2, 3.0, 0.1, -2.8, 12)); w.add(box(0.5, 0.35, 0.4, 3.0, 0.2, -2.5));
    for (let i = 0; i < 4; i++) w.add(box(2.4, 0.05, 0.4, 3.6, 0.7 + i * 0.5, -1)); w.add(box(0.8, 2.0, 0.08, 1.8, 1.0, 3.45));
  } };

// ---------------------------------------------------------------- the 24 cinematic environments (references in workspace/projects/previs-templates/environments)
type Env = { id: string; set: Location; sky: Sky; keyDir?: [number, number, number]; look: { bloom: number; exposure: number } };
const ENVS: Env[] = [
  { id: "01-blue-hour-insomnia", set: bedroom, sky: "nightTeal", keyDir: [0.5, 0.35, -0.8], look: { bloom: 0.5, exposure: 0.95 } },
  { id: "02-sodium-urban-loneliness", set: street, sky: "nightAmber", look: { bloom: 0.6, exposure: 1.2 } },
  { id: "03-cold-transit-limbo", set: subway, sky: "cyanFluor", look: { bloom: 0.45, exposure: 1.15 } },
  { id: "04-domestic-midnight", set: kitchen, sky: "nightTeal", look: { bloom: 0.45, exposure: 0.95 } },
  { id: "05-obsessive-solitude", set: deskRoom, sky: "dimGreen", look: { bloom: 0.5, exposure: 1.05 } },
  { id: "06-worn-domestic-melancholy", set: bathroom, sky: "dimWarm", look: { bloom: 0.45, exposure: 1.0 } },
  { id: "07-quiet-bedroom-longing", set: bedroom, sky: "dimWarm", look: { bloom: 0.5, exposure: 1.0 } },
  { id: "08-institutional-alienation", set: bus, sky: "mint", look: { bloom: 0.35, exposure: 1.1 } },
  { id: "09-concrete-overcast", set: windowRoom, sky: "overcastCool", keyDir: [0, 0.9, 0.1], look: { bloom: 0.1, exposure: 1.0 } },
  { id: "10-hazy-cafe-nostalgia", set: cafe, sky: "dimWarm", look: { bloom: 0.6, exposure: 1.05 } },
  { id: "11-red-green-nocturnal-tension", set: parking, sky: "nightRed", look: { bloom: 0.5, exposure: 1.2 } },
  { id: "12-electric-dream-solitary-glow", set: darkRoom, sky: "nightBlue", look: { bloom: 0.6, exposure: 1.3 } },
  { id: "13-pale-blue-austerity", set: austere, sky: "paleBlue", look: { bloom: 0.12, exposure: 1.0 } },
  { id: "14-rain-teal-amber", set: windowRoom, sky: "nightTeal", keyDir: [0.3, 0.3, -0.9], look: { bloom: 0.5, exposure: 1.2 } },
  { id: "15-transit-in-motion", set: platform, sky: "mint", look: { bloom: 0.35, exposure: 1.1 } },
  { id: "16-sterile-corridor", set: corridorSet, sky: "mint", look: { bloom: 0.35, exposure: 1.1 } },
  { id: "17-orange-dust", set: plaza, sky: "orangeDust", look: { bloom: 0.25, exposure: 1.0 } },
  { id: "18-sepia-dusk", set: coast, sky: "sepia", look: { bloom: 0.1, exposure: 1.0 } },
  { id: "19-cobalt-rooftop", set: rooftop, sky: "nightBlue", look: { bloom: 0.55, exposure: 1.2 } },
  { id: "20-pastel-pink", set: hotel, sky: "pink", look: { bloom: 0.2, exposure: 1.05 } },
  { id: "21-monochrome-coastal", set: coast, sky: "mono", keyDir: [-0.2, 0.4, -0.9], look: { bloom: 0.15, exposure: 1.0 } },
  { id: "22-teal-bathroom", set: bathroom, sky: "nightTeal", look: { bloom: 0.5, exposure: 1.2 } },
  { id: "23-directional-blue-amber", set: windowRoom, sky: "nightBlue", keyDir: [0.7, 0.4, -0.5], look: { bloom: 0.5, exposure: 1.2 } },
  { id: "24-overhead-tungsten", set: workshop, sky: "dimWarm", look: { bloom: 0.6, exposure: 1.0 } },
];
export const ENVIRONMENTS: Record<string, Location> = Object.fromEntries(ENVS.map((e) => [e.id, { ...e.set, sky: MOOD_LIGHT ? e.sky : e.set.sky, keyDir: e.keyDir ?? e.set.keyDir, look: MOOD_LIGHT ? e.look : undefined, build: (w: KitWorld) => { LIGHTS.n = 0; e.set.build(w); } }]));

export const LOCATIONS: Record<string, Location> = { lake, mountain, street, forest, rooftop, road, windowRoom, deskRoom, cafe, bus, kitchen, bedroom, subway, bathroom, lot, parking, darkRoom, austere, platform, corridor: corridorSet, plaza, coast, hotel, workshop };
