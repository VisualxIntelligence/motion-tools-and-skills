# The labelled set for Seedance 2.5: each key frame keeps short name tags on the characters (so the model knows who is
# who) and one short camera line in a strip under the picture; plus labelled 3x3 grids. Reads the clean frames that
# tools/export-seedance.py wrote, and the same frames.json files (tags are in 1920x804 picture pixels).
#   python3 tools/export-seedance-labelled.py <seedance dir> <frames.json> [<frames.json> ...]
# Seedance 2.5 reference limits (third-party docs, Oct 2026): 30 images, aspect ratio 0.4 to 2.5, sides 300 to 6000 px, 30 MB.
import glob, json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

root, sources = sys.argv[1], sys.argv[2:]
rows = sorted([r for f in sources for r in json.load(open(f))], key=lambda r: r["film"])
clean = sorted(glob.glob(os.path.join(root, "keyframes", "PART*.png")))
assert len(clean) == len(rows), (len(clean), len(rows))
F = "/System/Library/Fonts/Supplemental/"
B = lambda s: ImageFont.truetype(F + "Arial Bold.ttf", s)
KW, KH, STRIP = 2520, 1080, 120
S, OX = 1080 / 804, (1920 * 1080 / 804 - 2520) / 2      # picture pixels -> key-frame pixels
SHORT = {"INES": "INES", "PILOT": "ODUYA", "WARDEN": "WARDEN", "SHIP": "SHIP", "RAYHEAD": "SKY-RAY"}
COL = {"INES": (236, 140, 70), "PILOT": (120, 190, 120), "WARDEN": (110, 150, 230), "SHIP": (210, 210, 200), "RAYHEAD": (190, 150, 210)}
hit = lambda a, b: a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]

def tags(d, items):
    placed = [(0, 0, 330, 230)]
    for it in sorted(items, key=lambda k: k["y"]):
        name, c = SHORT.get(it["key"], it["name"]), COL.get(it["key"], (255, 255, 255))
        x, y = it["x"] * S - OX, it["y"] * S
        f = B(46); tw = d.textlength(name, font=f) + 34; th = 62
        spots = [(x + 60, y - 130), (x - 60 - tw, y - 130), (x + 60, y + 70), (x - 60 - tw, y + 70)]
        spots += [(x + 60 + dx, y - 130 + dy) for dy in (-75, 75, -150, 150) for dx in (0, -tw - 120)]
        best = None
        for tx, ty in spots:
            tx = max(14, min(KW - tw - 14, tx)); ty = max(14, min(KH - th - 14, ty))
            box = (tx - 8, ty - 8, tx + tw + 8, ty + th + 8)
            if not any(hit(box, q) for q in placed): best = (tx, ty); break
        tx, ty = best or (max(14, min(KW - tw - 14, x + 60)), max(14, min(KH - th - 14, y - 130)))
        placed.append((tx - 8, ty - 8, tx + tw + 8, ty + th + 8))
        ax = tx if tx > x else tx + tw
        d.line([(x, y), (ax, ty + th / 2)], fill=c + (255,), width=6)
        d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=c + (255,), outline=(255, 255, 255, 255), width=4)
        d.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=10, fill=(10, 10, 12, 225), outline=c + (255,), width=4)
        d.text((tx + 17, ty + 8), name, font=f, fill=(255, 255, 255, 255))

PLANNED = {1: "EWS", 2: "WS", 3: "MS", 4: "MS", 5: "EWS", 6: "WS", 7: "WHIP", 8: "WS", 9: "CU", 10: "WS", 11: "CU", 12: "MS", 13: "EWS"}
PART = lambda r: 1 if r["shot"] <= 6 else 2
num = {}
for r in rows: num[r["film"]] = sum(1 for q in rows if PART(q) == PART(r) and q["film"] <= r["film"])

def badge(d, n, x=0, y=0, size=150):
    # the frame number, big and plain, top left: the number the prompt calls "Image n"
    f = B(size); t = str(n); w = d.textlength(t, font=f)
    d.rectangle([x, y, x + w + 70, y + size + 50], fill=(0, 0, 0, 255))
    d.text((x + 35, y + 16), t, font=f, fill=(255, 255, 255, 255))

def line(i, r, prev):
    # one camera line: frame, shot, cut, lens, size, the shot's move
    move = " ".join(r["label"].split()[1:]).replace(" / ", " + ").replace(" · ", " · ")
    cut = "CUT  ·  " if r["cut"] and (prev is None or prev["shot"] != r["shot"]) else ""
    # the measured size, except where it can't be read (subject off frame mid-whip, the ray's flat head): the planned one
    size = PLANNED.get(r["shot"], r["size"]) if r["size"] == "OFF" or r["shot"] in (9, 11) else r["size"]
    return f"PART {PART(r)}  ·  FRAME {num[r['film']]}  ·  SH{r['shot']:02d}  ·  {cut}{r['lens']}  ·  {size}  ·  {move}"

os.makedirs(os.path.join(root, "keyframes-labelled"), exist_ok=True)
os.makedirs(os.path.join(root, "grids-labelled"), exist_ok=True)
tiles = []
for i, (path, r) in enumerate(zip(clean, rows)):
    im = Image.open(path).convert("RGB")
    d = ImageDraw.Draw(im, "RGBA")
    tags(d, r["items"])
    badge(d, num[r["film"]])
    tile = Image.new("RGB", (KW, KH + STRIP), (12, 12, 14))
    tile.paste(im, (0, 0))
    t = ImageDraw.Draw(tile)
    txt = line(i, r, rows[i - 1] if i else None)
    t.text((28, KH + 30), txt, font=B(54), fill=(255, 255, 255))
    if "CUT" in txt: t.rectangle([0, KH, 12, KH + STRIP], fill=(240, 90, 70))
    name = f"PART{PART(r)}_{num[r['film']]:02d}_SH{r['shot']:02d}.png"
    tile.save(os.path.join(root, "keyframes-labelled", name), optimize=True)
    tiles.append((tile, r))

# labelled 3x3 grids (2x3 for 5 or 6, 2x2 up to 4), each inside 0.4 to 2.5 and 6000 px
PW = 1980; PH = round(PW * (KH + STRIP) / KW); GAP = 14
def layout(n): return (3, 3) if n > 6 else (2, 3) if n > 4 else (2, 2)
halves = [[(j, t) for j, t in enumerate(tiles) if PART(t[1]) == 1], [(j, t) for j, t in enumerate(tiles) if PART(t[1]) == 2]]
out = []
for h in halves:
    for k in range(0, len(h), 9):
        g = h[k:k + 9]; cols, rws = layout(len(g))
        sheet = Image.new("RGB", (cols * PW + (cols - 1) * GAP, rws * PH + (rws - 1) * GAP), (0, 0, 0))
        for n, (j, (tile, r)) in enumerate(g):
            sheet.paste(tile.resize((PW, PH), Image.LANCZOS), ((n % cols) * (PW + GAP), (n // cols) * (PH + GAP)))
        a, b = num[g[0][1][1]["film"]], num[g[-1][1][1]["film"]]
        name = f"GRID_PART{PART(g[0][1][1])}_frames_{a:02d}-{b:02d}.jpg"
        assert 0.4 < sheet.width / sheet.height < 2.5 and max(sheet.size) <= 6000, name
        sheet.save(os.path.join(root, "grids-labelled", name), quality=93)
        out.append((name, sheet.size))
for n, s in out: print(n, s, round(s[0] / s[1], 2))
print(len(tiles), "labelled key frames")
