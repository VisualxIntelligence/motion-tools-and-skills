# Tools

Scripts and utilities for rendering, checking and finishing motion graphics. Folders here are standalone tools; the table at the bottom also points to useful tools that live inside the skills.

| Folder | What it does | Stack | Source |
|---|---|---|---|
| [`headless-render/`](headless-render/NOTES.md) | Renders any time-pure HTML/canvas/WebGL page in headless Chrome: contact sheets, frame strips, tracked crops and stills for agent review; parallel resumable frames; ffmpeg encode with audio. Plus a GPU probe. | Node, puppeteer-core, ffmpeg | ClaudeAnimationBase (MIT) |
| [`lemo-core/`](lemo-core/NOTES.md) | A full code-film toolkit: parallel video render, review stills, reading-time check, events export, contact sheets, SRT, two-pass loudness master with grain; procedural SFX, sampler, plucked strings; offline and online TTS with a Whisper back-check; three.js post (GTAO, DoF, bloom) and a VHS/CRT pass. | Node + Playwright, Python, ffmpeg, three.js | lemo-opuscar (MIT) |
| [`tidewater-asset-pipeline/`](tidewater-asset-pipeline/NOTES.md) | Asset build scripts: CC0 Freesound search and download, loop crossfades and loudness normalisation to −23 LUFS; Blender batch scripts for FBX character → GLB with retargeted, NLA-baked clips, and glTF decimation to a triangle budget. | Node, ffmpeg, Blender 4.2–5.2 (background), Python | tidewater (MIT) |

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
| Synth score from cues | [`../skills/kinetic-reel/template/music/score.mjs`](../skills/kinetic-reel/template/music/score.mjs) | A beat-locked score with no samples or dependencies |

Our own benchmark tools (QC harness, usage and cost collector, Unreal MCP bridge) are not in this repo yet.
