# OBJ10-CrashZoom: Crash zoom

![OBJ10-CrashZoom preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Shock or punchline: the lens slams in on the thing that matters.

**Use it for.** Comedy beats, sudden realisations, 70s-style energy; a deliberate stylistic flourish.

**Camera numbers.** Fixed camera, 24 → 150 mm in 0.3–0.4 s, a held frame on both sides.

**Avoid.** Using it as a dolly: a zoom flattens space and reads as a style choice.

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

make({ id: "OBJ10-CrashZoom", name: "Crash zoom", says: "Shock or punchline: the lens slams in on the thing that matters.", use: "Comedy beats, sudden realisations, 70s-style energy; a deliberate stylistic flourish.", numbers: "Fixed camera, 24 → 150 mm in 0.3–0.4 s, a held frame on both sides.", avoid: "Using it as a dolly: a zoom flattens space and reads as a style choice." },
    [prop("STATUE", "Statue", "statue", [0, -10], 0, "sand")],
    (P) => [{ start: 0, end: 5, label: "24>150mm  CRASH ZOOM", rig: "TRIPOD · ZOOM", subject: "STATUE", size: "WS", stop: 4, cam: rig.zoom(P("STATUE"), { size: "WS", mm: 24, deg: 15 }, 150, 2.2, 2.6, 2.5, 0), cut: "Opens the template", flags: ["whip", "centre"] }]),
```

**Make it yours.** Change rig: `rig.zoom`; lens: 24 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ10-CrashZoom/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 5 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 729 credits.

See `reproduce.md` to render it and send it yourself.
