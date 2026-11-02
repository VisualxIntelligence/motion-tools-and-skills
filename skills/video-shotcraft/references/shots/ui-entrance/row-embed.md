---
name: row-embed
summary: Content rows descend from the air like cards, flatten out via rotateX, and at the instant of embedding a seam of accent colour lights up on the bottom edge
use_when: Detail-page / list shots of "structured data growing into the page"; batch entrances of row-level content
duration: about 2s (12-68f)
energy: Medium
---

## Intent
The rows of a detail page are not "displayed" but "grown into" - each row descends from the air and embeds flush into the page layout, and the accent-colour seam at the instant of embedding is the visual foley of a "click" snapping shut.

## Motion core
- Rows fly in one by one from above on a beat that gets faster and faster (the final segment slams into the slot with velocity + vertical motion blur), flattening from a raised rotateX angle, with scale overshooting slightly and then a press rebound
- The row position is first covered by a patch of the page's real background colour + a very faint dashed slot frame as a placeholder, and after landing the patch disappears to let the texture show through; the slot's contact shadow tightens and solidifies as the row approaches
- At the instant of embedding a 2px accent-colour seam on the row's bottom edge unfolds from the centre to both sides and then fades out
- At the same time the camera tilts slowly down with a slight push-in, the row rain and camera move running in parallel; the framing is filled by the page throughout

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Beat | cue = 12/22/31/39/46 (interval decreasing 10→7), flight 12f, the last row lands at 58f, the accent-colour seam closes out at 66f ≤ the shot's 68f budget | First work out "when does the last row land" and then set the cue intervals - beat × row count must fit the budget (the same core arithmetic as the document-typewriter-reveal card) |
| Flight pose | `perspective(900px) translateY(−120·air) rotateX(16°·air)`, progress easing bezier(.5,0,.8,.75) (still with speed at the end), scale 1.06→0.995 then a 4f press-bounce back to 1 | The rotateX flattening is the key read of "embedding"; a purely vertical drop reads as a sticker |
| Flying body | backgroundImage takes the full-page screenshot, with a negative backgroundPosition offset cropping out that row | Texture crops do not redraw the content (Q1) - a redrawn row differs from the page's font rendering visibly to the naked eye |
| Empty-slot patch | The row position is first covered by a patch of the page's real background colour #f9f6f1 (sampled pixel by pixel; anything whiter reads as a whole white board) + a 20% dashed slot frame, disappearing 2f after landing | Without the patch, the row baked into the texture shows through first, and the fly-in turns into "ghosting" |
| Embed flash | A 2px accent-colour seam on the bottom edge (both ends feathered) unfolds from the centre to both sides over 5f (Easing.out cubic) and fades out over 8f, with a 7px glow | The seam is only on the bottom edge and flashes only once; flashing on all four edges reads as a selection box |
| Camera | cy 500→740, zoom 1.12→1.25, a slow downward tilt + slight push over 68f | The camera move in parallel with the row rain creates the feeling of "growing as you watch"; if the camera waits until the rows have landed, the shot drags; at both the start and end the page must fill the frame, and showing beyond the top/bottom of the page is a blank dead zone |

## Sound
Pin the segment cut-in to transition-soft (the template film pins it at f475); do not score the rows landing one by one - with many rows at even intervals, a pop for each would turn machine-gun, and the accent-colour seam on screen serves as the "visual foley" (S2 counter self-check).

## Known pitfalls
- The fly-in end point must be a real slot in the page layout, embedding as soon as it lands (Q9) - what is wanted is "fly in from the air, embed into the dashboard"; hovering above without landing looks fake
- Light effects such as the accent-colour seam must be clipped inside the carrying element's rounded-corner boundary (Q4 precedent); light spilling over the rounded corners is a typical source of a cheap feel

## Reference implementation
demos/ui-entrance/row-embed/RowEmbed.tsx (originally template/src/aifl/live/SceneDetail.tsx)
