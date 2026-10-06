# tidewater-asset-pipeline — notes

**Source:** [dgreenheck/tidewater](https://github.com/dgreenheck/tidewater) @ `4811ba4`, folder `tools/`. MIT, © 2026 DRG Software Solutions LLC ([LICENSE](LICENSE)). The game's own README files are kept in each folder; they refer to game paths (`public/`, `src/`) that are not in this repo.

## audio/

Builds a sound bank from **CC0-only** Freesound recordings.

| File | What it does |
|---|---|
| `search.mjs "query"` | Searches Freesound, restricted to CC0 |
| `dl.mjs id:user …` | Downloads previews and prints each sound's licence so you can confirm it is CC0 |
| `lib.mjs` | The reusable part: integrated loudness via ffmpeg `ebur128`, equal-power crossfades for seamless loops, normalisation to −23 LUFS (broadcast, EBU R128), Opus encoding |
| `build-fishing.mjs`, `fishing-bank.json` | The game's own build, as a worked example |

Useful for building small, licence-clean SFX beds for motion pieces, mastered to broadcast loudness.

## blender/

Background-mode Blender scripts (Blender 4.2+, tested with 5.2).

| File | What it does |
|---|---|
| `convert.py` | Imports an FBX avatar, builds glTF-ready materials, imports each animation clip and **retargets it by bone name in world space** (works when the clip skeleton rests arms-down and the avatar is in a T-pose), bakes one NLA track per clip and exports a GLB. Written for Microsoft Rocketbox characters. |
| `build.sh`, `fetch.sh`, `textures.sh` | The full chain: fetch from the Rocketbox repo → downscale textures and pack an ORM map with ImageMagick → Blender. |
| `props/decimate.py` | Decimates glTF models to a per-model triangle budget. |
| `props/fetch.py`, `props/build.mjs` | Fetch Poly Haven CC0 models; pack them and their textures. `build.mjs` also draws sign textures with fonts that were not copied here (see upstream `tools/props/fonts/`). |

Run like `blender -b -P blender/convert.py`. Useful for getting characters and props into Three.js, HyperFrames or Unreal as optimised GLBs with clips.

## Requirements

Node.js, ffmpeg with libopus, Blender 4.2–5.2, ImageMagick, Python 3. The shell scripts are bash (WSL or Git Bash on Windows).
