# Prompt anatomy

How the prompts that went to Seedance 2.5 are built, block by block, and why each part is there. Every sentence in this page comes from a prompt that was sent (`templates/<ID>/prompts/`), from the builders that write them (`tools/seedance/gallery_v4.py`, `tools/seedance/lean_v3.py`, `tools/seedance/build_env24.py`) or from a result that was checked. Where a claim has no test behind it, the page says UNPROVEN and names the test.

## What the prompt is for

The reference video says where the camera goes, how big the person is in the frame, which way they face and when things happen. The prompt says what everything really is and how it looks. The more specific the reference is about looks, the more of its looks Seedance copies, so the reference stays coarse and the words carry the world.

In one sentence: the pill clip decides camera, framing, timing and where the person stands; the text decides everything else.

## Block order

All gallery-format prompts use the same five blocks, in this order. A speaking shot adds a sixth block near the top.

| Order | Block | What goes in it |
|---|---|---|
| 1 | `【Generation Goal】` | One or two sentences. "Generate a live-action shot in one take." Then the place, the person, and what the moment is about. |
| 2 | `【Dialogue, exact words】` | Only when someone speaks. Each line with its shot and time, the statement that the film holds exactly these lines and no other words. |
| 3 | `【Reference Asset Roles】` | One paragraph per reference: what `@video1` is for, rebuild the set, stripes are labels, `@image1` is the face only, and optionally `@image2` (mood) and `@audio1` (voice). |
| 4 | `【Subjects and Relationships】` | Which stand-in is which person or object, what the person wears, and the place in colours, materials, light and haze. |
| 5 | `【Camera and Event Script】` | The camera paragraph written from the template's own numbers, then the performance, then the human-motion line, the sound line and the look line. |
| 6 | `【Maintain Consistency】` | What must not change: face, clothing, place, light, camera move, size and position of the person. |

The builder puts the dialogue block before the roles (`tools/seedance/gallery_v4.py`). The Handoff prompt puts it after the roles (`templates/SHOW01-TheHandoff/prompts/video-v3.txt`). Both orders returned the lines word for word, so the rule is "near the top", not "first".

The 238 prompt files in `templates/*/prompts/` run from 384 to 3,220 words (whitespace split), median about 990. The two liked dust prompts were 769 and 820 words.

## Locked sentences

These are the constants in `tools/seedance/gallery_v4.py`. The QA gate `tools/seedance/qa4.py` fails a prompt that lacks four of them: "rebuild every wall", "No cone, sphere, plain box", "only a label" and "Never show a capsule".

**Role of the reference video (`ROLE_SHOT`).**

> @video1 is a coarse-blockout reference: a grey clay set in which the person is replaced by a tall rounded capsule with loud diagonal stripes, as tall as he is, standing exactly where he stands, with a round white dot on the side he faces, at eye height. Use it for the camera: positions, movements, lens feel, framing, shot size and their timing, and for where the person stands, how large he is in the frame and which way he faces. The capsule carries no body or pose, so every pose, gesture and expression comes from this description. Every other object in it is a simple grey stand-in that only marks where things stand: take every shape, material and look from this description. Never show a capsule: the capsule becomes the person. Do not adopt its grey clay set or its stand-in shapes.

**Rebuild the set (`ROLE_REBUILD`).**

> The set in @video1 is only a layout of crude placeholders: rebuild every wall, window, piece of furniture, vehicle and prop as a real, fully detailed object of the same size in the same place, with real materials, textures, wear and dirt. Plain blocks become real stone, brick, wood, tile or metal. No cone, sphere, plain box or untextured surface appears in the final video.

**Stripes are labels (`ROLE_STRIPES`).**

> The capsule's red and black stripes are only a label for where the person is: no clothing, skin, prop or surface takes those colours or stripes, and no striped capsule appears at any moment, even far in the background or through a doorway.

**Face (`ROLE_FACE`).**

> @image1 is used only for the person's facial features, short dark curly hair and beard; ignore its white background, its lighting and the black hoodie and microphone.

**Human motion (`HUMAN`).**

> Every action is performed with natural, realistic human motion: real weight and balance, momentum carried through each movement, and loose, believable arms and shoulders. The written description of the action decides how it looks. The person is a real human being with natural skin, hair and clothing; no mannequin, clay figure, capsule or doll appears anywhere, at any moment.

**Look (`LOOK`).**

> The final visuals are live-action and photographic: photoreal cinema shot on an ARRI Alexa 35 with anamorphic lenses, natural film grain, soft diffusion and halation on the lights, shallow depth of field, motivated light and real atmospheric haze.

**Closing lines.** "There is no music of any kind." sits at the end of every sound line. `【Maintain Consistency】` always ends "Keep the lighting and time of day constant from start to end."

**What a user may change.** The goal, the person's description and clothing, the place paragraph, the camera numbers (taken from the template), the performance, the sound list, the dialogue lines and their delivery notes. The locked sentences keep their wording, with the person's name and the stripe colours swapped in.

The first 54 prompts used an older wording of the same lines (for example "Do not adopt its grey clay set, its stand-in shapes or floating specks", in the `CAM06-Orbit` prompts). The tool `engine/cinematic/tools/seedance-realism.py` added the three realism lines to those prompts. The v4 wording is the newer one.

## How to name every stand-in

Each person gets one capsule colour and the prompt maps colour to person in one sentence.

- People: "The red-and-black striped capsule in @video1 corresponds to Alex." A second person: "The yellow-and-black striped capsule is Sam." Colours in order of use: red ochre, yellow slate, then green, blue, magenta, orange, cyan ([why/why-capsules.md](why/why-capsules.md)).
- Set pieces: name each grey shape as the real thing. "The grey stand-in columns, cone-shaped trees, round-topped trees, bench, rocks and long low wall in @video1 correspond to stone columns, pine trees, broadleaf trees, a bench, boulders and a long low stone wall" (`CAM06` sent prompt).
- Props that act carry a flat label colour in the clip and a mapping sentence in the prompt: "The solid orange box Alex carries corresponds to the suitcase; its orange is only a label, and the real case is brown leather" and "The small solid cyan shape ... corresponds to the drone; its cyan is only a label, and the real drone is matte black" (`templates/SHOW01-TheHandoff/prompts/video-v3.txt`).
- Props that fly in an explosion were plain coloured blocks (orange block for a saloon car, cyan blocks for drums, green blocks for crates, purple block for a pickup) and the prompt said what each really is (FAM02). Blocks vanish when they leave the frame.
- A statue still came back as a ball head and bar arms in four templates even with no scenery. The fix proposed was a better stand-in or an approved reference image. It was not tried.

## The three realism lines

They go in every prompt. Without them the first three gallery tests kept cone pines and ball trees (ACT01), showed a stray capsule and dressed a person in capsule stripes (SC08).

1. Rebuild every object as a real one (`ROLE_REBUILD`).
2. Capsule colours are labels, never clothing and never visible (`ROLE_STRIPES`).
3. Photoreal cinematic look (`LOOK`).

The rule: the result never keeps the clay environment; it is a hyper-real cinematic render.

## Place, light, materials, wear, dirt

The place goes in `【Subjects and Relationships】` as one paragraph of colour, light, haze, materials and grain. Example from the dust prompts: "Ruined brutalist concrete and old brick, colonnaded halls with dark arcades, cracked stone paving drifted with sand, a tall abandoned tower dissolving into the dust. Burnt orange, terracotta and ochre, the sun hidden so the whole sky is one soft orange glow, dust thickening with distance, warm bloom, lifted warm blacks, fine film grain."

Wear and dirt need their own words. The 30 s dust story added: "Nothing is clean, polished or perfect: every surface is weathered, pitted, cracked and stained, the concrete spalled with rusted rebar showing, the brick eroded with bricks missing and sand packed into the joints" (`build_story_p.py`). It was added after rocks and buildings came back polished.

A set piece that is only named comes back grey. The product drafts fixed this by describing every piece as a real object with colour and material: "cream travertine plinth on an oak platform, softboxes on black stands with sandbags and cables" (the product drafts).

The mood panel is optional. If one is sent it is `@image2` and the prompt calls it a mood reference only: "It is not a layout and not a set to copy: do not reproduce its architecture, objects or composition." A four-panel sheet was copied as layout and put the person inside the table. A single panel helped in some shots and hurt in others, so each shot was sent as a pair (see `qa-prompt-and-video.md`).

## Camera, framing and lens numbers

The camera paragraph states the camera from the template's own numbers: lens feel in millimetres, start height and distance in metres, speed, arrival size and the position of the person in frame. Examples from `gallery_v4.py`:

- CAM22: "the camera is on a pedestal with a 50 mm lens feel ... It starts about 0.6 metres below his eye line looking slightly up, and over the six seconds it rises smoothly and steadily to about 0.9 metres above his eye line".
- CAM42: "starts about 25 metres up and 14 metres out ... dives toward him in one smooth, gravity-eased move while the lens tightens from 24 to 50 mm ... arrives about 3.4 metres from him on a medium wide shot".

Each move is written as start side, direction and arrival. "Orbits a half circle" alone left the sheet runs with a locked camera. After the rewrite (start side, direction, arrival, about 3 s at the same height, subject centred) all three sheet versions orbited.

The lean version (no camera words, "the blockout decides everything") fixed stiffness but loosened the framing. On 6 Nov the gallery layout with the camera script came back because it followed the blockout better. The QA gate `qa4.py` requires the template's numbers in the camera script.

## Banned and risky wording

| Wording | Why | Evidence |
|---|---|---|
| "very still", "motionless", "stands still", "frozen", "does not move" | The person turns into a statue. | `tools/seedance/qa3.py` STATUE list; "stands very still" made a statue. |
| Time stamps inside the performance ("at about 2.4 seconds") | The blockout sets timing, and Seedance does not obey seconds in text. | `tools/seedance/qa3.py` and `tools/seedance/qa4.py` Q3; first-word timing landed about 2 s early. |
| "tripod" | Seedance draws a tripod. Say "locked off". | CAM21 mood take. |
| A ban line that names gear ("no camera, crane or equipment is visible") | Naming it can put it in the picture. | STORY02, rig absent in 16 sampled frames per take after removal. |
| Words that sound like a body action: "breath through his nose", "knocks twice", "frown of concentration" | They are filmed as sniffing, knocking and a scowl. | PRD06-Glambot. |
| Tear words: "eyes wet", "streaming" | Triggers crying. | Leap of faith prompt. |
| Literal acting words: "eyes wide and unblinking", "jaw hanging slack", "trembling" | Played literally, over-acted. | PRD06-Glambot. |
| "dragging", "bad left leg", "slow and labored" | Gives a limp. | STORY02 first run. |
| Product or film names, franchise costumes | Copyright filter. | FAM05, FAM06. |
| `@image2` in a prompt that sends one image | Dangling tag. | `tools/seedance/qa4.py` Q9. |
| Round brackets | Reserved for music in Seedance prompt syntax. | Third-party Seedance prompting guides. |
| Duration, aspect ratio, resolution | They are request settings. | [tein-endpoint.md](tein-endpoint.md) |
| Filler set-up lines ("the part most people miss") and chains of clipped fragments in a spoken line | They read as machine-written. | `tools/seedance/qa4.py` Q10. |
| Risk words: unclothed, naked, nude, blood, gun, shoot, kill, dead body, corpse | Content filter. | `qa4.py` RISK list. |
| "music", "song", "humming" outside the ban sentence | Music slipped through once. | Busker song in CAM40 was dropped for this. |

## The dialogue block

Seedance paraphrases lines that sit inside a long prompt. The block that fixed it:

```
【Dialogue, exact words】
The film contains exactly these seven lines and no other words. Each line is spoken verbatim, word for word as written inside the quotation marks, never paraphrased, shortened, reordered or added to; nothing is said between them. [...]
Shot 3, from about six seconds, Mara says exactly: "You actually came."
Shot 3, from about seven and a half seconds, Alex says exactly: "You said it'd be just us."
[...]
Shots 1, 2, 5, 8 and 9: nobody speaks.
```

Rules that came out of the runs:

1. One block near the top, one line per row, with shot and time.
2. The same line repeated inside its shot at the moment it is said.
3. "No other words" in the block, and "nothing is said in Shots 8 and 9" for the silent ones.
4. Delivery notes of 6 words or fewer. Long notes were read as alternative lines (`qa3.py` Q1).
5. Exactly one line per single-shot template (`qa4.py`).
6. Punctuation is literal. "Hi... friend" made a pause. Write "Hi friend" and add "said together as one single, unbroken, friendly greeting".
7. The voice clip goes in as `@audio1` only on shots where someone speaks. A voice attached to a silent shot can make him speak.
8. If the person speaks, say outright that the mouth moves on camera. A voice-over under a closed mouth failed (mouth opening 0.032 of face height, against 0.097 to 0.138 on spoken takes).
9. Check every result with whisper. From the third video run on, the Handoff returned all 7 lines word for word, with one unconfirmed dropped "Run" in the sixth sketch run. Several takes of the 30 s dust film said "Come on." twice, so a single line can still repeat.

## Performance and emotion

Write what the person does, why, and how it changes. The gate in `qa4.py` asks for a motive ("because", "has been", "is tired and resolved"), a change over the shot (then, until, when, as he, once, before), at least 3 body cues (5 when the frame is tight on the face) and 45 to 120 words. Example from the sent dust prompt: "He is tired and resolved, a man who has walked a long way. He stands in the dust with the wind dragging at his coat, and when a gust hits he turns his body into it, one forearm raised to shield his head, the scarf pulled up. As it passes he lowers his arm and takes one slow, deep breath."

Keep acting small. "Prestige drama that plays a ridiculous situation with complete sincerity" worked better than a list of reactions. Write the order of events: he reacts after the change finishes, he looks at his hands after the stripes start.

A reaction is written as hear, face changes, turns and looks, back. Speech is for places where speech is natural. A man alone in a shower did not speak to himself in the final take.

Only use body that the blockout shows. A shot cropped above the knees gets no feet, steps or weight (`qa4.py` Q8).

## Actions the pill cannot show

The capsule has no limbs, so hands, feet and gait come from the words.

- Who holds what: "the case by its handle in your right hand", "hands in coat pockets until she points", "both arms hugging the case from run through leap".
- Props described by shape and size. The key in STORY02 came back thick with a stack of teeth until the prompt said: "old plain small brass key, round ring bow, thin round shaft about a finger long, one small square bit at the tip" and that it slides in until only the bow shows.
- Gait: "a steady natural pace bent into the wind, every step planted; a gust shoves him sideways once and he staggers one step", and the consistency line "never in slow motion".
- Do not add limbs, boots or footprints to the pill to show feet. See [why/why-limbs-never.md](why/why-limbs-never.md).

## Continuity and match cuts

A cut is fine if the action carries across it. What fails is a change of state: arm, scarf, prop, clothes.

1. Write the action across each cut. Each shot paragraph ends "At the moment of the cut ..." with the pose, hand and prop, and the next opens "on that same moment" with the same pose.
2. State wardrobe and the key hand in every shot, not once at the top.
3. Track each prop's first appearance through the 30 s. A cup that is only named "already on the counter" first appeared when he drank.
4. A prop is never handed twice. The scarf lies on the counter, the key goes fist to palm to chest.
5. Do not pack actions. The reunion extend had about ten actions in 15 s and morphed the scarf.
6. A single continuous take needs strong words: "one single, unbroken take from the first frame to the last", then name each break to avoid (cut, jump cut, dissolve, whip, flash-frame, change of angle, change of lens). Version v8 of the Glambot extension used this wording and kept the turn.
7. When the reference video has the cuts, add a backstop line: "The edit is fixed: the film has exactly ten shots with hard cuts at exactly the same frames as @video1".

See `stories.md` for the full method.

## Face, voice and likeness

- The face photo is `@image1`, face features only, with `pass_faces` set to true. A sheet sent without the photo gave a face that did not look like the person.
- The voice clip is `@audio1`: "used only for Alex's voice timbre, accent and delivery; do not use any words from it". Other characters' voices are described and generated.
- A short phone clip of the person works as a likeness source in extend mode as `@video2`: "for his likeness only ... Treat @video2 as a reference for how he looks and moves, never as the shot to continue". This version gave the most alive expressions in the studio draft.
- Clothing in the photo does not carry. Write the garment: a "plain black pullover hoodie" produced black, "black zip-up hoodie over a plain grey T-shirt" produced a grey shirt.

## Annotated example

A shortened real prompt: `CAM06-Orbit`, 7 s, sent as a draft with the pill clip and the face photo.

```
【Generation Goal】                                                         [1]
Generate a live-action orbit around Alex, who stands still at the centre of a plaza at a turning
point, the camera circling from Alex's face to behind Alex's shoulder.

【Reference Asset Roles】                                                   [2]
@video1 is a coarse-blockout reference: a grey clay set in which each person is replaced by a
tall rounded capsule with loud diagonal stripes [...]. Use it for the camera: positions, movements,
lens feel, framing, cuts and their timing. [...] Never show a capsule: every capsule becomes the
person it stands for. [...]
The set in @video1 is only a layout of crude placeholders: rebuild every tree, wall, building,
column, vehicle and prop as a real, fully detailed object [...]. No cone, sphere, plain box or
untextured surface appears in the final video.
The capsules' red, yellow, green [...] stripes are only labels for who is who [...]
@image1 is used only for Alex's facial features, short dark curly hair and beard [...]

【Subjects and Relationships】                                              [3]
The red-and-black striped capsule in @video1 corresponds to Alex, standing alone and still at the
centre of the arc. The grey stand-in columns, cone-shaped trees [...] correspond to stone columns,
pine trees [...]. Alex, the man from @image1, wears a long charcoal wool coat over a cream sweater.

【Camera and Event Script】                                                 [4]
Shot 1, the only shot: the camera is on a technocrane with a 35 mm lens feel, starting at about
shoulder height [...] The camera then travels in one continuous arc of about 120 degrees around
Alex's left side. It moves slowly through the first two and a half seconds [...] and eases to a
stop behind Alex. [...] holds there with a slow, settling drift.
Alex stands still with feet planted and weight centred [...] A decision is being weighed: the
brows are drawn slightly together, the jaw set, the lips pressed [...]                        [5]
Every action is performed with natural, realistic human motion [...]                          [6]
Characters keep their mouths naturally closed; [...] The sound includes only quiet outdoor
ambience. There is no music.                                                                  [7]
The final visuals are live-action and photographic: a real Mediterranean stone plaza of worn
limestone paving [...] in crisp late-morning sun. [...]                                       [8]

【Maintain Consistency】                                                    [9]
Keep Alex's identity and clothing, Alex's fixed position at the centre of the arc, the arc around
Alex's left side, and the plaza layout consistent with @video1. [...]
```

1. The goal names the move and the feeling in two sentences.
2. The role block is the locked text. It says what the video is for and what to rebuild.
3. Each grey stand-in is mapped to a real object, and the clothing is stated plainly.
4. The camera paragraph gives lens, rig, start, direction, speed and arrival. This prompt names a technocrane as the rig. It passed, but the ban on naming gear above applies to ban lines, and that naming a rig in the camera script is safe is UNPROVEN ([known-limits.md](known-limits.md)).
5. The performance gives the motive ("a decision is being weighed") and the change (the shoulders end square and still).
6. The human-motion line is locked.
7. The sound line lists only natural sounds and says no music.
8. The look line names the real place and the camera.
9. The consistency block repeats what must not drift.

The cost of this draft was 1,020.6 credits (7 s of video input plus 7 s of output at 72.9 credits each).

Note on this example: it says "Alex stands still". The later QA gate bans "stands still" in a speaking shot because it made a statue. This prompt was sent before that gate existed, and the orbit was judged good. The statue wording is unproven as harmful for a silent shot with a moving camera. UNPROVEN. Test: send the same orbit with "stands still" replaced by a breathing and weight-shift sentence, and compare with `tools/seedance/qa_video.py`.

## What this page cannot settle

- The best prompt length. Dialogue was paraphrased in a prompt of about 3,000 words (`templates/SHOW01-TheHandoff/prompts/video-v3.txt`). A prompt of about 2,200 words (`templates/STORY02-DiveToShutter/prompts/story02-p.txt`) was followed in order. UNPROVEN. Test: one prompt at 800, 1,800 and 3,000 words, same references, same lines, whisper and cut check on each.
- Why the two dust prompts worked. Their shared parts are listed in [stories.md](stories.md#the-dust-plaza-story02). No test removed one part at a time. UNPROVEN.
