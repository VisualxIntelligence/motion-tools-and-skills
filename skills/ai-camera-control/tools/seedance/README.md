# tools/seedance: sketch sheets, prompt builders and checks

Scripts that sit between the engine and a video service. They read and write local files. None of them sends, uploads, queues or downloads anything: sending is described in `docs/tein-endpoint.md` and done by you or the MCP.

Run everything from the repo root. Paths below use `CAM06-Orbit`. Output goes to `.work/` (ignored by git) unless you pass `--out`.

## Install

```bash
python3 -m pip install -r tools/seedance/requirements.txt              # numpy, Pillow
python3 -m pip install -r tools/seedance/requirements-optional.txt     # only for the three optional checks
```

ffmpeg and ffprobe must be on PATH. Pinned versions are the ones tested (see the files). The face checks were tested on Python 3.10 (mediapipe 0.10.21); the speech check was tested on 3.14.

## What each script does, and the command for CAM06-Orbit

| Script | One line | Command |
|---|---|---|
| `shots.sh` | Prints a template's shots (start, end) from the engine, for the sheet maker. Needs `npm install` in `engine/cinematic`. | `tools/seedance/shots.sh CAM06-Orbit > shots.json` |
| `drawn_batch.py` | The sketch route: 12 or 30 panel ink contact sheet with each pill filled in its own colour, and the pill prompt rewritten to read it. | see "Sketch sheet" below |
| `qa_video.py` | Speaking-shot stiffness: motion after removing the camera shift (phase correlation), per second. | `python3 tools/seedance/qa_video.py release-media/CAM06-Orbit/result.mp4` |
| `qa_framing.py` | Face size and place in the result against the pill clip, second by second. **Optional: needs mediapipe.** | `python3 tools/seedance/qa_framing.py templates/CAM06-Orbit/pill.mp4 result.mp4` |
| `qa_cuts.py` | Hard-cut detector; compares cut times of clip and result. | `python3 tools/seedance/qa_cuts.py templates/CAM06-Orbit/pill.mp4 result.mp4` |
| `cut_pairs.py` | Last frame before and first frame after each cut, clip and result, as one JPEG. | `python3 tools/seedance/cut_pairs.py templates/CAM06-Orbit/pill.mp4 result.mp4 --cuts 3 --out pairs.jpg` |
| `compare.py` | The pill clip and each result side by side at the same moments. | `python3 tools/seedance/compare.py --ref templates/CAM06-Orbit/pill.mp4 --result result.mp4 --out compare.jpg` |
| `qa_speech.py` | Transcribes a take and compares it word for word with the dialogue. **Optional: needs whisper.** | `python3 tools/seedance/qa_speech.py take.mp4 --scene tools/seedance/scenes/CAM22-PedestalUp.scene.json` |
| `qa_mouth.py` | Mouth opening and motion from face landmarks. **Optional: needs mediapipe.** | `python3 tools/seedance/qa_mouth.py take.mp4` |
| `lean_v3.py` | Builds the short lean prompt (story, place, person, performance, sound) from a scene file. | `python3 tools/seedance/lean_v3.py --template CAM22-PedestalUp --scene tools/seedance/scenes/CAM22-PedestalUp.scene.json` |
| `gallery_v4.py` | Builds the long gallery prompt with a camera script that carries the template's numbers. | `python3 tools/seedance/gallery_v4.py --template CAM22-PedestalUp --scene tools/seedance/scenes/CAM22-PedestalUp.scene.json` |
| `build_env24.py` | Builds the long prompt with the framing measured from the pill clip, second by second. | `python3 tools/seedance/build_env24.py --template CAM21-PanReveal --scene tools/seedance/scenes/CAM21-PanReveal.env24.scene.json` |
| `qa3.py` | Gate for lean prompts (word counts, no camera words, one dialogue line, mood twin check). | `python3 tools/seedance/qa3.py .work/prompts/CAM22-PedestalUp/lean-t .work/prompts/CAM22-PedestalUp/lean-m` |
| `qa4.py` | Gate for gallery prompts (camera numbers, protective lines, performance rules). | `python3 tools/seedance/qa4.py .work/prompts/CAM22-PedestalUp/gallery-t` |

`_common.py`, `prompt_lib.py` and `qa_gate_common.py` are shared code. `scenes/` holds the example scene files.

Exit codes: 0 pass, 1 fail. A check that cannot run (missing file, missing package, no face, no second scored, a clip too short) exits 1 and says why. It never prints a pass.

## What needs what

| Needs | Scripts | What fails without it |
|---|---|---|
| ffmpeg and ffprobe | every script except the shared libraries | they exit 1 with "ffmpeg is not on PATH" |
| Node 22 and `npm install` in `engine/cinematic` | `shots.sh` only | it exits 1; use `--cuts` in `drawn_batch.py` instead |
| mediapipe 0.10.21 (optional) | `qa_framing.py`, `qa_mouth.py` | both exit 1: "cannot run the framing check", "cannot run the mouth check" |
| whisper (optional): openai-whisper or faster-whisper | `qa_speech.py` | exits 1: "neither openai-whisper nor faster-whisper is installed". The first run downloads the model weights through whisper's own mechanism. |

## Sketch sheet (docs/variants.md, variant 12)

1. Render the ink clip and the pill clip, from `engine/cinematic`. The ink clip is the storyboard look with no scenery; the pill clip tells the script which colour each person is:

```bash
cd engine/cinematic
node render.mjs --videos CAM06-Orbit --storyboard --boxes --no-scenery --clean --no-blur --subframes 3 --scale 0.6667 --out .work/out/ink
ffmpeg -y -i .work/out/ink/CAM06-Orbit.mp4 -vf crop=1280:534 -r 24 -an -c:v libx264 -crf 18 -pix_fmt yuv420p .work/out/ink/CAM06-Orbit.ink.mp4
tools/render-pill.sh CAM06-Orbit            # .work/out/pill/CAM06-Orbit.pill.mp4
cd ../..
```

2. Make the sheet (12 panels, 3 across by 4 down, 3880 x 2186, aspect 1.77):

```bash
tools/seedance/shots.sh CAM06-Orbit > .work/shots.json      # or --cuts 2.5,5.5 for a clip with cuts you know
python3 tools/seedance/drawn_batch.py --ink engine/cinematic/.work/out/ink/CAM06-Orbit.ink.mp4 \
  --color engine/cinematic/.work/out/pill/CAM06-Orbit.pill.mp4 --shots .work/shots.json \
  --panels 12 --out .work/sheet --prompt templates/CAM06-Orbit/prompts/video.txt --face your-photo.jpg
```

`--panels 30` makes 3 across by 10 down (3880 x 5450, aspect 0.71); for a 10 shot film that is 3 panels per shot, one row per shot. A sheet outside aspect 0.40 to 2.50, a side outside 300 to 6000 px or a file over 30 MB is refused by the script (exit 1, nothing written), as the service refuses it.

It writes `sketch-sheet.jpg`, `sketch-sheet.json` (panel times), and with `--prompt`: `sheet-prompt.txt` and `sheet-request.json` (local file names; upload them yourself). Where a pill fills most of the frame (the camera is next to it) the fill covers the whole pill; that is the same as in the shipped sheets.

Left out: `draw_sheet.py` (edge-traced sheet: "blobs", rejected in variants.md), `drawn_sheet.py` (the first single-template version, replaced by `drawn_batch.py`), `blur_sheet.py` (blurred set, a variant not on the list, keeps the clay look), `build_sheet.py` (the clay frame sheet, variant 13: "this 12 frame sheet is clay lol").

## Prompts and gates

A scene file is plain JSON. Fields (see `scenes/CAM22-PedestalUp.scene.json`):

- `person`: `name`, `pronoun` ("he" or "she"), `face_traits` (what your photo gives), `photo_ignore`, `wears`.
- `goal`, `place`, `sound`, `performance` (end a speaking shot's performance with `{LINE}`).
- `line`: `text`, `how` (6 words or fewer), and for `build_env24.py` `at` (seconds). Leave out for a silent shot.
- gallery form: `camera` (the camera script with the template's lens, size, move and distances), `subject_position`, `camera_numbers` (strings qa4.py requires in the camera script).
- `second_person`: `name`, `capsule` (colour words), `description`.
- `mood`: `{"environment": "16", "panel": 0}` (one quarter of `environments/16-*.png`) or `{"image": "path"}`, used by the `-m` job.
- `build_env24.py` also takes `subjects`, `script`, `look`, `keep`, and uses `place` as the written place.

Each builder writes `-t` (no mood picture) and `-m` (plus one mood picture) jobs to `.work/prompts/<ID>/<form>-t` and `-m`: `prompt.txt`, `request.json` (Tein field names, local file names, 480p draft), `job.json` (what the gates read) and `pill.mp4`. `--standin capsule` if the clip was rendered with `--standin capsule`. Your photo and voice are never read or copied; `--face-name` and `--voice-name` only set the names listed in `request.json`.

`lean_v3.py` and `gallery_v4.py` reproduce the shipped prompts byte for byte when given their text: the CAM22 `v3-cam22-t`, `v3-cam22-m`, `v4-cam22-t` and `v4-cam22-m` prompts were rebuilt from scene files cut from them and compared. `build_env24.py` is the older long form (about 2,000 words) kept for its measured framing block; `--framing-only` prints just that block. No gate for it is in this folder.

Not ported: `qa_prompts.py` and `qa2.py` (gates for the older prompt families, replaced by `qa3.py` and `qa4.py`), the case lists and acting data of the first runs, and every script that sent, queued or downloaded. The two patch scripts `engine/cinematic/tools/seedance-realism.py` and `seedance-dialogue.py` are already in the repo, so they were not copied; they patch `engine/cinematic/src/templates/seedance-prompts.json` in place.

## What the checks know and do not know

- `qa_cuts.py` threshold 28 is from the 30 s film. On the engine's SC06 ink clip it missed the 3.6 s cut (two similar-looking rooftop frames) and found the other four; on the 30 s film it found all 9 documented cuts and flagged 2 more by eye-check (12.58 s and 27.38 s). Fast whips can be flagged.
- `qa_video.py` calls a clip "locked" when the mean frame shift is under 0.6 px. An orbit shows no shift under phase correlation, so it is judged as locked; the floors were set on speaking shots, so use it on those.
- `qa_framing.py` and the framing block use the stand-in's height over width: 3.9 for the pin, 3.0 for the capsule (from `engine/cinematic/src/standins.ts`). The capsule head factor 0.39 is the calibrated one; the pin factor 0.50 is derived, not calibrated.
- `qa_speech.py` `--max-wer 0.3` and `qa_mouth.py` (no built-in limit) are not calibrated. Whisper cannot hear if the lips match, and neither can the mouth check. Voice and lip sync need a person.
- `qa3.py`/`qa4.py` check words, not sense. A prompt can pass and be wrong about a prop.
