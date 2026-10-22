---
name: ui-strip-away-outro
summary: A subtractive ending — after clicking Publish, the entire editor UI evaporates layer by layer in staggered fashion from the periphery to the centre, leaving on a black field only that one button, which slides to screen centre and enlarges, then fades out to hand off to the wordmark final
use_when: An outro with "publish / done" semantics; a product ending that wants to say "after one click all the complexity disappears"
duration: ~4.8s (144f: cursor into position 34f → evaporation ~40f → button alone → wordmark takes the baton → wordmark hold ≥1s)
energy: Medium (quiet operation in the first part, continuous exit in the middle, no instantaneous impact)
---

## Intent
All the endings in the library are "additive": outro-group-photo-launch has elements flying in for a group photo, and the logo
sting holds still and then delivers an Easter egg. This card is the only "subtractive" route — the click detonates the exit of the whole UI,
the black field keeps only the semantic focus (the button that was clicked), translating "publish = complexity zeroed" into
a motion narrative. There are two crux points: **the evaporation must have order** — from the periphery to the centre one layer every 4f,
each layer with its own directional displacement (each scattering off-screen), and out-of-order or all going out in the same frame reads as a power-failure glitch;
**the button is the sole survivor and must migrate** — during the evaporation it slides from a corner of the toolbar to the screen centre,
enlarges 1.5x, with a white halo strengthening as the black field does, completing the elevation from "UI control" to "ritual lead",
and finally fades out to hand the black field over to the wordmark.

## Motion core
- 6 evaporation layers: sidebar → properties panel → canvas cards → both ends of the toolbar → canvas base → middle of the toolbar,
  starting +4f after the click, one layer every 4f; each layer STRIP_DUR 14f, Easing.in(quad)
  accelerating off, fade + directional displacement + 0→7px evaporation blur (sidebar −140,0 / panel −90,20 /
  toolbar ends ∓80,−60 / canvas base 0,40 / toolbar middle 0,−50)
- The 4 cards inside the canvas are each staggered a further 3f, with displacement alternating left and right (±70px) — a large block
  vanishing as a whole reads as a layer being deleted, and breaking apart and leaving is what makes "evaporation"
- Background pressed to black: with the evaporation of the canvas base layer (from +20f over 20f) the grey ground → #111110
- Button: on click spring(damping 12, stiffness 220) compression pulse; during the evaporation
  position / size interpolate sliding toward the screen centre (18f, inOut cubic), scale ×1.5, white halo
  30→70px strengthening with the black field; from +52f a 12f fade-out
- Wordmark takes the baton: at +62f spring(damping 14, stiffness 90) fade-in +
  86%→100% scale, finalising on the black field
- The cursor fades out within 10f after the click — the lead has changed, and the cursor must exit

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Inter-layer stagger | 4f × 6 layers | All going out in the same frame reads as a power failure; >8f drags into a slow demolition and the sense of ritual disperses |
| Single-layer duration | 14f, ease-in accelerating | An ease-out exit reads as "floating away" and not as "evaporating"; >20f sticky |
| Evaporation order | periphery → centre, with the button's layer last | The centre emptying first reads as a glitch; the button's layer leaving first collapses the whole card |
| Displacement amplitude | 50–140px, each direction toward off-screen | Pure fade with no displacement reads as an opacity adjustment; the same direction reads as the whole screen panning |
| Button migration | 18f slide to screen centre + scale ×1.5 + halo strengthening | Without migration it is a small button in a corner on the black field, reading as a missed deletion; migrate first and extinguish after, the order must not be reversed |
| Wordmark takes the baton | enters ~10f after the button fades out, spring finalising | On screen together with the button they fight for the scene; a black-field empty gap >20f feels like the film has ended |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Division of labour with outro-group-photo-launch: the group photo is an "additive" peak final shot (a multi-feature
  product with everyone taking a bow), this card is a "subtractive" ending (a single action's semantics, getting quieter and quieter) — choose one according to
  the product's temperament, and do not double up on endings in the same film
- Each evaporating layer must be a **semantically complete UI block** (sidebar / panel / toolbar); slicing layers by
  pixel region exposes structurally unreasonable broken states during the stagger
- The button's zIndex is kept on top throughout its migration — any evaporating layer drifting past in front of the button is a giveaway
- The trigger action must have "terminal" semantics (Publish/Ship/Done); using Save or an ordinary
  confirmation to trigger the evaporation of the whole UI makes the semantics unequal to the pageantry
- In real use the button takes the brand highlight colour (the original film was Framer blue), and the demo uses the accent indigo as a placeholder
  — the contrast between button and halo on the black field is the lead's halo, and a weak colour makes the elevation fail

## Reference implementation
demos/outro/ui-strip-away-outro/
(UiStripAwayOutro.tsx)
Original source: framer-ai 33–36.5s
