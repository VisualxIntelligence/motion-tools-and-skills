---
name: tension-camera-moves
summary: Two emotional camera moves — bullet-time freeze-orbit and pull-back isolation, where the camera "feels" on the audience's behalf rather than "looks"
use_when: The camera language for emotional nodes (awe / closing); complementary to the "showpiece big moves" of space-camera-moves — these two patterns are small in action and heavy in emotion
duration: 5–6s (150–170f) per pattern; ≤2 patterns in the whole film (≤1 use of each)
energy: A high / B low closing
---

## Intent
The three patterns of space-camera-moves are highlight showpieces of "shooting the page as a 3D object"; these two are the opposite —
the action itself is restrained, and all the force lies in the emotional semantics: A says "this moment is worth stopping time to look at"
(moving elements are frozen, and the camera orbits to scrutinise); B says "in the end only this one thing remains"
(while pulling back the surroundings go out layer by layer, a lone point suspended to close the whole film). Each pattern takes one emotional slot,
and they are the direct vocabulary at the storyboard stage for "what should the audience feel in this section".

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A bullet-time-freeze-orbit | The chart is frozen halfway through growing together with the sparks spraying from the bar tops (the sparks hang in mid-air, trails retained), and the camera sweeps around the panel in a true 3D scene by rotateY 52° and back, after which time resumes and the growth finishes | The crowning moment of core data/charts; the one slot of "worth stopping the clock to look" |
| B pull-back-isolation | Pulling back from a close-up of the glowing main card, the 8 sibling cards go out in a stagger by distance, the background sinks to black, and the lone card hangs in the middle of the dark stage | Closing wrap-up; the curtain call of "the whole film is only for this one number" |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A two clocks | Content animation consumes `eff` (a speed-ramp integral: 8f smooth braking stop → freeze 52f → 8f recovery), the camera consumes real f | The crux: during the freeze the content must be visibly completely still to the naked eye while the camera is moving — the two clocks each handle their own; a hard stop and hard start has none of bullet time's sense of speed change |
| A orbit | A perspective 1800 preserve-3d scene (panel / sparks with z depth / grid ground / distant dot-matrix wall): rotateY 0→-52° (26f smooth) → slow drift at the apex 12f → back to 0 (22f swift), with rotateX lifting 6° and pushing in 160px in sync | 50–55° is the lower limit for "going round to look from the side"; >70° the panel becomes a sheet of paper and breaks the illusion; with no depth reference object (a single panel + a solid background) it cannot be read as the camera orbiting |
| A frozen motion | Spark trail length and counter rolling blur are both computed from the content clock's speed | During the freeze they keep their "in motion" form — what is frozen is a moment, not a still life |
| B pull-back | scale 2.2→0.62 / 110f Easing.out(cubic), origin locked to the main card centre, laid out at 2.2× CSS zoom then reduced | For the first 20f the main card still fills the frame, so opening on a close-up needs no extra hold; text in a close-up enlarged by transform blurs (Q2) |
| B going out | Sibling cards sorted by hypot distance, from frame 30 one card every 8f, within 16f opacity→0 (EASE.out) + brightness→0.3 + defocus 5px + sinking 0.97; the background cross-sinks from a bright soft-light base into a hue-tinted deep field over 60–110f | Going out from near to far = "the world collapsing into darkness outward"; going out in random order reads as a glitch |
| B halo | Two layers of cool-white box-shadow fading in over 60–100f on the main card, with the lit upper edge surfacing in sync | The halo is the visual testimony of "only it remains", and holds only when synchronised with the sinking to black |
| Ending | Hold ≥30f after both patterns finish (A leaves only a very slow breath of light; B 110–150f truly still) | R1; pattern B is the full stop of the whole film, so give the stillness 40f+, and a closing line can be added in screen space |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Pattern A and speed-ramp-freeze/impact-feedback are both time manipulation, so do not stack them on the same shot
  (the frame remaps fight each other); A's freeze is "stop for you to look" + the camera moves, and speed-ramp-freeze's
  freeze is "stop to annotate" — choose by semantics, not by resemblance
- When pattern B is placed at the ending, following it with outro-group-photo-launch will clash (one closes, one opens out), so choose one of the two

## Reference implementation
demos/camera/tension-camera-moves/
(BulletTimeFreezeOrbit.tsx / PullBackIsolation.tsx)
