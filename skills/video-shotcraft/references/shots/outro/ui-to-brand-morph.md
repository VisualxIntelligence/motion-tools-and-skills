---
name: ui-to-brand-morph
summary: Two variants of UI becoming brand — icon-flip-bloom (the icon flips about the Y axis flat into a vertical line, then opens out from the line into the brand mark, with the amber bevel then sliding in) + wordmark settling character by character, and input-morph-assemble (the input box shrinks into the vertical stroke of a viewfinder, and three primitives drop into construction slots to assemble the complete mark)
use_when: Brand closing / the last beat before the outro; the visual argument that "the UI you use every day is this brand"
duration: A ~4.3s (130f) / B ~5.6s (168f)
energy: Medium-high (an ending flourish, one complete transformation telling the whole story)
---

## Intent
The brand-closing library already has two routes: brand-ink-open is an opening draw-on stamp,
and outro-group-photo-launch is elements gathering around for a group photo (gathering without changing). This card adds a third:
**product UI elements transform into the brand symbol by themselves** — variant A is an icon turning over to become the logo
(an in-place entity swap), and variant B is the input box that appears repeatedly through the film gathering after the last send into the
brand mark (a multi-element landing assembly). What the audience sees is not "the logo appeared", but
"the thing we were just using turns out to be it", and the causal chain itself is the brand argument.

## Variant selection
| Variant | Technique | Use when |
|---------|-----------|----------|
| A icon-flip-bloom | The icon wobbles twice in anticipation → Y-axis scaleX squashes it flat into a vertical line (double-layer trail + blur) → at the thinnest point an entity swap, the mark opens out from the vertical line with an overshoot spring, the amber bevel then slides in along 45° → the mark shifts left to make room, and the wordmark settles character by character | Single-icon products; where the icon and logo differ greatly in form and the magic of "flipping over to transform" is wanted |
| B input-morph-assemble | The cursor clicks send → the text flies away, the mark's ink colour spreads from the send key to flood the input box → the five quantities x/y/w/h/r spring into the vertical stroke of a viewfinder → the top bar / bottom bar / amber bevel drop in staggered from off-screen into the dashed construction slots to assemble the mark → making room for the wordmark | Films where a rectangular UI such as an input box / card is the lead of the whole film; where the logo can be broken down into a combination of geometric primitives |

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| A anticipation | 12–34f tilt -12°/+14°/-18°→0°, inOut(sin), transformOrigin pinned at the bottom 78%; the grounded soft shadow shifts with the tilt and narrows as it flattens | Increasing amplitude is what reads as "winding up"; a single wobble cannot read as preparation |
| A flatten | 34–46f Easing.in(cubic), scaleX 1→0.04; two layers of afterimage opacity 0.22/0.14 + blur 6px lagging by 0.12/0.24 | Accelerating in is the key to the "flick"; a constant-speed flip reads as a flipping card. 0.04 is the thinnest point, and the entity swap is done on this frame |
| A open out | from 46f spring(damping 11, stiffness 130) drives the mark scaleX 0.04→1 (with overshoot); from 53f the bevel spring(damping 16, stiffness 170) slides in along 45° (cutProgress 0→1) | The mark opening out from a closed vertical line is what catches "flipping past the thinnest point"; scaling the whole mark directly breaks the causality. The bevel being 7f later is the second beat, and appearing together with the viewfinder cannot read as an "engraving" |
| A wordmark | the mark shifts left −471px over 64–82f to make room (wordmark start = mark+187, the whole group centred); character by character with 2.6f stagger, 12f per character: scale 1.9→1 + blur 14→0 (snappy), origin pinned to the baseline; wordmark 112px brand typeface 700, +0.03em (mark height ≈ 2.1 times the font size) | Per the original film: each letter lands from large to small, blurry when large and sharp on landing (scale+blur linked, settling character by character), not a horizontal sweep-out; a stagger <2.4f and each character's "large to small" cannot be read clearly |
| B send feedback | the cursor moves in over 20f and presses at scale 0.84 + the button flashes white for 6f; the text accelerates out to the upper right over 11f ease-in (+760,-420) + rotate -9° + trail | The flying away must accelerate — a constant-speed flight reads as panning and not as "sent out" |
| B ink flooding | over 28–40f the mark's ink colour spreads from the send-key position by circular clip-path to flood the input box (solid colour throughout) | Filling colour via an opacity gradient passes through a greyish semi-transparent state; the text must fly away before flooding the colour, otherwise dark text sits on the ink |
| B morph | from 30f spring(damping 15, stiffness 95), 1040×132 r34 → 89×330 right angle (the viewfinder's vertical stroke, the horizontal bar squeezed directly into a vertical bar), the five quantities in sync, adding ≤3px trail by spring velocity; the input box's drop shadow is withdrawn with the morph | The five quantities must be driven by the same spring, and separate interpolation falls apart midway |
| B three-piece drop | top bar / bottom bar / amber bevel at 58/72/86f staggered by 14f, each with spring(damping 13) dropping from -760px off-screen into its slot; 10f before landing the slot first draws a dashed construction frame along the outline (outset 10px), fading out 14f after settling; stretching by speed / rebound squashing (origin pinned at the bottom), with a cast shadow in the air and flat once settled | The stagger is the rhythmic feel of "gathering"; dropping all together reads as rain; without slot foreshadowing, the landing points read as random |
| B settling | from 108f the mark shifts left over 20f to make room and shrinks to 0.7 (making space for the 15-character wordmark), the construction grid exits, the wordmark 110px rises character by character from the baseline (1.5f stagger), the slogan word by word; from 124f the whole group pushes in very slowly by 2% | After settling, if the whole section does not move it is a dead frame; a per-beat scale breathing is easily read as jitter |

## Known pitfalls
- The demo's end-point logo is the video-shotcraft "lens-engraved" mark (A: soft-light bright scene + amber bevel; B: Swiss-grid bright scene + cobalt construction lines) —
  the parameters are a tuning starting point, not a battle-tested final version, and the first real use must be re-verified against real material
- Variant A's entity swap must happen on the thinnest frame with scaleX ≤0.05 — swapping early lets the audience see two shapes ghosted over each other, and the magic gives itself away
- Variant A's wordmark has been changed to character-by-character scale+blur settling, with the stagger 2.2→2.6f; when switching to a longer wordmark, set the interval after watching the film at normal speed according to the perceptibility precedent
- Variant B breaks the mark into four pieces — a vertical stroke (= the input box) + top bar + bottom bar + bevel — in real use replace this with the primitive decomposition of your own logo, with 3–4 primitives being appropriate, and more reads as particles rather than assembly
- In variant B, where primitives of the same colour overlap, anti-aliasing accumulates (the row of edge pixels is darker), producing a 1px step at the seam; once assembled (108f) swap the vertical stroke + top and bottom bars for a single viewfinder path of the same geometry
- Do not layer other animation mid-transformation: the morph itself is all of the information
- Division of labour with outro-group-photo-launch: that one is elements from the whole film flying in to surround the wordmark for a group photo (gathering), this card is UI elements becoming the brand symbol by themselves (changing); choose one of the two for the ending of a film
- Sound: for A, a "whoosh" on the flatten and a "tap" on the open-out settling; for B, a send sound on the send, a pop on each piece landing, and silence in the wordmark section

## Reference implementation
demos/outro/ui-to-brand-morph/
(IconFlipBloomLogo.tsx / InputMorphsIntoLogo.tsx)
Original source: A perplexity-promo 88–91.5s / B slack-promo 40–41s

Implementation status: both variants have reference implementations and Gallery motion samples.
