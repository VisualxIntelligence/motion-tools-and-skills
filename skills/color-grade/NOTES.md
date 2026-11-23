# color-grade — notes

**Source:** [isaacrowntree/color-grade-ai](https://github.com/isaacrowntree/color-grade-ai) @ `a6eef94` (3 Aug 2026), plugin version 2.0.0. MIT, © 2026 Isaac Rowntree ([LICENSE](LICENSE)). Copied 23 November 2026.

## What it makes

**`.cube` 3D LUTs that correct a frame or a clip**, for DaVinci Resolve, Premiere (Lumetri → Creative → Look) or ffmpeg's `lut3d`. The agent measures what is wrong, fits a correction by applying candidate LUTs and re-measuring, and writes the `.cube`. Nothing is guessed from a description.

| Script | Does |
|---|---|
| `footage_type.py frame.png` | Says whether a frame is log or display-referred Rec.709, from the shape of the image rather than from metadata. Run it first |
| `auto_grade.py frame.png [--emit fix.cube]` | Per-node report: exposure and contrast (histogram percentiles), white balance (Shades of Gray + White Patch), skin tone (YCbCr skin locus), saturation (Hasler–Süsstrunk colourfulness), black level. With `--emit`, writes the fitted LUT |
| `solve_grade.py frame.png --emit fix.cube` | The fit without the report |
| `sample_clip.py clip.mov --emit fix.cube [--frames 12]` | One correction fitted across a whole clip, not one frame |
| `match_grade.py reference.png shot.png --emit match.cube` | Moves one shot toward another: channel balance, exposure, black level, saturation. Refuses to match log against Rec.709 |
| `generate_lut.rb TYPE out.cube [--strength=]` | One named preset from `presets.yml` (night, stage-light cast, skin, exposure, black-level fixes; contrast, temperature and saturation building blocks) |
| `generate_chain_lut.rb out.cube a@0.8 b@0.3 …` | Several presets baked into one LUT, optionally after a camera conversion LUT (`--conversion=`) |
| `analyze_region.py` / `analyze_frame.rb` | Colour statistics for one rectangle (skin, wall, costume) |
| `preview.html` | A browser previewer: drop a frame, chain presets with strength sliders, export the chain as one `.cube`. LUTs are generated live from `presets.json` by `pipeline.mjs`, a port of the Ruby generator |

Presets live in `presets.yml`. A new look is a new YAML entry, not code.

## When to use it

- **Making generated clips sit with code renders.** Grab a frame of the code-rendered film as the reference and `match_grade.py` the AI clip to it, then apply the LUT in Resolve or with ffmpeg before the edit.
- **Fixing a cast or exposure** on interview or event footage shot under stage, LED or practical light. Most presets were tuned for that kind of footage.
- **A house look as one LUT** for a series: bake a chain once and apply it to every episode.
- **Not for code-rendered motion graphics themselves.** Set the colour in the code; a LUT afterwards only moves brand colours off their values.

## Requirements

- **Python 3** with Pillow, NumPy and PyYAML (`pip install Pillow numpy PyYAML`) for analysis and fitting.
- **Ruby 2.7+** (no gems) for `generate_lut.rb` and the chain baker.
- **ffmpeg** for frame extraction and clip sampling.
- **Node** only for `test_pipeline.mjs`.

## Limits

- **Rec.709 display-referred only.** Every target assumes Rec.709 after a camera conversion LUT. On log footage the tool says so and holds back corrections. Camera conversion LUTs (S-Log3 → Rec.709 and so on) are not included and are often paid; keep them in a `luts/` folder here, which git ignores.
- **A LUT can't do everything.** Noise reduction, vignettes, sharpening and secondaries stay in Resolve.
- **The encode examples in `SKILL.md` use `hevc_videotoolbox`, which is Mac-only.** On the Windows workstations use `hevc_nvenc` (RTX 4090/3090) with the same `lut3d` filter chain.
- **No HDR, ACES or broadcast-legal check.** For delivery, still run a legal-range check in Resolve.

## Changes from upstream

- **Copied.** All scripts, presets, `preview.html`, the reference checksums and the test suites, unchanged.
- **Left out.**
  - The 26 MB of pre-baked LUTs in `correction_luts/`. Only `correction_luts/manifest.yml` is kept; rebuild the LUTs with `ruby regenerate_luts.rb` (27 `.cube` files, ignored by git). `preview.html`'s download links and the `test_luts.rb`, `test_pipeline.mjs` and `test_repo_hygiene.rb` checks expect them, so regenerate before running those.
  - The Astro docs site (`docs/`) and its generator `generate_docs.rb`.
  - The GitHub workflows and the plugin manifest.
- **Added.** This `NOTES.md` and a `.gitignore` that carries upstream's ignore rules (conversion LUTs, scratch LUTs, extracted frames, solver cache).
- **Not run here.** The upstream CI runs the Ruby, Python and Node suites on every push. They were not re-run in this session.
