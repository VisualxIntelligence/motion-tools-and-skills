# build-sequence-film — notes

**Our own skill** (MIT, 22 November 2026). The idea of a one-take isometric build film, with line drawing first and colour last, comes from Chiang Ning's *isometric-build-film* (P413, Centre Pompidou). That file is "All Rights Reserved", so none of its text or code is used here; see [`../../guides/aec-ai-workflows/`](../../guides/aec-ai-workflows/NOTES.md).

## What it makes

A film of a building going up element by element, in one isometric camera move: foundations, then the frame storey by storey, with the envelope following two storeys behind, then the roof. It starts as a blue-ink line drawing and warms into the model's colours once the last element lands. Any size, including 1920×1080 and 1080×1920, at any frame rate. The frames are deterministic, so a changed model or timeline is a re-render, not a re-edit.

| File | What it does |
|---|---|
| `SKILL.md` | The workflow: get a model with named parts, generate and edit the timeline, check stills, render, label it as illustrative |
| `template/film.js` | The page: loads `model.glb` and `timeline.json` (or builds the timeline from node names), draws frame `t` with `renderFrame(t)`; also exposes `renderAt(t)` for the repo's review tools |
| `template/index.html` | Canvas and an import map for three.js from `node_modules` |
| `template/render.mjs` | Serves the folder over http, drives headless Chromium: `timeline`, `stills` (+ contact sheet), `film` (ffmpeg H.264) |
| `template/package.json` | `three` and `playwright` |

## When to use it

- **Launch, investor and tender films** for developers: how the building goes together, in 20–40 seconds.
- **Explainers** where a structure assembling is the point (a stadium bowl, a tower core, a bridge deck).
- **With [`../brief-to-ifc/`](../brief-to-ifc/NOTES.md)**: brief → IFC → GLB → film, in minutes, for a pitch before any design exists.

**Not for:** photoreal shots (use Blender, or anchor frames plus a video model; see the guide), or a real construction programme (the order is plausible, not planned).

## Requirements

Node 20+, ffmpeg on the PATH, and Chromium for Playwright (`npx playwright install chromium`). With `--gpu` it renders on the GPU (the RTX workstation); the default SwiftShader software renderer works anywhere but is slower.

## Tested here (22 Nov 2026, Linux, SwiftShader)

| Test | Result |
|---|---|
| Model | `brief-to-ifc`'s example office block: 584 elements, 6 storeys |
| `timeline` | 16 foundation, 251 structure, 312 envelope and 5 roof elements; the last element lands at 78% of the film |
| `stills` | Sheets checked by eye at 16:9 and 9:16: order, eases, framing and colour warm-up all correct |
| `film` | 14 s, 420 frames at 1920×1080, 30 fps: 298 s to render (0.7 s per frame in software), 17.5 MB |
| Determinism | Two renders of the same stills were byte-identical |

## Things the tests taught

- **three.js changes node names.** `GLTFLoader` turns spaces into underscores ("Base slab" → "Base_slab"), so the stage rules match both forms.
- **Fit the camera to the projected model, not its diagonal.** A fixed fraction of the bounding-box diagonal cropped the roof at the end. The page now projects the eight box corners for the current camera and adds an 8% margin.
- **Pin Playwright to the browser you have.** A fresh `npm install` pulled a newer Playwright than the installed Chromium build. Run `npx playwright install chromium` after installing.
- **ES modules do not load from `file://`.** The repo's `tools/headless-render` opens pages from disk, which blocks the three.js imports, so this skill serves its folder over local http instead.

## Changes you might want

- **A neighbourhood or site context.** Add context meshes to the GLB with names containing "context" and give them `fade` at t = 0, or add them in `film.js`.
- **Labels per phase** ("Structure", "Envelope"). Draw them over the canvas in `renderFrame(t)` from the timeline's stage spans.
- **A different look.** Edit `CFG` (paper, ink, shade) and the light at the top of `film.js`.
