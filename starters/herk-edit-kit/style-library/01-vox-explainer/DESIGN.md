# Vox Explainer — Design Spec

> Source of truth: the reference images in `references/`. Everything below is derived from them.

## Style Prompt

Animated-documentary collage in the Vox house style. The frame is a sheet of warm, slightly aged paper — newsprint fiber, faint blueprint grid, a whisper of grain over everything. Onto it we paste **cutouts**: old engravings and halftone photographs, masked and outlined with a thick colored sticker-stroke (blue or orange), as if scissored from an archive and glued down. High-contrast serif type does the talking, anchored by the one signature move — a **bright blue shape** (circle or marker box) that the eye locks onto. Hand-drawn arrows and scribbles connect ideas like an editor's margin notes.

The motion is the soul of it: **choppy, low-shutter, stop-motion**. Nothing eases smoothly. Elements snap and stutter into place on stepped timing, as if shot on twos. The camera lives in a shallow **3D space** — it pushes and racks focus to point the viewer exactly where to look, blurring background layers so the subject pops. It should feel handcrafted and editorial, never slick or corporate. The relationship to the speaker: tier-1 cards are full-paper takeovers (the speaker is gone, we're inside the story); tier-2 cards paste a cutout or a marker label beside the speaker without covering their face.

## Colors

- Background (paper): `#efe9dc` — warm newsprint. Variant kraft: `#e6dcc4`
- Foreground / ink: `#17130e` — warm near-black print ink (text + engravings)
- Accent (AIS blue): `#37BDF8` — the signature; circles + marker highlight boxes
- Editorial red: `#e23b2e` — circles, scribbles, alarm
- Cutout orange: `#f26a1b` — sticker outline / secondary accent

5 symbolic colors, no more. The blue is sacred — one dominant blue shape per beat, never two competing. These match `tokens.css` exactly.

## Typography

- Display / headline: **Fraunces** — `300` for light editorial lines, `900` (+ italic) for the Vox-wordmark voice and emphasis. Extreme weight contrast. Optical high-contrast Didone feel at display sizes. Tracking `-0.03em`.
- Metadata / kicker / label: **Archivo** — `700` uppercase, wide tracking (`0.16em`). The recedes-into-the-page voice: chapter tags, technical specs, dates, credits.
- Handwriting accent: **Caveat** — arrow labels and margin scribbles ONLY. Never body copy.

Pairing logic: Fraunces (statement) + Archivo (metadata) cross the serif/sans boundary. Caveat is a third, deliberately small voice — the editor's pen, used sparingly. Playfair Display is deliberately avoided (the AI-default Didone; banned by the type guide).

## Motion

- Entrance feel: **snap + stutter**. Paper-cut elements pop with `back.out(2.2)`; choppy moves run on `steps(6)` to fake a low shutter / shot-on-twos cadence.
- Exit feel: quick — a `steps()` slide-off or a whip, never a slow fade.
- Ambient: persistent **paper grain** (subtly flickering on stepped timing), a slow **camera push** on tier-1, and **rack focus** (background layers blurred so the subject reads).
- Highlight reveal: the blue marker box / circle wipes on via `scaleX`/`scale` from 0 behind the text — the eye-magnet beat.
- Timing: tier-1 ≈ 5–8s with a breathing hold; tier-2 ≈ 6–14s. Stagger sub-elements 0.08–0.14s. Sequence is hierarchy — the first thing in is the most important.

## Card kinds in this style

- **tier1 takeovers:** `section` (chapter/title takeover), `stat` (one big number), `overview` (a 3-up timeline of photo cards with dates).
- **tier2 cards:** `lower-third` (name + role marker beside the speaker), `label` (annotated highlight callout with a hand-drawn arrow pointing at the subject).
- **innovations:** the cutout placeholder system — image slots render as deliberate paper-cut frames (halftone fill + colored sticker outline) so a card reads as "Vox" even before the agent drops in a real archive image.

## What NOT to do

- No pure white (`#fff`) or pure black (`#000`) backgrounds — always warm paper + warm ink. Vox never looks digital-clean.
- No smooth, slow, symmetric eases. If it glides, it's wrong. Snap, stutter, overshoot.
- No two blue focal shapes fighting in one frame. One eye-magnet per beat.
- No centered, perfectly level layouts. Elements sit slightly skewed/off-grid, pasted by hand.
- No gradients-as-decoration, no glows, no drop-shadow blur for "depth" — depth comes from scale, overlap, and rack focus, not soft shadows.
- No sans-serif headlines. The statement voice is always the serif (Fraunces).
