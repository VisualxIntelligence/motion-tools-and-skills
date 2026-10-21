# motion-tools-and-skills

Tools, agent skills, prompts and starters for making motion graphics with AI agents (Claude Code). The focus is code-rendered motion (Three.js + GSAP, HyperFrames, Remotion, Canvas, WebGL/WebGPU, p5.js) and agent-driven DCC tools (Blender, Unreal Engine, ComfyUI).

The first collection was gathered from ten open-source Opus 5.5 video projects on 6 October 2026, and a second pass on 21 October added six more and refreshed three ([`SOURCES.md`](SOURCES.md)). Everything copied here carries its upstream licence, and every folder has a `NOTES.md` that says what it does, when to use it, what it needs, and what was changed.

**New here? Read [`docs/techniques.md`](docs/techniques.md) first.** It distils the shared method behind all of these projects into working rules for our stack.

## What's inside

### [`skills/`](skills/README.md) — Claude Code skills

| Skill | Makes |
|---|---|
| [`kinetic-reel`](skills/kinetic-reel/NOTES.md) | Kinetic-typography reels and promos with three.js layers, a WebGL post pass and a synthesised beat-locked score |
| [`painted-animation`](skills/painted-animation/NOTES.md) | Hand-painted watercolour cartoons, music and lyric videos (p5.brush); includes the best animation guide in the survey |
| [`motion-graphics-music-video`](skills/motion-graphics-music-video/NOTES.md) | Full music videos from a song: plan, generated characters on green, p5 motion graphics, SFX and VFX (Fal.ai key; VFX on macOS) |
| [`lemo-opuscar`](skills/lemo-opuscar/NOTES.md) | Short films in any of 51 film styles, made entirely in code, including Evidence Films from real data; turn a style into a house style |
| [`3d-product`](skills/3d-product/NOTES.md) | Product and object films in Blender (Cycles or Octane), from a patent, photos or CAD to a graded film, with a measured gate at every stage |
| [`video-production-skills`](skills/video-production-skills/NOTES.md) | Eleven editorial skills: evidence-linked script, shot plan, explainer-motion brief, voice and caption sync, cover, release QA |

### [`prompts/`](prompts/README.md) — prompts and briefs

- [`film-styles/`](prompts/film-styles/README.md): 51 film-style prompts (satellite briefing, archive light table, Swiss motion, data storytelling, isometric infographic, dark keynote, spy titles, glass product, ukiyo-e…) in one reusable 11-section schema.
- [`starters/mg-styles-15/prompts/`](starters/mg-styles-15/prompts/): 15 motion-design style prompts with the source of every film they made, a template for new styles and an AI-jury review rubric.
- [`video-prompts/`](prompts/video-prompts/): 64 + 40 curated motion-design prompts and cases from two large collections of Opus 5.5 videos.

### [`tools/`](tools/README.md) — render, check and finish

- [`headless-render/`](tools/headless-render/NOTES.md): review sheets, frame strips, tracked crops and parallel rendering for any time-pure page; GPU probe for headless Chrome.
- [`lemo-core/`](tools/lemo-core/NOTES.md): parallel video render, reading-time check, loudness master with grain, procedural SFX, TTS with a Whisper check, three.js post and CRT passes.
- [`song-analysis/`](tools/song-analysis/NOTES.md): song → beat grid, downbeats, sections, per-instrument onsets from separated stems, loudness envelopes, and word-level lyric timing.
- [`tidewater-asset-pipeline/`](tools/tidewater-asset-pipeline/NOTES.md): CC0 sound sourcing and −23 LUFS normalisation; Blender batch retargeting to GLB and decimation.
- Plus beat detection, cut detection, green-screen keying, SFX mixing and a synth score inside the skills (listed in [`tools/README.md`](tools/README.md)).

### [`starters/`](starters/README.md) — templates to build on

- [`tidewater-webgpu-fx/`](starters/tidewater-webgpu-fx/NOTES.md): FFT ocean, physical sky, caustics, lens flare, motion blur and a full post chain in raw WebGPU/WGSL, with headless capture.
- [`pdoom-video-engine/`](starters/pdoom-video-engine/NOTES.md): a three.js engine for audio-driven films with adaptive per-tile motion blur, true 4K from a 1080p layout and an HDR post chain.
- [`mg-styles-15/`](starters/mg-styles-15/NOTES.md): 15 motion-design films with full source, a `renderAt(t)` render harness and the mgaudio soundtrack toolkit.
- [`papermotion/`](starters/papermotion/NOTES.md): a paper-cutout film engine with rigs, physics and simulation-driven sound, plus its skill.
- Pointers to the kinetic-reel, painted-cartoon, web-intro and p5-overlay templates inside the skills.

### [`docs/`](docs/README.md) — guides and research

- [`techniques.md`](docs/techniques.md): the shared method, applied to our tools.
- [`reference-only.md`](docs/reference-only.md): useful material that could **not** be copied (no licence, or third-party content), with where to find it.
- [`guides/lemo-opuscar/`](docs/guides/lemo-opuscar/NOTES.md): directing and pipeline guides for code-made films, and how to make a style your own.
- [`research/athemeroy/`](docs/research/athemeroy/NOTES.md): a study of 1,000+ agent-made videos, with a production brief, production paths, workflow analysis and data.

## Using a skill

Copy a skill folder into `%USERPROFILE%\.claude\skills\` (Windows) or symlink it into `~/.claude/skills/` (macOS, Linux, WSL), then describe the video you want in Claude Code. Details in [`skills/README.md`](skills/README.md#installing-a-skill).

## What stays out of git

Renders (`*.mp4`, `*.mov`, ProRes masters), Unreal caches (`DerivedDataCache/`, `Intermediate/`, `Saved/`, `Binaries/`), `node_modules/`, model weights, `.env` files and large media. See `.gitignore`.

## Licences

- **Our own writing** (this README, the `README.md` and `NOTES.md` files, `SOURCES.md`, `docs/techniques.md`, `docs/reference-only.md`, `prompts/video-prompts/yihui-prompt-index.md`): [MIT](LICENSE) © 2026 Ahmed Albadri.
- **Copied folders** keep their upstream licence: each has its own `LICENSE` file, and [`SOURCES.md`](SOURCES.md) lists them all. MIT for the code from lemo-opuscar, ClaudeAnimationBase, opus-video-skills, motion-graphics-music-video-skill, tidewater, pdoom-video, mg-styles-15, papermotion, 3d-product and video-production-skills; CC BY 4.0 for the athemeroy research and the adapted case list.
- Third-party assets fetched by these tools at install or render time (fonts, sample libraries, models) keep their own licences.
