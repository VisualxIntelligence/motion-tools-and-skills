# kinetic-type-vault — notes

**Source:** [arla6ka/design.how](https://github.com/arla6ka/design.how) @ `148b94c` (14 Nov 2026): 39 of the 80 visuals in `vault/`, the ones built on type. MIT, © 2026 Arlan Marat ([LICENSE](LICENSE)). Copied 15 November 2026. Each live at `https://design.how/vault/<name>`.

## What it is

**Thirty-nine ready-made kinetic-type effects**, each its own skill. Every folder has a `README.md` (what it is, how it works) and a `skill/` with:

- `SKILL.md`: a brief of what makes the effect, then **FIXED** steps (what makes it work; keep them) and **VARIABLE** values (words, colours, timing, fonts) that you may change, and a six-step workflow.
- `assets/template/`: the effect as **React + TypeScript** (`engine.ts` does the drawing, `card.tsx` mounts it, `params.ts` holds the variables, `fonts.css` the font stacks, `runtime/` the pause helper). Seven use three.js (`chroma-glow`, `fade-motion`, `glass-type`, `pixel-threshold`, `rush-type`, `swing-type`, `verb-type`); the rest need only React.
- `references/perf.md`: the performance contract (pause off screen and on a hidden tab, keep the clock across a pause, one still frame under reduced motion, pixel ratio capped at 2, dispose everything, at most six WebGL visuals per page).
- `scripts/check.mjs`: checks your copy still keeps the FIXED steps and the contract; rerun until it prints ok.

Type falls back to system faces; put a show's or brand's own face first in `fonts.css`. Two effects read images (`smear-type`, `pixel-threshold`), and ship them.

| Folder | Effect | What it does |
|---|---|---|
| [`smear-type`](smear-type/skill/SKILL.md) | Smear type | Two lines of heavy capitals that a soft cloud with a glowing edge uncovers, while pale ribbons churn through the ground and ink streaks across. |
| [`stack-type`](stack-type/skill/SKILL.md) | Stack type | One line of capitals stacked nine deep on a drum, every letter draining to the one solid row on its own beat while the outlined echoes scramble. |
| [`roll-type`](roll-type/skill/SKILL.md) | Roll type | Three short phrases taking turns, every word rolling up out of sight through glass as the next phrase rolls in under it. |
| [`warp-type`](warp-type/skill/SKILL.md) | Warp type | Six short sentences, half a second each, where the verb bends its own letters. |
| [`flip-type`](flip-type/skill/SKILL.md) | Flip type | One bold word that keeps becoming the next, each letter falling to a new row through a few random glyphs. |
| [`cloud-type`](cloud-type/skill/SKILL.md) | Cloud type | A line of white type that blows in as cloud, sharpens letter by letter, then lifts away as cloud again. |
| [`shutter-type`](shutter-type/skill/SKILL.md) | Shutter type | Two lines of type through a rolling shutter: whatever moves tears into bands, whatever is still stays whole. |
| [`pop-type`](pop-type/skill/SKILL.md) | Pop type | Motion drops in letter by letter, squashes as it lands, swells like a balloon and pops. |
| [`misprint-type`](misprint-type/skill/SKILL.md) | Misprint type | HOLD ON, two prints that never register; press and hold to pull them together. |
| [`verb-type`](verb-type/skill/SKILL.md) | Verb type | Five words, each acting out its own verb in its own colours, cut hard. |
| [`flood-type`](flood-type/skill/SKILL.md) | Flood type | A two-line word that falls in, floods the frame and tumbles out. |
| [`swing-type`](swing-type/skill/SKILL.md) | Swing type | Huge letters swinging past a fixed window, turning edge-on so the word never assembles. |
| [`rush-type`](rush-type/skill/SKILL.md) | Rush type | A word rests, then blasts toward you and tears into streaks of coloured light before the next one lands. |
| [`ink-flood`](ink-flood/skill/SKILL.md) | Ink flood | A pen writes a fat scribble, the scribble floods the frame, and its ink becomes the ground the next one is written on. |
| [`bond-type`](bond-type/skill/SKILL.md) | Bond type | Two words in a pixel face that unfold into a molecule, pixel bonds joining each letter to the next. |
| [`dash-cascade`](dash-cascade/skill/SKILL.md) | Dash cascade | Three-letter words built from fat scanline dashes, unfurling out of a dotted line and folding back. |
| [`wild-type`](wild-type/skill/SKILL.md) | Wild type | A design word types itself in, goes wild through one warp field, collapses home and un-types. |
| [`loud-burst`](loud-burst/skill/SKILL.md) | Loud burst | A sentence types itself in, one word heats up and bursts into coloured darts, and the line is thrown off the sides. |
| [`stamp-type`](stamp-type/skill/SKILL.md) | Stamp type | Four lines on highlight bars hop in, park and scatter, each leaving blocks of flat colour behind. |
| [`reality-split`](reality-split/skill/SKILL.md) | Reality split | A selected word splits into letter objects, scatters, is inspected letter by letter at huge scale, and pops back whole. |
| [`glass-type`](glass-type/skill/SKILL.md) | Glass type | Black serif type moving through one glass lens with a ripple in it, in three scenes that take turns. |
| [`sunset-slam`](sunset-slam/skill/SKILL.md) | Sunset slam | A word squashes, slams forward into an extruded retro logo trailing a fan of dawn colour, cools to a sticker and unwinds. |
| [`word-carousel`](word-carousel/skill/SKILL.md) | Word carousel | Four words on a three-slot conveyor that slams one slot left every half second, with a fourth hidden tiny behind the big one. |
| [`spike-type`](spike-type/skill/SKILL.md) | Spike type | A word knocked out of a pale ground, its edge chewed ragged and bristling with hundreds of hand-drawn spikes. |
| [`pixel-threshold`](pixel-threshold/skill/SKILL.md) | Pixel threshold | A word printed into a flat colour poster in hard pixel blocks, collapsing and resolving into the next word. |
| [`glitch-word`](glitch-word/skill/SKILL.md) | Glitch word | A word in a bright badge that tears into shoved bands in short bursts. |
| [`fade-motion`](fade-motion/skill/SKILL.md) | Fade motion | A pixel word trailing into light, its fade built from two hundred overlapping copies. |
| [`kinetic-typography`](kinetic-typography/skill/SKILL.md) | Kinetic typography | One heavy letter cut into a grid of tiles, each slipping on its own wave, so the letter ripples like cloth. |
| [`liquid-metal`](liquid-metal/skill/SKILL.md) | Liquid metal | One word as flowing polished metal on black, its reflection streaming as the pointer moves. |
| [`blur-glow`](blur-glow/skill/SKILL.md) | Blur glow | A crisp rounded word in a soft gradient-mapped glow on light paper, dissolving into the next word and colour. |
| [`text-reveal`](text-reveal/skill/SKILL.md) | Text reveal | Two small serif text blocks that un-blur into focus through a cloudy mask, corner by corner, then clear and return. |
| [`ransom-note`](ransom-note/skill/SKILL.md) | Ransom note | Short phrases spelled in mismatched paper scraps that rise in one by one, hold and lift away. |
| [`chroma-glow`](chroma-glow/skill/SKILL.md) | Chromatic glow | A word that glows on a coloured wall and splits into warm and cool copies at its edges. |
| [`blur-reveal`](blur-reveal/skill/SKILL.md) | Blur reveal | Coloured panels in turn, each short line dissolving in out of a blur and drifting into focus. |
| [`design-tiles`](design-tiles/skill/SKILL.md) | Design tiles | A short sentence as words on bold colour fields, packed into one bar, each field stepped to its letters. |
| [`typer`](typer/skill/SKILL.md) | Typer | A line that types itself in, each letter flickering through pills and highlights before it lands. |
| [`pixel-cycle`](pixel-cycle/skill/SKILL.md) | Pixel cycle | One character at a time, breaking into big blocks and resolving sharp, then swapped for the next. |
| [`pixel-scan`](pixel-scan/skill/SKILL.md) | Pixel scan | A diagonal band assembles a word out of a spray of tiny blocks, then a pool of blocks follows the pointer. |
| [`tile-field`](tile-field/skill/SKILL.md) | Tile field | A word made of tiny tiles, lit by a slow colour wave and a soft pointer light that leaves a wake. |

## When to use it

- **Titles, idents, section openers, social cuts and lower-third accents** where a word should act out its meaning. Timing and words sit in `params.ts` as VARIABLE values, so retiming to a beat or a voice is mostly a change of numbers.
- **Web pages** as they stand: they are built to sit in a page.
- Most run on their own loop; a few also answer the pointer (`misprint-type` pulls together on press and hold, `liquid-metal` streams with the pointer, `pixel-scan` and `tile-field` follow it). Off-pointer they still play.

## Rendering an effect to video

The effects are web components, not time-pure scenes: they run on `requestAnimationFrame` and `performance.now`. To film one, mount its card full-frame in a small page (Vite + React), then record that page with [`../../starters/dioramas/scripts/render-video.mjs`](../../starters/dioramas/NOTES.md#rendering-a-diorama-to-video), which virtualises the clock so frames are exact. Headless Chrome does not set reduced motion, and the pause helper sees the card on screen, so the loop runs. **Untested here:** check the first render against the effect in a browser, and render whole loops for clean cuts.

## Installing

Install the `skill/` folder of each effect you want under its own name, for example `stamp-type/skill/` to `~/.claude/skills/stamp-type/` (see [`../README.md`](../README.md#installing-a-skill)). Upstream: `npx skills add https://design.how/vault/stamp-type`.

## Changes from upstream

- **Copied unchanged:** the 39 folders and `LICENSE`.
- **Not copied:** the other 41 vault visuals (shader fields, photo galleries, cursors and interface pieces such as liquid UI, smooth corners and colour-depth buttons), design.how's skills and its four design systems. The type tools that fit go in [`../../design/`](../../design/README.md); the rest is described in [`../../docs/reference-only.md`](../../docs/reference-only.md#14-seventh-survey-reviewed-not-copied).
- **Not run here.** Nothing was executed during the copy.
