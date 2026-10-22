---
name: page-waterfall-wall
summary: Page waterfall wall - real page screenshots cut into 3-4 columns scroll endlessly in opposite directions at different speeds on a 3D reclined wall surface, with parallax + a slow camera push giving an overview of "so much content it never finishes flowing"
use_when: Segments about the volume of "many pages / many features / many templates"; the spread in the middle of a montage or a product-breadth shot after the intro
duration: 4-6s (an infinite loop body; the duration is cut to what the segment needs)
energy: Medium (flowing display type)
---

## Intent
A flowing overview: let the viewer "see many pages flow past" within a few seconds, with the read being volume rather than detail.
Division of labour with outro-group-photo-launch: that is a **gathering** overview (elements fly in to surround
the wordmark and freeze into a group photo, with the meaning "belongs to the same product"), while this card is a **flowing** overview (content flows
past continuously without freezing, with the meaning "there is still a lot we have not shown you").
Division of labour with wall-reveal-moves: that is the whole wall's **entrance action**, while this card is the wall's **ongoing state**,
and that card's entrance can hand over to this card to carry on flowing.

## Motion core
- The lib component `assets/lib/VerticalTicker.tsx`: the parent layer applies perspective(1000px)
  rotateX(20°) scale(1.2) to tilt back into a wall; each column doubles to [...items,...items] +
  progress modulo translateY 0→-50% for a seamless loop; top and bottom gradient masks finish the edges
- Differential reverse speeds are the crux of the parallax: the 3 columns' loop durations are offset (e.g. 12/9/14s), with the middle column reversed -
  same speed and same direction reads as one big picture scrolling, while differential reverse speeds read as "independent columns"
- The slow camera push is parasitic on the outer layer (scale 1→1.06 linear across the whole shot), the wall loops by itself
  and the camera moves one way; the two motion sources go different directions and do not fight
- Material: real page screenshot slices (after Q1 anonymisation); card-level cuts beat full-page long images -
  with full-page slices the viewer has no time to read while scrolling, whereas card blocks have complete outlines that are recognisable

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Column count | 3 (1080p) / 4 (ultra-wide) | 2 columns do not read as a "wall", and with 5 each column is too narrow and the texture smears |
| Loop duration | Adjacent columns differ by ≥25% (12/9/14s) | With too small a difference the parallax is unreadable; a fastest column <7s starts to read as "screen flooding" |
| Direction | Middle column reversed (-1,1,-1 or alternating) | All the same direction = one big picture; reversed columns are the strongest evidence of "independent columns" |
| Tilt / perspective | rotateX 20° / perspective 1000px | >25° and the text in the top rows is squashed and smeared by perspective (Q2); <12° does not read as the wall leaning back |
| scale | 1.2 base + slow push to ~1.26 | 1.2 is the base value compensating for perspective shrinkage, and below it the four corners show the background; the demo puts the enlargement and the slow push on an outer CSS zoom (layout-level scaling), so the slice text is not enlarged and softened (Q2) |
| Mask height | 200px | Too short and rows enter and exit hard; too tall and fewer than 2 rows remain in the visible area |
| Loop period | The -50% displacement must be exactly equal to a single copy's period (content height + n·gap) | The lib already guarantees this with marginBottom; a self-written implementation using flex gap would skip a frame by gap/2 |

## Known pitfalls
- **The parameters are borrowed from an external implementation (remotion-3d-ticker), not battle-proven final values;
  the first real use must re-verify them against real material**
- Each column's total item height must be ≥ the viewport's effective height (otherwise the same slice is seen twice on screen, breaking the illusion);
  do not reuse the same image across columns, as the same image appearing in two columns at once reads as running short of material
- This card is an atmosphere/spread shot, not an information shot: the text on the slices only needs to "look like real pages",
  not to be read through; to have viewers read a particular block, hand over to spotlight-hero-card for a single-protagonist treatment
- P4 de-duplication: coexisting with the outro group photo in the same film is fine (one flows, one gathers), but the waterfall wall
  appears only once in the whole film, and a second appearance reads as padding the running time

## Reference implementation
assets/lib/VerticalTicker.tsx (core component);
for the demo see demos/ui-entrance/page-waterfall-wall/ (PageWaterfallWall.tsx / VerticalTicker.tsx).
