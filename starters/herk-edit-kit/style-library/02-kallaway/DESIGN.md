# Kallaway — Design Spec

> Source of truth: the reference frames in `references/` (Kallaway-style premium dark creator explainer). Everything below is derived from them. Palette is the **AIS brand** (blue is the hero glow where the references used purple). Internally this look is "aurora glass": dark canvas + aurora bloom + glassmorphism.

## Style Prompt

Premium dark motion-graphics in the modern creator-explainer house style. The frame is a deep, cool near-black canvas (`#0A0E14`) with a single **aurora bloom** of blue light rising from the bottom-center — the signature ambience, like a sunrise of brand color behind everything. A faint dot-grid and fine film grain keep the dark alive and un-banded. Onto this we float **glassmorphism** surfaces: frosted, backdrop-blurred cards and pills with a hairline top-highlight and a soft outer shadow, as if panes of lit glass hovering in 3D space. Key objects are **edge-lit** — neon-rimmed phone frames, glowing outlined icons in rounded white/glass tiles, dashed connector lines that draw between nodes.

Type carries the message and it **glows**: headlines lift off the canvas with a soft white-and-blue halo, big numbers and gradient words are the eye-magnets. The camera lives in a shallow, cinematic **focus-stack** — background layers sit blurred and bloomed while the subject snaps sharp, and elements drift, scale, and parallax with long, smooth After-Effects easing. Nothing snaps or stutters (that is Vox); here everything **glides and breathes**. The relationship to the speaker: tier-1 cards are full-screen takeovers (we are inside the idea); tier-2 cards float a glass card or edge-lit element beside the speaker without covering their face.

## Colors

- Canvas: `#0A0E14` — near-black cool. Deep well / vignette: `#07121C` navy.
- Text: `#F0EEE9` primary on dark; dim `rgba(240,238,233,.62)`; faint `rgba(240,238,233,.34)`. Pure `#FFFFFF` for max-emphasis glow text.
- **Accent (AIS blue): `#37BDF8`** — the hero. The aurora bloom, edge-lights, glow halos, the one word that pops. This *replaces* the references' purple.
- Secondary: `#F5D82A` yellow — highlight numerals, the rare second pop.
- Alert: `#FF3B30` red — alarm, negative delta, "the lie." Warm: `#FF8A5C` orange.
- Light surface: `#F0EEE9` / `#FFFFFF` for white glass tiles and chips (with `#2A251F` ink text on them).

The blue is sacred — one dominant glow per beat, never two saturated colors fighting. These match `tokens.css` exactly.

## Typography

- Display / headline / big numbers: **Plus Jakarta Sans** — `600`–`800`. Geometric and premium; its roundness matches the glass radii. This is the glow voice. Gradient fills (white→accent) for hero words.
- Body / labels / captions: **Inter** — `400`–`600`. The clean, neutral, Apple-adjacent workhorse. Recedes under the headline.
- Data / interface: **Space Mono** — timestamps ("1m ago"), percentages, ticker values, chip labels. The "this is a real interface" voice. Used sparingly.

Pairing logic: Plus Jakarta (warm geometric statement) + Inter (neutral body) + Space Mono (data). No serif anywhere — serif is Vox's voice, not ours.

## Motion

- Entrance feel: **glide + bloom**. Elements fade up with a long `power4.out`/`expo.out`, often with a `filter: blur()` that resolves to sharp (focus pull). Glass cards spring in with a gentle `back.out(1.4)` and a parallax y-drift.
- Glow: text and edge-lights **pulse** softly (finite `repeat`, `yoyo`) — a slow breathing halo, never a strobe. The aurora bloom drifts/scales subtly under the content.
- Exit feel: a smooth scale-down + blur-out or a soft whip — never a hard cut, never a stepped slide.
- Ambient: persistent faint grain + dot-grid; a slow camera push/parallax on tier-1; background layers blurred so the subject reads (focus-stack).
- Timing: tier-1 ≈ 6–8s with a breathing hold; tier-2 ≈ 5–10s. Stagger sub-elements 0.10–0.18s (slower than Vox). Sequence is hierarchy — the first thing in is the most important. Average beat is slower and calmer than Vox.

## Card kinds in this style

- **tier1 takeovers:** `section` (glowing chapter/title takeover, often over a rising orb), `stat` (one big glowing number / gradient figure), `overview` (glass-tile decks, numbered lists, phase stacks, timelines that build in).
- **tier2 cards:** `lower-third` (glass name/role card or edge-lit element beside the speaker), `label` (floating glass callout / annotation tied to the subject with a dashed connector).
- **innovations:** the **glass surface system** (frosted card with hairline highlight + outer shadow + optional neon rim) and the **aurora bloom** background — both are tokenized so any card reads as "Aurora Glass" instantly. Edge-lit phone/portrait frames for showcasing the speaker or a clip.

## What NOT to do

- No paper, no warm newsprint, no ink, no serif — that is Vox. This style is digital, dark, lit.
- No choppy / stepped / stutter motion. If it snaps on twos, it's wrong. Everything glides, blooms, breathes.
- No two saturated glow colors fighting in one frame. One blue eye-magnet per beat; yellow/red/orange are rare punctuation.
- No hard pure-flat fills where a glass or glow would carry the premium feel — but don't over-glow either; glow is for focal elements, not every box.
- No strobing/looping-forever glow (`repeat: -1`) — flicker/pulse is finite (`repeat: N, yoyo: true`) for deterministic render.
- No hand-drawn arrows, scribbles, marker circles (Vox motifs). Connectors here are clean dashed/solid lines that animate-draw, and dots/nodes that glow on.
