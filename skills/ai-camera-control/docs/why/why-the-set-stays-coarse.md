# Why the set stays coarse and colourless

Seedance copies whatever detail it can see. A detailed grey set comes back as a detailed grey set, so the blockout is a coarse, colourless layout, drawn sheets carry no scenery, and the place, the light and the materials are written in words.

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`.

## What came back when the set had detail

All of these are the ACT01 jump on the plaza set (`release-media/ACT01-BulletTimeOrbit/`). Frames of each clip were checked.

| What was sent | File | What came back |
|---|---|---|
| 12 clay frames, plain | `looks/clay-E-sheet12-out.mp4` | cone pines and a board-game plaza |
| the same frames with shadows and a chequered floor | `sketch-cam-sheet.mp4` | cone pines, a chequered floor and chequered column bases |
| the same frames, prompt calls the sheet "a layout diagram" | `sketch-opt-sheet.mp4` | still cones (from the run record; frames not re-checked here) |
| the set blurred, capsule kept sharp | `sketch-blur-sheet.mp4` | the cones went away, real cypresses and stone columns came back |
| an ink drawing with the trees drawn in | `ink-sketch-ink2-act01.mp4` | neat cone pines and round topiary: it looked like a game |
| an ink drawing with no trees, only the ground, the columns and the block | `ink-sketch-ink3-act01.mp4` | cypresses, oaks and a real plaza |

The blurred set is the run that explains the rule: the model copies whatever detail it can see in the background, so the less the picture shows, the better the result. Tracking marks and shadows made the leak worse.

In code, trees, rocks, bushes, lamps and benches are tagged `dressing` and left out of drawn sheets. Ground, the structures the action uses (columns, the block the person jumps from, shelves) and the pills stay (`tools/seedance/drawn_batch.py`). The video previs got the same switch, `--no-scenery`, after object shots leaked: OBJ10 crash zoom came back with a ball-and-bar statue and cone trees, OBJ12 flyby pan with cone trees and a toy ship.

## It is not only sheets

A video reference leaks too, when no person fills the frame.

- First capsule roll-out, ACT01 bullet time: the plaza came back as a toy set with cone pines and ball trees. SC08 heist: a guard's striped capsule showed in the warehouse and a jacket took the capsule's magenta stripes.
- Explosion walk (FAM02): Seedance copied the smooth lobes of the clay fireball and the clay look of cars and cranes. Three fixes in order: a reference with no debris (`--no-scenery`), flat coloured blocks for things that must fly or stand (orange block for a dark-green saloon, cyan blocks for oil drums, green blocks for crates, purple block for a pickup) and film light in the prompt (low orange sun, amber dust haze, anamorphic flares, grain). Files: `release-media/FAM02-ExplosionWalk/video-t-explosion-nodebris.mp4` and `video-t-explosion-blocks.mp4`. The idea behind the blocks: instead of building car shapes, create placeholders and describe them in the prompt.
- Product films: a grey studio came back grey. Describing every set piece as a real object with colour and material fixed it (`release-media/PRD02-RobotArmSnap/result.mp4`).
- Statues still come out as odd stand-in shapes (ball head, bar arm) in OBJ03, OBJ08, OBJ10, OBJ14 and ONE01. This was never fixed. A better stand-in model or an approved statue image was not tried.

## The three realism lines

Every prompt carries three lines (`engine/cinematic/tools/seedance-realism.py`):

1. **Rebuild the set.** "rebuild every tree, wall, building, column, vehicle and prop as a real, fully detailed object of the same size in the same place... No cone, sphere, plain box or untextured surface appears in the final video." Added because cone pines and ball trees came back.
2. **Capsule colours are labels.** "no clothing, skin, prop or surface takes those colours or stripes, and no striped capsule appears at any moment, even far in the background or through a doorway." Added because the SC08 heist showed a stray capsule and stripes on a jacket.
3. **Cinematic look.** Large-format digital cinema camera, film grain, shallow depth of field, haze, motivated light. Added because flat overcast light made the explosion look like a 3D game. After the film-light prompt the explosion was a big step up.

With these lines the ACT01 and SC08 re-tests came back clean. The rule: the output is always a hyper-realistic cinematic render, never the clay environment.

## No mood light in the blockout

The 24-environment set is rendered as coarse grey clay with plain white window and lamp shapes. No coloured light, halo, beam or grade (`MOOD_LIGHT = false` in `engine/cinematic/src/templates/locations.ts`). Coloured light and thick cut-in shapes made the blockout read as a finished set, and it must read as a blockout. The mood comes from the prompt, and optionally from one mood panel (`docs/why/why-words-beat-a-specific-video.md`). Rooms have no ceiling, so overhead, crane and drone moves can see in. Big moves go to open places (plaza, coast, rooftop, street). An orbit walk went to a big parking structure because a 4 m orbit would clip the pink hotel corridor.

## When your case differs

- **You want a stylised or game look.** Then detail in the reference is a feature. All tests here were for photoreal output.
- **Statues and other hero objects.** A coarse stand-in did not work. Provide a reference image of the real object. UNPROVEN: an approved statue image was proposed and never tested.
- **A scene photo as a cure for leaks.** UNPROVEN. The roll-out prompts dropped the scene photos the first gallery prompts had, and leaks followed, but nobody re-added them as a test. A test: ACT01 with the capsule video, once with and once without a scene photo.
- **Your own place.** If the layout of the real place matters (a hospital corridor), a mood panel that shows the same framing helped in 2 of 6 measured shots (`docs/why/why-words-beat-a-specific-video.md`).
