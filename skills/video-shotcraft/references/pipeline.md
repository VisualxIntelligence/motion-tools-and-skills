# pipeline — eight-stage production pipeline

Eight stages, so that directional questions never reach the expensive
shot-by-shot stage. The empirical details come from retrospectives on
several delivered promo films (the template film is in `template/`).

## Contents

- Stage 0: product understanding and execution constraints
- Stage 1: visual direction and styleframe
- Stage 2: feature-to-shot mapping
- Stage 3: storyboard and production sign-off
- Stage 4: final asset capture
- Stage 5: shot-by-shot implementation
- Stage 6: sound design
- Stage 7: independent final check and delivery

This file is the complete pipeline for **autonomous free creation**: the
judgements in stages 0–3 are made and recorded by the agent on its own,
based on the project content, without waiting for user confirmation at each
stage, and then it moves continuously into stages 4–7. The purpose,
audience, features, aspect ratio, audio or data requirements the user has
already given are hard constraints.

Using the Ink Press template directly does not go through this pipeline; it
follows the original replacement flow in `template/TEMPLATE.md`, and where
the template document refers to stage 4 it borrows only the asset capture
method from it.

**When co-creation enters this file from the guided mode (`guided-free-creation.md`, not included in this copy), do not
rerun from the start.** That flow has already completed and confirmed
stages 0–3; continue directly from stage 4, final asset capture, without
re-asking or redesigning.

Two execution principles (lessons from real projects already absorbed):

1. **The final design spec and the storyboard together form the production
   sign-off.** The storyboard table lives in the design spec (four columns:
   `| # | time | shot | key motion |`); sign-off does not reopen business
   or creative questions that were already confirmed, it only fills in the
   open items needed for implementation.
2. **Acceptance runs through the whole process; it is not a final stage.**
   Every shot task ends with a visual check of a still from
   `npx remotion still` (outputs archived by version in `out/qa/`), and the
   whole film is re-rendered after every round of feedback changes.
   Stage 7 only upgrades this running practice into a formal self-check
   report against aesthetic-rules.md.

A note on ordering flexibility: the styleframe may first use HTML and a small
amount of safe pre-check material; what matters is that **before shot-by-shot
implementation begins, the final assets are captured according to the
approved storyboard** — if a wrong asset direction only surfaces after the
shot-by-shot stage, the cost is that the whole set of scenes is scrapped.

---

## Stage 0: product understanding and execution constraints

Before writing any video code or capturing final assets, do a read-only
inspection of the project's positioning, main features, page states, visual
tokens, startup method and data risks. From the project evidence and what the
user has already described, produce a product brief and a requirement-to-
execution decision table, making clear how the purpose, audience, core
selling points, must-show features, duration / aspect ratio / language,
audio and data policy actually affect this film.

In autonomous free creation, the agent makes dynamic judgements on
defaulted items and writes them into the design spec, without pausing to ask
the user to confirm. When the user has specified a BGM, first analyse its
rhythm per `references/music-beat-sync.md`; when none is specified, the
agent picks one in stage 6 according to the product and the release
context. Public demo data may be used after confirming it is public;
customer, personal, internal, secret, real-time or other sensitive data must
always be fictionalised, redacted or frozen first.

**Output**: product brief; requirement-to-execution decision table; explicit
data and audio constraints.

---

## Stage 1: visual direction and styleframe

**Goal**: use the cheapest artefact to lock in the whole film's palette,
typography, lighting and camera temperament, so that every directional
argument happens before the first line of Remotion code is written.

**Steps**:

1. From the current project, generate up to 3 text directions. Attach to
   each direction a set of **motion-personality tokens** (derivation method
   in the "brand → motion parameters" table below), but do not make Ink
   Press a fixed option.
2. The agent chooses the most suitable direction based on the product's
   visuals, purpose and audience, and writes the choice and trade-offs into
   the design spec; it does not pause to wait for the user to choose.
3. For the chosen direction, **do not render video and do not write Remotion
   code**; write a plain HTML/CSS styleframe page containing 2–3 static
   1920×1080 key visuals.
4. Use Playwright/Puppeteer screenshots to verify fonts, palette, materials,
   composition, lighting and information density; easing and camera speed
   are still judged from tokens, Gallery samples or a short motion test. If
   there is already a strict brand guideline or an explicit reference film,
   you may skip the styleframe after recording the reason.
5. If the user gave a reference film: download it, extract frames with
   ffmpeg (`select=eq(n,…)` pulling ~100 frames, `tile=4x5` stitched into a
   contact sheet), and do a motion breakdown of each animation / transition /
   effect, written into the design spec as a three-column table "technique |
   how the reference film does it | trade-off" — **adapt selectively, do not
   force-fit**. The same goes for image references: they describe the feel of
   "a certain kind of shot", not a style order for the whole film.

**Brand → motion parameter derivation.** Do not pick easing/duration by
feel; first place the brand on two axes, then start from the nearest preset:

- **Energy axis**: low (calm / premium / institutional) ↔ high (sports /
  startup / entertainment) — decides duration, overshoot, squash amplitude;
- **Tone axis**: serious (finance / medical / enterprise) ↔ playful
  (consumer / social / kids) — decides how straight or curved the paths are
  and how many secondary actions there are. The product's own visuals are
  evidence (sharp geometric shapes → engineered feel, rounded corners +
  bright colours → soft and playful); brand words stated by the user
  override visual inference.

| Preset (category) | Main duration @30fps | Entrance easing | Overshoot | Squash |
|---|---|---|---|---|
| Professional trust (fintech/enterprise/B2B) | ~21f | bezier(0,0,0.2,1) | 1.0 no bounce | 0 |
| Refined premium (luxury/fashion) | ~48f | bezier(0.4,0,0.6,1) | ≤1.02 | 0 |
| Energetic bold (sports/games/startup) | ~18f | bezier(0.16,1,0.3,1) | 1.12 | 0.25 |
| Lively delight (consumer/social) | ~27f | bezier(0.34,1.56,0.64,1) | 1.08 | 0.18 |
| Calm care (health/education) | ~42f | symmetric ease-in-out | 1.0 | ≤0.04 |
| Warm and friendly (small business/community) | ~26f | bezier(0.25,0.46,0.45,0.94) | 1.04 | 0.08 |

Usage: pick a preset → fine-tune along the two axes → write the tokens into
the design spec. Two self-checks: ① describe the film's motion in three
words; do they match the brand words? ② the same set of tokens must govern
entrances / transitions / hold rhythm at once — one brand has one motion
voice, and mixing two sets reads as a patchwork. Note that when a preset
value conflicts with a hard precedent in the library, the precedent wins:
wherever a landing should bounce, y1 must be >1; "professional trust doesn't
bounce" refers to fade-in / slide-type moves that carry no landing metaphor.

**Output**: the styleframe of the chosen direction; palette/typography/
lighting tokens + motion-personality tokens; (when there is a reference
film) the motion breakdown table.

**Common pitfalls**:

- Using a rendered video for the style proposal: too expensive, and the
  psychological cost of changing direction is also high. Static frames are
  enough to set the tone.
- Applying a reference-driven style move globally in one stroke: stylised
  camera angles are decided shot by shot (for information-dense list/stack
  shots, a straight-on view is more readable).

---

## Stage 2: feature-to-shot mapping

**Goal**: pick a suitable motion grammar for each must-show feature, without
writing the complete storyboard prematurely at this stage.

**Steps**:

1. **First list the product's features and map each one to a shot.** Missing
   a core feature means rework; one animation technique (fly-in / stack /
   page flip) is the lead only once in the whole film, and homogeneity is a
   signal for rework.
2. Scan the frontmatter of all cards in `references/shots/`; based on use,
   energy, suggested duration, restrictions and the page state required,
   choose a first-choice and an alternative card for each feature; the agent
   decides on its own and records the grounds.
3. Read the selected cards in full, and locate the exact demo source via the
   "Reference implementation". When no suitable card exists you may write
   a new one, but the scope and validation risk must be stated in the design
   spec.

**Output**: feature-to-shot mapping table; the selected card names,
variants, demo source and reference sample locations.

---

## Stage 3: storyboard and production sign-off

**Goal**: arrange the approved feature and shot mapping into a complete shot
sequence with an energy curve, and turn it into a frame-level implementation
plan. In autonomous free creation the agent signs off on its own, without
pausing for confirmation.

**Steps**:

1. First check whether `references/sequences/` has an applicable segment
   template; if so, follow its fill-in-the-blanks flow to allocate segments
   and frame budgets, then arrange the mapped shots into low-energy opening →
   feature segments alternating with breathing spots → high-energy finale.
2. **When a BGM is already specified**: first produce the music structure
   table (full-energy starting point / breakdown beat numbers, see
   music-beat-sync.md §2), anchor all shot boundaries to beat numbers, and
   give the strongest hits to the 2–3 big slams in the film; the breakdown
   section is naturally the brand's breathing spot.
3. Write the complete storyboard table: shot order, duration, feature
   information, concrete page state, shot card and variant, main motion,
   asset source, caption, transition and SFX. Each shot tells only one main
   motion.
4. When laying out the timeline, **reserve a hold/rest frame budget**: hold
   the brand wordmark ≥1s (30f) after it lands, 0.5s of stillness at the end
   of a batch motion, opening subject action ≥3s. Rhythm rework is
   one-directional — too fast always gets reworked, slowing down has never
   been rejected.
5. After checking that the storyboard is consistent with the product brief,
   requirement decisions, visual direction and shot mapping, the agent signs
   off on its own, and translates the storyboard into a frame-level timeline
   in the implementation plan:
   `| shot | from | duration | content |` (for a beat-synced film, from/to
   are all expressed with `beatF(n)`), and assigns each shot its source file
   and acceptance frame numbers.

**Output**: design spec (including style tokens + motion breakdown +
storyboard table); frame-level timeline.

**Common pitfalls**:

- Not checking against the feature list and arranging shots by feel: core
  features get missed and animation techniques become homogeneous; both mean
  rework.
- Overloading the opening: keep opening information small and focused, one
  hero and one complete action arc.
- A duration budget with no breathing spots: if motion fills every frame,
  adding hold shot by shot later means shifting frames across the whole film.

---

## Stage 4: final asset capture

**Precondition**: the final design spec and storyboard are signed off. Co-
creation takes user confirmation as sign-off; autonomous free creation takes
the agent completing and recording a consistency check as sign-off. The small
number of safe screenshots captured earlier for the styleframe may only be
used to validate direction, and must not directly replace the final assets.

**Goal**: following the final storyboard strictly, obtain all the real page
assets every shot needs, including full-page textures, element slices and the
coordinate table, laying the foundation for 2.5D camera moves and page-space
animation.

**Steps**:

1. Start the product's local dev server (for a desktop product, use a
   window-screenshot tool, which likewise produces the three deliverables).
2. Copy `assets/scripts/capture-template.mjs` into the project, change
   BASE_URL and the selectors, and run it once to produce the three
   deliverables:
   - **Full-page 2x screenshot**: viewport 1920×1080, `deviceScaleFactor: 2`;
     before the screenshot, `document.fonts.ready` + 600ms settle, and wait
     another 1.5–2s for real-time-synced pages.
   - **Per-element cutouts**: screenshot element by element with semantic
     selectors; floating pieces use a transparent background, and shots
     where "cards fly onto an empty board" additionally capture an empty
     backplate.
   - **layout.json**: records each element's `{x,y,w,h}` bbox in the
     full-page coordinate system and each page's `pageH`, for direct use as
     flight target positions, mask positions and entrance regions.
3. Support incremental re-capture per page / per element. Live data sources
   are first frozen, fictionalised or redacted according to the stage 0 data
   policy, and only then captured finally.

**Output**: `public/textures/` full-page images, element slices and empty
backplates; `layout.json`; a re-runnable capture script.

**Common pitfalls**:

- Doing the full capture before the storyboard is signed off: page states
  and asset scope are not yet settled, causing repeated capture.
- Hand-building an HTML recreation of an existing page: recreation defaults
  to real screenshots; hand-built UI is used only for non-recreation scenes.
- Not locking live data sources, or capturing only the full page without
  recording layout coordinates.

---

## Stage 5: shot-by-shot implementation

**Precondition**: there must already be a runnable Remotion project (30fps,
1920×1080, Composition registered in `src/index.ts`; a new project can be
initialised with `npx create-video@latest` and then the `assets/lib/`
components copied in; the template route starts directly from `template/`).

**Goal**: land shot by shot following the frame-level timeline, with each
shot proving its own quality on completion — acceptance begins at this
stage, not left to the end.

**Steps**:

1. **For each shot, resolve first, then read three times** (hard rule, no
   skipping): validate the card name and `style-key` against
   `gallery/api/library.json` → read the corresponding recipe card in full →
   locate and read the exact demo TSX in full via the card's "Reference
   implementation" → copy the matching `assets/lib/` components into the
   project. Also save the path of that style's Gallery reference sample, for
   comparison during implementation and final check. Styles marked "for
   reference only, needs a custom implementation" are not recommended by
   default, and may be implemented only after the user explicitly names them,
   with the risk noted; styles marked "preview missing" must not be claimed
   to have been reproduced from a motion sample. The demo code is the tuned
   parameter truth (easing, duration ratios, mask-removal timing, and the
   workarounds for known pitfalls are all in it) — adaptive changes for the
   target product are allowed, but parameters marked "known pitfalls /
   critical" on the recipe card must not be downgraded, and the quality bar
   only goes up. Writing something new from the card name and your own
   understanding = abandoning all the accumulated tuning, and the measured
   finish is one grade worse.
2. **PageCam is the foundation of every "real page" shot**: full-page
   texture + keyframed 2.5D camera + page-space overlays, with children
   positioned in the page's CSS px, in the same coordinate system as
   layout.json.
3. **Still-frame acceptance (the highest-frequency action)**: for each shot,
   fix 2 acceptance frame numbers in the plan; on completion run
   `npx remotion still src/index.ts <Comp> out/qa/<name>.png
   --frame=<N>`, and the shot counts as done only after you have visually
   checked the composition / glitches / text sharpness yourself. Archive
   still outputs by iteration version in `out/qa/`, so that when the user
   pastes a frame as feedback it can be matched directly.
4. **Render the whole film after every round of changes**:
   `npx remotion render src/index.ts <Comp> out/promo.mp4`, then use
   `ffmpeg -i out/promo.mp4 -vf "select=eq(n,…)"` to pull key frames from the
   finished film for review. The actual pattern is "still the frames of
   whichever shot you changed, then re-render the whole film"; the cost is
   acceptable and it rules out surprises at the seams.
5. Keep small tools for pixel-level self-checks: crop-and-zoom to check text
   sharpness (crop), two-frame pixel diff, measuring element bbox against the
   composition.
6. **Iron rule of deterministic rendering**: no `Date.now()` /
   `Math.random()` / argument-less `new Date()`. All pseudo-randomness uses
   a fixed seed (mulberry32/hash function, seed derived from the index),
   guaranteeing frame-by-frame reproducibility and zero jitter between
   renders.
7. Self-check as you go against `references/aesthetic-rules.md` (don't wait
   for stage 7): the easing for a landing that should bounce must have
   y1 >1, light effects are clipped into rounded corners, and when text is
   blurry under 3D, first check the rasterisation path (CSS `zoom` for
   layout-level magnification, not transform scale) rather than adjusting DoF.
8. For ambiguous user feedback ("the first title"), confirm the referent
   before acting; when a change goes wrong, revert the whole commit
   immediately and start over, don't patch on top of the wrong version —
   each change is its own commit so that it can be rolled back cleanly.
9. (Not included in this copy: the delivery-time motion workbench interface.)

**Output**: shot-by-shot commits; the `out/qa/` still-frame archive; a
whole-film render mp4 for each round.

**Stage output**: the whole-film render (one version per iteration round) +
key stills. Autonomous free creation does not pause for confirmation on this
output; when the user volunteers feedback it is taken into the next round.
Users may give feedback by "grabbing frames from the finished film and
pasting images", with both sides reviewing on the frames.

**Common pitfalls**:

- Leaving the first check to the user: you must pull frames and watch the
  film yourself before delivery; a problem like "the shot's viewing angle is
  poor, and there's a slight shake" should not be discovered by the user.
- Skipping the demo code and writing directly: the parameters were tuned
  through several rounds of real rulings, and a newly written version almost
  inevitably steps back onto known pitfalls.
- Product promo films default to no handheld shake; camera noise is used
  only when a documentary feel is explicitly sought.
- Decorative glint / bloom sprayed across many elements: batch elements
  enter through the motion itself. A single high-quality light effect is
  fine; spraying it across many is cheap.
- Blurry text under a 3D push-in: the root cause is the texture source
  resolution / rasterisation path; check the asset chain first (2x texture +
  CSS zoom + separate 4x capture of key elements), and don't touch camera and
  depth of field first.
- A fly-in animation whose endpoint hangs in mid-air: the element must land
  in a real slot of the page layout (embedded, seated, lined up into the
  scroll flow); hovering above the page without landing looks fake.

---

## Stage 6: sound design

**Goal**: the BGM sets the whole film's energy skeleton, SFX are pinned beat
by beat onto the motion's key frames, and the timbre suits the "product promo
film" genre rather than UI event semantics.

**Precondition (the most expensive ordering lesson)**: **start only after the
picture timeline is locked.** Every time the picture moves, the whole
pin-frame table has to be re-aligned. If the picture really did change again,
the closing action always includes "re-align all SFX frame numbers in the
table", and audio-picture misalignment is a mandatory check.

**Steps** (details and precedents in `references/sound-design.md`):

1. Read `references/sound-design.md` and copy sound effects from
   `assets/audio/sfx/<category>/` (free commercial-use licence, source in
   `assets/audio/ATTRIBUTION.md`). The sound effects are split by scene into
   16 category directories; first decide the category by the action needed
   (camera move → transition, landing → impact, typing → text, page turn →
   paper, light effect → **light**…), then pick the timbre within the
   category. Note that the directory for the vocabulary term `sparkle` is
   `light/`; the library has no `sparkle/`.
2. **BGM**: user-specified → the rhythm analysis was already done in stage 0,
   so only mixing is done here (volume pressed down to ~0.34 to leave
   headroom for SFX, interpolate fade in/out at head and tail). Not
   specified → pick, by genre, a strong-drum, strong-rhythm electronic bed
   (tech-house type); the criterion is the "typical product promo video"
   temperament rather than "sounds nice"; candidate tracks must be laid under
   the film and auditioned, since choosing from the track alone is
   unreliable; `assets/audio/bgm/` has strong-rhythm alternatives. The BGM
   `<Audio>` is wrapped on its own with a boolean inputProp (such as `bgm`,
   default `true`), decoupled from the SFX — the final render must produce a
   with-BGM and a without-BGM version from the same timeline.
3. **Pick SFX by shot language, in a cinematic vocabulary**: camera move =
   whoosh, landing = impact, build-up = riser, light effect = sparkle
   (directory `light/`), transition = transition; ban the **timbre** of game
   sound packs (synth plucks/bloops, cartoon bounces jar the ear). Note that
   "ban game sounds" bans a timbre, not an action — if the picture really
   has a click / switch / shatter, it should get that action's foley; see
   aesthetic-rules S1 for the deciding question. But **`ui/` must be
   auditioned one by one and the whole directory must not be waved through**:
   of its 18, only a few such as `switch-*` are real switch foley, and more
   than half are synthesised feedback sounds (tone/bleep/notification),
   exactly the texture S1 excludes — see the per-file keep/drop table in
   sound-design 3.3. `glass/` is real shattering material sound and is not on
   the ban list.
4. **A declarative pin-frame table, managed centrally + relative pinning**: a
   single-file `{ from, src, volume }[]` array, each entry commented with the
   picture action it corresponds to, each wrapped in
   `<Sequence from={s.from}>`. **`from` is always written as a relative
   expression** — `SHOTS.x.from + offset`, and `beatF(n)` for a beat-synced
   film — never a bare frame number. When the timeline shifts, the pin-frame
   table follows automatically, avoiding re-pinning the whole table. **Long
   samples (>5s, 21 in the library) must explicitly be given
   `durationInFrames`** — truncate via the Sequence rather than by cutting
   the audio file; if omitted they run on and keep sounding after the action
   ends. The list and the truncation criterion are in sound-design 4.1.
5. Three tricks against a machine-gun feel in rapid-fire sounds: alternate
   two samples, step the volume down (e.g. a six-pop run 0.40→0.25), and
   accelerate the spacing to follow the animation curve (when it gets so
   dense that it blurs into one, let the sound fade out into a swoosh).
6. Beyond the generic sounds, leave "tailored to the picture" slots:
   recognisable picture actions get their own foley (keyboard sounds for
   typing, one pop per item for items dropping in one by one); a generic
   swoosh cannot cover them.
7. In a film with a strong-drum BGM, keep SFX restrained: the drums are
   themselves the beat sound, SFX pin only the actions unique to the picture,
   and big slams are given to only 2–3 peaks.
8. Fixed closing phrase: riser (starts at the assembly segment) → impact
   (wordmark lands, the volume peak of the whole film) → sparkle (the
   afterglow, taken from `sfx/light/`).
9. **Set volume from the measured peak of the material, don't copy the
   range**: `volume` is a multiplier, not a target loudness — the usual
   0.2–0.6 presupposes that the material's peak is close to 0dB. The 7
   quietly recorded materials in the library (peak <-12dB, the quietest
   -24.6dB) are still ten-odd dB below the BGM even at 1.0 and will be
   buried by the drum bed: **first choice is to swap in a well-recorded
   material from the same category, or to pre-normalise it before adding it
   to the library**; where necessary give a gain >1 (Remotion supports real
   amplification, but preview clamps to 1.0, so verify the peak on the
   rendered output to guard against clipping). The list and the three ways
   out are in sound-design 4.1.

**Output**: the film with sound; the SFX pin-frame table (relative frame
expression + source + volume + comment); audio files in the repo with their
source licences recorded.

**Stage output**: the whole-film render with sound. Autonomous free creation
goes on into the final check without pausing for confirmation.

**Common pitfalls**:

- Laying SFX before the picture is locked: the knock-on cost of re-aligning
  the whole table (see Precondition).
- Choosing timbre by UI event semantics (synth confirmation/minimize chimes):
  genre mismatch, the whole batch gets overturned. But don't over-correct to
  "give interaction actions no sound at all" — that violates S4, foley first.
- Long samples without `durationInFrames`: the sound runs over later shots
  (21 in the library are >5s).
- Copying the 0.2–0.6 volume range without looking at the material's peak:
  pinning a quiet material is as good as not pinning it.
- Scattering SFX by feel without building a table: after frame numbers drift
  they cannot be shifted as a whole, and cannot be checked against the
  storyboard table either.

---

## Stage 7: acceptance

**Goal**: upgrade the self-checks of stills / whole film that run throughout
into one formal whole-film check pass, while verifying that the finished film
faithfully executes the product brief, requirement-to-execution decision
table, visual direction, shot mapping and storyboard confirmed or recorded in
the current mode; produce a point-by-point report against the final check and
the aesthetic rules, then do the final render and deliver.

**Steps**:

1. Render the latest version of the whole film, and extract all the key
   frames with ffmpeg (for each shot at least three: mid-entrance, motion
   peak, after settling). For a film with BGM, render both versions here —
   the with-BGM version and the without-BGM version (SFX retained); the
   without-BGM version is rendered from the same timeline via the `bgm`
   inputProp reserved in stage 6: write a `props-nobgm.json` (content
   `{"bgm":false}`) and then `npx remotion render … --props=props-nobgm.json`
   (reliable across platforms; on macOS/Linux you can also inline
   `--props='{"bgm":false}'`, but the Windows shell strips the double quotes
   from inline JSON, so a file must be used). Do not create a separate
   project, and do not pull the audio track out with ffmpeg in
   post-production. Name them distinctly (e.g. `promo.mp4` /
   `promo-nobgm.mp4`).
2. **Independent final check (mandatory)**: dispatch a clean-context subagent
   to do a third-party review. Do not give it the justifications, change
   history or any hint of "it should pass" from the production process; give
   it only: the latest finished film (for a film with BGM, both versions, for
   the A8 check), the extracted key frames, the creation mode, the product
   brief, the requirement-to-execution decision table, the confirmed or
   recorded visual direction/tokens, the styleframe or the reason it was
   skipped, the feature-to-shot mapping, the Gallery card names and specific
   variants, the corresponding record in `library.json`, the exact demo TSX
   located via the card document, the Gallery reference samples or key frames
   extracted from them, the final storyboard, the selected shot cards,
   `references/final-review.md` and `references/aesthetic-rules.md`.
3. The review agent checks, per `final-review.md`, the product goals, feature
   completeness, visual direction consistency, shot card / variant fidelity,
   storyboard consistency, data safety, audio-picture sync and visual
   technical quality. Going shot by shot, watching both frames and the film,
   it gives verdicts like "F2 ✗ (frame 340 lacks the confirmed knowledge-graph
   feature)" or "Q2 ✗ (text blurry at frame 615)", each issue attached with a
   frame number / screenshot that can be re-checked. Shot card adaptation is
   not required to be pixel-identical to the Gallery sample, but it must
   preserve the motion grammar, key durations, known-pitfall / critical
   parameters and any specific variant the user named.
4. Content-level self-check: for each shot ask "what new information does it
   give"; delete repeated shots / repeated taglines; rewrite the copy against
   the final picture, and even pure-animation segments need an explanatory
   caption — leave no mute segments.
5. Final audio-picture alignment check: play back each SFX against its frame
   and confirm there is no misalignment (if the timeline was moved again after
   stage 6, re-align first and then verify). For a beat-synced film, do the
   post-render back-test per music-beat-sync.md §5; it passes only when all
   cut-point errors are ≤3f.
6. Fix items from the review report go back to the stage 3/5/6 small loop:
   plan or storyboard deviations go back to stage 3, picture implementation
   issues go back to stage 5, sound issues go back to stage 6; keep going
   until the checklist passes, then final-render the film. The final render
   repeats the two-version render of step 1 — a film with BGM is delivered in
   a with-BGM and a without-BGM version, the without-BGM version being for the
   user to add their own music or platform music later.

**Output**: the independent review report (final-review + aesthetic-rules
checklist + frame-number evidence) + the final-render film (with-BGM /
without-BGM versions).

**Deliverables**: the review report + the film in two versions (with BGM +
without BGM).

(Not included in this copy: the post-delivery workbench step, the author
mention / showcase invitation notes and the JianYing project export.)

**Common pitfalls**:

- Treating acceptance as "the thing done last": this stage is only the
  wrap-up. If stills were not self-checked in the first five stages, the
  volume of accumulated problems here makes the checklist meaningless —
  running acceptance throughout is the standard.
- A self-check report that degenerates into "all ✓": users read every word
  on screen and will grab frames to compare themselves — every conclusion in
  the report should come with a frame number / screenshot that can be
  re-checked.
- The production agent writing its own review report: confirmation bias is
  unavoidable, and the independent subagent review cannot be omitted.
- Only checking "does it look good" and not "does it meet the production
  baseline of the current mode": a missed feature, drift in visual
  direction, a wrongly used shot variant and unconfirmed data are all final
  check failures.
