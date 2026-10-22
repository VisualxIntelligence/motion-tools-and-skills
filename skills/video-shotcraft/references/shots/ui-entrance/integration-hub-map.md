---
name: integration-hub-map
summary: The old page flips 180° in one fast turn (the side edge flashes brightly for an instant) and lands as the new hub page; five integration app icons pop in on the same frame, then five rainbow light tubes connect together on the same frame, and conveying pulses inside the tubes keep flowing - "turn to a new page, and the whole ecosystem plugs in at once"
use_when: Integration / ecosystem capability segments (one product connects to everything); version-refresh narratives (old page turns into new page); the feature climax in a dark-scene neon tone
duration: wind-up ~0.5s + fast flip ~1.2s + icons appear together → tubes connect together, two beats ~0.7s + conveying breathing ≥1.5s; whole segment 4.5-5s
energy: Medium-high (the flip is the burst, the conveying segment is the afterglow)
tags: effects
---

## Intent
The flip is "changing eras": the old document page flips a full 180° to become the new hub page - it must be a
complete flip and not just turning through some angle (precedent), and the flip action is a **fast flip + decelerating tail**, completed in one go with no
pauses in between (the "constant speed" precedent: what the user meant by constant speed is no pausing, not literal
linear; the version with a pause at the 90° side edge was rejected). At the side-edge moment it only "flashes once" (a 1-3f pulse;
a long glow plateau was rejected). The connection is a **two-beat system**: five icons pop in on the same frame (beat one) → the
five tubes start drawing on the same frame and connect together (beat two) - being together is what reads as "the ecosystem arrives in one go"; connecting
one by one in a stagger reads as negotiating one by one (rejected in two rounds). After connection, bright pulses inside the tubes circulate continuously in the icon → hub
direction, and the "feeling of conveying" is the life of the end state.

## Motion core
- Flip: rotateY 0→180°, 35f, Easing.out(cubic) (80% of the angle is done in the first 41% of the time,
  with a long decelerating tail for a soft landing), double-sided card (front face old page / back face new page)
- Side-edge flash: at the ~90° moment a 2f pulse bloom (0→1→0.25→0, back to zero within 4f)
- Two-beat connection: the five icons' tIcon pop in on the same frame (flip settle +3f); +10f later the five tubes'
  tPipe start drawing on the same frame, growing together over 9f until all are lit
- Conveying pulses: bright dash spots in the light tubes circulate in the icon → hub direction (speed ~4.6px/f,
  phases staggered between tubes); once everything is connected the hub page breathes lightly
- Background: dark purple base noise + neon rectangles surfacing as a backdrop

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Flip duration | 35f (once 70f, rejected as "twice as fast") | <24f does not read as double-sided; for the decelerating tail, ~60% of the time covers 20% of the angle |
| Flip curve | ease-out, monotonic, no pauses | Side-edge pauses / segmentation were rejected; strictly linear with its abrupt start and stop was also rejected - fast flip, slow tail |
| Side-edge flash | 2f pulse, back to zero in 4f | A long glow plateau was rejected as "a flash is enough" |
| Connection rhythm | Two beats: icons on the same frame → +10f tubes on the same frame | Staggered one-by-one connection was rejected in two rounds as "appear at the same time, then connect at the same time"; with a gap <6f between the two beats it reads as one beat |
| Tube growth | 9f, growing together | The 18f version was a bit slow; tubes have different lengths but arrive on the same frame (normalised by each one's len) |
| Conveying pulses | ~4.6px/f circulating, phases staggered | Static connecting lines = no "feeling of conveying" (precedent); the same phase reads as flickering |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- The chain of timing precedents is fully on record: staggered connection ×2 rejected → tubes together with icons staggered rejected →
  the two-beat system passed. "At the same time" is the rhythmic identity of this card
- Division of labour with glow-flyline-moves: that card is the light-effect drama of the flyline itself; this card is the narrative structure of
  flip + two-beat connection + conveying, with the light tubes as mere elements
- Division of labour with canvas-materialize-moves: that card is the materialisation of canvas elements; the core of this card
  is the generational-change meaning of "old page flips into new page"
- Double-sided card implementation: a horizontal/vertical line with bbox=0 makes SVG filters/gradients fail (the three-tubes-
  vanishing precedent); tube gradients use userSpaceOnUse, defined independently for each tube

## Reference implementation
demos/ui-entrance/integration-hub-map/
(IntegrationHubMap.tsx)
Original source: clickup-30.mp4
