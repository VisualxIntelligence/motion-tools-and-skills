---
name: canvas-materialize-moves
summary: Two patterns for content "materialising onto the canvas" — panel-to-canvas row-to-card pour-out (panel table rows fly out along an arc and morph across containers into canvas cards) and diagram-cascade cascading generated tree (after the prompt is typed, nodes pop out layer by layer, with connector lines growing before the nodes)
use_when: The narrative section of AI/collaboration tools where "generated results land on the canvas"; pattern A tells "existing content has changed its form of existence", pattern B tells "a structure grows out of one sentence"
duration: A ~5s (150f) / B ~6s (180f)
energy: Medium
tags: ui-entrance
---

## Intent
The library's generation narratives are only "written out letter by letter inside a window" (document-typewriter-reveal, a document writing itself out)
and "a chart comes alive by itself" (chart-live-moves); there is no vocabulary for **content leaving its container and
materialising into a new entity on an open canvas**. This card fills that gap: the canvas is the stage, the generated objects are the actors
taking the stage. The crux of pattern A is cross-container form migration — the same piece of content turns from a "row" into a "card", with position
/ width and height / corner radius / content layout interpolated in sync on one spring, so the audience reads "it flew over and changed"
rather than "one deleted and one added"; the crux of pattern B is the cascade timing — a line draws out a node, a layer
feeds the next layer, and the sense of structure comes from sequence rather than simultaneity.

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A panel-to-canvas row-to-card pour-out | The cursor ticks checkboxes one by one → the button is pressed → three rows first lift up and then fly out staggered along an upward-tossed arc, with the row form and the card form cross-fading along the way, landing with a tilt angle and a landing squash; the panel's row slots collapse into dashed blank space | Bulk import / one-click put-on-board: content migrating from a list state into a spatial state |
| B diagram-cascade cascading generated tree | The prompt is typed out letter by letter (outline confirms once typing is done, and after submission the outline glows in motion = generating) → a line drips from the bottom of the prompt to the root (gradient-outlined protagonist) → 2 children → 4 grandchildren pulled out layer by layer from the top ports, with the elbow connectors' comet heads leading by 10f, the camera pulling back from a prompt close-up to reveal the whole tree, and after the tree forms the whole thing breathes for a beat | AI-generated structure diagram / mind map / ER diagram: one sentence grows a tree |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A ticking | 14/24/34f one by one (the cursor lands on each in a swift arc), spring(damping 11, stiffness 300) pop + tick line drawn over 7f | The ticks are a "preview"; if they are all deleted the audience does not know who is about to fly; ticking all on the same frame reads as a static already-selected state |
| A take-off stagger | Button pressed at 52f, three rows lift (4f: enlarge 2% + deepen shadow) at 56/62/68f and then take off (stagger 6f) | Flying all on the same frame reads as copy-paste; a stagger >12f makes the last row look left behind; flying without lifting first reads as being deleted |
| A flight interpolation | spring(damping 17, stiffness 95, mass 0.9); position follows a quadratic Bezier with the midpoint lifted 220px; width and height converge 3f later | Straight-line flight reads as a pan, not as "poured out"; a midpoint lift <100px loses the arc feel; synchronising size with position loses the weight of "parent first, child after" |
| A form migration | Row 626×104 → card 486×300, corner radius 18→24, rowOp fades out over us 0.08→0.4, cardOp fades in over 0.5→0.8 | The cross-fade of the two sets of content must be staggered — both states shown together in the middle breaks the illusion |
| A landing tilt | −2.5 / 1.8 / −1.2°, landing 6f scaleY 0.97 squash and rebound | All positive reads as a grid layout; >4° reads as a scattered glitch |
| A speed blur | SpeedBlur amount 0.32, max 14 (along the arc's velocity direction) | Only in the flight section; back to zero after settling |
| B typing | 0.95–1.2f per character, uneven, 1.7f pause on spaces; once typing is done the prompt outline turns purple to confirm, +4f the submit key is pressed | Constant-speed typing reads as a machine; without the confirmation state there is no causal hook between "finished typing" and "start generating" |
| B camera | Opens at 1.3× pushed in with the prompt centred; after submission a 72f smooth pull-back to 1.0 | Without the push-in the lower half of the picture is empty for the first 2s; the pull-back must run at the same time as the cascade, so the tree grows into the space the shot "backs out" into |
| B cascade timing | Root = submit +14f, layer interval 22f, siblings in the same layer staggered 5f; node spring(damping 14, stiffness 190), scale origin = midpoint of the top edge (pulled out of the port) | A layer interval <12f reads as everything appearing at once; siblings on the same frame read as copies; scaling from the centre reads as a pop-up |
| B connector leads | An SVG circular-arc elbow path (parent bottom port → midline → child top port) drawn over 16f ease-out, 10f earlier than the child node; a comet light dot at the line head | "A line draws out a node" is the source of the sense of causality; a line later than the node becomes a touch-up |
| B closing breath | Starting 22f after the last node, scale 1→1.03→1 about the tree centre (smooth, 28f), with the aurora behind it brightening a notch in sync | The breath is the full stop of "the tree has formed"; >1.06 reads as a scaling glitch |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Division of labour with chart-live-moves: that card is the liveliness of a data chart itself (streamlines / dot matrix / axis burst),
  and pattern B is the **birth process** of a structure diagram — a living diagram ≠ a diagram being generated, so do not use pattern B to play an existing chart
- The row slots in pattern A must collapse into dashed blank space — if the original position is intact after the row flies away, "migration" degrades into
  "copying" and the semantics are lost entirely
- The cross-fade window of pattern A (rowOp fading out before u≈0.45, cardOp fading in after it) is the crux for preventing
  breakage; the spring overshoots, u may briefly exceed 1, and the content opacity must be clamped
- The breathing origin in pattern B must be the visual centre of gravity of the tree (demo 960,620) rather than the frame centre,
  otherwise it reads as a whole-screen zoom
- The comet head in pattern B takes its points by path arc length: the elbows use SVG circular arcs (the A command) rather than quadratic Beziers so that the length can be solved analytically and accurately,
  and the line head does not come apart from the drawn line's end point

## Reference implementation
demos/interaction/canvas-materialize-moves/
(DiagramCascadeBuild.tsx / PanelToCanvasMaterialize.tsx)
Original source: miro-promo 84–92s (pattern A) / 104–116s (pattern B)
