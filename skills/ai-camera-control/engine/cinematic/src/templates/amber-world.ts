// AMBER: the shared world of the 56.67 s recreation of "1107-Amber-Cinema-Gamma24-4K.mp4".
// Two files build on this one and must not edit it: amber-plaza.ts (0 to 25.04 s, the plaza take) and amber-shop.ts (25.04 to 56.67 s,
// the lock, the shutter, the shop). amber.ts joins them. Everything is in metres, 24 fps, 2.39:1, one continuous clock.
//
// World frame (right-handed, y up): x across (+x to the east, the man's left when he faces the wall), z toward the wall.
//   - The plaza is z < 0 and stretches away to -z (the drone comes from far -z and high up).
//   - The brick wall face is the plane z = 0, running x -20 to +20, 6 m high.
//   - The roll-down SHUTTER is in that plane, centred on x = 0, 3.4 m wide, 2.6 m high when shut (bottom edge y = 0, half buried in sand).
//   - The floor LOCK plate is a round brass plate, 0.15 m across, set flat in the ground at (0, 0, LOCK_Z) in front of the shutter.
//   - The SHOP is behind the wall: z from 0 to 5.5, x -2.6 to +2.6, floor y = 0, back wall at z = 5.5. The shutter opening leads into it.
//   - The man walks +z, kneels at the lock facing +z, goes into the shop through the opening.
import * as THREE from "three";

export const FPS = 24;
export const DURATION = 56.667;
/** the six hard cuts of the original, in seconds on the shared clock */
export const CUT = { c1: 25.04, c2: 27.46, c3: 32.17, c4: 41.21, c5: 47.33, c6: 53.21 } as const;
/** spoken words of the original (word start, end), from the audio: what each person does with their mouth and body must line up */
export const WORDS: { who: "MAN" | "MOTHER"; text: string; t0: number; t1: number }[] = [
  { who: "MAN", text: "Oh", t0: 9.84, t1: 11.24 }, { who: "MAN", text: "Oh", t0: 11.24, t1: 11.66 },
  { who: "MAN", text: "Come on", t0: 28.2, t1: 29.72 },
  { who: "MOTHER", text: "You're late.", t0: 33.6, t1: 34.14 },
  { who: "MAN", text: "There was a storm.", t0: 35.1, t1: 35.92 },
  { who: "MOTHER", text: "There's always a storm. Look at the state of you. Come in.", t0: 36.1, t1: 39.34 },
  { who: "MAN", text: "I walked.", t0: 42.2, t1: 42.9 },
  { who: "MOTHER", text: "Of course you walked. You never could wait for anything.", t0: 43.0, t1: 47.1 },
  { who: "MAN", text: "I'm not thirsty.", t0: 49.5, t1: 50.72 },
  { who: "MOTHER", text: "No. You never are.", t0: 51.18, t1: 53.32 },
];

export const WALL_H = 6, WALL_X = 20;
export const SHUTTER = { x: 0, w: 3.4, h: 2.6 };
export const LOCK_Z = -0.35;                    // the lock plate sits 0.35 m in front of the shutter
export const KNEEL = { x: 0.0, z: -0.95 };      // where he kneels at the lock, facing +z
export const SHOP = { z0: 0, z1: 5.5, x0: -2.6, x1: 2.6 };

/** actor ids and tints: one colour per person, the same in every shot */
export const MAN = { id: "MAN", name: "Man", tint: "ochre" as const };      // red-and-black pin
export const MOTHER = { id: "MOTHER", name: "Mother", tint: "rose" as const }; // green-and-black pin

/** the shutter's bottom edge height on the shared clock. closed until 30.1, then it lifts (0.04 at 30.5, 0.17 at 31.0, about 1.6 at 32.17,
 *  about 1.75 from 32.6, held to 53.5), then the mother pushes it down (shut at about 55.4). amber-shop.ts owns the shutter object and
 *  this function; amber-plaza.ts only sees it closed. */
export const shutterLift = (t: number): number => {
  const k: [number, number][] = [[0, 0], [30.1, 0], [30.5, 0.04], [30.75, 0.08], [31.0, 0.17], [31.25, 0.4], [32.17, 1.6], [32.6, 1.75], [53.5, 1.75], [54.0, 1.2], [54.75, 0.35], [55.4, 0]];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [a, ya] = k[i - 1], [b, yb] = k[i]; const u = (t - a) / (b - a); return ya + (yb - ya) * u * u * (3 - 2 * u); }
  return 0;
};

/** what amber-plaza.ts must export (the plaza take, times in the shared clock, all before 25.04 s) */
export type PlazaExports = {
  plazaSet: (w: { add: (o: THREE.Object3D) => void }) => void;                         // ground, tower, far buildings, the wall face with its brick spacing, sand drifts; NOT the shutter, NOT the lock
  PLAZA_MAN_PATH: { t: number; at: [number, number] | [number, number, number]; yaw?: number }[];  // the man from 0 to 25.04, ending kneeling at KNEEL
  PLAZA_MAN_ACTS: { kind: string; t0: number; t1?: number; ease?: number; clip?: string; from?: number }[];
  plazaShots: (P: unknown) => unknown[];                                                // ShotDef[], start 0, end 25.04, one continuous camera path
};
/** the plaza ends with the man kneeling: PLAZA_MAN_ACTS holds a `kneel` act from its t0 with NO t1 (so it lasts to the end of the plaza part).
 *  amber-shop.ts exports MAN_KNEEL_T1: the time he gets up again (the join sets that act's t1 to it). */
/** what amber-shop.ts must export (everything from 25.04 s) */
export type ShopExports = {
  shopSet: (w: { add: (o: THREE.Object3D) => void }) => void;                           // wall opening trim, the shop interior, table, bulb, till, tins, steps, chair
  shopActors: unknown[];                                                                // MOTHER, SHUTTER (a prop actor animated by shutterLift, present from 0), KEY, SCARF, COAT, CUP ... with paths on the shared clock
  SHOP_MAN_PATH: { t: number; at: [number, number] | [number, number, number]; yaw?: number }[];   // the man from 25.04 (kneeling at KNEEL) to the end
  SHOP_MAN_ACTS: { kind: string; t0: number; t1?: number; ease?: number; clip?: string; from?: number }[];
  shopShots: (P: unknown) => unknown[];                                                 // ShotDef[], start 25.04, end 56.667
  MAN_KNEEL_T1: number;                                                                 // when the kneel act that the plaza part starts ends
};
