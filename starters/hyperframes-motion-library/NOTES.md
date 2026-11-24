# hyperframes-motion-library — notes

**Source:** [nutllwhy/hyperframes-motion-library](https://github.com/nutllwhy/hyperframes-motion-library) @ `98c40ca` (29 Oct 2026), version 1.6. MIT, © 2026 栗噔噔 (nutllwhy) ([LICENSE](LICENSE)). Copied 24 November 2026. Upstream is in Chinese; this note is the English guide. Live demo: <https://nutllwhy.github.io/hyperframes-motion-library/>.

## What it is

**A local library of 27 parameterised information graphics for talking-head and explainer videos**, each a standalone HyperFrames project. Copy, numbers and colours are passed in as variables, so nothing in the animation is edited by hand. A local web app (`npm run dev`) previews, edits presets and renders; a batch workbench renders a whole video's graphics from one `motion-plan.json`.

| Group | Templates (id: what it shows) |
|---|---|
| Data (数据可视化) | `bar-chart-grow` bars growing · `number-counter` counter · `line-chart-draw` line drawing on · `metric-pulse` key metric · `big-number-card` big-number conclusion · `before-after-stat` before/after numbers · `horizontal-bar-compare` horizontal bars · `top-rank-list` top-N ranking · `turning-point-line` trend with an inflection · `compact-number-callout` full-screen number · `donut-progress` donut share (16:9 and 9:16) |
| Explainer (知识讲解) | `source-citation-card` data source card · `status-split` status change · `concept-spotlight` concept card · `three-step-flow` three steps · `myth-fact-swap` myth vs fact · `key-point-marker` key-point marker · `checklist-pop` checklist · `timeline-scan` timeline · `cause-chain` cause → effect chain · `mode-choice-compare` side-by-side options · `iteration-loop` iteration loop · `keyword-blast` keyword hit · `chapter-title` chapter title (16:9 and 9:16) · `quote-card` quote with attribution |
| Overlay (透明叠加) | `stat-duel` two numbers compared · `number-impact` extreme-value scale |

Each template has `index.html` (the HyperFrames composition), `design.md` (design notes), `meta.json` and **three presets** (`presets/default.json` plus two scenarios). Durations are 3.2–7 s.

- **Four styles** that change type, palette, material, line and motion together (`styles/`): `classic-orange` (neutral black, white, orange accent only; the default), `paper-editorial` (warm paper, serif, ink lines: for in-depth explainers), `sketch-notes` (hand-drawn notes: for teaching), `bold-geometry`. A style is chosen once per video (`styleId` at the top of the plan) and can be overridden per scene.
- **Three output formats per template:** MP4 on the style's background; **transparent MOV (ProRes 4444)** to lay over a presenter; transparent WebM.
- **Director rules** (`director-rules.json`): four layout modes with measured occupancy targets: *fullscreen* (fill 42–96 % of the safe area), *overlay* (12–58 %, clear of the presenter and subtitles), *data*, *transition*. Global rules forbid **numbers, times or states that are not in the voice-over**, unexplained English labels and template numbers, and decoration added only to fill space.
- **Motion plan** (`motion-plan.schema.json`, `examples/motion-plan.example.json`): an agent turns a timecoded voice-over script into one task per graphic, each with the original line, its purpose, the layout mode, must-show and must-not-add information. The workbench imports it, checks it and renders the tasks in order to `renders/projects/<name>/`, named `index—timecode—template`.
- **Checks:** `npm run check` (styles in sync, catalogue valid, and a **layout audit** that measures how far the real content spreads: area, horizontal and vertical span, so a big empty panel does not pass as "full"); `check:templates`; `check:styles -- --screenshots`.
- v1.6 "de-templated" the default look: no glows, glass cards, gradient bars or capsule labels; mask rises, wipes and growing lines instead of bounces and blur-zooms; numbers land without overshoot. That suits news.

## When to use it

- **Number and fact inserts for the LinkedIn news explainers and Al Jazeera pieces**: a counter, a before/after, a ranking, a source card, a myth/fact swap, a chapter title. The "nothing that is not in the voice-over" rule is the same as our news-insert rules ([`docs/guides/news-insert-rules/`](../../docs/guides/news-insert-rules/)).
- **Transparent overlays** on presenter footage (ProRes 4444 for Premiere or Resolve).
- **A batch of graphics for one video** from its script, in one consistent style.

## Requirements

Node 18+, ffmpeg (for the ProRes MOV), Chrome or Chromium. `npm install` pulls only `playwright-core`; renders call `npx --yes hyperframes@0.6.115 render`, which downloads HyperFrames on first use.

**Default copy and fonts are Chinese** (PingFang / Source Han Sans stack). For English or Arabic, write your own preset JSON (same keys as `presets/default.json`) and add an Arabic font to the style's font stack before use; Arabic has not been tried.

```bash
cd starters/hyperframes-motion-library
npm install && npm run dev                     # web app: library, presets, styles, batch workbench
npm run render -- big-number-card ./my-preset.json mp4 my-card --style=paper-editorial
npm run render -- donut-progress ./p.json webm share --portrait      # transparent, 9:16
npm run check
```

**Tested here 24 November 2026:**
- `npm run check` passed: styles in sync, catalogue valid, and the layout audit passed all 27 templates and both portrait variants (content spread 49–72 % of area).
- `big-number-card` rendered with an **English preset** ("Shipping speed 3.2x") in the `paper-editorial` style: 150 frames, 5 s, 1080p. The frames show the mask rise, the counter landing on 3.2 without overshoot, and the wipe exit. (We called a locally installed `hyperframes@0.6.115` in place of `npx --yes`, which this environment does not allow; the result is the same.)
- The `npm run dev` app and transparent MOV export were not tried.

## Changes from upstream

- **Copied:** `templates/` (with their design notes, presets and snapshot sheets), `styles/`, `app/`, `scripts/`, `catalog.json`, `director-rules.json`, `motion-plan.schema.json`, `examples/`, `references/` (Chinese notes on reference films and data-graphic sources), `SKILL.md`, `SYSTEM.md`, `AGENT_GUIDE.md`, `README.md`, `package.json`, `package-lock.json`, `.gitignore`, `LICENSE`. Unchanged.
- **Left out:** `renders/` (7 MB of sample films; the app shows a placeholder until you render) and `redskill-submission/` (a copy of the project packaged for a Chinese skill store). `npm run prepare:release` and `sync:redskill` expect that folder and will fail here; nothing else does.
- **Added:** this `NOTES.md`.
