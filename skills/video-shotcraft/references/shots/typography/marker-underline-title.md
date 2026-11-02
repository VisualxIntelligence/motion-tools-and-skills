---
name: marker-underline-title
summary: After the big title settles, a marker underline beneath the keyword is drawn rapidly from left to right — a variable-width pen shape, rough edges, a slight upward slant following the italic text's momentum, hugging the bottom of the letters
use_when: Emphasising a single keyword in a title (new/free/AI…); a handwritten / human-touch brand tone; annotation-style emphasis in body text
duration: pen down 4~8f after the title settles, underline stroke 8–12f, 1–1.5s in total
energy: Low (one stroke to finish the point, not stealing the title's scene)
---

## Intent
A single hand-drawn marker stroke suddenly appears in a printed-type title, using the contrast of materials to pull one word out of the
typesetting — like a person circling the key point on a poster with a pen. Three crux points: **fast**
(8–12f in one go, slower reads as a loading bar), **close** (hugging the bottom of the letters, farther away
it reads as a divider rather than emphasis), and **following the text's momentum** (the underline of an italic word must slope slightly up, low on the left and high on the right
— drawing the slant the wrong way is the easiest mistake to make and an instant giveaway, see Known pitfalls for the precedent).

## Motion core
- SVG path drawing (strokeDashoffset or a clipping window), left to right over 8–12f,
  ease-out with a slight finish (fast pen-down, slightly slower pen-up = hand force)
- Pen shape: the path varies in width (widest in the middle), edges rough (slight noise perturbation / a rough brush
  texture), with slightly thinner ends = pen-down and pen-up
- Position: hugging the bottom of the letters (bottom offset ≈ -0.1em), the central axis slanting slightly upward following the italic text's momentum
- Timing: the pen goes down 4~8f after the title has fully settled — the underline is "emphasis after reading the title",
  and moving together with the title steals its scene
- Finish (demo): the stroke passes through a deterministic dry-brush filter — low-frequency feTurbulence displacement (1.8px) for rough edges,
  high-frequency noise thresholded and stretched along the stroke direction for fine dry-brush streaks; the ink is warm near-black multiplied into the paper surface
- The demo exports `MARKER_UNDERLINE_TITLE_DURATION = 75`: the two title lines settle staggered by 22f → f32–42 underline → still for 33f

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Underline duration | 10f (rhythm measured from the original film; the 14f version was criticised as slow) | >14f reads as a progress bar; <6f and the stroke direction cannot be seen |
| Distance from letter bottom | ≈-0.1em (pulled in from -40 to -20@1080p to hug the text's momentum) | Farther away reads as a divider; touching the descenders is messy again |
| Slant | slightly upward, low on the left and high on the right (following the italic) | **Drawn the wrong way (high left, low right) is an instant giveaway** — a rework precedent |
| Stroke width | middle ~0.12em, ends ~0.6x | Equal width reads as a machine line; a difference >2x reads as calligraphy |
| Roughness | light noise on the edges | Too rough reads as a glitch; fully smooth reads as a CSS border |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Overlaps in territory with draw-svg-trace (deliberately listed as two cards): that one is general-purpose
  SVG drawing (icons / illustrations / any line art); this card is dedicated to the marker texture of **text emphasis**
  (variable width + roughness + following the text's momentum), and for graphic drawing use that one
- Slant precedent: v1 with high left and low right was caught in the comparison stage — the underline slant must follow the text's momentum,
  and for upright type use a slight horizontal wobble
- Residual gap: in the original film (notion-ai) the dry-brush grain at the pen tip is finer and more fragmented, and real use can add
  finer brush noise

## Reference implementation
demos/typography/marker-underline-title/
(MarkerUnderlineTitle.tsx)
Original source: notion-ai.mp4
