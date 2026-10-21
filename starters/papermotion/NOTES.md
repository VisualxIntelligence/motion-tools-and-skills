# papermotion — notes

**Source:** [francozanardi/papermotion](https://github.com/francozanardi/papermotion) @ `433e7ce`. MIT, © 2026 Franco Zanardi ([LICENSE](LICENSE)). Upstream calls it experimental and written entirely by AI agents under human direction: expect APIs to change.

## What it is

A TypeScript engine for short **paper-cutout films** made entirely in code (no image or music models, no assets), built to be driven and extended by an agent. A film is a set, a cast and a performance on top of a generic engine, so a 20-second short is a few hundred lines.

| Module (`src/`) | What it gives you |
|---|---|
| `paper` | The paper look: torn edges that boil, fibre texture, drop shadows, rim light from a scene light, translucent layers, light shafts |
| `rig`, `motion` | Spring-driven bone skeletons with lag, overlap and follow-through; legged gaits; strands for tails and hair; swimming and flying; steering and boids; planned leaps |
| `physics` | A deterministic Verlet world: wind, ground, one-way surfaces, rigid plates, ropes, soft bodies |
| `scenery`, `weather`, `fx` | Ridges, parametric flora, scatter with wind sway; stateless rain and snow; particles, footprints, paper flames with smoke and embers |
| `camera` | Spring-follow camera with parallax layers by depth, zoom and handheld drift |
| `direction` | `Beats` (a performance as a state machine of timed and conditional beats), `Edit` (a shot list over one simulation), intents such as `ramp` and `envelope` |
| `audio` | Sound fired by the simulation's own events (a footstep sounds where a foot lands): voices, instruments, music, a mixer |
| `stage` | Fixed-timestep stage with pre-roll and strict frame order, probes, grade, grain, letterbox, transitions |

Tools in `scripts/`: offline render in headless Chromium, one page per core, piped to ffmpeg (`pnpm render <film>`, `--draft` for half resolution); frame grabs with printed state probes (`pnpm grab`); contact sheets (`pnpm sheet`); a soundtrack-only mix with spectrogram, loudness and cue list (`pnpm listen`) so the agent can "hear".

The skill is in `.claude/skills/papermotion/` (`SKILL.md` plus references on the engine API, scenes, characters, art direction, sound, inspection and pitfalls). [`docs/field-notes.md`](docs/field-notes.md) collects what the author's agents learned.

## When to use it

- Gentle, character-led pieces: idents, festive or seasonal spots, children's or explainer shorts in a paper-craft look, with physically believable motion that would be slow to keyframe.
- As a study of **simulation-driven animation** (motion from springs and intents, not keyframes) and of sound generated from the same events as the picture, both transferable to Three.js work.

## How to start a film

Upstream recommends a fresh project from its template rather than working in this folder, so the agent gets its own copy of the engine to extend and is not tempted to copy the example films:

```
npm create papermotion@latest my-films
cd my-films && pnpm install
npx playwright-core install chromium     # plus ffmpeg on the PATH
pnpm render hello
```

Then in Claude Code: `/papermotion make a 10-second short about a paper boat caught in the rain`. If you work in this folder instead, tell the agent not to open `examples/` (its `AGENTS.md` says the same).

## Requirements

Node 22.18+ (TypeScript scripts run natively), pnpm, ffmpeg, a Chromium for playwright-core (or `CHROMIUM_PATH`).

## Changes from upstream

None to the copied files. Left out: `pnpm-lock.yaml`, the CI workflows and `.agents/skills/` (the same skill for other agents). Note that several example films (`examples/`) star the Clawd character, Anthropic's mascot: fine for study, but use your own character for anything published.
