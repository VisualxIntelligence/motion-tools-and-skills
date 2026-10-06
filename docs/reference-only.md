# Reference only: useful, but not licensed for this repo

These are the useful things found while surveying the ten source repos ([`../SOURCES.md`](../SOURCES.md)) that **could not be copied here**. Either the repo has no licence, or the item is third-party material that the repo's licence does not cover. Each entry says what it is, why it is useful, and exactly where it lives upstream, so you can study it, link it, or ask the author for a licence.

**How to use this page.** Read the upstream code and learn from it. Re-implement the ideas in your own code and words, and credit the source. Do not paste the upstream code or text into this repo or into delivered work. A repo on GitHub with no licence is "all rights reserved" by default: GitHub's terms let you view and fork it on GitHub, nothing more. An `"license": "ISC"` line in a `package.json` next to an empty `author` is npm's `init` default, not a grant.

To unlock any item, open an issue on the upstream repo asking the author to add a licence (MIT or Apache-2.0).

Commit hashes are the versions surveyed on 6 October 2026.

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
