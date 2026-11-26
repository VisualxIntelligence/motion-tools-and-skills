#!/usr/bin/env python3
"""Mouth check: how far the mouth opens, and how much it moves, from face landmarks (MediaPipe face mesh).

Opening is the gap between the inner lips (landmarks 13 and 14) as a share of the face height (forehead 10 to chin 152), sampled 12 times
a second. Motion is the mean change of that opening between samples. It tells whether the mouth moves. It does NOT tell whether the
mouth matches the sound.

  python3 tools/seedance/qa_mouth.py <take.mp4> [--min-opening X] [--min-motion Y] [--max-opening Z]

With no limits it prints the numbers and fails only when the face cannot be measured. The limits are yours: this script's landmark
choice (inner lips) is not the one behind the older numbers in docs/qa-prompt-and-video.md (closed mouth 0.032, speaking 0.097 to 0.138),
so those do not transfer. On the shipped CAM22 to CAM38 takes (speaking, one line in 7 s) it measured a mean opening of 0.011 to 0.038 and
a motion of 0.0046 to 0.0163. No closed-mouth take with a known answer was available, so no limit is built in. Measure a take you
know speaks and one you know is closed, then set the limits between them.

A face that is too small to measure (a wide shot: 0 of 169 frames in CAM21) is reported as "check by eye" and EXITS 1, never as a pass.
Fewer than 50% of the frames with a face counts as too small. Exit 0 only when the face was measured and every limit you gave holds.

Needs: numpy, Pillow, mediapipe (0.10.21, with mp.solutions), ffmpeg.
"""
import argparse
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import duration, fail, frame_at

FPS = 12


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("take")
    ap.add_argument("--min-opening", type=float, help="fail when the mean opening is under this (a take that should speak)")
    ap.add_argument("--min-motion", type=float, help="fail when the motion is under this (a take that should speak)")
    ap.add_argument("--max-opening", type=float, help="fail when the mean opening is over this (a take that should be closed)")
    a = ap.parse_args()
    try:
        import mediapipe as mp
    except ImportError as e:
        fail(f"cannot run the mouth check: {e}. Install mediapipe (see tools/seedance/README.md).")
    mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=False, min_detection_confidence=0.4)
    n = int(duration(a.take) * FPS)
    gaps, seen = [], 0
    for i in range(n):
        im = frame_at(a.take, i / FPS)
        if im is None:
            continue
        r = mesh.process(np.ascontiguousarray(np.asarray(im)))
        if not r.multi_face_landmarks:
            continue
        lm = r.multi_face_landmarks[0].landmark
        face_h = abs(lm[152].y - lm[10].y)
        if face_h <= 0:
            continue
        seen += 1
        gaps.append(abs(lm[14].y - lm[13].y) / face_h)
    name = os.path.basename(a.take)
    if n == 0 or seen < 0.5 * n:
        print(f"FAIL {name}: a face was found in {seen} of {n} sampled frames. The face is too small or hidden to measure: check by eye.", file=sys.stderr)
        sys.exit(1)
    g = np.array(gaps)
    opening, motion = float(g.mean()), float(np.abs(np.diff(g)).mean()) if len(g) > 1 else 0.0
    print(f"{name}: face in {seen}/{n} frames; mouth opening {opening:.3f} of face height (max {g.max():.3f}); motion {motion:.4f}")
    bad = []
    if a.min_opening is not None and opening < a.min_opening:
        bad.append(f"mean opening {opening:.3f} < {a.min_opening}")
    if a.min_motion is not None and motion < a.min_motion:
        bad.append(f"motion {motion:.4f} < {a.min_motion}")
    if a.max_opening is not None and opening > a.max_opening:
        bad.append(f"mean opening {opening:.3f} > {a.max_opening}")
    for b in bad:
        print("  -", b)
    print(("MOUTH OK " if not bad else "MOUTH MISMATCH ") + name)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
