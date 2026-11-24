# anidoodle — notes

**Source:** [alexgreensh/anidoodle](https://github.com/alexgreensh/anidoodle) @ `4ae27d2` (5 Nov 2026), plugin version 0.10.1. Apache-2.0, © 2026 Alex Greenshpun. Read 24 November 2026. **Nothing copied:** it installs as a Claude Code plugin and updates itself that way. The skill alone is 17 MB.

## What it makes

**Hand-drawn art written as code**, in 32 styles. Each style is a way of making a mark: ballpoint, broken colour, chalkboard, charcoal erasure, coloured pencil, crayon, cut-paper collage, cyanotype blueprint, embroidery, flat vector, folk-tale storybook, ink and line-wash, isometric, low-poly 3D, marker comic, mid-century gouache, newsprint halftone, painted oil, paper-craft, pencil and watercolour, pixel art, risograph, rubber-hose, scratchboard, single-line engraving, stipple, sumi-e, toy brick, vintage scrapbook, woodcut/ukiyo-e and more.

- **One pure function per piece.** A still is that function called once, a loop is the same function on repeat, and a film adds a story and a score. It is seeded, so the same source redraws the same picture on any machine and at any size.
- **Marks are made in the order a hand would make them**, so every style can draw itself as a timelapse.
- **Music in code.** 21 genres, a band and orchestra, every mode, a theme per piece. It uses the CC0 VCSL instrument library (the same one as `starters/mg-styles-15`) and OpenAIR room impulse responses (**CC BY 4.0: credit "OpenAIR, Audio Lab, University of York"** when a room is used).
- **Outputs:** PNG at any scale, MP4 with score, GIF, WebM and APNG with alpha, and one self-contained offline HTML file.
- **Also:** voice-over with word-timed subtitles, consistent characters across shots, interactive web art, drawing lessons (step sheets and timelapses), three.js 3D and extruded type on the same frame-exact timeline, and launch-film specs.
- **Craft references** (`skills/anidoodle/references/`): storytelling, realism and craft, styles (31 full recipes and how to invent one), music, determinism and contract, working method, formats.

## When to use it

- **Explainers with a human hand:** chalkboard, cyanotype blueprint, ballpoint or newsprint halftone for diagrams, cutaways and animated infographics with drafted lettering.
- Section art and spot illustrations that share one hand, social loops and stickers, and title sequences.
- It covers more than our [`painted-animation`](../../skills/painted-animation/NOTES.md) skill (p5.brush watercolour cartoons) and is the better first try for illustrated work.

## Installing

```bash
/plugin marketplace add alexgreensh/anidoodle
/plugin install anidoodle@alexgreensh-anidoodle
```

Driving the engine directly (Node and Playwright Chromium):

```bash
node <anidoodle>/engine/tools/scaffold.mjs ~/art --still hero --film intro --format 9x16 --duration 60
cd ~/art && npm install && npx playwright-core install chromium
node tools/still.mjs hero --out out/hero.png --scale 2
node tools/render.mjs intro --out out/intro.mp4
node tools/gate.mjs hero                       # determinism, contract and dead air
node tools/verify-export.mjs intro --file out/intro.mp4
```

## Cautions

- **Privacy:** no telemetry, accounts or keys. The first render installs npm packages and a Playwright Chromium.
- The sound pack is optional and fetched by `engine/tools/soundfetch.mjs`.
- **Not tested here.** Facts are from the source at the commit named.
