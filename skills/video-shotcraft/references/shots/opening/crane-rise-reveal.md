---
name: crane-rise-reveal
summary: Crane-rise reveal — the opening pushes in on a single row of data, then the camera decelerates upward along the Y axis and pulls back, rows flooding in until the whole dashboard fills the frame
use_when: Establishing opening that goes "from detail to the whole"; the mirror opposite of drone-dive-landing (whole → single-point dive)
duration: 5.5s (165f: close-up hold 24f + rise 102f + settle/aftermath/stillness 39f)
energy: Medium-high (continuous one-way motion, no impact beat)
tags: camera, data
---

## Intent
The library already has an establishing opening, drone-dive-landing — it slams from a god's-eye view into a hero close-up,
"whole → focus". This card is its mirror image: "focus → whole" — first sit on one row of real data
so the audience can see clearly "what this is", then pull back and up like a crane arm, rows of content flooding into the frame,
until the whole product fills the screen — "the row you just saw is only one cell of this whole wall".
Suits openings that sell on product scale / richness of content; use only one of the two directions in the same film.

## Motion core
- transform-origin is fixed at the top left, with the linked formula `translate = screen centre − aim point × scale`;
  the aim point moves along (left section of the tracked row) → (page centre) and scale 3.0→1.0 **share the same
  asymmetric easing bezier(0.2,0,0.25,1) progress** — one p = one camera, one move (same as the C-style precedent)
- The deceleration curve (fast first, slow after) is what gives the "crane arm" feel: a punchy start and a gentle stop at the top; it starts from zero speed and peaks at 19%
  (about 2.3× the average speed), never jumping from the hold straight to top speed; during the hold the camera first "takes a breath" and pushes in 1.5% as preparation
- Focus pull: during the close-up hold only the tracked row is solid (cobalt-blue base + a breathing tracking dot at the row head), the other rows are pressed down to 38%,
  and they return to full about 26f after the lift-off — first let the audience see "this one shot" clearly, then see everything
- Row-by-row light wash: when the top edge of the camera's visible area `visTop = fy − 540/s` first crosses a row's top edge,
  an accent-colour wash sweeps across that row from head to tail (rises over 3f, falls after 6f over 18f, with a 1px accent-colour outline) —
  this is where the "flooding in" gets its readability; the trigger frames are solved frame by frame, strictly in sync with the camera move
- Sense of volume: the header KPI (frames rendered today) counts from 0 to 48,210 during the rise (expo-out, landing on the same frame as the camera move), and the window shadow lifts from close to hovering height as it opens up,
  with the stage dot grid drifting slowly at 0.35 parallax — the window finally reads as a physical object on a stage
- Aftermath: once settled, the tracked row's status capsule flips from "Rendering" to "Rendered" (spring damping 16 + checkmark draw-on + progress bar fills up),
  the one small event within the hold
- On a white base, "brightening" is invisible; **only darkening / colouring is perceptible** (precedent: a brightness lift on a white card equals doing nothing)

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Starting close-up | scale 3.0, aimed at the left section of the tracked row (shot number / transition 63px large text; the framing's lower edge stops above the bottom edge of the window, not showing anything outside it) | Hold ≥20f so "this is a row of data" is readable before taking off |
| Rise | 102f bezier(0.2,0,0.25,1), scale 3.0→1.0 | Faster than 80f and the row washes cannot keep up; slower than 130f and the middle drags |
| Focus pull | Non-tracked rows 38% → 100%, 26f after lift-off | Without dimming, every row in the close-up carries equal weight and the audience does not know which row to watch |
| Row wash | Triggered on line crossing, accent colour sweeps from row head + thin outline, ~24f | Washes that fall behind the camera (triggered at a fixed interval) break the illusion immediately |
| Ending | No further push after full frame; keep the hold alive through the status flip, stillness ≥30f | R1; the full-frame frame is the standard composition |

## Known pitfalls
- The demo was tuned on a hand-built product window with made-up data (the video-shotcraft render queue) — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- The starting close-up = one row of content enlarged 3.2× and stared at; real footage must first go through the
  high-resolution rasterisation technique of aesthetic rule Q2, otherwise a low-magnification screenshot is blurry from the opening
- The fast rise section may be wrapped in CameraMotionBlur (parameters are in the motion-blur row of deck-deal-flyin),
  but only wrap the fast first half — wrapping the slow section near the top smears the text (round #8 precedent);
  keep semi-transparent wash overlays out of CameraMotionBlur (multi-sample stacking produces vertical-bar artefacts), and put them on a separate layer following the same camera
- Do not use it together with drone-dive-landing in the same film (one rises, one drops, mirror images, and the audience reads them as the same trick);
  tilt-reveal, the closest to crane in meaning, is not yet in the library — do not conflate the names

## Reference implementation
demos/opening/crane-rise-reveal/
(CraneRiseReveal.tsx)
