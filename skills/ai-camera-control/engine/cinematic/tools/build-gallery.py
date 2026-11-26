# The template gallery: for every template, a labelled sheet (tags, cuts, motion arrows, camera lines) from its rendered
# stills, its measured-pass result, and its card; then one index.html and an overview image per family.
#   python3 tools/build-gallery.py <renders dir (one folder per template)> <info.json> <out dir>
import html, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

renders, info_path, out = sys.argv[1:4]
here = os.path.dirname(os.path.abspath(__file__))
info = json.load(open(info_path))
NAMES = {"ALEX": "ALEX", "SAM": "SAM", "GLIDER": "GLIDER", "CASE": "SUITCASE", "CAR": "CAR", "STATUE": "STATUE", "MONO": "MONOLITH",
         "SHIP": "SHIP", "TREE": "PINE", "DOOR": "DOORWAY", "STONE": "STANDING STONE", "LEAD": "CAR AHEAD"}
TMP = os.environ.get("TMPDIR", "/tmp")
os.makedirs(out, exist_ok=True)
B = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 40)

def full(p):
    """a render at any scale, as a 1920-wide frame"""
    im = Image.open(p).convert("RGB")
    return im if im.width == 1920 else im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)

def check(pid):
    """the measured pass for one template: (fails, flagged, details)"""
    r = subprocess.run(["node", os.path.join(TMP, "fc3.mjs")], env={**os.environ, "PIECE": pid}, capture_output=True, text=True, cwd=os.path.dirname(here))
    lines = [l.strip() for l in r.stdout.splitlines() if l.startswith("  SH")]
    return lines

# the motion check once for everything: id -> its notes ("clean" when none)
mr = subprocess.run(["node", os.path.join(TMP, "motion.mjs")], capture_output=True, text=True, cwd=os.path.dirname(here))
MOTION = {l.split()[0]: l[28:].strip() for l in mr.stdout.splitlines() if l[:3] in ("CAM", "OBJ", "SC0", "SC1", "ACT", "ONE")}

# the Seedance 2.5 prompt for each template (written with the sd25-pe skill): its clean blockout clip is @Video1
SP = os.path.join(os.path.dirname(here), "src", "templates", "seedance-prompts.json")
SEED = json.load(open(SP))["prompts"] if os.path.exists(SP) else {}

cards, overview = [], {}
for t in info:
    pid = t["id"]; d = os.path.join(out, pid); os.makedirs(d, exist_ok=True)
    src = os.path.join(renders, pid)
    if not os.path.isdir(src): print("no renders for", pid); continue
    link = os.path.join(d, "frames")
    if not os.path.exists(link): os.symlink(src, link)
    times = ",".join(str(x) for s in t["shots"] for x in s["times"])
    fj = subprocess.run(["node", os.path.join(TMP, "sd.mjs"), times], env={**os.environ, "PIECE": pid, "NAMES": json.dumps(NAMES)}, capture_output=True, text=True, cwd=os.path.dirname(here))
    open(os.path.join(d, "frames.json"), "w").write(fj.stdout)
    subprocess.run(["python3", os.path.join(here, "draw-sheet.py"), d, f"{pid}  ·  {t['name']}", "24", "SHEET.jpg"], check=True, capture_output=True)
    fails = check(pid)
    video = os.path.join(os.path.dirname(out), "videos", f"{pid}.mp4")
    pt_dir = os.path.join(os.path.dirname(out), "pathtraced", pid)
    pts = sorted(f for f in os.listdir(pt_dir) if f.endswith(".png") and not f.startswith("._")) if os.path.isdir(pt_dir) else []
    hero = None
    if pts:
        im = full(os.path.join(pt_dir, pts[0])); im = im.crop((0, (im.height - 804) // 2, 1920, (im.height + 804) // 2))
        im.save(os.path.join(d, "PATHTRACED.jpg"), quality=92); hero = f"{pid}/PATHTRACED.jpg"
    cards.append({**t, "sheet": f"{pid}/SHEET.jpg", "fails": fails, "video": f"../videos/{pid}.mp4" if os.path.exists(video) else None, "hero": hero})
    fam = "Scenes" if pid.startswith("SC") else "Camera moves on objects" if pid.startswith("OBJ") else "Action on people" if pid.startswith("ACT") else "One-take moves" if pid.startswith("ONE") else "Camera moves on people"
    overview.setdefault(fam, []).append((pid, t["name"], os.path.join(d, "frames", sorted(f for f in os.listdir(src) if f.endswith(".png") and not f.startswith("._"))[len(t["shots"]) and 1])))
    print(pid, "ok", len(fails), "notes")

# one overview image per family: the middle still of each template, named
for fam, items in overview.items():
    cols, tw = 4, 720; th = round(tw * 804 / 1920) + 56
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw + (cols + 1) * 12, rows * th + (rows + 1) * 12 + 70), (10, 10, 12))
    dd = ImageDraw.Draw(sheet); dd.text((14, 16), fam.upper(), font=B, fill=(255, 255, 255))
    for i, (pid, name, f) in enumerate(items):
        im = full(f); im = im.crop((0, (im.height - 804) // 2, 1920, (im.height + 804) // 2)).resize((tw, th - 56))
        x, y = 12 + (i % cols) * (tw + 12), 70 + 12 + (i // cols) * (th + 12)
        sheet.paste(im, (x, y)); dd.text((x + 6, y + th - 50), f"{pid.split('-')[0]}  {name}", font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30), fill=(230, 230, 230))
    sheet.save(os.path.join(out, f"OVERVIEW_{fam.replace(' ', '_')}.jpg"), quality=90)

# the gallery page
def card(c):
    rows = "".join(f"<tr><td>SH{s['id']:02d}</td><td>{html.escape(' '.join(s['label'].split()))}</td><td>{html.escape(s['rig'] or '')}</td><td>{s['start']:.1f}–{s['end']:.1f} s</td><td>{html.escape(s.get('cut') or '')}</td></tr>" for s in c["shots"])
    notes = "<p class='ok'>Measured pass: clean.</p>" if not c["fails"] else "<details><summary>Measured pass: " + str(len(c["fails"])) + " notes</summary><pre>" + html.escape("\n".join(c["fails"])) + "</pre></details>"
    m = MOTION.get(c["id"], "not run")
    notes += "<p class='ok'>Motion check: clean (feet, contact, ground, heads).</p>" if m == "clean" else "<details><summary>Motion check: notes</summary><pre>" + html.escape(m.replace(" · ", "\n")) + "</pre></details>"
    pattern = f"<p><b>Pattern</b> {html.escape(c['pattern'])}</p>" if c.get("pattern") else ""
    media = ""
    if c.get("video") or c.get("hero"):
        v = f'<figure><video src="{c["video"]}" autoplay loop muted playsinline controls preload="metadata"></video><figcaption>Moving preview · captured motion · feet pinned · true motion blur</figcaption></figure>' if c.get("video") else ""
        h = f'<figure><a href="{c["hero"]}"><img src="{c["hero"]}" loading="lazy"></a><figcaption>Path-traced key frame · real light and lens</figcaption></figure>' if c.get("hero") else ""
        media = f'<div class="media">{v}{h}</div>'
    sd = SEED.get(c["id"])
    seed = ""
    if sd:
        refs = "".join(f"<li><code>{html.escape(i['ref'])}</code> {html.escape(i['for'])}</li>" for i in sd.get("images", []))
        seed = f"""<div class="seed"><div class="seedhead"><b>Seedance 2.5 prompt</b><button onclick="copyPrompt(this)">Copy prompt</button></div>
<ul class="refs"><li><code>@Video1</code> <a href="../seedance-capsule/{c['id']}.mp4" download>{c['id']}.mp4</a> · the capsule blockout clip: people as striped capsules (camera, blocking, timing) · <a href="../seedance/{c['id']}.mp4" download>clay version</a></li>{refs}</ul>
<pre class="prompt">{html.escape(sd['prompt'])}</pre></div>"""
    return f"""<section id="{c['id']}"><h2>{html.escape(c['name'])} <span>{c['id']}</span></h2>{media}
<a href="{c['sheet']}"><img src="{c['sheet']}" loading="lazy"></a>
<div class="cols"><div><p><b>Says</b> {html.escape(c['says'])}</p><p><b>Use it for</b> {html.escape(c['use'])}</p>{pattern}</div>
<div><p><b>Numbers</b> {html.escape(c['numbers'])}</p><p><b>Avoid</b> {html.escape(c['avoid'])}</p>{notes}</div></div>
<table><tr><th>Shot</th><th>Lens and move</th><th>Rig</th><th>Time</th><th>Into the shot</th></tr>{rows}</table>{seed}</section>"""

fams = [("Camera moves on people", "CAM"), ("Action on people", "ACT"), ("One-take moves", "ONE"), ("Camera moves on objects", "OBJ"), ("Scenes", "SC")]
nav = "".join(f"<a href='#{f[1]}'>{f[0]}</a>" for f in fams)
body = "".join(f"<h1 id='{p}'>{n}</h1><img class='ov' src='OVERVIEW_{n.replace(' ', '_')}.jpg'>" + "".join(card(c) for c in cards if c["id"].startswith(p)) for n, p in fams if any(c["id"].startswith(p) for c in cards))
page = f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Previs Templates</title>
<style>:root{{--bg:#111113;--fg:#e8e8e6;--mut:#9a9a96;--line:#2a2a2e}}body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,Helvetica,Arial,sans-serif}}
header{{position:sticky;top:0;background:#0b0b0ccc;backdrop-filter:blur(6px);padding:12px 20px;border-bottom:1px solid var(--line);display:flex;gap:18px;align-items:center;flex-wrap:wrap}}header b{{font-size:17px}}header a{{color:var(--mut);text-decoration:none}}
main{{max-width:1500px;margin:0 auto;padding:0 20px 60px}}h1{{margin:48px 0 12px;font-size:26px}}h2{{font-size:20px;margin:0 0 10px}}h2 span{{color:var(--mut);font-weight:400;font-size:14px;margin-left:8px}}
section{{border-top:1px solid var(--line);padding:26px 0}}img{{width:100%;height:auto;display:block;border-radius:4px}}img.ov{{margin-bottom:8px}}
.cols{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:12px}}@media(max-width:800px){{.cols{{grid-template-columns:1fr}}}}
p{{margin:6px 0}}b{{color:#fff;margin-right:6px}}table{{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}}td,th{{border-bottom:1px solid var(--line);padding:5px 8px;text-align:left;vertical-align:top}}th{{color:var(--mut);font-weight:600}}
.ok{{color:#9fd49f}}.media{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}}@media(max-width:800px){{.media{{grid-template-columns:1fr}}}}video{{width:100%;display:block;border-radius:4px;background:#000}}figure{{margin:0}}figcaption{{color:var(--mut);font-size:12px;margin-top:4px}}pre{{white-space:pre-wrap;color:var(--mut);font-size:12px}}
.seed{{margin-top:16px;border:1px solid var(--line);border-radius:6px;padding:12px 14px;background:#161618}}.seedhead{{display:flex;justify-content:space-between;align-items:center;gap:12px}}
.seed button{{background:#2a2a2e;color:var(--fg);border:1px solid #3a3a40;border-radius:4px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}}.seed button:hover{{background:#34343a}}
.refs{{margin:8px 0;padding-left:18px;font-size:13px;color:var(--mut)}}.refs a{{color:#9ec5ff}}code{{color:#e8d9a8}}.prompt{{color:#d6d6d2;font-size:13px;line-height:1.5;max-height:340px;overflow:auto;background:#0e0e10;padding:10px;border-radius:4px}}</style>
<script>function copyPrompt(b){{const t=b.closest('.seed').querySelector('.prompt').innerText;navigator.clipboard.writeText(t).then(()=>{{b.textContent='Copied';setTimeout(()=>b.textContent='Copy prompt',1400)}},()=>{{const r=document.createRange();r.selectNodeContents(b.closest('.seed').querySelector('.prompt'));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected: press Cmd+C'}})}}</script></head>
<body><header><b>Previs templates</b>{nav}<span style="color:var(--mut)">{len(cards)} templates · clay · 24 fps · checked by the measured pass</span></header><main>{body}</main></body></html>"""
open(os.path.join(out, "index.html"), "w").write(page)
print("gallery", os.path.join(out, "index.html"))
