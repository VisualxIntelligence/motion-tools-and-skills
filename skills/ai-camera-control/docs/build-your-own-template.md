# Build your own template

Run all commands from `engine/cinematic`. `tools/` below means `engine/cinematic/tools/`, not the repo-level `tools/`.

This page takes an idea to a checked three.js render of your own template, step by step, with the check to run at each step.

There are two ways to write a template:

- **The fast path (start here): the lab set and `make()`.** About 12 lines. One person, one move, on the grey lab plaza that most templates use. The complete, rendered example is in the next section.
- **Your own set with `scenePiece`.** For a scene that needs its own walls or props. The worked example at the end of the page does this (type-checked; UNPROVEN that it renders, the test is to run steps 6 to 12 on it).

Nothing on this page sends anything to a video model or spends credits.

## Step 0. Write the move in words first

Before any code, write one sentence for each of these. If one cannot be written, the template is not ready.

- **The reason.** What does the move say? A move with no reason is a locked-off camera. Move the camera in every clip you send: locked-off templates are kept as camera studies and are not recommended, because drafts from them were stiff (`docs/camera-language.md`, section 10).
- **The start, the direction and the arrival.** Which side of the subject the camera starts on, which way it travels, and what frame it ends on.
- **The size and the lens.** A named shot size and a focal length in millimetres at the start and at the end.
- **The speed.** A duration, and a rate in units: "orbits 120 degrees over 6.2 s", not "fast" or "slow". After you have written the shot, `tools/camera-path.sh <ID> --step 0.1` prints the camera speed in m/s between the samples (average and peak), so you can check the number you wrote. Use `--step 0.1`: at `--step 0.5` the peak is undercounted by about 12 percent.
- **The people and where they stand.** How many, where, which way they face, whether they walk.
- **The cut.** How the film arrives in this shot, and what carries across.

Then look in `answers/E-template-catalog.md`. There are 137 template ids. If one already says what you need, use it or change its numbers.

## The fast path: a template on the lab set

This file was registered, checked and rendered exactly as written here. It gives a slow 85 mm push in on one person, from a medium close-up to a close-up, over 10 seconds. Save it as `engine/cinematic/src/templates/my01.ts`:

```ts
import type { Piece } from "../piece";
import { rig } from "../kit/rigs";
import type { ActorSpec } from "../kit/actors";
import { make, type TemplateInfo } from "./cameras";

const info: TemplateInfo = {
  id: "MY01-SlowPushViolin", name: "Slow push (violin)",
  says: "We lean in until the face is all there is.",
  use: "The held breath before a note, a confession, a decision.",
  numbers: "85 mm, MCU to CU on a dolly over 10 s, still for 1 s at both ends, about 0.09 m/s.",
  avoid: "Pushing on a person who has nothing to feel.",
};

const actors: ActorSpec[] = [
  { id: "ALEX", name: "Alex", kind: "human", tint: "ochre", path: [{ t: 0, at: [0, 0], yaw: 0 }] },
];

export const MY_TEMPLATES: Piece[] = [
  make(info, actors, (P) => [{
    start: 0, end: 10, label: "85mm  PUSH IN · MCU TO CU", rig: "DOLLY", subject: "ALEX",
    size: "MCU", sizeEnd: "CU", stop: 2,
    cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 85, deg: 20 }, "CU", 0, 10, 1.0),
    cut: "Opens the template",
  }]),
];
```

What `make(info, actors, shots)` does for you: it builds the neutral lab set (`buildLab`, a grey plaza clear to 9 m round the centre), adds 200 motes for the one moving layer in every frame, and pushes your `TemplateInfo` into `CAMERA_INFO` for the gallery card. You write only the actors, the shots and the card text.

Register it. In `src/templates/index.ts` add `import { MY_TEMPLATES } from "./my01";` and add `...MY_TEMPLATES` inside the one long `Object.fromEntries([...])` line that builds `TEMPLATE_PIECES` (next to `...STORY_TEMPLATES`). Then `node render.mjs --videos MY01-SlowPushViolin` finds it by id.

**What the shot numbers mean.** `rig.dolly(subject, { size, mm, deg }, endSize, t0, t1, hold)`:

- `size` is the start shot size (`EWS WS MWS MS MCU CU ECU`) and `endSize` is where the push ends.
- `mm` is the lens. An 85 mm lens on the 2.39:1 frame is tight: an "MCU" fills about half the frame height with a head, much closer than a film's medium close-up.
- `deg` is where the camera stands **around the person**: 0 is straight in front, 90 is on their left, 180 is behind. It is not a tilt and not the lens angle.
- **Near-front angles trip the LEAD check.** At about 17 degrees or less off straight-on the person is not given lead room, and `LEAD` fails. `deg: 10` failed in a test render, `deg: 20` passed. Use 20 or more, or add the flag `centre` if you mean a centred frame.
- `t0` and `t1` are when the move starts and ends. `hold` is how long the camera stands still at **both ends**, in seconds. The "hold at least 2 seconds" rule is about the **length of the shot** (here 10 s), not about `hold`.

## A second tested example: an orbit

An orbit goes round the person instead of toward them. This file was checked as written: 35 mm, a 90 degree orbit from 20 to 110 degrees around, over 8 seconds, with 0 fails in the measured pass. The camera runs at 0.68 m/s on average and 2.17 m/s at its peak (`tools/camera-path.sh <ID> --step 0.1`).

```ts
import type { Piece } from "../piece";
import { rig } from "../kit/rigs";
import type { ActorSpec } from "../kit/actors";
import { make, type TemplateInfo } from "./cameras";

const info: TemplateInfo = {
  id: "MY02-SlowOrbitDancer", name: "Slow orbit (dancer)",
  says: "She is the centre of the room and we move round her.",
  use: "A performer at the turning point of a scene.",
  numbers: "35 mm, MWS, 90 degrees (20 to 110) over 8 s, eased, still for 0.4 s at both ends.",
  avoid: "Orbiting just for motion.",
};
const actors: ActorSpec[] = [
  { id: "MARA", name: "Mara", kind: "human", tint: "rose", path: [{ t: 0, at: [0, 0], yaw: 0 }] },
];
export const MY02_TEMPLATES: Piece[] = [
  make(info, actors, (P) => [{
    start: 0, end: 8, label: "35mm  ORBIT 90", rig: "TECHNOCRANE ORBIT", subject: "MARA",
    size: "MWS", stop: 2.8, flags: ["compound"],
    cam: rig.orbit(P("MARA"), { size: "MWS", mm: 35, rise: 0 }, 20, 110, 0, 8, 0, 0.4),
    cut: "Opens the template",
  }]),
];
```

`rig.orbit(subject, frame, a0, a1, t0, t1, rise1, hold)`:

- `frame` is `{ size, mm, rise }`: the shot size, the lens and the starting height above the eyes, in metres.
- `a0` and `a1` are the start and end angle **around** the person in degrees (0 is in front, 90 on their left, 180 behind). The orbit travels from `a0` to `a1`.
- `t0` and `t1` are the start and end time in seconds. `rise1` is the extra height gained by the end, in metres. `hold` is the still time at both ends (default 0.4 s).
- `flags: ["compound"]` marks an orbit as one move on two axes. Without it the `1AXIS` check complains.

Two things this example teaches:

- **Use `MWS` for a film medium shot.** On this 2.39:1 frame, `MS` is chest-up. `MWS` is hip-up, which is what a film calls a medium shot. The `SIZE` check accepts either, so judge from the still.
- **A medium-shot orbit tends to fail `JOINT`.** `JOINT` fails when the frame edge cuts a body at an elbow, a wrist or a waist. On an `MS` orbit it fails at the bottom edge, and the shipped `CAM06-Orbit` fails it too (`PIECE=CAM06-Orbit tools/check.sh` shows `JOINT` with the waist and elbow at the bottom). The shipped templates keep some fails on purpose. There is no flag for `JOINT`. The fix that keeps the size is a wider size (`MWS`, as here) or a slightly higher camera; do not change the check.
- **`PAN` fails when the camera turns too fast** (over about 7.8 degrees a second) unless the turn follows a subject who holds still on screen, which an orbit does. It can still flip between pass and fail when you change `rise`, the angle or the time. If it fails, change one thing (a longer time, or a smaller angle), re-run the check, and keep the change that clears it. Do not chase it with a rise you do not want.

## Step 1. Set up

You need the repo, Node 22.12 or newer, ffmpeg, Python 3 with Pillow and numpy, and network access once (Remotion downloads a headless Chrome on the first render). The mannequin files ship in `engine/cinematic/public/kit/`: they are needed even though a stand-in render never shows the body, because the body drives the framing and the checks.

```bash
cd engine/cinematic && npm install
```

`npm install` prints audit warnings. They are expected: the engine only renders locally.

All commands below run in `engine/cinematic`. Template ids look like `CAM06-Orbit` or `MY01-SlowPushViolin`: two to six capital letters, two digits, a dash and a name.

## Step 2. Choose the stand-ins

People are never rendered as bodies in a reference. In a `--boxes` render each person becomes the striped pin, in one of seven colours picked by the actor's `tint` (`ochre` red, `slate` yellow, `rose` green, `sage` blue, `plum` magenta, `sand` orange, `stone` cyan). One colour per character, the same in every template, so a prompt can name the character from its colour. Seven characters is the limit of the table. A prop that acts gets a flat label colour in the same way (`label`). A product is the 24 cm pill (`model: "pill"`), never a bottle, a box or a shoe shape.

Rules:

- No legs, arms, hands or boots on a stand-in. Feet and hands come from the prompt.
- Do not add tracking marks, ground marks or footprints. They made the model copy a chessboard.
- Two people in one scene need two tints.

## Step 3. Build the set coarse and colourless

A detailed set gets copied. Cone pines, ball trees and plain grey blocks came back as cones, balls and blocks. So the set marks where things are and the prompt says what they are.

- Grey and off-white materials only (`GREY` in `kit/clay.ts`). No coloured light, halo, shaft or grade. `MOOD_LIGHT` stays `false`.
- Windows and lamps are plain white shapes.
- The kit's `pine`, `broadTree`, `bush`, `rock`, `lampPost` and `bench` are already tagged with `dress()` (from `kit/props.ts`). Tag your own loose detail and anything that flies the same way. A `--no-scenery` render then leaves it out, which is how object shots and the 30 s film avoided the leak.
- Keep what the action uses: the ground, the columns the runner passes, the block he jumps from, the wall with the lock.
- Rooms have no ceiling, so high and overhead moves can see in.
- Keep the area round the action clear. The lab plaza keeps its centre clear to 9 m, and the studio stages are clear of walls for 12 m round the subject.
- Declare the floor. If the walking surface is not at y 0, set `w.paving = (x, z) => height`, so the bodies and the planner stand on it.
- Make a key prop look like what it is. A sphere for a fist and an orange block for a lock confused the viewer and the model. A key was rebuilt as a small brass key with a ring bow, and a lock as a round plate with a keyhole.
- Give the set real scale. A set that read as very small was rebuilt at a larger scale, with domes.

## Step 4. Place the actors

An actor is a path of timed marks.

```ts
{ id: "ALEX", name: "Alex", kind: "human", tint: "ochre",
  path: [{ t: 0.4, at: [0, 7.5] }, { t: 7, at: [0, -1.8] }],
  acts: [{ kind: "lookDown", t0: 2.5, t1: 4.5 }] }
```

- The heading follows the velocity. Give `yaw` on a mark where the person must face a direction while standing.
- Keep speeds natural. The walk clip covers 0.97 m/s and the run clip about 5 m/s. A walker under 0.55 m/s has its steps locked to the ground (`docs/physics-and-motion.md`).
- A person who stops or kneels does it through an act (`kneel`, `crouch`, `sit`, `lookDown`, and so on). A kneel holds only when the act has no end time.
- For a jump, leave the ground exactly on the clip's toe-off.
- A prop that moves is an actor with `kind: "prop"` and a `model`.
- One moving layer in every frame: motes (`motes` in the scene) or wind. Placeholders do not act.

## Step 5. Write the shots

Each shot gives a start, an end, a label, a rig, a subject, a size, a camera function, a stop, and a note on how the film arrives.

- **One named move per shot.** Split a compound shot.
- **Use a rig from `kit/rigs.ts`** (`docs/engine.md`, section 9). They are eased, held at both ends and aimed at the eyes.
- **Hold at least 2 seconds.** Give every shot and every camera effect at least 2 seconds (`docs/camera-language.md`, section 7). Nine shots in older templates are shorter; they were built before the rule. This is the length of the shot, not the `hold` argument of a rig, which is the still time at the two ends. A crash zoom is a fast zoom of about 6 frames and then a lock on the eyes of about 2 s.
- **Put the lens in the label** (`50mm  PUSH IN · MS TO MCU`). The report in the bar and the contact sheet read it.
- **Name the support in `rig:`.** It picks the float: DRONE banks into turns, HANDHELD shakes, STEADICAM floats, TRIPOD and LOCKED are still.
- **Declare `size` and, for a push or a pull, `sizeEnd`.** The measured pass checks the shot against them.
- **Flags** are deliberate exceptions; each turns off one check. Use `compound` for an orbit or a crane, `whip` for a whip pan, `centre` for centred framing, `short-side` for a subject on the side it faces. Do not use a flag to hide a fault.
- **Cuts.** Make every cut a clear change of angle and size. Cut on an action. Keep all cameras on one side of the line between two people.
- **Focus and aperture.** `stop` sets the T-stop. `focus: (t) => ["ALEX", "SAM", smoother(ramp(t, 3.0, 3.8))]` racks from one actor to another. A rack needs a shallow stop (T1.4 to T2), a reason, and the second face already in the frame.
- **Do not pack.** A 30 s film wants 7 to 10 shots, not 13.

## Step 6. Register it

Put the file in `src/templates/`. Export a `Piece[]` and add it to `TEMPLATE_PIECES` in `src/templates/index.ts` (one long line: add `...YOUR_TEMPLATES` inside the array). `Root.tsx` then registers a composition for each id.

For the gallery card, the template needs a `TemplateInfo` pushed into `CAMERA_INFO` (single moves; the helper `make()` does it for you, see the fast path) or `SCENE_INFO` (scenes). Cards read `says`, `use`, `numbers` and `avoid`. Write `numbers` from the code, with the lens, the size, the distances, the speeds and the time. Run the numbers through `tools/camera-path.sh <ID> --step 0.1` before you print them (it prints distances to 0.01 m and the camera speed). The CAM06 card once said "(≤ 30°/s)" while the code peaks near 58 degrees per second, so a typed number can be wrong; the card is now corrected.

## Step 7. Type-check

```
node_modules/.bin/tsc -p tsconfig.json --noEmit
```

The engine reports 2 errors today, both in `src/templates/cameras.ts` line 19 (the casts in `make`). They are not yours. Only new errors matter. Remotion bundles with esbuild, which does not stop on them.

## Step 8. Stills and the measured pass

Take the first still of the hero in the main set and approve the look. For a close-up template, take the first frame of your plan. Then:

```
PIECE=MY01-SlowPushViolin tools/check.sh                 # the measured pass: 15 checks, in/middle/out of every shot
PIECE=MY01-SlowPushViolin tools/check.sh 0.2 5 9.8       # where each subject lands at those times, and what blocks it
tools/camera-path.sh MY01-SlowPushViolin --step 0.1      # the camera in numbers, with its speed (0.1 s samples: a coarser step undercounts the peak)
```

`PIECE=<id>` is required: without it the check stops with a message. The measured pass writes `framecheck.json` to `.work/out/<id in lower case>/` (or under `CAMERA_CONTROL_HOME`).

How to read the output:

- **The pass table.** One row per shot, one column per check: `SAFE BLOCK HEAD JOINT SIZE LEAD OTS REV DIST AXIS 30° PAN 1AXIS HOLD LEN`. `·` passes, `✗` fails, `f` is a flagged exception, blank means the check does not apply to that shot.
- **`SIZE` is loose on purpose.** It accepts one shot size either way. The report bar may say `EXTREME CLOSE-UP` for a shot you planned as MCU to CU at 85 mm. Judge the size from the still, not only from the column.
- **The `t` line.** For example `ALEX(0.26,0.23 d3.1 CU)`: where the subject's middle sits across and up the frame (0 to 1), `d` the distance to the camera in metres, and the shot size it measures. `centre:set:Plane@60.1` is what is at the middle of the frame.
- **camera-path's `% of frame height`** is how tall the subject is against the frame: 308% means the frame shows about a third of the person.

Fix every fail in the shot code, not in the check. A fail that is deliberate gets a flag and a reason. The checks and their thresholds are in `docs/qa-engine-side.md`.

Render the in, middle and out stills (they land in `out/stills/<id>/` inside the folder you run from, unless you pass another `--out`):

```
echo '{"MY01-SlowPushViolin": [0.15, 5, 9.85]}' > plan.json
node render.mjs --stills-plan plan.json --out out/stills --subframes 4 --scale 0.5
python3 tools/stills-sheet.py out/stills/MY01-SlowPushViolin out/MY01-sheet.jpg 3
```

The last line puts the stills on one labelled sheet. Run the eye pass on it (eight questions, `docs/qa-engine-side.md`, section 4). Look at the real frames. In a close-up, check that the head is not cut by the top edge.

## Step 9. The motion check

```
ONLY=MY01 tools/motion.sh
```

It checks any id that looks like two to six capital letters and two digits, so your prefix works without editing the tool. If nothing matches it stops with an error and a non-zero exit, so a typo cannot pass silently. Run it for any scene with moving people. It tests touch, sinking, foot slide and head steadiness (`docs/physics-and-motion.md`, section 7). `STRICT=1` makes a note exit non-zero.

## Step 10. Look before you render

Look at the one-per-shot sheet. If the story is not clear from the sheet, fix the shot list, not the render.

## Step 11. Render the video

A preview you can watch, with the camera report in the bar:

```
node render.mjs --videos MY01-SlowPushViolin --out out/preview --scale 0.5 --subframes 5
```

The clean reference clip for a video model has stand-ins instead of bodies, no bars or text, and no sound. One script does the render and the 21:9 crop:

```
tools/render-pill.sh MY01-SlowPushViolin                      # the pin (default): .work/out/pill/MY01-SlowPushViolin.pill.mp4
tools/render-pill.sh MY01-SlowPushViolin --standin capsule    # the single capsule: ...capsule.pill.mp4, never overwrites the pin
```

The pin is the stand-in to use for a close-up: the capsule is a wide dome that fills over half the frame and can run off the top at the end of a push in. The first gallery clips (75 of the shipped `pill.mp4`) used the capsule. By hand, the same thing is `node render.mjs --videos <ID> --out raw --clean --boxes --subframes 5 --scale 0.6667` followed by `ffmpeg -i raw/<ID>.mp4 -vf "crop=1280:534,fps=24" -fps_mode cfr -an <ID>-ref.mp4`.

Add `--no-scenery` for an object shot or a story, so there are no trees or props to copy. For a drawn-sheet route, add `--storyboard --boxes`.

## Step 12. Check the clip

```
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,duration -of csv=p=0 .work/out/pill/MY01-SlowPushViolin.pill.mp4
```

It must show one `video` stream (no audio stream), 1280 by 534, 24/1, and a duration under 29 s: keep every reference under 29 s (the earlier hosted API used in the original tests refused exactly 30.00 s; see `docs/tein-endpoint.md`). A reference has to be at least 2 s long, and the frame rate between 24 and 60. Then look at the first frame, a frame in the middle and the last frame, and check that no stand-in sits inside a wall, no bar or text shows, and the camera moves. Then run `python3 tools/clip-motion.py <clip>`. It compares the first, middle and last frame as grey 320 px images and prints the three differences. If the largest is under 8.0 grey levels the clip has no camera motion and is never generated. A very slow push can land near the line (a real 10 s push in gave 8.05, 9.26 and 14.33): when the largest is close to 8.0, look at the frames.

Then stop. Writing the prompt, planning the payload and sending are separate steps. Sending needs the cost shown and an explicit yes.

## Adding to the library

**A new environment.** Add a `Location` in `src/templates/locations.ts` (name, sky, key direction, light plan, palette, `build`). Add its row to `ENVS` with an id like `25-name`. Put the reference picture and its text in `environments/` and in `moods.json`, then update `src/templates/environments.generated.ts`. There is no generator script in the repo, so edit it by hand. UNPROVEN that a script ever existed; the header says it was generated from `moods.json`. Add the template ids to `PLACE` in `studios.ts` (it only maps CAM and ANG ids). Keep the set grey, with no ceiling, and clear of walls for 12 m.

**A new stand-in colour.** Add the tint to `TINT` in `kit/clay.ts` and to `CAPSULE` in `standins.ts`. Keep one colour per character everywhere.

**A new prop.** Add a function to `PROPS` in `kit/actors.ts` that returns an `Object3D` with its origin at the base. If it has a head or a point of interest, add its height share to `PROP_EYE`. Wrap it with `shadeAll`. Tag loose detail with `dress()`. Give it a `label` colour if it acts in a scene.

**A new rig.** Add a function to `kit/rigs.ts` that returns `(t) => Cam`. It must be a pure function of time, aim with `aimFor`, use `prog(t, t0, t1, hold)` for the holds, and keep one dominant axis. If the support has its own float, add a keyword to `rigKind` and a row to `FEEL` in `camera.ts`.

## Worked example with your own set (type-checked; UNPROVEN that it renders)

Use this only when the lab set is not enough. `src/templates/own.ts`. A person stands facing a wall with a door in it. The camera pushes in from a medium shot to a medium close-up.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { rig } from "../kit/rigs";
import { GREY, clay } from "../kit/clay";
import { ground } from "../kit/props";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

const info: TemplateInfo = {
  id: "OWN01-DoorPush", name: "Door push",
  says: "Something behind the door matters more than the person in front of it.",
  use: "The beat before someone opens a door.",
  numbers: "50 mm, MS to MCU on a dolly over 7 s, still for 0.8 s at both ends, eased.",
  avoid: "Pushing on a person who has nothing to look at.",
};

const block = (w: number, h: number, d: number, x: number, y: number, z: number, hex: string) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(hex, 0.92));
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
};

const actors: ActorSpec[] = [
  { id: "ALEX", name: "Alex", kind: "human", tint: "ochre", path: [{ t: 0, at: [0, 0], yaw: 0 }],
    acts: [{ kind: "lookDown", t0: 2.5, t1: 4.5 }] },
];

const spec: SceneSpec = {
  id: info.id, title: info.name.toUpperCase(), sky: "studio", actors,
  build: (w) => {
    w.add(ground(200, 0, 200, GREY.ground));          // a flat floor
    w.add(block(6, 3, 0.3, 0, 1.5, 4.5, GREY.set));   // the wall, 4.5 m in front of him
    w.add(block(1, 2.1, 0.32, 0, 1.05, 4.5, GREY.dark)); // the door
  },
  motes: { center: [0, 2.5, 2], size: [12, 5, 12], count: 120 },
};

const shots = (P: ReturnType<typeof planner>): ShotDef[] => [{
  start: 0, end: 7, label: "50mm  PUSH IN · MS TO MCU", rig: "DOLLY",
  subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 2.8,
  cam: rig.dolly(P("ALEX"), { size: "MS", mm: 50, deg: 28 }, "MCU", 0, 7, 0.8),
  cut: "Opens the template",
}];

CAMERA_INFO.push(info);
export const OWN_TEMPLATES: Piece[] = [scenePiece(spec, shots(planner(spec)), { scene: info.id })];
```

Register it in `src/templates/index.ts`:

```ts
import { OWN_TEMPLATES } from "./own";
// add ...OWN_TEMPLATES to the array that builds TEMPLATE_PIECES
```

The pieces of the file:

- `info` is the gallery card. `numbers` is written from the shot below.
- `block` makes a grey box with `clay`, the matte material of the kit.
- The actor is one person with one tint and a single mark. The act `lookDown` turns the head down between 2.5 and 4.5 s.
- The scene gives the id and title, the sky preset `studio`, the actors, a `build` that adds a flat floor, a wall and a door, and 120 motes for the moving layer.
- The shot copies CAM03's dolly. `rig.dolly(subject, start frame, end size, t0, t1, hold)` travels along one line from MS to MCU on 50 mm, from 0 to 7 s, still for 0.8 s at both ends. The camera therefore moves from 0.8 s to 6.2 s.
- `scenePiece` makes the piece from the scene and the shots. The duration is 7 s, which is 168 frames at 24 fps.

Calc from the framer constants: MS on 50 mm puts the camera about 2.8 m from the eyes, and MCU on 50 mm about 1.8 m. So the end of the push stays outside the 1.5 m face distance. CU on 50 mm would put it near 1.4 m and fail the `DIST` check.

Run the measured pass, then the stills, then the eye pass, then the video. If the DIST check or a SIZE row fails, change the numbers in the shot, not the check.
