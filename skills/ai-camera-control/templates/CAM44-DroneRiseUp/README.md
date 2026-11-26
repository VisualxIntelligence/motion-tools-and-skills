# CAM44-DroneRiseUp: Drone rise up

![CAM44-DroneRiseUp preview](preview.gif)

**What it says.** We lift straight up off the spot and see how small it all is.

**Use it for.** Endings, a character in a vast place, a long look at the ground.

**Camera numbers.** 24 mm, the camera rises from 1 m to 24 m over 8 s looking down, the subject centred.

**Avoid.** Drifting sideways while it rises: the lift is vertical.

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

make({ id: "CAM44-DroneRiseUp", name: "Drone rise up", says: "We lift straight up off the spot and see how small it all is.", use: "Endings, a character in a vast place, a long look at the ground.", numbers: "24 mm, the camera rises from 1 m to 24 m over 8 s looking down, the subject centred.", avoid: "Drifting sideways while it rises: the lift is vertical." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 9, label: "24mm  DRONE RISE UP", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "WS", mm: 24, deg: 30 }, 1, 24, 0.4, 8.6, 0.4, 0.5), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.crane`; lens: 24 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |

No Seedance result is included: drone: pin stays tiny.

The pill clip was rendered for this repo with the current engine. It has not been sent to Seedance, so there is no prompt yet: write one from `docs/prompt-anatomy.md` and the neighbouring templates' prompts.

## The prompt

No prompt was recorded for this template.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.


See `reproduce.md` to render it and send it yourself.
