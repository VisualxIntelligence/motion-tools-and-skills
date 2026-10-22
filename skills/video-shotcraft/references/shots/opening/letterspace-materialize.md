---
name: letterspace-materialize
summary: Wide-tracked wordmark crystallises through continuous all-character parallel drawing — every letter starts its stroke on the same frame, strokes grow continuously like handwriting, and all finish together on the same frame into the word; a brand wordmark developing over an atmospheric backdrop
use_when: Brand wordmark entrance for the outro / opening (a wide-tracked thin skeleton wordmark; the demo is video-shotcraft in all lowercase); chapter titling; closing frames that need a serene / premium feel
duration: rest ~15f + drawing ~50f + final-state rest ≥30f; whole section 3–4s
energy: Low (a serene sense of ceremony, completed in a single breath)
tags: typography, outro
---

## Intent
The wordmark is neither a fade-in nor a typewriter but a "crystallisation": the strokes of all the letters begin
growing continuously at the same time, like an invisible hand writing every letter at once, and they close together in the same instant
into the word. Two crux points: **continuity** (the strokes must be a continuously drawn process, with no mask
segmentation — doing half first and the other half after gets seen through; any intermediate frame should look like "half written");
**synchrony** (all letters start on the same frame and finish on the same frame — per-letter stagger carries typewriter semantics,
while here it is the ceremony of the whole word as one).

## Motion core
- Each character uses a skeleton-stroke SVG path (single-line glyph), with pathLength normalised +
  strokeDashoffset drawing continuously from 1→0
- All characters share the same progress p: starting on the same frame, and pathLength normalisation guarantees that letters with strokes of different
  lengths finish together on the same frame (no per-char delay/jitter)
- Glyph proportions: squarish and slightly wide (glyph width-to-height ratio ≈1.07; measured precedent: tall, narrow glyphs
  were judged "too tall and narrow"); thin strokes + wide tracking (letterSpacing ≈0.6em). The demo wordmark is
  video-shotcraft (brand guidelines require all lowercase): geometric lowercase monoline, bowls are true circles,
  in a 64-high viewbox the baseline is 59 / x-height 22 / ascender 5, scaled up ×1.3 overall with stroke scaled inversely to keep 5.5px
- Drawing curve: overall ease-in-out, slightly faster in the middle and slightly slower at the ends (the feel of putting pen down and lifting it)
- Backdrop: an atmospheric gradient / live-action empty shot (dusk mountain scenery and the like); the wordmark is the only motion in the frame

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Drawing duration | ~50f (starts f16, ends f68 @30fps) | <30f and the process of "drawing" cannot be read; >80f drags |
| Synchrony | All characters start and end on the same frame, zero stagger | Precedent: the per-letter staggered version was judged "all the letters should finish being written at the same time" |
| Continuity | pathLength grows continuously, no segment jumps | Precedent: the mask-segmented version was judged "it should be continuous strokes being drawn" |
| Glyph shape | Skeleton monoline, glyph width-to-height ratio ~1.07, thin strokes | Tall and narrow (ratio <0.8) was rejected; thick strokes lose the crystallisation feel |
| Tracking | ~0.6em | Wide tracking is the identity of this card; at <0.3em use an ordinary draw-on card instead |
| Final-state rest | ≥30f | After the crystallisation completes, the audience must get one read of the whole word |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Division of labour with draw-svg-trace: that card is general draw-on (icons/illustrations/single elements);
  the crux of this card is the whole-word crystallisation ceremony with **all characters in sync**, and it is limited to a brand-wordmark context
- Division of labour with type-assembly-moves: that card is text-block assembly (displacement and joining);
  here the strokes grow from nothing, and the characters do not move
- The skeleton glyphs need hand-drawn paths (ready-made font outlines are double-line contours, which look different when drawn on);
  the demo's 13 lowercase glyphs (v i d e o - s h t c r a f) each carry their own width w,
  so in real use prefer reusing the glyph library in the demo; letters with multiple sub-strokes (the dot of i, the crossbars of t/f) are placed
  at the end of the path in drawing order, and after pathLength normalisation they still finish together on the same frame
- The backdrop of the original film (superhuman-promo) is live-action dusk mountain scenery + water reflection; the demo uses a
  gradient approximation, and for real use live-action / AI-generated empty shots are recommended

## Reference implementation
demos/opening/letterspace-materialize/
(LetterspaceMaterialize.tsx)
Original source: superhuman-promo.mp4 ≈4.5–6.5s
