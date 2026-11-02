---
name: timeline-travel
summary: Timeline traverse - the camera accelerates along a horizontal scale axis sweeping past the version ticks, a card springs up and holds briefly at each tick passed, and it brakes hard and pushes in at the last tick
use_when: Changelog / milestone / history segments (another way of shooting "we are always shipping"); division of labour with scroll-brake-moves: that card is a vertical list hard-braking, this card is a horizontal journey through time
duration: 4-5s
energy: Medium-high (a rhythm-type shot of acceleration → hard brake)
tags: camera
---

## Intent
Shoot the product's version history as a journey along a timeline (the title-sequence precedent of 反恐王国, literally "Counter-Terror Kingdom"):
the camera makes a three-stage variable-speed horizontal traverse of slow start → sprint → hard brake, with the v1.0/v2.0/v3.0 ticks sweeping past in turn,
and as each one is passed its card springs up from the tick line - history flashing by outside the window,
with a hard stop on "today" and a push-in. The speed itself tells "development is fast", and the hard stop tells "now matters most".

## Action phases
| Phase | Reference frames | Content |
|------|------|------|
| 1 Rest | f0-12 | An empty axis + the first tick held still |
| 2 Accelerated sweep | ~f12-100 | World-layer translateX with segmented easing: slow start → sprint → hard brake over the last 12% |
| 3 Card spring-up | During the sweep | The card starts springing 6f before the camera sweeps the tick (spring damping ~11 with clear overshoot), standing up with scaleY from the bottom edge as the axis |
| 4 Hard stop and push-in | 10f from the stop frame | scale 1→1.28 pushing in on the last tick (out cubic), followed by stillness ≥30f |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Variable-speed curve | Input breakpoints [0,0.15,0.88,1] → output [0,0.055,0.9,1] | If the middle is not fast enough there is no "sense of journey"; constant speed throughout is a cheap slideshow |
| Spring-up timing | Starts springing 6f before the camera reaches the tick, looked up in reverse via camXAt | Springing only on arrival means the viewer has already missed it; too early reads as a teaser |
| Tick density | 3-5 major ticks + a few minor tick dots | The minor tick dots are the reference objects for the sense of speed, and without them you cannot feel the speed |
| Hard-stop push-in | 1→1.28 / 10f | Without the push-in the hard stop is merely "stopped", and the push-in is what makes it "arrived" |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- When the mid-section sprint is so fast the cards smear, CameraMotionBlur can be layered on (wrap only the fast segment, round #8 precedent)
- Reserve the post-stop stillness budget in advance: the demo's first version had only 25f of stillness, which fell short, and moving the stop frame earlier fixed it
  - when laying out the timeline, first leave ≥30f for the end segment and then work back to the travel
- Each spring-up card is an information slot: in real use put real version-highlight screenshots / a one-liner there,
  and the sweep speed must ensure at least the last two can be read (same origin as Q6)
- Sound: a light tap on each spring-up, one impact at the hard stop (same origin as S2)

## Reference implementation
demos/data/timeline-travel/
(TimelineTravel.tsx)
