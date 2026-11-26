# Frame QA: check every still before any film render

There are two passes. The measured pass runs on numbers from the scene without rendering. The eye pass runs on the rendered stills. A frame that fails either pass is fixed in the shot and taken again. A full render starts only when every planned still passes.

## Measured pass (no render, from the scene and camera)

Project each subject's head, feet and key points through the shot camera at the in, middle and out time of every shot. In engine/cinematic, `tools/frame-check.ts` already projects subjects and finds what blocks them. Extend it with the checks below rather than eyeballing.

| Check | Pass when | Source |
|---|---|---|
| On screen | the point of interest is inside the 90% action-safe area | broadcast safe areas |
| Not blocked | no mesh between the lens and the subject's head, except a deliberate OTS shoulder | frame-check raycast |
| Headroom | on MS to CU, the eyes or head-centre sit within ±5% of frame height of the upper-third line | rulebook §1 |
| No joint crop | the frame edge does not fall within 4% of frame height of a neck, elbow, wrist, waist, knee or ankle | rulebook §1 |
| Shot size matches the plan | the subject's height share is in band: EWS under 10%, WS 40–70%, FS 75–90%, MS (waist) about 1.7× FS scale, CU (head and shoulders) | rulebook table |
| Lead room | the subject sits on the third opposite its facing, unless the shot is flagged short-sided | rulebook §1 |
| OTS shoulder | the foreground shoulder covers 20–33% of frame width, and the far subject's head is not covered | rulebook §1 |
| Reverse match | paired reverse singles match lens, distance and angle off the line, with head sizes within 10% | rulebook §2 |
| Camera distance on faces | at least 1.5 m from a head for any CU or MCU | rulebook §2 |
| Axis | consecutive cameras in a scene sit on the same side of the line between the engaged pair (cross-product sign), unless flagged | rulebook §4 |
| 30° rule | consecutive shots of the same subject differ by at least 30° in angle, or by two named sizes | rulebook §4 |
| Pan speed | pan or tilt rate stays at or under the frame width ÷ 7 per second (35 mm at about 5.6°/s), except a flagged whip | rulebook §3 |
| One axis | one primary move axis per shot, any second axis at 10–30% of it | rulebook §3 |
| Hold | each move starts and ends on a composed frame held 0.5–1 s | rulebook §3 |
| Shot length | at or above the readability floor: CU 12–18 frames, MS action 18–24, WS 36–48 at 24 fps | rulebook §4 |

## Eye pass (on the rendered stills)

Lay out a contact sheet of one still per shot in story order, then a second sheet with in, middle and out per shot. Look at each frame and answer:

1. **Where does the eye land first?** If it isn't the subject of the beat, the frame fails.
2. **Can the action be read with the sound off?** An action shot from behind, an insert that is only shapes, or a frame that is mostly empty fails.
3. **Is it clay?** The environment is grey or off-white with no saturated colour. Each subject has at most one muted tint. Emissive light is white or near white.
4. **Is anything brighter or bigger than the subject?** Bloom, flare, rocks and clouds all stay below the subject.
5. **Is the background simple behind the head?** It needs one clean shape behind a face, not a blob field.
6. **Does the sequence go wide, then close, then wide?** Read the one-per-shot sheet left to right. Scene openings are wide, the turn is the closest, and the release is wide and still.
7. **Does the HUD or slate cover the picture?** All burned-in data goes in the letterbox bars.
8. **Does each frame have one moving layer?** Since figures don't act, dust, wind, smoke or light movement carries life. Check this on the middle frames of held shots.

## Render order

1. One look still: the hero in the main set, a medium shot. The user approves the look here.
2. A frame-check table for every shot (in, middle, out). Fix every fail.
3. Stills of every shot (in, middle, out) and the two contact sheets. Run the eye pass and fix.
4. Show the user the one-per-shot sheet. This is the approval point.
5. Draft film at 24 fps, half resolution, for timing. Check pacing and cuts.
6. Final film at full resolution. Check with ffprobe, sample frames, and confirm no frozen frames at the joins.
