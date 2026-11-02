---
name: glass-pill-dictation-typing
summary: A fixed-width glass capsule pops in at about 1.25× slightly oversized and eases down into place, with a layer of accent-colour warm light spread inside it, faint on the left and dense on the right; the cursor leads, and a dictated sentence is then typed out at constant speed, the light (together with the ambient light behind the capsule) gradually receding with the typing progress, ending as a neutral frosted-glass bar
use_when: The entrance of a voice/AI input box; an interaction-prompt shot for "talk to it"; a quiet transition beat between high-energy sections
duration: about 3.3s (100f@30fps)
energy: Low (the quietest beat in the film, only the light is receding)
---

## Intent
Use "the light going out as input arrives" to tell one very small thing: while on standby it glows (waiting for you to speak), and the moment you open your mouth
it yields the light to the text. In 3.3s it does only three things — pop in, type, the light recedes. Any extra motion
(bouncing, colour change, icon animation) stops this beat from being a rest.

## Motion core
- Capsule 1240×132, corner radius 66, `padding: 0 20px 0 58px`, **fixed width** (does not stretch with typing);
  dictated text 56px, a 92px circular sound-wave button at the right end
- Entrance `scale 1.25→1`, snappy (strong ease-out) 20f; opacity is full within the first 2f — first "be there", then settle into place;
  before settling there is 14f of 6px→0 depth-of-field blur (the enlarged section reads as "closer to the lens")
- Material: `backdrop-filter: blur(26px) saturate(1.3)` true frosting (the warm light spot behind it is smeared by it),
  a light-top/dark-bottom white volumetric gradient + 1.5px white outline + highlight lines fading out at both ends of the top edge + a dark inner edge at the bottom + two layers of warm landing shadow
- Embedded accent-colour light: `linear-gradient(90deg, α0 → α.18 @38% → α.62 @78% → apricot α.95 @100%)` faint on the left and dense on the right,
  plus a screen-blended highlight blob at the lower right — the light is **inside** the capsule
- Typing: the cursor leads at f2, characters start at f8 at constant 2f/character to finish 28 characters; the cursor is removed over f66–74
- Light fade-out `g = 1 − smooth(f10→f72)`, in the same window as the typing; `g` drives four things at once: the gradient inside the capsule, the warm "sun" behind the capsule,
  the floor reflection beneath the capsule, and the sound-wave button (solid warm colour → outlined neutral), with outer bloom `60g px`
- 5 sound-wave vertical bars with base heights `[30,16,24,13,20]` (high on the left, low on the right), overlaid with a very light breathing of `±2.4·sin(f·0.5 + i·1.7)`

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Capsule fixed width | 1240px (≈1.8× the width of the whole sentence) | **Fixed width is the key**: stretching with the text reads as a chip rather than an input bar |
| Entrance scale | scale 1.25→1, snappy 20f | 1.25× is the amount for "dropping back from in front of the audience"; 1.5× becomes a pop-up window |
| opacity timing | Jumps to full in the first 2f (earlier than the scale settling) | Fading in in sync makes it look like "gradually appearing", losing that slight sense of substance |
| Embedded light | 90deg, 0 → .18@38% → .62@78% → .95@100% | The light must be inside the capsule; changing it to an outer glow makes it "awaiting a notification" rather than "awaiting input" |
| Typing | 28 characters, from f8 at 2f/character constant speed | Adding an ease reads as "someone hesitating"; dictation is constant speed |
| Light fade-out | 1 → 0, f10→f72 smooth | Being in the same window as the typing is the only causality in the whole film: the light yields to the text |
| Ambient light following | Warm light behind 0.15+0.6g, floor reflection 0.22g | If only the capsule goes out and the environment does not change, the "light receding" cannot be read on a bright stage |
| Sound-wave bars | 5 bars, ±2.4px | An amplitude of 6px becomes the active "recording" state, contradicting "standby" |
| Cursor | Leads at f2, removed at f66–74 | The cursor appearing before the text is the signal that "the input box is ready" |

## Known pitfalls
- backdrop-filter only smears the layer **behind** it: the warm light spot must sit beneath the capsule (drawn first in the same stacking context),
  and when the light spot is too far from the capsule the frosting just looks like a flat white board
- The light/dark contrast of light on a bright stage is far smaller than on a dark stage: the embedded light must be given apricot .95 saturation, and the ambient light behind must recede together,
  otherwise the "light receding" does not hold; for a dark-stage version, switch the stage back to near-black and desaturate the light colour, with no need to change the curve
- The sound-wave bars breathe continuously (not controlled by g), and their heights differ between the first and last frames — when using it as loop footage, set the frequency to an integer multiple of 2π/duration
- Typing progress `floor(p·len + 1e-6)`: that epsilon prevents the last character from failing to appear at a whole number due to floating-point error, do not delete it
- The two variables WARM / APRICOT are the brand colours shared by the embedded light, outer bloom, ambient light and button, and changing projects only requires changing these two
- When the sentence length changes, adjust the capsule fixed width (keep ≈ 1.8–2× the sentence width) and the typing window in sync

## Reference implementation
demos/interaction/glass-pill-dictation-typing/
(GlassPillDictationTyping.tsx)
