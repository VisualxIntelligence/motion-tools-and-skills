---
name: flying-words
summary: 22 keywords are laid out by the golden angle on a flattened elliptical cross-section, flying along the z axis from far away to brush past the camera, with opacity following a [0,1,0.5,0.2,0] life curve, running exactly 2 full cycles for a seamless loop
use_when: A dynamic background for keyword clouds / capability lists; an "information volume" underlay for openers and closers; a transition that needs a sense of flying through depth
duration: about 6.0s (180f@30fps, 2 full loops, can be joined seamlessly)
energy: High (continuous full-screen 3D displacement, no moment of stillness in the frame)
---

## Intent
The crudest way to list keywords is to pile a screen of static word cloud. The word tunnel **spreads the same set of words along the timeline**:
spawned far away, growing from small to large, brushing past the lens and disappearing; the audience only ever reads three or five words, yet the subjective impression is
"lots of words". It is a background layer, not a lead layer — the camera stays still and the elements move, so overlaying a title
or UI in the foreground causes no fight at all. Replace the whole word list with the project's keywords without changing a line of motion logic.

## Motion core
- Perspective (in 480 design coordinates) `perspective:1100px`, words advance linearly along z from **-1750 → 800px** — a positive value means passing through
  the camera plane, which is what gives the "brushing past". The demo is drawn natively at 1920 with the same set of values scaled ×4 overall: P=4400, z −7000 → +3200,
  with projection computed by hand `s = P/(P−z)` (equivalent point for point to CSS perspective)
- Placement uses the golden angle: `a = i·2.39996 + rand(i·7+1)·0.8`, radius `r = 82 + rand·165` (native ×4: 330 + rand·660),
  with the y radius further ×0.6 to flatten it into an ellipse — avoiding dead centre and avoiding a few near words piling into a clump
- Life curve `OP=[0,1,0.5,0.2,0]` @ `OT=[0,0.25,0.6,0.85,1]`: **in the first 1/4 it flares to full brightness,
  the middle drops to half-transparent, and the last stretch trails away to nothing** — not a simple fade-in/fade-out; dimming the middle is what keeps it from blocking the foreground
- Outward spread `drift = 0.5 + u·1.35`: far away they converge at the centre, and the nearer they get the more they are flung out of frame,
  stacking with the z-axis advance into a true perspective feel
- Near-end blurring: when `u > 0.86`, defocus is added linearly by `(u-0.86)` — words rushing up to the eye get uncontrollably large, and this blur layer is there to hide the ugliness;
  the real sense of speed is left to the directional trail based on screen velocity (demo: 6 layers of fading text-shadow afterimage along the −v direction, much cheaper than wrapping every word in a
  full-screen SVG filter); the far end's first 22% of travel additionally gets atmospheric-haze defocus
- The demo adds two more layers of depth reference moving with the same tunnel: 10 flattened elliptical hairline rings (tunnel walls, thickening and fading out as they approach) + 56 dust motes drawn as
  radially elongated light-speed streaks (line length = the screen displacement of the nearest 2.6 frames); the whole tunnel rolls very slowly `±2.5°·sin(2πt)` (a periodic function, identical start and end)
- Foreground: in the demo a static wordmark group sits at dead centre (mono eyebrow + 112px title + radial dark veil), and words flying into the wordmark's elliptical region have their opacity pressed down to 20%
  — demonstrating the use of "background layer + foreground title without fighting"; the wordmark is still, and the loop remains seamless
- `CYCLES = 2` is a whole number of cycles, and the demo takes `t = frame / DURATION` (the frame after the last frame = frame 0) for a seamless loop; each word's phase
  `ph = i/N` is evenly distributed, spawn is fully deterministic; the central electric-blue halo `opacity = 0.82 + sin(t·4π)·0.14` breathes twice,
  pinning down the visual anchor of "the end of the tunnel"

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Word list | 22 words, font size `20 + rand·16`px (20–36; native 64–120), weight 700 + 6 serif italic words | Word count is bound to phase `i/N`: <12 words and the frame is sparse, >30 words and the near ones smear into one mass; random font size is the source of layering, all the same size reads as a texture |
| Depth travel | z −1750 → +800px, perspective 1100 (native ×4) | A farther start (−2500+) makes words too small to recognise; an end that does not cross 0 gives no "passing through", only "flying up to the face and stopping" |
| Spread coefficient | `drift = 0.5 + u·1.35` | Coefficient <1 and words all erupt from dead centre like an explosion; >2 and they fly out of frame early, and the tunnel becomes a fountain |
| Life curve | `[0,1,0.5,0.2,0]` @ `[0,0.25,0.6,0.85,1]` | The 0.5 in the middle is there to give way to the foreground; changing to full brightness all the way steals from the lead, changing to reach zero early leaves the tunnel empty |
| Loop cycle count | `CYCLES = 2` (must be a whole number) | Non-integer → t=1 does not join t=0, and the loop point jumps; the more cycles, the faster each word crosses the shot |
| Near-end blur | linear defocus from `u>0.86` + speed-direction trail | With the threshold raised to 0.95 the hard edges of huge words are jarring; a coefficient >40 turns the end stretch into colour smears |
| Colour scheme | demo (midnight): three cool-white steps `#f2f5ff/#c3cbe2/#8a95b5` + 4 electric-blue accent words `#86a8ff` (only accent words carry bloom), central halo electric blue | Light text glowing on a dark ground is the identity card; applying this card on a white ground simply fails — a light ground needs the whole set re-matched |
| Central halo | ~1040×720 radial gradient, breathing 2 times per film | Delete it and the end of the tunnel has no focal point, the words look like they fly at random; the breathing frequency aligned with CYCLES avoids beating |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- When replacing the word list, **keep the word count and word-length magnitude** (demo 22 words, each 4–9 letters): the phase is
  evenly divided as `i/N`, and once the word count changes the overall density scales; Chinese words are more than twice as wide as English,
  so when switching to Chinese keywords the font size must be reduced in step, otherwise the near words fill the screen outright
- `CYCLES` must be a whole number, otherwise start and end do not join — this is the sole precondition for this card's "seamless loop",
  and to adjust the pass-by speed, add or subtract whole numbers and do not touch the decimals
- Background layer only: pressing the middle of the life curve down to 0.5 is exactly to give way to the foreground, and treating it as the lead
  (maxing out the brightness) instead reads as clutter
- Dark ground only: the `text-shadow` glow + radial vignette are half of the effect, and on a light ground the words smear into
  dirty dots; all 22 word elements stay in the DOM throughout (not destroyed and rebuilt) and only transform/opacity are changed,
  so when porting to Remotion keep this structure and do not change it to adding and removing nodes per frame

## Reference implementation
demos/typography/flying-words/
(FlyingWords.tsx)
