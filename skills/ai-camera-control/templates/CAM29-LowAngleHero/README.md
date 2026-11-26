# CAM29-LowAngleHero: Low angle (power shot)

![CAM29-LowAngleHero preview](preview.gif)

**What it says.** They are bigger than the room: strength, threat, a hero.

**Use it for.** A leader, a villain's entrance, anyone who should loom.

**Camera numbers.** Locked tripod 1.1 m below eye level, 24 mm, MS looking up about 25 degrees, the ceiling or sky behind the head.

**Avoid.** Going so low the face is all chin: keep the eyes in the frame.

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

make({ id: "CAM29-LowAngleHero", name: "Low angle (power shot)", says: "They are bigger than the room: strength, threat, a hero.", use: "A leader, a villain's entrance, anyone who should loom.", numbers: "Locked tripod 1.1 m below eye level, 24 mm, MS looking up about 25 degrees, the ceiling or sky behind the head.", avoid: "Going so low the face is all chin: keep the eyes in the frame." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 6, label: "24mm  LOW ANGLE", rig: "TRIPOD · LOW MOUNT", subject: "ALEX", size: "MS", stop: 4, cam: rig.locked(P("ALEX"), { size: "MS", mm: 24, deg: 15, rise: -1.15 }, 3), cut: "Opens the template" }]),
```

> **Locked camera.** This template does not move the camera. It is kept as a study of the shot, not as a template to send: the drafts made from four locked ANG clips were stiff (see `docs/why/why-no-static-shots.md`).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |

No Seedance result is included: locked camera: parked until given real motion.

The pill clip was rendered for this repo with the current engine. It has not been sent to Seedance, so there is no prompt yet: write one from `docs/prompt-anatomy.md` and the neighbouring templates' prompts.

## The prompt

No prompt was recorded for this template.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.


See `reproduce.md` to render it and send it yourself.
