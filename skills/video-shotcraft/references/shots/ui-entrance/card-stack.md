---
name: card-stack
summary: A set of template cards (9 in the demo) spring in one by one from below the screen, landing faster and faster into a pile; once all are in place the whole pile fans out in one go - each card turned 6.5° and shifted 138px sideways according to its index - and finally the centre card is pulled out
use_when: Product segments that need to establish "we have a set of things"; establishing shots for card walls / template libraries / plan lists, and can also serve as a beat of anticipation before a logo
duration: about 5.0s (150f@30fps)
energy: Medium-high (the entrance is a run of small bursts, and the fan-out section resolves into one smooth whole-body motion)
---

## Intent
A pile of cards first gathers into one object, then spreads out into a set of objects - the order is crucial: give the "whole" first, then the "individuals".
What viewers remember at first glance is a weighty pile (a sense of quantity), and only at second glance do they see that each card is different (variety).
The fan-out is held back to the end and done in one go so that it does not fight with the entrance's beat.

## Motion core
(demo version: porcelain-white template library launch - the video-shotcraft shot recipe library, 9 shot / template cards of 320×440, 1920×1080 native coordinates)
- Two layers of motion are separated and superimposed: the entrance (each card's own spring) and the fan (one deployment progress shared by all),
  and the final transform is a composite of the components each layer computes inside `translate3d(tx, y, tz) rotate(rot)`
- Entrance: launch frame `2 + stagger(i, 9, 40, EASE.out)` - the EASE.out mapping makes the intervals large first then small (bang - bang - bang-bang-bang, faster and faster);
  each card uses `springAt(f, start, {damping:13, stiffness:150})`, with `y` lifted from 820px to 0 (the start is outside the frame), settling in about 20f;
  in flight it carries an alternating ±9° tilt that converges as it settles, and motion blur is added by vertical velocity (≤10px)
- Weight: each time a card settles (it crosses its end point about 6f after launch) the whole pile is pressed down 5px (sin envelope, 9f); once piled it gets a deterministic ±3.2° / ±11px offset,
  like a pile casually squared up by hand; before the fan-out, from 62-72f, the whole pile tightens by 2% (anticipation)
- Fan: `springAt(f, 68, {damping:20, stiffness:95})` is the only deployment clock (with one slight overshoot = the inertia of a flick of the wrist),
  end state `k = i-4`, `rot = k*6.5°`, `tx = k*138px`; `transform-origin: 50% 130%` puts the rotation axis below the lower edge of the card -
  the fan's handle is in the hand, and the cards turn open around the wrist
- Stacking order = index (`zIndex = i`, left over right, like a hand of cards fanned out), unchanged throughout - when piled the top card is the last one,
  so there is no top-card jump when fanning
- Camera: during the pile phase a very slow push-in from 1→1.06 gives the "pile" weight, and during the fan-out segment (64→106f) it pulls out to 0.88 so the full fan fits in frame;
  the ground contact shadow widens from 220 to 760 along with the fan
- Ending: the centre card (a solid cobalt-blue cover: the brand mark in reversed-out white + "Launch", card name Launch film) is pulled out 72px along its own axis (overshoot) + a 3px cobalt outline + one sweep of light (Q4),
  the title "Start from a shot recipe." (88px) rises word by word with the subtitle following, hold 28f

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Card count | N=9 (odd, so the centre card holds the middle alone) | 9 cards × 6.5° = 52° total spread is the comfortable limit; with >11 cards, reduce each card's angle to 4-5°, otherwise the cards at both ends fly out of frame |
| Entrance stagger | 40f span, EASE.out distribution | Getting faster and faster gives the feel of "a string"; an arithmetic distribution reads as calling cards out one by one, and <20f reads as a clump popping up together |
| Entrance travel | y 820→0, spring damping 13 | The start must be outside the frame; with damping <10 it rebounds more than twice and the jitter interferes with itself as the group forms |
| Settle press-down | 5px, sin 9f | This is the source of "having weight"; >10px and the whole pile looks like a trampoline |
| Fan spring | damping 20 / stiffness 95 | One slight overshoot is like a flick of the wrist; with damping >26 there is no overshoot and it reads as a mechanical fan-out, and <16 the fan swings back and forth |
| Fan angle | `k*6.5°`, shift `k*138px` | Angle and shift must be tuned in proportion: adding angle without shift makes the cards interpenetrate |
| Depth | `tz = i*2`, perspective 1800px | Only a hint of stacking; depth mainly comes from stacking order + two layers of soft shadow |
| Rotation axis | `transform-origin: 50% 130%` | 130% decides how far the "fan handle" is from the cards; changing to 50% 50% instantly degrades into a pinwheel-style scatter |
| Card pull-out | 72px overshoot + outline + sweep of light | Give it to the centre card only, once; a pull-out <40px does not read as "selected", and >120px has the card fighting the title |

## Known pitfalls
- The two time windows join exactly end to start: the last card launches at 42f and settles at about 62f, anticipation at 62f, fan-out at 68f.
  Adding cards or increasing the stagger lets the entrance eat into the fan-out segment, giving a muddy "starts turning while still flying" - adding cards must
  push the anticipation and fan-out start points later too
- With an even number of cards `k` takes half-integer values (±0.5, ±1.5...), there is no centre card, and the ending "pull out the star" lands off to one side;
  the demo uses 9 cards. If you switch to a "middle on top, sides below" zIndex, note that the top card will jump from pile to fan
- The 320×440 card is centred with `left = CX-CW/2, top = CY-CH/2`, and the fan handle position changes with CH; when changing size, also check
  whether the cards at both ends leave the safe margin (at camera 0.88 the outermost card corner is about 100px from the frame edge)
- The card faces are hand-built template cover placeholders (generated cover image + title + mono metadata); in production replace them with real page slices;
  the covers use only light tints of cobalt / teal / ink, and only the centre card is solid cobalt - real material should also keep one "protagonist" card
- During the fan-out segment (64→106f) the camera pulls out to 0.88 to keep the cards at both ends in frame; to connect to the next shot you can cut after the pull-out settles (about 120f), and do not let the fan sit idle for too long

## Reference implementation
demos/ui-entrance/card-stack/
(CardStack.tsx)
