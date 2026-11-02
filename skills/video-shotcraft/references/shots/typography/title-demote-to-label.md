---
name: title-demote-to-label
summary: Two variants of a big title demoted to a section label — A: the big title is revealed centred and holds a beat, then continuously shrinks 0.3x and translates to the top-left corner to settle as a small section label, with the content area growing beneath it; B: the same routine but on entrance a text-selection highlight block sweeps in and is then withdrawn
use_when: Chapter openers (the title is the lead first and then gives way to the content); section handovers in tutorial / feature-demo films; variant B gives "text / editing" products an identity hint
duration: A ~3.7s (112f) / B ~4.5s (134f); in the demo the two variants play in series for 246f
energy: Low-medium (a layout-transform type, an atmosphere shot)
tags: transition
---

## Intent
The usual fate of a chapter title is "appear → disappear → content enters", with the title and content not knowing each other.
This card makes the title **demote without leaving**: the big centred text holds a beat to announce the topic, then a single continuous
tween shrinks it to 0.3x and flies it to the top-left corner, where it settles as this section's column label — it is still on screen,
only changed from lead to door plate. The audience gets free spatial memory: that big word just now is
the small word at the top-left now, and this section is about it. The content skeleton begins growing while the demotion is still under way,
so the handover has zero gap.

## Motion core
- The demotion is a **single continuous tween**, 26f asymmetric in-out (bezier(0.6,0,0.18,1): a decisive start, a very soft landing):
  scale 1→0.22 (220px title → ≈48px label) + position (960,540)→(216,196) on the same curve — splitting into two segments (shrink first, then fly) reads as two actions
- transform-origin left-middle; the centring correction translate(-50%) is brought to zero in sync with the tween
  (`translate(${-(1-dem)*50}%, -50%)`) — if it does not return to zero the end point is off by half a width
- Entrance reveal: the title rises character by character from below a mask line (rise, 16f per character, 1.6f stagger), and the vermilion full stop pops out 10f later with overshoot;
  the mono eyebrow "CHAPTER 01" has its letter-spacing tighten from wide. After the reveal it must hold ≥18f before the demotion (demo 20f, with a 1.5% very slow push-in meanwhile) —
  shrink before it has held and the announcement beat is eaten. The eyebrow fades out over 6f with the takeoff, and before landing the label prefix "01 /" wipes in from the left to take over
- Content grows staggered (the demo is a video-shotcraft storyboard workbench page, with the two section titles taken from the brand short phrases "Frame.""Craft.":
  A = 60px lead-in + three cards (shot recipe card / user review / beat-hit rhythm); B = 58px storyboard script + an in-sentence selection → a connecting line → a side note matching a shot card): each block is revealed by a clip from the left (width 0.3→1, text not squashed) + moves up 30px fading in,
  staggered from dense to sparse; growth starts when the demotion is 12f in, with the title still flying and the content already growing — this overlap is the source of the "handover with no gap".
  The divider spanning the full width is drawn a few frames later, so it does not grow in the same frame on the title's flight path
- Variant B selection highlight: the left edge / width percentages are tweened separately — on sweep-in the width goes 0→100%
  (covering, 10f), on withdrawal the left edge goes 0→100% (making way from the left, 8f); the demotion starts only after the highlight is fully withdrawn
- The demotion flight adds directional motion blur by position-difference speed (0 when still); the variant B selection uses the accent colour at 20% transparency + an insertion cursor following the right edge
- When the two variants play in series there is no more white flash: they share one stage, A's content exits by moving up 12f ease-in → B's big title is revealed in place;
  before B's demotion A's label moves up one row, shrinks to 0.7 and turns grey as "the previous section", and B's label lands in the same slot (the way to keep multiple sections from stacking)
  (the demo exports `TITLE_DEMOTE_TO_LABEL_DURATION` = 246f, look = paper)

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Demotion tween | 26f asymmetric in-out, scale→0.22 (settling at ≈48px) | <14f reads as the title being flicked away; an end point >0.45 makes the label too big and it crowds the content; a label <40px is unreadable |
| Hold beat | ≥18f at rest after the reveal | Skip this beat and the audience has not finished reading the title before it runs off, so the demotion is wasted |
| Content stagger | dense to sparse, blocks 18–22f, width 0.3→1 | Everything growing at the same duration reads as a page refresh rather than "growth" |
| Growth start | +12f after the demotion begins | Waiting until the title has fully landed leaves 8f of cold dead air |
| Selection highlight | sweep-in 10f / hold 10f / withdraw 8f, accent colour 20% transparency | A highlight hold <5f reads as a flicker bug; demoting without withdrawing it cleanly leaves the colour block flying along, which is very dirty |
| Two-section handover | old content exits by moving up 12f; old label moves up one row over 16f and turns grey | If the old label does not make way, the new label lands on top of it = a label graveyard |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Division of labour with the scene-locking technique "title pinned into 3D space and perspective-deformed with the camera" (retired)
  (a spatial type), this card is the continuous demotion of a 2D layout hierarchy (a layout type) — for "title lives inside the
  product space" use that card, for "title becomes a column name" use this card, and choose one per film
- No other element is allowed to move on the demotion path — the title flight is the sole focal point of the whole screen, and the skeleton growing
  below its landing point does not steal from it (start times staggered), but popups / cursors entering in the same frame will surely steal
- When used across multiple sections (one demotion per section) the top-left label must **wrap to a new row rather than stack**: the new label lands
  as the old label moves up to make way, otherwise from the second section on the top-left becomes a label graveyard
- Variant B's selection highlight is a product hint that "the text can be selected"; for products that are not editors / documents
  it is semantically empty, so do not add it just because it looks good
- The title copy should be ≤3 words — after demotion to 0.3x it still has to serve as a readable label, and a long sentence shrunk is just a grey line

## Reference implementation
demos/typography/title-demote-to-label/
(TitleDemoteToLabel.tsx)
Original source: perplexity-promo 16–18.5s; variant B derives from framer text-selection-title
