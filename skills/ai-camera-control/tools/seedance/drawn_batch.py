#!/usr/bin/env python3
"""The sketch route: a contact sheet of ink frames, with each pill filled in its own colour.

Input is two clips of the same template, rendered by the engine (see docs/variants.md, "Ink sheet with no scenery"):
  --ink    the ink clip      node render.mjs --videos <ID> --storyboard --boxes --no-scenery --clean --no-blur --scale 0.6667
  --color  the pill clip     tools/render-pill.sh <ID>                 (coloured stripes on grey; it tells the script who is who)
Both are cropped to 1280 x 534 at 24 fps (crop=1280:534). The script samples panel times, takes the same moment from both
clips, flood-fills each pill outline in the ink frame with that pill's own colour in diagonal stripes, and tiles the panels
3 across. 12 panels make 3 x 4. 30 panels make 3 x 10 (3 per shot, one row per shot, for a 10 shot film).

Panel times: --shots / --info give the shots (start and end in seconds), --cuts gives cut times, and with neither the clip
is one shot. Panels are spread over the shots by length; a shot with exactly 3 panels gets start, middle and end.

The sheet must keep an image aspect of 0.40 to 2.50, each side 300 to 6000 px, at most 30 MB. Otherwise the script exits 1
and writes nothing (a 4 x 3 sheet of 2590 x 825, aspect 3.14, was refused by the service).

With --prompt it also rewrites the pill-video prompt so it reads the drawing (the pill video is @video1 there, the sheet becomes
@image2, or @image1 with --no-people).

  python3 drawn_batch.py --ink ink.mp4 --color pill.mp4 --out sheet-dir [--panels 12|30]
        [--info info.json --id CAM06-Orbit | --shots shots.json | --cuts 2.5,5.5]
        [--prompt templates/CAM06-Orbit/prompts/video.txt] [--face your-photo.jpg] [--no-people]

Writes: <out>/sketch-sheet.jpg, <out>/sketch-sheet.json (panel times), and with --prompt <out>/sheet-prompt.txt and
<out>/sheet-request.json (local file names only; nothing is sent).
Needs: Pillow, numpy, ffmpeg.
"""
import argparse
import json
import math
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import (check_reference_image, duration, fail, font, frame_at, load_json, need, parse_times)

W, H, G = 1280, 534, 10          # panel size and gutter
WORDS = {3: "three", 6: "six", 9: "nine", 12: "twelve", 15: "fifteen", 18: "eighteen", 21: "twenty-one", 24: "twenty-four",
         27: "twenty-seven", 30: "thirty"}


def shots_from_args(a, dur):
    if a.shots:
        s = load_json(a.shots, "shots file")
        if isinstance(s, dict):
            s = s.get("shots", [])
    elif a.info:
        if not a.id:
            fail("--info needs --id")
        info = load_json(a.info, "info file")
        info = {t["id"]: t for t in info} if isinstance(info, list) else {info.get("id", a.id): info}
        if a.id not in info:
            fail(f"{a.id} is not in {a.info}")
        s = info[a.id]["shots"]
    elif a.cuts:
        ts = [0.0] + parse_times(a.cuts) + [dur]
        s = [dict(id=i + 1, start=ts[i], end=ts[i + 1]) for i in range(len(ts) - 1)]
    else:
        s = [dict(id=1, start=0.0, end=dur)]
    s = [dict(id=x.get("id", i + 1), start=float(x["start"]), end=float(x["end"])) for i, x in enumerate(s)]
    if not s or any(x["end"] <= x["start"] for x in s):
        fail("the shot list is empty or a shot ends before it starts")
    return s


def panel_times(shots, n, dur):
    """[(time, shot id)], n of them. One shot: even spread from 0.25 s to 0.25 s before the end. Several shots: n // shots each,
    the spare panels to the longest shots; 3 in a shot are its start (+0.15 s), middle and end (-0.15 s)."""
    if len(shots) > n:
        fail(f"{len(shots)} shots cannot fit in {n} panels (use --panels with more, or fewer cuts)")
    if len(shots) == 1:
        end = min(shots[0]["end"], dur)
        return [(0.25 + i * (end - 0.5) / (n - 1), shots[0]["id"]) for i in range(n)], [n]
    cnt = [n // len(shots)] * len(shots)
    for i in sorted(range(len(shots)), key=lambda i: -(shots[i]["end"] - shots[i]["start"]))[: n - sum(cnt)]:
        cnt[i] += 1
    out = []
    for s, c in zip(shots, cnt):
        if c == 3:
            ts = [s["start"] + 0.15, (s["start"] + s["end"]) / 2, s["end"] - 0.15]
        else:
            ts = [s["start"] + (s["end"] - s["start"]) * (k + 0.5) / c for k in range(c)]
        out += [(min(max(t, 0.0), dur - 0.05), s["id"]) for t in ts]
    return out, cnt


def draw_panel(ink, col, band):
    """The ink frame with every pill filled with its own colour in stripes. Colour is judged by purity, so a pill in a dark room counts."""
    a = np.asarray(col).astype(float)
    mx = a.max(2)
    sat = ((mx - a.min(2)) > 0.45 * mx) & (mx > 45)
    g = Image.fromarray(((np.asarray(ink.convert("L").filter(ImageFilter.MinFilter(5))) > 120) * 255).astype(np.uint8)).copy()
    ys, xs = np.nonzero(sat)
    lab = 1
    for k in range(0, ys.size, max(1, ys.size // 120)):          # flood each pill outline with its own label
        if g.getpixel((int(xs[k]), int(ys[k]))) == 255 and lab < 250:
            ImageDraw.floodfill(g, (int(xs[k]), int(ys[k])), lab)
            lab += 1
    lbl = np.array(g)
    o = np.asarray(ink).astype(float).copy()
    for v in range(1, lab):
        reg = lbl == v
        if reg.sum() == 0:
            continue
        if reg.sum() > 0.5 * W * H and (reg & sat).sum() < 0.25 * reg.sum():
            continue                                              # the fill leaked into the paper (a pill filling the frame is kept)
        reg = np.asarray(Image.fromarray(reg.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))) > 0
        px = a[reg & sat]
        rgb = np.median(px, 0) if px.size else np.array([227, 38, 31.])
        rgb = rgb * (235 / max(1, rgb.max()))                     # the colour at full strength, not shaded
        o[reg & band] = rgb
        o[reg & ~band] = (20, 20, 20)
    dark = np.asarray(ink.convert("L")) < 70                      # the ink line stays on top
    o[dark] = np.asarray(ink).astype(float)[dark]
    return Image.fromarray(o.astype(np.uint8))


def role_text(n, panels, people):
    nw = WORDS.get(n, str(n))
    t = (f"@image2 is a storyboard drawing, not a picture of the scene: {nw} numbered panels drawn in thin black line on white paper, read left to right and top to bottom. " + panels +
         " Read from it only where the camera is, how it is angled and framed, the cuts, and where each person is in frame, how big, and which way they face. Nothing in it shows what anything looks like. "
         "The drawing shows only the ground, the people and the few structures the action uses; the scenery is left out on purpose: place trees, plants, rocks, lamps, benches and every other detail of the real place freely, as the description below says. "
         "Every drawn shape marks only where a real thing stands and roughly how big it is, never its shape or outline: drawn pillars are where stone columns stand, drawn boxes and slabs where walls, blocks, crates, cars or buildings stand, and the dotted floor is real paving or ground. "
         "Every real thing has its own natural, irregular shape: trees have ragged, asymmetric crowns, uneven branches and gaps of sky, some lean, heights vary; "
         "nothing is a neat cone, a sphere, a clipped topiary or a symmetric form, and no outline in the drawing is traced. ")
    if people:
        t += ("Each striped capsule marks one person, named below by its colour; it has no body, so every pose comes from the words. The small circle drawn on a capsule marks the side that person faces: "
              "centred means they face the lens, at the edge means profile, gone means they face away. ")
    t += ("It is a drawing: do not adopt its line-drawing style, black outlines, white paper, simplified shapes, panel borders or numbers. "
          "No cone-shaped tree, smooth sphere, plain pillar, plain box, untextured surface or striped capsule ever appears; the final video is live-action and photographic.")
    return t


CINE = ("Cinematography: shot like a feature film on a large-format cinema camera with real lenses: low, warm sun from behind or the side with soft backlight on hair and shoulders, "
        "long shadows, atmospheric haze separating foreground, middle ground and background, natural lens falloff and gentle flare, a restrained film grade with deep, rich shadows and soft highlights.")


def rewrite_prompt(p, n, panels, people):
    p, k = re.subn(r"^@video1 is a coarse-blockout reference[^\n]*$", lambda m: role_text(n, panels, people), p, flags=re.M)
    if k != 1:
        fail("the prompt has no line starting '@video1 is a coarse-blockout reference' (cannot swap the role line)")
    p = re.sub(r"^The set in @video1 is only a layout[^\n]*\n", "", p, flags=re.M)
    p = p.replace("@video1", "@image2")
    p, k = re.subn(r"(^The final visuals are live-action and photographic[^\n]*$)", lambda m: m.group(1) + "\n" + CINE, p, count=1, flags=re.M)
    if k != 1:
        fail("the prompt has no 'The final visuals are live-action and photographic' line (cannot add the cinematography line)")
    if not people:
        p = p.replace("@image2", "@image1")
    return p


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ink", required=True)
    ap.add_argument("--color", required=True, help="the pill clip of the same template (coloured pills)")
    ap.add_argument("--out", required=True, help="output folder (created)")
    ap.add_argument("--panels", type=int, default=12, help="12 (3 x 4) or 30 (3 x 10); any multiple of 3")
    ap.add_argument("--info", help="engine template info JSON (see shots.sh)")
    ap.add_argument("--id", help="template id inside --info")
    ap.add_argument("--shots", help="JSON list of {id, start, end}")
    ap.add_argument("--cuts", help="cut times in seconds, comma separated")
    ap.add_argument("--prompt", help="the pill-video prompt to rewrite for the sheet, e.g. templates/<ID>/prompts/video.txt")
    ap.add_argument("--face", help="file name of your own face photo, only to list it as @image1 in sheet-request.json (it is not read or copied)")
    ap.add_argument("--no-people", action="store_true", help="object shot: no capsule sentence, the sheet is @image1")
    a = ap.parse_args()
    need("ffmpeg")
    if a.panels % 3 or a.panels < 3:
        fail("--panels must be a multiple of 3")
    d_ink, d_col = duration(a.ink), duration(a.color)
    if abs(d_ink - d_col) > 0.2:
        fail(f"the ink clip is {d_ink:.2f} s and the pill clip is {d_col:.2f} s; they must be the same piece")
    dur = min(d_ink, d_col)
    shots = shots_from_args(a, dur)
    times, cnt = panel_times(shots, a.panels, dur)
    rows = a.panels // 3
    sw, sh = 3 * W + 4 * G, rows * H + (rows + 1) * G
    aspect = check_reference_image((sw, sh))
    os.makedirs(a.out, exist_ok=True)
    sheet = Image.new("RGB", (sw, sh), "white")
    dr = ImageDraw.Draw(sheet)
    B = font(34)
    yy, xx = np.mgrid[0:H, 0:W]
    band = ((xx + yy) // 18) % 2 == 0
    for i, (t, _) in enumerate(times):
        ink, col = frame_at(a.ink, t, (W, H)), frame_at(a.color, t, (W, H))
        if ink is None or col is None:
            fail(f"no frame at {t:.2f} s in one of the clips")
        x, y = G + (i % 3) * (W + G), G + (i // 3) * (H + G)
        sheet.paste(draw_panel(ink, col, band), (x, y))
        dr.rectangle((x, y, x + 58, y + 48), fill="black")
        dr.text((x + 10, y + 6), str(i + 1), font=B, fill="white")
    sp = os.path.join(a.out, "sketch-sheet.jpg")
    sheet.save(sp, quality=90)
    size = os.path.getsize(sp)
    check_reference_image((sw, sh), size)
    json.dump(dict(size=[sw, sh], aspect=round(aspect, 3), bytes=size, panels=a.panels,
                   times=[round(t, 3) for t, _ in times], shots=[dict(s) for s in shots], panels_per_shot=cnt),
              open(os.path.join(a.out, "sketch-sheet.json"), "w"), indent=1)
    print(f"sheet {sw} x {sh}, aspect {aspect:.2f}, {a.panels} panels, {size / 1e6:.1f} MB -> {sp}")
    if a.prompt:
        if len(shots) == 1:
            panels = f"Panels 1 to {a.panels} are one continuous shot, sampled evenly from its start to its end."
        else:
            parts, i = [], 0
            for s, c in zip(shots, cnt):
                parts.append(f"{i + 1}" + ("" if c == 1 else f"-{i + c}") + f" show Shot {s['id']}")
                i += c
            panels = "Panels " + ", ".join(parts) + "."
        try:
            src = open(a.prompt, encoding="utf-8").read()
        except OSError as e:
            fail(f"cannot read the prompt: {e}")
        p = rewrite_prompt(src, a.panels, panels, not a.no_people)
        open(os.path.join(a.out, "sheet-prompt.txt"), "w", encoding="utf-8").write(p)
        images = ([a.face or "your-photo.jpg"] if not a.no_people else []) + ["sketch-sheet.jpg"]
        req = dict(prompt=p, reference_image=images, duration=max(4, math.ceil(dur - 0.05)), resolution="480p", ratio="21:9",
                   draft=True, pass_faces=True, output_format="mp4",
                   note="file names are local; upload them yourself and put the URLs in reference_image (see docs/tein-endpoint.md)")
        json.dump(req, open(os.path.join(a.out, "sheet-request.json"), "w"), indent=1, ensure_ascii=False)
        print(f"prompt {len(p.split())} words -> {os.path.join(a.out, 'sheet-prompt.txt')}")


if __name__ == "__main__":
    main()
