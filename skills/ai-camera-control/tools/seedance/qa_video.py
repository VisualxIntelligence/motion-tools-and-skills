#!/usr/bin/env python3
"""Video QA for speaking shots: does the person actually act, or stand like a statue?

Measures motion in the frame at 12 steps a second, after removing the camera move (the global shift, found by phase correlation),
so a locked-off shot and a moving camera are judged the same way. Reported per second and overall:
  energy   average change per pixel in the middle of the frame (where the face and chest are): how much the person moves
  micro    the share of time-steps with small, steady movement (breath, blink, lip, brow) rather than none or a big jump
  dead     the longest run of time with almost no movement at all (a frozen face)
A speaking shot needs energy above the floor, micro above its floor, and no dead stretch longer than 1.0 s (a held breath after a
line may be 1 s, not more).

  python3 tools/seedance/qa_video.py <video.mp4> [<video.mp4> ...]
  exit 0 if every shot is alive; 1 if any is stiff, too short to score, or cannot be read.

A clip shorter than 2 s cannot be scored and counts as a failure.  Needs: numpy, ffmpeg.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import gray_frames, probe

FPS = 12
# Floors, calibrated on the shots the author judged. The five locked-camera shots called stiff scored 0.12 to 0.54 with dead stretches of 1.7 to 4.7 s.
FLOOR_LOCKED = dict(energy=0.75, micro=0.55, dead=1.0)
# A moving camera adds motion the shift removal cannot take out (zoom, parallax), so the energy floor only catches a person who is a statue under a moving camera.
FLOOR_MOVING = dict(energy=1.2, micro=0.0, dead=1.0)


def shift(a, b):
    """Global shift of b relative to a (phase correlation): the camera move."""
    A, B = np.fft.fft2(a), np.fft.fft2(b)
    R = A * np.conj(B)
    R /= np.abs(R) + 1e-6
    r = np.fft.ifft2(R).real
    y, x = np.unravel_index(np.argmax(r), r.shape)
    h, w = a.shape
    return (y if y < h // 2 else y - h), (x if x < w // 2 else x - w)


def analyse(path, w=192):
    info = probe(path)
    hh = int(round(w * info["height"] / info["width"] / 2) * 2)
    f = gray_frames(path, w, hh, fps=FPS)
    n, h, w = f.shape
    if n < 2 * FPS:
        return None
    e, camshift = [], []
    for i in range(n - 1):
        dy, dx = shift(f[i], f[i + 1])
        camshift.append(abs(dy) + abs(dx))
        b = np.roll(f[i + 1], (dy, dx), (0, 1))
        y0, y1, x0, x1 = int(h * .12), int(h * .88), int(w * .2), int(w * .8)        # the middle of the frame
        e.append(float(np.abs(f[i][y0:y1, x0:x1] - b[y0:y1, x0:x1]).mean()))
    cam = float(np.mean(camshift))
    e = np.array(e)
    sec = [e[i * FPS:(i + 1) * FPS].mean() for i in range(len(e) // FPS)]
    low = e < 0.35
    run = best = 0
    for v in low:
        run = run + 1 if v else 0
        best = max(best, run)
    micro = float(((e >= 0.35) & (e < 2.2)).mean())
    return dict(energy=float(e.mean()), micro=micro, dead=best / FPS, per_second=[round(float(x), 2) for x in sec], cam=cam, locked=cam < 0.6)


def verdict(r):
    floor = FLOOR_LOCKED if r["locked"] else FLOOR_MOVING
    bad = []
    if r["energy"] < floor["energy"]:
        bad.append(f"energy {r['energy']:.2f} < {floor['energy']}")
    if r["micro"] < floor["micro"]:
        bad.append(f"micro-movement {r['micro']:.2f} < {floor['micro']}")
    if r["dead"] > floor["dead"]:
        bad.append(f"frozen for {r['dead']:.1f} s (max {floor['dead']})")
    return bad


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python3 qa_video.py <video.mp4> [...]", file=sys.stderr)
        sys.exit(1)
    bad_any = False
    for p in sys.argv[1:]:
        r = analyse(p)
        name = os.path.basename(p)
        if r is None:
            print(f"FAIL {name}  cannot score: fewer than 2 s of video")
            bad_any = True
            continue
        bad = verdict(r)
        bad_any |= bool(bad)
        print(("STIFF " if bad else "ALIVE ") + name + f"  [{'locked' if r['locked'] else 'moving'} camera]  energy {r['energy']:.2f}  micro {r['micro']:.2f}  longest frozen stretch {r['dead']:.1f}s  per second {r['per_second']}")
        for b in bad:
            print("      -", b)
    sys.exit(1 if bad_any else 0)
