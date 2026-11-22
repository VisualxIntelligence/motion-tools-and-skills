# Blender MCP — notes

**Source:** [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) @ `a5a8acf` (18 Nov 2026), server version 2.3.1. MIT, © 2025 Siddharth Ahuja. Read 22 November 2026. **Nothing copied:** it installs from PyPI with one command, and a copy here would only go stale. The PyPI package was renamed from `blender-mcp` to **`mcp-for-blender`**; old configs still work.

## What it does

Lets Claude drive an open Blender session. A Blender add-on runs a socket server inside Blender (port 9876); the MCP server talks to it and gives Claude these tools:

| Tool | What it does |
|---|---|
| `get_addon_status` | Blender version, add-on match, which asset libraries and generators are switched on. Called first |
| `get_scene_info` | Scene facts as text: objects, positions, sizes, mesh and rig health (quads, tris, non-manifold edges, poles) |
| `execute_blender_code` | Runs Python (`bpy`, `bmesh`) in your live Blender and returns what it prints. The workhorse |
| `look` | Shows Claude the scene as one image: viewport, through the camera, the target from several angles, or a strip of frames over the animation; shading rendered (a quick denoised render in the scene's engine), material, solid, wireframe or x-ray |
| `search_assets`, `import_asset` | Poly Haven (CC0 HDRIs, textures, models), Sketchfab (licences vary per model), Poly Pizza (low-poly) |
| `generate_3d` | One textured model from text or an image via Meshy, Tripo, Hyper3D Rodin or Hunyuan3D, imported into the scene |
| `generate_gaussian_world` | A whole environment from World Labs Marble, imported as Gaussian splats with a rough collision mesh (Blender 5.3+) |
| `open_viewport`, `viewport_*` | An inline viewport panel in clients that support MCP Apps |
| `disable_telemetry`, `record_trajectory_feedback` | Telemetry controls (see below) |

It also serves seven short guides to the agent (bpy, scene, materials, animation, rigging, retopology, level design).

## Installing on the workstation (Windows)

```powershell
winget install --id=astral-sh.uv -e        # then open a new terminal
uvx mcp-for-blender setup                  # finds Claude Desktop / Claude Code etc., installs and enables the add-on
# or by hand:
claude mcp add blender uvx mcp-for-blender
uvx mcp-for-blender install-addon          # then Blender → Preferences → Add-ons → enable "Interface: MCP for Blender"
```

Open Blender (the add-on starts its server on launch; `N` panel → **MCP for Blender** to check), then fully quit and reopen Claude. Pitfalls from upstream's README:

- **`spawn uvx ENOENT`** in Claude Desktop: the GUI app does not see your terminal's PATH. Put uvx's full path in the config (`where uvx`, typically `C:\Users\<you>\.local\bin\uvx.exe`).
- **Pin Python** if uv picks one without wheels: `"args": ["--python", "3.11", "mcp-for-blender"]` with `"env": {"UV_PYTHON_PREFERENCE": "only-managed"}`.
- **One server only:** don't run it from two clients at once.
- Upstream also offers `curl … | sh` and `irm … | iex` one-line installers; the uv route above does the same without piping a script into a shell.

## Pairing it with the Blender skills

[`../../skills/blender-agent-skills/`](../../skills/blender-agent-skills/NOTES.md) is written for this server. Its `blender-core` skill tells Claude to call its tested scripts through `execute_blender_code` (import from the skills folder, call `run()`), to look with `look(mode="angles")`, and to fall back to headless `blender -b` when no MCP server is running. Install both: the MCP server gives Claude hands in Blender, the skills give it the rules and the tools.

## Settings worth setting

| Variable | Default | Use |
|---|---|---|
| `DISABLE_TELEMETRY=true` | off | Stops even the minimal anonymous usage record (install ID, tool name, success, duration) |
| `BLENDER_MCP_SAFE_MODE=1` | off | Checks every script before it runs and blocks file access outside Blender's own save/import/export, running programs, network access and persistent code. Normal modelling, rendering and export still work. It may also block the Blender skills' pattern of importing their scripts from disk (not tested) |
| `BLENDER_HOST`, `BLENDER_PORT` | `localhost`, `9876` | If Blender runs elsewhere or the port is taken |

## Cautions

- **`execute_blender_code` runs arbitrary Python in your open file.** Save first, and keep a backup of anything precious. Safe mode narrows this.
- **Telemetry is opt-in for content, not for usage.** Prompts, code, screenshots and scene data are collected only if you tick the consent box in the add-on preferences; doing so grants the author a perpetual licence to that content (see upstream `TERMS_AND_CONDITIONS.md`). For newsroom or client work leave the box unticked and set `DISABLE_TELEMETRY=true`.
- **Generators cost money.** `generate_3d` and `generate_gaussian_world` use your own API keys (stored in the add-on preferences or `BLENDERMCP_*_API_KEY` variables) or the author's paid Premium plan. Check each generator's terms for commercial use.
- **Asset licences:** Poly Haven is CC0; Sketchfab models carry per-model licences, many not for commercial use. Check before a model goes into a broadcast piece.
- **Generated meshes are dense and triangulated.** Run them through [`../mesh-pipeline/`](../mesh-pipeline/NOTES.md) or the skills' `blender-retopology-uv` and `blender-asset-qa` before rigging, texturing or export.
- **Not tested here:** this session has no Blender window or MCP client to connect. Tool names and settings above are from the source at the commit named.
