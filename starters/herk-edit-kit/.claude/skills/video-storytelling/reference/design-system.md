# Design system (reference)

Reusable design system extracted from a prior worked example. Keep the STRUCTURE (one
locked token set, five colours with fixed meanings, luma-measured legibility);
retune the values per project, then lock them again before building.

---

# The locked system

Proven on section 1. Every remaining section inherits this exactly. Nothing here
is a suggestion; `scripts/qa-tokens.mjs` fails the build on violations.

## Tokens — the single most important rule

The craft review found the real machine signature: **18 stroke weights, 9 type
sizes, 7 arrowhead variants, 3 corner philosophies.** Values 0.2 apart are
invisible individually and fatal collectively — everything reads as *nearly* the
same weight, so the eye gets noise instead of hierarchy. The verdict was
*"every decision was made locally and correctly; no decision was made globally."*

| Token | Values | Role |
| --- | --- | --- |
| Stroke | **1.5 / 2.5 / 4 / 7** | hairline · connectors · node outlines · highlight, gauge arcs, human mark |
| Type | **22 / 30 / 42 / 60 / 84** | caption · label · node · statement · hero |
| Radius | **10 / 22 / 40** | all corners, always `superellipse(2)` |

No `rx=` attributes anywhere — ellipses are paths (`ell()`), corners are
superellipse paths (`sq()`). One `arrow()` at one size, heads terminating **at**
an edge, never inside it. One connector language: curves.

## Palette — five meanings, no decoration

| Token | Hex | Means, and only means |
| --- | --- | --- |
| Ground | navy | the canvas |
| Cool ink | `#BFC9DA` | structure, edges, quiet state |
| Blue signal | `#8FC0FF` | the active path, the system working |
| Warm | `#FFB454` / `#FFD98F` | **a human is involved.** Nothing else is ever warm |
| Off-white | `#E9ECF2` / `#CBD3E0` | type. **Never `#FFFFFF`** (halation on dark) |

Zero purple. Zero cyan. Zero gradient text. The warm axis carries its own
`radialGradient` light pool that spills onto adjacent geometry — this was judged
the single most designed thing in the piece. Preserve the spill.

## Material

- Shadow **stack**, never one blur: contact (`dy2/sd2`) + key (`dy12/sd11`) +
  ambient (`dy30/sd26`). HTML chrome uses the 6-layer `box-shadow` with inset rim
  light *and* inset bottom-dark.
- Directional edge light `gEdge`: white `.97 → .84 → .70` top-to-bottom. Top edge
  is visibly brighter than the bottom.
- `corner-shape: superellipse(2)` (verified working in this renderer).
- The **video card obeys the same system** — superellipse corners, shadow stack,
  edge light. Three different edge philosophies in one frame was a named defect.

## Legibility — measured, not eyeballed

Hierarchy comes from the RATIO between active and quiet, never from making
everything dark. The first prototype's brightest pixel was 101/255 and it was
unreadable at 960x540.

| State | Target luma |
| --- | --- |
| Active stroke + label | 200-235 |
| Context (drawn, still relevant) | 120-150 |
| Spent (said its piece) | 85-105 |
| Any label, any state | never below 90 |

**Judging legibility is manual.** Read a 960x540 downscale. Absolute pixel-share
thresholds measure text volume, not legibility — see `qa-legibility.mjs`.

## Motion

- Entrances `cubic-bezier(0.16,1,0.3,1)`; exits faster than entrances.
- The wipe curve is measured and approved — reuse it, do not retune.
- Vary duration with mass. A 290px node and a 40px label must not decelerate
  identically; that global preset was a named defect.
- **`back.out` exactly once per section**, on the beat that deserves it.
- **No cross-fade, ever.** Full-bleed layers enter and exit by clip on an
  already-opaque background. At any instant a pixel is either graphic or footage.
- Camera and wipe are **sequenced, never concurrent** — camera first, then wipe.
  Running them together guillotines content (LEAD and CRM were cut off; "ENRICH"
  became "N").

## Layout rules

- **No label within 60px of the panel edge.** Nodes may bleed and read as "the
  map continues"; a word cut mid-glyph reads as a bug. A 44px feather cannot
  catch a blade travelling ~1800px/s, so solve it by placement, not masking.
- Every label carries a 4px halo so crossing geometry never touches type.
- Shared baselines for adjacent related elements.
- Nothing routed within ~40px of frame bottom (bleed risk).

## Content rules

- **If it doesn't get a word, it doesn't get drawn.** Every shape is a labelled
  node, an edge between labelled nodes, the travelling item, or ambient ground.
- **A prop retires to opacity 0 when its beat ends.** Muting to 0.3 leaves
  unexplained confetti on screen for the rest of the section.
  Generator rule: emit a `mute()` **before** any later-starting `lit()`, or the
  mute is overwritten when its tween completes.
- **An anti-pattern visual never overlays the recommendation.** Take the map to
  near-black first.
- ~20 words per section. No sentences. Labels are 1-2 words, under their node.
- The item's state is the story: rows fill, the score bar moves, the border
  changes colour. A viewer follows the section by watching one chip.

## Verification gates — all must pass

```bash
node scripts/qa-tokens.mjs                       # 0 off-system
node scripts/qa-no-crossfade.mjs                 # 0 violations
node scripts/qa-legibility.mjs renders/x.mp4     # no "NOTHING IS LIT"
node scripts/qa-exposure.mjs renders/x.mp4 assets/edit-master.mp4 plan/cover-seams.json
"../../node_modules/.bin/hyperframes" lint       # 0 errors 0 warnings
ffmpeg -hide_banner -i renders/x.mp4 -vf blackdetect=d=0.03:pix_th=0.06 -f null -   # 0
```
Plus: read a 960x540 downscale of every major beat. Gates do not replace looking.

## Section-1 result (the benchmark)

21 words · 1 scene cut in 84s · 4 stroke widths · 5 type sizes · 0 cross-fades ·
0 black frames · brightest 246 · mute-test comprehension 7/10 before the ornament
fixes, and the ornament was the stated cause.

## On-screen presence — measured, and the decision

ARCHITECTURE risk #4 warned the speaker could disappear. Measured with
`scripts/qa-presence.mjs` (validated: bare footage reads 100.0%):

| Section | Speaker on screen |
| --- | ---: |
| s01 lead | 51.3% |
| f02 process | 46.3% |
| s02 support | 43.9% |
| s04 documents | 42.0% |
| s05 onboarding | 37.7% |
| f01 hook | 37.5% |
| f03 specialist | 28.4% |

Aggregate ≈ **42%** — well above the 27-31% several sections self-reported, and a
normal ratio for a graphics-led explainer.

Longest continuous absences (master time):

| Window | Length | What is on screen |
| --- | ---: | --- |
| 307-341s | 34s | Zapier stat + "boring is beautiful" desaturation |
| 498-528s | 30s | the open loop closing on slot 04 + 30-vs-1 |
| 245-268s | 23s | voice stress-test |
| 418-439s | 21s | onboarding outcome |
| 437-458s | 21s | process discovery |

**Decision: accepted, not fixed.** Both 30s+ windows are payoff beats that need
full width — the loop closing on slot 04 is the video's structural climax and the
desaturation is section 4's whole argument. The brief's complaint was *confusion*,
not absence, and face time does not buy clarity. Adding panel windows inside
those beats would also risk exposing the editorial seams they are covering.

If a future pass wants more presence, the cheap reclaims already scouted by the
builders are: s05 a ~3.5s panel window at 63.0-66.5 (proto), and f03 losing one
beat to footage. Do not take it out of the two payoff windows.
