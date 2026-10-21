# athemeroy research — notes and attribution

**Source:** "Awesome Claude 5.5 Videos" by athemeroy, [athemeroy/awesome-claude-5-5-videos](https://github.com/athemeroy/awesome-claude-5-5-videos) (renamed from `awesome-opus-5-5-videos`). First copied at `0b96ca1` (3 October 2026); updated from `87e5cbf` (11 October 2026), which added the four new documents marked *new* below and a revised `data/cases.csv`.

**Licence:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) ([LICENSE](LICENSE)). The licence covers the repo's own writing, annotations, tables and diagrams only. Creator posts, prompts, videos, stills and linked repositories are excluded and stay with their owners (upstream `THIRD_PARTY.md`).

**Changes:** files copied unchanged; English versions only. The data files are a subset of upstream `data/` (`color-mode-swatches.csv` comes from `data/color-study/`). Image and asset links inside the documents point to upstream paths that are not copied, so they will not resolve here; follow them on GitHub.

## What is here

| File | What it is | Use |
|---|---|---|
| `production-brief.md` | A production brief template with **three acceptance gates**: storyboard and key frames; the hardest 2–4 s as a finished sample (adjacent frames, contact, motion, seek-order repeatability, sync); the whole film. Records a reviewer at each gate. | Brief and sign-off for any agent-made piece |
| `visual-effects-fit.md` | A decision guide by task family (product UI and brand motion, explainers, 3D, music video…): what the agent should do, which renderer and inputs, a failure test, and when to bring in a specialist tool. | Choosing a production path for a piece |
| `color-modes.md` + `data/color-mode-swatches.csv` | 53 palette modes measured across the videos, grouped by style and by domain, with hex swatches and pixel share. | Palette starting points |
| `domain-style-atlas.md` + `data/domain-style.csv` | 1,401 posts classified by domain (product ad, music video, data viz…), style, topic and duration. Labels are machine-assigned. | Seeing what kinds of pieces get made and how long they run |
| `statistics.md` | Corpus statistics. | Context |
| `production-resources.md` *(new)* | Seven production paths with an example each, and the open-source production systems the author reviewed (with licences checked on 11 October): Lemo-Opuscar, Papermotion, ClaudeAnimationBase, the motion-graphics music-video skill, 3d-product, Video Production Skills, SwiftUI text animations. | Finding a reusable system for a kind of piece; the first four and the next two are in this repo |
| `workflow-analysis.md` *(new)* | What the newer examples show about production: multi-agent assembly (one planner, many scene agents), footage-led edits, the turntable product film, how inputs change the task. | Planning who (which model or agent) does what in a pipeline |
| `research-guide.md` *(new)* | Five findings from the collection, as advice: content–style pairings, how inputs change the task, how much work sits behind "one prompt", how to read reported costs. | A short read before scoping an agent-made piece |
| `evidence-examples.md` *(new)* | Fourteen paired cases where a similar look came from different production chains (code, supplied media, video models, captured apps). | Judging what a reference video really needed before promising it |
| `data/resource-review-2026-10-11.csv` *(new)* | The licence and file-tree review of those open-source systems. | Provenance |
| `data/cases.csv` | 168 hand-reviewed cases: production path, the creator's disclosure (summarised), the reviewer's observation, duration. | Finding real examples of a technique, with links |

The main finding is worth keeping in mind: many videos presented as "one prompt" relied on prebuilt skills, assets on disk, or several rounds of revision. Credit and judge accordingly.

The curated list of 40 motion-relevant cases from this research is in [`../../../prompts/video-prompts/athemeroy-motion-cases.md`](../../../prompts/video-prompts/athemeroy-motion-cases.md).
