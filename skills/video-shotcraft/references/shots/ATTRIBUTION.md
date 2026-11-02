# Shot card sources and licensing notes (48 cards added in 2026-08; 38 remain after the 2026-10 trim)

The motion techniques in this batch of shot cards were researched from publicly released product promo films and open-source project homepages.
**All implementations are re-implemented from scratch**: the repository contains no
footage, screenshots, art assets or brand elements from the original films; the copy, colour schemes and UI content in the implementations are all
neutral placeholder templates. The original authors did not take part in this project, and the sources noted on the cards are only for homage and research provenance
("reference only, re-implemented").

## Legal boundaries (important)

- Abstract motion **methods / techniques** (timing structure, easing approach, choreography logic) generally fall within the realm of
  methods and ideas; but **concrete expression** (the original film's picture, art, copy, brand elements,
  and recognisable overall audiovisual presentation) is protected by copyright, trademark and other rights. This project studies only the former,
  and avoids copying the latter by rewriting everything, removing brands and using placeholders.
- A source work being "publicly released" does **not** amount to a licence to replicate or derive from it. This table records research
  provenance, not proof of authorisation; for sources without explicit permission, what we rely on is the practice of "technique reference +
  independent rewrite, no original material", and not any authorisation from the rights holder.
- If any rights holder believes a card's implementation still amounts to copying their concrete expression, please open an issue,
  and we will promptly adjust or remove the corresponding content and attribution.

## Source list

Note: the table below records sources by **research batch** (one batch corresponds to one reference film or one reference site,
covering the several cards derived from that batch); the card files themselves carry no source attribution, and per-card attribution is in the appendix
"Per-card source mapping" at the end.

| Research batch | Source | Type | Status |
|---|---|---|---|
| anime.js | https://animejs.com/ official-site demos (GitHub: juliangarnier/anime) | Open-source project homepage (an MIT project; copyright in the art presentation of the official-site demos belongs to the author) | Technique reference, re-implemented; its code and art not used |
| remotion-bits.dev | https://remotion-bits.dev/ | Open-source example collection | Technique reference, re-implemented; its code not used |
| x.com/amirdzm | Two motion works publicly released on X (about 13s "Storyboard → Result" etc.) | Personal works (publicly released, no permission to replicate granted) | Technique reference, re-implemented; no original material |
| x.com/1amanly | Motion works publicly released on X | Same as above | Same as above |
| x.com/Jerrythe2d | A motion work publicly released on X (about 84s) | Same as above | Same as above |
| x.com/bohdanmotion | A motion work publicly released on X (about 26s) | Same as above | Same as above |
| x.com/thiswillblossom | A SaaS concept ad publicly released on X (about 2.1s four-panel grid) | Same as above | Same as above |
| x.com/tvnxty | Firecrawl brand / product promo film (about 66s, publicly released) | Commercial promo film (publicly released, no permission to replicate granted) | Technique reference, re-implemented; no original material |
| x.com/aizal_mp4 (individual cards) | Willow Voice product promo film (a work by motion designer aizal, about 41s) | Commercial promo film (publicly released, no permission to replicate granted) | Technique reference, re-implemented; no original material |
| Douyin 观机社 (Guanjishe) (dy09) | An edit of a Honor AI concept film published by the Douyin account "Guanjishe" (about 22.6s) | A repost edit; underlying content is brand-oriented concept content (involving Honor brand elements) | Technique reference, re-implemented; brand wordmark replaced with a neutral placeholder word |
| Douyin 江经怜 (Jiang Jinglian) (dy08, individual cards) | A work publicly released by the Douyin account "Jiang Jinglian" (about 19.4s portrait) | Personal work (publicly released, no permission to replicate granted) | Technique reference, re-implemented; no original material |
| reference/brand-scan | Customised from a reference image provided by the user | Internal requirement | Original implementation |

> Known precision limitation: the X / Douyin sources were recorded at the time by account homepage, and the
> URLs of specific individual posts were not retained (the original films were kept locally only during the research period and not checked in). The table has tried
> to add the duration and content description of identifiable works; for item-by-item provenance you can search the corresponding account on this basis.

## Per-card source mapping

The correspondence between the 38 remaining cards and the research batches (from the research-period mapping record of original-film time segments):

| Source | Cards |
|---|---|
| anime.js official-site demos | `radial-wave`, `value-stagger-gradient` |
| remotion-bits.dev | `basic-3d-scene`, `blur-slide`, `card-stack`, `carousel-3d`, `cursor-flyover`, `flying-words`, `fracture`, `glitch-cycle`, `gradient-transition`, `list-reveal`, `mosaic-reframe`, `terminal-3d` |
| x.com/1amanly | `avatar-bracket-carousel`, `countdown-arc-scatter`, `pill-chip-slot-cycle-handled`, `radial-ripple-phone-chips` |
| x.com/Jerrythe2d | `bezier-source-converge-merge`, `chip-grid-single-select-blackout`, `doc-park-left-pill-deal`, `picker-carousel-feature-cycle`, `scan-bracket-sweep`, `vertical-word-roll-blur-cycle` |
| x.com/aizal_mp4 (Willow Voice) | `aurora-bloom-bg-flip`, `glass-pill-dictation-typing` |
| x.com/amirdzm (work a) | `brace-expand`, `grain-dissolve` |
| x.com/bohdanmotion | `outline-word-fill`, `word-relay-geometry` |
| x.com/thiswillblossom | `quad-split-parallel-scenes` |
| x.com/tvnxty (Firecrawl promo film) | `product-card-progressive-assemble`, `research-card-stack-scroll` |
| Douyin 观机社 (Guanjishe) | `logo-shrink-wordmark-lockup`, `white-flash-logo-simplify-cut` |
| Customised from user reference image (brand-scan) | `assemble-then-type-flyin`, `scanline-annotate-focus`, `scanline-assemble-flyin` |
