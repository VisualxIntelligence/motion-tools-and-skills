# yt-dlp — notes

**Source:** [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) @ `da452a5` (25 Nov 2026), release 2026.11.23. Public domain (the Unlicense). Read 26 November 2026. **Not copied**: it installs with pip or as a single binary, and it has to update often because sites change.

## What it does

Downloads video and audio from YouTube, X, Vimeo, LinkedIn, Instagram, TikTok and about 1,800 other sites, with chosen quality, time ranges, subtitles and metadata.

## What we use it for

**Fetching reference films to study, never footage to reuse.** Its job here is to get a film onto disk for the analysis tools:

| Then | Tool |
|---|---|
| Cuts, beat-grid fit, per-shot motion heatmaps, keyframes | [`tools/film-analysis/`](../film-analysis/NOTES.md) (`breakdown.py`) |
| Registers, structure, type and cut numbers against 47 measured launch films | [`docs/guides/launch-film-grammar/`](../../docs/guides/launch-film-grammar/NOTES.md) (`measure.py`) |
| A motion inventory to rebuild in our own design | [`skills/awwwards-motion-study/`](../../skills/awwwards-motion-study/NOTES.md) |
| Camera moves to rebuild as a pill clip | [`skills/ai-camera-control/`](../../skills/ai-camera-control/NOTES.md) (measure the move; don't send the film) |
| Word timings of a reference's voice-over, for pacing | [`tools/whisperx/`](../whisperx/NOTES.md) |

## Recipes

```bash
pip install -U yt-dlp            # or download yt-dlp.exe from the releases page; update with yt-dlp -U
# ffmpeg must be on PATH for merging and cutting

# One film, best quality up to 1080p, as MP4 (what the analysis tools expect)
yt-dlp -S "res:1080,ext:mp4:m4a" --merge-output-format mp4 --no-playlist \
  -o "refs/%(uploader)s - %(title).80B [%(id)s].%(ext)s" URL

# Only part of it (the title sequence, a chapter)
yt-dlp --download-sections "*0:00-0:45" --force-keyframes-at-cuts -o "refs/%(id)s-open.%(ext)s" URL

# Audio only, for beat and loudness study
yt-dlp -x --audio-format wav -o "refs/%(id)s.%(ext)s" URL

# Subtitles as well, to compare caption pacing
yt-dlp --write-subs --write-auto-subs --sub-langs "en,ar" --skip-download URL
```

Keep downloads in a `refs/` folder outside this repo (or in a git-ignored folder). The `.gitignore` already blocks media, and `.info.json` files carry uploader metadata, so don't commit them either.

## Rules

- **Study, don't reuse.** A downloaded film may be used for measurement and private reference. Nothing from it (frames, audio, on-screen text, voice) goes into a film we publish without a licence. Upstream analyses here keep only derived numbers and short descriptions; do the same.
- **Respect each site's terms.** Many platforms forbid downloading in their terms of service even where the tool works. For Al Jazeera work, take archive or agency material through the newsroom's licensed channels, not from social sites.
- **Signed-in content.** `--cookies-from-browser` reads your browser's cookies to reach content behind your own sign-in. Use it only for your own accounts and never commit a cookies file.
- **Not tested here.** This sandbox can't reach video sites. The commands above are from the 2026.11.23 `--help`.
