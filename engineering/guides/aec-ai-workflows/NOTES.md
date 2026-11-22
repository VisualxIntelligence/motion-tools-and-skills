# AI workflows for architecture, engineering and construction — notes

Read 22 November 2026. This guide starts from **Chiang Ning's free "8 AI skills for 3D visualisation" pack** (plus a bonus showcase-reel skill), published at [chiangning.net/resources/showcase-reel](https://www.chiangning.net/resources/showcase-reel). Chiang Ning is a Melbourne architect and project manager; each skill comes from one of his public project films (P402–P430).

**Nothing from the pack is copied here.** Every file ends "Copyright 2026 Stanton Dahl Architects. All Rights Reserved.", and this repo is public. Download the skills from the links below for your own use. What follows is our own summary of each workflow, the tools in this repo that do the same job, and what is still missing. Two of the workflows now have our own tested skills: [`build-sequence-film`](../../skills/build-sequence-film/NOTES.md) and [`brief-to-ifc`](../../skills/brief-to-ifc/NOTES.md).

## The nine workflows

| Pack skill (link) | What it does | Software it needs | In this repo |
|---|---|---|---|
| [isometric-build-film](https://www.chiangning.net/articles/showcase-reel/skill-pack/isometric-build-film/SKILL.md) | A model goes up in build order in one isometric take, line drawing first, colour at the end, rendered from a WebGL page | three.js, headless Chrome, ffmpeg | **Our own skill:** [`build-sequence-film`](../../skills/build-sequence-film/NOTES.md) |
| [prompt-to-bim-model](https://www.chiangning.net/articles/showcase-reel/skill-pack/prompt-to-bim-model/SKILL.md) | A brief becomes a JSON plan, then native Revit elements placed through a Revit MCP server in checked batches | Revit + a Revit MCP server | **Our own skill without Revit:** [`brief-to-ifc`](../../skills/brief-to-ifc/NOTES.md) (IFC4 via IfcOpenShell, opens in Revit and Archicad). For live Revit, see the MCP table below |
| [building-by-prompt](https://www.chiangning.net/articles/showcase-reel/skill-pack/building-by-prompt/SKILL.md) | Design by conversation: one change per prompt in the live model, read back after each, with a decisions log and a final rebuild script | Blender, Archicad or Revit with an MCP server | Blender: [`tools/blender-mcp/`](../../../tools/blender-mcp/NOTES.md) + [`skills/blender-agent-skills/`](../../../skills/blender-agent-skills/NOTES.md). The pack's habits are worth copying in spirit: read the model back every ~10 changes, and keep a decisions file |
| [image-to-timber-shell](https://www.chiangning.net/articles/showcase-reel/skill-pack/image-to-timber-shell/SKILL.md) | A concept image of a curved timber roof becomes a parametric surface, a member grid and timber framing in Revit, with a member list | Python, Revit + MCP | Not yet. The surface-and-grid part is plain Python (numpy) and could write IFC members with the same approach as `brief-to-ifc` |
| [live-structure-check](https://www.chiangning.net/articles/showcase-reel/skill-pack/live-structure-check/SKILL.md) | A one-page browser tool: form sliders drive a 3D frame model, re-solved on every change, members coloured by utilisation | Claude Code; a frame solver written for the page | Not added (see the caution below) |
| [model-to-cinematic-film](https://www.chiangning.net/articles/showcase-reel/skill-pack/model-to-cinematic-film/SKILL.md) | Render first and last frames of each shot from the real model in Blender, then let an AI video model fill only the motion, so the building cannot change | Blender, a first/last-frame video model (Seedance in the pack) | Blender side: [`skills/blender-agent-skills/`](../../../skills/blender-agent-skills/NOTES.md) (`blender-lighting-lookdev`, `blender-rendering`, `blender-time-of-day`). Video side: any first/last-frame model on Higgsfield or similar |
| [photo-to-3d-model](https://www.chiangning.net/articles/showcase-reel/skill-pack/photo-to-3d-model/SKILL.md) | One image of a house becomes a scripted, measured model: all dimensions in one parameter block, one named object per element in build order, checked by overlay | Blender (SketchUp export optional) | Partly: [`tools/mesh-pipeline/prop_build123d.py`](../../../tools/mesh-pipeline/prop_build123d.py) shows the "all numbers in one block" pattern; `build-sequence-film` uses the named-elements result |
| [phone-clip-to-model](https://www.chiangning.net/articles/showcase-reel/skill-pack/phone-clip-to-model/SKILL.md) | A walk-past phone video becomes a measured model: COLMAP solves the cameras, scale comes from a known size, the model is scripted in Blender and overlaid on the footage | COLMAP, Blender | Not yet. COLMAP installs as `pip install pycolmap` (4.2 at the time of writing) |
| [showcase-reel](https://www.chiangning.net/articles/showcase-reel/skill-pack/showcase-reel/SKILL.md) (bonus) | A 30 s portfolio reel: your films played on a phone-and-tablet photo mock-up with a scrolling playlist, CRT switches and a code-made beat-matched score | Canvas, headless Chrome, ffmpeg, numpy | The method matches our time-pure `renderFrame(t)` pages ([`docs/techniques.md`](../../../docs/techniques.md)). Its referenced helper scripts are not published with the pack |

### Ideas from the pack worth keeping, in our words

- **Model as truth, AI for look.** Render anchor frames from the real model; let a video model fill only motion between frames it cannot change. If a shot drifts, shorten it or add a middle anchor.
- **Plan as data before the tool.** Plan as data (levels, grids, elements) before anything goes into Revit. Fix the plan and re-run a batch, never hand-patch halfway. Keep batches to a few hundred elements and save before each.
- **One parameter block.** Put every dimension in one block at the top of the script, mark measured versus assumed values, and overlay the model on the reference to check it.
- **Line first, colour last.** In a build film, start with line drawing and add colour only at the end, so the eye follows the sequence rather than the materials.
- **Scale is the weak point of photo and video reconstruction.** Check it against a second measurement.

## Connecting Claude to BIM tools (Nov 2026)

| Tool | Server | Notes |
|---|---|---|
| Revit 2027 | **Autodesk's Revit Public MCP Server** (tech preview) | Official. Download it from your Autodesk account under Revit 2027 entitlements; it configures Claude Desktop automatically. **Read-only**, by design: seven tools (running instances, query model, element data, select, zoom, open view, export view). Autodesk says write tools will come in a separate server |
| Revit 2023–2027 | Community servers: [mcp-servers-for-revit](https://github.com/LuDattilo/revit-mcp-server) (fork), [bimwright/rvt-mcp](https://github.com/bimwright/rvt-mcp), [ArchSmarter](https://github.com/kilkellym/ArchSmarterRevitMcpServer), [revit-claude-mcp](https://github.com/IbrahimFahdah/revit-claude-mcp), others | Read **and write**, through a Revit add-in plus a local server (.NET and Node or Python). Not reviewed here: read the code and the licence before installing. They run inside Revit with full model access, so save first and work on a copy |
| Archicad 30 | **Graphisoft's Archicad Public MCP Server** | Official, built in; Collaborate and Max subscriptions only. Configured as a Node app in `claude_desktop_config.json` |
| Archicad 27+ | [archicad-mcp](https://pypi.org/project/archicad-mcp/) (`uvx archicad-mcp`) and other servers over the **Tapir** add-on | Community; Tapir's JSON commands do the work |
| Blender | [Blender MCP](../../../tools/blender-mcp/NOTES.md) + **Bonsai** (IfcOpenShell's BIM add-on for Blender) | Open source. Bonsai edits IFC natively, and IfcOpenShell is what `brief-to-ifc` uses |
| Any IFC tool | [`brief-to-ifc`](../../skills/brief-to-ifc/NOTES.md) | No server needed: write IFC, then open or link it |

## Caution: structure and safety

Concept-stage structural tools are useful for comparing options and dangerous when mistaken for engineering. Any frame check, member sizing or utilisation colour made with an agent must say on screen that:
- it is **comparative and concept-stage only**;
- connections, buckling, second-order and dynamic effects and codes not modelled are out of scope;
- **a registered engineer signs off the real design**.

The pack takes the same line. Nothing in this category gives engineering, code-compliance or construction-programme advice.

## For MAKEENA

These workflows map directly onto films for GCC real-estate developers:
- **Build-sequence films** for launches and investor decks (`build-sequence-film`, 16:9 and 9:16).
- **Quick BIM massing from a brief** for a pitch model, or to give a film a believable structure (`brief-to-ifc`).
- **Photographic shots that keep the real geometry** (anchor frames from Blender, motion from a video model).
- **Context models from a walk-past clip** for sites without drawings (COLMAP route).
