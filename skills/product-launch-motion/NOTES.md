# product-launch-motion — notes

**Source:** [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) @ `edbfb10` (21 Oct 2026), v2. MIT, © 2026 Abubakr Chan ([LICENSE](LICENSE)); the [NOTICE](NOTICE) says the MIT grant covers the writing and code only, not the sample films. Copied 24 November 2026. (Listed as an unreviewed lead in `docs/reference-only.md` since the fourth survey.)

## What it makes

**A product launch film from a URL**, in the "one shape, never cut" style of Dribbble-level UI motion: one element morphs through every UI state (button → loader → check → dynamic island → reel → slider → toggle → tabs → chart → ⌘K palette → toast), a cursor drives every change, the camera frames each state, and the cut lands on the music. v2 is plain HTML computed from time with closed-form springs, music-first timing, and real motion blur from Playwright sub-frames averaged in ffmpeg. The author's films (Cheerful, and the Arabic *Hoopoe Club*) are linked from the upstream README.

The rules it enforces, each from a review note on a real film:

- **One shape, never cut.** Transitions are morphs, camera pushes, or zooms into an element that becomes the next scene.
- **Blur content swaps.** Text inside a morphing container exits short and early, then the new text springs in; nothing overlaps.
- **Springs with a tiny overshoot at most** (damping 0.72–0.9 for UI, 1.0 for camera and text). Toggle knobs and tab indicators stretch because their two edges ride different springs.
- **A cursor drives everything**: real clicks (press scale, ripple), real drags that spring back; the product's agent can take over as a second, named cursor.
- **The camera frames every state** (an empty frame is a bug); pull-backs reveal scale. Zoom in log space.
- **Music first.** Beat grid measured with numpy, the drop on the big moment, every synthesised UI sound placed by its own measured peak.
- **Real data** on odometers, customer logos slammed one per beat, nothing copied from the product's website. The skill logs its creative calls as `DECISION:` lines you can overturn.
- **Gotchas:** never `will-change` on anything the camera scales (blurry text); a target that must *arrive* at T is issued one settle-lead early; size odometer slots to the final glyph.

`references/prompts.md` holds the author's prompts verbatim, in order: they are the spec. `references/technique.md` holds the code patterns. `legacy/` is v1 (GSAP + HyperFrames, voice-over-led, word-locked sync) with its 12 references, scripts and case study.

## When to use it

- **UI-led launch or feature films** where the product's interface is the hero and there is no presenter: AI tools, SaaS features, the "how it works" beat of a LinkedIn explainer.
- **Not** for news packages with a voice-over; it is music-first. For voice-led films use [`html-explainer-video`](../html-explainer-video/NOTES.md) or v1 in `legacy/`.
- Beside [`cinetic`](../cinetic/NOTES.md) (copy-first launch films with templates) and [`saas-motion-video`](../saas-motion-video/NOTES.md) (a 7-stage process with a variety audit): this one is the most specific about micro-interaction craft.

## Requirements

Node with Playwright (Chromium), ffmpeg, Python 3 with numpy. Nothing is bundled. v1 in `legacy/` also needs GSAP and HyperFrames.

**The reference implementation is not shipped.** `technique.md` points at the author's own `~/code/cheerful-motion/` folder (`film.js`, `audio.py`, `render.mjs`…), which is private. The patterns are complete enough to rebuild from, and we added two tested helpers:

- **`scripts/motion-kit.mjs`** (ours, MIT): `stepR` closed-form springs, `Track` (one spring per target change, with `atLoop` for seamless loops), `settleLead`, `vis`/`applyVis` blur content swaps, `stretchEdges` (leading and trailing edges on different springs), `odometerDigit`, `logZoom` and `subT` sub-frame times. ES module, works in the browser and in Node.
- **`scripts/subframe-blur.sh`** (ours, MIT): the technique's ffmpeg `tmix` command as a script; N sub-frames per frame in, 60 fps H.264 with BT.709 tags out.

**Tested here 24 November 2026:** `node --test scripts/motion-kit.test.mjs` passes 10 tests (settling, overshoot only below damping 1, loop continuity, stretch, odometer carry, centred sub-frames, log zoom). `subframe-blur.sh` turned 240 sub-frames of an ffmpeg test pattern into a 60-frame, 60 fps BT.709 MP4. No film was made.

## Changes from upstream

- **Copied:** `SKILL.md`, `references/`, `LICENSE`, `NOTICE`, and `legacy/` (`SKILL.md`, `CASE-STUDY.md`, `references/`, `scripts/`, `assets/`, `evals/`). Unchanged.
- **Left out:** `examples/` (preview WebPs of the Cheerful and Hoopoe Club films, 23 MB, not covered by the licence), `legacy/still-1.jpg` and `legacy/film-preview.webp` (Cheerful's, shown with permission only), the README.
- **Added:** `scripts/motion-kit.mjs`, `scripts/motion-kit.test.mjs`, `scripts/subframe-blur.sh` and this `NOTES.md`.
- `SKILL.md` is written as one director's taste ("how Chan wants launch films made"); read "Chan" as "the creative director" and swap in our own brief.
