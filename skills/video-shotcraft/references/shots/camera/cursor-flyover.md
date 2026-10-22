---
name: cursor-flyover
summary: After a whole-page overhead view, the camera flies in turn to four feature areas for zoom-in close-ups, an SVG cursor arriving a step ahead to point, each click leaving a ripple and triggering a UI response, and finally pulling back to the overhead view
use_when: A feature tour of a single-page product: one shot takes the audience through all four feature areas, the cursor acting as the "tour guide's finger"
duration: about 8.0s (240f@30fps; overhead 22f · four stops of 44f each (flight 20f + dwell 24f) · pull-back 24f · hold 18f)
energy: Medium (equal-pace cruising, with rhythm marked by click ripples)
---

## Intent
A shot-saving alternative to "four features, four edited segments": one continuous camera strings the four corners into a single tour route, and the cursor is the audience's attention proxy — wherever it goes and clicks, the audience looks. Spatial continuity also lets the positional relationships between the features be remembered along the way.

## Motion core
- The demo uses a porcelain bright stage (cool white + cobalt blue), with the video-shotcraft workbench overview (top-bar mark + wordmark) laid out at 1:1 native on a 2400×1500 world canvas: overhead s=0.66 to see the whole, close-up s=1.3 (world 32px text → screen 42px, readable)
- The camera is a look-up-table stepper: CAMS[0] overhead → the centres of four modules (upper left Frames rendered → upper right Shot previews → lower right Release flags → lower left Top shots), with the `x/y/s` channels interpolated on an asymmetric in-out (bezier 0.55,0,0.18,1: a crisp start, a very soft landing); mid-flight between stops s additionally pulls out ~8% and pushes back in (hop), with directional motion blur added by on-screen speed (SpeedBlur amount 0.09, capped at 8px)
- Transform formula `translate(960 − x·s, 540 − y·s) scale(s)` — x/y is the "camera aim point" (world px), and changing the table changes the tour route
- **The cursor is the hand, the camera is the eye**: the cursor goes first (swift 16f, a light arc perpendicular to the displacement, with arc amount 0 at start and end), and the camera starts 2f later and settles in 20f; the cursor "aims" at the target for a beat and then presses (clickAt = start +22f), pressing down to 0.84 over 3f and then rebounding with overshoot; the cursor is drawn in screen space and is constantly 40px on screen
- Each of the four landing points is aimed at a real control, and a click produces a UI response: segmented control 30D→90D (slider slides + large number's old value slides up, new value rises from below + 12 bars spring to new heights in a stagger) / data-point tooltip pops out with overshoot + guide line drops down / switch spring-slides + a grey progress bar 0→25% / table row tinted + accent bar + checkmark line draw-on
- Each click triggers an 80px ring ripple (18f, scale 0.3→1.5 fading out)
- After the 4th stop the camera pulls back smooth over 24f to the overhead view, with all four states in the same frame (the "tour over" group photo), and a very slow 1% push-in in the tail section

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Close-up magnification | s=1.3 (overhead 0.66) | Native layout in world space, with the magnification back-derived from "the text to be read must be ≥40px screen text height"; above 1.6 modules leave the frame |
| Stepping rhythm | Flight 20f / dwell 24f | The dwell is for reading the feature spot; shorter than 15f becomes a "sweep past" with no "visit" |
| Cursor lead | Starts 2f early, arrives 6f early | 0 = the cursor is dragged along by the camera (like a screen recording); >10f and the audience looks at the cursor first and then looks for the picture |
| Click ripple | 18f, scale 0.3→1.5 | The ripple is a metronome, with the four clicks equally spaced (every 44f) — pair with four SFX clicks in a row |
| Tour order | Upper left → upper right → lower right → lower left | Changing the CAMS / TARGETS tables changes the route; keep adjacent modules visited adjacently, as diagonal jumps cause dizziness |
| Closing pull-back | smooth 24f back to overhead | Without pulling back it stops at the last module; pulling back puts the four states in one frame as a poster |

## Known pitfalls
- When using a real product screenshot, the TARGETS landing points must be re-marked at the centres of the controls in the screenshot; the screenshot must be at native resolution of ≥1.3× the close-up magnification (Q2)
- The x/y in the camera table are world px coordinates, and if the world canvas aspect ratio changes (e.g. switching to portrait) the whole table must be re-marked
- The cursor and camera are already decoupled (a table each), but the difference between their start/arrival frames must be changed as a pair, otherwise the camera is still moving at the click and the UI response is eaten by the motion blur
- Do not give too much motion blur: with a bright-stage UI still moving fast at the end of the hop, an amount >0.12 reads as "out of focus" rather than "motion"

## Reference implementation
demos/camera/cursor-flyover/
(CursorFlyover.tsx)
