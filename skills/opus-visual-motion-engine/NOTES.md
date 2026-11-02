# opus-visual-motion-engine — notes

**Source:** [Lob0Garou/opus-visual-motion-engine](https://github.com/Lob0Garou/opus-visual-motion-engine) @ `6e73321`. MIT, © 2026 Yuri Queiroz Lobo ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it is

A gated pipeline for visual deliverables made as single-file HTML (reels, explainers, kinetic type, product films, diagrams, landing pages):

> gather real material → plan with a named direction → build from the template → render → **automated QA** → fix → compose a score → export

Every page follows a `seek(t)` contract (`window.DURATION`, `window.seek`), so each frame is a function of time.

| Path | What it is |
|---|---|
| `SKILL.md` | The steps and gates |
| `references/` | `reel-craft.md` (the quality bar: handoffs, AI tells, pacing), `motion-design.md`, `javascript-animation.md` (including GSAP discipline), `animation-primitives.md`, `typography.md`, `visual-design.md`, `cinematography.md`, `video-generation.md` |
| `assets/composition-template.html` | The `seek(t)` template: `camera()`, `cut()`, `hash01`, a `HANDOFFS` block, a score block |
| `scripts/qa.mjs` | **The automated QA** (below) |
| `scripts/export.mjs` | Frame-exact MP4 export through an ffmpeg pipe |
| `scripts/score.mjs` | A deterministic score and SFX from the page's cue sheet, mastered to −14 LUFS |
| `scripts/audio-data.mjs` | Music or voice → `window.AUDIO` (beats, onsets, per-frame loudness) injected into the page, with `hit`, `since` and `audioAt` helpers |
| `examples/` | Briefs for a motion graphic, kinetic type, a landing page and a product video, plus `motion-graphic.html` |

**`qa.mjs`** is the most complete render check in this repo. It checks:

- the same frame after out-of-order seeks (determinism);
- frozen timelines and dead air;
- text collisions measured on the glyph ink, and clipping at the frame edge;
- contrast and minimum type size (20 px at 1080p);
- that declared scene handoffs actually pair up;
- SVG draw-ons that are dead or snap.

It writes `report.json` and a contact sheet and exits non-zero until the page passes. The author's own fault-injection test caught 8 of 8 planted faults.

## When to use it

- **Automated QA for any HTML motion page.** Including HyperFrames compositions: add `window.DURATION = …; window.seek = t => tl.seek(t)` for the paused GSAP timeline.
- **As a daily-build gate.** Run it before a news explainer or overlay goes out. Text collisions, contrast and type size are exactly what goes wrong on data cards and straps.
- **`audio-data.mjs` and `score.mjs`.** A voice or music track as data the picture can read, and a quick deterministic score.

## Limits

- **DOM text only.** `qa.mjs` reads DOM text, so it cannot check text drawn inside a canvas or a Three.js scene.
- **GPU.** Its browser launch has no GPU flags, so WebGL-heavy pages may render black or slowly. Add `--use-angle=d3d11` on Windows (see [`../../tools/headless-render/`](../../tools/headless-render/NOTES.md) for a GPU probe).
- **Social loudness.** `score.mjs` masters to −14 LUFS (social). Broadcast is −23 LUFS (EBU R128); re-master for air.
- **Chromium only.**

## Requirements

Node 18+, `npm install` in `scripts/` (playwright-core), ffmpeg.

## Changes from upstream

- **Markers.** The skill and references tag rules with their sources, for example `[S:visualize.md]` (Anthropic's public skills), `[X]` (the author's own) and `[P:…]`. The key to those tags is upstream's `PROVENANCE.md`, which is **not copied** because it quotes a leaked Claude system prompt. The tags themselves are left in place.
- **Not copied:**
  - `PROVENANCE.md`.
  - `examples/brand-reel.html` and `brand-reel.md`, which use a real third-party brand.
  - The README (its benchmark is a single self-reported run) and `scripts/package-lock.json`.
- **Otherwise unchanged.**
