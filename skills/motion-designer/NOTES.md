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
| `tts_kokoro.py`, `tts_chatterbox.py` | Local TTS |
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

## Changes from upstream

- **Unchanged.** The skill folder.
- **Left out:**
  - `examples/` and `docs/`: 94 MB, almost all media — preview films, base64 asset bundles of real app UIs, fonts, and licensed music.
  - `site/`, `evals/`, `tests/`, the plugin manifests and the README.
