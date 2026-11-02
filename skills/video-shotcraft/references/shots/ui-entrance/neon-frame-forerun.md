---
name: neon-frame-forerun
summary: A strongly perspective right-angled neon frame races on from both ends of the left edge and takes shape first; the page goes from dark to lit inside the frame while the components/text inside drop in from above in 3D with same-shape soft shadows, staggered, completing their fit in sync as the page lights up; the background neon group (in the demo, a depth-echo tunnel of same-shaped frames) goes out in the final segment to give way
use_when: In a dark-scene brand film, giving a UI panel an "appearance ceremony" (frame first, content after); the first reveal of a feature area; segment openers in a neon / cyber tone
duration: frame race ~0.7s + light-up & drop-in ~2.7s + background-off wrap-up ~1s; whole segment 4-4.7s (demo 140f)
energy: Medium-high (three layers of action stack in, but all serve the same appearance)
tags: effects
---

## Intent
Set the frame first, then fill in the flesh: the neon wireframe races from both ends like runway lights to outline the position, announcing
"something is about to appear here"; while the page goes from dark to lit inside the frame, the components drop in from the air with their shadows -
viewers see the interface being "placed" into the frame. The three layers of action (frame race / page light-up / component drop-in) must **mesh in sync**: the drop-in progress advances in step with the light-up progress and finishes slightly behind it,
and the frame light finally merges into the panel glow. The background neon tube group goes out in the final segment, yielding brightness to the
protagonist to complete the wrap-up.

## Motion core
- Neon frame: a strongly perspective right-angled frame, with two white-hot bright heads setting off from the midpoint of the left edge, one up and one down (20f, swift starts fast,
  brakes and collides at the midpoint of the right edge with a flash); the tube is built from four stroke layers stacked with glow (wide soft halo / medium halo / colour core / white-hot core),
  with no blur filter, cheap and crisp; once formed, the core line recedes to a hairline and the frame light merges into the panel rim glow
- Page light-up: only after the frame closes does the page surface out of the black (16-30f), then goes from dark to lit (24-84f smooth),
  while a layer of cold purple dark veil withdraws from the left edge towards the right, reading as "the neon lights up the page"
- Component drop-in: **true 3D hovering** - the panel and components are all inside preserve-3d, the components at translateZ 120-170px,
  and same-shape silhouette soft shadows fall on the panel (the higher, the larger, blurrier and fainter, offset towards the lower right); brightness uses leaf-node brightness,
  and no filter/opacity is put on the 3D parent (it would flatten the 3D). Each piece falls with 24f of acceleration + a soft landing,
  with landing points 54→104f staggered by "sidebar top to bottom → main area top to bottom" (dense first, sparse later), finishing ~20f after the light-up
- Background: the same frame as 5 echo layers in depth (translateZ receding, enlarging layer by layer) forms a neon tunnel,
  and once the frame closes the layers "strike" from near to far (a deterministic flicker of fluorescent tubes igniting); in the final segment the middle goes out first and the two ends later (94-118f)
- Camera: rotateY −30° → −12° (0-96f EASE.out long deceleration), then in the hold segment a very slow further 1.5° turn

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Frame race | 20f, two heads racing towards each other (swift) | A single head drawing reads as drawing a picture; >30f and viewers cannot wait for the content |
| Hover height | translateZ 120-170px, shadow converging with height | Precedent: too small a height + starting too early = the shadow is imperceptible (round 1 of v3 was reworked, enlarged 1.7x and delayed) |
| Drop-in window | 24f each; landing points 54→104f, finishing ~20f after the light-up | Drop-in finishing before the light-up = furniture dropping into a dark room; lagging too much reads as two separate acts |
| Stagger | Staggered starts, overlapping parallel falls (EASE.out distribution, dense first, sparse later) | Serial waiting was rejected (general precedent for falling rhythm) |
| Background off | Middle lit, ends off last; each layer flickers out over 6f, layers 7f apart | Without going out the protagonist does not stand out; all off on the same frame reads as a power cut |
| Drop-in granularity | Card/row level (brand, 4 nav items, greeting, 3 number cards, 4 task rows) | The finer the granularity the more expensive; the fewer the elements, the larger and more readable each piece |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- Hovering drop-in = the core signature of the clickup language (a verified taste signal); this card
  shares the FloatWrap pattern with graze-face-tour - an imperceptible shadow is as good as not done
- Division of labour with brand-frame-snap: that card is the beat drama of a brand frame clicking into position;
  this card is the appearance ceremony of frame first + content dropping in, with the frame only a prologue
- Note on a derived direction: the viewpoint rotation variant (camera arc rotating left → right + simultaneous drop-in)
  was once ruled "change and look again" (requiring all components to drop in at the same time), and has been consolidated into the neon-frame-orbit-drop card

## Reference implementation
demos/ui-entrance/neon-frame-forerun/
(NeonFrameForerun.tsx)
Original source: clickup-30.mp4
