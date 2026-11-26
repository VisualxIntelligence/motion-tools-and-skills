#!/usr/bin/env python3
"""Cut detector: finds hard cuts by frame difference, and compares the cut times of the pill clip with the result.

Every frame is reduced to 160 pixels wide in grey (160 x 67 for a 21:9 clip). A cut is a frame whose mean absolute difference from the
previous frame is above the threshold (28 by default). Runs of flagged frames count as one cut, at the first frame of the new shot.
With --step 0.5 it samples every 0.5 s instead of every frame, which finds cuts only to the nearest half second.

  python3 tools/seedance/qa_cuts.py <clip.mp4>                       list the cuts
  python3 tools/seedance/qa_cuts.py <clip.mp4> <result.mp4>          list both and compare: every cut of the clip must have a cut in
                                                                     the result within --tol seconds (default 0.25)
  python3 tools/seedance/qa_cuts.py <result.mp4> --expect 2.5,5.5    compare against cut times you give

Exit 0 when every expected cut is found, 1 when one is missing or a file cannot be read. A hard cut is not a fault by itself: a cut is
a fault when the action does not continue, so look at the pairs this finds with cut_pairs.py.

The threshold of 28 is the one used on the 30 s film. A cut between two similar-looking frames (the same person, the same place, a 40
degree change of angle) can score under 28 (one such cut scored 21.9) and is missed, and a very fast whip or a crash zoom can score
over 28 and be listed as a cut (a crash zoom scored 38.9). Lower the threshold with --threshold if cuts are missed.

Needs: numpy, ffmpeg.
"""
import argparse
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import fail, gray_frames, parse_times, probe


def detect(path, threshold=28.0, step=None, width=160):
    """List of (time in seconds, difference) for each cut found."""
    info = probe(path)
    h = max(2, int(round(width * info["height"] / info["width"])))
    f = gray_frames(path, width, h, fps=(1.0 / step) if step else None)
    if len(f) < 2:
        fail(f"{path}: fewer than 2 frames, cannot look for cuts")
    dt = step if step else 1.0 / info["fps"]
    d = np.abs(f[1:] - f[:-1]).mean(axis=(1, 2))
    hot = np.flatnonzero(d > threshold)
    cuts, i = [], 0
    while i < len(hot):
        j = i
        while j + 1 < len(hot) and hot[j + 1] - hot[j] <= 2:
            j += 1
        k = hot[i + int(np.argmax(d[hot[i]:hot[j] + 1]))]      # the biggest jump of the run
        cuts.append((round(float((k + 1) * dt), 3), round(float(d[k]), 1)))
        i = j + 1
    return cuts


def match(expected, found, tol):
    """Pair each expected time with the nearest unused found time within tol. Returns (rows, extra found times)."""
    used, rows = set(), []
    for t in expected:
        best = min(((abs(f - t), i) for i, f in enumerate(found) if i not in used), default=None)
        if best and best[0] <= tol:
            used.add(best[1])
            rows.append((t, found[best[1]], found[best[1]] - t))
        else:
            rows.append((t, None, None))
    return rows, [f for i, f in enumerate(found) if i not in used]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("first", help="the pill clip (or the video to list)")
    ap.add_argument("second", nargs="?", help="the result to compare with the clip")
    ap.add_argument("--expect", help="cut times in seconds, comma separated, to compare the first video against")
    ap.add_argument("--threshold", type=float, default=28.0)
    ap.add_argument("--tol", type=float, default=0.25, help="seconds within which a cut counts as the same cut")
    ap.add_argument("--step", type=float, help="sample every STEP seconds instead of every frame")
    a = ap.parse_args()
    c1 = detect(a.first, a.threshold, a.step)
    print(f"{os.path.basename(a.first)}: {len(c1)} cuts: " + ", ".join(f"{t:.2f}s (diff {d})" for t, d in c1))
    if not a.second and not a.expect:
        return 0
    if a.expect:
        expected, found, label = parse_times(a.expect), [t for t, _ in c1], os.path.basename(a.first)
    else:
        c2 = detect(a.second, a.threshold, a.step)
        print(f"{os.path.basename(a.second)}: {len(c2)} cuts: " + ", ".join(f"{t:.2f}s (diff {d})" for t, d in c2))
        expected, found, label = [t for t, _ in c1], [t for t, _ in c2], os.path.basename(a.second)
    rows, extra = match(expected, found, a.tol)
    miss = 0
    for t, f, off in rows:
        if f is None:
            miss += 1
            print(f"  MISSING  cut at {t:.2f}s: none within {a.tol} s in {label}")
        else:
            print(f"  OK       cut at {t:.2f}s -> {f:.2f}s  (offset {off:+.2f} s)")
    for f in extra:
        print(f"  EXTRA    {label} has a cut at {f:.2f}s that is not expected")
    if not expected:
        print("NOTE no cuts expected")
    print(("CUTS OK " if not miss else "CUTS MISMATCH ") + f"({len(rows) - miss}/{len(rows)} expected cuts found, {len(extra)} extra)")
    return 1 if miss else 0


if __name__ == "__main__":
    sys.exit(main())
