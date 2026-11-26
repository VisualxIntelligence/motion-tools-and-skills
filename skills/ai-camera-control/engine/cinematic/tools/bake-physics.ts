// Bake every scene's physics into src/kit/bakes.json (see src/kit/physics.ts).
//   tools/bake.sh            -> bake all specs in src/templates/physics-specs.ts
import fs from "fs";
import path from "path";
import RAPIER from "@dimforge/rapier3d-compat";
import { PHYS_SPECS } from "../src/templates/physics-specs";
import type { Bake, PhysSpec, Shape } from "../src/kit/physics";

await RAPIER.init();
const HZ = 120, SUB = 2;
const collider = (s: Shape) => s.kind === "box" ? RAPIER.ColliderDesc.cuboid(s.size[0] / 2, s.size[1] / 2, s.size[2] / 2) : s.kind === "ball" ? RAPIER.ColliderDesc.ball(s.r) : RAPIER.ColliderDesc.cylinder(s.h / 2, s.r);
const yawQ = (y: number) => ({ x: 0, y: Math.sin(y / 2), z: 0, w: Math.cos(y / 2) });

function bake(spec: PhysSpec): Bake {
  const world = new RAPIER.World({ x: 0, y: -(spec.gravity ?? 9.81), z: 0 });
  world.timestep = 1 / (HZ * SUB);
  world.createCollider(RAPIER.ColliderDesc.cuboid(400, 0.5, 400).setTranslation(0, (spec.ground ?? 0) - 0.5, 0).setFriction(0.9));
  const drivers = (spec.drivers ?? []).map((d) => {
    const p = d.path(0);
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...p.pos).setRotation(yawQ(p.yaw)));
    world.createCollider(collider(d.shape), body);
    return { d, body };
  });
  const bodies = spec.bodies.map((b) => {
    const desc = RAPIER.RigidBodyDesc.dynamic().setTranslation(...b.at).setRotation(yawQ(b.yaw ?? 0)).setCanSleep(true).setCcdEnabled(true);
    const body = world.createRigidBody(desc);
    world.createCollider(collider(b.shape).setDensity(b.density ?? 400).setRestitution(b.bounce ?? 0.15).setFriction(b.friction ?? 0.7), body);
    if (b.release && b.release > 0) body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    else { if (b.vel) body.setLinvel({ x: b.vel[0], y: b.vel[1], z: b.vel[2] }, true); if (b.spin) body.setAngvel({ x: b.spin[0], y: b.spin[1], z: b.spin[2] }, true); }
    return { b, body, live: !(b.release && b.release > 0) };
  });
  const frames: number[][][] = [];
  const n = Math.ceil(spec.dur * HZ);
  for (let f = 0; f <= n; f++) {
    frames.push(bodies.map(({ body }) => { const p = body.translation(), q = body.rotation(); return [p.x, p.y, p.z, q.x, q.y, q.z, q.w].map((v) => +v.toFixed(4)); }));
    for (let s = 0; s < SUB; s++) {
      const t = (f + (s + 1) / SUB) / HZ;
      for (const { d, body } of drivers) { const p = d.path(t); body.setNextKinematicTranslation({ x: p.pos[0], y: p.pos[1], z: p.pos[2] }); body.setNextKinematicRotation(yawQ(p.yaw)); }
      for (const x of bodies) if (!x.live && t >= (x.b.release ?? 0)) {
        x.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true); x.live = true;
        if (x.b.vel) x.body.setLinvel({ x: x.b.vel[0], y: x.b.vel[1], z: x.b.vel[2] }, true);
        if (x.b.spin) x.body.setAngvel({ x: x.b.spin[0], y: x.b.spin[1], z: x.b.spin[2] }, true);
      }
      world.step();
    }
  }
  return { hz: HZ, ids: spec.bodies.map((b) => b.id), frames };
}

const out: Record<string, Bake> = {};
for (const spec of PHYS_SPECS) { out[spec.id] = bake(spec); console.log("baked", spec.id, spec.bodies.length, "bodies", out[spec.id].frames.length, "frames"); }
const file = path.join(path.dirname(new URL(import.meta.url).pathname), "../src/kit/bakes.json");
fs.writeFileSync(process.env.OUT ?? file, JSON.stringify(out));
console.log("wrote", process.env.OUT ?? file);
