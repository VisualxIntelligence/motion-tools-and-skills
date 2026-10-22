# dsh-blender-modeling — notes

**Source:** [sixtysevenlf/dsh-blender-plugin](https://github.com/sixtysevenlf/dsh-blender-plugin) @ `55a9597` (v2.6.0), the `skills/blender-modeling/` folder. MIT, © 2026 sixtyseven67 ([LICENSE](LICENSE)); parts derive from RobLe3/cc-blender-skill and arjun988/blender-skills, both MIT ([NOTICE.md](NOTICE.md)). The plugin itself is BSD-3-Clause and is **not** copied. Translated from Chinese and adapted on 22 October 2026.

## What it is

Three general Blender references taken from the modelling skill that ships with the DSH × Blender plugin. DSH is DeepSeek Harness, a separate agent host. The plugin's 15 tools register with DSH, not with MCP, so Claude Code cannot call them.

The skill's main workflow (sections 0–12) runs on DSH-only operations and is left out. What is kept is the part that works with plain `bpy` through our Blender MCP bridge:

| File | What it is |
|---|---|
| [`blender-modeling-reference.md`](blender-modeling-reference.md) | Appendix A of the upstream skill. Every `blender_rt_*` call is rewritten for `execute_blender_code`, and a plain-bpy block replaces the common DSH checks |
| [`multiview-calibration.md`](multiview-calibration.md) | Three-view px-per-mm calibration from a front, side and top reference. Includes a stdlib Python script with `--selftest`; its self-test passed after translation |
| [`verifier-checklist.md`](verifier-checklist.md) | A task template for an **independent verifier subagent**: numeric gates run by script, "anti-Goodhart" rules (verify by a different computation path), the few subjective gates, and a fixed 4-line verdict format. DSH tool names are replaced with Blender MCP equivalents |

### What `blender-modeling-reference.md` covers

- **Six pitfalls:**
  - long, wide and thin axis semantics of slender parts;
  - assembly seams (visual joining is not real connection; hidden overlap is set by the spec);
  - tapering a tip by collapsing to the centreline and merging, not by scaling;
  - `bpy.ops` failing in headless, with bmesh and data-API replacements;
  - normals checked per shell before any clipping verdict;
  - a preview rig of grey material plus one hard sun light, so geometry changes are visible.
- **Modifier stack order and symptoms.** A measured table: Bevel → SubSurf gives 866 faces, the reverse gives 96 with a 15% bounding-box difference. Buried internal faces are found by BVH ray-cast; "Delete Loose" does not remove them.
- **One numeric gate table** for handover, with plain-bpy helpers: per-shell signed volume, world AABB, BVH overlap pair count, triangle count.
- **Rendering and animation:**
  - camera framing by projecting every frame and checking NDC, not by bounding box;
  - exploded-view rules;
  - long jobs that can be interrupted and resumed;
  - measuring 3 frames before scheduling (about 60% of each frame is fixed cost, so cutting samples barely helps);
  - rendering at 10 fps and interpolating to 30 with ffmpeg `minterpolate`, checked by PSNR against true frames.
- **Blender 5.2 API breaks** that raise errors: compositor node groups, Glare menu sockets, the `persistent_data` location, the EEVEE shadow pool. With a working compositor snippet.

## When to use it

- With [`../../SKILL.md`](../../SKILL.md) (3d-product) or any Blender job driven through the Blender MCP server: read the pitfalls before modelling, run the gate helpers before handover, and give `verifier-checklist.md` to a separate subagent to check the work.
- `multiview-calibration.md` whenever a model is built from orthographic reference views (patents, blueprints, product drawings) and dimensions matter.
- The Blender 5.2 API table before any compositor or EEVEE script on 5.2.

## Changes from upstream

- **Translated** from Chinese.
- **Converted to the official Blender MCP bridge.** `blender_rt_do` / `rt_*` calls are rewritten for `execute_blender_code`.
- **Added plain-bpy equivalents** for the common DSH audit checks (end of A.6).
- **Fixed two snippets.** A missing `from mathutils import Vector` and `worst = 0.0` were added to the framing snippets.
- **DSH-only checks kept as descriptions.** These are marked "Needs the DSH runtime" in the text:
  - the floater and hidden-overlap gates;
  - self-intersection scans;
  - job registries;
  - `kit.bounds_all`.
- **Calibration script.** Its report strings and sample feature names are now in English.
- **Verifier checklist.** It drops the DSH token-cost accounting.
- **Left out:**
  - sections 0–12 of `SKILL.md` (the DSH op workflow);
  - `references/参考图通用还原SOP.md` (tied to DSH ops);
  - `references/modeling-overview.md` (RobLe3's text, verbatim; read it upstream at RobLe3/cc-blender-skill);
  - `install.sh` and `README.md`.
- **Dangling references.** Cross-references to upstream sections (§0.5.x, §0.6.x, §13, recipe numbers) remain in the text and point to the upstream `SKILL.md`.

## Why the plugin is not recommended

These are reasons not to install the plugin itself. They are recorded in [`../../../../docs/reference-only.md`](../../../../docs/reference-only.md#8-dsh--blender-plugin--not-usable-from-claude-code).

- **It doesn't work with Claude Code.** It needs the DSH host.
- **Unauthenticated code execution.** Its local backend accepts `POST /act` on `127.0.0.1:9877` without authentication and runs a body that is not JSON as Python (`runtime/server.mjs`, line 466 at `55a9597`). A web page open in the browser could therefore run code in Blender.
- **Port clash.** Its addon listens on port 9876, like other Blender bridges, and starts its server automatically.
