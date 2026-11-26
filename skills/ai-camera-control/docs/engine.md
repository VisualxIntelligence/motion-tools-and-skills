# The engine

`engine/cinematic` turns a plain 3D scene into a video. It draws a coarse blockout with a camera move, a striped stand-in for every person and a grey set. The video is then sent to a video model as a reference for the camera, the cuts and the timing. This page describes what the engine is made of and how to run it. The other pages in this folder cover writing your own template, the camera language, the motion rules and the checks.

Every statement here comes from the code in `engine/cinematic` or from a measurement. Anything that could not be shown from the files is marked UNPROVEN, with the test that would settle it. Commands that start with `tools/` run from `engine/cinematic` and mean `engine/cinematic/tools/` (section 3 lists both `tools/` folders). The shell scripts (`#!/bin/zsh` and `#!/bin/sh`) were tested on macOS; the Python tools that draw labels load macOS system fonts (Arial) and need a font path on other systems.

## 1. The rule everything follows

A frame is a pure function of time. Nothing is played or simulated while rendering. Positions, poses, physics and the camera are all read from tables or formulas at the time `t` of the frame (`src/util.ts` header, `src/kit/rig.ts` header). Remotion renders frames out of order and on several workers, so a frame that depended on the one before it would be wrong. This is also why two renders of one template are identical.

## 2. The stack

| Part | Version in the repo | Used for |
|---|---|---|
| Remotion | 4.0.522 (`remotion`, `@remotion/bundler`, `@remotion/renderer`, `@remotion/three`) | frame loop, still and video output |
| three.js | 0.170.0 | the 3D scene |
| React | ^19.3.0 | Remotion components |
| Chromium | the one Remotion downloads, started with `gl: "angle"` | WebGL in headless mode |
| esbuild | 0.28.1 | bundling the Node tools (frame check, motion check, camera path) |
| Rapier (`@dimforge/rapier3d-compat`) | 0.14.0 (Apache-2.0) | physics, baked once |
| three-gpu-pathtracer | 0.0.23 | path-traced stills only |
| Python 3 with Pillow and numpy | pinned in `tools/seedance/requirements.txt` (repo level) | contact sheets, gallery, QA scripts |
| ffmpeg and ffprobe | not pinned | cropping the clean clip, checking clips |

The path tracer is pinned to 0.0.23 because later versions need a newer three.js (0.0.24 needs three.js r180, 0.0.25 and later need r185). Path tracing runs on stills only. A frame takes about 45 s at 128 samples.

`engine/cinematic` has its own `package.json`. Run `npm install` in that folder (section 14).

## 3. Folder map

```
engine/cinematic/
  render.mjs                 the renderer: stills, stills plans, videos, the film
  src/
    Root.tsx, index.ts       one Remotion composition per piece
    Film.tsx                 the director: world, camera, post, stand-ins, slate, camera report
    pieces.ts, piece.ts      what a piece is; the list of pieces
    camera.ts                realCam (the camera that shoots a frame), measure (the HUD numbers), dof
    framer.ts, marks.ts      place a camera from subject, lens and shot size; read shot size back
    post.ts                  the pass chain
    shots.ts                 Cam, Shot, Plan, Size, Flag types (plus the Rootsong shots)
    standins.ts              the striped capsule and pin stand-ins
    ink.ts                   the ink, pencil and ghost looks
    trackmarks.ts            the 1 m checker (--marks)
    pathtrace.ts             path-traced stills
    util.ts                  easing, noise, Hermite tracks, lens(), ASPECT
    kit/
      rigs.ts                the named camera moves
      stage.ts               SceneSpec, ShotDef, scenePiece, planner, speedRamp, KitWorld
      actors.ts              Actor, paths, acts, props that act
      rig.ts                 the captured-motion mannequin (about 80 clips), gaits, stride tables
      physics.ts, bakes.json baked Rapier tables
      clay.ts                grey and tint palettes, skies, lights
      props.ts, creatures.ts set pieces
      pill.ts                the product stand-in
      filmpaths.json         33 camera moves distilled from a film dataset
    templates/               every template (see answers/E-template-catalog.md)
  tools/                     engine/cinematic/tools: render, checks, sheets, gallery, baking, camera path (below)
```

There are two `tools/` folders:

| Folder | What is in it |
|---|---|
| `engine/cinematic/tools/` | Everything that runs the engine: `render-pill.sh` (a template to a reference clip), `render-templates.sh` and `render-locked.sh` (whole-library and rate-limited renders), `check.sh` and `frame-check.ts` (the measured frame pass), `motion.sh` and `motion-check.ts` (the motion pass), `camera-path.sh` (the camera measured second by second), `bake.sh` (physics), `clip-motion.py` (does a clip move), the sheet and gallery makers (`draw-sheet.py`, `template-sheets.py`, `build-gallery.py`, `stills-sheet.py`, `cinematic-board.py`), the Seedance prompt helpers (`seedance-realism.py`, `seedance-dialogue.py`, `export-seedance*.py`, `inject-seedance.py`) and `filmpaths/` (distils the camera moves from the E.T. dataset). |
| `tools/` (repo root) | Work on the repo, not on the engine: `check_repo.py` (the pre-publication check), `extract_templates.py` (copies each template into `templates/<ID>/`), `make_previews.py` (README GIFs), `package_release.sh` (zips `release-media/`), `seedance/` (prompt builders and prompt and video checks, no network), and maintainer builders that need the author's job folders and are not for contributors. |

The first film, Rootsong, and the files `world.ts`, `story.ts`, `shots.ts` and `figures.ts` that belong to it are kept because the framer, the camera types and the checks were built on them. Rootsong is not a template and is not part of the pill pipeline. The second film, Etherwake, was removed from the repo.

## 4. Frame geometry

| Quantity | Value | Where |
|---|---|---|
| Frame rate | 24 fps for every new piece (`DEFAULT_FPS`). Rootsong keeps 30. | `src/piece.ts` |
| Composition | 1920 x 1080 | `src/Film.tsx` |
| Picture | 2.39:1, 1920 x 804, with a bar of 138 px above and below | `Film.tsx` (`PIC_H`, `BAR`) |
| Shutter | 180 degrees: the sub-frames of a frame cover half a frame time (`open = 0.5 / fps`) | `Film.tsx` |
| Sensor | 36 mm wide (full frame), cut to 2.39:1 | `src/camera.ts` (`SENSOR_W`), `src/util.ts` (`lens`) |
| Lens | `mm` is full-frame. The vertical field of view is `2 atan(36 / 2.39 / 2 / mm)`. | `src/util.ts` |
| Clean clip for a video model | `tools/render-pill.sh` renders with `--boxes --clean --subframes 5 --scale 0.6667`, then crops to 1280 x 534 (centred) at 24 fps with no audio. The sub-frames average the shutter, so the frames are sharp enough without `--no-blur`. | `tools/render-pill.sh`; the shipped clips are 1280 x 534, 24/1, one video stream |

The slate goes in the top bar and the camera report in the bottom bar, never over the picture. `--clean` removes both, plus titles and subtitles.

A 35 mm lens in this engine is a full-frame 35 mm, with a horizontal field of view of 54.4 degrees. The camera rulebook in the skill uses Super 35 (24.89 mm wide), where 35 mm gives 39.1 degrees. The same lens therefore looks about 1.4x wider in the engine than the rulebook tables suggest. See `docs/camera-language.md`, section 2.

## 5. Running it

All commands run in `engine/cinematic`. They write to `--out`, or to `./.work/out` (set `CAMERA_CONTROL_HOME` to move it). The shortest path to a pill clip is `tools/render-pill.sh <ID>`, which renders with `--boxes --clean`, then crops to 21:9 (1280x534), 24 fps, no sound.

```
node render.mjs --stills 3,21,31.5 --id <PieceId>        stills at those seconds
node render.mjs --stills-plan plan.json --out dir        {"<id>": [seconds, ...]} -> dir/<id>/t_SSS.SS.png
node render.mjs --videos id1,id2 --out dir               dir/<id>.mp4 for each id, in one bundle
node render.mjs --id <PieceId> --out file.mp4            one film (optionally --from s --to s)
```

Flags, from `render.mjs` and `Film.tsx`:

| Flag | Effect |
|---|---|
| `--id` | the piece (default CAM06-Orbit) |
| `--standin capsule\|pin` | which stand-in `--boxes` draws: the pin (default) or the capsule, the single striped dome of the first gallery clips (section 11) |
| `--out` | output folder, or output file for a film |
| `--scale k` | render at k times 1920 x 1080 (`--videos` default 0.5, stills default 1) |
| `--concurrency n` | parallel browser tabs (film default 2, `--videos` default 3) |
| `--subframes n` | render each frame n times across the 180 degree shutter and average them in HDR. The count is raised automatically from measured screen motion, up to 48, so no copy lands more than about 2.5 px from the next. |
| `--no-blur` | no camera motion blur (sharp frames for a video model) |
| `--pathtrace n` | path-traced still with n samples (stills only; 128 for hero stills) |
| `--clean` | picture only: no slate, report, subtitles or titles |
| `--no-slate`, `--no-report` | hide one of them |
| `--boxes` | stand-ins: each person is replaced by the striped pin (see section 9) |
| `--storyboard` | the whole frame drawn as ink on white paper. With `--boxes` the set is ink and the pin stays a real lit 3D object. |
| `--pencil` | only the figures redrawn in pencil over the normal render |
| `--ghost` | each figure becomes a soft limbless blur |
| `--plate` | the people are left out; set and camera only |
| `--no-scenery` | hides everything tagged `dress()` (trees, rocks, bushes, lamps, benches, thrown debris) |
| `--marks` | a soft 1 m checker on every set surface. Kept for completeness. It made video-model references leak a chessboard, so never use it for a reference. |
| `--loosen k` | every framed shot stands k times further back. Default 1. |
| `--from s --to s` | render a time range of a film |

Fisheye is not a flag. A shot asks for it with `fish: 0..1` on its `Cam` and a very wide lens (4 to 10 mm). The template ANG22 uses 8 mm with `fish: 1`.

Encoding: `--videos` writes H.264, crf 20, yuv420p. A single film writes H.264, crf 17, preset slow.

Environment variables read by the engine and its scripts:

| Variable | Default | Meaning |
|---|---|---|
| `CAMERA_CONTROL_HOME` | `engine/cinematic/.work` | where output (`out/`) and scratch go. `KEYFRAMES_ROOT` is read as an older name for it. |
| `CINEMATIC_PUBLIC` | `engine/cinematic/public` | Remotion public folder; holds `kit/UAL1_Standard.glb` and `kit/UAL2_Standard.glb` |
| `CAMERA_CONTROL_OUT` | `<home>/out/<id>` | default output folder of a film |
| `RENDER_SLOTS` | 3 | how many `tools/render-locked.sh` renders may run at once |
| `STEPS`, `IDS`, `OUT`, `STILL_SUB`, `STILL_SCALE`, `BOXES`, `INK`, `RENDER_TMP` | see `tools/render-templates.sh` | the whole-library pipeline |
| `BROWSER_LOG` | unset | print the browser console during stills |
| `REMOTION_SLIM` | on | set to `0` to skip the first size clamp in pin mode (the sizes are in section 11). For the wide capsule use `--standin capsule`. |
| `PIECE` | none (required) | which template `tools/check.sh` checks, for example `PIECE=CAM06-Orbit` |
| `ONLY` | all | which ids `tools/motion.sh` checks (prefix match) |

The whole library in one command is `tools/render-templates.sh` with the steps `bake info stills videos gallery pathtraced`. Stills use `--subframes 4 --scale 0.5 --concurrency 3`. Videos use `--subframes 5 --scale 0.5 --concurrency 4`. Heroes use `--pathtrace 128 --concurrency 1`. With `BOXES=1` the people are drawn as the stand-in, with `INK=1` the set is drawn in ink.

`tools/render-locked.sh` takes the same arguments as `render.mjs` and lets at most `RENDER_SLOTS` renders run at once, so parallel jobs share the disk and memory. A slot held for more than 20 minutes counts as stale.

Measured render times: a clean checkout rendered CAM06-Orbit (7 s, `tools/render-pill.sh`) in 11 s; 32 angle clips rendered with 3 sub-frames in about 20 s each while other jobs ran. A full re-render of the 54 first templates (303 stills and 54 videos) was estimated at about 1.5 hours; that figure is an estimate, not a log.

## 6. The pass chain

`src/post.ts`. The order, for one frame:

1. Scene to an HDR target (half float, 4x MSAA). With `--subframes n`, n sub-frames are averaged first as a running mean.
2. Ambient occlusion from depth: 20 samples on a disk of 0.6 m world radius, rotated per pixel, strength 0.9 in templates. It gives the clay look.
3. Depth of field, only for shots that declare a stop: a thin-lens circle of confusion from the focal length, the T-stop and the focus distance, gathered with 48 samples on a Vogel disk, at most 26 px radius. A sharp sample in front never bleeds into a blurred one. Bright points become bokeh discs. The circle of confusion constant is 0.03 mm on a 36 mm sensor.
4. Bloom: a bright pass, then two rounds of a separable blur at quarter resolution. Templates use 0.06 by default.
5. The composite shader: camera motion blur (up to 16 taps, used only when `--subframes` is 1), the fisheye remap if asked, bloom, exposure, ACES tone map, a light warm shift, a vignette of 0.28 at the corners, sRGB, and grain of 0.022.

The camera report reads the same numbers, so the lens, stop, focus, depth of field and move shown in the bar are the ones that rendered the frame.

## 7. The camera

A shot gives a function `cam(t)` that returns a `Cam`: position, target, focal length in mm, and optionally roll, shake and fish. `realCam` (`src/camera.ts`) adds the life of the support and returns the camera that shoots the frame.

- The path is the authored one, exactly. An operator spring was written first and then switched off because the camera lagged behind its keyframes: the spring loop in `realCam` never runs (`const n = -1`). The aim and the focus land on their marks.
- The support adds a small float, seeded and deterministic. The table is `FEEL` in `camera.ts`. Only `rot`, `pos`, `freq` and `bank` are in use today.

| Kind | Chosen when the `rig` label contains | Position float (m) | Rotation float (deg) | Frequency (Hz) | Banks into turns |
|---|---|---|---|---|---|
| crane | none of the others (default) | 0 | 0 | 0.35 | no |
| dolly | DOLLY, UNDERSLUNG | 0 | 0 | 0.5 | no |
| steadicam | STEADICAM | 0.006 | 0.06 | 0.3 | no |
| skiff | SKIFF, SHIP | 0.02 | 0.05 | 0.25 | no |
| drone | DRONE | 0.02 | 0.06 | 0.4 | 0.003 |
| fpv | FPV | 0.02 | 0.15 | 1.2 | 0.006 |
| handheld | HANDHELD, SHOULDER | 0.012 | 0.32 | 0.35 plus a 3.5 Hz tremor layer | no |
| locked | TRIPOD, LOCKED | 0 | 0 | 0.3 | no |

The label you write in `rig:` picks the float, so "TECHNOCRANE" gets the glassy default and "DRONE · GIMBAL" gets wind. A drone or FPV camera rolls into lateral acceleration, limited to 0.35 rad. Focus breathing makes the image grow by up to 1.2 percent as focus comes within 3 m.

`measure` (same file) writes the HUD: rig, lens, horizontal field of view, T-stop, shutter, focus distance and target, near and far limits of sharpness, background blur in pixels, shot size, vertical angle, side of the subject, tilt, dutch, and the move split into tracking, dolly, truck, boom, pan, tilt, whip and zoom with m/s and degrees per second. Every number is read from the rendering camera.

## 8. The framer

`src/framer.ts` places a camera from the subject, the lens and the planned shot size, so a planned medium close-up is one before anyone tunes it. The distance is `(frame height the size needs) x focal length / sensor height`, where the sensor height is 36 / 2.39 = 15.06 mm. The frame height comes from the figure's own landmarks, never from fixed fractions of its height:

| Size | Bottom edge sits | Rule |
|---|---|---|
| ECU | halfway from the eyes to the chin | eyes on the upper third, frame height = 1.5 x (eye height minus edge height) |
| CU | halfway from chin to chest | same |
| MCU | three quarters of the way from chin to chest | same |
| MS | 0.6 of the way from chest to waist | same |
| MWS | 0.06 of the way from thigh to ankle | same |
| FS, WS, EWS, INSERT | the figure fills 0.82, 0.5, 0.07 and 0.75 of the frame height | the figure is centred |

The landmarks of the standing mannequin (metres above the feet) are in `RIG_POSES.stand`: eye 1.64, top 1.78, chin 1.5, chest 1.2, waist 1.01, thigh 0.7, ankle 0.1. Sitting, kneeling and crouching have their own rows. `framer.ts` also measures the other way: `sizeIn` in `src/marks.ts` reads the shot size from where the frame's bottom edge cuts the ladder (chin, chest, waist, thigh, ankle, sole). A figure share of 0.72 or more is FS, 0.1 or more is WS, less is EWS.

The self-test is `tools/check.sh --framer`. It frames every figure at every size and prints what size came out and where the eyes landed.

## 9. The rigs

`src/kit/rigs.ts`. Each function returns a pure function of time. All of them hold still for a short time at both ends, ease in the middle and keep one dominant axis. `hold` is that time in seconds.

| Rig | What it does |
|---|---|
| `locked` | framed once, never moves (a tripod) |
| `panWith` | fixed position, the head follows the subject a little behind it |
| `tiltReveal` | fixed position, the head turns from point a to point b (a tilt or a pan reveal) |
| `zoom` | fixed position, only the focal length changes (a creep, or a crash zoom) |
| `dolly` | a push in or pull out along one line from one size to another |
| `dollyZoom` | travel and zoom together so the subject's size holds. Distance follows focal length (`frameHeight x mm / sensor`), never keyed apart. |
| `orbit` | round the subject from degree a0 to a1 at a held size, with an optional rise |
| `crane` | rise or fall by a height while the head keeps the subject; `dist1` swings out or in |
| `follow` | Steadicam behind (180) or leading (0), the operator a beat behind |
| `track` | alongside the subject, side-on, leading by a set distance |
| `ots` | behind one figure's shoulder onto another; the shoulder takes about a quarter of the frame |
| `truck` | slide sideways along a line, aim parallel (parallax) or held on a point |
| `whip` | hold shot A, swing to B's aim in 0.35 s by default; the position stays A's |
| `chase` | a drone behind and above a moving subject |
| `fpv` | low and close, quicker reactions, a weave |
| `chain` | several moves in one take, neighbours blended over `blend` seconds (0.8 by default) |
| `spline` | a keyframed path on a centripetal Catmull-Rom curve, eased once over the whole move |
| `snorricam` | bolted to the subject's chest, facing back at them |
| `shake` | an operator's hands on any move: seeded layers of slow drift and tremor. Amount 1 is calm handheld, 3 run-and-gun, 6 an impact. |
| `filmPath` | one of 33 camera moves from real films, replayed relative to the actor |
| `dive` | a fall or dive along a line with gravity's ease |

`filmPath` replays a camera path measured relative to the actor, scales it so the start distance frames the planned size, and re-aims it on the subject's eyes. The film's own aim is kept at 10 percent only, because operators frame 10 to 30 degrees off the body and a different body on a different lens would be lost.

Helpers: `framed` (a camera framed on a subject with size, lens, angle and a height off eye level), `around` (a direction from the subject: 0 is in front, 90 its left, 180 behind), `lag` (a point averaged over a short window, how an operator follows), `leadRoom` (eyes on the upper third and a third of space on the side the subject faces).

## 10. Actors

`src/kit/actors.ts`. An actor is data: a path of timed marks `{ t, at: [x, z] or [x, y, z], yaw? }`, optional acts, and an optional look target.

- Kinds: `human`, `giant` (1.75 x), `child` (0.62 x), `flyer`, `quad`, `prop`.
- Acts: `kneel`, `crouch`, `sit`, `drive`, `talk`, `point`, `palm`, `push`, `lookUp`, `lookDown`, `armsUp`, `fall`, and `clip` with any captured clip by name (Roll, Jump_Start, Punch_Cross, Hit_Knockback, Slide_Loop, ClimbUp_1m, Pistol_Shoot, Sword_Regular_Combo and more) played from `t0`, held on its last frame unless it loops. The two libraries hold about 80 clips in all.
- The heading follows the velocity. The step clock is integrated over the distance walked, so a figure does not skate or snap round. Walk, jog and sprint share one stepping clock, aligned so each clip lands the same foot at the same moment. The details and the measurements are in `docs/physics-and-motion.md`.
- A prop actor (`kind: "prop"`, `model` from `PROPS`) moves along a path like a person. Models include car, crate, barrel, ship, lamp, statue, pine, monolith, doorway, suitcase, bench, briefcase (opens), drone, sheet, shutter panel, fist, key, `pill` and `pillPerson`.
- A prop may carry `label`, a flat loud colour used in stand-in renders so a video model can name it (case orange, drone cyan).

The mannequin is the Quaternius Universal Animation Library 1 and 2 (CC0, one 65-bone skeleton). It is a faceless clay figure with about 80 captured clips. The files are `kit/UAL1_Standard.glb` (7.6 MB) and `kit/UAL2_Standard.glb` (8.1 MB). The engine needs them to plan and to check, even when the render shows only a stand-in.

## 11. Stand-ins

People in a reference video are not shown as a body. The body drives the plan (framing, motion check) and is never rendered in a `--boxes` render. In prose the stand-in is called the pill. There are two stand-ins plus the product pill.

| Name | What it is | Used for |
|---|---|---|
| Capsule | The first version: one striped dome fitted to the body's joints, as tall as the person, lower when they crouch, raised when they jump, flat when they fall. Up to about 0.9 m across in the close shots, which made the model read a giant dome and loosen the shot. | 75 of the shipped `pill.mp4` clips (the first 54 templates and the gallery) |
| Pin | The current one: a small head on a slim, shoulder-width body, both striped, the face dot on the head at eye height. Head 0.20 x 0.27 x 0.23 m. Body size is given below. | 62 of the shipped `pill.mp4` clips; every new clip |
| Product pill | A striped capsule at product scale: 24 cm tall, 6 cm radius. `pillPerson` is the same shape at 1.75 m tall and 27 cm radius. | product and famous-shot templates |

Pin size, in one place: the fitted body is limited to 0.5 x 0.34 m (`standins.ts`, first clamp, skipped with `REMOTION_SLIM=0`), and the drawn body to 0.46 x 0.28 m (second clamp). The capsule is not clamped.

`src/standins.ts` builds the capsule and the pin. The pin is the default. `--standin capsule` builds the capsule instead: one rounded body as tall as the person, as wide as the fitted box (arms included), a white dot on its front at eye height, bolder bands (about one stripe pair per 0.6 m). The capsule code was rebuilt from its description, because the original was not kept. A render of CAM06-Orbit at second 3 matches the published clip closely (a wide red capsule with a white dot, in the same place) but is not pixel-identical, and the stripe width differs. UNPROVEN that it reproduces every published clip frame for frame; the test is to render the 75 capsule templates with `--standin capsule` and compare frames with their shipped `pill.mp4`. `tools/render-pill.sh` renders the pin unless you pass `--standin capsule`, so the pill clip you render for a template may differ from the shipped `pill.mp4`; `sent.json` records which stand-in a shipped clip shows.

The stripes are diagonal hazard tape: one loud colour and near-black (`#141414`), 16 px bands in a 64 px tile, one tile per about 0.2 m of the part, so the pattern repeats about every 0.1 m. The face dot is off-white (`#f4f4f2`). One colour is fixed per tint so a prompt can name a person's stand-in from the tint alone.

| Tint | Colour | Name in prompts |
|---|---|---|
| ochre | `#e3261f` | red-and-black |
| slate | `#ffe600` | yellow-and-black |
| rose | `#1fa84a` | green-and-black |
| sage | `#1f5fe3` | blue-and-black |
| plum | `#d81fb5` | magenta-and-black |
| sand | `#ff7a00` | orange-and-black |
| stone | `#00c8d7` | cyan-and-black |

The pin is slim on purpose: the capsule made the close shots look closer than designed. `trunk` mode fits the stand-in to the trunk only, so a carried case stays outside it. A camera that sits inside a stand-in (an over-the-shoulder or point-of-view camera) hides that stand-in through `clearAround`.

There is no limb on a stand-in (`docs/why/why-limbs-never.md`). Rule: a shot about feet, hands or a stumble is built as a camera move and a pin, and the stride, the drag and the hands are written in the prompt.

In a `--subframes` render, the stand-ins are fitted to the people at every sub-frame and the people are hidden for that sub-frame, so a motion-blur render never draws a body.

## 12. Environments

The set stays coarse and colourless. Rooms have no ceiling so high and overhead moves can see in. Big moves go to open places (plaza, coast, rooftop, street).

- `src/templates/lab.ts`: the neutral camera lab plaza the first 54 templates use. A stone plaza of 17 m radius, a colonnade of 9 columns on the north half, a stair and terrace on the west, low walls, props, and trees, rocks and far buildings tagged as dressing.
- `src/templates/locations.ts`: 15 drawn locations (lake, mountain, street, forest, rooftop, road, rooms and more) and the 24 environments as `ENVS`. `MOOD_LIGHT = false` turns off every coloured light, halo and light shaft, so the sets are grey. The light code is kept behind that switch.
- `src/templates/studios.ts`: the `PLACE` table gives each of the 68 newer templates (CAM17 to CAM48, ANG01 to ANG40) one of the 24 environments. `stageFor(id)` returns the 3D set and `placeFor(id)` returns the name, the mood text and the reference picture.
- `src/templates/environments.generated.ts`: names and mood text of the 24, generated from `environments/moods.json`.

The mood and the light of a place come from the reference picture and the prompt, never from the blockout.

## 13. Physics

Physics runs once, in Node, and the render reads a table. `tools/bake.sh` runs `tools/bake-physics.ts`, which steps Rapier at 240 Hz and stores every body's position and rotation at 120 Hz in `src/kit/bakes.json`. Collision detection is continuous. The ground is a slab with friction 0.9. Bodies default to density 400, bounce 0.15 and friction 0.7. A body can wait still until a release time. A "driver" (a car on its path) pushes but is not pushed. `BakedSet` poses the clay meshes from the table, interpolating between samples.

Three scenes are baked today:

| Scene | Bodies | Frames at 120 Hz |
|---|---|---|
| SC07-crates | 7 | 1921 |
| SC09-kegs | 8 | 2641 |
| SC10-barrier | 25 | 1921 |

Re-run `tools/bake.sh` after changing a spec in `src/templates/physics-specs.ts`.

## 14. Running it on another machine

A clean checkout renders. Verified from an empty directory: the engine folder was copied there, `npm install` added 202 packages in 9 seconds, and `tools/render-pill.sh CAM06-Orbit` wrote a 7 s, 24 fps, 1280x534 pill clip. Needs: Node 22.12 or newer, ffmpeg, and network access once, because Remotion downloads a headless Chrome on the first render.

Where things are:
- Output and scratch go to `./.work` (override with `CAMERA_CONTROL_HOME`); no external drive is needed.
- The mannequin files are in `engine/cinematic/public/kit/`, with their CC0 licence text and `SHA256SUMS`.
- The three motion helpers the engine uses are in `src/motion.ts`.
- `engine/cinematic/package.json` lists the dependencies.
- `tools/render-templates.sh` and `render-locked.sh` use `./.work` and `$TMPDIR`.

The `tools/*.sh` scripts call the engine's own `./node_modules/.bin/esbuild`, so run `npm install` in `engine/cinematic` first. The slate uses system fonts (Menlo, Helvetica Neue); a `--clean` render does not draw it.

A render batch writes thousands of frames. Keep at least 3 GB free where the scratch folder is; the scripts do not check free space.

## 15. How a template is written

A template is one `Piece`: a scene (set, actors, light) and a list of shots (camera rig, lens, aim, timing). The files are `src/templates/*.ts`. Four types carry the fields.

`TemplateInfo` (the card in the gallery): `id`, `name`, `says` (what the move means), `use` (when to use it), `numbers` (lens, size, distances, speeds, time) and `avoid`. Scene templates add `pattern`, the coverage in words.

`SceneSpec` (`src/kit/stage.ts`):

| Field | Meaning |
|---|---|
| `id`, `title` | the piece id and the title on the slate |
| `sky` | one of the sky and light presets in `kit/clay.ts` (studio, day, dusk, space, interior, and the mood skies) |
| `keyDir` | direction of the key light |
| `look` | `bloom`, `exposure`, `warm` for this scene |
| `build(w)` | adds the set to the `KitWorld`; may set `w.paving(x, z)`, the height of the walking surface, so bodies stand on it |
| `actors` | the `ActorSpec` list (section 10) |
| `motes` | the moving layer: motes drifting through a box (centre, size, count, drift in m/s). Placeholders do not act, so something in every frame should move. |
| `tick(w, t)` | per-frame extras (a road running past a car) |
| `clock(t)` | the world's clock against the film's. Everything in the set runs on `clock(t)` while the camera runs on `t`. `speedRamp([[t, rate], ...])` builds one, so a speed ramp slows the action and a frozen moment can be orbited. |

`ShotDef`:

| Field | Meaning |
|---|---|
| `start`, `end` | seconds in the piece |
| `label` | what the HUD and the contact sheet print, for example `35mm  ORBIT 120` |
| `rig` | the support's name. It also picks the float (section 7). |
| `cam(t)` | the camera function, normally from `rig.*` |
| `subject` | the actor id the shot is about, or a function of `t` for a shot that changes subject |
| `size`, `sizeEnd` | the planned shot size, and the size a push or pull ends on. The measured pass checks them. |
| `focus(t)` | an actor id, or `[from, to, k]` to rack the focus from one actor to another as `k` goes 0 to 1 |
| `stop` | T-stop of the shot (default 2.8 in templates) |
| `ots`, `pair`, `reverse` | for over-the-shoulder shots: the foreground figure, the engaged pair whose line the cameras keep to one side of, and the id of the shot this one reverses |
| `flags` | deliberate exceptions, each switches off one check: `whip`, `short-side`, `cross-line`, `jump`, `compound`, `enters-moving`, `exits-moving`, `centre`, `wipe` |
| `cut` | how the film arrives in this shot, for the contact sheet |
| `shadow` | half the side of the key light's shadow square in metres (default from the size) |

`scenePiece(spec, shots, opts)` turns the scene and shots into a `Piece`: 24 fps, clay look, ambient occlusion 0.9, depth of field on, no fades, the camera report on. The duration is the end of the last shot. `planner(spec)` gives `P("ALEX")(t)`, the analytic landmarks of an actor at time `t` (eye, top, sole, ladder), so a camera can be planned before the world is built.

The helper `make(info, actors, shots, set?)` in `templates/cameras.ts` wraps all of that for single-move templates on the lab plaza: sky `studio`, `buildLab` as the set, 200 motes in a 40 x 6 x 40 m box centred 2.5 m up.

A new file exports a `Piece[]`, and `templates/index.ts` adds it to `TEMPLATE_PIECES`. `Root.tsx` then registers one Remotion composition per piece, so the new id renders at once.

### Worked example: CAM06 Orbit

This is the whole template from `src/templates/cameras.ts`, reformatted over several lines:

```ts
make({ id: "CAM06-Orbit", name: "Orbit",
  says: "Everything turns around this person: a standoff, a decision, a hero moment.",
  use: "A character at the centre of a turning point; showing the space around them in one move.",
  numbers: "35 mm, MS, 90–180° over 5–8 s (≤ 30°/s), eased, with a slight rise.",
  avoid: "Orbiting just for motion: it says this person is the axis of the scene." },
  [ALEX([{ t: 0, at: [0, 0], yaw: 0 }])],
  (P) => [{ start: 0, end: 7, label: "35mm  ORBIT 120", rig: "TECHNOCRANE ORBIT",
    subject: "ALEX", size: "MS", stop: 2.8,
    cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35, rise: 0 }, 20, 140, 0, 7, 0.6),
    cut: "Opens the template", flags: ["compound"] }]),
```

Read it line by line:

- One actor, Alex, stands at the origin facing +z. His path has one mark, so he never moves.
- One shot of 7 s. The rig label contains no float keyword, so the support is the default crane.
- `rig.orbit(subject, frame, a0, a1, t0, t1, rise1)` starts 20 degrees round from Alex's front, ends at 140 degrees (180 would be directly behind), over `t0` 0 to `t1` 7 s, and rises 0.6 m on the way. The default `hold` of 0.4 s means the camera is still for 0.4 s at both ends, so the arc covers 120 degrees in 6.2 s, which is what "ORBIT 120" means. The ease is cubic in-out.
- `{ size: "MS", mm: 35 }` makes the framer place the camera at the distance that gives a medium shot on a 35 mm lens (section 8). By the framer's constants that is about 1.9 m from the eyes (calc).
- `size: "MS"` tells the measured pass what to expect. `flags: ["compound"]` says an orbit moves along two axes by design, so the one-axis check is not applied.
- Average speed is 19.4 degrees per second. With a cubic in-out ease the peak is 3 times the average, about 58 degrees per second (calc). The text in `numbers` says "≤ 30°/s". Measure it with `tools/camera-path.sh CAM06-Orbit --step 0.1` before quoting either number.

The template as coded is 120 degrees at about 1.9 m. The code is the source of truth for every number on this page.

## 16. What is not in the engine

The engine never calls a video model, never sends anything and never spends credits. Sending is a separate step (`docs/tein-endpoint.md`).

It has no organic camera (spring operators, uneven speed), no inertialization instead of linear clip blends, no turn-in-place clips, no camera smoothness check (jerk limits) and no script that writes the camera's start, direction and end into the prompt automatically. `tools/camera-path.sh` prints the camera second by second and is the nearest thing.

## 17. Assets and licences

`NOTICE.md` is the one place that states every licence; this table only says where each asset is.

| Asset | Where | Licence or source |
|---|---|---|
| Mannequin and its clips | `engine/cinematic/public/kit/UAL1_Standard.glb`, `UAL2_Standard.glb`, with `LICENSE-Quaternius-CC0.txt` and `SHA256SUMS` | Quaternius Universal Animation Library 1 and 2, CC0 |
| Physics | `@dimforge/rapier3d-compat` 0.14.0, installed by `npm install` | Apache-2.0 |
| Path tracer, three.js, React | installed by `npm install` | MIT |
| Remotion | installed by `npm install` | its own licence, see `NOTICE.md` |
| Camera moves from films | `src/kit/filmpaths.json`, built by `tools/filmpaths/distil.py` | distilled from the E.T. dataset, see `NOTICE.md` |
| 24 environment pictures | `environments/*.png`, `moods.json` | see `NOTICE.md` |
| Slate and report fonts | CSS stack in `Film.tsx` | system fonts (Menlo, Helvetica Neue, Baskerville); not shipped; `--clean` does not draw them |

## 18. Known gaps in the code

Open items, to fix or document before you rely on them:

| Where | Gap |
|---|---|
| `tsc -p tsconfig.json --noEmit` | 2 errors in `templates/cameras.ts` line 19 (casts in `make`); they do not stop a render |
| `templates/famous/f02-explosion-walk.ts` header | says to render the pill with `--subframes 1` because more sub-frames draw the person. `Film.tsx` now swaps the stand-in in for every sub-frame, so the comment is out of date. |
| `templates/story.ts` | `STEPS` and `stepActors` (footprints and a drag scrape) are defined and never used. |
| `Film.tsx` header | says the camera report sits in the lower right of the picture. It sits in the bottom bar. The slate still prints `PREVIS` and `CLAY` in the top bar. |
| `camera.ts` `realCam` | the operator spring is switched off (`const n = -1`). `FEEL` fields `w`, `zeta` and `fw` are unused. |
| `tools/callouts.ts`, `aim-test.ts`, `keyframes-list.ts` | read the piece named in the `PIECE` environment variable (default `Rootsong`). |
| `tools/frame-check.ts`, `motion-check.ts` | exit code 0 on fails unless `STRICT=1` is set |
