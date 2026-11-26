# CAM09-SteadicamFollow: Steadicam follow

![CAM09-SteadicamFollow preview](preview.gif)

Family: Camera moves on people.

**What it says.** We go with them, into their world, sharing their point of view.

**Use it for.** Walking into a new space, following toward a destination, immersion.

**Camera numbers.** 32 mm, MS from behind, 3–4 m back, lagging the subject by a beat (about 0.5 s).

**Avoid.** Following the back of someone's head for too long: cut to their face or the destination.

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

make({ id: "CAM09-SteadicamFollow", name: "Steadicam follow", says: "We go with them, into their world, sharing their point of view.", use: "Walking into a new space, following toward a destination, immersion.", numbers: "32 mm, MS from behind, 3–4 m back, lagging the subject by a beat (about 0.5 s).", avoid: "Following the back of someone's head for too long: cut to their face or the destination." },
    [ALEX([{ t: 0.3, at: [0, 7.5] }, { t: 7, at: [0, -1.8] }])],
    (P) => [{ start: 0, end: 7, label: "32mm  STEADICAM FOLLOW", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MS", mm: 32, deg: 180, rise: 0.2 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),
```

**Make it yours.** Change rig: `rig.follow`; lens: 32 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM09-SteadicamFollow/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
