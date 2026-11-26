# Stories and long takes

A template is one move of 4 to 16 seconds. A story is 30 seconds with several cuts, a few lines and a prop that has to stay the same from shot to shot. Three stories were built: The Handoff (SHOW01), the dust plaza (STORY02) and the reunion that extends it (STORY03). This page says how each was made, what broke and the method that came out of them.

The numbers come from the shot list in each `template.ts`, the sent prompts in `templates/<ID>/prompts/`, the `sent.json` records and the result logs. Where something could not be confirmed it says so. Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`.

## The Handoff (SHOW01)

**The brief.** SHOW01 was built as a 30 second dialogue scene with strong camera moves, to show the whole method. It had to be built in three.js first.

**The scene.** A trade in a downtown square at dusk after rain, with an elevated highway and neon. Alex (red-and-black capsule; a face photo and a voice clip of the person) waits with a suitcase. Mara (yellow-and-black capsule, a generated voice) arrives with no money. A drone rises behind her, she tells him to run, he flees through the pillars, leaps off a planter in bullet time, the case bursts open and is empty but for one sheet of paper, and he lands and looks back. The setting began as a plaza and became a city. The plaza layout stayed in the pill clip, because the prompt rebuilds the place.

**Props.** The case is a solid orange box and the drone a solid cyan shape in the clip. The prompt maps them to a brown leather case and a matte black drone. The sheet of paper is white.

**The ten shots.** 29 to 30 s at 24 fps, 2.39:1, hard cuts at 2.5, 5.5, 9, 12, 14, 17, 21, 24.5 and 26.5 s (`templates/SHOW01-TheHandoff/template.ts`).

| Shot | Seconds | Lens | What it is |
|---|---|---|---|
| 1 | 0 to 2.5 | 100 mm macro slider | Thumb on the handle |
| 2 | 2.5 to 5.5 | 32 mm crane | Top-down crane down, graphic match from the handle to the plaza, Mara enters |
| 3 | 5.5 to 9 | 75 mm over the shoulder | Mara and Alex trade the first lines |
| 4 | 9 to 12 | 60 mm handheld, Dutch 8 degrees | Close-up on Mara, a long held beat |
| 5 | 12 to 14 | 32 to 180 mm crash zoom | Zoom onto Alex's eyes, then a motionless lock of 1.35 s to the cut |
| 6 | 14 to 17 | 50 mm locked close-up | Mara looks up, rack focus to the drone, she tells him to run |
| 7 | 17 to 21 | 18 mm FPV | Chase through the pillars, onto the planter |
| 8 | 21 to 24.5 | 28 mm bullet-time orbit | Half circle (175 degrees) around the leap, clock nearly stops |
| 9 | 24.5 to 26.5 | 65 mm insert | The empty case opens in the frozen moment, paper lifts out |
| 10 | 26.5 to 30 | 28 mm low hero arc | Landing and roll, look back |

Shots 1, 2, 5, 8 and 9 are silent. The cuts are designed to carry: a graphic match on the handle (1 to 2), a cut on action (6 to 7), a cut on the take-off frame (7 to 8), a cut inside the frozen moment (8 to 9) and a cut as time snaps back on the landing (9 to 10).

**The seven lines (final).**

1. Mara: "You actually came."
2. Alex: "You said it'd be just us."
3. Mara: "There's no money, Alex. There never was."
4. Mara: "They said you'd bring people. You came alone."
5. Mara: "Run. Please."
6. Drone: "Alex. Put the case down."
7. Alex: "I lied too."

These are the lines in the sent prompt (`prompts/video-v3.txt`).

**How it grew.** The first plan was 11 shots and 4 lines, then 11 and 14, then 12 shots, then 13 shots with an insert and 10 lines. That was too much talking and too much action to tell a story in 30 seconds. The cut to 10 shots and 6 to 7 lines added four silent shots. The dolly zoom was dropped because two zooms sat close together. Each technique appears once.

**The 2-second rule.** Every shot, and every camera effect, holds at least 2 seconds. In v1 the crash zoom took one frame and read as a cut. After the fix shot 5 meets 2.0 s, the zoom runs early in the shot and the eyes then stay motionless for 1.35 s to the cut at 14 s.

**The build.** The scene was built from a written brief in about 1 hour 20 minutes, 34 minutes of it to the first full render, with four stills passes and two re-renders. The frame check went from 19 fails to 8, and the 8 left were deliberate framings. A separate QA pass extracted all 720 frames and judged every cut and the motion inside each shot.

**What the QA found.** All 11 cuts were where they should be. The faults were inside the shots: a one-frame zoom, the case jumping from his hand to his chest and sitting in the capsule for 40 frames, a bullet-time orbit static at both ends that whipped the half circle in one second, a camera pop in the hero arc, and three cuts that did not do their job (the handle match, the "Run" cut and the leap cut). The previs was rebuilt and the video route then landed 9 of 9 cuts within a frame.

**The Seedance request.** One 29 s generation, not two. Reference mode, duration 29, aspect 21:9, `pass_faces` on, draft on. References: the pill clip trimmed to 28.92 s with no scenery, the face photo, and a 14.5 s clip of the voice. The prompt (`prompts/video-v3.txt`) runs about 3,000 words. Blocks: Goal, Reference Asset Roles (with the fixed edit list), Dialogue exact words, Subjects, then a paragraph per shot with time range, lens, move, action, focus, delivery and the line, then the sound plan and the look line (ARRI Alexa 35, anamorphic, a restrained teal and amber dusk grade).

**What each variant gave.** The video route landed 9 of 9 cuts and all 7 lines. The sketch sheet (30 panels, 3 per shot) landed 1 of 9 on the first run and 3 of 9 on the third, with the cuts drifting 0.2 to 0.7 s. The sheet kept story, people and look and cost less (3,544 credits against 4,228 for the draft). The measured sketch cuts in v5 were 1.9, 5.2, 9.0, 12.4, 14.4, 17.8, 21.5, 24.2 and 26.3 s against the planned 2.5, 5.5, 9, 12, 14, 17, 21, 24.5 and 26.5.

**Issues that stayed open.**

- The drawn sketch turned the pink neon sign into a capsule with a white dot. The sign is described as an abstract tube with no readable letters, because Seedance invents lettering.
- "Run" may have been swallowed in the v6 sketch run, and "I lied, too" may have been said twice in v3. Both come from a transcript and were not confirmed by ear. UNPROVEN.
- The sound of the finals was checked by transcription only.

**Finals.** v6 and v5, both sketch runs, were finalized to 1080p (2206 x 946, 29 s).

## The dust plaza (STORY02)

**The idea.** A man who can barely walk crosses a dead plaza against the wind to a half-buried shutter, kneels, and turns a key in a lock set in the ground. The brief was a Dune-like walk with a close-up on the eyes and one consistent scene. The director agent's first plan had 7 shots and one line, "Come on.", chosen over a stronger curse and said low to himself before the turn of the key. The first 3D build was rejected because the pin sank into the ground and the motion did not follow physics. The set also read as too small, so it was rebuilt at a larger scale with domes.

**The structure that worked.** The final film reuses two liked prompts, CAM42 to open it and a way into CAM25. It has 7 shots in 30 s (`templates/STORY02-DiveToShutter/template.ts`). The lens is the one the camera function renders; the labels in the file and the card text give 35, 40, 85 and 85 mm for shots 3, 5, 6 and 7.

| Shot | Seconds | What |
|---|---|---|
| 1 | 0 to 6.5 | CAM42 drone dive from 25 m up to 3.4 m, 24 to 50 mm. A gust, forearm raised. |
| 2 | 6.5 to 10.5 | 50 mm medium close-up, backing away at his pace. Wipes his eye. |
| 3 | 10.5 to 13 | Low at his side, 25 mm, the sand streaming past. A stagger. |
| 4 | 13 to 19 | 28 mm arc, front-right to right side, slow rack to the shutter. |
| 5 | 19 to 25.3 | The same arc continues with no cut (28 mm). He reaches the shutter and kneels. |
| 6 | 25.3 to 27.4 | 35 mm close-up of his face, one breath. Silent. |
| 7 | 27.4 to 30 | 50 mm close on the key, the line "Come on.", the bolt clicks. |

**Why these two prompts were reused.** The two liked dust prompts (769 and 820 words) share the same five blocks, the same place paragraph, the same locked role sentences, one flowing performance with a motive and a gust beat, camera numbers in metres and millimetres, a sound line with only wind, grit and cloth, and the same look line. The 30 s prompt (`prompts/story02-p.txt`) was rebuilt from them word for word. It was kept uncut and followed in order, with all seven shots present.

**What broke and what fixed it.**

| Problem | Fix |
|---|---|
| Camera inside the wall, lock buried by sand, boots shot aimed too low | Reaimed in three.js |
| A huge circle at the end (a plain sphere for a fist and an orange block for a lock) | A round brass plate with a keyhole, a small brass key with a ring bow, a smaller sphere fist hidden until the kneel |
| Limbs added for a feet shot | Removed. The rule is "no limbs" ([why/why-limbs-never.md](why/why-limbs-never.md)). |
| Footprints, scrape and crack marks | Removed |
| Camera too fast at 19 to 22 s | One arc from 13 s to 25.2 s, about 80 degrees, mean about 7 degrees a second, no blend between two far poses; he eases into his walk from 17.4 s |
| Lock out of frame | Aim between him and the lock from about 15 s, pull back so the pin is full length |
| The cut at 19 s looked like two shots | The arc ends low behind him aimed at the wall and the next shot starts from that exact pose. Shots 4 and 5 say "one unbroken camera move, no cut and no change of place". |
| Arm at 6 s, gone at 7 s | Action written across each cut (see the method below) |
| Dragging feet | Natural pace line and "never in slow motion" |
| Equipment line produced a visible rig | Removed |
| The key came back thick, hovering beside a narrow slot | Key and keyhole described in full, the key goes all the way in |
| Polished background | Hyperreal, dirty, ruined wording |
| "Come on." said twice | Say the shot is silent, name the shot where it is said. It came back in some later takes, so check each take with whisper. |

**Two takes.** One with the pill clip and one text only (face photo, voice, no video). The result logs hold 15 completed drafts for this film, 7 with the pill clip (4,301.1 credits each) and 8 text only (3,666 each). The text-only take had a more violent storm and a looser camera. The blockout take followed the seven shots in order.

**Director rules from this film.** Keep a want and an obstacle you can see. The camera moves by itself only once, in the final rise. Use few cuts (7 shots, 6 cuts in 30 s). Keep screen direction and geography fixed and the wind constant. No music, the wind is the score. Pacing: walk at 0.8 m/s at most, kneel for 3.5 s, one breath for 2 s, silence for 1.5 s after the bolt, every camera move eased in and out, the finale a quarter arc and not a full circle. A line over an off-screen mouth removes the lip-sync risk.

## The reunion (STORY03), built by extend

**The idea.** The goal was 30 more seconds of the liked take, with a conversation with another human being. The director proposed a reunion with his mother. The first draft explained backstory and was rejected. The final story has no backstory.

**The mechanics.**

1. Pick the take you love (the text-only 30 s take).
2. Cut its last 12 s with the sound track removed.
3. Send an extend: duration 30, aspect `adaptive`, with the tail as `@video1`, the face photo and the voice clip. No pill clip is needed.
4. The first frame of the extension equals the last frame of the tail.
5. Each of the six extension drafts cost 3,645 credits (21,870 in all), which is 50 billable seconds at 72.9. The 12 s tail counts as at least two thirds of the 30 s output, so the bill is 20 s in plus 30 s out ([costs.md](costs.md)).

**The script (six lines).**

1. Mother: "You're late."
2. Alex: "There was a storm."
3. Mother: "There's always a storm. Look at the state of you. Come in."
4. Alex: "I walked."
5. Mother: "Of course you walked. You never could wait for anything."
6. Mother: "Your tea's gone cold."

The mother's voice is invented by the model each time. Only Alex's voice was supplied.

**The shots** (the v6 recipe, `templates/STORY03-TheGap/prompts/story03-ext.txt`): the shutter lifts and her face appears (0 to 11.9 s), he ducks into the room mid-step, he takes off the scarf and coat and puts the scarf on the counter, the key goes from his fist to her palm to her chest (17.3 s), he sits on the stool, the tea is in frame from 11.4 s, and she pulls the cord to close the shutter just after he drinks. The four cuts fall at 2.6, 11.9, 17.3 and 22.5 s.

**What went wrong.**

- The scarf morphed when it passed from neck to hand to her to the counter.
- The key was hung on a nail in his coat. The nail was removed.
- The cup of tea first appeared when he drank.
- "I'm not thirsty" and "It still turns" read as explanation, and he drank in a way that made no sense.
- Between 20 s and 22 s three actions (close the hand, sit, walk to the counter) were hidden inside one cut and the model skipped them.
- A re-run of an extend is a new take. The first 12 s differed from the liked version.
- In a v5 run the mother wore a brown top at 18 s instead of a green cardigan, and he wore a hooded jacket instead of a work shirt.

**What fixed it.** The method below. A full regeneration was chosen over keeping the first 15 s and extending 15 s.

**The lines.** The first lines were weak: the writing agents are not screenwriters. A dialogue pass (cut to subtext, find the button on the last line of an exchange, vary the rhythm, earn the joke, read the line aloud and cut it if it cannot be said fast) turned a ten-line draft of about 55 words into the six lines above. A 30 second scene cannot be told in four words: the Handoff has 34 spoken words in 29 s and the reunion 34 in 30 s.

**4K.** The liked takes exist only as 480p drafts and 1080p upgrades. A fresh 4K generation is a different take. Whether the draft itself can be finalized to 4K is UNPROVEN on Tein ([seedance-notes.md](seedance-notes.md#4k)).

## The method for a 30 s story

1. Story first, then three.js. Ask for each shot: why he is there, what he holds, where he is going, what he feels, what the shot is for. A director agent answers, then a person approves or changes it.
2. Run an independent critic on the story. It found half of the first list was stock and flagged repeats (two letters, two watches, two sky-gazes, three rooftop shots).
3. Write the shot list with lenses, times and cut types. Every shot is at least 2 seconds.
4. Build the pill clip. Give each key prop a readable shape and a label colour. Aim the camera between the person and the story object. Keep every move slow and eased, and start it early.
5. Run the checks on the previs before anything is sent: motion check, frame check, a read of every frame, and a measure of how fast the picture changes (target 2 to 6 per quarter second with no spikes).
6. Write the prompt. Use the exact words of prompts that were liked. Run the mechanical gate, then an independent judge that reads the prompt as the model would, then re-run the gate.
7. Audit continuity before spending: list each prop and the state of each hand, garment and mouth at every cut. A prop that is named must be placed in a shot where it is first seen.
8. Write the action across each cut. End each shot paragraph with "At the moment of the cut ..." and the pose. Open the next with "the next shot opens on that same moment" and repeat the pose, fist, scarf and cup.
9. State the wardrobe, the key hand and the state of the scarf and mouth in every shot.
10. Send a draft. Transcribe it with whisper, run the cut detector, and look at the frame before and the frame after each cut.
11. Change one thing per round. Do not rewrite a good draft.
12. Send nothing that costs credits without a yes for that exact request.

**Before and after frame pairs.** A cut detector finds hard cuts, but a hard cut is fine. What matters is whether the action continues. For each cut, pull the frame just before and the frame just after and compare arm, scarf, prop, clothing and place. All four cuts of the v6 reunion passed this check. The cut at 21 s of an earlier take failed it: at 20 s the mother held the key above his palm and at 22 s he already sat in a black hoodie with her behind him.

**Chained 7 s extends.** Chained pieces of about 7 s are proposed as the reliable way to keep continuity, because each piece starts from an exact last frame, and the cost would be about the same. A longer chain in the original tests used steps of 15, 15 and 30 s (measured on the author's runs, not included); the 7 s chain was not tested for the reunion. UNPROVEN. Test: build the reunion as 4 extends of 7 to 8 s and compare the state of scarf, cup and clothing across the 4 joins against the one-piece v6.

## Extend: what the model uses, and how to build a join

As the provider describes Extend (read 7 Nov 2026):

- The model reads the whole input clip, with the frames near the end weighing more. The last 2 to 3 seconds decide the action, the camera position and the light at the join. A tail of 3 to 10 seconds is usually enough.
- Two exceptions: key identity (a frontal face, clothing, a signature prop) that appears only earlier in the clip while the end shows a back or a distant shot can drift; a clip that ends on a big camera move loses where the move came from if you cut it to its end.

The reunion drifted on the scarf, the clothing and the key. The plaza clip it extended ended with the man kneeling and seen from behind, with the face and the prop earlier in the take, which matches the first exception. UNPROVEN that this was the whole cause.

How to build a join that holds:
1. Send a tail of 3 to 10 seconds that contains a frame with the face, the clothing and the prop, not only the last frame.
2. Make the last 2 to 3 seconds of the old part already show the pose, the camera state and the light the next part starts from.
3. Say the identity again in the prompt: what the person wears (scarf, coat), what they hold, where each prop is. The model does not keep a prop that the tail does not show.
4. Write the action across the cut: what the hands were doing at the last frame is what they are doing at the first frame of the next shot.
