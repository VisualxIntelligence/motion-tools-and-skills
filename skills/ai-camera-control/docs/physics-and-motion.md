# Physics and motion

The previs is about camera craft, but broken physics on the placeholders makes every shot look wrong, and the video model copies the motion it is shown. Five faults recur: motion that looks like slow motion, feet that slide, bodies that pass through cars or each other, ghosted or doubled heads, and a body that sinks into the ground. This page records how each was caused, measured and fixed, and what the motion check tests. Commands that start with `tools/` run from `engine/cinematic` and mean `engine/cinematic/tools/`.

Rule: before showing any moving render, measure it. Check the planted-foot slide against body speed, the contact of bodies with the set and with each other, and the head across the sub-frames. Look at real frames of the new render, never at the old one.

## 1. How the bodies move

A person is a faceless mannequin from the Quaternius Universal Animation Library 1 and 2 (CC0, one 65-bone skeleton, about 80 captured clips). The clips are sampled, never played. Every frame sets each clip's time from the actor's own clock, sets the blend weights and evaluates the skeleton once (`src/kit/rig.ts`). The walk takes its time from the distance walked. The skeleton is never rendered in a stand-in render; the striped pin is fitted to it instead.

Even so, the body matters. It sets how tall the pin is, where the eyes are for the framer, and what the motion check measures.

## 2. The stride is measured, not typed

The first stride was typed in: 1.86 m per walk cycle. It was about 45 percent too long, so the bodies moved faster than their feet and the walk looked like slow motion.

The stride is now measured from each clip with a foot held planted. The values in the code:

| Gait | Clip length | Stride per cycle | Speed at the clip's own pace |
|---|---|---|---|
| walk | 1.333 s | 1.3 m | 0.975 m/s |
| jog | 0.933 s | 4.8 m | 5.1 m/s |
| sprint | 0.667 s | 4.1 m | 6.15 m/s |

(`STRIDE` and `CLIP_LEN` in `src/kit/rig.ts`; the speeds are the stride divided by the clip length.) Planted-foot slide fell from 30 to 50 percent of body speed to 6 percent, which is the noise floor from the rolling heel. An FPV runner went from 25 percent to 13 percent and then to clean.

Rules that keep the feet planted:

- **A slow walk takes shorter steps. It never plays the clip slowed down.** The cycle rate has a floor of 80 percent of the clip's own cadence (72 percent for the long-stride jog), ramped in between 0.55 and 0.9 m/s. Below about 0.6 m/s the stepping is locked to the ground so the feet cannot skate while starting and stopping. The probe that found it: actors at 0.4 m/s played a slowed walk in CAM01 and CAM02.
- **Walk, jog and sprint share one stepping clock.** Each clip is offset so its left foot lands at the same moment (`rig.landing`). On separate clocks, a blend mixes two points of the stride, and the feet slide or drag. The separate clocks left the FPV runner at 25 percent slide and the rooftop chase at 15 percent.
- **The gaits crossfade by speed.** Weights: walk comes in between 0.03 and 0.2 m/s and goes out between 2.4 and 3.4; jog comes in between 2.4 and 3.4 and goes out between 5.4 and 6.2; sprint is above. The standing pose has its feet fixed to the body, so the walk takes over within 0.2 m/s.
- **Natural speeds.** Keep walkers near the clip's pace: the walk clip covers 0.97 m/s and the run clip about 5 m/s. The story film walks at 0.8 m/s at most; that is the top speed in the director's pacing note.

## 3. Locked feet

A planted foot must stay where it landed. Four fixes, in the order they were found:

1. **Idle to walk.** In CAM01, frames at 0.72 to 0.97 s showed 130 to 320 percent slide during the idle-to-walk blend. The blend was shortened, and no frame over 100 percent remained.
2. **Ankle pin.** Pinning the planted ankle with inverse kinematics made it worse (median slide 22 to 26 percent, against 6 percent). It was replaced by a measured correction.
3. **Measured skid correction.** For each gait the engine samples the clip 240 times per cycle (`TABLE_N`), finds when each foot is down, and measures how far the planted point slides, since the clip's heel touches down still moving. The correction holds that point still through the stance and lets go over the swing. It brought the median slide to 1 to 2 percent. It is applied to the leg through a two-bone solve (`pinFoot`), with the foot keeping the clip's own angle so the sole stays flat. A foot counts as down when its lowest sole vertex is within 5 cm of the floor, so the heel is slowed into the ground over its last 5 cm and lands still. Heel strikes went from 1.4 to 1.6 m/s to 0.02 to 0.3 m/s. A slow-in of 3 cm was not enough for ONE01; 5 cm was.
4. **Jumps leave on the toe-off.** The body holds still until the clip's own toe-off and then leaves. ACT01 used to creep forward and launch early. A "plant" feature that moved the root was tried and removed because it swept sideways by about 0.1 m.

Other clip rules:

- A clip switch blends over at least two frames. An abrupt switch snapped the head 27 degrees in the rooftop chase.
- A toe that drags in a run is cleared by the swing foot lifting.
- Frame counts must be whole. One non-whole count broke rendering for every template.

## 4. Ghost heads

Symptom: a doubled head in a motion-blurred frame. Cause: the head turn toward the other character piled up across the blur sub-frames. The head yaw read 113 degrees, then 46, then minus 23 across sub-frames 1/192 s apart, which is about 67 degrees per sample. Fix: `RigFigure.pose` restores the neck and head rotations to the clip's own values before every pose (`beforeLook`), because the animation mixer rewrites a bone only when the clip value changed, so a look left on the bones stacks up. After the fix the probe read 113.6 degrees steady.

Related fixes on the render side:

- The sub-frame count scales with measured screen motion, up to 48. At 5 sub-frames, FPV pillars sweeping about 60 px per frame at 18 mm smeared into copies.
- A stand-in render swaps the pin in for every sub-frame and hides the body, so a blend never draws the mannequin. Before the fix, extra blend frames drew the mannequin first.
- Animation phases are integrated over time, not computed as speed times time. Wing flaps fluttered at near frame rate whenever the creature slowed down.

## 5. Floors, sinking and standing on the surface

Symptoms: toes dipped 3 to 7 cm under the ground at every step; bodies walked 8 cm inside the plaza paving and 16 cm inside the street kerbs; the back dipped 2 cm into the roof in a rooftop roll. Fixes:

- **The ground pass.** After every pose the engine lifts the body by exactly the lowest point of the skin below the floor (`ground()` in `rig.ts`), over the whole body, not only the soles. The lowest skin point stays within 0.5 cm.
- **Every set declares its floor.** `w.paving(x, z)` is the height of the walking surface. Bodies, cameras and checks all use it. Raising the walkers by 16 cm broke the framing in both street scenes until the planner (`planner()`) also used the paving height. Cameras plan from the same floor heights the render uses.
- **Paving strips lie flush.** They stood 1 cm proud and cut into the soles.
- **Bodies stand on the surface they are over.** The floor under a body is found with a ray under the hips, so a roof, a step or the ground all work.

## 6. Nothing passes through anything

Symptom: bodies looked as if they merged into cars or other components. The measured check found no body passing through a car, a prop or another body. The closest approach between street walkers was 0.30 m. The merging that was seen was most likely the ghost heads. One real hit existed: the arm of the parkour runner clipped a lamp post by 1 cm. The fix was to dress the set (the post moved 1.2 m), not to change the run or the camera.

Hands must grip what they hold. The driver's hands in the car interior floated 0.52 m behind the wheel. The wheel was moved into the grip and a steering column added. A camera must never start inside geometry (a follow camera that began inside a ship hull rendered a flat grey frame), and a bounding-box framer must not place the camera inside a wall.

## 7. The motion check

`tools/motion.sh` (source `tools/motion-check.ts`) samples every rigged body every 0.1 s over the whole piece and prints one line per template: `clean`, or the notes.

| Note | Fires when |
|---|---|
| TOUCH | a joint is inside a solid set piece (a mesh at least 12 cm tall, under 60 m wide, with its base below 2.4 m), or inside another body's trunk (within 0.15 x scale of its waist, between its ankle and its crown). Sitting and driving bodies may touch their seat and wheel. |
| SINK | the lowest skin point is more than 1.5 cm under the floor beneath it (floor found by a ray under the hips). Seated bodies are exempt. |
| SLIDE | the sole vertices on the floor move faster than 15 percent of the body's speed, as a median over the walk. Any single frame over 100 percent is listed as a skate. A foot counts as planted with 3 or more vertices on the floor, and the check applies above 0.3 m/s. |
| HEAD | the head turns more than 25 degrees between two renders 1/192 s apart (a ghost in the motion blur). |

Run `tools/motion.sh` for every template, `ONLY=SC06 tools/motion.sh` for the ids that start with SC06. The speed it uses is read in world time, so a slowed scene is judged correctly.

Results: 47 of the first 54 templates were clean on the first run and all 54 on a later run (measured on the author's runs, not included). The Handoff run showed two false alarms from bounding boxes: a knee near the case in three frames, and a landing-roll slide that the parkour template also has. Run over all 137 ids, 11 templates carry notes (CAM35, CAM46, CAM48, ANG11, ANG12, ANG24, ANG32, FAM02, FAM04, STORY03, SHOW01): contacts or slides that are not proof of a visible fault (`docs/known-limits.md`).

### The check's own bugs

Fix the check as well as the shot. Five bugs were found in the check itself:

1. It measured "on the floor" against the path height. In a jump the path height is mid-air, so a bullet-time leap read as a 58 percent slide.
2. It counted paving joints 1 cm proud as floors, and then as sinking.
3. It counted a single lifting toe as a planted foot (ONE01's landing stayed flagged until the 3-vertex rule).
4. It read slowed scenes in film time instead of world time.
5. It reported any figure more than 9 m above the ground as sinking. The floor is now found with a ray under the hips.

### What it covers

The id filter is `/^[A-Z]{2,6}\d/` (`motion-check.ts`), so every template id is checked, ANG, FAM, PRD and STORY included. Without `STRICT=1` the script exits 0 even when it prints notes; set `STRICT=1` in CI so a note fails the run. If no id matches, it stops with an error.

The check measures the mannequin, not the pin. The pin follows the body, so the body's result carries over.

## 8. Physics of things

Debris, crates, kegs and barrels are simulated once with Rapier and read from a table at render time, so the physics is identical in every render. Details and the three baked scenes are in `docs/engine.md`, section 13. A frame is a pure function of time.

Other measured checks from the famous-shot builds (measured on the author's runs, not included): the leap of faith keeps gravity at minus 9.81 m/s2 with zero deviation, and the explosion walk's foot slide had a median of 0.4 percent of body speed. A 240 Hz camera probe on those templates reported the path length, peak speed, peak acceleration, peak view-turn rate and the largest step between samples, which should equal the peak rate divided by 240, so there is no pop. The probe scripts are not in the repo; `tools/camera-path.sh` prints the camera second by second.

## 9. Speed ramps and frozen time

A scene may run on its own clock while the camera runs in real time (`clock` in `SceneSpec`, built with `speedRamp`). The ramp is a table of times and rates, eased between marks and integrated, so the world's clock never jumps. It makes frozen time (bullet time) and slow motion possible. The motion check reads actors in world time, and the camera plans in the same time.

Do not put slow motion on a part that is real speed in the film. In the leap of faith the fall plays at about real speed; slowing everything to 14 percent after the push-off was wrong. The fix was real speed for 3.3 s, then the clock eased over 0.7 s to 0.035 only as the camera lands on the upside-down wide.

## 10. Motion in the prompt

The video model copies the stiffness of the body it is shown. A clay mannequin gave the right camera and a stiff, game-like fight. That is why the reference shows a striped pin, which has no body to copy, and why the prompt carries the performance.

- Write the walk as a natural pace. A limp, a dragging foot and "slow and labored" were written into a prompt and produced a dragging, odd walk. Keep the gait natural, steady and planted, and add "never in slow motion".
- Do not rely on marks on the ground to show a stride. Footprints and a drag scrape were tried in STORY02, then removed. The code for them still sits in `story.ts` and is no longer used.
- A stand-in has no limbs. A shot about feet or hands is a camera move and a pin. The stride, the stumble and the hands come from the prompt.
- Do not write "stands very still" for a person who should breathe, blink and move. It makes a statue.
- Fast moves are a camera problem. If the reference camera is too fast, fix it in three.js (section 7 of `docs/camera-language.md`).

## 11. Not in the engine

The engine has no inertialization (clip blends are linear), no speed-limited smooth paths, no lean, bank or counter-swing layers, no root-motion one-shot clips, no turn-in-place clips with hand IK, no spring-damped camera operator (the code exists and is switched off, `docs/engine.md`, section 18), no operator profiles measured from the 33 real-film moves and no camera smoothness check (jerk limits, micro-jitter). Full inverse kinematics for hands and feet is not built; the fix for sliding feet is the measured skid correction plus the two-bone solve above.
