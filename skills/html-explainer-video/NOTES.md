# html-explainer-video — notes

**Source:** [MengTo/Skills](https://github.com/MengTo/Skills) @ `3cc9345` (14 Nov 2026): `agent-skills/media/html-explainer-video/`. MIT, © 2026 Meng To ([LICENSE](LICENSE)); the sound effects MIT, © 2026 Leon Lin ([`sounds/LICENSE.txt`](sounds/LICENSE.txt)). Copied 14 November 2026.

## What it makes

**A finished one-minute explainer film** about a product, a feature or an idea: a script in four parts (hook, benefit, quick tutorial, try it), a voice, HTML scenes rendered frame by frame at 2×, then captions, music, sound effects and chapters. No filming by default; turn on a camera and it adds record slots, layouts by keyframes and a teleprompter.

**The mechanism: the voice is the clock.** Every frame is a pure function of the film's seconds, and every time is a word. `times(WORDS)` names each word of the voice, so `T.clock` is when the voice says "clock", and a scene lands each thing on the word that names it. A renderer calls `window.__frame(t)` once a frame and screenshots. A new voice retimes the whole film with no change to any scene.

**Three inputs, none of which touches a scene:** the **look** (type, colour, corners, motion, read from a site with `read-look.mjs` or named), the **shape** (4:3, 16:9, 1:1, 9:16, laid out from regions, not coordinates) and the **camera** (off or on).

| Path | What it is |
|---|---|
| `SKILL.md` | The mechanism, the inputs, a 12-step workflow, rules each paired with the failure it prevents, numbers from seven source films, a verify list |
| `scripts/explainer.js`, `explainer.css` | The scene engine with no framework: `film()`, `times()`, regions by shape and camera, `show()`, `ring()`, `view()`, `pointer()`, captions |
| `scripts/words.py` | The word clock as `[[word, start, end], ...]`: from Fil's captions, from any transcriber (`--json`), or a free draft from the script (`--draft`) to build on before paying for a voice |
| `scripts/preview.mjs` | **The whole film as an MP4 on your machine**: picture, captions, voice, music and placed sounds at −14 LUFS, with a contact sheet |
| `scripts/render.mjs` | One MP4 per scene at 60 fps and 2×, or the whole film, or stills and a sheet |
| `scripts/check-film.mjs` | Enlarged pictures, soft 3D, overlapping headlines, edges, the camera corner, repeatable frames |
| `scripts/read-look.mjs`, `sfx.mjs` | A site's look as variables; sound cues placed and levelled |
| `references/` | `format.md` (the four parts, scene patterns, explaining an idea), `looks.md`, `camera.md`, `sound.md`, `checks.md` (blind judges), `fil-editor.md` |
| `sounds/` | 24 short UI sound effects with measured sync points (`kit.json`) |
| `demo/` | The skill's own explainer as source: scenes, four looks, words, script |

Numbers worth keeping: 57–60 s at about 2.6 words a second; hook 3–6 s, benefit 12–20 s, tutorial 22–30 s, try it 6–14 s; 10–12 scenes of 4–8 s; the end is the last word plus about 2.4 s; about one sound a second, never two within 150 ms; −14 LUFS.

## Without Fil

The upstream edit (step 11) is done in **Fil**, Meng To's video editor, over MCP (`references/fil-editor.md`), and `words.py` can read Fil's caption list. Neither is needed for a finished film:

- **Word clock.** Use `words.py --draft` while building, then real word times from any source with `words.py --json`: ElevenLabs `with-timestamps`, Whisper (as in [`../talking-head-b-roll/`](../talking-head-b-roll/NOTES.md)), or lemo-core's TTS with its Whisper check ([`../../tools/lemo-core/`](../../tools/lemo-core/NOTES.md)).
- **Film.** `preview.mjs` renders and mixes the finished MP4 locally; `render.mjs` gives per-scene 2× masters for an NLE (Premiere, Resolve) if you prefer to finish there.
- Skip steps 11's Fil commands and the "⚡ credits" lines, which are Fil's pricing.

## When to use it

- Product and feature explainers, onboarding and how-it-works films, in a client's or show's own look, without filming.
- Its **"every claim comes from Explainer.md"** rule (a sourced fact list checked against the product before anything is animated) and **"the first frame is the cover"** suit newsroom explainers as they stand.

## Requirements

- Node, Playwright and Chrome; ffmpeg; Python 3 (standard library) for `words.py`.
- A voice file and its word times (any TTS or a recorded read). A music bed is optional.

## Installing

Copy or symlink this folder to `~/.claude/skills/html-explainer-video/` (see [`../README.md`](../README.md#installing-a-skill)). Upstream: `npx skills add https://github.com/MengTo/Skills --skill html-explainer-video`.

## Changes from upstream

- **Copied unchanged:** `SKILL.md`, `references/`, `scripts/`, `sounds/` (with its licence), and the demo's code, looks, words and script; the repo's `LICENSE` added.
- **Left out:** the demo's voice (`demo/voice.mp3`, 0.9 MB), its pictures (`demo/pictures/`, including Fil's logo) and `preview.jpg`. The demo source is kept to read; run it from upstream, or give it your own `voice.mp3` and pictures. Also `agents/openai.yaml` (Codex interface metadata).
- **References to sibling skills** (`html-reel`, `website-to-motion-design`) point at Meng To's repo; `html-reel` is described in [`../../docs/reference-only.md`](../../docs/reference-only.md#13-sixth-survey-reviewed-not-copied).
- **Not run here.** Nothing in this folder was executed during the copy.
