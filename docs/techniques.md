# Techniques for agent-made motion graphics

What the surveyed repos ([`../SOURCES.md`](../SOURCES.md)) have in common, written up as working rules for our stack: HyperFrames, Three.js + GSAP, Remotion, Blender, Unreal and ComfyUI. Each rule names where to see it done. Paths starting with `skills/`, `tools/`, `starters/`, `prompts/` or `docs/` are in this repo; anything marked *(ref)* is reference-only, see [`reference-only.md`](reference-only.md).

---

## 1. Every frame is a pure function of time

This is the rule every repo converges on. A frame must depend only on `t`: no `Math.random()` without a seed, no state carried between frames, no CSS transitions or timers. That makes frames renderable in any order, in parallel, and re-renderable exactly.

There are three ways to get there:

| Approach | How | Where |
|---|---|---|
| Explicit render function | The page exposes `window.render(t)` / `window.renderAt(t)` and draws that moment. | `tools/lemo-core/core/README.md` ("page contract": `READY`, `render(t)`, `DUR`, `EV`, `TEXTS`); `skills/painted-animation/template/src/core.js` |
| Seekable timeline | Build one paused GSAP timeline and `seek(t)` it per frame. This is what HyperFrames does. | Our HyperFrames work; `prompts/video-prompts/yihui-prompt-index.md` (most of the best prompts demand `seek(t)`) |
| Virtual clock | Inject a script that replaces `performance.now`, `Date`, rAF and timers, and pause and seek all CSS/Web Animations. Code that was not written for capture then renders frame-accurately. | shipvideo `renderer.ts` *(ref)* |

Supporting rules:
- **Closed-form motion.** Write springs, jumps and overshoots as formulas of `t` (`spring`, `jump`, `take` in `skills/painted-animation/template/src/core.js`; `spring` and monotone cubic tracks in `tools/lemo-core/core/lib.js`), not as physics integrated frame by frame.
- **Seeded randomness.** Hash a stable key per element (`boilSeed(key)` in the painted-animation core; `mulberry32` in tidewater and the demo games). Re-seeding per element stops a moving object from re-randomising everything else.
- **Animate on twos, keep the camera on ones.** Step characters at 12 fps when the style wants a hand-made feel (`floor(t * 12) / 12`), but move camera and light every frame (`docs/guides/lemo-opuscar/TECHNIQUE.md` §2).
- **Flicker on frames, not on time.** Anything that should change once per frame (jitter, boil, noise) must key off a frame index that stays constant across the shutter (`frameIdx(t)` in `starters/pdoom-video-engine/src/engine/util.ts`), or motion-blurred frames double-expose it.
- **Test it.** Render the same frame after seeking forwards and backwards, and compare. athemeroy calls this a seek-order repeatability check (`docs/research/athemeroy/production-brief.md`). Our own QC harness already checks determinism.

## 2. Rendering: headless Chrome, parallel, resumable, then ffmpeg

All of the code-rendered pipelines look the same: a page in headless Chrome → JPEG or PNG frames → ffmpeg (libx264 CRF 16–18, yuv420p, `+faststart`), with audio muxed at the end.

- **Parallel, resumable workers.** Each worker opens its own page, takes the next missing frame and writes it atomically (`.tmp` then rename), so an interrupted render restarts where it stopped. See `tools/headless-render/render.mjs --frames --workers=4` and `tools/lemo-core/core/render/video.mjs --workers 3`.
- **Check the GPU.** Headless Chrome silently falls back to the SwiftShader software renderer, which is very slow for WebGL. `tools/headless-render/gpu_probe.mjs` prints which GPU each flag set lands on. Useful flags: `--use-angle=d3d11` (Windows), `metal` (macOS), `--use-angle=vulkan` or `gl-egl` (headless NVIDIA on Linux). This applies to HyperFrames and Three.js renders as well.
- **Grain belongs in ffmpeg, not in the page.** Grain drawn in the page makes every frame incompressible and slows capture. Add it in the final encode (`tools/lemo-core/core/render/mux.sh`).
- **Pure WebGPU without a browser.** tidewater renders WebGPU in Node with the `webgpu` (Dawn) package and writes PNGs (`starters/tidewater-webgpu-fx/test/`). A browserless path for GPU frame rendering.
- **Real motion blur from sub-frames.** Average several renders spread over a shutter instead of faking blur in the page. Three levels: a fixed 3–4 sub-frames blended with ffmpeg `tmix` (the `@twoclipping` prompts in `prompts/video-prompts/yihui-prompt-index.md`); a `--mb N --shutter s` flag in the render harness (`starters/mg-styles-15/harness/render.mjs`); and **adaptive sampling per 32×32 tile**, 4 → 324 sub-frames until a tile stops changing, with converged tiles masked out on the GPU (`starters/pdoom-video-engine/`, `--samples auto`). Still frames stop at 12, fast whips need 108+.
- **4K from a 1080p layout.** Lay out in 1920×1080 logical pixels and render every target at the physical scale, so one scene file serves both. Hairlines drawn from `fwidth` thin out at 4K unless written in logical pixels (`pxLine` in the pdoom engine's GLSL).
- **Single-file hand-off.** Bundling a piece into one self-contained HTML file (esbuild, in the demo games *(ref)*) makes it easy to archive or hand to a renderer.

## 3. Let the agent look at its own frames

The agent cannot watch a video, but it can read images. Every strong pipeline makes it look before the final render.

| Check | What it catches | Tool |
|---|---|---|
| Contact sheet of chosen times | Composition, colour, pacing across the film | `render.mjs --sheet=…` (`tools/headless-render/`), `core/render/sheet.py` |
| Strip of every frame in a short span | Motion problems: pops, jitter, broken arcs | `render.mjs --strip=a:b` |
| Full-resolution crops | Detail: line quality, type edges | `render.mjs --crop=x,y,w,h` |
| Crop that follows a world point through the camera | A moving subject during a camera move | `render.mjs --crop-at=…` |
| Reading-time check | On-screen text that is not up long enough to read (defaults: Latin 15 characters/s, CJK 4.5/s, +1.5 s) | `tools/lemo-core/core/render/readcheck.mjs` |
| Visible text per timestamp | Text left over from the last beat; empty beats | shipvideo `check_scene` *(ref)* |
| Speech-to-text back-check | TTS that mispronounces or skips words; gives word timestamps | `tools/lemo-core/core/tts/asr_check.py` |
| Visual hit vs music cue | Hits that land off the beat (reports milliseconds) | `tools/lemo-core/tools/cuecheck.py` |
| Final file | Loudness and blank frames | ffmpeg `ebur128` and `blackdetect` |
| Same frame in any seek order; no clocks, randomness or CSS animation | Pages that drift or flicker between renders | `skills/motion-designer/scripts/check.mjs` |
| On-screen QA: text collisions on glyph ink, clipping, contrast, minimum type size, dead air, handoffs, SVG draw-ons | Data cards and straps that fail when the numbers change | `skills/opus-visual-motion-engine/scripts/qa.mjs` (DOM text only) |
| A tile 0.3 s after every beat in `timeline.json` | A text still animating when it should be held; beats with nothing on screen | `skills/claude-motion/scripts/sheet.mjs` |
| Sound against picture in the final MP4 | Hits off the beat (±100 ms) and startling jumps (> +6 dB) | `tools/sync-check/sync-check.mjs`; `skills/claude-motion/scripts/wave.mjs` draws it |
| Transparent output | Alpha that isn't there; text outside title safe; a painted background | `skills/lower-thirds/scripts/render.mjs --check` |

**Which checker for what.**
- **Determinism and seek order:** `check.mjs`.
- **What is on screen (text, contrast, size, timing gaps):** `qa.mjs`.
- **Settled state at each beat, by eye:** `sheet.mjs`, or `render.mjs --sheet` for chosen times.
- **Reading time:** `readcheck.mjs`.
- **Sound against picture:** `sync-check.mjs` on the MP4, or `cuecheck.py` on the score.
- **Alpha deliveries:** the lower-thirds `--check`.

Pick the ones the job needs rather than running everything.

**A jury with calibrated scores.** `starters/mg-styles-15/rubric.md` is a ready prompt for the independent reviewer: extract sheets and strips, check the spec numbers, score seven dimensions against fixed anchors (5 = student, 7 = solid professional, 8 = high-end agency, 9 = award shortlist; "most first renders deserve 5–7"), then 5–10 fixes with timecodes and numbers, at least one aimed at the wow factor. Its second prompt feeds the review back for a revision round; the 15 films there went through two rounds.

**Measured gates.** `skills/3d-product/` closes every stage with numbers before moving on (model residuals against the drawings, noise at a target, a composition score for every frame, motion QA on every camera move, loudness steps), so expensive renders only start once the cheap previews pass.

**Separate builder and judge.** A reviewer that did not write the code finds more (the demo games' sub-agent review fixed 12 issues; the `motion-graphics-music-video` skill reviews each wave of sub-agent work; our own benchmark uses an independent critic).

## 4. Timing

- **Lock the music grid first.** Detect tempo and beat phase before storyboarding, then place cuts and hits on the grid. Tools: `skills/painted-animation/scripts/beat_grid.py` (tempo, phase, LRC lyric lines → beats), `skills/motion-graphics-music-video/scripts/tools/python/beats.py` (beats, onsets, bar position) and `audio_energy.py` (loudness and vocal presence per window).
- **Go deeper than the beat grid when the piece needs it.** `tools/song-analysis/` separates stems (Demucs) and writes kick, snare and hat onsets, per-stem loudness envelopes at 100 fps, sections on downbeats and, for songs with vocals, word-level lyric timing. Then cut on downbeats, flash on kicks and drive glow from the bass envelope. For an instrumental score (ElevenLabs Music), `analyze.py` alone is enough.
- **Find cuts by content, not by seconds.** The pdoom-video edit places each scene at "the last beat before the first word of this line" (*(ref)* `timeline.ts`). Cuts written that way survive a re-timed or re-aligned song.
- **One timeline drives everything.** Picture, score, sound effects, subtitles and the cue check all read the same cue file, so a hit lands on its frame (`skills/kinetic-reel/template/reel/cues.js` feeds both `reel.js` and `music/score.mjs`; lemo's `timeline.js`).
- **Model the viewer.** For each shot, write the "reads": what the viewer should understand, and from when to when. One read at a time; fast actions, slow meanings. The worked example at the end of `skills/painted-animation/template/ANIMATION_GUIDE.md` is the best short training text on this in any of the repos.
- **Hold on whole beats.** When a scene needs a longer hold, add whole beats, never fractions, so every later cue stays on the grid (`skills/motion-designer`'s `film({BPM, BEATS, holds})`); cut music to whole bars with `music_edit.py`.
- **Let the voice drive presenter graphics.** Transcribe with word timings and land each figure on the spoken word, with structure leading by about 6 frames (`skills/talking-head-b-roll/`).
- **Transitions always.** Every shot names how it leaves (the *Out* column in a storyboard). Catalogues: `skills/kinetic-reel/references/style-guide.md` (shape-continuity transitions), the brush wipe and iris in the painted-animation core.

## 5. Sound

- **Synthesise when you have no library.** `skills/kinetic-reel/template/music/score.mjs` is a dependency-free Node synth that writes a beat-locked score from the cue file. `tools/lemo-core/core/audio/sfx.py` makes procedural foley (clicks, whooshes, thumps), and `pluck.py` plucked strings.
- **Loudness.** Web and social deliveries in these repos master to −14 LUFS (`mux.sh` does two-pass `loudnorm` to −14 LUFS, −1.2 dBTP). Broadcast is EBU R128, −23 LUFS, which is what our benchmark and tidewater's `tools/tidewater-asset-pipeline/audio/lib.mjs` use. Set the target per delivery.
- **Give every sound a sync point.** In `mgaudio` (`starters/mg-styles-15/lib/audio/`) a whoosh syncs on its pass-by peak and a riser on its hit, so you pass the visual event time and never compute offsets; SFX come loudness-normalised and the music ducks 3 dB around each one.
- **Let the picture's events make the sound.** In `starters/papermotion/` a footstep sounds where a foot lands, because the simulation fires the cue. Any physics-driven scene can do the same.
- **Place a sound effect by its measured peak, not its file start** (pattern in several yihui prompts; `sfx_mix.py` in the music-video skill mixes from a cue list).

## 6. Look-development notes

- **Sanitise NaN before bloom** in any Three.js post chain you render to video. One bad pixel becomes a blob (demo games *(ref)*).
- **One "time of day" number.** Key the whole palette (sky, fog, light, exposure, bloom) to sun elevation and tween that number (demo games *(ref)*; tidewater's `sunDirectionFromTime` in `starters/tidewater-webgpu-fx/src/sky/Sky.js`).
- **Long renders and float drift.** Compute wave or oscillator phases in JS at double precision and wrap them mod 2π before sending them to the shader.
- **Orthographic depth of field.** Use the orthographic depth-to-view-Z conversion in the depth pass, or DoF silently breaks (`docs/guides/lemo-opuscar/TECHNIQUE.md` §9).
- **Glass product shots in three.js.** A strip-light studio baked to PMREM, Neutral tone mapping, transmission and dispersion (`prompts/film-styles/glass-product/STYLE.md`).
- **Characters drawn in code.** Rotate a shoulder by abduction before flexion, or raised arms cross into an X; don't outline where the arm overlaps the torso (`TECHNIQUE.md` §10). Acted emotion changes: anticipation squint, swap the face under the squint, overshoot, colour crossfade (`emotions()` in `skills/painted-animation/template/src/clawd.js`).
- **Video-model characters with a code-built world.** Generate each character alone on chroma green and build the world in code, then key and composite (`skills/motion-graphics-music-video/references/prompts.md`). Relevant to ComfyUI and Wan/Kling-style generation.

## 7. Process

- **Storyboard first, with a sign-off gate.** Every skill writes `STORYBOARD.md` and waits for approval before scene code. The music-video skill records a hash of the approved plan, together with a cost estimate.
- **Three acceptance gates:** storyboard and key frames; then the hardest 2–4 seconds as a finished sample; then the whole film (`docs/research/athemeroy/production-brief.md`).
- **Don't clone the demo.** Before opening a style's demo, write your own treatment; a new film must differ in at least 4 of 6 dimensions: structure, opening, signature shot, camera path, score shape, ending (`docs/guides/lemo-opuscar/DIRECTOR.md`).
- **Split long films across sub-agents** with a shared brief: chapter contract, shared API, style rules, a per-frame time budget (PDoomVideo *(ref)*; `skills/painted-animation/references/music-video.md`; the wave contract in `skills/motion-graphics-music-video/references/production.md`).
- **Keep keys out of the chat.** The music-video skill runs paid API calls through a small local MCP server, so the key never appears in the conversation.
- **Facts file for anything factual.** Keep every on-screen number, name and claim in a `FACTS.md` with its source, and treat it as the only source the agent may use (the Evidence Films styles in `prompts/film-styles/`, the `@everestchris6` brief in the yihui index, `skills/video-production-skills/skills/evidence-story-script/`). This is the newsroom rule applied to code-made graphics.
- **Wireframe first.** Build each beat as colourless boxes and outlined text, lock timing on one still per beat, then skin it from the design system without moving the layout (`@ArchiveExplorer` in the yihui index). A cheap approval gate before the look.
- **House styles that survive updates.** Lemo's `MY-STYLES.md` (`docs/guides/lemo-opuscar/`) turns a library style into a named style of your own outside the library, with a style frame and a 15–30 s test film. The route to a channel graphics package.
- **Credit honestly.** Record what the agent wrote and what produced the pixels and sound (athemeroy's main finding is that many "one-shot" videos relied on prebuilt skills, assets or many revisions).

## Arabic and right-to-left text

Rules for Arabic (and other right-to-left) text in HTML, GSAP, HyperFrames and Three.js text layers. They are paraphrased from the Arabic-text guide in Remotion's own skills, which has no licence file in its public mirror, and our benchmark's EN/AR test checks them.

- **Direction and language.** Set `dir="rtl"` and `lang="ar"` on the container. Without them, word spans laid out inline run the sentence backwards.
- **Mixed text.** Decide a line's direction by counting right-to-left words, not by its first character; a line that starts with a number or a brand name is still Arabic.
- **Animate by word, not by letter.** Splitting Arabic into single characters breaks the joining between letters, so a SplitText `chars` reveal must not be used on Arabic.
- **If a per-letter effect is unavoidable.** Keep each letter with its diacritics (harakat), keep lam-alef together as one unit, and add zero-width joiners (U+200D) around each unit so the joins survive.
- **Shaping and digits.** Let the browser shape the text (HTML, or SVG text) rather than a 3D text mesh that does not shape it. Decide per show between Western and Eastern Arabic digits, and keep tabular figures for counters.
- **Reading time.** Arabic needs its own value in a reading-time check; `readcheck.mjs` defaults are set for Latin and CJK.

## Writing video prompts

Patterns behind the strongest prompts in the two video collections ([`../prompts/video-prompts/`](../prompts/video-prompts/)):

1. **Pin the deliverable in numbers:** exact duration, resolution, fps, aspect ratio(s), safe area.
2. **Demand deterministic rendering:** "every style computed from time inside `seek(t)`; no CSS transitions, no timers, no state between frames".
3. **Cut to a musical grid:** "120 BPM, 7 bars, something on every beat".
4. **Use a sectioned brief:** inputs (ask me for…), direction, structure, build, gotchas, start (show the storyboard on the beat grid before writing code).
5. **Ban the clichés explicitly:** bouncy easing, particle bursts, glows, lens flares, RGB split, dead time, "anything that looks like a template".
6. **Close the design system:** 3–4 hex colours, a named 2–3 font system with tracking, one idea per shot, negative space.
7. **Give camera moves in numbers:** "push 1.5–3 s ease-in-out, half the speed you'd default to"; "punch-in 1.00 → 1.08 on beats only".
8. **Seamless loops:** last frame equals first, including positions and speeds.
9. **Review before the full render:** one still per beat, or 20+ probe frames, then fix.
10. **Ground it in real material:** read the repo, brand tokens, logo and real UI; never invent numbers or testimonials.

"You are a world-class motion designer… go all out" is the most-copied line in the collections and the weakest: it tests capability but does not specify a film.

## Which piece helps which tool

| Our tool | Most useful from this repo |
|---|---|
| HyperFrames / Three.js + GSAP | `tools/headless-render/` (review sheets, strips, GPU probe); `skills/kinetic-reel/` (three.js layers, post pass, transitions, synth score); `starters/mg-styles-15/` (15 worked films, `renderAt(t)` harness with sub-frame blur, jury rubric); `starters/pdoom-video-engine/` (adaptive motion blur, 4K, HDR post); `prompts/film-styles/` (look and motion rules); lemo `readcheck` and `mux.sh`; `skills/video-shotcraft/references/shots/` (shot cards as timing and easing specs); `skills/img2threejs/` (a photo → code-built, animatable Three.js object; `docs/materials/` PBR reference); `starters/dioramas/` (volumetrics, reflections, post stack, image → 3D assets, deterministic capture of live-clock pages); `skills/hyperframes-motion-reel/` (HyperFrames rules: one paused timeline on `window.__timelines`, beat grid, pitfalls); `skills/motion-design-principles/` (durations, stagger and choreography before code); `skills/opus-visual-motion-engine/` (`qa.mjs`); `skills/motion-designer/` (`check.mjs`, overlay mode); `docs/guides/iart-motion-fundamentals/` (easing library, beat maths, grids, OKLCH, GSAP diagram recipes, GLSL cookbook); `docs/guides/howseen-motion-design/` (GSAP seek trick, cut seams, caption timing) |
| Remotion | `skills/video-shotcraft/` (124 shot cards with tuned Remotion components, the Ink Press template, page capture and the 2.5D `PageCam`, beat sync, final review; needs a Remotion Company Licence for organisational use); the same review loop and prompt patterns; `prompts/video-prompts/` (Remotion is the most-named stack in the collections) |
| Blender | `skills/3d-product/` (the full product-film pipeline: modelling from drawings, sets, light, compositions, Cycles or Octane, overnight render supervisor, measured gates); `starters/mg-styles-15/demos/04-3d-render/blender/` (a bpy scene, simulation and render script, with type and grain added on top in a web page); `tools/tidewater-asset-pipeline/blender/` (FBX → GLB retarget and NLA bake, glTF decimation); `skills/3d-product/references/dsh-blender-modeling/` (modelling pitfalls, modifier order, numeric gates, framing by projection, Blender 5.2 API breaks, three-view calibration, verifier checklist); `tools/mixamo-retarget/` (joints → Mixamo GLB without Blender) |
| Unreal | `prompts/film-styles/` (camera grammar, motion quality, pitfalls sections translate to Sequencer work) |
| ComfyUI / video models | `skills/motion-graphics-music-video/references/prompts.md` (identity sheets; character on green, world in code; prompt order) |
| Audio | `tools/song-analysis/` (stems, per-instrument onsets, envelopes, lyric timing); `starters/mg-styles-15/lib/audio/` (mgaudio recipes and sync-point SFX); `tools/lemo-core/core/audio/`, `tts/`; `skills/kinetic-reel/template/music/score.mjs`; `beat_grid.py`, `beats.py`; `skills/motion-designer/scripts/` (`beats.py`, `music_edit.py` to whole bars); `tools/sync-check/`; `skills/claude-motion/` (cue sheet from `timeline.json`, `wave.mjs`) |
| News and documentary explainers | `prompts/film-styles/` Evidence Films (satellite, archive light table, briefing board, white model, data physicalization); `skills/video-production-skills/` (evidence-linked script, explainer-motion brief, caption timing, release QA); `docs/research/athemeroy/evidence-examples.md`; `skills/lower-thirds/` (alpha straps for the edit); `skills/talking-head-b-roll/` (presenter graphics timed to the voice); `docs/guides/news-insert-rules/` (never restate the voiceover; article-excerpt card); the Arabic-text rules above |
| WebGPU / real-time ocean and sky | `starters/tidewater-webgpu-fx/` |
