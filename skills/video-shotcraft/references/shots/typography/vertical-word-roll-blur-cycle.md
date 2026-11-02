---
name: vertical-word-roll-blur-cycle
summary: The word at the end of the sentence is replaced by a vertical roller, with 3 word changes of 0.55s each (70% outQuint + 30% outBack, fast first then extremely slow with a slight overshoot), adjacent rows getting vertical blur and greyscale by distance, and the centre word turning from grey to the accent colour at the instant it settles
use_when: One-line selling points of the "Crafted for ___" / "Built for ___" kind, a sentence stem + a list of audiences / targets; a clean beat in a light-ground brand film
duration: about 5.0s (150f@30fps: rest → 3 word changes → the whole group fades out at the tail)
energy: Medium (a steady three beats, no peak)
---

## Intent
The best solution for changing the word at the end of a sentence is a roller rather than a fade in and out: a roller carries a **direction** of its own (turning a page upward),
and the audience knows "there is a next one". The two identity markers of this card are the **vertical blur** of adjacent rows
(roller depth of field, simulating the defocus of a mechanical drum) and the **colouring** at settling (grey → accent colour,
"this is the answer"). The sentence stem (demo `Crafted for`) stays absolutely still throughout — the eyes are pinned on the roller,
and if the stem so much as wobbles the listing feel falls apart.

## Motion core
- The position quantity `p` is accumulated from 3 windows: `STEPS = [0.16, 0.36, 0.56]`, each window 0.11
  (≈16f, about 0.55s), with 0.09 of rest between segments for the audience to read the word
- Each segment's easing is a **blended curve**: `0.7·E.outQuint(u) + 0.3·E.outBack(u)` —
  outQuint gives the mechanical deceleration of "fast first, extremely slow after", and the 30% outBack gives a slight overshoot and fall-back on settling
- Reel positioning `translateY(ROW - p·ROW)`, ROW=44px, mask height `ROW·3`=132px
  (three rows showing) — the centre row is always the second row of the mask
- Three distance-driven channels, `d = |i - p|`:
  - blur: `3d` when `d<1`, `3 + 2·min(d-1,1)` when `d≥1` (5px at the farthest); the demo uses SVG
    `feGaussianBlur stdDeviation="0 b"` to blur only vertically, and while turning it adds ≤4px of vertical motion blur by roller speed (0 when still)
  - opacity: `1 - 0.65d` when `d<1`, otherwise `max(0.1, 0.35 - 0.23(d-1))`
  - colour: `mixHex(ACCENT_DIM, ACCENT, clamp01(1 - 2.4d))` — **at d>0.42 it is already fully
    the dim colour**, so only the moment of genuine settling is the accent colour, and it is grey all the way through mid-scroll
- Ending `seg(t, 0.9, 0.985)` fades out the whole group (stem + roller), leaving no afterimage for the next shot

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Word list | 4 words (Launches→Demos→Promos→Every Shot), 3 word changes | The last word is the conclusion (the widest word), the first three are examples; >5 words and the audience starts counting, <3 words and "listing" cannot be read |
| Beat points | `[0.16, 0.36, 0.56]`, window 0.11 (≈16f) | The 0.09 (≈13f) of rest between segments is for reading the word, and a beat that cannot be finished reading is the same as no change; a window >0.18 leaves the new and old on screen together too long |
| Easing recipe | `0.7·outQuint + 0.3·outBack` | outQuint is the source of the mechanical deceleration; the 30% outBack gives the settling a "click", and pure outQuint reads as an electronic screen sliding |
| Row height / viewport | ROW 44px, mask `44×3`px, word width 190px | Showing three rows is what gives the drum feel (showing one row reads as a fade in and out); the hard-coded width of 190 is so as not to crowd the stem, and longer words need it increased in step |
| Adjacent-row blur | 3px for neighbouring rows, 5px at the farthest, **perceived in the vertical direction only** | Blur is the identity card of "roller depth of field"; delete it and it degrades into word-strip translation; >8px and the neighbouring rows smear into grey bars where you cannot see they are text |
| Settling colouring | `1 - 2.4d` mapping ACCENT_DIM→ACCENT | A coefficient of 2.4 makes the colouring happen only at the instant of settling; <1.5 and it colours mid-scroll, dispersing the sense of an answer |
| Font size and weight | stem and roller both 30px/800, `letter-spacing:-.5px` | Must be exactly the same — a roller word larger than the stem reads as two elements, not one sentence |
| Ending fade-out | `seg(t, 0.9, 0.985)` whole group | Rest about 40f after the last word settles and then fade out; not holding is the same as listing for nothing |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **The mask width is hard-coded at 190px**: when swapping the word list the longest word (demo `Every Shot`; a phrase with a space needs `white-space: nowrap`) must fit in,
  otherwise the text is cropped; conversely if the words are all very short, a large blank is left on the right and the sentence's centre of gravity leans left — when swapping the word list
  re-measure the width once
- The word-length difference should not be too large: the mask width is fixed (this card does not do width adaptation, that is the job of
  pill-chip-slot-cycle-handled), and with a word-length difference >2x short words look isolated in the frame
- The stem must be pinned: the demo uses `flex + gap:14px` because the constant mask width does not push the
  stem around — once changed to a width-adaptive roller, it must be switched to absolute positioning anchored at the left end,
  otherwise the stem swings left and right with the word width
- `p` is **accumulated** from the three windows, so the three windows must not overlap: overlap makes p
  cross a whole row within a single frame, and the roller "skips a notch"
- Division of labour with pill-chip-slot-cycle-handled: that card is a dark capsule + width-adaptive push-apart
  (the word is a badge), this card is a bare-word roller (the word is a sentence component) — keep only one in the same film
- Sound: each settling is a rhythm point, so pair it with a light mechanical / switch sound; three rapid fires need twin samples alternating
  to avoid a machine-gun feel, and for the scoring discipline see sound-design.md

## Reference implementation
demos/typography/vertical-word-roll-blur-cycle/
(VerticalWordRollBlurCycle.tsx)
