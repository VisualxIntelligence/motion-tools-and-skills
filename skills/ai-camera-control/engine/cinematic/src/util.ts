// Pure helpers: everything in the film is a function of time, so any frame renders alone (Remotion renders out of order).
import * as THREE from "three";
import { ease, prog } from "./motion";   // one easing system for every piece

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const smoother = (x: number) => { const t = clamp(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
/** 0 before a, 1 after b: the kit's in-out curve (Remotion interpolate + Easing), in seconds */
export const ramp = (t: number, a: number, b: number) => prog(t * 1000, a * 1000, (b - a) * 1000, ease.inOut);   // in ms: the kit floors durations at 1
/** the kit's arrival curve: fast out of the gate, never overshoots */
export const arriveS = (t: number, a: number, b: number) => prog(t * 1000, a * 1000, (b - a) * 1000, ease.out);
export const window_ = (t: number, a: number, b: number, c: number, d: number) => ramp(t, a, b) * (1 - ramp(t, c, d));

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// value noise, 2D, smooth
const P = (() => { const r = rng(7); const p = Array.from({ length: 256 }, (_, i) => i); for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return [...p, ...p]; })();
const hash2 = (x: number, y: number) => P[(P[x & 255] + y) & 511] / 255;
export function noise2(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}
export const fbm = (x: number, y: number, oct = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f); a *= 0.5; f *= 2.03; } return s; };

/** Keyframed track, cubic Hermite with Catmull-Rom tangents in time: continuous position and velocity (no bumps).
 *  Ends have zero velocity unless `hold` is false (then the end tangent continues the last segment). */
export type Key<T> = { t: number; v: T };
function hermite(p0: number, m0: number, p1: number, m1: number, s: number) {
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
}
export function track(keys: Key<number[]>[], opts: { startVel?: "zero" | "free"; endVel?: "zero" | "free" } = {}) {
  const n = keys.length, dim = keys[0].v.length;
  const tang = keys.map((k, i) => {
    const out: number[] = [];
    for (let d = 0; d < dim; d++) {
      if (i === 0) out.push(opts.startVel === "free" && n > 1 ? (keys[1].v[d] - k.v[d]) / (keys[1].t - k.t) : 0);
      else if (i === n - 1) out.push(opts.endVel === "free" ? (k.v[d] - keys[i - 1].v[d]) / (k.t - keys[i - 1].t) : 0);
      else out.push((keys[i + 1].v[d] - keys[i - 1].v[d]) / (keys[i + 1].t - keys[i - 1].t));
    }
    return out;
  });
  return (t: number): number[] => {
    if (t <= keys[0].t) return keys[0].v.slice();
    if (t >= keys[n - 1].t) return keys[n - 1].v.slice();
    let i = 0;
    while (t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1], h = b.t - a.t, s = (t - a.t) / h;
    return a.v.map((_, d) => hermite(a.v[d], tang[i][d] * h, b.v[d], tang[i + 1][d] * h, s));
  };
}
export const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

/** full-frame focal length -> vertical fov (deg) on a 2.39:1 extraction of a 36 mm wide sensor */
export const ASPECT = 2.39;
export const lens = (mm: number) => (2 * Math.atan(36 / ASPECT / 2 / mm) * 180) / Math.PI;
