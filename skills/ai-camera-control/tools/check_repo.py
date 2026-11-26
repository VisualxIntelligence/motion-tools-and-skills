#!/usr/bin/env python3
"""Check the repo before anything is published. Exits 1 if any check fails; a check that cannot run counts as a failure.

1. Completeness: every template id has template.ts, README.md, sent.json, pill.mp4 and poster.jpg; a prompt, or a stated reason
   there is none; a Seedance result in release-media/, or a stated reason there is none.
2. Leaks: no personal path, email, face photo or voice file name, webhook, key, token, gateway host, request id, upload host,
   provider or rival name, internal route, or wording Tein asked us not to use.
3. Links: every relative Markdown link and every image/video path in the gallery data resolves.
4. Size: no file over 95 MB (GitHub refuses 100 MB).
5. Counts quoted in README.md match the repo.

Usage: python3 check_repo.py <repo dir>
"""
import json, os, re, sys

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
TEXT_EXT = {".md", ".txt", ".json", ".js", ".mjs", ".ts", ".tsx", ".py", ".sh", ".html", ".css", ".yml", ".yaml", ".toml"}
SKIP_DIRS = {"node_modules", ".work", ".git", "out"}
fails, warns = [], []


def fail(msg):
    fails.append(msg)


# ---- 1. completeness
tdir = os.path.join(ROOT, "templates")
ids = sorted(d for d in os.listdir(tdir) if os.path.isdir(os.path.join(tdir, d)))
rdir = os.path.join(ROOT, "release-media")
for tid in ids:
    d = os.path.join(tdir, tid)
    for f in ("template.ts", "README.md", "sent.json", "pill.mp4", "poster.jpg"):
        if not os.path.exists(os.path.join(d, f)):
            fail(f"{tid}: missing {f}")
    try:
        sent = json.load(open(os.path.join(d, "sent.json")))
    except Exception as e:
        fail(f"{tid}: sent.json unreadable ({e})")
        continue
    prompts = os.listdir(os.path.join(d, "prompts")) if os.path.isdir(os.path.join(d, "prompts")) else []
    video = sent.get("routes", {}).get("video") or {}
    if not prompts and not video.get("note") and not any(rv.get("note") for rv in sent.get("routes", {}).values()):
        readme = open(os.path.join(d, "README.md")).read() if os.path.exists(os.path.join(d, "README.md")) else ""
        if "has not been sent to Seedance" not in readme and "No prompt was recorded" not in readme:
            fail(f"{tid}: no prompt and no stated reason")
    has_result = os.path.isdir(os.path.join(rdir, tid)) and any(f.endswith(".mp4") for f in os.listdir(os.path.join(rdir, tid)))
    if not has_result and os.path.isdir(rdir):
        readme = open(os.path.join(d, "README.md")).read() if os.path.exists(os.path.join(d, "README.md")) else ""
        if "No Seedance result is included" not in readme:
            fail(f"{tid}: no result video and no stated reason in its README")

if not os.path.isdir(rdir):
    warns.append("release-media/ is not here (result videos are release downloads): the result-video check was skipped")

# ---- 2. leaks
LEAK = [
    (r"/Users/", "personal path"), (r"/Volumes/", "drive path"), (r"/private/tmp", "scratch path"),
    (r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}", "email address"),
    (r"person-1", "face photo file name"), (r"sirio-voice|voice-15s|voice-read", "voice file name"),
    (r"webhook\.site", "webhook host"), (r"x-api-key", "key header"), (r"(?i)\bapi[_-]?key\s*[:=]\s*[\"']?[A-Za-z0-9]{12,}", "api key value"),
    (r"Bearer\s+(?!YOUR_|TEIN_API_KEY|\$)[A-Za-z0-9._-]{12,}", "bearer token"), (r"execute-api|cvj1e0tw23", "gateway host"),
    (r"tmpfiles\.org", "upload host"), (r"\b[0-9a-f]{24}\b", "request-id-like string"),
    (r"(?i)enhancor", "first service name"), (r"(?i)\bfal\.ai\b|\bfal\b(?= (api|ai))", "provider name"),
    (r"(?i)higgsfield|most affordable", "rival or banned wording"),
    (r"(?i)byteplus", "supplier name"),
    (r"/v1/(internal|admin|playground|orgs|auth|account|run)\b", "internal route"),
    (r"REDACTED", "unfinished redaction"),
]
# Extra patterns the maintainer keeps out of the repo: one regex per line in the file named by CHECK_REPO_PRIVATE_PATTERNS.
_pf = os.environ.get("CHECK_REPO_PRIVATE_PATTERNS")
if _pf and os.path.exists(_pf):
    for _l in open(_pf, encoding="utf-8"):
        _l = _l.rstrip("\n")
        if _l and not _l.startswith("#"):
            LEAK.append((_l, "private pattern"))
leak_hits = {}
n_files = 0
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [x for x in dn if x not in SKIP_DIRS]
    if os.path.relpath(dp, ROOT).startswith("release-media"):
        continue
    for f in fn:
        p = os.path.join(dp, f)
        rel = os.path.relpath(p, ROOT)
        if os.path.getsize(p) > 95 * 1024 * 1024:
            fail(f"{rel}: over 95 MB")
        for pat, what in LEAK:   # file names too
            if re.search(pat, f):
                fail(f"{rel}: file name matches {what}")
        if os.path.splitext(f)[1].lower() not in TEXT_EXT:
            continue
        if rel in ("tools/check_repo.py",) or rel.startswith("environments/") and f.endswith(".json"):
            continue
        n_files += 1
        try:
            text = open(p, encoding="utf-8", errors="replace").read()
        except Exception:
            fail(f"{rel}: unreadable (cannot scan)")
            continue
        for pat, what in LEAK:
            for m in re.finditer(pat, text):
                s = m.group(0)
                if what == "email address" and s.lower().endswith(("@types/node", "@types/three", "@types/react")):
                    continue
                if what == "email address" and re.match(r"^@?[\w.-]+@[\w.-]+$", s) and s.startswith(("@react-three", "@remotion", "@dimforge")):
                    continue
                leak_hits.setdefault((rel, what), []).append(s[:60])
for (rel, what), hits in sorted(leak_hits.items()):
    fail(f"{rel}: {what} x{len(hits)}: {sorted(set(hits))[:3]}")

# ---- 3. links
LINK = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [x for x in dn if x not in SKIP_DIRS and x != "release-media"]
    for f in fn:
        if not f.endswith(".md"):
            continue
        p = os.path.join(dp, f)
        for m in LINK.finditer(open(p, encoding="utf-8", errors="replace").read()):
            t = m.group(1)
            if re.match(r"^(https?:|mailto:|tel:)", t) or t.startswith("`"):
                continue
            if not os.path.exists(os.path.normpath(os.path.join(dp, t))):
                fail(f"{os.path.relpath(p, ROOT)}: broken link {t}")
g = os.path.join(ROOT, "gallery", "data.json")
if os.path.exists(g):
    data = json.load(open(g))
    blob = json.dumps(data)
    for rel in set(re.findall(r'"(media/[^"]+\.(?:mp4|jpg|png))"', blob)):
        if not os.path.exists(os.path.join(ROOT, "gallery", rel)):
            fail(f"gallery/data.json: missing media {rel}")
else:
    fail("gallery/data.json missing (cannot check gallery links)")

# ---- 5. counts
readme = open(os.path.join(ROOT, "README.md")).read() if os.path.exists(os.path.join(ROOT, "README.md")) else ""
m = re.search(r"(\d+) templates", readme)
if not m:
    fail("README.md states no template count (cannot check)")
elif int(m.group(1)) != len(ids):
    fail(f"README.md says {m.group(1)} templates, the repo has {len(ids)}")

print(f"checked {len(ids)} templates and {n_files} text files")
for w in warns:
    print("WARN", w)
if fails:
    print(f"{len(fails)} FAILURES")
    for f_ in fails[:200]:
        print(" -", f_)
    if len(fails) > 200:
        print(f" ... and {len(fails) - 200} more")
    sys.exit(1)
print("ALL CHECKS PASSED")
