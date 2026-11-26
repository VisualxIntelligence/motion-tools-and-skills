# Seedance 2.5 limits

Tein checks these before a job is queued. A refusal costs nothing.

## Reference images (`reference_image`, `first_frame`, `last_frame`)

| Rule | Value | When it is broken |
|---|---|---|
| Count | Up to 30 reference images. In `ugc` mode, `products` and `influencers` together count toward the 30. | `422 invalid_params` |
| Sides | 300 to 6000 px | Fixed for you: a side over 6000 px is shrunk, and a short side under 300 px is enlarged. The shape is kept. |
| File size | 30 MB or less | `413 too_large` |
| Aspect ratio (width / height) | 0.40 to 2.50 | Reference image: `422 file_not_accepted`, unless you send `auto_fit_images: true`. First and last frames: always `422`, because they are never changed. |
| `auto_fit_images: true` | Off by default | An image up to 10% outside the range is stretched slightly. One further outside keeps its shape, centred on a blurred copy of itself. Nothing is cropped. Same price. |
| Link | Public http(s), or a Tein upload | `422 invalid_params` |

## Reference videos (`reference_video`)

| Rule | Value |
|---|---|
| Count | Up to 10 |
| Each clip | 2 to 30 s |
| Clip being edited (`edit`) | At least 4 s each |
| Total of all clips | 30 s or less |
| Tolerance | 0.05 s on each limit above |
| Container | MP4 or MOV. Files named `.mkv`, `.webm`, `.avi`, `.flv`, `.wmv`, `.mpg`, `.ts`, `.3gp` and other video types are refused without being read. |
| Codec | H.264 or H.265 |
| Frame rate | 24 to 60 fps, rounded to the nearest whole frame (23.976 and 59.94 pass) |
| Size | At least 407,696 pixels (width x height), for example 640 x 640 |

How the 30-second total works: lengths are added exactly as measured, and the total is refused only when it goes over 30.05 s.

| Total sent | Result |
|---|---|
| 30.00 s | Passes |
| 30.05 s | Passes |
| 30.06 s | Refused |
| 30.1 s | Refused: `422 invalid_params`, "Your videos add up to 30.1 s: keep them within 30 s." |

The same tolerance applies to each clip. A clip passes from 1.95 s up to 30.05 s, and a clip being edited passes from 3.95 s. If a video's length cannot be read, the request is a `422` ("Use an MP4 or MOV"). If its format, codec, frame rate or size cannot be read, the file is let through.

## Reference audio (`reference_audio`, `lipsyncing_audio`)

| Rule | Value |
|---|---|
| Count | Up to 10 `reference_audio` clips. Lip sync and voice clone take one `lipsyncing_audio`. |
| Each clip | 2 to 30 s (0.05 s tolerance) |
| Total | 30 s or less (refused over 30.05 s) |
| Formats | MP3 and WAV are used as they are. Other formats (m4a, aac, ogg, flac, opus, webm) are converted to MP3 for you. If the conversion fails, the original file is kept. |
| `lipsyncing_audio` link | http(s). If the file name has an extension, it must be mp3, wav, m4a, aac, ogg, oga, flac, opus or webm. |
| Unreadable length | `422` ("Use an MP3 or WAV") |

Audio on its own is a valid Omni Reference request.

## Output

| Setting | Values |
|---|---|
| `duration` | Whole seconds from 4 to 30, or `-1` (auto). An edit only takes `-1`, which keeps the length of the video being edited. Default `5`. |
| `multi_frame_prompts` total | 4 to 30 s |
| `ratio` | `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `adaptive`. Default `16:9`. Edit and extend take only `adaptive`. |
| `resolution` | `480p` (default), `720p`, `1080p`, `4k`. 480p and 720p are 8-bit. 1080p and 4k are 10-bit H.265. 4k is 3840 x 2160 at 16:9. |
| `output_format` | `mp4` (default) or `mov` |

## Draft and finalize

| Step | Resolution | Rules |
|---|---|---|
| Draft (`draft: true`) | 480p | `resolution` may be left out or sent as `480p`, `1080p` or `4k`; all of them render a 480p draft. `720p` is refused. No `priority`, no `return_last_frame`. |
| Finalize (`finalize: "<draft id>"`) | 1080p (default) or 4k | Within 7 days of the draft, or `410 draft_expired`. The draft must have succeeded. Some drafts cannot be finalized at 4K: finalize those at 1080p. |

## Other fields

| Field | Limit |
|---|---|
| `metadata` | 1,024 bytes as JSON, 5 levels deep at most, 50 keys at most |
| `idempotency_key` | 1 to 255 printable characters, kept for 24 hours |
| `callback_url` | `https`, 2,048 characters at most, not a private or local host |
| Uploads (`POST /v1/uploads`) | 100 MB per file; a body sent through the API carries about 6 MB |
