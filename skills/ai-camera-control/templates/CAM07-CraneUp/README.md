# CAM07-CraneUp: Crane up

![CAM07-CraneUp preview](preview.gif)

Family: Camera moves on people.

**What it says.** Release: we rise above them and see what they are heading into.

**Use it for.** Ends of scenes, the start of a journey, showing the destination.

**Camera numbers.** 28 mm, WS, rise 0 → 7 m over 6–8 s, eased; the head tilts down to keep the subject.

**Avoid.** Craning with no destination to reveal at the top.

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

make({ id: "CAM07-CraneUp", name: "Crane up", says: "Release: we rise above them and see what they are heading into.", use: "Ends of scenes, the start of a journey, showing the destination.", numbers: "28 mm, WS, rise 0 → 7 m over 6–8 s, eased; the head tilts down to keep the subject.", avoid: "Craning with no destination to reveal at the top." },
    [ALEX([{ t: 0.5, at: [-6, 1.4] }, { t: 4.5, at: [-11.4, 1.4] }])],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE UP", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "WS", mm: 28, deg: 160 }, 0.1, 7, 0, 7, 1.35), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.crane`; lens: 28 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM07-CraneUp/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
