// Creatures in clay: a winged flyer (a ray-like glider, about 14 m across) and a four-legged walker. Each is posed by a
// phase (wing beat or stride), which the actor integrates over time so the rate can change without the beat racing.
import * as THREE from "three";
import { GREY, TINT, clay, shadeAll, type Tint } from "./clay";

export class Flyer {
  g = new THREE.Group(); body = new THREE.Group(); head = new THREE.Group();
  wings: { inner: THREE.Group; outer: THREE.Group; side: number }[] = [];
  tail: THREE.Group[] = [];
  constructor(tint: Tint = "plum", public span = 14) {
    const s = span / 22, skin = clay(TINT[tint], 0.88), belly = clay(GREY.light, 0.9);
    this.g.add(this.body); this.body.scale.setScalar(s);
    const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), skin); torso.scale.set(1.5, 0.6, 3.4); this.body.add(torso);
    const under = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), belly); under.scale.set(1.3, 0.42, 3.0); under.position.y = -0.2; this.body.add(under);
    for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6 - i * 0.06, 6), skin); sp.position.set(0, 0.6, 1.8 - i * 0.7); sp.rotation.x = -0.5; this.body.add(sp); }
    this.head.position.set(0, 0.1, 3.3); this.body.add(this.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), skin); skull.scale.set(1.8, 0.42, 1.0); this.head.add(skull);
    // two dark eye beads: the only marks, so where it looks reads
    for (const x of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), clay(GREY.ink, 0.5)); e.position.set(x * 1.25, 0.14, 0.5); this.head.add(e); }
    const panel = (pts: [number, number][]) => { const sh = new THREE.Shape(); sh.moveTo(...pts[0]); for (const p of pts.slice(1)) sh.lineTo(...p); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 2 }); g.rotateX(Math.PI / 2); return g; };
    const innerG = panel([[0, -2.6], [0, 2.4], [4.6, 1.3], [4.6, -1.9]]), outerG = panel([[0, -1.9], [0, 1.3], [4.8, -0.6], [5.4, -1.6], [3.0, -2.6]]);
    for (const side of [-1, 1]) {
      const inner = new THREE.Group(); inner.position.set(side * 1.1, 0.05, 0); this.body.add(inner);
      const im = new THREE.Mesh(innerG, skin); im.scale.x = side; inner.add(im);
      const outer = new THREE.Group(); outer.position.set(side * 4.6, 0, 0); inner.add(outer);
      const om = new THREE.Mesh(outerG, skin); om.scale.x = side; outer.add(om);
      this.wings.push({ inner, outer, side });
    }
    let parent: THREE.Object3D = this.body, z = -3.2;
    for (let i = 0; i < 8; i++) { const seg = new THREE.Group(); seg.position.z = z; parent.add(seg); const len = 1 - i * 0.05, r = 0.4 * (1 - i / 9); const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, len, 8), skin); m.rotation.x = Math.PI / 2; m.position.z = -len / 2; seg.add(m); this.tail.push(seg); parent = seg; z = -len; }
    shadeAll(this.g);
  }
  /** beat: the wing-beat phase (radians, integrated); amp 0..1; fold 0 flying .. 1 landed; bank and pitch in radians */
  pose(pos: THREE.Vector3, yaw: number, o: { beat: number; amp: number; fold: number; pitch: number; bank: number; t: number }) {
    this.g.position.copy(pos); this.g.rotation.set(o.pitch, yaw, o.bank, "YXZ");
    const f = Math.sin(o.beat);
    for (const w of this.wings) {
      w.inner.rotation.z = w.side * (f * o.amp * 0.8 + o.fold * 0.75);
      w.outer.rotation.z = w.side * (Math.sin(o.beat - 0.7) * o.amp * 0.9 + o.fold * 1.6);
      w.inner.rotation.y = -w.side * o.fold * 0.35;
    }
    this.body.position.y = -f * o.amp * 0.25 * (this.span / 22);
    this.tail.forEach((s, i) => { s.rotation.y = 0.12 * Math.sin(o.t * 1.7 - i * 0.6); s.rotation.x = 0.05 * Math.sin(o.beat - i * 0.5) + o.fold * 0.08; });
  }
  /** the head's world position (for framing) */
  headAt() { this.g.updateMatrixWorld(true); return this.head.getWorldPosition(new THREE.Vector3()); }
}

/** a four-legged walker (a large hound or a small horse), shoulder height `h`, nose toward +z */
export class Quadruped {
  g = new THREE.Group(); body = new THREE.Group(); neck = new THREE.Group(); head = new THREE.Group();
  legs: { hip: THREE.Group; knee: THREE.Group; front: boolean; side: number }[] = [];
  tail = new THREE.Group();
  constructor(tint: Tint = "sand", public h = 1.1) {
    const s = h / 1.1, skin = clay(TINT[tint], 0.9);
    this.g.add(this.body); this.body.scale.setScalar(s); this.body.position.y = 0;
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.1, 6, 16), skin); torso.rotation.x = Math.PI / 2; torso.position.y = 1.05; this.body.add(torso);
    this.neck.position.set(0, 1.18, 0.75); this.body.add(this.neck);
    const nk = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.45, 4, 12), skin); nk.rotation.x = -0.7; nk.position.set(0, 0.2, 0.15); this.neck.add(nk);
    this.head.position.set(0, 0.45, 0.35); this.neck.add(this.head);
    const sk = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.32, 4, 12), skin); sk.rotation.x = Math.PI / 2 - 0.2; sk.position.z = 0.12; this.head.add(sk);
    for (const x of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), skin); ear.position.set(x * 0.09, 0.17, -0.02); this.head.add(ear); }
    for (const [front, z] of [[true, 0.55], [false, -0.55]] as [boolean, number][]) for (const side of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(side * 0.2, 0.98, z); this.body.add(hip);
      const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.38, 4, 10), skin); up.position.y = -0.24; hip.add(up);
      const knee = new THREE.Group(); knee.position.y = -0.48; hip.add(knee);
      const lo = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.38, 4, 10), skin); lo.position.y = -0.22; knee.add(lo);
      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.16), skin); paw.position.set(0, -0.47, 0.03); knee.add(paw);
      this.legs.push({ hip, knee, front, side });
    }
    this.tail.position.set(0, 1.1, -0.82); this.body.add(this.tail);
    const tl = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.5, 4, 8), skin); tl.rotation.x = -2.2; tl.position.set(0, 0.15, -0.2); this.tail.add(tl);
    shadeAll(this.g);
  }
  /** stride: gait phase (radians, integrated); amt 0 standing .. 1 full walk */
  pose(pos: THREE.Vector3, yaw: number, stride: number, amt: number, t: number) {
    this.g.position.copy(pos); this.g.rotation.set(0, yaw, 0);
    for (const L of this.legs) {
      const ph = stride + (L.front ? 0 : Math.PI) + (L.side > 0 ? Math.PI / 2 : 0);   // a walking gait: four beats
      L.hip.rotation.x = 0.38 * Math.sin(ph) * amt;
      L.knee.rotation.x = (L.front ? -1 : 1) * Math.max(0, Math.sin(ph - 0.8)) * 0.6 * amt;
    }
    this.body.position.y = 0.03 * Math.abs(Math.sin(stride * 2)) * amt;
    this.neck.rotation.x = 0.06 * Math.sin(stride * 2) * amt + 0.03 * Math.sin(t * 0.9);
    this.tail.rotation.y = 0.25 * Math.sin(t * 2.4);
  }
  headAt() { this.g.updateMatrixWorld(true); return this.head.getWorldPosition(new THREE.Vector3()); }
}
