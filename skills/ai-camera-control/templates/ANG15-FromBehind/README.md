# ANG15-FromBehind: From behind

![ANG15-FromBehind preview](preview.gif)

**What it says.** We stay behind them, facing what they face.

**Use it for.** A decision about to be made, an entrance into a room, a long look at something we cannot see yet.

**Camera numbers.** 40 mm, MS from behind at 3 m, level, the shoulders filling the lower third.

**Avoid.** Showing the face at the end: the choice to withhold it is the point.

## The three.js code

This is an excerpt of the template (2 lines, from `engine/cinematic/src/templates/angles.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG15-FromBehind", name: "From behind", says: "We stay behind them, facing what they face.", use: "A decision about to be made, an entrance into a room, a long look at something we cannot see yet.", numbers: "40 mm, MS from behind at 3 m, level, the shoulders filling the lower third.", avoid: "Showing the face at the end: the choice to withhold it is the point." },
    [stand(0, 0, 0)], hold("40mm  FROM BEHIND", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 180 }, 3))),
```

> **Locked camera.** This template does not move the camera. It is kept as a study of the shot, not as a template to send: the drafts made from four locked ANG clips were stiff (see `docs/why/why-no-static-shots.md`).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |

No Seedance result is included: locked-off angle: no camera motion, so the no-static-shots rule skips it.

The pill clip was rendered for this repo with the current engine. It has not been sent to Seedance, so there is no prompt yet: write one from `docs/prompt-anatomy.md` and the neighbouring templates' prompts.

## The prompt

No prompt was recorded for this template.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.


See `reproduce.md` to render it and send it yourself.
