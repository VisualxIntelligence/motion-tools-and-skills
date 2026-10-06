# Sources

The ten repositories surveyed on 6 October 2026, what was taken from each, and under which licence. Every copied folder carries its upstream `LICENSE` file and a `NOTES.md` naming the source commit.

| # | Repository | What it is | Licence | Commit | In this repo |
|---|---|---|---|---|---|
| 1 | [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | The Opus 5.5 "P(doom)" music video, every frame in code (p5.js + p5.brush) | **None** | `fa546a3` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#1-pdoomvideo--no-licence). Its engine is available, licensed, as #6. |
| 2 | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 475 viral Opus 5.5 videos with their prompts | MIT; prompts © their creators | `3d54892` | Link-only index of 40 motion prompts: [`prompts/video-prompts/yihui-prompt-index.md`](prompts/video-prompts/yihui-prompt-index.md) |
| 3 | [dgreenheck/tidewater](https://github.com/dgreenheck/tidewater) | A WebGPU fishing game built with Opus 5.5 | MIT (© DRG Software Solutions LLC); assets mixed | `4811ba4` | [`starters/tidewater-webgpu-fx/`](starters/tidewater-webgpu-fx/NOTES.md) (ocean, sky, post, engine, headless capture), [`tools/tidewater-asset-pipeline/`](tools/tidewater-asset-pipeline/NOTES.md) (audio, Blender) |
| 4 | [riba2534/claude-opus-5-5-demo](https://github.com/riba2534/claude-opus-5-5-demo) | Three 3D web games, one prompt each | **None** | `54adc1f` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#2-claude-opus-5-5-demo--no-licence) |
| 5 | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 43 film styles, each a short film made in code | MIT (© LemoLab); demo assets keep their own licences | `b65efe6` | [`prompts/film-styles/`](prompts/film-styles/README.md) (43 style prompts), [`tools/lemo-core/`](tools/lemo-core/NOTES.md) (render, audio, TTS, QA tools), [`skills/lemo-opuscar/`](skills/lemo-opuscar/NOTES.md), [`docs/guides/lemo-opuscar/`](docs/guides/lemo-opuscar/NOTES.md) |
| 6 | [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Starter kit for hand-painted cartoon animation | MIT (© John Heibel) | `0ac8bf2` | [`tools/headless-render/`](tools/headless-render/NOTES.md); the full kit is the template of [`skills/painted-animation/`](skills/painted-animation/NOTES.md) |
| 7 | [athemeroy/awesome-opus-5-5-videos](https://github.com/athemeroy/awesome-opus-5-5-videos) | Source-linked guide to 1,000+ videos | CC BY 4.0 (own writing and data only) | `0b96ca1` | [`docs/research/athemeroy/`](docs/research/athemeroy/NOTES.md), [`prompts/video-prompts/athemeroy-motion-cases.md`](prompts/video-prompts/athemeroy-motion-cases.md) |
| 8 | [diggerhq/shipvideo](https://github.com/diggerhq/shipvideo) | Paste a URL, Opus 5.5 writes an HTML launch video | **None** | `53d7c6f` | Reference only: [`docs/reference-only.md`](docs/reference-only.md#3-shipvideo-launchvideo--no-licence) |
| 9 | [makevoid/motion-graphics-music-video-skill](https://github.com/makevoid/motion-graphics-music-video-skill) | Song in, motion-graphics music video out | MIT (© makevoid) | `759ba6a` | [`skills/motion-graphics-music-video/`](skills/motion-graphics-music-video/NOTES.md) |
| 10 | [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | One Claude Code skill per video style | MIT (© tuzhechen2005; template parts © John Heibel) | `59744a6` | [`skills/kinetic-reel/`](skills/kinetic-reel/NOTES.md), [`skills/painted-animation/`](skills/painted-animation/NOTES.md) |

## What was left out, and why

- **Repos with no licence (1, 4, 8):** nothing copied. Their useful ideas are described in our own words, with upstream paths, in [`docs/reference-only.md`](docs/reference-only.md).
- **Third-party content inside licensed repos:** creator prompts (2, 7), a lyric video quoting a commercial song and a personal portfolio reel (10), and the Clawd character design (6, 10). Also in [`docs/reference-only.md`](docs/reference-only.md#4-third-party-material-inside-licensed-repos).
- **Size:** media (films, GIFs, stills, audio, models, HDRIs, sample packs, fonts), `node_modules` and lockfiles.

## Dependencies pulled in by the copied code (not stored here)

p5.js (LGPL-2.1), p5.brush (MIT), three.js (MIT), puppeteer-core and playwright-core (Apache-2.0), Python numpy, scipy, Pillow, soundfile, soxr, kokoro-onnx, edge-tts, faster-whisper, numba; Ruby excon, rake; system ffmpeg, ImageMagick, Chrome or Chromium, Blender.

## Updating from upstream

Each `NOTES.md` records the commit the copy was taken from. To refresh one, clone the upstream repo, diff against that commit, and re-apply the changes listed in the folder's *Changes from upstream* section.
