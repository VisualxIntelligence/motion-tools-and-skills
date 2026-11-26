# Why the stand-in is a striped pill

Every person and every product in the 3D reference clip is a tall striped pill with a white dot at eye height on the side it faces. The pill tells the video model where the subject stands, how big it is and which way it faces, and it has no body, so there is no body motion to copy.

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`. The stand-ins (capsule, pin, product pill) are defined once in `docs/engine.md`, section 11.

## The model sentence

A reference video carries two things: where the camera goes, and how the bodies move. Seedance copies both. So to make it follow your camera you give it a camera to follow and nobody to copy. The pill is the something that marks the spot and the direction but has no walk in it.

## What was tried before it

The same 16 second alley fight (SC07) was sent six ways, all as 480p drafts at 2,332.8 credits each (measured on the author's runs, not included). Clips are in `release-media/SC07-AlleyFight/`.

| Rung | What the video showed | File | What came back |
|---|---|---|---|
| 1 | clay mannequins | `looks/clay-A-video-out.mp4` | right camera, right cuts, bodies fight like game characters |
| 2 | clay mannequins and a face photo | not included | the face is right, the punches still move like the grey figures |
| 3 | fighters drawn as pencil outlines | `looks/pencil-V2-out.mp4` | real alley, right face, still a mannequin fight |
| 4 | empty set, camera only | `looks/plate-VP-out.mp4` | the most natural movement, people in the wrong places |
| 5 | soft grey ghost silhouettes | `looks/ghost-VG-out.mp4` | right places and facing, original motion still preserved |
| 6 | striped pills with a white dot | `looks/boxes-VB-out.mp4` | real alley, real punches, right places, same six shots |

The clay result came back robotic because the original three.js figures are robotic, and the video carries that into the result. The full ladder with each rung's reason is in `docs/failure-ladder.md`.

## How the shape was decided

Four steps, each answering a fault in the last version:

1. Instead of a human subject, a big proportional box as a placeholder for the subject's placement, with no hands.
2. Absurd colours (red, yellow, green) so it stands out.
3. A pattern, so it cannot be mistaken for the set's own boxes.
4. A more unique shape than a box, so it does not contradict other boxes.

Between 3 and 4 the render also had a black facing bar, which was an unexplained mark. It was replaced by a white dot.

Why each part exists:

- **Pill shape.** No set object is a pill, so nothing in the set can be confused with it (crates and blocks are boxes).
- **Loud colour and diagonal stripes.** Nothing in a set looks like it, and the colour names the person in the prompt. The stripes are a 64 px texture of diagonal bands, 16 px colour and 16 px near-black `#141414` (`engine/cinematic/src/standins.ts`).
- **White dot at eye height.** It shows which way the subject faces and where the eyes are. In a result the dot was never copied: no stripes, capsule shapes or white dots appeared in the CAM06 and SC07 results (`release-media/CAM06-Orbit/looks/boxes-VB-out.mp4`, `release-media/SC07-AlleyFight/looks/boxes-VB-out.mp4`).
- **One fixed colour pair per tint**, so a prompt can name a person from the tint alone: red-and-black (`#e3261f`), yellow-and-black (`#ffe600`), green (`#1fa84a`), blue (`#1f5fe3`), magenta (`#d81fb5`), orange (`#ff7a00`), cyan (`#00c8d7`). Alex, Kit and Vic are red; Sam, Rook and Brick are yellow.
- **Products use the same pill**, 24 cm tall and 12 cm across, with the dot at 62 percent of its height, magenta by default (`engine/cinematic/src/kit/pill.ts`). A person-sized pill is 1.75 m tall with the dot at 0.925 of its height, about 1.62 m (`engine/cinematic/src/kit/actors.ts`, `PROP_EYE`).

## What confirmed it

- CAM06 orbit and SC07 alley fight were the first two capsule runs, and both came back as intended.
- ACT05 parkour, SC06 rooftop chase and SC10 car crash were then built on capsules with no earlier test. All three came back photoreal with no capsule and no clay figure showing, for about 6,100 credits together (`release-media/ACT05-ParkourTrack/result.mp4` and the SC06 and SC10 results).
- All 54 first templates were rendered with capsules. 53 of 54 passed (measured on the author's runs, not included). The one that did not, ACT07 fight coverage, was blocked by the copyright filter on every attempt (`templates/ACT07-FightCoverage/README.md`).
- On the 30 second Handoff film the capsule video held 9 of 9 cuts to the frame (measured on the author's runs, not included; the result is `release-media/SHOW01-TheHandoff/result.mp4`).

## What it still needs from the prompt

The pill does not remove the leaks by itself. Without three lines in every prompt the first capsule tests copied cone pines and ball trees, showed a stray striped capsule in a warehouse and put a capsule's magenta stripes on a jacket. The lines are in `engine/cinematic/tools/seedance-realism.py`:

- Rebuild every placeholder as a real object ("No cone, sphere, plain box or untextured surface appears in the final video").
- The capsules' stripes are only labels, and no capsule appears at any moment.
- Photoreal cinematic look.

## When your case differs

- **You only need the camera and do not care where the subject stands.** The empty plate (rung 4) gave the most natural movement. Use it.
- **You need the real body motion of your previs.** The pill removes it. A mannequin keeps it and the result copies its stiffness.
- **Many characters.** Seven colours are defined. Three striped pills held apart in tests (heist, trunk shot). Beyond three is UNPROVEN. A test would be one scene with five distinct pills and a count of how many results keep each identity.
- **A model other than Seedance 2.5.** The reasoning (mark the spot, give nothing to copy) is general. The stripe and dot design was only tested on Seedance 2.5.
- **The pill reads as too big.** The first fitted capsule was up to 0.9 m across and Seedance read it as a giant dome. It was slimmed to the pin (see `docs/variants.md`).
