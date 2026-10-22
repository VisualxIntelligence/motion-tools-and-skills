---
name: doc-park-left-pill-deal
summary: The document does not fade out but slides left, showing only about 35% of its width and shrinking slightly to 0.92; on the right, three white outlined pills are dealt slowly at the narration's pace (popping in with outBack); after each one lands, the caption beneath it deepens word by word, and the whole sentence fades before the next arrives; the document on the left auto-scrolls extremely slowly throughout to keep up the "being read" feel
use_when: Narration-driven segments where "analysis conclusions are given one by one"; the core explanatory shot for document understanding, recommendation reasons and review comment products
duration: about 5.8s (174f@30fps)
energy: Low (slow dealing rhythm, no peaks across the film; liveliness is kept up by the auto-scroll)
---

## Intent
Conclusions have to be given one at a time for viewers to remember them. But if the source document is faded out, the conclusions become castles in the air - viewers
do not know where these words come from. This card's solution is to **keep the source in the frame**: the document stays parked on the left showing only a strip, still
scrolling slowly (showing it is being read), and each conclusion on the right grows out of this document. The dealing rhythm is deliberately slow,
to leave the narration time to finish a sentence.

## Motion core
- Parking is not a fade-out: `seg(t, 0.06, 0.24, E.inOutCubic)` drives
  `translateX(0→-55%) scale(1→0.92)`, with `transform-origin: 0% 50%` anchoring the scale at the left edge,
  so the document does not leave the left side of the frame as it shrinks - ultimately only about 35% of its width shows
- Permanent auto-scroll: `translateY(-t * 120)` is continuous and constant-speed (≈0.7px/f), and the content is more than 140px longer than the container.
  The old form `-(t*3 % 1) * 40` used modulo, and with non-periodic content the whole page jumped back 40px every 1/3 of the film length, visible to the naked eye, so it is deprecated
- Slow dealing: the three pills' start points are hard-coded as `T0 = [0.26, 0.48, 0.70]` - an interval of 0.22 (about 38f / 1.27s),
  which is the length of a short narration sentence, not a conventional UI stagger
- Each pill has two curves in parallel: `o = seg(t, f, f+0.035, E.outQuad)` governs opacity (fast, about 6f),
  and `b = seg(t, f, f+0.062, E.outBack)` governs `translateY(14→0) scale(0.94→1)` (slow, about 11f
  with overshoot) - seen first, then settled, which has a better "caught" feel than a single curve
- Caption in four stages: the start is `cs = f+0.05` (about 3 frames after the pill settles), `show` appears quickly with a 0.02 window,
  `inn` word-by-word deepening is spread over `(ce-cs)*0.7`, `ce` is the next card's start minus 0.03 (for the last card ce=0.98),
  and `out` fades out over `ce-0.05→ce` - every caption has cleared the stage before the next pill enters, so the screen only ever has one sentence
- The pills' end state is a static list (`top = 54 + k*48`); once all three are in place they stay on screen, reading as
  "the conclusion list has taken shape"
- Evidence linkage: after each pill settles, the corresponding evidence sentence in the document is swept by a highlighter from left to right (f+0.06→0.13),
  and a thin accent-colour line connects from the end of that sentence's line to the pill's left edge (f+0.04→0.11 draw-on), fading out as that sentence's caption exits

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Deal start points | `T0 = [0.26, 0.48, 0.70]`, interval 0.22 (≈38f) | The interval is the narration sentence length; compressed below 0.12, the caption's "word-by-word deepening" cannot finish, and reads as the caption flashing and gone |
| Park window | 0.06→0.24 (inOutCubic) | Must finish before the first pill (0.26); overlap gives a muddy "the document is still sliding while the pills are already being dealt" |
| Park amplitude | `translateX -55%` + `scale 0.92`, showing about 35% | Showing too little (<25%) turns the document into decoration and loses the "source" meaning; showing too much leaves no room on the right for the 172px-wide pills |
| Pill opacity window | 0.035 (≈6f, outQuad) | Shorter than the displacement window on purpose - solid first, steady after; with two windows of equal length it reads as an ordinary fade-in |
| Pill displacement window | 0.062 (≈11f, outBack), y 14→0, scale 0.94→1 | The overshoot of outBack is the "card dealt onto the table" feel; swapping in outCubic becomes a flat float-up |
| Caption delay | `cs = f + 0.05` (≈9f) | The caption starts only after the pill settles (0.062); starting earlier makes the caption appear before the conclusion |
| Caption deepening travel | `(ce-cs)*0.7` | Takes 70% of the sentence's visible duration, and the last 30% is resting reading time at full opacity; at 1.0 the caption is faded out as soon as it has been read |
| Auto-scroll | `-t × 120px` continuous constant speed | About 0.7px/f over 5.8s, a hint-level speed of "being read"; >3px/f steals attention and turns into a scrolling showcase |

## Known pitfalls
- The auto-scroll is continuous displacement rather than a modulo loop (modulo does not jump back only when the content itself is strictly periodic); when changing the duration or
  travel, make sure the document content is longer than the container by at least the whole travel, otherwise the last segment scrolls out blank
- The last caption's `ce = 0.98` means it fades out from 0.93→0.98, and the last frame has only the three pills and no caption. To
  keep the last sentence to the end, change the last card's `ce` to >1 and remove out
- The pill position is hard-coded as `left:214px, top:54+k*48`, width 172px, a set of numbers that matches the parked document
  (about 87px exposed) on a 480-wide canvas. Changing the document's park amplitude means changing PX in step, otherwise the two overlap
- The three pill texts (in the demo, the three shot cards recommended by the video-shotcraft promo film brief: Crash Zoom / Deck Deal / Logo Sting) and the three captions are illustrative, and the caption
  length directly affects how fast the "word-by-word deepening" reads - after swapping in real copy, re-tune the `inn` travel to the new sentence lengths
- The number of pills is hard-coded to 3 (the length of `T0`). Going to 4 runs out of time: the last card's start would exceed 0.9, and the caption
  could not finish at all; with 4 or more, consider shortening the individual sentences rather than cramming
- The caption's `ce` depends on `T0[k+1]`, so changing any card's start point changes the previous card's caption visible duration along with it - this
  linkage is intentional (the caption always fills up to just before the next card), but when tuning be aware that it is not an independent parameter

## Reference implementation
demos/ui-entrance/doc-park-left-pill-deal/
(DocParkLeftPillDeal.tsx)
