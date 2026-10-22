# dioramas — notes

**Source:** [blendi-remade/dioramas](https://github.com/blendi-remade/dioramas) @ `868539f`. Code MIT, © 2026 Blendi ([LICENSE](LICENSE)). The generated models and images upstream are CC BY 4.0 ([ASSET-LICENSES.md](ASSET-LICENSES.md)); none are copied here. Copied 22 October 2026.

## What it is

A framework for **cinematic, interactive 3D pages**, plus an **image-to-3D asset pipeline**. Upstream ships 20 example sites, each a fictional brand page whose 3D scene carries the whole page and moves with scroll and the pointer.

- **Stack:** vanilla three.js r186 (not R3F), pmndrs postprocessing, N8AO, GSAP (ScrollTrigger, SplitText), Lenis, Rapier and Vite.
- **Assets:** made with fal.ai, Nano Banana 2 for a product plate and then Meshy 7.1 for a PBR mesh.

## What is here

| Path | What it is |
|---|---|
| `src/core/engine.js` | Renderer, HDR half-float post stack (N8AO, mip bloom, AgX/ACES tone mapping, vignette, grain, chromatic aberration in its own pass, SMAA), procedural studio environment map, `normalize`/`prepModel`, damp and smoothstep helpers |
| `src/core/volumetric.js` | Raymarched volumetric spotlights as a post effect (up to 4, stopping at scene depth) |
| `src/core/reflector.js` | Planar reflections blurred by the floor's roughness |
| `src/core/textures.js` | GPU-baked tileable fbm and ridge noise |
| `src/core/assets.js` | GLTF, meshopt and KTX2 loading with byte-weighted progress; `sampleSurface` for particles |
| `src/core/scroll.js`, `input.js`, `ui.js` | Lenis + ScrollTrigger + SplitText reveals; damped pointer; preloader, cursor, magnetic buttons |
| `scripts/gen.mjs`, `fal.mjs` | **Asset generation.** Image jobs → Nano Banana 2 (`/edit` variant too), mesh jobs → Meshy 7.1 image-to-3D or multi-image-to-3D. Request IDs are written to `assets/manifest.json` before polling, so a crashed run resumes without paying twice |
| `scripts/optimize.mjs`, `optimize-all.mjs` | gltf-transform: weld, simplify, textures to WebP, meshopt (about 25 MB → 3–8 MB per model) |
| `scripts/shot.mjs`, `review.mjs`, `contact.mjs`, `model-sheet.mjs`, `thumbs.mjs`, `spot.mjs`, `errors.mjs` | Playwright QA: screenshots at scroll stops, an 8-stop desktop + mobile review sheet with fps, contact sheets, model sheets |
| `scripts/render-video.mjs`, `scripts/capture/virtual-time.js` | **Added here:** deterministic video capture (below) |
| `docs/ENGINE.md` | The method the pages were built with: core API, rules for agents working in parallel, an 11-point art-director bar, gotchas |
| `docs/briefs/` | 19 one-page creative briefs, one per example |
| `assets/jobs/` | The image and mesh prompts for every asset (the job files `gen.mjs` reads) |
| `examples/reliquary/` | The reference implementation `ENGINE.md` tells you to read first |
| `examples/abyssal/`, `keeper/`, `horologie/` | Three examples as code: a deep-sea dive with cursor-steered floodlights (volumetrics), a lighthouse in a storm (beams, sky, audio), a watch movement taken apart (assembly, studio light) |
| `examples/artemis/tools/` | Merges a Meshy rigged character with its walk, run and idle clips |
| `examples/_viewer/` | A GLB viewer page |

## Rendering a diorama to video

As shipped, a diorama can only be screen-recorded. Its clocks are live, 52 files call an unseeded `Math.random`, and scroll, pointer and physics state build up frame by frame.

`scripts/render-video.mjs` fixes that without touching the pages:

- **Virtual time.** It injects `scripts/capture/virtual-time.js` before any page script. That script freezes `performance.now`, `Date`, `requestAnimationFrame` and timers, seeds `Math.random`, and pauses CSS and Web Animations.
- **Frame stepping.** It then steps time one frame at a time, drives scroll and the pointer from keyframes, and pipes a screenshot of each frame to ffmpeg.

Same page + same options give the same frames. It was tested on a test page that uses the same patterns: three.js with a Clock loop, a GSAP tween, Lenis on the GSAP ticker, timers, a CSS transition and a preloader. Two runs were byte-identical over 60 frames; a different seed changed every frame. It was **not** run on the examples here, because their models are not in this repo.

```
npm install
npm run dev                                   # Vite on http://127.0.0.1:5190
node scripts/render-video.mjs http://127.0.0.1:5190/examples/keeper/ out/keeper.mp4 \
     --duration 12 --fps 30 --w 1920 --h 1080 \
     --scroll "0:0,2:0,10:1" --pointer "0:0.5,0.5;6:0.3,0.4" --click 7.5 --seed 7
```

- **`--scroll` and `--pointer`** are keyframes (`time:value`), smoothstep-interpolated.
- **`--ready`** is a JS expression that says the page has finished loading. The default waits until no preloader element is left.
- **`--lead`** plays seconds after ready before recording starts.
- **`--stills 2,6.5`** writes single PNG frames instead of a film.

Notes:

- **What is deterministic.** Recording is deterministic from its first frame. The loader before it runs on real network time, and the script reports how many warm-up frames it needed.
- **No seeking.** Frames play forward from the start; there is no random access as with `renderAt(t)` in `../mg-styles-15/harness/render.mjs`.
- **Windows.** The default GPU flag is `--use-angle=d3d11`, the same as upstream's QA scripts. Set `DIORAMA_CHROME` to a Chrome path if Playwright's `chrome` channel is not installed.
- **No GPU.** Set `DIORAMA_GPU_ARGS="--use-angle=swiftshader --enable-unsafe-swiftshader"` (slow).
- **Audio** pages that synthesise sound (`keeper`) are captured silent; add sound in the edit.

## Getting the models and images

The pages need the GLBs and images from upstream's `public/` (329 MB, CC BY 4.0). Fetch them with a sparse checkout:

```
git clone --depth 1 --filter=blob:none --sparse https://github.com/blendi-remade/dioramas dioramas-upstream
git -C dioramas-upstream sparse-checkout set public/models/abyssal public/models/keeper public/models/horologie public/models/reliquary public/img/keeper public/img/reliquary
cp -r dioramas-upstream/public ./public
```

Any film or page that shows these assets must credit "Dioramas (github.com/blendi-remade/dioramas)".

To make your own instead, put `FAL_KEY=…` in `.env`, write a job file like those in `assets/jobs/`, then:

```
node scripts/gen.mjs images assets/jobs/<file>.json
node scripts/gen.mjs meshes assets/jobs/<file>.json
node scripts/optimize.mjs <raw-model.glb> public/models/<slug>/<name>.glb
```

That costs about US$0.10 per image and US$1.20 per textured model (upstream's figures; the full set of 62 + 62 jobs cost about US$90). Check fal's and Meshy's terms for commercial and broadcast use of generated assets.

## When to use it

- **Hero objects and environments for explainers.** Generate a model from an image in minutes, light it with the studio environment, volumetrics and reflections, and render a camera move to video.
- **The post recipe.** `src/core/engine.js` (N8AO + bloom + AgX + grain + SMAA) and `volumetric.js` drop into any three.js page, including HyperFrames compositions.
- **Interactive web pieces.** Campaign landing pages and interactive explainers.

## Requirements

- Node 20+, `npm install`. three 0.186, postprocessing 6.39, n8ao 2, gsap 3.15 (GSAP's own free licence, not MIT), lenis, rapier 0.21, vite 8; for scripts: playwright, sharp, gltf-transform, meshoptimizer, @fal-ai/client.
- A desktop GPU. Pages target up to 45 MB downloads and were tuned on an RTX 4090 under Windows.
- `FAL_KEY` only for generating new assets.

## Changes from upstream

- **Removed.** The showcase index page (`index.html` and `src/index/`). `vite.config.js` now builds only `examples/*`.
- **Path fixes in `docs/ENGINE.md`.** Every `pages/` became `examples/`, the folder's real name. It still mentions `assets/src/` (the raw generated images, not shipped upstream either) and `shots/` (created by the QA scripts).
- **Added.** `scripts/render-video.mjs`, `scripts/capture/virtual-time.js` and the `render` npm script.
- **Left out.**
  - All of `public/` (models and images; see above).
  - `docs/media/`.
  - `assets/manifest.json` (110 KB of upstream request IDs).
  - 15 of the 20 examples. Fetch any of them from upstream; they need only `src/core/`.
  - Image files inside the copied examples.

## Cautions

- **Stale doc references.** `ENGINE.md` assumes a lead agent running the dev server and parallel agents editing pages; adapt that to a single session.
- **Rigged Meshy characters.** Their idle clips can have a broken hip scale, and rigged GLBs carry base colour only (upstream's own notes).
- **Volumetric haze** washes out the frame when the camera is inside a beam.
