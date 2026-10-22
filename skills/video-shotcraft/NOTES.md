# video-shotcraft — notes

**Source:** [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) @ `43bd349`. Apache-2.0 ([LICENSE](LICENSE)). Same author as [`../../starters/mg-styles-15/`](../../starters/mg-styles-15/NOTES.md). Copied, translated from Chinese and adapted on 22 October 2026.

## What it is

A Claude Code skill for **cinematic product promo films in Remotion**, made from real web-page captures rather than AI video. Its most portable part is a **shot vocabulary**:

- **124 shot recipe cards** covering 150 named shot styles.
- **152 Remotion components** that implement them: deterministic, 30 fps, 1920×1080.

Upstream's README still says 152 cards and 209 previews; those counts predate its October 2026 trim.

| Path | What it is |
|---|---|
| `SKILL.md` | The skill: a read-only product check, then **template mode** (the Ink Press film) or **autonomous mode** (`references/pipeline.md`) |
| `references/shots/<category>/*.md` | The cards (table below). Each has frontmatter (`name`, `summary`, `use_when`, `duration`, `energy`) and sections **Intent**, **Motion core**, **Parameters** (typical value and how it feels when tuned), **Known pitfalls** and **Reference implementation** (the demo file) |
| `references/shots/ATTRIBUTION.md` | Where 38 of the cards' techniques were studied from (see *Provenance*) |
| `references/pipeline.md` | Autonomous mode: brief → design tokens from the product → styleframe → feature-to-shot map → storyboard → Puppeteer capture → per-shot build checked with `remotion still` → sound and beat sync → render, frame QA and an independent final review |
| `references/aesthetic-rules.md`, `final-review.md` | The R/Q/S/C/P aesthetic rules and the independent reviewer's brief |
| `references/music-beat-sync.md`, `sound-design.md` | Beat analysis (librosa via uv) with events pinned to real drum hits as `beatF(n)`; SFX layering and mix |
| `references/sequences/promo-energy-arc.md` | The energy arc of a promo, segment by segment |
| `demos/<category>/…/*.tsx` | One self-contained component per shot; each exports the component and `<NAME>_DURATION` |
| `demos/_fixtures/` | Shared parts: `Look.tsx` (8 palettes, `Stage`, `TextReveal`, `stagger`, `springAt`), `Polish.tsx` (easing, velocity-based `SpeedBlur`, grain, vignette), `Motion.tsx`, `PageCam2D.tsx`, `Fixtures.tsx` (fake UI), `Brand.tsx` (see *Changes*) |
| `assets/lib/` | Reusable components: `PageCam` (2.5D page camera), `ClipCard`, `DigitRoll`, `FlashCut`, `Caption`, `FlatPanel` and `VerticalTicker` (three / R3F), helpers (`mulberry32`, shake, camera) |
| `assets/scripts/capture-template.mjs` | Puppeteer capture: 2× full-page screenshots, element cut-outs and a `layout.json` of element coordinates for the page camera |
| `assets/scripts/smoke-render-demos.py` | Renders the first frame of every demo to catch ones that compile but crash |
| `gallery/api/library.json` | The card index the skill checks card names and style keys against (124 cards, 150 styles, English). Rebuilt from the cards and `gallery/api/styles.json` by `assets/scripts/build-card-index.py` (added here). Motion previews are on upstream's [online gallery](https://vincentwei1021.github.io/video-shotcraft/library.html) |
| `template/` | The Ink Press promo (36 s) as code: a declarative shot table plus title cards, captions, flash cuts and an SFX frame table in `src/aifl/Main.tsx`, with scenes in `src/aifl/live/`, 9 palette themes, `TEMPLATE.md` and `THEMES.md` |

| Card category | Cards |
|---|---|
| typography | 22 |
| ui-entrance | 21 |
| effects | 15 |
| transition | 15 |
| opening | 11 |
| interaction | 11 |
| camera | 10 |
| rhythm | 8 |
| outro | 6 |
| data | 5 |

## When to use it

- **As a shot vocabulary for any route.** A card's **Parameters** and **Known pitfalls** are a timing and easing spec. Give them to an agent building in GSAP, HyperFrames or Three.js as well as Remotion: "do `crash-zoom-punch` with the card's parameters".
- **Lower thirds, titles, transitions and data reveals for news explainers.** typography, transition, data and rhythm are the most broadcast-relevant categories.
- **Product, app or website explainers made from real screen captures.** Use the capture script, the 2.5D `PageCam` and the template.
- **The final-review brief** works for any film and complements [`../../starters/mg-styles-15/rubric.md`](../../starters/mg-styles-15/rubric.md).

## Requirements

- **Remotion licence.** [Remotion's licence](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) is free only for individuals, for-profit companies with up to 3 employees, and non-profits. Anyone else needs a paid **Company Licence**, and production use inside a large broadcaster almost certainly does. Personal experiments are covered by the free licence. Using the cards as specs for GSAP or HyperFrames needs no Remotion licence.
- **Software.** Node 20+, Remotion 4.0.484 with React 19 (`template/package.json`), ffmpeg/ffprobe; `uv` with librosa for beat analysis; Puppeteer for capture. Four demos need `@remotion/motion-blur`, and `FlatPanel`/`VerticalTicker` need three / React Three Fiber.
- **Fonts.** The demos use macOS system fonts (SF Pro, Iowan Old Style, Avenir Next, Futura). Some hard-code SF Pro glyph metrics, so text placement drifts on Windows. Substitute fonts and check stills.

## How to use

**A single shot:**

1. Copy the demo file plus the `_fixtures/` files it imports into a Remotion project.
2. Register it as a `Composition` at 30 fps, 1920×1080, with `durationInFrames` set to its `_DURATION` export (see `demos/README.md`).
3. Change its copy, palette and timing using the card's **Parameters**.

**The skill:** copy this folder into your skills folder (see [`../README.md`](../README.md#installing-a-skill)) and ask for a product video from a site or project, or for one named shot.

**The template:**

```
cd template && npm install && npm run dev
```

## Provenance

**Origins of 38 cards.** `references/shots/ATTRIBUTION.md` says 38 of the cards were studied from publicly released promo films and project home pages, mostly without the rights holders' permission. All of them were re-implemented from scratch with placeholder copy, palettes and UI.

**Where our use differs.** Upstream's position is that techniques are ideas and the concrete expression was not copied. For broadcast, treat a card as a technique, not a look to recreate: do not rebuild a source film's recognisable whole.

**Comments in the code.** Some demo comments still cite timecodes of named third-party promos, as research notes.

## Changes from upstream

**Translated.** `SKILL.md`, all 124 cards plus `ATTRIBUTION.md`, `references/*.md`, `demos/README.md`, `template/TEMPLATE.md` and `THEMES.md` are now English (heading and key names were normalised). Comments inside `.tsx`, `.mjs` and `.py` files are still in Chinese.

**Removed from `SKILL.md` and `pipeline.md`.** Each removed step is replaced by a one-line note:

- instructions to promote or tag the author;
- instructions to submit to the author's showcase;
- sponsor links;
- the Workbench step;
- the JianYing (CapCut China) draft export;
- the Upload-Post social publishing step;
- the guided co-creation mode.

**`demos/_fixtures/Brand.tsx` replaced with a neutral placeholder.** It keeps the same exports, so every demo still compiles, with:

- a generic square mark instead of the upstream logo;
- `your-brand` as the name;
- placeholder taglines.

The fake `praise` testimonials are now explicit "Placeholder quote — replace with a real, attributed quote" strings, so a demo cannot put invented endorsements on screen.

**Checked.** All 158 `.tsx` files under `demos/` (components and fixtures) plus the 9 remotion-only `assets/lib` files pass a strict `tsc --noEmit` (the same command as upstream CI), and `template/` type-checks. Nothing was rendered.

**Still to fix before on-air use.** These 32 files also hard-code the upstream name or its slogans in on-screen text. Replace those strings with your own copy before using one:

- `demos/_fixtures/Fixtures.tsx`
- `demos/camera/graze-face-tour/GrazeFaceTour.tsx`
- `demos/camera/steep-tilt-glide/SteepTiltGlide.tsx`
- `demos/camera/terminal-3d/Terminal3D.tsx`
- `demos/effects/icon-performance-moves/AttentionBounce.tsx`
- `demos/effects/riso-print-hits/RisoMisregistrationHit.tsx`
- `demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx`
- `demos/effects/slam-entrance-moves/ScoreSlam.tsx`
- `demos/interaction/autolayout-gap-dial/AutolayoutGapDial.tsx`
- `demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx`
- `demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx`
- `demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx`
- `demos/opening/dataviz-landscape-open/DatavizLandscapeOpen.tsx`
- `demos/opening/letterspace-materialize/LetterspaceMaterialize.tsx`
- `demos/opening/orbit-ring-title-open/OrbitRingTitleOpen.tsx`
- `demos/outro/grain-dissolve/GrainDissolve.tsx`
- `demos/transition/bottom-push-stack-wipe/BottomPushStackWipe.tsx`
- `demos/transition/page-turn-transitions/BarnDoorSplit.tsx`
- `demos/transition/tear-streak-transitions/GlitchDisplace.tsx`
- `demos/typography/brand-ink-open/BrandInkOpen.tsx`
- `demos/typography/countdown-arc-scatter/CountdownArcScatter.tsx`
- `demos/typography/glitch-cycle/GlitchCycle.tsx`
- `demos/typography/lead-word-zoom-assemble/LeadWordZoomAssemble.tsx`
- `demos/typography/text-column-converge/TextColumnConverge.tsx`
- `demos/typography/type-assembly-moves/LetterformDriftAssembly.tsx`
- `demos/typography/type-entrance-moves/LetterDropPhysics.tsx`
- `demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx`
- `demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx`
- `demos/ui-entrance/draw-svg-trace/DrawSvgTrace.tsx`
- `demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx`
- `demos/ui-entrance/list-reveal/ListReveal.tsx`
- `demos/ui-entrance/product-card-progressive-assemble/ProductCardProgressiveAssemble.tsx`

**Left out:**

- `workbench/` (a CapCut-style editor)
- `jianying-export/` (an unofficial, China-only draft format that also copies machine device IDs into drafts)
- `publish/`, the `gallery/` site (replaced by an English `gallery/api/library.json` built from the cards), `shot-polish/` (redesign history), `videos/`, `agents/`
- `references/workbench.md`, `jianying-export.md`, `publish-upload-post.md`, `guided-free-creation.md`
- `demos/_legacy/` (66 retired shots)
- `template/package-lock.json`
- **All media:**
  - 36 MB of Mixkit audio, whose `ATTRIBUTION.md` cannot trace several files;
  - the template's screenshots and audio;
  - the images in `demos/_textures/` (screenshots of an internal tool; its `live-layout.json` of element coordinates is included, because six demos import it);
  - brand SVGs, covers and sponsor logos.

**Demos that need the screenshot textures.** These 15 load images from `textures/live/` or `legacy-textures/`. Copy upstream `demos/_textures/` into your project's `public/textures/live/` first:

- `demos/_fixtures/PageCam2D.tsx`
- `demos/camera/crash-zoom-punch/CrashImpactReal.tsx`
- `demos/camera/crash-zoom-punch/CrashZoomReal.tsx`
- `demos/camera/depth-layer-moves/MultiplaneReal.tsx`
- `demos/interaction/type-and-filter/TypeAndFilter.tsx`
- `demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx`
- `demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx`
- `demos/rhythm/speed-ramp-freeze/FreezeAnnotateReal.tsx`
- `demos/transition/shot-transitions/WhipBrakeReal.tsx`
- `demos/typography/word-relay-filmstrip/WordRelayFilmstrip.tsx`
- `demos/ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx`
- `demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx`
- `demos/ui-entrance/list-stack-press/ListStackPress.tsx`
- `demos/ui-entrance/page-waterfall-wall/PageWaterfallWall.tsx`
- `demos/ui-entrance/row-embed/RowEmbed.tsx`
