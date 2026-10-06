# headless-render — notes

**Source:** [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) @ `0ac8bf2`. MIT, © 2026 John Heibel ([LICENSE](LICENSE)). The same `render.mjs` (with small changes) ships inside [`../../skills/painted-animation/template/`](../../skills/painted-animation/template/) and [`../../skills/kinetic-reel/template/`](../../skills/kinetic-reel/template/).

## Files

| File | What it does |
|---|---|
| `render.mjs` | Opens a page in headless Chrome and calls `window.renderAt(t)` (or `renderSheet`) to make review images and video. |
| `gpu_probe.mjs` | Prints which GPU Chrome's WebGL actually lands on for each set of launch flags. |

## Why it is useful

It is a ready-made answer to "how does the agent check its own motion?". The modes:

```
node render.mjs --sheet=0.5,1,1.5,2 --cols=4 --w=480 --out=out/check/a.jpg     contact sheet at chosen times
node render.mjs --strip=2.0:2.5 --cols=6 --w=320 --out=out/check/strip.jpg     every frame in a span (motion)
node render.mjs --sheet=2.1,2.2 --crop=760,300,400,400 --out=out/check/c.jpg   full-resolution crops
node render.mjs --strip=2.0:2.5 --crop-at=960,780,500,400 --out=…              crops that follow a world point through the camera
node render.mjs --stills=1.2,3.4 --out=out/stills                              full-resolution PNGs
node render.mjs --clip --out=out/video.mp4                                     straight to MP4, one worker
node render.mjs --frames --workers=4                                           parallel, resumable JPEG frames
node render.mjs --encode --out=out/video.mp4 --audio=song.mp3                   frames → MP4 with audio
```

Flags for the GPU: `--soft-gl` (SwiftShader, no GPU), `--gpu-angle=vulkan|gl-egl` (headless NVIDIA on Linux); Windows uses d3d11 and macOS Metal by default. `--chrome=<path>` or `CHROME_PATH` picks the browser.

`gpu_probe.mjs` is worth running on any render machine: headless Chrome silently falling back to the software renderer is a common reason WebGL renders are slow.

```
node gpu_probe.mjs "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Adapting it to other pages

`render.mjs` opens `studio.html` in the folder you run it from. That page must load the scene and expose `window.ready`, `window.renderAt(t)` (returns a data URL), `window.renderSheet(...)` and a global `PROJECT` with length and fps (from `src/config.js` in the painted-animation template, which is the reference implementation). For a HyperFrames or Three.js + GSAP page, add a small `renderAt(t)` that seeks the timeline to `t`, renders, and returns `canvas.toDataURL()`; the review modes then work unchanged.

## Requirements

Node.js, `puppeteer-core` (`npm i puppeteer-core`), Chrome or Chromium, ffmpeg on the PATH.
