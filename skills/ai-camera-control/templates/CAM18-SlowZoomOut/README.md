# CAM18-SlowZoomOut: Slow zoom out

![CAM18-SlowZoomOut preview](preview.gif)

**What it says.** We pull back from the thought and see the room it happens in.

**Use it for.** Isolation, a reveal of who else is there, the end of a scene.

**Camera numbers.** Locked tripod, 100 down to 35 mm over 6 s, CU to MS, eased at both ends.

**Avoid.** Stopping half way. The move has to land on a composed wide.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/cameras2.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM18-SlowZoomOut", name: "Slow zoom out", says: "We pull back from the thought and see the room it happens in.", use: "Isolation, a reveal of who else is there, the end of a scene.", numbers: "Locked tripod, 100 down to 35 mm over 6 s, CU to MS, eased at both ends.", avoid: "Stopping half way. The move has to land on a composed wide." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "100>35mm  SLOW ZOOM OUT", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "CU", sizeEnd: "MS", stop: 4, cam: rig.zoom(P("ALEX"), { size: "CU", mm: 100, deg: 25 }, 35, 0.4, 6.6, 0, 0.6), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.zoom`; lens: 100 mm; shot size: CU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM18-SlowZoomOut/v11-cam18-m.mp4` |
| Another take from the same template | `release-media/CAM18-SlowZoomOut/v11-cam18-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v11-cam18-m.txt`
- `prompts/v11-cam18-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
