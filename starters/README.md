# Starters

Project templates to copy and build on. Copy the folder to a new project, run `npm install`, and start from there.

| Starter | What you get | Stack | Where |
|---|---|---|---|
| Kinetic reel | A 17 s reel using every technique: kinetic type, HUD, three.js layers, WebGL post pass, transitions, synth score, review-and-render tool | Canvas 2D + three.js 0.160, puppeteer, ffmpeg | [`../skills/kinetic-reel/template/`](../skills/kinetic-reel/template/) |
| Painted cartoon (ClaudeAnimationBase) | An 11 s demo short with the full p5.brush engine, character rig, karaoke, review-and-render tool and the animation guide | p5.js + p5.brush, puppeteer, ffmpeg | [`../skills/painted-animation/template/`](../skills/painted-animation/template/) |
| Web intro page | A one-time autoplay intro reel for a website, plus a Cloudflare Worker serving video with HTTP range requests | HTML, CSS, JS | [`../skills/kinetic-reel/examples/site-intro/`](../skills/kinetic-reel/examples/site-intro/) |
| p5 overlay renderer | Render a p5 sketch to a transparent PNG sequence for compositing, with a motion helper library | p5.js, puppeteer | [`../skills/motion-graphics-music-video/scripts/tools/p5/`](../skills/motion-graphics-music-video/scripts/tools/p5/) |
| [`tidewater-webgpu-fx/`](tidewater-webgpu-fx/NOTES.md) | FFT ocean, physical sky, caustics, lens flare, motion blur, full post chain, WGSL noise library, deterministic and headless capture | Raw WebGPU + WGSL | this folder |
| Code-film page contract | `window.READY`, `render(t)`, `DUR`, `EV`, `TEXTS` and the tools that render and check such a page; pair with a style prompt | Canvas 2D / three.js / WebGL2 | [`../tools/lemo-core/`](../tools/lemo-core/NOTES.md) + [`../prompts/film-styles/`](../prompts/film-styles/) |

The first two live inside their skills because each skill's scaffold script copies its template; they are listed here so they are easy to find.
