#!/usr/bin/env node
// Render a photo-parallax shot frame by frame (headless Chromium → ffmpeg).
//
//   node render.mjs stills [0,3,6]               PNGs at those seconds → out/still_<t>.png, plus out/sheet.jpg
//   node render.mjs film [out/shot.mp4]           the whole shot, libx264 crf 16, yuv420p
//
// Options: --layers <folder from layers.py>  --move dolly-in|dolly-out|truck-left|truck-right|crane-up|orbit|vertigo
//   --amount 1  --duration 6  --fps 30  --w 1920 --h 1080 (9:16: --w 1080 --h 1920)  --zoom 1.06  --ease inout  --fx 0.3 --fy 0.5 (where the frame sits in the photo; default: on the nearest card)
//   --gpu (use the GPU; default is SwiftShader, slower but works anywhere)  --chrome <path to chrome>
// The page is served over http (ES modules do not load from file://); the layers folder is mounted at /layers/.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i < 0 ? d : argv[i + 1]; };
const flag = (k) => argv.includes(`--${k}`);
const [mode = 'stills', arg] = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
const ROOT = resolve('.'), LAYERS = resolve(opt('layers', 'layers'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.f32': 'application/octet-stream' };

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const [base, rel] = url.startsWith('/layers/') ? [LAYERS, url.slice(8)] : [ROOT, url];
  const p = normalize(join(base, rel));
  if (p !== base && !p.startsWith(base + sep)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(p.endsWith(sep) || p === base ? join(p, 'index.html') : p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }).end(body); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const W = +opt('w', 1920), H = +opt('h', 1080);
const qs = new URLSearchParams({ layers: '/layers/', move: opt('move', 'dolly-in'), amount: opt('amount', '1'), duration: opt('duration', '6'),
  fps: opt('fps', '30'), w: W, h: H, zoom: opt('zoom', '1.06'), ease: opt('ease', 'inout'), hold: opt('hold', '0.4') });
for (const k of ['fx', 'fy']) if (opt(k)) qs.set(k, opt(k));
const args = flag('gpu') ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ args, executablePath: opt('chrome', undefined) });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.error('page:', m.text()); });
await page.goto(`http://127.0.0.1:${port}/index.html?${qs}`);
await page.waitForFunction('window.ready === true || window.loadError', null, { timeout: 180000 });
const err = await page.evaluate(() => window.loadError);
if (err) { console.error('load failed:', err); process.exit(1); }
const tl = await page.evaluate(() => window.timeline);
const frame = async (t, type = 'image/png', q) => Buffer.from((await page.evaluate(([t, ty, q]) => window.renderAt(t, ty, q), [t, type, q])).split(',')[1], 'base64');
const run = (cmd, a, input) => new Promise((ok, no) => { const p = spawn(cmd, a, { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] }); p.on('close', c => c ? no(new Error(`${cmd} exited ${c}`)) : ok()); if (input) input(p.stdin); });

await mkdir('out', { recursive: true });
if (mode === 'stills') {
  const ts = (arg || `0,${tl.duration / 2},${tl.duration}`).split(',').map(Number);
  const files = [];
  for (const t of ts) { const f = `out/still_${t}.png`; await writeFile(f, await frame(t)); files.push(f); }
  const cols = Math.min(3, files.length), cw = 640, ch = Math.round(cw * H / W / 2) * 2;
  if (files.length > 1) {
    await run('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap(f => ['-i', f]), '-filter_complex',
      `${files.map((_, i) => `[${i}:v]scale=${cw}:${ch}[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${
        files.map((_, i) => `${(i % cols) * cw}_${Math.floor(i / cols) * ch}`).join('|')}:fill=white`, '-frames:v', '1', 'out/sheet.jpg']);
  }
  console.log(JSON.stringify({ stills: files, sheet: files.length > 1 ? 'out/sheet.jpg' : null, move: tl.move }));
} else if (mode === 'film') {
  const out = arg || `out/${tl.move}.mp4`, fps = tl.fps, n = Math.round(tl.duration * fps), t0 = Date.now();
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], async (stdin) => {
    for (let i = 0; i < n; i++) {
      if (!stdin.write(await frame(i / fps, 'image/jpeg', 0.95))) await new Promise(r => stdin.once('drain', r));
      if (i % 30 === 0) process.stderr.write(`\rframe ${i}/${n}`);
    }
    stdin.end();
  });
  process.stderr.write('\n');
  console.log(JSON.stringify({ film: out, frames: n, fps, seconds: tl.duration, move: tl.move, render_s: Math.round((Date.now() - t0) / 1000) }));
} else { console.error(`unknown mode ${mode}`); process.exit(2); }
await browser.close();
server.close();
