---
name: basic-3d-scene
summary: An impress.js-style spatial presentation: cards are scattered through 3D space at different positions/rotations/scales, the camera takes the inverse of each step's pose and flies to align with them in turn, and the final step pulls out to an OVERVIEW
use_when: Spatialised telling of a concept / roadmap / three-step method; a replacement for flat slides where "every step changes the spatial viewpoint"
duration: about 7.5s (225f@30fps; four stops, three flights of 28/32/32f, each stop dwelling ≥30f)
energy: Medium (each transition has a spatial surprise, the dwell sections are quiet for reading the cards)
---

## Intent
Turn "turning the page" into "travelling through the space of ideas": each card has not only a position but also an attitude (at the second stop the world turns left by 38°, at the third the whole frame lies on its side by 90°), and when the camera aligns with it the audience's world turns too — the spatial change itself becomes the ceremony of "entering a new chapter".

## Motion core
- The core recipe in one line: **camera = stepTransform.inverse()**. Each stop only writes the card's own pose (x/y/z/rx/ry/rz/s), and the camera transform takes the inverse as `scale(1/s) rotateZ(-rz) rotateY(-ry) rotateX(-rx) translate3d(-x,-y,-z)`, with the order strictly reversed
- The demo uses a graphite dark stage (near-monochrome + champagne-gold accents), with the video-shotcraft three chapter cards Frame / Craft / Ship (the brand's short phrase split into three chapters, with the mark + wordmark hung at the right of the card head): the cards are 1240×700 **native 1:1 layout** (when aligned they are screen pixels, not scaled up from design coordinates, so the text is not blurry), a 156px title + 44px description + a 560px thin-weight chapter number cropped by the card edge
- Each of the four stops has its own dramatic point: STEP01 origin frontal → STEP02 (1690,−260,−650) + ry−38° → STEP03 (2590,830,−850) + rz90° (the frame lies on its side, the camera turning it upright as it follows) → OVERVIEW s=2.7 (the camera pulls out by 1/2.7), with the overview stop's position solved backwards from "the three cards land at the upper right, the lower left is left for the end card"
- Chained interpolation of flights: the three flights at 36–64 / 96–128 / 158–190 (frames), asymmetric in-out bezier(0.62,0,0.16,1); mid-flight between stops the camera additionally pulls out by 30% (hop, sin envelope) so the audience sees the other cards in the space; the flight sections use time-sampled motion blur (shutter 0.5f, sub-frames 1–8 adapting to camera displacement)
- The dwell sections are not dead: after landing the camera pushes in very slowly by 1.5% (restored on the same curve as the next section takes off), and a gold progress line at the card's base runs full through the current section; the title rises letter by letter from under the line 8f before landing, and each card is revealed only once
- Spatial reference: 70 true-3D dust motes hung in world coordinates (each with its own z), with all parallax coming from the camera; enter/exit focus gives `opacity 0.22–1 + blur 0–7px` by "stop distance" `d = |af − i|`, and in the overview section everyone returns to 0.85
- The OVERVIEW end card hangs on the overview stop's pose (laid out at 2.7× enlargement, seen back through the camera at 1/2.7 = screen 1:1): the eyebrow is the video-shotcraft mark + wordmark, "Craft the shot." in 150px serif rises word by word, and the tail section holds with a 1.5% push-in

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Stop pose | At least one new transform dimension per stop | Moving only x/y is a panning slideshow; the rz stop (frame rotation) is the memory point, used once per film |
| Flight duration | 28–32f | Do not make sections with rotation shorter than 28f, the audience needs time to understand "the world is turning" |
| Dwell duration | ≥30f | Time for reading the card; when a card has a lot of text, add dwell rather than reducing flight |
| hop pull-out | 30% | 0 = sliding along the card face, no space is seen; >50% and every section looks like an overview |
| OVERVIEW scale | s=2.7 | The larger the value the more "high-altitude" the overview; fix the overview poster composition first, then solve each stop's world coordinates backwards |
| Focus falloff | opacity floor 0.22 + blur peak 7px | Do not set the floor below 0.2 — out-of-focus cards must still be "present", and pure black loses the sense of space |
| perspective | 2600px | About 3:1 against the maximum \|z\| (850); deeper z requires enlarging persp in sync to prevent distortion |

## Known pitfalls
- The rotation order of the inverse transform (Z→Y→X, reversing the forward transform's X→Y→Z) must not be shuffled — a wrong order cannot be seen with single-axis rotations, but multi-axis compound stops come out skewed
- The card pose is consumed in two places, the card's own transform and the camera formula; when adding a stop only change the POSES table, and do not touch the transform strings in the two places
- The text in the card at the rz90° stop lies down with it and is only readable once the camera turns it upright — this is by design (the instant it turns upright, "ah, now I get it"), but the copy for that stop should be short
- When the end card hangs in the world, it is slanted during the last flight: develop it late (fade in only after the flight is more than half done), and wait until 6f before landing to start the letter-by-letter reveal
- There is no return trip after OVERVIEW, so use it as the close of a section; to loop back to STEP01 add a fly back at the end (lerp the cam back to POSES[0])

## Reference implementation
demos/camera/basic-3d-scene/
(Basic3DScene.tsx)
