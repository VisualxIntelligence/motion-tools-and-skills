---
name: card-flock-tumble
summary: Three UI page cards tumble in 3D from their thin side edges and settle into a staircase (clear throughout, spline-continuous and silky smooth), keep rotating slowly after settling without stopping, then are quickly drawn into the centre, blasting out a single turbulent smoke ring that spreads, with giant type sweeping across to close
use_when: Energy climax sections (an explosive transition from a group of feature pages → the brand slogan); neon/aurora dark-field tone; sections where "multi-page capability" is condensed into a single line
duration: tumble ~1.5s + slow-rotation display ~0.3s + collapse 0.3s + smoke ring + giant type ~2s; whole section 4.5s
energy: Extremely high (use for the energy peak of the whole film)
---

## Intent
Three page cards tumble and line up in 3D space like playing cards flung out; after settling and showing themselves they are instantly
drawn into the centre, blast out a ring of smoke, and the giant brand type bursts out through the ring — "capability showcase → energy
collapse → slogan eruption" in one breath. There are three crux points: **silky smooth** (side edge → tumble → settle is
a single Catmull-Rom spline with continuous derivatives, and the hitch of piecewise interpolation will be seen),
**no stopping** (after settling, keep a low angular velocity and rotate slowly until the collapse; a still section was rejected with "don't stop,
keep rotating" — a climax section has no still frames), and **clear throughout** (motion blur/depth-of-field haze
all deleted, rejected with "don't add blur effects").

## Motion core
- Tumble: each of the three cards follows a Catmull-Rom spline from k0 (near-90° thin side edge) → k1 (mid-tumble) → k2 (staircase
  settle), driven by Easing.out(cubic), ~44f
- Settled slow rotation: idle drift ry +0.34°/f, rx -0.1°/f, rz +0.05°/f (14f
  of squared ease-in to avoid a hitch where it joins the spline), without stopping until the collapse moment
- Collapse: 10f of Easing.in(quad) accelerating straight from the slow-rotation pose, sucked into the centre and shrinking,
  with opacity at full for the first 60% (the "suck-in" motion must be clear and readable)
- Flash core: on the same frame the suck-in arrives (70f) a white-hot core at the centre + a 12% full-screen slight overexposure, with 6f
  exponential decay, and the ring grows out of the flash core — filling the energy gap between the collapse and the giant type; only
  radial light is used, with no geometric outline ring and no particles (both were rejected in the precedents)
- Smoke ring: a **single** one (multiple rings were rejected), feTurbulence with three displacement sets (ragged edge / bright patches /
  dark patches) + a top cream-peach → pink → purple gradient (aurora colour band), screen blend — broken ragged edges,
  light and dark patches, decelerating outward expansion with slow growth, very slow decay with lingering, and no water-surface light at the centre; zero residual particles
- Giant type: 4f after the collapse (74f) it "slams" in — 14f snappy shrinking from 1.22 to 1, tracking
  tightening from +0.06em to −0.025em, then growing very slowly without stopping; solid white-hot core → pale purple vertical
  gradient fill + pink-purple double-layer bloom (brighter at the instant of landing, then falling back), 282px italic spanning about 80% of
  the frame width; the eyebrow above inside the ring (demo: video-shotcraft logo drawn on + lowercase wordmark),
  and the 44px tagline below (the brand line) rise in a stagger, and the last frame is the launch poster
- Background: two rows of 300px single-colour pale-purple outline type walls drifting slowly in opposite directions + an aurora key light behind the cards lifting
  the card group; on the collapse the type walls shrink toward the centre with the suck-in and fade out. The card group, collapse point, ring centre and giant type
  share a single centre (the frame centre shifted down 30px)

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Spacing/size of the three cards | Heavily overlapped into one staircase stack, scale 1.6–1.74 | Two rounds of escalation precedent: "closer, and bigger" — the staircase must read as one group, not three cards |
| Settled slow rotation | ry ~0.34°/f continuous | **Must not be still** (precedent); >1°/f reads as not yet settled |
| Collapse duration | 10f ease-in | The 22f version was rejected with "it needs to be fast"; opacity leaving early = the suck-in is unreadable (rework precedent) |
| Smoke ring | Single ring, turbulent ragged edge, very slow decay | Multiple rings were rejected; the smooth neon ring/particle version was rejected — build the turbulent texture against the original film's dense frames |
| Blur | Zero blur throughout | Adding blur to the tumble/collapse was rejected both times |
| Spline | One Catmull-Rom running through | Piecewise lerp has speed steps, and "silky smooth" was the ruling's own words |
| Giant-type entrance | 4f after the collapse arrives, 14f snappy 1.22→1 + tracking tightening | The original waited 14f before the type appeared, leaving a black field with only a small ring in between and the climax losing its breath; slow enlargement (0.7→1 / 34f) reads as a fade-in rather than a slam |
| Flash core | Radial white-hot core + 12% full-screen slight overexposure, 6f decay | Remove it and the ring looks like it pops out of nowhere; adding an outline bright ring immediately looks cheap (same precedent as the smoke ring) |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- Smoke-ring texture precedent: clean graphic rings (outlined circles/concentric waves) were rejected three rounds in a row, and the final version
  used feTurbulence turbulent ragged edges calibrated frame by frame against the original film's dense frames — "it must be the same"; the remaining gap
  is that the noise field is static (overall rotation + growth) with no per-frame turbulent rolling, so at very close range the sense of flow is weak
- The smoke ring is the aftermath of the energy collapse, not a celebratory hit point — particle fireworks must not be added

## Reference implementation
demos/transition/card-flock-tumble/
(CardFlockTumble.tsx)
Original source: clickup-30.mp4
