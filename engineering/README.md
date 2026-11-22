# Engineering and construction

Skills, tools and guides for **architecture, engineering and construction (AEC)** work with AI agents: BIM models from briefs, construction-sequence films, connecting Claude to Revit, Archicad and Blender, and reconstructing buildings from photos and video. This category was started on 22 November 2026 for **MAKEENA** projects (AI video for GCC real-estate developers), where the subject is usually a building.

Everything here is a **study or a visualisation**. Nothing gives engineering, code-compliance or construction-programme advice, and every output that shows structure or sequence should say so on screen.

## Skills

| Skill | Makes | Stack | Needs |
|---|---|---|---|
| [`build-sequence-film`](skills/build-sequence-film/NOTES.md) | A film of a building going up element by element in build order (foundations, frame by storey, envelope behind it, roof), one isometric take, line drawing that warms into colour; 16:9 or 9:16, deterministic frames | three.js page with `renderFrame(t)`, Playwright, ffmpeg | Node 20+, ffmpeg, Chromium; a GLB with one named mesh per element |
| [`brief-to-ifc`](skills/brief-to-ifc/NOTES.md) | A brief written as numbers → a native IFC4 model (storeys, grid, footings, columns, beams, slabs, core, facade with windows in real openings, parapets) that opens in Revit and Archicad, plus a named GLB for films; schema-validated | Python, IfcOpenShell | Python 3.10+, `pip install ifcopenshell numpy trimesh` |

Both skills install like the others: copy the folder into `~/.claude/skills/` (see [`../skills/README.md`](../skills/README.md#installing-a-skill)). Used together, they go from a brief to a build film in minutes:

```bash
python skills/brief-to-ifc/scripts/brief_to_ifc.py plan.json out/model.ifc --glb out/model.glb
cp -r skills/build-sequence-film/template film && cp out/model.glb film/model.glb && cd film
npm install && npx playwright install chromium
node render.mjs timeline && node render.mjs stills && node render.mjs film
```

## Guides

| Guide | What it covers |
|---|---|
| [`guides/aec-ai-workflows/`](guides/aec-ai-workflows/NOTES.md) | Chiang Ning's nine AEC visualisation workflows: build film, prompt to BIM, building by prompt, timber gridshell, live structure check, model to cinematic film, photo to model, phone clip to model, showcase reel. They are summarised in our words and linked, not copied ("All Rights Reserved"). Also the official and community MCP servers for Revit and Archicad, and the safety line for structural tools |

## Elsewhere in the repo

- [`../skills/blender-agent-skills/`](../skills/blender-agent-skills/NOTES.md): `blender-environment-kits`, `blender-time-of-day`, `blender-weather-fx`, `blender-lighting-lookdev` and the `unreal` export presets, for photoreal building shots.
- [`../tools/blender-mcp/`](../tools/blender-mcp/NOTES.md): Claude in a live Blender, the open-source route to "building by prompt".
- [`../tools/mesh-pipeline/`](../tools/mesh-pipeline/NOTES.md): code-CAD props, mesh cleanup and LODs for heavy models.
- [`../docs/guides/blender-3d-toolchain/`](../docs/guides/blender-3d-toolchain/NOTES.md): Building Tools (a Blender add-on for quick buildings) and the rest of the 3D toolchain.
- [`../skills/3d-product/`](../skills/3d-product/NOTES.md): measured gates and product-film craft that transfer to architectural films.
