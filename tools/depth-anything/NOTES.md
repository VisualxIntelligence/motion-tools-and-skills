# Depth Anything (V2 and 3) — notes

**Sources, read 23 November 2026. Nothing copied:** the weights download from their authors, and ComfyUI has Depth Anything 3 built in.

- [DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2) @ `a561b84` (24 Mar 2026). Code Apache-2.0. **Models: Small is Apache-2.0; Base, Large and Giant are CC-BY-NC-4.0 (non-commercial).** ComfyUI nodes: [kijai/ComfyUI-DepthAnythingV2](https://github.com/kijai/ComfyUI-DepthAnythingV2).
- [ByteDance-Seed/Depth-Anything-3](https://github.com/ByteDance-Seed/Depth-Anything-3) (Nov 2025). Depth plus camera pose from one or many views, and 3D export (GLB, PLY, Gaussians). Models: **DA3-Small, DA3-Base, DA3MONO-Large and DA3METRIC-Large are Apache-2.0**; DA3-Large, DA3-Giant and DA3Nested are CC BY-NC 4.0.
- ComfyUI @ `5ea159f` (0.46.0): built-in **Load / Run / Render Depth Anything 3** nodes, plus **Convert DA3 Geometry to Mesh** and **to Point Cloud** (`comfy_extras/nodes_depth_anything_3.py`). Models go in `models/geometry_estimation/`.
- [DepthAnything/Video-Depth-Anything](https://github.com/DepthAnything/Video-Depth-Anything): depth that stays consistent across long videos. Check each model's licence the same way.

## What it does

Estimates depth from one ordinary photo: a greyscale map where near is bright and far is dark. That map is what turns a flat news still into something a camera can move through.

## When to use it

- **2.5D parallax on news photos.** Split a photo into depth layers, or displace a subdivided plane by the depth map, then push the camera in. It goes further than a Ken Burns move on a still.
- **A mesh from one image.** DA3's *Convert Geometry to Mesh* gives a textured mesh with sky removed. Bring it into Three.js or Blender for a short camera move. Keep moves small: the back of everything is missing.
- **Depth-aware compositing.** Fog, depth of field, relighting or placing graphics behind a subject in a generated or real shot.
- **A ControlNet depth input** for image or video generation in ComfyUI.

## Rules

- **Licence first.** For client or broadcast work use only **DA3MONO-Large**, DA3METRIC-Large, DA3-Base/Small, or V2-Small. The larger V2 and DA3 any-view checkpoints are non-commercial. Name the checkpoint in the project notes.
- **Picture rights don't change.** Depth adds motion, not permission: the photo's own licence and the agency's terms on manipulation still apply. Many news agencies forbid altering their photos, and a parallax move is an alteration. Check before animating a wire photo.
- **Disclose it** where house rules require, and never use it to suggest a camera move that didn't happen in a way that misleads.
- **Look for tearing.** Hair, glass, fences and thin poles stretch at depth edges. Keep camera moves small, fill gaps with an inpainted background layer, and step through the frames.

## Using it in ComfyUI (DA3, built in)

1. Put a DA3 checkpoint (e.g. DA3MONO-Large) in `models/geometry_estimation/`.
2. **Load Depth Anything 3** → **Run Depth Anything 3** (mode `mono` for one photo; `multiview` with pose estimation for several).
3. **Render Depth Anything 3** for a depth image (`v2_style` normalisation by default; it can clip sky depth), or **Convert DA3 Geometry to Mesh** for a GLB-ready mesh (`decimation`, `discontinuity_threshold` to drop stretched triangles, sky mask, source image as texture).

## Using V2 from the command line

```bash
git clone https://github.com/DepthAnything/Depth-Anything-V2 && cd Depth-Anything-V2
pip install -r requirements.txt
# download depth_anything_v2_vits.pth (Small, Apache-2.0) into checkpoints/
python run.py --encoder vits --img-path still.jpg --outdir depth --pred-only --grayscale
python run_video.py --encoder vits --video-path clip.mp4 --outdir depth
```

Both scripts default to `--encoder vitl` (Large, non-commercial), so always pass `--encoder vits` for client work. Upstream notes the larger models are more temporally consistent on video. For video depth, prefer Video Depth Anything.

**Not tested here.** No GPU in this session.
