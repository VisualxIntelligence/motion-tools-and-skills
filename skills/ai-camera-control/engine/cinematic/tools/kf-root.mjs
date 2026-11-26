// Where renders and scratch files go. No external drive is needed.
//   CAMERA_CONTROL_HOME  overrides (any folder). Default: ./.work next to this engine.
// Renders default to <home>/out; scratch (bundles, frames) to <home>/tmp.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
export const KF = process.env.CAMERA_CONTROL_HOME ?? process.env.KEYFRAMES_ROOT ?? path.resolve(here, "..", ".work");
fs.mkdirSync(KF, { recursive: true });
if (process.argv[1] && process.argv[1].endsWith("kf-root.mjs")) console.log(KF);
