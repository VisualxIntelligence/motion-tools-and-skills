# Openverse API — notes

**Service:** [api.openverse.org/v1](https://api.openverse.org/v1/), run by WordPress. A search API over hundreds of millions of openly licensed **images and audio** (Flickr, Wikimedia Commons, Freesound, Jamendo, ccMixter, museums and others). Read 24 November 2026. Nothing to install.

## Using it

```bash
# music that allows commercial use and modification
curl "https://api.openverse.org/v1/audio/?q=ambient+pulse&category=music&license_type=commercial,modification&page_size=20"
# CC0 only, for zero-attribution use
curl "https://api.openverse.org/v1/audio/?q=whoosh&license=cc0"
curl "https://api.openverse.org/v1/images/?q=doha+skyline&license_type=commercial,modification"
```

- Each result gives `url`, `creator`, `license`, `license_version`, `license_url`, `source` and a ready **`attribution`** string. Audio adds `duration`, `genres` and `/audio/{id}/waveform`.
- **Anonymous requests work** but are rate-limited. For higher limits, register an app with `POST /v1/auth_tokens/register`, swap it for a token at `/v1/auth_tokens/token`, and send `Authorization: Bearer <token>`. `GET /v1/rate_limit/` shows what is left.

## Rules for our work

- **The licence is per item, and Openverse only indexes; it doesn't grant anything.** Check the licence on the item's source page before use.
  - **NC** (non-commercial) is never allowed for client or broadcast work.
  - **ND** (no derivatives) can't be cut, looped or remixed.
  - **BY** needs the credit (use the `attribution` string) in the film's credits or the post text.
- **Keep a licence record next to the file**: source URL, licence, creator and date fetched. Our `skills/cinetic` does this automatically with `scripts/music.mjs`, which already searches Openverse for no-credit tracks.
- **Prefer CC0** for music under news, where credits are awkward.
- **Don't scrape.** The Openverse terms forbid scraping the catalogue and require you to keep to rate limits.
