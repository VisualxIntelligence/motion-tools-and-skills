# sync-check — notes

**Source:** [iart-ai/javascript-animation-skills](https://github.com/iart-ai/javascript-animation-skills) @ `f7d0882`, `skills/soundtrack/scripts/sync-check.mjs`. MIT, © 2026 iart.ai ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it does

Checks that a rendered film's **sound lands on its picture**. It finds the visual events, either by detecting hard cuts and dips to blank or from your declared cue times. It then finds the audio onsets, and reports for each event:

- the **offset** to the nearest strong onset, flagged **OFF-BEAT** beyond ±100 ms (about 3 frames at 30 fps);
- the **loudness jump** into the event, flagged **STARTLE** above +6 dB. Upstream measured that jumps of 7–10 dB read as startling.

It exits 1 if any event fails, so it can gate a build.

```
node sync-check.mjs film.mp4                                  # detect cuts and check them
node sync-check.mjs film.mp4 --cues-file film.cues.json       # check declared cue times (preferred)
node sync-check.mjs film.mp4 --cues-file film.cues.json --tol 80
```

The cues file is a JSON array of times in seconds (scene cuts and in-scene hit points), for example `[0, 2.5, 4.0, 7.25]`.

- **From a GSAP timeline:** export the cues from its labels.
- **From a `timeline.json`:** flatten the beat values (see [`../../skills/claude-motion/`](../../skills/claude-motion/NOTES.md)).

## Requirements

Node 18+ and ffmpeg/ffprobe. No npm packages.

## Where it fits

| Tool | What it does |
|---|---|
| This tool | **Measures** a finished MP4 |
| [`lemo-core/tools/cuecheck.py`](../lemo-core/NOTES.md) | Checks a score's hits against the picture's event list |
| [`mgaudio`](../../starters/mg-styles-15/lib/audio/README.md) sync points | Place sounds so they land |
| [`claude-motion/scripts/wave.mjs`](../../skills/claude-motion/NOTES.md) | Shows the same thing as a picture |

## Changes from upstream

None. Upstream's `soundtrack` skill around it (an offline Web Audio score for canvas films) is not copied; read it upstream.
