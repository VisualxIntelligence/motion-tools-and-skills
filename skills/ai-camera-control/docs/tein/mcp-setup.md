# Tein MCP setup: Seedance 2.5

There are two remote MCP servers (streamable HTTP). You can use either one with any Tein API key.

| Server | URL | What it lists |
|---|---|---|
| Seedance 2.5 only | `https://mcp.tein.ai/seedance-2-5` | The Seedance 2.5 tools, plus upload, status and pricing. |
| Every model | `https://mcp.tein.ai/mcp` | The generic tools, one tool per Tein model, Tein's ready-made workflows, and (with a key that can run them) your workspace's live workflows. |

## Auth

```
Authorization: Bearer $TEIN_API_KEY
```

Create the key at [tein.ai](https://tein.ai) under **Dashboard > API keys**. The servers also accept the key in an `X-API-Key` header.

You can list tools without a key. Calling a tool needs one: with no key the answer is `missing_api_key`, and a refused key gets `invalid_api_key`.

## Connect

### Claude Code

Every model:

```bash
claude mcp add --transport http tein https://mcp.tein.ai/mcp \
  --header "Authorization: Bearer $TEIN_API_KEY"
```

Seedance 2.5 only:

```bash
claude mcp add --transport http tein-seedance-2-5 https://mcp.tein.ai/seedance-2-5 \
  --header "Authorization: Bearer $TEIN_API_KEY"
```

### Claude Desktop

Put this in `claude_desktop_config.json`, with your key in place of `TEIN_API_KEY`:

```json
{
  "mcpServers": {
    "tein-seedance-2-5": {
      "type": "http",
      "url": "https://mcp.tein.ai/seedance-2-5",
      "headers": { "Authorization": "Bearer TEIN_API_KEY" }
    }
  }
}
```

For every model, use the server name `tein` and the URL `https://mcp.tein.ai/mcp`.

### Cursor

Put this in `.cursor/mcp.json` in your project, or in `~/.cursor/mcp.json` to use it in every project:

```json
{
  "mcpServers": {
    "tein-seedance-2-5": {
      "type": "http",
      "url": "https://mcp.tein.ai/seedance-2-5",
      "headers": { "Authorization": "Bearer YOUR_TEIN_API_KEY" }
    }
  }
}
```

## Tools on https://mcp.tein.ai/seedance-2-5

| Tool | What it does |
|---|---|
| `seedance-2-5` | Runs Seedance 2.5. |
| `generate_video` | The same tool and schema as `seedance-2-5`, under its generic name. |
| `upload_asset` | Uploads a file and returns a link to pass to a generation tool. |
| `get_generation_status` | Reads a job by `request_id`. |
| `get_pricing` | Returns published prices. No key needed. |

### `seedance-2-5` / `generate_video` input schema

`additionalProperties: true`. No field is marked required. The server still answers "Prompt is required" on every run except a finalize.

| Field | Type | Default | Values / notes |
|---|---|---|---|
| `prompt` | string | none | Required except with `finalize`. |
| `mode` | string (enum) | `text_to_video` | `text_to_video`, `first_n_last_frames`, `multi_reference`, `edit`, `extend`, `multi_frame`, `lipsyncing`, `voice_clone`, `ugc` |
| `duration` | number | `5` | 4 to 30, or -1. If you leave it out on an edit, the server uses -1. |
| `resolution` | string (enum) | `480p` | `480p`, `720p`, `1080p`, `4k` |
| `aspect_ratio` | string (enum) | `adaptive` | `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `adaptive` |
| `bitrate_mode` | string (enum) | `standard` | `standard`, `high` |
| `generate_audio` | boolean | `true` | |
| `output_format` | string (enum) | `mp4` | `mp4`, `mov` |
| `watermark` | boolean | `false` | |
| `return_last_frame` | boolean | `false` | Not with `draft`. |
| `draft` | boolean | `false` | 480p preview. |
| `finalize` | string | none | The job id of a succeeded draft. |
| `draft_task_id` | string | none | Older name for `finalize`. |
| `draft_generation_id` | string | none | Older name for `finalize`. |
| `images` | string[] (uri) | none | Reference images, up to 30. |
| `videos` | string[] (uri) | none | Reference videos, up to 10. |
| `audios` | string[] (uri) | none | Reference audio, up to 10. |
| `first_frame_image` | string (uri) | none | |
| `last_frame_image` | string (uri) | none | |
| `lipsyncing_audio` | string (uri) | none | |
| `pass_faces` | boolean | `true` | |
| `creative_mode` | boolean | `false` | |
| `priority` | boolean | `false` | |
| `reference_roles` | object | none | |
| `auto_fit_images` | boolean | `false` | |
| `callback_url` | string | none | An https webhook, signed with `X-Tein-Signature`. |

The MCP tool fills in the defaults above for any field you leave out. A finalize gets no defaults. One difference from the REST API: if you leave out the ratio, MCP uses `adaptive`, while `/v1/generate` uses `16:9`.

### `upload_asset` input schema

No field is required. `additionalProperties: true`.

| Field | Type | Notes |
|---|---|---|
| `filename` | string | Send it with `byte_size` to get an upload link for a file on your computer. |
| `byte_size` | integer | Up to 100 MB. |
| `content_type` | string | Optional. If you leave it out, it is taken from the file name. |
| `upload_key` | string | Send this after you PUT the file to the upload link. You get back the link to use in a generation tool. |
| `url` | string | A public file link for Tein to download and host. |
| `data` | string | Base64 or a data URI, for files up to about 4 MB. |
| `path` | string | Works only through the local Tein CLI. The remote server refuses it. |

### `get_generation_status` input schema

| Field | Type | Required |
|---|---|---|
| `request_id` | string | yes |

### `get_pricing` input schema

| Field | Type | Required |
|---|---|---|
| `model` | string | no (for example `seedance-2-5`) |

## Tools on https://mcp.tein.ai/mcp

| Tool | Required | Fields |
|---|---|---|
| `generate_image` | `prompt` | `prompt`, `model`, `aspect_ratio`, `resolution`, `images`, `endpoint`, `quality`, `n`, `output_format`, `output_compression`, `background`, `input_fidelity`, `mask`, `seed`, `creative_mode`, `callback_url` |
| `generate_video` | `prompt` | `prompt`, `model` (a Tein video model id, default `seedance-2-5`), `duration` (number, default 5, 4 to 30), `resolution` (default `480p`), `creative_mode`, `priority`, `aspect_ratio` (default `16:9`), `first_frame_image`, `generate_audio` (default `true`), `images`, `callback_url` |
| `generate_audio` | `text_prompt` | `text_prompt`, `references` (array of objects), `audio_config` (object), `callback_url` |
| `run_task` | `prompt` | `prompt`, `model`, `system`, `max_tokens` (default 2048), `endpoint`, `callback_url` |
| `generate_mesh` | `prompt` | `prompt`, `images`, `callback_url` |
| `upload_asset` | none | same as above |
| `get_generation_status` | `request_id` | `request_id` |
| `get_pricing` | none | `model` |
| one tool per model, named by its model id (for example `seedance-2-5`) | as on the model's own server | the model's own fields; `seedance-2-5` has the same schema as above |
| workflow tools | per workflow | Tein's ready-made workflows, and your workspace's live workflows when the key can run them |

All the generic tools accept extra fields (`additionalProperties: true`). Every generation tool takes `callback_url`. Call `tools/list` to see the current set.

## Limits on the MCP servers

- Tool calls in flight at once, per key: the same as your plan's limit on jobs running at once. Anything over the limit is `rate_limited` (`retry_after: 10`).
- A JSON-RPC batch holds at most 10 messages. A longer batch is refused whole.
