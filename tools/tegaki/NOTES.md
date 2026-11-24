# Tegaki — notes

**Source:** [gkurt/tegaki](https://github.com/gkurt/tegaki) @ `bf18556` (5 Nov 2026), version 1.1.0. MIT, © 2026 Gokhan Kurt. Read 24 November 2026. **Nothing copied:** install from npm (`tegaki`). Docs and a font studio: <https://tegaki.ink/>.

## What it does

**Handwriting animation from any font**: text draws itself stroke by stroke with natural timing, with no hand-authored paths. It works out a pen path for each glyph from the font outline, then draws it, clipped to the letter shape.

- **Shaping with HarfBuzz** (bundled as WASM): ligatures, **Arabic joining**, right-to-left text and Devanagari come out right.
- **13 bundled fonts**: Caveat, Italianno, Tangerine, Parisienne (Latin); **Amiri (Arabic + Latin)**; Suez One (Hebrew); Tillana (Devanagari); Klee One (Japanese); Nanum Pen Script (Korean); Atma (Bengali); LXGW WenKai (Chinese); and two single-line plotter fonts, Hershey Script and EMS Allure. Any other font goes through the studio to make a bundle.
- **Plugins**: `glow`, `taper`, `strokeGradient`, `globalGradient`, `variation`, `boil` (hand-drawn wobble, seeded), `annotate`.
- **Renderers** for React, Vue, Svelte, Solid, Astro, Web Components and vanilla JS (`tegaki/core`), plus a **CLI** that writes a self-drawing SVG (`loop`, `once` or `static`).
- **Controlled time** for video: `time={{ mode: 'controlled', value: progress, unit: 'progress' }}` makes the drawing a pure function of a 0–1 progress value, so a Remotion frame, a GSAP timeline or a `seek(t)` page can drive it frame-exact. Upstream has a Remotion example (`examples/remotion/`) and an Editframe one.

## When to use it

- **Handwritten titles, signatures, annotations and notes** in explainers: a word written on screen as the voice says it, a circled figure, a name signed at the end. The Arabic support makes it rare among these tools: most handwriting effects break Arabic joining.
- A pen-written lower third or chapter card, and the "hand-drawn notes" look beside [`painted-animation`](../../skills/painted-animation/NOTES.md) or the `sketch-notes` style in [`starters/hyperframes-motion-library`](../../starters/hyperframes-motion-library/NOTES.md).
- Bundled fonts are OFL; check the licence of any font you bundle through the studio.

## Using it

```bash
npm install tegaki
npx tegaki "مرحبا بالعالم" --font amiri --mode once -o title-ar.svg
npx tegaki "Breaking news" --font caveat --mode once --stroke-easing ease-in-out-cubic --plugins '["taper"]'
npx tegaki --list-fonts
```

In a frame-exact page (React shown; `tegaki/core` and `tegaki/wc` take the same `time` option):

```tsx
import { TegakiRenderer } from 'tegaki';
import amiri from 'tegaki/fonts/amiri';
// progress = 0..1 from your clock (Remotion: interpolate(frame, [start, end], [0, 1]))
<TegakiRenderer font={amiri} text="مرحبا" time={{ mode: 'controlled', value: progress, unit: 'progress' }} />
```

The CLI's animated SVGs use SMIL `<animate>`. To capture one frame-exact, pause it and seek it in the page before each screenshot: `svg.pauseAnimations(); svg.setCurrentTime(t)`. For anything in a film, prefer the renderer with controlled time.

**Tested here 24 November 2026** (tegaki 1.1.0 from npm):
- `tegaki "مرحبا بالعالم" --font amiri --mode static` wrote a 57 KB SVG. In Chrome it showed **correctly joined Arabic, right to left**.
- `--font caveat --mode once` wrote a 98 KB SVG with 20 SMIL animations, one per stroke group.
- The React renderer and controlled time were not tried.
