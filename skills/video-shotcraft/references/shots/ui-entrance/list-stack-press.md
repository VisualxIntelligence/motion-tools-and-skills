---
name: list-stack-press
summary: List cards fly up from the bottom of the frame one by one and pile up; each landing presses and bounces the whole pile, and the counter jumps one notch in sync
use_when: Feed / radar / inbox shots about "something new every day"; asset lists that emphasise continuous accumulation
duration: about 3s (18-88f)
energy: Medium
---

## Intent
"A pile has weight": as each new card lands, the whole pile of already-settled cards is pressed down and bounces back - viewers read from the physical feedback that "this is something really accumulated". The counter jumping a notch in sync nails down the sense of quantity.

## Motion core
- **Anticipation beat (anticipation, borrowing Disney principle 2)**: give one segment-level beat of anticipation before the first card rises in - the counter lights up 4-6f before the first card and resets to zero / shrinks slightly scale(0.96)→1, leading the eye to the stacking area, and only then does the first card enter the frame. Done once at segment level, not added per card
- Cards rise in from below the frame, alternating in slight tilt and levelling out, piling up one by one at an even beat
- Each arrival presses the whole pile down 6px, bouncing back in 8f (the stackPress pulse - i.e. Principle 5's follow-through: the new card's kinetic energy is passed to the whole pile and then cushioned and dissipated, and this one stroke is the source of "having weight")
- After landing, finish in drag-hierarchy order (Principle 5): the card body stops first → the whole pile bounces back → the highlight bar then grows out (lagging 2-4f) - all three on the same frame reads as a texture swap
- At the close a glaze sweep of light passes across the whole pile
- The screen-space DigitRoll counter rolls one notch for each card landed; the camera follows the pile downward

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Beat | CUES=[18,30,42,54,66] (12f evenly spaced), each card flies for 22f, bezier(0.45,0.05,0.25,1.12) with overshoot at the end | A small number of cards (5) can be evenly spaced; only large-batch entrances need progressive acceleration (compare deck-deal's R2) |
| Entrance | Rises in from 600px below, alternating ±2° tilt levelling out, scale 1.06→1 | Alternating tilt breaks symmetry; same-direction tilt reads as copy-paste |
| Stack press feel | When the next card arrives the whole pile presses down 6px, bouncing back in 8f (pulse [cue,cue+4,cue+8]→[0,6,0]) | This is the key stroke of "having weight"; cut it and the stack turns into simple typesetting |
| Shadow | Two layers of softShadow vary with height off the ground: in the air elevation≈56, settled 3 (hugging the ground more when pressed); the flight segment adds vertical motion blur by speed | The shadow converges with height, the same language as deck-deal/spotlight |
| Linked highlight | After landing, with a 2-4f lag, on the project name's line (measured on the screenshot at y156-176 inside the card) an accent-colour (amber in the template film) highlighter-pen base the same width as the project name grows out, multiplied under the text (7f growth + 5f fade); the last card is only ~12f from the cut point, compressed to 5f growth + 4f fade | The highlight is a secondary action (Principles 5/8): it follows after the main action (landing press-bounce) and does not compete for the scene on the same frame; the beat of the final element must be compressed to the remaining frame budget, not copied from the earlier ones |
| glaze sweep of light | 360px wide, rotate 14°, mixBlendMode soft-light, after the last card settles frames 74→87 sweeping from −500 to 2300, clipped inside each card's rounded corners | The sweep happens only once in the whole shot, sweeping the whole pile not card by card (Q4) |
| Counter (digit-roll technique) | Continuous odometer position pos: each card landing moves pos +1 notch along the digit strip, a single notch rolls to rest in 8f, bezier(0.25,0.8,0.25,1); roll amount = pos·lineH rolling continuously down a doubled 0-9 strip | A counter out of sync with the landing breaks the illusion immediately; **a single-notch roll must be shorter than the card spacing (12f) and the last notch must settle before the shot ends** - the approach of remounting and re-rolling keyed by count has to roll 22f from 0 every time, and at a 12f beat the previous one can never finish and the last frame stops at 4 (PR #40 precedent); the digit strip is two copies spliced + overflow hidden + tabular-nums (without tabular it shakes horizontally) |
| Camera | zoom 1.35→0.86 as one continuous curve following the pile downward (fed frame by frame to PageCam2D, avoiding velocity dropping to zero at segmented keyframes) | Head-on camera position (see Known pitfalls), and the camera only follows vertically |

## Sound
Do not score a long sound for each landing; pin the count settle to click-camera (the template film pins it at f648) and the segment cut-in to transition-soft (f623). If scoring a pop per card, follow S2's three tricks to avoid a machine-gun feel.

## Known pitfalls
- Stack/list information shots must be head-on (Q6) - when the whole film was tilted, this shot was individually rolled back to head-on; stylised camera positions are verified shot by shot, not applied globally
- A per-card glint highlight sweep was rejected twice (Q4); a static accent-colour base bar is enough for the highlight, and the dynamics are left to the press-bounce
- This is the same action vocabulary as history-list-stack (the tail segment of the document-typewriter-reveal card) - the same technique is the protagonist only once per film (P4), and where both are used, one must be demoted to a supporting role
- The anticipation / drag-hierarchy parameters are borrowed from Disney's 12 principles (the distilled version built into the pixel2motion skill), not user precedents - they are default suggestions, not orders; when in conflict with a precedent, the precedent wins
- The anticipation amplitude must exceed the naked-eye threshold (deck-deal precedent 2026-07-09: a small amplitude was completely unnoticed by the user, and only enlarging 12 times passed) - after rendering, self-check "can you see the wind-up without going frame by frame"

## Reference implementation
demos/ui-entrance/list-stack-press/ListStackPress.tsx (originally template/src/aifl/live/ScenePapers.tsx)
