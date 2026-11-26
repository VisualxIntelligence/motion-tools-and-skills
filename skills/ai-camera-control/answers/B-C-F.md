# Answers: the pill (B), the set (C) and the variants (F)

This file answers 31 questions; 1 is UNPROVEN, 9 partly, and the other 21 are proven.

Format: question number, short answer, evidence, status. Evidence is a path in this repo, or "measured on the author's runs, not included". Statuses: PROVEN (shown by a file or a re-measurable number), PARTLY (the core is shown; the part that is not is named with its test), UNPROVEN (not supported by the files; the test is named).

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`. Longer arguments are in `docs/why/*.md`, `docs/failure-ladder.md` and `docs/variants.md`. The stand-ins are defined in `docs/engine.md`, section 11.

## B. The pill (stand-in)

**Q11. What is it exactly?**
A person is a small striped head with a white dot on a shoulder-width striped body (the pin), in a loud colour with diagonal stripes of colour and near-black. The dot is at eye height on the side it faces. The first version was one fitted capsule up to 0.9 m across. A product is a pill 24 cm tall and 12 cm across with the dot at 62 percent of its height, magenta by default. A person-sized pill is 1.75 m tall with the dot at 0.925 of its height.
Evidence: `engine/cinematic/src/standins.ts` (stripes: 64 px texture, 16 px colour, 16 px `#141414`; pin head 0.20 x 0.27 x 0.23 m, body at most 0.46 m wide, dot colour `#f4f4f2`); `engine/cinematic/src/kit/pill.ts` (24 cm, radius 0.06, eye 0.62); `engine/cinematic/src/kit/actors.ts` (`pillPerson` 1.75 m, radius 0.27, eye 0.925).
Status: PROVEN.

**Q12. Why a capsule and not a person, a mannequin, a box, a ghost, a blur, a bar? What happened with each?**
Mannequin, pencil figure, ghost and blur kept the body motion. A camera-only plate kept the natural motion and lost the subject's spot. A capsule marks the spot with no body. Plain boxes and the black bar were rejected on sight and never sent.
Evidence: `docs/failure-ladder.md`, ladder 1 (clips in `release-media/SC07-AlleyFight/`). A check of every sent clip found no plain-box clip.
Status: PARTLY. UNPROVEN: that boxes read as crates or a bar as a door.
Test: send a plain unstriped tall box as `@video1` on SC07 and look for crates in the result.

**Q13. Why loud diagonal stripes? Why a white dot? Why not a black facing bar?**
Stripes and colour: nothing in a set looks like them, and the colour names the person in the prompt. Dot: it shows facing and eye height, and it replaced the black bar. The dot never appeared in a result.
Evidence: CAM06 and SC07 capsule results show no stripes, capsule shapes or white dots (`release-media/CAM06-Orbit/looks/boxes-VB-out.mp4`, `release-media/SC07-AlleyFight/looks/boxes-VB-out.mp4`).
Status: PARTLY. UNPROVEN: that the bar "read as a door".
Test: send the striped box with a black bar as `@video1` and look for doors.

**Q14. Why one colour pair per character? How many characters can it hold apart?**
One fixed pair per tint so every prompt can name a person from the tint: red, yellow, green, blue, magenta, orange, cyan, each with black. Alex, Kit and Vic are red; Sam, Rook and Brick are yellow. Three pills held apart in tests.
Evidence: `engine/cinematic/src/standins.ts` (`CAPSULE`); three-person results: SC08 heist (`release-media/SC08-HeistApproach/result.mp4`) and the trunk shot (`release-media/FAM03-TrunkShot/result.mp4`).
Status: PARTLY. UNPROVEN: more than three.
Test: one scene with five distinct pills and a count of how many results keep each identity.

**Q15. How are products handled?**
A product is the same pill at 24 cm. Never a bottle, box or shoe shape, and never one blockout per product shape. The prompt says the pill is the product, the white dot is its front (for example the side with the logo), and a product photo is `@image1`.
Evidence: `engine/cinematic/src/templates/products/shared.ts` (`pillActor`). Prompt line: `templates/PRD05-SkylineDive/prompts/video-1.txt` ("The magenta-and-black striped capsule in @video1 corresponds to the kettle from @image1 ... the white dot marks the front"). Accepted drafts: sneaker, can and tumbler (`release-media/PRD02-RobotArmSnap/result.mp4`, `release-media/PRD04-ProbeFlyThrough/result.mp4`, `release-media/PRD05-SkylineDive/result.mp4`).
Status: PROVEN.

**Q16. Why no limbs, hands, boots or legs? What replaces them?**
They are body motion for the model to copy. The prompt replaces them (stride, hands, limp, feet). Marks on the ground were tried and removed.
Evidence: `docs/why/why-limbs-never.md`. No limbed pill was ever sent, so "would limbs copy motion" is a stated assumption, not a measured result.
Status: PARTLY. UNPROVEN: that a limbed pill would copy motion.
Test: send the same shot with the pill and with a pill that has two stub legs, and compare gait stiffness.

**Q17. What is the pin, why was it made, how does it differ from the capsule, which one made which clips?**
The pin is a small head with a dot on a shoulder-width body. The fitted capsule took in the arms and was up to 0.9 m wide, so Seedance read a giant dome and loosened the shot (drafts came out 0.4 to 0.65 times the intended size). The capsule made 75 of the shipped `pill.mp4` clips (the first 54 templates, the gallery and the Handoff); the pin made 62 (CAM17 to CAM48 re-renders, the liked dust takes CAM25 and CAM42, and the 30 s stories). `--standin capsule|pin` picks one.
Evidence: `engine/cinematic/src/standins.ts` (size clamps); `templates/*/sent.json` (`stand_in.in_pill_clip`); `docs/engine.md`, section 11; `release-media/CAM25-ArcAndRise/v10-cam25-t.mp4` and `release-media/CAM42-DroneDive/v6-cam42-t.mp4` (pin) against `v4-cam42-t.mp4` (dome), checked frame by frame.
Status: PROVEN.

**Q18. How do stripes leak into clothes, and how is that prevented in the prompt?**
The model dresses a person in their pill's stripes or shows a small striped object. The SC08 jacket took magenta stripes, a CAM27 sweater came out red and navy striped, and Sam in CAM36 appeared as a yellow-and-black striped object. Prevent it with the stripes-are-labels line and by stating clothing plainly.
Evidence: `engine/cinematic/tools/seedance-realism.py` (`CAPS` line). The CAM27 fix is in `templates/CAM27-DutchPush/prompts/v14-cam27-t.txt` ("a plain, solid faded grey t-shirt with no stripes, no pattern and no red or navy anywhere on his clothing"; result `release-media/CAM27-DutchPush/v14-cam27-t.mp4`, where the stripes were gone).
Status: PROVEN.

**Q19. How does a stray capsule appear, and what stops it?**
A full pill shows up in the background (the SC08 guard in the warehouse) or a white dot appears as a grey disc beside the head (Glambot, third try). The line "no striped capsule appears at any moment, even far in the background or through a doorway" stops it, plus "the only white dot is the small face dot on each capsule".
Evidence: `engine/cinematic/tools/seedance-realism.py`; `release-media/SC08-HeistApproach/result.mp4` against its re-test (the grey disc is measured on the author's runs, not included).
Status: PROVEN.

**Q20. How is a capsule fitted to a body or a vehicle?**
A person who carries something at arm's length is fitted to the trunk only (elbows and wrists left out), so the carried prop stays outside the pill. A suitcase is its own prop actor placed from the hand bone. Cars, statues and the ship keep grey stand-ins, and in the explosion the car is a coloured block. No pill is fitted to a vehicle.
Evidence: `engine/cinematic/src/standins.ts` (`capsule: "trunk"`); the case sat inside the pill for 40 frames before the fix (measured on the author's runs, not included).
Status: PARTLY. UNPROVEN: a pill fitted to a vehicle.
Test: fit a pill to a car and check whether the result shows a car in that place.

**Q21. How tall and wide is it in frame at each shot size, and how is that measured for the prompt?**
Method: measured per second from the clip. The measurement reads the red pixels of the pill, its height and width as a share of the frame, its centre, where the bottom of the frame cuts it (a pill is about 3 times as tall as it is wide), and writes which part of the body is in frame. Shot size in the engine is where the bottom edge cuts the body (chin, chest, waist, thigh, ankle).
Evidence: `tools/seedance/prompt_lib.py` (`framing_text`); `engine/cinematic/src/marks.ts` and `framer.ts`.
Status: PARTLY. UNPROVEN: a table per shot size.
Test: render one pill at each size and tabulate its height and width from `framing_text`.

**Q22. What does a second person pill need?**
A second colour (yellow-and-black for the second person), a second photo as the next image slot, and a named role in the prompt.
Evidence: multi-person prompts put the first person at `@Image1` and the second at `@Image2` (SC04 uses a third image for the scene). The Handoff maps "the red-and-black striped capsule in @video1 corresponds to Alex ... The yellow-and-black striped capsule ... Mara" (`templates/SHOW01-TheHandoff/prompts/video-v3.txt`). Sheets: each pill needs its own full black outline or two overlapping pills merge into one colour (`tools/seedance/drawn_batch.py`).
Status: PROVEN.

**Q23. How do you name every stand-in in the prompt, and which sentences are locked?**
Name each pill by colour and map it to a person or object, name every grey object as the real thing, and say no pill ever appears. Locked: the sentence that says what the pills are, the rebuild-the-set sentence, the stripes-are-labels sentence and the look sentence. The rest may change.
Evidence: `engine/cinematic/tools/seedance-realism.py` (`SET`, `CAPS`, `LOOK`); role line in `tools/seedance/gallery_v4.py` (`ROLE_SHOT`): "@video1 is a coarse-blockout reference: ... each person is replaced by a tall rounded capsule with loud diagonal stripes ... Never show a capsule: every capsule becomes the person it stands for."; every template README says to keep the sentences that say what the pills are and to rebuild the set.
Status: PROVEN.

## C. The set (background)

**Q24. Why must the set be coarse and colourless? What came back when it was detailed?**
Seedance copies visible detail. Detailed clay came back as cone pines, ball trees, plain blocks and a toy plaza.
Evidence: `docs/why/why-the-set-stays-coarse.md`. Clips in `release-media/ACT01-BulletTimeOrbit/`: `looks/clay-E-sheet12-out.mp4`, `sketch-cam-sheet.mp4`, `ink-sketch-ink2-act01.mp4` (cones); `sketch-blur-sheet.mp4`, `ink-sketch-ink3-act01.mp4` (real trees). Frames of these five were checked.
Status: PROVEN.

**Q25. What leaks, and how is each rebuilt in words?**
Cone pines, ball trees, plain blocks, statue shape (cone body, ball head, stick arm), a curved beam read as a metal bar, floating specks read as snow, clay fireball lobes, car shapes. Words: "Cone-shaped trees become real trees with bark, branches and needles or leaves; ball-shaped trees become real broadleaf trees; plain blocks become real stone, brick, wood or metal." A statue is described outright ("life-size bronze woman in flowing robes, right arm raised with a laurel wreath, on a carved square plinth"). Specks are hidden from references. Statues still fail in OBJ03, OBJ08, OBJ10, OBJ14 and ONE01 (unfixed).
Evidence: `engine/cinematic/tools/seedance-realism.py`; `engine/cinematic/src/Film.tsx` (specks hidden in non-clay modes); explosion files `release-media/FAM02-ExplosionWalk/video-t-explosion-nodebris.mp4` and `video-t-explosion-blocks.mp4`.
Status: PROVEN.

**Q26. What are the three realism lines and why each?**
Rebuild the set (cones and balls came back). Capsule colours are labels, never on clothing, no capsule shows (stray capsule and striped jacket in SC08). Photoreal cinematic look (flat light made the explosion look like a game).
Evidence: `engine/cinematic/tools/seedance-realism.py`; `docs/why/why-the-set-stays-coarse.md`.
Status: PROVEN.

**Q27. Why no scenery in sketches? What did removing it fix?**
A drawn tree is copied as a clean cone. Removing trees, rocks, bushes, lamps and benches from the drawing gave real cypresses and oaks.
Evidence: `release-media/ACT01-BulletTimeOrbit/ink-sketch-ink2-act01.mp4` (cones) against `ink-sketch-ink3-act01.mp4` (real trees). Both checked frame by frame.
Status: PROVEN.

**Q28. Why no mood light, halos, shafts or grade in the blockout?**
A coarse blockout reads as a blockout; coloured light and thick shapes made it read as a finished set. The mood comes from the prompt or one mood panel. The light code stays behind a switch. Beams had rendered as solid cream planks in front of the pill.
Evidence: `engine/cinematic/src/templates/locations.ts` (`MOOD_LIGHT = false`); `docs/why/why-the-set-stays-coarse.md`.
Status: PROVEN.

**Q29. Why rooms without ceilings? Why open environments for big moves?**
Without a ceiling, overhead, bird's-eye, high-angle, crane and drone moves can see into a room. Big moves go to open places because the camera needs space. An orbit walk went to the big parking structure because a 4 m orbit would clip the pink hotel corridor.
Evidence: `engine/cinematic/src/templates/studios.ts` (`PLACE`); `docs/engine.md`, section 12.
Status: PARTLY. UNPROVEN: that ceilings change the result; no test compared ceilinged and open rooms.
Test: render one overhead move in a ceilinged room and in an open one and compare the results.

**Q30. How are props labelled and named in the prompt?**
Props that act get a flat label colour, not stripes: case orange, drone cyan, paper white. The prompt maps "the orange box" to the suitcase and "the cyan shape" to the drone and keeps their real look (brown leather, matte black). In the explosion: orange block is a dark-green saloon, cyan blocks are oil drums, green blocks are crates, a purple block is a pickup.
Evidence: `engine/cinematic/src/standins.ts` (`labelProps`); `templates/SHOW01-TheHandoff/prompts/video-v3.txt`; `release-media/FAM02-ExplosionWalk/video-t-explosion-blocks.mp4`.
Status: PROVEN.

**Q31. What is the 24-environment system, how is a move assigned a place, and why one place each?**
24 reference sheets (2 x 2 contact sheets with no people) with a mood note each. Every one of the 68 newer templates (CAM17 to CAM48 and the ANG angles) is shot in one of them. One place each, not every move in every place. The counts per place range from 1 (place 13, only ANG40) to 5 (places 02, 16, 17, 18). All 24 are used across the 68.
Evidence: `environments/` (24 PNGs, `moods.json`); `engine/cinematic/src/templates/studios.ts` (`PLACE`, `placeFor`).
Status: PROVEN.

**Q32. When is an environment picture useful, when is it harmful?**
Harmful as a 4-panel sheet: it copied layout and cubes. One panel as a mood reference, "never a map", helped some shots and hurt others. Seconds matching the blockout: prompt only 14 of 30, one mood panel 15 of 30 (sums of the six measured shots).
Evidence: `docs/why/why-words-beat-a-specific-video.md` (table); measured on the author's runs, not included.
Status: PROVEN as measured; the comparison is six shots.

**Q33. How specific should the place be in words, and what did over-specific freehand wording break?**
Long and concrete about the place, the light, the haze, the glow and the colour, and silent about shot size and position, which the clip decides. Freehand wording that contradicted the clip ("medium shot", "bench between us") put a person inside a table. The words-only prompts that worked were about 10,400 characters.
Evidence: `docs/why/why-words-beat-a-specific-video.md`; `templates/CAM25-ArcAndRise/prompts/` (words-only prompt files).
Status: PROVEN.

## F. The variants

**Q63. What variants exist?**
Pill video, pin video, clay video, clay video plus photo, plain boxes, black bar, ghost, camera-only plate, pencil, whole-frame ink, ink with scenery, ink without scenery and clay frame sheet: 13. Plain boxes and the black bar were never sent.
Evidence: `docs/variants.md`; `release-media/<ID>/looks/`. A storyboard sheet and a contact sheet are the same kind of file in different roles: the sheet that was sent versus a review sheet for people.
Status: PROVEN.

**Q64. For each: what it keeps, what it loses, when to use it, the measured verdict.**
See the table in `docs/variants.md`. Measured: pill video 9 of 9 cuts; ink sheet with no scenery 1 to 3 of 9 cuts; plate placed people wrong; ghost kept motion; clay and pencil kept motion; clay sheet and ink sheet with scenery leaked cones. Boxes and the bar have no measured verdict.
Evidence: `docs/variants.md`, `docs/failure-ladder.md`.
Status: PARTLY. UNPROVEN: boxes and the bar (never sent).
Test: send each once on SC07 as a 16 s draft.

**Q65. Why did video input hold 9 of 9 cuts and the sheet 1 to 3 of 9?**
A video has time in it. A sheet has angles and no clock, so the model places the cuts itself. On the 30 s film the sheet cuts missed by 0.2 to 0.8 s.
Evidence: `docs/why/why-video-first-sheet-second.md` (the cut times of one sheet run: mean miss 0.39 s, worst 0.8 s); clips in `release-media/SHOW01-TheHandoff/`.
Status: PROVEN.

**Q66. What is the sheet's job?**
Story, people, look and angles. It is cheaper (images bill output seconds only) and can feel more natural because the model has room to move.
Evidence: a 7 s draft costs 855 credits from a sheet against 1,021 from video (`docs/costs.md`). CAM15 chase drone: the sheet gave a real sailplane where the video gave a bird-like one (`release-media/CAM15-ChaseDrone/`). "More natural" rests on that one template.
Status: PARTLY. UNPROVEN: "more natural" beyond CAM15.
Test: send two more templates by both routes and compare.

**Q67. What is the exact sheet recipe?**
12 panels for one shot, 3 across by 4 down (aspect 1.77); 30 panels, 3 per shot, for a 10-shot film (3880 x 5450, aspect 0.71); aspect between 0.40 and 2.50; ink line on white; no scenery, no shadow, no colour wash; each person a pill filled with its stripes, a full black outline and a drawn face circle; props in flat label colours; the face photo attached; the prompt opens with the real place and says the drawing is for placement only.
Evidence: `docs/variants.md`; `tools/seedance/drawn_batch.py`. A 4 x 3 sheet of 2590 x 825 (aspect 3.14) was refused by the earlier hosted API used in the original tests.
Status: PROVEN.

**Q68. What does the camera-only plate give?**
The most natural movement and realism of the video tries. The subject lands in the wrong place and early.
Evidence: `release-media/CAM06-Orbit/plate-made.mp4`, `release-media/ACT01-BulletTimeOrbit/plate-made.mp4`, `release-media/SC07-AlleyFight/plate-made.mp4`.
Status: PROVEN.

**Q69. Why did tracking marks and a camera timeline add nothing with video input?**
The video already carried the camera, so little gap was left to close. The marks made sheets worse (chequered floor and columns). Writing the measured timeline into the prompt did not help for video.
Evidence: `release-media/ACT01-BulletTimeOrbit/video-cam-video.mp4` against the plain video; `sketch-cam-sheet.mp4` (checked: cones and chequered floor).
Status: PROVEN.

**Q70. When do you mix (video for the exact cut, sheet for the natural take)?**
No request ever sent both. The advice is to pick one by the need: video for a frame-exact cut, sheet for freedom or cost.
Evidence: `docs/why/why-video-first-sheet-second.md`.
Status: UNPROVEN.
Test: one 30 s draft with the pill video as `@video1` and the 30-panel sheet as `@image2`, compared on cut timing and look with the two single runs.
