# tidewater-webgpu-fx — notes

**Source:** [dgreenheck/tidewater](https://github.com/dgreenheck/tidewater) @ `4811ba4`. MIT, © 2026 DRG Software Solutions LLC ([LICENSE](LICENSE)); third-party credits and papers in [CREDITS.md](CREDITS.md). The SMAA lookup textures in `public/textures/smaa/` come from three.js (MIT).

## What it is

The rendering side of Tidewater, a browser fishing game built with Claude Opus 5.5: a high-end, real-time ocean and sky in **raw WebGPU + WGSL** on a small custom engine. It is **not three.js** and does not use TSL, although the engine's CPU side copies the three.js API (`Vector3`, `Mesh`, `BufferGeometry`, `PerspectiveCamera`).

This folder keeps only the parts useful for motion graphics, with their engine, at their original paths so the imports resolve. The game itself (gameplay, UI, audio mixer, assets) is not included.

## What is in it

| Area | Files | What it gives you |
|---|---|---|
| Ocean | `src/ocean/OceanFFT.js` | Tessendorf FFT ocean, JONSWAP spectrum, four cascades (733 m to 7 m) in two compute passes; the header documents the WGSL sampling API |
| | `src/ocean/Caustics.js`, `ComputeMips.js` | Photon-splat caustics on two focal planes, tiling seamlessly (pools, underwater) |
| | `src/ocean/FoamTexture.js`, `SeaDetail.js` | GPU-generated tileable foam; wind gusts ("cat's paws"), slicks and windrows that break up tiling |
| Sky | `src/sky/Atmosphere.js` | Physically based sky (Hillaire 2020): transmittance, multi-scattering and sky-view lookup tables |
| | `src/sky/Sky.js` | Sun disk, procedural stars and Milky Way, moon, and `sunDirectionFromTime(hours, lat, decl)`, a ten-line solar model you can drive from a timeline |
| | `src/sky/Environment.js` | Sky → cube map, GGX prefilter and spherical-harmonic irradiance, spread over several frames |
| Post | `src/post/PostFX.js` | The full chain: GTAO → temporal upscale → bloom → grade (saturation, contrast, warmth, vignette, grain) → ACES, with auto-exposure and sharpening |
| | `src/post/MotionBlur.js` | Reconstruction-filter motion blur (McGuire 2012 / Jimenez 2014): film-look blur |
| | `src/post/LensFlare.js` | Physically motivated flare: aperture ghosts, halo, 14-spike starburst, veiling glare, GPU-measured occlusion |
| | `src/post/LensDroplets.js`, `AirHaze.js`, `Underwater.js`, `GTAO.js`, `AntiAlias.js`, `TemporalUpscale.js` | Lens droplets; aerial perspective and god rays; underwater with a split waterline; ambient occlusion; FXAA/SMAA; TAA upscale |
| Particles | `src/fx/AirMotes.js` | Camera-wrapped dust and pollen lit with forward scattering: cheap atmosphere for any 3D shot |
| Utilities | `src/engine/render/wgsl/common.js` | The best standalone file: MaterialX noise ported to WGSL (gradient, cell, Worley; bit-exact with three's `mx_*`), hashes, interleaved gradient noise, Vogel disk, normal perturbation, reversed-Z helpers |
| Capture | `src/core/BenchSeed.js`, `Bench.js`, `DebugViews.js` | Deterministic capture: seeded `Math.random`, a fixed time-step, a stopped render loop, image sequences; about 30 named camera "review views", each with a time of day (a pattern for repeatable shot lists). `Bench.js` posts frames to a local collector at 127.0.0.1:5190 that is not in the repo. |
| Headless | `test/headless.mjs`, `test/engine-smoke.mjs` | Renders WebGPU in **Node** with the `webgpu` (Dawn) package and writes PNGs: GPU rendering without a browser |
| Guide | `docs/PORTING.md` | A three.js/TSL → raw WebGPU/WGSL mapping table, WGSL naming conventions and pitfalls, and the headless test recipe. Written as instructions for parallel agent "streams"; a good model of an agent brief. |

## How to use it

- **Study and port.** Each module is a WGSL shader plus a little JS that depends on `src/engine/`. To use one in a three.js scene, lift the WGSL functions into three.js's `WebGPURenderer` (via `wgslFn()` / TSL), using `docs/PORTING.md` in reverse.
- **Render offline with the engine.** Use the headless Node path in `test/` to render frames with no browser.

There is no runnable demo page in this folder (the game's `index.html`, `main.js` and assets are upstream). To see everything running, clone upstream and run `npm install && npm run dev`, then open http://127.0.0.1:5189 (try `?fly`).

## Requirements

A WebGPU browser (Chrome or Edge) or Node with `webgpu` ^0.6.1; Vite for the upstream dev server. No runtime libraries.

## Not copied

Gameplay (`src/game/`, `src/audio/`, `src/ui/` and others), volumetric clouds (`src/sky/Clouds.js`, `SkyProClouds.js`), surf and wake simulations (`ShoreWaves.js`, `Breakers.js`, `WakeSim.js`), and about 100 MB of assets in `public/`. Those modules are worth reading upstream.
