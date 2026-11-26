# Why the reference has no person in it

Anything in the reference video that has a body will have that body copied. A mannequin gives stiff game-like motion, a drawing of a mannequin gives the same motion, and even a soft grey blur keeps the pose. The only things that worked were a reference with nobody in it (camera only) or a stand-in with no body (the pill).

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`.

## What happened with each person-like input

**A clay mannequin video.** On the alley fight the camera, the cuts and the places were right and the fighters moved like game characters: the model copied the exact motion of the three.js figures, which is stiff, because three.js figures are made for games. File: `release-media/SC07-AlleyFight/looks/clay-A-video-out.mp4`.

**The same video with a face photo.** The face and the place came back right. The motion did not change: the real face, the same stiff motion. The run is not included. The jump shot (ACT01) gave the same result, a real face on the stiff jump.

**The fighters drawn as pencil outlines in the grey set.** A real alley and the right face, and still a mannequin fight. A drawing of a mannequin moving is still a mannequin moving: the motion is in the video, whatever the video looks like. File: `release-media/SC07-AlleyFight/looks/pencil-V2-out.mp4`.

**A soft grey ghost silhouette.** The model put the people in the right spots facing the right way, and their original motion was still preserved. The frames of the ghost clip show a soft grey human silhouette with the pose still readable (`release-media/ACT01-BulletTimeOrbit/looks/ghost-look.mp4`), which fits that result. An early note called the ghost limbless; the frames do not show that. Files: `release-media/SC07-AlleyFight/looks/ghost-VG-out.mp4`, `release-media/SC07-AlleyFight/looks/ghost-look.mp4`.

**Frame sheets of clay mannequins.** The sheet copied the mannequin look instead of the motion. On the one-take the woman came out as a clay mannequin for the whole shot, and on the alley sheet Brick stayed a faceless slate mannequin. Files: `release-media/ONE01-CraneToFollowWhip/looks/clay-B-sheet-out.mp4`, `release-media/SC07-AlleyFight/looks/clay-B-sheet-out.mp4` (the sheet in these two folders was re-cut to 3 across by 4 down after the first cut was refused as too wide). The mapping of the 12-frame sheet to these runs was not re-checked frame by frame.

**Nobody at all.** The best movement and realism of the video tries. The subjects were not where they were meant to be. Files: `plate-made.mp4` in `release-media/SC07-AlleyFight/`, `release-media/CAM06-Orbit/` and `release-media/ACT01-BulletTimeOrbit/`. On the bullet-time plate the jump started early, in the air at 1 s while the clay figure was still crouched. On the orbit plate the person was bigger and further right at 3.5 s. The subject should be at the same spot as in the previs.

## What follows

Each rung fixed one thing and broke another. Bodies in the reference carry motion. No body loses the position. The fix is something at the exact spot, size and facing with no body in it. That is the pill (`docs/why/why-capsules.md`).

The mannequin still exists in the engine. It drives the pill's position every frame and feeds the motion and framing checks, and it is never rendered or sent.

## When your case differs

- **You do not care where the subject stands.** Send the empty plate and describe the person in words. It gave the most natural result.
- **The subject is rigid** (a product, a car). A body-free reference was already the case for objects. The object shots needed `--no-scenery` instead (`docs/why/why-the-set-stays-coarse.md`).
- **A very simple move.** UNPROVEN whether a mannequin reference is harmful when the action is only a slow walk or a look. Every test used fast or violent action. A test: the same slow push-in on a standing person with a mannequin reference and with a pill, compared for body stiffness.
