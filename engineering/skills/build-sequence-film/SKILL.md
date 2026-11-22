---
name: build-sequence-film
description: Make a construction-sequence film from a 3D building model - the building goes up element by element in a believable build order (foundations, frame floor by floor, envelope following, roof) in one unbroken isometric camera move, drawn as a blue-ink line drawing that warms into colour at the end, rendered frame-exact from a three.js page. Use for "show how it gets built", construction animations, build-up or phasing films for developers and tenders, or turning an IFC/GLB/Blender model into a 16:9 or 9:16 reel.
---

# Build-sequence film

A three.js page draws frame `t` of the film from the model and a timeline. `render.mjs` steps `t` in headless Chromium and pipes the frames to ffmpeg. Nothing is keyframed by hand: change the model or the timeline and re-render.

## 1. Get a model with meaningful parts

The film can only build what the model separates. You need **one mesh per element** (or per small group), **named**, as GLB (Y-up):

- **From a brief:** `../brief-to-ifc/` writes IFC and a GLB whose nodes are named `L03|IfcColumn|C-A1`. That is the ideal input.
- **From an IFC file** (Revit, Archicad, Tekla): convert with IfcOpenShell (`brief_to_ifc.py`'s `to_glb()` works on any IFC), or IfcConvert, or Bonsai in Blender. Keep one node per element.
- **From Blender or SketchUp:** name objects with a stage keyword and a level, such as `L02_column_A1`, `facade_panel_N_L04` or `roof_slab`. Export GLB with "+Y up", one object per element, modifiers applied.
- **Very large models** (over about 2 million triangles or 5,000 elements): decimate first (`../../../tools/mesh-pipeline/lods.mjs`) or merge small parts per element. Check the preview frame rate before rendering.

## 2. Set up

```bash
cp -r template/ my-film/ && cd my-film
cp path/to/building.glb model.glb
npm install                       # three + playwright
npx playwright install chromium   # once per machine
```

## 3. Timeline: generate, then edit

```bash
node render.mjs timeline --duration 30      # writes timeline.json and prints counts per stage
```

The stage rules read node names: footings, piles and base slab are **foundations**; columns, beams, floor slabs and core walls are **structure**; ducts and pipes are **services**; facade walls, windows, curtain walls and cladding are **envelope**; roof and parapet are **roof**; doors and furniture are **fit-out**. Anything unmatched counts as structure.

The default order is what a builder does: foundations first, then the frame storey by storey, with services one storey behind and the envelope two storeys behind, then the roof, then fit-out. Within a group, elements go bottom to top along the building's long axis.

**Read the printed counts.** If a stage is empty or wrong, fix the names or edit `timeline.json`. Every element has `start`, `end`, `stage` and `motion` (`rise`, `slide`, `drop` or `fade`); `colour_from` and `colour_to` set the warm-up. The page uses `timeline.json` whenever it exists.

## 4. Check stills before the film

```bash
node render.mjs stills 2,8,14,20,24,29      # out/still_<t>.png + out/sheet.jpg
```

Look at the sheet. Check these four things:
- the order reads as construction (no floating facade, no roof before the frame);
- nothing pops in at full size (each element eases in from below, from outside or from above);
- the finished building fits in frame;
- the colour warm-up starts only after the last element lands.

Fix the timeline, then check again.

## 5. Render

```bash
node render.mjs film out/film.mp4                       # 1920x1080, 30 fps, H.264 crf 16
node render.mjs film out/reel.mp4 --w 1080 --h 1920     # 9:16
node render.mjs film out/film.mp4 --gpu                 # use the GPU (default is SwiftShader, which works everywhere but is slower)
```

Same model, timeline and settings give byte-identical frames. Music and voice are added afterwards, for example with `../../../tools/song-analysis/` for cuts on the beat. Mix to −14 LUFS for social or −23 LUFS (EBU R128) for broadcast.

## 6. Say what it is

A build-sequence film is **illustrative**: the order is plausible, not a construction programme, and any detail added for realism is invented. Put a line in the credits or the post ("Illustrative sequence, not a construction programme") whenever it goes to a client or goes public.

## Look and timing (defaults in `film.js`)

| Setting | Default |
|---|---|
| Camera | Orthographic, 32° elevation, a 10° drift and a 5% push-in over the whole film, fitted to the model |
| Line drawing | White Lambert solids, ink `#2f5fb3` edges at 25°, blue-tinted hemisphere shade, a soft blue ground shadow on paper `#f4f1ea` |
| Element ease | Cubic out, 0.35–0.9 s each: rise from below (foundations, structure), slide in from outside (envelope, services), drop from above (roof) |
| Build window | 1 s to 78% of the duration; colour warms in over the next 10%; then a hold |

Change any of these in `film.js`. Keep `renderFrame(t)` a pure function of `t`: no clocks, no randomness, no state carried between frames.
