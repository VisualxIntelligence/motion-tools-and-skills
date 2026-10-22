---
name: print-texture-transitions
summary: Print-texture transition: ink-bleed-reveal, where a whisker-like bleeding edge spreads and eats up the old scene
use_when: The paper-and-ink aesthetic version of a scene-change seam; the third family alongside the three hand-off variants/the traversal variants — the "medium developing" type of transition
duration: 4–4.5s (bleed segment 55–80f + still close ≥30f)
energy: Medium (gradual emergence, no impact beat)
---

## Intent
The transition vocabulary already has hand-offs (the three variants of shot-transitions) and traversal (transition-travel)
, both spatial/optical metaphors. This variant opens the third family: **the medium metaphor** — the new picture does not "arrive"
but is "printed/dyed" in, directly invoking the physical imagination of the library's paper-and-ink aesthetic: like a drop of ink landing on
rice paper, bleeding out and eating up the old scene, organic and calligraphic. It has a natural affinity with films in the paper/ink tone,
and is another "medium-family" seam choice besides light-leak-burn (accent-colour light leak).

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| A ink-bleed-reveal | The new page bleeds out from the ink-drop point through an organic circular mask with a whisker-like bleeding edge, eating up the old scene at uneven speed | Old scene → new scene replacement; calligraphic feel, narrative tone |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Bleeding edge | An SVG mask white circle with `feTurbulence(fractalNoise, baseFrequency 0.02, octaves 3, seed fixed)` + `feDisplacementMap scale 60→160 rising per frame` | The filter only kneads the shape of the mask while the content always stays clear; the seed must be hard-coded (determinism) |
| Bleed | Radius [20,98f]→[0,1450px] Easing.out(quad), multiplied by `1+0.08·sin(0.32f)·env` uneven-speed perturbation (env decaying to zero over the last 20f) | A constant-speed circular expansion reads as an ordinary iris — the perturbation is "the temper of the ink" |
| Ink edge | Two mask circles lead the new scene by 20–42px: outer rim 0.42 opacity + 3.2px feather, inner core 0.86 + 1px feather, then a further ring +110px with a heavy-feathered wet halo (0.12); a small ink dot lands first at 14–22f | Without an ink edge it reads as an ordinary iris wipe; an ink edge that is too wide or too solid reads as a burnt hole in paper |
| Developing | The new scene scales 1.035→1 inside the mask (20–100f ease-out), returning to exactly 1 before the mask is removed | If not settled it jumps on the frame the mask is removed |
| Closing mask removal | After the bleed has filled (around frame 100) remove the SVG mask and lay the new scene down directly | feTurbulence has sub-pixel jitter, and if not removed the ending never truly comes to rest (precedent from this batch's real renders) |
| Close | Truly still ≥30f once the new scene is in place | R1 |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The one-variant-per-seam rule is the same as in shot-transitions: a medium transition is not layered with a white flash/screen shake;
  this variant and the light-leak-burn medium family total ≤2 uses in the same film, and more reads as a print-shop promo
- In the middle of the bleed, old-scene content briefly shows through the noise holes in fragments — reading as ink-stain texture
  it is an acceptable organic effect, but if the old scene contains highly recognisable elements like faces/logos it reads as a glitch, so avoid that
- A slow transition (55–80f action segment); do not use it in fast-paced back-to-back sections — use shot-transitions B-variant whip-pan there

## Reference implementation
demos/transition/print-texture-transitions/
(InkBleedReveal.tsx)
