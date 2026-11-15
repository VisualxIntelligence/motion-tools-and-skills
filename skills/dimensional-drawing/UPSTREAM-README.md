<p align="center">
  <img src="https://raw.githubusercontent.com/enesozturk/dimensional-drawing/5c457437c8c83524308aad3b7443e81adcc13153/assets/dialog-motion.gif" alt="A dialog component's dimensional drawing drawing itself: header close-up, pull back to the plan view, layers lifting into an exploded view, then the full sheet" width="100%">
</p>

<h1 align="center">dimensional-drawing ✏️📐</h1>

<p align="center">
  <b>Give it a UI component, get back a one-page technical drawing of it.</b><br>
  Paddings, gaps, corner radii, layers and viewport placement, measured and labeled like Apple's dimensional drawings.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#use-it">Use it</a> ·
  <a href="#make-it-move">Make it move</a> ·
  <a href="#examples">Examples</a>
</p>

---

Apple publishes [dimensional drawings](https://developer.apple.com/accessories/dimensional-drawings/) for every device so accessory makers can build cases that fit. They are calm, dense and beautiful: one sheet, a few views, tiny detail circles, numbers everywhere.

This repo teaches your agent to draw **your components** the same way. A card or a dialog becomes a spec sheet you could hand to anyone and they would rebuild its *architecture*: paddings, gaps, radii, layers, how it sits in the viewport. Copy and content are left out on purpose, so the drawing stays true when the text changes.

## What's inside 🎁

```
skills/
├── dimensional-drawing/          the drawing skill
│   ├── SKILL.md
│   └── examples/                 card + dialog sheets (single HTML files)
└── dimensional-drawing-motion/   turns a sheet into a ~10 s film
    ├── SKILL.md
    ├── templates/                reference scene + stylesheet
    └── adapters/
        ├── claude-motion.md      Claude's Motion artifact (primary)
        └── headless/             Playwright + ffmpeg, no Claude needed
```

### The house rules

| | |
|---|---|
| ⚫️ **Monochrome** | grays only; things are told apart by line weight, dashes and hatches |
| 🧱 **Architecture, not content** | `TITLE SLOT · FLEX`, `ACTION · HUG`, `CONTENT SLOT · FILL` |
| 🔤 **Variables, not numbers** | `S1`, `R2`, `H1 = 2·S1 + H3`, `R2 = R1 − B − S6` |
| 🏷️ **Unbranded** | neutral names like `UI-CARD-001` |
| 🙅 **Never invent values** | unknowns stay `[TBD]` |

## Install

**Claude Code**

```bash
git clone https://github.com/enesozturk/dimensional-drawing
cp -r dimensional-drawing/skills/* ~/.claude/skills/
```

**claude.ai / Claude desktop:** zip a skill folder (for example `skills/dimensional-drawing`) and add it under *Settings → Capabilities → Skills*.

**Any other agent** (Codex, Cursor, Gemini CLI, …): use the [`skills`](https://skills.sh) CLI, or point your agent at the `SKILL.md` files.

```bash
npx skills add enesozturk/dimensional-drawing
```

## Use it

Ask for a drawing and point at the source (a repo file, a Storybook story, a URL, a screenshot):

> Make a dimensional drawing of the `Card` component in `src/components/Card.tsx`

> Draw the anatomy of our settings dialog, same style as the examples

You get a title block with the key variables on top, then one dense sheet: notes, plan view, exploded layers, detail views (nested corner, radii, body), and variable tables.

It works for physical things too (third-angle views, mm, published specs only). Try a thermos 🫖.

## Make it move 🎬

The motion skill animates a finished sheet like a pen drawing it while a camera moves over the paper:

1. close-up on the header as its lines draw in
2. pull back to the plan view while the rest draws
3. layers lift off the plan into the exploded view (strokes first, fills after, so nothing flashes)
4. pull back to the full sheet as the remaining views draw in

The scene is a pure function of time, so it runs in two places:

| | |
|---|---|
| **With Claude** | ask *"animate this drawing"*. Claude builds it in the **Motion** artifact and you export MP4. This is the primary target and where the timing was tuned. |
| **Without Claude** | `cd skills/dimensional-drawing-motion/adapters/headless && npm install`, then `node render.mjs --scene ../../templates/scene-dialog.js --css ../../templates/base.css --out dialog.mp4`. Needs Node 18+ and ffmpeg. |

> [!NOTE]
> Optimized for Claude Motion. The headless renderer is tested with Playwright (Chromium) + ffmpeg. Other animation libraries (Remotion, Motion Canvas, GSAP, Lottie…) are **not tested**.

## Examples

**Dialog**: fixed width, scrim, viewport placement, header controls, footer actions

<img src="https://raw.githubusercontent.com/enesozturk/dimensional-drawing/5c457437c8c83524308aad3b7443e81adcc13153/assets/dialog-sheet.png" alt="Dimensional drawing of a dialog component" width="100%">

**Card**: flexible width, body well, nested corner, shadow envelope

<img src="https://raw.githubusercontent.com/enesozturk/dimensional-drawing/5c457437c8c83524308aad3b7443e81adcc13153/assets/card-sheet.png" alt="Dimensional drawing of a card component" width="100%">

Open the HTML versions in [`skills/dimensional-drawing/examples`](dimensional-drawing/examples). The full film is [`assets/dialog-motion.mp4`](https://raw.githubusercontent.com/enesozturk/dimensional-drawing/5c457437c8c83524308aad3b7443e81adcc13153/assets/dialog-motion.mp4).

## Thanks 💌

- [Apple's accessory dimensional drawings](https://developer.apple.com/accessories/dimensional-drawings/), the north star
- [Andreas Storm](https://x.com/avstorm), whose post started this

## License

MIT © Enes Ozturk. Draw all the things.
