// The kit: sets and props in grey clay, each a function that returns a Group placed at the origin, +z its front.
// Sizes are real metres. Everything casts and takes shadows. Interiors use inward-facing walls, so a camera outside a
// room sees in through the wall nearest it (a set with a flown wall).
import * as THREE from "three";
import { GREY, clay, shadeAll } from "./clay";
import { fbm, noise2, rng } from "../util";

const box = (w: number, h: number, d: number, c: string, rough = 0.92) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c, rough));
const cyl = (r1: number, r2: number, h: number, c: string, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), clay(c));
const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };
const group = (...o: THREE.Object3D[]) => { const g = new THREE.Group(); g.add(...o); return g; };

// ---------------- ground and nature ----------------

/** a ground plane with a soft roll (amp metres) beyond a flat centre of radius `flat` */
export function ground(size = 400, amp = 1.2, flat = 18, color = GREY.ground, seed = 3) {
  const g = new THREE.PlaneGeometry(size, size, 220, 220); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    const k = THREE.MathUtils.smoothstep(r, flat, flat * 3);
    p.setY(i, (fbm(x * 0.02 + seed, z * 0.02, 4) * amp * 2 + fbm(x * 0.12, z * 0.12 + seed, 2) * 0.08) * k);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, clay(color, 0.97)); m.receiveShadow = true;
  return m;
}
/** a lumpy boulder, about `s` metres across */
/** scenery (trees, rocks, bushes, lamps, benches): left out of a drawn reference so a video model has no stand-in shape to copy */
export const dress = <T extends THREE.Object3D>(o: T) => { o.userData.dressing = true; return o; };
export function rock(seed: number, s = 1, color = GREY.mid) {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.attributes.position as THREE.BufferAttribute;
  const r = rng(seed), ox = r() * 100, oz = r() * 100;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + 0.28 * noise2(x * 1.8 + ox, z * 1.8 + y * 1.3 + oz) + 0.08 * noise2(x * 6 + oz, y * 6 + ox);
    x *= n; z *= n; y *= n * 0.72;
    if (y < -0.25) y = -0.25 - (y + 0.25) * 0.3;                     // a flat bed so it sits on the ground
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, clay(color, 0.95)); m.scale.setScalar(s / 2); m.position.y = s * 0.12; m.rotation.y = r() * 6.28;
  return dress(shadeAll(group(m)));
}
/** a conifer of height h: a trunk and stacked, slightly irregular cones */
export function pine(h = 9, seed = 1, color = GREY.mid) {
  const r = rng(seed), g = new THREE.Group();
  g.add(at(cyl(h * 0.025, h * 0.04, h * 0.35, GREY.dark, 8), 0, h * 0.175, 0));
  const n = 4;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), cone = new THREE.Mesh(new THREE.ConeGeometry(h * (0.3 - 0.17 * k) * (0.9 + 0.2 * r()), h * 0.36, 9), clay(color, 0.95));
    cone.position.y = h * (0.3 + 0.19 * i); cone.rotation.y = r() * 6.28; g.add(cone);
  }
  return dress(shadeAll(g));
}
/** a broadleaf tree: trunk, two limbs, a cluster of soft lobes */
export function broadTree(h = 8, seed = 2, color = GREY.light) {
  const r = rng(seed), g = new THREE.Group();
  g.add(at(cyl(h * 0.035, h * 0.06, h * 0.55, GREY.dark, 10), 0, h * 0.275, 0));
  for (let i = 0; i < 7; i++) {
    const a = r() * 6.28, d = h * 0.16 * r(), s = h * (0.16 + 0.1 * r());
    const lobe = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), clay(color, 0.96));
    lobe.position.set(Math.cos(a) * d, h * (0.62 + 0.18 * r()), Math.sin(a) * d); lobe.scale.y = 0.8; g.add(lobe);
  }
  return dress(shadeAll(g));
}
export function bush(s = 1, seed = 4, color = GREY.set) {
  const r = rng(seed), g = new THREE.Group();
  for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(s * (0.35 + 0.2 * r()), 1), clay(color, 0.96)); l.position.set((r() - 0.5) * s * 0.7, s * 0.3, (r() - 0.5) * s * 0.7); g.add(l); }
  return dress(shadeAll(g));
}
/** scatter `make(i)` over a ring between r0 and r1 around (cx, cz), never inside `keepOut` circles */
export function scatter(parent: THREE.Object3D, n: number, r0: number, r1: number, make: (i: number) => THREE.Object3D, seed = 9, keepOut: [number, number, number][] = [], cx = 0, cz = 0) {
  const r = rng(seed);
  for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r0 * r0 + (r1 * r1 - r0 * r0) * r());
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    if (keepOut.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr)) continue;
    const o = make(i); o.position.x += x; o.position.z += z; parent.add(o); i++;
  }
}

// ---------------- architecture ----------------

/** a building block w x d x h with floor lines and inset windows on the front and sides */
export function building(w = 12, d = 10, h = 18, seed = 5, color = GREY.light) {
  const r = rng(seed), g = new THREE.Group();
  g.add(at(box(w, h, d, color), 0, h / 2, 0));
  g.add(at(box(w + 0.4, 0.5, d + 0.4, GREY.set), 0, h + 0.25, 0));            // the cornice
  const floors = Math.max(1, Math.floor(h / 3.4)), cols = Math.max(1, Math.floor(w / 2.6));
  const win = clay(GREY.dark, 0.6);
  for (let f = 0; f < floors; f++) {
    const y = 2.2 + f * 3.4; if (y > h - 1) break;
    g.add(at(box(w + 0.06, 0.12, d + 0.06, GREY.set), 0, y - 0.95, 0));
    for (let c = 0; c < cols; c++) {
      if (r() < 0.06) continue;
      const x = -w / 2 + (c + 0.5) * (w / cols);
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.7, 0.2), win); m.position.set(x, y, d / 2 - 0.04); g.add(m);
    }
    const sides = Math.max(1, Math.floor(d / 2.6));
    for (let c = 0; c < sides; c++) for (const s of [-1, 1]) {
      const z = -d / 2 + (c + 0.5) * (d / sides);
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.7, 1.2), win); m.position.set(s * (w / 2 - 0.04), y, z); g.add(m);
    }
  }
  // a door at street level
  g.add(at(box(1.6, 2.4, 0.3, GREY.dark), (r() - 0.5) * (w - 3), 1.2, d / 2 - 0.08));
  return shadeAll(g);
}
export function lampPost(h = 5) {
  const g = group(at(cyl(0.07, 0.1, h, GREY.dark, 10), 0, h / 2, 0), at(box(0.12, 0.12, 1.2, GREY.dark), 0, h - 0.06, 0.55), at(box(0.32, 0.18, 0.5, GREY.paper), 0, h - 0.2, 1.05));
  return dress(shadeAll(g));
}
export function bench() {
  const g = group(at(box(1.8, 0.08, 0.45, GREY.set), 0, 0.45, 0), at(box(1.8, 0.45, 0.06, GREY.set), 0, 0.72, -0.2), at(box(0.08, 0.45, 0.45, GREY.dark), -0.8, 0.22, 0), at(box(0.08, 0.45, 0.45, GREY.dark), 0.8, 0.22, 0));
  return dress(shadeAll(g));
}
/** a column of height h, with base and capital */
export function column(h = 6, r = 0.4) {
  const g = group(at(cyl(r, r * 1.05, h, GREY.light, 20), 0, h / 2, 0), at(box(r * 2.8, 0.3, r * 2.8, GREY.set), 0, 0.15, 0), at(box(r * 2.8, 0.3, r * 2.8, GREY.set), 0, h - 0.15, 0));
  return shadeAll(g);
}
/** steps of n treads, w wide, rising toward -z */
export function steps(n = 5, w = 6, rise = 0.18, run = 0.38) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) g.add(at(box(w, rise * (i + 1), run, GREY.set), 0, (rise * (i + 1)) / 2, -i * run));
  return shadeAll(g);
}
export function crate(s = 1) { return shadeAll(group(at(box(s, s, s, GREY.set), 0, s / 2, 0), at(box(s * 1.02, s * 0.1, s * 1.02, GREY.mid), 0, s * 0.5, 0))); }
export function barrel(h = 1) { return shadeAll(group(at(cyl(h * 0.32, h * 0.32, h, GREY.mid, 18), 0, h / 2, 0), at(cyl(h * 0.335, h * 0.335, h * 0.06, GREY.dark, 18), 0, h * 0.25, 0), at(cyl(h * 0.335, h * 0.335, h * 0.06, GREY.dark, 18), 0, h * 0.75, 0))); }

// ---------------- interiors ----------------

/** a room w x d x h, floor at y=0, centred on the origin. Walls face inward (a camera outside sees through the near
 *  wall). openings: per wall ("n" = -z, "s" = +z, "e" = +x, "w" = -x), a door or window by centre offset and size */
export function room(w = 6, d = 5, h = 2.8, openings: { wall: "n" | "s" | "e" | "w"; at: number; width: number; bottom: number; top: number }[] = [], floor = GREY.ground, wall = GREY.light) {
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), clay(floor, 0.95)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), clay(GREY.paper, 0.95)); ceil.rotation.x = Math.PI / 2; ceil.position.y = h; g.add(ceil);
  const walls: Record<string, { len: number; place: (m: THREE.Mesh, u: number, y: number) => void }> = {
    n: { len: w, place: (m, u, y) => { m.position.set(u, y, -d / 2); } },
    s: { len: w, place: (m, u, y) => { m.position.set(-u, y, d / 2); m.rotation.y = Math.PI; } },
    e: { len: d, place: (m, u, y) => { m.position.set(w / 2, y, u); m.rotation.y = -Math.PI / 2; } },
    w: { len: d, place: (m, u, y) => { m.position.set(-w / 2, y, -u); m.rotation.y = Math.PI / 2; } },
  };
  const mat = clay(wall, 0.95);
  for (const [k, W] of Object.entries(walls)) {
    // split the wall into panels around its openings (u runs along the wall, y up)
    const ops = openings.filter((o) => o.wall === k).sort((a, b) => a.at - b.at);
    let u0 = -W.len / 2;
    const panel = (a: number, b: number, y0: number, y1: number) => {
      if (b - a < 0.01 || y1 - y0 < 0.01) return;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(b - a, y1 - y0), mat); m.receiveShadow = true; m.castShadow = true;
      W.place(m, (a + b) / 2, (y0 + y1) / 2); g.add(m);
    };
    for (const o of ops) {
      const a = o.at - o.width / 2, b = o.at + o.width / 2;
      panel(u0, a, 0, h); panel(a, b, 0, o.bottom); panel(a, b, o.top, h); u0 = b;
      // a frame round the opening
      const fr = new THREE.Group(), fm = clay(GREY.set, 0.85);
      const top = new THREE.Mesh(new THREE.BoxGeometry(o.width + 0.1, 0.06, 0.14), fm); top.position.set(0, o.top, 0); fr.add(top);
      for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, o.top - o.bottom, 0.14), fm); side.position.set(s * o.width / 2, (o.top + o.bottom) / 2, 0); fr.add(side); }
      if (o.bottom > 0.05) { const sill = new THREE.Mesh(new THREE.BoxGeometry(o.width + 0.14, 0.05, 0.2), fm); sill.position.set(0, o.bottom, 0.03); fr.add(sill); }
      const holder = new THREE.Mesh(); W.place(holder, o.at, 0); fr.position.copy(holder.position); fr.rotation.copy(holder.rotation); g.add(shadeAll(fr));
    }
    panel(u0, W.len / 2, 0, h);
  }
  // a skirting board
  for (const [k, W] of Object.entries(walls)) { const m = new THREE.Mesh(new THREE.BoxGeometry(W.len, 0.1, 0.03), clay(GREY.set)); W.place(m, 0, 0.05); m.translateZ(0.015); if (!openings.some((o) => o.wall === k && o.bottom < 0.05)) g.add(m); }
  return g;
}
export function table(w = 1.4, d = 0.8, h = 0.75) {
  const g = group(at(box(w, 0.05, d, GREY.set), 0, h, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(box(0.05, h, 0.05, GREY.dark), x * (w / 2 - 0.07), h / 2, z * (d / 2 - 0.07)));
  return shadeAll(g);
}
export function chair(h = 0.45) {
  const g = group(at(box(0.44, 0.05, 0.44, GREY.set), 0, h, 0), at(box(0.44, 0.5, 0.05, GREY.set), 0, h + 0.27, -0.2));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(box(0.04, h, 0.04, GREY.dark), x * 0.19, h / 2, z * 0.19));
  return shadeAll(g);
}
export function sofa(w = 2) {
  return shadeAll(group(at(box(w, 0.42, 0.9, GREY.mid), 0, 0.21, 0), at(box(w, 0.5, 0.2, GREY.mid), 0, 0.62, -0.35), at(box(0.2, 0.3, 0.9, GREY.mid), -w / 2 + 0.1, 0.55, 0), at(box(0.2, 0.3, 0.9, GREY.mid), w / 2 - 0.1, 0.55, 0)));
}
export function shelf(w = 1.2, h = 1.9) {
  const g = group(at(box(w, h, 0.04, GREY.set), 0, h / 2, -0.15), at(box(0.04, h, 0.34, GREY.set), -w / 2, h / 2, 0), at(box(0.04, h, 0.34, GREY.set), w / 2, h / 2, 0));
  const r = rng(11);
  for (let i = 0; i < 5; i++) {
    const y = 0.05 + i * (h / 5); g.add(at(box(w, 0.03, 0.34, GREY.set), 0, y, 0));
    let x = -w / 2 + 0.08; while (x < w / 2 - 0.12) { const bw = 0.04 + r() * 0.05, bh = 0.18 + r() * 0.14; if (r() > 0.25) g.add(at(box(bw, bh, 0.24, r() > 0.5 ? GREY.mid : GREY.light), x + bw / 2, y + bh / 2 + 0.015, 0)); x += bw + 0.01; }
  }
  return shadeAll(g);
}
export function floorLamp(h = 1.6) { return shadeAll(group(at(cyl(0.16, 0.18, 0.04, GREY.dark), 0, 0.02, 0), at(cyl(0.015, 0.015, h, GREY.dark, 8), 0, h / 2, 0), at(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.28, 18, 1, true), clay(GREY.paper, 0.9, { side: THREE.DoubleSide, emissive: "#fff4e0", ei: 0.6 })), 0, h, 0))); }
/** a vanity: counter, basin, and a mirror panel above (flat dark grey: clay does not reflect) */
export function vanity(w = 1.2) {
  return shadeAll(group(at(box(w, 0.85, 0.5, GREY.set), 0, 0.425, 0), at(box(0.45, 0.06, 0.35, GREY.paper), 0, 0.86, 0.02), at(box(w * 0.9, 0.9, 0.03, GREY.dark), 0, 1.6, -0.24), at(box(w * 0.94, 0.95, 0.02, GREY.set), 0, 1.6, -0.255)));
}
export function door(w = 0.9, h = 2.05) { return shadeAll(group(at(box(w, h, 0.05, GREY.set), 0, h / 2, 0), at(box(0.1, 0.03, 0.06, GREY.dark), w * 0.38, h * 0.48, 0.04))); }

// ---------------- vehicles ----------------

/** a car, 4.4 m long, nose toward +z */
export function car(color: string = GREY.set) {
  const g = new THREE.Group();
  g.add(at(box(1.8, 0.7, 4.4, color, 0.6), 0, 0.6, 0));
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), clay(color, 0.6)); cab.position.set(0, 1.22, -0.25); g.add(cab);
  const glass = clay(GREY.ink, 0.25);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 1.9), glass); w.position.set(s * 0.81, 1.25, -0.25); g.add(w); }
  for (const z of [0.86, -1.36]) { const w = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 0.02), glass); w.position.set(0, 1.25, z); g.add(w); }
  for (const [x, z] of [[-1, 1.35], [1, 1.35], [-1, -1.35], [1, -1.35]]) { const wh = cyl(0.34, 0.34, 0.24, GREY.ink, 20); wh.rotation.z = Math.PI / 2; wh.position.set(x * 0.86, 0.34, z); g.add(wh); }
  g.add(at(box(1.5, 0.12, 0.05, GREY.paper), 0, 0.72, 2.21));
  return shadeAll(g);
}
/** a car's front cabin for interior shots: two seats, a dash and wheel, pillars and roof. The driver sits at x = -0.38 */
export function carInterior(color: string = GREY.set) {
  const g = new THREE.Group(), body = clay(color, 0.7), dark = clay(GREY.dark, 0.8);
  const seat = () => group(at(box(0.5, 0.14, 0.52, GREY.mid), 0, 0.42, 0), at(box(0.5, 0.62, 0.12, GREY.mid), 0, 0.78, -0.27), at(box(0.28, 0.2, 0.1, GREY.mid), 0, 1.2, -0.29));
  g.add(at(seat(), -0.38, 0, 0), at(seat(), 0.38, 0, 0));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.45), dark), 0, 0.82, 0.9));                       // dash
  // the wheel sits where the driving clip's hands grip (measured: wrists at y 1.0, z 0.1), its column runs into the dash
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 8, 28), dark); wheel.position.set(-0.37, 1.0, 0.17); wheel.rotation.x = -0.45; g.add(wheel);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.62, 10), dark); column.position.set(-0.37, 0.88, 0.45); column.rotation.x = 1.12; g.add(column);
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.04, 2.2), body), 0, 1.62, -0.05));                      // roof
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.06, 2.4), dark), 0, 0.28, 0.1));                     // floor
  for (const s of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.08), body); pillar.position.set(s * 0.74, 1.2, 0.98); pillar.rotation.x = -0.55; g.add(pillar);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.08), body); b.position.set(s * 0.78, 1.2, -0.5); g.add(b);
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 1.9), body), s * 0.8, 0.55, 0.25));              // door panel below the window
  }
  return shadeAll(g);
}
/** a small spacecraft, 14 m long, nose toward +z */
export function ship(color: string = GREY.light) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 9, 6, 18), clay(color, 0.6)); hull.rotation.x = Math.PI / 2; g.add(hull);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.6), clay(GREY.ink, 0.3)); nose.position.set(0, 0.85, 4.2); nose.rotation.x = 0.35; g.add(nose);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.25, 3.2), clay(color, 0.6)); wing.position.set(s * 3.6, -0.2, -1.5); wing.rotation.z = s * -0.08; g.add(wing);
    const eng = cyl(0.55, 0.65, 2.6, GREY.mid, 18); eng.rotation.x = Math.PI / 2; eng.position.set(s * 2.2, -0.1, -4.4); g.add(eng);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.45, 18), clay(GREY.paper, 0.5, { emissive: "#ffffff", ei: 1.4 })); glow.position.set(s * 2.2, -0.1, -5.72); glow.rotation.y = Math.PI; g.add(glow);
  }
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 2.6), clay(color, 0.6)); fin.position.set(0, 1.9, -3.6); g.add(fin);
  return shadeAll(g);
}
/** a planet (and an optional ring), in clay, unlit by fog */
export function planet(r = 300, ring = true) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(r, 64, 40);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i).normalize(); const n = 1 + 0.004 * fbm(v.x * 6, v.y * 6 + v.z * 3, 3); p.setXYZ(i, v.x * r * n, v.y * r * n, v.z * r * n); }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: GREY.light, roughness: 1, fog: false })));
  if (ring) { const rg = new THREE.Mesh(new THREE.RingGeometry(r * 1.35, r * 2.0, 128), new THREE.MeshStandardMaterial({ color: GREY.set, roughness: 1, side: THREE.DoubleSide, fog: false, transparent: true, opacity: 0.7 })); rg.rotation.x = -Math.PI / 2 + 0.32; g.add(rg); }
  return g;
}
/** a floating asteroid of size s */
export function asteroid(seed: number, s = 6) { const g = rock(seed, s, GREY.mid); g.children[0].scale.y = (s / 2) * 0.9; g.children[0].position.y = 0; return g; }
