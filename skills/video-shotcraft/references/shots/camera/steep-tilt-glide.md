---
name: steep-tilt-glide
summary: With a fixed camera, an upright page stands sideways in 60° strong perspective (near at right, far at left), and the page itself slides along its own 3D lateral direction past the lens (the object moves, the camera does not), the slide carrying speed ghosting, text components hovering and sticking down, revealed from dark to bright
use_when: A showpiece tour of long pages / multi-block UIs (content sliding in turn past a fixed camera position); a dark-stage neon tonality; the "side-sweep" camera position complementing the surface-hugging camera card
duration: 4s (120f) single shot; the wider the page, the longer it can be stretched
energy: Medium-high (perspective showmanship + continuous motion, but the rhythm is even)
tags: ui-entrance
---

## Intent
Stand the page up as a slanted wall: the camera is pinned and does not move, 60° strong perspective puts the right edge in your face and lets the left edge
vanish at the vanishing point, and the page slides laterally along its own plane — the content sweeping past in turn like the carriages of a train.
The crux is **the object moves, the camera does not**: perspective/origin/rotY are constants throughout,
and the only quantity that moves is the page's local translateX — once the camera moves, the semantics turn into camera-move showmanship,
whereas the drama here is "the page showing itself off". The angle converged over three rounds to exactly 60°
(-45° "not right" → -53° "a bit bigger" → -60° chosen).

## Motion core
- Camera constants: perspective 1100, origin 30% 58%, rotateY(-60°)+
  rotateZ(-2°), transformOrigin left top, with not one number changing throughout
- Page: an ultra-wide panel (6200×2400 @ content coordinates), sliding along the local X axis +60→-4100,
  bezier(0.3,0.12,0.72,0.9) — a gentle start then near constant speed, with the slope in the tail section
  not returning to zero (not settling to a dead stop)
- Speed ghosting: the trailing layers = the local position re-projected at past moments (three layers at f-1.6/-3.2/-4.8, with decreasing weights),
  opacity ∝ slide speed (denser ghosting when fast)
- Hovering and sticking down: page elements are FloatWrap hovering 230–280px with a same-shape soft shadow, sticking down in a stagger
  along the progress of the slide (tour grammar)
- Reveal to bright: the starting panel is darkened to 0.7 and revealed to full brightness over ~1.4s; an additional gradient shadow on the left edge recedes with it

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Tilt angle | rotateY **-60°** (a value precisely set by the user) | -45° was rejected as "the angle is not right", -53° as "a bit bigger"; beyond -70° the content cannot be read clearly |
| Motion model | Camera fully constant, page moves itself | **The crux** — the camera-pans-sideways version was rejected: "the camera is fixed, the page itself moves along the lateral plane of its 3D space" |
| Slide curve | A bezier whose tail-section slope does not return to zero | A dead stop midway was caught (v4 rework); fully linear lacks the breath at the start |
| Ghosting | Opacity ∝ speed, three layers at f-1.6/-3.2/-4.8 | Constant ghosting reads as a double-image glitch |
| Page width | ≥3 screens of content | Too narrow and the slide is over in two seconds, unable to carry a shot |
| Hovering and sticking down | Staggered (tour grammar) + shadow following height | For the semantic precedent see the three-card family graze-face-tour/orbit-drop |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Angle precedent: the perspective angle is the identity of this card, and the recommended range for fine-tuning in real use is 55–65°; going outside this
  range amounts to a change of technique
- Division of labour with graze-face-tour: in that card the camera moves (roaming along the surface) and the page is still; in this card
  the camera is still and the page moves. Choose one of the two within the same section
- An ultra-wide page is costly to hand-draw; in real use a real long screenshot can stand in (the slide logic is unchanged)

## Reference implementation
demos/camera/steep-tilt-glide/
(SteepTiltGlide.tsx)
Original source: clickup-30.mp4
