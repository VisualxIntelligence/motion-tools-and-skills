# ogl-post-chain — notes

**Source:** written for this repo on top of [oframe/ogl](https://github.com/oframe/ogl) @ `385ce65` (Unlicense, [LICENSE-OGL](LICENSE-OGL)). The FXAA function is adapted from OGL's `examples/post-fxaa.html`. The bloom pyramid uses the widely published dual-filter 13-tap downsample (Jimenez, Call of Duty: Advanced Warfare, 2014) with a Karis-average prefilter (each group weighted by 1 / (1 + luma)), and the NaN guard follows the pattern noted in [`../../docs/reference-only.md`](../../docs/reference-only.md#2-claude-opus-5-5-demo--no-licence). The code is our own, MIT like the rest of this repo's own writing, except the adapted FXAA function (Unlicense). Upstream OGL has no skills or post-processing recipes of its own beyond `Post.js` and two examples (`post-bloom`, `post-fxaa`); this skill goes further than those because they render to 8-bit targets and are not written for frame-exact capture.

## What it makes

Not a video by itself: a way to make an OGL scene look finished. Glow on emissive and neon work, tone-mapped highlights, a graded and grained image, antialiased edges, all without breaking the "every frame is a pure function of `t`" rule.

## When to use it

- Neon, HUD, particle, light-trail and shader-heavy scenes where bloom does most of the look.
- Anywhere a three.js `UnrealBloomPass` setup would be too heavy for a scene that is otherwise only a few shaders.
- Not for scenes that need depth of field, ambient occlusion, motion blur or TAA. Those are in `../../tools/lemo-core/` (three.js post: GTAO, DoF, bloom), `../../starters/pdoom-video-engine/` (adaptive motion blur) and `../../starters/tidewater-webgpu-fx/` (the full WebGPU chain).

## Needs

The `../../starters/ogl-time-pure/` project, WebGL2, Node for the install script. Nothing else.

## Using it

`node scripts/install.mjs <project-dir>` copies `chain/chain.js` into the project's `src/post/` and the example scene into `scenes/`. Both import by relative path (`../vendor/ogl/...`, `../src/post/chain.js`), so they only run inside a project laid out like the starter; they are not meant to run from this folder.

## Tested

On 26 Oct 2026, installed into a copy of the starter: `npm run check` passes (11 renders at 4 distinct times, every repeat byte-identical, including after seeking backwards), the contact sheet shows bloom, chromatic aberration, exposure fades and no blobs or flicker, a 1 s clip encodes (1920×1080, 24 fps H.264) and parallel `--frames --workers=2` works. Run on headless Chromium 156 with SwiftShader (software GL), not a hardware GPU; bloom looked right, but look at your own GPU's output before a long render. I did not deliberately inject NaN to test the guard; it is a standard pattern but unproven here.

## Changes from upstream

Not applicable (new code). Compared with OGL's own `Post` class: HDR half-float targets instead of 8-bit, a multi-level pyramid instead of a single blur, a tone-mapped composite, and frame-keyed integer-hash grain.
