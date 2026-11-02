---
name: gradient-transition
summary: The background transitions smoothly between three kinds of CSS gradient, linear, radial and conic — angle, colour stops, centre and radius interpolated parameter by parameter, with a cross-fade between segments to change type
use_when: Continuous variation of ambient backgrounds/chapter background colours; giving static typographic sections a "living" background layer
duration: about 6.7s (200f@30fps; linear 0–2.3s · radial 1.9–4.4s · conic 3.9–6.7s)
energy: Low (pure background motion, making way for foreground content)
---

## Intent
A gradient is not a static texture but an animatable parameter set: any parameter within a gradient of the same type can be interpolated into a silky-smooth change, and across types a short cross-fade bridges them. Used as a background layer, it gives sections with "no subject motion" a layer of continuous low-speed energy.

## Motion core
- Three layers each hold one gradient type, only one layer dominates at any moment, the cross-fade window is very narrow (12–14f), and both layers are moving within the window
- Linear segment (0–68f): angle 18°→198° (swift in-out), three lightness colour stops (64→40→7) interpolated in HSL space across three channels
  (`mixH` lerps h/s/l separately, less grey than RGB) — with the lightness spread apart, the direction of the bright band makes "the angle sweeping" visible
- Radial segment (56–132f): centre (24%,72%)→(68%,38%) migrating diagonally + radius 48%→80% expanding, outer ring near-black,
  the light spot appearing to roam through the frame and come into focus
- Conic segment (118–200f): an A→B→C→A three-colour ring (purple / magenta / ice blue, same colour at both ends) with `from` rotating 0→250°,
  slow start and long tail, the ease slowing as it turns and settling; the centre is placed behind and to the right of the subject (64%,54%), with the outer ring and the text side darkened further
- **Painting on a small canvas**: the three layers of gradient are painted at 480×270 and then `transform: scale(4)` fills the screen — enlarging at the compositing stage naturally softens,
  the conic's blur(9px) is done on the small canvas (≈36px at full resolution), and the per-frame cost is 1/16 of a full-screen real-time blur; grain is overlaid on top to prevent banding
- Demo foreground: one large line of type per segment (180px), with verbs describing that segment's parameter motion (Bend light. / Focus it. / video-shotcraft wordmark + brand line),
  and the line change lands on the same beat as the type change; a mono note at the bottom reads out in real time the gradient parameters being interpolated

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Segment window overlap | Each segment starts 12f before the previous one ends | The overlap guarantees both layers are moving during the fade; without overlap you see "stillness at the instant of takeover" |
| Cross-fade | 56–68f / 118–132f (smooth in-out) | Widening it makes two gradient structures visibly fight on screen; a narrow fade + parameters moving together is the key to "changing type without changing breath" |
| HSL interpolation | h/s/l three channels lerped independently | When the hue difference is >180° it takes the long way round (e.g. 340→160); when a short path is needed add +360 to the start |
| Colour-stop lightness spread | linear light 64 / mid 40 / dark 7 | With a lightness spread <20 the angle sweep cannot be read, leaving only a flat base that changes colour |
| radial migration | Centre moving diagonally + radius 48%→80% | A fixed centre with only the radius expanding reads as "breathing" rather than "roaming" |
| conic rotation | from 0→250° (not a full turn, ease-out long tail) | A full 360° makes the ending coincide with the opening frame, for use when joining a loop; for a single playback leave a gap to avoid the feeling of "returning to the origin" |
| Colour-stop set | The same purple / magenta / ice-blue set for all three segments | When changing to the project's colours keep the "bright colour + dark colour" pairing structure; the radial outer ring must be dark (the precondition for the light spot to work) |

## Known pitfalls
- This is a background card: when placing typography/UI in the foreground overlay a dark scrim on the text side (demo: a linear darkening on the left + outer-ring vignette), otherwise the conic segment's bright colours eat the foreground contrast
- The R of `radial-gradient(circle R …)` accepts only lengths: writing `circle 45%` invalidates the whole gradient and the segment renders pure black — percentage radii must either be converted to px (the demo takes the small canvas width 480px as 100%) or switched to `ellipse X% Y%`
- Rewriting the CSS gradient string every frame triggers a repaint rather than a composite — for large frame sizes + low-end devices test it in practice; Remotion server-side rendering has no such concern
- The conic segment uses a three-colour loop (A→B→C→A); a seven-segment rainbow colour ring is "showy" in nature, so do not use it in branded scenarios
- The three segments can each be used separately: just the linear segment (0–68f renormalised) is a minimal "angle sweeping" base

## Reference implementation
demos/transition/gradient-transition/
(GradientTransition.tsx)
