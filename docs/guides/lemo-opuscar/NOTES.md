# Lemo-Opuscar guides — notes

**Source:** [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) @ `b5e8ef9` (21 October 2026; first copied at `b65efe6`), repository root. MIT, © 2026 LemoLab ([LICENSE](LICENSE)). Copied unchanged.

| File | What it covers | Read it when |
|---|---|---|
| `DIRECTOR.md` (10 KB) | Directing: the brief, benchmarking, writing the treatment *before* opening the demo, proving the look on stills, sound, rhythm ("music grid first"), camera, performance, common failures, a delivery checklist and copyright red lines. Includes the "not the demo again" rule (at least 4 of 6 dimensions must differ from the style's demo). | Planning any code-made film |
| `TECHNIQUE.md` (12 KB) | The pipeline: requirements; the picture as a function of time; one timeline for everything; voice, music, SFX and mix; subtitles; the review loop; 3D notes (incl. orthographic depth of field); characters drawn in code; assets and credits. | Building and finishing |
| `AGENTS.md` (7 KB) | The router the agent follows: find the style, ask one round of brief questions, treatment first, produce, self-check. | Writing your own agent router for a style library |
| `MAINTAINING.md` (4 KB) | How a new style is added and gated. | Adding house styles to [`../../../prompts/film-styles/`](../../../prompts/film-styles/) |
| `MY-STYLES.md` (new) | The procedure for turning a library style into your own named style: what is safe to change, what changes the style's character, a style frame for approval, then a 15–30 s test film. Your styles live in `~/lemo-my-styles/`, outside the library. | Building a house style (e.g. a channel graphics package) from an existing one |

Paths in these files are relative to the upstream repo root: `core/` is [`tools/lemo-core/core/`](../../../tools/lemo-core/core/), `styles/` is [`prompts/film-styles/`](../../../prompts/film-styles/) (style prompts only; demos stay upstream), and `plugin/skills/lemo-opuscar/` is [`skills/lemo-opuscar/`](../../../skills/lemo-opuscar/).
