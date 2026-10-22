---
name: collab-cursor-moves
summary: Collaboration cursors as actors — cast-ensemble, an ambient layer of five extra cursors (staggered fly-in + sine drift + a typing cameo + gathering to look on)
use_when: Canvas scenes on collaboration / multi-user themes, laying "the team is here" warmth over the picture
duration: A ~5.2s (156f)
energy: A low-medium (an ambient layer, can underlay any duration)
---

## Intent
Cursors in the library have always been "operating tools" (the cursor in cursor-flyover
is a single-cursor click tour). This card promotes collaboration cursors carrying identity name tags to **actors**:
five cursors enter in a stagger and then keep drifting as ambient particles, the sense of "the team is here" depends entirely on them, and one of them
can even stop and type (a cameo role). An SVG cursor + name-tag chip is very cheap in cost and very high in narrative density,
the cheapest visual argument for the "collaboration" theme.

## Variants
| Pattern | Approach | Use when |
|----|------|----|
| A cast-ensemble | 5 named coloured cursors fly in on staggered springs onto the video-shotcraft storyboard whiteboard (the avatar group pops out on the same frame, sticky notes carry the author's colour) → dual-frequency sine drift as residents → one hangs on the insertion point and types out the briefing card's title → at the end everyone gathers smoothly to look on | The ambient layer for a whole film of canvas/whiteboard products; background liveliness that says "others are here too" outside the main content |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A entrance | 5 cursors staggered at delay 2/7/11/16/22f, spring(damping 15, stiffness 80); name tag fades in 10f later + rises 12px; the top-right avatar group pops out on the same frame (slot width grows with the pop) | A name tag appearing on the same frame as the cursor reads as a sticker; fading in as it decelerates is "a person arrives and announces themselves" |
| A drift | Dual-frequency sine superposition (0.055/0.021 rad/f, a different phase for each), amplitude ±40/26px | A single-frequency sine reads as a pendulum; dual frequencies out of phase are the "randomness of a human hand" |
| A typing cameo | 48–104f types 29 characters (1.6–2.4f/character with deterministic jitter, an extra 0.9f pause after spaces); the cursor arrow hangs on the in-line insertion-point anchor and follows through line wraps; the hand is steady while typing (drift pressed to 0) | Computing the arrow and the insertion point positions separately is bound to misalign; an in-line zero-width anchor lets the browser's layout do the calculation for you |
| A gathering | From 98f, 28f smooth to the onlooker positions around the card (not covering the title or eyebrow), drift amplitude decaying to 25% retained | Drift must not go to zero after the gathering — a completely still cursor group reads as a crash |

## Known pitfalls
- The demo was tuned on a hand-built picture (a porcelain-white whiteboard + sticky notes + briefing card, the board name carrying the video-shotcraft mark, title "Ship a launch film by Friday.") — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Name-tag colour = identity encoding, which must stay consistent across the whole film (blue = Designer means always blue); changing colour midway makes the audience think it is a different person
- When changing the title copy keep the character count and the number of spaces, so the typing rhythm (jitter per character is taken by index, extra pause on spaces) and the end frame do not change
- A drifting cursor must never cover the main content being read — the ambient layer must yield the scene, and the drift range should avoid the main subject's safe area
- Division of labour with cursor-flyover: that one is a cursor "operating the UI" (clicks carry a payload), this card's cursors are "performing for you" (the movement is the plot); when the cursor needs to click something, go back to that card
- Sound: one very light pop per cursor on entrance, quiet in the drift section, a soft keyboard in the typing section

## Reference implementation
demos/interaction/collab-cursor-moves/
(CursorCastEnsemble.tsx)
Original source: figma-devmode 0:05 + miro-promo whole film + pitch-app 82–90s typing cameo
