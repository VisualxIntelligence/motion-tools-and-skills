---
name: scroll-brake-moves
summary: Two styles of hard-braking a long scroll - changelog-scroll-brake basic style (a high-speed long scroll with exponential deceleration stopping precisely in position + the target lifting) and brake-reticle-lock combined style (the reticle snapping shut on the same frame as the hard brake)
use_when: Changelog / release history / long-list segments: "always shipping, and today's is the biggest"; use B when the stopping point needs a stronger sense of impact
duration: A 4-5s / B 5s
energy: High start, medium finish (speed-contrast type)
tags: rhythm
---

## Intent
The Linear changelog video grammar: a whole year of update logs as a long scroll sweeping past at high speed
(smeared into a colour band), brought to a precise hard stop by exponential deceleration on the entry for this release, which lifts off the surface
and highlights while the rest dim down - the density tells "always shipping", and the hard stop tells "today's is the biggest".
B is a combined variation: on the hard-brake frame, **on the same frame**, four L-shaped corner marks fly in from off-screen and snap onto the stopping-point
entry - the "clunk" of the hard brake and the "click" of the snap resonate on a single frame (the crux of the combination:
the corner marks' launch frame = the list's first stopped frame, and offsetting them degrades into two moves placed side by side).

## Variant selection
| Style | Approach | Use when |
|----|------|----------|
| A changelog-scroll-brake | translateY sweeps ~2400px (cubic-bezier(.45,0,.06,1): ~5f to reach full speed then a long exponential-style decelerating tail, 50f in all), with vertical directional blur driven by the frame-to-frame displacement difference (×0.32 capped at 30px, clearing to zero automatically once stopped); the stopping-point row lifts with scale 1.03 + shadow + a 2px accent-colour outline, while the other rows drop to opacity 0.38 | The basic style for changelog segments |
| B brake-reticle-lock | Scrolling in three stages: sin-in acceleration → cubic-out hard deceleration overshooting by +30px → rebound to settle; vertical directional blur = v×0.15 capped at 32px; the corner marks fly in from off-screen at ±620/±320 with Easing.back(2.4) and snap shut, the highlight completing within 6f, and the label popping out with back(2.6) | Highlight segments where the stopping point needs a stronger sense of impact |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Deceleration curve | A fast start + long decelerating tail (bezier .45,0,.06,1); B adds an "overshoot by 30px and rebound" | A constant-speed scroll reads as a ticker; B's overshoot rebound is the source of the "clunk" |
| Blur drive | Frame-to-frame displacement difference `|p(f)-p(f-1)|` × coefficient | Hand-placed blur keyframes inevitably fail to match the velocity; the difference method is frame-deterministic (the pattern has been distilled into assets/lib/helpers/motion.ts velocityAt) |
| Row-height rhythm | Three staggered tiers 72/94/116 | With equal-height rows, the colour band sweeping past at high speed has no rhythm |
| Stopping position | The target row stops at the vertical centre of the frame | A stop off-centre reads as an accident |
| B resonance frame | The corner marks' mount/launch frame = the list's first stopped frame (strictly the same frame) | The crux of the combination; off by more than 2f and it falls apart |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- Division of labour with timeline-travel: this card is a vertical list hard-braking to stop on the "latest",
  while that card is a horizontal timeline journey to look at "history" - when both are used in one film, stagger them one after the other and use each ≤1 time
- In the high-speed segment the entry content does not use real readable text - it smears into a colour band anyway, so grey placeholder blocks are enough;
  the stopping-point entry must have publication-grade real content (Q10)
- After the stop the other rows dropping to 0.38 is a compositional action: do not drop them to 0 (the context disappears)
- Sound: a low-frequency riser builds up in the high-speed segment, with one impact at the hard brake; B adds a further "click" on the snap frame
  (the same frame as the impact but a different voice)

## Reference implementation
demos/data/scroll-brake-moves/
(BrakeReticleLock.tsx / ChangelogScrollBrake.tsx)
