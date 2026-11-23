# Reference only: useful, but not licensed for this repo

These are the useful things found while surveying the source repos ([`../SOURCES.md`](../SOURCES.md)) that **could not be copied here**. Either the repo has no licence, or the item is third-party material that the repo's licence does not cover. Each entry says what it is, why it is useful, and exactly where it lives upstream, so you can study it, link it, or ask the author for a licence.

**How to use this page.** Read the upstream code and learn from it. Re-implement the ideas in your own code and words, and credit the source. Do not paste the upstream code or text into this repo or into delivered work. A repo on GitHub with no licence is "all rights reserved" by default: GitHub's terms let you view and fork it on GitHub, nothing more. An `"license": "ISC"` line in a `package.json` next to an empty `author` is npm's `init` default, not a grant.

To unlock any item, open an issue on the upstream repo asking the author to add a licence (MIT or Apache-2.0).

Commit hashes are the versions surveyed on 6 October 2026 (sections 1–4), 21 October 2026 (sections 5–6), 22 October 2026 (sections 7–11), 31 October 2026 (section 12), 14 November 2026 (section 13) and 15 November 2026 (section 14). PDoomVideo was rechecked on 21 October: same commit, still no licence.

---

## 1. PDoomVideo — no licence

[JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) @ `fa546a3`. The source of the "I'm Upping My P(doom)" music video: 156.6 s, 1920×1080, 24 fps, hand-painted look in p5.js + p5.brush, written by Claude Code in two generations with parallel sub-agents writing one chapter each.

The same author later released the engine, cleaned up and MIT-licensed, as **ClaudeAnimationBase**. That version *is* in this repo (inside [`skills/painted-animation/template/`](../skills/painted-animation/template/) and [`tools/headless-render/`](../tools/headless-render/)), so prefer it for anything you want to run. What PDoomVideo adds is the case study of a long, multi-agent build.

| What | Upstream path | Why it is useful |
|---|---|---|
| Multi-agent chapter brief | `ANIMATION_GUIDE.md` (11.6 KB) | The brief the lead agent wrote for its sub-agents: a chapter contract (each chapter registers shots as pure functions of time), a shared paint and character API, style rules, a per-frame performance budget (≤ 2.5 s) and a review loop. A model for splitting any long film across agents. |
| Storyboard format | `STORYBOARD.md` (15.9 KB) | One table per chapter with columns *Time / Lyric / Shot / Out*, where *Out* names the transition into the next shot, plus palette arcs and a cast table. |
| Chapter layout | `src/ch/c01…c09*.js`, `src/timeline.js` | Nine chapter files registered in one timeline; a painted brush-wipe transition (five ragged strokes cover, then drag off); karaoke with a word-by-word clip fill; a beat-stepped meter value. |
| Shaped iris | `src/core.js` (`irisShape`) | Paints everything outside any star-shaped polygon, for mouth, heart or keyhole reveals. |
| Beat lock without audio analysis | `src/core.js`, `src/ch/c01_lab.js` | Hard-coded `BPM = 88`, `OFF = 0.21`; hits as `exp(-frac(beat) * k)`; cuts placed at `OFF + n × beat`. |
| Tap-to-time tool | `legacy/flash-version.html` | The first-generation real-time Canvas 2D player. Pressing `t` logs the audio's current time, which is a quick manual way to time lyrics and beats. |

Also not ours to use: the song (`assets/pdoom.mp3`, third-party) and the Clawd character (Anthropic's mascot).

## 2. claude-opus-5-5-demo — no licence

[riba2534/claude-opus-5-5-demo](https://github.com/riba2534/claude-opus-5-5-demo) @ `54adc1f`. Three 3D browser games, each claimed as one prompt, one session and no manual edits: a pelican riding a bicycle, a CrossFire map homage and a QQ Speed drift racer. Plain three.js on WebGL (r186 and r169), GLSL shader materials, EffectComposer post, all textures drawn in Canvas and all sound synthesised with Web Audio. Each game builds with esbuild into one self-contained `dist/index.html` of about 700–840 KB. The game themes also carry third-party trademark risk.

**The prompts** are in the README section 提示词原文 ("original prompts"). In English they say, roughly: *"Generate a 3D page of a pelican riding a bicycle, using every capability you have, then upload it to a CDN and give me the link"*, and for the two games, *"Recreate [map/game] as realistically as possible … I need a real game … use all your abilities."* They are useful as a contrast to the long, structured briefs in [`../prompts/`](../prompts/): open-ended capability tests, not production briefs.

**The QA process** the README describes is the most transferable part: research before building; headless-browser self-tests including a 320-second soak test with heap checks; a sub-agent review that found and fixed 12 issues; and, after launch, reproducing black frames by injecting NaN and adding a sanitise pass.

| What | Upstream path | Why it is useful for motion work |
|---|---|---|
| NaN/Inf sanitise pass before bloom | `pelican-bike/src/main.js` (around lines 150–175; `?nantest=1` injects a bad pixel) | One NaN pixel turns into a black or white blob once bloom spreads it. The pass tests bit patterns with `floatBitsToUint` so fast-math compilers cannot optimise the check away. Worth adding to any Three.js post chain you render to video. |
| Shot-function camera | `pelican-bike/src/main.js` (`SHOTS` array, from line 326) | Eight timed shots, each a function of normalised time returning position offset, look-at offset and FOV, blended with smoothstep, plus a damped chase camera. A camera sequencer with no GSAP. |
| Fixed time-step for capture | `pelican-bike/src/main.js` (`?dt=`, line 1271), also `?freeze=1`, `?cam=cine` | URL switches that make a real-time scene step deterministically for frame capture. |
| Time-of-day palette | `pelican-bike/src/sky.js` (`samplePalette(elevDeg)`, `sunDirection(hour)`) | A seven-key palette (zenith, horizon, sun, hemisphere light, fog, cloud, exposure, bloom) keyed by sun elevation. One "hour" number drives the whole look, which is ideal to tween with GSAP. |
| Gerstner ocean | `pelican-bike/src/ocean.js` | Five Gerstner waves. Wave phases are computed in JS at double precision and wrapped mod 2π, so long renders do not drift; `waveHeight()` is the matching CPU function for placing objects on the water. |
| Geometry helpers | `pelican-bike/src/util.js` | `loft()` sweeps a profile along a path; `DynamicTube` is an updatable tube with parallel transport (no twisting), good for animated lines and ribbons; `solveTwoBone()` two-bone IK. |
| Effects | `pelican-bike/src/effects.js`, `qq-speed/src/effects.js` | Verlet cloth scarf, confetti, speed lines, point-sprite particles, skid-mark trails. |
| Procedural textures | `qq-speed/src/textures.js` | Canvas-drawn road, curb, chevrons, billboards and text textures: no asset licensing. |
| Spline ribbon | `qq-speed/src/track.js` | A centripetal Catmull-Rom spline extruded to a ribbon with arc-length spacing; a base for path and ribbon motion graphics. |
| Synthesised sound | `pelican-bike/src/audio.js`, `cf-transport-ship/src/audio.js` (75 KB) | Pure Web Audio: music that follows a tempo parameter; a sound-effects engine with a bus graph, a generated convolution reverb impulse and voice limiting. |
| Single-file build | `*/build.mjs` | esbuild bundles and inlines everything into one HTML file, a convenient hand-off format for HyperFrames or for archiving a piece. |

## 3. shipvideo ("LaunchVideo") — no licence

[diggerhq/shipvideo](https://github.com/diggerhq/shipvideo) @ `53d7c6f`. Paste a URL; one agent (Claude Opus 5.5 on the OpenComputer runtime) fetches the site, writes a single self-contained HTML film, checks it, renders it frame by frame in headless Chromium and encodes a 20–40 s MP4 with ffmpeg. A Next.js front end submits jobs and polls progress. No video model and no audio.

| What | Upstream path | Why it is useful |
|---|---|---|
| Launch-film craft prompt | `opencomputer/agents/director/agent.ts` (the `craft` string) | Three parts. *What a great video looks like:* 6–10 beats of 2–5 s; kinetic type of at most about 8 words on screen; show the mechanism, built from div, SVG and canvas; one house easing curve; a five-part arc (hook → name reveal → three how-it-works beats → proof, never invented numbers → end card); a short font list; at most two background colours; an editorial frame of corner labels and a progress hairline. *How the renderer works:* 1920×1080 at 30 fps; animate with CSS keyframes or one rAF loop driven by `t`; no CSS transitions, no `Math.random`, no video, audio or iframe elements, no external images; under 60 KB. *Process:* fetch, write a shot list, check, render once, never ask questions. A good skeleton for a promo or sting brief. |
| Virtual-clock renderer | `opencomputer/agents/director/tools/renderer.ts` (`VIRTUAL_CLOCK`) | An init script that replaces `performance.now`, `Date`, `requestAnimationFrame` and timers with a controllable clock, and pauses and seeks every CSS/Web Animations animation through `document.getAnimations()`. This makes code that was never written for frame capture (plain CSS keyframes, rAF loops, a GSAP ticker) render frame-accurately. Contrast with the explicit `render(t)` contract in [`../tools/lemo-core/`](../tools/lemo-core/). |
| Text-visibility check | `opencomputer/agents/director/tools/scene.ts` (`check_scene`) | Seeks to chosen times and returns the text actually visible at each (walks the DOM, filtering on opacity, display and on-screen bounds), plus page errors. A cheap pre-render check for leftover text from the previous beat or for empty beats. |
| Brand extraction from a URL | `opencomputer/agents/director/tools/web.ts` (`extractMeta`) | Page text plus title, Open Graph tags, h1–h3, the eight most frequent hex colours and the Google Fonts in use: a quick "brand kit from a website" step. |
| Atomic publish | `opencomputer/agents/director/tools/scene.ts` | Render to a local file, then publish with one copy, so a half-written MP4 is never visible. |

## 4. Third-party material inside licensed repos

The repos below are MIT or CC BY, but these particular items are owned by someone else, so they were left out.

| What | Where upstream | Why it is not here |
|---|---|---|
| Verbatim creator prompts (40 curated motion prompts) | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) `prompts/*.md` | The repo is MIT, but it states that every video and prompt belongs to its creator. This repo carries a link-only index instead ([`../prompts/video-prompts/yihui-prompt-index.md`](../prompts/video-prompts/yihui-prompt-index.md)). A private copy with the full prompt text is kept outside the Git repo on the team workstation (`MOTION DESIGN/private-reference/`). |
| Creator prompts, posts, stills | [athemeroy/awesome-opus-5-5-videos](https://github.com/athemeroy/awesome-opus-5-5-videos) | Its CC BY 4.0 licence covers only its own writing, tables and diagrams (see its `THIRD_PARTY.md`). Only those parts were copied. |
| Lyric-video example "小镇姑娘" | [opus-video-skills `skills/painted-animation/examples/xiaozhen/`](https://github.com/tuzhechen2005/opus-video-skills/tree/main/skills/painted-animation/examples/xiaozhen) | The storyboard and code quote lines from a commercially released song. Worth reading as a lyric-sync example. |
| "Work Reel '26" example | [opus-video-skills `skills/kinetic-reel/examples/work-reel-26/`](https://github.com/tuzhechen2005/opus-video-skills/tree/main/skills/kinetic-reel/examples/work-reel-26) | MIT code, but it is the author's personal portfolio reel with personal résumé data, and the author asks that its figures are not reused. Read it to see how an 84 s reel is organised. |
| The Clawd character | ClaudeAnimationBase, `skills/painted-animation/template/src/clawd.js` | The rig code is MIT and is included. The character design is Anthropic's mascot, which the code licence does not cover. Fine for internal tests; for anything published or broadcast, swap in your own character (the rig and emotion system are reusable). |
| Demo films, stills, fonts, sample packs, HDRIs | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) (`styles/*/demo/`, `core/fonts/`, `tools/fetch.sh`) | Third-party assets with their own licences (OFL fonts, CC BY/CC0 instrument libraries, Poly Haven CC0), and about 70 MB of media. Fetch them from upstream when needed and keep their `CREDITS`. The demo *source* is MIT and can be copied later if a specific demo is wanted. |
| Game assets | [dgreenheck/tidewater](https://github.com/dgreenheck/tidewater) `public/` | About 100 MB of models, audio, textures and cloud volumes under mixed licences (CC0, MIT, OFL; one AI-generated texture). Only the two small SMAA lookup textures were copied (three.js, MIT). |
| Animated previews | `*.gif` in opus-video-skills; `docs/emotions.webp` in ClaudeAnimationBase | Size only (2–7 MB each). Viewable upstream. |
| Sample pack, films, textures, fonts | [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) `lib/audio/samples/`, `videos/`, `assets/`, demo images | Size only: 57 MB of CC0 VCSL samples, 18 MB of CC0 textures and HDRI, 420 MB of films. [`../starters/mg-styles-15/NOTES.md`](../starters/mg-styles-15/NOTES.md) shows how to fetch the samples. |
| Demo films and example scenes with Clawd | [francozanardi/papermotion](https://github.com/francozanardi/papermotion) | The example code is included in [`../starters/papermotion/`](../starters/papermotion/), but several films star the Clawd character (see the Clawd row above). |
| Promo media, screenshots, audio | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) `assets/audio/`, `demos/_textures/`, `template/public/`, `assets/brand/`, `gallery/` | 36 MB of Mixkit audio (its `ATTRIBUTION.md` cannot trace several files), screenshots of an internal tool, the upstream brand and sponsor logos, and preview films. The code and cards are in [`../skills/video-shotcraft/`](../skills/video-shotcraft/NOTES.md), which lists the 15 demos that need the textures. |
| Generated models and images | [blendi-remade/dioramas](https://github.com/blendi-remade/dioramas) `public/` | 329 MB of Meshy GLBs and Nano Banana images, CC BY 4.0 (credit "Dioramas (github.com/blendi-remade/dioramas)"). Size only; [`../starters/dioramas/NOTES.md`](../starters/dioramas/NOTES.md) shows how to fetch them. |

## 5. pdoom-video — third-party song material

[mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) @ `fa164b7` is MIT, but its README excludes the song, the lyrics and `data/lyrics.json`, which belong to the song's authors. The engine and the analysis tools are in this repo ([`../starters/pdoom-video-engine/`](../starters/pdoom-video-engine/NOTES.md), [`../tools/song-analysis/`](../tools/song-analysis/NOTES.md)). These parts were left upstream because they quote or encode the lyrics:

| What | Upstream path | Why it is useful |
|---|---|---|
| Treatment and style bible | `docs/TREATMENT.md` (25 KB) | The best written treatment in any surveyed repo: one-paragraph idea ("plates from an illustrated treatise"), tone rules including an explicit "not slop" list (no neon cyberpunk, glowing brains, code rain, lens-flare soup, stock AI imagery), a five-colour palette with one rare accent owned by one moment, a typography system where each typeface is a "voice", then plate-by-plate direction. A model for writing a house style bible. It quotes lyric lines, so it is not copied. |
| The edit | `app/src/timeline.ts` | Scene boundaries found by lyric content and snapped to the beat grid (`cut('a line')` = the last beat before that line's first word; `after()` = the downbeat nearest a line's end). The right way to make an edit survive a re-timed or re-aligned song. |
| The 17 scenes | `app/src/scenes/*.ts` | Worked examples of every engine feature: ray-marched rooms with a half-res G-buffer (`room.ts`, `shoggoth.ts`), engraving shaders, maps and Gantt charts (`leftturn-*.ts`), a typewriter prompt UI (`prompt.ts`), a GPU text press (`dense-press.ts`), an outro rewind montage. They reference lyric lines by content. |
| Timing data | `data/audio.json`, `data/lyrics.json` | Example output of the analysis tools (the second is the song's lyrics with word timings). |

## 6. opus-video-prompts — no licence

[joeseesun/opus-video-prompts](https://github.com/joeseesun/opus-video-prompts) @ `7977c80`. A Chinese-language index of 18 copy-ready prompts and 54 public cases from the first week after Opus 5.5's release, with links to each original post. It has no licence file, and the README states that every prompt and video belongs to its creator.

Most of its best prompts are already indexed by link in [`../prompts/video-prompts/yihui-prompt-index.md`](../prompts/video-prompts/yihui-prompt-index.md) (for example the two `@twoclipping` templates, #13–15, and `@alex_prompter`, #23). What it adds, summarised in our words:

- **A table of nine production routes** with a representative case each: single-file Canvas/JS, p5.js with a brush library, Remotion, HyperFrames, Manim for maths and papers, Python drawing frame by frame, three.js/WebGL scenes, driving professional software (After Effects, Blender, Higgsfield, Runway through MCP, Seedance API), and editing existing footage.
- **Cost and time figures reported by creators**, from a few dollars for a one-line launch clip to about 200 dollars (or 7–10 % of a weekly Max allowance) for a multi-minute music video, with the warning that most "one-shot" results took two or more runs.
- **Writing tips** that match [`techniques.md`](techniques.md#writing-video-prompts): storyboard before code, structure like a director, ban the clichés, deterministic `seek(t)` rendering, review frames before the full render, put API keys in `.env` and deny the agent read access to it in `.claude/settings.json`.

## 7. jianying-headless — non-commercial licence

[mcncarl/jianying-headless](https://github.com/mcncarl/jianying-headless) @ `27c2627` (0.2.0 "source preview"). A custom *Personal Learning and Non-Commercial Use* licence: no revenue-generating or business use without the author's written permission, and no republishing as a public skill collection, template bundle or company toolkit. It **cannot be used at work or copied here**. It is also of limited use to us: it automates **Chinese Jianying Professional on Apple Silicon Macs** only (its docs say international CapCut is not supported), apart from a contributed FFmpeg renderer for Windows that makes an MP4 without a Jianying draft.

What it does, and the ideas worth reusing in our own tools (described in our words):

- **An edit plan compiles into an editable timeline.** One JSON plan (canvas, typed tracks, segments in microseconds with speed, volume, position, scale and text style) becomes a native project the editor can open. The editable draft is the default deliverable; a render happens only when asked for.
- **Never touch the original.** An existing project is first inspected, returning track, segment and material IDs. Edits are named operations (`set_segment`, `replace_text`, `replace_media`, `duplicate_segment`, `remove_segment`) applied to a copy. The source is pinned by ID plus a SHA-256 of its timeline, and the tool stops if the source changes at any step.
- **Freeze, then export.** What is rendered is a hash-locked snapshot, in a sandboxed process with no network access. The result must have the exact frame count (a missing last frame is a failure, not rounding), pass a full ffmpeg decode with errors fatal, and have the expected codecs and container.
- **Talking-head editing.** Every span is marked KEEP / DELETE / CHECK, with "protected" word ranges so a cut never clips speech. Unsure cuts go back to the user, and a second transcription checks the first cut.
- **Licence-aware SFX.** For commercial jobs, only CC0 or CC BY effects are used, with attribution written to a credits file.
- **Strict refusal.** Unknown app versions, library hashes and effects are rejected rather than loosening the checks.

The same pattern maps onto OpenTimelineIO, FCPXML, Premiere XML or DaVinci Resolve's scripting API, which suit a Premiere / After Effects / Resolve newsroom.

## 8. DSH × Blender plugin — not usable from Claude Code

[sixtysevenlf/dsh-blender-plugin](https://github.com/sixtysevenlf/dsh-blender-plugin) @ `55a9597` (v2.6.0, BSD-3-Clause; its modelling skill MIT). DSH is DeepSeek Harness, a separate agent host. The plugin's 15 tools register with DSH, not with MCP, so Claude Code cannot use them. Its portable modelling notes are translated in [`../skills/3d-product/references/dsh-blender-modeling/`](../skills/3d-product/references/dsh-blender-modeling/NOTES.md). The rest stays upstream:

| What | Upstream path | Notes |
|---|---|---|
| The op-based modelling workflow | `skills/blender-modeling/SKILL.md` sections 0–12 | Catalogue first, then op, verdict and gate. Freeze a spec and manifest before parallel modelling. "Degraded" never counts as a pass. No millimetres without calibration. A multi-agent role split and a 10-line task card. Good ideas; the ops themselves (`rt_plan`, 33 families, 217 ops) only run inside DSH. |
| Reference-sheet idea | same | Four orthographic or isometric views plus a turntable MP4 of the finished model, as a reference pack for a video model (for example Seedance). |
| Evidence and modelling cookbooks | `docs/证据分级与读图纪律.md`, `docs/假设驱动建模-cookbook.md` | Grading evidence and an image-reading budget; hypothesis-driven modelling. Chinese only. |
| EEVEE notes | `docs/EEVEE-工作要点.md` | Sections 2–4 come from unlicensed third-party notes. |
| The runtime and addon | `runtime/`, `addon/dsh_blender_bridge.py` | The addon is a renamed derivative of ahujasid/blender-mcp. |

**Do not install it alongside our Blender bridge.**

- **Remote code execution.** Its backend accepts `POST /act` on `127.0.0.1:9877` without authentication and runs a body that is not JSON as Python (`runtime/server.mjs` line 466), so a web page open in the browser could run code in Blender.
- **Port clash.** The addon listens on port 9876, like other Blender bridges, and starts automatically.
- **Leftovers from blender-mcp.** It still carries a premium endpoint and a hard-coded trial key inherited from blender-mcp.

## 9. Motion2MixamoRig pipeline — non-commercial dependencies

[MaxLiu22/Motion2MixamoRig](https://github.com/MaxLiu22/Motion2MixamoRig) @ `443b703` (v0.1.7). Its own code is Apache-2.0, and its numpy retarget core is in [`../tools/mixamo-retarget/`](../tools/mixamo-retarget/NOTES.md). The video-to-motion half is not, because of what it depends on: GVHMR (non-commercial research licence), the SMPL-X body model (non-commercial; commercial terms through Meshcapade) and YOLOv8 (AGPL-3.0). Its NOTICE says the end-to-end pipeline is restricted to non-commercial or research use. Fine for internal previs and research; **not for on-air work** without those licences.

| What | Upstream path | Why it is useful |
|---|---|---|
| Extraction | `motion2mixamorig/extract.py`, `checks.py` | Video or still → YOLOv8 person → RTMPose 2D → GVHMR world-grounded SMPL-X → 24 SMPL joints in metres, Y-up. A still is repeated into a 32-frame clip because GVHMR is temporal. A preflight checks one person, fully in frame. |
| Blender extension | `blender_extension/motion2mixamorig_blender/` | A pattern worth copying: a thin add-on UI that installs an external Python runtime with a sha256-pinned `uv` download, runs the heavy pipeline there, reads progress back as JSONL, tracks weight downloads and imports the result. It keeps torch out of Blender's Python. |
| Character swap | `cli.py` `--skeleton` | Reuses an earlier extraction to put the same motion on another character in seconds. |

## 10. Fourth survey: reviewed, not copied

Repos from the 22 October survey of 20 motion-skill repos that are not copied, or copied only in part, with what is worth knowing from each. Commits as surveyed.

| Repo | Licence | Why not copied | Worth knowing |
|---|---|---|---|
| [remotion-dev/skills](https://github.com/remotion-dev/skills) @ `039e8a2` | No licence file in this public mirror | The same 12 skills as the installed Remotion plugin (v4.0.537) | Its Arabic-text rules are paraphrased in [`techniques.md`](techniques.md#arabic-and-right-to-left-text). Its maps skill compares static, Mapbox, MapLibre, MapTiler and Cesium routes |
| [siyuanfeng636-cpu/agentic-motion-graphics](https://github.com/siyuanfeng636-cpu/agentic-motion-graphics) @ `a0f146b` | MIT | A write-up of a third-party YouTube demo, not a tested pipeline. "Whisper drives every cut" is only a word-highlight loop, and scenes are not timed from the voice. Its HyperFrames boilerplate (`hyperframes.json`, `window.seekTo`, `__ANIMATION_READY__`) does not match HyperFrames' `window.__timelines` / `hf-seek` contract. Its case study holds frames of the third-party video | The idea of word timings driving a GSAP timeline. Do it with per-scene TTS clips and [`../skills/video-production-skills/`](../skills/video-production-skills/NOTES.md) voice-subtitle sync, or lemo-core's TTS with a Whisper back-check |
| [iart-ai/map-animation-skills](https://github.com/iart-ai/map-animation-skills) @ `390ca98` | MIT | The code is Remotion | Vector editorial maps with d3-geo (Mercator, Equal Earth, Natural Earth, orthographic; `geoInterpolate` for great-circle arcs) from Natural Earth or world-atlas data. A 12 fps "stutter" by holding frames (`f = floor(frame / step) × step`). Earth Studio camera → After Effects import. All of it ports to GSAP/SVG. It has no disputed-borders or naming policy, which news needs |
| [iart-ai/data-animation-skills](https://github.com/iart-ai/data-animation-skills) @ `8ce2709` | MIT | The code is Remotion | Bar-chart-race rank interpolation; pacing of 0.3–0.6 s per row with a 2–3 s final hold; at most about 12 bars; `Intl.NumberFormat` with tabular figures; CSV validation rules |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) @ `1dcbe5e` | MIT | Remotion-only, and mostly covered by [`../skills/video-shotcraft/`](../skills/video-shotcraft/NOTES.md) | A five-layer scene stack (background, assets, graphics, grade, grain and vignette), and Ken Burns on every still |
| [Liamrjohnston/remotion-motion-graphics-skill](https://github.com/Liamrjohnston/remotion-motion-graphics-skill) @ `b860c79` | MIT; bundles third-party logos | House style for one company's Instagram inserts. Three files are in [`guides/news-insert-rules/`](guides/news-insert-rules/NOTES.md) | A camera rig as one keyframe timeline over one large world; hold, move, hold; terminal-demo grammar (one character per frame, a blinking cursor, rotateX 18–22°); a fail-closed delivery gate that requires a separate critic's scores |
| [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) @ `e627941` | MIT | The skills and two scripts are in [`../skills/claude-motion/`](../skills/claude-motion/NOTES.md); the rest is a Remotion project | Its `sims/kit/director.js`: cuts on bar lines, punch-ins on kicks, shake and flash on the drop |
| [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) @ `3d90d34` | MIT | Kept as a guide in [`guides/howseen-motion-design/`](guides/howseen-motion-design/NOTES.md) | Its "remake" mode rebuilds a third-party launch video frame for frame. Not for newsroom use |
| [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills) @ `b45d60f` | CC0 | Its five skills are thin workflow lists. The token and rubric files are in [`guides/motion-tokens/`](guides/motion-tokens/NOTES.md) | Its curated list; the leads not yet reviewed are in section 11 |
| [dylantarre/animation-principles](https://github.com/dylantarre/animation-principles) @ `8359713` | MIT | 144 skills that apply Disney's 12 principles to domains, roles and tools; mostly templated, and many have no numbers. Two are in [`guides/disney-principles-applied/`](guides/disney-principles-applied/NOTES.md) | — |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) @ `aed9cfd` | MIT | The same 8 skills as the installed GSAP set | Nothing on frame-by-frame rendering of a paused timeline. Its README tells agents to recommend GSAP |
| [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) @ `1da73fe` | MIT | 22 generic web-dev skills, each stored five times; last updated Nov 2025 | `easing_guide.md` and an easing visualiser page; overviews of Babylon.js, PlayCanvas, A-Frame and PixiJS |
| [199-biotechnologies/motion-dev-animations-skill](https://github.com/199-biotechnologies/motion-dev-animations-skill) @ `3feedfb` | MIT | Interactive React UI with Motion.dev, not video; covered by the installed framer-motion skill | A Motion.dev spring preset table |
| [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) @ `bb5a3ce` | MIT | An index of 18 pack repos; its verify scripts are weaker than [`../tools/headless-render/`](../tools/headless-render/NOTES.md) | — |
| [iart-ai/kinetic-typography-skills](https://github.com/iart-ai/kinetic-typography-skills) @ `fccc94b` | MIT | Generic; covered by the installed GSAP SplitText skill and [`../skills/kinetic-reel/`](../skills/kinetic-reel/NOTES.md). Its letter splitting breaks Arabic | — |
| [iart-ai/web-animation-skills](https://github.com/iart-ai/web-animation-skills) @ `b6dba3e` | MIT | Product-UI web animation, largely covered by installed skills | `lottie-animation` (Lottie playback) and `svg-animation` (stroke draw, morph) if Lottie or SVG work comes up |
| [iart-ai/webgl-animation-skills](https://github.com/iart-ai/webgl-animation-skills) @ `50697d6` | MIT | Real-time loops with `THREE.Clock` and `Math.random`, not seek-safe. The GLSL cookbook is in [`guides/iart-motion-fundamentals/`](guides/iart-motion-fundamentals/NOTES.md) | `threejs-animation/references/resource-disposal.md` on freeing GPU memory |
| [wilwaldon/Claude-Code-Video-Toolkit](https://github.com/wilwaldon/Claude-Code-Video-Toolkit) @ `a6e9e52` | No licence file | A README of links | Two leads in section 11 |
| [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) @ `59744a6` | MIT | Already copied; upstream unchanged | — |

## 11. Leads not yet reviewed

Named in the repos above and worth a look in a later survey:

| Lead | What it is |
|---|---|
| [Yusuke710/manim-skill](https://github.com/Yusuke710/manim-skill) | Manim for maths and science explainers |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | Lower thirds, transitions and brand profiles. Remotion-based, so check its licence |
| [Orkas-AI/Orkas-VideoStudio](https://github.com/Orkas-AI/Orkas-VideoStudio) | MIT, per the list. A 14-skill video pack driven by `plan.json` |
| [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | Apache-2.0, per the list. Scans skill packs before install; useful for vetting surveys like this one |
| [garrytan/gstack](https://github.com/garrytan/gstack) | Design and motion QA passes |
| [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) | URL → 60 fps launch video with sound effects |


## 12. React Bits — Commons Clause

[DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) @ `4dc7b5b` (31 Oct 2026). **MIT + Commons Clause.** You may use the components in your own app, site or product, commercially too, but not sell, sublicense or redistribute the components themselves (alone, in a bundle or as a port), the browser tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab) or the sound library, and not sell or give away the tools' exports on their own as packs. Copying components into this toolkit would be redistribution, so nothing is copied.

What is worth knowing, in our own words, is in [`guides/react-bits/`](guides/react-bits/NOTES.md):

- **218 components** at this commit: 33 text animations, 38 effects, 48 components, 35 micro-interactions and 64 backgrounds (mostly WebGL/OGL fragment shaders). Install one at a time with the shadcn or jsrepo CLI, or through the shadcn MCP server; `reactbits.dev/llms.txt` lists them all.
- **Background Studio** exports frame-stepped loops (MP4/WebM, up to 3840×2160, 24/30/60 fps, cross-faded seamless loop, no video alpha).
- **For 25/50 fps, other sizes or PNG sequences**, put the component on a page and record it with the dioramas virtual-time capture; only `Aurora` takes a controlled `time` prop.
- **Arabic:** the letter-splitting text effects break joining; animate Arabic by word.

## 13. Sixth survey: reviewed, not copied

From the 14 November 2026 survey of six projects shared on LinkedIn (SOURCES.md rows 58–62). All are MIT, so licence was never the reason; these were left out for scope, dependencies or size.

| Item | Why not copied | Worth knowing |
|---|---|---|
| [MengTo/Skills](https://github.com/MengTo/Skills) @ `3cc9345`: `media/html-reel` | Assembly runs in Fil's video editor over MCP with no local route, plus a cloned ElevenLabs voice and DreamCut recordings | Turns a post, landing page or YouTube video into a 9:16 reel in the source's own look, every cut on a word. A camera placeholder (a backlit studio silhouette) stands in every camera layout until the creator's phone take replaces it, and everything is retimed to their own words by word anchors, `t = W(τ)`. `scripts/decursor.py` finds and paints out the macOS cursor in a screen recording (OpenCV) |
| MengTo/Skills: `media/url-to-motion-design` | Rebuilds the best shots of someone else's launch film inside Fil's motion-scenes canvas | Blind judges polishing each scene to 8/10. Not for remaking third-party work |
| MengTo/Skills: `codex/browser-video-recording` | Works through Codex's in-app browser | 60 fps 4K "screen recordings" with a natural macOS cursor, deliberate click choreography and zoom-follow framing |
| MengTo/Skills: `workflow/workflow-score-to-target` | The same idea as dream-loop's judge, which is copied | Anchored 0–10 rubrics, blind judging, before/after scorecards, honest reporting of what is still short |
| MengTo/Skills: the other 11 `3d/` skills | Interactive-site techniques more than motion | Procedural wood, cloth, paper and metal materials that hold up in macro close-ups; falling leaves; four seasons; a wood-lighting scorecard |
| MengTo/Skills: `codex/video-to-superprompt`, `illustration/`, `web-design/`, `game-*` | Prompt-writing for web pages, illustration styles, landing-page styles and games | `video-to-superprompt` turns a screen recording of a site or animation into a detailed recreation prompt; `illustration-isometric-mono` is a one-ramp isometric SVG style with a scene kit |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) @ `0f2e23b`: the other 16 skills | UI- or platform-specific (Sonner, Expo, Swift, mobile web, UI-library picks, audits of app animation). Three are in [`guides/emil-kowalski/`](guides/emil-kowalski/NOTES.md) | `animation-performance` lists subtle causes of dropped frames in web animation |
| [morluto/rea](https://github.com/morluto/rea) @ `9e24b36` ([rea.tools](https://rea.tools)) | Not a motion skill: an MCP server and CLI (122 MB) that uses Hopper, Ghidra or IDA for native binaries, and inspects JavaScript, Electron and live browser activity | Install with `npx rea-agents setup`. The motion use is studying how a public site's animation or WebGL effect works at runtime, then writing your own. Its disclaimer rules out copying proprietary code or assets, circumventing protections, and unauthorised targets; keep to that |

## 14. Seventh survey: reviewed, not copied

From the 15 November 2026 survey (SOURCES.md rows 63–69). All are MIT; these were left out for scope, dependencies or size.

| Item | Why not copied | Worth knowing |
|---|---|---|
| [arla6ka/design.how](https://github.com/arla6ka/design.how) @ `148b94c`: the other 41 vault visuals | Shader fields, photo galleries, cursors and interface pieces rather than type. The 39 type effects are in [`../skills/kinetic-type-vault/`](../skills/kinetic-type-vault/NOTES.md) | `ripple-grid`, `phase-table`, `eclipse-grid`, `datamosh`, `peak-gradient` and `image-galaxy` make good animated backgrounds; same template and `check.mjs` pattern |
| design.how: `design-system-boss`, `build-design-system`, `migrate-design-system`, `token-mapping`, `component-docs`, `ui-review` | They build and migrate an app codebase onto a design system: software work, not motion. `make-font` is in [`../design/make-font/`](../design/make-font/NOTES.md) | `token-mapping` maps raw hex and pixel values to tokens **by purpose** (an 8 px radius never stands in for an 8 px gap); `ui-review` checks the states a screenshot misses |
| design.how: the four design systems (Glaze, Lime, Quartz, Sodium) | shadcn themes for app UI | Each ships its own skill so an agent builds with its components |
| [oil-oil/oil-ui](https://github.com/oil-oil/oil-ui) @ `5c6b527` | Overlaps design skills already in use; `SKILL.md` written in Chinese; checks for updates online unless `OIL_NO_UPDATE_CHECK=1`; hands off to a paid Pro edition | Recommends one direction or compares several side by side on one page, then refines against real desktop and mobile screenshots, optionally with an independent reviewer |
| [oil-oil/oil-motion](https://github.com/oil-oil/oil-motion) @ `07e31f2` | Web scroll animation from generated video; `SKILL.md` in Chinese; generation through the ZenMux service | Turns AI-generated or existing video and frame sequences into animation driven by scroll, drag, pointer, device tilt or audio (product teardowns, camera fly-throughs): keyframes, chroma and alpha atlases, frame interpolation, compression, a compiled timeline and runtime. Local processing of existing video needs Python, Pillow and ffmpeg only |
| [INSANE0777/awwwards-skills](https://github.com/INSANE0777/awwwards-skills) @ `5dcf198`: `recreate`, `awwwards-section-loop` | Rebuild other people's sites section by section | The section gate (captured geometry and screenshots per band, then lock) is a sound QA loop for your own pages |
| awwwards-skills: `motion-authoring`, `awwwards-inspiration`, `awwwards-atlas`, `awwwards-doctor`, `awwwards-setup` | Tied to the MCP's project conversion or to running the server itself | `awwwards-inspiration` teaches reference research with the MCP ("dark 3D portfolio vibes" → shortlisted award winners with their design DNA) |
| [enesozturk/dimensional-drawing](https://github.com/enesozturk/dimensional-drawing): `assets/` | 18 MB of README GIFs, stills and the reference MP4 | Watch the reference film upstream before adapting the template |

## 15. Eighth survey: Claude × Blender toolchain, reviewed, not copied

From the 22 November 2026 survey (SOURCES.md rows 70–83). Only the Blender skills were copied; the rest install from pip, npm, uv or a release download, are applications, or are GPL. What each is for, and what was tested, is in [`guides/blender-3d-toolchain/`](guides/blender-3d-toolchain/NOTES.md).

| Item | Why not copied | Worth knowing |
|---|---|---|
| [CGCookie/retopoflow](https://github.com/CGCookie/retopoflow) @ `ac2570c` | **GPL-3.0**; an interactive tool for an artist's hands | Blender 4.2+ extension (v3.4.11): Contours, PolyStrips, PolyPen, Strokes, Patches, Loops, Knife, Tweak, Relax |
| [cnr-isti-vclab/PyMeshLab](https://github.com/cnr-isti-vclab/PyMeshLab) @ `9c30334` | **GPL-3.0** | Used, not copied, by `tools/mesh-pipeline/mesh_clean.py`; Linux needs `libopengl0` |
| [Tripo-Developer/tripo-3d-for-blender](https://github.com/Tripo-Developer/tripo-3d-for-blender) @ `d65412f` | Pins a Tripo SDK commit from Oct 2025 (0.x); Tripo shut its v2 API on 31 Oct 2026 and says 0.x stops working | Use the SDK 1.x (`tools/mesh-pipeline/tripo_generate.py`) or Blender MCP's Tripo generator. Not tested (no key) |
| [ranjian0/building_tools](https://github.com/ranjian0/building_tools) @ `0216534` | Last updated May 2025; partial results in Blender 5.3 | Registers and runs floorplan, floors and windows headless, but the windows did not render and the hip roof failed; its error popup crashes background Blender. Try it in the UI |
| [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) @ `a5a8acf` | Installs with `uvx mcp-for-blender`; a copy would go stale | Notes in `tools/blender-mcp/`; set `DISABLE_TELEMETRY=true` for client work |
| [huxingyi/autoremesher](https://github.com/huxingyi/autoremesher), [RodZill4/material-maker](https://github.com/RodZill4/material-maker), [armory3d/armorpaint](https://github.com/armory3d/armorpaint) | Applications (Qt/C++, Godot, C), not scripts | AutoRemesher and Material Maker have headless CLIs; ArmorPaint's development source adds `--export-textures`, `--script` and an `--mcp` server; its binaries are paid |
| [gumyr/build123d](https://github.com/gumyr/build123d), [Tripo-Developer/tripo-python-sdk](https://github.com/Tripo-Developer/tripo-python-sdk), [jpcy/xatlas](https://github.com/jpcy/xatlas), [zeux/meshoptimizer](https://github.com/zeux/meshoptimizer), [donmccurdy/glTF-Transform](https://github.com/donmccurdy/glTF-Transform) | Libraries installed with pip or npm | Wrapped by our scripts in `tools/mesh-pipeline/` |
| [EL4CTEO/blender-skills](https://github.com/EL4CTEO/blender-skills): `docs/`, `assets/` | 5.7 MB comparison site and images | The with/without comparison is online at el4cteo.github.io/blender-skills/comparison |

## 16. Chiang Ning's AEC skill pack — all rights reserved

[chiangning.net/resources/showcase-reel](https://www.chiangning.net/resources/showcase-reel): nine `SKILL.md` files (eight workflows and a bonus showcase-reel skill) from Chiang Ning's public project films P402–P430, each ending "Copyright 2026 Stanton Dahl Architects. All Rights Reserved." They are free to download and use yourself; they are not licensed for redistribution, so none of their text is in this public repo. Read 22 November 2026.

- **Workflows covered:** isometric build film, live structure check, model to cinematic film, photo to 3D model, prompt to BIM model (Revit through MCP), building by prompt, image to timber shell, phone clip to model, showcase reel. Each is summarised in our own words, with links and the matching tools in this repo, in [`../engineering/guides/aec-ai-workflows/`](../engineering/guides/aec-ai-workflows/NOTES.md).
- **Rebuilt as our own skills:** the build film ([`build-sequence-film`](../engineering/skills/build-sequence-film/NOTES.md), three.js) and the brief-to-BIM idea without Revit ([`brief-to-ifc`](../engineering/skills/brief-to-ifc/NOTES.md), IfcOpenShell).
- **Missing from the pack:** the showcase-reel skill refers to `prep_clips.sh`, `music.py` and `capture.js`, which are not published with it.

## 17. Tenth survey: reviewed, not copied

From the 23 November 2026 survey (SOURCES.md rows 85–95), which started from four X posts: Mika's "Fable 5.2 took a $6,800 motion job" thread (eight repos), a post on ComfyUI-piFlow, one on raea and one on a trading plugin. What was kept is in `skills/color-grade/` and the `tools/` notes listed in SOURCES.md. These were left out:

| Item | Why not copied | Worth knowing |
|---|---|---|
| [ODU33104/rive-mcp](https://github.com/ODU33104/rive-mcp) | Source-available freeware. Its licence forbids modification, redistribution, derivative works and "AI-assisted analysis" | Builds `.riv` files without the Rive editor (bones, IK, mesh deformation, state machines) and renders WebM or APNG. Free to use as installed (`npm i rive-mcp-server` or its Claude Code plugin); Rive's own MCP needs the editor running. Of little use when the output is video |
| [xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) | Superseded for video | A per-frame GAN upscaler, so it flickers on moving images. For generated clips use a temporal restorer (SeedVR2 or FlashVSR in ComfyUI) before RIFE. For code-rendered work, render at the delivery size instead |
| [hzwer/ECCV2022-RIFE](https://github.com/hzwer/ECCV2022-RIFE) | The paper's research code | Use Practical-RIFE or ComfyUI's built-in node: see [`../tools/frame-interpolation/`](../tools/frame-interpolation/NOTES.md) |
| [brainbytes-dev/everything-claude-trading](https://github.com/brainbytes-dev/everything-claude-trading) | Out of scope (quant trading) | — |

## 18. Eleventh survey: Depth Pro 2 and friends, reviewed, not copied

From the 23 November 2026 links (SOURCES.md rows 96–101): Apple's Depth Pro 2 with its weights and paper, Mask2Former ADE20K panoptic, SDXL 1.0 inpainting and DINOv3. Nothing was copied. The models download from their authors, and what we kept is our own pipeline in [`../tools/photo-parallax/`](../tools/photo-parallax/NOTES.md).

| Item | Why not copied | Worth knowing |
|---|---|---|
| [ml-depth-pro-2](https://github.com/apple-aiml-research/ml-depth-pro-2) code | Installs from git; copying it would freeze it. The **weights** ([apple/DepthPro2](https://huggingface.co/apple/DepthPro2)) are research-only | Its own CLI (`depth-pro-2 predict`) does photos, folders, video files and live input. Videos run in 16-frame windows overlapping by 4 (`--window`, `--overlap`) for steady depth. `--save-png16` writes 16-bit inverse depth (white near) that `photo-parallax/depth.py --import` reads; `--save-npz` keeps metres. bf16 on NVIDIA and Apple GPUs, float32 on CPU. Core ML export for Apple devices. Sky comes back as hundreds of km: clip it |
| [Mask2Former ADE20K panoptic](https://huggingface.co/facebook/mask2former-swin-large-ade-panoptic) | Model licence "other", trained on ADE20K (non-commercial research and education) | Good labels for layering: sky, building, road, person, tree, stairs. It sometimes calls thin tops (a finial, a mast) sky, so check segments against depth. The COCO-panoptic checkpoint (`…-coco-panoptic`) has 133 classes and different data terms; check them before client work |
| [SDXL 1.0 Inpainting 0.1](https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1) | Not needed in the repo: diffusers downloads it (several GB in fp16) | Works at about 1024 px. Composite only inside the mask so the rest of the photo stays untouched, and fix the seed. OpenRAIL++-M allows commercial use but its use restrictions travel with the model |
| [DINOv3](https://github.com/facebookresearch/dinov3) | Gated weights; a backbone, not a finished tool | The features behind Depth Pro 2. Notebooks cover foreground segmentation, dense and sparse matching, segmentation tracking, PCA feature views, and text alignment (dino.txt). Useful for matching an object across shots or sorting a photo archive by look. Its licence bars ITAR, military, nuclear, espionage and weapons uses |
