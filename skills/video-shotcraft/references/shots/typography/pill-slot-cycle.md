---
name: pill-slot-cycle
summary: Mid-sentence word-slot rotation — the sentence stem is pinned and does not move, and the pill badge at the end of the sentence rolls one notch like a slot machine every ~0.7s (the old one flies up accelerating and fading out, the new one slides in from below with blur), switching through N feature words in a row before landing as a complete sentence to close
use_when: The most elegant solution for "feature listing" copy (faster than a list item by item, more semantic than character-level rolling); passages with a one-line selling point + multiple verb phrases
duration: entrance 12f + 21f per beat × word count + closing 14f + hold; 6 words about 6.7s (demo 200f, including a 48f complete-sentence hold)
energy: Medium (a steady metronome, no peak)
---

## Intent
To list six features, a list needs six rows, and fading in item by item needs six beats and fills the screen. Word-slot rotation packs them
into **one slot of one sentence**: the stem "One skill to ___" (the demo is about video-shotcraft: Storyboard it → Capture the page →
Move the camera → Cut on the beat → Design the sound → Render the film) is the promise, each pill
rolling through the slot is the evidence, and finally the pill flies away and "do it all." lands — the evidence
is listed in full, and the conclusion is stamped. The structure carries three acts by itself: promise → listing → closing. The crux is that the stem
**stays absolutely still**: the audience's eyes are pinned on the slot throughout, and if the stem so much as wobbles the listing feel falls apart.

## Motion core
- The stem is absolutely positioned with its left end anchored dead — **flex centring cannot be used**, because the pill's width changes would drag
  the stem into a reflow (a pit hit in the first round, now a precedent)
- Each beat is 21f (~0.7s), the first 8f completing the swap and the last 13f at rest — the rest section is for the audience to
  read the word, and a beat they cannot finish reading is the same as no change
- Entrance: translateY 120→0 + blur 14→4→0, Easing.out(cubic);
  exit: translateY 0→-130 + blur 0→10, Easing.in(cubic) flying out accelerating
  — the newcomer decelerates into place and the old one accelerates away, the sense of direction being "turning a page upward"
- Inside the slot an invisible placeholder pill (visibility hidden) holds the width, with the new and old pills absolutely positioned
  and stacked — the slot width changes naturally with the current word but does not jitter
- Closing beat: the last pill flies up (7f ease-in), "do it all." lands from 90px below
  with Easing.back(1.4) overshoot — the only overshoot in the film, saved for the conclusion; after landing the whole line slowly centres with smooth over 26f
  (during the listing the stem is still anchored at the left, moving only after the conclusion sentence is complete), and between "to do" the word spacing is drawn back to the ordinary spacing

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Beat length | 21f/word, 5–7 words | <16f and the phrase cannot be read; >28f and the metronome feel dissipates; with 8+ words the audience starts counting |
| Swap window | first 8f of the beat | Stretched to 12f+ the new and old are on screen together too long, reading as two pills fighting |
| Flight distance | in +120 / out -130px | <80px reads as a flash swap in place; asymmetric in and out (out slightly farther) makes the exit more decisive |
| Motion blur | in ≤14 / out ≤12px vertical blur, computed from real velocity (0 when still); in rotateX -38°→0, out 0→34° flipping a page around a drum | Remove the blur and the swap reads as a hard pop; >20px and the in-between frames smear into colour blocks |
| Closing overshoot | Easing.back(1.4), 14f | >2 and the conclusion landing looks cartoonish; with no overshoot the conclusion and the listing have no difference in rank |
| Ending hold | complete sentence at rest ≥45f | This sentence is the purpose of the whole section, and not holding it is the same as listing for nothing |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- This card is whole-word-level pill rotation embedded in a live sentence (not character / digit-level mechanical rolling) — use this card only when the copy has the
  "stem + verb phrase" structure, and do not force it onto pure numbers / pure title words
- Division of labour with typewriter-moves: the typewriter is "building a sentence one character at a time", this card is
  "swapping parts on a sentence that is already built" — the two can coexist in the same film but do not chain them on the same piece of copy
- Division of labour with type-rhythm-sync: that one changes the attributes of existing text with the audio track (the content does not change),
  this card changes the content — when binding to the audio track, just align this card's beat points to the drum hits, and do not stack font-weight pulses on top
- Pill phrase lengths should be close (the demo's longest are "Capture the page" / "Design the sound") — a length difference >2x
  makes the slot width jump too hard and the sentence's centre of gravity swings left and right
- The closing sentence must match the stem in font size and weight exactly (the demo uses 96px/800 for both) —
  if "do it all." is larger than the stem, it reads as a new headline rather than the completion of the sentence

## Reference implementation
demos/typography/pill-slot-cycle/
(PillSlotCycle.tsx)
Original source: notion-ai 4.5–8.5s
