---
name: brief-to-ifc
description: Turn a building brief into a native IFC4 BIM model without Revit - write the brief as numbers (grid, storeys, member sizes, core, facade glazing, roof), generate real IFC elements (storeys, grid, footings, columns, beams, slabs, walls with window openings) with IfcOpenShell, validate the schema, and export a named GLB for films. Use for early massing or test fits as BIM, "prompt to BIM", a model to open in Revit, Archicad or Bonsai, or a quick building for a build-sequence film.
---

# Brief to IFC

Claude never draws the building. It writes the brief as a small JSON plan, the script turns the plan into IFC elements, and every change is an edit to the plan followed by a re-run.

## 1. Write the brief as numbers

Ask only for what is missing, and state every assumption you make. Start from `examples/office-block.json`.

| Key | Meaning |
|---|---|
| `grid.x`, `grid.y` | Grid line positions in metres (bays) |
| `storeys` | `count`, typical `height`, `ground_height` |
| `structure` | `column` [w, d], `beam` [w, depth], `slab` thickness, `slab_overhang`, `base_slab`, `pad` [x, y, depth], optional `core` {`x`, `y`, `wall`} |
| `envelope` | `wall` thickness, `glazing_ratio` (0–1), `bay` (window spacing, m), `material` |
| `roof` | `parapet` height |

Show the plan to the person before building. It is quicker to fix a number than a model.

## 2. Build and check

```bash
pip install ifcopenshell numpy trimesh
python scripts/brief_to_ifc.py plan.json out/model.ifc --glb out/model.glb --report out/report.json
```

The report lists the storeys with their elevations, a count per IFC class and the schema-validation errors (the run fails if there are any). Read it back to the person in numbers, for example: "6 storeys to 22.5 m, 90 columns, 132 beams, 144 windows, 0 schema errors".

Then look at the model:
- render the GLB with `../../../skills/blender-agent-skills/` (`blender-asset-qa/scripts/review_shots.py`);
- or open the IFC in Bonsai (Blender), BIMvision or any IFC viewer.

## 3. Change it by changing the plan

Never hand-edit the IFC between runs. Change the JSON and re-run, so the model always matches its plan. Keep the plan file with the model.

## 4. Take it further

- **Into Revit or Archicad:** link or open the IFC. It arrives as native categories: walls, floors, columns, framing and windows.
- **Into a film:** feed `model.glb` to `../build-sequence-film/`. The node names (`L03|IfcColumn|C-A1`) give it the build order.
- **Into a live BIM tool instead:** see the BIM MCP servers in `../../guides/aec-ai-workflows/NOTES.md` (Revit and Archicad). The plan JSON can drive those too, batch by batch.

## Limits

- **A massing and coordination study, not a design.** Member sizes are whatever the plan says. Nothing is checked by an engineer, against a building code or for fire, access or daylight. Say so on every output.
- **Rectangular footprint on an orthogonal grid.** Curved or angled buildings need more code, or a BIM tool.
- **No other trades.** No stairs, doors, MEP, spaces or zones yet; add them to the script when needed.
