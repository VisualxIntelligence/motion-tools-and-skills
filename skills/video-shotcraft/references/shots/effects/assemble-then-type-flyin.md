---
name: assemble-then-type-flyin
summary: On an empty dark grid, text-free component skeletons fly in from all directions and snap into place; then text flies in character by character, rotating in 3D space, headline first and small annotations last, and the page takes shape once everything has landed
use_when: Openers where a page/poster "grows itself"; capability showcases for layout products; two-stage storytelling from skeleton to finished layout
duration: about 5.6s (168f@30fps)
energy: Medium-high (sparse skeleton stage, dense text stage; energy rises monotonically to the close)
---

## Intent
Split "page generation" into two clearly distinct stages: first set up the skeleton (frames, cards, dividers,
colour blocks, all without text), then fill in the text. The text uses per-character 3D rotation because the skeleton stage
only has flat translation: the two stages must differ in motion dimension, otherwise the viewer cannot read "this is the second step".

## Motion core
- Once assembled, the demo is video-shotcraft's dark launch page (graphite look, film-gold accent2 is the only accent colour; the nav bar is the mirror-engraved logo +
  video-shotcraft wordmark, the headline is the brand line "Frame motion. / Craft the shot."),
  in native 1920×1080 coordinates; frame 1 opens with 12-column layout guides, which fade out once the skeleton is complete
- 10 skeleton pieces (nav bar, colour-grading panel card + film-frame colour block, mirror-engraved logo, three colour-wheel rings, divider, CTA, secondary button, three metric blocks)
  fly in at take-off frames 6/10/15/19/23/27/31/35/39/44 in turn; each piece takes 16f of `EASE.overshoot` to snap into place,
  with a `from` offset of 120–420px + ±7° rotation (rotation converges 4f later)
- While the skeleton moves, directional motion blur is applied at the real speed (px/frame) (`SpeedBlur` ×0.32, capped at 18px), and is 0 when still
- The 19 text blocks start one after another at start frames 58→114: the 112px serif headline goes first (58/66),
  then the nav, eyebrow, description line and button text (76–95), the metric figures (96–102), and finally the mono small annotations (104–114)
- Per-character 3D: each character holds a deterministic seeded random set of
  `dx ±260px / dy ±200px / dz −200→−760 / rotateX ±170° / rotateY ±190° /
  rotateZ ±120°`, run through `perspective(900px) translate3d + rotateX/Y/Z`,
  with each character landing over 16f of `EASE.snappy`; in flight, depth-of-field blur is applied by distance from the focal plane, and at `a>=1` the transform is set straight to `none`
- Character spacing within a block adapts: `step = clamp((128 − start − 16)/character count, 0.35, 1.6)` frames
  — this guarantees that however long the block is, it finishes landing before f128, leaving 40f at the tail of a still, breathing page (1.5% very slow push-in)
- The "finalising" stroke after settling: the CTA goes from outline to a gold solid fill as if powered on (118–132), the film frame is wiped by a gold vertical line
  from the log-grey plate to the warm-graded finished image (124–146), and the three colour-wheel control points are pushed in sync from the neutral position to the tinted position
- All randomness comes from `rand(i) = frac(sin(i*127.1 + 311.7) * 43758.5453)`,
  deterministic and seekable

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Skeleton timing | 10 pieces, take-off frames 6→44 (4–5f apart) | The skeleton stage takes the first 30%; compressed into 20f it smears together with the text stage |
| Skeleton fly-in | overshoot, 16f, offset 120–420px + ±7° | Same technique as `scanline-assemble-flyin`; with the scan line removed, the order is read from the timing |
| Skeleton afterimage | Directional motion blur, speed ×0.32, capped at 18px | Appears only in fast sections; permanent blur reads as out of focus |
| Break between the two stages | Skeleton complete (f50) → text starts (f58), 8f gap, guides fade out over the same period | Without this half-beat the viewer cannot read "this is the second step" |
| Text start points | Headline 58/66, small annotations 104→114 | Big text landing first is a legibility requirement: if small text lands first the viewer goes to read the small text |
| Per-character displacement | dx ±260 / dy ±200 / dz −200→−760 | dz is the main driver of "coming from far away"; with only dx/dy it becomes a flat scatter-in |
| Per-character rotation | rotateX/Y/Z each ±120°–190° | Only large angles give the "tumbling in" feel; ±30° just looks like jitter |
| perspective | 900px (written into each character's own transform) | 600px on 112px text distorts too much; above 1400px the 3D feel is basically gone |
| Character interval | clamp((128−start−16)/n, 0.35, 1.6) frames | The 1.6f cap is the lower-bound speed for characters to remain distinguishable |
| Reset on landing | a>=1 → transform:'none' | Without the reset 19 blocks' compositing layers remain, and long films drop frames |

## Known pitfalls
- Character spans stay in normal layout flow (`display:inline-block`) and the animation only moves transform;
  do not position characters individually with absolute positioning, or changing the copy throws everything off
- Space characters must be explicitly replaced with a non-breaking space (the code uses `ch === ' ' ? ' ' : ch`),
  otherwise an empty inline-block span collapses to zero width and the word spacing disappears
- `start` is 19 hand-written values; when the copy changes (especially when the character count changes a lot) re-check
  whether the last block still finishes landing before f128; `step` only guarantees this within a block, not between blocks
- The content is video-shotcraft's sample launch page (headline / metrics / colour-wheel annotations); replace it with the project's own when adopting it;
  GOLD (graphite's accent2 `#e4c58a`) is the accent-colour slot, and the CTA text colour changes from gold to dark as it powers on, so change both together
- The difference from `scanline-assemble-flyin` is that there is **no scan line**: that card
  explains order through the scan line, this one explains order through the two-stage "skeleton first, then text"; do not mix the two

## Reference implementation
demos/effects/assemble-then-type-flyin/
(AssembleThenTypeFlyin.tsx)
