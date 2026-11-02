---
name: carousel-3d
summary: 8 cards are arranged in a ring and the whole ring rotates one full turn (a constant-speed base plus a stepped component that docks every 45°); each card only revolves around Y and is itself a billboard facing outwards, with two layers of same-direction texture (front and back) plus backface-visibility:hidden so it is always upright and never inverted. The card at the front is lit and the caption below the ring changes text accordingly, and the camera stays pinned at a shallow downward angle throughout
use_when: Looping showcases of portfolios / template libraries / integration lists; background shots or landing page heroes that need a seamless loop
duration: about 5.6s (168f@30fps)
energy: Medium (a steady-state motion that can loop forever, with a docking beat every 45°)
---

## Intent
The easiest way to show "a set of things" is to line them up for a horizontal slide, but a horizontal slide has a start and an end. A ring does not - it naturally
loops, and no matter how long the viewer watches it never feels "finished". What this card really solves is the point where a ring carousel most easily goes
wrong: the back of the cards. The approach is double-sided same-direction texture, so seen from inside the ring or outside it is the same upright card, and over one full turn of the ring
no frame shows a mirrored or inverted card.

## Motion core
(demo version: acid-lemon graphite dark scene, the video-shotcraft shot recipe gallery, cards 340×460, radius 700px, 1920×1080 native coordinates)
- The positioning formula on the ring is a single line: `transform: rotateY(i*360/N) translateZ(RADIUS)` - first rotate to its own
  azimuth, then push out along the new Z axis by the radius. This one step does both the layout and the billboarding: the card's normal naturally faces outwards;
  the card turned to the front is pushed a further 44px along the normal (translation only, no rotation), and at docking this reads as "selected"
- The whole ring's rotation comes from the parent layer: `ring.transform = rotateY(-spin)`, and the card's own transform has only the positioning component.
  **Cards never rotate around X or Z** - this is the fundamental guarantee of "always upright"
- The turn angle is not strictly constant speed: `turn = 0.5·f/168 + 0.5·stepPart(f)`, and `stepPart` advances one step every 21f (8f docking + 13f smooth change of position).
  The constant-speed base keeps the whole ring always moving (steady-state loop), and the stepped layer gives a "push - dock" every 45°;
  8 steps × 21f = 168f is exactly one turn, and at f=168 turn=1, so the first and last frames join pixel for pixel
- Double-sided same-direction texture: front and back use the **same card face**, with back additionally given `rotateY(180deg)`,
  and both layers set `backface-visibility:hidden`. So the front is seen from outside the ring and the back from inside, and the content on both
  is oriented the same way - with only one layer, mirrored text would show when the card turns to the back of the ring
- Front-centre lighting: `hl = smooth(1 - |azimuth|/26°)`, driving the fluorescent outline, the graphic colour (graphite grey → fluorescent yellow-green interpolation) and the push-out amount; the caption below the ring
  (mono number + 72px name) scrolls up within a clipping window with the stepped layer to change text, and freezes at docking
- The camera is fixed and does not move for a single frame: `perspective: 2200px`, ring container `translateZ(-RADIUS) rotateX(-9deg)` -
  the front card lands at z=0 (rasterised at native size so text is not blurred), and all motion comes from the ring's rotation; this is a "gallery" not a "roller coaster"
- Ground: a reflective disc at 2.7 times the radius + a 96-tick scale ring (rotating with the ring) laid flat with `rotateX(90deg)` under the cards' feet; plus a reflection ring
  mirrored with the ground as the mirror by `scaleY(-1)` (leaf layer at 8% opacity + fade-out mask; opacity cannot be put on a preserve-3d container, or the whole ring is flattened)
- Atmospheric perspective: a base colour is overlaid on the card face according to the card's azimuth `(1-cos θ)/2` (70% at the very back), so the front-back relationships of the ring are readable at a glance

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Card count | N=8 (azimuth interval 45°) | 8 cards do not occlude each other front to back at a 700px radius; with >12 cards the cards overlap at the edges and RADIUS must be enlarged in step |
| Radius | RADIUS=700px (card 340×460) | Radius / card width ≈ 2 is the sweet spot for density; at <1.5 times, the cards at the back of the ring squeeze out through the gaps of the front cards and the picture becomes messy |
| Rotation speed composition | 50% constant speed + 50% stepped (21f/step, 8f docking) | With a stepped share >70% the whole ring almost stops at docking and the loop reads as "stuttering"; <30% the docking feel disappears and it goes back to flat constant speed |
| Number of turns | 1 turn across the film (8 steps) | Both the number of turns and the number of steps must be integers for the loop to work; non-integer values make the last frame jump |
| Perspective | `perspective: 2200px` | Relatively flat perspective against a 700 radius; below 1200 the near cards are exaggeratedly enlarged and it reads as a fisheye |
| Camera pitch | `rotateX(-9deg)` | Only a "slight look down", just enough to show the ground disc and the scale ring; beyond -20° the ring is squashed into an ellipse |
| Lighting window | azimuth ±26° | If the window is too wide, two adjacent cards are half-lit at once and the star is unclear; too narrow and the whole ring is grey mid-change |
| Reflection | 8% opacity, fade-out starting at 62% | At >15% the text in the reflection is readable and fights with the caption below |

## Known pitfalls
- Steady-state looping is both this card's characteristic and its limit: **it has no beginning and no end**. The stepped docking gives a beat, but as the main shot
  it is still rather flat, and it is suited to serving as a background layer, loop material, or being combined with foreground text / camera motion
- Every frame resets the transform of all 8 cards (`rotateY(i*45) translateZ(RADIUS + 44·hl)`) - the rotation component is constant,
  and only the push-out along the normal changes with the lighting. This makes "the card itself does not take part in rotation" explicitly visible in the code; do not hang the push-out on the rotation
- `backface-visibility:hidden` needs the `-webkit-` prefix in some WebKit versions (already written both ways in the code).
  Missing the prefix makes both face layers visible at once, and the card content piles into a mess
- The card faces are hand-built shot recipe card placeholders (mono number + generated graphic + large numeral + name); in production replace them with real screenshots,
  **and front/back must be swapped for the same content**, otherwise the premise of double-sided same-direction texture is broken
- When the ring turns to the back, the card is a "front facing away from the viewer" (what is seen is the back layer), so the content is always readable - but this also means
  there is no room for a "flip reveal". To do a flip you must abandon the backface-hidden approach and start a different set-up
- The dark soft-glow background + graphite card faces + atmospheric darkening go together as a set; when switching to a white background, both the darkening layer and the reflection must be re-tuned
  (change the darkening to blend towards the background colour, and lower the reflection opacity to about 5%)
- The caption's "current card" is taken from the step number of the stepped layer, not from the real azimuth: the constant-speed base lets the ring travel about 8.6° further during docking,
  so the front card sitting slightly to the left is normal; if you change the stepped share, confirm that at docking the lighting window (±26°) still covers this drift

## Reference implementation
demos/ui-entrance/carousel-3d/
(Carousel3D.tsx)
