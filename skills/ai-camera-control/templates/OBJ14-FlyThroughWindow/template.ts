// OBJ14-FlyThroughWindow
// Copied from engine/cinematic/src/templates/oners.ts (lines 289-301 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ14-FlyThroughWindow
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

make({ id: "OBJ14-FlyThroughWindow", name: "Fly through a window", says: "We cross from outside to in without a cut: the threshold is the moment.", use: "Entering a building, a reveal of what is inside, a transition from a public space to a private one.", numbers: "24 mm, one keyed drone path of 13.6 m over 6 s, descending 0.6 m; the window frame (2 × 2 m) passes within 0.9 m of the lens at the move's fastest point, then the move settles on the statue.", avoid: "Slowing in the opening: the frame edge sells the crossing only at speed." },
    { sky: "day", build: buildGallery, keyDir: [-0.35, 0.86, 0.38], motes: { center: [0, 2.5, -2], size: [18, 5, 26], count: 220 } },
    [prop("STATUE", "Statue", "statue", [0.6, -8], 0.15, "sand")],
    (P) => {
      const S = P("STATUE");
      const win = V(0, 2.1, 0);
      return [{ start: 0, end: 7, label: "24mm  FLY THROUGH WINDOW", rig: "FPV DRONE · CINEWHOOP", subject: "STATUE", size: "WS", sizeEnd: "FS", stop: 4,
        cam: evenSpline([
          { t: 0.3, pos: V(-1.05, 2.65, 11), look: (t) => win.clone().lerp(S(t).eye, 0.35), mm: 24 },
          { t: 6.3, pos: V(0.25, 2.0, -2.6), look: (t) => S(t).eye.clone().add(V(0, -0.7, 0)), mm: 24 },
        ]),
        cut: "Opens the template", flags: ["centre", "wipe"] }];
    }),
