#!/usr/bin/env python3
"""Gate for LEAN prompts (built by lean_v3.py). A prompt that fails is not queued.

  python3 tools/seedance/qa3.py .work/prompts/CAM22-PedestalUp/lean-t .work/prompts/CAM22-PedestalUp/lean-m
  exit 0 if every job passes, 1 if any fails or cannot be checked.

The pill clip decides the camera and the framing, so the text must stay short and must not compete with it. Rules:
Q0  the pill clip has camera motion (never a static shot)
Q1  speaking: the exact line is in the dialogue block AND in the performance, word for word; one line; the film has no other words; delivery note 6 words or fewer
Q2  speaking: the performance gives a motive ("because", "has been", "is repeating" ...); the performance shows a change over the shot (then, until, when, afterwards, as he ...)
    and has at least 5 different micro-expression cues (3 in a wide frame), so the person is never a statue
Q3  NOT over-directed: 250 to 600 words in total, the performance 45 to 120 words, no time stamps in the performance
Q4  no statue wording (very still, motionless, does not move, frozen, stands still)
Q5  the references paragraph says the camera, framing, size, position and timing come from @video1
Q6  speaking: the voice is attached; silent: no voice
Q7  no camera, framing or shot-size words anywhere except the one references paragraph
Q8  the performance only uses body the pill clip shows (no feet, steps or weight in a shot cropped above the knees)
Q9  the -t job has exactly the clip and the face (+ voice) and no mood sentence; the -m job adds exactly ONE mood picture and the one mood sentence
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
    if job.get("format") != "lean":
        raise RuntimeError(f"{folder} is a {job.get('format')} job; qa3.py gates lean jobs (use qa4.py for gallery jobs)")
    if not camera_moves(os.path.join(folder, "pill.mp4")):
        fails.append("Q0 the pill clip has NO camera motion")
    goal, dlg, refs, place, who, perf, snd = (section(p, n) for n in ("Goal", "Dialogue", "References", "Place", name, "Performance", "Sound and look"))
    if not perf or not refs:
        raise RuntimeError("the prompt has no Performance or References section (is it a lean prompt?)")
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
        if not req.get("reference_audio") or "@audio1" not in p:
            fails.append("Q6 the voice is missing on a speaking shot")
    elif req.get("reference_audio"):
        fails.append("Q6 a voice on a silent shot")
    pw = len(re.sub(r"\b(?:He|She) says exactly:.*", "", perf).split())
    if speaks and not re.search(MOTIVE, perf.lower()):
        fails.append("Q2 no motive in the performance")
    if not re.search(CHANGE, perf.lower()):
        fails.append("Q2 no emotional change over the shot (then / when / afterwards ...)")
    cues = {w for w in CUES if w in perf.lower()}
    need = 5 if (job.get("min_visible") or 1.0) < 0.6 else 3          # a tight frame shows the face; a full-body frame shows body language
    if len(cues) < need:
        fails.append(f"Q2 only {len(cues)} cues ({', '.join(sorted(cues))}); need {need}+")
    wc = len(p.split())
    if not 250 <= wc <= 600:
        fails.append(f"Q3 {wc} words (250 to 600): over-directed or empty")
    if not 45 <= pw <= 120:
        fails.append(f"Q3 the performance is {pw} words (45 to 120)")
    if re.search(r"\bat about [\d.]+ seconds|\bfrom about [\d.]+ seconds|\b\d+\.\d+ seconds", perf.lower()):
        fails.append("Q3 time stamps in the performance (the pill clip sets the timing)")
    bad = [w for w in STATUE if w in perf.lower()]
    if bad:
        fails.append(f"Q4 statue wording {bad}")
    if "all come exactly from @video1" not in refs:
        fails.append("Q5 the references paragraph does not say the camera, framing, size and timing come from @video1")
    for label, txt in (("goal", goal), ("place", place), (name, who), ("performance", perf), ("sound and look", snd)):
        hit = [w for w in CAMERA if re.search(w, txt.lower())]
        if hit:
            fails.append(f"Q7 camera/framing words in the {label}: {hit}")
    ms = job.get("min_visible")
    if ms is not None and ms < 0.45:
        out = [w for w in FOOT if re.search(r"\b" + w, perf.lower())]
        if out:
            fails.append(f"Q8 the performance uses body the pill clip cuts off (shows the top {round(ms * 100)}%): {out}")
    imgs = req["reference_image"]
    if mood:
        if len(imgs) != 2:
            fails.append(f"Q9 the mood job needs exactly 2 images, has {len(imgs)}")
        if "mood reference only" not in p:
            fails.append("Q9 the mood sentence is missing")
    else:
        if len(imgs) != 1:
            fails.append(f"Q9 the prompt-only job must have 1 image, has {len(imgs)}")
        if "@image2" in p:
            fails.append("Q9 @image2 appears in the prompt-only job")
    hit = [w for w in RISK if re.search(r"\b" + w, low)]
    if hit:
        fails.append(f"Q10 risk words {hit}")
    fails += twin_fails(folder, mood, p, ("References", "@video1 is the shot", "mood"))
    return fails


if __name__ == "__main__":
    sys.exit(run(check, sys.argv[1:]))
