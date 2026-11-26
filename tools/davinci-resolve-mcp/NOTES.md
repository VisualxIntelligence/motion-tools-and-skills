# davinci-resolve-mcp — notes

**Source:** [samuelgursky/davinci-resolve-mcp](https://github.com/samuelgursky/davinci-resolve-mcp) @ `7491c3e` (26 Nov 2026), v5.5.3. MIT. Read 26 November 2026. **Nothing is copied**: it installs from npm (`davinci-resolve-mcp`) and updates itself, so a copy here would go stale.

## What it does

An MCP server that lets Claude drive **DaVinci Resolve** through Blackmagic's official scripting API, plus a second server that edits Resolve's files with Resolve closed.

| Server | Tools | Does |
|---|---|---|
| Compact (default) | 37 | Grouped tools over the whole scripting API: projects and settings, media pool and ingest (image sequences, multicam prep, relink and proxy guards), timelines and edits, markers and review notes, **colour** (node graphs, CDL validation, grade copy with checks, LUT and DRX helpers, versions, Gallery stills, colour groups), Fusion, Fairlight, render setup and the render queue, subtitles and title libraries |
| Full (`src/server.py --full`) | 390 | One tool per API method, for power use |
| Advanced (`davinci-resolve-advanced-mcp`, Node) | 18 | Reads and edits `.drp`, `.drt` and `.drx` files offline. Includes a grading and QC catalogue: shot-to-shot and skin matching, neutral-patch white balance, match to a reference, contrast normalising, ASC CDL import, named-LUT attach, scope reads, verify-grade and a **broadcast-legal check**; also conform QC and deliverable QC |

It also has a local browser control panel for inspecting the project, and a media-analysis step that writes transcripts and shot notes back to the project as clip markers.

**It refuses calls that destroy work.** `TimelineItem.CopyGrades` replaces the target's whole grade, so the server refuses it and suggests a safe route. Other known traps return a `known_limitation` note with the result.

## When to use it

- **Finishing films in Resolve on the workstations.** Conform renders and generated clips onto a timeline, place markers from the edit decision list, and render the deliverables from a preset, without clicking through pages.
- **Grading generated clips to sit with code renders.** Fit a `.cube` with [`skills/color-grade/`](../../skills/color-grade/NOTES.md), then attach it here to every clip in a colour group; check the result with verify-grade and the broadcast-legal check.
- **Timelines from the edit tools.** [`tools/auto-editor/`](../auto-editor/NOTES.md) and [`tools/kdenlive-mcp/`](../kdenlive-mcp/NOTES.md) export a timeline (FCPXML or OTIO); this server imports it and carries on.
- **Fusion on Windows.** [`tools/open-fusion-mcp/`](../open-fusion-mcp/NOTES.md) is macOS only for now; this server's Fusion tools work on Windows.

## Requirements

- **DaVinci Resolve Studio 18.5+.** External scripting is a Studio feature: set *Preferences → General → External scripting using* to **Local**.
- **The free edition** works only through an in-app bridge script, and only up to **Resolve 21.0.x**: 21.1 moved Python scripting to Studio. Treat the bridge as working until Blackmagic closes it.
- **Python 3.10+, 64-bit** (Resolve's scripting library is 64-bit only), and Node for the npm launcher and the advanced server.
- Windows paths are confirmed by user reports (Windows 11, `%PROGRAMDATA%` and `%APPDATA%`).

## Setup

```bash
npx davinci-resolve-mcp setup      # installs a managed copy and configures Claude Code / Desktop
```

Open Resolve Studio first. On Windows with the MSIX Claude Desktop, the config lives under `%LOCALAPPDATA%\Packages\Claude_<hash>\LocalCache\Roaming\Claude\`; the installer handles it.

- **Update checks:** the server checks GitHub for a new release once a day and never installs on its own. Turn it off with `DAVINCI_RESOLVE_MCP_UPDATE_CHECK=0`.
- **Network:** the default server is a local stdio process with no listener. The control panel and the bridge are opt-in and bind to loopback only (the bridge signs requests with HMAC).
- **Transcription** in media analysis uses a local Whisper you install yourself (`pip install -U openai-whisper`); [`tools/whisperx/`](../whisperx/NOTES.md) gives better word timing for captions.

## Cautions

- **Work on a copy of the project, or snapshot first.** It edits live projects. Use grade versions or a project archive before any batch grade change.
- **Keep the trap guard on.** `RESOLVE_MCP_DISABLE_TRAP_GUARD=1` turns off the refusals; don't set it.
- **Not tested here:** this sandbox has no Resolve. Try it first on a throwaway project on the 4090 workstation.
