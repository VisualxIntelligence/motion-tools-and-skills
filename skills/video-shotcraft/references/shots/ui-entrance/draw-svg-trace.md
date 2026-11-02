---
name: draw-svg-trace
summary: Stroke-growth circling - a line of ink with a pen tip runs once around an element's outline to "draw" it; at the instant it closes, a black flash hands over and the content fades in; the same routine can underline a title
use_when: The called-out entrance of a single card / chart / title; an element-level technique (the page-level blueprint line trace belongs to wall-reveal-moves style B)
duration: 132f (teaser 10f + stroke 40f + black-flash handover 16f + underline 18f + hold 40f, about 4.4s)
energy: Medium
tags: typography
---

## Intent
"Drawn out" is the most natural entrance metaphor in the paper-and-ink aesthetic: the element does not fly in or fade in,
but is traced on the spot by an invisible pen. The library's wall-reveal-moves style B already has a whole-page
blueprint version (a full-screen wireframe drawn segment by segment + areas lit up); this card is its **element-level close-up**:
one line, one subject, one closure, with the pen tip visible and the direction readable, suited to the "next we talk about it"
moment of calling something out. The second use is a growing title underline: the same routine in an 18f short version, giving a key word
a single hand-drawn stroke of emphasis, naturally in the same family as the marker aesthetic token.

## Motion core
- **No perimeter measurement needed**: set `pathLength={1}` on the SVG rect/path, strokeDasharray="1",
  dashoffset 1→0 (40f Easing.inOut(cubic)) - no getTotalLength
- **Pen tip**: on the same path overlay three tapering short dashes (0.04/6.4px → 0.024/8px → 0.011/9.6px), with dashoffset = pen tip length − p,
  so it naturally runs at the very front; add a solid pen nib positioned precisely by the rounded-rectangle arc length (with a drop shadow);
  without the pen tip it is only "a border getting longer", and with it, "someone is drawing"
- Teaser: in 0-12f at the start, crop marks first grow at the four corners (print registration lines, staggered 2f), under them a layer of drawing-paper dot grid that is clear in the centre and fades out around the edges -
  there is a picture on frame 1, and the viewer first knows "something is about to be drawn here"; on closure the crop marks spring out 22px and fade
- Closing flash: at 50-52f the stroke surges to pure black + thickens from 6→11px, and falls back by out easing over 52-58f
  - on a white background, deepen and thicken, do not use a glow (precedent)
- Handover: at 56-66f the stroke layer fades out and the element's own hairline border fades in; from 50f the card base takes ink and the card rises from lying on the ground (the shadow grows),
  the content goes from faint to solid top to bottom with a 3f stagger + floating up, and the bar chart grows from the baseline with a 1.5f stagger - closure means "drawing is done", and the content "takes colour" after it
- Second use: at 74-92f, draw a vermilion marker underline under the key word "100%" (a slightly curved hand-drawn path, with the pen tip following), and it stays once drawn

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Stroke speed | One full circuit in 40f (10→50f, inOut cubic with breathing at start and end) | <28f does not read as "drawing", >60f reads as loading |
| Main line / pen tip | Main line 6px; pen tip three tapering segments with a thickest of 9.6px, nib r 7.5 | A pen tip ≤ the main line's thickness vanishes into the main line |
| Closing flash | 2f surge to black + thicken to 11px, 6f fall back | Without this beat, "drawing done" has no full stop |
| Subject size | 1120×660, corner radius 28 (stroke rx the same value) | The subject takes ~58% of the frame width so that the stroke circuit has the weight of "drew a big thing"; the stroke rx must equal the card corner radius |
| Underline version | 18f out cubic one-way growth, 12px vermilion, path with ±5px hand-drawn curvature, stays once drawn | Use on a single key word; ≥2 on one screen reads as decorative lines |
| Closing | After the handover completes, hold 40f (92→132f) with only a very slow 0.9% push-in | R1 |

## Known pitfalls
- The demo is tuned with a hand-built video-shotcraft render report card (paper ink-on-paper look, "Cuts on the beat / 100%" + per-shot energy bars + a logo wordmark signature) - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- Same family as, and mutually exclusive with, wall-reveal-moves style B (whole-page blueprint line trace): pick one per film;
  using both reads as announcing the same thing twice
- The stroke path must match the element's real outline (same corner radius rx) - if the line is drawn with a 14px
  corner radius and the element has 8px, the mismatch breaks the illusion at the moment of handover
- On real material, do not let the content fade in before the closure: if the content appears before the line has finished, the cause and effect
  of "drawing" is broken
- Draw one subject per call-out; several elements on one screen queuing to each draw a circuit reads as a loading animation

## Reference implementation
demos/ui-entrance/draw-svg-trace/
(DrawSvgTrace.tsx)
