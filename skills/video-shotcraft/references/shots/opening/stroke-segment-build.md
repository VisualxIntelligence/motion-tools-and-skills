---
name: stroke-segment-build
summary: Broken strokes become a word — the title is split into a dozen or so unconnected stroke segments that light up one by one in shuffled order, unreadable for the first 70%, and the moment the last segments land the meaning snaps into place
use_when: A product name / big-number reveal in an opening that hangs on suspense; ≤1 per film; division of labour with type-assembly/draw-svg-trace: those are "watching the text be assembled/drawn", this card is "meaning revealed after a delay"
duration: 165f (5.5s; 2s hold after the reveal at f105)
energy: Low start, medium finish (suspense type, the landing frame is the energy point)
tags: typography
---

## Intent
The precedent of the title sequence of Alien: the title is not drawn, it is "developed" — split into discrete
stroke segments that light up in shuffled order, so for the first 70% of the time the audience sees only mysterious fragments, and the moment the last few segments land
they suddenly read what the word is. "The moment of recognition" is the hook, and the strength of the hook depends on
how long the unreadable period is sustained and how late the key segments are held back.

## Action phases
| Phase | Frame range reference | Content |
|------|------|------|
| 1 Dark stage | f0–12 | Deep purple wall + very faint wall light at rest (not dead black) |
| 2 Shuffled lighting-up | f12–72 | The start points of the first 13 segments are distributed on an ease-out (interval 9f getting denser down to 3f); each segment is a 7f neon strike-up flicker (on—off—on—half—on), then holds steady at 0.58 brightness |
| 3 Held breath | f72–86 | 14f with no new segments added, only the faint hum of tube current — the tensest beat of the suspense |
| 4 Key segments | f86 / f93 / f99 | S lower spine → H middle bar → P bowl bottom, dropping in on three beats |
| 5 Reveal | f105 | All tubes 0.58→1, the current surges up to 1.25 and falls back (the sign's own broad glow surges once), the whole word scale 1→1.02, the wall and floor are lit up |
| 6 Freeze | f113–165 | Hold after the subtitle rises, with the camera pushing in very slowly 1→1.035 throughout |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Segment granularity | 4 letters, 16 segments (single-line geometric letters 260×400 per letter, tube line width 30, round end caps, 4% electrode gap left at each end) | Too few segments and the suspense period is short; too fragmented and it reads as noise. S is split into two opposite-direction arcs of 3 segments each |
| Shuffle order | Arranged by hand: jumping across letters, with the "legibility key segments" (S lower spine / H middle bar / P bowl bottom) pushed to the last 3 segments | Lighting up in order = no suspense; key segments appearing early = giving away the ending ahead of time |
| Lighting rhythm | Sparse → dense (9f→3f, `stagger(.., EASE.out)`) → held breath 14f → three beats at 7f/6f | Constant evenly spaced intervals have no tension; a held breath <8f cannot be felt, >20f reads as stuck |
| Unreadable period | The first 13 segments (about 60% of the duration) cannot be read as a word | In QA pick a mid-section frame and ask "can I guess it?"; if it can be guessed, reshuffle |
| Half-lit → fully lit | Suspense period 0.58, reveal 1.0 + surge 1.25 | If the suspense period is too bright (>0.8) the reveal has no "powering on" contrast |
| Landing pulse | scale 1.02 + a surge of light | Neon is an object hung on a wall, and large scaling looks fake; leave the impact to the light |
| Light on the wall | Ambient light = 0.12 + 0.5 × proportion of segments already lit + reveal/surge | The more lamps the brighter the wall, physically believable; a constant wall light makes the lighting-up lose weight |
| Floor reflection | Mirrored along the floor intersection line, blur 5px, opacity 0.42, fading the further from the floor | The mask is written in local coordinates before mirroring, and everything above the intersection line must be fully transparent |
| Unlit segments | Conditionally not rendered (not opacity 0) | The precondition for a truly still ending and for "not giving away the answer" |
## Known pitfalls
- The demo is the neon-sign version (aurora dark stage); when changing to another material (LED segment display, glowing outline) the strike-up curve and half-lit value must be retuned
- Use light grey for auxiliary text on a dark base — in the first version of the demo the top title was dark grey on a deep base and invisible (caught by the P1 self-check)
- Do not draw a separate radial light spot for the reveal bloom — it forms a dirty bright spot in the middle of the word; let the sign's own broad glow (whose shape is the word) surge once
- The reflection is the whole sign rendered twice (two layers of SVG Gaussian blur each pass), doubling the render cost of a single shot; when performance is tight, cut the reflection first
- Word length limit: words of 4–6 letters are best; for long words the unreadable period is hard to control and the segment count explodes
- This card feeds on the "moment of recognition", so the title must be a word the audience knows (a product name / SHIP/LIVE and the like),
  and a coined word has no "recognition" to speak of
- Sound: pair the segment-by-segment lighting with short electric ticks of the neon striking up (sparse, volume stepping down), leave only a low-frequency hum in the held-breath section, one impact on the landing frame + optionally a riser underneath

## Reference implementation
demos/opening/stroke-segment-build/
(StrokeSegmentBuild.tsx)
