// One-take templates: several camera moves chained into one continuous shot (rig.chain blends them like one operator
// handing the weight from one move to the next), and camera moves on objects (macro slider, fly-through, spiral, spin).
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec, PathKey } from "../kit/actors";
import { GREY, clay, shadeAll } from "../kit/clay";
import { framed, lag, rig, type Subj } from "../kit/rigs";
import { aimFor } from "../framer";
import { barrel, bench, broadTree, building, crate, floorLamp, ground, lampPost, pine, rock, scatter, shelf, sofa, table } from "../kit/props";
import { buildLab } from "./lab";
import { lerp, ramp, rng, smooth, smoother } from "../util";
import type { Marks } from "../marks";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Spec = Omit<SceneSpec, "id" | "title" | "actors">;
const LAB: Spec = { sky: "studio", build: buildLab, motes: { center: [0, 2.5, 0], size: [40, 6, 40], count: 200 } };

function make(info: TemplateInfo, spec: Spec, actors: ActorSpec[], shots: (P: ReturnType<typeof planner>) => ShotDef[]): Piece {
  const full: SceneSpec = { id: info.id, title: info.name.toUpperCase(), ...spec, actors };
  CAMERA_INFO.push(info);
  return scenePiece(full, shots(planner(full)), { scene: info.id });
}
const human = (id: string, name: string, tint: ActorSpec["tint"], path: PathKey[], extra: Partial<ActorSpec> = {}): ActorSpec => ({ id, name, kind: "human", tint, path, ...extra });
const prop = (id: string, name: string, model: ActorSpec["model"], at: [number, number], yaw = 0, tint: ActorSpec["tint"] = "sand"): ActorSpec => ({ id, name, kind: "prop", model, tint, path: [{ t: 0, at, yaw }] });

/** a walk through points at a natural pace: each leg timed by its length, the first and last legs taken at half speed so
 *  the body starts and stops like a person (the path's ends have zero velocity) */
function walk(t0: number, pts: [number, number][], v = 1.15, yawEnd?: number): PathKey[] {
  const keys: PathKey[] = [{ t: t0, at: pts[0] }];
  let t = t0;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    t += (len / v) * (i === 1 || i === pts.length - 1 ? 1.8 : 1);
    keys.push({ t, at: pts[i], ...(i === pts.length - 1 && yawEnd !== undefined ? { yaw: yawEnd } : {}) });
  }
  return keys;
}
const addAll = (w: KitWorld, ...o: THREE.Object3D[]) => { for (const x of o) w.add(x); };
const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c)); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; return m;
};

// ---------------- ONE02: an open road through low hills ----------------
const roadZ = (x: number) => 16 * Math.sin(x / 48);
/** the car's marks: constant 14 m/s along the road, keyed every second (the ends lie outside the take) */
function roadKeys(v = 14, x0 = -95, t0 = -1.5, t1 = 15): PathKey[] {
  const keys: PathKey[] = []; let x = x0, s = 0;
  for (let t = t0; t <= t1 + 1e-6; t += 0.5) {
    keys.push({ t, at: [x, roadZ(x)] });
    // advance half a second of arc length
    let goal = s + v * 0.5; while (s < goal) { const dx = 0.05, dz = roadZ(x + dx) - roadZ(x); s += Math.hypot(dx, dz); x += dx; }
  }
  return keys;
}
function buildRoad(w: KitWorld) {
  w.add(ground(1400, 7, 150, GREY.ground, 5));
  const r = rng(31);
  for (let x = -220; x < 220; x += 2) {
    const z0 = roadZ(x), z1 = roadZ(x + 2), a = Math.atan2(z1 - z0, 2);
    const seg = new THREE.Mesh(new THREE.BoxGeometry(2.15 / Math.cos(a), 0.02, 7.5), clay(GREY.dark, 0.95)); seg.position.set(x + 1, 0.012, (z0 + z1) / 2); seg.rotation.y = -a; seg.receiveShadow = true; w.add(seg);
    if (Math.round(x) % 8 === 0) { const d = new THREE.Mesh(new THREE.BoxGeometry(3, 0.01, 0.14), clay(GREY.paper, 0.9)); d.position.set(x + 1, 0.03, (z0 + z1) / 2); d.rotation.y = -a; w.add(d); }
  }
  // poles along the verge (the chase reads its speed from them), trees and rocks well clear of the road
  for (let x = -200; x < 200; x += 18) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6.5, 8), clay(GREY.mid)); p.position.set(x, 3.25, roadZ(x) + 6.2); p.castShadow = true; w.add(p); }
  for (let i = 0; i < 260; i++) {
    const x = (r() - 0.5) * 420, side = r() > 0.5 ? 1 : -1, off = 10 + r() * 70, z = roadZ(x) + side * off;
    const o = r() > 0.35 ? pine(7 + r() * 9, i) : r() > 0.4 ? broadTree(6 + r() * 4, i) : rock(400 + i, 0.8 + r() * 2.2);
    o.position.set(x, 0, z); w.add(o);
  }
  for (let i = 0; i < 8; i++) { const b = building(16 + (i % 3) * 6, 12, 14 + (i % 4) * 6, 50 + i); b.position.set(-180 + i * 52, 0, -190 - (i % 3) * 30); w.add(b); }
}

// ---------------- ONE03: a corridor, a doorway, a room ----------------
function buildFlat(w: KitWorld) {
  w.add(ground(200, 0, 60, GREY.mid));
  const L = GREY.light;
  const floorA = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 11.8), clay(GREY.set, 0.96)); floorA.rotation.x = -Math.PI / 2; floorA.position.set(0, 0.004, 5.9); floorA.receiveShadow = true; w.add(floorA);
  const runner = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 10.6), clay(GREY.mid, 0.98)); runner.rotation.x = -Math.PI / 2; runner.position.set(0.1, 0.008, 6.4); runner.receiveShadow = true; w.add(runner);
  const floorB = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 7), clay(GREY.ground, 0.96)); floorB.rotation.x = -Math.PI / 2; floorB.position.set(0, 0.004, -3.4); floorB.receiveShadow = true; w.add(floorB);
  // the corridor (x ±2.6, z 0.25 → 11.8): panelled walls with a dado rail, pictures, a bench; a door out at the far end
  for (const s of [-1, 1]) {
    w.add(box(0.2, 3.2, 11.6, L, s * 2.7, 1.6, 6.05));
    w.add(box(0.05, 0.06, 11.6, GREY.set, s * 2.58, 0.95, 6.05));
    for (let z = 0.9; z < 11.6; z += 1.45) w.add(box(0.05, 3.2, 0.12, GREY.set, s * 2.58, 1.6, z));
  }
  addAll(w, box(2.1, 3.2, 0.2, L, -1.75, 1.6, 11.95), box(2.1, 3.2, 0.2, L, 1.75, 1.6, 11.95), box(1.4, 1.0, 0.2, L, 0, 2.7, 11.95));
  for (const [x, z, h] of [[-2.55, 7.4, 0.9], [-2.55, 4.5, 0.7], [2.55, 5.9, 1.0], [2.55, 9.6, 0.7]] as const) w.add(box(0.04, h, h * 1.3, GREY.mid, x, 1.75, z));
  const bn = bench(); bn.position.set(2.15, 0, 7.9); bn.rotation.y = -Math.PI / 2; w.add(bn);
  const lp = floorLamp(1.55); lp.position.set(-2.2, 0, 1.4); w.add(lp);
  // the room (x ±5.1, z -7 → -0.25): side walls, a back wall with a window, a table, a sofa, a shelf
  for (const s of [-1, 1]) w.add(box(0.2, 3.2, 6.9, L, s * 5.2, 1.6, -3.6));
  addAll(w, box(3.6, 3.2, 0.2, L, -3.3, 1.6, -7.05), box(3.6, 3.2, 0.2, L, 3.3, 1.6, -7.05), box(3.0, 0.95, 0.2, L, 0, 0.475, -7.05), box(3.0, 0.7, 0.2, L, 0, 2.85, -7.05));
  w.add(box(3.1, 0.06, 0.32, GREY.set, 0, 0.98, -6.98));
  const tb = table(1.5, 0.85, 0.75); tb.position.set(-2.6, 0, -4.2); w.add(tb);
  const so = sofa(2.2); so.position.set(3.9, 0, -3.4); so.rotation.y = -Math.PI / 2; w.add(so);
  const sh = shelf(1.4, 2.0); sh.position.set(-4.85, 0, -2.0); sh.rotation.y = Math.PI / 2; w.add(sh);
  for (let i = 0; i < 4; i++) { const t = broadTree(6 + i, 70 + i); t.position.set(-6 + i * 4, 0, -12 - (i % 2) * 3); w.add(t); }
}

// ---------------- OBJ13: a case on a floor with things close to the lens ----------------
function buildSlider(w: KitWorld) {
  buildLab(w);
  // the case sits on a crate (top at 0.68 m); in front, a lower crate 1.1 m from the lens carries bottles and a box
  // that pass through the bottom of the frame as soft shapes
  const stand = crate(0.6); stand.position.set(0, 0.08, 0); stand.rotation.y = 0.12; w.add(stand);
  const near = crate(0.6); near.position.set(0.05, 0.08, 1.55); near.rotation.y = -0.2; w.add(near);
  const bottle = (h: number, r: number) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.7, 18), clay(GREY.paper, 0.6)); b.position.y = h * 0.35; const n = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.6, h * 0.3, 12), clay(GREY.paper, 0.6)); n.position.y = h * 0.85; g.add(b, n); return shadeAll(g); };
  for (const [x, z, h, r] of [[-0.42, 1.5, 0.3, 0.045], [-0.3, 1.62, 0.22, 0.04], [0.3, 1.45, 0.26, 0.05]] as const) { const o = bottle(h, r); o.position.set(x, 0.68, z); w.add(o); }
  w.add(box(0.16, 0.1, 0.12, GREY.mid, 0.1, 0.73, 1.62, 0.4));
  // behind the case: a bench, a crate stack and a lamp to blur into shapes
  const bn = bench(); bn.position.set(-0.6, 0.08, -2.6); bn.rotation.y = 0.15; w.add(bn);
  const c1 = crate(0.8); c1.position.set(1.4, 0.08, -3.4); c1.rotation.y = 0.5; w.add(c1);
  const c2 = crate(0.55); c2.position.set(1.35, 0.88, -3.35); c2.rotation.y = 0.9; w.add(c2);
}

// ---------------- OBJ14: a gallery behind a facade with one big window ----------------
function buildGallery(w: KitWorld) {
  w.add(ground(500, 2.5, 30, GREY.ground, 8));
  const L = GREY.light, H = 6;
  // the facade at z = 0, with a window x ±1, y 1.1 → 3.1
  addAll(w, box(7, H, 0.4, L, -4.5, H / 2, 0), box(7, H, 0.4, L, 4.5, H / 2, 0), box(2, 1.1, 0.4, L, 0, 0.55, 0), box(2, H - 3.1, 0.4, L, 0, 3.1 + (H - 3.1) / 2, 0));
  addAll(w, box(2.2, 0.08, 0.6, GREY.set, 0, 1.12, 0.05), box(2.2, 0.08, 0.5, GREY.set, 0, 3.1, 0), box(0.08, 2.0, 0.5, GREY.set, -1.02, 2.1, 0), box(0.08, 2.0, 0.5, GREY.set, 1.02, 2.1, 0));
  // blind windows along the facade so it reads as a building
  for (const x of [-5.5, -3.2, 3.2, 5.5]) w.add(box(1.3, 1.8, 0.1, GREY.mid, x, 2.1, 0.22));
  // the gallery: floor, side and back walls (no ceiling: a skylit hall)
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 13), clay(GREY.set, 0.96)); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.006, -6.7); fl.receiveShadow = true; w.add(fl);
  for (const s of [-1, 1]) w.add(box(0.4, H, 13, L, s * 7.8, H / 2, -6.7));
  w.add(box(15.6, H, 0.4, L, 0, H / 2, -13.2));
  for (const x of [-5.4, -2.7, 2.7, 5.4]) w.add(box(0.5, H, 0.25, GREY.set, x, H / 2, -12.9));
  w.add(box(15.6, 0.35, 0.3, GREY.set, 0, 4.6, -12.9));
  for (const [x, z] of [[-4.6, -5], [4.8, -6.5]] as const) { const m = box(0.9, 2.4, 0.3, GREY.mid, x, 1.4, z, 0.3); w.add(m); w.add(box(1.1, 0.2, 0.6, GREY.set, x, 0.1, z)); }
  const bn = bench(); bn.position.set(-1.8, 0, -4.6); bn.rotation.y = 0.2; w.add(bn);
  // outside: a lamp post near the approach (it passes the lens), trees beyond
  const lp = lampPost(4.6); lp.position.set(-2.6, 0, 8.5); w.add(lp);
  const g = new THREE.Group(); w.add(g);
  scatter(g, 40, 18, 70, (i) => (i % 3 === 0 ? broadTree(7 + (i % 4), i) : pine(9 + (i % 5) * 1.5, i)), 41, [[0, 8, 14], [0, -6, 12]]);
}

// ---------------- OBJ15: a stone circle round a monolith ----------------
function buildCircle(w: KitWorld) {
  // an open plain (no colonnade: the low end frame looks up into open sky), paving round the stone, trees far off
  w.add(ground(500, 2.5, 26, GREY.ground, 4));
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.08, 96), clay(GREY.set, 0.95)); plaza.position.y = 0.04; plaza.receiveShadow = true; w.add(plaza);
  w.paving = (x, z) => (Math.hypot(x, z) < 11 ? 0.08 : 0);
  for (let i = -10; i <= 10; i += 2) { const len = 2 * Math.sqrt(Math.max(0, 121 - i * i)); for (const rot of [0, Math.PI / 2]) { const j = new THREE.Mesh(new THREE.BoxGeometry(len, 0.01, 0.03), clay(GREY.mid, 0.95)); j.position.set(rot ? i : 0, 0.0755, rot ? 0 : i); j.rotation.y = rot; w.add(j); } }
  const g = new THREE.Group(); w.add(g);
  scatter(g, 40, 30, 80, (i) => (i % 3 === 0 ? broadTree(7 + (i % 4), i) : pine(9 + (i % 5) * 1.5, i)), 23);
  scatter(g, 18, 16, 40, (i) => rock(300 + i, 0.8 + (i % 4) * 0.5), 29);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = rock(700 + i, 0.55 + (i % 3) * 0.12, GREY.mid); r.position.set(Math.cos(a) * 3.4, 0.08, Math.sin(a) * 3.4); w.add(r); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.75, 64), clay(GREY.mid, 0.95)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.09; w.add(ring);
}

// ---------------- OBJ16: a turntable in an open studio ----------------
const SPIN_T = 4.7, SPIN_A = Math.PI * 2 * 1.35, SPIN_END = -0.25;
/** the turntable's angle: arriving already spinning fast, braking smoothly to a dead stop on the beauty angle */
const spin = (t: number) => SPIN_END - SPIN_A * Math.pow(1 - Math.min(1, Math.max(0, t / SPIN_T)), 3);
function buildStudio(w: KitWorld) {
  w.add(ground(600, 0, 600, GREY.light));
  const deck = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.14, 96), clay(GREY.set, 0.8)); disc.position.y = 0.07; deck.add(disc);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, n = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.4), clay(GREY.mid)); n.position.set(Math.cos(a) * 3.05, 0.146, Math.sin(a) * 3.05); n.rotation.y = -a; deck.add(n); }
  w.add(shadeAll(deck), "deck");
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.7, 0.05, 96), clay(GREY.mid, 0.9)); base.position.y = 0.025; base.receiveShadow = true; w.add(base);
}
const tickSpin = (w: KitWorld, t: number) => {
  const a = spin(t);
  w.parts.get("deck")!.rotation.y = a;
  const car = w.actors.get("CAR")!.root; car.rotation.y = a; car.position.y = 0.14;
};

/** keep a move's path (a crane, a real film's operator) and re-aim it on the subject: `at` is where the eyes sit (NDC) */
const reframe = (cam: (t: number) => Cam, s: Subj, at: (t: number) => [number, number]) => (t: number): Cam => { const c = cam(t); return { ...c, target: aimFor(c.pos, s(t).eye, c.mm, at(t)) }; };

/** a real film's operator path, steadied: the position averaged over `w` seconds (the measured path carries the
 *  tracker's frame-to-frame noise, which scaled up to these distances reads as a shaky rig) */
const steady = (cam: (t: number) => Cam, w = 0.6) => (t: number): Cam => { const c = cam(t); return { ...c, pos: lag((x) => cam(x).pos, t, w) }; };
/** a two-key spline (a programmed jib or drone line) played on a gentle S-curve: rig.spline's own easing is steep
 *  at each key, so its time is re-mapped until its progress follows `ease` */
function evenSpline(keys: Parameters<typeof rig.spline>[0], ease = smooth) {
  const S = rig.spline(keys), a = keys[0].t, b = keys[1].t, q = (t: number) => smoother(ramp(t, a, b));
  return (t: number): Cam => {
    if (t <= a || t >= b) return S(t);
    const p = ease((t - a) / (b - a)); let lo = a, hi = b;
    for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2; if (q(m) < p) lo = m; else hi = m; }
    return S((lo + hi) / 2);
  };
}

/** two people as one subject for a two-shot: the midpoint of their marks, facing `facing` */
function pairOf(A: Subj, B: Subj, facing: THREE.Vector3, at = 0): Subj {
  const a = A(at), b = B(at), mid = (p: THREE.Vector3, q: THREE.Vector3) => p.clone().lerp(q, 0.5);
  const m: Marks = { name: "PAIR", visible: true, eye: mid(a.eye, b.eye), top: mid(a.top, b.top), sole: mid(a.sole, b.sole), height: (a.height + b.height) / 2, facing, heading: facing, joints: [],
    ladder: a.ladder && b.ladder ? { chin: mid(a.ladder.chin, b.ladder.chin), chest: mid(a.ladder.chest, b.ladder.chest), waist: mid(a.ladder.waist, b.ladder.waist), thigh: mid(a.ladder.thigh, b.ladder.thigh), ankle: mid(a.ladder.ankle, b.ladder.ankle) } : undefined };
  return () => m;
}

// ---------------- ONE04 blocking: nobody moves; the camera ends over Alex's shoulder, so the rack has somewhere to go ----------------
const ALEX4: [number, number] = [-0.65, 0], SAM4: [number, number] = [0.65, 0];
const ORBIT4 = { name: "orbit_left_2", f: { size: "MWS" as const, mm: 40, deg: 0, rise: -0.85 }, speed: 1.3, t0: 0.9, end: 7.0 };
const one04 = (() => {
  const pre: SceneSpec = { id: "pre", title: "", ...LAB, actors: [human("ALEX", "Alex", "ochre", [{ t: 0, at: ALEX4, yaw: Math.PI / 2 }]), human("SAM", "Sam", "slate", [{ t: 0, at: SAM4, yaw: -Math.PI / 2 }])] };
  const P = planner(pre), pair = pairOf(P("ALEX"), P("SAM"), V(0, 0, 1));
  const E = rig.filmPath(ORBIT4.name, pair, ORBIT4.f, ORBIT4.t0, ORBIT4.speed, true)(ORBIT4.end).pos;
  // the push ends 2 m behind Alex and 0.95 m off his shoulder, toward the side the orbit ended on
  const C = V(ALEX4[0] - 2.0, P("SAM")(0).eye.y + 0.06, ALEX4[1] + Math.sign(E.z) * 0.95);
  return { E, C };
})();

export const ONER_TEMPLATES: Piece[] = [
  // ---------------------------------------------------------------- people, one take each
  make({ id: "ONE01-CraneToFollowWhip", name: "Crane to follow, whip reveal", says: "We arrive from above, fall in with them, and turn to see what they are walking toward.", use: "Openings that hand geography to a character, then the destination: arrivals, discoveries, the first sight of the goal.", numbers: "32 mm throughout. Crane from 7 m above and 7.6 m out to eye level 3.1 m in front over 4.3 s, a Steadicam lead at her pace (she builds to 1.75 m/s, a purposeful stride) with a 0.6 s lag, then the operator plants and whips 0.45 s (about 140°) onto the destination, held 4 s while she walks on past the lens into the frame toward it.", avoid: "A whip onto a frame that is not composed, or a crane that lands on nothing: each stage of the take must end on a frame you could cut on." },
    LAB,
    [human("ALEX", "Alex", "ochre", [{ t: 0.4, at: [0.8, 9.0] }, { t: 16, at: [0.2, -9.5] }], { look: [-1.2, 3.0, -11.5], lookFrom: 7.3 }),
      prop("STATUE", "Statue", "statue", [-1.2, -11.5], 0, "stone")],
    (P) => {
      const A = P("ALEX"), S = P("STATUE");
      const lead = rig.follow(A, { size: "MWS", mm: 32, deg: 35, rise: 0.05 });
      const tw = 8.95, pw = lead(tw).pos;
      const onStatue = () => ({ pos: pw.clone(), target: aimFor(pw, S(0).eye.clone().add(V(0, -1.0, 0)), 32, [-0.12, 0.0]), mm: 32 });
      return [{ start: 0, end: 13.5, label: "32mm  CRANE DOWN > LEAD > WHIP", rig: "TECHNOCRANE > STEADICAM", subject: (t) => (t < tw + 0.2 ? "ALEX" : "STATUE"), size: "WS", sizeEnd: "FS", stop: 4,
        cam: rig.chain([
          { from: 0, cam: reframe(rig.crane(A, { size: "WS", mm: 32, deg: 35 }, 7, 0.05, 0, 4.9, 0.41, 0.5), A, (t) => [0, (1 / 3) * smoother(ramp(t, 1.2, 4.6))]) },
          { from: 4.5, cam: rig.whip(lead, onStatue, tw, 0.45) },
        ], 1.0),
        cut: "Opens the template", flags: ["compound", "whip"], note: "Crane down onto Alex arriving, lands as a Steadicam lead, whip to the statue she has been looking at." }];
    }),

  make({ id: "ONE02-DroneDiveChase", name: "Drone dive into a chase", says: "From far above, the world; then we drop out of the sky and ride with them; then we let them go.", use: "Car and vehicle openings, the start or end of a chase, any journey that needs scale and speed in one move.", numbers: "35 mm. The drone starts 56 m back and 30 m up (the car a tenth of the frame), dives over 5 s (peak 16 m/s closing speed) to 9 m behind and 2.2 m up at the car's 14 m/s, chases 3 s, then climbs and falls back (a real-film dolly-out-and-up path, played at 1.6×) to end high and wide.", avoid: "Diving with a jolt: the drone must already be matched to the car's speed before it drops, and land on the chase without a bump." },
    { sky: "day", build: buildRoad, keyDir: [0.45, 0.75, 0.5], motes: { center: [0, 2.5, 0], size: [60, 8, 60], count: 120 } },
    [{ id: "CAR", name: "Car", kind: "prop", model: "car", tint: "slate", path: roadKeys() }],
    (P) => {
      const C = P("CAR");
      const dive = (t: number) => { const k = Math.min(1, Math.max(0, (t - 0.4) / 5.0)), e = k * k * (3 - 2 * k); return rig.chase(C, lerp(56, 9, e), lerp(30, 2.2, e), 35, lerp(22, 1.4, e), 0.9)(t); };
      return [{ start: 0, end: 12, label: "35mm  DRONE DIVE > CHASE > RISE", rig: "DRONE · GIMBAL", subject: "CAR", size: "EWS", sizeEnd: "EWS", stop: 5.6, shadow: 45,
        cam: rig.chain([
          { from: 0, cam: dive },
          { from: 5.6, cam: rig.chase(C, 9, 2.2, 35, 1.4, 0.9) },
          { from: 8.6, cam: reframe(steady(rig.filmPath("dolly_out_and_up_2", C, { size: "WS", mm: 35, rise: 1.8 }, 8.2, 1.6, true)), C, () => [0, 0.15]) },
        ], 1.4),
        cut: "Opens the template", flags: ["compound", "centre", "enters-moving", "exits-moving"], note: "Real-film path: dolly_out_and_up_2 (mirrored to play from behind) for the rise." }];
    }),

  make({ id: "ONE03-InteriorOner", name: "Interior oner", says: "We walk the space with them, in real time: no cuts, so nothing is hidden and nobody can leave.", use: "Arrivals into a room, a reveal of who is waiting, tension that should not be relieved by a cut.", numbers: "35 mm throughout. Lead from 1.9 m in front (a real-film lead path), a 4.5 s swing of 180° round her right side (peak 60°/s, held on her eyes), a Steadicam follow 1.9 m behind through a 1.7 m doorway, settling into an OTS on Sam 1.9 m beyond her. 14 s, 11 m walked at 1.2 m/s.", avoid: "Losing the subject in the swing, or a camera that fits through the door only because the walls are fake: the rig's path has to clear the frame." },
    { sky: "interior", build: buildFlat, keyDir: [0.35, 0.82, 0.45], motes: { center: [0, 1.4, 1], size: [9, 2.8, 15], count: 160, drift: [0.03, 0.01, 0.02] } },
    [human("ALEX", "Alex", "ochre", walk(0.5, [[0.15, 9.6], [0.15, 8.8], [0.1, 3], [0.05, 0], [0.2, -1.8], [0.3, -3.2]], 1.2, 2.8), { look: "SAM", lookFrom: 10.2 }),
      prop("DOOR", "Doorway", "doorway", [0, 0], 0, "stone"),
      human("SAM", "Sam", "slate", [{ t: 0, at: [0.95, -5.0], yaw: -0.35 }], { acts: [{ kind: "clip", clip: "Idle_FoldArms_Loop", t0: 0 }], look: "ALEX", lookFrom: 8.2 })],
    (P) => {
      const A = P("ALEX"), S = P("SAM");
      return [{ start: 0, end: 14, label: "35mm  LEAD > SWING > FOLLOW > OTS", rig: "STEADICAM", subject: (t) => (t < 11.6 ? "ALEX" : "SAM"), size: "MWS", sizeEnd: "MS", stop: 2.8,
        cam: rig.chain([
          { from: 0, cam: reframe(steady(rig.filmPath("lead_front_1", A, { size: "MWS", mm: 35, rise: -0.6 }, 0.5)), A, () => [0, 0.27]) },
          { from: 4.6, cam: (t) => { const k = Math.min(1, Math.max(0, (t - 4.3) / 4.5)), e = k * k * (3 - 2 * k); return framed(A(t), { size: "MS", mm: 35, deg: lerp(14, -165, e), rise: lerp(0.18, 0.15, e), at: [0, 1 / 3] }); } },
          { from: 8.4, cam: rig.follow(A, { size: "MS", mm: 35, deg: -165, rise: 0.15 }) },
          { from: 11.2, cam: rig.ots(A, S, 35, 1, 1.3, 0.75) },
        ], 1.2),
        cut: "Opens the template", flags: ["compound", "enters-moving", "centre", "whip"], note: "Real-film path: lead_front_1 for the opening lead. The end frame is an OTS over Alex's right shoulder onto Sam." }];
    }),

  make({ id: "ONE04-OrbitPushRack", name: "Orbit, push, rack", says: "We circle a conversation, then close in on her over his shoulder, and when he looks away the focus leaves her for him.", use: "The turn of a dialogue scene in one take: a confession, a refusal, the moment one person stops looking at the other.", numbers: "40 mm at T2. A 0.9 s held two-shot, a real-film orbit of about 115° round the pair over 6 s (steadied, a little above their eyes), a 2 m push to a dirty MCU of Sam over Alex's shoulder in 4 s, a 1.2 s rack focus from her (3.1 m) to him (1.8 m) as he looks down, held 1.8 s.", avoid: "Racking with nothing behind: the second face must already be in the frame, soft, before the rack starts." },
    { ...LAB, motes: { center: [0, 2, 0], size: [14, 4, 14], count: 160 } },
    [human("ALEX", "Alex", "ochre", [{ t: 0, at: ALEX4, yaw: Math.PI / 2 }], { look: "SAM", acts: [{ kind: "talk", t0: 0.6, t1: 3.4 }, { kind: "lookDown", t0: 10.6, ease: 0.9 }] }),
      human("SAM", "Sam", "slate", [{ t: 0, at: SAM4, yaw: -Math.PI / 2 }], { look: "ALEX", acts: [{ kind: "talk", t0: 3.6, t1: 10.4 }] })],
    (P) => {
      const A = P("ALEX"), S = P("SAM");
      const pair = pairOf(A, S, V(0, 0, 1));
      // the push: one dolly line from where the orbit ends to Sam's single, on a gentle S-curve
      const push = (t: number): Cam => { const e = smooth((t - 6.8) / 4.0), pos = one04.E.clone().lerp(one04.C, e); return { pos, target: aimFor(pos, S(t).eye, 40, [lerp(0.1, -0.2, e), 1 / 3]), mm: 40 }; };
      return [{ start: 0, end: 14, label: "40mm  ORBIT > PUSH > RACK", rig: "TECHNOCRANE > DOLLY", subject: "SAM", size: "FS", sizeEnd: "MCU", stop: 2,
        cam: rig.chain([
          { from: 0, cam: reframe(steady(rig.filmPath(ORBIT4.name, pair, ORBIT4.f, ORBIT4.t0, ORBIT4.speed, true), 0.8), pair, () => [0, 0.3]) },
          { from: 6.9, cam: push },
        ], 1.2),
        focus: (t) => ["SAM", "ALEX", smoother(ramp(t, 11.0, 12.2))],
        cut: "Opens the template", flags: ["compound"], note: "Real-film path: orbit_left_2 (mirrored to start in front) for the orbit. The push lands on a dirty single of Sam over Alex\u2019s shoulder; Alex looks down at 10.6 s and the focus racks to him." }];
    }),

  // ---------------------------------------------------------------- objects
  make({ id: "OBJ13-MacroSlider", name: "Macro slider", says: "Look closely: a small thing, made precious by the time we take over it.", use: "Product details, clues, keepsakes; the insert before someone opens or takes it.", numbers: "100 mm at T2, the lens 0.25 m above the case top and 4.2 m from it (the case half the frame width), a 0.72 m slide over 7 s (0.08 m/s, a creep) with the aim held parallel, so the case drifts across a third of the frame; bottles 2.7 m from the lens pass through the bottom of the frame as soft shapes.", avoid: "Sliding past nothing: without foreground or background layers a slider reads as a pan." },
    { ...LAB, build: buildSlider, motes: { center: [0, 0.7, 0.6], size: [4, 1.2, 4], count: 160, drift: [0.02, 0.006, 0.01] } },
    [{ id: "CASE", name: "Suitcase", kind: "prop", model: "suitcase", tint: "rose", path: [{ t: 0, at: [0.02, 0.68, 0.0], yaw: 0.55 }] }],
    () => [{ start: 0, end: 7, label: "100mm  MACRO SLIDER", rig: "SLIDER", subject: "CASE", size: "INSERT", stop: 2, shadow: 4,
      cam: rig.truck(V(-0.36, 1.25, 4.2), V(0.36, 1.25, 4.2), V(0.0, -0.045, -1), 100, 0, 7, undefined, 0.7),
      cut: "Opens the template", flags: ["centre", "wipe"] }]),

  make({ id: "OBJ14-FlyThroughWindow", name: "Fly through a window", says: "We cross from outside to in without a cut: the threshold is the moment.", use: "Entering a building, a reveal of what is inside, a transition from a public space to a private one.", numbers: "24 mm, one keyed drone path of 13.6 m over 6 s, descending 0.6 m; the window frame (2 × 2 m) passes within 0.9 m of the lens at the move's fastest point, then the move settles on the statue.", avoid: "Slowing in the opening: the frame edge sells the crossing only at speed." },
    { sky: "day", build: buildGallery, keyDir: [-0.35, 0.86, 0.38], motes: { center: [0, 2.5, -2], size: [18, 5, 26], count: 220 } },
    [prop("STATUE", "Statue", "statue", [0.6, -8], 0.15, "sand")],
    (P) => {
      const S = P("STATUE");
      const win = V(0, 2.1, 0);
      return [{ start: 0, end: 7, label: "24mm  FLY THROUGH WINDOW", rig: "FPV DRONE · CINEWHOOP", subject: "STATUE", size: "WS", sizeEnd: "FS", stop: 4,
        cam: evenSpline([
          { t: 0.3, pos: V(-1.05, 2.65, 11), look: (t) => win.clone().lerp(S(t).eye, 0.35), mm: 24 },
          { t: 6.3, pos: V(0.25, 2.0, -2.6), look: (t) => S(t).eye.clone().add(V(0, -0.7, 0)), mm: 24 },
        ]),
        cut: "Opens the template", flags: ["centre", "wipe"] }];
    }),

  make({ id: "OBJ15-TopDownSpiral", name: "Top-down spiral", says: "From a map to a monument: we come down out of the sky and around, and it rises to meet us.", use: "Arrivals at a landmark, an object of worship or dread; the end of a search.", numbers: "24 → 20 mm. From straight down at 16 m, a 270° spiral that descends to 0.3 m and widens to 4.6 m over 6.8 s on an S-curve; the tilt goes from 90° down to about 17° up, ending low under the stone, base to top, against open sky. Held 0.6 s at each end.", avoid: "Spinning so fast the ground smears: the rotation eases out with the descent." },
    { ...LAB, build: buildCircle, keyDir: [-0.5, 0.8, 0.35] },
    [prop("MONO", "Monolith", "monolith", [0, 0], 0.4, "plum")],
    (P) => {
      const M = P("MONO");
      const cam = (t: number) => {
        const k = smooth((t - 0.6) / 6.8), m = M(t);
        // the azimuth lands north of the stone, looking south through the gap in the colonnade
        const a = Math.PI * 0.95 - lerp(1.5 * Math.PI, 0, k), r = lerp(0.25, 4.6, Math.pow(k, 1.4)), h = lerp(16, 0.32, Math.pow(k, 0.75));
        const pos = V(Math.sin(a) * r, h, Math.cos(a) * r);
        const aim = m.top.clone().lerp(m.eye, k);
        return { pos, target: aimFor(pos, aim, lerp(24, 20, k), [0, 0]), mm: lerp(24, 20, k) };
      };
      return [{ start: 0, end: 8, label: "24>20mm  TOP-DOWN SPIRAL", rig: "TECHNOCRANE · REMOTE HEAD", subject: "MONO", size: "WS", sizeEnd: "FS", stop: 5.6, cam: rig.chain([{ from: 0, cam }]), cut: "Opens the template", flags: ["centre", "compound"] }];
    }),

  make({ id: "OBJ16-ProductSpin", name: "Product spin", says: "Look at it from every side, fast, then let it settle: this is the one.", use: "Product and vehicle reveals, the hero object of an ad, the end card before a logo.", numbers: "40 mm low (0.9 m, just under the roofline), the turntable arriving at 0.9 rev/s and braking on a cubic to a dead stop at 4.7 s, while the camera creeps 1.2 m in; held 1.8 s on the three-quarter front.", avoid: "A spin that stops on a side-on or a rear angle: the brake lands on the beauty angle, decided first." },
    { sky: "studio", build: buildStudio, tick: tickSpin, keyDir: [-0.6, 0.72, 0.35], motes: { center: [0, 2, 0], size: [14, 4, 14], count: 140 } },
    [{ id: "CAR", name: "Car", kind: "prop", model: "car", tint: "slate", path: [{ t: 0, at: [0, 0], yaw: SPIN_END }] }],
    () => {
      const a = V(5.5, 0.95, 9.0), b = V(4.85, 0.85, 7.95), aim = V(0, 0.78, 0);
      return [{ start: 0, end: 7, label: "40mm  TURNTABLE SPIN > BEAUTY", rig: "DOLLY · LOW HAT", subject: "CAR", size: "WS", sizeEnd: "WS", stop: 4,
        cam: (t) => { const k = smoother(ramp(t, 0, 5.2)), pos = a.clone().lerp(b, k); return { pos, target: aimFor(pos, aim, 40, [0, -0.12]), mm: 40 }; },
        cut: "Opens the template", flags: ["centre", "enters-moving"] }];
    }),
];
void floorLamp; void crate; void barrel;
