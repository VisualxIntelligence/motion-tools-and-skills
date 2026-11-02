---
name: sakuga-timing-shift
summary: From shooting on threes to shooting on ones — an element first moves in flip-book stop-start steps of one step every 3 frames, and at the climactic instant switches to a frame-by-frame silky sprint; the frame-rate-quantised sudden change is itself the point of interest
use_when: Emphatic movement of a single element (a card entrance, a metric crossing the line); sections that need the contrast of "handmade feel → climactic burst"
duration: 150f (5s)
energy: Medium-high
tags: ui-entrance
---

## Intent
The library's time-axis manipulations already include speed-ramp-freeze's freeze-and-thaw and hit-counter's local frame hold.
This card is a different one — **what changes is not the speed but the frame rate itself**:
in the stop-start section the driving frame is q=floor(f/3)*3, so the element moves only one step every 3 frames (a 10fps flip-book),
and from the switch frame it is driven frame by frame by the raw f, a silky sprint. The dullness of shooting on threes and the smoothness of shooting on ones
are cut against each other on the same screen, the beat-count staging of Japanese animation (shooting on 3s / on 1s). The stop-start section
does not feel low-grade but handmade, and the switch point is the climax marker.

## Motion core
- Stop-start section: q = Math.floor(f/3)*3 as the driving frame, position linear X 140→1180,
  16 key drawings, each step ≈69px; the pose freezes with q: sin(q) rotate ±5° + alternating squash/stretch
  (0.97/1.035) + a one-high-one-low small hop (−18/−2px), each step different
- Switch at f48: two "impact frames" (the picture inverted to an ink base + concentration lines focused on the card) as the climax marker,
  after which it switches to continuous driving by raw f, with Easing.out(poly(4)) a high-initial-speed sprint doubling back to the centre + 40px overshoot
  + 6f rebound, landing with scaleX 0.92 / scaleY 1.07 squash
- Motion stretch in the sprint section is driven by the position-difference speed (scaleX peak ≈1.3 / scaleY 0.9),
  with 9 horizontal tapered ink speed lines behind it, length ∝ speed, **conditionally mounted** — removed when speed is low
- The beat-change annotation is synchronised in three places: the corner tag "ON 3s / 3コマ打ち"→"ON 1s / 1コマ打ち" (pop 1.25×,
  the hand-drawn underline re-traced every 4 frames to boil, frozen after f=108); the "exposure sheet" at the bottom writes the key-drawing number only every 3 cells for shooting on threes,
  with a vertical line drawn in the middle cells (= reusing the previous drawing), and every cell numbered for shooting on ones — the audience directly sees how many drawings are drawn per second
- Picture: paper look animation paper (registration holes, pale blue pencil safe frame/crosshair), the subject a video-shotcraft product card (30fps · every frame, crafted)
  with a 5px ink line + hard-edged cel-shaded drop shadow; hold section after f74 with a very slow 2% advance

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Beat count | Stop-start section floor(f/3) (on threes) | /2 lacks the stop-start feel, /4 and above reads as the player freezing |
| Displacement per step | ≈69px (back-derived from total travel 1040 ÷ 15 steps) | <30px reads as stutter / dropped frames, not stop-start — the crux |
| Pose between steps | sin(q) rotate ±5° + alternating squash/stretch + a one-high-one-low small hop | Pure-displacement stop-start with no pose change looks like a bug, not a flip-book |
| Switch frame | f48 (stop-start : sprint ≈ 3:2) | The switch must complete in one frame, and any tween destroys the "beat change" feel |
| Sprint easing | Easing.out(poly(4)) + 40px overshoot + 6f rebound | The initial speed must be fierce, to maximise the contrast with the stop-start section |
| Ending | Hold 70f after landing (leaving only a 2% very slow advance), with the corner-tag boil frozen at f108 | Residual boiling ruins true stillness (same family as the feTurbulence unmasking precedent) |

## Known pitfalls
- The demo was tuned with a hand-built animation paper + cel card — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- The impact frame is a whole-picture-level impact (counted under R4), so a shot gives it only once, at the switch point, and only for 2f
- Precedent of a single time manipulator per shot: mutually exclusive with speed-ramp-freeze / hit-counter frame holds,
  and a shot can have only one actor moving the timeline
- Each stop-start step must displace ≥30px to read as "stop-start" — micro-step stop-start reads as render frame drops,
  and this is the crux of the card; if the stride is not enough, shorten the total duration in exchange for a bigger stride
- The switch point must have an annotation (the corner tag "ON 3s"→"ON 1s", exposure sheet cells or a sound hit,
  sound-design §4.5) — without an annotation the audience only feels "it got faster" and cannot read the "beat change"

## Reference implementation
demos/rhythm/sakuga-timing-shift/
(SakugaTimingShift.tsx)
