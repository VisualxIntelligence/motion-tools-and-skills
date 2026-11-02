---
name: cloner-depth-echo
summary: Clone column - the main card instantly "photocopies" 7 semi-transparent clones that line up in a queue along a diagonal depth axis, hold for a beat, then all accelerate back into the original, merging into one with a bounce
use_when: Selling points of "multiple copies / multi-tenancy / sense of scale / batch processing"; one shot that tells "one = many"
duration: 138f (about 4.6s)
energy: Medium (display-then-converge type)
---

## Intent
A UI translation of the Spline/C4D Cloner vocabulary: one main card "pops" out 7 clones,
spaced evenly back along the Z axis (interval 250px, opacity decreasing 100%→28%, the further away the more only an outline remains),
popping out in a stagger to form a column; it holds for ~32f so the viewer can count that "there are many"; then all of them ease-in, accelerating back into
the original to merge, and at the moment of merging the original bounces to 1.06x to close. The demo lands "one = many" on a concrete selling point:
one video-shotcraft render card (launch-film) × 8 shots; on merging, the 8 shot slots at the bottom of the card light up together, and the title lands on "One prompt. / Eight shots.". The division of labour with the depth-layer-moves parallax
(different content in layers): this is an evenly spaced echo array of the **same content**, and its meaning is scale
not space.

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Depth layout | True 3D perspective 1500, with the vanishing point at the upper left (360,120); clone translateZ = −250·idx, then dx=−58·idx / dy=−6·idx added | **The crux**: with pure translateZ and the vanishing point dead centre, the clones are all hidden behind the original (imperceptible); moving the vanishing point to a corner of the frame makes the recession itself line the column up towards that corner |
| Clone count / spacing | 7 clones / 250px | Fewer than 5 does not read as a "queue", and more than 9 smudges the tail into a clump |
| Falloff | Opacity 100%→28% linear; fill fades away leaving only an accent-colour outline; the further away, an extra 0→1.6px depth-of-field blur | The further, the fainter and the more "only an outline" = the evidence of depth; clones keep only the top bar + polyline + shot number, do not repeat the large readout (stacked into a clump of gibberish) |
| Spread / pull-back | spring stagger 2.2f per clone (damping 15, one light overshoot); pull-back strong ease-in 10f all in sync, with a trailing motion blur by depth velocity | The spread must be staggered (photocopy feel), the pull-back must be synchronised (converging feel) - the asymmetry in rhythm is by design |
| Hold | 32f, during which the camera pushes in very slowly 2% + the column drifts with slight parallax | Too short and the viewer cannot count "there are many"; completely still is a dead frame |
| Merge | Main card single sin pulse 1.06x + one accent-colour outline glow (14f decay); on the same frame the shot slots all light up and the counter rebounds | A pull-back with no bounce reads as a fade-out; the bounce = evidence of mass |
| Count | Bottom-left 260px "×N", rolling one notch per clone popped out (5f, the outgoing notch moves up and fades + vertical blur by speed) | The count turns "scale" from a picture into a number; do not clip the rolling notch with overflow, as it would crop the bloom into a box |

## Known pitfalls
- The demo is tuned with a hand-built video-shotcraft render card (lime dark scene) - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- Clones must be rendered back to front to keep occlusion correct; unmount conditionally at opacity ≤0.005
- The other two entries in the same batch of 3D channels (thick slab turntable eliminated, corridor "change and look again") - purely display-type
  3D camera moves have doubtful compatibility; this card gets past the bar by the narrative action of "spread - pull back",
  and in real use do not degrade it into a static column display
- Sound: a string of fine "pops" staggered for the spread, one rising whoosh for the pull-back, one solid "thump" for the merge

## Reference implementation
demos/ui-entrance/cloner-depth-echo/
(ClonerDepthEcho.tsx)
