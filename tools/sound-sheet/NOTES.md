# sound-sheet — notes

**Source:** [AgentsORG/design-engineering](https://github.com/AgentsORG/design-engineering) @ `a79af5c` (13 Nov 2026), version 4.8.0: `skills/design-engineering/scripts/sound-sheet.mjs`, `sound-family.mjs` and `sound-family.example.json`, and the launch film's cue sheet `docs/demo/hyperframes/assets/sfx/cues.json` (as `examples/launch-film-cues.json`). MIT, © 2026 AgentsORG ([LICENSE](LICENSE)). Copied 24 November 2026. The guide these scripts belong to is [`docs/guides/launch-film-grammar/`](../../docs/guides/launch-film-grammar/NOTES.md).

## What it does

**`sound-sheet.mjs` renders a stereo sound-effects stem from a motion cue sheet, with no sample library.** Each cue names a visual event (what lands, where on the canvas, how big it is, which way it moved, how long the tween took) and every audio property is derived from it, so the sound cannot disagree with the picture:

| From the motion | To the sound |
|---|---|
| size | pitch and decay (big things land low and long, small ones tick high and short) |
| x | stereo pan (constant power, ±0.7 at the edges) |
| y | brightness (higher on screen, brighter attack) |
| direction | contour (a whoosh sweeps up when the element leaves upward) |
| tween length | whoosh length, peaking on the move's fastest frame |
| t | the transient, on the **contact frame**; audio may lag by a frame, never lead |

Two registers share the renderer: **dry** (mallet landings and ticks, true silence between) and **bed** (a warm sub-heavy drone carries the film, dry clicks 10–20 dB under it, the sub pulled out before reveals, a thud on big landings). Cue kinds in the example: `click`, `tick`, `thud`, `air` (whoosh), `flicker`, `type`, `success`. It is **deterministic**: no `Math.random`, a fixed seed per cue id. Node only, no dependencies.

**`sound-family.mjs`** turns one manifest into a matched set of named sounds (mono 44.1 kHz, trimmed, peaked at −3 dBFS). A shared `material` phrase ("felt mallet on a small wooden block, dry") gives the family one character. It uses ElevenLabs sound generation when `ELEVENLABS_API_KEY` is set, and otherwise a built-in synthesiser recipe per sound; `manifest.json` records the prompts, recipes and licences. With `--family dir`, `sound-sheet.mjs` uses those files.

## When to use it

- **A first SFX pass for any code-rendered film** (GSAP, HyperFrames, Remotion, three.js): export the contact frames from the timeline as cues, render the stem, mix it under the music or voice-over. It is the "sound from motion" approach in our `claude-motion` and `cinetic` notes, as a working tool.
- Beside [`sync-check`](../sync-check/NOTES.md) (checks sound against picture after the mix) and [`lemo-core`](../lemo-core/NOTES.md)'s procedural SFX.

## Using it

```bash
node tools/sound-sheet/sound-sheet.mjs cues.json --out stem.wav --report      # --peak -1 (default), --json, --family dir
node tools/sound-sheet/sound-family.mjs tools/sound-sheet/sound-family.example.json --out sfx/ --provider synth   # or elevenlabs, or auto
```

`cues.json` holds `canvas`, `fps`, `duration`, an optional `bed` (root note in Hz, level, pad, fades, dropouts) and `cues[]` (`id`, `kind`, `t`, position, size, direction, tween…); the header of `sound-sheet.mjs` documents every field, and `examples/launch-film-cues.json` is a full 34.6 s film.

**Tested here 24 November 2026:** the example cue sheet rendered a 34.6 s, 44.1 kHz stereo stem with a per-cue report (type, time, frame, pitch, decay, pan, level). ffmpeg's EBU R128 meter read **−14.8 LUFS integrated, −0.8 dBFS peak**. A second render was **byte-identical**. `sound-family.mjs --provider synth` built the example's six sounds (tick, tap, send, receive, success, error) and their manifest; the ElevenLabs path was not tried.

## Changes from upstream

- Copied the three scripts unchanged and the demo cue sheet under a new name. Added this `NOTES.md`.
