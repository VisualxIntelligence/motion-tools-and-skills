# CAM34-POVLookAround: POV look around

![CAM34-POVLookAround preview](preview.gif)

**What it says.** Someone standing still turns their head, and we turn with it.

**Use it for.** Entering a room, checking for danger, a search from one spot.

**Camera numbers.** 24 mm at eye height, a head turn of 100 degrees left to right over 6 s, a small pause at each end.

**Avoid.** A whip: heads turn, then stop, then turn again.

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

make({ id: "CAM34-POVLookAround", name: "POV look around", says: "Someone standing still turns their head, and we turn with it.", use: "Entering a room, checking for danger, a search from one spot.", numbers: "24 mm at eye height, a head turn of 100 degrees left to right over 6 s, a small pause at each end.", avoid: "A whip: heads turn, then stop, then turn again." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "24mm  POV LOOK AROUND", rig: "BODY RIG · POV", subject: "ALEX", size: "WS", stop: 2.8, cam: (t: number): Cam => { const m = P("ALEX")(t), f = (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize(); const a = (-50 + 100 * smoother(ramp(t, 0.8, 6.2))) * Math.PI / 180; const pos = m.eye.clone().add(f.clone().multiplyScalar(0.4)); return { pos, target: pos.clone().add(f.applyAxisAngle(V(0, 1, 0), a).multiplyScalar(8)).add(V(0, -0.3, 0)), mm: 24 }; }, cut: "Opens the template" }]),
```

**Make it yours.** Change lens: 24 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |

No Seedance result is included: POV: no person in frame by design.

The pill clip was rendered for this repo with the current engine. It has not been sent to Seedance, so there is no prompt yet: write one from `docs/prompt-anatomy.md` and the neighbouring templates' prompts.

## The prompt

No prompt was recorded for this template.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.


See `reproduce.md` to render it and send it yourself.
