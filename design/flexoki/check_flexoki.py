#!/usr/bin/env python3
"""Measure Flexoki for films and charts: text contrast, accent contrast on both grounds, and which accent pairs
stay apart under colour-vision deficiency. Uses design/brand-identity/scripts/colorlib.py (WCAG 2.x contrast,
CIEDE2000, Machado/Brettel CVD simulation).

Usage:
  python3 design/flexoki/check_flexoki.py            # summary tables (Markdown)
  python3 design/flexoki/check_flexoki.py --json     # the same numbers as JSON
"""
import itertools
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "brand-identity" / "scripts"))
from colorlib import contrast_ratio, delta_e2000, simulate_cvd, to_hex  # noqa: E402

DATA = json.loads((HERE / "flexoki.json").read_text())
ACCENTS = list(DATA["accents"])
CVD = ("protan", "deutan", "tritan")
SEPARATE = 10.0  # CIEDE2000 needed to tell two series apart (the same bar as palette_audit.py)


def accent(name, mode):
    return DATA["accents"][name][DATA["roles"][mode]["accent_step"]]


def cvd_hex(h, kind):
    out = simulate_cvd(h, kind)
    return out if isinstance(out, str) else to_hex(out)


def measure():
    report = {}
    for mode in ("light", "dark"):
        r = DATA["roles"][mode]
        text = {k: round(contrast_ratio(r[k], r["bg"]), 2) for k in ("tx", "tx-2", "tx-3")}
        acc = {a: {"hex": accent(a, mode), "on_bg": round(contrast_ratio(accent(a, mode), r["bg"]), 2),
                   "on_bg2": round(contrast_ratio(accent(a, mode), r["bg-2"]), 2)} for a in ACCENTS}
        pairs = []
        for a, b in itertools.combinations(ACCENTS, 2):
            ha, hb = accent(a, mode), accent(b, mode)
            worst = min(delta_e2000(cvd_hex(ha, k), cvd_hex(hb, k)) for k in CVD)
            pairs.append({"pair": f"{a}/{b}", "normal": round(delta_e2000(ha, hb), 1), "worst_cvd": round(worst, 1)})
        bad = {p["pair"] for p in pairs if p["worst_cvd"] < SEPARATE}
        sets = []
        for n in range(len(ACCENTS), 1, -1):  # largest sets of accents where every pair stays apart under all CVD
            sets = [list(c) for c in itertools.combinations(ACCENTS, n)
                    if all(f"{a}/{b}" not in bad for a, b in itertools.combinations(c, 2))
                    and all(acc[a]["on_bg"] >= 3 for a in c)]
            if sets:
                break
        report[mode] = {"bg": r["bg"], "text": text, "accents": acc,
                        "confusable_pairs": [p for p in pairs if p["worst_cvd"] < SEPARATE],
                        "series_sets": sets}
    return report


def markdown(rep):
    lines = []
    for mode, m in rep.items():
        lines.append(f"## {mode} (background {m['bg']}, accents at {DATA['roles'][mode]['accent_step']})\n")
        lines.append("Text on bg: " + ", ".join(f"{k} {v}:1" for k, v in m["text"].items()) + "\n")
        lines.append("| Accent | Hex | On bg | On bg-2 | As text (4.5:1) | As a mark (3:1) |")
        lines.append("|---|---|---|---|---|---|")
        for a, v in m["accents"].items():
            lines.append(f"| {a} | `{v['hex']}` | {v['on_bg']} | {v['on_bg2']} | {'yes' if v['on_bg'] >= 4.5 else 'no'} | "
                         f"{'yes' if v['on_bg'] >= 3 else 'no'} |")
        bad = ", ".join(f"{p['pair']} ({p['worst_cvd']})" for p in m["confusable_pairs"]) or "none"
        lines.append(f"\nPairs closer than ΔE2000 {SEPARATE:.0f} under some CVD: {bad}\n")
        lines.append("Largest chart-series sets that stay apart under protan, deutan and tritan (and reach 3:1): "
                     + "; ".join(" + ".join(x) for x in m["series_sets"]) + "\n")
    return "\n".join(lines)


if __name__ == "__main__":
    rep = measure()
    print(json.dumps(rep, indent=1) if "--json" in sys.argv else markdown(rep))
