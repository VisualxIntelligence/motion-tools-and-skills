---
name: theme-switch-moves
summary: Two patterns for theme switching — theme-sweep, a diagonal sweep across the field (reskinning in place wherever the boundary passes), and the palette-ripple combination (a ⌘K panel shrinks to a dot and a ripple spreads from that dot to reskin)
use_when: Narrative sections on dark mode / theme features; the same UI "changing colour before your eyes" rather than cutting to a new scene
duration: A 140f (4.7s) / B 156f (5.2s)
energy: A medium / B medium-high (the combination has a complete causal chain)
---

## Intent
Two ways of shooting a light/dark mode switch. A (the usual practice of Notion/Figma/Linear): a bright line on a 15° diagonal
boundary band sweeps across the whole frame (the demo sweeps from the right, where the switch is, toward the left), and wherever the boundary passes the light colour turns dark **in place**, with the same layout
in both themes coexisting for a moment — what the audience sees is "the same UI reskinned", not a transition.
B (a combined variant): type "dark" in the ⌘K panel and press Enter, the panel shrinks into a bright dot,
and a dark ripple spreads **from that dot** across the whole UI — the causal chain of "a command triggers the reskin" is complete and readable.
The crux of the combination: the ripple's centre must be the panel's shrink point, and the start frame must be the frame where the shrink completes.

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A theme-sweep-toggle | Close-up of the top-bar day/night switch (zoom 2.0): the pointer presses, the knob springs over to the moon (the sun retracts its rays and grows a crescent) → the dark world's clip-path polygon with a 15° diagonal edge sweeps from the switch's side (64f, bezier(.3,0,.35,1)), while the camera pulls back over 30f to the wide view; the boundary = a terminator line: a white-hot core line + a sunset-orange twilight band on the bright side that widens with speed + a cool blue glow on the night side; after the sweep, "lights on" (the today capsule / now line / window outline light come on in turn) confirms it | Showing the theme feature directly |
| B palette-theme-ripple | The panel drops in on a spring → typed letter by letter at human-hand rhythm → on Enter the panel shrinks like a CRT powering off (first squashed vertically into a bright line, then narrowed horizontally into a bright dot) + the bright dot and horizontal afterglow pinned for 5f → a circular clip with radius 6→1260px spreads on a strong ease-out, with a 3px white-hot ring + coral outer glow / white inner glow + an echo ring 4f later, the dark version settling 1.035→1, and the camera exhaling and pulling back in step | The highlight section linking a command palette with the theme |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Making the dark version | Hand-map the colour palette key by key (bg/card/border each get their own dark value) | A dark version produced by filter inversion is wrong (images/avatars all inverted) |
| A diagonal edge over-sweep | The diagonal is computed as a polygon extending 400px outside world coordinates, with the end point past the lower-left corner | Without the over-sweep a light triangle remains in the corner |
| A causality | The sweep starts right at the switch, the boundary passes over the switch ~6f after the press; the camera pulls back from the switch close-up | If the boundary appears from far away or 10f or more late, "it was this switch that caused it" cannot be read |
| A poster frame | The camera reaches the wide view (40f) before the terminator crosses the midline (~44–50f) | Pulling back too late → day and night are never seen on screen together in the wide view, and only the close-up is left of the technique |
| A confirmation | After the sweep, lights that only exist at night come on in turn (today capsule / now line / window outline light) | More meaningful than scale 0.99; do not stack a full-screen white flash on top |
| B causality pinning | The bright dot hangs at the shrink point for 5f (+ horizontal afterglow), the ripple centre = that point's coordinates, the start frame = the bright dot's end frame | A misaligned centre / wrong frame breaks the "command → reskin" causality (the combination's crux) |
| B ripple radius | End value ≈ distance from the centre to the farthest corner × 1.1 (demo 1260px) | If the end value is too large (e.g. 2000+), the early part of the curve flashes past and the circle cannot be read |
| B light layer | Conditionally unmounted after the sweep completes | A precondition for truly still |

## Known pitfalls
- The demo was tuned on video-shotcraft UI designed for the shot (A release-week production schedule / B sample film gallery) — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- The layouts of the two versions must be identical pixel for pixel — any difference in layout reads as "switching to another page",
  and the technique fails
- In real-page use: take real screenshots of the light and dark versions separately (Q1), with no filter-faked dark
- At most 1 theme switch per film: it is a feature narrative, not a transition, and switching repeatedly reads as a demo accident
- Sound: A one long whoosh for the sweep; B one confirmation sound on Enter + a whoosh following as the ripple spreads
  (S4, Foley first)

## Reference implementation
demos/interaction/theme-switch-moves/
(PaletteThemeRipple.tsx / ThemeSweepToggle.tsx)
