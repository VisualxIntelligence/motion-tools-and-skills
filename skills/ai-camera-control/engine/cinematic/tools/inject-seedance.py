# Put the Seedance 2.5 prompts (src/templates/seedance-prompts.json) onto an already built gallery page, without rebuilding
# it (build-gallery.py adds the same block when it builds). Re-running replaces the blocks it added before.
#   python3 tools/inject-seedance.py <gallery/index.html>
import html, json, os, re, sys

page = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
seed = json.load(open(os.path.join(os.path.dirname(here), "src", "templates", "seedance-prompts.json")))["prompts"]
s = open(page).read()

STYLE = """<style id="seed-style">.seed{margin-top:16px;border:1px solid var(--line);border-radius:6px;padding:12px 14px;background:#161618}.seedhead{display:flex;justify-content:space-between;align-items:center;gap:12px}
.seed button{background:#2a2a2e;color:var(--fg);border:1px solid #3a3a40;border-radius:4px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}.seed button:hover{background:#34343a}
.refs{margin:8px 0;padding-left:18px;font-size:13px;color:var(--mut)}.refs a{color:#9ec5ff}code{color:#e8d9a8}.prompt{color:#d6d6d2;font-size:13px;line-height:1.5;max-height:340px;overflow:auto;background:#0e0e10;padding:10px;border-radius:4px}</style>
<script id="seed-script">function copyPrompt(b){const p=b.closest('.seed').querySelector('.prompt');navigator.clipboard.writeText(p.innerText).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy prompt',1400)},()=>{const r=document.createRange();r.selectNodeContents(p);const g=getSelection();g.removeAllRanges();g.addRange(r);b.textContent='Selected: press Cmd+C'})}</script>"""

def block(pid, sd):
    refs = "".join(f"<li><code>{html.escape(i['ref'])}</code> {html.escape(i['for'])}</li>" for i in sd.get("images", []))
    return (f'<div class="seed" data-seed="{pid}"><div class="seedhead"><b>Seedance 2.5 prompt</b><button onclick="copyPrompt(this)">Copy prompt</button></div>'
            f'<ul class="refs"><li><code>@Video1</code> <a href="../seedance-capsule/{pid}.mp4" download>{pid}.mp4</a> · the capsule blockout clip: people as striped capsules (camera, blocking, timing) · <a href="../seedance/{pid}.mp4" download>clay version</a></li>{refs}</ul>'
            f'<pre class="prompt">{html.escape(sd["prompt"])}</pre></div>')

s = re.sub(r'<style id="seed-style">.*?</script>', "", s, flags=re.S)
s = re.sub(r'<div class="seed" data-seed="[^"]+">.*?</pre></div>', "", s, flags=re.S)
s = s.replace("</head>", STYLE + "</head>", 1)
n = 0
for pid, sd in seed.items():
    m = re.search(r'<section id="%s">.*?(</section>)' % re.escape(pid), s, flags=re.S)
    if not m: print("no card for", pid); continue
    s = s[:m.start(1)] + block(pid, sd) + s[m.start(1):]; n += 1
open(page, "w").write(s)
print(f"{n} prompts on {page}")
