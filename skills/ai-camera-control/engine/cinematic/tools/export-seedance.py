# Key frames for an AI video model (Seedance and the like): clean 21:9 frames, storyboard grids the model accepts,
# and the camera line for each frame as text (text belongs in the prompt, not on the reference).
#   python3 tools/export-seedance.py <out dir> <frames.json> [<frames.json> ...]
# Expects <out dir>/raw/t_XXX.XX.png rendered with `render.mjs --clean --scale 1.3433` (picture = 2579x1080).
# Seedance reference limits (third-party docs, Oct 2026): aspect ratio 0.4 to 2.5, sides 300 to 6000 px, 30 MB, 9 images.
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

out, sources = sys.argv[1], sys.argv[2:]
rows = [r for f in sources for r in json.load(open(f))]
rows.sort(key=lambda r: r["film"])
FPS = 30
KW, KH = 2520, 1080                      # 21:9 at 1080 lines
PW, PH, GAP = 1980, 849, 12              # one panel of a grid: 21:9
B = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 44)

def tc(s):
    f = round(s * FPS); return f"{f // FPS // 60:02d}-{f // FPS % 60:02d}-{f % FPS:02d}"

def tcs(s):
    return tc(s).replace("-", ":")

os.makedirs(os.path.join(out, "keyframes"), exist_ok=True)
os.makedirs(os.path.join(out, "grids"), exist_ok=True)
frames = []
for i, r in enumerate(rows):
    part = 1 if r["shot"] <= 6 else 2
    n = sum(1 for q in rows[: i + 1] if (1 if q["shot"] <= 6 else 2) == part)
    name = f"PART{part}_{n:02d}_SH{r['shot']:02d}.png"
    raw = os.path.join(out, "raw", f"t_{r['film']:06.2f}.png")
    if os.path.exists(raw):
        im = Image.open(raw).convert("RGB")
        W, H = im.size
        top, left = (H - KH) // 2, (W - KW) // 2
        k = im.crop((left, top, left + KW, top + KH))
        k.save(os.path.join(out, "keyframes", name), optimize=True)
    else:
        k = Image.open(os.path.join(out, "keyframes", name)).convert("RGB")   # already exported
    r["part"], r["n"] = part, n
    frames.append((name, k, r))

# grids: 9 panels (3x3) when there are 7 to 9, 2x3 for 5 or 6, 2x2 up to 4; every grid stays inside 0.4 to 2.5
def layout(n):
    return (3, 3) if n > 6 else (2, 3) if n > 4 else (2, 2)
groups, i = [], 0
halves = [[f for f in frames if f[2]["part"] == 1], [f for f in frames if f[2]["part"] == 2]]
for h in halves:
    for j in range(0, len(h), 9): groups.append(h[j:j + 9])
grid_names = []
for g in groups:
    cols, rws = layout(len(g))
    sheet = Image.new("RGB", (cols * PW + (cols - 1) * GAP, rws * PH + (rws - 1) * GAP), (0, 0, 0))
    d = ImageDraw.Draw(sheet)
    for n, (name, k, r) in enumerate(g):
        x, y = (n % cols) * (PW + GAP), (n // cols) * (PH + GAP)
        sheet.paste(k.resize((PW, PH), Image.LANCZOS), (x, y))
        # only a small panel number: words on a reference tend to leak into the video
        num = str(r["n"])
        f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 120)
        w = d.textlength(num, font=f)
        d.rectangle([x, y, x + w + 56, y + 160], fill=(0, 0, 0))
        d.text((x + 28, y + 14), num, font=f, fill=(255, 255, 255))
    a, b = g[0][2]["n"], g[-1][2]["n"]
    gname = f"GRID_PART{g[0][2]['part']}_frames_{a:02d}-{b:02d}.jpg"
    assert 0.4 < sheet.width / sheet.height < 2.5 and max(sheet.size) <= 6000, gname
    sheet.save(os.path.join(out, "grids", gname), quality=93)
    grid_names.append((gname, a, b, sheet.size))

# the camera line for every frame, and one prompt block per shot
import re
def clean(move):
    move = re.sub(r"(DOLLY IN|DOLLY OUT|TRUCK L|TRUCK R|BOOM UP|BOOM DOWN) ([\d.]+)", lambda m: f"{m.group(1)} {float(m.group(2)):.1f} m/s", move)
    move = re.sub(r"\b(TRUCK|PAN|WHIP PAN) L\b", r"\1 LEFT", move); move = re.sub(r"\b(TRUCK|PAN|WHIP PAN) R\b", r"\1 RIGHT", move)
    return move.replace("STATIC", "camera still at this frame").replace(" · ", ", ").lower()
def angle(a):
    a = re.sub(r"\s*[+-]?\d+°", "", a).strip().lower()
    return a if a.endswith(("angle", "level")) or a in ("overhead",) else a + " angle"
SIZE = {"EWS": "extreme wide shot", "WS": "wide shot", "FS": "full shot", "MWS": "medium wide shot", "MS": "medium shot", "MCU": "medium close-up", "CU": "close-up", "ECU": "extreme close-up", "OFF": "subject out of frame"}
md = ["# Rootsong key frames for Seedance", "",
      f"{len(frames)} clean key frames at {KW}x{KH} (21:9) in `keyframes/`, and {len(grid_names)} storyboard grids in `grids/`.",
      "The film goes to Seedance in two parts (part 1 = shots 1–6, part 2 = shots 7–13). Frames are numbered 1 to N inside each part: upload them in that order so frame n is Image n.",
      "Generate in 21:9. Give each reference one job in the prompt (for example `@Image1` is the start frame, `@Image2` the end frame, `@Image3` the storyboard).",
      "Keep at most 9 images per generation; 4 or 5 work better. The camera lines below go in the prompt, never on the images.", "",
      "## Grids", ""]
for gname, a, b, (w, h) in grid_names:
    md.append(f"- `{gname}`: frames {a} to {b}, {w}x{h}, numbered panels in reading order")
md += ["", "## Key frames", ""]
shot = None
for i, (name, k, r) in enumerate(frames):
    if r["shot"] != shot:
        shot = r["shot"]
        ks = [f[2]["n"] for f in frames if f[2]["shot"] == shot]
        lab = " ".join(r["label"].split())
        md += ["", f"### SH {shot:02d}: {lab}  (part {r['part']}, frames {ks[0]}{'–' + str(ks[-1]) if len(ks) > 1 else ''})", ""]
        if r["cut"]: md.append(f"Into the shot: {r['cut']}.")
        md.append(f"Prompt line: Shot {shot}: {SIZE.get(r['size'], r['size']).lower()}, {angle(r['angle'])}, {r['lens']} lens, {r['rig'].lower().replace(' · ', ' on a ')}, {' '.join(lab.split()[1:]).lower().replace(' / ', ' and ').replace(' · ', ', ')}; start on image {ks[0]}, end on image {ks[-1]}.")
        md.append("")
    frame = ", ".join(x for x in [SIZE.get(r["size"], r["size"]), angle(r["angle"]) + " (" + (re.findall(r"[+-]?\d+°", r["angle"]) or [""])[0] + ")", r["side"].lower()] if x)
    who = ", ".join(it["name"].split(" · ")[0].title() for it in r["items"]) or "no character"
    md.append(f"- **Part {r['part']}, frame {r['n']}** `{name}` at {tcs(r['film'])}: {r['lens']}, {r['rig'].lower().replace(' · ', ' on a ')}, {frame}. Move: {clean(r['move'])}. In frame: {who}.")
open(os.path.join(out, "camera-notes.md"), "w").write("\n".join(md) + "\n")
print(len(frames), "key frames,", len(grid_names), "grids ->", out)
