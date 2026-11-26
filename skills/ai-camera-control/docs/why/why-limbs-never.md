# Why the pill never gets limbs

No legs, arms, hands or boots on the pill. The pill carries position, size and facing. The stride, the hands and the feet come from the prompt. This is a fixed rule of the method.

Clips are in `release-media/<ID>/` (release download) or `gallery/media/<ID>/`. Engine files start with `engine/`.

## Where it came from

The pill exists because a body in the reference gets copied (`docs/why/why-not-people.md`). A pill with two legs, boots and hand spheres was tried for a feet shot and rejected: the stand-in must carry position, size and facing only. A limbless gait cue was tried next (footprints, a scrape and a crack in the sand) and removed too, because marks on the ground are read as real objects (the `--marks` checker made references leak a chessboard, `docs/engine.md`, section 5). The final feet shot is a low camera beside the pill with the ground sliding past. Walking, a limp or a hand on the knee come from the prompt only.

The engine has no limb option: `engine/cinematic/src/standins.ts` draws a head and a body only.

## What carries the action instead

- **Hands.** The Handoff prompt has one sentence for them, because the pill shows no arms: the case is held by its handle in the right hand, Mara's hands stay in her coat pockets until she points, both arms hug the case from the run through the leap, and every shot has real fingers and grip.
- **Carried props.** A prop that is an object may stay (a key, a lock plate, a suitcase). A suitcase is its own prop actor placed from the hand bone each frame, and the person's pill is fitted to the trunk only, so the case stays outside the pill (`engine/cinematic/src/standins.ts`, `capsule: "trunk"`).
- **Gait.** Do not write a limp or a dragged foot unless it is wanted. "Bad left leg, dragging foot, scrape, slow and labored" written into a prompt appeared on screen as a person dragging his feet. The fix was a steady natural pace bent into the wind, "never in slow motion".
- **A prop that looks like a body part is confusing.** A plain sphere for a fist and an orange block for a lock produced a huge circle in the last frames. They were replaced by a brass plate with a keyhole and a small key.

## What the rule costs

The trunk shot (FAM03) shows the limit. From below, three pills look like barrels, the white dots look like lids, nobody has arms so the lid opens by itself, and a reach shows only as a pill getting shorter. The template was rendered as clay and as pill for that reason, because clay shows lean, a hand on the lid and a reach. The pill version is the one that was sent; the result is `release-media/FAM03-TrunkShot/result.mp4` and the capsule video is `video-capsule.mp4` in the same folder.

## When your case differs

- **The shot is about hands or feet.** Build only the camera move and the pill. Write the hands in the prompt, in detail.
- **A small object must show motion.** Use a labelled object (an orange block for a case), not a shape that reads as a body part.
- **Would limbs copy motion?** UNPROVEN as a test. No limbed pill was ever sent to Seedance. The reasoning comes from the clay mannequin result. A test: send the same shot with the pill and with a pill that has two stub legs, and compare gait stiffness.
