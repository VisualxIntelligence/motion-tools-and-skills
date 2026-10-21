# pdoom-video-engine — notes

**Source:** [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) @ `fa164b7`: `app/src/engine/`, `app/src/main.ts`, `app/scripts/render.ts`, the app's config files, `analysis/make_fonts.py` and `docs/ENGINE.md`. MIT, © 2026 Giacomo Magnanini ([LICENSE](LICENSE)).

**This is a reference engine, not a ready-to-run template.** The 17 scene modules and the edit (`src/timeline.ts`) were left out because they quote the song's lyrics, which are not covered by the MIT licence. The fonts (OFL) and the song data are also not here. To see the whole thing run, clone the upstream repo; to build your own film on this engine, see *Running it* below.

## What it is

The engine behind a 2.5-minute code-rendered music video: TypeScript + three.js, run with bun and Vite. Every frame is a pure function of song time, so the browser preview and the offline 1080p60 or true-4K60 export are identical. [`docs/ENGINE.md`](docs/ENGINE.md) is the guide the lead agent wrote for the scene-writing sub-agents; read it first.

## The parts worth lifting

| Part | File | Why it matters |
|---|---|---|
| **Adaptive motion blur** | `src/engine/engine.ts` (`Engine.render`, `AdaptiveSampling`), `scripts/render.ts --samples auto` | Each frame averages sub-frames over a shutter, refining per 32×32 tile: 4 → 12 → 36 → 108 → 324 sub-frames, stopping when another step would change the tile by less than 3/255. Stopped tiles are masked with the depth buffer, so the GPU skips them. Still frames stop at 12, camera moves at 36, whips and slams at 108–324. Real motion blur at a fraction of the cost of a fixed high count. |
| **True 4K from 1080p layout** | `src/engine/gl.ts`, `scale.ts`, `ENGINE.md` ("Output scale") | Scenes lay out in 1920×1080 logical px; `--scale 2` renders every target, Canvas 2D layer, line and shader at 3840×2160. Includes a patched Canvas 2D context and `pxLine()` so hairlines don't thin out at 4K. |
| **HDR post chain** | `src/engine/post.ts` | Linear half-float targets, bloom with threshold and knee, film halation, chromatic aberration, tone shoulder, grain, vignette, shake, flash, zoom: each overridable per scene per frame. |
| **Audio-reactive data API** | `src/engine/audio.ts`, `lyrics.ts` | `beatAt(t)`, `barAt(t)`, `nearestBeat(t)`, `events('kick', t0, t1)`, `env('bass', t)`, `hit(kind, t, halfLife)`; lyrics found by content (`lyrics.get('a line')`), never by hard-coded time. Reads the JSON written by [`../../tools/song-analysis/`](../../tools/song-analysis/). |
| **GPU line batches** | `src/engine/lines.ts` | Capsule segments for 10k–200k lines in 2D or 3D, with glow (values > 1). |
| **Typography** | `src/engine/type.ts`, `stroke.ts` | Kerned glyph layout for per-glyph animation; text as outline paths or as points ("text made of atoms"); single-stroke plotter fonts written by a moving pen, synced to word timings. |
| **GLSL toolbox** | `src/engine/glsl/common.ts` | Noise, fbm, curl, 2D/3D SDFs, smooth-min, anti-aliased fills and strokes, hatching and engraving shading. |
| **Offline renderer** | `scripts/render.ts` | Headless Chrome via playwright-core, raw frames over WebSocket into one ffmpeg, several Chrome workers in order; modes `video`, `stills`, `sheet` (contact sheets, `--cuts` for every scene boundary), `perf`. |

Rules from `ENGINE.md` that apply to any time-pure renderer: flicker keyed to frames must use `frameIdx(t)` (constant over the shutter), not `floor(t * 60)`; noise seeded by continuous `t` makes the adaptive sampler work harder; stateful scenes (particles integrated over time) must use a fixed `--samples`.

## Running it

1. Copy this folder to a new project as `app/`, with `data/` and `audio/` beside it (`vite.config.ts` serves those two folders from the parent).
2. Fonts (all OFL, from Google Fonts): put the Archivo, Archivo Italic and Cormorant Garamond variable fonts and the IBM Plex Mono static TTFs in `public/fonts/src/`, then run `scripts/make_fonts.py` to cut the static instances `type.ts` loads (adjust its relative paths to your layout); put the Hershey/EMS stroke fonts (from the `hersheytext` package) in `public/fonts/stroke/`. Or change `type.ts` to your own fonts.
3. Run [`../../tools/song-analysis/`](../../tools/song-analysis/) on your track to get `data/audio.json` (and `data/lyrics.json` if it has vocals; otherwise give the engine an empty lyrics file).
4. Write `src/timeline.ts` (export `makeTimeline(lyrics, audio)` returning scene windows, ideally cut on downbeats) and at least one scene in `src/scenes/`, following the example in `ENGINE.md` ("Writing a scene").
5. Remove the P(doom) readout from `src/engine/hud.ts` (it looks up the song's title word).
6. `bun install`, `bunx vite`, then `bun scripts/render.ts stills --t 1,2,3` and `bun scripts/render.ts video --samples auto --shutter 0.2 --out ../out/film.mp4`.

## Requirements

bun, Google Chrome (driven through playwright-core), ffmpeg with libx264. Upstream rendered on an Apple M5 Pro; on Windows with an NVIDIA card, check which GPU headless Chrome lands on with [`../../tools/headless-render/gpu_probe.mjs`](../../tools/headless-render/gpu_probe.mjs).

## Changes from upstream

None to the copied files. Left out: `src/scenes/`, `src/timeline.ts`, `public/` (fonts and plate stills), `plates.json`, `bun.lock`, and `docs/TREATMENT.md` (the treatment quotes the lyrics; see [`../../docs/reference-only.md`](../../docs/reference-only.md#5-pdoom-video--third-party-song-material)).
