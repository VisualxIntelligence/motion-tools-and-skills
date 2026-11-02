---
name: radial-wave
summary: A 17×9 array of dots lights up in a stagger by Euclidean distance from the wave source; each dot's scale overshoots to 1.5 and then settles back to stay lit, and after the first wave has swept through, a second bright-blue pulse closes in from the outer ring back to the centre in reverse
use_when: The "system powers up" beat of a product / brand opening; also used as an establishing shot for data grids, node maps and coverage-range narratives
duration: about 3.8s (114f@30fps)
energy: Medium-high (one burst at the start, then after the wave front passes it turns into a low-energy always-lit bed)
---

## Intent
It rewrites the static fact that "many dots exist at the same time" into the dynamic fact that "energy spreads from one source to the whole". What the viewer
sees is not a dot matrix picture but one power-up: the centre lights first, the brightness pushes outward like a water wave, and once it has finished the whole array
stays in the always-lit state - laying the ground for the content to be shown on the next beat. The second reverse wave is an acknowledgement, telling the viewer that this system responds.

## Motion core
- The array is 17×9 = 153 dots, and the dots are positioned in percentages (`left:(c+0.5)/COLS`), so changing the number of rows and columns needs no
  recomputation of coordinates; each dot pre-stores its normalised distance `dist = hypot(c-cx, r-cy) / maxD` (maxD = hypot(8,4))
- First wave: `seg(t, dist*0.35, dist*0.35+0.18, E.outCubic)` - the start is delayed linearly by distance (the outermost
  ring is delayed by 0.35), and a single dot's own travel is constant at 0.18; the wave front is a "staggered start", not a change of speed
- Each dot's scale is not a simple 0→1 but `w1*(1+0.5*sin(w1*π))`: it bulges to about 1.5 midway and then returns to 1,
  and the sine envelope puts the overshoot in the middle of the travel rather than at settling
- Second wave: `seg(t, 0.62+(1-dist)*0.25, +0.15)` reverses the sign of the offset (the outer ring moves first), takes
  `sin(w2*π)` as a pure pulse, adds a scale increment of 0.8 and an opacity increment of 0.25, and leaves no state behind when it finishes
- At the pulse peak (`pulse2 > 0.3`) the colour is hard-cut to `#b9f2ff` and given a `0 0 12px #7fd8ff` glow - only the second
  wave carries a glow, and the first wave is a constant `#6c8cff` throughout, so the two waves do not blend visually into one event

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Array size | COLS=17 / ROWS=9 (153 dots) | The dot count decides the "resolution" of the wave front; with <8 columns the distance bands are too coarse and the wave reads as three or four concentric rings jumping |
| Wave speed coefficient | `dist*0.35` | This 0.35 is the reciprocal of the wave speed: larger means the wave moves slower with a longer tail; at >0.5 the outermost ring has to wait until more than halfway through the film to light up |
| Single-dot travel | 0.18 (≈21f) | Decides the thickness of the wave front; <0.1 the front is sharp like a scan line, >0.3 the whole field lights almost at once and the sense of spreading disappears |
| Overshoot amplitude | `1+0.5*sin(w1*π)` → peak 1.5 | The coefficient 0.5 is the amount of "a bounce"; remove the sine term and it is a flat 0→1 fade-in, and at >0.8 the dots bite into each other |
| Second wave | start `0.62+(1-dist)*0.25`, window 0.15, amplitude 0.8 | 0.62 is the breathing space between the two waves; moved earlier than 0.5 it overlaps the tail of the first wave and reads as a mess of flashing |
| Always-lit bed | `opacity = 0.25 + w1*0.5 + pulse2*0.25` | 0.25 is the presence of dots not yet lit; set to 0 and everything outside the wave front is black, so the "scale" of the array cannot be conveyed |
| Highlight threshold | `pulse2 > 0.3` switches colour + glow | The lower the threshold the longer the glowing segment; this is a hard cut not a gradient, and with the threshold near 0 you see an obvious on/off jump |

## Known pitfalls
- The wave source is hard-coded at the geometric centre (`cx=(COLS-1)/2, cy=(ROWS-1)/2`). To make the wave start from a corner or some "node",
  cx/cy and maxD must both be changed, otherwise the normalised distance is >1 and the outermost ring's start is pushed past t=1 and never lights up
- The last frame is not completely still: the centre dot's (dist=0) second-wave window is 0.87→1.02, so at t=1 it has only reached 87%,
  and `pulse2≈0.41` is still highlighted. For a loop or a clean ending, the second wave's start must be pressed to within 0.85
- The dot's `width:10px` and `margin:-5px` are a bound pair (centring by negative margin); changing the dot diameter requires changing the
  margin in step, otherwise the whole array shifts half a dot diameter towards the lower right
- There are only two colour levels (constant `#6c8cff` / peak `#b9f2ff`); changing the brand colour means changing these two places plus the glow colour, three in all;
  the background `#0a0b10` is the premise for the glow, and on a white background this brightness pulse is basically invisible

## Reference implementation
demos/ui-entrance/radial-wave/
(RadialWave.tsx)
