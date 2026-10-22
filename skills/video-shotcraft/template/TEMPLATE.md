# template/ — Finished-Film Template Ink Press: A Paper-and-Ink Morning-Read-Style Product Promo Film (36.2s)

A complete, accepted promo film project, serving as a template for "extremely close reproduction": swap in the screenshot material of another web / desktop
product, replace and adapt shot by shot following this document, and you get a finished film of the same finish.

- Specs: 1920×1080 @ 30fps, 1085 frames (36.2s), SFX-only (no-BGM version)
- Style: paper-ink amber (paper ground `#f2eee6`, ink text, large serif headings, amber accent colour)
- To run it: `npm install && npx remotion studio src/index.ts` (preview)
  / `npx remotion render src/index.ts AiflPromo out/promo.mp4` (render)
- Acceptance still: `npx remotion still src/index.ts AiflPromo out/qa/f150.png --frame=150`

## 1. Film structure (AIFL_SHOTS in src/aifl/Main.tsx)

Energy skeleton: brand opening (low) → 3 feature sections alternating with title-card breathing slots (medium-high / low) →
ending assembly pushed to the film's peak. At the two wordmark moments (opening, ending) the wordmark holds a full 1s after it settles.

| # | Frame range | Duration | Scene file | Content | Corresponding shot card |
|---|-------------|----------|------------|---------|-------------------------|
| 1 | 0–220 | 7.3s | live/SceneOpen.tsx | Ink-line drawing + wordmark stamp opening → dashboard overview → spotlight hero card (hover + beam sweep + settle) | brand-ink-open / spotlight-hero-card (for the high-definition rasterization technique see aesthetic rule Q2) |
| 2 | 220–275 | 1.8s | PaperTitleCard.tsx | Title card ① "All your team's research, one place to go." | paper-title-card |
| 3 | 275–465 | 6.3s | live/SceneFlyIn.tsx | Deck close-up orbit → dealt cards fly into the grid → scroll → search typing → filter → click push-in | deck-deal-flyin / type-and-filter |
| 4 | 465–565 | 3.3s | live/SceneDetail.tsx | Detail page macro close-up, row elements embed one by one | row-embed |
| 5 | 565–620 | 1.8s | PaperTitleCard.tsx | Title card ② "Paper Radar…" (with a DigitRoll number sub-label) | paper-title-card |
| 6 | 620–725 | 3.5s | live/ScenePapers.tsx | Paper-radar list stacks and presses in + counter settles | list-stack-press |
| 7 | 725–775 | 1.7s | PaperTitleCard.tsx | Title card ③ "Every project, linked to your weekly report." | paper-title-card |
| 8 | 775–885 | 3.7s | live/SceneWbr.tsx | Weekly report page "writes itself" typewriter reveal + past weekly reports pop into the sidebar one by one | document-typewriter-reveal |
| 9 | 885–940 | 1.8s | PaperTitleCard.tsx | Title card ④ "The whole team, on the same page." | paper-title-card |
| 10 | 940–1085 | 4.8s | live/SceneOutroLive.tsx | Defocus → element group-photo assembly → letterpress wordmark slam (riser→impact→sparkle) → 1s hold | outro-group-photo-launch |

Overlay layers (all managed declaratively in Main.tsx, and all `export`ed — the `src/workbench.ts` manifest imports from here,
and the motion workbench splits the finished film into multiple tracks accordingly, see upstream `references/workbench.md`; the workbench is not included in this copy):
- **TITLE_CARDS**: the copy table of the four title cards (`*word*` = amber italic emphasis word, parsed by `parseWords`),
  with card2 carrying a subtitle + rolling number
- **CAPTIONS**: 6 bottom full-width narration captions (absolute frame number table), pressed onto the feature sections, with none added to the title card / outro sections
- **FLASH_CUTS / FlashCut**: 4 warm-white flash transitions, `from = cut point − 5`, straddling the seam with 5f on each side
- **SFX frame-pinning table**: 30+ entries of `{from, src, volume}`, each annotated with its corresponding on-screen action;
  the long keyboard sample is truncated by context with Sequence duration (`sfxDuration`: 24f/44f)

## 2. Shared foundation components

| File | Role | Key points |
|------|------|------------|
| live/Scene*.tsx · PaperTitleCard · Caption | Each scene exports `*_DEFAULTS` (copy / font size / palette) and reads them as props with defaults; the schema in `src/workbench.ts` references the same object directly, so what you edit in the workbench property panel is exactly these. Easing / timing values / camera keys are not exposed | When changing product, edit DEFAULTS first rather than scattered literals; the colour values are sRGB render values of the original oklch tokens (ink #13110f · amber #955905 · grey ink #65635f · deep amber #ae6700) |
| live/PageCam.tsx | 2.5D page camera — the foundation of every "real page" shot | Full-page screenshot + keyframes `{frame,cx,cy,zoom,rotX/Y/Z,persp}` interpolating the camera move; children are positioned in page CSS px (the same coordinate system as layout.json); **3D mode uses CSS `zoom` for layout-level enlargement** (transform scale downsamples first and then enlarges, making text blurry — for the root-cause fix see aesthetic rule Q2); optional dof top gradient blur band |
| PaperTitleCard.tsx | Title-card breathing slot | Large serif text enters word by word, the accent word in amber; a DigitRoll number sub-label can be attached |
| FlashCut.tsx | Warm-white flash transition | Covers only 10f on both sides of a hard cut, and is not to be used as a decorative light effect |
| Caption.tsx | Bottom full-width narration | Small monospaced text + letter-spacing, with a slight push on entrance and exit |
| DigitRoll.tsx | Odometer number roll | Rolls digit by digit and settles |
| live-layout.json | Page element coordinate table | Each element's `{x,y,w,h}` (whole-page CSS px coordinate system) + each page's pageH; scene code imports it to decide flight target positions / mask positions |

## 3. Asset inventory (public/)

- `textures/live/*.png` — full-page 2x screenshots (projects-full / detail-full / papers-full /
  wbr-full), element slices (card1–10, paper1–5, float-*, nav), the empty board
  (projects-empty), and the high-definition close-up card (card4-hires, captured separately at 4x)
- `audio/*.mp3` — the 11 SFX used by this film (Mixkit, for licensing see ../assets/audio/ATTRIBUTION.md)

> Note: the screenshot material of this template comes from an internal research management tool (the data is fictional demo data).
> Before distributing the finished film externally, be sure to replace the whole set with the target product's own screenshots.

## 4. Guide to reproduction for a new product (the shortest path that preserves quality)

1. **Collect material** (for the specific collection method see ../references/pipeline.md stage 4; the template route borrows only the
   collection method and does not execute stages 0–3 of free creation):
   copy `../assets/scripts/capture-template.mjs` into the target product's project, change BASE_URL
   and the selectors, and produce the three-piece set — full-page 2x screenshots, transparent-background element slices, layout.json.
   Name the material to match this template (projects-full/detail-full/…), so it can overwrite public/ directly.
2. **Swap in the layout coordinates**: replace `src/aifl/live-layout.json` with the new layout.json.
   All flight target positions / mask positions / hover-piece positions in the scene code are read from it, so when the coordinates change the animation follows.
3. **Adapt shot by shot** (in the order of the table in section 1):
   - For each shot, **first read the full text of the corresponding shot card + the scene source**, and understand what the parameters mean before changing them;
   - Items that must be changed: the PageCam keys (cx/cy/zoom re-set for the new page's composition),
     the element slice file names, the number of cards / the slot loop, the copy;
   - Do not touch: the easing curves, the duration proportions, the hold-frame budget, the SFX frame-pinning structure —
     these are where the finish lives, and changing them amounts to redoing the tuning.
4. **Copy**: the `TITLE_CARDS` table (title cards, `*word*` marks emphasis), the CAPTIONS table, the outro brand name / tagline.
   When the shot structure changes, update `src/workbench.ts` in step (add a `scene(...)` line for a new shot; for title cards follow `title(...)`),
   then (with upstream's `workbench/`, not included in this copy) `cd ../workbench && npm run parity` to confirm the breakdown is lossless.
5. **Acceptance**: after finishing each shot, produce stills with `npx remotion still` for self-checking (at least
   three frames per shot: mid-entrance / action peak / after settling); after everything is changed, render the whole film + extract frames with ffmpeg to look back;
   finally go through the checklist against ../references/aesthetic-rules.md.
6. **Duration stretching**: when adding / deleting shots, shift the `from` of AIFL_SHOTS as a whole (it is the single source of truth),
   and the absolute frame-number tables of CAPTIONS/SFX/FlashCut shift along with it — it is recommended to finalise the new timeline first and only then touch the
   SFX table (every time the picture moves, the frame-pinning table is entirely rearranged).

## 5. Finish checklist (hard indicators when reproducing)

- Text must be sharp in 3D / when enlarged: a 2x full-page texture + PageCam layout-level zoom +
  the close-up element captured separately at 4x — all three are required
- It must breathe after settling: wordmark hold ≥30f, batch-motion ending ≥15f still
- One animation technique is the hero only once in the whole film
- Flying elements must settle into real slots of the page (the layout.json coordinates), and not hover in the air
- SFX use a cinematic vocabulary (whoosh/impact/riser/sparkle/transition),
  with game UI timbres banned; the ending uses the fixed phrasing riser→impact→sparkle
- If a reproduction adds BGM, the final render always delivers two versions: a with-BGM version + a no-BGM version (SFX retained),
  with the BGM `<Audio>` wrapped in a `bgm` inputProp, and the no-BGM version rendered from the same timeline:
  `--props=props-nobgm.json` (content `{"bgm":false}`; on Windows inline JSON
  has its quotes stripped by the shell, so go through a file)
- Deterministic rendering: no Math.random/Date.now, and all pseudo-randomness uses fixed seeds
