---
name: mosaic-reframe
summary: 12 tiles morph continuously between three layouts, a regular grid, a feature mosaic and a diagonal cascade string, with position, width and height each interpolated, a slight stagger tile by tile, and a hold between segments
use_when: Display transitions of "many ways of seeing the same batch of content": layout-capability showcases for portfolio/template-library/album products
duration: about 7.1s (214f@30fps; emerge 0–22f · hold A · A→B 56–92f · hold B · B→C 132–176f · hold C to 214f)
energy: Medium (continuously flowing rearrangement, no burst point, a calm temperament)
---

## Intent
Let the viewer see "the layout itself thinking": the same 12 pieces of content go from a tidy archive state (grid) to a curated state with primary and secondary (feature mosaic), and then to a dynamic state with attitude (diagonal cascade).

## Motion core
- The three layouts are hard-coded as coordinate tables in native 1920×1080 pixels (content area x 96–1824, y 212–984): A = 4×3 regular grid (gap 24);
  B = 6×4 cell mosaic (first tile occupying a 3×2 large slot, gap 16); C = portrait photo paper 300×372 spread diagonally along (850,214)→(1724,930),
  with `rot = −15° + i·3°` rotating incrementally
- Each tile interpolates centre x/y, w/h and rot **independently**, without using transform for overall scaling — width and height really change, and rounded corners and shadows do not distort;
  position arrives first: w/h converge 2f later and rotation 4f later, and the B→C rotation carries one light overshoot (bezier 0.45,0,0.3,1.22)
- Move curve bezier(0.75,0,0.15,1) (slow start → rapid travel → long soft landing tail), 26f per tile for A→B and 30f per tile for B→C;
  en route each tile lifts with a sin envelope by segment progress (enlarged 3.5% + a larger, softer shadow) and settles back on landing
- Causal driver: in the segmented control at the top right, Grid / Mosaic / Cascade, the accent-colour capsule first slides to the next notch (snappy 12f, stretching horizontally en route),
  and the tiles only begin to rearrange 4f later (parent moves first, children follow)
- Stagger: A→B sweeps by index, dense first then sparse (10f span); B→C spreads out at equal intervals one after another like dealing cards (14f span),
  and from B→C the stacking order switches to "later-dealt on top" (state B has no overlap, so the switch is invisible)
- Three states, three tones: in state B the main image is overlaid with a large serif caption (Featured shot / Golden Hour / Shot 01 · Crash zoom · 4.5 s rising word by word);
  in state C the tiles grow a 14px photo-paper white border, and a large serif title + sub-line rise in the blank at the bottom left, with the last frame a complete poster
  (the demo is video-shotcraft's 12-shot storyboard: header logo + wordmark + Storyboard, closing with "Every shot, in sequence." + the brand tagline)
- Opening: 12 photos rise in a stagger along the diagonal (16f snappy), with the camera on a very slow push-in 1→1.025 throughout

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Segment duration / hold | A→B 26f, B→C 30f; hold A 30f, B 36f, C 34f | The hold is the breathing space for reading the layout; pressed to <20f the three segments smear into one |
| Control→tile lag | 4f | 0 = cause and effect cannot be read; >8f looks like the control is malfunctioning |
| Stagger span | A→B 10f, B→C 14f | 0 = the whole layout flashes mechanically; >24f and the wave steals the show from the layout itself |
| Cascade parameters | Photo paper 300×372, centre spacing about (79,65)px, rot −15°+3°/tile | The incremental rotation is the soul of the "string"; equal angles degrade into a slanted grid |
| mosaic large slot | First tile 3×2 cells | Swap the slots table to rearrange primary and secondary; guarantee there is one anchor slot of ≥2×2 |
| Lift envelope | scale +3.5%, shadow elevation 6→40 | Too large looks like pop-ups flying about, and 0 reads as flat sliders |
| Tile content | SVG procedural photos (viewBox + slice ≈ cover, eight warm-toned film styles) | When swapping in real photos keep the overflow:hidden rounded container + object-fit: cover |

## Known pitfalls
- Independent interpolation of centre/width/height means it **cannot** be replaced with `transform: scale` — animating width and height triggers reflow of child elements, and images should use `object-fit: cover`
- The last tile of segment C deliberately goes beyond the bottom edge of the frame, and the frame crop is part of the composition; C's diagonal must avoid the top-left wordmark and the top-right control, leaving the bottom left for the title
- Portrait photo paper crops a landscape photo to a strip in the middle: put the photo's subject near the horizontal centre of the frame; the sun in the main image is to the right, giving way to the bottom-left caption
- The stacking order can only be switched in a state with "no overlap" (the B→C start frame); changing zIndex midway through an overlap shows tiles jumping layers
- After segment windows + stagger + lag are stacked, the last tile of B→C only settles at about 176f, and adding more segments requires compressing earlier segments rather than extending

compress earlier segments rather than extending (guaranteeing that everything has landed before t=1)

## Reference implementation
demos/transition/mosaic-reframe/
(MosaicReframe.tsx)
