// PRD01-FrozenSplashOrbit
// Copied from engine/cinematic/src/templates/products/p01-frozen-splash-orbit.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh PRD01-FrozenSplashOrbit
// PRD01-FrozenSplashOrbit: the pill drops onto a wet tabletop, time stops on the splash, the camera orbits 270° round
// it at the pill's own height, time resumes and the move lands on the pill's front. The product version of bullet time.
import * as THREE from "three";
import { speedRamp } from "../../kit/stage";
import { GREY, clay } from "../../kit/clay";
import { clamp, rng, smooth, smoother } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { V, makeProduct, pillActor, studioFloor, type KitWorld, type PathKey } from "./shared";

const G = 9.81, TAU = Math.PI * 2;
// ---- the set (metres, real scale): a round table, its top carrying a film of liquid 1 cm deep, flush with the top ----
const TOP = 0.74, R_TABLE = 0.46, R_LIQ = 0.42, POOL_Y = TOP - 0.01, LIQ_Y = TOP - 0.001;

// ---- the fall (world seconds): released from rest above the frame, gravity to the liquid, stopped by the table under it ----
const Y_REL = TOP + 0.74, T_HIT = 0.9;                              // the base touches the liquid at T_HIT
const FALL = Math.sqrt((2 * (Y_REL - LIQ_Y)) / G), V_HIT = G * FALL, T_REL = T_HIT - FALL;
const SINK = (2 * (LIQ_Y - POOL_Y)) / V_HIT;                        // braked through the film: at rest on the table
const pillY = (t: number) => {
  if (t <= T_REL) return Y_REL;
  if (t <= T_HIT) return Y_REL - (G / 2) * (t - T_REL) ** 2;
  const u = clamp((t - T_HIT) / SINK); return POOL_Y + (LIQ_Y - POOL_Y) * (1 - u) ** 2;
};
const PATH: PathKey[] = (() => {
  const keys: PathKey[] = [{ t: 0, at: [0, Y_REL, 0], yaw: 0 }, { t: T_REL - 0.04, at: [0, Y_REL, 0] }];
  for (let k = 0; k <= 32; k++) { const t = T_REL + (FALL * k) / 32; keys.push({ t, at: [0, pillY(t), 0] }); }
  for (let k = 1; k <= 4; k++) { const t = T_HIT + (SINK * k) / 4; keys.push({ t, at: [0, pillY(t), 0] }); }
  keys.push({ t: T_HIT + SINK + 0.02, at: [0, POOL_Y, 0] }, { t: 6, at: [0, POOL_Y, 0], yaw: 0 });
  return keys;
})();

// ---- the clock: real time, eased from 0.01 s after the hit to 0.006 of real time, held 3.8 s, eased back ----
const SLOW = 0.006, T_FREEZE = 1.1, T_THAW = 4.9, T_LIVE = 5.4;
const CLOCK = speedRamp([[0, 1], [T_HIT + 0.01, 1], [T_FREEZE, SLOW], [T_THAW, SLOW], [T_LIVE, 1], [9, 1]]);

// ---- the camera: locked and wide for the fall, then one orbit that ends on the beauty frame (decided first: +z) ----
const MM = 28, ORBIT = 270, T_GO = 0.98, T_ARRIVE = 5.45, T_STILL = 6.1;
/** 0 → 1 between a and b: accelerates over `ein`, cruises, brakes over `eout` (the rate is a smoothstep trapezoid) */
function glide(t: number, a: number, b: number, ein: number, eout: number) {
  if (t <= a) return 0; if (t >= b) return 1;
  const I = (x: number) => { const c = clamp(x); return c * c * c - (c * c * c * c) / 2; };   // the integral of a smoothstep
  const cruise = b - a - ein - eout, x = clamp((t - (b - eout)) / eout);
  return (ein * I((t - a) / ein) + clamp(t - a - ein, 0, cruise) + eout * (x - I(x))) / (ein / 2 + cruise + eout / 2);
}
const sm = (t: number, a: number, b: number) => smoother((t - a) / (b - a));
function camAt(t: number): Cam {
  const a = THREE.MathUtils.degToRad(-ORBIT * (1 - glide(t, T_GO, T_ARRIVE, 0.7, 1.3)));
  const r = 1.5 - 0.62 * sm(t, T_GO, 2.6) - 0.08 * sm(t, 4.5, T_STILL);          // back for the fall, closes in for the orbit, pushes in to settle
  const y = TOP + 0.12 + 0.03 * sm(t, T_GO, 3.0) - 0.02 * sm(t, 3.2, T_STILL);   // the pill's mid-height, a touch up and back
  const ty = TOP + 0.285 - 0.16 * sm(t, T_GO, 2.6) - 0.025 * sm(t, 4.5, T_STILL); // tilted up for the fall, then level on the pill
  return { pos: V(r * Math.sin(a), y, r * Math.cos(a)), target: V(0, ty, 0), mm: MM };
}

// ---- the splash, all of it a function of world seconds since the hit (tau) ----
// the corona: a thin sheet thrown up and out from the pill's foot, low and short, its rim torn into uneven fingers
const R0 = 0.078, UY = 0.88, UR = 0.7, NT = 720, NJ = 23;          // NT round the sheet, NJ along its underside and back along its top
const WAVES = (() => { const r = rng(41); return [2, 3, 5, 8].map((n) => ({ n, a: r() * TAU })); })();
const TEETH = (() => { const r = rng(53), M = 34; return Array.from({ length: M }, (_, m) => ({ th: ((m + 0.2 + 0.6 * r()) * TAU) / M, amp: 0.3 + 0.7 * r(), w: 0.03 + 0.035 * r() })); })();
/** how far a finger reaches at an angle (0 between fingers, up to 1 on the longest) */
const tooth = (th: number) => TEETH.reduce((best, t) => { const d = Math.abs(((th - t.th + Math.PI * 3) % TAU) - Math.PI); return Math.max(best, t.amp * Math.exp(-((d / t.w) ** 2))); }, 0);
/** the rim's launch speed at an angle: fingers leave faster and flatter than the sheet between them */
function rimSpeed(th: number) {
  const f = tooth(th), wave = WAVES.reduce((a, w) => a + Math.sin(w.n * th + w.a), 0) / WAVES.length;
  return { uy: UY * (1 + 0.2 * f) * (1 + 0.1 * wave), ur: UR * (1 + 0.9 * f) * (1 - 0.08 * wave), f };
}
const RIM = Array.from({ length: NT }, (_, i) => rimSpeed((i * TAU) / NT));
const SHEET_END = (2 * Math.max(...RIM.map((s) => s.uy))) / G + 0.02;   // the whole rim is back in the liquid by now

type Drop = { th: number; r0: number; te: number; vh: number; vy: number; rad: number; long: number; y0: number; land: number; rest: number; sinks: boolean; redo: boolean };
/** where a drop comes down: in the film (taken up), on the dry edge of the table, or on the studio floor */
function landing(d: Drop) {
  const down = (y: number) => (d.vy + Math.sqrt(d.vy * d.vy + 2 * G * (d.y0 - y))) / G;
  const t1 = down(TOP + d.rad), r1 = d.r0 + d.vh * t1;
  d.redo = false;
  if (r1 < R_LIQ) { d.land = t1; d.rest = TOP; d.sinks = true; }
  else if (r1 <= R_TABLE - 0.012) { d.land = t1; d.rest = TOP; d.sinks = false; }
  else if (r1 > R_TABLE + d.rad + 0.002) { d.land = down(d.rad); d.rest = 0; d.sinks = false; }
  else d.redo = true;                                              // it would clip the table's edge
  return d;
}
/** a drop at tau: centre, velocity, its size (0 to 1) and how far it has flattened where it landed (0 flying, 1 a splat) */
function dropAt(d: Drop, tau: number) {
  const s = clamp(tau - d.te, 0, d.land), r = d.r0 + d.vh * s, after = smooth((tau - d.te - d.land) / 0.03), q = d.sinks ? 0 : after;
  const y = d.y0 + d.vy * s - (G / 2) * s * s, vy = d.vy - G * s;
  // it swells out of the liquid as it leaves, and one that falls back in is taken up by the surface
  const size = smooth((tau - d.te) / 0.015) * (d.sinks ? 1 - after : 1);
  return { pos: V(r * Math.cos(d.th), q > 0 ? d.rest + d.rad * (1 - 0.75 * q) : y, r * Math.sin(d.th)), vel: V(d.vh * Math.cos(d.th), vy, d.vh * Math.sin(d.th)), q, size, flying: tau - d.te > 0 && tau - d.te < d.land };
}
const LENS_CLEAR = 0.1;                                            // no drop's surface comes nearer the lens than this
/** how near a drop's surface comes to the lens over the whole film */
function lensGap(d: Drop) {
  let best = 1e9;
  for (let t = T_HIT; t <= 7; t += 1 / 240) best = Math.min(best, camAt(t).pos.distanceTo(dropAt(d, CLOCK(t) - T_HIT).pos) - d.rad * d.long);
  return best;
}
// the spray: small drops (3 to 10 mm across, most of them small), the flat ones the fastest
const DROPS: Drop[] = (() => {
  const r = rng(29), out: Drop[] = [], R = (a: number, b: number) => a + (b - a) * r();
  const add = (th: number, r0: number, te: number, vh: number, vy: number, rad: number, long: number) => {
    const d: Drop = { th, r0, te, vh, vy: Math.max(0.6, vy), rad, long, y0: LIQ_Y - 0.003, land: 0, rest: 0, sinks: true, redo: false };
    for (let n = 0; n < 90; n++) {
      if (landing(d).redo) { d.vh *= 0.95; continue; }               // short of the table's edge instead of onto it
      if (lensGap(d) < LENS_CLEAR) { d.th += 0.09; continue; }       // a drop on course for the lens goes a few degrees to one side
      break;
    }
    out.push(d);
  };
  // each finger of the sheet breaks into a line of drops flying on ahead of it, faster and flatter the further out
  for (const t of TEETH) {
    const s = rimSpeed(t.th), n = 3 + Math.floor(4 * t.amp);
    for (let j = 0; j < n; j++) { const f = 1.12 + (j + R(0, 0.7)) * 0.18; add(t.th + R(-0.025, 0.025), R0, R(0, 0.008), s.ur * Math.pow(f, 1.3), s.uy * Math.pow(f, 0.5) * R(0.9, 1.1), Math.max(0.0015, (0.0042 - 0.0005 * j) * R(0.6, 1)), j < 3 ? R(1.6, 3) : R(1, 1.5)); }
  }
  // a wide cone of loose spray: the highest about the pill's shoulder at the freeze, the flattest out past the table's edge
  for (let i = 0; i < 150; i++) {
    const e = Math.pow(r(), 1.25), elev = THREE.MathUtils.degToRad(10 + 52 * e), speed = (5.3 - 2.9 * e) * R(0.4, 1), u = r();
    add(((i + R(0.1, 0.9)) * TAU) / 150, R(0.085, 0.12), R(0, 0.035), speed * Math.cos(elev), speed * Math.sin(elev), 0.0015 + 0.0035 * Math.pow(u, 1.6), r() < 0.25 ? R(1.8, 3) : R(1, 1.3));
  }
  // a few bigger, fast ones at the lens's own height, so the orbit has drops to pass close to
  for (let i = 0; i < 18; i++) { const elev = THREE.MathUtils.degToRad(R(13, 22)), speed = R(4.6, 6); add(((i + R(0.15, 0.85)) * TAU) / 18, R(0.09, 0.11), R(0, 0.01), speed * Math.cos(elev), speed * Math.sin(elev), R(0.003, 0.005), R(1, 1.6)); }
  return out;
})();

// the rings the sheet leaves when it falls back: [born (tau), start radius, speed, the radius it has died by]
const RIPPLES: [number, number, number, number][] = [[0.17, 0.24, 0.38, 0.39], [0.3, 0.09, 0.45, 0.39], [0.42, 0.09, 0.5, 0.33]];

function build(w: KitWorld) {
  studioFloor(w);
  // the table: a round top with a 1 cm recess for the film, on a pedestal
  const prof = [[0.001, TOP - 0.04], [R_TABLE - 0.008, TOP - 0.04], [R_TABLE, TOP - 0.032], [R_TABLE, TOP - 0.006], [R_TABLE - 0.006, TOP], [R_LIQ + 0.003, TOP], [R_LIQ, TOP - 0.003], [R_LIQ, POOL_Y], [0.001, POOL_Y]];
  const top = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 160), clay(GREY.paper, 0.85));
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, TOP - 0.07, 40), clay(GREY.set)); leg.position.y = (TOP - 0.04 + 0.03) / 2;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.03, 64), clay(GREY.set)); foot.position.y = 0.015;
  for (const m of [top, leg, foot]) { m.castShadow = m.receiveShadow = true; w.add(m); }
  const liquid = clay("#9a9994", 0.6);
  const film = new THREE.Mesh(new THREE.CylinderGeometry(R_LIQ + 0.001, R_LIQ + 0.001, LIQ_Y - POOL_Y, 160), liquid); film.position.y = (LIQ_Y + POOL_Y) / 2; film.receiveShadow = true; w.add(film);
  // far, soft columns for the orbit to slide against; two of them flank the pill in the last frame
  for (const [x, z, r] of [[-12.5, 5.5, 0.3], [-2.5, 10, 0.34], [8, 5, 0.28], [9.5, -4, 0.32], [-3.2, -9.5, 0.3], [4.6, -12.5, 0.36]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 6, 40), clay(GREY.set)); c.position.set(x, 3, z); c.castShadow = c.receiveShadow = true; w.add(c); }

  // the sheet: closed (underside, rounded rim, top), reshaped every frame
  const geo = new THREE.BufferGeometry(), idx: number[] = [];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NT * NJ * 3), 3));
  for (let i = 0; i < NT; i++) for (let j = 0; j < NJ - 1; j++) { const a = i * NJ + j, b = ((i + 1) % NT) * NJ + j; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  geo.setIndex(idx);
  const sheet = new THREE.Mesh(geo, liquid); sheet.castShadow = sheet.receiveShadow = true; sheet.frustumCulled = false; sheet.visible = false; w.add(sheet, "sheet");
  const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), liquid, DROPS.length);
  drops.castShadow = drops.receiveShadow = true; drops.frustumCulled = false; w.add(drops, "drops");
  RIPPLES.forEach((_, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 12, 160), liquid); m.rotation.x = Math.PI / 2; m.position.y = LIQ_Y; m.receiveShadow = true; m.visible = false; w.add(m, "ripple" + i); });
}

const UPV = V(0, 1, 0), tmp = new THREE.Object3D(), qv = new THREE.Quaternion(), q0 = new THREE.Quaternion();
function tick(w: KitWorld, t: number) {
  const tau = t - T_HIT;
  // the sheet: every rim point flies ballistically out from the pill's foot; the sheet hangs between it and a slower base,
  // flat near the base and lifting toward the rim, and thins to nothing as it falls back
  const sheet = w.parts.get("sheet") as THREE.Mesh;
  sheet.visible = tau > 0 && tau < SHEET_END;
  if (sheet.visible) {
    const pos = sheet.geometry.getAttribute("position") as THREE.BufferAttribute, rBase = R0 + 0.35 * UR * tau, fly = (uy: number) => Math.max(0, uy * tau - (G / 2) * tau * tau);
    for (let i = 0; i < NT; i++) {
      const th = (i * TAU) / NT, s = RIM[i], uy0 = s.uy / (1 + 0.2 * s.f), ur0 = s.ur / (1 + 0.9 * s.f);              // the sheet between fingers
      const H = fly(uy0), span = R0 + ur0 * tau - rBase, reach = (s.ur - ur0) * tau, lift = fly(s.uy) - H, cx = Math.cos(th), cz = Math.sin(th), body = clamp(H / 0.012);
      for (let j = 0; j < NJ; j++) {
        const u = j / (NJ - 1), k = 1 - Math.pow(Math.abs(2 * u - 1), 1.6), under = u < 0.5 ? 1 : -1, tip = Math.pow(clamp((k - 0.55) / 0.45), 1.6);
        const cap = k > 0.9 ? Math.sqrt(Math.max(0, 1 - ((k - 0.9) / 0.1) ** 2)) : 1;                          // the rim is rounded over
        const half = (0.0032 - 0.0018 * k) * (1 - 0.3 * s.f * tip) * body * cap, slope = (H * 1.7 * Math.pow(k, 0.7)) / Math.max(1e-4, span), n = 1 / Math.hypot(1, slope);
        // the sheet's middle line (a finger only reaches out past the rim), half its thickness to either side, and a foot at the surface
        const r = rBase + span * k + reach * tip + under * (half * slope * n + 0.01 * body * (1 - k) ** 3);
        pos.setXYZ(i * NJ + j, r * cx, LIQ_Y - 0.004 + (H + 0.003) * Math.pow(k, 1.7) + lift * tip - under * half * n, r * cz);
      }
    }
    pos.needsUpdate = true; sheet.geometry.computeVertexNormals();
  }
  // the drops: ballistic, some drawn out along their flight, flattened where they land on the table or the floor
  const drops = w.parts.get("drops") as THREE.InstancedMesh;
  DROPS.forEach((d, i) => {
    const s = dropAt(d, tau), sp = s.vel.length(), st = s.flying ? d.long : 1, k = st * (1 - 0.75 * s.q), side = (1 / Math.sqrt(st)) * (1 + 0.8 * s.q), R = d.rad * s.size;
    tmp.position.copy(s.pos);
    tmp.quaternion.copy(q0); if (s.flying && sp > 1e-3) tmp.quaternion.copy(qv.setFromUnitVectors(UPV, s.vel.multiplyScalar(1 / sp)));
    tmp.scale.set(R * side, R * k, R * side); tmp.updateMatrix(); drops.setMatrixAt(i, tmp.matrix);
  });
  drops.instanceMatrix.needsUpdate = true;
  // the ripples: low rings that run out from the fallen sheet and die before the film's edge
  RIPPLES.forEach(([born, r0, v, end], i) => {
    const m = w.parts.get("ripple" + i) as THREE.Mesh, age = tau - born, R = r0 + v * Math.max(0, age);
    const amp = 0.004 * smooth(age / 0.08) * (1 - smooth((R - (end - 0.1)) / 0.1));
    m.visible = amp > 1e-5; if (m.visible) m.scale.set(R, R, amp / 0.07);
  });
}

export const PIECE: Piece = makeProduct(
  { id: "PRD01-FrozenSplashOrbit", name: "Frozen splash orbit", says: "A bottle or can drops onto a wet table, time stops on the splash, the camera circles it 270 degrees at its own height, then time resumes.", use: "A drink or splash shot that needs a bullet-time hero frame. The bullet-time orbit for liquids.", numbers: "270 degree orbit at the object's own height; the splash is held about 3.8 s at 0.6% of real speed; the move ends on its front.", avoid: "Never sent to the model: the first render hid the pill behind the splash. Check the frame at the freeze before you send it." },
  { sky: "studio", keyDir: [-0.4, 0.75, 0.55], build, tick, clock: CLOCK },
  [pillActor([0, Y_REL, 0], 0, PATH)],
  () => [{ start: 0, end: 8, label: `${MM}mm  FROZEN SPLASH · ORBIT ${ORBIT}`, rig: "MOTION CONTROL ARM · HIGH-SPEED CAMERA", subject: "PILL", size: "FS", stop: 8, shadow: 1.25, cam: camAt, cut: "Opens the template", flags: ["compound", "centre", "whip"], note: "Clock 1 → 0.006 just after the hit, held through the orbit, back to 1 for the fall-back" }],
);

/** the template's own numbers, for the measuring probe */
export const PRD01 = { camAt, CLOCK, DROPS, dropAt, lensGap, pillY, T_HIT, T_REL, V_HIT, SINK, T_FREEZE, T_THAW, T_LIVE, SHEET_END, R_LIQ, R_TABLE, TOP, LIQ_Y, POOL_Y };
