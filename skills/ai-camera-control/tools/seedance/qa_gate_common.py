"""Shared parts of the two prompt gates (qa3.py for lean prompts, qa4.py for gallery prompts). A prompt that fails is not queued:
a queued job cannot be cancelled and costs credits. A gate that cannot run (a missing file, an unreadable clip) counts as a failure.

A job folder is what lean_v3.py or gallery_v4.py wrote: prompt.txt, request.json, job.json and pill.mp4.
Needs: numpy, Pillow, ffmpeg.
"""
import json
import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import frame_at, duration

CUES = ["blink", "swallow", "brow", "eyebrow", "glisten", "shine", "jaw", "lip", "nostril", "breath", "exhale", "inhale", "gaze", "eyes", "head", "shoulder", "hand", "smile", "tremble", "tear", "frown", "nod", "shake", "sigh", "chin", "throat", "cheek", "voice", "laugh", "crack", "catch", "wipe", "rub", "arm", "thumb", "grip", "hair", "coat", "chest", "scarf", "forearm"]
STATUE = ["very still", "motionless", "does not move", "stands still", "completely still", "frozen", "without moving"]
FILLER = ["part most people", "here's the thing", "listen to this", "the important part", "nobody talks about", "the secret"]
RISK = ["unclothed", "naked", "nude", "blood", "gun", "shoot", "kill", "dead body", "corpse"]
CAMERA = [r"\bcamera\b", r"\blens(?:es)?\b", r"\bmm\b", r"\bdolly\b", r"\bzoom", r"\borbit", r"\bcrane\b", r"\bclose-up\b", r"\bmedium shot\b", r"\bwide shot\b", r"\blong shot\b", r"\bshot size\b", r"\bframing\b", r"\bpush(?:es)? in\b", r"\bpull(?:s)? out\b", r"\btracking\b", r"\bwhip\b", r"\bpedestal\b", r"\bdutch\b", r"\bfocal\b", r"\bangle\b", r"\bpan(?:s|ning)?\b"]
FOOT = ["foot", "feet", "boots", "stride", "weight", "knee", "thigh", "legs", "ankle", "walks", "steps"]
MOTIVE = r"\b(because|has been|is repeating|came ready|has been rehearsing|is tired|is afraid|afraid|came prepared|is tired and resolved)\b"
CHANGE = r"\b(then|until|when|afterwards|as he|as she|once|before)\b"


def section(p, name):
    m = re.search(r"【" + re.escape(name) + r"】\n(.*?)(?=\n\n【|\Z)", p, re.S)
    return m.group(1) if m else ""


def camera_moves(clip):
    """True when the pill clip has camera motion. Three frames (0.3 s, the middle, 0.3 s from the end) are compared; the largest mean
    difference must be at least 8.0. A locked-off shot is never generated."""
    dur = duration(clip)
    fr = []
    for t in (0.3, dur / 2, dur - 0.3):
        im = frame_at(clip, t, (320, -2), gray=True)
        if im is None:
            raise RuntimeError(f"no frame at {t:.2f} s in {clip}")
        fr.append(np.asarray(im).astype(float))
    return max(np.abs(fr[0] - fr[1]).mean(), np.abs(fr[1] - fr[2]).mean(), np.abs(fr[0] - fr[2]).mean()) >= 8.0


def load_job(folder):
    """(request, job, prompt) or raises RuntimeError with the reason the gate cannot run."""
    for f in ("request.json", "job.json", "pill.mp4"):
        if not os.path.exists(os.path.join(folder, f)):
            raise RuntimeError(f"{folder} has no {f} (build it with lean_v3.py or gallery_v4.py)")
    req = json.load(open(os.path.join(folder, "request.json"), encoding="utf-8"))
    job = json.load(open(os.path.join(folder, "job.json"), encoding="utf-8"))
    return req, job, req["prompt"]


def twin_fails(folder, mood, p, allowed_words):
    """The -t and -m jobs are the same text, but the one mood sentence and the one picture."""
    import difflib
    base = folder.rstrip("/\\")
    twin = base[:-1] + ("t" if mood else "m")
    tp = os.path.join(twin, "request.json")
    if not os.path.exists(tp):
        return []
    t = json.load(open(tp, encoding="utf-8"))["prompt"]
    a, b = (p, t) if not mood else (t, p)
    diff = [l for l in difflib.unified_diff(re.split(r"(?<=[.])\s+", a), re.split(r"(?<=[.])\s+", b), lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")]
    if any(l[:1] == "-" for l in diff if not any(w in l for w in allowed_words)) and len([l for l in diff if l[:1] == "+"]) > 1:
        return ["Q11 the twins differ by more than the mood sentence"]
    return []


def run(check, argv):
    """Print PASS or FAIL per job folder; exit 1 if any fail or cannot run."""
    if not argv:
        print("usage: python3 qaN.py <job folder> [<job folder> ...]", file=sys.stderr)
        return 1
    bad = 0
    for n in argv:
        try:
            r = check(n)
        except (RuntimeError, OSError, KeyError, ValueError) as e:
            r = [f"cannot run: {e}"]
        print(("PASS " if not r else "FAIL ") + n)
        for x in r:
            print("     -", x)
        bad += bool(r)
    return 1 if bad else 0
