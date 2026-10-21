# mg-styles-15 — notes

**Source:** [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) @ `49052d8`. MIT, © 2026 Vincentwei1021 ([LICENSE](LICENSE)). Showcase page with all 15 films: <https://vincentwei1021.github.io/mg-styles-15/>.

The upstream layout is kept as is, so the prompts, the renderer, the audio toolkit and the demo sources still find each other by path. Run everything from this folder.

## What it is

Fifteen 10-second motion-design films, one per style, each made by Claude Opus 5.5 writing code from one prompt, then improved through two rounds of independent AI review. Picture and sound are both code: SVG, Canvas, WebGL and three.js for the picture (Blender for the 3D film), a Python synth with CC0 samples for the music and effects.

| Path | What it is |
|---|---|
| `prompts/*.md` | The 15 prompts. Each has the same shared frame (director role, output spec, how to work, rules, craft checklist, self-review, delivery) plus four style-specific parts: **Output**, **Suggested technical route**, **Creative seed** (beats by the second, palette, type, sound) and **Signature features and key techniques**. The usage notes at the top of each file are in Chinese; the prompt blocks are in English. |
| `template.md` | How to write a prompt for a new style: fill the four style-specific parts and copy the shared frame. Key advice: make signature features testable ("overshoot `cubic-bezier(0.34,1.56,0.64,1)`, stagger 2–4 frames", not "bouncy"), write the creative seed as beats by the second, and use fictional brands. |
| `rubric.md` | **The AI jury.** A prompt for a second, independent agent: extract contact sheets, strips and full-resolution frames; check the spec (exact duration, −14 LUFS ±1, true peak ≤ −1 dBTP, no black frames, hits on audio onsets); score seven dimensions 1–10 with calibrated anchors (5 student, 7 solid professional, 8 high-end agency, 9 award shortlist); list 5–10 fixes with timecodes and numbers. Then a second prompt that feeds the review back to the maker for a revision round. Wrapper text in Chinese, prompts in English. |
| `harness/render.mjs` | The renderer. A page defines `window.renderAt(t)` (and optionally `window.DEMO` with size, fps, duration); the harness also seeks CSS and Web Animations to `t`, captures every frame in headless Chrome, and muxes with ffmpeg. Sub-frame motion blur (`--mb 4 --shutter 0.5`), parallel workers, `--stills`, lossless `--mkv`, re-timing into a reel slot (`--tmap`). |
| `harness/preview.html` | Scrub any demo in the browser (`?demo=<slug>`). |
| `lib/audio/` | **mgaudio**, the soundtrack toolkit: 48 kHz stereo, band-limited oscillators, ladder and SVF filters, Karplus-Strong, FM, drums, a library of SFX, genre **recipes** (synthwave, darksynth, chiptune, techno, pop, future bass, trap and more) arranged around a `drop` and an `outro` time, and a master to −14 LUFS with a true-peak limiter. Every sound has a **sync point** (a whoosh syncs on its pass-by peak, a riser on its hit), so you pass the visual event time and never compute offsets. Read `lib/audio/README.md`. |
| `demos/<slug>/` | The source of each film: `index.html` and JS, `audio.py` (its soundtrack), `cues.json` (the timing sheet both share). The 3D film's Blender scripts are in `demos/04-3d-render/blender/`. |

## The 15 styles

| # | Style | Route | Jury score |
|---|---|---|---|
| 01 | Flat / vector 2D | SVG + GSAP (CustomEase, MorphSVG), sub-frame blur on fast moves | 7.64 |
| 02 | Line art | SVG paths + stroke-dashoffset, camera following the pen tip | 7.64 |
| 03 | Isometric 2.5D | three.js orthographic at true isometric angle, soft shadows, AO | 8.00 |
| 04 | 3D render (C4D/Blender look) | **Blender CLI (bpy) → Cycles/EEVEE frames**, a web page adds type and grain | 7.71 |
| 05 | Cel animation / line boil | Canvas 2D variable-width brush, boil variants cycled on twos | 8.07 |
| 06 | Collage / cut-out | DOM/Canvas photo cut-outs (rembg), halftone, stepped 12 fps | 8.14 |
| 07 | Liquid motion | WebGL2 SDF metaballs with fake 3D lighting | 7.57 |
| 08 | Shape morph | SVG + flubber or MorphSVG, colour-field wipes | 7.64 |
| 09 | Geometric / Bauhaus | SVG/Canvas + GSAP on a modular grid, 120 BPM beat grid | 7.71 |
| 10 | 80s synthwave / VHS | WebGL grid, sun and mountains, chrome text, VHS pass | 8.21 |
| 12 | Aurora gradient + glassmorphism | WebGL mesh gradient, SDF glass refraction, CSS backdrop glass | 8.07 |
| 18 | Variety-show captions (9:16) | DOM/SVG stroked caption components over footage | 7.64 |
| 19 | Sticker explainer | One huge canvas with a camera transform, SVG charts, outlined photo stickers | 7.71 |
| 20 | Pixel art | 320×180 canvas scaled ×6, sprites as pixel arrays | 8.07 |
| 22 | Cyberpunk HUD / FUI | SVG/Canvas FUI layers + three.js wireframe hologram, glow and scanlines | 7.93 |

Most useful for a news and broadcast team: **22 HUD** (map data, target boxes, readouts), **19 sticker explainer** (data explainer on one big canvas), **09 Bauhaus** and **01 flat vector** (clean kinetic graphics on a beat grid), **04 3D render** (an agent-driven Blender route, relevant to our Blender benchmark).

## How to use it

```
npm install
pip install -r requirements.txt
python3 demos/22-hud/audio.py             # soundtrack → demos/22-hud/out/audio.wav
node harness/render.mjs demos/22-hud      # frames → demos/22-hud/out/video.mp4
python3 -m http.server 8000               # preview: http://localhost:8000/harness/preview.html?demo=22-hud
```

The sampled instruments (103 CC0 VCSL samples, 57 MB of FLAC) are not in this repo; synthesised parts work without them, but calls to sampled instruments and hits (`samples.inst`, `samples.hit`, `drums.crash`…) raise an error until the pack is in place. To add them, copy `lib/audio/samples/` from upstream:

```
git clone --depth 1 --filter=blob:none --sparse https://github.com/Vincentwei1021/mg-styles-15 mg-upstream
git -C mg-upstream sparse-checkout set lib/audio/samples
cp mg-upstream/lib/audio/samples/*.flac lib/audio/samples/
```

(`lib/audio/tools/` holds the scripts that built them from the VCSL library: `select_vcsl.py` → `download_vcsl.sh` → `build_samples.py`.)

To make a new film: open an agent in an empty folder, paste a prompt from `prompts/`, and replace only its **Creative seed** with your story, copy and colours (or change **Output** to 1080×1920). Keep **Signature features**: that is what makes the style recognisable. Then run `rubric.md` in a separate session and paste the review back. The originals took two make → review → revise rounds; one run rarely reaches the same finish.

## Windows and GPU notes

- `render.mjs` looks for Chrome at the macOS path. On Windows set `MG_CHROME` to `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Off macOS it defaults to Linux NVIDIA flags (`--use-angle=gl-egl`). On Windows set `MG_GPU_ARGS=--use-angle=d3d11`, then confirm hardware WebGL with [`../../tools/headless-render/gpu_probe.mjs`](../../tools/headless-render/gpu_probe.mjs).
- `download_vcsl.sh` is bash and writes to `/tmp`; run it under WSL or Git Bash.

## What was left out

Media and binary assets: the films (`videos/`), the showcase site (`site/`, `index.html`), shared textures and the HDRI (`assets/`, CC0), the font files (their list is in `assets/fonts/README.md`), the 103 VCSL instrument samples (CC0, 57 MB; see *How to use it*), and the image and mesh assets inside the demos (the photos and cut-outs in 05, 06, 18 and 19; the glyph meshes in 04). Demos that need them say so in their code; fetch them from upstream. Code, prompts and data files are complete.
