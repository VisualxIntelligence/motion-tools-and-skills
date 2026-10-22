---
name: type-entrance-moves
summary: One title-text entrance variant — letter-drop-physics (characters fall under gravity, bounce, settle at a tilt, and on the last beat all snap upright into place together)
use_when: Entrances of big titles / chapter title cards; the same category as type-assembly-moves (assembly family) and document-typewriter-reveal (typewriter), chosen mutually exclusively
duration: single variant 5s (including hold and a still ending; action segment ~116f, demo 150f)
energy: Medium-high (physical fun)
---

## Intent
The title-entrance library already has the typewriter (a steady document feel) and the assembly family (characters converging from elsewhere), and this card adds
physical comedy — characters fall from the sky, slam into the ground and bounce, settle crooked and wobbly, and on the last beat
all snap upright into place together, suited to ice-breaking openers with a light tone (the demo has the brand name "Shotcraft" slam down and settle,
with the subtitle "Every shot lands on the beat." surfacing on the beat of the snap into place). At most 2 title-entrance variants per film (P4).

## Method
| Variant | Technique | Use when |
|---------|-----------|----------|
| A letter-drop-physics (characters fall) | Characters slam down from the top staggered, with gravity acceleration + two decaying bounces + landing and settling at a tilt, and on the last beat everyone is straightened up together | Openers with a light tone; a title ice-breaker with a "living thing" feel |

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Fall | character i takes off at frame 4+36·(1−(1−i/(n−1))^1.5) (first and last characters fixed at 4f / 40f, with intervals getting denser; demo 9 characters 6.5→1.6f); y = −DROP + DROP·(t/24)² (gravity) → 4u(1−u) parabola bounce 30% → second bounce 9% | A bounce decay ratio of 30%/9% is the sweet spot of "springy but not rowdy"; three or more bounces read as jelly |
| Tilt | at the instant of landing rotate to a seed-hash ±6° and hold | The tilt angle is half of the "physical feel"; everyone landing straight reads as an ordinary displacement entrance |
| Snap-into-place beat | after everyone has settled (e.g. frame 110) 6f ease-out collective rotate→0 + scale 1.06→1 | The collective snap is the full stop — staggering the snap breaks up the ritual of "standing to attention" |
| Ending | after the action finishes truly still ≥20f | R1: during the still period all attributes are locked (including after the tilt returns to zero) |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- The landing thud is a candidate slot heavily dependent on sound (sound-design §4.5): pinning frame by frame per character would double the sense of weight,
  and the silent version also stands but loses half the punch
- No real collision between characters (in the demo each character has an independent trajectory) — just space them out with letter-spacing;
  wanting "knocking each other crooked" needs pre-baked trajectories, with high cost and thin payoff
- Choose words that avoid letters with descenders (g/j/p/q/y) or calibrate the ground per glyph — the demo sits on the baseline,
  and descenders would "poke into" the ground
- A title entrance carries high attention by itself — do not fight other high-energy entrances in the same frame

## Reference implementation
demos/typography/type-entrance-moves/
(LetterDropPhysics.tsx)
