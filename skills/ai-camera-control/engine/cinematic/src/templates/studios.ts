// Plain indoor stages for the camera moves and angles: a blue wall with hard lights, a warm or green wall, a church-like
// nave, a concrete hall, a corridor, a loft and a hangar. Deliberately unspecific (blocks, panels, light stands): they mark
// where the walls, the lights and the far space are, and the prompt decides what everything really is. Subjects stand at
// the origin; every stage is clear of walls for at least 12 m round it.
import * as THREE from "three";
import { clay, GREY } from "../kit/clay";
import type { KitWorld } from "../kit/stage";
import { ENVIRONMENTS } from "./locations";
import { ENVIRONMENT_MOODS } from "./environments.generated";

const M = (hex: string, r = 0.95) => clay(hex, r);
const sh = <T extends THREE.Object3D>(o: T) => { o.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };
const box = (w: number, h: number, d: number, hex: string, x: number, y: number, z: number, ry = 0, r = 0.95) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(hex, r)); m.position.set(x, y, z); m.rotation.y = ry; return sh(m); };
const cyl = (r: number, h: number, hex: string, x: number, y: number, z: number, seg = 24) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), M(hex)); m.position.set(x, y, z); return sh(m); };
const floorOf = (w: number, d: number, hex: string) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(hex, 0.92)); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; return f; };
/** four walls round a w x d floor, h high, with a skin of tint on each */
function walls(w: number, d: number, h: number, hex: string, o: { n?: string; s?: string; e?: string; wst?: string } = {}) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.4, o.n ?? hex, 0, h / 2, -d / 2), box(w, h, 0.4, o.s ?? hex, 0, h / 2, d / 2), box(0.4, h, d, o.e ?? hex, w / 2, h / 2, 0), box(0.4, h, d, o.wst ?? hex, -w / 2, h / 2, 0));
  return g;
}
/** a hard light on a stand: pole, tripod feet, a head turned at (ax, az), and a bright disc that reads as the lamp */
function lightStand(x: number, z: number, ax = 0, az = 0, h = 2.7) {
  const g = new THREE.Group();
  g.add(cyl(0.03, h, GREY.dark, 0, h / 2, 0, 10));
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = box(0.7, 0.03, 0.04, GREY.ink, Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3, -a); g.add(leg); }
  const head = new THREE.Group();
  head.add(box(0.55, 0.45, 0.4, GREY.ink, 0, 0, 0));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.2, 28), clay(GREY.paper, 0.6, { emissive: "#ffffff", ei: 2.2 })); disc.position.set(0, 0, 0.21); disc.userData.noPathTrace = true; head.add(disc);
  head.position.set(0, h, 0); head.lookAt(new THREE.Vector3(ax - x, h * 0.55, az - z)); g.add(head);
  g.position.set(x, 0, z); return sh(g);
}
/** a black flag on a stand */
const flag = (x: number, z: number, ry: number) => { const g = new THREE.Group(); g.add(cyl(0.025, 2.2, GREY.dark, 0, 1.1, 0, 8), box(1.2, 1.2, 0.03, GREY.ink, 0, 1.9, 0)); g.position.set(x, 0, z); g.rotation.y = ry; return sh(g); };

type Set = { build: (w: KitWorld) => void; sky: "studio" | "interior" };

const studio = (wall: string, floor: string, accent?: string): Set => ({ sky: "studio", build: (w) => {
  w.add(floorOf(34, 34, floor)); w.add(walls(34, 34, 12, wall, { n: accent ?? wall }));
  for (const [x, z] of [[-9, 8], [9, 8], [-10, -9], [10, -9]]) w.add(lightStand(x, z, 0, 0));
  w.add(flag(-12, 2, 0.4)); w.add(flag(12, 3, -0.4));
  w.add(box(0.6, 0.4, 0.4, GREY.set, 7, 0.2, 5, 0.3)); w.add(box(0.6, 0.4, 0.4, GREY.set, 7.5, 0.6, 5.2, 0.2)); w.add(box(0.6, 0.4, 0.4, GREY.set, -8, 0.2, -4, 0.5));
} });

const church: Set = { sky: "interior", build: (w) => {
  const stone = "#b7b1a6", tint = "#aaa59b";
  w.add(floorOf(15, 46, "#a9a498")); w.add(walls(15, 46, 13, stone));
  const ceil = box(15, 0.5, 46, tint, 0, 13.1, 0); w.add(ceil);
  for (let z = -18; z <= 18; z += 4) for (const s of [-1, 1]) { w.add(cyl(0.46, 11, stone, s * 4.2, 5.5, z)); w.add(box(1.0, 0.4, 1.0, tint, s * 4.2, 11.2, z)); }
  for (let z = -18; z <= 18; z += 4) w.add(box(8.6, 0.5, 0.5, tint, 0, 11.5, z));      // a beam across the nave at each pair
  for (const s of [-1, 1]) for (let z = -16; z <= 16; z += 8) { const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5), clay("#f3efe6", 0.6, { emissive: "#fff6e8", ei: 1.4 })); win.position.set(s * 7.2, 8, z); win.rotation.y = -s * Math.PI / 2; win.userData.noPathTrace = true; w.add(win); }
  for (let i = 0; i < 4; i++) w.add(box(15, 0.35 + i * 0.35, 2.5 - i * 0.5, tint, 0, (0.35 + i * 0.35) / 2, -22.8 + 1.25 + i * 0.5));   // altar steps
  for (let z = 6; z <= 20; z += 1.8) for (const s of [-1, 1]) w.add(box(2.6, 0.9, 0.5, "#9c9488", s * 2.1 * 1.1 + s * 0.6, 0.45, z));   // pews, two blocks
  w.add(lightStand(-2.5, 6, 0, 0, 3)); w.add(lightStand(2.5, 6, 0, 0, 3));
} };

const hall: Set = { sky: "interior", build: (w) => {
  w.add(floorOf(60, 80, "#a2a3a2")); w.add(walls(60, 80, 16, "#aeb0b0"));
  w.add(box(60, 0.6, 80, "#8f9190", 0, 16.3, 0));
  for (let x = -18; x <= 18; x += 12) for (let z = -30; z <= 30; z += 12) w.add(box(0.7, 15, 0.7, "#8c8e8e", x, 7.5, z));
  for (let z = -30; z <= 30; z += 12) w.add(box(60, 0.8, 0.5, "#7e8080", 0, 15.2, z));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(36, 8), clay("#eaf0f4", 0.6, { emissive: "#eef4ff", ei: 1.3 })); win.position.set(0, 8.5, -39.7); win.userData.noPathTrace = true; w.add(win);
  for (const [x, z] of [[-20, 20], [-19, 21.5], [20, 18], [22, 24]]) w.add(box(1.4, 1.4, 1.4, GREY.set, x, 0.7, z, 0.3));
  for (const [x, z] of [[-6, 7], [6, 7], [-8, -8], [8, -8]]) w.add(lightStand(x, z, 0, 0, 3));
} };

const corridor: Set = { sky: "interior", build: (w) => {
  w.add(floorOf(12, 80, "#a9a8a4")); w.add(walls(12, 80, 5.4, "#bdbbb4")); w.add(box(12, 0.4, 80, "#c9c8c2", 0, 5.6, 0));
  for (let x = -5; x <= 5; x += 2.5) w.add(box(0.05, 0.01, 80, "#8f8e89", x, 0.01, 0));             // floor lines that run the length of the hall
  for (let z = -36; z <= 36; z += 6) for (const s of [-1, 1]) w.add(box(0.1, 2.6, 1.6, "#8a8984", s * 5.9, 1.3, z));   // doors
  for (let z = -37; z <= 37; z += 5) { const l = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.4), clay("#ffffff", 0.5, { emissive: "#ffffff", ei: 1.6 })); l.position.set(0, 5.35, z); l.userData.noPathTrace = true; w.add(l); }
} };

const loft: Set = { sky: "interior", build: (w) => {
  w.add(floorOf(30, 24, "#a8a29a")); w.add(walls(30, 24, 7, "#cfcdc7")); w.add(box(30, 0.4, 24, "#d4d2cc", 0, 7.2, 0));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), clay("#f2f6fa", 0.6, { emissive: "#f5f9ff", ei: 1.5 })); win.position.set(0, 3.8, -11.7); win.userData.noPathTrace = true; w.add(win);
  w.add(box(2.6, 0.8, 1.0, "#8d8a85", -7, 0.4, -4, 0.2)); w.add(box(1.8, 0.7, 0.9, "#9a968f", 6, 0.35, -3, -0.3)); w.add(box(0.6, 2.4, 3, "#938f89", -14.4, 1.2, 4));
  for (const [x, z] of [[-9, 6], [9, 6]]) w.add(lightStand(x, z, 0, 0, 2.6));
} };

const hangar: Set = { sky: "interior", build: (w) => {
  w.add(floorOf(76, 100, "#a5a7a8")); w.add(walls(76, 100, 30, "#a9acad")); w.add(box(76, 0.8, 100, "#8e9091", 0, 30.4, 0));
  for (let z = -40; z <= 40; z += 16) w.add(box(76, 1.0, 0.8, "#7c7e7f", 0, 28, z));
  const door = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), clay("#e8eef2", 0.6, { emissive: "#eef4fb", ei: 1.1 })); door.position.set(0, 9.5, -49.7); door.userData.noPathTrace = true; w.add(door);
  for (let i = 0; i < 3; i++) w.add(box(4, 2.6, 12, "#98908a", -22, 1.3 + i * 2.6, 0));        // a stack of containers at the west side
  for (const [x, z] of [[18, 14], [20, 16], [-16, -20], [24, -18]]) w.add(box(6, 2.6, 2.4, "#9a928c", x, 1.3, z, 0.2));
  for (const [x, z] of [[-7, 6], [7, 6]]) w.add(lightStand(x, z, 0, 0, 3.2));
} };

const blue = studio("#8b9bb0", "#8f9298", "#7f93ad"), warm = studio("#b8a898", "#9d9890"), green = studio("#9aab98", "#989a93");
const SET: Record<string, Set> = { blue, warm, green, church, hall, corridor, loft, hangar };

const ENV: Record<string, keyof typeof SET> = {
  "CAM17": "blue", "CAM18": "church", "CAM19": "hall", "CAM20": "warm", "CAM21": "blue", "CAM22": "green", "CAM23": "loft", "CAM24": "warm", "CAM25": "hall", "CAM26": "blue", "CAM27": "corridor", "CAM28": "green", "CAM29": "church",
  "CAM30": "warm", "CAM31": "hangar", "CAM32": "corridor", "CAM33": "corridor", "CAM34": "hall", "CAM35": "loft", "CAM36": "blue", "CAM37": "green", "CAM38": "warm", "CAM39": "church", "CAM40": "blue", "CAM41": "hangar", "CAM42": "hangar", "CAM43": "hangar", "CAM44": "hangar",
  "CAM45": "hall", "CAM46": "loft", "CAM47": "warm", "CAM48": "green",
  "ANG01": "hangar", "ANG02": "blue", "ANG03": "warm", "ANG04": "green", "ANG05": "loft", "ANG06": "church", "ANG07": "hall", "ANG08": "blue", "ANG10": "warm", "ANG11": "hangar", "ANG12": "hall", "ANG13": "green", "ANG14": "loft", "ANG15": "church", "ANG16": "blue", "ANG17": "warm", "ANG18": "hall",
  "ANG20": "corridor", "ANG21": "green", "ANG22": "loft", "ANG23": "corridor", "ANG24": "corridor", "ANG25": "hall", "ANG26": "hangar", "ANG27": "hangar", "ANG30": "blue", "ANG31": "green", "ANG32": "corridor", "ANG33": "loft", "ANG34": "warm", "ANG35": "church", "ANG36": "hall", "ANG37": "church", "ANG38": "church", "ANG39": "corridor", "ANG40": "blue",
};
/** No place at all: a flat light floor to the horizon with a faint 1 m grid so camera travel still reads from parallax.
 *  The prompt, not the set, decides where the scene is. (The rooms above are kept for reference; stageFor no longer uses them.) */
const neutral: Set = { sky: "studio", build: (w) => {
  w.add(floorOf(600, 600, "#b4b4b2"));
  // ground lines every 3 m (thin slabs, so the ink draws them): the floor reads and the camera's travel shows
  for (let v = -48; v <= 48; v += 6) { w.add(box(0.025, 0.02, 120, "#a5a5a3", v, 0.01, 0, 0, 1)); w.add(box(120, 0.02, 0.025, "#a5a5a3", 0, 0.01, v, 0, 1)); }
  // a few loose masses at different distances: only enough to say "there is space here", never a recognisable place.
  // The prompt decides what they are. Every direction has something, nothing sits within 9 m of the middle.
  const masses: [number, number, number, number, number, number][] = [   // x, z, width, height, depth, turn
    [-16, -22, 6, 14, 5, 0.2], [-8, -34, 9, 7, 6, -0.1], [9, -30, 5, 19, 5, 0.15], [22, -18, 8, 5, 12, 0.5], [30, 6, 6, 11, 6, 0.3],
    [24, 24, 10, 6, 5, -0.3], [4, 30, 5, 16, 5, 0.1], [-14, 26, 9, 5, 7, 0.4], [-28, 10, 6, 12, 8, -0.2], [-26, -8, 12, 4, 5, 0.1],
  ];
  for (const [x, z, bw, bh, bd, ry] of masses) w.add(box(bw, bh, bd, "#b0b0ae", x, bh / 2, z, ry, 1));
  for (const [x, z, r, h] of [[-4, -26, 2.2, 16], [14, 18, 3, 7], [-20, 20, 1.6, 12], [26, -30, 2.4, 9]] as const) w.add(cyl(r, h, "#b3b3b1", x, h / 2, z, 20));
  // one opening to look through (two piers and a lintel) and one run of steps
  w.add(box(2, 8, 2.4, "#aaaaa8", 11, 4, -12, 0.35, 1)); w.add(box(2, 8, 2.4, "#aaaaa8", 17, 4, -12, 0.35, 1)); w.add(box(9, 1.6, 2.4, "#aaaaa8", 14, 8.8, -12, 0.35, 1));
  for (let i = 0; i < 5; i++) w.add(box(10, 0.35 * (i + 1), 1.2, "#b2b2b0", -12, 0.175 * (i + 1), 12 + i * 1.2, 0.2, 1));
  // a little nearer, for scale and parallax
  for (const [x, z, s, ry] of [[7, 5, 1.1, 0.4], [-8, 4, 0.8, 0.9], [6, -8, 1.4, 0.2], [-6, -9, 0.9, -0.5]] as const) w.add(box(s, s, s, "#acacaa", x, s / 2, z, ry, 1));
} };
/** which environment (one of the 24 references) each move and angle is shot in: chosen for what its light and space give that camera job */
const PLACE: Record<string, string> = {
  CAM17: "07", CAM18: "05", CAM19: "03", CAM20: "09", CAM21: "02", CAM22: "16", CAM23: "10", CAM24: "24", CAM25: "17", CAM26: "20", CAM27: "12", CAM28: "23", CAM29: "09",
  CAM30: "15", CAM31: "06", CAM32: "02", CAM33: "16", CAM34: "18", CAM35: "02", CAM36: "15", CAM37: "01", CAM38: "22", CAM39: "19", CAM40: "03", CAM41: "21", CAM42: "17", CAM43: "19", CAM44: "18",
  CAM45: "02", CAM46: "04", CAM47: "14", CAM48: "11",
  ANG01: "17", ANG02: "18", ANG03: "17", ANG04: "02", ANG05: "05", ANG06: "10", ANG07: "07", ANG08: "22", ANG10: "23", ANG11: "01", ANG12: "11", ANG13: "09", ANG14: "04", ANG15: "16", ANG16: "12", ANG17: "14",
  ANG18: "15", ANG20: "21", ANG21: "20", ANG22: "03", ANG23: "08", ANG24: "16", ANG25: "11", ANG26: "02", ANG27: "18", ANG30: "04", ANG31: "24", ANG32: "18", ANG33: "23", ANG34: "19", ANG35: "17",
  ANG36: "06", ANG37: "03", ANG38: "20", ANG39: "16", ANG40: "13",
};
const envId = (id: string) => { const n = PLACE[id.split("-")[0]]; return n ? Object.keys(ENVIRONMENTS).find((k) => k.startsWith(n + "-")) : undefined; };
/** the stage for a template id (CAM17-..., ANG05-...): the 3D set of its environment */
export const stageFor = (id: string): Set => (ENVIRONMENTS[envId(id) ?? "02-sodium-urban-loneliness"] ?? { sky: neutral.sky, build: neutral.build }) as unknown as Set;
/** the environment of a template: its id, name, mood, and the reference sheet to pass with the video prompt */
export const placeFor = (id: string) => { const k = envId(id); return k ? { id: k, name: ENVIRONMENT_MOODS[k].name, mood: ENVIRONMENT_MOODS[k].mood, reference: `environments/${k}.png` } : undefined; };
void SET; void ENV;
