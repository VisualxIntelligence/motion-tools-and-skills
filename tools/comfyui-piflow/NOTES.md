# ComfyUI-piFlow (pi-H3, AsymFlow, pi-Flow) — notes

**Source:** [Lakonik/ComfyUI-piFlow](https://github.com/Lakonik/ComfyUI-piFlow) @ `e0ca46f` (21 Nov 2026), v1.4.2. Apache-2.0, © 2025 Hansheng Chen; **models carry their own licences**. Read 23 November 2026. **Nothing copied:** it installs into ComfyUI's `custom_nodes`.

## What it is

ComfyUI custom nodes for three few-step model families:

| Family | What it does | Base models |
|---|---|---|
| **pi-H3** | **Video with synchronised audio** from MiniMax H3 in **2 or 4 steps**. DWD adapters predict the frames directly, so the video skips the VAE decoder | MiniMax H3 FL2VA: text to video + audio, optionally from a first frame, a last frame or both |
| **AsymFlow** | Realistic images generated in pixel space | AsymFLUX.2 klein 9B |
| **pi-Flow** | Fast few-step image generation and editing | FLUX, FLUX.2, Qwen-Image |

## Speed (upstream's own figures)

End to end at 2 steps (INT8 ConvRot) on an **RTX 3090**, models loaded and prompt encoded, using the recommended pi-H3-DWD-Spark workflow:

| Resolution | 5 s clip | 10 s clip | 15 s clip |
|---|---|---|---|
| 864×480 | 14.6 s | 36.4 s | 73.2 s |
| 1344×768 | 34.6 s | 80.6 s | 147.7 s |

The viral "10-second 720p video in 32 seconds" matches the 864×480 row, not 720p. Upstream measured on an "unlocked" 3090 (a third-party gpu-unlock tool) with CUDA 13. Time it on our own cards before quoting a number.

## Which workflow for our GPUs

Spark-Attn workflows come per GPU architecture: **SM89 for the RTX 4090**, **SM86 for the RTX 3090**. All are in upstream `workflows/` and listed in `docs/piH3.md`.

- **pi-H3-DWD-Spark-SM89 / SM86:** recommended. Needs the [Spark-H3](https://github.com/zechengtang/Spark-H3) release extracted into `custom_nodes`. Upstream notes that Spark-H3 v0.2.0's **Linux** archives for RTX 30/40 cards register only the SM120 node; check whether the Windows archive is affected.
- **pi-H3-DWD-KJ-Sol:** Kijai's Triton Sol-Attn; any GPU Triton supports. The first run compiles kernels and is slow.
- **pi-H3-DWD:** ComfyUI's built-in Sol-Attn. Nothing to install, but it runs in INT8 and visibly degrades pi-H3 video.

## Installing

Needs **ComfyUI 0.45.0 or newer** (the ComfyUI Desktop app updates itself). Remove any unofficial pi-H3, AsymFlow or pi-Flow extensions first.

```bash
# in ComfyUI's custom_nodes folder
git clone https://github.com/Lakonik/ComfyUI-piFlow
```

Or load a workflow and install the missing nodes through ComfyUI Manager. Models for pi-H3 (links in upstream `docs/piH3.md`):

| File | Folder |
|---|---|
| `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | `diffusion_models/` |
| `pi_h3_2step_dwd_adapter_int8_convrot.safetensors`, `pi_h3_4step_dwd_adapter_int8_convrot.safetensors` | `loras/` |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | `text_encoders/` |
| `minimax_h3_video_vae_int8_convrot.safetensors`, `minimax_h3_audio_vae_fp32.safetensors` | `vae/` |

Set `steps` on the **pi-H3 Adapter (2 or 4 steps)** node.

## Cautions

- **Model licences.** The node code is Apache-2.0. MiniMax H3, the FLUX family and Qwen-Image each have their own terms. Read the model card before any generated clip goes into client or broadcast work.
- **Label generated footage.** Per our production rules, a generated clip is a supporting shot, labelled as a concept, and never shown as real footage.
- **Fast churn.** Three releases on 21 November alone. Pin the commit in a project's notes.
- **Not tested here.** No GPU in this session.
