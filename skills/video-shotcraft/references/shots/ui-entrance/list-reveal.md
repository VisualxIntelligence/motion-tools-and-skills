---
name: list-reveal
summary: Six items of a vertical menu find their place one after another at 10f intervals by scale, settling with a soft back slight overshoot, while the whole list container moves up at constant speed throughout - item-by-item entrance and overall drift are two unrelated layers of motion
use_when: Entrances of navigation / sidebar / settings panels; any UI segment where "the interface grows itself", and also suitable as a low-energy bed while narration sets things up
duration: about 4s (120f@30fps)
energy: Low (steady beat, no peaks; the drift keeps the picture from dying)
---

## Intent
A list fading in item by item is the kind of motion most easily made stiff: each item stops once it has moved, and the picture is completely still between two items.
This card's solution is to add a layer of slow drift to the container, unrelated to the item-by-item entrance - locally the items are "finding their place", and globally the whole is "breathing".
Viewers can read every item, and yet not a single frame of the picture is nailed down from start to finish.

## Motion core
- The two layers of motion are completely decoupled: the container's `translateY(DRIFT/2 − DRIFT·f/(N−1))` takes only the global frame and is a constant-speed drift running through the whole film
  (demo: a total of 96px in 1920 coordinates, +48 → −48, ≈0.8px/f); each item takes only its own local window, and neither takes part in the other's calculation
- Item-by-item entrance: start `2 + i·10f`, window 24f, and the stagger of 10f is one notch slower than a conventional UI stagger - this is the "readable" interval,
  not the "quickly spread out" interval; the window is 2.4 times the stagger → 2-3 adjacent items are moving at once, and the queue flows continuously
- The place-finding action is scale-led: `scale(0.82 → 1)` paired with `translateY(44 → 0)` + focus blur 8px → 0,
  and what the viewer perceives is "from blurry to solid, growing from small into place", not "flying up from below"
- Soft overshoot `bezier(0.3, 1.18, 0.5, 1)` (~1.5%) - a very small amount, whose role is to turn the landing frame from "stopping" into "latching"
- Follow-through: the icon settles 2f later, the right-hand shortcut / badge 4f later; opacity `min(1, lin·2.2)`, fully solid by 45% of the travel
- The current item (Home) is the only highlight in the whole film: a solid porcelain-white bar + one sweep of light after landing (Q4); the other items are dark graphite faces + hairlines

## Parameters (the demo uses 1920×1080 native coordinates)
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Item count | 6 (Home…Sign out) | The last item starts at 52f and settles at 76f, leaving ~44f at the tail for the viewer to wrap up; with >8 items the stagger must be compressed, otherwise the last item eats into the wrap-up |
| stagger | 10f/item | 10f is "readable item by item"; compressed to 4f it becomes a one-shot spread (a different technique), and stretched beyond 16f the beat falls apart |
| Per-item window | 24f | A window 2.4 times the stagger → adjacent items overlap; with the two equal it becomes hard-joined one by one |
| Starting scale | 0.82 | A scale at which "it can already be recognised as an entry"; <0.5 reads as popping out from zero, confusable with pop-type techniques |
| Starting displacement / blur | 44px / 8px | The displacement must be smaller than the row pitch (92px row height + 14px gap), otherwise items interpenetrate |
| Overshoot | soft back ~1.5% | Must be so small it is barely readable; with a spring or a larger overshoot, six items shaking in a row look cheap |
| Container drift | Constant speed throughout, 96px (≈0.8px/f) | The total is 2 times a single item's displacement and an order of magnitude slower in speed - reads as "the picture is breathing"; when the speed approaches the item entrance speed the two layers of motion blur into one thing |
| Opacity slope | `min(1, lin·2.2)` | Lowered to 1 you see semi-transparent items stacked on the background, especially dirty on a dark scene |

## Known pitfalls
- The container drift is constant-speed and runs through the whole film, and the last frame stops at −48px rather than 0 - this motion **does not return to position on the last frame**.
  To loop playback or align the position with the next shot, swap the drift for a converging curve, or add a reverse slow settle in the last segment
- When the item count changes the stagger must be recomputed: the last item's start is `2 + (n−1)·10f`, plus the 24f window, leaving ≥30f for the wrap-up
- Row width 700px, labels `nowrap` - Chinese or longer English labels will run into the right-hand shortcut, so widen in step when changing copy;
  the total list height is ~644px, so before adding items compute whether the first and last items are still inside the safe area after drift (demo drift range y 188-928)
- The drift direction (upward) and the per-item displacement direction (44px→0, also upward) are the same. This is intentional (same-direction stacking is smoother),
  but the two speeds must be kept an order of magnitude apart, otherwise it reads as "floating upward together" rather than two layers
- The right-hand title waits until the list is half spread (46f) before entering: the opening gives the list only one protagonist (Q5), otherwise viewers hunt back and forth between two places
- The icons are monochrome line icons, and only the current item uses a solid highlight, with the unread badge in the accent colour; on a light interface the strokes and shadows must both be re-tuned

## Reference implementation
demos/ui-entrance/list-reveal/
(ListReveal.tsx: graphite dark scene, a sidebar poster with the list on the left and a 120px title on the right)
