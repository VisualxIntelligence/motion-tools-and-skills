# Ideas borrowed from public skills on GitHub

This is a search of public agent skills on cinematography, previs, Blender cameras and AI video prompting, as of October 2026. Most were textbook summaries. The ideas below are the ones not already in `rulebook.md`. They are paraphrased, each with its source. None of them has been tested here yet.

## For the previs itself

- **Bounding-box framer.** From RobLe3/cc-blender-skill `blender-cameras` (MIT). Set the camera distance from the subject's bounding box and the lens: distance = (subject height ÷ target frame share) × focal ÷ sensor height. Then aim with a look-at, not with keyed rotation. Use it to place every shot at its planned size before tuning, so heads are never cropped by accident.
- **The shot card.** From nolanx-ai `storyboard-shot-design` (MIT). Beyond size, lens, angle and move, add two fields to each card. The first is the continuity link from the previous shot. The second is the transition pressure into the next one: what pulls the cut. List what must stay fixed across shots: positions, facing, damage state, weather, and the direction of travel.
- **Intercut rhythm.** From omer-metin `video-directing` patterns. Between two threads, play long stretches of A with brief cuts to B, then equal cuts, then fast alternation at the peak.
- **A shot with no reason is locked off.** From the same source. If a move can't name its reason, the camera holds still.
- **One signature shot.** From cth9191's Seedance 2 prompt pack on GitHub. Mark one shot per sequence as the showpiece and spend the boldest move there only.

## For AI video made from the previs

- **Per-model reference files.** From smixs/visual-skills `video/` (CC BY 4.0, credit smixs).
  - Seedance multi-shot uses explicit cut markers ("Cut to."). Plan 2–3 shots per 5 s, with a cap of 5. Adjacent shots that share one emotional job get merged into one, so give each shot a different job and a different framing.
  - Kling 3.0 uses labelled, timed shots, at most 6 in 15 s or less, with about 30–60 words per shot.
  - Veo clips run 4, 6 or 8 s. Sound goes on labelled lines with times. For image-to-video, tell it to keep the subject from the first frame.
- **Every AI shot needs four things.** From smixs as well: one environmental pressure (wind, dust, light), one small physical action, one sound anchor and a named final frame. This matches the "one moving layer" rule for clay.
- **Write each move out in full.** From Emily2040/seedance-2.0 (MIT): start size, angle, move, speed, the subject's relationship to the camera, and the end frame. Vague phrases are banned.
- **Lock the reference's role.** From the same source. State that the previs video controls camera movement only, and that its figures, set and light do not carry over.
- **Chaining clips.**
  - A continuation starts from the previous clip's last frame and never restarts the move.
  - Chain at most 2–3 generations, because identity drifts.
  - After a scene cut, start again from the reference images.
  - End every prompt with a lock line restating light, positions, facing and the camera's side of the line.
- **Speeds in units.** From cth9191: write a move with a rate and a duration, such as "orbits 270° over 5 seconds", rather than "fast" or "slow". Their numbers are untested, so take speeds from rulebook §3 instead.

## Searched, and found nothing useful

- No three.js or Remotion skill for a cinematic camera.
- No previs skill with lens and sensor shot lists, beyond the bounding-box recipe above.
- No Runway, Hailuo or Sora camera skill with substance.
- No curated list with a film section.
