---
name: scanline-assemble-flyin
summary: The page opens on a blueprint artboard with only a grid and dashed slots while a bright scan line sweeps from top to bottom; as it reaches each slot, that component flies in from off-screen, overshoots and snaps into place, with a directional afterimage blur and snap-in corner marks on landing — by the time the scan finishes the whole page is assembled
use_when: Openers where the "page generates itself"; the core demo of AI site-building/auto-layout products; capability narratives from blank to finished
duration: about 5.2s (156f@30fps)
energy: Medium-high (the scan line is steady, but every component fly-in is a burst point, with density building up)
---

## Intent
Give "the page being generated" a credible construction order: the scan line is the construction progress bar,
and components flying in from off-screen to snap into place are the construction actions. The key is that **the last block is assembled exactly when the scan finishes**
— if the scan line finishes early or the components trail behind, the cause and effect of "scanning drives assembly" falls apart.

## Motion core
- Frame 1 is already the complete "construction drawing": a full-screen blueprint grid (24px fine lines α.045 + 120px major lines α.085), a 1640×860 artboard dashed outer frame
  with width annotations, and a dashed slot for every component (with small tags like `H1 820×250`) — the viewer first sees "what is to be installed and where"
- The scan line runs **strictly at constant speed** over 8→92f through the artboard y −20→880: white core + three layers of electric-blue glow, fading out 60px beyond the artboard at both ends;
  the grid 180px behind the line is lit, and the **page background colour is "brushed" in** (the artboard surface mask follows the scan line downward)
- The landing frame is back-calculated from the slot's lower edge: `land = frameAtY(y + h)`, sorted by lower edge and clamped to a minimum interval of 4f; the 14f flight **takes off early**,
  so the component and the scan line arrive at the same time. Demo measured NAV 19f · BADGE 29f · H1 55f · BODY 66f · MEDIA 75f · CTA 79f · STATS 88f
- The 7 components each have an off-screen start point: the nav from above (0,−260), the badge / H1 / body from the left (−620…−980), the media card from the right (+900,+80, 6°),
  the CTA / stats row from below (+420…+460); `EASE.overshoot` overshoots ~8% as it snaps in, with the ±2–7° rotation returning to zero in sync
- While moving, velocity is computed by differencing the pose centre, and `SpeedBlur` drags a trail along the flight direction (0.32× speed, ≤18px), cleared 4f after landing
- Landing: the slot's dashed line disappears within 4f; four electric-blue L corners (arm length 22px) bite in from 20px outward to 10px, lit at `land+1→+4` and settling over `+5→+14`;
  the full-width nav does not get them
- Status line `BLOCKS 0n / 07` + a stopwatch running in real time; after the last block lands it switches to `✓ BUILT` and the stopwatch freezes, the blueprint grid recedes to 30%,
  the media card (the galaxy sample-film shot) lights up one notch, and then ~50f hold

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Scan line | 84f constant speed, artboard y −20→880 | The finishing moment should be slightly later than the last block landing, so that it reads as "scan finished = assembly finished" |
| Trigger conversion | land = SCAN0 + (y+h−Y0)/(Y1−Y0)·(SCAN1−SCAN0) | To change the scan window change only the four constants; the flight duration FLIGHT is the early take-off amount, and without it things move only "after the scan has passed" |
| Minimum interval | prev + 4f | MEDIA / CTA, whose lower edges are close, would land simultaneously; only after clamping is there a "one block at a time" density |
| Fly-in displacement | 260–980px off-screen, set by the component's position | A displacement under 200px reads as "a jitter into place", not coming from off-screen |
| Fly-in rotation | ±2–7° | Beyond 12° it reads as "tumbling" and does not sit flush when snapping in |
| Fly-in easing | EASE.overshoot, 14f | The overshoot is the feel of "snapping on"; a plain ease-out becomes a slide-in |
| Afterimage blur | Directional SpeedBlur 0.32× speed, ≤18px, cleared on settling | Isotropic blur reads as out of focus rather than speed; if not cleared a permanent blur layer remains |
| Landing corner marks | Outward 20→10px, arm length 22px, 3f lit / 9f settle | The corner marks are the substitute for the sound of "snapping in"; a full outline flash frame reads as a debug box, and sending 7 in a group violates Q4 |

## Known pitfalls
- **The trigger moment is bound to the slot boxes in PLAN**: after changing the page template every component's box must be re-measured, otherwise components fly in before the scan line arrives
- Components are absolutely positioned in `Fly` with the slot as origin; the corner-mark layer is an SVG inside the component (overflow:visible),
  and if the component itself has `overflow:hidden` it clips the outward-offset corner marks — put the media card's clipping on an inner layer
- The page background "brushing in" uses a linear-gradient mask on the artboard surface (following the scan line y), and the blueprint grid is a separate layer;
  both layers follow the scan line, so do not mask out the grid too, otherwise the area below the scan line turns dead black
- Shares the "scan line as causality" logic with `scanline-annotate-focus`; the two cards can be chained (assemble first, analyse after),
  but the scan line must change direction or leave a gap, otherwise it reads as repetition
- The page content is video-shotcraft's landing page (mirror-engraved logo + wordmark nav, the "Shoot the / launch film." H1, the sample-film shot card), the accent colour (electric blue / cyan) is taken from LOOKS.midnight, and to reskin just change L

## Reference implementation
demos/effects/scanline-assemble-flyin/
(ScanlineAssembleFlyin.tsx)
