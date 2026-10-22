# final-review — Independent Final Check of the Finished Film

The independent review agent uses this checklist to verify "whether the finished film meets the production baseline for the current creative mode", and checks visual technical quality in combination with
`aesthetic-rules.md`. The review agent must work in a clean context and take no part in production; do not give it the reasons, justifications, revision history or expected conclusions from the production process.

## Review inputs

- The latest finished-film MP4 and the key frames of each shot;
- The creative mode: using the template directly, autonomous free creation, or co-creation;
- The product video brief and the features that must be shown;
- The requirements-to-execution decision table;
- In co-creation, the visual direction, brand tokens, styleframe (or the reason for skipping it) and banned styles confirmed by the user; in autonomous free creation, those recorded by the agent; in template mode, the original template structure and the actual replacement record;
- The feature-to-shot mapping;
- The Gallery card name and specific variant specified by the user or recorded by the agent in the design spec;
- The corresponding card and `style-key` record in `gallery/api/library.json`;
- The exact demo TSX source located from the card documentation;
- The corresponding Gallery reference sample film, or key frames / a contact sheet extracted from the reference sample film;
- The final storyboard, captions, page states and SFX plan;
- The selected `references/shots/*.md`;
- `aesthetic-rules.md`;
- The data compliance standard.

When any input is missing, mark it "cannot verify" and do not guess the production baseline yourself. When the index, the card documentation, the demo source and the Gallery reference sample film conflict with one another, report the source of the conflict explicitly and do not pick one yourself as the truth.

## Checklist items

### P — Product goals

- P1: Are the product positioning, target users and core selling points clear?
- P2: Does the finished film put its attention on the feature priorities confirmed or recorded by the current mode?
- P3: Does it make claims about features that do not exist in the project, were not confirmed, or are easily misleading?
- P4: Can the execution choices in the requirements-to-execution decision table be found landed in the storyboard, copy, page states, audio and material? A fixed "audience/purpose → style" stereotype mapping must not replace the project's own grounds.

### F — Feature completeness

- F1: Does every "feature that must be shown" have at least one clearly recognisable shot?
- F2: Does each shot provide new information, and are there repeated features or repeated taglines?
- F3: Do the page states let the audience understand the feature, rather than being merely decorative motion?

### V — Visual direction

- V1: Do the typeface, palette, material, corner radius, lighting feel and information density match the confirmed or recorded visual direction?
- V2: Do the motion speed, overshoot, hold and energy curve match the confirmed or recorded motion character?
- V3: Has it deviated from the production baseline and drifted into Ink Press, cyber neon or another unrelated style?
- V4: Have banned colours, effects or brand characteristics been used?

### S — Shot cards and Gallery variants

- S1: Do the shot cards in the feature mapping actually appear in the corresponding shots?
- S2: When the user names a `card name · style name`, do the `style-key`, the exact demo TSX and the Gallery reference sample film point to the same variant, and does the finished film use that variant?
- S3: Comparing against the exact demo TSX and the Gallery reference sample film, are the action grammar, key timing values, easing relationships and mask timing of the recipe card/demo preserved?
- S4: Does it violate the "known pitfalls / critical weak points" marked on the card?
- S5: Are the adapted product screenshots, coordinates and brand tokens natural?
- S6: Are styles marked "reference only, needs custom implementation" explicitly named by the user, with their implementation risk flagged in the report? Are styles marked "preview missing" kept from claiming to match a dynamic sample film?

Pixel-level consistency with the Gallery sample film is not required. What is checked is whether the motion grammar and key parameters are faithful, while allowing adjustments to the screenshots, coordinates, copy, brand visuals and necessary composition for the target product.

### B — Storyboard consistency

- B1: Do the shot order, durations and feature information match the confirmed or recorded final storyboard?
- B2: Are the main action, page state, material source, captions, transitions and SFX consistent?
- B3: Does the brand wordmark hold for at least 1 second, and does a batch motion end with at least 0.5 seconds of stillness?
- B4: After the final storyboard was approved, were key shots deleted, replaced or added without grounds?

### D — Data and material safety

- D1: Is the real-data, fictional-data or redaction standard followed?
- D2: Is any customer, personal, secret, internal address or other sensitive information exposed?
- D3: When showing real product pages, are real screenshots used rather than low-quality hand-built recreations?
- D4: Are the screenshot states, fonts, images and dynamic data fully loaded?
- D5: Does public demo data have a verifiable public provenance? Has customer, personal, internal, secret, live or other sensitive data been fictionalised, redacted or frozen?

### A — Audio and rhythm

- A1: Does the BGM match the confirmed or recorded audio direction, and does the volume leave room for the SFX and optional voice-over?
- A2: Are the SFX pinned to the real action key frames, and is there any obvious misalignment?
- A3: For strong-rhythm music, is the cut-point error no more than 3 frames?
- A4: Are the ending's energy peak and the riser→impact→sparkle phrasing in place (if the storyboard uses it; the sparkle beat is taken from `sfx/light/`)?
- A5: Do all long samples (>5s, 21 in the library) explicitly have a `durationInFrames`, and does any sound effect drag on and keep sounding after the action ends?
- A6: Is each SFX actually audible in the **rendered output** (do not go by the preview — the preview clamps volume to 1.0)? For material that was recorded quietly (peak <-12dB, 7 in the library), which may still be covered by the BGM even at 1.0, has it been swapped, pre-normalised or given enough gain >1, and is `max_volume` still unclipped after rendering?
- A7: Are UI-type sound effects real-object textures rather than synthetic feedback prompt tones (the S1 distinguishing question)? If synthetic tones such as `ui-confirm-*` `ui-*-tone` `ui-notify-*` in `sfx/ui/` appear in the finished film, is there a narrative reason of "the system is speaking" and has it been written into the project documentation (see sound-design 3.3 for the file-by-file texture table)?
- A8: For a film with BGM, were two versions of the finished film delivered, with BGM / without BGM (SFX retained), and do both come from the same timeline (the without-BGM version is frame-by-frame identical in picture and SFX to the with-BGM version)?
- A9: For a beat-hit / SFX-dense film, were the output audio track offset and the source peak lag measured on the finished film and compensated (sound-design §4.6), is the compensation constant accompanied by a measurement record (the four render-pipeline elements, the probe, the method, the date), and are the source analysis value and the output offset accounted separately (SOURCE_BEAT0 not contaminated)? Does the post-render back-test error table show no systematic same-direction offset (music-beat-sync §5b)?

### Q — Visual technical quality

Run `aesthetic-rules.md` in full. At minimum check text sharpness, composition, rounded-corner masks, 3D texture clarity, element placement, camera shake, transition seams, cheap-looking light effects, readable duration and deterministic rendering.

## Report format

Each conclusion uses a number, and problems carry a frame number or screenshot:

```text
P1 ✓ The product positioning and core selling points are clear.
F2 ✗ Frame 340: the confirmed knowledge-graph feature does not appear in the finished film.
V3 ✗ Frame 420: the large amber paper material deviates from the confirmed deep-blue tech direction.
S2 ✗ Frame 515: the user chose whip-pan, but it was actually implemented as flash-cut.
Q2 ✗ Frame 615: after the 3D push-in the body text is blurry, see key frame f615.png.
```

Finally list, by severity, the items that must be fixed, the suggested optimisations and the items that cannot be verified. Do not substitute an evidence-free "overall pretty good" for the item-by-item check, and do not mark everything as passed just to make the report look good.
