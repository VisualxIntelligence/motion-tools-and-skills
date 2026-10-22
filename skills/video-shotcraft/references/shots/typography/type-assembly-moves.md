---
name: type-assembly-moves
summary: Three text-assembly variants — split-text-stagger (characters split and rise one by one), letterform-drift-assembly (drifting together), text-on-path (flowing in along a line)
use_when: Entrances of big titles / taglines; belongs with type-entrance-moves and document-typewriter-reveal to the same big category of title entrances, at most 2 kinds per film
duration: single variant 4–5.5s (action segment A ~56f / B ~104f / C ~110f; demo full length including hold: A 130f / B 150f / C 160f, each exporting its own `*_DURATION`)
energy: A medium / B medium-high / C medium
---

## Intent
Title entrances already have an "in-place transformation family" (character drop / typewriter — characters change form where they stand). This card adds the "assembly family": characters **converge into** the title from elsewhere, and the motion trajectory
itself has drama. A is the piano-key type — each character slides up from below an invisible clip line, rational and crisp, with the highest
generality; B is the title-sequence type — characters drift in scattered with blur and lock one by one and deepen, the ritual feel of Stranger
Things, suited to a brand-name reveal; C is the semantic type — characters file in along a rising curve
and then straighten up, and the curve can trace exactly along a chart growth line, with text and data telling the story in the same frame.

## Variant selection
| Variant | Technique | Use when |
|---------|-----------|----------|
| A split-text-stagger (split and rise) | Each character's translateY(115%→0) inside an overflow box with a 10% overshoot, delay i×2f, baseline growing in sync (demo: light-ground scene, 136px brand short phrase "FRAME MOTION.") | The general default; crisp and rational |
| B drift-assembly (drifting together) | Characters drift in from a seeded direction ±260–360px + blur 8px + rotation ±24° + depth 1.22, staggered into place, a deepening pulse on the lock frame, and after assembly the whole word breathes 1.04 (demo: light-ground scene, 148px brand name "Shotcraft") | Brand name / title-sequence-grade reveal |
| C text-on-path (flowing in along a line) | The whole string advances rigidly along the arc length by real step (the last character leads, rotating by the tangent angle, readable while moving), and on arrival the characters lift one by one along the arc to the top-left title position (demo: midnight dark-field revenue growth line + value tag) | When the curve has meaning (growth line / process line) |

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| A overshoot | 10% (14f out-cubic rising to −10% then 6f falling back; the original plan's 6% was measurable but not perceptible, so the real render raised it) | At normal speed the fall-back must be visible; the fast rising section adds y-direction blur by vertical velocity |
| B lock pulse | text colour deepening to #000 + stroke 0→3px→0 / 8f | On a white ground use deepening + stroke, not glow (precedent) |
| B drift binding | displacement (1−p), rotation, depth scaling, blur 8(1−p), opacity 0.35→1 share a single p (Easing.out(cubic), 45f per character, 3f stagger) | Run on separate curves and the characters will "have arrived yet still be blurry" |
| C straightening | after arrival hold 8f, then left to right with 1.1f stagger, 18f lift: y uses a fast curve with ~4% overshoot, x uses in-out, rotation converges 2f later → the trajectory is an arc; the end position is laid out by measured glyph width | Without straightening it is forever "hanging on the line" and cannot read as a title; with a large lift travel an overshoot >5% pokes into the eyebrow |
| C curve | evolve (dashoffset by arc-length proportion) grows in sync with the lead character; the demo makes it a chart growth line (electric-blue 5px stroke + outer glow + gradient area under the line + cyan lead light dot and top-reaching pulse + grid ticks + quarter markers) | If the curve finishes drawing before the text moves, it reads as two animations |
| Ending | everyone settled, truly still ≥30f | R1 |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- The big category of title entrances now has five variants (this card's three + type-entrance-moves + document-typewriter-reveal),
  and the iron rule of **at most 2 per film** (P4) is unchanged
- Variants B and C are both high-attention entrances, so do not stack camera moves on top — the camera must be steady while the characters are flying
- Variant C: do not let the characters each start running on their own: later characters would overtake earlier ones, and the low section of the curve inevitably crowds into a clump (hit by the original version);
  advance rigidly by arc length and take the inter-character spacing from the real step for the whole sentence to read; with a font size >80px the characters gnaw at each other's corners where the curve bends,
  so for large type use a gentler curve or reduce the character count

## Reference implementation
demos/typography/type-assembly-moves/
(LetterformDriftAssembly.tsx / SplitTextStagger.tsx / TextOnPath.tsx)
