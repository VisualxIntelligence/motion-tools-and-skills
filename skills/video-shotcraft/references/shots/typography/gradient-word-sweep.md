---
name: gradient-word-sweep
summary: In a tagline on a black ground, the keyword is swept rapidly from left to right by a gradient colour light and "charged" — the glow is strongest on the wavefront characters and decays backward, and once filled, thin purple-red lightning links the characters while the whole word breathes a steady-state bloom
use_when: Charging up a single verb / selling-point word in a tagline (Supercharged/faster/AI…); the text moment in an energy-climax section; the slogan frame of a brand film on a black field
duration: sweep-charge ~15–20f (must be fast) + steady-state lightning breathing 1–2s; whole section 2.5–3.5s
energy: High (a one-word burst point, with everything before and after giving way)
tags: effects
---

## Intent
In a whole sentence of white text only the keyword is "powered on": a gradient colour light sweeps rapidly across the characters from left to right,
like energy being injected — brightest at the instant of sweeping past (the wavefront trail), then decaying to a steady state;
once filled, thin lightning leaps between the characters, and the word keeps a breathing bloom. Three crux points:
**fast** (sweep-charge 15–20f, slower reads as a progress bar), **brightest wavefront** (the freshly lit
characters have the strongest effect, without this gradient it is just a static gradient crop), **restrained glow**
(AE-style multi-layer bloom but do not smear it into a mass; lightning that is thin and sparse is what makes it an accent).

## Motion core
- Gradient fill: the keyword is made as a two-layer text (white / gradient colour), and the colour layer is revealed by a mask
  advancing from left to right; the slanted mask edge is slightly soft (~8% of the word width)
- Wavefront trail brightening: a brightened band of ~34% of the word width follows the mask's leading edge, with the
  glow strongest at the wavefront and decaying backward; after the fill ends it fades out to steady state over ~10f
- Glow: 4 layers of bloom (large ambient soft light + mid halo + near core + bright core), with steady-state opacity
  in the 0.55–0.72 range (measured: the 0.75–0.95 range was criticised as "the bloom feels a bit strong")
- Lightning: after the fill, thin lightning links the characters, in three purple-red stroke layers (outer halo 6 / mid 2.4 /
  bright core 1.4), flickering at random positions from a mulberry32 seed, sparse and scattered (not a sustained arc)
- Forbidden: no following light dots / starlight during the fill (measured precedent: a following white light dot reads as cheap decoration, deleted)
- A blurred glow layer cannot use the text box directly as mask/clip: the blur overflowing the box would be cut into a rectangular "box light" —
  the demo puts these layers into a box expanded by 90px on all sides, and the mask colour stops are converted back to text coordinates with `calc(PAD + (100% − 2·PAD)·x)`
- The demo duration is `GRADIENT_WORD_SWEEP_DURATION = 105` (3.5s): entrance is two lines in staggered blur-slide,
  sweep-charge 12→30f, from 33f 7 scheduled lightning strikes (the last extinguishes at ~92f), and the whole section pushes in very slowly 1→1.025

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Sweep-charge duration | 15–20f | The original film has "very high speed"; >28f reads as a progress bar |
| Wavefront brightening band | ~34% of word width, brightest at the wavefront decaying backward | No gradient = static gradient; band too wide = the whole word lights up together with no "injection" feel |
| Steady-state bloom | 4 layers opacity 0.55/0.55/0.62/0.72 | The 0.75+ range was criticised as too strong; fewer than 3 glow layers reads as a flat colour |
| Lightning line width | outer 6 / mid 2.4 / core 1.4 @1080p | Doubling it was criticised as "thick"; colour leans purple-red (magenta 216,60,190 family) |
| Lightning frequency | sparse and scattered (≤2 on screen at once, gaps >8f; demo schedules 7, 1 on screen at once, spacing ≥4–11f) | A high frequency reads as an arc fault |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Three precedents (distilled from the user's verbatim feedback): (1) no following light dots during the fill; (2) lightning
  must be purple-red + thin; (3) better weak than strong on the bloom, with the wavefront gradient making up the impact
- Division of labour with type-rhythm-sync: that card is about the beat;
  this card is the energy semantics of a single word "charging up", and the word must be the selling-point word in the sentence
- Body text outside the keyword stays pure white and still — if the whole sentence moves there is no drama of "only it is powered on"

## Reference implementation
demos/typography/gradient-word-sweep/
(GradientWordSweep.tsx)
Original source: clickup-30.mp4
