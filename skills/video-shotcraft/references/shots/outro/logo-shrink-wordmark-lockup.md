---
name: logo-shrink-wordmark-lockup
summary: A large neon cut-out ring quickly closes into a small solid white O at the centre, swapping to the video-shotcraft logo on the overshoot brake, the icon shifting left to make room, the wordmark letters sliding in one by one to complete the lockup, closed with an accent-colour tagline
use_when: Brand styling at the end of a film: closing from full-screen graphic energy into a standard "icon + wordmark + tagline" lockup
duration: about 4.4s (132f@30fps; closing 0.1–1.2s · making room 1.5–2.1s · letters 2–2.7s · tagline 3.2–3.7s)
energy: Medium (the closing segment has impact, and the whole is a steady settling rhythm)
---

## Intent
The "stamp" action of an ending: a full screen of neon ring collapses with energy into a small icon, heals its gap and turns pure white (from performance state to standard state), and then lands step by step according to the brand lockup specification — the icon makes room, the wordmark enters, the tagline closes things out. What the audience sees is the brand "standing firm" out of motion.

## Motion core
- Main closing curve: scale 5.4→1 (t=0.02–0.28, inOutCubic), with a `sin(π)*0.06` overshoot brake layered over t=0.26–0.37 — at the moment of arrival it swells 6% and then falls back, "a sudden stop with inertia"
- Gap healing and colour change on the same track as the closing (t=0.10–0.28): the neon glow layer fades out, the stroke goes from #dfe9ff halfway to #fff, and the solid white O fades in — the three layers cross over during the shrinking, so by the time it lands it is already a clean white mark
- At t=0.24–0.32 the white O crossfades into the video-shotcraft "lens-engraved" logo (the reversed-out white version, on the same beat as the brake and shockwave; by the time of the swap it has already shrunk to its final size); the ring rotates on the inner layer, while the outer layer holding the logo only scales and does not rotate — the bevel angle never changes
- At t=0.34–0.47 the icon as a whole shifts left to make room (inOutCubic, −90.5px = half the width of the whole lockup minus half an icon), clearing the right of the central axis for the wordmark
- The wordmark `video-shotcraft` (15 characters, 22px / 700, all lowercase) slides in with a stagger of `0.46 + i*(0.24/15)`: opacity 0→1 + translateX 8px→0, each with a 0.10 duration outCubic
- The tagline is the brand short phrase `FRAME MOTION. CRAFT THE SHOT.` (accent colour `ACCENT`, 12.5px wide letter-spacing) fading in as a whole line at t=0.72–0.84, not character by character — one level below the wordmark in hierarchy

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Closing amplitude | scale 5.4→1 | The starting multiple determines "how full to how small it closes"; <3 lacks impact, >7 and the initial state smears out of frame |
| Brake overshoot | +6%, sin envelope 0.26–0.37 | Cutting it reads as a hard freeze; >10% turns to jelly |
| Healing window | 0.10–0.28 (in sync with the closing) | Healing must complete before landing — still changing colour after landing reads as "not ready" |
| Left shift to make room | −90.5px (derived from `WORD_W`/`GAP`/`ICON`), 0.34–0.47 | Joins almost seamlessly with the letters' first entrance (0.46), and opening up a gap gives a feeling of "idle waiting" |
| Letter stagger | `(0.7-0.46)/n` (15 characters = 0.016/character), each 0.10 duration | A short word of 5 letters can be relaxed to 0.035/character; with many characters work the interval backward from `(0.7-0.46)/n` to ensure all have started running before 0.7 |
| Tagline entrance | 0.72–0.84 whole-line fade-in | Deliberately not character by character: the tagline is a footnote, not the lead; swap the `ACCENT` constant for the project colour |

## Known pitfalls
- `WORDMARK` = `BRAND.name`, tagline = `PITCH.en.motto`; when changing the brand word the letter stagger rhythm depends on the character count (already worked out automatically by character count), and when the tagline character count changes adjust the letter-spacing in step, otherwise the wide-spaced typesetting overflows or is too sparse
- The icon is a two-layer "performance state → standard state" structure: an SVG double-arc cut-out ring (glow / coloured) heals into a white O, then on the brake crossfades into the video-shotcraft logo (clean state, no glow added); when switching to another logo likewise do not let the logo rotate along with the ring
- The left-shift amount is coupled to the wordmark width: `WORD_W` is the measured width of the wordmark row (re-measure when changing font / size), and `SHIFT` and the letter row's left edge `ROW_LEFT` are both derived from it, keeping the lockup as a whole centred in the frame
- There is no looping return-to-start design after the ending, so use it as the last shot of an outro; when a loop is needed, follow t=1 with a 1s still frame

## Reference implementation
demos/outro/logo-shrink-wordmark-lockup/
(LogoShrinkWordmarkLockup.tsx)
