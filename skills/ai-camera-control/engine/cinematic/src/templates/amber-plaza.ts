// AMBER, the plaza take: 0 to 25.04 s, ONE continuous take (no cut). Built from the frames of the original (analysis segA and segB), fitted by overlay.
// Exports the PlazaExports of amber-world.ts: plazaSet, PLAZA_MAN_PATH, PLAZA_MAN_ACTS, plazaShots.
//
// What the take is (world frame of amber-world.ts: the wall face is the plane z = 0, the plaza is z < 0, +x is the man's left when he faces the wall):
//   0 to 4.75 s   AERIAL DIVE. The camera starts 46 m out and 11 m up on a 39 mm lens, behind the left end of the wall (x about -41, z +14; the wall face is single sided, so it is
//                 invisible from behind), and flies straight along the line to the man while he walks toward it; it lands 1.6 m in front of him at chest height. The far tower sits at the right of the frame the whole time (far: no parallax).
//   4.75 to 9.5   he is hit by a gust, crouches, braces; the camera holds close at chest height (a few cm of drift only).
//   9.5 to 12.5   the lens eases from 39 to 55 mm (the camera backs off so he keeps his size; 55 mm for the rest of the take); the camera tilts down while he straightens, takes two heavy steps toward the wall (the two "Oh" at 9.84 and 11.24) and plants himself.
//   12.5 to 18    low push-in and boom-up, then a head-height orbit on his right while he stays braced, then walks bent toward the wall; the brick wall appears at the right from 14.5.
//   18 to 21      the camera swings round behind him (the shutter comes in from the right edge at 17.9) and backs off to 10.7 m from the wall.
//   21 to 24      dolly forward to 7.6 m from the wall while he walks to the lock, lunges down and kneels (24.0 to 25.0).
//   24 to 25.04   the camera is locked (a drift of about 1 cm/s so it is never dead): wide, dead on the shutter, he kneels at KNEEL with his hand at the bottom rail.
// The pin has no limbs: the arm over the face, the fist, the hand on the knee, the coat tail and the scarf are in amber-plaza.notes.md as a per-second action script.
import * as THREE from "three";
import { aimFor } from "../framer";
import type { Cam } from "../shots";
import { GREY, clay } from "../kit/clay";
import { dress } from "../kit/props";
import { track } from "../util";
import { CUT, KNEEL, LOCK_Z, SHUTTER, WALL_H, WALL_X } from "./amber-world";

type W = { add: (o: THREE.Object3D) => void };
const mat = (hex: string) => clay(hex, 0.92);
const box = (w: number, h: number, d: number, x: number, y: number, z: number, hex: string, ry = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; return m;
};

/** where the plaza's far things are (the tower is on this bearing from the plaza, hundreds of metres out; see the notes) */
const TOWER = { x: 400, z: -125 };
/** the man's walking line for 0 to 4.8 s (from the camera's point of view: he comes toward it): unit vector from him to the camera */
const D1 = new THREE.Vector3(-Math.sin((116 * Math.PI) / 180), 0, -Math.cos((116 * Math.PI) / 180));

// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// THE SET. Grey and colourless; the storm, the sand in the air and the haze are NOT geometry (they are in the notes as the weather line of the action script).
// Loose detail (slab joints, drifts, ramps, rubble) is tagged with dress() so a --no-scenery render removes it. The wall face is single sided (it faces -z), so the drone
// that comes in from behind the wall's left end never sees the back of it, and nothing blocks the dive.
export const plazaSet = (w: W) => {
  // ground: one big slab, the walking surface at y = 0
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), mat(GREY.ground)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; w.add(floor);
  // slab joints: 4.5 m slabs, the grid turned 15 degrees off the man's line (dress)
  {
    const g = new THREE.Group(), jm = mat(GREY.dark);
    for (let i = -34; i <= 34; i++) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(300, 0.012, 0.08), jm); a.position.set(0, 0.006, i * 4.5); g.add(a);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 300), jm); b.position.set(i * 4.5, 0.006, 0); g.add(b);
    }
    g.rotation.y = (15 * Math.PI) / 180; g.position.set(0, 0, -60); w.add(dress(g));
    // two darker damp patches near the start of the walk
    for (const [x, z, sx, sz] of [[-3, -16, 8, 6], [14, -26, 10, 7], [-14, -9, 6, 5]] as number[][]) { const p = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.01, sz), mat(GREY.mid)); p.position.set(x, 0.008, z); w.add(dress(p)); }
  }
  // the wall face: the plane z = 0, x -20..20, 6 m high, one sided (normal -z), with a brick course line every 0.15 m (two courses). Everything on the wall is a
  // front-facing plane too (a closed box would show its back to a camera behind the wall): the face, the course lines, the plinth, the buttresses, the steel straps.
  {
    const faceP = (wd: number, ht: number, x: number, y: number, z: number, hex: string) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht), clay(hex, 0.95)); m.rotation.y = Math.PI; m.position.set(x, y, z); m.receiveShadow = true; return m; };
    // the opening of the shutter bay (x -1.7..1.7, y 0..2.6) is left open for the shop builder: the face and the course lines stop at its edges, the plinth at the outer edge of the posts
    const X0 = -WALL_X, X1 = WALL_X * 3, OPEN = SHUTTER.w / 2, OH = SHUTTER.h, POST = OPEN + 0.35;
    const span = (xa: number, xb: number, y0: number, y1: number, z: number, hex: string) => faceP(xb - xa, y1 - y0, (xa + xb) / 2, (y0 + y1) / 2, z, hex);
    w.add(span(X0, -OPEN, 0, WALL_H, 0, GREY.set)); w.add(span(OPEN, X1, 0, WALL_H, 0, GREY.set)); w.add(span(-OPEN, OPEN, OH, WALL_H, 0, GREY.set));
    const g = new THREE.Group();
    for (let y = 1.05; y < WALL_H; y += 0.15) {
      if (y < OH) { g.add(span(X0, -OPEN, y - 0.006, y + 0.006, -0.004, GREY.mid)); g.add(span(OPEN, X1, y - 0.006, y + 0.006, -0.004, GREY.mid)); }
      else g.add(span(X0, X1, y - 0.006, y + 0.006, -0.004, GREY.mid));
    }
    w.add(g);
    // the plinth, 0.9 m of stone along the foot of the wall, and the pilasters (a stone foot and a dark steel strap up the wall) every 4.2 m either side of the shutter
    w.add(span(X0, -POST, 0, 0.9, -0.35, GREY.light)); w.add(span(POST, X1, 0, 0.9, -0.35, GREY.light));
    for (const s of [-1, 1]) for (let k = 0; k < 10; k++) {
      const x = s * (4.4 + 4.2 * k); if (x < X0 + 1) continue;
      w.add(faceP(1.0, 1.1, x, 0.55, -0.5, GREY.light));                                                   // the stone buttress at the foot
      w.add(faceP(0.3, WALL_H - 1.1, x, 1.1 + (WALL_H - 1.1) / 2, -0.16, GREY.dark));                      // the steel strap
    }
  }
  // the far tower, a plain tapered block on its bearing (the same silhouette the whole take), and its stepped annex on the right
  {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(14, 36, 230, 4, 1), mat(GREY.mid)); t.rotation.y = Math.PI / 4; t.position.set(TOWER.x, 115, TOWER.z); t.receiveShadow = true; w.add(t);
    w.add(box(50, 30, 40, TOWER.x + 40, 15, TOWER.z - 12, GREY.mid)); w.add(box(30, 52, 26, TOWER.x + 30, 26, TOWER.z - 8, GREY.mid));
  }
  // a far bunker ramp (dress) on the plaza's horizon to the east: seen at the right of the frame at 11 to 13.5 s and drifting left as the camera turns, and kept out of the
  // aerial dive's view (it lies just outside the 36 degree cone the dive looks through)
  {
    const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(34, 0); shape.lineTo(34, 9); shape.lineTo(0, 0);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 16, bevelEnabled: false }), mat(GREY.light)); m.position.set(100, 0, -14); m.rotation.y = 0.05; m.castShadow = m.receiveShadow = true; w.add(dress(m));
    w.add(dress(box(18, 10, 14, 150, 5, -12, GREY.set, 0.1)));
  }
  // sand drifts (static, low, grey): along the foot of the wall, a cone against each shutter post, and the ring where he braces (dress)
  {
    const mound = (x: number, z: number, sx: number, sy: number, sz: number) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), clay('#a9a7a2', 0.95)); m.scale.set(sx, sy, sz); m.position.set(x, 0, z); m.receiveShadow = true; w.add(dress(m)); };
    for (const [x, sx, sy] of [[-14, 3.5, 0.5], [-9.5, 4.5, 0.55], [-6.4, 2.6, 0.4], [7, 3.0, 0.45], [11, 4.0, 0.5], [16, 3.6, 0.35]] as number[][]) mound(x, -1.4, sx, sy * 0.55, 1.2);
    mound(2.7, -0.5, 0.9, 0.62, 0.9);      // the cone against the +x post (the left post as the camera sees it from the plaza)
    mound(-2.9, -0.7, 1.7, 0.25, 1.1);     // the low drift against the -x post, spreading
    mound(-1.8, -7.5, 0.6, 0.05, 0.6);   // the ring of sand where he braces at 12.5 s
    mound(-6.1, -7.3, 0.5, 0.04, 0.5);     // and where the gust stopped him at 5 s
    for (const [x, z] of [[-1.2, -1.6], [1.0, -2.0]] as number[][]) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 0), mat(GREY.mid)); r.position.set(x, 0.03, z); w.add(dress(r)); }
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// THE MAN. One path from 0 to 25.04 s. Feet move only while he walks.
const Y_D1 = Math.atan2(D1.x, D1.z);
export const PLAZA_MAN_PATH: { t: number; at: [number, number] | [number, number, number]; yaw?: number }[] = [
  { t: 0, at: [1.3, -5.8] },                        // far end of the line, coming toward the camera at 1 m/s
  { t: 4.3, at: [-2.57, -3.92] },
  { t: 4.7, at: [-2.84, -3.79] },                   // the gust: he is stopped by 4.9 s
  { t: 4.8, at: [-2.87, -3.78], yaw: Y_D1 },
  { t: 4.9, at: [-2.87, -3.78], yaw: Y_D1 },
  { t: 9.5, at: [-2.72, -3.68], yaw: Y_D1 },        // drifted 0.15 m while bracing
  { t: 9.9, at: [-2.72, -3.68] },
  { t: 10.5, at: [-2.35, -3.66] },                  // two heavy steps toward the wall, 0.85 m/s
  { t: 11.1, at: [-1.95, -3.7], yaw: -0.05 },       // plants on the second "Oh" (11.24), turns to the wall
  { t: 15.25, at: [-1.9, -3.7], yaw: -0.05 },       // braced, then straightens a little and starts to walk bent
  { t: 16.5, at: [-1.45, -3.25] },
  { t: 18.0, at: [-0.7, -2.5] },                    // the bent walk toward the wall, 0.6 m/s (the clip's own pace)
  { t: 19.0, at: [0.0, -2.9] },                     // turns left (away from the camera), walks along the wall
  { t: 20.0, at: [0.75, -3.6] },
  { t: 21.0, at: [1.5, -4.2] },
  { t: 22.0, at: [0.65, -3.4] },                    // turns toward the shutter
  { t: 23.0, at: [0.5, -2.4] },
  { t: 24.0, at: [0.2, -1.5], yaw: 0 },
  { t: 24.4, at: [0.05, -1.1], yaw: 0 },
  { t: 24.7, at: [0.0, -0.97], yaw: 0 },
  { t: 25.04, at: [KNEEL.x, KNEEL.z], yaw: 0 },
];
export const PLAZA_MAN_ACTS: { kind: string; t0: number; t1?: number; ease?: number; clip?: string; from?: number }[] = [
  { kind: "crouch", t0: 4.95, t1: 9.85, ease: 0.45 },       // the gust: ducks behind the arm, braces
  { kind: "crouch", t0: 12.9, t1: 15.4, ease: 0.6 },        // hands on the knees, bent 45 degrees
  { kind: "clip", clip: "Crouch_Fwd_Loop", t0: 15.4, t1: 18.2, ease: 0.5 },   // the slow bent walk, 15.25 to 18 s
  { kind: "lookDown", t0: 22.5, t1: 24.0, ease: 0.6 },      // head bowed to the lock
  { kind: "kneel", t0: 24.2, ease: 0.8 },                   // down on the knee by 24.9 s, held to the end of the plaza part
];

// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// THE CAMERA. One path: keys of (position, how far below the eye the aim sits, and where that point lands in the frame), smoothed with the kit's Hermite track.
// A key gives its position either in the world (pos) or round the man at the key's time (az = bearing from him to the camera, d = metres, h = height).
type Key = { t: number; pos?: [number, number, number]; az?: number; d?: number; h?: number; dy?: number; xt?: number; yt?: number; /** heading (deg, atan2(x, z): 0 looks at the wall, 90 along +x) and pitch (deg, + up); when given they replace the aim at the eye */ yaw?: number; pitch?: number; mm?: number };
const MM = 55;
export const CAM_KEYS: Key[] = [
  // the dive: straight down the line to him; he stays dead centre
  { t: 0.0, az: 0, d: 65, h: 10.9, dy: 0.9, xt: 0.5, yt: 0.64, mm: 38.6 },
  { t: 1.0, az: 0, d: 40, h: 7.6, dy: 0.9, xt: 0.5, yt: 0.58, mm: 38.6 },
  { t: 2.0, az: 0, d: 24, h: 4.2, dy: 0.9, xt: 0.5, yt: 0.55, mm: 38.6 },
  { t: 3.0, az: 0, d: 13, h: 2.2, dy: 0.5, xt: 0.5, yt: 0.55, mm: 38.6 },
  { t: 4.0, az: 0, d: 4.4, h: 1.5, dy: 0.2, xt: 0.5, yt: 0.45, mm: 38.6 },
  { t: 4.75, az: 0, d: 2.3, h: 1.35, dy: 0.1, xt: 0.58, yt: 0.34, mm: 38.6 },
  // the gust and the brace: close, chest height, nearly still
  { t: 6.0, az: 0, d: 2.35, h: 1.25, dy: 0.1, xt: 0.69, yt: 0.34, mm: 38.6 },
  { t: 8.0, az: 0, d: 2.3, h: 1.25, dy: 0.1, xt: 0.52, yt: 0.24, mm: 38.6 },
  { t: 9.5, az: 0, d: 2.3, h: 1.2, dy: 0.1, xt: 0.55, yt: 0.2, mm: 38.6 },
  // tilt down onto the stride and the lunge
  { t: 10.0, az: -6, d: 2.9, h: 1.1, dy: 0.1, xt: 0.64, yt: -0.02, mm: 42 },
  { t: 11.0, az: -13, d: 4.3, h: 0.9, dy: 1.2, xt: 0.38, yt: 0.5, mm: 48 },
  { t: 12.5, az: -18, d: 4.5, h: 0.85, yaw: 96, pitch: -5.5 },
  // push in and boom up, orbit on his right, head height (heading and pitch set by hand from the frames)
  { t: 13.0, az: -22, d: 3.7, h: 0.85, yaw: 95, pitch: -4 },
  { t: 14.0, az: -26, d: 2.7, h: 0.8, yaw: 91, pitch: -1 },
  { t: 15.0, az: -33, d: 2.1, h: 0.85, yaw: 86, pitch: 0 },
  { t: 16.0, az: -36, d: 1.95, h: 0.85, yaw: 80, pitch: 0 },
  { t: 17.0, az: -39, d: 2.0, h: 0.9, yaw: 77, pitch: 0 },
  // the swing round behind him: where the shutter's left post lands in the frame (0.92, 0.84, 0.73, 0.62 at 18.5, 19, 19.5, 20) fixes camera and heading (solved from the frames)
  { t: 18.0, az: -52, d: 2.3, h: 1.0, yaw: 63, pitch: -0.5 },
  { t: 18.5, pos: [-2.58, 1.3, -3.59], yaw: 67.5, pitch: 2.3 },
  { t: 19.0, pos: [-2.27, 1.35, -4.36], yaw: 57.2, pitch: 2.5 },
  { t: 19.5, pos: [-1.61, 1.4, -5.44], yaw: 42.5, pitch: 1.1 },
  { t: 20.0, pos: [-0.72, 1.4, -6.44], yaw: 27.8, pitch: 0.7 },
  // and the dolly to the lock: posts at 0.41/0.996 (21), 0.28/0.93 (22), then in step to 0.11/0.95 (24 to 25), heading 0 (frontal)
  { t: 21.0, pos: [1.42, 1.4, -10.69], yaw: 0, pitch: -3.5 },
  { t: 22.0, pos: [0.62, 1.4, -9.8], yaw: 0, pitch: -3.5 },
  { t: 23.0, pos: [0.35, 1.4, -8.7], yaw: 0, pitch: -3.6 },
  { t: 23.9, pos: [0.15, 1.4, -7.55], yaw: 0, pitch: -3.7 },
];
const LOCK_T = 23.9;   // from here the orientation is frozen and only the drift moves the camera
const RAD = Math.PI / 180;

export const plazaShots = (P0: unknown) => {
  const M = (P0 as (id: string) => (t: number) => { eye: THREE.Vector3; sole: THREE.Vector3 })("MAN");
  const keys = CAM_KEYS.map((k) => {
    const m = M(k.t), ang = (k.az ?? 0) * RAD + Math.atan2(D1.x, D1.z), mm = k.mm ?? MM, dd = (k.d ?? 3) * (mm / MM);   // d is given at 55 mm; a shorter lens stands nearer so the man keeps his size
    const at = k.pos ? new THREE.Vector3(...k.pos) : new THREE.Vector3(m.sole.x + Math.sin(ang) * dd, k.h ?? 1.4, m.sole.z + Math.cos(ang) * dd);
    let yaw: number, pitch: number;
    if (k.yaw !== undefined) { yaw = k.yaw * RAD; pitch = (k.pitch ?? 0) * RAD; }
    else {
      const eye = m.eye.clone(); eye.y -= k.dy ?? 0;
      const tg = aimFor(at, eye, mm, [((k.xt ?? 0.5) - 0.5) * 2, (0.5 - (k.yt ?? 0.5)) * 2]), dir = tg.clone().sub(at);
      yaw = Math.atan2(dir.x, dir.z); pitch = Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
    }
    return { t: k.t, v: [at.x, at.y, at.z, yaw, pitch, mm] };
  });
  const tr = track(keys);
  const camAt = (t: number): Cam => {
    const v = tr(t), pos = new THREE.Vector3(v[0], v[1], v[2]);
    const dir = new THREE.Vector3(Math.sin(v[3]) * Math.cos(v[4]), Math.sin(v[4]), Math.cos(v[3]) * Math.cos(v[4]));
    return { pos, target: pos.clone().add(dir.multiplyScalar(10)), mm: v[5] };
  };
  const free = (() => { const c = camAt(LOCK_T); return { pos: c.pos, dir: c.target.clone().sub(c.pos) }; })();
  // the drift of the locked camera: about 1 cm/s (sines, 0.7 and 0.5 rad/s, 1.4 cm and 1.0 cm across), so it is never a dead frame
  const drift = (t: number) => new THREE.Vector3(0.014 * Math.sin(0.7 * t), 0.008 * Math.sin(0.5 * t + 1), 0.01 * Math.sin(0.6 * t + 2));
  const cam = (t: number): Cam => {
    if (t >= LOCK_T) {
      const pos = free.pos.clone().add(drift(t)).sub(drift(LOCK_T));
      return { pos, target: pos.clone().add(free.dir), mm: MM };
    }
    return camAt(t);
  };
  return [{
    start: 0, end: CUT.c1, label: "39 to 55mm  ONE TAKE · AERIAL DIVE TO STEADICAM TO LOCKED", rig: "STEADICAM · GIMBAL", subject: "MAN", size: "WS", sizeEnd: "WS", stop: 4,
    flags: ["compound", "centre"], cam, cut: "Opens the film; the take runs to the cut at 25.04 s",
  }];
};

export { LOCK_Z, SHUTTER };
