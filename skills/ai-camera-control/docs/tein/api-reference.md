# Tein API reference: Seedance 2.5

Base URL: `https://api.tein.ai`

Everything below is for the model id `seedance-2-5`.

## Authentication

1. Sign up at [tein.ai](https://tein.ai).
2. Open **Dashboard > API keys** and create a key.
3. Send it on every request:

```
Authorization: Bearer $TEIN_API_KEY
```

- Keys start with `sk_live_` (real runs) or `sk_test_` (test keys). A test key validates the request and answers with a sample job. It is never charged.
- No header: `401 missing_api_key`. Anything that is not a usable key: `401 invalid_api_key`.
- A read-only key cannot run, upload or cancel: `403 read_only_key`.

> Direct API access may need approval; MCP works with any key. Today every key can call the model directly. If your workspace is not approved once the gate is on, `/v1/generate` and `/v1/jobs` answer `403 direct_api_not_enabled`.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| `POST` | `/v1/generate` | Start a job. Answers `202` with the job id. |
| `GET` | `/v1/jobs/{id}` | Read one job (status, output links, cost). |
| `GET` | `/v1/jobs` | List your jobs. |
| `DELETE` | `/v1/jobs/{id}` | Cancel a job that has not started yet. |
| `POST` | `/v1/uploads` | Upload an input file and get a link to use in a request. `/v1/upload` also works. |
| `GET` | `/v1/pricing/models?model=seedance-2-5` | Published prices. No key needed. |

## POST /v1/generate

### Request envelope

| Field | Type | Notes |
|---|---|---|
| `model` | string | Required. `"seedance-2-5"`. |
| `callback_url` | string | Optional webhook. See [Webhooks](#webhooks). |
| `metadata` | object | Optional. Your own data, returned unchanged on the job and the webhook. Up to 1,024 bytes as JSON, 5 levels deep at most, 50 keys at most. `workflow_run_id`, `workflow_step` and `workflow_finalize_of` are reserved. |
| `idempotency_key` | string | Optional. 1 to 255 printable characters. If you retry with the same key within 24 hours, you get the first job back and the request does not run again. The same key with a different body is a `422`. A retry while the first request is still being admitted is `409 request_in_progress`. |
| `parameters` | object | Optional wrapper. You can put the model fields inside `parameters`, or at the top level next to `model`. |

`stream` is not supported on `/v1/generate` (`422`).

### Model fields

The server reads these field names. Each refusal is `422 invalid_params` and names the field.

| Field | Type | Default | Allowed values / rules |
|---|---|---|---|
| `prompt` | string | none | Required, except with `finalize` and `mode: "multi_frame"`. |
| `reference_image` | string[] | none | Public http(s) URLs. Up to 30. Alias: `images`. |
| `reference_video` | string[] | none | Public http(s) URLs. Up to 10. Alias: `videos`. |
| `reference_audio` | string[] | none | Public http(s) URLs. Up to 10. Alias: `audios`. |
| `first_frame` | string | none | One image URL. Makes the run Image to Video. Alias: `first_frame_image`. |
| `last_frame` | string | none | One image URL. With `first_frame`, makes the run First & Last Frame. Alias: `last_frame_image`. |
| `ratio` | string | `16:9` | `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `adaptive`. Alias: `aspect_ratio`. Edit and extend take only `adaptive`; any other value is a `422`. |
| `duration` | integer | `5` | Whole seconds from `4` to `30`, or `-1` (auto: the model picks a length). An edit only takes `-1`. If you leave it out on an edit, the server uses `-1`. |
| `resolution` | string | `480p` | `480p`, `720p`, `1080p`, `4k`. Case does not matter. |
| `draft` | boolean | `false` | Renders a 480p preview. See [Draft and finalize](#draft-and-finalize). |
| `finalize` | string | none | The job id of a succeeded draft. See [Draft and finalize](#draft-and-finalize). |
| `pass_faces` | boolean | `true` | Keeps real faces in reference images. Send `false` to turn it off. |
| `generate_audio` | boolean | `true` | Adds synchronized sound to the video. |
| `output_format` | string | `mp4` | `mp4` or `mov`. |
| `return_last_frame` | boolean | `false` | Also returns the last frame as an image (`data[].last_frame_url`). Cannot be used with `draft: true`. |
| `watermark` | boolean | `false` | Adds an "AI Generated" mark. |
| `auto_fit_images` | boolean | `false` | Fits a reference image whose aspect ratio is outside 0.40 to 2.50 just inside that range, without cropping. Off: such an image is a `422`. First and last frames are never changed. |
| `priority` | boolean | `false` | Faster processing with no queue, at the Priority price. Cannot be used with `draft` or `finalize`. Only `true`, `false` or `0` are accepted. |
| `omni_reference_task_type` | string | none | `reference`, `edit` or `extend` (`auto` is also accepted). `edit` and `extend` need at least one `reference_video`. |
| `mode` | string | read from the fields | `text_to_video`, `first_n_last_frames`, `multi_reference`, `edit`, `extend`, `multi_frame`, `lipsyncing`, `voice_clone`, `ugc`. If you leave it out, the server works it out: `omni_reference_task_type` edit or extend first, then frames (`first_n_last_frames`), then references (`multi_reference`), else `text_to_video`. |
| `reference_roles` | object | none | Omni Reference only. The role of each reference, by tag (`{ "@Image1": "prop" }`) or by kind (`{ "image": ["prop"] }`). |
| `bitrate_mode` | string | `standard` | `standard` or `high`. |
| `creative_mode` | boolean | `false` | Runs the Creative mode checkpoint at its published price. The Acceptable Use Policy applies. |
| `multi_frame_prompts` | array | none | `mode: "multi_frame"` only. A list of `{ "prompt": string, "duration": number }`. Every segment needs text. Total length 4 to 30 seconds. It sets `duration`. |
| `lipsyncing_audio` | string | none | `mode: "lipsyncing"` or `"voice_clone"` only. One audio URL. Needs at least one `reference_image`. |
| `products`, `influencers` | string[] | none | `mode: "ugc"` only. Image URLs (30 at most in total). |

Media fields take public http(s) links. On `/v1/generate`, a base64 data URI is uploaded for you first. You can also pass a link from `POST /v1/uploads`, or a link to one of your own earlier Tein outputs. Limits for every input are in [limits.md](limits.md).

Rules by mode:

- A frame sent with `multi_reference` becomes a reference image, if the total stays within 30 images. With any other reference mode, a frame is not used.
- `first_n_last_frames` cannot also send `reference_image`, `reference_video` or `reference_audio`. `ugc` cannot send videos or audio.
- `multi_reference` needs at least one reference_image, reference_video or reference_audio. Audio on its own is allowed.

> **Warning: unknown fields.**
> - An unknown field whose name looks like a media input (it ends in `_url`, `_urls`, `image(s)`, `video(s)`, `audio(s)`, `frame(s)`, `mask(s)`, `file(s)` or `reference(s)`) that the model would ignore is refused with `422 invalid_params`, for example `webhook_url`. Nothing is charged. Use `callback_url` for webhooks.
> - **Any other unknown field is silently ignored.** For example, `is_draft` or `seed` does not cause an error, and the run goes ahead without it. Use `draft`, not `is_draft`. Seedance 2.5 has no `seed` field. Check field names against this table.

### Example

```bash
curl https://api.tein.ai/v1/generate \
  -H "Authorization: Bearer $TEIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedance-2-5",
    "prompt": "A slow dolly-in on a lighthouse at dusk, waves breaking below.",
    "ratio": "16:9",
    "duration": 8,
    "resolution": "720p",
    "callback_url": "https://YOUR_DOMAIN/hooks/tein",
    "metadata": { "shot": "12A" },
    "idempotency_key": "shot-12A-take-1"
  }'
```

### Response: 202 Accepted

The job id comes back right away. `data` and `usage` are left out until the job ends.

```json
{
  "id": "gen_c4a91f",
  "model": "seedance-2-5",
  "status": "queued",
  "metadata": { "shot": "12A" },
  "created_at": "2026-10-07T10:02:49.814Z"
}
```

If you retry an idempotent request and its job already succeeded, the answer is `200` with the full job. If that job failed, the answer is its error.

## GET /v1/jobs/{id}

```json
{
  "id": "gen_c4a91f",
  "model": "seedance-2-5",
  "status": "succeeded",
  "data": [
    { "url": "https://.../output.mp4", "duration": 8, "last_frame_url": "https://.../last.jpg" }
  ],
  "usage": { "cost": 0.0 },
  "created_at": "2026-10-07T10:02:49.814Z"
}
```

| Field | Notes |
|---|---|
| `status` | `queued`, `running`, `succeeded`, `failed`, `expired`, `cancelled`. |
| `data[]` | Filled only when `status` is `succeeded`. Each item has `url` and `duration` (seconds delivered). It also has `last_frame_url` when `return_last_frame` was sent. |
| `usage.cost` | What the job cost, in USD. It is `0` on any job that did not succeed. |
| `error` | `{ "code", "message" }` on a failed, expired or cancelled job. |
| `draft`, `draft_expires_at` | Present on a draft. |
| `finalize` | Present on a finalize: the id of its draft. |
| `priority`, `creative_mode` | Present (`true`) when used. |
| `metadata` | Your `metadata`, unchanged. |
| `content_deleted`, `deleted_at` | The job's files and prompt were deleted. `data` is then empty. |

The output links are signed and expire. Files are deleted after 14 days (30 days for Creative mode runs).

## GET /v1/jobs

Query parameters: `status` (one of the six statuses), `model`, `created_after`, `limit` (1 to 100, default 20) and `after` (a cursor).
Answer: `{ "data": [job, ...], "has_more": boolean, "next_cursor": string | null }`.

## DELETE /v1/jobs/{id}

You can cancel a job only while it is still queued and has not been sent for processing. The answer is the job with `status: "cancelled"`, and nothing is charged. Otherwise you get `409 not_cancellable`, with one of these messages: "This job is already running.", "This job has already finished.", or "This job was already sent for processing and can no longer be cancelled. It is billed as usual when it finishes."

## Draft and finalize

Step 1, the draft: send `"draft": true` with the normal request.
- It renders at 480p. You can leave out `resolution`, or send `480p`, `1080p` or `4k`; all of them render a 480p draft. `720p` is a `422`.
- `draft` cannot be combined with `priority: true` ("Priority is not available with Draft") or with `return_last_frame: true`.
- The job shows `draft: true` and `draft_expires_at`.

Step 2, the finalize: send a new `/v1/generate` request.

```json
{ "model": "seedance-2-5", "finalize": "gen_c4a91f", "resolution": "1080p" }
```

- `resolution` is `1080p` (the default) or `4k`. Any other value is a `422`.
- Next to `finalize` you may also send `output_format`, `watermark`, `return_last_frame`, `callback_url` and `creative_mode`. `creative_mode` must match the draft. The envelope fields `metadata` and `idempotency_key` also work. Any other field is `422` ("finalize reuses the draft's settings"): the prompt, references and other settings come from the draft.
- You have 7 days to finalize. After that the answer is `410 draft_expired` ("This draft has expired. Make a new draft.").
- A draft that has not succeeded yet answers `422` ("The draft is not ready yet"). An unknown id answers `404`.
- Some drafts cannot be finalized at 4K. They answer `422`: make a new draft, or finalize at 1080p.
- The draft and the finalize are separate jobs, and each is charged on its own (see [billing.md](billing.md)).

## Uploads: POST /v1/uploads

Send a file in one of three ways:

1. `multipart/form-data` with one or more files.
2. JSON with `data` (base64 or a data URI) or `url` (a public http(s) link that Tein downloads). You can add an optional `filename`.
3. The raw file bytes as the body, with an optional `X-Filename` header.

The server limit is 100 MB per file. Request bodies sent through the API are limited to about 6 MB. For bigger files, use `url` or the MCP `upload_asset` upload link. Only images, video and audio are accepted; anything else is `422 file_not_accepted`, and over the limit is `413 too_large`.

```json
{ "url": "https://...", "key": "...", "mime_type": "video/mp4", "kind": "video", "extension": "mp4", "size_bytes": 1234567 }
```

Several files answer `{ "url": <first>, "uploads": [ ... ] }`. The links are signed and expire. Uploads are deleted after 14 days.

## Webhooks

Set `callback_url` on the request. It must be `https`, 2,048 characters or fewer, with no user name or password in it, and it cannot point at a private or local host.

- Tein POSTs the job when it ends: succeeded, failed, expired or cancelled. The body is exactly the `GET /v1/jobs/{id}` view.
- Header: `X-Tein-Signature: t=<unix seconds>,v1=<hex>`. `v1` is the HMAC-SHA256 of `"<t>.<raw body>"`, keyed with your workspace's signing secret (`whsec_...`). You can read and roll the secret under Webhooks in the dashboard. For 24 hours after a roll, the header carries a second `v1`. A match on any `v1` counts.
- A `2xx` within 10 seconds counts as delivered. Otherwise Tein tries again, up to 5 attempts in all, waiting 1 minute, 5 minutes, 30 minutes and 2 hours between them.

```js
import crypto from "node:crypto";

// header: the X-Tein-Signature value. rawBody: the body exactly as received, before JSON.parse.
// secret: your workspace's signing secret (whsec_...).
export function verifyTein(header, rawBody, secret) {
  const items = header.split(",").map((part) => part.trim().split("="));
  const t = items.find(([k]) => k === "t")?.[1];
  const signatures = items.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // 5-minute replay window
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return signatures.some(
    (s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)),
  );
}
```

## Errors

Error bodies have the shape `{ "error": { "code": "...", "message": "..." } }`. The one exception is `402 insufficient_credits`, which is flat: `{ "error": "Insufficient balance", "code": "insufficient_credits", ... }`.

### Refusals before a job is made (nothing is charged)

| HTTP | Code | Meaning |
|---|---|---|
| 400 | (no code) | The body is not a JSON object. |
| 401 | `missing_api_key` | No `Authorization` header. |
| 401 | `invalid_api_key` | The key is wrong, revoked, or its creator left the workspace. |
| 402 | `insufficient_credits` | Not enough balance for this job. |
| 403 | `read_only_key` | This key cannot run, upload or cancel. |
| 403 | `direct_api_not_enabled` | Direct calls are not on for this workspace. Use MCP or deploy the model as a workflow. Not active today. |
| 404 | `not_found` | No job with this id on your account, or no such draft. |
| 409 | `not_cancellable` | The job is already running, finished, or already sent. |
| 409 | `request_in_progress` | The same `idempotency_key` is still being admitted. Retry in a few seconds. |
| 409 | `template_asset_unavailable` | A template's reference file is not available yet. |
| 410 | `draft_expired` | The draft is more than 7 days old. |
| 413 | `too_large` | A file is over its size limit. |
| 422 | `invalid_params` | A field is missing, has the wrong value, or is unknown and media-like. The error names the field. |
| 422 | `file_not_accepted` | A file is the wrong type, or an image has an aspect ratio outside 0.40 to 2.50. |
| 429 | `rate_limited` | Too many requests for this key. See [Rate limits](#rate-limits). |
| 429 | `concurrency_limit_exceeded` | Your plan's limit on jobs running at once is reached. A `Retry-After` header is sent. |
| 503 | `capacity` | No capacity right now. Try again. |

### Codes on a failed or ended job (`error.code`, nothing is charged)

| Code | HTTP when answered directly | Meaning |
|---|---|---|
| `content_blocked` | 400 | Blocked by content moderation. |
| `face_detected` | 400 | A reference shows a real face. Turn on `pass_faces`, or use another reference. |
| `copyright_blocked` | 400 | Refused for copyright. |
| `task_type_mismatch` | 422 | The inputs do not fit this task. |
| `invalid_input` | 422 | A reference file could not be downloaded, or it is too large for the model. |
| `expired` | 504 | The job ran past its time limit. |
| `capacity` | 503 | No capacity. |
| `server_error` | 500 | Something failed on Tein's side. |
| `cancelled` | 409 | Cancelled before it started. |

## Rate limits

Limits are counted per API key. Requests without a key are counted per client IP.

| Route | Limit | Window |
|---|---|---|
| `POST /v1/generate`, `DELETE /v1/jobs/{id}`, `POST /v1/uploads` (one shared counter) | 120 requests | 1 minute |
| `GET /v1/jobs`, `GET /v1/jobs/{id}` | 1,200 requests | 1 minute |
| Jobs running at once | depends on your plan | not applicable |

Rate-limit headers are sent in the standard `RateLimit-*` form. Anything over the limit is `429 rate_limited`, and nothing is charged.
