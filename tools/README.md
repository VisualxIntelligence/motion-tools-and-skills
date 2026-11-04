# Tools

Scripts and utilities for rendering, checking and finishing motion graphics. Folders here are standalone tools; the table at the bottom also points to useful tools that live inside the skills.

| Folder | What it does | Stack | Source |
|---|---|---|---|
| [`headless-render/`](headless-render/NOTES.md) | Renders any time-pure HTML/canvas/WebGL page in headless Chrome: contact sheets, frame strips, tracked crops and stills for agent review; parallel resumable frames; ffmpeg encode with audio. Plus a GPU probe. | Node, puppeteer-core, ffmpeg | ClaudeAnimationBase (MIT) |
| [`lemo-core/`](lemo-core/NOTES.md) | A full code-film toolkit: parallel video render, review stills, reading-time check, events export, contact sheets, SRT, two-pass loudness master with grain; procedural SFX, sampler, plucked strings; offline and online TTS with a Whisper back-check; three.js post (GTAO, DoF, bloom) and a VHS/CRT pass. | Node + Playwright, Python, ffmpeg, three.js | lemo-opuscar (MIT) |
| [`song-analysis/`](song-analysis/NOTES.md) | Song → `audio.json` (beat grid, downbeats, sections, kick/snare/hat onsets from Demucs stems, 100 fps envelopes per stem) and `lyrics.json` (word-level lyric timing by CTC forced alignment, cross-checked with Whisper), with QA plots. The most thorough music-timing tool in the repo. | Python (uv), Demucs, torchaudio, librosa | pdoom-video (MIT) |
| [`tidewater-asset-pipeline/`](tidewater-asset-pipeline/NOTES.md) | Asset build scripts: CC0 Freesound search and download, loop crossfades and loudness normalisation to −23 LUFS; Blender batch scripts for FBX character → GLB with retargeted, NLA-baked clips, and glTF decimation to a triangle budget. | Node, ffmpeg, Blender 4.2–5.2 (background), Python | tidewater (MIT) |
| [`sync-check/`](sync-check/NOTES.md) | Checks a rendered MP4's sound against its picture: offset from each cut or cue to the nearest onset (OFF-BEAT beyond ±100 ms) and the loudness jump into it (STARTLE above +6 dB); exits 1 on failure | Node, ffmpeg | iart-ai/javascript-animation-skills (MIT) |
| [`mixamo-retarget/`](mixamo-retarget/NOTES.md) | 24 human joints (metres, Y-up) → a Mixamo-rigged character: binary FBX reader, T-pose calibration, swing/aim retarget, linear blend skinning, animated GLB writer. No Blender. Feed it from licensed mocap or MediaPipe; the video-to-joints models upstream are non-commercial | Python, numpy | Motion2MixamoRig (Apache-2.0; core only) |

## Tools inside the skills

| Tool | Path | Use |
|---|---|---|
| Beat grid + LRC lyrics → beats | [`../skills/painted-animation/scripts/beat_grid.py`](../skills/painted-animation/scripts/beat_grid.py) | Tempo and beat phase from a song before storyboarding |
| Beats, onsets, bars | [`../skills/motion-graphics-music-video/scripts/tools/python/beats.py`](../skills/motion-graphics-music-video/scripts/tools/python/beats.py) | Same job, with onsets and bar position |
| Loudness and vocal presence | [`…/python/audio_energy.py`](../skills/motion-graphics-music-video/scripts/tools/python/audio_energy.py) | Find sections and energy changes in a song |
| Cut detection | [`…/python/cuts.py`](../skills/motion-graphics-music-video/scripts/tools/python/cuts.py) | Measure the edit rhythm of a reference video |
| Green-screen keying | [`…/python/cutout.py`](../skills/motion-graphics-music-video/scripts/tools/python/cutout.py) | Video-model output → transparent PNG sequence |
| SFX mix from cues | [`…/python/sfx_mix.py`](../skills/motion-graphics-music-video/scripts/tools/python/sfx_mix.py) | Place effects over music from a cue list |
| p5 → transparent PNGs | [`../skills/motion-graphics-music-video/scripts/tools/p5/`](../skills/motion-graphics-music-video/scripts/tools/p5/) | Overlay graphics for compositing, with a small motion library |
| Core Image VFX (macOS) | [`../skills/motion-graphics-music-video/scripts/tools/vfx/`](../skills/motion-graphics-music-video/scripts/tools/vfx/) | Cue-driven punch, whip, shake, glow, glitch, grain |
| Render harness for `renderAt(t)` pages, with sub-frame motion blur | [`../starters/mg-styles-15/harness/render.mjs`](../starters/mg-styles-15/harness/render.mjs) | Any time-pure page; also seeks CSS and Web Animations to `t` |
| mgaudio soundtrack toolkit | [`../starters/mg-styles-15/lib/audio/`](../starters/mg-styles-15/lib/audio/README.md) | Genre recipes arranged around a drop and an outro; SFX with sync points; master to −14 LUFS with true-peak check |
| AI jury rubric | [`../starters/mg-styles-15/rubric.md`](../starters/mg-styles-15/rubric.md) | An independent agent scores a film on seven dimensions and lists timed fixes |
| Adaptive motion-blur renderer | [`../starters/pdoom-video-engine/scripts/render.ts`](../starters/pdoom-video-engine/scripts/render.ts) | `--samples auto`: sub-frames per tile until converged |
| Paper-film inspection: grab, sheet, listen | [`../starters/papermotion/scripts/`](../starters/papermotion/scripts/) | Frames with state probes; contact sheets; soundtrack spectrogram and loudness |
| Product-film QA (composition, motion, loudness, scene weight) | [`../skills/3d-product/scripts/`](../skills/3d-product/scripts/) | `comp_analysis.py`, `motion_qa.py`, `loudness_profile.py`, `scene_weight.py`, `probe_setup.py` |
| Deterministic video capture of live-clock pages (three.js + GSAP + Lenis) | [`../starters/dioramas/scripts/render-video.mjs`](../starters/dioramas/scripts/render-video.mjs) | Virtualises `performance.now`, `Date`, rAF and timers, seeds `Math.random`, scripts scroll and pointer; for pages that are not `renderAt(t)` |
| Image → 3D asset generation with resume | [`../starters/dioramas/scripts/gen.mjs`](../starters/dioramas/scripts/gen.mjs), [`optimize.mjs`](../starters/dioramas/scripts/optimize.mjs) | fal.ai Nano Banana 2 → Meshy 7.1 PBR mesh; GLB weld, simplify, WebP, meshopt |
| Page capture with element layout | [`../skills/video-shotcraft/assets/scripts/capture-template.mjs`](../skills/video-shotcraft/assets/scripts/capture-template.mjs) | 2× full-page screenshot, element cut-outs, `layout.json` coordinates for a 2.5D page camera |
| Three-view mm calibration | [`../skills/3d-product/references/dsh-blender-modeling/multiview-calibration.md`](../skills/3d-product/references/dsh-blender-modeling/multiview-calibration.md) | px-per-mm per view from front, side and top references, with a self-test |
| Determinism gate for `seek(t)` pages | [`../skills/motion-designer/scripts/check.mjs`](../skills/motion-designer/scripts/check.mjs) | Same frame in any seek order; no clocks, randomness or CSS animation; loop closes |
| On-screen render QA | [`../skills/opus-visual-motion-engine/scripts/qa.mjs`](../skills/opus-visual-motion-engine/scripts/qa.mjs) | Text collisions on glyph ink, clipping, contrast, type size, dead air, handoffs, SVG draw-ons; `report.json` |
| Music cut to whole bars | [`../skills/motion-designer/scripts/music_edit.py`](../skills/motion-designer/scripts/music_edit.py) | With `beats.py`; cues stay on the beat after an edit |
| Beat-anchored contact sheet, waveform with beat lines | [`../skills/claude-motion/scripts/`](../skills/claude-motion/scripts/) | `sheet.mjs` (a tile 0.3 s after each beat), `wave.mjs` (hits against beats, LUFS, true peak) |
| Alpha video render and check | [`../skills/lower-thirds/scripts/render.mjs`](../skills/lower-thirds/scripts/render.mjs) | ProRes 4444 / VP9 alpha; decodes and verifies the alpha; title-safe check |
| Word-timed transcript | [`../skills/talking-head-b-roll/scripts/transcribe.mjs`](../skills/talking-head-b-roll/scripts/transcribe.mjs) | whisper.cpp or ElevenLabs Scribe, sentence ends snapped to pauses |
| Synth score from cues | [`../skills/kinetic-reel/template/music/score.mjs`](../skills/kinetic-reel/template/music/score.mjs) | A beat-locked score with no samples or dependencies |

Our own benchmark tools (QC harness, usage and cost collector, Unreal MCP bridge) are not in this repo yet.
