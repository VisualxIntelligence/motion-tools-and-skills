---
name: magician-card-flourish
summary: On a midnight-blue dark stage a blue starburst flashes for 0.3s (X-shaped needle beams rotating 90° + a centre glow radiating small rays), and a card is fired out of the flash point — spinning extremely fast along an arc toward the camera, the spin decaying as it approaches, then an instant hard freeze (card height 86% of frame height), a light pulse + sheen sweep, and the copy on the right revealed line by line afterward
use_when: A magical entrance for a single card/poster/cover (title-sequence key visual, product card reveal); pure black dark stage; a burst that needs the ceremony of "conjuring it out"
duration: 156f (flash 0.3s + flight 1.6s + freeze/sweep/copy reveal + hold 3.3s; whole section 5.2s)
energy: High (a one-off burst, still once frozen)
tags: ui-entrance, effects
---

## Intent
A magician flicking a card: a blue starburst flashes past, and the card seems to be conjured out of the light — fired from the extreme far distance at the
centre of the frame (visually a small dot), it spins extremely fast along an arc toward the camera,
and hard-freezes at the instant it reaches the centre into a near-full-frame display. Three crux points for the magic feel: **flash first**
(the light is the ceremony of the "conjuring", 0.3s, short and crisp), **launch rhythm** (take off slowly to build force →
suddenly accelerate and kick out → decelerate along the arc to arrive, slow-in → burst → decelerating arc), and
**freeze means still** (no deceleration tail, no rebound; 13 whole turns of spin guarantee that the freeze lands exactly face-on).

## Motion core
- Opening starburst (the final form after the user's reference image IMG_2505 converged round by round):
  - X-shaped **diagonal** needle beams (starting at -38°/52°), which **rotate dynamically through
    90°** (easeInOut) as a whole during the flash; long axis 840 / short axis 420 (ratio 2:1)
  - Beams are pure saturated blue (#3f9bff→#2277f2 along the full length, with the white section kept only at the root 5%),
    each axis in three layers: a wide soft glow envelope + a bright main beam + an overexposed thin core
  - The centre is **not a white ball**: a tiny bright dot (26px) + a blue glow halo (140px) + a ring of
    10 radiating short spikes of alternating lengths (slowly counter-rotating against the starburst)
  - Rhythm: brightens over 2.5f → a slight flicker → collapses, done in 9f (0.3s)
- Launch flight: the flash point = the landing point (left third of the frame, cx=700), departing from the extreme distance (scale≈0.11),
  with true perspective scale=F/(F+z) (z 14000→0); travel curve slow-in (the first 14% of the time covers 6%)
  → slope jump into the launch → easeOut(cubic) deceleration; a sine single-arch arc swings out to the upper right (passing through where the
  copy will later sit) and then returns to the landing point; during flight the card carries a ring of blue glow, dragged into a light tail by motion blur
- Spin: 13 whole turns around the card's diagonal axis; for the first 40% of travel it is near-constant and extremely fast, and for the last 60%
  the angular velocity decays by a 2.4 power (the closer to the camera, the slower it turns), the whole-turn count guaranteeing a face-on freeze
- Freeze: f=57 (TAKEOFF+48) fully frozen, card height ≈86% of frame height; at the instant of landing a ring of blue light pulse in the same shape as the card
  expands outward from the card edge and fades (22f), while the backlight behind the card and the stage key light come on together (the stage is dimmed during the flash,
  so the starburst is the only light source)
- Sweep: 8f after the freeze settles, a sheen diagonal band sweeps once from left to right (screen blend, clipped to the rounded corners)
- Card face: a deep-navy video-shotcraft "Launch Film" premiere ticket — brand row (mark + lowercase wordmark), the centre
  video-shotcraft mark held on concentric thin rings + crossing needle lines (the opening starburst "staying on the card"; the rings and needle lines start from the outer edge of the mark,
  and do not pass through the opening of the viewfinder frame), 58px large title (≈100px after the freeze), a mono ticket-stub row; a layer of
  holographic foil sits under the mark in the badge area, its hue rolling with the spin angle (shimmering in flight, frozen once frozen); the centre of the card back is also the mark
- Copy on the right (after the freeze): eyebrow NOW SHOWING with tracking tightening at 63f → 132px title "Craft / the shot." two lines rising at 67/74f →
  36px subcopy "Cinematic product videos, crafted by your agent." word by word at 86f
- The card is laid out at the frozen size (×1.72) and rasterised with CSS zoom, with flight only shrinking it — the text is sharp in the frozen frame (Q2)

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Flash duration | 9f (0.3s, a value precisely set by the user; it was squeezed shorter round by round from 1.5s→0.8s→0.5s) | The light is the ceremony, not the protagonist; >15f and it steals the card's scene |
| Starburst rotation | Rotates dynamically through 90° during the flash (precedent: a static angle was judged "I didn't see the rotation") | The rotation must be visible frame by frame; >120° reads as a propeller |
| Beam colour | Pure saturated blue along the full length | A white section that is too long / a falloff that is too fast was judged "not faithful enough"; a greyish cyan-blue was judged "I want blue" |
| Centre | Small bright dot + glow + radiating short spikes | **A white round ball was rejected** — the centre is an optical glow, not a solid ball |
| Launch curve | slow-in 14% → burst → decelerating arc | Constant speed or a pure easeOut has no "launch" wind-up |
| Spin decay | 2.4-power deceleration over the last 60% of travel | Constant speed all the way was judged "it should decay with distance as it nears the camera"; the whole-turn count = the guarantee of a face-on freeze |
| Freeze size | Card height 86% of frame height (the right side is left for the copy) | The first version at 1.0x was judged "closer and bigger, basically reaching the upper and lower limits"; with a single centred card and no copy it can return to 94% |
| Hard freeze | Fully frozen, zero rebound | The magic feel = instant stillness; a rebound reads as a physics toy |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- **The light-effect finish precedent chain** (a global methodology this card contributed): geometric colour blocks were judged "a cheap effect" →
  redone with optical realism → game-like + realistic → the user gave a reference image and it converged in one round.
  Feedback about finish loses a lot in words, so **proactively ask the user to drop in a reference image**
- Engineering pitfall: the thin needle beams **must not be put inside CameraMotionBlur** — the rotation is split by the blur sampling
  into striped ghost copies (a hidden source of the "cheap look"); render the flash layer independently of motion blur
- Engineering pitfall: the starburst SVG viewBox must be ≥ beam length + rotation sweep radius, otherwise the end points
  are cropped into straight edges
- Division of labour with card-flip-reveal/deck-deal-flyin: those two are multi-card rhythm pieces of flipping / dealing cards;
  this card is the magic ceremony of a single card "conjured out", conjuring one at a time

## Reference implementation
demos/opening/magician-card-flourish/
(MagicianCardFlourish.tsx)
Original source: none (custom-made from the user's verbal description, converged over multiple iterations)
