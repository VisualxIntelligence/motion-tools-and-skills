# CAM23-PedestalDown: Pedestal down

![CAM23-PedestalDown preview](preview.gif)

**What it says.** We drop from above their eyes to meet them, or to sit beneath their weight.

**Use it for.** Someone sitting, losing, lowering, giving in.

**Camera numbers.** 50 mm, MCU, the camera falls from 0.9 m above to 0.6 m below eye level over 6 s at a steady distance.

**Avoid.** Ending lower than the chin: the frame turns into a power shot you did not mean.

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

make({ id: "CAM23-PedestalDown", name: "Pedestal down", says: "We drop from above their eyes to meet them, or to sit beneath their weight.", use: "Someone sitting, losing, lowering, giving in.", numbers: "50 mm, MCU, the camera falls from 0.9 m above to 0.6 m below eye level over 6 s at a steady distance.", avoid: "Ending lower than the chin: the frame turns into a power shot you did not mean." },
    [stand(0, 0, 0.35)],
    (P) => [{ start: 0, end: 7, label: "50mm  PEDESTAL DOWN", rig: "PEDESTAL · DOLLY", subject: "ALEX", size: "MCU", stop: 3, cam: rig.crane(P("ALEX"), { size: "MCU", mm: 50, deg: 25 }, 0.9, -0.6, 0.3, 6.7, 1, 0.5), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.crane`; lens: 50 mm; shot size: MCU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM23-PedestalDown/v3-cam23-m.mp4` |
| Another take from the same template | `release-media/CAM23-PedestalDown/v3-cam23-t.mp4` |
| Another take from the same template | `release-media/CAM23-PedestalDown/v4-cam23-m.mp4` |
| Another take from the same template | `release-media/CAM23-PedestalDown/v4-cam23-t.mp4` |
| Another take from the same template | `release-media/CAM23-PedestalDown/v6-cam23-m.mp4` |
| Another take from the same template | `release-media/CAM23-PedestalDown/v6-cam23-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v3-cam23-m.txt`
- `prompts/v3-cam23-t.txt`
- `prompts/v4-cam23-m.txt`
- `prompts/v4-cam23-t.txt`
- `prompts/v6-cam23-m.txt`
- `prompts/v6-cam23-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is a mood reference only (palette, light, haze, film feel).", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #3**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel.", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #4**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #5**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel.", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #6**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
