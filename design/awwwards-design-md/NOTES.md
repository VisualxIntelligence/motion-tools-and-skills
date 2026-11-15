# awwwards-design-md — notes

**Source:** [INSANE0777/awwwards-skills](https://github.com/INSANE0777/awwwards-skills) @ `5dcf198` (11 Nov 2026): `skills/awwwards-design-md/`. MIT, © 2026 Afjal ([LICENSE](LICENSE)). Copied 15 November 2026.

## What it makes

**A DESIGN.md for any public web page, with evidence behind every value**: overview, colours, typography, layout, elevation and depth, shapes, components, and do's and don'ts, in Google's design.md format, plus a machine-readable `design-evidence.json`. One URL and one viewport (desktop or mobile) per run.

The workflow uses the [Awwwards MCP](../../tools/awwwards-mcp/NOTES.md): a guarded token capture (`export_design_tokens` with `publicOnly:true`; a refusal is final), the page's section bands, a full screenshot it must inspect before writing visual claims, and up to three representative components. `scripts/validate-design-md.mjs` (Node, no dependencies) checks the document and the sidecar.

**Its evidence rules are the reason to use it.** Every value is classed `observed` (in a tool response or the screenshot), `inferred` (a grouping or name derived from observed values) or `proposed` (a suggestion for your project), each with a JSON pointer into the capture, a method and a sample count. It never claims an official brand system, recovered token names, complete state or dark-mode coverage, accessibility compliance, rights to reuse assets, or a pixel-perfect match.

## Why it is here

- **Briefs from a reference**: when a client says "like this site", this turns the site into a cited look you can map to motion tokens and title styles.
- **A client's own site** as the starting point for their motion package, when no brand guidelines exist (or before running [`brand-identity`](../brand-identity/NOTES.md) in `refresh` mode).
- Honest about limits: no crawling, logins, asset downloads or motion recording. For motion, use [`awwwards-motion-study`](../../skills/awwwards-motion-study/NOTES.md).

## Requirements

The Awwwards MCP with its browser tools (Playwright), version with `publicOnly` support; Node 18+ for the validator.

## Installing

Copy or symlink this folder to `~/.claude/skills/awwwards-design-md/`. Upstream: `npx skills add INSANE0777/awwwards-skills --skill awwwards-design-md`.

## Changes from upstream

- **Copied unchanged:** `SKILL.md`, `scripts/validate-design-md.mjs`, `v2-routing.md`; the repo's `LICENSE` added.
- **Not run here.** Nothing was executed during the copy.
