# mesh-pipeline — notes

**Our own scripts** (MIT, 22 November 2026) for getting a 3D asset from "generated or modelled" to "clean, light and ready to animate", **outside Blender**: on the command line, in batch, or called by an agent. They wrap open-source libraries reviewed in the [Blender and 3D toolchain guide](../../docs/guides/blender-3d-toolchain/NOTES.md); none of those libraries is copied here.

| Script | Step | Built on | What it does |
|---|---|---|---|
| [`tripo_generate.py`](tripo_generate.py) | Generate | Tripo Python SDK 1.x (MIT), paid API | Text or image → textured GLB; prints credits before and after and writes a JSON report |
| [`prop_build123d.py`](prop_build123d.py) | Model | build123d (Apache-2.0) | Worked example of a parametric hard-surface prop in code: filleted crate with panel recesses, hand-hold slots and a separate lid → STEP, GLB (metres, named parts) and STL |
| [`mesh_clean.py`](mesh_clean.py) | Clean | PyMeshLab (GPL-3.0) | Merge, de-duplicate, repair non-manifold geometry, drop floating crumbs, close holes, optional decimation, re-orient, normals; JSON report before/after |
| [`uv_unwrap.py`](uv_unwrap.py) | UV | xatlas (MIT) via the `xatlas` Python binding, trimesh | Automatic charts and packed atlas for meshes with no usable UVs; JSON report (charts, atlas size, fill) |
| [`lods.mjs`](lods.mjs) | LODs + export | glTF-Transform (MIT), meshoptimizer (MIT) | A LOD chain from one GLB (`_lod0` … `_lodN`), keeping named nodes; optional meshopt compression; JSON report with the triangle ratio actually reached |

A typical chain for an AI-generated prop headed to three.js, HyperFrames or Unreal:

```bash
python tripo_generate.py --image ref.png gen/                        # or Blender MCP generate_3d, or any GLB
python mesh_clean.py gen/model.obj clean.obj --faces 40000 --hole 200  # convert GLB → OBJ first (trimesh or Blender)
python uv_unwrap.py clean.obj clean_uv.glb --resolution 2048          # only if it has no usable UVs
node lods.mjs clean_uv.glb lods/ --ratios 1,0.5,0.25,0.1 --error 0.01 --compress
# check: blender -b … skills/blender-agent-skills/skills/blender-asset-qa/scripts/qa_check.py and review_shots.py
```

For the final web export, one command does the rest (see the cautions below):

```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 2048 \
    --join false --flatten false --palette false        # keep named, separately animatable parts
```

## Installing

```bash
pip install pymeshlab xatlas trimesh numpy build123d "tripo3d>=1,<2"   # Python 3.11+, tested on 3.13
npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
```

- **Linux:** PyMeshLab also needs the system OpenGL library (`apt install libopengl0`); without it every filter and file format fails to load, with a misleading "Unknown format for load: obj".
- **Windows:** PyMeshLab, xatlas and build123d's OpenCascade all ship Windows wheels (checked for Python 3.13), so pip is enough.

## Tested here (22 Nov 2026, Linux, Python 3.13, Node 22)

| Test | Result |
|---|---|
| `mesh_clean.py` on a deliberately broken sphere (81,294 faces, 803 non-manifold edges, 500 duplicate faces, a floating crumb, a 142-edge hole) | **Watertight**: 1 component, 0 non-manifold edges or vertices, 0 holes, 20,004 faces |
| `uv_unwrap.py` on that result | 93 charts, UVs in 0–1, 59% atlas fill; vertices 10,004 → 11,575 (seam splits) |
| `lods.mjs` on that result, ratios 1 / 0.5 / 0.25 / 0.1 | 20,004 / 10,002 / 4,994 / 2,000 triangles; 354 / 191 / 103 / 45 KB |
| `prop_build123d.py` | Valid solids, 400 × 400 × 300 mm; GLB 0.40 m wide with `crate_body` and `crate_lid` meshes; STL watertight (MeshLab); renders checked in Blender 5.3 |
| `tripo_generate.py` | Argument handling, SDK 1.0.0 signatures and the API round trip up to authentication ("Invalid API key"). **No generation was run** (no key) |
| Blender check of the outputs (`blender-asset-qa`, Blender 5.3 `bpy`) | Clean sphere LOD0 passes; the 10% LOD and the raw code-CAD GLB fail, for the reasons below |

## Things the tests taught

- **A selection silently limits later filters in PyMeshLab.** Hole closing selects the new faces, and decimation then works on that selection only, so it did nothing. `mesh_clean.py` clears the selection after each hole-closing pass.
- **Repairs and decimation create new small defects.** Decimation pinched two non-manifold vertices and repairs opened a 7-edge hole; `mesh_clean.py` repairs and closes holes again at the end. Its report tells you what is left.
- **Aggressive LODs break manifoldness.** At 10% with `--error 0.01` the sphere had 5 non-manifold edges and 6 edges with flipped winding. Fine for a distant LOD, not for a hero mesh: keep the error tighter, or run `mesh_clean.py` on that level.
- **Hard-surface CAD meshes barely simplify.** The crate reached 80% and 74% of its triangles at ratios 0.5 and 0.2 with `--error 0.001`. Its flat faces are already economical. LODs pay off on scans and generated meshes, not on CAD props.
- **Code-CAD GLBs need new UVs and materials.** build123d writes one primitive per B-rep face with that face's surface parameters as UVs: 100% overlapping and mostly outside 0–1, with no material. Run `gltf-transform join` (or `lods.mjs`) to merge primitives, `uv_unwrap.py` before any texturing or baking, and assign materials in Blender or three.js.
- **glTF-Transform logs to stdout.** Its info lines ("prune: Removed…") broke the JSON report until `lods.mjs` set its logger to warnings only. Do the same in any script that prints machine-readable output.
- **`gltf-transform optimize` defaults are for single static models.** It joins and flattens meshes, merges materials into palettes and simplifies, which destroys the named parts a motion piece animates. Pass `--join false --flatten false --palette false` (and `--simplify false` for hero assets).
- **xatlas treats `--resolution` as a target.** The atlas came out about 2,400 px for a 2,048 request. UVs are normalised either way; only the padding (in atlas pixels) changes.

## Tools upstream that these scripts do not wrap

- **AutoRemesher** (MIT) has a headless mode for quad remeshing: `autoremesher --input in.obj --output out.obj --report r.txt --target-quads 20000 --sharp-edge 90 --adaptivity 1.0`. Download the release build (Windows zip, macOS dmg, Linux AppImage); it was not built here, because it needs Qt 5 and TBB.
- **gltfpack** (meshoptimizer's CLI, also `npm i gltfpack`): one-shot simplify and compress, `gltfpack -i in.glb -o out.glb -si 0.5 -cc -tc` (`-tc` = KTX2/Basis textures, `-slb` locks borders). `lods.mjs` uses the same simplifier with more control over names and per-level reports.
- **Material Maker** renders `.ptex` materials to texture sets from the command line: `material_maker.exe --export -t "Unreal/Unreal Engine 5" -o outdir --size 2048 file.ptex` (read from its `start.gd`; not run here) (targets include Blender, Godot and Unreal). It is a Godot app, so it needs a GPU session.
- **ArmorPaint** (built from source) exports textures headless: `armorpaint project.arm --background --export-textures png "<preset>" outdir` (read from its `args.c`; not run here), runs C scripts with `--script`, and now serves an open project to agents over MCP with `--mcp`. That MCP mode is in the development source (Nov 2026); the paid binaries may not have it yet.
- **Blender itself** does all of these steps inside a scene: see [`../../skills/blender-agent-skills/`](../../skills/blender-agent-skills/NOTES.md) (`blender-retopology-uv`, `blender-game-optimization`, `blender-export-pipelines`) and [`../tidewater-asset-pipeline/`](../tidewater-asset-pipeline/NOTES.md) (batch decimation to a budget).

## Licences

These scripts are MIT. They import PyMeshLab (GPL-3.0) and build123d (Apache-2.0) at run time but do not include them, so nothing here is a copy of GPL code; if you ever bundle PyMeshLab with them in a distributed product, that bundle falls under the GPL.
