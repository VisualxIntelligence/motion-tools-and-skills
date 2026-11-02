---
name: hashtag-to-pill-materialize
summary: A hashtag word typed into a physical object — "#word" is typed in the centre (red solid cursor constantly lit), a 1-frame hard cut turns it into a large wide capsule tag, after a hold it shrinks and moves left to land in the page's tag slot, then another 1-frame hard cut reveals the finished page; a rhythm skeleton of "two hard cuts and one slide"
use_when: Demo sections for tag/category/keyword features (typing a tag in a notes app, topic aggregation); a three-part narrative of "input → becomes a UI object → settles into the finished piece"
duration: 120f (4s) — typing ~40f + hard-cut capsule hold ~18f + shrink-and-move ~14f + rest of ~1.2s after the hard-cut reveal (original film 18–21.5s)
energy: Medium (crisp and decisive, getting its drive from hard cuts, not from bounces)
tags: typography
---

## Intent
The usual way to turn text into an object is a gradient/morph/expansion, but the frame-level breakdown of the original film proves Bear does the opposite:
**the materialisation is a 1-frame hard cut** — the previous frame is still text + cursor, the next frame is a complete
capsule, with no expansion, no cross-fade, no rebound. A hard cut gives the certainty of "snap, done", and
any gradient softens "object" into "effect". The skeleton of the whole section is **two hard cuts sandwiching one
slide**: hard-cut materialisation → smooth shrink-and-move into place → hard-cut reveal of the finished page. The only continuous
motion (the shrink-and-move) is framed by two hard cuts, which is what makes it look both fast and steady. This rhythm skeleton is the crux:
if the nature of any of the three moves is changed (turning a hard cut into a gradient, a slide into a hard cut), the whole card collapses.

## Motion core
- Typing section: a geometric sans-serif (Futura character) types "#word" in the centre, with a **red solid cursor
  constantly lit and not blinking** (measured on the original film, do not add a blink); human-hand rhythm of 4–6f/character with deterministic jitter
- **Materialisation = 1-frame hard cut**: the text + cursor layer disappears as a whole, and on the same frame an unoutlined light grey
  capsule + icon + word appears (same font size, same size in the same position, the # replaced by the icon); only a
  3f 1.03→1 micro-settle is allowed to prevent stiffness
- Capsule hold ~0.6s → one bezier easeInOut shrink and move left (~0.55x,
  ~14f) landing in the page's tag slot, position/scale on the same curve with the same start and end, not segmented midway
- After landing, **another 1-frame hard cut** reveals the finished page: the base colour / title / body / capsule colour scheme all change on the same frame,
  then a truly still ending
- Implementation key: the capsule is drawn at the large font size and scaled by an overall transform, and
  transformOrigin must be 0 0 with the translate first, otherwise the landing centre drifts

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Typing rhythm | 4–6f/character (original film ~6 characters/second), mulberry32 jitter | Even intervals read as machine typing; the cursor must be constantly lit (**measured on the original film**, no blinking) |
| Materialisation | **1-frame hard cut** (frame-level measurement of the original film shows no transition at all) + 3f 1.03→1 micro-settle | Adding a fade-in/expansion immediately downgrades it to an ordinary morph; a micro-settle >4f reads as a bounce |
| Capsule geometry | 740×236@1920 (**measured on the original film** 493×157@720p ×1.5), no outline | The capsule has to be "excessively wide and large" to feel like an object; adding an outline reads as a button |
| hold | ~18f (0.6s, **measured on the original film**) | <12f and the audience has not seen what the capsule looks like before it flies off |
| Shrink-and-move | ~0.55x (**measured on the original film** 273/493), 14f, bezier(0.5,0,0.25,1) | Scale and displacement must be on the same curve; tuned separately they read as two animations |
| Reveal | Landing +3f, then a 1-frame hard cut of the whole page | If the reveal is made a transition, the second hard cut is gone and half the skeleton collapses |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Overlaps in territory with typewriter-moves (typing presentation) and ui-to-brand-morph (gradual morph forming):
  the crux of this card is **hard-cut materialisation, not a gradual morph** — as soon as you want to add a transition,
  use those two cards instead of modifying this one
- An early version once fabricated a segment of "capsule flies in and slides into the notes card below", which was falsified against the original film and cut;
  do not revive the flight segment
- transformOrigin defaulting to 50% 50% makes the scale-landing centre drift by (1−s)×half-width,
  so you must use origin 0 0 + translate to the target centre and then scale (see the comment in the demo)
- Residual gaps from the original film: the Futura fallback font weight, and body spacing on the reveal frame off by about 10px;
  the rhythm and hard-cut timing are aligned frame by frame. The demo content has been changed to the video-shotcraft world
  (the original film's "#music" + music note → "#shots" + clapperboard icon, finished page "My favorite shots"),
  with the topic word the same length as the original word and the capsule geometry unchanged

## Reference implementation
demos/interaction/hashtag-to-pill-materialize/
(HashtagToPillMaterialize.tsx)
Original source: bear-app.mp4 18–21.5s
