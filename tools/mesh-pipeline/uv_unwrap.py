#!/usr/bin/env python3
"""Automatic UV unwrap and pack with xatlas, outside Blender.

    python uv_unwrap.py in.glb out.glb [--resolution 2048] [--padding 4] [--report r.json]

Reads anything trimesh reads (GLB/glTF, OBJ, PLY, STL; a multi-mesh scene is merged into
one mesh), unwraps it into charts, packs them into one atlas and writes the mesh with the
new UVs (GLB or OBJ). xatlas splits vertices along chart seams, so the output has more
vertices than the input; faces are unchanged. The report gives chart count, atlas size and
how much of the atlas the charts fill. UVs are always normalised to 0-1; xatlas treats
--resolution as a target, so the atlas it reports can come out somewhat larger or smaller
(padding is in those pixels).

Use it for AI-generated or scanned meshes that arrive without usable UVs, before baking
or painting (Material Maker, ArmorPaint, Blender). For hand-placed seams, unwrap in Blender.
Needs: pip install xatlas trimesh numpy  (all MIT).
"""
import argparse
import json
import sys

import numpy as np
import trimesh
import xatlas


def load_mesh(path: str) -> trimesh.Trimesh:
    obj = trimesh.load(path, force="mesh", process=False)
    if not isinstance(obj, trimesh.Trimesh) or len(obj.faces) == 0:
        raise SystemExit(f"no triangle mesh found in {path}")
    return obj


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--resolution", type=int, default=2048, help="target atlas size in pixels")
    p.add_argument("--padding", type=int, default=4, help="pixels between charts")
    p.add_argument("--report", help="also write the JSON report here")
    a = p.parse_args(argv)

    mesh = load_mesh(a.input)
    atlas = xatlas.Atlas()
    atlas.add_mesh(np.asarray(mesh.vertices, dtype=np.float32), np.asarray(mesh.faces, dtype=np.uint32))
    pack = xatlas.PackOptions()
    pack.resolution = a.resolution
    pack.padding = a.padding
    atlas.generate(pack_options=pack)
    vmapping, indices, uvs = atlas[0]

    out = trimesh.Trimesh(vertices=mesh.vertices[vmapping], faces=indices, process=False)
    out.visual = trimesh.visual.TextureVisuals(uv=uvs)
    out.export(a.output)

    report = {
        "input": a.input,
        "output": a.output,
        "faces": int(len(indices)),
        "vertices_before": int(len(mesh.vertices)),
        "vertices_after": int(len(vmapping)),
        "charts": int(atlas.chart_count),
        "atlas_px": [int(atlas.width), int(atlas.height)],
        "utilization": round(float(np.mean(atlas.utilization)), 3),
        "uv_in_0_1": bool(uvs.min() >= 0 and uvs.max() <= 1),
    }
    text = json.dumps(report, indent=2)
    print(text)
    if a.report:
        with open(a.report, "w") as f:
            f.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
