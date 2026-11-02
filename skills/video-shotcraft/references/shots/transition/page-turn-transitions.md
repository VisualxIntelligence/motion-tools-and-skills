---
name: page-turn-transitions
summary: Whole-page block transition: barn-door-split, a double-door curtain split (the old page splits into two halves and slides out, the new page rises to meet it)
use_when: Chapter-level page changes: the "turning the page" ritual between two big sections where old gives way to new; division of labour with the shot-transitions family (shot hand-offs) — that is "the aerial camera moving over", this is "the page is itself a physical object"
duration: single variant 150f (establishing the prior state 30–40f + transition 24–40f + follow-through and close ≥70f), about 5.0s
energy: Medium-high
---

## Intent
The three variants of shot-transitions and transition-travel/hidden-cut all treat the page as a "scene"
— the camera moves between scenes. This card treats the page as a **physical object**: it has thickness, has weight, and can
split open. The ritual feel of the block metaphor is stronger, suiting chapter-level big page changes (feature A finished → feature B)
rather than small shot-level hand-offs. The barn door is "the old yielding" — the old page tears open from dead centre and slides away, and the new page
rises to meet it from underneath, implying replacement, dedicated to old-for-new succession.

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| A barn-door-split | The old page's two 960px overflow containers are joined in register, and slide out of frame together with an outward ease-in acceleration (horizontal motion blur applied by speed); light from the new page shows through the gap — the 10px cut face on the doors' inner edges is lit, and the door faces near the seam are tinted warm by the light, and the new page rises to meet it with one overexposed light beam scale 1.08→1; the demo is a video-shotcraft version succession in the same layout: the cool-grey old page "Shotcraft 3" → the ember launch page "Shotcraft 4" (eyebrow carrying the mirror-engraved logo), with the data rolling from the old value to the new value (illustrative values) | Old-for-new succession: before and after a redesign, plan A→plan B, version release |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Foreshadowing | Before the split, a hairline bright line (with bloom) at the centre seam is drawn from the midpoint up and down (20–30f), and at 30–40f the seam is pushed open by ease-in 0→16px into a slit of light | If it splits directly the viewer does not see where the split point is; a hard on/off flashing line reads as a rendering glitch |
| Slide-out | Each translateX ∓1000px / 24f, bezier(0.42,0,0.8,0.25) accelerating | An ease-out slide-out is "being pushed away", only ease-in is "yielding"; quart-in is too violent and reads as "stop → vanish on the last frame" |
| New page rises to meet | scale 1.08→1 (snappy 36f, starting 2f after the doors), with the overexposed light beam decaying ~30f as the doors move away; old and new pages share the same layout and the same slots | If the old and new pages have different layouts, "replacement" cannot be read |
| Torn edge | Inner edge 10px lit cut face (bright → accent colour → dark) + 620px of light tint on the door faces near the seam (screen), the doors cast no shadow onto the new page | Two halves with no edge line read as an ordinary left-right wipe; doors casting shadows into the seam would dull the light to grey |
| Close | After the new page settles, follow-through action (data rolling / checklist ticking) + hold ≥30f, with the camera on a very slow 1.5–2% push-in during the hold | R1 |

## Known pitfalls
- The demo was tuned on pages hand-built for the shot — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The one-variant-per-seam rule is the same as in shot-transitions; a block transition is heavier than a shot hand-off,
  **at most 2 per film**, and using block transitions for two seams in a row reads as PowerPoint page flips
- The two halves must be **joined in register with no gap** (right half's inner layer translateX(−960px)) —
  a visible seam when still exposes the trick; with real screenshots watch for rounding of odd widths
- The pages before and after the transition both need ≥30f of stillness for establishing/closing — if both ends are moving, the block feel is drowned
  by motion

## Reference implementation
demos/transition/page-turn-transitions/
(BarnDoorSplit.tsx)
