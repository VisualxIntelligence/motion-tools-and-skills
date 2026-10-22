# NOTICE — sources and licence

(English translation of the upstream `NOTICE.md` in sixtysevenlf/dsh-blender-plugin, `skills/blender-modeling/`. The original is in Chinese.)

The upstream skill (`blender-modeling`) is a derivative work of MIT-licensed projects, with its tool calls rewritten for the local `blender_rt_*` direct tool chain.

## Upstream projects

1. **RobLe3/cc-blender-skill** — https://github.com/RobLe3/cc-blender-skill (MIT)
   Used: the decision tree, 8 recipes, the three key pitfalls, the modifier stack order and symptom table from `plugin/skills/blender-modeling/SKILL.md`; and `references/overview.md` (included verbatim upstream as `references/modeling-overview.md`, not copied here).

2. **arjun988/blender-skills** — https://github.com/arjun988/blender-skills (MIT)
   Used: the six-step outline, collection structure, modifier stack philosophy and rules, cleanup checklist, MUST DO / MUST NOT DO from `.claude/skills/blender-modeler/SKILL.md`.

## Local changes (upstream)

- `mcp__blender__execute_blender_code` / `get_scene_info` / `get_object_info` → `blender_rt_do` / `blender_rt_headless` / `blender_rt_cmd` / `blender_rt_see` / `blender_rt_job` / `blender_rt_txn`.
- Added a "channel semantics" section (the MCP assumption of "re-import every time" holds only for headless on that setup).
- Body rewritten in Chinese, structure condensed and merged.

The MIT licence requires the copyright and licence notices to be kept; the full licence texts are in the LICENSE files of the upstream repositories. The derivative work is likewise offered under MIT.

## Changes in this repo

The three files in this folder are English translations of parts of the upstream skill, with the `blender_rt_*` calls rewritten back for the official Blender MCP server (`execute_blender_code` and its companion tools). See [`NOTES.md`](NOTES.md).
