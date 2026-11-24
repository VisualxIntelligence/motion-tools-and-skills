# saas-motion-video (saas-motion-kit) — notes

**Source:** [tugrawork-creator/saas-motion-kit](https://github.com/tugrawork-creator/saas-motion-kit) @ `bc7a414` (4 Oct 2026), v1.4. MIT, © 2026 saas-motion-kit contributors ([LICENSE](LICENSE)); fonts (Manrope, Instrument Serif, JetBrains Mono) OFL 1.1 ([docs/assets/fonts/LICENSES.md](docs/assets/fonts/LICENSES.md)). Copied 24 November 2026. The kit's skill is `/saas-motion-video`; the kit is folded into this one folder.

## What it makes

**Promo and motion films for software products in HyperFrames**, built to one rule: **no two films should feel like the same film.** It trains the habit with a staged process and a machine check for repetition.

- **A 7-stage playbook** with a human gate at each stage: brief → components → theme → storyboard → build → sound → deliver (`playbook/`).
- **Clean or imaginary components** (`components/`): animate the product's real UI when it is clean; otherwise design simplified, truthful imaginary UI in the brand's tokens. Never fake capabilities, customers or numbers.
- **The creative muscle** (`creative/`): seven questions per storyboard; a **tone matrix** ("I want to say ___ in a ___ tone") mapping tone to speed, eases, camera, colour, type, transitions and sound; **variety rules**; a component forge; **24 narrative transitions** in an atlas (match cuts, carries, camera moves, masks, materials, time), each with the tone it fits and what not to pair it with; a human layer (generated fictional people, always with a 3D move and a product beat); and **references**: credit every reference film by name and link, and borrow only grammar.
- **101 visual themes** in 11 families (product UI as the stage, type and graphic systems, material and 3D, light and optics, metaphor, signature directions, data storytelling, characters and mascots, art movements, camera and edit grammar, hardware-ad grammar). Each sheet in `docs/themes/` shows hook → reveal → proof → CTA, six components, three motion techniques with timings, the risk to watch and how to adapt it; `docs/themes/data/*.json` is the machine-readable version. Open `docs/index.html` and `docs/transitions/index.html` in a browser (thumbnails are not copied; see below).
- **Tools** (`tools/`):
  - `variety_audit.py STORYBOARD.md [--history ~/.motion-ledger.json]`: flags repeated transitions, entrances, eases and directions, uniform shot lengths, no surprise for 15 s, accent overuse, tone mismatches, no new component, and uncredited `ref:` rows; remembers your previous films.
  - `pick_themes.py --tone … --audience …`: shortlists themes and skips the ones in your last five films.
  - `history_report.py`: what you keep reaching for, and what you have never tried.
  - `breakdown.py`: a reference film into shots, rhythm, a contact sheet and a draft ledger, with a credit header.
  - `deliver.sh` (4K → delivery size, loudness-normalised), `loop_check.py` (first vs last frame), `warm_sfx.py` (warm tuned UI sounds in C major), `screen_track.py` (corners of a green screen in a plate, to pin UI onto it), `fal_shots.py` (a shot list on fal's queue).
- **Examples:** `acme-suite-loop/` (a full HyperFrames project: a silent 40 s 3D booth loop, with its v1 storyboard that the audit caught 11 repeats in), `six-films/` (one 12 s script told in six themes, each with its storyboard and new component), `human-layer-ots/`, and `prompts/` (the real prompt behind a finished promo, with a fill-in template). All "Acme" products are fictional.

## When to use it

- **Product and feature promos**, and any series where the films start to look alike: the variety audit and `--history` ledger are useful for the daily AI news explainers too, whatever the engine.
- **`pick_themes.py --tone trustworthy`** is a quick way to find a look for a serious or news-adjacent piece (it suggested *053 Editorial Data* and *056 Workflow Canvas*).
- Its hard rules suit product films (no progress bars, no gradient text, no pure #000/#fff, no bounce on UI). For news, keep our own broadcast rules.
- For non-Latin type, its advice matches ours: ship font subsets locally and type uppercase yourself (CSS `text-transform` breaks Turkish İ).

## Requirements

Node 22+, ffmpeg and Claude Code; the HyperFrames skills (`npx skills add heygen-com/hyperframes`, not vendored). Python tools need numpy, Pillow and soundfile. `fal_shots.py` needs a fal key; MusicGen weights are non-commercial, so use licensed music for client work.

**Tested here 24 November 2026:**
- `variety_audit.py` on all nine example storyboards: the eight finished ones pass, and `acme-suite-loop/STORYBOARD.v1.md` gives **11 warnings**, as the kit's lesson says.
- `pick_themes.py --tone trustworthy --audience "news audience"` returned ranked themes with reasons; `--append` recorded a film in a history file and `history_report.py` wrote its HTML report.
- No film was rendered.

## Changes from upstream

- **Copied:** the skill's `SKILL.md` (from `.claude/skills/saas-motion-video/`), `creative/`, `playbook/`, `components/`, `templates/`, `tools/`, `examples/`, `CHANGELOG.md`, `LICENSE`, and from `docs/`: the gallery and transition-atlas pages, the 102 theme sheets, `themes/data/`, the Acme brand mark and fonts. Paths inside the kit are unchanged, so the skill's references resolve.
- **Left out:** `docs/themes/thumbs/` (2.8 MB of JPEG thumbnails; rebuild with `tools/make_thumbs.py`), `docs/six-films.gif`, `docs/theme-101.jpg`, `docs/assets/readme-hero.jpg`, the READMEs (English and Turkish), `SECURITY.md` and the GitHub Action (`.github/workflows/variety-audit.yml`; copy it from upstream into a film repo if you want the audit on every push).
- **Added:** this `NOTES.md`.
