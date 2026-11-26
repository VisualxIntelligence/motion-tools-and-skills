# QA for prompts and for the video that comes back

Two kinds of check. Gates run on the prompt before anything is queued, because a queued job cannot be cancelled and costs credits. Checks run on the video after it comes back, because a result that looks fine in one frame can be wrong everywhere else.

The rule behind both: look at what was generated, not at an old note. An old "blocked" line in a status file once hid a finished result. The same rules, in short, are in [process-lessons.md](process-lessons.md).

## Order of work

1. Render a still of the pill clip and look at it. Then render the video.
2. Run the motion check and the frame check on the pill clip. Fix the clip, not the prompt, when the fault is in the clip.
3. Write the prompt. Run the mechanical gate.
4. Send the prompt to a judge agent that reads it the way the model would. Apply the fixes. Run the gate again.
5. Stop. Show the exact list of what will be sent and what it costs. Wait for a yes for that exact request.
6. Send a draft. When it finishes, check it and send it to the viewer at once.
7. Run the video checks below. Look at frames of the real file.
8. Only an approved draft is finalised.

## The mechanical gates

Two gate scripts ship in `tools/seedance/`. A prompt that fails is not queued, and the script exits with 1. A gate that cannot run (a missing file, a missing package) also exits 1 and says why.

| Script | For | Words | Notes |
|---|---|---|---|
| `tools/seedance/qa3.py` | lean prompts | 250 to 600 | No camera words anywhere except the references paragraph. No time stamps. |
| `tools/seedance/qa4.py` | gallery-format prompts, the current one | 500 to 1,100 | Camera script required, with the template's numbers. |

Earlier gates asked for timed beats. `qa3.py` and `qa4.py` ban time stamps in the performance. The later gates win: the blockout sets timing, and time stamps in text were not obeyed.

### The rules in `qa4.py`

| Rule | What it checks |
|---|---|
| Q0 | The pill clip has camera motion. Three frames (0.3 s, the middle, 0.3 s from the end) are compared and the largest mean difference must be at least 8.0 (`engine/cinematic/tools/clip-motion.py` runs the same test on a clip). A locked-off clip is not sent. |
| Q1 | A speaking shot has exactly one dialogue line, repeated word for word in the performance. The block says it holds the only words. The delivery note is 6 words or fewer. |
| Q2 | A speaking shot has a motive, a change over the shot, and at least 5 body cues in a tight frame (3 in a wide one). |
| Q3 | 500 to 1,100 words. The performance is 45 to 120 words. No time stamps in the performance. |
| Q4 | No statue wording: very still, motionless, does not move, stands still, completely still, frozen, without moving. |
| Q5 | The camera script carries the template's own numbers (for CAM22: "50 mm", "pedestal", "0.6 metres", "0.9 metres"). Four protective phrases are present: "rebuild every wall", "No cone, sphere, plain box", "only a label", "Never show a capsule". |
| Q6 | A speaking shot has the voice attached as `@audio1`. A silent shot has none. |
| Q7 | No camera or framing words in the performance. |
| Q8 | The performance uses only body the clip shows. A shot that shows less than the top 45 percent of the body gets no feet, steps, weight, knees or legs. |
| Q9 | The prompt-only job has one image and no `@image2`. The mood job has exactly 2 images and the mood sentence. |
| Q10 | No risk words (unclothed, naked, nude, blood, gun, shoot, kill, dead body, corpse). No filler set-up line. No run of clipped fragments in the spoken line. |
| Q11 | The two twins differ only by the mood sentence and the one image. |

The gate was calibrated on shots judged by hand. It does not read a prompt for sense. A prompt can pass and still be wrong about a prop, which is why the audit below exists.

## The agents

**Judge.** An independent agent reads the final prompt the way the video model will, and returns named edits. On the 24-environment batches it asked for edits on every batch. Examples it caught: a scarf that hid the beard and weakened the face match (CAM25), a building placed both behind him and across the street (CAM21), a second pluck on a guitar and a wipe that the camera cropped out (CAM24), a "tear of laughter" beat called a cliché, "her" against "them" in CAM23, hand and face detail written for a wide frame, and the word "capsule" appearing four times per prompt.

**Director.** An agent that plays the director on the blockout, with a 24-frame sheet. It reports whether each frame is right, whether each camera move has a motive, continuity per cut, the focus choices, the top 5 problems ranked with fixes in metres or seconds, and whether the clip is ready for a prompt. It set the lens table of the dust film (40 mm, 50 mm, 32 mm, 85 mm) and the pacing numbers. A person then changed the line, the structure and the camera speed.

**Critic.** An agent that reads a list of scenes and finds what is stock or repeated. It found that about half of the first list was stock and flagged repeats: two letters, two watches, two sky-gazes, three rooftop shots.

**Auditor.** An agent that lists, for each prop and each garment, where it first appears and what state it is in at every cut. It caught a cup that was never placed in a shot, a line that collided with the next, a nail that held scarf, coat and key at once, and the word "microphone", which could draw one. An auditor started before an edit reads the old prompt, so it must be told to read the file again.

**QA frame agent.** An agent that extracts all 720 frames of a 30 s clip and judges every cut and the motion inside each shot. It found that all 11 cuts of the Handoff were where they should be and that the faults were inside the shots.

**What they cannot do.** The writing agents were weak at dialogue. A dialogue pass fixed it (see [stories.md](stories.md)).

## The checks on the video that comes back

### Speech: whisper

Transcribe each take with whisper (`--model small`, CPU, FP32) and compare to the dialogue block word for word. Do it on each take alone, because a side-by-side with one shared audio track made one panel's lips look wrong. Count repeated lines: "Come on." came back twice in several takes. A missing line may be a transcriber miss. Whisper cannot tell if the lips match the words.

Results: the Handoff from v3 on returned all 7 lines; the living room (4 lines) and the orbit-push-rack (3 lines) came back word for word.

### Mouth check

Face landmarks give the mouth opening as a fraction of the face height, and its motion. Measured values: a closed-mouth take 0.032; speaking takes 0.097 to 0.138; the hospital re-run 0.084 (motion 0.0095); other spoken takes had motion 0.0092 to 0.0168. It tells whether the mouth moves. It does not tell whether the mouth matches the sound. In wide shots the face is too small to measure (CAM21: 0 of 169 frames). The script is `tools/seedance/qa_mouth.py` (needs mediapipe).

### Cuts: the detector

A frame-difference detector finds hard cuts. It reduces frames to 160 x 67 grey and flags a mean absolute difference above 28. Run it on the pill clip and on the result (`tools/seedance/qa_cuts.py`), then compare the cut times. On the Handoff the clip spikes at 2.5, 5.5, 9.0, 12.0, 14.0, 17.0, 21.0, 24.5 and 26.5 s. Video input put all 9 on the same frame. Sheet runs measured 1.9, 5.2, 9.0, 12.4, 14.4, 17.8, 21.5, 24.2 and 26.3 s.

A hard cut is not a fault. A cut is a fault when the action does not continue, so the detector is only the first step. To check the spikes above, run `python3 tools/seedance/qa_cuts.py templates/SHOW01-TheHandoff/pill.mp4`.

### Cuts: before and after frame pairs

For each cut, take the last frame before and the first frame after (`tools/seedance/cut_pairs.py`). Compare the arm, hand, scarf, prop, clothing and place. This is the useful check. The four cuts of the v6 reunion (2.6, 11.9, 17.3, 22.5 s) passed it. See `stories.md`.

### Framing against the clip: `tools/seedance/qa_framing.py`

The script finds the red capsule in the pill clip and predicts the head size and position. It finds the face in the result with MediaPipe face detection (full-range model, confidence 0.35). Second by second it compares size, across and down. A second passes when the size ratio is 0.65 to 1.5 and the position is within 0.15 of the frame. A shot passes when 75 percent of the scored seconds pass. In old drafts the apartment face was 0.38 of the expected size, the cafe 0.63, and the drafts overall 0.4 to 0.65. The capsule was too wide, so the pin replaced it.

When no second can be scored the script exits 1 and says why.

### Stiffness: `tools/seedance/qa_video.py`

For speaking shots. Phase correlation on consecutive frames finds the camera shift and removes it, then the script measures the change in the middle of the frame at 12 steps a second. Floors, calibrated on shots judged by hand:

| | Energy | Micro-movement | Longest dead stretch |
|---|---|---|---|
| Locked camera | 0.75 | 0.55 | 1.0 s |
| Moving camera | 1.2 | 0 | 1.0 s |

The five locked shots judged stiff scored 0.12 to 0.54 with dead stretches of 1.7 to 4.7 s. After the lean prompt the longest dead stretch was 0.6 s.

There is no separate script that compares the camera path of the result with the clip. Phase correlation is used here only to remove camera motion. UNPROVEN. Test: for CAM06, estimate the global shift per frame for the clip and the result, and compare the two curves.

### Draft against final

Compare frames every 3 s. The Handoff draft and final matched. A 7 Nov upgrade matched on 7 sampled frames.

### A file against its request

Never match by file name. Compare each file's size with the size the service reports for the request id. For a stricter check, hash the local file and a fresh download of the service's copy (`md5` or `shasum -a 256`) and compare. 136 rows were checked by size: 132 matched, 2 were wrong and 2 could not be checked.

### What to show the user

Show the real frames of the new render, with the pill clip beside the result. Side-by-side clips carry the result's own sound and label whose sound it is. For a sketch run, show the contact sheet that was sent, and put the sketch material in its own section. Show the overview first and the detail second. Every pair of videos starts and loops together; the measured drift was at most 0.09 s.

## What counts as a failure when a check cannot run

A check that could not run counts as a failure and the reason is written down (every script in `tools/seedance/` exits 1 and says why). In practice:

- A face too small to measure is reported as "check by eye", not as a pass.
- A disk that is full stops the render, and a render that crashed can leave an old video that looks new. After every render check the file's time and look at frames of the new file.
- An agent cannot hear. Voice and lip sync need a person, and the reply says so each time.

## Run it

The scripts for every check on this page are in `tools/seedance/` (see its `README.md`): `qa3.py` and `qa4.py` (prompt gates), `qa_video.py`, `qa_framing.py`, `qa_cuts.py` (cut detector), `cut_pairs.py` (before and after frames), `qa_speech.py` (whisper), `qa_mouth.py` (face landmarks) and `compare.py`. The match of a file against its request needs the service, so it is not a script.
