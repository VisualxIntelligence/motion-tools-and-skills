---
name: orbit-ring-title-open
summary: On a graphite dark stage, eight dark 16:9 content cards are evenly spaced at 45° on a 720×380 ellipse and revolve at constant speed (the card bodies never tilt; depth comes only from a ±12% scale given by sin θ, z-order, and distant dimming and defocus); while the ring expands, the card contents freeze on their first frame and all eight start playing together after f24; a centred two-tier title unblurs letter by letter and settles downward, and at the moment the keyword lands a fluorescent marker block sweeps in from the left to cover it, the letters inverting to ink as it passes, with a mono sub-line surfacing afterward; optionally in the last section the whole line defocuses and fades out, the ring still turning, handing off to the next shot
use_when: The first shot of an opening = "this product has a whole set of things"; the front-of-house shot for a material library / template library / feature matrix / case collection; when you need real moving product footage to carry a statement, instead of arranging screenshots into a static nine-grid
duration: 150f (5s@30fps; 2.9s of steady-state touring + a very slow push-in after the marker block lands at f64; with HANDOFF_EXIT on, the exit starts at f118 to hand off)
energy: Medium (the only sustained motion is the constant-speed revolution, and the whole film has just one impact: the marker block's sweep)
tags: ui-entrance
---

## Intent
When an opening wants to say "we have a whole set of things", the most common approach is to arrange screenshots into a grid — but a grid is static, and what the audience
reads is "a pile of pictures", not "a set of moving products". This card turns the display into a **circular tour**: eight cards revolve at constant speed along an
ellipse, always with cards entering the frame and cards leaving it, so the picture carries the implication of "there is more", while the title stays firmly
pinned in the very centre, unaffected.

The key trade-off is that **the card contents really play**. A static screenshot on the ring is only recognised as a "carousel"; with real
motion running in the cards, the same ring immediately becomes "the product at work". But if all eight cards start playing at the same time, eight motions fight for the scene and none of them gets read
— so during the entrance the card contents are **frozen on the first frame**, and start playing together only after the ring has expanded and the title has begun. The audience's
attention order is therefore: first recognise this is a ring of product footage → read the title → only then notice that everything in the cards is moving.

## Motion core
- **Placement on the ring**: `θ = -π/2 + i·2π/8 + t·0.3`, `x = 960 + cos θ·RX·ringScale`,
  `y = 540 + sin θ·RY·ringScale`. An ellipse with RY/RX ≈ 0.53 reads as a "ring seen from above"; a true circle reads as a turntable.
  The elliptical orbit itself is drawn as a hairline in the accent colour at 16% opacity, traced with pathLength during the entrance 0–30f
- **The card bodies never tilt**: a card only changes position along θ, its own transform is only scaling, with no rotation of any kind.
  Depth is left entirely to `depth = sin θ` (+1 = bottom of the frame, near; −1 = top, far):
  `scale = 1 + 0.12·depth`, `zIndex = 10 + round(depth·5)`; far away (depth<0) additionally layer
  `blur(1.6·|depth|px)` + a dimming layer (depth of field + aerial perspective), and near cards get a little top light. Scale, z-order, and
  brightness must be driven by the same depth, otherwise "a far card covering a near card" appears
- **Ring entrance**: f0–24 `ringScale 0.62→1` (expo-out, covering eighty percent in the first third of the time), expanding from the centre;
  cards also fade in one by one, card i fading in over 11f from frame `2+1.5i` and growing 0.9→1. The expansion and fade-in overlap,
  reading as "the ring grows out" rather than "cards being pasted on one by one"
- **Freeze the first frame, then play**: the card contents are wrapped in `<Freeze frame={max(0, frame - 24)}>`. Before f24
  all eight cards stay on their own frame 0, and from f24 they enter the normal timeline together
- **In-card coordinate decoupling**: the card content is drawn at 960×540, and the outside is scaled to card width with `scale((CW·s)/960)` +
  `transform-origin: top left`. The content component does not need to know it has been shrunk, so when landing real screenshots or other
  shot-card components from the library, not a line needs changing. Line-drawing cards use `pathLength={1}` for the dash, so path length does not affect the first frame
- **Two-tier title blur-slide letter by letter**: the upper line 64px secondary grey (starts f10, stagger 1f, 27f per letter), the lower line
  156px protagonist large text (starts f18, stagger 2f, 32f per letter — heavier and slower). Each letter has two channels that start together but end differently:
  the unblur runs the full per-letter duration (`blur (1-p)·fontSize/6`), the downward settle takes only the first 1/3 (`translateY (1-p)·fontSize·0.22`),
  with quint-out easing. The offset stops first and the blur stops after, so the letters have the feel of "coming into focus after they have settled"
- **Marker block sweep + inversion**: `spring(frame-50, damping 20, stiffness 190)` drives `scaleX`
  (capped at 1.03), `transform-origin: left center`, with the block extending 0.14em wider than the text on each side, laid under the text. The text is drawn in two layers:
  the white text layer is clipped at the left of the block's leading edge, the ink text layer (onAccent) is clipped at the right of the leading edge, and the leading edge position is converted to the text box by
  `(m·(W+0.28em) − 0.14em)/W` — it inverts as the block passes, reading as "swiped by a highlighter"
- **Title scrim**: a patch of dark radial scrim is laid above the card layer and below the text layer, so near cards are dimmed as they pass behind the title
- **hold**: f40–150 the whole picture pushes in smoothly by 2.5%, with the ring still revolving at constant speed
- **Exit (optional, HANDOFF_EXIT)**: from f118 the whole line goes `opacity 1→0` + `blur 0→6.5px` over 10f,
  after which only the ring is turning — turn it on when it is followed in the finished film by a crash-zoom / a direct cut through a light stage; the single-shot demo stops on the complete poster
## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Ellipse radii | RX=720 / RY=380 (cards 400×225) | RY/RX≈0.53 is the sweet spot for a "ring seen from above"; a ratio → 1 reads as a circular turntable, → 0.3 the cards squeeze into a strip at the top and bottom edges |
| Card count | 8 (azimuth interval 45°) | 8 cards at this radius never overlap at any rotation angle; ≥10 cards require enlarging RX/RY together, otherwise near cards press the edge |
| Revolution speed | 0.3 rad/s (about 86° in 5s) | **Do not speed it up because it "looks slow"**: above 0.5 rad/s cards sweeping the frame edge cause a strobing feel, and they upstage the title |
| Ring entrance | f0–24, scale .62→1, expo-out | <15f feels like a pop-up; >30f and the ring is still growing when the title begins, the two things covering each other |
| Per-card fade-in | Card i starts at frame `2+1.5i`, 11f | A step of 1.5f is just enough to read "in sequence"; >3f and the last one arrives after the title |
| Play-start frame | PLAY_START=24f | Must be ≥ the frame where the ring finishes expanding; earlier makes eight motions fight for the scene together during the entrance |
| Depth | Scale ±12%, far defocus ≤1.6px + dimming | Scale >15% and the top cards shrink into icons, the ring reading as a "perspective tunnel"; defocus >3px and the far cards read as dirty |
| Title | Upper line 64px/500 grey + lower line 156px/600 white | The ring is always moving, so the protagonist line must be big and heavy enough to hold it down; two lines at the same size lose hierarchy |
| Letter-by-letter rhythm | Upper line stagger 1f / 27f per letter; lower line stagger 2f / 32f per letter | A 1–2f stagger gives the feel of "unblurring as a whole"; ≥3f reads as a letter-by-letter typewriter |
| Marker block | Starts f50, spring damping 20, fluorescent yellow-green #c6f432 | damping <14 bounces out past the colour block's edge; on the dark stage it is the only highly saturated colour block, so do not give a second one |
| Sub-line | video-shotcraft mark + lowercase wordmark 30px + mono 26px "SHOT RECIPE CARDS" (tracking 0.2em), surfacing over 16f from f60 | Wide-tracked mono is the reading of a "product codename"; using the same font as the title reads as a second title line; do not write numbers like card counts that will go out of date |
| Exit (optional) | f118–128, blur 0→6.5px | The whole line defocuses uniformly; **a letter-by-letter exit reads as a second entrance** |
## Known pitfalls
- **The cards must not tilt with θ**. Adding `rotate(θ)` to the cards instantly turns the ring from a "display" into a "roller coaster", and the text inside the cards
  tilts too, taking readability straight to zero. Cards change position, not angle
- The card content must carry its own static skeleton on the first frame (base colour/border/label/dark-base track). What is shown during the freeze is frame 0,
  and if the card's motion is "drawn on from zero", those 24f of entrance are eight blank cards. Every placeholder card in the demo has a
  dark-base sparkline / faint draft lines / a permanent prompt added, precisely so that the first frame is not empty
- `zIndex` must follow depth. If only scaling is done without ordering z, the DOM order lets the rear cards cover the front ones,
  and the near-large/far-small three-dimensional feel is voided on the spot
- The marker colour block and the text layers are a pair: block `zIndex:0` + text `position:relative; zIndex:1`. If the relative on the
  text is missed, the block covers the text (in a stacking context static elements are ordered after positioned ones)
- The title's `white-space: nowrap` is a precondition for the marker block — the block's 0.14em left/right extension and the inversion clipping both assume the highlighted
  phrase sits in one line box. After a line break the colour block splits into two pieces across lines. If the character count of the highlighted word changes, change W in the leading-edge conversion to match
- The ring is a background layer but it is always moving, so **do not lay a second moving thing on top of the ring** (particles, sweeps, gradient
  breathing). With one sustained motion already present, a second makes the picture unreadable in terms of primary and secondary
- Division of labour with `carousel-3d`: that card is true 3D (`rotateY + translateZ` + backface-hidden),
  where cards turn round to the back of the ring, suited to a pure display in a seamless loop; this card is a 2D elliptical fake depth, with cards always facing the audience,
  suited to an opening of "ring as the base + foreground title". Use the former when you want cards to flip over, the latter when you want the title to hold down
- The eight cards in the demo are original generic DOM placeholders (dark product cards + a single fluorescent accent colour, with card-frame shadow/brightness changing with depth), containing no product screenshots;
  when landing, replace the whole block with your own shot-card components or real page screenshots, and not a line of the ring's grammar needs to change

## Reference implementation
demos/opening/orbit-ring-title-open/
(OrbitRingTitleOpen.tsx)
