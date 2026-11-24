# Style Library — Guide

The library of motion-graphic card styles that **Agent 3** pulls from to add tiered cards to a video. Each "style" is a named visual identity (e.g. a Vox-inspired explainer look, or a smooth-animated YouTuber look) with its own set of card variants. This file is the contract: read it before adding a style or a card.

## Mental model

```
style-library/
├── GUIDE.md                  ← this file (the rules)
├── registry.json             ← GENERATED master index of every style + card (Agent 3 reads this)
├── _blueprint/               ← copy-me skeleton for a new style (never edit in place; clone it)
└── NN-slug/                  ← one folder per style, e.g. 01-vox-explainer/
```

One style = one folder. We build **one style fully before starting the next**.

## Identifiers

Three-part scheme (numeric prefix + slug + dotted IDs):

- **Style folder:** `NN-slug` — e.g. `02-vox-explainer`. `NN` is a zero-padded order/ID, `slug` is human-readable kebab-case.
- **Style id:** the slug without the number — e.g. `vox-explainer` (stable even if the number changes).
- **Card id:** `<style>.<tier>.<purpose>[.<variant>]` — e.g. `vox-explainer.t1.stat`, `vox-explainer.t2.list.compact`. Stable, unique, self-describing.

## A style folder

```
NN-slug/
├── style.json        ← manifest: identity + palette + fonts + motion + the list of cards (with slots, tiers, purposes)
├── DESIGN.md         ← the design spec: palette, typography, motion rules, "what not to do" (the shared design format)
├── tokens.css        ← style-scoped CSS variables (colors, fonts, easings). Cards reference these, never hardcode.
├── references/       ← the reference images you upload for this style (the source of truth for the look)
├── cards/
│   ├── tier1/        ← full-screen takeovers (thesis, big stat, section marker, quote)
│   ├── tier2/        ← supporting cards that keep the speaker visible (label, list, equation, lower-third)
│   └── <custom>/     ← optional "innovations" — any card kind that doesn't fit tier1/tier2
└── preview/          ← per-card preview: <card-id>.mp4 (2-3s loop) + <card-id>.png (poster)
```

Committed: `style.json`, `DESIGN.md`, `tokens.css`, the card `.html` files, the design specifications, and any original preview posters. The student release excludes third-party reference screenshots. Gitignored: the heavier preview **MP4** loops (regenerable from the cards).

## The card contract

Every card is a **standalone HyperFrames sub-composition** — a self-contained `.html` that previews and renders on its own, and that Agent 3 mounts into a video via `data-composition-src`. Each card MUST:

1. Have a root `<div>` with `id`, `data-composition-id`, `data-start="0"`, `data-width="1920"`, `data-height="1080"`.
2. Register exactly one **paused** GSAP timeline on `window.__timelines["<data-composition-id>"]` (key === composition id).
3. Pull all colors / fonts / easings from `tokens.css` variables — never hardcode hex or font names. (This is the "bespoke layout, shared tokens" rule: layouts are hand-built per style; the palette/type lives in tokens so it stays consistent and tweakable.)
4. **Background discipline by tier:**
   - `tier1` (takeover) → opaque full-frame background (it replaces the video).
   - `tier2` (support) → transparent everywhere except the card itself (it overlays the video; never cover the speaker's face).
5. Expose its text as **named slots**: elements carrying `data-slot="<name>"` (e.g. `data-slot="headline"`). Agent 3 fills slot text per beat. Declare every slot in `style.json` (name, type, max chars) so the agent knows what to fill.
6. Be **deterministic** — no `Date.now()`, no unseeded `Math.random()`, no network fetches.

A card is "done" when it lints clean, previews correctly in the Studio, and has a rendered preview MP4 + poster.

### Standalone vs mounted form

Cards are authored as **standalone compositions** — the `data-composition-id` div sits directly in `<body>` and the card includes its own `<script src=".../gsap.min.js">`, so it previews/renders on its own. When **Agent 3 mounts** a card into a real video it wraps the card in a `<template>` and references it with `data-composition-src` (the HyperFrames sub-composition form); the parent provides GSAP and `data-duration`. The wrap is a mechanical transform Agent 3 performs at assembly time — library cards stay in standalone form.

## Tiers & purposes (the taxonomy Agent 3 queries by)

- **tier1 — takeover** purposes: `thesis`, `stat`, `section`, `quote`, `overview`
- **tier2 — support** purposes: `label`, `list`, `equation`, `definition`, `lower-third`
- **custom** — anything else; give it a clear purpose tag.

Agent 3 asks the registry for "a `tier1` `stat` card in style `vox-explainer`", fills the slots, times it to the transcript.

## The build loop (per style)

1. **Scaffold:** `node scripts/style-library/new-style.mjs <NN> <slug>` → clones `_blueprint/` to `NN-slug/`.
2. **Upload references** into `NN-slug/references/`.
3. **Define the look:** fill `DESIGN.md` + `tokens.css` + the identity fields of `style.json` from the references.
4. **Build cards:** author each card `.html` under `cards/`, add its entry (id, tier, purpose, slots, file) to `style.json`. Lint each.
5. **Preview:** render a 2-3s loop + poster per card into `preview/` (see below).
6. **Index:** `node scripts/style-library/build-registry.mjs` → regenerates `registry.json`.
7. **Review & iterate** against the references, then move to the next style.

## Previews

Motion is half the identity, so previews are short MP4 loops (2-3s) + a poster PNG, one per card, in the style's `preview/`. Because each card is a valid composition, a preview is produced by rendering the card on its own (via the HyperFrames CLI) and grabbing frame 1 as the poster. The preview script is added once the first real card exists (so it's tested against something real).

## Notes

- Nate's `style-templates/` (dark-graph-paper, left-glass-popout) are **reference only** — not part of this library. Borrow ideas, don't port wholesale.
- `MOTION_PHILOSOPHY.md` and `.claude/skills/hyperframes/` (palettes, transitions, typography, visual-styles) are shared craft resources every style can draw on.
