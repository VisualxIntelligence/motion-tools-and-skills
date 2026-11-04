# Storyboard, blocking and the beat grid

Write these before any drawing code. They are data in the page (`BPM`, `SECTIONS`, `SHOTS`, `EVENTS`, blocking constants), not notes: the scenes, the camera and the soundtrack all read them, so picture and sound land together by construction.

The starter already has the skeleton. This is a self-check step: don't stop to ask the user to approve the storyboard. Deliver it with the film (e.g. as `storyboard.md`) so they can point at a shot to change.

## 1. Beat grid

- Pick a tempo from the mood of this film. `b(n)` is the n-th beat in seconds.
- Pick a shape for the sections that fits the piece, for example:
  - **escalation**: intro, build, peak, break, payoff (comedy, reveals)
  - **steady**: one texture that breathes and evolves, no drop (ambient, lullaby, poem)
  - **steps**: a short motif per step, a pause between steps, a resolve at the end (explainers)
  - **verse/return**: a theme, a contrast, the theme again (stories)
  A short silence before a payoff is a strong beat when the piece has one; a lullaby may never need it.
- Every cut and every visible action sits on a beat or a half beat.

## 2. Shot list

One row per shot. Pick the pace from the form:

| Form | Typical shot length |
|---|---|
| Comedy, hype | 1-3 s |
| Story | 2-5 s |
| Explainer | 3-6 s (one idea per shot) |
| Lullaby, ambient, poem | 5-10 s, long dissolves |

A long shot is fine; a long shot where nothing is alive is not.

| # | from–to (beats) | framing | camera move | what happens (the action) | blocking | action lands on | sound | transition |
|---|---|---|---|---|---|---|---|---|
| 4 | 12–16 | close-up | slow push | the kettle starts to whistle and the lid rattles | kettle centre-left; steam rises out of frame top right | beats 13, 14 (rattles), 15 (whistle) | tick, tick, whistle | match cut on the steam |

- **Vary framing**: wide, medium, close, extreme close. Scale changes are what makes a short feel cinematic.
- **Keep every shot alive**: a slow push or drift on the camera, or at least one secondary motion (smoke, breathing, light changing), at whatever pace the form wants.
- **Vary transitions**: hard cut, match cut, push into / pull out of an object (a screen, a window, an eye). Save the dip-to-paper for chapter breaks.

## 3. Blocking: one world, many cameras

This is how a story or an explainer holds together. A film that is neither (a title sequence, a film of type, a showreel) holds together by rhythm and one visual idea, and may cut between worlds; its blocking is per world.

- Put every character and prop in **one continuous world** with a track over global time (where it is, its pose, its expression). Shots are only cameras looking at that world (`withCamera`). A cut then can't break continuity: the end of one shot is literally the start of the next.
- Continuity rules the world model doesn't give you for free:
  - **Carry something over every cut**: the same object crosses the cut, or the camera pushes into a detail that becomes the next scene.
  - **Screen direction**: something moving right keeps moving right across a cut.
  - **Props, light and time of day persist**: what's in a hand stays in the hand; night doesn't become day without a transition. Share the sky between a window in the room and the world outside.
- **Staging that reads as real**: things rest on surfaces (a monitor on a desk, with a stand), people have feet on the floor, objects don't hover unless that's the joke. Someone at a computer reads best over the shoulder, with the screen facing the camera.

## 4. Story logic

- **Every beat is caused by the previous one.** "Does A, then notices B" is flat; "doing A causes B" is a chain the audience feels. Escalation should be causal.
- **Show the metaphor in the picture.** If an object stands for an idea, draw the idea onto it, visibly. A label next to an unexplained picture doesn't land.
- **Punchlines get their own shot**: a reveal (what happened), then a reverse shot of the reaction (the face). Cut between them on a beat.

## 5. Events

`EVENTS` lists every visible action with a sound: `[[seconds, 'soundName', arg], ...]`. The scenes trigger the action at the same time; the score (soundtrack skill) plays its sound. One list, two readers.

## 6. Check the picture against the storyboard

After the first render, take a still at the action beat of every shot (`render.mjs page.html shot --stills ...`) and read it against its row: is the actor where the blocking says, doing what the row says, and can you tell what just happened? Most "the video doesn't match the script" problems are blocking that was never written into the tracks.
