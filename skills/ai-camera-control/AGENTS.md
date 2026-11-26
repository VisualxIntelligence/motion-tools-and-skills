# AGENTS.md: AI filmmaking camera control with Seedance 2.5 and three.js

For AI agents (Claude, Codex, Cursor, others). Read this first.

## What this repo is
A way to control the camera of a Seedance 2.5 video. You write the camera move in three.js, render a grey "pill clip" (people are striped pills), and send that clip to Seedance 2.5 as the reference video with a face photo and a prompt. The model copies the camera and invents the people and the place. 137 ready templates, each with code, clip, prompts and results.

## Generate through Tein
Videos are generated with Seedance 2.5 on Tein (tein.ai), by the Tein MCP or the Tein API. This needs the person's own Tein key (`TEIN_API_KEY`). They sign up at https://tein.ai and create the key there. Never ask for the key in chat, never write it to a file, never commit it. Setup and the full reference: `docs/tein-endpoint.md` and `docs/tein/` (`api-reference.md`, `mcp-setup.md`, `limits.md`, `billing.md`).

## Rules for agents
1. Never send a request to a video service, and never spend credits, without the person's explicit yes for that exact request. Show the request and the price first.
2. Start with a 480p draft (`draft: true`), check it against the pill clip, and finalize only when it is right.
3. Move the camera in every clip you send. Hold every shot 2 seconds or more.
4. The stand-in is a striped pill with no limbs. Name every stand-in in the prompt and say no pill appears in the result. Rebuild the set in words.
5. Prompts under `templates/<ID>/prompts/` are examples, and `sent.json` says whether each was the text sent, a recovered copy or a rebuilt one. Rebuild before reuse.

## Where things are
| Need | Open |
|---|---|
| The idea in one page | `docs/idea.md` |
| All the rules, with why | `docs/rules.md` |
| Pick a template | `templates/INDEX.md` (137, with previews), then `templates/<ID>/README.md` |
| Render a pill clip | `cd engine/cinematic && npm install && tools/render-pill.sh <ID>` (Node 22.12+, ffmpeg) |
| Write a prompt | `docs/prompt-anatomy.md` |
| Build your own template | `docs/build-your-own-template.md` |
| Send through Tein | `docs/tein-endpoint.md` |
| Costs and limits | `docs/costs.md`, `docs/known-limits.md` |
| Why it works this way | `docs/why/`, `answers/` |
| Check the repo | `python3 tools/check_repo.py .` |

Result videos are release downloads (`release-media/`), not files in git.
