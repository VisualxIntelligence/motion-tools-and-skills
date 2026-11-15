# awwwards-mcp — notes

**Source:** [INSANE0777/Awwwards-mcp](https://github.com/INSANE0777/Awwwards-mcp) @ `954fb9b` (12 Nov 2026), npm package `awwwards-mcp`. MIT, © 2026 Afjal. Reviewed 15 November 2026. **No code is copied here**: it is a 110 MB TypeScript server that installs from npm, so this folder holds only these notes.

## What it is

An MCP server (no API key, no account) that gives an agent two things:

1. **Award-winning references**: search Awwwards by colour, tag, technology or award (Site of the Day, Developer Award, Site of the Year, nominees), a site's design DNA (palette, stack, elements, jury scores), collections, the agency directory, the official Annual Awards API, daily new winners and watches. A local SQLite index at `~/.awwwards-mcp/` (about four minutes to build, refreshed weekly) makes searches deep and fast.
2. **Measurement of any live page**, including your own builds on `file://`. The motion tools are the reason it is listed here:

| Tool | What it measures |
|---|---|
| `get_motion_dna` | The page's motion fingerprint: animation libraries, render engines, ScrollTrigger counts and scrub ratio, the easing and duration vocabulary, the scroll model |
| `analyze_scroll_map` | Every scroll-driven animation: selector, trigger source (GSAP ScrollTrigger, CSS scroll and view timelines, keyframes, SMIL), animated properties, duration, easing, scrub and pin |
| `analyze_hover_census` | Hover rules and sampled before/after diffs with transition timing |
| `record_site_motion` | A short motion-through video (preloader, scroll, hover) as a `.webm` plus an inline filmstrip; desktop or mobile |
| `build_gsap_stub`, `build_motion_manifest` | Turn the scroll census into a runnable GSAP + ScrollTrigger stub, or a `motion.manifest.json` scaffold |
| `capture_pose_3d`, `capture_scene_3d`, `build_pose_stub` | Reference frames of a hero WebGL canvas at scroll steps, and an offline three.js + GSAP replay skeleton |
| `audit_url` | Runtime performance evidence (fps, dropped frames, long tasks, layout thrash), never a grade |

Also: page structure (section bands), full-page screenshots, component capture, design-token export, stack fingerprinting, image and accessibility evidence, and `verify_build` (structure and motion compared with a reference, 0–100).

## Where it is used in this repo

- [`../../skills/awwwards-motion-study/`](../../skills/awwwards-motion-study/NOTES.md): record, tile, inventory and re-record a reference's motion.
- [`../../design/awwwards-design-md/`](../../design/awwwards-design-md/NOTES.md): an evidence-backed DESIGN.md from a URL.

## Install

Node 22.13 or newer.

```bash
# core tools (search, details, briefs); no browser
claude mcp add awwwards -- npx -y awwwards-mcp

# browser tools too (recording, motion DNA, scroll and hover census, captures)
npm install -g awwwards-mcp playwright ffmpeg-static
npm exec --global -- playwright install chromium
claude mcp add awwwards -- awwwards-mcp
```

Via `npx`, the browser tools return an install hint instead of running. The server checks npm once a day for updates (stderr notice only; `AWWWARDS_AUTO_UPDATE=1` opts into self-update). `AWWWARDS_MCP_PROFILE=core` limits it to the 13 build-loop tools; `v2` is an opt-in consolidated surface the copied skills map in their `v2-routing.md`.

## Terms and limits

- **Personal design inspiration.** Upstream fetches public pages at slow rates and honours robots.txt. Awwwards' screenshots and content belong to Awwwards and the credited creators: don't bulk-scrape, redistribute or republish them, and review awwwards.com's terms before commercial use. Recordings of other sites are local study material only.
- **Measurements are evidence, not grades.** `verify_build` scores structure and motion, not visual fidelity, and capture timing can move it between runs. The element corpus is partial.
- **Not copied** from its companion skills repo: `recreate` and `awwwards-section-loop` (rebuilding other people's sites), `motion-authoring`, `awwwards-inspiration`, `awwwards-atlas`, `awwwards-doctor` and `awwwards-setup` (server operation). See [`../../docs/reference-only.md`](../../docs/reference-only.md#14-seventh-survey-reviewed-not-copied).
