# Rules

Each rule says what to do, why, and where in this repo the evidence is. Rules about the method apply to everyone who uses it. Where a rule rests on runs that are not in the repo, the evidence column says so.

---

## 1. The pill

| Rule | Why | Evidence |
|---|---|---|
| Every person in the blockout is a striped pill with no body to copy. | A clay mannequin made the camera right and the bodies stiff, like a game character. | `docs/why/why-not-people.md` |
| The pill uses loud colours, a pattern and its own shape so it cannot be mistaken for the set. | A stand-in that looks like the set's boxes is read as part of the set. | `docs/why/why-capsules.md` |
| A white dot at eye height shows which way the pill faces. Do not add a black facing bar. | The dot is enough to show facing. The black bar was an unexplained mark and was dropped; that it read as a door is UNPROVEN. | `docs/why/why-capsules.md`, `docs/known-limits.md` |
| One colour pair per character, the same across all templates, so a prompt can name it. | The prompt maps a colour to a person in one sentence. | `docs/prompt-anatomy.md` |
| A prop that acts gets one flat label colour, not stripes. | The prompt then says what it really is (an orange box is a brown leather case). | `templates/SHOW01-TheHandoff/README.md` |
| A product is the same pill, 24 cm tall. Never a bottle, a box or a shoe shape. A person-sized pill is 1.75 m. | A product-shaped stand-in is copied as that shape. One pill carries position, size and facing only. | `docs/engine.md` |
| The pill has no legs, arms, hands or boots. Feet, hands, limp and stumble come from the prompt. | A limbed stand-in is copied as stiff motion, and ground marks were read as real objects. | `docs/why/why-limbs-never.md` |
| The pill has no ground marks standing in for a gait either. | Footprints and drag scrapes tried as a limbless gait cue were read as real objects. | `docs/why/why-limbs-never.md` |
| The pill is as wide as a person's shoulders, not a dome. Build the human first to find proportions, then replace it by the pill. | The fitted capsule was about 0.9 m wide, so close shots read as a giant dome. The slim pin replaced it. | `docs/why/why-capsules.md`, `docs/engine.md` |
| The pill stays a real lit 3D object even when the environment is drawn in ink. | The sheet route fills each pill with its own colour, so the model still gets position, size and facing. | `docs/variants.md` |
| Never let a mannequin appear in a pill render, including the extra blend frames used for motion blur. | Anything with a body in the reference has that body copied, and blend sub-frames drew ghost heads. | `docs/why/why-not-people.md`, `docs/physics-and-motion.md` |
| A prop in the blockout must read as what it is. A plain sphere for a fist and an orange block for a lock confuse the viewer and the model. | In the dust film's blockout the last shot showed a huge circle where the fist and the lock were; a brass plate with a keyhole and a small key fixed it. | `docs/stories.md` |
| Two overlapping pills need their own outlines, and a pill in front of the lens still needs its colour (sketch route). | Without them two pills merge into one colour. | `docs/variants.md` |

## 2. The set

| Rule | Why | Evidence |
|---|---|---|
| The blockout set is coarse and colourless grey. | The more detailed the set is, the more of it the result copies. | `docs/why/why-the-set-stays-coarse.md` |
| No coloured light, halos, shafts or grade in the blockout. Mood comes from the prompt. | Coloured light and thick cut-in shapes made the blockout read as a finished set, and it must read as a blockout. | `docs/why/why-the-set-stays-coarse.md` |
| The result never keeps the clay set. It is a hyper-real, cinematic render. | Cone pines and ball trees came back in the result until the prompt said to rebuild every object. | `docs/failures-and-fixes.md` |
| Describe every set piece as a real object with a colour and a material. | A set piece that is only named comes back grey. | `docs/prompt-anatomy.md` |
| Leave trees, rocks, bushes, lamps and benches out of drawn sheets and out of object-shot previs. | Drawn scenery came back as game-like cone trees. | `docs/why/why-the-set-stays-coarse.md` |
| No tracking marks, no checker floor, no rendered shadows or colour wash on sheets. Plain line is best. | A still frame is a picture to copy: tracking marks became a real chequerboard floor. | `docs/failures-and-fixes.md` |
| A picture of the place is a mood reference only, never a map. One panel at most. | A four-panel sheet was copied as layout and put the person inside the table. | `docs/prompt-anatomy.md` |
| Do not define the place too hard in the blockout. Let the prompt decide. | A detailed place picture was copied as layout: in the first send the person stood inside the table. | `docs/why/why-words-beat-a-specific-video.md` |
| Choose a place that fits the story, not the same plaza every time. | The prompt rebuilds the place, so a fitting layout gives it a better start. | `docs/stories.md` |
| The place feels large and the person small. | The dust set read as too small and was rebuilt at a larger scale. | `docs/stories.md` |
| One environment per move, and the 24 environments and moods are all used across the library. | A variety of places stops every result from sharing one look. | `docs/engine.md` |
| Bodies stand on the real floor. Feet are locked. No slow-motion gait, no merging into props, no ghost heads. Measure before showing. | Sliding feet, slow gaits and bodies passing through props were measured and fixed in the engine. | `docs/physics-and-motion.md` |

## 3. The camera

| Rule | Why | Evidence |
|---|---|---|
| Move the camera in every clip you send. Locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03 and the ANG family) are kept as camera studies: the drafts from four of them (ANG06, 07, 10, 13) were stiff, so they are not recommended. | The static drafts were the stiff ones. | `docs/why/why-no-static-shots.md`, `docs/known-limits.md` |
| Give every shot and camera effect at least 2 seconds; nine shots in older templates (ACT07, SC06, SC07, SC09, SC10, STORY03) are shorter, built before the rule. A crash zoom locks on the eyes for about 2 s; SHOW01 meets 2.0 s for the shot and locks for 1.35 s. | A one-frame zoom read as a cut. | `docs/camera-language.md` |
| A cut is fine if the action carries across it. Write the action across each cut, not inside each shot. | A cut fails when the state changes: an arm, a scarf, a prop, clothes. | `docs/prompt-anatomy.md` |
| The 3D clip drives the motion and the cuts. The prompt is only a backstop. | With video input 9 of 9 cuts landed on the frame; a sheet landed 1 to 3 of 9. | `docs/why/why-video-first-sheet-second.md` |
| Spell out each camera move: start side, direction, arrival, height, feel. One named move per shot. | "Orbits a half circle" alone left sheet runs with a locked camera. | `docs/prompt-anatomy.md` |
| Camera moves are slow, eased and start early. Speed problems are fixed in the three.js camera, not in the prompt. | The dust film's first camera move was too fast and started late; one eased arc fixed it. | `docs/camera-language.md` |
| Keep the story object in frame. Aim between the person and the goal. | The key and the lock were out of frame until the aim was changed. | `docs/stories.md` |
| Bridge two different shots with the same camera pose at the join. | A cut that jumped from a high arc to a low follow was fixed by starting the follow from the pose the arc ended on. | `docs/camera-language.md` |
| Do not put slow motion on a part that is real speed in the film. | In the leap of faith the fall was slowed to 14 percent although the film plays it at about real speed. | `docs/failures-and-fixes.md` |
| Put focus pulls and apertures in the blockout like a director would. | The engine works depth of field out from the lens, stop and focus distance, so the blockout can show a focus pull. | `docs/camera-language.md` |
| Name a real camera body and a lens per shot, not one millimetre for all. | Lens choice changes how space and faces read. | `docs/camera-language.md` |
| Do not transition by rotating the camera unless the move is motivated. Cut with match cuts. | A match cut holds the subject at the same frame position on both sides. | `docs/camera-language.md` |
| A camera-only clip (no people) is the right route when the subject's position does not matter. | It gave the freest movement, and the subjects landed in the wrong places. | `docs/variants.md` |

## 4. Prompts and claims

### Prompts for the video model

| Rule | Why | Evidence |
|---|---|---|
| Name every stand-in in the prompt, say no pill ever shows, and rebuild every grey object as a real one. | A stray capsule and capsule stripes on clothing leaked into results without these lines. | `docs/prompt-anatomy.md` |
| Say plainly what people wear and which colours must not appear. | A striped sweater appeared when the garment was not stated. | `docs/failures-and-fixes.md` |
| Say who holds what, because pills have no hands. | The pill has no hands, so nothing in the clip shows who holds what. | `docs/prompt-anatomy.md` |
| A conversation needs real spoken lines in the prompt, in an exact-words block near the top, and again in the shot. | Lines buried in a long prompt were paraphrased; scenes without lines had closed mouths. | `docs/prompt-anatomy.md` |
| If a person speaks, the mouth must speak. A voice over a closed mouth fails. | The mouth opening was 0.032 of face height on the voice-over take against 0.097 to 0.138 on spoken takes. | `docs/failures-and-fixes.md` |
| Write dialogue punctuation as you want it heard. An ellipsis makes a pause. Say the line once, and name the shot where it is said. | "Hi... friend" made a pause, and a line said in two shots was spoken twice. | `docs/prompt-anatomy.md` |
| Say "there is no music". | Music slipped in once when a song was named. | `docs/prompt-anatomy.md` |
| Never name equipment in a ban line, and say "locked off", not "on a tripod". | The model draws what it is told about, so a ban line put equipment in the picture. | `docs/failures-and-fixes.md` |
| Do not write "still", "motionless" or "stands very still". The person moves, breathes and blinks. | The person turned into a statue. The gate refuses these words. | `tools/seedance/qa4.py` |
| Keep acting small. A word that sounds like a body action is filmed as that action. Say no tears if you do not want tears. | "Breath through his nose" was filmed as sniffing and tear words triggered crying. | `docs/prompt-anatomy.md` |
| Every action must make sense in its place: what is held, where the person is going, what they feel, what the shot is for. Story first, then the three.js. | The prompt gate requires a motive and a change over the shot, and a story plan gives both. | `docs/stories.md`, `docs/qa-prompt-and-video.md` |
| Reuse the exact wording of a prompt that worked. Do not paraphrase it. | The 30 s dust prompt rebuilt from two liked prompts, word for word, was followed in order. | `docs/stories.md` |
| Describe the shape and size of every key prop, and say the key goes all the way in. | The key came back thick and hovering beside a narrow slot until it was described in full. | `docs/prompt-anatomy.md` |
| Make the place dirty and real. Nothing polished. | Without wear and dirt wording, rocks and buildings came back polished. | `docs/prompt-anatomy.md` |
| Do not pack many actions into a short window. Each hand-over of an object is a morph risk. | About ten actions in 15 s made the scarf morph. | `docs/prompt-anatomy.md` |
| State the visible state of scarf, mouth, cup and key in every shot. | Props and clothes changed after a cut when the state was not restated. | `docs/prompt-anatomy.md` |
| Change one thing per round. Do not rewrite a good draft. | A re-run is a new take, so a rewrite loses what was liked. | `docs/stories.md` |
| When the copyright filter refuses, retry once, then change the place, clothes and names. Do not use film or franchise names. | The filter judges the finished video, and some refusals are random. | `docs/seedance-notes.md` |
| Do not put aspect ratio, duration, resolution, round brackets or narration in the prompt. | Those are settings, and round brackets mean music in Seedance syntax. | `docs/prompt-anatomy.md` |
| Write the camera paragraph from the template's own numbers, keep the acting lean, and keep the full protective paragraphs. | The fully lean version fixed stiffness but loosened the framing; the camera script followed the blockout better. | `docs/prompt-anatomy.md`, `tools/seedance/qa4.py` |

### Dialogue and claims

| Rule | Why | Evidence |
|---|---|---|
| A line that describes a clip must match the clip and the run's own request. Document only runs that exist. | A "plain boxes" try was described that never ran; the file named for boxes held the striped capsules. | `docs/failure-ladder.md` |
| Dialogue must be plain and in character, never explaining the backstory. | The first draft of the reunion explained the backstory. The final has none and six lines. | `docs/stories.md` |

## 5. Spending and sending

| Rule | Why | Evidence |
|---|---|---|
| Never queue anything that was not asked. A queued job cannot be cancelled. | Four test drafts were queued after a "no" and could not be stopped. | `docs/process-lessons.md` |
| Re-run exactly the variant named. Do not re-run what already passed. | The wrong variant was re-run once, at the full cost of a draft. | `docs/failures-and-fixes.md` |
| Send in batches of 4, not 54 at once. | A fault shows up in the first batch, before it is paid for everywhere. | `docs/process-lessons.md` |
| Draft first. A final re-renders the same take at 1080p for about 5.5 times the draft cost. Say that before finalizing. | A final re-renders the same generation, and small details change. | `docs/costs.md` |
| Spend nothing on a guess. A request for "the exact video" means prove the match first. | Two fresh 4K generations on the wrong take were not the video that had been chosen. | `docs/process-lessons.md` |
| When more than one draft could be meant, ask which. | A hospital approval was read as the silent version when the phone call was meant. | `docs/failures-and-fixes.md` |
| Say what has not been sent. | `sent.json` records what went out; anything not in it was not sent. | `templates/CAM06-Orbit/sent.json` |
| Send only the reference files you chose. Use a voice clip only of a person who agreed. | The model copies the face and voice it is given. | `docs/tein-endpoint.md` |
| Failed jobs are refunded, and a random copyright or content-filter hit costs nothing. Do not re-queue it unasked. | A rejected job is not charged. | `docs/costs.md` |

## 6. Showing results

| Rule | Why | Evidence |
|---|---|---|
| Look at what was generated, not at an old status note. | An old "blocked" note hid a finished result. | `docs/process-lessons.md` |
| In a gallery, every pair of videos starts and loops together. | Out-of-sync pairs make a fault look like a difference. The measured drift was at most 0.09 s. | `docs/qa-prompt-and-video.md` |
| Show the overview of all looks first, then the detail. | A viewer needs the whole before the part. | `docs/qa-prompt-and-video.md` |
| Keep sketches in their own section, and show the file that was actually sent. | Mixing the routes hides which input made which result. | `docs/qa-prompt-and-video.md` |
| Label comparisons by input and output: the clip that was sent beside what Seedance made. Each take carries its own sound, or the label says whose sound it is. | A side-by-side with one shared audio track made one panel's lips look wrong. | `docs/qa-prompt-and-video.md` |
| Show the move first and explain "pill" in one line. | A first screen of text boxes does not teach. | `gallery/GALLERY-README.md` |
| State honestly what you cannot check. An agent cannot hear audio or judge lip-sync. Measure what can be measured and ask a person to listen. | The mouth check shows movement, not sync. | `docs/qa-prompt-and-video.md` |

## 7. Files and renders

| Rule | Why | Evidence |
|---|---|---|
| Delete only files you made yourself. | A clean-up of "old renders" once removed files that belonged to someone else. | Measured on the author's runs, not included. |
| Keep at least 3 GB free before a long render; the scripts do not check. | A full disk stalls a render with no frames written. | `docs/engine.md` |
| After a render, check the file's time and look at frames. A crashed render can leave an old video that looks new. | An old video was sent as a new take once. | `docs/qa-prompt-and-video.md` |
| Match a downloaded file to a request by size or hash, never by file name. | A retry overwrote the first run's file, and the log showed the retry under the first run's id. | `docs/seedance-notes.md` |
| Do not leave a template file edited after a one-off test. Restore it. | A one-off edit stays in the file and changes every later render of that template. | Measured on the author's runs, not included. |
