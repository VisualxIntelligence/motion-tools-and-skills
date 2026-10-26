---
name: ogl-post-chain
description: Add an HDR post-processing chain (bloom with a Karis-weighted pyramid, chromatic aberration, ACES or Reinhard tone mapping, grade, vignette, frame-keyed film grain, FXAA) to a code-rendered OGL / WebGL2 motion scene, keeping every frame a pure function of time. Use when the user wants glow, neon, emissive or cinematic grading on an OGL scene in the ogl-time-pure starter, asks for bloom or post effects in headless-Chrome frame-by-frame rendering, or has bloom problems such as fireflies, flicker between frames or black blobs.
---

# OGL post chain

A small, dependency-free post stack for OGL that renders to video deterministically. It sits on top of the
`starters/ogl-time-pure/` project (same page contract as `tools/headless-render/render.mjs`).

```
scene → HDR target (RGBA16F) → bloom pyramid (6 levels) → composite + grade → FXAA → canvas
```

## Workflow

### 0. Get a project
Copy `starters/ogl-time-pure/` to a new folder and `npm install`. If it already exists, skip this.

### 1. Install the chain
```bash
node <skill-dir>/scripts/install.mjs <project-dir>
```
It copies `chain/chain.js` to `src/post/chain.js` and `examples/post-demo.js` to `scenes/post-demo.js`. It will not
overwrite a changed file without `--force`. To see it working, set `scene: 'post-demo'` in `src/config.js`.

### 2. Write the scene in linear HDR
- Emissive things output values above 1.0 (2 to 10 is typical; a hot accent 10 to 20). **Do not gamma-encode in
  scene shaders.** The composite tone maps and applies the sRGB encode once.
- `export const stage = { msaa: false };` from the scene. MSAA on the default framebuffer does nothing for the
  chain's offscreen targets; FXAA does the antialiasing.
- Keep non-emissive surfaces dark (0.01 to 0.2) so the glow reads. Bloom needs contrast.

### 3. Drive the chain from `t`
```js
const chain = new PostChain(gl, { width: stage.w, height: stage.h });
// in render(t, frame):
chain.params.exposure   = smoothstep(0, 0.7, t);       // fade in from black
chain.params.bloom      = 0.4 + 0.25 * pulse;          // pump on the beat
chain.params.aberration = 0.012 + 0.03 * pulse;
chain.render({ scene, camera, frame });                // frame = frame index, for grain
```
Params are read on every `render()`, so assign them absolutely from `t` like any other animated value. Never
accumulate.

| Param | Default | Notes |
|---|---|---|
| `exposure` | 1 | Multiplies scene + bloom before tone mapping. Use for fades. |
| `tone` | `'aces'` | `'aces'`, `'reinhard'` (keeps more highlight colour), `'none'` (clamp) |
| `bloom` | 0.6 | Bloom strength. 0.3 to 0.8 covers most looks. |
| `threshold`, `knee` | 1.0, 0.5 | Only pixels brighter than `threshold` bloom, with a soft knee. Raise to keep glow to the hottest things. |
| `scatter` | 0.7 | Higher = wider, softer glow; lower = tighter halo. |
| `maxIntensity` | 64 | Clamp per sample; stops one very hot pixel flickering the whole bloom. |
| `saturation`, `contrast`, `tint` | 1.05, 1.04, `[1,1,1]` | Grade. `tint` is a linear multiplier, e.g. `[1.05, 1, 0.92]` for warm. |
| `vignette`, `vignetteSoftness` | 0.35, 1.0 | |
| `aberration` | 0 | Chromatic aberration, zero at centre. 0.02 visible, 0.06 heavy. |
| `grain` | 0.035 | Film grain keyed to the frame index and stronger in shadows. |

Constructor options: `levels` (bloom pyramid depth, default 6; consider 7 at 4K, untested), `fxaa` (default true), `params`.

### 4. Check, look, render
```
npm run check     # seek-order determinism: must PASS
npm run sheet     # contact sheet; open the JPEG and look
node render.mjs --strip=2.0:2.5 --cols=6 --w=320 --out=out/check/strip.jpg    # motion and flicker
```
Look for: bloom pumping evenly (not strobing), no black or white blobs, highlights holding colour, dark areas not
banding, text and edges not shimmering. Then `npm run frames && npm run encode`.

## Why it is built this way (pitfalls it avoids)

- **Fireflies and flicker.** The first bloom level uses a Karis average (each 4-tap group weighted by 1 / (1 + luma)) and a per-sample clamp, so a single sub-pixel bright highlight cannot light up the whole frame on one frame and vanish on the next.
- **NaN and Inf blobs.** A single NaN pixel spreads through the blur into a large black or white square. The first level replaces NaN/Inf samples with zero. (The same pass, and the `?nantest=1` trick for provoking it, is described in `docs/reference-only.md` §2.)
- **Banding and shimmer.** HDR targets are half-float; the composite adds a triangular dither. Grain and dither use an integer PCG hash of pixel position and frame index, so they are identical on every GPU and identical when a frame is re-rendered. Never key grain to wall-clock time.
- **Stateless.** No temporal accumulation, no history buffers, no TAA. Each frame depends only on `t`, so `--frames --workers=4` and re-rendering a single frame both work.
- **WebGL2 only.** Needs `EXT_color_buffer_float`; the constructor throws if the context is WebGL1.

## Extending it

Add a pass by copying a `pass(...)` in `chain.js`: a fragment shader that reads the previous texture and a `render()` call. Good next additions that stay stateless: lens flare from the bloom texture, radial blur, film halation (tint the bloom red before compositing), a LUT grade. Anything that reads the previous frame (feedback, trails, TAA) is **not** stateless; render those with `--clip`, one worker, from t = 0.

## Files

- `chain/chain.js` — the `PostChain` class
- `examples/post-demo.js` — an 8 s neon scene using it
- `scripts/install.mjs` — copies both into a project
- `NOTES.md` — source, licence, what was tested
