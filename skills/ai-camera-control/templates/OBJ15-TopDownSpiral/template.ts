// OBJ15-TopDownSpiral
// Copied from engine/cinematic/src/templates/oners.ts (lines 303-317 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ15-TopDownSpiral
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

make({ id: "OBJ15-TopDownSpiral", name: "Top-down spiral", says: "From a map to a monument: we come down out of the sky and around, and it rises to meet us.", use: "Arrivals at a landmark, an object of worship or dread; the end of a search.", numbers: "24 → 20 mm. From straight down at 16 m, a 270° spiral that descends to 0.3 m and widens to 4.6 m over 6.8 s on an S-curve; the tilt goes from 90° down to about 17° up, ending low under the stone, base to top, against open sky. Held 0.6 s at each end.", avoid: "Spinning so fast the ground smears: the rotation eases out with the descent." },
    { ...LAB, build: buildCircle, keyDir: [-0.5, 0.8, 0.35] },
    [prop("MONO", "Monolith", "monolith", [0, 0], 0.4, "plum")],
    (P) => {
      const M = P("MONO");
      const cam = (t: number) => {
        const k = smooth((t - 0.6) / 6.8), m = M(t);
        // the azimuth lands north of the stone, looking south through the gap in the colonnade
        const a = Math.PI * 0.95 - lerp(1.5 * Math.PI, 0, k), r = lerp(0.25, 4.6, Math.pow(k, 1.4)), h = lerp(16, 0.32, Math.pow(k, 0.75));
        const pos = V(Math.sin(a) * r, h, Math.cos(a) * r);
        const aim = m.top.clone().lerp(m.eye, k);
        return { pos, target: aimFor(pos, aim, lerp(24, 20, k), [0, 0]), mm: lerp(24, 20, k) };
      };
      return [{ start: 0, end: 8, label: "24>20mm  TOP-DOWN SPIRAL", rig: "TECHNOCRANE · REMOTE HEAD", subject: "MONO", size: "WS", sizeEnd: "FS", stop: 5.6, cam: rig.chain([{ from: 0, cam }]), cut: "Opens the template", flags: ["centre", "compound"] }];
    }),
