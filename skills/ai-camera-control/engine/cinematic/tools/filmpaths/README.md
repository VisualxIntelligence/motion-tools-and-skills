# filmpaths

Distils actor-relative camera moves from the E.T. ("Exceptional Trajectories") dataset into
`src/kit/filmpaths.json`.

```
python3 -I tools/filmpaths/distil.py            # regenerate filmpaths.json (about 30 s, 8 cores)
python3 -I tools/filmpaths/distil.py --verify   # also print frame 0 / middle / last for a few presets
```

Input: the archives in `.cache/et-data/`, extracted to `.cache/et-data/x/{traj,char,caption_cam,cam_segments,intrinsics}`
with `tar -xzf <name>.tar.gz -C x`. The script reads them only as numbers (`np.fromfile`, `np.load(allow_pickle=False)`).

## Data format found

- `traj/<id>.txt`: one line per frame, 12 floats = a row-major 3x4 `[R|t]` (KITTI pose layout; DIRECTOR loads it
  with evo's `read_kitti_poses_file`). It is **camera-to-world**, despite the processing script naming the source
  `w2c_poses`: with `p_cam = R^T (p_world - t)` the character is in front of the camera (z > 0) in 96% of 300 random
  clips and projects inside the 640x272 image; the inverse reading puts it in front in 0-5%. The rerun viewer in the
  dataset repo also plots `t` directly as camera positions.
- Camera axes are OpenCV (x right, y down, z forward). Evidence: for single-move captions, the median displacement
  in the camera's own frame is +x for "trucks right" (+0.15), -x for "trucks left", +z for "push in" (+0.08), -z for
  "pull out", -y for "boom top" and +y for "boom bottom". The world is the first camera's frame (frame 0 `R` is
  about identity), so world up is taken as -y; the viewer declares `RIGHT_HAND_Y_DOWN`. `det R = 1`.
- `char/<id>.npy`: (N, 3) float hip-centre position per frame, in the same world, shifted so frame 0 is the origin.
- `cam_segments/<id>.npy`: N-1 integer labels (one per frame transition), a base-3 code:
  digit 0 = z (1 push in, 2 pull out), digit 1 = y (1 boom down/bottom, 2 boom up/top), digit 2 = x (1 truck right,
  2 truck left). So 1 push, 2 pull, 3 boom down, 6 boom up, 9 truck right, 18 truck left, 8 pull+up, and so on.
  This matched the captions (push 198/200, truck right 68/71, boom bottom 46/46).
- `intrinsics/<id>.npy`: 4 values `fx fy cx cy` (for example `456 456 320 136`), one per clip, so there is no zoom
  data: `f` is always 1.
- Frame rate: 25 fps (the paper's appendix: "300 frames/25 fps"); clips are at most 300 frames.
- The captions only use push, pull, truck, boom and static. There is no word for orbit, follow, lead or handheld, so
  those moves are found from the geometry.

## Output

```
{ "fps": 24, "presets": { "<name>": { "caption", "source", "dur", "heading", "move", "frames": [[dx,dy,dz,ax,ay,az,f], ...] } } }
```

- Character frame: y = world up; z = character heading; x = character's right (`forward x up` in the right-handed
  world). Note that (right, up, forward) as written is a left-handed triple: map x to the actor's right vector.
- The heading is fixed for the shot. `"heading": "motion"` means it comes from the character's net horizontal
  motion (when it moved over 0.35 of the start distance). `"view"` means the character barely moved and the heading is
  the horizontal camera-to-character direction at frame 0, so these presets start with the camera behind the actor
  at (0, h, -1). Rotate 180 degrees about y (negate x and z, for position and look) if you want a static actor
  facing the camera instead.
- `(dx,dy,dz)` = camera minus hip centre, divided by the frame-0 distance (frame 0 has length 1). `(ax,ay,az)` is the
  camera's +z look axis, unit. The camera aims 10-30 degrees off the hip centre, because shots are framed on faces
  and off centre. Keep the look vectors rather than re-aiming at the actor.
- `source` is the E.T. clip id, `caption` is that clip's original sentence (it describes the whole clip, while the
  preset can be a trimmed window), and `move` is our category.

## How presets were chosen

Each clip is scanned with windows of 3 to 8 s (step 1 s). A window needs the character in frame for 90% or more of
frames and a smooth hip track. These measures are taken on it: distance ratio end/start, how steadily it changes,
change in azimuth around the character, camera yaw change, height change, the camera's lateral travel along its own
right axis, and the character's travel.

- push_in / pull_out / truck_* / boom_*: segment label constant for 85% or more of the window, caption names the
  move, distance ratio under 0.7 / over 1.45, lateral travel over 0.45 with under 10 degrees of yaw, height change
  over 0.25. Trucks need a near-static character.
- orbit_left / orbit_right: azimuth change over 35 degrees, distance within 25%, camera yaw following over 25
  degrees. Right/left is the camera's own direction of travel; orbit right means azimuth decreases.
- arc_and_push: azimuth change over 30 degrees and distance ratio under 0.7. dolly_out_and_up: distance up 1.35x and
  height up 0.2. crane_down_and_push: distance under 0.7 while dropping. rising_orbit: rising while orbiting.
- follow_behind / lead_front / track_alongside: a straight-walking character covering more than the start distance.
  The camera keeps a nearly fixed relative position (spread under 0.45) behind, in front or beside.
- handheld_drift: a caption saying static, label static, net translation under 0.12, but 3-25 degrees of
  accumulated rotation and some translation (operator float).
- The best-scored window per category is kept. Scores weigh move size, duration and how much of the frame keeps the
  character. There is at most one preset per source film.
- Normalisation: resampled from 25 to 24 fps by linear interpolation, camera position and look smoothed with a
  Gaussian (sigma 1.5 frames, 1.0 for handheld), hip track smoothed with sigma 4, to remove walk bob and pose noise.

## Licence

The dataset and code repositories are marked MIT. The trajectories are estimated from film clips in
CondensedMovies (YouTube excerpts of copyrighted films), and the paper states no further dataset licence. We ship
only these distilled, normalised, actor-relative curves (33 presets of 3-8 s, out of about 115k clips). We ship no raw
trajectories, meshes, frames or full data. The `source` ids and captions are kept for attribution and traceability.
The raw extracted data stays in `.cache/` and is not part of the engine.
