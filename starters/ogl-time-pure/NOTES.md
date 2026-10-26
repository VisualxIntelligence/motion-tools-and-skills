# ogl-time-pure — notes

**Source:** [oframe/ogl](https://github.com/oframe/ogl) @ `385ce65` (v1.0.11, 13 Apr 2025), vendored unmodified in `vendor/ogl/src/`. OGL is **Unlicense** (public domain, [LICENSE-OGL](LICENSE-OGL)); upstream has no LICENSE file in the repo root, the grant is in its README and `package.json`. `render.mjs` is the ClaudeAnimationBase renderer, MIT, © 2026 John Heibel ([LICENSE](LICENSE)), the same file as `../../tools/headless-render/render.mjs`. Everything else here (`src/`, `scenes/`, `test/`, this file) is our own, MIT.

Upstream's example assets (models, textures, video, about 30 MB) are **not** copied: their provenance is not stated. Upstream ships no agent skills, prompts or starters, so this folder is written for this repo, not taken from them.

## What it is

A scaffold for code-rendered motion graphics on OGL, a 29 KB WebGL library with a three.js-like API and no dependencies. It gives you the page contract that `render.mjs` expects, so contact sheets, strips, crops, parallel frame rendering and ffmpeg encoding work unchanged, plus a seek-order check that proves every frame depends only on `t`.

Use it when three.js is more than the film needs: shader-heavy pieces, instanced particle fields, full-screen shaders, lightweight kinetic scenes, or anything you want to run with no build step. Use three.js (see `../../skills/kinetic-reel/`) when you need its loaders, materials or post stack.

## Layout

| Path | What it is |
|---|---|
| `studio.html` | The page `render.mjs` opens (adds `?render`). Without `?render` it shows a scrub slider for browser preview. |
| `src/config.js` | Size, fps, duration, which scene, audio file. The one file you edit to set up a film. |
| `src/stage.js` | The contract: creates the `Renderer`, calls `scene.render(t, frame)`, exposes `window.ready`, `renderAt`, `renderSheet`, `gpuInfo`, `DUR`, `PROJECT`. |
| `src/util.js` | Pure helpers: easing, seeded `mulberry32`, `seedOf(key)`, `frameIdx`, beat lock (`hit`). |
| `scenes/demo.js` | 8 s demo: backdrop shader, torus, 360 instanced boxes, formula camera, 120 bpm pulse. |
| `test/determinism.mjs` | Renders chosen times forwards, backwards and repeated; fails if any repeat differs by a byte. |
| `render.mjs` | The shared renderer (sheet, strip, stills, frames, clip, encode). |
| `vendor/ogl/` | OGL source, unmodified. Imports are relative, so it works from `file://` with no bundler and no network. |

## How a scene is written

```js
export const stage = { msaa: false };                 // optional: options for createStage
export default function setup({ gl, stage }) {
  // build cameras, meshes, programs once; load assets here (setup may be async)
  return {
    dur: 8,                                           // optional, defaults to PROJECT.dur
    render(t, frame) {                                // draw time t; touch nothing else
      program.uniforms.uTime.value = t;
      mesh.rotation.y = t * 0.8;                      // absolute, never +=
      stage.renderer.render({ scene, camera });
    },
  };
}
```

Rules, each of which the demo follows:

- No `requestAnimationFrame`, `Date`, `performance.now`, `Math.random` or `x += dt`. Assign every animated value from `t`. A frame rendered twice, or after seeking elsewhere, must match to the byte.
- Seeded randomness only, baked once at setup (`mulberry32`, or `seedOf('name')` per element) into an attribute or array.
- Put per-instance motion in the vertex shader as a function of `uTime` and a per-instance attribute. A field of thousands costs one draw call and no JavaScript per frame.
- Keyframe animation extras (`Animation`, `GLTFAnimation`) are fine because they take an absolute time: call `animation.update(t)`, not an accumulating delta.
- Keep the camera and lights on the frame clock (every frame); step characters on twos only if the style wants it (`floor(t * 12) / 12`).
- **Stateful effects break parallel rendering.** `Flowmap`, the fluid-distortion example and `GPGPU` read the previous frame, so a frame is not a function of `t` alone. Render those sequentially from t = 0 with a scripted pointer path (`render.mjs --clip` is one worker), or replay deterministically from the start; do not use `--frames --workers`.

## Running it

```
npm install                       # puppeteer-core only
npm run check                     # seek-order determinism check
npm run sheet                     # contact sheet → out/check/sheet.jpg (open it and look)
node render.mjs --stills=2,5 --out=out/stills
node render.mjs --strip=2.0:2.5 --cols=6 --w=320 --out=out/check/strip.jpg
npm run frames && npm run encode  # parallel, resumable frames then MP4 (add --audio=song.mp3)
npm run clip                      # straight to MP4, one worker
```

Chrome: set `CHROME_PATH` or pass `--chrome=<path>`; Playwright's Chromium is found automatically. No GPU: add `--soft-gl` (works, but about 1.2 s per 1080p frame for the demo; a real GPU is far faster). Run `../../tools/headless-render/gpu_probe.mjs <chrome>` on any render machine, because headless Chrome silently falls back to software.

Browser preview: serve the folder (`npx serve .`) and open `studio.html`, or `studio.html?scene=<name>&t=2.5`. Opened over `file://` module imports need `--allow-file-access-from-files`.

## Tested

On 26 Oct 2026, headless Chromium 156 with SwiftShader: `check` passes (11 renders, every repeat byte-identical), contact sheet and 1 s clip render (1920×1080, 24 fps H.264), parallel `--frames` writes the expected files. Not tested on a hardware GPU.

## Changes from upstream

None to OGL. `render.mjs` is unchanged; this folder's `studio.html` supplies the contract it needs. `--crop-at` (follow a world point through the camera) is not implemented in `renderSheet`; use `--crop=x,y,w,h`.

## Requirements

Node.js 20+, `puppeteer-core`, Chrome or Chromium, ffmpeg on the PATH (for `--clip` and `--encode`). A WebGL2 browser.
