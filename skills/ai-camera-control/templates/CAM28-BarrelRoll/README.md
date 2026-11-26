# CAM28-BarrelRoll: Barrel roll

![CAM28-BarrelRoll preview](preview.gif)

**What it says.** The whole world turns over around them.

**Use it for.** Disorientation, a fall, a crash, a leap into something new.

**Camera numbers.** 28 mm, MS, a full 360 degree roll about the lens axis over 5 s, eased, the subject kept centred.

**Avoid.** Doing it fast: a slow roll reads as a dream, a quick one as a stunt.

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

make({ id: "CAM28-BarrelRoll", name: "Barrel roll", says: "The whole world turns over around them.", use: "Disorientation, a fall, a crash, a leap into something new.", numbers: "28 mm, MS, a full 360 degree roll about the lens axis over 5 s, eased, the subject kept centred.", avoid: "Doing it fast: a slow roll reads as a dream, a quick one as a stunt." },
    [stand(0, 0, 0.25)],
    (P) => [{ start: 0, end: 7, label: "28mm  BARREL ROLL 360", rig: "ROLL RIG", subject: "ALEX", size: "MS", stop: 4, cam: withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 20 }, 3), (t) => Math.PI * 2 * smoother(ramp(t, 0.8, 5.8))), cut: "Opens the template", flags: ["compound"] }]),
```

> **Locked camera.** This template does not move the camera. It is kept as a study of the shot, not as a template to send: the drafts made from four locked ANG clips were stiff (see `docs/why/why-no-static-shots.md`).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/barrel-roll-p2.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/barrel-roll-p3.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/barrel-roll-t.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/barrel-roll-t2.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/barrel-roll-v2.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/barrel-roll.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/v13-cam28-m.mp4` |
| Another take from the same template | `release-media/CAM28-BarrelRoll/v13-cam28-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/barrel-roll-p2.txt`
- `prompts/barrel-roll-p3.txt`
- `prompts/barrel-roll-t.txt`
- `prompts/barrel-roll-t2.txt`
- `prompts/barrel-roll-v2.txt`
- `prompts/barrel-roll.txt`
- `prompts/v13-cam28-m.txt`
- `prompts/v13-cam28-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = whole environment contact sheet (4 panels, 2x2) as place/mood reference; prompt says: "@image2 is the reference for the real place and its mood: four photographs of the same location from different angles, laid out as a two by two contac"; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is the reference for the real place and its mood: one photograph of the location the shot takes place in."; confirmed: yes; 1020.6 credits.
- **video #3**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is a mood reference only: it shows the colour palette, the quality and temperature of the light, the haze, glow, softness and contrast, the te"; confirmed: yes; 1020.6 credits.
- **video #4**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.
- **video #5**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.
- **video #6**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is the reference for the real place and its mood: one photograph of the location the shot takes place in."; confirmed: yes; 1020.6 credits.
- **video #7**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #8**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
