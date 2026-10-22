---
name: outro-group-photo-launch
summary: Elements from the whole film fly in from all sides to pose around the wordmark for a group photo, with a crane landing camera position + stage light + gold dust making a launch-event close
use_when: Outro / brand closing; a "family portrait" style final shot for a multi-feature product
duration: about 4.8s (145f)
energy: Peak (the highest point of the whole film)
---

## Intent
Pick one representative element from each feature shown and call them back for a group photo, with the wordmark making its grand-finale entrance — what the audience remembers last before leaving is "these things belong to the same product". The specification must be launch-event grade: push the energy to the highest point of the film.

## Motion core
- 9 page elements (nav / cards / content strips / search box / stat strip / document header) fly in from the four sides with rotation, the flight segment getting directional motion blur by speed, and landing pressed solid (contact shadow tightens + 1.5% light press, no individual glowing, Q4)
- The wordmark (demo: video-shotcraft logo + wordmark, with the brand short phrase as the eyebrow) enters letterpress character by character, with everyone "stepping back to the rear row" to give way to the lead; the rule grows and extension lines shoot out
- Crane camera move: the whole group-photo layer rotateX 4°→0 + scale lands down, then pushes in slowly
- A launch-event atmosphere trio: an opening light band sweeping past, stage light behind the wordmark, gold dust drifting upward
- Background pages blur into depth of field

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Element fly-in | 9 elements with cue starting at 4 and one every 3f, each flying 12f; start offset ±360–500px; render order = cue order, later arrivals stacking on top | Every feature already shown needs a representative element (Q8 self-check item), and the audience will notice whoever is missing |
| Fly-in easing | bezier(0.34,1.4,0.44,1) | The lesson named in the code comment: the old bezier(0.25,0.9,0.3,1) "never crossed 1" and had no true overshoot — for the landing to bounce, y1 must be >1 |
| Flight attitude | in flight rot×2→settled rot (within ±5°), scale ×1.12→1; directional motion blur by screen speed (0.3×px/frame, capped at 22); landing cue+9→16f contact shadow tightens + 1.5% light press | The settled angle is kept within ±5° — the group photo should be tidy but not stiff |
| Stepping back to the rear row | when the wordmark enters, over 42–50f everyone opacity −12%, saturate −8% | When the lead enters the supporting cast must give way, and without giving way the wordmark cannot hold down 9 elements |
| Crane camera move | `perspective(1400px) rotateX(4°→0) scale(1.06→1)` landing over the first 40f, then a slow push-in of +0.035 (from 36f in-out with a zero-speed start, joining the crane without an abrupt change) | The crane amplitude is just this small (4°) and already enough for the "camera landing" read, and larger would be dizzying (speculation) |
| Atmosphere trio | light band 2–14f (600px wide overlay, peak opacity 0.12); stage light 42→50→58f 0→0.5→0.25; gold dust 20 specks 2.4–4.2px with a warm halo, opacity 0.35–0.7 flickering slightly + 6 foreground defocused light spots, all parameters deterministically derived from the index | Particle / light-effect parameters must be deterministically derived (hard rule: renders must be reproducible); beyond 30 gold dust specks it starts to look like snow (speculation) |
| Wordmark | in the demo the video-shotcraft logo + all-lowercase wordmark (brand typeface 118px): the logo presses first at 38f, letters delay=42+i·1.8, 8f, the same letterpress set; the rule grows over 58→70f, 190px extension lines at both ends shoot out over 8f and fade away over 6f; letter-spacing breathes over 62–66f; background pages blur 0→14 within 24f; after settling a sign-off hold of 30f | The wordmark's settled hold fills a full second (R1 final ruling); the outro adds no narration caption to keep it clean (a C1 exception) |

## Sound
A fixed three-beat sentence pattern: riser-cine laid in to the assembly (pinned at f945 in the template film) → impact-deep-whoosh pinned on the wordmark stamp (f980, vol 0.55, the peak of the whole film) → sparkle on the rule (f1005). This is the only passage sentence pattern that was never changed after the template film was finalised (S2; see sound-design 4.3 for details).

## Known pitfalls
- The first-draft ending is almost always too conservative (Q8: a quiet signature-style → group photo → launch event, three levels of escalation) — from the first draft give the crane / stage light / particles in full to the specification of "like a product launch"
- Structure before effects: first have the "flying in from four sides for a group photo" structure and then add atmosphere; piling on effects directly has no skeleton
- The outro tagline and the copy beneath the wordmark must be checked for duplication (P4 dedupe precedent), and the same sentence appears only once in the whole film

## Reference implementation
demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx (originally template/src/aifl/live/SceneOutroLive.tsx; for the 30f sign-off hold duration see the timeline in template/src/aifl/Main.tsx)
