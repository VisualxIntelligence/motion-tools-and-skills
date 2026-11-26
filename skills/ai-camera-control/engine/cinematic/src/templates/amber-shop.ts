// AMBER, the shop part: 25.04 s to 56.667 s of "1107-Amber-Cinema-Gamma24-4K.mp4" (the lock, the key, the shutter, the shop, the cup, the dark).
// Exports (see amber-world.ts, ShopExports): shopSet, shopActors, SHOP_MAN_PATH, SHOP_MAN_ACTS, shopShots, MAN_KNEEL_T1. Extras: shopExposure (the edit fade), SHOP_ROOM,
// shopWallAroundOpening (for a plaza wall that has no hole). shopSet only adds the lock plate: the whole interior is the prop actor ROOM in shopActors (hidden during the aerial dive). Everything in metres on the shared clock; world frame as in amber-world.ts
// (x: the man's LEFT when he faces the wall, z: toward the wall, wall face at z = 0, the shop behind it at z > 0).
// How the film's shop maps onto this frame (the segD analyst's room, rotated): the opening runs x -1.7 to +1.7 in the wall; the hooks wall is the plane x = +2.6, the plank wall with
// the conduit and the chair is the plane z = 2.8 (the golden wall behind the mother in shot 3), the table runs along x from 0.1 to 2.5. SHOP.z1 = 5.5 of the contract is NOT used:
// the film's room is only 2.8 m deep.
// No effects: no sand, dust, glow, light shafts or coloured light. The shutter, the key, the scarf, the coat and the cup are plain shapes with a flat label colour.
import * as THREE from "three";
import { GREY, clay, shadeAll } from "../kit/clay";
import { PROPS, type ActorSpec, type Act, type PathKey } from "../kit/actors";
import { dress } from "../kit/props";
import type { Cam } from "../shots";
import { ramp, track, v3 } from "../util";
import { CUT, KNEEL, LOCK_Z, MOTHER, SHUTTER, shutterLift } from "./amber-world";

type W = { add: (o: THREE.Object3D) => void };
type Key = PathKey;

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// the room (contract frame)
export const SHOP_ROOM = {
  x0: -2.6, x1: 2.6, z0: 0, z1: 2.8, wallH: 2.7,
  opening: { x0: -1.7, x1: 1.7, h: SHUTTER.h },
  table: { x0: 0.1, x1: 2.5, z0: 1.15, z1: 2.35, h: 0.92 },
  bulb: { x: 1.6, y: 2.0, z: 1.65 },
  manSeat: { x: 0.55, z: 2.2 },                 // the man's pin root when he sits (the seat pelvis is 0.3 m behind it, at z 2.5)
  steps: { x0: 1.0, x1: 1.9, stepA: { z0: 0.45, z1: 0.65, top: 0.18 }, stepB: { z0: 0.0, z1: 0.45, top: 0.36 } },
};
const R = SHOP_ROOM;

const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, rough = 0.92) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c, rough)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
};
const cyl = (r: number, h: number, x: number, y: number, z: number, c: string, seg = 20) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), clay(c, 0.9)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
};

/** the wall around the opening, for a plaza wall that has no hole in it: two blocks and a lintel, 0.3 m thick (z 0 to 0.3), x -20 to 20, 6 m high */
export function shopWallAroundOpening(w: W) {
  const o = R.opening;
  w.add(box(20 + o.x0, 6, 0.3, (-20 + o.x0) / 2, 3, 0.15, GREY.set)); w.add(box(20 - o.x1, 6, 0.3, (20 + o.x1) / 2, 3, 0.15, GREY.set));
  w.add(box(o.x1 - o.x0, 6 - o.h, 0.3, 0, o.h + (6 - o.h) / 2, 0.15, GREY.set));
}

/** the part of the shop that stands in the world from the first frame: the lock plate (the plaza part must not build one). Everything else of the shop is the prop actor ROOM (see buildRoom). */
export function shopSet(w: W) {
  // the lock: a round plate set flat in the ground in front of the shutter, a slit across it (the slit runs along z, 0.04 m)
  w.add(cyl(0.075, 0.03, 0, 0.015, LOCK_Z, GREY.paper, 32));
  w.add(box(0.012, 0.006, 0.04, 0, 0.0325, LOCK_Z, GREY.ink));
}

/** the room (the opening's jambs and lintel, floor, walls, steps, table, chair, bulb, loose detail) as one object. It is the prop actor ROOM, buried until the aerial dive is over: the plaza part's camera starts behind the wall
 *  and looks down at the man across the place where this room is (plaza notes, section 4 point 3), so nothing of it may stand there before 4 s. It rises to its place behind the wall
 *  between 20 and 24.8 s, where the closed shutter and the wall hide it from the plaza camera. */
function buildRoom(w: { add: (o: THREE.Object3D) => void }) {
  const o = R.opening;
  // the trim of the opening: two jambs and a lintel behind the wall face (z 0.003 to 0.3). The lintel also hides the top of the lifted shutter.
  w.add(box(0.28, o.h, 0.297, o.x0 - 0.14, o.h / 2, 0.1515, GREY.mid)); w.add(box(0.28, o.h, 0.297, o.x1 + 0.14, o.h / 2, 0.1515, GREY.mid));
  w.add(box(o.x1 - o.x0 + 0.56, 3.3, 0.297, 0, o.h + 1.65, 0.1515, GREY.mid));
  // the dark brown door-jamb panel at the far jamb (seen edge-on in shots 4 and 6)
  w.add(box(0.05, 2.1, 0.26, o.x1 - 0.02, 1.05, 0.15, GREY.ink));
  // the floor, the three walls (the fourth is the shutter wall), no ceiling
  w.add(box(R.x1 - R.x0, 0.02, R.z1, 0, -0.005, R.z1 / 2, GREY.mid));
  w.add(box(0.1, R.wallH, R.z1, R.x1 + 0.05, R.wallH / 2, R.z1 / 2, GREY.light));            // the hooks wall
  w.add(box(0.1, R.wallH, R.z1, R.x0 - 0.05, R.wallH / 2, R.z1 / 2, GREY.light));
  w.add(box(R.x1 - R.x0 + 0.2, R.wallH, 0.1, 0, R.wallH / 2, R.z1 + 0.05, GREY.light));      // the plank wall with the conduit and the chair
  // two steps beside the far jamb, rising toward the wall: the mother stands on the top one at the end
  const s = R.steps;
  w.add(box(s.x1 - s.x0, s.stepB.top, s.stepB.z1 - s.stepB.z0, (s.x0 + s.x1) / 2, s.stepB.top / 2, (s.stepB.z0 + s.stepB.z1) / 2, GREY.set));
  w.add(box(s.x1 - s.x0, s.stepA.top, s.stepA.z1 - s.stepA.z0, (s.x0 + s.x1) / 2, s.stepA.top / 2, (s.stepA.z0 + s.stepA.z1) / 2, GREY.set));
  // the table (a heavy counter), its long axis along x
  const t = R.table;
  w.add(box(t.x1 - t.x0, t.h, t.z1 - t.z0, (t.x0 + t.x1) / 2, t.h / 2, (t.z0 + t.z1) / 2, GREY.dark));
  w.add(box(t.x1 - t.x0 + 0.04, 0.04, t.z1 - t.z0 + 0.04, (t.x0 + t.x1) / 2, t.h - 0.02, (t.z0 + t.z1) / 2, GREY.ink));
  // the chair: seat, four legs, a back toward the plank wall
  const cx = R.manSeat.x, cz = R.manSeat.z + 0.3;
  const chair = new THREE.Group();
  chair.add(box(0.42, 0.04, 0.42, cx, 0.45, cz, GREY.ink));
  for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) chair.add(box(0.035, 0.43, 0.035, cx + dx, 0.215, cz + dz, GREY.ink));
  chair.add(box(0.42, 0.45, 0.035, cx, 0.7, cz + 0.2, GREY.ink));
  w.add(chair);
  // the bulb: a plain white sphere on a cord (no light, no glow)
  const bm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.6 }));
  bm.position.set(R.bulb.x, R.bulb.y, R.bulb.z); w.add(bm);
  w.add(dress(cyl(0.004, R.wallH - R.bulb.y, R.bulb.x, R.bulb.y + (R.wallH - R.bulb.y) / 2 + 0.05, R.bulb.z, GREY.ink, 6)));
  // loose detail, static, tagged for --no-scenery: the till on its ledge, three tins, two hooks, the conduit and the switch box
  w.add(dress(box(0.6, 0.9, 0.5, 2.25, 0.45, 2.5, GREY.dark)));
  w.add(dress(box(0.45, 0.45, 0.5, 2.25, 1.125, 2.5, GREY.mid)));
  for (const [z, h, r] of [[1.7, 0.18, 0.075], [1.95, 0.18, 0.075], [2.2, 0.07, 0.085]] as [number, number, number][]) w.add(dress(cyl(r, h, 2.42, R.table.h + h / 2, z, GREY.paper)));
  for (const z of [0.85, 1.0]) w.add(dress(box(0.04, 0.03, 0.03, 2.57, 1.8, z, GREY.ink)));
  w.add(dress(cyl(0.025, 1.5, 2.1, 0.75 + 0.9, R.z1 - 0.02, GREY.dark, 8)));
  w.add(dress(box(0.1, 0.12, 0.06, 2.1, 1.6, R.z1 - 0.04, GREY.ink)));
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// props that act: registered in the kit's PROPS at load (plain shapes, origin at the middle unless said)
const P_ = PROPS as unknown as Record<string, () => THREE.Object3D>;
P_.amberRoom = () => { const g = new THREE.Group(); buildRoom(g); return g; };
P_.amberShutter = () => {
  const g = new THREE.Group();
  g.add(box(SHUTTER.w + 0.1, SHUTTER.h, 0.07, 0, SHUTTER.h / 2, 0.045, GREY.dark));            // the curtain, behind the wall face, z 0.01 to 0.08
  g.add(box(SHUTTER.w + 0.1, 0.2, 0.14, 0, 0.1, 0.06, GREY.set));                              // the bottom rail
  return shadeAll(g);
};
/** worn or carried things: the body is meant to be inside or against them, so the motion check leaves them out of its solids and floors (the flag the kit uses for the sky dome and the motes) */
const worn = <T extends THREE.Object3D>(o: T): T => { o.traverse((c) => { c.userData.noPathTrace = true; }); return o; };
P_.amberScarf = () => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.04, 10, 28), clay(GREY.paper, 0.9)); m.rotation.x = Math.PI / 2; m.castShadow = m.receiveShadow = true; return worn(new THREE.Group().add(m)); };
// the coat on him: an open cape (back and two sides, 0.95 m tall, origin at its middle, front +z open toward the camera) around the pin
P_.amberCoat = () => { const g = new THREE.Group(); g.add(box(0.6, 0.95, 0.04, 0, 0, -0.17, GREY.mid), box(0.04, 0.95, 0.34, -0.29, 0, -0.02, GREY.mid), box(0.04, 0.95, 0.34, 0.29, 0, -0.02, GREY.mid)); return worn(shadeAll(g)); };
P_.amberCoatHeap = () => worn(shadeAll(new THREE.Group().add(box(0.6, 0.18, 0.42, 0, 0, 0, GREY.mid))));
P_.amberCup = () => { const g = new THREE.Group(); g.add(cyl(0.04, 0.09, 0, 0, 0, GREY.paper), box(0.02, 0.05, 0.012, 0.052, 0, 0, GREY.paper)); return worn(shadeAll(g)); };

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// the man: path and acts
/** the plaza part's kneel act (a loop of Fixing_Kneeling that stands up every 5.2 s) must be gone by 25.84: the join gives it this t1. It is built with t0 24.2 and ease 0.8 (amber-plaza.ts), so it holds full weight to 25.04 and fades 25.04 to 25.84 while the crouch act below fades in over the same time. From 25.04 the
 *  shop part holds the pose itself with a crouch act (crossfaded in over the same 0.8 s), then lifts him to 1.3 m (a sit pose on his knees), then stands him up. NOTE for the join: the kneel act's `ease` must stay 0.8 s (t1 - ease = 25.04), or it leaves the plaza part early. */
export const MAN_KNEEL_T1 = 25.84;

/** a bump of an act: its weight peaks at wp (< 1) around tc and is gone about e seconds either side (two overlapping ramps of the engine's own act weight: up * (1 - down); the peak is inOut(0.5 + d / e)^2) */
function bumpAct(kind: Act["kind"], tc: number, wp: number, e: number): Act {
  const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  let lo = 0.5, hi = 1;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (inOut(m) ** 2 < wp) lo = m; else hi = m; }
  const d = (lo - 0.5) * e;
  return { kind, t0: tc - e / 2 - d, t1: tc + e / 2 + d, ease: e };
}

const SEAT = R.manSeat;
const SIT_Y = Math.PI;   // seated he faces -z (toward the plaza: the shop front)
export const SHOP_MAN_PATH: Key[] = [
  { t: 25.04, at: [KNEEL.x, KNEEL.z], yaw: 0 },
  { t: 25.84, at: [KNEEL.x, KNEEL.z + 0.2], yaw: 0 },                                // the crouch clip's head sits 0.2 m behind the kneel clip's: the root leans in to keep the head over the lock
  { t: 31.0, at: [KNEEL.x, KNEEL.z + 0.2], yaw: 0 }, { t: 31.9, at: [0.0, -0.6], yaw: 0 },                          // he rises to kneeling upright (31.0 to 31.9), a little nearer the wall
  { t: 34.4, at: [0.0, -0.6], yaw: 0 }, { t: 35.2, at: [-0.04, -0.62], yaw: 0 },                          // 34.4 to 35.2: the head dips and turns a little to the right
  { t: 36.4, at: [0.04, -0.62], yaw: 0 }, { t: 37.0, at: [0.12, -0.55], yaw: 0 }, { t: 37.75, at: [-0.03, -0.6], yaw: 0 }, { t: 38.5, at: [-0.12, -0.5] }, { t: 39.0, at: [-0.12, -0.3] },
  { t: 39.5, at: [-0.14, -0.08] }, { t: 40.0, at: [-0.17, 0.15] }, { t: 40.6, at: [-0.15, 0.45], yaw: -Math.PI / 2 }, { t: 41.21, at: [-0.15, 0.57], yaw: -Math.PI / 2 },
  { t: 44.3, at: [-0.15, 0.57], yaw: -Math.PI / 2 }, { t: 45.3, at: [-0.15, 0.6], yaw: -Math.PI / 2 }, { t: 47.0, at: [-0.15, 0.59], yaw: -Math.PI / 2 }, { t: 47.29, at: [-0.15, 0.59], yaw: -Math.PI / 2 },
  // the cut at 47.33: inside it a few seconds pass (about 6): the mother brings the tea and he sits at the table. The jump is made at 47.32 s: after the last blur sub-frame of frame 1135 (47.302) and before the first of frame 1136 (47.323), with the old pose held to 47.3199 and the new one from 47.32 (keys 0.1 ms apart, so the path's tangents leave no overshoot in a sampled frame), and after the 1/60 s tables of the actor's speed: the sample that sees the jump is 47.3167, which no frame reads.
  { t: 47.31, at: [-0.15, 0.59], yaw: -Math.PI / 2 }, { t: 47.3199, at: [-0.15, 0.59], yaw: -Math.PI / 2 }, { t: 47.32, at: [SEAT.x, SEAT.z], yaw: SIT_Y }, { t: 47.3201, at: [SEAT.x, SEAT.z], yaw: SIT_Y }, { t: 47.34, at: [SEAT.x, SEAT.z], yaw: SIT_Y },
  // seated: he sinks 0.26 m into the chair over the shot (a pin: the head comes down as he leans on his forearms) and leans 0.14 m toward the table
  { t: 47.9, at: [SEAT.x, 0, SEAT.z], yaw: SIT_Y }, { t: 48.4, at: [SEAT.x, -0.08, SEAT.z], yaw: SIT_Y }, { t: 49.5, at: [SEAT.x, -0.12, SEAT.z - 0.03], yaw: SIT_Y }, { t: 50.5, at: [SEAT.x, -0.14, SEAT.z - 0.06], yaw: SIT_Y },
  { t: 51.4, at: [SEAT.x, -0.18, SEAT.z - 0.1], yaw: SIT_Y }, { t: 52.5, at: [SEAT.x, -0.24, SEAT.z - 0.12], yaw: SIT_Y }, { t: 53.0, at: [SEAT.x, -0.26, SEAT.z - 0.14], yaw: SIT_Y },
  { t: 56.667, at: [SEAT.x, -0.26, SEAT.z - 0.14], yaw: SIT_Y },
];

export const SHOP_MAN_ACTS: Act[] = [
  { kind: "crouch", t0: 25.04, t1: 31.9, ease: 0.8 },                                   // the held kneel: the kneel clip loops and stands up every 5.2 s, so from 25.04 the crouch clip (steady, head 0.87 m, bent over the lock) takes over in the 0.5 s the plaza's kneel act fades
  { kind: "lookDown", t0: 25.04, t1: 31.6, ease: 0.4 },                           // eyes on the lock until he looks up at the shutter
  { kind: "sit", t0: 31.0, t1: 36.8, ease: 0.9 },                                    // 31.0 to 31.9: rises to kneeling upright (a sit pose gives the 1.3 m head); 35.6 to 36.8: stands
  { kind: "lookUp", t0: 31.6, t1: 36.4, ease: 0.7 },                                  // looks up at his mother
  { kind: "talk", t0: 35.1, t1: 35.92, ease: 0.15 },                                  // "There was a storm."
  bumpAct("crouch", 39.0, 0.25, 1.8),                                                  // the stoop under the bar: a bump of the crouch clip, weight 0.25 at 39.0 (the head drops from 1.62 to about 1.43 m and leans in)
  { kind: "lookDown", t0: 38.2, t1: 40.4, ease: 0.6 },
  { kind: "talk", t0: 42.18, t1: 42.9, ease: 0.12 },                                  // "I walked."
  { kind: "sit", t0: 47.312, ease: 0.008 },                                              // seated at the table (right after the cut)
  { kind: "lookDown", t0: 47.312, t1: 47.95, ease: 0.1 },                               // head bowed, hair and eyes above the frame
  { kind: "lookDown", t0: 49.0, ease: 0.5 },                                          // eyes on the cup to the end
  { kind: "talk", t0: 49.52, t1: 50.72, ease: 0.12 },                                 // "I'm not thirsty."
];

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// the mother: 1.6 m tall in the film. The kit's SCALE table has human 1 (1.78 m), child 0.62 and giant 1.75 and is not exported, so the kind "amberMother" is given the scale 0.9 through a hidden
// (non-enumerable) property on Object.prototype: `SCALE[kind] ?? 1` in kit/actors.ts then reads 0.9 for her and 1 for every other kind. An actor of the right size keeps her feet locked while she walks
// (a partial crouch blend made the feet slide). The one-line alternative for the join: add `amberMother: 0.9` (and use kind "amberMother") to SCALE in kit/actors.ts.
if (!("amberMother" in {})) Object.defineProperty(Object.prototype, "amberMother", { value: 0.9, enumerable: false, writable: true, configurable: true });
const MOTHER_KIND = "amberMother" as never;
const MOTHER_PATH: Key[] = [
  { t: 0, at: [0.9, 0, 0.82], yaw: Math.PI }, { t: 29.5, at: [0.9, 0, 0.82], yaw: Math.PI },
  { t: 30.4, at: [-0.1, 0, 0.45], yaw: Math.PI }, { t: 31.1, at: [-0.1, 0, 0.35], yaw: Math.PI },                                  // she walks to the shutter and takes the bar
  { t: 38.0, at: [-0.1, 0, 0.35], yaw: Math.PI }, { t: 38.9, at: [0.3, 0, 0.35], yaw: Math.PI }, { t: 40.0, at: [0.32, 0, 0.32], yaw: -1.9 }, { t: 41.21, at: [0.4, 0, 0.3], yaw: -1.9 },
  { t: 41.6, at: [0.4, 0, 0.3] }, { t: 42.3, at: [0.85, 0, 0.85], yaw: -1.9 }, { t: 44.0, at: [0.85, 0, 0.85], yaw: -1.9 }, { t: 44.4, at: [0.62, 0, 0.7], yaw: -Math.PI / 2 },
  { t: 45.3, at: [0.62, 0, 0.7], yaw: -Math.PI / 2 }, { t: 46.3, at: [0.52, 0, 0.88], yaw: 0 }, { t: 47.0, at: [0.42, 0, 0.9], yaw: 0 }, { t: 47.29, at: [0.42, 0, 0.9], yaw: 0 },
  { t: 47.31, at: [0.42, 0, 0.9], yaw: 0 }, { t: 47.3199, at: [0.42, 0, 0.9], yaw: 0 }, { t: 47.32, at: [1.45, 0, 0.86], yaw: 0 }, { t: 47.3201, at: [1.45, 0, 0.86], yaw: 0 }, { t: 47.34, at: [1.45, 0, 0.86], yaw: 0 },
  { t: 49.5, at: [1.45, 0, 0.86], yaw: 0 }, { t: 50.6, at: [1.42, 0, 0.86], yaw: Math.PI }, { t: 51.9, at: [1.38, 0, 0.74], yaw: Math.PI }, { t: 52.1, at: [1.36, 0.18, 0.62], yaw: Math.PI }, { t: 52.5, at: [1.35, 0.18, 0.52], yaw: Math.PI },
  { t: 52.7, at: [1.35, 0.36, 0.43], yaw: Math.PI }, { t: 52.9, at: [1.35, 0.36, 0.36], yaw: Math.PI }, { t: 56.667, at: [1.35, 0.36, 0.36], yaw: Math.PI },
];
const MOTHER_ACTS: Act[] = [
  { kind: "talk", t0: 33.55, t1: 34.14, ease: 0.1 }, { kind: "talk", t0: 36.1, t1: 39.34, ease: 0.15 },
  { kind: "talk", t0: 43.05, t1: 47.1, ease: 0.15 }, { kind: "talk", t0: 51.18, t1: 53.32, ease: 0.15 },
  { kind: "push", t0: 53.5, t1: 54.9, ease: 0.3 },
];

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// where the man is (for props that ride with him): the engine's own track over the same keys
const manTrack = track(SHOP_MAN_PATH.map((k) => ({ t: k.t, v: k.at.length === 2 ? [k.at[0], 0, k.at[1]] : [...k.at] })));
const manPos = (t: number) => v3(manTrack(t));
const yawKeys = SHOP_MAN_PATH.filter((k) => k.yaw !== undefined).map((k) => ({ t: k.t, v: [k.yaw as number] }));
const yawT = track(yawKeys);
const manYaw = (t: number) => yawT(t)[0];
/** a point in the man's own frame: right (his right hand side), up, forward */
const rel = (t: number, right: number, up: number, fwd: number): [number, number, number] => {
  const p = manPos(t), y = manYaw(t), f = [Math.sin(y), Math.cos(y)], r = [-Math.cos(y), Math.sin(y)];
  return [p.x + r[0] * right + f[0] * fwd, up, p.z + r[1] * right + f[1] * fwd];
};
type PK = { t: number; at: [number, number, number]; yaw?: number };
const HID = (x = 0, z = 0): [number, number, number] => [x, -5, z];


const PIN: [number, number, number, number, number, number][] = [   // [t, head x, head y, head z, body top y, yaw] of the man's pin, every 0.25 s from 25.0 to 41.0 (baked from the render: the pin sits over the middle of the body, not over the head)
  [25, 0.09, 0.82, -0.8, 0.78, 0],
  [25.25, 0.04, 0.82, -0.76, 0.78, 0],
  [25.5, 0.04, 0.91, -0.73, 0.87, 0],
  [25.75, 0.06, 0.82, -0.7, 0.78, 0],
  [26, 0.06, 0.82, -0.69, 0.77, 0],
  [26.25, 0.06, 0.82, -0.68, 0.77, 0],
  [26.5, 0.06, 0.82, -0.68, 0.77, 0],
  [26.75, 0.06, 0.82, -0.68, 0.77, 0],
  [27, 0.06, 0.82, -0.67, 0.77, 0],
  [27.25, 0.06, 0.82, -0.67, 0.77, 0],
  [27.5, 0.06, 0.82, -0.68, 0.77, 0],
  [27.75, 0.06, 0.82, -0.68, 0.77, 0],
  [28, 0.06, 0.82, -0.68, 0.77, 0],
  [28.25, 0.06, 0.82, -0.68, 0.77, 0],
  [28.5, 0.06, 0.82, -0.69, 0.77, 0],
  [28.75, 0.06, 0.82, -0.69, 0.77, 0],
  [29, 0.06, 0.82, -0.7, 0.77, 0],
  [29.25, 0.06, 0.82, -0.7, 0.77, 0],
  [29.5, 0.06, 0.82, -0.7, 0.77, 0],
  [29.75, 0.06, 0.82, -0.7, 0.77, 0],
  [30, 0.06, 0.82, -0.7, 0.77, 0],
  [30.25, 0.06, 0.82, -0.7, 0.77, 0],
  [30.5, 0.06, 0.82, -0.7, 0.77, 0],
  [30.75, 0.06, 0.82, -0.7, 0.77, 0],
  [31, 0.06, 0.82, -0.69, 0.77, 0],
  [31.25, 0.06, 0.88, -0.67, 0.84, 0],
  [31.5, 0.03, 1.24, -0.71, 1.2, 0],
  [31.75, -0.01, 1.3, -0.71, 1.26, 0],
  [32, -0.01, 1.33, -0.7, 1.28, 0],
  [32.25, -0.01, 1.34, -0.69, 1.29, 0],
  [32.5, -0.01, 1.34, -0.69, 1.29, 0],
  [32.75, -0.01, 1.34, -0.68, 1.29, 0],
  [33, 0, 1.34, -0.69, 1.29, 0],
  [33.25, 0, 1.34, -0.69, 1.29, 0],
  [33.5, 0, 1.34, -0.69, 1.29, 0],
  [33.75, 0, 1.34, -0.69, 1.29, 0],
  [34, 0, 1.34, -0.7, 1.29, 0],
  [34.25, -0.01, 1.34, -0.7, 1.29, 0],
  [34.5, -0.01, 1.34, -0.7, 1.29, 0],
  [34.75, -0.03, 1.34, -0.71, 1.29, 0],
  [35, -0.04, 1.34, -0.72, 1.29, 0],
  [35.25, -0.04, 1.34, -0.7, 1.3, 0],
  [35.5, -0.03, 1.33, -0.7, 1.28, 0],
  [35.75, -0.01, 1.33, -0.71, 1.28, 0],
  [36, 0, 1.33, -0.73, 1.29, 0],
  [36.25, 0.03, 1.44, -0.7, 1.4, 0],
  [36.5, 0.1, 1.66, -0.55, 1.62, 0.05],
  [36.75, 0.16, 1.66, -0.55, 1.61, 0.16],
  [37, 0.14, 1.64, -0.6, 1.6, 0.08],
  [37.25, 0.14, 1.65, -0.57, 1.6, -0.18],
  [37.5, 0.09, 1.63, -0.62, 1.59, -0.43],
  [37.75, 0.02, 1.64, -0.64, 1.6, -0.37],
  [38, -0.02, 1.64, -0.64, 1.6, -0.24],
  [38.25, -0.06, 1.64, -0.64, 1.6, -0.16],
  [38.5, -0.11, 1.62, -0.57, 1.57, -0.11],
  [38.75, -0.14, 1.53, -0.37, 1.48, -0.04],
  [39, -0.14, 1.5, -0.21, 1.45, -0.01],
  [39.25, -0.16, 1.55, -0.15, 1.5, -0.03],
  [39.5, -0.17, 1.57, -0.11, 1.52, -0.05],
  [39.75, -0.17, 1.57, -0.05, 1.52, -0.07],
  [40, -0.16, 1.58, 0.08, 1.54, -0.05],
  [40.25, -0.13, 1.65, 0.28, 1.61, 0],
  [40.5, -0.11, 1.66, 0.47, 1.62, -0.23],
  [40.75, -0.12, 1.65, 0.54, 1.61, -0.77],
  [41, -0.12, 1.66, 0.58, 1.62, -1.12],
];

// the shutter: the contract's shutterLift sampled every 0.05 s
const SHUTTER_PATH: PK[] = (() => {
  const k: PK[] = [{ t: 0, at: [0, 0, 0] }, { t: 29.9, at: [0, 0, 0] }];
  for (let t = 30.0; t <= 55.6; t += 0.05) k.push({ t: +t.toFixed(2), at: [0, shutterLift(t), 0] });
  k.push({ t: 56.667, at: [0, 0, 0] });
  return k;
})();

// the key: out of his pocket into the lock (27.4 to 28.4), a half turn (29.4 to 29.6), out of the lock when he rises (35.8 to 36.8), then in his right hand
const KEYPOS = (t: number): PK => ({ t, at: rel(t, 0.2, 0.84, 0.05), yaw: manYaw(t) + 0.3 });
const KEY_PATH: PK[] = [
  { t: 0, at: HID(0.1, LOCK_Z - 0.1), yaw: 0 }, { t: 27.3, at: HID(0.1, LOCK_Z - 0.1), yaw: 0 }, { t: 27.3499, at: HID(0.1, LOCK_Z - 0.1), yaw: 0 },
  { t: 27.35, at: [0.13, 0.17, LOCK_Z - 0.1], yaw: 0 }, { t: 27.3501, at: [0.13, 0.17, LOCK_Z - 0.1], yaw: 0 }, { t: 27.46, at: [0.1, 0.14, LOCK_Z - 0.08], yaw: 0 }, { t: 27.9, at: [0.0, 0.115, LOCK_Z], yaw: 0 },
  { t: 28.07, at: [0.0, 0.082, LOCK_Z], yaw: 0 }, { t: 28.4, at: [0.0, 0.052, LOCK_Z], yaw: 0 }, { t: 29.1, at: [0.0, 0.046, LOCK_Z], yaw: 0 },
  { t: 29.4, at: [0.0, 0.046, LOCK_Z], yaw: 0 }, { t: 29.6, at: [0.0, 0.046, LOCK_Z], yaw: Math.PI }, { t: 35.8, at: [0.0, 0.046, LOCK_Z], yaw: Math.PI },
  { t: 36.3, at: [0.02, 0.22, LOCK_Z - 0.1], yaw: Math.PI }, KEYPOS(37.0),
  ...Array.from({ length: 51 }, (_, i) => KEYPOS(37.2 + i * 0.2)),                                                               // 37.2 to 47.2 in his right hand
  KEYPOS(47.29), KEYPOS(47.31), KEYPOS(47.3199), { t: 47.32, at: HID(0.1, 0.6) }, { t: 47.3201, at: HID(0.1, 0.6) }, { t: 56.667, at: HID(0.1, 0.6) },
];
// the scarf (a ring): round his neck, over his head (41.5 to 41.9), in his hands, to the mother (42.5 to 43.0), thrown on the table (44.0 to 44.25), under the coat (47.0 to 47.25)
/** the scarf rides on him until 41.0 at the neck of the pin (over his nose and mouth for the first 0.3 s of shot 1, pulled down by 25.9), then by his own frame */
const SCARF_ON: PK[] = PIN.filter((r) => r[0] >= 25.04).map(([t, x, y, z]) => ({ t, at: [x, y - (t < 25.3 ? 0.02 : t < 25.9 ? 0.02 + (0.12 * (t - 25.3)) / 0.6 : 0.14), z] as [number, number, number] }));
const SCARF_PATH: PK[] = [
  { t: 0, at: HID(0, 0) }, { t: 24.99, at: HID(0, 0) }, { t: 24.9999, at: HID(0, 0) }, { t: 25.0, at: SCARF_ON[0].at }, { t: 25.0001, at: SCARF_ON[0].at }, ...SCARF_ON.slice(1),
  { t: 41.21, at: rel(41.21, 0, 1.5, 0.0) }, { t: 41.5, at: rel(41.5, 0, 1.5, 0.0) },
  { t: 41.75, at: rel(41.75, 0, 1.9, 0.06) }, { t: 41.95, at: rel(41.95, 0, 1.45, 0.2) }, { t: 42.25, at: rel(42.25, 0, 1.0, 0.3) },
  { t: 42.5, at: rel(42.5, 0, 0.98, 0.28) }, { t: 42.75, at: [0.45, 0.96, 0.78] }, { t: 43.05, at: [0.65, 1.0, 0.8] }, { t: 43.75, at: [0.78, 1.38, 0.86] },
  { t: 44.05, at: [0.7, 1.3, 1.1] }, { t: 44.25, at: [0.72, 0.965, 1.4] }, { t: 47.29, at: [0.72, 0.965, 1.4] },
  { t: 47.31, at: [0.72, 0.965, 1.4] }, { t: 47.3199, at: [0.72, 0.965, 1.4] }, { t: 47.32, at: [1.85, 0.965, 1.45] }, { t: 47.3201, at: [1.85, 0.965, 1.45] }, { t: 47.34, at: [1.85, 0.965, 1.45] }, { t: 56.667, at: [1.85, 0.965, 1.45] },
];
// the man's coat: worn (a cape round the pin) until 44.5, pulled off from behind (44.5 to 45.5), carried by the mother, sunk into the table (46.9 to 47.25) as the heap rises out of it
const COATPOS = (t: number, up: number, back: number): PK => ({ t, at: rel(t, 0, up, -back), yaw: manYaw(t) });
const COAT_ON: PK[] = PIN.filter((r) => r[0] >= 25.04).map(([t, x, , z, top, yaw]) => ({ t, at: [x, top - 0.68, z] as [number, number, number], yaw }));
const COAT_PATH: PK[] = [
  { t: 0, at: HID(0, 0) }, { t: 24.99, at: HID(0, 0) }, { t: 24.9999, at: HID(0, 0) }, { t: 25.0, at: COAT_ON[0].at, yaw: COAT_ON[0].yaw }, { t: 25.0001, at: COAT_ON[0].at, yaw: COAT_ON[0].yaw }, ...COAT_ON.slice(1),
  COATPOS(41.21, 0.92, 0.0), COATPOS(44.3, 0.92, 0.0), COATPOS(44.75, 0.95, 0.15), COATPOS(45.25, 0.85, 0.3), COATPOS(45.5, 0.8, 0.45),
  { t: 45.85, at: [0.45, 0.82, 0.8] as [number, number, number], yaw: -Math.PI / 2 }, { t: 46.3, at: [0.45, 0.75, 1.0], yaw: -Math.PI / 2 }, { t: 46.75, at: [0.45, 1.0, 1.05], yaw: -Math.PI / 2 },
  { t: 47.0, at: [0.62, 0.95, 1.3], yaw: -Math.PI / 2 }, { t: 47.25, at: [0.7, 0.5, 1.4], yaw: -Math.PI / 2 }, { t: 47.29, at: [0.7, 0.4, 1.4], yaw: -Math.PI / 2 },
  { t: 47.31, at: [0.7, 0.4, 1.4], yaw: -Math.PI / 2 }, { t: 47.3199, at: [0.7, 0.4, 1.4], yaw: -Math.PI / 2 }, { t: 47.32, at: HID(1.0, 1.0) }, { t: 47.3201, at: HID(1.0, 1.0) }, { t: 56.667, at: HID(1.0, 1.0) },
];
const HEAP_PATH: PK[] = [
  { t: 0, at: HID(0.7, 1.4) }, { t: 46.8, at: HID(0.7, 1.4) }, { t: 46.85, at: [0.7, 0.6, 1.4], yaw: 0.3 }, { t: 47.0, at: [0.7, 0.65, 1.4], yaw: 0.3 }, { t: 47.25, at: [0.7, 1.012, 1.4], yaw: 0.3 }, { t: 47.29, at: [0.7, 1.012, 1.4], yaw: 0.3 },
  { t: 47.31, at: [0.7, 1.012, 1.4], yaw: 0.3 }, { t: 47.3199, at: [0.7, 1.012, 1.4], yaw: 0.3 }, { t: 47.32, at: [1.85, 1.012, 1.45], yaw: 0.1 }, { t: 47.3201, at: [1.85, 1.012, 1.45], yaw: 0.1 }, { t: 47.34, at: [1.85, 1.012, 1.45], yaw: 0.1 }, { t: 56.667, at: [1.85, 1.012, 1.45], yaw: 0.1 },
];
// the cup: not there before the cut; on the table in front of him after it; in both hands (49.5 to 50.4), lifted to his lip (50.4 to 50.8), a sip (to 51.5), held under his chin (51.7 to 52.4), set down (52.4 to 52.9)
const CUP_Y = R.table.h + 0.045;
const CUP_PATH: PK[] = [
  { t: 0, at: HID(0.65, 1.9) }, { t: 47.31, at: HID(0.65, 1.9) }, { t: 47.3199, at: HID(0.65, 1.9) }, { t: 47.32, at: [0.65, CUP_Y, 1.9] }, { t: 47.3201, at: [0.65, CUP_Y, 1.9] }, { t: 47.34, at: [0.65, CUP_Y, 1.9] }, { t: 49.4, at: [0.65, CUP_Y, 1.9] }, { t: 49.9, at: [0.55, CUP_Y + 0.005, 1.97] },
  { t: 50.4, at: [0.55, CUP_Y + 0.03, 2.0] }, { t: 50.8, at: [0.55, 1.0, 2.0] }, { t: 51.1, at: [0.55, 0.99, 2.0] }, { t: 51.5, at: [0.55, 0.97, 2.0] }, { t: 51.7, at: [0.55, 0.96, 2.0] }, { t: 52.4, at: [0.55, 0.96, 2.0] },
  { t: 52.9, at: [0.55, CUP_Y, 1.98] }, { t: 56.667, at: [0.55, CUP_Y, 1.98] },
];

const ROOM_PATH: PK[] = [
  { t: 0, at: [0, -40, 0] }, { t: 4.0, at: [0, -40, 0] }, { t: 8.0, at: [0, -30, 0] }, { t: 20.0, at: [0, -3, 0] }, { t: 24.0, at: [0, -3, 0] }, { t: 24.6, at: [0, -0.5, 0] }, { t: 24.8, at: [0, 0, 0] }, { t: 25.0, at: [0, 0, 0] }, { t: 25.4, at: [0, 0, 0] }, { t: 56.667, at: [0, 0, 0] },
];
export const shopActors: unknown[] = [
  { id: "ROOM", name: "Shop interior", kind: "prop", model: "amberRoom", tint: "stone", path: ROOM_PATH } as never,
  { id: MOTHER.id, name: MOTHER.name, kind: MOTHER_KIND, tint: MOTHER.tint, path: MOTHER_PATH, acts: MOTHER_ACTS } as ActorSpec,
  { id: "SHUTTER", name: "Shutter", kind: "prop", model: "amberShutter", tint: "stone", label: "#8d8d88", path: SHUTTER_PATH } as never,
  { id: "KEY", name: "Key", kind: "prop", model: "key", tint: "sand", label: "#ff7a00", path: KEY_PATH } as never,
  { id: "SCARF", name: "Scarf", kind: "prop", model: "amberScarf", tint: "sand", label: "#ffd400", path: SCARF_PATH } as never,
  { id: "COAT", name: "Coat", kind: "prop", model: "amberCoat", tint: "sand", label: "#1f5fe3", path: COAT_PATH } as never,
  { id: "COATHEAP", name: "Coat on the table", kind: "prop", model: "amberCoatHeap", tint: "sand", label: "#1f5fe3", path: HEAP_PATH } as never,
  { id: "CUP", name: "Cup", kind: "prop", model: "amberCup", tint: "sand", label: "#d81fb5", path: CUP_PATH } as never,
];
void ramp;

/** the edit fade of the last frames, as an exposure multiplier (the original's bulb brightness 244, 220, 192, 162, 126, 86, 39, 17 at 55.0 to 56.62 s, black at 56.667): the join multiplies its look.exposure by this */
export const shopExposure = (t: number): number => {
  const k: [number, number][] = [[55.0, 1], [55.25, 0.9], [55.5, 0.79], [55.75, 0.66], [56.0, 0.52], [56.25, 0.35], [56.5, 0.16], [56.62, 0.07], [56.667, 0]];
  if (t <= k[0][0]) return 1;
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [a, ya] = k[i - 1], [b, yb] = k[i]; return ya + (yb - ya) * ((t - a) / (b - a)); }
  return 0;
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// the cuts on the 24 fps frame grid (the contract's CUT is rounded to 0.01 s: a frame at 659/24 = 27.4583 s would still be shot 1 if the shot ended at 27.46)
const F = (n: number) => n / 24;
const C = { c1: CUT.c1, c2: F(659), c3: F(772), c4: F(989), c5: F(1136), c6: F(1277) };
// the camera: keyframes on position, aim and lens, smooth (cubic Hermite with Catmull-Rom tangents, still at both ends)
type CK = { t: number; p: [number, number, number]; a: [number, number, number]; mm: number };
const camPath = (keys: CK[]) => {
  const tp = track(keys.map((k) => ({ t: k.t, v: k.p }))), ta = track(keys.map((k) => ({ t: k.t, v: k.a }))), tm = track(keys.map((k) => ({ t: k.t, v: [k.mm] })));
  return (t: number): Cam => ({ pos: v3(tp(t)), target: v3(ta(t)), mm: tm(t)[0] });
};

export const CAMS = {
  // 1: extreme close-up of his face from his right (-x), 105 mm from 1.52 m (the original is about 85 mm at 0.7 to 1.0 m: the same frame, a longer lens so that the face is not shot closer than 1.5 m), a drift of 1.5 cm
  s1: camPath([{ t: C.c1, p: [-1.46, 0.92, -0.16], a: [0.06, 0.8, -0.62], mm: 105 }, { t: C.c2, p: [-1.46, 0.925, -0.15], a: [0.06, 0.8, -0.62], mm: 105 }]),
  // 2: low macro on the lock, from -x, along the shutter, 26 mm; creeps 1 cm
  s2: camPath([{ t: C.c2, p: [-0.5, 0.075, -0.33], a: [0.0, 0.045, -0.355], mm: 26 }, { t: C.c3, p: [-0.49, 0.075, -0.33], a: [0.0, 0.045, -0.355], mm: 26 }]),
  // 3: behind the man's head looking through the opening at the mother, 59 mm; a drift of 1.5 cm until 40.1, then a tilt up of about 7 degrees with a push of 0.2 m under the bar
  s3: camPath([
    { t: C.c3, p: [-0.25, 1.25, -1.8], a: [-0.15, 1.6, 0.3], mm: 59 }, { t: 40.0, p: [-0.25, 1.25, -1.79], a: [-0.15, 1.62, 0.3], mm: 59 },
    { t: 40.1, p: [-0.25, 1.25, -1.785], a: [-0.15, 1.62, 0.3], mm: 59 }, { t: C.c4, p: [-0.25, 1.25, -1.6], a: [-0.15, 1.83, 0.3], mm: 59 }]),
  // 4: inside the shop, looking along +x (the shutter wall on the left), 31 mm; drifts 1 cm
  s4: camPath([{ t: C.c4, p: [-1.9, 1.4, 0.75], a: [1.0, 1.34, 0.75], mm: 31 }, { t: C.c5, p: [-1.89, 1.4, 0.75], a: [1.0, 1.34, 0.75], mm: 31 }]),
  // 5: across the table at his chest and face, looking +z, 67 mm; drifts 2 cm
  s5: camPath([{ t: C.c5, p: [0.55, 1.15, 0.95], a: [0.55, 1.05, 2.3], mm: 67 }, { t: C.c6, p: [0.55, 1.15, 0.97], a: [0.55, 1.05, 2.3], mm: 67 }]),
  // 6: wide from the near end of the table, looking +x, 25 mm; drifts 4 cm
  s6: camPath([{ t: C.c6, p: [-1.85, 1.2, 1.5], a: [1.5, 1.0, 1.5], mm: 25 }, { t: 56.667, p: [-1.85, 1.2, 1.54], a: [1.5, 1.0, 1.5], mm: 25 }]),
};

/** the shots (start 25.04, end 56.667). P is the planner of the scene (unused: every camera is placed in world coordinates) */
export function shopShots(_P: unknown): unknown[] {
  return [
    { start: C.c1, end: C.c2, label: "105mm  EXTREME CLOSE-UP · HIS FACE AT THE LOCK", rig: "TRIPOD · DRIFT", subject: "MAN", size: "MCU", stop: 2.0, cam: CAMS.s1, cut: "CUT from the wide: he is kneeling at the lock, scarf over his nose" },
    { start: C.c2, end: C.c3, label: "26mm  LOW MACRO · THE KEY IN THE LOCK", rig: "TRIPOD · LOW · DRIFT", subject: "KEY", stop: 2.0, cam: CAMS.s2, cut: "CUT to the key, the fist coming down from his face" },
    { start: C.c3, end: C.c4, label: "59mm  BEHIND HIS HEAD · THE MOTHER IN THE OPENING", rig: "TRIPOD · DRIFT", subject: "MOTHER", size: "MCU", stop: 2.0, cam: CAMS.s3, focus: () => "MOTHER", cut: "CUT: round to behind him, the shutter is up and she holds it" },
    { start: C.c4, end: C.c5, label: "31mm  INSIDE THE SHOP · SCARF AND COAT", rig: "TRIPOD · DRIFT", subject: "MAN", size: "MS", stop: 2.8, cam: CAMS.s4, cut: "CUT inside: he is in, the shutter held up behind him" },
    { start: C.c5, end: C.c6, label: "67mm  CLOSE-UP ACROSS THE TABLE · HE DRINKS", rig: "TRIPOD · DRIFT", subject: "MAN", size: "CU", stop: 2.0, cam: CAMS.s5, cut: "CUT across a time jump: he sits, the cup is there" },
    { start: C.c6, end: 56.667, label: "25mm  WIDE FROM THE SIDE · THE SHUTTER CLOSES", rig: "TRIPOD · DRIFT", subject: "MAN", size: "MS", stop: 4.0, cam: CAMS.s6, flags: ["centre"], cut: "CUT wide: she closes the shutter, the light goes out" },
  ];
}
