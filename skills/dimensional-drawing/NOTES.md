# dimensional-drawing — notes

**Source:** [enesozturk/dimensional-drawing](https://github.com/enesozturk/dimensional-drawing) @ `5c45743` (23 Oct 2026): both skills in `skills/`. MIT, © 2026 Enes Ozturk ([LICENSE](LICENSE)). Copied 15 November 2026.

## What it makes

**A spec sheet that draws itself.** The first skill draws one UI component (or a physical product) the way Apple's accessory dimensional drawings do: one monochrome sheet with notes, a plan view, an exploded axonometric of the layer stack, detail circles and tables, every dimension a variable code (`S1`, `R2 = R1 − B − S6`). The second turns that sheet into a **film of about 11 s**: the pen draws the header in close-up, the camera pulls back to the plan, layers lift into the exploded view, and the whole sheet resolves.

| Folder (skill name) | What it does |
|---|---|
| `dimensional-drawing/` | The drawing: house rules, code system (spacing, heights, radii, shadow envelope), page and sheet layout. Output is one self-contained HTML file. `examples/` has a card and a dialog sheet |
| `dimensional-drawing-motion/` | The film: choreography in five beats, the template's camera, registration and morph helpers, how to adapt it to a new component, style rules for motion |
| `dimensional-drawing-motion/templates/` | `scene-dialog.js` (the reference film, 1920 × 1080, 60 fps) and `base.css` |
| `dimensional-drawing-motion/adapters/claude-motion.md` | Building the film as a Claude **Motion** artifact on claude.ai (the tuned target) |
| `dimensional-drawing-motion/adapters/headless/` | `render.mjs` + `player.html`: Playwright calls the scene's `render(t)` each frame and pipes PNGs to ffmpeg. `--still t` renders one frame |

**The mechanism is this repo's house method:** the scene is a pure function of time (`render(t)` sets every property from `t` alone), so any frame can be rendered directly. Strokes draw with `pathLength=1` and a dash offset; dashed lines and text fade instead; the camera interpolates zoom on a log scale so pull-backs feel even; morph groups lerp from the flat plan matrix to the axonometric one, with stroke width held constant.

Rules worth keeping: one thing leads at a time and the eye follows the pen; dimensions after the geometry they measure, labels after their leaders; strokes first, fills after (a white fill fading in early flashes over the drawing); ease-in-out for camera and strokes, ease-out for fades, no bounce; keep films 8–15 s; check frames at the key beats for popping, flashing fills and labels outside the frame.

## When to use it

- **Product and feature explainers**: the anatomy of a device, a component, a control panel, as a calm technical film. It pairs with [`anatomy`](../anatomy/NOTES.md) (a live machine) and [`hairline`](../hairline/NOTES.md) (a line figure).
- **Design handoff** for UI work: a sheet anyone could rebuild a component from.
- **Branding:** the sheet is unbranded by rule (neutral names like `UI-CARD-001`); add a show's or client's identity only in the edit, around the film.

## Requirements

- Drawing: none beyond a browser.
- Film: Node 18+, Playwright with Chromium (`npm install` in `adapters/headless/` runs `playwright install chromium`), ffmpeg. `CHROMIUM_PATH` uses an existing Chrome. Upstream reports about 45 s to render 11 s at 30 fps on a laptop CPU.

## Installing

Copy or symlink each folder separately, `dimensional-drawing/` and `dimensional-drawing-motion/`, to `~/.claude/skills/` (see [`../README.md`](../README.md#installing-a-skill)). Upstream: `npx skills add enesozturk/dimensional-drawing`.

## Changes from upstream

- **Copied unchanged:** both skill folders and `LICENSE`.
- **README** kept as `UPSTREAM-README.md`, its images and film pointed at upstream's copies (pinned to the commit) and its examples link fixed for this folder.
- **Left out:** `assets/` (18 MB of README GIFs, stills and the reference MP4).
- **Not run here.** Nothing in this folder was executed during the copy. Upstream tested the headless renderer with Playwright and Chromium and ffmpeg 6.1; Remotion, GSAP and Lottie ports are untested.
