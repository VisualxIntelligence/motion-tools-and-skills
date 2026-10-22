---
name: scanline-annotate-focus
summary: A scan line sweeps at constant speed from top to bottom over an already-existing page; as it crosses the lower edge of each block, that block is snapped into alignment by four-corner viewfinder brackets springing in from outside (one overshoot), after which a machine label typed out character by character is attached, and the status line at the top counts 00/06→06/06 in sync
use_when: Analysis shots of "the AI is reading your page/brand"; teardown introductions of design systems/brand guidelines; self-explanation sections for product capabilities
duration: about 5s (150f@30fps)
energy: Medium (mechanical and cool; the rhythm is driven by the constant-speed scan line, and the annotations are the beat points)
---

## Intent
Turn the abstract act of "analysis" into a visible chain of cause and effect: wherever the scan line goes, that block is framed and
named. The viewer reads "the machine's gaze", so the scan line must be constant-speed and the annotations must strictly lag the
scan line's passage — **scan first, then snap the bracket**; once the order is scrambled it becomes a pre-choreographed animation.

## Motion core
- Two colour sets with a strict division of labour: the **brand colour** (demo: terracotta `#C4552D`) lives only in the page content, and the **machine colour** (cobalt `#2B4FD8`)
  goes only to the scan line / corner marks / labels / status line — so the viewer can tell at a glance "the page itself" from "the machine's gaze"
- The page (demo: the video-shotcraft website: mirror-engraved logo + wordmark, H1, sample-film cover, CTA, colour palette) is mounted in a 1560×840 browser window (two layers of soft shadow), with the status line above the window; the whole shot has a very slow push-in 1.000→1.035
- The scan line runs **strictly at constant speed** over 6→80f through the window y −20→860: 3px light core + a 140px fading pale-blue wash behind it and an 18px dot-matrix afterglow;
  a triangular marker slides with the line on each side of the window frame, and the left one reads out the current `Y 0412`
- The trigger frame is back-calculated from the bbox: `ft = frameAtY(y + h)` (the frame at which the scan line crosses the bbox **lower edge**), sorted by lower edge and then clamped
  to a minimum interval of 4f; demo measured LOGO 19f · NAV 23f · H1 48f · CTA 68f · HERO 72f · PALETTE 77f
- Viewfinder bracket: four L corners (3.5px round caps) close in to the bbox from 76px outward with `spring(damping 15, stiffness 210)`
  (one visible overshoot, going slightly inside the bbox before coming back); the arm length 40→26px tightens one notch 3f later (following); at `ft+3→+6` a cobalt focus flash inside the bracket
  (fill 0.075 + 2px inner stroke) lands over `+6→+18`
- The label appears at `ft+5`: a small design-tool-style cobalt tag with white text (50 high, 32px monospace, category 750 bright / detail 500 · 78% white),
  text typed out at ~2.2 characters/frame, the tag width growing with the text length (the right edge slightly ahead) + a white block cursor, floating up from 8px→0
- The status line counts in real time the number triggered so far, `SIGNALS 0n / 06` + a scan progress bar; 8f after the last block triggers it switches to `BRAND READ` (turning machine colour),
  and the ~60f hold after that is the complete poster

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Scan line | 74f constant speed, window y −20→860 | **Zero easing**: adding an ease reads as "someone dragging a progress bar"; below 60f the labels cannot finish typing and pile up |
| Trigger conversion | ft = SCAN0 + (y+h−Y0)/(Y1−Y0)·(SCAN1−SCAN0) | To change the scan window change only the four constants SCAN0/SCAN1/Y0/Y1, and the triggers follow automatically |
| Minimum interval | prev + 4f | LOGO / NAV on the same row would pop on the same frame; only after clamping can they be read one by one |
| Viewfinder closing | Outward 76px → 0, spring damping 15 | Outward by pixels rather than scaling by proportion: large and small targets get the same closing distance; an outward distance <40px does not show the "aligning" action |
| Corner marks | Arm length 40→26px, stroke 3.5px | An arm length beyond 1/3 of the target's short side becomes a full border and loses the "viewfinder" semantics |
| Focus flash | Fill peak 0.075 | Beyond 0.12 it becomes a grey box on a bright background, reading as a "selection highlight" rather than focus confirmation |
| Label | Starts at ft+5, ~2.2 characters/frame, 32px monospace | The 5f lag is the cause and effect of "name it only once the bracket is steady"; drawing the tag to full width first and then typing exposes an empty blue bar |
| Count line | Counted in real time from fired, 30px monospace | A count with a hard-coded timeline stops matching as soon as a bbox changes; it must be counted in real time |

## Known pitfalls
- **The scan-line trigger moment is strongly bound to the target bbox**: after changing the page content the targets' `x/y/w/h` must be re-measured,
  the bbox is measured by hand (elements are not measured automatically), leaving a margin of about 12–16px
- Label placement is a choice of four (`right / above / below / belowRight`), and the width is estimated from the monospace character count `CHAR_W = 0.6em`;
  when a word gets longer first check whether it will press against an adjacent module or push out of the window — for wide targets like H1 put the label above, and for upper-right targets right-align the label below
- On a bright-background page the scan line and corner marks must use a dark, saturated machine colour; a light glow line is almost invisible on a bright background
- Division of labour with `scanline-assemble-flyin`: that card is "assemble as the scan passes" (the page goes from empty to full),
  this card is "annotate as the scan passes" (the page already exists, and only analysis is done)

## Reference implementation
demos/effects/scanline-annotate-focus/
(ScanlineAnnotateFocus.tsx)
