# Contributing

Thanks for building on this. Three ways in, from smallest to biggest.

## Fix or add a note
Edit anything in `docs/`. Plain short sentences, digits for numbers, no filler. If you state a fact, say where it comes from (a file, a clip, a number). If you cannot prove it, mark it UNPROVEN and say what test would settle it. `answers/` holds 137 questions about the method with evidence: add yours there.

## Add or change a template
Templates live in the engine, not in `templates/`. Edit or add a `make({ id: ... })` call in `engine/cinematic/src/templates/*.ts`, register it, render it with `engine/cinematic/tools/render-pill.sh <ID>`, and run the checks in `docs/build-your-own-template.md` (stills first, frame check, motion check). Then refresh the folder's code copy with `python3 tools/extract_templates.py engine/cinematic/src/templates templates`, so the two cannot drift.

Every template folder must have its three.js code, a pill clip and a poster, and either a prompt or a stated reason there is none. A Seedance result may be missing only with a reason (never sent, blocked by a filter). Say plainly which stand-in the clip uses.

## Add a prompt or a result
Prompts are kept one file per send under `templates/<ID>/prompts/`, with the references and settings in `sent.json`. `prompt.provenance` there says whether a file is the text that was sent, a recovered copy or a rebuilt copy, and `prompt.sha256` is the hash of the file as shipped. Never edit a prompt to make it look better: add a new file. Results are release downloads, not files in git.

## Before you open a pull request
```bash
python3 tools/check_repo.py .      # completeness, private data, links, size
```
Never commit a key, a token, a webhook address, a request id, a personal path, a face photo or a voice recording that is not yours to share. The repo check fails on all of these.

## Rules of the method that are not up for debate
The pill never gets legs, arms, hands or boots. Move the camera in every clip you send. The locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03, the ANG family) are kept as camera studies: the drafts made from four of them (ANG06, 07, 10, 13) were stiff. The set stays coarse and colourless. Nothing is sent to a video service, and nothing is spent, without a person's explicit yes.
