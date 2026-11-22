#!/usr/bin/env python3
"""Worked example: a parametric hard-surface prop in build123d, exported for motion work.

    python prop_build123d.py outdir [--size 400] [--wall 18] [--fillet 6]

Builds a shipping crate (in millimetres): a filleted shell, recessed side panels cut with
booleans, two hand-hold slots and a separate lid as its own part. Writes
  crate.step  exact B-rep, for CAD or Blender's STEP importers
  crate.glb   tessellated, in metres, lid and body as separate named parts for animation
  crate.stl   one watertight solid, for checks or printing
and prints a JSON report (volume, bounding box, triangle counts).

Why code-CAD for props: exact dimensions, clean booleans and true fillets every time, and
a change of one number (size, wall, fillet) rebuilds the whole prop. The same pattern
suits screens, devices, packaging, studio furniture and other objects with hard edges.
Needs: pip install build123d trimesh  (Apache-2.0, MIT). Python 3.11–3.14.
"""
import argparse
import json
import pathlib
import sys

from build123d import (Axis, Box, BuildPart, BuildSketch, Compound, Locations, Mode, Plane,
                       SlotOverall, Unit, export_gltf, export_step, export_stl, extrude,
                       fillet)


def crate(size: float, wall: float, r: float):
    h = size * 0.75
    with BuildPart() as body:
        Box(size, size, h)
        fillet(body.edges(), radius=r)
        # Hollow it out from the top: a box cut leaves the walls and the floor.
        with Locations((0, 0, wall / 2)):
            Box(size - 2 * wall, size - 2 * wall, h - wall + 0.01, mode=Mode.SUBTRACT)
        # Recessed panels on all four sides: thin boxes cut into each outer face.
        d = wall * 0.3
        for x, y, dims in ((size / 2, 0, (2 * d, size * 0.7, h * 0.6)),
                           (-size / 2, 0, (2 * d, size * 0.7, h * 0.6)),
                           (0, size / 2, (size * 0.7, 2 * d, h * 0.6)),
                           (0, -size / 2, (size * 0.7, 2 * d, h * 0.6))):
            with Locations((x, y, 0)):
                Box(*dims, mode=Mode.SUBTRACT)
        # Hand-hold slots through two opposite walls (X+ and X-).
        for sign in (1, -1):
            with BuildPart(mode=Mode.PRIVATE) as cutter:
                with BuildSketch(Plane.YZ.offset(sign * (size / 2 + 1))):
                    with Locations((0, h * 0.15)):
                        SlotOverall(size * 0.3, wall * 1.6)
                extrude(amount=-(wall * 2 + 2) * sign)
            body.part = body.part - cutter.part
    with BuildPart() as lid:
        with Locations((0, 0, h / 2 + wall / 2 + 2)):
            Box(size, size, wall)
        fillet(lid.edges().filter_by(Axis.Z, reverse=True), radius=min(r, wall / 3))
    body.part.label = "crate_body"
    lid.part.label = "crate_lid"
    return body.part, lid.part


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("outdir")
    p.add_argument("--size", type=float, default=400.0, help="width and depth in mm")
    p.add_argument("--wall", type=float, default=18.0, help="wall thickness in mm")
    p.add_argument("--fillet", type=float, default=6.0, help="outer edge radius in mm")
    a = p.parse_args(argv)
    out = pathlib.Path(a.outdir)
    out.mkdir(parents=True, exist_ok=True)

    body, lid = crate(a.size, a.wall, a.fillet)
    assembly = Compound(label="crate", children=[body, lid])
    export_step(assembly, str(out / "crate.step"))
    export_gltf(assembly, str(out / "crate.glb"), unit=Unit.MM, binary=True,
                linear_deflection=0.1, angular_deflection=0.2)
    export_stl(body, str(out / "crate.stl"))

    import trimesh
    scene = trimesh.load(out / "crate.glb")
    bb = body.bounding_box()
    report = {
        "valid": bool(body.is_valid and lid.is_valid),
        "body_volume_cm3": round(body.volume / 1000, 1),
        "bbox_mm": [round(bb.size.X, 1), round(bb.size.Y, 1), round(bb.size.Z, 1)],
        "glb_parts": sorted(scene.geometry.keys()),
        "glb_triangles": int(sum(len(g.faces) for g in scene.geometry.values())),
        "glb_extent_m": [round(float(x), 3) for x in scene.extents],
        "files": sorted(f.name for f in out.iterdir()),
    }
    print(json.dumps(report, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
