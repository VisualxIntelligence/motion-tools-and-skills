// The set: Ketra's valley in grey clay. Built once, then `update(t)` poses everything for that moment.
import * as THREE from "three";
import { Figure, HUMAN, NATIVE } from "./figures";
import { B, D, DRILL_D, PP, T_BITE, T_RETURN, U, drillState, farRay, ines, pilot, ray, rootR, rootY, ship, warden } from "./story";
import { clamp, fbm, lerp, noise2, ramp, rng } from "./util";
import { shotAt } from "./shots";

// ---- ground ----
export function groundY(x: number, z: number) {
  const r = Math.hypot(x, z);
  const hills = ramp(r, 90, 240) * (fbm(x * 0.006, z * 0.006, 4) * 40 + 14) + ramp(r, 300, 650) * 70;
  return hills + fbm(x * 0.05 + 3, z * 0.05, 3) * 0.5 * ramp(r, 8, 30);
}

// ---- materials ----
export const clay = (color: string, rough = 0.82, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });

export const glowUniforms = {
  uTime: { value: 0 }, uD: { value: D.clone() }, uBite: { value: T_BITE }, uReturn: { value: T_RETURN },
};
/** bioluminescence: pulses toward the spire, drains outward from the wound at T_BITE, returns at T_RETURN */
export function glowMat(color: string, strength = 2.2, base = "#2a3a3a") {
  const m = new THREE.MeshStandardMaterial({ color: base, roughness: 0.6, emissive: color, emissiveIntensity: strength });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, glowUniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vGlowW;")
      .replace("#include <project_vertex>", `#include <project_vertex>
        vec4 gw = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          gw = instanceMatrix * gw;
        #endif
        vGlowW = (modelMatrix * gw).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vGlowW;\nuniform float uTime, uBite, uReturn;\nuniform vec3 uD;")
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        float gd = distance(vGlowW, uD);
        float drained = clamp(((uTime - uBite) * 22.0 - gd) / 4.0, 0.0, 1.0);
        float frontR = (uTime - uReturn) * 14.0;
        float back = clamp((frontR - gd) / 5.0, 0.0, 1.0);
        float life = 1.0 - drained * (1.0 - back);
        float flare = back * exp(-max(0.0, frontR - gd) / 7.0) * 3.0;
        float pulse = 0.55 + 0.45 * sin(length(vGlowW.xz) * 0.45 + uTime * 2.6);
        // a dying flicker as the dark passes
        float edge = drained * (1.0 - drained) * 4.0;
        totalEmissiveRadiance *= life * pulse * (1.0 - 0.6 * edge) + flare;`);
  };
  return m;
}

const MAT = {
  ground: clay("#8e9188", 0.95),
  rootMat: clay("#7f8079", 0.86),
  trunk: clay("#87877f", 0.88),
  bark: clay("#76776f", 0.9),
  canopy: clay("#9a9e94", 0.92),
  canopyDark: clay("#7d837a", 0.92),
  rock: clay("#8a8780", 0.9),
  shipBody: clay("#c9c8c2", 0.55),
  shipDark: clay("#6a6d72", 0.5),
  accent: clay("#d0743a", 0.6),
  suit: clay("#e6e3dc", 0.7),
  visor: clay("#1c2026", 0.18, { metalness: 0.3 }),
  native: clay("#5f80b8", 0.7),
  nativeCrest: clay("#4a669a", 0.7),
  ray: clay("#6e6b78", 0.8),
  rayBelly: clay("#a19ead", 0.8),
  dust: new THREE.MeshStandardMaterial({ color: "#b3ada0", roughness: 1, transparent: true, opacity: 0.5, depthWrite: false }),
  thrust: new THREE.MeshBasicMaterial({ color: "#ffd9a8", transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
  glowTeal: glowMat("#4fe3cf", 2.4),
  glowSoft: glowMat("#62d6ff", 1.6),
  glowPod: glowMat("#7cf0d8", 1.5, "#3a4a48"),
  eyes: glowMat("#a8fff0", 3.5, "#203030"),
};

function shade(m: THREE.Mesh, cast = true, receive = true) { m.castShadow = cast; m.receiveShadow = receive; return m; }

/** a tube whose radius varies along the curve */
export function varTube(pts: THREE.Vector3[], radius: (s: number) => number, tubular = 64, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const frames = curve.computeFrenetFrames(tubular, false);
  const pos: number[] = [], idx: number[] = [], nor: number[] = [];
  for (let i = 0; i <= tubular; i++) {
    const s = i / tubular, c = curve.getPointAt(s), r = radius(s);
    const N = frames.normals[i], Bn = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const n = N.clone().multiplyScalar(Math.cos(a)).add(Bn.clone().multiplyScalar(Math.sin(a)));
      pos.push(c.x + n.x * r, c.y + n.y * r, c.z + n.z * r); nor.push(n.x, n.y, n.z);
    }
  }
  for (let i = 0; i < tubular; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

export function rockGeo(seed: number, detail = 2) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const r = rng(seed); const ox = r() * 100, oz = r() * 100;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + 0.25 * noise2(x * 2 + ox, z * 2 + y * 1.3 + oz);
    x *= n; z *= n; y *= n;
    if (y > 0.15) y = 0.15 + (y - 0.15) * 0.25; else y = y * 1.9 - 0.2 * Math.abs(noise2(x * 3 + oz, z * 3));
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

// ---- the ship ----
class Ship {
  g = new THREE.Group();
  body = new THREE.Group();
  nacelles: THREE.Group[] = [];
  flames: THREE.Mesh[] = [];
  rampJ = new THREE.Group();
  legs: THREE.Group[] = [];
  constructor() {
    this.g.add(this.body);
    this.body.position.y = 1.25;
    const hull = shade(new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.2, 9.0, 1, 1, 1), MAT.shipBody));
    hull.position.set(0, 1.1, 0); this.body.add(hull);
    const roof = shade(new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 9.0, 12, 1, false, -Math.PI / 2, Math.PI), MAT.shipBody));
    roof.rotation.x = Math.PI / 2; roof.scale.z = 0.45; roof.position.set(0, 2.2, 0); this.body.add(roof);
    const nose = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.9, 3.2, 12), MAT.shipBody));
    nose.rotation.x = Math.PI / 2; nose.scale.set(1, 1, 0.75); nose.position.set(0, 1.4, 6.0); this.body.add(nose);
    const glass = shade(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 1.6), MAT.visor));
    glass.position.set(0, 2.25, 4.9); glass.rotation.x = -0.45; this.body.add(glass);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.86, 0.22, 7.0), MAT.accent);
    stripe.position.set(0, 1.55, 0.5); this.body.add(stripe);
    for (const s of [-1, 1]) {
      const wing = shade(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.25, 3.2), MAT.shipBody));
      wing.position.set(s * 3.0, 1.5, -0.6); this.body.add(wing);
      const nac = new THREE.Group(); nac.position.set(s * 4.1, 1.5, -0.6); this.body.add(nac);
      const pod = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.58, 2.8, 14), MAT.shipDark));
      nac.add(pod);
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.2, 14), MAT.accent); ring.position.y = 1.0; nac.add(ring);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.65, 5, 14, 1, true), MAT.thrust);
      flame.position.y = -4.2; flame.rotation.x = Math.PI; nac.add(flame);
      this.nacelles.push(nac); this.flames.push(flame);
      const tail = shade(new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.6, 1.6), MAT.shipBody));
      tail.position.set(s * 1.3, 2.9, -3.8); tail.rotation.z = s * 0.35; this.body.add(tail);
    }
    // landing legs
    for (const [x, z] of [[-1.6, 3], [1.6, 3], [-1.6, -3.2], [1.6, -3.2]]) {
      const leg = new THREE.Group(); leg.position.set(x, 0.1, z); this.body.add(leg);
      const strut = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 6), MAT.shipDark)); strut.position.y = -0.6; leg.add(strut);
      const pad = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.12, 10), MAT.shipDark)); pad.position.y = -1.3; leg.add(pad);
      this.legs.push(leg);
    }
    // rear ramp, hinged at the floor
    this.rampJ.position.set(0, 0.05, -4.5); this.body.add(this.rampJ);
    const ramp_ = shade(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 3.3), MAT.shipBody));
    ramp_.position.set(0, 0, -1.65); this.rampJ.add(ramp_);
    const rampStripe = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.3), MAT.accent); rampStripe.position.set(0, 0.01, -3.0); this.rampJ.add(rampStripe);
    // dark interior behind the ramp
    const inside = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.9, 0.1), MAT.shipDark); inside.position.set(0, 1.0, -4.45); this.body.add(inside);
  }
  update(t: number) {
    const s = ship(t);
    this.g.position.copy(s.pos);
    this.g.rotation.set(s.pitch, s.yaw, s.bank, "YXZ");
    for (const n of this.nacelles) n.rotation.x = s.nacelle;
    const flick = 0.85 + 0.15 * Math.sin(t * 47) * Math.sin(t * 13);
    for (const f of this.flames) { f.scale.set(1, (0.4 + 0.6 * s.thrust) * flick, 1); f.visible = s.thrust > 0.02; }
    MAT.thrust.opacity = 0.55 * s.thrust;
    for (const l of this.legs) l.scale.y = lerp(0.3, 1, ramp(t, 6.5, 8.5));
    // ramp: closed = swung up into the hull, open = resting on the ground
    const open = Math.asin(1.25 / 3.3);
    this.rampJ.rotation.x = lerp(Math.PI / 2, -open, s.ramp);
  }
}

// ---- the sky-ray ----
class SkyRay {
  g = new THREE.Group();
  body = new THREE.Group();
  wings: { inner: THREE.Group; outer: THREE.Group; side: number }[] = [];
  tail: THREE.Group[] = [];
  head = new THREE.Group();
  jaw = new THREE.Group();
  constructor(scale = 1) {
    this.g.add(this.body); this.g.scale.setScalar(scale);
    const torso = shade(new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), MAT.ray));
    torso.scale.set(1.5, 0.62, 3.4); this.body.add(torso);
    const belly = shade(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), MAT.rayBelly));
    belly.scale.set(1.3, 0.45, 3.0); belly.position.y = -0.22; this.body.add(belly);
    // dorsal ridge
    for (let i = 0; i < 7; i++) {
      const sp = shade(new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7 - i * 0.06, 5), MAT.ray));
      sp.position.set(0, 0.62, 1.9 - i * 0.65); sp.rotation.x = -0.5; this.body.add(sp);
    }
    // head: a flat hammer with four eyes and a hinged jaw
    this.head.position.set(0, 0.1, 3.3); this.body.add(this.head);
    const skull = shade(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), MAT.ray));
    skull.scale.set(1.9, 0.42, 1.0); this.head.add(skull);
    for (const s of [-1, 1]) for (const k of [0, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), MAT.eyes);
      e.position.set(s * (1.2 + k * 0.45), 0.12, 0.55 - k * 0.2); this.head.add(e);
    }
    this.jaw.position.set(0, -0.15, -0.2); this.head.add(this.jaw);
    const jawM = shade(new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), MAT.rayBelly));
    jawM.scale.set(1.5, 0.35, 1.1); jawM.position.z = 0.25; this.jaw.add(jawM);
    // wings: inner panel hinged at the body, outer panel hinged at the elbow
    const panel = (pts: [number, number][]) => {
      const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: false });
      g.rotateX(Math.PI / 2); g.translate(0, 0.07, 0);
      return g;
    };
    const innerG = panel([[0, -2.6], [0, 2.4], [4.6, 1.3], [4.6, -1.9]]);
    const outerG = panel([[0, -1.9], [0, 1.3], [4.8, -0.6], [5.4, -1.6], [3.0, -2.6]]);
    for (const side of [-1, 1]) {
      const inner = new THREE.Group(); inner.position.set(side * 1.1, 0.05, 0); this.body.add(inner);
      const im = shade(new THREE.Mesh(innerG, MAT.ray)); im.scale.x = side; inner.add(im);
      const outer = new THREE.Group(); outer.position.set(side * 4.6, 0, 0); inner.add(outer);
      const om = shade(new THREE.Mesh(outerG, MAT.ray)); om.scale.x = side; outer.add(om);
      for (let i = 0; i < 5; i++) {
        const spot = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), MAT.glowSoft);
        spot.rotation.x = -Math.PI / 2; spot.position.set(side * (1.0 + i * 0.75), 0.16, -0.6 + Math.sin(i) * 0.6); outer.add(spot);
      }
      this.wings.push({ inner, outer, side });
    }
    // tail
    let parent: THREE.Object3D = this.body; let z = -3.2;
    for (let i = 0; i < 8; i++) {
      const seg = new THREE.Group(); seg.position.z = z; parent.add(seg);
      const len = 1.0 - i * 0.05, r = 0.42 * (1 - i / 9);
      const m = shade(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, len, 8), MAT.ray));
      m.rotation.x = Math.PI / 2; m.position.z = -len / 2; seg.add(m);
      this.tail.push(seg); parent = seg; z = -len;
    }
  }
  pose(s: { pos: THREE.Vector3; yaw: number; pitch: number; flap: number; flapAmp: number; fold: number; roar: number }, t: number) {
    this.g.position.copy(s.pos);
    this.g.rotation.set(s.pitch, s.yaw, 0, "YXZ");
    const f = Math.sin(s.flap);
    for (const w of this.wings) {
      const up = f * s.flapAmp;
      w.inner.rotation.z = w.side * (up * 0.8 + s.fold * 0.75);
      w.outer.rotation.z = w.side * (Math.sin(s.flap - 0.7) * s.flapAmp * 0.9 + s.fold * 1.6);
      w.inner.rotation.y = -w.side * s.fold * 0.35;
    }
    this.body.position.y = -f * s.flapAmp * 0.25;
    this.tail.forEach((seg, i) => { seg.rotation.y = 0.12 * Math.sin(t * 1.7 - i * 0.6); seg.rotation.x = 0.05 * Math.sin(s.flap - i * 0.5) + s.fold * 0.08; });
    this.head.rotation.x = -0.5 * s.roar;
    this.jaw.rotation.x = 0.7 * s.roar;
  }
}

function drill() {
  const g = new THREE.Group();
  const body = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.55, 10), MAT.suit)); body.rotation.x = Math.PI / 2; g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.1, 10), MAT.accent); band.rotation.x = Math.PI / 2; band.position.z = 0.1; g.add(band);
  const bit = shade(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 8), MAT.shipDark)); bit.rotation.x = Math.PI / 2; bit.position.z = 0.5; g.add(bit);
  const grip = shade(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.06), MAT.shipDark)); grip.position.set(0, -0.15, -0.12); g.add(grip);
  const side = shade(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.04), MAT.shipDark)); side.position.set(0, 0.0, 0.05); g.add(side);
  return g;
}
function rifle() {
  const g = new THREE.Group();
  const b = shade(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.85), MAT.shipDark)); b.position.z = 0.25; g.add(b);
  const barrel = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6), MAT.shipDark)); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.85; g.add(barrel);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.3), MAT.accent); mark.position.set(0, 0.06, 0.2); g.add(mark);
  return g;
}

export class World {
  scene = new THREE.Scene();
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  ship = new Ship();
  ray = new SkyRay();
  farRays = [new SkyRay(0.8), new SkyRay(0.9), new SkyRay(0.7)];
  ines = new Figure(HUMAN, { body: MAT.suit, accent: MAT.accent, dark: MAT.shipDark });
  pilot = new Figure(HUMAN, { body: MAT.suit, accent: MAT.accent, dark: MAT.shipDark });
  warden = new Figure(NATIVE, { body: MAT.native, accent: MAT.nativeCrest, dark: MAT.nativeCrest, glow: MAT.eyes });
  drill = drill();
  rifle = rifle();
  dust: THREE.InstancedMesh;
  dustSeeds: { a: number; r: number; s: number; h: number }[] = [];
  rocks: { m: THREE.Mesh; base: THREE.Vector3; ph: number }[] = [];
  wound: THREE.Mesh;
  skyMat: THREE.ShaderMaterial;
  private tmp = new THREE.Object3D();

  constructor() {
    const sc = this.scene;
    const FOG = new THREE.Color("#a9b4bf");
    sc.background = FOG.clone();
    sc.fog = new THREE.FogExp2(FOG.getHex(), 0.0026);

    // light: a warm low sun from the ship's side, a cool sky
    this.hemi = new THREE.HemisphereLight("#cbd8e8", "#7a766a", 1.7);
    sc.add(this.hemi);
    this.sun = new THREE.DirectionalLight("#ffe6c8", 3.1);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.05;
    sc.add(this.sun, this.sun.target);

    // sky dome with a gradient and a ringed giant
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color("#7f93ab") }, horizon: { value: FOG.clone() }, sunDir: { value: new THREE.Vector3() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform vec3 top, horizon, sunDir; varying vec3 vP;
        void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 c = mix(horizon, top, pow(h, 0.55));
          float s = max(dot(normalize(vP), normalize(sunDir)), 0.0); c += vec3(1.0,0.9,0.75) * (pow(s, 600.0) * 2.5 + pow(s, 12.0) * 0.18);
          gl_FragColor = vec4(c, 1.0); }`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2500, 32, 16), this.skyMat);
    dome.frustumCulled = false; sc.add(dome);
    const giant = new THREE.Group(); giant.position.set(-1100, 620, -1500); sc.add(giant);
    const planetMat = new THREE.MeshStandardMaterial({ color: "#c7c3ba", roughness: 1, fog: false });
    giant.add(new THREE.Mesh(new THREE.SphereGeometry(260, 48, 32), planetMat));
    const ringMat = new THREE.MeshStandardMaterial({ color: "#d6d0c3", roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.55, fog: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(330, 520, 96), ringMat); ring.rotation.set(-1.25, 0.25, 0.3); giant.add(ring);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 16), planetMat); moon.position.set(700, -120, 300); giant.add(moon);

    // terrain
    const tg = new THREE.PlaneGeometry(1800, 1800, 300, 300); tg.rotateX(-Math.PI / 2);
    const tp = tg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < tp.count; i++) tp.setY(i, groundY(tp.getX(i), tp.getZ(i)));
    tg.computeVertexNormals();
    sc.add(shade(new THREE.Mesh(tg, MAT.ground), false, true));

    this.buildSpire();
    this.buildForest();
    this.buildRocks();

    // wound: a dark scar that appears with the bite and a flare when it heals
    this.wound = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), MAT.glowPod);
    this.wound.position.copy(D).add(PP.clone().multiplyScalar(0.02));
    this.wound.lookAt(D.clone().add(PP));
    sc.add(this.wound);

    sc.add(this.ship.g, this.ray.g, ...this.farRays.map((r) => r.g));
    sc.add(this.ines.root, this.pilot.root, this.warden.root, this.drill);
    this.pilot.rHand.add(this.rifle);
    this.rifle.position.set(0, -0.12, 0.02); this.rifle.rotation.x = -Math.PI / 2;

    // touchdown dust
    const r = rng(42);
    for (let i = 0; i < 140; i++) this.dustSeeds.push({ a: r() * Math.PI * 2, r: 0.6 + r() * 0.7, s: 0.5 + r(), h: r() });
    this.dust = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), MAT.dust, this.dustSeeds.length);
    this.dust.frustumCulled = false; sc.add(this.dust);
  }

  private buildSpire() {
    const sc = this.scene;
    // the trunk: five strands twisting around a core
    const H = 92;
    const core = shade(new THREE.Mesh(new THREE.CylinderGeometry(1.3, 4.6, H, 18, 12), MAT.trunk)); core.position.y = H / 2 - 1; sc.add(core);
    for (let k = 0; k < 5; k++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i++) {
        const s = i / 24, y = s * H - 1, a = k * (Math.PI * 2 / 5) + s * 2.4, rr = lerp(4.6, 1.2, Math.pow(s, 0.7));
        pts.push(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr));
      }
      sc.add(shade(new THREE.Mesh(varTube(pts, (s) => lerp(2.3, 0.55, Math.pow(s, 0.6)), 96, 10), MAT.bark)));
      // a vein of light running up each strand's outer face
      const vein = pts.map((p) => { const o = new THREE.Vector3(p.x, 0, p.z).normalize(); const rr = Math.hypot(p.x, p.z); const s = (p.y + 1) / H; return p.clone().add(o.multiplyScalar(lerp(2.25, 0.5, Math.pow(s, 0.6)) * 0.92 + rr * 0)); });
      sc.add(new THREE.Mesh(varTube(vein, (s) => lerp(0.14, 0.05, s), 96, 5), MAT.glowTeal));
    }
    // roots
    const roots = 10;
    for (let k = 0; k < roots; k++) {
      const isDrill = k === 0;
      const ang = Math.atan2(U.z, U.x) + k * (Math.PI * 2 / roots) + (isDrill ? 0 : 0.12 * Math.sin(k * 3.1));
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
      const side = new THREE.Vector3(-dir.z, 0, dir.x);
      const L = isDrill ? 27 : 26 + 14 * ((k * 7) % 5) / 4;
      const pts: THREE.Vector3[] = []; const vA: THREE.Vector3[] = []; const vB: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i++) {
        const d = 2 + (i / 40) * (L - 2);
        const wig = isDrill ? 0 : Math.sin(d * 0.16 + k) * 1.8 * (d / L);
        const sink = ramp(d, L - 5, L) * (rootR(d) + 0.4);
        const c = dir.clone().multiplyScalar(d).add(side.clone().multiplyScalar(wig));
        c.y = groundY(c.x, c.z) + rootY(d) - sink;
        pts.push(c);
        const r = rootR(d);
        vA.push(c.clone().add(new THREE.Vector3(0, r * 0.97, 0)).add(side.clone().multiplyScalar(r * 0.18)));
        vB.push(c.clone().add(side.clone().multiplyScalar(-r * 0.75)).add(new THREE.Vector3(0, r * 0.62, 0)));
      }
      const radius = (s: number) => rootR(2 + s * (L - 2));
      sc.add(shade(new THREE.Mesh(varTube(pts, radius, 120, 14), MAT.rootMat)));
      sc.add(new THREE.Mesh(varTube(vA, (s) => 0.09 * (1 - s * 0.6), 120, 5), MAT.glowTeal));
      sc.add(new THREE.Mesh(varTube(vB, (s) => 0.06 * (1 - s * 0.6), 120, 5), MAT.glowTeal));
      if (isDrill) {
        // a third vein on the face Ines drills into, so the wound sits on light
        const vC = pts.map((c, i) => { const d = 2 + (i / 40) * (L - 2); return c.clone().add(PP.clone().multiplyScalar(rootR(d) * 0.99)).add(new THREE.Vector3(0, 0.15, 0)); });
        sc.add(new THREE.Mesh(varTube(vC, () => 0.06, 160, 5), MAT.glowTeal));
      }
    }
    // branches; the one toward the clearing holds the warden
    const r = rng(9);
    const branch = (from: THREE.Vector3, to: THREE.Vector3, r0: number, r1: number, sag: number) => {
      const mid = from.clone().lerp(to, 0.5); mid.y += sag;
      const pts = [from, from.clone().lerp(mid, 0.5).setY(lerp(from.y, mid.y, 0.6)), mid, to];
      sc.add(shade(new THREE.Mesh(varTube(pts, (s) => lerp(r0, r1, s), 40, 9), MAT.bark)));
      return pts;
    };
    branch(new THREE.Vector3(0.6, 21.3, 2.2), new THREE.Vector3(2.7, 23.4, 13.6), 1.05, 0.3, 1.6);
    for (let i = 0; i < 26; i++) {
      const y = 30 + r() * 58, a = r() * Math.PI * 2, len = lerp(14, 34, r()) * (1 - (y - 30) / 120);
      const rr = lerp(3.6, 1.4, (y - 30) / 60);
      const from = new THREE.Vector3(Math.cos(a) * rr * 0.6, y, Math.sin(a) * rr * 0.6);
      const to = new THREE.Vector3(Math.cos(a) * len, y + lerp(-3, 8, r()), Math.sin(a) * len);
      branch(from, to, lerp(1.3, 0.7, r()), 0.25, lerp(1, 4, r()));
      // a canopy pad at the tip
      if (this.inTheWay(to, 14)) continue;
      const pad = shade(new THREE.Mesh(rockGeo(100 + i, 1), r() > 0.5 ? MAT.canopy : MAT.canopyDark));
      pad.scale.set(lerp(6, 11, r()), lerp(2.2, 3.5, r()), lerp(6, 11, r())); pad.rotation.set(Math.PI, r() * 6, 0);
      pad.position.copy(to).add(new THREE.Vector3(0, 1.8, 0)); sc.add(pad);
    }
    const crown = shade(new THREE.Mesh(rockGeo(77, 2), MAT.canopy)); crown.scale.set(22, 9, 22); crown.rotation.x = Math.PI; crown.position.set(0, 93, 0); sc.add(crown);
    // hanging glow fronds under the branches
    const fr = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.04, 0.02, 1, 4), MAT.glowSoft, 260);
    for (let i = 0; i < 260; i++) {
      const y = 32 + r() * 55, a = r() * Math.PI * 2, d = 4 + r() * 22, len = 3 + r() * 9;
      this.tmp.position.set(Math.cos(a) * d, y - len / 2, Math.sin(a) * d); this.tmp.scale.set(1, len, 1); this.tmp.rotation.set(0, 0, 0); this.tmp.updateMatrix();
      fr.setMatrixAt(i, this.tmp.matrix);
    }
    sc.add(fr);
  }

  private buildForest() {
    const sc = this.scene;
    const r = rng(3);
    const N = 900;
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45, 1, 1, 7), MAT.bark, N);
    const caps = new THREE.InstancedMesh(rockGeo(5, 1), MAT.canopy, N);
    const caps2 = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), MAT.canopyDark, N);
    const clearing = (x: number, z: number) => {
      const d = Math.hypot(x, z);
      if (d < 30) return true;
      // the stretch between the spire and the ship stays open
      const along = x * U.x + z * U.z, side = Math.abs(x * PP.x + z * PP.z);
      return along > 0 && along < 62 && side < 22 + along * 0.3;
    };
    let n1 = 0, n2 = 0;
    for (let i = 0; i < N * 3 && (n1 < N || n2 < N); i++) {
      const d = 30 + Math.pow(r(), 0.8) * 520, a = r() * Math.PI * 2;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (clearing(x, z)) continue;
      const y = groundY(x, z), h = lerp(16, 42, r()) * (d < 60 ? 0.8 : 1), w = lerp(0.8, 1.6, r());
      const umbrella = r() > 0.4;
      if (umbrella && n1 < N) {
        this.tmp.position.set(x, y + h / 2, z); this.tmp.scale.set(w, h, w); this.tmp.rotation.set(0, r() * 6, (r() - 0.5) * 0.12); this.tmp.updateMatrix();
        trunks.setMatrixAt(n1, this.tmp.matrix);
        const cw = lerp(7, 15, r());
        this.tmp.position.set(x, y + h + 1, z); this.tmp.scale.set(cw, lerp(2.5, 4.5, r()), cw * lerp(0.8, 1.1, r())); this.tmp.rotation.set(Math.PI, r() * 6, 0); this.tmp.updateMatrix();
        caps.setMatrixAt(n1, this.tmp.matrix); n1++;
      } else if (n2 < N) {
        const cw = lerp(3, 6, r());
        this.tmp.position.set(x, y + h * 0.55, z); this.tmp.scale.set(cw, h * 1.1, cw); this.tmp.rotation.set(0, r() * 6, 0); this.tmp.updateMatrix();
        caps2.setMatrixAt(n2, this.tmp.matrix); n2++;
      }
    }
    trunks.count = n1; caps.count = n1; caps2.count = n2;
    for (const m of [trunks, caps, caps2]) { m.castShadow = true; m.receiveShadow = true; sc.add(m); }
    // ground cover and glow pods around the clearing
    const NF = 1400;
    const ferns = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 5), MAT.canopyDark, NF);
    const pods = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), MAT.glowPod, NF);
    let nf = 0, np = 0;
    for (let i = 0; i < NF * 2; i++) {
      const d = 6 + Math.pow(r(), 0.7) * 120, a = r() * Math.PI * 2;
      const x = Math.cos(a) * d, z = Math.sin(a) * d, y = groundY(x, z);
      const along = x * U.x + z * U.z, side = x * PP.x + z * PP.z;
      if (along > 6 && along < 40 && side > -2 && side < 12) continue;   // the walking path stays clear
      if (Math.hypot(x - 10, z - 31) < 13) continue;                      // the landing pad
      if (this.nearCamera(x, y, z, 3.5)) continue;
      if (r() > 0.35 && nf < NF) {
        const s = lerp(0.4, 1.4, r());
        this.tmp.position.set(x, y + s * 0.5, z); this.tmp.scale.set(s * 0.8, s * lerp(1, 2.5, r()), s * 0.8); this.tmp.rotation.set((r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4); this.tmp.updateMatrix();
        ferns.setMatrixAt(nf++, this.tmp.matrix);
      } else if (np < NF) {
        const s = lerp(0.04, 0.14, r());
        this.tmp.position.set(x, y + s + lerp(0, 0.8, r()), z); this.tmp.scale.setScalar(s); this.tmp.rotation.set(0, 0, 0); this.tmp.updateMatrix();
        pods.setMatrixAt(np++, this.tmp.matrix);
      }
    }
    ferns.count = nf; pods.count = np;
    ferns.castShadow = true; ferns.receiveShadow = true;
    sc.add(ferns, pods);
  }

  /** a floating rock must not sit on the camera's path, or between the opening camera and the ship */
  private camPath: { t: number; c: THREE.Vector3 }[] = [];
  private inTheWay(p: THREE.Vector3, radius: number) {
    const seg = new THREE.Line3(), q = new THREE.Vector3();
    if (!this.camPath.length) for (let t = 0; t < 60; t += 0.1) this.camPath.push({ t, c: shotAt(t).cam(t).pos });
    for (const { t, c } of this.camPath) {
      if (c.distanceTo(p) < radius) return true;
      if (t < 7) { seg.set(c, ship(t).pos); seg.closestPointToPoint(p, true, q); if (q.distanceTo(p) < radius) return true; }
    }
    return false;
  }

  private nearCamera(x: number, y: number, z: number, r: number) {
    if (!this.camPath.length) this.inTheWay(new THREE.Vector3(1e5, 0, 0), 0);
    for (const { c } of this.camPath) if ((c.x - x) ** 2 + (c.y - y) ** 2 + (c.z - z) ** 2 < r * r) return true;
    return false;
  }

  private buildRocks() {
    const r = rng(11);
    for (let i = 0; i < 46; i++) {
      const d = lerp(70, 520, Math.pow(r(), 0.8)), a = r() * Math.PI * 2;
      const base = new THREE.Vector3(Math.cos(a) * d, lerp(55, 190, r()), Math.sin(a) * d);
      const s = lerp(6, 26, Math.pow(r(), 1.5));
      if (this.inTheWay(base, s * 1.4 + 6)) continue;
      const m = shade(new THREE.Mesh(rockGeo(200 + i, 2), MAT.rock));
      m.scale.set(s * lerp(0.8, 1.3, r()), s * lerp(0.7, 1.1, r()), s * lerp(0.8, 1.3, r()));
      m.rotation.y = r() * 6;
      // a cap of trees and hanging vines
      const top = shade(new THREE.Mesh(rockGeo(300 + i, 1), MAT.canopy)); top.scale.set(0.8, 0.35, 0.8); top.position.y = 0.3; m.add(top);
      for (let v = 0; v < 6; v++) {
        const len = lerp(0.6, 2.2, r());
        const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, len, 4), v % 2 ? MAT.glowSoft : MAT.canopyDark);
        vine.position.set((r() - 0.5) * 1.2, -len / 2 - 0.1, (r() - 0.5) * 1.2); m.add(vine);
      }
      this.scene.add(m);
      this.rocks.push({ m, base, ph: r() * 6 });
    }
    // two big islands near the descent path, framing the opening shot
    for (const [x, y, z, s] of [[70, 92, 80, 30], [40, 120, -60, 36], [-20, 150, 90, 22]]) {
      if (this.inTheWay(new THREE.Vector3(x, y, z), s * 1.4 + 6)) continue;
      const m = shade(new THREE.Mesh(rockGeo(900 + x, 2), MAT.rock)); m.scale.set(s, s * 0.8, s);
      const top = shade(new THREE.Mesh(rockGeo(950 + x, 1), MAT.canopy)); top.scale.set(0.85, 0.35, 0.85); top.position.y = 0.3; m.add(top);
      this.scene.add(m); this.rocks.push({ m, base: new THREE.Vector3(x, y, z), ph: x });
    }
  }

  /** pose everything at time t; `shadow` frames the sun's shadow map on what the shot sees */
  update(t: number, shadow: { center: THREE.Vector3; size: number }) {
    glowUniforms.uTime.value = t;
    // a slight dimming of the sky while the forest is dark
    const dark = ramp(t, T_BITE, T_BITE + 3) * (1 - ramp(t, T_RETURN, T_RETURN + 5));
    this.hemi.intensity = 1.7 - 0.35 * dark;
    this.sun.intensity = 3.1 - 0.6 * dark;
    const sunDir = new THREE.Vector3(0.66, 0.78, 0.42).normalize();
    this.skyMat.uniforms.sunDir.value.copy(sunDir);
    const s = this.sun.shadow.camera as THREE.OrthographicCamera;
    s.left = -shadow.size; s.right = shadow.size; s.top = shadow.size; s.bottom = -shadow.size;
    s.near = 1; s.far = 900; s.updateProjectionMatrix();
    // snap the shadow centre to texels so it never swims
    const texel = (shadow.size * 2) / 4096;
    const c = shadow.center.clone(); c.x = Math.round(c.x / texel) * texel; c.z = Math.round(c.z / texel) * texel;
    this.sun.target.position.copy(c);
    this.sun.position.copy(c).add(sunDir.clone().multiplyScalar(400));
    this.sun.target.updateMatrixWorld();

    for (const k of this.rocks) {
      k.m.position.copy(k.base); k.m.position.y += 1.2 * Math.sin(t * 0.25 + k.ph);
      k.m.rotation.z = 0.02 * Math.sin(t * 0.2 + k.ph);
    }
    this.ship.update(t);
    this.ray.pose(ray(t), t);
    this.ray.g.visible = t > 31;
    this.farRays.forEach((fr, i) => fr.pose(farRay(t, i), t));

    const I = ines(t); this.ines.set(I.pose, I.pos.x, I.pos.y, I.pos.z, I.yaw);
    // inside the ship before the ramp opens
    this.ines.root.visible = t > 10.2;
    const P = pilot(t); this.pilot.set(P.pose, P.pos.x, P.pos.y, P.pos.z, P.yaw);
    this.pilot.root.visible = t > 12.5;
    const Wd = warden(t); this.warden.set(Wd.pose, Wd.pos.x, Wd.pos.y, Wd.pos.z, Wd.yaw);

    // the drill: in her hand, then set in the root, then pulled and laid down
    this.scene.updateMatrixWorld(true);
    const wristR = new THREE.Vector3(); this.warden.rHand.getWorldPosition(wristR);
    const ds = drillState(t);
    const hand = new THREE.Vector3(), handQ = new THREE.Quaternion();
    this.ines.rHand.getWorldPosition(hand); this.ines.rHand.getWorldQuaternion(handQ);
    const carryQ = handQ.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
    const inRootQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), PP.clone().negate());
    const inRootP = D.clone().add(PP.clone().multiplyScalar(0.62 - ds.depth * 1.9));
    const buzz = ds.buzz ? 0.008 * Math.sin(t * 160) : 0;
    let p = hand.clone().add(new THREE.Vector3(0, -0.1, 0)).lerp(inRootP, ds.set);
    let q = carryQ.clone().slerp(inRootQ, ds.set);
    p.y += buzz;
    if (ds.pulled > 0) {
      const wh = D.clone().add(PP.clone().multiplyScalar(0.95)).add(new THREE.Vector3(0, 0.25, 0));
      const lay = U.clone().multiplyScalar(DRILL_D - 2.4).add(PP.clone().multiplyScalar(rootR(DRILL_D) + 1.6)).setY(0.12);
      p = p.lerp(wh, ds.pulled * (1 - ds.dropped)).lerp(lay, ds.dropped);
      q = q.slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.8, Math.PI / 2)), ds.dropped);
    }
    this.drill.position.copy(p); this.drill.quaternion.copy(q);
    this.drill.updateMatrixWorld(true);
    // hands find what they hold and touch
    const onDrill = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(this.drill.matrixWorld);
    const hold = ds.set * (1 - ramp(t, 25.2, 25.8));
    const down = new THREE.Vector3(0, -1, 0).add(PP.clone().multiplyScalar(0.6));
    this.ines.reach("r", onDrill(0, -0.1, -0.2), hold, down);
    this.ines.reach("l", onDrill(0.2, 0.0, 0.08), hold, down.clone().add(U.clone().multiplyScalar(0.8)));
    const wound = (u: number) => D.clone().add(U.clone().multiplyScalar(u)).add(PP.clone().multiplyScalar(0.1)).add(new THREE.Vector3(0, 0.02, 0));
    this.ines.reach("r", wound(0.2), ramp(t, 49.2, 50.2), new THREE.Vector3(0, -1, 0).add(U.clone().multiplyScalar(0.7)));
    this.warden.reach("r", onDrill(0, -0.1, -0.2), ramp(t, 47.3, 47.7) * (1 - ramp(t, 48.3, 48.9)), new THREE.Vector3(0, -1, 0).sub(U.clone().multiplyScalar(0.7)));
    this.warden.reach("l", wound(-0.2), ramp(t, 48.7, 49.6), new THREE.Vector3(0, -1, 0).sub(U.clone().multiplyScalar(0.7)));
    this.wound.visible = t > T_BITE - 0.1;
    this.wound.scale.setScalar(t > 47.7 ? 1 + 0.6 * ramp(t, T_RETURN - 0.3, T_RETURN + 0.6) : 0.8);

    // dust ring at touchdown
    const td = t - 9.3;
    MAT.dust.opacity = td > 0 ? 0.55 * Math.exp(-td * 0.45) * clamp(td * 4) : 0;
    this.dust.visible = td > 0 && td < 9;
    this.dustSeeds.forEach((d, i) => {
      const k = td > 0 ? 1 - Math.exp(-td * (1.3 + d.s)) : 0;
      const rr = 2.5 + k * 11 * d.r;
      this.tmp.position.set(10 + Math.cos(d.a) * rr, 0.3 + k * (0.6 + d.h * 1.8), 31 + Math.sin(d.a) * rr);
      this.tmp.scale.setScalar((0.4 + 1.6 * k) * d.s); this.tmp.rotation.set(d.a, d.h, 0); this.tmp.updateMatrix();
      this.dust.setMatrixAt(i, this.tmp.matrix);
    });
    this.dust.instanceMatrix.needsUpdate = true;
    void B;
  }
}
