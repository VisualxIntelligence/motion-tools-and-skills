# CAM42-DroneDive: Drone dive

![CAM42-DroneDive preview](preview.gif)

**What it says.** We fall out of the sky onto them.

**Use it for.** A reveal of the hero, an arrival, a rooftop to a face.

**Camera numbers.** From 25 m up and 14 m out, diving to a 3.4 m MWS over 6 s, the lens tightening from 24 to 50 mm, gravity-eased.

**Avoid.** Stopping short: the dive ends on the subject, composed.

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

make({ id: "CAM42-DroneDive", name: "Drone dive", says: "We fall out of the sky onto them.", use: "A reveal of the hero, an arrival, a rooftop to a face.", numbers: "From 25 m up and 14 m out, diving to a 3.4 m MWS over 6 s, the lens tightening from 24 to 50 mm, gravity-eased.", avoid: "Stopping short: the dive ends on the subject, composed." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 7, label: "24>50mm  DRONE DIVE", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", sizeEnd: "MWS", stop: 4, cam: rig.dive(P("ALEX"), V(-9, 25, 11), V(-2.2, 1.9, 2.6), 24, 50, 0.4, 6.4), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.dive`; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM42-DroneDive/v3-cam42-m.mp4` |
| Another take from the same template | `release-media/CAM42-DroneDive/v3-cam42-t.mp4` |
| Another take from the same template | `release-media/CAM42-DroneDive/v4-cam42-m.mp4` |
| Another take from the same template | `release-media/CAM42-DroneDive/v4-cam42-t.mp4` |
| Another take from the same template | `release-media/CAM42-DroneDive/v6-cam42-m.mp4` |
| Another take from the same template | `release-media/CAM42-DroneDive/v6-cam42-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v3-cam42-m.txt`
- `prompts/v3-cam42-t.txt`
- `prompts/v4-cam42-m.txt`
- `prompts/v4-cam42-t.txt`
- `prompts/v6-cam42-m.txt`
- `prompts/v6-cam42-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is a mood reference only (palette, light, haze, film feel)."; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.
- **video #3**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #4**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.
- **video #5**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #6**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
