# CAM02-PanWith: Pan with

![CAM02-PanWith preview](preview.gif)

Family: Camera moves on people.

**What it says.** We are standing in the world, turning our head to follow someone.

**Use it for.** Following a crossing from one spot; showing where someone goes; a reveal by turning.

**Camera numbers.** Fixed position, 50 mm. A pan that holds the subject may run faster than the frame width ÷ 7 s rule; the background must not judder.

**Avoid.** Panning across nothing: always pan with a motivated subject or look.

## The three.js code

This is an excerpt of the template (6 lines, from `engine/cinematic/src/templates/cameras.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM02-PanWith", name: "Pan with", says: "We are standing in the world, turning our head to follow someone.", use: "Following a crossing from one spot; showing where someone goes; a reveal by turning.", numbers: "Fixed position, 50 mm. A pan that holds the subject may run faster than the frame width ÷ 7 s rule; the background must not judder.", avoid: "Panning across nothing: always pan with a motivated subject or look." },
    [ALEX([{ t: 0.3, at: [-3.8, -2.0] }, { t: 6.7, at: [3.6, 2.1] }])],
    (P) => {
      const pos = V(7.5, 1.6, 12.5), A = P("ALEX");
      return [{ start: 0, end: 7, label: "50mm  PAN WITH", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "FS", stop: 4, cam: (t) => { const e = lag((x) => A(x).eye, t, 0.1); return { pos: pos.clone(), target: aimFor(pos, e, 50, leadRoom(pos, A(t), 0.22)), mm: 50 }; }, cut: "Opens the template", flags: ["exits-moving"] }];
    }),
```

**Make it yours.** Change lens: 50 mm; shot size: FS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM02-PanWith/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
