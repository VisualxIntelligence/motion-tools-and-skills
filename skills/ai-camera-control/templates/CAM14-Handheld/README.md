# CAM14-Handheld: Handheld

![CAM14-Handheld preview](preview.gif)

Family: Camera moves on people.

**What it says.** We are there, unsteady with them: urgency, nerves, documentary truth.

**Use it for.** Panic, intimacy, chaos, found-footage; contrast with a calm locked-off scene.

**Camera numbers.** 40 mm, MCU, rotation shake mostly (0.3–3.5 Hz layered), small amplitude; breathing, not earthquakes.

**Avoid.** Shake on a long lens or on every shot of a film: it stops meaning anything.

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

make({ id: "CAM14-Handheld", name: "Handheld", says: "We are there, unsteady with them: urgency, nerves, documentary truth.", use: "Panic, intimacy, chaos, found-footage; contrast with a calm locked-off scene.", numbers: "40 mm, MCU, rotation shake mostly (0.3–3.5 Hz layered), small amplitude; breathing, not earthquakes.", avoid: "Shake on a long lens or on every shot of a film: it stops meaning anything." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.2 }], [{ kind: "lookUp", t0: 2.5, t1: 4.8 }])],
    (P) => [{ start: 0, end: 6, label: "40mm  HANDHELD MCU", rig: "HANDHELD", subject: "ALEX", size: "MCU", stop: 2, cam: rig.locked(P("ALEX"), { size: "MCU", mm: 40, deg: 22, rise: 0.05 }, 3), cut: "Opens the template" }]),
```

> **Locked camera.** This template does not move the camera. It is kept as a study of the shot, not as a template to send: the drafts made from four locked ANG clips were stiff (see `docs/why/why-no-static-shots.md`).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM14-Handheld/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
