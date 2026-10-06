# motion-tools-and-skills

Tools, agent skills and prompts for AI-assisted motion design. The work covers code-rendered motion (Three.js + GSAP, HyperFrames, Remotion) and DCC tools driven by an agent (Blender, Unreal Engine Motion Design, ComfyUI).

> **Status:** scaffold only. Content is being added.

## Layout

| Folder | What goes here |
|---|---|
| `tools/` | Bridges and utilities, such as MCP bridges, QC and render-check scripts, and usage/cost collectors |
| `skills/` | Agent skills (`SKILL.md` plus references) for motion-design work |
| `prompts/` | Builder and critic prompts, and prompt templates |
| `starters/` | Minimal starter projects (Three.js + GSAP, HyperFrames, Remotion), without `node_modules` |
| `docs/` | Field guides, benchmark specs and write-ups |

## What stays out of git

Renders (`*.mp4`, `*.mov`, ProRes masters), Unreal caches (`DerivedDataCache/`, `Intermediate/`, `Saved/`, `Binaries/`), `node_modules/`, model weights and any `.env` files. All of these are in `.gitignore`.

## Third-party material

Anything vendored from another project keeps its own licence file and credit in its folder.

## Licence

[MIT](LICENSE) © 2026 Ahmed Albadri
