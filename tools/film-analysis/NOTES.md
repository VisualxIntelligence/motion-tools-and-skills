# film-analysis — notes

**Source:** [alchaincyf/huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion) @ `a97c450` (17 Nov 2026), version 1.3.1: `scripts/analyze/breakdown.py` and `scripts/film_gate.py`. MIT, © 2026 alchaincyf (花叔) ([LICENSE](LICENSE)). Copied unchanged 24 November 2026.

Two scripts that read any MP4, from any engine. Their help text, printed messages and output folder names are **in Chinese**; this note is the English guide to both.

## `breakdown.py`: turn a reference film into a map you can code from

Use it before rebuilding a reference: a competitor's explainer, a title sequence, a music video.

```bash
python3 tools/film-analysis/breakdown.py --video reference.mp4 --out breakdown/ [--thresh 5] [--debounce 12]
```

Needs numpy, Pillow and ffmpeg/ffprobe on the path.

| Output | What it is |
|---|---|
| `sheet_*.jpg` | Contact sheets at 4 fps, 30 frames each, labelled in seconds |
| `diff.npy` | Mean grey-level difference between consecutive frames (at 192×108) |
| `cuts.json` | Cut frames and seconds, plus a **beat-grid fit**: cuts ≈ t0 + k·step, with the residual and BPM candidates |
| `转场/T??.jpg` ("transitions") | For each cut, 15 thumbnails every 2 frames from 2 frames before it |
| `镜内运动/运动热图.jpg` ("in-shot motion / heatmap") | Per shot, the maximum per-pixel change in red over a grey base, with the share of the frame that moves |
| `关键帧总览.jpg` ("keyframe overview") | The last frame of each shot, tiled: one reference frame per shot |
| `ref/seg??.png` | The same frames at full resolution, for composition references |

Rule of thumb from upstream: held stretches have a frame difference under 2, transitions 10–40. The defaults (threshold 5, debounce 12 frames) suit most films; tune per film.

## `film_gate.py`: does the finished film feel like a slide deck?

```bash
python3 tools/film-analysis/film_gate.py film.mp4 [--json] [--vertical auto|yes|no] [--sub-band 0.15]
```

Needs numpy, opencv-python-headless and ffmpeg/ffprobe. Exit codes: 2 red, 0 yellow or green, 1 if the file can't be read. It ignores the bottom subtitle band (`--sub-band`). Cut frames and dissolve windows don't count.

Three gates:

1. **Fast-motion share.** The share of in-shot frame pairs whose mean grey change is ≥ 9, sampled at 12 fps.
   - Red below 0.035; yellow below 0.06.
   - Calibrated by the author on 13 of their own films (approved films ≥ 0.068, rejected ≤ 0.021). Read it as "no counter-example among 13", not as proof.
2. **Empty mid-film frames.** Frames where fewer than 0.2 % of pixels have an edge (gradient > 24). Red when a run lasts ≥ 0.3 s, outside the first and last 0.5 s.
   - It judges by edges, not colour, so a black 3Blue1Brown-style frame with thin lines, or a whiteboard, passes.
3. **Blue-purple share.** The author's own taste ("blue-purple gradients look like AI slop"): hue 225–300°, saturation ≥ 0.30.
   - Red at ≥ 30 % of frames; yellow at ≥ 12 %.
   - Override with `--allow-blue-purple "reason"` when the subject needs it (Al Jazeera's own palettes, cyberpunk, Van Gogh).

Everything else (still share, longest still, event rate, push-ins per minute, dissolves, average shot length) is **reported only**, never a gate. The script's own note explains why: "hold, then a burst, then hold" is good editing that a stillness gate would fail.

**Tested here 24 November 2026** on a synthetic 8-second film with hard cuts at 2, 4 and 6 s:

- `breakdown.py` found all three cuts to the frame.
- `film_gate.py` passed the fast-motion share.
- `film_gate.py` **correctly went red** on the 1.8-second flat-colour segment, reporting it at 4.08–5.92 s.

## Overlap with other checkers here

- **Different jobs.** `film_gate.py` judges a finished film from the picture only. motionmaxxing's `look.py` makes a contact sheet and checks G0/G2/G3. `opus-visual-motion-engine`'s `qa.mjs` reads the composition itself.
- **Use `breakdown.py`** whenever a reference video is the brief.
