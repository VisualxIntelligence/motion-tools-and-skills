# CAM37-SliderPortrait: Slider on the face

![CAM37-SliderPortrait preview](preview.gif)

**What it says.** A small, slow slide across a face: the thought moving behind the eyes.

**Use it for.** Close-ups that need life without a push: interviews, quiet beats.

**Camera numbers.** 85 mm, MCU, a 0.9 m slide over 6 s, the aim held on the eyes so the background shifts behind them.

**Avoid.** A fast slide: it should be felt, not noticed.

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

make({ id: "CAM37-SliderPortrait", name: "Slider on the face", says: "A small, slow slide across a face: the thought moving behind the eyes.", use: "Close-ups that need life without a push: interviews, quiet beats.", numbers: "85 mm, MCU, a 0.9 m slide over 6 s, the aim held on the eyes so the background shifts behind them.", avoid: "A fast slide: it should be felt, not noticed." },
    [stand(0, 0, 0.3)],
    (P) => { const m = P("ALEX")(0), pos0 = framed(m, { size: "MCU", mm: 85, deg: 12 }).pos, sd = side(pos0, m.eye); return [{ start: 0, end: 7, label: "85mm  SLIDER", rig: "SLIDER", subject: "ALEX", size: "MCU", stop: 2, cam: rig.truck(pos0.clone().add(sd.clone().multiplyScalar(-0.45)), pos0.clone().add(sd.clone().multiplyScalar(0.45)), V(0, 0, -1), 85, 0.3, 6.7, () => P("ALEX")(0).eye, 0.4), cut: "Opens the template" }]; }),
```

**Make it yours.** Change rig: `rig.truck`; lens: 85 mm; shot size: MCU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM37-SliderPortrait/v12-cam37-m.mp4` |
| Another take from the same template | `release-media/CAM37-SliderPortrait/v12-cam37-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v12-cam37-m.txt`
- `prompts/v12-cam37-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
