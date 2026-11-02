# img2threejs — notes

**Source:** [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) @ `954cd58` (skill v2.0.0). Apache-2.0 ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it makes

An agent skill that turns **one reference image of an object or character** into a TypeScript factory for a `THREE.Group`, built entirely in code: primitives, generated geometry and procedural shaders, with no mesh files. The result comes with named pivots, sockets and colliders, so GSAP or a HyperFrames page can animate its parts.

The skill is a gated pipeline, not a one-shot prompt:

1. **Intake.** Image analysis against a rubric, `probe_image`, a reference admission check, PBR and colour evidence.
2. **Spec.** A pre-spec assessment (a BM25 search over a local 3D vocabulary), then a sculpt spec that a strict validator must pass.
3. **Build in passes.** Blockout → structure → form → material → surface → lighting → interaction → optimisation.
4. **Review after every pass.** The model is rendered, put on a side-by-side comparison sheet with the reference, and judged by the agent's vision. Deterministic gates check multiple angles, silhouette interiors, left/right mirroring, curves and part coverage.
5. **Bounded fixes.** At most 3 correction rounds per pass and 6 in total.

`forge/next.py` keeps a resumable checklist in `.img2threejs/state.json`, so a run can stop and continue. "Token-efficient" means the stdlib Python scripts do the validation and bookkeeping, and the model only judges one comparison sheet per pass and writes code.

## What is here

| Path | What it is |
|---|---|
| `SKILL.md` | The router: step order, hard rules, which script to run when |
| `forge/` | About 90 stdlib Python modules in five stages: `stage1_intake`, `stage2_spec` (spec writer and validator), `stage3_build` (code generator, UV unwrap, decimation, visual hull), `stage4_review` (comparison sheets, render diagnosis, turntable gate), `stage5_rig` |
| `grimoire/` | Reference: intake rubrics, `geometry_patterns.md`, Three.js skin and cloth materials, stylised hair, head construction, the gate reference |
| `docs/materials/` | A Three.js PBR and colour-space reference (`THREEJS_MATERIAL_REFERENCE.md`, `material-reference.json`). Useful on its own |
| `docs/standard-prompts/` | Ready prompts: build, GLB force-measured, polish, VFX |
| `docs/specs/vocabulary/` | The JSONL vocabulary the pre-spec search uses |
| `docs/ARCHITECTURE.md`, `docs/TOKEN_COST.md` | How it fits together; what a run costs |
| `docs/INSTALL.md`, `docs/PLUGINS.md` | Install options and the domain-plugin system (`SKILL.md` links both) |
| `docs/GLB_*_PROMPT.md` | Four prompts for the separate GLB character route (build, rigging and animation, polish) |
| `UPSTREAM-README.md`, `ROADMAP.md` | Upstream's README (renamed) and roadmap |
| `skills/generic-extract-skill.md` | A short prompt: image → JSON parts and PBR breakdown |
| `scripts/capture_threejs_playwright.py` | Captures the browser canvas for the review sheets |

## When to use it

- Turning a news object (a device, a vehicle, a landmark, a product) into a **code-built Three.js asset** that animates cleanly in a Three.js + GSAP or HyperFrames explainer, without licensing a mesh.
- As a reference: `docs/materials/` and `grimoire/geometry_patterns.md` are worth reading for any Three.js build.
- **Not for daily use.** By its own estimate (`docs/TOKEN_COST.md`) a run costs about 80k–180k tokens per object and 150k–350k per character. For a quick hero object, `skills/3d-product/` (Blender) or a generated GLB (`starters/dioramas/`) may be cheaper.

## Requirements

- Python 3.10+ (standard library only), Node 18+, Git. The generated TypeScript needs the `three` package and its examples (EffectComposer, BokehPass, RoomEnvironment).
- **A screenshot path is mandatory:** Playwright, or a browser MCP, plus an agent that can read images.
- **Windows:**
  - The docs call `python3`; use `python` or `py -3`.
  - `build-character.sh` and `character_audit.sh` (referenced, not copied) are bash.
  - The upstream installer needs symlinks (Developer Mode). Copying this folder into `%USERPROFILE%\.claude\skills\img2threejs` avoids it.

## How to use

Copy or link this folder into your skills folder (see [`../README.md`](../README.md#installing-a-skill)), open an agent in an empty project folder, give it a reference image, and ask for an animatable Three.js model of the object. The skill starts with:

```
python3 forge/state.py init --state .img2threejs/state.json --reference <img> --profile generic --spec object-sculpt-spec.json
python3 forge/next.py --state .img2threejs/state.json object-sculpt-spec.json
```

and follows `next.py` from there.

## Changes from upstream

Upstream's `README.md` is kept as `UPSTREAM-README.md`, with the two links to it in `docs/ARCHITECTURE.md` and `docs/INSTALL.md` updated; otherwise the copied files are unchanged. The README, roadmap and some docs still link to upstream files that are not copied (`CHANGELOG.md`, `CONTRIBUTING.md`, `integrations/`, `docs/UPGRADE_PLAN.md`); read those on GitHub. Left out:

- **`integrations/`.** SAM2, Depth Anything V2 and MediaPipe vision helpers, a GLB character pipeline, and a client for a hosted TRELLIS space. They need torch and model downloads under their own licences (TRELLIS carries an NVIDIA licence), and they sit outside the stdlib-only core. `SKILL.md` mentions `integrations/reference_fidelity_tooling.md`; fetch it from upstream if you want the optional tooling.
- **`forge/tests/`** (1.3 MB) and the CI scripts.
- **Upstream packaging:** the npx installer (`bin/`), sponsor logos and branding (`assets/`), `docs/raw/` (a NotebookLM-distilled dataset), and the other `docs/` files.
- **Domain profiles.** `SKILL.md` refers to domain profiles and plugins (`plugin-character`, `plugin-cs`, the `img2` harness commands) that live outside this repo; the `generic` profile works without them.

## Cautions

- **Fast-moving.** Upstream changes almost daily; check `CHANGELOG.md` upstream before refreshing.
- **A known harness defect.** Upstream `LAB-FINDINGS.md` records that a step can report success when it did nothing. Check the comparison sheets yourself.
- **Untested here.** The copied scripts were not run while assembling this repo.
