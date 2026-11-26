# CAM08-CraneDown: Crane down (arrival)

![CAM08-CraneDown preview](preview.gif)

Family: Camera moves on people.

**What it says.** We arrive in the world from above and come down to meet the person in it.

**Use it for.** Openings and establishing shots: geography first, then the subject.

**Camera numbers.** 28 mm, from 10 m above to eye level over 6–8 s, eased in to a held medium.

**Avoid.** Landing on nothing: the move must end on the subject of the next beat.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/cameras.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM08-CraneDown", name: "Crane down (arrival)", says: "We arrive in the world from above and come down to meet the person in it.", use: "Openings and establishing shots: geography first, then the subject.", numbers: "28 mm, from 10 m above to eye level over 6–8 s, eased in to a held medium.", avoid: "Landing on nothing: the move must end on the subject of the next beat." },
    [SAM([{ t: 0, at: [0, 0], yaw: 0.3 }])],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE DOWN", rig: "TECHNOCRANE", subject: "SAM", size: "WS", sizeEnd: "MWS", stop: 4, cam: rig.crane(P("SAM"), { size: "FS", mm: 28, deg: 15 }, 10, 0.05, 0, 7, 0.62), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.crane`; lens: 28 mm; shot size: FS, WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM08-CraneDown/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
