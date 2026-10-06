# painted-animation — notes

**Source:** [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills/tree/main/skills/painted-animation) @ `59744a6`. MIT, © 2026 tuzhechen2005 ([LICENSE](LICENSE)). The `template/` folder is [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel, MIT, © 2026 John Heibel ([template/LICENSE](template/LICENSE)), with a karaoke module added.

## What it makes

Hand-painted watercolour-and-ink cartoon videos (MP4): animated shorts, music videos, lyric videos with word-by-word karaoke, and seamless GIF loops. Drawn with p5.js + p5.brush, rendered frame by frame in headless Chrome, encoded with ffmpeg. The default character is Clawd; any character can be used.

## Why it is worth having

`template/ANIMATION_GUIDE.md` (36 KB) is the most useful single document in the whole survey. It is written for an agent and covers:

- three goals (handmade, alive, one piece) and seven rules, including "something happens in every scene", "timing: model the viewer" and "transitions always";
- the classic animation principles, each mapped to an engine helper;
- a storyboard template (logline, world and palette arc, motif, emotion arc, then shots with **reads**: what the viewer should understand, and when);
- the review loop: contact sheet → frame strip → full-resolution crops, read back by the agent, with a review budget;
- the full engine API, known p5.brush quirks, common failures, and a worked timing example.

Most of it applies to any medium, including HyperFrames and Three.js + GSAP. Read it even if you never draw with p5.

## Engine highlights (`template/src/`)

- `core.js`: paint and ink wrappers over p5.brush, camera, iris and shaped-iris reveals, brush-wipe transitions, procedural paper and grain, closed-form motion helpers (`spring`, `jump`, `take`, `arcPt`, `onTwos`), `boilSeed(key)` for per-element line boil, `glow()` additive light, `ribbon()` and `through()` curves.
- `clawd.js`: a character rig with 5 drawn key views and turns with smears, 31 emotions each with face, tint and a beat-locked idle, acted emotion transitions (`emotions()`), dances. The rig pattern is reusable for any character.
- `karaoke.js`: word-by-word lyric fill.
- `render.mjs`: the review-and-render tool (see [`../../tools/headless-render/`](../../tools/headless-render/)).

## Other useful files

| File | Use |
|---|---|
| `references/music-video.md` | Lock the song grid, storyboard shape for songs, chapter code layout, splitting a long video across parallel sub-agents, long renders. Based on the P(doom) music video. |
| `scripts/beat_grid.py` | Tempo and beat-phase detection with numpy (spectral flux), and LRC lyric lines → beat index. Run it before storyboarding anything music-synced. |
| `template/docs/emotions.jpg`, `views.jpg` | Model sheets the skill tells the agent to read (about 0.5 MB each, kept for that reason). |

## Requirements

Node.js, Chrome or Chromium, ffmpeg; Python 3 + numpy for `beat_grid.py`. p5 2.3.3 (LGPL-2.1, installed by npm, not stored here), p5.brush 2.2.3, puppeteer-core. Slow without a GPU (seconds per frame); `template/gpu_probe.mjs` checks which GPU headless Chrome uses. Fonts load from Google Fonts at render time.

## Install

See [`../README.md`](../README.md#installing-a-skill). Upstream plugin install:

```
/plugin marketplace add tuzhechen2005/opus-video-skills
/plugin install painted-animation@opus-video-skills
```

As with kinetic-reel, the scaffold path in `SKILL.md` assumes a copied or symlinked install under `~/.claude/skills/`, and the script needs bash and `rsync`.

## Caveats

- **Clawd is Anthropic's mascot.** The code is MIT; the character design is not covered. Use your own character for anything published or broadcast.
- Fonts are fetched from Google Fonts at render time.

## Changes from upstream

- Removed `examples/xiaozhen/` and `docs/xiaozhen-sheet.jpg`: a lyric video whose storyboard and code quote a commercially released song. See [`../../docs/reference-only.md`](../../docs/reference-only.md).
- Removed `docs/koi-gag.gif` (4.7 MB) and `template/package-lock.json`. README image links to removed files are broken; see them upstream.
