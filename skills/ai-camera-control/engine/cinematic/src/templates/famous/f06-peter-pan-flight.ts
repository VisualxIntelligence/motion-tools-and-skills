// FAM06-PeterPanFlight: flying like Peter Pan over a city, measured from reference clips of the 2003 film's flight.
// One take, real speed. A person flies over the rooftops: a climb out, a weave between two towers, a banked turn
// round a clock tower by the river, a dip to the roofs and a rise. The camera never stops travelling with them and
// never stops going round them: a chase from behind, out to the side, round to the front, up over the top, down the
// other side to a wide chase through the bank, then round once more to end close on the face as they climb.
import * as THREE from "three";
import { getInputProps } from "remotion";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { aimFor } from "../../framer";
import { GREY, clay } from "../../kit/clay";
import { building, ground } from "../../kit/props";
import type { Piece } from "../../piece";
import type { Cam } from "../../shots";
import { CAPSULE, stripes } from "../../standins";
import { rng } from "../../util";
import { V, makeProduct, type ActorSpec, type KitWorld, type PathKey } from "../products/shared";

const rad = THREE.MathUtils.degToRad;
const G = 9.81, MM = 24, T_END = 16;

// ---------------- curves: keys joined by straight lines, then smoothed, so nothing ever changes rate suddenly ----------------
const DT = 1 / 240, T0 = -3, T1 = T_END + 3, N = Math.round((T1 - T0) / DT) + 1;
/** a running mean over `w` seconds (the ends hold their value) */
function mean(a: Float64Array, w: number) {
  const k = Math.max(1, Math.round(w / DT / 2)), sum = new Float64Array(N + 1), out = new Float64Array(N);
  for (let i = 0; i < N; i++) sum[i + 1] = sum[i] + a[i];
  const S = (i: number) => (i <= 0 ? i * a[0] : i >= N ? sum[N] + (i - N) * a[N - 1] : sum[i]);
  for (let i = 0; i < N; i++) out[i] = (S(i + k + 1) - S(i - k)) / (2 * k + 1);
  return out;
}
const smoothed = (a: Float64Array, w: number) => mean(mean(mean(a, w / 3), w / 3), w / 3);
/** [time, value] keys as a table: straight lines between keys, smoothed over `w` seconds */
function soft(keys: [number, number][], w: number, scale = 1) {
  const a = new Float64Array(N);
  for (let i = 0, j = 0; i < N; i++) {
    const t = T0 + i * DT;
    while (j < keys.length - 2 && t > keys[j + 1][0]) j++;
    const [ta, va] = keys[j], [tb, vb] = keys[j + 1];
    a[i] = (va + (vb - va) * Math.min(1, Math.max(0, (t - ta) / (tb - ta)))) * scale;
  }
  return smoothed(a, w);
}
/** read a table at any time (a cubic through the four nearest samples) */
function at(a: Float64Array, t: number) {
  const u = Math.min(N - 2.001, Math.max(1, (t - T0) / DT)), i = Math.floor(u), f = u - i, p0 = a[i - 1], p1 = a[i], p2 = a[i + 1], p3 = a[i + 2];
  return 0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f);
}
type V3T = [Float64Array, Float64Array, Float64Array];
const at3 = (a: V3T, t: number) => V(at(a[0], t), at(a[1], t), at(a[2], t));

// ---------------- the flyer (seconds; a left turn is a rising heading) ----------------
// Heading: straight out, a weave right then left between the towers, then 156 degrees to the right round the clock tower.
const PSI = soft([[-3, 0], [1.2, 0], [2.0, -14], [2.5, -14], [3.4, 14], [4.8, 14], [6.2, 2], [10.5, -156], [19, -158]], 1.2, Math.PI / 180);
// Climb angle: up and out, level, a dip to the roofs, a rise.
const GAM = soft([[-3, 5], [0, 7], [0.8, 18], [2.2, 18], [3.4, 2], [5, 0], [7, 3], [9.5, -2], [10.8, -4], [11.4, -20], [12.6, -20], [13.5, 5], [14.3, 16], [19, 16]], 1.0, Math.PI / 180);
// Speed: a little slower climbing, a little faster in the dip.
const SPD = soft([[-3, 14.5], [0.5, 14.5], [2, 13.6], [4, 15], [10.5, 15.4], [12.6, 17.4], [14.5, 15], [19, 14.4]], 1.2);
const AOA = rad(7);                        // the body rides a little head-up of its path
const START = V(0, 26.5, 0);
/** the flyer's body centre, integrated from heading, climb and speed */
const POS: V3T = (() => {
  const x = new Float64Array(N), y = new Float64Array(N), z = new Float64Array(N), i0 = Math.round(-T0 / DT);
  const vel = (i: number) => [SPD[i] * Math.sin(PSI[i]) * Math.cos(GAM[i]), SPD[i] * Math.sin(GAM[i]), SPD[i] * Math.cos(PSI[i]) * Math.cos(GAM[i])];
  x[i0] = START.x; y[i0] = START.y; z[i0] = START.z;
  for (let i = i0; i < N - 1; i++) { const a = vel(i), b = vel(i + 1); x[i + 1] = x[i] + (a[0] + b[0]) * DT / 2; y[i + 1] = y[i] + (a[1] + b[1]) * DT / 2; z[i + 1] = z[i] + (a[2] + b[2]) * DT / 2; }
  for (let i = i0; i > 0; i--) { const a = vel(i), b = vel(i - 1); x[i - 1] = x[i] - (a[0] + b[0]) * DT / 2; y[i - 1] = y[i] - (a[1] + b[1]) * DT / 2; z[i - 1] = z[i] - (a[2] + b[2]) * DT / 2; }
  return [x, y, z];
})();
/** the bank: what a turn at this speed and rate needs (right wing down is positive), rolled in and out a little softly */
const BANK = (() => { const a = new Float64Array(N); for (let i = 1; i < N - 1; i++) a[i] = Math.atan((SPD[i] * -(PSI[i + 1] - PSI[i - 1])) / (2 * DT) / G); a[0] = a[1]; a[N - 1] = a[N - 2]; return smoothed(a, 0.6); })();
const centre = (t: number) => at3(POS, t);
const X_AXIS = V(1, 0, 0), Y_AXIS = V(0, 1, 0), Z_AXIS = V(0, 0, 1);
/** the body's turn: nose along the heading, pitched with the climb, rolled into the turn */
function attitude(t: number) {
  return new THREE.Quaternion().setFromAxisAngle(Y_AXIS, at(PSI, t))
    .multiply(new THREE.Quaternion().setFromAxisAngle(X_AXIS, -(at(GAM, t) + AOA)))
    .multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, at(BANK, t)));
}

// ---------------- the camera (film seconds = world seconds: no slow motion) ----------------
// It rides a point that follows the flyer and goes round it: an angle round the body (0 behind, 90 on its right,
// 180 ahead of it, 270 on its left), a height angle and a distance, each one smooth curve.
const ROUND = soft([[0, 10], [1.3, 10], [3.1, 90], [4.7, 172], [5.6, 188], [7.3, 262], [8.2, 284], [10.0, 308], [14.9, 536], [16, 542], [19, 542]], 1.5, Math.PI / 180);
const ELEV = soft([[0, 7], [1.3, 7], [3.1, 3], [4.7, 5], [5.6, 8], [7.0, 68], [7.5, 68], [9.0, 14], [10.2, 10], [11.2, 8], [12.4, 5], [13.3, 3], [14.9, -7], [19, -7]], 1.5, Math.PI / 180);
const DIST = soft([[0, 4.3], [1.3, 4.3], [3.1, 4.4], [4.7, 3.2], [5.6, 3.2], [7.3, 6.5], [8.6, 8.2], [10.0, 9], [11.2, 7.5], [13.0, 5.2], [14.9, 3.5], [19, 3.5]], 1.5);
// where the flyer sits in frame, up or down and left or right of the middle (-1..1); in the bank they sit left, the clock tower right
const OFFY = soft([[0, -0.25], [1.3, -0.25], [3.1, 0], [4.7, 0.1], [5.6, 0.1], [7.3, 0], [10.5, -0.1], [13, 0], [14.9, 0.25], [19, 0.25]], 1.5);
const OFFX = soft([[0, 0], [7.6, 0], [8.6, -0.3], [10.0, -0.3], [11.0, 0], [19, 0]], 1.5);
// ahead of the flyer the lens aims at the head, not the middle of the body (metres up the body)
const NOSE = soft([[0, 0], [3.5, 0], [4.7, 0.45], [5.6, 0.45], [6.6, 0], [13.4, 0], [14.9, 0.5], [19, 0.5]], 1.5);
const LEAD = 0.22;                         // side-on, the flyer sits this far back from the middle: room ahead of them
const TILT = 0.38;                         // how much of the flyer's bank the horizon takes
const FOLLOW: V3T = [smoothed(POS[0], 0.6), smoothed(POS[1], 0.6), smoothed(POS[2], 0.6)];   // the rig's own, softer path
const AIM: V3T = [smoothed(POS[0], 0.24), smoothed(POS[1], 0.24), smoothed(POS[2], 0.24)];
const PSI_CAM = smoothed(PSI, 2.0);        // the rig turns with the flyer's course, not with every weave
const BANK_CAM = smoothed(BANK, 0.6);
function camAt(t: number): Cam {
  const b = at(ROUND, t), el = at(ELEV, t), a = at(PSI_CAM, t) + b;
  const pos = at3(FOLLOW, t).add(V(-Math.sin(a) * Math.cos(el), Math.sin(el), -Math.cos(a) * Math.cos(el)).multiplyScalar(at(DIST, t)));
  const k = Math.cos(el);
  const aim = at3(AIM, t).add(Z_AXIS.clone().applyQuaternion(attitude(t)).multiplyScalar(at(NOSE, t)));
  return { pos, target: aimFor(pos, aim, MM, [-LEAD * Math.sin(b) * k + at(OFFX, t), at(OFFY, t)]), mm: MM, roll: -TILT * at(BANK_CAM, t) * Math.cos(b) * k };
}

// ---------------- the city ----------------
// Blocks of terraced houses 40 x 54 m on 12 m streets, one 22 m avenue, a river across the north with a bridge.
// The flight runs up the middle of a block column beside the avenue. Whatever lies under the flyer or the camera is
// cut down to stay clear of them, so the roofs pass a few metres below.
const BW = 40, BL = 54, ST = 12, AVE = 22, ROW = 13, CLEAR = 4.0, ROW0 = 62;
const RIVER = { z0: ROW0 + BL + 10, z1: ROW0 + BL + 74 };
const rowZ0 = (j: number) => (j <= 0 ? ROW0 + j * (BL + ST) : RIVER.z1 + 10 + (j - 1) * (BL + ST));
const colX0 = (k: number) => (k <= 0 ? -BW / 2 + k * (BW + ST) : BW / 2 + AVE + (k - 1) * (BW + ST));
/** where the flyer and the lens are, every 1/20 s: the set is fitted round these */
const SAMPLES = (() => { const o: THREE.Vector3[] = []; for (let t = 0; t <= T_END + 1e-6; t += 0.05) o.push(centre(t), camAt(t).pos); return o; })();
const TRACK = SAMPLES.filter((_, i) => i % 2 === 0);
/** the clock tower stands at the centre of the big turn */
const T_TURN = 8.4;
const CLOCK = (() => { const p = centre(T_TURN), psi = at(PSI, T_TURN), w = -(at(PSI, T_TURN + 0.05) - at(PSI, T_TURN - 0.05)) / 0.1, R = at(SPD, T_TURN) / w; return { x: p.x - Math.cos(psi) * R, z: p.z + Math.sin(psi) * R, R, half: 5.2, top: 68 }; })();
/** the two towers the flyer weaves between: one passes on their left, the next on their right */
const TOWERS = [{ x: 8, z: 35, size: 9, h: 50, seed: 11, face: -1 as 1 | -1 }, { x: -9.8, z: 69, size: 9, h: 44, seed: 23, face: 1 as 1 | -1 }];
type Lot = { x0: number; x1: number; z0: number; z1: number; h: number; rise: number; kind: "row" | "flat" | "infill" | "tower"; face: 1 | -1; seed: number; lod: 0 | 1 | 2; end: [boolean, boolean] };
const lotTop = (L: Lot) => L.h + 0.5 + (L.kind === "row" ? L.rise + 1.9 : L.kind === "tower" ? L.rise + 4 : L.kind === "flat" ? 3 : 0.3);
const LOTS: Lot[] = (() => {
  const out: Lot[] = [];
  const gap = (p: THREE.Vector3, L: { x0: number; x1: number; z0: number; z1: number }) => Math.hypot(Math.max(L.x0 - p.x, 0, p.x - L.x1), Math.max(L.z0 - p.z, 0, p.z - L.z1));
  const keepOut = [...TOWERS.map((T) => ({ x0: T.x - T.size / 2 - 1.5, x1: T.x + T.size / 2 + 1.5, z0: T.z - T.size / 2 - 1.5, z1: T.z + T.size / 2 + 1.5 })),
    { x0: CLOCK.x - CLOCK.half - 7, x1: CLOCK.x + CLOCK.half + 7, z0: CLOCK.z - CLOCK.half - 7, z1: CLOCK.z + CLOCK.half + 7 }];
  const mid = V(CLOCK.x, 0, CLOCK.z - 40);
  for (let k = -14; k <= 14; k++) for (let j = -11; j <= 9; j++) {
    const bx = colX0(k), bz = rowZ0(j);
    if (Math.hypot(bx + BW / 2 - mid.x, bz + BL / 2 - mid.z) > 650) continue;
    const r = rng(7001 + k * 131 + j * 977);
    const lots: Lot[] = [];
    // three rows of houses back to back, six to a row
    for (const [x0, side] of [[bx, -1], [bx + ROW + 0.5, k % 2 ? 1 : -1], [bx + BW - ROW, 1]] as [number, 1 | -1][]) {
      const cuts = [0, 1, 2, 3, 4, 5, 6].map((i) => (i % 6 ? (BL * (i + 0.5 * (r() - 0.5))) / 6 : (BL * i) / 6));
      for (let i = 0; i < 6; i++) {
        const flat = r() < 0.1, tall = r() < 0.035;
        lots.push({ x0, x1: x0 + ROW, z0: bz + cuts[i], z1: bz + cuts[i + 1], h: flat ? 17 + 5 * r() : 12.5 + 6 * r(), rise: 3 + 1.5 * r(),
          kind: tall ? "tower" : flat ? "flat" : "row", face: side, seed: 3 + Math.floor(r() * 900), lod: 2, end: [i === 0, i === 5] });
      }
    }
    for (const L of lots) {
      if (keepOut.some((K) => L.x0 < K.x1 && L.x1 > K.x0 && L.z0 < K.z1 && L.z1 > K.z0)) continue;
      const c = V((L.x0 + L.x1) / 2, 0, (L.z0 + L.z1) / 2), near = Math.min(...TRACK.map((p) => Math.hypot(p.x - c.x, p.z - c.z)));
      L.lod = near < 105 ? 0 : near < 300 ? 1 : 2;
      if (L.kind === "tower") { if (near < 125) L.kind = "row"; else { L.h = 28 + 24 * r(); L.rise = 6 + 4 * r(); } }
      // under the flight or the lens: cut down to pass CLEAR below them
      let ceil = Infinity;
      for (const p of SAMPLES) if (gap(p, L) < 7) ceil = Math.min(ceil, p.y - CLEAR);
      if (lotTop(L) > ceil) {
        if (L.kind !== "infill" && ceil - L.rise - 2.4 >= 9) { L.kind = "row"; L.h = ceil - L.rise - 2.4; }
        else if (ceil - 0.8 >= 4) { L.kind = "infill"; L.h = Math.min(L.h, ceil - 0.8); }
        else continue;
      }
      out.push(L);
    }
  }
  return out;
})();
/** every solid as [x0, x1, y0, y1, z0, z1], for the clearance probe (roofs and spires as their bounding boxes) */
const SOLIDS: number[][] = [
  ...LOTS.map((L) => [L.x0 - 0.4, L.x1 + 0.4, 0, lotTop(L), L.z0 - 0.2, L.z1 + 0.2]),
  ...TOWERS.map((T) => [T.x - T.size / 2 - 0.2, T.x + T.size / 2 + 0.2, 0, T.h + 12, T.z - T.size / 2 - 0.2, T.z + T.size / 2 + 0.2]),
  [CLOCK.x - CLOCK.half - 0.4, CLOCK.x + CLOCK.half + 0.4, 0, CLOCK.top, CLOCK.z - CLOCK.half - 0.4, CLOCK.z + CLOCK.half + 0.4],
];

const gable = (w: number, len: number, rise: number) => new THREE.CylinderGeometry(1, 1, 1, 3).rotateX(-Math.PI / 2).translate(0, 0.5, 0).scale(w / Math.sqrt(3), rise / 1.5, len);
const pyramid = (w: number, h: number) => new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0).scale(w, h, w);

function build(w: KitWorld) {
  if (!("light" in w)) return;                                           // the planner's throwaway build: nothing to read from this set
  if (w.scene.fog) (w.scene.fog as THREE.FogExp2).density = 0.0026;       // haze: roofs 400 m off are most of the way gone
  w.add(ground(2800, 0, 2800, GREY.mid));
  // everything static is merged into one mesh per material (the kit's buildings are one box per window)
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const put = (g: THREE.BufferGeometry, color: string, rough?: number) => { const m = clay(color, rough); if (!buckets.has(m)) buckets.set(m, []); buckets.get(m)!.push(g); };
  const slab = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, rough?: number) => put(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), color, rough);
  const kit = (b: THREE.Object3D, x: number, z: number, ry: number) => {
    b.position.set(x, 0, z); b.rotation.y = ry; b.updateMatrixWorld(true);
    b.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { if (!buckets.has(m.material as THREE.Material)) buckets.set(m.material as THREE.Material, []); buckets.get(m.material as THREE.Material)!.push(m.geometry.clone().applyMatrix4(m.matrixWorld)); } });
  };
  const WALLS = [GREY.light, GREY.paper, GREY.set], ROOFS = [GREY.mid, GREY.mid, "#7f7e79", GREY.set];
  // the blocks' pavements
  for (let k = -14; k <= 14; k++) for (let j = -11; j <= 9; j++) {
    const bx = colX0(k), bz = rowZ0(j);
    if (Math.hypot(bx + BW / 2 - CLOCK.x, bz + BL / 2 - CLOCK.z + 40) < 650) slab(bx - 2.5, bx + BW + 2.5, 0, 0.18, bz - 2.5, bz + BL + 2.5, GREY.light);
  }
  for (const L of LOTS) {
    const cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2, wx = L.x1 - L.x0, len = L.z1 - L.z0, r = rng(L.seed * 17 + 3);
    const wall = WALLS[L.seed % 3], top = L.h + 0.5;
    if (L.kind === "infill") { slab(L.x0, L.x1, 0, L.h, L.z0, L.z1, WALLS[(L.seed + 1) % 3]); slab(L.x0 - 0.15, L.x1 + 0.15, L.h, L.h + 0.3, L.z0 - 0.15, L.z1 + 0.15, GREY.set); continue; }
    if (L.lod === 0) kit(building(len, wx, L.h, L.seed, wall), cx, cz, (L.face * Math.PI) / 2);
    else {
      slab(L.x0, L.x1, 0, L.h, L.z0, L.z1, wall); slab(L.x0 - 0.2, L.x1 + 0.2, L.h, top, L.z0 - 0.2, L.z1 + 0.2, GREY.set);
      if (L.lod === 1) for (let y = 2.2; y < L.h - 1; y += 3.4) slab(L.x0 - 0.04, L.x1 + 0.04, y - 0.7, y + 0.7, L.z0 + 0.6, L.z1 - 0.6, GREY.dark, 0.6);   // a band of windows per floor
    }
    if (L.kind === "row") {
      // a pitched roof, its ridge along the row, a chimney stack on each party wall
      put(gable(wx + 0.7, len + 0.1, L.rise).translate(cx, top, cz), ROOFS[L.seed % 4]);
      if (L.lod < 2) for (const [z, on] of [[L.z0 + 0.75, true], [L.z1 - 0.75, L.end[1]]] as [number, boolean][]) {
        if (!on) continue;
        slab(cx - 1.2, cx + 1.2, top + L.rise * 0.4, top + L.rise + 1.3, z - 0.45, z + 0.45, GREY.light);
        if (L.lod === 0) for (const dx of [-0.7, 0, 0.7]) put(new THREE.CylinderGeometry(0.15, 0.19, 0.55, 10).translate(cx + dx, top + L.rise + 1.57, z), GREY.set);
      }
      // dormers on the street side
      if (L.lod === 0) for (let i = 0, n = Math.max(1, Math.floor(len / 6)); i < n; i++) {
        const z = L.z0 + ((i + 0.5) * len) / n, x = cx + L.face * wx * 0.27;
        slab(x - 0.85, x + 0.85, top + L.rise * 0.2, top + L.rise * 0.46 + 1.25, z - 0.8, z + 0.8, wall);
        slab(x + L.face * 0.8, x + L.face * 0.9, top + L.rise * 0.46 + 0.1, top + L.rise * 0.46 + 1.05, z - 0.5, z + 0.5, GREY.dark, 0.6);
      }
    } else if (L.kind === "flat") {
      const hx = cx + (r() - 0.5) * (wx - 7), hz = cz + (r() - 0.5) * (len - 7);
      slab(hx - 2.4, hx + 2.4, top, top + 2.5, hz - 1.9, hz + 1.9, GREY.set);
      if (L.lod < 2) put(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 16).translate(cx - (hx - cx) * 0.8, top + 1.1, cz - (hz - cz) * 0.8), GREY.light);
    } else {
      // a far tower: a narrower top storey and a pointed roof
      slab(L.x0 + 1.5, L.x1 - 1.5, top, top + 4, L.z0 + 1.5, L.z1 - 1.5, wall);
      put(pyramid(Math.min(wx, len) - 2, L.rise).translate(cx, top + 4, cz), ROOFS[L.seed % 4]);
    }
  }
  // the two towers of the weave
  for (const T of TOWERS) {
    const s = T.size, top = T.h + 0.5;
    kit(building(s, s, T.h, T.seed, T.seed % 2 ? GREY.paper : GREY.light), T.x, T.z, (T.face * Math.PI) / 2);
    for (let y = 2.2; y < T.h - 1; y += 3.4) slab(T.x - T.face * (s / 2 + 0.03), T.x - T.face * (s / 2 - 0.1), y - 0.85, y + 0.85, T.z - s / 2 + 0.9, T.z + s / 2 - 0.9, GREY.dark, 0.6);   // windows on the kit's blank back
    slab(T.x - s / 2 + 1, T.x + s / 2 - 1, top, top + 4.5, T.z - s / 2 + 1, T.z + s / 2 - 1, GREY.set);
    put(pyramid(s - 1.4, 7).translate(T.x, top + 4.5, T.z), GREY.mid);
    slab(T.x - s / 2 - 3, T.x + s / 2 + 3, 0, 0.18, T.z - s / 2 - 3, T.z + s / 2 + 3, GREY.light);
  }
  clockTower(put, slab);
  // the river, its walls and the avenue's bridge
  slab(-1400, 1400, 0, 0.1, RIVER.z0, RIVER.z1, GREY.dark, 0.45);
  for (const z of [RIVER.z0, RIVER.z1]) slab(-1400, 1400, 0, 2.1, z - 0.8, z + 0.8, GREY.light);
  for (const bx of [BW / 2 + AVE / 2, colX0(-4) - ST / 2, colX0(6) - ST / 2]) {
    slab(bx - 8, bx + 8, 2.6, 3.5, RIVER.z0 - 1, RIVER.z1 + 1, GREY.light);
    for (const sx of [-1, 1]) slab(bx + sx * 7.6, bx + sx * 8.2, 3.5, 4.6, RIVER.z0 - 1, RIVER.z1 + 1, GREY.paper);
    for (let i = 1; i < 5; i++) { const z = RIVER.z0 + (i * (RIVER.z1 - RIVER.z0)) / 5; slab(bx - 9, bx + 9, 0, 2.6, z - 1.6, z + 1.6, GREY.set); }
    for (const [z, s] of [[RIVER.z0 - 1, -1], [RIVER.z1 + 1, 1]]) put(new THREE.BoxGeometry(16, 0.9, 13.6).rotateX(s * Math.atan2(3.4, 13)).translate(bx, 1.28, z + s * 6.5), GREY.light);
  }
  for (const [m, gs] of buckets) { const mesh = new THREE.Mesh(mergeGeometries(gs), m); mesh.castShadow = mesh.receiveShadow = true; mesh.name = "city"; w.add(mesh); }
  // clouds: soft near-white lumps far out and high up, clear of the haze so they read as sky
  const lumps: THREE.BufferGeometry[] = [], r = rng(99);
  for (let i = 0; i < 30; i++) {
    const a = r() * Math.PI * 2, d = 280 + 640 * r(), c = V(CLOCK.x + Math.sin(a) * d, 90 + 60 * r() + d * 0.06, CLOCK.z - 40 + Math.cos(a) * d), yaw = r() * Math.PI, len = 26 + 30 * r();
    for (let k = 0, n = 7 + Math.floor(5 * r()); k < n; k++) {
      const u = (r() - 0.5) * len, v = (r() - 0.5) * 14, s = (8 + 7 * r()) * (1 - 0.5 * Math.abs(u) / len);
      lumps.push(new THREE.IcosahedronGeometry(1, 3).scale(s * 1.25, s * 0.72, s).translate(c.x + Math.cos(yaw) * u - Math.sin(yaw) * v, c.y + (r() - 0.35) * 5, c.z + Math.sin(yaw) * u + Math.cos(yaw) * v));
    }
  }
  const sky = new THREE.Mesh(mergeGeometries(lumps), new THREE.MeshStandardMaterial({ color: "#e6e4df", roughness: 1, fog: false, emissive: "#ffffff", emissiveIntensity: 0.42 })); sky.name = "clouds"; w.add(sky);
  pillStandIn(w);
}

/** the landmark: a square clock tower 68 m tall, a clock face on each side at the height the flyer passes */
function clockTower(put: (g: THREE.BufferGeometry, color: string, rough?: number) => void, slab: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, rough?: number) => void) {
  const { x, z } = CLOCK, box = (half: number, y0: number, y1: number, color: string) => slab(x - half, x + half, y0, y1, z - half, z + half, color);
  slab(x - 14, x + 14, 0, 0.3, z - 14, z + 14, GREY.light);               // its square
  box(5.6, 0.3, 3, GREY.set); box(4.6, 3, 31.5, GREY.paper);
  for (const s of [-1, 1]) for (const u of [-2.3, 0, 2.3]) {              // tall recessed panels up the shaft
    slab(x + u - 0.75, x + u + 0.75, 5, 29.5, z + s * 4.6 - 0.06, z + s * 4.6 + 0.06, GREY.set); slab(x + s * 4.6 - 0.06, x + s * 4.6 + 0.06, 5, 29.5, z + u - 0.75, z + u + 0.75, GREY.set);
  }
  box(5.5, 31.5, 32.6, GREY.set); box(5.2, 32.6, 44.6, GREY.light); box(5.7, 44.6, 45.7, GREY.set);
  const Y = 38.6, R = 4.1;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const turn = (g: THREE.BufferGeometry, out: number) => (dz ? g.rotateX(Math.PI / 2) : g.rotateZ(Math.PI / 2)).translate(x + dx * (5.2 + out), Y, z + dz * (5.2 + out));
    put(turn(new THREE.CylinderGeometry(R + 0.45, R + 0.45, 0.3, 48), 0.1), GREY.dark);
    put(turn(new THREE.CylinderGeometry(R, R, 0.3, 48), 0.25), "#e9e7e1");
    // twelve marks and two hands (ten past ten), flat on the face
    const flat = (len: number, wid: number, ang: number, mid: number) => {
      const g = new THREE.BoxGeometry(wid, len, 0.12).translate(0, mid, 0).rotateZ(ang);
      if (dx) g.rotateY((dx * Math.PI) / 2); else if (dz < 0) g.rotateY(Math.PI);
      return g.translate(x + dx * 5.66, Y, z + dz * 5.66);
    };
    for (let i = 0; i < 12; i++) put(flat(0.7, i % 3 ? 0.16 : 0.3, (i * Math.PI) / 6, R - 0.6), GREY.ink);
    put(flat(2.3, 0.34, rad(55), 1.0), GREY.ink); put(flat(3.3, 0.24, rad(-60), 1.5), GREY.ink);
  }
  box(4.3, 45.7, 51.5, GREY.paper);
  for (const s of [-1, 1]) for (const u of [-2.1, 0, 2.1]) {              // the belfry's openings
    slab(x + u - 0.7, x + u + 0.7, 46.6, 50.4, z + s * 4.3 - 0.08, z + s * 4.3 + 0.08, GREY.dark, 0.6); slab(x + s * 4.3 - 0.08, x + s * 4.3 + 0.08, 46.6, 50.4, z + u - 0.7, z + u + 0.7, GREY.dark, 0.6);
  }
  box(4.8, 51.5, 52.4, GREY.set);
  put(pyramid(9, CLOCK.top - 52.4).translate(x, 52.4, z), GREY.mid);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(pyramid(1.5, 4.5).translate(x + sx * 4.6, 45.7, z + sz * 4.6), GREY.set);
}

// ---------------- the flyer's body ----------------
// The mannequin holds the glide of a swimming stroke (flat out, legs together, head up), its arms swept out like wings.
const GLIDE = "Swim_Fwd_Loop", GLIDE_T = 0.55, WINGS = rad(58);
const BODY_C = V(0, 0.21, -0.17);          // the body's middle in the mannequin's own frame (nose along +z, back along +y)
function tick(w: KitWorld, t: number) {
  const hero = w.actors.get("HERO");
  if (!hero?.rig) return;
  const q = attitude(t), rig = hero.rig;
  hero.root.quaternion.copy(q); hero.root.position.copy(centre(t)).sub(BODY_C.clone().applyQuaternion(q));
  rig.pose({ [GLIDE]: 1 }, {}, GLIDE_T, { [GLIDE]: 0 });
  hero.root.updateMatrixWorld(true);
  // the arms open with the bank (the low wing reaches further out), turned about the body's own up axis
  const up = Y_AXIS.clone().applyQuaternion(q), bank = at(BANK, t);
  for (const [name, s] of [["upperarm_l", 1], ["upperarm_r", -1]] as const) {
    const bone = rig.bone[name], turn = new THREE.Quaternion().setFromAxisAngle(up, s * (WINGS - s * 0.18 * bank));
    const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(turn), parent = bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert();
    bone.quaternion.copy(parent.multiply(world)); bone.updateMatrixWorld(true);
  }
  if (flyPill) { hero.root.visible = false; flyPill.quaternion.copy(q).multiply(NOSE_UP); flyPill.position.copy(centre(t)); }
}

// Workaround for shared code: src/standins.ts fits a person's capsule in a frame that only turns with their yaw (a
// body lying flat in the air becomes a wide slab), and the stand-in pass shows that capsule in the last render of a
// frame only, so sub-frame motion blur mixes the clay body into it. So in a stand-in render this template flies its
// own pill: the same striped capsule, round-ended and as long as the body, along the body's own axis, with the white
// dot on the nose where the face is, looking where the face looks. The mannequin stays hidden and the shared
// capsule is emptied when it arrives.
const PILL_L = 1.86, PILL_R = 0.26, FACE = rad(30);
const NOSE_UP = new THREE.Quaternion().setFromAxisAngle(X_AXIS, Math.PI / 2);   // the capsule's long axis onto the body's
let flyPill: THREE.Group | null = null;
function makePill() {
  const g = new THREE.Group(); g.name = "flyer pill";
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(PILL_R, PILL_L - 2 * PILL_R, 12, 36), new THREE.MeshStandardMaterial({ map: stripes(CAPSULE.ochre.hex), roughness: 0.75 }));
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32), new THREE.MeshStandardMaterial({ color: "#f4f4f2", roughness: 0.6 }));
  const n = V(0, Math.cos(FACE), Math.sin(FACE));                         // out of the nose, tipped toward the belly
  dot.quaternion.setFromUnitVectors(Y_AXIS, n); dot.position.set(0, PILL_L / 2 - PILL_R, 0).addScaledVector(n, PILL_R + 0.002);
  body.castShadow = body.receiveShadow = dot.castShadow = true;
  g.add(body, dot);
  return g;
}
function pillStandIn(w: KitWorld) {
  flyPill = null;
  // the render's own switch says whether this is a stand-in pass (so even the first frame's sub-frames are right)
  const add = w.scene.add.bind(w.scene);
  if (typeof window !== "undefined") try { if ((getInputProps() as { boxes?: boolean }).boxes) add((flyPill = makePill())); } catch { /* not in a render */ }
  w.scene.add = ((...objs: THREE.Object3D[]) => {
    for (const g of objs) {
      const cap = g.children[0] as THREE.Mesh | undefined;
      if (!(g as THREE.Group).isGroup || !cap || g.children.length !== 2 || cap.geometry?.type !== "CapsuleGeometry") continue;
      g.clear();                                                           // the shared capsule: ours stands in for it
      if (!flyPill) add((flyPill = makePill()));
    }
    return add(...objs);
  }) as typeof w.scene.add;
}

// the flyer's marks for the planner (focus, the shadow's centre): an upright body standing with its middle at the centre
const PATH: PathKey[] = (() => { const keys: PathKey[] = []; for (let t = -0.5; t <= T_END + 0.5 + 1e-6; t += 0.05) { const c = centre(t); keys.push({ t: +t.toFixed(3), at: [c.x, c.y - 0.9, c.z] }); } return keys; })();
const HERO: ActorSpec = { id: "HERO", name: "Hero", kind: "human", tint: "ochre", capsule: "trunk", path: PATH, acts: [{ kind: "clip", clip: GLIDE, t0: -5 }] };

export const PIECE: Piece = makeProduct(
  {
    id: "FAM06-PeterPanFlight", name: "Peter Pan flight",
    says: "Flying, and the joy of it. They cross the city above the rooftops and the camera cannot keep still either: it circles them the whole way, behind, in front, over the top, while the roofs stream past.",
    use: "A character who can fly, a dream, an arrival over a city, the high point of a fantasy. One take: do not cut between the angles, and let the last two seconds on the face play out.",
    numbers: "24 mm, one 16 s take at real speed. The flyer covers 243 m at 13.7 to 17.2 m/s: climbs from 26.5 to 38 m, weaves between two towers 5.5 and 6.8 m off, banks 45° round a clock tower on a 24 m radius, dips to 27.5 m (4.4 m over the roofs) and rises. The camera travels with them and goes round them one and a half times (531°), never faster than 51°/s: a chase from 4.3 m behind, side-on at 3 s, face to lens from 3.2 m at 5 s, 64° overhead from 6 m at 7.3 s, wide outside the bank from 8.5 to 9 m at 9 to 10 s with the clock face in frame, side-on again through the dip at 13 s, then ahead and low at 3.5 m for the last 1.5 s. The horizon tilts with the bank only, up to 11°.",
    avoid: "A flyer who hovers: the roofs must keep passing, or it reads as a wire rig. Stopping the orbit to hold an angle: the angles are passed through, not cut between.",
  },
  { sky: "day", keyDir: [-0.62, 0.55, 0.3], build, tick },
  [HERO],
  () => [{ start: 0, end: T_END, label: `${MM}mm  PETER PAN FLIGHT · ORBIT IN FLIGHT`, rig: "VIRTUAL CAMERA", subject: "HERO", size: "FS", stop: 8, shadow: 90, cam: camAt, cut: "Opens the template", flags: ["compound", "centre"], note: "Real speed throughout" }],
);

/** the template's own numbers, for the measuring probe */
export const FAM06 = { T_END, MM, G, DT, PSI, GAM, SPD, BANK, ROUND, ELEV, DIST, PSI_CAM, OFFX, at, centre, attitude, camAt, LOTS, SOLIDS, TOWERS, CLOCK, RIVER, lotTop, BODY_C, PILL_L, PILL_R };
