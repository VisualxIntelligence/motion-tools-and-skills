# motion-tools-and-skills

Tools, agent skills, prompts and starters for making motion graphics with AI agents (Claude Code).

- **Code-rendered motion:** Three.js + GSAP, HyperFrames, Remotion, Canvas, WebGL/WebGPU, p5.js.
- **Agent-driven apps:** Blender, Unreal Engine, ComfyUI, DaVinci Resolve.
- **The films it is for:** launch films, news explainers and music videos, with QA gates, sound, captions and licence notes.

Everything copied here keeps its upstream licence. Every folder has a `NOTES.md` that says what it does, when to use it, what it needs and what was changed. Where each piece came from is in [`SOURCES.md`](SOURCES.md).

## Start here

1. **Read [`docs/techniques.md`](docs/techniques.md).** It distils the shared method behind all of these projects into working rules for our stack.
2. **Pick a skill** from the tables below and install it (see [Using a skill](#using-a-skill)).
3. **Check [`docs/reference-only.md`](docs/reference-only.md)** before reusing anything that isn't here: it lists useful material that could not be copied, and why.

## What's inside

| Folder | Holds |
|---|---|
| [`skills/`](skills/README.md) | 33 Claude Code skills that make films |
| [`design/`](design/README.md) | Brand, type, palette and design-system skills: where a film's look comes from |
| [`engineering/`](engineering/README.md) | Buildings as the subject: AEC films and models for MAKEENA |
| [`tools/`](tools/README.md) | Render, check, edit and finish: scripts, and notes for apps and MCP servers |
| [`starters/`](starters/README.md) | Engines and templates to build on |
| [`prompts/`](prompts/README.md) | Film-style prompts, briefs and curated video prompts |
| [`docs/`](docs/README.md) | Guides, grammars and research |

## [`skills/`](skills/README.md) — Claude Code skills

### Launch films and promos

| Skill | Makes |
|---|---|
| [`cinetic`](skills/cinetic/NOTES.md) | Launch, update and feature films from code (Remotion or HyperFrames): copy first, 466 devices, templates, licensed no-credit music, gates |
| [`product-launch-motion`](skills/product-launch-motion/NOTES.md) | UI launch films in one morphing shape, never cut: springs, blur swaps, a cursor driving everything, music first, sub-frame blur; our tested spring kit |
| [`saas-motion-video`](skills/saas-motion-video/NOTES.md) | Software promos with a gated playbook, 101 themes, 24 narrative transitions and a variety audit so no two films look alike |
| [`video-shotcraft`](skills/video-shotcraft/NOTES.md) | Promo films in Remotion from 124 shot recipe cards with tuned components; the cards also work as timing specs for GSAP and HyperFrames (Remotion Company Licence needed for organisational use) |
| [`motionmaxxing`](skills/motionmaxxing/NOTES.md) | Measured eases and ~150 rules from pro work, gates G0–G5; use G5 only on films without broadcast furniture |
| [`html-demo`](skills/html-demo/NOTES.md) | A live app window that plays a product working, drawn in HTML from one clock; a crisp replacement for screen recordings |
| [`kinetic-reel`](skills/kinetic-reel/NOTES.md) | Kinetic-typography reels and promos with three.js layers, a WebGL post pass and a synthesised beat-locked score |
| [`kinetic-type-vault`](skills/kinetic-type-vault/NOTES.md) | 39 ready-made kinetic-type effects (stamp, flip, rush, warp, roll, ransom note, word carousel…), each a skill with fixed steps, variables and a React template |
| [`dimensional-drawing`](skills/dimensional-drawing/NOTES.md) | Apple-style monochrome spec sheets of a UI component or product, and an 11 s film of the sheet drawing itself (camera pull-back, exploded layers); headless render |

### Explainers and news

| Skill | Makes |
|---|---|
| [`html-explainer-video`](skills/html-explainer-video/NOTES.md) | One-minute explainer films where the voice is the clock: every scene lands on its word, in any look and shape, rendered locally |
| [`animated-diagrams`](skills/animated-diagrams/NOTES.md) | Architecture, sequence, flowchart and code-walkthrough diagrams that animate, from text or an existing diagram; voice-over sync; Arabic RTL with mirrored flow |
| [`anatomy`](skills/anatomy/NOTES.md) | Isometric explainer figures: a technical idea drawn as a real, detailed machine with live parts, WebGL light and a readout; records to video |
| [`hairline`](skills/hairline/NOTES.md) | Isometric line figures that answer the pointer: one object, one gesture, one idea, in a single stroke; also turns an SVG logo into a live figure |
| [`talking-head-b-roll`](skills/talking-head-b-roll/NOTES.md) | Presenter graphics timed to the spoken words |
| [`video-production-skills`](skills/video-production-skills/NOTES.md) | Eleven editorial skills: evidence-linked script, shot plan, explainer-motion brief, voice and caption sync, cover, release QA |
| [`lower-thirds`](skills/lower-thirds/NOTES.md) | Transparent lower thirds as ProRes 4444 / VP9 alpha, with alpha and title-safe checks |
| [`social-media-research`](skills/social-media-research/NOTES.md) | **New.** Research before production: outlier posts, trends, transcripts, comments and competitor teardowns across TikTok, Instagram, YouTube, LinkedIn and X (ScrapeCreators API key) |

### Music videos and painted or styled films

| Skill | Makes |
|---|---|
| [`painted-animation`](skills/painted-animation/NOTES.md) | Hand-painted watercolour cartoons, music and lyric videos (p5.brush); includes the best animation guide in the survey |
| [`motion-graphics-music-video`](skills/motion-graphics-music-video/NOTES.md) | Full music videos from a song: plan, generated characters on green, p5 motion graphics, SFX and VFX (Fal.ai key; VFX on macOS) |
| [`lemo-opuscar`](skills/lemo-opuscar/NOTES.md) | Short films in any of 51 film styles, made entirely in code, including Evidence Films from real data; turn a style into a house style |

### 3D and AI film

| Skill | Makes |
|---|---|
| [`ai-camera-control`](skills/ai-camera-control/NOTES.md) | **New.** AI video shots whose camera you wrote in code: a three.js "pill clip" sent to Seedance 2.5 as the reference video, 137 camera-move templates, a previs skill and QA; runs through Higgsfield |
| [`3d-product`](skills/3d-product/NOTES.md) | Product and object films in Blender (Cycles or Octane), from a patent, photos or CAD to a graded film, with a measured gate at every stage |
| [`blender-agent-skills`](skills/blender-agent-skills/NOTES.md) | 28 tested Blender 5.2/5.3 skills: modelling, retopology and UVs, PBR, baking, rigging, animation, time of day, weather, lookdev, rendering, environments, LODs, export to Unreal and web, and an asset QA gate |
| [`img2threejs`](skills/img2threejs/NOTES.md) | One reference image → a code-only, rigged, animatable Three.js model, built in gated passes |
| [`dream-loop`](skills/dream-loop/NOTES.md) | High-fidelity 3D scenes built to a generated target screenshot until a fresh judge scores them 8/10; fal.ai image-to-3D helper |
| [`threejs-scene-fx`](skills/threejs-scene-fx/NOTES.md) | Five Three.js skills: a realistic ocean, underwater god rays, sky rays, a sky background and 200% rendering |

### Craft, review and finishing

| Skill | Makes |
|---|---|
| [`motion-design-principles`](skills/motion-design-principles/NOTES.md) | Durations, stagger, overshoot and choreography decided before code (LottieFiles) |
| [`motion-designer`](skills/motion-designer/NOTES.md) | Code films and overlays with a determinism gate, beat clock and music cut to whole bars; local voice-over now also in Arabic and 22 other languages (Chatterbox) |
| [`claude-motion`](skills/claude-motion/NOTES.md) | Taste rules with numbers, a frame-review loop, sound from one `timeline.json` |
| [`opus-visual-motion-engine`](skills/opus-visual-motion-engine/NOTES.md) | HTML motion pieces with automated render QA (`qa.mjs`) |
| [`hyperframes-motion-reel`](skills/hyperframes-motion-reel/NOTES.md) | Beat-locked reels in HyperFrames, with HyperFrames' rules and pitfalls |
| [`awwwards-motion-study`](skills/awwwards-motion-study/NOTES.md) | Learn a reference's motion from frames: record a motion-through pass, tile per element, write a motion inventory, rebuild, re-record and compare |
| [`color-grade`](skills/color-grade/NOTES.md) | Measured `.cube` LUTs for Resolve or Premiere: fix a cast or exposure, fit a whole clip, match one shot to another (Rec.709 only) |

## [`design/`](design/README.md) — brand, type and design systems

Where a film's look comes from, before anything moves. The outputs feed motion tokens, lower thirds, idents and title styles.

- [`brand-identity/`](design/brand-identity/NOTES.md): two to four logo + type + palette sets from one brief.
  - Measured for contrast, colour blindness, glyph coverage and font licences, and compared as cards.
  - Ends with a guidelines kit, logo files and design tokens for the pick.
- [`make-font/`](design/make-font/NOTES.md): your own OFL font fitted to fonts you like, without tracing their outlines.
- [`awwwards-design-md/`](design/awwwards-design-md/NOTES.md): an evidence-backed DESIGN.md from any public URL.
- [`flexoki/`](design/flexoki/NOTES.md): **new.** A ready editorial palette (paper and ink, eight accents in 13 steps) as CSS and tokens, with a measured colour-blind-safe chart set.

## [`engineering/`](engineering/README.md) — architecture, engineering and construction

Buildings as the subject, for MAKEENA's real-estate films and AEC explainers. Studies and visualisations only, never engineering advice.

- [`build-sequence-film/`](engineering/skills/build-sequence-film/NOTES.md): a model goes up element by element in build order.
  - One isometric take, with the line drawing warming into colour.
  - 16:9 or 9:16, deterministic frames.
- [`brief-to-ifc/`](engineering/skills/brief-to-ifc/NOTES.md): a brief as numbers → a schema-valid IFC4 model for Revit or Archicad.
  - Grid, footings, frame, slabs, core and a facade with windows.
  - Also writes a named GLB for the film.
- [`guides/aec-ai-workflows/`](engineering/guides/aec-ai-workflows/NOTES.md): nine AEC visualisation workflows (Chiang Ning's pack, linked not copied), the Revit and Archicad MCP servers, and the safety line for structural tools.

## [`tools/`](tools/README.md) — render, check, edit and finish

### Review and analysis

- [`headless-render/`](tools/headless-render/NOTES.md): review sheets, frame strips, tracked crops and parallel rendering for any time-pure page; GPU probe for headless Chrome.
- [`lemo-core/`](tools/lemo-core/NOTES.md): parallel video render, reading-time check, loudness master with grain, procedural SFX, TTS with a Whisper check, three.js post and CRT passes.
- [`sync-check/`](tools/sync-check/NOTES.md): sound against picture in a rendered MP4 (off-beat hits, startling jumps).
- [`film-analysis/`](tools/film-analysis/NOTES.md): turn a reference film into cuts, a beat grid and motion heatmaps, and test a finished film for slide-deck feel and empty frames.
- [`yt-dlp/`](tools/yt-dlp/NOTES.md): **new.** Fetch reference films and subtitles for the analysis tools, with the study-not-reuse rules.
- [`awwwards-mcp/`](tools/awwwards-mcp/NOTES.md): award-winning web references, and motion measurement of any page (motion DNA, scroll and hover census, motion-through recordings, GSAP stubs). Install notes only; the server installs from npm.

### Sound, voice and captions

- [`song-analysis/`](tools/song-analysis/NOTES.md): song → beat grid, downbeats, sections, per-instrument onsets from separated stems, loudness envelopes, and word-level lyric timing.
- [`sound-sheet/`](tools/sound-sheet/NOTES.md): a motion cue sheet → a deterministic SFX stem, every sound derived from the motion; plus a sound-family generator.
- [`whisperx/`](tools/whisperx/NOTES.md): word-level timestamps for captions and cutting to the voice-over, with Arabic alignment.
- [`openverse/`](tools/openverse/NOTES.md): searching openly licensed music and images, and the licence rules for using them.

### Editing and finishing

- [`auto-editor/`](tools/auto-editor/NOTES.md): **new.** Cut silence and dead space, and export the edit as a Resolve, Premiere or Kdenlive timeline. Five skills; tested.
- [`davinci-resolve-mcp/`](tools/davinci-resolve-mcp/NOTES.md): **new.** Claude drives DaVinci Resolve Studio on Windows: timelines, markers, grades and LUTs, Fusion, render queue, broadcast-legal checks.
- [`kdenlive-mcp/`](tools/kdenlive-mcp/NOTES.md): a headless agent editor that assembles a timeline, renders with output checks and exports OTIO for Resolve.
- [`open-fusion-mcp/`](tools/open-fusion-mcp/NOTES.md): editable Fusion node graphs in Resolve built by an agent; macOS only for now.
- [`effectcraft/`](tools/effectcraft/NOTES.md): an open After Effects-style compositor with an MCP server; alpha, watch.

### 3D, depth and camera

- [`blender-mcp/`](tools/blender-mcp/NOTES.md): setup notes for the MCP server that lets Claude drive an open Blender (installed with uv, not copied), with its telemetry and safe-mode settings.
- [`mesh-pipeline/`](tools/mesh-pipeline/NOTES.md): our own tested scripts for generated and scanned meshes outside Blender.
  - Tripo text/image → GLB, and a build123d code-CAD prop.
  - PyMeshLab cleanup, xatlas UVs and meshoptimizer LOD chains.
- [`mixamo-retarget/`](tools/mixamo-retarget/NOTES.md): human joints → animated Mixamo character GLB, in numpy, without Blender.
- [`tidewater-asset-pipeline/`](tools/tidewater-asset-pipeline/NOTES.md): CC0 sound sourcing and −23 LUFS normalisation; Blender batch retargeting to GLB and decimation.
- [`photo-parallax/`](tools/photo-parallax/NOTES.md): our own tested pipeline from one photo to a moving-camera shot.
  - Depth from Depth Anything, Depth Pro 2 or an import; panoptic layers; background fill (OpenCV or SDXL).
  - A time-pure three.js page with dolly, truck, orbit, crane and vertigo moves at any aspect.
  - A commercial-safe path is marked.
- [`depth-anything/`](tools/depth-anything/NOTES.md): depth from one photo for parallax and single-image meshes, with the commercially licensed checkpoints named.
- [`threejs-addons/`](tools/threejs-addons/NOTES.md): three.quarks particles (with a seeding recipe for frame-exact renders), pmndrs/postprocessing, Tweakpane.
- [`skills/3d-product/references/dsh-blender-modeling/`](skills/3d-product/references/dsh-blender-modeling/NOTES.md): Blender modelling pitfalls, numeric gates, Blender 5.2 API breaks, three-view calibration, verifier checklist.

### Other engines and generators

- [`hyperframes-skills/`](tools/hyperframes-skills/NOTES.md): **new.** Which of HyperFrames' nine official skills to use when (registry of 450 blocks, reverse-any-video, style-sampling, remotion-to-hyperframes…).
- [`raea/`](tools/raea/NOTES.md): notes for raea, React + TypeScript video, motion graphics and 3D rendered on your own GPU (a possible fifth stack beside Remotion and HyperFrames); FSL licence, young on Windows.
- [`tdmcp/`](tools/tdmcp/NOTES.md): Derivative's official TouchDesigner MCP and skills, for generative and audio-reactive visuals; setup and licence tiers.
- [`manim/`](tools/manim/NOTES.md): maths and diagram explainers in the 3Blue1Brown manner.
- [`anidoodle/`](tools/anidoodle/NOTES.md): hand-drawn art as code in 32 styles, from stills to scored films (a plugin).
- [`tegaki/`](tools/tegaki/NOTES.md): handwriting animation from any font, Arabic joining included (tested), frame-exact with controlled time.
- [`comfyui-piflow/`](tools/comfyui-piflow/NOTES.md): MiniMax H3 video with audio in 2–4 steps in ComfyUI, with the workflows for our 4090 and 3090.
- [`frame-interpolation/`](tools/frame-interpolation/NOTES.md): RIFE, in ComfyUI or on the command line, and when not to use it.
- [`waoowaoo/`](tools/waoowaoo/NOTES.md): a self-hosted AI film workspace (brief, references, generated images and video on one canvas, models through OpenRouter); preview, Elastic License 2.0.

Beat detection, cut detection, green-screen keying, SFX mixing and a synth score also live inside the skills (listed in [`tools/README.md`](tools/README.md)).

## [`starters/`](starters/README.md) — templates to build on

- [`tidewater-webgpu-fx/`](starters/tidewater-webgpu-fx/NOTES.md): FFT ocean, physical sky, caustics, lens flare, motion blur and a full post chain in raw WebGPU/WGSL, with headless capture.
- [`pdoom-video-engine/`](starters/pdoom-video-engine/NOTES.md): a three.js engine for audio-driven films with adaptive per-tile motion blur, true 4K from a 1080p layout and an HDR post chain.
- [`mg-styles-15/`](starters/mg-styles-15/NOTES.md): 15 motion-design films with full source, a `renderAt(t)` render harness and the mgaudio soundtrack toolkit.
- [`papermotion/`](starters/papermotion/NOTES.md): a paper-cutout film engine with rigs, physics and simulation-driven sound, plus its skill.
- [`dioramas/`](starters/dioramas/NOTES.md): cinematic 3D pages with volumetric light, reflections and an AgX post stack.
  - Image → 3D assets through fal (Nano Banana 2 → Meshy 7.1).
  - Deterministic video capture of any live-clock page (dioramas, Anatomy figures, React Bits components), with `--scale` and `--clip`.
- [`hyperframes-motion-library/`](starters/hyperframes-motion-library/NOTES.md): 27 parameterised info graphics for explainers (counters, charts, before/after, source cards, chapter titles).
  - 4 styles, MP4 or transparent ProRes.
  - Batch-rendered from a plan built from the script.
- [`herk-edit-kit/`](starters/herk-edit-kit/NOTES.md): an AI editor for talking-head footage: silence and mistake cutting, storytelling, motion-graphic beats, reels, 406 card drafts and a measured editing playbook.
- Pointers to the kinetic-reel, painted-cartoon, web-intro and p5-overlay templates inside the skills.

## [`prompts/`](prompts/README.md) — prompts and briefs

- [`film-styles/`](prompts/film-styles/README.md): 51 film-style prompts in one reusable 11-section schema (satellite briefing, archive light table, Swiss motion, data storytelling, isometric infographic, dark keynote, spy titles, glass product, ukiyo-e…).
- [`starters/mg-styles-15/prompts/`](starters/mg-styles-15/prompts/): 15 motion-design style prompts with the source of every film they made, a template for new styles and an AI-jury review rubric.
- [`video-prompts/`](prompts/video-prompts/): 64 + 40 curated motion-design prompts and cases from two large collections of Opus 5.5 videos.

## [`docs/`](docs/README.md) — guides and research

**Method**

- [`techniques.md`](docs/techniques.md): the shared method, applied to our tools.
- [`reference-only.md`](docs/reference-only.md): useful material that could **not** be copied (no licence, or third-party content), with where to find it.

**Motion craft**

- [`guides/`](docs/README.md): motion fundamentals (iart.ai), field rules for code films (Howseen), effect recipes, news-insert rules, motion tokens, Disney principles in frames.
- [`guides/emil-kowalski/`](docs/guides/emil-kowalski/NOTES.md): Emil Kowalski's choreography rules (what leads, what follows, what stays still), a build-in-order animation guide with exact curves, and a glossary that names any motion effect for a prompt.
- [`guides/reelforge-grammar/`](docs/guides/reelforge-grammar/NOTES.md): 101 After Effects-style techniques as seek-safe GSAP, 31 verified HyperFrames fragments, and a routing table from scene intent, intensity and mood (English guide to Korean sources).
- [`guides/huashu-motion/`](docs/guides/huashu-motion/NOTES.md): rhythm, the camera as a budget, storyboard laws, UI demo patterns, mix ratios and render traps (English guide to Chinese sources).
- [`guides/react-bits/`](docs/guides/react-bits/NOTES.md): using React Bits backgrounds and text effects in films (loop export, frame-exact capture, picks, licence limits); nothing copied.

**Film types**

- [`guides/explainer-grammar/`](docs/guides/explainer-grammar/NOTES.md): eight measured ways to animate a voice-over and which to use for which stretch of VO.
  - Kurzgesagt-style, Vox-style collage, whiteboard, storytime, kinetic type, 3Blue1Brown-style, keynote and finance chart.
  - Twelve rules that hold across all of them.
- [`guides/launch-film-grammar/`](docs/guides/launch-film-grammar/NOTES.md): launch films decided in order with numbers from 47 measured films (registers, structure, type, cuts, sound, review), a sound guide and a film measurer.
- [`guides/lemo-opuscar/`](docs/guides/lemo-opuscar/NOTES.md): directing and pipeline guides for code-made films, and how to make a style your own.

**3D and research**

- [`guides/blender-3d-toolchain/`](docs/guides/blender-3d-toolchain/NOTES.md): fourteen Claude × Blender and 3D asset projects: which step each serves, licence, whether it still works.
  - Blender MCP, Blender skills, build123d, Tripo, AutoRemesher, RetopoFlow, PyMeshLab, xatlas, Material Maker, ArmorPaint, meshoptimizer, glTF-Transform and more.
- [`research/athemeroy/`](docs/research/athemeroy/NOTES.md): a study of 1,000+ agent-made videos, with a production brief, production paths, workflow analysis and data.

## Using a skill

Copy a skill folder into `%USERPROFILE%\.claude\skills\` (Windows) or symlink it into `~/.claude/skills/` (macOS, Linux, WSL), then describe the video you want in Claude Code. Details in [`skills/README.md`](skills/README.md#installing-a-skill).

## What stays out of git

- Renders: `*.mp4`, `*.mov`, ProRes masters.
- Unreal caches: `DerivedDataCache/`, `Intermediate/`, `Saved/`, `Binaries/`.
- `node_modules/`, model weights, `.env` files and large media.

See `.gitignore`.

## How the collection grew

Each survey is listed in full, with commits and licences, in [`SOURCES.md`](SOURCES.md).

| # | Date (2026) | Added |
|---|---|---|
| 1 | 6 Oct | The first collection, from ten open-source Opus 5.5 video projects |
| 2 | 21 Oct | Six more repos; three refreshed |
| 3 | 22 Oct | Five more repos |
| 4 | 22 Oct | Material from fifteen of twenty motion-skill repos |
| 5 | 4 Nov | The Anatomy isometric-explainer skill and a guide to React Bits |
| 6 | 14 Nov | dream-loop, Hairline, three of Meng To's skill sets and Emil Kowalski's choreography guides |
| 7 | 15 Nov | Dimensional drawings, a kinetic-type vault, a motion-study method, the Awwwards MCP and the `design/` category |
| 8 | 22 Nov | 28 Blender agent skills, Blender MCP setup notes, a scripted mesh pipeline and a guide to the Claude × Blender toolchain |
| 9 | 22 Nov | The `engineering/` category, with our own build-sequence film and brief-to-IFC skills |
| 10 | 23 Nov | A shot-matching colour-grade skill; notes for raea, TouchDesigner's MCP, Kdenlive MCP, a Fusion MCP, pi-H3 video in ComfyUI, RIFE frame interpolation and Depth Anything |
| 11 | 23 Nov | A tested photo-to-camera-move pipeline from Apple's Depth Pro 2, Mask2Former, SDXL inpainting and DINOv3 |
| 12 | 24 Nov | The cinetic and motionmaxxing skills, an English guide to eight explainer grammars, film-analysis tools; notes for anidoodle, WhisperX, three.js add-ons, Manim, EffectCraft, Openverse and waoowaoo |
| 13 | 24 Nov | Animated technical diagrams (with Arabic RTL), two launch-film skills, a talking-head editing kit, 27 explainer graphics, ReelForge's 101-technique grammar, a launch-film guide measured on 47 films, Huashu's motion references, a sound-from-motion renderer and Tegaki handwriting |
| 14 | 26 Nov | Seedance camera control from code, the DaVinci Resolve MCP, auto-editor (tested), a guide to HyperFrames' official skills, Arabic voice-over through Chatterbox, yt-dlp, the Flexoki palette and social-media research skills |

## Licences

**Our own writing** is [MIT](LICENSE) © 2026 Ahmed Albadri:

- This README, every `README.md` and `NOTES.md`, `SOURCES.md`, `docs/techniques.md`, `docs/reference-only.md` and `prompts/video-prompts/yihui-prompt-index.md`.
- The `NOTES.md`-only folders in `tools/`, everything in `tools/mesh-pipeline/` and everything in `engineering/`.
- Scripts we added to copied folders:
  - `starters/dioramas/scripts/render-video.mjs` and `starters/dioramas/scripts/capture/virtual-time.js`
  - `skills/video-shotcraft/assets/scripts/build-card-index.py`
  - `skills/product-launch-motion/scripts/motion-kit.mjs`, `motion-kit.test.mjs` and `subframe-blur.sh` (adapted from MIT code)
  - `design/flexoki/flexoki.json` and `check_flexoki.py`
  - the `lang` option in `skills/motion-designer/scripts/tts_chatterbox.py`

English translations of copied material stay under that material's upstream licence.

**Copied folders keep their upstream licence.** Each has its own `LICENSE` file, and [`SOURCES.md`](SOURCES.md) lists them all.

| Licence | Copied material |
|---|---|
| MIT | lemo-opuscar, ClaudeAnimationBase, opus-video-skills, motion-graphics-music-video-skill, tidewater, pdoom-video, mg-styles-15, papermotion, 3d-product, video-production-skills, dioramas, the dsh-blender-plugin modelling notes |
| MIT | Fourth survey: LottieFiles, iart.ai, Lob0Garou, kaventro, whaleyxbt, Sunwood AI Labs, Howseen, charlie947, Promptible, Dylan Tarre; Anatomy (© Ryan) |
| MIT | Sixth survey: dream-loop (© Anshu Chimala), Hairline (© Lucas Marques), Emil Kowalski, Meng To, Leon Lin's sound effects |
| MIT | Seventh survey: dimensional-drawing (© Enes Ozturk), design.how (© Arlan Marat), brand-identity (© Fatih Aydost), awwwards-skills (© Afjal) |
| MIT | Blender agent skills (© EL4CTEO), colour-grade (© Isaac Rowntree), cinetic (© Leonxlnx), explainer-grammar cards and film-analysis scripts (© alchaincyf) |
| MIT | product-launch-motion (© Abubakr Chan), saas-motion-video (© saas-motion-kit contributors), hyperframes-motion-library (© nutllwhy), design-engineering film clusters and sound scripts (© AgentsORG), huashu-design motion references (© alchaincyf) |
| MIT | ai-camera-control (© Sirio Berati; see its `NOTICE.md` for the CC0 rig, the camera curves and Remotion), Flexoki (© Steph Ango), social-media-research (© ScrapeCreators) |
| MIT + use permission | Herk Edit Kit: MIT (© Nate Herk) for the original kit, the Herk Edit Kit Use Permission for its pipeline resources |
| Apache-2.0 | video-shotcraft, img2threejs, the Motion2MixamoRig retarget core, motionmaxxing (© Tejas Makwana), animated-diagrams (© Omar Kamal), the ReelForge grammar (© gongnyang) |
| Public domain (Unlicense) | The auto-editor skills |
| CC0 | The motion-token files |
| CC BY 4.0 | The athemeroy research and the adapted case list |

Third-party assets fetched by these tools at install or render time (fonts, sample libraries, models) keep their own licences.
