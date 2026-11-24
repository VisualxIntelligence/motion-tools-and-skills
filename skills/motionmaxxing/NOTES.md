# motionmaxxing — notes

**Source:** [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) @ `8c8ec0f` (6 Oct 2026), an early release. Apache-2.0, © Tejas Makwana ([LICENSE](LICENSE), [NOTICE](NOTICE)). Copied 24 November 2026.

## What it is

A skill for launch videos, promos, feature reveals, brand stings, kinetic type, social ads and CTAs. It moves a film from "slop" (a slide deck that moves) to "mid" (clean, but nothing decided) to "maxxed" (one idea, a world with light and texture, measured motion, cuts on motion). It says honestly which of the three it reached.

What sets it apart is that its rules are **measured**:

- 53 frame-accurate professional moments, decoded into ~150 WHEN / DO / BECAUSE rules (`references/`, `library/moments.jsonl`).
- About 4,300 seeked moves and **12 measured eases** (`runtime/motion.js`).
- A "slop autopsy" of rejected AI films, ranking 25 default patterns.

| Finding | Measured |
|---|---|
| Median move | 10 frames (0.33 s); entries 11–12 f, opacity 6 f, blur 7–8 f |
| Landing vs leaving | Landing decelerates (58 % ease out); leaving accelerates (37 % ease in) |
| Overshoot | Under 9 % of moves, and late: a slow lean past the mark, not a fast spring |
| Arrival | Decelerates from oversize (logos from ~3.5×); nothing grows from zero |
| Fades | Elements arrive by moving: 3,392 transform entries against 584 opacity fades |
| Cuts | On motion, not on rest; 96 % of moments use hard cuts |
| Ending | A resolved end hold of 0.6–1.4 s; the ending usually gets smaller |

**The ten-step protocol** (in `SKILL.md`):

1. toolbox and taste;
2. brand;
3. one true thing;
4. the idea;
5. world and storyboard;
6. script and voice;
7. hardest beat first;
8. look honestly (render, `look.py`, `lint.mjs`);
9. sound to picture (`mix.py`);
10. deliver.

**Gates**

| Gate | Pass condition | Checked by |
|---|---|---|
| G0 | The render exists, moves and has the planned length | `look.py` |
| G1 | Proof readable: UI text ≥ 0.04 H | eye, on the sheet |
| G2 | No run of more than 3 flat frames | `look.py` |
| G3 | End hold ≤ 1.4 s; final shot ≤ 25 % | `look.py` |
| G4 | One hero per frame | eye, on the sheet |
| G5 | No page chrome | `lint.mjs` |

## The news exception (important)

**G5 fails exactly what broadcast graphics use on purpose:** corner labels, tracked-caps labels, counters, timecodes, header and footer bars, kicker-over-headline and progress bars. A lower third, a channel bug, a "LIVE" tag or a sourced timestamp is information in a news film, not slop.

- **Launch and product films:** use the skill as written.
- **News explainers and anything with broadcast furniture:** use the eases, the measured numbers, G0–G4 and the protocol, but **don't run `lint.mjs` (G5)** on frames that carry straps or bugs.
  - Write the exception into the film's `NOTE.md`, the same way cinetic records a supplied brand.
  - Keep the spirit of G5 for decoration: no counters, labels or timecodes that carry nothing.

## Requirements

Node 22+, Google Chrome or Chromium (headless, through the DevTools protocol), ffmpeg, Python 3 with numpy and Pillow. Voice and sound (`voice.py`, `sync.mjs`, `mix.py`) need an ElevenLabs key. `imagegen.py` needs the Codex CLI with image generation. `scripts/providers.sh` reports what is available, and never installs anything.

**Tested here 24 November 2026:**
- `providers.sh` reported ready (Chrome, ffmpeg 6.1.1, Node 22).
- `look.py` on a synthetic 8-second film with three hard cuts found the cuts, the end hold and the final-shot share.
- **G2 correctly failed** a 2-second flat-colour segment.

## Limits (from upstream `KNOWN-LIMITS`)

- `lint.mjs` reads the DOM, so it can't see text drawn in a canvas, WebGL, an image or video.
- G1 and G4 have no script.
- WebGL hero scenes render at about 7–11 fps at 1080p on an Apple GPU.
- Don't mix GPU and software GL inside one film.

## Changes from upstream

- **Copied.** `SKILL.md`, `LICENSE`, `NOTICE`, `references/`, `taste/`, `scripts/`, `runtime/` (motion.js, the hero3d scene, native-UI kit, GSAP, Inter with its OFL), `templates/`, `library/` and `examples/`. Unchanged.
- **Left out.**
  - `docs/` (20 MB of comparison films and GIFs that show third-party brands: Cluely, Spotify, Wispr Flow).
  - `studies/` (judgement-study images).
  - `install.sh`, which copies into `~/.claude/skills`; install from this repo instead.
  - The README, which advertises FinalMotion.
- **Added.** This `NOTES.md`, including the news exception above.
