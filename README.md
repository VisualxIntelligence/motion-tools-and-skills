# motion-tools-and-skills

Tools, agent skills, prompts and starters for making motion graphics with AI agents (Claude Code). The focus is code-rendered motion (Three.js + GSAP, HyperFrames, Remotion, Canvas, WebGL/WebGPU, p5.js) and agent-driven DCC tools (Blender, Unreal Engine, ComfyUI).

The first collection was gathered from ten open-source Opus 5.5 video projects on 6 October 2026, a second pass on 21 October added six more and refreshed three, a third on 22 October added five more, a fourth the same day added material from fifteen of twenty motion-skill repos, and a fifth on 4 November added the Anatomy isometric-explainer skill and a guide to React Bits, and a sixth on 14 November added dream-loop, Hairline, three of Meng To's skill sets and Emil Kowalski's choreography guides, a seventh on 15 November added dimensional drawings, a kinetic-type vault, a motion-study method, the Awwwards MCP and the new `design/` category, an eighth on 22 November added 28 Blender agent skills, Blender MCP setup notes, a scripted mesh pipeline and a guide to the Claude × Blender toolchain, and a ninth the same day started the `engineering/` category with our own build-sequence film and brief-to-IFC skills ([`SOURCES.md`](SOURCES.md)). Everything copied here carries its upstream licence, and every folder has a `NOTES.md` that says what it does, when to use it, what it needs, and what was changed.

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
| [`video-shotcraft`](skills/video-shotcraft/NOTES.md) | Promo films in Remotion from 124 shot recipe cards with tuned components; the cards also work as timing specs for GSAP and HyperFrames (Remotion Company Licence needed for organisational use) |
| [`img2threejs`](skills/img2threejs/NOTES.md) | One reference image → a code-only, rigged, animatable Three.js model, built in gated passes |
| [`lower-thirds`](skills/lower-thirds/NOTES.md) | Transparent lower thirds as ProRes 4444 / VP9 alpha, with alpha and title-safe checks |
| [`motion-design-principles`](skills/motion-design-principles/NOTES.md) | Durations, stagger, overshoot and choreography decided before code (LottieFiles) |
| [`opus-visual-motion-engine`](skills/opus-visual-motion-engine/NOTES.md) | HTML motion pieces with automated render QA (`qa.mjs`) |
| [`motion-designer`](skills/motion-designer/NOTES.md) | Code films and overlays with a determinism gate, beat clock and music cut to whole bars |
| [`talking-head-b-roll`](skills/talking-head-b-roll/NOTES.md) | Presenter graphics timed to the spoken words |
| [`claude-motion`](skills/claude-motion/NOTES.md) | Taste rules with numbers, a frame-review loop, sound from one `timeline.json` |
| [`hyperframes-motion-reel`](skills/hyperframes-motion-reel/NOTES.md) | Beat-locked reels in HyperFrames, with HyperFrames' rules and pitfalls |
| [`anatomy`](skills/anatomy/NOTES.md) | Isometric explainer figures: a technical idea drawn as a real, detailed machine with live parts, WebGL light and a readout; records to video |
| [`hairline`](skills/hairline/NOTES.md) | Isometric line figures that answer the pointer: one object, one gesture, one idea, in a single stroke; also turns an SVG logo into a live figure |
| [`dream-loop`](skills/dream-loop/NOTES.md) | High-fidelity 3D scenes built to a generated target screenshot until a fresh judge scores them 8/10; fal.ai image-to-3D helper |
| [`html-explainer-video`](skills/html-explainer-video/NOTES.md) | One-minute explainer films where the voice is the clock: every scene lands on its word, in any look and shape, rendered locally |
| [`html-demo`](skills/html-demo/NOTES.md) | A live app window that plays a product working, drawn in HTML from one clock; a crisp replacement for screen recordings |
| [`threejs-scene-fx`](skills/threejs-scene-fx/NOTES.md) | Five Three.js skills: a realistic ocean, underwater god rays, sky rays, a sky background and 200% rendering |
| [`dimensional-drawing`](skills/dimensional-drawing/NOTES.md) | Apple-style monochrome spec sheets of a UI component or product, and an 11 s film of the sheet drawing itself (camera pull-back, exploded layers); headless render |
| [`kinetic-type-vault`](skills/kinetic-type-vault/NOTES.md) | 39 ready-made kinetic-type effects (stamp, flip, rush, warp, roll, ransom note, word carousel…), each a skill with fixed steps, variables and a React template |
| [`blender-agent-skills`](skills/blender-agent-skills/NOTES.md) | 28 tested Blender 5.2/5.3 skills: modelling, retopology and UVs, PBR, baking, rigging, animation, time of day, weather, lookdev, rendering, environments, LODs, export to Unreal and web, and an asset QA gate |
| [`awwwards-motion-study`](skills/awwwards-motion-study/NOTES.md) | Learn a reference's motion from frames: record a motion-through pass, tile per element, write a motion inventory, rebuild, re-record and compare |

### [`design/`](design/README.md) — brand, type and design systems

Where a film's look comes from, before anything moves: the outputs feed motion tokens, lower thirds, idents and title styles.

- [`brand-identity/`](design/brand-identity/NOTES.md): two to four logo + type + palette sets from one brief, measured (contrast, colour blindness, glyph coverage, font licences), compared as cards; a guidelines kit with logo files and design tokens for the pick.
- [`make-font/`](design/make-font/NOTES.md): your own OFL font fitted to fonts you like, without tracing their outlines.
- [`awwwards-design-md/`](design/awwwards-design-md/NOTES.md): an evidence-backed DESIGN.md from any public URL.

### [`engineering/`](engineering/README.md) — architecture, engineering and construction

Buildings as the subject, for MAKEENA's real-estate films and AEC explainers. Studies and visualisations only, never engineering advice.

- [`build-sequence-film/`](engineering/skills/build-sequence-film/NOTES.md): a model goes up element by element in build order, in one isometric take, line drawing warming into colour; 16:9 or 9:16, deterministic frames.
- [`brief-to-ifc/`](engineering/skills/brief-to-ifc/NOTES.md): a brief as numbers → a schema-valid IFC4 model (grid, footings, frame, slabs, core, facade with windows) for Revit or Archicad, plus a named GLB for the film.
- [`guides/aec-ai-workflows/`](engineering/guides/aec-ai-workflows/NOTES.md): nine AEC visualisation workflows (Chiang Ning's pack, linked not copied), the Revit and Archicad MCP servers, and the safety line for structural tools.

### [`prompts/`](prompts/README.md) — prompts and briefs

- [`film-styles/`](prompts/film-styles/README.md): 51 film-style prompts (satellite briefing, archive light table, Swiss motion, data storytelling, isometric infographic, dark keynote, spy titles, glass product, ukiyo-e…) in one reusable 11-section schema.
- [`starters/mg-styles-15/prompts/`](starters/mg-styles-15/prompts/): 15 motion-design style prompts with the source of every film they made, a template for new styles and an AI-jury review rubric.
- [`video-prompts/`](prompts/video-prompts/): 64 + 40 curated motion-design prompts and cases from two large collections of Opus 5.5 videos.

### [`tools/`](tools/README.md) — render, check and finish

- [`headless-render/`](tools/headless-render/NOTES.md): review sheets, frame strips, tracked crops and parallel rendering for any time-pure page; GPU probe for headless Chrome.
- [`lemo-core/`](tools/lemo-core/NOTES.md): parallel video render, reading-time check, loudness master with grain, procedural SFX, TTS with a Whisper check, three.js post and CRT passes.
- [`song-analysis/`](tools/song-analysis/NOTES.md): song → beat grid, downbeats, sections, per-instrument onsets from separated stems, loudness envelopes, and word-level lyric timing.
- [`tidewater-asset-pipeline/`](tools/tidewater-asset-pipeline/NOTES.md): CC0 sound sourcing and −23 LUFS normalisation; Blender batch retargeting to GLB and decimation.
- [`sync-check/`](tools/sync-check/NOTES.md): sound against picture in a rendered MP4 (off-beat hits, startling jumps).
- [`mixamo-retarget/`](tools/mixamo-retarget/NOTES.md): human joints → animated Mixamo character GLB, in numpy, without Blender.
- [`awwwards-mcp/`](tools/awwwards-mcp/NOTES.md): award-winning web references, and motion measurement of any page (motion DNA, scroll and hover census, motion-through recordings, GSAP stubs). Install notes only; the server installs from npm.
- [`blender-mcp/`](tools/blender-mcp/NOTES.md): setup notes for the MCP server that lets Claude drive an open Blender (installed with uv, not copied), with its telemetry and safe-mode settings.
- [`mesh-pipeline/`](tools/mesh-pipeline/NOTES.md): our own tested scripts for generated and scanned meshes outside Blender: Tripo text/image → GLB, a build123d code-CAD prop, PyMeshLab cleanup, xatlas UVs, meshoptimizer LOD chains.
- [`skills/3d-product/references/dsh-blender-modeling/`](skills/3d-product/references/dsh-blender-modeling/NOTES.md): Blender modelling pitfalls, numeric gates, Blender 5.2 API breaks, three-view calibration, verifier checklist.
- Plus beat detection, cut detection, green-screen keying, SFX mixing and a synth score inside the skills (listed in [`tools/README.md`](tools/README.md)).

### [`starters/`](starters/README.md) — templates to build on

- [`tidewater-webgpu-fx/`](starters/tidewater-webgpu-fx/NOTES.md): FFT ocean, physical sky, caustics, lens flare, motion blur and a full post chain in raw WebGPU/WGSL, with headless capture.
- [`pdoom-video-engine/`](starters/pdoom-video-engine/NOTES.md): a three.js engine for audio-driven films with adaptive per-tile motion blur, true 4K from a 1080p layout and an HDR post chain.
- [`mg-styles-15/`](starters/mg-styles-15/NOTES.md): 15 motion-design films with full source, a `renderAt(t)` render harness and the mgaudio soundtrack toolkit.
- [`papermotion/`](starters/papermotion/NOTES.md): a paper-cutout film engine with rigs, physics and simulation-driven sound, plus its skill.
- [`dioramas/`](starters/dioramas/NOTES.md): cinematic 3D pages with volumetric light, reflections and an AgX post stack; image → 3D assets through fal (Nano Banana 2 → Meshy 7.1); deterministic video capture of any live-clock page (dioramas, Anatomy figures, React Bits components), with `--scale` and `--clip`.
- Pointers to the kinetic-reel, painted-cartoon, web-intro and p5-overlay templates inside the skills.

### [`docs/`](docs/README.md) — guides and research

- [`techniques.md`](docs/techniques.md): the shared method, applied to our tools.
- [`reference-only.md`](docs/reference-only.md): useful material that could **not** be copied (no licence, or third-party content), with where to find it.
- [`guides/lemo-opuscar/`](docs/guides/lemo-opuscar/NOTES.md): directing and pipeline guides for code-made films, and how to make a style your own.
- [`guides/`](docs/README.md): motion fundamentals (iart.ai), field rules for code films (Howseen), effect recipes, news-insert rules, motion tokens, Disney principles in frames.
- [`guides/emil-kowalski/`](docs/guides/emil-kowalski/NOTES.md): Emil Kowalski's choreography rules (what leads, what follows, what stays still), a build-in-order animation guide with exact curves, and a glossary that names any motion effect for a prompt.
- [`guides/react-bits/`](docs/guides/react-bits/NOTES.md): using React Bits backgrounds and text effects in films (loop export, frame-exact capture, picks, licence limits); nothing copied.
- [`guides/blender-3d-toolchain/`](docs/guides/blender-3d-toolchain/NOTES.md): fourteen Claude × Blender and 3D asset projects (Blender MCP, Blender skills, build123d, Tripo, AutoRemesher, RetopoFlow, PyMeshLab, xatlas, Material Maker, ArmorPaint, meshoptimizer, glTF-Transform…): which step each serves, licence, whether it still works.
- [`research/athemeroy/`](docs/research/athemeroy/NOTES.md): a study of 1,000+ agent-made videos, with a production brief, production paths, workflow analysis and data.

## Using a skill

Copy a skill folder into `%USERPROFILE%\.claude\skills\` (Windows) or symlink it into `~/.claude/skills/` (macOS, Linux, WSL), then describe the video you want in Claude Code. Details in [`skills/README.md`](skills/README.md#installing-a-skill).

## What stays out of git

Renders (`*.mp4`, `*.mov`, ProRes masters), Unreal caches (`DerivedDataCache/`, `Intermediate/`, `Saved/`, `Binaries/`), `node_modules/`, model weights, `.env` files and large media. See `.gitignore`.

## Licences

- **Our own writing** (this README, the `README.md` and `NOTES.md` files, `SOURCES.md`, `docs/techniques.md`, `docs/reference-only.md`, `prompts/video-prompts/yihui-prompt-index.md`, and the scripts added to copied folders: `starters/dioramas/scripts/render-video.mjs`, `starters/dioramas/scripts/capture/virtual-time.js`, `skills/video-shotcraft/assets/scripts/build-card-index.py`, everything in `tools/mesh-pipeline/`, and everything in `engineering/`): [MIT](LICENSE) © 2026 Ahmed Albadri. English translations of copied material stay under that material's upstream licence.
- **Copied folders** keep their upstream licence: each has its own `LICENSE` file, and [`SOURCES.md`](SOURCES.md) lists them all. MIT for the code from lemo-opuscar, ClaudeAnimationBase, opus-video-skills, motion-graphics-music-video-skill, tidewater, pdoom-video, mg-styles-15, papermotion, 3d-product, video-production-skills, dioramas and the dsh-blender-plugin modelling notes; Apache-2.0 for video-shotcraft, img2threejs and the Motion2MixamoRig retarget core; MIT for the fourth-survey skills, tools and guides (LottieFiles, iart.ai, Lob0Garou, kaventro, whaleyxbt, Sunwood AI Labs, Howseen, charlie947, Promptible, Dylan Tarre) and for Anatomy (© Ryan); MIT for the sixth-survey skills and guides (dream-loop © Anshu Chimala, Hairline © Lucas Marques, Emil Kowalski, Meng To, and Leon Lin's sound effects); MIT for the seventh-survey skills (dimensional-drawing © Enes Ozturk, design.how © Arlan Marat, brand-identity © Fatih Aydost, awwwards-skills © Afjal); MIT for the Blender agent skills (© EL4CTEO); CC0 for the motion-token files; CC BY 4.0 for the athemeroy research and the adapted case list.
- Third-party assets fetched by these tools at install or render time (fonts, sample libraries, models) keep their own licences.
