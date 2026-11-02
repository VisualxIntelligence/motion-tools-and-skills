---
name: graze-face-tour
summary: A steeply tilted surface-hugging roaming close-up — the lens skims low across the UI surface (sidebar tree / top bar / list acting as terrain), page text initially hovers above the interface with a same-shape soft shadow, and as the camera advances it accelerates down and sticks back onto the interface one after another
use_when: A tour of feature areas (flying over the UI as a landscape); paired with a dark stage + neon rim light for a product "inner world" section; interface content making its entrance area by area
duration: single section 4–5s; multiple sections can relay to extend it
energy: Medium-high (continuous camera advance + continuous element landing, high information density)
tags: ui-entrance
---

## Intent
Shoot the UI as terrain: a steeply tilted close-up turns the sidebar tree, navigation and list rows into landforms sweeping past,
with shallow depth of field reinforcing the "hugging the surface". The heart of the shot is **text sticking down from the air**: text/components do not fade in in place,
but hover above the interface (raised on the 3D z axis), cast a same-shape soft shadow onto the interface while in the air,
and as the camera advances they accelerate down and stick back one after another, the shadows converging and vanishing with height — the audience sees the interface
"complete itself" as the camera passes. The shadow is the perceptible crux: without the shadow, the hovering reads as an
ordinary displacement entrance; with the shadow, the spatial relationship holds instantly.

## Motion core
- Camera position: CSS perspective + rotateX/rotateY at a steep tilt (the lens nearly skimming sideways over the surface),
  advancing continuously along a path on the interface; shallow depth of field = blur growing stronger with distance
- Hovering elements: initial hover height H≈120–180px (raised along the surface normal),
  easeFall accelerating fall + soft landing (no rebound on landing, or a very slight one)
- Same-shape soft shadow: the element rendered in place as a blurred darkened projection, with blur/offset/opacity all
  varying with the current hover height (high = a large, blurry, faint shadow; landed = the shadow coincides with the body and vanishes)
- Staggered sticking-down: each element's landing moment is arranged along the camera's direction of travel (the first passed lands first),
  the interface "completing in sequence" in front of the lens
- A long shot can be split into relayed sections: between sections use a cross-fade of adjacent sections (precedent: opacity windows that do not overlap
  produce a black flash frame)

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Hover height | 120–180px | <80px and neither the shadow nor the displacement can be read; >250px and the landing slams too heavily |
| Shadow parameters | blur/offset/opacity converging linearly with height | A shadow that stays constant and does not vary with height = a sticker feel; the landed shadow must go to zero |
| Sticking-down stagger | Arranged by camera direction of travel, normalised 0.2→0.85 | Landing all on the same frame reads as a switch; landing out of order reads as a bug; **stagger = staggered start points but overlapping, parallel falling processes**, while serial waiting (one finishes landing before the next begins) was rejected |
| Fall curve | easeFall acceleration + soft landing | An ease-out fall reads as a balloon drifting down, and the sense of gravity comes from acceleration |
| Section relay | Adjacent-section cross-fade ≥8f | Opacity windows that do not overlap produce a black flash (rework precedent: pure black frame at f100) |
| Depth of field | Blur growing stronger with distance | Fully sharp reads as flat scrolling, and only shallow depth of field gives the "hugging the surface" sensation |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Do not let airborne elements be swallowed by the ambient darkening band: airborne elements
  need follow-spot / brightening of ~1.3x, otherwise the hovering state is imperceptible, equal to not having done it
- Division of labour with space-camera-moves/tension-camera-moves: those two cards are camera
  language itself; this card = the combined signature of a surface-hugging camera position **+ elements sticking down**, and if half is missing
  use a camera card instead
- **Precedent for the semantics of the sticking-down rhythm** (the mirror counter-example of neon-frame-orbit-drop):
  this card's tour shot = staggered and parallel; a whole-entrance shot must have everything land on the same frame (the staggered version of
  that card was rejected). Choosing the wrong grammar gets rejected on both sides
- The original film (clickup-30) is one continuous long upward shot; the reproduction uses three relayed sections, with the section
  switches hidden in cross-fades — if a true single long shot is made in real use, the path-planning cost is much higher

## Reference implementation
demos/camera/graze-face-tour/
(GrazeFaceTour.tsx)
Original source: clickup-30.mp4
