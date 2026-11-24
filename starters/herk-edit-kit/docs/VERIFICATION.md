# Release verification

## Consolidated Herk Edit Kit, version 2

- All 14 canonical skills passed frontmatter validation, and all 94 skill resources
  match the Codex mirrors. The distribution check reports zero errors across
  406 cards and both skill trees.
- A clean `npm ci` succeeded. All 11 behavior tests passed, including new checks
  for caption drift, incorrect source mapping, scene coverage, footage reuse,
  missing ledger rows, and changed footage hashes.
- The starter passed preflight and HyperFrames lint with zero errors or warnings.
- The synthetic media smoke check passed again: silence output 3.960 seconds,
  clean output 3.673 seconds versus a 3.660-second transcript.
- All original `video-projects/` and root `assets/` files were retained unchanged.
  They were not all re-rendered. No real reel or paid generation was run for this
  migration; short-form verification covers its validators and resource package.

## Original pipeline release evidence

The following rendering evidence comes from the pipeline release before this
merge. Its starter and editing implementation are retained.


Verified locally on Windows, September 8, 2026, using Node 24.15.0,
FFmpeg 8.1.1, and HyperFrames 0.7.109.

- Clean dependency install succeeded; npm reported zero known vulnerabilities.
- Root AGENTS.md and CLAUDE.md match. Ten skill packages and every supporting
  resource match their generated Codex mirrors.
- The kit check validates JavaScript syntax, skill frontmatter and linked resources,
  registry counts, unique IDs, declared slots, and local card dependencies.
  All 406 card files resolve. Two cards construct some slots in JavaScript;
  their source declarations are checked, not their executed DOM.
- Five behavior tests pass: silence retiming, reviewed stutter removal, empty-cut
  identity behavior, invalid cut bounds, and early/late beat timing. The CLI
  accepts explicit project paths and attribute order independent of old examples.
- `npm run test:media` generated an eight-second test pattern with a sine tone,
  rendered both editing stages, and built the EDL review HTML. The silence output
  was 3.960 seconds; the clean output was 3.673 seconds against a 3.660-second
  transcript. A/V durations differ by less than 0.04 seconds.
- The starter passed preflight and HyperFrames lint with zero errors/warnings.
  Studio loaded and played to eight seconds. Draft render produced 240 H.264
  frames at 1920x1080 and 30fps. Extracted frames were visually inspected across
  the eight-second sequence. No black interval of 0.1 seconds or longer was detected.

## Scope and limits

This is a working toolkit, not a promise of fully automatic editorial judgment.
The library's 406 cards retain draft status; this release did not individually
render and visually approve all of them. Test each selected card with your copy.
The starter is motion graphics only, with no speech. The media smoke exercise
checks timing and stream integrity with a tone, not subjective speech-cut quality.
Paid Scribe transcription was not called during release QA. The templates require
adaptation; the glass popout needs the student's footage. HyperFrames can download
font substitutions on the first render. Cross-platform checks run in GitHub CI;
local media and rendering QA were performed on Windows.

Repeat: `npm ci`, `npm run check`, `npm test`, `npm run test:media`, then create a
new starter project and lint, preview, render, and inspect its output.
