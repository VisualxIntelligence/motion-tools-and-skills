---
name: promo-energy-arc
summary: Whole-film energy skeleton — low-key brand opening → single-hero biography → feature climb with title-card breathing intervals → launch-event peak finale
use_when: The default whole-film structure for a 30–60s multi-feature web product promo film (fill in the skeleton first at the storyboard stage, then pick cards)
segments: 4 segment slots + 2–4 breathing title cards
---

## Intent

Synthesise the rhythm rules scattered across R1–R3/Q5/Q8/P4 into a whole-film curve that can be filled in directly.
The template film's finished film (1085f) and two independent reproductions (900f each) all converged on the same
skeleton when tabulated — it is a default, not a directive: individual projects may deviate deliberately, and the deviation is written into the project spec.

## Segment table

| Segment slot | Share of duration | Energy | Role | Candidate recipe cards |
|--------------|-------------------|--------|------|------------------------|
| ① Brand opening | 8–12% (30s film); opening + biography together up to 20% (template film) | Low | Wordmark stamp + hold ≥1s (R1), handing off to the product page | brand-ink-open |
| ② Single-hero biography | 12–15% | Medium (highest finish, slowest rhythm) | One hero, one complete action arc ≥3s (Q5/R3), establishing the product's atomic unit | spotlight-hero-card (+ the aesthetic-rules.md Q2 high-definition rasterize technique) |
| ③ Feature climb | 55–65% | Medium-high ⇄ low, alternating | Each shot is tied to one distinct feature, and one technique is the hero only once (P4); breathing title cards are inserted between shots as needed | deck-deal-flyin / type-and-filter / list-stack-press / row-embed / document-typewriter-reveal |
| ④ Launch-event finale | 13–16% | Peak (highest in the whole film) | Each feature already shown contributes a representative element, in a group photo surrounding the wordmark (Q8), sign-off hold ≥1s (R1) | outro-group-photo-launch |

Breathing title card (paper-title-card) rules: insert one after every 1–2 feature shots, each 50–55f (≈1.8s), 2–4 in the whole film;
before an important feature appears, use it as a lead-in title card (C2).
In the template film's 10 shots title cards take 4 seats, and in the two reproductions 2 seats each — set the density by the number of feature shots.

## Fill-in procedure (replacing ad-hoc derivation)

1. List the product feature inventory (P4) and count the number of feature shots, N.
2. Allocate the total frames by the segment table: first deduct the budgets for ①②④ and the title cards, and divide the remainder equally among ③.
   Within each shot's budget **first set aside the hold/rest frames** (R1 settle ≥30f, batch ending 15f, R3),
   and only then arrange the motion — not arrange the motion first and then look for gaps.
3. Alternate energy within segment ③: interleave high-energy shots (dealing / stacking) with steady-rhythm shots (interaction / reading text),
   and put the most information-dense shot (document / report type) before the peak finale —
   the template film and both reproductions all placed the document / report-type shot 2nd–3rd from the end.
4. Scan the shots/ frontmatter slot by slot to pick cards, and read the full text of the chosen cards.
5. Once the shots are set, choose the transition style at each seam (the three-style selection of the shot-transitions technique card),
   and write it into the "key motion" column of the storyboard table — transition frames are taken from the budgets of the adjacent shots.

## Known pitfalls

- Applying the skeleton globally as a style directive: the segment shares are single-instance empirical evidence from the template film (marked: single-instance precedent);
  a 15s short film or a single-feature product should merge segments boldly, but the ① hold / ④ peak at both ends cannot be omitted.
- Stacking only high-energy shots in ③: consecutive high energy reads as noisy, and alternation and title cards are themselves the rhythm.
- Writing a breathing title card as a second pass of the tagline: if a title card duplicates the outro copy, delete it (P4 precedent:
  outro tagline de-duplication).

## Reference implementation

The segment table AIFL_SHOTS in template/src/aifl/Main.tsx (sum=1085f).
