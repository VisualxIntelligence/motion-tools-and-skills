# ai-camera-control — notes

**Source:** [sirioberati/ai-filmmaking-camera-control-seedance-2-5](https://github.com/sirioberati/ai-filmmaking-camera-control-seedance-2-5) @ `602aa23` (7 Nov 2026), v0.1.0. MIT, © Sirio Berati ([LICENSE](LICENSE)); third-party terms in [NOTICE.md](NOTICE.md). Copied 26 November 2026.

## What it makes

**AI video shots whose camera you wrote in code.** You build the move in three.js as a grey set where every person is a striped capsule (a "pill") or a pin, as tall as the person and with a dot where the eyes face. That clip goes to Seedance 2.5 as the reference video, with a photo and a prompt. A reference video carries two things, where the camera goes and how the bodies move, and the model copies both. The pill gives it a camera to follow and no body to copy, so the move, speed, framing and cuts come from your code, while the model makes the people and the place.

| Part | Where | What |
|---|---|---|
| Engine | `engine/cinematic/` | three.js inside Remotion: sets, stand-ins, rigs, camera feel and HUD, physics bakes (Rapier), a path tracer for stills, frame and motion checks |
| Templates | `templates/<ID>/` | **137 moves** as `template.ts` (about 12 lines each), with `prompts/`, `sent.json` (what was sent, in order) and `reproduce.md`. Families: CAM (camera moves), ANG (angles), OBJ/PRD (product), ACT (action), SC (scenes), ONE (one-takes), FAM (famous-shot rebuilds), STORY, SHOW |
| Skill | `skills/cinematic-previs/` | Previs as a clay film: beats → shot list with lens, height, rig and one named move per shot → one look still → measured frame checks → contact sheet the user signs off → draft → final → reference package. The rulebook covers shot sizes, lenses, rig physics, cuts, pacing and AI-video prompt syntax |
| Method | `docs/` | `idea.md` first; then `rules.md`, `prompt-anatomy.md`, `camera-language.md`, `failure-ladder.md`, `failures-and-fixes.md`, `seedance-notes.md`, `costs.md`, `known-limits.md`, the `why/` pages, and Tein's API and MCP reference in `docs/tein/` |
| QA | `tools/seedance/` | Sketch-sheet maker, prompt builders, and checks for camera, cuts (`qa_cuts.py`), framing, speech (Whisper) and mouth movement. Local files only; nothing sends or spends |
| Evidence | `answers/` | 137 questions about the method, each with its evidence; 4 marked UNPROVEN |
| Places | `environments/` | 24 place moods as prompts and analysis (the pictures were not copied) |

## When to use it

- **AI film shots that must hit an exact camera move or cut**: the Higgsfield Talent Contest entry, Signature Heist inserts, product hero shots. Measured upstream: the pill-video route landed 9 of 9 cuts on one film; the cheaper sketch-sheet route (a contact sheet of drawn frames) landed 1–3 of 9, drifting 0.2–0.7 s.
- **Previs and animatics** for any film, even with no AI video: the `cinematic-previs` skill and its rulebook stand alone. In Blender, use it beside `skills/blender-agent-skills/`.
- **Not for code-rendered motion graphics.** Those are already exact; this is for when a video model draws the picture.

## The rules that matter most

- Name every stand-in in the prompt and say no pill appears in the result. Rebuild the set in words, or the model copies the grey cones and boxes.
- Move the camera in every clip you send. Hold every shot and every camera effect for **2 s or more**. Locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03, the ANG family) are camera studies, not templates to send.
- Spoken lines go in their own block near the top of the prompt. Expect speech to start 1–2 s early and the odd doubled word.
- Keep every reference video under **29 s** in total.
- Draft first, judge the draft against the pill clip, and finalise only a draft that is right. A repeat run is a new take, even with the same prompt; there is no seed.
- Use a photo of yourself or of someone who agreed.

## Sending through Higgsfield instead of Tein

Upstream sends through Tein (`docs/tein-endpoint.md`). The same request runs on our Higgsfield account: its `seedance_2_5` model takes reference videos, images and audio, 4–30 s, up to 4K, with 480p drafts that can be finalised within seven days (read from Higgsfield's model catalogue on 26 Nov 2026). **Not yet test-sent from here: it spends credits.**

| Tein field (`docs/tein-endpoint.md`) | Higgsfield `generate_video` |
|---|---|
| `"model": "seedance-2-5"` | `model: seedance_2_5` (or `seedance_2_5_flash`: 480p/720p only, cheaper) |
| `omni_reference_task_type: reference` | `mode: omni_reference` (`video_edit` and `video_extension` also exist) |
| `reference_video` (the pill clip) | `medias` with role `video_references` (max 10) |
| `reference_image` (your photo) | role `image_references` (max 30 with start and end images) |
| `reference_audio` | role `audio_references` (max 10) |
| `duration`, `resolution`, `ratio` | `duration` (4–30), `resolution`, `aspect_ratio` (21:9 is offered) |
| `draft: true` | `draft: true`, then finalise with `draft_job_id` at the final resolution |
| `pass_faces: true` | No matching parameter listed; Higgsfield's own face rules apply |

Price the take with `estimate_video_cost` before sending, and get a yes for that exact request (upstream `docs/rules.md` §5). Upstream's credit figures in `docs/costs.md` are for an earlier provider and do not apply.

## Requirements

- **Node 22.12+** and **ffmpeg** for the engine (`cd engine/cinematic && npm install`, then `tools/render-pill.sh CAM06-Orbit` → a 7 s, 24 fps, 1280 × 534 clip in `.work/out/pill/`). Remotion downloads a headless Chrome on the first render.
- **The rig GLBs are not in this repo** (16 MB). Copy `engine/cinematic/public/kit/UAL1_Standard.glb` and `UAL2_Standard.glb` from upstream at `602aa23` (CC0, Quaternius Universal Animation Library) and check them with `sha256sum -c SHA256SUMS` in that folder. The pin stand-in needs them; the capsule may not.
- **Python 3** with numpy and Pillow for `tools/seedance/`; mediapipe (Python 3.10) and Whisper for the optional face and speech checks.
- A Higgsfield or Tein account to generate.

## Licences and cautions

- **Remotion's licence applies to the engine.** It is free for individuals and for-profit teams of up to 3; Al Jazeera or MAKEENA work needs Remotion's company licence. The alternative is to rebuild a template's camera in our own time-pure three.js page (`tools/photo-parallax/` already has dolly, truck, orbit, crane and vertigo moves) and render it with `tools/headless-render/`; the pill clip is just grey geometry and a camera.
- **`engine/cinematic/src/kit/filmpaths.json`** holds 33 camera curves distilled from the E.T. dataset, which was estimated from copyrighted films. The curves only are shipped, with source ids. Check the dataset's terms before using them in a product.
- **Example faces and brand marks** in upstream's results are not licensed and were not copied. Generated outputs follow the terms of the service used.
- The famous-shot templates (FAM, some ACT) imitate known film shots. Film names are trademarks; rebuild the move, not the scene.

## Changes from upstream

- **Copied.** All code, templates (`template.ts`, prompts, `sent.json`, READMEs), the engine source and tools, the skill, `docs/` text, `tools/`, `answers/`, `environments/*.json`, the Quaternius licence and checksums.
- **Left out (689 MB → 13 MB).** Every video, GIF and picture: the 137 `pill.mp4` and `preview.gif` files, sketch sheets, `docs/assets/`, the 24 environment pictures, `gallery/`, `build-report.json`, and the two rig GLBs. Links in the copied READMEs to those files are broken here; clone upstream or download the v0.1.0 release (`camera-control-results.zip`) to see them. `tools/render-pill.sh` rebuilds any pill clip.
- **Not tested here.** The render, the QA scripts and a Seedance send. The sandbox would not run the downloaded engine. Render CAM06-Orbit on the workstation first.
