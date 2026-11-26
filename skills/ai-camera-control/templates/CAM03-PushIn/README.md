# CAM03-PushIn: Push in

![CAM03-PushIn preview](preview.gif)

Family: Camera moves on people.

**What it says.** Something is dawning on them. We lean in with the thought.

**Use it for.** A realisation, a decision, rising tension; the reaction before the reveal (the Spielberg face).

**Camera numbers.** 50 mm, MS to MCU over 4–8 s, about 0.15–0.4 m/s, eased, with a held frame at each end.

**Avoid.** Pushing on every shot: save it for the beat that turns.

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

make({ id: "CAM03-PushIn", name: "Push in", says: "Something is dawning on them. We lean in with the thought.", use: "A realisation, a decision, rising tension; the reaction before the reveal (the Spielberg face).", numbers: "50 mm, MS to MCU over 4–8 s, about 0.15–0.4 m/s, eased, with a held frame at each end.", avoid: "Pushing on every shot: save it for the beat that turns." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.45 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "50mm  PUSH IN · MS TO MCU", rig: "DOLLY", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MS", mm: 50, deg: 28 }, "MCU", 0, 7, 0.8), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.dolly`; lens: 50 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM03-PushIn/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
