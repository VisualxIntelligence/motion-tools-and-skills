# Why the camera moves in every clip you send

Move the camera in every clip you send. Locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03 and the ANG family) are kept as camera studies: drafts from them were stiff, so they are not recommended. A single still frame is not a shot either. Give every shot and camera effect at least 2 seconds (`docs/camera-language.md`, section 7).

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`.

## What happened

When the 68 newer templates (32 camera moves CAM17 to CAM48 and the ANG angles) went to Seedance, sending one frame for the static ones was considered and rejected: a frame that does not move gives the model nothing to follow.

Four locked-off drafts were made before the rule: ANG06, ANG07, ANG10 and ANG13 (café, bedroom, apartment and concrete window; the pairing of place to number was not re-checked). They were the stiff ones. A frame of one showed the person posed at the window. They are kept as examples of the stiff result in `release-media/ANG06-MediumCloseUp/`, `ANG07-CloseUp/`, `ANG10-EyeLevel/` and `ANG13-Profile/`.

## How it is enforced

`tools/seedance/qa4.py` (repo level), rule Q0, refuses a job whose blockout clip has no camera motion; `qa3.py` has the same rule, and `engine/cinematic/tools/clip-motion.py` runs it on one clip. It takes three frames of the clip (at 0.3 s, the middle and 0.3 s before the end), shrinks them to 320 px wide, converts them to grey and takes the largest mean difference between any two. The calibration: the ANG templates change by 2 to 4, every moving camera by 16 or more, and the pass line is 8.0.

Results of the gate (measured on the author's runs, not included):

- All 7 locked angle shots failed it (café, bedroom, apartment, concrete window, kitchen, upside-down room, bathroom overhead).
- CAM26, CAM29, CAM30 and CAM46 were found to be locked too. They have no Seedance result in this repo for that reason.
- CAM38 (push to close-up) failed on the pin version with 7.9, 7.22 and 7.53 against 17.2, 12.72 and 18.0 on the old capsule. It was re-rendered to end on an extreme close-up, so the dot fills the last frame, and passed. The template file did not change.

The video check `tools/seedance/qa_video.py` scores the result too. Locked-off shots that had looked stiff scored energy 0.12 to 0.54 with dead stretches of 1.7 to 4.7 s. The floors are 0.75 energy, 0.55 micro-motion and 1.0 s of dead time for a locked shot, and 1.2, 0 and 1.0 s for a moving one. After the lean prompt the longest dead stretch fell to 0.6 s.

## What the rule does not say

- A locked shot inside a moving film is fine. In the 30 second Handoff the locked close-up with a rack focus to the drone is shot 6 of 10, and the crash zoom ends in a locked hold on the eyes. The rule is about a clip with no camera motion at all.
- Old results stay. CAM01 Locked-off was generated before the rule, and its result is in `release-media/CAM01-LockedOff/result.mp4`.
- The ANG templates stay in the repo as pill clips and stills. Four of them have drafts (above); the others were not sent.

## Why the static drafts were stiff

UNPROVEN. The stiffness has two possible causes at once: no camera motion, and prompt words such as "stands very still". The ban list was widened to "still", "motionless" and "stands very still" at the same time. A test that would separate them: send one locked angle once with the old "stands very still" wording and once with a performance block that has breath, blinks and micro-expressions.

## When your case differs

- **You want a locked-off shot on purpose.** UNPROVEN as a good idea with this pipeline. The only tests were stiff. Try a locked shot with a rich performance block and measure it against the 0.75 energy floor before spending credits on more.
- **A tiny move.** A slow push-in of a few centimetres may not pass the 8.0 gate. The gate is a mean pixel difference and was calibrated on the ANG and CAM clips only.
