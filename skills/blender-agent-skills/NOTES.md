# blender-agent-skills — notes

**Source:** [EL4CTEO/blender-skills](https://github.com/EL4CTEO/blender-skills) @ `1a1cc6c` (21 Nov 2026, release 1.3.3). MIT, © 2026 EL4CTEO ([LICENSE](LICENSE)). Copied 22 November 2026.

## What it is

**28 Agent Skills that teach Claude to drive Blender 5.2 LTS and 5.3 properly**, from modelling to delivery. Each skill is a `SKILL.md` with the rules and numbers for one job, plus tested `bpy` scripts that do the heavy lifting and print JSON. `blender-core` is the entry point: it routes to the right skill, says how to run code (live through Blender MCP, or headless with `blender -b`), lists the 5.x API changes that break older tutorials and model memory, and makes the agent verify with numbers and pictures before saying "done".

| Area | Skills (scripts) |
|---|---|
| Start | `blender-core` (`run_in_blender.py`, `env_report.py`; 5.x API table, bpy patterns) |
| Modelling | `blender-scene-setup` (`scene_audit`), `blender-hardsurface-modeling` (`apply_stack`), `blender-sculpting` (`sculpt_ops`), `blender-geometry-nodes` (`gn_builder`: node trees from JSON) |
| Surfaces | `blender-retopology-uv` (`auto_retopo`, `uv_pack`, `texel_density`), `blender-pbr-materials` (`build_pbr_material`), `blender-texturing` (`smart_material`, `decal`), `blender-texture-baking` (`bake_maps`) |
| Characters | `blender-character-rigging` (`rigify_build`, `bind_mesh`, `rig_check`, `stress_poses`), `blender-facial-shapekeys` (ARKit 52, visemes), `blender-animation` (`retarget`, `loop_check`, `bake_action`), `blender-clothing`, `blender-hair-grooming` |
| Look | `blender-lighting-lookdev` (`turntable`), `blender-rendering` (`render_batch`), `blender-stylized-npr` (`toon_setup`), `blender-time-of-day` (`scene_mood`), `blender-weather-fx` (`precipitation`, `surface_weather`, `lightning`) |
| Worlds and effects | `blender-environment-kits` (`terrain`, `scatter`, `kit_check`), `blender-simulation` (`sim_setup`) |
| Delivery | `blender-game-optimization` (`make_lods`, `mesh_stats`), `blender-export-pipelines` (`export_asset`: Unreal, Unity, Godot, web, USD, Roblox presets), `blender-video-editing` (`vse_edit`, `track_camera`) |
| Checks and automation | `blender-asset-qa` (`qa_check`: z-fighting, floating parts, flipped normals, non-manifold, UV overlap, empty material slots, sRGB data maps; `review_shots`: contact sheets), `blender-pipeline-automation` (`batch_process`), `blender-addon-development`, `blender-workflow-recipes` (end-to-end playbooks) |

## When to use it

- **Any Blender work driven by Claude**, live or headless. It complements [`../3d-product/`](../3d-product/NOTES.md), which is a full product-film pipeline; these are the per-task rules and tools underneath that kind of work.
- **Motion and documentary work in particular:** `blender-time-of-day` (measured sky and sun for golden hour, blue hour, night, fog by visibility in metres, mood presets such as cyberpunk), `blender-weather-fx` (rain, snow, wet streets, puddles, lightning), `blender-lighting-lookdev` (studio and turntables), `blender-rendering` (Cycles/EEVEE batch stills), `blender-environment-kits` (terrain, scatter, modular sets) and `blender-export-pipelines` (`unreal` presets with UCX collision, LODs and Nanite notes; `web` GLB with meshopt and KTX2 for three.js and HyperFrames).
- **As a checker** even for models made elsewhere: run `blender-asset-qa/scripts/qa_check.py` and `review_shots.py` on any imported GLB or FBX. See [`../../tools/mesh-pipeline/`](../../tools/mesh-pipeline/NOTES.md), where they were used to check our own mesh tools.

## Requirements and installing

- **Blender 5.2 LTS or newer**; 5.3 is upstream's tested target (all 69 tests pass on 5.3.0 per the changelog). Optional: [Blender MCP](../../tools/blender-mcp/NOTES.md) for a live session; without it the agent runs Blender in the background.
- **Install** with upstream's installer from this folder, which links or copies every skill into `~/.claude/skills` (and `~/.agents/skills` for other agents):
  ```bash
  ./install/install.sh --agent claude            # macOS / Linux / WSL; --copy to copy instead of link
  .\install\install.ps1 -Agent claude            # Windows PowerShell
  ```
  It **replaces** any existing skill folder with the same name. Or in Claude Code: `/plugin marketplace add EL4CTEO/blender-skills`, then `/plugin install blender-agent-skills@blender-agent-skills` (installs upstream's latest, not this copy).
- **Windows + Git Bash:** MSYS rewrites `//out.png` paths; prefix commands with `MSYS_NO_PATHCONV=1` (see `blender-core`).
- **Tell the agent where Blender is** if it is not on `PATH`: set `BLENDER_EXE` (for example `C:\Program Files\Blender Foundation\Blender 5.3\blender.exe`).

## Tested here (22 Nov 2026)

- **Upstream's suite:** 77 of 79 tests pass against Blender 5.3.0 (the `bpy` 5.3.0 wheel on Linux, through a small stand-in for the `blender` command). The two failures need the full Blender application, which the wheel is not: one starts a UI session for camera tracking, the other runs `blender --command extension validate`. Neither says anything about the skills; run `python tools/run_tests.py` on the workstation for a full pass.
- **On our own outputs:** `qa_check.py` and `review_shots.py` were run on three GLBs from [`../../tools/mesh-pipeline/`](../../tools/mesh-pipeline/NOTES.md). They caught real problems: a code-CAD export with overlapping, out-of-range UVs and no materials, and a 10% LOD with five non-manifold edges.
- `python tools/validate_skills.py` (format and token budget) passes.

## Changes from upstream

- **Copied unchanged:** `skills/` (all 28), `shared/`, `tests/`, `tools/`, `install/`, `.claude-plugin/`, `AGENTS.md`, `CHANGELOG.md`, `LICENSE`.
- **README** kept as `UPSTREAM-README.md`, with its two images pointed at upstream's copies (pinned to the commit).
- **Left out:** `docs/` (the with/without comparison site, 5.7 MB of images; online at [el4cteo.github.io/blender-skills/comparison](https://el4cteo.github.io/blender-skills/comparison/)), `assets/` (banner and icon), `.github/` (CI), `CLAUDE.md` (a one-line pointer to `AGENTS.md`) and upstream's `docs/reddit-post.md`.

## Worth knowing

- **Every script runs `bpy` inside Blender**, and the live route executes whatever Python the agent writes in your open session. `blender-core` tells the agent never to reset factory settings or delete data it did not create in a live session, and to save a backup first; still, save your scene before a live run.
- **Updates are frequent** (four releases between 13 and 21 November 2026). To refresh this copy, diff upstream's `skills/` against this folder and update the commit above.
