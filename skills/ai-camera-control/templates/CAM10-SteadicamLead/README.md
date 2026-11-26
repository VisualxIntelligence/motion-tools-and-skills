# CAM10-SteadicamLead: Steadicam lead

![CAM10-SteadicamLead preview](preview.gif)

Family: Camera moves on people.

**What it says.** They are coming at us: purpose, confrontation, a walk-and-talk.

**Use it for.** Walk-and-talks, a character striding with intent, an approach.

**Camera numbers.** 40 mm, MS from the front, the operator walking backwards at the subject's pace.

**Avoid.** Leading with nothing ahead of them in their eyeline: they need somewhere to look.

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

make({ id: "CAM10-SteadicamLead", name: "Steadicam lead", says: "They are coming at us: purpose, confrontation, a walk-and-talk.", use: "Walk-and-talks, a character striding with intent, an approach.", numbers: "40 mm, MS from the front, the operator walking backwards at the subject's pace.", avoid: "Leading with nothing ahead of them in their eyeline: they need somewhere to look." },
    [ALEX([{ t: 0.3, at: [0, -7] }, { t: 7, at: [0, 2.4] }])],
    (P) => [{ start: 0, end: 7, label: "40mm  STEADICAM LEAD", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MS", mm: 40, deg: 0, rise: 0.05 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),
```

**Make it yours.** Change rig: `rig.follow`; lens: 40 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM10-SteadicamLead/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
