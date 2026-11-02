---
name: line-carry-transition
summary: Line-relay lateral transition: scene A's progress bar extends out of frame, the camera follows the line sideways, and the line turns corners in motion to enclose scene B's card frame, with no cuts throughout
use_when: Between two scenes with a graphic kinship (progress bar → card frame, underline → chart axis); the signature transition slot of a film, the graphic relay of the Catch Me If You Can title sequence
duration: ~6.3s / 190f (progress bar fills 36f + bursts out 10f + lateral move 56f + frame closes 24f + poster in the frame 30f + still 24f)
energy: Medium
tags: camera
---

## Intent
The transition library's three big families (traversal/hidden cut/block) all answer "how does the scene change"; this card's answer is
**it doesn't change at all — a line leads you across**. After the progress bar fills, its end extends into a long line that bursts out past the
card edge, the camera follows the line sideways 1920px into the new world, and the line turns right angles in motion to enclose scene B's
card frame; the frame closes and the content fades in, and from start to finish the viewer's eyes never leave this line. Graphic
continuity is itself the transition. The difference from match-cut: that is shapes lining up on either side of a cut —
a cut after all; this is continuous drawing — **there is no cut**. The line's identity needs a narrative logic (the progress bar
"finished", so it extends outward); a line with no reason is just decoration.

## Motion core
- A 3840-wide world container's translateX acts as the camera, moving 1920px over 56–112f, smooth in-out (bezier .65,0,.35,1)
- A hand-written polyline path (progress bar 648 + burst-out segment + right angle + 720×480 rectangular frame, total length 4944) uses
  dasharray evolve throughout, with the drawn length driven in segments
- **The crux: in the lateral-move segment drawn = 1144 + cam, with the line growing at the same speed as the camera** — the pen tip is pinned at about x≈1480 on the right of the frame,
  never leaving the frame and never falling behind; once it loses speed, the viewer losing the line means losing the transition
- **Velocity continuity at the handovers**: the progress bar eases out to zero speed → stops full for 6f (status flips to complete, a checkmark pops out) →
  the burst-out segment has zero speed at both ends (swift) → the camera in-out starts from zero speed → the frame-closing in-out takes over the camera's landing point at zero speed
- The pen tip is the only accent-colour dot in the whole film (terracotta r=14 + halo), which dissipates at 136–142f after the frame closes and is conditionally unmounted (layer-removal precedent)
- During the lateral move the world content (cards, dot matrix, exhibit labels) gets horizontal motion blur by camera speed (SpeedBlur, ≤16px), while the line and pen tip stay sharp outside the blur layer;
  after the line passes, drafting ticks grow beneath it, giving the eye a speed reference when only the line is in the mid-section of the lateral move
- B's exhibit-label title is outside the frame and can rise before or after the camera arrives; the poster inside the frame must wait until the frame closes (from 136f) to grow in

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Line body | 8px ink solid line, square cap + right-angle miter | Too thin and it is lost during the lateral move; a dashed line reads as an unfinished state |
| Lateral-move ratio | 1920px / 56f (average speed 34px/f) | For a longer lateral move lengthen the duration proportionally, and do not speed up — at peak speed >80px/f the pen tip starts to be lost |
| Pen-tip position | x≈1480 of the frame (about 77%, towards the right) | Centred it reads as "the line chasing the camera"; hugging the edge, one tremor takes it out of frame |
| Corner | Hard right-angle turn, not rounded | A rounded soft turn loses the drafting feel, and the Saul Bass flavour is gone |
| Frame closing | Content inside the frame appears only from the closing frame | If the content appears before the frame closes, the line's suspense is wasted |
| Close | Truly still ≥24f after the poster has grown in | The pen-tip ink dot must be conditionally unmounted, and any residue ruins the stillness |

## Known pitfalls
- The demo is a hand-built video-shotcraft render scene (cream paper + ink + terracotta; A the render launch-film progress card → B this film's poster) — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- Relationship with draw-svg-trace: that is element-level outline call-out (the line belongs to the element), whereas this is
  a scene-level line relay (the line belongs to the camera) — they can coexist in one film, but the line's semantics must be consistent:
  both ink 8px geometric hard lines, or both hand-drawn feel; mixing them reads as two art directions
- At most 1 use per film — this is a signature transition, not a routine transition, and on a second appearance the magic is exposed
- The starting point must be a natural extension of an existing graphic component (a progress bar filling, an underline finishing),
  and a line started from nothing reads as a screensaver
- Sound: a sustained pen-scratch as the line grows, a light tap as the frame closes (sound-design §4.5)

## Reference implementation
demos/transition/line-carry-transition/
(LineCarryTransition.tsx)
