# OBJ08-WipeReveal: Wipe reveal

![OBJ08-WipeReveal preview](preview.gif)

Family: Camera moves on objects.

**What it says.** A curtain opens: something near the lens passes and the subject is there.

**Use it for.** Hidden cuts, reveals, transitions between scenes or times.

**Camera numbers.** 35 mm, a lateral move behind a near object (1–2 m from the lens) that fills the frame for a moment.

**Avoid.** A wipe object that is too far: it must fill the frame to hide or reveal.

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

make({ id: "OBJ08-WipeReveal", name: "Wipe reveal", says: "A curtain opens: something near the lens passes and the subject is there.", use: "Hidden cuts, reveals, transitions between scenes or times.", numbers: "35 mm, a lateral move behind a near object (1–2 m from the lens) that fills the frame for a moment.", avoid: "A wipe object that is too far: it must fill the frame to hide or reveal." },
    [prop("MONO", "Monolith", "monolith", [0, 5.6], 0, "stone"), prop("STATUE", "Statue", "statue", [0.4, -4], 0, "sand")],
    (P) => [{ start: 0, end: 6, label: "35mm  WIPE REVEAL", rig: "DOLLY · TRACK", subject: "STATUE", size: "FS", stop: 4, cam: rig.truck(V(-3.4, 1.6, 7.4), V(3.4, 1.6, 7.4), V(0, 0, -1), 35, 0, 6, (t) => P("STATUE")(t).eye), cut: "Opens the template", flags: ["centre", "wipe", "compound"] }]),
```

**Make it yours.** Change rig: `rig.truck`; shot size: FS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ08-WipeReveal/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
