#!/usr/bin/env python3
"""Make the GIFs that make the repo look like something: GitHub plays GIFs in a README, but not .mp4 files.

Writes
  docs/assets/hero-three-stages.gif       the 3D scene -> the pills -> what the model made (ACT01)
  docs/assets/looks-<ID>-inputs.gif       the same move in six looks: what we send (pills, ink, pencil, ghost, plate, clay)
  docs/assets/looks-<ID>-outputs.gif      what the model made from each one
  docs/assets/routes-<ID>.gif             pill clip, what it made, and what the sketch route made
  docs/assets/showcase/<ID>.gif           a stacked pill clip over its result, larger, for the front page
  templates/<ID>/preview.gif              every template: its pill clip, over what Seedance made from it when there is a result
  templates/INDEX.md                      a table of all templates with a thumbnail, what it says and its preview

Needs ffmpeg and Pillow. Nothing is sent anywhere. Usage: python3 tools/make_previews.py <repo dir> [--only ID,ID] [--skip-previews]
"""
import concurrent.futures, json, os, subprocess, sys, tempfile, uuid
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
ONLY = None
if "--only" in sys.argv:
    ONLY = set(sys.argv[sys.argv.index("--only") + 1].split(","))
SKIP_PREV = "--skip-previews" in sys.argv
T = os.path.join(ROOT, "templates")
REL = os.path.join(ROOT, "release-media")
ASSETS = os.path.join(ROOT, "docs", "assets")
for sub in ("", "showcase"):
    os.makedirs(os.path.join(ASSETS, sub), exist_ok=True)
FONT = next((f for f in ("/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf") if os.path.exists(f)), None)
TMP = tempfile.mkdtemp(prefix="previews_")


def label_png(text, width, size=13):
    f = ImageFont.truetype(FONT, size) if FONT else ImageFont.load_default()
    w = int(min(width - 8, f.getlength(text) + 14)) if FONT else width // 2
    im = Image.new("RGBA", (w, size + 9), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, size + 8), radius=5, fill=(10, 10, 12, 210))
    d.text((7, 3), text, font=f, fill=(255, 255, 255, 255))
    p = os.path.join(TMP, f"label_{uuid.uuid4().hex}.png")
    im.save(p)
    return p


def grid(items, cols, tw, th, fps, dur, colors, out):
    """items: [(video path, label)]. A labelled mosaic as one GIF."""
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for v, _ in items:
        cmd += ["-i", v]
    for _, lab in items:
        cmd += ["-loop", "1", "-t", str(dur), "-i", label_png(lab, tw)]
    n = len(items)
    parts = []
    for i in range(n):
        parts.append(f"[{i}:v]trim=duration={dur},setpts=PTS-STARTPTS,fps={fps},scale={tw}:{th}:force_original_aspect_ratio=decrease,"
                     f"pad={tw}:{th}:(ow-iw)/2:(oh-ih)/2:color=black,format=rgba[v{i}]")
        parts.append(f"[v{i}][{n + i}:v]overlay=5:{th - 24}:shortest=1[t{i}]")
    layout = "|".join(f"{(i % cols) * tw}_{(i // cols) * th}" for i in range(n))
    if n == 1:   # xstack needs two or more inputs
        parts.append("[t0]format=rgb24,split[s0][s1]")
    else:
        parts.append("".join(f"[t{i}]" for i in range(n)) + f"xstack=inputs={n}:layout={layout}:fill=black,format=rgb24,split[s0][s1]")
    parts.append(f"[s0]palettegen=max_colors={colors}:stats_mode=diff[p]")
    parts.append("[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle")
    cmd += ["-filter_complex", ";".join(parts), "-loop", "0", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-400:])
    return os.path.getsize(out)


def best_result(tid):
    """The Seedance result that goes with the pill clip: the gallery take if known, else result.mp4, else any video take."""
    d = os.path.join(REL, tid)
    if not os.path.isdir(d):
        return None
    try:
        sent = json.load(open(os.path.join(T, tid, "sent.json")))
    except Exception:
        sent = {}
    for rv in (sent.get("routes") or {}).values():
        for s in rv.get("sends", []) or []:
            if s.get("is_the_take_in_the_gallery"):
                for o in s.get("output") or []:
                    f = o.get("file")
                    if f and "-final" not in f and os.path.exists(os.path.join(d, f)):
                        return os.path.join(d, f)
    if os.path.exists(os.path.join(d, "result.mp4")):
        return os.path.join(d, "result.mp4")
    for f in sorted(os.listdir(d)):
        if f.endswith(".mp4") and not f.startswith(("plate", "sketch", "ink", "looks")) and "-final" not in f and "sheet" not in f:
            return os.path.join(d, f)
    return None


def preview(tid):
    pill = os.path.join(T, tid, "pill.mp4")
    out = os.path.join(T, tid, "preview.gif")
    res = best_result(tid)
    if res:
        items = [(pill, "3D pill clip (what we send)"), (res, "what Seedance made")]
        sz = grid(items, 1, 320, 140, 6, 4, 48, out)
    else:
        items = [(pill, "3D pill clip (never sent)")]
        sz = grid(items, 1, 320, 140, 6, 4, 48, out)
    return tid, sz, bool(res)


def tasks():
    jobs = []
    # hero: the pill clip, the sketch, and the real result (the same three things the Tein Previs page shows)
    hero_pill = os.path.join(T, "ACT01-BulletTimeOrbit", "pill.mp4")
    hero_ink = os.path.join(REL, "ACT01-BulletTimeOrbit", "looks", "ink-look.mp4")
    hero_res = os.path.join(REL, "ACT01-BulletTimeOrbit", "result.mp4")
    if all(os.path.exists(p) for p in (hero_pill, hero_ink, hero_res)):
        jobs.append(("hero", lambda: grid([(hero_pill, "PILL  the 3D clip we send"), (hero_ink, "SKETCH  the drawn route"), (hero_res, "REAL  what Seedance 2.5 made")],
                                          3, 400, 170, 8, 5, 64, os.path.join(ASSETS, "hero-three-stages.gif"))))
    # looks mosaics and routes
    for tid in ("ACT01-BulletTimeOrbit", "CAM06-Orbit", "SC07-AlleyFight", "ONE01-CraneToFollowWhip"):
        lk = os.path.join(REL, tid, "looks")
        if not os.path.isdir(lk):
            continue
        pairs = [("The pills", os.path.join(T, tid, "pill.mp4"), best_result(tid)),
                 ("Ink drawing", "ink-look.mp4", "ink-V1-out.mp4"), ("Pencil", "pencil-look.mp4", "pencil-V2-out.mp4"),
                 ("Soft ghosts", "ghost-look.mp4", "ghost-VG-out.mp4"), ("Empty set", "plate-look.mp4", "plate-VP-out.mp4"),
                 ("Clay mannequin", "clay-look.mp4", "clay-A-video-out.mp4")]
        ins, outs = [], []
        for name, a, b in pairs:
            a = a if os.path.isabs(a) else os.path.join(lk, a)
            b = b if (b and os.path.isabs(b)) else (os.path.join(lk, b) if b else None)
            if os.path.exists(a) and b and os.path.exists(b):
                ins.append((a, name)); outs.append((b, name))
        if len(ins) >= 4:
            jobs.append((f"looks-in-{tid}", lambda ins=ins, tid=tid: grid(ins[:6], 2 if len(ins) == 4 else 3, 270, 112, 8, 5, 96, os.path.join(ASSETS, f"looks-{tid}-inputs.gif"))))
            jobs.append((f"looks-out-{tid}", lambda outs=outs, tid=tid: grid(outs[:6], 2 if len(outs) == 4 else 3, 270, 118, 8, 5, 96, os.path.join(ASSETS, f"looks-{tid}-outputs.gif"))))
        rd = os.path.join(REL, tid)
        so = os.path.join(rd, "sketch-output.mp4")
        if os.path.exists(so) and best_result(tid):
            jobs.append((f"route-{tid}", lambda tid=tid, so=so: grid([(os.path.join(T, tid, "pill.mp4"), "pill clip"), (best_result(tid), "made from the pill clip"), (so, "made from the sketch sheet")],
                                                                      1, 400, 168, 8, 5, 96, os.path.join(ASSETS, f"routes-{tid}.gif"))))
    # showcase
    show = ["CAM06-Orbit", "CAM05-DollyZoom", "CAM16-FPV", "CAM28-BarrelRoll", "CAM21-PanReveal", "CAM25-ArcAndRise",
            "OBJ16-ProductSpin", "ACT01-BulletTimeOrbit", "SC04-CarInterior", "FAM01-Booth360", "PRD06-Glambot", "SC07-AlleyFight"]
    for tid in show:
        pill = os.path.join(T, tid, "pill.mp4")
        res = best_result(tid)
        if os.path.exists(pill) and res:
            jobs.append((f"show-{tid}", lambda tid=tid, pill=pill, res=res: grid([(pill, "3D pill clip (what we send)"), (res, "what Seedance made")], 1, 380, 163, 8, 3.5, 48,
                                                                                os.path.join(ASSETS, "showcase", f"{tid}.gif"))))
    return jobs


def main():
    jobs = [j for j in tasks() if not ONLY or any(o in j[0] for o in ONLY)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
        futs = {ex.submit(f): n for n, f in jobs}
        for fu in concurrent.futures.as_completed(futs):
            n = futs[fu]
            try:
                print(f"{n}: {round(fu.result() / 1e6, 2)} MB")
            except Exception as e:
                print(f"{n}: FAILED {e}")
    if not SKIP_PREV:
        ids = [d for d in sorted(os.listdir(T)) if os.path.isdir(os.path.join(T, d)) and (not ONLY or d in ONLY)]
        total = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
            for fu in concurrent.futures.as_completed([ex.submit(preview, i) for i in ids]):
                try:
                    tid, sz, had = fu.result(); total += sz
                except Exception as e:
                    print("preview FAILED", e)
        print(f"{len(ids)} template previews, {round(total / 1e6, 1)} MB")
    # the index with thumbnails
    if not ONLY:
        rows = ["# All templates", "", "Every template with its pill clip, what it says and a preview. Click an id for its folder: the three.js code, the prompts, the references and the result.", "",
                "| | Template | What it says |", "|---|---|---|"]
        for tid in sorted(d for d in os.listdir(T) if os.path.isdir(os.path.join(T, d))):
            rd = open(os.path.join(T, tid, "README.md")).read() if os.path.exists(os.path.join(T, tid, "README.md")) else ""
            name = rd.split("\n", 1)[0].lstrip("# ").strip()
            says = ""
            for ln in rd.split("\n"):
                if ln.startswith("**What it says.**"):
                    says = ln.replace("**What it says.**", "").strip(); break
            prev = f"templates/{tid}/poster.jpg" if os.path.exists(os.path.join(T, tid, "poster.jpg")) else f"templates/{tid}/preview.gif"
            rows.append(f"| <img src=\"{os.path.relpath(os.path.join(ROOT, prev), T)}\" width=\"200\"> | [{name}]({tid}/) | {says} |")
        open(os.path.join(T, "INDEX.md"), "w").write("\n".join(rows) + "\n")
        print("INDEX.md written")


if __name__ == "__main__":
    main()
