---
name: brand-frame-snap
summary: A brand-colour frame grammar: a thick solid-colour frame grows ahead of the content and wraps the full screen, and the screen-recording window drops into the frame; on a mode switch the whole frame hard-flips colour on the same frame and the in-window layout swaps on the same frame, so a single borderColor handles chapter navigation, status signalling and brand exposure at once
use_when: The full-film wrapping layer for two-mode / two-chapter product films (blue = mode A, green = mode B colour coding); branded wrapping of real screen-recording footage
duration: A single colour flip ~4.7s (140f); the frame itself can stay on screen for the whole film
energy: Medium (high at the instant of the flip, a quiet wrapping layer the rest of the time)
tags: transition
---

## Intent
A real screen recording laid straight across the full screen has no brand presence, and adding a logo watermark looks cheap. This card
"mounts" the recording with a thick brand-colour frame: the frame **appears before the content** (set up the frame, then put in
the picture, for a sense of ceremony), and from then on the frame colour becomes the semantic code of the whole film — in the demo cobalt blue = Design,
orange-red = Dev Mode (blue/green in the original film; the key is opposing hues + a lightness difference). At a chapter switch the whole frame hard-flips colour within one frame, with no gradient; the hard colour cut is the visual equivalent of a "gear-shift"
sound effect; the in-window layout goes A→B on the same frame, and the corner label and badge change text in sync, three things on the same frame
resonating to hammer home the "mode switch". Division of labour with theme-switch-moves: that card changes the UI's own
skin (with a sweeping boundary), whereas this card changes the "frame", the wrapping layer (same frame, no boundary);
the semantics are mode/chapter switching, not theme switching.

## Motion core
- The frame uses 4 solid-colour bands (not the border property), growing in thickness 0→60px over 19f of snappy
  (a visible frame by frame 2); the opening has 22px rounded corners (colour blocks fill the four corners), and the bands carry a thin glaze
  that is bright on top and dark at the bottom; the colour flip = changing the background on the same frame, so the frame is deterministic
- The product window (1560×864, native-pixel layout) drops into the frame from 660px below with spring(damping 15, stiffness 115)
  + a forward tilt of 18°→0 + scale 0.88→1 (from frame 10, mid-way through the frame's growth),
  with vertical motion blur by speed on the descent, and the shadow tightening from 70→22 with height
- Motivation: the cursor glides in an arc over 56–80f to the Design | Dev switch in the title bar, pressing at 80 and releasing at 84 = the flip frame
- Four things on the flip frame, on the same frame: frame colour change + in-window layout A→B hard cut (right column from light inspector to dark
  CSS panel, left column from layers to tokens, blue selection box to orange annotation) + frame-band corner label text change
  (DESIGN→DEV MODE, the video-shotcraft wordmark at top right stays on screen, with the single-colour white logo on the bands) + switch state
- At the flip instant, 3 frames of radial white flash are overlaid (starting at 0.6 with stepped decay, brightest on the frame bands) + a damped
  bounce of the frame thickness (exp(-0.24t)·cos(0.95t)·12px) + a ~1% hitch in the content, giving the "gear-shift" a sense of impact;
  aftermath: annotation lines are drawn 3f staggered, and value capsules pop out with overshoot

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Frame thickness | 60px (1080p), corner label 30px bold all caps | Too thin reads as an outline, and the corner label also cannot fit a legible size; >64px starts eating into the content area |
| Frame growth | 19f snappy, 10f ahead of the window | The frame must be set up first — if the content arrives first and the frame wraps it later it reads as a patch-up |
| Window landing | spring(damping 15, stiffness 115), y 660→0 + rotateX 18°→0 + scale 0.88→1 | Landing "inside the frame" is the semantic key; the landing point must be fully inside the frame bands |
| Flip moment | demo 84f (the frame where the cursor releases); hold a beat (≥30f after the window settles) before flipping | If flipped before it has settled, the viewer has not yet built the "blue = current mode" code |
| White flash pulse | 3f, 0.6→0.2 stepped, radial (brightest at the frame bands) | Helps the eye register "this frame changed"; >4f reads as a background strobe and steals the flip's show |
| Thickness bounce | exp-decay cos, initial amplitude 12px | A pure hard cut is a bit dry; the bounce is the mechanical feedback of "the gear clicking in" |

## Known pitfalls
- The demo was tuned with a hand-built design-tool window (the frame-band corner label is the video-shotcraft logo + wordmark, and the canvas is a video-shotcraft promo card) — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The colour flip must be truly on the same frame: if the frame, the in-window layout and the corner-label text are even 2f apart, the "gear-shift" falls apart into three small animations
- The colour code must be kept across the whole film: no green main UI elements may appear in a blue-frame section; once the code is diluted the flip is merely a colour change
- The frame is a wrapping layer, not the star: ≤2 colour flips in a whole film; more than that reads as neon lights (the P4 restraint principle)
- The two modes' brand colours need enough contrast (the demo's cobalt blue #2F55FF / orange-red #FF5B1F, opposing hues + a lightness difference); flipping between neighbouring colours of the same lightness is as good as not flipping
- Keep the in-window UI neutral ink colour, and let the accent colour follow the mode only (selection state is blue in the blue section, annotations are orange in the orange section), otherwise the code is diluted by the UI's own colours
- Sound: pin a crisp mechanical click / gear-shift sound on the flip frame, with the white flash on the same frame as the sound; the frame-growth section can be silent

## Reference implementation
demos/effects/brand-frame-snap/
(BrandFrameSnap.tsx)
Original source: figma-devmode 0:28–0:32 + 0:43–0:47
