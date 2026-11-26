# ANG39-LeadingLines: Leading lines

![ANG39-LeadingLines preview](preview.gif)

**What it says.** Every line in the ground runs to one person.

**Use it for.** Directing the eye without a cut, a long approach, a destination.

**Camera numbers.** 24 mm at 0.7 m height, centred on a paving joint, the person 16 m away where the lines meet.

**Avoid.** Lines that run past the subject: they must end on them.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/angles.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG39-LeadingLines", name: "Leading lines", says: "Every line in the ground runs to one person.", use: "Directing the eye without a cut, a long approach, a destination.", numbers: "24 mm at 0.7 m height, centred on a paving joint, the person 16 m away where the lines meet.", avoid: "Lines that run past the subject: they must end on them." },
    [ALEX([{ t: 0, at: [0, -9], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "24mm  LEADING LINES", rig: "GROUND MOUNT", subject: "ALEX", size: "WS", stop: 8, cam: () => ({ pos: V(0, 0.7, 7), target: V(0, 0.9, -9), mm: 24 }), cut: "Opens the template" }]),
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
