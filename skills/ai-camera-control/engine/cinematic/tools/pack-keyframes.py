# Crop the clean stills to the 2.39 picture, name them by shot and timecode, write an index and labelled contact sheets.
#   python3 tools/pack-keyframes.py <raw dir> <keyframes.json> <out dir>
import json, os, subprocess, sys
raw, meta, out = sys.argv[1:4]
os.makedirs(os.path.join(out, "frames"), exist_ok=True)
rows = json.load(open(meta))
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
def tc(s):
    f = round(s * 60); return f"{f // 3600:02d}m{(f // 60) % 60:02d}s{f % 60:02d}f"
seen = {}
for r in rows:
    seen[r["shot"]] = seen.get(r["shot"], 0) + 1
    src = os.path.join(raw, f"t_{r['film']:.2f}".replace("t_", "t_").rjust(0) + ".png")
    src = os.path.join(raw, "t_" + f"{r['film']:.2f}".rjust(6, "0") + ".png")
    name = f"sh{r['shot']:02d}_{chr(96 + seen[r['shot']])}_{tc(r['film'])}.jpg"
    r["file"] = "frames/" + name
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-vf", "crop=1920:804:0:138", "-q:v", "2", os.path.join(out, "frames", name)], check=True)
# index
with open(os.path.join(out, "index.md"), "w") as f:
    f.write("# Reference frames\n\nClean picture (2.39:1, 1920x804), no overlays. Times are film seconds at 60 fps.\n\n")
    f.write("| File | Shot | Film s | Shot type | Rig | Lens | Focus | Framing | Move | Action |\n|---|---|---|---|---|---|---|---|---|---|\n")
    for r in rows:
        f.write(f"| {os.path.basename(r['file'])} | {r['shot']} | {r['film']:.2f} | {r['label']} | {r['rig']} | {r['lens']} | {r['focus']} | {r['frame']} | {r['move']} | {r['note']} |\n")
json.dump(rows, open(os.path.join(out, "index.json"), "w"), indent=1)
print(len(rows), "frames ->", out)
