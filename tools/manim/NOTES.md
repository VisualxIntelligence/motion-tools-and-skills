# Manim (Community Edition) — notes

**Source:** [ManimCommunity/manim](https://github.com/ManimCommunity/manim) @ `37056b0` (23 Nov 2026), version 0.22.1. MIT (© 2018 3Blue1Brown LLC, and © 2024 the Manim Community developers). Read 24 November 2026. **Nothing copied:** install with pip.

## What it does

Python animation for **maths, science and diagram explainers**, the engine behind the 3Blue1Brown style:
- shapes, graphs, axes, number lines, matrices, LaTeX equations, code blocks and 3D scenes;
- `Transform`, `ReplacementTransform` and `TransformMatchingTex` turn one object into the next;
- frame-exact renders to MP4, GIF, PNG sequences or WebM with alpha.

It is the engine for the **t1 grammar** in [`../../docs/guides/explainer-grammar/`](../../docs/guides/explainer-grammar/NOTES.md): one thing on screen, transformed rather than cut, colour as concept, smoothstep everywhere, about 1 s of hold after each animation.

## Using it

```bash
pip install manim                 # needs ffmpeg; Cairo and Pango come as wheels on Windows and macOS
# MathTex/Tex also need a LaTeX install (MiKTeX on Windows, TeX Live elsewhere)
manim -qh scene.py Explainer      # 1080p60; -qk for 4K; -t for a transparent background
```

```python
from manim import *
class Explainer(Scene):
    def construct(self):
        eq = MathTex(r"E = mc^2")
        self.play(Write(eq)); self.wait()
        self.play(TransformMatchingTex(eq, MathTex(r"m = \frac{E}{c^2}"))); self.wait()
```

## Notes for our work

- **Text.** Use `Text` (Pango) for words, including Arabic. Keep LaTeX (`Tex`, `MathTex`) for maths only.
- **Pacing.** Set `run_time` and `self.wait()` from the VO's word times (see [`../whisperx/`](../whisperx/NOTES.md)) rather than by eye.
- **Compositing.** Render with `-t` (transparent) to layer Manim over HyperFrames or GSAP backgrounds.
- **More guidance.** The `Yusuke710/manim-skill` lead in `docs/reference-only.md` is an agent skill for Manim, still to be reviewed.

**Not tested here.**
