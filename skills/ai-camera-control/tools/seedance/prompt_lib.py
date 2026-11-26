"""Shared code for the three prompt builders (lean_v3.py, gallery_v4.py, build_env24.py) and the two gates (qa3.py, qa4.py).

A scene file is plain JSON (see scenes/ and README.md). A builder takes a template id and a scene file, measures the pill clip
of that template, writes the prompt and a small request file into a job folder, and the gates read the job folder.

Nothing here sends anything. Needs: numpy, Pillow, ffmpeg.
"""
import glob
import json
import math
import os
import re
import shutil
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import STANDIN_ASPECT, duration, fail, frame_at, load_json, pill_mask

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
PRON = {"he": dict(he="he", He="He", his="his", him="him"), "she": dict(he="she", He="She", his="her", him="her")}
# where the frame cuts a pill that is about 3 times as tall as it is wide, as a share of the body from the top of the head
LANDMARKS = [(0.0, "the top of {his} head"), (0.07, "{his} forehead"), (0.11, "{his} eyes and nose"), (0.14, "{his} chin"),
             (0.19, "{his} shoulders"), (0.27, "{his} chest"), (0.34, "{his} ribs"), (0.40, "{his} waist"), (0.50, "{his} hips"),
             (0.62, "{his} mid-thigh"), (0.73, "{his} knees"), (0.86, "{his} shins"), (0.97, "{his} feet")]


class Scene:
    """A scene file, checked. `s.get(key)` reads a field; `s.fmt(text)` fills {name}, {he}, {He}, {his}, {him}."""

    def __init__(self, data, path=""):
        self.d, self.path = data, path
        p = data.get("person")
        if not isinstance(p, dict) or not p.get("name"):
            fail(f"{path}: the scene needs person.name")
        self.name = p["name"]
        self.pronoun = p.get("pronoun", "he")
        if self.pronoun not in PRON:
            fail(f"{path}: person.pronoun must be 'he' or 'she'")
        self.p = PRON[self.pronoun]
        self.face_traits = p.get("face_traits", "the facial features")
        self.photo_ignore = p.get("photo_ignore", "its background, its lighting and its clothing")
        self.line = data.get("line")
        if self.line is not None and (not isinstance(self.line, dict) or not self.line.get("text")):
            fail(f"{path}: line must be an object with text (and how), or left out for a silent shot")
        self.speaks = bool(self.line)

    def get(self, key, required=True):
        v = self.d.get(key)
        if required and (v is None or v == ""):
            fail(f"{self.path}: the scene needs '{key}'")
        return v

    def fmt(self, text):
        return text.replace("{name}", self.name).replace("{he}", self.p["he"]).replace("{He}", self.p["He"]) \
            .replace("{his}", self.p["his"]).replace("{him}", self.p["him"])

    def perform(self):
        """The performance text with {LINE} replaced by the spoken line (or nothing for a silent shot)."""
        t = self.get("performance")
        if self.speaks:
            if "{LINE}" not in t:
                fail(f"{self.path}: a speaking scene needs {{LINE}} at the end of its performance")
            return t.replace("{LINE}", f'{self.p["He"]} says exactly: "{self.line["text"]}"').strip()
        return t.replace("{LINE}", "").strip()

    def second(self, fmt_text):
        sp = self.d.get("second_person")
        if not sp:
            return ""
        for k in ("name", "capsule", "description"):
            if not sp.get(k):
                fail(f"{self.path}: second_person needs {k}")
        return " " + sp["description"].rstrip(".") + ". " + fmt_text.format(capsule=sp["capsule"], second=sp["name"])


def load_scene(path):
    return Scene(load_json(path, "scene file"), path)


def resolve_pill(template, pill):
    """Path of the pill clip: --pill, else templates/<ID>/pill.mp4 in this repo."""
    p = pill or os.path.join(REPO, "templates", template, "pill.mp4")
    if not os.path.exists(p):
        fail(f"pill clip not found: {p} (render it with engine/cinematic/tools/render-pill.sh {template}, or pass --pill)")
    return p


def crop_info(clip, standin="pin"):
    """How much of the person the pill clip shows, second by second (1.0 = whole body; 0.45 = the frame cuts at the chest).
    Written into job.json for the gates. A second with no pill in frame is None."""
    out = []
    for t in range(int(duration(clip))):
        im = frame_at(clip, t + 0.2)
        if im is None:
            out.append(None)
            continue
        a = np.asarray(im).astype(int)
        m = pill_mask(a)                                                   # the red of the main pill
        ys, xs = np.nonzero(m)
        H, W = m.shape
        if ys.size < 200:
            out.append(None)
            continue
        hpx, wpx = ys.max() - ys.min(), xs.max() - xs.min()
        cropped = ys.max() / H >= 0.97 or hpx / H >= 0.97
        out.append(round(min(1.0, hpx / (wpx * STANDIN_ASPECT[standin])), 2) if cropped and wpx > 0.12 * W else 1.0)
    vis = [x for x in out if x is not None]
    return dict(per_second=out, min_visible=min(vis) if vis else None, in_frame=len(vis), seconds=len(out))


def framing_text(clip, scene, standin="pin"):
    """The measured framing, one line per second, read from the red pill in the clip: where it is, how wide, and WHERE THE FRAME CUTS
    THE PERSON OFF (the model reads 'fills 85% of the frame' as a whole person, not as a chest-up crop)."""
    rows = []
    P = scene.p
    for t in range(int(duration(clip))):
        im = frame_at(clip, t + 0.2)
        a = np.asarray(im).astype(int) if im is not None else None
        if a is None:
            rows.append(f"{t} s: no frame.")
            continue
        m = pill_mask(a)
        ys, xs = np.nonzero(m)
        H, W = m.shape
        if ys.size < 200:
            rows.append(f"{t} s: {scene.name} is not in the frame.")
            continue
        hpx, wpx = ys.max() - ys.min(), xs.max() - xs.min()
        bottom = ys.max() / H
        cx = round(((xs.min() + xs.max()) / 2) / W * 100)
        cropped = bottom >= 0.97 or hpx / H >= 0.97
        f = min(1.0, hpx / (wpx * STANDIN_ASPECT[standin])) if cropped and wpx > 0.12 * W else 1.0
        if cropped and f < 0.97:
            name = LANDMARKS[0][1]
            for tt, n in LANDMARKS:
                if f >= tt:
                    name = n
            name = name.replace("{his}", P["his"])
            where = (f"the frame shows only the top {round(f * 100)}% of {P['his']} body, from the top of {P['his']} head down to about {name}, "
                     f"and the frame edge cuts {P['him']} off there: everything below that is OUT of the frame, so no legs, no feet and no floor under {P['him']} are visible")
        else:
            where = f"{P['his']} whole body is in the frame, head to feet, with {P['his']} feet at {round(bottom * 100)}% of the way down"
        rows.append(f"{t} s: {where}; {P['his']} body is {round(wpx / W * 100)}% of the frame width across, centred {cx}% of the way across from the left.")
    return (f"Where {scene.name} is in the frame, measured from @video1 (copy these exactly; do not re-centre {P['him']}, do not pull the shot wider, "
            f"and do not show any part of {P['him']} that @video1 shows cut off by the frame):\n" + "\n".join(rows) + "\n")


def mood_image(scene, out_dir):
    """The one mood picture, as a file in the job folder. scene.mood is {"image": path} or {"environment": "16", "panel": 0}
    (one quarter of an environments/NN-*.png sheet: 0 top left, 1 top right, 2 bottom left, 3 bottom right)."""
    m = scene.d.get("mood")
    if not isinstance(m, dict):
        fail(f"{scene.path}: the -m variant needs a 'mood' object in the scene")
    if m.get("image"):
        src = m["image"] if os.path.isabs(m["image"]) else os.path.join(REPO, m["image"])
        if not os.path.exists(src):
            fail(f"mood image not found: {src}")
        name = "mood" + os.path.splitext(src)[1]
        shutil.copy(src, os.path.join(out_dir, name))
        return name
    env = str(m.get("environment", ""))
    hits = sorted(glob.glob(os.path.join(REPO, "environments", f"{env}-*.png")))
    if not env or not hits:
        fail(f"{scene.path}: mood.environment {env!r} matches no file in environments/")
    k = int(m.get("panel", 0))
    sheet = Image.open(hits[0])
    w2, h2 = sheet.size
    name = f"mood-{env}-panel{k + 1}.png"
    sheet.crop(((k % 2) * w2 // 2, (k // 2) * h2 // 2, (k % 2 + 1) * w2 // 2, (k // 2 + 1) * h2 // 2)).convert("RGB").save(os.path.join(out_dir, name))
    return name


def write_job(out_dir, fmt, template, variant, scene, prompt, clip, face_name, voice_name, mood_name, standin="pin"):
    """Write the job folder the gates read: prompt.txt, request.json (local file names, Tein field names), job.json, pill.mp4."""
    os.makedirs(out_dir, exist_ok=True)
    shutil.copy(clip, os.path.join(out_dir, "pill.mp4"))
    open(os.path.join(out_dir, "prompt.txt"), "w", encoding="utf-8").write(prompt + "\n")
    dur = duration(clip)
    req = dict(prompt=prompt, reference_video=["pill.mp4"], reference_image=[face_name] + ([mood_name] if mood_name else []),
               duration=max(4, math.ceil(dur - 0.05)), resolution="480p", ratio="21:9", draft=True, pass_faces=True, output_format="mp4",
               note="file names are local; upload them yourself and put the URLs here (docs/tein-endpoint.md)")
    if scene.speaks:
        req["reference_audio"] = [voice_name]
    json.dump(req, open(os.path.join(out_dir, "request.json"), "w"), indent=1, ensure_ascii=False)
    job = dict(format=fmt, template=template, variant=variant, speaks=scene.speaks, person=scene.name, pronoun=scene.pronoun,
               camera_numbers=scene.d.get("camera_numbers"), standin=standin, **crop_info(clip, standin))
    json.dump(job, open(os.path.join(out_dir, "job.json"), "w"), indent=1)
    voice = " (voice)" if scene.speaks else " (silent)"
    print(f"{os.path.basename(out_dir)}: {req['duration']} s, {len(prompt.split())} words{voice}{' (mood picture)' if mood_name else ''} -> {out_dir}")
    return job


def add_builder_args(ap):
    ap.add_argument("--template", required=True, help="template id, e.g. CAM22-PedestalUp")
    ap.add_argument("--scene", required=True, help="scene JSON (see scenes/)")
    ap.add_argument("--pill", help="pill clip (default templates/<ID>/pill.mp4)")
    ap.add_argument("--standin", default="pin", choices=["pin", "capsule"], help="the stand-in in the pill clip: pin (default) or capsule; sets how much of the body the framing numbers assume")
    ap.add_argument("--variant", default="both", choices=["t", "m", "both"], help="t: no mood picture; m: plus ONE mood picture; both (default)")
    ap.add_argument("--out", help="output folder (default .work/prompts/<ID> in the repo)")
    ap.add_argument("--face-name", default="your-photo.jpg", help="file name to list as @image1 (your own photo; it is not read or copied)")
    ap.add_argument("--voice-name", default="your-voice.wav", help="file name to list as @audio1, for a speaking shot (your own voice clip)")


def out_dir_for(args, fmt, variant):
    base = args.out or os.path.join(REPO, ".work", "prompts", args.template)
    return os.path.join(base, f"{fmt}-{variant}")
