#!/usr/bin/env node
// Deterministic video capture of a diorama page (added in motion-tools-and-skills; not part of upstream dioramas).
//
// Dioramas pages run on live clocks (THREE.Clock, rAF, GSAP ticker, Lenis, timers) and react to scroll and the pointer,
// so they cannot be seeked like a renderAt(t) page. This script injects scripts/capture/virtual-time.js, which freezes
// every clock and seeds Math.random, then steps time one frame at a time while scripting scroll and pointer, and
// screenshots each frame into ffmpeg. Same page + same options → same frames. Frames play forward from the start of
// the recording; there is no random access.
//
// Start the dev server first (npm run dev), then for example:
//   node scripts/render-video.mjs http://127.0.0.1:5190/examples/keeper/ out/keeper.mp4 \
//        --duration 12 --fps 30 --w 1920 --h 1080 --scroll "0:0,2:0,10:1" --pointer "0:0.5,0.5;6:0.3,0.4" --seed 7
//
// Options
//   --duration s        recorded length (default 10)          --fps n        frame rate (default 30)
//   --w px --h px       frame size (default 1920×1080)        --seed n       Math.random seed (default 1)
//   --scroll keys       page scroll progress 0..1 over time, "t:p,t:p,…" (smoothstep between keys; default: stay put)
//   --pointer keys      pointer position in 0..1 of the frame, "t:x,y;t:x,y;…" (smoothstep between keys)
//   --click times       pointer down/up at these times (s), "t,t,…" (down at t, up one frame later)
//   --ready expr        JS expression that is true once the page is ready to record
//                       (default: no preloader in the DOM, i.e. no .preloader / #preloader / [data-preloader])
//   --lead s            virtual seconds to play after ready before recording starts (default 0)
//   --frames dir        also write numbered PNGs to dir           --stills t,t,… only write PNG stills at these times
//   --crf n             x264 quality (default 14)                 --timeout s    real-time limit for loading (default 120)
// Environment
//   DIORAMA_CHROME      path to a Chrome/Chromium executable (default: Playwright's `chrome` channel)
//   DIORAMA_GPU_ARGS    browser GPU flags (default: --use-angle=d3d11 on Windows, --use-angle=gl-egl elsewhere;
//                       use "--use-angle=swiftshader --enable-unsafe-swiftshader" on a machine with no GPU)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const url = argv[0];
const out = argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
if (!url || url.startsWith('--')) {
  console.error('usage: node scripts/render-video.mjs <url> [out.mp4] [--duration 10 --fps 30 --w 1920 --h 1080 --scroll "0:0,10:1" ...]');
  process.exit(1);
}

const FPS = +opt('fps', 30), DUR = +opt('duration', 10), W = +opt('w', 1920), H = +opt('h', 1080);
const SEED = +opt('seed', 1), LEAD = +opt('lead', 0), CRF = +opt('crf', 14), TIMEOUT = +opt('timeout', 120) * 1000;
const READY = opt('ready', "!document.querySelector('.preloader, #preloader, [data-preloader]')");
const framesDir = opt('frames', null);
const stills = opt('stills', null)?.split(',').map(Number);
const N = Math.round(DUR * FPS), STEP = 1000 / FPS;

// Keyframe tracks: "t:v" or "t:x,y", smoothstep-interpolated, held at the ends.
const parseKeys = (s, sep) => (s ? s.split(sep).filter(Boolean).map(k => { const [t, v] = k.split(':'); return [+t, v.split(',').map(Number)]; }).sort((a, b) => a[0] - b[0]) : null);
const sample = (keys, t) => {
  if (!keys) return null;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const u = t1 > t0 ? (t - t0) / (t1 - t0) : 1, e = u * u * (3 - 2 * u);
      return v0.map((a, j) => a + (v1[j] - a) * e);
    }
  }
  return keys[keys.length - 1][1];
};
const scrollKeys = parseKeys(opt('scroll', null), ',');
const pointerKeys = parseKeys(opt('pointer', null), ';');
const clicks = (opt('click', null)?.split(',').map(Number) ?? []).map(t => Math.round(t * FPS));

const gpuArgs = process.env.DIORAMA_GPU_ARGS ? process.env.DIORAMA_GPU_ARGS.split(' ').filter(Boolean)
  : process.platform === 'win32' ? ['--use-angle=d3d11'] : ['--use-angle=gl-egl'];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.DIORAMA_CHROME ? { executablePath: process.env.DIORAMA_CHROME } : { channel: 'chrome' }),
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', ...gpuArgs],
});
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await ctx.addInitScript(o => { window.__CAPTURE_OPTS = o; }, { seed: SEED });
await ctx.addInitScript({ path: path.join(HERE, 'capture', 'virtual-time.js') });
const page = await ctx.newPage();
page.on('pageerror', e => console.error('[pageerror]', String(e.message).slice(0, 300)));
page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text().slice(0, 300)); });

// Load: let the network settle with time frozen, then step time until the page says it is ready.
// Frames are deterministic from the first recorded frame on; how many warm-up frames the loader needed is reported.
const t0 = Date.now();
await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
let warm = 0;
while (!(await page.evaluate(READY))) {
  if (Date.now() - t0 > TIMEOUT) throw new Error(`page not ready after ${TIMEOUT / 1000}s (ready: ${READY})`);
  await page.evaluate(ms => window.__vt.step(ms), STEP);
  warm++;
  if (warm % 30 === 0) await page.waitForLoadState('networkidle').catch(() => {});
}
for (let i = 0; i < Math.round(LEAD * FPS); i++) await page.evaluate(ms => window.__vt.step(ms), STEP);
console.log(`ready after ${warm} warm-up frames (${((Date.now() - t0) / 1000).toFixed(1)} s real); recording ${N} frames @ ${FPS} fps, ${W}×${H}, seed ${SEED}`);

// Per-frame scripted input, applied before the frame's time step.
const drive = (f) => page.evaluate(({ scroll, ptr, down, up, W, H }) => {
  if (scroll != null) {
    const y = scroll * Math.max(0, document.documentElement.scrollHeight - innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    window.dispatchEvent(new Event('scroll'));
  }
  if (ptr) {
    const init = { clientX: ptr[0] * W, clientY: ptr[1] * H, bubbles: true, pointerType: 'mouse', isPrimary: true };
    const tgt = document.elementFromPoint(init.clientX, init.clientY) || window;
    tgt.dispatchEvent(new PointerEvent('pointermove', init));
    tgt.dispatchEvent(new MouseEvent('mousemove', init));
    if (down) { tgt.dispatchEvent(new PointerEvent('pointerdown', init)); tgt.dispatchEvent(new MouseEvent('mousedown', init)); }
    if (up) { tgt.dispatchEvent(new PointerEvent('pointerup', init)); tgt.dispatchEvent(new MouseEvent('mouseup', init)); tgt.dispatchEvent(new MouseEvent('click', init)); }
  }
}, {
  scroll: sample(scrollKeys, f / FPS)?.[0] ?? null,
  ptr: sample(pointerKeys, f / FPS) ?? (clicks.length ? [0.5, 0.5] : null),
  down: clicks.includes(f), up: clicks.includes(f - 1), W, H,
});

let ff = null;
if (out && !stills) {
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
}
const pngDir = framesDir ?? (stills ? path.join(path.dirname(path.resolve(out ?? 'out/x')), 'stills') : null);
if (pngDir) fs.mkdirSync(pngDir, { recursive: true });
const stillFrames = stills?.map(t => Math.round(t * FPS));
const lastFrame = stillFrames ? Math.max(...stillFrames) : N - 1;

for (let f = 0; f <= lastFrame; f++) {
  await drive(f);
  await page.evaluate(ms => window.__vt.step(ms), STEP);
  if (stillFrames && !stillFrames.includes(f)) continue;
  const png = await page.screenshot({ type: 'png' });
  if (ff) { if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r)); }
  if (pngDir) fs.writeFileSync(path.join(pngDir, `${String(f).padStart(5, '0')}.png`), png);
  if (f % FPS === 0) process.stdout.write(`\r${f}/${lastFrame + 1}`);
}
if (ff) { ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
console.log(`\ndone in ${((Date.now() - t0) / 1000).toFixed(1)} s${out && !stills ? ' → ' + out : ''}`);
await browser.close();
