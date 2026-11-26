# OBJ02-OrbitHero: Hero orbit (object)

![OBJ02-OrbitHero preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Admire it: the reveal of a hero vehicle, a product, a prize.

**Use it for.** Introducing a vehicle, a machine or a product; showing every side in one move.

**Camera numbers.** 35 mm, full shot, 180° over 6–8 s, eased, camera slightly above the roofline.

**Avoid.** Orbiting so fast the background smears; keep it under about 30°/s.

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

make({ id: "OBJ02-OrbitHero", name: "Hero orbit (object)", says: "Admire it: the reveal of a hero vehicle, a product, a prize.", use: "Introducing a vehicle, a machine or a product; showing every side in one move.", numbers: "35 mm, full shot, 180° over 6–8 s, eased, camera slightly above the roofline.", avoid: "Orbiting so fast the background smears; keep it under about 30°/s." },
    [prop("CAR", "Car", "car", [0, 0], 0, "slate")],
    (P) => [{ start: 0, end: 8, label: "35mm  HERO ORBIT 180", rig: "TECHNOCRANE ORBIT", subject: "CAR", size: "WS", stop: 4, cam: rig.orbit(P("CAR"), { size: "WS", mm: 35, rise: 1.1 }, 30, 210, 0, 8, 1.4, 0.5), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.orbit`; lens: 35 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ02-OrbitHero/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 8 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 1166.4 credits.

See `reproduce.md` to render it and send it yourself.
