> Note: Rootsong and Etherwake were the two first test films made with this engine. They are not in this repo. The lessons below came from their stills and still hold.

# What the first two previs films taught

Read from every still of Rootsong (11 shots, 60 s, 2.39:1) and Etherwake v1 to v3 (28 shots, 82.5 s, 16:9, 95 reference frames), and from the user's own corrections. Each line is a rule for the next film.

## What the user corrected

- **Clay, not colour.** Etherwake's amber, violet and teal world was too colourful. The look is a Blender clay render: matte grey and off-white, soft studio light, a colourless environment, and at most one muted tint per character or hero prop so they can be told apart.
- **Placeholders don't act.** No mouths, jaws, eyes or expressions. The film is about camera angles, zooms and placement. Dialogue scenes are told by coverage and blocking, not lip-sync.
- **Real research first.** Camera and cut decisions follow `rulebook.md`, not instinct.
- **Reference frames are a product.** The user asked for every main frame, a contact sheet and a callout naming each character. Plan for that output from the start.

## What the stills showed: framing faults

- **Heads cut by the frame edge.** Rootsong SH04 (85 mm push-in) and SH10 (70 mm push-in) crop the head at the top while the arm and tool fill the frame. A close shot is framed on the head, with the eyes on the upper third, never on the action prop.
- **The over-the-shoulder foreground swallows the frame.** Rootsong SH05 gives the giant's body about 60% of the frame, and Etherwake SH04 gives the hat and head about 45%. The rulebook's limit is a quarter to a third.
- **Subjects lost at the frame edge.** Rootsong SH08 has the hero tiny and cut by the bottom edge while a creature takes the centre. Every frame has one point of interest, and it sits inside the safe area.
- **Wides with no point of interest.** Rootsong SH09 (24 mm orbit) scatters three small figures with nothing leading the eye. A wide still needs one subject the eye lands on first.
- **Unreadable inserts.** Etherwake SH12 ("boots on the board") is brown blocks, and SH24 ("deck POV near miss") is an almost empty dark frame. An insert fills the frame with the one object the viewer must read.
- **Actions shown from behind.** Etherwake SH13 shows "goggles down" from the back of the head, so the action can't be read. Shoot an action from the side that shows it.
- **Effects that bury the subject.** In Etherwake SH19, bloom and flare wash out the figure, and in SH20 and SH23 the rock walls bury the subject. Glow and set dressing never sit brighter or bigger than the subject.
- **Clutter behind the subject.** Large cloud blobs fill most Etherwake backgrounds. Clay sets stay simple behind a face.
- **The HUD over the picture.** The camera report box sits on the lower-right third, where subjects often stand (Etherwake SH13 and SH19). Burn the camera data into the letterbox bars, never over the image.

## What worked

- The Rootsong wides (SH01, SH06, SH11) read at a glance: clay materials, depth in layers, a single small figure for scale.
- Etherwake's coverage grammar (a wide three-shot, then OTS, then singles, then a push-in on the key line, then reactions) gave the scene its shape. Keep that grammar without the faces.
- A camera report computed from the rendering camera (rig, lens, focus, framing, move) makes every frame something a crew could shoot. Keep it, but outside the picture.
- `tools/frame-check.ts` finds each subject's position on screen, and anything blocking it, without rendering. It is the cheapest check there is.

## What made it slow

- **Three full renders of Etherwake** (v1, v2, v3), each about 82 s at 60 fps. Most of the fixes between versions were framing and look faults that one still per shot would have shown.
- **60 fps** for a previs doubles every render and every check. Render previs at 24 fps with a 180° shutter, as the rulebook says.
- **Look changes after the film was built.** The colour grade and the talking faces were decided before the user saw a still. Lock the look on one still before building shots.
- **A full disk.** Renders and temp files filled both disks more than once. Render to the external volume and delete superseded versions as soon as the new one is checked.
- **About 3 s per still**, with 95 stills in 5 minutes. That's fast enough, so take stills generously. They are where the time is saved.
