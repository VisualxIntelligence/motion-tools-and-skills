---
name: panel-grid-moves
summary: Panel rhythm — comic-panel-split: comic diagonal panels split out three camera angles of the same subject, and after the three panels click-click-click into a freeze, the last panel's diagonal edge swallows the screen into a poster
use_when: Treating "panels" as a rhythm device: several camera angles of the same subject frozen side by side, split out panel by panel on the beat; feeds on beat points
duration: 156f ≈5.2s (full-screen profile shot 20f + three-cut panel split freeze + swallowing the screen + poster hold)
energy: Medium-high
tags: ui-entrance
---

## Intent
The difference from wall-reveal-moves is this card's positioning anchor: that one is "how the whole wall enters"
(a one-off reveal), this one is "how panels act as a rhythm device" — the panel split happens on the beat, a panel change is a drumbeat.
A is a merge: the picture is split open by three diagonal seams going click-click-click, three camera angles of the same product freeze at the same time,
and after a beat the last panel's diagonal edge sweeps across and swallows the whole screen — the split-screen language of Scott Pilgrim.
Suited to a single product from multiple angles (demo: a prime lens engraved with video-shotcraft, three narration boxes numbered
"Shot 01 / 02 / 03", and after swallowing the screen it lands as the "Craft the shot." poster).

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A comic-panel-split | Full-screen 3/4 profile shot for 20f → three 12° diagonal seams, one every 4f, split out from the top down, with the corresponding panel hard-cut and popping in (5f scale 1.07→1 + white flash); the three panels = a full-body view / a partial close-up / a macro of the same subject; the 29f freeze is kept alive by the subject's own action; the last panel pulls back in reverse for 2f + a 14f screen sweep swallows the full screen into a poster | Several camera angles of the same subject side by side; sections with a comic feel |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A diagonal seam | SVG double line: ink edge + cream paper core (total width 18px), 12° slant, each cut drawn from the top down in 3f | The paper core of the diagonal seam is the crux of the comic feel; a straight seam reads as a split-screen tool |
| A keeping alive | During the freeze the subject moves itself: the focus ring turns 26°, the aperture blades close in, the full-body panel pushes in very slowly | If all three panels are still it reads as a screenshot collage; "the lens at work" has more content than a slow push-in |
| A narration box | Cream base + 4px ink outline + 7px hard drop shadow, stamping in with a −2° skew and a pop, living inside the panel and being covered along with the panel | The second anchor of the comic language; floating above the panels breaks the illusion |
| Ending | About 50f of poster hold after the last line of text finishes revealing (leaving only a very slow 1.5% push-in) | R1; the unmasking frame is aligned pixel by pixel with the swallow's end value to prevent a jump |

## Known pitfalls
- The demo was tuned on fictional content (a vector lens) — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- The three panels must be **different camera angles of the same subject** — stuffing different content into three panels reads as a bento
  layout rather than comic panels, and the semantics scatter
- Feeds on beat points and depends heavily on sound: three clicks panel by panel (sound-design §4.5); a panel split that does not hit the beats is just a layout animation
- Draw the subject as SVG vector (or use high-resolution footage): the three panel camera angles enlarge up to 2.45x,
  and a bitmap screenshot blurs when enlarged (Q2)
- Panel-split patterns in one film ≤1 section — the panel language is too recognisable, and two sections collide

## Reference implementation
demos/rhythm/panel-grid-moves/
(ComicPanelSplit.tsx)
