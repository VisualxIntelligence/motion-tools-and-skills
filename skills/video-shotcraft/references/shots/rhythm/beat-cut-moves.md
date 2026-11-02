---
name: beat-cut-moves
summary: Hard cuts as a beat instrument — burst-flash freeze: three white flashes each hard-cut to a different crop of the same picture (wide → card → close-up), and after the shutter afterglow settles it stops on the close-up to close
use_when: Highlight sections that play the "cut" itself as a drumbeat; the ceremony of an awards-style burst of shots, the crowning of key information
duration: whole run 140f ≈4.7s (live footage 30f + three flashes + hold 70f)
energy: High
tags: transition
---

## Intent
The library's rhythm vocabulary has only ever governed the rate "within one movement" (speed-ramp-freeze freezes then thaws within the same take)
and "how long to stop after settling" (the R-series breathing precedents), with no word for **how to lay out the cut points between shots**.
This card fills that gap: hard cuts with no transition of any kind, where the interval between cut points is itself the score —
three white flashes, with intervals tightening (22f→18f), reading as a camera's burst shutter (A). It does not conflict with the R-series:
R governs the stop after settling, this card governs the layout of cut points, and when the string of cuts ends it must be followed by enough hold to hand the
breathing back. Note that this is a deliberate exception — the rhythm-preference precedent is one-way "slow down", and the
harder the cut string cuts, the longer the hold after the cuts must be than usual.

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A paparazzi-flash burst freeze | Three white flashes each hard-cut to a different crop of the same footage (wide → card close-up → "Take 1" close-up); before each flash a focus frame locks onto the next crop, the shutter afterglow settles, and the third flash stops on the close-up to close (demo: the video-shotcraft "Shot of the Year" award card, with a tiled video-shotcraft mark / wordmark backdrop) | The ceremony of a highlight moment: an awards burst, the crowning of a key number / key sentence |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Three flash cut points | 30/52/70 (interval 22f→18f tightening), with a 30f slow push-in on "live footage" (small flashes of other cameras on the backdrop) before the flash to set off the freeze after the flash | Before the flash it must be alive; with dead footage throughout the three flashes cannot be read as a "freeze" |
| White flash layer | Each flash opacity 0.95→0 decaying over 4f ease-out; on the flash frame ±2px seed-hash full-screen shake | Starting at 0.95 gives the burst of a flashgun; a decay >6f becomes a soft-light transition and loses the shutter feel |
| Shutter afterglow | The cut-in view scale 1.03→1 settling back over 6f ease-out + a −16px sink back to zero | The afterglow is "being caught wobbling by the shot"; without it the three flashes read as slideshow page turns |
| Three crops | The same picture with a different CSS zoom focus: 1.0 wide / 1.6 card / 2.8 close-up ("Take 1") | Closing in layer by layer has a narrative direction; out of order (close-up → wide → close-up) reads as a mis-cut; do not let a crop edge cut through half a line of text |
| Focus preparation | 8f before the next flash a focus frame tightens from 1.3× to the next crop's extent (screen-coordinate projection), and 3f before the flash turns champagne to lock | This is the "preparing to shoot": the audience knows in advance where the next shot will be taken, so the flash feels like a pressed shutter |
| Closing section | After the third flash the close-up holds 70f, with only a very slow 1→1.015 push-in + the HUD "SAVED" fading in | The three flashes are a heavy blow, and the hold must be given more than twice the usual; the freeze is a photograph, so add no motion inside the picture |

## Known pitfalls
- **The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage**
- The technique **depends heavily on sound**: the cut points must be pinned to beat points on the audio track, with a shutter click on each flash,
  and the silent version is only pictures jumping about; pin frames relative to the shot start per sound-design.md §4.5, not at absolute frames
- The three crops must be "the same picture closing in layer by layer" rather than three unrelated pictures — the audience must recognise throughout the burst
  who this is; do not use this pattern with footage across products/scenes
- The cut string is ≤1 per film (the P4 restraint principle): this is the loudest strike in the film, and if it appears a second time
  the first was wasted
- The rhythm-preference precedent is one-way "slow down", and this card is a deliberate exception — the hold after the cuts (70f)
  is a floor, not a suggestion, so better too much than too little
- A true hard cut = the frame falls in an interval that renders the corresponding view, with no transition frames whatsoever; a slip of adding a 2f cross-fade
  makes it no longer a hard cut, and the beat feel immediately blurs

## Reference implementation
demos/rhythm/beat-cut-moves/
(PaparazziFlash.tsx)
