#!/usr/bin/env python3
"""Does the camera move in a pill clip? Takes the first, middle and last frame, turns them to grey at 320 px wide and prints the
mean absolute difference for each pair. The rule: if the LARGEST of the three is under 8.0 grey levels the clip has no camera
motion and must not be sent. A very slow push can land close to the line: then look at the frames.
   python3 tools/clip-motion.py clip.pill.mp4"""
import subprocess, sys, json
from PIL import Image, ImageChops
clip = sys.argv[1]
dur = float(json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", clip]))["format"]["duration"])
def frame(t):
    p = f"/tmp/clipmotion_{abs(hash((clip, t)))}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", clip, "-frames:v", "1", "-vf", "scale=320:-2,format=gray", p], check=True)
    return Image.open(p).convert("L")
a, b, c = frame(0.02), frame(dur / 2), frame(max(0, dur - 0.08))
def md(x, y): return sum(ImageChops.difference(x, y).getdata()) / (x.width * x.height)
pairs = {"first/middle": md(a, b), "middle/last": md(b, c), "first/last": md(a, c)}
for k, v in pairs.items(): print(f"{k:13s} {v:6.2f}")
top = max(pairs.values())
print(("camera moves" if top >= 8.0 else "NO CAMERA MOTION (largest difference under 8.0): do not send") + f" (largest {top:.2f})")
sys.exit(0 if top >= 8.0 else 1)
