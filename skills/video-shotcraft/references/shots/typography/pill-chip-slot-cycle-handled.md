---
name: pill-chip-slot-cycle-handled
summary: In a white-ground sentence "Your `chip` Handled", the word inside a dark capsule rotates like a vertical roller, the capsule width stretching and contracting smoothly by interpolating pre-measured text widths, the text on both sides naturally pushed apart and drawn back, with grey ghost items at 13% opacity showing above and below the capsule
use_when: "We handle ___ for you" style selling-point sentences; a one-line wrap-up of a SaaS feature list; the key-visual beat of a brand film on a light ground
duration: about 5.0s (150f@30fps: rest → 3 switches (0.25/0.47/0.69) → tail rest)
energy: Medium (a steady three-beat rhythm, with the width stretching the only continuous motion)
---

## Intent
There are two schools of word-slot rotation: make the sentence dodge the change (a fixed-width roller), or make the sentence **accept**
the change (the capsule widens and the text on both sides is pushed apart). This card is the latter; the cost is that the widths must be calculated accurately,
and the payoff is a sentence that reads as alive — "Your" and "Handled" are pushed along, and the audience feels the word inside the capsule
has weight. The grey ghost items showing above and below are the second marker: they signal explicitly that "this is a list that can roll",
making the audience expect another word to come.

## Motion core
- Width pre-measurement: during setup a hidden `<span>` measures `offsetWidth` word by word, adds 74px of padding to each
  and stores it as `widths[]` (with a `o.w.length·13` fallback, guarding against being unmounted and unmeasurable at setup)
- The position quantity `pos` is accumulated from 3 windows: switch points `[0.25, 0.47, 0.69]`, each window 0.12
  (≈18f), easing `E.inOutCubic` — **eased at both ends**, corresponding to "the roller starting and settling"
- The inner column `colIn` moves vertically `-pos·48`px (row height 48 = capsule height); capsule width takes
  `lerp(frac, widths[ci], widths[ci+1])`, **interpolated within the frame** so the stretch is continuous,
  and the `flex:none` text on both sides is naturally pushed apart by the flex layout
- Ghost items sit outside the capsule (inside chipWrap) at -38px above / 58px below, taking the text of the neighbours before and after `near = round(pos)`,
  shifting slightly with the scroll by `(pos-near)·48·0.5` (**half-speed parallax**, half as fast as the word inside
  the capsule, which is what makes it look like an "outer ring")
- Ghost item opacity `0.13 · (0.4 + settle·0.6)`, `settle = 1 - min(1, |pos-near|·3)`
  — fainter mid-scroll, clearest once settled
- Each row has a two-part emoji + word structure (emoji 18px, word 700 22px white text),
  with the capsule on a `#1a1c24` ground + `0 8px 24px rgba(20,22,40,.22)` shadow + `overflow:hidden`

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Word list | 4 words + emoji (Shots/Camera/Sound/Renders — the shots / camera moves / sound effects / renders video-shotcraft takes care of), 3 switches | The word-length difference determines how the push-apart feels: in the demo the shortest is 5 letters and the longest 7; a difference >2x makes the capsule jump too hard and the sentence's centre of gravity swings left and right |
| Switch points | `[0.25, 0.47, 0.69]`, window 0.12 (≈18f) | About 0.10 (≈15f) of rest between segments to read the word; the rest before the 0.25 start lets the audience recognise the sentence pattern first |
| Easing | `E.inOutCubic` | Easing at both ends is what looks like a roller starting and stopping; outCubic (eased only at the end) reads as being flung up, and the capsule width also changes abruptly with it |
| Capsule | height 48px, corner radius 99, `#1a1c24`, width = text width + 74 | +74 is left and right padding + the emoji slot; <50 and the word hugs the edge, >100 and the capsule fattens into a button |
| Ghost items | -38 above / 58px below, base opacity 0.13 | 0.13 is the sweet spot of "visible but not stealing"; >0.25 reads as three lines of text side by side, not ghosts; delete them and the list hint is gone |
| Ghost parallax | `(pos-near)·48·0.5` (half speed) | Half speed is the source of the "outer ring is farther" depth; at the same speed the three rows look like one block sliding, and the ghosts lose their meaning |
| Sentence font size | 30px/800 on both sides, 22px/700 inside the capsule | Smaller inside the capsule than the sentence is the correct hierarchy (the badge depends on the sentence); equal or larger reads as two headlines fighting |
| Colour scheme | ground `#fbfbfd`, sentence `#15171d`, capsule white text | Light ground + a single dark block is the identity card of this card; a dark-ground version makes the capsule vanish and needs the whole set re-matched |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **Width relies on `offsetWidth` measured at setup**: when the font has not finished loading what is measured is the fallback font's
  width, and the capsule comes out too narrow or too wide — when porting, make sure the webfont is ready before measuring, or switch to
  an offscreen canvas `measureText`; the `length·13` fallback only guarantees not crashing, not accuracy
- Keep the word-length difference within 2x: width adaptation is both the selling point and the risk of this card,
  and a jump of 5→8 letters (e.g. `Sales`→`Workflow`) is already the acceptable upper limit; larger and the two sides of the sentence swing dazzlingly
- The text on both sides must be `flex:none`: otherwise flex will compress them rather than move them,
  and "pushing apart" becomes "the text being squashed"
- The ghost item text takes the neighbours of `round(pos)`, so exactly halfway through a switch (pos=x.5) the text
  **jumps once** — this happens when `settle` has pressed it to the faintest, and is basically imperceptible to the naked eye; but if
  the opacity is raised to 0.25+, this jump will show
- Emoji glyph widths differ across platforms (especially `⚙️` with its variation selector), causing the measured width
  to drift by a few pixels; for real use it is advised to switch to the project's own monochrome icons and not depend on system emoji
- Division of labour with vertical-word-roll-blur-cycle: that card has fixed width, bare words, with roller blur
  (the word is a sentence component), while this card has adaptive width, a dark capsule, with ghost items (the word is a badge) —
  keep only one in the same film; on sound, the three settlings are three rhythm points, so pair them with a light switch / capsule-snapping sound,
  with twin samples alternating on rapid fire; for the scoring discipline see sound-design.md

## Reference implementation
demos/typography/pill-chip-slot-cycle-handled/
(PillChipSlotCycleHandled.tsx)
