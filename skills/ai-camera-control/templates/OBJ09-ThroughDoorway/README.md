# OBJ09-ThroughDoorway: Through a doorway

![OBJ09-ThroughDoorway preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Crossing a threshold: we enter their world, their room, their story.

**Use it for.** Entering a space, discovering someone inside, transitions from outside to in.

**Camera numbers.** 28 mm, a dolly through the frame of the door over 5–7 s; the door frame wipes past the edges.

**Avoid.** Stopping in the doorway: the move is the crossing.

## The three.js code

This is an excerpt of the template (6 lines, from `engine/cinematic/src/templates/objects.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

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

make({ id: "OBJ09-ThroughDoorway", name: "Through a doorway", says: "Crossing a threshold: we enter their world, their room, their story.", use: "Entering a space, discovering someone inside, transitions from outside to in.", numbers: "28 mm, a dolly through the frame of the door over 5–7 s; the door frame wipes past the edges.", avoid: "Stopping in the doorway: the move is the crossing." },
    [prop("DOOR", "Doorway", "doorway", [0, 2], 0, "stone"), ALEX([0.3, -4.5], 0)],
    (P) => {
      const a = V(0.1, 1.55, 10), b = V(0.15, 1.55, -0.6);
      return [{ start: 0, end: 7, label: "28mm  DOLLY THROUGH DOORWAY", rig: "STEADICAM", subject: "ALEX", size: "WS", sizeEnd: "MS", stop: 4, cam: (t) => { const k = smoother(ramp(t, 0.4, 6.6)); const pos = a.clone().lerp(b, k); return { pos, target: aimFor(pos, P("ALEX")(t).eye, 28, [0, 1 / 3]), mm: 28 }; }, cut: "Opens the template", flags: ["centre"] }];
    }),
```

**Make it yours.** Change lens: 28 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ09-ThroughDoorway/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
