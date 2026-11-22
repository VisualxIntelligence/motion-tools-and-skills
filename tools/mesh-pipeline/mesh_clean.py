#!/usr/bin/env python3
"""Clean and repair a generated or scanned mesh with PyMeshLab, outside Blender.

    python mesh_clean.py in.obj out.obj [--min-part 0.02] [--hole 30] [--faces 50000] [--report r.json]

Steps, in order: merge close vertices, drop duplicate / zero-area / unreferenced
geometry, repair non-manifold edges and vertices, remove floating parts smaller than
--min-part of the model's diagonal, close holes up to --hole edges, optionally decimate
to --faces (quadric edge collapse, keeps UVs if present), re-orient faces and recompute
normals. Prints a JSON report of the mesh before and after (and writes it to --report).

Inputs and outputs: OBJ, PLY, STL, OFF (and glTF/GLB input where your PyMeshLab build
reads it). For a GLB in and out, convert with trimesh or Blender around this step.
Needs: pip install pymeshlab  (GPL-3.0; this script is MIT and does not include it).
On Linux also the system OpenGL library (Ubuntu/Debian: apt install libopengl0), or every
filter and file format fails to load ("Unknown format for load: obj").
"""
import argparse
import json
import sys

import pymeshlab as ml


def stats(ms: ml.MeshSet) -> dict:
    m = ms.current_mesh()
    topo = ms.get_topological_measures()
    return {
        "vertices": m.vertex_number(),
        "faces": m.face_number(),
        "components": topo.get("connected_components_number"),
        "boundary_edges": topo.get("boundary_edges"),
        "non_manifold_edges": topo.get("non_two_manifold_edges"),
        "non_manifold_vertices": topo.get("non_two_manifold_vertices"),
        # MeshLab only counts holes on a two-manifold mesh; it reports -1 otherwise.
        "holes": topo.get("number_holes") if (topo.get("number_holes") or 0) >= 0 else None,
        "watertight": topo.get("boundary_edges") == 0 and topo.get("non_two_manifold_edges") == 0,
        "bbox_diagonal": round(m.bounding_box().diagonal(), 6),
    }


def call(ms, name, **kw):
    """Run a filter; skip quietly if this PyMeshLab version lacks it or it does not apply."""
    try:
        getattr(ms, name)(**kw)
        return True
    except (AttributeError, ml.PyMeshLabException) as e:
        print(f"skip {name}: {str(e).splitlines()[0] if str(e) else type(e).__name__}", file=sys.stderr)
        return False


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--min-part", type=float, default=0.02,
                   help="remove parts smaller than this fraction of the bbox diagonal (0 = keep all)")
    p.add_argument("--hole", type=int, default=30, help="close holes up to this many edges (0 = leave holes)")
    p.add_argument("--faces", type=int, default=0, help="decimate to this many faces (0 = no decimation)")
    p.add_argument("--report", help="also write the JSON report here")
    a = p.parse_args(argv)

    ms = ml.MeshSet()
    ms.load_new_mesh(a.input)
    before = stats(ms)

    call(ms, "meshing_merge_close_vertices", threshold=ml.PercentageValue(0.001))
    call(ms, "meshing_remove_duplicate_faces")
    call(ms, "meshing_remove_duplicate_vertices")
    call(ms, "meshing_remove_null_faces")
    call(ms, "meshing_remove_unreferenced_vertices")
    call(ms, "meshing_repair_non_manifold_edges", method=0)
    call(ms, "meshing_repair_non_manifold_vertices")
    if a.min_part > 0:
        call(ms, "meshing_remove_connected_component_by_diameter",
             mincomponentdiag=ml.PercentageValue(a.min_part * 100))
    if a.hole > 0:
        call(ms, "meshing_close_holes", maxholesize=a.hole)
        # Hole closing selects the new faces, and a selection silently limits later filters
        # (decimation then does nothing), so clear it.
        call(ms, "set_selection_none")
    if a.faces and ms.current_mesh().face_number() > a.faces:
        has_uv = ms.current_mesh().has_wedge_tex_coord()
        if has_uv:
            call(ms, "meshing_decimation_quadric_edge_collapse_with_texture",
                 targetfacenum=a.faces, preserveboundary=True)
        else:
            call(ms, "meshing_decimation_quadric_edge_collapse",
                 targetfacenum=a.faces, preserveboundary=True, preservenormal=True,
                 optimalplacement=True, planarquadric=True)
    # Decimation can pinch new non-manifold vertices, so repair once more before orienting.
    call(ms, "meshing_repair_non_manifold_edges", method=0)
    call(ms, "meshing_repair_non_manifold_vertices")
    if a.hole > 0:  # the repairs can open small new holes
        call(ms, "meshing_close_holes", maxholesize=a.hole)
        call(ms, "set_selection_none")
    call(ms, "meshing_re_orient_faces_coherently")
    call(ms, "compute_normal_per_vertex")
    call(ms, "meshing_remove_unreferenced_vertices")

    ms.save_current_mesh(a.output)
    report = {"input": a.input, "output": a.output, "before": before, "after": stats(ms)}
    out = json.dumps(report, indent=2)
    print(out)
    if a.report:
        with open(a.report, "w") as f:
            f.write(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
