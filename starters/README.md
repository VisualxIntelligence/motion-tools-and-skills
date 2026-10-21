# Starters

Project templates to copy and build on. Copy the folder to a new project, run `npm install`, and start from there.

| Starter | What you get | Stack | Where |
|---|---|---|---|
| Kinetic reel | A 17 s reel using every technique: kinetic type, HUD, three.js layers, WebGL post pass, transitions, synth score, review-and-render tool | Canvas 2D + three.js 0.160, puppeteer, ffmpeg | [`../skills/kinetic-reel/template/`](../skills/kinetic-reel/template/) |
| Painted cartoon (ClaudeAnimationBase) | An 11 s demo short with the full p5.brush engine, character rig, karaoke, review-and-render tool and the animation guide | p5.js + p5.brush, puppeteer, ffmpeg | [`../skills/painted-animation/template/`](../skills/painted-animation/template/) |
| Web intro page | A one-time autoplay intro reel for a website, plus a Cloudflare Worker serving video with HTTP range requests | HTML, CSS, JS | [`../skills/kinetic-reel/examples/site-intro/`](../skills/kinetic-reel/examples/site-intro/) |
| p5 overlay renderer | Render a p5 sketch to a transparent PNG sequence for compositing, with a motion helper library | p5.js, puppeteer | [`../skills/motion-graphics-music-video/scripts/tools/p5/`](../skills/motion-graphics-music-video/scripts/tools/p5/) |
| [`tidewater-webgpu-fx/`](tidewater-webgpu-fx/NOTES.md) | FFT ocean, physical sky, caustics, lens flare, motion blur, full post chain, WGSL noise library, deterministic and headless capture | Raw WebGPU + WGSL | this folder |
| [`pdoom-video-engine/`](pdoom-video-engine/NOTES.md) | A TypeScript + three.js engine for audio-driven films: **adaptive per-tile motion blur** (12–324 sub-frames), true 4K from a 1080p layout, HDR post chain (bloom, halation, CA, grain), beat/onset/envelope API, GPU line batches, kinetic and plotter type, offline renderer. Reference engine: bring your own timeline and scenes. | TypeScript, three.js, bun + Vite, playwright-core, ffmpeg | this folder |
| [`mg-styles-15/`](mg-styles-15/NOTES.md) | 15 ten-second motion-design films with full source (flat vector, line art, isometric, Blender 3D, cel boil, collage, liquid, morph, Bauhaus, synthwave, aurora glass, variety captions, sticker explainer, pixel, HUD), their prompts, the `renderAt(t)` render harness, the **mgaudio** soundtrack toolkit and the **AI jury rubric** | SVG, Canvas, WebGL, three.js, GSAP, Blender; puppeteer; Python audio | this folder |
| [`papermotion/`](papermotion/NOTES.md) | A paper-cutout film engine for agents: bone rigs with springs, deterministic physics, paper rendering, weather, fire, parallax camera, beats-based choreography, sound fired by the simulation; plus its Claude Code skill | TypeScript, Vite, playwright-core, ffmpeg | this folder |
| Code-film page contract | `window.READY`, `render(t)`, `DUR`, `EV`, `TEXTS` and the tools that render and check such a page; pair with a style prompt | Canvas 2D / three.js / WebGL2 | [`../tools/lemo-core/`](../tools/lemo-core/NOTES.md) + [`../prompts/film-styles/`](../prompts/film-styles/) |

The first two live inside their skills because each skill's scaffold script copies its template; they are listed here so they are easy to find.
