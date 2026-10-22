---
name: transition-travel
summary: Traversal transition: letterform-cavity traversal — the letterforms of a giant chapter title are themselves a window, and the camera dives into the letter strokes to complete the scene change
use_when: Seams where the two shots have an "element/container"-level spatial relationship (a technique card, selected as a complement to the three variants of shot-transitions)
duration: n/a (technique card; demo 150f, main push action segment 52f, hold before and after counted separately, frames carved out of the adjacent shots' budgets)
energy: n/a (technique card, takes no energy slot)
tags: camera
---

## Intent
The three variants of shot-transitions are the "hand-off" type — the previous shot closes and the next shot enters, with the seam relying on a white flash/blurred frames/
a window to cover the instant of the page change. This card is the "traversal" type — the background exists inside the foreground picture
as a real element (a hole in a letterform), and the camera dives in with one continuous spatial movement,
so that the viewer follows the same object from start to finish, with no hand-off instant. Selection rule: if the background can be "pre-sent"
in the foreground → traversal; if the two scenes are merely in sequence with no spatial nesting → hand-off. The semantics of letterform-cavity traversal are
"the title is the door" (chapter title card and transition in one).

## Variant selection

| Variant | Method | Seam it suits |
|----|------|----------|
| A letterform-cavity traversal letterform-zoom | The giant title's letterforms (holes cut with an SVG mask) show the new page through them, an exponential push goes through the hole, the instant the hole fills the frame it takes over, and the residual strokes are flung out of frame | Chapter title → body; the high-energy version replacing paper-title-card chapter title cards |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A cavity-traversal main push | The cover plate's SVG mask (white base + black text at 900 weight) cuts holes, with transform-origin aimed at the centre of a letter stroke (the hole) — if anchored in the letter cavity, what fills the screen at the end of the push is the cover plate, not the hole (demo: the vertical stroke centre of the I in "EDITS" at 560px is 973,515, the stroke 107px×30 > frame width; when choosing the word, let the I's vertical stroke fall near the vertical centre line of the frame so that the hole opens from dead centre); scale=30^u, u over 52f with bezier(0.6,0,0.85,0.5) slow start and steep finish, with a 2% pull-back wind-up for 26–34f before the push | ZOOM_MAX is set by "the hole fills the frame": the thinner the stroke, the larger the multiple; the slow start leaves time for the viewer to see clearly that "there is something in the hole" |
| A something in the hole | Cover plate dark, hole bright: a warm-black cover plate vs a molten-gold gradient video-shotcraft launch page, with the cards in the hole also made bright-faced (cream frosted); a ring of blurred orange outline along the letter edge drawn only in the cover-plate area (light leaking out of the hole) + a 1.5px warm-white cut edge | When there are dark blocks in the hole, those letters read as "solid type", and the suspense of passing through the hole is gone |
| A only light in the hole, not type | During the title-card hold the page's text/card layers are hidden entirely, and the hole shows only a warm gradient + soft light shapes (a patch of cream light at the card position, a smear of dark red at the title position); in the main-push middle section 64–90f the content layer fades from an 18px defocus into focus (EASE.out), already clear on takeover | When the page title can be read in the hole, the two layers of readable text fight each other, and the title type reads as "cluttered" rather than a clean cut-out |
| A exit and trailing ghost | While scale∈[14,26] the cover plate opacity goes 1→0; from u>0.35 the expected blur 0→20px (divided by scale and written into blur) + four layers of semi-transparent cover-plate afterimages from 0.8–3.2 frames earlier stacked into a radial zoom trailing streak; at the takeover instant the page brightness +12% flashes and falls back | If blur is not divided by scale it will be magnified into a wall of haze; with only two layers of afterimage it reads as hard-edged semi-transparent colour blocks, and four layers are needed to join into a trail |
| A background parallax | The page only pushes 1→1.08 (0.7·u during the main push, completed with quint-out after takeover, with continuous speed at the handover) + drifts 28px left over 0–100f; after takeover the shot counter on the render card goes 0→12, duration bars fill in a stagger, and the DONE label pops out | If the background does not move the hole holds a dead picture; if the background pushes too much it matches the cover plate's speed and the depth disappears |

## Known pitfalls
- The push anchor must be measured from rendered frames (the demo's vertical-stroke coordinates were measured from a still frame); changing the font/word/renderer shifts the letter-spacing
  and it drifts — after rendering check the direction of the push, and if the hole is not centred fine-tune the origin, and do not trust numbers worked out by hand from font-width em values;
  when the anchor stroke is too far from the vertical centre line of the frame (e.g. the I in "FILM" at x≈726), the hole opens off to one side while the cover plate on the other side takes a long time to clear, so change the word to centre the vertical stroke
- When the background page is pushed to 1.08, 4% around the edges is cropped away: leave the layout's safe margins as "after the push is complete" (demo: left and right 200/230, top 122)
- Letterform-cavity traversal is not stacked with the three hand-off variants at the same seam, one variant per seam; the traversal variant already brings high energy,
  and wrapping it in a white flash/screen shake reads as exposing the trick (same rule as shot-transitions)

## Reference implementation
demos/transition/transition-travel/
(LetterformZoom.tsx)
