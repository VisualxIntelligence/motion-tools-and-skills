---
name: space-camera-moves
summary: Two 3D-spatialised camera moves — exploded-view (components blow apart along Z and then reassemble) and drone-dive-landing (a drone dive and landing)
use_when: Highlight sections that shoot a flat page as a 3D object; both patterns are "big moves", with a total of ≤2 uses per film
duration: A 170f (5.7s, the whole run of blow-apart – hover – reassemble – closing title); C 105f (3.5s, dive 69f + settle hold 36f) one-way dive
energy: High
---

## Intent
The depth-layer card adds depth to a pan — the layers move, but the page is still a page. These two patterns go further:
the whole page is treated as one 3D object, and the camera (or the world) performs live-action-grade manoeuvres around it. The narrative
semantics of the two take one slot each: A says "let's see what it is made of" (a teardown display, the language of Apple launch films);
C says "slam from an overview onto the protagonist" (a god's-eye view diving straight into a hero close-up, whole → focus).

## Variant selection

| Pattern | Approach | Section it suits |
|----|------|----------|
| A exploded-view | The whole page lies flat in a 3/4 axonometric, components blow out along the page normal in a stagger and hover (with numbered callouts), and after a beat they reassemble in reverse order and close with a hammer-drop | Architecture/composition display: "what is in this product"; module overview section |
| C drone-dive-landing | Hovering at a near-vertical overhead angle → a sudden plunging dive → an air-cushion deceleration stopping at the hero card close-up | Opening establishing → introducing the topic; a chapter launch where a global map slams into a single point |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A spatial base | perspective 2400 + `translate·scale·rotateX(54°)·rotateZ(−34°)` axonometric + preserve-3d; during the blow-apart the camera position pulls out 0.56→0.47 and moves down to give the layer stack room in the frame; during the hover it orbits rotateZ +10° and the pitch angle tightens by 4° | A frontal slight tilt (18°/−12°) reads only as "floating up"; only a flat axonometric looks like an exploded diagram; the hover orbit lets inter-layer parallax show depth |
| A blow-apart | 5 layers translateZ 150/270/400/520/640, spring (damping 15, stiffness 120) staggered 5f | Layers further toward the far end of the page (top) must be higher, otherwise lower layers block the upper layers after rising; all depths equal reads as the whole page floating up |
| A reassembly | Callouts withdraw first (ease-in 8f), layers ease-in 14f in reverse order, staggered 3f; on the seating frame the whole group sinks 8px with a damped rebound + the tabletop contact shadow tightens once, then a sweep of light passes across the whole page | The hammer-drop must be there — without it the reassembly reads as a limp fade-in; but no screen shake (Q3), and the sink rebound + shadow tightening give the same "click" |
| A depth anchors | The shadow each layer casts onto the base plate moves down, blurs and fades with height + a thickness edge behind each layer + the base plate reveals dashed component slots | If any of the three cues is missing the inter-layer relationship blurs |
| A callouts | Anchor = the 3D projection of the midpoint of the layer's outer edge (hand-computed with the same matrix as CSS), two columns left and right, with horizontal leader lines bending once before the column; title 44px + description 30px, line draw-on 8f + rise 12f, staggered 6f | Leader lines pulled from the middle of a layer cross other layers; callout text <32px cannot be read clearly |
| C travel | One p drives rotateX 72°→0 + scale 0.42→1.35 + translate closing in; origin pinned to the hero card centre (e.g. 518,335); the page is laid out at the end-point magnification 1.35 + rasterised with CSS zoom then scaled back, so the close-up text is not blurry | One p = one camera, one move; driving them separately reads as three animations fighting |
| C speed curve | 0–24f god's-eye establishing + a lift-up preparation (travel reversing 2.5%) → main dive 25f Easing.in(cubic) taking 82% of travel → air cushion 20f Easing.out(poly(5)) covering 18% → settle hold 36f | The sudden speed drop at the switch frame = the feel of being held up by the air cushion; the 82/18 ratio matters more than the frame counts |
| C atmosphere | The scene is wrapped in CameraMotionBlur(shutterAngle 220, samples 12), with the background and grain placed outside the blur; the page hovers above a dot-matrix ground in the same 3D world (starting lift 150), and during the dive the dot matrix surges toward the lens; a same-shape contact shadow on the ground tightens and solidifies as it lands, fading to 0 before touchdown; after settling a light darkening ring around the hero tightens the focus | The soft shadow sells "hover height"; blur sells speed, and missing one dimension makes it fake; large gradient areas put into multi-sampling quantise into colour rings, so keep the background outside the blur |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Both patterns need real screenshots in layers / high-definition textures: A needs the page screenshotted in component blocks (top bar/sidebar/
  cards each as an independent image, since one image of the whole page cannot be blown apart); C's end point is a close-up, so the material is first processed with the
  high-resolution rasterisation technique of aesthetic rule Q2
- Easy mistake in C: Remotion has no Easing.quint, so write Easing.poly(5) (a pitfall hit in this batch's real render)
- The component layout of A must reproduce the original page grid with absolute positioning (5 layers in the demo: sidebar/chart/assistant/metrics/command bar),
  and flow layout cannot do per-component translateZ

## Reference implementation
demos/camera/space-camera-moves/
(DroneDiveLanding.tsx / ExplodedView.tsx)
