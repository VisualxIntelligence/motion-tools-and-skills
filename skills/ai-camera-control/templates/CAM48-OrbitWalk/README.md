# CAM48-OrbitWalk: Orbit a walker

![CAM48-OrbitWalk preview](preview.gif)

**What it says.** They walk, and the whole world swings round them as they go.

**Use it for.** A hero walk, a character arriving at a decision while still moving.

**Camera numbers.** 35 mm, MS, the subject walks 6 m at 1 m/s while the camera arcs 130 degrees round them over 7 s.

**Avoid.** Orbiting at the walker's speed: the arc has to be slower, or it looks like a turntable.

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

make({ id: "CAM48-OrbitWalk", name: "Orbit a walker", says: "They walk, and the whole world swings round them as they go.", use: "A hero walk, a character arriving at a decision while still moving.", numbers: "35 mm, MS, the subject walks 6 m at 1 m/s while the camera arcs 130 degrees round them over 7 s.", avoid: "Orbiting at the walker's speed: the arc has to be slower, or it looks like a turntable." },
    [ALEX([{ t: 0.3, at: [-3, 2.5] }, { t: 7.2, at: [3, -3] }])],
    (P) => [{ start: 0, end: 8, label: "35mm  ORBIT A WALKER", rig: "TECHNOCRANE ORBIT", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35 }, 20, 150, 0.3, 7.5, 0, 0.5), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "compound"] }]),
```

**Make it yours.** Change rig: `rig.orbit`; lens: 35 mm; shot size: MS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **pin** (a head on a slim body). Render the other with `--standin capsule`.

| What | File |
|---|---|
| The 3D pill clip, the reference video | `pill.mp4` |
| Another take from the same template | `release-media/CAM48-OrbitWalk/v3-cam48-m.mp4` |
| Another take from the same template | `release-media/CAM48-OrbitWalk/v3-cam48-t.mp4` |
| Another take from the same template | `release-media/CAM48-OrbitWalk/v4-cam48-m.mp4` |
| Another take from the same template | `release-media/CAM48-OrbitWalk/v4-cam48-t.mp4` |
| Another take from the same template | `release-media/CAM48-OrbitWalk/v6-cam48-m.mp4` |
| Another take from the same template | `release-media/CAM48-OrbitWalk/v6-cam48-t.mp4` |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/v3-cam48-m.txt`
- `prompts/v3-cam48-t.txt`
- `prompts/v4-cam48-m.txt`
- `prompts/v4-cam48-t.txt`
- `prompts/v6-cam48-m.txt`
- `prompts/v6-cam48-t.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 8 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is a mood reference only (palette, light, haze, film feel)."; confirmed: yes; 1166.4 credits.
- **video #2**: 8 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1166.4 credits.
- **video #3**: 8 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1166.4 credits.
- **video #4**: 8 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1166.4 credits.
- **video #5**: 8 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard), @image2 = ONE panel of the environment contact sheet (panel 1); prompt says: "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel."; confirmed: yes; 1166.4 credits.
- **video #6**: 8 s, draft (480p preview), 21:9; references: @video1 = coarse blockout clip (grey clay set, striped capsule/pin stand-in); carries camera, framing, size and timing; no sound, @image1 = Alex's face photo: identity only (features, hair, beard); confirmed: yes; 1166.4 credits.

See `reproduce.md` to render it and send it yourself.
