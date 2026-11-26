// PRD05-SkylineDive
// Copied from engine/cinematic/src/templates/products/p05-skyline-dive.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh PRD05-SkylineDive
// PRD05-SkylineDive: one FPV take. Held over a tower's roof edge, it tips over and dives down the face, pulls out along
// the street, banks into a cafe's open window and stops in front of the pill, which stands in the window's sun.
import * as THREE from "three";
import { aimFor } from "../../framer";
import { GREY, clay } from "../../kit/clay";
import { building, chair, ground, lampPost, table } from "../../kit/props";
import type { Piece } from "../../piece";
import type { Cam } from "../../shots";
import { lerp, rng, smooth, smoother } from "../../util";
import { V, makeProduct, pillActor, type KitWorld } from "./shared";

const rad = THREE.MathUtils.degToRad;

// ---------------- the set (metres) ----------------
// The tower's face is the plane z = 0. The street runs away from it along +z, 12 m wide. The cafe is on its -x side.
const TOWER_H = 80;
const ZW = 56, WALL = -6.15;                          // the window: its centre along the street, the middle of its wall
const G0 = ZW - 7, G1 = ZW + 5;                       // the side street opposite the cafe: the low sun comes down it
const SUN: [number, number, number] = [0.94, 0.342, 0.06];   // 20 degrees up, along the side street and in through the window
const FLOOR = 0.03, TOP = FLOOR + 0.775;              // the cafe floor and the pill's tabletop
const PILL = V(-10.6, TOP, ZW - 0.45);                // the pill's base: 4.3 m inside, in the window's shaft of sun
const FACE = rad(35);                                 // the last frame looks into the room, 35 degrees off the window's axis
const F = V(-Math.cos(FACE), 0, -Math.sin(FACE));
const END = V(PILL.x - 0.62 * F.x, TOP + 0.2, PILL.z - 0.62 * F.z);   // the lens at rest: 0.62 m in front of the dot

/** a box by its extents */
function slab(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, name = "") {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), clay(color));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; m.name = name;
  return m;
}
/** a kit building on a lot, its front turned to the street */
function lot(x0: number, x1: number, z0: number, z1: number, h: number, seed: number, face: "+x" | "-x" | "+z" | "-z", name = "building") {
  const along = face === "+z" || face === "-z";
  const b = building(along ? x1 - x0 : z1 - z0, along ? z1 - z0 : x1 - x0, h, seed, seed % 2 ? GREY.light : GREY.paper);
  b.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  b.rotation.y = { "+z": 0, "+x": Math.PI / 2, "-z": Math.PI, "-x": -Math.PI / 2 }[face];
  b.name = name;
  // something on the roof, so it reads from above
  const r = rng(seed * 7 + 1), hx = lerp(x0 + 3, x1 - 3, r()), hz = lerp(z0 + 3, z1 - 3, r());
  const g = new THREE.Group(); g.name = name;
  g.add(b, slab(hx - 1.6, hx + 1.6, h + 0.5, h + 2.9, hz - 1.3, hz + 1.3, GREY.set), slab(hx + 2.4, hx + 3.6, h + 0.5, h + 1.3, hz - 0.6, hz + 0.6, GREY.mid));
  return g;
}
/** a far block: a box with ribbon windows, a cap and a roof hut */
function block(x0: number, x1: number, z0: number, z1: number, h: number, seed: number) {
  const g = new THREE.Group(); g.name = "far block";
  g.add(slab(x0, x1, 0, h, z0, z1, seed % 2 ? GREY.light : GREY.paper), slab(x0 - 0.2, x1 + 0.2, h, h + 0.5, z0 - 0.2, z1 + 0.2, GREY.set));
  for (let y = 4.4; y < h - 1.5; y += 3.4) g.add(slab(x0 - 0.04, x1 + 0.04, y - 0.45, y + 0.45, z0 - 0.04, z1 + 0.04, GREY.set));
  const r = rng(seed * 5 + 3), hx = lerp(x0 + 3, x1 - 3, r()), hz = lerp(z0 + 3, z1 - 3, r());
  g.add(slab(hx - 2, hx + 2, h + 0.5, h + 3, hz - 1.5, hz + 1.5, GREY.set));
  return g;
}
/** a shop awning on a street wall at x = `wall`, sloping down toward the street */
function awning(wall: number, z0: number, z1: number, y = 3.2) {
  const out = wall > 0 ? -1 : 1;
  const m = slab(-0.6, 0.6, -0.03, 0.03, z0, z1, GREY.paper, "awning");
  m.position.set(wall + out * 0.58, y - 0.12, (z0 + z1) / 2); m.rotation.z = -out * 0.2;
  return m;
}
/** a cafe table with chairs round it; a seat's angle runs from the table's own +z */
function cafeTable(x: number, z: number, yaw: number, seats: number[], name: string) {
  const g = new THREE.Group(); g.name = name;
  g.add(table(0.8, 0.8, 0.75));
  for (const a of seats) { const c = chair(); c.position.set(Math.sin(a) * 0.64, 0, Math.cos(a) * 0.64); c.rotation.y = a + Math.PI; g.add(c); }
  g.position.set(x, FLOOR, z); g.rotation.y = yaw;
  return g;
}

function buildCity(w: KitWorld) {
  w.add(ground(900, 0, 900, GREY.mid));

  // the tower: ledges on every floor line (they stream past the lens in the dive) and a parapet on the roof edge
  w.add(lot(-11, 11, -22, 0, TOWER_H, 5, "+z", "tower"));
  for (let y = 4.65; y < TOWER_H - 1; y += 3.4) w.add(slab(-11.2, 11.2, y - 0.1, y + 0.1, 0, 0.5, GREY.set, "tower ledge"));
  w.add(slab(-11.2, 11.2, TOWER_H + 0.5, TOWER_H + 0.8, -0.05, 0.2, GREY.set, "tower parapet"));

  // the street's two rows. A side street opens opposite the cafe, so the sun reaches the cafe's wall and window
  for (const b of [lot(6, 22, 10, 30, 22, 11, "-x"), lot(6, 22, 30, G0, 26, 18, "-x"), lot(6, 22, G1, G1 + 21, 17, 12, "-x"), lot(6, 22, G1 + 21, 110, 24, 13, "-x"),
    lot(-22, -6, 10, 29, 21, 14, "+x"), lot(-22, -6, 29, ZW - 7.5, 17, 19, "+x"), lot(-22, -6, ZW + 5.5, ZW + 28, 27, 15, "+x"), lot(-22, -6, ZW + 28, 110, 19, 16, "+x"),
    lot(-24, 24, 120, 142, 38, 17, "-z")]) w.add(b);
  // the blocks behind them (those beyond the side street kept low enough for the sun to clear)
  const far: [number, number, number, number, number][] = [
    [30, 52, 10, 30, 30], [30, 52, 30, G0, 24], [30, 52, G1, G1 + 25, 20], [30, 52, G1 + 25, 110, 26],
    [60, 84, 10, 36, 18], [60, 84, 36, G0, 27], [60, 84, G1, G1 + 23, 18], [60, 84, G1 + 23, 110, 23],
    [92, 120, 10, 34, 24], [92, 120, 34, G0, 16], [92, 120, G1, 86, 26], [92, 120, 86, 110, 20],
    [-52, -30, 10, 40, 28], [-52, -30, 40, 66, 15], [-52, -30, 66, 88, 23], [-52, -30, 88, 110, 19],
    [-84, -60, 10, 36, 20], [-84, -60, 36, 62, 31], [-84, -60, 62, 88, 17], [-84, -60, 88, 110, 25],
    [-120, -92, 10, 40, 22], [-120, -92, 40, 70, 14], [-120, -92, 70, 110, 28],
    [32, 70, 120, 142, 28], [-70, -32, 120, 142, 24],
  ];
  far.forEach(([x0, x1, z0, z1, h], i) => w.add(block(x0, x1, z0, z1, h, i + 1)));

  // pavements, a centre line, zebra crossings
  const walk = (x0: number, x1: number, z0: number, z1: number) => w.add(slab(x0, x1, 0, 0.14, z0, z1, GREY.set, "pavement"));
  walk(4.2, 6, 10, G0); walk(4.2, 6, G1, 110); walk(-6, -4.2, 10, 110); walk(-125, 125, -0.2, 1.8); walk(6, 125, 8.2, 10); walk(-125, -6, 8.2, 10);
  walk(6, 125, G0, G0 + 1.8); walk(6, 125, G1 - 1.8, G1);
  for (let z = 17; z < 108; z += 6) w.add(slab(-0.08, 0.08, 0, 0.012, z, z + 2.6, GREY.paper, "road line"));
  for (let x = -3.6; x <= 3.61; x += 0.9) w.add(slab(x - 0.25, x + 0.25, 0, 0.012, 11, 14, GREY.paper, "road line"));
  for (let z = G0 + 2.4; z <= G1 - 2.39; z += 0.9) w.add(slab(7, 10, 0, 0.012, z - 0.25, z + 0.25, GREY.paper, "road line"));

  // lamp posts, their arms over the street; awnings on the shopfronts
  for (const z of [14, 26, 38, G0 - 1.4, G1 + 3, 76, 88, 100]) { const l = lampPost(4.4); l.position.set(4.8, 0.14, z); l.rotation.y = -Math.PI / 2; l.name = "lamp post"; w.add(l); }
  for (const z of [19, 31, 43, ZW + 9, 77, 89, 101]) { const l = lampPost(4.4); l.position.set(-4.8, 0.14, z); l.rotation.y = Math.PI / 2; l.name = "lamp post"; w.add(l); }
  for (const a of [awning(6, 14.5, 19.5), awning(6, 32, 38), awning(-6, 21, 27), awning(-6, 34, 40), awning(6, G1 + 6, G1 + 12)]) w.add(a);

  buildCafe(w);
}

/** the cafe: a street-level room behind one open window (2 x 2 m, sill at 1 m), three floors above it */
function buildCafe(w: KitWorld) {
  const z0 = ZW - 7.5, z1 = ZW + 5.5, xo = -6, xi = -6.3, xb = -14.6, H = 3.5, TOPY = 14, C = GREY.paper;
  const add = (...o: THREE.Object3D[]) => o.forEach((m) => w.add(m));
  // the street wall round the window, and the window's frame and sill
  add(slab(xi, xo, 0, H, z0, ZW - 1, C, "cafe wall"), slab(xi, xo, 0, H, ZW + 1, z1, C, "cafe wall"), slab(xi, xo, 0, 1, ZW - 1, ZW + 1, C, "cafe wall"), slab(xi, xo, 3, H, ZW - 1, ZW + 1, C, "cafe wall"));
  add(slab(xi - 0.03, xo + 0.03, 1, 3, ZW - 1, ZW - 0.93, GREY.set, "window frame"), slab(xi - 0.03, xo + 0.03, 1, 3, ZW + 0.93, ZW + 1, GREY.set, "window frame"),
    slab(xi - 0.03, xo + 0.03, 2.93, 3, ZW - 0.93, ZW + 0.93, GREY.set, "window frame"), slab(xi - 0.08, xo + 0.12, 0.98, 1.05, ZW - 1.08, ZW + 1.08, GREY.set, "window frame"));
  add(slab(xi - 0.02, xo + 0.02, 0, 2.25, ZW + 2.6, ZW + 3.6, GREY.dark, "cafe door"), slab(xo, xo + 0.1, 3.12, 3.44, ZW - 2.3, ZW + 2.3, GREY.mid, "cafe sign"));
  // side and back walls, the floor, the solid back of the building
  add(slab(xb, xi, 0, H, z0, z0 + 0.3, C, "cafe wall"), slab(xb, xi, 0, H, z1 - 0.3, z1, C, "cafe wall"), slab(-22, xb, 0, H, z0, z1, C, "cafe wall"));
  add(slab(xb, xi, 0, FLOOR, z0 + 0.3, z1 - 0.3, GREY.light, "cafe floor"));
  // the floors above (their underside is the ceiling)
  add(slab(-22, xo, H, TOPY, z0, z1, GREY.light, "cafe ceiling"), slab(-22.2, xo + 0.2, TOPY, TOPY + 0.5, z0 - 0.2, z1 + 0.2, GREY.set, "cafe upper"));
  for (let y = 5.7; y < TOPY - 1; y += 3.4) {
    add(slab(-22.03, xo + 0.03, y - 1.01, y - 0.89, z0 - 0.03, z1 + 0.03, GREY.set, "cafe upper"));
    for (let c = 0; c < 5; c++) { const z = z0 + (c + 0.5) * ((z1 - z0) / 5); add(slab(xo - 0.14, xo + 0.06, y - 0.85, y + 0.85, z - 0.6, z + 0.6, GREY.dark, "cafe upper")); }
  }
  // inside: a counter and shelves on the back wall, tables and chairs
  add(slab(-13.5, -12.8, FLOOR, 1.08, ZW - 1.2, ZW + 3.6, GREY.set, "counter"), slab(-13.56, -12.74, 1.08, 1.13, ZW - 1.26, ZW + 3.66, GREY.light, "counter"));
  for (const y of [1.6, 2.1]) add(slab(xb, xb + 0.28, y, y + 0.04, ZW - 1.2, ZW + 3.6, GREY.set, "shelf"));
  const yaw = Math.atan2(F.x, F.z);
  add(cafeTable(PILL.x, PILL.z, yaw, [1.5], "pill table"));
  add(cafeTable(-7.9, ZW + 1.8, 0.2, [0.4, 2.6], "window table"), cafeTable(-7.7, ZW - 2.0, -0.3, [3.4, -1.3], "window table"), cafeTable(-11.9, ZW - 3.4, 0.5, [0, Math.PI], "table"),
    cafeTable(-8.3, ZW - 4.9, -0.2, [1.4, -1.4], "table"), cafeTable(-11.2, ZW + 3.9, 0.9, [0.3, 3.3], "table"), cafeTable(-8.1, ZW + 4.4, 0, [1.57, -1.57], "table"));
}

// ---------------- the flight path ----------------
// One uniform cubic B-spline (curvature never jumps), its ends pinned by tripled points. Read as [x, y, z].
const ARC = (deg: number, y: number): [number, number, number] => [-2.5 + 6 * Math.cos(rad(deg)), y, ZW - 6 + 6 * Math.sin(rad(deg))];
const START: [number, number, number] = [0, TOWER_H + 3.5, -0.3];
const KEYS: [number, number, number][] = [
  START, START, START,
  [0, 83.4, 1.0], [0, 82.3, 2.6], [0, 79.2, 3.55],                                  // over the roof edge
  [0, 74, 3.8], [0, 67.5, 3.8], [0, 61, 3.8], [0, 54.5, 3.8], [0, 48, 3.8], [0, 41.5, 3.8], [0, 35, 3.8], [0, 28.5, 4.0],   // down the face, 3.8 m off it
  [0, 22, 5.2], [0.05, 16, 7.9], [0.2, 10.9, 11.9], [0.5, 6.9, 16.6], [0.9, 4.3, 21.6],    // the pull-out
  [1.3, 3.05, 26.5], [1.75, 2.65, 31], [2.2, 2.52, 35.5], [2.65, 2.48, 40], [3.05, 2.45, 44.2], [3.35, 2.43, 47.6],   // level along the street, easing wide of the turn
  ARC(0, 2.4), ARC(22.5, 2.35), ARC(45, 2.25), ARC(67.5, 2.15), ARC(90, 2.07),      // the banked turn to the window
  [-4.7, 2.03, ZW], [WALL, 2.0, ZW], [-7.6, 1.82, ZW],                             // square through the opening
  [-8.8, 1.5, ZW + 0.4], [END.x - 0.8 * F.x, 1.2, END.z - 0.8 * F.z],               // past the window tables, round onto the pill
  [END.x, END.y, END.z], [END.x, END.y, END.z], [END.x, END.y, END.z],
];
const KV = KEYS.map((k) => V(...k)), SEGS = KV.length - 3;
const bspline = (u: number) => {
  const i = Math.min(SEGS - 1, Math.max(0, Math.floor(u))), k = u - i, k2 = k * k, k3 = k2 * k, j = 1 - k;
  return KV[i].clone().multiplyScalar((j * j * j) / 6).addScaledVector(KV[i + 1], (3 * k3 - 6 * k2 + 4) / 6).addScaledVector(KV[i + 2], (-3 * k3 + 3 * k2 + 3 * k + 1) / 6).addScaledVector(KV[i + 3], k3 / 6);
};
// distance along the path against its parameter
const STEPS = 96, TAB: number[] = [0];
{ let p = bspline(0); for (let n = 1; n <= SEGS * STEPS; n++) { const q = bspline(n / STEPS); TAB.push(TAB[n - 1] + q.distanceTo(p)); p = q; } }
const LEN = TAB[TAB.length - 1], TAIL = KV[KV.length - 1].clone().sub(KV[KV.length - 4]).normalize();
/** the point `s` metres along the path (past its end: straight on) */
function along(s: number) {
  if (s >= LEN) return KV[KV.length - 1].clone().addScaledVector(TAIL, s - LEN);
  let lo = 0, hi = TAB.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TAB[m] <= s) lo = m; else hi = m; }
  return bspline((lo + (Math.max(0, s) - TAB[lo]) / Math.max(1e-9, TAB[hi] - TAB[lo])) / STEPS);
}
/** how far along the path a condition first holds */
const where = (hit: (p: THREE.Vector3) => boolean) => { for (let n = 0; n < TAB.length; n++) if (hit(bspline(n / STEPS))) return TAB[n]; return LEN; };
const S_PULL = where((p) => p.y < 27), S_LEVEL = where((p) => p.y < 7), S_WIN = where((p) => p.x < WALL && p.y < 5);

// The pilot's throttle: speed keys [time, m/s], eased between (never negative), scaled so the path ends on the last key.
const T0 = 0.7, T1 = 10.1, LENGTH = 11.7;
const SPEED: [number, number][] = [[T0, 0], [1.4, 8], [2.1, 20], [2.75, 26], [4.0, 26], [4.8, 22], [5.5, 19], [6.2, 16.5], [6.9, 13.5], [7.5, 10.8], [8.1, 8.8], [8.6, 6.8], [9.1, 3.2], [9.6, 1.2], [T1, 0]];
const SLOPE = SPEED.map((k, i) => {
  if (i === 0 || i === SPEED.length - 1) return 0;
  const a = (k[1] - SPEED[i - 1][1]) / (k[0] - SPEED[i - 1][0]), b = (SPEED[i + 1][1] - k[1]) / (SPEED[i + 1][0] - k[0]);
  return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
});
/** distance flown inside speed segment i, up to share k of it */
const flown = (i: number, k: number) => {
  const h = SPEED[i + 1][0] - SPEED[i][0], k2 = k * k, k3 = k2 * k, k4 = k3 * k;
  return h * (SPEED[i][1] * (k4 / 2 - k3 + k) + SLOPE[i] * h * (k4 / 4 - (2 * k3) / 3 + k2 / 2) + SPEED[i + 1][1] * (k3 - k4 / 2) + SLOPE[i + 1] * h * (k4 / 4 - k3 / 3));
};
const CUM: number[] = [0]; for (let i = 0; i < SPEED.length - 1; i++) CUM.push(CUM[i] + flown(i, 1));
const GAIN = LEN / CUM[CUM.length - 1];
/** metres flown by film time t */
function flownAt(t: number) {
  if (t <= T0) return 0; if (t >= T1) return LEN;
  let i = 0; while (t > SPEED[i + 1][0]) i++;
  return GAIN * (CUM[i] + flown(i, (t - SPEED[i][0]) / (SPEED[i + 1][0] - SPEED[i][0])));
}

const turn = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().applyQuaternion(new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(a, b), k));

/** the take: where the lens is, where it looks, how it banks */
function flight(pill: THREE.Vector3) {
  const at = (t: number) => along(flownAt(t));
  return (t: number): Cam => {
    const s = flownAt(t), pos = along(s);
    const mm = 19 * Math.pow(26 / 19, smoother((s - S_WIN) / (LEN - S_WIN)));
    // held and diving: nose down by a set pitch, facing down the street
    const pitch = rad(lerp(-62, -85, smoother((t - T0) / 1.2)));
    const dive = V(0, Math.sin(pitch), Math.cos(pitch));
    // flying: look where the path goes, a shorter way ahead in the turn and indoors
    const lead = lerp(lerp(9, 5, smooth((s - (S_WIN - 22)) / 8)), 3, smooth((s - (S_WIN - 6)) / 6));
    const ahead = along(s + lead).add(V(0, -0.04 * lead, 0)).sub(pos).normalize();
    // landing: the pill, a little under the middle of the frame
    const land = aimFor(pos, pill, mm, [0, -0.06]).sub(pos).normalize();
    let dir = turn(dive, ahead, smoother((s - S_PULL) / (S_LEVEL - S_PULL)));
    dir = turn(dir, land, smoother((s - (S_WIN - 1)) / 3.6));
    // bank into the sideways pull, as a drone does (the pilot rolls a beat ahead of it): less indoors, none once stopped
    const right = new THREE.Vector3().crossVectors(dir, V(0, 1, 0)).normalize();
    let pull = 0;
    for (let i = -2; i <= 2; i++) { const x = t + 0.08 + i * 0.06, h = 0.08; pull += at(x + h).add(at(x - h)).addScaledVector(at(x), -2).multiplyScalar(1 / (h * h)).dot(right) / 5; }
    const indoors = 1 - 0.75 * smooth((s - (S_WIN - 3.2)) / 3);
    const roll = -rad(25) * Math.tanh((Math.atan(pull / 9.81) * 0.62) / rad(25)) * indoors * (1 - smoother((t - (T1 - 0.5)) / 0.45));
    return { pos, target: pos.clone().addScaledVector(dir, s < S_WIN - 2 ? 30 : 8), mm, roll };
  };
}

export const PIECE: Piece = makeProduct(
  { id: "PRD05-SkylineDive", name: "Skyline dive",
    says: "The whole city narrows to one object: from the skyline to a table in one breath, and the product is where it lands.",
    use: "Launches and reveals where the product is a destination: a venue, a shop, a table worth crossing a city for.",
    numbers: "One 134 m FPV path in 11.7 s, 19 mm tightening to 26 mm indoors. Holds 0.7 s, 3.5 m over the edge of an 80 m roof, looking down 62°. Dives 3.8 m off the face for 2.35 s at up to 25 m/s, nose 85° down. Pulls out to 2.4 m over the street, runs level for a second, banks 23° through a 90° turn, crosses a 2 × 2 m window square at 7 m/s with 0.9 m clear all round. Brakes over 4.2 m and stops 0.62 m from the pill at 10.1 s; the pill stands in the low sun that comes in through the same window. Still for 1.6 s.",
    avoid: "Slowing for the window, or cutting anywhere: the frame edge sells the crossing only at speed, and the take only counts unbroken. No drift in the last frame." },
  { sky: "day", build: buildCity, keyDir: SUN },
  [pillActor([PILL.x, PILL.y, PILL.z], Math.atan2(-F.x, -F.z))],
  (P) => {
    const m = P("PILL")(0), cam = flight(m.top.clone().lerp(m.sole, 0.5));
    return [{ start: 0, end: LENGTH, label: "19-26mm  SKYLINE DIVE", rig: "CINEWHOOP · KEYED PATH", subject: "PILL", size: "EWS", sizeEnd: "MS", stop: 4, shadow: 48, cam, cut: "Opens the template", flags: ["centre", "compound", "wipe"] }];
  },
);
