// FAM04-LeapOfFaith
// Copied from engine/cinematic/src/templates/famous/f04-leap-of-faith.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh FAM04-LeapOfFaith
// FAM04-LeapOfFaith: the leap of faith (Spider-Man: Into the Spider-Verse, 2018), measured from a reference clip.
// One take. A person stands on a window ledge high on a tower and dives off. The fall is real speed: they drop away
// down the tower's face while the camera climbs over them, then it dives after them, swinging to their side and rolling
// 180 degrees. Time slows only as it arrives beside them, on the famous frame: the city hanging from the top of the
// picture, sky at the bottom, the falling figure small in the middle, upright in frame and seeming to rise.
// That frame sits, then the camera pushes in to a close-up of the face, still inverted, and ends there riding the fall.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { aimFor } from "../../framer";
import { GREY, clay } from "../../kit/clay";
import { building, ground } from "../../kit/props";
import { speedRamp } from "../../kit/stage";
import type { Piece } from "../../piece";
import type { Cam } from "../../shots";
import { clamp, lerp, rng, smoother } from "../../util";
import { V, makeProduct, type ActorSpec, type KitWorld, type PathKey } from "../products/shared";

const rad = THREE.MathUtils.degToRad;
const G = 9.81, MM = 28;
// film seconds: real time to SLOW[0], the clock eased to RATE by SLOW[1] (the inverted wide), the push-in, the close-up held
const SLOW = [4.9, 5.6], RATE = 0.035, PUSH = [7.1, 11.6], T_END = 13.1;

// ---------------- the hero (world-clock seconds) ----------------
// The tower's face is the plane z = 0 and the hero leaves it toward +z. The ledge top is the tower's 60th floor line.
const Y0 = 205.31;
const P0 = V(0, Y0, 0.96);                 // where the soles stand: toes at the ledge's edge, over the glass lip
const STANCE: ["l" | "r", number, number][] = [["l", 0.2, 0.13], ["r", -0.16, -0.27]];   // the ankles (x, z from P0): the jump clip's own stance
const TO = 1.6;                            // toe-off
const H0 = 1.0;                            // the body turns about this point, metres above the soles
const LEAN = 0.18;                         // tipping forward on the toes before they leave
const SPIN = rad(184);                     // the dive's turn rate: half a turn in about a second
const TH0 = (SPIN * LEAN) / 2;             // the lean at toe-off
const V0 = V(0, 2.0, 3.6);                 // the body's velocity at toe-off
const T1 = 0.3035, T2 = 0.6035;            // the first tip stops with the body face down to the street, spread out
const FLAT = TH0 + SPIN * T1 + ((T2 - T1) * SPIN) / 2;   // about 100 degrees over
const T3 = 3.5;                            // from there it tips on, slowly then faster, and is head down here, before time slows
const TWIST = rad(50), TW = [2.2, 3.5];    // a part twist as it goes head down, so the face ends turned along the avenue, not at the wall across

/** how far the body has tipped forward (0 = standing, pi = head down) */
function pitch(w: number) {
  const s = w - TO;
  if (s <= -LEAN) return 0;
  if (s <= 0) return (0.5 * SPIN * (s + LEAN) ** 2) / LEAN;
  if (s <= T1) return TH0 + SPIN * s;
  const k = (s - T1) / (T2 - T1);
  if (k <= 1) return TH0 + SPIN * T1 + (T2 - T1) * SPIN * (k - k * k * k + (k * k * k * k) / 2);
  return FLAT + (Math.PI - FLAT) * smoother(Math.pow(clamp((s - T2) / (T3 - T2)), 1.4));
}
/** the turn about the body's own long axis */
const twist = (w: number) => -TWIST * smoother((w - TO - TW[0]) / (TW[1] - TW[0]));
const C0 = P0.clone().add(V(0, H0 * Math.cos(TH0), H0 * Math.sin(TH0)));
/** the body's centre: over the soles while they are planted, then a free fall under gravity */
function centre(w: number) {
  const s = w - TO;
  if (s <= 0) { const a = pitch(w); return P0.clone().add(V(0, H0 * Math.cos(a), H0 * Math.sin(a))); }
  return V(C0.x + V0.x * s, C0.y + V0.y * s - (G / 2) * s * s, C0.z + V0.z * s);
}
const X_AXIS = V(1, 0, 0), Y_AXIS = V(0, 1, 0);
/** the mannequin's root (its soles' point) and its turn at world time w */
function body(w: number) {
  const quat = new THREE.Quaternion().setFromAxisAngle(X_AXIS, pitch(w)).multiply(new THREE.Quaternion().setFromAxisAngle(Y_AXIS, twist(w)));
  return { root: centre(w).sub(V(0, H0, 0).applyQuaternion(quat)), quat };
}

// ---------------- the clock and the camera (film seconds) ----------------
const CLOCK = speedRamp([[0, 1], [SLOW[0], 1], [SLOW[1], RATE], [T_END, RATE]]);
const W_END = CLOCK(T_END);
const D0 = 4.7, D1 = 16.58;                // lens to the body: a full shot on the ledge, then the reference's small figure
const AZ0 = -25, AZ1 = -100;               // degrees round the hero from straight ahead of them, toward -x
const EL0 = 12.5, AIM0 = -0.1;             // the opening looks slightly down at the ledge
const OVER = 70, UP = [1.4, 3.1], DOWN = [3.5, 5.7];   // the camera climbs over the diver as they drop away, then dives after them and comes level
const ROLL = [1.9, 5.8], BACK = [1.0, 4.2], SWING = [2.0, 5.6];
const WIDE_T = 6.4;                        // the inverted wide the city is laid out for
const DC = 1.5, MM1 = 35;                  // the close-up: lens to the face, on a slightly longer lens (towers larger behind the head)
const AZ2 = -180 + THREE.MathUtils.radToDeg(TWIST);   // straight in front of the face once the body is head down
const FACE = V(0, 1.66, 0.25);             // in the body's frame: between the mannequin's eyes and the pill's dot
const E = (t: number, a: number, b: number) => smoother((t - a) / (b - a));
const S = (t: number) => centre(CLOCK(t));
const face = (t: number) => { const b = body(CLOCK(t)); return b.root.add(FACE.clone().applyQuaternion(b.quat)); };
/** a point averaged over a window with soft edges: the operator's follow, with no step where the subject's speed jumps */
const follow = (f: (t: number) => THREE.Vector3, t: number, w: number, n = 60) => {
  const o = V(0, 0, 0); let sum = 0;
  for (let i = 1; i < n; i++) { const k = 1 - Math.cos((2 * Math.PI * i) / n); o.addScaledVector(f(t - w / 2 + (w * i) / n), k); sum += k; }
  return o.multiplyScalar(1 / sum);
};
const END_AT: [number, number] = [0, -0.034];   // the reference's figure sits a touch left of and below the middle
const FACE_AT: [number, number] = [0, 0.2];         // the close-up: eyes above the middle, room over the crown
/** the camera at film time t; `p` is how far the push-in has gone (0 = the move as it runs to the inverted wide) */
function camAt(t: number, p = E(t, PUSH[0], PUSH[1])): Cam {
  // the arc to the face comes late in the push
  const k = E(t, BACK[0], BACK[1]), az = rad(lerp(AZ0, AZ1, E(t, SWING[0], SWING[1])) + (AZ2 - AZ1) * (p > 0 ? E(t, PUSH[0] + 1.2, PUSH[1]) : 0));
  // closing: half by distance, half by ratio, so it is quickest near the middle and lands long and soft
  const d = D0 * Math.pow(D1 / D0, k) * (p > 0 ? 0.5 * lerp(1, DC / D1, p) + 0.5 * Math.pow(DC / D1, p) : 1), mm = MM * Math.pow(MM1 / MM, p);
  const el = rad(lerp(EL0, 0, E(t, 1.0, 2.2)) + OVER * E(t, UP[0], UP[1]) * (1 - E(t, DOWN[0], DOWN[1])));
  // the camera rides the body's centre, and in the push-in the face
  const on = (w: number) => (p > 0 ? follow(S, t, w).lerp(follow(face, t, w), p) : follow(S, t, w));
  const pos = on(0.7).add(V(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(d));
  const aim = on(0.4).add(V(0, lerp(AIM0, 0, E(t, 1.0, 3.0)), 0));
  // the lens axis stays on the body, so the roll turns the city about them (the frame is upside down by the end, hence the signs)
  const r = E(t, ROLL[0], ROLL[1]);
  return { pos, target: aimFor(pos, aim, mm, [lerp(-END_AT[0] * r, -FACE_AT[0], p), lerp(-END_AT[1] * r, -FACE_AT[1], p)]), mm, roll: -Math.PI * r };
}

// ---------------- the glass lip (world-clock seconds) ----------------
// A thin lip runs along the ledge's edge. The stretch under the hero's toes is nine plates that break away with the
// push-off and fall alongside: each one ballistic, turning at a steady rate.
const LIP = { x0: -0.9, x1: 0.9, z0: 1.1, z1: 1.42, th: 0.035 };
const BREAK = TO - 0.06;                   // just as the front foot has pushed off the lip
type Shard = { corners: [number, number][]; p0: THREE.Vector3; v: THREE.Vector3; axis: THREE.Vector3; spin: number };
const SHARDS: Shard[] = (() => {
  const r = rng(41), n = 9, cut = (i: number) => lerp(LIP.x0, LIP.x1, i / n) + (i > 0 && i < n ? (r() - 0.5) * 0.12 : 0);
  const near = Array.from({ length: n + 1 }, (_, i) => cut(i)), far = Array.from({ length: n + 1 }, (_, i) => cut(i));
  return Array.from({ length: n }, (_, i) => {
    const q: [number, number][] = [[near[i], LIP.z0], [near[i + 1], LIP.z0], [far[i + 1], LIP.z1], [far[i], LIP.z1]];
    const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, cz = (LIP.z0 + LIP.z1) / 2;
    return {
      corners: q.map(([x, z]) => [x - cx, z - cz] as [number, number]), p0: V(cx, Y0 - LIP.th / 2, cz),
      // outward, up and ahead. Neighbours leave at different heights and speeds, so no two plates cross; the middle
      // ones stay low and fall below the body, not through it; the one under the front foot is trodden down
      v: Math.abs(cx - STANCE[0][1]) < 0.12 ? V(0.25, -0.5, 1.4)
        : V(1.3 * cx + Math.sign(cx || 1) * 0.3 + 0.16 * (r() - 0.5), (i % 2 || Math.abs(cx) < 0.45 ? 1.2 + 0.5 * (i % 3) : 3.4) + 0.25 * r(), [2.3, 3.3, 2.8][i % 3] + 0.3 * r()),
      axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), spin: 1.2 + 1.6 * r(),
    };
  });
})();
function shardAt(s: Shard, w: number) {
  const x = Math.max(0, w - BREAK);
  return { pos: V(s.p0.x + s.v.x * x, s.p0.y + s.v.y * x - (G / 2) * x * x, s.p0.z + s.v.z * x), quat: new THREE.Quaternion().setFromAxisAngle(s.axis, s.spin * x) };
}

// ---------------- the set ----------------
/** every solid block of the set as [x0, x1, y0, y1, z0, z1], for the clearance probe */
const SOLIDS: number[][] = [];
type Lot = { x0: number; x1: number; z0: number; z1: number; h: number; kit: boolean; face: 1 | -1; seed: number };
/** the city: a grid of lots (28 x 26 m, 18 m streets, 28 m avenues), every other row shifted 12 m. Heights come
 *  from the two frames that matter. In the inverted wide, lots on the lens axis are low or far and short (open sky
 *  round the hero) and the rest are tall. Behind the head in the close-up, far towers hang part of the way down. */
const LOTS: Lot[] = (() => {
  const end = camAt(WIDE_T, 0), f = end.target.clone().sub(end.pos).setY(0).normalize(), side = V(-f.z, 0, f.x), tanV = 36 / 2.39 / 2 / MM;
  const cu = camAt(T_END), fc = cu.target.clone().sub(cu.pos).setY(0).normalize(), sc = V(-fc.z, 0, fc.x), tanC = 36 / 2.39 / 2 / MM1;
  const out: Lot[] = [];
  for (let j = -6; j <= 8; j++) for (let i = -8; i <= 10; i++) {
    const x0 = -4.2 + 46 * i - (j % 2 ? 11.8 : 0), z0 = -26 + 54 * j, c = V(x0 + 14, 0, z0 + 13);
    if (Math.hypot(c.x, c.z - 3) > 440) continue;
    const r = rng(1000 + i * 37 + j * 101), rel = c.clone().sub(end.pos).setY(0), a = rel.dot(f), b = rel.dot(side);
    let h = end.pos.y + 15 + 75 * r();
    if (i === 0 && j === 0) h = Y0 + 21.09;                                  // the hero's tower
    else if (a > 0 && Math.abs(b) < 0.3 * a + 14) {
      // how far down the inverted frame its roof hangs: short on the lens axis, so the figure stands against sky
      const p = Math.abs(b) < 0.12 * a + 10 ? 0.14 + 0.16 * r() : r() < 0.3 ? 0.5 + 0.18 * r() : 0.2 + 0.3 * r();
      h = a < 100 ? 10 + 22 * r() : end.pos.y + (2 * p - 1) * tanV * a;
    } else {
      const rc = c.clone().sub(cu.pos).setY(0), ac = rc.dot(fc), bc = rc.dot(sc);
      if (ac > 60 && Math.abs(bc) < 0.55 * ac + 14) h = cu.pos.y + (2 * (Math.abs(bc) < 0.15 * ac + 8 ? 0.15 + 0.17 * r() : 0.4 + 0.3 * r()) - 1) * tanC * ac;
    }
    out.push({ x0, x1: x0 + 28, z0, z1: z0 + 26, h, kit: Math.hypot(c.x - 10, c.z) < 125 && h > 40, face: z0 >= 0 ? -1 : 1, seed: 3 + Math.floor(r() * 90) });
  }
  return out;
})();

function build(w: KitWorld) {
  if (!("light" in w)) return;                                           // the planner's throwaway build: nothing to read from this set
  if (w.scene.fog) (w.scene.fog as THREE.FogExp2).density = 0.0026;       // haze: towers 300 m off are half gone
  w.add(ground(1600, 0, 1600, GREY.mid));
  // everything static is merged into one mesh per material (the kit's towers are thousands of window boxes)
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const put = (g: THREE.BufferGeometry, m: THREE.Material) => { if (!buckets.has(m)) buckets.set(m, []); buckets.get(m)!.push(g); };
  const slab = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, solid = false) => {
    put(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), clay(color));
    if (solid) SOLIDS.push([x0, x1, y0, y1, z0, z1]);
  };
  SOLIDS.length = 0;
  for (const L of LOTS) {
    const cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2, r = rng(L.seed * 13 + 5);
    slab(L.x0 - 3, L.x1 + 3, 0, 0.2, L.z0 - 3, L.z1 + 3, GREY.light);     // the pavement round the lot
    SOLIDS.push([L.x0 - 0.3, L.x1 + 0.3, 0, L.h + 0.5, L.z0 - 0.3, L.z1 + 0.3]);
    if (L.kit) {
      const b = building(28, 26, L.h, L.seed, L.seed % 2 ? GREY.light : GREY.paper);
      b.position.set(cx, 0, cz); b.rotation.y = L.face > 0 ? 0 : Math.PI; b.updateMatrixWorld(true);
      b.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) put(m.geometry.clone().applyMatrix4(m.matrixWorld), m.material as THREE.Material); });
    } else {
      // a far tower: a block with a band at every floor line and a cap
      slab(L.x0, L.x1, 0, L.h, L.z0, L.z1, L.seed % 2 ? GREY.light : GREY.paper);
      slab(L.x0 - 0.2, L.x1 + 0.2, L.h, L.h + 0.5, L.z0 - 0.2, L.z1 + 0.2, GREY.set);
      for (let y = 4.4; y < L.h - 1.5; y += 3.4) slab(L.x0 - 0.05, L.x1 + 0.05, y - 0.5, y + 0.5, L.z0 - 0.05, L.z1 + 0.05, GREY.mid);
    }
    const hx = lerp(L.x0 + 5, L.x1 - 5, r()), hz = lerp(L.z0 + 5, L.z1 - 5, r());   // something on the roof
    slab(hx - 3, hx + 3, L.h + 0.5, L.h + 3.6, hz - 2.4, hz + 2.4, GREY.set, true);
  }
  // the window ledge and the fixed ends of its glass lip
  slab(-2.4, 2.4, Y0 - 0.24, Y0, 0, LIP.z0, GREY.set, true);
  slab(-2.4, LIP.x0 - 0.06, Y0 - LIP.th, Y0, LIP.z0, LIP.z1, GLASS, true); slab(LIP.x1 + 0.06, 2.4, Y0 - LIP.th, Y0, LIP.z0, LIP.z1, GLASS, true);
  for (const [m, gs] of buckets) { const mesh = new THREE.Mesh(mergeGeometries(gs), m); mesh.castShadow = mesh.receiveShadow = true; mesh.name = "city"; w.add(mesh); }
  // the plates that break away
  SHARDS.forEach((s, i) => {
    const shape = new THREE.Shape(s.corners.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: LIP.th, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -LIP.th / 2, 0);
    const m = new THREE.Mesh(g, clay(GLASS, 0.6)); m.castShadow = m.receiveShadow = true; m.name = "glass shard"; m.position.copy(s.p0);
    m.userData.dressing = true;                                        // left out of a render made with --no-scenery
    w.add(m, "shard" + i);
  });
  // The lip as one intact slab, for the reference variant with no breaking glass. It is shown only when the plates are
  // hidden (a --no-scenery render hides them just before drawing), so a normal render never sees it.
  const lip = new THREE.Mesh(new THREE.BoxGeometry(LIP.x1 - LIP.x0 + 0.12, LIP.th, LIP.z1 - LIP.z0), clay(GLASS, 0.6));
  lip.position.set(0, Y0 - LIP.th / 2, (LIP.z0 + LIP.z1) / 2); lip.castShadow = lip.receiveShadow = true; lip.name = "lip whole"; lip.visible = false;
  w.add(lip, "lipWhole");
  const plate = w.parts.get("shard0")!;
  w.scene.onBeforeRender = () => { lip.visible = !plate.visible; };
  pitchStandIn(w);
}
const GLASS = "#efeee9";

let now = 0;
function tick(w: KitWorld, t: number) {
  now = t;
  const hero = w.actors.get("HERO");
  if (hero) {
    const b = body(t); hero.root.position.copy(b.root); hero.root.quaternion.copy(b.quat);
    // both feet stay where they stand (the jump clip's own stance) until the push lifts them: no slide as the crouch blends in
    const pin = 1 - smoother((t - (TO - 0.13)) / 0.1);
    if (hero.rig && pin > 0) for (const [f, x, z] of STANCE) hero.rig.pinFoot(f, V(P0.x + x, P0.y + 0.1, P0.z + z), pin);
  }
  SHARDS.forEach((s, i) => { const o = w.parts.get("shard" + i); if (!o) return; const p = shardAt(s, t); o.position.copy(p.pos); o.quaternion.copy(p.quat); });
}

// Workaround for shared code: src/standins.ts fits a person's capsule in a frame that only turns with their yaw, so a
// body tipping into a dive becomes a ball, then a flat slab. Here the capsule the stand-in pass adds to the scene is
// refitted in the body's own frame (pitch included) whenever its matrix is built, so the pill dives with the body.
// In the air it keeps a person's length and a trunk's width (the jump clip tucks the knees, which would make it a barrel).
function pitchStandIn(w: KitWorld) {
  const add = w.scene.add.bind(w.scene);
  w.scene.add = ((...objs: THREE.Object3D[]) => {
    for (const g of objs) {
      const cap = g.children[0] as THREE.Mesh | undefined, dot = g.children[1] as THREE.Mesh | undefined;
      if (!(g as THREE.Group).isGroup || !cap || !dot || cap.geometry?.type !== "CapsuleGeometry") continue;
      const base = g.updateMatrix.bind(g);
      g.updateMatrix = () => { refit(w, g, cap, dot); base(); };
    }
    return add(...objs);
  }) as typeof w.scene.add;
}
function refit(w: KitWorld, g: THREE.Object3D, cap: THREE.Mesh, dot: THREE.Mesh) {
  const a = w.actors.get("HERO");
  if (!a?.rig || !g.visible) return;
  const q = a.root.getWorldQuaternion(new THREE.Quaternion()), inv = q.clone().invert(), m = a.rig.marks();
  const local = (p: THREE.Vector3, dy = 0) => { const l = p.clone().applyQuaternion(inv); l.y += dy; return l; };
  const foot = (n: string) => local(a.rig!.bone[n].getWorldPosition(new THREE.Vector3()), -0.09);      // the sole under the ankle
  const pts = [local(m.top), local(m.eye), foot("foot_l"), foot("foot_r"), ...m.joints.filter((j) => j.name !== "elbow" && j.name !== "wrist").map((j) => local(j.p))];
  const lo = V(Infinity, Infinity, Infinity), hi = V(-Infinity, -Infinity, -Infinity);
  for (const p of pts) { lo.min(p); hi.max(p); }
  const pad = 0.12, size = V(Math.max(0.42, hi.x - lo.x + 2 * pad), Math.max(0.3, hi.y - lo.y + 0.08), Math.max(0.3, hi.z - lo.z + 2 * pad));
  const air = smoother((now - TO) / 0.2);
  size.x = lerp(size.x, Math.min(size.x, 0.62), air); size.y = lerp(size.y, Math.max(size.y, 1.7), air);
  const mid = lo.clone().add(hi).multiplyScalar(0.5), r = Math.min(0.22, size.x * 0.45);
  g.position.copy(mid.clone().applyQuaternion(q)); g.quaternion.copy(q);
  cap.scale.set(size.x, size.y / 2, size.z);
  dot.scale.set(r, 0.02, r); dot.position.set(0, clamp(local(m.eye).y - mid.y, -size.y / 2 + r, size.y / 2 - r), size.z / 2 + 0.006);
}

// the hero's marks for the planner (focus, the shadow's centre): the soles' point of an upright body at the centre
const PATH: PathKey[] = (() => {
  const keys: PathKey[] = [{ t: 0, at: [P0.x, P0.y, P0.z], yaw: 0 }, { t: TO - LEAN - 0.02, at: [P0.x, P0.y, P0.z] }];
  for (let w = TO - LEAN + 0.04; w <= W_END + 0.6; w += 0.04) { const c = centre(w); keys.push({ t: +w.toFixed(3), at: [c.x, c.y - H0, c.z] }); }
  return keys;
})();
const HERO: ActorSpec = { id: "HERO", name: "Hero", kind: "human", tint: "ochre", capsule: "trunk", path: PATH, acts: [{ kind: "clip", clip: "Jump_Start", t0: TO - 0.21, t1: TO + 1.1, ease: 0.5 }, { kind: "clip", clip: "Jump_Loop", t0: TO + 1.6, ease: 0.5 }] };

export const PIECE: Piece = makeProduct(
  {
    id: "FAM04-LeapOfFaith", name: "Leap of faith",
    says: "A jump there is no taking back. They dive off a tower and drop at full speed; the camera dives after them and the world turns over. Time stretches only on the frame where the fall becomes a rise: the city hangs from the top of the picture and they float up through it. Then we close on their face, still falling.",
    use: "A first leap, a point of no return, any fall the story turns on. Once per film. Let the inverted frame have its moment before the push-in.",
    numbers: "28 to 35 mm, one 13.1 s take. Full shot on a window ledge 205 m up, held 1 s. Toe-off at 1.6 s (2.0 m/s up, 3.6 m/s out), then 3.3 s of real-speed fall: the camera climbs to look 70° down as they drop away to 16.6 m, then dives after them (peak 44 m/s), swinging 75° to their side and rolling 180° (peak 87°/s). At 4.9 s they are doing 30.6 m/s, 47 m down; the clock eases to 0.035 by 5.6 s as the camera lands level on the inverted wide: the figure 19.6% of frame height in the middle, falling 1.2 m/s in playback. The wide sits 1.5 s. From 7.1 to 11.6 s the camera pushes in to 1.5 m from the face (peak 6.8 m/s), arcing 30° to square on; the last 1.5 s hold the close-up.",
    avoid: "Slow motion before the inverted frame: the fall has to be a real fall. A roll in steps, or a cut into the inverted frame: it is one turn about the figure. Towers behind the figure in the wide: keep open sky under them. Any tumble once the push-in starts: the face must hold still in frame.",
  },
  { sky: "day", keyDir: [-0.5, 0.62, 0.6], build, tick, clock: CLOCK },
  [HERO],
  () => [{ start: 0, end: T_END, label: `${MM}-${MM1}mm  LEAP OF FAITH · ROLL 180, PUSH IN`, rig: "VIRTUAL CAMERA · ROLL", subject: "HERO", size: "FS", sizeEnd: "MCU", stop: 4, shadow: 60, cam: (t) => camAt(t), cut: "Opens the template", flags: ["compound", "centre"], note: `Real speed to ${SLOW[0]} s, clock eased to ${RATE} by ${SLOW[1]} s` }],
);

/** the template's own numbers, for the measuring probe */
export const FAM04 = { CLOCK, TO, BREAK, T_END, W_END, MM, Y0, H0, G, LIP, SHARDS, SOLIDS, LOTS, SLOW, RATE, PUSH, WIDE_T, FACE, camAt, centre, pitch, twist, body, face, shardAt };
