# kinetic-reel — notes

**Source:** [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills/tree/main/skills/kinetic-reel) @ `59744a6`. MIT, © 2026 tuzhechen2005; `template/render.mjs` is derived from ClaudeAnimationBase, © 2026 John Heibel (MIT). See [LICENSE](LICENSE).

## What it makes

Editorial, high-energy kinetic-typography reels as MP4 (1920×1080, 30 fps): showreels, portfolio reels, product promos and intro films. The look is bold condensed type, HUD micro-type, a grid, three.js generative layers (particle terrain, liquid marble, chrome knot, particle clouds), a WebGL post pass (RGB split, slice glitch, grain), shape-continuity transitions, and a score synthesised in code and locked to the cuts.

## How it works

- `template/reel/cues.js` is the timeline (sections, hits, BPM, duration). Both the picture (`reel/reel.js`) and the music (`music/score.mjs`) read it, so every hit lands on its frame.
- Every frame is a function of `t`. `template/render.mjs` drives headless Chrome to make contact sheets, frame strips, crops and stills for the agent to review, then renders all frames in parallel and encodes with ffmpeg.
- `music/score.mjs` is a dependency-free Node synth (instruments, sidechain, Freeverb) that writes a WAV. Mastered to −14 LUFS.

## When to use it

- A fast reel, promo or intro in a strong editorial type style.
- As a reference implementation of three.js layers + 2D type + post pass, rendered frame-accurately. The techniques transfer directly to our HyperFrames and Three.js + GSAP work.

The style is locked to one look (black / cream / lime, Anton). For our work, treat it as a starting point and re-theme: replace the palette `K` and type `F` in `references/style-guide.md` and `reel.js`.

## Useful pieces on their own

| File | Use |
|---|---|
| `references/style-guide.md` | Motion vocabulary, layout rules and a catalogue of transitions (`TR`) |
| `references/sound.md` | Sound-design rules for synthesised scores ("no noise whooshes"), arrangement, loudness |
| `template/music/score.mjs` | Beat-locked synth score from a cue list, no dependencies |
| `template/render.mjs` | Generic review-and-render tool for any time-pure HTML/WebGL page (same tool as [`../../tools/headless-render/`](../../tools/headless-render/)) |
| `template/STORYBOARD.md` | Storyboard template |
| `examples/site-intro/` | A web autoplay intro page, plus a Cloudflare Worker that serves video with HTTP range requests |

## Requirements

Node.js, Chrome or Chromium, ffmpeg. three.js 0.160.0 (pinned in `template/package.json`). Fonts load from Google Fonts at render time, so the render machine needs network access; self-host the fonts for reliable broadcast renders.

## Install

See [`../README.md`](../README.md#installing-a-skill). Upstream plugin install:

```
/plugin marketplace add tuzhechen2005/opus-video-skills
/plugin install kinetic-reel@opus-video-skills
```

`SKILL.md` calls `bash ~/.claude/skills/kinetic-reel/scripts/new_project.sh <dir>`. That path is right for a copied or symlinked install, but not for a plugin install (plugins live in the plugin cache). The script needs bash and `rsync`.

## Changes from upstream

- Removed `examples/work-reel-26/` (the author's personal 84 s portfolio reel with résumé data). `SKILL.md` and the README still mention it; the SKILL.md lines now point to the upstream folder.
- Removed `docs/work-reel.gif` (2 MB). The README's image link to it is therefore broken; see it upstream.
- `examples/site-intro/index.html`: replaced the author's email and GitHub handle with placeholders.
