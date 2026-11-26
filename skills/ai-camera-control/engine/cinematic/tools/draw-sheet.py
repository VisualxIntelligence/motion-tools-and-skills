# A labelled contact sheet: each frame gets a tag on every character, an arrow for where the frame is travelling,
# and a caption with the shot, the cut into it, the lens and rig, size and angle, and the move.
#   python3 tools/draw-sheet.py <dir with frames/ and frames.json> "<title>" [fps]
import json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

root, title = sys.argv[1], sys.argv[2]
fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
rows = json.load(open(os.path.join(root, "frames.json")))
F = "/System/Library/Fonts/Supplemental/"
B = lambda s: ImageFont.truetype(F + "Arial Bold.ttf", s)
R = lambda s: ImageFont.truetype(F + "Arial.ttf", s)
COL = {"INES": (236, 140, 70), "PILOT": (120, 190, 120), "WARDEN": (110, 150, 230), "SHIP": (210, 210, 200), "RAY": (190, 150, 210), "RAYHEAD": (190, 150, 210)}
CUT = (240, 90, 70)
PIC_W, PIC_H = 1920, 804

def tc(s):
    f = round(s * fps); return f"{f // fps // 60:02d}:{f // fps % 60:02d}:{f % fps:02d}"

def units(move):
    move = re.sub(r"(DOLLY IN|DOLLY OUT|TRUCK L|TRUCK R|BOOM UP|BOOM DOWN) ([\d.]+)", lambda m: f"{m.group(1)} {float(m.group(2)):.1f} m/s", move)
    return move.replace("STATIC", "STILL at this frame")

def arrow(d, cx, cy, a):
    dx, dy, push = a["dx"], -a["dy"], a["push"]   # frame travel, screen y down
    n = (dx * dx + dy * dy) ** 0.5
    d.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], fill=(0, 0, 0, 150), outline=(255, 255, 255, 200), width=3)
    if n > 0.004:
        ux, uy = dx / n, dy / n
        x0, y0, x1, y1 = cx - ux * 45, cy - uy * 45, cx + ux * 45, cy + uy * 45
        d.line([(x0, y0), (x1, y1)], fill=(255, 255, 255, 255), width=8)
        px, py = -uy, ux
        d.polygon([(x1 + ux * 18, y1 + uy * 18), (x1 + px * 16, y1 + py * 16), (x1 - px * 16, y1 - py * 16)], fill=(255, 255, 255, 255))
    if abs(push) > 0.005:
        # push in: arrows pointing to the centre; pull out: pointing away
        k = 1 if push < 0 else -1
        for sx, sy in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
            ox, oy = cx + sx * 48, cy + sy * 48
            tx, ty = ox - sx * 14 * k, oy - sy * 14 * k
            d.line([(ox, oy), (tx, ty)], fill=(255, 220, 120, 255), width=5)
    if n <= 0.004 and abs(push) <= 0.005:
        d.rectangle([cx - 22, cy - 22, cx + 22, cy + 22], outline=(255, 255, 255, 255), width=5)
    word = "PUSH IN" if push < -0.005 else "PULL OUT" if push > 0.005 else ""
    word = (word + " + " if word and n > 0.004 else word) + ("MOVE" if n > 0.004 else "" if word else "HOLD")
    d.text((cx, cy + 92), word, font=B(26), fill=(255, 255, 255, 255), anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0, 255))

tiles = []
for i, r in enumerate(rows):
    # the cut belongs on the first frame of each shot the sheet shows
    if i > 0 and rows[i - 1]["shot"] == r["shot"]: r["cut"] = ""
    full = Image.open(os.path.join(root, "frames", f"t_{r['film']:06.2f}.png")).convert("RGB")
    if full.width != 1920: full = full.resize((1920, round(full.height * 1920 / full.width)), Image.LANCZOS)   # any render scale
    pic = full.crop((0, (full.height - PIC_H) // 2, PIC_W, (full.height + PIC_H) // 2))
    d = ImageDraw.Draw(pic, "RGBA")
    # character tags: each one tries spots around its point and takes the first that clears the badge, the
    # arrow and every tag already placed
    BADGE = (0, 0, 760, 96); ARROW = (PIC_W - 300, PIC_H - 270, PIC_W, PIC_H)
    placed = [BADGE, ARROW]
    hit = lambda a, b: a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]
    for it in sorted(r["items"], key=lambda k: k["y"]):
        c = COL.get(it["key"], (255, 255, 255)); x, y = it["x"], it["y"]
        f = B(40); tw = d.textlength(it["name"], font=f) + 32; th = 58
        spots = [(x + 50, y - 120), (x - 50 - tw, y - 120), (x + 50, y + 60), (x - 50 - tw, y + 60)]
        spots += [(x + 50 + dx, y - 120 + dy) for dy in (-70, 70, -140, 140, -210, 210) for dx in (0, -tw - 100)]
        best = None
        for tx, ty in spots:
            tx = max(12, min(PIC_W - tw - 12, tx)); ty = max(12, min(PIC_H - th - 12, ty))
            box = (tx - 6, ty - 6, tx + tw + 6, ty + th + 6)
            if not any(hit(box, q) for q in placed): best = (tx, ty); break
        if best is None: best = (max(12, min(PIC_W - tw - 12, x + 50)), max(12, min(PIC_H - th - 12, y - 120)))
        tx, ty = best; placed.append((tx - 6, ty - 6, tx + tw + 6, ty + th + 6))
        ax = tx if tx > x else tx + tw
        d.line([(x, y), (ax, ty + 29)], fill=c + (255,), width=5)
        d.ellipse([x - 11, y - 11, x + 11, y + 11], fill=c + (255,), outline=(255, 255, 255, 255), width=4)
        d.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=10, fill=(10, 10, 12, 215), outline=c + (255,), width=4)
        d.text((tx + 16, ty + 8), it["name"], font=f, fill=(255, 255, 255, 255))
    # frame number, shot, timecode
    badge = f"{i + 1:02d}   SH {r['shot']:02d}   {tc(r['film'])}"
    bw = d.textlength(badge, font=B(40)) + 36
    d.rounded_rectangle([16, 16, 16 + bw, 76], radius=10, fill=(0, 0, 0, 190))
    d.text((34, 24), badge, font=B(40), fill=(255, 255, 255, 255))
    if r["cut"]:
        d.rectangle([0, 0, 14, PIC_H], fill=CUT + (255,))
        word = "FADE IN" if r["cut"].startswith("FADE") else "CUT"
        cw = d.textlength(word, font=B(40)) + 36
        d.rounded_rectangle([16 + bw + 14, 16, 16 + bw + 14 + cw, 76], radius=10, fill=CUT + (235,))
        d.text((34 + bw + 14, 24), word, font=B(40), fill=(255, 255, 255, 255))
    arrow(d, PIC_W - 190, PIC_H - 170, r["arrow"])
    # the caption under the picture
    cap_h = 330
    tile = Image.new("RGB", (PIC_W, PIC_H + cap_h), (18, 18, 20))
    tile.paste(pic, (0, 0))
    c = ImageDraw.Draw(tile)
    y = PIC_H + 18
    lab = re.sub(r"\s+", " ", r["label"]).strip()
    c.text((24, y), f"SH {r['shot']:02d}  {lab}", font=B(46), fill=(255, 255, 255)); y += 64
    if r["cut"]:
        c.text((24, y), "IN:  " + r["cut"], font=B(36), fill=CUT)
    else:
        c.text((24, y), f"IN:  same shot, continuing (SH {r['shot']:02d} runs {tc(r['start'])} to {tc(r['end'])})", font=R(36), fill=(150, 150, 150))
    y += 54
    frame = " · ".join(x for x in [r["size"], r["angle"], r["side"]] if x)
    c.text((24, y), f"CAMERA:  {r['lens']}  ·  {r['rig']}  ·  {frame}", font=R(36), fill=(225, 225, 225)); y += 54
    line, size = "MOVE NOW:  " + units(r["move"]), 36
    while c.textlength(line, font=R(size)) > PIC_W - 48 and size > 24: size -= 1
    c.text((24, y), line, font=R(size), fill=(225, 225, 225)); y += 54
    who = ", ".join(it["name"] for it in r["items"]) or "no character in frame"
    c.text((24, y), "ON SCREEN:  " + who, font=R(36), fill=(170, 170, 170))
    tile.save(os.path.join(root, f"frame_{i + 1:02d}_SH{r['shot']:02d}.jpg"), quality=90)
    tiles.append(tile)

cols, tw = 3, 1100
th = round(tiles[0].height * tw / tiles[0].width)
n_rows = (len(tiles) + cols - 1) // cols
head = 150
sheet = Image.new("RGB", (cols * tw + (cols + 1) * 16, head + n_rows * (th + 16) + 16), (8, 8, 10))
s = ImageDraw.Draw(sheet)
s.text((20, 22), title, font=B(54), fill=(255, 255, 255))
legend = "Tags name each character.  Arrow: where the frame travels (corner arrows: yellow in = push in, out = pull out; square = hold).  Red edge + CUT: first frame after a cut."
s.text((20, 96), legend, font=R(30), fill=(170, 170, 170))
for i, t in enumerate(tiles):
    x = 16 + (i % cols) * (tw + 16); y = head + (i // cols) * (th + 16)
    sheet.paste(t.resize((tw, th), Image.LANCZOS), (x, y))
out = os.path.join(root, sys.argv[4] if len(sys.argv) > 4 else "SHEET.jpg")
sheet.save(out, quality=90)
print(out)
