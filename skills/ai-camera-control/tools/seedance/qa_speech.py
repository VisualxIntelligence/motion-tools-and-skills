#!/usr/bin/env python3
"""Speech check: transcribe a take with whisper and compare it with the dialogue block word for word.

Do it on each take alone: a side-by-side with one shared audio track made one panel's lips look wrong. The script counts the words
in the transcript against the expected lines, finds each expected line, and reports lines that came back twice ("Come on." came back
twice in several takes) and words nobody was meant to say. It cannot tell whether the lips match the words.
A missing line may be a transcriber miss: listen to the take.

  python3 tools/seedance/qa_speech.py <take.mp4> --line "They told me I could go in at five."
  python3 tools/seedance/qa_speech.py <take.mp4> --scene tools/seedance/scenes/CAM22-PedestalUp.scene.json
  python3 tools/seedance/qa_speech.py <take.mp4> --lines-file lines.txt            (one line per row)
  options: --model small (default; tiny, base, small, medium), --max-wer 0.3, --silent (the take must contain no words)

Words are lower-cased with punctuation removed. The overall word error rate between all expected lines joined and the transcript must be
at most --max-wer (default 0.3, not calibrated: tune it on takes you have listened to). Exit 0 on SPEECH OK, 1 on SPEECH MISMATCH or
when it cannot run (no whisper, no ffmpeg, no audio track). A check that cannot run is a failure.

Needs: ffmpeg and ONE of: openai-whisper (pip install openai-whisper) or faster-whisper. It runs on the CPU. The first run downloads the
model weights through the whisper package (that is whisper's own download, not a video service).
"""
import argparse
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import fail, need


def words(s):
    return re.sub(r"[^a-z0-9' ]+", " ", s.lower().replace("’", "'")).split()


def wer(ref, hyp):
    """Word error rate: edit distance over reference length."""
    d = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        prev, d[0] = d[0], i
        for j, h in enumerate(hyp, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (r != h))
    return d[len(hyp)] / max(1, len(ref))


def transcribe(path, model):
    need("ffmpeg")
    has_audio = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_type", "-of", "csv=p=0", path],
                               capture_output=True, text=True).stdout.strip()
    if not has_audio:
        fail(f"{path} has no audio track; nothing to transcribe")
    try:
        import whisper
        m = whisper.load_model(model, device="cpu")
        r = m.transcribe(path, fp16=False, language="en")
        return r["text"].strip()
    except ImportError:
        pass
    try:
        from faster_whisper import WhisperModel
        m = WhisperModel(model, device="cpu", compute_type="int8")
        segs, _ = m.transcribe(path, language="en")
        return " ".join(s.text.strip() for s in segs)
    except ImportError:
        fail("cannot run the speech check: neither openai-whisper nor faster-whisper is installed")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("take")
    ap.add_argument("--line", action="append", default=[], help="an expected spoken line (repeat for several)")
    ap.add_argument("--scene", help="scene JSON; its line.text is the expected line")
    ap.add_argument("--lines-file")
    ap.add_argument("--model", default="small")
    ap.add_argument("--max-wer", type=float, default=0.3)
    ap.add_argument("--silent", action="store_true")
    a = ap.parse_args()
    lines = list(a.line)
    if a.scene:
        sc = json.load(open(a.scene, encoding="utf-8"))
        if sc.get("line"):
            lines.append(sc["line"]["text"])
    if a.lines_file:
        lines += [l.strip() for l in open(a.lines_file, encoding="utf-8") if l.strip()]
    if not lines and not a.silent:
        fail("give the expected line(s) with --line, --scene or --lines-file, or --silent")
    text = transcribe(a.take, a.model)
    hyp = words(text)
    print(f"transcript: {text}")
    if a.silent:
        print(("SPEECH MISMATCH" if hyp else "SPEECH OK") + f" {os.path.basename(a.take)}: {len(hyp)} words heard in a take that should be silent")
        sys.exit(1 if hyp else 0)
    ref = [w for l in lines for w in words(l)]
    bad = 0
    joined = " ".join(hyp)
    for l in lines:
        n = len(re.findall(re.escape(" ".join(words(l))), joined))
        status = "found" if n == 1 else ("MISSING" if n == 0 else f"HEARD {n} TIMES")
        bad += n != 1
        print(f"  {status}: {l}")
    e = wer(ref, hyp)
    ok = e <= a.max_wer and not bad
    print(("SPEECH OK " if ok else "SPEECH MISMATCH ") + f"{os.path.basename(a.take)}: word error rate {e:.2f} (max {a.max_wer}), {len(ref)} expected words, {len(hyp)} heard")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
