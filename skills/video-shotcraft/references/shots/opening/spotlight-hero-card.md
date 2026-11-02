---
name: spotlight-hero-card
summary: In a darkened theatre a tungsten spotlight (with a volumetric light shaft) sweeps across the page and locks onto one card; after an oblique push-in the card pops up and hovers, a champagne-coloured light beam traces its outline for two laps, and together with the 3D annotation it settles back into place
use_when: A "single protagonist" style product opening; stands one core object (a card/entry/module) up as the lead of the whole film
duration: 172f (about 5.7s; lock at f34 → touchdown at f142 → 30f of truly still hold)
energy: Medium (the shot with the highest finish, slow and steady in rhythm)
tags: effects, camera
---

## Intent
The opening says only one thing: this one card is the atomic unit of the product. The spotlight guides the audience's gaze, the pop-up and hover give it volume and weight, the outline light beam is a metaphor for "scanning/inspecting", and finally settling back into place shows that it belongs to this page.

## Motion core
- **Lights out**: a real page screenshot (Q1) is multiplied down as a whole page to ~6–14% brightness (warm black rgba(14,12,10), preserving hue), and only inside the pool of light is the page its native colour;
  switching the light on is "pushing a fader": f1–6 brightens → flashes back to 62% → settles
- **Pool of light**: a multi-stop near-Gaussian falloff (centre transparent → edge fully dark, not a hard-edged ring) + a low-intensity tungsten warm-white soft-light;
  it wanders through 3 intermediate stations (2–3f pause between stations, smooth in-out) then locks onto the card centre, the pool contracts + a 6% pulse at the moment of locking, and outside the pool it dims a further notch;
  after locking (f38–58, along with the push-in) the screen-space circular pool cross-fades into a **page-space card-shaped light**: under the same camera, a whole-page dark layer
  (translateZ 1px, 0.94 warm black) has a card-shaped soft hole cut at the card position (tight hole σ22 + a ring of 15% wide spill σ60), and the card sits above
  this dark layer in z, so it is fully lit from edge to edge, keeping native text contrast, with falloff happening only outside the card; the soft-light warm light fades out in sync (no bloom stacked on the card);
  a ring of warm-white hairline rim light around the card edge + a very faint outward spill make the outline read clearly on the dark page; during the hold the dark layer breathes very slowly at ±1.2%
- **Volumetric light shaft**: the light source is far above and to the right of the frame, a trapezoidal light shaft hits the pool of light (outer layer blur 28px, inner layer clip-path, soft edges),
  with a layer of deterministic floating dust inside the shaft; after the push-in the shaft fades by 45%
- The camera pushes in from a full-page frontal view to an oblique close-up (left-side camera position dominant), the focus moves left so the card lands right of centre with the left side left for the annotation; fully locked after the push-in
- Card rise (with overshoot) → hover sin bob → reseat (a slight press on landing + a ring of champagne-coloured landing light); the hover drop shadow falls toward the lower left (light comes from the upper right)
- An SVG rounded-rect outline light beam runs two laps: the first fast and bright, the second slow and faint (champagne gold + white core)
- After the card lifts off, a page-base-colour patch + a champagne-coloured outline is laid in its original position, brightening and vanishing at the instant of landing
- 3D floating annotation (the hover-3d-annotation technique, C3): to the left of the card, two lines of white heavy sans-serif video-shotcraft tagline "Your product, / in motion." (34px in page space,
  ≈100px after the push-in), a champagne-coloured marker bar grows behind the keyword over 12f (the text flips to ink), with a dark underlay beneath the annotation to suppress neighbouring card text;
  the annotation layer is drawn separately above the lighting layer with the same camera math as the page (camAt) — it is self-illuminated text and is not dimmed by the lights-out.
  At reseat the annotation lands back onto the page plane in sync (translateZ 92→4), not exiting early, and the ending is a complete poster
## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Card selection | cards[3], whose centre x is exactly 960 (page centre) | Choose the protagonist card first according to the "composition after the push-in", not just any card |
| Camera | Static full-page zoom 0.8 (0–40f) → 18f push-in to zoom 2.6; rotY 34° dominant + rotX only 8°, persp 1200; focus on the card centre shifted left 105px and up 10px; locked from after the push-in to the end | A lateral horizontal camera position reads better than a top-down shot ("shot from the left side, not from below", Q6); at the end, tail drifts such as zoom 2.6→2.58 are forbidden, and breathing is left to the light, not the camera (R1) |
| Lights out | Multiply 0.90→0.94 outside the pool of light (≈6–10% brightness) | <0.8 reads as a "dimmed page", not a theatre; >0.96 the neighbouring cards vanish entirely, losing the context of "being in the page" |
| Spotlight | 3 intermediate stations (4→28f), pool radius 400→300, locking +6% pulse; soft-light warm white 0.24; swapped for card-shaped light after locking | A circular pool over the card leaves both ends dark and blows out the middle ("a flashlight on the page") — the protagonist card needs a card-shaped soft hole lighting it from edge to edge; the intermediate stations make the "random sweep" believable |
| Volumetric shaft | Light source (pool.x+420, −720), shaft width 0.6× the pool; screen 0.34→0.06 vertical gradient | A source that is too near reads as a flashlight; a shaft that is too wide blurs into the pool as one lump |
| Action arc | Rise 10f (bezier(0.2,1.25,0.3,1) overshoot) → hover 58f (sin bob amplitude 4px period 40f, z=110px·lift) → reseat 18f, landing press 0.997 | Lock → landing ≈108f≈3.6s — a finish-oriented shot must be "slowed to 3 seconds" (R3), and the first draft is almost always too fast |
| Outline beam | lap1 68→82f (strokeWidth 5+2.5 double layer), lap2 88→108f (3.5+1.75, overall opacity 0.62); strokeDasharray "0.16 1" running dashoffset | Two laps of different speeds read as "continuous scanning", while one lap is a blink; the beam is given to the protagonist only once (Q4) |
| Double-layer shadow | Offset to lower left `-10·lift, 10·lift …, -36·lift 48·lift 90·lift`, growing with height | If the shadow does not grow with height the hover does not hold; the direction must match the light source |
## Sound
The lights-on fader push is pinned to a low, dull light-clunk (f2), the pop-up is pinned to whoosh-big (f56 in this demo; pinned at f127 in the template film), the beam scan is pinned to sparkle (f68), and the reseat is pinned to transition-snap (f142) — the pop-up / light effect / settle each get their own dedicated sound (S2, S4).

## Known pitfalls
- A multi-card group dance in the opening cannot carry the first impression (Q5) — the opening was torn down and redone repeatedly before converging on a single card; start the draft directly from a single protagonist + a complete action arc
- Text on the card blurs in the push-in close-up, the root cause being texture rasterisation resolution, not DoF — for the accompanying technique see aesthetic rule Q2
- Per-card glint flashes were rejected twice ("it is not necessary for every card to flash", Q4); light effects go strictly to the protagonist only
- The dark layer for the card-shaped light must be in page space (inside PageCam, translateZ between the page and the card); a screen-space mask cannot keep up with perspective and the card's lift; the card translateZ must be at least +2px, otherwise after reseat it flickers coplanar with the dark layer
- The right edge of the annotation's dark underlay must stop before the card's left edge, otherwise it presses a dark wedge on the left side of the card face
- If the annotation is drawn inside PageCam and below the lighting layer, it gets darkened to grey text together with the lights-out multiply — the annotation layer must be wrapped separately in the same camera and drawn above the lights

## Reference implementation
demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx (derived from lines 82–220 of template/src/aifl/live/SceneOpen.tsx, changed in the second round to the dark-stage theatre version)
