---
name: tear-streak-transitions
summary: Tear transition: glitch-displace, a noise tear (a hard cut in the middle of 16 horizontal strips jittering out of register), a strip-level tear with digital-glitch semantics
use_when: High-energy page changes: digital glitch/rupture semantics; a strip-level tear where the page's integrity is not broken and the energy is maxed out
duration: prior state ≥40f + tear 16–24f + close ≥40f, about 4.5s (135f)
energy: High
tags: effects
---

## Intent
This card handles the **strip-level tear** — the page is cut into horizontal strips moving at high speed, but each strip's content is complete.
This is a taste boundary drawn by repeated rulings: the fragment-type transitions were rejected three times in a row (doom-melt vertical strips falling,
pixel-dissolve squares flipping to black, facade-block bricks flying, all eliminated), while the strip type passed. Fragments read as "the page is being destroyed", strips read as "the page is moving
at high speed" — integrity not broken, yet energy maxed out. Horizontal tear: strips jitter left and right out of register +
a two-colour silhouette ghost (a restrained version of RGB split: two single-colour silhouettes of the same page's content, using only the picture's two accent colours, offset by ±12px).
Suited to system-glitch/instant-jump semantics — the demo uses it for the state jump of "a release console going from Rolling out 99% to is live".

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| A glitch-displace | 16 horizontal strips of unequal height (outer clipping + inner whole-page translateY alignment), each strip's translateX driven by the library's standard h(i*31+f*7) jittering ±70px, overlaid with two-colour silhouette ghosting + a scanning bright line; at 54f a hard cut to page B in the midst of full-amplitude jitter, then 6f more of jitter until it settles back by 60f | Glitch/rupture semantics; state jumps (going live, switching version); a violent page change before the climax |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Jitter amplitude | ±70px, energy distributed per strip (about 20% still / 30% full amplitude / the rest light tremor), displacement pushed toward both extremes by an exponent of 0.6; a complete page laid underneath to prevent gaps showing the base | At the peak frame the strip misregistration must be clearly visible to the naked eye — ±12px level cannot read as a tear; every strip jittering at the same amplitude looks like water ripples |
| Envelope | 44–47f out-cubic surge → plateau → 54–60f linear dissipation | Impact precedent: out-cubic for spread, linear for dissipation |
| Ghosting | ±12px two-colour silhouettes (accent-colour single-colour copies of the page content, screen blend, misregistered together with the strip, given only to strips with large misregistration) | Without ghosting it is only jitter and not a glitch; silhouettes draw only the content and not the background, so that a dark field does not go grey |
| Cut edge / scan line | On strips with misregistration >25px a 1.5px bright line on the upper edge and a 3px dark gradient on the lower edge; 2 random-height full-width scanning bright lines per frame | Drawing a bright edge on every strip reads as ruled paper — give it only to heavily torn strips |
| Cut-point cover | 54f exposure 1.28 / 55f 1.12 + a 1.6% full-screen impact enlargement settling back over 6f; at 30–31f two thin strips ±12px as a premonition | The premonition is the wind-up: the viewer first "feels something is wrong" and then it tears |
| Removing the layer | From 60f the strips, ghosting, scan lines and filter are all conditionally unmounted, outputting the bare B directly | opacity 0 does not count as removed; a lingering filter ruins true stillness |
| Close | 75f (aftermath 40f: the region grid's teal-green wave, count, metrics rising + hold 35f) | R1; the aftermath lives only on the page content layer, with no more tear elements |

## Known pitfalls
- The demo was tuned on a procedurally drawn dark-field console page (midnight look) — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage; on a light-background page the silhouette ghosting must be switched to multiply to be visible
- **Strips, not fragments** — later techniques of the same kind are always made as strips: each horizontal strip stays complete,
  and never splits into squares/bricks/independent falling objects (the three-rejections precedent, see Intent)
- A high-energy transition; in the same film as whip-pan/crash types watch the energy budget —
  high-energy transitions crowded together dilute one another
- The hard cut hides inside the full-amplitude jitter (cut at 54f, settle at 60f) — if the cut point is exposed on a still frame
  it loses the cover of the glitch
- The strip page must bring its own opaque background (gradient + dot matrix), with the vignette and grain drawn only once on the topmost layer —
  transparent strips overlap ghosts with the whole page beneath, and a vignette that follows the strips' misregistration gives the game away

## Reference implementation
demos/transition/tear-streak-transitions/
(GlitchDisplace.tsx)
