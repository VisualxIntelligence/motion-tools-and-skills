#!/usr/bin/env python3
"""A building brief as numbers (JSON) → a native IFC4 BIM model, plus an optional GLB preview.

    python brief_to_ifc.py plan.json out/model.ifc [--glb out/model.glb] [--report out/report.json]

The plan (see ../examples/office-block.json) gives a structural grid, storeys, member sizes,
a core, a facade with a glazing ratio and a roof. The script writes real IFC elements, not a
mesh: IfcSite, IfcBuilding, IfcBuildingStorey, IfcGrid, IfcFooting, IfcColumn, IfcBeam, IfcSlab
(base, floors, roof), IfcWall (core, facade, parapet) with IfcOpeningElement voids filled by
IfcWindow, each on its storey, with a material and common property sets. The file opens in
Revit, Archicad, Bonsai (Blender), Solibri and any IFC viewer.

It then re-opens the file, validates it against the IFC4 schema and reports element counts.
With --glb it tessellates every element (openings cut) into a Y-up GLB whose node names are
"<storey>|<IfcClass>|<name>" and whose colours follow the class, ready for the build-sequence
film (../../build-sequence-film/).

A massing and coordination study, not a design: sizes come from the plan, nothing is checked
by an engineer or against a code. Needs: pip install ifcopenshell numpy trimesh (IfcOpenShell is
LGPL-3.0; this script is MIT and does not include it).
"""
import argparse
import json
import sys
from collections import Counter

import numpy as np
import ifcopenshell
import ifcopenshell.api as api
import ifcopenshell.api.aggregate
import ifcopenshell.api.context
import ifcopenshell.api.feature
import ifcopenshell.api.geometry
import ifcopenshell.api.grid
import ifcopenshell.api.material
import ifcopenshell.api.project
import ifcopenshell.api.pset
import ifcopenshell.api.root
import ifcopenshell.api.spatial
import ifcopenshell.api.unit
import ifcopenshell.validate


def M(origin, z=(0, 0, 1), x=(1, 0, 0)):
    """4x4 placement: local X and Z axes in world terms, at origin."""
    z = np.array(z, float); x = np.array(x, float)
    y = np.cross(z, x)
    m = np.eye(4)
    m[:3, 0], m[:3, 1], m[:3, 2], m[:3, 3] = x, y, z, origin
    return m


class Builder:
    def __init__(self, plan):
        self.p = plan
        f = self.f = api.project.create_file(version="IFC4")
        self.project = api.root.create_entity(f, ifc_class="IfcProject", name=plan.get("project", "Project"))
        units = [api.unit.add_si_unit(f, unit_type=t) for t in ("LENGTHUNIT", "AREAUNIT", "VOLUMEUNIT")]
        api.unit.assign_unit(f, units=units)
        model = api.context.add_context(f, context_type="Model")
        self.body = api.context.add_context(f, context_type="Model", context_identifier="Body",
                                            target_view="MODEL_VIEW", parent=model)
        self.axis_ctx = api.context.add_context(f, context_type="Plan", context_identifier="Axis",
                                                target_view="PLAN_VIEW", parent=api.context.add_context(f, context_type="Plan"))
        self.site = api.root.create_entity(f, ifc_class="IfcSite", name=plan.get("site", "Site"))
        self.building = api.root.create_entity(f, ifc_class="IfcBuilding", name=plan.get("building", "Building"))
        api.aggregate.assign_object(f, relating_object=self.project, products=[self.site])
        api.aggregate.assign_object(f, relating_object=self.site, products=[self.building])
        self.materials = {}

    # -- helpers -------------------------------------------------------------------------
    def material(self, name):
        if name not in self.materials:
            self.materials[name] = api.material.add_material(self.f, name=name, category=name.lower())
        return self.materials[name]

    def element(self, cls, name, storey, rep, matrix, material, predefined=None, pset=None):
        el = api.root.create_entity(self.f, ifc_class=cls, name=name, predefined_type=predefined)
        api.geometry.assign_representation(self.f, product=el, representation=rep)
        api.geometry.edit_object_placement(self.f, product=el, matrix=matrix)
        if storey is not None:
            api.spatial.assign_container(self.f, relating_structure=storey, products=[el])
        api.material.assign_material(self.f, products=[el], material=self.material(material))
        if pset:
            ps = api.pset.add_pset(self.f, product=el, name=pset[0])
            api.pset.edit_pset(self.f, pset=ps, properties=pset[1])
        return el

    def box_rep(self, dx, dy, depth, cardinal=5):
        prof = self.f.createIfcRectangleProfileDef(ProfileType="AREA", XDim=dx, YDim=dy)
        return api.geometry.add_profile_representation(self.f, context=self.body, profile=prof,
                                                      depth=depth, cardinal_point=cardinal)

    # -- the building --------------------------------------------------------------------
    def build(self):
        p, f = self.p, self.f
        gx, gy = p["grid"]["x"], p["grid"]["y"]
        x0, x1, y0, y1 = min(gx), max(gx), min(gy), max(gy)
        st = p["storeys"]
        n, h, h0 = st["count"], st["height"], st.get("ground_height", st["height"])
        s = p["structure"]
        col, beam, slab_t = s["column"], s["beam"], s["slab"]
        elev = [0.0]
        for i in range(1, n + 1):
            elev.append(elev[-1] + (h0 if i == 1 else h))
        storeys = []
        for i in range(n):
            sto = api.root.create_entity(f, ifc_class="IfcBuildingStorey", name=f"L{i:02d}")
            sto.Elevation = elev[i]
            api.geometry.edit_object_placement(f, product=sto, matrix=M((0, 0, elev[i])))
            api.aggregate.assign_object(f, relating_object=self.building, products=[sto])
            storeys.append(sto)
        roof_sto = api.root.create_entity(f, ifc_class="IfcBuildingStorey", name="RF")
        roof_sto.Elevation = elev[n]
        api.geometry.edit_object_placement(f, product=roof_sto, matrix=M((0, 0, elev[n])))
        api.aggregate.assign_object(f, relating_object=self.building, products=[roof_sto])

        # Grid on the ground storey
        grid = api.root.create_entity(f, ifc_class="IfcGrid", name="Structural grid")
        api.geometry.edit_object_placement(f, product=grid, matrix=M((0, 0, 0)))
        api.spatial.assign_container(f, relating_structure=storeys[0], products=[grid])
        reps = []
        for k, x in enumerate(gx):
            ax = api.grid.create_grid_axis(f, axis_tag=str(k + 1), uvw_axes="UAxes", grid=grid)
            api.grid.create_axis_curve(f, p1=(x, y0 - 2, 0), p2=(x, y1 + 2, 0), grid_axis=ax)
        for k, y in enumerate(gy):
            ax = api.grid.create_grid_axis(f, axis_tag=chr(65 + k), uvw_axes="VAxes", grid=grid)
            api.grid.create_axis_curve(f, p1=(x0 - 2, y, 0), p2=(x1 + 2, y, 0), grid_axis=ax)

        conc, steel = "Concrete", s.get("beam_material", "Concrete")
        # Foundations: base slab and a pad footing under every column
        base_t = s.get("base_slab", 0.4)
        pad = s.get("pad", [2.0, 2.0, 0.8])
        rep = api.geometry.add_slab_representation(f, context=self.body, depth=base_t,
                                                   polyline=[(x0 - 1, y0 - 1), (x1 + 1, y0 - 1), (x1 + 1, y1 + 1), (x0 - 1, y1 + 1)])
        self.element("IfcSlab", "Base slab", storeys[0], rep, M((0, 0, -base_t)), conc, "BASESLAB")
        for i, x in enumerate(gx):
            for j, y in enumerate(gy):
                self.element("IfcFooting", f"F-{chr(65 + j)}{i + 1}", storeys[0], self.box_rep(pad[0], pad[1], pad[2]),
                             M((x, y, -base_t - pad[2])), conc, "PAD_FOOTING")

        core = s.get("core")
        for k in range(n):
            z, top = elev[k], elev[k + 1]
            # Columns from floor to the slab soffit above
            for i, x in enumerate(gx):
                for j, y in enumerate(gy):
                    self.element("IfcColumn", f"C-{chr(65 + j)}{i + 1}", storeys[k],
                                 self.box_rep(col[0], col[1], top - z - slab_t), M((x, y, z)), conc, "COLUMN",
                                 ("Pset_ColumnCommon", {"LoadBearing": True, "IsExternal": False}))
            # Beams under the slab above, along both grid directions (top of beam at the soffit)
            zb = top - slab_t
            for j, y in enumerate(gy):
                for i in range(len(gx) - 1):
                    a, b = gx[i], gx[i + 1]
                    self.element("IfcBeam", f"B-{chr(65 + j)}{i + 1}-{i + 2}", storeys[k],
                                 self.box_rep(beam[0], beam[1], b - a, cardinal=8),
                                 M((a, y, zb), z=(1, 0, 0), x=(0, 1, 0)), steel, "BEAM")
            for i, x in enumerate(gx):
                for j in range(len(gy) - 1):
                    a, b = gy[j], gy[j + 1]
                    self.element("IfcBeam", f"B-{i + 1}-{chr(65 + j)}{chr(66 + j)}", storeys[k],
                                 self.box_rep(beam[0], beam[1], b - a, cardinal=8),
                                 M((x, a, zb), z=(0, 1, 0), x=(-1, 0, 0)), steel, "BEAM")
            # Floor slab above (the top one is the roof)
            ov = s.get("slab_overhang", 0.3)
            poly = [(x0 - ov, y0 - ov), (x1 + ov, y0 - ov), (x1 + ov, y1 + ov), (x0 - ov, y1 + ov)]
            rep = api.geometry.add_slab_representation(f, context=self.body, depth=slab_t, polyline=poly)
            if k < n - 1:
                self.element("IfcSlab", f"Slab L{k + 1:02d}", storeys[k + 1], rep, M((0, 0, top - slab_t)), conc, "FLOOR")
            else:
                self.element("IfcSlab", "Roof slab", roof_sto, rep, M((0, 0, top - slab_t)), conc, "ROOF")
            # Core walls
            if core:
                cx0, cx1 = core["x"]; cy0, cy1 = core["y"]; t = core.get("wall", 0.3)
                for nm, (pa, pb) in {"N": ((cx0, cy1), (cx1, cy1)), "S": ((cx0, cy0), (cx1, cy0)),
                                     "E": ((cx1, cy0), (cx1, cy1)), "W": ((cx0, cy0), (cx0, cy1))}.items():
                    self.wall(f"Core-{nm}", storeys[k], pa, pb, z, top - z - slab_t, t, conc, external=False)
            # Facade walls with windows, on the slab edge
            env = p.get("envelope")
            if env:
                t = env.get("wall", 0.25)
                e = ov
                corners = [(x0 - e, y0 - e), (x1 + e, y0 - e), (x1 + e, y1 + e), (x0 - e, y1 + e)]
                for side in range(4):
                    pa, pb = corners[side], corners[(side + 1) % 4]
                    w, geo = self.wall(f"Facade-{'SENW'[side]}", storeys[k], pa, pb, z, top - z - slab_t, t,
                                  env.get("material", "Facade panel"), external=True, inward=True)
                    self.windows(w, geo, storeys[k], top - z - slab_t, t, env)
        # Parapet
        rp = p.get("roof", {}).get("parapet", 0)
        if rp:
            e = s.get("slab_overhang", 0.3)
            corners = [(x0 - e, y0 - e), (x1 + e, y0 - e), (x1 + e, y1 + e), (x0 - e, y1 + e)]
            for side in range(4):
                self.wall(f"Parapet-{'SENW'[side]}", roof_sto, corners[side], corners[(side + 1) % 4],
                          elev[n], rp, 0.2, conc, external=True, inward=True, predefined="PARAPET")
        return self.f

    def wall(self, name, storey, pa, pb, z, height, t, material, external, inward=False, predefined="STANDARD"):
        pa, pb = np.array(pa, float), np.array(pb, float)
        d = pb - pa
        length = float(np.linalg.norm(d))
        ux = np.array([d[0], d[1], 0]) / length
        # Wall thickness runs along local +Y; for perimeter walls drawn anticlockwise, +Y points inside.
        rep = api.geometry.add_wall_representation(self.f, context=self.body, length=length, height=height,
                                                   thickness=t, offset=0.0 if inward else -t / 2)
        w = self.element("IfcWall", name, storey, rep, M((pa[0], pa[1], z), z=(0, 0, 1), x=ux), material, predefined,
                         ("Pset_WallCommon", {"IsExternal": external, "LoadBearing": not external}))
        return w, (length, ux, np.array([pa[0], pa[1], z]))

    def windows(self, wall, geo, storey, height, t, env):
        length, ux, origin = geo
        ratio = float(env.get("glazing_ratio", 0.4))
        bay = float(env.get("bay", 4.0))
        nb = max(1, int(round(length / bay)))
        bw = length / nb
        wh = min(height * 0.85, height * ratio / 0.8)   # glazed area per bay ~ ratio
        ww = min(bw * 0.8, bw * height * ratio / wh)
        sill = max(0.3, (height - wh) / 2)
        for b in range(nb):
            u = (b + 0.5) * bw - ww / 2
            o = origin + ux * u + np.array([0, 0, sill])
            m = M(o, z=(0, 0, 1), x=ux)
            rep = api.geometry.add_wall_representation(self.f, context=self.body, length=ww, height=wh,
                                                       thickness=t + 0.2, offset=-0.1)
            op = api.root.create_entity(self.f, ifc_class="IfcOpeningElement", name=f"{wall.Name}-O{b + 1}")
            api.geometry.assign_representation(self.f, product=op, representation=rep)
            api.geometry.edit_object_placement(self.f, product=op, matrix=m)
            api.feature.add_feature(self.f, feature=op, element=wall)
            win_rep = api.geometry.add_wall_representation(self.f, context=self.body, length=ww, height=wh,
                                                           thickness=0.06, offset=t / 2 - 0.03)
            win = self.element("IfcWindow", f"{wall.Name}-W{b + 1}", storey, win_rep, m, "Glass", "WINDOW")
            win.OverallWidth, win.OverallHeight = ww, wh
            api.feature.add_filling(self.f, opening=op, element=win)


COLOURS = {  # class → RGBA for the preview GLB
    "IfcFooting": (0.55, 0.53, 0.50, 1), "IfcSlab": (0.78, 0.77, 0.74, 1), "IfcColumn": (0.70, 0.69, 0.66, 1),
    "IfcBeam": (0.62, 0.64, 0.68, 1), "IfcWall": (0.90, 0.85, 0.76, 1), "IfcWindow": (0.28, 0.48, 0.66, 1),
}


def to_glb(f, path):
    """Tessellate every element (openings cut) into a Y-up GLB, one named node per element."""
    import ifcopenshell.geom
    import ifcopenshell.util.element as ue
    import trimesh
    settings = ifcopenshell.geom.settings()
    settings.set("use-world-coords", True)
    scene = trimesh.Scene()
    zup_to_yup = trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0])
    it = ifcopenshell.geom.iterator(settings, f, include=f.by_type("IfcElement"))
    count = 0
    if it.initialize():
        while True:
            sh = it.get()
            el = f.by_id(sh.id)
            v = np.array(sh.geometry.verts).reshape(-1, 3)
            fc = np.array(sh.geometry.faces).reshape(-1, 3)
            if len(fc):
                mesh = trimesh.Trimesh(v, fc, process=False)
                mesh.apply_transform(zup_to_yup)
                mesh.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
                    baseColorFactor=[int(c * 255) for c in COLOURS.get(el.is_a(), (0.8, 0.8, 0.8, 1))],
                    metallicFactor=0.0, roughnessFactor=0.9))
                sto = ue.get_container(el)
                name = f"{sto.Name if sto else 'XX'}|{el.is_a()}|{el.Name}"
                scene.add_geometry(mesh, node_name=name, geom_name=name)
                count += 1
            if not it.next():
                break
    scene.export(path)
    return count


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("plan")
    ap.add_argument("ifc")
    ap.add_argument("--glb", help="also write a Y-up GLB preview with named elements")
    ap.add_argument("--report", help="also write the JSON report here")
    a = ap.parse_args(argv)
    plan = json.load(open(a.plan))
    f = Builder(plan).build()
    f.write(a.ifc)

    g = ifcopenshell.open(a.ifc)
    log = ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate(g, log)
    counts = Counter(e.is_a() for e in g.by_type("IfcProduct"))
    report = {
        "ifc": a.ifc,
        "schema": g.schema,
        "storeys": [(s.Name, round(s.Elevation, 3)) for s in sorted(g.by_type("IfcBuildingStorey"), key=lambda s: s.Elevation)],
        "elements": dict(sorted(counts.items())),
        "schema_errors": len(log.statements),
        "schema_error_samples": [str(s.get("message", s))[:160] for s in log.statements[:5]],
    }
    if a.glb:
        report["glb"] = a.glb
        report["glb_nodes"] = to_glb(g, a.glb)
    text = json.dumps(report, indent=2)
    print(text)
    if a.report:
        open(a.report, "w").write(text)
    return 0 if report["schema_errors"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
