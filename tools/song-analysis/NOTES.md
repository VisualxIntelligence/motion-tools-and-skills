# song-analysis — notes

**Source:** [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) @ `fa164b7`, the `analysis/` folder. MIT, © 2026 Giacomo Magnanini ([LICENSE](LICENSE)). The song, its lyrics and the timing data computed from them are not copied (they belong to the song's authors).

## What it is

The audio analysis behind the "I'm Upping My P(doom)" code-rendered music video: it turns a song into two JSON files that a renderer can read, so every cut, hit and word lands on the music.

| Script | Writes | What it does |
|---|---|---|
| `analyze.py` | `audio.json` | Constant-tempo beat grid (tempo and phase fitted to drum and mix onsets, phase refined on kick attacks), downbeats, sections on downbeats, 100 fps envelopes (mix RMS, low, mid, high, and RMS per stem), kick, snare and hat onsets from the drum stem, vocal note onsets. **Needs no lyrics**, so it works for instrumental tracks too. |
| `align.py` | `lyrics.json` | Word-level lyric timings: one constrained CTC Viterbi pass over the whole song on fused emissions from two acoustic models, a "garbage" token between lines to absorb ad-libs and backing vocals, optional manual anchors for hard spots, then signal-based refinement of word starts and ends, a confidence score per word and QA plots. |
| `ctc_emissions.py` | `work/emission_*.npy` | Frame-wise CTC log-probabilities (20 ms) of the vocal stem from MMS_FA and wav2vec2 LV60K. |
| `ctcalign.py` | (library) | The forced aligner used by `align.py`. |
| `whisper_run.py` | `work/whisper_*.json` | Whisper word timestamps as an independent cross-check. |
| `vocal_feats.py` | `work/vocal_feats.npz` | Vocal features at 5 ms: RMS, pitch (pyin), onset strength, consonant energy, a vocal-presence mask. |
| `pron.py` | (library) | Maps each display word to the plain-letter spelling the aligner should listen for (for symbols, acronyms and coined words). |
| `qa_plot.py`, `zoom.py` | `qa/*.png` | Spectrogram, pitch and envelope plots with word boundaries, for checking the alignment by eye (or by the agent reading the PNG). |

The output format is documented in [`../../starters/pdoom-video-engine/docs/ENGINE.md`](../../starters/pdoom-video-engine/docs/ENGINE.md) ("Data"): `beatAt(t)`, `barAt(t)`, `events('kick', t0, t1)`, `env('vocal', t)` and word timings found by content, never by hard-coded time.

## Why it is useful

It is the most thorough song-timing pipeline in any of the surveyed repos. Our other beat tools (`beat_grid.py`, `beats.py`, see [`../README.md`](../README.md#tools-inside-the-skills)) give a beat grid; this one adds **per-instrument onsets from separated stems, loudness envelopes per stem, and word-level lyric timing**. For a music-first piece (generate the score in ElevenLabs Music, then cut the motion to it) `analyze.py` alone gives everything needed to place cuts on downbeats, flash on kicks and drive glow from the bass envelope.

## Pipeline

```
uv run python -m demucs -n htdemucs_ft -o stems song.mp3     # stems (drums, bass, vocals, other)
uv run python analyze.py --plots                             # audio.json
# lyrics only:
uv run python ctc_emissions.py && uv run python whisper_run.py && uv run python vocal_feats.py
uv run python align.py --plots                               # lyrics.json
```

The lead-vocal stem for `align.py` came from a mel-band-roformer karaoke model through `audio-separator` (`stems/karaoke/lead.wav`). Models download about 4 GB into `.cache/`.

## Settings to change per song

These scripts were written for one song. Before using them on another, change:

- **Paths** (our change): set `SONG_AUDIO` (the song file), `SONG_LYRICS` (a `lyrics.src.js` with an array of `[start, end, "line"]`) and `SONG_DATA` (output folder). Stems are looked up under `stems/htdemucs_ft/<song file name>/`.
- **Tempo search range:** `analyze.py` searches 125–138 BPM (the `np.arange(125.0, 138.0, 0.02)` line in the tempo fit). Widen it for your track.
- **Sections:** `SECTION_BARS` at the top of `analyze.py` is hand-written for this song (intro, verses, choruses, outro in bars). Replace it with your track's structure.
- **Encoder delay:** `STEM_OFFSET_SAMPLES` in `common.py` (1015 samples) was measured for this mp3. For a WAV source set it to 0; for another mp3 measure it by cross-correlating a stem with the gapless decode.
- **Aligner anchors and Whisper vocabulary:** `ANCHORS` and `LINE_WINDOWS` in `align.py` (empty by default), and the vocabulary prompt in `whisper_run.py`.
- **Whisper backend:** `whisper_run.py` uses `mlx-whisper`, which runs on Apple silicon only. On Windows or Linux with an NVIDIA GPU, swap it for `faster-whisper` or `openai-whisper` (same word-timestamp output), and drop `mlx-whisper` from `pyproject.toml`.

## Changes from upstream

- `common.py`: the audio, lyrics and data paths read `SONG_AUDIO`, `SONG_LYRICS` and `SONG_DATA` when set, and the stem folder follows the audio file name. Defaults are unchanged.
- `make_fonts.py` moved to [`../../starters/pdoom-video-engine/scripts/`](../../starters/pdoom-video-engine/scripts/) (it builds the renderer's fonts).
- `uv.lock` (500 KB) left out; `uv` resolves from `pyproject.toml`.

## Requirements

Python 3.12+, [uv](https://docs.astral.sh/uv/), ffmpeg. Python packages in `pyproject.toml`: demucs, audio-separator, librosa, torch and torchaudio, numpy, scipy, soundfile, matplotlib, onnxruntime (and a Whisper package, see above).
