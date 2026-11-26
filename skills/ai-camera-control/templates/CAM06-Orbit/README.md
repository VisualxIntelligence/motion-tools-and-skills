# CAM06-Orbit: Orbit

![CAM06-Orbit preview](preview.gif)

Family: Camera moves on people.

**What it says.** Everything turns around this person: a standoff, a decision, a hero moment.

**Use it for.** A character at the centre of a turning point; showing the space around them in one move.

**Camera numbers.** 35 mm, MS, 90–180° over 5–8 s (≤ 30°/s), eased, with a slight rise.

**Avoid.** Orbiting just for motion: it says this person is the axis of the scene.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/cameras.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM06-Orbit", name: "Orbit", says: "Everything turns around this person: a standoff, a decision, a hero moment.", use: "A character at the centre of a turning point; showing the space around them in one move.", numbers: "35 mm, MS, 120° over 7 s (about 17°/s on average, peak near 58°/s), eased, no rise.", avoid: "Orbiting just for motion: it says this person is the axis of the scene." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0 }])],
    (P) => [{ start: 0, end: 7, label: "35mm  ORBIT 120", rig: "TECHNOCRANE ORBIT", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35, rise: 0 }, 20, 140, 0, 7, 0.6), cut: "Opens the template", flags: ["compound"] }]),
```

**Make it yours.** Change rig: `rig.orbit`; lens: 35 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| The contact sheet (sketch route) | `sketch-sheet.jpg` |
| What Seedance made from the pill clip (480p draft) | `release-media/CAM06-Orbit/result.mp4` (release asset) |
| What Seedance made from the contact sheet | `release-media/CAM06-Orbit/sketch-output.mp4` (release asset) |
| Camera only, no subject | `release-media/CAM06-Orbit/plate.mp4` and what it made: `release-media/CAM06-Orbit/plate-made.mp4` |
| The same move in other looks (ink, pencil, ghost, plate, boxes, clay, hand) | `release-media/CAM06-Orbit/looks/` |
| Another take from the same template | `release-media/CAM06-Orbit/ink-sketch-ink-cam06.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/camera-only-video.txt`
- `prompts/ink-sketch-recovered-sheet.txt`
- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.
- **camera-only-video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 1020.6 credits.
- **ink-sketch #1**: 7 s, draft (480p preview), 21:9; references: @image1 = person photo (face reference), @image2 = pill contact sheet (the sketch route); confirmed: yes; 855.4 credits.

See `reproduce.md` to render it and send it yourself.
