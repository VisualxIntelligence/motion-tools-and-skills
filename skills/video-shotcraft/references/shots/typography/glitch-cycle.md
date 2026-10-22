---
name: glitch-cycle
summary: One row of monospaced slots cycles through 4 status phrases, each with its head and tail on probability keyframes [1,0,0,0.1,0,0,1] going fully garbled and the middle with occasional single-character jitter, with RGB split and whole-row displacement layered on at the switch instant; the last phrase's probability falls to 0 so the ending is clean
use_when: Status announcements for loading / build / deploy processes; the "system self-narration" in technical openers; a stretch of underlay that needs a machine voice to move time forward
duration: about 5.6s (168f@30fps; in the demo each phrase is 38f, with the last phrase continuing to the end of the film as the closing hold)
energy: Medium-high (continuous high-frequency noise pulses, the switch points are the peaks)
---

## Intent
The clumsiest way to announce status is four lines of text fading in one after another. The cycle compresses them into **one slot**:
the head and tail of a phrase "melt down" and then "solidify" through garbled characters, with the middle almost clean and only occasionally twitching — what the audience reads
is "the system advancing step by step", not four independent pieces of copy. Garble density is the grammar of this card:
dense = switching, thin = settled in this state. A progress bar at the bottom strings the four beats into one timeline,
and the last phrase takes the probability to 0, so settling is the end.

## Motion core
- The slots pre-build `MAXCH` spans sized to the longest phrase (`min-width:0.66em` fixed slot width),
  and shorter phrases are padded symmetrically left and right with spaces (line centred) — **characters are neither added nor removed, only their content changes**, and the whole line never reflows
- Equal time divisions: `slot = floor(frame / SLOT)`, in-phrase progress `p = (frame - slot·SLOT)/SLOT` (demo SLOT=38f;
  the last phrase runs `KF_LAST` on the same 38f and then stays clean until the end of the film, leaving ~28f of closing hold)
- Glitch probability keyframes `KF=[1,0,0,0.1,0,0,1]` are linearly interpolated by p: **1.0 fully garbled at the start,
  0 in the middle, rebounding to 0.1 at about p=0.5 (occasional character twitch), and back to 1.0 at the end to melt into the next phrase**
- The last phrase uses its own `KF_LAST=[1,0,0,0.1,0,0,0]`, with the probability returning to zero at the end → the frame at t=1 is clean
- Per-character decision: only when `rand(i·31 + bucket·17 + slot·97) < g` is a character replaced with one from the glyph pool,
  and hit characters randomly take the accent highlight colour or a dark colour (demo aurora: pink / dark purple); `bucket = floor(frame/2)`,
  i.e. re-rolled every 2 frames
- Whole-row jitter and RGB split intensity are all multiplied by g (values in 480 design coordinates; demo native 1920, phrase 104px): `jx = ±g·10`px
  (demo ±g·36), `jy = ±g·4`px (demo ±g·10), `text-shadow` offset `g·3`px to each of left and right (demo pink / ice-blue each g·10,
  only on when g>0.04) — **one noise-density variable simultaneously drives character swapping, displacement and chromatic dispersion**, so the three never fight; when g>0.25 the same g
  additionally drives a horizontal tear band (the row is cut into three segments, the middle one shifted sideways, band height re-rolled every 2 frames), and when g>0.45 it layers on 3 pixel-block afterimages
- Demo layout: a status line above (pulse dot + RENDERING · project name · render number), thin brackets at the four corners of the slot, a 1100px progress track below
  running linearly to full (laid down independently of the four beats, with three four-beat ticks + a glowing head) + `STEP n/4` / percentage (tabular-nums);
  when the last phrase settles clean it gets one soft bloom (given to the lead just once), and once the progress is full the status turns to RENDERED, the dot turns solid, and then a line of accent-colour credit rises (video-shotcraft logo + brand name)

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| Phrase list | 4 phrases, the longest 17 characters (demo `LOCKING BEAT GRID`) | 42f per phrase is the lower limit for "long enough to read one state"; with 5 or more, if a single phrase gets under 34f the audience only sees flashing |
| Probability keyframes | `[1,0,0,0.1,0,0,1]` (6 segments) | The 0.1 in the middle is the proof of being "alive", delete it and the middle of the phrase is rigid; raise the 0 segments to 0.3+ and the whole film smears into a glitch |
| Re-roll frequency | every 2 frames (`floor(frame/2)`) | Changing every frame smears into a grey band; at 4 frames or more the garble is legible as "another word" and does not look like noise |
| Jitter amplitude | `x ±g·10` / `y ±g·4`px (480 coordinates; 1920 native about ×3.6) | x larger than y is the key to horizontal tearing (proportional jitter reads as an earthquake); beyond ~2 glyph widths the whole row jumps out of the slot |
| RGB split | red left and cyan right each `g·3`px, threshold g>0.04 | This is the identity card of "electronic glitch"; with no threshold, the 0.1 probability in the middle would leave the text with fuzzy edges all the time |
| Slot font | SF Mono 26px (480 coordinates; demo native 104px), slot `0.64–0.66em` | Monospace + fixed slot width is mandatory; 3px letter-spacing gives the garble room to breathe, crammed together it reads as a garbled block |
| Progress bar | 150×2px (demo native 1100×4px), accent-colour gradient fill, linear + four-beat ticks | The only linear element, giving the four beats of noise a stable reference; delete it and the cycle does not read as "advancing" |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- **When swapping in project copy, the four phrases should be close in character count (demo 12–17 characters)**: the number of slots is built once
  to the longest phrase, and short phrases are padded with spaces on the right — if one has only 4 characters and another 30,
  the short one sits alone at the left of 30 cells, the row width is propped up by the longest throughout, and the rhythm reads as drifting
- The probability keyframes are mapped as 6 equal segments onto in-phrase progress: when the number of phrases changes each phrase's duration changes with it,
  but the keyframe shape does not — so the more phrases there are, the shorter the absolute duration of the two "fully garbled" segments,
  and the weaker the switching feel; beyond 5 phrases, widen the 1.0 segments at the head and tail
- The last phrase must use `KF_LAST` (ending at 0): using the ordinary KF leaves t=1 stopped on full garble,
  which reads as not finished rendering when joined to the next shot
- Dark ground only: dark ground + cool / vivid-colour noise is the foundation of the whole colour scheme (the demo uses aurora deep purple-black + pink / ice-blue split), and on a light ground the RGB split
  is almost invisible; sound is also heavily relied upon — the four switch points are naturally four rhythm points, and real use must pair them with
  electronic glitch / switch sounds;
  for the scoring discipline see sound-design.md (same sound for the same kind of element, with twin samples alternating on rapid fire to avoid a machine-gun feel)

## Reference implementation
demos/typography/glitch-cycle/
(GlitchCycle.tsx)
