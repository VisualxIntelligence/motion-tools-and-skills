# Acceptance checklist (for the independent verifier only)

Translated and adapted from sixtysevenlf/dsh-blender-plugin, skills/blender-modeling/验收清单.md (MIT; see LICENSE and NOTICE.md in this folder). The DSH-specific tools of the original were replaced by the official Blender MCP tools; checks that relied on a DSH op with no equivalent are kept as described manual checks.

> **Read only this file.** Do not load the full modeling reference (`blender-modeling-reference.md`, `SKILL.md` or other `references/*`):
> that is how the verifier's fixed overhead stays small. A clean verifier should start from this checklist, the tool schemas, the project instructions and the receipt, nothing more.
> To widen the checks, read **only the numeric-gates table + the output format** below; do not pull the big reference in "while you are at it".

**Tools you have (Blender MCP):** `execute_blender_code` (runs a Python string in the live Blender; this is how every numeric check below is run), `get_objects_summary`, `get_screenshot_of_window_as_image`, `render_viewport_to_path`, `search_api_docs`. Nothing else is assumed.

## Task template (copy it straight to the verification subagent)

You are the **independent verifier**, not the builder. Read only this file + the receipt and images I give you.

- Input: `spec` = <spec file path or expected numbers> | `receipt` = <path of the builder's receipt (for example gate.json), or pasted> | `images` = <1–2 renders from the same camera> | `changes` = <list of changed objects / files>
- Requirements:
  1. **Run the numeric gates yourself** (table below, with `execute_blender_code`); do not accept the builder's conclusions;
  2. **Key items must be re-checked through a different computation path** (see "Anti-Goodhart" below);
  3. Reply in **4 lines** per the "Output format"; do not retell the build history, do not rerun a whole-scene health check;
  4. If the evidence is insufficient write `unresolved`; **never** force a two-way verdict on insufficient evidence.

## Numeric gates (run by script, not by the model)

All of these run through `execute_blender_code` against the live scene. A check you could not run, or could only partly run, is `unresolved`, never a pass.

| What is verified | Call (all with `execute_blender_code`) | Pass criterion |
|---|---|---|
| Single-part mesh health | For each object in the list, build a bmesh from `obj.data` and count loose vertices (no linked edges), loose edges (no linked faces), boundary edges (`e.is_boundary`), non-manifold edges (more than 2 linked faces), degenerate faces (zero area); compute the signed volume **per connected shell** | boundary / nonmanifold / degenerate / loose_verts / loose_edges are all 0; normals: every shell has positive signed volume (a negative shell is acceptable only if it is a deliberate nested cavity, confirmed by hand); **judge per shell**, do not look only at the total signed volume. (DSH original: `audit_mesh`, `state=pass` (= `verdict`), `normals_state=pass`) |
| Dirtiest objects in the whole scene | Repeat the single-part check over all mesh objects and rank by number of defects (`get_objects_summary` lists the objects); include a self-intersection test (`BVHTree.overlap` of a mesh against itself) | No defects; ★ **if you skip the self-intersection test the result can be at best `degraded`, which is not a pass**; otherwise look only at the worst offenders. (DSH original: `audit_scene` with `summary_only`, `top_k:5`, `self_intersect:true`, `state=pass`) |
| Assembly connectivity (floaters) | Manual check: for the evaluated meshes of the assembly, find the pieces that are not connected to the rest and measure the gap to the nearest other piece; a piece whose longest bbox edge is ≥ 1% of the whole model is a visible floater | No floaters. **Do not use "component count = 1" as the criterion** (parts that touch but are not welded are naturally multi-component); a check you could not complete is not a pass. (DSH original: `audit_connectivity`, read `gate.state=pass` and `floaters=[]`; there is no top-level `state`) |
| Interference / overlap (triangle level) | Per pair of parts: evaluated meshes in world space, `BVHTree.FromPolygons(...)` for each, `len(tree_a.overlap(tree_b))` for the intersecting triangle-pair count | Count 0, or only whitelisted design contacts. ⚠ **Touching faces give a count ≥ 1**: whitelist deliberate contacts, do not use the count as a clipping switch. An intersection volume needs a Boolean (`INTERSECT`) check; if you cannot compute it, the result is `unresolved`, not "no interference". A pair you did not test is **skipped, and skipped is not a pass** (see point 4 below). (DSH original: `audit_interference` `volume_mm3 ≈ 0` and `verdict="refuted"`; `audit_overlap` `pair_count`) |
| **Display-assembly overlap** | For each interface of the project's interface table, read the per-axis AABB overlap of the two parts (world AABB from `matrix_world @ v.co` of the evaluated mesh) | Re-check against the project interface table's `overlap_mm`. The per-axis AABB overlap is only a rough screen, and only when the interface normal coincides with a world axis and the geometry suits an axis-aligned box. For rotated interfaces measure the surface in the real interface's local coordinates, and re-check floating / abnormal interpenetration as well; do not use it to judge the strength of a structural connection. (DSH original: `audit_measure` with `neighbors:true`) |
| Shape drift | Manual check: compare the current mesh with the reference mesh (for example nearest-point distance via `BVHTree.find_nearest` over sampled vertices, in both directions) | Chamfer-type distance ≤ the agreed threshold (default convention ≈ 2.5% of the longest edge). (DSH original: `audit_drift`) |
| Print pre-screen | Manual check: sample wall thickness (ray cast inward along the normals) and the overhang angle against 45°; state the sampling resolution | No samples thinner than `min_mm` and walls OK, with the measurement resolution stated; a threshold below the measurement resolution makes the conclusion untrustworthy. Checking only the active object degrades the result; with several objects test them one by one. This is not a complete manufacturing certification. (DSH original: `print_report` with `min_mm`, `max_angle_deg:45`, `thin_samples_total=0`, `walls_ok=true`) |
| Delivery completeness | Manual check: list the exported files, compute md5 (`hashlib`) of each and of the `.blend`, re-import the export and compare the bounding box in unit-normalised form, confirm textures travel with the package | md5 list complete, unit box normalised, textures included. (DSH original: `deliver_verify`) |
| UV / material | `execute_blender_code`: for each mesh, `obj.data.uv_layers` is non-empty and the UV area of every face is above zero; `obj.material_slots` all filled; procedural material inputs baked where the delivery needs images | A UV layer exists and the number of zero-area UV faces is 0; materials non-empty, procedural items baked. (DSH original: `uv_stats` / `material_scan`) |
| Form | `render_viewport_to_path` or `get_screenshot_of_window_as_image` from **each fixed camera separately** (same size every time) + the numeric world bbox of the objects + a gap measurement between parts where relevant | Size / gap numbers within tolerance; for IoU see below. (DSH original: `qc_render_views` (**one view at a time**) + `audit_measure` + `clear_check`) |

When a result dump is too large, thin it first (print only per-object counts and the worst N objects). (DSH measured 9,176 → 1,148 characters on a 40-object scene with the verdict unchanged.)

**Four convention traps (otherwise you will read the conclusion backwards)**:

- ★ **Three states, not two**: a mesh/scene check ends in `pass` / `fail` / `degraded`.
  **A "not clean" result has two causes**: `fail` (a real defect: look at the non-zero counts) or `degraded` (**not fully checked / cannot be judged**:
  the self-intersection test was skipped or raised an exception, normals could not be judged, a per-shell analysis was too large to run).
  ⇒ When a result is "not clean", **first read which of the two it is and why**: `degraded` needs **a further check** (rerun with the self-intersection test, find out why the normals were undecided),
  and must **not** be treated as "failed" nor as "passed"; an error return and an unfinished analysis are likewise not a pass.
  Do not look only at the aggregate signed volume either: it **adds all the shells together**, and a large positive shell plus a separate small reversed shell can still total a positive number ⇒ look at each shell, and **an undecided normal state never counts as pass** (with no other defect it is `degraded`, with defects it is `fail`).
- The per-axis AABB overlap is a **bbox-level** value (not triangle level).
  It is a rough screen only when the interface normal coincides with a world axis and the geometry suits it; for rotated interfaces you must measure the surface in the real interface's local coordinates.
  A fully enclosed floater can also give positive overlap on all three axes, so combine it with the connectivity and interference checks; an intersection volume is not interface depth and is not structural strength.
- Mesh health reads the **unevaluated** `ob.data`: modifiers that have not been applied do not count; assembly-level checks (bounding boxes, interference, connectivity) use the **evaluated mesh** (`obj.evaluated_get(depsgraph)`). Do not mix the two.
- ★ **A bundle of gates reports only a three-state verdict at the top**: it is "ok" only if **every gate really ran and all passed**.
  **Any gate that was `skipped` or `degraded` ⇒ the bundle is `degraded` (fail takes priority)**: `skipped` = no source configured / the gate does not apply
  (for example the `no_clash` gate of an assembly check was given no objects for both sides), and **skipped ≠ passed**. A default assembly gate run that comes back `degraded` is **correct behaviour**:
  to get a pass you must supply the missing inputs (the objects of each side) or write your own spec; a record of which gates did not run (`coverage.all_gates_ran=false` and `skipped[]` in DSH) is the proof of "which gates were not run".
  Likewise **a true criterion ≠ trustworthy evidence**: when a degrade condition is hit (for example the print check's `min_mm` below the measurement resolution `resolution_mm`) the gate is judged `degraded`, and the actual fields in the echo are the degradation evidence.

## Anti-Goodhart: what "a different computation path" means

The same thing **must not** be re-checked through the path used to build it. The criterion: if the build logic itself has a bug, the conclusion must flip when you change path.

- The builder used `Object.dimensions` (local bbox × scale, **without rotation**) ⇒ verify with the world AABB from `matrix_world @ v.co`;
- The builder used an inner-loop score ⇒ verify by recomputing with an independent script, and do not read the inner loop's best;
- The builder used the exporter's own self-check ⇒ verify by checking md5 and the unit box of the exported files;
- The builder says "looks right" ⇒ the verifier must give **both a number and an image** as evidence (neither alone is enough).

## Subjective gates (only these need a fresh pair of eyes)

"Does it look like the reference image / composition / colour scheme / layout / copy": first obtain numbers (silhouette IoU / section difference) with a same-camera render of the model and a manual mask or overlay against the reference, then draw the conclusion by looking at the images. **At most 2 images**; do not re-render the whole scene; an image in which the subject fills <5% of the frame is invalid and must be retaken. (DSH original: `qc_render_views(ref_path=…)` + `qc_compare`.)

> ⚠ **IoU is only "silhouette overlap in that view"**, a necessary but not sufficient condition. It cannot see: depth/thickness, internal features
> (panel seams / grilles / lights / the position of feature lines), surface tension (how the surface feels), or the other views. And "filling the silhouette" is enough to push it up.
> ⇒ On seeing "IoU 0.9" **do not** conclude pass directly: require at least **a separate value per view** + one feature-line comparison (each part in its own colour, `parts_color` style) +
> a gap measurement (`clear_check` in DSH); if "IoU went up but the image looks worse", judge `unresolved` and say which layer is wrong
> (envelope / station table / feature lines; the "station table" is the table of cross-section stations along the part).

## Output format (fixed 4 lines; delete anything beyond)

```
verdict: pass | fail | unresolved
evidence: <check name + key fields + measured numbers> (1–3 lines, must be reproducible)
failures: <items that do not meet the bar, ≤3: object / field / measured value / threshold>
repro: <a command that reruns to the same conclusion>
```

## Self-check (signs that you have gone off track)

- You are reading `SKILL.md` or `references/modeling-overview.md` ⇒ **stop**, read this file instead;
- You are retelling the build steps ⇒ delete it, keep only the evidence line;
- You are about to "re-check the whole scene from scratch" ⇒ first ask: can you verify only the differences (drift / the change list)?
- You are about to write "should be fine" ⇒ that is `unresolved`, or go and add one more piece of evidence.

## Assembly and delivery gates (the original's v2.6 "current gates"; here as described manual checks)

These rows describe DSH plugin ops that have no direct equivalent in the Blender MCP server. They are kept as descriptions of what a verifier should establish; carry each one out by hand with `execute_blender_code` where you can, otherwise report `unresolved`.

| What is verified | The check (original DSH op in brackets) | Pass criterion |
|---|---|---|
| Whole-assembly all-pairs | Test every pair of parts of the manifest/scope for clash (triangle-pair intersection), containment (one part inside another) and floating, and list the pairs you could not decide (`asm_scan`) | Read the counts of clash / contained / float / unresolved and the verdict; a "hidden_ok" pair is a declared permission, not clipping |
| Assembly gate | Run the clash, containment and floating checks together over the assembly and report a verdict (`asm_gate` / `gate_run`) | Verdict is pass; explain every degraded / skipped / failed item; export is allowed only on pass |
| Assembly repair | Propose repairs first and only then execute them (`asm_repair(policy="safe", dry_run=true)`) | Look at the plan / risk / blocked items first; after executing, rerun the all-pairs check, clash = 0 or explained |
| Assembly delivery | Export (merged if required) with the Blender exporters through `execute_blender_code` (for example `bpy.ops.export_scene.gltf`), and record the manifest and md5 of each file (`asm_export` with `merge=true`) | Manifest + merge record + md5 of each GLB/FBX/OBJ; if the merged export fails its checks, nothing is written |
| Numbers from a reference image | Measure the reference image by hand against a known scale: a pixel-to-millimetre ratio that can be recomputed from two known distances (`img_digest → probe/measure/calib`; see `multiview-calibration.md`) | Without calibration the verdict is `needs_scale`; the px_per_mm can be recomputed; do not guess millimetres |
| Silhouette fitting | Compare the fitted model against the reference outline per view, with sensitivity to the parameters (`shapesolve_solve`) | Best / per-view IoU / sensitivity; **a different path must re-check it**, never accept the objective function as the acceptance |
| Same-camera likeness | Render the model from the same camera and resolution as the reference, then compare (`visualreport_report`) | Three-state verdict; same camera / same resolution; IoU is only a necessary condition of the silhouette |
| Defect / baseline | Deliberately seed known defects and confirm the checks catch them, and compare against a stored baseline (`eval_run`) | capture_rate / missed / false_positive / baseline_pass; a missing dependency gives `degraded`, never a false pass |
| Forced delivery | Run the preflight, checkpoint and delivery stages in order, and refuse to write output when a stage fails (`gate_preflight → gate_checkpoint → gate_deliver`) | A failed gate blocks and writes nothing; `degraded` needs an explicit allow |

> Architecture first: in the original, any "self-written criterion" outside the gates above does not count; the verifier reads only this file + the receipt, does not read SKILL.md, and does not rerun the whole scene for the builder.
