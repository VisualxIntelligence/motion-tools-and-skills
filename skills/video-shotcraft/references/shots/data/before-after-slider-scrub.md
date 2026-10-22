---
name: before-after-slider-scrub
summary: Before/after comparison slider - "before / after processing" two versions overlaid, the divider bar first flung hard and then swept slowly, with the new version "developing" into view where the bar has passed
use_when: Effect-comparison segments for AI enhancement / optimisation / refactoring features ("before vs after" explained in one shot)
duration: 4-5s
energy: Medium (the fast fling is the hit point, the slow sweep is the reading period)
tags: interaction
---

## Intent
The standard comparison grammar of AI image product launch films: the same frame "before processing" (low-contrast, murky)
and "after processing" (the clear version) are overlaid, and a vertical divider bar with a round handle is first flung hard from the left end to 70%
(with an overshoot rebound), pauses for a beat, and then sweeps back at about 1/5 of the speed so the viewer can see the
difference clearly - **the speed contrast between the fast fling and slow sweep is the rhythm**: the fast fling announces "it changed",
and the slow sweep proves "where it changed".

## Action phases
| Phase | Reference frames | Content |
|------|------|------|
| 1 Rest | f0-14 | The bar rests at 8%, and the picture is almost entirely "before"; at f10-14 it first pulls back left in anticipation to 6.5% |
| 2 Fast fling | 12f | 8%→76% (out cubic) with overshoot |
| 3 Rebound | 12f | 76%→70% |
| 4 Pause | ~18f | Lets the viewer see the after clearly |
| 5 Slow sweep | ~48f | 70%→40%, showing the difference a second time |
| 6 Freeze | last ≥40f | Truly still |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Speed ratio | Fast fling 12f vs slow sweep 48f, about 5:1 | With a ratio <3:1 the rhythmic contrast is imperceptible |
| Reveal | The after layer's clip-path inset right boundary follows the bar's x | Any misalignment between the bar and the reveal boundary is a glitch |
| Handle | Round handle + speed-difference-driven slight scaleX stretch (peak 1.18), automatically returning to 1 at rest | The stretch gives the handle the weight of "being flung" |
| before treatment | A low-contrast murky mask | A before that is too ugly is self-sabotage; the "bad" must be credible (a real old version / unoptimised state) |
| Corner labels | Put the BEFORE/AFTER labels in the content area | Demo precedent: the first version covered the sidebar/avatar, a glitch |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- The two versions must share the same layout and camera position - with different layouts it reads as two pages and the comparison fails
  (the same constraint as theme-switch-moves)
- In real use both before and after use real screenshots (Q1): the before is a real state with old data injected / a feature turned off,
  and do not hand-build a fake before that is "deliberately ugly"
- The slow sweep ends at 40% rather than 0% - leaving a stretch of after frozen on screen (the conclusion visible)
- Sound: one whoosh for the fast fling + a light tick for the rebound; the slow sweep is silent or a very light friction sound (S4)

## Reference implementation
demos/data/before-after-slider-scrub/
(BeforeAfterSliderScrub.tsx)
