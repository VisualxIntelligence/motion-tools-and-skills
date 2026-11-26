# ANG01-ExtremeWide: Extreme wide shot

![ANG01-ExtremeWide preview](preview.gif)

**What it says.** The place is the subject, and the person is small inside it.

**Use it for.** Opening a scene, loneliness, scale, a journey's end.

**Camera numbers.** 24 mm, EWS from 40 m, locked off. The figure fills about a twentieth of the frame height.

**Avoid.** Cutting to it with nothing to read: the figure must still be findable.

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

make({ id: "ANG01-ExtremeWide", name: "Extreme wide shot", says: "The place is the subject, and the person is small inside it.", use: "Opening a scene, loneliness, scale, a journey's end.", numbers: "24 mm, EWS from 40 m, locked off. The figure fills about a twentieth of the frame height.", avoid: "Cutting to it with nothing to read: the figure must still be findable." },
    [stand(0, 0)], hold("24mm  EXTREME WIDE", "TRIPOD", "EWS", (P) => rig.locked(P("ALEX"), { size: "EWS", mm: 24, deg: 25, rise: 1.5 }, 3))),
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
