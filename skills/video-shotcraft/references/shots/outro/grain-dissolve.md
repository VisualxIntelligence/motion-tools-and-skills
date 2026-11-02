---
name: grain-dissolve
summary: A whole line of text bursts into boiling grain noise and a diagonal-hatch selection box surfaces, then the noise cloud rapidly condenses into a larger, glowing short wordmark, with displacement decaying to zero and freezing in place
use_when: A closing "XX. Now Live" style launch announcement; an energy-gathering beat that compresses a long sentence into a short brand mark
duration: about 2.0s (60f@30fps; graining 0.26–0.56s · condensing 1.2–1.42s · solidify, fall back and finish)
energy: Medium-high (a short, one-off energy pulse, a natural outro beat hit)
---

## Intent
Film "a sentence condensed into a single word" as a physical event: the sentence first destabilises and boils into grain (the information disintegrates), the selection box implies "being selected and extracted", and then all the grain energy collapses toward the centre into a larger, brighter short wordmark — what the audience reads is "all of this boils down to it".

## Motion core
- The filter chain is the only engine: `feTurbulence` (fractalNoise, baseFrequency 0.9→1.3) + `feDisplacementMap` (scale 0→52) + `feGaussianBlur` (0→1.1px), all three driven by the same `burst` curve (t=0.13–0.28, outCubic)
- The noise "boils" through `seed = floor(t*46)` changing the seed every frame — a new noise map every frame, so the grain is never still
- t=0.60–0.71 crossfade: the whole line (26px) fades out and the short wordmark (44px bold) fades in, with both sharing the same filter — the switch happens at the most boiling moment, so the audience does not see the text change
- t=0.68–0.90 the `lock` curve pulls the displacement scale and blur back to 0, and the grain "solidifies" into clear letterforms
- White glow in three stages: a 0.3 faint glow in the graining phase → surging to 0.7 on condensing → falling back to 0.45 after t=0.88, with two layers of cool-white bloom inside the filter chain ("tight glow + wide glow", feGaussianBlur → feColorMatrix → feMerge, radius about 4–33px) breathing in sync; the SVG is rasterised at native 1920×1080, so the grain is fine
- The diagonal-hatch selection box (45° line array + four-corner pixel-checkerboard handles) surfaces with burst and is withdrawn at t=0.55–0.64 — exiting before the condensing, so as not to steal from the subject

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| displacement scale | peak 52 | <30 is only "slightly ragged edges"; >80 and the grain scatters until the outline cannot be recognised, and "faintly discernible" is the floor for the graining texture |
| baseFrequency | 0.9 → +0.4 | The higher it is, the finer the grain; below 0.5 it becomes large-block distortion, not "grain" |
| seed frame-change rate | floor(t*46), 46 times in 2s | Lowering it lets you see the noise maps repeat; keep a map-change rate of ≥20 times per second |
| Graining window | 0.13–0.28 (outCubic) | The first 0.13 of clean text lingering is the "normal state before destabilising", and cutting it removes the contrast |
| Condensing crossfade | 0.60–0.71 (inOutCubic) | The text swap must be completed within the most boiling stretch; earlier and it gives itself away by showing two lines of text ghosted over each other |
| Glow envelope | burst·0.3 + cond·0.7 − settle·0.45 | The condensing surge is the beat-hit position, pressing on the BGM accent; do not let the fall-back reach 0, leave a soft glow of "residual warmth" |

## Known pitfalls
- The demo's copy is `{ video-shotcraft. Now Live }` → condensing into the `video-shotcraft` wordmark (all lowercase); when swapping in a project's short mark both `<text>` lines must be changed: the whole-line sentence `{ XX. Now Live }` and the short mark XX must refer to the same object, otherwise the narrative breaks
- A longer short mark (>6 characters) requires scaling down the font size or widening the selection box bw in step, otherwise after condensing it overflows the box position and the visual centre of gravity shifts — the demo's 15-character brand name shrinks the whole line from 33px to 26px and the short mark from 54px to 44px, and the landing range of stray grains is widened in step to the wordmark's glyph face
- `feDisplacementMap` performs poorly on Safari; this card is a 2s short beat so it is acceptable, and for a longer duration the frame rate needs real testing
- The selection box must be withdrawn (0.55–0.64) before the condensing completes (0.71) — leaving the box up until after solidifying reads as "not finished selecting", the semantics reversed

## Reference implementation
demos/outro/grain-dissolve/
(GrainDissolve.tsx)
