# lemo-opuscar — notes

**Source:** [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar/tree/main/plugin/skills/lemo-opuscar) @ `b5e8ef9` (updated 21 October 2026; first copied at `b65efe6`). MIT, © 2026 LemoLab ([LICENSE](LICENSE)).

## What it is

A small entry skill for the Lemo-Opuscar library: 51 film styles, each a style prompt plus a demo short film made entirely in code (no video model, no stock footage). When invoked, `scripts/setup.sh` sparse-clones the library to `~/lemo-opuscar` (or updates it), installs the dependency tier you ask for, and hands over to the library's `AGENTS.md`. That file runs the job: pick a style, one round of brief questions, a written treatment, then produce and self-check.

## Where the rest of the library is in this repo

| Upstream | Here | What it is |
|---|---|---|
| `styles/*/STYLE.md`, `style.json` | [`../../prompts/film-styles/`](../../prompts/film-styles/) | The 51 style prompts, with an index table |
| `AGENTS.md`, `DIRECTOR.md`, `TECHNIQUE.md`, `MAINTAINING.md` | [`../../docs/guides/lemo-opuscar/`](../../docs/guides/lemo-opuscar/) | The agent router, the directing guide and the pipeline guide |
| `core/`, `requirements*.txt`, `package.json`, `tools/web_cuts.sh` | [`../../tools/lemo-core/`](../../tools/lemo-core/) | The shared render, audio, TTS and QA tools |

The skill itself does not use these copies; it works from its own clone of the upstream library, because the demos, fonts and sample packs are only there.

## When to use it

To make a short film in one of the 51 styles end to end (for example Swiss motion graphics, data storytelling, isometric infographic, dark tech keynote, whiteboard explainer, 60s spy titles). It handles voice-over (Kokoro offline, edge-tts online), a Whisper check of the voice, procedural and sampled music, mixing and subtitles.

## What changed in the 21 October update

- Eight **Evidence Films** styles that film real, sourced material: satellite briefing, engineering briefing board, LiDAR survey, projection on a white city model, data physicalization, exploded teardown, microscope story and archive light table. Every on-screen number is measured or sourced and recorded in a `FACTS.md`. These are the styles closest to news explainers.
- **Make a style your own:** ask to change a style (for example "turn Ukiyo-e into my own version"). The agent explains what can change safely, writes the new style to `~/lemo-my-styles/<name>/` outside the library, shows a style frame next to the original and then makes a 15–30 s test film. The procedure is [`../../docs/guides/lemo-opuscar/MY-STYLES.md`](../../docs/guides/lemo-opuscar/MY-STYLES.md). This is the route to a house style (a channel graphics package) that survives library updates.
- `SKILL.md`: the description now triggers on data, science and product explainers built from real material, and on "make my own style"; the agent installs a style's extra packages itself into the project folder.

## Requirements

Node.js 20+, Python 3.11+, ffmpeg, git. Extra dependency tiers: `voice` (kokoro-onnx, edge-tts, faster-whisper and the Kokoro model) and `music` (numba). Sample instrument libraries are 70–400 MB each and fetched on demand. The scripts are POSIX shell; on Windows run them under WSL.

## Install

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

Or copy this folder to `~/.claude/skills/lemo-opuscar` (see [`../README.md`](../README.md#installing-a-skill)).
