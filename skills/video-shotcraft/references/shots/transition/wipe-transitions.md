---
name: wipe-transitions
summary: Geometric wipe transition: blinds-slice, a venetian-blind strip cut (12 3D blades flip in a staggered wave, and after the wave sweeps through the whole page changes from A to B)
use_when: A general-purpose transition where neither old nor new page moves and a geometric boundary sweeps through to complete the hand-over; does not depend on the composition having a suitable element, so it can be used anywhere
duration: prior state ≥20f + wipe ~56f + close ≥40f, about 4.4s (132f)
energy: Medium
---

## Intent
The transition library already has three families: traversal (dive in), hidden cut (cover the cut), and block (the page is
a physical object). This card is the fourth family, **geometric wipe** — neither old nor new page moves, and a geometric boundary sweeps through
to complete the hand-over, with the shape of the wipe being the semantics: the strip sweep is "venetian-blind blades flipping one by one to change the page". The difference from
shot-transitions C-variant window punch-through (an element-mask wipe): C uses a real element on the page as the mask
(depending on the composition), whereas this card is a pure geometric shape — its generality is its positioning. Suited to lateral progression and page-turning semantics.

## Method
| Variant | Method | Use when |
|----|------|------|
| A blinds-slice | 12 blades of 160px in real 3D (preserve-3d double-sided panels: the front is a slice of A, the back a slice of B pre-rotated 180°, backface hidden), sharing a 1900px perspective and rotating rotateY 0→180° about their own vertical axes, staggered into a wave; when standing edge-on the dark slot behind the blades shows | Page-turn/progression semantics; pages with a left-to-right reading flow |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Wave | Starts at 24f, blade i starts jumping at = 24 + 28·(i/11)^0.78 (interval 3.4f→2.1f, flipping faster and faster); each blade a physical spring damping 13 / stiffness 75 (~13f to 180°, ≈5° overshoot and settle) | Only with 4–5 blades turning at once does it read as a "wave"; with an EASE.out stagger the first interval is 9f, with an idle wait after the first blade and the wave looking dragging |
| Blade face lighting | A face turning away from the key light darkens by 0.5·sin θ (gradient along the blade width), a face turning toward the key light gets a screen highlight sweeping past at ~35°, and the 2px lit thin line on the blade edge ∝ sin θ; the dark slot #1d1712→#120d0a exposed when edge-on is the boundary line | The real 3D dark slot + lighting are themselves the "bright line" of the wipe boundary, so there is no need to overlay an SVG seam line |
| Removing the layer | After the last blade's spring converges (|θ−180°|<0.3° for 4 consecutive frames, ≈80f in the demo), unmount all 3D blades and output page B directly | opacity 0 does not count as removed; a lingering clip-path / 3D layer ruins true stillness, and text inside a 3D layer is also less sharp than flat |
| Close | Settles ≈50f after the layer removal (≥40f; the masthead hairline redrawn once, camera 1.02 settling back to 1) | R1 |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The wipe boundary must carry a bright line/highlight — a wipe without a bright line reads as a PowerPoint transition, and this is the crux;
  this variant relies on the dark slot exposed by the blades standing edge-on + the lit thin line on the blade edge as the boundary
- Geometric wipes ≤2 times per film, and do not use them back to back in the same film (two "boundary sweeps" read as a template feel)
- Layer removal must wait until the last blade's spring has converged (≈80f); unmounting one frame early is a blade jumping position and giving the trick away
- The two pages need strong contrast (demo: warm white paper vs full-bleed vermilion; the two pages are two consecutive pages of a video-shotcraft publication, with the masthead being the video-shotcraft wordmark,
  the giant type "Frame." → "Craft."), and ideally the layout grid is isomorphic with the blade width (12 columns × 160px) — flipping two pages of the same colour family shows only the dark slots
- The vignette / grain is drawn only once on the outermost layer and not into each page (each blade slice would carry its own section of vignette, giving the game away at the blade seams)

## Reference implementation
demos/transition/wipe-transitions/
(BlindsSlice.tsx)
