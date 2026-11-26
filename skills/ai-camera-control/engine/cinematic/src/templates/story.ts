// STORY02: one 30 s scene on the orange-dust plaza set, built from two favourite blockouts: CAM42 (the drone dive) OPENS it and CAM25 (arc and rise) is
// its middle beat, with new shots between them (7 Nov 2026; shot list from an independent director).
// A man with a bad left leg and no crutch walks toward the camera across the plaza against the wind, stumbles, stops with a hand on his knee while the camera
// arcs and rises round him (CAM25: he is small in the world), goes on to a half-buried roll-down shop shutter in a monumental wall, kneels at its floor-level lock
// and turns the brass key. Nothing is rushed: his walk tops out at 0.8 m/s, every move eases in and out. The pin carries place, size and heading; every pose and
// expression comes from the prompt; the colonnades and the tower come from the prompt too, as in the CAM25 take.
import * as THREE from "three";
import { ramp, smoother } from "../util";
import { rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { aimFor } from "../framer";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { ENVIRONMENTS } from "./locations";
import type { Piece } from "../piece";

const plaza = ENVIRONMENTS["17-orange-dust"] as unknown as { sky: string; keyDir?: [number, number, number]; build: (w: { add: (o: THREE.Object3D) => void }) => void };
type W = { add: (o: THREE.Object3D) => void };
const mat = (hex: string) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.92 });
const block = (w: number, h: number, d: number, x: number, y: number, z: number, hex: string) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
const dome = (r: number, x: number, y: number, z: number, hex: string) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat(hex)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };

/** he walks +z along x = 0; the monumental wall (face at z = WALL_Z) holds the shutter, the lock at its foot; he kneels at KNEEL_Z facing it */
const WALL_Z = 7.8, KNEEL_Z = 6.9, LOCK_Z = WALL_Z - 0.35;
const set = {
  sky: plaza.sky, keyDir: plaza.keyDir,
  build: (w: W) => {
    plaza.build(w);
    w.add(block(40, 14, 1.0, 0, 7, WALL_Z + 0.5, "#9a8f84"));                                                         // the wall, face at z = 7.8
    for (let i = 0; i < 8; i++) w.add(block(4.0, 0.2, 0.14, 0, -0.2 + i * 0.2, WALL_Z - 0.07, i % 2 ? "#4a4540" : "#5b5651"));   // the shutter, half buried
    { const brass = new THREE.MeshStandardMaterial({ color: "#c9992f", roughness: 0.5, metalness: 0.35 });          // the brass floor lock: a round plate set flat in the ground in front of the shutter, keyhole on top
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 28), brass); plate.position.set(0, 0.015, LOCK_Z); w.add(plate);
      const hole = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.012), mat("#1a1714")); hole.position.set(0, 0.032, LOCK_Z); w.add(hole); }
    w.add(block(44, 270, 44, 0, 135, 70, "#8a8076"));                                                                   // the tower behind the wall, on the axis
    for (const [x, z, r] of [[-70, 110, 34], [90, 100, 30], [150, 40, 40], [-130, 30, 30]] as [number, number, number][]) { w.add(block(r * 2.1, r * 0.7, r * 2.1, x, r * 0.35, z, "#8a7f74")); w.add(dome(r, x, r * 0.7, z, "#9a8f84")); }
    for (const [x, z] of [[-14, 40], [14, 40], [-26, 62], [26, 62]] as [number, number][]) w.add(block(3.4, 70, 3.4, x, 35, z, "#8f847a"));
  },
};

type K = { t: number; at: [number, number]; yaw?: number };
// slow and labored, 0.8 m/s at most: toward us across the plaza (the dive ends with him at the origin at 6.4 s), a stumble at 10.8 s, a stop with a hand on the knee
// from 11.8 s to 19 s while CAM25 circles him, then on to the shutter, kneeling at 24 s facing it (+z)
const WALK: K[] = [
  { t: 0.4, at: [0, -3.4], yaw: 0.2 }, { t: 6.4, at: [0, 0], yaw: 0.2 }, { t: 10.4, at: [0, 3.0] },
  { t: 11.8, at: [0, 3.7] }, { t: 17.4, at: [0, 3.75] }, { t: 18.6, at: [0, 3.9] }, { t: 20.2, at: [0, 4.65] }, { t: 21.8, at: [0, 5.85] }, { t: 23.2, at: [0, KNEEL_Z], yaw: 0 },
];

type FocusFn = (t: number) => { pos: THREE.Vector3; name: string };
let FOCUS: FocusFn[] = [];   // filled in by the shots function below, applied to the built shots afterwards
const STOPS = [8, 2.0, 2.0, 2.8, 4.0, 2.0, 2.0];   // the aperture of each shot: deep for the dive, shallow for the faces and the lock

const zAt = (t: number) => { for (let i = 1; i < WALK.length; i++) if (t <= WALK[i].t) { const a = WALK[i - 1], b = WALK[i], k = (t - a.t) / (b.t - a.t); return a.at[1] + (b.at[1] - a.at[1]) * k; } return WALK[WALK.length - 1].at[1]; };
// his steps: a footprint for the good right foot (x -0.1), a drag scrape for the bad left foot (x +0.1), one per 0.6 s while he walks; none while he stops (11.8 to 18.8 s)
const STEPS: { t: number; bad: boolean }[] = [];
{ let bad = false; for (let t = 7.0; t <= 11.8; t += bad ? 0.5 : 0.7) { STEPS.push({ t, bad }); bad = !bad; } bad = false; for (let t = 19.2; t <= 23.0; t += bad ? 0.5 : 0.7) { STEPS.push({ t, bad }); bad = !bad; } }
const stepActors = STEPS.map((st, i) => { const x = st.bad ? 0.1 : -0.1, z = zAt(st.t) + (st.bad ? -0.05 : 0.1); return { id: `STEP${i}`, name: `Step ${i}`, kind: "prop", model: st.bad ? "scrape" : "print", tint: "sand", path: [{ t: 0, at: [x, -1, z] }, { t: st.t - 0.05, at: [x, -1, z] }, { t: st.t, at: [x, 0.006, z] }] } as never; });

const BUILT: Piece[] = [
  baseMake({ id: "STORY02-DiveToShutter", name: "Dive to the shutter", says: "From the sky onto a man who can barely walk, across a dead place, to one spot where he turns a key.", use: "A silent 30 s scene with a want, an obstacle and a release.", numbers: "7 shots, 30 s: CAM42 drone dive, 50 mm lead, 25 mm boots, CAM25 arc and rise, 28 mm follow, 35 mm face, 50 mm key.", avoid: "Rushing the kneel or the silence after the bolt." },
    [ALEX(WALK, [{ kind: "kneel", t0: 23.2, ease: 2.5 }, { kind: "lookDown", t0: 11.8, t1: 18.8 }, { kind: "lookDown", t0: 25 }]),
      // his fist with the key: hidden under the ground until he kneels (24 s), beside the lock, then it moves into the lock with a quarter turn at 28.5-29.2 s
      { id: "FIST", name: "Fist", kind: "prop", model: "fist", tint: "sand", path: [{ t: 0, at: [0.1, -1, LOCK_Z + 0.1] }, { t: 24.6, at: [0.1, -1, LOCK_Z + 0.1] }, { t: 24.8, at: [0.1, 0.46, LOCK_Z + 0.1] }, { t: 27.2, at: [0.1, 0.46, LOCK_Z + 0.1] }, { t: 28.0, at: [0, 0.2, LOCK_Z] }] } as never,
      { id: "KEY", name: "Key", kind: "prop", model: "key", tint: "sand", path: [{ t: 0, at: [0.1, -1, LOCK_Z + 0.1], yaw: 0 }, { t: 24.6, at: [0.1, -1, LOCK_Z + 0.1], yaw: 0 }, { t: 24.8, at: [0.1, 0.36, LOCK_Z + 0.1], yaw: 0 }, { t: 27.2, at: [0.1, 0.36, LOCK_Z + 0.1], yaw: 0 }, { t: 28.0, at: [0, 0.05, LOCK_Z], yaw: 0 }, { t: 28.3, at: [0, 0.05, LOCK_Z], yaw: 0.14 }, { t: 28.5, at: [0, 0.05, LOCK_Z], yaw: -0.1 }, { t: 28.7, at: [0, 0.05, LOCK_Z], yaw: 0.08 }, { t: 29.2, at: [0, 0.05, LOCK_Z], yaw: 1.2 }] } as never],
    (P) => {
      const A = P("ALEX");
      // the boots: low at his side, travelling with him, tilting up from the boots to the waist over 2 s
      // the feet: a low tracking shot beside him at ankle height, travelling with him as he walks, the ground sliding past, with no tilt (a slow rise of 0.1 m only); the stride, the drag and the catch come from the prompt (the pin has no limbs)
      const boots = (t: number): Cam => { const m = A(t), k = smoother(ramp(t, 10.5, 13)); return { pos: V(m.sole.x + 0.9, 0.45, m.sole.z - 0.25), target: V(m.sole.x, 0.03, m.sole.z + 0.1), mm: 25 }; };
      // the face: he kneels at a known spot with his head about 1.15 m up; the camera is in front of him and to his right (-x), close, on his head
      const face = (t: number): Cam => { const m = A(t), k = smoother(ramp(t, 25.3, 27.4)); return { pos: V(m.eye.x - 0.7 - 0.15 * k, m.eye.y - 0.1, Math.min(WALL_Z - 0.2, m.eye.z + 0.65)), target: V(m.eye.x, m.eye.y - 0.2, m.eye.z + 0.1), mm: 35 }; };
      // the key: low and close on the lock, a few centimetres of push
      const key = (t: number): Cam => { const k = smoother(ramp(t, 27.4, 30)); return { pos: V(-0.55 + 0.05 * k, 0.42, LOCK_Z - 0.42 + 0.04 * k), target: V(0.0, 0.1, LOCK_Z), mm: 50 }; };
      // the dive: CAM42's path (from 25 m up and 14 m out to a 3.4 m medium wide, 24 to 50 mm), but eased in and out over the whole 6.2 s so no second changes the size much
      const a0 = V(-9, 25, 11), b0 = V(-2.2, 1.9, 2.6);
      const dive = (t: number): Cam => { const r = ramp(t, 0.3, 6.5), e = 0.5 * smoother(r) + 0.5 * r, pos = a0.clone().lerp(b0, e), mm = 24 * Math.pow(50 / 24, e); return { pos, target: aimFor(pos, A(t).eye, mm, [0, 0.2]), mm }; };
      // ONE arc, very slow and even, from 13 to 25.2 s: it starts as CAM25's arc and rise (28 mm, round him from his front toward behind him, rising a little) and keeps turning, never blending or cutting,
      // until it is behind and to the side of him with the wall ahead; the tilt toward the wall grows gently the whole time
      const arc0 = rig.orbit(A, { size: "MWS", mm: 28 }, 30, 112, 13.0, 25.2, 0.9, 0.0);
      // the aim drifts from him toward the floor lock, so that from 15 s on the lock plate is always in frame beside him and he walks up to it
      const join = (t: number): Cam => { const c = arc0(t), m = A(t), w = 0.5 * smoother(ramp(t, 14.5, 21.5)), back = 1 + 0.7 * smoother(ramp(t, 15, 22)); const pos = m.eye.clone().add(c.pos.clone().sub(m.eye).multiplyScalar(back)); pos.y = c.pos.y + 0.5 * smoother(ramp(t, 15, 22)); return { ...c, pos, target: m.eye.clone().lerp(V(0, 0.2, LOCK_Z), w) }; };
      return [
        { start: 0, end: 6.5, label: "24>50mm  DRONE DIVE (CAM42)", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", sizeEnd: "MWS", cam: dive, flags: ["compound"], cut: "Opens the scene" },
        { start: 6.5, end: 10.5, label: "50mm  LEADING TRACK", rig: "STEADICAM", subject: "ALEX", size: "MCU", cam: rig.follow(A, { size: "MCU", mm: 50, deg: 22, rise: 0.05 }, 0.8), cut: "CUT on the gust" },
        { start: 10.5, end: 13, label: "25mm  LOW TRACK ON THE FEET", rig: "DOLLY · LOW TRACK", subject: "ALEX", size: "MS", cam: boots, cut: "CUT on the catch" },
        { start: 13, end: 19, label: "28mm  ARC AND RISE (CAM25)", rig: "TECHNOCRANE", subject: "ALEX", size: "MWS", sizeEnd: "WS", cam: join, flags: ["compound"], cut: "NO CUT: one camera move" },
        { start: 19, end: 25.3, label: "28mm  FOLLOW TO THE SHUTTER (from behind and to the side, so the lock stays visible)", rig: "STEADICAM", subject: "ALEX", size: "FS", cam: join, cut: "NO CUT: the camera carries on from the arc" },
        { start: 25.3, end: 27.4, label: "35mm  FACE", rig: "DOLLY · DRIFT", subject: "ALEX", size: "CU", cam: face, cut: "CUT to the face" },
        { start: 27.4, end: 30, label: "50mm  KEY AND LOCK", rig: "DOLLY · LOW", subject: "ALEX", size: "CU", cam: key, cut: "CUT to the lock" },
      ];
    }, set as never),
];
// a blockout has no fade from or to black; each built shot gets its own aperture and focus (mutated in place, since shotAt returns these same objects)
export const STORY_TEMPLATES: Piece[] = BUILT.map((p) => { p.shots.forEach((sh, i) => { (sh as unknown as { stop: () => number }).stop = () => STOPS[i]; (sh as unknown as { focus: FocusFn }).focus = FOCUS[i]; }); return { ...p, fade: false }; });

// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// STORY03: the second 30 s. It starts on the last frame of STORY02 (Alex kneeling at the floor lock, his fist on the key), the shutter lifts, his mother is behind it,
// they talk (ten short lines, one mouth on camera per shot, the other voice off camera over a reaction), the key goes from his hand into hers, she tells him to come in.
// Six shots, five cuts, every move slow. The mother is the second pill (yellow stripes); she carries place, size and facing only.
const WALL3 = 7.8;
const set3 = {
  sky: plaza.sky, keyDir: plaza.keyDir,
  build: (w: W) => {
    plaza.build(w);
    // the wall with a 4 x 2.4 m opening (the shutter panel is an actor that lifts), a small room behind it, a counter
    w.add(block(18, 14, 0.5, -11, 7, WALL3 + 0.25, "#9a8f84")); w.add(block(18, 14, 0.5, 11, 7, WALL3 + 0.25, "#9a8f84")); w.add(block(4, 11.6, 0.5, 0, 8.2, WALL3 + 0.25, "#9a8f84"));
    w.add(block(12, 0.3, 5.4, 0, 3.0, WALL3 + 3.0, "#8a7f74")); w.add(block(0.3, 3, 5.4, -6, 1.5, WALL3 + 3.0, "#8a7f74")); w.add(block(0.3, 3, 5.4, 6, 1.5, WALL3 + 3.0, "#8a7f74")); w.add(block(12, 3, 0.3, 0, 1.5, WALL3 + 5.8, "#8a7f74"));
    w.add(block(2.2, 1.0, 0.7, 2.6, 0.5, 11.6, "#7a6f64"));
    { const brass = new THREE.MeshStandardMaterial({ color: "#c9992f", roughness: 0.5, metalness: 0.35 });
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 28), brass); plate.position.set(0, 0.015, WALL3 - 0.35); w.add(plate); }
    w.add(block(44, 270, 44, 0, 135, 70, "#8a8076"));
    for (const [x, z, r] of [[-70, 110, 34], [90, 100, 30], [150, 40, 40], [-130, 30, 30]] as [number, number, number][]) { w.add(block(r * 2.1, r * 0.7, r * 2.1, x, r * 0.35, z, "#8a7f74")); w.add(dome(r, x, r * 0.7, z, "#9a8f84")); }
  },
};
const LK = WALL3 - 0.35;
STORY_TEMPLATES.push(...[
  baseMake({ id: "STORY03-TheGap", name: "Come in", says: "The shutter lifts and his mother is behind it: she will not make it easy.", use: "A 30 s conversation scene, one mouth on camera per shot.", numbers: "6 shots, 30 s, slow moves: 50 mm over the shoulder, 50 mm reverse, 50 mm on the hands, 70 mm close, 24 mm wide.", avoid: "Two speaking mouths in one shot." },
    [ALEX([{ t: 0, at: [0, 6.9], yaw: 0 }], [{ kind: "kneel", t0: -3, ease: 1 }]),
     SAM([{ t: 0, at: [0.05, 8.15], yaw: Math.PI }], [{ kind: "crouch", t0: -3, ease: 1 }]),
     { id: "SHUTTER", name: "Shutter", kind: "prop", model: "shutterPanel", tint: "sand", path: [{ t: 0, at: [0, 0, WALL3 - 0.1] }, { t: 0.4, at: [0, 0, WALL3 - 0.1] }, { t: 3.6, at: [0, 1.4, WALL3 - 0.1] }] } as never,
     { id: "FIST", name: "Fist", kind: "prop", model: "fist", tint: "sand", path: [{ t: 0, at: [0, 0.34, LK - 0.08] }, { t: 15, at: [0, 0.34, LK - 0.08] }, { t: 15.8, at: [-0.02, 0.85, 7.55] }, { t: 17.6, at: [0.02, 1.0, 7.95] }, { t: 18.6, at: [0.04, 1.02, 8.0] }, { t: 19.4, at: [-0.05, 0.9, 7.6] }, { t: 19.6, at: [-0.05, -1, 7.6] }] } as never,
     { id: "KEY", name: "Key", kind: "prop", model: "key", tint: "sand", path: [{ t: 0, at: [0, 0.08, LK], yaw: 0.9 }, { t: 15, at: [0, 0.08, LK], yaw: 0.9 }, { t: 15.8, at: [-0.02, 0.76, 7.55], yaw: 0 }, { t: 17.6, at: [0.02, 0.92, 7.95], yaw: 0 }, { t: 18.6, at: [0.04, 0.94, 8.0], yaw: 0 }, { t: 19.0, at: [0.04, 0.9, 8.02], yaw: 0 }, { t: 19.6, at: [0.04, -1, 8.02], yaw: 0 }, { t: 30, at: [0.04, -1, 8.02], yaw: 0 }] } as never],
    (P) => {
      const A = P("ALEX"), M = P("SAM");
      // S1: low above the sand from his right front, the lock and his fist in front, the shutter rising behind; a very slow push in
      const s1 = (t: number): Cam => { const k = smoother(ramp(t, 0, 4)); return { pos: V(-0.95 + 0.25 * k, 0.55, 6.3 + 0.2 * k), target: V(0.05, 0.55, 7.7), mm: 50 }; };
      // S2: over his right shoulder onto his mother's face in the gap, a slow drift in
      const s2 = (t: number): Cam => { const k = smoother(ramp(t, 4, 11)), m = M(t); return { pos: V(-0.55 + 0.1 * k, 1.15, 6.15 + 0.1 * k), target: V(m.eye.x, m.eye.y - 0.02, m.eye.z), mm: 50 }; };
      // S3: reverse, over her shoulder onto his face, a slow drift in
      const s3 = (t: number): Cam => { const k = smoother(ramp(t, 11, 16)), m = A(t); return { pos: V(0.4 - 0.05 * k, 1.1, 8.95 - 0.12 * k), target: V(m.eye.x, m.eye.y - 0.02, m.eye.z), mm: 50 }; };
      // S4: low and close on the gap: his fist with the key rises to her open hand
      const s4 = (t: number): Cam => { const k = smoother(ramp(t, 16, 20)); return { pos: V(-0.8, 0.75 + 0.1 * k, 7.15 + 0.1 * k), target: V(0.03, 0.9, 7.95), mm: 50 }; };
      // S5: her face, three-quarter from his side, a very slow push in
      const s5 = (t: number): Cam => { const k = smoother(ramp(t, 20, 28.5)), m = M(t); return { pos: V(-0.75 + 0.15 * k, 1.1, 7.0 + 0.25 * k), target: V(m.eye.x, m.eye.y - 0.03, m.eye.z), mm: 70 }; };
      // S6: wide from outside, low in the sand, the whole wall with the warm gap, a very slow pull back
      const s6 = (t: number): Cam => { const k = smoother(ramp(t, 28.5, 30)); return { pos: V(-7 - 0.3 * k, 0.6, 1.2 - 0.3 * k), target: V(0, 1.7, 8.1), mm: 24 }; };
      return [
        { start: 0, end: 4, label: "50mm  THE SHUTTER LIFTS", rig: "SLIDER", subject: "ALEX", size: "CU", cam: s1, cut: "Opens the scene" },
        { start: 4, end: 11, label: "50mm  OVER HIS SHOULDER: HER", rig: "SLIDER", subject: "SAM", size: "MCU", cam: s2, cut: "CUT on her glance down" },
        { start: 11, end: 16, label: "50mm  REVERSE: HIM", rig: "SLIDER", subject: "ALEX", size: "MCU", cam: s3, cut: "CUT as she finishes the line" },
        { start: 16, end: 20, label: "50mm  THE KEY GOES ACROSS", rig: "SLIDER", subject: "ALEX", size: "CU", cam: s4, cut: "CUT as her fingers close" },
        { start: 20, end: 28.5, label: "70mm  HER, CLOSE", rig: "SLIDER", subject: "SAM", size: "CU", cam: s5, cut: "CUT as he ducks toward the gap" },
        { start: 28.5, end: 30, label: "24mm  WIDE FROM OUTSIDE", rig: "SLIDER", subject: "SAM", size: "WS", cam: s6, cut: "Last image" },
      ];
    }, set3 as never),
].map((p) => ({ ...p, fade: false })));
