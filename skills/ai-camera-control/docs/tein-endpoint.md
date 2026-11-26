# Sending a template to Seedance 2.5 through Tein

This repo is by the author of Tein's open-source work, and every video request in it goes through Tein's Seedance 2.5, as an MCP or as an API. The full, official reference is in [docs/tein/](tein/) (API, MCP setup, limits, billing), written from Tein's own source on 7 Nov 2026. This page is the short version for sending a template. Prices and limits change: check tein.ai/docs and tein.ai/pricing before you rely on a number. Where the text says "per Tein's docs", the behaviour is documented there and the authors did not test it.

## Get access

1. Sign up at tein.ai and finish the welcome step.
2. Create a key at Dashboard > API keys. Keep it in an environment variable, `TEIN_API_KEY`. Never put it in a file in this repo.
3. Direct API access may need approval, per Tein's docs. The MCP works with any key.

Docs: tein.ai/docs (quickstart, auth, async jobs, Seedance, draft, uploads), the model page tein.ai/models/seedance-2-5, tein.ai/mcps, tein.ai/pricing.

Test the key without spending anything. This call only reads the price list:

```bash
curl -s "https://api.tein.ai/v1/pricing/models?model=seedance-2-5" \
  -H "Authorization: Bearer $TEIN_API_KEY"
```

## Option 1: the MCP (the default)

Connect commands for Claude Code, Claude Desktop and Cursor, and every tool's input schema: [tein/mcp-setup.md](tein/mcp-setup.md). Note that `/v1/generate` defaults to ratio `16:9` and the MCP to `adaptive`: send `ratio` explicitly.

- Model server: `https://mcp.tein.ai/seedance-2-5`. Tools: `seedance-2-5`, `generate_video`, `upload_asset`, `get_generation_status`, `get_pricing`.
- Main server: `https://mcp.tein.ai/mcp`, tool `generate_video` (the default model is `seedance-2-5`).
- Auth header: `Authorization: Bearer $TEIN_API_KEY`.

## Option 2: the API

Every field, response, error code and rate limit: [tein/api-reference.md](tein/api-reference.md). Direct API access may need approval; MCP works with any key.

- Generate: `POST https://api.tein.ai/v1/generate` with `"model": "seedance-2-5"`.
- Read a result: `GET /v1/jobs/{id}`. Cancel: `DELETE /v1/jobs/{id}`.
- Upload a file: `POST /v1/uploads` (multipart, base64 or a URL, up to 100 MB a file); it returns a URL to use in the request.
- Prices: `GET /v1/pricing/models?model=seedance-2-5` (the curl call above).

## The request for a template (reference mode)

```json
{
  "model": "seedance-2-5",
  "prompt": "...the prompt from the template folder...",
  "reference_video": ["https://...pill clip..."],
  "reference_image": ["https://...your photo..."],
  "reference_audio": ["https://...your voice clip, only if the shot speaks..."],
  "duration": 11,
  "resolution": "480p",
  "ratio": "21:9",
  "draft": true,
  "pass_faces": true,
  "output_format": "mp4",
  "callback_url": "https://...optional..."
}
```

Use a photo of yourself, or of someone who agreed. `pass_faces` must be true for a photo of a person to be accepted.

Fields fold flat into the body, or sit under `"parameters"`. The task is `omni_reference_task_type` = `reference`, `edit` or `extend` (or `mode`: `multi_reference`, `edit`, `extend`). If you send neither, Tein works it out from the inputs. Other fields: `generate_audio` (default true), `return_last_frame`, `first_frame`, `last_frame`, `priority`, `auto_fit_images`, `metadata`, `idempotency_key`. All per Tein's docs.

Result: the submit answers 202 with an id and a status. Poll `GET /v1/jobs/{id}` until the status is `succeeded`; the video URL is in `data[].url`. Or set `callback_url` and Tein calls it with a signature in the `X-Tein-Signature` header (per Tein's docs).

## What a draft is

A **draft** is a 480p preview made with `draft: true`. It can be finalized within 7 days. On Tein you send `resolution: "480p"` with `draft: true`. The earlier hosted API used in the original tests wanted `is_draft: true` with `resolution: "1080p"`, which is why the old records in `templates/*/sent.json` say 1080p. The saving of a draft is the lower resolution, not a lower rate (see [costs.md](costs.md)).

## Names in `sent.json`

The `sent.json` files record the field names of the earlier hosted API used in the original tests (`is_draft`, `aspect_ratio`, `webhook_url`, `videos[]`). On Tein they are the names in the second column. The Note column is as documented by Tein; the authors did not test the refusals.

| Name in `sent.json` | Tein name | Note |
|---|---|---|
| `mode` | `omni_reference_task_type` or `mode` | `reference`, `edit`, `extend` |
| `duration` | `duration` | whole seconds 4 to 30, or -1 for auto; an edit must be -1 or left out |
| `resolution: "1080p"` | `resolution` | `480p` (default), `720p`, `1080p`, `4k` |
| `is_draft` | `draft: true` | `is_draft` is silently ignored, so the run bills at full price. Rename it. |
| `aspect_ratio` | `ratio` (`aspect_ratio` also works) | edit and extend must be `adaptive` |
| `pass_faces` | `pass_faces` | default true |
| `output_format` | `output_format` | `mp4` or `mov` |
| `videos[]`, `images[]`, `audios[]` | `reference_video[]`, `reference_image[]`, `reference_audio[]` | |
| `webhook_url` | `callback_url` | `webhook_url` is refused with a 422. Rename it. |
| `seed` | not supported | there is no seed, so a good take cannot be repeated |

## Limits to design for

All per Tein's docs. The provider's own limits, as read from its documentation, are in one table in [seedance-notes.md](seedance-notes.md#2-limits).

- Reference videos: up to 10, each 2 to 30 s (an edit source at least 4 s), together at most 30 s. **Keep references under 29 s.** Tein's check adds the clip lengths and refuses a total over 30.05 s (30.00 s and 30.05 s pass; [tein/limits.md](tein/limits.md)). The earlier hosted API used in the original tests refused some clips at 30.00 s, and the 29 s film here was sent with a 28.92 s reference, so this repo keeps the margin.
- Images: up to 30, each side 300 to 6000 px, at most 30 MB, aspect 0.40 to 2.50. Outside that the request is refused, unless `auto_fit_images: true`.
- Audio: up to 10 clips, each 2 to 30 s, together at most 30 s. Anything not mp3 or wav is converted.
- Output: 4 to 30 s.
- Filters refuse the job and charge nothing: `content_blocked`, `face_detected` (set `pass_faces: true`), `copyright_blocked`. Creative mode needs an approved application.
- Tein has a `reference_roles` field (Omni Reference only, see [tein/api-reference.md](tein/api-reference.md)). This repo sets roles in the prompt text, so nothing here depends on it.

## Draft first, then finalize

- `draft: true` renders a 480p draft. It cannot be combined with `priority` or `return_last_frame`.
- Finalize a draft: `POST /v1/generate` with `{"model": "seedance-2-5", "finalize": "<draft id>"}`. The result is 1080p by default.
- A draft can be finalized for 7 days. After that the answer is 410 `draft_expired`.
- **4K.** Tein documents finalizing a draft at `4k`, and says some drafts cannot be finalized at 4K (finalize those at 1080p) ([tein/limits.md](tein/limits.md)). The authors did not test this on Tein, so a true 4K of an existing take is UNPROVEN on Tein. On the earlier hosted API the final ignored the 4K field and returned 1080p. Test with one 4 s draft before you rely on it. The paragraph with the test is in [seedance-notes.md](seedance-notes.md#4k).
- Rule from the tests: never finalize until the draft is right. A final re-renders the same generation at higher resolution, and small details change.

## What it costs

The billing rule in words: [tein/billing.md](tein/billing.md).

Billed per output second. With a reference video you pay for the reference seconds plus the output seconds, or a fixed minimum if that is higher: billed seconds = input + output, and never fewer than the output x 1.67. Drafts, finals and 4K have their own rates and plans change them. The prices are at tein.ai/pricing and from `GET /v1/pricing/models?model=seedance-2-5`; this repo's `estimate_cost` reads the number you give it and does the sum, and does not store prices. Observed bills and the per-length table are in [costs.md](costs.md).

## Not documented here

Workflow runs and locked template files are not documented here. To send a template, take the pill clip from its folder in this repo and upload it yourself, as in the request above.
