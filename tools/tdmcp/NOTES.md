# TDMCP (TouchDesigner) — notes

**Source:** [TouchDesigner/TDMCP](https://github.com/TouchDesigner/TDMCP) @ `9353acd` (16 Nov 2026), component 1.1.58, and [TouchDesigner/TDMCPSkills](https://github.com/TouchDesigner/TDMCPSkills) @ `6101222`, skills 1.4.3. Derivative's own **Shared Use License** plus the **TDMCP Tool Terms of Use**. Read 23 November 2026. **Nothing copied:** the licence ties the software to licensed TouchDesigner users, and it installs from a release.

## What it does

Derivative's official MCP server, which runs **inside TouchDesigner** as one component (`TDMCP.tox`). An agent can create and wire operators, set parameters, write DAT and GLSL code, read errors and cook times, look up the TouchDesigner docs, and capture any operator's output as an image. Every change is a TouchDesigner undo step, and the network editor pans to and flashes whatever the agent touches.

26 tools, from `project_info` (call first) and `build_network` (create and wire a chain in one call) to `inspect_values` (CHOP channels, TOP pixels, geometry, DAT cells), `view_operator`, `get_cook_performance` and `execute_code` (Python inside TouchDesigner). The full list is in upstream `docs/component.md`.

**TDMCPSkills**: 19 skills, one per operator family (TOP, CHOP, SOP, POP, DAT, MAT) plus GLSL shaders, geometry instancing, COMP architecture, Python extensions, build planning, layout, performance checks, network review and cleanup. Without them the agent guesses parameter names.

## When to use it

- **Generative and audio-reactive backgrounds and loops** for explainers and music videos: noise, feedback, particles (POPs), instancing, GLSL, driven by an audio CHOP. Render them out of TouchDesigner (Movie File Out TOP, ProRes) and composite.
- **Live graphics** for events or a studio wall, where TouchDesigner already runs.
- Not for typography-led explainers: those stay in HyperFrames, GSAP or Remotion.

## Installing on the workstation

Needs **TouchDesigner 2025.33230 or newer**.

1. Download `TDMCP.tox` from [Releases](https://github.com/TouchDesigner/TDMCP/releases) and drag it into the project.
2. On its MCP page turn on **Active**, set **Install For** to Claude Code, and leave **Install Scope** on Local.
3. Copy the **Add MCP** command and run it in a terminal in the project folder:
   ```bash
   claude mcp add --transport http --scope local touchdesigner http://127.0.0.1:13316/mcp
   ```
4. Pulse **Install Skills**.
5. Ask: *"What TouchDesigner project am I connected to?"*

Claude Desktop instead uses the `derivative_tdmcp.plugin` file from the release. It needs Node.js installed, and loads in Cowork sessions and the Code tab, not plain Chat. If the TouchDesigner plugin is already on your claude.ai account, Claude Code is connected without steps 2–4. Don't also register port 13316, or every tool appears twice.

## Cautions

- **Public beta.** Tested each release on Windows 11 and macOS with Claude Code and Claude Desktop. Untested: long sessions past the 24-hour token, proxies, VPNs and antivirus that inspect local traffic.
- **`execute_code` runs Python in TouchDesigner.** Treat a connection like a shell on your machine. Authentication is on by default: the first connection shows a consent panel. The server is localhost-only, with no telemetry. There is an option to ask before deleting an operator.
- **TouchDesigner's own licence decides output size.** The free Non-Commercial licence caps every image at 1280×1280, has no H.264/H.265 in Movie File Out, and may not be used for any paid work. 1080p or 4K client work needs a Commercial ($600) or Pro licence ([licensing](https://derivative.ca/UserGuide/Licensing)).
- **Terms of Use.** With Claude or another AI service, the TDMCP terms forbid using it to offer standalone image, video or audio generation as a primary service, to serve ads, or to move money. Ordinary design work is fine.
- **Not tested here.** No TouchDesigner in this session.
