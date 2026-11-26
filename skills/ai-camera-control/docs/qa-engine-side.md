# QA on the engine side

This page covers the checks that run on the three.js scene before anything is sent to a video model: stills first, the measured pass, the eye pass, the motion check, the look before rendering and the render order. The checks that run on a video model's result (cut detection, transcripts, mouth, file matching) are in `docs/qa-prompt-and-video.md`. Commands that start with `tools/` run from `engine/cinematic` and mean `engine/cinematic/tools/`.

## 1. The order

From `skills/cinematic-previs/references/frame-qa.md` and from how the work was done:

1. **One look still.** Render the hero in the main set as a medium shot. The look is approved here, before more is built.
2. **Type-check.** The scene must compile.
3. **Measured pass.** Run `frame-check` for the in, middle and out of every shot. Fix every fail in the shot code.
4. **Stills.** Render the in, middle and out of every shot. Build one sheet with one still per shot in story order, and one sheet with every still.
5. **Eye pass.** Look at each frame and answer the eight questions in section 4. Fix and take the frame again.
6. **Motion check** (`tools/motion.sh`) for any scene with moving people.
7. **Look before rendering.** View the one-per-shot sheet (section 5).
8. **Draft video** at half resolution for timing and cuts.
9. **Final video**, then check with ffprobe and sample frames at every cut.

For the 54-template library the order was: type-check, test stills, measured pass, review by eye, then render the videos.

A still per shot is the cheapest check there is. The two faults it caught most often: heads cut by the frame edge, and an over-the-shoulder foreground that is too large. Full renders spent on framing and look faults that one still per shot would have shown are the cost it avoids.

## 2. Stills first: what it costs

| Setting | Time | Source |
|---|---|---|
| One still of a first film | about 3 s | measured on the author's runs, not included |
| 54 templates, 303 stills at `--subframes 4 --scale 0.5 --concurrency 3` | about 8 stills a minute, about 35 minutes | measured on the author's runs, not included |
| 68 stills of the 24-environment round | about 20 to 25 minutes | measured on the author's runs, not included |
| Path-traced hero still at 128 samples | about 45 s | measured on the author's runs, not included |
| One 7 to 8 s video of a pin blockout | 7 to 14 s of render time | measured on the author's runs, not included |

Take stills freely. They are where the time is saved. Do not send a contact sheet of tiny tiles to a video model; send single clean frames, and never send frames with tracking marks (see `docs/camera-language.md`).

## 3. The measured pass

`PIECE=<id> tools/check.sh` projects each subject through the shot's camera at the start plus 0.02 s, the middle and the end minus 0.02 s of every shot, ray-casts for blockers, and reads the camera every frame at 24 fps. It prints a table with one row per shot and one column per check (`·` pass, `✗` fail, `f` flagged exception, blank not applicable) and then the list of fails. It also writes `framecheck.json` next to the render output. The time-list mode `PIECE=<id> tools/check.sh 3 5 15` prints where each subject lands at those times and what blocks it. `HUD=1` adds the camera report lines. `tools/check.sh --framer` is the framer's own test.

| Check | Passes when | Source of the number |
|---|---|---|
| SAFE | the point of interest is inside 90 percent of the frame | broadcast action-safe |
| BLOCK | no mesh between the lens and the subject's eyes closer than the subject by 0.3 m. Flag `wipe` turns it off. | frame-check raycast |
| HEAD | on MS, MCU and CU the eyes sit within 5 percent of frame height of the upper third | rulebook section 1 |
| JOINT | no joint (neck, elbow, wrist, waist, knee, ankle) within 4 percent of the top or bottom edge, unless hidden behind the set | rulebook section 1 |
| SIZE | the size read from where the bottom edge cuts the body is the planned size or one step from it. A push or pull is checked at its start size going in, its end size coming out. | the framer's ladder |
| LEAD | the subject sits on the third opposite its facing (MCU, CU, MS, MWS). Flags `short-side`, `centre` turn it off. | rulebook section 1 |
| OTS | the foreground figure covers 20 to 33 percent of the frame width, measured from its real vertices | rulebook section 1 |
| REV | a reverse shot matches lens, distance and head size within 10 percent | rulebook section 2 |
| DIST | camera at least 1.5 m from a face held in ECU, CU or MCU | Ward et al. 2018 |
| AXIS | consecutive cameras in a scene stay on one side of the line between the engaged pair (sign of the cross product). Flag `cross-line` turns it off. | rulebook section 4 |
| 30° | consecutive shots of the same subject differ by at least 30 degrees or by two size steps. Flag `jump`. | rulebook section 4 |
| PAN | pan or tilt stays at or under frame width (or height) divided by 7 per second, unless the pan follows a subject who holds still on screen, or the shot is flagged `whip` | RED, using the 36 mm full-frame field of view |
| 1AXIS | the second move axis is at most 30 percent of the first. Flag `compound` turns it off. | rulebook section 3 |
| HOLD | at most 0.04 units of motion in the first and last 0.5 s. Flags `enters-moving`, `exits-moving` turn it off. | rulebook section 3 |
| LEN | at least 12 frames for ECU, CU, MCU or an insert; 18 for MS and MWS; 36 for the rest, at 24 fps | rulebook section 4 |

Measured results (on the author's runs, not included):

- The first framing pass on the 33 first templates passed 25 of 33 before the rig was added and 13 of 33 after. It ended with 4 templates carrying notes: CAM01, CAM09, CAM16 and SC03 (locked-off, Steadicam follow, FPV, street scene).
- The Handoff went from 19 fails to 8. The 8 left are deliberate: the macro on the handle, the whip pan mid-move, a hand at the over-the-shoulder edge, the low angle in shot 8 and the first landing frame.
- Real faults it found on the first films: a camera through scenery, a camera inside a head, a character out of frame, and two shots crossing the line between two characters.

Notes for the person using it:

- A shot's plan declares what it is meant to be (size, subject, over-the-shoulder figure, pair, reverse). Plans written afterwards from labels can be wrong, and then a SIZE fail is a plan error.
- The flags are deliberate exceptions. Each turns off one check. Use them for a reason you can say.
- The check does not enforce the 2 second rule. Its length floor is 0.5 to 1.5 s. See `docs/camera-language.md`, section 7.
- A subject not yet in the scene is not framed (the sample is skipped), so a late entrance is not checked until it arrives.
- The SIZE row differs from the table in the skill (`skills/cinematic-previs/references/frame-qa.md`: EWS under 10 percent of height, WS 40 to 70, FS 75 to 90). The code reads the size from the body landmarks and lets one step either way pass. Follow the code.

## 4. The eye pass

Lay out a contact sheet with one still per shot in story order, then a second with the in, middle and out of every shot. Answer these eight questions for each frame:

1. Where does the eye land first? If it is not the subject of the beat, the frame fails.
2. Can the action be read with the sound off? An action shot from behind, an insert that is only shapes, or a mostly empty frame fails.
3. Is the set grey or off-white with no saturated colour? Each stand-in has one stripe colour. Emissive light is white.
4. Is anything brighter or bigger than the subject? Bloom, flare, rocks and clouds stay below it.
5. Is the background simple behind the head? One clean shape behind a face, not a blob field.
6. Does the sequence go wide, then close, then wide? Read the one-per-shot sheet left to right.
7. Does the HUD or slate cover the picture? All burned-in data goes in the bars.
8. Does each frame have one moving layer (dust, wind, smoke, light)? Check this on the middle frame of held shots.

The faults the eye pass found on the first films, each a rule for the next: heads cut by the frame edge (frame the head with the eyes on the upper third, never the prop); an over-the-shoulder foreground that swallows the frame; subjects lost at the edge; wide shots with no point of interest; unreadable inserts (an insert fills the frame with the one object to read); actions shot from behind (shoot an action from the side that shows it); effects that bury the subject; clutter behind the subject; a camera report over the picture.

Extra eye checks that came from the later rounds:

- A shot that starts inside geometry reads as a flat grey frame (a follow camera that began inside a ship hull).
- If no moment of a shot shows the subject clearly, move the shot, not the frame pick.
- Every key prop must read as what it is. A plain sphere for a fist and an orange block for a lock confused the viewer and the model.
- The story object must be in frame (the lock). Aim between the actor and the goal, not only at the actor.
- Tags and labels on contact sheets: a tag may be hidden by the set but never by a prop.

### Contact sheets

- `tools/draw-sheet.py`: one frame per cell, with a name tag on every visible character (projected through the real camera), a badge with the frame number, shot and time, a red CUT or FADE IN badge on the first frame of each shot, yellow corner arrows (in for a push in, out for a pull out, a square for a hold), and a caption with the cut, the camera, the move now and what is on screen.
- `tools/template-sheets.py`: the 24-environment sheets, one per environment, with the reference picture on the left and every move shot there on the right. One sheet per environment, not six templates per sheet.
- Every template has three named things on its sheet: LOCATION (which of the 24), FRAMING and MOOD (the environment's own line).
- `tools/build-gallery.py` builds the gallery card for each template with the labelled sheet, the measured pass and the motion check.

## 5. Look before you render

View the one-per-shot sheet before any full render. Where credits are involved the pipeline adds stops, and they follow one rule: story first, then the three.js. For a 30 s film the flow is the story, an independent critic, the shot list, the line choice, then the three.js build, then the prompt, then credits.

- Nothing is queued without an explicit request, and the exact list is shown first. Credits cannot be cancelled once a job is queued.
- If a request is ambiguous about which version is meant, ask which version.

## 6. Reading a camera in numbers

`tools/camera-path.sh <piece> --step 0.5` prints, for every half second, which side of the subject the camera is on and the azimuth, the distance, the height off the ground, the eye difference, the tilt, the lens, and the subject's frame position and height as a share of the frame. Example form: "0 s: front-left, 3 m away, eye level." The numbers come from the shot's own camera and the posed body. It was used to write the start side of each move into prompts. A measured camera timeline written into the prompt did not improve a video-input result (measured on the author's runs, not included), so the tool is for checking, not for pasting.

## 7. When a check cannot run

A check that cannot run counts as a failure, and the reason is written down. The engine's own scripts are weaker, so know what they do:

- `frame-check` marks a check `n/a` when it cannot evaluate it (a subject not in the scene yet) and prints its fails without changing the exit code.
- `motion-check` checks every template id (`/^[A-Z]{2,6}\d/`) but also exits 0 when it prints notes.
- Set `STRICT=1` and both exit non-zero on any fail (`frame-check.ts`, `motion-check.ts`). Use it in CI.
- Render to a fresh output folder each time, so an old video cannot be mistaken for a new one.

## 8. Render order and the machine

- Render stills, then videos. Videos run three at a time at most (`tools/render-locked.sh`, `RENDER_SLOTS=3`); each render opens several browser tabs.
- Fresh output folders per run. Older renders must not mix with new ones.
- Free disk. A render batch writes thousands of frames, and a full disk makes shell commands fail and stalls a render with no frames written. Keep at least 3 GB free; the scripts do not check.
- Extract frames in chunks. Put scratch on a disk with room.
- Delete only files you created.
- Show the new render, never a cached one. The gallery tags links to bust the cache and serves over localhost, because a browser pane cannot load local files.

## 9. What the engine QA does not do

- It does not check that a video model followed the reference. That is the result-side QA (`docs/qa-prompt-and-video.md`).
- It does not measure the camera for smoothness (jerk limits, micro-jitter). That is not built.
- It does not check the prompt against the previs. Five early prompts contradicted their previs (orbit side, car direction, walk direction, crane direction, push-in obstruction), and only a frame-by-frame read found them. The prompt gates are `tools/seedance/qa3.py` and `qa4.py` (repo level), covered with the prompts.
