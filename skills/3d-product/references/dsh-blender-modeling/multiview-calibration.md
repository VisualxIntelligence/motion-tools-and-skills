# Three-view calibration (multiview calibration)

> Companion to `SKILL.md` **§0.6.1 Three-view calibration**; the current plugin prefers `img_calib` (multi-view calibration) and `shapesolve_solve` (silhouette back-solving), and this script serves as an independent recomputation / blind-test reference. (`SKILL.md`, `img_calib`, `shapesolve_solve`, `img_rectify`, `img_scan` and `spec.py` belong to the original DSH workflow and are not part of this folder; the script below is standalone.) It answers three very concrete questions:
> 1. **Can this reference image be converted to millimetres with "a single px_per_mm"?**
> 2. **Can** the three views be **solved jointly** (merged into one scale)?
> 3. For dimensions that span different depths, how large is the error really?
>
> Standard library only (no numpy / Blender needed); the script ships with `--selftest`.

## 0. ★ First, correct a common misconception: orthographic ⇏ all three views share the same px_per_mm

**Orthographic projection only guarantees that, "within each view", pixels and millimetres are linear** (that view's `s` is constant, in-view residual ≈ 0).
It does **not imply** that the three views share the same `px_per_mm`: the three images can each have a different **output scale / resolution / crop**
and still all be strictly orthographic.

**Measured (this machine, Blender 5.2.2, measured directly with `world_to_camera_view`, no rendering)**:

| View | ortho_scale | Pixel length of a 1000 mm ruler | px_per_mm | Parallax probe (x displacement caused by changing depth by 2 m) |
|---|---|---|---|---|
| front | 4.0 m | 480 px | 0.48 | **0.000 px** |
| side | 8.0 m | 240 px | 0.24 | **0.000 px** |
| top | 2.0 m | 960 px | 0.96 | **0.000 px** |

All three parallax probes are **0 px** ⇒ all three views are **strictly orthographic**; yet their `px_per_mm` differ from each other by **300%**.
⇒ **"The three views must share the same px_per_mm" is wrong.** Sharing a scale is an **extra assumption** ("the three views come from the same engineering drawing /
the same render, same resolution, same crop"), which must be **declared and verified separately** and cannot be derived from orthographicity.

**Corollary (it directly determines how to judge)**: cross-view checks must **convert to millimetres before comparing**; do not compare `s` directly.
Comparing `s` directly will misread "the three images are scaled differently" as "perspective", and you will go and change picked points that were perfectly fine.

## 1. When to use it

| Situation | Use it? |
|---|---|
| You have a front / side / top view, **and can confirm they come from the same drawing or the same render** | ✅ Joint calibration; a joint `px_per_mm` may be merged |
| The three views come from different sources (screenshots / separate photos / rescaled images) | ⚠ **Calibrate each view separately**, cross-check with a shared dimension; **do not** merge |
| Only one image, or the three are not the same orthographic direction | ⚠ Fall back to per-view calibration (own ruler + conversion at the same depth and direction) |
| Clearly a perspective photo / wide angle | First rectify with `img_rectify` (see §6; note it **only rectifies the plane the points were picked on**), then handle as above |

## 2. How to pick points (≥3 per view)

1. Choose features of **known real length**: wheelbase / wheel diameter / overall length / barrel length / window width... (write the source into `spec.py` or the project material).
2. In the image, measure the pixel length of that feature **along the horizontal image axis of this view**. Key points:
   - The feature direction must be **parallel to the horizontal image axis** (project slanted ones first, otherwise you measure the hypotenuse);
   - Spread the 2–3 features of the same view as far apart as possible (the larger the span, the more stable the scale);
   - ★ **At least 3 points per view**: the line solved from two points necessarily passes through those two points, so the **residual is always 0** and perspective cannot be detected.
3. **Then give at least one "shared dimension"**: a real dimension that **can be measured in two or more views** (overall height or overall length will do).
   The cross-view check depends entirely on it. **Without a shared dimension the three views cannot prove each other**, and the conclusion can only be `unresolved`.
4. Fill it into JSON (example below) and run the script.

```json
{
  "views": {
    "front": {"image_width": 1920, "features": [
      {"name": "overall length", "u_mm": 9830, "px": 1474.5},
      {"name": "wheelbase", "u_mm": 4600, "px": 690.0},
      {"name": "wheel diameter", "u_mm":  660, "px":  99.0}
    ]},
    "side":  {"image_width": 1920, "features": [ /* same as above, using known dimensions on the side view */ ]},
    "top":   {"image_width": 1920, "features": [ /* same as above */ ]}
  },
  "shared": [
    {"name": "overall height", "measure": {"front": {"px": 812.0}, "side": {"px": 406.0}}}
  ],
  "same_scale_asserted": false
}
```

`u_mm` = the known physical length (mm) of that feature **along the horizontal image axis of this view**; `px` = the pixel length of the same feature in the image.
Write `same_scale_asserted: true` only when you **actually know** the three views have the same scale (for example a scan of one engineering drawing).

## 3. The script

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Three-view calibration (front / side / top): per-view least-squares solve of px_per_mm + cross-view consistency check.

Usage
    python3 multiview_calib.py calib.json      # read calibration input, print report
    python3 multiview_calib.py --selftest      # self-check on synthetic data (the four cases at the end)

Conventions (★ the core misconception fixed in this version)
  u_mm = known physical length (difference of endpoints, mm) of the feature along the **horizontal image axis of this view**
  px   = pixel length of the same feature in the reference image
  model px = cx + s * u (s = px_per_mm, cx = the pixel column where u=0 falls)
  ★ A straight line always passes through two points (residual always 0); to judge "is this image orthographic", give at least 3 points per view.
  ★ Orthographic only guarantees that px and mm are linear **inside each view** (in-view residual ≈ 0). It does **not** guarantee that the three views share
    the same px_per_mm: the three images can each have a different output scale / resolution / crop and still all be strictly orthographic.
    So the cross-view check must convert to **millimetres** before comparing (see shared_dimensions), not compare s directly.
"""
import json
import sys

RESID_TOL_PCT = 2.0   # in-view residual limit: >2% -> this view is non-linear inside (perspective, or a feature point was mismeasured)
SHARED_TOL_PCT = 3.0  # limit on the difference between the mm values that two views derive for the same physical dimension: >3% -> the two views are incompatible
SAME_SCALE_TOL_PCT = 1.0  # the three px_per_mm may be treated as "the same output scale" only if they differ by <=1%


def fit_view(features, image_width=None):
    """Least-squares solve of px = cx + s*u. features=[{name,u_mm,px}, ...] (>=2 points)."""
    pts = [(float(f["u_mm"]), float(f["px"])) for f in features]
    n = len(pts)
    if n < 2:
        raise ValueError("at least 2 feature points are needed to fix the scale (got %d)" % n)
    mx = sum(p[0] for p in pts) / n
    my = sum(p[1] for p in pts) / n
    sxx = sum((u - mx) ** 2 for u, _ in pts)
    if sxx <= 0:
        raise ValueError("all feature points coincide in u (sxx=0); the scale cannot be determined")
    sxy = sum((u - mx) * (p - my) for u, p in pts)
    s = sxy / sxx
    if s <= 0:
        raise ValueError("solved scale s<=0 (pixels and millimetres have opposite signs? check that u_mm/px match up)")
    cx = my - s * mx
    resid = [abs(p - (cx + s * u)) for u, p in pts]
    span = max(u for u, _ in pts) - min(u for u, _ in pts)
    resid_px = max(resid)
    resid_pct = (resid_px / (s * span) * 100.0) if span > 0 else 0.0
    return {"n": n, "s": s, "cx": cx, "sxx": sxx, "span_mm": span,
            "resid_px": resid_px, "resid_pct": resid_pct,
            "pp_offset_px": (None if image_width is None else cx - float(image_width) / 2.0),
            "per_point_px": [round(r, 3) for r in resid]}


def same_scale(fits):
    """Whether the three px_per_mm can be treated as the same output scale (this is an **extra assumption**, not a corollary of orthographicity)."""
    ss = [f["s"] for f in fits.values()]
    if not ss or min(ss) <= 0:
        return None, None
    spread = (max(ss) - min(ss)) / min(ss) * 100.0
    return (spread <= SAME_SCALE_TOL_PCT), spread


def shared_check(fits, shared):
    """Cross-view check: convert the same physical dimension to mm with each view's **own** s, then see whether they agree.

    shared = [{"name": "overall height", "measure": {"front": {"px": 812.0}, "side": {"px": 150.0}}}, ...]
    """
    rows, bad = [], []
    for item in (shared or []):
        name = item.get("name") or "?"
        vals = {}
        for vname, m in (item.get("measure") or {}).items():
            if vname not in fits:
                continue
            vals[vname] = float(m["px"]) / fits[vname]["s"]
        if len(vals) < 2:
            rows.append({"name": name, "mm": vals, "disagree_pct": None,
                         "note": "measured in only 1 view -> cannot cross-check"})
            continue
        lo, hi = min(vals.values()), max(vals.values())
        d = (hi - lo) / lo * 100.0 if lo > 0 else float("inf")
        rows.append({"name": name, "mm": {k: round(v, 2) for k, v in vals.items()},
                     "disagree_pct": round(d, 3)})
        if d > SHARED_TOL_PCT:
            bad.append("shared dimension \"%s\": the two views' conversions disagree by %.2f%% > %.1f%% (%s)"
                       % (name, d, SHARED_TOL_PCT,
                          "; ".join("%s=%.1fmm" % (k, v) for k, v in vals.items())))
    return rows, bad


def combine(fits):
    """Merge only when the three views are confirmed to have the same scale: inverse-variance weighting by sxx."""
    wsum = sum(f["sxx"] for f in fits.values())
    if wsum <= 0:
        raise ValueError("merge weight is 0")
    return sum(f["s"] * f["sxx"] for f in fits.values()) / wsum


def report(data):
    views = data.get("views") or {}
    if not views:
        raise ValueError("no views in the input")
    fits, bad = {}, []
    for name, v in views.items():
        f = fit_view(v.get("features") or [], v.get("image_width"))
        fits[name] = f
        if f["resid_pct"] > RESID_TOL_PCT:
            bad.append("%s in-view residual %.2f%% > %.1f%% (this view is non-linear inside: not an orthographic "
                       "projection, or a feature point was mismeasured)" % (name, f["resid_pct"], RESID_TOL_PCT))

    rows, shared_bad = shared_check(fits, data.get("shared"))
    bad += shared_bad

    is_same, spread = same_scale(fits)
    asserted = data.get("same_scale_asserted")

    L = ["=== Per-view least squares (px = cx + s*u) ===",
         "view     n  px_per_mm   mm_per_px  pp_offset_px  resid_px  resid%    span_mm"]
    for name in sorted(fits):
        f = fits[name]
        pp = "-" if f["pp_offset_px"] is None else ("%+.1f" % f["pp_offset_px"])
        L.append("%-8s %d  %9.6f  %9.4f  %12s  %8.3f  %6.3f%%  %8.1f"
                 % (name, f["n"], f["s"], 1.0 / f["s"], pp, f["resid_px"], f["resid_pct"], f["span_mm"]))
    L.append("")
    L.append("=== Consistency of the three px_per_mm (note: this is an **extra assumption**, not a corollary of orthographicity) ===")
    L.append("  px_per_mm per view: " + ", ".join("%s=%.6f" % (k, v["s"]) for k, v in sorted(fits.items())))
    L.append("  spread = %s" % ("-" if spread is None else "%.2f%%" % spread))
    if is_same:
        L.append("  -> the three px_per_mm differ by <= %.1f%%: they **may** be treated as the same output scale (e.g. one "
                 "engineering drawing / one orthographic render)" % SAME_SCALE_TOL_PCT)
    else:
        L.append("  -> the three px_per_mm differ by > %.1f%%: they **do not share one scale**. This is **not necessarily** perspective --"
                 % SAME_SCALE_TOL_PCT)
        L.append("     the three images can each have a different output scale / resolution / crop and still all be strictly orthographic (measured: parallax of all three views is 0px, "
                 "yet px_per_mm is 0.48 / 0.24 / 0.96, a 300% difference).")
        L.append("     Action: **calibrate each view separately and convert each separately**, then cross-check with the shared dimensions below -- do not force one joint scale onto the three views.")
    L.append("")
    if rows:
        L.append("=== Cross-view check (convert to millimetres before comparing; independent of output scale) ===")
        for r in rows:
            mm = r["mm"]
            L.append("  %-10s %s   disagreement %s"
                     % (r["name"], ", ".join("%s=%.1fmm" % (k, v) for k, v in sorted(mm.items())),
                        "-" if r["disagree_pct"] is None else "%.2f%%" % r["disagree_pct"]))
    else:
        L.append("=== Cross-view check: no `shared` given in the input ===")
        L.append("  Without a shared dimension only the in-view self-check is possible -- the three views **cannot** prove each other.")
        L.append("  Give at least one real dimension measurable in two views (such as overall height / overall length), otherwise the conclusion can only be unresolved.")
    L.append("")

    if bad:
        L.append("=== Conclusion: NOT PASSED (do not force a joint fit) ===")
        for b in bad:
            L.append("  x " + b)
        L.append("  Fall back to per-view calibration: each view fixes s only from **its own** ruler, and converts only dimensions at the same depth and in the same direction as that view's ruler.")
        L.append("  Dimensions across depth: the error is **not** a fixed +/-5%, it grows linearly with depth -- estimate it first with "
                 "err ~ dz/(D+dz) from section 0.6.1, and record unresolved if it cannot be estimated.")
    elif not asserted and not is_same:
        L.append("=== Conclusion: the three views are each orthographic and the shared dimensions agree, but there is no basis for a common scale ===")
        L.append("  You can convert per view; do **not** merge into one joint px_per_mm.")
        L.append("  If you are sure the three views come from one drawing / one render, add \"same_scale_asserted\": true to the input.")
    else:
        s = combine(fits)
        L.append("=== Conclusion: orthographicity passed (the three views can be solved jointly) ===")
        L.append("  Joint px_per_mm = %.6f (1 px = %.4f mm), inverse-variance weighted by each view's sxx" % (s, 1.0 / s))
        L.append("  Basis: the three px_per_mm differ by <=%.1f%% (same scale) **and** the shared dimensions differ by <=%.1f%%."
                 % (SAME_SCALE_TOL_PCT, SHARED_TOL_PCT))
        L.append("  Use: convert the pixel measurements of every view to millimetres uniformly and write them into spec.py, noting the source (image name + pixels + ruler).")
    return "\n".join(L)


# ------------------------------------------------------------------ selftest
def _synth(base_s=0.15, cx=960.0, width=1920, us=(0.0, 4600.0, 9830.0),
           view_k=None, in_view_drift=0.0, drift_view="front",
           shared_mm=2000.0, shared_px_override=None):
    """Synthesise calibration input.

    view_k      = {view name: the **overall output-scale factor** of that view}
    shared      = one real dimension measurable in two views (default 2000mm)
    shared_px_override = {view name: pixel value overriding this dimension in that view} (used to fake "mismeasured / inconsistent")
    """
    view_k = view_k or {}
    out = {"views": {}, "shared": []}
    for name in ("front", "side", "top"):
        k = float(view_k.get(name, 1.0))
        feats = []
        for i, u in enumerate(us):
            drift = 1.0 + (in_view_drift * (u / float(us[-1])) if name == drift_view else 0.0)
            feats.append({"name": "f%d" % i, "u_mm": u, "px": round(cx + base_s * k * drift * u)})
        out["views"][name] = {"image_width": width, "features": feats}
    # The shared dimension is measured once in each of the front / side views (each view draws it at its own output scale)
    meas = {}
    for name in ("front", "side"):
        k = float(view_k.get(name, 1.0))
        px = base_s * k * shared_mm
        if shared_px_override and name in shared_px_override:
            px = shared_px_override[name]
        meas[name] = {"px": round(px, 3)}
    out["shared"] = [{"name": "shared dimension", "measure": meas}]
    return out


def _selftest():
    cases = [
        ("A three views at the same scale (should pass and solve jointly)",
         _synth(view_k={"side": 1.004, "top": 0.997}), "joint"),

        ("B in-view perspective (front scale drifts 15% with u -> in-view residual red)",
         _synth(in_view_drift=0.15), "in-view residual"),

        ("C three views at different output scales but all orthographic (side 0.5x and its ruler shrinks with it)"
         " -> should be judged 'no shared scale, but per-view calibration is usable', and **no longer** misjudged as perspective",
         _synth(view_k={"side": 0.5, "top": 0.75}), "per view"),

        ("D different output scales + shared dimension disagrees by 6% (really inconsistent) -> cross-view check red",
         _synth(view_k={"side": 0.5, "top": 0.75},
                shared_px_override={"side": 0.5 * 0.15 * 2000.0 * 1.06}), "disagree"),
    ]
    got = {}
    for title, data, key in cases:
        r = report(data)
        print("######## " + title + " ########")
        print(r)
        print()
        got[title[0]] = (r, key)
    ok_a = "Joint px_per_mm" in got["A"][0]
    ok_b = ("in-view residual" in got["B"][0]) and ("NOT PASSED" in got["B"][0])
    # C: one of two acceptable phrasings, and it must **not** say "NOT PASSED"
    ok_c = (("calibrate each view separately" in got["C"][0]) or ("convert per view" in got["C"][0])) \
        and ("NOT PASSED" not in got["C"][0])
    ok_d = ("disagree" in got["D"][0]) and ("NOT PASSED" in got["D"][0])
    good = ok_a and ok_b and ok_c and ok_d
    print("SELFTEST %s  (A joint / B in-view residual red / C per-scale per-view usable / D cross-view check red)  "
          "A=%s B=%s C=%s D=%s" % ("PASS" if good else "FAIL", ok_a, ok_b, ok_c, ok_d))
    return 0 if good else 1


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    if len(argv) < 2:
        print(__doc__)
        return 2
    with open(argv[1], "r", encoding="utf-8") as fh:
        data = json.load(fh)
    print(report(data))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
```

How to run:

```bash
python3 multiview_calib.py calib.json     # print the report
python3 multiview_calib.py --selftest     # synthetic-data self-check: A joint / B in-view residual red / C per-scale per-view usable / D cross-view check red
```

## 4. Criteria (hard)

| Criterion | Threshold | Meaning | Handling |
|---|---|---|---|
| In-view residual | **> 2%** | The scale is inconsistent **inside** that view ⇒ there really is perspective / non-linearity, or a feature point was mismeasured | That view cannot be measured by scale |
| Shared-dimension disagreement (after conversion to mm) | **> 3%** | The two views give millimetre values for the **same real dimension** that do not match ⇒ the two views are incompatible (one view is not orthographic / the ruler was picked wrongly / the dimension was mismeasured) | Do not solve jointly; convert per view and mark `unresolved` |
| Spread of the three px_per_mm | **> 1%** | The three views **do not share one output scale** | **Not equal to perspective**: calibrate each view separately; merge only when you have another basis for "same scale" |
| Principal-point offset `cx − image width/2` | reference | Diagnostic only: wildly off ⇒ a problem with point picking or cropping (not the same as non-orthographic) | Re-check the picked points |

⚠ **A `s` spread over the limit ≠ a perspective verdict.** This is the most important correction of convention in this file:
the old wording read "the three px_per_mm are inconsistent" directly as "non-orthographic / perspective", so people doubted the picked points and recalibrated,
**when the real cause was that the three images are scaled differently**. The correct division of labour is:
**the in-view residual judges "is this image orthographic", the shared dimension judges "can the two views corroborate each other", and the `s` spread only judges "can they be merged into one scale".**

All green **and** `same_scale_asserted` (or `s` spread ≤1%) ⇒ take the **joint `px_per_mm`** inverse-variance weighted by `sxx`,
convert the three views uniformly to millimetres and write them into `spec.py` with the source (image name + pixel coordinates + ruler).

## 5. ★ The error across depth is **not** a fixed ±5%

The old wording relaxed the tolerance for "dimensions across depth" to a flat **±5%**. That is unfounded: under perspective the scale changes with depth as `1/z`:

```text
err ≈ Δz / (D + Δz)            # D = distance from camera to the near ruler, Δz = depth difference between the two points
```

**Measured (this machine, Blender 5.2.2, measured directly with `world_to_camera_view`, D = 8 m)**:

| Depth difference Δz | Measured px_per_mm | Scale error relative to near | Analytic Δz/(D+Δz) |
|---|---|---|---|
| 0 m | 0.295139 | 0.00% | 0.00% |
| 0.25 m | 0.286195 | **−3.03%** | −3.03% |
| 0.5 m | 0.277778 | **−5.88%** | −5.88% |
| 1.0 m | 0.262346 | **−11.11%** | −11.11% |
| 2.0 m | 0.236111 | **−20.00%** | −20.00% |
| 3.0 m | 0.214646 | **−27.27%** | −27.27% |

⇒ With the camera at 8 m, **spanning only 0.5 m of depth already exceeds ±5%**; spanning 3 m the error is **−27.3%**.
The analytic formula agrees with the measurement row by row to two decimal places and can be used directly as a formula.

**Discipline**:

1. For a measurement across depth, **compute** `Δz/(D+Δz)` first and use it as the error bound of that measurement (not ±5%);
2. If `D` or `Δz` cannot be estimated ⇒ record that dimension as **`unresolved`**; do not casually write "±5% should be enough";
3. To really measure by scale ⇒ put the measured feature at the **same depth** as the ruler, or do a **real camera calibration** of the reference image (intrinsics + extrinsics);
4. Homography rectification (`img_rectify`) only solves **one plane**, see §6.

## 6. ★ A homography (`img_rectify`) only rectifies "the plane the points were picked on"

A four-point homography holds strictly for points that lie **exactly on the physical plane the points were picked on**; for points off that plane the **error grows rapidly with depth**.

**Measured (this machine, Blender 5.2.2; fit the homography on 4 corner points in the z=0 plane, then use it to map other points of the same object)**:

| Distance of the point from the z=0 plane | Maximum error | Converted at this camera (1 m ≈ 190 px) |
|---|---|---|
| 0 m | **0.000 px** | 0 mm |
| 0.05 m | 9.906 px | **52 mm** |
| 0.20 m | 40.194 px | **211 mm** |
| 0.50 m | 103.464 px | **543 mm** |

**Discipline**:

1. **A planar reference** (a re-photographed drawing, a calibration board, a flat sticker, a calibration frame laid flat on the floor) ⇒ the homography is entirely correct, use it with confidence;
2. **A solid object** (car / person / building) ⇒ the homography only guarantees that **that plane** (for example the plane of the overall outline of the car's side) is right;
   the farther a body feature is from this plane (flared wheel arches, fender curvature, A-pillar rake), the larger the error;
3. So the four points must be a **real rectangle on one plane**, and **measure only features close to that plane**;
4. To get the whole solid object right ⇒ use a real camera calibration (intrinsics + extrinsics) or multi-view geometry, **not** a homography;
5. Strongly oblique views amplify picking errors (this is how the 543 mm in §6.3 arose): first look at the outline clearly with `img_scan`, then pick points.

## 7. Self-proof: how to know the calibration is right

- **When ground truth exists**: for an image you rendered yourself with an orthographic camera, `px_per_mm = render width in px / ortho_scale_mm`
  (`bpy.context.scene.camera.data.ortho_scale`): check the value the script gives against it, with a target error of **≤1%**.
  ★ Note this holds only under **the same orthographic setting**; change `ortho_scale` or the resolution and `px_per_mm` changes (the table measured in §0).
- **When there is no ground truth**: keep one known dimension **out of** the fit and use it as a blind test; a blind-test deviation >2% means this image cannot be measured by scale.
- **Cross-view self-proof**: give a shared dimension (item 3 of §2) and see whether the millimetre values converted from the two views agree within ≤3%.

## 8. How to verify (one sentence)

The four synthetic cases of `--selftest` give **A joint / B in-view residual red / C per-scale per-view usable / D cross-view check red**
(last line `SELFTEST PASS`); on real images: if the three orthographic views have the same scale, the joint scale agrees with the render ground truth to ≤1%,
and if the three views are scaled differently the script reports "no shared scale, per-view calibration usable" and does **not** misjudge perspective.
