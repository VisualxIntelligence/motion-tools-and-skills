---
name: scan-bracket-sweep
summary: A document pops into the centre, L-shaped viewfinder brackets drop onto its four corners, and a scanning light band trailing a gradient wake sweeps back and forth over the document for 5 passes — the document stays perfectly still throughout, and only the light reads it
use_when: "Parsing/validating this content" process shots; capability demos for document products; the middle of an upload→analysis chain
duration: about 5.0s (150f@30fps)
energy: Medium-low (mechanical and restrained; the rhythm lives entirely in the breathing of the back-and-forth sweeps)
---

## Intent
Let the viewer understand "this thing is being read line by line by a machine". The viewfinder brackets first frame the target (announcing the object
of inspection), and the scanning light band then travels back and forth across the whole page (announcing the inspection process). The crux is that **the document itself is completely still**:
as soon as the document moves too, the viewer cannot tell whether it is "being inspected" or "loading".

## Motion core
- The document `seg(0→0.11, outCubic)` pops from scale 0.86 to 1, with opacity running on `dp*3`
  reaching full brightness early, landing before the scaling does — first "it's there", then "it's steady"
- The 34px L-shaped brackets at the four corners land one after another with `i*0.022` stagger, each finishing in 0.055,
  closing in from the outside along the diagonal with an 8px offset (overshoot easing, about 8% light overshoot before settling)
- The scan window `t 0.17→0.95` is cut strictly linearly into 5 passes, and within each pass `inOutSine`
  is slow at both ends and fast in the middle, with the last 12% a complete pause (`local=(raw-pi)/0.88`)
- Light band = 1.2px indigo light core + 10px symmetric soft glow + trailing wake; the wake is at most 82px long, `SCAN .2→0`
  multiply blend, with its length stretching with the scan speed (collapsing to 0 at the pause at the end of a pass, so there is no jump at the reversal); the direction flips with `dir`:
  hanging above the band when moving down and below it when moving up, with the gradient reversing in sync
- The table rows the light core passes through are lightly illuminated (row background SCAN 9%, Gaussian falloff) — the light reads, the document does not move
- The whole light band is clipped inside an `overflow:hidden` layer with the same 10px corner radius as the document,
  fading in over `0.16→0.20` and fading out over `0.93→0.99`

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Document pop-in | scale 0.86→1, t 0→0.11 outCubic | A starting value below 0.8 becomes "flying in from far away"; the pop-in must be small to feel like UI |
| Viewfinder brackets | Arm length 34px, round-cap stroke 1.6px, outward offset −7px; stagger 0.022 / 0.055 each | All four corners appearing at once reads as a static border; a 0.022 difference is enough to read "dropping in one after another" |
| Scan passes | PASSES=5, window t 0.17→0.95 linear | 3 passes are not enough to read as "back and forth", and 7 or more makes each pass too fast within 5s |
| Easing within a pass | inOutSine + last 12% pause | The pause is the breathing point of "this pass has been seen clearly"; remove it and it becomes a constant-speed pendulum |
| Light band | 1.2px light core + soft glow + ≤82px wake SCAN .2→0 (multiply) | A line that is too thick (>4px) reads as a mask edge rather than light; a black-grey wake reads as dirt |
| Wake direction | Moving down top:−tail / moving up top:0, with the gradient flipped together; tail follows speed | Flipping only one → the wake runs ahead of the motion, reading as "the light sucking back"; a fixed-length wake jumps wholesale to the other side at the reversal |
| Clipping layer | Same 10px corner radius overflow:hidden as the document | If it leaks outside the document it is "scanning the frame" rather than "scanning the document" |

## Known pitfalls
- The light band must be clipped inside the document bbox with a corner radius matching the document — even a little leaking out loses the semantics of "scanning
  this document"
- The wake's `top` and the gradient direction are two independent pieces of code, and when changing the scan direction both must change together;
  missing one produces the anti-physical look of "the wake in front"
- The brackets' 34px arm length and −7px outward offset were matched to a 300×178 document size; when swapping in a real screenshot
  recompute for the new size, and an arm length beyond 1/4 of the short side covers the content
- Two colour variables: INK (brackets + body text) and SCAN (light core + soft glow + wake + row illumination); to reskin change only these two

## Reference implementation
demos/effects/scan-bracket-sweep/
(ScanBracketSweep.tsx)
