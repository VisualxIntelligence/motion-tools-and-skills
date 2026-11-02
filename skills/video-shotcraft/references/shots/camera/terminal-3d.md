---
name: terminal-3d
summary: Three terminal windows scattered through 3D space, the camera flying between them with a sine pull-back midway; at each window a command is typed out like a typewriter and results slide out line by line — a spatial narrative flow of command execution
use_when: CLI/workflow demos for developer products: shooting "a three-step command" as a three-stop spatial journey
duration: about 8.2s (246f@30fps; three stops each dwelling about 2–3s + two 30f flights)
energy: Medium (the flights give motion, the typing gives rhythm, and the whole is a steady technical narrative; closing on a ● READY highlight)
---

## Intent
Terminal output is by nature the anti-cinematic language of "flat scrolling", and this card spatialises it: each command occupies a physical window in space, and the camera visits the windows one by one as if walking through a machine room. The pull-back mid-flight lets the audience glimpse "there are more windows" — the sense of the full picture of the workflow.

## Motion core
- Each of the three windows holds a pose (x/y/z/ry, world-coordinate px), and the camera takes the **inverse transform**: `translateZ(-pull) rotateX(tilt) rotateY(view−ry) translate3d(-x,-y,-z)` — writing the window pose table gives the camera path; each stop keeps an 8–10° side-view angle (the VIEW table), so when settled the window is not exactly face-on, which reads clearly and has volume
- Windows are laid out at real screen size (1180×620, command 52px / output 38px monospaced), rasterised 1:1 when the camera settles — no outer enlargement is relied on, so the text is not blurry (Q2)
- Each of the two flights is 30f (swift asymmetric in-out), with a `sin(π·u^0.85)×1250px` pull-back bulge midway — at the peak the picture shrinks to ~0.6, the three windows share the frame, "glimpsing the full picture"; a horizontal directional blur is added by the camera's screen speed (effective only in the flight sections)
- Depth of field: each window's focus is computed from its distance to the current stop → `blur 0–3px + brightness 0.62–1 + opacity 0.72–1`; during the pull-back the depth of field deepens overall (the defocus amount narrows with pull), so all three windows are recognisable as terminals in the wide view
- Spatial anchors: the ground is an SVG perspective grid drawn line by line with a projection formula fully isomorphic to the world (constant line width, no flicker); behind the focused window is a patch of backlight and beneath it a pool of accent-colour reflection (both projected to the screen by the window centre); behind each window stands a 560px outlined step number, producing parallax with the window during flight
- Three elements of the typewriter: the command character by character (0.75–1.65f per character with deterministic jitter, an extra 0.6f pause on spaces), the block cursor hugging the end of the text (constantly lit while typing / blinking on an 8f half-cycle once typed), pausing 2f after typing before Enter; the output is terminal-style fast printing (each line fading in on 6f snappy + sliding back 10px to the left, line spacing 4f), with the status slot first turning a braille spinner for ~6f before landing on ✓
- The typing start points TYPE_AT `[8, 94, 184]` all come after arrival at the stop — no typing during flight, so attention is not split; the only bloom in the whole film goes to the ● READY finished-film name in the third window (Q4)

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Pull-back bulge | sin(π·u^0.85)×1250px | Cut it and the flight is a "pan" with no "take-off and landing"; below 800 only two windows are visible mid-flight and the sense of the full picture is lost |
| Flight / dwell | Flight 30f, in-stop ~60–90f | The dwell must hold typing ~20f + output ~20f + reading time ≥14f |
| Side-view angle | 8–10° (the VIEW table) | 0° degrades into a flat screenshot; >18° the monospaced text is flattened by perspective and cannot be read clearly (Q6) |
| Depth of field | blur ≤3px, during pull-back ×(1−0.45) | If the defocus is too harsh the whole flight is a blur and the spatial relationships cannot be read |
| Typing rhythm | 0.75–1.65f/character + 0.6f on spaces | Constant-speed letter by letter reads as a machine replay; >2.5f/character and the audience becomes impatient |
| Output printing | 6f snappy, line spacing 4f | A terminal "spits" its output out, and a slow slide-in (>12f) reads as PPT |
| Window pose | x spacing ~1500px, z −220~+260, ry ±14–28° | The angle differences and front-to-back staggering are the source of the "spatial scatter feel"; everything facing straight ahead degrades into a flat carousel |

## Known pitfalls
- The camera is implemented as an inverse transform, and **the window transform, the world transform, and the project() of the ground/backlight must be isomorphic in all three places** — when changing poses change only the POSES / VIEW data, and when changing the camera chain change all three together, otherwise the ground grid and windows will "slide"
- The command/output copy is an illustrative video-shotcraft film-making workflow (shotcraft init / render / export: build the storyboard → render → mix and export); when swapping in a project's real commands, keep the information structure of "short commands, 3–5 lines of output"
- Cursor blinking is taken modulo the frame (8f half-cycle), and changing the duration does not affect it; keep the contrast of "constantly lit while typing, slow blink on standby"
- The READY line in the third window pops out at ~220f, and at least ~24f of hold must be left afterward, otherwise the last frame has no settling
- The cursor must hug the characters already typed: do not use opacity 0 as a placeholder for characters not yet typed (it would push the cursor to the empty space at the end of the line, left dangling)
- The whole stack's SpeedBlur is a full-screen SVG filter, enabled only in flight sections where speed >0; zero overhead in still sections, so do not change it to always on

## Reference implementation
demos/camera/terminal-3d/
(Terminal3D.tsx)
