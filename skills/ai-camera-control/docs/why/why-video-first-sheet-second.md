# Why video input comes first and the sheet second

Send the previs as a reference video when the camera and the cuts must land where you put them. Send a sheet of drawn frames when the model may interpret the camera more freely, when your 3D is rough, or when you want it cheaper. A video carries the camera, the cuts and the clock. A sheet carries angles, people and look, and has no clock.

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`.

## The numbers

On the 30 second Handoff film (10 shots, 9 cuts), measured on the result, not on the previs (measured on the author's runs, not included; the result clips are in `release-media/SHOW01-TheHandoff/`):

| Input | Cuts on the planned frame | Drift of the others |
|---|---|---|
| capsule video | 9 of 9 | none |
| 30-panel drawn sheet, 3 panels per shot | 1 of 9 on the first two runs, 3 of 9 on the third | 0.2 to 0.8 s |

Files: video `video-v1.mp4`, `video-v2-video.mp4` and `result.mp4`; sheets `sketch-v2-sheet.mp4` to `sketch-v6-sheet.mp4`. In one sheet run the measured cuts were 1.9, 5.2, 9.0, 12.4, 14.4, 17.8, 21.5, 24.2 and 26.3 s against planned 2.5, 5.5, 9, 12, 14, 17, 21, 24.5 and 26.5 s. That is one cut on target, a mean miss of 0.39 s and a worst miss of 0.8 s, at the 17 s cut.

The video also matched the script on all 7 spoken lines word for word, and so did the sheet runs from the third on (checked by transcription).

## The first test, on an orbit

CAM06 orbit, 7 seconds. The video followed the camera closely: front three-quarter, side-on at 4 s, over the back, the same rise. The 9-frame sheet arced only to a back three-quarter, stayed at eye level, drifted in timing and leaked the set's pillars. Files: `release-media/CAM06-Orbit/result.mp4` (video) and `sketch-output.mp4` (sheet). Cost: 1,020.6 credits for the video and 855.4 for the sheet. The same result came on bullet time, the one-take and the alley fight, and again with 12-frame sheets and drawn sheets: video input follows the camera and the sheet does not.

With 12 frames over an 8 s orbit Seedance cut between angles instead of travelling round. Use 3 panels per shot (start, middle, end) only where the camera moves inside a shot.

## Why a better sheet could not close the gap

- **Tracking marks and a measured camera timeline.** Sent to the bullet-time shot, the video with marks and a timeline was almost identical to the video without them: there was little gap left to close. The sheet with marks got worse: a chequered floor and chequered columns. Files: `release-media/ACT01-BulletTimeOrbit/video-cam-video.mp4`, `sketch-cam-sheet.mp4`. The tool is `engine/cinematic/tools/camera-path.ts`.
- **A sharper or more detailed sheet.** Copied as look (`docs/why/why-the-set-stays-coarse.md`).
- **Naming the move in words.** It helped. The ACT01 prompt said "orbits a steady half circle", and all three sheet runs came back with a nearly static camera. After it was rewritten as start side, direction and arrival (about 3 s, same height, subject centred, "panels 4 to 9 are one continuous camera move") all three orbited. A video had orbited with the vague line anyway, because the rotation only happens in the video input and not in the frame sheets.

## What the sheet does better

- Look and people held up. On 11 shots the drawn sheet came close to video input, face included. On the standoff, orbit and drone dive some sheet results were preferred to the video ones.
- It beat the video on the chase drone (CAM15): a real white sailplane over pine hills, where the video made it bird-like (`release-media/CAM15-ChaseDrone/`).
- It is cheaper. A video bills input seconds plus output seconds at 72.9 credits a second. Images bill output seconds at 122.2 credits a second. A 7 s draft is 1,021 credits from video and 855 from a sheet, 16 s is 2,333 and 1,955, and 30 s is 4,228 and 3,544 (about 16 percent less). A 1080p final of the Handoff cost 19,587 either way. For prices see tein.ai/pricing.

## The sheet must go with the face photo

A sheet-only request gave a face that did not look like the person. The cause was a payload without the photo, not the sheet. Always attach the photo.

## Why the previs must carry the cuts

In the first Handoff run 7 of 11 cuts landed on the previs frames without the prompt listing them. The three that slipped were weak in the previs itself. The prompt's list of cut times is only a backstop: all 11 cuts were where they should be; the odd cutting came from what happens inside shots.

## When your case differs

- **A continuous single move** (an orbit, a rise). Cut timing is not an issue, and a sheet with a precise move description orbited. Pick on cost and naturalness.
- **Cuts that must land on a frame.** Video.
- **Mixing them.** UNPROVEN. No request ever sent both a video and a sheet. A test: one 30 s draft with the capsule video as `@video1` and the 30-panel sheet as `@image2`, compared on cut timing and on look with the two single runs.
- **A model that cannot take video input.** The sheet is the fallback. UNPROVEN on any other model.
