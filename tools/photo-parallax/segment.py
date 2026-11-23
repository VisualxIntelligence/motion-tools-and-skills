#!/usr/bin/env python3
"""Panoptic segmentation of one photo, step 2 of photo-parallax.

    python segment.py photo.jpg out/ [--model facebook/mask2former-swin-large-ade-panoptic]

Splits the photo into whole objects and regions (person, car, tree, building, sky, floor, road,
fountain...), so that parallax layers can follow object outlines instead of depth slices.
Writes out/segments.png (uint16 segment id per pixel, 0 = none) and out/segments.json
(id, label, score, area share).

Models (Hugging Face, Mask2Former via transformers):
  facebook/mask2former-swin-large-ade-panoptic   150 ADE20K classes, good for streets and interiors.
  facebook/mask2former-swin-large-coco-panoptic  133 COCO classes.
  Both are listed under an "other" licence and trained on datasets with their own terms: ADE20K
  is for non-commercial research and education. Clear them before client work, or skip this step
  (without --segments, layers.py slices by depth alone).
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageOps


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("image")
    ap.add_argument("outdir")
    ap.add_argument("--model", default="facebook/mask2former-swin-large-ade-panoptic")
    ap.add_argument("--threshold", type=float, default=0.6, help="drop segments scored below this")
    a = ap.parse_args(argv)
    import torch
    from transformers import AutoImageProcessor, Mask2FormerForUniversalSegmentation

    out = pathlib.Path(a.outdir)
    out.mkdir(parents=True, exist_ok=True)
    img = ImageOps.exif_transpose(Image.open(a.image)).convert("RGB")
    proc = AutoImageProcessor.from_pretrained(a.model)
    model = Mask2FormerForUniversalSegmentation.from_pretrained(a.model).eval()
    with torch.no_grad():
        outputs = model(**proc(images=img, return_tensors="pt"))
    res = proc.post_process_panoptic_segmentation(outputs, threshold=a.threshold, label_ids_to_fuse=set(),
                                                  target_sizes=[img.size[::-1]])[0]
    seg = res["segmentation"].cpu().numpy().astype(np.int32)
    seg[seg < 0] = 0
    total = seg.size
    segments = []
    for s in res["segments_info"]:
        area = float((seg == s["id"]).sum()) / total
        if area == 0:
            continue
        segments.append({"id": int(s["id"]), "label": model.config.id2label[s["label_id"]],
                         "score": round(float(s["score"]), 3), "area": round(area, 5)})
    Image.fromarray(seg.astype(np.uint16)).save(out / "segments.png")
    meta = {"image": a.image, "model": a.model, "segments": sorted(segments, key=lambda s: -s["area"])}
    (out / "segments.json").write_text(json.dumps(meta, indent=2))
    print(json.dumps({"model": a.model, "count": len(segments),
                      "top": [f"{s['label']} {s['area']:.1%}" for s in meta["segments"][:12]]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
