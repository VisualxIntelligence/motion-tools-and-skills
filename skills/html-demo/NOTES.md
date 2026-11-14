# html-demo — notes

**Source:** [MengTo/Skills](https://github.com/MengTo/Skills) @ `3cc9345` (14 Nov 2026): `agent-skills/web-design/html-demo/`. MIT, © 2026 Meng To ([LICENSE](LICENSE)). Copied 14 November 2026.

## What it makes

**A live app window that shows a product working, drawn in HTML instead of recorded.** A Mac-style window plays the app step by step (3–5 steps of 4–8 s, 18–30 s in all) with a scripted pointer, a steps bar underneath, real labels and real results. It looks like a screen recording, but every frame is computed, so it stays sharp at any size, its words are real text, and it can loop, jump to a step, scrub, freeze for a screenshot, and stand still under reduced motion.

The mechanism is the one this repo is built on: **every frame is a pure function of one number.** Each step's `View({ t })` draws everything inside the window at a fixed 1200 × 750 stage from `t` alone, and one CSS scale (`--k = width / 1200`) fits the stage to any width. Timers, effects and responsive layout inside the window are ruled out, because each breaks scrubbing, screenshots or the pointer's aim.

| Path | What it is |
|---|---|
| `SKILL.md` | The mechanism, an 8-step workflow, rules each paired with the failure it prevents, timings |
| `references/contract.md` | The step contract (`{ id, name, dur, View }`) and the `StepWindow` props |
| `references/film.md` | The hero variant: one `frameAt(t)` for several workflows end to end, with a camera that follows the work |
| `references/brief.md` | A shared brief for helper agents building one window each |
| `scripts/StepWindow.jsx`, `step-window.css` | The React window: clock, scaling, steps bar, `Cursor`, and `ease`, `typed`, `cue`, `held`, `glide` |
| `scripts/step-window.js` | The same window in vanilla JS (`play`, `seek`, `pause`, `resume`, `setStill`, `state`) |
| `scripts/example-steps.jsx`, `preview-plugin.mjs` | A worked step file; a Vite preview helper |
| `scripts/shoot.mjs` | Frames every 0.5–1 s, live or frozen, for the compare-and-fix rounds (Playwright) |
| `demo/index.html`, `demo/PROMPT.md` | A vanilla demo of Fil for Mac making a picture, with a scrubber, and the prompt that made it |

Timings worth keeping: the pointer arrives 0.3–0.6 s before a click, presses 0.15–0.2 s and glides 0.5–0.9 s; each step has 0.3–1 s to see the start and at least 1 s holding on the result; a result appears the way the app shows it (a working state, then the result, then a settle), never popping in.

## When to use it

- **Product demos on a landing or download page**, instead of GIFs or MP4s of the UI.
- **Product inserts in a film.** The window is time-pure, so it renders frame-exact. Freeze it with `seek()` (vanilla) or the `start` prop (React) and step it, or record it with [`../../starters/dioramas/scripts/render-video.mjs`](../../starters/dioramas/NOTES.md#rendering-a-diorama-to-video), which virtualises `performance.now`. `--clip` on the window element gives a window-only plate. Not tested here.
- Boundary from upstream: a real recording of a real browser is a different job, and a fixed-length film from a page is the [`html-explainer-video`](../html-explainer-video/NOTES.md) or [`video-shotcraft`](../video-shotcraft/NOTES.md) route.

## Requirements

- React 18+ for `StepWindow.jsx`, or none for `step-window.js`.
- Node and Playwright for `shoot.mjs`.
- **Real material.** The skill insists on the app's real labels, results and pictures, copied from its source or screenshots, never invented, and on one example subject used in every window. Never a client's or real person's canvas.

## Installing

Copy or symlink this folder to `~/.claude/skills/html-demo/` (see [`../README.md`](../README.md#installing-a-skill)). Upstream: `npx skills add https://github.com/MengTo/Skills --skill html-demo`.

## Changes from upstream

- **Copied unchanged:** `SKILL.md`, `references/`, `scripts/`, `demo/index.html`, `demo/PROMPT.md`; the repo's `LICENSE` added.
- **Left out:** the demo's pictures (`knight.webp`, `cathedral.webp`, `avatar.webp`) and `preview.jpg`, so `demo/index.html` shows empty image slots here. Run the demo from upstream, or drop in your own pictures under those names. Also `agents/openai.yaml` (Codex interface metadata).
- **References to sibling skills** (`browser-video-recording`, `website-to-motion-design`) point at Meng To's repo; neither is copied.
- **Not run here.** Nothing in this folder was executed during the copy.
