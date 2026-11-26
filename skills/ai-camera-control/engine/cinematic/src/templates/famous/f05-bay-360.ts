// FAM05-Bay360: the low circling hero shot. Two people come up from a crouch in slow motion while a long lens, a
// foot off the ground, wheels round them against the sky. Measured from a 6.75 s take of the shot in a supercut (and
// a 5.6 s single version beside it): the lens goes from behind the near hero's right shoulder to front right at about
// 17°/s without stopping, the second hero rises into frame from behind the first one's shoulder and ends nearer the
// lens and higher in frame, and the background crosses the frame at about 0.7 frame widths a second.
// Bearings are degrees round the heroes from straight in front of them (+z), toward their right (-x).
import * as THREE from "three";
import { speedRamp } from "../../kit/stage";
import type { Act } from "../../kit/actors";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { building, dress, ground, lampPost } from "../../kit/props";
import { aimFor } from "../../framer";
import { clamp, ramp, rng } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { makeProduct, V, type ActorSpec, type KitWorld } from "../products/shared";

const RAD = Math.PI / 180;
export const END = 8;

// ---------------- time: the whole take is slow motion ----------------
const SLOW = 0.3;                               // the stand-up clip takes 0.85 s; here it takes 2.8 s
const CLOCK = speedRamp([[0, SLOW], [END, SLOW]]);

// ---------------- the heroes ----------------
// Alex is nearer the lens at the start. Sam stands 0.75 m from him, ahead and to his left, on the line the lens looks
// along at bearing 150 (frame 0): he is behind Alex while he is still down and comes out to the right as he rises.
const SAM_AT: [number, number, number] = [0.375, 0, 0.65];
const C = V(SAM_AT[0] / 2, 0, SAM_AT[2] / 2);  // halfway between them: the point the lens wheels round
const GAZE: [number, number, number] = [-2.5, 14, 14];      // up and ahead, over the last camera position
/** Jump_Land's tail: the bottom of its crouch is 0.25 s in, standing 1.17 s in. `into` is how far in it is at frame 0;
 *  the clip is let go into the idle sway once the body is up. The clip hangs the head 50° down in the crouch, so the
 *  chin is held up until the body is nearly straight: the eyes stay on the gaze point all the way up */
const rise = (into: number): Act[] => [
  { kind: "clip", clip: "Jump_Land", t0: -into, t1: 1.35 - into, ease: 0.3 },
  { kind: "lookUp", t0: -5, t1: 1.2 - into, ease: 0.5 },
];
const hero = (id: string, name: string, tint: ActorSpec["tint"], at: [number, number, number], into: number): ActorSpec =>
  ({ id, name, kind: "human", tint, path: [{ t: 0, at, yaw: 0 }], acts: rise(into), look: GAZE, capsule: "trunk" });   // trunk: the two stand-ins must not merge
export const HEROES: ActorSpec[] = [hero("ALEX", "Alex", "ochre", [0, 0, 0], 0.6), hero("SAM", "Sam", "slate", SAM_AT, 0.25)];

// ---------------- the camera: a circle of track, the heroes standing off its centre ----------------
const MM = 85;
const LENS_Y = 0.3;                              // lens height off the ground
const BEARING0 = 150, DEG_PER_S = 17;            // 150 (behind Alex's right shoulder) to 14 (front right), never stopping
const TRACK = { radius: 4.9, off: 2.2, nearest: 80 };   // the rail passes 2.7 m from the heroes at bearing 80
const AIM = V(C.x, 1.62, C.z + 0.1);             // a fixed point between the two heads: the frame is set against it
// where AIM sits in frame (-1..1, + up and right). The tilt follows Alex up for 1.6 s, which leaves room under him for
// Sam to rise into, then eases back as the lens comes round to the front; Alex starts right of centre
const FRAME = { y0: 0.08, yLow: -0.35, y1: -0.06, x0: -0.1, x1: 0.12 };
export const bay360 = (t: number): Cam => {
  const b = (BEARING0 - DEG_PER_S * t) * RAD, d = b - TRACK.nearest * RAD;
  const r = -TRACK.off * Math.cos(d) + Math.sqrt(TRACK.radius ** 2 - (TRACK.off * Math.sin(d)) ** 2);
  const pos = V(C.x - Math.sin(b) * r, LENS_Y, C.z + Math.cos(b) * r);
  const ny = FRAME.yLow + (FRAME.y0 - FRAME.yLow) * (1 - clamp(t / 1.6)) ** 2 + (FRAME.y1 - FRAME.yLow) * ramp(t, 1.6, 5.4);
  const nx = FRAME.x0 + (FRAME.x1 - FRAME.x0) * ramp(t, 0.4, 4.2);
  return { pos, target: aimFor(pos, AIM, MM, [nx, ny]), mm: MM };
};

// ---------------- the set: open ground, tall shapes in a ring for the background to wheel past ----------------
/** a palm: a leaning trunk and a crown of arching fronds (each a chain of four tapering blades) */
function palm(h: number, seed: number) {
  const r = rng(seed), g = new THREE.Group(), lx = (r() - 0.5) * 0.16 * h, lz = (r() - 0.5) * 0.16 * h;
  const curve = new THREE.QuadraticBezierCurve3(V(0, 0, 0), V(lx * 0.15, h * 0.55, lz * 0.15), V(lx, h, lz));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.17, 8), clay(GREY.dark, 0.95)));
  const crown = new THREE.Group(); crown.position.set(lx, h, lz); g.add(crown);
  crown.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), clay(GREY.mid, 0.96)));
  const leaf = clay(GREY.set, 0.96), N = 15;
  for (let i = 0; i < N; i++) {
    const len = 3.0 + r() * 0.9, seg = len / 4;
    let at: THREE.Object3D = new THREE.Group(); at.rotation.y = (i / N) * Math.PI * 2 + r() * 0.25; crown.add(at);
    for (let k = 0; k < 4; k++) {
      const j = new THREE.Group(); j.position.z = k ? seg : 0.2; j.rotation.x = k ? 0.32 + r() * 0.14 : -0.75 + (i % 3) * 0.3 + r() * 0.15; at.add(j);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.85 - 0.2 * k, 0.06, seg * 1.04), leaf); blade.position.z = seg / 2; j.add(blade);
      at = j;
    }
  }
  return dress(shadeAll(g));
}
/** stand `o` at a compass bearing from the heroes (0 = ahead of them, 90 = their left), `r` metres out, facing them */
const ring = (w: KitWorld, o: THREE.Object3D, bearing: number, r: number, turn = 0) => {
  const b = bearing * RAD; o.position.set(C.x + Math.sin(b) * r, 0, C.z + Math.cos(b) * r); o.rotation.y = b + Math.PI + turn * RAD; w.add(o); return o;
};
function buildSet(w: KitWorld) {
  w.add(ground(600, 0, 600, GREY.ground));
  // the lens looks out over the heroes' left: first ahead-left (palms, a far block), then a long front, then behind them
  // (heights are set by the lens: at 85 mm, looking up 19 to 27°, it only sees what stands 5 to 9 m up at 12 m out)
  ring(w, building(12, 10, 14, 11, GREY.light), 38, 36);
  ring(w, palm(9, 3), 22, 22);
  ring(w, palm(9, 7), 42, 18);
  ring(w, palm(13, 12), 56, 24);
  ring(w, lampPost(9.5), 66, 16, 90);
  ring(w, building(30, 12, 19.5, 5, GREY.paper), 95, 38);
  ring(w, lampPost(9.8), 124, 16, 90);
  ring(w, palm(13, 21), 136, 22);
  ring(w, building(14, 10, 11, 8, GREY.light), 157, 29);
}

export const PIECE: Piece = makeProduct(
  { id: "FAM05-Bay360", name: "Bay 360", says: "They get up and the world turns round them: the heroes rise in slow motion against the sky while a low lens wheels from their backs to their faces.", use: "The beat after the blast or the chase, when the heroes stand to face what comes next; once per film.", numbers: "85 mm, lens 0.3 m off the ground looking up 19 to 27°, on a 4.9 m circle of track passing 2.7 m from the heroes. 136° round them, from behind the right shoulder to front right, at a steady 17°/s for 8 s with no stop at either end. World clock 0.3 throughout: the near hero is up at 1.6 s, the far one at 3 s. The far hero stands 0.75 m ahead and left of the near one. The background crosses the frame at 0.6 widths a second.", avoid: "A wide lens or a lens at eye height: the heads must sit against sky with the background streaking behind them." },
  { sky: "day", keyDir: [-0.5, 0.7, 0.5], build: buildSet, clock: CLOCK },
  HEROES,
  () => [{
    start: 0, end: END, label: "85mm  LOW CIRCLE · HERO RISE", rig: "CIRCULAR TRACK · LOW MODE", subject: "ALEX", size: "CU", stop: 5.6, shadow: 8,
    cam: bay360, focus: (t) => ["ALEX", "SAM", 0.5 * ramp(t, 1.2, 4)],
    flags: ["compound", "centre", "enters-moving", "exits-moving"], cut: "Opens the template",
    note: "World clock 0.3 throughout. The lens never stops: 17°/s round the heroes on a 4.9 m circle of track",
  }],
);
