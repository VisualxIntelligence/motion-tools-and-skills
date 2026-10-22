---
name: bezier-source-converge-merge
summary: Four source nodes on the left each have a thin Bézier curve leading to the same convergence point on the right. The curves draw on from left to right in a stagger, the nodes slide along their own curves towards the convergence point and shrink in three stages with acceleration until they vanish, accent-coloured data packets glide along the paths throughout, and once the merge completes the curves are wiped back from the left end leaving only the brand mark (demo: a white porcelain disc carrying the video-shotcraft brand-mark mark)
use_when: The core mechanism shot for "multi-source integration / unified access / data convergence"; explanatory segments for integration, aggregation and single-entry-point products
duration: about 5.6s (168f@30fps)
energy: Medium (a long shot that advances slowly, kept alive by the gliding data packets; the moment of merging is the only small high point)
---

## Intent
"We unified four sources" is an abstract sentence. This motion turns it into a physical process you can watch: first establish four independent
pathways (draw-on reads as "connected"), then let the four sources actually walk along those pathways into the same point and be sucked in (shrinking
to 0 reads as "merged"), and finally erase the pathways and leave only the brand mark ("now there is only one"). Each of the three narrative phases has a clear
start and end, and viewers can read the cause and effect without narration.

## Motion core
- Path geometry: each `d = "M -22,y L 74,y C 186,y 214,120 332,120"` - the start is -22, outside the frame,
  74 is the resting position of the source node, and after that a cubic Bézier bends towards the convergence point (332,120). The four paths differ only in start y
  (36/92/148/204), so their curvatures are naturally different, and so are their merge angles
- Draw-on uses `stroke-dasharray = len` + `dashoffset = len*(1-draw)`, with `seg(t, 0.04+i*0.045,
  +0.17, E.outQuad)` - the 0.045 stagger makes the four lines look as if they are being connected one after another rather than lighting up together
- Node positioning uses `getPointAtLength`: x=74 is exactly the end of the straight segment, so the path fraction is calibrated directly
  as `f0 = 96/len` (the original 40-step scan was not precise enough and the four nodes would not line up in a column); at runtime `frac = f0 + (1-f0)*conv`, `conv = seg(t, 0.34, 0.74, E.inOutCubic)` -
  the nodes walk **along the real curve**, not interpolated between two points
- Three-stage shrinking: when `conv < 0.75`, 44→15px (slow slimming); when `conv ≥ 0.75`, 15→0px (all of it gone in the last
  quarter of the travel) - the size change rate in the latter stage is more than 4 times that of the former, which is the acceleration of "being sucked in";
  the font size shrinks in step at `size*0.26`, so the label never detaches from the node
- Data packets: `pkCycle = (seg(t, 0.1, 0.74, E.linear)*2) % 1` runs two whole cycles, with a phase offset of
  `i*0.13` added per path; opacity uses `1 - |cycle-0.5|*0.6` so a packet is brightest mid-path and fades at both ends -
  avoiding packets appearing out of nowhere at the start
- Erasing: `erase = seg(t, 0.78, 0.9, E.outQuad)` pushes dashoffset negative (`-erase*len`),
  so the dashes retreat from the **start** end, in the opposite direction to draw-on, reading as "the pathways are withdrawn"
- Badge: `seg(t, 0.16, 0.26)` fades it in while scaling from 0.7 to 1; at the moment of merging (0.7→0.78 outBack adds 12%,
  0.78→0.86 outQuad subtracts back) it gives one receiving pulse; the closing `endCap` caption fades in after 0.84

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Number of sources | 4 paths (y=36/92/148/204, spacing 56) | 4 is the sweet spot where curvature differences are clear without tangling; with >6, the middle Béziers nearly coincide and the merge angles are indistinguishable |
| draw-on | start `0.04+i*0.045`, window 0.17, outQuad | A 0.045 stagger is about 7f; at zero it reads as four lines flashing on together, losing the "connecting path by path" meaning |
| Convergence window | 0.34→0.74 (inOutCubic) | Takes 40% of the film and is the main segment; the slow start of inOut is "launch" and the slow end is "arrival", and swapping in linear instantly turns it into a constant-speed conveyor belt |
| Three-stage shrink | 44→15px (first 75%) → 0 (last 25%) | The later the inflection at 0.75, the more abrupt the suck-in; moving it to 0.5 turns it into "shrinking all the way" and the merging moment is lost |
| Packet cycles | 2 whole cycles (0.1→0.74 linear) | Must be whole cycles, otherwise packets stop halfway on the last frame; raising to 4 reads as a hurried data stream and overlaps the nodes more easily |
| Packet phase offset | `i*0.13` | Staggers the packets on the four paths so they do not line up and merge at the same time; at 0 you see four packets merging in neat formation, like a single departure |
| Erase | 0.78→0.9, dashoffset negative | Completes in 12f; the erase must come after all nodes have vanished (conv=0.74 ends, nodes finish fading before 0.92), otherwise the lines disappear first and the nodes hang in mid-air |
| Badge pulse | outBack +12% (0.7→0.78) → fall back (0.78→0.86) | 12% is the magnitude of "received"; >25% steals attention from the convergence itself |

## Known pitfalls
- `getTotalLength` / `getPointAtLength` are valid only after the SVG is attached to the document and layout is complete;
  the code does this in the first-frame `prime()` using a `ready` flag - when ported to Remotion the first frame may not get
  the length (the fallback is written as `|| 380`). The safer approach is to compute after `useEffect`/layout, or precompute
  a table of constants, otherwise the first frame shows a one-off misplaced jump
- `f0` is calibrated directly from the straight segment length 96 (`96/len`). The old version used a 40-step linear scan with a precision of only 1/40, so the nodes' resting position
  drifted from 74 and the four nodes did not line up in a column - after changing the path (especially the straight segment length), update this calibration too
- Node opacity only starts fading after `conv > 0.92`, but conv reaches 1 at t=0.74, so the nodes disappear
  when their size shrinks to 0 rather than fading out. This is intentional (something being sucked in should not fade out), but if the inflection of the three-stage
  shrink is moved later, you will see nodes suddenly vanish while they still have size
- The nodes are white porcelain placeholder discs carrying greyscale line icons (demo: four kinds of material - page screenshot / shot card / code / sound; the greyscale layering only distinguishes the four paths); in production they can be replaced with real source
  logos; the accent colour is reserved for the data packets and ripples - do not colour the nodes, otherwise the visual subject of the convergence point is stolen. The mark at the convergence point must sit on an opaque
  disc - the curve ends and the data packets all land at the centre of the convergence point, and an open-shaped mark (such as the brand mark's viewfinder frame) placed directly on it would show line ends through the gap
- The convergence point (332,120) and the SVG viewport 440×240 with `overflow:visible` are a bound set of coordinates. Changing the canvas
  aspect ratio means re-measuring the whole set, and the path start at -22 relies on `overflow:visible` to show the part outside the frame
- The caption "From screenshot to showreel" (video-shotcraft's tagline) appears after 0.84 - if there is narration, the appearance of this line
  should align with where the narration lands the words, not with an animation beat

## Reference implementation
demos/ui-entrance/bezier-source-converge-merge/
(BezierSourceConvergeMerge.tsx)
