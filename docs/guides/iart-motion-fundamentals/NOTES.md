# iart-motion-fundamentals — notes

**Source:** single skills and reference files from four iart.ai packs, all MIT, © 2026 iart.ai ([LICENSE](LICENSE)). Copied 22 October 2026.

| Folder | From (repo @ commit) | What it is |
|---|---|---|
| `animation-principles/references/easing-curves.md` | [iart-ai/motion-design-skills](https://github.com/iart-ai/motion-design-skills) @ `3c129f7` | Named easing library with exact cubic-bezier values (easeOutExpo `0.16,1,0.3,1`, easeInExpo `0.7,0,0.84,0`, easeOutBack `0.34,1.56,0.64,1`, …); maps straight to GSAP `CustomEase` |
| `beat-sync-editing/` | same | `frames_per_beat = 60 / BPM × fps`, a quarter/eighth/sixteenth grid table, cut-on-beat and speed-ramp techniques |
| `shot-composition/` | same | Safe areas, a 12-column grid worked through at 1920 wide, parallax bands (0.1–0.3× / 0.5–0.7× / 1.0–1.5×), camera moves |
| `color-motion/` | same | Colour in motion: OKLCH interpolation (no muddy midpoints), palettes, grading chains, colour management |
| `motion-art-direction/` | same | A "motion language" spec: one easing, one base time unit, one transition family, holds of at least 0.3 s; a direction playbook and checklist |
| `diagram-animation/` | [iart-ai/explainer-video-skills](https://github.com/iart-ai/explainer-video-skills) @ `3e2d411` | GSAP/SVG diagram and chart reveals (nodes, then edges, then labels; `pathLength=1` draw-on; `tl.pause(); tl.seek(t)`), pasteable into HyperFrames |
| `isometric-animation/` | same | Isometric maths (±30°, 2:1 dimetric at 26.57°), per-face shading, build-up order |
| `shader-glsl/references/glsl-cookbook.md` | [iart-ai/webgl-animation-skills](https://github.com/iart-ai/webgl-animation-skills) @ `50697d6` | Cosine palettes, simplex noise, fbm, domain warp, SDFs, dissolve/displacement/glitch transitions |
| `storyboard-and-qc/` | [iart-ai/javascript-animation-skills](https://github.com/iart-ai/javascript-animation-skills) @ `f7d0882` | Storyboard as data (BPM, sections, shots, events) and a QC checklist for code-drawn films |

These are guides, not installed skills; the `SKILL.md` files keep their names so their relative links work.

**Cautions.**
- Some snippets in `diagram-animation` and `isometric-animation` use `performance.now()` or CSS transitions. For frame-exact rendering, drive everything from the timeline's time instead.
- The `beat-sync-editing` and `motion-art-direction` skills mention sibling iart skills that are not copied.
- The simplex noise in the GLSL cookbook is Ashima Arts' webgl-noise (MIT); keep that credit if you ship it.
- Parts of `motion-art-direction` closely follow LottieFiles' motion-design skill (now in [`../../../skills/motion-design-principles/`](../../../skills/motion-design-principles/NOTES.md)).

**Changes from upstream.**
- **Removed.** The closing "Built by iart.ai" line (a UTM link to the iart.ai service) from each reference file, and the "Built by the team behind iart.ai" section at the end of `direction-playbook.md`, which asked the reader to let the service act as motion director.
- **Left out.** The empty per-skill READMEs.
- **Otherwise unchanged.**
