---
name: brace-expand
summary: A pair of small curly braces pressed tightly together appears at dead centre, then springs left and right with one overshoot and scales up to title size; the text clip width is strictly bound to the inner edges of the braces, revealing the text from the middle like a curtain being pulled open, and after settling the letter-spacing relaxes slightly
use_when: Title cards for developer / technical products; chapter openers; a minimal single beat that needs "one symbol to do the reveal"
duration: about 4s (120f@30fps: cursor 0–6f → 6f small braces hard cut → 14f spring open → 40–64f letter-spacing relaxes → subtitle → hold)
energy: Medium (the single overshoot is the only peak, everything else is still)
---

## Intent
Among title reveal techniques, this card is the most economical: no mask bars, no per-character, no displacement — only a pair of braces
moving apart, with the text being "bracketed out". It carries a code feel by nature (`{}` are curly braces), so in a technical product
context it reads as "this is the content itself". The crux is that the clip width **must be strictly
bound to the brace positions**: once the text fades in or wipes in by itself, the braces degrade into decoration and the curtain feel is entirely lost.

## Motion core
- On frame 0 the centre is a blinking input cursor (editor feel, not an empty frame); at 6f it is **hard-cut replaced** by a pair of 0.4x "{}" with inner edges touching
  (no fade-in), held still for 8f — first establish "this is a pair of braces"
- Spring open `ex = springAt(f, 14, { damping: 14, stiffness: 130 })`: after launch it arrives in ~8f, overshoot peak ≈9% at ~11f, converges by ~24f, one visible rebound
- Simultaneous scale-up `sc = mix(0.4, 1, ex)`; curtain half-width `x = (HALF − INNER)·ex·sc`, brace centre `±(x + INNER·sc)`
  (HALF=676, INNER=64) — **displacement and scale are multiplied together**, so the scale-up itself also pushes the braces apart; at ex=0 the inner edges of the two braces just touch
- Text reveal width `clip.width = 2x` (strictly bound to the brace inner edges), 14px feather on each side (when the clip is narrow the feather shrinks with it)
- The text simultaneously gets `scale(sc)`, sharing the same sc as the braces; after settling the letter-spacing relaxes from −0.05em → −0.03em (40–64f smooth) — "taking a breath"
- Finish (midnight): monospaced 300px electric-blue braces + bloom (the bloom peak follows the overshoot and falls back over 34–64f), and the fast part of the spring open adds directional
  motion blur based on horizontal velocity (amount 0.22, capped at 16, zero once settled); the title (in the demo the brand name video-shotcraft, all lowercase) 164px weight 800 white→cool-blue gradient; background editor dot grid (32px, radial fade) +
  top light + horizon light band, and below the braces a cool-light reflection that widens as they spring open
- Aftermath: the eyebrow `// shot recipes for your agent` (monospaced 32px cyan) enters from 44f with letter-spacing tightening, the subtitle (brand tagline Frame motion. Craft the shot.) surfaces word by word with defocus from 54f; over 70–120f the whole frame pushes slowly 1→1.012
- Positioning is all absolute (braces / clip box / text all compute left off the 960 centreline), **no flex**: the width changes throughout, and flex would reflow

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Brace appearance | 6f hard cut replaces the cursor | The hard cut is right (the symbol is simply there, "pop"); changing to a fade-in loses the few frames of "see the braces first", and the spring open feels abrupt |
| Spring open | spring from 14f, damping 14 / stiffness 130 (≈9% overshoot) | The overshoot is the film's only peak; damping ≥18 reads as a slide-open with no "stretching" force; <12 rebounds twice and reads as jelly |
| Half-distance | HALF = 676px (brace centre), INNER = 64px (brace centre to inner edge) | Determines the width the title can hold: inner cavity = 2·(HALF−INNER) = 1224px |
| Scale | `mix(0.4, 1, ex)`, braces 300px / text 164px | 0.4 is the amount of "small type"; a start >0.8 shows no scale-up, <0.3 and the braces start so small they look like punctuation |
| Copy width | "video-shotcraft" at 164px measures ≈1130px once settled (cavity 1224px minus the feather on both sides) | If the text is much narrower than the cavity, it is fully exposed before the braces arrive and the curtain feel weakens; if wider than the cavity, both ends are cropped |
| Letter-spacing relaxation | −0.05 → −0.03em, 40–64f smooth | This step is the "breathing after settling"; the text gets wider after relaxing, so it must stay within the cavity |
| Motion blur | SpeedBlur amount 0.22 / max 16 | At amount 0.35 the peak-frame braces smear into three horizontal lines and can no longer be recognised as braces |

## Known pitfalls
- **Copy length must match HALF**: the clip only crops and does not scale — with a long title the braces will crop both ends of the text,
  so HALF must be increased (or the font size reduced) accordingly; Chinese title glyphs are about twice as wide as English, and 6 Chinese characters is already near the limit
- The clip width grows from 0, so the text **always appears from the middle outwards**: the
  visual centre of gravity of the copy should be at the centre (a centred single short line is best), and long-short lines that are asymmetrical left to right will be revealed awkwardly
- The braces and text must share the same `sc`: writing two separate scale curves (even with the same values)
  produces a mismatch in the overshoot frames where the braces are already in place and the text is still growing
- The overshoot happens only once: all other motion in the film has no overshoot, which concentrates attention on the "stretching"
  action; stacking another back / spring overshoot on top devalues it
- The clip box height is hard-coded at 220px (title 164px leaves margin above and below); when the font size changes a lot, update it in step — otherwise the top and bottom get cut
- Sound: the spring-open moment deserves a short mechanical / wooden open-close sound, and silence after settling;
  for the scoring discipline see sound-design.md

## Reference implementation
demos/typography/brace-expand/
(BraceExpand.tsx)
