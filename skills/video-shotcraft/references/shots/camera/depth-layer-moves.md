---
name: depth-layer-moves
summary: Layered-depth camera move — a multi-layer parallax slider: 3 layers with a speed gradient traversing sideways to create depth, and the protagonist floating up as the slider settles
use_when: Sections where a flat screenshot should "have thickness": a sideways tour of a card deck / list / whole page
duration: 4–5.5s sustained (demo 165f)
energy: Medium (finish-oriented)
---

## Intent
Panning a whole page is "looking at the page", layered depth is "being inside the space of the page". The parallax slider adds depth
to a sideways move (the principle of the Disney multiplane camera, the same finish as the Linear film).

## Motion core
- **Parallax slider (3 layers + a 0x text layer)**: the same drive displacement multiplied by each layer's coefficient — the far layer is the whole page (0.35x + enlarged one notch + blur 5px +
  desaturated 0.7 + a same-colour atmospheric haze dense at the top and light at the bottom, receding into the environment), the mid layer is the real card deck (0.7x, the main reading layer, no blur, two layers of soft shadow falling on
  the "desktop"), the near layer is floating blocks (1.4x + blur 7px + a deep, distant drop shadow + horizontal drag smear by speed, sweeping past the lens). The demo (MultiplaneReal) uses
  a sand warm beige: the near layer is 5 enlarged terracotta / ink tag capsules (taken from the real tags on the cards), and a layer of stationary title is pinned on the frame
  (0x: video-shotcraft mark + wordmark eyebrow, "Your page, in depth." 120px) — the text stays still and the world moves, so the parallax reads even better
- The slider has an end point: the total drive is back-calculated from "card4 sits exactly at screen centre when the mid layer settles", an asymmetric in-out (bezier 0.45,0,0.18,1) over 130f;
  after settling the protagonist floats up (elevation 6→26, 1.035x, ~8f later than the position converges) + a terracotta outline + an "In focus" corner tag, and the last frame is a poster;
  the near-layer capsules' world coordinates are arranged so that "at settling only two remain pressed against the lower edge of the frame"
- The real page layout is not taken apart: the whole page forms one layer as a unit, and independent elements are cut as slices into a layer of their own — the relationship between layers is "depth of field", not "the page being torn open"

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Parallax layer coefficients | 0.35 / 0.7 / 1.4 (+ 0x text layer) | A gradient of ≥2× between layers is needed to be distinguishable; layers ≤4 to prevent overload |
| Layering anchors | Foreground/background blur + background desaturation + atmospheric haze | Without blur/saturation anchors it reads as "stickers flying around" |
| Slider end point | drive back-calculated to centre the protagonist | A constant-speed sideways move with no end point reads as a screensaver; after settling give the protagonist a beat of floating up |

## Known pitfalls
- The main reading layer must be a high-definition texture with no blur — the audience is reading it
- A full-screen real-time `filter: blur()` on a whole layer changing every frame is expensive (measured, it can differ by 3× or more in render time): hang the blur on small elements inside the layer, not on the layer container that fills the frame
- The combination of parallax with PageCam rot 3D (oblique-shot parallax) is unverified; in real use render a still first to confirm
- The parameters were tuned and corrected on placeholder footage, not battle-tested final values; re-verify after the first real use

## Reference implementation
demos/camera/depth-layer-moves/
(MultiplaneReal.tsx)
