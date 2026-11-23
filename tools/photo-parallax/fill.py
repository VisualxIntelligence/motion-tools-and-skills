#!/usr/bin/env python3
"""Paint in what was behind the cards, step 4 of photo-parallax. Writes plate_filled.png.

    python fill.py layers/                        # OpenCV (Telea), CPU, seconds, no model, any use
    python fill.py layers/ --method sdxl --prompt "empty stone plaza, colonial facades"

The plate's hole (hole_mask.png from layers.py) is only seen at the edges of the cards as the camera
moves, so a soft, plausible fill is enough for small moves. Use SDXL inpainting for big moves or when
a smear would show.

--method sdxl uses diffusers/stable-diffusion-xl-1.0-inpainting-0.1 (CreativeML OpenRAIL++-M: commercial
use allowed, with the licence's use restrictions passed on). It needs a CUDA GPU with about 10 GB, or
Apple silicon (mps), and downloads several GB the first time. Only the hole is replaced: the rest of the
plate stays the original photo, pixel for pixel.
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageFilter


def fill_opencv(rgb, hole, radius=6, work=1024):
    """Telea inpainting at reduced size, upscaled back into the hole only (holes are large; full-res Telea is slow)."""
    import cv2
    H, W = hole.shape
    s = min(1.0, work / max(H, W))
    small = cv2.resize(rgb, (int(W * s), int(H * s)), interpolation=cv2.INTER_AREA)
    hs = cv2.resize(hole.astype(np.uint8) * 255, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    hs = cv2.dilate(hs, np.ones((3, 3), np.uint8))
    out = cv2.inpaint(small, hs, radius, cv2.INPAINT_TELEA)
    up = cv2.resize(out, (W, H), interpolation=cv2.INTER_CUBIC)
    # fine grain so the fill does not read as a flat smear next to the photo's texture
    rng = np.random.default_rng(0)
    up = np.clip(up.astype(np.float32) + rng.normal(0, 2.0, up.shape), 0, 255).astype(np.uint8)
    return up


def fill_sdxl(rgb, hole, prompt, negative, seed, steps, strength, guidance):
    import torch
    from diffusers import AutoPipelineForInpainting
    dev = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else None
    if dev is None:
        sys.exit("fill.py: --method sdxl needs a CUDA GPU or Apple silicon; use --method opencv on this machine")
    pipe = AutoPipelineForInpainting.from_pretrained(
        "diffusers/stable-diffusion-xl-1.0-inpainting-0.1", torch_dtype=torch.float16, variant="fp16").to(dev)
    H, W = hole.shape
    s = 1024 / max(H, W)                                 # SDXL works at about 1024 px; sides multiple of 8
    w8, h8 = int(W * s) // 8 * 8, int(H * s) // 8 * 8
    img = Image.fromarray(rgb).resize((w8, h8), Image.LANCZOS)
    msk = Image.fromarray(hole.astype(np.uint8) * 255).resize((w8, h8), Image.NEAREST)
    g = torch.Generator(device=dev).manual_seed(seed)
    out = pipe(prompt=prompt, negative_prompt=negative, image=img, mask_image=msk, width=w8, height=h8,
               num_inference_steps=steps, strength=strength, guidance_scale=guidance, generator=g).images[0]
    return np.array(out.resize((W, H), Image.LANCZOS))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("layers", help="output folder of layers.py")
    ap.add_argument("--method", choices=["opencv", "sdxl"], default="opencv")
    ap.add_argument("--prompt", default="empty background, nothing in the foreground, same lighting and style as the photo")
    ap.add_argument("--negative", default="person, people, statue, object, text, watermark, blurry, frame")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--steps", type=int, default=30)
    ap.add_argument("--strength", type=float, default=0.99)
    ap.add_argument("--guidance", type=float, default=7.0)
    ap.add_argument("--feather", type=float, default=4.0, help="blend width at the hole's edge in pixels")
    a = ap.parse_args(argv)
    d = pathlib.Path(a.layers)
    rgb = np.array(Image.open(d / "plate.png").convert("RGB"))
    hole = np.array(Image.open(d / "hole_mask.png").convert("L")) > 127
    if not hole.any():
        Image.fromarray(rgb).save(d / "plate_filled.png")
        print("fill.py: no hole; plate_filled.png is the photo")
        return 0
    if a.method == "opencv":
        filled = fill_opencv(rgb, hole)
    else:
        filled = fill_sdxl(rgb, hole, a.prompt, a.negative, a.seed, a.steps, a.strength, a.guidance)
    # composite: original outside the hole, fill inside, soft seam
    m = Image.fromarray(hole.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(a.feather))
    m = (np.array(m).astype(np.float32) / 255.0)[..., None]   # the hole reaches past the cards, so its soft rim is background
    out = (rgb * (1 - m) + filled * m).astype(np.uint8)
    Image.fromarray(out).save(d / "plate_filled.png")
    lj = d / "layers.json"
    if lj.exists():
        L = json.loads(lj.read_text())
        L["fill"] = {"method": a.method, "model": "diffusers/stable-diffusion-xl-1.0-inpainting-0.1" if a.method == "sdxl" else "opencv-telea",
                     "seed": a.seed if a.method == "sdxl" else None}
        lj.write_text(json.dumps(L, indent=2))
    print(f"fill.py: wrote {d / 'plate_filled.png'} ({a.method}, hole {hole.mean():.1%})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
