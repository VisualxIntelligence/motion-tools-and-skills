---
name: word-relay-filmstrip
summary: A left column of equal-height page cards alternating black and white scrolls in steps (the focus card fully lit, neighbouring cards defocused and dimmed), while a large serif word on the right relays in place (constant noun + rotating verb) — it scrolls one notch only at the instant of a word change, with the word block's vertical centre aligned exactly to the midpoint of the current page card
use_when: Enumeration passages of "one subject × many capabilities" (Shotcraft frames/builds/ships…); portfolio / case-flow displays; a multi-scene tour of a product
duration: each word period ~1.5–2s × 3–4 words; demo 180f (6s)
energy: Medium-low (an editorial-desk temperament, with the rhythm coming from the "click" of the word change)
tags: ui-entrance
---

## Intent
The left is evidence (a film strip of page screenshots) and the right is the argument (the big word): each time the verb changes,
the strip steps one notch to give new evidence — text and picture footnoting each other. The crux is **stepping**:
the left column is completely still most of the time, and scrolls one notch only at the instant of a word change (scrolling = the mechanical action of changing evidence);
continuous scrolling reduces the left column to background decoration and the word change loses its "click". The second crux is
**alignment**: the vertical centre of the big word block must be aligned exactly (to the pixel) to the midpoint of the current page card,
and if it is off the whole layout's "editorial rigour" collapses.

## Motion core
- Stage: a graphite near-monochrome dark field + gold accents; left column: equal-height page cards (940×530, spacing 105) laid out vertically,
  with black and white (dark and light) forced to alternate to show the scroll stepping; within the word-change window an 18f asymmetric in-out (EASE.swift) scrolls exactly one card height,
  with zero displacement the rest of the time, and vertical motion blur layered on the fast segment
- Depth of field: by distance from the focus point `dist = |card top - 275| / 635`, neighbouring cards are dimmed by `0.68·dist`, scaled to 0.94 and blurred ≤3px —
  as it steps, the new evidence "comes into focus"
- Right side: serif (Didot class, 140px) in two lines — the subject noun "Shotcraft" in upright secondary ink, constant, and the verb in italic white relaying in place:
  the old word greys out over 10f → from the cut point rises out over the top edge of the mask with an 8f ease-in (leaving first), and the new word, from cut point +7f, rises letter by letter from the bottom edge of the mask
  (1.2f stagger, the gold full stop arriving last, entering after), leaving first and entering after must not produce a ghost overlap (precedent: v2 ghost overlap "resebuilds" was caught)
- Gold leader line: from the right edge of the focus card pointing to the word block's centreline y=540, retracted over 6f from the word change, redrawn over 16f after cut point +10f;
  the mono index 01/03 above the word block and the 32px evidence footnote below relay in sync with the verb
- Alignment: each of the word block's two lines is a 154px line box, `top = 540 - 154`, with the total-height centre = current card top + half card height = y540@1080p
  (accurate to the single pixel)
- Scrolling in sync with the word change: scroll start = the old word starting to grey, scroll end = the new word settling

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Page cards | equal height (530px@1080p), alternating black and white, about half the screen width | Unequal heights / the same colour family cannot read the stepping; cards that are too narrow lose the weight of "evidence" |
| Word period | ~45–60f/word | <40f and the word cannot be read + the strip cannot be seen clearly; the word periods need not be even |
| Scroll window | ~16–18f asymmetric in-out, exactly one card height | Continuous scrolling = a violation of the crux; overshooting / undershooting reads as a mechanical fault |
| Word relay | after the old word greys, rises out over 8f → from cut point +7f the new word rises letter by letter (16f/letter, 1.2f stagger) | Crossing in the same frame is bound to produce a ghost overlap; a gap >10f reads as a dropped beat |
| Vertical alignment | word block centre = current card midpoint (pixel-level) | The user's single-point feedback "the text height should be aligned with the midpoint of the page in the middle"; a difference >8px is perceptible |
| Typeface | serif Didot class, verb in italic white / noun in upright secondary ink | A sans-serif loses the "editorial" temperament; the verb must be brighter than the noun, as it is the one that changes |
| Neighbouring-card defocus | dimmed 0.68·dist, scaled 6%, blurred ≤3px | Without dimming, the neighbouring cards fight the focus card for the scene; blur >5px and you cannot tell they are pages |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Division of labour with text-column-converge: that one is a reveal drama of left-right confrontation and closing together;
  this card is a vertical evidence flow + in-place relay, with no closing together and no reveal
- Division of labour with pill-slot-cycle: that one is a capsule-slot rotating UI element;
  this card is a layout-level system of text-picture alignment
- Real-use material: the page cards should use real screenshots (the demo uses hand-built fake pages — storyboard script / render pipeline / finished-film PR review, with each verb stopping on
  its corresponding evidence card, the residual gap being known); screenshot brightness must be graded by hand to ensure the alternation stays readable

## Reference implementation
demos/typography/word-relay-filmstrip/
(WordRelayFilmstrip.tsx)
Original source: perplexity-promo.mp4 ≈76–90s
