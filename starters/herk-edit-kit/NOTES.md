# Herk Edit Kit (HyperFrames video pipeline) — notes

**Source:** [nateherkai/hyperframes-student-kit](https://github.com/nateherkai/hyperframes-student-kit) @ `10511e5` (14 Oct 2026), version 2.0.0 ("Herk Edit Kit", formerly the HyperFrames Student Kit). Copied 24 November 2026.

You linked [nateherkai/hyperframes-video-pipeline](https://github.com/nateherkai/hyperframes-video-pipeline) @ `20a35c8` (8 Sep 2026). Its README says it is the earlier release and that the pipeline now lives in the student kit, which adds the short-form editing workflow, the editing playbook and four more skills. So the copy here comes from the newer kit.

**Licences, two grants:**
- The original kit material: **MIT**, © 2026 Nate Herk ([LICENSE](LICENSE)).
- The imported pipeline resources (the editing skills, the style library, the templates, the shared editing tools and the short-form workflow): the **Herk Edit Kit Use Permission** ([licenses/PIPELINE-USE-PERMISSION.txt](licenses/PIPELINE-USE-PERMISSION.txt)). It allows use, copying, modification and sharing, and making personal or commercial videos, provided the notice is kept.
- HyperFrames: Apache-2.0 ([licenses/HYPERFRAMES-LICENSE](licenses/HYPERFRAMES-LICENSE)). Third-party notices: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). "Vox", "Kallaway" and "Infinite" are aesthetic reference names only, not brand assets.

## What it does

**An AI editor for talking-head footage**, for Claude Code and Codex. Bring a recording; the agent transcribes it, cuts dead air and flubs (each cut reviewed by you), plans the story, adds motion graphics, captions, B-roll, music and sound, and renders through HyperFrames. This is a workspace: open the folder in Claude Code and the skills in `.claude/skills/` load.

| Skill | Does |
|---|---|
| `edit-video` | The whole long-form edit, routing to the specialists below |
| `cut-silences` | Agent 1. Removes dead air before, after and between words (pauses trimmed to a natural breath), from a word-level transcript; writes an EDL, a re-timed transcript, and with `--apply` the cut video |
| `cut-mistakes` | Agent 2. Finds stutters, repeats, false starts and retakes; proposes every cut with context and a reason; applies only the cuts you approve |
| `video-storytelling` | Designs the visual layer of a long video as **one persistent world the camera moves through**, not a run of separate graphics; fixes edits that feel "clearly made by an AI" |
| `hyperframes-video-beats` | Plans, times and validates motion-graphic beats for long talking-head videos: glass lower thirds, crumpled-paper full-screen takeovers, transcript-synced callouts, retention pacing |
| `short-form-edit` | Reels, Shorts and short ads: curiosity hook, earned payoff, story cuts, synced graphics, moving B-roll, captions, subtle music and SFX, with plan and footage validators |
| `motion-showreel` | A 10–30 s brand reel: one motif through labelled craft chapters, a HUD, cuts on a 120–130 BPM grid, a sub-second flurry, a held logo lockup |
| `style-library` | Picks, customises or extends the card library |
| `make-a-video` | Beginner front door: one interview, then a finished MP4 |

- **406 draft motion-graphics cards** in two styles (`style-library/01-vox-explainer`, `02-kallaway`), each an HTML card with a manifest, CSS tokens and editable slots; `registry.json` is searchable. Two scene templates (`style-templates/`: dark graph paper, left glass pop-out).
- **Tools** (`scripts/`): ElevenLabs Scribe transcription, beat-sync validation, an EDL review page, transcript conversion from video-use, preflight checks, a project scaffold.
- **[`docs/EDITING-PLAYBOOK.md`](docs/EDITING-PLAYBOOK.md):** the measured house style from 27 top Instagram reels. Pacing: speech within 0.1 s, phrase gaps under ~0.2 s, shots 1.1–1.4 s and never over ~2.8 s, the first cut at 0.6–1.0 s on the first charged word. Layouts for 9:16: split, full B-roll, punch-in, with the speaker never off screen for more than ~3.5 s. Captions: 1–3 words, hard swaps 2 frames early, colour on 25–45 % of chunks, never over the mouth. Sound: music ~11 dB under the voice, SFX only on visible actions, master −14 LUFS and ≤ −1.5 dBTP measured on the encoded file.
- **[`MOTION_PHILOSOPHY.md`](MOTION_PHILOSOPHY.md):** 11 laws from a deconstructed payments spot (one idea per ~1.5 s beat, black canvas, light as the brand, a camera that never sleeps, type as a character), plus a HyperFrames trap: a sub-composition whose timeline is shorter than its slot flashes black.

## When to use it

- **Presenter videos**: LinkedIn explainers recorded to camera, interviews, course videos. `cut-silences` and `cut-mistakes` are the first thing the repo has for cleaning raw speech; nothing else here edits footage.
- **Vertical cuts** of a long video for Reels and Shorts (`short-form-edit`).
- With [`talking-head-b-roll`](../../skills/talking-head-b-roll/NOTES.md) for graphics timed to words, and [`tools/whisperx/`](../../tools/whisperx/NOTES.md) for a local, Arabic-capable transcript in place of ElevenLabs (the cutters accept a generic `{ words: [{ text, start, end }] }`).
- The playbook's numbers are for Nate's English Instagram reels; for Al Jazeera keep the broadcast rules and use them as a starting point.

## Requirements

Node 22+, ffmpeg with ffprobe, Chrome or Chromium; `npm ci` installs HyperFrames 0.7.109, GSAP 3.14.2 and Playwright. Optional services: **ElevenLabs** (`speech_to_text`) for transcription, **Kie.ai** for generated music, images and video in `motion-showreel` (bring your own keys in `.env`; transcription uploads your audio). The HyperFrames skills (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `gsap`) are not copied: install them with `npx skills add heygen-com/hyperframes`, or use the HyperFrames plugin.

```bash
cd starters/herk-edit-kit
npm ci && npm run setup && npm test
npm run demo && cd video-projects/demo && npx hyperframes preview
# then in Claude Code, in this folder:
#   /edit-video  Edit my recording at <path>. Tighten dead air, show me the mistake cuts, dark graph-paper style.
```

**Tested here 24 November 2026:** `node --test tests/*.test.mjs` passes **11 of 11** without installing anything: silence cutting on the synthetic fixture, mistake candidates and cut application, EDL output, and the short-form plan and footage validators. The ffmpeg media smoke test (`scripts/smoke-media.mjs`), HyperFrames renders and transcription were not run.

## Changes from upstream

- **Copied:** nine skills into `.claude/skills/` (above), `style-library/`, `style-templates/`, `scripts/`, `tests/`, `docs/*.md`, `examples/editing`, `examples/short-form`, `examples/starter`, `MOTION_PHILOSOPHY.md`, `AGENTS.md`, `CLAUDE.md`, `THIRD_PARTY_NOTICES.md`, `licenses/`, `LICENSE`, `package.json`, `package-lock.json`.
- **Left out:**
  - The bundled HyperFrames skills (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `gsap`), the legacy `short-form-video` and `website-to-hyperframes`.
  - The generated Codex mirror `.agents/skills/` (rebuild with `npm run sync:skills`) and `.codex/`.
  - `video-projects/` (287 MB of teaching projects), `examples/showcase/` (111 MB of Nate's finished videos), `assets/`, `docs/images/`, `docs/superpowers/`, `DESIGN.ais-example.md` and the README.
- **Changed:** the two test files, `scripts/smoke-media.mjs` and `docs/WORKFLOW.md` called scripts through `.agents/skills/` (the Codex mirror); they now point at `.claude/skills/`, so the tests run without the mirror.
- **Added:** this `NOTES.md`.
