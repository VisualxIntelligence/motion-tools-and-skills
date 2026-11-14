# threejs-scene-fx — notes

**Source:** [MengTo/Skills](https://github.com/MengTo/Skills) @ `3cc9345` (14 Nov 2026): five skills from `agent-skills/3d/`. MIT, © 2026 Meng To ([LICENSE](LICENSE)). Copied 14 November 2026.

## What it is

Five Three.js skills for atmospheric scenes, extracted from Meng To's single-file scenes (Seijaku, Pirate Ship Sunset, Blue Hour). Two ship a working module you drop into your own scene; three are written guidance.

| Folder (skill name) | What it gives |
|---|---|
| `3d-ultra-realistic-water/` | **An open ocean** in `assets/ocean.mjs`: a deep-water Gerstner spectrum shaded per pixel from analytic derivatives, each wave faded at its own pixel footprint (no moiré at the horizon), Fresnel sky-cube and planar reflections, subsurface light through crests, HDR sun glitter, Jacobian lace foam, a Kelvin wake, hull foam, buoyancy queries and aerial perspective. `references/ocean.md` has the constants, render order and post |
| `3d-underwater-god-rays/` | **Volumetric light shafts under water** in `assets/underwater-light.mjs`: one drifting swell field marched along every view ray at half resolution, so the shafts converge on the sun, parallax with the camera and carry caustic streaks; a shimmering surface underside and dappled fish |
| `3d-sky-rays/` | Sun shafts in air shaped by roofs and foliage: a screen-space radial blur of an occlusion mask, with its limits |
| `3d-sky-background/` | A camera-correct sky (procedural atmosphere or panorama) with horizon haze, sunlight aligned to it and coherent environment lighting; golden hour and day-to-night |
| `3d-retina-resolution/` | Rendering at an explicit 200%: drawing buffer, renderer and post-processing sizes kept in sync, pointer coordinates, and measured fallbacks |

Both modules take the project's own `THREE` rather than importing a second copy (the ocean comes from an r169 scene), and neither reads a clock: the ocean takes `waves.update(dt)` and `ocean.update({ time, camera })`, and the god rays read a shared `uTime` uniform you set. So they render frame-exact when the film's clock drives them.

## When to use it

- **Seascapes, sunsets, underwater and outdoor 3D shots** in a Three.js film or a [`dioramas`](../../starters/dioramas/NOTES.md) page. They pair with [`tidewater-webgpu-fx`](../../starters/tidewater-webgpu-fx/NOTES.md) (an FFT ocean in raw WebGPU) when you need the three.js route instead.
- **`3d-retina-resolution`** for sharp 2× renders in any Three.js capture.
- **For video, drive time from the frame:** pass `time = frame / fps` and a fixed `dt`, not a `THREE.Clock`.

## Installing

Each subfolder is a skill. Copy or symlink each one you want separately, for example `3d-ultra-realistic-water/` to `~/.claude/skills/3d-ultra-realistic-water/` (see [`../README.md`](../README.md#installing-a-skill)). Upstream: `npx skills add https://github.com/MengTo/Skills --skill 3d-ultra-realistic-water`.

## Changes from upstream

- **Copied:** the five `SKILL.md` files, the two modules (`assets/`), `references/ocean.md`, `REFERENCES.md` files and the two demo prompts (`demo/PROMPT.md`); the repo's `LICENSE` added.
- **Left out:** the two built demos (`demo/index.html`, 0.8 and 1.8 MB, with three.js inlined), their build scripts and UI sources (they rebuild from reference scenes that are not in Meng To's repo either), `preview.jpg` stills and `agents/openai.yaml`. The water and god-rays `SKILL.md` files linked to `demo/index.html`; those two links now point at upstream's demos, pinned to the commit (the only edit to the copied files).
- **Not copied:** the other eleven 3D skills (materials, leaves, seasons, high-poly models, textures, virtual tour, orbit-inspect, a wood-lighting scorecard). They are good for interactive sites, less so for motion; see [`../../docs/reference-only.md`](../../docs/reference-only.md#13-sixth-survey-reviewed-not-copied).
- **Not run here.** Nothing in this folder was executed during the copy.
