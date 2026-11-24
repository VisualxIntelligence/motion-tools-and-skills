# WhisperX — notes

**Source:** [m-bain/whisperX](https://github.com/m-bain/whisperX) @ `8d8e43b` (21 Nov 2026), version 3.8.7rc1. BSD-2-Clause, © 2024 Max Bain. Read 24 November 2026. **Nothing copied:** install with pip.

## What it does

Whisper transcription, then **forced alignment with a phoneme model**, which gives every word its own start and end time (Whisper alone is only accurate to the segment). It is batched and fast on a GPU, uses voice-activity detection to cut hallucinations, and can label speakers with pyannote.

- **Arabic alignment is built in.** For `--language ar` it loads `jonatasgrosman/wav2vec2-large-xlsr-53-arabic` from Hugging Face. English, French, German, Spanish and Italian use torchaudio models; many other languages have a Hugging Face default (`whisperx/alignment.py`).
- **Speaker labels** need a Hugging Face read token (`--hf_token`), and you must accept the pyannote model terms on Hugging Face first.

## When to use it

- **Captions** that change word by word, and karaoke-style lyric fills. Feed the word times into `skills/kinetic-reel`, `painted-animation`'s `karaoke.js` or a HyperFrames caption layer.
- **Cutting picture to the voice-over:** land a number or a reveal on the spoken word. See rule 3 in [`../../docs/guides/explainer-grammar/`](../../docs/guides/explainer-grammar/NOTES.md).
- **Checking a TTS voice-over** against its script before building to it.

## Using it (on the RTX 4090 / 3090)

```bash
pip install whisperx                     # needs PyTorch with CUDA, and ffmpeg
whisperx vo.wav --model large-v2 --language ar --output_format json --highlight_words True
whisperx vo.wav --model large-v2 --language en --compute_type float16 --batch_size 16
whisperx vo.wav --model large-v2 --diarize --hf_token $HF_TOKEN       # with speaker labels
```

- The JSON output holds `segments[].words[]` with `word`, `start`, `end` and `score`.
- For a voice-over you wrote, check the transcript against the script before trusting the times.
- Low on GPU memory: `--compute_type int8`, a smaller `--batch_size`, or `--model medium`.

## Limits

- Words with no characters in the alignment model's dictionary (upstream's examples: "2014." and "£13.60") **are not given a timing**. Write numbers out as words in the alignment text, or time them by hand. This matters for news, where the numbers are what the picture lands on.
- Overlapping speech is handled poorly.
- Arabic alignment quality depends on the community wav2vec2 model. Check a few words against the waveform before cutting a film to it.

**Not tested here.** No GPU in this session.
