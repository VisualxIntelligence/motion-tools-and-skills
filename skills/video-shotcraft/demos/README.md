# demos/ — Reference Implementation Source for Shot Cards

Most shot cards point to this directory in their "Reference implementation"; you must read the card first, then locate the exact
demo file from its explicit path, and you must not assume a directory structure from the card name alone. The components here are tuned Remotion implementations —
**when using a card, read the exact source first** (SKILL.md principle 5).

`_legacy/` (not included in this copy) is kept only for old workbench projects, for shots that have been taken down; it is not part of the current shot library and is not for picking cards for new films;
it does not take part in the asset library, the gallery or the sample-film smoke scan, and for compatibility notes see `_legacy/README.md` (upstream only).

How to use: copy the .tsx you need into your Remotion project (30fps / 1920×1080) and
register it as a Composition and it runs. Every component does `export const <Stem>: React.FC` and also exports
`<UPPER_SNAKE>_DURATION` (frame count at 30fps), which you use directly when registering:

```tsx
import { BlurSlide, BLUR_SLIDE_DURATION } from './blur-slide/BlurSlide';
<Composition id="BlurSlide" component={BlurSlide}
  durationInFrames={BLUR_SLIDE_DURATION} fps={30} width={1920} height={1080} />
```

All animation is a pure function of the frame (no true randomness / no Date), rendered deterministically frame by frame. In 2026-10 the whole library went through two rounds of revised-version comparison,
and for each shot the author chose one of the original / first version (finish polish) / second version (finished-film-grade redesign) to lock in, and removed 66 shots
(decision record `shot-polish/decisions.json`). A brand replacement followed: the logos / brand names appearing on screen are uniformly
video-shotcraft, and suitable copy was changed to its slogan — when using it for your own product, just swap the pieces in `Brand.tsx` for your own mark and copy. In this copy, replace `_fixtures/Brand.tsx` with your own mark before using any demo on air.

Shared dependencies (when copying a demo, bring along those it uses and change the import paths):

- `_fixtures/Brand.tsx` — video-shotcraft brand pieces: the "镜刻" (Shotcraft) mark `<ShotcraftMark>` (can be drawn on in segments), the wordmark
  `<ShotcraftWordmark>`, the brand colour `BRAND`, and the promotional copy library `PITCH` (spec in `assets/brand/BRAND.md`). Depends only on react.
- `_fixtures/Look.tsx` — the second round's visual system: 8 palettes `LOOKS` (dark scenes midnight / aurora / ember / graphite / lime,
  bright scenes paper / porcelain / sand), the type-size ladder `TYPE` and `type()`, a stage `<Stage>` with key light / rim light / horizon light band / vignette / grain,
  a perspective grid floor `<GridFloor>`, deterministic floating dust `<Dust>`, a single sheen sweep `<Sheen>`,
  per-character / word / line reveal `<TextReveal>`, and `stagger` / `springAt` / `glow`. The second-version demos all import it; it depends on `./Polish`.
- `_fixtures/Polish.tsx` — finish utility pieces: Bezier easing `EASE` / `ramp` / `mix` / `velocity`, directional blur by speed
  `SpeedBlur`, the `softShadow` / `hairline` / `surface` material helpers, and `Grain` / `Vignette` / `Backdrop`. Depends only on remotion + react.
- `_fixtures/Fixtures.tsx` — fake UI scene pieces (FakeDashboard / Card / TitleBlock / G palette), whose sidebar / top bar are
  the video-shotcraft mark and name (depends on `./Brand`). About twenty of the demos locked in as first version / original use it.
- `_fixtures/Motion.tsx` — `DesignStage` in 480×270 design coordinates + the E easing table / seg / lerp / rand / useT.
  Used by the Motion-family demos locked in as original / first version (fracture, bezier-source-converge-merge, radial-wave and a dozen or so more).
- `_fixtures/PageCam2D.tsx` — a 2.5D page camera (the same coordinate math as the template's PageCam, self-contained).
  Used by spotlight-hero-card / type-and-filter / row-embed / list-stack-press / outro-group-photo-launch.
- `_textures/` — real page screenshots and `live-layout.json`. Demos that use `staticFile('textures/live/xxx.png')`
  (both styles of crash-zoom-punch / depth-layer-moves / the sudden-brake whip-pan of shot-transitions / the freeze-frame annotation of speed-ramp-freeze /
  spotlight-hero-card / type-and-filter / deck-deal-flyin / row-embed / list-stack-press /
  document-typewriter-reveal / page-waterfall-wall / outro-group-photo-launch) require that the same-named files under `_textures/`
  be copied to your project's `public/textures/live/`. The screenshots represent the "product's existing pages" (aesthetic rule Q1); the site name in the page header has been changed to
  the video-shotcraft mark + wordmark (the weekly report page title is Shotcraft Weekly), and the other page content is untouched.

A few demos use `@remotion/motion-blur` (CameraMotionBlur), which requires
`npm i @remotion/motion-blur`. The list (4 files / 4 cards):

- `camera/space-camera-moves/DroneDiveLanding.tsx`
- `opening/crane-rise-reveal/CraneRiseReveal.tsx`
- `opening/fracture/Fracture.tsx`
- `opening/magician-card-flourish/MagicianCardFlourish.tsx`

All other fast motion uses directional blur computed from measured speed (`SpeedBlur` or a local implementation) — CameraMotionBlur's multi-sampling
is expensive, and on near-static frames it tints the whole picture grey/yellow.

Fonts: only system font stacks are used (macOS built-in fonts such as SF / Helvetica Neue / Iowan Old Style / Avenir Next Condensed / Futura),
with no dependence on `@remotion/google-fonts`. A few demos hard-code character widths / character-centre coordinates measured on the local SF Pro (such as letter-drop-physics,
letterform-zoom, beat-step-list-theme-cycle, pill-chip-slot-cycle-handled); when changing the font or size, re-measure following the comments;
variable-weight animation (font-weight-pump) depends on the system variable font, and without it degrades to stepped weights.

## Real video material (ClipCard, assets/lib/ClipCard.tsx)

All 152 shot cards in the library originally assumed the subject was DOM/SVG-generated content or a page screenshot, and not one could
directly carry real mp4 material. `assets/lib/ClipCard` fills in this form: it wraps a video in a rounded-corner "card",
so that the camera-move skeletons tuned for rectangular card elements (spotlight-hero-card /
magician-card-flourish / neon-frame-orbit-drop / quad-split-parallel-scenes)
drive real footage as they are. Just copy `assets/lib/ClipCard.tsx` into the project to use it.

```tsx
import { ClipCard } from './assets/lib/ClipCard';

// Put the material at public/clips/demo.mp4; when the material is shorter than the shot, pass loopDurationInFrames to turn on
// a cross-fade loop (OffthreadVideo has no loop prop and freezes when it finishes playing)
<ClipCard src="clips/demo.mp4" size={560} caption="AI generated"
  loopDurationInFrames={60} durationInFrames={120} />
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `src` | Required | Video path under public/ (resolved by staticFile) |
| `caption` / `captionSize` | None / 17 | Mono sub-line below the card; for small cards / distant camera positions raise captionSize to ≥32px (Q11) |
| `size` / `radius` | 560 / 20 | Card side length (for square material) / corner radius |
| `muted` | true | When `false`, the loop cross-fade audio is complementary, so two full-volume tracks are not stacked |
| `startFrom` | 0 | Which frame of the video to start playing from (trim) |
| `loopDurationInFrames` | None | Playable length of the video (composition frames) → turns on looping |
| `loopCrossfadeInFrames` | 8 | Number of overlapping cross-fade frames of the loop layers |
| `durationInFrames` | Composition duration | Duration of the enclosing shot — **be sure to pass it**, otherwise a short shot embedded in a long project generates invisible layers |

Known pitfalls:
- When `durationInFrames` is not passed, the number of layers is computed from the Composition's total duration (the short-shot-in-long-project problem).
- When `startFrom` ≥ the playable length, or step < crossfade, it automatically falls back to single-layer playback (no loop).
- Looping material is recommended at 30fps and square (the camera-move skeletons are calibrated for square cards).

Reference demo: `demos/ui-entrance/clipcard-looping/ClipCardLooping.tsx`
(regression of three scenes: muted=false loop, startFrom>0 + loop, short Sequence in a long Composition).

## Testing and verification

1. **Type compilation** (the verify job of `pr-checks.yml`): all of `find demos -name '*.tsx'`
   goes through `tsc --noEmit --strict`. A newly added demo must pass strict compilation.
2. **Render smoke test** (`assets/scripts/smoke-render-demos.py`): scans all demos that have a duration
   export (`_DURATION` / `_DUR`), automatically generates `template/src/smoke-root.tsx`
   to register them all, renders the first frame of each with `remotion still`, and asserts the output is non-empty and the process does not crash —
   plugging the hole of demos that "compile but cannot run" (such as an illegal composition id, a missing runtime import,
   a missing texture). To run the full set locally:

   ```bash
   # Needs the template dependencies + motion-blur (installed temporarily in CI)
   cd template && npm ci && npm i --no-save "@remotion/motion-blur@$(node -p "require('./package.json').dependencies.remotion")"
   cd .. && python3 assets/scripts/smoke-render-demos.py        # full set
   python3 assets/scripts/smoke-render-demos.py --subset BlurSlide,GlitchCycle  # subset
   python3 assets/scripts/smoke-render-demos.py --list          # list renderable demos
   ```

   When `--subset` points to a demo that does not exist / is not found, the script exits with code 1 (an explicit error).
   Demos that need real mp4 material (such as ClipCardLooping, which uses `public/clips/`) are skipped
   and reported in the output, without blocking the full run.

(These media are not in this repo; fetch them from upstream https://github.com/Vincentwei1021/video-shotcraft at commit 43bd349.)
