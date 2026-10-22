---
name: shot-transitions
summary: Three shot hand-off variants — push-in white flash, whip-pan (hard-brake version), mask-wipe through a window (depth version) — selected by energy drop and seam semantics
use_when: Any junction between two shots (a technique card; after the shots are laid out at the storyboard stage, pick one variant for each seam)
duration: n/a (technique card; the frames each variant occupies are in the parameters table, carved out of the adjacent shots' budgets)
energy: n/a (technique card, takes no energy slot)
---

## Intent
The library's shot cards only handle their own entrance and close, and "how shots are joined" has never had a vocabulary —
a bare cut at a seam lets all the cinematic feel built up shot by shot leak away at once. Launch films widely regarded as excellent
(Linear Releases/Agent, reverse-engineered from extracted frames on 2026-07-11) have not a single bare cut throughout:
scene changes rely either on depth travel, or on focus relay, or on black-field title cards to build up force. This card collects three variants:
a white flash covering the cut, a whip-pan borrowing blurred frames to change scene, and punching through a window into a detail world.

## Variant selection

| Variant | Method | Seam it suits |
|----|------|----------|
| A push-in white flash flash-cut | The previous shot's camera pushes in, and the cut point straddles a layer of white flash covering the page change | Interaction break-through, page → page with similar energy (already in the library, incorporated) |
| B whip-pan (hard-brake version) | The camera whips sideways to the next scene in one beat, mid-way the motion blur blurs beyond recognition, borrowing blurred frames to change scene; hard braking before the landing point, then a long-tail slide in | Back-to-back fast-paced feature sections (the light, brisk version of high energy → high energy); the landing point is a shot where "content must be read" |
| C mask-wipe through a window (depth version) | A real element on the page (a card) is enlarged into a full-screen window, and the new scene grows inside the window and takes over | Semantic seam: feature overview → that feature's detail ("click open this card to enter its world") |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A flash-cut | `assets/lib/FlashCut.tsx`, from = cut point − 5, 5f on each side | For usage see the type-and-filter card; the white flash only covers a hard cut and is not used as a decorative light effect (Q4) |
| B whip-pan hard-brake version | Start hold ≥20f → the first 70% of the travel in 30% of the time (blur segment, peak ~300px/f) → the last 30% of the travel with an ease-out long tail ~48f sliding into place; integrate the displacement from one continuous velocity curve (3f start + exponential decay), and do not apply ease-out separately to each segment (the speed would restart a second time at the segment join); apply directional motion blur by instantaneous speed (`SpeedBlur` of `_fixtures/Polish`, sd ≈ 0.085×speed, capped at 64px), only active in the whipping segment; the reference implementation connects the same displacement curve to a mechanical rolling-wheel index counter (Nº 02→09) and a ruler + fixed playhead that travel with the corridor, and after settling the target card lifts to 1.2× for readability | Suits shots where the landing point is "content to be read" — the long tail gives the viewer's gaze a slope to catch up on; a long tail >60f steals the next shot's entrance, so prefer short over long; set the span by "peak speed ≥300px/f", and if insufficient the blur is not thick enough and the scene change is exposed; the two scenes are joined on the same horizontal line (page space at the same y); CameraMotionBlur sub-frame stacking turns the whole film yellowish at 8bit, with the smear appearing as frame-by-frame echoes, so do not use it for a bright-field UI whip-pan |
| C punch-through window depth version portal-wipe | The target card first hovers and lifts as a wind-up (−10px, 1.03×, neighbouring cards fade dark) → the window enlarges over 40f with bezier(0.7,0,0.3,1) slow then fast, with the new scene inside the window growing from ~0.42 to 1 via a counter-compensating scale (on the same t as the window geometry), and the card face fading out within the first ~28% of the travel (opacity 1−t·3.6; any slower and it gets stretched into a full-screen giant-type afterimage); **only 2 layers** of parallax inside the window (far-field panel coefficient 0.08 + near-field 2 cards 0.3, no blur), after the punch-through completes an 8f soft stop → still ≥30f to read the new scene clearly; the world inside the window is best the cover of the opened card "growing up" (reference implementation: in the video-shotcraft Workspace, the cobalt-blue waveform cover of the "Premiere Forecast" project card → a view-count forecast world with the same waveform terrain + glass panels + 2 floating metric cards, the curve drawn out as t advances) | The window geometry and the scene inside the window must be driven in sync, and out of sync reads as exposing the trick; the number of layers/spread is the crux of legibility — the version with 3 layers + 0.85 spread + blur was rejected, and passed after convergence; after punching through it must truly stop, and parallax that keeps drifting without stopping steals the next shot's reading |

## Known pitfalls
- Annotate the transition variant seam by seam already at the storyboard-table stage (written into the "key motion" column); adding it only at the shot-by-shot stage
  means shifting frames across the whole line — the frames a transition occupies are carved out of the adjacent shots' budgets, with the same rule as the hold budget (R3)
- Transitions are not stacked: one variant per seam; adding a white flash on top of the whip-pan blur segment or midway through the punch-through reads as exposing the trick
- The B/C variant parameters were tuned on placeholder footage + promoted with real footage, and are not user
  production precedents — single-instance precedents, and when in conflict with a precedent, the precedent takes priority
- The C-variant new scene inside the window should semantically be the "detail world" of the opened element (in production connect a real detail-page
  screenshot) — stuffing an unrelated scene into the window breaks the semantics and degrades into a fancy wipe; the enlarged element should use a high-resolution texture (Q2, it is close up throughout)
- The C depth-version parameters are a tuning starting point for a hand-built placeholder UI (video-shotcraft Workspace / view-count forecast world), not verified with real screenshots;
  reference implementation demos/transition/shot-transitions/PortalWipeV2.tsx

## Reference implementation
A variant: template/src/aifl/Main.tsx flash-cut layer (component `assets/lib/FlashCut.tsx`);
B variant (whip-pan hard-brake version): demos/transition/shot-transitions/WhipBrakeReal.tsx;
C variant (mask-wipe punch-through depth version): demos/transition/shot-transitions/PortalWipeV2.tsx.
