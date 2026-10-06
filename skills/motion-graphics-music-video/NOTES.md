# motion-graphics-music-video — notes

**Source:** [makevoid/motion-graphics-music-video-skill](https://github.com/makevoid/motion-graphics-music-video-skill) @ `759ba6a` (plugin v0.2.5). MIT, © 2026 makevoid ([LICENSE](LICENSE)). The upstream README is kept as [UPSTREAM-README.md](UPSTREAM-README.md).

## What it makes

A full animated-character music video from a song and a creative prompt (16:9, 24 fps, 1080p by default; YouTube 4K and X 1080p encodes). The author quotes about $30 of Fal credits and about 3 M Opus tokens for a 3-minute song.

## Pipeline

1. **Intake:** creates a separate project, installs dependencies, runs a health check.
2. **Audio analysis:** beats, onsets and energy locally; optional paid lyric transcription (Whisper) and stem separation (Demucs).
3. **Research and plan:** web research, then `docs/PLAN.md` (character bible, full-song storyboard, prompts, cost estimate). **Hard approval gate:** nothing is generated until the plan is approved; the approval records a hash of the plan.
4. **Production in sub-agent waves** (2 → 3–4 → 4–8 → 6–10 jobs): character sheets with an image model; each character animated alone on chroma green (#00B140) with an image-to-video model, using the vocal stem for lip-sync.
5. **Compositing:** Python keying and cut-outs; p5.js scenes and overlays rendered frame-exact in headless Chrome.
6. **Finishing:** cue-based SFX mix, Swift Core Image VFX from a cue list, ffmpeg concat, mux and delivery encodes.

Everything runs through one Ruby CLI (`scripts/mv.rb`); the agent is told never to call ffmpeg, Python or Node directly.

## When to use it

- As a whole: music videos that combine generated characters with code-built motion graphics. It is the only skill here that uses image and video models.
- As parts: several pieces are valuable on their own (below), especially for our ComfyUI and video-model work.

## Most reusable pieces

| File | Use |
|---|---|
| `references/prompts.md` | The strongest doc here. Rule: make every character self-contained on chroma green and build the world in code. Style-bible paragraph, identity-sheet prompts, and a video-model prompt order: identity → framing → lyric → timed acting beats → camera → invariants → exclusions. Applies directly to ComfyUI / Wan-style generation. |
| `references/production.md` | Sub-agent wave contract, JSONL logs, review and accept. |
| `assets/plan-template.md` | Music-video plan template (brief, direction, research, character bible, storyboard, waves, delivery). |
| `scripts/tools/python/beats.py` | Beat grid, onsets and bar position from a WAV (numpy only). |
| `scripts/tools/python/audio_energy.py` | Loudness and vocal-band presence per time window. |
| `scripts/tools/python/cuts.py` | Hard-cut detection in a reference video. Useful for analysing a reference edit's rhythm. |
| `scripts/tools/python/cutout.py`, `keep_component.py`, `split_row.py` | Green-screen or paper-background key to transparent PNGs with despill; isolate one alpha component; split a row of characters into one clip each. |
| `scripts/tools/python/track_template.py`, `sprite_box.py` | Feature tracking (FFT cross-correlation); measuring a character's bounds. |
| `scripts/tools/python/mouth_sync.py` | Checks lag between mouth movement and the vocal stem. |
| `scripts/tools/python/sfx_mix.py` | Mixes sound effects over music from a cue list. |
| `scripts/tools/p5/render.mjs` + `tools/p5/lib/` | Frame-exact p5 sketch → transparent PNG sequence, with a small motion library: easing and tweens; slap, pop, slam, shake, sparkle; karaoke, typed and knockout type; paper grain and riso misregistration. |
| `scripts/tools/vfx/` | `mvfx`, a Swift package that applies cue-driven Core Image effects through an ffmpeg pipe: zoom, punch, whip, shake, glow, motion blur, TV, RGB split, glitch, flash, grain. **macOS only.** |
| `scripts/lib/media/ffmpeg.rb` | ffmpeg recipes, including YouTube 4K and X 1080p encodes with a BT.601 → BT.709 conversion. |
| `scripts/lib/fal/` | A Ruby Fal.ai queue client that validates parameters against each model's OpenAPI schema; a pattern for wrapping any hosted model. |
| `scripts/mcp.rb`, `scripts/lib/toolkit/mcp_server.rb` | A small stdio MCP server that holds the API key, so it never appears in the chat. A good pattern for any paid API. |

## Requirements

Ruby 3.2+ and Bundler, Node.js 22+, Python 3 (numpy, Pillow), ffmpeg/ffprobe, ImageMagick, Chrome. A **Fal.ai API key** (paid) for generation. Swift VFX and the full test suite need **macOS 14+**; on Windows or Linux the VFX step is unavailable and fonts must be copied by hand (font discovery scans macOS font folders only). The model endpoints are hard-coded and will change over time; the skill tells the agent to refresh the schemas first (`openapi:fetch`).

## Install

The upstream plugin is the intended route, because it also registers the MCP server that holds the key:

```
claude plugin marketplace add makevoid/motion-graphics-music-video-skill
claude plugin install motion-graphics-music-video@makevoid-music-video --scope user
/plugin configure motion-graphics-music-video     # enter the Fal key
```

To use this copy as a plain skill instead, copy or symlink this folder to `~/.claude/skills/motion-graphics-music-video` (see [`../README.md`](../README.md#installing-a-skill)) and supply the key as `FAL_AI_API_KEY` as described in `references/credentials.md`. The author also publishes a variant with no image or video models: [motion-graphics-music-video-skill-noimage](https://github.com/makevoid/motion-graphics-music-video-skill-noimage).

## Changes from upstream

- Flattened: upstream keeps the skill under `.claude/skills/motion-graphics-music-video/`; here the skill's files are at the top of this folder.
- Not copied: the plugin manifest (`.claude-plugin/`), tests (`spec/`), `docs/icon-generation.md`, `scripts/Gemfile.lock` and `scripts/package-lock.json`.
