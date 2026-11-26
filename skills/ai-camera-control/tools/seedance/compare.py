#!/usr/bin/env python3
"""The pill clip and every result side by side at the same moments, one row each, as a JPEG.

  python3 tools/seedance/compare.py --ref templates/CAM06-Orbit/pill.mp4 --result release-media/CAM06-Orbit/result.mp4 \\
      [--result other.mp4 ...] [--times 0.5,2,3.5,5,6.5] --out compare.jpg

Without --times it takes 5 moments spread over the shortest video. Each row is labelled with its file name. Side-by-side clips carry the
result's own sound, so label whose sound it is when you show them.
Exit 1 when a file cannot be read.  Needs: numpy, Pillow, ffmpeg.
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import duration, font, frame_at, parse_times


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--ref", required=True, help="the pill clip")
    ap.add_argument("--result", action="append", required=True, help="a result video (repeat for more)")
    ap.add_argument("--times", help="seconds, comma separated")
    ap.add_argument("--out", required=True)
    ap.add_argument("--tile-width", type=int, default=380)
    a = ap.parse_args()
    rows = [("PILL CLIP", a.ref)] + [(os.path.splitext(os.path.basename(r))[0][:18], r) for r in a.result]
    ts = parse_times(a.times) if a.times else None
    if not ts:
        d = min(duration(p) for _, p in rows)
        ts = [round(d * (i + 0.5) / 5, 2) for i in range(5)]
    tw = a.tile_width
    th = round(tw * 534 / 1280)
    lab = 130
    F, f2 = font(15), font(14)
    S = Image.new("RGB", (lab + len(ts) * (tw + 5), 24 + len(rows) * (th + 5)), (14, 14, 16))
    d = ImageDraw.Draw(S)
    for j, t in enumerate(ts):
        d.text((lab + j * (tw + 5) + 4, 4), f"{t:.1f} s", font=f2, fill=(170, 170, 170))
    for i, (name, f) in enumerate(rows):
        y = 24 + i * (th + 5)
        d.text((8, y + th // 2 - 9), name, font=F, fill=(235, 235, 235))
        for j, t in enumerate(ts):
            im = frame_at(f, t)
            if im is None:
                continue
            im = im.resize((tw, round(im.height * tw / im.width)))
            top = max(0, (im.height - th) // 2)
            S.paste(im.crop((0, top, tw, top + th)), (lab + j * (tw + 5), y))
    S.save(a.out, quality=86)
    print(f"{len(rows)} rows, {len(ts)} moments -> {a.out} {S.size}")


if __name__ == "__main__":
    main()
