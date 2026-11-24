// motion-kit.mjs — time-pure motion helpers for product-launch-motion films.
//
// Our runnable version of the code patterns in references/technique.md
// (closed-form springs, summed spring tracks, blur content swaps, odometer
// digits, edge-split stretch, sub-frame times). Every function is a pure
// function of t, so any frame can be rendered in any order.
//
// Adapted from product-launch-motion (MIT, © 2026 Abubakr Chan); this file
// was added in motion-tools-and-skills and is MIT like the rest of the skill.
//
// Browser: <script type="module"> import { Track, vis } from "./motion-kit.mjs" </script>
// Node:    node --test scripts/motion-kit.test.mjs

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/**
 * Closed-form damped spring step response, 0 → 1.
 * @param {number} tau  seconds since the step
 * @param {{w:number, z:number}} sp  natural frequency (rad/s) and damping ratio
 *   z 0.72–0.9: a tiny overshoot (UI parts); z 1.0: camera and text (no overshoot).
 */
export function stepR(tau, { w, z }) {
  if (tau <= 0) return 0;
  if (z >= 1) {
    const x = w * tau;
    return 1 - Math.exp(-x) * (1 + x);
  }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + ((z * w) / wd) * Math.sin(wd * tau));
}

/**
 * A value driven by many target changes: the sum of one spring per change.
 * Issue a target that must *arrive* at T about settleLead(sp) early.
 */
export class Track {
  constructor(v0) {
    this.v0 = v0;
    this.cur = v0;
    this.ev = [];
  }
  to(t, v, sp) {
    if (v !== this.cur) {
      this.ev.push([t, v - this.cur, sp]);
      this.cur = v;
    }
    return this;
  }
  at(t) {
    let v = this.v0;
    for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp);
    return v;
  }
  /**
   * For a seamless loop of length `period`: also sum the previous k periods'
   * springs, so tails cross the loop point. The track must end where it
   * started (the deltas sum to zero), or the loop jumps.
   */
  atLoop(t, period, k = 2) {
    let v = this.at(t);
    for (let i = 1; i <= k; i++) for (const [ti, d, sp] of this.ev) v += d * stepR(t + i * period - ti, sp);
    return v;
  }
}

/** Seconds a spring needs to get within `eps` of its target (used to issue a target early). */
export function settleLead(sp, eps = 0.02, dt = 1 / 240) {
  let last = 0;
  for (let t = 0; t < 5; t += dt) if (Math.abs(1 - stepR(t, sp)) > eps) last = t;
  return last + dt;
}

/**
 * Content swap with blur: enter on a spring, exit short and early.
 * Returns opacity o, blur b (px), vertical offset dy (px) and the entry progress e.
 */
export function vis(t, tin, tout = null, dOut = 0.12) {
  const e = stepR(t - tin, { w: 26, z: 1 });
  const x = tout == null ? 0 : clamp((t - tout) / dOut);
  const xo = x * x;
  return { o: e * (1 - xo), b: (1 - e) * 10 + xo * 10, dy: (1 - e) * 16 - xo * 10, e };
}

/** Apply a vis() result to an element's style. */
export function applyVis(el, v) {
  el.style.opacity = v.o.toFixed(4);
  el.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : "none";
  el.style.transform = `translateY(${v.dy.toFixed(2)}px)`;
}

/**
 * Edge-split stretch (toggle knob, tab indicator): the leading edge on a stiff
 * spring, the trailing edge on a soft one. Returns {left, width}.
 */
export function stretchEdges(t, tStart, from, to, size, lead = { w: 34, z: 0.9 }, trail = { w: 19, z: 0.9 }) {
  const dir = Math.sign(to - from) || 1;
  const L0 = from, R0 = from + size, L1 = to, R1 = to + size;
  const fast = stepR(t - tStart, lead), slow = stepR(t - tStart, trail);
  const L = L0 + (L1 - L0) * (dir > 0 ? slow : fast);
  const R = R0 + (R1 - R0) * (dir > 0 ? fast : slow);
  return { left: L, width: R - L };
}

/**
 * Odometer digit position for place p (0 = units) when the counter shows v.
 * Returns a fractional digit 0–10: a digit only moves while the one below carries.
 * Render each place as a strip 0–9,0 and translate it by -value * slotHeight.
 */
export function odometerDigit(v, p) {
  const P = 10 ** p;
  return (Math.floor(v / P) % 10) + Math.max(0, (v % P) - (P - 1));
}

/** Ease-out quad, for counting v up to an exact integer. */
export const outQ = (x) => 1 - (1 - clamp(x)) ** 2;

/**
 * Sub-frame sample times for real motion blur: n samples per output frame,
 * centred on the frame time. Feed them to the page's seek(t), then average
 * with ffmpeg's tmix (see scripts/subframe-blur.sh).
 */
export function subT(i, fps = 60, n = 4) {
  return Math.floor(i / n) / fps + ((i % n) - (n - 1) / 2) / (fps * n);
}

/** Log-zoom camera: interpolate zoom in log space (linear zoom feels wrong). */
export function logZoom(z0, z1, k) {
  return Math.exp(Math.log(z0) + (Math.log(z1) - Math.log(z0)) * k);
}
