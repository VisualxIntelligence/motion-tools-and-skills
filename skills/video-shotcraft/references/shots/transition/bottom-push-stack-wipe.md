---
name: bottom-push-stack-wipe
summary: Bottom-edge push-up chapter change: the new scene, background colour and all, pushes in full-screen from the bottom edge and physically shoves the old scene out of frame; several chapters are pushed in a row, each with its own saturated background colour, and the content is pinned into each chapter's own coloured coordinate system and travels with the background
use_when: The chapter-change skeleton of multi-chapter product films (one selling point and one background colour per chapter); section cuts that need a "page-turning rhythm" running through the whole film
duration: demo triple push 170f (~5.7s); a single push-in 26f + in-chapter hold ~1.2s
energy: Medium
---

## Intent
wipe-transitions is a boundary sweeping across, with neither old nor new page moving; page-turn is the old page splitting like double doors
and sliding out. This card is a third physicality: **the new chapter shoves the old chapter out** — two screens in rigid contact, displacing at the same speed
in the same direction, like a vending machine pushing a stack. The crux is "the whole screen travels with its background colour": the background colour + window card + decorative
bars are welded into one block of material pushed in from the bottom edge, so the viewer reads "a different world" rather than "a different card".
A heavy ease-out (fast in, slow stop) gives the push-in a "clunk" of landing; the 40px seam shadow on the upper edge
is the evidence of the physical contact between the two screens. With three chapters pushed in a row and the background saturation maxed out, the chapter change itself becomes the film's
metronome — the original slack film relies on this one trick alone as its skeleton.

## Motion core
- Each chapter is a full-screen layer: `translateY` pushes from +1080 to 0, and the old chapter is simultaneously shoved to
  −1080 — the two layers' displacements are strictly in sync with the same easing, and any speed difference reads as "sliding clipping through"
- Push-in easing = heavy ease-out `cubic-bezier(0.12, 0.9, 0.2, 1)` (fast in,
  slow stop), finishing in 26f (~12f already at 95%); the y of chapter i = (1 − its own push-in progress)×H
  − the next chapter's push-in progress×H, one formula governing both entering and leaving; the whole stack gets vertical directional blur by speed
- The new chapter's upper edge carries a 56px gradient seam shadow (the new chapter's hue-tinted dark colour 0.42→transparent, pressed onto
  the old chapter) + a 2px lit edge on the new chapter's upper edge, going to zero after settling — the physical feel of the "shove" depends entirely on it
- The demo is "Swiss poster" style (product video-shotcraft, one selling point per chapter): chapter 0 is a near-black opener, the three chapters are cobalt blue #2d4cff / vermilion orange
  #ff4d1f / acid lemon #cdf23a (dark text), with hues spread ~120° apart; each chapter has a left-column eyebrow +
  a 116px extra-bold two-line headline + a 40px description, and a large-type UI card designed for the shot in the right column
  (chat with the agent / beat-marking timeline / delivery pipeline), with the colour block lit from the top left and darkened at the bottom right, in the same light direction as the card shadows
- In-chapter animations are all staggered after the push-in: the headline rises from below the line only 12f after the push-in starts (already at 95%),
  and small UI actions (typing → message popping in / sound wave handing over to the current shot / delivery steps ticking off one by one) sit in the hold
- Push-in interval ~44f (demo pushes start at 22/66/110f); layers that have left the frame are unmounted promptly; the tail section has a 28f
  very slow 1.5% push-in

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Push-in duration | 26f, heavy ease-out | <20f reads as a flash cut; linear constant speed reads as a roller shutter, with no "clunk" at all |
| Hold between chapters | ~18f still + the tail of the push-in, total in-chapter dwell ~44f | The chapter is the content's performance area, and <25f means the viewer is shoved away before seeing clearly |
| Seam shadow | 56px on the upper edge, the chapter colour's dark tone 0.42 gradient + 2px lit edge | Remove it and the two screens look like overlapping ghosts sliding; >80px reads as the new chapter coming with its own black border |
| Background colour | One saturated colour per chapter, adjacent chapters spread apart in hue | If adjacent chapters share a colour family the "chapter change" reads as a "fine adjustment"; a greyscale chapter can only serve as chapter 0 |
| Content pinned | Window cards/decorative bars use in-chapter absolute coordinates | If the content is positioned relative to the viewport it will "drift" against the push-in animation, exposing the trick |
| Number of consecutive pushes | 2–4 chapters | 1 push does not make a rhythm; >4 and the viewer starts counting background colours, and tires |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- Division of labour with wipe-transitions: in that card neither old nor new page moves and a geometric boundary sweeps through to hand over
  (neutral, usable anywhere); in this card both pages move and one is rigidly shoved out (physical, with its own chapter
  rhythm) — use that card for a single seam, and this card for a whole-film skeleton
- Selected at the same level as the three variants of shot-transitions: this card is mid-energy with a fixed upward direction, so seams
  needing a large energy drop (such as going into the outro) yield to the white flash
- A uniform direction is the source of the skeleton feel: if every chapter in the whole film is pushed from the bottom edge, switching to a left push/top push
  midway scatters the metronome — if the direction is to change, do not use it as a skeleton
- While a push-in is in progress two chapters are on screen at once, both full-screen layers — keep in-chapter animations (card entrances etc.) clear of the push-in's
  26f window (wait at least until 95% has landed), otherwise both chapters are moving and the eye has no anchor
- In production use the saturated tier of the brand palette for the background colour; when the background saturation is insufficient the subordinate relationship of the window card being "pinned onto the coloured background"
  cannot be read, and it degrades into "cards each changing their own background"

## Reference implementation
demos/transition/bottom-push-stack-wipe/
(BottomPushStackWipe.tsx)
Original source: slack-promo 22–27s
