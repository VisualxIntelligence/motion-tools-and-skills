---
name: circle-match-iris
summary: Circle-centre-matched iris cut: the iris bursts open from the centre of a circular element on the page, and the circular chart of the new page inside the iris connects onto the same circle; the match cut gives the iris a semantic anchor
use_when: Seams where the foreground has a circular element (avatar/icon/round button) and the background has a circular subject (donut chart/ring progress); a transition technique card
duration: 5.5s / 165f (entrance + eye-catch 40f + wind-up 7f + circle-join iris opening 37f + sweep 58f + still 47f)
energy: Medium-high
---

## Intent
An ordinary iris (the vocabulary list's original entry) opens from any point, and the viewer reads only "the page changed".
This card welds it to a match cut: the iris must burst from the centre of a **real circular element** in the foreground,
and the new page growing inside the circle has a circular chart that joins onto exactly the same circle — what the viewer sees
is "the avatar's circle becomes the chart's circle", and the circular form itself completes the narrative (this person → this person's data).
This is the landing form of the match cut in a UI context: it relies not on a coincidence of composition, but on a semantic circle-to-circle.
Like the three traversal variants it belongs to "the background is already present inside the foreground", but the anchor is an abstract shape rather than a container.

## Motion core
- **The circles of the two scenes being strictly concentric is the crux**: the anchor circle centre is hard-coded as one set of constants (demo: CX=540,
  CY=540, = leaderboard row left edge + padding + rank column + avatar radius), and the avatar, ripple,
  clip-path circle, new-scene ring and dial all reference the same set of constants — coordinates each computed separately will inevitably be off-centre
- Eye-catching guidance: the other rows are pressed down to ~32% brightness and the anchor's row is lifted; the avatar gets two enlargement pulses +
  two spreading halo rings (18f / 30f); the camera slowly pushes in 3% with the anchor as transform-origin
  (the anchor does not move on screen), and at 40–47f the avatar contracts to 0.9 as a wind-up
- **Circle join = a solid disc hollowed out into a ring**: at the instant the iris opens, the new-scene ring's stroke width = its diameter (it looks
  just like that solid avatar), and within 28f the radius goes 36→300 and the stroke closes to 44px (expo-out),
  with the colour receding from fluorescent solid to a dark track; iris radius = ring outer edge + an ease-in accelerating outward expansion
  (54–84f adding 2400px), so it is "the ring pushing the iris open" — the circle join necessarily happens before it fills the screen
- The old page simultaneously scales up 1.03→1.22 centred on the anchor and darkens (ease-in), with a ring of drop shadow around the iris's outer edge +
  a fluorescent lit ring that appears only in the early part of the opening — the new scene "presses" over the old page
- Ring sweep: strokeDasharray = sweep×circumference, rotate(-90) starting from the top,
  60–118f slow start with a long tail to 87%, the 200px number in the centre counts in sync with the sweep, and the arc head's soft glow follows the pen tip

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Anchor pulse | 2 times scale 1→1.16 + two halo rings spreading (starting at 18f / 30f, 22f each) | Without eye-catching guidance the viewer cannot find the circle centre at the instant the iris opens |
| Circle join | Solid disc → ring: r 36→300, stroke 72→44px / 28f expo-out | If the ring and the iris each grow on their own, "the avatar becomes the chart" cannot be read |
| Iris expansion | Ring outer edge + 0→2400px / 30f bezier(.62,0,.32,1) | Faster than 20f and the circle join cannot be read; a centre offset >10px is exposed at a glance |
| Old page pushed away | scale 1.03→1.22 + brightness 1→0.45 / 34f ease-in | If the old page does not move, the new scene looks like a circular sticker pasted on top |
| sweep | 60–118f to 87%, bezier(.4,0,.12,1), number counting in sync | A number out of sync with the sweep reads as two animations; too fast (<40f) and the number cannot be read climbing |
| Close | Still for 47f after the sweep completes (only the dial's 0.06°/f slow rotation + arc glow breathing remain) | R1 |

## Known pitfalls
- The demo is a hand-built video-shotcraft weekly output leaderboard (dark-field fluorescent green; scene A creator ranking → scene B this week's output target ring) — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- On real footage the anchor coordinates are measured from the screenshot (devtools/ruler), and what gets measured is the element box rather than the
  visual circle centre — for an avatar with padding take the content circle centre; after measuring, render one frame and if it does not line up adjust the constants,
  and do not trust the first measurement (same as the cavity-centre precedent of transition-travel A text-cavity traversal)
- The foreground anchor must be a **true circle**: with a rounded square (border-radius < 50%) as the anchor,
  the mismatch of square and circle is obviously fake at the instant the iris opens; when the anchor in a real screenshot is a rounded square, first cover it with a same-colour patch and then overlay a true circle
- The semantics must be paired: avatar → personal data, product icon → product metrics — circle to circle is only the form,
  and "the content of this circle becomes its expansion" is the reason a match cut holds
- The one-variant-per-seam rule is the same as in shot-transitions; this card brings its own chart-growth segment, so do not
  layer entrance effects on the new scene inside the iris

## Reference implementation
demos/transition/circle-match-iris/
(CircleMatchIris.tsx)
