#!/usr/bin/env python3
"""Put the stills of one template on one labelled sheet, in time order, for the eye pass.
   python3 tools/stills-sheet.py <folder with t_*.png> <out.jpg> [columns]
Example: python3 tools/stills-sheet.py out/stills/MY01-SlowPushViolin out/MY01-sheet.jpg 3"""
import glob, os, sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
files = sorted(glob.glob(os.path.join(src, "t_*.png")))
if not files:
    sys.exit(f"no t_*.png stills in {src}")
ims = [Image.open(f).convert("RGB") for f in files]
w = 640; ims = [i.resize((w, int(i.height * w / i.width))) for i in ims]
h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 24)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for n, (f, im) in enumerate(zip(files, ims)):
    x, y = (n % cols) * w, (n // cols) * (h + 24)
    sheet.paste(im, (x, y + 24)); d.text((x + 6, y + 6), os.path.basename(f).replace("t_", "").replace(".png", "") + " s", fill=(240, 240, 240))
sheet.save(out, quality=88); print(out, f"{len(ims)} stills")
