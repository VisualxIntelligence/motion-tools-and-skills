# Blender Modeling Reference: General Deep-Dive (Appendix A)
Translated and adapted from sixtysevenlf/dsh-blender-plugin, skills/blender-modeling/SKILL.md Appendix A (MIT; see LICENSE and NOTICE.md in this folder).
This is a general reference (pitfalls, modifier order, numeric gates, render and API lessons), not a workflow: use it to look things up, not as a step-by-step procedure.

> **Notes on this adaptation**
> - Every script here is meant to be run with `execute_blender_code` in the live Blender (the official Blender MCP server). Verify results with `get_screenshot_of_window_as_image`, `render_viewport_to_path` and `get_objects_summary`; look up API details with `search_api_docs`.
> - Names such as `audit_mesh`, `audit_connectivity`, `audit_interference`, `audit_overlap`, `audit_measure`, `audit_gate`, `audit_scene`, `audit_snap_floaters`, `qc_render_views`, `contact_probe`, `fingerprint.digest` are checks from the original DSH plugin. They are not available here. They are kept as the names of the check that has to be performed; plain-bpy equivalents for the common ones are in the block at the end of A.6.
> - Section references such as §0.5.5, §0.6.1, §6, §13 and recipe numbers (2a, 2b, 3b, 6b, 8) point to the original SKILL.md, which is not part of this file.

## Appendix A. General Blender Deep-Dive Reference (not the preferred path)

> What follows keeps general modeling knowledge, numeric gates and rendering experience, for when the catalog really has no matching op.
> **In the original workflow the default path is always the architecture rules of §1–§3 plus the plugin recipes of §9–§10**; whatever a reference technique produces must still go back through the plugin gates (audit / asm / gate / visualreport) for acceptance, and writing your own criteria is not allowed.

### A.4. Six pitfalls you will hit

### 4.0 How the six pitfalls are routed (P2-3: what can be judged mechanically goes to a gate; what cannot goes into a checklist)

| Pitfall | Mechanically decidable? | Where it lands |
|---|---|---|
| Pitfall 5 **normal direction** | ✅ | **Acceptance gate**: `normals_state` of `audit_mesh` (`pass`/`fail`/`unknown`/`n/a`) + `normals_shells[]` (per shell); ⚠ do not look only at the total `signed_volume` (a large positive shell plus a small reversed shell cancel to a positive number); when `closed=false`, `normals_outward=null` (**this is not "no problem"**); `unknown` ⇒ at least `degraded` (`fail` if other defects are present at the same time); **never gives pass under any circumstance** |
| Pitfall 2 **floaters / dangling parts** | ✅ | **Acceptance gate**: `floaters[].{span_fraction, gap_mm, mesh_confirmed}` of `audit_connectivity` + **`gate.state`** (there is no top-level `state`), `audit_snap_floaters` (report-only by default), `state` of `audit_gate` |
| Pitfall 2 **clipping / hidden overlap** | ✅ | **Acceptance gate**: `audit_interference` (three states + `volume_mm3`; `unresolved` = cannot be judged), `audit_overlap` (`pair_count`; **touching gives ≥1**), `pairs[].axis_overlap_mm` of `audit_measure` (**per-axis AABB: only a rough screen, and only when the interface normal coincides with a world axis and an axis-aligned box is appropriate for that geometry**; for rotated interfaces measure the real surface in the interface's local coordinates, see pitfall 2 ③) |
| Pitfall 1 long / wide / thin axis semantics | ❌ semantics, a machine cannot judge | **Pre-code checklist** |
| Pitfall 3 taper to the midline, then merge | ❌ | **Pre-code checklist** |
| Pitfall 4 be careful with bpy.ops in headless | ❌ | **Pre-code checklist** |
| Pitfall 6 preview lighting / material / camera | ⚠ half (parameters go into `lib/preview.py`; after rendering, check `coverage_estimate` and `warning.frame_looks_empty`) | Rig defaults + gate ⑨ |

**Pre-code checklist (the three items that cannot be judged mechanically; read them through one by one before you start):**

1. **Long / wide / thin axis**: which axis of this part is the long one? Which is the wide face that "shows the shape"? Which side is the camera on? Write `(long, wide, thin) = (local ?, local ?, local ?)` in a comment before you start (pitfall 1).
2. **Taper**: for the ring of vertices that must taper to a point, do you **first collapse them to the midline (x=y=0) and only then `remove_doubles`**? Scaling by a ratio alone always leaves a flat tip (pitfall 3).
3. **Headless**: does this script contain `object.mode_set` / `mesh.*` / `loopcut` / `transform.*` / `uv.*`? If yes ⇒ switch to bmesh or the data API (pitfall 4 table + recipes 3b/8).

**How to verify**: each of the three checklist items can be pointed to as a specific line of code (the axis comment / the two lines that collapse to the midline / no ops calls);
the three mechanically judged ones must appear in the delivery receipt (§0.5.5).

### Pitfall 1: "long axis / wide axis / thin axis" semantics of slender objects

For anything slender or asymmetric (sword blade, knife, bottle, plank, bone, screwdriver tip) the three axes **mean different things**:

- **Long axis** = length (sword blade 78 cm)
- **Wide axis** = the broad face (sword blade 4.5 cm, the face that lets you see it is a sword)
- **Thin axis** = section thickness (sword blade 0.8 cm, i.e. the edge direction)

**Always make the wide axis face the hero camera.** A sword seen along its thin axis renders as a thin stick.

| Object | Local X | Local Y | Local Z |
|---|---|---|---|
| Sword blade | thin 0.8 cm | wide 4.5 cm | long 78 cm (vertical) |
| Knife blade | thin | wide | long (horizontal) |
| Plank | thin | wide | long |
| Bottle | symmetric (radius) | symmetric (radius) | long (height) |

When you finish building, remember to **rotate the object** so the broad face points at the camera (with the camera in the -Y direction, rotate the blade 90 degrees about Z so that the local Y wide axis points along world X and the broad face is visible).

### Pitfall 2: assembly seams, visual joining and real connection are two different things (★ the single most valuable item in the whole document)

In multi-part assemblies (sword = blade + guard + grip + pommel; tank = hull + turret + suspension + skirts), **face-to-face** parts show a visible seam in the render even when they touch numerically; it is worse between different shapes (a cylindrical grip inserted into a square guard).
The display-model approach is a **hidden overlap**: let the two parts press into each other a little where it cannot be seen, and the seam disappears.

> ★ **Correcting a rule that had been written in stone**: the old version treated "parts interpenetrate by **5–15 mm**" as a hard rule; v4/v5 replaced it with "`1–2×` the interface feature size",
> but **that is still a normative fixed multiple / lower bound**. **v6 withdraws every rule of this kind** (see §13): this skill no longer gives any general multiple, percentage or lower bound.

**① Display layer (the part this skill is responsible for): hidden overlap + re-check against the spec**

- Joining may use a **hidden overlap**, provided it **does not change the visible silhouette and does not punch through thin shells** (bury the overlap inside the larger part or between invisible faces);
- **The overlap amount is stated explicitly by this project's spec** (the interface table in `spec.py` writes its own value for each interface); **there is no general rule**: if the spec does not say, go back and ask for the specification, do not invent a number;
- After assembly, re-check three things against the spec: the overlap amount (`audit_measure`), floating parts (`audit_connectivity`), true interpenetration (`audit_interference`).

**② Real connection is not decided by a visual script**

Whether a thing **can carry load, resist torsion or bending, or can be assembled** is determined jointly by **the design fit (fits and tolerances), the applicable standards, the load case, the manufacturing process (wall thickness / draft / print orientation) and the motion clearance**: these are design inputs that a person has to supply.
**The geometry scripts of this skill only answer "overlapping or not, floating or not, clipping or not" and cannot give a structural-strength conclusion**: `volume_mm3` / `pair_count` / `axis_overlap_mm` are none of them a certificate of strength or connection.

**③ How to use `audit_measure` to judge overlap (★ it has a measurement-convention trap)**

`pairs[].axis_overlap_mm` is a **per-axis AABB overlap**, and the receipt itself carries `note: "bbox level (not triangle level)"`.

- **Only when "the interface normal coincides with a world axis, and an axis-aligned box is an appropriate approximation for this geometry" can the per-axis AABB serve as a rough screen**; in that case read the value of **the one axis along the interface normal**, not the maximum and not the sum;
- **Rotated / slanted interfaces cannot be read this way**: when the interface normal is not aligned with a world axis, "picking one world axis" measures the **box overlap**, not the depth at the interface. You must **measure the real surface along the real interface's local coordinates** (take a section in the interface's local frame / measure real triangles), or switch to true triangle-level evidence;
- Reading examples (the examples only show "how to read an AABB" and **constitute no depth standard whatsoever**): for a Ø6 shaft entering a hub, if the interface axis is z and the receipt gives `{x:6, y:6, z:6}`, the 6 in z is the box-level overlap; a 3 mm sheet lap joint gives `{x:180, y:200, z:1.5}`, where the 180/200 in x/y is **how large the sheet itself is** and has nothing to do with overlap; looking at a single number or taking the maximum necessarily gives a wrong conclusion;
- **AABB intersecting ≠ really overlapping**: a fully enclosed 10 mm floater also gives `overlap_bbox=true` with 10 mm on all three axes. So the overlap re-check must **run together with the floating gate** (`audit_connectivity` / `audit_gate`);
- For **true triangle-level** penetration evidence use `volume_mm3` of `audit_interference` / `pair_count` of `audit_overlap`;
  note that `audit_overlap` is "true triangle-triangle intersection", but **coplanar, mutually covering faces are not reported** (the plugin receipt's own words); for coplanar contact look at `contact_probe`.

**④ Turn on smooth shading for rounded parts**: `bpy.data.polygons[].use_smooth = True` (stable in headless) or `bpy.ops.object.shade_smooth()` in the GUI. A flat-shaded cylinder shows every facet; blocky hard-surface parts stay flat-shaded (Blender 5.x has removed `Mesh.use_auto_smooth`; use modifier-style smoothing or per-face flags).

> Measured (500 objects / 7 agents): **assembly quality depends almost entirely on this one item**. Suspension arms clipping through, a drive-wheel cover hanging in the air, a fender floating 193 mm: all were caught and brought under control by "hidden overlap + re-check against the spec after assembly".
> When modeling in parallel, write it into the **team protocol + interface table** (§0.5.3; each interface writes its own `overlap_mm` and where in the spec it comes from).

When you want **truly seamless** results (high-quality rendering), Boolean-Union parts of the same material into one mesh, but only for the same material.

### Pitfall 3: tapering to a point cannot rely on scaling alone

Scaling the top vertices to nearly 0 gives a "chisel-like flat tip". The correct method is to **collapse the vertices to the midline and then merge**:

```python
import bpy, bmesh
obj = bpy.data.objects['GEO-blade']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')

bm = bmesh.from_edit_mesh(obj.data)
bm.verts.ensure_lookup_table()
max_z = max(v.co.z for v in bm.verts)
top_verts = [v for v in bm.verts if abs(v.co.z - max_z) < 0.001]
for v in top_verts:
    v.co.x = 0.0
    v.co.y = 0.0
bmesh.update_edit_mesh(obj.data)

bpy.ops.mesh.select_all(action='DESELECT')
for v in top_verts:
    v.select = True
bmesh.update_edit_mesh(obj.data)
bpy.ops.mesh.remove_doubles(threshold=0.001)   # without this step you get a "fake point" of degenerate topology
bpy.ops.object.mode_set(mode='OBJECT')
print(f"tapered:{obj.name}")
```

### Pitfall 4: be careful with bpy.ops in headless (★ saves many "failures for no apparent reason")

Many `bpy.ops` operators are **context dependent**: they require "currently in edit mode + the active object is it + a selection set + a suitable region (VIEW_3D)".
In `blender -b` (no window, no regions) these preconditions often do not hold, and what you get is a failure whose cause cannot be seen, such as
`RuntimeError: Operator bpy.ops.mesh.xxx.poll() failed, context is incorrect`.

| Category | Behaviour in headless | Recommendation |
|---|---|---|
| `primitive_*_add` (add primitives) | ✅ stable | use directly |
| `object.modifier_apply` / `modifier_add` | ✅ mostly stable (just give `view_layer.objects.active`) | use directly; make the object active before applying |
| `object.mode_set` + `mesh.*` (extrude / inset / loop cut / remove_doubles...) | ⚠ frequent poll failures | **switch to bmesh** (recipes 3b / 8) |
| `mesh.loopcut_slide`, `transform.*`, `uv.*` | ⚠ depend on a region / modal input | do not use; use bmesh or edit the data directly |
| `object.shade_smooth` / `object.select_all` | ⚠ depend on the view_layer | use the data API (see below) |

Alternative formulations (**recommended**):

```python
# Flat / smooth shading: change the face attribute directly, no ops
for p in obj.data.polygons:
    p.use_smooth = False        # or True

# Make normals consistent: bmesh version (equivalent to normals_make_consistent)
import bmesh
bm = bmesh.new(); bm.from_mesh(obj.data)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(obj.data); bm.free(); obj.data.update()
```

When you must use ops: patch the context with `bpy.context.temp_override(...)`, or **go through the GUI channel** (run with `execute_blender_code` in the live Blender, which has a real window and regions).
Criterion: **if the same script raises a poll/context error in headless and works in the GUI, it is this pitfall**; do not suspect the geometry data.

### Pitfall 5: normal direction is the precondition of every "clipping / containment" criterion (★ it gives reversed conclusions)

Any criterion of the form `(p − loc) · n < 0 → "inside"` (point on the inner side, how deep a part is inserted into the body, whether a face points outward)
**assumes the normals point outward**. When the normals point inward the conclusion is **reversed across the board**.

Measured: the outer surface normals of a hull side plate pointed inward, and the audit reported a bracket "attached to the outer wall" as "150 mm deep inside the hull".
The nastiest thing about this kind of error is that **it looks like the geometry is wrong**, so you change the geometry and make it worse and worse.

**Discipline**:

1. **Before** any clipping / containment judgement, verify the normals first:
```python
import bmesh, mathutils
def normal_health(obj, probe_point=None):
    """Return (consistently outward?, signed volume). Signed volume < 0 = normals point inward overall."""
    bm = bmesh.new(); bm.from_mesh(obj.data)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    vol = 0.0
    for f in bm.faces:
        a, b, c = [v.co for v in f.verts]
        vol += a.dot(b.cross(c)) / 6.0
    bm.free()
    return (vol > 0), vol
```
   (Signed volume of a closed mesh < 0 ⇒ normals point inward overall ⇒ recalc first, then judge.)
   ⚠ **This is only a quick check for "one body, one shell"**: one object can contain several mutually disconnected shells, and `bm.calc_volume(signed=True)` **adds them up**:
   a large positive shell (+8) plus a separate small reversed shell (−1) still totals +7 > 0 ⇒ the reversed piece is swallowed. Leave multi-shell parts to `audit_mesh`
   (since the current version it judges **per connected shell**: `normals_state` ∈ `pass`/`fail`/`unknown`/`n/a`, details in `normals_shells[]`, including per-shell `state`/`signed_volume`/`nested`). A plain-bpy per-shell version is in the block at the end of A.6.
2. The assembly layer **applies a single catch-all** recalc (the one line of Recipe 8); do not count on every builder remembering.
3. When writing the criterion into a report, include the **normal precondition**: "with normals pointing outward, X penetrates Y by 12 mm".
4. Confirm in both directions: run the same pair of parts through `audit_interference` and `audit_measure`; if the conclusions disagree, check the normals first.
5. **`unknown` must never be treated as pass** (per-shell criterion of the current version):

   | `normals_state` | Meaning | Handling |
   |---|---|---|
   | `pass` | every shell is "confirmed to be an independent solid" and points outward; a legitimately nested cavity is marked `nested` and exempt (negative volume is not falsely reported) | record in the receipt |
   | `fail` | at least one **non-nested** shell is closed, has consistent winding, and `signed_volume < 0` | recalc first, then re-check |
   | `unknown` | cannot be determined: shell AABBs intersect but nesting/cavity cannot be confirmed (interpenetration, partial overlap, coincident copies), closure/winding/volume cannot be judged, or (when an upper limit is explicitly set) the face count exceeds the per-shell analysis limit | **do not give pass**: with no other defects `state=degraded`, with other defects (for example interpenetration caught as self-intersection) `state=fail` ⇒ **investigate further** (`normals_reason` gives the reason; for large meshes the env var `DSH_SHELL_MAX_FACES` can relax the limit), and **do not** conclude "no problem" |
   | `n/a` | the mesh is not closed (`closed=false`), so "overall orientation" is meaningless | close it first, or for an intentionally open part check only the normals at the opening separately |

### Pitfall 6: a preview rig for agents must by default make abrupt geometry changes visible

Measured (all three team members complained): previews with white material + white background are **"white on white"**: panel seams, weld seams and splits are invisible,
so panel-level QC is simply impossible. In the end the team members themselves switched to "**grey material + a single strong sun from one side**" and could finally see.

**Configure it this way by default** (write it into your `lib/preview.py`, rather than adjusting it ad hoc each time):

- Material: neutral grey (`Base Color ≈ 0.18`, `Roughness ≈ 0.6`, `Metallic = 0`), **not pure white**;
- Lighting: **a single strong sun from one side** (oblique 45°, `angle ≈ 1–3°` for hard shadows) + very weak ambient light; hard shadows reveal steps of 1–2 mm;
- Background: mid grey or a gradient, not pure white / pure black (the former eats highlights, the latter eats shadows);
- Part-level QC: use `mode="parts_color"` to colour each part with a legend, which makes it easier to spot "a piece missing / mounted the wrong way round" than one overall grey;
- **At least two cameras every time**: one "hero camera" (does it look right) + one "oblique 45° inspection camera" (seams, floating, clipping).

Criterion: **if an image does not show where the panel seams are, that image cannot serve as QC evidence**.

### A.5. Modifier stack order and symptom table

> ★ **Correcting a "fixed chain" that had been written in stone**: the old version had people "memorise" this string:
> `Mirror → Array → Solidify → Bevel → Subdivision Surface → (Boolean when needed)`.
> **No such general order exists.** A modifier stack is an **evaluation chain ordered by the objective function**: on the same base mesh,
> changing the order of just two or three entries changes **both topology and size**. Measured (Blender 5.2.2, the same 1 m cube):

| Order | verts / faces | bbox longest edge |
|---|---|---|
| Bevel (0.2 / 2 segments) → SubSurf (2) | **866 / 864** | **0.9904 m** |
| SubSurf (2) → Bevel (0.2 / 2 segments) | **98 / 96** | **0.8395 m** |
| Solidify (0.03) → Bevel (0.05 / 2 segments) (flat plane) | **56 / 54** | — |
| Bevel (0.05 / 2 segments) → Solidify (0.03) (flat plane) | **8 / 6** | — |

Both results are **correct**; which one you get depends on whether you want "rounded corners preserved through subdivision" or "a subdivided low-poly mesh rounded afterwards";
a **15%** bbox difference shows this is not just a face-count matter. ⇒ Order is decided by the **objective**, not by memorising.

**How to decide the order**: work backwards from the objective and ask, entry by entry, "what does this step need from the previous one?".

| Objective | Order (relative) | Why (design intent) |
|---|---|---|
| A mirrored part must read as one body | **Mirror first**, Bevel / SubSurf after | let the mirror seam weld into continuous faces first, then bevel/subdivide uniformly; the other way round, the seam is treated as free edges |
| Each cell of a repeating array carries its own bevel | **Bevel first**, Array after | later stages only copy the result of earlier ones; reversed, the bevel acts on the seams of "the whole row" |
| A thin shell (sheet metal / housing) needs rounded edges | **Solidify first**, Bevel after | only with thickness is there a "solid edge" to bevel; measured, in the reverse order the bevel is almost eaten (54 faces → 6 faces) |
| Smooth surface but keep the edges | **Bevel first**, SubSurf after | the bevel provides support edges so that subdivision does not round the edges off (recipe 2b) |
| Faceted hard surface (armour plates / military scale models) | **No SubSurf** | subdivision rounds every edge into "soap" → use recipe 2a (small bevel + flat shading) |
| Boolean holes | Boolean **as late as possible**, apply just before export | stays non-destructive; n-gons after a Boolean also affect later subdivision |
| Mirror after the topology is settled | **apply Mirror before changing topology** | once topology changes, alignment of the mirror seam is no longer guaranteed |

**Judge whether the order is right by the receipt** (not by memory): take the evaluated `verts / faces / bbox` from `evaluated_get(depsgraph).to_mesh()` and compare them with your target; then add the numeric gates of §6. **If you change the order, rerun the gates.**

Additional rules: keep Booleans live until export; apply Mirror once the topology is settled; **do not stack several SubSurf levels without support edges**; apply scale (Apply Scale) before Boolean / export.

| Symptom | Fix |
|---|---|
| It obviously looks like the default cube | Add Bevel (0.02 m / 3 segments) + SubSurf (**smooth parts only**) |
| **Armour edges rounded off, looks like a plastic toy** | A faceted part wrongly given SubSurf → remove SubSurf and use recipe 2a (small bevel + flat shading) |
| Pinching on circular shapes | Bevel must come **before** SubSurf |
| Black faces in the render | Recalculate normals (pitfall 5); first check the signed volume to see whether they point inward overall |
| Boolean produces n-gons | After applying the Boolean, go into edit mode and turn them back into quads, then SubSurf |
| Symmetry broken | Use the Mirror modifier, do not duplicate and flip |
| **Invisible internal faces in the mesh / faces buried inside the solid** | ★ **Not `Delete Loose`** (it only deletes "vertices/edges that belong to no face" and does not delete a single face) → see the dedicated item below |
| Wrinkling / collapse after subdivision | Missing support edges: add loop cuts to fix the structure, do not keep adding subdivision levels |
| Array start and end do not meet (tracks / chain links) | The `FIT_CURVE` array of this recipe's convention cannot give an exact closed-loop pitch → recipe 6b, a parametric path of **pin-to-pin chord length** |
| ops raise context/poll errors in headless | Pitfall 4: switch to bmesh / data API, or use temp_override |

### 5.1 The correct way to "delete internal faces" (★ the old version taught this wrongly)

The old version's symptom table said "invisible internal faces in the mesh → Clean Up → **Delete Loose**". **This is wrong**:
`Delete Loose` only deletes **vertices and edges that belong to no face** and **does not delete a single face**.

**Measured (Blender 5.2.2)**, two internal-face scenarios; what Blender itself prints is one `Info` line:

| Scenario | Internal faces | After running `delete_loose` |
|---|---|---|
| A separate floating quad stuffed inside a cube | 1 | `Info: Removed: 482 vertices, 992 edges, **0 faces**` → that face is still there |
| Two overlapping cubes joined (each shell has one face buried in the other) | 2 | `Info: Removed: 0 vertices, 0 edges, **0 faces**` → face count is still 12 |

This also rules out a second common misconception: `bpy.ops.mesh.select_interior_faces()` **does not solve it either**:
on the joined overlapping pair above, it selects **0** faces (it only works on faces where "every edge has >2 face users").

**Correct handling (by cause)**:

```python
import bpy, bmesh
from mathutils.bvhtree import BVHTree

def buried_faces(obj, eps=1e-5):
    """Faces buried inside the solid: cast a ray from the face centre along the **outward normal**; a hit = this face is blocked by other geometry.
    (clean cube -> 0; two overlapping cubes joined -> exactly 2)"""
    bm = bmesh.new(); bm.from_mesh(obj.data)
    bvh = BVHTree.FromBMesh(bm)
    out = []
    for f in bm.faces:
        c = f.calc_center_median() + f.normal * eps
        loc, nor, idx, dist = bvh.ray_cast(c, f.normal, 1e6)
        if idx is not None:
            out.append(f)
    bm.free()
    return out
```

| Cause | Correct handling |
|---|---|
| **Overlapping shells produced by join / duplication** (most common) | **Boolean UNION** (or the Boolean of `mesh.intersect`) merges the two shells into one solid; **do not "select and delete"**: measured, deleting the buried faces leaves **8 open edges** (the shell is punched open) and you must patch the faces again |
| Fragments left by the Boolean solver | Rerun with `solver='EXACT'`, or `fix_repair` (`merge_doubles` + `dissolve_degenerate` + `delete_loose` + `recalc_normals`); note that here `delete_loose` does what it **actually** is for (clearing isolated vertices/edges) |
| Inner walls made by a slip while modeling | Find them with `buried_faces()` above and delete them; **after deleting, you must patch faces or go through a Boolean**, and re-check `boundary_edges` of `audit_mesh` |
| Cause unknown | First look at `self_intersections` / `nonmanifold_edges` / `boundary_edges` of `audit_mesh`; **`self_intersections` is the machine criterion for "penetrating each other"** |

**Criterion**: after deleting internal faces, `audit_mesh` must still be `clean=true` (`boundary_edges=0` / `nonmanifold_edges=0`).
Looking only at "the face count went down" and ignoring open edges just trades clipping for broken faces.

### A.6. Numeric gate list (run through it item by item before delivery / handover) ★ **This section is the one authoritative gate table**; every other section refers to it

> In v1 this section was only a "cleanup checklist"; measurement proved **visual acceptance unreliable**: every criterion here is paired with a runnable check and a field.
> Single parts run ①–④; once assembly is complete run ①–⑧. **A missing field = not run.**
>
> ★ **Three-state convention (current version; one state more than "red/green")**: the top level of `audit_mesh` / `audit_scene` gives `state` (equivalent field `verdict`) = `pass` / `fail` / `degraded`.
> `clean` is tightened to "**checked to completion and no defect found**" ⇒ when `degraded`, `clean=false`. **`clean=false` has two causes** (a real defect / not fully checked),
> so you must read `state` + `reason`; the handling of `degraded` is to **investigate further** (neither let it through nor treat it as a failure).

| # | Gate | Criterion | How to run (check → field to read) |
|---|---|---|---|
| ① | Duplicate vertices / loose geometry | 0 isolated vertices, 0 loose edges | `mesh_health()` below → `loose_verts=0` **and** `loose_edges=0` (DSH: `audit_mesh` → `totals.loose_verts=0` **and** `totals.loose_edges=0`; plus `remove_doubles`) |
| ② | Manifold | 0 non-manifold edges (except intentional openings) | `mesh_health()` → `nonmanifold_edges=0` (DSH: `audit_mesh` / `audit_scene` → `totals.nonmanifold_edges=0`); ⚠ `audit_scene` **does not run self-intersection by default** ⇒ `state=degraded`; to use it as a gate you must pass `self_intersect=true` |
| ③ | Open edges | 0 open edges (closed-part convention) | `mesh_health()` → `boundary_edges=0` (DSH: `audit_mesh` → `totals.boundary_edges=0`, `objects[i].closed=true`) |
| ④ | Normals | consistently outward **per connected shell** (not "total `signed_volume` > 0") | `mesh_health()` → per-shell `signed_volume`; a negative shell is either reversed or a nested cavity: decide manually (DSH: `audit_mesh` → `objects[i].normals_state` (`pass`/`fail`/`unknown`/`n/a`) + `normals_shells[]` (per-shell `state`/`signed_volume`/`nested`)); ⚠ `closed=false` ⇒ `normals_outward=null` (an open mesh has no such thing as "overall orientation"); `normals_state=unknown` ⇒ **do not give pass** (with no other defects `state=degraded`, with defects `state=fail`, look at `normals_reason`) |
| ⑤ | Size | key bbox deviation from `spec.py` ≤ tolerance (military-model grade ±3 mm) | `world_aabb()` below, compared with the spec (DSH: `audit_measure` → `items[].size_mm`) |
| ⑥ | Floating | 0 dangling parts (visible floater = longest bbox edge ≥ 1% of the whole model) | Manual check: split the evaluated meshes into connected pieces and measure the gap from each piece to the rest; count a piece as a visible floater when its longest bbox edge is ≥ 1% of the whole model (DSH: `audit_connectivity` → `gate.state=pass` **and** `floaters=[]`; ⚠ there is **no** top-level `state`; **do not use "component count = 1" as the criterion**, since parts that touch but are not welded are naturally multi-component / `audit_snap_floaters` (report-only by default) / `state` of `audit_gate`) |
| ⑦ | Clipping | no abnormal interpenetration; permitted hidden overlaps are whitelisted | `pair_count()` below for triangle-triangle intersection (DSH: `audit_interference` → `verdict` + `volume_mm3` (⚠ `unresolved` = **cannot be judged**, not "no interference"; touching contact often gives `unresolved`) + `audit_overlap` → `pair_count` (⚠ touching gives ≥1; `analyzed=false` ≠ no overlap)) |
| ⑧ | Hidden overlap | the overlap at each interface matches the `overlap_mm` **written in this spec** (pitfall 2: **no general multiple / percentage / lower bound**; no change to the visible silhouette, no punching through thin shells) | Per-axis AABB overlap from `world_aabb()` of the two parts, read **only along the interface normal** and **only when that normal coincides with a world axis and an axis-aligned box is appropriate**; for rotated interfaces measure the real surface in the interface's local frame; also run gate ⑥ on the same pair: if it reports floating, the "overlap" does not hold (DSH: `audit_measure` → `pairs[].axis_overlap_mm` + `audit_connectivity`) |
| ⑨ | Form | fixed-camera comparison images + numeric bbox (both are required) | Fixed cameras with `render_viewport_to_path` (and `get_screenshot_of_window_as_image`), same size for every shot (DSH used `max_size=900`), plus the numeric bbox from ⑤; **IoU only judges the silhouette**, see §0.6.2 for its blind spots (DSH: `qc_render_views` + `audit_measure`) |
| ⑩ | Face count | against the triangle budget | `tri_count()` below (DSH: `tris` of `audit_scene` / `audit_gate`; look at the number only, not at the state) |
| — | Evidence archiving | invalid as soon as the source changes | the md5 of the `.blend` file (`hashlib`) (DSH: `fingerprint.digest` + md5 of the `.blend`) |

**MUST**: stay non-destructive until the export stage; name objects as soon as they are created (GEO- prefix); keep blockout and final model separate; apply transforms before Boolean / export;
**with multiple agents, freeze spec.py and the interface table first**; every part is delivered with numeric evidence.
**MUST NOT**: delete the blockout before the silhouette is approved; apply all modifiers too early; leave default names; start modeling without a scale reference; skip cleanup;
**accept a form on a single finished-model image**; **draw clipping conclusions before the normals are verified**; **use single-view IoU as "does the whole thing look right"**.

**Plain-bpy equivalents for the checks above** (run with `execute_blender_code`; these are simple stand-ins, not the DSH implementation):

```python
import bpy, bmesh
from mathutils.bvhtree import BVHTree

def mesh_health(obj):
    """Gates 1-4 on the object's base mesh (unevaluated; apply modifiers first if they matter).
    Uses local coordinates: apply scale first, a negative scale flips the sign of the volume."""
    bm = bmesh.new(); bm.from_mesh(obj.data)
    bm.faces.index_update()
    loose_verts = sum(1 for v in bm.verts if not v.link_edges)
    loose_edges = sum(1 for e in bm.edges if not e.link_faces)
    boundary    = sum(1 for e in bm.edges if e.is_boundary)
    nonmanifold = sum(1 for e in bm.edges if len(e.link_faces) > 2)
    seen, shells = set(), []                      # connected shells over shared edges
    for f0 in bm.faces:
        if f0.index in seen: continue
        seen.add(f0.index); stack, shell = [f0], []
        while stack:
            f = stack.pop(); shell.append(f)
            for e in f.edges:
                for g in e.link_faces:
                    if g.index not in seen:
                        seen.add(g.index); stack.append(g)
        shells.append(shell)
    def signed_volume(faces):
        vol = 0.0
        for f in faces:
            vs = [v.co for v in f.verts]
            for i in range(1, len(vs) - 1):       # triangle fan
                vol += vs[0].dot(vs[i].cross(vs[i + 1])) / 6.0
        return vol
    out = dict(loose_verts=loose_verts, loose_edges=loose_edges, boundary_edges=boundary,
               nonmanifold_edges=nonmanifold, shell_volumes=[signed_volume(s) for s in shells])
    bm.free()
    return out

def _evaluated_world_mesh(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    oe = obj.evaluated_get(dg); me = oe.to_mesh()
    me.transform(obj.matrix_world)
    return oe, me

def world_aabb(obj):
    """World-space AABB of the evaluated mesh, in scene units (metres by default; x1000 for mm)."""
    oe, me = _evaluated_world_mesh(obj)
    pts = [v.co.copy() for v in me.vertices]
    oe.to_mesh_clear()
    return (tuple(min(p[i] for p in pts) for i in range(3)),
            tuple(max(p[i] for p in pts) for i in range(3)))

def pair_count(a, b):
    """Number of intersecting triangle pairs between two evaluated meshes (touching faces may give >=1)."""
    trees = []
    for o in (a, b):
        oe, me = _evaluated_world_mesh(o)
        trees.append(BVHTree.FromPolygons([v.co.copy() for v in me.vertices],
                                          [tuple(p.vertices) for p in me.polygons]))
        oe.to_mesh_clear()
    return len(trees[0].overlap(trees[1]))

def tri_count(objs):
    dg = bpy.context.evaluated_depsgraph_get(); n = 0
    for o in objs:
        oe = o.evaluated_get(dg); me = oe.to_mesh()
        n += sum(len(p.vertices) - 2 for p in me.polygons)
        oe.to_mesh_clear()
    return n
```

### 6.1 Must run before handover (P0-4): three commands and one receipt

Copy the commands as they are; **for criteria and fields always consult the §6 table above** (this section does not repeat the gate table).
In the original these are four DSH calls; with the Blender MCP run each one with `execute_blender_code`:

1. **Mesh health of one part / a collection** (boundary / nonmanifold / degenerate / loose / self-intersections / normals): `mesh_health(obj)` for each object in the collection (DSH: `audit_mesh` with `scope: "COL_Geo"`).
2. **Delivery gate: connectivity + envelope** (★ assembly convention; with a single part use ① only): check the world AABB of the assembly against the envelope `[x0, y0, z0, x1, y1, z1]` with `world_aabb()`, and run the floating check (gate ⑥) (DSH: `audit_gate` with `scope: "COL_Geo"`, `envelope: [x0, y0, z0, x1, y1, z1]`).
3. **Clipping / interference** (pair by pair; hidden overlaps that are allowed by design must be whitelisted): `pair_count(a, b)` for each pair, e.g. `GEO-rungear` and `GEO-hull` (DSH: `audit_interference` with `a`/`b`).
4. **Whole-scene first screen** (★ delivery acceptance must explicitly turn on the self-intersection check: off by default ⇒ `state=degraded`, and pass cannot be obtained): run the part-level checks for every object, including the self-intersection check (DSH: `audit_scene` with `summary_only: True`, `top_k: 10`, `self_intersect: True`; this one is not reproduced by the snippets above, so self-intersection has to be checked by hand, for instance with `BVHTree.overlap` of a mesh against itself).

> ★ **The self-intersection switch of `audit_scene` (measured, current version)**: by performance contract it **defaults to `self_intersect=false`** (a cheap first screen),
> and then, however clean the scene, the receipt says `state=degraded` + `clean=false` + `warn: "DEGRADED ≠ pass"` +
> `hint: "rerun with self_intersect=true for a full conclusion"`: **"check skipped" must never be read as "no problem"**.
> ⇒ **For delivery / acceptance always pass `self_intersect=true`** (the cost scales with face count); the everyday first screen that only asks "which ones are the dirtiest" may leave it off,
> but then the receipt **cannot** be used as a gate.

**The receipt template and the three hard disciplines are in §0.5.5** (including how to write the `.blend` md5 and `fingerprint.digest`).

**Three conventions (measured, do not mix them up)**:
1. `audit_mesh` reads the **unevaluated `ob.data`**: modifiers that have not been applied do not count (a half part with Mirror reports the base mesh's `verts=4 / boundary_edges=4`);
   the assembly-level `audit_connectivity` / `audit_gate` / `audit_measure` / `audit_interference` use the **evaluated mesh** (an unapplied Boolean counts). To use `audit_mesh` to judge "is it finished", first apply the relevant modifiers.
2. `ok=false` / `analyzed=false` / `state="degraded"` **are none of them a pass**: they mean "not run" or "not fully analysed" and must not be read as "no problem".
3. **`clean=false` has two causes**: `state=fail` (a real defect; look at the non-zero count fields in `totals`) or `state=degraded` (not fully checked / cannot be judged: self-intersection skipped or raised an exception, `normals_state=unknown`, per-shell analysis over the face-count limit). When you get `clean=false`, **read `state` first**, then decide between "fix the geometry" and "investigate further".

### A.6.5 Rendering / animation / long jobs (★ new in v7, added from measurements on the "QBZ-191 full teardown video")

> §0–§6 take care of **whether the shape is right**; this section takes care of **whether the picture is right and whether a long job can finish**.
> The failure modes of the two are completely different, and the pitfalls of the render stage are **more hidden**:
> when the geometry is wrong `audit_mesh` goes red; **when the framing is wrong it just quietly gives you an image with the edges cut off**.

### 6.5.1 Framing: never estimate from the bounding box; self-check by projecting frame by frame ★ the most valuable part of this section

**Measured incident (QBZ-191 exploded view, 2 rounds of rework)**:

| Symptom | Root cause |
|---|---|
| All 4 exploded views had their edges cut off | The camera distance was estimated from `dx/dy/dz` of the axis-aligned AABB: **the projected extent of a 3/4 view has nothing to do with those three numbers** |
| Framing off by **2.2×** | `obj.location` was changed without refreshing the depsgraph ⇒ `bounds_all()` read the **pre-explosion** matrices (framed for 949 mm, actual 2129 mm) |
| Iteration diverged to `dist=6.1e15` | The sign of the hand-solved **centring term** was wrong (should add, not subtract) |
| Diverged in the same way | Vertex sampling was in **metres** and the bounding box in **millimetres**, and the two were mixed in one computation |

**Rule 1: always solve camera distance / viewpoint from the "projected" frame extent, not from the AABB.**

```python
from mathutils import Vector

def cam_basis(direction):                       # d = target->camera; fwd = -d
    d = Vector(direction).normalized(); fwd = -d
    up = Vector((0, 0, 1))
    if abs(fwd.dot(up)) > 0.995: up = Vector((0, 1, 0))
    Z = -fwd
    Y = (up - Z * up.dot(Z)).normalized()
    X = Y.cross(Z).normalized()
    return d, fwd, X, Y, Z

def fit_view(bb, direction, lens=70, res=(1920, 1080), margin=1.18, points=None, iters=40):
    d, fwd, X, Y, Z = cam_basis(direction)
    tan_h = (36.0 / 2) / lens                                     # sensor 36mm
    tan_v = tan_h * (res[1] / float(res[0]))
    pts = points or [Vector((x, y, z)) for x in (bb[0], bb[1])
                     for y in (bb[2], bb[3]) for z in (bb[4], bb[5])]
    look = Vector(((bb[0]+bb[1])/2, (bb[2]+bb[3])/2, (bb[4]+bb[5])/2))
    dist = max(bb[1]-bb[0], bb[3]-bb[2], bb[5]-bb[4]) * 1.8 + 1.0
    target = 1.0 / margin
    for _ in range(iters):
        C = look + d * dist
        k, nx, ny, behind = 0.0, [], [], False
        for P in pts:
            V = P - C; dep = V.dot(fwd)                            # depth along the positive view direction
            if dep <= 1e-6: behind = True; break
            ax = V.dot(X) / (dep * tan_h); ay = V.dot(Y) / (dep * tan_v)
            nx.append(ax); ny.append(ay); k = max(k, abs(ax), abs(ay))
        if behind: dist *= 1.8; continue                           # a corner has gone behind the camera
        dist *= (k / target) ** 0.85                               # nx,ny ∝ 1/dist
        cxm = (min(nx)+max(nx))/2; cym = (min(ny)+max(ny))/2
        look = look + X*(cxm*dist*tan_h) + Y*(cym*dist*tan_v)      # ★ sign: add, not subtract
        if k <= target*1.002 and abs(cxm) < 0.004 and abs(cym) < 0.004: break
    return dist, (look.x, look.y, look.z)
```

**Rule 2: after placing the camera you must verify, and what you verify is the "projection", not "looks about right".**

```python
# Per-frame framing self-check: max NDC must be <= 1.0 (=1.0 means touching the edge)
# (assumes sc, cam, objs, RES and the frame number f are defined, and worst = 0.0 before the loop)
worst = 0.0
sc.frame_set(f); bpy.context.view_layer.update()        # ★ without refreshing the depsgraph you read stale matrices
mw = cam.matrix_world; C = mw.translation
X = mw.col[0].to_3d().normalized(); Y = mw.col[1].to_3d().normalized()
fwd = -mw.col[2].to_3d().normalized()
tan_h = (36.0/2)/cam.data.lens; tan_v = tan_h*(RES[1]/float(RES[0]))
for o in objs:
    for v in [o.data.vertices[i] for i in range(0, len(o.data.vertices), 14)]:   # ★ step = 14, same convention as fit_view
        V = (o.matrix_world @ v.co) - C; dep = V.dot(fwd)
        assert dep > 1e-4, "a corner has gone behind the camera"
        worst = max(worst, abs(V.dot(X)/(dep*tan_h)), abs(V.dot(Y)/(dep*tan_v)))
assert worst <= 1.0, "edges cut off: worst NDC=%.3f" % worst
```

> ⚠ **The sampling density must match `fit_view`.** My first self-check took only 20 points per part and measured `0.737`,
> while the real value was `0.847`: **the self-check itself was lying to me**. A self-check that is looser than the thing it checks is no check at all.
>
> **Measured convention**: for still-frame acceptance `worst <= 1.0`; for the finished film, margin `1.12–1.24` (corresponding to `worst ≈ 0.80–0.89`).

**Rule 3: unify units first.** `kit.bounds_all()` returns **mm** while `matrix_world @ v.co` is in **m**: mix them and you get `dist=6.1e15`.
Wherever "vertices / bounding box" are mixed, multiply by `* 1000` first.
(`kit.bounds_all()` is a DSH kit helper. Needs the DSH runtime; not available here — use as a description of the check. With plain bpy, build the bounds yourself, e.g. with `world_aabb()` from A.6, and keep the unit explicit.)

### 6.5.2 Exploded views / teardown animation: position, magnitude, floor, order

- **After changing `obj.location` you must call `bpy.context.view_layer.update()`**, otherwise `matrix_world` is still the old one
  (the root cause of incident 2 in §6.5.1). Especially fatal for animations that "compute the bounding box every frame".
- **Fix the "total span" for the magnitude first, then distribute each part's displacement proportionally**; do not tune part by part. Target **≈1.4–1.6× the object length**;
  measured at 2.2× (2129 mm vs a rifle length of 946 mm) the parts were **as small as star points**, and a uniform scale of 0.42 → 1445×904 mm was needed before the skeleton could be read.
- **The floor can eat the whole frame**: exploded parts fall below the studio floor (measured Z down to −1146 mm).
  For every exploded / internal-structure shot, set `hide_render = True` to hide the floor and use a gradient world as the background.
- **One "datum part" must stay still**, to give the viewer a frame of reference (I used the upper receiver).
- **In the wave table "specific names must be listed before generic names"**: `bolt_carrier` / `bolt_cam_pin` / `bolt_catch` must all be listed before `bolt`,
  otherwise `bolt` swallows all of them. Likewise `buffer_tube` must come before `buffer`, and `trigger_guard` before `trigger`.
- **At the end, print the unmatched list**: `UNMATCHED []` means every part has been choreographed (otherwise some parts silently do not move).
- **Easing**: for a mechanical feel use **ease-out** (`1-(1-u)**2.4`), sampling in 8 segments and keyframing each, which feels more like "coming apart" than the default Bezier.

### 6.5.3 Long jobs (>2 min): must be interruptible by default ★

**Measured**: during a 10-minute render the backend restarted ⇒ the DSH job wait (`blender_rt_job(op="wait")`) returned `Error: terminated`,
and the job became `stale: pid no longer exists`. **This is normal, not an exception.** The same applies to a long script run through `execute_blender_code`: split the work into chunks that can be re-run.

**Rules (each of which has saved time)**:
1. Name outputs by **frame number** and put them in a fixed `outdir` (`seq_0001.png`);
2. Before writing each image, `if os.path.exists(p) and not FORCE: continue`: **skip if it exists**;
3. Provide `--force` to start over. **"Resumable" is the first property of a long job, not an optimisation**:
   measured, re-rendering 1 missing frame of a 301-frame video took **6 seconds**, not a 10-minute rerun;
4. Print progress every N frames, plus **measured s/frame + ETA**; compute ETA from the **number of frames actually rendered**, not from the loop index (on a resumed run the latter lies to you);
5. **Drafts and finals must go in separate directories**: otherwise "skip if it exists" will treat a 480p draft as a finished 1080p frame;
6. **Be clear who owns the job handle**: with `as_job=true` what comes back is the **Blender-side ledger id**, collected with `blender_rt_job(op=wait/collect)`;
   passing it to DSH's `job_output` returns `unknown job` (two separate registries). (Needs the DSH runtime; not available here — use as a description of the check.)

### 6.5.4 Render time: measure 3 frames first, then schedule

**Measured model** (Cycles/OptiX + denoising, 138 parts / 191k faces, every part moving in every frame, RTX 4060 Laptop):

| Resolution | Samples | Seconds/frame |
|---|---|---|
| 1920×1080 | 64 | 1.78 |
| 1920×1080 | 128 | 2.00 |
| 1920×1080 | 256 | 2.50 |
| 1920×1080 | 320 | 2.45 |
| 3840×2160 | 320 | 9.71 |

**Key conclusion: about 60% of a frame is fixed overhead** (scene evaluation + BVH rebuild + denoising + PNG write to disk).
So **"lower the samples to save money" is almost useless** (320 → 64 saves only 30%), and **the real lever is frame count = duration × frame rate**;
resolution is nearly linear in pixel count (4K ≈ 3.8 × 1080p). **Before scheduling, spend 1 minute rendering 3 frames and measure; do not apply someone else's numbers.**

⚠ **In Blender 5.2 `use_persistent_data` lives on `scene.render`, not on `scene.cycles`.**
Wrapped in `try/except` it **fails silently** (I failed **26 times in a row** before noticing):
**no setter may fail silently; every one must be read back and verified** (the same discipline as "a silent empty output must fail" in §6):

```python
sc.render.use_persistent_data = True
assert sc.render.use_persistent_data is True, "did not take effect: the property may be on another object"
```

### 6.5.5 Video: low-frame-rate rendering + optical-flow interpolation (saves 3×, but measure the frame-to-frame displacement first)

**The criterion is not "I think it can move"; it is "how many pixels does it move per frame"**:

```
px_per_frame = total travel of a single part in mm / (duration in s × render frame rate) ÷ (frame width in mm / frame width in px)
< 30 px/frame  ⇒ optical-flow interpolation is practically lossless
> 80 px/frame  ⇒ starts to tear / ghost
```

Measured (1080p, frame width ≈1450 mm mapped to 1920 px): the fastest part moves **17 px/frame** ⇒ rendering at 10 fps and outputting at 30 fps is safe.

**A ground-truth comparison must be done before it counts as accepted**: have the renderer **render separately the "true timeline frame that an interpolated frame corresponds to"** as ground truth, and compare pixel by pixel.

| Comparison | PSNR |
|---|---|
| Source frame pass-through (verifies the chain is lossless) | **51.6 dB** |
| **Interpolated frame vs ground truth** | **40.1 / 40.4 dB** |
| Frame decoded after encoding vs source PNG | 43.0 dB |

The residual error is concentrated in the **sub-pixel aliasing of high-frequency edges** (rail teeth, grip serrations); **enlarging the search window gives no improvement** (40.13 → 40.20 dB)
⇒ **this is the inherent cost of low-frame-rate sampling, not a parameter problem; stop tuning parameters.** Not visible by eye at 3× magnification.

```bash
# For continuous motion in a single shot use scd=none, so scene-change detection does not misjudge it as a cut
ffmpeg -start_number 1 -framerate 10 -i seq_%04d.png \
  -vf "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none" \
  -fps_mode cfr -frames:v 900 -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p out.mp4
```
> ⚠ ffmpeg 7: `-vsync vfr` conflicts with `-r` (error `One of -r/-fpsmax was specified together a non-CFR`); use `-fps_mode cfr` instead.
> ⚠ Leave 3 extra frames on the timeline, otherwise a 30 fps output is 2 frames short of filling 30.000 s.

### 6.5.6 Blender 5.2 API changes (measured; they raise errors directly)

| Symptom | Cause | Fix |
|---|---|---|
| `'Action' object has no attribute 'fcurves'` | 5.2 switched to layered / slotted actions | Do not iterate over `action.fcurves`; to control easing, **sample the easing yourself and insert keyframes** |
| `bpy_prop_collection[slice]: slice steps not supported` | `vertices[::n]` does not support step slicing | `[o.data.vertices[i] for i in range(0, n, step)]` |
| `CyclesRenderSettings has no attribute 'use_persistent_data'` | The property moved to `scene.render` | See §6.5.4 |
| `Scene.frame_set()` expected int, not float | The frame number must be an integer | `int(1 + round(t * fps))` |
| After `open_mainfile` in the GUI you see an empty mesh | It uses "the user's current viewport" | Pass `from=` / `look_at=` to use a custom view (DSH parameters; needs the DSH runtime, not available here. With plain bpy, place and aim the camera yourself) |
| `module 'dsh_rt_kernel' has no attribute 'dsh_audit_api'` | That module was **not preloaded into the kernel** | `blender_rt_headless(..., preload="audit")`; or check what is loaded: `K.dsh_kit.kapi("audit")` (if not found it lists the available module names). (Needs the DSH runtime; not available here — use as a description of the check.) |
| `'Scene' object has no attribute 'node_tree'` | **From 5.0 the compositor became a node group** (`scene.node_tree` was removed) | `ng = bpy.data.node_groups.new("Comp","CompositorNodeTree"); scene.compositing_node_group = ng`; first `ng.interface.new_socket(name="Image", in_out='OUTPUT', socket_type='NodeSocketColor')`, and use **`NodeGroupOutput`** for the output (`CompositorNodeComposite` no longer exists) |
| `AttributeError: type ... is read-only` / `glare_type` invalid | 5.x turned Glare's **Type/Quality into MENU input sockets**, and the parameters also moved into inputs | `gl.inputs['Type'].default_value = 'Fog Glow'`, `gl.inputs['Quality'].default_value = 'High'`, `gl.inputs['Threshold'] / ['Size'] / ['Strength']`; do not write `gl.glare_type` / `gl.threshold` |
| `Error: Node type CompositorNodeMixRGB undefined` (likewise `CompositorNodeMath` / `CompositorNodeComposite`) | 5.x removed the old Mix/Math/Composite from the compositor | **Use shader nodes** in the compositor tree: `ShaderNodeMix` / `ShaderNodeMath` / `ShaderNodeValToRGB` can still be created with `nodes.new`; use `CompositorNodeAlphaOver` for overlay and `CompositorNodeColorBalance` / `CompositorNodeCurveRGB` for colour grading |
| `'CyclesMaterialSettings' object has no attribute 'displacement_method'` | 5.2 moved it onto the Material itself | `mat.displacement_method = 'BUMP'` (**not** `mat.cycles.displacement_method`); for transparent blending use `mat.surface_render_method = 'BLENDED'` (the enum has only `DITHERED`/`BLENDED`) |
| The console prints `Shadow buffer full (3040 / 2048)` every frame, and `scene.eevee.shadow_pool_size='4096'` is **silently ineffective** | The shadow pool is an **enum** and its upper limit is `'2048'` (2 GB) | ① `scene.eevee.shadow_pool_size='2048'`; ② the main lever is **fewer shadow-casting lights**: `light.use_shadow=False` (applies to point and area lights), keep only 2–4; ③ for large scenes also lower `scene.eevee.shadow_resolution_scale`; ④ one line does it all with `K.light_hygiene(apply=True)` (resident since v2.6). (Item ④ needs the DSH runtime; not available here — use as a description of the check. The plain-bpy equivalent is a loop over `bpy.data.lights` setting `use_shadow = False` on all but a few.) |


**Minimal runnable 5.2 compositor snippet (Fog Glow bloom; copy as is)**:

```python
import bpy
sc = bpy.context.scene
ng = bpy.data.node_groups.get("Comp") or bpy.data.node_groups.new("Comp", "CompositorNodeTree")
sc.compositing_node_group = ng          # 5.0+: not sc.node_tree
ng.nodes.clear()
ng.interface.new_socket(name="Image", in_out='OUTPUT', socket_type='NodeSocketColor')
rl = ng.nodes.new('CompositorNodeRLayers')
gl = ng.nodes.new('CompositorNodeGlare')
gl.inputs['Type'].default_value = 'Fog Glow'      # a MENU socket, not gl.glare_type
gl.inputs['Quality'].default_value = 'High'
gl.inputs['Threshold'].default_value = 1.0
gl.inputs['Size'].default_value = 8.0
gl.inputs['Strength'].default_value = 0.45
out = ng.nodes.new('NodeGroupOutput')             # not CompositorNodeComposite
ng.links.new(rl.outputs['Image'], gl.inputs['Image'])
ng.links.new(gl.outputs['Image'], out.inputs['Image'])
sc.render.use_compositing = True
```
### 6.5.7 Acceptance receipt for rendering / animation

```text
[Render receipt] <shot name / agent>   <ISO time>
  Framing     worst NDC = 0.804 (<=1.0)   sampling = every 14 vertices   camera key points = 21
  Resolution  1920x1080   samples 320   measured 2.02 s/frame   frames 301   total time 605 s
  Continuity  all parts choreographed UNMATCHED=[]   datum part = upper_receiver (stays still)
  Resume      skip if exists: this round re-rendered 1 frame / 6 s
  ⚠ Uncertain items: <list honestly>
```

### A.7. Deep-dive reference

When you need more precision than the recipes give, read `references/modeling-overview.md` (the English original, covering: the rule for choosing between the two APIs `bpy.ops.mesh` and bmesh, the professional choice among the 8 primitives, a line-by-line description of the edit-mode toolbox, the bmesh precision API, the hard-surface bevel-weight technique, the Boolean toolbox, key modifiers, a complete `bpy.ops.mesh` cheat sheet, and the items the author himself marked as unfinished).

When to read it: the recipes do not match (you need bmesh-level precision or a custom operation); the topology requirements are stricter than usual (animation-ready, game LODs); performance-sensitive work (foreach_set, batch operations); you need operators that the recipes do not list.

**`references/multiview-calibration.md`** (shipped with this skill; here it is the file `multiview-calibration.md` in this folder): a runnable script for joint three-view calibration (standard library only, `--selftest` self-check) + a criteria table + point-picking rules + the self-proof convention for "how to know the calibration is right"; read it when following §0.6.1.

### A.8. Sources and licence

This skill was fused and rewritten from the **modeling-workflow parts** of the following two MIT-licensed projects, with every tool call replaced by the local `blender_rt_*` direct chain:

- **RobLe3/cc-blender-skill** (`blender-modeling` and its `references/overview.md`): decision tree, recipes, pitfall table, deep-dive reference
- **arjun988/blender-skills** (`blender-modeler`): six-step outline, collection structure, modifier rules, cleanup checklist, MUST / MUST NOT

For full attribution and licences see `NOTICE.md` in the same directory. The upstream originals target MCP (mcp__blender__*); this version was rewritten for the local direct tool chain. (In this adaptation, the local direct chain is replaced by the official Blender MCP server and `execute_blender_code`.)
