# motion-designer — notes

**Source:** [kaventro/motion-designer](https://github.com/kaventro/motion-designer) @ `7d0b8bb`, the `skills/motion-designer/` folder. MIT, © 2026 kaventro ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it makes

Short films as HTML pages in which **every frame is a pure function `seek(t)`**, captured frame by frame over the Chrome DevTools Protocol and encoded with ffmpeg. Its main target is app launch films (the real UI in an iPhone or laptop frame, or a story in panels), and it also does:

- titles and stings;
- kinetic type;
- explainers and data pieces;
- an **overlay mode**: graphics over existing footage (`--under footage.mp4`), the route for straps, callouts and lower-third-style elements.

**The workflow:**

1. **Doctor.** Check the setup.
2. **Brief.** Written in plan mode.
3. **Material.**
4. **Concept.** Four approved stills.
5. **Build** from a template (`blank`, `overlay`, `mobile`, `desktop`, `story`).
6. **Sound.**
7. **QA.**
8. **Render.**

| Script | What it does |
|---|---|
| `check.mjs` | **Determinism gate:** no clocks, randomness or CSS animation; the loop closes; the same frame in any seek order; single-file build pixel-equal to the source |
| `render.mjs` | `video`, `sheet`, `stills`, `cues`, `verify`; `--blur 8` sub-frame motion blur; `--under footage.mp4` overlay |
| `cdp.mjs` | The Chrome driver |
| `beats.py` | Pure-Python tempo and onset analysis |
| `music_edit.py` | Cuts music to **whole bars** so cues stay on the beat |
| `sfx.py`, `voiceover.py` | Effects and voiceover mix |
| `tts_kokoro.py`, `tts_chatterbox.py` | Local TTS; `tts_chatterbox.py` also speaks Arabic and 22 other languages (see *Other languages* below) |
| `music_gen.py` | Music generation with ACE-Step (optional setup) |
| `build_single.py` | Packs a film into one HTML file |
| `assets.py`, `sheet.py`, `new_film.sh`, `doctor.sh` | Asset packing, contact sheets, film scaffold, setup check |
| `symbols.swift` | SF Symbols export (macOS only) |

**The clock and the review:**

- **Beat clock.** `film({BPM, BEATS, holds})` with `B(n)` times. Holds are whole beats, so every later cue stays on the beat.
- **Reviewer agents.** Parallel reviewers score contact sheets 1–10 until every score is 8 or more (`reference/reviewer.md`).

The references are specific and tested:

- **`motion.md`.** Easing and springs, camera moves of 0.8–1.2 s, hold 1–2 s per result, text at least 20 px, and the fractional-pixel text trap.
- **`qa.md`.** A failure catalogue.
- **`effects.md`, `music.md`, `voiceover.md`.**
- **`rights.md`.** Music, fonts and UI captures: what you may use and how to credit it.

## When to use it

- **Determinism.** `check.mjs` is a generic determinism gate for any `seek(t)` page. It is the strictest such check in the repo.
- **Music.** `beats.py` and `music_edit.py` for cutting a track to the edit in whole bars.
- **Overlays.** Overlay mode for graphics over existing footage.
- **Rights.** `reference/rights.md` before using any third-party music, font or UI.
- **App and product films** of the team's own tools.

## Requirements and platform

- **Software.** Node 18+, Python 3, ffmpeg, Chrome. Run `bash scripts/doctor.sh`; `reference/setup.md` lists the optional pieces (Kokoro or Chatterbox TTS, ACE-Step music).
- **Windows.**
  - `cdp.mjs` looks for Chrome at macOS and Linux paths, so set the `CHROME` environment variable to `C:\Program Files\Google\Chrome\Application\chrome.exe`.
  - The `.sh` scripts need WSL or Git Bash.
  - `symbols.swift` is macOS-only (SF Symbols), and is only needed for Apple-style app films.
- **GPU.** `cdp.mjs` launches Chrome with `--disable-gpu`, which suits DOM and canvas pages. For WebGL or Three.js scenes, remove it and add `--use-angle=d3d11`.

## Other languages (Chatterbox)

Added here on 26 Nov 2026: give a voice (or a single line) a `"lang"` code in the voice-over script and `tts_chatterbox.py` speaks it with **Chatterbox Multilingual** instead of the English model.

```json
"voices": { "narrator": { "lang": "ar", "sample": "voices/narrator-ar.wav", "exaggeration": 0.4 } },
"lines":  [ { "id": "l01", "voice": "narrator", "text": "..." } ]
```

- **Languages:** `ar` da de el en es fi fr he hi it ja ko ms nl no pl pt ru sv sw tr zh. No `lang`, or `en`, keeps the original English model, so existing scripts sound the same.
- **V3 or V2.** Multilingual V3 (better speaker likeness, fewer hallucinated words) is only in Chatterbox's git source; the PyPI release that `setup_tts.sh` installs (0.1.7) loads V2, and the script falls back to it with a warning. For V3: `VIRTUAL_ENV=<venv> uv pip install "chatterbox-tts @ git+https://github.com/resemble-ai/chatterbox@ab55923"`.
- **Give an Arabic voice sample.** `"sample": "turbo"` makes an English reference voice, so an Arabic line would carry an English accent. Use a 10 s clip of the target voice, recorded with that person's consent.
- **Length check.** `voiceover.py` compares each take with the line read plainly, using macOS `say` at an English rate (or words ÷ 2.6 where `say` is missing). If good Arabic takes are rejected as too long or short, reword the line or relax the 0.8–1.6 window for that film.
- **Watermark.** Every Chatterbox file carries Resemble AI's PerTh watermark, which survives MP3 and editing; check one with the `perth` package. Still label synthetic voices on air.
- **Not tested here** (no GPU in this sandbox, and the models are 2 GB). Try one Arabic line on the 4090 before a full script.

## Changes from upstream

- **Unchanged,** except `scripts/tts_chatterbox.py`: per-voice or per-line `lang` with Chatterbox Multilingual (26 Nov 2026).
- **Left out:**
  - `examples/` and `docs/`: 94 MB, almost all media — preview films, base64 asset bundles of real app UIs, fonts, and licensed music.
  - `site/`, `evals/`, `tests/`, the plugin manifests and the README.
