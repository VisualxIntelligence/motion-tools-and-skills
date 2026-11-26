# flexoki — notes

**Source:** [kepano/flexoki](https://github.com/kepano/flexoki) @ `8d723ba` (7 Mar 2026), Flexoki 2.0 by Steph Ango. MIT, © 2023 Steph Ango ([LICENSE](LICENSE)). Copied 26 November 2026.

## What it is

**An "inky" palette made for reading:** warm paper and ink neutrals and eight accents (red, orange, yellow, green, cyan, blue, purple, magenta), each in 13 steps from 50 to 950. Light mode uses the 600 accents on paper `#FFFCF0`; dark mode uses the 400 accents on black `#100F0F`. It was designed for prose and code, so it reads calmly on screen, and it has ports for dozens of apps (editors, terminals, Obsidian), matplotlib (`flexoki-py`) and Tailwind upstream.

| File | What |
|---|---|
| [`flexoki.css`](flexoki.css) | Upstream's CSS custom properties, every step (`--flexoki-red-600` and so on). Unchanged |
| [`flexoki.json`](flexoki.json) | Our tokens file: base, accents and the **role map** for both modes (`bg`, `bg-2`, `ui`, `ui-2`, `ui-3`, `tx-3`, `tx-2`, `tx`, `accent_step`), taken from upstream's `_generators/src/palette.ts` |
| [`check_flexoki.py`](check_flexoki.py) | Our measurement script (uses `design/brand-identity/scripts/colorlib.py`): text and accent contrast on both grounds, accent pairs that collapse under colour-vision deficiency, and the largest safe chart set |

## When to use it

- **An editorial look for explainers and data films**: a paper-and-ink ground instead of pure white or black, which sits well beside the paper-editorial and data-storytelling styles in `prompts/film-styles/`.
- **Charts and diagrams** in `starters/hyperframes-motion-library/`, `skills/animated-diagrams/` and matplotlib-made graphics, using the colour-blind-safe set below.
- **A neutral starting point** before a real brand: drop the roles into a film's tokens, then swap in brand colours with `design/brand-identity/`.
- **Not a brand.** For Al Jazeera or MAKEENA work, the client's own palette comes first.

## Measured (26 Nov 2026, `python3 design/flexoki/check_flexoki.py`)

| | Light (paper, 600 accents) | Dark (black, 400 accents) |
|---|---|---|
| Body text `tx` on `bg` | 18.6:1 | 12.0:1 |
| Secondary `tx-2` | 5.0:1 | 5.2:1 |
| Faint `tx-3` | 2.0:1: **decoration only, never text** | 2.6:1: same |
| Accents usable **as text** (≥ 4.5:1) | red, orange, blue, purple, magenta (not yellow, green, cyan) | all but red (4.4:1) |
| Accents usable **as marks** (≥ 3:1) | all eight | all eight |
| **Colour-blind-safe chart set** (every pair ≥ ΔE2000 10 under protan, deutan and tritan) | **red + yellow + cyan + purple** | **red + yellow + cyan + purple** |

The pairs to never use as the only difference between two series are blue/purple and orange/green (they nearly merge for some viewers in both modes), and cyan/magenta and orange/magenta in dark mode. For a fifth or sixth series, add a pattern, a label or a different step (for example blue-300 beside purple-600), and re-run the check.

## Using it in a film

```css
@import "flexoki.css";
:root { --bg: var(--flexoki-paper); --tx: var(--flexoki-black); --tx-2: var(--flexoki-600);
        --s1: var(--flexoki-red-600); --s2: var(--flexoki-yellow-600); --s3: var(--flexoki-cyan-600); --s4: var(--flexoki-purple-600); }
```

Yellow-600 on paper is 3.4:1: fine for a bar or a line, too light for a label. Put series labels in `tx` beside the mark instead of in the series colour.

## Changes from upstream

- **Copied.** `css/flexoki.css` and the licence, unchanged.
- **Added (ours).** `flexoki.json`, built from the CSS and upstream's role map, and `check_flexoki.py`.
- **Left out.** The 50-odd app ports, screenshots, the playground and the generators.
