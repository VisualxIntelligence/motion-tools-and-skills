# lower-thirds — notes

**Source:** [iart-ai/lower-thirds-skills](https://github.com/iart-ai/lower-thirds-skills) @ `aa8ef7e`, the `skills/lower-thirds/` folder plus three examples. MIT, © 2026 iart.ai ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it makes

**Transparent lower thirds** (name and title straps) as video with an alpha channel, ready to lay over footage in an edit or a live switcher. The agent:

1. reads the brief, with exact names and titles;
2. designs the card in a Canvas 2D page (`templates/lower-third.html`), exposing `window.draw(frame)`, `FRAMES` and `FPS`;
3. checks it;
4. looks at stills over checker, dark and light grounds and at build-in and build-out contact sheets;
5. renders it;
6. delivers it with import notes for the target tool.

No Remotion is involved: Playwright captures the page and ffmpeg encodes.

| Output (`scripts/render.mjs`) | Format | For |
|---|---|---|
| `out.webm` | VP9 with alpha (`yuva420p`) | OBS, Chrome, Edge |
| `out.mov` | ProRes 4444 with alpha (`yuva444p10le`) | Premiere, DaVinci Resolve, Final Cut |
| `out.mp4 --ground '#00ff00'` | H.264 on a flat colour | Chroma key |
| `--stills`, `--sheet` | PNG stills, contact sheet | Review |
| `--scale 2` | 3840×2160 | UHD |

**`--check` fails the job if:**

- anything enters the outer 5% (title safe);
- the background is painted;
- the first or last frame is not empty;
- a font face did not load.

After encoding, it decodes a middle frame and fails if the alpha is not really there.

`references/delivery.md` covers the tool-by-tool import:

- Premiere does not read WebM alpha, so use the `.mov`.
- Resolve needs alpha set to Straight.
- In OBS, use a Media Source, or a Browser Source on `index.html?obs`.

The template has a `CARDS` array, a timing model (lead, in, hold, out, tail), a 6% safe margin, text fitting and font-load checking.

## When to use it

- **Lower thirds and name straps** for packages, interviews, explainers and social cuts, delivered as alpha video to the edit.
- **As the alpha-output reference** for any code-rendered overlay. The encode-and-verify chain in `render.mjs` (ProRes 4444 / VP9 alpha, then decode and check the alpha) works for a HyperFrames or GSAP page too: swap the page's `draw(frame)` for a seek of the paused GSAP timeline.

## Requirements

Node 18+, `npm i playwright-core` (in this folder or above it), ffmpeg with `libvpx-vp9` and `prores_ks`, and Chrome (or `npx playwright install chromium`).

Fonts load from Google Fonts at render time, so the machine needs network access, or swap in local `@font-face` files.

## Not covered (add for broadcast)

- **Video standards.** No Rec.709 legal-range or broadcast-safe colour check, and no 25/50p or interlace guidance; it renders at the page's FPS.
- **Arabic.** No Arabic or RTL guidance; see the Arabic text rules in [`../../docs/techniques.md`](../../docs/techniques.md#arabic-and-right-to-left-text).
- **CG systems.** No link to a graphics system (OGraf, CasparCG). For live templated graphics the OGraf route is separate; this skill makes pre-rendered clips.

## Changes from upstream

- **Copied.** The skill folder unchanged.
- **Examples.** The three examples (podcast, church livestream, Twitch stream) are moved under `examples/` inside the skill, with their render commands and links updated for that layout.
- **Left out.** The README (it advertises the iart.ai service), the plugin manifests and `showcase.gif`.
