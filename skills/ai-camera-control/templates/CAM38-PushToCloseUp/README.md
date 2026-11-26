# CAM38-PushToCloseUp: Push to the close-up

![CAM38-PushToCloseUp preview](preview.gif)

**What it says.** We go in until nothing is left but the face.

**Use it for.** The moment of decision, a lie being told, a tear.

**Camera numbers.** 85 mm, MCU to CU over 6 s, a slow dolly, the eyes kept on the upper third.

**Avoid.** Pushing past the face into a detail: stop while both eyes are still in frame.

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

make({ id: "CAM38-PushToCloseUp", name: "Push to the close-up", says: "We go in until nothing is left but the face.", use: "The moment of decision, a lie being told, a tear.", numbers: "85 mm, MCU to CU over 6 s, a slow dolly, the eyes kept on the upper third.", avoid: "Pushing past the face into a detail: stop while both eyes are still in frame." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.35 }], [{ kind: "lookDown", t0: 1.5, t1: 4 }])],
    (P) => [{ start: 0, end: 7, label: "85mm  PUSH TO THE CLOSE-UP", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 85, deg: 15 }, "CU", 0.3, 6.7, 0.6), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.dolly`; lens: 85 mm; shot size: MCU. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v3-cam38-m.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v3-cam38-t.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v4-cam38-m.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v4-cam38-t.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v6-cam38-m.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v6-cam38-t.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v7-cam38-m.mp4` |
| Another take from the same template | `release-media/CAM38-PushToCloseUp/v7-cam38-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v3-cam38-m.txt`
- `prompts/v3-cam38-t.txt`
- `prompts/v4-cam38-m.txt`
- `prompts/v4-cam38-t.txt`
- `prompts/v6-cam38-m.txt`
- `prompts/v6-cam38-t.txt`
- `prompts/v7-cam38-m.txt`
- `prompts/v7-cam38-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is a mood reference only (palette, light, haze, film feel).", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #3**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel.", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #4**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #5**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel.", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #6**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #7**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #8**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
