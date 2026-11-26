# CAM13-WhipPan: Whip pan

![CAM13-WhipPan preview](preview.gif)

Family: Camera moves on people.

**What it says.** Sudden attention: something pulls our eyes, or one thought snaps to another.

**Use it for.** Joining two people or places with energy; a hidden cut; comedy timing.

**Camera numbers.** 50 mm, a 0.3–0.4 s swing between two held frames; the motion blur carries the join.

**Avoid.** Whipping to a frame that is not composed: the landing must be a clean shot.

## The three.js code

This is an excerpt of the template (8 lines, from `engine/cinematic/src/templates/cameras.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM13-WhipPan", name: "Whip pan", says: "Sudden attention: something pulls our eyes, or one thought snaps to another.", use: "Joining two people or places with energy; a hidden cut; comedy timing.", numbers: "50 mm, a 0.3–0.4 s swing between two held frames; the motion blur carries the join.", avoid: "Whipping to a frame that is not composed: the landing must be a clean shot." },
    [ALEX([{ t: 0, at: [-3.2, -1], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [3.2, -1], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => {
      const pos = V(0, 1.6, 1.7);
      const onA = (t: number) => ({ pos: pos.clone(), target: aimFor(pos, P("ALEX")(t).eye, 50, [0.2, 1 / 3]), mm: 50 });
      const onB = (t: number) => ({ pos: pos.clone(), target: aimFor(pos, P("SAM")(t).eye, 50, [-0.2, 1 / 3]), mm: 50 });
      return [{ start: 0, end: 6, label: "50mm  WHIP PAN · ALEX TO SAM", rig: "TRIPOD · FLUID HEAD", subject: (t) => (t < 2.75 ? "ALEX" : "SAM"), size: "MS", stop: 2.8, cam: rig.whip(onA, onB, 2.6, 0.36), flags: ["whip", "short-side"], cut: "Opens the template" }];
    }),
```

**Make it yours.** Change rig: `rig.whip`; lens: 50 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM13-WhipPan/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
