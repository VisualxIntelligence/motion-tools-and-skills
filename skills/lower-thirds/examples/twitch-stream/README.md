# Twitch stream name card

> "need an animated name card for my twitch stream, I'm PixelPilot and I'm speedrunning Hollow Knight. neon, punchy. I use OBS"

The agent chose Orbitron on a slanted dark panel with a traced cyan neon outline and a magenta tab, using the streamer's own words as the second line. The outline flickers on, the name slams in with a colour split, the tab drops; it holds still for 6 s and switches off like an old TV. WebM only, since the request said OBS.

```bash
node ../../scripts/render.mjs index.html pixelpilot.webm
```

In OBS: a Media Source with Loop off, or a Browser Source pointed at `index.html?obs&card=0` (see [delivery](../../references/delivery.md)).
