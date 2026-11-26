# CAM05-DollyZoom: Dolly zoom

![CAM05-DollyZoom preview](preview.gif)

Family: Camera moves on people.

**What it says.** The ground shifts under them: dread, vertigo, a realisation that changes everything.

**Use it for.** Once per film at most: the moment the world turns.

**Camera numbers.** Hold the subject's size while the focal length runs 32 → 90 mm and the camera travels back in proportion (distance ∝ focal length).

**Avoid.** Keying the lens and the move apart: the subject's size drifts and the effect reads as a mistake.

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

make({ id: "CAM05-DollyZoom", name: "Dolly zoom", says: "The ground shifts under them: dread, vertigo, a realisation that changes everything.", use: "Once per film at most: the moment the world turns.", numbers: "Hold the subject's size while the focal length runs 32 → 90 mm and the camera travels back in proportion (distance ∝ focal length).", avoid: "Keying the lens and the move apart: the subject's size drifts and the effect reads as a mistake." },
    [ALEX([{ t: 0, at: [0, 3], yaw: 0 }])],
    (P) => [{ start: 0, end: 6, label: "32>90mm  DOLLY ZOOM", rig: "DOLLY · ZOOM", subject: "ALEX", size: "MCU", stop: 4, cam: rig.dollyZoom(P("ALEX"), "MCU", 32, 90, 0, 0, 6, 0.6), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.dollyZoom`; shot size: MCU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM05-DollyZoom/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
