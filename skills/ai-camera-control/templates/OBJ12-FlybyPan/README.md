# OBJ12-FlybyPan: Flyby pan

![OBJ12-FlybyPan preview](preview.gif)

Family: Camera moves on objects.

**What it says.** It roars past us: speed, scale, a near miss.

**Use it for.** Spacecraft, planes, trains or cars passing the camera; a beat of spectacle.

**Camera numbers.** 35 mm on a fixed head, panning with a subject at 20+ m/s that passes within 10–15 m.

**Avoid.** Leading the subject off-frame: let it pass through and exit.

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

make({ id: "OBJ12-FlybyPan", name: "Flyby pan", says: "It roars past us: speed, scale, a near miss.", use: "Spacecraft, planes, trains or cars passing the camera; a beat of spectacle.", numbers: "35 mm on a fixed head, panning with a subject at 20+ m/s that passes within 10–15 m.", avoid: "Leading the subject off-frame: let it pass through and exit." },
    [{ id: "SHIP", name: "Spacecraft", kind: "prop", model: "ship", tint: "plum", path: [{ t: 0, at: [-70, 7, -18] }, { t: 6, at: [70, 9, 6] }] }],
    (P) => {
      const pos = V(0, 1.8, 14);
      return [{ start: 0, end: 6, label: "35mm  FLYBY PAN", rig: "TRIPOD · FLUID HEAD", subject: "SHIP", size: "WS", stop: 5.6, cam: (t) => { const e = lag((x) => P("SHIP")(x).eye, t, 0.12); return { pos: pos.clone(), target: aimFor(pos, e, 35, [0, 0]), mm: 35 }; }, cut: "Opens the template", flags: ["centre", "enters-moving", "exits-moving", "compound"], shadow: 40 }];
    }),
```

**Make it yours.** Change lens: 35 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ12-FlybyPan/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
