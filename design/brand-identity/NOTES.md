# brand-identity — notes

**Source:** [fatihaydost/brand-identity-skill](https://github.com/fatihaydost/brand-identity-skill) @ `3ba008e` (4 Nov 2026): `skills/brand-identity/`. MIT, © 2026 Fatih Aydost ([LICENSE](LICENSE)); adapted code and data credited in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); real brand names and measured site colours in the colour library belong to their owners ([TRADEMARKS.md](TRADEMARKS.md)). Copied 15 November 2026.

## What it makes

**Two to four complete identity sets from one brief**, logo, typography and colour palette built together from one idea per set, then a **brand guidelines kit** for the set you pick.

1. **Intake in one message**: for logo, type and palette each, `new`, `refresh`, `keep` or `none`; how many sets; the site URL; the languages the brand writes in; competitors.
2. **Sets.** Each set has one mechanism (a single visual idea that produces the mark, the type and the palette) and one loud "expression move". Sets are placed on two to four decision axes and must stand apart on at least two. A **reflex test** flags what models reach for by default (`references/ai-defaults.md`) and demands a reason from the brief, and at least one set uses none of it.
3. **Measured, not asserted.** Gates the set must pass: WCAG 2.2 contrast, colour-blindness simulation, glyph coverage for the brand's languages (Arabic included), font licences, tabular figures, logo renders at 16 and 32 px. Heuristics are labelled warnings; taste is labelled judgement.
4. **Identity cards and a board**, side by side, and optionally each set **previewed on your own site**.
5. **It stops and lets you pick**, or mix ("logo from A, palette from B"). Then the kit: an 8-page PDF (13 with `--full`), logo files (SVG and PNG: full colour, one colour, reversed, app icon, favicon), design tokens (CSS, SCSS, Tailwind, DTCG JSON) and a font sheet with embed code.

Also: any part alone (just a logo, just a type system, a palette for an existing logo) and a **critique** mode for an identity you already have.

## Why it is here

The identity is the input to every motion job for a brand: the palette, type and mark become [motion tokens](../../docs/guides/motion-tokens/NOTES.md), lower thirds, idents and end cards. The DTCG and CSS token export drops straight into HyperFrames, Remotion or GSAP projects. For a channel or show rebrand, run this first, then animate the chosen set.

## Requirements

- Python 3.10+ and a Chromium-family browser (Chrome, Chromium, Edge or Brave). With [uv](https://docs.astral.sh/uv/) the scripts install their own packages (`fonttools`, `uharfbuzz`, `skia-pathops`, listed in `requirements.txt`). `python3 scripts/brand.py check` lists what is missing.
- Network: Google Fonts and the google/fonts repository (font files, metadata, licences), PyPI once through uv, and only the sites you name. No telemetry.
- Claude Code, not claude.ai chat (its sandbox blocks Google Fonts). Upstream measures a full run to the board at about 40 turns and 0.9 M input-equivalent tokens.
- **Trademark clearance is yours**: the skill does not search registers. Clear a mark before it goes into use, and check your plan's terms before pasting confidential client briefs.

## Installing

Copy or symlink this folder to `~/.claude/skills/brand-identity/`. Upstream also ships a Claude Code plugin: `/plugin marketplace add fatihaydost/brand-identity-skill`, then `/plugin install brand-identity@brand-identity-skill`.

## Changes from upstream

- **Copied unchanged:** the whole skill folder (scripts, references, templates, the font catalogue, which is metadata only, the colour library, evals); from the repo root `THIRD_PARTY_NOTICES.md`, `TRADEMARKS.md` and `requirements.txt`.
- **README** kept as `UPSTREAM-README.md`, its images and the Korean translation link pointed at upstream (pinned to the commit).
- **Left out:** `docs/` (images, architecture and testing notes), `tests/`, the repo-level `tools/` and `evals/`, and `translations/` (Korean).
- **Not run here.** Nothing was executed during the copy.
