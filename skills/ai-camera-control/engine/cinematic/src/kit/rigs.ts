// Named camera moves. Each one places the camera from the subject and the planned shot size (the framer), then moves it
// the way that rig moves: eased in and out of composed holds (rulebook §3), one dominant axis, the aim kept on the
// subject's eyes. Every function returns a pure function of time, so any frame renders on its own.
import * as THREE from "three";
import type { Cam, Size } from "../shots";
import type { Marks } from "../marks";
import { aimFor, frameFor, frameHeight, SENSOR_H } from "../framer";
import { lerp, ramp, smoother } from "../util";
import FILM from "./filmpaths.json";

export type Subj = (t: number) => Marks;
const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** a direction from the subject: `deg` round from its facing (0 = in front, 90 = its left, 180 = behind) */
export const around = (m: Marks, deg: number) => (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize().applyAxisAngle(UP, THREE.MathUtils.degToRad(deg));
/** progress through a move that holds still for `hold` seconds at each end */
const prog = (t: number, t0: number, t1: number, hold: number) => ramp(t, t0 + hold, t1 - hold);
/** a point averaged over a short window: how an operator follows (a little behind, never twitching) */
export const lag = (f: (t: number) => THREE.Vector3, t: number, w = 0.4) => { const o = V(0, 0, 0); for (let i = 0; i < 7; i++) o.add(f(t - w / 2 + (w * i) / 6)); return o.multiplyScalar(1 / 7); };
/** eyes on the upper third, and a third to the side the subject faces away from (lead room) */
export const leadRoom = (pos: THREE.Vector3, m: Marks, amount = 1 / 3): [number, number] => {
  if (!m.facing) return [0, 1 / 3];
  const toCam = pos.clone().sub(m.eye).setY(0).normalize();
  const right = new THREE.Vector3().crossVectors(toCam.clone().negate(), UP).normalize();      // the camera's right on the ground
  const side = m.facing.clone().setY(0).normalize().dot(right);
  return [Math.abs(side) < 0.3 ? 0 : -Math.sign(side) * amount, 1 / 3];
};

export type Frame = { size: Size; mm: number; deg?: number; rise?: number; at?: [number, number] };
/** a camera framed on m: size, lens, the angle round it, a height off eye level */
export function framed(m: Marks, f: Frame): Cam {
  const c = frameFor(m, { size: f.size, mm: f.mm, from: around(m, f.deg ?? 30), rise: f.rise ?? 0, at: f.at });
  const full = f.size === "WS" || f.size === "FS" || f.size === "EWS";
  if (!f.at) c.target = full ? aimFor(c.pos, m.top.clone().lerp(m.sole, 0.5), f.mm, [leadRoom(c.pos, m)[0], 0]) : aimFor(c.pos, m.eye, f.mm, leadRoom(c.pos, m));
  return c;
}

export const rig = {
  /** a zoom: the camera stays put, only the focal length changes (a slow creep, or a crash zoom in a fraction of a second).
   *  It flattens and magnifies; a dolly moves through space instead */
  zoom(s: Subj, f: Frame, mm1: number, t0: number, t1: number, t: number, hold = 0.3) {
    const c = framed(s(t), f);
    return (x: number): Cam => { const k = prog(x, t0, t1, hold), mm = f.mm * Math.pow(mm1 / f.mm, k); return { pos: c.pos.clone(), target: aimFor(c.pos, s(x).eye, mm, [0, 0.05]), mm }; };
  },

  /** a tilt (or pan) reveal from a fixed position: the head turns from point a to point b; with `follow` it ends on the subject */
  tiltReveal(pos: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, mm: number, t0: number, t1: number, hold = 0.5) {
    return (t: number): Cam => {
      const k = prog(t, t0, t1, hold), da = a.clone().sub(pos).normalize(), db = b.clone().sub(pos).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(da, db), d = da.applyQuaternion(new THREE.Quaternion().slerp(q, k));
      return { pos: pos.clone(), target: pos.clone().add(d.multiplyScalar(10)), mm };
    };
  },

  /** a truck past: the camera slides sideways along a line (a to b) with its aim held parallel; near objects stream past
   *  fast, far ones slowly (parallax). `look` keeps the aim on a point instead */
  truck(a: THREE.Vector3, b: THREE.Vector3, dir: THREE.Vector3, mm: number, t0: number, t1: number, look?: (t: number) => THREE.Vector3, hold = 0.4) {
    return (t: number): Cam => {
      const k = prog(t, t0, t1, hold), pos = a.clone().lerp(b, k);
      return { pos, target: look ? aimFor(pos, look(t), mm, [0, 0.1]) : pos.clone().add(dir.clone().normalize().multiplyScalar(10)), mm };
    };
  },

  /** locked off: framed once on the subject at `t`, then the camera never moves (a tripod) */
  locked(s: Subj, f: Frame, t: number) { const c = framed(s(t), f); return () => ({ ...c, pos: c.pos.clone(), target: c.target.clone() }); },

  /** a pan (and tilt) from a fixed position: the head turns with the subject, a little behind it */
  panWith(s: Subj, f: Frame, t: number, lagW = 0.35) {
    const pos = framed(s(t), f).pos;
    return (x: number): Cam => { const e = lag((y) => s(y).eye, x, lagW); return { pos: pos.clone(), target: aimFor(pos, e, f.mm, [0, 1 / 3]), mm: f.mm }; };
  },

  /** a push in (or pull out, with sizes swapped): the camera travels along one line from size a to size b */
  dolly(s: Subj, a: Frame, b: Size, t0: number, t1: number, hold = 0.5) {
    return (t: number): Cam => {
      const k = prog(t, t0, t1, hold), m = s(t);
      const A = frameFor(s(t0), { size: a.size, mm: a.mm, from: around(s(t0), a.deg ?? 30), rise: a.rise ?? 0 });
      const dA = A.pos.clone().sub(s(t0).eye).setY(0).length();
      const B0 = frameFor(s(t0), { size: b, mm: a.mm, from: around(s(t0), a.deg ?? 30), rise: 0 });
      const B = frameFor(s(t0), { size: b, mm: a.mm, from: around(s(t0), a.deg ?? 30), rise: ((a.rise ?? 0) * B0.pos.clone().sub(s(t0).eye).setY(0).length()) / Math.max(0.01, dA) });
      const pos = A.pos.clone().lerp(B.pos, k).add(m.eye.clone().sub(s(t0).eye));     // ride along if the subject drifts
      return { pos, target: aimFor(pos, m.eye, a.mm, leadRoom(pos, m)), mm: a.mm };
    };
  },

  /** the dolly zoom: travel and zoom together so the subject's size holds and the space behind stretches or shrinks.
   *  distance ∝ focal length (rulebook §3), so they are driven together, never keyed apart */
  dollyZoom(s: Subj, size: Size, mm0: number, mm1: number, deg: number, t0: number, t1: number, hold = 0.4) {
    return (t: number): Cam => {
      const k = prog(t, t0, t1, hold), m = s(t), mm = lerp(mm0, mm1, smoother(k));
      const d = (frameHeight(m, size) * mm) / SENSOR_H;
      const pos = m.eye.clone().add(around(s(t0), deg).multiplyScalar(d));
      return { pos, target: aimFor(pos, m.eye, mm, [0, 1 / 3]), mm };
    };
  },

  /** an orbit round the subject from deg a0 to a1, at a held size, with an optional rise */
  orbit(s: Subj, f: Frame, a0: number, a1: number, t0: number, t1: number, rise1?: number, hold = 0.4) {
    return (t: number): Cam => {
      const k = prog(t, t0, t1, hold), m = s(t);
      const deg = lerp(a0, a1, k), rise = lerp(f.rise ?? 0, rise1 ?? f.rise ?? 0, k);
      const c = frameFor(m, { size: f.size, mm: f.mm, from: around(s(t0), deg), rise });
      return { pos: c.pos, target: aimFor(c.pos, m.eye, f.mm, [0, f.size === "WS" || f.size === "EWS" ? 0 : 1 / 3]), mm: f.mm };
    };
  },

  /** a crane: the arm rises (or falls) from rise0 to rise1 metres off eye level while the head keeps the subject framed;
   *  `dist1` (a multiple of the start distance) lets it swing out or in as it goes */
  crane(s: Subj, f: Frame, rise0: number, rise1: number, t0: number, t1: number, dist1 = 1, hold = 0.5) {
    return (t: number): Cam => {
      const k = prog(t, t0, t1, hold), m = s(t);
      const base = frameFor(s(t0), { size: f.size, mm: f.mm, from: around(s(t0), f.deg ?? 30), rise: 0 });
      const out = base.pos.clone().sub(s(t0).eye).setY(0).multiplyScalar(lerp(1, dist1, k));
      const pos = m.eye.clone().add(out).add(V(0, lerp(rise0, rise1, k), 0));
      return { pos, target: aimFor(pos, m.eye, f.mm, [0, f.size === "WS" || f.size === "EWS" ? 0 : 1 / 3]), mm: f.mm };
    };
  },

  /** a Steadicam follow: behind (deg 180) or leading (deg 0) the subject at a held size, the operator a beat behind */
  follow(s: Subj, f: Frame, lagW = 0.6) {
    return (t: number): Cam => {
      const m = s(t);
      const e = lag((y) => s(y).eye, t, lagW), dir = lag((y) => around(s(y), f.deg ?? 180), t, lagW * 1.5).normalize();
      e.y = lag((y) => s(y).eye, t, 1.4).y;                                                     // the arm floats over the walk's bounce
      const d = (frameHeight(m, f.size) * f.mm) / SENSOR_H;
      const pos = e.clone().add(dir.multiplyScalar(d)).add(V(0, f.rise ?? 0.15, 0));
      return { pos, target: aimFor(pos, e, f.mm, [0, 1 / 3]), mm: f.mm };
    };
  },

  /** tracking alongside: the camera travels parallel to the subject, side-on, leading it slightly */
  track(s: Subj, f: Frame, side: 1 | -1 = 1, lead = 0.6) {
    return (t: number): Cam => {
      const m = s(t), e = lag((y) => s(y).eye, t, 0.5), fwd = lag((y) => around(s(y), 0), t, 0.8).normalize();
      e.y = lag((y) => s(y).eye, t, 2.0).y;
      const d = (frameHeight(m, f.size) * f.mm) / SENSOR_H;
      const pos = e.clone().add(fwd.clone().applyAxisAngle(UP, side * Math.PI / 2).multiplyScalar(d)).add(fwd.clone().multiplyScalar(lead)).add(V(0, f.rise ?? 0, 0));
      return { pos, target: aimFor(pos, e, f.mm, leadRoom(pos, m)), mm: f.mm };
    };
  },

  /** over the shoulder: behind `fg`'s shoulder onto `bg`. The shoulder takes about a quarter of the frame (side +1 =
   *  over the right shoulder); `bg`'s eyes sit on the upper third, on the far side from the shoulder */
  ots(fg: Subj, bg: Subj, mm: number, side: 1 | -1 = 1, back = 0.9, off = 0.45, drift = 0, t0 = 0, t1 = 1) {
    return (t: number): Cam => {
      const a = fg(t), b = bg(t), k = ramp(t, t0, t1);
      const look = b.eye.clone().sub(a.eye).setY(0).normalize();
      const right = new THREE.Vector3().crossVectors(look, UP).normalize();
      const pos = a.eye.clone().add(look.clone().multiplyScalar(-(back - drift * k))).add(right.multiplyScalar(side * off)).add(V(0, 0.08, 0));
      return { pos, target: aimFor(pos, b.eye, mm, [side * 0.3, 1 / 3]), mm };
    };
  },

  /** a whip pan: hold on shot A, then swing to B's aim in `dur` seconds (motion blur sells it); position stays A's */
  whip(a: (t: number) => Cam, b: (t: number) => Cam, tw: number, dur = 0.35) {
    return (t: number): Cam => {
      if (t <= tw) return a(t);
      const A = a(tw), B = b(t), k = smoother((t - tw) / dur);
      const da = A.target.clone().sub(A.pos).normalize(), db = B.target.clone().sub(A.pos).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(da, db), d = da.applyQuaternion(new THREE.Quaternion().slerp(q, k));
      return { pos: A.pos.clone(), target: A.pos.clone().add(d.multiplyScalar(10)), mm: lerp(A.mm, B.mm, k) };
    };
  },

  /** a chase drone: behind and above a moving subject, matched to its speed, a beat behind */
  chase(s: Subj, back: number, up: number, mm: number, side = 0, lagW = 0.8) {
    return (t: number): Cam => {
      const e = lag((y) => s(y).eye, t, lagW), fwd = lag((y) => around(s(y), 0), t, lagW * 1.4).normalize();
      const right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
      const pos = e.clone().add(fwd.clone().multiplyScalar(-back)).add(V(0, up, 0)).add(right.multiplyScalar(side));
      return { pos, target: aimFor(pos, s(t).eye, mm, [0, 0.15]), mm };
    };
  },

  /** an FPV drone: low and close, faster reactions than a chase drone, weaving a little (its rig banks into turns) */
  fpv(s: Subj, back: number, up: number, mm: number, weave = 0.8) {
    return (t: number): Cam => {
      const e = lag((y) => s(y).eye, t, 0.25), fwd = lag((y) => around(s(y), 0), t, 0.4).normalize();
      const right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
      const pos = e.clone().add(fwd.clone().multiplyScalar(-back)).add(V(0, up, 0)).add(right.multiplyScalar(weave * Math.sin(t * 0.9)));
      return { pos, target: aimFor(pos, s(t).eye, mm, [0, 0.45]), mm };
    };
  },

  /** one take made of several moves: each segment is a rig on its own span, and neighbours blend over `blend` seconds
   *  around each change (position along a curve, aim by rotation, lens by ratio), so a crane can land into a follow
   *  and the follow whip into a reveal without a cut */
  chain(segs: { from: number; cam: (t: number) => Cam }[], blend = 0.8) {
    return (t: number): Cam => {
      let i = 0; while (i + 1 < segs.length && t >= segs[i + 1].from) i++;
      const here = segs[i].cam(t);
      // blend into the next segment as its start approaches, and out of the previous one just after it
      const mix = (A: Cam, B: Cam, k: number): Cam => {
        const pos = A.pos.clone().lerp(B.pos, k);
        const da = A.target.clone().sub(A.pos).normalize(), db = B.target.clone().sub(B.pos).normalize();
        const d = da.applyQuaternion(new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(da, db), k));
        return { pos, target: pos.clone().add(d.multiplyScalar(10)), mm: A.mm * Math.pow(B.mm / A.mm, k), roll: lerp(A.roll ?? 0, B.roll ?? 0, k) };
      };
      const next = segs[i + 1], prev = segs[i - 1];
      if (next && t > next.from - blend / 2) return mix(here, next.cam(t), smoother((t - (next.from - blend / 2)) / blend));
      if (prev && t < segs[i].from + blend / 2) return mix(prev.cam(t), here, smoother((t - (segs[i].from - blend / 2)) / blend));
      return here;
    };
  },

  /** a keyframed path: positions on a centripetal Catmull-Rom curve, the aim and lens blended key to key, timed by the
   *  keys and eased once over the whole move (a jib or drone programmed move) */
  spline(keys: { t: number; pos: THREE.Vector3; look: THREE.Vector3 | ((t: number) => THREE.Vector3); mm: number }[]) {
    const P = new THREE.CatmullRomCurve3(keys.map((k) => k.pos), false, "centripetal");
    const n = keys.length - 1;
    return (t: number): Cam => {
      // linear through the keys (no stop at each), eased only at the first and last: one continuous programmed move
      const lin = (x: number) => { let j = 0; while (j < n - 1 && x > keys[j + 1].t) j++; return (j + ramp(x, keys[j].t, keys[j + 1].t)) / n; };
      const e = smoother(ramp(t, keys[0].t, keys[n].t)), tt = keys[0].t + e * (keys[n].t - keys[0].t);
      const u = lin(tt);
      const i = Math.min(n - 1, Math.floor(u * n)), k = u * n - i;
      const pos = P.getPoint(u);
      const look = (x: (typeof keys)[number]) => (typeof x.look === "function" ? x.look(t) : x.look);
      const target = look(keys[i]).clone().lerp(look(keys[i + 1]), k);
      return { pos, target, mm: keys[i].mm * Math.pow(keys[i + 1].mm / keys[i].mm, k) };
    };
  },

  /** a body-mounted camera (snorricam): bolted to the subject's chest rig, facing back at it, so the subject holds still
   *  in frame while the world swings round behind; `off` is the rig's arm in the subject's frame (x right, y up, z ahead) */
  snorricam(s: Subj, off: [number, number, number], mm: number) {
    return (t: number): Cam => {
      const m = s(t), fwd = (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize(), right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
      const chest = (m.ladder?.chest ?? m.eye.clone().lerp(m.sole, 0.3)).clone();
      const pos = chest.clone().add(right.multiplyScalar(off[0])).add(V(0, off[1], 0)).add(fwd.clone().multiplyScalar(off[2]));
      return { pos, target: aimFor(pos, m.eye, mm, [0, 0.2]), mm };
    };
  },

  /** an operator's hands on any move: layered slow drift and quicker tremor (seeded, so it is the same every render);
   *  `amt` 1 is a calm handheld, 3 a run-and-gun, 6 an impact */
  shake(cam: (t: number) => Cam, amt = 1, seed = 1) {
    const n = (t: number, f: number, p: number) => Math.sin(t * f + p) * 0.6 + Math.sin(t * f * 2.3 + p * 1.7) * 0.3 + Math.sin(t * f * 5.1 + p * 0.3) * 0.1;
    return (t: number): Cam => {
      const c = cam(t), a = 0.0016 * amt;
      return { ...c, shake: [n(t, 1.3, seed) * a + n(t, 7.1, seed * 3) * a * 0.25, n(t, 1.1, seed * 2) * a + n(t, 6.3, seed * 5) * a * 0.25], roll: (c.roll ?? 0) + n(t, 0.9, seed * 7) * a * 0.6 };
    };
  },

  /** a move taken from a real film (src/kit/filmpaths.json, distilled from the E.T. dataset): the camera's path and aim
   *  measured relative to the actor, scaled so the starting distance frames `f.size` on `f.mm`, replayed from t0 at
   *  `speed`, and anchored on the subject's position and heading at t0 (the move rides along if the subject travels).
   *  Presets measured on a still actor start behind them (forward = the film camera's view); `front` mirrors such a move
   *  to play from in front. The path is the film's; the aim is laid on the subject's eyes (a tenth of the film's own aim
   *  kept), since operators frame 10–30° off the body and that loses a different body on a longer lens */
  filmPath(name: string, s: Subj, f: Frame, t0: number, speed = 1, front = false) {
    const pre = (FILM as any).presets[name];
    if (!pre) throw new Error("no film path " + name);
    const fr: number[][] = pre.frames, fps = (FILM as any).fps as number;
    return (t: number): Cam => {
      const m0 = s(t0), m = s(t);
      const x = THREE.MathUtils.clamp((t - t0) * speed * fps, 0, fr.length - 1), i = Math.floor(x), j = Math.min(i + 1, fr.length - 1), k = x - i;
      const at = (q: number) => fr[i][q] + (fr[j][q] - fr[i][q]) * k;
      const fwd = (m0.heading ?? m0.facing ?? V(0, 0, 1)).clone().setY(0).normalize().applyAxisAngle(UP, THREE.MathUtils.degToRad(f.deg ?? 0));
      const right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
      const d = (frameHeight(m, f.size) * f.mm) / SENSOR_H;
      const mir = front ? -1 : 1;
      const toWorld = (a: number, b: number, c: number) => right.clone().multiplyScalar(a * mir).add(V(0, b, 0)).add(fwd.clone().multiplyScalar(c * mir));
      const pos = m.eye.clone().add(toWorld(at(0), at(1), at(2)).multiplyScalar(d)).add(V(0, f.rise ?? 0, 0));
      const look = toWorld(at(3), at(4), at(5)).normalize();
      // the film's camera path is kept; the aim is re-laid on this subject (on another body and lens the film's own
      // off-body aim loses it), keeping a trace of the operator's drift
      const aim = aimFor(pos, m.eye, f.mm, [0, 1 / 3]).sub(pos).normalize();
      const dir = look.lerp(aim, 0.9).normalize();
      return { pos, target: pos.clone().add(dir.multiplyScalar(10)), mm: f.mm * (fr[i][6] ?? 1) };
    };
  },

  /** a drop or a dive: the camera falls (or dives) along a line from a to b with gravity's ease, aim held on the subject */
  dive(s: Subj, a: THREE.Vector3, b: THREE.Vector3, mm0: number, mm1: number, t0: number, t1: number) {
    return (t: number): Cam => {
      const k = ramp(t, t0, t1), e = k * k * (1.6 - 0.6 * k);     // accelerates like a fall, settles at the bottom
      const pos = a.clone().lerp(b, e), mm = mm0 * Math.pow(mm1 / mm0, e);
      return { pos, target: aimFor(pos, s(t).eye, mm, [0, 0.2]), mm };
    };
  },
};
