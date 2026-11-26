#!/usr/bin/env python3
"""Contact sheets of the camera moves and angles: one row per template, four frames across, the template name on the row, and
under it the three things every template carries: LOCATION (which of the 24 cinematic environments), FRAMING (its name) and
MOOD (the environment's own line). Six rows per sheet.

  python3 tools/template-sheets.py <stills dir> <out dir> [ids...]
  <stills dir> holds <ID>/t_*.png as render.mjs --stills-plan writes them."""
import json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "src", "templates")
ENVDIR = os.path.join(HERE, "..", "..", "..", "workspace", "projects", "previs-templates", "environments")
F = "/System/Library/Fonts/Supplemental/"
B = lambda s: ImageFont.truetype(F + "Arial Narrow Bold.ttf", s)
R = lambda s: ImageFont.truetype(F + "Arial Narrow.ttf", s)

place = dict(re.findall(r'(CAM\d\d|ANG\d\d): "(\d\d)"', open(os.path.join(SRC, "studios.ts")).read()))
moods = json.load(open(os.path.join(ENVDIR, "moods.json")))
env_of = {k[:2]: (k, v["analysis"]) for k, v in moods.items()}

def mood_line(text):
    # the first two short sentences of the analysis: the place and the light
    parts = re.split(r"(?<=[.])\s+", text.strip())
    s = " ".join(parts[:2]) if len(" ".join(parts[:2])) < 150 else parts[0]
    return s

def row(stills_dir, tid, w=400, h=168):
    fs = sorted(f for f in os.listdir(os.path.join(stills_dir, tid)) if f.endswith(".png"))
    if not fs: return None
    pick = fs[:4]                                          # every still the template has, in time order (3 or 4 columns)
    ims = []
    for f in pick:
        im = Image.open(os.path.join(stills_dir, tid, f)).convert("RGB"); W, H = im.size
        ims.append(im.crop((0, int(H * 0.125), W, int(H * 0.875))).resize((w, h)))
    return ims

def sheet(stills_dir, ids, out):
    w, h, g = 400, 168, 3
    cols = 4
    rows = []
    for tid in ids:
        ims = row(stills_dir, tid, w, h)
        if not ims: continue
        if len(ims) == 3: ims = row(stills_dir, tid, 532, h)
        code = tid.split("-")[0]; e = env_of.get(place.get(code, ""), ("", ""))
        envname = e[0][3:].replace("-", " ").upper() if e[0] else ""
        head = Image.new("RGB", (4 * w + 3 * g, 46), (16, 16, 16)); d = ImageDraw.Draw(head)
        d.text((6, 2), tid, fill=(255, 255, 255), font=B(22))
        d.text((6, 26), f"LOCATION  {e[0][:2]} {envname}   ·   MOOD  {mood_line(e[1])}"[:210], fill=(236, 186, 110), font=R(15))
        strip = Image.new("RGB", (4 * w + 3 * g, h), (0, 0, 0)); x = 0
        for im in ims: strip.paste(im, (x, 0)); x += im.width + g
        rows.append((head, strip))
    H = sum(a.height + b.height + 4 for a, b in rows)
    img = Image.new("RGB", (4 * w + 3 * g, max(H, 10)), (0, 0, 0)); y = 0
    for a, b in rows: img.paste(a, (0, y)); y += a.height; img.paste(b, (0, y)); y += b.height + 4
    img.save(out); print(out, img.size)

if __name__ == "__main__" and "--by-env" not in sys.argv:
    sd, od = sys.argv[1], sys.argv[2]; os.makedirs(od, exist_ok=True)
    ids = sys.argv[3:] or sorted(d for d in os.listdir(sd) if re.match(r"(CAM(1[7-9]|[2-4]\d)|ANG\d\d)-", d))
    for i in range(0, len(ids), 6): sheet(sd, ids[i:i + 6], os.path.join(od, f"sheet-{i // 6 + 1:02d}.png"))


# ---------------------------------------------------------------- one sheet per environment (24): the reference on the left, every template shot there on the right
def env_sheets(stills_dir, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    by_env = {}
    for tid in sorted(d for d in os.listdir(stills_dir) if re.match(r"(CAM(1[7-9]|[2-4]\d)|ANG\d\d)-", d)):
        by_env.setdefault(place.get(tid.split("-")[0], "??"), []).append(tid)
    for n in sorted(by_env):
        if n not in env_of: continue
        eid, analysis = env_of[n]; tids = by_env[n]
        rows = [r for r in (sheet_rows(stills_dir, t) for t in tids) if r]
        if not rows: continue
        right_w = 4 * 400 + 3 * 3; right_h = sum(a.height + b.height + 4 for a, b in rows)
        ref = Image.open(os.path.join(ENVDIR, eid + ".png")).convert("RGB"); lw = 560; ref = ref.resize((lw, int(lw * ref.height / ref.width)))
        left = Image.new("RGB", (lw, max(ref.height + 230, right_h)), (12, 12, 12)); d = ImageDraw.Draw(left)
        d.text((8, 4), eid[:2] + " " + eid[3:].replace("-", " ").upper(), fill=(255, 255, 255), font=B(30)); left.paste(ref, (0, 44))
        y = 44 + ref.height + 8; words, line = analysis.split(), ""
        for wd in words:
            if d.textlength((line + " " + wd).strip(), font=R(17)) > lw - 16: d.text((8, y), line, fill=(236, 186, 110), font=R(17)); y += 21; line = wd
            else: line = (line + " " + wd).strip()
        d.text((8, y), line, fill=(236, 186, 110), font=R(17))
        img = Image.new("RGB", (lw + 10 + right_w, left.height if left.height > right_h else right_h), (0, 0, 0)); img.paste(left, (0, 0)); yy = 0
        for a, b in rows: img.paste(a, (lw + 10, yy)); yy += a.height; img.paste(b, (lw + 10, yy)); yy += b.height + 4
        img.save(os.path.join(out_dir, f"env-{eid}.png")); print(eid, len(tids), "templates")

def sheet_rows(stills_dir, tid):
    ims = row(stills_dir, tid, 400, 168)
    if not ims: return None
    if len(ims) == 3: ims = row(stills_dir, tid, 532, 168)
    w, g = 400, 3; code = tid.split("-")[0]
    head = Image.new("RGB", (4 * w + 3 * g, 28), (16, 16, 16)); ImageDraw.Draw(head).text((6, 2), tid, fill=(255, 255, 255), font=B(21))
    strip = Image.new("RGB", (4 * w + 3 * g, 168), (0, 0, 0)); x = 0
    for im in ims: strip.paste(im, (x, 0)); x += im.width + g
    return head, strip

if __name__ == "__main__" and len(sys.argv) > 3 and sys.argv[3] == "--by-env":
    env_sheets(sys.argv[1], sys.argv[2])
