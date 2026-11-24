# huashu-design motion references — notes and English guide

**Source:** [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) @ `5906569` (23 Nov 2026), version 3.5.0: 14 of the skill's reference files. MIT, © 2026 alchaincyf (花叔 · Huashu) ([LICENSE](LICENSE)). Copied 24 November 2026. The files are in **Chinese**; this note is our English guide. The same author's huashu-art-motion is already in the repo ([`explainer-grammar`](../explainer-grammar/NOTES.md), [`tools/film-analysis/`](../../../tools/film-analysis/NOTES.md)).

## What it is

huashu-design is a broad design skill: launch animations, clickable app prototypes, editable PPT decks, infographics, App Store screenshots and Xiaohongshu carousels, with a 92-style library and "three directions from six candidates". It is a direct alternative to our [`design/`](../../../design/README.md) category and is best installed whole (`npx skills add alchaincyf/huashu-design`; 49 MB with its assets). What we copied is its **motion knowledge**: the references that apply to any code-made film, whatever the engine.

| File | What it covers |
|---|---|
| [`animation-best-practices.md`](references/animation-best-practices.md) | The positive grammar: identity and taste, the five-part rhythm, eases, eight motion principles |
| [`animation-pitfalls.md`](references/animation-pitfalls.md) | 13+ traps from real HTML animation renders (below) |
| [`camera-language.md`](references/camera-language.md) | Camera moves as a **budget**, not an effect; zoom vs dolly; a 2.5D camera rig; the zoom duration formula |
| [`cinematic-patterns.md`](references/cinematic-patterns.md) | Workflow demos: dashboard + cinematic overlay, scenes not steps, a separate visual language per demo, `?seek=N` debugging |
| [`launch-film-director-notes.md`](references/launch-film-director-notes.md) | Write a long director's note before animating: statement, visual system, story arc, shot-by-shot storyboard (60 % of it), production manifest |
| [`storyboard-basics.md`](references/storyboard-basics.md) | Eleven laws for a frame: every shot is first a moving cover image |
| [`ui-demo-animation.md`](references/ui-demo-animation.md) | Eight ways to show product UI, and when to film real screenshots vs rebuild the UI in HTML |
| [`gsap-recipes.md`](references/gsap-recipes.md) | The rules above as GSAP timelines: ease mapping, baked seek-safe springs, the five-part skeleton |
| [`audio-design-rules.md`](references/audio-design-rules.md) | BGM + SFX as two tracks, the mix ratios, SFX density and cue priority, BGM decision tree, recipes |
| [`sfx-library.md`](references/sfx-library.md) | An index of 37 UI SFX by category (keyboard, UI, transition, container, feedback, progress, impact, magic, terminal), with pairings per scene |
| [`hyperframes-backend.md`](references/hyperframes-backend.md) | When to render with HyperFrames, porting an old demo, transparent overlays |
| [`video-export.md`](references/video-export.md) | HTML → MP4, 60 fps and GIF; seek-based deterministic render |
| [`ai-video-review.md`](references/ai-video-review.md) | An AI review loop for a finished film: checklist, severities, limits |
| [`module-motion.md`](references/module-motion.md) | The skill's entry page for animation and video work |

## The rules worth carrying over

- **Rhythm: Slow-Fast-Boom-Stop** in five parts: trigger ~15 % (slow, let the viewer settle), generation ~15 %, process ~40 % (fast, dense), boom ~20 % (pull-back, 3D pop-out, panels flooding in), landing ~10 % (logo, and **stop dead**, do not fade out). For 15 s: 2 / 2 / 6 / 3 / 2 s. Even pacing and constant high density are both failures. Check: sketch the peak frame of each part; if the five look alike, there is no rhythm.
- **Eases:** never linear. Default `expoOut` = `cubic-bezier(0.16, 1, 0.3, 1)`; overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)` for toggles and buttons only. Show **the process, not a magic result** (the product as a collaborator, not a one-click trick). Hand-drawn cursor paths: arcs plus Perlin jitter. A logo that **morphs or converges** in the last 1–2 s collapses the story onto the brand. Serif + sans pairing. No pure black or white grounds.
- **Camera as a budget.** What the viewer must see stays in frame (8 % margin). At least **2.6–3.0 s between camera changes** (5 s in restrained mode); **at most 4–5 changes in any 15 s** (3 restrained); ≤ 4–6 shots a minute; zoom between **1.25× and 2.3×** (1.8× restrained; 1.06× only for an opening establishing creep). **Zoom duration = 0.55 × |ln(z₂/z₁)| / ln 2, clamped to 0.30–0.94 s** (1→2× is 0.55 s), so every zoom has the same visual speed. Frame a target with `scale = 0.8 / max(normalised width, height)`. When unsure: slower, and don't move the camera.
- **Storyboard laws:** every shot passes a cover test (it works as a still); a zoom ends on a concrete anchor; eyelines and arrows script the camera; words and pictures on two separate tracks; positions in percentages; foreground, middle and background are the three parallax layers; set up the payoff in the opening frame; pick images that make an idea physical and show a process; style and composition are independent; a "3-metre test" (readable from across the room).
- **Sound:** BGM at 0.40–0.50 and SFX at 1.0, with BGM peaks 6–8 dB under SFX; mix with `amix … normalize=0`; **split the spectrum**: BGM `lowpass=4000`, SFX `highpass=800`, so effects are not masked. BGM fades in 0.3 s and out 1.5 s. SFX density by personality: calm or focused products 0–3 per 10 s, busy ones 6–9; then **delete 30–50 % of the cues**. Always: typing, clicks and choices, focus changes, the logo reveal.
- **HTML render traps** (from `animation-pitfalls.md`): layered layouts need `position: relative`; avoid rare Unicode glyphs; animation state must be **seekable** (pure render); measure text only after fonts load; reserve recording hooks (`window.__ready`, `window.__recording` to disable loops); give each batch export its own temp folder (PID); keep Chrome's own controls and fake player chrome out of the frame; watch for warm-up frames repeating at the start and an offset first frame.

## When to use it

- **As a checklist beside any of our film skills**: the camera budget and zoom formula, the five-part rhythm and the mix ratios are precise and engine-neutral. They suit product and AI-tool demos most; for news pacing, weigh them against [`explainer-grammar`](../explainer-grammar/NOTES.md) and [`launch-film-grammar`](../launch-film-grammar/NOTES.md).
- **Director's notes before a launch film**: the five-part structure in `launch-film-director-notes.md` is a good template for our production plans.

## Changes from upstream

- **Copied:** 13 files from `references/` and `references/modules/motion.md` (renamed `module-motion.md`). Unchanged, in Chinese.
- **Not copied:** the rest of the skill. The references point at its scripts (`render-video.js`, `render-video-seek.js`, `add-music.sh`, `convert-formats.sh`, `sfx-cues.sh`, `ai-review-video.py`), its React stage (`animations.jsx`) and its **SFX and BGM files** (`assets/sfx/`, six `bgm-*.mp3`), which are upstream only. The audio files have no stated source or licence of their own, so they are not copied.
- **Added:** this `NOTES.md`.
