# OBJ03-CraneUpStatue: Crane up a monument

![OBJ03-CraneUpStatue preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Scale and awe: we rise with it to see how big it is, and what it watches over.

**Use it for.** Monuments, buildings, giant machines; the arrival at a destination.

**Camera numbers.** 28 mm, starting low at the base (a low angle adds weight), rising 6 m over 6–8 s.

**Avoid.** Starting high: the rise is the reveal.

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

make({ id: "OBJ03-CraneUpStatue", name: "Crane up a monument", says: "Scale and awe: we rise with it to see how big it is, and what it watches over.", use: "Monuments, buildings, giant machines; the arrival at a destination.", numbers: "28 mm, starting low at the base (a low angle adds weight), rising 6 m over 6–8 s.", avoid: "Starting high: the rise is the reveal." },
    [prop("STATUE", "Statue", "statue", [0, -2], 0, "stone")],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE UP · LOW TO HIGH", rig: "TECHNOCRANE", subject: "STATUE", size: "FS", sizeEnd: "WS", stop: 4, cam: rig.crane(P("STATUE"), { size: "FS", mm: 28, deg: 20 }, -1.3, 5, 0, 7, 1.5), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.crane`; lens: 28 mm; shot size: FS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ03-CraneUpStatue/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
