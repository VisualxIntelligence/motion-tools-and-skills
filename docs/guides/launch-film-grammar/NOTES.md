# Launch-film grammar (design-engineering) — notes

**Source:** [AgentsORG/design-engineering](https://github.com/AgentsORG/design-engineering) @ `a79af5c` (13 Nov 2026), version 4.8.0. MIT, © 2026 AgentsORG ([LICENSE](LICENSE)); its own notices for adapted work are in [UPSTREAM-NOTICE.md](UPSTREAM-NOTICE.md). Copied 24 November 2026: two clusters of the skill graph (`references/launch-video/`, `references/sound/`), three agents, and the measured corpus behind them (`docs/research/launch-films/`). The sound renderer is in [`tools/sound-sheet/`](../../../tools/sound-sheet/NOTES.md).

## What it is

design-engineering is a large skill graph for **UI design engineering** (reviews, polish, motion, accessibility, tokens, a cross-model design council, a grader) for Claude Code, Codex, Cursor, Gemini and OpenCode. Most of it is about product interfaces. Two clusters are about films, and they are the best-measured material on launch films we have seen:

**The launch-video cluster** (`launch-video/`, 14 nodes; start at [`MOC-launch-video.md`](launch-video/MOC-launch-video.md)) treats a launch film as decisions taken in order, each with one owner node, and every number comes from **47 launch films measured at their native frame rate** (29 by the studio Skale, 18 acclaimed 2024–2026 films from Linear, Raycast, Anthropic, Google, Figma, Arc, Notion and others) plus HeyGen's HyperFrames launch sources:

1. **Register first** ([registers](launch-video/launch-video-registers.md)). Cut rate, stillness, move length and loudness belong to the register, not to quality:

   | Register | Cuts/min | Still share | LUFS |
   |---|---|---|---|
   | UI motion graphics, music only (Skale's largest row) | 4.0 | 0.09 | −17.7 |
   | Founder-led hybrid | ~13 when cut as an interview, 0–3.6 when graphics lead | 0.18 | −21.1 |
   | Product camera (Linear Agent, Raycast, Claude Cowork) | 14.0 | 0.49 | −32.9 |
   | Keynote cards + demo (Cursor 2.0, Notion Mail, Granola…) | 12.0 | 0.37 | −18.2 |
   | Kinetic type / collage (model launches) | 3.3 | 0.17 | −19.3 |
   | Beat-cut sizzle (≤ 40 s, every shot a live component) | 30.7 | 0.29 | −12.9 |

2. **Structure** ([structure](launch-video/launch-video-structure.md)): a readable word by 0.2–0.7 s; the name early (≤ 11 %), where the problem act ends (median 29 %), or at ~70 % after the demo; an endcard of 4.4–6.3 s that holds ~2 s.
3. **Type** ([type](launch-video/launch-video-type.md)): built per word about 0.2 s apart, never faded in as a block (27 of 29 Skale films); holds 1.15–1.5 s after the last word.
4. **UI demo** ([ui-demo](launch-video/launch-video-ui-demo.md)): rebuilt UI cropped tight, a readable cursor with a visible press, prompts typed at ~15 characters/s to be read or ~53 to be recognised, the agent's wait stepped or cut.
5. **Motion** ([motion](launch-video/launch-video-motion.md)): objects settle exponentially with a time constant of about 0.1–0.15 s, sized to the travel; counters and camera cranes slower; no decorative motion on UI objects (0 of 18 acclaimed films float UI).
6. **Seams and cuts** ([seams](launch-video/launch-video-seams.md), [cuts](launch-video/launch-video-cuts.md)): **no dead cut** (the outgoing scene is still moving on the cut frame, or the incoming one acts within ~0.3–0.4 s); a crossfade fails only when its midpoint shows a ground neither scene has (the "dip law"); a typed seam ledger.
7. **Sound** (in `sound/`): pick the sound register from the picture; **take something away before the reveal** (in 23 of 28 Skale films with sound); the low end arrives on the first reveal; **transients on contact frames, at most one frame late, never early**; −1 dBTP is the only fixed number.
8. **Review** ([review](launch-video/launch-video-review.md)): measure the render against its own register; **recount cuts by eye**, because the automatic detector matched the frame count in only 9 of 29 and 5 of 18 films.

Plus: [formats](launch-video/launch-video-formats.md) (seamless loops, logo stings, vertical cuts re-laid out rather than cropped), [film-as-function-of-time](launch-video/film-as-function-of-time.md) (sub-frame blur, a shutter that never crosses a cut, a beat grid fitted to the track you actually use, delivery gates), and reconciliations with **HyperFrames**, **cinetic** and scenario-kinetic-film: which value wins where they disagree.

**The sound cluster** (`sound/`, 16 nodes; start at [`MOC-sound.md`](sound/MOC-sound.md)): whether something should make a sound at all; one material per family; sound derived from motion (size → pitch and length, x → pan); designed-SFX anatomy with per-category targets (whoosh, riser, impact); loudness and format specs; generation with ElevenLabs or open-weight / CC0 sources; **licensing** (CC0 and CC BY yes, NC and ND no, read on the item's own page and recorded); music and voice placement (the drop on the reveal, breakdowns under anything read, the bed 10–13 dB under a voice); web playback and haptics.

**Agents** (`agents/`): `launch-film-analyst` (measures a reference or your render against the corpus: cut rate, still share, first word, name timing, type cadence, typing speed, seams, endcard, loudness), `motion-auditor` (timing, easing, transform-only, reduced motion) and `sound-designer` (one family, generated, wired and mapped to motion). They are written for the full skill and look for `references/launch-video/...` under the skill root; here those folders sit next to `agents/`, so point them at this folder.

**Research** (`research/launch-films/`): `measure.py` (one film at native fps → cuts, shot lengths, still share, move runs, camera share, blur, luma, colour, loudness, bands, beat and hit sync, with contact sheets), `aggregate.py`, the per-film metrics for all 50 films, the three aggregate tables, the syntheses and the probes. Its README explains the method, including **why resampling a 24 or 25 fps film to 30 fps corrupts every motion measurement** (each inserted duplicate splits a move and adds a still frame).

## When to use it

- **Before planning any launch, feature or sizzle film**: name the register, then take the numbers from its row instead of from taste. For the daily AI news explainers the nearest rows are *kinetic type* and *keynote cards + demo*.
- **Reviewing a render or a reference**: run `measure.py` and read the register table beside it, or give the `launch-film-analyst` agent the file.
- **Sound for any code film**: `sound-motion-sync`, `launch-video-sound` and `sound-licensing` are short and specific; render the stem with [`tools/sound-sheet/`](../../../tools/sound-sheet/NOTES.md).
- The rest of design-engineering (UI review, polish, the design council, the grader) is for product interfaces; install it whole if you want it: `npx skills add AgentsORG/design-engineering`.

## Using the measurer

```bash
pip install numpy opencv-python        # and ffmpeg on PATH
python docs/guides/launch-film-grammar/research/launch-films/measure.py film.mp4 myfilm out/
# → out/myfilm.json (+ contact sheets: cuts, moves, timeline)
```

**Tested here 24 November 2026:** `measure.py` on a 10.2 s ReelForge mock render wrote its JSON (30 fps, 1 cut, still share 0.81, median move run 0.52 s) and three contact sheets. The agents were not run.

## Changes from upstream

- **Copied:** `skills/design-engineering/references/launch-video/` and `references/sound/` (unchanged), `plugin/agents/launch-film-analyst.md`, `motion-auditor.md` and `sound-designer.md`, `docs/research/launch-films/`, `LICENSE`, and `docs/NOTICE.md` as `UPSTREAM-NOTICE.md`.
- **Links:** the nodes link each other as `[[node-name]]`. Links into the copied clusters resolve here; links to other clusters (`[[pov]]`, `[[using-design-md]]`, `[[duration-table]]`, `[[gotchas]]`…) point at nodes that live only upstream, under `skills/design-engineering/references/`.
- **Left out:** the rest of the skill graph (UI, components, layout, typography, meta, philosophy), the scripts other than the sound renderer, the eve MCP server, the benchmark, the installers and the README media. The research probes expect local copies of the films, which are not included.
- **Added:** this `NOTES.md`.
