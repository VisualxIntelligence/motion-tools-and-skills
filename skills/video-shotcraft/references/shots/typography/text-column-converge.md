---
name: text-column-converge
summary: Two-word confrontation then closing together — the left "NEW" and the right feature word are pinned at equal screen margins on either side and hard-cut through a rotation with zero shrinking throughout, and only at the last word does a single ease-in-out slide bring them to the centre to snap together into a phrase, with the small text underneath surfacing almost as a hard cut; a closing reveal-type text card
use_when: Passages where a feature list closes on a product name / slogan (a "NEW × a string of features → NEW <product name>" pattern); launch-event-style recaps, version-number reveals
duration: rotation 7–16f/word × 8–9 words + closing together ~36f + rest after the small text; about 5–6s for the whole section
energy: Medium-low (a machine rhythm, the temperament of a small-type spec list, not slamming words)
tags: outro
---

## Intent
Two words sit opposite each other on the left and right like a contents page, and the audience thinks it is just a rotating caption; only when the last word
comes to rest do they discover that the left and right were actually two halves of the same sentence — the single continuous closing together retroactively makes the whole
rotation a "build-up of suspense". The crux is **pinning**: during the rotation the two words do not move a single pixel,
and the left and right screen margins are exactly equal (measured from the original film as 412 vs 413@1280); any gradual shrinking
spoils the closing together in advance and dilutes the reveal into a progress bar. The closing together may happen only once, and it must come after
the last word — this is a closing reveal, not a sustained motion.

## Motion core
- The left word's left edge and the right word's right edge are each pinned at the equal screen margin (measured from the original film as 412/413px
  @1280, ×1.5 → 618/1302@1920); whether the right word changes long or short, it is always positioned by its right edge
- The word rotation is a pure hard cut, with uneven dwell frame counts (16/12/9/8/7/8/10/12f, a machine rhythm
  with a human touch); the spacing has zero shrinkage throughout the rotation (precedent: a gradual-shrink version was rejected by the user and redone)
- **The single closing together**: ~10f after the last word comes to rest, a ~1.2s (36f) ease-in-out
  (cubic) continuous slide brings the two words to be centred on the screen centreline and freezes
- The closing end point is calculated from the monospaced font's actual step (0.6em+letterSpacing × character count),
  with the two words snapping together at exactly one space, with no overlap and no gap; no stamp scaling, no secondary compensating move
  (demo: video-shotcraft's eight feature words rotate, the last word being the all-lowercase wordmark video-shotcraft, with the end point calculated from `NEW ` + the wordmark's character count;
  the small text is the second half of the brand short phrase "CRAFT THE SHOT.")
- ~18f after freezing, the italic small text surfaces almost as a hard cut (4f quick fade, zero displacement), with the
  same left edge as the whole line and the same font size as body text
- Finish: cool dark ground + very faint top light + vignette/grain; a 1-frame brightening at the instant of each word change; NEW is secondary grey during the rotation and
  brightens to the primary colour with progress during the closing; the closing slide adds horizontal motion blur by speed (≤4px, 0 when still);
  the demo's full length is 180f (exported as `TEXT_COLUMN_CONVERGE_DURATION`)

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Screen margin | 618px@1920 (**measured from the original film** 412/413@1280 ×1.5) | A left-right difference >2px reads as not aligned; the margin is this card's identity, so do not change it to the golden ratio |
| Word dwell | 7–16f uneven | Even dwell reads as a metronome; <7f and the word cannot be read |
| Closing trigger | last word at rest +10f (measured from the original film at 32.4→32.7s) | If the rest period is too short the audience starts sliding before realising "this word is not changing any more" |
| Closing duration | 36f ease-in-out cubic (**measured from the original film**, ~1.2s continuous slide) | <24f reads as a bounce back into place; >50f reads as dragging |
| Snap step | 0.6em+letterSpacing/character, monospaced font | With a non-monospaced font the step is unpredictable, and it will overlap or leave a gap |
| Font size | 42@1080p (**measured from the original film**, glyph height ~20/720) | This section has the temperament of a small-type spec list, and enlarging to 60+ turns it into slamming words (for a single-word hammer blow use outline-word-fill) |
| Small-text surfacing | freeze +18f, 4f quick fade with zero displacement (in the original film it appears directly between 34.4→34.6s) | Adding a slide-in / long fade steals the closing together's scene |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Overlaps in territory with type-rhythm-sync (font-attribute beats) / beat-cut-moves (hard-cut beats):
  those two are "the rotation itself is the content"; this card's crux is a closing reveal of **position pinning + a final closing together**,
  with the rotation only a build-up. If a passage has no "closing-together reveal", do not use this card
- The closing together may happen only once — the gradual-shrink version that tightens one notch per word change was disproved by comparison with the original film and
  deleted, so do not revive it
- A monospaced font is required (the demo uses SF Mono); with a proportional font the snap end point cannot be calculated accurately
- In the original film the word-change instant carries a 1-frame brightness flicker (the feel of a typewriter line break), and the demo has added back a 1f brightening;
  a flicker >1f reads as a glitch

## Reference implementation
demos/typography/text-column-converge/
(TextColumnConverge.tsx)
Original source: raycast-teams.mp4 28–36s
