---
name: product-card-progressive-assemble
summary: A detail card builds itself as if its fields were being scraped one by one - a "fill cursor" leaps ahead from box to box, with image → title → category pill popping in turn → the original price appears and is then struck through and demoted, the accent-colour new price springing out → the body text is revealed line by line with a highlight block sweeping from left to right → the swatches light up → the button fills; the whole card pushes forward with a very slow scale throughout
use_when: Capability showcases of product / entry detail pages; the main shot of "structured extraction", "auto-fill" and "data grows by itself" narratives
duration: about 5.7s (172f@30fps)
energy: Medium (small events densely laid out in succession, no single-point burst; the forward push keeps the sense of progress)
---

## Intent
If a detail card simply fades in, the viewer only sees "there is a card". Placing it field by field turns the card into a **form being filled in**:
each field arrives on its own, and the viewer's attention is led once through the card's information structure - where the image is, where the title is,
where the price is, where the body's key points are. The price strike-through demotion is the only semantic event in the whole film (not "appearing" but "changing"),
so it is scheduled in the most prominent position in the middle.

## Motion core
(demo: porcelain-white look, native 1920 coordinates; the 1520×840 detail card takes 79% of the frame width, and the product is video-shotcraft itself: the mark sits in the studio shot, and the title Shotcraft, its selling points and swatches are all its own)
- The field schedule uses 30fps frame numbers directly: cursor arrival at image 8 / title 20 / pill 30 / price 42 / body 76 / swatches 96 / button 114,
  with fields starting to settle 2f after the cursor arrives; the interval within a group is 3f (pills, body lines, swatches), and between groups 10-20f - the density of the intervals is the grouping of the information
- Fill cursor: a cobalt 2.5px outlined box + a 6px soft outer glow + a small AUTOFILL tag, interpolating position and width/height between two adjacent field boxes with asymmetric in-out
  (`cubic-bezier(.4,0,.2,1)`, 6f); finally tucked into the button (ease-in 8f fade-out). This is the only light effect in the whole film
- Skeleton slots: before a field settles, the slot holds a light-grey skeleton bar, which fades out with progress as the field lands - "the form is being filled", not "elements are appearing"
- Two kinds of settling: `rise` (moving up 10-26px + 6px→0 defocus fade-in, expo-out 14f) for the image/title/price/body; `pop`
  (physical spring damping 13, scale 0.4→1 with one visible overshoot) for pills and swatches; small items pop, large items rise
- Price demotion at f62 ($449 fully settled, then hold 18f): within 6f, in the same window, "scale 1→0.46 + greyed out + a 9px strikethrough drawn across from the left",
  and from f63 the cobalt new price Free (Apache-2.0 open source) springs (damping 14) from 1.18 down to 1, with the OPEN SOURCE chip sliding in at f69
- Marker highlight: a cobalt 16% base block `scaleX 0→1` (origin left), starting at f86 / f90 for 6f each - faster than the fields settling, reading as "the pen swept across"
- Button: the ink-black base fills from left to right over 12f from f116, and the label fades in at f122
- Whole-card breathing: `scale 1→1.035` (asymmetric in-out) spread over 0-132f; entrance 0-14f scale .96→1 + moving up 30px; the last 40f hold still

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Field schedule | Cursor 8/20/30/42/76/96/114, settle +2f | 3 frames between fields of the same kind, 10-20 frames between kinds; changing everything to equal intervals reads as mechanical roll-calling |
| Cursor jump | 6f, swift in-out, box shape morphing in sync | <4f reads as a flash; >10f and the cursor drags behind the field, turning "leading the grab" into "boxing it after the fact" |
| Single-field travel | 14f expo-out | A travel far longer than the in-group interval → several fields in a group move at once, and the picture "surges" rather than "taps" |
| rise displacement | 10-26px (by font size) | Large titles move more, small text moves less; >40px fights with the sense of direction of the whole card's forward push |
| pop | Spring damping 13, 0.4→1 | Pills and swatches are small, so the overshoot will not hit neighbours; using pop on large items looks cheap |
| Price demotion point | f62 (hold 18f after the price settles) | Must leave time for "seeing the original price first"; right on top of the settle it reads as having always been the discount price |
| New price spring | damping 14, 1.18→1 | The only enlarge-and-rebound event in the whole film; with lower damping it shakes twice and competes with the neighbouring strike-through for attention |
| Highlight sweep | 6f, `scaleX` from the left | 5-6f is marker speed; >12f reads as a background colour gradient rather than a stroke |
| Whole-card push | `scale 1→1.035`, 0-132f | Spread over 4.4s it is pure breathing; >8% and the card hits the frame edge |

## Known pitfalls
- The field boxes (cursor landing points) are hard-coded absolute coordinates: after changing font size or copy, update the box in the `F` table in step, otherwise the cursor box does not enclose the field
- The last field settles at ~f128, after which there are ~1.3s of only a very slow push - this gives viewers time to read through the whole card, so do not cut it as a bug
- The three body lines are hard-coded `white-space: nowrap` with no wrapping (34px, line width ≤ 700px). Longer copy or Chinese will overflow the card edge,
  and the font size and line length must be re-matched for production
- The new price and the discount chip are absolutely positioned (x estimated from the 112px bold digit width); changing the number of digits in the price needs a re-layout, otherwise the chip overlaps the text
- The content is video-shotcraft's sample fill (strike through $449 → Free, selling-point copy, a brand four-colour swatch set; $449 is only an illustrative original price), and it is the field structure itself that is reusable.
  After swapping in real product data the number of fields often changes, and the schedule's intervals must be re-laid according to the new field grouping
- The highlight's start (f86/90) is 8-9f later than the start of its line settling (f78/81); when changing a line's settle time the highlight must change with it, otherwise "the highlight arrives first and the text later" appears
- `BLUE` (cobalt) is the only source of hue on the whole card (cursor + new price + chip + highlight); to change the brand colour, change the look's accent; everything else is neutral

## Reference implementation
demos/ui-entrance/product-card-progressive-assemble/
(ProductCardProgressiveAssemble.tsx)
