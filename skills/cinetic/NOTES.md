# cinetic — notes

**Source:** [Leonxlnx/cinetic](https://github.com/Leonxlnx/cinetic) @ `f4bbfc8` (7 Nov 2026), version 1.5, the `skills/cinetic/` folder. MIT, © 2026 Leonxlnx ([LICENSE.txt](LICENSE.txt)). Copied 24 November 2026.

## What it makes

**Launch films and update films** ("vX is out") from code, plus product and feature videos, looping feature animations, logo stings, UI walkthroughs, teasers and promo clips. The agent directs a short film rather than arranging components. Picture, words and sound run from one timeline file, and nothing is finished until it is rendered, measured and reviewed.

- **Engines.** Remotion 4.0.529 (default) or HyperFrames 0.8.79 (`--engine hyperframes`), with the same tokens and timeline contract.
- **Copy first.** A script a stranger understands in 5 seconds: what the product is by 3 s, one thing per line in 2–7 plain words, then the name and what to do.
- **One line at a time, each with its own animation.** 23 tested text animations and a book of **466 devices** (`references/devices/`, `assets/library/`), while the camera keeps the picture moving.
- **Templates** (`new-film.sh --template`):

  | Template | Length | Use when |
  |---|---|---|
  | none | 15–45 s | the idea is its own device |
  | `update` | 15–23 s | 2–4 changes to show |
  | `ui-walkthrough` | 25–40 s | input in, visible work, output out |
  | `capability-reel` | 15–25 s | breadth is the story |
  | `camera-teaser` | 20–25 s | a dark, fast teaser |
  | `prompt-run` | 18–20 s | a request comes back done |
  | `social-ad` | 15 s | a feed ad |
  | type explainer | — | a type-led explainer |

- **The product built in code.** Screens come back as live components at film size.
- **Logos.** `logos.mjs` fetches official integration logos and records source, licence and trademark owner.
- **Brand.** `brand.py` writes a supplied brand kit into the film, or designs one from three personality words. A supplied brand always beats the house taste.
- **Sound.** `music.mjs search` finds a human-made instrumental track in catalogues that need no credit (Mixkit; CC0 on Wikimedia Commons, ccMixter, Openverse), auditions it and keeps a licence record beside the file. Effects come from the [earshot](https://github.com/Leonxlnx/earshot) bank, one per action, mixed at −14 LUFS.
- **Gates.** Motion that snaps, freezes or stops dead; flat pictures; filler shapes; banding; BT.709; a sync-checked mux; layout, copy and spine checks (`lint-film.mjs`, `forensics.py`, `look-audit.py`, `layout-audit.sh`).

## When to use it

- Launch, update and feature films, and stings. It is the most complete launch-film skill in the repo; `video-shotcraft` and `claude-motion` cover nearby ground.
- **Not for news explainers as is.** Its rules (words centred in the middle band, no counters or captions beside a statement, no serif, no orange or purple, no stacked labels) are house taste for product films. Record a brand or format exception in `BRIEF.md` as the skill says, or use `docs/guides/explainer-grammar/` for news.

## Requirements

Node 22+, ffmpeg 6+ with libx264, Python 3.11+ with numpy, scipy, soundfile, pyloudnorm, opencv-python and librosa, and Chromium or Chrome Headless Shell. **earshot 0.4+** in its own virtualenv, with `EARSHOT_PYTHON` pointing at it; without earshot the soundtrack gate fails, and `score.py --draft` only gives placeholder timing.

**Licence of the engine.** cinetic is MIT, but Remotion has its own licence: free for individuals and companies of up to 3 people, **a company licence from 4**. For Al Jazeera or MAKEENA client work, either hold a Remotion company licence or use `--engine hyperframes`.

## Starting a film

```bash
bash skills/cinetic/scripts/new-film.sh films/acme --fps 60 --size 1920x1080
bash skills/cinetic/scripts/new-film.sh films/acme-2 --template update --brand ./brand \
  --music ./audio/track.mp3 --record ./audio/track.licence.json
cd films/acme && node scripts/music.mjs search --mood "calm, precise" --bpm 100-120 --length 25
bash scripts/render.sh Film out/film.mp4 --max-min 9
```

`new-film.sh` copies the starter and every script into the project, so a film runs on its own.

**Tested here 24 November 2026:**
- `new-film.sh /tmp/cfilm --fps 30 --size 1280x720` scaffolded a project and installed its npm dependencies.
- `npx remotion still Film --frame=60` rendered. The starter is an empty white stage until scenes are written.
- `music.mjs` and `new-film.sh` print their help.
- The doctor step reported earshot missing, as expected. No full film was made.

## Changes from upstream

- **Copied.** `SKILL.md`, `references/`, `scripts/`, `assets/`: the starters for both engines, the templates, the device library, 8 OFL fonts with their `OFL.txt`, directions and critics. Unchanged.
- **Left out.**
  - `scripts/test/` (2.5 MB of script tests and fixtures, with invented-brand logos). `new-film.sh` never copies it into a film; fetch it from upstream to run `lint-film.test.mjs` and the other script tests.
  - The repo's `docs/` (setup guide and brand art) and `evals/`.
- **Added.** This `NOTES.md`.
