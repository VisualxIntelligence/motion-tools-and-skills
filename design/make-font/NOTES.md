# make-font — notes

**Source:** [arla6ka/design.how](https://github.com/arla6ka/design.how) @ `148b94c` (14 Nov 2026): `skills/make-font/`. MIT, © 2026 Arlan Marat ([LICENSE](LICENSE)). Copied 15 November 2026.

## What it makes

**Your own font, from fonts you like, under the OFL.** Send two to four references as font files or screenshots. It measures them (proportions, stem and stroke thickness, class-mean widths, spacing), ranks open families from the Google Fonts catalogue by distance to those numbers, and once you confirm a base it bends that base to the targets, checks it and packages it: an OFL font with a new family name, web files and a printed font book (PDF).

**The line it holds**, said to you at the start: it matches proportions, widths and spacing on an open font and never traces or copies the outlines of the fonts you send. Reference fonts are never opened in the build step; targets are font-wide numbers and class means, never a glyph's advance, a kerning pair or a point. It refuses to clone, trace, convert or rename a commercial font and offers the proportional match instead.

| Step | Script |
|---|---|
| Measure a font file / a screenshot (with a self-test of pixel accuracy) | `measure_font.py`, `measure_image.py` |
| Targets from the measurements, with the spread where references disagree | `make_targets.py` |
| Shortlist open bases (variable fonts first; note any Reserved Font Name) | `find_foundation.py` |
| Fit stems, contrast and widths per weight | `fit_font.py` |
| Spacing | `space_font.py` |
| Check, package, font book | `check_font.py`, `package.py`, `font_book.py`, `render_book.mjs` |

`references/` covers measuring, fitting, spacing, the foundation search, checks, licensing and the font book.

## Why it is here

A show, channel or client often wants a title face that feels like a commercial one it cannot license for broadcast and web. This gets an ownable, freely licensed face for titles, lower thirds and idents, with the licensing question answered. It pairs with [`brand-identity`](../brand-identity/NOTES.md), which picks type from existing families.

## Requirements

Python 3.9+ with `fonttools`, `brotli`, `uharfbuzz`, `numpy` and `pillow` (`skia-pathops` to remove overlaps, `fontbakery` optional); Node 18+ with Playwright for the PDF; network access to the Google Fonts catalogue. Upstream runs its scripts as `python3 -I` with paths passed in, and keeps downloaded fonts in their own folder, read only.

## Installing

Copy or symlink this folder to `~/.claude/skills/make-font/`. It stands on its own (it does not need design.how's `build-design-system`). Upstream: `npx skills@latest add arla6ka/design.how --skill make-font`.

## Changes from upstream

- **Copied unchanged:** `SKILL.md`, `references/`, `scripts/`; the repo's `LICENSE` added.
- **Not run here.** Nothing was executed during the copy.
