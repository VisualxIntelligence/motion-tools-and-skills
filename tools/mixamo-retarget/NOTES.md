# mixamo-retarget — notes

**Source:** [MaxLiu22/Motion2MixamoRig](https://github.com/MaxLiu22/Motion2MixamoRig) @ `443b703` (v0.1.7): `motion2mixamorig/mixamo/` (without `render.py`), `motion2mixamorig/human_motion.py` and `motion2mixamorig/stabilize_kp2d.py`. Apache-2.0 ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it is

The **retarget core** of Motion2MixamoRig: about 4k lines of numpy that put 3D human joint motion onto a Mixamo-rigged character and write an animated, skinned **GLB**, with no Blender involved.

| Module | What it does |
|---|---|
| `mixamo/fbx_skeleton.py` | A pure-Python **binary FBX reader**: core-bone skeleton, bind poses, cluster transforms, unit scale |
| `mixamo/kinematics.py` | Forward kinematics from FBX bind transforms, body frames, swing/aim rotation helpers, quaternion continuity |
| `mixamo/tpose_calibration.py` | Measured T-pose alignment between the human skeleton and the character rig (one-off per character) |
| `mixamo/retarget.py` | Per-frame swing/aim retarget of 24 human joints onto Mixamo bones (no bone scaling, no IK) |
| `mixamo/ybot_retarget.py` | Rest-relative transfer from the Mixamo core skeleton onto the full character rig |
| `mixamo/skinned_mesh.py` | FBX meshes and skin clusters, linear blend skinning, optional diffuse-sampled face colours |
| `mixamo/animation.py` | The whole-clip driver: `build_animation(motion, mapping, frames)` |
| `mixamo/gltf.py` | `write_glb(path, asset, rotations, hips, fps)`: skinned character + clip → one `.glb` |
| `human_motion.py` | Loads the motion file (format below) |
| `stabilize_kp2d.py` | A left/right flip stabiliser for 2D COCO-17 keypoints (useful for any 2D pose source; `stabilize_cache` needs torch) |

## Why only this part

Upstream's full pipeline is video → YOLOv8 person detection → RTMPose 2D pose → GVHMR world-grounded SMPL-X → this retarget. Its own NOTICE says the end-to-end pipeline is restricted to **non-commercial research use**:

- GVHMR is non-commercial.
- The SMPL-X body model is non-commercial; a commercial licence goes through Meshcapade.
- YOLOv8 is AGPL-3.0.

None of that is copied here. The retarget code is the authors' own and Apache-2.0, and it works on joint positions from any source.

## Input

A `.npz` with:

- `joints_3d`: `(frames, 24, 3)` float, **metres, +Y up, +X right, +Z forward**.
- `joint_names`: the 24 SMPL joint names in SMPL order: `pelvis, left_hip, right_hip, spine1, left_knee, right_knee, spine2, left_ankle, right_ankle, spine3, left_foot, right_foot, neck, left_collar, right_collar, head, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hand, right_hand`.
- `fps`.
- Optionally `timestamps` and `root_translation`.

Sources that can feed it, if their licence suits the job:

- A commercial mocap export (Rokoko, Move.ai, Xsens) resampled to those 24 joints.
- MediaPipe Pose (Apache-2.0), via a small mapping layer: its 33 landmarks → the 24 SMPL joints. Pelvis is the hip midpoint, and the spine joints are interpolated.
- GVHMR or similar research models, for internal previs only.

## Use

```python
from pathlib import Path
from motion2mixamorig.human_motion import load_human_motion
from motion2mixamorig.mixamo.tpose_calibration import load_calibration
from motion2mixamorig.mixamo.ybot_retarget import build_mapping
from motion2mixamorig.mixamo.skinned_mesh import load_character_asset
from motion2mixamorig.mixamo.animation import build_animation
from motion2mixamorig.mixamo.gltf import write_glb

rig = Path("character.fbx")                         # a Mixamo-rigged character, downloaded with your Adobe account
motion = load_human_motion("skeleton_motion.npz")
mapping = build_mapping(load_calibration(rig))
asset = load_character_asset(rig, textures=True)
anim = build_animation(motion, mapping, list(range(motion.n_frames)))
write_glb(Path("out/character_anim.glb"), asset, anim.r_anim_rig, anim.hips_cm_rig, anim.fps)
```

This is the same order as upstream `pipeline.py`. Run it from this folder, or put it on `PYTHONPATH`.

The GLB loads straight into three.js (`GLTFLoader` + `AnimationMixer`), HyperFrames and Blender. For Unreal, import it into Blender and export FBX.

## Requirements

Python 3.11+, numpy. `opencv-python` is needed only for texture sampling (`textures=True`), and torch only for `stabilize_cache`.

You also need a Mixamo character FBX. Mixamo characters and animations may be used in productions, but the raw files may not be redistributed, so none is included.

## Overlap

[`../tidewater-asset-pipeline/blender/`](../tidewater-asset-pipeline/NOTES.md) retargets an **FBX clip onto an FBX avatar by bone name inside Blender**. This tool starts from **joint positions** and runs without Blender.

## Changes from upstream

None to the copied files. Left out:

- The extraction and CLI: `cli.py`, `pipeline.py`, `extract.py`, `checks.py`, `videos.py` and `paths.py`. They hard-wire GVHMR, SMPL-X and YOLOv8.
- The preview renderer (`mixamo/render.py`).
- The Blender extension.
- Docs, demo media and the weights folder.

The Blender extension's pattern, a thin add-on UI that installs and drives an external Python runtime with sha256-pinned `uv` and reports progress as JSONL, is described in [`../../docs/reference-only.md`](../../docs/reference-only.md#9-motion2mixamorig-pipeline--non-commercial-dependencies).

## Cautions

- **Maturity.** The project is weeks old (first release 4 Sep 2026), marked experimental, and tested by its author on macOS only.
- **No tests.** No tests ship upstream, and the code was not run while assembling this repo (static checks only: it imports nothing outside numpy, plus the optional cv2 and torch inside functions).
- **No smoothing.** Quaternion continuity is the only smoothing, so noisy joint input gives jittery output; filter the joints first.
- **No fingers.** Fingers are not retargeted.
