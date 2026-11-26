"""Shared helpers for the scripts in tools/seedance. Needs Python 3.10+, numpy, Pillow and ffmpeg/ffprobe on PATH.

Nothing here sends, uploads or downloads anything. It reads local files and writes local files.
"""
import io
import json
import os
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFont

ASPECT_MIN, ASPECT_MAX = 0.40, 2.50      # the image aspect the video service accepts for a reference picture
SIDE_MIN, SIDE_MAX = 300, 6000           # pixels per side
MAX_BYTES = 30 * 1024 * 1024


# How tall the stand-in is against its width, for reading how much of the person the frame shows. The pin (the engine default since
# 7 Nov 2026) is about 1.8 m tall on a body at most 0.46 m wide: 3.9. The capsule (--standin capsule) is about 3.
STANDIN_ASPECT = {"pin": 3.9, "capsule": 3.0}


def pill_mask(a):
    """The red pill in an RGB frame (array of ints): red clearly above green and blue, so its dark stripes of shaded red count too."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 70) & (r > 2.2 * g) & (r > 2.2 * b)


def fail(msg, code=1):
    """A check that cannot run is a failure: say why and stop."""
    print("FAIL " + msg, file=sys.stderr)
    sys.exit(code)


def need(tool):
    if shutil.which(tool) is None:
        fail(f"{tool} is not on PATH (install ffmpeg; it provides ffmpeg and ffprobe)")


def probe(path):
    """duration (s), width, height, fps of the first video stream."""
    need("ffprobe")
    if not os.path.exists(path):
        fail(f"file not found: {path}")
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,r_frame_rate,duration:format=duration", "-of", "json", path],
                       capture_output=True, text=True)
    if r.returncode != 0:
        fail(f"ffprobe cannot read {path}: {r.stderr.strip()[:200]}")
    d = json.loads(r.stdout)
    st = (d.get("streams") or [None])[0]
    if not st:
        fail(f"{path} has no video stream")
    num, den = st["r_frame_rate"].split("/")
    dur = d.get("format", {}).get("duration") or st.get("duration")
    return dict(duration=float(dur), width=int(st["width"]), height=int(st["height"]),
                fps=float(num) / float(den or 1))


def duration(path):
    return probe(path)["duration"]


def frame_at(path, t, size=None, gray=False):
    """One frame at time t (seconds) as a PIL image, decoded through a pipe. No temp files.
    Returns None when the time is past the end of the file."""
    need("ffmpeg")
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{max(0.0, t):.3f}", "-i", path, "-frames:v", "1"]
    if size:
        cmd += ["-vf", f"scale={size[0]}:{size[1]}"]
    cmd += ["-f", "image2pipe", "-vcodec", "png", "-"]
    out = subprocess.run(cmd, capture_output=True).stdout
    if not out:
        return None
    im = Image.open(io.BytesIO(out))
    return im.convert("L") if gray else im.convert("RGB")


def gray_frames(path, width, height, fps=None):
    """Every frame (or every frame at `fps`) of the video as a float32 array [n, height, width], grey.
    Streamed from ffmpeg in one pass."""
    need("ffmpeg")
    vf = (f"fps={fps}," if fps else "") + f"scale={width}:{height},format=gray"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-"],
                         capture_output=True).stdout
    n = len(raw) // (width * height)
    if n == 0:
        fail(f"ffmpeg decoded no frames from {path}")
    return np.frombuffer(raw[: n * width * height], np.uint8).reshape(n, height, width).astype(np.float32)


def font(size):
    """A bold font that exists on this machine; the built-in one if none is found."""
    for p in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/Library/Fonts/Arial Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
              "C:\\Windows\\Fonts\\arialbd.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size)
    except TypeError:
        return ImageFont.load_default()


def check_reference_image(path_or_size, file_bytes=None):
    """Raise a failure when a reference picture would be refused: aspect outside 0.40 to 2.50, a side outside 300 to 6000 px,
    or more than 30 MB. Returns the aspect."""
    w, h = path_or_size
    a = w / h
    if not ASPECT_MIN <= a <= ASPECT_MAX:
        fail(f"sheet is {w} x {h}, aspect {a:.2f}; the service refuses aspect outside {ASPECT_MIN} to {ASPECT_MAX}")
    if min(w, h) < SIDE_MIN or max(w, h) > SIDE_MAX:
        fail(f"sheet is {w} x {h}; each side must be {SIDE_MIN} to {SIDE_MAX} px")
    if file_bytes is not None and file_bytes > MAX_BYTES:
        fail(f"sheet file is {file_bytes / 1e6:.1f} MB; the limit is 30 MB")
    return a


def load_json(path, what="file"):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        fail(f"{what} not found: {path}")
    except json.JSONDecodeError as e:
        fail(f"{what} is not valid JSON: {path} ({e})")


def parse_times(s):
    try:
        return [float(x) for x in s.split(",") if x.strip() != ""]
    except ValueError:
        fail(f"cannot read the list of times: {s!r} (use seconds like 2.5,5.5,9)")
