// The physics each template bakes (tools/bake.sh writes src/kit/bakes.json from these). A template places the same spec
// with `new BakedSet(spec)` and poses it every frame from the table.
import type { Driver, PhysBody, PhysSpec } from "../kit/physics";
import type { PathKey } from "../kit/actors";
import { track } from "../util";

// ---------------- shared paths: an actor and the driver that pushes debris must move on the same function ----------------

/** keys every dt seconds from an analytic path (x, z) or (x, y, z): dense keys make the actor's Catmull-Rom follow it exactly */
export function densePath(f: (t: number) => [number, number] | [number, number, number], t0: number, t1: number, dt = 0.1): PathKey[] {
  const keys: PathKey[] = [];
  const n = Math.max(1, Math.round((t1 - t0) / dt));
  for (let i = 0; i <= n; i++) { const t = t0 + ((t1 - t0) * i) / n; keys.push({ t: +t.toFixed(4), at: f(t) }); }
  return keys;
}
/** the same interpolation the actor uses for its path (src/kit/actors.ts), as [x, y, z] */
const follow = (keys: PathKey[]) => track(keys.map((k) => ({ t: k.t, v: k.at.length === 2 ? [k.at[0], 0, k.at[1]] : [...k.at] })));

// ---- SC07: the alley fight. Brick stands at BRICK_AT facing +z; Vic's cross lands at KNOCK and throws him back ----
export const BRICK_AT: [number, number] = [0.3, 0];
export const KNOCK = 8.3;
/** SC09 enters the knockback clip 0.08 s in (its first frames fold the body forward, right for Vic's body blow in SC07,
 *  wrong for a blast from behind): the act starts KB_IN early and switches on at the blast (see scenes2 `clipFrom`) */
export const KB_IN = 0.08;
/** Hit_Knockback measured on the rig (tools: clip probe), relative to the feet, facing +z:
 *  [clip time, spine_03 y, z, head y, z, pelvis y, z] */
const KB: number[][] = [[0, 0.862, 0.098, 0.785, 0.336, 0.611, -0.184], [0.042, 1.073, 0.024, 1.091, 0.278, 0.741, -0.174], [0.083, 1.211, -0.172, 1.359, 0.024, 0.822, -0.138], [0.125, 1.151, -0.352, 1.37, -0.247, 0.85, -0.107], [0.167, 0.969, -0.428, 1.211, -0.398, 0.732, -0.117], [0.208, 0.592, -0.504, 0.823, -0.596, 0.436, -0.139], [0.25, 0.219, -0.545, 0.348, -0.764, 0.232, -0.146], [0.292, 0.081, -0.586, 0.17, -0.826, 0.103, -0.186], [0.333, 0.116, -0.641, 0.243, -0.861, 0.042, -0.246], [0.375, 0.149, -0.637, 0.332, -0.809, 0.041, -0.252], [0.417, 0.183, -0.631, 0.385, -0.776, 0.061, -0.25], [0.458, 0.225, -0.622, 0.413, -0.789, 0.098, -0.241], [0.5, 0.242, -0.618, 0.394, -0.82, 0.12, -0.234], [0.542, 0.196, -0.623, 0.296, -0.856, 0.094, -0.234], [0.583, 0.143, -0.627, 0.198, -0.875, 0.063, -0.233], [0.625, 0.123, -0.629, 0.159, -0.88, 0.058, -0.232], [0.833, 0.135, -0.629, 0.167, -0.882, 0.077, -0.232]];
const kb = (t: number, col: number) => {
  const x = t - KNOCK;
  if (x <= 0) return KB[0][col];
  for (let i = 1; i < KB.length; i++) if (x < KB[i][0]) { const a = KB[i - 1], b = KB[i], k = (x - a[0]) / (b[0] - a[0]); return a[col] + (b[col] - a[col]) * k; }
  return KB[KB.length - 1][col];
};
/** how far the knockback clip's skin dips under the feet's floor (measured at 120 Hz: [clip time, depth]) */
const KB_LOW: [number, number][] = [[0.3, 0.065], [0.35, 0.03], [0.4, 0.108], [0.42, 0.1], [0.6, 0.023], [0.65, 0.024], [0.75, 0.018], [0.8, 0.041], [0.833, 0.045]];
/** the lift that keeps the falling body on the floor: never less than the clip's dip, and never rising or settling
 *  faster than 0.25 m/s, so the root does not bob (the dip is a squash on landing, not a fall through) */
export const kbLift = (t: number, t0: number) => {
  const x = t - t0;
  let L = x >= 0.833 ? 0.045 : 0;
  for (const [xi, d] of KB_LOW) L = Math.max(L, d - 0.25 * Math.abs(x - xi));
  return L;
};
/** Brick's back, head and hips as balls that follow the clip: the body is what knocks the stack over */
const brickBody = (id: string, r: number, cy: number, cz: number, back: number): Driver => ({
  id, shape: { kind: "ball", r },
  path: (t) => ({ pos: [BRICK_AT[0], Math.max(r, kb(t, cy) + kbLift(t, KNOCK)), BRICK_AT[1] + kb(t, cz) - back], yaw: 0 }),
});

// ---- SC10: the car through the barrier. Impact at CRASH, 16 m/s, braking to a stop 22 m on ----
export const CRASH = 9.0;
const carZ = (t: number) => { const x = t - CRASH; if (x <= 0) return -2.6 + 16 * x; const s = Math.min(x, 16 / 5.8); return -2.6 + 16 * s - 2.9 * s * s; };
export const CAR_KEYS: PathKey[] = densePath((t) => [0.9, carZ(t)], -4, 14, 0.1);
const carPath = follow(CAR_KEYS);

// ---- SC09: the stand-off. Cole's shot hits the powder kegs beside Reyes at BLAST ----
export const BLAST = 13.98;
export const KEGS: [number, number] = [3.6, -2.6];

const crate = (id: string, at: [number, number, number], s = 0.8, extra: Partial<PhysBody> = {}): PhysBody => ({ id, shape: { kind: "box", size: [s, s, s] }, at, density: 70, friction: 0.6, bounce: 0.12, ...extra });
const barrel = (id: string, at: [number, number, number], extra: Partial<PhysBody> = {}): PhysBody => ({ id, shape: { kind: "cyl", r: 0.32, h: 1 }, at, density: 160, friction: 0.55, bounce: 0.18, tint: "dark", ...extra });
const wall = (id: string, pos: [number, number, number], size: [number, number, number]): Driver => ({ id, shape: { kind: "box", size }, path: () => ({ pos, yaw: 0 }) });

export const PHYS_SPECS: PhysSpec[] = [
  // the crate stack behind Brick: two front crates, one on top, a small one on that, two behind, a barrel at the side
  {
    id: "SC07-crates", dur: 16,
    bodies: [
      // a column straight behind him (his back meets the middle crate), a shorter one beside it, one behind
      crate("c1", [0.3, 0.4, -1.02], 0.8, { release: KNOCK - 0.05, density: 45, friction: 0.45 }), crate("c3", [0.32, 1.2, -1.04], 0.8, { release: KNOCK - 0.05, yaw: -0.06, density: 45, friction: 0.45 }),
      crate("c4", [-0.5, 1.875, -1.2], 0.55, { release: KNOCK - 0.05, yaw: 0.25, density: 45 }),
      crate("c2", [-0.55, 0.4, -1.1], 0.8, { release: KNOCK - 0.05, yaw: 0.05, density: 45 }), crate("c7", [-0.55, 1.2, -1.12], 0.8, { release: KNOCK - 0.05, yaw: 0.1, density: 45 }),
      crate("c6", [-0.5, 0.4, -2.05], 0.8, { release: KNOCK - 0.05, yaw: -0.04, density: 45 }),
      barrel("b1", [1.75, 0.5, -1.35], { release: KNOCK - 0.05 }),
    ],
    drivers: [brickBody("back", 0.2, 1, 2, 0.06), brickBody("head", 0.13, 3, 4, 0.02), brickBody("hips", 0.17, 5, 6, 0.02), wall("wallW", [-3.2, 3, 0], [0.4, 6, 40]), wall("wallE", [3.2, 3, 0], [0.4, 6, 40])],
  },
  // the powder kegs: five barrels and three crates, thrown outward and up from the blast, away from Reyes and the camera
  {
    id: "SC09-kegs", dur: 22,
    bodies: (() => {
      const [kx, kz] = KEGS, R = BLAST;
      // [dx, dz] offset in the pile, launch direction (x, z), speed, up, spin
      const rows: [string, "b" | "c", number, number, number, number, number, number][] = [
        ["k1", "b", 0, 0, 0.1, -1, 7.5, 6.5], ["k2", "b", 0.7, 0.1, 0.8, -0.7, 8, 5.5], ["k3", "b", -0.68, 0.05, -0.75, -0.75, 7, 6],
        ["k4", "b", 0.3, -0.65, 0.35, -1, 6, 8], ["k5", "b", -0.35, -0.7, -0.5, -1, 6.5, 7.5],
        ["k6", "c", 1.3, -0.4, 1, -0.45, 6.5, 4.5], ["k7", "c", -1.35, -0.3, -1, -0.35, 3.5, 4], ["k8", "c", 0.1, -1.4, 0.1, -1, 5, 9],
      ];
      return rows.map(([id, k, dx, dz, vx, vz, sp, up], i) => {
        const n = Math.hypot(vx, vz), vel: [number, number, number] = [(vx / n) * sp, up, (vz / n) * sp];
        const spin: [number, number, number] = [((i * 37) % 9) - 4, ((i * 53) % 7) - 3, ((i * 29) % 11) - 5];
        return k === "b" ? barrel(id, [kx + dx, 0.5, kz + dz], { release: R, vel, spin, density: 120 }) : crate(id, [kx + dx, 0.35, kz + dz], 0.7, { release: R, vel, spin, density: 60 });
      });
    })(),
    // the boardwalk and the shop fronts across the street stop what reaches them
    drivers: [wall("walkN", [0, 0.15, -11.5], [80, 0.3, 3]), wall("frontN", [0, 4, -13.2], [80, 8, 0.4])],
  },
  // the roadblock: a front row of crates, a second tier, barrels at the ends, a plank on two trestles; the car drives it
  {
    id: "SC10-barrier", dur: 16,
    bodies: (() => {
      const R = CRASH - 0.1, out: PhysBody[] = [];
      for (let i = 0; i < 8; i++) out.push(crate("f" + i, [-3.15 + i * 0.9, 0.4, 0], 0.8, { release: R, yaw: ((i * 7) % 5 - 2) * 0.03 }));
      for (let i = 0; i < 6; i++) out.push(crate("u" + i, [-2.25 + i * 0.9, 1.2, 0.02], 0.8, { release: R, yaw: ((i * 3) % 5 - 2) * 0.04 }));
      for (let i = 0; i < 4; i++) out.push(crate("r" + i, [-1.35 + i * 0.9 + 0.45, 0.4, 0.9], 0.8, { release: R }));
      out.push(barrel("e1", [-3.95, 0.5, 0.05], { release: R }), barrel("e2", [3.95, 0.5, 0.05], { release: R }), barrel("e3", [-0.45, 2.1, 0.05], { release: R }), barrel("e4", [1.35, 2.1, 0], { release: R }));
      out.push({ id: "t1", shape: { kind: "box", size: [0.12, 1.0, 0.6] }, at: [-2.6, 0.5, -0.9], density: 300, release: R, tint: "dark" });
      out.push({ id: "t2", shape: { kind: "box", size: [0.12, 1.0, 0.6] }, at: [3.4, 0.5, -0.9], density: 300, release: R, tint: "dark" });
      out.push({ id: "pl", shape: { kind: "box", size: [6.6, 0.2, 0.05] }, at: [0.4, 1.1, -0.9], density: 500, release: R, tint: "set" });
      return out;
    })(),
    drivers: [wall("frontW", [-9.5, 4, 0], [0.4, 8, 400]), wall("frontE", [9.5, 4, 0], [0.4, 8, 400]), { id: "car", shape: { kind: "box", size: [1.8, 1.3, 4.4] }, path: (t) => { const p = carPath(t); return { pos: [p[0], 0.75, p[2]], yaw: 0 }; } }],
  },
];
export const phys = (id: string) => { const s = PHYS_SPECS.find((x) => x.id === id); if (!s) throw new Error("no physics spec " + id); return s; };
