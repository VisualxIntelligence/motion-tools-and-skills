# Reproduce ANG18-TwoThirdsHigh

This template has a locked camera. It is a study of the shot, not a template to send. Render it to look at it.

1. Render the pill clip from the engine (see the repo README for setup):

```bash
cd engine/cinematic && npm install && tools/render-pill.sh ANG18-TwoThirdsHigh
```

   The script renders the stand-ins, crops to 21:9 (1280x534), 24 fps, no sound, and prints the file. Add `--standin capsule` for the single-capsule look of the first gallery clips. Keep every reference video under 29 s in total.
2. Take your own photo for the face. No prompt was recorded for this template: write one from `docs/prompt-anatomy.md` and the neighbouring templates, and name every stand-in.
3. Send it through Tein's Seedance 2.5 as a 480p draft first (see `docs/tein-endpoint.md`; you need a Tein key in `TEIN_API_KEY`, never commit it). `reference_video` is the pill clip, `reference_image` is your photo, `draft` is true.
4. Judge the draft against the pill clip: camera, framing, cuts. Finalize only when the draft is right.
