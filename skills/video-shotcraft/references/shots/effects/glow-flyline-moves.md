---
name: glow-flyline-moves
summary: Three dark-field light-spot and flyline variants: glow-orb-ambient as a light-spot noise floor, flyline-arc as a flyline connection, and orb-flyline-relay as a same-frame resonance combination
use_when: Atmosphere and data storytelling for the single dark-field section of a film: use A to lay the noise floor, B to explain data flow direction, C when you want the background to answer the foreground; the Linear website feel
duration: A 170f (~5.7s) / B 140f (~4.7s) / C 165f (5.5s)
energy: A low (noise-floor level) / B medium / C medium-high
tags: data
---

## Intent
This is the first card in the library that lives entirely on a **dark field**. The precedent of "a white background makes brightening invisible", read in reverse, is:
to play with light, go to the dark field first. A is the breathing of space — three large light spots drift organically on a dark background, passing behind
the central frosted-glass card, with their colour staining the card face through the glass, and the card edge glowing as the nearest light spot approaches, so the
background is no longer dead; B is the verb of data — a glowing arc "fires" from card A to card B,
with a bright dot head leading and a fading light tail, and the landing point outline pulsing to light up, so the link between metrics has a direction for the first time; C is the weld of A+B — on the frame the flyline lands, the neighbouring light spot
surges brighter on the same frame, so the ambience layer and the event layer **resonate on the same frame**, answering each other rather than each performing alone (the crux of the combination: remove the shared resonance frame
and it degrades into two cards side by side).

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| A glow-orb-ambient | Three 760–1200px multi-stop radial-gradient light spots (screen blend, no real-time blur), with double-sine drift; a central 1100×600 frosted-glass card (backdrop blur + boosted saturation) lets the light spots show their colour through; the card-edge glow is driven by the light-spot distance, weighted [240,760]px→[1,0] and taking the max, + a directional rim light toward the dominant light spot | Laying the floor for dark-field sections; card breathing feel |
| B flyline-arc | The dashboard on the dark field is dimmed as the base, with a hand-written bezier from card centre to card centre sampled at 100 segments, growing over 22f out-cubic; the light head + comet tail are conditionally mounted to lead, segment opacity fades by distance from the head, and is evened out 10f after arrival; the start anchor lights up and the landing node stays on; the landing card's outline pulses + shock ring, and it can be relayed | Data flow direction/metric links; dashboard storytelling |
| C orb-flyline-relay | A+B welded: three glass nodes each with a light spot behind them; the light-spot surge and the node lighting share the landing-frame constants, brightening by 1+1.6×surge and scaling up 12%, rising over 5f and dissipating over 15f; after the flyline arrives it dissipates into a thin dotted line | Dark-field highlight sections; a three-stop relay close |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A light spots | Tide cyan / deep-sea blue / coral, peaks 0.55/0.5/0.42; drift amplitude 280–300px, periods 96–150f crossed and unequal | Drift with the same period reads as the whole thing swaying, not "organic" |
| A glass card | backdrop blur 44px + saturate 1.5; no ancestor may carry a filter / opacity<1 | If an ancestor becomes the backdrop root the light spots cannot be seen in the glass (put the entrance fade-in on the glass layer itself) |
| A card-edge glow | box-shadow 0→90px in the dominant light-spot colour 0.32 + 1.5px directional gradient rim light | Without the glow the light spots and the card do not know each other |
| A convergence | 115–145f out-sine convergence then freeze (amplitude 60/π, initial slope = 1 so the speed is continuous), truly still for the last 25f | A hard stop on one frame reads as frozen up; only eased convergence gives true stillness |
| B line body | Dark-field version (demo): white core 3.5px butt segments + two layers of 7px/18px indigo glow; light-background version: white line 4.5px + 9px dark backing | On a light background a white line without backing disappears outright (precedent); round caps on the segments pile up into a string of beads in the fading tail |
| B light head | White dot r7 + r40 halo + 9-point comet tail, conditionally mounted during the growth period only | Opacity reaching 0 does not count as removing the layer, and it never truly comes to rest |
| B pulse | Outline spread out-cubic 6f / dissipation 12f to a residual 0.25; dark-field version brightens (accent-colour outline + outer glow + a very faint card-face brightening) + 14f shock ring; fully still after f86 | No brightening on a white background — the light-background version uses a darkening overlay of 0.16 instead |
| C resonance | The surge starts on the same landing frame (the same constants LIT_B / LIT_C); node brightens to 1 over 8f + outline pulse residual 0.35 + 20f shock ring | Off by more than 2f and the resonance cannot be read as "answering" |
| C timeline | Action finishes before f98, light spots converge and freeze over 110–140f, truly still for the last 25f | The ambience layer freezes last, the event layer winds down first |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The switching cost between a dark-field section and a paper-and-ink light-background main visual is high — ≤1 dark-field section in a whole film; enter and exit
  with the hidden-cut family pads in shot-transitions, and do not hard-cut between light and dark
- The end of the light-spot drift **must** ease-converge to stillness before freezing — constant-speed drift clamped directly
  is a visible emergency stop (the A-variant out-sine convergence precedent)
- Production brand-colour version: use a brand-colour pair for the light spots (e.g. blue-purple); the greyscale parameters only guarantee the lightness relationships,
  and the hue contrast must be re-tuned
- With ≥3 B relay lines switch to C — pure back-to-back flylines read as a big-screen template, and only resonance gives an authored feel
- Sound: one light tick on every landing in B/C, A is silent (sound-design §4.5)

## Reference implementation
demos/effects/glow-flyline-moves/
(FlylineArc.tsx / GlowOrbAmbient.tsx / OrbFlylineRelay.tsx)
