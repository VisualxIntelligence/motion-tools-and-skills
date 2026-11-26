#!/usr/bin/env python3
"""Gate for GALLERY-FORMAT prompts (built by gallery_v4.py). The camera script is REQUIRED here and must carry the template's numbers;
the acting stays short. A prompt that fails is not queued.

  python3 tools/seedance/qa4.py .work/prompts/CAM22-PedestalUp/gallery-t .work/prompts/CAM22-PedestalUp/gallery-m
  exit 0 if every job passes, 1 if any fails or cannot be checked.

Rules:
Q0  the pill clip has camera motion (never a static shot)
Q1  speaking: the exact line is in the dialogue block AND in the performance, word for word; one line; the film has no other words; delivery note 6 words or fewer
Q2  speaking: the performance gives a motive; it shows a change over the shot; at least 5 different micro-expression cues (3 in a wide frame)
Q3  500 to 1100 words in total, the performance 45 to 120 words, no time stamps in the performance
Q4  no statue wording (very still, motionless, does not move, frozen, stands still)
Q5  the camera script carries the template's own numbers: a lens in mm and a distance, angle or time, plus every string in the scene's
    camera_numbers (job.json) if the scene lists any; the four protective phrases are in the references ("rebuild every wall",
    "No cone, sphere, plain box", "only a label", "Never show a capsule")
Q6  speaking: the voice is attached; silent: no voice
Q7  no camera or framing words inside the performance (they belong to the camera script)
Q8  the performance only uses body the pill clip shows (no feet, steps or weight in a shot cropped above the knees)
Q9  the -t job has one image; the -m job has exactly 2 and the mood sentence
Q10 no content-filter risk words; no filler set-up line or run of clipped fragments in the spoken line
Q11 the -t and -m twins differ only by the one mood sentence and the one picture
Needs: numpy, Pillow, ffmpeg.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_gate_common import (CAMERA, CHANGE, CUES, FILLER, FOOT, MOTIVE, RISK, STATUE, camera_moves, load_job, run, section, twin_fails)


def check(folder):
    req, job, p = load_job(folder)
    fails, low = [], p.lower()
    name, mood, speaks = job["person"], job["variant"] == "m", job["speaks"]
    if job.get("format") != "gallery":
        raise RuntimeError(f"{folder} is a {job.get('format')} job; qa4.py gates gallery jobs (use qa3.py for lean jobs)")
    if not camera_moves(os.path.join(folder, "pill.mp4")):
        fails.append("Q0 the pill clip has NO camera motion")
    dlg = section(p, "Dialogue, exact words")
    refs = section(p, "Reference Asset Roles")
    camev = section(p, "Camera and Event Script")
    key = f"\n{name}'s performance:"
    if not refs or key not in camev:
        raise RuntimeError("the prompt has no Reference Asset Roles or Camera and Event Script section (is it a gallery prompt?)")
    camera = camev.split(key)[0]
    perf = camev.split(key)[1].split("\nEvery action is performed")[0]
    miss = [x for x in (job.get("camera_numbers") or []) if x not in camera]
    if miss:
        fails.append(f"Q5 the camera script is missing the template's own numbers: {miss}")
    if not re.search(r"\b\d+(?:\s*to\s*\d+)?\s*mm\b", camera) or not re.search(r"\b(metres?|degrees?|seconds?)\b", camera):
        fails.append("Q5 the camera script has no lens in mm or no distance, angle or time")
    for must in ("rebuild every wall", "No cone, sphere, plain box", "only a label", "Never show a capsule"):
        if must not in refs:
            fails.append(f"Q5 the protective line is missing: {must}")
    if speaks:
        lines = re.findall(r'says exactly,[^:]*:\s*"([^"]+)"', dlg)
        if len(lines) != 1:
            fails.append(f"Q1 expected one dialogue line, found {len(lines)}")
        else:
            if lines[0] not in perf:
                fails.append("Q1 the exact line is not repeated in the performance")
            if "no other words" not in dlg:
                fails.append("Q1 the dialogue block does not say it holds the only words")
            note = re.search(r"says exactly,\s*([^:]*):", dlg)
            n = len(note.group(1).split()) if note else 0
            if n > 6:
                fails.append(f"Q1 delivery note is {n} words")
            if any(f in lines[0].lower() for f in FILLER):
                fails.append("Q10 filler in the spoken line")
            if len(re.findall(r"(?:^|[.!?]\s)(\w+(?:\s\w+){0,2})[.!?]", lines[0])) >= 3:
                fails.append("Q10 clipped fragments in the spoken line")
        if not req.get("reference_audio") or "@audio1" not in low:
            fails.append("Q6 the voice is missing on a speaking shot")
    elif req.get("reference_audio"):
        fails.append("Q6 a voice on a silent shot")
    pw = len(re.sub(r"\b(?:He|She) says exactly:.*", "", perf).split())
    if speaks and not re.search(MOTIVE, perf.lower()):
        fails.append("Q2 no motive in the performance")
    if not re.search(CHANGE, perf.lower()):
        fails.append("Q2 no emotional change over the shot (then / when / afterwards ...)")
    cues = {w for w in CUES if w in perf.lower()}
    need = 5 if (job.get("min_visible") or 1.0) < 0.6 else 3
    if len(cues) < need:
        fails.append(f"Q2 only {len(cues)} cues ({', '.join(sorted(cues))}); need {need}+")
    wc = len(p.split())
    if not 500 <= wc <= 1100:
        fails.append(f"Q3 {wc} words (500 to 1100)")
    if not 45 <= pw <= 120:
        fails.append(f"Q3 the performance is {pw} words (45 to 120)")
    if re.search(r"\bat about [\d.]+ seconds|\bfrom about [\d.]+ seconds|\b\d+\.\d+ seconds", perf.lower()):
        fails.append("Q3 time stamps in the performance (the pill clip sets the timing)")
    bad = [w for w in STATUE if w in perf.lower()]
    if bad:
        fails.append(f"Q4 statue wording {bad}")
    hit = [w for w in CAMERA if re.search(w, perf.lower())]
    if hit:
        fails.append(f"Q7 camera/framing words in the performance: {hit}")
    ms = job.get("min_visible")
    if ms is not None and ms < 0.45:
        out = [w for w in FOOT if re.search(r"\b" + w, perf.lower())]
        if out:
            fails.append(f"Q8 the performance uses body the pill clip cuts off (shows the top {round(ms * 100)}%): {out}")
    imgs = req["reference_image"]
    if mood:
        if len(imgs) != 2:
            fails.append(f"Q9 the mood job needs exactly 2 images, has {len(imgs)}")
        if "mood of the place" not in p:
            fails.append("Q9 the mood sentence is missing")
    else:
        if len(imgs) != 1:
            fails.append(f"Q9 the prompt-only job must have 1 image, has {len(imgs)}")
        if "@image2" in low:
            fails.append("Q9 @image2 appears in the prompt-only job")
    hit = [w for w in RISK if re.search(r"\b" + w, low)]
    if hit:
        fails.append(f"Q10 risk words {hit}")
    fails += twin_fails(folder, mood, p, ("References", "@video1 is the shot", "mood"))
    return fails


if __name__ == "__main__":
    sys.exit(run(check, sys.argv[1:]))
