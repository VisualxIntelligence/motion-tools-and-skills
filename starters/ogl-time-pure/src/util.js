// util.js: small pure helpers. Everything here is a function of its arguments only, so scenes stay
// a pure function of `t`.

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a, b, k) => a + (b - a) * k;
export const smoothstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
// spring-like overshoot written as a formula of t (not integrated frame by frame)
export const backOut = (k, s = 1.70158) => { k = clamp(k) - 1; return k * k * ((s + 1) * k + s) + 1; };

// Seeded random numbers. Call once at setup and bake the values into attributes or arrays.
// Never call Math.random() in a scene: a re-rendered frame would differ.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string key to a seed, so each named element gets its own stable stream.
export function seedOf(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// The frame a time belongs to. The epsilon keeps i / fps from rounding down to i - 1.
export const frameIdx = (t, fps) => Math.floor(t * fps + 1e-6);

// Beat lock without audio analysis: bpm and the offset of the first beat, both in the cue sheet.
export const beat = (t, bpm, offset = 0) => (t - offset) * bpm / 60;
export const hit = (t, bpm, offset = 0, k = 5) => Math.exp(-(((beat(t, bpm, offset) % 1) + 1) % 1) * k);
