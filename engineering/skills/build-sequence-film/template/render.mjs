#!/usr/bin/env node
// Capture the build-sequence film page frame by frame (headless Chromium → ffmpeg).
//
//   node render.mjs timeline                      write timeline.json from the stage rules (edit it, then render)
//   node render.mjs stills 2,8,14,20,26,29        PNGs at those seconds → out/still_<t>.png, plus out/sheet.jpg
//   node render.mjs film [out/film.mp4]           the whole film, libx264 crf 16, yuv420p
//
// Options: --model model.glb  --duration 30  --fps 30  --w 1920 --h 1080  --gpu (use the GPU; default
// is SwiftShader, slower but works anywhere)  --chrome <path to chrome.exe>
// The page is served from this folder over http (ES modules do not load from file://).
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i < 0 ? d : argv[i + 1]; };
const flag = (k) => argv.includes(`--${k}`);
const [mode = 'stills', arg] = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
const ROOT = resolve('.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer(async (req, res) => {
  const p = normalize(join(ROOT, decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(p.endsWith('/') ? join(p, 'index.html') : p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }).end(body); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const W = +opt('w', 1920), H = +opt('h', 1080);
const qs = new URLSearchParams({ model: opt('model', 'model.glb'), duration: opt('duration', '30'), fps: opt('fps', '30'), w: W, h: H });
if (mode === 'timeline') qs.set('timeline', '__none__.json');
const args = flag('gpu') ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ args, executablePath: opt('chrome', undefined) });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' && !(mode === 'timeline' && m.text().includes('404'))) console.error('page:', m.text()); });
await page.goto(`http://127.0.0.1:${port}/index.html?${qs}`);
await page.waitForFunction('window.ready === true || window.loadError', null, { timeout: 180000 });
const err = await page.evaluate(() => window.loadError);
if (err) { console.error('load failed:', err); process.exit(1); }
const tl = await page.evaluate(() => window.timeline);
const frame = async (t, type = 'image/png', q) => Buffer.from((await page.evaluate(([t, ty, q]) => window.renderAt(t, ty, q), [t, type, q])).split(',')[1], 'base64');
const run = (cmd, a, input) => new Promise((ok, no) => { const p = spawn(cmd, a, { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] }); p.on('close', c => c ? no(new Error(`${cmd} exited ${c}`)) : ok()); if (input) input(p.stdin); });

await mkdir('out', { recursive: true });
if (mode === 'timeline') {
  await writeFile('timeline.json', JSON.stringify(tl, null, 1));
  const st = {}; tl.elements.forEach(e => { st[e.stage] = (st[e.stage] || 0) + 1; });
  console.log(JSON.stringify({ wrote: 'timeline.json', duration: tl.duration, elements: tl.elements.length, stages: st,
    build_ends: Math.max(...tl.elements.map(e => e.end)), colour: [tl.colour_from, tl.colour_to] }));
} else if (mode === 'stills') {
  const ts = (arg || '2,8,14,20,26,29').split(',').map(Number);
  const files = [];
  for (const t of ts) { const f = `out/still_${t}.png`; await writeFile(f, await frame(t)); files.push(f); }
  const cols = Math.min(3, files.length), rows = Math.ceil(files.length / cols), cw = 640, ch = Math.round(cw * H / W / 2) * 2;
  if (files.length > 1) {
    await run('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap(f => ['-i', f]), '-filter_complex',
      `${files.map((_, i) => `[${i}:v]scale=${cw}:${ch}[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${
        files.map((_, i) => `${(i % cols) * cw}_${Math.floor(i / cols) * ch}`).join('|')}:fill=white`, '-frames:v', '1', 'out/sheet.jpg']);
  }
  console.log(JSON.stringify({ stills: files, sheet: files.length > 1 ? 'out/sheet.jpg' : null, grid: [cols, rows] }));
} else if (mode === 'film') {
  const out = arg || 'out/film.mp4', fps = tl.fps, n = Math.round(tl.duration * fps), t0 = Date.now();
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], async (stdin) => {
    for (let i = 0; i < n; i++) {
      if (!stdin.write(await frame(i / fps, 'image/jpeg', 0.95))) await new Promise(r => stdin.once('drain', r));
      if (i % 60 === 0) process.stderr.write(`\rframe ${i}/${n}`);
    }
    stdin.end();
  });
  console.log(JSON.stringify({ film: out, frames: n, fps, seconds: tl.duration, render_s: Math.round((Date.now() - t0) / 1000) }));
}
await browser.close();
server.close();
