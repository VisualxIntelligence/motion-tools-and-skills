# animated-diagrams (animated-svg) — notes

**Source:** [omkamal/animated-diagrams-skill](https://github.com/omkamal/animated-diagrams-skill) @ `3de812d` (12 Jun 2026), version 0.1.0, the whole skill. Apache-2.0, © 2026 Omar Kamal ([LICENSE](LICENSE), [NOTICE](NOTICE)). Bundled fonts are OFL ([licenses/](licenses/THIRD_PARTY.md)), the Font Awesome icons CC BY 4.0, GSAP under GreenSock's no-charge licence. Copied 24 November 2026. The skill calls itself `animated-svg`; the folder is named for the repo.

## What it makes

**Technical diagrams that animate**: a plain-language description, or an existing PNG, SVG, Mermaid or PlantUML diagram, becomes semantic SVG plus one GSAP timeline, rendered through HyperFrames to MP4, GIF, a static SVG and a single-file interactive HTML player with a scrubber.

- **Diagram types:** cloud architecture (AWS, GCP, Azure or generic), sequence diagrams (messages travel in their own direction, replies come back dashed), flowcharts and swimlanes, network and data-flow schematics, concept illustrations from Iconify cliparts, and **Python code walkthroughs** (a highlight bar glides between line ranges, other lines dim, the camera moves through the file).
- **Choreography in five acts:** Establish → Build → Connect → Flow → Resolve. Nodes enter in request-flow order, edges draw on (DrawSVG), a data pulse rides the path (MotionPath), emphasis lands last.
- **Camera rig** for flows bigger than the frame: guided tour, follow-cam, vertical scroll, conveyor, pulse-zoom, reveal-pan.
- **12 style presets**, each with its own motion language: light, dark, blueprint, sketch, corporate, pastel, mono, editorial, vivid, glass, brutalist, wireframe (`assets/gallery/styles-gallery.html`).
- **Voice-over sync:** give it an SRT or VTT and every beat fires on its cue; the narration is muxed into the MP4 (`scripts/srt_to_cues.py`, `references/voiceover-sync.md`).
- **Arabic and RTL:** `--lang ar` loads Cairo, Amiri, Tajawal and Reem Kufi (bundled) and **mirrors the flow geometry**: the entry node sits on the right and arrows point left.
- **Outputs:** MP4 (H.264), GIF, static SVG with fonts embedded, interactive HTML, and on request WebM or MOV with alpha, PNG sequences and 4K.
- A `diagram-animator` subagent (`agents/`) and a frame-review step: the skill reads its own contact sheet before handing over.

## When to use it

- **Architecture and process explainers** for the LinkedIn news videos: how an AI agent calls tools, a request through a cloud stack, a model pipeline, a sequence of API calls.
- **Arabic diagrams for Al Jazeera work**, where most diagram tools fail on joining and direction. Tested below.
- **Code walkthroughs** for technical explainers, with the voice-over driving the focus.
- Not for illustration-led explainers; for those see [`anatomy`](../anatomy/NOTES.md), [`hairline`](../hairline/NOTES.md) or the explainer grammars in [`docs/guides/explainer-grammar/`](../../docs/guides/explainer-grammar/NOTES.md).

## Requirements

Node 22+, ffmpeg, Python 3 and Chrome or Chromium. `bash scripts/setup.sh` runs `npm ci` (HyperFrames 0.6.91 and GSAP 3.15.0), vendors GSAP into `assets/vendor/gsap/`, checks for Chrome and does a warm-up render. Iconify cliparts are fetched at authoring time by `scripts/fetch_clipart.mjs` into your project, each under its own set's licence (attribution is yours to keep; see `references/concept-illustrations.md`).

## Using it

```bash
bash skills/animated-diagrams/scripts/setup.sh            # once
bash skills/animated-diagrams/scripts/new_project.sh checkout-flow --lang ar --theme dark --dir ./films
node skills/animated-diagrams/scripts/render.mjs --project films/animated-svg-checkout-flow \
  --output films/animated-svg-checkout-flow/renders/checkout.mp4 --gif --svg --snapshots 5 --probe
```

Then ask Claude Code: *"animate this architecture diagram"*, *"animated sequence diagram of the login flow"*, *"walk through this Python function with my voice-over"*.

**Tested here 24 November 2026:**

- `npm ci` failed on `onnxruntime-node`'s post-install download (the network here blocks it). **`npm ci --ignore-scripts` works**: onnxruntime is only for HyperFrames' transcription, not rendering.
- `new_project.sh demo-ar --lang ar --theme dark` scaffolded a project with fonts and GSAP copied in.
- The upstream `arabic-architecture` example, moved into that project, rendered a 13 s 1080p30 MP4 in screenshot mode on system Chrome. The contact sheet showed correct Arabic joining in Cairo, the flow mirrored right to left, and edges drawing on over time.
- **Trap:** the files in `examples/` link `../../assets/...` and do **not** render in place, because the renderer serves only the project folder (fonts and GSAP fail silently and you get a static frame). Scaffold with `new_project.sh` and copy an example's `index.html` and `theme.css` in, changing `../../assets/vendor/gsap/` to `./vendor/` and `../../assets/fonts/` to `./fonts/`.
- **Trap:** `hyperframes snapshot` does not run external `<script src>` files, so snapshots of a timeline in an external script show the static DOM. Keep the timeline inline, as the template does.

## Changes from upstream

- **Copied:** `SKILL.md`, `agents/`, `assets/` (fonts, themes, template, gallery, icons, vendored GSAP), `references/`, `scripts/`, `licenses/`, `LICENSE`, `NOTICE`, `package.json`, `package-lock.json`, and the source of the seven examples (`index.html`, `theme.css`, cliparts, the narration SRT). Unchanged.
- **Left out:** rendered media (`examples/*/renders/`, the example narration WAV, `docs/media/`, about 27 MB) and the README.
- **Added:** this `NOTES.md`.
