---
name: segmented-thumb-hero
summary: The segmented-control thumb displacement as the protagonist close-up — an oversized capsule segmented control floats in on a spring, an outlined arrow cursor slides in from off-frame and presses, the white thumb slides to the other segment in 8f ease-out, and the instant it arrives the new icon springs out while the old icon retracts
use_when: The announcement shot for a "mode switch / either-or" feature (the demo's video-shotcraft Prompt→Film, Chat→Agent style); a close-up approach where one UI micro-interaction carries a whole shot
duration: ~3.5s (demo 110f: float-in 18f + cursor 24f + click + slide 8f + icon pop + hold)
energy: Medium (a micro-interaction close-up, refined rather than booming)
---

## Intent
When a product switches to a new mode, the usual way to shoot it is to swap out the whole interface. This card does the opposite: it enlarges the segmented
control to 1080px wide for a close-up, and **the 8 frames of thumb displacement are themselves the narrative** —
"we went from A to B". There is no page context at all, the control is the stage. The causal chain is complete:
the cursor slides in (someone has arrived) → press + ripple (a decision is made) → the thumb slides (the world responds)
→ the new icon pops out (the new identity is established). None of the four beats can be missing: without the cursor the UI is just moving by itself,
and without the icon pop the switch has no reward.

## Motion core
- The control close-up size is 1080×220, floating in on a spring from 200px below
  (spring damping 14 / stiffness 120), with the large shadow shrinking as it settles (24→12px)
- The cursor is an oversized outlined arrow (130px, white fill with ink outline): 24f Easing.out(cubic)
  sliding from off-frame at the lower right onto the target segment; on press scale 1→0.86→1 (3f down, 4f back)
- **The thumb is strictly 8f** Easing.out(cubic) (demo 52→60f) — reproducing the feel of the original film;
  these 8f are the heartbeat of the whole shot, and every beat before and after serves it
- At the instant of arrival two actions start on the same frame: the new icon pops out with spring(damping 10, stiffness 220)
  overshoot; the old icon collapses with a 6f Easing.in and its width goes to zero in sync so the text reflows naturally
- Click ripple: a 3px accent-colour thin ring spreads from the click point (the cursor tip) over 12f and fades (Easing.out(quad))
  — the ripple confirms that "the press" happened, and a click without a ripple reads as the cursor passing by

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Control size | 1080×220, thumb inset 16px | Shrunk to <600px wide it is no longer a close-up, and the thumb displacement carries no weight |
| Thumb duration | 8f Easing.out(cubic) | >14f reads as a slow-motion demo video; <5f reads as a teleport, and the "slide" is gone |
| Cursor slide-in | 24f from off-frame, ease-out | Linear or <14f reads as the cursor being thrown in; the start point must be off-frame |
| Press | scale 0.86 + ripple 12f | Sliding the thumb with no press breaks the causal chain and reads as autoplay |
| Icon pop | spring damping 10/stiffness 220 | damping <8 bounces three times and steals the thumb's scene; if the old icon does not retract the text is squeezed out of the control |
| Closing hold | New state at rest ≥30f | Cutting away right after the switch means the "new mode" is not seen clearly |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Division of labour with cursor-flyover: that card has the cursor clicking and pushing in
  within a complete page (with context), while this card is a background-free close-up of the control detached from the page — both can coexist in the same film,
  but do not shoot both the page version and the close-up version of the same click
- The icon collapse uses width going to zero rather than scale alone — scale alone leaves an empty slot, the text does not reflow,
  and a "ghost gap" appears in the control (in the demo width and scale are driven in sync)
- Use controls with three or more segments with caution: the thumb gliding across several segments in 8f is too fast for the stops to be read,
  and lengthening it breaks the feel — this card suits "either-or" best
- The ripple ring must be z-indexed above the thumb with its centre locked to the click point — if it follows the thumb
  it becomes the thumb's trailing smear and the semantics go wrong
- Swapping in real material: segment labels/icons can simply be replaced with real feature names, but "the new segment's icon having an expression"
  (the demo's smiling clapperboard) is half of the sense of reward, and a plain wireframe icon would be much weaker

## Reference implementation
demos/interaction/segmented-thumb-hero/
(SegmentedThumbHero.tsx)
Original source: perplexity-promo 2.3–5s
