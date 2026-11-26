// SHOW01 The Handoff: a 30 s showcase that strings twelve of the template moves into one scene. Alex waits in the
// plaza with a suitcase; Mara comes without the money; a drone rises behind her; he runs, climbs a block, leaps, and in
// bullet time the case bursts open, empty. He lands and looks back at her.
// Layout (metres, -z north): Alex waits at (0, -4) facing south, Mara stops at (0.25, -1.6) facing him; every dialogue
// camera stays east of the line between them. The sun is low in the south-south-west, behind Mara, so she is rim-lit.
// Two buildings stand south-south-west beyond the open side of the plaza: the drone rises behind them, behind Mara.
// Alex flees north through the gap between the two northernmost columns, runs west outside the colonnade, climbs the
// block at about (-13, -17), leaps off its far edge, rolls, and stops where his look back passes a column gap to Mara.
// Everything in the set runs on the world clock (a speed ramp freezes the leap); cameras run on film time.
// Ten shots: slider, crane, OTS, her single, crash zoom, her single with the drone, FPV, bullet time, the case insert, the landing arc.
import * as THREE from "three";
import { scenePiece, planner, speedRamp, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { Act, Actor, ActorSpec, PathKey } from "../kit/actors";
import { around, framed, lag, rig } from "../kit/rigs";
import { aimFor, frameHeight, SENSOR_H } from "../framer";
import { GREY, clay } from "../kit/clay";
import { barrel, bench, broadTree, building, column, crate, ground, lampPost, pine, rock, scatter, steps } from "../kit/props";
import { clamp, lerp, ramp, smooth, smoother } from "../util";
import type { Piece } from "../piece";
import type { Cam, Shot } from "../shots";
import { body, clip, gaitClock, jogRow, JOG_MEAN, local, STAND } from "./action";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const flat = (v: THREE.Vector3) => v.clone().setY(0);
/** linear progress 0..1 (ramp() is already eased: wrapping it in another ease bunches a move into a few frames) */
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** progress at a constant rate, eased only over the first and last `e` seconds */
const easeEnds = (t: number, a: number, b: number, e: number) => { const T = b - a, x = clamp(t - a, 0, T), L = T - e; const f = x < e ? (x * x) / (2 * e) : x <= T - e ? x - e / 2 : L - ((T - x) * (T - x)) / (2 * e); return f / L; };

// ---- the clock: real time until the leap, eased to 1/25 at its top, held while the camera circles, eased back ----
export const CLOCK = speedRamp([[0, 1], [21.1, 1], [21.4, 0.04], [26.0, 0.04], [26.25, 1], [40, 1]]);
/** film time at world time w (the clock is monotonic) */
const filmAt = (w: number) => { let a = 0, b = 40; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (CLOCK(m) < w) a = m; else b = m; } return (a + b) / 2; };

// ---- marks ----
const A0 = V(0, 0, -4), M1 = V(0.25, 0, -1.6);
const YAW_A = Math.atan2(M1.x - A0.x, M1.z - A0.z) + 0.3, YAW_M = Math.atan2(A0.x - M1.x, A0.z - M1.z);
const RUN_Z = -16.3;

// ---- Alex's run (world time): spins on "Run.", bolts at 16.6 straight for the gap, west along z -16.3 past the block, leaps, rolls, stops ----
const T_RUN = 16.6, TE = 21.0, TC = TE - 1.02, VY = 3.2, VH = 4.2;                 // take-off on the cut to the orbit
const FLIGHT = (VY + Math.sqrt(VY * VY + 2 * 9.81 * 1.0)) / 9.81, TL = TE + FLIGHT, T_STOP = TL + 2.5;
// a straight line to the gap, a straight west leg for the block, then a bend north so the look back passes between columns 6 and 7
const RUN = new THREE.CatmullRomCurve3([V(0, 0, -4), V(-0.62, 0, -6.5), V(-1.24, 0, -9.05), V(-2.49, 0, -14.1), V(-4.0, 0, RUN_Z), V(-7, 0, RUN_Z), V(-10, 0, RUN_Z), V(-13, 0, RUN_Z),
  V(-15, 0, RUN_Z + 0.7), V(-16.2, 0, RUN_Z + 2.3), V(-16.6, 0, RUN_Z + 4.8)], false, "centripetal");
const RUN_L = RUN.getLength();
const SPEEDS: [number, number][] = [[T_RUN, 0], [T_RUN + 1.0, 5.0], [TC - 0.1, 5], [TC + 0.1, 2.9], [TC + 0.6, 3.6], [TC + 0.75, 4.4], [TE - 0.05, VH], [TL, VH],
  [TL + 0.15, 3.6], [TL + 0.9, 3.5], [TL + 1.7, 1.6], [T_STOP, 0], [60, 0]];
const vAt = (t: number) => { if (t <= SPEEDS[0][0]) return 0; for (let i = 1; i < SPEEDS.length; i++) if (t <= SPEEDS[i][0]) return lerp(SPEEDS[i - 1][1], SPEEDS[i][1], (t - SPEEDS[i - 1][0]) / (SPEEDS[i][0] - SPEEDS[i - 1][0])); return 0; };
const S_DT = 1 / 240, S_TAB: number[] = [0];
for (let t = T_RUN; t < 40; t += S_DT) S_TAB.push(S_TAB[S_TAB.length - 1] + vAt(t + S_DT / 2) * S_DT);
const sAt = (t: number) => { if (t <= T_RUN) return 0; const x = (t - T_RUN) / S_DT, i = Math.min(Math.floor(x), S_TAB.length - 2); return lerp(S_TAB[i], S_TAB[i + 1], x - i); };
const yAt = (t: number) => (t > TC && t < TL + 0.05 ? (t < TE ? ramp(t, TC + 0.05, TC + 0.45) : Math.max(0, 1 + VY * (t - TE) - 4.9 * (t - TE) ** 2)) : 0);
/** Alex's ground point at world time t */
export const alexAt = (t: number) => { const p = RUN.getPointAt(clamp(sAt(t) / RUN_L)); p.y = yAt(t); return p; };
const BLOCK = (() => { const f = alexAt(TC + 0.3).x, e = alexAt(TE).x - 0.05; return { x: (f + e) / 2, w: Math.abs(f - e), z: RUN_Z + 0.3, d: 1.0, h: 1.0 }; /* 0.3 m to his left: the case in his right hand clears its north face */ })();
export const STOP = alexAt(T_STOP + 0.3);
const ALEX_PATH: PathKey[] = (() => {
  // he spins on the spot to face north (turning to his left), then bolts in a straight line: turning while he runs off would drag his feet
  const k: PathKey[] = [{ t: 0, at: [A0.x, 0, A0.z], yaw: YAW_A }, { t: T_RUN - 0.45, at: [A0.x, 0, A0.z], yaw: YAW_A }, { t: T_RUN - 0.25, at: [A0.x, 0, A0.z], yaw: 1.75 }, { t: T_RUN - 0.02, at: [A0.x, 0, A0.z], yaw: 3.38 }];
  for (let t = T_RUN; t <= TL + 3.5; t += 1 / 24) { const p = alexAt(t); k.push({ t: +t.toFixed(4), at: [p.x, p.y, p.z] }); }
  // held on the heading he stops with (else the spin's yaw marks would turn him back north)
  const yEnd = Math.atan2(alexAt(T_STOP - 0.1).x - alexAt(T_STOP - 0.3).x, alexAt(T_STOP - 0.1).z - alexAt(T_STOP - 0.3).z);
  k.reduce((b, x) => (Math.abs(x.t - (T_STOP - 0.45)) < Math.abs(b.t - (T_STOP - 0.45)) ? x : b)).yaw = yEnd;   // active from 0.2 s before: as he slows under 0.8 m/s
  k.push({ t: 40, at: [STOP.x, 0, STOP.z], yaw: yEnd });
  return k;
})();
/** Alex's heading while he runs (planning) */
const alexYaw = (t: number): number => { if (t < T_RUN + 0.05) return YAW_A; const a = alexAt(t - 0.03), b = alexAt(t + 0.03); return Math.hypot(b.x - a.x, b.z - a.z) < 1e-4 ? alexYaw(t - 0.1) : Math.atan2(b.x - a.x, b.z - a.z); };

// ---- Mara: walks in from the open south side, stops facing him ----
const M_V = 1.61, M_FROM = M1.clone().add(V(0.13, 0, 0.991).multiplyScalar(M_V * 6.2 + 0.8 * M_V / 2));
const MARA_PATH: PathKey[] = (() => {
  const k: PathKey[] = [], L = M_FROM.distanceTo(M1);
  for (let t = -1.2; t <= 5.8 + 1e-6; t += 0.1) {
    const s = t <= 5.0 ? M_V * (t + 1.2) : M_V * 6.2 + M_V * (t - 5.0) - (M_V / 1.6) * (t - 5.0) ** 2;
    const p = M_FROM.clone().lerp(M1, clamp(s / L)); k.push({ t: +t.toFixed(3), at: [p.x, p.z] });
  }
  // she turns to run at 16.8, then turns back to watch him land (the look back finds her face)
  k.push({ t: 7, at: [M1.x, M1.z], yaw: YAW_M }, { t: 16.6, at: [M1.x, M1.z], yaw: YAW_M }, { t: 17.3, at: [M1.x, M1.z], yaw: YAW_M + Math.PI }, { t: CLOCK(27.6), at: [M1.x, M1.z], yaw: YAW_M + Math.PI }, { t: CLOCK(28.3), at: [M1.x, M1.z], yaw: YAW_M }, { t: 40, at: [M1.x, M1.z], yaw: YAW_M });
  return k;
})();

// ---- the case: carried in the right hand (placed on the hand every frame), opens and is let go in the leap ----
/** the grip in Alex's frame while he stands (measured: tools/scratch/show-hand.ts, with the arm held off the leg) */
const GRIP_STAND = V(-0.426, 0.974, -0.114);
const GRIP_Y = 0.61;                                     // the handle's grip above the case's origin
/** the burst at film 24.2 (world time): the lid is mid-swing when the insert cuts in at 24.5 */
const W_BURST = CLOCK(24.2), W_RELEASE = TL - 0.06;
/** where the case's origin is while he stands (planning) */
const caseStand = () => local(A0, YAW_A, GRIP_STAND.x, GRIP_STAND.y - GRIP_Y, GRIP_STAND.z);
const CASE_PATH: PathKey[] = (() => {
  const k: PathKey[] = [];
  for (let t = 0; t <= 26; t += 0.1) { const p = alexAt(t <= T_RUN ? 0 : t), base = t <= T_RUN ? A0 : p, y = alexYaw(t); const c = local(base, y, GRIP_STAND.x, GRIP_STAND.y - GRIP_Y + p.y, GRIP_STAND.z); k.push({ t: +t.toFixed(2), at: [c.x, c.y, c.z] }); }
  return k;
})();

// ---- the sheet of paper: thrown out of the case as it bursts, then drifting down (world time) ----
/** the case's middle at the burst, in Alex's running frame (measured) and the throw out of the lid, toward his right */
const PAPER_OFF = V(-0.698, 1.017, -0.414);
const paperAt = (w: number) => {
  const yaw = alexYaw(W_BURST), right = V(-Math.cos(yaw), 0, Math.sin(yaw)), fwd = V(Math.sin(yaw), 0, Math.cos(yaw));
  const p0 = local(alexAt(W_BURST), yaw, PAPER_OFF.x, PAPER_OFF.y, PAPER_OFF.z);
  const v0 = fwd.clone().multiplyScalar(VH * 0.85).add(right.clone().multiplyScalar(10.0)).add(V(0, 5.0, 0));
  const tau = Math.max(0, w - W_BURST), k = 0.22, vT = V(0, -0.55, 0);
  const p = p0.clone().add(vT.clone().multiplyScalar(tau)).add(v0.clone().sub(vT).multiplyScalar(k * (1 - Math.exp(-tau / k))));
  p.add(fwd.clone().multiplyScalar(0.18 * Math.sin(tau * 4.2) * (1 - Math.exp(-tau / 0.35))));
  p.y = Math.max(0.003, p.y);
  return { p, tau, yaw };
};
const PAPER_PATH: PathKey[] = (() => {
  const k: PathKey[] = [{ t: 0, at: paperAt(0).p.toArray() as [number, number, number] }, { t: W_BURST, at: paperAt(W_BURST).p.toArray() as [number, number, number] }];
  for (let tau = 0.004; tau <= 4; tau += tau < 0.25 ? 0.004 : 0.05) { const w = W_BURST + tau; k.push({ t: +w.toFixed(4), at: paperAt(w).p.toArray() as [number, number, number] }); }
  return k;
})();

// ---- the drone: hidden behind the buildings, rises behind Mara, crosses the plaza, drops in behind Alex ----
const B1 = { x: -5, z: 27, w: 14, d: 8, h: 6 }, B2 = { x: 9.5, z: 33, w: 13, d: 9, h: 11 };
const DRONE_PATH: PathKey[] = (() => {
  // the rise behind the roof (clear by 15.0), then on toward the lens of shot 6, low enough to stay in its frame as it grows, over Mara's head by 17.0
  const k: PathKey[] = [{ t: 0, at: [-5.6, 3.2, 30.6] }, { t: 14.05, at: [-5.6, 3.2, 30.6] }, { t: 14.95, at: [-5.6, 8.4, 30.0] }, { t: 15.6, at: [-5.4, 7.6, 24] },
    { t: 16.3, at: [-3.5, 5.8, 14] }, { t: 17.0, at: [-1.5, 3.4, 4] }];
  for (let t = 17.9; t <= TE + 0.01; t += 0.1) {
    // off his left shoulder and a little ahead, a head above him: the FPV behind him sees it hang over him, whole
    const p = alexAt(t), y = alexYaw(t), back = V(Math.sin(y), 0, Math.cos(y)).multiplyScalar(1.0).add(V(Math.cos(y), 0, -Math.sin(y)).multiplyScalar(1.0));
    k.push({ t: +t.toFixed(2), at: [p.x + back.x, lerp(3.4, 2.15, smooth(lin(t, 17.9, 18.3))) + yAt(t), p.z + back.z] });
  }
  const e = alexAt(TE);
  k.push({ t: TE + 0.6, at: [e.x + 0.6, 3.6, e.z - 0.4] }, { t: 30, at: [e.x + 0.8, 3.9, e.z - 0.5] });
  return k;
})();

// ---- dialogue (film seconds); the people talk with their bodies only (no mouths) ----
export const LINES: { who: string; text: string; at: number; end: number; shot: number }[] = [
  { who: "Mara", text: "You brought it.", at: 6.0, end: 6.8, shot: 3 },
  { who: "Alex", text: "Did you bring the money?", at: 7.5, end: 8.7, shot: 3 },
  { who: "Mara", text: "You really thought I would?", at: 10.8, end: 12.0, shot: 4 },
  { who: "Mara", text: "They said you'd bring people... You came alone. Run. Please.", at: 15.0, end: 16.6, shot: 6 },
  { who: "Drone loudspeaker (flat synthetic voice)", text: "Put the case down.", at: 18.3, end: 19.3, shot: 7 },
  { who: "Alex", text: "I lied too.", at: 29.0, end: 29.7, shot: 10 },
];
const talk = (who: string): Act[] => LINES.filter((l) => l.who === who).map((l) => ({ kind: "talk", t0: CLOCK(l.at - 0.1), t1: CLOCK(l.end + 0.4), ease: 0.4 }));

// Alex holds the case, so he does not talk with his hands (the talking clip lifts the right hand). In the OTS he looks down, then up at her slowly.
// Both capsules are fitted to the trunk: a gesture must not make a capsule breathe.
const ALEX: ActorSpec = { id: "ALEX", name: "Alex", kind: "human", tint: "ochre", path: ALEX_PATH, capsule: "trunk", look: "MARA", lookFrom: 2.3, lookTo: 16.3,
  acts: [{ kind: "lookDown", t0: 5.4, t1: 7.6, ease: 0.9 }, clip("ClimbUp_1m", TC, TC + 0.67, 0.12), clip("NinjaJump_Idle_Loop", TE + 0.1, TL - 0.1, 0.3), clip("Roll", TL - 0.04, TL + 0.75, 0.45)] };
// Mara holds in her single (no smile), swallows, a small head drop at 10.7; looks up at the drone from 14.8
const MARA: ActorSpec = { id: "MARA", name: "Mara", kind: "human", tint: "slate", path: MARA_PATH, capsule: "trunk", look: "ALEX", lookFrom: -5, lookTo: 16.6,
  acts: [...talk("Mara"), { kind: "lookDown", t0: 10.7, t1: 11.5, ease: 0.45 }, { kind: "lookUp", t0: 14.8, t1: 16.7, ease: 0.5 }] };
const CASE: ActorSpec = { id: "CASE", name: "Case", kind: "prop", model: "briefcase", tint: "rose", label: "#ff7a00", path: CASE_PATH };
const DRONE: ActorSpec = { id: "DRONE", name: "Drone", kind: "prop", model: "drone", tint: "stone", label: "#00c8d7", path: DRONE_PATH };
const PAPER: ActorSpec = { id: "PAPER", name: "Paper", kind: "prop", model: "sheet", tint: "sand", label: "#ffffff", path: PAPER_PATH };

// ---- the set: the camera-lab plaza, with the block, the two buildings, and the run and the sightlines cleared ----
function buildPlaza(w: KitWorld) {
  w.add(ground(500, 2.5, 45, GREY.ground));
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 0.08, 96), clay(GREY.set, 0.95)); plaza.position.y = 0.04; plaza.receiveShadow = true; w.add(plaza);
  // the paving's edge is a low kerb: a runner's path eases off it over half a metre rather than dropping 8 cm in a frame
  w.paving = (x, z) => { const r = Math.hypot(x, z); return r < 17 ? 0.08 : r < 17.5 ? 0.08 * (1 - smoother((r - 17) / 0.5)) : 0; };
  for (let i = -16; i <= 16; i += 2) {
    const len = 2 * Math.sqrt(Math.max(0, 17 * 17 - i * i));
    for (const rot of [0, Math.PI / 2]) { const j = new THREE.Mesh(new THREE.BoxGeometry(len, 0.01, 0.03), clay(GREY.mid, 0.95)); j.position.set(rot ? i : 0, 0.0755, rot ? 0 : i); j.rotation.y = rot; j.receiveShadow = true; w.add(j); }
  }
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + (0.9 * i) / 8); const c = column(5.5, 0.36); c.position.set(Math.cos(a) * 14.5, 0.08, -Math.sin(a) * 14.5); c.name = "COLUMN"; w.add(c); }
  const beam = new THREE.Mesh(new THREE.TorusGeometry(14.5, 0.25, 8, 64, Math.PI * 0.92), clay(GREY.set)); beam.rotation.x = -Math.PI / 2; beam.rotation.z = Math.PI * 0.04;   // on the columns (north) beam.position.y = 5.6; beam.castShadow = true; w.add(beam);
  const st = steps(7, 7, 0.17, 0.4); st.position.set(-15.5, 0.08, 1.4); st.rotation.y = -Math.PI / 2; w.add(st);
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 9), clay(GREY.set)); terrace.position.set(-21.2, 0.6, 1.4); terrace.castShadow = terrace.receiveShadow = true; w.add(terrace);
  for (const [x, z, ry, len] of [[11, 9, 0.6, 6], [-9, 11.5, -0.4, 5]] as const) { const wl = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.4), clay(GREY.light)); wl.position.set(x, 0.53, z); wl.rotation.y = ry; wl.castShadow = wl.receiveShadow = true; w.add(wl); }
  const props: [THREE.Object3D, number, number, number][] = [[bench(), 6.5, 11.8, 0.3], [bench(), -11.5, -6.5, 1.2], [crate(0.9), 13.2, 4.2, 0.3], [crate(0.7), 13.6, 5.3, 0.9], [barrel(1), 12.4, 5.6, 0], [lampPost(4.6), 9.5, -12.5, 2.3], [lampPost(4.6), -3, 16, 3.5], [lampPost(4.6), 16.5, 2, -1.6]];
  for (const [o, x, z, ry] of props) { o.position.set(x, 0.08, z); o.rotation.y = ry; w.add(o); }
  // trees and rocks beyond, kept off the run, the landing, the look back to Mara and the view south to the buildings
  const keep: [number, number, number][] = [[-21, 1.4, 7], [-4, -17, 6], [-12, -17.5, 7], [-20, -16, 8], [-17, -12, 6], [-5, 22, 10], [9, 27, 9], [-1, 40, 8]];
  const trees = new THREE.Group(); w.add(trees);
  scatter(trees, 46, 22, 60, (i) => (i % 3 === 0 ? broadTree(7 + (i % 4), i) : pine(9 + (i % 5) * 1.5, i)), 21, keep);
  scatter(trees, 26, 19, 45, (i) => rock(100 + i, 0.8 + (i % 4) * 0.6), 33, keep);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3, d = 110 + (i % 3) * 25; const b = building(14 + (i % 3) * 4, 12, 18 + (i % 4) * 9, i); b.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); b.rotation.y = -a + Math.PI / 2; w.add(b); }
  // the two buildings beyond the open south side (the set, not scenery: they stay in a --no-scenery render)
  for (const [B, seed] of [[B1, 3], [B2, 8]] as const) { const b = building(B.w, B.d, B.h, seed, GREY.light); b.position.set(B.x, 0, B.z); b.rotation.y = Math.PI; b.name = "BUILDING"; w.add(b); }
  // the stone block for the leap
  const b = new THREE.Mesh(new THREE.BoxGeometry(BLOCK.w, BLOCK.h, BLOCK.d), clay(GREY.light, 0.9)); b.position.set(BLOCK.x, w.paving(BLOCK.x, BLOCK.z) + BLOCK.h / 2, BLOCK.z); b.castShadow = b.receiveShadow = true; b.name = "BLOCK"; w.add(b, "block");
  const lip = new THREE.Mesh(new THREE.BoxGeometry(BLOCK.w + 0.04, 0.05, BLOCK.d + 0.04), clay(GREY.mid, 0.9)); lip.position.set(BLOCK.x, BLOCK.h - 0.025, BLOCK.z); lip.castShadow = lip.receiveShadow = true; w.add(lip);
  // golden hour: a warm, low key
  const L = (w as { light?: KitWorld["light"] }).light;
  if (L) { L.key.color.set("#ffc890"); L.key.intensity = 3.3; L.hemi.intensity = 0.85; L.fill.intensity = 0.3; }
}

// ---- per frame: the arm held off the leg, the thumb tapping, the case on the hand, the burst, the paper ----
/** set a bone from its clip pose each frame without stacking (the mixer leaves a bone alone when its clip value holds) */
const held = new WeakMap<THREE.Object3D, { base: THREE.Quaternion; wrote: THREE.Quaternion }>();
function override(bone: THREE.Object3D, f: (base: THREE.Quaternion) => THREE.Quaternion) {
  const s = held.get(bone), base = s && bone.quaternion.equals(s.wrote) ? s.base.clone() : bone.quaternion.clone();
  const q = f(base); bone.quaternion.copy(q); held.set(bone, { base, wrote: q.clone() });
}
/** a world-space rotation of a bone, about axis by angle, on top of base */
const worldTurn = (bone: THREE.Object3D, base: THREE.Quaternion, axis: THREE.Vector3, a: number) => {
  bone.quaternion.copy(base); bone.updateMatrixWorld(true);
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(new THREE.Quaternion().setFromAxisAngle(axis, a));
  return bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world);
};
/** the taps of his thumb on the handle (film = world seconds, before the run) */
const TAPS = [0.25, 0.6, 0.95, 1.3, 1.75, 2.2, 3.0, 3.35];
const tap = (t: number) => TAPS.reduce((s, t0) => s + Math.max(0, Math.sin(Math.PI * clamp((t - t0) / 0.22))), 0);
export const THUMB_AXIS = V(0, 0, 1);
/** surfaces a carried case may not go into: the block's top (it is lifted onto it as he climbs), else the paving */
const surfaceUnder = (x: number, z: number) => (Math.abs(x - BLOCK.x) < BLOCK.w / 2 + 0.36 && Math.abs(z - BLOCK.z) < BLOCK.d / 2 + 0.13 ? BLOCK.h : 0);
type Release = { p: THREE.Vector3; v: THREE.Vector3; yaw: number };
const releases = new WeakMap<KitWorld, Release>();
function poseArm(w: KitWorld, t: number) {
  const r = w.actors.get("ALEX")!.rig!;
  const hold = 1 - ramp(t, W_RELEASE - 0.1, W_RELEASE + 0.2);
  r.root.updateMatrixWorld(true);
  const fwd = V(0, 0, 1).applyQuaternion(r.root.quaternion);
  // the arm held a little off the leg, so the case clears it
  // and further out while he runs (a counterweight), so it swings clear of the knee
  const run = THREE.MathUtils.smoothstep(w.actors.get("ALEX")!.speed(t), 1.5, 4);
  const spin = Math.sin(Math.PI * clamp((t - (T_RUN - 0.5)) / 0.6)) ** 2;          // and flung out as he spins round
  const jump = ramp(t, TE - 0.15, TE + 0.2) * (1 - ramp(t, TL - 0.25, TL - 0.05));  // and held down through the leap (the jump clip raises both arms)
  const side = V(1, 0, 0).applyQuaternion(r.root.quaternion);
  override(r.bone.upperarm_r, (b) => { const q = worldTurn(r.bone.upperarm_r, b, fwd, -(0.3 + 0.32 * Math.max(run, spin)) * hold); return jump > 0 ? worldTurn(r.bone.upperarm_r, q, side, -1.2 * jump * hold) : q; });
  const th = r.root.getObjectByName("thumb_01_r");
  if (th) override(th, (b) => b.clone().multiply(new THREE.Quaternion().setFromAxisAngle(THUMB_AXIS, 0.45 * tap(t))));
  r.root.updateMatrixWorld(true);
}
function placeOnHand(w: KitWorld) {
  const r = w.actors.get("ALEX")!.rig!, c = w.actors.get("CASE")!.root;
  const g1 = r.root.getObjectByName("middle_01_r")!.getWorldPosition(V(0, 0, 0)), g2 = r.root.getObjectByName("thumb_02_r")!.getWorldPosition(V(0, 0, 0));
  const grip = g1.add(g2).multiplyScalar(0.5);
  const p = grip.clone().add(V(0, -GRIP_Y, 0));
  p.y = Math.max(p.y, surfaceUnder(p.x, p.z) + w.paving(p.x, p.z));
  c.position.copy(p); c.rotation.set(0, r.root.rotation.y - Math.PI / 2, 0);
}
function tick(w: KitWorld, t: number) {
  const a = w.actors.get("ALEX"), cs = w.actors.get("CASE"), pp = w.actors.get("PAPER");
  if (!a?.rig || !cs || !pp) return;
  const c = cs.root, lid = c.getObjectByName("lid")!;
  // the release: the hand's grip at the moment he lets go, and its speed (found once by posing him there)
  if (t > W_RELEASE && !releases.has(w)) {
    const at = (x: number) => { a.update(x, w.actors); poseArm(w, x); placeOnHand(w); return { p: c.position.clone(), yaw: c.rotation.y }; };
    const p0 = at(W_RELEASE - 1 / 120), p1 = at(W_RELEASE);
    // he flings it off to his right as he goes into the roll, out of his way
    const v = p1.p.clone().sub(p0.p).multiplyScalar(120), y = a.yaw(W_RELEASE);
    v.x *= 0.55; v.z *= 0.55; v.add(V(-Math.cos(y), 0.6, Math.sin(y)).multiplyScalar(1.8));
    releases.set(w, { p: p1.p, v, yaw: p1.yaw });
    a.update(t, w.actors);
  }
  poseArm(w, t);
  if (t <= W_RELEASE) placeOnHand(w);
  else {
    // let go on the landing: it flies on, hits the ground, tips onto its back and skids to a stop
    const R = releases.get(w)!, tau = t - W_RELEASE, g = 9.81;
    const hit = (R.v.y + Math.sqrt(R.v.y ** 2 + 2 * g * Math.max(0, R.p.y))) / g;
    const vh = flat(R.v), sp = vh.length(), dir = vh.clone().normalize();
    if (tau < hit) { c.position.copy(R.p).addScaledVector(R.v, tau).add(V(0, -0.5 * g * tau * tau, 0)); c.rotation.set(0, R.yaw, 0); }
    else {
      const s = tau - hit, stop = sp / 6, ss = Math.min(s, stop), d = sp * hit + sp * ss - 3 * ss * ss;
      const tip = smoother(s / 0.3);
      c.position.copy(flat(R.p)).addScaledVector(dir, d).setY(lerp(0, 0.13, tip));
      c.rotation.set(-Math.PI / 2 * tip, R.yaw, 0, "YXZ");
    }
  }
  // the burst: the lid swings open toward his right (the lens), then lies open on the ground
  const open = smoother((t - W_BURST) / 0.024) * 2.1, lying = t > W_RELEASE ? smoother((t - W_RELEASE - 0.25) / 0.4) : 0;
  lid.rotation.x = lerp(open, Math.PI, lying);
  // the latches pop just before the lid goes (flipping up on the lid's face)
  const pop = smoother((t - (W_BURST - 0.007)) / 0.005) * 1.4;
  c.traverse((o) => { if (o.name === "clasp") o.rotation.x = -pop; });
  // the paper: hidden in the case until the burst
  const P = paperAt(t);
  pp.root.visible = t >= W_BURST;
  pp.root.position.copy(P.p);
  const land = P.p.y < 0.01 ? 0 : 1;
  // tilted up toward the lens on the front of the orbit, fluttering as it drifts
  // its face toward the insert's lens (north and up) as it lifts out, turning in its own plane, fluttering as it drifts
  pp.root.rotation.set((-0.7 + 0.35 * Math.sin(P.tau * 3)) * land, P.yaw + 0.35 + 0.8 * P.tau, 0.3 * Math.sin(P.tau * 5) * land, "XYZ");
  // the look back: once he has stopped, his head turns to Mara (the look window of his spec ended with the run)
  const lb = ramp(t, CLOCK(28.3), CLOCK(28.8));
  if (lb > 0) a.rig.look(w.actors.get("MARA")!.eye(t), lb);
}

// ---- the shots ----
export const SHOWCASE_INFO = { id: "SHOW01-TheHandoff", name: "The Handoff" };
function shots(P: ReturnType<typeof planner>): ShotDef[] {
  const A = P("ALEX"), M = P("MARA"), Wt = (t: number) => CLOCK(t);
  const right = V(-Math.cos(YAW_A), 0, Math.sin(YAW_A)), fwdA = V(Math.sin(YAW_A), 0, Math.cos(YAW_A));
  const G = caseStand().add(V(0, GRIP_Y, 0));                                   // the handle
  // 1 macro slider on the thumb and the handle
  const s1a = G.clone().addScaledVector(right, 0.95).addScaledVector(fwdA, -0.06).add(V(0, 0.07, 0)), s1b = s1a.clone().addScaledVector(fwdA, 0.12);
  // 2 crane: from 0.9 m over the handle (where shot 1 leaves it, the frame a metre wide), straight up, then the swing out east to a high wide
  const s2 = (t: number): Cam => {
    const k = smooth(lin(t, 2.8, 5.2));
    const p0 = G.clone().addScaledVector(right, 0.15).add(V(0, 0.9, 0)), p1 = V(3.6, 4.6, -9.8), mid = G.clone().add(V(0.6, 7.2, -1.6));
    const pos = p0.clone().multiplyScalar((1 - k) ** 2).add(mid.multiplyScalar(2 * k * (1 - k))).add(p1.clone().multiplyScalar(k * k));
    const tgt = G.clone().lerp(V(0.3, 0.6, -1.9), smooth(lin(t, 3.4, 5.2)));
    return { pos, target: tgt, mm: 32 };
  };
  // 3 OTS over Mara's shoulder onto Alex, his eyes a little under the upper third so the carrying hand clears the frame's edge
  const ots = rig.ots(M, A, 75, 1, 3.0, 1.6);
  const s3 = (t: number): Cam => { const c = ots(t); return { ...c, target: aimFor(c.pos, A(t).eye, 75, [0.12, 0.45]) }; };
  // 4 handheld single on Mara, Dutch, 45° off her eyeline, continuous low shake
  const s4 = rig.shake((() => { const c = rig.locked(M, { size: "CU", mm: 60, deg: -45, rise: -0.04 }, 10); return (): Cam => ({ ...c(), roll: 0.14 }); })(), 4, 3);
  // 5 crash zoom: the wide held 0.4 s, 32 to 180 mm over 0.25 s with the aim moving onto his eyes, then held
  const C5 = V(2.5, 1.62, -0.85);
  const s5 = (t: number): Cam => { const k = smooth(lin(t, 12.4, 12.65)), mm = 32 * Math.pow(180 / 32, k); return { pos: C5.clone(), target: aimFor(C5, A(t).eye, mm, [0, lerp(1 / 3, 0.05, k)]), mm }; };
  // 6 locked low close-up on Mara (frame right, her whole head in), the roofline and the drone frame left; the drone grows as it comes on
  const C6 = V(1.3, 1.3, -3.5), Y6 = -0.33, P6 = 0.12;
  const T6 = C6.clone().add(V(Math.sin(Y6) * Math.cos(P6), Math.sin(P6), Math.cos(Y6) * Math.cos(P6)).multiplyScalar(10));
  // 7 FPV behind the runner, the aim a little high so the drone over his shoulder stays whole
  const fpv = rig.fpv(A, 2.6, 0.1, 18, 0.8);
  const s7 = (t: number): Cam => { const c = fpv(t); return { ...c, target: aimFor(c.pos, lag((x) => A(x).eye, t, 0.25), 18, [0, 0.2]) }; };
  // 8 bullet time: a half circle at a steady 50°/s, from off his right (nothing like the FPV's back view) across the front (the face dot and the case to the lens) to his left
  const AA = A.actor, B = body(AA), m0 = A(TE);
  const s8 = (t: number): Cam => {
    const b = B(Wt(t)), mid = b.waist.clone().lerp(b.eye, 0.3);
    const deg = lerp(-100, 75, easeEnds(t, 21.0, 24.5, 0.3)), mm = 28;
    const d = (1.05 * frameHeight(m0, "FS") * mm) / SENSOR_H;
    const pos = mid.clone().add(around(m0, deg).multiplyScalar(d));
    pos.y = mid.y + 0.25;
    return { pos, target: aimFor(pos, mid, mm, [0, 0.05]), mm };
  };
  // 9 an insert on the frozen case from the side its lid opens to (his right, north, a little above), a slow push from 5.6 to 4.5 m
  const CASE_OFF = V(0.268, 0.480, -0.695);                                        // the case's origin off his path point in the frozen leap (measured: tools/scratch/show-off.ts)
  const caseFrozen = (t: number) => alexAt(Wt(t)).add(CASE_OFF).add(V(0, 0.27, 0));   // its middle; it rides his hand through the hold
  const s9 = (t: number): Cam => {
    const k = smooth(lin(t, 24.5, 26.5)), d = lerp(5.6, 4.5, k), mm = 65;
    const c = caseFrozen(t), pos = c.clone().add(V(0.35, 0.4, -1).normalize().multiplyScalar(d));
    return { pos, target: aimFor(pos, c.clone().add(V(0, -0.15, 0)), mm, [0, 0]), mm };
  };
  // 10 low hero arc on the landing: 4.3 m out at lens height 0.45 m, from north of the stop mark round to the far side from Mara, at a steady rate;
  // the aim rides the eye as the roll really carries it, so the roll stays in frame; at the end his look back and Mara (through the column gap) share the frame
  const toM = flat(M1.clone().sub(STOP)).normalize(), phiM = Math.atan2(toM.x, toM.z);
  const s10 = (t: number): Cam => {
    const k = easeEnds(t, 26.5, 29.6, 0.5), phi = lerp(Math.PI - 0.15, phiM + Math.PI + 0.42, k), R = 4.3;
    const pos = STOP.clone().add(V(Math.sin(phi) * R, 0.45, Math.cos(phi) * R));
    const e = lag((x) => B(Wt(x)).eye, t, 0.4);
    return { pos, target: aimFor(pos, e, 28, [lerp(0, -0.38, smooth(lin(t, 27.3, 29.0))), lerp(0.32, 0.12, smooth(lin(t, 27.3, 28.5)))]), mm: 28 };
  };
  return [
    { start: 0, end: 2.5, label: "100mm  MACRO SLIDER · THUMB ON THE HANDLE", rig: "SLIDER", subject: "CASE", size: "INSERT", stop: 2, shadow: 4, cam: rig.truck(s1a, s1b, right.clone().negate().add(V(0, -0.11, 0)), 100, 0, 2.5, undefined, 0.3), flags: ["centre"], cut: "Opens the film" },
    { start: 2.5, end: 5.5, label: "32mm  CRANE · OVER THE HANDLE UP TO A HIGH WIDE", rig: "TECHNOCRANE · REMOTE HEAD", subject: (t) => (t < 4.2 ? "ALEX" : "MARA"), size: "WS", stop: 8, cam: s2, pair: ["ALEX", "MARA"], flags: ["compound", "centre", "whip"], cut: "MATCH CUT on the handle: the frame a metre wide, straight down, then the rise", note: "PAN exempt: the head leaves straight down, where the pan angle is undefined" },
    { start: 5.5, end: 9, label: "75mm  OTS · MARA ON ALEX", rig: "STEADICAM", subject: "ALEX", size: "MCU", stop: 2.8, ots: "MARA", pair: ["ALEX", "MARA"], cam: s3, cut: "CUT over her shoulder as she stops" },
    { start: 9, end: 12, label: "60mm  HANDHELD CU · MARA · DUTCH 8", rig: "HANDHELD", subject: "MARA", size: "CU", stop: 2, pair: ["ALEX", "MARA"], cam: s4, cut: "CUT to her single, same side of the line" },
    { start: 12, end: 14, label: "32>180mm  CRASH ZOOM · ALEX'S EYES", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "MWS", sizeEnd: "ECU", stop: 2.8, pair: ["ALEX", "MARA"], cam: s5, flags: ["whip", "centre", "compound"], cut: "CUT on her question; the sound drops out", note: "The wide held 0.4 s, zoom 12.4 to 12.65, held on his eyes" },
    { start: 14, end: 17, label: "50mm  LOCKED CU · MARA · RACK TO THE DRONE", rig: "TRIPOD", subject: "MARA", size: "CU", stop: 2, pair: ["ALEX", "MARA"], cam: () => ({ pos: C6.clone(), target: T6.clone(), mm: 50 }), focus: (t) => ["MARA", "DRONE", smooth(lin(t, 15.0, 15.55))], flags: ["centre", "short-side"], cut: "CUT to her, low" },
    { start: 17, end: 21, label: "18mm  FPV CHASE · THROUGH THE COLUMNS", rig: "FPV DRONE", subject: "ALEX", size: "MWS", stop: 5.6, cam: s7, flags: ["enters-moving", "exits-moving", "centre", "compound", "whip"], note: "PAN exempt: the FPV banks through the gap with the runner", cut: "CUT ON ACTION: he is already running" },
    { start: 21, end: 24.5, label: "28mm  BULLET-TIME ORBIT 175 · RIGHT TO LEFT", rig: "VIRTUAL CAMERA ARRAY · ORBIT", subject: "ALEX", size: "FS", stop: 2.8, cam: s8, flags: ["compound", "centre", "whip", "enters-moving", "exits-moving"], cut: "CUT ON THE TAKE-OFF FRAME", note: "Clock 1 to 0.04 at the top of the leap, held while the camera circles; the latches pop at 24.2" },
    { start: 24.5, end: 26.5, label: "65mm  INSERT · THE CASE OPENS, EMPTY", rig: "VIRTUAL CAMERA ARRAY · MACRO PUSH", subject: "CASE", size: "INSERT", stop: 2, shadow: 4, cam: s9, focus: (t) => ["CASE", "PAPER", smooth(lin(t, 24.8, 25.4))], flags: ["centre", "enters-moving", "exits-moving", "compound"], cut: "CUT inside the frozen moment, onto the case", note: "Clock held at 0.04: the lid swings wide toward the lens, the lining is bare, the one sheet lifts out; time snaps back in the last 0.3 s" },
    { start: 26.5, end: 30, label: "28mm  LOW HERO ARC · LOOK BACK", rig: "STEADICAM · LOW MODE", subject: (t) => (t > 28.5 && t < 28.95 ? "MARA" : "ALEX"), size: "WS", sizeEnd: "MWS", stop: 2, cam: s10, focus: (t) => ["ALEX", "MARA", smooth(lin(t, 28.5, 28.85)) * (1 - smooth(lin(t, 28.95, 29.25)))], flags: ["compound", "enters-moving", "whip"], note: "PAN exempt: the head follows the roll", cut: "CUT on the landing: the roll" },
  ];
}

export function showcasePiece(): Piece {
  const spec: SceneSpec = { id: SHOWCASE_INFO.id, title: "THE HANDOFF", sky: "dusk", keyDir: [-0.27, 0.3, 0.92], build: buildPlaza, actors: [ALEX, MARA, CASE, DRONE, PAPER],
    motes: { center: [-6, 2.5, -6], size: [44, 6, 40], count: 220 }, tick, clock: CLOCK };
  const piece = scenePiece(spec, shots(planner(spec)), { scene: "SHOW01", version: "v1" });
  // the slider's focus: the thumb on the handle, then a small pull to the clasp nearest the lens at the end of the slide
  const s1 = piece.shots[0] as Shot;
  const G = caseStand().add(V(0, GRIP_Y, 0)), clasp = local(caseStand(), YAW_A - Math.PI / 2, 0.2, 0.45, 0.125);
  s1.focus = (t) => ({ pos: G.clone().lerp(clasp, smooth(lin(t, 2.0, 2.4))), name: t < 2.2 ? "HANDLE" : "CLASP" });
  return { ...piece, look: (t) => ({ ...piece.look(t), warm: 0.35 }) };
}
void filmAt; void framed; void gaitClock; void jogRow; void JOG_MEAN; void STAND; void smoother;
