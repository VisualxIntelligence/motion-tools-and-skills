# three.js add-ons: particles, post-processing, tuning panel — notes

Three libraries for our three.js work (HyperFrames, `starters/`, `skills/threejs-scene-fx`). All MIT, installed from npm; **nothing copied**. Read 24 November 2026.

## three.quarks: particle effects

**Source:** [Alchemist0823/three.quarks](https://github.com/Alchemist0823/three.quarks) @ `9d0445c` (16 Nov 2026), version 0.18.0, needs three ≥ 0.182.

A particle and VFX system:
- emitters and behaviours (over-lifetime size, colour, speed, rotation, force, noise, orbit), sub-emitters, trails, mesh particles and soft particles;
- WebGL and WebGPU batched renderers, and a React Three Fiber wrapper (`quarks.r3f`);
- a visual editor at [quarks.art](https://quarks.art/), whose JSON exports load with `QuarksLoader`.

Use it for sparks, smoke, dust, magic, explosions and confetti that would take days to hand-code.

```js
import { BatchedRenderer, QuarksLoader } from "three.quarks";
const batch = new BatchedRenderer();
scene.add(batch);
// build a ParticleSystem in code, or load an editor export with QuarksLoader, then:
batch.addSystem(system);
```

**Frame-exact rendering (important).** three.quarks is built for real time. It calls `Math.random` (58 times in `quarks.core`) and has no seed. A render that seeks to any frame will differ between runs and break our determinism checks. In a render harness:

```js
// 1. Seed before any system is created:
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
Math.random = mulberry32(1234);
// 2. Step in order from frame 0 with a fixed delta, never by wall-clock time:
for (let f = 0; f <= frame; f++) batch.update(1 / FPS);
```

For a seekable timeline, cache the stepped state per frame, or render the particle pass once as an image sequence and composite it.

## pmndrs/postprocessing (instead of react-postprocessing)

**[pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing)** @ `e07ef9a`, version 3.2.2, is a React Three Fiber wrapper. Our three.js work is vanilla, so use the library underneath it, **[pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)**, directly:

- the same effects: bloom, depth of field, chromatic aberration, noise, vignette, tone mapping, LUT, SMAA, god rays, glitch, scanlines, outline;
- one merged effect pass instead of a chain of full-screen passes.

```js
import { EffectComposer, RenderPass, EffectPass, BloomEffect, VignetteEffect } from "postprocessing";
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 1.2 }), new VignetteEffect()));
// render loop: composer.render(1 / FPS)   ← a fixed delta keeps time-based effects deterministic
```

Use react-postprocessing only in an R3F project (for example a cinetic or Remotion film that uses `@react-three/fiber`).

## Tweakpane: a tuning panel for look-dev

**Source:** [cocopon/tweakpane](https://github.com/cocopon/tweakpane) @ `50a18c3`, version 4.0.5. © 2016 cocopon.

A compact panel of sliders, colour pickers, points and graphs bound to an object's properties. Use it while finding a look: easing values, bloom strength, camera distance, palette. Then copy the numbers into the code.

```js
import { Pane } from "tweakpane";
const P = { bloom: 1.2, ease: 0.75, accent: "#e8402a" };
const pane = new Pane({ title: "look-dev" });
pane.addBinding(P, "bloom", { min: 0, max: 3 });
pane.addBinding(P, "accent");
pane.on("change", () => redraw());
```

**Keep it out of renders.** Create the pane only when the page is opened for preview (for example behind `?tune`), never in the headless render. Freeze the final values in code. A live panel in a render page is a determinism leak.

**Not tested here.** Facts are from the source at the commits named.
