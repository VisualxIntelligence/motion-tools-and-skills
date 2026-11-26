import * as THREE from "three";
import { PIECES } from "../src/pieces";
import { realCam, place } from "../src/camera";
const p = PIECES[process.env.PIECE ?? "Rootsong"];
for (const ft of [13.10, 13.15, 13.2, 13.35, 13.6]) {
  const t = ft - 22.5; const sh = p.shotAt(t);
  const r = realCam(sh, t, 60); const cam = new THREE.PerspectiveCamera(); place(cam, r.cam);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  console.log(ft, "SH", sh.id, "start", sh.start, "pitch", (Math.asin(fwd.y) * 57.3).toFixed(2), "yaw", (Math.atan2(fwd.x, fwd.z) * 57.3).toFixed(2), "mm", r.cam.mm.toFixed(1), "pos", r.cam.pos.toArray().map(v => v.toFixed(2)).join(","));
}
