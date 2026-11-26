# ANG16-DutchLow: Dutch and low

![ANG16-DutchLow preview](preview.gif)

**What it says.** The room is crooked and they loom: a threat who is off balance too.

**Use it for.** A villain who has lost control, a hallucination, a hero in trouble.

**Camera numbers.** 20 mm, MS from 1.1 m below eye level, rolled 14 degrees.

**Avoid.** Doing it with a calm face: the actor has to carry the unease too.

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

make({ id: "ANG16-DutchLow", name: "Dutch and low", says: "The room is crooked and they loom: a threat who is off balance too.", use: "A villain who has lost control, a hallucination, a hero in trouble.", numbers: "20 mm, MS from 1.1 m below eye level, rolled 14 degrees.", avoid: "Doing it with a calm face: the actor has to carry the unease too." },
    [stand(0, 0)], hold("20mm  DUTCH LOW", "TRIPOD · TILTED HEAD", "MS", (P) => withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 20, deg: 15, rise: -1.1 }, 3), (14 * Math.PI) / 180))),
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
