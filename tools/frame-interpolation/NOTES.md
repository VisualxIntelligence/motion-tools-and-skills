# Frame interpolation (RIFE) — notes

**Sources, read 23 November 2026. Nothing copied:** models download from their authors, and ComfyUI already has the node built in.

- [hzwer/Practical-RIFE](https://github.com/hzwer/Practical-RIFE) @ `bbfd2ea` (27 Aug 2026): the maintained RIFE, with the current 4.x models. MIT, © 2021 hzwer; the model downloads are under the same MIT licence.
- [hzwer/ECCV2022-RIFE](https://github.com/hzwer/ECCV2022-RIFE): the paper's research code. Use Practical-RIFE instead.
- ComfyUI @ `5ea159f` (0.46.0): the built-in **Load Frame Interpolation Model** and **Run Frame Interpolation Model** nodes (`comfy_extras/nodes_frame_interpolation.py`), which run RIFE (IFNet) and FILM.
- [Fannovel16/ComfyUI-Frame-Interpolation](https://github.com/Fannovel16/ComfyUI-Frame-Interpolation): the older custom-node pack (RIFE, FILM and others), for ComfyUI builds without the built-in node.

## What it does

RIFE estimates the motion between two frames and synthesises the frames in between: 24 → 48 fps, 30 → 60 fps, or slow motion from footage that has no extra frames. Upstream recommends **4.25** for most scenes. It notes 4.24+ suits post-processing of diffusion-generated video, and 4.26 is the newest.

## When to use it

- **Yes: generated video.** Video models often output 16–24 fps. Interpolate up to the film's delivery rate so a generated shot cuts in cleanly, after restoration and upscaling. ComfyUI's recommended order for video is downscale → SeedVR2 (or FlashVSR) → **RIFE** → encode.
- **Yes: slow motion** on live footage with simple motion.
- **No: code-rendered motion graphics.** Render at the delivery frame rate. Our renderers are a pure function of time, so 50 or 60 fps costs only render time. Interpolating a 25 fps render smears text, hard edges, thin lines and anything that crosses another layer. Real motion blur comes from sub-frame sampling (see `starters/pdoom-video-engine` and `starters/mg-styles-15/harness/render.mjs`), not from interpolation.
- **No: cuts.** RIFE invents a blended frame across a hard cut. Split the clip at cuts first, or check the cut frames.

## Using it

**In ComfyUI (preferred):** put the weights in `models/frame_interpolation/`. Then *Load Frame Interpolation Model* → *Run Frame Interpolation Model* with `multiplier` 2–16, between a video loader and a video combine node. The built-in loader accepts RIFE weights with five flow blocks, the generation upstream says began at 4.25. Older weights fail with "Unsupported RIFE model"; use 4.25 or 4.26.

**Command line (Practical-RIFE, Python ≤ 3.11):**

```bash
git clone https://github.com/hzwer/Practical-RIFE && cd Practical-RIFE
pip install -r requirements.txt
# download a model (e.g. 4.25) from the README, put its *.py and flownet.pkl in train_log/
python inference_video.py --multi=2 --video=clip.mp4                 # 2× frames
python inference_video.py --multi=2 --video=clip.mp4 --scale=0.5     # for 4K input
python inference_video.py --multi=2 --img=frames/ --fps=50           # numbered PNGs in, 50 fps out
```

**Check after:** step through the frames around fast motion, text and cuts. Run [`../sync-check/`](../sync-check/NOTES.md) if the clip carries sound, since a frame-rate change can shift sync.

**Not tested here.** No GPU in this session.
