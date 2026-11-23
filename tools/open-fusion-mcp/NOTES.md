# open-fusion-mcp (DaVinci Resolve Fusion) — notes

**Source:** [legionsound/open-fusion-mcp](https://github.com/legionsound/open-fusion-mcp) @ `f0b20ca` (1 Oct 2026), version 0.2.0. MIT, © 2026 Legion Media LLC. Read 23 November 2026. **Nothing copied:** it installs from a clone, and its Fusion data tables must be generated from your own Resolve install.

## What it does

An MCP server (`use-fusion`, Python 3.12) and four agent skills that let an agent **build motion graphics as native, editable Fusion node graphs** inside DaVinci Resolve: titles, kinetic type, UI animation and whole multi-scene films. An editor can open and change the result in Resolve like any comp, which code-rendered video can't offer.

- **181 checked operations in 36 categories** behind 15 `fu_*` tools: comps, tools, inputs, keyframes, expressions, masks, text, 3D, templates, timelines, renders and Deliver. Every write is read back.
- **Scene builder.** `fu_scene_build` turns a description (layers, type styles, layout, enter and exit moves, camera) into an editable graph; `scene.update` changes it by description. Multi-scene films live in one comp.
- **Render and look.** `fu_render_frame` with inline previews, `fu_contact_sheet`, image comparison and a motion audit, so the agent checks pixels, not return values.
- **Recovery.** Each operation is journalled. After a timeout the reply says what finished; `batch.recover`, `batch.rollback` and `resume` follow, and `atomic: true` makes a batch all or nothing.
- **Guard rails.** Project allowlist (`FUSION_MCP_PROJECT_ALLOWLIST`), read-only mode, dry runs.
- **Skills.** `use-fusion` (the working loop), `fusion-motion-design` (creative procedure: titles, kinetic type, UI, glass, depth, transitions, delivery), `fusion-reference` (Fusion 21.1 facts) and `fusion-figma-transfer` (Figma frames to native nodes).

Upstream's own measurement, on one Apple Silicon Mac: a 25-second 3D ad that took about 1 h 55 min in After Effects took **1 h 19 min and about 156 tool calls** in Fusion with the scene builder.

## When to use it

- **Graphics an editor must be able to change**: titles, straps and explainer sections delivered as a Resolve comp rather than a rendered file.
- **After Effects-style work without After Effects.** Upstream maps its After Effects connector operations to Fusion (`connector/PARITY.md`).

## Requirements and status

- **DaVinci Resolve Studio 21.1**, with *Preferences › System › General › External scripting using = Local*. The free edition doesn't allow external scripting.
- **Python 3.12** and an MCP client.
- **Tested only on macOS (Apple Silicon).** Windows and Linux are untested. The server is plain Python, but the helper that dismisses Resolve's render dialogs uses AppleScript (`osascript`), so renders that raise a dialog will stall on Windows.
- **Version 0.2.** Two VFX skills (`fusion-cleanup`, `fusion-matte-painting`) are being rewritten.

## Setup (from upstream, for a Mac with Resolve Studio)

```sh
git clone https://github.com/legionsound/open-fusion-mcp.git
cd open-fusion-mcp/connector
python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt
bin/fusion-connector doctor    # Python, scripting port, Resolve, Studio, skills, data tables
claude mcp add use-fusion --scope user -e FUSION_MCP_PROJECT_ALLOWLIST=Testbed \
  -- /absolute/path/to/open-fusion-mcp/connector/bin/use-fusion-mcp
```

Then generate the data tables (upstream `skills/fusion-reference/data/README.md`), open a scratch project named `Testbed`, and ask the agent to call `fu_version_info` and load `use-fusion`.

## Status for us

**Watch, don't install yet.** Our workstations run Windows. Try it when it lists Windows, or on a Mac with Resolve Studio 21.1. Until then, Resolve's own scripting MCPs cover edit-page and Deliver automation.

**Not tested here.** Facts are from the source at the commit named.
