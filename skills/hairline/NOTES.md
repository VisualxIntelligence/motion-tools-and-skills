# hairline — notes

**Source:** [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline) @ `034f4bf` (13 Nov 2026): the two skills in `skills/`. MIT, © 2026 Lucas Marques ([LICENSE](LICENSE)). Copied 14 November 2026.

## What it makes

**One isometric line figure that answers the pointer**, as a single self-contained HTML file: an object built from rounded solids in one stroke weight, with no fills, glows or words inside the drawing. Move the pointer over it and the object answers (a field of pillars lifts around the cursor, a tray of cards riffles, a terminal scrolls back), and a read-out under the stage says what you are touching. The upstream package has 33 such figures; these skills make new ones in the same style, on the same engine.

It is the quiet sibling of [`anatomy`](../anatomy/NOTES.md). Anatomy draws a dense machine with WebGL light and many parts; Hairline draws one object, one gesture, one idea, in lines only. Use Hairline for a concept that needs one clear metaphor (an empty state, a feature spot, a channel ident, a section opener), Anatomy for a full explainer figure.

| Folder (skill name) | What it does |
|---|---|
| `hairline-create/` | Draws a new figure: two or three concepts in one line each (object, what the pointer does, what the read-out says, where the tour stops), you pick, it writes `<name>.js`, builds the page, validates it and checks it by eye |
| `hairline-adopt/` | Takes an SVG (icon, logo, illustration), reads what object it shows, and hands over to `hairline-create` to rebuild that object as solids with a gesture. It never traces or animates the SVG itself |

| File in `hairline-create/` | What it is |
|---|---|
| `SKILL.md` | The workflow: source, concept, build, check, hand over, adjust, and a "what goes wrong" table |
| `rules.md` | **The ten rules**, each with how to keep it and what gets a figure rejected: hit areas don't move; stagger by distance (delay = distance from the touched item × a 30–60 ms step); clamp the reach; the stroke is the only highlight; rest is designed, never flat; construction stays honest; loops sleep offscreen; two clocks (springs and tweens); round every corner, then draw less; no words inside the figure |
| `concepts.md` | How to find the object and gesture, six proven answers, empty states, figures from a mark, what a weak concept looks like |
| `kernel.js` | The fixed engine (projection, rounded prisms, springs, tweens, the shared animation loop, the tour). The figure never edits it |
| `bench.html` | The fixed page: stage, read-out, intensity slider, theme switch, play button. URL options `?play=1`, `?theme=light\|dark`, `?intensity=0..1`, `?w=240` |
| `build.mjs`, `validate.mjs` | Assemble the page from kernel + bench + figure; check the page as text |
| `look.mjs`, `look.md` | One command that builds, validates and takes **eight pictures on one sheet** (rest, answering, small, low and high intensity, dark and light), plus the questions only eyes can answer |
| `read.mjs`, `source.md` | Measure a source SVG for `hairline-adopt` |
| `examples/` | Two of the package's figures in the format the skill writes: `terrain.js` (a continuous field) and `riffle.js` (discrete items) |

## Rendering a figure to video

A Hairline page plays itself with `?play=1`: an unseen pointer walks the figure's `tour` (three to six stops, then a leave) and loops until a real pointer arrives. The kernel runs on `requestAnimationFrame`, `performance.now` and `setTimeout`, which is what [`../../starters/dioramas/scripts/render-video.mjs`](../../starters/dioramas/NOTES.md#rendering-a-diorama-to-video) virtualises, so the Anatomy route should carry over:

```bash
node skills/hairline/hairline-create/build.mjs terrain.js        # in your working folder: writes hairline-terrain.html
cd starters/dioramas && npm install
node scripts/render-video.mjs "file:///ABS/PATH/hairline-terrain.html?play=1&theme=dark" \
     out/terrain.mp4 --duration 10.2 --fps 50 --w 1280 --h 720 --scale 2 --lead 1.2 --clip "#stage"
```

- **Timing, from `kernel.js`.** The tour waits 1.2 s after load, then each stop takes 0.9 s to reach and 1.2 s of dwell; the leave rests 1.8 s. The default lap (four stops and a leave) is 4 × 2.1 + 1.8 = **10.2 s**. A figure's own `tour` changes the count; use whole laps for a clean loop.
- **Frame step.** The loop clamps each step to 0.05 s, so 24, 25, 30, 50 and 60 fps all play at true speed (unlike Anatomy's 1/30 s clamp).
- **Theme.** Pass `theme=dark` or `theme=light`; otherwise the page follows the browser's colour scheme.
- **Untested.** This route has not been run on a Hairline page; check the first render against the page in a browser.

## When to use it

- Idents, section openers and feature spots in a line-drawn house style; empty states and onboarding art for web products.
- A client or brand mark brought to life (`hairline-adopt`). The skill reminds you at hand-over that someone else's mark is theirs to publish.

## Requirements

- Node 18+ for `build.mjs` and `validate.mjs` (no dependencies).
- For `look.mjs`: Chrome, or Playwright's Chromium. It installs `playwright-core` once into a cache folder outside the skill (`HAIRLINE_LOOK_CACHE` moves it).
- For video: the dioramas starter's dependencies and ffmpeg.

## Installing

Copy or symlink **each** skill folder separately, `hairline-create/` to `~/.claude/skills/hairline-create/` and `hairline-adopt/` to `~/.claude/skills/hairline-adopt/` (see [`../README.md`](../README.md#installing-a-skill)). `hairline-adopt` calls `/hairline-create`, so install both. Upstream: `npx skills add https://github.com/lucasmarkes/hairline --skill hairline-create`.

## Changes from upstream

- **Copied unchanged:** both skill folders and `LICENSE`.
- **README** kept as `UPSTREAM-README.md`, with its hero GIF pinned to the commit and the sponsor blocks removed.
- **Left out:** the npm package, the site and registry (`apps/`, `packages/`, `registry/`), fixtures, CI and the rest of the monorepo. The 33 published figures install from npm (`@lucasmarkes/hairline`) if you want them ready-made.
- **Not run here.** Nothing in this folder was executed during the copy.
