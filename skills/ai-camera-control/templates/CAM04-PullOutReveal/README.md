# CAM04-PullOutReveal: Pull out (reveal)

![CAM04-PullOutReveal preview](preview.gif)

Family: Camera moves on people.

**What it says.** We discover where they are, and how small they are in it.

**Use it for.** Endings, isolation, a reveal of scale or of what surrounds the subject.

**Camera numbers.** 60 mm (a close-up nearer than 1.5 m distorts the face), CU to WS over 5–8 s, eased; let the world enter the frame in layers.

**Avoid.** Pulling out to an empty frame: the reveal needs something new at the end.

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

make({ id: "CAM04-PullOutReveal", name: "Pull out (reveal)", says: "We discover where they are, and how small they are in it.", use: "Endings, isolation, a reveal of scale or of what surrounds the subject.", numbers: "60 mm (a close-up nearer than 1.5 m distorts the face), CU to WS over 5–8 s, eased; let the world enter the frame in layers.", avoid: "Pulling out to an empty frame: the reveal needs something new at the end." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 2.6 }], [{ kind: "lookUp", t0: 1.0 }])],
    (P) => [{ start: 0, end: 8, label: "60mm  PULL OUT · CU TO WS", rig: "DOLLY · TECHNOCRANE", subject: "ALEX", size: "CU", sizeEnd: "WS", stop: 2.8, cam: rig.dolly(P("ALEX"), { size: "CU", mm: 60, deg: 25 }, "WS", 0, 8, 0.7), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.dolly`; lens: 60 mm; shot size: CU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM04-PullOutReveal/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 8 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1166.4 credits.

See `reproduce.md` to render it and send it yourself.
