# Photo parallax: one photo → a moving-camera shot

**Our own scripts (MIT), written and tested 23 November 2026.** Nothing copied: the models download from their authors. This is the step-by-step pipeline that [`../depth-anything/`](../depth-anything/NOTES.md) describes in one line ("split a photo into depth layers… fill gaps with an inpainted background layer"), built from these sources:

- **Apple Depth Pro 2**: [apple-aiml-research/ml-depth-pro-2](https://github.com/apple-aiml-research/ml-depth-pro-2) @ `aa389cb` (19 Nov 2026), weights [apple/DepthPro2](https://huggingface.co/apple/DepthPro2), paper [arXiv 2611.26603](https://arxiv.org/abs/2611.26603). Metric depth in metres with sharp edges and a focal-length estimate, from one network for photos, video and live streams. Sizes S (24M parameters, 97 MB), B (97M), L (334M) and H+ (872M, the default, 3.5 GB). Video runs in 16-frame windows that overlap by 4 for steady depth, or unbuffered for live use. Core ML export.
- **Mask2Former, ADE20K panoptic**: [facebook/mask2former-swin-large-ade-panoptic](https://huggingface.co/facebook/mask2former-swin-large-ade-panoptic). 150 classes ("sky", "building", "road", "person", "tree"…), each object a separate segment. Runs through 🤗 Transformers.
- **SDXL 1.0 Inpainting 0.1**: [diffusers/stable-diffusion-xl-1.0-inpainting-0.1](https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1). Paints in masked areas from a prompt, at about 1024 px.
- **DINOv3**: [facebookresearch/dinov3](https://github.com/facebookresearch/dinov3) @ `6876159` (15 Jul 2026). Meta's self-supervised image backbone, which Depth Pro 2 is built on. Not called directly here (see the end of this file).
- **Depth Anything V2 Small**: [depth-anything/Depth-Anything-V2-Small-hf](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf). The commercially licensed default.

## What it does

A Ken Burns move scales a flat picture. This rebuilds the photo in depth, then films it with a real camera move. Near things slide across far things, and the far things stay put: a dolly into a news photo, a slow orbit round a statue, a vertigo shot on a skyline.

```
photo.jpg ─ depth.py ─► depth/           metres (Depth Pro 2) or relative (Depth Anything), focal length
          ─ segment.py ► seg/            optional: what each region is (sky, ground, person, building…)
          ─ layers.py ─► layers/         plate mesh + cut-out cards for the near things + the hole they leave
          ─ fill.py ───► plate_filled    what was behind the cards: OpenCV (instant) or SDXL inpainting
          ─ template/ ─► shot.mp4        three.js page, time-pure, rendered frame by frame (16:9, 9:16, any size)
```

**How the layers are chosen** (`layers.py`): the sky and the ground (road, floor, grass, water…) always stay on the back **plate**. The plate is a mesh pushed out by depth, so a street recedes as one surface instead of breaking into slabs. Everything else is banded by depth. The band covering the most of the picture is the background, and only bands in front of it become **cards**: cut-outs with a soft edge, each its own depth mesh. Whole objects (a person, a car, a tree) move as one piece. Big regions such as a "building" are split where their depth jumps, because a fountain in front of a façade is often labelled part of the building. Without segments, a ground plane is fitted by RANSAC so the floor doesn't slice into cards.

## Quick start

```bash
# Python 3.11+: torch, transformers, pillow, numpy, scipy, scikit-image, opencv-python
python depth.py photo.jpg depth                         # Depth Anything V2 Small, Apache-2.0
python segment.py photo.jpg seg                         # optional, recommended (see licences)
python layers.py photo.jpg depth layers --segments seg  # or leave out --segments
python fill.py layers                                   # OpenCV; or --method sdxl --prompt "…" on a GPU

cd template && npm install                              # three + playwright (first time: npx playwright install chromium)
node render.mjs stills 0,3,6 --layers ../layers --move dolly-in       # check: out/sheet.jpg
node render.mjs film out/shot.mp4 --layers ../layers --move orbit --w 1080 --h 1920 --gpu
```

Depth made elsewhere (for example ComfyUI's Depth Anything 3 nodes, whose **DA3MONO-Large and DA3METRIC-Large are Apache-2.0**) goes in with `depth.py photo.jpg depth --import da3.png --source "DA3MONO-Large (Apache-2.0)" --commercial`. Use `--metric` for a `.npy` in metres and `--focal-px` if you know the focal length.

## Moves

`--move` with `--amount` (1 = the default size; distances scale with the subject's depth, so 1 reads about the same on any photo), `--duration 6`, `--ease inout|in|out|linear`, `--hold 0.4` (still at each end).

| Move | What it does | Starts on the photo? |
|---|---|---|
| `dolly-in`, `dolly-out` | Camera travels forward/back 12% of the subject's distance | Yes |
| `truck-left`, `truck-right` | Sideways, ±6% | At mid-shot |
| `orbit` | Arcs ±3° around the subject, which holds its place in frame | At mid-shot |
| `crane-up` | Rises on an arc around the subject, looking down at it | Yes |
| `vertigo` | Dollies back while zooming in: the subject keeps its size, the background looms | Yes |

The page computes **one overscan for the whole shot**, the smallest extra zoom that keeps the photo's border out of every frame (`window.timeline.guard`; on the test photo 1.0 for dolly, 1.06 orbit, 1.11 truck, 1.19 vertigo). The output frame is a window into the photo's own lens (`setViewOffset`), never stretched or letterboxed. When the output's shape differs from the photo's, the window centres on the nearest card; move it with `--fx 0.3 --fy 0.5`.

## Licences, model by model

| Model | Licence | Client or broadcast work? |
|---|---|---|
| Depth Anything V2 **Small** (default) | Apache-2.0 | **Yes** |
| Depth Anything 3: DA3MONO-Large, DA3METRIC-Large, Small, Base | Apache-2.0 | **Yes** (via `--import`) |
| Depth Pro 2 **code** | Apple sample-code licence (permissive, keep the notice) | Yes |
| Depth Pro 2 **weights** | Apple Machine Learning Research Model licence: research, non-commercial | **No.** `depth.py` refuses without `--research-only` |
| Mask2Former ADE20K panoptic | Model card: "other". ADE20K's terms allow non-commercial research and education | **Not cleared.** Use `layers.py` without `--segments`, or clear it first |
| SDXL 1.0 Inpainting 0.1 | CreativeML OpenRAIL++-M | Yes, with its use restrictions passed on to anyone you give the model to |
| DINOv3 | DINOv3 License (custom): commercial use and redistribution allowed on its terms | Yes, but no military, weapons, nuclear, espionage or ITAR uses; trade controls apply; gated on Hugging Face |

**The commercial-safe recipe:** `depth.py` with `da2-small` (or a DA3 Apache-2.0 import) → `layers.py` **without** `--segments` → `fill.py` OpenCV or SDXL → template. That is everything above except the two research-only models. Write the checkpoint names in the project notes. `layers.json` carries `commercial_use` from the depth step.

## Rules

- **Picture rights don't change.** Depth adds motion, not permission. The photo's licence and the agency's terms on manipulation still apply, and many news agencies forbid altering their photos. A parallax move is an alteration. Check before animating a wire photo.
- **Disclose it** where house rules require. Never use it to suggest a camera move or a view that didn't exist in a way that misleads. SDXL fill invents what was behind people and objects, so keep invented detail where a viewer won't read it as fact, and never fill in a face, a sign or a document.
- **Small moves look real; big ones look like cardboard.** The back of every object is missing. Hair, glass, railings and thin poles tear at depth edges.

## Tested here (Linux, 2 CPUs, no GPU)

Test photo: the Havana plaza from Depth Pro 2's repository (fountain in front, people, colonial façades, birds, cloudy sky). Not committed.

- **Depth.** Depth Anything V2 Small took 16 s. Depth Pro 2 **S** took 30 s, including the 97 MB download. It read the focal length from EXIF (1,567 px) and gave metric depth from 7.2 m (fountain basin) to 186 km (sky: always clip it; `layers.py --far 300`). Both maps are usable. Depth Pro 2 is visibly sharper on the fountain's edges, the people and the birds.
- **Segments.** Mask2Former ADE20K panoptic took 17 s on CPU: sky 46%, building 32%, road 12%, stairs 7%, tree, 5 people, a signboard, a pot. Transformers warns about 2 "missing" and 24 "unexpected" keys. That is harmless: an unused final layer norm, and position buffers it recomputes.
- **Layers** (2 s) give one card: the fountain, its basin and the near people, with 14% of the plate behind them. Depth-only mode with the ground fit gives the same card from either depth model.
- **Fill.** OpenCV Telea took 1 s and gives a soft smear, which only shows at card edges during the move. **SDXL inpainting was not run:** it needs a GPU (this machine has 7 GB of RAM and no GPU).
- **Render.** Dolly-in, truck-right, orbit, crane-up and vertigo were rendered as stills at 16:9, and orbit, crane-up and vertigo at 9:16. Two full 6 s clips at 30 fps (180 frames) took about 2.5 min each in SwiftShader (software). Use `--gpu` on a real machine.

Bugs the tests found, and the fixes now in the code:

| Problem | Fix |
|---|---|
| The façades became a card and left a 44% hole in the plate | The biggest depth band is the background and stays on the plate |
| Depth-only mode sliced the street into cards | RANSAC ground plane on the lower half; thin slivers dropped |
| Mask2Former labelled the fountain's finial tip as sky, so a ghost finial stayed on the plate | Sky pixels the depth model puts nearby are not sky |
| Birds became spikes on the plate mesh and streaked during vertigo | Near things floating free inside the sky are treated as sky |
| Spiky edges on near cards | Depth grid downsampled with a box filter, not bilinear |
| Orbit and vertigo showed black beyond the photo's edge | Shot-wide overscan guard; vertigo is dolly-back + zoom-in, which stays inside the photo |
| A 9:16 crop missed the subject | The window centres on the nearest card's centroid |

## Where DINOv3 fits

DINOv3 is the image backbone inside Depth Pro 2, and in many recent segmenters and trackers. You don't need it to use this tool. Use it directly when you want **features** rather than a finished answer: finding the same object across shots, clustering a photo archive by look, or training a small head for your own segmentation or depth task. Its repository has hub loaders (`hubconf.py`) and notebooks for foreground segmentation, dense matching, segmentation tracking and PCA views of the features. The weights are gated (request access on Hugging Face). Its licence forbids ITAR-controlled uses and end uses barred by trade controls, including military, nuclear, espionage and weapons work. Read it before any defence or security-related client job.
