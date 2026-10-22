---
name: dataviz-landscape-open
summary: Dark-stage tributary-line landscape opening — many streamlines flow into a main trunk, made-up ID labels float on the lines, and the camera flies through at low speed with heavy depth of field
use_when: Brand-level abstract opening (a "data universe" metaphor), followed by a bright-stage product section or the wordmark; division of labour with glow-flyline-moves: that card is the connecting-line narrative between cards within a section, this card is the full-frame landscape dedicated to openings
duration: 5–8s (an atmosphere section for an opening, ≤1 per film; demo 180f)
energy: Low opening, slow rise (starting position, leaves room for the later climb)
tags: data, camera
---

## Intent
A brand-level opening category evidenced by the Linear Releases launch film opening: shoot the data world behind the product
as a **dark-stage landscape** — bundles of tributary lines flow in from the depths of the frame into one main trunk (a metaphor for "countless workflows
becoming one product"). The realism comes from three things: (1) made-up issue/task ID labels
floating on the lines (the demo uses video-shotcraft shot numbers + camera-move names: each tributary is a shot, and together they form one finished film) (the audience recognises "this is the kind of thing I see every day");
(2) heavy depth of field — large out-of-focus near-field
lines flowing past, mid-field labels sharp and readable, far field fading out, three layers of depth that make a flat SVG read as space;
(3) the camera flies through low and steady — this is an atmosphere section, not a showpiece section, and the sense of speed is left to the shots that follow.
Compliance basis for hand-built UI: this is not a replica scene (this picture does not exist on the page), so under the revised core principle 1
it is judged on the quality + clarity-of-expression bar.

## Action phases
| Phase | Frame range (@30fps reference, demo 180f) | Content |
|------|------|------|
| 1 Growth | f0–70 | The trunk draws on from near to far toward the vanishing point (36f out-cubic, pen-tip light dot), and tributaries grow in from off-frame on both sides, staggered 4–6f, merging tangentially |
| 2 Fly-through | f0–180 | The camera flies forward low along the river channel + slow lateral drift (overlapping with the growth period), labels rise in non-uniform stagger f44–96, and bright pulses flow toward the confluence along fully grown lines |
| 3 Handoff | f104–180 | Labels stop being added; a ball of accent-colour light lights up at the vanishing point, and a line of large title drops into the sky; the camera decelerates to a stop on a bezier, hold ≥30f |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Bundle size | 8–14 tributaries flowing into 1 trunk (demo 11, including 1 near-field tributary that sweeps past the lens) | Beyond ~16 lines it reads as a screensaver / tech template; the trunk must be unique (the landscape version of the single-protagonist principle) |
| Landscape projection | Lines are drawn on a true-perspective ground plane: pinhole projection `sx = 960 + F·(X−camX)/Z'`, `sy = horizon + F·camH/Z'`, F 1100, camera height 220, horizon at 0.39 of frame height | A flat SVG moved sideways needs three layers of parallax faked by hand; a true projection gives near-large/far-small, parallax and convergence for free |
| Confluence topology | Tributaries merge into the trunk tangentially on a bezier (tangent at the merge point = trunk tangent), and the trunk's course puts the vanishing point in the right third of the frame | Perpendicular intersections read as a circuit diagram, not a river system; a centred vanishing point is a stiff composition |
| Depth of field | Layered segment by segment by projected depth: Z' <~1000 goes into the blur layer (blur 11px, line width ×1.3), mid-field sharp, Z' >2600 onward fogs and fades; line width = world line width·F/Z' | If the near field is not out of focus it reads as a wireframe; if the far field is not fogged it bunches into a bright clump at the horizon |
| Camera fly-through | Forward 950 world units / 180f, bezier(0.3,0.3,0.55,1): already flying at the start, decelerating to a stop at the tail; plus a slow lateral drift −140→110 | Too fast and it becomes a chase shot (that is the crash-zoom's job); pushing forward only with no lateral drift gives weak near/far displacement |
| Line drawing | Each line is sampled at equal arc-length intervals and drawn segment by segment (per-segment width/opacity), **butt end caps** | Round end caps stack a ring at every seam on a semi-transparent line, so the whole line reads as a string of beads |
| Sense of flow | After growth completes, narrow-peak bright pulses drift slowly along the lines toward the confluence, visible only in the mid and far field (a near-field segment is very long on screen, and per-segment light and dark reads as steps) | With no flowing element after the growth period, the second half degrades to a "route map fly-through" instead of a "data flow" |
| Labels | 5–9 in the mid field (demo 6): accent-colour square pin planted on the line + short post + monospace ID capsule, scaled in perspective by 1500/Z' (clamped 0.7–1.7); far ones drawn first, near ones last | **The post's world height must be far below the camera height** — when post height ≈ camera height every label projects onto the horizon and bunches into one row; positions must be checked frame by frame in projection so nothing overlaps at either the start or end |
| Growth rhythm | Trunk 30–40f out-cubic goes first, tributaries each staggered 3–6f | Everything growing on the same frame reads as a loading animation |
| Ending | Labels stop being added ≥15f before the handoff frame, and the camera decelerates rather than braking hard; the title (eyebrow + two lines at 108px) rises word by word | A hard brake in an atmosphere section is a visible jolt (same origin as the glow-orb convergence precedent) |

## Known pitfalls
- Source of inspiration: the Linear Releases opening (evolution round #3 breakdown #7), a single-sample case
  — parameters are given as ranges, not dogma, and the first real use must re-verify against real footage
- Do not mix with glow-flyline-moves in adjacent sections: both cards are "glowing lines on a dark stage",
  and back-to-back they read as the whole film knowing only one trick; if both are needed in one film, leave ≥2 bright-stage shots between them
- The cost of entering and leaving a dark stage is the same as for the glow card: to cut to a bright-stage product section, use the hidden-cut family pads from shot-transitions,
  and never hard-cut between dark and light
- Fully bright pure-white lines blur into a spider web — separate the brightness by layer (see the Parameters table), with the mid field as the protagonist layer;
  give the trunk/tributaries a 1–2px micro glow (soft glow) to press out the "glowing line" atmosphere, and with no glow at all they read as a wireframe (within the Q4 single-point light-effect allowance)
- Label font size must be ≥18px equivalent at the target frame size, otherwise "readable" degrades into decorative noise (same origin as Q6)
- Sound: lay a riser / low-frequency pad bed, and do not hit each label as it surfaces (batches do not sound individually,
  same origin as S2); one whoosh/impact on the handoff frame, handed to the next shot

## Reference implementation
demos/opening/dataviz-landscape-open/
(DatavizLandscapeOpen.tsx)
