---
name: brand-ink-open
summary: Ink-line crosshair draws on → wordmark stamps in letter by letter → typewriter kicker → one full second of stillness, then lifts away and dissolves
use_when: Brand opening; any title sequence that "establishes the name before entering the product"
duration: about 2.8s (83f)
energy: Low (starting position, leaves room for the following shots to climb)
tags: typography
---

## Intent
The first beat gives the brand its memory hook: before any product footage appears, the audience clearly sees and remembers the name. Quiet, paper-and-ink texture, with one complete moment of stillness.

## Motion core
- SVG crosshair stroke draws on (pathLength dashoffset), vertical first then horizontal, and fades out once drawn
- Wordmark letterpress letter by letter: scale presses down from large to 1 + blur→0, with an accent-colour (amber in the template film) glint stroke flashing across the base of the letters
- Kicker subtitle appears character by character like a typewriter, with an accent-colour block cursor blinking periodically
- The lockup holds fully still for a full 1 second, then lifts + shrinks + fades out as a whole, handing off to the dashboard

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Crosshair draw-on | Vertical line 0→9f, horizontal line 8→18f, fade out 24→34f | It must fade out once drawn; a lingering crosshair competes with the wordmark for focus |
| Wordmark letter by letter | Letter i: delay=10+i·3, 12f; scale 1.6→1 (origin center bottom) + blur 6px→0 | "opacity + offset/scale + blur→0" is the standard three-piece entrance used across the whole film; without the blur it looks hard |
| Kicker typewriter | 0.7f/character (starts at 28, finishes at ~43.4), cursor blinks on a 2f cycle, stops blinking at 74f | 0.7f/character only suits small decorative text; body-copy interactive typing needs 3f/character (compare type-and-filter, where the user found it too fast and sent it back) |
| Brand hold | Frames 46→76, exactly 1 second | Hard floor: the user called out "extend the hold after it appears by 1 second" in two rounds (R1); anything shorter than 1s gets reworked |
| Exit | 7f lift 40px + shrink 12% + fade out | The exit is faster than the entrance — the audience has finished reading, and dragging it out deflates the moment |

## Sound
The brand landing is pinned to transition-soft (pinned at f12 in the template film), and the brand→dashboard camera move is pinned to whoosh-fast (f78). SFX are pinned frame by frame and managed in a declarative table (S2); the timbre follows cinematic vocabulary, not a game-UI tap (S1).

## Known pitfalls
- The hold is for the moment the wordmark settles, not for an ordinary title card or content card (R1) — a hold was once wrongly added to an ordinary content card and soon rolled back; when feedback about "holding" is ambiguous, confirm the target before acting (P3)
- The opening energy must start low: the whole film's energy curve is low opening → mid-section build → outro peak, and a flashy opening crushes the climb that follows (compare the energy-curve requirement in Q8)

## Reference implementation
demos/typography/brand-ink-open/BrandInkOpen.tsx (originally the frames 0–83 section of template/src/aifl/live/SceneOpen.tsx)
