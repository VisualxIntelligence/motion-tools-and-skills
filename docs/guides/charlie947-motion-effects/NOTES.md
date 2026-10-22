# charlie947-motion-effects — notes

**Source:** [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) @ `229022e`: the `motion-effects` and `animated-chart` skills. MIT, © Charlie Hills ([LICENSE](LICENSE)). Copied 22 October 2026.

| Folder | What it is |
|---|---|
| `motion-effects/` | 16 effect recipes with timing tables (`references/effects.md`). Includes an 8 s loop structure (0–2.2 s move, 2.2–6.6 s hold, 6.6–8 s return), a check that frame 0 and the last frame are identical, and the frames to inspect (0, 1, 2.2, 4.4, 6.6, 7.9, 8 s) |
| `animated-chart/` | A looping animated chart in one HTML file with `window.seek(seconds)`: bars that grow, a number that counts, a highlight on the key value |

The page contract is `window.seek(seconds)`. For HyperFrames, wrap a paused GSAP timeline in it.

**Worth adopting for news.** The upstream pack's step of approving a list of sourced facts before animating: every number on screen comes from that list.

**Changes from upstream.**
- **Copied.** The two skills, unchanged, as guides.
- **Left out.** The other 13 skills: launch, newsletter and social promo formats, or styles specific to the author's brand.
