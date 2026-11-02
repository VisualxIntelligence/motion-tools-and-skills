---
name: avatar-bracket-carousel
summary: "Your ___ agent" fill-in-the-blank typography; four corner focus brackets are pinned in place mid-sentence while a queue of avatars rotates vertically through the frame on a spring three times. An avatar entering the frame scales up and sharpens; leaving, it shrinks, fades and blurs by distance. The role label swaps in sync, and the brackets breathe 7% at each switch
use_when: Enumerating abilities as "one slot, many roles"; the core one-line shot for team / identity / preset / persona products
duration: about 5.2s (156f@30fps)
energy: Medium (three evenly spaced switches form a steady metronome; the bracket pulse is the only decorative motion)
---

## Intent
"Our agent can be a director, an editor, an animator, a sound designer" listed as four rows is just a checklist. Fitted into one slot of a single sentence,
it becomes one promise plus four proofs: the sentence stays still and only the person in the slot changes. The four corner brackets are the key to this technique
- they do not take part in the rotation, but they pin the viewer's eye to that 92×92 box, so the four swaps read as
"the same slot" rather than "four avatars drifting past".

## Motion core
- The position value `pos` is the accumulation of three springs: `[0.24, 0.46, 0.68].forEach(s0 => pos +=
  seg(t, s0, s0+0.14, k => E.spring(k, 0.25)))` - not an index jump but a continuous quantity, so at any
  moment you can compute how far each avatar is from the slot
- Distance drives everything: `d = |k - pos|`, then `scale = max(0.5, 1-d*0.38)`,
  `opacity = max(0, 1-d*0.62)`, `blur = min(3, d*2.4)`, `translateY = (k-pos)*76` -
  four properties derived from one distance value, so the changes on entering and leaving the frame are naturally in sync and need no separate timing
- The queue is stacked with absolute positioning on a 0×0 anchor at the `slot` (`left:-29px, top:-29px` self-centring),
  and vertical displacement relies entirely on `(k-pos)*STEP`; avatars outside the frame are still rendered, just hidden by opacity and blur
- The entrance is another layer on top of the rotation: `el.style.opacity = op * seg(t, 0.02+k*0.03, 0.12+k*0.03)`
  - the four are staggered by 0.03 and build the queue within the opening 0.15; after that this term is constantly 1 and the rotation takes over completely
- The role label is a separate set that shares `pos`: `opacity = max(0, 1-|k-pos|*2.2)`, with a decay slope of 2.2, much steeper than
  the avatars' 0.62 - the label vanishes completely beyond 0.45 steps of distance, so two labels never appear on screen at once
- Bracket breathing: `breath = Σ sin(seg(t, s0, s0+0.1) * π)`, take `min(1, breath)` and multiply by 0.07,
  then add it to scale; the sine envelope makes the pulse peak in the middle of the switch and return to zero when it finishes

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Switch points | 0.24 / 0.46 / 0.68, interval 0.22 (about 34f / 1.14s) | The interval is how long it takes to read one role; <0.12 and viewers have no time to see the label, >0.3 and the metronome feel falls apart |
| Switch travel | window 0.14 (about 22f), `E.spring(k, 0.25)` | Travel takes 64% of the interval, so rest time is about 12f; damping 0.25 gives one clear rebound, and going lower wobbles twice and interferes with the adjacent switch |
| Step distance | STEP=76px (frame 92px, avatar 58px) | The step must be larger than the avatar diameter or neighbouring avatars bite into each other; 76/92 means an avatar leaving the frame still shows a corner, hinting at the queue |
| Scale decay | `1 - d*0.38`, floor 0.5 | One step of distance shrinks to 0.62; a steeper slope makes the exit more decisive, but the 0.5 floor is hit earlier and the queue turns into "two sizes" |
| Opacity decay | `1 - d*0.62` | Fully gone beyond 1.6 steps of distance, so about 3 avatars are visible at any time; at a slope of 0.3 you see all four in the column, weakening the "locked" meaning of the viewfinder |
| Blur decay | `d*2.4`, capped at 3px | Blur is a depth-of-field cue; a slope of 2.4 gives neighbours about 2.4px; >4px and neighbours smear into colour blocks, and the queue no longer reads as avatars |
| Label decay | `1 - d*2.2` | The slope must be much larger than the avatars' 0.62 - labels are text, and two sentences stacked semi-transparent at once are the hardest to read |
| Bracket pulse | window 0.1, `sin(·π)` × 0.07 | 7% is the amount that reads as "it snapped shut for a moment"; >15% and the bracket becomes the star, stealing attention from the avatar swap |

## Known pitfalls
- Four avatars for three switches: `pos` ends at 3, exactly the last slot. Adding a fifth avatar requires a fourth switch (and the
  last switch must end before 0.86 to leave rest time), otherwise the end of the queue never enters the frame
- The switch points are a hard-coded array that appears in two places (the `pos` accumulation and the `breath` accumulation). Changing the beat means changing both,
  and missing one produces "bracket pulse and avatar swap out of step"
- The gap between the entrance stagger and the first switch is only 0.09 (entrance end 0.15 -> switch 0.24). Adding avatars pushes back
  the end of the entrance (`0.12+k*0.03`); with 5 or more you need to move the first switch later
- The avatars are white line icons on neutrally grey, lit gradient discs (the greyscale layering only distinguishes queue items); the accent colour is used only on the
  four SVG corner marks of the bracket (and one dot on the label chip) - after swapping in real avatars, keep this division of labour and do not let the avatars themselves grab colour
- The bracket SVG's four paths and the 92×92 viewBox are hard-coded coordinates (`M4,26 L4,4 L26,4` etc.). Changing the
  bracket size means re-measuring the whole set; changing only the container width and height distorts the corner marks' scale
- The sentence "Your ___ agent" (demo: the video-shotcraft agent crew Director / Editor / Animator / Sound) is centred with flex + gap:22px, and the slot has a fixed 92px width so the sentence stem does not reflow when
  avatars change - but when switching to a Chinese sentence, check that the change in text width on either side of the slot does not push the slot off the centre of the frame

## Reference implementation
demos/ui-entrance/avatar-bracket-carousel/
(AvatarBracketCarousel.tsx)
