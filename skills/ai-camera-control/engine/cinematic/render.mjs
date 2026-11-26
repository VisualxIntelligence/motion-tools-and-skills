// Renders a template (or a film) as stills or video. Output goes to ./.work/out (set CAMERA_CONTROL_HOME or --out to move it).
//   node render.mjs --stills 3,21,31.5           -> <out>/stills/t_003.00.png ...
//   node render.mjs [--from s --to s] [--out p]  -> <out>/rootsong.mp4
//   --pathtrace 256 path-traces stills with 256 samples (real light and lens; stills only);
//   --subframes 6 renders each frame 6 times across the shutter and averages them (true motion blur on everything);
//   --storyboard draws the whole frame as ink on paper; --pencil redraws only the figures in pencil over the normal render;
//   --ghost turns the people into soft limbless blurs (blocking without limb motion); --plate leaves the people out;
//   --no-scenery leaves trees, rocks, bushes, lamps and benches out (nothing for a video model to copy);
//   --marks lays a soft 1 m checker on the set (camera travel reads from parallax);
//   --boxes stands a plain box in for each person (where, how tall, which way they face; no body);
//   --no-blur drops camera motion blur; --scale 1.34 renders stills at that multiple of 1920x1080 (sharp, for references);
//   --id <template id> (default CAM06-Orbit); --standin capsule|pin; --no-slate hides the slate; --no-report hides the camera report; --concurrency n (default 2)
import { KF } from "./tools/kf-root.mjs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const ID = opt("--id") ?? "CAM06-Orbit";
const STANDIN = opt("--standin") ?? "pin";   // capsule (the single striped capsule of the gallery clips) or pin (head on a body, the default)
const OUT = process.env.CAMERA_CONTROL_OUT ?? process.env.ROOTSONG_OUT ?? `${KF}/out/${ID.toLowerCase()}`;
fs.mkdirSync(OUT, { recursive: true });
const clean = args.includes("--clean");   // picture only: no slate, report, subtitles or titles
const inputProps = { standin: STANDIN, loosen: Number(opt("--loosen") ?? 1), piece: ID, slate: !clean && !args.includes("--no-slate"), report: !clean && !args.includes("--no-report"), clean, blur: !args.includes("--no-blur"), subframes: Number(opt("--subframes") ?? 1), pathtrace: Number(opt("--pathtrace") ?? 0), storyboard: args.includes("--storyboard"), pencil: args.includes("--pencil"), ghost: args.includes("--ghost"), plate: args.includes("--plate"), boxes: args.includes("--boxes"), marks: args.includes("--marks"), noScenery: args.includes("--no-scenery") };
const chromiumOptions = { gl: "angle" };

let serveUrl = null;
const cleanup = () => { if (serveUrl) try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} };
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { cleanup(); process.exit(1); });

// the mannequin rig lives in ./public/kit (shipped with the repo)
const publicDir = process.env.CINEMATIC_PUBLIC ?? path.join(dir, "public");   // holds kit/UAL1_Standard.glb and kit/UAL2_Standard.glb (CC0, Quaternius)
serveUrl = await bundle({ entryPoint: path.join(dir, "src/index.ts"), publicDir, enableCaching: false });
const composition = opt("--stills-plan") || opt("--videos") ? null : await selectComposition({ serveUrl, id: ID, inputProps, chromiumOptions });
const fps = composition?.fps;

if (opt("--videos")) {
  // moving previews of many pieces in one bundle: --videos id1,id2 -> <out>/<id>.mp4 (scale via --scale, e.g. 0.5)
  const base = opt("--out") ?? `${KF}/out/videos`;
  fs.mkdirSync(base, { recursive: true });
  for (const id of opt("--videos").split(",")) {
    const props = { ...inputProps, piece: id };
    const comp = await selectComposition({ serveUrl, id, inputProps: props, chromiumOptions });
    const t0 = Date.now();
    await renderMedia({ serveUrl, composition: comp, inputProps: props, chromiumOptions, outputLocation: path.join(base, `${id}.mp4`), codec: "h264", crf: 20, pixelFormat: "yuv420p", scale: Number(opt("--scale") ?? 0.5), concurrency: Number(opt("--concurrency") ?? 3), timeoutInMilliseconds: 120000 });
    console.log(id, Math.round((Date.now() - t0) / 1000) + "s");
  }
} else if (opt("--stills-plan")) {
  // many pieces in one bundle: {"<id>": [seconds, ...]} -> <out>/<id>/t_XXX.XX.png
  const plan = JSON.parse(fs.readFileSync(opt("--stills-plan"), "utf-8"));
  const base = opt("--out") ?? `${KF}/out/stills`;
  for (const [id, times] of Object.entries(plan)) {
    const props = { ...inputProps, piece: id };
    const comp = await selectComposition({ serveUrl, id, inputProps: props, chromiumOptions });
    const dir = path.join(base, id); fs.mkdirSync(dir, { recursive: true });
    for (const s of times) {
      const output = path.join(dir, `t_${Number(s).toFixed(2).padStart(6, "0")}.png`);
      await renderStill({ serveUrl, composition: comp, inputProps: props, chromiumOptions, onBrowserLog: process.env.BROWSER_LOG ? (l) => console.log("[browser]", l.type, l.text.slice(0, 400)) : undefined, scale: Number(opt("--scale") ?? 1), frame: Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps)), output, timeoutInMilliseconds: inputProps.pathtrace ? 600000 : 120000 });
    }
    console.log(id, times.length);
  }
} else if (opt("--stills")) {
  const out = path.join(OUT, opt("--stills-dir") ?? "stills");
  fs.mkdirSync(out, { recursive: true });
  for (const s of opt("--stills").split(",").map(Number)) {
    const output = path.join(out, `t_${s.toFixed(2).padStart(6, "0")}.png`);
    await renderStill({ serveUrl, composition, inputProps, chromiumOptions, scale: Number(opt("--scale") ?? 1), frame: Math.min(composition.durationInFrames - 1, Math.round(s * fps)), output, timeoutInMilliseconds: 120000 });
    console.log(output);
  }
} else {
  const outputLocation = path.resolve(opt("--out") ?? path.join(OUT, `${ID.toLowerCase()}.mp4`));
  const frameRange = opt("--from") || opt("--to")
    ? [Math.round(Number(opt("--from") ?? 0) * fps), Math.min(composition.durationInFrames - 1, Math.round(Number(opt("--to") ?? 1e9) * fps) - 1)]
    : undefined;
  const t0 = Date.now();
  await renderMedia({
    serveUrl, composition, inputProps, chromiumOptions, outputLocation, frameRange,
    codec: "h264", crf: 17, pixelFormat: "yuv420p", x264Preset: "slow",
    concurrency: Number(opt("--concurrency") ?? 2), timeoutInMilliseconds: 120000,
    onProgress: ({ progress }) => process.stdout.write(`\r${Math.round(progress * 100)}%  ${Math.round((Date.now() - t0) / 1000)}s`),
  });
  console.log(`\n${outputLocation}`);
}
