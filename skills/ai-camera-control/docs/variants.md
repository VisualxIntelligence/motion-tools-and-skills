# The variants: every way a previs was sent to Seedance

A "variant" is what the previs looks like when it goes into Seedance, as a video or as a sheet of frames. Thirteen are listed, and 11 of them were sent to Seedance. One is the default (the pill video), one is the fallback (the drawn sheet with no scenery) and one is a special case (camera only). The rest are on the failure ladder (`docs/failure-ladder.md`).

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`. The four moves shown in every look are ACT01 bullet-time orbit, CAM06 orbit, ONE01 crane to follow to whip, and SC07 alley fight (`release-media/<ID>/looks/`). Stand-ins are defined in `docs/engine.md`, section 11.

## Table

| # | Variant | Render flag | What it keeps | What it loses or leaks | When to use | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Pill video** (the default) | `--boxes`, with `--no-scenery` for object shots | exact camera, cuts, clock, spot, size, facing | needs the three realism lines in the prompt | any shot where the cut must land on a frame | the method; 9 of 9 cuts on the 30 s film; 53 of 54 templates passed (measured on the author's runs, not included) |
| 2 | **Pin video** | same, current stand-in | as 1, with a person-sized read | none found | every new clip | replaces the fitted capsule |
| 3 | Clay mannequin video | none (the old default) | camera, cuts, timing | copies stiff body motion, set shapes, specks | do not use for people | robotic motion; replaced |
| 4 | Clay video plus photo | none | adds the face and a real place | motion still stiff | do not use | fixes the face only |
| 5 | Plain tall boxes | none | placement | never sent; rejected on sight as too like set crates | do not use | design rejection, not a measured result |
| 6 | Striped box with a black facing bar | none | placement, facing | never sent; rejected on sight as unexplained | do not use | replaced by the white dot |
| 7 | Ghost silhouette video | `--ghost` | places, size, timing | the silhouette keeps the pose, so motion is preserved; one copyright rejection that passed on retry | do not use | judged a good balance at first, rejected after the pill tests |
| 8 | **Camera-only plate** | `--plate` | the freest, most natural movement | the subject lands in the wrong place | only when the subject's spot does not matter | usable, a little unpredictable |
| 9 | Pencil on the figures, video | `--pencil` | camera | stiff joints still copied | do not use | no fix |
| 10 | Whole-frame ink video | `--storyboard` | camera equal to the clay video | unclothed outlines in a fight were blocked as NSFW | no | option, rarely |
| 11 | Ink sheet with scenery | `--storyboard --boxes` | look and angles | traces drawn trees as cones | no | rejected |
| 12 | **Ink sheet with no scenery** | `--storyboard --boxes`, scenery tagged `dressing` | angles, people, look, story; cheaper | no clock: cuts drift 0.2 to 0.8 s | free interpretation, rough 3D, lower cost | the sheet route; scenery is what the model copies |
| 13 | Clay frame sheet (6, 9 or 12 frames) | stills of the clay render | loose arc of the move | copies clay look, cones, specks as snow | do not use | copies the clay look |

Also tried and not on the list: a hand-redrawn storyboard made with an image model (best-looking poses, no camera move), an edge-traced sheet (blobs), the 4-panel environment sheet (`docs/why/why-words-beat-a-specific-video.md`).

## The details that matter for each

**Pill video.** `engine/cinematic/tools/render-pill.sh <ID>` renders with `--boxes --clean --subframes 5 --scale 0.6667` and crops to 1280 x 534 at 24 fps, no sound (`crop=1280:534`, centred, which is the same as `crop=1280:534:0:93`). The first gallery clips were rendered with `--no-blur` instead of sub-frames. Check that no black row is left at the top after the crop. Keep references under 29 s (the earlier hosted API used in the original tests refused exactly 30.00 s). The pills carry fixed colours, so prompts can name them. See `docs/why/why-capsules.md`.

**Pin.** A small striped head with a dot on a shoulder-width striped body, body width capped at 0.5 m and depth at 0.34 m. Re-render every blockout after a stand-in change: do not reuse an old dome (capsule) clip for a close shot. The motion-blur sub-frames swap in the pin too; before that was fixed the mannequin showed in the blend frames.

**Camera-only plate.** Camera-only clips gave the best movement and realism of all the video tries, and the subjects landed in the wrong places. In the bullet-time plate the jump started early, in the air at 1 s while the clay figure was still crouched. In the orbit plate the person was bigger and further right at 3.5 s. Use it only when the subject's spot does not matter. The clips are `release-media/CAM06-Orbit/plate.mp4` (the empty previs) and `plate-made.mp4` (what it made), and the same for ACT01 and SC07.

**Ink sheet with no scenery: the recipe.**

- Render: `--storyboard --boxes`. Ink line on white paper. No scenery (trees, rocks, bushes, lamps and benches are tagged `dressing` and left out). No rendered shadows. No colour wash. Ground, the structures the action uses and the pills stay.
- Each person is a pill filled with its own colour and stripes, a full black outline of its own (without it two overlapping pills merge into one colour), and a drawn face circle that shows only when the camera is in front. A pill in front of the lens still gets its colour, and stays drawn even when the camera sits inside it. In a dark room the colour test uses relative strength.
- Props get a flat label colour, not stripes (case orange, drone cyan), and the prompt maps "the orange shape" to the real object.
- Layout: 12 panels for a single shot, cut 3 across by 4 down so the aspect is 1.77. Aspect must stay between 0.40 and 2.50. A first 4 x 3 sheet of 2590 x 825 (aspect 3.14) was refused by the earlier hosted API used in the original tests. For the 30 s film the sheet had 30 panels, 3 per shot (start, middle, end), one row per shot, 3880 x 5450, aspect 0.71.
- The face photo is always attached.
- The prompt opens with the real place, says the drawing shows only where the camera is and where people stand, names every drawn shape as its real object, writes each panel as real footage, and reads left to right, top to bottom.
- Builder: `tools/seedance/drawn_batch.py` (repo level).

**Pencil, ink and ghost as video.** All three followed the camera as well as the clay video did and copied the body motion just as much. The gallery shows each next to what it made.

## What each look made, on the four moves

Shown on the gallery's "Sketches" cards. Present means the folder `release-media/<ID>/looks/` has the input and the result.

| Look | ACT01 | CAM06 | ONE01 | SC07 |
|---|---|---|---|---|
| pills (main card) | yes | yes | yes | yes |
| ink video | yes | yes | yes | no (blocked) |
| ink sheet | yes | yes | yes | yes |
| pencil video and sheet | yes | yes | yes | yes |
| ghost | yes | no | no | yes |
| empty plate | yes | no (own camera-only card) | no | yes |
| clay video, 6-frame and 12-frame sheets | yes | yes | video and sheet | video and sheet |
| hand-drawn storyboard | yes | yes | yes | yes |
| pill (`boxes`) look | no | yes | no | yes |

Plain boxes and the black bar have no row because nothing was sent.

## Contact sheets

Two things are called a contact sheet. The review sheet (12 panels, labelled with shot, lens and move) is for people and was never sent. The sheet that was sent to the model is the plain drawn sheet (30 panels for the 30 s film). The gallery shows the sent file wherever one exists.

## Cost of the two main routes

A video bills input plus output seconds. A sheet bills output seconds only. A 7 s draft is 1,021 credits from video and 855 from a sheet. A 30 s draft is 4,228 and 3,544. Details are in `docs/why/why-video-first-sheet-second.md`.

## Run it

From the ink and pill clips of a template to a 12 or 30 panel sheet: `tools/seedance/drawn_batch.py` (the commands for CAM06-Orbit are in `tools/seedance/README.md`, "Sketch sheet"). It refuses a sheet whose aspect is outside 0.40 to 2.50. The builders `tools/seedance/lean_v3.py` and `gallery_v4.py` and the gates `qa3.py` and `qa4.py` take a template id and a scene JSON.
