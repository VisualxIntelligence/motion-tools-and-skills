# CAM20-TiltDown: Tilt down

![CAM20-TiltDown preview](preview.gif)

**What it says.** We start on the face and are taken down to what they are standing on, or holding.

**Use it for.** Revealing a weapon, a gift, a body, a clue below the eyeline.

**Camera numbers.** Fixed position 3 m out, 35 mm, the head tilts from the eyes to the boots over 4 s.

**Avoid.** Showing the answer at the start: the face has to give nothing away.

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

make({ id: "CAM20-TiltDown", name: "Tilt down", says: "We start on the face and are taken down to what they are standing on, or holding.", use: "Revealing a weapon, a gift, a body, a clue below the eyeline.", numbers: "Fixed position 3 m out, 35 mm, the head tilts from the eyes to the boots over 4 s.", avoid: "Showing the answer at the start: the face has to give nothing away." },
    [stand(0, 0, 0.2)],
    (P) => { const m = P("ALEX")(0), pos = framed(m, { size: "MS", mm: 35, deg: 0, rise: 0.1 }).pos; return [{ start: 0, end: 7, label: "35mm  TILT DOWN · FACE TO BOOTS", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", sizeEnd: "FS", stop: 4, cam: rig.tiltReveal(pos, m.eye, m.sole.clone().add(V(0, 0.1, 0)), 35, 1, 4.8, 0.3), cut: "Opens the template" }]; }),
```

**Make it yours.** Change rig: `rig.tiltReveal`; lens: 35 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM20-TiltDown/v15-cam20-m.mp4` |
| Another take from the same template | `release-media/CAM20-TiltDown/v15-cam20-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v15-cam20-m.txt`
- `prompts/v15-cam20-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
