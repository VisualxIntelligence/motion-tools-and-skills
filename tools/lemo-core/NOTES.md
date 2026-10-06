# lemo-core — notes

**Source:** [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) @ `b65efe6`: the `core/` folder, `package.json`, `requirements*.txt`, `tools/web_cuts.sh` and `styles/microgame/demo/tools/cuecheck.py`. MIT, © 2026 LemoLab ([LICENSE](LICENSE)). Code comments are partly in Chinese; the command reference is [`core/README.md`](core/README.md).

## What it is

The shared production toolkit behind the 43 Lemo-Opuscar film styles. Any page that follows its **page contract** can use it:

| Global | Meaning |
|---|---|
| `window.READY = true` | set once fonts and images have loaded |
| `window.render(t)` | draw the frame at second `t`, deterministically |
| `window.DUR` | length in seconds |
| `window.EV = [{t, type, …}]` | optional sound and cue events |
| `window.TEXTS(t)` | optional: every on-screen text at `t` with its box, for the reading-time check |

## The tools

| Command (run from this folder) | What it does |
|---|---|
| `node core/render/video.mjs <film> --fps 24 --workers 3` | Every frame to MP4; each worker its own browser; JPEGs piped to ffmpeg and joined losslessly; cleans up after a crash |
| `node core/render/still.mjs <film> <t…> [--range a:b:step]` | Review stills |
| `node core/render/readcheck.mjs <film>` | Fails any on-screen text that is not up long enough to read (Latin 15 chars/s, CJK 4.5/s, +1.5 s) |
| `node core/render/events.mjs <film>` | Exports `{dur, ev}` for the sound mix |
| `sh core/render/mux.sh video.mp4 mix.wav out.mp4 [fps] [grain]` | Two-pass loudnorm to −14 LUFS / −1.2 dBTP, film grain in ffmpeg, refuses damaged or truncated audio, never leaves a partial file |
| `python core/render/sheet.py out.jpg img…` · `srt.py cues.json out.srt` | Contact sheet · subtitles |
| `python core/tts/tts.py lines.json out/` | Kokoro TTS, offline (English, Chinese) |
| `python core/tts/tts_zh.py lines.json out/` | edge-tts, online (Microsoft voices) |
| `python core/tts/asr_check.py lines.json voices/` | Whisper back-check of every voice line; writes word timestamps |
| `core/audio/sfx.py` | Procedural foley and mix helpers: click, whoosh, thump, ding, compress, limit, pan |
| `core/audio/sampler.py`, `pluck.py` | Sampled instruments (needs sample packs, see `core/audio/INSTRUMENTS.md`) and Karplus–Strong plucked strings |
| `core/three/post.js` | three.js post: GTAO → physical depth of field → bloom → grade, with 2× supersampling |
| `core/post/crt.js` | WebGL2 VHS / CRT pass |
| `core/lib.js` | Seeded random, easing, spring, monotone cubic tracks |
| `python tools/cuecheck.py` | Measures the offset in ms between visual hits and music cues (demo-specific; adapt the paths) |
| `sh tools/web_cuts.sh` | 720p web cut |

## Layout and paths

The folder keeps upstream's layout (a library root containing `core/`), because the page server resolves pages' absolute URLs like `/core/lib.js` from the folder two levels above `core/render/`. So run commands from `tools/lemo-core/`, and put film folders inside it or pass their path. `core/README.md` and the scripts mention `plugin/skills/lemo-opuscar/scripts/setup.sh`, `TECHNIQUE.md` and `styles/`; in this repo those are at [`../../skills/lemo-opuscar/`](../../skills/lemo-opuscar/), [`../../docs/guides/lemo-opuscar/`](../../docs/guides/lemo-opuscar/) and [`../../prompts/film-styles/`](../../prompts/film-styles/).

## Install

```
cd tools/lemo-core
npm install                                   # playwright-core, three
npx playwright install chromium               # or point it at an installed Chrome
python -m venv .venv && .venv/bin/pip install -r requirements.txt            # numpy, scipy, soundfile, soxr, pillow
.venv/bin/pip install -r requirements-voice.txt                              # optional: TTS + Whisper
```

ffmpeg must be on the PATH. Node 20+, Python 3.11+. `mux.sh` is POSIX shell (WSL or Git Bash on Windows).

## Not copied

`core/fonts/` (OFL fonts with reserved names), `core/assets/` (Poly Haven models and textures), the instrument sample packs and the Kokoro model (fetched by upstream `tools/fetch.sh`), and `requirements-dev.txt`.
