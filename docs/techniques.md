# Techniques for agent-made motion graphics

What the ten surveyed repos ([`../SOURCES.md`](../SOURCES.md)) have in common, written up as working rules for our stack: HyperFrames, Three.js + GSAP, Remotion, Blender, Unreal and ComfyUI. Each rule names where to see it done. Paths starting with `skills/`, `tools/`, `starters/`, `prompts/` or `docs/` are in this repo; anything marked *(ref)* is reference-only, see [`reference-only.md`](reference-only.md).

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
- **Test it.** Render the same frame after seeking forwards and backwards, and compare. athemeroy calls this a seek-order repeatability check (`docs/research/athemeroy/production-brief.md`). Our own QC harness already checks determinism.

## 2. Rendering: headless Chrome, parallel, resumable, then ffmpeg

All of the code-rendered pipelines look the same: a page in headless Chrome → JPEG or PNG frames → ffmpeg (libx264 CRF 16–18, yuv420p, `+faststart`), with audio muxed at the end.

- **Parallel, resumable workers.** Each worker opens its own page, takes the next missing frame and writes it atomically (`.tmp` then rename), so an interrupted render restarts where it stopped. See `tools/headless-render/render.mjs --frames --workers=4` and `tools/lemo-core/core/render/video.mjs --workers 3`.
- **Check the GPU.** Headless Chrome silently falls back to the SwiftShader software renderer, which is very slow for WebGL. `tools/headless-render/gpu_probe.mjs` prints which GPU each flag set lands on. Useful flags: `--use-angle=d3d11` (Windows), `metal` (macOS), `--use-angle=vulkan` or `gl-egl` (headless NVIDIA on Linux). This applies to HyperFrames and Three.js renders as well.
- **Grain belongs in ffmpeg, not in the page.** Grain drawn in the page makes every frame incompressible and slows capture. Add it in the final encode (`tools/lemo-core/core/render/mux.sh`).
- **Pure WebGPU without a browser.** tidewater renders WebGPU in Node with the `webgpu` (Dawn) package and writes PNGs (`starters/tidewater-webgpu-fx/test/`). A browserless path for GPU frame rendering.
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

**Separate builder and judge.** A reviewer that did not write the code finds more (the demo games' sub-agent review fixed 12 issues; the `motion-graphics-music-video` skill reviews each wave of sub-agent work; our own benchmark uses an independent critic).

## 4. Timing

- **Lock the music grid first.** Detect tempo and beat phase before storyboarding, then place cuts and hits on the grid. Tools: `skills/painted-animation/scripts/beat_grid.py` (tempo, phase, LRC lyric lines → beats), `skills/motion-graphics-music-video/scripts/tools/python/beats.py` (beats, onsets, bar position) and `audio_energy.py` (loudness and vocal presence per window).
- **One timeline drives everything.** Picture, score, sound effects, subtitles and the cue check all read the same cue file, so a hit lands on its frame (`skills/kinetic-reel/template/reel/cues.js` feeds both `reel.js` and `music/score.mjs`; lemo's `timeline.js`).
- **Model the viewer.** For each shot, write the "reads": what the viewer should understand, and from when to when. One read at a time; fast actions, slow meanings. The worked example at the end of `skills/painted-animation/template/ANIMATION_GUIDE.md` is the best short training text on this in any of the repos.
- **Transitions always.** Every shot names how it leaves (the *Out* column in a storyboard). Catalogues: `skills/kinetic-reel/references/style-guide.md` (shape-continuity transitions), the brush wipe and iris in the painted-animation core.

## 5. Sound

- **Synthesise when you have no library.** `skills/kinetic-reel/template/music/score.mjs` is a dependency-free Node synth that writes a beat-locked score from the cue file. `tools/lemo-core/core/audio/sfx.py` makes procedural foley (clicks, whooshes, thumps), and `pluck.py` plucked strings.
- **Loudness.** Web and social deliveries in these repos master to −14 LUFS (`mux.sh` does two-pass `loudnorm` to −14 LUFS, −1.2 dBTP). Broadcast is EBU R128, −23 LUFS, which is what our benchmark and tidewater's `tools/tidewater-asset-pipeline/audio/lib.mjs` use. Set the target per delivery.
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
- **Credit honestly.** Record what the agent wrote and what produced the pixels and sound (athemeroy's main finding is that many "one-shot" videos relied on prebuilt skills, assets or many revisions).

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
| HyperFrames / Three.js + GSAP | `tools/headless-render/` (review sheets, strips, GPU probe); `skills/kinetic-reel/` (three.js layers, post pass, transitions, synth score); `prompts/film-styles/` (look and motion rules); lemo `readcheck` and `mux.sh` |
| Remotion | The same review loop and prompt patterns; `prompts/video-prompts/` (Remotion is the most-named stack in the collections) |
| Blender | `tools/tidewater-asset-pipeline/blender/` (FBX → GLB retarget and NLA bake, glTF decimation) |
| Unreal | `prompts/film-styles/` (camera grammar, motion quality, pitfalls sections translate to Sequencer work) |
| ComfyUI / video models | `skills/motion-graphics-music-video/references/prompts.md` (identity sheets; character on green, world in code; prompt order) |
| Audio | `tools/lemo-core/core/audio/`, `tts/`; `skills/kinetic-reel/template/music/score.mjs`; `beat_grid.py`, `beats.py` |
| WebGPU / real-time ocean and sky | `starters/tidewater-webgpu-fx/` |
