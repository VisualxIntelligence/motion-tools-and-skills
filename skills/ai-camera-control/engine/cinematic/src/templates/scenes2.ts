// Action scene templates: sets with coverage patterns for chases, fights, heists and stand-offs, some with baked physics.
// Same grammar as scenes.ts: a kit set, actors on timed paths, 4–6 shots on named rigs, every frame through the measured
// pass and the motion check. Debris is baked (src/kit/physics.ts): the render only reads the table.
import * as THREE from "three";
import { planner, scenePiece, speedRamp, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { GREY, clay, shadeAll } from "../kit/clay";
import { around, lag, rig, type Subj } from "../kit/rigs";
import { RIG_POSES } from "../kit/rig";
import { BakedSet } from "../kit/physics";
import { aimFor } from "../framer";
import { barrel, building, crate, ground, lampPost, shelf } from "../kit/props";
import { rng, smoother, ramp, lerp } from "../util";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import type { TemplateInfo } from "./cameras";
import { SCENE_INFO } from "./scenes";
import { BLAST, BRICK_AT, CAR_KEYS, CRASH, KB_IN, KEGS, KNOCK, densePath, kbLift, phys } from "./physics-specs";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const make = (info: TemplateInfo & { pattern: string }, spec: Omit<SceneSpec, "id" | "title">, shots: (P: ReturnType<typeof planner>) => ShotDef[]): Piece => {
  SCENE_INFO.push(info);
  const full: SceneSpec = { id: info.id, title: info.name.toUpperCase(), ...spec };
  return scenePiece(full, shots(planner(full)), { scene: info.id });
};
const human = (id: string, name: string, tint: ActorSpec["tint"], path: ActorSpec["path"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ id, name, kind: "human", tint, path, ...extra });
const clip = (name: string, t0: number, t1?: number, ease?: number) => ({ kind: "clip" as const, clip: name, t0, t1, ease });
/** a clip entered `skip` seconds in, switched on at `at`: the act starts `skip` early and a negative ease holds its weight
 *  at 0 until then (the kit floors ramp lengths at 1 ms, so the switch lands on the frame). For clips whose first frames
 *  are a wind-up the action has already done (a jump's crouch, a knockback's doubled-over start) */
/** a clip entered `skip` seconds in (its opening frames are not used), blended in over two frames so nothing snaps */
const clipFrom = (name: string, at: number, skip: number, t1?: number) => ({ kind: "clip" as const, clip: name, t0: at, t1, ease: 0.08, from: skip });
/** a subject's eyes a little lower than standing (a fighting crouch, a runner's lean): the framer plans from standing */
const drop = (s: Subj, dy: number): Subj => (t) => { const m = s(t); return { ...m, eye: m.eye.clone().add(V(0, -dy, 0)) }; };
const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c)); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; return m; };
const cylinder = (r: number, h: number, c: string, x: number, y: number, z: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), clay(c)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
/** progress 0..1 through a leg from t0 to t1 at a steady pace, accelerating and settling over `a` seconds each end */
const trap = (t: number, t0: number, t1: number, a = 0.45) => {
  const T = t1 - t0, x = Math.min(T, Math.max(0, t - t0)), e = Math.min(a, T / 2), v = 1 / (T - e);
  return x < e ? (0.5 * v / e) * x * x : x > T - e ? 1 - (0.5 * v / e) * (T - x) * (T - x) : v * (x - e / 2);
};
/** a walk through marks: [arrive-by time, x, z] legs, each leg leaving at the previous mark's `leave` time */
const walkPath = (marks: { t0: number; t1: number; from: [number, number]; to: [number, number] }[], t0: number, t1: number) =>
  densePath((t) => { let p = marks[0].from; for (const m of marks) if (t >= m.t0) { const k = trap(t, m.t0, m.t1); p = [lerp(m.from[0], m.to[0], k), lerp(m.from[1], m.to[1], k)]; } return p; }, t0, t1, 0.1);
/** a fixed camera aimed at a point (or at a moving point), a pure function of t */
const fixed = (pos: THREE.Vector3, look: THREE.Vector3 | ((t: number) => THREE.Vector3), mm: number, at: [number, number] = [0, 0]) => (t: number): Cam => ({ pos: pos.clone(), target: aimFor(pos, typeof look === "function" ? look(t) : look, mm, at), mm });
/** the baked debris of a scene: built into the set, posed by the world's clock in tick */
const debris = (w: KitWorld, id: string) => { const s = new BakedSet(phys(id)); s.group.userData.set = s; w.add(s.group, "debris"); return s; };
const tickDebris = (w: KitWorld, t: number) => (w.parts.get("debris")?.userData.set as BakedSet | undefined)?.update(t);

/** a crouching body plans from its crouched landmarks: the rig's marks for a clip read as standing, so the framer would
 *  aim over its head. `w(t)` is how crouched it is (0..1) */
const lowered = (s: Subj, w: (t: number) => number): Subj => (t) => {
  const m = s(t), k = w(t);
  if (k <= 0) return m;
  const A = RIG_POSES.stand, B = RIG_POSES.crouch, g = m.sole.y;
  const at = (v: THREE.Vector3, key: keyof typeof A) => new THREE.Vector3(v.x, g + lerp(A[key], B[key], k), v.z);
  const L = m.ladder;
  return { ...m, eye: at(m.eye, "eye"), top: at(m.top, "top"), height: lerp(A.top, B.top, k),
    ladder: L ? { chin: at(L.chin, "chin"), chest: at(L.chest, "chest"), waist: at(L.waist, "waist"), thigh: at(L.thigh, "thigh"), ankle: at(L.ankle, "ankle") } : undefined };
};

/** a clay pistol in an actor's right hand (the hand bone's +Y runs along the fingers, +Z up the back of the hand when
 *  aiming), with a white muzzle flash shown between flash[0] and flash[1]. Attached on the first frame the rig exists */
function pistols(w: KitWorld, t: number, ids: string[], flash: Record<string, [number, number]> = {}) {
  for (const id of ids) {
    const a = w.actors.get(id); const hand = a?.rig?.bone.hand_r; if (!hand) continue;
    let gun = hand.getObjectByName("pistol");
    if (!gun) {
      const g = new THREE.Group(); g.name = "pistol";
      const dark = clay(GREY.ink, 0.7);
      const barrelM = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.19, 0.04), dark); barrelM.position.set(0, 0.13, 0.045); g.add(barrelM);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.045, 0.08), dark); grip.position.set(0, 0.075, 0.0); g.add(grip);
      const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), clay(GREY.paper, 0.5, { emissive: "#ffffff", ei: 2.2 })); fl.name = "flash"; fl.position.set(0, 0.25, 0.045); fl.visible = false; g.add(fl);
      // the motion check reads set pieces as solids: a gun in the hand is part of the body
      g.traverse((o) => { o.userData.noPathTrace = true; if ((o as THREE.Mesh).isMesh) { o.castShadow = true; } });
      hand.add(g);
      const s = hand.getWorldScale(new THREE.Vector3()); g.scale.setScalar(1 / s.x);
      gun = g;
    }
    const f = flash[id], fl = gun.getObjectByName("flash")!;
    fl.visible = !!f && t >= f[0] && t <= f[1];
    if (fl.visible) fl.scale.setScalar(1 + 2.5 * ramp(t, f[0], f[1]));
  }
}
/** a burst of dust: clay puffs that swell from a point after t0, drift up and settle (the explosion's moving layer) */
function puffs(w: KitWorld, name: string, center: [number, number, number], n: number, seed: number, size = 1) {
  const g = new THREE.Group(); g.name = name; const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), clay(i % 3 ? GREY.light : GREY.paper, 0.98));
    m.userData = { noPathTrace: true, dir: new THREE.Vector3(r() - 0.5, 0.3 + r() * 0.6, r() - 0.5).normalize(), sp: (0.8 + r() * 1.6) * size, s: (0.35 + r() * 0.5) * size };
    m.castShadow = false; m.receiveShadow = true; m.visible = false; g.add(m);
  }
  g.position.set(...center); w.add(g, name);
}
function tickPuffs(w: KitWorld, name: string, t: number, t0: number, life = 6) {
  const g = w.parts.get(name); if (!g) return;
  const x = t - t0;
  for (const m of g.children) {
    const u = m.userData as { dir: THREE.Vector3; sp: number; s: number };
    m.visible = x > 0 && x < life;
    if (!m.visible) continue;
    const grow = 1 - Math.exp(-x * 4), d = u.sp * (1 - Math.exp(-x * 1.6)) * 2.6;
    m.position.copy(u.dir).multiplyScalar(d).add(V(0, x * 0.25, 0));
    m.scale.setScalar(Math.max(0.01, u.s * (0.3 + grow * 0.95) * (1 - smoother((x - life * 0.55) / (life * 0.45)))));
  }
}

// =====================================================================================================================
// SC06 rooftop chase
// =====================================================================================================================
const JUMP = 7.6, FLIGHT = 0.75, ROOF_A = 8.5, ROOF_B = 7.5, VY = (ROOF_B - ROOF_A + 4.905 * FLIGHT * FLIGHT) / FLIGHT;
const kitX = (t: number) => -0.3 + 5 * (t - JUMP);
const kitY = (t: number) => { const x = t - JUMP; return x <= 0 ? ROOF_A : x >= FLIGHT ? ROOF_B : ROOF_A + VY * x - 4.905 * x * x; };
const BRAKE = JUMP + (-3.4 + 0.3 + 3.7) / 5;
const rookX = (t: number) => { if (t <= BRAKE) return kitX(t) - 3.7; const x = Math.min(t - BRAKE, 1); return -3.4 + 5 * x - 2.5 * x * x; };
/** where a runner's eyes really are through the jog cycle (measured on the rig: height off standing, distance ahead of
 *  the feet, 20 steps a cycle). The planner reads a standing figure; a runner leans 0.27 m forward and bobs 0.11 m */
const JOG_EYE = [[-0.165, 0.369], [-0.232, 0.359], [-0.264, 0.344], [-0.229, 0.349], [-0.172, 0.372], [-0.115, 0.388], [-0.078, 0.39], [-0.069, 0.383], [-0.077, 0.373], [-0.104, 0.362], [-0.154, 0.352], [-0.222, 0.341], [-0.26, 0.337], [-0.226, 0.344], [-0.157, 0.351], [-0.086, 0.357], [-0.048, 0.362], [-0.046, 0.365], [-0.066, 0.367], [-0.105, 0.369]];
/** the jog's eye offset for a runner on a straight line along +x that set off from x0 (the cycle runs on distance / 4.8 m) */
const jogEye = (x: number, x0: number) => { const c = ((((x - x0) / 4.8) % 1) + 1) % 1 * 20, i = Math.floor(c) % 20, j = (i + 1) % 20, k = c - Math.floor(c); return [lerp(JOG_EYE[i][0], JOG_EYE[j][0], k), lerp(JOG_EYE[i][1], JOG_EYE[j][1], k)]; };
const runner = (s: Subj, x0: number): Subj => (t) => { const m = s(t), [dy, dz] = jogEye(m.sole.x, x0); return { ...m, eye: m.sole.clone().setY(m.sole.y + 1.64 + dy).add(V(dz, 0, 0)), top: m.top.clone().add(V(dz - 0.09, dy, 0)) }; };
const KIT_X0 = -0.3 + 5 * (-2 - 7.6);
const roofClock = speedRamp([[0, 1], [7.62, 1], [7.8, 0.22], [9.6, 0.22], [10.1, 1]]);

function buildRoofs(w: KitWorld) {
  w.add(ground(700, 0, 400, GREY.mid));
  const A = building(59.6, 16, ROOF_A - 0.5, 61, GREY.light); A.position.set(-30, 0, 0); w.add(A);
  const B = building(56.8, 16, ROOF_B - 0.5, 62, GREY.set); B.position.set(2.8 + 28.4, 0, 0); w.add(B);
  // the street down the gap, and the blocks round about (a city below and beyond the two roofs)
  const road = new THREE.Mesh(new THREE.PlaneGeometry(400, 8), clay(GREY.dark, 0.95)); road.rotation.x = -Math.PI / 2; road.position.y = 0.01; road.receiveShadow = true; w.add(road).position.z = 14;
  const r = rng(66);
  for (const s of [-1, 1]) for (let x = -110; x < 120; ) { const f = 10 + r() * 12, h = 5 + r() * 24; const b = building(f, 12, h, Math.floor(r() * 999), r() > 0.5 ? GREY.light : GREY.set); b.position.set(x + f / 2, 0, s * (24 + r() * 6)); b.rotation.y = s > 0 ? Math.PI : 0; w.add(b); x += f + 1; }
  for (let i = 0; i < 6; i++) { const h = 30 + r() * 30, b = building(14, 14, h, 300 + i, GREY.set); b.position.set(-90 + i * 40 + r() * 10, 0, -70 - r() * 30); w.add(b); }
  // roof dressing, kept off the runners' lane (|z| < 2.5) and the tracking camera's (z 2–4 on roof A)
  const dress = (y: number, items: [number, number, "ac" | "vent" | "sky" | "stack"][]) => {
    for (const [x, z, k] of items) {
      if (k === "ac") { w.add(box(2.2, 1.3, 1.6, GREY.set, x, y + 0.65, z)); w.add(box(1.6, 0.12, 1.2, GREY.mid, x, y + 1.36, z)); }
      if (k === "vent") { w.add(cylinder(0.25, 1.1, GREY.mid, x, y + 0.55, z)); w.add(box(0.7, 0.12, 0.7, GREY.dark, x, y + 1.15, z)); }
      if (k === "sky") w.add(box(3, 0.5, 2, GREY.dark, x, y + 0.25, z));
      if (k === "stack") w.add(box(1.0, 2.6, 1.0, GREY.set, x, y + 1.3, z));
    }
  };
  dress(ROOF_A, [[-34, -5, "ac"], [-27, -4.2, "vent"], [-21, -5.5, "sky"], [-15, -4, "ac"], [-9, -5, "vent"], [-5, -4.5, "stack"], [-30, -6.6, "stack"], [-18, -6.8, "vent"], [-12, -2.9, "vent"], [-3, -6.5, "sky"]]);
  dress(ROOF_B, [[8, -4.5, "ac"], [12, 5.5, "vent"], [20, -5, "sky"], [26, 5, "ac"], [33, -4, "vent"], [40, 4.5, "stack"]]);
  // the landmark: a water tower on roof B that both runners pass
  const tower = new THREE.Group();
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tower.add(box(0.18, 3, 0.18, GREY.dark, x, 1.5, z));
  tower.add(cylinder(1.6, 3.2, GREY.set, 0, 4.6, 0)); const cap = new THREE.Mesh(new THREE.ConeGeometry(1.75, 0.9, 16), clay(GREY.mid)); cap.position.y = 6.65; tower.add(cap);
  tower.position.set(16, ROOF_B, -5.2); w.add(shadeAll(tower));
}

// =====================================================================================================================
// SC07 alley fight
// =====================================================================================================================
function buildAlley(w: KitWorld) {
  w.add(ground(400, 0, 200, GREY.mid));
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(6, 80), clay(GREY.ground, 0.97)); lane.rotation.x = -Math.PI / 2; lane.position.y = 0.005; lane.receiveShadow = true; w.add(lane);
  const r = rng(71);
  for (const s of [-1, 1]) for (let z = -40; z < 40; ) { const f = 9 + r() * 8, h = 10 + r() * 14; const b = building(f, 10, h, Math.floor(r() * 999), r() > 0.5 ? GREY.light : GREY.set); b.position.set(s * 8, 0, z + f / 2); b.rotation.y = -s * Math.PI / 2; w.add(b); z += f; }
  // bins, pallets, a pipe, a bulkhead lamp: the clutter of an alley, all against the walls
  w.add(box(1.8, 1.25, 1.1, GREY.dark, -2.35, 0.62, 4.2)); w.add(box(1.9, 0.12, 1.2, GREY.ink, -2.35, 1.3, 4.2));
  w.add(box(1.8, 1.25, 1.1, GREY.dark, 2.35, 0.62, -6.5));
  w.add(box(1.2, 0.15, 1.2, GREY.set, 2.3, 0.08, 3.2)); w.add(box(1.2, 0.15, 1.2, GREY.set, 2.3, 0.23, 3.25, 0.1));
  for (const [x, z] of [[-2.5, -3.2], [2.5, 6.5], [-2.55, 9]]) { const b = barrel(1); b.position.set(x, 0, z); w.add(b); }
  for (const [x, z, s] of [[2.45, 1.4, 0.7], [2.5, 2.2, 0.6], [-2.5, -5.5, 0.8]]) { const c = crate(s); c.position.set(x, 0, z); c.rotation.y = x * 0.3; w.add(c); }
  w.add(cylinder(0.08, 9, GREY.dark, -2.9, 4.5, -1.8));
  w.add(box(0.3, 0.2, 0.25, GREY.paper, -2.85, 3.6, 0.6)).children;
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.3), clay(GREY.paper, 0.6, { emissive: "#ffffff", ei: 0.9 })); lamp.position.set(-2.82, 3.4, 0.6); w.add(lamp);
  debris(w, "SC07-crates");
}

// =====================================================================================================================
// SC08 heist approach
// =====================================================================================================================
/** a warehouse of solid boxes (seen from both sides), front at z = front, a door opening at x = doorX */
function warehouse(w: KitWorld, x0: number, x1: number, front: number, depth: number, h: number, doorX: number, doorW = 1.6, doorH = 2.4) {
  const c = GREY.set, t = 0.3, back = front - depth;
  w.add(box(doorX - doorW / 2 - x0, h, t, c, (x0 + doorX - doorW / 2) / 2, h / 2, front));
  w.add(box(x1 - (doorX + doorW / 2), h, t, c, (doorX + doorW / 2 + x1) / 2, h / 2, front));
  w.add(box(doorW, h - doorH, t, c, doorX, doorH + (h - doorH) / 2, front));
  w.add(box(x1 - x0, h, t, c, (x0 + x1) / 2, h / 2, back));
  for (const x of [x0, x1]) w.add(box(t, h, depth, c, x, h / 2, front - depth / 2));
  w.add(box(x1 - x0 + 0.6, 0.35, depth + 0.6, GREY.mid, (x0 + x1) / 2, h + 0.17, front - depth / 2));
  // the door frame and a step: the doorway reads from outside and frames the POV from in front of it
  w.add(box(0.12, doorH, 0.42, GREY.dark, doorX - doorW / 2 - 0.06, doorH / 2, front)); w.add(box(0.12, doorH, 0.42, GREY.dark, doorX + doorW / 2 + 0.06, doorH / 2, front));
  w.add(box(doorW + 0.24, 0.12, 0.42, GREY.dark, doorX, doorH + 0.06, front));
  // inside: a dark floor, shelving down the back, crates, and one hanging lamp the guard walks under
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, depth), clay(GREY.dark, 0.97)); floor.rotation.x = -Math.PI / 2; floor.position.set((x0 + x1) / 2, 0.01, front - depth / 2); floor.receiveShadow = true; w.add(floor);
  for (let i = 0; i < 5; i++) { const s = shelf(2.2, 2.4); s.position.set(x0 + 1.8 + i * 2.6, 0, back + 0.5); w.add(s); }
  for (const [x, z] of [[x0 + 1.2, front - 2.2], [x1 - 1.4, front - 3.0], [x1 - 1.4, front - 3.9]]) { const cr = crate(0.9); cr.position.set(x, 0, z); w.add(cr); }
  w.add(cylinder(0.01, 1.4, GREY.ink, doorX, h - 0.7, front - 5.8));
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 16, 1, true), clay(GREY.paper, 0.6, { emissive: "#fff6e8", ei: 1.4, side: THREE.DoubleSide })); shade.position.set(doorX, h - 1.5, front - 5.8); w.add(shade);
}
// the crouch-walk runs at the clip's own pace (0.72 m/s), so the planted foot holds: to the turn, to the door, a wait,
// then up and in at a walk. Ash crouch-walks to the corner and stands to keep watch
const NA = V(-2.5, 0, -3.0), NC = V(2, 0, -7.75), ND = V(2, 0, -11.3), CLIP0 = -2;
/** the crouch clip's planted-foot speed through its 2 s cycle (measured, 40 bins). At the foot change (bins 26–29) the
 *  clip drags its trailing foot forward: the body all but pauses there, which keeps that drag smallest */
const CROUCH_V = [0.241, 0.257, 0.262, 0.329, 0.427, 0.496, 0.582, 0.64, 0.714, 0.76, 0.82, 0.855, 0.904, 0.926, 0.966, 0.979, 1.005, 1.008, 1.007, 0.433, 0.691, 0.651, 0.693, 0.705, 0.705, 0.477, 0.2, 0.2, 0.2, 0.2, 0.723, 0.723, 0.731, 0.733, 0.738, 0.741, 0.736, 0.734, 0.727, 0.643];
/** distance crouch-walked since `from`, the body's speed following the clip's phase so the planted foot never slides */
const crouchDist = (from: number) => {
  const dt = 1 / 240, tab: number[] = [0];
  const v = (t: number) => { const x = ((((t - CLIP0) / 2) % 1) + 1) % 1 * 40, i = Math.floor(x) % 40, j = (i + 1) % 40; return lerp(CROUCH_V[i], CROUCH_V[j], x - Math.floor(x)); };
  for (let t = from; t < from + 30; t += dt) tab.push(tab[tab.length - 1] + v(t + dt / 2) * dt);
  const at = (t: number) => { if (t <= from) return 0; const x = (t - from) / dt, i = Math.min(Math.floor(x), tab.length - 2); return tab[i] + (tab[i + 1] - tab[i]) * (x - i); };
  const when = (d: number) => { let lo = from, hi = from + 30; for (let n = 0; n < 50; n++) { const m = (lo + hi) / 2; if (at(m) < d) lo = m; else hi = m; } return hi; };
  return { at, when };
};
const along = (pts: THREE.Vector3[], d: number) => { for (let i = 0; i + 1 < pts.length; i++) { const L = pts[i].distanceTo(pts[i + 1]); if (d <= L || i + 2 === pts.length) return pts[i].clone().lerp(pts[i + 1], Math.min(1, d / L)); d -= L; } return pts[pts.length - 1].clone(); };
const NLEN = NA.distanceTo(NC), NYX_IN = 16.2;
/** he sets off when his arrival falls where the clip all but pauses (phase 0.7, the foot change), so he stops dead */
const NS = (() => { let best = -1, err = 9; for (let s0 = -1.6; s0 <= -0.4; s0 += 0.01) { const T = crouchDist(s0).when(NLEN), ph = ((((T - CLIP0) / 2) % 1) + 1) % 1, e = Math.abs(ph - 0.7); if (e < err) { err = e; best = s0; } } return best; })();
const NCW = crouchDist(NS), NYX_AT = NCW.when(NLEN);
const nyxPath = densePath((t) => { const p = t <= NYX_AT ? along([NA, NC], NCW.at(t)) : NC.clone().lerp(ND, trap(t, NYX_IN, NYX_IN + 3.2, 0.5)); return [p.x, p.z]; }, -1.6, 21, 0.05)
  .map((k) => (k.t > NYX_AT + 0.1 && k.t < NYX_IN ? { ...k, yaw: Math.PI } : k));
const AA = V(-4.6, 0, -2.4), AB = V(-4.1, 0, -9.0);
const AS = (() => { let best = -0.6, err = 9; for (let s0 = -1.2; s0 <= 0; s0 += 0.01) { const T = crouchDist(s0).when(AA.distanceTo(AB)), ph = ((((T - CLIP0) / 2) % 1) + 1) % 1, e = Math.abs(ph - 0.7); if (e < err) { err = e; best = s0; } } return best; })();
const ACW = crouchDist(AS), ASH_AT = ACW.when(AA.distanceTo(AB));
const ashPath = densePath((t) => { const p = along([AA, AB], Math.min(AA.distanceTo(AB), ACW.at(t))); return [p.x, p.z]; }, -1.2, 21, 0.05).map((k) => (k.t > ASH_AT + 0.2 ? { ...k, yaw: -Math.PI / 2 } : k));
function buildCompound(w: KitWorld) {
  w.add(ground(500, 0, 250, GREY.mid));
  // the compound wall with a closed gate, the street outside it, a lamp on each side
  w.add(box(18.5, 2.6, 0.4, GREY.light, -15.75, 1.3, 0)); w.add(box(26, 2.6, 0.4, GREY.light, 9.5, 1.3, 0));
  w.add(box(3.9, 2.2, 0.12, GREY.dark, -4.55, 1.1, 0.05));
  w.add(box(18.5, 0.15, 0.55, GREY.set, -15.75, 2.67, 0)); w.add(box(26, 0.15, 0.55, GREY.set, 9.5, 2.67, 0));
  const road = new THREE.Mesh(new THREE.PlaneGeometry(300, 8), clay(GREY.dark, 0.95)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 7); road.receiveShadow = true; w.add(road);
  for (const [x, z, ry] of [[-9, 2.2, Math.PI], [9, -1.2, 0]] as [number, number, number][]) { const l = lampPost(5); l.position.set(x, 0, z); l.rotation.y = ry; w.add(l); }
  warehouse(w, -3.5, 10.5, -9.5, 12, 5.5, 2);
  // cover in the courtyard: a crate pile and a parked van-sized block, off both crouch paths
  for (const [x, z, s] of [[-6.8, -5.5, 1], [-6.6, -6.6, 0.9], [-6.7, -6.0, 0.7]]) { const c = crate(s); c.position.set(x, s > 0.8 ? 0 : 1, z); w.add(c); }
  w.add(box(2.2, 2.2, 5, GREY.set, 7.5, 1.1, -4.5)); w.add(box(2.1, 0.8, 1.2, GREY.ink, 7.5, 1.6, -2.05));
  // across the street: low blocks, dark
  const r = rng(81);
  for (let x = -60; x < 60; ) { const f = 10 + r() * 10, b = building(f, 10, 6 + r() * 10, Math.floor(r() * 999), GREY.set); b.position.set(x + f / 2, 0, 18); b.rotation.y = Math.PI; w.add(b); x += f + 1; }
  for (let i = 0; i < 5; i++) { const b = building(12, 12, 14 + r() * 10, 400 + i, GREY.light); b.position.set(-30 + i * 15, 0, -32 - r() * 6); w.add(b); }
}

// =====================================================================================================================
// SC09 stand-off
// =====================================================================================================================
function buildWestern(w: KitWorld) {
  w.add(ground(600, 0, 300, GREY.ground));
  const r = rng(91);
  for (const s of [-1, 1]) {
    // false-front shops on a raised boardwalk, a hitching rail and a post at every shop
    w.add(box(80, 0.3, 3, GREY.set, 0, 0.15, s * 11.5));
    for (let x = -38; x < 38; ) {
      const f = 7 + r() * 5, h = 5 + r() * 3.5;
      const b = building(f, 8, h, Math.floor(r() * 999), r() > 0.5 ? GREY.light : GREY.paper); b.position.set(x + f / 2, 0.3, s * 17.4); b.rotation.y = s > 0 ? Math.PI : 0; w.add(b);
      w.add(box(f, 1.6, 0.25, r() > 0.5 ? GREY.light : GREY.paper, x + f / 2, 0.3 + h + 0.8, s * 13.5));
      w.add(box(f - 0.2, 0.12, 2.6, GREY.mid, x + f / 2, 3.2, s * 12)); for (const px of [x + 0.3, x + f - 0.3]) w.add(box(0.14, 2.9, 0.14, GREY.dark, px, 1.75, s * 10.4));
      x += f + 0.2;
    }
    for (let x = -30; x < 30; x += 9) { w.add(box(2.4, 0.08, 0.08, GREY.dark, x, 1.0, s * 9.6)); for (const px of [x - 1.1, x + 1.1]) w.add(box(0.1, 1.0, 0.1, GREY.dark, px, 0.5, s * 9.6)); }
  }
  // a water trough and a wagon on the near side: the frame's foreground pieces
  w.add(box(2.2, 0.6, 0.7, GREY.mid, -11, 0.3, 8.2)); w.add(box(3.4, 0.25, 1.6, GREY.dark, 14, 1.0, 7.5));
  for (const [x, z] of [[12.8, 6.6], [12.8, 8.4], [15.2, 6.6], [15.2, 8.4]]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20), clay(GREY.dark)); wh.position.set(x, 0.55, z); wh.castShadow = true; w.add(wh); }
  // a few tumbleweed-sized shrubs and a distant mesa line beyond the end of the street
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + r() * 0.2, 1), clay(GREY.mid, 0.98)); m.position.set(-25 + r() * 50, 0.25, -8 + r() * 16); if (Math.abs(m.position.z) < 2.5 || Math.abs(m.position.x - 3.6) < 3) continue; m.castShadow = true; w.add(m); }
  for (let i = 0; i < 7; i++) { const m = box(60 + r() * 40, 18 + r() * 25, 30, GREY.light, -400 + i * 120, 9, -320 - r() * 60); w.add(m); }
  debris(w, "SC09-kegs");
  puffs(w, "blast", [KEGS[0], 0.5, KEGS[1]], 24, 9, 0.9);
  const flash = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), clay(GREY.paper, 0.5, { emissive: "#ffffff", ei: 2.5 })); flash.position.set(KEGS[0], 0.7, KEGS[1]); flash.userData.noPathTrace = true; flash.visible = false; w.add(flash, "flash");
}
const westernClock = speedRamp([[0, 1], [13.85, 1], [14.05, 0.2], [17.1, 0.2], [18.1, 1]]);

// =====================================================================================================================
// SC10 car through the barrier
// =====================================================================================================================
function buildRoadblock(w: KitWorld) {
  w.add(ground(700, 0, 350, GREY.mid));
  const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 420), clay(GREY.dark, 0.95)); road.rotation.x = -Math.PI / 2; road.position.y = 0.01; road.receiveShadow = true; w.add(road);
  for (let z = -200; z < 200; z += 6) w.add(box(0.15, 0.012, 2.6, GREY.light, 0, 0.02, z));
  for (const s of [-1, 1]) {
    const walk = box(5, 0.16, 420, GREY.set, s * 6.5, 0.08, 0); w.add(walk);
    w.paving = (x) => (Math.abs(x) > 4 && Math.abs(x) < 9 ? 0.16 : 0);         // the sidewalks: walkers step up the kerb
    const r = rng(s > 0 ? 101 : 102);
    for (let z = -160; z < 160; ) { const f = 12 + r() * 14, h = 7 + r() * 10; const b = building(f, 14, h, Math.floor(r() * 999), r() > 0.5 ? GREY.light : GREY.set); b.position.set(s * 16.2, 0.16, z + f / 2); b.rotation.y = -s * Math.PI / 2; w.add(b); z += f + 3; }
    for (let z = -140; z < 140; z += 18) { const l = lampPost(5); l.position.set(s * 4.4, 0.16, z); l.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; w.add(l); }
  }
  // the warning signs before the barrier, and a parked truck down the far end
  for (const z of [-14, -24]) { w.add(box(0.08, 1.3, 0.08, GREY.dark, -3.6, 0.65, z)); w.add(box(0.9, 0.6, 0.05, GREY.paper, -3.6, 1.45, z)); }
  w.add(box(2.4, 2.8, 7, GREY.set, -2.6, 1.4, 48)); w.add(box(2.4, 2.0, 2.2, GREY.light, -2.6, 1.0, 43.2));
  debris(w, "SC10-barrier");
  puffs(w, "dust", [0.9, 0.4, 0.2], 10, 13, 0.6);
}
const crashClock = (t: number) => (t < 10.04 ? t : t < 14.04 ? CRASH - 0.25 + 0.2 * (t - 10.04) : t - 4.0);

// =====================================================================================================================
export const SCENE2_TEMPLATES: Piece[] = [
  make({ id: "SC06-RooftopChase", name: "Rooftop chase", pattern: "Chase drone geography → side tracking → snorricam → speed-ramped gap jump → OTS of the pursuer at the edge → drone rise",
    says: "One gets away, one is left at the edge: the gap between two roofs is the story.", use: "Foot chases, escapes, parkour, any pursuit with one obstacle that decides it.",
    numbers: "Chase drone 24 mm 9 m back and 4.5 m up, tracking 40 mm full figure at 5.8 m, snorricam 27 mm on a 2 m arm (the pursuer 3.7 m behind in the frame), the jump at 24 mm from a drone hovering off the roof with the world at 0.22× through the flight, OTS 50 mm, rise 24 mm to 4 m. Runners at 5 m/s; the jump 3.9 m across and 1 m down in 0.75 s, landed into a roll.",
    avoid: "Flipping screen direction: every camera stays on the near side of the run, so they always run left to right." },
    { sky: "day", build: buildRoofs, clock: roofClock, keyDir: [-0.45, 0.75, 0.5], motes: { center: [0, ROOF_A + 1, 0], size: [60, 5, 20], count: 260, drift: [0.6, 0.02, 0.1] },
      actors: [
        human("KIT", "Kit", "ochre", densePath((t) => [kitX(t), kitY(t), 0], -2, 17, 0.05), { acts: [clipFrom("Jump_Start", JUMP, 0.1, JUMP + 0.3), clip("Jump_Loop", JUMP + 0.4, JUMP + 0.68, 0.1), clip("Roll", JUMP + FLIGHT - 0.02, JUMP + FLIGHT + 0.8, 0.12)] }),
        human("ROOK", "Rook", "slate", densePath((t) => [rookX(t), ROOF_A, 0.7], -2, 17, 0.05), { acts: [{ kind: "lookDown", t0: 9.5, t1: 10.9, ease: 0.4 }], look: "KIT", lookFrom: 10.6 }),
      ] },
    (P) => [
      { start: 0, end: 3.6, label: "24mm  CHASE DRONE · GEOGRAPHY", rig: "CHASE DRONE · GIMBAL", subject: "ROOK", size: "WS", stop: 5.6, cam: rig.chase(P("ROOK"), 9, 4.5, 24, 2.5), cut: "Opens on the chase: both runners, the roof, the city", flags: ["enters-moving", "exits-moving", "centre"] },
      { start: 3.6, end: 5.9, label: "40mm  TRACKING · THE PURSUED", rig: "CABLECAM · HANDHELD HEAD", subject: "KIT", size: "FS", stop: 2.8, cam: rig.shake(rig.track(runner(P("KIT"), KIT_X0), { size: "FS", mm: 40, rise: 0.1 }, -1, 0.6), 1.5, 3), cut: "CUT in beside him: same direction of travel", flags: ["enters-moving", "exits-moving", "compound"] },
      { start: 5.9, end: 6.9, label: "27mm  SNORRICAM · THE GAP CLOSES", rig: "SNORRICAM · BODY RIG", subject: "KIT", size: "MS", stop: 2.8, cam: rig.shake((t) => { const K = runner(P("KIT"), KIT_X0)(t), c = rig.snorricam(P("KIT"), [0.35, 0.3, 2.0], 27)(t), b = K.eye.y - P("KIT")(t).eye.y; c.pos.y += b; return { ...c, target: aimFor(c.pos, K.eye, 27, [0.22, 1 / 3]), mm: 27 }; }, 1.6, 5), cut: "CUT to the body rig: the pursuer gains behind him", flags: ["enters-moving", "exits-moving", "centre", "compound"] },
      { start: 6.9, end: 10.15, label: "24mm  SPEED-RAMPED JUMP", rig: "DRONE · HOVER · PAN", subject: "KIT", size: "WS", stop: 4, cam: (t) => { const pos = V(1.2, ROOF_A + 3.6, 11.5), e = lag((x) => P("KIT")(x).eye, t, 0.1); return { pos, target: aimFor(pos, e, 24, [0, 0.1]), mm: 24 }; }, cut: "CUT wide off the roof: the gap opens under him, the world slows", flags: ["enters-moving", "exits-moving", "centre", "compound", "whip"], note: "a fast follow pan on a runner, which the pan rule exempts; flagged because the jump clip moves the head off the path the follow test reads" },
      { start: 10.15, end: 13.0, label: "50mm  OTS · THE PURSUER AT THE EDGE", rig: "STEADICAM", subject: "KIT", size: "MWS", sizeEnd: "WS", stop: 4, ots: "ROOK", cam: (t) => { const c = rig.ots(P("ROOK"), P("KIT"), 50, 1, 3.0, 0.6)(t); return { ...c, target: aimFor(c.pos, P("KIT")(11.3).eye, 50, [0.3, 0.25]) }; }, cut: "CUT behind the pursuer as he pulls up: the other is already away", flags: ["enters-moving", "short-side"] },
      { start: 13.0, end: 17.0, label: "24mm  DRONE RISE · RELEASE", rig: "DRONE", subject: "ROOK", size: "WS", sizeEnd: "EWS", stop: 5.6, cam: (t) => { const c = rig.crane(P("ROOK"), { size: "WS", mm: 24, deg: -165 }, 1.2, 4.2, 13, 17, 1.8)(t); return { ...c, target: V(12, ROOF_B - 1.6, 0.4) }; }, cut: "CUT wide behind him: the drone climbs away, he is left alone", flags: ["compound", "centre"] },
    ]),

  make({ id: "SC07-AlleyFight", name: "Alley fight", pattern: "Wide master → OTS over the attacker → single on him → crash-zoom insert on the blow → low handheld wide on the knockback → crane up, release",
    says: "Who hits whom, and what it costs: the crates behind him are shown before he goes into them.", use: "Fist fights, brawls, any two-person fight in a tight space.",
    numbers: "Master 24 mm from 3 m up, OTS 50 mm 3 m back (the shoulder a third), single 35 mm, crash zoom 32→100 mm in 0.24 s from 3 m, low wide 20 mm handheld at 0.45 m, crane up to 5.4 m on 24 mm. Fighters 0.95 m apart, punches land at their measured reach.",
    avoid: "Cutting before the blow completes, or crossing the line between the fighters: every camera is on their left." },
    { sky: "day", build: buildAlley, tick: tickDebris, keyDir: [0.35, 0.82, 0.45], motes: { center: [0, 1.6, 0], size: [5.6, 3, 14], count: 240, drift: [0.03, 0.02, 0.12] },
      actors: [
        human("VIC", "Vic", "ochre", walkPath([{ t0: 0.1, t1: 2.5, from: [0.3, 3.0], to: [0.3, 0.95] }, { t0: 12.4, t1: 15.9, from: [0.3, 0.95], to: [0.15, 5.0] }], -1, 16).map((k) => (k.t > 2.9 && k.t < 11.7 ? { ...k, yaw: Math.PI } : k.t >= 11.8 && k.t < 12.4 ? { ...k, yaw: 0.05 } : k)),
          { acts: [clip("Hit_Chest", 3.9, 4.3, 0.05), clip("Punch_Jab", 5.7, 6.55), clip("Hit_Head", 7.02, 7.45, 0.05), clip("Punch_Cross", 8.0, 9.0)], look: "BRICK", lookFrom: 0, lookTo: 11.6 }),
        human("BRICK", "Brick", "slate", densePath((t) => [BRICK_AT[0], kbLift(t, KNOCK), BRICK_AT[1]], -1, 16, 0.02).map((k) => ({ ...k, yaw: 0 })),
          { acts: [clip("Idle_FoldArms_Loop", -1, 1.8, 0.5), clip("Punch_Cross", 3.6, 4.6), clip("Hit_Head", 5.92, 6.35, 0.05), clip("Punch_Jab", 6.8, 7.65), clip("Hit_Knockback", KNOCK, undefined, 0.04)], look: "VIC", lookFrom: 0, lookTo: KNOCK }),
      ] },
    (P) => {
      const OTS_B = 3.0, OTS_O = 1.0, OTS_X = 0.5;   // the OTS over Vic: far enough back that his shoulder keeps to a third, Brick framed off it
      const BR = P("BRICK"), VI = P("VIC"), M = V(-1.6, 2.9, 7.2), Z = V(-2.7, 1.55, 0.2), LOW = V(-1.7, 0.45, 2.1);
      return [
        { start: 0, end: 3.3, label: "24mm  WIDE MASTER", rig: "TRIPOD", subject: "VIC", size: "WS", stop: 4, pair: ["VIC", "BRICK"], cam: fixed(M, V(0.3, 0.75, 0.6), 24), cut: "Opens on the alley: the crates behind him first", flags: ["centre"] },
        { start: 3.3, end: 5.4, label: "50mm  OTS · VIC ON BRICK", rig: "STEADICAM", subject: "BRICK", size: "MS", stop: 2.8, ots: "VIC", pair: ["VIC", "BRICK"], cam: (t) => { const c = rig.ots(P("VIC"), P("BRICK"), 50, -1, OTS_B, OTS_O)(t); return { ...c, target: aimFor(c.pos, drop(P("BRICK"), 0.055)(t).eye, 50, [-OTS_X, 1 / 3]) }; }, cut: "CUT in over his shoulder: the punch comes at us", flags: ["short-side"], note: "the swing turns his head off the line for a beat" },
        { start: 5.4, end: 7.5, label: "35mm  SINGLE · VIC", rig: "STEADICAM", subject: "VIC", size: "MWS", stop: 2.8, pair: ["VIC", "BRICK"], cam: rig.locked(drop(P("VIC"), 0.04), { size: "MWS", mm: 35, deg: 58 }, 6.0), cut: "CUT round to him, the answer and the reply (same side of the line)" },
        { start: 7.5, end: 8.25, label: "32→100mm  CRASH ZOOM · THE HIT", rig: "TRIPOD · ZOOM", subject: "BRICK", size: "MWS", sizeEnd: "CU", stop: 2.8, pair: ["VIC", "BRICK"], cam: (t) => { const k = smoother(ramp(t, 7.96, 8.2)), mm = 32 * Math.pow(100 / 32, k); return { pos: Z.clone(), target: aimFor(Z, BR(t).eye.add(V(0, -0.04, 0)), mm, [0, 1 / 3]), mm }; }, cut: "CUT side-on as he loads the cross: the lens slams in on the blow", flags: ["exits-moving", "centre", "whip"], note: "a crash zoom is a snap by design: the aim re-centres as the lens narrows" },
        { start: 8.25, end: 11.2, label: "20mm  LOW HANDHELD · INTO THE CRATES", rig: "HANDHELD · LOW", subject: "BRICK", size: "FS", stop: 4, pair: ["VIC", "BRICK"], cam: rig.shake(fixed(LOW, V(0.3, 0.8, -0.75), 20), 3, 2), cut: "CUT low on the blow itself: it folds him and throws him back into the stack", flags: ["centre"] },
        { start: 11.2, end: 15.625, label: "24mm  CRANE UP · RELEASE", rig: "TECHNOCRANE", subject: "VIC", size: "WS", stop: 5.6, pair: ["VIC", "BRICK"], cam: (() => {
          const up = (t: number) => ({ pos: V(-2.5, 3.4, -4.2).lerp(V(-2.0, 5.4, -5.8), smoother(ramp(t, 11.75, 15.6))) });
          return (t: number): Cam => { const pos = up(t).pos, e = lag((x) => VI(x).eye, t, 0.3); return { pos, target: aimFor(pos, e, 24, [0, 0.12]), mm: 24 }; };
        })(), cut: "CUT behind the wreck: the crane rises as he walks away", flags: ["compound", "centre", "exits-moving"] },
      ];
    }),

  make({ id: "SC08-HeistApproach", name: "Heist approach", pattern: "Crane over the wall → crouch-walk tracking → locked at the door → POV through the doorway → hold on the lookout → high wide as he slips in",
    says: "Getting in unseen: the wall, the walk, the door, and the one who keeps watch.", use: "Heists, infiltrations, stealth, any scene where being seen is the threat.",
    numbers: "Crane over the wall 28 mm from 5.3 m outside to 2.1 m inside, tracking 40 mm on the crouch-walk (0.72 m/s, paced to the clip), locked 32 mm at the door, POV 32 mm handheld at crouched eye height, the door frame in the frame, lookout hold 85 mm, high wide 40 mm from over the wall.",
    avoid: "Showing the guard before the POV: the doorway is where we learn he is there." },
    { sky: "dusk", build: buildCompound, keyDir: [0.6, 0.55, -0.6], motes: { center: [0, 1.5, -5], size: [20, 3, 16], count: 220, drift: [0.06, 0.01, -0.04] },
      actors: [
        human("NYX", "Nyx", "sage", nyxPath, { acts: [clip("Crouch_Fwd_Loop", -2, NYX_AT, 0.15), clip("Crouch_Idle_Loop", NYX_AT + 0.05, 15.8, 0.3)] }),
        human("ASH", "Ash", "plum", ashPath, { acts: [clip("Crouch_Fwd_Loop", -2, ASH_AT, 0.15)], look: [-7.5, 1.3, 0.6], lookFrom: 14.5 }),
        human("GUARD", "Guard", "rose", walkPath([{ t0: 6.2, t1: 17.4, from: [9.6, -14.6], to: [-1.8, -14.6] }], -1, 21)),
      ] },
    (P) => {
      const crouchN = (t: number) => (t < 15.8 ? 1 : 1 - smoother((t - 15.8) / 0.4)), crouchA = (t: number) => (t < ASH_AT ? 1 : 1 - smoother((t - ASH_AT) / 0.3));
      const N = lowered(P("NYX"), crouchN), A = lowered(P("ASH"), crouchA), G = P("GUARD");
      const POV = V(2, 0.95, -7.98), HIGH = V(-6, 5.2, 1.6), C0 = V(-6.8, 4.95, 3.4), C1 = V(-5.4, 2.4, -1.4);
      return [
        { start: 0, end: 4.5, label: "28mm  CRANE OVER THE WALL", rig: "TECHNOCRANE", subject: "NYX", size: "WS", stop: 2.8, cam: (t) => { const pos = C0.clone().lerp(C1, smoother(ramp(t, 0.35, 4.25))), e = lag((x) => N(x).eye, t, 0.3); return { pos, target: aimFor(pos, e, 28, [0, 0]), mm: 28 }; }, cut: "Opens outside the wall: the crane rises over it and drops in on them", flags: ["compound", "centre"] },
        { start: 4.5, end: 7.8, label: "40mm  TRACKING · CROUCH-WALK", rig: "DOLLY · HANDHELD HEAD", subject: "NYX", size: "FS", stop: 2, cam: rig.shake(rig.track(N, { size: "FS", mm: 40, rise: 0.25 }, -1, 0.5), 1, 7), cut: "CUT down beside him: low, at their pace", flags: ["enters-moving", "exits-moving"] },
        { start: 7.8, end: 11.0, label: "32mm  LOCKED · THE DOOR", rig: "TRIPOD", subject: "NYX", size: "FS", stop: 2.8, cam: rig.locked(N, { size: "FS", mm: 32, deg: -85, rise: 0.25 }, 10.6), cut: "CUT ahead to the door: he crouch-walks into his frame and stops on his mark", flags: ["centre"] },
        { start: 11.0, end: 14.0, label: "32mm  POV · THROUGH THE DOORWAY", rig: "HANDHELD", subject: "GUARD", size: "WS", stop: 2, cam: rig.shake((t) => { const look = V(2, 1.2, -16).lerp(lag((x) => G(x).eye, t, 0.8), 0.45); return { pos: POV.clone(), target: aimFor(POV, look, 32, [0, 0]), mm: 32 }; }, 1.2, 9), cut: "CUT to what he sees: someone inside", flags: ["centre"] },
        { start: 14.0, end: 16.4, label: "85mm  HOLD · THE LOOKOUT", rig: "TRIPOD", subject: "ASH", size: "MCU", stop: 2, cam: rig.locked(drop(A, 0.03), { size: "MCU", mm: 85, deg: 70, rise: 0 }, 14.0), cut: "CUT to her: she holds, then her head turns to the gate" },
        { start: 16.4, end: 19.25, label: "40mm  HIGH WIDE · IN", rig: "TECHNOCRANE · LOCKED", subject: (t) => (t < 18.4 ? "NYX" : "ASH"), size: "WS", stop: 4, cam: fixed(HIGH, V(0.6, 0.9, -9.6), 40), cut: "CUT high over the wall: he rises and slips into the dark; she stays", flags: ["centre"] },
      ];
    }),

  make({ id: "SC09-StandoffDebris", name: "Stand-off", pattern: "Profile wide with the kegs in it → slow push on one → matched push on the other → ECU on long lens → the shot → speed-ramped impact",
    says: "Two people, one street, a wait; it ends in one shot that hits what we were shown at the start.", use: "Stand-offs, duels, any held tension that breaks into violence.",
    numbers: "Wide 24 mm low, matched dolly pushes on 75 mm MS→CU about 50° off the line, ECU 135 mm from 2.2 m, the shot 50 mm MS, impact wide 24 mm with the world at 0.2× for 3 s.",
    avoid: "Pushing faster than the tension: the push is the acting, so it creeps. Show the kegs in the first wide." },
    { sky: "day", build: buildWestern, clock: westernClock, keyDir: [0.25, 0.62, 0.74],
      tick: (w, t) => {
        tickDebris(w, t); tickPuffs(w, "blast", t, BLAST, 7);
        const f = w.parts.get("flash")!; f.visible = t > BLAST && t < BLAST + 0.09; if (f.visible) f.scale.setScalar(0.6 + 14 * (t - BLAST));
        pistols(w, t, ["COLE", "REYES"], { COLE: [BLAST - 0.16, BLAST - 0.1] });
      },
      motes: { center: [0, 1.2, 0], size: [40, 2.4, 20], count: 300, drift: [0.5, 0.02, 0.08] },
      actors: [
        human("COLE", "Cole", "sand", [{ t: 0, at: [-6, 0], yaw: Math.PI / 2 }, { t: 13.2, at: [-6, 0], yaw: Math.PI / 2 }, { t: 13.6, at: [-6, 0], yaw: Math.PI / 2 - 0.2 }],
          { acts: [clip("Pistol_Idle_Loop", -1, 13.3, 0.3), clip("Pistol_Aim_Neutral", 13.35, 13.8, 0.12), clip("Pistol_Shoot", BLAST - 0.17)], look: "REYES", lookFrom: 0, lookTo: 13.4 }),
        human("REYES", "Reyes", "slate", densePath((t) => [6, kbLift(t, BLAST + 0.03 - KB_IN), 0], -1, 22, 0.02).map((k) => ({ ...k, yaw: -Math.PI / 2 })),
          { acts: [clip("Pistol_Idle_Loop", -1, 13.45, 0.3), clip("Pistol_Aim_Neutral", 13.5, BLAST + 0.02, 0.15), clipFrom("Hit_Knockback", BLAST + 0.03, KB_IN)], look: "COLE", lookFrom: 0, lookTo: BLAST }),
      ] },
    (P) => {
      const W = V(0, 0.85, 10.3), R = V(-0.8, 0.55, 8.6);
      return [
        { start: 0, end: 4.2, label: "24mm  PROFILE WIDE · THE STREET", rig: "TRIPOD · LOW HAT", subject: "COLE", size: "WS", stop: 5.6, pair: ["COLE", "REYES"], cam: fixed(W, V(0, 1.4, 0), 24), cut: "Opens on the street: both of them, and the kegs", flags: ["centre"] },
        { start: 4.2, end: 8.4, label: "75mm  SLOW PUSH · COLE", rig: "DOLLY", subject: "COLE", size: "MS", sizeEnd: "CU", stop: 2.8, pair: ["COLE", "REYES"], cam: rig.dolly(drop(P("COLE"), 0.05), { size: "MS", mm: 75, deg: -58, rise: 0.4 }, "CU", 4.2, 8.4, 0.5), cut: "CUT in to him: the push begins the wait" },
        { start: 8.4, end: 12.6, label: "75mm  SLOW PUSH · REYES", rig: "DOLLY", subject: "REYES", size: "MS", sizeEnd: "CU", stop: 2.8, pair: ["COLE", "REYES"], reverse: 2, cam: rig.dolly(drop(P("REYES"), 0.05), { size: "MS", mm: 75, deg: 50, rise: -0.1 }, "CU", 8.4, 12.6, 0.5), cut: "CUT to the other: the matched push" },
        { start: 12.6, end: 13.3, label: "135mm  ECU · LONG LENS", rig: "TRIPOD", subject: "COLE", size: "ECU", stop: 2.8, pair: ["COLE", "REYES"], cam: (t) => { const m = P("COLE")(12.9), pos = m.eye.clone().add(around(m, -40).multiplyScalar(2.2)); return { pos, target: aimFor(pos, P("COLE")(t).eye, 135, [-0.12, 0.08]), mm: 135 }; }, cut: "CUT to his eyes, flat on the long lens" },
        { start: 13.3, end: 14.1, label: "50mm  MS · THE SHOT", rig: "TRIPOD", subject: "COLE", size: "MS", stop: 2.8, pair: ["COLE", "REYES"], cam: rig.locked(drop(P("COLE"), 0.03), { size: "MS", mm: 50, deg: -78, rise: -0.1 }, 13.6), cut: "CUT wider as his arm moves: he swings off Reyes and fires at the kegs", flags: ["short-side"] },
        { start: 14.1, end: 19.0, label: "24mm  IMPACT · SPEED RAMP", rig: "DOLLY · LOW", subject: "REYES", size: "WS", stop: 5.6, pair: ["COLE", "REYES"], cam: (t) => { const k = smoother(ramp(t, 14.1, 19)), pos = R.clone().lerp(V(0.2, 0.6, 7.2), k); return { pos, target: aimFor(pos, V(4.4, 1.3, -1.6), 24, [0, 0]), mm: 24 }; }, cut: "CUT wide on the blast: the world slows as the kegs go up", flags: ["centre", "enters-moving"] },
      ];
    }),

  make({ id: "SC10-CarCrashBarrier", name: "Car through the barrier", pattern: "Locked wide with the barrier → low tracking on the car → the bystander sees it → locked-off wide on the impact → slow-motion replay angle → aftermath",
    says: "Something unstoppable meets something in its way; someone watches it happen from just far enough away.", use: "Crashes, breakthroughs, roadblocks, any vehicle impact.",
    numbers: "Wide 24 mm, tracking 20 mm at 0.4 m off the road and 16 m/s, MCU 65 mm, impact wide 35 mm from 27 m up the road, replay 24 mm from 9 m off the barrier with the world at 0.2× from 0.25 s before the hit, aftermath 32 mm.",
    avoid: "Breaking the car's screen direction: every camera sits on the bystander's side of the road." },
    { sky: "day", build: buildRoadblock, clock: crashClock, keyDir: [-0.5, 0.7, 0.5], motes: { center: [0, 1.2, 0], size: [20, 2.4, 30], count: 220, drift: [0.15, 0.02, 0.2] },
      tick: (w, t) => { tickDebris(w, t); tickPuffs(w, "dust", t, CRASH, 3.5); },
      actors: [
        { id: "CAR", name: "Car", kind: "prop", model: "car", tint: "sand", path: CAR_KEYS },
        human("LENA", "Lena", "rose", walkPath([{ t0: CRASH + 1.05, t1: CRASH + 2.9, from: [-7.4, -4], to: [-7.2, -6.2] }], -1, 18).map((k) => (k.t < CRASH + 0.5 ? { ...k, yaw: Math.PI / 2 } : k.t < CRASH + 1.05 ? { ...k, yaw: Math.PI - 0.09 } : k.t > CRASH + 3.1 ? { ...k, yaw: 0.78 } : k)),
          { acts: [clip("Hit_Chest", CRASH + 0.12, CRASH + 0.55)], look: "CAR", lookFrom: 5.8, lookTo: CRASH + 0.6 }),
      ] },
    (P) => {
      const C = P("CAR");
      return [
        { start: 0, end: 3.5, label: "24mm  LOCKED WIDE · THE BARRIER", rig: "TRIPOD", subject: "LENA", size: "WS", stop: 5.6, cam: fixed(V(-8.8, 2.0, 12.5), V(-1.5, 1.0, -6), 24), cut: "Opens on the road: the barrier, her, the car far off", flags: ["centre"] },
        { start: 3.5, end: 6.5, label: "20mm  LOW TRACKING · THE CAR", rig: "CAMERA CAR · LOW MOUNT", subject: "CAR", size: "WS", stop: 4, cam: rig.shake(rig.track(C, { size: "WS", mm: 20, rise: -0.4 }, -1, 1.2), 1.2, 4), cut: "CUT low beside it: speed, the lamp posts streaming past", flags: ["enters-moving", "exits-moving"] },
        { start: 6.5, end: 8.3, label: "65mm  MCU · SHE SEES IT", rig: "TRIPOD", subject: "LENA", size: "MCU", stop: 2.8, cam: rig.locked(drop(P("LENA"), 0.03), { size: "MCU", mm: 65, deg: 38 }, 7.6), cut: "CUT to her: her head turns to it", flags: ["short-side"] },
        { start: 8.3, end: 10.04, label: "35mm  LOCKED-OFF WIDE · IMPACT", rig: "TRIPOD", subject: "CAR", size: "WS", stop: 5.6, cam: fixed(V(-1.2, 1.9, 27), V(0.6, 0.9, 0), 35), cut: "CUT up the road: it hits in real time", flags: ["centre", "wipe"], note: "the barrier stands between the lens and the car until the car comes through it" },
        { start: 10.04, end: 14.04, label: "24mm  REPLAY · SLOW MOTION", rig: "TRIPOD", subject: "CAR", size: "WS", stop: 4, cam: fixed(V(-8.2, 2.4, 3.0), V(0.9, 0.8, 0.4), 24), cut: "CUT back in time, beside the barrier: the hit again at a fifth of the speed", flags: ["centre", "wipe"], note: "the crates cover the car as it goes through them" },
        { start: 14.04, end: 17.5, label: "32mm  AFTERMATH · SHE WATCHES", rig: "TRIPOD", subject: "LENA", size: "FS", stop: 4, cam: fixed(V(-5.3, 1.6, -15), V(-3.2, 1.1, 0), 32), cut: "CUT behind her: the settling wreck, the car stopped beyond", flags: ["centre"] },
      ];
    }),
];
