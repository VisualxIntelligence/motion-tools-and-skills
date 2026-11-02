---
name: wall-reveal-moves
summary: Two styles of whole-wall batch entrance - bento lighting up cell by cell, and blueprint line tracing taking shape, all revealing in place with no displacement, complementing deck-deal-flyin's fly-in displacement type to form a category matrix
use_when: The overall debut of feature walls / card walls / full-page interfaces; segments where the content is already in place and is to be "revealed" rather than "poured in"
duration: about 5s per style (A 150f / B 150f @30fps, including the establishing hold and still ending)
energy: Medium
---

## Intent
For "how does a wall of content make its entrance" the library previously had only one answer, deck-deal-flyin - high energy, displacement type,
"things pouring in". But not every wall should pour in: a brand segment needs gravity, and
"from design to the real thing" needs to tell the process. What these two styles have in common is a **non-displacement batch entrance** - elements reveal in place,
the layout holds from the first frame, and what the viewer watches is "a wavefront of state change sweeping across a wall" rather than "objects flying".
When choosing, first ask: should this wall "pour in" or "light up"? For the former go to deck-deal-flyin, for the latter come into this card.

## Variant selection
| Style | Approach | Use when |
|----|------|----------|
| A bento-light-up (cell-by-cell lighting) | A dark-scene 3×2 bento wall (two rows of complementary wide and narrow cells 600/420/420 ↔ 420/420/600, dark card faces) is dimmed on standby, and an accent-colour comet streak traces the outline cell by cell, with the content then brightening and floating up; once all are lit the camera pushes in slowly and settles; the eyebrow above the wall is the video-shotcraft mark + wordmark, with the main title "Every shot, tuned in one place." | Dignified content / dark-scene brand segments; feature overviews with a steady rhythm |
| B wireframe-draw-on (blueprint line trace taking shape) | The interface is first drawn group by group as a thin-line SVG blueprint, then an accent-colour glowing vertical line sweeps from left to right, and where it sweeps the wireframe materialises into the real interface (in the demo it is the video-shotcraft workbench, with the brand mark traced inside the sidebar logo square) | "From design to the real thing / from idea to product" narratives; the first overall debut of a product |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A beat | hold 20f → each cell activated in turn at 12f intervals (six cells fully lit in ~96f) → scale 1→1.04 slow push over 25f (bezier 0.33,0,0.2,1) → still ending | A 12f cascade is the balance between "cells distinguishable one by one" and "the whole wall dragging"; with more cells it can be compressed to 8-10f, but the even interval is itself the source of this style's gravity, so do not learn from the deal's acceleration |
| A single cell | Dark state opacity 0.18 + translateY 20px; SVG rect pathLength=100 outline over 8f: a comet segment of 22% of the perimeter (#e8b45e 6px Gaussian glow + #ffe3ae 2.5px bright core) leads, leaving a 1.5px thin edge behind it; when the outline is past halfway (+6f) the content pops out with back-out(0.3,1.4,0.5,1) over 8f, brightening into place; 12f after the outline finishes, the streak anneals to a 0.4 always-lit thin edge | The outlining and the content pop-out should **relay, not synchronise** - starting on the same frame reads as the whole cell flashing in; the mid-light-up glow pulse uses a lit·(1−lit)·4 parabola, with the peak amplitude differing slightly per cell by seed (sine hash, true random forbidden) |
| B line tracing | hold 20f → groups staggered, each finishing in 30f: sidebar from 20f / top bar from 30f / 6 cards from 40+i*3f / line chart from 52f; SVG pathLength=1 + dashoffset 1→0, blueprint cool grey-blue #6c7894 (outer frame 1.6px / inner parts 1.25px) round, on a pale-blue 24px dot-grid base + card-corner crop marks | Group staggering is the source of the "a hand is drawing" feel, and everything starting on the same frame reads as a printer; the placeholder lines inside cards are further finely staggered at +3f, with lengths differing slightly by seed hash |
| B materialising | 88-118f the solid layer's clip-path inset(0 right% 0 0) unfolds from left to right over 30f, bezier(0.55,0,0.25,1); the leading edge is followed by a 4px accent-colour vertical line (#ffc46b + double-layer glow boxShadow), fading in at 86-92f and out at 112-120f; behind the line a 260px stretch of fading warm light (the residual warmth of something just developed) | The line position and the clip's leading edge must be driven by the same scan value, and asynchrony reads as a glitch; leave ~6f of breathing room between the line-tracing segment and the scan segment (82→88f), since scanning right after the lines are drawn reads as rushing |
| Still ending | After all the action of both styles settles, truly still for ≥15f (counted from after the slow push ends in A, and after the scan line fades out in B) | R1 breathing precedent: during the still period every property is locked dead, including residual glow / shadow / highlight |

## Known pitfalls
- **The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material**
- The accent-colour outline / scan line of A/B belong to the category of "single-point high-quality light effects" (compliant within Q4's three constraints), but one film
  has ≤1 whole-wall light-up (P4 technique de-duplication) - using A and B in the same film counts as two whole-wall light effects, so pick one
- Style B's wireframe geometry must align pixel for pixel with the solid layer's layout (in the demo laid out by hand following FakeDashboard A),
  and swapping material means re-laying the wireframe - if misaligned, elements jump position the instant the scan line sweeps by, an obvious giveaway; changing the brand name / logo
  also counts as swapping material (the text width changes, and the elements after the breadcrumb shift right as a group), so the line lengths must be re-aligned to the solid layer's measured text widths
- Both styles are "reveal in place"; do not mix in a displacement entrance (such as adding a translateX fly-in while lighting up cell by cell) -
  for displacement needs go to deck-deal-flyin; a hybrid resembles neither
- A's dark-state opacity 0.18 holds only on a dark base (#2a2a28); on a light base the dimming reads as a fading glitch

## Reference implementation
demos/ui-entrance/wall-reveal-moves/
(BentoLightUp.tsx / WireframeDrawOn.tsx)

Implementation status: both styles have reference implementations and Gallery motion samples.
