// FAM03-TrunkShot
// Copied from engine/cinematic/src/templates/famous/f03-trunk-shot.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh FAM03-TrunkShot
// FAM03-TrunkShot: the Tarantino trunk shot. The camera lies on the floor of a car boot looking up and back; the lid
// lifts, daylight comes in, and three people lean over the sill and look down into the lens. One reaches in, they
// straighten, the lid is pushed shut to black. Measured from a supercut of the real shots (see `numbers`).
import * as THREE from "three";
import type { Piece } from "../../piece";
import type { Actor } from "../../kit/actors";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { building, dress, ground, lampPost } from "../../kit/props";
import { clamp, lerp, smooth, smoother } from "../../util";
import { V, makeProduct, type ActorSpec, type KitWorld } from "../products/shared";

// ---- the boot, in metres (the car's tail faces +z; the people stand at +z and face -z) ----
const FLOOR = 0.45, SILL = 0.84, DECK = 1.04;          // boot floor, top of the rear sill, top of the wings and the shut lid
const HALF = 0.75, FRONT = -0.85, REAR = 0.45;         // inside half width, the wall behind the seats (the hinge line), the sill's inside face
const LID_LEN = 1.32, LIP = 0.188, LID_OPEN = (36 * Math.PI) / 180;
// ---- the lens: 10 cm above the floor, tilted 49 degrees up toward the tail ----
const LENS = V(0, 0.55, -0.15), TILT = (49 * Math.PI) / 180, MM = 16;

// ---- timing (s) ----
const END = 10, T = { open: 0.6, openFor: 0.75, lean: 1.05, reach: [4.3, 5.2, 5.8, 6.7], back: 8.05, shut: 8.9, shutFor: 0.45 };
/** the lid's angle: an eased swing up, then pushed down accelerating into the latch (a slam) */
const lidAngle = (t: number) => (t < T.shut ? LID_OPEN * smooth((t - T.open) / T.openFor) : LID_OPEN * (1 - clamp((t - T.shut) / T.shutFor) ** 2));
/** how far the people are leaned in over the boot (0 standing, 1 in) and how far the reach has gone */
const leanIn = (t: number) => smoother((t - T.lean) / 0.9) * (1 - smoother((t - T.back) / 0.75));
const reachIn = (t: number) => smoother((t - T.reach[0]) / (T.reach[1] - T.reach[0])) * (1 - smoother((t - T.reach[2]) / (T.reach[3] - T.reach[2])));

// ---- the set ----
const mat = (hex: string, rough = 0.92) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 });
const box = (m: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true; return o;
};
function buildBoot(w: KitWorld) {
  w.add(ground(300, 0, 300, GREY.ground));
  // everything the lens can see of the car is lined in these: `tick` takes them from black to grey as the lid lifts
  const lining = mat(GREY.mid), panel = mat(GREY.set), rib = mat(GREY.dark), lamp = mat(GREY.paper, 0.6);
  const shell = clay(GREY.set, 0.85);
  const car = new THREE.Group();
  const len = REAR - FRONT, mid = (REAR + FRONT) / 2;
  car.add(box(lining, HALF * 2, 0.05, len, 0, FLOOR - 0.025, mid));                                         // floor
  for (const s of [-1, 1]) {
    car.add(box(lining, 0.03, DECK - FLOOR, len, s * (HALF + 0.015), (DECK + FLOOR) / 2, mid));             // side walls
    car.add(box(shell, 0.17, DECK - 0.2, len + 0.19, s * (HALF + 0.115), (DECK + 0.2) / 2, mid + 0.015));   // the wings outside them
  }
  car.add(box(lining, HALF * 2, 0.53, 0.03, 0, FLOOR + 0.265, FRONT - 0.015));                              // the wall behind the seats
  car.add(box(lining, HALF * 2, SILL - FLOOR, 0.02, 0, (SILL + FLOOR) / 2, REAR + 0.01));                   // the sill's inside face
  car.add(box(shell, 1.9, SILL - 0.2, 0.09, 0, (SILL + 0.2) / 2, REAR + 0.065));                            // the tail panel
  car.add(box(shell, 1.9, 0.1, 0.05, 0, 0.42, REAR + 0.135));                                               // bumper
  car.add(box(rib, 0.06, 0.03, 0.03, 0, SILL - 0.03, REAR - 0.015));                                        // the latch striker
  car.add(box(shell, 1.9, DECK - 0.2, 3.4, 0, (DECK + 0.2) / 2, FRONT - 0.08 - 1.7));                       // the rest of the car, never seen
  car.add(box(shell, 1.6, 0.45, 1.7, 0, DECK + 0.225, FRONT - 1.6));
  w.add(car, "boot");
  // the lid: hinged on the wall behind the seats, a slab with a down-turned lip that shuts 12 mm above the sill
  const lid = new THREE.Group(); lid.position.set(0, DECK, FRONT);
  const lw = HALF * 2 - 0.01;
  lid.add(box(panel, lw, 0.04, LID_LEN, 0, -0.02, LID_LEN / 2));
  lid.add(box(panel, lw, LIP - 0.04, 0.02, 0, -(LIP + 0.04) / 2, LID_LEN - 0.01));
  for (const s of [-1, 1]) {
    lid.add(box(rib, 0.07, 0.025, LID_LEN - 0.2, s * 0.63, -0.0525, LID_LEN / 2));                          // the pressed frame under the slab
    lid.add(box(rib, 0.06, 0.025, 1.24, s * 0.315, -0.0525, LID_LEN / 2, s * Math.atan2(0.63, 1.07)));
  }
  for (const z of [0.12, LID_LEN - 0.12]) lid.add(box(rib, 1.33, 0.025, 0.07, 0, -0.0525, z));
  lid.add(box(rib, 0.09, 0.05, 0.035, 0, -LIP + 0.03, LID_LEN - 0.0375));                                   // latch
  lid.add(box(lamp, 0.12, 0.02, 0.06, -0.3, -0.05, 0.42));                                                  // boot lamp
  lid.userData.mats = [lining, panel, rib, lamp].map((m) => [m, m.color.clone()]);
  w.add(lid, "lid");
  // outside, only what shows from down here: a building edge frame left, a street lamp over the middle, a palm frame right
  const b = building(10, 10, 15, 5); b.position.set(9.5, 0, 9); b.rotation.y = Math.PI; w.add(b);
  const lampP = lampPost(7.8); lampP.position.set(-1.8, 0, 5); lampP.rotation.y = Math.PI; w.add(lampP);
  const palm = new THREE.Group(), bark = clay(GREY.mid, 0.9), leaf = clay(GREY.light, 0.95), H = 9;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, H, 10), bark); trunk.position.y = H / 2; palm.add(trunk);
  for (let i = 0; i < 11; i++) {
    // a frond: a long thin blade from the crown, drooping more on every other one
    const f = new THREE.Group(), blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 1.7), leaf); blade.position.z = 0.85; f.add(blade);
    f.position.y = H; f.rotation.set(0.15 + 0.5 * (i % 3) / 2, (i / 11) * Math.PI * 2, 0, "YXZ"); palm.add(f);
  }
  palm.position.set(-7.5, 0, 5.5); w.add(dress(shadeAll(palm)));
}

// ---- the people: three at the bumper, facing the car ----
const person = (id: string, name: string, tint: ActorSpec["tint"], x: number, z: number, acts?: ActorSpec["acts"]): ActorSpec =>
  ({ id, name, kind: "human", tint, path: [{ t: 0, at: [x, z], yaw: Math.PI }], acts, capsule: "trunk" });
const PEOPLE: ActorSpec[] = [
  person("ALEX", "Alex", "ochre", 0.68, 0.86),                                                              // frame left: lifts, holds and shuts the lid
  person("SAM", "Sam", "slate", 0, 0.9),                                                                    // centre: hands on the sill, reaches in
  person("KIM", "Kim", "sage", -0.68, 0.9, [{ kind: "clip", clip: "Idle_FoldArms_Loop", t0: -2 }]),        // frame right: arms folded
];

// ---- bending the rig by hand: the clips have no "leaning into a boot", so `tick` turns the spine and solves the arms ----
type Rig = NonNullable<Actor["rig"]>;
const TURNED = ["spine_01", "spine_03", "upperarm_l", "lowerarm_l", "hand_l", "upperarm_r", "lowerarm_r", "hand_r"];
/** the clip's own value of each bone we turn. The mixer only rewrites a bone whose clip value changed, so a bone still
 *  holding what we wrote last time is put back first: every frame starts from the clip, whatever was posed before */
const memo = new WeakMap<THREE.Object3D, { wrote: THREE.Quaternion; base: THREE.Quaternion }>();
function fromClip(rig: Rig) {
  for (const n of TURNED) {
    const b = rig.bone[n], m = memo.get(b);
    if (m && b.quaternion.equals(m.wrote)) b.quaternion.copy(m.base);
    memo.set(b, { base: b.quaternion.clone(), wrote: b.quaternion.clone() });
  }
}
const seal = (rig: Rig) => { for (const n of TURNED) memo.get(rig.bone[n])!.wrote.copy(rig.bone[n].quaternion); };
const wp = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());
/** tip a bone forward (radians) about the body's own side axis */
function tip(rig: Rig, bone: THREE.Object3D, a: number) {
  const toLocal = bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rig.root.getWorldQuaternion(new THREE.Quaternion()));
  bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0).applyQuaternion(toLocal), a)); bone.updateMatrixWorld(true);
}
/** swing a bone so the direction `from` (world) points along `to` */
function swing(bone: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) {
  const q = new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize());
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(q);
  bone.quaternion.copy(bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world)); bone.updateMatrixWorld(true);
}
/** lean forward from the waist; the arms keep hanging straight down */
function lean(rig: Rig, a: number, arms = true) {
  tip(rig, rig.bone.spine_01, a * 0.55); tip(rig, rig.bone.spine_03, a * 0.45);
  if (arms) for (const s of ["l", "r"]) tip(rig, rig.bone["upperarm_" + s], -a);
}
/** two-bone arm IK: the wrist goes to `target` (by w), the elbow toward `pole`; `fingers` aims the hand */
function reach(rig: Rig, s: "l" | "r", target: THREE.Vector3, pole: THREE.Vector3, w: number, fingers?: THREE.Vector3) {
  if (w <= 0) return;
  rig.root.updateMatrixWorld(true);
  const up = rig.bone["upperarm_" + s], lo = rig.bone["lowerarm_" + s], hand = rig.bone["hand_" + s];
  const H = wp(up), K = wp(lo), A = wp(hand), aim = A.clone().lerp(target, w);
  const a = H.distanceTo(K), b = K.distanceTo(A), c = clamp(H.distanceTo(aim), Math.abs(a - b) + 1e-3, (a + b) * 0.995);
  const ht = aim.clone().sub(H).normalize(), off = (v: THREE.Vector3) => v.clone().addScaledVector(ht, -v.dot(ht)).normalize();
  const side = off(K.clone().sub(H)).lerp(off(pole), w).normalize();          // from where the elbow is to where it should point
  const cosA = (a * a + c * c - b * b) / (2 * a * c), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  swing(up, K.clone().sub(H), ht.clone().multiplyScalar(a * cosA).addScaledVector(side, a * sinA));
  const K3 = wp(lo);
  swing(lo, wp(hand).sub(K3), H.clone().addScaledVector(ht, c).sub(K3));
  const knuckle = fingers && hand.children.find((o) => o.name.startsWith("middle_01"));
  if (knuckle && fingers) { const now = wp(knuckle).sub(wp(hand)).normalize(); swing(hand, now, now.clone().lerp(fingers.clone().normalize(), w)); }
}

/** the head looks into the lens: the rig's own `look`, called here after the lean so it starts from the bent body
 *  (the actor's `look` runs before `tick` and would aim from wherever the spine was left). The spine has already tipped
 *  the head by `a`, so the mark is raised to ask the neck for only the rest */
function eyesOnLens(rig: Rig, a: number, w: number) {
  if (w <= 0) return;
  const h = wp(rig.bone.Head), flat = V(LENS.x - h.x, 0, LENS.z - h.z), d = flat.length();
  rig.look(h.clone().add(flat).add(V(0, -d * Math.tan(Math.max(0, Math.atan2(h.y - LENS.y, d) - a)), 0)), w);
}

/** where the lid's lip is held (frame left corner of its lower edge), in the world */
const grip = (lid: THREE.Object3D) => lid.localToWorld(V(0.7, -LIP, LID_LEN - 0.01));
const SILL_Z = REAR + 0.065;
/** a wrist mark on the sill; the hand arcs 8 cm up on its way there and back (w is how far it has come) */
const onSill = (x: number, w: number) => V(x, SILL + 0.065 + 0.32 * (1 - w), SILL_Z);
const BACK = (s: number) => V(s * 0.5, -0.2, 1), INTO = V(0, -0.15, -1);

function tick(w: KitWorld, t: number) {
  const lid = w.parts.get("lid")!, th = lidAngle(t);
  lid.rotation.x = -th; lid.updateMatrixWorld(true);
  // the light comes in with the lid: the lining goes from near black to its own grey over the first half of the swing
  const k = lerp(0.03, 0.62, smooth(th / (0.5 * LID_OPEN)));
  for (const [m, c] of lid.userData.mats as [THREE.MeshStandardMaterial, THREE.Color][]) m.color.copy(c).multiplyScalar(k);
  const rigOf = (id: string) => w.actors.get(id)?.rig;
  const inK = leanIn(t), hands = smoother((t - T.lean - 0.15) / 0.8) * (1 - smoother((t - T.back) / 0.6)), rk = reachIn(t);
  const deg = Math.PI / 180, eyes = smoother((t - 0.5) / 0.6) * (1 - smoother((t - END + 0.7) / 0.6));
  const alex = rigOf("ALEX"), sam = rigOf("SAM"), kim = rigOf("KIM");
  if (alex) {
    // Alex follows the lid with the right hand from the moment it lifts until it is nearly shut, and leans in under it
    const a = (8 + 14 * smoother((t - 0.85) / 0.5) * (1 - smoother((t - T.shut + 0.1) / 0.45))) * deg;   // he straightens as he pushes it down
    fromClip(alex); lean(alex, a);
    const g = grip(lid), sh = wp(alex.bone.upperarm_r), hold = smoother((t - T.open - 0.02) / 0.33) * (1 - smoother((t - T.shut - 0.37) / 0.2));
    reach(alex, "r", g.clone().addScaledVector(g.clone().sub(sh).normalize(), -0.085), V(0.6, -0.6, 0.5), hold);
    reach(alex, "l", onSill(0.68 - 0.19, hands), BACK(-1), hands, INTO);
    seal(alex); eyesOnLens(alex, a, eyes);
  }
  if (sam) {
    // Sam leans furthest, both hands on the sill; the right hand comes off it toward the lens and goes back
    const a = (6 + 18 * inK + 12 * rk) * deg;
    fromClip(sam); lean(sam, a);
    const out = V(0.06, 1.02, 0.3);
    reach(sam, "r", onSill(0.2, hands).lerp(out, rk), BACK(1), hands, INTO.clone().lerp(LENS.clone().sub(out).normalize(), rk));
    reach(sam, "l", onSill(-0.2, hands), BACK(-1), hands, INTO);
    seal(sam); eyesOnLens(sam, a, eyes);
  }
  if (kim) { const a = (5 + 11 * inK) * deg; fromClip(kim); lean(kim, a, false); seal(kim); eyesOnLens(kim, a, eyes); }
}

export const PIECE: Piece = makeProduct(
  {
    id: "FAM03-TrunkShot", name: "Trunk shot",
    says: "We are the thing in the boot. The lid lifts, daylight comes in, and three people stand over us looking down into the lens.",
    use: "A reveal from the point of view of whatever is in the boot: gangsters, a road trip, a find. The lid shutting to black is the cut out, and the clip loops.",
    numbers: "16 mm locked off on the boot floor, lens 10 cm above it, tilted 49° up toward the tail, f/11. Black 0.6 s, the lid swings 36° in 0.75 s, then three people from the chest up with the tops of their heads a third down the frame, the lid across the top 15% and the sill along the bottom 4%. They lean in by 2 s, one reaches toward the lens from 4.3 to 6.7 s, they straighten at 8 s, the lid is pushed shut in 0.45 s from 8.9 s, black from 9.35 to 10 s.",
    avoid: "Moving the camera (the real one never does), or standing the people upright behind the bumper: they must lean over the sill or they sink to the bottom of the frame.",
  },
  { sky: "day", keyDir: [-0.55, 0.78, 0.32], build: buildBoot, tick },
  PEOPLE,
  () => {
    const target = LENS.clone().add(V(0, Math.sin(TILT), Math.cos(TILT)).multiplyScalar(1.2));
    return [{ start: 0, end: END, label: `${MM}mm  TRUNK SHOT · LOCKED OFF`, rig: "TRIPOD · HI-HAT ON THE BOOT FLOOR", subject: "SAM", size: "MS", stop: 11, shadow: 6, cam: () => ({ pos: LENS.clone(), target: target.clone(), mm: MM }), cut: "Opens the template", flags: ["centre"] }];
  },
);
