# Answers: the prompt (G), Seedance and the API (H), QA on the result (I), failures (J), stories (K) and cost (L)

This file answers 64 questions; 2 are UNPROVEN, 19 partly, and the other 43 are proven.

Evidence is a path in this repo, or "measured on the author's runs, not included". Statuses:

- **PROVEN**: shown by a file in the repo or a number that can be re-measured.
- **PARTLY**: the core is shown; the part that is not is named, with the test that would settle it.
- **UNPROVEN**: not supported by the files. The test follows.

Prompt builders and gates are in `tools/seedance/` (repo level). Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Request names and limits are in `docs/tein-endpoint.md` and `docs/seedance-notes.md`. The sends are the 242 in `templates/*/sent.json`.

## G. The prompt

**Q71. Block structure.**
Six blocks. 1 `【Generation Goal】`. 2 `【Dialogue, exact words】` (speaking shots only). 3 `【Reference Asset Roles】`. 4 `【Subjects and Relationships】` (stand-in to person mapping, wardrobe, place). 5 `【Camera and Event Script】` (camera paragraph, performance, human-motion line, sound, look). 6 `【Maintain Consistency】`. The shorter dust prompts carry the same blocks without the dialogue block. The builder puts the dialogue before the roles and the Handoff prompt puts it after.
Evidence: `tools/seedance/gallery_v4.py` (`build_text`); `templates/SHOW01-TheHandoff/prompts/video-v3.txt`; `templates/CAM42-DroneDive/prompts/v6-cam42-t.txt`.
Status: PROVEN.

**Q72. Locked sentences.**
The role of the reference video, rebuild the set, stripes are labels, face-only, human motion, the look line, "There is no music of any kind", and the closing consistency line. `qa4.py` fails any prompt that lacks "rebuild every wall", "No cone, sphere, plain box", "only a label" and "Never show a capsule". A user changes the goal, the wardrobe, the place, the numbers in the camera script, the performance, the sound list and the lines. The first 54 templates' prompts carry an older wording of the same lines.
Evidence: `tools/seedance/gallery_v4.py` constants `ROLE_SHOT`, `ROLE_REBUILD`, `ROLE_STRIPES`, `ROLE_FACE`, `HUMAN`, `LOOK`; `tools/seedance/qa4.py` Q5; `engine/cinematic/tools/seedance-realism.py`.
Status: PROVEN.

**Q73. Reference video.**
`@video1` is "a coarse-blockout reference: a grey clay set in which the person is replaced by a tall rounded capsule ... Use it for the camera ... and for where the person stands, how large he is in the frame and which way he faces. The capsule carries no body or pose ... Never show a capsule ... Do not adopt its grey clay set or its stand-in shapes."
Evidence: `tools/seedance/gallery_v4.py` (`ROLE_SHOT`).
Status: PROVEN.

**Q74. Face photo, voice, second panel.**
Face: "@image1 is used only for {name}'s facial features ...; ignore {photo background and clothing}." Voice: "@audio1 is {name}'s own voice, a real recording: he speaks the line in that voice, with its timbre, pace and accent." Mood panel: "@image2 is used only for the mood of the place ... not a layout and not a set to copy." Extend likeness clip: used for likeness only, never as the shot to continue.
Evidence: `tools/seedance/gallery_v4.py` (`ROLE_FACE`, `ROLE_VOICE`, `ROLE_MOOD`); `docs/seedance-notes.md`, section 1 (the `@video2` likeness clip in extend mode); `templates/STORY03-TheGap/prompts/story03-ext.txt` (the `@video1` line).
Status: PROVEN.

**Q75. Camera, framing, lens, light, grade, materials, wear, dirt.**
Camera: rig, lens feel in mm, start height and distance in metres, speed and arrival size, from the template's numbers. Light and grade: a place paragraph (colours, glow, haze, grain) plus the look line (ARRI Alexa 35, anamorphic, grain, halation). Materials: each stand-in named as a real material. Wear and dirt: "Nothing is clean, polished or perfect: ... spalled with rusted rebar ... bricks missing".
Evidence: `tools/seedance/gallery_v4.py` (`LOOK`, the camera paragraph); `templates/CAM42-DroneDive/prompts/v4-cam42-t.txt`.
Status: PROVEN.

**Q77. Banned wording.**
Statue words (very still, motionless, stands still, frozen). Time stamps in the performance. "Tripod". Ban lines that name gear. Body-action words that get filmed (breath through his nose, knocks, frown). Tear words. Over-literal acting words. "Dragging", "bad leg". Franchise names. Dangling `@image2`. Round brackets. Duration, ratio and resolution. Filler set-up lines and clipped fragments in a spoken line. Risk words (unclothed, naked, nude, blood, gun, shoot, kill, corpse). Gear names inside the camera script ("technocrane", "drone gimbal") are used in prompts that passed (see Q127).
Evidence: the word lists in `tools/seedance/qa3.py` and `qa4.py`; sent prompts under `templates/CAM06-Orbit/prompts/` and `templates/CAM42-DroneDive/prompts/`.
Status: PROVEN.

**Q78. Length and buried lines.**
Observed over the 242 sent prompt files: 384 to 3,220 words, median 992. The gate allows 500 to 1,100; the lean gate 250 to 600; a 1,798-word 30 s prompt was followed in order with all seven shots; a roughly 3,000-word prompt paraphrased dialogue until a verbatim block was added.
Evidence: `templates/*/sent.json` and the prompt files they name; `tools/seedance/qa4.py` Q3; `templates/SHOW01-TheHandoff/prompts/video-v3.txt` (3,000 words).
Status: UNPROVEN as to effect of length.
Test: one prompt at 800, 1,800 and 3,000 words, same references and lines, then `tools/seedance/qa_speech.py` and `qa_cuts.py` on each.

**Q79. Dialogue.**
A block near the top with one row per line (`Shot N, from about T, X says exactly: "..."`), the statement that the film holds exactly these lines and no other words, the same line repeated inside its shot, a delivery note of 6 words or fewer, exactly one line per single-shot template, and a whisper check. The Handoff then returned 7 of 7 lines word for word (measured on the author's runs, not included).
Evidence: `templates/SHOW01-TheHandoff/prompts/video-v3.txt` (lines 11 to 20); `tools/seedance/qa4.py` Q1; `tools/seedance/qa_speech.py`.
Status: PROVEN.

**Q80. Performance and emotion.**
Write what the person does, why and how it changes: a motive, a change over the shot, at least 3 body cues (5 in a tight frame), 45 to 120 words, small acting, and the order of events. No "reaction" word.
Evidence: `tools/seedance/qa4.py` Q2 and Q3; `tools/seedance/lean_v3.py`.
Status: PROVEN.

**Q81. Actions the pill cannot show.**
Write them in the prompt. Who holds what ("the case by its handle in your right hand"), the exact shape of a key and lock, a natural gait with "never in slow motion", the kneel and the hand on the knee. Do not add limbs, boots or footprints to the pill.
Evidence: `docs/why/why-limbs-never.md`; `templates/STORY02-DiveToShutter/prompts/story02-p.txt`.
Status: PROVEN.

**Q82. Continuity and match cuts.**
End each shot paragraph with "At the moment of the cut ..." and the pose. Open the next with "the next shot opens on that same moment" and repeat posture, fist, scarf, cup. State wardrobe and the key hand in every shot. Add a backstop sentence listing the cut times.
Evidence: `templates/STORY03-TheGap/prompts/story03-ext.txt`; `templates/SHOW01-TheHandoff/prompts/video-v3.txt` ("The edit is fixed ..."); `docs/camera-language.md`, section 6.
Status: PROVEN.

**Q83. Keeping the person's own face.**
An approved photo as `@image1` with a face-only role sentence, and `pass_faces: true`. 218 of the 242 sends set it. A sheet sent without the photo lost the likeness. Use a photo of yourself or of someone who agreed.
Evidence: `templates/*/sent.json` (`parameters.sent_as.pass_faces`); `docs/tein-endpoint.md`.
Status: PARTLY. UNPROVEN: how `pass_faces` changes the output.
Test: send the same shot with and without it.

**Q84. What the two dust prompts have in common.**
The same blocks and the same locked role sentences; the same place paragraph (burnt orange dust, ruined brutalist concrete); one flowing performance with a motive ("tired and resolved", "has carried the key for years") and a gust or kneel beat; a camera paragraph with rig, lens and metres; a sound line of wind, grit and cloth only; "There is no music of any kind"; the same look line; no voice and no mood panel. Lengths 769 and 820 words. Why they worked has not been tested by removing one part at a time.
Evidence: `templates/CAM42-DroneDive/prompts/v6-cam42-t.txt`, `templates/CAM25-ArcAndRise/prompts/v10-cam25-t.txt`.
Status: PARTLY. UNPROVEN: which shared part mattered.
Test: remove one part per run.

**Q85. What must be true before a send.**
The gate passes (Q0 to Q11), a reader has gone through the prompt as the model would and its edits are applied, props and first appearances are checked, the exact list and cost have been shown, and you said yes for that exact request.
Evidence: `docs/qa-prompt-and-video.md`; `tools/seedance/qa4.py`; `docs/rules.md`, section 5.
Status: PROVEN.

## H. Seedance and the API

**Q86. Modes.**
Tein's task types are `reference`, `edit` and `extend` (`omni_reference_task_type`). Of the 242 sends, 240 are `multi_reference` (the earlier hosted API's name for reference mode) and 2 are `extend`; none uses edit. The earlier hosted API listed nine modes (text_to_video, first_n_last_frames, multi_reference, edit, extend, multi_frame, lipsyncing, voice_clone, ugc); lipsyncing, voice_clone and ugc were never tried.
Evidence: `templates/*/sent.json` (`parameters.sent_as.mode`); `docs/tein-endpoint.md`.
Status: PROVEN.

**Q87. Roles and order.**
`@video1` the pill clip, `@image1` the face photo, `@image2` one mood panel or the sheet, `@audio1` the voice clip, `@video2` a likeness clip in extend. In extend step 3 the single image is `@image1`.
Evidence: `docs/seedance-notes.md`, section 1 (references table); `tools/seedance/gallery_v4.py`.
Status: PROVEN.

**Q88. Limits.**
Up to 30 images; up to 10 videos with a combined duration under 30 s; up to 10 audios under 30 s combined; video 24 to 60 fps (23.6 fps refused) and at least 407,696 pixels; images at least 90,000 pixels; `duration` 4 to 30. Keep references under 29 s.
Evidence: `docs/seedance-notes.md`, section 2.
Status: PARTLY. UNPROVEN: the image aspect limit of 0.40 to 2.50 and 30 MB come from third-party guides and the provider's documentation, and nothing in the repo checks them.
Test: send one wide sheet as a 4 s job and read the refusal text.

**Q89. Draft mode.**
A draft is a 480p preview made with `draft: true`; see `docs/tein-endpoint.md#what-a-draft-is` for the one definition, including the field names of the earlier hosted API. A 7 s pill draft costs 1,020.6 credits. The final re-renders the same take: draft and final matched every 3 s on the 29 s Handoff (measured on the author's runs, not included).
Evidence: `templates/CAM06-Orbit/sent.json` (`cost_credits` 1020.6); `docs/costs.md`.
Status: PROVEN.

**Q90. Draft-to-final risk.**
The final draws texture again. Paving cracks sat in other places, a glance direction changed in a car shot, neon lettering read differently. Camera, poses, timing, faces and sound carry over. Never finalize before the draft is right.
Evidence: `docs/seedance-notes.md`, section 3.
Status: PROVEN.

**Q91. Extend.**
`extend` takes the previous clip (2 to 30 s, sound removed) in `videos`, needs `aspect_ratio: "adaptive"` (Tein: `ratio: adaptive`), returns only the new footage, and its first frame equals the input's last frame; the maximum output is 30 s. Cuts are carried by match-cut wording in the prompt.
Evidence: `docs/seedance-notes.md`, section 4; `templates/STORY03-TheGap/prompts/story03-ext.txt`; the two extends in `templates/*/sent.json`.
Status: PARTLY. UNPROVEN: finals for a chain, the seam between two finals, inputs longer than 15 s, an automated join.
Test: finalize two chained drafts and compare the seam frames.

**Q92. 4K.**
Tein documents finalizing a draft at `4k`; the authors did not test this on Tein. On the earlier hosted API used in the original tests the final ignored the 4K field and returned 1080p, and only a fresh generation at 4K gave 4K (4398 x 1886 at 21:9). A true 4K of an existing take is UNPROVEN on Tein.
Evidence: `docs/seedance-notes.md`, section 1 (4K); the 4K requests in `templates/STORY02-DiveToShutter/sent.json` and `templates/STORY03-TheGap/sent.json`.
Status: UNPROVEN.
Test: finalize one 4 s draft with `resolution: "4k"` and read the output size.

**Q93. How much sharper.**
About 4x the edge detail of the draft; 1.5 to 1.8x the detail of 1080p on close faces; 1.9 to 2.4x on far background. At normal size 1080p and 4K look the same. The big step is draft to 1080p.
Evidence: `docs/seedance-notes.md`, section 1 (4K); measured on 15 crops on the author's runs, not included.
Status: PROVEN as measured; one set of 15 crops.

**Q94. Voice.**
A 14.5 s mono recording as `@audio1`, timbre, pitch, accent and pace only; approved files only; up to 30 s in total. Seedance starts speech about 2 s early and drops words from long lines. A supplied recording padded with silence put the first word on target.
Evidence: `docs/seedance-notes.md`, section 5 (voice).
Status: PARTLY. UNPROVEN: lip sync against a supplied recording; the mouth check shows movement and nobody listened.
Test: a person listens and watches a take with a padded recording.

**Q95. Filters.**
NSFW blocked a pencil fight with unclothed outlines; copyright blocked the night alley brawl, fight coverage, a 360 in the style of a known film and some random jobs. Retry once, then change setting, clothing and names. A refused job is not charged. On one test day 7 of 144 requests hit copyright and 1 hit NSFW.
Evidence: `docs/seedance-notes.md`, section 5 (filters); `templates/ACT07-FightCoverage/README.md`.
Status: PROVEN.

**Q96. Request cost.**
72.9 credits per (input + output) second with video and 122.2 per output second without, at 480p; 675.4 and 406.1 at 1080p; 1085.3 and 673 at 4K (rates of the earlier hosted API, read from its bills). For current prices see tein.ai/pricing.
Evidence: `docs/costs.md` rates, checked against logged bills (1,020.6, 4,228.2, 3,543.8, 19,586.6, 20,262, 32,559) in `templates/*/sent.json`.
Status: PROVEN.

**Q97. Result delivery; matching a file to a request.**
On Tein the submit answers 202 with an id; poll `GET /v1/jobs/{id}` until `succeeded`, or set `callback_url` (per Tein's docs). Match a file to its request by content, not by file name: compare its size with the size reported for the id, then a hash of the local file with a fresh download.
Evidence: `docs/tein-endpoint.md`; `docs/seedance-notes.md`, section 5 (matching): 136 rows checked, 132 matched, 2 wrong and fixed, 2 unverifiable.
Status: PARTLY. UNPROVEN: that the fingerprint algorithm of the earlier API was md5.
Test: hash the local file and a fresh download and compare.

**Q98. Through Tein's endpoint.**
The request shape, the field names and the finalize step are in `docs/tein-endpoint.md`, as documented at tein.ai/docs. The authors did not test each documented refusal.
Evidence: `docs/tein-endpoint.md`.
Status: PARTLY. UNPROVEN: the refusals and limits that Tein documents but the authors did not hit.
Test: send one 4 s draft and one oversize request and compare with the docs.

**Q99. Seed.**
There is no seed parameter and the sent records say "seed: not supported". Rewriting a loved prompt with its exact words gave a different take.
Evidence: `templates/*/sent.json` (`parameters.seed`); `docs/seedance-notes.md`, section 1.
Status: PROVEN.

## I. QA on the result (the gates are in Q101, in `answers/D-E-I-engine.md`)

**Q102. Review passes: reader, director, critic, auditor.**
A reader goes through the prompt as the model would and returns edits; a reviewer looks at a 24-frame sheet of the blockout; a critic finds stock and repeated scenes; an auditor tracks props. They caught a scarf that hid the beard (CAM25), a building behind and across the street (CAM21), repeated beats (two letters, two watches, three rooftops), a cup that never entered a shot, and "microphone".
Evidence: measured on the author's runs, not included. No script for the readers is in the repo.
Status: PARTLY. UNPROVEN: that a reader catches more than the gates do.
Test: run the gates alone and the gates plus a reader on the same ten prompts and count faults found in the drafts.

**Q103. Cut detection.**
Frame difference at 160 x 67 grey with a mean absolute difference above 28, on the clip and on the result. The Handoff clip spikes at 2.5, 5.5, 9.0, 12.0, 14.0, 17.0, 21.0, 24.5 and 26.5 s.
Evidence: `tools/seedance/qa_cuts.py` (header); `templates/SHOW01-TheHandoff/pill.mp4`.
Status: PROVEN.

**Q104. Mouth check.**
`tools/seedance/qa_mouth.py` measures the gap between the inner lips as a share of face height, 12 times a second (MediaPipe face mesh). It shows movement, not sync, and faces in wide shots are too small to measure. On the shipped CAM22 to CAM38 takes it measured a mean opening of 0.011 to 0.038 and a motion of 0.0046 to 0.0163. The older numbers (closed 0.032, speaking 0.097 to 0.138) used another landmark choice and do not transfer.
Evidence: `tools/seedance/qa_mouth.py` (header).
Status: PARTLY. UNPROVEN: limits that separate a closed mouth from a speaking one; no closed-mouth take with a known answer was available.
Test: measure a take that speaks and one that is closed and set the limits between them.

**Q105. Speech check.**
`tools/seedance/qa_speech.py` runs whisper (`--model small`) on each take alone, compares it word for word with the dialogue block, and reports repeats and extra words. The Handoff returned 7 of 7 from the third run. "Come on." was doubled in some takes.
Evidence: `tools/seedance/qa_speech.py` (header).
Status: PROVEN.

**Q106. A result against the clip.**
`tools/seedance/qa_framing.py` compares face size and position with the pill's head second by second (ratio 0.65 to 1.5, within 0.15 of the frame, 75 percent of scored seconds). `tools/seedance/qa_video.py` uses phase correlation only to remove camera motion before scoring the person.
Evidence: `tools/seedance/qa_framing.py`, `tools/seedance/qa_video.py`.
Status: PARTLY. UNPROVEN: a phase-correlation check of the result's camera against the clip's.
Test: estimate the global shift per frame for the clip and the result of CAM06 and compare the curves.

**Q107. A file against its request.**
See Q97: by size, then by a hash and byte count of the file against a fresh download. 136 rows checked, 132 matched, 2 wrong and fixed, 2 unverifiable.
Evidence: `docs/seedance-notes.md`, section 5 (matching).
Status: PARTLY. UNPROVEN: the algorithm of the earlier API's fingerprint.
Test: compare `md5` of the local file with a fresh download.

**Q108. Before showing anything.**
Open the real file and look at frames of the new render; do not repeat an old verdict note. An old "blocked" note hid a finished alley fight. `tools/seedance/compare.py` puts the pill clip and every result side by side at the same moments, and `cut_pairs.py` tiles the frames before and after each cut.
Evidence: `tools/seedance/compare.py`, `tools/seedance/cut_pairs.py`; `docs/rules.md`, section 6.
Status: PROVEN.

## J. Failures and fixes

Each answer is in `docs/failures-and-fixes.md`, with symptom, cause, fix and example.

**Q111. Clay set leaks.**
Cone pines, ball trees, a statue of cone, ball and sticks, chequerboards. Cause: any reference is read as appearance. Fix: the three realism lines, named stand-ins, `--no-scenery`, no scenery in sheets.
Evidence: `docs/why/why-the-set-stays-coarse.md`.
Status: PARTLY. UNPROVEN: a fix for statues, which still failed in four templates.
Test: give the statue a better stand-in or an approved reference image and rerun.

**Q112. Stripes on clothes.**
A jacket in magenta stripes (SC08), a striped sweater (CAM27), a striped object by a pillar (CAM36). Fix: the stripes sentence plus plain solid clothing and the colours to avoid.
Evidence: `templates/CAM27-DutchPush/prompts/v14-cam27-t.txt`; `release-media/CAM27-DutchPush/v14-cam27-t.mp4`.
Status: PROVEN.

**Q113. Stray capsule.**
A green capsule in a warehouse (SC08), a grey disc beside the head from second 6 (Glambot, the white dot). Fix: "no striped capsule appears at any moment ..."; the only white dot is the face dot.
Evidence: `engine/cinematic/tools/seedance-realism.py`; `release-media/SC08-HeistApproach/result.mp4`.
Status: PROVEN.

**Q114. Robotic walk.**
The pill clip carries bodies; the clay mannequin gave a game walk. A photo, pencil, blur and ghost did not fix it; the capsule did.
Evidence: `docs/failure-ladder.md`, ladder 1.
Status: PROVEN.

**Q115. Limp or dragging foot.**
Caused by "bad left leg, dragging foot, scrape, slow and labored" in the prompt. Fix: steady natural pace, one gust stagger, "never in slow motion".
Evidence: `docs/why/why-limbs-never.md`.
Status: PROVEN.

**Q116. Marks on the ground.**
Tracking marks leaked a chequerboard; footprints and scrape marks were rejected. Fix: no marks, a low camera beside the pill for a feet shot, gait from the prompt.
Evidence: `docs/engine.md`, section 5 (`--marks`); `docs/why/why-limbs-never.md`.
Status: PROVEN.

**Q117. Slow motion.**
Previs step length was 45 percent too long and gaits did not share a clock; the leap of faith slowed the whole fall to 14 percent. Fix: measured pace per clip; real-speed fall for 3.3 s, then a ramp to 0.035 only at the landing.
Evidence: `docs/physics-and-motion.md`, sections 2 and 9; `engine/cinematic/src/kit/rig.ts` (`STRIDE`).
Status: PROVEN.

**Q118. Sliding feet.**
30 to 50 percent of body speed fell to 6 percent after the shared cadence and a 5 cm heel slow-in.
Evidence: `docs/physics-and-motion.md`, sections 2 and 3 (measured on the author's runs, not included).
Status: PROVEN as measured.

**Q119. Ghost or doubled head.**
Head turn piled up across blur sub-samples (about 67 degrees per sample); reset per pose. The pill ghosted with sub-frames, so it renders as its own body.
Evidence: `docs/physics-and-motion.md`, section 4.
Status: PARTLY. UNPROVEN: a fix for a second figure beside the jumper in a leap draft.
Test: rerun FAM04 with "one person only in the frame" and count figures per frame.

**Q120. Body through a prop.**
A person inside a table came from freehand shot sizes and "a bench between us". Fix: seated behind the bench, hands on it. The motion check found no body through a prop.
Evidence: `docs/why/why-words-beat-a-specific-video.md`; `docs/physics-and-motion.md`, section 6.
Status: PROVEN.

**Q121. Silent mouths in a dialogue.**
The prompt said "mouths closed", or a voice was attached with no on-camera speech instruction. Mouth opening 0.032 became 0.084 after the fix (measured with an earlier landmark choice, see Q104).
Evidence: `tools/seedance/qa4.py` Q1 and Q6; `tools/seedance/qa_mouth.py`.
Status: PROVEN.

**Q122. Paraphrased line.**
"You said you had the money. I lied. Run." came back reworded. Fix: the verbatim block.
Evidence: `docs/prompt-anatomy.md`; `tools/seedance/qa4.py` Q1.
Status: PROVEN.

**Q123. Speech where a reaction was wanted.**
A man alone in a shower; a hospital line that made no sense. Fix: a reaction or a phone call.
Evidence: `docs/failures-and-fixes.md`.
Status: PROVEN.

**Q124. Cuts at the wrong second.**
Video 9 of 9; sheet 1 to 3 of 9. Fix: the clip carries the cuts, each cut a clear change of angle and size.
Evidence: `docs/why/why-video-first-sheet-second.md`.
Status: PROVEN.

**Q125. Cuts that do not carry.**
An arm at 6 s, gone at 7 s; a morphing scarf; a hung key; a cup from nowhere; skipped actions at 21 s. Fix: action written across each cut; state in every shot.
Evidence: `docs/camera-language.md`, section 6 (continuity across a cut); `tools/seedance/cut_pairs.py`.
Status: PROVEN.

**Q126. Locked camera in a sheet run.**
"Orbits a steady half circle" alone. Fix: start side, direction, arrival, about 3 s, "panels 4 to 9 are one continuous camera move".
Evidence: `docs/camera-language.md`, section 3.
Status: PARTLY. See Q52 in `answers/D-E-I-engine.md` for the open part and its test.

**Q127. Gear or rig in the picture.**
"The camera is on a tripod" drew a tripod; a ban line naming gear put gear in the picture. Fix: "locked off"; remove the line. Sent prompts still name "technocrane" and "drone gimbal" in the camera script and passed, so it is not known which gear words are safe.
Evidence: `docs/camera-language.md`, section 3; `templates/CAM06-Orbit/prompts/video.txt`.
Status: PARTLY. UNPROVEN: which gear words are safe.
Test: the same shot with and without the rig name, 10 draws each.

**Q128. NSFW block.**
A pencil fight with unclothed outlines, blocked twice; figures-only passed.
Evidence: `docs/seedance-notes.md`, section 5; `docs/variants.md` (variant 10).
Status: PROVEN.

**Q129. Copyright block.**
Retry once, then change setting, clothing and names. ACT07 fight coverage never passed after at least 5 attempts.
Evidence: `templates/ACT07-FightCoverage/README.md`; `docs/seedance-notes.md`, section 5.
Status: PARTLY. UNPROVEN: what would pass for a fight.
Test: write a fight as a different action (a race, a dance) and see if it passes.

**Q130. 30.00 s refusal.**
On the earlier hosted API, 30.00, 29.92 and 29.50 s were refused and 28.92 s was accepted; 29.3 s was accepted later. Keep references under 29 s.
Evidence: `docs/seedance-notes.md`, section 3 (the table).
Status: PARTLY. UNPROVEN: whether Tein measures the same way.
Test: encode one clip at 29.0, 29.3 and 29.5 s and send each as a 4 s draft (`docs/seedance-notes.md`, section 3).

**Q131. Image aspect refusal.**
Sheets wider than the limit failed. Re-cut within 0.40 to 2.50.
Evidence: `tools/seedance/drawn_batch.py` (refuses a sheet outside 0.40 to 2.50); `docs/variants.md`.
Status: PROVEN.

**Q132. Wrong file matched to the wrong request.**
A retry overwrote a result file; 136 rows checked, 132 matched, 2 wrong. Match by size or bytes.
Evidence: `docs/seedance-notes.md`, section 5 (matching).
Status: PROVEN.

## K. Stories and long takes

**Q140. The Handoff.**
10 shots, 7 spoken lines, one 29 s generation, the reference trimmed to 28.92 s, a 14.5 s voice clip, a roughly 3,000-word prompt, 9 of 9 cuts from video, a 720-frame QA.
Evidence: `templates/SHOW01-TheHandoff/` (README, `template.ts`, prompts); `release-media/SHOW01-TheHandoff/result.mp4`; `docs/stories.md`.
Status: PROVEN.

**Q141. Planning a 30 s story.**
Story before three.js; each shot gets want, place, prop, feeling; a critic checks repeats; the previs is checked and read frame by frame; props are audited for first appearance; state is written per shot.
Evidence: `docs/stories.md`; `docs/qa-engine-side.md`, section 5.
Status: PROVEN.

**Q142. Writing an extend.**
The tail of the loved take (12 s, sound removed) as `@video1`, the face and voice, `extend`, 30 s, `adaptive`; each cut opens "on that same moment" and repeats the pose; six lines with times (3.0, 4.6, 6.9, 13.0, 14.2, 23.4 s).
Evidence: `templates/STORY03-TheGap/prompts/story03-ext.txt`; `docs/stories.md`.
Status: PROVEN.

**Q143. Frame pairs for continuity.**
Take the last frame before and the first after each cut and compare arm, scarf, prop, clothes, place. The four cuts of the STORY03 run that was kept passed (measured on the author's runs, not included).
Evidence: `tools/seedance/cut_pairs.py`; `docs/qa-prompt-and-video.md`.
Status: PROVEN.

**Q144. The dust plaza.**
CAM42 dive opens, CAM25 arc continues, slow even camera, focus pulls, a lot of wind and dust, hyperreal dirt, a described key. 7 shots in 30 s.
Evidence: `templates/STORY03-TheGap/` and `templates/STORY02-DiveToShutter/`; `docs/stories.md`.
Status: PARTLY. UNPROVEN: which of these made it work.
Test: ablate one part per run (focus pulls, dirt wording, key description).

**Q146. Dialogue length for 30 s.**
Both films have 34 spoken words in about 30 s (7 lines and 6 lines). A ten-line, 55-word draft was cut to six.
Evidence: `templates/SHOW01-TheHandoff/prompts/video-v3.txt`; `templates/STORY03-TheGap/prompts/story03-ext.txt`.
Status: PARTLY. UNPROVEN: that 34 words is the right length.
Test: the same scene at 20, 34 and 55 words, then a viewer test.

## L. Cost

**Q149. One template by route and length.**
See the table in `docs/costs.md`. A 7 s draft from video is 1,020.6 credits and from a sheet 855.4; a 1080p final is 5,685.4 (video draft) or 4,727.8 (sheet draft).
Evidence: `templates/CAM06-Orbit/sent.json` (`cost_credits`); `docs/costs.md` rates.
Status: PROVEN.
