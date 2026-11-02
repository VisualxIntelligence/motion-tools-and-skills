---
name: transition-hidden-cut
summary: Three hidden-cut-point transition variants — foreground-occlusion invisible cut, collision screen opening, warm light leak — with the hard cut hidden inside 1–3 frames of occlusion/impact/light peak so the viewer cannot see the scissors
use_when: When a junction between two shots needs a "traceless scene change" or a "ceremonial screen opening" (a technique card, selected at the same level as the three variants of shot-transitions)
duration: n/a (technique card; the frames each variant occupies are in the parameters table, carved out of the adjacent shots' budgets)
energy: n/a (technique card, takes no energy slot)
---

## Intent
Of the same family as shot-transitions variant A flash-cut: flash-cut uses a layer of white flash to cover a hard cut,
and these three variants swap in three kinds of "blinder" — a foreground card sweeping past (A), the impact frame of a collision (B),
and a light leak climbing to its peak (C). The shared principle is magician's misdirection: the hard cut is completed during the 1–3 frames when the viewer's eyes are
drawn away by a large movement/strong light, and by the time they look back the scene has already changed, with "the scissors invisible" throughout.
Flash-cut is the plainest option; choose A for a sense of direction, B for a sense of ceremony, C for warmth.

## Variant selection
| Variant | Method | Seam it suits |
|----|------|----------|
| A invisible-cut foreground-occlusion invisible cut | An out-of-focus foreground object skimming close to the camera (beyond the frame, soft-edged = defocus + motion blur) sweeps across, and within the occlusion frames that cover the whole screen the background hard-cuts A→B; the foreground sweeps out and the viewer thinks it is still the same shot | Page → page where the scene change should be completely traceless; the main option for faux "one take" |
| B versus-slam collision screen opening | Left and right half-screens (two comparison posters) with slanted cut edges accelerate in from off-screen and collide, with a white flash + screen shake + VS stamp on the impact frame, the cut point being the impact itself | Screen openings or chapter heads with comparison/matchup semantics (old vs new plan, two products, before/after) |
| C light-leak-burn warm light leak | A warm light leak in three colour temperatures sweeps diagonally, the hard cut to the new picture lands on the light-peak frame once it has swallowed more than seventy percent of the old picture, and by the time the light dissipates the new picture is in place | Chapter transitions wanting a warm tone/film flavour; softer than a white flash, with direction and temperature |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A occluder | A dark-brown out-of-focus foreground drawn purely with gradients: solid core 2600px + 340px soft edges on each side (total width 3280), with a terracotta rim light on the leading edge; right → left 14f (32–46f), bezier(0.3,0,0.7,1); cut point = the frame where the solid core covers 0..1920 (f39 in the demo, with the frames on either side covered by the soft edges) | The soft-edge gradient is itself defocus + motion blur, so CameraMotionBlur is not needed (12× sampling is too expensive); light and dark overlay layers on the occluder must be limited to the solid area with a mask, otherwise a hard edge is drawn on the transparent soft edge |
| A near-object shading | A 640px soft cast shadow in front of the occluder (0→0.38→0.5) sweeps across the page with it | Sells the sense of distance of "skimming past close to the camera" |
| A one take | The content drifts slowly sideways +40→−40px (smooth) throughout, running through the cut point; before the cut A is dragged 28px left (ease-in), after the cut B settles back from 28px right over 14f (ease-out); B page's layout is shifted 40px right as a whole to offset the end point of the lateral drift | Sells the illusion of "the same shot being caught by a gust of wind", and is half the credit for the traceless feel; the lateral drift eats the safe margins, so reserve for the end point |
| A cause and effect | At 24f Render is pressed (0.96 scale + darkening + a Rendering… spinner) → the sweep → B's "That's a wrap." render-complete ticket stub + stamp springs into place, checkmark drawn | Give an action before the occlusion and a result after the cut, and the viewer reads it as "done in a blink" |
| B slanted-seam geometry | clip-path polygon slanted edge about 78° (seam top x=1075→seam bottom x=845); the two half-screens collide into place from ±1240px at ease-in(cubic) over 10f (18–28f), with horizontal motion blur by speed (capped at 36px) | Only ease-in acceleration gives the "slam" feel; a vertical seam reads as a PowerPoint split screen |
| B impact trio | Fired together on the impact frame (28f): paper-white flash 0.85→0 for 3f in total + whole-frame shake 16px·e^(−t/1.7) settling in about 5f + VS round stamp pressed on with a spring (damping 12 / stiffness 260, scale 1.9→1, one visible overshoot); plus a shock ring for 16f + 12 radial speed lines for 7f | The three must start on the same frame, and one frame apart it falls apart; the shake amplitude must exceed the naked-eye threshold (perceptibility precedent) |
| B layout | The two sides are made as colour-block posters: ink-black "The old way" vs vermilion "With video-shotcraft", each with one 340px large number (14 days / 1 prompt) + a 44px description + a 32px checklist; after the collision the numbers rebound 1.05→1 (2f late) and the descriptions stagger left first then right; from 54f a bottom conclusion bar (mirror-engraved logo + brand slogan) sits over the slanted seam | The numbers are themselves the comparison's conclusion; put a rhetorical question in the establishing segment, and an ink line foreshadows the slanted seam (leave the type band blank where it crosses text) |
| C light layers | 3 radial-gradient ellipses stretched along the diagonal (1.35:1, rotated −34°) (#c2311a / #ff5a1f / #ffb347, long diameters 3000/2300/1700px, screen, no blur filter) + a linear light band of film-gate overflow light on the upper right edge, sweeping from upper right → lower left over 71f | Offset the light blobs trailing along the sweep direction, avoiding the perfectly concentric "flashlight feel"; the gradient is soft in itself, saving a 90px heavy blur |
| C light-intensity envelope | ease-in (t²) climb 28f (24–52, wind-up) → peak frame hides the cut → ease-out convergence 43f (residual warmth); at the peak overlay a 40% full-screen warm veil + a near-white-hot core (opacity=intensity³) + a 2f light lift at the cut point | A slow climb with fast convergence reads as a glitch flash; the hot core should ignite only near the peak |
| C washing out | At the peak the page filter: brightness raised 85%, contrast lowered 50%, saturate lowered 25%; the old picture's title fades with the light intensity to ~25% | This is the source of the "burn-through" feel — light that is only layered on without washing out reads as a sticker pasted on; if the title does not burn out with it, the cut point shows the type suddenly changing |

## Known pitfalls
- The demo was tuned on procedurally drawn pictures (A warm-sand video-shotcraft render page / B paper-surface comparison poster / C dark-field video-shotcraft viewfinder night→dusk,
  with the brand line "Frame motion. / Craft the shot." cut in half by the light peak) —
  the parameters are a tuning starting point, not a final production setting, and on first real use they must be re-verified with real footage
- The C variant is the first light-effect technique admitted to the library after the Q4 light-effect precedent was lifted — strictly observe the three Q4 constraints:
  single-point use (one place per film, not sent in a group), it passes only if it looks good in a self-check at normal-speed playback,
  and the light effect serves the cut point rather than decoration; mixing it with flash-cut in the same film counts as two light-effect hidden cuts
- The A-variant occluder must truly cover everything: in the demo the solid core of 2600px leaves a full-cover window of only about 1 frame
  (mid-section speed ~530px/frame) — after changing the sweep duration or width, first compute/inspect frame by frame whether the cut-point frame shows any background edge,
  and a single sliver showing gives the whole trick away
- The B-variant VS block's semantics only suit "comparison/matchup" content — when there is no two-sided confrontation
  do not use it as a general transition; remove the VS and keep only the collision and it degrades into a slanted-seam wipe, with the semantic requirement lowered as well
- Transitions are not stacked (same rule as shot-transitions): one variant per seam;
  these three variants are selected at the same level as shot-transitions' three variants, and for the same kind of seam in the same film do not use both flash-cut and the C variant
- Annotate seam by seam already at the storyboard-table stage (written into the "key motion" column), with the frame budget carved from the adjacent shots (R3)

## Reference implementation
demos/transition/transition-hidden-cut/
(InvisibleCut.tsx / LightLeakBurn.tsx / VersusSlam.tsx)
