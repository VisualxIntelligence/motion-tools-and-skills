# Self-check before delivering

Scripts first: `asset-audit` CLEAN, `layout-check` CLEAN, `sync-check` passing (a remaining STARTLE is acceptable only on a deliberate stinger you can name). Then the two passes by eye below.

The agent runs this; the user never sees it. Open the contact sheet (`render.mjs page.html sheet.jpg --sheet 1`; it steps off scene cuts so dip frames don't look like blank ones) and go down the list. Fix, render stills of the changed frames, and check again.

## Frames

- [ ] No blank or near-blank frames except the intended dips at cuts.
- [ ] Every scene reads in one second: can you say what's happening from the thumbnail alone?
- [ ] `layout-check.mjs` prints CLEAN (every text box and key object claimed). Eyes miss these: a "sent" label sitting on a monitor's edge passed two human looks.
- [ ] Text fits its box, doesn't overlap a face or a key object, and every glyph renders (monospace fonts swap missing glyphs silently: `≈` showed up as `=`). Non-Latin text uses a CJK font stack.
- [ ] Labels that type on: the box grows with the text (a full-width box with two letters in it looks broken).

## Shapes and figures

- [ ] Each shape reads as the thing it is. Few-point polygons read as signs (a pentagon hand, a box torso); rebuild them from rounded forms.
- [ ] Silhouettes read: a pose that looks like something else (a baby on its tummy that reads as a caterpillar) needs a different angle, not more detail.
- [ ] Nothing floats: heads sit on necks/shoulders, props touch the hand or mouth that holds them (place props from anchor points).
- [ ] Draw order is right: nothing covers a face; back hair is behind the body.
- [ ] A recurring character looks the same in every scene.

## Storyboard conformance

- [ ] A still at the action beat of every shot matches its storyboard row: actor where the blocking says, doing what the row says, and the cause of the action visible.
- [ ] The gag/metaphor reads without explanation (someone seeing the frame cold understands it). A deliberate misspelling read as our own typo means the picture didn't carry it.

## Staging

- [ ] Objects rest on something (a monitor on a desk with a stand), people have feet on a floor, nothing hovers unless that's the point.
- [ ] Figures are distinct from the background they stand on (legs the same value as the floor disappear).

## Director pass (contact sheet at 2 fps)

- [ ] Pace fits the form (pace table in `storyboard.md`): quick for comedy, slow and held for ambient or lullaby. The failure is a hold with nothing happening, not a long shot.
- [ ] Framing varies (wide / medium / close / extreme close); at least one push-in or pull-out.
- [ ] No dead frames: every shot has something alive (a camera drift, a breathing motion, light changing), even when it's slow.
- [ ] Every visible action has its sound in `EVENTS`.
- [ ] The look fits the audience and matches the look brief (style, palette, line, ground, type). For an adult audience, no accidental defaults: everything rounded, outlines on every shape, many equal saturated colours, flat front-on staging, always-centred subjects.
- [ ] It doesn't look or sound like your previous piece.

## Motion

- [ ] A hand-drawn line boils at ~7.5 changes/s (every 4 frames), not every frame.
- [ ] Endings hold: the last line appears after motion has settled.
- [ ] Loops: frame 0 and the last frame match.

## Facts and assets

- [ ] Every fact on screen has a source you can name.
- [ ] `node scripts/asset-audit.mjs page.html` prints CLEAN.
- [ ] If there's a soundtrack: `node ../soundtrack/scripts/sync-check.mjs out.mp4` passes (on the beat, no startle).
- [ ] Private material (family photos, names) stays local and out of anything published.
