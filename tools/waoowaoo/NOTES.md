# waoowaoo — notes

**Source:** [waooAI/waoowaoo](https://github.com/waooAI/waoowaoo) @ `dfec20e`, version 0.5.0-beta.1, a preview release. **Elastic License 2.0** from v0.5.0-beta.1 (the README says earlier releases were under a different licence). Read 24 November 2026. **Nothing copied:** it is a self-hosted web application, and ELv2 is source-available, not open source.

## What it is

A self-hosted **AI film and TV production workspace**. It describes itself as covering character design, storyboarding and video generation. In the 0.5 preview, the main surface is one project workspace:

- **A right-hand Assistant** that develops the brief with you and creates assets in the project.
- **A canvas** to upload references, organise files and inspect generated images and videos.
- **Model-aware generation**: aspect ratios, durations, resolutions and reference roles per model; first-frame, first/last-frame and reference-image modes where the model supports them.
- **Refine a result into a new version** while keeping the original.
- **Models through OpenRouter only** in this preview: GPT Image 2, Nano Banana variants, Seedance variants, and MiniMax H3 / H3 Max. Generations are billed to your own OpenRouter key.
- UI in Chinese and English.

**Stack:** Next.js 16 and React 19, MySQL with Prisma, Temporal for durable jobs, Redis, private MinIO storage, NextAuth, and a separate "Codex runtime" container.

## Installing (Windows workstation: inside WSL2)

The recommended route is the release's **prebuilt Docker images**, so no Node, MySQL, Redis, Temporal or FFmpeg is needed on the host.

- **Needs** Docker Desktop with Compose ≥ 2.24.4, Git, and `flock`. On Windows, run everything inside WSL2.
- **Follow `docs/INSTALL.md` from the same release tag.** It asks you to:
  - pin both the app and Codex-runtime images to their immutable digests;
  - generate fresh secrets in `.env`;
  - trust a local Caddy root certificate (Windows trust is separate from WSL).
- **Open** `https://localhost:1443`. Port 13000 only redirects.
- **Then** enter your OpenRouter key in the app's API configuration, never in a chat.

## Status for us

**Watch.** It is the closest open-source analogue to a hosted AI film studio: brief → references → generated images and video, versioned on one canvas. Compare it with Higgsfield's tools, or with our own ComfyUI route (`tools/comfyui-piflow/`, which runs MiniMax H3 locally on the 4090 instead of paying per call).

- **Preview.** The project says bugs and rough edges remain. External PRs are read but not merged.
- **Licence.** ELv2 allows personal and internal business use, modification and redistribution. It forbids offering it to third parties **as a hosted or managed service**, and forbids circumventing its licence-key functionality.
  - Running it internally for a team is fine.
  - Offering it to MAKEENA clients as a hosted service is not.
- **Data.** Projects and media stay in the local database and MinIO, but prompts and reference images go to OpenRouter and the chosen model provider. Keep unreleased or sensitive material out of it, as with any hosted model.
- **Generated footage** follows our production rules: label it as generated, and never present it as real footage.

**Not tested here.** It needs Docker and an OpenRouter key.
