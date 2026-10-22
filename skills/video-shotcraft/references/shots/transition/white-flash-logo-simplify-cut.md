---
name: white-flash-logo-simplify-cut
summary: A liquid-metal-textured colour wordmark rests with flowing light, and after a wind-up a white flash blasts out from the centre of the letters in an overexposure; when the exposure falls back, the same position holds the flat version of the wordmark — one white flash completes the texture downgrade
use_when: Closing a brand section (ornate showpiece → clean finishing); a transition beat where the mood switches from showing off to a formal announcement
duration: about 4s (120f@30fps; showpiece 0–34f · wind-up 34–46f · white surge 44–54f · exposure fall-back 54–76f · lock 72–96f · hold to 120f)
energy: Medium-high (a single pulse-like accent, with stillness before and after)
---

## Intent
First give ample ornateness (iridescent liquid metal flowing across the letters, one diagonal highlight sweeping past), then use a single white flash to "purify" it into a flat single-colour wordmark — what the viewer reads is "the performance is over, and this is its formal image". The downgrade is a rhetorical device: switching from sensory texture to rational recognition. The two versions share the same font size and position, reading as "the same wordmark purified", not as a different picture swapped in.

## Motion core
- Liquid layer (the demo wordmark is the video-shotcraft wordmark "video-shotcraft", wordmark font 190px 700 weight, all lowercase, centre y=500): one span stacks four background layers, all with `background-clip:text` —
  ① iridescent base colour `background-size:300%` flowing slowly at 1.1% per frame ② vertical volume (bright top, dark bottom) ③ a chrome-plated reflective band at the waist of the letters ④ a diagonal highlight
  sweeping through once over 6–34f (Q4: given to the hero only once, clipped into the letterforms); a same-colour bloom under the letters (blur 38px) + a flipped ground reflection (0.22, fading mask); the whole frame slowly pushes in 1→1.035 over 0–44f
- Wind-up 34–46f (EASE.exit getting faster and faster): wordmark brightness 1→1.7, bloom strengthened; a horizontally deformed flare pulls out from the centre of the letters (wide soft halo + a 4px thin bright core, with the core's two ends fading out)
- White surge 44–50f: a radial white mass fills the whole screen from the centre of the letters (radius 80→1580px, quadratic ease-in, visibly swallowing the wordmark over the last 3 frames); 50–54f pure-white hold (breathing space), with the scene swapped at 50f at full white
- Exposure fall-back 54–76f: white layer 1→0 (quint-out, fast then slow, like the eye adapting to strong light) — the flat wordmark underneath has long been in place, doing only a 1.03→1 focus tightening
- Lock: a 96px amber short line drawn from the middle over 72–86f, the mirror-engraved logo above the wordmark traced on over 74–96f (the viewfinder frame uncovered first, the amber slash drawn in after), the brand line "Frame motion. Craft the shot." rising word by word (from 78f); 96–120f a very slow forward push 1→1.01

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| White-surge window | 44–50f radial fill (t² ease-in) + 50–54f pure white | The white surge must be "fast forward"; a uniform fade-in over the whole screen reads as an editing soft cut, and only a blast from the centre of the letters reads as "the type glowing and overexposing" |
| Wind-up | 34–46f, brightness ×1.7 + horizontal flare | Cut the wind-up and the white flash has no foreshadowing and looks like a dropped frame; adding a box-shadow to the flare core brings a ring of dark edge (measured) |
| Exposure fall-back | 54–76f, white layer retreating with quint-out | Using a fade-in of the flat wordmark in place of the fall-back produces a second action of "a word floating up out of white"; the fall-back makes the wordmark "always have been there" |
| Flat entrance | 1.03→1 (snappy, 52–78f) | >1.06 reads as the wordmark popping out; doing a fade-in at the same time stacks with the fall-back into two reveals |
| Wordmark size | Liquid / flat both 190px, same centre (a 15-character wordmark with font size set by the frame width; a short 4-letter word can go up to 300px) | If the two versions differ in position or font size, it reads as changing the skin and not the person |
| Brand constants | `PAPER` / `FLAT_INK` / `FLAT_ACCENT` (defined at the top of the block; the demo has been incorporated as video-shotcraft's cutting-room paper / set ink / lens amber) | Swapping in the project's brand colours completes the incorporation; the liquid layer's iridescence is generally kept (it is "performance", not brand); the logo appears only in the flat segment and does not take the liquid texture (the brand guidelines forbid gradients/glow) |

## Known pitfalls
- The scene change happens on the fully white frame at 50f (the dark field and the paper surface are rendered as an either-or), and the white layer must not retreat before 50f — otherwise both scenes are visible at once
- `WORD` = `BRAND.name` (15 characters), and changing the word requires adjusting the font size `FS` in step; the liquid layer / bloom / reflection / flat layer all share `wordStyle` and `wordText`
- With +0.03em tracking on the wordmark the two horizontal strokes of "ft" just touch, and at large font sizes the join shows a hairline of anti-aliased bright line — the demo zeroes the tracking after the f so the two strokes overlap
- Pairing the white surge with SFX is mandatory (impact/whoosh-bright types), and a silent white flash reads as dropped footage frames
- The highlight must be clipped into the letterforms (background-clip:text) — if made as a radial light spot overlaid on the type it overflows the letterforms and smears into a white haze on a black background (Q4 light overflow)
- The second half's background is a bright paper surface — if the next shot is a dark field another transition is needed, or reuse this card's ending for a direct cut

## Reference implementation
demos/transition/white-flash-logo-simplify-cut/
(WhiteFlashLogoSimplifyCut.tsx)
