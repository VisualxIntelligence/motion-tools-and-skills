#!/usr/bin/env python3
"""Depth from one photo, step 1 of photo-parallax.

    python depth.py photo.jpg out/ [--model da2-small]                      # Apache-2.0, any use
    python depth.py photo.jpg out/ --model depthpro2-s --research-only      # Apple research licence
    python depth.py photo.jpg out/ --import da3.png --source "DA3MONO-Large (Apache-2.0)"   # made elsewhere

Writes to out/:
  depth.npy        float32 depth per pixel: metres for Depth Pro 2, relative for Depth Anything
  nearness16.png   16-bit grey, white = near, black = far (1st-99.5th percentile range)
  depth_preview.png  8-bit version for eyes
  depth.json       model, licence, whether commercial use is allowed, kind of depth, focal length

Models:
  da2-small        Depth Anything V2 Small (Apache-2.0): relative depth, fast on CPU, fine for parallax.
  depthpro2-s|b|l|h  Apple Depth Pro 2 (Nov 2026): metric depth in metres, sharp edges, focal length.
                   Its weights are licensed for non-commercial research only, so the script refuses
                   to run them without --research-only. Install: pip install git+https://github.com/apple-aiml-research/ml-depth-pro-2
  --import FILE    a depth map from another tool, e.g. ComfyUI's Depth Anything 3 nodes: a greyscale image
                   (8 or 16 bit, white = near; --far-is-white if inverted) or a .npy of metres (--metric).
                   Name the model and its licence with --source; add --commercial only if that licence allows it.
For client or broadcast work use da2-small, or another commercially licensed model (see tools/depth-anything/).
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageOps

MODELS = {
    "da2-small": {"licence": "Apache-2.0", "commercial": True, "kind": "relative-inverse"},
    **{f"depthpro2-{s}": {"licence": "Apple ML Research Model licence (research only)", "commercial": False, "kind": "metric"}
       for s in "sblh"},
}


def run_da2(img: Image.Image):
    from transformers import pipeline
    pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
    out = pipe(img)
    inv = out["predicted_depth"].squeeze().float().numpy()          # bigger = nearer, arbitrary scale
    inv = np.array(Image.fromarray(inv).resize(img.size, Image.BICUBIC))
    return inv, None


def run_depthpro2(path: str, size: str):
    import torch
    from depth_pro_2 import create_model_and_transforms, load_rgb
    model, transform = create_model_and_transforms(f"depthpro2-{size}")
    image, f_px = load_rgb(path)
    with torch.no_grad():
        pred = model.infer(transform(image), f_px=f_px)
    depth = pred["depth"].squeeze().float().cpu().numpy()
    f = pred.get("focallength_px", f_px)
    return depth, float(f) if f is not None else None


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("image")
    ap.add_argument("outdir")
    ap.add_argument("--model", default="da2-small", choices=sorted(MODELS))
    ap.add_argument("--import", dest="imp", metavar="FILE", help="use a depth map made elsewhere instead of running a model")
    ap.add_argument("--source", default="unknown", help="with --import: the model that made it and its licence")
    ap.add_argument("--commercial", action="store_true", help="with --import: that model's licence allows commercial use")
    ap.add_argument("--metric", action="store_true", help="with --import: a .npy of depth in metres")
    ap.add_argument("--far-is-white", action="store_true", help="with --import: the image is white = far")
    ap.add_argument("--focal-px", type=float, help="focal length in pixels, if known (EXIF or the depth tool)")
    ap.add_argument("--research-only", action="store_true",
                    help="confirm this is non-commercial research (required for Depth Pro 2 weights)")
    a = ap.parse_args(argv)
    info = MODELS[a.model] if not a.imp else {"licence": a.source, "commercial": a.commercial,
                                               "kind": "metric" if a.metric else "relative-inverse"}
    if not info["commercial"] and not a.research_only and not a.imp:
        ap.error(f"{a.model} weights are research-only ({info['licence']}). Pass --research-only to confirm "
                 "this is non-commercial research, or use --model da2-small for client work.")
    out = pathlib.Path(a.outdir)
    out.mkdir(parents=True, exist_ok=True)
    img = ImageOps.exif_transpose(Image.open(a.image)).convert("RGB")

    if a.imp:
        f_px = a.focal_px
        if a.metric:
            depth = np.load(a.imp).astype(np.float32)
            depth = np.array(Image.fromarray(depth).resize(img.size, Image.BILINEAR))
            near = 1.0 / np.maximum(depth, 1e-3)
        else:
            g = np.array(Image.open(a.imp)).astype(np.float32)
            g = g[..., 0] if g.ndim == 3 else g
            g = np.array(Image.fromarray(g).resize(img.size, Image.BICUBIC))
            near = g.max() - g if a.far_is_white else g
            depth = 1.0 / np.maximum(near - near.min() + 1e-3 * (near.max() - near.min()), 1e-6)
    elif a.model == "da2-small":
        inv, f_px = run_da2(img)
        depth = 1.0 / np.maximum(inv - inv.min() + 1e-3 * (inv.max() - inv.min()), 1e-6)   # relative only
        near = inv
    else:
        depth, f_px = run_depthpro2(a.image, a.model.split("-")[1])
        f_px = a.focal_px or f_px
        depth = np.where(np.isfinite(depth), depth, np.nan)
        depth = np.nan_to_num(depth, nan=np.nanmax(depth))
        near = 1.0 / np.maximum(depth, 1e-3)

    lo, hi = np.percentile(near, [1, 99.5])
    n = np.clip((near - lo) / max(hi - lo, 1e-9), 0, 1)
    np.save(out / "depth.npy", depth.astype(np.float32))
    Image.fromarray((n * 65535).astype(np.uint16)).save(out / "nearness16.png")
    Image.fromarray((n * 255).astype(np.uint8)).save(out / "depth_preview.png")
    meta = {
        "image": a.image, "size": list(img.size), "model": f"import:{a.imp}" if a.imp else a.model, "licence": info["licence"],
        "commercial_use": info["commercial"], "kind": info["kind"], "focal_px": f_px,
        "depth_range": [float(np.percentile(depth, 1)), float(np.percentile(depth, 99))],
        "units": "metres" if info["kind"] == "metric" else "relative",
    }
    (out / "depth.json").write_text(json.dumps(meta, indent=2))
    print(json.dumps(meta, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
