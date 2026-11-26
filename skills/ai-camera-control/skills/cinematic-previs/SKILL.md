---
name: cinematic-previs
description: Plan, frame and render cinematic previs in code (three.js inside Remotion, or Blender) as a clay grey-box film where static placeholder figures and the camera tell the story. Use whenever the user asks for previs, an animatic, a grey-box or clay film, a shot list with real lenses and rigs, reference keyframes or contact sheets, camera angles or coverage for a scene, or camera direction for AI video (Seedance, Kling, Veo, Sora, Runway, Hailuo). It owns the look, the camera and cut rules, the stills-first QA loop and the reference-frame package.
---

# Cinematic previs

A previs here is a clay film whose figures cannot act. The camera, the blocking and the cut carry all the emotion. Every frame is checked as a still before any film is rendered.

Read these before planning anything:
- `references/rulebook.md` (its seven sections are cited here as §1–§7 in order): the sourced camera and cut rulebook (shot sizes, lenses, moves, rig physics, cuts, pacing, story beats, Blender and three.js setup, AI prompt syntax).
- `references/lessons.md`: what the first two films (Rootsong, Etherwake) got wrong and right, from their stills and the user's corrections.
- `references/frame-qa.md`: the measured and eye checks every still must pass, and the render order.
- `references/github-skills.md`: the few useful ideas from public skills on GitHub (a bounding-box framer, shot-card continuity fields, AI multi-shot and chaining rules), with their sources.

The code engine is `engine/cinematic` in this repo: `src/templates/*.ts` holds one template per move, `src/camera.ts` holds the rig feel and the HUD measurements, `tools/frame-check.ts` checks framing without rendering, and `render.mjs --stills` takes stills.

## The look (fixed unless the user changes it)

- **Blender clay render.** Matte grey and off-white materials, soft studio light, an environment with no colour.
- **Tints are for telling subjects apart.** At most one muted tint per character or hero prop, and white or near-white emissive light.
- **Static placeholder figures.** No faces that act, and no mouths or jaws. Head orientation is the figure's only look, so aim heads precisely and frame to them.
- **Picture area stays clean.** Slate, camera report and subtitles go in the letterbox bars, never over the picture.
- **24 fps with a 180° shutter**, and one aspect ratio for the whole film.

## The method

1. **Beats before shots.** Write the story as beats (setup, discovery, turn, action, release). For each beat, choose its camera meaning from rulebook §5: suspense shows the threat first, wonder pushes to a held reaction before the reveal, danger brings the camera closer, and release goes widest, stillest and longest.
2. **Shot list with numbers.** For each shot, set:
   - the size, lens in mm, and camera height and angle
   - the rig, and one named move with a start and end frame
   - the move's reason (no reason means a locked-off camera)
   - its length against the pacing table (§4)
   - the continuity it carries from the shot before, and what pulls the cut into the next

   Place each camera first with the bounding-box framer (`github-skills.md`) so the planned size is right before any tuning. Dialogue follows the triangle: master to OTS pair to clean singles to one CU at the turn, then back to a two-shot. Action opens on a geography wide and returns to it every 4–6 shots.
3. **One look still.** Render the hero in the main set as a medium shot and get the user's yes on the look before building more.
4. **Measured pass.** Run the frame-check numbers for in, middle and out of every shot (frame-qa, measured table). Fix every fail in the shot code.
5. **Stills and contact sheets.** Render in, middle and out of every shot. Build one sheet with one still per shot in story order, and one sheet with every still. Run the eye pass and fix.
6. **User approval on the one-per-shot sheet.** This is the only stop before rendering.
7. **Draft, then final.** Render a half-resolution draft for timing and cuts (Remotion `scale: 0.5`), then the full film. Check with ffprobe and sample frames at every cut.
8. **Reference package.** Every main frame clean and labelled, callouts naming each character, a one-per-shot sheet, a story-beats sheet, and `index.json` holding the camera data per frame. The user sends these on as references.

## Rules that the first films broke

- **Frame the head, not the prop.** On MS to CU, the eyes sit on the upper third and the frame never cuts at a joint.
- **Keep the OTS shoulder small.** It covers 20–33% of the frame width, and paired reverses match lens and distance.
- **Give every frame one point of interest** inside the safe area. Glow, rocks and clouds never outshine or outsize it.
- **Make inserts readable.** An insert fills the frame with the one object to read, and an action is shot from the side that shows it.
- **Give every frame one moving layer,** such as dust, wind, smoke or drifting light, because nothing else in it acts.
- **Decide the look before the build** (one still) and the framing before the film (stills). No full render without an approved sheet.

## Camera for AI video

When the previs feeds Seedance or another model, use rulebook §7. Each shot gets one named move, written with its size, angle, lens and end frame, in positive phrasing. The strongest bridge is to render the clay previs and pass it as the model's camera reference (Seedance `@video1` for camera only), or to use its stills as first and last frames, so the prompt only has to describe the look.

## Machine notes

- **Disk.** A render batch writes thousands of frames. Keep scratch on a disk with at least 3 GB free (`CAMERA_CONTROL_HOME`, default `engine/cinematic/.work`) and delete superseded renders once the new one is checked.
- **Renderer.** `tools/render-pill.sh <TEMPLATE-ID>` renders a pill clip. three.js renders run with Chrome's `angle` GL backend; the engine sets it.
- **Where this fits.** This skill is the camera craft. The `camera-control` skill is the whole pipeline (build or pick a template, render, write the prompt, send it through Tein). Use this one for the shot design and the camera numbers, that one for the process.
