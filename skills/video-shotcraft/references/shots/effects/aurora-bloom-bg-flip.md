---
name: aurora-bloom-bg-flip
summary: A light grey background with purple-orange soft-focus blobs rising from the bottom, then the whole background is darkened to near-black within about 0.36s and the blobs are pressed down to an afterglow; the copy blurs out and blurs in with a sentence swap in sync, with a gap between sentences and no cross-fade
use_when: Narrative turning points ("For years… → everything changed"); the beat in a brand film where it is pulled from set-up to accent; section switches between light and dark colour schemes
duration: about 5.2s (156f@30fps)
energy: Low to high (the first 2/3 is build-up, the instant of darkening is the accent of the whole film)
---

## Intent
Use the "background inversion" as an accent mark: for the first 56% let the aurora rise slowly and let the viewer settle into the light background,
then in under 0.4s press the whole frame to near-black — this reads more like a
"page turn" than any zoom or white flash. The sentence swap must land after the inversion, with a gap in between, so that the viewer first takes in the change
in the picture before reading the new sentence.

## Motion core
- Three `blur(60px)` blob layers rise from the bottom of the frame: main purple `rgba(107,79,224,.85)`
  90%×85%, orange core `rgba(217,122,74,.9)`, white blended-edge `rgba(255,255,255,.8)`
- Rise `seg(0.04→0.56, outCubic)`: `translateY 32%→−6%` + `scale 1→1.25`
- Inversion `flip = seg(0.57→0.64, inOutQuad)` (normalised 0.07 ≈ 0.36s):
  background `mix([236,236,236] → [10,10,18])`, blob opacity 1→0.4 pressed down to an afterglow,
  the white blended-edge layer is removed directly with `1−flip`
- The orange core independently drifts slowly sideways, `translateX ±8%` (2.2 cycles over the whole film), so that the blobs have
  relative motion inside them rather than rising and falling as one block
- Sentence A, word by word: `blur 0→8px` + fade-out (starting at t 0.40, stagger 0.04, 0.10 each, inQuad);
  sentence B, word by word: `outQuint` blur-in (starting at t 0.70, stagger 0.05, 0.11 each), and within 0.09 after landing
  the colour is taken from DEEPP purple to white; once finalised at t≈0.90 it stays still for ≈0.5s

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Blob blur/size | blur(60px), main layer 90%×85%, container inset −10% | Blur below 40px shows the circle, and it becomes a "colour ball" rather than "light" |
| Rise | translateY 32%→−6% + scale 1→1.25, t 0.04→0.56 outCubic | Taking more than half the duration is deliberate: the longer the build-up, the heavier the inversion |
| Inversion duration | t 0.57→0.64 inOutQuad ≈ 0.36s | **The crux**: stretched to 1s it is no longer an accent but a gradient transition |
| Background | #ececec → #0a0a12 (not pure black) | Pure black causes banding at the edges of the afterglow blobs |
| Blob darkening | opacity 1→0.4, white blended-edge layer goes to zero in sync | Without darkening the blobs, purple and orange overexpose and smear into one lump on the dark field |
| Orange core drift | translateX ±8%, 2.2 cycles over the whole film | At 15% amplitude it reads as "a ball moving" |
| Sentence A blur-out | Per word stagger 0.04, 0.10 each, inQuad, blur→8px | inQuad makes the disappearance accelerate, reading as "swallowed by the light" |
| Sentence B blur-in | Per word stagger 0.05, 0.11 each outQuint + purple→white within 0.09 | The colour change comes slightly later than the entrance; turning white only at the moment of landing is the signal of "finalised" |
| Sentence-swap gap | A finishes at t≈0.58 → B starts at 0.70 (≈0.6s with no text) | A cross-fade smears the two sentences together; the gap is what reads as "turning the page" |

## Known pitfalls
- The white blended-edge layer (blobC) only works on a light background, and must be removed with `1−flip` during the inversion,
  otherwise a patch of grey haze is left on the dark field
- DEEPP/PURPLE are the **native light colours** of this effect, not brand-colour slots; to change them to the project's colours
  the three blob layers + the sentence B text colour must be changed as a group, and changing only the text colour disconnects it from the background
- The demo copy is video-shotcraft's narrative turn ("Promos took weeks" / "Meet video-shotcraft",
  with word counts and word lengths close to the original film's "For many years" / "everything changed"); the per-word
  stagger rhythm depends on word count and word length, so when changing the sentences re-tune the two intervals 0.04/0.06
- The background is written per frame in JS as `background` (a solid colour produced by `mix()`); do not use a CSS transition,
  otherwise the colour is indeterminate when seeking to an arbitrary frame

## Reference implementation
demos/effects/aurora-bloom-bg-flip/
(AuroraBloomBgFlip.tsx)
