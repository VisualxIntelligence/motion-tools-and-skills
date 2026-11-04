# anatomy — notes

**Source:** [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) @ `1482e84` (18 Oct 2026, after release 1.1.0). MIT, © 2026 Ryan ([LICENSE](LICENSE)). Copied 4 November 2026.

## What it makes

**Interactive isometric figures that explain a technical idea as a real machine**: a dial gauge, a test rig, a lock, a plotter, an arcade cabinet, a rocket engine in a test stand. The drawing is SVG built in code, with optional WebGL layers for light, fire, water and steam that sit in the same isometric camera, an optional true-3D turn mode (beta), and a framed card with `Fig n`, a title, an interaction hint and a live readout. It also prints a figure as an A4 or US Letter PDF (poster, drawing or two-page handout).

The output is a **web page**, not a video: a standalone HTML file, a lone `.svg`, or React/Next.js components. See [Rendering a figure to video](#rendering-a-figure-to-video) below for the route we use.

The method in one line: **the object is the explanation.** Invent a physical machine whose working *is* the concept (a cache key becomes a pin-tumbler lock; a shared GPU context becomes one plotter head visiting 16 wells), drive every moving part and every number on screen from one small pure model of the real figures, then check it like a critic at 4× zoom.

| Piece | What it does |
|---|---|
| `SKILL.md` | The workflow: size the job (Figure / Hero / Epic), truth first, invent the object, a parts list of 40+ before any geometry, plan the camera, build geometry once, paint back to front, frame the card, make it live, verify |
| `references/craft.md` | Tones (base, structure, subject, one lit accent), a vocabulary of real parts with recipes, painter's order, pipe routing, screens drawn in the plane of a face |
| `references/motion.md` | Time-based motion: exponential follow (τ 0.1–0.3 s), springs sub-stepped at about 240 Hz, critically damped `settle()` for colour and brightness, `burst()` for one-shot events, idle tours as pure functions of time, exploded views with one spring per assembly and a 35 ms stagger |
| `references/webgl.md` | Shaders only for what lines cannot draw; back SVG / canvas / front SVG on one viewBox; world space in the figure's own camera; no hard cut-offs; tonemap plus animated dither; light- and dark-theme blending |
| `references/3d.md` | The optional 3D turn mode (beta): turn groups, hinges, free bodies, per-frame depth order, its own audits and performance budget |
| `references/verify.md` | The critic's checklist: desktop, phone and hover captures, slowed contact sheets across every transition, 4× close-ups of every junction in both themes |
| `references/print.md`, `publish.md`, `react.md`, `kit.md`, `walkthrough.md` | Print sheets; sharing to the community gallery; React/Next use; the kit API; a worked walkthrough |
| `kit/` | Zero-dependency geometry and drawing kit: `iso-kit` (projection, slabs, cylinders, extrusions, ticks, knurls, coils), `lathe` (round parts on any axis), `tube` (pipes and cables), `gl` (WebGL layers in the isometric camera), `turn*` (3D mode), `audit` (proves nothing passes through anything), React helpers |
| `scripts/` | Headless-Chrome checks: `capture.mjs` (shots, crops, hover), `drive.mjs` (scripted sequences, slow motion, contact sheets, orbits), `lines.mjs` (fails lines that end in mid-air), `turn-check.mjs`, `print.mjs`, `publish.mjs`; unit tests |
| `examples/` | Eight figures as source: `dial-indicator` (smallest, about 300 lines), `push-button`, `desk-computer`, `arcade-cabinet` (Hero, about 240 solids), `raptor-engine` (pipework, exploded view, WebGL plume), `ripple-tank` (two WebGL layers driven by an optics model), `test-rig` and `spot-plate` (React production figures), `turning-dial` (3D mode) |

## When to use it

- **Explainers for the AI news series and LinkedIn pieces** where the idea is a mechanism: how a model routes a request, what a cache or a context window does, why one setting costs more than another. A "Which brain, how hard?"-style concept becomes a machine with a dial whose needle is driven by the real numbers.
- **Documentary inserts** that need a technical object drawn cleanly and taken apart (the Raptor's exploded view is the reference).
- **As a source of rules** even when you draw elsewhere: the one-accent tone hierarchy, "every line ends on something", the burst and settle envelopes, and the exploded-view stagger all transfer to GSAP, HyperFrames, Blender and Unreal work as direction.

**Not for:** people, exact maps or buildings (out of scope per upstream), charts (it is not a chart library), or anything quick. It is slow on purpose: a Figure (one mechanism, 40–80 parts) is the smallest job, a Hero is about 2–4 hours, and the skill refuses to start an Epic without asking.

## Rendering a figure to video

Anatomy figures run on live clocks (`requestAnimationFrame`, `performance.now`, timers for the idle tour) and two examples call `Math.random`. That is exactly what [`../../starters/dioramas/scripts/render-video.mjs`](../../starters/dioramas/NOTES.md#rendering-a-diorama-to-video) handles: it freezes every clock, seeds `Math.random`, steps time one frame at a time and pipes screenshots to ffmpeg. Two options were added to it for figures like these (4 Nov 2026):

- `--scale n` sets the device pixel ratio, so the page lays out at its designed size but records sharp.
- `--clip selector` records one element only; `.iso-plate` is the Anatomy card.

```bash
node skills/anatomy/examples/dial-indicator/build.mjs          # writes dial-indicator.html (add --light for the light theme)
cd starters/dioramas && npm install
node scripts/render-video.mjs file:///ABS/PATH/skills/anatomy/examples/dial-indicator/dial-indicator.html \
     out/dial.mp4 --duration 13.2 --fps 30 --w 1280 --h 720 --scale 1.5 --lead 1.4
# card only, for compositing:  --clip .iso-plate --scale 3
```

Things to get right:

- **Frame rate: 30, 50 or 60, not 24 or 25.** The examples and the kit's React loop clamp their frame step to 1/30 s (`Math.min(dt, 1/30)`, as `references/motion.md` teaches). At 25 fps each 40 ms step is cut to 33 ms and the motion plays about 17% slow. For a 25p delivery, render at 50 and drop every other frame in the edit, or raise the clamp in the figure.
- **The idle tour starts about 1.4 s after load** and loops (the dial indicator's period is 6 stops × 2.2 s). Use `--lead 1.4` to start on the tour, and a duration of whole tour periods for a clean loop.
- **WebGL sharpness.** `kit/gl.mjs` caps the canvas at 1.5× (`maxRatio = 1.5`). When recording at `--scale` above 1.5, pass a higher `maxRatio` to `glLayer({ … })` in the figure, or the shader layer is softer than the SVG.
- **Interaction.** `render-video.mjs` can drive the pointer and clicks from keyframes (`--pointer`, `--click`), which is enough for hover-to-explode on the Raptor. Keyboard-driven moments (the desk computer's typing) need the tour, or a small `--ready`/`eval` hook added to the figure.
- **Reduced motion.** Figures go still under `prefers-reduced-motion: reduce`. Playwright's default is no preference, so leave it.
- **Element position.** A card centred at a fractional pixel can bring a 1 px sliver of page background into a `--clip` recording; give the card whole-pixel margins if it shows.

The capture route was tested on a small test page with the same patterns (rAF loop, a 1.4 s `setTimeout` tour start, `Math.random`): two runs were frame-identical, and `--scale 2 --clip` gave a sharp element-only film. **It has not been run on the Anatomy examples themselves.**

## Requirements

- Node.js 20.10+ (no npm dependencies for the kit and examples).
- Chrome or Chromium for the checks (`capture`, `drive`, `lines`, `turn-check`, `print`); on Linux it also finds Playwright's Chromium under `~/.cache/ms-playwright`.
- For video: the dioramas starter's dependencies (`npm install` in `starters/dioramas/`) and ffmpeg.

## Installing

Copy or symlink this folder to `~/.claude/skills/anatomy/` (see [`../README.md`](../README.md#installing-a-skill)); `SKILL.md` and its `references/`, `kit/`, `scripts/` and `examples/` must stay together, because the skill reads them by relative path. Upstream also installs with `npx skills add wheresryan22/anatomy -g -a claude-code` (the skills CLI wants Node 22.20+).

## Changes from upstream

- **Copied unchanged:** `SKILL.md`, `CHANGELOG.md`, `LICENSE`, `agents/`, `evals/`, `kit/`, `references/`, `scripts/`, `tests/` and the example sources.
- **README** kept as `UPSTREAM-README.md`, with its five preview images pointed at upstream's copies (pinned to the commit) instead of `.github/assets/`.
- **Left out:** the built example pages (`examples/*/*.html`, about 10 MB; rebuild any of them with `node examples/<name>/build.mjs`, plus `--light` for the light theme, and `stress.mjs` for the turning-dial stress scene), the nine example PDFs, `.github/` (CI, issue templates, preview images), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` and `SECURITY.md`.
- **Not run here.** Nothing in this folder was executed during the copy.

## Worth knowing

- **`publish.mjs`** shares a finished figure to upstream's community gallery and, in Claude Code, reads the session log to report how long the figure took and how many tokens it used. It asks before sending anything; leave it alone for client or newsroom work.
- **Token cost.** A Hero runs for hours and checks itself with many screenshots; budget accordingly and start with a Figure.
- **Earlier notes.** A first read of this repo (11 Oct 2026, at the commit before 1.1.0) is in the Motion Graphics project docs; since then upstream added print sheets, the community gallery, Codex/OpenCode/Antigravity/MiniMax support, and many audit and capture fixes (see `CHANGELOG.md`).
