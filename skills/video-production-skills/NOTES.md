# video-production-skills — notes

**Source:** [Ucmp0001/video-production-skills](https://github.com/Ucmp0001/video-production-skills) @ `ea682de`: the `skills/` folder, `scripts/install_skills.py`, the English README (as `UPSTREAM-README.md`) and the third-party notice. MIT, © 2026 Video Production Skills contributors ([LICENSE](LICENSE)); method references credited to [trustfuture/simon-skills](https://github.com/trustfuture/simon-skills) (MIT, [`licenses/simon-skills-MIT.txt`](licenses/simon-skills-MIT.txt)). Found through the athemeroy research list.

## What it is

Eleven small skills that cover the **editorial side** of a video: sources, script, shots, explanatory motion, generated b-roll, voice and captions, cover, release QA. They do not render anything themselves; they produce the documents and checks that a renderer (HyperFrames, Remotion, Three.js, Blender) works from. Each skill has a Chinese `SKILL.md` that routes English requests to the `SKILL.en.md` beside it, with templates in `references/`.

| Skill | Use it to | Main output |
|---|---|---|
| `video-workflow` | Start or resume a project | A project card: current stage, plan, delivery status |
| `video-source-index` | Index footage you already have | Timecoded intervals with provenance and rights (`scripts/source_manifest.py`) |
| `evidence-story-script` | Turn sources into a script | Voice-over with each claim tied to its evidence, an opening payoff |
| `video-shot-planner` | Plan visuals for a script | Shot table, asset gaps, alternatives |
| `explainer-motion` | Explain a process or data with motion | A 2D/3D motion brief built on observable state changes, then implementation and preview |
| `generated-broll` | Add conceptual generated shots | Generation plan, budget, recoverable tasks |
| `voice-subtitle-sync` | Prepare voice and captions | Measured timing and subtitles, checked (`scripts/check_srt.py`) |
| `cover-art-direction` | Design a thumbnail or cover | Headline, composition, exports per ratio |
| `cover-independent-review` | Review covers with a separate agent | A report based on the actual images |
| `video-release-qa` | Check the export and platform copy | QA record, copy, delivery index |
| `video-reference-study` | Learn from a reference video | Observations, methods, what applies |

## When to use it

For **news explainers and daily briefs** these are the useful ones: `evidence-story-script` (every on-screen claim tied to a source, the same discipline as the Evidence Films styles in [`../../prompts/film-styles/`](../../prompts/film-styles/README.md)), `explainer-motion` (a brief that tells the motion what to explain, not just what to look like), `voice-subtitle-sync` (caption timing measured from the actual voice file) and `video-release-qa`. They pair with our HyperFrames + ElevenLabs news pipeline: these skills write and check, the pipeline renders.

## Install

Pick the skills you want; existing skill folders are never overwritten.

```
python scripts/install_skills.py --target ~/.claude/skills --skill evidence-story-script
python scripts/install_skills.py --target ~/.claude/skills            # all eleven
```

On Windows use `py` and `%USERPROFILE%\.claude\skills`. Or copy single folders from `skills/` by hand. Both the Chinese and English files are copied together.

## Changes from upstream

None to the copied files. Left out: the docs (beginner guide, FAQ), the fictional practice example, the tests and the packaging scripts (`validate_package.py`, `privacy_scan.py`); see upstream.
