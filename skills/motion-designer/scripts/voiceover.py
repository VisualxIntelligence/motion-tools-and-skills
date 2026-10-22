import argparse
import array
import json
import math
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
HOME = Path(os.environ.get("MOTION_DESIGNER_HOME", Path.home() / ".cache/motion-designer"))
TTS_PYTHON = Path(os.environ.get("MOTION_DESIGNER_TTS_PYTHON", HOME / "chatterbox/bin/python"))
KOKORO_PYTHON = Path(os.environ.get("MOTION_DESIGNER_KOKORO_PYTHON", HOME / "kokoro/bin/python"))
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03"
VOICE_FX = ("highpass=f=85,equalizer=f=280:t=q:w=1.1:g=-2.5,equalizer=f=3300:t=q:w=1.3:g=2.5,"
            "equalizer=f=9500:t=q:w=1:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=140:makeup=3,deesser=i=0.35")


def run(*args):
    return subprocess.run([str(a) for a in args], check=True, capture_output=True, text=True)


def duration(path):
    return float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path).stdout)


def trimmed(src, dst):
    run("ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"{TRIM},areverse,{TRIM},areverse,aresample=44100", "-ac", "2", dst)
    return dst


def samples(path, sr=8000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    x = array.array("f")
    x.frombytes(raw)
    return x


def longest_gap(path, sr=8000, win=0.02):
    x, n = samples(path, sr), int(sr * win)
    env = [math.sqrt(sum(v * v for v in x[i:i + n]) / n) for i in range(0, len(x) - n, n)]
    peak, gap, best = max(env) or 1, 0, 0
    for e in env:
        gap = gap + 1 if e < peak * 0.02 else 0
        best = max(best, gap)
    return best * win


def level_db(path, windows, sr=8000):
    x = samples(path, sr)
    acc = n = 0
    for a, b in windows:
        seg = x[int(a * sr):int(b * sr)]
        acc += sum(v * v for v in seg)
        n += len(seg)
    return 10 * math.log10(acc / max(n, 1) + 1e-12)


def plain_length(text, tmp, key):
    if not shutil.which("say"):
        return len(text.split()) / 2.6
    run("say", "-r", "172", "-o", tmp / f"{key}.plain.aiff", text)
    return duration(trimmed(tmp / f"{key}.plain.aiff", tmp / f"{key}.plain.wav"))


def speak(spec, backend, cache, tmp):
    cache.mkdir(parents=True, exist_ok=True)
    todo = [ln for ln in spec["lines"] if not (cache / f"{ln['id']}.wav").exists()]
    if backend == "say":
        for ln in todo:
            v = spec["voices"].get(ln["voice"], {})
            run("say", "-v", v.get("say", "Samantha"), "-r", str(v.get("rate", 172)), "-o", tmp / f"{ln['id']}.aiff", ln["text"])
            run("ffmpeg", "-v", "error", "-y", "-i", tmp / f"{ln['id']}.aiff", cache / f"{ln['id']}.wav")
        return
    if not todo:
        return
    jobs = [{**ln, "settings": spec["voices"].get(ln["voice"], {}), "plain": ln["plain"]} for ln in todo]
    (tmp / "lines.json").write_text(json.dumps(jobs))
    if backend == "kokoro":
        if not KOKORO_PYTHON.exists():
            raise SystemExit(f"Kokoro is not set up at {KOKORO_PYTHON}. Ask the user, then run: bash {HERE / 'install.sh'} kokoro "
                             f"(a local Python environment, about 0.6 GB). Or draft with --backend say.")
        subprocess.run([str(KOKORO_PYTHON), str(HERE / "tts_kokoro.py"), str(tmp / "lines.json"), str(cache)], check=True)
        return
    if not TTS_PYTHON.exists():
        raise SystemExit(f"Chatterbox is not set up at {TTS_PYTHON}. Ask the user, then run: bash {HERE / 'install.sh'} chatterbox "
                         f"(a local Python environment, about 4 GB), or choose --backend kokoro. Or draft with --backend say.")
    subprocess.run([str(TTS_PYTHON), str(HERE / "tts_chatterbox.py"), str(tmp / "lines.json"), str(cache)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--backend")
    a = ap.parse_args()
    path = Path(a.script).resolve()
    spec = json.loads(path.read_text())
    base = path.parent
    backend = a.backend or spec.get("backend", "chatterbox")
    fps = spec.get("fps", 60)
    length = spec["frames"] / fps
    mix = {"music_gain": 0.26, "duck_ratio": 2.8, "lufs": -16, **spec.get("mix", {})}
    cache = base / "out/voiceover" / backend
    for v in spec.get("voices", {}).values():
        if v.get("sample") not in (None, "turbo"):
            v["sample"] = str((base / v["sample"]).resolve())

    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        lines = sorted(spec["lines"], key=lambda ln: ln["start"])
        for ln in lines:
            ln["plain"] = plain_length(ln["text"], tmp, ln["id"])
        speak({**spec, "lines": lines}, backend, cache, tmp)

        clips, speech = [], []
        for ln, nxt in zip(lines, [ln["start"] for ln in lines[1:]] + [length]):
            clip = trimmed(cache / f"{ln['id']}.wav", tmp / f"{ln['id']}.wav")
            got = duration(clip)
            assert 0.7 <= got / ln["plain"] <= 1.7, f"{ln['id']} {ln['text']!r}: {got:.2f}s against {ln['plain']:.2f}s read plainly; delete its cached take to speak it again"
            gap = longest_gap(clip)
            assert gap < 0.7, f"{ln['id']} {ln['text']!r}: a {gap:.2f}s gap inside the take; delete it to speak it again"
            limit = ln.get("until", nxt - 0.05)
            if ln.get("until") and ln["start"] + got > limit:
                tempo = got / (limit - ln["start"])
                assert tempo <= 1.2, f"{ln['id']} {ln['text']!r}: {got:.2f}s cannot fit before {limit:.2f}s"
                clip = tmp / f"{ln['id']}.fit.wav"
                run("ffmpeg", "-v", "error", "-y", "-i", tmp / f"{ln['id']}.wav", "-af", f"atempo={tempo:.4f}", clip)
                got = duration(clip)
            assert ln["start"] + got <= limit + 0.01, f"{ln['id']} {ln['text']!r} ends at {ln['start'] + got:.2f}s, past {limit:.2f}s"
            print(f"{ln['start']:6.2f}–{ln['start'] + got:6.2f}s  {ln['voice']:9s} {ln['text']}")
            clips.append((ln["start"], clip))
            speech.append((ln["start"], ln["start"] + got))

        inputs, chains = [], []
        for i, (start, clip) in enumerate(clips):
            inputs += ["-i", str(clip)]
            ms = round(start * 1000)
            chains.append(f"[{i}:a]adelay={ms}|{ms}[v{i}]")
        n = len(clips)
        out = base / spec["out"]
        out.parent.mkdir(parents=True, exist_ok=True)
        graph = (";".join(chains) + ";" + "".join(f"[v{i}]" for i in range(n)) +
                 f"amix=inputs={n}:normalize=0,{VOICE_FX},apad,atrim=0:{length:.6f},asplit=3[vo][key][vstem];"
                 f"[{n}:a]volume={mix['music_gain']},equalizer=f=2600:t=q:w=1.4:g=-5[bed];"
                 f"[bed][key]sidechaincompress=threshold=0.012:ratio={mix['duck_ratio']}:attack=20:release=900:knee=6,asplit[ducked][mstem];"
                 f"[ducked][vo]amix=inputs=2:normalize=0,loudnorm=I={mix['lufs']}:TP=-1.5:LRA=11,aresample=44100,"
                 f"apad=whole_dur={length:.6f},atrim=end_sample={round(length * 44100)}[out]")
        run("ffmpeg", "-v", "error", "-y", *inputs, "-i", base / spec["music"], "-filter_complex", graph,
            "-map", "[out]", "-ar", "44100", "-c:a", "pcm_s16le", f"{out}.wav",
            "-map", "[vstem]", "-c:a", "pcm_s16le", tmp / "voice.wav",
            "-map", "[mstem]", "-c:a", "pcm_s16le", tmp / "music.wav")
        run("ffmpeg", "-v", "error", "-y", "-i", f"{out}.wav", "-c:a", "aac", "-b:a", "256k", f"{out}.m4a")

        v = level_db(tmp / "voice.wav", speech)
        edges = [0.0] + [x for seg in speech for x in seg] + [length]
        gaps = [(p, q) for p, q in zip(edges[::2], edges[1::2]) if q - p > 1.0]
        between = f"{level_db(tmp / 'music.wav', gaps) - v:.1f} dB against the voice" if gaps else "n/a (no gap over 1 s)"
        print(f"voice {v - level_db(tmp / 'music.wav', speech):.1f} dB above the music while speaking; music between lines {between}")
        print(f"{out}.wav {duration(f'{out}.wav'):.3f}s, {out}.m4a")


if __name__ == "__main__":
    main()
