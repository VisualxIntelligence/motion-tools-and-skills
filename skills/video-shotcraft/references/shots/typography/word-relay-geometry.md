---
name: word-relay-geometry
summary: Three benefit words each carry their own dedicated geometry relay — a dashed large circle spinning with deceleration + a comet arc running → three solid circles growing by trim in turn and then closing in to bite tight → a chrome metallic sheen sweeping past and then, a beat later, settling to pure white; the old word shrinks to 0.86 and fades out, the new word is revealed outline → fill
use_when: Three-point benefit statements (faster / better / stronger); brand-values passages; a mid-section push that needs "one word, one world"
duration: about 6.0s (180f@30fps: three segments of ≈60f each, with 6f overlap between segments)
energy: Medium-high (a three-beat push + geometric motion throughout + background particles, no still frames)
---

## Intent
A three-point benefit statement is most easily made as three title cards hard-cut together. The relay approach gives each word a set of
**geometry that belongs only to it**: the dashed circle is "turning" (fast), three circles interlocking and closing in is "biting into each other" (tight / good), and
the metallic sheen is "hard material" (strong) — the geometry itself is arguing in place of the adjective. The third word
gets an elevated treatment (sheen sweep + settling to white) because it is the conclusion. Background dust motes, the shared stage light and the three-segment progress bar at the bottom
stitch the three beats into one continuous space, otherwise it is still three cards.

## Motion core
(Demo version: a graphite dark-field cinematic title card, word list Faster / Tighter / Stronger, 1920×1080 native coordinates)
- The three segments are laid out by frame: Faster 2→62, Tighter 56→122, Stronger 116→180; each segment's entrance is 14f (snappy,
  `scale 1.06→1` + 10px defocus removal), exit 10f (exit strong ease-in, `scale 1→0.86` + 12px defocus on the way out),
  with the 6f overlap at handover being a baton pass rather than a hard cut; the last segment has no exit, holding 22f after settling to white
- Each word has three text layers (230px/800, static font Helvetica Neue): the `outline` layer `-webkit-text-stroke:2px`
  + transparent fill, the `fill` layer pure white — **the outline arrives in place first, the fill is revealed after**; the three layers share `padding: 0.08em 0.1em 0.28em`,
  otherwise the mask / background-clip is only painted inside the box, which would crop the descender of g and the right edge of the last character, exposing the outline layer underneath
- The fill of the first two words wipes in horizontally with a ±7% soft-edge `mask-image` (from 10f after the entrance, 18f, swift), and the outline layer's opacity
  drops in sync to 0.2, leaving a little ghosting
- Faster's geometry: a dashed large circle (r=400, `dash 10 16`) + an outer 120-division tick ring (r=452, turning slowly in reverse),
  on entrance growing over 22f from 0.4 to 1 snappy, while turning an extra 160° and braking with deceleration (a flywheel feel), after which it turns slowly at constant speed and never stops; a 16-segment
  fading white comet arc runs along r=400 at 7.5°/frame — "fast" is read from the two layers' relative rotation speeds + the comet's speed difference
- Tighter's geometry: three solid circles (r=218) `pathLength=1` + dashoffset trim growth, with the pen starting around each circle's own centre
  `rotate(-90 cx 0)`, delays 0/6/12f, 22f each (out), a glowing dot at the pen head that goes out once fully grown; from 92f the spacing among the three circles
  closes in from 340→300 over 14f (swift), the circle lines brighten once on settling, and the four intersection points light up as diamond rivet light dots (overshoot pop-out)
  — "tight" is a visible closing-in action
- Stronger has no geometry: from 120f the outline → a vertical chrome gradient (bright top — dark waist — bright bottom); over 124→148f a narrow white band tinted champagne warm (`100deg`, `background-size:300%`)
  sweeps from left to right; over 146→158f it settles to pure white + a bloom pulse, with a horizontal light band at the foot expanding from 0.2 width snappy,
  and the stage key light brightening on the same beat — the elevated treatment the conclusion word enjoys alone
- Below the word a 40px subsentence gives product evidence (rise word by word, in the demo three promotional lines for video-shotcraft), a mono counter "01 / 03" at the top left,
  a lens-engraved logo + video-shotcraft lowercase wordmark at the top right, a three-segment progress bar at the bottom (label-level texture);
  the camera pushes in very slowly 1→1.025 smooth throughout (no shake)

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Three-segment periods | ≈60f each, 6f overlap | About 2s per word is the lower limit for "reading the word + looking at the geometry"; overlap <3f reads as a hard cut, >12f and two words on screen fight |
| Entrance / exit windows | entrance 14f snappy / exit 10f exit | An exit shorter than the entrance is right (the exit should be decisive); an exit with an out curve reads as "reluctant to leave" |
| outline→fill | 18f swift, ±7% soft edge, outline keeping 0.2 | Leaving a little outline as ghosting is the source of the finish, and dropping it to 0 flattens the text; a window >30f makes the wipe-in as slow as a loading bar |
| Dashed circle | r=400, `dash 10 16`, scale 0.4→1, an extra 160° on entrance and braking to a stop | The braking is the first evidence of "fast"; a scale start >0.7 and there is no "growing out" |
| Comet arc | 7.5°/frame, 16 fading segments | It must be more than 8x faster than the ring to read the "speed difference"; with <8 segments the tail breaks into a dashed line |
| Trim growth | delay 6f per circle, 22f each | The phase difference is the key to "interlocking in turn", and growing simultaneously reads as three independent circles |
| Closing in | spacing 340→300 (14f swift) + intersection rivets | A closing amount <20px shows no action; >60px and the three circles crowd into a lump |
| Sheen sweep | `100deg`, `background-size:300%`, 24f smooth | 300% ensures the white band takes up only a small stretch of the text width (= a metallic highlight); the chrome base layer cannot be skipped, otherwise before the sweep it is a block of grey text |
| Settling to white | 12f + bloom pulse + foot light band | This one beat is the film's only "conclusion" treatment; delete it and the three words are on the same level, with no landing point for the third point |
| Font size and colour | word 230px/800, subsentence 40px, geometry `rgba(236,238,244,.42)`, graphite dark field | Geometry one step darker than the text is the hierarchy; geometry brighter than the text steals the lead |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **The three words must be three points of the same syntax (the demo uses all comparative single words, 6–8 letters)**:
  the periods are of equal length, and when word lengths differ greatly the geometry (circle radius, spacing) is hard-coded coordinates,
  so a long word would poke out of the dashed circle or land on the interlocking circles — when swapping the word list adjust r and the closing-in spacing in step
- `-webkit-text-stroke` is a prefixed property: only Chromium/WebKit have it, and under Firefox the outline layer
  is simply transparent (the word vanishes). Remotion renders on Chromium so it is no problem, but watch out in the preview environment
- The `pathLength=1` normalisation used for SVG trim has incomplete support for `<circle>` on some older browser versions,
  and the degraded behaviour is the circle being drawn in full all at once (losing the growth feel) — when porting, first verify one frame on the target
  renderer
- The exit trim is "entrance trim minus exit seg" by direct subtraction: if the two windows are too close
  (segment length <40f) it begins retracting before it has finished growing, and the circle is drawn only a small stretch
- The sheen layer and the fill layer are two stacked DOM layers: switching is by opacity crossfade, and if the `white` window
  and the `sh` window are tuned with too little overlap, there will be 1–2 frames where both layers are half-transparent (the text goes grey)
- The third word's elevated treatment can be given only once: if all three words in the film get the sheen there is no sense of conclusion
  (the spirit of P4 technique de-duplication); on sound, the three entrances are three rhythm points, and the third word's settling to white deserves
  a heavy accent of its own, for the scoring discipline see sound-design.md

## Reference implementation
demos/typography/word-relay-geometry/
(WordRelayGeometry.tsx)
