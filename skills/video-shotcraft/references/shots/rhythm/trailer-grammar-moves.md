---
name: trailer-grammar-moves
summary: One pattern of trailer grammar — trailer-bumper, a front-loaded rapid-cut hook: three shots in a 9f rapid cut + a beat of black-screen silence, then the opening title
use_when: The opening hook of a trailer (cold open): stuff in the three most eye-catching shots before the main feature, then a beat of silence before the formal opening
duration: A ~4.7s (140f)
energy: A high
tags: opening, transition
---

## Intent
Each of the library's rhythm cards governs one segment: beat-cut governs cut-point layout, rhythm-interrupt governs interruption.
This card governs **the structural moments of a trailer** — not how any one
shot moves, but how the joints of the whole film connect: A is the opening hook — before the main feature, 0.9 seconds stuffed with
the three most eye-catching shots in rapid cut + a beat of black-screen silence before the opening, the "preview" of a trailer.

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A trailer-bumper | Three shots each hard-cut at an equal 9f (0/9/18), with a scale 1→1.04 micro-push inside each shot to keep it alive; 27–33f pure-black silence, from 33f the title fades in over 16f + rises slightly 44px on out-cubic (the demo title is the video-shotcraft wordmark + brand tagline) | The hook before the main feature's opening; cold open |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A rapid cut | Three shots of an equal 9f, zero transition; shot 3 focuses on the middle-column Top pages card enlarged 2.2x as an in-your-face close-up (CSS zoom, text not blurry) | The beat feel comes from equal lengths; the three shots' compositions must be clearly different |
| A micro-push | Inside each shot scale 1→1.04 linear | Three still frames in a row read as a slideshow — the crux |
| A black screen | 27–33f pure black #000 empty div, 6f | Putting anything in the black screen destroys the "beat of silence" |
| Ending | A still 77f (≥40f) | After the tracking tightening finishes (63f) the whole frame freezes, truly still |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- The black screen in A must be pure black with nothing in it (same family as the drop-blackout precedent) — the black screen is a breather,
  not yet another title card
- A's three-cut sequence gets a sound hit on each cut, and the black screen is fully muted (sound-design §4.5)

## Reference implementation
demos/rhythm/trailer-grammar-moves/
(TrailerBumper.tsx)
