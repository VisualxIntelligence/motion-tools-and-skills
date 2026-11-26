# Why the place is written in words

The reference video says where things are and when the camera moves. The words say what the place is and how it looks. The more specific a picture of the place is, the more of its limits Seedance copies. So the recipe for a new shot is: the place in words only, the face photo, the voice where the person speaks, and the framing measured from the clip. The camera itself still comes from the clip and from a camera script built from the template's own numbers.

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`.

## The test that decided it

The first 24-environment drafts sent the 4-panel environment sheet as `@image2`. Seedance copied the layout and the grey cubes and pushed the person against the walls: in the first send the person stood inside the table. The same two comparisons were made for the dust arc (CAM25), the pan reveal and the barrel roll: the first send with the 4-up sheet (prompt 6,269 characters) and a words-only send (prompt 10,399 characters). The three words-only drafts came back as intended (measured on the author's runs, not included).

The rule after the test: in the prompt, the image is a reference of the mood only. It does not have to copy the exact environment.

## Freehand words that contradict the clip

The "inside the table" cause was not only the picture. Hand-written shot sizes and positions that the clip contradicted ("medium shot", "a bench between us") made it worse. The fix was to measure the pill in the clip, second by second, and write the numbers into the prompt, instead of writing a shot size by hand (`framing_text()` in `tools/seedance/prompt_lib.py`, printed alone with `python3 tools/seedance/build_env24.py --template <ID> --scene <scene.json> --framing-only`): it reads the red pixels of the pill, its height, its width, its centre and where the frame cuts it off, and says which part of the body is in the frame. The heading it writes tells Seedance to copy these numbers closely, not to re-centre the person and not to pull the shot wider.

## One mood panel is a per-shot choice

A single panel from the environment sheet, described as a mood reference only ("never a map"), helped in some shots and hurt in others. Seconds of the clip whose framing matched the blockout, prompt-only against one mood panel (measured on the author's runs, not included):

| Shot | Prompt only | One mood panel |
|---|---|---|
| hospital corridor | 4 of 6 | 6 of 6 |
| café | 5 of 5 | 3 of 5 |
| shower | 0 of 4 | 4 of 4 |
| street run | 1 of 5 | 0 of 5 |
| plaza drone dive | 0 of 2 | 0 of 2 |
| parking orbit | 4 of 8 | 2 of 8 |

Added up from these rows: 14 of 30 seconds for prompt only, 15 of 30 for the mood panel. There is no overall winner. The mood panel copied grey cubes in the dust arc and pushed the person into the wall in the pan reveal. It gave a closer, richer frame in the shower and the hospital. The choice was made pair by pair, so every later batch sent each shot as a fair pair: the identical prompt, with and without one mood panel (the first pairs differed in more than the panel, which made the comparison unfair).

So the claim is narrower than "words beat a picture": a 4-panel sheet is out, words-only is the default and one mood panel is an option you try per shot.

## What the words do not replace

A lean prompt was tried first, because the blockout is meant to carry the camera: prompts went from 1,200 to 2,300 words down to about 400. Then the drafts stopped matching the blockout, and the earlier gallery format, which had followed it closely, was brought back.

The working format is "lean plus gallery layout" (`docs/prompt-anatomy.md`): short flowing acting, a camera script written from each template's own numbers (lens feel, rise in metres, speed in m/s, distance), and the full protective paragraphs. The words own the place and the look, and the numbers from the template own the camera.

## Why the words took longer than the 3D

Most of the work on a film went into writing and fixing prompts. After that came reading frames to check the results, then waiting on Seedance, and the 3D came last. One 30 second prompt was about 1,800 words, against about 800 for each of the two prompts that worked best. Reusing the wording of a liked prompt did not reproduce its take, because there is no seed.

## The same split on the 30 second film

In the Handoff the previs showed a stone plaza and the prompt said downtown square at dusk after rain. The columns came back as concrete pillars under an elevated highway, the block as a planter and the ground as wet asphalt. The background did not look like a city because the previs is stand-ins only. The film is `release-media/SHOW01-TheHandoff/result.mp4`, the scene in `templates/SHOW01-TheHandoff/`.

## When your case differs

- **The exact layout matters** (a particular room, a real location). A mood panel with matching framing helped: shower 4 of 4 and hospital 6 of 6. Use it as one panel and say it is a mood reference.
- **You want the model to follow the camera closely.** Do not shorten the camera script. Keep the template numbers in it.
- **A scene photo instead of a mood panel.** UNPROVEN, never tested.
- **Another model.** UNPROVEN. Everything above was measured on Seedance 2.5.
