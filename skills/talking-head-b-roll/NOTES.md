# talking-head-b-roll — notes

**Source:** [iart-ai/b-roll-skills](https://github.com/iart-ai/b-roll-skills) @ `a51e34b`, the `skills/talking-head-b-roll/` folder plus two examples. MIT, © 2026 iart.ai ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it makes

Motion-graphics b-roll for a **talking-head recording**, drawn from what is said:

1. **`scripts/transcribe.mjs`** transcribes with word timings, using local whisper.cpp (`ggml-base.en` or the multilingual `ggml-small`) or the ElevenLabs Scribe API. It snaps sentence ends to pauses.
2. Each line of the transcript is marked **Speaker** (the presenter stays), **Overlay** (graphics beside them) or **Cover** (graphics fill the frame).
3. Graphics are drawn on a transparent canvas page (`templates/b-roll.html`) from the spoken numbers and keywords.
4. **`scripts/render.mjs`** composites the graphics over the untouched recording and also writes an alpha layer for the edit.
5. **`--check`** tests the plan before rendering.

**The rules in `SKILL.md`:**

- Overlays avoid the face box.
- A cover must fully hide the speaker.
- Anchors fall in the gaps between words.
- The speaker is never stretched over more than about 8 s.
- Covers last 3–8 s.
- Structure leads the voice by about 6 frames, and **key figures land on the spoken word**.
- Reveals are gated so nothing appears before it is said.

`scripts/timing.test.mjs` and `compare-timing.py` test the timing logic.

## When to use it

- **Interviews, presenter pieces to camera and explainers with a presenter.** Numbers and names said aloud become graphics at the moment they are said.
- **The general method:** word timestamps → graphic timing → checks. It ports to a GSAP or HyperFrames timeline, where `transcribe.mjs` output becomes the timeline's cue times.

## Requirements

- **Software.** Node 18+, `npm i playwright-core`, ffmpeg, Chrome, and whisper.cpp or an ElevenLabs API key.
- **Arabic.** For Arabic, use a multilingual whisper.cpp model (`ggml-small` or larger) and check the word timings, because the scripts were tested by their authors on English.

## Examples

`examples/compound-interest/` and `examples/travel-times/`: each has a finished `page.html` and `transcript.json`.

The input recordings are fetched from iart.ai's CDN (the URL is in each example's README). Their presenters are **AI avatars**, so use them only to test the pipeline, never on air.

## Changes from upstream

- **Copied.** The skill folder unchanged.
- **Examples.** Moved under `examples/` inside the skill. Render commands are updated for that layout. The contact-sheet images (`sheet.jpg`) are replaced by a pointer to upstream.
- **Left out.** The README (it advertises the iart.ai service), the plugin manifests and `showcase.gif`.
