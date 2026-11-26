# OBJ01-PushInObject: Push in on an object

![OBJ01-PushInObject preview](preview.gif)

Family: Camera moves on objects.

**What it says.** This thing matters: the clue, the weapon, the letter.

**Use it for.** Plant an object the story will pay off; turn attention from people to a thing.

**Camera numbers.** 50 mm, from a wide that shows where it is to an insert that fills the frame, 5–7 s, eased, looking slightly down.

**Avoid.** An insert with no geography first: the audience must know where the object is.

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

make({ id: "OBJ01-PushInObject", name: "Push in on an object", says: "This thing matters: the clue, the weapon, the letter.", use: "Plant an object the story will pay off; turn attention from people to a thing.", numbers: "50 mm, from a wide that shows where it is to an insert that fills the frame, 5–7 s, eased, looking slightly down.", avoid: "An insert with no geography first: the audience must know where the object is." },
    [prop("CASE", "Suitcase", "suitcase", [0, 0], 0.5)],
    (P) => [{ start: 0, end: 7, label: "50mm  PUSH IN · WIDE TO INSERT", rig: "DOLLY", subject: "CASE", size: "EWS", sizeEnd: "INSERT", stop: 2.8, cam: rig.dolly(P("CASE"), { size: "EWS", mm: 50, deg: 35, rise: 1.4 }, "INSERT", 0, 7, 0.6), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.dolly`; lens: 50 mm; shot size: EWS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ01-PushInObject/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
