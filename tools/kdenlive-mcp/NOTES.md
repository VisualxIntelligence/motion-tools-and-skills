# Kdenlive MCP — notes

**Source:** [AMMIROSOH/Kdenlive-mcp](https://github.com/AMMIROSOH/Kdenlive-mcp) @ `b1ff6d5` (21 Sep 2026), version 1.1.0. Apache-2.0. Read 23 November 2026. **Nothing copied:** it installs with its own script from a clone, and Kdenlive, MLT and FFmpeg are external installs with their own licences.

## What it does

A **headless video editor for agents**. The project is a versioned JSON file (the source of truth). Every edit must name the current revision, so two clients can't overwrite each other, and every edit can be undone. The project compiles to deterministic MLT for rendering, using the Kdenlive/MLT and FFmpeg already on the machine. Kdenlive itself needn't be open; open it only to look at or hand-edit the result.

| Area | Tools |
|---|---|
| Project | `project_create` / `open` / `get` / `validate`, named checkpoints, per-client undo and redo |
| Media | `media_import` (only inside the allowed root), `media_list`, `media_inspect` |
| Timeline | add tracks and clips in batches, move, remove, split, trim, slip, speed, ripple delete; `clip_set_properties`, `clip_set_keyframes`, `clip_set_effects`; `transition_edit` |
| Text and captions | `text_edit`, `caption_edit`, `caption_generate`, `caption_export` (SRT, WebVTT), `marker_edit` |
| Interchange | `interchange_export`: editable **Kdenlive 26.04** or **OTIO 0.18.1**; reviewed imports |
| Render | `preview_submit`, `render_submit` (validated profiles), job status and cancel, `job_verify` |
| Checks | Output duration, streams, A/V sync, loudness, clipping, black frames, freezes |

It also serves resources: editing rules for the agent, the export profile catalogue, a capability snapshot of the installed runtime, and versioned editing recipes.

## When to use it

- **Assembling a film from parts.** Code-rendered scenes, generated clips, voice-over, music and captions put on a timeline by the agent, with an export check at the end.
- **Handing a cut to an editor.** `interchange_export` to OTIO, then open it in DaVinci Resolve, which imports OTIO, and finish there. That keeps the agent's assembly editable instead of baked.
- **Compare before adopting the checks.** The export checks overlap with [`../sync-check/`](../sync-check/NOTES.md) and `lemo-core`'s loudness master; use whichever fits the job, not all three.

## Installing on the workstation (Windows)

Windows 10/11 x64 is a **tested** platform (Kdenlive 26.04.2, MLT 7.39.0, its bundled FFmpeg 8.0.1). It needs Node.js 22+ and pnpm 9.

```powershell
git clone https://github.com/AMMIROSOH/Kdenlive-mcp.git
cd Kdenlive-mcp
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\install.ps1 -AddToPath
kdenlive-mcp --doctor          # finds Kdenlive/MLT/FFmpeg and lists filters, transitions and encoders
claude mcp add kdenlive -- kdenlive-mcp --root D:\video-workspace --client-id claude-code
```

`--root` is the only folder it may read or write; use a dedicated workspace.

## Cautions

- **Public preview.** Milestones 0–4, 6 and 7 are done; local AI analysis (milestone 5) is not. macOS is unsupported.
- **Safety model.** File access stays inside the root (symlink and `..` escapes are refused). Renders run without a shell, with bounded time and output. The HTTP transport binds to loopback only and needs a generated token.
- **Ignore the "For AI assistants" section** of its README. It asks agents to invite users to star the repo.
- **Not tested here.** Facts are from the source at the commit named.
