---
name: paper-title-card
summary: A single sentence is stamped onto the paper word by word, one word marked in accent-colour italic, closed off with a short dash
use_when: Chapter transitions / value-proposition title cards; a lead-in card before an important feature appears; a breathing spot in the film
duration: 1.7–1.8s (50–55f)
energy: Low (a breathing spot, separating two high-energy shots)
tags: transition, rhythm
---

## Intent
Between two product shots, give the audience a one-sentence breather: state clearly "what to look at next and what it is worth". The letterpress stamping texture puts the title card in the same world as the paper-and-ink style product shots.

## Motion core
- A single sentence of copy enters word by word: scale pressed down from large to 1 + blur→0 + opacity (the letterpress stamping recipe); the demo copy is the video-shotcraft tagline
  "Direct the film. / Let the agent shoot it." (emphasis word *shoot*), the word list can be marked `br` to force a line break, with the two lines close in length and no orphan word
- Exactly one key word per sentence: italic + accent colour (amber in the template film)
- An accent-colour short underline scaleX 0→1 closes it off
- At the tail the whole card fades out to hand off; a small mono subline + DigitRoll number can be attached

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Per-word entrance | word i delay = 4 + i·4, 9f, bezier(0.2,0.75,0.3,1); scale 1.28→1 + blur 7px→0 + opacity | A scale start of 1.28 is the sweet spot for the "stamping" read — compare the dark-field TitleCard which uses a 40px upward move + blur 10, the same recipe in light and dark versions |
| Key word | italic + accent colour oklch(52% 0.115 65), exactly one accent per sentence | Two accents is the same as no accent; choose the key word from a feature name / benefit word (C2) |
| Underline | 16→34f scaleX 0→1, 220×6px accent colour | The underline is a closing signal, and its appearance foretells that the card is about to end |
| Duration | all 4 title cards in the film are 50–55f (≈1.8s) | Title card duration is standardised — the time for an audience to read one sentence; longer drags the rhythm, shorter cannot be read |
| Layout | font size 116/serif; paper ground oklch(97.5% 0.008 82) + central warm light radial; 8f fade-out at the tail | Paper ground + warm light in the same colour family as the product shots, so the title card does not feel like an advert break |
| Subline | mono small text + DigitRoll (demo "12 shots rendered today"); for digit-roll parameters see the counter row of the list-stack-press card | Giving a specific number in the subline is the most persuasive; the digit roll must settle before this card fades out (a lesson learned) — work the beats backward from this card's fade-out frame |

## Sound
Title card entrances are all pinned to swoosh-quick (the template film's four title cards are pinned at f220/565/725/885 with the same sound) — the same sound for the same kind of element is the vocabulary discipline (S2); the title card itself has no landing accent, and the energy is left to the shots before and after.

## Known pitfalls
- Copy must be specific: carry a product feature name + a concrete benefit, as abstract metaphor words were rewritten by the user verbatim (C2 — "one board"→"one place to go", adding "Paper Radar"); rewrite the copy once against the final shots after the picture is locked (C1)
- There must be a lead-in title card before an important feature appears (C2 precedent: before a document shot add a lead-in line such as "Every project, linked to your weekly report") — a title card is not decoration, it is a chapter signpost

## Reference implementation
demos/typography/paper-title-card/PaperTitleCard.tsx (originally template/src/aifl/PaperTitleCard.tsx, parameterised: words/sub/subDigits can swap the copy)
