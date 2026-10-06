# lemo-opuscar — notes

**Source:** [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar/tree/main/plugin/skills/lemo-opuscar) @ `b65efe6`. MIT, © 2026 LemoLab ([LICENSE](LICENSE)).

## What it is

A small entry skill for the Lemo-Opuscar library: 43 film styles, each a style prompt plus a demo short film made entirely in code (no video model, no stock footage). When invoked, `scripts/setup.sh` sparse-clones the library to `~/lemo-opuscar` (or updates it), installs the dependency tier you ask for, and hands over to the library's `AGENTS.md`. That file runs the job: pick a style, one round of brief questions, a written treatment, then produce and self-check.

## Where the rest of the library is in this repo

| Upstream | Here | What it is |
|---|---|---|
| `styles/*/STYLE.md`, `style.json` | [`../../prompts/film-styles/`](../../prompts/film-styles/) | The 43 style prompts, with an index table |
| `AGENTS.md`, `DIRECTOR.md`, `TECHNIQUE.md`, `MAINTAINING.md` | [`../../docs/guides/lemo-opuscar/`](../../docs/guides/lemo-opuscar/) | The agent router, the directing guide and the pipeline guide |
| `core/`, `requirements*.txt`, `package.json`, `tools/web_cuts.sh` | [`../../tools/lemo-core/`](../../tools/lemo-core/) | The shared render, audio, TTS and QA tools |

The skill itself does not use these copies; it works from its own clone of the upstream library, because the demos, fonts and sample packs are only there.

## When to use it

To make a short film in one of the 43 styles end to end (for example Swiss motion graphics, data storytelling, isometric infographic, dark tech keynote, whiteboard explainer, 60s spy titles). It handles voice-over (Kokoro offline, edge-tts online), a Whisper check of the voice, procedural and sampled music, mixing and subtitles.

## Requirements

Node.js 20+, Python 3.11+, ffmpeg, git. Extra dependency tiers: `voice` (kokoro-onnx, edge-tts, faster-whisper and the Kokoro model) and `music` (numba). Sample instrument libraries are 70–400 MB each and fetched on demand. The scripts are POSIX shell; on Windows run them under WSL.

## Install

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

Or copy this folder to `~/.claude/skills/lemo-opuscar` (see [`../README.md`](../README.md#installing-a-skill)).
