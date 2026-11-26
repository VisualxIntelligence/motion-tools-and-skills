# CAM17-SlowZoomIn: Slow zoom in

![CAM17-SlowZoomIn preview](preview.gif)

**What it says.** Something is closing in on them, and they do not know it.

**Use it for.** Dread, a held thought, a stare that goes on a beat too long (the Kubrick creep).

**Camera numbers.** Locked tripod, 35 to 85 mm over 6 s, MS to MCU, eased at both ends. Nothing in the frame moves but the lens.

**Avoid.** A fast zoom (that is a crash zoom) or a zoom while the subject walks at us: it reads as a mistake.

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

make({ id: "CAM17-SlowZoomIn", name: "Slow zoom in", says: "Something is closing in on them, and they do not know it.", use: "Dread, a held thought, a stare that goes on a beat too long (the Kubrick creep).", numbers: "Locked tripod, 35 to 85 mm over 6 s, MS to MCU, eased at both ends. Nothing in the frame moves but the lens.", avoid: "A fast zoom (that is a crash zoom) or a zoom while the subject walks at us: it reads as a mistake." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "35>85mm  SLOW ZOOM IN", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 4, cam: rig.zoom(P("ALEX"), { size: "MS", mm: 35, deg: 25 }, 85, 0.4, 6.6, 0, 0.6), cut: "Opens the template" }]),
```

**Make it yours.** Change rig: `rig.zoom`; lens: 35 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM17-SlowZoomIn/v10-cam17-m.mp4` |
| Another take from the same template | `release-media/CAM17-SlowZoomIn/v10-cam17-t.mp4` |
| Another take from the same template | `release-media/CAM17-SlowZoomIn/zoom-in-p2.mp4` |
| Another take from the same template | `release-media/CAM17-SlowZoomIn/zoom-in-p3.mp4` |
| Another take from the same template | `release-media/CAM17-SlowZoomIn/zoom-in.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v10-cam17-m.txt`
- `prompts/v10-cam17-t.txt`
- `prompts/zoom-in-p2.txt`
- `prompts/zoom-in-p3.txt`
- `prompts/zoom-in-t2.txt`
- `prompts/zoom-in.txt`

> At least one file here is a rebuilt copy: the prompt that was sent was not kept. Treat it as an example of the wording, not a record.

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1020.6 credits.
- **video #2**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1020.6 credits.
- **video #3**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = whole environment contact sheet (4 panels, 2x2) as place/mood reference; prompt says: "@image2 is the reference for the real place and its mood: four photographs of the same location from different angles, laid out as a two by two contac"; confirmed: yes; 1020.6 credits.
- **video #4**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is the reference for the real place and its mood: one photograph of the location the shot takes place in.", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #5**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is a mood reference only: it shows the colour palette, the quality and temperature of the light, the haze, glow, softness and contrast, the te", @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes; 1020.6 credits.
- **video #6**: 7 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @audio1 = the author's voice recording (not included): timbre, pace and accent for Alex's spoken line; confirmed: yes.

See `reproduce.md` to render it and send it yourself.
