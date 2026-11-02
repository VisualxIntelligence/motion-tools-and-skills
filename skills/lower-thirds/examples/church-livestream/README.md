# Church livestream: speaker and scripture

> "For our Sunday livestream: a lower third for our speaker, Pastor Grace Owens, with the sermon series 'Rooted', and a second one for the scripture reading, Psalm 1:3. Warm and elegant, nothing flashy. We stream with OBS but also post the edited service from DaVinci Resolve."

The agent chose a deep brown panel with a gold rule, Lora for the name and spaced Jost capitals for the label. It moved off Playfair Display because its old-style numerals made "1:3" drop below the line. A gold line draws, the panel fades up, the words rise gently; about 6 s still, a soft fade out. It left out the verse text, which the request didn't give. WebM for OBS and ProRes 4444 for Resolve.

```bash
node ../../scripts/render.mjs index.html pastor-grace-owens.webm
node ../../scripts/render.mjs index.html psalm-1-3.mov --card 1
```
