// The camera: one rig per shot. Each returns position, aim and lens for a time inside the shot. Moves are Hermite
// tracks in time (no velocity jumps); a cut is only ever a change of shot.
import * as THREE from "three";
import { B, D, PP, S, S_BACK, T_OFF_RAMP, U, W, ines, pilot, ray, ship, warden } from "./story";
import { clamp, lerp, ramp, smoother, track, v3 } from "./util";
import { aimFor } from "./framer";

// placements found with the measured pass (tools/check.sh)
const S5_BACK = 4.6, S5_SIDE = 2.6, S8_BACK = 1.9, S8_SIDE = 0.5;

export type Cam = { pos: THREE.Vector3; target: THREE.Vector3; mm: number; roll?: number; shake?: [number, number]; /** 0 to 1: how far the frame is remapped to a fisheye (equidistant) projection; render it on a very wide lens (4 to 10 mm) */ fish?: number };
/** what the HUD reads: the support the camera rides, the stop, what is held in focus, and what is framed */
export type Subject = { pos: THREE.Vector3; height: number; facing?: THREE.Vector3; name: string };
export type Shot = {
  id: number; start: number; end: number; label: string;
  shadow: (t: number) => { center: THREE.Vector3; size: number }; cam: (t: number) => Cam;
  rig?: string; stop?: (t: number) => number; focus?: (t: number) => { pos: THREE.Vector3; name: string };
  subject?: (t: number) => Subject; note?: string;
  /** what the shot is meant to be, for the measured pass (tools/frame-check.ts) */
  plan?: Plan;
};
/** shot sizes, tightest first: the measured pass reads where the frame's bottom edge cuts the body */
export const SIZES = ["ECU", "CU", "MCU", "MS", "MWS", "FS", "WS", "EWS"] as const;
export type Size = (typeof SIZES)[number] | "INSERT";
/** deliberate exceptions a shot may claim, each turning one check off */
export type Flag =
  | "whip"          // a whip pan or tilt: no pan-speed limit
  | "short-side"    // the subject sits on the side it faces
  | "cross-line"    // crosses the line on purpose
  | "jump"          // a deliberate jump cut: no 30° rule
  | "compound"      // a designed two-axis move (crane with a pan, orbit)
  | "enters-moving" // cut into a move already running
  | "exits-moving"  // cut out of a move still running
  | "centre"        // centre framing on purpose: no lead-room rule
  | "wipe";         // something passes in front of the subject on purpose (a wipe): no blocking check
export type Plan = {
  /** the point of interest, by its name in the piece's subjects (may change inside the shot) */
  subject?: string | ((t: number) => string);
  size?: Size;
  /** a move that changes size (push in, pull out, crane): the size it ends on */
  sizeEnd?: Size;
  /** the figure whose shoulder fills the foreground of an OTS */
  ots?: string;
  /** the engaged pair whose line the scene's cameras keep to one side of */
  pair?: [string, string];
  scene?: string;
  /** the id of the shot this one reverses (lens, distance and head size must match) */
  reverse?: number;
  flags?: Flag[];
  /** how the film arrives in this shot: the cut (or fade) and what motivates it */
  cut?: string;
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const P = (o: THREE.Vector3, u: number, p: number, y: number) => o.clone().add(U.clone().multiplyScalar(u)).add(PP.clone().multiplyScalar(p)).add(V(0, y, 0));
const keyed = (keys: { t: number; pos: number[]; target: number[]; mm?: number }[], opts: { startVel?: "zero" | "free"; endVel?: "zero" | "free" } = {}) => {
  const tp = track(keys.map((k) => ({ t: k.t, v: k.pos })), opts);
  const tt = track(keys.map((k) => ({ t: k.t, v: k.target })), opts);
  const tm = track(keys.map((k) => ({ t: k.t, v: [k.mm ?? keys[0].mm ?? 35] })));
  return (t: number): Cam => ({ pos: v3(tp(t)), target: v3(tt(t)), mm: tm(t)[0] });
};
const arr = (v: THREE.Vector3) => [v.x, v.y, v.z];
const fixed = (center: THREE.Vector3, size: number) => () => ({ center, size });
/** average a moving point over a short window: a camera operator's lag */
const lagged = (f: (t: number) => THREE.Vector3, t: number, w = 0.4) => {
  const o = V(0, 0, 0); const n = 9;
  for (let i = 0; i < n; i++) o.add(f(t - w / 2 + (w * i) / (n - 1)));
  return o.multiplyScalar(1 / n);
};

// 1 — establishing crane down through the floating rocks, the ship falling with us
const s1 = keyed([
  { t: 0, pos: [-128, 132, 168], target: [-48, 62, -6], mm: 24 },
  { t: 3.5, pos: [-96, 86, 132], target: [-20, 34, 14] },
  { t: 7.0, pos: [-62, 44, 100], target: [2, 13, 26] },
], { endVel: "free" });

// 2 — low lateral track as the ship lands; push toward the ramp as she walks down
const s2 = keyed([
  { t: 7.0, pos: [30, 1.2, 20.5], target: [6, 10, 30], mm: 35 },
  { t: 9.6, pos: [28.5, 1.0, 22.5], target: [9.5, 2.8, 29.5] },
  { t: 11.2, pos: [24.0, 1.1, 24.2], target: [10, 1.9, 26.0] },
  { t: 13.0, pos: [18.2, 1.3, 24.4], target: [10, 1.3, 24.6] },
], { startVel: "free" });

// 3 — follow over her shoulder, craning up as the spire fills the frame
const followDir = V(-0.487, 0, -0.873);
const s3 = (t: number): Cam => {
  const p = lagged((x) => ines(x).pos, t, 0.6).setY(0);
  const k = smoother((t - T_OFF_RAMP) / (18.6 - T_OFF_RAMP));
  const right = V(-followDir.z, 0, followDir.x);
  // the operator starts beside the ramp at her right shoulder (behind her is the ship's hull) and swings in behind her
  const swing = smoother((t - T_OFF_RAMP) / 2.4);
  const pos = p.clone().add(followDir.clone().multiplyScalar(-lerp(lerp(2.4, 4.0, swing), 5.4, k))).add(right.multiplyScalar(lerp(1.6, -0.8, swing))).add(V(0, lerp(1.95, 2.7, k), 0));
  const pitch = THREE.MathUtils.degToRad(lerp(1, 4.5, k));
  return { pos, target: p.clone().add(followDir.clone().multiplyScalar(22)).add(V(-1.5, pos.y + Math.tan(pitch) * 22, 0)), mm: 24 };
};

// 4 — long lens, her profile along the root: a medium shot that pushes slowly in. Framed on her head (eyes on the
// upper third, on the right third so she looks left into the root and the drill), never on the tool
const INES_EYE = S.clone().add(V(0, 1.68, 0)).add(PP.clone().multiplyScalar(-0.12));
const s4push = track([{ t: 18.6, v: [7.6] }, { t: 22.4, v: [6.0] }], { endVel: "free" });
const s4 = (t: number): Cam => {
  const pos = INES_EYE.clone().add(U.clone().multiplyScalar(s4push(t)[0])).add(PP.clone().multiplyScalar(-0.45)).add(V(0, 0.05, 0));
  return { pos, target: aimFor(pos, INES_EYE, 85, [1 / 3, 1 / 3]), mm: 85 };
};

// 5 — the watcher: over the warden's shoulder, 23 m up, extreme long lens
const toS = S_BACK.clone().sub(B).setY(0).normalize();
const s5 = (t: number): Cam => {
  const k = (t - 22.4) / 2.6;
  const side = V(-toS.z, 0, toS.x);
  const head = B.clone().add(V(0, 1.75, 0));
  const target = S.clone().add(V(0, 0.9, 0)).add(PP.clone().multiplyScalar(-0.45));
  const dir = target.clone().sub(head).normalize();
  const off = V(0.98, 0, -0.18);   // beside the branch, so the view drops past it
  // his head and shoulder hold the right quarter of the frame; she sits small on the left third far below.
  // We drift a hand's width as if breathing with him
  const pos = head.clone().add(dir.clone().multiplyScalar(-S5_BACK)).add(off.multiplyScalar(S5_SIDE + 0.06 * k)).add(V(0, 0.25, 0));
  return { pos, target: aimFor(pos, target, 50, [-1 / 3, -0.05]), mm: 50 };
};

// 6 — the bite: we cut out wide and keep pulling back as the dark spreads
const s6 = keyed([
  { t: 25.0, pos: arr(P(D, 3.5, 6.5, 1.6)), target: arr(P(D, -1, 0, 0.2)), mm: 24 },
  { t: 27.0, pos: arr(P(D, 12, 17, 9)), target: arr(P(D, -6, -2, 1)) },
  { t: 29.2, pos: arr(P(D, 20, 27, 22)), target: arr(V(-4, 4, 2)) },
], { startVel: "free" });

// 7 — medium on Ines, whip up to the branch, fall with the warden, low angle on him
const s7 = (t: number): Cam => {
  const I = ines(t);
  const f = V(Math.sin(I.yaw), 0, Math.cos(I.yaw));
  const r = V(-f.z, 0, f.x);
  const front = I.pos.clone().add(f.clone().multiplyScalar(2.6)).add(r.clone().multiplyScalar(0.7)).add(V(0, 1.25, 0));
  const lowPos = W.clone().add(S_BACK.clone().sub(W).setY(0).normalize().applyAxisAngle(V(0, 1, 0), -0.55).multiplyScalar(4.6)).setY(0.55);
  const k = smoother((t - 30.9) / 3.0);
  const pos = front.clone().lerp(lowPos, k);
  pos.y += 0.8 * Math.sin(Math.PI * clamp((t - 30.9) / 1.6)) * (1 - k);   // the crane rises a touch before falling with him
  const aimInes = I.pos.clone().add(V(0, 1.6, 0));
  const Wd = warden(t);
  const aimW = lagged((x) => warden(x).pos, t, 0.25).add(V(0, t < 32.3 ? 1.4 : lerp(1.4, 2.3, ramp(t, 32.4, 34)), 0));
  // the whip: aim swings from her face to him in 0.65 s
  const w = smoother((t - 30.2) / 0.65);
  const dirA = aimInes.clone().sub(pos).normalize(), dirB = aimW.clone().sub(pos).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(dirA, dirB);
  const dir = dirA.clone().applyQuaternion(new THREE.Quaternion().slerp(q, w));
  void Wd;
  return { pos, target: pos.clone().add(dir.multiplyScalar(10)), mm: 35 };
};

// 8 — over the pilot's shoulder; tilt up with the rising ray
const s8 = (t: number): Cam => {
  const pl = pilot(t).pos;
  const toSpire = V(-pl.x, 0, -pl.z).normalize();
  const right = V(-toSpire.z, 0, toSpire.x);
  const k = smoother((t - 34.6) / 2.5);
  // tight on his shoulder (a quarter of the frame), the ray held on the upper right as it climbs
  const pos = pl.clone().add(toSpire.clone().multiplyScalar(-lerp(S8_BACK, S8_BACK + 0.3, k))).add(right.multiplyScalar(S8_SIDE)).add(V(0, 1.75, 0));
  const rp = lagged((x) => ray(x).pos, t, 0.5);
  return { pos, target: aimFor(pos, rp, 20, [0.35, 0.55]), mm: 20 };
};

/** the sky-ray's head in the world: the body's local (0, 0.1, 3.3), turned by its yaw and pitch */
export const rayHead = (t: number) => {
  const r = ray(t);
  return new THREE.Vector3(0, 0.1, 3.3).applyEuler(new THREE.Euler(r.pitch, r.yaw, 0, "YXZ")).add(r.pos);
};
const rayYaw = (t: number, w = 0.8) => { let sx = 0, sz = 0; for (let i = 0; i < 9; i++) { const y = ray(t - w / 2 + (w * i) / 8).yaw; sx += Math.sin(y); sz += Math.cos(y); } return Math.atan2(sx, sz); };

// 9 — the roar, close: a chase drone matched to the ray, low and ahead on its left, 85 mm on the head as the jaw opens
const s9roar = (t: number): Cam => {
  const y = rayYaw(t), f = V(Math.sin(y), 0, Math.cos(y)), side = V(Math.cos(y), 0, -Math.sin(y));
  const k = smoother((t - 37.1) / 2.3);
  const base = lagged(rayHead, t, 0.25);
  // a slow drift in toward the head as the roar peaks: 15 m to 12.5 m
  const pos = base.clone().add(f.clone().multiplyScalar(lerp(12.5, 10.5, k))).add(side.clone().multiplyScalar(lerp(7, 5.8, k))).add(V(0, 0.6, 0));
  return { pos, target: aimFor(pos, rayHead(t), 85, [0, 0.12]), mm: 85 };
};

// 10 — orbit the standoff: behind the warden's shoulder, the ray beyond him, 80 degrees around the pair
const s10 = (t: number): Cam => {
  const k = smoother((t - 39.4) / 3.8);
  const rp = ray(t).pos;
  const c = W.clone().lerp(V(-5.2, 0, 10.2), 0.35).setY(0);
  const a = THREE.MathUtils.degToRad(lerp(108, 28, k));
  const pos = c.clone().add(V(Math.cos(a) * 16, lerp(2.2, 2.8, k) + 0.5 * Math.sin(Math.PI * k), Math.sin(a) * 16));
  const target = W.clone().add(V(0, 1.6, 0)).lerp(rp, 0.32);
  return { pos, target, mm: 20 };
};

// 11 — the ray settles, close: 65 mm on its head from ahead and to the side, booming down with it to the ground
const s11settle = (t: number): Cam => {
  const y = rayYaw(t, 1.2), f = V(Math.sin(y), 0, Math.cos(y)), side = V(Math.cos(y), 0, -Math.sin(y));
  const base = lagged(rayHead, t, 0.8);
  const pos = base.clone().add(f.clone().multiplyScalar(7.2)).add(side.clone().multiplyScalar(-6.6)).add(V(0, -0.6, 0));
  return { pos, target: aimFor(pos, rayHead(t), 65, [-0.15, 0.1]), mm: 65 };
};

// 12 — over the root, looking down into both faces: the hands on the wound centre frame, a slow push down and in
const s12 = keyed([
  { t: 46.0, pos: arr(P(D, -0.3, -3.6, 4.6)), target: arr(P(D, -0.6, 1.0, 1.5)), mm: 40 },
  { t: 48.3, pos: arr(P(D, -0.28, -3.35, 4.3)), target: arr(P(D, -0.2, 0.6, 0.35)) },
  { t: 50.6, pos: arr(P(D, -0.25, -3.1, 4.0)), target: arr(P(D, -0.15, 0.55, 0.15)) },
], { endVel: "free" });

// 11 — match cut on the hands, then ride the light home: along the root, up the spire, out over the valley
const s11 = keyed([
  { t: 50.6, pos: arr(P(D, -5.4, 3.4, 0.9)), target: arr(P(D, 0, 0.45, 0.2)), mm: 40 },
  { t: 52.2, pos: arr(P(D, -4.6, 5.6, 4.6)), target: arr(P(D, -2.5, 0.3, 0)), mm: 34 },
  { t: 54.2, pos: arr(P(D, -1, 13, 17)), target: arr(V(0, 5, 3)), mm: 24 },
  { t: 56.4, pos: arr(P(V(0, 0, 0), 30, 38, 46)), target: arr(V(0, 28, 0)), mm: 20 },
  { t: 58.2, pos: arr(P(V(0, 0, 0), 80, 62, 82)), target: arr(V(0, 34, 0)), mm: 18 },
  { t: 60.0, pos: arr(P(V(0, 0, 0), 150, 95, 118)), target: arr(V(-6, 30, -10)), mm: 18 },
], { endVel: "free" });

export const SHOTS: Shot[] = [
  { id: 1, start: 0, end: 7.0, label: "24mm  CRANE DOWN", shadow: fixed(V(0, 0, 20), 150), cam: s1 },
  { id: 2, start: 7.0, end: T_OFF_RAMP, label: "35mm  LOW TRACK", shadow: fixed(V(12, 0, 26), 26), cam: s2 },
  { id: 3, start: T_OFF_RAMP, end: 18.6, label: "24mm  FOLLOW / CRANE UP", shadow: fixed(V(4, 0, 14), 42), cam: s3 },
  { id: 4, start: 18.6, end: 22.4, label: "85mm  MS PROFILE · PUSH-IN", shadow: fixed(D.clone().setY(0), 9), cam: s4 },
  { id: 5, start: 22.4, end: 25.0, label: "50mm  OTS FROM THE CANOPY", shadow: fixed(V(4, 0, 14), 24), cam: s5 },
  { id: 6, start: 25.0, end: 29.2, label: "24mm  PULL-OUT / CRANE UP", shadow: fixed(V(2, 0, 14), 60), cam: s6 },
  { id: 7, start: 29.2, end: 34.6, label: "35mm  WHIP PAN > CRANE DOWN", shadow: fixed(V(5, 0, 14), 30), cam: s7 },
  { id: 8, start: 34.6, end: 37.1, label: "20mm  OTS · THE RAY RISES", shadow: fixed(V(2, 0, 14), 40), cam: s8 },
  { id: 9, start: 37.1, end: 39.4, label: "85mm  CU · THE ROAR", shadow: (t) => ({ center: rayHead(t).setY(0), size: 30 }), cam: s9roar },
  { id: 10, start: 39.4, end: 43.2, label: "20mm  ORBIT 80", shadow: fixed(V(3, 0, 12), 26), cam: s10 },
  { id: 11, start: 43.2, end: 46.0, label: "65mm  CU · THE RAY SETTLES", shadow: (t) => ({ center: rayHead(t).setY(0), size: 24 }), cam: s11settle },
  { id: 12, start: 46.0, end: 50.6, label: "40mm  HIGH TWO-SHOT · PUSH-IN", shadow: fixed(D.clone().setY(0), 10), cam: s12 },
  { id: 13, start: 50.6, end: 60.0, label: "40>18mm  CRANE UP / PULL-OUT", shadow: (t) => {
    const k = ramp(t, 52.5, 58);
    return { center: D.clone().setY(0).lerp(V(0, 0, 10), k), size: lerp(14, 170, k) };
  }, cam: s11 },
];

// what each shot is meant to be, for the measured pass
const PLAN: Record<number, Plan> = {
  1: { cut: "FADE IN from black", subject: "SHIP", size: "EWS", flags: ["exits-moving"] },
  2: { cut: "CUT DOWN with the ship's descent: same direction of travel, closer and lower", subject: (t) => (t < 10.4 ? "SHIP" : "INES"), size: "WS", flags: ["enters-moving"] },
  3: { cut: "ACTION CUT as her boot leaves the ramp", subject: "INES", size: "MS", flags: ["compound"] },
  4: { cut: "CUT IN: 24 mm wide to 85 mm on her and the drill", subject: "INES", size: "MS", flags: ["exits-moving"] },
  5: { cut: "REVEAL CUT: someone has been watching", subject: "INES", size: "WS", ots: "WARDEN", scene: "standoff", pair: ["INES", "WARDEN"] },
  6: { cut: "ACTION CUT on the bite: the dark starts on frame 1", subject: "INES", size: "EWS", flags: ["compound", "enters-moving"] },
  7: { cut: "CUT on her look up; the whip pan happens inside the shot", subject: (t) => (t < 30.5 ? "INES" : "WARDEN"), size: "MS", flags: ["whip", "compound"], scene: "standoff", pair: ["INES", "WARDEN"] },
  8: { cut: "CUT to the human point of view: the threat rises", subject: "RAY", size: "WS", ots: "PILOT", flags: ["exits-moving"] },
  9: { cut: "CUT IN on the roar: wide 20 mm to an 85 mm close-up", subject: "RAYHEAD", size: "INSERT", flags: ["compound", "enters-moving", "exits-moving"] },
  10: { cut: "CUT OUT to the standoff: the orbit", subject: "WARDEN", size: "WS", flags: ["compound"], scene: "standoff", pair: ["INES", "WARDEN"] },
  11: { cut: "CUT IN to the ray as it settles", subject: "RAYHEAD", size: "INSERT", flags: ["compound", "enters-moving", "exits-moving"] },
  12: { cut: "CUT on the warden's first step to the root", subject: (t) => (t < 48.2 ? "WARDEN" : "INES"), size: "MS", flags: ["exits-moving"] },
  13: { cut: "MATCH CUT on the kneeling pair", subject: (t) => (t < 52.5 ? "INES" : "VALLEY"), size: "EWS", flags: ["compound", "enters-moving"] },
};
// what each camera rides
const RIG: Record<number, string> = {
  1: "TECHNOCRANE", 2: "LOW DOLLY · REMOTE HEAD", 3: "STEADICAM · CRANE ARM", 4: "DOLLY · LONG LENS", 5: "REMOTE HEAD IN THE CANOPY",
  6: "TECHNOCRANE", 7: "TECHNOCRANE · REMOTE HEAD", 8: "STEADICAM", 9: "CHASE DRONE · GIMBAL", 10: "TECHNOCRANE ORBIT",
  11: "TECHNOCRANE", 12: "CRANE OVER THE ROOT", 13: "TECHNOCRANE",
};
for (const s of SHOTS) { s.plan = PLAN[s.id]; s.rig = RIG[s.id]; }

export const shotAt = (t: number) => SHOTS.find((s) => t < s.end) ?? SHOTS[SHOTS.length - 1];
void ship;
