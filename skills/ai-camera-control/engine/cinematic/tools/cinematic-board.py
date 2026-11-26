#!/usr/bin/env python3
"""Cinematic boards for the location previews: each location is one column of stacked 2.39 strips, every strip carrying its
framing/angle name in the corner, and the column headed by the location and its mood (light plan, palette).

The ink sketch is graded in post: paper goes to the location's dark tone, ink lines glow in its light colour, a warm pool of
light sits where the key comes from, the striped pill stays untouched. Same three things everywhere: location, framing, mood.

  python3 tools/cinematic-board.py <frames dir> <out.png> [location keys...]
  <frames dir> holds <key>/stills/t_003.00.png for key = loc-<location>-<n> (lowercase), as the engine writes them."""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

F = "/System/Library/Fonts/Supplemental/"
FONT = lambda s: ImageFont.truetype(F + "Arial Narrow Bold.ttf", s)
SMALL = lambda s: ImageFont.truetype(F + "Arial Narrow.ttf", s)

# location: (title, bg, line, glow, warm light, light position (x, y as share of the frame), mood line, three framing names)
LOOKS = {
 "lake": ("LAKE AT BLUE HOUR", "#08131d", "#9cc0de", "#2d6e9c", "#ffb35a", (0.8, 0.82), "Steel blue and teal shade, thin mist, one amber lamp at the end of the jetty", ["WIDE SHOT", "REVERSE · LONG SHOT", "BIRD'S-EYE VIEW"]),
 "mountain": ("MOUNTAIN RIDGE", "#0b1017", "#d4dde8", "#4a6a8a", "#ffb070", (0.1, 0.25), "Low sun raking from the left, long hard shadows, thin cold air, ice white and slate", ["WIDE SHOT", "REVERSE · MEDIUM WIDE", "LOW ANGLE"]),
 "street": ("NIGHT STREET", "#050f0e", "#78d8cb", "#1e6f6a", "#ff9a3c", (0.18, 0.3), "Sodium amber against teal shade, wet black road, one red sign", ["WIDE SHOT", "REVERSE · LONG SHOT", "LOW ANGLE"]),
 "forest": ("FOREST WITH LIGHT SHAFTS", "#060e08", "#c2d390", "#3d6b34", "#f2c36a", (0.5, 0.05), "Low sun behind the trunks, gold shafts through dust, deep green shade", ["WIDE SHOT", "REVERSE · MEDIUM WIDE", "LOW ANGLE · LOOKING UP"]),
 "rooftop": ("ROOFTOP AT DUSK", "#06121a", "#a4d6de", "#1f6e78", "#ff8a3a", (0.5, 0.35), "Orange horizon behind a black skyline, teal sky, a few windows lit, haze", ["WIDE SHOT", "REVERSE · MEDIUM WIDE", "HIGH ANGLE"]),
 "road": ("EMPTY ROAD · GOLDEN HOUR", "#150f07", "#f2d9a4", "#b0702a", "#ffbe5a", (0.5, 0.45), "Low gold sun straight down the road, long shadows, heat haze, dusty orange", ["WIDE SHOT", "REVERSE · LONG SHOT", "LOW ANGLE"]),
 "windowroom": ("APARTMENT WINDOW ROOM", "#070b11", "#9bb0c4", "#3a5470", "#e6efff", (0.5, 0.3), "One big window as a hard grey-white backlight, the room almost black", ["MEDIUM WIDE", "REVERSE SHOT", "LOW ANGLE"]),
 "deskroom": ("LAMP-LIT DESK ROOM", "#08110f", "#d2cc90", "#2a6a5a", "#ffbe5a", (0.62, 0.45), "A single warm desk lamp as key, bottle-green wall, paper pinned in the dark", ["MEDIUM WIDE", "REVERSE SHOT", "HIGH ANGLE"]),
 "cafe": ("HAZY CAFÉ", "#130e07", "#ecd5a0", "#8a6a30", "#ffd890", (0.06, 0.4), "Tall windows, a low sun full of haze and steam, long shafts across the tables", ["MEDIUM WIDE", "REVERSE · MEDIUM WIDE", "LOW ANGLE"]),
 "bus": ("BUS INTERIOR", "#06110e", "#96e4cc", "#2a7a66", "#e6fff4", (0.5, 0.02), "Flat cold fluorescent, mint plastic, grey daylight in the windows, one red pole", ["SYMMETRICAL SHOT", "REVERSE · SYMMETRICAL", "LOW ANGLE · AISLE"]),
 "kitchen": ("NIGHT KITCHEN", "#090c10", "#80d4ec", "#1f6f88", "#ffa84a", (0.85, 0.5), "Teal glow at the back, a warm amber pool over the cooker, the rest in brown dark", ["MEDIUM WIDE", "REVERSE SHOT", "DETAIL · COUNTER"]),
 "bedroom": ("BEDROOM · CURTAIN LIGHT", "#0d0907", "#d0aa90", "#6a3a2a", "#ffd6a8", (0.5, 0.35), "Streetlight through a thin curtain, the subject a dark shape against it, one warm bulb", ["MEDIUM WIDE", "REVERSE SHOT", "LOW ANGLE"]),
 "subway": ("SUBWAY ESCALATOR HALL", "#030b11", "#82dcf4", "#1a6a86", "#b8ff90", (0.5, 0.15), "Cold cyan overhead, hard white on the metal, an acid-green edge line", ["SYMMETRICAL SHOT", "REVERSE · LONG SHOT", "HIGH ANGLE"]),
 "bathroom": ("TILED BATHROOM", "#110d07", "#ecd8a4", "#a07030", "#ffc070", (0.1, 0.35), "One small window throwing a warm hard beam across pale tile, honey and cream", ["MEDIUM WIDE", "REVERSE SHOT", "TOP DOWN"]),
 "lot": ("PARKING LOT · PASTEL WALL", "#0f1115", "#d4d8de", "#5a6070", "#f5b8b0", (0.5, 0.45), "Flat bright overcast, soft shadows, one pastel wall, faded paint on grey asphalt", ["WIDE SHOT", "REVERSE · LONG SHOT", "LOW ANGLE"]),
}
hexrgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)

def grade(path, key, w=640):
    title, bg, line, glow, warm, lp, mood, names = LOOKS[key]
    im = Image.open(path).convert("RGB"); W, H = im.size
    im = im.crop((0, int(H * 0.125), W, int(H * 0.875)))            # drop the slate bars: the 2.39 picture
    a = np.asarray(im).astype(float); h, ww = a.shape[:2]
    sat = (a.max(2) - a.min(2)) > 55                                 # the pill (red or yellow stripes) is the only colour
    m = Image.fromarray((sat * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(41))   # close the gaps: the pill's black stripes are part of it
    pill = np.asarray(m.filter(ImageFilter.MaxFilter(3))) > 0
    L = a.mean(2) / 255.0
    ink = np.clip((1 - L) * 1.6, 0, 1); ink[pill] = 0
    blur = np.asarray(Image.fromarray((ink * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))).astype(float) / 255
    yy, xx = np.mgrid[0:h, 0:ww]; d2 = ((xx / ww - lp[0]) ** 2 * 1.4 + (yy / h - lp[1]) ** 2)
    pool = np.exp(-d2 / 0.07)[..., None]                              # the warm pool of key light
    out = hexrgb(bg)[None, None, :] * (1 + 0.8 * pool)
    out = out + (hexrgb(line) - hexrgb(bg))[None, None, :] * ink[..., None] * (0.55 + 0.6 * pool)
    out = out + hexrgb(glow)[None, None, :] * blur[..., None] * 0.9 + hexrgb(warm)[None, None, :] * pool * 0.32
    vig = 1 - 0.55 * (((xx / ww - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 1.6) ** 2) ** 1.1
    out = out * np.clip(vig, 0.25, 1)[..., None]
    out[pill] = a[pill] * (0.75 + 0.35 * np.clip(vig[pill], 0, 1))[..., None]
    out = np.clip(out, 0, 255).astype(np.uint8)
    return Image.fromarray(out).resize((w, int(w * h / ww)))

def board(frames_dir, out, keys):
    cols = []; cw = 640
    for k in keys:
        title, bg, line, glow, warm, lp, mood, names = LOOKS[k]
        strips = []
        for n in (1, 2, 3):
            p = f"{frames_dir}/loc-{k.lower()}-{n}/stills/t_003.00.png"
            if not os.path.exists(p): continue
            g = grade(p, k, cw); d = ImageDraw.Draw(g)
            t = names[n - 1]; f = FONT(30); tw = d.textlength(t, font=f)
            d.text((g.width - tw - 18 + 2, g.height - 44 + 2), t, fill=(0, 0, 0), font=f); d.text((g.width - tw - 18, g.height - 44), t, fill=(255, 255, 255), font=f)
            strips.append(g)
        if not strips: continue
        head = Image.new("RGB", (cw, 118), (10, 10, 10)); d = ImageDraw.Draw(head)
        d.text((16, 10), title, fill=(255, 255, 255), font=FONT(40))
        # the mood line wrapped to two lines, in the location's own light colour
        words, lines, cur = mood.split(), [], ""
        for wd in words:
            if d.textlength((cur + " " + wd).strip(), font=SMALL(21)) > cw - 32: lines.append(cur); cur = wd
            else: cur = (cur + " " + wd).strip()
        lines.append(cur)
        for i, ln in enumerate(lines[:2]): d.text((16, 62 + i * 25), ln, fill=tuple(int(c) for c in hexrgb(warm)), font=SMALL(21))
        col = Image.new("RGB", (cw, head.height + sum(s.height for s in strips) + 4 * len(strips)), (10, 10, 10)); col.paste(head, (0, 0)); y = head.height
        for s in strips: col.paste(s, (0, y)); y += s.height + 4
        cols.append(col)
    W = sum(c.width for c in cols) + 12 * (len(cols) + 1); H = max(c.height for c in cols) + 24
    sheet = Image.new("RGB", (W, H), (10, 10, 10)); x = 12
    for c in cols: sheet.paste(c, (x, 12)); x += c.width + 12
    sheet.save(out); print(out, sheet.size)

if __name__ == "__main__":
    fd, out = sys.argv[1], sys.argv[2]; keys = sys.argv[3:] or list(LOOKS)
    board(fd, out, keys)
