---
name: typewriter-moves
summary: Typewriter error-retype — a three-act drama of the "retraction" by mistaken delete and retype: type out a mediocre word → hesitate → backspace to delete it → type out the selling-point word faster
use_when: Slogan / selling-point title cards, negation-style copy; text entrances with a built-in sense of time
duration: ~5.3s (160f)
energy: Medium-low
tags: opening
---

## Intent
Typing is the only text entrance with a built-in sense of time — the characters arriving one by one is itself the rhythm,
and no extra motion is needed. Variant A treats typing as a **monologue**: type out a mediocre word character by character
(in the demo, "just a slideshow" under the eyebrow Introducing video-shotcraft) → a pause of hesitation
→ backspace to delete it → type out the selling-point word faster ("your cinematic crew"), a three-act
drama of hesitation-negation-declaration, with all the drama in the difference among three speeds.

## Variants
| Variant | Technique | Use when |
|---------|-----------|----------|
| A error-retype | type 2f/character → pause 16f with the cursor blinking twice → delete 1.5f/character → retype 1.5f/character with no hesitation; the cursor is steady-on while typing and deleting, blinking only during the pause | The "retraction" drama of a slogan card; negation-style copy |

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Character rhythm | substring(0, floor((f-start)/step)), frame-deterministic with no interpolation | Any eased typing reads as a loading animation |
| Three speeds | type 2f/character, delete 1.5f, retype 1.5f with zero hesitation | The difference among the three speeds must be perceptible — a retraction at constant speed reads as a bug, not a drama; this is the crux |
| Cursor three states | steady-on while typing and deleting = decisive; a 4f half-period blink twice during the pause = hesitation; after the final text blinks twice it is conditionally removed | The cursor is the actor's face, and blinking at constant speed throughout leaves no "hesitation" |
| Layout | per-character fixed-width spans (60px monospaced slots), left edge anchored | A variable-width font / measuring the whole string reflows and jitters frame by frame |
| Ending | still ≥50f | Even a residual cursor at 0.05 opacity ruins the true stillness |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Heavily dependent on sound: keystroke sounds aligned per character, with the backspace sound lower in pitch (sound-design
  §4.5) — a silent typewriter is just a caption machine
- At most 1 per film — a retraction is a one-time dramatic turn, and retracting twice is stuttering
- One of a monospaced font or per-character spans must be used, otherwise the whole line
  reflows as characters arrive and the typing turns into twitching

## Reference implementation
demos/typography/typewriter-moves/
(TypewriterErrorRetype.tsx)
