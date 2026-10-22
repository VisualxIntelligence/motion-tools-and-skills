---
name: picker-carousel-feature-cycle
summary: A mobile-style vertical picker — the focus pill stays still while the content passes through it, each item decelerating with a clear outQuint snap and then holding completely still, with opacity/font size/greyscale controlled in layers by distance from the centre, and the pill doing a very light scaleY breath on settling
use_when: List shots that read out feature names / scene names one by one; interaction demos of "pick one"; showing picker-type controls of mobile products
duration: about 3.6s (108f@30fps)
energy: Medium (each snap is a beat point, advancing at a constant pace over 5 beats)
---

## Intent
Build out the physical feel of "selecting": the focus frame is fixed, and it is the content that scrolls and gets snapped into place.
After stopping, each item must **truly hold still for a few frames** — continuous scrolling reads as a loading animation, and only the pause reads as
"this item has been selected". Distance falloff (opacity + font size + greyscale, three channels decaying together) is the only means of keeping the
audience's gaze locked on the middle row.

## Motion core
- Viewport 300×170px (5 rows × rowH 34), the focus pill is fixed at the position of row 3
  (`top: rowH*2`), white base + 1px `#E3E3E6` outline + `0 2px 8px rgba(0,0,0,.06)`
- Throughout, `t 0.05→0.95` is cut at constant speed into STEPS=5 steps; displacement within a step is
  `outQuint(min(1, local/(1−HOLD)))`, with the tail section of HOLD=5/14 fully still
  (each step ≈0.65s = movement ≈0.42s + stillness ≈0.23s)
- The list as a whole is `translateY(rowH*2 − pos*rowH)` — it is the content that moves, the pill has zero displacement
- Distance falloff (`d = |i − pos|`) in three bands: opacity 1→0.55 for `d≤1`,
  0.55→0.18 for `1<d≤2`; fontSize 17→14px (by `d/2`);
  color uses INK for `d<0.5`, MID for `d<1.5`, and `#B9B9BE` further out
- In-row icon opacity `max(0, 1 − d*1.6)` — only the focus row's icon is visible
- After settling, the pill breathes once with `scaleY 1 + sin(min(1, land/0.6)·π)*0.06`
  (`land` is >0 only within the HOLD section, i.e. it breathes only once the snap is complete)
- A 26% alpha fade mask at the top and bottom of the viewport (`mask-image` transparent→opaque), so entering and leaving items fade away naturally

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Row height / visible rows | rowH 34px × 5 rows, focus on row 3 | The number of visible rows must be odd, otherwise the focus row is not at the visual centre |
| Step count | STEPS=5, window t 0.05→0.95 at constant speed | 5 beats is the comfortable upper limit for 3.6s; with 7 beats each beat is squeezed to 0.46s and cannot be read clearly |
| HOLD | 5/14 ≈ 0.357 (the still tail of each step ≈0.23s) | **The crux**: with HOLD at zero it becomes constant-speed scrolling and loses the "snap" semantics entirely |
| Snap easing | outQuint (applied to local/(1−HOLD)) | The sharp deceleration of outQuint is the feel of "being caught by a magnet"; outCubic is too soft |
| opacity falloff | 1 → 0.55 (d≤1) → 0.18 (d≤2) | Leaving 0.55 on the adjacent rows lets the audience sense "there is more above and below"; dropping to 0.3 isolates it |
| fontSize falloff | 17→14px, by min(1, d/2) | The font-size difference is a second layer of depth; opacity alone looks flat |
| Icon visibility | max(0, 1 − d·1.6) | Only the focus row carries an icon, an extra marker for the "current item" |
| Pill breath | scaleY 1→1.06→1, completed within 0.6·HOLD after settling | 0.06 is already the upper limit; any larger reads as the pill moving by itself, stealing the content's scene |

## Known pitfalls
- The pill must be a **fixed layer with zero `translateY` displacement**, and the `scaleY` breath must not carry
  displacement either, otherwise the focus frame drifts and the semantics of "content passing through the focus" fail at once
- Writing the distance falloff onto `fontSize` triggers per-frame reflow (the layout does not jump because the row height is fixed),
  and if the row height is changed to auto it will jitter; rowH must be hard-coded
- The fade uses an alpha mask via `mask-image`; do not overlay paper-colour blocks: once the base is a gradient / has light spots, a colour-block mask exposes rectangular boundary bands
- The 24×24 square app icon on the left outside (dark base + inverted white version of the video-shotcraft mark) is positioned relative to the frame centre
  with `margin:-12px 0 0 -186px`; changing the viewport width requires changing the 186px to match
- ITEMS are the 7 video-shotcraft feature names ("Shot recipe cards" etc.); when swapping in other feature names,
  changes in text length affect the centring feel — if a single line exceeds 300px, shrink the font size rather than wrapping

## Reference implementation
demos/interaction/picker-carousel-feature-cycle/
(PickerCarouselFeatureCycle.tsx)
