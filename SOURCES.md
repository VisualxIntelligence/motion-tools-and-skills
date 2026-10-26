# Sources

The repositories surveyed on 6 October 2026 (1–10), 21 October 2026 (11–19) and 26 October 2026 (20), what was taken from each, and under which licence. Every copied folder carries its upstream `LICENSE` file and a `NOTES.md` naming the source commit.

| # | Repository | What it is | Licence | Commit | In this repo |
|---|---|---|---|---|---|
| 1 | [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | The Opus 5.5 "P(doom)" music video, every frame in code (p5.js + p5.brush) | **None** | `fa546a3` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#1-pdoomvideo--no-licence). Its engine is available, licensed, as #6. |
| 2 | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 703 viral Opus 5.5 videos with their prompts | MIT; prompts © their creators | `3d54892`; rechecked at `92aee2f` (21 Oct) | Link-only index of 64 motion prompts (24 added 21 Oct): [`prompts/video-prompts/yihui-prompt-index.md`](prompts/video-prompts/yihui-prompt-index.md) |
| 3 | [dgreenheck/tidewater](https://github.com/dgreenheck/tidewater) | A WebGPU fishing game built with Opus 5.5 | MIT (© DRG Software Solutions LLC); assets mixed | `4811ba4` | [`starters/tidewater-webgpu-fx/`](starters/tidewater-webgpu-fx/NOTES.md) (ocean, sky, post, engine, headless capture), [`tools/tidewater-asset-pipeline/`](tools/tidewater-asset-pipeline/NOTES.md) (audio, Blender) |
| 4 | [riba2534/claude-opus-5-5-demo](https://github.com/riba2534/claude-opus-5-5-demo) | Three 3D web games, one prompt each | **None** | `54adc1f` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#2-claude-opus-5-5-demo--no-licence) |
| 5 | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 51 film styles, each a short film made in code | MIT (© LemoLab); demo assets keep their own licences | `b65efe6`; updated from `b5e8ef9` (21 Oct: 8 Evidence Films styles, `MY-STYLES.md`, updated guides, `SKILL.md`, `readcheck.mjs`) | [`prompts/film-styles/`](prompts/film-styles/README.md) (43 style prompts), [`tools/lemo-core/`](tools/lemo-core/NOTES.md) (render, audio, TTS, QA tools), [`skills/lemo-opuscar/`](skills/lemo-opuscar/NOTES.md), [`docs/guides/lemo-opuscar/`](docs/guides/lemo-opuscar/NOTES.md) |
| 6 | [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Starter kit for hand-painted cartoon animation | MIT (© John Heibel) | `0ac8bf2` | [`tools/headless-render/`](tools/headless-render/NOTES.md); the full kit is the template of [`skills/painted-animation/`](skills/painted-animation/NOTES.md) |
| 7 | [athemeroy/awesome-claude-5-5-videos](https://github.com/athemeroy/awesome-claude-5-5-videos) (renamed from `awesome-opus-5-5-videos`) | Source-linked guide to 1,000+ videos | CC BY 4.0 (own writing and data only) | `0b96ca1`; updated from `87e5cbf` (21 Oct: 4 new documents, revised cases) | [`docs/research/athemeroy/`](docs/research/athemeroy/NOTES.md), [`prompts/video-prompts/athemeroy-motion-cases.md`](prompts/video-prompts/athemeroy-motion-cases.md) |
| 8 | [diggerhq/shipvideo](https://github.com/diggerhq/shipvideo) | Paste a URL, Opus 5.5 writes an HTML launch video | **None** | `53d7c6f` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#3-shipvideo-launchvideo--no-licence) |
| 9 | [makevoid/motion-graphics-music-video-skill](https://github.com/makevoid/motion-graphics-music-video-skill) | Song in, motion-graphics music video out | MIT (© makevoid) | `759ba6a` | [`skills/motion-graphics-music-video/`](skills/motion-graphics-music-video/NOTES.md) |
| 10 | [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | One Claude Code skill per video style | MIT (© tuzhechen2005; template parts © John Heibel) | `59744a6` | [`skills/kinetic-reel/`](skills/kinetic-reel/NOTES.md), [`skills/painted-animation/`](skills/painted-animation/NOTES.md) |

| 11 | [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) | A code-rendered music video (three.js) with word-synced typography | MIT (© Giacomo Magnanini); song, lyrics and lyric data excluded | `fa164b7` | [`tools/song-analysis/`](tools/song-analysis/NOTES.md), [`starters/pdoom-video-engine/`](starters/pdoom-video-engine/NOTES.md); scenes and treatment in [`docs/reference-only.md`](docs/reference-only.md#5-pdoom-video--third-party-song-material) |
| 12 | [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | 15 motion-design styles, one 10 s film each, with prompts and source | MIT (© Vincentwei1021); samples, HDRI and photos CC0 or public domain | `49052d8` | [`starters/mg-styles-15/`](starters/mg-styles-15/NOTES.md) (prompts, rubric, template, harness, mgaudio, demo source) |
| 13 | [francozanardi/papermotion](https://github.com/francozanardi/papermotion) | A paper-cutout animation engine built for agents | MIT (© Franco Zanardi) | `433e7ce` | [`starters/papermotion/`](starters/papermotion/NOTES.md) |
| 14 | [nicceasy/3d-product](https://github.com/nicceasy/3d-product) | One-shot pipeline for hardware product films in Blender | MIT (© Nick Conn) | `b7e2025` | [`skills/3d-product/`](skills/3d-product/NOTES.md) |
| 15 | [Ucmp0001/video-production-skills](https://github.com/Ucmp0001/video-production-skills) | Eleven composable video-production skills | MIT (© contributors; method credits to simon-skills, MIT) | `ea682de` | [`skills/video-production-skills/`](skills/video-production-skills/NOTES.md) |
| 16 | [joeseesun/opus-video-prompts](https://github.com/joeseesun/opus-video-prompts) | 18 prompts and 54 cases of Opus 5.5 code-rendered video (Chinese) | **None** | `7977c80` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#6-opus-video-prompts--no-licence) |
| 17 | [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | (#1, rechecked) | **None** | `fa546a3` | Unchanged; still reference only |
| 18 | [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | (#6, rechecked) | MIT | `0ac8bf2` | Unchanged since our copy |
| 19 | X post by @beamnxw, "Motion Engineering with Opus 5.5: Build Launch Videos You Can Sell" | A post, not a repo | — | — | Not reachable for automated reading (X blocks it); not reviewed |
| 20 | [oframe/ogl](https://github.com/oframe/ogl) | A minimal WebGL library (29 KB, three.js-like API) with about 50 examples; no agent skills, prompts or starters of its own | Unlicense (public domain; grant is in the README and `package.json`, no LICENSE file in the repo root); example assets not covered | `385ce65` (v1.0.11) | [`starters/ogl-time-pure/`](starters/ogl-time-pure/NOTES.md) (library vendored unmodified, plus a time-pure harness written here), [`skills/ogl-post-chain/`](skills/ogl-post-chain/NOTES.md) (new code; FXAA adapted from its example). Assets, models and the stateful examples (flowmap, fluid, GPGPU) not included |

Repos 13–15 were found through athemeroy's resource list (#7), which checked their licences on 11 October; we checked them again on 21 October.

## What was left out, and why

- **Repos with no licence (1, 4, 8, 16):** nothing copied. Their useful ideas are described in our own words, with upstream paths, in [`docs/reference-only.md`](docs/reference-only.md).
- **Third-party content inside licensed repos:** creator prompts (2, 7), a lyric video quoting a commercial song and a personal portfolio reel (10), the Clawd character design (6, 10, 13), and the song, lyrics and lyric-quoting scenes of a music video (11). Also in [`docs/reference-only.md`](docs/reference-only.md#4-third-party-material-inside-licensed-repos).
- **Size:** media (films, GIFs, stills, audio, models, HDRIs, sample packs, fonts), `node_modules` and lockfiles.

## Dependencies pulled in by the copied code (not stored here)

p5.js (LGPL-2.1), p5.brush (MIT), three.js (MIT), GSAP, d3 (ISC), opentype.js (MIT), puppeteer-core and playwright-core (Apache-2.0), Vite (MIT), Python numpy, scipy, Pillow, soundfile, soxr, librosa, pedalboard, demucs, torch and torchaudio, kokoro-onnx, edge-tts, faster-whisper, numba; Ruby excon, rake; system ffmpeg, ImageMagick, Chrome or Chromium, Blender; optionally DaVinci Resolve Studio and OctaneRender (commercial) for `3d-product`.

## Updating from upstream

Each `NOTES.md` records the commit the copy was taken from. To refresh one, clone the upstream repo, diff against that commit, and re-apply the changes listed in the folder's *Changes from upstream* section.
