# hyperframes-motion-reel — notes

**Source:** [Sunwood-ai-labs/hyperframes-motion-reel-skill](https://github.com/Sunwood-ai-labs/hyperframes-motion-reel-skill) @ `be78681`, `SKILL.md`. MIT, © Sunwood AI Labs ([LICENSE](LICENSE)). Translated from Japanese on 22 October 2026.

## What it makes

A beat-locked motion-graphics reel in **HyperFrames** (HTML + GSAP + SVG + Canvas) from a one-line theme. It is the HyperFrames port of the author's Remotion reel skill, written so the reel can be made **without needing Remotion's Company Licence**. It is the only HyperFrames-specific skill in this repo.

**How it is built:**

- **One timeline.** Exactly one paused GSAP timeline, registered at `window.__timelines["main"]`, with a pure `render(t)` driven by an `ease: "none"` proxy tween.
- **Beat grid.** All times come from one config as beats, `b(n) = n × 60 / BPM`, never as hard-coded seconds. At 120 BPM and 60 fps, one beat is 0.5 s, or 30 frames.
- **HyperFrames structure.** `data-composition-id`, `data-start`, `data-duration`, `data-width`, `data-height`, and `<audio data-track-index>` for the soundtrack.
- **CLI workflow.** `npx hyperframes init`, `lint`, `check`, `snapshot --at`, then `render --fps 60 --quality draft|delivery`, followed by ffprobe and ffmpeg spot checks against the snapshots.

**HyperFrames pitfalls it records:**

- Properties set only on the "from" side of a `fromTo` vanish under parallel-worker seeks.
- CSS must be inline in `index.html`, or font embedding silently fails.
- Don't tween `visibility` on `.clip` elements.
- External scripts are hoisted before the DOM.
- Snapshots can differ from the final render.

## When to use it

- **As the HyperFrames rule sheet** for any GSAP composition, not only reels.
- **For beat-synced reels, stings and openers** in HyperFrames.

## Cautions

- **No pinned version.** It does not pin a HyperFrames version, so check commands and attributes against the installed CLI (`npx hyperframes --help`).
- **Needs the HyperFrames skills.** It relies on HyperFrames' own domain skills (`hyperframes-core`, `-animation`, `-keyframes`, `-creative`, `-registry`, `-cli`, `-audio`), which are installed with HyperFrames and not included here.
- **Two pieces are described but not shipped:** a `sync-config.mjs` script, and the Node WAV beat generator.
- **Creative direction is generic.** It aims at "Behance / OFFF / Awwwards level". Pair it with a style prompt from [`../../prompts/film-styles/`](../../prompts/film-styles/README.md) and [`../motion-design-principles/`](../motion-design-principles/NOTES.md).

## Changes from upstream

- **Translated.** From Japanese to English; the description now carries English trigger phrases.
- **Otherwise unchanged.**
- **Left out.** The VitePress docs site, CI, READMEs and `package-lock.json`.
