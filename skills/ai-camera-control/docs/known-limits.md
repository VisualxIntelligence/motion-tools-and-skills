# Known limits

What the method cannot do, what the repo does not contain, and which claims are still UNPROVEN. Counts come from `templates/*/sent.json`, `templates/*/prompts/` and `release-media/`. The gallery in `gallery/` has the 65 original cards; the other 72 of the 137 templates are in `templates/` only.

## What the method cannot do

| Limit | Evidence |
|---|---|
| A frame sheet has no clock: cuts drift about 0.2 to 0.7 s. The video route landed 9 of 9 cuts on one film, the sheet 1 of 9 and 3 of 9. | [why/why-video-first-sheet-second.md](why/why-video-first-sheet-second.md) |
| Some fight scenes are refused by the copyright filter. ACT07 (fight coverage) was blocked on every attempt and has no result. | [seedance-notes.md](seedance-notes.md#filters) |
| A reference video must stay under 29 s in total; the earlier hosted API refused clips it measured as 30.00 s. | [seedance-notes.md](seedance-notes.md#the-3000-s-refusal-earlier-hosted-api) |
| A true 4K of a take you already have is UNPROVEN on Tein (on the earlier hosted API it was not possible). A fresh 4K request is a new take, and there is no seed. | [seedance-notes.md](seedance-notes.md#4k) |
| A repeat run is a new take, also when the prompt is restored word for word. | [stories.md](stories.md) (the reunion extend) |
| The pill has no hands, legs or feet, so those come from the prompt only. | [why/why-limbs-never.md](why/why-limbs-never.md) |
| The model may speak a line twice or drop a word, and starts speech about 1 to 2 s early. | [prompt-anatomy.md](prompt-anatomy.md), [seedance-notes.md](seedance-notes.md#voice) |
| Statues come out as odd stand-in shapes even with no scenery, and the model invents signs and text. | [failures-and-fixes.md](failures-and-fixes.md), [stories.md](stories.md) |
| Voice likeness and lip-sync need a person who listens. The checks measure mouth movement, not sync. | [qa-prompt-and-video.md](qa-prompt-and-video.md) |
| Nothing is sent or spent by this repo. A send needs a yes for that exact request. | [rules.md](rules.md) |

## The 44 templates with no prompt, and why

93 of the 137 templates have prompts (238 files). The other 44 were never sent; the reason is in each `sent.json` (`why_best`).

- **32 of the ANG family** (ANG01 to ANG40, 36 exist, 4 sent): locked-off angles. Locked-off templates (CAM01, CAM26, CAM29, CAM30, CAM46, FAM03 and the ANG family) are kept as camera studies: drafts from them were stiff, so they are not recommended. `engine/cinematic/tools/clip-motion.py` measures 33 of the 36 ANG pill clips below its motion threshold of 8.0; only ANG08, ANG13 and ANG23 are above it, and ANG08 and ANG23 were never sent.
- **CAM26, CAM29, CAM30, CAM46:** locked camera, parked until given real motion.
- **CAM31:** the pin is hidden behind a wall for the first second.
- **CAM33, CAM34:** point of view, no person in frame by design.
- **CAM41:** the pin is too small for acting. **CAM43, CAM44:** drone shots keep the pin tiny.
- **PRD01:** the first render was sent back because the pill was half hidden by the splash.

## The 45 templates with no result video

The 44 above plus ACT07 (blocked by the copyright filter). 92 templates have at least one result video in `release-media/`, and 64 have a main Seedance result (`result.mp4`). The rest have an extra take or a sketch output only.

## Pill clips that are re-renders

A re-render is the rendered pill clip of the same template, because the clip that was uploaded was not kept. 51 sends in 45 templates (`pill.mp4` is not the exact file that was sent; each `sent.json` says so under `provenance`): ACT02 ACT03 ACT04 ACT05 ACT06 ACT08 CAM01 to CAM16 OBJ01 OBJ02 OBJ03 OBJ04 OBJ06 OBJ07 OBJ08 OBJ09 OBJ11 OBJ13 ONE01 ONE02 ONE03 ONE04 SC01 SC02 SC03 SC04 SC05 SC06 SC07 SC09 SC10.

Prompt files: five are not the text that was sent (the clip and references were rebuilt after the send and the sent prompt was not kept): ANG06, ANG07, ANG10, ANG13 and CAM17 (`zoom-in-t2.txt`). Others are recovered copies; `prompt.provenance` in `sent.json` says which. 75 shipped pill clips use the capsule and 62 the pin ([engine.md](engine.md)).

## Motion-check notes

The motion check was run on all 137 registered templates on 7 Nov 2026: 127 are clean and 10 carry notes. A note is a bounding-box contact, a sink below the floor or a foot slide. It is not proof of a visible fault: look at the frames. Rerun with `cd engine/cinematic && STRICT=1 tools/motion.sh` (`ONLY=CAM35` for one template).

| Template | Note | Sent? |
|---|---|---|
| CAM46 | sink 76 cm at 0.1 s | no |
| CAM48 | knee, neck and elbow touch a box at 3.3 to 4.0 s | yes |
| ANG11, ANG12 | elbow, foot, knee and neck touch a box | no |
| ANG24 | foot slide at 0.7 to 1.1 s | no |
| ANG32 | neck, elbow and foot touch a sphere, sink 85 cm | no |
| FAM02 | knee and wrist touch a sphere, sink 74 cm at 7.9 s | yes |
| FAM04 | slide median 163% around 1.5 s (the take-off) | yes |
| STORY03 | wrist inside the fist prop for 10 s | extend only |
| SHOW01 | knee inside the case (box overlap only), three single-frame skates | yes |

Compare the four sent ones (CAM48, FAM02, FAM04, SHOW01) with their results before trusting the move.

## Claims that are still UNPROVEN

| Claim | Test that would settle it |
|---|---|
| An app preset cannot hold the exact move and cuts. | Send one orbit to a preset and to the pill route, measure both ([idea.md](idea.md)). |
| It differs from first/last-frame, image-to-video and Blender. | Run CAM06 through each and measure the camera path. |
| "Coarse blockout" is in Seedance's own documentation. | Read the official page and quote it. |
| A true 4K finalize of a draft works on Tein. | Finalize one 4 s draft at `4k` and read the output size. |
| Tein measures a reference video of 29.3 s as shorter than 30 s. | Send 29.0, 29.3 and 29.5 s clips as 4 s drafts. |
| A camera script that names the rig (a crane, a gimbal) is safe. | Run one shot with and without the rig word. |
| A black facing bar read as a door. | Render one clip with a black facing bar and send it. |
| "Stands still" is harmful in a silent shot with a moving camera. | Send the CAM06 orbit with a breathing sentence instead ([prompt-anatomy.md](prompt-anatomy.md)). |
| A 7 s chain of extends keeps continuity better than one 30 s extend. | Build the reunion as 4 extends of 7 to 8 s and compare ([stories.md](stories.md)). |

Licences and third-party terms are in `NOTICE.md`.
