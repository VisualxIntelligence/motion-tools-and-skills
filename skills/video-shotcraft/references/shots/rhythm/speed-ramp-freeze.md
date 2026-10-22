---
name: speed-ramp-freeze
summary: A rhythm technique of non-linear frame-number remapping — freeze annotation (flow → freeze, circle and annotate → thaw)
use_when: In a card stream / long sideways move, "stopping one key point to show people"; teaching explanations, review contexts
duration: freeze annotation whole run 158f (≈5.3s, freeze section 67f ≥45f)
energy: Medium-high (the speed contrast is itself the energy beat)
---

## Intent
A constant-speed stream reads as PPT (R2), and a fast stream throughout leaves the audience unable to catch the key point (R3). Freeze annotation, within a single
movement, simply stops — a marker circles the key point and then it moves on. The technical root is frame-number remapping (slope is rate),
and the semantics are "stop the class and underline the key point".

## Motion core
- The source animation is constant-speed, and the output frames apply a non-linear remap to the source frames (slope is rate): flow section slope 1 (26px/source frame) →
  freeze section slope 0 → thaw section smootherstep; **blur is linked to rate** — a directional
  blur is applied according to the actual speed after remapping (Polish SpeedBlur, no filter hung when |v|<8px/f), and the freeze section is rendered bare; CameraMotionBlur multi-sampling would
  tint the page texture, so this card does not use it
- The freeze-section slope =0 (an instantaneous switch, no ease-in — the freeze must be crisp); the freeze frame is given the
  signal of "pause pressed": a 3f shutter white flash, the four corners of a whole-frame viewfinder popping in, the timecode switching from LIVE running to PAUSED and stopping;
  an accent-colour marker superellipse circled in one stroke with a 10f outline (stroke-dashoffset, 1.08 turns, the pen-lift not closing) circling the target +
  an arrow shaft 6f + an arrowhead 3f making the point, feTurbulence (scale≈6) giving a hand-drawn tremor, followed by one line of 68px bold annotation +
  a hand-drawn underline + a signature; the thaw section smootherstep (ease-in start) takes 22f to run through one card,
  with average slope >1 compensating the duration, the ink fading out over 8f, but leaving a comment pin at the target card's corner that leaves with the card
- The target card aligns in the middle of the screen and is "picked up" (raised + enlarged 3–5% + deeper shadow), while the other cards fade dark / desaturate;
  at a card width of 600px, the 2x card texture is a downsample, so any one chosen is sharp (the object being gazed at / circled must be sharp and centred)

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Freeze duration | ≥45f | Shorter and the gaze does not hold (R3, better slow than fast) |
| Thaw compensation | smootherstep 22f to run through one card (average slope >1) | A thaw that is too slow drags the whole film; without compensation the time eaten by the freeze reads as a dead moment |
| Circling outline | 10f to finish drawing + tremor scale 6 | Too slow looks like a loading animation; without tremor it looks like a mechanical annotation |
| Pause signal | 3f shutter white flash + viewfinder four corners + timecode PAUSED | Without the signal the audience cannot tell "freeze" from "stutter" |

## Known pitfalls
- SFX are pinned to **output frames** not source frames (the on-screen action happens on the output timeline);
  Foley slot: the freeze gets a marker scratching sound (S4), which was not added when this card was promoted and is to be added in real use
- Freeze annotation at most 2 times in a 30s film (restraint principle)
- The parameters were tuned and corrected on placeholder footage, not battle-tested final values; re-verify after the first real use

## Reference implementation
demos/rhythm/speed-ramp-freeze/
(FreezeAnnotateReal.tsx)
