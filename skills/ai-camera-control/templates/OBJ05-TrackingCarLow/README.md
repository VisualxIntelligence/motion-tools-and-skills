# OBJ05-TrackingCarLow: Low tracking (vehicle)

![OBJ05-TrackingCarLow preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Speed and power: low to the ground, matched to it, the road streaming past.

**Use it for.** Car chases, vehicles at speed, a character on a bike or horse.

**Camera numbers.** 35 mm, 0.4 m off the ground, matched speed, side-on and a little ahead.

**Avoid.** Matching too exactly with nothing in the background: speed reads from what streams past.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/objects.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ05-TrackingCarLow", name: "Low tracking (vehicle)", says: "Speed and power: low to the ground, matched to it, the road streaming past.", use: "Car chases, vehicles at speed, a character on a bike or horse.", numbers: "35 mm, 0.4 m off the ground, matched speed, side-on and a little ahead.", avoid: "Matching too exactly with nothing in the background: speed reads from what streams past." },
    [prop("CAR", "Car", "car", [0, 0], 0, "slate", [{ t: 0, at: [-9, 2] }, { t: 7, at: [27, 2] }])],
    (P) => [{ start: 0, end: 7, label: "35mm  LOW TRACKING · CAR", rig: "CAMERA CAR · LOW MOUNT", subject: "CAR", size: "WS", stop: 4, cam: rig.track(P("CAR"), { size: "WS", mm: 35, rise: -0.45 }, 1, 1.2), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),
```

**Make it yours.** Change rig: `rig.track`; lens: 35 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ05-TrackingCarLow/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
