# OBJ04-TruckPastParallax: Truck past (parallax)

![OBJ04-TruckPastParallax preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Depth and travel: the world is layered, and we are moving through it.

**Use it for.** Establishing a space with depth; passing foreground that frames the subject; showing speed.

**Camera numbers.** 35 mm, a sideways slide of 10–12 m over 6–8 s, aim held parallel; foreground 1–3 m away, subject 10+ m.

**Avoid.** An empty foreground: parallax needs near objects to pass the lens.

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

make({ id: "OBJ04-TruckPastParallax", name: "Truck past (parallax)", says: "Depth and travel: the world is layered, and we are moving through it.", use: "Establishing a space with depth; passing foreground that frames the subject; showing speed.", numbers: "35 mm, a sideways slide of 10–12 m over 6–8 s, aim held parallel; foreground 1–3 m away, subject 10+ m.", avoid: "An empty foreground: parallax needs near objects to pass the lens." },
    [prop("MONO", "Monolith", "monolith", [0.5, -7], 0, "plum"), prop("C1", "Crate", "crate", [-4, 4.5], 0.4), prop("C2", "Barrel", "barrel", [-0.6, 4.2]), prop("C3", "Crate", "crate", [3.2, 4.8], 1.1), prop("C4", "Barrel", "barrel", [6, 4.4])],
    () => [{ start: 0, end: 7, label: "35mm  TRUCK RIGHT · PARALLAX", rig: "DOLLY · TRACK", subject: "MONO", size: "WS", stop: 5.6, cam: rig.truck(V(-5.5, 1.3, 8), V(5.5, 1.3, 8), V(0.04, -0.05, -1), 35, 0, 7), cut: "Opens the template", flags: ["centre"] }]),
```

**Make it yours.** Change rig: `rig.truck`; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ04-TruckPastParallax/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
