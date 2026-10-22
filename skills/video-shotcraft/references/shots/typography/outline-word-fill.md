---
name: outline-word-fill
summary: A hollow word (thin warm-grey outline, weight 500) lands from a 3.2x sharp-then-slow shrink, a large dashed circle then closes in from 2.8x to surround the word and rotates slowly, with horizontal dashed lines extending inward from the frame edges left and right; the outline brightens slightly first, then a solid white-hot fill hard-cuts on within one frame, a flash of glow, and it freezes
use_when: A hammer-blow beat for a single-word benefit / slogan; a "nail" shot on a rhythm hit; an emphasis frame in a brand film on a dark ground
duration: about 3.0s (90f@30fps, a short single beat + 36f settle)
energy: High (3.2x shrink + instant light-up, short high impact)
---

## Intent
To drive a word in like a nail, what works is not a slow fade-in but **two settlings**: first a huge hollow word
shrinks rapidly into place (the settling of size), then the outline turns solid white within one frame (the settling of
texture). The 1.5s of dashed-circle shrink and horizontal dashed-line extension in between is a "aiming" process — a technical
drafting vocabulary that makes the light-up read as "confirmed". The fill **must be instantaneous**: a slow sweeping fill turns
the nail into a slow beautifying animation.

## Motion core
(The demo uses 1920×1080 native coordinates, calibrated in frame numbers; look = ember warm black · orange)
- Hollow word sharp-then-slow shrink: `scale = mix(3.2, 1, ramp(f, 2, 11, EASE.snappy))`, fading in over 2–8f —
  **the shrink window is only 11f**, so fast it is nearly a single impact; momentary defocus by scale velocity (zero once steady)
- Two-layer text: `outline` (`color:transparent` + `-webkit-text-stroke:2px` warm grey) and `solid`
  (white-hot #fff5ee, initial opacity 0) stacked, 220px / **weight 500** Helvetica Neue
  (a medium weight, not the title's 800 — hollow text that is too heavy smears into a block)
- Dashed large circle (r=410, `dasharray 22 18`) + an inner 72-division tick ring (a long tick every 30°, turning slowly in reverse) + four registration ticks:
  fade in over 8–18f, `scale 2.8 → 1` slowly closing over 8–52f (EASE.out, **44f, the slowest curve in the film**); the main ring rotates at 0.22°/f,
  braking to a stop at the moment of light-up ("locked"), while the inner ring keeps turning slowly so the hold section still breathes
- Left and right horizontal dashed lines (`dasharray 14 12`): extending inward from the frame edges over 28–46f to 28px outside the circle edge, with a crosshair dot on the line end;
  above the lines mono readouts "BEFORE 1 week"/"AFTER 4 hrs" — telling "faster" as a set of before/after data (a week of hand keyframing vs an afternoon to a finished film with video-shotcraft)
- Outline pre-warm: 44–53f warm grey → bright orange-white with a little outer glow, giving the hard cut a "charging" prelude
- **Instant fill**: at frame 54 `lit = frame >= 54 ? 1 : 0`, with solid and outline opacity hard-cut, no intermediate state;
  in the same frame the circle / horizontal lines lock to orange and the right-hand readout turns orange
- A flash-and-gone glow: `flash = lit · (1 − ramp(f, 54, 8))`, two text-shadow layers of white 14px + orange 60px, after decaying over 8f
  only a very faint orange halo remains; a shock ring expands outward 160px from the circle edge and dissipates over 14f (only once); the stage key light pulses once in sync
- Settling: over 56–70f the in-circle eyebrow (small video-shotcraft logo + all-lowercase mono wordmark) / subline (40px, "One prompt to a finished promo.") rise, 70–90f hold, with a very slow push-in 1→1.015 throughout

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Shrink | `scale 3.2 → 1`, window 11f, snappy | 3.2x is the amount of "stepping back from in your face"; <2x reads as an ordinary scale; a window >20f becomes a slow zoom and the impact is lost entirely |
| Font weight and size | 220px / **500**, taking about a third of the frame width | 700+ on hollow text makes the thin outline enclose a big patch of emptiness, reading as balloon letters; 500 is the sweet spot for hollow text |
| Outline | 2px warm grey (138,118,104), pre-warmed to bright orange-white before light-up | A thin outline is the "drafting" vocabulary; >4px becomes a doodle; delete the pre-warm step and the hard cut seems unmotivated |
| Dashed circle | r=410, `dash 22 18`, scale 2.8→1 (44f), 0.22°/f rotation, braking to a stop at light-up | The 44f slow shrink is the film's "breathing", forming a fast-slow contrast with the 11f word shrink; compress the window to 20f and the two collide |
| Horizontal dashed lines | `dash 14 12`, extending inward over 28–46f to 28px outside the circle edge | The inward-extension end point must stop outside the circle edge (not enter the circle); extending the full width reads as a crosshair, which is overdone |
| Instant fill | hard cut at frame 54 (decided by frame, not a normalised time window) | **This one beat is the purpose of the whole card**: any form of slow sweep (>3f) downgrades the nail into a beautifying animation |
| Glow | white 14px + orange 60px, decays over 8f; shock ring 14f | Flash-and-gone is what feels like "lighting up"; a sustained glow reads as a glowing typeface and the finish immediately turns cheap |
| Duration | 90f (3.0s): 36f hold after light-up | Less than 20f after light-up and the audience cannot read the subline and readouts |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **Suitable only for a single short word (demo `Faster`, 6 letters)**: font size 220 and dashed circle r=410 are a hard-coded
  set of coordinates, and a longer word pokes through the circle and the inward-extension end point of the horizontal dashed lines would also land on the word — switching to
  two words or four Chinese characters means adjusting `SIZE` / `R` / the inward-extension end point in step, in three places
- `-webkit-text-stroke` is a prefixed property that only takes effect in Chromium/WebKit; under Firefox the
  outline layer is fully transparent (the word does not appear until the light-up frame). Remotion runs on Chromium so it is no problem
- The instant fill must hard-cut by **frame** (demo `frame >= POP`). An early version used a normalised time window `seg(0.742, 0.762)`,
  and once the film length was stretched this window turned into a visible gradient of several frames — when changing the duration, only move the `POP` frame number
- Dark ground only: warm black ground + thin outline + glow is the whole of the effect; on a light ground the hollow text
  is almost invisible and the whole set needs re-matching
- Sound is heavily relied upon: the light-up frame must have a short heavy accent (metal / switch / low-frequency impact),
  which is half of this card's "nail" feel, for the scoring discipline see sound-design.md; division of labour with
  word-relay-geometry: that card is a three-word relay (this card is the independent version + upgrade of its first segment),
  and the two are not placed side by side in the same film

## Reference implementation
demos/typography/outline-word-fill/
(OutlineWordFill.tsx)
