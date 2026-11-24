# ReelForge motion grammar — notes and English guide

**Source:** [gongnyang/reelforge](https://github.com/gongnyang/reelforge) @ `740bf70` (30 Jul 2026), version 0.1.0 (pipeline v7), the reference folders of `skills/reelforge/`. Apache-2.0, © 2026 gongnyang ([LICENSE](LICENSE), [NOTICE](NOTICE)). Copied 24 November 2026. The source files are in **Korean**; technique IDs, code and JSON are in English. This note is our English guide to them.

## What it is

ReelForge is a "keyless" pipeline that turns a one-line brief into a full-bleed motion-graphic film on HyperFrames, and **bans slide grammar** (cards, panels, bullets) at the system level. Its core idea is three layers:

1. **Vocabulary** (`grammar/`): **101 After Effects-style techniques in 8 domains**, each translated to a seek-safe contract: one paused GSAP timeline, GSAP **core only** (no SplitText, DrawSVG, MorphSVG, MotionPath or CustomEase). Every technique has a code sketch, an options table, when to use and avoid it, its intensity band and what it pairs with.
2. **Grammar of choice** (`gallery/ROUTING.md`): which technique for which scene, from the scene's intent, its intensity (0–100) and its mood, with budgets and combination rules. Translated below.
3. **Verified fragments** (`gallery/fragments/`, `gallery-index.json`): **31 HTML choreographies** that passed real renders in three presets (blank, frozen-motion and low-contrast checks). Each has a `.meta.json` with its intensity band, arc fit, duration range, **copy slots with character limits**, and a **keep / mutate contract** (e.g. `netflix-converge` keeps the phase structure, eases, golden-angle scatter and lockup impact; you may change copy, duration, accent colour and scatter radius).

"What is not verified is not vocabulary": a scene uses a stamped fragment, or is marked *sketch-authored* and gets stricter review.

### The 101 techniques

| Domain | Count | Covers |
|---|---|---|
| [01 anchor-transform](grammar/01-anchor-transform.md) | 12 | transform-origin as the pivot: hinge, seesaw, orbit, null-parent rig, pendulum decay, anchor relay |
| [02 easing-graph](grammar/02-easing-graph.md) | 13 | AE graph-editor tension in core eases: overshoot-settle, anticipation wind-up, elastic, bounce, weighted deceleration, hold keyframes, per-axis eases, tangent hand-off across a cut |
| [03 camera-3d](grammar/03-camera-3d.md) | 12 | depth planes and a virtual camera: 3-plane parallax, multiplane dolly, turntable, dolly-zoom, whip-pan, crane, rack focus, depth fog, a GPU compositing budget |
| [04 masks-mattes](grammar/04-masks-mattes.md) | 15 | clip-path, mask-image and track-matte reveals: inset, diagonal, iris, soft gradient, spotlight, text clip, blinds, word-clip stagger, negative space, collage |
| [05 text-animator](grammar/05-text-animator.md) | 12 | AE text animator: range-selector stagger, tracking, cascade wave, flipboard, blur dissolve, typewriter, title converge, line mask, word swap, emphasis pop |
| [06 shapes-strokes](grammar/06-shapes-strokes.md) | 12 | trim paths with dashoffset: draw-on, trace-then-fill, underline sweep, progress ring and bar, path morph, connectors, line-chart trace, checkmark |
| [07 stylize-time](grammar/07-stylize-time.md) | 13 | glow, chromatic aberration, VHS, seeded grain, scanlines, light sweep, light leak, speed ramp, motion echo, flash frame, strobe, vignette pulse |
| [08 transitions-advanced](grammar/08-transitions-advanced.md) | 12 | cuts with meaning: match cuts (position, graphic), zoom through a portal, whip-pan, colour-block wipe, iris, motion-vector inheritance, axis of action, light-flash join, scale continuity |

The full ID list is in [`grammar/00-INDEX.md`](grammar/00-INDEX.md). The 31 fragments: typography 8 (cascade wave, demote/promote arrow, glitch swap, line mask reveal, Netflix-style converge, scale slam strike, tracking open, typewriter), camera 4 (eye shift, multiplane push, orbit turntable, 3-plane parallax), data 3 (count-up punch, line-chart trace, progress ring), object 4 (hero overshoot strobe, connector-tree cascade, trace-then-fill, blinds triplet), atmosphere 2 (glow pulse, grain flip), seal 2 (checkmark lockup, rail lockup sweep), and 4 transition **pairs** with an out-half and an in-half each (light flash, match cut, whip-pan, zoom portal).

## ROUTING, in English

### §0 The arc

`intensity` (0–100) adds up a scene's motion, visual density and narrative pressure. Pick an arc preset, place each scene in its envelope, then quantise to the bands 0–40 / 40–70 / 70–100.

| Arc | Hook | Build | Peak | Resolve |
|---|---:|---:|---:|---:|
| `ramp` | 15–30 | 35–55 | 75–95 | 35–50 |
| `double-peak` | 25–45 | 60–80 (first peak) | 85–100 (second) | 40–55 |
| `cliff` | 15–30 | 30–45 | 90–100 | 20–35 |
| `steady-pulse` | 40–55 | 50–65 | 65–80 | 45–60 |

Bands map to moods: **0–40 calm** (restraint, afterglow; no peak vocabulary), **40–70 tech or luxury** (raise only information density or weight), **70–100 hype** (drops and impacts only; spends the peak budget). With music, scene boundaries fall on whole bars and the peak on the drop; without music, scenes default to 2–4.5 s.

### §A Intent × intensity

| Scene intent | 0–40 | 40–70 | 70–100 |
|---|---|---|---|
| **Declare** (hero, title, one-line claim) | mask-line-slide-reveal · tracking-kerning-tween · blur-dissolve-in | range-selector-stagger-map · bg-clip-text-shape · inset-wipe-reveal · door-hinge-open | netflix-title-converge · camera-orbit-turntable · glow-pulse-halo + light-sweep-sheen |
| **List** (items, chips, groups) | null-parent-rig · dual-layer-counter-move | blinds-stripe-reveal · mosaic-matte-collage · axis-isolated-transform-stack | blinds-stripe-reveal + line-sweep-diagonal-stripes · scale-jump-stairstep |
| **Contrast** (A vs B, before/after) | seesaw-fulcrum-tilt | edge-flip-reveal · seesaw-fulcrum-tilt · silhouette-negative-space-match | matte-invert-negative-space · silhouette-negative-space-match |
| **Data** (stat, chart, counter) | divider-rule-expand · progress-bar-linear-segmented | progress-ring-radial · animated-line-chart-trace · easy-ease-linear-hold-usage + hold-keyframe-stepped-values · checkmark-success-tick | anticipation-windup-chain + vignette-impact-pulse · glow-pulse-halo |
| **Hard turn** (scene-boundary cut) | iris-portal-threshold · light-flash-join · match-cut-position-carry | shape-wipe-color-block · axis-of-action-pan-handoff · match-cut-graphic-analogy · object-scale-continuity | whip-pan-directional · speed-ramp-blur-flash · zoom-through-portal · dolly-zoom-vertigo |
| **Linger** (hold, living motion, breath) | offset-origin-idle-breathe · ambient-parallax-breathing · mask-spotlight-drift · depth-fog-atmospheric-falloff · pendulum-decay-swing | light-leak-film-burn · light-sweep-sheen · glow-pulse-halo (breathing) | none: lingering tops out at 40–70 |
| **CTA** (call to action, confirm) | underline-emphasis-sweep · selective-emphasis-pop | anticipation-windup-chain · trace-then-fill · checkmark-success-tick · iris-circle-directional | anticipation-windup-chain + vignette-impact-pulse · glow-pulse-halo + light-sweep-sheen |

The standard **counter slam** (data or CTA, 70–100): wind-up → count up → one glow or vignette pulse on the landing.

### §B Mood filter (the "avoid" column removes a technique even if §A offers it)

| Mood | Prefer | Avoid |
|---|---|---|
| **Calm** (premium, wellness, emotional) | line mask, tracking, blur dissolve, soft gradient wipe, idle breathe, ambient parallax, depth fog, light leak, iris portal | whip-pans, speed-ramp flash, glitch cuts, VHS, strobe, flash frames, bounce, elastic, dolly-zoom |
| **Tech** (cyber, SaaS, systems) | static chromatic aberration, scanlines, hold keyframes, linear/snap eases, flipboard, progress ring, connector draw, typewriter | bounce, elastic, light leak, stair-step scale jumps |
| **Hype** (sport, trailer, reels) | whip-pans, speed ramps, diagonal wipes and stripes, glitch cut, strobe, flash frame, vignette pulse, motion echo, dolly-zoom, title converge, scale jump | soft gradient wipes, too much ambient idle |
| **Luxury** (high-end product) | tracking, line mask, shimmer text clip, light sweep, soft wipe, turntable, subtle glow, weighted deceleration, iris portal | every glitch effect, bounce, elastic, whip-pans, film grain |

### §C Budgets per film

- **Peak band (70–100): 1–2 uses per film.** Dolly-zoom once per scene, finished in 0.6–1.0 s, 1–2 per film. Whip-pans and speed-ramp flashes: 60–70 % of the main transitions should be calmer. Strobe and flash frames: bursts under 3 s, never repeated often (photosensitivity). Glitch cuts and VHS: never held over 3 s. Zoom portal and title converge: once, at the opening or the climax. Light-flash joins: chapter boundaries only.
- **Standard band (40–70): 2–3 uses**; a fourth use of the same ID becomes a similar ID.
- **Calm band: unlimited**, but one living-motion layer per scene.
- **Emphasis once per scene** (one emphasis pop or underline sweep, one target).
- **Transitions:** settle on 2–3 kinds per sequence and vary them.

### §D Combination rules inside a scene

1. One camera move per scene (dolly, orbit, crane or dolly-zoom on top of the parallax planes, never two).
2. Split transform ownership: the camera on the outer wrapper (GSAP), ambient drift on an inner child (CSS); never GSAP and CSS keyframes on the same element.
3. Ambient drift off while the camera moves.
4. One way in per scene; if the last scene faded in, this one reveals differently.
5. Do not stack stagger vocabularies (word-clip stagger or range-selector stagger with blinds).
6. **No overshoot on opacity**: back, elastic and bounce eases only on scale, x, y and rotation; fades are separate monotonic tweens.
7. Transitions are exit/enter anchor pairs: both fragments declare the same normalised anchor (0–1) in `window.__anchors`; colours change by `tl.set` only.
8. Motion-vector inheritance always: what leaves left enters from the left; pair the exit's ease-in with the entry's ease-out as one curve.
9. preserve-3d safety: one perspective at the top, preserve-3d on every level, opacity and filters on the outer wrapper, not on elements with 3D children.
10. Infinite loops in CSS only (`infinite alternate` with a `--rf-scene-start` delay); never GSAP `repeat: -1`, which breaks seeking.

## Other numbers worth keeping

From [`design-direction.md`](design-direction.md) and [`strip-qc.md`](strip-qc.md):

- **30 s film:** 7–10 scenes of 3–4 s, **at most 12 cuts**; alternate 2–2.5 s scenes with 4–5 s number or quote scenes; never the same layout three times running. Scene 1 shows its strongest picture **within 1.8 s** (no logo, greeting or empty build-up); the last 3 s pay off the promise. Default transition is a cut; slides and wipes 0.2–0.25 s at chapter boundaries only; crossfades at most 1–2 per 30 s, ≤ 0.5 s.
- **UI timings do not transfer to film:** entrance 200–300 ms becomes 0.5–0.9 s, exit 150–200 ms becomes 0.3–0.5 s, stagger 20–40 ms becomes 60–150 ms, a 100 ms micro-interaction becomes a 0.25–0.35 s settle punch.
- **Reading budget:** on-screen text ≤ 20 characters per second, shown ≥ 0.83 s and ≤ 7 s. Reading time = 0.5 s + headline characters / 12 (+ 0.4 s per extra reading unit). Motion budget = scene length − reading time: under 0.8 s, drop to a fade and skip the develop motion ("when the copy is long, give up the motion"); 1.5 s or more allows enter-develop-exit; text that is still entering does not count as readable.
- **13 amateur tells** (strip QC on a 1 fps strip): frozen after entry; one ease and duration for everything; everything appears at once; ease-in entrances; overshoot past `back.out(1.7)` or elastic on text and charts; more than 12 cuts in 30 s; breaking the reading budget; tweening box-shadow or filter per frame (pre-render the glow and animate its opacity); two accent hues in a scene; crossfades over 0.5 s; drop shadows on dark canvases; three or more competing motions; an opening without a hook. Every scene needs enter / develop / exit, exits shorter than entries.

## When to use it

- **As a vocabulary and decision table for any GSAP or HyperFrames film**: name the scene's intent, pick the band from the arc, look up §A, filter by §B, check §C and §D. It fits the news explainers well (declare, data, contrast, hard turn). Write the technique ID into the storyboard so the build and the review talk about the same move.
- **The fragments are working HyperFrames sub-compositions** you can read and adapt; their `<template>` markup, `--rf-*` tokens and `window.__anchors` follow the contract in [`scene-authoring.md`](scene-authoring.md).
- Pairs with [`skills/hyperframes-motion-reel/`](../../../skills/hyperframes-motion-reel/NOTES.md), [`docs/guides/explainer-grammar/`](../explainer-grammar/NOTES.md) (VO-led explainers) and [`skills/saas-motion-video/`](../../../skills/saas-motion-video/NOTES.md) (variety audit).

## Running the full pipeline

The engine (`bin/vf`: compiler, Studio, TTS and image runners, gates, `direction-lint`, `gallery-verify`) is not copied; clone upstream to use it. Korean TTS and Korean copy are its defaults.

```bash
git clone https://github.com/gongnyang/reelforge && cd reelforge && npm ci --ignore-scripts
mkdir -p tmp/smoke && cp fixtures/golden-specs/minimal-3scene/scene_specs.json tmp/smoke/
node bin/vf pipeline run tmp/smoke --profile mock         # tts → images → compile → render → gate
node scripts/direction-lint.mjs demos/v7-showcase
```

**Tested here 24 November 2026** on a clone at `740bf70`: the mock pipeline ran every step (mock TTS, compile, HyperFrames 0.7.26 render, gate) and wrote a 720 KB `out/main.mp4`; `direction-lint` passed the v7 showcase; `gallery-index.json` lists the 31 stamped entries. `gallery-verify` and the Studio were not run.

## Changes from upstream

- **Copied:** `grammar/` (9 files), `gallery/` (`ROUTING.md`, `GALLERY.md`, `gallery-index.json`, 31 fragments with their meta files), `design-direction.md`, `strip-qc.md`, `scene-authoring.md`, and the skill's `SKILL.md` as `upstream-SKILL.md` (it drives the engine, so it is kept for reference rather than installed). Unchanged, in Korean.
- **Left out:** the engine (`bin/`, `src/`, `scripts/`, `schemas/`, `vendor/`), `codex-runner.md`, fonts, demos, showcase media, fixtures and tests.
- **Added:** this `NOTES.md` (English guide and translation of `ROUTING.md` §0–§D).
