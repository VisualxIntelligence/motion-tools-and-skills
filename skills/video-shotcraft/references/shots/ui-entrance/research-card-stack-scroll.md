---
name: research-card-stack-scroll
summary: Dark paper cards fly in one every 12 frames along a lower-right axis and pile up in the centre, landing with a 1-frame compression; only the topmost card is fully rendered sharp with title + authors + abstract, while the cards beneath blur and darken with increasing pile depth and show only a title strip, and the background horizontal grid moves down in sync as a speed reference
use_when: Conveying the magnitude of "read a huge amount of material / processed a vast number of documents"; capability shots for research, retrieval and batch-processing products
duration: about 4.8s (144f@30fps)
energy: Medium-high (constant high frequency, no bursts but sustained pressure)
---

## Intent
What is to be said is "quantity", but giving 13 cards at once would read as a wall. Turn it into an assembly line: cards enter one at a time, each one is
read (the topmost one is always the one rendered in full text), and once read it sinks into the pile and blurs. What the viewer feels is a continuous
throughput, not a static pile. The background grid moving down at the same speed is the speed reference - without it, the piling would read as
"cards shrinking in place".

## Motion core
- The timeline uses real frame numbers rather than a normalised t: internally `F=144`, each card's local time is `e = t*144 - i*12`,
  and all choreography (entrance, piling, depth) is hard-coded with `PER=12` frames as the beat unit
- The entrance is a 6-frame short action: `seg(clamp((e+6)/6), 0, 1, E.outCubic)` - note the start is `e=-6`,
  i.e. the card starts flying 6 frames before its own beat arrives, with `translateY(-40→0)` + `scale(0.94→1)`
- Landing squash: when `e ∈ [0, 1.6)` the y-axis scale is additionally multiplied by 0.97, pressing for only 1.6 frames - so short it does not read as
  deformation, only as "slammed down solid"
- Pile drift: after landing `drift = e/12*30`, each beat moving down 30px and right `XOFF=9`px, forming a slight
  lower-right axis; the axis makes the 13 cards not a concentric stack but a pile with thickness
- Depth decay: `depth = min(1, drift/(30*3))` - decaying to the bottom within three beats, `blur(depth*4)` +
  `brightness(1-depth*0.25)`; further down, `(drift-30*3.2)/(30*1.6)` pulls opacity to 0 to recycle it
- A single focus: `focus = floor(f/12)`, and only the card with `i === focus` shows its body (author line + 4 abstract
  skeleton bars), while the other cards' body is set straight to `opacity:0` leaving only the title - "the one being read" is always exactly one card
- Background grid: `translateY((f/12*30*S) % 24)`, the displacement derived from the same `GAP=30` as the cards' drift,
  so the grid and the card pile move at strictly the same speed; the modulo of 24px makes it loop seamlessly

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Beat | PER=12 frames/card, 13 cards | 12f is the lower limit of "tight but still legible"; <8f and the title cannot be read in time, >20f and the sense of magnitude collapses into card-by-card display |
| Entrance travel | 6 frames (outCubic), lead of -6 frames | A travel of only half the beat → each card has settled before the next arrives; with a travel ≥ PER two cards are in flight at once |
| Entrance displacement / scale | `translateY(-40→0)`, `scale 0.94→1` | 40px is a small amount against a 96px card height - the card "drops in" rather than "flies in"; the scale difference is only 0.06, and any more reads as a pop-up |
| Landing compression | 1.6 frames, y-axis ×0.97 | 3% is just perceptible; >6% or a duration >3f shows rubbery deformation |
| Pile axis | Each beat y+30px, x+9px | The 9/30 ratio decides the slope of the axis; with x at zero it becomes a concentric stack straight below, and the sense of thickness disappears |
| Depth decay | `depth = drift/90`, blur 0→4px, brightness 1→0.75 | Decaying out within 90px (3 beats) → there are always only about 3 "semi-sharp" cards on screen; lengthening the decay distance makes the blurred pile below too thick and the picture dirty |
| Recycle window | Fading out from `drift > 96px`, reaching 0 within 48px | Recycling too early shows cards vanishing in the middle of the frame; too late and all 13 are present, raising the DOM and blur costs |
| Content coordinate system | Logical 420×250, overall `scale(min(W/420, H/250))` | All pixel values are written in the logical coordinate system, so changing the canvas size needs no re-layout; the card 296×96 and font size 9.5px are logical values |

## Known pitfalls
- Card count and beat are bound together: `13 cards × 12 frames = 156 frames > F=144`, so at t=1 the last two cards are still mid-entrance,
  and the last frame is not a clean static. For a freeze-frame ending, bring the card count within `F/PER - 1` (≤11 cards at a 12-frame beat)
- `focus = floor(f/12)` can exceed the card count's upper bound (at f=144 focus=12, which is exactly the last card) - after adding cards
  or changing the beat, confirm that focus does not point for long at a nonexistent index, otherwise "no card is sharp" appears
- All time constants are hard-coded on the assumption of 144 frames (`F=144`, `fr=f/F`). Changing the duration requires changing F as well,
  otherwise the beat stretches with the duration and the 12-frame tightness is lost
- The titles are 13 realistic-looking paper title placeholders, and the `preprint:24xx` numbers are generated from the index; in production replace them with the project's
  real document titles; the widths of the abstract skeleton bars generated by `rand(i*5+k)` are deterministic pseudo-random, so do not replace this with Math.random
- Dark cards (`INK` base + `#2A2A2A` outline) pressed on a `#FAFAFA` light base are the premise of this contrast; once the card colour
  is made lighter, the `brightness(0.75)` depth decay is almost invisible and needs to be replaced with opacity or greyscale decay

## Reference implementation
demos/ui-entrance/research-card-stack-scroll/
(ResearchCardStackScroll.tsx)
