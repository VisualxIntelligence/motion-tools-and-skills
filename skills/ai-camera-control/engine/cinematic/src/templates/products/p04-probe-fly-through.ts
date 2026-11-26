// PRD04-ProbeFlyThrough: a probe lens flies low through a canyon of ingredients, slaloms two tall cylinders, passes
// under an arch of two slices and swings out to the hero frame of the pill.
// The world is built 5 times life size (the pill is 1.2 m), so the lens can pass 2 to 3 cm (real) from things without
// the 5 cm near plane cutting them. Every number in this file is built metres; divide by 5 for the real tabletop.
import * as THREE from "three";
import { speedRamp } from "../../kit/stage";
import { GREY, clay } from "../../kit/clay";
import { aimFor } from "../../framer";
import { rng, smoother } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { V, makeProduct, pillActor, studioFloor, type KitWorld } from "./shared";

const K = 5;                                                        // built size over real size
const UP = V(0, 1, 0), PILL_MID = V(0, 0.6, 0);
const sm = (t: number, a: number, b: number) => smoother((t - a) / (b - a));

// ---- the path, drawn from its curvature so every bend eases in and out ----
// each turn: [degrees (+ is left), where its middle is along the path, how long it takes], metres. A bend right then a
// bend left make the S through the canyon; the arch stands on the straight after them; the last turn is the hook that
// swings across the pill's front and backs away to the hero position.
const TURNS: [number, number, number][] = [[-53, 1.35, 2.5], [36, 3.6, 2.0], [150, 7.2, 2.4]];
const HEAD0 = 41, LEN = 8.55, S_ARCH = 5.5, LENS_Y = 0.15, HERO = V(0, 0.38, 3.1), DS = 0.0005;
const PATH = (() => {
  const rad = THREE.MathUtils.degToRad, n = Math.round(LEN / DS), pts = [V(0, 0, 0)];
  const bend = (s: number) => TURNS.reduce((k, [d, c, w]) => { const u = (s - c) / w + 0.5; return k + (u > 0 && u < 1 ? (rad(d) / w) * (1 - Math.cos(2 * Math.PI * u)) : 0); }, 0);
  for (let i = 0, th = rad(HEAD0), x = 0, z = 0; i < n; i++) { const k = bend((i + 0.5) * DS), m = th + (k * DS) / 2; x -= Math.sin(m) * DS; z -= Math.cos(m) * DS; th += k * DS; pts.push(V(x, 0, z)); }
  // moved so it ends on the hero position; low through the canyon, rising from just past the arch
  const end = pts[n].clone();
  pts.forEach((p, i) => p.sub(end).add(HERO).setY(LENS_Y + (HERO.y - LENS_Y) * smoother((i * DS - S_ARCH - 0.1) / (LEN - S_ARCH - 0.1))));
  return pts;
})();
function along(s: number) { const x = Math.min(LEN, Math.max(0, s)) / DS, i = Math.min(PATH.length - 2, Math.floor(x)); return PATH[i].clone().lerp(PATH[i + 1], x - i); }
/** the path's right-hand side on the table at s */
const rightAt = (s: number) => along(s + 0.02).sub(along(s - 0.02)).setY(0).normalize().cross(UP).normalize();

// ---- the timing: held, eased up to a cruise, fastest under the arch, braked through the hook to a dead stop ----
const T0 = 0.6, T_ARCH = 4.65, T1 = 7.4, END = 9;
const RUN = speedRamp([[T0, 0], [1.5, 1.36], [3.85, 1.36], [T_ARCH, 1.85], [5.1, 1.55], [5.6, 1.2], [6.3, 0.95], [7.0, 0.5], [T1, 0]]);
const sAt = (t: number) => (LEN * RUN(Math.min(Math.max(t, 0), T1))) / RUN(T1);
const posAt = (t: number) => along(sAt(t));

// ---- the camera ----
const MM0 = 16, MM1 = 24, AHEAD = 1.4, BANK = THREE.MathUtils.degToRad(13), A_REF = 1.3;
/** sideways acceleration of the lens (m/s², + to its right), averaged over a quarter second: what the bank follows */
function lateral(t: number) {
  const h = 0.12; let a = 0;
  for (let i = -2; i <= 2; i++) {
    const x = t + i * 0.06, p0 = posAt(x - h), p1 = posAt(x), p2 = posAt(x + h), v = p2.clone().sub(p0).setY(0);
    if (v.lengthSq() < 1e-10) continue;
    a += p2.add(p0).sub(p1.multiplyScalar(2)).multiplyScalar(1 / (h * h)).dot(v.normalize().cross(UP)) / 5;
  }
  return a;
}
function camAt(t: number): Cam {
  const s = sAt(t), pos = along(s), mm = MM0 * Math.pow(MM1 / MM0, sm(t, 5.2, T1));
  // the aim: down the path through the canyon, handed to the pill before the arch so it stands in the opening
  const w = sm(t, 3.5, 4.8), toPill = aimFor(pos, PILL_MID, mm, [0, 0.02]).sub(pos).normalize();
  let dir = toPill;
  if (w < 1) {
    const a = along(s + AHEAD); a.y = pos.y + 0.03;
    dir = a.sub(pos).normalize();
    if (w > 0) dir.applyQuaternion(new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(dir, toPill), w));
  }
  // banks into each bend of the canyon, level again before the arch
  const roll = -BANK * Math.tanh(lateral(t) / A_REF) * sm(t, T0, T0 + 0.5) * (1 - sm(t, 4.5, 5.0));
  return { pos, target: pos.clone().add(dir.multiplyScalar(3)), mm, roll };
}

// ---- the solids: one description gives the mesh, the distance to a point and the points that test for overlap ----
type Solid = { c: THREE.Vector3; br: number; sd: (p: THREE.Vector3) => number; pts: THREE.Vector3[]; mesh: () => THREE.Object3D; /** a ball's radius: its overlap test is exact */ ball?: number };
const _v = new THREE.Vector3();
const shade = <T extends THREE.Mesh>(m: T) => { m.castShadow = m.receiveShadow = true; return m; };
function solid(c: THREE.Vector3, q: THREE.Quaternion, br: number, local: (x: number, y: number, z: number) => number, pts: THREE.Vector3[], geo: () => THREE.BufferGeometry, mat: THREE.Material | THREE.Material[]): Solid {
  const qi = q.clone().invert();
  return {
    c, br, sd: (p) => { _v.copy(p).sub(c).applyQuaternion(qi); return local(_v.x, _v.y, _v.z); },
    pts: pts.map((p) => p.applyQuaternion(q).add(c)),
    mesh: () => { const m = shade(new THREE.Mesh(geo(), mat)); m.position.copy(c); m.quaternion.copy(q); return m; },
  };
}
const Q0 = new THREE.Quaternion();
/** a berry: a ball of radius r resting at (x, z), its base at y0 */
function ball(x: number, z: number, r: number, tone: string = GREY.mid, y0 = 0) {
  const pts = Array.from({ length: 40 }, (_, i) => { const y = 1 - (2 * (i + 0.5)) / 40, a = i * 2.39996, k = Math.sqrt(1 - y * y); return V(Math.cos(a) * k * r, y * r, Math.sin(a) * k * r); });
  return { ...solid(V(x, y0 + r, z), Q0, r, (px, py, pz) => Math.hypot(px, py, pz) - r, pts, () => new THREE.SphereGeometry(r, 48, 28), clay(tone, 0.9)), ball: r };
}
/** a cube with rounded edges, side 2a (ice) */
function roundBox(a: number, rr: number, seg: number) {
  const g = new THREE.BoxGeometry(2 * a, 2 * a, 2 * a, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal, v = new THREE.Vector3(), q = new THREE.Vector3(), k = a - rr;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); q.copy(v).clampScalar(-k, k); v.sub(q).normalize(); n.setXYZ(i, v.x, v.y, v.z); p.setXYZ(i, q.x + v.x * rr, q.y + v.y * rr, q.z + v.z * rr); }
  return g;
}
function cube(x: number, z: number, a: number, yaw: number, y0 = 0, tone: string = GREY.paper) {
  const rr = a * 0.22, k = a - rr, g = roundBox(a, rr, 3).attributes.position;
  const pts = Array.from({ length: g.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(g, i));
  const local = (px: number, py: number, pz: number) => { const qx = Math.abs(px) - k, qy = Math.abs(py) - k, qz = Math.abs(pz) - k; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - rr; };
  return solid(V(x, y0 + a, z), new THREE.Quaternion().setFromAxisAngle(UP, yaw), a * 1.6, local, pts, () => roundBox(a, rr, 8), clay(tone, 0.82));
}
/** a cylinder of radius R and half-length h about `axis`, centred on c: a slice when flat, a column when tall */
function cyl(c: THREE.Vector3, axis: THREE.Vector3, R: number, h: number, side: string = GREY.set, face: string = GREY.paper) {
  const pts: THREE.Vector3[] = [];
  for (let y = -h; y <= h + 1e-6; y += (2 * h) / Math.max(1, Math.ceil((2 * h) / 0.16))) for (let i = 0; i < 24; i++) pts.push(V(Math.cos(i * 0.2618) * R, y, Math.sin(i * 0.2618) * R));
  for (const y of [-h, h]) { pts.push(V(0, y, 0)); for (let i = 0; i < 8; i++) pts.push(V(Math.cos(i * 0.785) * R * 0.55, y, Math.sin(i * 0.785) * R * 0.55)); }
  const local = (px: number, py: number, pz: number) => { const dx = Math.hypot(px, pz) - R, dy = Math.abs(py) - h; return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)); };
  return solid(c, new THREE.Quaternion().setFromUnitVectors(UP, axis.clone().normalize()), Math.hypot(R, h), local, pts, () => new THREE.CylinderGeometry(R, R, 2 * h, 72), [clay(side, 0.9), clay(face, 0.9), clay(face, 0.9)]);
}
/** a bean: a small capsule lying on the table */
function bean(x: number, z: number, yaw: number, r = 0.032, h = 0.03) {
  const pts = [V(0, h + r, 0), V(0, -h - r, 0)]; for (const y of [-h - r * 0.7, -h, 0, h, h + r * 0.7]) for (let i = 0; i < 8; i++) { const k = Math.abs(y) > h ? 0.71 * r : r; pts.push(V(Math.cos(i * 0.785) * k, y, Math.sin(i * 0.785) * k)); }
  const local = (px: number, py: number, pz: number) => Math.hypot(px, py - Math.min(h, Math.max(-h, py)), pz) - r;
  return solid(V(x, r, z), new THREE.Quaternion().setFromUnitVectors(UP, V(Math.sin(yaw), 0, Math.cos(yaw))), h + r, local, pts, () => new THREE.CapsuleGeometry(r, 2 * h, 6, 16), clay(GREY.mid, 0.85));
}
/** a slice standing on its rim at (x, z), its faces turned to `yaw` */
const upright = (x: number, z: number, R: number, yaw: number, h = 0.035) => cyl(V(x, R, z), V(Math.sin(yaw), 0, Math.cos(yaw)), R, h);
/** a slice leaning `lean` radians off upright toward d (a unit vector on the table); `foot` is where its lower face meets the table */
function leaner(foot: THREE.Vector3, d: THREE.Vector3, R: number, lean: number, h = 0.035) {
  const c = foot.clone().addScaledVector(d, R * Math.sin(lean) - h * Math.cos(lean)); c.y = R * Math.cos(lean) + h * Math.sin(lean);
  return cyl(c, d.clone().multiplyScalar(Math.cos(lean)).addScaledVector(UP, -Math.sin(lean)), R, h);
}
/** a slice leaning on a stack of two cubes (the top cube's edge holds it above its middle, so it cannot tip over) */
function leanOnCubes(foot: THREE.Vector3, d: THREE.Vector3, R = 0.32, lean = 0.44, a1 = 0.15, a2 = 0.115) {
  const yaw = Math.atan2(d.x, d.z), u = 2 * (a1 + a2) * Math.tan(lean) + a2 - a2 * 0.06, c = foot.clone().addScaledVector(d, u);
  return [leaner(foot, d, R, lean), cube(c.x, c.z, a1, yaw), cube(c.x, c.z, a2, yaw, 2 * a1)];
}
const column = (x: number, z: number, R: number, height: number) => cyl(V(x, height / 2, z), UP, R, height / 2, GREY.set, GREY.set);

// ---- the layout, made once: set pieces by hand, then rows of ingredients that hug the path at a set clearance ----
const PTS = Array.from({ length: Math.ceil(LEN / 0.02) + 1 }, (_, i) => along(i * 0.02));
const GAP = 0.006;
const pathClear = (a: Solid) => { let m = 1e9; for (const p of PTS) { if (p.distanceTo(a.c) - a.br > m) continue; m = Math.min(m, a.sd(p)); } return m; };
const apart = (a: Solid, b: Solid): boolean => a.c.distanceTo(b.c) > a.br + b.br + GAP || (a.ball ? b.sd(a.c) > a.ball + GAP : b.ball ? apart(b, a) : a.pts.every((p) => b.sd(p) > GAP) && b.pts.every((p) => a.sd(p) > GAP));
/** the ground kept open by hand: what the hero frame sees in front of and beside the pill */
const inClearing = (x: number, z: number) => z < HERO.z + 0.3 && z > -2.4 && Math.abs(x) < 0.5 + 0.8 * (HERO.z + 0.3 - z);
let LAYOUT: Solid[] | null = null;
function layout(): Solid[] {
  if (LAYOUT) return LAYOUT;
  const S: Solid[] = [], r = rng(29), R = (a: number, b: number) => a + (b - a) * r();
  const ok = (g: Solid[], clear: number) => g.every((a) => pathClear(a) >= clear && S.every((b) => apart(a, b)));
  const put = (g: Solid[]) => { S.push(...g); return g; };
  /** slide a group out from the path at s until it clears the lens by `clear` and touches nothing */
  const hug = (s: number, side: number, clear: number, off0: number, make: (x: number, z: number, out: THREE.Vector3) => Solid[], reach = 1.6) => {
    const p = along(s), n = rightAt(s).multiplyScalar(side);
    for (let off = off0; off < off0 + reach; off += 0.012) { const x = p.x + n.x * off, z = p.z + n.z * off; if (inClearing(x, z)) return; const g = make(x, z, n); if (ok(g, clear)) return put(g); }
  };
  const stack = (x: number, z: number, a: number, more = 1) => { const g = [cube(x, z, a, R(0, 1.57))]; for (let i = 0, y = 2 * a, b = a; i < more; i++) { b *= R(0.68, 0.86); g.push(cube(x + R(-0.25, 0.25) * (a - b), z + R(-0.25, 0.25) * (a - b), b, R(0, 1.57), y)); y += 2 * b; } return g; };
  const any = (x: number, z: number, big: number, face?: THREE.Vector3): Solid[] => {
    const k = r();
    if (k < 0.5) return [ball(x, z, R(0.09, 0.19) * Math.min(big, 1.35), r() < 0.5 ? GREY.mid : GREY.set)];
    if (k < 0.86) return stack(x, z, R(0.09, 0.135) * Math.min(big, 1.12), r() < 0.2 + 0.3 * big ? (r() < 0.25 * big ? 2 : 1) : 0);
    // slices beside the path stand at an angle to it, so they read as discs and not as flat walls
    return [upright(x, z, Math.min(0.36, R(0.23, 0.3) * big), face ? Math.atan2(face.x, face.z) + (r() < 0.5 ? -1 : 1) * R(0.6, 1.2) : R(0, 3.14))];
  };

  // the pill, as the lens and the ingredients must see it
  put([cyl(PILL_MID.clone(), UP, 0.3, 0.3), ball(0, 0, 0.3, GREY.mid, 0), ball(0, 0, 0.3, GREY.mid, 0.6)]);
  // the arch: two slices leaning together over the path, their top edges meeting above the lens
  { const p = along(S_ARCH).setY(0), n = rightAt(S_ARCH), AR = 0.37, lean = 0.52, half = 2 * AR * Math.sin(lean) + 0.004;
    put([leaner(p.clone().addScaledVector(n, half), n.clone().negate(), AR, lean), leaner(p.clone().addScaledVector(n, -half), n.clone(), AR, lean)]); }
  // the slalom: a tall cylinder on the inside of each bend, a slice leaning on cubes on the outside
  const s2 = TURNS[0][1], s4 = TURNS[1][1];
  hug(s2 + 0.1, 1, 0.24, 0.3, (x, z) => [column(x, z, 0.12, 1.05)]);
  hug(s4 + 0.05, -1, 0.26, 0.3, (x, z) => [column(x, z, 0.135, 1.35)]);
  hug(s2 - 0.1, -1, 0.14, 0.15, (x, z, n) => leanOnCubes(V(x, 0, z), n));
  hug(s4 + 0.1, 1, 0.14, 0.15, (x, z, n) => leanOnCubes(V(x, 0, z), n, 0.34, 0.4, 0.16, 0.12));
  // round the pill: behind it two columns, a slice on its rim and a slice on cubes; in front, low things at the frame's edges
  put([column(-1.2, -1.05, 0.14, 1.55), column(1.55, -1.75, 0.115, 1.0), upright(0.5, -0.95, 0.36, 0.25), ...leanOnCubes(V(0.8, 0, -0.35), V(0.86, 0, -0.5).normalize(), 0.33, 0.42)]);
  put([ball(-0.8, -0.3, 0.29, GREY.set), ball(-1.05, 0.38, 0.16), ball(-0.52, -0.92, 0.2), ...stack(-1.7, -0.2, 0.15, 1), ball(1.75, 0.35, 0.24, GREY.set), ...stack(1.42, -0.6, 0.13, 1)]);
  put([ball(-1.02, 1.45, 0.26), ball(-0.68, 1.78, 0.12, GREY.set), ...stack(-1.38, 1.95, 0.12, 1), ...stack(1.0, 1.25, 0.15, 1), ball(1.38, 1.7, 0.2, GREY.set)]);

  // the opening frame: a berry on the left and stacked ice on the right, a little ahead of the lens
  hug(0.6, -1, 0.26, 0.2, (x, z) => [ball(x, z, 0.17)]);
  hug(0.5, 1, 0.26, 0.2, (x, z) => stack(x, z, 0.12, 1));
  // the canyon walls: a first row beside the lens (every third thing a close pass), a taller second row, a loose third
  const s1 = S_ARCH - 0.55;
  for (const side of [-1, 1]) for (let s = 0.9 + R(0, 0.2), i = side; s < s1; s += R(0.3, 0.48), i++) hug(s, side, i % 3 ? R(0.2, 0.34) : R(0.125, 0.15), 0.14, (x, z, n) => any(x, z, 1, n));
  for (const side of [-1, 1]) for (let s = 0; s < S_ARCH + 0.2; s += R(0.34, 0.5)) hug(s, side, 0.36, 0.6, (x, z, n) => any(x, z, 1.55, n));
  for (const side of [-1, 1]) for (let s = 0; s < S_ARCH + 0.2; s += R(0.5, 0.9)) hug(s, side, 0.6, R(1.1, 2.2), (x, z) => any(x, z, 1.8), 2.5);
  // the far table, out to the horizon
  for (let i = 0, n = 0; n < 70 && i < 900; i++) {
    const a = R(0, 6.283), d = R(3.2, 12), x = 0.4 + Math.cos(a) * d, z = 4 + Math.sin(a) * d;
    if (inClearing(x, z)) continue;
    const g = any(x, z, R(1.4, 2.4));
    if (ok(g, 0.7)) { put(g); n++; }
  }
  // beans scattered over the table, thickest along the canyon floor
  for (let i = 0, n = 0; n < 95 && i < 4000; i++) {
    const near = i % 4 > 0, p = near ? along(R(0, S_ARCH)) : V(R(-3.5, 4), 0, R(-2.5, 10.5)), g = [bean(p.x + (near ? R(-0.6, 0.6) : 0), p.z + (near ? R(-0.6, 0.6) : 0), R(0, 3.14))];
    if (ok(g, 0.26)) { put(g); n++; }
  }
  return (LAYOUT = S);
}
/** the pill's solids come first in the layout: everything after them is set */
const PILL_SOLIDS = 3;

function build(w: KitWorld) {
  studioFloor(w);
  if (!("actors" in w)) return;                                     // the planner's throwaway build only reads the floor
  const g = new THREE.Group(); for (const s of layout().slice(PILL_SOLIDS)) g.add(s.mesh());
  w.add(g, "ingredients");
}
const SHADOW_AT = V(0.8, 0, 2.5), SHADOW_HALF = 9.5;
function tick(w: KitWorld) {
  w.actors.get("PILL")!.root.scale.setScalar(K);
  // the key's shadow square covers the whole table (the shot's own fit follows the pill and would cut the canyon), with
  // an offset small enough for beans to keep their contact shadows
  w.light.fit(SHADOW_AT, SHADOW_HALF); w.light.key.shadow.normalBias = 0.012;
}

export const PIECE: Piece = makeProduct(
  { id: "PRD04-ProbeFlyThrough", name: "Probe fly-through", says: "We are small enough to fly through what it is made of: the ingredients are a landscape, and the product is where it leads.", use: "Food, drink, supplement and beauty spots where the ingredients are the story; an opening that travels through them and lands on the pack.", numbers: "Built 5 times life size (the pill is 1.2 m); real figures in brackets. 16 mm at T22, the lens 0.15 m (3 cm) over the table. Held 0.6 s, then a 5.5 m (1.1 m) S-curve at 1.47 m/s (0.29 m/s), banking 11° into each bend, nearest pass 0.14 m (2.8 cm); level again and fastest, 2.0 m/s (0.4 m/s), under the arch at 4.65 s with the pill standing in its opening. In the open it rises to 0.38 m (7.6 cm), swings across the pill's front 2.04 m (41 cm) from it and backs away 1.06 m (21 cm) while the lens lengthens to 24 mm. Dead still from 7.4 s, 3.1 m (62 cm) out, the pill 61% of the frame height; held 1.6 s.", avoid: "Flying over an empty table: without things a few centimetres from the lens on both sides it is only a low dolly. Keep the product in the arch's opening, never behind one of its legs." },
  { sky: "studio", build, tick, motes: { center: [0, 1.1, -1.3], size: [4.4, 1.6, 1.8], count: 36, drift: [0.03, 0.008, 0.004] } },
  [pillActor([0, 0, 0], 0)],
  () => [{ start: 0, end: END, label: "16>24mm  PROBE FLY-THROUGH", rig: "PROBE LENS · MOTION CONTROL", subject: "PILL", size: "WS", sizeEnd: "FS", stop: 22, shadow: 9.5, cam: camAt, cut: "Opens the template", flags: ["centre", "compound", "wipe"] }],
);
// the planner knows the pill at 24 cm; the HUD and the focus puller read it at its built size
{ const sub = { pos: PILL_MID, height: 0.24 * K, facing: V(0, 0, 1), name: "PRODUCT" };
  PIECE.shots[0].subject = () => ({ ...sub, pos: sub.pos.clone() }); PIECE.shots[0].focus = () => ({ pos: PILL_MID.clone(), name: sub.name }); }
