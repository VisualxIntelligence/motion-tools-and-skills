---
name: beat-step-list-theme-cycle
summary: A three-channel metronome — in a dark field an adjective list steps up one row per beat, a fixed capsule at the centre of the viewport "catches" the next word and changes colour, and the whole field's base colour changes on the same beat; the row, colour and field channels are locked to the same beat point
use_when: Sections on "the same product in many moods / multiple themes" (a run of adjectives in the modern/playful/expressive style); the densest-rhythm section of the whole film; sections that hit the beat of the music
duration: lead-in 30f + 18f per beat × number of beats + closing hold; 4 beats about 4.7s (demo 140f)
energy: High (one beat every 0.6s with three channels jumping together, density-type high energy)
tags: typography
---

## Intent
Changing a theme colour once is a feature demo; changing it every 0.6 seconds, three times in a row, with "the selected row + capsule colour
+ whole-field base colour" jumping together on the same frame each time — that is a metronome. The cheapest variable switch is used to create
the highest rhythmic density in the whole film. There are two crux points: first, **the three channels must be locked to the same beat point**, and if any
one channel is half a beat slow, "jumping together" degrades into three animations each doing their own thing; second, **the boundary between jump and slide**
— the jump takes only the 6f at the head of the beat and the remaining 12f are completely still; a beat point must "jump" not "slide",
and a list scrolling at constant speed is just a list.

## Motion core
- The capsule is fixed at the centre row of the viewport and **does not move**, while the list's translateY steps beat by beat — visually
  it reads as "the capsule jumps to the next row to catch the new word", but what actually moves is the world, not the capsule
- Beat length 18f (0.6s @30fps ≈ 100BPM), with the jump window only the 6f at the beat head:
  `snap(t) = 1-(1-x)^3.2` (steep ease-out), and the remaining frames at rest
- The three channels are driven from the same source: one tInBeat feeds the list displacement, the capsule/base-colour
  rgb per-channel cross-mix, and the capsule squash together — one clock, with no curve hung separately on each
- The theme table changes pairs beat by beat (demo "Make it modern → playful → expressive → BOLD → yours.":
  bone white / dark espresso → orange / dark plum → iris purple / dark indigo → mint / dark teal → sunflower yellow / dark navy), the capsule colour and
  base colour being a matched light-dark pair, not independent random colours; each theme also carries a typeface for the selected word (sans-serif / rounded /
  serif italic / all-caps Futura), changed on the same beat — the reskin reads as "many moods" and not just a colour change
- The capsule = a lens: outside the capsule is the uniform dim-white list, and inside the capsule is a clipped copy of the same list (dark text + the theme typeface),
  and a word changes colour and typeface only at the moment it crosses the capsule edge; the capsule width = the measured text width of the selected word + padding, interpolated by the same tInBeat
- Capsule landing squash: vertical 1.14→0.96→1, horizontal in reverse 0.97→1.01→1, completed over the 6f of the beat head; at the moment of catching
  the capsule brightens + the same-colour glow surges once (exponential, recovering in ~3f)
- Unselected words decay by row distance from the viewport centre (adjacent rows 42% white, each further row −15%, font size shrinking slightly, far rows blurred);
  the top and bottom base-colour gradients feather the viewport — the feather colour must stay in real-time sync with bgColor, and a hard-coded colour breaks the illusion when the field changes
- Element-layer echo (optional): the corner theme counter 03/05 and the swatch row change state on the same integer beat, adding no whole-picture impact of any kind
- 30f of rest as lead-in before the beats begin — first let the audience see clearly that "this is a list", then start hitting the beats

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Beat length | 18f (BEAT_LEN, changing it changes the BPM to match the audio track) | <12f and the audience has no time to read the words and sees only colour flashes; >26f and the beat feel scatters into showing one by one |
| Jump window | Beat head 6f, ease-out exponent 3.2 | A window >10f or a gentle curve turns "jump" into "slide", and the metronome collapses into a scrolling list |
| Beat count | 3–4 beats | At 5+ beats the audience has adapted to the rhythm and starts to drift; 1–2 beats cannot establish the "metronome" persona |
| squash | Vertical 1.14→0.96→1 / horizontal reverse 0.97→1.01→1 | Without it the capsule looks like a texture swap of colour; >1.2 and the bounce steals the colour change's scene |
| Base-colour span | Adjacent themes' base colours must have the same lightness and different hues (all dark) | A lightness jump (dark → light) reads as a screen flash rather than a reskin |
| Lead-in / closing | First 30f at rest; hold ≥30f after the last beat | Without a lead-in the first beat reads as a bug; cutting right after the last beat has no confirmation of "stopping on the final colour" |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Division of labour with theme-switch-moves: that card is the ceremony of a single reskin (sweep/ripple, one change
  tells one story), while this card uses repeated reskins as a beat — use that card to talk about the "dark mode feature",
  and this card to talk about "many moods / the volume of themes"
- **Heavy sound dependence**: the beat points align to the drum hits (change BEAT_LEN to match the BPM), and in a silent version the three channels
  jumping together read as the interface glitching
- Word list length ≥ beat count + 2 — leave unselected words at the bottom of the list as padding, otherwise stopping on the last row of the list
  on the final beat shows "nothing below"
- Do not use "integer-beat judgement for inversion to white" for the selected state: during the 6f of the jump, the new word turns black while still below the capsule, which reads as a breakdown.
  The demo uses the capsule lens (a clipped copy) — text colour / typeface is decided by the geometric boundary, while colour still follows the fractional tInBeat
- The capsule width is hard-coded from the measured text width of the selected word (re-measure when changing typeface / font size), otherwise the text touches the edge or the capsule is half empty
- Theme typefaces use system stacks: Chrome does not recognise `ui-rounded`, so rounded goes via Arial Rounded MT Bold, falling back to sans-serif when the font is missing

## Reference implementation
demos/rhythm/beat-step-list-theme-cycle/
(BeatStepListThemeCycle.tsx)
Original source: bear-app 22.3–24.6s
