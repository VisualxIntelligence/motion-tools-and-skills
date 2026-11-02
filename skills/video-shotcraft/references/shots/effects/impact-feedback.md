---
name: impact-feedback
summary: Two hit-feedback variants: hit-counter combo counting (hit-stop + damage numbers + combo count pop-ups), and anime-impact anime strike frames (negative + speed lines + chromatic dispersion)
use_when: The "instant of the hit" when an element lands/collides — giving slams and sudden stops a game-grade feel; pick the variant by intensity tier
duration: n/a (an element-level technique that piggybacks on the landing action; the frames each variant occupies are in the parameters table)
energy: High (instantaneous impact)
---

## Intent
When an element slams into place without an instant of "it hit", the landing reads as a PowerPoint fly-in. Game juice
(Vlambeer's screenshake theory) and anime-direction impact frames give the same answer:
for the few frames of the hit, bite down on time, and only then does the impulse reach the viewer's hands. The two variants form an intensity ladder:
B uses a local hit-stop layered with damage numbers and combo count pop-ups to cut a feature list into a combo,
with the strongest storytelling feel; C is the heaviest punch — three frames of negative flip and an exploding speed-line burst on a sudden stop, the highest emphasis level and
the most stylised.

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| B hit-counter combo counting | Three cards slam in one after another; each hit = hit-stop 2f + damage number floating up + ×N count pop-up escalating each time; the demo writes the "damage" as the production time video-shotcraft saves on each feature, which floats away and drops into the card footer | Feature-point barrage sections — "there are many features" told as a combo; strongly gamified language |
| C anime-impact strike frame | For the 3f of the crash-zoom sudden stop, the whole frame is colour-inverted to negative + radial speed lines + red-cyan chromatic dispersion, all removed on frame 4 | The one punch that is the single climax of the film; the cap of the emphasis level |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| B rhythm | Three cards 28f apart each (animation time 30/58/86), slamming down with ease-in(quad) for 10f before the hit; every hit freezes everything globally for 2f (the background diagonal-stripe scroll freezes too) | Even spacing is what gives the "combo" beat feel |
| B damage numbers | Struck in the lower-middle of the card face, scale 1.45→1 + floating up 150px past the card edge, fading over 12f after 4f; font size 88/104/124px per hit, yellow italic + hard drop shadow | A fade >16f is sluggish and hides the next hit; starting the jump from above the card top collides with the corner counter |
| B counter | Pulse peaks 1.3/1.45/1.6, rotate −2/−4/−6°, font size 140/166/196px, falling back with `exp(−t/2.4)`; the three-cell heat bar lights up cell by cell | Escalation each time is the crux — three equal sizes cannot read as "hitting harder and harder" |
| C crash-zoom sudden stop | First a 6f wind-up pull-back to 0.985, then a crash-zoom of 6f ease-in(cubic) pushing to 2.25x (card height 454×2.25≈95% of frame height, so the outline is not cut in half by the frame edge), the card centre converging to the exact centre of the frame; the flight frames get time-sampled motion blur + a sharp centre duplicate | The crash-zoom parameters follow the crash-zoom-punch card |
| C impact frames | 3f from the sudden stop: `invert(1) grayscale(1) contrast(1.45)` + 34 thick wedges + 22 fine needles of speed lines (shape changes every frame, inner ends eaten by a radial fade to leave the focal point) + red/cyan negative duplicates screen-blended with ±8px misalignment; all removed on frame 4, with the page outside the card dimmed for a beat | 3f is the sweet spot — from 4f the viewer starts to "see clearly" the negative, and the magic is exposed |
| C recovery screen shake | From frame 4, 6px with exponential decay (τ≈2.2f), settling in ~12f | The amplitude must exceed the naked-eye threshold (perceptibility precedent) |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The B-variant hit-stop **must be global** — the background scroll has to freeze with it, otherwise "time being
  bitten down on" cannot be read, and it looks like only that one card dropped frames. Driving all layers from a single remapped frame df in the demo is the crux;
  only effects that must "also happen during the freeze", such as the white flash, are driven by the real frame f
- Frame remapping shares the same technical root as speed-ramp-freeze; do not stack both cards on the same shot —
  two remaps fight each other and the rhythm reads as a glitch
- The C-variant negative frame is very attention-grabbing in a film with a paper-and-ink aesthetic — limit it to one climax, and it must land on the same frame as the
  impact sound effect (foley goes through sound-design); a silent negative frame reads as a broken flash
- The B variant's gamified language is strong (damage numbers/combo are blatant game memes), so use it with caution when the product's tone
  leans serious
- After several hit-stops in the B variant the real frame count exceeds the animation time by the accumulated frozen frames; when budgeting shots
  convert with `real hit frame = animation hit frame + frozen frames so far` (demo HITS_REAL)

## Reference implementation
demos/effects/impact-feedback/
(AnimeImpact.tsx / HitCounter.tsx)
