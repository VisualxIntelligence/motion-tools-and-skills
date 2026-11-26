# Reproduce OBJ07-RackFocus

1. Render the pill clip from the engine (see the repo README for setup):

```bash
cd engine/cinematic && npm install && tools/render-pill.sh OBJ07-RackFocus
```

   The script renders the stand-ins, crops to 21:9 (1280x534), 24 fps, no sound, and prints the file. Add `--standin capsule` for the single-capsule look of the first gallery clips. Keep every reference video under 29 s in total.
2. Take your own photo for the face. Use the prompt in `prompts/` as the base: keep the stand-in and set-rebuild sentences, change the person, the place and the light.
3. Send it through Tein's Seedance 2.5 as a 480p draft first (see `docs/tein-endpoint.md`; you need a Tein key in `TEIN_API_KEY`, never commit it). `reference_video` is the pill clip, `reference_image` is your photo, `draft` is true.
4. Judge the draft against the pill clip: camera, framing, cuts. Finalize only when the draft is right.
