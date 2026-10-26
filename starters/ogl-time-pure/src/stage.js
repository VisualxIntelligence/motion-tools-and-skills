// stage.js: the page contract for ../render.mjs, on top of OGL.
//
// A scene is a module whose default export is `setup({ gl, renderer, stage })` and returns
//   { render(t, frame), dur? }
// `render` must draw the picture for time `t` seconds (frame = the frame index, for per-frame flicker
// such as grain) and depend on nothing else. No requestAnimationFrame, no Date, no performance.now, no
// Math.random, no `x += dt`. Assign every animated value absolutely from `t`.
//
// The stage exposes what render.mjs expects: window.ready, window.renderAt(t, type, q),
// window.renderSheet(times, cols, w, crop), window.gpuInfo(), and the globals DUR and PROJECT.
import { Renderer } from '../vendor/ogl/src/index.js';
import { PROJECT } from './config.js';
import { frameIdx } from './util.js';

export async function createStage(setup, { w = PROJECT.w, h = PROJECT.h, msaa = PROJECT.msaa } = {}) {
  const renderer = new Renderer({
    width: w, height: h, dpr: 1, alpha: false, antialias: msaa,
    preserveDrawingBuffer: true, powerPreference: 'high-performance', webgl: 2,
  });
  const gl = renderer.gl;
  if (!renderer.isWebgl2) console.warn('WebGL2 not available: some scenes and the post chain need it');
  document.body.appendChild(gl.canvas);

  const stage = { renderer, gl, w, h, fps: PROJECT.fps, canvas: gl.canvas };
  const scene = await setup({ gl, renderer, stage });
  const dur = scene.dur ?? PROJECT.dur;

  const draw = (t) => { scene.render(t, frameIdx(t, PROJECT.fps)); };

  window.DUR = dur;
  window.PROJECT = { audio: PROJECT.audio, w, h, fps: PROJECT.fps };

  window.renderAt = async (t, type = 'image/png', q = 0.92) => { draw(t); return gl.canvas.toDataURL(type, q); };

  // Contact sheet of chosen times, optionally cropped to [x, y, w, h] in full-resolution pixels.
  // (render.mjs's --crop-at, which follows a world point through the camera, is not supported here.)
  window.renderSheet = async (times, cols = 3, cw = 640, crop = null, at = null) => {
    if (at) console.warn('--crop-at is not supported by ogl-time-pure; use --crop=x,y,w,h');
    const [cx, cy, sw, sh] = crop || [0, 0, w, h];
    const ch = Math.round(cw * sh / sw), rows = Math.ceil(times.length / cols);
    const sheet = document.createElement('canvas'); sheet.width = cols * cw; sheet.height = rows * ch;
    const c = sheet.getContext('2d'), ms = [];
    for (let i = 0; i < times.length; i++) {
      const t0 = performance.now(); draw(times[i]); ms.push(Math.round(performance.now() - t0));
      const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
      c.drawImage(gl.canvas, cx, cy, sw, sh, x, y, cw, ch);
      c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 84, 24);
      c.fillStyle = '#fff'; c.font = '15px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 17);
    }
    return { url: sheet.toDataURL('image/jpeg', 0.9), ms };
  };

  window.gpuInfo = () => {
    const e = gl.getExtension('WEBGL_debug_renderer_info');
    return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  };

  window.ready = true;

  // Browser preview: scrub with a slider. Not used by render.mjs (it adds ?render).
  if (!location.search.includes('render')) {
    const s = document.getElementById('scrub'), lab = document.getElementById('tt');
    s.max = dur;
    const go = () => { const t0 = performance.now(); draw(+s.value); lab.textContent = `${(+s.value).toFixed(2)}s · ${Math.round(performance.now() - t0)} ms`; };
    s.addEventListener('input', go);
    s.value = new URLSearchParams(location.search).get('t') || 0;
    go();
  } else {
    document.getElementById('bar')?.remove();
  }
  return stage;
}
