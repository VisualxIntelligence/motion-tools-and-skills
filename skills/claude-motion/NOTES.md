# claude-motion — notes

**Source:** [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) @ `e627941`: the four skills in `.claude/skills/` and `scripts/sheet.mjs`, `scripts/wave.mjs`. MIT, © 2026 whaleyxbt ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it is

Four short skills from a Remotion motion toolkit. Their rules are written for Remotion, but the numbers and the workflow carry over to GSAP and HyperFrames unchanged.

| Folder (skill name) | What it gives |
|---|---|
| `claude-motion-motion-design/` | **Taste rules with numbers** (see below) |
| `claude-motion-review-loop/` | A **mandatory frame review**: render a contact sheet at the timeline beats, read it against a checklist, fix, re-render, and never claim a fix you have not re-rendered and looked at |
| `claude-motion-sound-design/` | A cue sheet written against the **same `timeline.json`** as the picture; a table from visual event to sound; gain hierarchy (hero 0.25–0.35, support 0.08–0.2, pad about 0.03 ducked 65%); one impact per video |
| `claude-motion-web-sims/` | One HTML or three.js page with a pure `render(t)`, captured frame by frame at 60 fps |

**The taste rules (`claude-motion-motion-design`):**

| Topic | Rule |
|---|---|
| Single source of time | Every beat is a named timestamp in `timeline.json`, read by both picture and sound |
| Easing | easeOut `cubic-bezier(0.16,1,0.3,1)` for arrivals; easeIn `(0.6,0,0.9,0.35)` for exits; easeInOut `(0.65,0,0.35,1)` for moves; linear only for continuous motion |
| Exits | About half the entrance time |
| Springs | A damping, stiffness and mass table |
| Text timing | 0.09 s word stagger; 0.035 s per typed character |
| Reading holds | At least 1 s, plus 0.25 s per word beyond three; at least 2 s for the final line |
| Layout and colour | A 60 px safe area; one accent colour |
| First frame | Frame 0 is never black |

**Scripts:**

- **`scripts/sheet.mjs`.** A contact sheet with **one tile 0.3 s after each beat** in `timeline.json`, so every tile shows a settled state. `--every`, `--from` and `--to` scrub a transition.
- **`scripts/wave.mjs`.** The soundtrack's waveform with every timeline beat drawn on it, plus integrated loudness and true peak. Every hit should sit on, or just after, a beat line.

Both expect to sit in a film project's `scripts/` folder next to `timeline.json`, with renders in `out/`.

## When to use it

- **Adopt `timeline.json` as the single source of time** for picture, sound and checks in any daily explainer.
- **Use the review loop and `sheet.mjs`** as the "look at your own frames" step.
- **Use `wave.mjs`** to check that sound hits land on picture beats.

## Notes

- **Loudness.** The skills master to **−14 LUFS** (social). For broadcast use −23 LUFS (EBU R128).
- **Remotion paths.** The skills refer to the upstream project's Remotion files (`src/lib.ts`, `npm run sfx`, `sfx/cues/`), which are not copied. Read those as "your project's shared helpers".
- **Sound engine.** For sound itself, the repo's [`mgaudio`](../../starters/mg-styles-15/lib/audio/README.md) and [`lemo-core`](../../tools/lemo-core/NOTES.md) are deeper than upstream's `sfx/` engine.

## Changes from upstream

- **Renamed.** The skills are now `claude-motion-motion-design`, `claude-motion-review-loop`, `claude-motion-sound-design` and `claude-motion-web-sims` (upstream: `motion-design`, `review-loop`, `sound-design`, `web-sims`), and their folders match. This avoids clashing with other installed skills of the same name.
- **Install.** Install each subfolder as its own skill.
- **Left out:**
  - The Remotion project (`src/`, `examples/`).
  - The `sfx/` engine.
  - The `sims/` kit, which carries a default creator watermark.
  - About 15 MB of preview GIFs, and the README.
