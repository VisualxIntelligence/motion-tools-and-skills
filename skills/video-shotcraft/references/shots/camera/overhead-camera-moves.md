---
name: overhead-camera-moves
summary: Two overhead-shot reveals — tilt-reveal (the tilt straightens up to reveal) and overhead-tabletop-drop (a tabletop card array slides sideways then dives suddenly in)
use_when: Openings/transitions that tell their story through the "pitch angle": use A for a single-page establishing shot, and B for touring multiple pages and picking one to dive into
duration: A 120f (4s) / B 140f (4.7s)
energy: A medium / B medium-high
tags: opening, transition
---

## Intent
The library's overhead viewpoint has always been a gap — crane-rise is a rise of "translation + scaling" (the pitch
angle does not move), and space-camera pattern C drone-dive is a dive-and-landing in one continuous shot; these two patterns let
**the pitch angle itself tell the story**: A is a reveal — the whole page lies flat via rotateX, and the opening shows only a glowing perspective narrow band along the far upper edge
(like the first light on the skyline), the camera "looks up" and rights itself, and the content floods into view row by row,
like lifting a drawing on a desk; B is a choice — three page cards lie flat as a tabletop card array, and the camera, shooting overhead, slides sideways
past them in turn (Wes Anderson tabletop), then at the target page dives suddenly in and straightens up into a full screen,
"looked around the whole lot, and this is the one". Choosing: use A for a single-page opening, B for a multi-page transition/opening.

## Variant selection
| Pattern | Approach | Use when |
|----|------|----|
| A tilt-reveal | The whole page lies face up, hinged on its lower edge at rotateX 86°, and straightens over 40f (overshoot to −2.2° then a soft return), with angle/scale/hinge position/perspective/eye height sharing one progress | Opening establishing shot; a single subject |
| B overhead-tabletop-drop | The card array lies flat at rotateX 62°, the pan section changes only translateX in a sideways slide past, and the drop section runs angle/scale/displacement on three channels together to dive in to the end card | Touring multiple pages then picking one; works as both a transition and an opening |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A pitch angle | rotateX 86° (f0–20 a very slow creep to 83°) → −2.2° (f60, speed zero) → 0° (f70), main section EASE.swift asymmetric in-out, overshoot return smooth, transformOrigin 50% 100% (lower-edge hinge) | The first version's −55° was too weak: half the page is still visible at f0, with no "narrow band" suspense (real-render precedent); an eye point below the page plane sees the back face (the text in the narrow band is upside down, real-render precedent) — the eye point must be above the page; using out-cubic for each segment creates a sudden speed change at the seams |
| A linkage | perspective 700→1500, eye-point y from 300px above the hinge → frame centre; scale 2.5→0.84 (leaving a margin on settling so the stage is visible), hinge y 600→935; the background light pool and floating dust move down 150px in reverse parallax | If perspective is not linked, the initial pitch angle cannot show "only a strip"; without background parallax it reads as the page turning, not the camera looking up |
| A ending | Camera position settles at f70; at 38–82 the area-chart polyline is drawn on, at 80f the end-point light dot comes on; at 70–120 a very slow push-in 1→1.018 | Overshoot amplitude ≤3°, any larger reads as a spring rather than a camera position; 69f of pure stillness is too long (> 1s dead frame), and the hold section needs a very slow push-in |
| B pan section | 0–50f changes only translateX +760→−360 (smooth) with the angle fixed; 50–58 stops for 8f to settle on the choice (the target sheet lifts 16px off the desk, its top light comes on, the other two lights dim to 35%) | Moving the angle during the pan = the two sections' responsibilities blur (precedent: pan surveys, drop commits); without the beat of settling on the choice, the dive reads as random |
| B drop section | 58–86f three channels running together: rotateX 62→−1.6→0.5→0 (an asymmetric curve starting from zero speed + smooth return overshoot), scale 1→2.04→2.0 (the start carries ~5% preparatory retraction), translateX −360→0 | The three channels must run together; running in sequence reads as two actions; jumping off with out-cubic after the pan stops is a sudden speed change |
| B card array | Cards 996×560 (exact 16:9), end-card scale 2.0 exactly fills the screen frontally; transform order translateX→rotateX→scale | With the wrong order the pan brings out an arc trajectory |
| B floor | Deep graphite tabletop + hairline grid + one top-light pool/volumetric beam per sheet + printed labels under the sheets (01 SHOTS…) | Without floor reference the sideways slide section cannot be read as "the camera moving"; the contrast of white sheets on a dark desk is the layering |
| B ending | Camera position settles at f94; at 98–118 a gold shot block inside the page slides into an empty storyboard slot (one overshoot); at 94–140 a very slow push-in 1→1.012 | 47f of complete stillness after the end card is rather dead; give the page a small action to close |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Under large-angle perspective the cards must be backstopped with backfaceVisibility hidden + translateZ(4px),
  otherwise back faces/depth break the illusion on individual frames
- Choose one of A and crane-rise-reveal in the same film — both are opening reveals, and two "reveal openings"
  amount to no reveal
- The locked angle during B's pan section is the crux (the two-section division-of-responsibility precedent): surveying is surveying, diving is
  diving, and if they move mixed together the audience does not know what the camera wants to do
- Both patterns are "big camera moves" and are mutually exclusive in the same on-screen section as space-camera/crane-rise,
  as one section can have only one camera operator

## Reference implementation
demos/camera/overhead-camera-moves/
(OverheadTabletopDrop.tsx / TiltReveal.tsx)
