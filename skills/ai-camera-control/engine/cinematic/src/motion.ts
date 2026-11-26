// The three motion helpers the engine uses: an easing set, a clamped progress ramp and the soft blur-in used for slates and titles.
// Pure functions of the frame. (Copied in from the Keyframes motion kit so this engine stands alone.)
import type { CSSProperties } from "react";
import { Easing, interpolate } from "remotion";

export const ease = {
  out: Easing.out(Easing.cubic),
  outHard: Easing.out(Easing.exp),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  back: Easing.out(Easing.back(1.6)),
  linear: Easing.linear,
};

/** 0 to 1 between start and start+dur, clamped */
export const prog = (f: number, start: number, dur: number, easing: (n: number) => number = ease.out) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** arrives in place, out of focus */
export function blurIn(f: number, start: number, o: { dur?: number; blur?: number; rise?: number; scaleFrom?: number } = {}): CSSProperties {
  const p = prog(f, start, o.dur ?? 7);
  const s = (o.scaleFrom ?? 1) + (1 - (o.scaleFrom ?? 1)) * p;
  return {
    opacity: p,
    filter: p < 1 ? `blur(${((1 - p) * (o.blur ?? 12)).toFixed(2)}px)` : undefined,
    transform: `translateY(${((1 - p) * (o.rise ?? 0)).toFixed(2)}px) scale(${s.toFixed(4)})`,
  };
}
