---
name: chip-grid-single-select-blackout
summary: Five option chips fade in one by one, centred in a 3+2 layout; on the selection frame a single frame of grey press block is inserted first, then within a few frames the fill turns ink black and the text turns white with a very light 1→1.04→1 rebound, while the other chips fade to 18% with their positions locked; afterwards the remaining ones go to zero, the black chip moves up and narrows, and the settled price rises below
use_when: Interaction demos of single-select / plan / tier selection; the "what happens after you pick it" causality shot; price/parameter settlement chains
duration: about 5.5s (165f@30fps)
energy: Medium-low (the only burst is that one grey-flash frame, everything else is pulling in)
---

## Intent
One grey-flash frame + three frames of inversion to black takes the two-level `:active → :selected` states of a real UI
and plays them apart. What the audience sees is "a finger presses down" and then "the system confirms", rather than a single gradient. The other
chips drop to 18% while **their positions never move**: once they reflow, the audience would think the page refreshed,
and the semantics of "single select" would be lost.

## Motion core
- 5 chips centred in two rows of 3+2 (1080p native: height 96, corner radius 48, gap 22, 36px text, fixed widths 346/364/476/236/330),
  rising snappily from 8f at 3f intervals; the eyebrow + 84px question above arrive first
- The cursor moves from the lower right to the target chip in a swift arc over 26–54f (a causal preview), pressing at 56f
- **1-frame press grey flash**: only the single frame FS=56, an `rgba(120,128,146,.5)` overlay layer
- **Inversion to black**: 57→62f linear (5 frames) drives the background white→ink black `#0b1020`, the outline, and the text ink→white, while the ✓ grows from zero width
- **Press rebound**: `sc = 1 + sin(pr·π)*0.04`, with pr running 57→66f — the sine guarantees an exact return to 1 at both start and end
- **Demotion of the rest**: 57→66f outQuad presses opacity down to 18%, with `transform` constantly `none`
- Protagonist light: after the inversion a very faint ring of cobalt-blue landing light glows under the chip (given to the protagonist once only), and the shadow deepens and enlarges as it lifts
- **Wrap-up**: from 101f (≈1.5s after the selection) the rest go to zero over 9f; the black chip moves up over 18f smooth to y=330, scale→0.88,
  and returns horizontally to the centre line (geometry computed from the fixed widths, not measured at runtime); the question moves up and fades out at the same time to make way
- Settlement: at 108f the original price $42.00 rises → at 118f a strikethrough line crosses it out and it fades to grey → from 116f the current price $34.44 rises letter by letter (180px)
  → at 128f the cobalt-blue "Save 18% · billed $413.28 yearly" pops out with overshoot; hold 134–165f

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Entrance | Starts 8f, interval 3f, 16f snappy each | The 5 chips finish laying out within 1s, leaving the time for the selection section |
| Selection moment | FS = 56f (about 1/3 of the film) | The first part is for reading the question, the later part for seeing the result; earlier than 40f and the audience has not finished reading the options |
| Grey flash | 1 frame, rgba(120,128,146,.5) | **Just one frame**: giving 2 or more frames reads as a hover highlight, not a press |
| Inversion to black | 57→62f linear (5f) | Linear is deliberate: adding an ease gives the "turning black" a sense of process, too soft |
| Press rebound | 1 + sin(pr·π)·0.04, across 9f | 0.04 is very light; at 0.1 it becomes a bouncing button and steals the scene |
| Demotion of the rest | Down to 18%, position transform:none | **Locked position is the crux**: dropping to 18% while staying in place reads as "not selected" rather than "gone" |
| Wrap-up moment | From 101f (≈1.5s after selection), 18f smooth in-out | 1.5s is the shortest dwell that lets the audience see the selected state clearly; cut to 0.5s and it feels rushed |
| Move-up and narrowing | To y=330, scale→0.88, horizontal correction back to the centre line | Without the centre-line correction it drifts to the left after moving up, reading as "dragged away"; shrinking beyond 0.85 takes the text below 32px |
| Settlement order | Original price → strikethrough → current price → savings capsule, interval 8–10f | Giving the old price first and then crossing it out is what lets the audience read the causality of "it got cheaper" |

## Known pitfalls
- The selected chip's return-to-centre-line displacement is computed from the fixed chip widths (offsetWidth is not measured at runtime) — when changing copy, change the width table in sync,
  otherwise the text overflows or drifts off the centre line after moving up
- The `transform` of the other chips must be written explicitly as `'none'`, and must not rely on automatic flex reflow, otherwise they slide sideways when the rest go to zero
- Placeholder content: 5 billing-cycle option names (Annual billing … Nonprofit rate) + settlement "$42.00 → $34.44/mo, Save 18%",
  all to be replaced when landing; option names that are too long burst the fixed widths (the third, "Two-year commitment", is a long-name stress test)

## Reference implementation
demos/interaction/chip-grid-single-select-blackout/
(ChipGridSingleSelectBlackout.tsx)
