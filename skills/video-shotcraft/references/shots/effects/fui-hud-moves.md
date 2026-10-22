---
name: fui-hud-moves
summary: FUI/HUD reticle snap: reticle-lock-on, a viewfinder made of four L-shaped corner marks, flies in from off-screen, overshoots and rebounds, then snaps shut and locks onto the target
use_when: Any "look here" call-out of a target (replaces drawing a red arrow or circle, with no frozen frame)
duration: 2–3s (demo 90f)
energy: Medium-high (the snap frame is the hit point)
tags: ui-entrance
---

## Intent
A motif from sci-fi fictional interfaces (Jarvis/Territory) that can be neutralised: capture in motion.
Four L-shaped corner marks rush in from off-screen, overshoot and rebound, snap onto the four corners of the target element with a "click", and pop a label
— division of labour with freeze-annotate: that card freezes the frame to annotate, while this card calls out targets while the picture keeps flowing.

## Variants
| Variant | Method | Use when |
|----|------|------|
| A reticle-lock-on | The four L corners = four mirrored copies of the same pair of rectangles; the fly-in (10f out cubic) and the contraction (2.2×→0.94×→1 overshoot rebound) are decoupled; on the snap frame the target brightens slightly + the label pops out with back easing | Calling out a target; hitting a sound-effect heavy beat |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Fly-in travel | Rushes in from ≥1000px off-screen | A short travel reads as "corner marks appear", not "pounce on it" |
| Overshoot | Contracts past to 0.94× then rebounds to 1 | Without overshoot there is no "click" of snapping shut |
| Snap frame | Target white overlay quick flash 0.55→hold at 0.28 + label pops on the same frame | If the slight brightening and the label are on different frames it falls apart |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- ≤2 uses per film: used back to back it reads as a military template; the two locked targets must be different
- Sound: one "click" on the snap frame (a mechanical click rather than a game UI sound, within the S1 boundary)

## Reference implementation
demos/effects/fui-hud-moves/
(ReticleLockOn.tsx)
