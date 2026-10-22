---
name: video-shotcraft
description: Create cinematic product videos from shot recipe cards, a validated template, and code/audio assets (Remotion + real page screenshots + 2.5D camera moves + beat-synced cuts + sound design). Use when the user asks to turn a frontend project or webpage into a product video, says "use video-shotcraft to make a video/promo", names the Ink Press template or asks to reproduce its effect, or wants a single shot card's motion.
---

# video-shotcraft: cinematic product video production

A self-contained production library: 124 shot recipe cards (with demo
implementation source and a gallery of motion samples), one validated
full promo-film template, reusable components and audio assets, and a
six-stage workflow. The current focus is promo films for web/desktop
products, but the shot cards themselves are a general motion vocabulary,
so you can also pull a single card to make one shot in any video.

**Before you start (this copy).** The audio assets, screenshot textures
and template media are not in this repo; fetch them from upstream
(https://github.com/Vincentwei1021/video-shotcraft, commit 43bd349) when a
step needs them. Remotion is free only for individuals, companies with up
to 3 employees and non-profits; other organisations need a Remotion Company
Licence, so tell the user if their use may need one. Replace the placeholder
mark and copy in `demos/_fixtures/Brand.tsx`, and never put invented
testimonials on screen. See `NOTES.md`.

## Decide the mode first

A full promo film has two modes that are never merged (the guided
co-creation mode is not included in this copy). Before starting asset
capture, storyboarding or implementation, first judge whether the user has
already made a clear choice; if so, execute it directly, without asking
again and without switching to the other mode.

1. **Use the template directly**: keep the original Ink Press replacement
   flow. Read `template/TEMPLATE.md` and swap in the target product's
   screenshots, copy and brand information following the existing shot
   structure.
2. **Autonomous free creation**: read `references/pipeline.md`. The agent
   decides the visual direction, shot mapping, storyboard, assets and audio
   by itself, based on the user's existing requirements and the project's
   content, and drives straight through to the finished film; it does not
   pause to wait for user confirmation at the product brief, styleframe,
   shot mapping or storyboard stages.

When the user has provided a project path, URL, screen recording or page
screenshots but has not yet chosen a mode, first do one **minimal,
read-only product inspection**: understand the product's positioning, main
features, page visuals, showable states and asset risks. Do not modify the
business project, do not capture sensitive data, do not write video code.
After the inspection, present the two modes and state:

- whether Ink Press suits this product, with the specific grounds for why it
  does or does not;
- whether autonomous free creation suits it, and which product visual cues
  it is expected to keep;
- which mode the agent recommends, with the grounds and trade-offs.

Then ask explicitly: **"Based on the product inspection above, I recommend
the XX mode. Shall I continue with this mode?"** Also tell the user that
they can browse motion samples at
https://vincentwei1021.github.io/video-shotcraft/ and pick the motion
shots they want in the video.

When the user has not yet provided a project or page that can be inspected,
briefly introduce the two modes and then ask; do not default to recommending
Ink Press just because it is a ready-made template.

- User chooses the template: read `template/TEMPLATE.md` in full and execute
  the original template flow.
- User chooses autonomous free creation: read `references/pipeline.md` in
  full; the agent proceeds on its own, without waiting for confirmation at
  each stage.
- User has not decided: stop here and wait for a choice; do not choose for
  the user by default, and do not start production.

**Exception 1: when the user has already named the Ink Press template, the
template mode counts as chosen.** For example, "Use the Ink Press template
to make a promo film for my product." In that case do not ask again; read
`template/TEMPLATE.md` in full and follow the template route.

**Exception 2: when the user has explicitly specified shot cards to use or
reference, the shot constraint is already chosen.** For example, "make this
video with `deck-deal-flyin` and `row-embed`" or "reference the effect of
`spotlight-hero-card`". In that case do not introduce the template and do
not ask whether to use it; confirm the specified shots using the Gallery
name resolution rules, read each card in full, and locate the exact demo
source from the card's "Reference implementation". A single shot can be
executed once the target material is clear; a full promo film proceeds in
autonomous free-creation mode, with the specified shots as a production
constraint.

## Three ways to use it

1. **Full promo film (template route)**: you want an effect highly similar
   to the template film → read `template/TEMPLATE.md`, follow the "swap the
   product and reproduce" guide, replace the assets and adapt shot by shot.
2. **Full promo film (autonomous free creation)**: you want a new style and
   authorise the agent to decide on its own → read `references/pipeline.md`
   and run continuously from product understanding to final review, without
   pausing for confirmation at each stage.
3. **Single shot / single motion**: pick a card from `references/shots/` (or
   let the user choose in the online gallery), read the full card and
   locate the exact demo source from the "Reference implementation", then
   adapt it to the target material.

## Autonomous free creation

**Autonomous free creation** hands the creative and engineering decisions to
the agent. The agent dynamically derives the product's focal points, visual
direction, shot mapping, storyboard, asset handling and audio plan from the
project content, records its key judgements, and executes directly; unless a
necessary input is missing that cannot be safely inferred, it does not ask
questions, does not pause stage by stage, and does not ask the user to
confirm intermediate artefacts. The user's explicit requirements are always
constraints and must not be overridden by the agent's defaults.

The feature-to-shot mapping is only "which motion grammars to use", not a
complete storyboard. After the mapping the agent must continue to produce
the shot order, durations, concrete visuals, page states, asset sources,
captions, transitions and SFX. When the user copies shot names from the
Gallery, they only need to provide the card name or "card name · style
name"; the agent is responsible for reading the local recipe card and demo
source.

## Core principles

1. **Recreating an existing page must use real screenshots; hand-built UI
   is limited to non-recreation scenes, and its quality and clarity of
   expression are a hard bar.** When showing the product's real pages, the
   first step is to start the local dev server and use a headless browser to
   capture a full-page 2x texture + element-level cutouts + a layout.json
   coordinate table. Non-recreation scenes (abstract openers / brand
   segments / standalone showcase components) may use hand-built UI, but if
   it cannot reach publication-grade finish, or the audience cannot tell
   what it is expressing, go back to the screenshot route. Page data is
   handled by risk: public demo data may be kept only after the product
   brief explicitly confirms it; customer, personal, internal, secret,
   real-time or other sensitive data must be replaced with fictional or
   redacted content, and frozen before capture.

2. **The visual language of the whole video must grow out of the product
   itself; do not invent an unrelated "promo skin".** Before making the
   styleframe, extract from the product/website's design system, source code
   or computed styles and write into the design spec: font families and
   weights, type-size hierarchy, line height / letter spacing, grid,
   spacing, alignment, information density and corner radii, plus the
   background / surface / body / accent / status colours, gradients and
   materials. All titles, captions, numbers, text cards, layouts,
   transitions, particles, lighting and other motion colours in the film
   must reuse or modestly extend these tokens, and match the product's tone,
   taste and finish. On the template or shot-card route, inherit only their
   shot structure, motion grammar, rhythm and tuned parameters; typography,
   layout, colour and material must be re-skinned for the target product. If
   the narrative requires departing from the product's visuals, record the
   reason and trade-off in the design spec and continue.

3. **The cinematic feel comes from the interplay of camera work, light,
   rhythm and sound, not from showy animation.** What has been repeatedly
   approved: a single hero's complete action arc (spotlight → push in →
   float → return), acceleration driven by a physical metaphor (dealing
   cards), an oblique-angle orbit close-up, and the riser → impact →
   sparkle sound phrase. Batch elements enter through the motion itself,
   not by glowing one by one: decorative glint / bloom sprayed across many
   elements reads as cheap, while a single high-quality light effect is fine.

4. **Each shot tells one motion; once key information lands, it must
   breathe.** One animation technique (fly-in / stack / page flip) is the
   lead only once in the whole film; any repeated shot or repeated tagline
   is deleted. The pacing preference is one-directional: all historical
   feedback points to "slow down / linger", never once "too slow". Hold the
   brand wordmark for ≥1s after it lands, leave 0.5s of stillness at the end
   of a batch motion, and give the opening subject action a full 3s. When
   laying out the timeline, budget hold/rest frames in advance.

5. **For a film with a strong-rhythm BGM, every transition and motion must
   hit on the beat.** Once the user has chosen the music → before starting
   work, run a rhythm analysis (librosa grid fitting for the real BPM/phase
   + kick/snare/hihat three-class drum hit location); only after the grid
   passes acceptance by transient coverage do you storyboard; write the
   timeline in beat numbers `beatF(n)`, pin sparse accents to real
   transients rather than grid interpolation points, and after rendering,
   extract the audio track from the finished film and back-test the cut-point
   error ≤3f. Beat hits govern timing, not amplitude: a beat impact on the
   whole frame / camera layer counts as a big slam, ≤3 in the whole film
   (aesthetic-rules R4); other beat-hit motion only moves element layers.
   See `references/music-beat-sync.md` for the methodology.
   A film with BGM is always delivered in two final renders: a version with
   BGM + a version without BGM (SFX retained), both rendered from the same
   timeline via the `bgm` inputProp, so the user can add their own music
   later.

6. **To use a shot card's motion you must first resolve the Gallery index
   and read the exact demo implementation code.** First validate the card
   name and `style-key` against `gallery/api/library.json`, then locate the
   specific TSX from the card document's "Reference implementation". The
   recipe card gives semantics and a parameter table; the exact demo source
   is the tuned parameter truth (easing, duration ratios, mask-removal
   timing, and the workarounds for known pitfalls). Adaptive changes are
   allowed, but parameters marked "known pitfalls / critical" on the card
   must not be downgraded — the quality bar only goes up. Writing something
   new from the card name and your own understanding = abandoning all the
   accumulated tuning.

7. **The judgements made at each pre-production step are kept as an
   execution record.** The order stays: product brief → requirement-to-
   execution decision table → text directions → styleframe → shot mapping →
   storyboard; the agent selects and advances continuously. Do not enter
   shot-by-shot implementation while the direction is still undecided.

8. **Acceptance runs through the whole process + independent review before
   delivery.** From stage 5 on, check each shot with a still frame from
   `npx remotion still`, and after every round of changes render the whole
   film and pull frames with ffmpeg to review. Before delivery you must
   dispatch a clean-context subagent to do an independent final check. The
   review input includes the finished film, key frames, the product brief,
   the requirement-to-execution decision table, the recorded visual
   direction/styleframe, the feature-to-shot mapping, Gallery card
   names/variants, the exact demo TSX, Gallery reference samples/extracted
   frames, the final storyboard, the selected shot cards and the aesthetic
   rules; following `references/final-review.md`, it simultaneously checks
   plan consistency, feature completeness, shot fidelity, visual/audio
   technical quality and data safety, and produces a point-by-point report
   with frame-numbered evidence. The producer has confirmation bias about
   their own output, so the first check can never be left to the user.

9. **Deterministic rendering**: no `Date.now()`/`Math.random()`; all
   pseudo-randomness uses a fixed seed (mulberry32/hash, seed derived from
   the index), reproducible frame by frame.

## Workflow

Autonomous free creation runs continuously from stage 0 per
`references/pipeline.md`, without waiting for user confirmation at each
stage. In stages 2–3, scan the frontmatter of each card in
`references/shots/` and pick shots along the energy curve; stages 5–7 keep
self-checking against `references/aesthetic-rules.md`; stage 6 reads
`references/sound-design.md`; a beat-synced film follows
`references/music-beat-sync.md` throughout.

## Which file to read when

| When | Read |
|------|----|
| Project start, mode undecided | Minimal read-only inspection, then offer the two full promo-film modes and recommend one |
| Autonomous free creation | pipeline.md (the agent completes stages 0–7 on its own, without waiting for confirmation at each stage) |
| User has chosen a BGM | music-beat-sync.md (analyse first, then storyboard) |
| Template route | template/TEMPLATE.md in full |
| Storyboard design | sequences/ segment templates (fill in the whole-film skeleton first); all frontmatter in shots/; the full text of selected cards |
| Shot-by-shot implementation | The full text of that shot's card + the full exact demo source located via "Reference implementation" + the matching components in assets/lib/ |
| Sound design | sound-design.md + assets/audio/ |
| Acceptance | final-review.md + aesthetic-rules.md in full, run through the checklist (executed by an independent subagent) |

## How to use the assets

- Copy the `assets/lib/` components **into the new project** and then edit
  them freely (do not import this library). The list: PageCam (2.5D page
  camera, the foundation of every "real page" shot), ClipCard (wraps an
  external video clip mp4 into a "card hero" that can be driven by a shot
  card's camera-move skeleton, including an OffthreadVideo crossfade loop,
  so a clip shorter than the shot continues seamlessly), DigitRoll,
  FlashCut, Caption, FlatPanel, VerticalTicker (3D infinite scrolling wall),
  helpers (rand/shake/camera/motion). FlatPanel and helpers/camera need the
  `three` + `@react-three/fiber` + `@remotion/three` dependencies; the rest
  need only remotion.
- `assets/scripts/capture-template.mjs`: copy it, then edit the CONFIG at
  the top (BASE/routes/selectors).
- `assets/audio/` sound effects are copied and used directly (free
  commercial-use licence, see audio/ATTRIBUTION.md): `audio/bgm/` holds
  strong-rhythm BGM candidates; the 149 sound effects in `audio/sfx/<category>/`
  are split by scene into 16 categories (transition impact riser camera ui
  text paper film light data scifi mech glass fluid crowd counter); to find
  a sound, go into the category directory first, and the list is in
  sound-design.md. The directory for the vocabulary term sparkle is
  `light/` (there is no `sparkle/`); S1 bans a timbre, not an action: if the
  picture really has a click/switch, it should get foley, but half of `ui/`
  is synthesised feedback sounds (tone/bleep/notification) that must be
  auditioned one by one and the whole directory must not be waved through
  (list in sound-design 3.3); long samples and quiet material each have a
  list needing special handling (sound-design 4.1). **These audio files are
  not in this repo; fetch them from upstream
  https://github.com/Vincentwei1021/video-shotcraft (commit 43bd349).**
- `demos/` per-card implementation source: self-contained, finished-film-
  grade demos (shared pieces are in `demos/_fixtures/`: `Look.tsx` visual
  system, `Polish.tsx` finish pieces, `Brand.tsx` brand pieces, etc.; a few
  import the real-page textures in `demos/_textures/`); copy into a Remotion
  project and they run; the logo / brand copy in the picture is
  video-shotcraft's own, and when used for the user's product it is replaced
  with the user's logo and copy; a few demos use `@remotion/motion-blur`
  (CameraMotionBlur) and need `npm i @remotion/motion-blur`, list in
  `demos/README.md`. **The `demos/_textures/` media are not in this repo;
  fetch them from upstream https://github.com/Vincentwei1021/video-shotcraft
  (commit 43bd349).**
- `template/` is a complete renderable project: `npm install && npx remotion render
  src/index.ts AiflPromo out/promo.mp4`.
- **Tests (automatic in-repo verification; run after adding a demo/component)**:
  - Pure-function unit tests: `npm test` (vitest at the repo root, covering
    mulberry32 / velocityAt / lagged / dampedSettle / handheld in
    `assets/lib/helpers`, with deterministic assertions).
  - Demo render smoke test: `python3 assets/scripts/smoke-render-demos.py`
    renders the first frame of every demo that exports a duration and
    asserts it does not crash (needs `cd template && npm ci` + motion-blur;
    see the testing and verification section of `demos/README.md`).
  - Upstream CI (`pr-checks.yml`, not in this copy) runs a strict tsc compile of
    all demos + vitest + smoke render.
- Motion samples: this copy has no local gallery. Send the user to the
  online gallery at https://vincentwei1021.github.io/video-shotcraft/library.html
  (124 cards with 150 motion samples, searchable, with multi-select to copy
  card names), which suits letting the user pick shots while watching samples.
  The card index the workflow checks against is `gallery/api/library.json`;
  after editing a card, rebuild it with `python3 assets/scripts/build-card-index.py`.
