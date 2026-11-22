# brief-to-ifc — notes

**Our own skill** (MIT, 22 November 2026). The habit of planning a building as data first and placing it in checked batches comes from Chiang Ning's *prompt-to-bim-model* (P424), which drives Revit through MCP. That file is "All Rights Reserved", so none of its text is used. This version needs no Revit: it writes **IFC4** with [IfcOpenShell](https://ifcopenshell.org) (LGPL-3.0, installed with pip, not copied).

## What it makes

| Input | Output |
|---|---|
| A JSON plan: grid, storeys, column/beam/slab sizes, core, facade glazing ratio, parapet | **`model.ifc`** with the spatial tree (project, site, building, storeys), a structural grid, pad footings, a base slab, columns, beams both ways, floor and roof slabs, core walls, facade walls with real openings filled by windows, and parapets; plus materials and common property sets (`Pset_ColumnCommon`, `Pset_WallCommon`) |
| | **`model.glb`** (optional): every element tessellated with openings cut, Y-up, named `<storey>|<IfcClass>|<name>`, coloured by class; ready for [`../build-sequence-film/`](../build-sequence-film/NOTES.md) |
| | **`report.json`**: storeys and elevations, a count per class, IFC4 schema-validation errors |

## When to use it

- A **massing or test fit as BIM** for a pitch, before any architect's model exists.
- **Repetitive frames** (offices, car parks, residential blocks), which are quicker to describe than to draw.
- A **believable structure** for a film or an explainer.
- As the **plan format** for driving Revit or Archicad through their MCP servers, batch by batch (see [`../../guides/aec-ai-workflows/`](../../guides/aec-ai-workflows/NOTES.md)).

## Requirements

Python 3.10+ with `pip install ifcopenshell numpy trimesh` (IfcOpenShell 0.9 tested; Windows, macOS and Linux wheels).

## Tested here (22 Nov 2026, IfcOpenShell 0.9.0, Python 3.13)

| Test | Result |
|---|---|
| `examples/office-block.json` (5 × 3 grid at 8 m, 6 storeys, core, 45% glazing) | 15 footings, 90 columns, 132 beams, 7 slabs, 52 walls, 144 openings filled by 144 windows, 7 storeys including the roof, grid with 8 axes. **0 schema errors**, re-opened from disk |
| GLB preview | 584 named elements; openings cut; checked in Blender 5.3 (renders) and as the input to `build-sequence-film` |

Not tested: opening the IFC in Revit or Archicad, which are not available here. Open it in [BIMvision](https://bimvision.eu), Bonsai or your BIM tool and check the categories before relying on it.

## Things the build taught

- **Import the API submodules explicitly** in IfcOpenShell 0.9 (`import ifcopenshell.api.root`, `.geometry`, and so on). `ifcopenshell.api.project` is not loaded by `import ifcopenshell.api`.
- **IFC entities do not accept extra Python attributes.** Setting `wall._len` raises "Attribute index out of bounds", so keep your own data beside the entity.
- **Perimeter direction sets the wall face.** Walls drawn anticlockwise with `offset=0` keep their thickness inside the line, so the facade sits on the slab edge.
