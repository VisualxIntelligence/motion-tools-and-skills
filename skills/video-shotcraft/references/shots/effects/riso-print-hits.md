---
name: riso-print-hits
summary: Misregistration impact frame: a single riso-misregistration-hit shot where the headline splits into two-colour riso plates the instant it slams to a stop, shakes twice and snaps into register with a "pop"
use_when: Hit emphasis on headlines/cards, the paper-and-ink aesthetic's version of the "glitch flash"; a single-shot climax used 1–2 times per film
duration: 4s (120f, single shot)
energy: High
tags: typography
---

## Intent
The RGB chromatic-dispersion glitch flash (part of impact-feedback variant C) is phosphor-screen language, and clashes with a paper-and-ink
tone. This card offers a print-medium equivalent: the element splits into two single-colour riso plates (demo: fluorescent pink × blue;
a multiply ink feel rather than a screen fluorescent feel, the two plates overprinting into a dark ink when registered),
like a risograph with the plates out of register, shaking a few times
before snapping into register with a "pop" — the same impact force, with the imagined medium switched entirely to ink on paper. Single shot:
the plates split the instant of the sudden stop, the oscillation decays, and a hard cut snaps to register, stamping one hit. The demo is a video-shotcraft
two-colour riso promotional poster ("CRAFT IT / LOUD." + three selling-point columns, with the single-colour-plate mirror-engraved logo at the centre of the round stamp).

## Method
| Variant | Method | Use when |
|----|------|------|
| misregistration-hit single shot | The headline slams in and stops over 8f, splits into two plates misregistered in opposite directions by ~40px, and after 44f of decaying oscillation hard-cuts to register + a scale pulse + the "ON REGISTER" round stamp comes down | A hit stamp used 1–2 times per film; the instant a headline/large type arrives in place |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Two plates | Two-colour riso inks: fluorescent pink #ff4fa3 + blue #1f5fc4 (overprinting to dark purple when registered). `mix-blend-mode: multiply` over recycled paper (#f3eee2 + static paper fibres/ink grain), displaced in opposite directions; registration means both plates return to zero and coincide | The ghosting produced by multiply is exactly "ink not aligned"; screen blending instantly turns into a fluorescent glitch; pick complementary hues for the two plates, ideally overprinting to near-black when registered, and avoid pure grey (reads as a shadow) |
| Misregistration envelope | `offset = A·cos(2πt/18)·exp(-t/60)`, A=(20,8)px with the two plates in opposite directions (300px headline); hard cut to zero at frame 72 | The crux: registration is a **hard-cut jump**, not a gradual close — snapping to zero with a pop when the decay reaches ~11px residual is what gives the "pop"; a purely gradual close cannot read the registration beat |
| Slam-in | 8f Easing.in(cubic) slamming to a stop from off-frame, with the plates splitting on the hit frame | The plate split must be on the same frame as the sudden stop — 2f late and it reads as two separate events |
| Registration pulse | 4f scale 1.03→1 on the zero frame; on the same frame the round stamp comes down at scale 1.5→1; on the hit frame the whole page hitches by 1.2% and falls back over 10f | The stamping beat; omit it and the registration has no weight |
| Scope | The misregistration affects only the headline; the background (sun / colophon / info bar) stays in register | Splitting the whole frame reads as a glitch rather than print |
| Close | Truly still for ≥40f after registration | R1 |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- **Misregistration amplitude perceptibility precedent (from this batch's real renders)**: the vocabulary list's original proposal of ±5px is almost invisible to the naked eye
  at normal speed in a 1920-wide frame — only starting from 16px per plate / 32px total separation is it perceptible (for a 200–300px headline use 20px/40px);
  when the amplitude is in doubt, make an extreme version to show the user (perceptibility first)
- This card overlaps semantically with impact-feedback C (negative impact frame) — use this card in paper-and-ink tone films,
  and use variant C in game/anime tone films; do not use both in the same film (P4)
- A mixed horizontal and vertical misregistration direction (mostly x with a little y) looks more like plates out of register; purely horizontal reads as
  a left-right wobble
- With 300px large type at −0.045em negative letter-spacing, the horizontal strokes of adjacent glyphs may just touch (e.g. the top bar from F to T in CRAFT),
  and the anti-aliasing on both sides stacks into a hairline bright gap — pull the earlier letter in a further ~0.01em on its own so the two strokes overlap

## Reference implementation
demos/effects/riso-print-hits/
(RisoMisregistrationHit.tsx)
