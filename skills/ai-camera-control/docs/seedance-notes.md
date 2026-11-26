# Seedance 2.5 notes

What the project learned about the model and the services it was sent through. Sources: Tein's docs (tein.ai/docs, read 7 Nov 2026), the video provider's own documentation pages as read on 7 Nov 2026, the receipts and result logs of the original tests (measured on the author's runs, not included), and the checks in [qa-prompt-and-video.md](qa-prompt-and-video.md). Rates and limits change. Where two sources disagree the page says so.

Nothing in this repo sends anything. A send costs credits and needs a yes for that exact request.

## 1. Tein (what to use)

Every request in this repo goes through Tein's Seedance 2.5. The request shape, the names, the draft and the finalize step are in [tein-endpoint.md](tein-endpoint.md). That page also holds the one definition of a draft. In short:

- A template is sent in reference mode: the pill clip is `reference_video`, your photo `reference_image`, the voice clip `reference_audio`. Of the 242 sends in `templates/*/sent.json`, 239 are reference-mode drafts, one is a reference-mode 4K request and two are extends.
- Extend is a task type and needs `ratio: adaptive`.
- Billing counts the reference seconds plus the output seconds, or a minimum if that is higher ([costs.md](costs.md)).
- There is no seed, so a good take cannot be repeated. To keep one, finalize its draft or extend it.

### References and their order

The tags are fixed by position in each list.

| Tag | Content | Notes |
|---|---|---|
| `@video1` | the pill clip, no sound track, 24 fps, 21:9 crop | Keep references under 29 s in total. |
| `@image1` | the face photo | `pass_faces` true. |
| `@image2` | one mood panel, or the sheet in the sketch route | Optional. Never a map. |
| `@audio1` | the voice clip | Only on shots where someone speaks. |
| `@video2` | a short likeness clip (extend mode) | Sound stripped. |

### 4K

Tein documents finalizing a draft at `4k`. The authors did not test this on Tein. On the earlier hosted API used in the original tests the final ignored the 4K field and returned 1080p, and only a fresh generation with `resolution: "4k"` produced 4K. A fresh generation is a new take, so a true 4K of an existing take is UNPROVEN on Tein. Test with one 4 s draft before you rely on it: finalize it with `resolution: "4k"` and read the output size. At 21:9 a true 4K frame is 4398 x 1886 and a 1080p frame is 2206 x 946.

What the provider's own 4K guide says (read 5 Nov 2026, not in this repo): step 1 is a draft at 480p; step 2 sends the draft id with `resolution` set to `1080p` or `4k` and nothing else, and sending the prompt, references, duration or ratio again is an error. The model reuses the draft's prompt, references, duration, aspect ratio, seed and audio setting. The draft id is valid for 7 days. 4K has a concurrency of 1 and 15 requests a minute, against 10 and 600 for every lower resolution; whether Tein applies the same queue is not stated in the docs read. 4K is 10-bit: `mp4` is HEVC Main 10 with AAC, `mov` is HEVC Rext 4:4:4 with PCM audio.

How much sharper (measured on 15 crops, on the author's runs, not included): about 4x the edge detail of the draft, 1.5 to 1.8x the detail of 1080p on close faces and 1.9 to 2.4x on far background. At normal size 1080p and 4K cannot be told apart. The big step is draft to 1080p. 4K also allows a 2x punch-in that still leaves a full 1080p frame. It does not fix motion blur or staging. A small face that is a smear in the draft comes out right in 4K.

## 2. Limits

The provider's limits, as read from its documentation. The same limits apply to Tein where Tein's docs speak ([tein-endpoint.md](tein-endpoint.md#limits-to-design-for)).

| | Limit |
|---|---|
| **Reference videos** | mp4 or mov |
| Length | each 2 to 30 s (4 to 30 s for a video-editing task); up to 10 videos and 30 s in total |
| Shape | aspect ratio 0.4 to 2.5; each side 300 to 6000 px; width x height 407,696 to 8,295,044 pixels |
| Size and rate | at most 200 MB each; 24 to 60 fps |
| **Images** | jpeg, png, webp, bmp, tiff, gif, heic or heif; 1 to 30 in a reference task |
| Shape and size | aspect ratio 0.4 to 2.5; each side 300 to 6000 px; under 30 MB each |
| **Request** | body under 64 MB; do not send large files as Base64 (use a URL or an uploaded asset) |
| **Audio** | up to 10 clips, 30 s in total (per Tein's docs) |
| **Output** | 4 to 30 s; resolution 480p, 720p, 1080p or 4k |

What this means for the pill clips: 1280 x 534 is 683,520 pixels at an aspect of 2.4, inside every limit. A 30 s sheet video of 3840 x 1648 is 6.3 million pixels, also inside. A clip smaller than about 640 x 640 is rejected. This repo's rule is to keep references under 29 s (see [tein-endpoint.md](tein-endpoint.md#limits-to-design-for)).

## 3. Differences seen on the earlier hosted API used in the original tests

All 242 sends in `templates/*/sent.json` were made on an earlier hosted Seedance API whose field names differ from Tein's (the mapping is in [tein-endpoint.md](tein-endpoint.md#names-in-sentjson)). What differed, as seen in those tests:

- **The route.** It was asynchronous: `POST /queue` returned a request id and needed a `webhook_url`; `POST /status` returned `PENDING`, `IN_QUEUE`, `IN_PROGRESS`, `COMPLETED` or `FAILED`. Results were polled every 30 s up to 1,800 s. A failed job was refunded. Local files were uploaded to a temporary host right before each send, because the links lasted about 5 minutes.
- **A draft** was `is_draft: true` with `resolution: "1080p"`; the service rendered it at 480p. A request with `resolution: "480p"` was not a draft and could not be finalized. The final was a second request with only the draft's id, and drafts expired after 7 days.
- **The final re-renders the same take.** The 29 s film's draft and final were compared every 3 s and matched; a second draft and its 1080p upgrade matched on 7 sampled frames. The final draws the texture again, so fine detail can change: cracks in paving sat in different places, a glance direction changed in a car shot, and neon lettering read differently between 1080p and 4K. Camera, poses, timing, faces and sound carry over. Never finalize until the draft is right.
- **4K.** The final ignored the 4K field (see [the 4K section](#4k)).
- **Seed.** No seed parameter; the sent records say "seed: not sent (the provider picks one)". Rewriting the prompt with the exact words of a loved take produced a different take, with different faces and a cut at 12 to 13 s.
- **Rates.** The provider's rate table of 11 Oct listed 487.3 and 292.8 credits for 1080p; the bills matched 675.4 and 406.1 ([costs.md](costs.md)).

### The 30.00 s refusal (earlier hosted API)

That service refused a reference video of "30 seconds" even when the file was shorter.

| Item | Refused | Accepted |
|---|---|---|
| Reference video, first tests (video only) | 30.00 s, 29.92 s, 29.50 s (the message said "got 30.00s") | 28.92 s |
| Reference video, later tests | 30.00 s | 29.3 s |
| Voice audio | 29.9 s | 29.4 s |
| Edit-mode video | 29.7 s | 29.0 s |
| Extend source | | a 12 s tail of the previous take, sound removed |

So 28.92 s is the length shown to work on a 29 s duration, and 29.3 s worked once. The cause of the 29.50 s refusal is not explained. This is why the repo's rule is to keep references under 29 s. UNPROVEN whether Tein measures the same way. Test: encode one clip at 29.0, 29.3 and 29.5 s from the same source and send each as a 4 s draft.

## 4. Extend

Extend continues a clip. The output holds only the new footage, not the input plus the new part, and its first frame equals the input's last frame. Both extend steps of the longest chain took the previous clip, sound removed, as `videos` input with `aspect_ratio` `adaptive`. A draft id is used only for a final. There is no seed and no last-frame still, so continuity comes from the video input and the prompt wording.

- Maximum output per extend: 30 s.
- The reunion extend (STORY03) sent the last 12 s of the dust take, because the earlier hosted API refused more than 30 s of input video.
- Cuts inside an extend are carried by match-cut wording (see [prompt-anatomy.md](prompt-anatomy.md) and [stories.md](stories.md)).
- A re-run of an extend is a new take. Its first 12 s differed from the version that was loved.
- Not tested: finals for a chain, the seam between two finals, inputs longer than 15 s, an automated join of the parts.

Two cases need care. A character whose face, clothing or signature prop appears only earlier in the clip can drift if you pass only the end. A clip that ends on a big camera move loses where the move came from if you cut it to its end. Send a tail of 3 to 10 seconds that contains the face, the clothing and the prop. The join method is in [stories.md](stories.md#extend-what-the-model-uses-and-how-to-build-a-join).

## 5. What the tests showed about the model

Measured on the author's runs, not included.

### Voice

- The voice clip is a recording of the person, 14.5 s, mono. It goes in as `@audio1`. The prompt takes timbre, pitch, accent and pace and no words.
- 5 to 10 s of clean speech works best (third-party guide).
- Words come from the dialogue block. Other voices are generated.
- Seedance does not obey seconds in the text. The first word landed about 2 s early, and when the first word was asked at 9.5 s and 10 s it landed near 8 s. A supplied recording padded with silence put the first word on target (a 20.9 s recording padded to 29.4 s).
- Seedance drops words from long lines and speaks faster than expected. Measured speech was about 11 s where 17 s was planned.
- Lip sync with a supplied recording is unverified. The mouth check shows movement, not sync (see [qa-prompt-and-video.md](qa-prompt-and-video.md)). Judging sync needs a person who listens.

### Filters

| Filter | What tripped it | What worked | Counts |
|---|---|---|---|
| NSFW | A pencil fight with drawn unclothed outlines, twice. A random rejection of a bedroom line (ANG07). | The figures-only pencil version passed. Retry once. | 1 of 144 requests on one test day. |
| Copyright | Night alley brawl (SC07, twice). Fight coverage (ACT07, at least 5 attempts, never passed). A 360 turn with a known-film look (twice). A random rejection of CAM24. | Daytime sparring in sportswear with other names passed for SC07. A desert roadside town with a woman partner passed for the 360. Peter Pan was written with no name and no green costume. | 7 of 144 on the same day. |

The filter judges the finished video, so the prompt is only half the cause. Rule: retry once. If it fails again, reword the setting, clothing and names. Do not send the same prompt a third time. A rejected job is not charged.

### Matching a file to its request

Match a file to its request by content, never by file name. On the earlier hosted API a retry overwrote the first run's file with the same name, and the draft log showed the retry under the first run's id. The fix: compare each file's size with the size the service reports for the id (136 rows checked: 132 matched, 2 wrong and fixed, 2 could not be checked), and for a stricter check compare a hash of the local file with a hash of a fresh download.
