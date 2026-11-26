# CAM36-TwoShotTruck: Two-shot truck

![CAM36-TwoShotTruck preview](preview.gif)

**What it says.** We slide along the space between two people and see who is closer.

**Use it for.** Dialogue in profile, a stand-off, a negotiation.

**Camera numbers.** 35 mm, both in profile, the camera trucks 4 m sideways at 7.5 m distance over 6 s, aim held parallel.

**Avoid.** Letting one person leave the frame: both stay in for the whole move.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/cameras2.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM36-TwoShotTruck", name: "Two-shot truck", says: "We slide along the space between two people and see who is closer.", use: "Dialogue in profile, a stand-off, a negotiation.", numbers: "35 mm, both in profile, the camera trucks 4 m sideways at 7.5 m distance over 6 s, aim held parallel.", avoid: "Letting one person leave the frame: both stay in for the whole move." },
    [ALEX([{ t: 0, at: [-1.3, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.3, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    () => [{ start: 0, end: 7, label: "35mm  TWO-SHOT TRUCK", rig: "DOLLY · TRACK", subject: "ALEX", size: "MWS", stop: 4, cam: rig.truck(V(-2.2, 1.5, 7.5), V(2.2, 1.5, 7.5), V(0, 0, -1), 35, 0.3, 6.7, undefined, 0.5), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.truck`; shot size: MWS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM36-TwoShotTruck/v12-cam36-m.mp4` |
| Another take from the same template | `release-media/CAM36-TwoShotTruck/v12-cam36-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v12-cam36-m.txt`
- `prompts/v12-cam36-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel.", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
