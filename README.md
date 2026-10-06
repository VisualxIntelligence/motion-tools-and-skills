# motion-tools-and-skills

Tools, agent skills, prompts and starters for making motion graphics with AI agents (Claude Code). The focus is code-rendered motion (Three.js + GSAP, HyperFrames, Remotion, Canvas, WebGL/WebGPU, p5.js) and agent-driven DCC tools (Blender, Unreal Engine, ComfyUI).

The first collection was gathered from ten open-source Opus 5.5 video projects ([`SOURCES.md`](SOURCES.md)). Everything copied here carries its upstream licence, and every folder has a `NOTES.md` that says what it does, when to use it, what it needs, and what was changed.

**New here? Read [`docs/techniques.md`](docs/techniques.md) first.** It distils the shared method behind all of these projects into working rules for our stack.

## What's inside

### [`skills/`](skills/README.md) — Claude Code skills

| Skill | Makes |
|---|---|
| [`kinetic-reel`](skills/kinetic-reel/NOTES.md) | Kinetic-typography reels and promos with three.js layers, a WebGL post pass and a synthesised beat-locked score |
| [`painted-animation`](skills/painted-animation/NOTES.md) | Hand-painted watercolour cartoons, music and lyric videos (p5.brush); includes the best animation guide in the survey |
| [`motion-graphics-music-video`](skills/motion-graphics-music-video/NOTES.md) | Full music videos from a song: plan, generated characters on green, p5 motion graphics, SFX and VFX (Fal.ai key; VFX on macOS) |
| [`lemo-opuscar`](skills/lemo-opuscar/NOTES.md) | Short films in any of 43 film styles, made entirely in code |

### [`prompts/`](prompts/README.md) — prompts and briefs

- [`film-styles/`](prompts/film-styles/README.md): 43 film-style prompts (Swiss motion, data storytelling, isometric infographic, dark keynote, spy titles, glass product, ukiyo-e, risograph…) in one reusable 11-section schema.
- [`video-prompts/`](prompts/video-prompts/): 40 + 40 curated motion-design prompts and cases from two large collections of Opus 5.5 videos.

### [`tools/`](tools/README.md) — render, check and finish

- [`headless-render/`](tools/headless-render/NOTES.md): review sheets, frame strips, tracked crops and parallel rendering for any time-pure page; GPU probe for headless Chrome.
- [`lemo-core/`](tools/lemo-core/NOTES.md): parallel video render, reading-time check, loudness master with grain, procedural SFX, TTS with a Whisper check, three.js post and CRT passes.
- [`tidewater-asset-pipeline/`](tools/tidewater-asset-pipeline/NOTES.md): CC0 sound sourcing and −23 LUFS normalisation; Blender batch retargeting to GLB and decimation.
- Plus beat detection, cut detection, green-screen keying, SFX mixing and a synth score inside the skills (listed in [`tools/README.md`](tools/README.md)).

### [`starters/`](starters/README.md) — templates to build on

- [`tidewater-webgpu-fx/`](starters/tidewater-webgpu-fx/NOTES.md): FFT ocean, physical sky, caustics, lens flare, motion blur and a full post chain in raw WebGPU/WGSL, with headless capture.
- Pointers to the kinetic-reel, painted-cartoon, web-intro and p5-overlay templates inside the skills.

### [`docs/`](docs/README.md) — guides and research

- [`techniques.md`](docs/techniques.md): the shared method, applied to our tools.
- [`reference-only.md`](docs/reference-only.md): useful material that could **not** be copied (no licence, or third-party content), with where to find it.
- [`guides/lemo-opuscar/`](docs/guides/lemo-opuscar/NOTES.md): directing and pipeline guides for code-made films.
- [`research/athemeroy/`](docs/research/athemeroy/NOTES.md): a study of 1,000+ agent-made videos, with a production brief and data.

## Using a skill

Copy a skill folder into `%USERPROFILE%\.claude\skills\` (Windows) or symlink it into `~/.claude/skills/` (macOS, Linux, WSL), then describe the video you want in Claude Code. Details in [`skills/README.md`](skills/README.md#installing-a-skill).

## What stays out of git

Renders (`*.mp4`, `*.mov`, ProRes masters), Unreal caches (`DerivedDataCache/`, `Intermediate/`, `Saved/`, `Binaries/`), `node_modules/`, model weights, `.env` files and large media. See `.gitignore`.

## Licences

- **Our own writing** (this README, the `README.md` and `NOTES.md` files, `SOURCES.md`, `docs/techniques.md`, `docs/reference-only.md`, `prompts/video-prompts/yihui-prompt-index.md`): [MIT](LICENSE) © 2026 Ahmed Albadri.
- **Copied folders** keep their upstream licence: each has its own `LICENSE` file, and [`SOURCES.md`](SOURCES.md) lists them all. MIT for the code from lemo-opuscar, ClaudeAnimationBase, opus-video-skills, motion-graphics-music-video-skill and tidewater; CC BY 4.0 for the athemeroy research and the adapted case list.
- Third-party assets fetched by these tools at install or render time (fonts, sample libraries, models) keep their own licences.
