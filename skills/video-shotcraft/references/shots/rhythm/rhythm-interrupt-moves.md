---
name: rhythm-interrupt-moves
summary: Interrupting the rhythm — jump-cut-punch-in, a three-step jump-cut push-in: the same composition hard-jumps to a larger scale three times with no tweening, closing in on the target level by level
use_when: Using "interrupting continuity" itself as the rhythm device: a stop-start push-in (A); complementary to beat-cut-moves (cut-point layout)
duration: A 135f ≈4.5s
energy: A medium
---

## Intent
The library's rhythm cards all govern "how to cut and how densely"; this card governs **how to break** — the audience expects
continuity, and you interrupt it instead, so the way of interrupting is the expression: A is a spatial break — the same composition jumps larger three times
with no tweening (1x→1.6x→2.6x), the stop-start of a Godard jump cut, giving more of a commanding "look here, closer,
that's the one" than a continuous push-in. Suited to forcing focus on a metric.

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A jump-cut-punch-in | transform-origin pinned to the target centre, scale jumping in three steps (zero tween), with a 2f darkening pulse on each jump as a tick | Closing in on a core metric level by level; documentary-style staring |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A jump steps | 1.0→1.6→2.6, each hold ≥35f | A step difference <1.5× reads as the picture twitching |
| A tick | From the jump frame, a 2f brightness 0.92 full-picture pulse | A jump cut without a tick reads as dropped frames |
| Ending | Last step truly still ≥45f | For interruption-type patterns the hold afterward is given heavier |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Like speed-ramp-freeze it moves the "timeline", so a single shot can have only one time
  manipulator
- The three steps' composition must share the same origin (pinned to the target centre) — recomposing at each step makes
  three shots, not a jump cut
- Heavy sound dependence: one tick per jump (sound-design §4.5)

## Reference implementation
demos/rhythm/rhythm-interrupt-moves/
(JumpCutPunchIn.tsx)
