# The failure ladder

Every input to Seedance that was tried before the pill, in the order it was tried, with the clip that shows it and what broke. Each rung fixed one thing and broke another. The ladder is the reason the pill looks the way it does.

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`. Credits: 1,000 credits is about $1. The original tests ran on an earlier hosted Seedance API; the clip files named below are the ones shipped in `release-media/`, and the run files they came from are measured on the author's runs, not included.

The decision pages that argue each point: `docs/why/why-not-people.md`, `docs/why/why-capsules.md`, `docs/why/why-the-set-stays-coarse.md`, `docs/why/why-video-first-sheet-second.md`.

## Ladder 1: video input, the alley fight (SC07, 16 s, six shots)

Each draft cost 2,332.8 credits (measured on the author's runs, not included). Clips are in `release-media/SC07-AlleyFight/`.

| # | Input | Clip | What came back | What broke | What it taught |
|---|---|---|---|---|---|
| 1 | clay mannequin video | `looks/clay-A-video-out.mp4` | right camera, right cuts, right alley | bodies fight like game characters | the video carries the body motion |
| 2 | clay video plus a face photo | not included | the right face | punches still move like the grey figures | a photo fixes the face, not the motion |
| 3 | fighters as pencil outlines | `looks/pencil-V2-out.mp4` | real alley, right face | still a mannequin fight | a drawing of a mannequin moving is still a mannequin moving |
| 4 | empty set, camera only | `plate-made.mp4`, `looks/plate-VP-out.mp4` | the most natural movement and realism | people in the wrong places | with no body the model has no spot to use |
| 5 | soft grey ghost silhouettes | `looks/ghost-VG-out.mp4` | people in the right places, facing right | original motion still preserved | a silhouette that keeps the pose keeps the motion |
| 6 | striped pills with a white dot | `looks/boxes-VB-out.mp4`, `result.mp4` | real alley, real punches, the same six shots | nothing | mark the spot and the facing, nothing else |

One variant did not pass the filter: the whole-frame ink video of the fight, drawn with unclothed outlines, was refused twice as NSFW. Only the pencil-on-figures run is shown as rung 3.

The same ladder on a second shot, the ACT01 jump with the camera circling, gave the same order of answers (`release-media/ACT01-BulletTimeOrbit/`; `video-cam-video.mp4` is the video-input run).

### Boxes and the black bar were never sent

Plain boxes (said to read as crates) and a black facing bar (said to read as a door) were never sent to Seedance: a check of every sent clip found no plain-box clip. The file named `boxes-clip.mp4` in the run records holds striped pills (the flag is still `--boxes`, a leftover from that stage). Both ideas were rejected by looking at the 3D render: a stand-in that looks like the set's own boxes needs a pattern, and an unexplained black mark is a distraction. Treat them as design rejections, not tested failures.

## Ladder 2: frame sheets, the ACT01 jump

Cost per draft for a 7 to 8 s clip is about 855 to 1,000 credits. Clips are in `release-media/ACT01-BulletTimeOrbit/`.

| # | Input | Clip | What came back | What broke |
|---|---|---|---|---|
| 1 | 12 clay frames | `looks/clay-E-sheet12-out.mp4` | cone pines, a board-game plaza | a still frame is copied for its look |
| 2 | the same, with shadows and a chequered floor | `sketch-cam-sheet.mp4` | the chequers came back on the floor and the columns | marks make leaks worse |
| 3 | the same, told in the prompt it is "a layout diagram" | `sketch-opt-sheet.mp4` | cones | the prompt does not cancel the picture |
| 4 | the set blurred, the pill sharp | `sketch-blur-sheet.mp4` | real cypresses and columns | taught the rule: the model copies visible detail |
| 5 | an ink drawing with scenery | `ink-sketch-ink2-act01.mp4` | neat cones and round topiary | the model traces drawn trees too |
| 6 | an ink drawing with almost no background | `ink-sketch-ink3-act01.mp4` | real trees, a real plaza | worked |

Frames of rungs 1, 2, 4, 5 and 6 were checked; rung 3 is from the run record. The order is the order in which they were run; earlier summaries had it wrong.

A hand-redrawn storyboard made with an image model (`looks/hand-G-sketch-out.mp4`) gave the best-looking jumps of any sheet and did not move the camera. An edge-traced line sheet turned bodies into blobs with square holes and was dropped for the engine's own ink look (`engine/cinematic/src/ink.ts`).

## Ladder 3: the stand-in after the pill

| Step | What | What broke | Fix |
|---|---|---|---|
| fitted capsule | a capsule fitted to each body's joints, up to 0.9 m across | read as a giant dome; shots came out 0.4 to 0.65 times the intended size | the pin (below) |
| pin | a small striped head with a white dot on a shoulder-width striped body | none in the tests after | adopted for CAM17 to CAM48 and the stories |
| pin with legs, boots, hands | added for a feet shot | the stand-in must carry position, size and facing only | removed; see `docs/why/why-limbs-never.md` |

The liked dust takes (CAM25 and CAM42) were made on the pin (`release-media/CAM25-ArcAndRise/v10-cam25-t.mp4`, `release-media/CAM42-DroneDive/v6-cam42-t.mp4`, checked frame by frame). CAM42 on the dome is `release-media/CAM42-DroneDive/v4-cam42-t.mp4`. The two stand-ins are defined in `docs/engine.md`, section 11.

## Ladder 4: the set

| Step | What broke | Fix |
|---|---|---|
| detailed clay set | cones, balls, plain blocks copied | rebuild-the-set line; no scenery |
| set with mood light, halos, beams | the set must stay a blockout | `MOOD_LIGHT = false` |
| clay props that fly (explosion) | clay lobes of the fireball copied | no-debris reference, then coloured blocks |
| 4-panel environment sheet as an image | copied layout, "inside the table" | words only; one mood panel at most |

## Notes on the record

- The blurred subject did not come back as two smudges: the people came back as normal people with the motion preserved.
- The blurred set did remove the cones (rung 4 of ladder 2).
