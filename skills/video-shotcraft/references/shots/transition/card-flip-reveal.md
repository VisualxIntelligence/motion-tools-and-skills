---
name: card-flip-reveal
summary: Feature-card 3D flip reveal: the card flips 180° about the Y axis, the front UI catches a light that moves with the angle as it passes the thinnest point on the side edge, and the back reveals a large conclusion number, with the cards sweeping across the whole row one at a time, staggered
use_when: Paired "feature → result" storytelling: a row of feature cards each flipping out its own metric/conclusion in turn; an element-level transition card
duration: 150f in total (~5s, including hold); per card 4f wind-up + 16f flip + ~10f spring settle, three cards staggered by 12f
energy: Medium-high
tags: data
---

## Intent
The library already has wipe-transitions' blinds in the "flip" family (blades flipping one by one, about changing pages).
This card is a **semantic flip**: the two faces of a card are a cause-and-effect pair — the front is the feature interface,
the back is the numeric conclusion it brings. The flip action itself
is the answer to "so what?", the standard grammar of Apple's bento sections. Sweeping a row one card at a time with a 10f stagger,
three cards and three numbers read as "results reported in succession".

## Motion core
- perspective 1600px + transformStyle preserve-3d; both faces each
  backfaceVisibility hidden, with the back pre-rotated rotateY(180°)
- The flip in three stages: 4f wind-up (leaning back −10° in the opposite direction, ease-out) → 16f
  bezier(0.55,0,0.3,1) accelerating to 194° (14° overshoot) → a physical spring
  (damping 15) settling back to 180°; during the flip translateZ lifts 60px (sin envelope)
- **Lighting**: faces are shaded by their angle away from facing front (`(1−|cos θ|)` darkening, dark side 0.55 /
  bright side 0.4); over the 56°→124° range of the side edge a narrow lit band sweeps from the left of the card to the right with the angle,
  its intensity a triangular envelope peaking at 90° (the thinnest instant) — only a highlight linked to the angle reads as "light sweeping across
  a turning face"; it is physical lighting, not an extra glint effect
- **Front and back in opposite phase**: in the demo the front is a dark feature card (graphite dark field), and the back is a porcelain-white
  conclusion card — flipping = going from dark to light, and once all three have flipped the picture changes from a row of dark cards to a row of white number
  posters; the 158px number on the back tightens 1.08→1 on settling, the conclusion label rises 4f later, and the "before / after" comparison bar above it
  shortens after settling
- Space: the cards stand on a dark mirror floor, each card has a vertical mirror reflection that flips in sync
  (mask fading 26%, opacity 0.22), and the contact shadow width expands and contracts with the projected width |cos θ|
- Stagger delay 12f/card; truly still ≥40f once all have flipped (demo: hold 78f after 72f),
  with the camera on a very slow push-in 1→1.03 throughout

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Flip duration | 4f wind-up + 16f flip + ~10f spring | <14f and the instant of the side edge cannot be seen; >28f reads as turning slowly; cutting the wind-up reads as being bounced open rather than "flipping" |
| Overshoot | 194°→180° (14°), spring damping 15 | Settling with no overshoot reads as a stiff stopwatch stop; damping <12 rebounds twice and reads as jelly |
| Lighting | Face darkening ≤0.55 + side-edge narrow-band peak @90° | A peak that is off 90° reads as a texture error; a sweep of light with no face darkening reads as a white stripe pasted on |
| Stagger | 12f/card, ≤4 cards | Flipping simultaneously reads as the whole wall flipping, and the one-by-one rhythm of "results reported in succession" is lost |
| Back content | A large number (150–170px class) + one line of label + at most one set of comparison bars | Cramming a full UI on the back cannot be read — after the flip there is only one beat of attention; with numbers over 160px, wide text like "−41%" pushes out past the card edge |
| Close | The last card truly still once settled ≥40f | R1 |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The two faces must be semantically paired (interface → its result); if unrelated content is flipped out, the flip
  is merely a fancy image swap
- When the front uses a screenshot in real footage, watch the backface rendering cost; with three or more cards split them into Sequences
- Sound candidate slot: a light "pop" on each card's flip-stop frame (sound-design §4.5), and three pops in a row
  double the rhythmic feel

## Reference implementation
demos/transition/card-flip-reveal/
(CardFlipReveal.tsx)
