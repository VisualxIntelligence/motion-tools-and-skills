---
name: neon-frame-orbit-drop
summary: After the neon frame draws first, the camera arcs around the page from left to right, and all the page's components/text drop from the air and fit down on the **same frame** (same-shape soft shadows converging in sync) - an all-at-once, placed-in-the-frame appearance
use_when: A one-time grand entrance of a single UI page (as opposed to a tour / area-by-area reveal); the main-visual unveiling of a dark-scene neon-tone segment; the sister shot of neon-frame-forerun
duration: frame draw ~0.5s + rotation & simultaneous drop-in ~2.5s + settle ~1s; whole segment ~4.7s (140f, rotation ends at 128f and then leaves the settle)
energy: Medium-high (a one-time big action that goes still once settled)
tags: effects, camera
---

## Intent
The twin variant of neon-frame-forerun: likewise frame first, content after, but the camera
is not fixed - it rotates in a continuous arc from a viewpoint on the left of the page to one on the right, and while the rotation is under way all the components drop from the air.
The crux is **simultaneous fit**: all components and text lift, fall and fit on the same frame, and the soft shadows vanish in sync - this is the grammar
of "an all-at-once appearance" (precedent: the staggered version was rejected as "it should be all components and text dropping from the air and fitting down at the same time").
A staggered drop-in belongs to the tour shot (graze-face-tour); a single page's one-time reveal
must drop together, and the rhythm semantics must not be mixed.

## Motion core
- Neon frame drawing: a gradient neon frame races into shape in ~14f (same as neon-frame-forerun)
- Viewpoint arc: a continuous arc of rotateY +38° → -26° (perspective origin following 30%→64%,
  approximating a camera orbit), running through the whole film
- Simultaneous drop-in: all elements share one LAND moment (normalised ~0.52) - they leave the ground and hover on the same frame, descend through the air on the same frame, and fit on the same frame;
  FloatWrap same-shape soft shadows (blur/offset/
  opacity varying with height) converge in sync across the board
- A background neon tube-frame group serves as a backdrop and gives way after the main panel settles

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Drop-in simultaneity | All elements lift and fall on the same frame (zero stagger) | **The crux**; any stagger reads as the tour grammar (see above for the precedent ruling's exact words) |
| Viewpoint arc | rotateY +38°→-26°, perspective origin following | A small arc reads as shaking; rotating without dropping = spinning idly |
| Rotation × drop-in coupling | The drop-in window is centred on the rotation travel | Dropping only after the rotation is done = two separate acts; still rotating after the drop is done = cannot wrap up |
| Hover height / soft shadow | Same as graze-face-tour (100-180px, shadow following height) | An imperceptible shadow = not done (cumulative precedent) |
| Frame drawing | ~14f race | Same as neon-frame-forerun |

## Known pitfalls
- Passed tuning on placeholder material over two rounds, not battle-proven final values; the first real use must re-verify against real material
- **Precedent on drop-in rhythm semantics** (this card and graze-face-tour are each other's counter-example):
  tour shot = staggered starts + overlapping parallel falls; all-at-once appearance shot = everything on the same frame. Choosing the wrong grammar
  gets both rejected
- Division of labour with neon-frame-forerun: that card has a fixed camera, staggered drop-in + the page light-up
  meshing as three layers; this card has a rotating camera + all falling together. Pick one per segment, do not use them back to back (the same frame
  language repeated)
- The arc rotation is an approximation by perspective origin, not a true 3D camera orbit, and at extreme angles the frame glow's
  deformation is somewhat flat - if real use needs a large-angle orbit, consider a true 3D scene

## Reference implementation
demos/ui-entrance/neon-frame-orbit-drop/
(NeonFrameForerunOrbit.tsx)
Original source: no corresponding original segment
