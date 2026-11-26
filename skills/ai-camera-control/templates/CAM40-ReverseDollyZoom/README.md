# CAM40-ReverseDollyZoom: Reverse dolly zoom

![CAM40-ReverseDollyZoom preview](preview.gif)

**What it says.** The room opens up behind them while they stay the same size: the world is leaving.

**Use it for.** Release, shock after the event, someone stepping out of something.

**Camera numbers.** Hold MCU while the lens goes 90 to 32 mm and the camera pulls out to match, over 5 s.

**Avoid.** Letting the subject change size: that is the whole trick.

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

make({ id: "CAM40-ReverseDollyZoom", name: "Reverse dolly zoom", says: "The room opens up behind them while they stay the same size: the world is leaving.", use: "Release, shock after the event, someone stepping out of something.", numbers: "Hold MCU while the lens goes 90 to 32 mm and the camera pulls out to match, over 5 s.", avoid: "Letting the subject change size: that is the whole trick." },
    [stand(0, 3, 0)],
    (P) => [{ start: 0, end: 6, label: "90>32mm  REVERSE DOLLY ZOOM", rig: "DOLLY · ZOOM", subject: "ALEX", size: "MCU", stop: 4, cam: rig.dollyZoom(P("ALEX"), "MCU", 90, 32, 0, 0, 6, 0.6), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.dollyZoom`; shot size: MCU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM40-ReverseDollyZoom/v13-cam40-m.mp4` |
| Another take from the same template | `release-media/CAM40-ReverseDollyZoom/v13-cam40-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v13-cam40-m.txt`
- `prompts/v13-cam40-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 2); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 874.8 credits.
- **video #2**: 6 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
