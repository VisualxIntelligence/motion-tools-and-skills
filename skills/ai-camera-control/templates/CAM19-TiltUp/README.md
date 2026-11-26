# CAM19-TiltUp: Tilt up

![CAM19-TiltUp preview](preview.gif)

**What it says.** We meet them from the ground up: boots, body, then the face.

**Use it for.** A hero introduction, a character entrance, scale.

**Camera numbers.** Fixed low position 2 m out, 24 mm, the head tilts from the boots to the eyes over 4 s, then holds the face for 2 s.

**Avoid.** Tilting past the head into empty sky.

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

make({ id: "CAM19-TiltUp", name: "Tilt up", says: "We meet them from the ground up: boots, body, then the face.", use: "A hero introduction, a character entrance, scale.", numbers: "Fixed low position 2 m out, 24 mm, the head tilts from the boots to the eyes over 4 s, then holds the face for 2 s.", avoid: "Tilting past the head into empty sky." },
    [stand(0, 0, 0.2)],
    (P) => { const m = P("ALEX")(0), pos = framed(m, { size: "MS", mm: 24, deg: 0, rise: -0.8 }).pos; return [{ start: 0, end: 7, label: "24mm  TILT UP · BOOTS TO FACE", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 4, cam: rig.tiltReveal(pos, m.sole.clone().add(V(0, 0.15, 0)), m.eye, 24, 0.3, 4.6, 0.3), cut: "Opens the template" }]; }),
```

**Make it yours.** Change rig: `rig.tiltReveal`; lens: 24 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM19-TiltUp/tilt-up-p2.mp4` |
| Another take from the same template | `release-media/CAM19-TiltUp/tilt-up-p3.mp4` |
| Another take from the same template | `release-media/CAM19-TiltUp/tilt-up.mp4` |
| Another take from the same template | `release-media/CAM19-TiltUp/v11-cam19-m.mp4` |
| Another take from the same template | `release-media/CAM19-TiltUp/v11-cam19-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/tilt-up-p2.txt`
- `prompts/tilt-up-p3.txt`
- `prompts/tilt-up-t2.txt`
- `prompts/tilt-up.txt`
- `prompts/v11-cam19-m.txt`
- `prompts/v11-cam19-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = whole environment contact sheet (4 panels, 2x2) as place/mood reference; prompt says: "@image2 is the reference for the real place and its mood: four photographs of the same location from different angles, laid out as a two by two contac"; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 3); prompt says: "@image2 is the reference for the real place and its mood: one photograph of the location the shot takes place in."; confirmed: yes; 1020.6 credits.
- **video #3**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 3); prompt says: "@image2 is a mood reference only: it shows the colour palette, the quality and temperature of the light, the haze, glow, softness and contrast, the te"; confirmed: yes; 1020.6 credits.
- **video #4**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes.
- **video #5**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #6**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
