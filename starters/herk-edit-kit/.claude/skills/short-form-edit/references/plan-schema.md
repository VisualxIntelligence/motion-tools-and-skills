# Editable plan schema

Keep one canonical map. Seconds are on the edited timeline except fields prefixed
with `source`. Quantize cuts and scene boundaries to `1/fps`; retain precise ASR
word timings rather than rounding every word independently.

`assets/plan.json`:

```json
{
  "duration": 10,
  "fps": 30,
  "scenes": [{"id":"s00","start":0,"end":10,"layout":"face","kind":"hook","anchor":"First three words","anchorTime":0.1}],
  "events": [{"time":0,"type":"paper-tap","visual":"s00","anchor":"First three words"}],
  "captions": [{"start":0.1,"end":0.8,"words":[{"text":"First","start":0.1,"end":0.3,"sourceStart":1.1,"sourceEnd":1.3}]}]
}
```

Layouts are `face`, `split`, `paper`, `broll`, and `broll-split`. For this schema,
B-roll scene `kind` names `assets/<kind>.mp4`. `events` are actual meaningful
visual actions, never filler entries inserted only to satisfy cadence. Longer
holds can carry `holdReason` on their scene and must be justified editorially.

`assets/transcript.json` contains `words` with the same text/start/end/sourceStart/
sourceEnd fields and `text`. `assets/edit-decisions.json` contains `duration`, `fps`,
`keeps` with `{sourceStart,sourceEnd,start,end}`, and reviewed removal reasons.
Every retained word must map back to one kept range without crossing a removed
interval. `sourceStart` may be absent only when no edit was made; adapt validation
explicitly for that case rather than guessing a mapping.

## Creative companion

Keep creative reasoning in DESIGN.md alongside the technical map. It must name:

- Audience, requested aspect ratios, chosen visual direction, and asset shortlist.
- Three distinct opening concepts and their rough preview paths; the selected
  concept's benefit, viewer question, evidence visible by three seconds, and payoff.
- Sequence ranges with expectation, development, consequence, attention target,
  rhythm, and source rationale. Group related shots; avoid redundant per-frame prose.
- OPEN-LOOPS.json using the schema in curiosity-and-entertainment.md. Resolve each
  promised answer before the CTA; verify closure in the rendered sequence.
- Timestamped ENTERTAINMENT-REVIEW.md findings and revisions before polish.

The plan validator checks timing and coverage. It does not validate these creative
documents or certify engagement; review their claims against the rendered footage.

## Footage ledger

For projects with B-roll, `assets/footage-ledger.json` is an array of rows:

```json
[{"scene":"s02","sourceSceneId":"wallet-opening","asset":"assets/wallet.mp4",
"sha256":"<64 lowercase hex characters>","sourceStart":0.5,"sourceEnd":1.5,
"framing":{"9x16":"Full source contained; hands and wallet visible",
"16x9":"Full source contained; captions outside the action"}}]
```

Intervals refer to that exact local asset, before playback-speed adjustment.
Record upstream source provenance separately for downloaded excerpts. Scene
identity survives crop, grade, speed, reverse, and transcode changes. Each scene
appears once per reel; the same selection can be used in both requested ratios.
`validate-footage.mjs` verifies selected rows, file hashes, duplicate scene
identities, and overlapping intervals. Visual review must still establish that
the action and result remain visible and that differently encoded duplicates
have not evaded the source identity ledger.
