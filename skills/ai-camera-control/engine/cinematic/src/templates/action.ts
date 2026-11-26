// Action templates: camera moves on people in motion (fights, jumps, falls, chases), built on the captured clips.
// Every clip plays in place, so each path below is timed to its clip: the jump's arc starts on the take-off frame, the
// roll travels while the body is over, the knockback lands where the clip lays the body down. Numbers that come from
// the clips (reach, eye heights, the run's bounce) were measured with the scratch probes, not guessed.
import * as THREE from "three";
import { planner, scenePiece, speedRamp, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { Act, Actor, ActorSpec, PathKey } from "../kit/actors";
import { around, lag, leadRoom, rig, type Subj } from "../kit/rigs";
import { aimFor, frameFor, frameHeight, SENSOR_H } from "../framer";
import { GREY, clay } from "../kit/clay";
import { broadTree, building, column, ground, pine, scatter } from "../kit/props";
import { buildLab } from "./lab";
import { clamp, lerp, ramp } from "../util";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import type { Marks } from "../marks";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const human = (id: string, name: string, tint: ActorSpec["tint"], path: PathKey[], acts?: Act[], extra: Partial<ActorSpec> = {}): ActorSpec => ({ id, name, kind: "human", tint, path, acts, ...extra });

type Extra = Partial<Pick<SceneSpec, "build" | "clock" | "motes" | "sky">>;
function make(info: TemplateInfo, actors: ActorSpec[], shots: (P: ReturnType<typeof planner>, W: (t: number) => number) => ShotDef[], extra: Extra = {}): Piece {
  const spec: SceneSpec = { id: info.id, title: info.name.toUpperCase(), sky: "studio", build: buildLab, actors, motes: { center: [0, 2.5, 0], size: [40, 6, 40], count: 200 }, ...extra };
  CAMERA_INFO.push(info);
  const W = (t: number) => (spec.clock ? spec.clock(t) : t);
  return scenePiece(spec, shots(planner(spec), W), { scene: info.id });
}

// ---- clips ----
export const clip = (c: string, t0: number, t1?: number, ease = 0.1): Act => ({ kind: "clip", clip: c, t0, t1, ease });
/** a strike thrown from a raised guard (the punch clips start and end on the guard): the guard comes up over `raise`
 *  seconds, the clip fires at t0, the guard is held until t1 and let down over `release` seconds */
const strike = (c: string, t0: number, t1: number, raise = 0.5, release = 0.1): Act[] => [clip(c, t0, t0, raise), clip(c, t0, t1, 0.08), clip(c, t0, t1, release)];

// ---- body points measured from the clips (figure frame: y up, z ahead of the feet), for aiming at a body the planner
// still thinks is standing ----
/** each clip's eye and waist through the clip: [clip time, eye y, eye z, waist y, waist z], figure frame (measured) */
export const TRACK: Record<string, number[][]> = {
  Death01: [[0, 1.62, 0.11, 1.01, -0.07], [0.25, 1.51, 0.06, 0.88, -0.14], [0.5, 1.32, 0.15, 0.82, -0.15], [0.667, 1.32, 0, 0.78, -0.24], [0.75, 1.33, -0.24, 0.71, -0.36], [0.833, 1.18, -0.59, 0.54, -0.53], [0.917, 0.83, -0.86, 0.24, -0.66], [1, 0.56, -1.08, 0.12, -0.68], [1.083, 0.34, -1.23, 0.1, -0.69], [1.167, 0.21, -1.33, 0.1, -0.69], [1.25, 0.17, -1.34, 0.09, -0.68], [1.4, 0.23, -1.32, 0.09, -0.68], [9, 0.22, -1.33, 0.1, -0.68]],
  // its first frame is a crouch: the clip is started a few frames before the blow lands
  Hit_Knockback: [[0, 0.66, 0.42, 0.72, -0.1], [0.083, 1.3, 0.16, 0.96, -0.17], [0.167, 1.24, -0.25, 0.8, -0.24], [0.25, 0.49, -0.8, 0.22, -0.28], [0.333, 0.34, -0.98, 0.07, -0.38], [0.417, 0.53, -0.8, 0.1, -0.38], [0.5, 0.53, -0.87, 0.17, -0.36], [0.583, 0.3, -0.99, 0.11, -0.36], [0.667, 0.23, -1.02, 0.11, -0.37], [9, 0.24, -1.02, 0.11, -0.37]],
  Jump_Start: [[0, 1.11, 0.31, 0.65, -0.12], [0.083, 1.69, 0.01, 1.04, -0.07], [0.167, 1.78, 0.02, 1.15, -0.07], [0.25, 1.57, 0.11, 1.01, -0.07], [0.333, 1.53, 0.17, 1.01, -0.08], [0.417, 1.51, 0.2, 1.01, -0.08], [0.833, 1.52, 0.19, 1.01, -0.08], [1, 1.61, 0.18, 1.09, -0.09], [1.167, 1.66, 0.17, 1.13, -0.09], [9, 1.67, 0.17, 1.14, -0.09]],
  Jump_Land: [[0, 1.54, 0.26, 1.06, -0.06], [0.083, 1.2, 0.26, 0.74, -0.12], [0.167, 0.98, 0.34, 0.56, -0.11], [0.25, 0.94, 0.39, 0.57, -0.11], [0.333, 0.96, 0.42, 0.64, -0.1], [0.417, 1.02, 0.43, 0.73, -0.1], [0.5, 1.11, 0.43, 0.81, -0.09], [0.583, 1.21, 0.42, 0.89, -0.09], [0.667, 1.31, 0.39, 0.96, -0.08], [0.75, 1.4, 0.36, 1, -0.08], [0.833, 1.46, 0.32, 1.01, -0.08], [1, 1.56, 0.22, 1.01, -0.07], [1.167, 1.61, 0.13, 1.01, -0.07], [9, 1.62, 0.11, 1.01, -0.07]],
  ClimbUp_1m: [[0, 1.48, 0.36, 0.96, -0.01], [0.083, 1.52, 0.32, 1.04, -0.1], [0.167, 1.44, 0.39, 1.11, -0.13], [0.25, 1.24, 0.5, 1.09, -0.1], [0.333, 1.11, 0.56, 1.1, -0.07], [0.417, 1.17, 0.54, 1.14, -0.08], [0.5, 1.36, 0.5, 1.19, -0.07], [0.583, 1.49, 0.44, 1.08, -0.04], [9, 1.48, 0.36, 0.96, -0.01]],
  NinjaJump_Idle_Loop: [[0, 1.44, 0.28, 1.01, -0.08], [9, 1.44, 0.28, 1.01, -0.08]],
  // a boxer's guard sits 10 cm lower than standing: the punches start and end on it
  Punch_Cross: [[0, 1.52, 0.14, 0.96, -0.05], [0.167, 1.52, 0.14, 0.96, -0.05], [0.25, 1.51, 0.25, 0.99, -0.03], [0.667, 1.51, 0.25, 0.99, -0.03], [0.833, 1.52, 0.19, 0.97, -0.04], [9, 1.52, 0.14, 0.96, -0.05]],
  Punch_Jab: [[0, 1.52, 0.14, 0.96, -0.05], [0.083, 1.52, 0.14, 0.96, -0.05], [0.167, 1.52, 0.22, 0.96, 0.02], [0.333, 1.53, 0.18, 0.96, 0.01], [0.5, 1.53, 0.12, 0.96, -0.06], [9, 1.52, 0.14, 0.96, -0.05]],
  Hit_Head: [[0, 1.67, 0.02, 1.01, -0.07], [0.083, 1.67, -0.02, 1.01, -0.09], [0.25, 1.65, 0.07, 1.01, -0.08], [9, 1.61, 0.14, 1.01, -0.07]],
  Hit_Chest: [[0, 1.64, -0.16, 0.99, -0.06], [0.167, 1.67, -0.01, 1, -0.06], [9, 1.61, 0.14, 1.01, -0.07]],
  Roll: [[0, 1.13, 0.29, 0.63, -0.12], [0.083, 1.38, 0.53, 0.98, 0.02], [0.167, 1.35, 0.65, 1.13, 0.04], [0.25, 1.18, 0.67, 1.16, 0.03], [0.333, 0.81, 0.59, 1.1, 0.04], [0.417, 0.3, 0.17, 0.77, 0.1], [0.5, 0.21, -0.24, 0.51, 0.07], [0.583, 0.26, -0.5, 0.36, 0.01], [0.667, 0.41, -0.47, 0.07, 0], [0.75, 0.8, -0.13, 0.21, -0.07], [0.833, 0.93, 0.1, 0.4, -0.18], [0.917, 1.07, 0.25, 0.6, -0.13], [1, 1.23, 0.36, 0.76, -0.01], [1.167, 1.47, 0.22, 0.94, -0.05], [1.333, 1.6, 0.12, 1.01, -0.07], [9, 1.63, 0.11, 1.02, -0.07]],
};
/** standing (and the punches and small hits, which keep the head within a few centimetres of it) */
const UPRIGHT = [1.62, 0.13, 1.01, -0.07];
const table = (T: number[][], x: number) => {
  if (x <= T[0][0]) return T[0].slice(1);
  for (let i = 1; i < T.length; i++) if (x < T[i][0]) { const k = (x - T[i - 1][0]) / (T[i][0] - T[i - 1][0]); return T[i].slice(1).map((v, j) => lerp(T[i - 1][j + 1], v, k)); }
  return T[T.length - 1].slice(1);
};
/** how far a lying body's back goes under the floor in these clips (lowest skin point, measured), as a lift for the
 *  path: [clip time, metres] */
const KNOCK_LIFT: number[][] = [[-0.1, 0], [0.42, 0.09], [1.0, 0.05], [9, 0.05]];
const DEATH_LIFT: number[][] = [[0.7, 0], [1.21, 0.075], [1.8, 0.018], [9, 0.018]];
/** a figure standing on one spot whose body a clip lays down from t0: the path lifts it by the clip's measured sink */
const lying = (x: number, z: number, yaw: number, lift: number[][], t0: number, t1 = 12): PathKey[] => {
  const keys: PathKey[] = [{ t: 0, at: [x, 0, z], yaw }];
  for (let t = t0 + lift[0][0] - 1 / 24; t <= t0 + 2; t += 1 / 24) keys.push({ t, at: [x, table(lift, t - t0)[0], z], yaw });
  keys.push({ t: t1, at: [x, lift[lift.length - 1][1], z], yaw });
  return keys;
};
/** a point in a figure's own frame (x across, y up, z ahead), placed in the world */
export const local = (p: THREE.Vector3, yaw: number, x: number, y: number, z: number) => p.clone().add(V(x, y, z).applyAxisAngle(UP, yaw));
/** where an actor's eye and waist really are at world time t: its clips' measured tracks blended by the weights the rig
 *  gives them (the planner's marks assume a standing body, which a fall or a roll is not) */
export const body = (A: Actor) => (t: number) => {
  let w = 0; const acc = [0, 0, 0, 0];
  for (const a of A.spec.acts ?? []) {
    if (a.kind !== "clip" || !a.clip) continue;
    const e = a.ease ?? 0.15, wt = ramp(t, a.t0 - e, a.t0) * (a.t1 === undefined ? 1 : 1 - ramp(t, a.t1, a.t1 + e));
    if (wt <= 0) continue;
    const r = TRACK[a.clip] ? table(TRACK[a.clip], Math.max(0, t - a.t0)) : UPRIGHT;
    r.forEach((v, i) => (acc[i] += v * wt)); w += wt;
  }
  const r = w > 1e-6 ? acc.map((v, i) => (w >= 1 ? v / w : v + UPRIGHT[i] * (1 - w))) : UPRIGHT;
  const p = A.pos(t), y = A.yaw(t);
  return { eye: local(p, y, 0, r[0], r[1]), waist: local(p, y, 0, r[2], r[3]) };
};

/** turn a camera's aim part of the way (k) to put world point p at screen point ndc */
const reaim = (c: Cam, p: THREE.Vector3, ndc: [number, number], k: number): Cam => {
  const a = c.target.clone().sub(c.pos).normalize(), b = aimFor(c.pos, p, c.mm, ndc).sub(c.pos).normalize();
  return { ...c, target: c.pos.clone().add(a.lerp(b, k).normalize().multiplyScalar(10)) };
};
/** the subject with its height smoothed: a tracking vehicle does not hop with the runner */
const settle = (S: Subj, w = 1.4): Subj => (t) => {
  const m = S(t), dy = lag((x) => S(x).eye, t, w).y - m.eye.y;
  const sh = (v: THREE.Vector3) => v.clone().add(V(0, dy, 0));
  const L = m.ladder;
  return { ...m, eye: sh(m.eye), top: sh(m.top), sole: sh(m.sole), ladder: L && { chin: sh(L.chin), chest: sh(L.chest), waist: sh(L.waist), thigh: sh(L.thigh), ankle: sh(L.ankle) } };
};

/** a path along a curve at a speed profile ([time, m/s] marks, linear between), sampled every `dt` */
export function runPath(curve: THREE.Curve<THREE.Vector3>, speeds: [number, number][], dt = 0.1): PathKey[] {
  const L = curve.getLength(), keys: PathKey[] = [];
  const v = (t: number) => { for (let i = 1; i < speeds.length; i++) if (t <= speeds[i][0]) return lerp(speeds[i - 1][1], speeds[i][1], (t - speeds[i - 1][0]) / (speeds[i][0] - speeds[i - 1][0])); return speeds[speeds.length - 1][1]; };
  let s = 0;
  const t0 = speeds[0][0], t1 = speeds[speeds.length - 1][0];
  for (let t = t0; t <= t1 + 1e-6; t += dt) {
    const p = curve.getPointAt(clamp(s / L));
    keys.push({ t: +t.toFixed(3), at: [p.x, p.z] });
    const n = 10; for (let i = 0; i < n; i++) s += v(t + (dt * (i + 0.5)) / n) * (dt / n);
  }
  return keys;
}

// ---- the run's bounce (Jog_Fwd_Loop over one cycle, figure frame: eye x y z, chest x y z), for a camera bolted to the body ----
export const JOG: number[][] = [[0.04, 1.475, 0.369, -0.008, 1.146, 0.063], [0.03, 1.417, 0.362, -0.009, 1.084, 0.057], [0.016, 1.382, 0.348, -0.007, 1.042, 0.047], [0.007, 1.389, 0.344, -0.001, 1.048, 0.043], [-0.006, 1.436, 0.357, 0.004, 1.102, 0.048], [-0.027, 1.479, 0.375, 0.003, 1.156, 0.058], [-0.051, 1.525, 0.388, -0.002, 1.213, 0.067], [-0.066, 1.558, 0.39, -0.005, 1.25, 0.07], [-0.072, 1.571, 0.385, -0.006, 1.26, 0.07], [-0.071, 1.569, 0.378, -0.005, 1.253, 0.067], [-0.066, 1.556, 0.369, -0.002, 1.234, 0.063], [-0.058, 1.53, 0.36, 0.001, 1.2, 0.059], [-0.05, 1.486, 0.352, 0.004, 1.15, 0.056], [-0.041, 1.428, 0.343, 0.005, 1.088, 0.049], [-0.034, 1.391, 0.337, -0.001, 1.048, 0.041], [-0.027, 1.391, 0.34, -0.008, 1.049, 0.04], [-0.014, 1.443, 0.347, -0.012, 1.103, 0.043], [-0.001, 1.497, 0.353, -0.012, 1.159, 0.047], [0.011, 1.554, 0.357, -0.012, 1.219, 0.051], [0.021, 1.589, 0.361, -0.011, 1.256, 0.055], [0.028, 1.596, 0.364, -0.01, 1.264, 0.058], [0.034, 1.585, 0.366, -0.009, 1.255, 0.06], [0.037, 1.563, 0.368, -0.008, 1.234, 0.062], [0.039, 1.527, 0.369, -0.008, 1.198, 0.063]];
export const JOG_MEAN = JOG[0].map((_, j) => JOG.reduce((s, r) => s + r[j], 0) / JOG.length);
export const STAND = [0, 1.64, 0.09, 0, 1.2, 0.05];
/** the run cycle's clock, integrated exactly as the actor does it (distance over the clip's stride, with its cadence floor) */
export function gaitClock(A: Actor, t0: number, t1: number) {
  const DT = 1 / 60, cyc: number[] = [], sp: number[] = []; let c = 0;
  for (let t = t0; t <= t1 + 1e-6; t += DT) {
    const p = A.pos(t), q = A.pos(t + DT), flat = Math.hypot(q.x - p.x, q.z - p.z) / DT;
    if (flat > 0.05) c += (Math.max(flat, 0.72 * (4.8 / 0.933) * THREE.MathUtils.smoothstep(flat, 0.55, 0.9)) / 4.8) * DT;
    cyc.push(c); sp.push(A.speed(t));
  }
  return (t: number) => { const x = clamp((t - t0) / DT, 0, cyc.length - 1), i = Math.floor(x), j = Math.min(i + 1, cyc.length - 1), k = x - i; return { cyc: lerp(cyc[i], cyc[j], k), sp: lerp(sp[i], sp[j], k) }; };
}
export const jogRow = (cyc: number) => { const x = (((cyc % 1) + 1) % 1) * JOG.length, i = Math.floor(x) % JOG.length, j = (i + 1) % JOG.length, k = x - Math.floor(x); return JOG[i].map((v, n) => lerp(v, JOG[j][n], k)); };

// ---- sets ----
/** the lab with one clay block added (w across, h high, d deep, centred at x, z), standing on the paving like the actors */
const labWithBlock = (x: number, z: number, w: number, h: number, d: number) => (k: KitWorld) => {
  buildLab(k);
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(GREY.light, 0.9)); b.position.set(x, k.paving(x, z) + h / 2, z); b.castShadow = b.receiveShadow = true; b.name = "BLOCK"; k.add(b, "block");
  const lip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04), clay(GREY.mid, 0.9)); lip.position.set(x, k.paving(x, z) + h - 0.025, z); lip.castShadow = lip.receiveShadow = true; k.add(lip);
};
/** a long colonnade avenue running north, a tall gate block closing its far end: lines for a lens to stretch */
function buildAvenue(w: KitWorld) {
  w.add(ground(700, 2.5, 90, GREY.ground, 5));
  const pave = new THREE.Mesh(new THREE.BoxGeometry(7, 0.06, 150), clay(GREY.set, 0.95)); pave.position.set(0, 0.03, -25); pave.receiveShadow = true; w.add(pave);
  w.paving = (x, z) => (Math.abs(x) < 3.5 && z > -100 && z < 50 ? 0.06 : 0);
  for (let z = -98; z <= 48; z += 3) { const j = new THREE.Mesh(new THREE.BoxGeometry(7, 0.01, 0.04), clay(GREY.mid, 0.95)); j.position.set(0, 0.0555, z); w.add(j); }
  for (let z = -95; z <= 45; z += 5) for (const s of [-1, 1]) { const c = column(5.5, 0.34); c.position.set(s * 4.6, 0, z); w.add(c); }
  for (const s of [-1, 1]) { const beam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 141), clay(GREY.set)); beam.position.set(s * 4.6, 5.75, -25); beam.castShadow = true; w.add(beam); }
  const gate = building(26, 10, 30, 7, GREY.light); gate.position.set(0, 0, -112); w.add(gate);
  const trees = new THREE.Group(); w.add(trees);
  for (const s of [-1, 1]) for (let z = -100; z <= 50; z += 9) { const t = z % 2 ? pine(9 + ((z * 7) % 5), z + 40) : broadTree(7 + ((z * 3) % 4), z + 60); t.position.set(s * (14 + ((z * 13) % 5)), 0, z); trees.add(t); }
  scatter(trees, 30, 30, 80, (i) => pine(10 + (i % 4) * 2, 200 + i), 12, [[0, -25, 22]]);
}

// ================================================================================================================
// ACT01: a standing leap off a block, frozen at the top while the camera orbits 180° round it.
// world time: crouch from 0.55, take-off 1.27, apex 1.68, landing 2.29; the clock freezes near the apex.
const A1 = (() => {
  const top = 1.0, z0 = -1.2, vy = 4.0, vz = 3.3, tTake = 1.27;      // take-off on Jump_Start's toe-off (measured: last toe leaves at 1.26)
  const fall = (vy + Math.sqrt(vy * vy + 2 * 9.81 * top)) / 9.81, tLand = tTake + fall;
  // held still on the block until take-off (a lone start key lets the curve creep forward and drag the standing feet)
  const keys: PathKey[] = [{ t: 0, at: [0, top, z0], yaw: 0 }, { t: 0.6, at: [0, top, z0] }, { t: tTake - 0.03, at: [0, top, z0] }];
  for (let k = 0; k <= 24; k++) { const s = (fall * k) / 24; keys.push({ t: tTake + s, at: [0, Math.max(0, top + vy * s - 4.9 * s * s), z0 + vz * s] }); }
  keys.push({ t: tLand + 1 / 24, at: [0, 0, z0 + vz * fall + 0.04] }, { t: tLand + 1.5, at: [0, 0, z0 + vz * fall + 0.06], yaw: 0 });
  return { keys, tLand, acts: [clip("Jump_Start", 1.05, tLand - 0.55, 0.45), clip("Jump_Land", tLand - 0.12, undefined, 0.45)] };
})();
const clock1 = speedRamp([[0, 1], [1.3, 1], [1.6, 0.02], [5.4, 0.02], [5.8, 1], [9, 1]]);

// ACT03: a two-person exchange, then the crash zoom into the cross and a whip pan down to the man it drops.
// Alex at x -0.5 facing +x, Sam at x 0.5 facing -x (1.0 m: Sam's jab lands on Alex's face, measured reach 0.76 m;
// Alex steps 7 cm in for the cross, reach 0.67 m).
const KO3 = 2.85;     // the cross lands in the chest at 2.55 (Hit_Chest), the legs go from here (Death01): a knockout, not a shove
// ACT07: four-shot coverage of a short exchange (jab, cross, jab, cross; the last one puts Sam down).
const KO7 = 4.47;   // Hit_Knockback starts here: its first frames are a crouch, so the body is upright again as the cross lands (4.55)
// ACT08: Alex's cross lands at 1.75 on Sam, who takes it in the chest and goes down (Death01 from 2.2).
const D8 = 2.2;

// ACT05: run, climb onto a 1 m block, run its top, drop off it into a roll, run out.
const A5 = (() => {
  const z = 1.5, tc = 0.9, te = 1.9, vy = 1.2;
  const speeds: [number, number][] = [[-1.4, 0], [-0.4, 5], [tc - 0.1, 5], [tc + 0.1, 2.9], [tc + 0.6, 3.6], [tc + 0.75, 4.4], [te - 0.05, 4.2]];
  const fall = (vy + Math.sqrt(vy * vy + 2 * 9.81 * 1.0)) / 9.81, tl = te + fall;
  speeds.push([tl, 4.2], [tl + 0.15, 3.6], [tl + 0.8, 3.6], [tl + 1.3, 5], [8, 5]);
  const v = (t: number) => { for (let i = 1; i < speeds.length; i++) if (t <= speeds[i][0]) return lerp(speeds[i - 1][1], speeds[i][1], (t - speeds[i - 1][0]) / (speeds[i][0] - speeds[i - 1][0])); return 5; };
  const dt = 1 / 48, xs: number[] = []; let x = 0;
  for (let t = -1.4; t <= 8 + 1e-6; t += dt) { xs.push(x); x += v(t + dt / 2) * dt; }
  const xAt = (t: number) => xs[Math.round((t + 1.4) / dt)];
  const off = -1.25 - xAt(tc);          // the climb starts at x -1.25
  const X = (t: number) => xAt(t) + off;
  const y = (t: number) => (t < te ? ramp(t, tc + 0.05, tc + 0.45) : Math.max(0, 1 + vy * (t - te) - 4.9 * (t - te) ** 2));
  const keys: PathKey[] = [];
  for (let t = -1.4; t <= 8 + 1e-6; t += 1 / 24) keys.push({ t: +t.toFixed(4), at: [X(t), t > tc && t < tl + 0.05 ? y(t) : 0, z] });
  const face = X(tc + 0.3), edge = X(te) + 0.05;
  return { keys, z, tc, te, tl, block: { x: (face + edge) / 2, w: edge - face } };
})();

// ACT06: the speed ramp of the hero walk (film -> world time).
const clock6 = speedRamp([[0, 1], [2.4, 1], [3.3, 0.3], [4.8, 0.3], [5.6, 1], [9, 1]]);
const A6 = (() => {
  const keys: PathKey[] = [];
  const wStop = clock6(7.1);
  for (let w = -2; w <= wStop + 4 + 1e-6; w += 1) keys.push({ t: w, at: [0.3, -6.2 + 1.3 * w] });
  return keys;
})();

// ACT02: the snorricam run, an S through the plaza.
const RUN2 = new THREE.CatmullRomCurve3([V(-14, 0, 5), V(-8, 0, 0.5), V(-1.5, 0, 3.2), V(4.5, 0, -0.8), V(11.5, 0, 1.8)], false, "centripetal");
const PATH2 = runPath(RUN2, [[-1.3, 0], [-0.3, 4.6], [5.0, 4.6], [5.3, 2.1], [6.3, 0], [7.8, 0]]);

export const ACTION_TEMPLATES: Piece[] = [
  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT01-BulletTimeOrbit", name: "Bullet-time orbit", says: "Time stops for this one moment: we walk round it while the world hangs.", use: "The peak of a leap, a hit or a near miss that the story turns on; once per film.", numbers: "28 mm, full shot with the block in it, world clock eased to 0.02 over 0.3 s at the apex, held 3.8 s while the camera orbits 180° (about 47°/s), eased back to real time for the landing.", avoid: "Freezing a pose that tells nothing: freeze the instant before the outcome, not after it." },
    [human("ALEX", "Alex", "ochre", A1.keys, A1.acts)],
    (P, W) => {
      const A = P("ALEX"), m0 = A(0), mm = 28, B = body(A.actor);
      const cam = (t: number): Cam => {
        const m = A(t), b = B(W(t)), mid = b.waist.clone().lerp(b.eye, 0.25);
        const deg = 70 - 180 * ramp(t, 1.55, 5.75);
        const d = (1.25 * frameHeight(m, "FS") * mm) / SENSOR_H;
        const pos = mid.clone().add(around(m0, deg).multiplyScalar(d));
        pos.y = 1.55 + 1.1 * ramp(t, 1.05, 2.0) - 1.45 * ramp(t, 5.5, 6.6);
        return { pos, target: aimFor(pos, mid, mm, [0, 0.08]), mm };
      };
      return [{ start: 0, end: 8, label: "28mm  BULLET-TIME ORBIT 180", rig: "VIRTUAL CAMERA ARRAY · ORBIT", subject: "ALEX", size: "FS", stop: 4, cam, flags: ["compound", "centre", "whip"], cut: "Opens the template", note: "PAN exempt: the tilt follows the drop to the landing. Clock 1 → 0.02 at the apex, held through the orbit, back to 1 for the landing" }];
    },
    { build: labWithBlock(0, -1.45, 1.4, 1.0, 1.2), clock: clock1 }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT02-Snorricam", name: "Snorricam", says: "We are strapped to them: they hold still and the world lurches; panic, flight, a body out of control.", use: "Flight in terror, drunkenness, a breakdown; a short burst inside a chase.", numbers: "18 mm, 1.4 m arm off the chest, the rig rides the body's own bounce (the run's measured 18 cm) so the figure holds still in frame; lean into turns (v·ω/g).", avoid: "A long lens or a long arm: the subject must fill the frame so the world, not the body, moves." },
    [human("ALEX", "Alex", "ochre", PATH2, undefined, { look: [-3, 1.6, -10], lookFrom: 2.0, lookTo: 3.7 })],
    (P) => {
      const A = P("ALEX").actor, mm = 18, ARM = 1.42;
      const G = gaitClock(A, PATH2[0].t - 1, 9);
      const jogW = (sp: number) => THREE.MathUtils.smoothstep(sp, 2.4, 3.4) * (1 - THREE.MathUtils.smoothstep(sp, 5.4, 6.2));
      const cam = (t: number): Cam => {
        const g = G(t), w = jogW(g.sp), row = jogRow(g.cyc);
        const v = STAND.map((s, i) => lerp(s, row[i], w)), mean = STAND.map((s, i) => lerp(s, JOG_MEAN[i], w));
        const root = A.pos(t), yaw = A.yaw(t);
        const chest = local(root, yaw, v[3], v[4], v[5]);
        const pos = local(chest, yaw, 0, 0.1, ARM);
        const bob = chest.clone().sub(local(root, yaw, mean[3], mean[4], mean[5]));
        const eye = local(root, yaw, mean[0], mean[1], mean[2]).add(bob);
        const turn = ((A.yaw(t + 0.1) - A.yaw(t - 0.1) + Math.PI * 3) % (Math.PI * 2) - Math.PI) / 0.2;
        const roll = clamp(Math.atan((g.sp * turn) / 9.81) * 0.35, -0.12, 0.12) + 0.015 * Math.sin(g.cyc * Math.PI * 2) * w;
        return { pos, target: aimFor(pos, eye, mm, [0, 0.4]), mm, roll };
      };
      return [{ start: 0, end: 7.25, label: "18mm  SNORRICAM · CHEST RIG", rig: "BODY MOUNT · SNORRICAM", subject: "ALEX", size: "MWS", stop: 2.8, cam, flags: ["enters-moving", "compound", "centre", "whip"], cut: "Opens the template", note: "PAN exempt: the rig turns with the body, so the world swings while the runner holds still" }];
    },
    { motes: { center: [0, 2, 2], size: [36, 5, 20], count: 260 } }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT03-CrashZoomFight", name: "Crash zoom and whip (fight)", says: "That one landed: the zoom slams in on the hit and the whip throws us after the body.", use: "The decisive blow of a fight, comedy violence, a shock beat; once per sequence.", numbers: "Handheld 35 mm two-shot; crash zoom 35 → 85 mm in 0.2 s as the cross lands in the chest; hold 1 s on fist and head while the legs go; whip 0.28 s down with the fall, landing on 45 mm; cut to a low 24 mm wide on the same side of the line.", avoid: "Zooming before the blow lands (it telegraphs), or whipping to a frame that is not composed." },
    [
      human("ALEX", "Alex", "ochre", [{ t: 0, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 1.5, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 2.3, at: [-0.35, 0], yaw: Math.PI / 2 }],
        [clip("Hit_Head", 1.27, 1.75, 0.08), ...strike("Punch_Cross", 2.3, 6.0, 0.45, 0.7)]),
      human("SAM", "Sam", "slate", lying(0.5, 0, -Math.PI / 2, DEATH_LIFT, KO3),
        [...strike("Punch_Jab", 1.1, 2.45, 0.6, 0.06), clip("Hit_Chest", 2.6, 2.8, 0.04), clip("Death01", KO3, undefined, 0.12)]),
    ],
    (P) => {
      const S = P("SAM"), B = body(S.actor), A = body(P("ALEX").actor);
      const pos = V(0.05, 1.5, 3.3);
      // the two-shot's centre, the blow (Alex's fist at Sam's jaw), and the body on the floor
      const pair = (t: number) => A(t).eye.lerp(B(t).eye, 0.5).add(V(0, -0.25, 0));
      const hit = (t: number) => V(0.36, 1.38, 0).lerp(B(t).eye, 0.45);
      const zoom = (t: number): Cam => {
        const k = ramp(t, 2.42, 2.62), mm = 35 * Math.pow(85 / 35, k);
        return reaim({ pos: pos.clone(), target: aimFor(pos, pair(t), 35, [0, 0]), mm }, hit(t), [0, 0], k);
      };
      const floor = (t: number) => { const b = B(t); return b.waist.lerp(b.eye, 0.35); };
      const onFloor = (t: number): Cam => ({ pos: pos.clone(), target: aimFor(pos, floor(t), 45, [0.05, -0.05]), mm: 45 });
      const low = V(2.6, 0.35, 2.4);
      return [
        { start: 0, end: 5, label: "35>85mm  CRASH ZOOM · WHIP TO FALL", rig: "HANDHELD", subject: "SAM", size: "MWS", sizeEnd: "WS", stop: 2.8, pair: ["ALEX", "SAM"],
          cam: rig.whip(zoom, onFloor, 3.62, 0.28), flags: ["whip", "compound", "short-side"], cut: "Opens the template", note: "Crash zoom 2.42–2.62 as the cross lands; whip 3.62–3.90 with the fall" },
        { start: 5, end: 7.5, label: "24mm  LOW WIDE · STANDING OVER", rig: "TRIPOD", subject: "ALEX", size: "FS", stop: 4, pair: ["ALEX", "SAM"],
          cam: () => ({ pos: low.clone(), target: aimFor(low, V(0.35, 0.8, 0), 24, [0, 0.05]), mm: 24 }), flags: ["centre"], cut: "CUT on the stillness after the fall: same side of the line, low and wide" },
      ];
    }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT04-SprintDollyZoom", name: "Sprint dolly zoom", says: "They run and the world chases them: the far end looms closer the harder they run.", use: "A flight from something enormous, a run toward a deadline, the moment a chase turns hopeless.", numbers: "Camera car leading the runner (5.2 m/s); 24 → 85 mm over 5.6 s while it pulls back from 3.5 to 12 m in proportion, hip high and level, so the runner holds a full shot and the far gate grows 3.5×.", avoid: "Keying the lens and the distance apart, or a background with no lines: it needs a far shape to loom." },
    [human("ALEX", "Alex", "ochre", runPath(new THREE.LineCurve3(V(0, 0, -33.4), V(0, 0, 60)), [[-1.6, 0], [-0.2, 5.2], [7.2, 5.2]]))],
    (P) => [{ start: 0, end: 6.5, label: "24>85mm  DOLLY ZOOM · SPRINT", rig: "CAMERA CAR · DOLLY ZOOM", subject: "ALEX", size: "FS", stop: 4, cam: (t) => {
      // the lens and the distance driven together (distance ∝ focal length), the camera at hip height and level, so the
      // runner holds a full shot and only the space behind changes
      const A = P("ALEX"), m = A(t), k = ramp(t, 0.45, 6.05), mm = 24 * Math.pow(85 / 24, k);
      const mid = m.top.clone().lerp(m.sole, 0.5), d = (frameHeight(m, "FS") * mm) / SENSOR_H;
      const pos = mid.clone().add(around(A(0), 0).multiplyScalar(d)).add(V(0, -0.15, 0));
      return { pos, target: aimFor(pos, mid, mm, [0, 0]), mm };
    }, flags: ["enters-moving", "exits-moving", "compound", "centre"], cut: "Opens the template" }],
    { build: buildAvenue, motes: { center: [0, 2.5, -10], size: [12, 5, 70], count: 260 } }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT05-ParkourTrack", name: "Parkour track", says: "We run with them and see the whole body solve the obstacle: skill, speed, flow.", use: "Chases on foot, parkour, any action where the body's line through the set is the point.", numbers: "35 mm full shot side-on, a real tracking-vehicle move (track_alongside_1, E.T. dataset) scaled to 5 m off; the rig does not hop with the runner (height smoothed over 1.4 s).", avoid: "Cutting the move into pieces: one side-on take shows that the stunt was real." },
    [human("ALEX", "Alex", "ochre", A5.keys, [clip("ClimbUp_1m", A5.tc, A5.tc + 0.67, 0.12), clip("NinjaJump_Idle_Loop", A5.te + 0.02, A5.tl - 0.1, 0.1), clip("Roll", A5.tl - 0.04, A5.tl + 0.68, 0.12)])],
    (P) => [{ start: 0, end: 7, label: "35mm  TRACKING · CLIMB, DROP, ROLL", rig: "TRACKING VEHICLE · REMOTE HEAD", subject: "ALEX", size: "FS", stop: 4, cam: (() => {
      // the vehicle's path is a real operator's (track_alongside_1); the remote head keeps the body framed, a beat behind
      const S = P("ALEX"), B = body(S.actor), F = rig.filmPath("track_alongside_1", settle(S), { size: "FS", mm: 35, deg: -25, rise: -1.4 }, 0);
      return (t: number): Cam => { const c = F(t), p = lag((x) => { const b = B(x); return b.waist.lerp(b.eye, 0.15); }, t, 0.3); return { ...c, target: aimFor(c.pos, p, c.mm, [leadRoom(c.pos, S(t), 0.18)[0], 0]) }; };
    })(), flags: ["enters-moving", "exits-moving", "compound", "whip"], cut: "Opens the template", note: "PAN exempt: the head follows the drop off the block" }],
    { build: (k) => {
      labWithBlock(A5.block.x, A5.z, A5.block.w, 1.0, 1.4)(k);
      // set dressing: the lamp post at the end of the run-out stands in the swing of the runner's arm; move it off the lane
      for (const o of k.scene.children) if (Math.abs(o.position.x - 16.5) < 0.05 && Math.abs(o.position.z - 2) < 0.05) o.position.z += 1.2;
    } }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT06-HeroLowArc", name: "Hero low arc", says: "Here they come: bigger than life, and time bends round them.", use: "The hero's entrance, the walk to the fight, the team reveal.", numbers: "21 mm, lens 0.45 m off the ground, medium-wide looking up about 30°; an 80° arc round the front at a steady 9°/s; world clock eased to 0.3 for 1.5 s at the middle of the arc.", avoid: "Speed-ramping a walk with nothing else moving: the dust and the camera must keep real time to sell it." },
    [human("ALEX", "Alex", "ochre", A6)],
    (P) => [{ start: 0, end: 8, label: "21mm  LOW ARC · SPEED RAMP", rig: "STEADICAM · LOW MODE", subject: "ALEX", size: "MWS", stop: 2.8, cam: (t) => {
      // an arc round the front at a held size; the move is eased over a longer span than the shot so it never stalls in it
      const A = P("ALEX"), m = A(t), deg = lerp(40, -40, clamp((t + 0.5) / 9));
      const c = frameFor(m, { size: "MWS", mm: 21, from: around(A(0), deg), rise: -1.19 });
      const pos = m.eye.clone().add(c.pos.clone().sub(m.eye).multiplyScalar(1.12));
      return { pos, target: aimFor(pos, m.eye, 21, [0, 0.45]), mm: 21 };
    }, flags: ["compound", "centre", "enters-moving", "exits-moving"], cut: "Opens the template", note: "Clock 0.3 from 3.3 to 4.8 s" }],
    { clock: clock6 }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT07-FightCoverage", name: "Fight coverage", says: "Who hits whom, in order: a wide for the geography, then closer as the fight decides itself.", use: "Any short exchange of blows: master, the pair of overs, an insert on the blow that matters.", numbers: "28 mm handheld master (real operator drift, handheld_drift_1), a 50 mm OTS on Alex, an 85 mm insert on the jab, a 32 mm single on Sam for the knockdown, all from one side of the line; cut on the start of each blow, never during it.", avoid: "Cutting before a blow completes, or crossing the line: the audience loses who is hitting." },
    [
      human("ALEX", "Alex", "ochre", [{ t: 0, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 1.8, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 2.3, at: [-0.43, 0], yaw: Math.PI / 2 }, { t: 6, at: [-0.43, 0], yaw: Math.PI / 2 }],
        [clip("Hit_Head", 1.38, 1.85, 0.08), ...strike("Punch_Cross", 2.3, 3.5, 0.45, 0.1), clip("Punch_Jab", 3.6, 4.2, 0.1), ...strike("Punch_Cross", 4.3, 6.6, 0.1, 0.7)]),
      human("SAM", "Sam", "slate", lying(0.5, 0, -Math.PI / 2, KNOCK_LIFT, KO7),
        [...strike("Punch_Jab", 1.2, 2.45, 0.6, 0.1), clip("Hit_Chest", 2.55, 3.6, 0.1), clip("Hit_Head", 3.78, KO7 - 0.03, 0.08), clip("Hit_Knockback", KO7, undefined, 0.03)]),
    ],
    (P) => {
      const S = P("SAM"), B = body(S.actor), A = body(P("ALEX").actor);
      const drift = rig.filmPath("handheld_drift_1", P("ALEX"), { size: "FS", mm: 28, deg: 90, rise: -0.6 }, 0);
      const master = (t: number): Cam => { const c = drift(t); return { ...c, target: aimFor(c.pos, A(t).waist.lerp(B(t).waist, 0.5).add(V(0, 0.1, 0)), c.mm, [0, 0]) }; };
      const ots2 = rig.ots(S, P("ALEX"), 50, -1, 2.6, 2.0), aim2 = A(2.3).eye;
      const ins = V(-0.8, 1.5, 2.95);
      const single = V(-0.5, 1.55, 2.6);
      const down = (t: number) => { const b = B(t); return b.waist.lerp(b.eye, 0.4); };
      return [
        { start: 0, end: 2.25, label: "28mm  WIDE MASTER · HANDHELD", rig: "HANDHELD", subject: "ALEX", size: "FS", stop: 4, pair: ["ALEX", "SAM"], cam: master, flags: ["compound", "centre", "enters-moving", "exits-moving"], cut: "Opens the template: the jab lands in the wide" },
        { start: 2.25, end: 3.55, label: "50mm  OTS · SAM ON ALEX", rig: "HANDHELD", subject: "ALEX", size: "MS", stop: 2.8, ots: "SAM", pair: ["ALEX", "SAM"], cam: (t) => { const c = ots2(t); return { ...c, target: aimFor(c.pos, aim2, 50, [-0.3, 0.42]) }; }, cut: "CUT on Alex starting the cross" },
        { start: 3.55, end: 4.25, label: "85mm  INSERT · THE JAB LANDS", rig: "TRIPOD", subject: "SAM", size: "INSERT", stop: 2, cam: () => ({ pos: ins.clone(), target: aimFor(ins, V(0.4, 1.52, 0), 85, [0.25, 0]), mm: 85 }), flags: ["short-side"], cut: "CUT on the jab's start, tight on where it lands" },
        { start: 4.25, end: 7.25, label: "32mm  SINGLE · SAM GOES DOWN", rig: "HANDHELD", subject: "SAM", size: "MWS", sizeEnd: "WS", stop: 2.8, pair: ["ALEX", "SAM"],
          cam: (t) => { const c: Cam = { pos: single.clone(), target: aimFor(single, B(t).eye, 32, [0.25, 0.45]), mm: 32 }; return reaim(c, down(t), [0.1, -0.1], ramp(t, 4.62, 5.25)); }, flags: ["compound", "whip", "short-side", "enters-moving"], note: "PAN exempt: the head follows the body down", cut: "CUT on the final cross's start: Sam's single takes him down" },
      ];
    }),

  // ------------------------------------------------------------------------------------------------------------
  make({ id: "ACT08-FallDrop", name: "Fall drop", says: "We go down with them: the floor comes up, and the one left standing towers.", use: "A knockout, a death, a collapse; the end of a fight from the loser's level.", numbers: "35 → 28 mm; the camera falls 1.45 m to 0.24 m off the floor in 0.75 s with a gravity ease, a beat behind the body, and lands 1.6 m from the head.", avoid: "Dropping before the body does: the camera follows the fall, it never leads it." },
    [
      human("ALEX", "Alex", "ochre", [{ t: 0, at: [0, 1.0], yaw: Math.PI }], [...strike("Punch_Cross", 1.5, 4.6, 0.6, 0.9)]),
      human("SAM", "Sam", "slate", lying(0, 0, 0, DEATH_LIFT, D8), [clip("Hit_Chest", 1.75, D8 - 0.08, 0.08), clip("Death01", D8, undefined, 0.08)]),
    ],
    (P) => {
      const S = P("SAM"), sam = S.actor, B = body(sam), eye = (t: number) => B(t).eye;
      const C0 = V(1.3, 1.62, -2.3), C1 = V(0.9, 0.24, -2.95);
      const drop = (t: number): Cam => {
        const k = ramp(t, 2.95, 3.75), e = k * k * (1.6 - 0.6 * k);
        const pos = C0.clone().lerp(C1, e), mm = 35 * Math.pow(28 / 35, e);
        const a = ramp(t, 2.95, 3.9);
        // the operator's aim rides the head a beat behind it, never ahead of the fall
        return { pos, target: aimFor(pos, lag(eye, t, 0.35), mm, [lerp(0.28, 0.32, a), lerp(0.2, -0.4, a)]), mm };
      };
      return [{ start: 0, end: 7.5, label: "35>28mm  FALL DROP TO THE FLOOR", rig: "TECHNOCRANE · DROP", subject: (t) => (t < 3.3 ? "SAM" : "ALEX"), focus: (t) => ["SAM", "ALEX", ramp(t, 4.6, 5.6)], size: "MWS", sizeEnd: "WS", stop: 2.8, cam: drop, flags: ["compound", "short-side", "whip"], cut: "Opens the template", note: "Drop 2.95–3.75 a beat behind the fall, then a rack from the head on the floor to the one standing; PAN exempt: the head follows the fall" }];
    }),
];
void scatter;
