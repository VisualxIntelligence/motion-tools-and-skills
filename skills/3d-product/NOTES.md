# 3d-product — notes

**Source:** [nicceasy/3d-product](https://github.com/nicceasy/3d-product) @ `b7e2025`, the `skills/3d-product/` folder plus the README (as `UPSTREAM-README.md`). MIT, © 2026 Nick Conn ([LICENSE](LICENSE)). Found through the athemeroy research list ([`../../docs/research/athemeroy/production-resources.md`](../../docs/research/athemeroy/production-resources.md)).

## What it makes

Hardware product films in **Blender**, end to end, from a prompt and a reference (a design patent, a few photos, a video or CAD) to graded sequences. The demo is a 98-second film of a 1976 turntable modelled from its US design patent (median 0.4 mm off the drawings), rendered in Octane on four GPUs and finished by script; the author did not operate Blender, Octane or Resolve by hand.

`SKILL.md` runs 14 stages, each closed by a **measured gate**, with the user deciding only at the starred points (intention, composition stamps, shot list, animatic, music, the go for each act):

0. brief and research → 0.5 probe the machines (`scripts/probe_setup.py` picks Cycles or Octane and writes a render budget) → 1 intention → 2 modelling from drawings (overlay and photo-match residuals, mesh QA, no undeclared overlaps) → 3 materials → 4 environment (location or studio, "lived-in" sets) → 5 lighting, grey box first → 6 engine settings at a matched noise target → 7 compositions, shots and script together (compositional analysis of every frame) → 8 first, key and last frames → 9 motion, animatic, cut (`motion_qa.py`) → 9.5 sound and music (`loudness_profile.py`) → 10 production readiness → 11 production render (with an overnight render supervisor shell script that restarts hung jobs without spending AI credits) → 12 finishing (graded in Resolve by script) → 13 review and delivery.

`references/` holds 40 topic guides: patent-to-model, hard-surface modelling, wear materials, glass and light, lighting, camera motion, transition shots, greybox composition and animation, Cycles and Octane production, render supervision and farms, finishing, sound design, an "Apple rubric" for judging shots, and `traps.md`, a list of failures to avoid.

## When to use it

- Any **product or object film in Blender**: hardware, devices, objects in a set. It is the most complete agent-driven Blender pipeline in this repo, and a good model for the Blender leg of our motion-design benchmark even when the subject is not a product.
- As a reference for **measured gates**: how to make an agent prove each stage (residuals, noise targets, composition scores, loudness) before spending render time.
- Selected references stand on their own: `camera-motion.md`, `transition-shots.md`, `lighting.md`, `glass-light.md`, `sound-design.md`, `traps.md`.

## Requirements

- Claude Code; Blender 5.x (tested on 5.2); Python 3.11+ with numpy, scipy, Pillow, scikit-image and OpenEXR (build123d for B-rep modelling); ffmpeg.
- **DaVinci Resolve Studio** (paid) for the scripted finish, tested on 21.1.
- Optional: **OctaneRender** for Blender and OctaneServer (tested on 31.10) on an NVIDIA machine for finals; without it the pipeline renders in Cycles. Our RTX 4090 workstation can run either.
- Optional: FigJam through the Figma MCP server for review boards (`references/figjam-board.md`); an AI music generator for temp music (check the service's licence).
- Windows: the render supervisor and hook examples are shell scripts; `SKILL.md` notes that on Windows renders must be launched through an interactive-session task, because jobs started over ssh run in session 0.

## Install

```
/plugin marketplace add nicceasy/3d-product
/plugin install 3d-product@3d-product
```

Or `npx 3d-product` (copies the skill to `~/.claude/skills/3d-product`), or copy this folder there (see [`../README.md`](../README.md#installing-a-skill)). Then run `python3 ~/.claude/skills/3d-product/scripts/probe_setup.py --out setup.json` first; it reads your machines and recommends a render path.

## Changes from upstream

None. The repo's images (`assets/`), plugin manifests and `package.json` are left out.
