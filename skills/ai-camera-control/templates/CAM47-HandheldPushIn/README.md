# CAM47-HandheldPushIn: Handheld push-in

![CAM47-HandheldPushIn preview](preview.gif)

**What it says.** We lean in with a shaking body: fear, a secret, something we should not see.

**Use it for.** Documentary tension, a confession, a character cornered.

**Camera numbers.** 40 mm, MS to MCU over 6 s, a handheld shake of amount 2, eyes on the upper third.

**Avoid.** A shake so big it looks like a fault: it should feel like breath.

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

make({ id: "CAM47-HandheldPushIn", name: "Handheld push-in", says: "We lean in with a shaking body: fear, a secret, something we should not see.", use: "Documentary tension, a confession, a character cornered.", numbers: "40 mm, MS to MCU over 6 s, a handheld shake of amount 2, eyes on the upper third.", avoid: "A shake so big it looks like a fault: it should feel like breath." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.4 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "40mm  HANDHELD PUSH-IN", rig: "HANDHELD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 3, cam: rig.shake(rig.dolly(P("ALEX"), { size: "MS", mm: 40, deg: 28 }, "MCU", 0.3, 6.7, 0.5), 2, 6), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.dolly`, `rig.shake`; lens: 40 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM47-HandheldPushIn/v15-cam47-m.mp4` |
| Another take from the same template | `release-media/CAM47-HandheldPushIn/v15-cam47-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v15-cam47-m.txt`
- `prompts/v15-cam47-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
