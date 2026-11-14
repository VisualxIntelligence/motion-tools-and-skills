# dream-loop — notes

**Source:** [achimala/dream-loop](https://github.com/achimala/dream-loop) @ `9bddb90` (10 Sep 2026). MIT, © 2026 Anshu Chimala ([LICENSE](LICENSE)). Copied 14 November 2026.

## What it is

A **target-first critic loop** for high-fidelity 3D scenes, games and apps. The agent first gets a picture of the finished result, then builds towards it until an independent judge says the live screenshot matches.

1. **Target.** The user supplies a target image, or the agent generates one: a realistic in-engine screenshot of the finished thing, never "concept art". For an existing scene, it screenshots the current state and generates an improved version of *that*, so the target refines rather than diverges. Saved as `.dream-loop/target.png` and locked.
2. **Build.** A first pass at layout, materials, lighting and animation together.
3. **Self-test.** Fix bugs only (orientation, loading, errors), not looks.
4. **Judge.** A fresh subagent gets the live screenshot, the target, and the previous round's screenshot and verdict, and scores against the rubric below with a complete list of actionable gaps.
5. **Fix everything on the list**, test, capture, and judge again.

| Rubric (Pro workflow) | Points |
|---|---|
| Composition: camera, framing, position and scale of every major part | 0–3 |
| Lighting: palette, exposure, shadows, contrast, atmosphere, reflections, glows | 0–3 |
| Materials: texture, roughness, translucency, wetness; nothing blocky or plasticky unless the target is | 0–3 |
| Details: every small difference | 0–1 |

**Exit rules.** Score ≥ 8 at an acceptable frame rate: done, show the user. Score ≥ 8 but slow: optimise losslessly first, then re-judge. **Stall approaching** (no full-point gain in two rounds, or the same gap named twice): stop tweaking and rethink the scene, camera, assets or lighting wholesale. **Stalled** (the rethink did not help): stop and ask the user.

| Path | What it is |
|---|---|
| `SKILL.md` | Workflow choice, the target image, the time budget |
| `references/pro-mode/workflow.md` | You build, a fresh judge scores each round (the rubric and exit rules above) |
| `references/plus-mode/workflow.md` | A cheaper loop: a smaller orchestrator hands each pass to a stronger subagent, three rounds, then asks the user |
| `references/*/assets-3d.md` | Where 3D assets come from, in order: download (only if allowed), image-to-3D, Blender, procedural. Plus mode skips Blender as too slow |
| `references/fal.md` | Two checked fal.ai recipes: `tripo3d/h3.1/image-to-3d` for hero assets (about $0.30 each) and `fal-ai/trellis` for small props (about $0.02); asset input images are cut out of the target image so they match it |
| `scripts/fal-batch.mjs` | A dependency-free fal queue helper (Node 18+, `FAL_KEY` or `FAL_API_KEY`): submits ready jobs concurrently, keeps the queue URLs, never resubmits an accepted job. Unit tests in `fal-batch.test.mjs` |
| `scripts/preview-server.py` | A local static server with `POST /__capture`, so the page can post its own PNG to `.dream-loop/captures/latest.png` |

## When to use it

- **Raising the finish of a 3D piece**: a Three.js or WebGPU scene, a dioramas page, a Blender product shot. It complements the review loops already here ([`claude-motion`](../claude-motion/NOTES.md)'s frame review, [`img2threejs`](../img2threejs/NOTES.md)'s gates): those check a frame against rules, dream-loop checks it against a picture.
- **With Blender MCP.** dream-loop judges and Blender MCP builds: model in Blender, render or screenshot the viewport, judge, repeat.
- **For a film**, judge key frames (one still per shot) rather than the moving page; the rubric is about a still image.

## What it needs

- **Image generation** for the target and for asset cut-outs. Claude Code has none built in: give it an API (fal, Gemini) or a connected image tool, or supply the target yourself. Without one, the skill stops and asks, by design.
- **Vision** to read screenshots, and **subagents** for the judge (Claude Code's Agent tool).
- **Optional:** a fal key for image-to-3D, Blender for modelling, Python 3 for the preview server.
- **Token budget.** Without a time budget it runs until an exit rule fires, and says so. Give it one ("1 hour").

## Changes from upstream

- **`SKILL.md`, workflow choice.** Upstream picks Plus or Pro by ChatGPT subscription tier. Here Pro is the default, with the judge a fresh Claude Code subagent each round, and Plus is used when the user asks to keep usage low or a smaller orchestrator is running. The line says it was adapted.
- **Link fix.** The two `assets-3d.md` files linked `fal.md` as if it sat beside them; it is one level up, so the links now read `../fal.md`.
- **README** kept as `UPSTREAM-README.md`, its demo GIF pointed at upstream's copy (pinned to the commit).
- **Left out:** `assets/vesper-preview.gif` (7 MB).
- **Not run here.** Nothing in this folder was executed during the copy. Upstream reports testing only with GPT-6 Astra in Codex.
