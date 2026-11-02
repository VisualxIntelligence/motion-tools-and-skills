---
name: blur-slide
summary: Title enters word by word, with y 0.38em→0 + blur 18→0 + opacity 0→1 converging together on one shared ease-out, about 4f between words; the subtitle follows in a staggered overlap before the title has finished settling
use_when: Almost any place where a title and subtitle come as a pair; product-page hero copy, section subheadings; the default text reveal when you want "professional but not stealing the scene"
duration: about 4.0s (120f@30fps)
energy: Low (a single convergence, no peak, no loop)
---

## Intent
This is the **default solution** for text reveals: no spectacle, no mechanical feel, just words being
placed softly one by one. Its professional feel comes from a single thing: the y, blur and opacity channels share
the same progress `p` and the same easing, so words "surface out of defocus" rather than "slide in
with a fade on the side". When a film already has another heavy-handed technique (scramble / roller), the titles should
use this card and give way to the lead.

## Motion core
- Per-word progress `p = ramp(frame, start, dur, EASE.out)` (quint-out class), all three channels bound to the same p:
  `opacity = p`, `translateY = (1-p)·dy`, `blur = (1-p)·B`px (in the demo the letter-spacing tightening of the lead word is hung on the same p too)
- Main title (170px serif, two lines): the first line has 3 words starting at 10f, 4f between words, 22f per word; the second line first holds 6f for a breath,
  "feel" takes 26f, the lead word "cinematic." starts at 30f with a 30f entrance window (it settles last); `dy = 64`px, `B = 18`px
- Subtitle (46px sans-serif, 9 words): starts at 34f, 2.4f between words, 20f per word, `dy = 26`px, `B = 9`px
  — tighter spacing, smaller displacement, so **the hierarchy difference comes from amplitude, not duration**
- Staggered, not queued: the subtitle starts at 34f while the title does not finish until 60f, so the two overlap by 26f —
  queuing reads as two beats, overlapping reads as one sentence
- Split by word, not by character: after `text.split(' ')` each word becomes a span, and the `line` uses `gap:0.32em`
  to hold the word spacing (not spaces) — per-character entrance is too fragmented, word level gives the feel of being "spoken"
- Demo layout: paper look (warm white paper + ink + vermilion), a magazine masthead (video-shotcraft wordmark) / footer hairline frame it into a page, a vermilion all-caps eyebrow →
  170px serif main title (lead word in italic vermilion) → 46px sans-serif subtitle, left-aligned on a 168px grid; in the background a 5% ink
  760px issue-number numeral drifts slowly in reverse for parallax; the text layer pushes in very slowly throughout, 1→1.03 (smooth), and the footer hairline draws from 72f to close the hold section

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Word-to-word stagger | main 4f / sub 2.4f | 3–4f is the sweet spot for "word by word"; <2f and the whole line enters together with no stagger, >8f and viewers start counting the words one by one |
| Per-word entrance window | main 22f (lead word 30f) / sub 20f, `EASE.out` | <10f reads as a hard pop; >30f and every word floats up slowly, dragging the whole sentence |
| y displacement | main 64px (≈0.38em) / sub 26px | Unequal amplitude between main and sub is the source of hierarchy; <0.15em the displacement is imperceptible, >0.6em the word flies in from off-screen and becomes a slide-in |
| blur channel | main `(1-p)·18`px / sub `(1-p)·9`px | This channel is the "professional feel"; delete it and it degrades into a plain fade-in with upward move; beyond ~12% of the font size the in-between frames smear into colour blocks |
| Main/sub stagger | main 10f–60f / sub 34f–80f | An overlap of ~26f reads as "one sentence"; push the subtitle start until after the title has settled and it reads as two beats |
| Font size and weight | 170px serif 400 vs 46px sans-serif 400 | Need a ratio above 2x for a main/sub relationship; with equal weight, distinguish by font family — a 600+ weight on the subtitle fights with the main title |
| Closing hold | sub finishes at 80f, tail of about 40f (only the very slow push-in and footer closing remain) | A rest of <8f and viewers cut away before they have finished reading |

## Known pitfalls
- The demo was tuned on placeholder copy — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **The placeholder copy is 5 words for the main (two lines) / 9 words for the sub, so when swapping in a project's copy keep the word count close**: total stagger length
  = `gap × word count`, double the word count and the start of the last word moves back by double, so the last word's entrance gets squeezed into the closing hold
  — beyond 8 words, compress the gap to 2–2.5f at the same time
- The three channels must share the same `p`: writing three separate easings (even with the same curve) produces
  the mismatch of "displacement has arrived but it is still blurry", and the softness disperses immediately
- Word-level splitting must be done by hand for Chinese copy: `split(' ')` on Chinese gives one whole block,
  so segment it semantically into 3–5 spans yourself, and do not degrade to per-character
- Each line is an absolutely positioned `flex` row (left-aligned on the 168px grid), with word spacing from `gap` rather than spaces;
  when changing copy, make sure the first line does not exceed ~1450px width (170px serif is about 17 characters), otherwise it hits the issue-number background on the right
- This is a **low-energy default card**: it has a different function from the scramble / roller in this category, and the same film can
  and should hold both (the lead uses the heavy technique, all other titles use this card)

## Reference implementation
demos/typography/blur-slide/
(BlurSlide.tsx)
