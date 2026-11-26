# Answers: engine (D), camera (E) and engine-side QA (I)

This file answers 32 questions; 0 are UNPROVEN, 15 partly, and the other 17 are proven.

Questions 34 to 62 (the engine and the camera) and, from section I: 101, 109 and 110. One entry per question: the answer, the evidence and a status. Statuses:

- **PROVEN**: shown by a file in the repo or a number that can be re-measured.
- **PARTLY**: the core is shown, and the part that is not shown is named with the test that would settle it.
- **UNPROVEN**: not supported by the files. The test is named.

Paths are repo paths under `engine/cinematic` unless stated. "Measured on the author's runs, not included" marks a number that no file in the repo shows. The docs that go with this file are `docs/engine.md`, `docs/build-your-own-template.md`, `docs/camera-language.md`, `docs/physics-and-motion.md` and `docs/qa-engine-side.md`. The full template table is `answers/E-template-catalog.md`.

## D. The engine

**Q34. How is a template written?**
A template is one `Piece` built by `scenePiece(spec, shots)`. `SceneSpec` holds `id`, `title`, `sky`, `keyDir`, `look`, `build(w)`, `actors`, `motes`, `tick`, `clock`. Each `ShotDef` holds `start`, `end`, `label`, `rig`, `cam(t)`, `subject`, `size`, `sizeEnd`, `focus`, `stop`, `ots`, `pair`, `reverse`, `flags`, `cut`, `shadow`. Each template also has a card (`TemplateInfo`: id, name, says, use, numbers, avoid).
Evidence: `src/kit/stage.ts` (types `SceneSpec`, `ShotDef`, `scenePiece`), `src/templates/cameras.ts` (`make`, `TemplateInfo`, CAM06 as the worked example), `docs/engine.md` section 15; `docs/build-your-own-template.md` has two tested examples.
Status: PROVEN.

**Q35. What is the render stack?**
Remotion 4.0.522 and `@remotion/three` render a three.js 0.170.0 scene frame by frame in headless Chromium started with `gl: "angle"`. 24 fps by default, a 180 degree shutter (sub-frames spread over `0.5 / fps`), a 2.39:1 picture of 1920 x 804 inside 1920 x 1080 bars.
Evidence: `package.json` versions; `render.mjs` (`chromiumOptions = { gl: "angle" }`); `src/piece.ts` (`DEFAULT_FPS = 24`); `src/Film.tsx` (`PIC_H`, `open = 0.5 / piece.fps`); `src/util.ts` (`ASPECT = 2.39`).
Status: PROVEN.

**Q36. Which flags change the look?**
`--boxes` (stand-ins), `--storyboard` (ink on paper; with `--boxes` the pin stays a lit 3D object), `--pencil` (figures in pencil over the normal render), `--ghost` (soft limbless blurs), `--plate` (no people), `--no-scenery` (hides `dress()` objects), `--marks` (1 m checker), `--clean` (no slate, report, titles), `--subframes n` (shutter average, raised to as many as 48 from screen motion), `--pathtrace n` (stills), `--no-blur`, `--scale k`, `--loosen k`, `--stills`, `--stills-plan`, `--videos`, `--concurrency`. `--fisheye` does not exist: fisheye is `fish` on a shot's camera.
Evidence: header and body of `render.mjs`, props in `Film.tsx`, `Cam.fish` in `src/shots.ts`; `--loosen` is read in `render.mjs` and `framer.ts` but missing from the header. The effect of `--marks` and `--ghost` on a model's result (marks made a chessboard leak; ghost kept the pose) is in `docs/failure-ladder.md`.
Status: PROVEN.

**Q37. What is the post chain?**
Scene (4x MSAA, HDR) with an optional running mean of sub-frames, then ambient occlusion (20 samples, 0.6 m radius, 0.9 in templates), thin-lens depth of field (48 Vogel-disk samples, at most 26 px, from focal length, T-stop and focus distance), bloom (bright pass and two separable blurs at quarter size), then the composite: camera motion blur (up to 16 taps, only when sub-frames are 1), fisheye remap, bloom, exposure, ACES tone map, a light warm shift, a vignette of 0.28, sRGB and grain of 0.022.
Evidence: `src/post.ts`; `src/kit/stage.ts` (`ao: 0.9`, bloom 0.06 default).
Status: PROVEN.

**Q38. How is physics baked so every render is identical?**
`tools/bake.sh` runs `tools/bake-physics.ts`, which steps Rapier 0.14.0 at 240 Hz with continuous collision and stores each body's position and rotation at 120 Hz in `src/kit/bakes.json`. The render only reads the table (`BakedSet.update`, linear plus slerp). Three scenes are baked: SC07-crates (7 bodies, 1921 frames), SC09-kegs (8, 2641), SC10-barrier (25, 1921).
Evidence: `tools/bake-physics.ts` (`HZ = 120`, `SUB = 2`), `src/kit/physics.ts`, `bakes.json`.
Status: PARTLY. UNPROVEN: that a re-bake on another machine gives the same table. A render reads the stored table, so a render is identical wherever the table is the same.
Test: run `tools/bake.sh` on two machines and diff `bakes.json`.

**Q39. How do rigs work?**
Each rig is a pure function of time that returns a `Cam`. The set: `locked`, `panWith`, `tiltReveal`, `zoom`, `dolly`, `dollyZoom`, `orbit`, `crane`, `follow`, `track`, `ots`, `truck`, `whip`, `chase`, `fpv`, `chain` (blends moves in one take, 0.8 s by default), `spline` (centripetal Catmull-Rom, eased once), `snorricam`, `shake`, `filmPath` (33 presets, 168 frames each at 24 fps, replayed relative to the actor and re-aimed on the eyes), `dive`. Every rig holds at both ends, eases in the middle, aims at the eyes. The label in `rig:` picks the float (crane, dolly, Steadicam, skiff, drone, FPV, handheld, locked). The licence of the film dataset behind `filmpaths.json` is stated in `NOTICE.md`.
Evidence: `src/kit/rigs.ts`, `src/camera.ts` (`FEEL`, `rigKind`), `src/kit/filmpaths.json` (33 presets, fps 24).
Status: PROVEN.

**Q40. How is the camera placed from subject, lens and shot size, and measured?**
The framer sets distance = (frame height the size needs) x focal length / sensor height, with the sensor height 36 / 2.39 = 15.06 mm and the frame height from the figure's own landmarks (chin, chest, waist, thigh, ankle). Close sizes put the eyes on the upper third. `measure()` writes the HUD from the rendering camera itself (lens, field of view, stop, focus, depth-of-field limits, size, angle, side, tilt, dutch, move split into dolly, truck, boom, pan, tilt, zoom).
Evidence: `src/framer.ts` (`BAND`, `SHARE`, `frameHeight`, `frameFor`), `src/marks.ts` (`sizeIn`), `src/camera.ts` (`measure`); self-test `tools/check.sh --framer`.
Status: PROVEN. The claim that the self-test gives every size on six figures was not re-run for this file; the test is `tools/check.sh --framer`.

**Q41. How do actors walk without sliding?**
The stride is measured from planted feet in the clip (walk 1.3 m per 1.333 s cycle = 0.975 m/s, jog 4.8 m per 0.933 s = 5.1 m/s, sprint 4.1 m per 0.667 s = 6.15 m/s). The step clock is integrated over the distance walked. A slow walk takes shorter steps (cadence floor 80 percent, 72 for the jog). Walk, jog and sprint share one clock. A measured skid correction plus a two-bone foot solve holds planted feet still. The two rig files hold 43 + 43 = 86 clips on a 65-joint skeleton, counted from the GLB files.
Evidence: `src/kit/rig.ts` (`STRIDE`, `CLIP_LEN`, `table`, `pinFoot`), `src/kit/actors.ts` (gait weights, `rate`, `cyc.run`), `docs/physics-and-motion.md`, `public/kit/UAL1_Standard.glb` and `UAL2_Standard.glb`. The slide numbers (30 to 50 percent of body speed down to 6; median 1 to 2 percent after the skid fix) are measured on the author's runs, not included.
Status: PARTLY. UNPROVEN: the slide numbers on your machine.
Test: run `tools/motion.sh` on a template with a walker.

**Q42. What does the motion check test, and what were its own bugs?**
TOUCH (a joint inside a solid set piece or another body's trunk), SINK (skin more than 1.5 cm under the real floor), SLIDE (planted sole vertices faster than 15 percent of body speed as a median; frames over 100 percent listed as skates; 3 or more vertices on the floor; above 0.3 m/s), HEAD (head turn over 25 degrees between two renders 1/192 s apart). Sampled every 0.1 s. Its own bugs: floor measured against path height (a leap read as 58 percent slide), 1 cm paving strips counted as floors, one lifting toe counted as planted, slowed scenes read in film time, figures high above ground reported as sinking. Its id filter is `/^[A-Z]{2,6}\d/`, so every template id is checked; `STRICT=1` makes a note exit non-zero.
Evidence: `tools/motion-check.ts` (header, id filter line 15, `STRICT` line 88); `docs/physics-and-motion.md`, section 7.
Status: PROVEN.

**Q43. What does the frame check test, and where do the numbers come from?**
15 checks at the in, middle and out of every shot: SAFE (inside 90 percent), BLOCK (raycast), HEAD (eyes within 5 percent of the upper third), JOINT (edge within 4 percent of a joint), SIZE (planned size, one step allowed), LEAD, OTS (20 to 33 percent, from real vertices), REV (within 10 percent), DIST (1.5 m, only ECU, CU, MCU), AXIS, 30°, PAN (frame width / 7 per second, from the 36 mm field of view), 1AXIS (second axis at most 30 percent), HOLD (0.5 s with at most 0.04 units of motion), LEN (12, 18, 36 frames). The numbers come from the cinematography rulebook (`skills/cinematic-previs/references/rulebook.md`, `frame-qa.md`) and each check is coded in `tools/frame-check.ts`. The rulebook tables are Super 35 and the code is full frame, so the same lens looks about 1.4x wider in the engine (`docs/camera-language.md`, section 2).
Evidence: `tools/frame-check.ts`; `docs/qa-engine-side.md`, section 3.
Status: PROVEN.

**Q44. Why 24 fps, no sound, 24 to 60 fps, trimmed under 29 s?**
24 fps is the engine default (`DEFAULT_FPS`) and the video model's native rate; a 30 fps container showing 24 fps footage repeats 1 frame in 4. The clean clip is made with `ffmpeg ... -an`: the engine's Remotion videos carry an audio stream, so the strip is a real step. Tein documents a frame rate from 24 to 60. Keep references under 29 s: the earlier hosted API used in the original tests refused exactly 30.00 s (and in one run 29.50 s); 29 s, 29.3 s and 28.92 s were accepted.
Evidence: `src/piece.ts`; `tools/render-pill.sh`; `docs/seedance-notes.md`, section 3 (the 30.00 s table); shipped `pill.mp4` files probe as 1280 x 534, 24/1, one video stream.
Status: PARTLY. UNPROVEN: the exact limit between 29.3 s and 30.00 s, and whether Tein measures the same way.
Test: send trimmed clips of 29.0, 29.3 and 29.5 s as 4 s drafts, with approval of the credits.

**Q45. How long does a render take, how much disk does it need?**
A clean checkout rendered CAM06-Orbit (7 s) in 11 s. 26 pin videos took 7 to 14 s of render time each. A first library video took about a minute, and a full re-render of the 54 first templates was estimated at about 1.5 hours and about 300 MB. Stills ran about 8 a minute (303 in about 35 minutes), 68 stills of the 24-environment round took 20 to 25 minutes, a path-traced hero about 45 s. A render batch writes thousands of frames; a full disk made shell commands fail and stalled a render. Keep at least 3 GB free; the scripts do not check.
Evidence: `docs/engine.md`, section 5; `docs/qa-engine-side.md`, sections 2 and 8. The per-video and library times are measured on the author's runs, not included.
Status: PARTLY. UNPROVEN: the disk a single template needs.
Test: run one template and `du -sh` its output and the Remotion temp folder.

**Q46. What is the stills-first rule?**
Take one look still of the hero and approve the look, run the measured pass, take the in, middle and out stills of every shot, run the eye pass, view the one-per-shot sheet, and only then render a draft and a final.
Evidence: `skills/cinematic-previs/references/frame-qa.md` (render order) and `skills/cinematic-previs/SKILL.md`; `docs/qa-engine-side.md`, sections 1 and 5.
Status: PROVEN.

**Q47. How do you make your own template from nothing, step by step, and check it?**
Write the move in words, pick stand-ins, build a coarse grey set, place actors, write the shots, register the file, type-check, run the measured pass, take stills, run the motion check, pass the eye pass, look at the sheet, render the video, render the clean reference, check it with ffprobe.
Evidence: `docs/build-your-own-template.md`. The first lab-set example (a slow push) was registered, checked and rendered as written; the second (an orbit) was checked as written, with 0 fails in the measured pass. The own-set example type-checks.
Status: PARTLY. UNPROVEN: that the own-set example renders.
Test: render a still and a video of `OWN01-DoorPush` from `docs/build-your-own-template.md`.

**Q48. How do you add an environment, a stand-in, a prop or a rig?**
Environment: add a `Location` and an `ENVS` row in `locations.ts`, a reference picture and a `moods.json` entry, update `environments.generated.ts`, add `PLACE` entries. Stand-in colour: `TINT` in `kit/clay.ts` and `CAPSULE` in `standins.ts`. Prop: a function in `PROPS` in `kit/actors.ts` with its origin at the base, `PROP_EYE` if it has a head, `shadeAll`, `dress()` for loose detail, `label` colour if it acts. Rig: a pure function in `kit/rigs.ts` that uses `prog` for holds and `aimFor` for the aim, plus a `rigKind` keyword if it needs its own float.
Evidence: `docs/build-your-own-template.md` ("Adding to the library"), read from the code.
Status: PARTLY. UNPROVEN: how `environments.generated.ts` is regenerated, because no script for it is in the repo (its header says it was generated from `moods.json`).
Test: write the generator and diff its output with the file.

**Q49. What is needed to run it on another machine?**
Node 22.12 or newer, ffmpeg, network access once (Remotion downloads a headless Chrome), and `npm install` in `engine/cinematic`; Python 3 with Pillow and numpy for the sheet and QA scripts. The rig files ship in `public/kit/`, output goes to `./.work`, and `engine/cinematic` has its own `package.json`. Keep at least 3 GB free.
Evidence: `docs/engine.md`, section 14 (verified from an empty folder: `npm install` added 202 packages in 9 s and `tools/render-pill.sh CAM06-Orbit` wrote a 7 s, 24 fps, 1280x534 clip); `package.json`; `tools/kf-root.mjs`.
Status: PROVEN. The shell scripts were tested on macOS only.

## E. Camera

**Q50. What is each template, what does it say, what is it for, what are its numbers, what to avoid?**
The code has 137 template ids: CAM 48, ANG 36, OBJ 16, SC 10, ACT 8, FAM 6, PRD 6, ONE 4, STORY 2, SHOW 1. 136 have a card with `says`, `use`, `numbers` and `avoid`; SHOW01 (The Handoff) has none. PRD01 has the text "Placeholder." in all four fields (the frozen splash was never designed). `answers/E-template-catalog.md` is the full table, extracted from source.
Evidence: `src/templates/*.ts`; `answers/E-template-catalog.md`.
Status: PROVEN.

**Q51. How is a move written for Seedance (start side, direction, arrival, one named move)?**
One named move per shot, with its start side, direction, arrival, height and feel, the lens in millimetres, and the move first in the shot. Compound shots are split.
Evidence: `docs/camera-language.md`, section 3. With a video reference the blockout carries the camera and the wording is a backstop (9 of 9 cuts held by the video, measured on the author's runs, not included).
Status: PARTLY. UNPROVEN: that the same wording carries to every move; it was tested on the orbit family in sheet runs.
Test: write CAM25 and CAM42 in this form and compare how the camera lands against the blockout.

**Q52. Why was "orbits a half circle" a locked camera in the sheet runs?**
The prompt said only "orbits a steady half circle". The sheet runs came back with a near-static camera. After the rewrite (start side, direction, arrival, about 3 s at the same height, subject centred, one continuous move, "panels 4 to 9 are one continuous camera move") all three sheet versions orbited.
Evidence: `docs/camera-language.md`, section 3; the runs are measured on the author's runs, not included.
Status: PARTLY. UNPROVEN: that the wording alone caused it. It is one template, three sheet runs. The rotation exists only in a video, not in a sheet, which may be the cause.
Test: send the same sheet for a second move (CAM25 or CAM42) with the old and the new wording.

**Q53. What are the rules on speed, pan rate, distance to faces, the 30° rule, match cuts?**
Pan or tilt at most one frame width per 7 s at 24 fps and a 180 degree shutter (RED). Faces: camera at least 1.5 m from the eyes in a close-up (Ward 2018). Same-subject cuts differ by at least 30 degrees or two sizes. All cameras stay on one side of the action line. A match cut on action loses about 4 frames (182 ms; Hecht and Kalkofen 2009). Speeds (all heuristic): creep 0.05 to 0.15 m/s, emotional push 0.15 to 0.4 m/s, walking follow 1 to 1.5 m/s, crane 0.3 to 1 m/s. In this engine a lens is full frame (36 mm wide); the rulebook tables use Super 35, so the same lens looks about 1.4x wider in the engine and the pan limit at 35 mm is 7.8 degrees per second, not 5.6.
Evidence: `skills/cinematic-previs/references/rulebook.md`; coded in `tools/frame-check.ts` (`PAN`, `DIST`, `30°`, `AXIS`); `docs/camera-language.md`, sections 2 and 4 to 6.
Status: PROVEN.

**Q54. Why must every shot hold at least 2 seconds, and what breaks under 2?**
Give every shot and every camera effect at least 2 seconds. A 30 s film went from 13 shots and 10 lines to 10 shots and 6 to 7 lines. No engine check enforces it: `LEN` has floors of 12, 18 and 36 frames (0.5, 0.75, 1.5 s). Nine shots under 2.0 s exist in older templates: ACT07 (2 shots), SC06, SC07, SC09 (2), SC10 (2) and STORY03.
Evidence: `tools/frame-check.ts` `LEN`; `docs/camera-language.md`, section 7 (the table of the nine shots, read from the template sources).
Status: PARTLY. UNPROVEN: "what breaks under 2 s". The one-frame crash zoom that looked like a cut is a different fault.
Test: render the same shot at 1.5 s and 2.0 s as drafts and compare how the model reads each.

**Q55. What is the crash-zoom rule?**
A crash zoom locks on the eyes for about 2 s. The shipped numbers (SHOW01 shot 5): the wide holds 0.4 s, zoom 32 to 180 mm over 0.25 s (6 frames) from 12.4 to 12.65 s, then holds on the eyes to the cut at 14.0 s. SHOW01 meets 2.0 s for the shot and locks for 1.35 s. The earlier library templates are shorter: OBJ10 24 to 150 mm in 0.3 to 0.4 s, ACT03 35 to 85 mm in 0.2 s with a 1 s hold.
Evidence: `engine/cinematic/src/templates/showcase.ts` (shot 5); `docs/camera-language.md`, section 8.
Status: PROVEN.

**Q56. How is a reaction written?**
Hear, the face changes, turn and look, back. In the Handoff: Mara hears the whine, fear hits, she turns and looks straight up at the drone, holds, then snaps back to Alex for her line. The reaction comes after the change is finished, and a person looks at his hands after they start changing. Acting words are small, because literal words are played literally.
Evidence: `docs/camera-language.md`, section 9; `templates/SHOW01-TheHandoff/prompts/`.
Status: PARTLY. UNPROVEN: that this order is what makes the reaction land on screen; no measure exists and acting cannot be judged by a script.
Test: two drafts of one shot, one with the written order and one without, judged by a person.

**Q57. What are never-static shots, and which ANG templates are skipped?**
Move the camera in every clip you send. Locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03 and the ANG family) are kept as camera studies and are not recommended. Gate: `tools/seedance/qa4.py` rule Q0 compares three frames of the blockout clip and refuses the job below a mean difference of 8.0 (locked ANG clips scored 2 to 4, moving cameras 16 or more). By the code, 34 of the 36 ANG templates have a fixed camera. ANG23 and ANG32 use `rig.follow`; run on the shipped `pill.mp4`, `engine/cinematic/tools/clip-motion.py` gives ANG23 a largest difference of 11.34 (moves) and ANG32 5.14 (no camera motion).
Evidence: `tools/seedance/qa4.py`, `qa_gate_common.py` (`camera_moves`); `src/templates/angles.ts`; `docs/why/why-no-static-shots.md`.
Status: PROVEN.

**Q58. How do cuts get designed so they land?**
Make every cut a clear change of angle and size in the previs, cut on an action, keep the line, and write the action across the cut. In the first Handoff, 7 of 11 cuts landed on the reference frames without the prompt listing them. The ones that slipped were weak in the previs (a handle match, a whip blur, a short zoom). The fixed version landed 9 of 9. The cut notes in the code: "CUT ON THE TAKE-OFF FRAME" (shot 8, take-off at 21.0 s), "CUT ON ACTION: he is already running", a match cut on the handle.
Evidence: `engine/cinematic/src/templates/showcase.ts`; `docs/camera-language.md`, section 6.
Status: PARTLY. UNPROVEN: that cut design alone holds cuts on other films; the evidence is one film (the Handoff, 9 of 9 after the fixes).
Test: build a second multi-shot film and count cuts that land on the reference frames.

**Q59. How do focus pulls and aperture overrides work in a template?**
`stop` on a shot sets the T-stop (default 2.8). `focus` takes an actor id or `[from, to, k]` and moves the focus point from one actor's eyes to the other's as `k` goes 0 to 1. STORY02 sets T8, 2, 2, 2.8, 4, 2, 2 over its seven shots. Racks in the library last 0.55 to 1.2 s. The HUD shows near and far sharpness and the background blur.
Evidence: `src/kit/stage.ts` (`ShotDef.focus`, `stop`), `src/templates/story.ts` (`STOPS`), `objects.ts` (OBJ07), `cameras2.ts` (CAM46), `oners.ts` (ONE04), `showcase.ts`; `src/camera.ts` (`dof`).
Status: PARTLY. UNPROVEN: that a video model follows the blockout's depth of field or rack.
Test: send one rack template with and without the rack in the blockout and compare the output at the rack time.

**Q60. What do the angles (ANG) cover, and how do they differ from moves (CAM)?**
CAM templates are moves. ANG templates are single looks: the shot sizes (extreme wide to extreme close-up), heights (eye, hip, knee, ground, shoulder, over the head), angles (profile, three-quarter, from behind, bird's-eye, worm's-eye, high, low, Dutch, upside-down) and lens looks (14 mm super wide, fisheye at 8 and 5 mm, peephole, security camera, long lens, telephoto), plus symmetrical, framed and leading-line compositions. There are 36 ids between ANG01 and ANG40 (ANG09, ANG19, ANG28 and ANG29 do not exist).
Evidence: `src/templates/angles.ts` header and ids; `answers/E-template-catalog.md`.
Status: PROVEN.

**Q61. When is camera-only (no subject) the right choice?**
When nobody needs to be in a particular spot. It gave the best movement and realism of all the video tries, and the subjects landed in the wrong places.
Evidence: `docs/camera-language.md`, section 14; three camera-only clips (`release-media/CAM06-Orbit/plate-made.mp4`, `release-media/ACT01-BulletTimeOrbit/plate-made.mp4`, `release-media/SC07-AlleyFight/plate-made.mp4`); the flag `--plate`.
Status: PARTLY. UNPROVEN: a rule for choosing it beyond three clips.
Test: run camera-only against pin on a drone move and a landscape reveal and compare.

**Q62. When is a locked-off camera right?**
Not without a reason (rulebook: with no reason, lock off; a move needs a motive). CAM01's own text: entrances and exits, comedy timing, a tableau, any beat where the action should carry the frame. Do not send a whole clip with a locked camera. The Handoff keeps one locked shot (a close-up of Mara with a rack to the drone) inside a moving film.
Evidence: `skills/cinematic-previs/references/rulebook.md` (movement section), `src/templates/cameras.ts` CAM01, `src/templates/showcase.ts` shot 6.
Status: PARTLY. UNPROVEN: that a locked shot inside a longer film helps the result.
Test: send the Handoff with shot 6 moving and with shot 6 locked, and compare.

## I. QA

**Q101. What are the mechanical gates?**
On the three.js side: the measured pass (`tools/frame-check.ts`, 15 checks), the motion check (`tools/motion-check.ts`, 4 checks), the framer self-test (`check.sh --framer`), the camera path readout (`tools/camera-path.ts`), and the no-static-camera gate Q0. On the Seedance side the prompt gates are `tools/seedance/qa3.py` and `qa4.py` (qa3 bans camera words outside one paragraph, qa4 requires a camera script with the template's numbers; qa4 tests Q0 camera motion, Q1 dialogue, Q2 motive and cues, Q3 length, Q4 statue words, Q5 camera numbers and protective lines, Q6 voice, Q7 camera words in the performance, Q8 body the frame shows, Q9 images, Q10 risk and filler, Q11 twins) and the result checks are `qa_video.py`, `qa_framing.py`, `qa_cuts.py`, `qa_mouth.py` and `qa_speech.py` (`docs/qa-prompt-and-video.md`). Set `STRICT=1` and the frame and motion checks exit non-zero on a fail.
Evidence: the file headers; `tools/frame-check.ts` line 348, `tools/motion-check.ts` line 88.
Status: PROVEN.

**Q109. What is the order: still, then video; measured pass; eye pass; look; render; check?**
One look still and approval of the look; type-check; measured pass; stills (in, middle, out) and two contact sheets; eye pass; the one-per-shot sheet; half-resolution draft; full film; ffprobe and sample frames at every cut. For a model reference: the clean pin clip, ffprobe, three-frame motion test, then the prompt gate, then the cost shown and a yes, then the draft, the video checks, frames of the real file, and a final only for an approved draft.
Evidence: `skills/cinematic-previs/references/frame-qa.md` ("Render order"), `skills/cinematic-previs/SKILL.md`; `docs/qa-engine-side.md`, sections 1 and 8; `docs/qa-prompt-and-video.md`.
Status: PROVEN.

**Q110. What counts as a failure when a check cannot run?**
A failure, with the reason written down. The engine's tools are weaker: `frame-check` marks an unevaluable check `n/a`, and both check tools exit 0 on fails unless `STRICT=1` is set. `qa_framing.py` prints FRAMING OK when no second is scored.
Evidence: `tools/frame-check.ts` (line 348), `tools/motion-check.ts` (line 88), `tools/seedance/qa_framing.py` (last lines); `docs/qa-engine-side.md`, section 7.
Status: PARTLY. Shown: `STRICT=1` exits non-zero on a fail. UNPROVEN: that an `n/a` check or a clip with no face fails under it.
Test: run `qa_framing.py` on a clip with no face and read the exit code; run `STRICT=1 tools/check.sh` on a template with an unevaluable check.
