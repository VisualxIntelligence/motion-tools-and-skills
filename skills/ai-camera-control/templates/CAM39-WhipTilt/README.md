# CAM39-WhipTilt: Whip tilt

![CAM39-WhipTilt preview](preview.gif)

**What it says.** The eye is dragged up and away: a thought snapping to somewhere else.

**Use it for.** A transition to the sky, a hidden cut up into the next scene.

**Camera numbers.** 35 mm on a locked tripod, a 0.35 s vertical whip from MS up to the sky, then the shot ends in blur.

**Avoid.** Slowing down: a whip is a whip only at speed.

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

make({ id: "CAM39-WhipTilt", name: "Whip tilt", says: "The eye is dragged up and away: a thought snapping to somewhere else.", use: "A transition to the sky, a hidden cut up into the next scene.", numbers: "35 mm on a locked tripod, a 0.35 s vertical whip from MS up to the sky, then the shot ends in blur.", avoid: "Slowing down: a whip is a whip only at speed." },
    [stand(0, 0, 0.25)],
    (P) => { const pos = framed(P("ALEX")(0), { size: "MS", mm: 35, deg: 20 }).pos; const a = (t: number): Cam => ({ pos: pos.clone(), target: aimFor(pos, P("ALEX")(t).eye, 35, [0, 1 / 3]), mm: 35 }); const b = (): Cam => ({ pos: pos.clone(), target: V(pos.x + 2, 60, pos.z - 10), mm: 35 }); return [{ start: 0, end: 4.5, label: "35mm  WHIP TILT UP", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", stop: 4, cam: rig.whip(a, b, 3.2, 0.35), cut: "Opens the template" }]; }),
```

**Make it yours.** Change rig: `rig.whip`; lens: 35 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM39-WhipTilt/v15-cam39-m.mp4` |
| Another take from the same template | `release-media/CAM39-WhipTilt/v15-cam39-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v15-cam39-m.txt`
- `prompts/v15-cam39-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 5 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 656.1 credits.
- **video #2**: 5 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 656.1 credits.

See `reproduce.md` to render it and send it yourself.
