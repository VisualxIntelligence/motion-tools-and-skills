# Camera language

This page says how a camera move is written, which numbers keep it believable, how cuts are designed so they land, and what each family of templates is for. Each rule carries its source. Three labels are used:

- **sourced**: a published figure, from `skills/cinematic-previs/references/rulebook.md`, with its citation there.
- **measured**: a number read from this repo's code or from a render.
- **author's rule**: a rule of this pipeline set after test runs. It is not a rule of film in general.

A number with none of those labels is a working default from the rulebook, labelled there as a heuristic.

## 1. Why the camera is written down

A video model copies two things from a reference video: where the camera goes and how the bodies move. It copied both closely. On the 30 s Handoff film (`templates/SHOW01-TheHandoff/`), a video reference landed 9 of 9 cuts on the same frame as the reference. A sheet of 30 still frames landed 1 of 9 on the first run and 3 of 9 on the third, and its cuts drifted 0.2 to 0.7 s, because a still frame carries no clock (measured on the author's runs, not included). That is why the move is built as numbers in three.js and sent as video, and why every number below is worth getting right.

## 2. Lens and sensor

In this engine a lens is full frame: a 36 mm wide sensor cut to 2.39:1. The rulebook tables use Super 35 (24.89 mm wide), so the same lens looks about 1.4x wider in the engine:

| Focal length | Horizontal view in the engine (36 mm) | Horizontal view in the rulebook (Super 35) |
|---|---|---|
| 24 mm | 74 degrees | 54.8 degrees |
| 35 mm | 54.4 degrees | 39.1 degrees |
| 50 mm | 39.6 degrees | 28.0 degrees |
| 85 mm | 23.9 degrees | 16.7 degrees |

(The engine column is `2 atan(18 / mm)`; the rulebook column is its own table.) Two things follow. First, the lens numbers written in templates, HUDs and prompts are full-frame lenses on a 2.39:1 extraction. Second, the rulebook's pan-speed row (35 mm: 5.6 degrees per second) does not apply as printed. The engine's pan check computes the limit from the full-frame view, so at 35 mm it allows 7.8 degrees per second (`engine/cinematic/tools/frame-check.ts`, `hfovOf`). The engine's sensor is the one used for every shipped clip; read the rulebook's lens tables with the 1.4x in mind.

The rulebook's lens habits, as heuristics: 14 to 24 mm to expand space, 27 to 35 mm for masters and walk-and-talks, 40 to 50 mm for neutral medium shots and over-the-shoulder, 65 to 85 mm for close-ups with a simple soft background, 100 to 200 mm for compression. The lens itself changes how far the camera must stand, and perspective comes from that distance. At 30 cm from a face the nose reads about 30 percent wider; at 1.5 m there is no perceived distortion (sourced, Ward et al. 2018).

Name a lens in millimetres for each shot. A camera body (such as "Alexa 35") is not a lens, and a film uses several lenses, not one. The per-shot lenses of the Handoff film ranged from 18 mm (FPV, snorricam) to 100 mm (macro slider, insert) and a 32 to 180 mm crash zoom.

## 3. How a move is written

### In the engine

A move is a rig, a size, a lens, a start, an end and a duration. `rig.orbit(subject, { size: "MS", mm: 35 }, 20, 140, 0, 7, 0.6)` reads: orbit this subject at a medium shot on 35 mm, from 20 degrees round to 140 degrees round, from 0 to 7 s, rising 0.6 m. Every rig holds still for a short time at both ends, eases in the middle, keeps one dominant axis and aims at the subject's eyes. The full list is in `docs/engine.md`, section 9.

Rules for a move, from the rulebook (heuristics unless marked):

- A move needs a reason. With no reason, lock off. Push in for a realisation, pull out for isolation or a reveal, arc for energy or unease, crane for scale and release.
- Start and end on a composed frame, held 0.5 to 1 s. The measured pass checks this: motion in the first and last 0.5 s must stay under 0.04 units (`HOLD`).
- Use a trapezoid speed profile. Ease 15 to 30 percent of the move at each end. Moves under about 1.5 s can be a plain S-curve.
- One primary axis; any second axis at 10 to 30 percent of it. The `1AXIS` check enforces 30 percent. A designed two-axis move (orbit, crane with a pan) takes the flag `compound`.
- Linear speed reads as robotic. A long ease on a short move reads as floaty. The same shake on every lens, a zoom where a dolly was meant, and three axes at once are the other common fakes.
- A dolly changes perspective and parallax; a zoom scales the whole frame. Use a zoom for a found camera, a crash zoom, or a slow creep.
- The dolly zoom keeps the subject's size with `distance = width / (2 tan(FOV / 2))`, so distance follows focal length. Drive one from the other. A ratio of 3 to 4 (24 to 70 or 100 mm) is a strong stretch; under 1.5 is subtle.

### In the prompt

Seedance follows one named move per shot best. A compound shot should be split. Write each move as its start side, its direction, its arrival, the height and the feel.

The proof is the bullet-time orbit (ACT01) sent as a sheet of frames. The prompt said only "orbits a steady half circle", and the sheet runs came back with a near-static camera. After the rewrite (the start side, the direction, the arrival, about 3 s at the same height, the subject centred, one continuous move, "panels 4 to 9 are one continuous camera move") all three sheet versions orbited (measured on the author's runs, not included). The likely cause is that the rotation lives in the video and is missing from a sheet of frames. This is one template and three sheet runs, so treat the wording as likely and the cause as UNPROVEN. The test is to send the same sheet with the old and the new wording for a second template.

The wording must also match the clip. Five early prompts contradicted their own previs: the orbit side of ACT01 (it starts front-left, not on his right), the car direction of OBJ05 (right to left), the walk of SC03, the crane of SC08 (it only descends), and OBJ01 (a wall and crates stand between camera and suitcase). Check every prompt against frames from the clip.

A second trap is a long prompt that restates camera, lens and shot sizes. In the 24-environment round a lean prompt (the blockout is the source of the camera) was tried first and the framing got looser. The format that worked is both (`docs/prompt-anatomy.md`): a short flowing acting block, a camera script written from the template's own numbers (for example an 85 mm lens feel on a slow dolly, pedestal rises of 0.6 m and 0.9 m, a 28 mm hand-held at 2.4 m/s, a drone dive from 25 m with 24 to 50 mm), and the full protective paragraphs that tell the model the blockout is the source of camera, framing and size.

Words that cause pictures:

- Never name equipment in a ban line (camera, crane, tripod, gimbal). Naming it can put it in the picture. Write "the camera is locked off", not "the camera is on a tripod".
- "Stands very still" makes a statue. The pipeline's prompt gate rejects still, motionless and frozen.
- Do not write a camera body or a rig name as a visible thing.

## 4. Speed

| Rule | Value | Source |
|---|---|---|
| Pan or tilt, at most one frame width per 7 s, at 24 fps with a 180 degree shutter. A pan that holds a moving subject, a whip pan and a brief pass-by are exempt. | hFOV / 7 per second | sourced (RED) |
| Pan limit in this engine | 7.8 degrees per second at 35 mm, 10.5 at 24 mm, 5.7 at 50 mm, 3.4 at 85 mm | measured: `hfovOf = 2 atan(18 / mm)` divided by 7 |
| Imperceptible creep | 0.05 to 0.15 m/s | heuristic |
| Emotional push | 0.15 to 0.4 m/s over 4 to 10 s | heuristic |
| Punch-in | 0.5 to 1.5 m in 1 to 2 s | heuristic |
| Walking follow | 1.0 to 1.5 m/s | heuristic |
| Crane boom | 0.3 to 1.0 m/s over 4 to 8 s | heuristic |
| Technocrane telescoping ceiling | 0.75 to 2.2 m/s | sourced |
| Drone reveal | about 1.8 to 2.7 m/s; fly-over 3.6 to 6.7 m/s | sourced |
| Motion-control robot arm limit used in the robot-arm template | 12 m/s and 180 degrees per second | the arm's limits for `PRD02`; the template file does not state them |
| Whip pan | a 0.3 to 0.4 s swing between two held frames | measured: `rig.whip` default 0.35 s; CAM13 text |
| Steadicam drop time | 2 to 3 s | sourced |

The story film (STORY02) showed what "slow" means in practice. Its first version moved too fast and started late. The fix was one arc from 13 to 25.2 s turning evenly, about 80 degrees at a mean of about 7 degrees per second, no blend between two far-apart poses, and the walker easing into his walk from 17.4 s. His walk tops out at 0.8 m/s, the kneel lasts 3.5 s, and every move eases in and out (measured, in `src/templates/story.ts` and the director's notes).

If a camera in a reference video looks too fast, the fault is in the three.js camera, not in the prompt: make the move more subtle and slower in the template.

## 5. Distance to faces

A close-up or medium close-up keeps the camera at least 1.5 m from the eyes (sourced for the face distortion; the measured pass checks it: `DIST`, only for ECU, CU and MCU). A close-up on 32 mm or shorter would put the camera under 1 m, so close-ups sit at 50 to 85 mm. The over-the-shoulder shoulder takes 20 to 33 percent of the frame width; the engine measures it from the real vertices (`OTS`).

## 6. Designing cuts so they land

A cut lands when the reference video makes it obvious. In the Handoff, 7 of 11 cuts landed on the reference frames even though the prompt did not list them; the 3 that slipped were cuts that were weak in the previs itself (a handle match, a whip blur, a zoom that was too short). The lesson is to fix the cut in the previs, not in the prompt: every cut is a clear change of angle and of size. A prompt line that gives the shot count, lists the frames of the hard cuts and forbids extra cuts or dissolves is a backstop only. With that, the video route landed 9 of 9 (measured on the author's runs, not included).

Rules:

- **30 degree rule** (sourced). Consecutive shots of the same subject move at least 30 degrees round it, or change by two named sizes. The `30°` check enforces this.
- **180 degree line** (sourced). Keep every camera on one side of the line between the engaged pair. Cross it only through a neutral on-axis shot, a move across the line in one shot, or a cutaway. The `AXIS` check uses the sign of the cross product.
- **Reverse shots** match lens, distance and angle off the line, with head sizes within 10 percent (`REV`).
- **Match cut on action.** Observers preferred about 4 frames (182 ms) lost across a match cut. Close-to-wide cuts preferred 154 to 623 ms, wide-to-close little or none (sourced, Hecht and Kalkofen 2009). For AI multi-shot, start shot B slightly later in the action than shot A ended.
- **Cut on the move.** The Handoff's cuts are written on an action: "CUT ON THE TAKE-OFF FRAME" for the bullet-time orbit, "CUT ON ACTION: he is already running" for the FPV chase, a match cut on the handle for the crane (`src/templates/showcase.ts`).
- **Cut where a thought ends** (Murch: emotion 51, story 23, rhythm 10, eye-trace 7, 2D plane 5, 3D space 4, sourced and illustrative).
- **Do not rotate the camera to transition unless the move is motivated** (author's rule).
- **Match cuts hold the subject at the same frame position on both sides.**
- **Screen direction persists across a cut.**

### Continuity across a cut

A hard cut is fine if the action carries across it. What fails is a break in state. Rules from the story films:

1. Write the action across each cut, not inside each shot. If every shot is its own mini-scene with a start and an end, the model resets the person at every cut. In STORY02, the forearm that shielded his face at 6.5 s was gone at 7 s. After the rewrite it was up at 5.6, 6.2, 6.8 and 7.4 s in both takes.
2. Name the state in every shot, not once at the top: the wardrobe, which hand holds the key, whether the scarf hangs or covers the mouth.
3. Do not pack actions. About ten actions in 15 s made the scarf morph. Each hand-off of an object is a morph risk. Less, slower.
4. Bridge two different shots with one camera pose that is the same at the join, not a blend between two far-apart poses. A cut that jumped from a high arc to a low follow was fixed by ending the arc low behind him, aimed at the wall, and starting the follow from that exact pose.
5. Chained extends from the exact last frame are the safer method for long continuity, and the red-carpet chain used them. Re-wording alone did not stop the model redrawing people at each cut (the scarf, the clothes). The story film was fixed by a full regeneration with a state statement in every shot, which passed the before and after pairs for all four cuts. UNPROVEN: that chained 7 s extends would have done better; the test is to chain them from the exact last frame and compare the before and after pairs.
6. Check a cut with before and after frame pairs, never with a cut counter. A counter only finds cuts; it cannot tell if they are continuous.

## 7. The 2 second rule

Give every shot and every camera effect at least 2 seconds. A zoom in and a zoom out one second apart read as a glitch. A 30 s film needs fewer shots: 13 shots and 10 lines made a trailer, not a scene. The Handoff went to 10 shots, 6 to 7 lines and four silent shots.

No engine check enforces it. The shot-length check (`LEN`) has floors of 12 frames for a close-up, 18 for a medium shot and 36 for a wide, which are 0.5, 0.75 and 1.5 s. Nine shots of 2.0 s or less exist in the templates, built before the rule (parsed from the template sources):

| Template | Shot lengths under 2 s |
|---|---|
| ACT07 | 1.3 s and 0.7 s |
| SC06 | 1.0 s |
| SC07 | 0.75 s |
| SC09 | 0.7 s and 0.8 s |
| SC10 | 1.8 s and 1.74 s |
| STORY03 | 1.5 s |

`answers/D-E-I-engine.md` (Q54) says what is proven about the rule.

## 8. The crash zoom

A crash zoom is a fast zoom followed by a lock on the eyes of about 2 s. A one-frame zoom reads as a cut.

The numbers in the shipped template (`SHOW01`, shot 5): the wide holds 0.4 s, then 32 to 180 mm over 0.25 s (6 frames at 24 fps), with the aim moving onto the eyes, then it holds on the eyes. The shot runs from 12 to 14 s: SHOW01 meets 2.0 s for the shot, and the lock after the zoom lasts 1.35 s. The earlier library templates are shorter: OBJ10 zooms 24 to 150 mm in 0.3 to 0.4 s with a held frame on both sides, and ACT03 zooms 35 to 85 mm in 0.2 s and holds 1 s.

## 9. Reactions

Placeholders cannot act, so in the previs a reaction is a push-in and a hold. The Spielberg face becomes a 3 to 6 s dolly push while the head is turned off-axis, then a hold, then a cut to the object (heuristic; the template is CAM03 and CAM35).

In the prompt a reaction is written in order: hear, the face changes, turn and look, back. In the Handoff she hears the drone, is scared, and looks at the drone. The order matters. A person reacts after the change is finished, and looks at his hands after they start changing, not before. In the Glambot film he looked at his hands before the stripes began; the fix was to give each stage a time window and write "no shock, no flinch, no change of expression" for the transition.

Keep acting words small. Literal acting words are played literally: "eyes wide and unblinking" gave open mouths, "a small breath through his nose" gave sniffing, "a small frown of concentration" gave an angry scowl. Describe what should appear, once. When a line is cut, cut the action tied to it.

## 10. Never static

Move the camera in every clip you send. Locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03 and the ANG family) are kept as camera studies: drafts from them were stiff, so they are not recommended (measured on the author's runs, not included).

The gate is `tools/seedance/qa4.py`, rule Q0 (repo-level `tools/`), which uses `engine/cinematic/tools/clip-motion.py`: it compares three frames of the blockout clip and refuses the job unless the largest mean difference reaches 8.0 on a 320 px grey frame. The locked angle templates scored 2 to 4, every moving camera 16 or more.

Which templates are camera-less:

- 34 of the 36 ANG templates have a fixed camera. ANG11, ANG12, ANG24, ANG25, ANG37, ANG38 and ANG39 use a hand-written fixed camera and a moving subject; the others use `rig.locked`.
- ANG23 (fisheye low follow) and ANG32 (ground-level walk) use `rig.follow`, so they have a moving camera by the code. Run on the shipped `pill.mp4`, the gate passes ANG23 (largest difference 11.34) and fails ANG32 (5.14).
- CAM01 (locked off), CAM26 (Dutch angle), CAM29 (low angle), CAM30 (high angle) and CAM46 (rack focus between people) are fixed cameras. CAM26, CAM29, CAM30 and CAM46 have no result in `release-media/` for that reason.
- Fixed-position moves that still change the picture: CAM17 and CAM18 (zoom), CAM19 to CAM21 (tilt and pan), CAM28 (a 360 degree roll).

A locked-off camera is valid film language when the action should carry the frame: entrances and exits, comedy timing, a tableau (CAM01's own text). The Handoff keeps one locked shot, a close-up of Mara with a rack focus to the drone, inside a moving 30 s film. The rule is about whole clips. Inside a film, a locked shot with a rack is a shot with motion in it.

## 11. Focus pulls and aperture

A shot can set its own aperture with `stop` and move its focus with `focus`.

- `stop` is a T-stop. Templates default to 2.8. The HUD shows the near and far limits and the background blur in pixels.
- `focus` is an actor id, or `[from, to, k]`. The focus point moves from one actor's eyes to the other's as `k` goes from 0 to 1. Use `smoother(ramp(t, a, b))` for `k`.
- STORY02 gives each shot its own aperture: T8 for the dive (deep focus), T2 for the leading track, the boots, the face and the key, T2.8 for the arc and T4 for the follow. The code comment says "deep for the dive, shallow for the faces and the lock".
- Rack durations in the library: 0.6 to 1 s for a look (OBJ07), 0.8 s (CAM46), 1.2 s (ONE04), 0.55 s (Handoff, to the drone). The rulebook gives 0.5 to 1.5 s for a look, under 0.3 s for shock and 2 to 4 s for a reveal (heuristic, no published numbers).
- A rack needs a reason: a turn, a line, a sound or an entrance. Racking with deep focus changes nothing (OBJ07's own warning). The second face must already be in the frame, soft, before the rack starts (ONE04).
- Depth-of-field numbers (calc, 0.025 mm circle): 85 mm at T2.8 focused at 1.5 m holds about 4 cm sharp, 50 mm at T2.8 about 12 cm.

A director pulls focus, so the 30 s story has focus and defocus. Whether Seedance follows the blockout's depth of field or its rack is UNPROVEN. The test is to send one rack-focus template with and without the rack in the blockout and compare the output frames at the rack time.

## 12. Angles and moves

`CAM` templates are moves. `ANG` templates are single looks: where the camera sits and what lens it uses. The ANG family covers the shot sizes (extreme wide to extreme close-up), heights (eye, hip, knee, ground, shoulder, over the head), angles (profile, three-quarter, from behind, bird's-eye, worm's-eye, high, low, Dutch, upside-down) and lens looks (super wide at 14 mm, ultra-wide close-up, fisheye at 8 and 5 mm, peephole, security camera, long lens, telephoto close-up), plus symmetrical, framed and leading-line compositions.

Angle reads as status. Eye level is neutral, a high camera diminishes and a low camera empowers (rulebook). A Dutch tilt of 15 to 25 degrees reads as clearly noticeable, 10 to 15 subtle, up to 45 extreme (sourced). The same low angle on both sides of a conversation cancels the effect.

## 13. The families

| Family | Count | What it is for |
|---|---|---|
| CAM01 to CAM16 | 16 | the basic moves on people: locked-off, pan with, push in, pull out, dolly zoom, orbit, crane up and down, Steadicam follow and lead, tracking, over-the-shoulder pair, whip pan, handheld, chase drone, FPV |
| CAM17 to CAM48 | 32 | finer moves: slow zoom, tilt, pan reveal, pedestal, arcs, Dutch, barrel roll, low and high angle, overhead rise, run and gun, POV, two-shot truck, slider, whip tilt, reverse dolly zoom, drone orbit, dive, reveal and rise, low follow, rack between people, handheld push, orbit walk |
| OBJ01 to OBJ16 | 16 | moves on things: push in on a clue, hero orbit, crane up a statue, truck past, low tracking on a car, top-down, rack focus, wipe reveal, through a doorway, crash zoom, tilt up a tall thing, flyby pan, macro slider, fly through a window, top-down spiral, product spin |
| ACT01 to ACT08 | 8 | action: bullet-time orbit, snorricam, crash-zoom fight, sprint dolly zoom, parkour track, low hero arc, fight coverage, fall drop |
| ONE01 to ONE04 | 4 | one-take moves, several moves chained with no cut |
| SC01 to SC10 | 10 | scenes: a set with a short coverage pattern (forest, interior dialogue, street walk-and-talk, car interior, space flyby, rooftop chase, alley fight, heist approach, stand-off, car through a barrier) |
| ANG | 36 | single looks (section 12) |
| FAM01 to FAM06 | 6 | famous shots: 360 booth, walk away from an explosion, trunk shot, leap of faith, 360 round two men, flight over a city |
| PRD01 to PRD06 | 6 | product and showpiece moves: robot-arm snap, probe fly-through, skyline dive, red-carpet robot-arm move, plus PRD01 (frozen splash; never sent) and PRD03 (exploded build; sent once, result not used) |
| SHOW01, STORY02, STORY03 | 3 | whole films built from the moves: the 30 s Handoff, the dive to the shutter, the second 30 s |

Every template has a card with what it says, when to use it, its numbers and what to avoid. The full table is `answers/E-template-catalog.md`. The code has 137 template ids (136 with a card).

The meaning of a move, in one line each (rulebook plus the template cards):

| Move | Means |
|---|---|
| Push in | tension, access to an inner state; the realisation before the reveal |
| Pull out | isolation, or a reveal of the context |
| Arc and orbit | energy, a person at the centre of a turning point |
| Crane up | release, the destination; crane down is arrival |
| Handheld | a raw witness; urgency, nerves |
| Steadicam follow | going with them; lead is confrontation or a walk-and-talk |
| Tracking alongside | travelling as an equal; speed with foreground passing |
| Whip pan | sudden attention, a hidden cut |
| Dolly zoom | the ground shifts: dread, vertigo; once per film |
| Crash zoom | shock or punchline |
| Snorricam | panic, flight, a body out of control |
| Bullet time | time stops for the one moment the story turns on; once per film |
| Static frame | the blocking has room to play |
| Dutch and roll | unease, instability |
| Danger draws the camera closer | the most transferable rule for placeholders (sourced, Cundey on Spielberg) |

Use the heavy moves once. Mark one signature shot per sequence and spend the boldest move there only.

## 14. Camera only

A camera-only previs (no people, an empty set) gave the best movement and realism of all the video tries, and the subjects landed in the wrong places. Use it when nobody needs to stand in a particular spot: a drone move over a landscape, a reveal of a place, an object shot. Do not use it when the position of a person is the point. Three camera-only clips exist (orbit, bullet time, alley); the engine flag is `--plate`.
