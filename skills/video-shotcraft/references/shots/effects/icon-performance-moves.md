---
name: icon-performance-moves
summary: Icon performance: attention-bounce, an attention-seeking bounce (the icon jumps repeatedly with increasing height + squashes on landing + the camera is drawn to it)
use_when: Half-screen icon close-up sections; introducing a new feature
duration: 156f (5.2s)
energy: Building up, an introduction
tags: interaction
---

## Intent
The first batch of the icon-animation category to enter the library: the icon is a performer the camera shoots up close, not a
micro-interaction in a corner of the UI. attention-bounce is macOS Dock vocabulary — the video-shotcraft
app icon in the Dock jumps 4 times in place, each higher than the last (0.35→1.2 times the icon height), squashing on every landing
(final jump width 1.2x height 0.8x) + a ripple splash, neighbouring icons gradually lose focus, and on the highest jump the camera
nudges 8% toward it (drawn to it); once settled it pops open the "New in Shotcraft" feature panel — cutting "user attention"
into the narrative.

## Method
| Variant | Method | Use when |
|----|------|------|
| A attention-bounce | Projectile bounce (duration ∝ √height) with increasing height + airborne speed stretch + 2f squash on landing + ripple splash, neighbours rack-focus out of focus, the camera pushes in at scale 1.08 on the peak jump, and on settling a corner badge is triggered + the panel springs open | Introducing a new feature: "look at me" → the camera looks at it → it opens the panel |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Icon size | 360–400px tall (half-screen close-up; demo icon 360) | A small icon in a corner performing is seen by no one — the performer must take the centre spot |
| Escalating bounces | 4 jumps at 0.35→0.6→0.85→1.2 times the icon height, airborne 14/18/22/26f (∝ √height) | Equal-height jumps read as loading; escalation is "getting louder with each shout"; a duration that does not follow the height reads as weightless |
| Landing squash | 2f contact, squash amount escalating 0.1→0.2 (final jump width 1.2x height 0.8x), the final jump settles back with a damped cosine | Without squash there is no weight |
| Camera push-in | 8% smooth push over 72–90f on the final jump; neighbours defocus to 7px over 30–96f, saturation down 30% | The camera move acts out the "drawn to it" viewer perspective |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- The bell-swing-alert (bell swing) from the same batch was eliminated with no note — pendulum-type icon
  performances on a hanging point are of doubtful suitability; for new icon performances prefer bounce/burst types
- The first version went out of frame (the peak of the final jump pushed out of the top); work out the bounce height and the headroom above in pixels first
  (demo: ground 960, icon 360, final-jump apex 168px, about 119px after the 8% push-in)
- Sound: one "duk" on each landing with rising pitch, and one light "ding" when the panel pops out

## Reference implementation
demos/effects/icon-performance-moves/
(AttentionBounce.tsx)
