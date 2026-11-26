# OBJ13-MacroSlider: Macro slider

![OBJ13-MacroSlider preview](preview.gif)

Family: Camera moves on objects.

**What it says.** Look closely: a small thing, made precious by the time we take over it.

**Use it for.** Product details, clues, keepsakes; the insert before someone opens or takes it.

**Camera numbers.** 100 mm at T2, the lens 0.25 m above the case top and 4.2 m from it (the case half the frame width), a 0.72 m slide over 7 s (0.08 m/s, a creep) with the aim held parallel, so the case drifts across a third of the frame; bottles 2.7 m from the lens pass through the bottom of the frame as soft shapes.

**Avoid.** Sliding past nothing: without foreground or background layers a slider reads as a pan.

## The three.js code

This is an excerpt of the template (6 lines, from `engine/cinematic/src/templates/oners.ts`). `template.ts` in this folder is the same code with its imports. The helpers it calls (`make`, the actors, the rigs, the set and the post chain) are in `engine/cinematic/src`, so it does not run on its own: render it with `tools/render-pill.sh`.

```ts
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec, PathKey } from "../kit/actors";
import { GREY, clay, shadeAll } from "../kit/clay";
import { framed, lag, rig, type Subj } from "../kit/rigs";
import { aimFor } from "../framer";
import { barrel, bench, broadTree, building, crate, floorLamp, ground, lampPost, pine, rock, scatter, shelf, sofa, table } from "../kit/props";
import { buildLab } from "./lab";
import { lerp, ramp, rng, smooth, smoother } from "../util";
import type { Marks } from "../marks";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ13-MacroSlider", name: "Macro slider", says: "Look closely: a small thing, made precious by the time we take over it.", use: "Product details, clues, keepsakes; the insert before someone opens or takes it.", numbers: "100 mm at T2, the lens 0.25 m above the case top and 4.2 m from it (the case half the frame width), a 0.72 m slide over 7 s (0.08 m/s, a creep) with the aim held parallel, so the case drifts across a third of the frame; bottles 2.7 m from the lens pass through the bottom of the frame as soft shapes.", avoid: "Sliding past nothing: without foreground or background layers a slider reads as a pan." },
    { ...LAB, build: buildSlider, motes: { center: [0, 0.7, 0.6], size: [4, 1.2, 4], count: 160, drift: [0.02, 0.006, 0.01] } },
    [{ id: "CASE", name: "Suitcase", kind: "prop", model: "suitcase", tint: "rose", path: [{ t: 0, at: [0.02, 0.68, 0.0], yaw: 0.55 }] }],
    () => [{ start: 0, end: 7, label: "100mm  MACRO SLIDER", rig: "SLIDER", subject: "CASE", size: "INSERT", stop: 2, shadow: 4,
      cam: rig.truck(V(-0.36, 1.25, 4.2), V(0.36, 1.25, 4.2), V(0.0, -0.045, -1), 100, 0, 7, undefined, 0.7),
      cut: "Opens the template", flags: ["centre", "wipe"] }]),
```

**Make it yours.** Change rig: `rig.truck`. The actor `path` entries say where the pill stands and walks, and the numbers after `rig.` set the move (distance, angle, rise, start and end time).

## The videos

The stand-in in `pill.mp4` is the **capsule** (the single striped capsule of the first gallery clips). Render the other with `--standin pin`.

| What | File |
|---|---|
| The 3D pill clip, the reference video (a re-render: the clip that was uploaded was not kept) | `pill.mp4` |
| What Seedance made from the pill clip (480p draft) | `release-media/OBJ13-MacroSlider/result.mp4` (release asset) |

## The prompt

One file per send. `sent.json` says, for each, whether it is the text that was sent, a recovered copy, or a rebuilt copy (`prompt.provenance`):

- `prompts/video.txt`

Keep the lines that say what the pills are and that the set is to be rebuilt as real. Change the person, the place and the light. These prompts come from the gallery runs and many predate the checks in `tools/seedance/`, so rebuild one with the gates before you reuse it.

## How it was sent

`sent.json` holds, for each send: the references in order with their roles, the settings, the credits and the outcome. Request ids are not kept; where one was known, a short hash is stored.

- **video #1**: 7 s, draft (480p preview), 21:9; references: @video1 = pill clip (the 3D blockout); confirmed: yes; 1020.6 credits.

See `reproduce.md` to render it and send it yourself.
