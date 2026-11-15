# awwwards-motion-study — notes

**Source:** [INSANE0777/awwwards-skills](https://github.com/INSANE0777/awwwards-skills) @ `5dcf198` (11 Nov 2026): `skills/awwwards-motion-study/`. MIT, © 2026 Afjal ([LICENSE](LICENSE)). Copied 15 November 2026.

## What it is

**How to learn a reference's motion from frames instead of guessing it.** The chain is record → review → inventory → build → re-record, under one rule: every animation you ship must trace to frames you actually studied, never to memory or a single poster frame.

1. **Capture a motion-through pass**: dwell on load for the entrance (5–8 s), scroll slowly in steps (about 450 px every 600 ms) for scroll-triggered, pinned and scrubbed motion, then tour hover and click states (10–20 s). Pre-scroll first so lazy sections are not recorded blank; keep one viewport (1440 × 900) for reference and build.
2. **Skip** the site's content videos, loading states, cookie banners and ads; they are media or noise, not motion design.
3. **Review** the recording directly if the model takes video, otherwise as tile sheets, **one per element or passage**, at 1–2 fps (re-tile at 6 fps to tell `power2.out` from `expo.out`):
   `ffmpeg -i reference.webm -vf "fps=2,scale=480:-1,tile=6x4" -frames:v 1 tile-hero.jpg`
4. **Write a motion inventory** per page (element, trigger, transform, duration, easing, overlap) and build from the table. Then sweep the same tiles through the other lenses: story, layout, visual design, technical rebuild, and accessibility and performance.
5. **Re-record your build** the same way and compare tile for tile.

| Path | What it is |
|---|---|
| `SKILL.md` | The whole chain, anti-patterns, and an "instrument first" pass (read the motion stack before filming) |
| `_memory/techniques.json` | A registry of techniques by domain: video understanding (scene detection first, keyframes per scene), motion detection (library fingerprints, hover-pair diffs) |
| `v2-routing.md` | Tool-name mapping for the MCP's `v2` profile |

## When to use it

- **Before rebuilding or answering a motion reference** (a site, a title sequence captured from a page, a competitor's promo page): it turns "make it feel like this" into a timed list you can animate in GSAP, Remotion or HyperFrames.
- **QA of your own pages** with the same tiles, alongside [`../video-shotcraft/`](../video-shotcraft/NOTES.md) and the contact-sheet reviews in [`claude-motion`](../claude-motion/NOTES.md).
- **The method stands without the MCP**: record with Playwright's `recordVideo` and tile with ffmpeg. With the [Awwwards MCP](../../tools/awwwards-mcp/NOTES.md), `record_site_motion`, `get_motion_dna`, `analyze_scroll_map` and `analyze_hover_census` add measured triggers, easing and durations.

**Study, don't republish.** Recordings are local study material; the skill itself says site media belongs to its creators.

## Installing

Copy or symlink this folder to `~/.claude/skills/awwwards-motion-study/` (see [`../README.md`](../README.md#installing-a-skill)). Upstream: `npx skills add INSANE0777/awwwards-skills --skill awwwards-motion-study`.

## Changes from upstream

- **Copied unchanged:** `SKILL.md`, `_memory/techniques.json`, `v2-routing.md`; the repo's `LICENSE` added.
- **References** to sibling skills (`recreate`, `awwwards-section-loop`, `motion-authoring`) and to `scripts/record-scrollthrough.mjs` point at upstream repos; none is copied (see [`../../docs/reference-only.md`](../../docs/reference-only.md#14-seventh-survey-reviewed-not-copied)).
- **Not run here.** Nothing was executed during the copy.
