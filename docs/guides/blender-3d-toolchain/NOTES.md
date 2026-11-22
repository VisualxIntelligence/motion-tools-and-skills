# Claude × Blender and the 3D asset toolchain — notes

Fourteen open-source projects from a "Claude × Blender" list, read on 22 November 2026, with what each is for, whether it still works, and what this repo took from it. They cover the route from "an idea or a reference" to "a clean, light model ready to animate in Blender, Unreal, three.js or HyperFrames".

## At a glance

| # | Project | Step | Licence | Last commit | Status | In this repo |
|---|---|---|---|---|---|---|
| 01 | [Blender MCP](https://github.com/ahujasid/blender-mcp) | Claude drives Blender | MIT | 18 Nov 2026 | Active; package renamed `mcp-for-blender` | Setup notes: [`tools/blender-mcp/`](../../../tools/blender-mcp/NOTES.md) |
| 02 | [Blender Skills](https://github.com/EL4CTEO/blender-skills) | Claude knows Blender | MIT | 21 Nov 2026 | Active; tested on 5.3 | **Copied:** [`skills/blender-agent-skills/`](../../../skills/blender-agent-skills/NOTES.md) |
| 03 | [build123d](https://github.com/gumyr/build123d) | Model props in code | Apache-2.0 | 21 Nov 2026 | Active | Worked example: [`prop_build123d.py`](../../../tools/mesh-pipeline/prop_build123d.py) |
| 04 | [Building Tools](https://github.com/ranjian0/building_tools) | Buildings in Blender | MIT | 16 May 2025 | Stale; partly works in 5.3 (below) | Notes only |
| 05 | [Tripo for Blender](https://github.com/Tripo-Developer/tripo-3d-for-blender) | Generate in Blender | MIT | 6 Nov 2025 | **Probably broken** since 31 Oct 2026 (below) | Notes only |
| 06 | [Tripo Python SDK](https://github.com/Tripo-Developer/tripo-python-sdk) | Generate from a script | MIT | 15 Oct 2026 | Active; 1.0 moved to API v3 | Wrapper: [`tripo_generate.py`](../../../tools/mesh-pipeline/tripo_generate.py) |
| 07 | [AutoRemesher](https://github.com/huxingyi/autoremesher) | Automatic quad retopology | MIT | 7 Oct 2026 | Active; has a headless CLI | Notes only (release builds) |
| 08 | [RetopoFlow](https://github.com/CGCookie/retopoflow) | Hand retopology in Blender | GPL-3.0 | 18 May 2026 | Active (v3.4.11, Blender 4.2+) | Notes only |
| 09 | [PyMeshLab](https://github.com/cnr-isti-vclab/PyMeshLab) | Mesh cleanup and repair | GPL-3.0 | 3 Feb 2026 | Active (2025.7 release) | Wrapper: [`mesh_clean.py`](../../../tools/mesh-pipeline/mesh_clean.py) |
| 10 | [xatlas](https://github.com/jpcy/xatlas) | Automatic UVs | MIT | 26 Jul 2022 | Finished, stable | Wrapper: [`uv_unwrap.py`](../../../tools/mesh-pipeline/uv_unwrap.py) |
| 11 | [Material Maker](https://github.com/RodZill4/material-maker) | Procedural PBR materials | MIT | 24 Oct 2026 | Active (Godot app) | Notes only |
| 12 | [ArmorPaint](https://github.com/armory3d/armorpaint) | PBR texture painting | zlib (source); binaries paid | 20 Nov 2026 | Active; new `--mcp` mode | Notes only |
| 13 | [meshoptimizer](https://github.com/zeux/meshoptimizer) | Simplify and compress for LODs | MIT | 21 Nov 2026 | Active | Used by [`lods.mjs`](../../../tools/mesh-pipeline/lods.mjs) |
| 14 | [glTF-Transform](https://github.com/donmccurdy/glTF-Transform) | Final glTF optimisation | MIT | 16 Oct 2026 | Active (v4.5) | Used by [`lods.mjs`](../../../tools/mesh-pipeline/lods.mjs) |

## The route, and which tool to use

1. **Drive Blender with Claude:** Blender MCP (live session) plus the Blender skills (rules and tested scripts). Without MCP, the skills run Blender headless.
2. **Get a model.**
   - **Hard-surface props with exact sizes:** build123d (or Blender hard-surface modelling per the skills).
   - **Buildings for a set:** Building Tools in Blender, or `blender-environment-kits`.
   - **Anything from text or a picture:** Tripo through the SDK script or Blender MCP's `generate_3d`.
3. **Clean it:** `mesh_clean.py` (PyMeshLab) for generated and scanned meshes; `blender-asset-qa` to check.
4. **Retopologise if it will deform or be close to camera.**
   - **Automatic quads:** AutoRemesher or the skills' `auto_retopo` (QuadriFlow).
   - **By hand:** RetopoFlow inside Blender.
5. **UVs:** `uv_unwrap.py` (xatlas) for automatic atlases; Blender for seams placed by hand.
6. **Textures:** Material Maker for procedural materials (texture sets per engine); ArmorPaint for painting on the model; the skills' `blender-texturing` and `blender-texture-baking` inside Blender.
7. **LODs and export:** `lods.mjs` (meshoptimizer via glTF-Transform), then `gltf-transform optimize` for web; the skills' `blender-export-pipelines` for Unreal FBX and USD.

## Notes per project

**01 Blender MCP.** Fifteen tools, the important ones being `execute_blender_code`, `get_scene_info` and `look` (Claude sees the scene from several angles or as a quick render). Asset search covers Poly Haven, Sketchfab and Poly Pizza. Generation runs through Meshy, Tripo, Hyper3D Rodin, Hunyuan3D and World Labs (Gaussian-splat worlds). Content telemetry is opt-in, but a minimal usage record is sent unless `DISABLE_TELEMETRY=true`. Details in [`tools/blender-mcp/`](../../../tools/blender-mcp/NOTES.md).

**02 Blender Skills.** The strongest find in this batch. Its 28 skills have tested scripts that print JSON, and a 5.x API table that stops the model writing Blender 3/4 code. 77 of 79 of its tests passed here against Blender 5.3.

**03 build123d.** Python code-CAD on OpenCascade: true fillets, clean booleans, STEP/GLB/STL out, and parametric rebuilds. [`skills/3d-product/`](../../../skills/3d-product/NOTES.md) already rates B-rep code-CAD as the method that works for hardware. Two things the example taught:
- Pass the model's own units to `export_gltf`, which defaults to millimetres; it converts to metres for you.
- The GLB comes out as one primitive per face, with B-rep UVs that overlap. Re-UV and join it before texturing.

**04 Building Tools.** A Blender add-on: floorplan → floors → windows, doors, balconies, stairs, roof, with material groups.
- **What worked in Blender 5.3 (headless):** it registered; floorplan, floors and windows returned `FINISHED`.
- **What didn't:** the windows did not show in the render, and the hip roof failed (`IndexError` in `extrude_and_outset`) on our selection.
- **A crash to avoid:** its error handler opens a popup, which crashes Blender in background mode.
- **Verdict:** last updated May 2025 and declared "Blender 4.0 compatible". Try it interactively in the UI before relying on it; for anything beyond a quick block-out, `blender-environment-kits` or hand modelling is safer.

**05 Tripo for Blender.** The official add-on pins a Tripo SDK commit from October 2025 (the 0.x line). Tripo shut its v2 API on 31 October 2026 and says 0.x releases stop working then, so the add-on is very likely broken until it is updated. It was not tested (no key). Use the SDK 1.x script, or Blender MCP's Tripo generator, instead.

**06 Tripo Python SDK.** Version 1.0 (October 2026) moved everything to API v3:
- **Inputs:** text, image or multi-view.
- **Mesh tools:** smart low-poly, quad output, Smart UV, segmentation.
- **Rigging:** auto-rig and retarget.
- **Other outputs:** image → Gaussian splat or depth.
Every call costs credits (Smart UV, for example, is 20). [`tripo_generate.py`](../../../tools/mesh-pipeline/tripo_generate.py) reports the credits each run uses.

**07 AutoRemesher.** MIT (Dust3D project). Version 1.1 replaced Geogram with its own quad parameteriser and added `--anisotropy`. Its headless CLI (`--input --output --target-quads --sharp-edge --adaptivity --report`) makes it scriptable. Release builds exist for Windows, macOS and Linux; building from source needs Qt 5 and TBB.

**08 RetopoFlow.** An interactive retopology toolset (Contours, PolyStrips, PolyPen, Strokes, Patches, Loops, Knife, Tweak, Relax) for Blender 4.2+, as an extension. It is for an artist's hands, not for an agent, and it is GPL-3.0. Install it from its releases or Blender's extensions platform when you need hand-made topology for a character or a hero object.

**09 PyMeshLab.** MeshLab's filters from Python. **GPL-3.0**, so it is used, not copied. On Linux it needs `libopengl0`.

**10 xatlas.** C++ UV atlas generator (also inside Godot and other engines). The repo has not changed since 2022, which reflects a finished library. Use it from Python through the `xatlas` package on PyPI (a separate MIT binding).

**11 Material Maker.** A node-based procedural material editor built on Godot.
- **Export targets:** Blender, Godot, Unity (3D, URP, HDRP) and Unreal 4/5.
- **Batch rendering:** a command-line `--export` renders `.ptex` graphs to texture sets.
- **Library:** an online material library.
Free (MIT); good for tileable surfaces (concrete, metal, fabric) for sets.

**12 ArmorPaint.** Substance-style painting on the model, with layers, masks, baking and node materials.
- **Licence:** the source is zlib-licensed, but ready-made binaries are paid (to fund the project). Building from source is free and needs clang.
- **Headless use:** the development source has `--background --export-textures`, C scripting with `--script`, and an **`--mcp` mode** that serves an open project to agents (`reference`, `step`, `run`, `restore` and `play` tools).
Worth watching as the first texture painter with a built-in MCP server.

**13 meshoptimizer.** The standard simplifier and GPU-friendly compressor. Use it through `gltfpack` (CLI, also on npm) or glTF-Transform. In our tests it took a 20k-triangle mesh to exact ratios. Error limits hold back hard-surface meshes.

**14 glTF-Transform.** The scriptable glTF toolkit (CLI and JS API): weld, simplify, join, prune, meshopt/Draco, WebP/AVIF/KTX2 textures. Watch its `optimize` defaults: they join, flatten and palette, which merges the named parts a motion piece animates. See the cautions in [`tools/mesh-pipeline/`](../../../tools/mesh-pipeline/NOTES.md).

## Relation to what was already here

- [`tools/tidewater-asset-pipeline/`](../../../tools/tidewater-asset-pipeline/NOTES.md) already decimates glTF to a triangle budget inside Blender. `lods.mjs` does LOD chains without Blender.
- [`starters/dioramas/scripts/optimize.mjs`](../../../starters/dioramas/scripts/optimize.mjs) already runs a glTF-Transform weld, simplify, WebP and meshopt pass for its three.js pages.
- [`skills/3d-product/`](../../../skills/3d-product/NOTES.md) covers the full product-film pipeline in Blender. The new Blender skills cover the per-task rules underneath it, and the two work together.
- [`docs/reference-only.md`](../../reference-only.md) §8 notes that the dsh-blender-plugin's add-on is a renamed derivative of Blender MCP with leftovers; use Blender MCP itself.
