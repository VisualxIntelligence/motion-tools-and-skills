# Third-party notices

What this repo uses that is not ours, and the terms that come with it. The MIT licence in `LICENSE` covers the code, prompts, notes and the pill clips made for this repo. It does not cover anything on this page.

## Rig and animations
Quaternius, Universal Animation Library 1 and 2 (`engine/cinematic/public/kit/UAL1_Standard.glb`, `UAL2_Standard.glb`). CC0 1.0, public domain dedication. Models by @Quaternius, https://quaternius.com. The original licence text is in `engine/cinematic/public/kit/LICENSE-Quaternius-CC0.txt`. Checksums are in `SHA256SUMS` beside the files.

## Render stack
- **Remotion** 4.0.522 renders every clip. Remotion is free for individuals, for for-profit organisations with up to 3 employees, and for non-profits. A for-profit organisation above that size needs Remotion's company licence. Read https://www.remotion.dev/license before you use this engine at work. This repo does not grant you Remotion rights.
- three.js 0.170 (MIT), @react-three/fiber (MIT), React (MIT), three-gpu-pathtracer 0.0.23 (MIT), Rapier 0.14 (Apache-2.0).
- Remotion downloads a headless Chrome the first time you render.

## Camera presets taken from real films
`engine/cinematic/src/kit/filmpaths.json` holds 33 camera moves of 3 to 8 seconds, normalised and relative to the actor. They were distilled from the E.T. dataset (camera trajectories estimated from film clips). The dataset's code and data repositories are marked MIT, and its paper states no further data licence. The clips it was estimated from are copyrighted films. This repo ships only the distilled curves, with the source ids and captions kept for attribution, and no frames, meshes or raw trajectories. If you plan to ship a product, check the dataset's terms yourself. The distil script is `engine/cinematic/tools/filmpaths/distil.py`.

## Example videos
- Many examples show the face and voice of the person who made them. They are examples of what a model does with a photo, not a licence to use that person's likeness.
- The AI examples are 480p drafts, shown to compare against the pill clips, not as finished films.
- Some examples were made from photos of real products with visible brand marks. The marks belong to their owners and are not covered by the MIT licence. The product photos themselves are not in this repo. The branded products are a sneaker, a soda can and a tumbler.
- The examples were made with Seedance 2.5 through a hosted API. Use of generated outputs follows the terms of the service you use. Check them before you publish anything you make.

## Environment pictures
The 24 images in `environments/` were generated with an AI image tool for this project and are covered by the MIT licence in `LICENSE`. They are mood references, not photographs of real places.

## Reference clips named in the templates
The famous-shot templates (the 360 booth, the walk away from the explosion, the leap of faith, the Peter Pan flight and others) are rebuilt from measurements of public reference clips. The repo ships no frames of those clips, only our own pill blockouts and notes.

Film names appear only to say what a template imitates. They are trademarks of their owners.
