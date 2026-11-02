---
name: spotlight-sweep-moves
summary: Three dark-field spotlight-reveal variants: A wake-and-sleep sweep (bright where the light arrives, dark when it leaves), B edge-hugging glow lateral pan (purple light seeps in along the UI edge + the spotlight moves right at constant speed), C corner constant-speed reveal (a radial spotlight expands from the corner at constant speed and lights the whole screen); UI showcases where "light is the narrative" in a black field
use_when: Introducing UI panels/functional areas one by one in dark-toned brand films; opening from black by "lighting up" the interface; light transitions between sections
duration: 3.5–4.5s per variant; A/B can be chained into a tour section
energy: Medium-low (restrained, mysterious, with the burst point at the instant of "lighting up")
tags: ui-entrance, transition
---

## Intent
In a black field the viewer can only see what the light shows — the spotlight is lighting as well as camera movement and editing:
wherever the light goes things make their entrance, and when the light leaves they take their bow. The three variants share the identity element of the "edge-hugging purple glowing light line"
(the light line runs along the UI border/logo/top edge, and the glow must be bright and diffuse, so that the light is
"caressing" the interface rather than being a stroke animation). The crux is **constant speed**: the spotlight's movement/expansion is
strictly linear — easing gives the light an "intention", and only constant speed reads as the mechanical sweep of a searchlight
(precedent from the C variant: linear but with a final radius that is too large = saturation in the first 1/4, and it still does not feel constant-speed).

## Motion core
**A wake-and-sleep sweep** (glow-wake-sleep-panel): a radial reveal mask follows the light head moving at constant speed from left
to right, with everything outside its range pure black; a purple light line along the top edge with three layers of glow (blur26 wide haze +
blur9 middle layer + bright core + pink offset layer) travels in sync with the sweeping light, tracing light with boxShadow as it passes the logo,
and lighting up a vertical afterglow at the right edge; in the tail section the light leaves and the panel sinks back into darkness — it wakes and it sleeps.
**B edge-hugging glow lateral pan** (slide-spotlight-pan): the light line is anchored to the panel edge (first around
the vertical edge at the top-left corner, then after turning the corner running horizontally along the top edge), and the purple glow bleeds into the inside of the top of the UI (light seeping into the interface
from the edge); the spotlight head reveals while moving right at constant speed and the panel simultaneously slides left at constant speed = a camera right-pan feel.
**C corner constant-speed reveal** (corner-spotlight-reveal): the radius of the top-left corner radial spotlight
expands strictly linearly, revealing what it lights and sinking into black what it does not, ending at fully lit (light as transition).

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Spotlight movement/expansion | Linear throughout, zero easing | **Constant speed is the crux** — zero easing throughout; adding an ease reads as the light having a subjective intention |
| C-variant final radius | Covers exactly the full screen at the end of the film (1300@1080p/100f) | A final value that is too large = early saturation and fake constant speed: the brightness samples must climb smoothly throughout (measured 8/46/101/…/238) |
| Edge-hugging light-line glow | 3–4 layers (blur26+blur9+bright core+pink offset) | Too few layers read as a thin-line outline; the glow must be bright and diffuse enough to be "light" |
| Light-line anchoring | Strictly hugging the UI edge/top edge/logo | A light line drifting free of the edge = losing the "caressing the interface" semantics (A-variant rework precedent: positioning was lost and the purple light ran to the bottom edge) |
| Reveal mask | Radial gradient with a hard edge, slightly blurred (feather ~15%) | Too hard an edge looks like a circular mask; too blurry and there is no boundary of "lit / not lit" |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- Division of labour with light-play-moves: that card is about the
  gloss play on elements/text (sheen/glow breathing); in this card the light is **camera movement and editing** (reveal/bow/transition),
  and the light decides what the viewer looks at
- Redo precedent for the three variants: a spotlight sweep must be accompanied by the edge-hugging light line (v1 had only the reveal mask and was sent back with
  "tweak and look again" — a bare spotlight has no identity, and the edge-hugging purple light is the signature of this technique)
- In the original film (clickup-30) the light line shows a momentary rainbow chromatic dispersion at the corner turn, which the demo did not do; in production a
  1–2f dispersion layer can be added at the corner frame to improve the texture

## Reference implementation
demos/effects/spotlight-sweep-moves/
(CornerSpotlightReveal.tsx / GlowWakeSleepPanel.tsx / SlideSpotlightPan.tsx)
Original source: clickup-30.mp4
