# <Style Name> — Design Spec

> Source of truth: the reference images in `references/`. Everything below is derived from them.

## Style Prompt

One paragraph describing the look and feel in plain language — what the viewer should perceive, the energy, the relationship to the speaker (takeover vs overlay).

## Colors

- Background: `#______`
- Foreground / text: `#______`
- Accent: `#______`
- (optional secondary): `#______`

2-3 colors max. These must match `tokens.css`.

## Typography

- Display / headline: `Font` — weight, when used
- Body / supporting: `Font` — weight
- Mono / label (optional): `Font`

## Motion

- Entrance feel: (snappy / fluid / dramatic) + the GSAP easing signature
- Exit feel:
- Ambient: any persistent background motion (drift, pulse, grain)
- Timing: typical card duration, stagger between sub-elements

## Card kinds in this style

- tier1 takeovers: which purposes (thesis / stat / section / quote / overview)
- tier2 cards: which purposes (label / list / equation / definition / lower-third)
- innovations: any custom card kinds unique to this style

## What NOT to do

- (anti-pattern 1 — specific to this style)
- (anti-pattern 2)
- (anti-pattern 3)
