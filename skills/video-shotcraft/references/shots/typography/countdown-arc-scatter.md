---
name: countdown-arc-scatter
summary: Nine equal-sized numerals on a paper dial are arranged tangentially along a large arc; the whole dial sweeps through 96° then decelerates to a hard stop, the "5" stops at the top of the arc and immediately translates into place as the first character of the title, while the other numerals scatter away in place with blur, the title fades in word by word with blur, and the last word turns to the accent colour
use_when: Countdown / duration-promise copy ("5 min to install"); a data-reveal beat; short shots on a light background that need a "dashboard" vocabulary
duration: about 3.3s (100f@30fps: sweep ~30f + landing 20f + title assembly + hold 22f; can be compressed to a 33f single beat at minimum)
energy: High (a 96° large sweep squeezed into ~20 frames, pure impact)
---

## Intent
"Installs in 5 minutes" written as a static title card, nobody believes it. The dial sweep puts that number inside a
**range**: 45, 35, 28, 22, 17, 10 sweep past one after another and stop at 5 — the audience sees
"from a lot to very little", and the number argues for itself. After stopping, the "5" does not vanish but **translates to become the title's
first character**; one element completes the identity switch from instrument to copy, which is the most valuable move on this card.

## Motion core
- Arc layout: 9 numerals hang on the same centre (the demo is drawn natively at 1920×1080: centre (960,1150), R=700, arc top y=450),
  `ang = (i-6)·24`°, position `x = cx + sin·R`, `y = cy - cos·R`, and each numeral additionally gets `rotate(position angle)` — a **tangential layout**,
  so the numerals tilt along the arc as if engraved on the dial face; numerals are 112px Helvetica bold tabular, equal size and equal weight
- Whole-dial sweep: first a 5f reverse wind-up of +3° (anticipation), then a physical spring 99°→0° (damping 12 / stiffness 60,
  overshooting 0° by about 2° at ~24f, settling at ~34f) — "decelerate to a hard stop + one needle rebound" is all of the force of "arrival"
- Both ends of the arc fade in and out: `op = clamp((70 - |pa|)/22)`, the position angle goes to zero beyond ±70° and fades in from ±48° —
  **no mask, opacity is computed from the angle**, so the numerals "rotate into view"
- The "5" at `i=6` is designed with angle 0 (the sweep finishes stopped exactly at the arc top), and takes off 2f before the rebound settles: a 20f asymmetric in-out (EASE.swift)
  translates it to the title's first-character slot, with the same curve doing the 112→150px scale-up and the rotation back to upright. The title's first slot is an empty space of fixed 0.6em width,
  and the flying "5" also uses a same-width centred box, so the landing aligns strictly with the slot centre and no element swap is needed
- The other 8 numerals defocus and fade out in place over 28→44f (`blur(out·6)`, **no displacement**, since displacement would fight the "5" translation for attention), yielding
  4f earlier than the "5" takes off; during the fast part of the sweep each numeral gets directional motion blur according to its tangential velocity (zero once steady)
- Dial-face layering: inside the numerals a ring of fine ticks turning at the same speed as the dial (one every 4°, longer at numeral positions); the accent-colour pointer hangs on `rot·0.35`
  and follows the rotation — a **0.35x differential speed**, two rotation speeds create the layering of "dial face + pointer"; outside, a static hairline arc + an accent-colour readout marker at the top,
  which remain on the poster at 35% after the dial dissolves (the title looks as if read off the instrument)
- The three title words go word by word with `blur((1-p)·10)` + fade-in + 0.12em upward float, windows 42–56 / 46–60 / 50–66f (overlap = one sentence);
  the last word interpolates from ink to the accent colour over 64–76f (demo vermilion) — the film's only colour event; below, a mono 34px command line adds a product fact (in the demo it is video-shotcraft's real install command `npx skills add Vincentwei1021/video-shotcraft`; the top right is the video-shotcraft wordmark)

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Number series | `[45,35,28,22,17,10,5,4,3]`, spacing 24° | A decreasing, unequally spaced series (45→35→28…) is what looks like a real range; an arithmetic series reads as a ruler; the "5" must sit at position i=6 (the first 6 sweep past, 2 after are reserved) |
| Arc radius | R=700px, centre below the frame (arc top y≈450) | Radius determines the curvature of the arc: <R/3 of the frame width and the numerals crowd into a small circle, when the arc is nearly straight the dial feel disappears; the whole visible arc should span 60–70% of the frame |
| Sweep | wind-up +3° 5f → spring 99°→0° (damping 12 / stiffness 60, ~2° overshoot) | Overshoot >4° reads as a spring toy; an inOut ease-stop with no overshoot lacks the crispness of an instrument |
| Visible angle window | `(70-|pa|)/22` (fully transparent beyond ±70°) | 22 is the fade width (about one notch); widened to 40 the numerals enter and exit half-transparent and muddy; set to 0 it is a hard-cut appearance |
| "5" landing | 32→52f (20f, EASE.swift), 112→150px, rotating upright at the same time | The landing follows the sweep stop immediately with no rest in between — leave one and it breaks into two actions; the landing point must be the title's first-character slot (the fixed slot width guarantees alignment) |
| Others fade out | 28→44f + `blur(out·6)` | The fade-out starts **before** the "5" takes off, yielding first; blur makes the dispersal read as defocus rather than vanishing |
| Tick differential speed | pointer `rot·0.35`; title word windows overlap about 10f, `blur (1-p)·10`px | The differential speed is the source of the "dial vs pointer" layering, at 1.0 (same speed) it reads as one whole texture turning; overlapping word windows are what makes "one sentence", queuing reads as three words each making their own entrance |
| Last-word colouring | 64→76f → accent colour | The film's only colour event; landing on the final word makes it the landing point of the sentence |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **33f is the extreme compression** (motion-lab original: sweep 17f, "5" landing 6f, three-word fade-ins about 5f each), with information density far above the readable limit;
  the demo has been stretched to 100f. When changing the duration again, scale all time windows **by the same ratio** (the ratios were tuned), and do not stretch only the sweep section
- **When changing copy, re-estimate the title width**: the demo uses `TITLE_EM` (the full-line em width estimated from glyph widths) to centre the title, and the "5" landing
  is derived from the fixed 0.6em first slot — when the copy changes, only change `WORDS` and `TITLE_EM`, the landing aligns automatically, but the centring of the whole line must be re-estimated
- The dial numerals must be **equal size and equal weight** (demo 112px/700): uneven sizes read as data visualisation,
  not a dashboard sweeping past
- The "5" angle design (i=6 → ang=0) is the foundation of this card: if you change the length of the series or change which number
  is the lead, you must make the lead's `ang` compute to exactly 0, otherwise it is not at the top of the arc when the sweep stops
- Light background first: warm white paper background + ink numerals + a single accent colour is the source of this card's clean feel; a dark-background version
  needs the whole set re-matched (and the blur used for the fade-out turns grey on a dark background)
- Sound: the sweep stop and the landing are two closely spaced rhythm points (only a few frames apart),
  so pair them with two short sounds of different timbre (a mechanical stop for the sweep stop, a light settle for the landing); the same sound fired twice
  blurs into a single sound; for the scoring discipline see sound-design.md

## Reference implementation
demos/typography/countdown-arc-scatter/
(CountdownArcScatter.tsx)
