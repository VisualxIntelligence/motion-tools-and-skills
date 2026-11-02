---
name: text-as-mask
summary: Text as a video mask — extra-bold headline letters are cut out of a porcelain-white stage, and a dark live product panel drifting slowly shows through inside the letters; at the end, after a held breath, the letterforms rush in exponentially and enlarge 46× to overflow the frame, the picture inside taking over the full screen
use_when: An opening or chapter card that merges a brand word/slogan with product footage; the text is the door, the product is inside the door
duration: 165f (entrance 18f + drift inside the text 78f + intake of breath 8f + rush-in takeover 24f + settle/hold 37f)
energy: Medium-high (steady in the drift section, one burst in the takeover section)
tags: typography
---

## Intent
Headline and product footage fighting for the screen is an old problem — text first and then picture is slow, picture over text is cramped. This pattern
makes the two one body: the letterform is the mask, the product shows only through the strokes, the audience reads the word and the picture
texture at the same time; at the end the letterform swells and overflows the frame, and the product naturally takes over the full screen — "walking from the brand word into the product"
told in a single shot, doubling as a chapter transition (the same family as the transition-travel A letter-counter fly-through:
there the camera drills into the counter, here the letterform swells by itself; the former is camera motion, the latter is door motion).

## Motion core
- A bright stage (porcelain cool white + key light + vignette) + an SVG white-text-on-black data-URI handed to CSS `mask-image`, with the mask layer wrapping the product footage;
  beneath the letterform sits a hue-tinted blurred drop shadow in the same letterform (also via a data-URI image), so the letters look like a window "carved" into the stage
- The content inside the window needs large blocks of saturated colour and bright lines: the demo is the video-shotcraft dark render dashboard (cobalt-blue → cyan streaming area chart flowing continuously left, a rendered-frame count counter, a render-queue bar chart breathing; the eyebrow is the video-shotcraft wordmark, the subtitle is From one prompt to a finished launch film.),
  and during the drift the panel moves up 110px so a bright line runs exactly through the waist of the letters and the area gradient fills the lower half of the letters — a white card / light UI showing through white-background letters would read as ordinary text
- Entrance: the mask wipes up from the baseline (clip-path bottom edge retracting, 16f) + settles from 1.04→1; the eyebrow tracking tightens, and the subtitle rises
- Drift inside the text: product layer scale 1.32 + translateX +150→-150 (f18–96, bezier(0.3,0,0.7,1) gentle at both ends) —
  the letterform is still, the content flows, and the illusion of "a world outside the window" is the technique itself
- Intake of breath: f96–104 the text 1→0.965 (swift), the eyebrow/subtitle exit on ease-in — preparation before the big move
- Rush-in 24f (f104–128): mask wrapper `scale(0.965→46)`, interpolated in log space by t^1.8
  (`S = s0·(46/s0)^(t^1.8)`, with the magnification ratio growing every frame = the further it goes the faster it rushes);
  **the transform-origin must be pinned inside a solid stroke** (the demo takes the centre line of the L vertical stem, 1236,546) — pinned inside the letter counter's hollow, what shows through after enlargement is the base colour;
  during the rush-in the wrapper also translates by `(960−Ox, 540−Oy)·t`, pulling the vertical stem back to the frame's centre line (otherwise the right-of-centre vertical stem would only cover the left edge at 30×)
- Counter-compensation on the content layer: wrap a layer of `scale(1/S) translate(−d)` (same origin) to cancel the wrapper's enlargement and translation, so the product footage
  does not warp with the mask geometry; the panel simultaneously goes 1.32→1 with the drift returning to zero (expo-out, f104–132, converging 4f later than the rush-in = following)
- Takeover insurance: another unmasked full-screen layer sharing the same translate/scale transform is stacked on top, fading in only after the vertical stem already fills the full screen (t^1.8 ∈ [0.86, 0.95], S≈24×)
  — fading in earlier would stack a layer of semi-transparent grey gauze on the bright base
- Ending: f132–165 the full-screen panel holds, with the streaming chart still flowing slowly (the product is alive, not a dead frame)
## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Font size / weight | 470px / 900 (system-ui Black, tracking −22) | The strokes are the viewport — a thin weight is like squeezing the product into a door crack; text width takes ~72% of the frame |
| Drift speed | ~3.8px/f (300px/78f) | Too fast and the picture inside the text cannot be read clearly; pick the drift direction along the axis where the picture is dense with information |
| Intake of breath | 8f, 1→0.965 | A rush-in without an intake of breath reads as "suddenly swelling"; >0.94 reads as the text shrinking away |
| Magnification | 46× (matched to the vertical-stem width / frame ratio: an 88px vertical stem needs ≥24× to fill the frame) | If insufficient, afterimages of the letter edges are still visible on the takeover frame |
| Rush-in curve | Log space t^1.8, 24f | Linear log = constant-speed rush; an exponent >2.5 barely moves in the first half and swells violently in the last 3f |
| Ending | Hold ≥30f after takeover | R1; on the takeover-complete frame the product should land in the standard composition |
## Known pitfalls
- The demo uses the video-shotcraft render dashboard designed for the shot (Render throughput, with the brand mark in the sidebar) — when swapping in real screenshots, first check whether what shows through the strokes is large colour blocks and bright lines;
  light pages must first be darkened or switched to a dark theme, otherwise the letters do not read as a "window"
- Do not give the letterform a stroked highlight: the glyphs of variable fonts such as system-ui are assembled from overlapping outlines, and a stroke will draw the internal contour lines such as the crossbar / top corner of the A
- The product footage showing through the text is stared at in close-up the whole time — real footage must first go through the
  high-resolution rasterisation technique of aesthetic rule Q2, otherwise a low-magnification screenshot smears into a blur inside the strokes
- After changing the word / font the hand-derived origin value is bound to fail — after rendering, check the enlargement direction, and if the hole is not centred, fine-tune the
  origin (same as the counter-centre drift pitfall of the transition-travel A letter-counter fly-through)
- Do not use it in the same film as the transition-travel A letter-counter fly-through — both are "a world growing out of text",
  and the audience reads it as the same trick used twice (P4)
- The mask layer's and the content layer's transforms must be driven separately (wrapper enlarges / content counter-compensates);
  merged into one layer, the product swells together with the letterform into a 26× scrap

## Reference implementation
demos/opening/text-as-mask/
(TextAsMask.tsx)
