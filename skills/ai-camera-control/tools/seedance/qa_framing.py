#!/usr/bin/env python3
"""Framing QA: does the generated video have the framing of the pill clip that was sent with it?

Reads the pill clip (the red pill) for where the head should be and how big, then finds the face in the generated video
(MediaPipe face detection, full-range model, confidence 0.35) and compares, second by second, at the middle of each second:
  size    the face height as a share of the frame height, against what the pill predicts
  across  where the face is across the frame
  down    where the face is down the frame
A second passes when size is 0.65 to 1.5 times the expected size and the position is within 0.15 of the frame. The shot passes when
75% of the scored seconds pass. A second where the pill shows no head (out of frame, or the crown cut off) is not scored.

What the pill predicts: the pill is STANDIN_ASPECT times as tall as it is wide (pin 3.9, capsule 3.0). A detected face box is about 75% of
crown-to-chin. Capsule: the head is 13% of the body, so head = 0.39 x pill width / frame height (as calibrated). Pin: derived from
the engine (a real head about 0.23 m crown to chin on a body 0.46 m wide), head = 0.50 x pill width / frame height; not yet
checked against a result made from a pin clip.

  python3 tools/seedance/qa_framing.py <pill clip> <generated video> [--standin pin|capsule]
  exit 0 on FRAMING OK; 1 on FRAMING MISMATCH; 1 on FAIL (no second could be scored, or a package is missing). A check that cannot run is a failure.

Needs: numpy, Pillow, mediapipe (with mp.solutions, tested on 0.10.21; it brings opencv), ffmpeg. Without mediapipe the script exits 1.
"""
import argparse
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import STANDIN_ASPECT, duration, fail, frame_at, pill_mask

HEAD_K = {"capsule": 0.39, "pin": 0.50}
_fd = None


def expected(clip, t, standin):
    """Where the pill says the head is: (head height share of frame height, centre across, eye line down), or None when the head is out of frame."""
    im = frame_at(clip, t)
    if im is None:
        return None
    a = np.asarray(im).astype(int)
    m = pill_mask(a)
    ys, xs = np.nonzero(m)
    H, W = m.shape
    if ys.size < 200:
        return None
    wpx = xs.max() - xs.min()
    if wpx < 0.10 * W:
        return None
    top = ys.min()
    if top < 0.01 * H and (xs.max() - xs.min()) > 0.5 * W:
        return None                                                  # crown cut off
    head = HEAD_K[standin] * wpx / H
    eyes = (top + 0.07 * STANDIN_ASPECT[standin] * wpx) / H
    return dict(head=head, across=((xs.min() + xs.max()) / 2) / W, eyes=eyes)


def face(im):
    global _fd
    import mediapipe as mp
    if _fd is None:
        _fd = mp.solutions.face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.35)
    res = _fd.process(np.ascontiguousarray(np.asarray(im)))              # RGB, as mediapipe wants
    if not res.detections:
        return None
    d = max(res.detections, key=lambda x: x.score[0])
    bb = d.location_data.relative_bounding_box
    return dict(h=bb.height, across=bb.xmin + bb.width / 2, down=bb.ymin + bb.height * 0.4)


def compare(clip, video, standin):
    rows = []
    n = int(min(duration(clip), duration(video)))
    for s in range(n):
        t = s + 0.5
        e = expected(clip, t, standin)
        im = frame_at(video, t)
        if e is None:
            rows.append((s, "head out of frame in the pill clip: not scored", None))
            continue
        f = face(im) if im is not None else None
        if f is None:
            rows.append((s, "no face found in the video", False))
            continue
        exp_face = e["head"] * 0.75
        size = f["h"] / exp_face
        ok = 0.65 <= size <= 1.5 and abs(f["across"] - e["across"]) <= 0.15 and abs(f["down"] - e["eyes"]) <= 0.15
        rows.append((s, f"face {f['h'] * 100:.0f}% of frame height vs {exp_face * 100:.0f}% expected (x{size:.2f}); across {f['across'] * 100:.0f}% vs {e['across'] * 100:.0f}%; down {f['down'] * 100:.0f}% vs {e['eyes'] * 100:.0f}%", ok))
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("clip", help="the pill clip that was sent")
    ap.add_argument("video", help="the generated video")
    ap.add_argument("--standin", default="pin", choices=["pin", "capsule"])
    a = ap.parse_args()
    try:
        import mediapipe
    except ImportError as e:
        fail(f"cannot run the framing check: {e}. Install mediapipe (see tools/seedance/README.md).")
    if not hasattr(mediapipe, "solutions"):
        fail("this mediapipe has no mp.solutions (use mediapipe 0.10.21)")
    rows = compare(a.clip, a.video, a.standin)
    scored = [r for r in rows if r[2] is not None]
    good = sum(1 for r in scored if r[2])
    for s, txt, ok in rows:
        print(f"  {s}s  {'OK ' if ok else ('-- ' if ok is None else 'BAD')}  {txt}")
    name = os.path.basename(a.video)
    if not scored:
        print(f"FAIL {name}: no second could be scored (the pill shows no head in any second); this is a failure, not a pass. Check the framing by eye.", file=sys.stderr)
        sys.exit(1)
    verdict = good / len(scored) >= 0.75
    print(("FRAMING OK " if verdict else "FRAMING MISMATCH ") + name + f"  ({good}/{len(scored)} seconds match the pill clip)")
    sys.exit(0 if verdict else 1)


if __name__ == "__main__":
    main()
