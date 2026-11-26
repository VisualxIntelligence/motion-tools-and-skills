#!/usr/bin/env python3
"""Before and after frame pairs at every cut: the check you do by eye after qa_cuts.py.

For each cut it takes the last frame before the cut and the first frame after it, from the pill clip and from the result, and tiles
them: one row per cut, four columns (clip before, clip after, result before, result after). Compare the arm, hand, prop, clothing,
scarf and place across each cut. A hard cut is not a fault; a cut where the action does not continue is.

  python3 tools/seedance/cut_pairs.py <pill clip> <result> --out pairs.jpg              cuts found in the clip (qa_cuts.py), result cut taken at the matching time
  python3 tools/seedance/cut_pairs.py <pill clip> --cuts 2.5,5.5 --out pairs.jpg        the clip only, at the times you give
  options: --threshold 28 (cut detection), --tol 0.25 (seconds to match the result's cut to the clip's), --width 480 (tile width)

Exit 1 when there is no cut to show or a file cannot be read.  Needs: numpy, Pillow, ffmpeg.
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import fail, font, frame_at, parse_times, probe
from qa_cuts import detect, match


def pair(path, t, fps, w):
    """(last frame before the cut at t, first frame after it), resized to width w."""
    # ffmpeg -ss returns the first frame at or after the time. The first frame of the new shot sits at t, the last frame of the old one
    # at t - 1/fps; ask a quarter frame early so rounding cannot land on the neighbour.
    out = []
    for tt in (t - 1.25 / fps, t - 0.25 / fps):
        im = frame_at(path, max(0.0, tt))
        if im is None:
            out.append(Image.new("RGB", (w, w * 9 // 21), (60, 0, 0)))
        else:
            out.append(im.resize((w, round(im.height * w / im.width))))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("clip")
    ap.add_argument("result", nargs="?")
    ap.add_argument("--cuts", help="cut times in seconds, comma separated (default: detected in the clip)")
    ap.add_argument("--out", required=True, help="output JPEG")
    ap.add_argument("--threshold", type=float, default=28.0)
    ap.add_argument("--tol", type=float, default=0.25)
    ap.add_argument("--width", type=int, default=480)
    a = ap.parse_args()
    cuts = parse_times(a.cuts) if a.cuts else [t for t, _ in detect(a.clip, a.threshold)]
    if not cuts:
        fail(f"no cut found in {a.clip} (threshold {a.threshold}); pass --cuts or lower --threshold")
    ic = probe(a.clip)
    rcuts, rfps = [], None
    if a.result:
        rcuts = [t for t, _ in detect(a.result, a.threshold)]
        rfps = probe(a.result)["fps"]
    rows, _ = match(cuts, rcuts, a.tol) if a.result else ([(t, None, None) for t in cuts], [])
    w, g, lab = a.width, 6, 150
    cols = 4 if a.result else 2
    tiles = []
    for t, rt, _ in rows:
        tiles.append((t, rt, pair(a.clip, t, ic["fps"], w), pair(a.result, rt if rt is not None else t, rfps, w) if a.result else None))
    th = tiles[0][2][0].height
    S = Image.new("RGB", (lab + cols * (w + g), 26 + len(tiles) * (th + g)), (14, 14, 16))
    d = ImageDraw.Draw(S)
    F, f2 = font(18), font(14)
    heads = ["clip before", "clip after"] + (["result before", "result after"] if a.result else [])
    for j, h in enumerate(heads):
        d.text((lab + j * (w + g) + 4, 4), h, font=f2, fill=(170, 170, 170))
    for i, (t, rt, cp, rp) in enumerate(tiles):
        y = 26 + i * (th + g)
        d.text((8, y + 8), f"cut {i + 1}\nclip {t:.2f} s", font=F, fill=(235, 235, 235))
        if a.result:
            note = f"result {rt:.2f} s" if rt is not None else "no cut found\nin the result"
            d.text((8, y + 70), note, font=f2, fill=(255, 210, 90) if rt is None else (170, 170, 170))
        ims = list(cp) + (list(rp) if rp else [])
        for j, im in enumerate(ims):
            S.paste(im.resize((w, th)), (lab + j * (w + g), y))
    S.save(a.out, quality=88)
    print(f"{len(tiles)} cuts -> {a.out} ({S.size[0]} x {S.size[1]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
