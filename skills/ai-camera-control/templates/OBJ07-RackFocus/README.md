# OBJ07-RackFocus: Rack focus

![OBJ07-RackFocus preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Look here, now there: the lens moves our attention without the camera moving.

**Use it for.** Linking a clue to a person, revealing who is behind, a shift in what matters.

**Camera numbers.** 50 mm at T1.4, the camera low between a near object and a far one;  hold, then pull focus over 0.6–1 s on a motivated beat.

**Avoid.** Racking with deep focus (wide lens, small stop): nothing changes.

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

make({ id: "OBJ07-RackFocus", name: "Rack focus", says: "Look here, now there: the lens moves our attention without the camera moving.", use: "Linking a clue to a person, revealing who is behind, a shift in what matters.", numbers: "50 mm at T1.4, the camera low between a near object and a far one;  hold, then pull focus over 0.6–1 s on a motivated beat.", avoid: "Racking with deep focus (wide lens, small stop): nothing changes." },
    [prop("CASE", "Suitcase", "suitcase", [0.45, 4.6], 0.3), ALEX([-0.8, -4], 0.15)],
    () => {
      const pos = V(0.2, 0.55, 7.3), mid = V(-0.1, 0.95, -1);
      return [{ start: 0, end: 6, label: "50mm  RACK FOCUS · CASE TO ALEX", rig: "TRIPOD", subject: (t) => (t < 3.2 ? "CASE" : "ALEX"), size: "WS", stop: 1.4, cam: () => ({ pos: pos.clone(), target: aimFor(pos, mid, 50, [0, 0]), mm: 50 }), focus: (t) => ["CASE", "ALEX", smoother(ramp(t, 2.8, 3.6))], cut: "Opens the template", flags: ["centre"] }];
    }),
```

**Make it yours.** Change lens: 50 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ07-RackFocus/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
