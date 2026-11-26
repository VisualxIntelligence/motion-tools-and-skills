# auto-editor — notes

**Source:** [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor) @ `16abfd3` (25 Nov 2026), release 29.3.1. Public domain (the Unlicense, [LICENSE](LICENSE)). The five agent skills in `skills/` were copied 26 November 2026; the program itself installs with pip or from a release and is not copied.

## What it does

A command-line editor that **marks every moment of a recording as active or inactive and cuts, speeds or slows the inactive parts**. It judges activity by loudness by default, and also by motion, black frames, or the words in the subtitles. It renders the cut file, or writes a timeline you can open and fix in an editor.

| Skill | Use it to |
|---|---|
| [`auto-editor`](skills/auto-editor/SKILL.md) | Cut dead space (silence, stillness, black frames), set the pace with `--margin`, make manual cuts, record and trim a microphone |
| [`auto-editor-transcribe`](skills/auto-editor-transcribe/SKILL.md) | Transcribe with whisper.cpp or Parakeet, then keep or drop parts by what is said (`--edit subtitle`/`word`) |
| [`auto-editor-export`](skills/auto-editor-export/SKILL.md) | Send the edit to **DaVinci Resolve**, Premiere, Final Cut Pro, Shotcut, Kdenlive, an EDL, separate clips, or auto-editor's own timeline file |
| [`auto-editor-effects`](skills/auto-editor-effects/SKILL.md) | Speed, volume ducking and fades, de-essing, zoom and Ken Burns, rotation, boxes, logo or picture overlays on chosen sections |
| [`auto-editor-transitions`](skills/auto-editor-transitions/SKILL.md) | Cross-dissolves and Premiere's transitions at the cuts, and audio crossfades |

## When to use it

- **First pass on talking-head and interview footage**: a LinkedIn piece to camera, an interview or a field report. Loudness cutting is fast and needs no transcript, and the result opens as a timeline in Resolve.
- **Compared with [`starters/herk-edit-kit/`](../../starters/herk-edit-kit/NOTES.md)'s `cut-silences`**: Herk's skill cuts from a word-level transcript and trims pauses to a natural breath, which reads better. Use auto-editor when you want a quick cut with a timeline you can fix, or when there is no transcript yet; use Herk's for the final speech edit, and its `cut-mistakes` for retakes.
- **Not for code-rendered films.** They have no dead air to remove.

## Tested here (26 Nov 2026, Linux)

```bash
pip install auto-editor                                  # downloads the 29.3.1 binary on first run
auto-editor example.mp4 --preview                        # 42.40 s in, 17.40 s out, 5 clips, 4 cuts
auto-editor example.mp4 --margin 0.2sec -o cut.mp4 --no-open
auto-editor example.mp4 --export resolve -o cut.fcpxml --no-open
```

- The cut file came out at 17.4 s, matching the preview.
- The Resolve export wrote **FCPXML 1.11** (Rec.709, 1280 × 720 at 30 fps, linked to the source by an absolute `file://` path). Import it in Resolve with *File → Import → Timeline*.

## Things to know

- **Add `--no-open` on every agent or headless run.** Otherwise it tries to open the output in a player when it finishes.
- **Run `--preview` first** to see how much will be cut before rendering a long file.
- **`--margin 0.2sec` is the default padding.** For speech that sounds clipped, try `--margin 0.3s,0.5sec` (before, after).
- **The exported timeline links to the source by an absolute path.** Export on the machine that will open it, or relink in Resolve.
- **Music under speech defeats loudness cutting.** Cut the voice track before the music goes in, or use `--edit audio:stream=0` to read one stream.
- The skills mention running `./auto-editor` "from this repo"; here, run the installed `auto-editor` instead.
- **Not tested here:** transcription (whisper.cpp needs a model download), effects and transitions, and Premiere export.

## Changes from upstream

- **Copied.** The five `skills/*/SKILL.md` files, unchanged, and the licence.
- **Left out.** The program source (Nim), the docs site, `example.mp4` and the release binaries.
