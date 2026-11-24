import test from "node:test";
import assert from "node:assert/strict";
import { stepR, Track, settleLead, vis, stretchEdges, odometerDigit, subT, logZoom } from "./motion-kit.mjs";

const near = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test("spring starts at 0, settles at 1", () => {
  for (const sp of [{ w: 26, z: 1 }, { w: 19, z: 0.9 }, { w: 30, z: 0.72 }]) {
    assert.equal(stepR(0, sp), 0);
    near(stepR(3, sp), 1);
  }
});

test("damping 0.72 overshoots a little, 1.0 never does", () => {
  let maxU = 0, maxC = 0;
  for (let t = 0; t < 2; t += 1 / 240) {
    maxU = Math.max(maxU, stepR(t, { w: 30, z: 0.72 }));
    maxC = Math.max(maxC, stepR(t, { w: 30, z: 1 }));
  }
  assert.ok(maxU > 1.01 && maxU < 1.06, `overshoot ${maxU}`);
  assert.ok(maxC <= 1, `critical ${maxC}`);
});

test("Track sums springs and is pure in t", () => {
  const x = new Track(0).to(0, 100, { w: 20, z: 1 }).to(1, 40, { w: 20, z: 1 });
  near(x.at(0.99), 100, 0.5);
  near(x.at(3), 40);
  assert.equal(x.at(0.5), x.at(0.5));
});

test("a loop track is continuous across the loop point", () => {
  const P = 4;
  const x = new Track(0).to(0.2, 50, { w: 12, z: 0.8 }).to(3.85, 0, { w: 12, z: 0.8 });
  near(x.atLoop(0, P), x.atLoop(P - 1e-6, P), 0.05);
});

test("settleLead is shorter for stiffer springs", () => {
  assert.ok(settleLead({ w: 40, z: 1 }) < settleLead({ w: 15, z: 1 }));
});

test("vis: fully in after entry, gone after exit", () => {
  const v = vis(1, 0, 2);
  near(v.o, 1); near(v.b, 0, 0.01);
  assert.equal(vis(2.2, 0, 2).o, 0);
});

test("stretch: the indicator gets wider mid-move", () => {
  const a = stretchEdges(0, 0, 0, 200, 80);
  const m = stretchEdges(0.08, 0, 0, 200, 80);
  const e = stretchEdges(2, 0, 0, 200, 80);
  near(a.width, 80); near(e.width, 80, 0.1); near(e.left, 200, 0.1);
  assert.ok(m.width > 90, `mid width ${m.width}`);
});

test("odometer: units roll, tens move only while units carry", () => {
  assert.equal(odometerDigit(1234, 0), 4);
  assert.equal(odometerDigit(1234, 1), 3);
  near(odometerDigit(19.5, 1), 1.5);
  near(odometerDigit(15.5, 1), 1);
});

test("subframes are centred on the frame time", () => {
  const ts = [0, 1, 2, 3].map((i) => subT(i, 60, 4));
  near(ts.reduce((a, b) => a + b) / 4, 0, 1e-9);
  near(subT(4, 60, 4) - subT(0, 60, 4), 1 / 60, 1e-9);
});

test("log zoom passes the geometric midpoint", () => {
  near(logZoom(1, 4, 0.5), 2);
});
