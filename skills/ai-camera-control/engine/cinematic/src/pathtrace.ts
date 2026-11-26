// Path-traced key-frame stills (three-gpu-pathtracer 0.0.23, MIT): the same scene and camera, rendered with real light
// transport, soft shadows and a physical lens. Remotion waits (delayRender) while samples accumulate; the noise is
// stable (seeded), so a frame renders the same every time. Stills only: the video path stays rasterised.
import * as THREE from "three";
import { continueRender, delayRender } from "remotion";
import { GradientEquirectTexture, PhysicalCamera, WebGLPathTracer } from "three-gpu-pathtracer";

// (the typings lag the library: stableNoise and isCompiling exist on 0.0.23)
type Tracer = WebGLPathTracer & { stableNoise: boolean; isCompiling: boolean };
// one tracer per renderer (a new piece gets a new canvas and context)
const tracers = new WeakMap<THREE.WebGLRenderer, Tracer>();
let busy = -1;

export function pathTraceFrame(gl: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera, o: { samples: number; stop: number; focus: number; frame: number }) {
  if (busy === o.frame) return;
  busy = o.frame;
  const handle = delayRender(`path tracing frame ${o.frame}`, { timeoutInMilliseconds: 600000 });
  let tracer = tracers.get(gl);
  if (!tracer) {
    tracer = new WebGLPathTracer(gl) as Tracer; tracers.set(gl, tracer);
    tracer.renderDelay = 0; tracer.fadeDuration = 0; tracer.minSamples = 0; tracer.dynamicLowRes = false;
    tracer.rasterizeScene = false; tracer.renderToCanvas = true; tracer.stableNoise = true; tracer.bounces = 6; tracer.tiles.set(2, 2);
  }
  // what the tracer cannot run (the sky shader, instanced motes, fog) steps aside for a gradient world
  const hidden: THREE.Object3D[] = [];
  scene.traverse((c) => { if (c.userData.noPathTrace && c.visible) { c.visible = false; hidden.push(c); } });
  const fog = scene.fog; scene.fog = null;
  // double-sided emissive materials break the tracer's shader (seen as a magenta frame): trace them one-sided
  const sided: THREE.Material[] = [];
  scene.traverse((c: any) => { if (c.isMesh && c.material?.side === THREE.DoubleSide && (c.material.emissiveIntensity ?? 0) > 0) { c.material.side = THREE.FrontSide; sided.push(c.material); } });
  const sky = scene.userData.sky ?? { top: "#c3c3c0", horizon: "#d8d8d4", ground: "#7d7c78" };
  const env = new GradientEquirectTexture(256);
  env.topColor.set(sky.top); env.bottomColor.set(sky.ground); env.exponent = 0.8; env.update();
  const bg = scene.background, envBefore = scene.environment;
  scene.environment = env; scene.background = env;
  // a physical camera: the same lens, the shot's stop and focus (36 mm sensor width, like the rasteriser)
  const pc = new PhysicalCamera(); pc.copy(cam as unknown as PhysicalCamera);
  pc.filmGauge = 36; pc.fStop = o.stop; pc.focusDistance = o.focus; pc.apertureBlades = 7; pc.updateProjectionMatrix();
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.9;
  tracer.setScene(scene, pc);
  const tr = tracer;
  const step = () => {
    try {
      for (let i = 0; i < 4 && (tr.samples < o.samples || tr.isCompiling); i++) tr.renderSample();
    } catch (e) { console.error(e); }
    if (tr.samples < o.samples || tr.isCompiling) { setTimeout(step, 0); return; }
    hidden.forEach((c) => (c.visible = true)); sided.forEach((m) => (m.side = THREE.DoubleSide)); scene.fog = fog; scene.background = bg; scene.environment = envBefore;
    continueRender(handle);
  };
  step();
}
