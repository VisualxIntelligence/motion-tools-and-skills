# Draw character callouts on the reference frames: a dot on each character, a leader line, a name tag in that
# character's colour; plus the shot and timecode in a corner tag. Then labelled contact sheets of every frame.
#   python3 tools/draw-callouts.py <pack dir> <callouts.json>
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
pack, calls = sys.argv[1:3]
rows = json.load(open(os.path.join(pack, "index.json")))
co = {round(c["film"], 3): c["items"] for c in json.load(open(calls))}
B = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
S = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
COL = {"PELL": (60, 200, 190), "CAPTAIN ODALYS": (220, 70, 60), "BRASK (NAVIGATOR)": (90, 140, 220), "THE MARIGOLD": (240, 175, 80),
       "LANTERN SEED": (255, 225, 140), "SOLAR BOARD": (90, 220, 200), "LANTERNFALL": (245, 220, 180), "LIGHTHOUSE": (250, 240, 220)}
os.makedirs(os.path.join(pack, "frames-labelled"), exist_ok=True)
def tc(s):
    f = round(s * 60); return f"{f // 3600:02d}:{(f // 60) % 60:02d}:{f % 60:02d}"
for r in rows:
    im = Image.open(os.path.join(pack, r["file"])).convert("RGB")
    d = ImageDraw.Draw(im, "RGBA")
    W, H = im.size
    placed = []
    items = sorted(co.get(round(r["film"], 3), []), key=lambda i: i["x"])
    for it in items:
        name, x, y = it["name"], it["x"], it["y"]
        c = COL.get(name, (255, 255, 255))
        tw = d.textlength(name, font=B) + 24
        # tag above-right of the point, nudged so tags never overlap or leave the frame
        tx, ty = x + 40, y - 95
        if tx + tw > W - 10: tx = x - 40 - tw
        if ty < 10: ty = y + 55
        for (px, py, pw) in placed:
            if abs(ty - py) < 44 and tx < px + pw and px < tx + tw: ty = py + 48 if ty >= py else py - 48
        ty = max(10, min(H - 48, ty))
        placed.append((tx, ty, tw))
        ax = tx if tx > x else tx + tw
        d.line([(x, y), (ax, ty + 19)], fill=c + (255,), width=3)
        d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=(255, 255, 255, 255), width=3, fill=c + (255,))
        d.rounded_rectangle([tx, ty, tx + tw, ty + 38], radius=8, fill=(12, 8, 22, 200), outline=c + (255,), width=2)
        d.text((tx + 12, ty + 5), name, font=B, fill=(255, 255, 255, 255))
    corner = f"SH {r['shot']:02d}  ·  {tc(r['film'])}  ·  {r['label']}"
    cw = d.textlength(corner, font=S) + 20
    d.rounded_rectangle([12, 12, 12 + cw, 44], radius=6, fill=(0, 0, 0, 150))
    d.text((22, 16), corner, font=S, fill=(255, 235, 200, 255))
    out = os.path.join(pack, "frames-labelled", os.path.basename(r["file"]))
    im.save(out, quality=92)
    r["labelled"] = "frames-labelled/" + os.path.basename(r["file"])
    r["characters"] = [i["name"] for i in items]
json.dump(rows, open(os.path.join(pack, "index.json"), "w"), indent=1)
# one contact sheet with everything (5 across), and pages of 12 at larger size
def sheet(files, cols, tile_w, path):
    tiles = [Image.open(os.path.join(pack, f)).convert("RGB") for f in files]
    th = int(tile_w * tiles[0].height / tiles[0].width)
    rows_n = (len(tiles) + cols - 1) // cols
    sh = Image.new("RGB", (cols * tile_w + (cols + 1) * 8, rows_n * th + (rows_n + 1) * 8 + 60), (10, 8, 16))
    dd = ImageDraw.Draw(sh)
    dd.text((12, 16), "ETHERWAKE · reference frames · " + str(len(files)) + " frames", font=B, fill=(255, 225, 170))
    for i, t in enumerate(tiles):
        x = 8 + (i % cols) * (tile_w + 8); y = 60 + 8 + (i // cols) * (th + 8)
        sh.paste(t.resize((tile_w, th), Image.LANCZOS), (x, y))
    sh.save(path, quality=90)
labelled = [r["labelled"] for r in rows]
sheet(labelled, 5, 760, os.path.join(pack, "SHEET_all_frames_labelled.jpg"))
sheet([r["file"] for r in rows], 5, 760, os.path.join(pack, "SHEET_all_frames_clean.jpg"))
for i in range(0, len(labelled), 12):
    sheet(labelled[i:i + 12], 3, 1100, os.path.join(pack, f"sheet_labelled_{i // 12 + 1:02d}.jpg"))
print("done", len(rows))
