---
name: radial-ripple-phone-chips
summary: Four layers of concentric circles on a warm sand background breathe out of phase like water ripples, the feed inside the central phone mockup's screen scrolls slowly on its own, and white chips on both sides spring-pop in one after the other and hover
use_when: "This is it" freeze-frame shots for mobile products; introduction sections with feature points split across both sides; product panoramas for the opener/closer
duration: about 5.6s (168f@30fps)
energy: Low (quiet, with a sense of breathing; the continuous swell of the concentric circles keeps it from going dead)
---

## Intent
Put the phone at the dead centre of the frame with the fewest moves and make it "alive": the concentric circles handle the atmospheric breathing,
the auto-scroll inside the screen proves "there is content running in there", and the chips on both sides call out the feature names.
Each of the three layers of motion is extremely slow, and only stacked together do they avoid looking still — this is the standard recipe for a product freeze-frame shot.

## Motion core
- Demo picture (look = sand, the phone shows video-shotcraft's shot-library feed): laid out at native 1080p size (not scaled up through DesignStage),
  the phone is 430×900 taking 83% of the frame height, and the mirror-engraved logo + video-shotcraft wordmark at bottom left rise after the two chips have settled; the close is a product poster
- 4 layers of concentric circles (2240/1760/1280/840px, #dccbb4→#f2eadf from dark to light, the outer two layers extending off-frame to fill it) each
  `scale 1 ± 0.06`, running 1.5 sine periods over the whole film, with a phase difference of 1.7 rad between adjacent layers
  — the phase offset is the key to "water ripples" rather than "whole-thing scaling"; each layer carries a lit top edge + a white hairline outer rim, and a patch of warm-white soft light at the centre holds up the phone
- Phone: warm titanium metal bezel 12px + black edge 9px, 70px corner radius, dynamic island/side buttons/glass slanted reflections, two layers of drop shadow;
  0–26f rises from 90px below with snappy, the shadow tightening as it settles
- The feed inside the screen is designed for the shot: a large headline + a featured large card + 8 episode cards (geometric-illustration cover / title / duration · show / listening progress),
  with a mini player bar permanently at the bottom (progress advancing at constant speed, waveform jittering lightly and deterministically), and a layer of screen-background colour fading out below the status bar and below the player bar
- feed `translateY 0→−560px`, window `t 0.08→0.98` **constant speed, no easing**
- chip pop: `springAt(t0, damping 13, stiffness 190)` drives scale 0.8→1 (one visible overshoot),
  at the same time moving 28px outward from the phone's side with snappy and opacity jumping to full in 5f; the left chip starts at 37f, the right chip at 67f
- After the pop, a `sin` hover of ±8px (2 periods over the whole film) follows, brought in gradually by a 24f smooth starting 18f after the pop
  — it does not start drifting the moment it lands

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Concentric circle layers/size | 4 layers 2240/1760/1280/840px (1080p) | 3 layers cannot fill the frame; the outermost layer must extend off-frame, otherwise it reads as a circular colour swatch |
| Breathing amplitude | scale 1±0.06, 1.5 periods over the whole film | 0.06 is already the upper limit; at 0.1 it reads as a "pulse animation" rather than water ripples |
| Phase difference | 1.7 rad between adjacent layers | With identical phases = the whole block zooming in and out; a difference of 1.7 gives the illusion of waves rippling out from the centre |
| Phone shadow | Close contact shadow 0 4px 10px + far shadow 0 40px 80px -20px + ambient shadow 0 90px 140px -40px (sand.shadow, hue-tinted) | The shadow is the only evidence that the phone is "floating on the waves"; remove it and the phone lies flat |
| Auto-scroll | translateY 0→−560px, t 0.08→0.98 constant speed | Adding an ease immediately reads as "someone swiping"; only constant speed reads as autoplay |
| chip pop | spring damping 13 / stiffness 190, scale 0.8→1, outward 28px | The overshoot amount is the whole texture of "popping out"; with damping >20 it goes flat |
| chip timing | Left 37f / right 67f (1s apart) | Appearing together reads as two labels; staggering gives the rhythm of "saying them one by one" |
| chip hover | ±8px, 2 periods, fading in over 24f from 18f after the pop | An amplitude beyond ~12px steals the show from the concentric circles' breathing |
| chip font size | 36px / 600 weight + 60px accent-colour icon circle | At 1080p the chip is text to be read; do not go back to the 12–20px sticker size |

## Known pitfalls
- The chips are positioned against the outer edge of the phone with `right: 1920 − PX + CHIP_GAP` / `left: PX + PW + CHIP_GAP`;
  after changing the phone width PW the chips on both sides follow automatically, but confirm that the outer edge of a long-copy chip is still within the 96px safe margin
- The feed inside the screen is placeholder content with fake entries; when swapping in a real screenshot the total height must
  be greater than "560px + screen height", otherwise white shows when it scrolls to the bottom
- The phone screen is only ~390px wide: keep episode card titles to ~18 characters and the meta info `nowrap + ellipsis`, otherwise wrapping makes the card taller
- The concentric circles are stacked solid colours (not outlined rings), and the layer order must be appended from large to small,
  and if the order is reversed only the largest layer is visible
- ACCENT (the default sand terracotta #c4552d) applies to the covers/progress bar/play button inside the screen and the chip icons,
  and changing the project's brand colour only requires changing this one variable to reskin

## Reference implementation
demos/effects/radial-ripple-phone-chips/
(RadialRipplePhoneChips.tsx)
