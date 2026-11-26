# Working with an agent: five checks

Most of the mistakes in this pipeline were process mistakes, not engine mistakes. These five checks stopped them. Each says what went wrong, what to do, and how to check. They apply to a person working alone as much as to an agent.

---

## 1. Never spend or send what was not asked

**What happened.** An agent was asked for two chosen 30 second videos in 4K. The draft-upgrade route of the earlier hosted API ignored the 4K field and returned 1080p, so the agent ran two fresh 4K generations instead. A fresh generation is a new take, not the video that had been chosen. Separately, four test drafts were queued when the instruction was only to compare, and a queued job cannot be cancelled.

**Do this.**
- Show the exact list of jobs and the cost, then wait for a yes to that exact action.
- A command that was interrupted may already have sent. Check what it queued before you do anything else.
- Re-run exactly the variant named. Do not re-run what passed.
- When the request is for "the exact video", prove the match first, byte for byte. Do not infer it.
- Send in batches of 4.

**Check.** Write the request out and read it before anything is sent. A fresh generation is a new take, a queued job cannot be cancelled, and the price comes from [tein.ai/pricing](https://tein.ai/pricing) ([costs.md](costs.md)).

## 2. Match files to request ids by hash or size, never by name

**What happened.** A retry wrote its result over the first run's file name, so the draft log showed the retry's video under the first run's id. Comparing each row's file size with the size the service reports for that id checked 136 rows: 132 matched, 2 were wrong and fixed, 2 could not be checked because only the send receipt survived.

**Do this.** Keep the request id in the file name, or keep a receipt next to each file. When a file name could have been reused, compare size, then a hash, against the service download.

**Check.** A match script that reports "matched", "wrong" and "could not check" separately ([seedance-notes.md](seedance-notes.md#matching-a-file-to-its-request)).

## 3. Check the prompt before any send

**What happened.** A prompt said "the tea was already on the counter" but never put it in a shot, so the tea first appeared when the man drank. Two prompt edits failed to save and three drafts went out without them. A prompt said "stands very still" and made a statue. A prompt said "on a tripod" and a tripod was drawn.

**Do this.** Run the stack in this order, and fix before you queue:
1. A mechanical gate: `tools/seedance/qa3.py` for lean prompts and `tools/seedance/qa4.py` for gallery prompts. It refuses a blockout with no camera motion, bans "still" and "motionless", bans time stamps in the acting, and requires the camera numbers, the protective paragraphs and the dialogue block ([qa-prompt-and-video.md](qa-prompt-and-video.md)). For a long story also check that all shots are present, the times chain without gaps, and each spoken line appears the right number of times.
2. An independent judge that reads the prompt as the model would. Do not grade your own prompt.
3. A critic for story and pacing, and an auditor that tracks the first appearance of every prop through the 30 seconds.
4. After generation: a framing check against the blockout second by second, a motion check, a transcript of every spoken line, a mouth-opening measure, and frame sheets of what was sent against what came back.

**Check the text that actually went out.** After a send, read the saved payload, not the draft you meant to send. An auditor that started before an edit reads the old prompt, so make it read the file again.

## 4. Look at the real frames

**What happened.** An old "blocked" note hid a finished result. A gallery folder held videos from before any fix. A render that crashed left the old video in place, and its frames looked like the new ones.

**Do this.**
- Show only a render you made after the last change. Add a cache tag to gallery links.
- Pull frames from the finished MP4, not only from stills.
- For any cut, look at the frame before and the frame after. Counting cuts is not the goal; continuity is (`tools/seedance/cut_pairs.py`).
- For any claim in a script or doc, open the clip, look at six frames, read the run's own request, and transcribe any speech.
- A check that cannot run counts as a failure, with the reason written down (every script in `tools/seedance/` exits 1 and says why).

## 5. Say plainly what you cannot check

**What happened.** An agent cannot hear audio and cannot judge lip-sync. It measured what it could: first-word time by silence detection, a transcript, mouth opening from face landmarks (about 0.03 of face height when silent, 0.1 to 0.14 when speaking). Faces in wide shots were too small to measure, and "face too small" was reported rather than a number.

**Do this.** Write "not checked" next to anything you did not check. Ask a person to listen.
