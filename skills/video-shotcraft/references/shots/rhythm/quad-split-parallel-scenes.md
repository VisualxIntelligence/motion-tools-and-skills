---
name: quad-split-parallel-scenes
summary: The picture hard-cuts to a 2×2 four-way grid, with the four quadrants running their own micro-scenes in parallel (typing, a sudden push-in, word by word, an interaction chain), the key beats offset by 3–6 frames to create an information bombardment
use_when: A montage beat for rhythm sections where "there are many features, all happening at once"; the density peak in the middle of a trailer
duration: 90f (3s@30fps: 0–62f parallel bombardment + 28f final-state hold, no transition throughout)
energy: High (four parallel lines + staggered-beat impacts, the standard BGM chorus slot)
---

## Intent
Replace sequential display with parallel density: four things happen before the eyes at the same time, the audience has no time to read each in detail, but every 3–6 frames one quadrant "moves" — the scanning rhythm is firmly pinned down. This is a technique card: the contents of the cells are all replaceable, and the staggered-beat choreography is the recipe.

## Motion core
- Four independent quadrant scenes (the content is an example: four scenes happening at the same time when video-shotcraft produces a promo film): TL browser tabs pop in one after another with overshoot + the address bar typed letter by letter + at 44f the page loads and its large title slides in from below + an inQuad slow push-in 1→1.1 throughout; TR terminal command typing + two lines of output + at the moment the last line appears a whip sudden push 1→1.85 (sin envelope blur 5px, old lines receding to 8%); BL three 132px large words drop in one by one slamming in with overshoot; BR an approval card slides in → the cursor flies on a Bezier to Approve and clicks → the button changes to Approved → a second leg flies to Publish and clicks → a go-live notification pops up and counts
- **The staggered beats are the soul**: TL tabs 6/11/16/21, page 44; TR output 27/33, sudden push 37; BL words 14/30/49; BR click 25, colour change 27, click 52, notification 56 — any two adjacent heavy events are ≥3 frames apart, so something is always moving but never all moving together
- The two typing-cursor blink cycles are offset (16 frames vs 14 frames +5 phase) to avoid blinking together
- The four cells alternate in a lightness checkerboard (ember: cream #f7eee4 / warm black #160d09 / solid orange / latte #e9d7c4), with 8px warm-black gutters + 20px rounded-corner cells; text inside the cells is reflowed for 1080p (secondary ≥32px, main word 132px)
- After 62f all four cells rest in their final states (Launch film. / promo.mp4 ready / Prompt. Render. Ship. / Live · 3,214 views), assembling into one complete poster that holds for 28f

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Stagger interval | Adjacent heavy events 3–6 frames | <2 frames reads as the same beat (moving together = stiff); >8 frames and the density scatters, the bombardment feel vanishing |
| TL slow push | inQuad 1→1.1, origin 50% 90% | A "background-noise motion" of slow acceleration throughout, so that even still cells are not still; too large and the window hits the corner mark |
| TR sudden push | 37–47f, scale 1.85 + blur peak 5px, old lines fading to 8% | This is the heaviest beat of the whole card, pressed against a BGM accent; the blur envelope must be sin (symmetric in and out) |
| Typing speed | TL 20 characters / 0–40f, TR 19 characters / 0–24f | When changing copy keep the character count close, otherwise the staggered-beat relationship of the typing rhythm with the other quadrants drifts |
| BR interaction chain | Slide-in 4 → tour 14 → click 25 → colour change 27 → second tour 38 → click 52 → notification 56 | Each link depends on the last; changing any step requires deferring all that follow; the notification's overshoot pop is the accent at the end of the chain |
| Base colour | Light / dark / accent / light checkerboard alternating | When changing to the project's theme colour keep the lightness difference between adjacent cells ≥15%, otherwise the grid-line feel vanishes |
| Ending | 28f final-state hold after 62f | After a parallel bombardment you must give a beat for the four cells to be read together |

## Known pitfalls
- This is a technique card: the content of the four cells can be swapped as a whole (product screenshots / screen recordings / other motion cards), but **the staggered-beat table must be re-arranged** — the keyframes of the new content inherit the original time schedule, otherwise the four cells become four independent videos in a collage
- The bombardment section of ~2.1s is the density upper limit, and lengthening it requires giving each quadrant a second round of events, otherwise the second half "has nothing moving"; the closing hold is counted separately
- Cursor blinking is computed by frame number (cycles 16f / 14f+5), and after changing the time schedule the out-of-phase relationship of the two cursors must be re-checked
- All four cells typing / popping in at the same time is the most common degraded way of writing it — how to check: go through it frame by frame, and no frame should have two quadrants with a "heavy event" at the same time

## Reference implementation
demos/rhythm/quad-split-parallel-scenes/
(QuadSplitParallelScenes.tsx)
