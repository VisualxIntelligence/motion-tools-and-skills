---
name: lead-word-zoom-assemble
summary: The first word occupies the centre of the frame at 2.3x font size and keeps pushing in 6% during the hold, then a single curve simultaneously completes "shrink back to final font size" and "slide the whole line left into place", with the following words each pushed in from 0.5em to the right of their slot; the pivot is pinned horizontally to the first word's centre and vertically to the baseline (measured at mount), the subline surfaces in the same time window as the whole line moves up, and after a beat of stillness the whole scene crash-zooms in, defocusing, to hand off
use_when: "Introducing" title cards for a brand / product name; the second shot of a launch-event-style opener; cases where a one-line claim needs "one word to fill the frame first, then the whole sentence filled in"
duration: about 2.8s (84f@30fps; sentence assembly completes at f36, move-up and subline f32–46, stillness 26f, final 12f crash)
energy: Medium-high (opens with a full-frame large word, but only one movement throughout, no secondary impact)
tags: opening
---

## Intent
The easiest mistake with a title card is "the whole sentence fades in together" — the audience receives 5 words at once and remembers none. This card turns
reading order into **physical order**: first give only one word, and make it so large it fills the frame and is still pushing toward the audience, so the audience
is forced to read it first; then this word retreats to its own size and position within the sentence, and the whole sentence grows around it. By the time it settles the audience
has already read the lead word twice.

The real crux of the feel is not the scale curve but the **pivot**. The lead word travels from "dead centre of the frame" to "the position of the third character in the line"; if the pivot is taken at the line box centre, the scale and the left slide
each pull the text in opposite directions, and in the last few frames the baseline shakes visibly to the naked eye.
Pin `transform-origin` horizontally to the lead word's centre and vertically to the baseline; with these two points fixed throughout, the whole line simply
"shrinks", with no drift at all.

## Motion core
- **Two scale segments summed into one scale**:
  `scale = interpolate(f, [0,12], [2.3, 2.3·1.06], PUSH_EASE)
         + interpolate(f, [12,24], [0, 1-2.3·1.06], ZOOM_EASE)`.
  The first segment is the push-in during the hold (`cubic-bezier(.25,1,.5,1)`, decelerating and then sitting at the peak), the second is the shrink back
  (decelerating all the way from the peak down to the final font size 1). Written as a sum rather than a piecewise branch, so there is no velocity break between the two segments
- **Shrink back and left slide share ZOOM_EASE** (`cubic-bezier(.5,0,.05,1)`, heavy ease-in-out, zero rebound):
  `translate = interpolate(f, [12,36], [slideDistance, 0], ZOOM_EASE)`. The two actions must read as
  **one** movement; when each runs its own curve they read as two beats, "first shrink, then slide away"
- **Where the eccentricity comes from**: `slideDistance = lineWidth · (0.5 - leadRatio)`, with `leadRatio` =
  the proportion of the whole line at which the lead word's centre sits. The lead word is to stop at dead centre of the frame, so the whole line must first be offset to the right by this much
- **Measured pivot**: at mount `delayRender` suspends rendering, and three values are measured — the whole line's `offsetWidth`,
  the lead word's `offsetLeft + offsetWidth/2`, and the baseline. The baseline is read with a **zero-size inline-block ruler**
  (the `offsetTop` of `<span style={{display:'inline-block',width:0,height:0}}>` is the baseline),
  much more accurate than estimates like `lineHeight × 0.8`. After measuring, `continueRender`, and `transform-origin`
  is written as `${leadRatio*100}% ${baseline}px`
- **The following words are pushed in, not faded in**: the i-th word (i≥1) starts at
  `pushStart = 12 + 6 + (i-1)·4`, with `translate` from `0.5em → 0`
  (`cubic-bezier(.22,.8,.36,1)`, fast start, long landing), and opacity finishes fading in only 2f. The fade-in must be extremely short,
  otherwise the word "surfaces" rather than being "pushed into the slot"
- **The space between words must sit outside the inline-block**. When it trails inside the word span it gets cropped by the line box,
  and once settled all the words stick together in a clump (a bug in the upstream original component, fixed here)
- **The scene layer's three-beat ending**: f32–46 the whole line `translateY 0→−56px` (outCubic), and the subline in the **same time window**
  fades in + moves up 16px — the space freed by the move-up is filled by the subline in that same frame, with no gap; f46–72 fully still for 26f;
  f72–83 the whole scene `scale 1→1.2` + `blur 0→9px` + `opacity 1→0.45` (ease-in-quad), pushing in and defocusing
  to hand off to the next shot
- **Finish (demo)**: the lead word enters with 8px→0 defocus within the first 6f; the shrink-back segment applies momentary defocus by scale velocity (≤3.5px, zero once steady);
  the base is a low-contrast mesh of indigo key light plus a touch of warm afterglow + grain + vignette
- **Accent word**: exactly match one word and change it to the accent colour (in the demo it is the brand name `video-shotcraft`). The brand word's push-in landing already carries
  its own highlight, so no second action is needed

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Lead-word start multiple | initialScale 2.3 | 2.3 makes the lead word overflow the frame horizontally just a little (reads as "too big to fit"); <1.8 is only "slightly larger type" and the impact disappears |
| Push-in | pushScale 1.06, filling the 12f hold | 6% is the smallest perceptible amount of "still coming toward the audience"; >1.15 reads as a reverse bounce during the shrink back |
| hold | 12f | How long the lead word has the frame to itself; <8f and the audience cannot finish a long word, >20f and the rhythm of the whole sentence collapses |
| Shrink back | 12f, ZOOM_EASE | Same curve as the left slide; giving the shrink back its own faster curve makes the whole line "finish shrinking and then slide", breaking into two beats |
| Left slide | assembleDuration 24f | Twice as long as the shrink back: the font size has settled while position is still moving, and this "gliding tail" is the source of the cinematic feel |
| Following-word delay | wordDelay 6f (after the shrink-back start) | Following words are released only once the lead word begins shrinking; releasing them in the same frame crowds them so you cannot tell which is moving |
| Inter-word stagger | wordStagger 4f | 4f reads as "pushed in one after another"; at 0 the whole suffix enters together, returning to "the whole sentence fades in" |
| Per-word push-in | wordDuration 12f, wordPush 0.5em | 0.5em is "just from outside the slot"; >1em reads as flying in from off-screen, fighting with the lead word's closing direction |
| Word fade-in | wordFade 2f | Deliberately extremely short. >6f and the words read as "surfacing", losing the mechanical feel of the push-in |
| Font size / weight / letter-spacing | 96px / 600 / −0.03em | Negative letter-spacing is what keeps it from falling apart at 2.3x magnification; large type with positive letter-spacing reads as a "slogan banner" |
| Move-up + subline | f34–50, −56px, subline in the same window | The two things must share a window: moving up first and then bringing in the subline adds an empty gap beat |
| Stillness | 22f | Readable time after settling; below 15f the audience cannot read the subline in time |
| crash | final 12f, scale→1.2, blur→9px | This is the **first half** of a transition, and its motivation must match the first frame of the next shot; played alone it looking like "not finished" is normal |

## Known pitfalls
- **A wrong pivot makes the baseline shake**. `transform-origin` must be the pair "lead word centre % + baseline px". Taking the
  line box centre (default `50% 50%`) makes scale and left slide pull at each other, and in the last few frames the baseline visibly jumps
- Do not estimate the baseline. Rules of thumb like `lineHeight × 0.8` are off by a few pixels on different fonts, and after 2.3x magnification that is
  a dozen-plus pixels of shake. The `offsetTop` of the zero-size inline-block ruler is the only reliable reading
- During `delayRender` the whole line's `opacity: 0` — this is **mandatory**. Otherwise the first frame before the pivot is measured flashes
  a misplaced large word, which in the finished film is a dirty frame
- The layout is measured at mount, so **the result varies with the render environment's fonts**: when cross-platform font fallbacks differ, the whole line width
  drifts overall (and the lead word's proportion changes with it). If that bothers you, hard-code the three measured values as constants
- `scale` / `translate` use separate CSS properties (not the `transform` shorthand). Mixing them makes one of the two
  get overridden; to merge into `transform` you must guarantee the `translate → scale` order yourself
- Word-space inside the word span gets cropped by the line box (see above). This bug is not obvious at small sizes, but at 96px
  all the words visibly stick together
- The lead word must be a **short word**. Something like "Introducing" at about 10 characters is just right; with a lead word over 14 characters the 2.3x
  magnification overflows both sides of the frame and the audience cannot read the end of the word
- Give the accent colour to one word only. If two words are coloured the audience does not know which to remember, and the push-in landing highlight becomes
  a "coloured headline", erasing the meaning of the action
- The final crash is the first half of a transition, not an ending. Used alone as an end of film it looks "cut off" — for an ending, replace the
  crash with a still hold or a fade-out

## Reference implementation
demos/typography/lead-word-zoom-assemble/
(LeadWordZoomAssemble.tsx)
