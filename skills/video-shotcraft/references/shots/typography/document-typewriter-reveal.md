---
name: document-typewriter-reveal
summary: A full-page, properly typeset document window floating in a dark field "writes" itself out behind a cursor, the sidebar follows, history entries drop one by one into the track, and the camera pulls back from an oblique close-up of the title to the full window
use_when: Feature shots for documents / reports / notes; the beat with the highest information density
duration: 150f (about 5s, including the history-list-stack tail and the tagline hold)
energy: Low-medium (highest information density, with the rhythm held steady so viewers can read the text)
tags: ui-entrance
---

## Intent
The audience will read every word on screen — the persuasiveness of this shot rests entirely on "the document is real". The typewriter-style write-in turns a static page into a "document being written out", and the sidebar history entries dropping in add the time depth of "continuous output".

## Motion core
- Content blocks are written in pairs on the beat: a page-colour mask anchored at the right wipes narrower from left to right, with an accent-colour caret riding on the reveal front
- After the wipe completes, the person-name @-mention grows an accent-colour background
- The left and right columns enter by having a background-colour patch pulled away from top to bottom, with an accent-colour hairline on the inner edge growing with the reveal and then fading
- Tail section (history-list-stack): 6 history entries drop one by one from above into the sidebar track, each landing accompanied by a pop
- The camera pulls from an oblique close-up of the title to the full window (both columns must be in frame), then tilts down slightly and moves up to give the bottom to a tagline line, with only a very slow push-in; the page is an application window floating in a dark field (rounded corners, bright edge, backlight, long drop shadow), not filling the full screen

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Write-in beat | 20 blocks in pairs, cue of pair g = 8 + g·4.4, each block wipes in 9f, the last pair finishes at ~57f (before the 64f full-window settle) | Writing block by block exceeds the budget — "block count × beat must be checked against the budget first" is the core arithmetic of this card, calculate first and write after |
| Write-in technique | Background-colour mask width 100%→0, bezier(0.4,0,0.6,1), mask colour taken from the measured colour of the textured paper surface, over-covering on the right (title 120px — the measured block width is shorter than the actual bold glyph width, otherwise the last word leaks out); accent caret 3px (a shade deeper aurora purple + same-colour soft glow) follows only the newest block, rides only within the actual text width, fades out 2f after writing ends; 8f before the first block starts writing the pen tip blinks at the title start on standby | Multiple carets appearing at the same time immediately give the game away; there is only ever one "pen tip" |
| li bullet | Mask over-covers 28px to the left (the ::marker sits ~22px left of the text) | Without over-covering the bullet it gives itself away early — typographic details baked into the screenshot texture all need this kind of check |
| @-mention | Starts 4f after the wipe completes, grows an accent background over 8f (aurora purple 0.4), `mix-blend-mode: multiply` (the background sits above the textured text; normal blending would wash out the person name); non-name headings are skipped | A highlight later than the write-in reads as "key point marked out"; in the same frame it reads as a texture |
| Column entrance | Left column cue 54 / right column cue 62, background patch pulled away top to bottom over 10f + a 2px accent line on the inner edge growing with the reveal, fading over 24f | The columns are offset in beat from the body text; entering at the same time they would fight for the eye |
| History entry drop-in | 6 entries, cue = 66 + i·5 (placed after the sidebar wipe completes at 64f), each drops over 9f; start −48px, bezier(0.2,1.15,0.3,1) light bounce, in-air shadow `0 12·air px 24·air px` | Entry geometry sits tight below the entries already baked into the texture, with row heights aligned — entries redrawn in the DOM must align strictly with the live entries in the texture |
| Stage | aurora dark field: an accent-colour backlight ring behind the window (page-space translateZ −40, following the window's perspective), a 0 0 0 1.5px bright edge all round + 70px long shadow, a highlight along the top edge; the closing tagline in 84px in two segments (the second in the accent colour), left-aligned to the window's left edge | A warm white paper surface placed in a cool dark field is like a lamp — the stage and window must share one lighting direction, and the backlight must not overpower the paper surface |
| Camera | Hand-written 3D window camera (layout-level CSS zoom, Q2), unrolled frame by frame with a monotonic cubic Hermite spline: f0 zoom 1.42 / rotY −18° / rotX 8° (window top-left corner and stage light in frame together) → f26 1.24 → f64 full window 0.86 → f104 0.74 + rotX 9° + move up 78px (bottom given to the tagline) → f150 0.746 | An opening that is too close (>1.6x) leaves only paper surface in the whole screen, with the dark field and window edges both invisible, reading as the original flat page; at full window both columns must be in frame (Q10) |

## Sound
The write-in section pins keyboard.mp3 trimmed to ~50f (8→57f) to cover the writing section (foley and action strictly equal in length, S4); the history entries' 6 consecutive pops fire every 5f, with volume stepping down 0.40→0.25 to give distance attenuation (S2).

## Known pitfalls
- Mock content must be publication-grade: the product's native typesetting, text filling the page, the sidebar fully in shot (Q10) — a perfunctory "texture + tagline" level document will force the whole shot to be redone
- Data compliance: real customer / member names must never appear in mock content (Q1)
- When the source page is a live data source (collaborative-document type), a full re-capture will wipe out textures that were already finalised — use an incremental script to refresh just a single page and a single key
- The accent colour examples (caret / @-mention / inner-edge line) are amber in the template film; when adapting to a new brand, change them all to the target brand's accent colour

## Reference implementation
demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx (originally template/src/aifl/live/SceneWbr.tsx; for the typing sound effect see the SFX table in template/src/aifl/Main.tsx; the scene this shot carries in the template film is a weekly-report document)
