#!/usr/bin/env python3
"""Split one photo into depth layers for a parallax move, step 3 of photo-parallax.

    python layers.py photo.jpg depth/ out/ [--segments seg/] [--cards 2] [--grid 320]

Inputs: the photo, the output folder of depth.py, and optionally the output of segment.py.
Writes to out/:
  plate.png        the whole photo; its holes (where cards were cut out) are marked in hole_mask.png
  hole_mask.png    white where fill.py must paint in what was behind the cards
  card<k>.png      RGBA cut-outs of the nearer parts of the scene, cropped to their box
  *.f32            depth per mesh vertex (float32, little-endian, row-major) for each layer
  layers.json      sizes, focal length, depth range, boxes and labels per layer; read by the page

How layers are chosen:
  - Sky and ground (road, floor, grass, water...) always stay on the plate. The plate is a mesh
    displaced by depth, so a receding street stays continuous instead of breaking into slabs.
  - Everything else is banded by depth (multi-Otsu on log depth). The band that covers the most of
    the picture is the background and stays on the plate; the bands in front of it become cards.
  - Objects ("things": person, car, tree, sign...) move as one piece: a whole object goes to the
    band of its median depth, so its outline is clean. Large regions ("stuff": building, stairs,
    wall...) are split where their depth jumps, because a fountain in front of a facade is often
    labelled as part of the "building".
  - Without --segments, bands come from depth alone.
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage as ndi

SKY = {"sky"}
GROUND = {"road", "floor", "grass", "earth", "field", "sand", "water", "sea", "river", "path", "sidewalk",
          "runway", "dirt track", "land", "snow", "rug", "carpet", "ground", "pavement", "playingfield",
          "floor-wood", "floor-other-merged", "road", "pavement-merged", "grass-merged", "dirt-merged",
          "sand", "water-other", "sea", "river", "snow"}
STUFF = {"building", "wall", "stairs", "stairway", "house", "skyscraper", "fence", "railing", "column",
         "ceiling", "mountain", "hill", "rock", "bridge", "tower", "awning", "step", "wall-other-merged",
         "building-other-merged", "fence-merged", "rock-merged", "mountain-merged", "ceiling-merged"}


def grid_depth(z, w_img, h_img, gw):
    """Depth sampled at the mesh vertices: gw columns, rows to keep pixels square."""
    gh = max(2, int(round(gw * h_img / w_img)))
    zi = np.array(Image.fromarray(z.astype(np.float32)).resize((gw, gh), Image.BOX))   # BOX: no aliased spikes at edges
    return zi.astype("<f4"), gw, gh


def ground_plane(Z, f_px, tol=0.03, iters=400, seed=0):
    """Pixels on the dominant plane of the lower half (a floor, street or lawn), by RANSAC.

    Used when there are no segments, so the ground is not sliced into cards that would tear."""
    H, W = Z.shape
    ys, xs = np.mgrid[0:H, 0:W]
    P = np.dstack([(xs - W / 2) * Z / f_px, (ys - H / 2) * Z / f_px, Z])
    rng = np.random.default_rng(seed)
    sub = P[H // 2::4, ::4].reshape(-1, 3)
    best, best_n = None, 0
    for _ in range(iters):
        a, b, c = sub[rng.choice(len(sub), 3, replace=False)]
        n = np.cross(b - a, c - a)
        if np.linalg.norm(n) < 1e-9:
            continue
        n = n / np.linalg.norm(n)
        if abs(n[1]) < 0.6:                      # floors face up: the normal is mostly along the image's y axis
            continue
        cnt = int((np.abs((sub - a) @ n) < tol * sub[:, 2]).sum())
        if cnt > best_n:
            best, best_n = (a, n), cnt
    if best is None:
        return np.zeros_like(Z, bool)
    a, n = best
    g = np.abs((P - a) @ n) < tol * Z
    lab_cc, k = ndi.label(g)                      # keep only plane pieces that touch the bottom edge
    keep = np.setdiff1d(np.unique(lab_cc[-1]), [0])
    return ndi.binary_closing(np.isin(lab_cc, keep), iterations=3)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("image")
    ap.add_argument("depthdir")
    ap.add_argument("outdir")
    ap.add_argument("--segments", help="output folder of segment.py")
    ap.add_argument("--cards", type=int, default=2, help="number of foreground card layers (1-4)")
    ap.add_argument("--grow", type=int, default=3, help="pixels each card extends past its edge")
    ap.add_argument("--feather", type=float, default=1.5, help="card edge softness in pixels")
    ap.add_argument("--hole-grow", type=int, default=14, help="pixels the plate's hole extends past each card")
    ap.add_argument("--min-area", type=float, default=0.0004, help="drop card pieces smaller than this share")
    ap.add_argument("--far", type=float, default=300.0, help="metric depth clip in metres (sky and far haze)")
    ap.add_argument("--grid", type=int, default=320, help="mesh columns for the plate")
    ap.add_argument("--hfov", type=float, default=60.0, help="horizontal field of view if the focal length is unknown")
    ap.add_argument("--no-ground", action="store_true", help="without --segments, skip the ground-plane fit")
    a = ap.parse_args(argv)
    out = pathlib.Path(a.outdir)
    out.mkdir(parents=True, exist_ok=True)
    dd = pathlib.Path(a.depthdir)
    meta = json.loads((dd / "depth.json").read_text())
    img = ImageOps.exif_transpose(Image.open(a.image)).convert("RGB")
    W, H = img.size
    rgb = np.array(img)
    near = np.array(Image.open(dd / "nearness16.png")).astype(np.float32) / 65535.0

    # Scene depth Z (metres, or pseudo-metres between 2 and 60 for relative models)
    if meta["kind"] == "metric":
        Z = np.clip(np.load(dd / "depth.npy"), 0.3, a.far)
    else:
        zn, zf = 2.0, 60.0
        Z = 1.0 / (near * (1 / zn - 1 / zf) + 1 / zf)
    f_px = meta.get("focal_px") or (W / 2) / np.tan(np.radians(a.hfov) / 2)

    seg, labels = None, {}
    if a.segments:
        sd = pathlib.Path(a.segments)
        seg = np.array(Image.open(sd / "segments.png")).astype(np.int32)
        labels = {s["id"]: s["label"] for s in json.loads((sd / "segments.json").read_text())["segments"]}
    lab = lambda i: labels.get(int(i), "")
    if seg is not None:
        # the segmenter's "sky" minus anything the depth model puts nearby (finials, wires, birds)
        sky_seg = np.isin(seg, [i for i, l in labels.items() if l in SKY])
        sky = sky_seg & (near < 0.05)
        # ...but near things that float free inside the sky (birds, a kite) stay sky: as mesh spikes they streak
        lab_cc, n = ndi.label(sky_seg & ~sky)
        if n:
            touch = np.unique(lab_cc[ndi.binary_dilation(~sky_seg, iterations=2) & (lab_cc > 0)])
            sky |= (lab_cc > 0) & ~np.isin(lab_cc, touch)
        ground = np.isin(seg, [i for i, l in labels.items() if l in GROUND])
    else:
        sky = near < 0.02
        ground = ground_plane(Z, f_px) if not a.no_ground else np.zeros_like(sky)
    if sky.any() and (~sky).any():               # sky: one far distance behind everything else
        Z[sky] = np.percentile(Z[~sky], 99) * 1.5

    # Depth bands among the pixels that can become cards
    from skimage.filters import threshold_multiotsu
    cand = ~(sky | ground)
    logz = np.log(Z)
    k = max(1, min(4, a.cards))
    th = np.sort(threshold_multiotsu(logz[cand], classes=k + 1)) if cand.sum() > 1000 else np.array([])
    band = np.digitize(logz, th)                       # 0 = nearest ... k = farthest (stays on the plate)
    if seg is not None:
        for i, l in labels.items():
            m = seg == i
            if l in SKY or l in GROUND or not m.any():
                continue
            if l not in STUFF:                          # whole objects keep one band
                band[m] = np.digitize(np.median(logz[m]), th)
    band[~cand] = k
    # The band covering most of the non-sky, non-ground picture is the background (usually facades,
    # a treeline, a room's back wall): it and everything behind it stay on the plate.
    areas = [int((cand & (band == b)).sum()) for b in range(k + 1)]
    bg = int(np.argmax(areas))
    band[band > bg] = bg

    cards, holes = [], np.zeros((H, W), bool)
    for b in range(bg):                                 # b = 0 is the nearest
        m = band == b
        m = ndi.binary_opening(m, iterations=2 if seg is not None else 6)   # depth-only: drop thin slivers
        lab_cc, n = ndi.label(m)
        if n:
            sizes = ndi.sum(m, lab_cc, range(1, n + 1)) / m.size
            keep = np.isin(lab_cc, 1 + np.flatnonzero(sizes >= a.min_area))
            m = keep
        if m.sum() / m.size < a.min_area:
            continue
        holes |= ndi.binary_dilation(m, iterations=a.hole_grow)
        grown = ndi.binary_dilation(m, iterations=a.grow)
        alpha = ndi.gaussian_filter(grown.astype(np.float32), a.feather) if a.feather > 0 else grown.astype(np.float32)
        alpha = np.clip(alpha * 1.6 - 0.3, 0, 1) * grown + 0 * alpha
        ys, xs = np.where(grown)
        x0, x1 = max(0, xs.min() - 2), min(W, xs.max() + 3)
        y0, y1 = max(0, ys.min() - 2), min(H, ys.max() + 3)
        # depth beyond the card's own pixels = the nearest card pixel's depth (no smearing into the background)
        idx = ndi.distance_transform_edt(~m, return_distances=False, return_indices=True)
        zc = Z[idx[0], idx[1]]
        crop = np.dstack([rgb, (alpha * 255).astype(np.uint8)])[y0:y1, x0:x1]
        name = f"card{len(cards) + 1}"
        Image.fromarray(crop, "RGBA").save(out / f"{name}.png")
        gw = max(8, int(round(a.grid * (x1 - x0) / W)))
        zg, gw, gh = grid_depth(zc[y0:y1, x0:x1], x1 - x0, y1 - y0, gw)
        zg.tofile(out / f"{name}.f32")
        found = sorted({lab(i) for i in np.unique(seg[m])} - {""}) if seg is not None else []
        cards.append({"name": name, "file": f"{name}.png", "depth": f"{name}.f32", "box": [int(x0), int(y0), int(x1), int(y1)],
                      "grid": [gw, gh], "median_z": round(float(np.median(Z[m])), 3), "area": round(float(m.mean()), 4),
                      "centre": [round(float(np.mean(np.nonzero(m)[1])), 1), round(float(np.mean(np.nonzero(m)[0])), 1)],
                      "labels": found})

    # Plate: whole photo; depth under the holes filled from around them so the mesh stays smooth
    Image.fromarray(rgb).save(out / "plate.png")
    Image.fromarray((holes * 255).astype(np.uint8)).save(out / "hole_mask.png")
    zp = Z.copy()
    if holes.any():
        inner = ~holes
        # fill hole depth by the farther of nearest-surround values, so filled background sits behind the cards
        idx = ndi.distance_transform_edt(holes, return_distances=False, return_indices=True)
        zfill = Z[idx[0], idx[1]]
        zp[holes] = np.maximum(zfill[holes], ndi.grey_dilation(np.where(inner, Z, 0), size=(31, 31))[holes])
        zp = np.where(holes, ndi.gaussian_filter(zp, 6), zp)
    zg, gw, gh = grid_depth(zp, W, H, a.grid)
    zg.tofile(out / "plate.f32")
    layout = {
        "image": a.image, "size": [W, H], "focal_px": round(float(f_px), 2), "depth_kind": meta["kind"],
        "depth_model": meta["model"], "commercial_use": meta.get("commercial_use"),
        "z_range": [round(float(Z.min()), 3), round(float(Z.max()), 3)],
        "plate": {"file": "plate.png", "filled": "plate_filled.png", "depth": "plate.f32", "grid": [gw, gh],
                  "median_z": round(float(np.median(Z[~sky])), 3)},
        "cards": sorted(cards, key=lambda c: -c["median_z"]),
        "hole_share": round(float(holes.mean()), 4),
        "thresholds_z": [round(float(np.exp(t)), 3) for t in th],
    }
    (out / "layers.json").write_text(json.dumps(layout, indent=2))
    print(json.dumps({k2: layout[k2] for k2 in ("size", "focal_px", "depth_kind", "z_range", "thresholds_z", "hole_share")}
                     | {"cards": [(c["name"], c["median_z"], c["area"], c["labels"]) for c in layout["cards"]]}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
