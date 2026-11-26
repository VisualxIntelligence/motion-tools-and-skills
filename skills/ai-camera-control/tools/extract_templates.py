#!/usr/bin/env python3
"""Pull each template's three.js code out of engine/cinematic/src/templates into its own folder.

One folder per template id: templates/<ID>/template.ts holds that template alone (its imports plus its
`make({ id: ... })` call, or the whole file for the famous shots, products, the showcase and the stories).
The engine stays the source of truth; this script only copies, so the folders cannot drift: run it again after
any change to a template. It writes extract-report.json (id, source file, line range, lines) next to the folders.

Usage: python3 extract_templates.py <engine templates dir> <output dir>
"""
import json, os, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "engine/cinematic/src/templates"
OUT = sys.argv[2] if len(sys.argv) > 2 else "templates"

MAKE_FILES = ["cameras.ts", "cameras2.ts", "angles.ts", "objects.ts", "oners.ts", "action.ts", "scenes.ts", "scenes2.ts"]
WHOLE_FILES = {  # id -> file copied whole (one template per file, or a file shared by two)
    "SHOW01-TheHandoff": "showcase.ts",
    "STORY02-DiveToShutter": "story.ts",
    "STORY03-TheGap": "story.ts",
}
for d in ("famous", "products"):
    for f in sorted(os.listdir(os.path.join(SRC, d))):
        if f.endswith(".ts") and f not in ("index.ts", "shared.ts"):
            WHOLE_FILES[None, d, f] = None  # id read from the file below

ID_RE = re.compile(r'id:\s*"([A-Z]{2,5}\d{2}-[A-Za-z0-9]+)"')


def slice_call(text, start):
    """Return the end index (exclusive) of the call that opens at text[start] == '(' , skipping strings and comments."""
    depth, i, n = 0, start, len(text)
    while i < n:
        c = text[i]
        if c in "\"'":
            q = c
            i += 1
            while i < n and text[i] != q:
                i += 2 if text[i] == "\\" else 1
        elif c == "`":
            i += 1
            while i < n and text[i] != "`":
                i += 2 if text[i] == "\\" else 1
        elif text.startswith("//", i):
            while i < n and text[i] != "\n":
                i += 1
        elif text.startswith("/*", i):
            i = text.index("*/", i) + 2
            continue
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("unbalanced call")


def imports_of(text):
    return "\n".join(l for l in text.splitlines() if l.startswith("import "))


def write(tid, rel, body, a, b, whole):
    d = os.path.join(OUT, tid)
    os.makedirs(d, exist_ok=True)
    where = f"lines {a}-{b} of" if not whole else "all of"
    head = (f"// {tid}\n// Copied from engine/cinematic/src/templates/{rel} ({where} that file).\n"
            f"// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.\n"
            f"// Render it: cd engine/cinematic && tools/render-pill.sh {tid}\n")
    open(os.path.join(d, "template.ts"), "w").write(head + body.rstrip() + "\n")
    return {"id": tid, "file": rel, "lines": [a, b], "line_count": b - a + 1}


report = []
for fn in MAKE_FILES:
    path = os.path.join(SRC, fn)
    text = open(path).read()
    imp = imports_of(text)
    for m in re.finditer(r"(?m)^[ \t]*make\(\{\s*id:\s*\"([A-Z]{2,5}\d{2}-[A-Za-z0-9]+)\"", text):
        s = m.start()
        op = text.index("(", s)
        e = slice_call(text, op)
        a = text.count("\n", 0, s) + 1
        b = text.count("\n", 0, e) + 1
        body = imp + "\n\n" + text[s:e].lstrip() + ","
        report.append(write(m.group(1), fn, body, a, b, False))

for key in list(WHOLE_FILES):
    if isinstance(key, tuple):
        _, d, f = key
        rel = f"{d}/{f}"
        text = open(os.path.join(SRC, rel)).read()
        ids = ID_RE.findall(text)
        if not ids:
            raise SystemExit(f"no id in {rel}")
        report.append(write(ids[0], rel, text, 1, text.count("\n") + 1, True))
    else:
        rel = WHOLE_FILES[key]
        text = open(os.path.join(SRC, rel)).read()
        report.append(write(key, rel, text, 1, text.count("\n") + 1, True))

report.sort(key=lambda r: r["id"])
os.makedirs(OUT, exist_ok=True)
json.dump({"count": len(report), "templates": report}, open(os.path.join(OUT, "extract-report.json"), "w"), indent=1)
print(f"{len(report)} templates written to {OUT}")
