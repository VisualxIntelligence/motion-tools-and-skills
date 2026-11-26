# design

Brand, type and design-system skills: **where a film's look comes from**, before anything moves. Their outputs (a palette, a type system, a logo, a DESIGN.md, design tokens) are the inputs to the motion skills in [`../skills/`](../skills/README.md): motion tokens, lower thirds, idents, end cards and title styles.

Each folder is a complete agent skill with the upstream `LICENSE` and a `NOTES.md` saying what it does, why it is here, what it needs and what changed. Sources and commits are in [`../SOURCES.md`](../SOURCES.md).

| Folder | What it does | Needs | Source |
|---|---|---|---|
| [`brand-identity`](brand-identity/NOTES.md) | **Two to four identity sets from one brief** (logo, type and palette built from one idea per set), measured for contrast, colour blindness, glyph coverage and font licences, compared as cards and previewed on your site; then a guidelines kit for the pick (PDF, logo files, CSS/SCSS/Tailwind/DTCG tokens). Critique mode for an existing identity | Python 3.10+, a Chromium-family browser, uv (recommended), Google Fonts access | fatihaydost/brand-identity-skill (MIT) |
| [`make-font`](make-font/NOTES.md) | **Your own OFL font from fonts you like**: measures references (files or screenshots), fits the closest open font to the numbers, never traces outlines; web files and a font book | Python 3.9+ (fontTools, uharfbuzz, numpy, Pillow), Node + Playwright for the PDF | arla6ka/design.how (MIT) |
| [`awwwards-design-md`](awwwards-design-md/NOTES.md) | **An evidence-backed DESIGN.md from any public URL**: colours, type, layout, depth, shapes and components, every value classed observed, inferred or proposed with a pointer into the capture | The [Awwwards MCP](../tools/awwwards-mcp/NOTES.md), Node 18+ | INSANE0777/awwwards-skills (MIT) |
| [`flexoki`](flexoki/NOTES.md) | **A ready editorial palette** (paper and ink neutrals, eight accents in 13 steps) as CSS and tokens with light and dark role maps, and a check script: text and accent contrast, and the colour-blind-safe chart set (red + yellow + cyan + purple, measured) | Python 3 (uses `brand-identity`'s colorlib) | kepano/flexoki (MIT) |

## A typical chain

1. **Reference or existing brand →** [`awwwards-design-md`](awwwards-design-md/NOTES.md) on the client's site or a reference site.
2. **Identity →** [`brand-identity`](brand-identity/NOTES.md) (`new` or `refresh`), with [`make-font`](make-font/NOTES.md) if the title face must be ownable.
3. **Motion language →** map the token export through [`../docs/guides/motion-tokens/`](../docs/guides/motion-tokens/NOTES.md) and animate with the skills in [`../skills/`](../skills/README.md), for example [`lower-thirds`](../skills/lower-thirds/NOTES.md) or [`kinetic-type-vault`](../skills/kinetic-type-vault/NOTES.md).

## Installing

Copy or symlink a folder to `~/.claude/skills/<name>/`, the same as the motion skills (see [`../skills/README.md`](../skills/README.md#installing-a-skill)).

Reviewed and left out of this category (design.how's design-system migration skills and themes, Oil UI, the other Awwwards skills): [`../docs/reference-only.md`](../docs/reference-only.md#14-seventh-survey-reviewed-not-copied).
