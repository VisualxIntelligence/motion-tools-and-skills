---
name: crash-zoom-punch
summary: A wide shot rams to a target close-up in one beat (6f), with a choice of two landings — overshoot rebound (elasticity) or a crash stop with screen shake (weight)
use_when: The "name-calling" shot in a feature section — pressing the audience's gaze onto a target card/module in a single beat; for emphasis-level moments use the crash stop
duration: about 0.5s of action + holds before and after (action 6–11f, front hold ≥30f to establish the wide shot, back hold ≥45f to read the close-up)
energy: High (an instantaneous impact, not sustained high energy)
tags: effects
---

## Intent
A slow push-in (spotlight-hero-card) is "please look", a sudden push-in is "look at this!" — slamming within one beat
from the wide shot to the close-up, leaving the gaze no choice. The landing finish comes in two flavours: the rebound is elasticity
("look at this"), the crash stop with screen shake is weight ("that's the one"), chosen by the level of emphasis.

## Motion core
- zoom accelerates sharply over 6f ease-in (e.g. 1→2.6), with cx/cy converging in sync on ease-in to the target centre
- Rebound version: after the zoom overshoots, it retracts 3–6% over 5f (2.6→2.45)
- Crash-stop version: from the arrival frame the camera position shakes at high frequency + exponential decay (amp 14px, τ≈1.8f, settling in 6f),
  with no rebound
- Motion blur **wraps only the sudden push section** (the crash-stop shake section stays crisp while shaking): the demo uses a self-written time sampling
  (shutter ≈200°, sub-frame layers stacked with equal weight at opacity 1/(i+1), the sub-frame count adapting to this frame's displacement,
  capped at 40), with the sampling set by "echo spacing ≤ text height" (round A precedent); `<CameraMotionBlur>`
  also works, but its semi-transparent overlay turns the base colour grey-yellow on near-still frames. The page's small text in CrashZoomReal is only ~14px,
  so the echo spacing is pressed to ≤6px (cap 44 layers), and on high-speed frames each layer is further given ≤4px of micro-blur according to the spacing, smearing the discrete echoes into a continuous trail
- 6–8f before the sudden push, a preparatory pull-back of ~3–4% (retreat first, then charge), and a very slow creep of ~2–3% during the wide-shot hold
- Staging of the rebound-version demo (CrashZoomReal): a browser window on a warm-black ember stage (tilted back 11°, orange backlight +
  floor reflection); before the sudden push four orange corner marks close in from 150px outward to lock onto the target card (naming it in the wide shot first), and the sudden push straightens the tilt
  on the same curve; on the arrival frame a warm exposure flash (exponential decay ~8f), the surroundings darken by 86% + a rim light on the target card; once the rebound settles the camera moves smoothly
  left by 320px to yield the card to the left side, and a set of large readouts (232px number + description) lands in the right column, with the last frame a complete poster
- Staging of the crash-stop-version demo (CrashImpactReal): a lime dark-stage "tactical HUD" — the real page cropped into a frontal monitor screen, with a faint grid laid on the stage;
  a fluorescent viewfinder frame scans and jumps cell to cell in the wide shot (card1 → card5 → card4, 8f snappy each), tightens over 28f to lock and lights up a LOCK label before the sudden push
  (0.76→2.35, sub-frame spacing ≤8px, cap 36); the arrival frame is the "impact frame" — outside the card 1f fluorescent → 1f afterglow → near-black (the only whole-picture impact in the film),
  two fluorescent shockwave rings expand from the card edge; the card does not float or glow (slammed solid). After the shake settles a scan line sweeps across the card face once, and the left and right HUD readouts
  (TARGET / OWNER / STATE and a 250px monospaced "P0") land staggered, with a 42f hold in the 126f tail section

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Sudden-push duration | 6f (4–8f) | >10f reads as an ordinary push-in and the sense of impact vanishes |
| Target zoom | 2.4–2.8 | The end composition is judged by the target card occupying 60–75% of the frame |
| Rebound amplitude | 3–6% of the zoom | Too large reads as a spring toy |
| Shake envelope | 14px·e^(−t/1.8) | The amplitude must pass the threshold of the naked eye (perceptibility precedent), and >20px reads as a glitch |

## Known pitfalls
- The end point must be a high-definition texture slot (card4-hires class) — after the sudden push it is stared at in close-up for the whole remainder,
  and a low-magnification screenshot blurs the text (Q2); process the end point first with the high-resolution rasterisation technique of Q2
- Do not mix the two flavours: a shake after a rebound reads as a breakdown; at most 2 sudden pushes per film (the spirit of P4 technique de-duplication)
- The parameters were tuned and corrected on placeholder footage, not battle-tested final values; re-verify after the first real use

## Reference implementation
demos/camera/crash-zoom-punch/
(CrashImpactReal.tsx / CrashZoomReal.tsx)
