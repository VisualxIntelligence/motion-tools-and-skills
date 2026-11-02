---
name: neon-triple-marquee
summary: A three-row counter-moving neon marquee recap — giant hollow neon-tube letters of a three-word phrase fill top, middle and bottom of a brick wall shot at an angle, with odd and even rows rolling horizontally in opposite directions at constant speed without end, the three rows lighting up in turn at 1/3 phase offsets, and powering down row by row at the end
use_when: A closing passage where theme words are repeated like a parrot; the "afterglow" treatment for a three-word slogan; a music section laid out with no narration
duration: 4–5s (demo 150f: 18f row-by-row ignition power-up + loop body + 18f row-by-row power-down + 8f lights-out hold)
energy: Medium-high (continuous flow + row-by-row pulses, no instantaneous impact)
tags: typography
---

## Intent
A single-row marquee is just web decoration; stack up three rows, make odd and even run opposite ways, and let the brightness
travel by phase in turn, and it becomes "the theme words marching in formation before the audience's eyes". The crux is the **light-dark round-robin**: at any moment
only one row is the neon lead and the others are dimmed to thin outline background — all three rows fully lit is a signage accident,
and lighting in turn is what makes a recap. The counter-rolling creates a "surrounded" feel: the top and bottom rows go right and the middle row goes left,
the gaze is sandwiched in the middle with words flowing past endlessly from both sides, reading as "these three words cannot be said out".

## Motion core
- Seamless wraparound: copies are positioned absolutely at equal intervals of a fixed unitW, translated by `(frame*speed) % unitW`
  modulo — constant-speed linear (marquee types are the library's linear exemption)
- Hollow tube letters in three layers: `-webkit-text-stroke`, color transparent — dark-state glass tube (same colour at 0.3 opacity, always on, so the three-row structure is always there)
  → energised coloured tube body (stroke 6→10px + three-layer drop-shadow glow 9/36/90px) → near-white hot core (2→3.8px); the brightness also drives
  a same-colour spill light on the brick wall behind (screen blend, the mortar lines lit up) — adjusting only opacity and not the glow cannot read as "neon energised"
- Round-robin: period 42f, each row has a 14f slot, slot length 16f (overlapping the next row by 2f for the handover, so no fully dark empty beat appears); within the slot the first 2 frames are an ignition flicker
  (0.6 → 0.25 → full), 3f rising to full, a plateau, and the last 5f ease-in to extinction — guaranteeing that "one lit, two dim" always holds
- Camera position: the whole wall sits on a 3D plane at perspective 1700 shot at an angle, rotateY −17°→−9° with a very slow smooth pan-in throughout + scale 1→1.05;
  at the foot of the wall a wet floor, and the flipped reflection of the bottom row (3px blur + fade-out mask) and each of the three rows' own floor colour-light pools breathe with the brightness
- The three rows are coloured ice-cyan / magenta / sodium-lamp amber (#38d9ff/#ff3d9a/#ffae34), with a blue-black brick wall #0a0b14; the middle row runs in reverse and slightly faster (9/11/9 px/f)
- Power-up / power-down: at the opening the three rows run a deterministic ignition flicker sequence in turn at 0/5/10f; from 124f, top to bottom, each row staggered by 6f flashes twice and goes out,
  landing on a lights-out poster with only the dark-state glass tubes left (not fading to dead black)
- Typeface Avenir Next Condensed Heavy 286px (fallback DIN Condensed / Impact), with word spacing laid out by the canvas-measured width, and a hollow diamond ◇ as the separator (border the same colour and weight as the tube on the same layer)

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Font size / line spacing | 286px condensed, line spacing 290px filling the wall | White space between rows >80px reads as three banner ads rather than a wall of words |
| Scroll speed | 9/11/9 px/f, middle row reversed | A condensed face is denser, so one notch slower than a wide face; >20 and the words cannot be read, only light bands seen; three rows at the same speed in the same direction read as the whole sheet panning |
| Pulse period | 42f, each row a 14f slot + 2f handover overlap | A period <30f and the three rows fight to flash, reading as a glitch; >70f and the round-robin feel breaks; without overlap a fully dark empty beat appears every 14f |
| Brightness range | dark-state glass 0.3 + energised stroke 6→10px + three-layer glow | A dark state <0.2 and the dim rows vanish, losing the "three rows" structure |
| Glow | three-layer drop-shadow, lit state 9/36/90px + wall spill 0.55 | A single layer or <20px reads as ordinary outlined text rather than neon; without the wall spill it reads as "text on a screen" rather than "a light on a wall" |
| Angled shot | rotateY −17°→−9°, perspective 1700 | >25° and the far-end words crowd into a clump and cannot be read; 0° returns to flat, losing depth |
| Power-up / power-down | in: row by row staggered 5f ignition; out: from 124f row by row staggered 6f power-down | A hard-cut in and out reads as footage that does not fill the frame; fading the whole group out at once has no ritual of "turning off the lights" |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Division of labour with page-waterfall-wall: that card is a vertical waterfall of page screenshots for a "content volume feel",
  this card is horizontal counter-rolling of text rows for the "theme-word afterglow" — the material is words, not pages, and the position is at the end of the film, not mid-film
- Division of labour with outro-group-photo-launch: the group photo is the peak final shot (elements posing together + a launch-event close),
  this card is a recap build-up before the final shot or a low-cost alternative final shot, and the two can be chained (this card → fade-out → group photo) but not layered
- The number of copies is `ceil(1920/unitW)+3` leaving redundancy — for short words (≤4 characters) unitW is small,
  and too few copies will expose a gap on the right at the wraparound instant
- Real-use brand colour version: the three rows can be unified in the brand colour and distinguished by light and dark, but the glow contrast must be ≥ the demo's
  amplitude of dark state 0.3 → energised full brightness + three-layer glow, otherwise the round-robin cannot be read
- The drop-shadow glow inside a 3D angled-shot plane is not cheap (the demo takes about 7s at 1080p to render 150f); the reflection layer draws only the tube body and not the glow (cheap)

## Reference implementation
demos/outro/neon-triple-marquee/
(NeonTripleMarquee.tsx)
Original source: clickup-30 61–64.5s
