---
name: gauge-readout-moves
summary: Two styles of gauge readout - needle-sweep-selftest (the ignition self-test needle flung through the full arc and then dropping back to the true value) and tape-scroll-fixed-pointer (the pointer stays still while the scale tape scrolls past, plus a sprint and brake)
use_when: Dashboard opening rituals / reveals of performance metrics; A for the power-on feel of multiple dials, B for a big jump in a single metric
duration: A 140f (4.7s) / B 150f (5s)
energy: Medium-high (mechanical ritual type)
---

## Intent
Turn "reporting a number" into the body movement of an instrument: A is a car's ignition self-test - the three side-by-side dials in the card
have their needles first "swish" through the full arc (270°), the ticks swept over light up in turn, and then the needles spring back and settle on the real values,
with the multiple dials staggered into a wave, and on settling the value beneath each dial pops out on the same frame - the range lights up first, then the number is reported, a sense of oath-taking at the opening;
B is airspeed-tape grammar - the readout window + pointer are pinned to the centre line of the frame, and a scale tape running the full height of the picture scrolls past behind the window as a whole, first creeping slowly against the old upper limit, then after the upgrade sprinting
(peak ~100px/f), and at the end a spring brake with an overshooting swing back, "the world moves, the needle does not",
and the size of the value becomes a displacement distance you can see.

## Variant selection
| Style | Approach | Use when |
|----|------|----------|
| A needle-sweep-selftest | Face and outer ring light up → the needle's outbound stroke flings through the full arc in 12f ease-out (the ticks swept over light up in turn, dropping back within 24f) → a spring return stroke with a ~8° overshoot swinging back to settle on the true value; the three dials staggered by 4f; on settling the value beneath each dial pops out with overshoot on the same frame and the metric name fades in, and after all have settled a self-test capsule Running self-test… → Ready to render | Dashboard openings / system-ready rituals |
| B tape-scroll-fixed-pointer | The full-height scale tape translates: a slow creep up against the old upper-limit line → the upper-limit line breaks → an anticipation pull-back of 5 → a 22f sprint (peak ~100px/f, vertical motion blur) → a spring brake with overshoot and swing back to the stopping position, the new upper limit bug stopping into the pointer; the readout in the window refreshes in sync | A big jump in a single metric (doubled performance / raised quota) |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A sweep amplitude | Full scale 270°, returning as soon as it hits the top | Flinging only to the true value = no self-test ritual feel; a full arc then dropping back is what is meant by "the range lights up first"; the ticks swept on the outbound stroke (including the red zone) light up in turn |
| A overshoot | A ~8° swing back on the drop (spring damping back-computed from the travel) | Without overshoot it reads as a digital watch; overshoot = the mass of a mechanical needle |
| A stagger | 4f/dial (left → middle → right) | Flinging together reads as copy-paste; staggering makes a wave |
| B sprint speed | 5px/unit, peak ~100px/f (in the big-jump segment) | Too slow reads as a constant-speed climb and "the world moves" does not hold; the longer the tape the larger it is, and the more it needs vertical motion blur |
| B brake | Spring overshoot (rushing past then springing back to the stopping position) | The swing back in the original vocabulary is the source of the "clunk", so a straight stop would be a pity |
| True stillness | After stopping, ≥30f all locked dead (A's last dial settles at ~66f, B locks constants at 110f) | Pointer types most hate tail drift |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- The ring-close-overfill (ring closing with overfill) in the same batch was ruled "change and look again" with no note - ring-shaped progress types
  are to be redone, so do not rush to merge it in as a third style
- A's dials are self-drawn SVG (arc ticks + pointer); when pasting onto a real dashboard in real use, first look for a ready-made gauge component
  in the page to use as a close-up, and only build one if there is none
- Sound: for A a "swish" for the needle fling + a "tick" on settling (one each for the staggered dials); for B a
  low-frequency rolling sound in the sprint segment and a dull "clunk" at the brake

## Reference implementation
demos/data/gauge-readout-moves/
(NeedleSweepSelftest.tsx / TapeScrollFixedPointer.tsx)
