# Failures and fixes

Twenty-three things that went wrong, each with the symptom, the cause, the fix and a real example. Template ids are the ids used in the gallery. The first 22 are about what Seedance returned or how a prompt behaved. The last is about spending.

## 1. Clay set leaks

**Symptom.** Cone pines and ball trees in the result. A statue with a cone body, ball head and stick arms. A beam that became a metal bar. A chequerboard floor. Clay specks turned into snow. A grey flat look.

**Cause.** Seedance reads any image or video as appearance, whatever the prompt says. The more detailed the grey set is, the more of it is copied.

**Fix.** Put the three realism lines in every prompt (rebuild the set, stripes are labels, photoreal look). Name each stand-in as the real thing. Leave scenery out of the pill clip with `--no-scenery` for object shots, and out of drawn sheets completely. Add no tracking marks and no shadows. Describe the real place at length. For flying props, use plain coloured blocks and name them in the prompt.

**Example.** ACT01 bullet time returned cone pines and ball trees in its first gallery test. After the realism lines the retest was clean. Object shots with the set in them (crash zoom, flyby pan) leaked until they were re-run with `--no-scenery`. Statues are still unsolved in four templates (crash zoom, window fly-through, wipe reveal, statue crane).

## 2. Stripes on clothes

**Symptom.** A jacket with magenta stripes. A red and navy striped sweater. A second person drawn as a striped object by a pillar.

**Cause.** The capsule's colours were read as clothing when the garment was not stated.

**Fix.** Keep the stripes-are-labels sentence. Write the clothing plainly and name the colours that must not appear: "a plain, solid faded grey t-shirt with no stripes, no pattern and no red or navy anywhere on his clothing".

**Example.** SC08 heist (Ash's jacket). CAM27 prompt-only take, fixed in the next run. CAM36 mood take (Sam).

## 3. Stray capsule

**Symptom.** A striped capsule visible in the result: a green one in a warehouse shot, a grey disc beside the head from second 6 of a Glambot extension.

**Cause.** The capsule or its white dot survived into the picture. In the Glambot case the disc was the capsule's white dot.

**Fix.** "No striped capsule appears at any moment, even far in the background or through a doorway." State that the only white dot is the small face dot on each capsule. Where capsules are meant to be seen (the world turns 3D), say so in that step only.

**Example.** SC08 heist. Glambot extension v3.

## 4. Robotic walk

**Symptom.** The result moved like a video-game character. The fight looked like a game.

**Cause.** The pill clip carries bodies as well as the camera, and the clay mannequins were stiff. A face photo fixed the face and the place and left the motion.

**Fix.** Remove the body from the reference. A striped capsule gives the exact spot, size and facing with no body to copy. The prompt says: do not copy the figures' body motion, the placeholder is rough. Pencil figures, blur and ghost blobs did not fix it. A camera-only clip gave the most natural motion but the subjects landed in the wrong places.

**Example.** SC07 alley fight: clay video gave a GTA-style fight, the capsule version gave real punches in the right places. ACT01: the same ladder.

## 5. Limp or dragging foot

**Symptom.** "Why is he dragging his feet." Odd walking.

**Cause.** The prompt said bad left leg, dragging foot, scrape and slow and labored.

**Fix.** Write a steady natural pace bent into the wind, every step planted, one gust that shoves him sideways once, and a consistency line "never in slow motion".

**Example.** The 30 s dust story (STORY02), first runs.

## 6. Marks on the ground

**Symptom A.** A real chequerboard floor and checker columns in the result.

**Symptom B.** Footprints and scrapes on the sand read as an unwanted device.

**Cause.** A still frame is a picture to copy. Tracking marks in a sheet became real. Footprints were tried as a limbless gait cue and dropped.

**Fix.** No tracking marks in any previs or sheet. For a feet shot, use a low camera beside the pill with the ground sliding past, and write the gait in the prompt. No limbs on the pill either.

**Example.** ACT01 sheet with marks (worst of four). STORY02 feet shot.

## 7. Slow motion

**Symptom.** Walks that look like slow motion. In the leap of faith the whole fall was slowed to 14 percent.

**Cause.** In the previs, step length was 45 percent too long and the gaits did not share a clock. In the template the agent slowed everything after push-off although the film plays the fall at about real speed.

**Fix.** Measure the pace per clip and give each gait its own pace. Keep the fall at real speed for 3.3 s, ease the clock to 0.035 over 0.7 s only as the camera lands, and hold it. In prompts, the line "never in slow motion".

**Example.** The previs walk on the street scenes. FAM04 leap of faith.

## 8. Sliding feet

**Symptom.** Feet skating in the 3D previs, from 30 to 50 percent of body speed.

**Cause.** Standing to walking blends dragged the feet. Heel strikes landed while moving at 1.4 to 1.6 m/s.

**Fix.** Walk, jog and sprint share one step timing. The heel slows to a stop in the last 5 cm before contact. Slide fell to 6 percent, landing speeds to 0.02 to 0.3 m/s. The motion check reads the clip, not the shot.

**Example.** The street walkers and the FPV runner. See `engine.md` for the check.

## 9. Ghost or doubled head

**Symptom.** A second faint head or a ghost outline. In a Seedance draft, a second figure beside the jumper.

**Cause.** In the previs, head-turn state piled up across motion-blur sub-samples (about 67 degrees per sample). The pill ghosted when sub-frames were on. In the leap draft the cause was Seedance duplicating the jump.

**Fix.** Reset the head before each pose. Render the pill without sub-frames, or as its own `--boxes` body with 5 sub-frames. For the duplicated jumper there is no fix yet. Watch for it.

**Example.** The 360 booth agent found the pill ghost. FAM04 leap of faith draft.

## 10. Body through a prop

**Symptom.** "He is inside the table." A driver's hands floating 0.52 m behind the wheel.

**Cause.** In Seedance, freehand shot sizes and phrases like "a bench between us" contradicted the clip. In the previs, hands were not fitted to the prop.

**Fix.** Seat him behind the bench with his hands on it, frame full length, and remove contradicting shot-size words. The wheel was moved into the grip. The motion check found no body passing through a car, prop or another body.

**Example.** The short arc in the 24 environments. SC04 car interior.

## 11. Silent mouths in a dialogue

**Symptom.** A conversation scene with closed mouths. A voice-over over a closed mouth.

**Cause.** The prompt said "mouths closed". Or a voice was attached without an on-camera speech instruction.

**Fix.** Write real lines in the dialogue block and say the mouth moves on camera. Measure the mouth.

**Example.** SC02 living room first run was silent. The hospital mood take: 0.032 of face height open, fixed to 0.084 (spoken takes 0.097 to 0.138).

## 12. Paraphrased line

**Symptom.** "You said you had the money. I lied. Run." instead of the script.

**Cause.** Lines buried in a long prompt were summarised.

**Fix.** A dialogue block near the top with each line, shot and time, "exactly these lines and no other words", the line repeated in its shot, delivery notes of 6 words or fewer.

**Example.** The Handoff v2. From v3 on, all 7 lines matched.

## 13. Speech where a reaction was wanted

**Symptom.** A man alone in a shower mumbling to himself. A line in a hospital that made no sense.

**Cause.** A line was written for every shot. Dialogue that does not fit the place reads as nonsense.

**Fix.** Write speech only where speech is natural, such as a phone call or a conversation. Otherwise write a reaction: hear, face changes, turns and looks, back.

**Example.** CAM38 shower became silent (braced, then breaks, hand through hair). CAM22 hospital became a phone call to his sister.

## 14. Cuts at the wrong second

**Symptom.** Cuts that miss the plan, or weird cutting.

**Cause.** The sheet has no clock. With video input the previs itself was weak at three cuts (handle match, whip blur, too-short zoom).

**Fix.** The pill clip decides the cuts. Make each cut a clear change of angle and size. Add a backstop sentence listing the cut times. Use video input where cuts must land.

**Example.** The Handoff: 9 of 9 cuts within a frame from video, 1 to 3 of 9 from the sheet, drifting 0.2 to 0.7 s.

## 15. Cuts that do not carry (cup, scarf, key)

**Symptom.** At second 6 an arm blocks the wind, at second 7 it is gone. A scarf that morphs. A key hung from a coat. A cup that first appears when he drinks. Clothes that change after a cut.

**Cause.** Each shot was written as its own small scene, so the model reset the person at every cut. Too many actions in a short window.

**Fix.** Write the action across each cut. State wardrobe and the key hand in every shot. Track every prop's first appearance. One key, never hung. Do less, slower. Details are in `stories.md`.

**Example.** STORY02 (arm at 6 and 7 s) and the reunion extend (scarf, key, cup, a skipped sit at 21 s).

## 16. Locked camera in a sheet run

**Symptom.** The sheet version of the bullet-time orbit had a near-static camera.

**Cause.** The prompt said "orbits a steady half circle" and nothing else. The orbit existed only in the video input.

**Fix.** State start side, direction and arrival, about 3 s at the same height, subject centred, one continuous move. For sheets add "panels 4 to 9 are one continuous camera move".

**Example.** ACT01. After the rewrite all three sheet versions orbited. The orbit side in the old prompt was also wrong (it starts front-left).

## 17. Camera gear or rig drawn in the picture

**Symptom.** A tripod beside the person. A camera on screen.

**Cause.** "The camera is on a tripod" drew a tripod. A line banning "camera, crane or equipment" put equipment in the picture.

**Fix.** Say "the camera is locked off". Remove ban lines that name gear. After removal, no rig appeared in 16 sampled frames per take.

**Example.** CAM21 mood take. STORY02. Caution: sent prompts still name a technocrane or a drone gimbal as the means of the move (CAM06, CAM42) and they passed. It is not proven that this is safe.

## 18. NSFW block

**Symptom.** The request is rejected as not safe for work.

**Cause.** A pencil fight with drawn unclothed outlines doing violence. A random rejection also hit a bedroom line.

**Fix.** Use the figures-only pencil version, or add clothing lines to the figures. Retry once. A rejected job is not charged.

**Example.** The SC07 pencil fight video, blocked twice. ANG07 (random).

## 19. Copyright block

**Symptom.** "May be related to copyright restrictions."

**Cause.** The filter judges the finished video. A night alley brawl, a fight coverage montage and a 360 turn with a famous film's look resemble known scenes. Some rejections are random.

**Fix.** Retry once. Then change the setting, the clothing, the partner and the names. Daytime sparring in sportswear passed. A desert town passed. Do not use franchise names or costumes.

**Example.** SC07 (2 blocks), ACT07 (at least 5, never passed, no example in the gallery), Bay 360 (2), CAM24 (random).

## 20. 30.00 s refusal

**Symptom.** HTTP 400 "Total combined duration of videos must not exceed 30 seconds (got 30.00s)".

**Cause.** A reference video of 30.00 s, and files that the service measured as 30.00 s though they were shorter.

**Fix.** Keep references under 29 s: trim the reference to 28.92 s and send a duration of 29. Voice audio at 29.4 s, edit-mode video at 29.0 s. This was the earlier hosted API used in the original tests; a table of what was accepted is in `seedance-notes.md`.

**Example.** The Handoff, three refusals at 30.00, 29.92 and 29.50 s.

## 21. Image aspect refusal

**Symptom.** A sheet failed as "too wide for Seedance's image limit".

**Cause.** The image aspect is limited (0.4 to 2.5, see `seedance-notes.md`).

**Fix.** Re-cut the sheet inside the limit. Failed jobs are refunded. The 12-panel sheet used a 3 by 4 layout.

**Example.** Early 12-panel sheets on 4 Nov.

## 22. Wrong file matched to the wrong request

**Symptom.** The draft log showed the retry's video under the first run's id. Later a 4K job was run on the wrong take.

**Cause.** A retry overwrote the first result file. Files were picked by name.

**Fix.** Match by size or by a byte comparison with the service's stored video, and keep a request record next to the file. Show the exact video before spending.

**Example.** 136 rows checked, 132 matched, 2 wrong and fixed, 2 unverifiable. A hash of the local file against a fresh download is the strict check.

## 23. Credits spent on something not asked for

**Symptom.** Four drafts queued after a "no". A command that was interrupted but had already queued a draft. A re-send of one take on a guess. A video re-run when the sketch was asked. A 480p draft finalized to 1080p when something different was expected. Two files sent for 4K on the wrong take.

**Cause.** There is no cancel once a job is queued. The agent guessed which file "one more time" meant. "Finalize" re-renders the same generation at the 1080p rate, and a mis-click paid for two finals. On the earlier hosted API the 4K field was ignored, so a fresh generation was run instead, and it was not the take that had been chosen.

**Fix.** Show the exact list first and wait for a yes for that exact action. After an interrupted command, check what it sent. Ask which file when more than one is open. Re-run exactly the variant named. Do not finalize until the draft is right, match the request id to the file first, and explain what finalize does before doing it.

**Example.** The 24-environment batches (four drafts queued after a "no"), a Glambot re-send on a guess (PRD06), and the 4K episode of the dust film (STORY02), where fresh 4K clips were made of the wrong take. See `process-lessons.md` and `costs.md`.
