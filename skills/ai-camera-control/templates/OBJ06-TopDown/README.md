# OBJ06-TopDown: Top-down (god's eye)

![OBJ06-TopDown preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Pattern and fate: we look down like a map; the people below are pieces.

**Use it for.** Showing layout and geography, a body or an object on the ground, transitions between scenes.

**Camera numbers.** 35 mm straight down from 10–15 m, a slow rotation of 20–30° over 6 s.

**Avoid.** Overhead for emotion: it distances; use it to explain space.

## The three.js code

This is an excerpt of the template (3 lines, from `engine/cinematic/src/templates/objects.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ06-TopDown", name: "Top-down (god's eye)", says: "Pattern and fate: we look down like a map; the people below are pieces.", use: "Showing layout and geography, a body or an object on the ground, transitions between scenes.", numbers: "35 mm straight down from 10–15 m, a slow rotation of 20–30° over 6 s.", avoid: "Overhead for emotion: it distances; use it to explain space." },
    [prop("CAR", "Car", "car", [0, 0], 0.6, "slate"), ALEX([2.6, 1.2], -1.8)],
    () => [{ start: 0, end: 6, label: "35mm  TOP-DOWN · SLOW ROTATE", rig: "TECHNOCRANE · REMOTE HEAD", subject: "CAR", size: "WS", stop: 5.6, cam: (t) => { const a = 0.55 * smoother(t / 6); return { pos: V(Math.sin(a) * 0.2, 14, Math.cos(a) * 0.2), target: V(0, 0, 0), mm: 35, roll: -a }; }, cut: "Opens the template", flags: ["centre"] }]),
```

**Make it yours.** Change lens: 35 mm; shot size: WS. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ06-TopDown/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 6 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout), @image1 = person photo (face reference); confirmed: yes; 874.8 credits.

See `reproduce.md` to render it and send it yourself.
