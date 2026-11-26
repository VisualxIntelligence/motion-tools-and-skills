// Stand-ins: each person replaced by a striped pill (a shape no set object has) fitted to their body, for a video model to read placement from
// without a body to copy. Two are built: the pin (a head on a slim body, the default) and the capsule (one rounded body, --standin capsule). The box sits where they stand, is as tall as they are (lower when they crouch, raised when
// they jump, flat when they lie down), turns with them, and carries a round white dot on its front face at eye height,
// like a face, so the way they face (and where their eyes are) reads. Each box is a loud colour with bold diagonal stripes (nothing in a set looks like it), assigned from the
// person's clay tint (CAPSULE), so a prompt can say which capsule is who.
import * as THREE from "three";
import type { Tint } from "./kit/clay";

// one fixed loud colour per tint, so every prompt can name a person's capsule from their tint alone
export const CAPSULE: Record<Tint, { hex: string; name: string }> = {
  ochre: { hex: "#e3261f", name: "red-and-black" }, slate: { hex: "#ffe600", name: "yellow-and-black" },
  rose: { hex: "#1fa84a", name: "green-and-black" }, sage: { hex: "#1f5fe3", name: "blue-and-black" },
  plum: { hex: "#d81fb5", name: "magenta-and-black" }, sand: { hex: "#ff7a00", name: "orange-and-black" },
  stone: { hex: "#00c8d7", name: "cyan-and-black" },
};
/** diagonal stripes of a colour and near-black (hazard tape), as a small repeating texture */
export function stripes(hex: string) {
  const c = new THREE.Color(hex), d = new THREE.Color("#141414"), n = 64, px = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const k = ((x + y) % 32) < 16 ? c : d, i = (y * n + x) * 4; px[i] = k.r * 255; px[i + 1] = k.g * 255; px[i + 2] = k.b * 255; px[i + 3] = 255; }
  const t = new THREE.DataTexture(px, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 6); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
}

type Person = { root: THREE.Object3D; spec: { tint: Tint; capsule?: "trunk"; label?: string}; rig?: { marks(): { top: THREE.Vector3; sole: THREE.Vector3; eye: THREE.Vector3; joints: { name: string; p: THREE.Vector3 }[] } } };

/** which stand-in is drawn: "pin" (a head on a body, slim) or "capsule" (the single striped capsule of the first gallery clips) */
export let STANDIN: "pin" | "capsule" = "pin";
export const setStandin = (m?: string) => { STANDIN = m === "capsule" ? "capsule" : "pin"; };

export class StandIns {
  private boxes = new Map<Person, { body: THREE.Mesh; head: THREE.Mesh; stripe: THREE.Mesh; group: THREE.Group; dims: { w: number; h: number; d: number } }>();
  constructor(private scene: THREE.Scene) {}
  /** fit a box to each person's body as it is posed now, and show the boxes */
  show(people: Person[]) {
    for (const a of people) {
      if (!a.rig) continue;
      let b = this.boxes.get(a);
      if (!b) {
        const group = new THREE.Group();
        const hex = CAPSULE[a.spec.tint].hex;
        const tex = stripes(hex), mk = () => new THREE.MeshStandardMaterial({ map: tex.clone(), roughness: 0.75 });
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 6, 20), mk()); body.castShadow = body.receiveShadow = true;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 20), mk()); head.castShadow = head.receiveShadow = true;   // the head is sized from the human's head, so a close shot shows a head on shoulders, not one giant dome
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), new THREE.MeshStandardMaterial({ color: "#f4f4f2", roughness: 0.6 }));
        stripe.rotation.x = Math.PI / 2;                                   // a disc facing forward
        group.add(body, head, stripe);
        this.scene.add(group); b = { body, head, stripe, group, dims: { w: 0.46, h: 1.8, d: 0.3 } }; this.boxes.set(a, b);
      }
      // the body's extent in its own frame (yaw only), from its joints, eyes, crown and soles
      a.root.updateMatrixWorld(true);
      const yaw = a.root.rotation.y, m = a.rig.marks(), inv = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -yaw);
      // a person carrying something at arm's length ("trunk") is fitted to the trunk only, so the carried prop stays outside
      const pts = [m.top, m.sole, m.eye, ...m.joints.filter((j) => a.spec.capsule !== "trunk" || (j.name !== "elbow" && j.name !== "wrist")).map((j) => j.p)];
      const lo = new THREE.Vector3(Infinity, Infinity, Infinity), hi = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
      for (const p of pts) { const q = p.clone().applyQuaternion(inv); lo.min(q); hi.max(q); }
      const pad = 0.12, size = new THREE.Vector3(Math.max(0.42, hi.x - lo.x + 2 * pad), Math.max(0.3, hi.y - lo.y + 0.08), Math.max(0.3, hi.z - lo.z + 2 * pad));
      // slim: a person is about 0.5 m across the shoulders and 0.3 m deep. The fitted capsule used to take in the arms and be up to 0.9 m wide, which made every close shot look closer than designed and read as a giant dome (the blockouts read as too close)
      if (process.env.REMOTION_SLIM !== "0" && STANDIN !== "capsule") { size.x = Math.min(size.x, 0.5); size.z = Math.min(size.z, 0.34); }
      const centre = lo.clone().add(hi).multiplyScalar(0.5).applyQuaternion(inv.clone().invert());
      b.group.position.copy(centre); b.group.rotation.set(0, yaw, 0);
      // the capsule: the single striped capsule of the first gallery clips. One rounded body as tall as the person and as wide as the fitted
      // box (arms included, so up to about 0.9 m across), a white dot on its front face at eye height. Select it with --standin capsule.
      if (STANDIN === "capsule") {
        const eyeY = m.eye.clone().sub(centre).applyQuaternion(inv).y;
        const rx = size.x / 2, rz = size.z / 2, len = Math.max(0.01, (size.y - 2 * rx) / rx);
        b.head.visible = false;
        b.body.geometry.dispose(); b.body.geometry = new THREE.CapsuleGeometry(1, len, 6, 20);
        b.body.scale.set(rx, rx, rz); b.body.position.set(0, 0, 0); b.dims = { w: size.x, h: size.y, d: size.z };
        this.uvMetres(b.body.geometry as THREE.BufferGeometry, Math.max(1, Math.round(Math.PI * (size.x + size.z) / 2 / 0.6)), rx); (b.body.material as THREE.MeshStandardMaterial).map!.repeat.set(1, 1);   // bold bands, about 0.6 m per stripe pair
        const dy = Math.min(Math.abs(eyeY), size.y / 2 - rx), face = rz * Math.sqrt(Math.max(0.05, 1 - (Math.max(0, Math.abs(eyeY) - (size.y / 2 - rx)) / rx) ** 2));
        b.stripe.scale.set(0.11, 0.02, 0.11); b.stripe.position.set(0, eyeY, face + 0.004); void dy;
        b.group.visible = true;
        continue;
      }
      // the pin: a head (a real head is about 0.17 m wide, 0.22 m tall) on a body capsule at the real shoulder width, both striped; the dot sits on the head at eye height
      const eyeLocal = m.eye.clone().sub(centre).applyQuaternion(inv);
      b.head.visible = true;
      const headW = 0.20, headH = 0.27, headD = 0.23, headY = eyeLocal.y + 0.02;
      b.head.scale.set(headW, headH, headD); b.head.position.set(0, headY, 0);
      const bw = Math.min(size.x, 0.46), bd = Math.min(size.z, 0.28), r = bw / 2, sy = r * 0.5;                 // a flattened dome: shoulders slope, they do not rise to a point
      const top = headY - headH / 2 + 0.09, bottom = -size.y / 2, hgt = Math.max(0.3, top - bottom);          // the shoulders start just under the chin and meet the head
      b.body.geometry.dispose(); b.body.geometry = new THREE.CapsuleGeometry(1, Math.max(0.01, hgt / sy - 2), 6, 20);
      b.body.scale.set(r, sy, bd / 2); b.body.position.set(0, (top + bottom) / 2, 0); b.dims = { w: bw, h: hgt, d: bd };
      this.uvMetres(b.body.geometry as THREE.BufferGeometry, Math.max(1, Math.round(Math.PI * (bw + bd) / 2 / 0.2)), sy); const bt = (b.body.material as THREE.MeshStandardMaterial).map!; bt.repeat.set(1, 1); this.fit(b.head, Math.PI * (headW + headD) / 2, Math.PI * headH / 2 * 1.0);
      const dot = 0.11; b.stripe.scale.set(dot, 0.02, dot); b.stripe.position.set(0, headY, headD / 2 + 0.004);
      b.group.visible = true;
    }
  }
  /** repeat the stripe texture by the part's real size (circumference around, length along) so the stripes stay diagonal at one thickness on every part */
  private fit(m: THREE.Mesh, around: number, along: number) { const t = (m.material as THREE.MeshStandardMaterial).map!; t.repeat.set(Math.max(1, Math.round(around / 0.2)), Math.max(1, Math.round(along / 0.2))); t.needsUpdate = false; }
  /** the capsule's own UV spreads its rows by segment, not by length, so stripes turn into rings and bars; set v from the real height (metres) and u as a whole number of tiles around */
  private uvMetres(g: THREE.BufferGeometry, around: number, sy: number) { const pos = g.getAttribute("position"), uv = g.getAttribute("uv"); for (let i = 0; i < uv.count; i++) { uv.setXY(i, uv.getX(i) * around, (pos.getY(i) * sy) / 0.2); } uv.needsUpdate = true; }
  private labelled: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
  private labelMats = new Map<string, THREE.MeshStandardMaterial>();
  /** props that act take a flat label colour (spec.label) so a video model can name them like the capsules; hide() puts their clay back */
  labelProps(props: Person[]) {
    for (const a of props) {
      if (!a.spec.label) continue;
      let m = this.labelMats.get(a.spec.label);
      if (!m) { m = new THREE.MeshStandardMaterial({ color: a.spec.label, roughness: 0.8 }); this.labelMats.set(a.spec.label, m); }
      a.root.traverse((o: any) => { if (o.isMesh) { this.labelled.push([o, o.material]); o.material = m; } });
    }
  }
  /** hide any capsule the camera is inside (an over-the-shoulder or POV camera sits within its person's capsule) */
  clearAround(p: THREE.Vector3) {
    for (const b of this.boxes.values()) {
      if (!b.group.visible) continue;
      const q = b.group.worldToLocal(p.clone()), sx = b.dims.w / 2, sy = b.dims.h / 2 + 0.2, sz = b.dims.d / 2;
      if ((q.x / (sx + 0.15)) ** 2 + (q.z / (sz + 0.15)) ** 2 < 1 && Math.abs(q.y) < sy + 0.2) b.group.visible = false;
    }
  }
  /** the capsules' bodies (for an outline pass): the face dot is left out, so the ink draws it as a ring on the capsule */
  roots() { return [...this.boxes.values()].flatMap((b) => [b.body, b.head]); }
  /** the capsule groups (body and face dot), for the drawn look that paints the striped pill over the ink */
  groups() { return [...this.boxes.values()].filter((b) => b.group.visible).map((b) => b.group); }
  private lit = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  /** drawn look: the pill flat (its own stripes, no light and no shading), a hair smaller so the ink outline stays; off puts the clay back */
  flat(on: boolean) {
    for (const b of this.boxes.values()) {
      if (on) {
        this.lit.set(b.body, b.body.material); this.lit.set(b.head, b.head.material); this.lit.set(b.stripe, b.stripe.material);
        const flatMat = new THREE.MeshBasicMaterial({ map: (b.body.material as THREE.MeshStandardMaterial).map }); b.body.material = flatMat; b.head.material = flatMat;
        b.stripe.material = new THREE.MeshBasicMaterial({ color: "#f6f6f4" });
        b.group.scale.setScalar(0.975);
      } else {
        for (const m of [b.body, b.head, b.stripe]) { const was = this.lit.get(m); if (was) { (m.material as THREE.Material).dispose(); m.material = was; } }
        b.group.scale.setScalar(1);
      }
    }
    if (!on) this.lit.clear();
  }
  hide() { for (const b of this.boxes.values()) b.group.visible = false; for (const [o, m] of this.labelled) o.material = m; this.labelled = []; }
}
