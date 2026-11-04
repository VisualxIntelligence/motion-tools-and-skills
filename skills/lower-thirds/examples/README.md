# Examples

Each was made by a fresh agent from the one-line request quoted in its README, working only from this pack's skill, with no human edits to the design. Open `index.html` in Chrome to preview it (space: play/pause, B: background, 1–9: card).

| Example | Request | Delivered |
|---|---|---|
| [podcast](./podcast) | Host and guest straps for an interview podcast, for Premiere Pro | 2 cards → ProRes 4444 `.mov` (+ WebM) |
| [twitch-stream](./twitch-stream) | A neon name card for a Twitch stream in OBS | 1 card → WebM |
| [church-livestream](./church-livestream) | Speaker and scripture cards for OBS and DaVinci Resolve | 2 cards → WebM and `.mov` |

Render any of them (from this skill folder, `skills/lower-thirds/`, after `npm i playwright-core`):

```bash
node scripts/render.mjs examples/podcast/index.html maya-chen.mov
node scripts/render.mjs examples/podcast/index.html daniel-ortiz.mov --card 1
```
