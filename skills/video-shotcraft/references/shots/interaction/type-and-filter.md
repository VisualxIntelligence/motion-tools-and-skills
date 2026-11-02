---
name: type-and-filter
summary: Typing a search on the real UI, the grid converging by itself to a single card, and a click punching through into the detail page
use_when: The "operation narrative" section of a feature demo; any interaction chain of search/filter/entering a detail page
duration: about 2.5s (118–190f)
energy: Medium (an unhurried beat after the high-energy dealing section)
---

## Intent
Let the audience "follow along and do it once": see clearly what was typed, how the page responded, and where was clicked. This is the only shot in the whole film that simulates a real person operating, and the rhythm must feel like a human hand, not a script.

## Motion core
- The camera comes close to the search box (zoom 2.0, effective glyph height of the typed text ≈30px) and types character by character, the cursor constantly lit → blinking; the breathing beat after typing pulls out to a full-frame wide view (zoom 1.0) to watch the grid converge
- After typing, leave a breath, then the non-target cards fade out and sink in a staggered reading order, and the grid converges
- The target card slides to the first-row slot, floating up with a widening shadow along the way
- The pointer glides to the target card in the wide view (constant on-screen size), a double ring of accent colour (amber in the template film) ripple confirms the click, and the camera pushes in through into the detail page, handing off to the transition

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Typing speed | 3f/character (TYPE_START=128, "nano-lab" 8 characters ≈149 to finish) | The final value after the first version was sent back for being too fast ("unhurried"); interaction demos follow real human operating speed (R3) |
| Breathing beat | From finishing typing to the filter FILTER_START=160, leave ~11f (0.37s) | Filtering immediately after typing reads as machine automation, and the audience cannot follow the causality |
| Cursor | Constantly lit while typing, then blinking on an 8f cycle; click at 176f, cursor disappears at 185f | Blinking during typing reads as stutter; the switch from constantly lit → blinking is itself the signal of "done typing" |
| Filter exit | 25 non-target cards staggered in reading order at 0.4f intervals, each fading out for 5f + sinking 8px | Disappearing all at once reads as the page crashing; even a stagger of only 0.4f is enough |
| Target card slide | 10f to the first-row slot, bezier(0.35,0,0.2,1), with a sin float of z 18px along the way, scale +0.02, shadow widening with the float | The end point must be a real layout slot (Q9), and sliding to hover at the middle of the frame is fake |
| Click confirmation | Two concentric accent-colour ripple rings (start points 3f apart, 10f each, radius 14→54/78) + 3px outline + 40px glow, then the camera pushes in over 16f to zoom 2.2 | A single ring ripple is too light to see; the push-in hands off to flash-cut to cover the page-change hard cut (component at assets/lib/FlashCut.tsx, usage: from = cut point − 5, straddling the hard cut with 5f on each side) |
| Search box | A page-base-colour patch covers the placeholder in the texture (keeping the magnifier icon), and the text layer is laid on top to type | Laying text directly on the screenshot texture ghosts against the baked-in placeholder |

## Sound
The typing section is pinned to keyboard.mp3 and cut by Sequence to 24f, strictly equal in length to the action (S4); the click is pinned to click-camera (the loudest in the film, vol 0.6, S2 loudness layering); the grid flying away is pinned to whoosh-fast.

## Known pitfalls
- The first version of typing + filtering was reworked for being "too fast" (R3) — the first version of an interaction shot is almost always too fast, so draft it at 3f/character from the start
- After filtering, if the target card does not settle into the real slot and hovers above the grid, it reads as fake (Q9, once nearly caused a rewrite of the whole file)

## Reference implementation
demos/interaction/type-and-filter/TypeAndFilter.tsx (originally lines 118–190 of template/src/aifl/live/SceneFlyIn.tsx)
