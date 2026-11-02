---
name: icon-field-colorize
summary: A dot-matrix of greyscale small icons surfaces in staggered fashion to fill the whole screen, holds for a beat, then several brand-colour horizontal bands ripple down extremely fast to flip the whole field — an opening/closing card of "lay out the full feature panorama first, then light up the brand in an instant"
use_when: Opening that lays out the product's range of capabilities (icons = a universe of features) and then stamps on the brand colour in one stroke; feature-collection pages, ecosystem/integration scale displays, a lead-in pad before the title-sequence logo
duration: surfacing ~45f staggered + rest ~10f + colour flip 12–45f + final-state rest; whole section 3–6s (demo 170f: colour flip on the 30f setting + title landing + final-state hold 1s)
energy: Medium (the surfacing is set-up, the colour-flip moment is the only burst)
tags: ui-entrance, outro
---

## Intent
First use greyscale to lay out "many" in full — hundreds of small icons surface in staggered fashion to fill the frame, with greyscale ensuring
they read as background texture and do not steal the scene; hold a beat so the audience realises "it's full", then the brand colour
sweeps across the whole field extremely fast in the form of horizontal band ripples, and the grey world is lit up in an instant. The crux is that **the colour flip is not
a hard flip on a single frame**: measured on the original film, several colour waves sweep downward in succession within ~0.5s (blue covers the whole field first,
then orange/green/red in turn cover lower row bands), and the final state is layered in four horizontal colour bands — the ripple gives the "lighting up"
a direction and a speed, while a hard flip merely reads as a swapped picture.

## Motion core
- Icon field: 150–200 small icons laid out on a grid (rows offset by half a cell), 3–4 levels of greyscale
  chosen at random; mulberry32 decides grouping/grey level/shape; the demo puts the icons in keycap-style rounded squares — on the dark stage
  greyscale = a dark keycap that is "not yet powered" (warm black base, hairline edge, top edge catching light, dark grey glyph),
  and the colour flip = powering on: the whole block becomes a glowing colour block + dark glyph + same-colour bloom
- Surfacing batches are grouped by distance from the frame centre (75%) + noise, reading as spreading outward from the centre
- Surfacing: fades in over 10 staggered batches (4.4f between batches + ≤3f jitter within a batch), each with a
  0.6→1.06→1 micro-bounce (overshoot once, then settles) + 10px rise
- A rest beat (~18f): lets the "filled" state be read; during the last 10f the whole field dims by 12% as wind-up (an intake of breath), returning to full when the first wave arrives
- Colour flip: several colour waves advance row by row, row difference ~1.4f + column slight slant 0.25f + per-icon ≤1.5f
  jitter (a slanted wavefront, not a whole row on the same frame); each wave covers downward from its own starting row,
  and later waves cover lower row bands → a final state of multi-colour horizontal bands
- Single-icon flip 4f: the new colour **fills the keycap by clip from top to bottom** (consistent with the wave direction, no opacity blending) + a 1.22x sine pop,
  and after the fill a 5f screen white flash + bloom overshoot gives the wavefront its "powering on" texture
- Light spill: once each row lights up, the stage behind it is tinted with a horizontal band of light in the same colour (intensity = the proportion of that row already lit), so the whole field really lights up
- Title landing: once the light stabilises, a layer of radial dark veil rises in the centre (pressing down only the centre, keeping the light around it), the video-shotcraft wordmark (in the eyebrow position) + the two-line 132px title "Every shot, / one place." rise word by word; the second line must not exceed the width of the dark veil, otherwise the letter edges sit over the bright keycaps

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Icon count | 170 (17×10 @1080p, cell spacing 108×106, keycap 66px) | <100 does not read as a "field"; >250 each one is too small for the colour-flip pop to be seen |
| Total surfacing length | ~48f (10 batches × 4.4f + 7f fade-in for the last batch) | Too fast reads as a flash-in; >60f and the audience cannot wait for the burst |
| Total colour-flip length | Original ~12f for the whole field; demo ~30f | The faster the bigger the burst; lengthen only for teaching / slow-paced contexts |
| Wave count and colours | 4 waves, a same-hue-family sunrise gradient (gold → amber → orange → coral red) | 1 wave = lighting up in a single colour also works; four colours across hues (blue/orange/green/red) read as a rainbow, while same-family segments feel more like a brand |
| Row difference | 1.4f/row + column 0.25f slant | Row difference >3f and the wave reads as a row-by-row scanner; 0 = a hard flip |
| Colour-flip pop | 1.22x sine 4f + clip fill | Without the pop the wavefront cannot be read; >1.4x and the icons fight each other |

## Known pitfalls
- The demo was tuned on hand-drawn simple icons — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Do not use an opacity cross-fade for the colour flip: a semi-transparent warm colour over a dark base passes through an olive/stucco-grey stage (precedent), so use a clip wipe-in;
  the white flash must also start only after the new colour has fully covered, otherwise a white flash on a semi-transparent overlay turns grey
- **The colour flip must not be a hard flip on a single frame** — dense-frame checking of the original film confirmed several ripples sweeping fast (bear-app
  25fps dense frames: blue → orange/green/red completed within about 0.5s), and a hard flip reads as a swapped picture with no sense of "lighting up"
- Icons need recognisable solid simple shapes (heart/star/lightning/checkmark…); abstract colour blocks do not read as
  the "universe of features" meaning
- Division of labour with theme-switch-moves: that card is a UI-interface light/dark theme switch; this card
  is the brand-colour lighting-up of a decorative icon field and carries no interface meaning

## Reference implementation
demos/opening/icon-field-colorize/
(IconFieldColorize.tsx)
Original source: bear-app.mp4 ≈0.0–3.0s
