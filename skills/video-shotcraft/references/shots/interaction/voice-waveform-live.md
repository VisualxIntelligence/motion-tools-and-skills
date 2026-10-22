---
name: voice-waveform-live
summary: A recording capsule's live voiceprint — 64 thin vertical bars rise and fall with "speaking", tall in the middle while speaking and shrunk to a dotted line during pauses, the waveform scrolling from right to left; the full performance of speak → pause → speak → submit collapse
use_when: Feature shots for voice input / AI assistants "listening to you speak"; sections with no UI content to show but needing sustained liveliness to hold up the picture
duration: 172f (~5.7s: entrance 14f + speak 1.4s + pause 0.8s + speak 1.4s + submit collapse / tuck into bubble 0.8s + hold 0.7s)
energy: Medium (functional liveliness, not showmanship)
---

## Intent
This card is a **functional** voiceprint: a live receipt of "listening to you speak". The crux is causality:
the waveform jumps with "the user speaking" and is the product's feature itself, not decorative packaging that jumps with the BGM.
Tall while speaking, shrunk to a row of dots during pauses, history scrolling out to the left — the audience reads from the rise and fall of the waveform that "it is really listening", and a 6s+ picture is held up entirely by this
liveliness, with no other content needed. Division of labour with gauge-readout-moves: a gauge is the
mechanical ritual of "reporting a value", while this card is the vital sign of "continuous listening", with no final value.

## Motion core
- **Frame-deterministic pseudo-randomness is the crux**: mulberry32 takes values at integer sample points + smoothstep
  interpolation between neighbours (value noise), with no Math.random — renders are reproducible and adjacent frames are continuous
- Sense of scrolling: the sample time of bar i = f - (N-1-i)·1.6,
  the rightmost bar is "now" and history flows left; it is not the bars translating, each bar reads the signal of a different moment
- Bar height = speaking envelope (trapezoid seg, two levels of speak/pause + syllable noise 0.55+0.45·noise)
  × middle spatial weight sin^0.8 × per-bar jitter (0.35+0.65·noise);
  silence is clamped to a 6px dotted line
- Submit: the button compresses over 3f scale 1→0.82→1 with a rebound, the waveform collapses over 12f ease-in
  to 0.06, and the microphone breathing ring expands outward with the envelope
- The demo adds a layer of live transcription (92px bold): each word rises from faint to solid at the syllable start of its beat, the just-spoken word is in the accent colour
  and settles to ink a few frames later, with a trailing cursor blinking during pauses; on submit the whole transcript moves up, shrinks and tucks into an accent-colour message bubble —
  the "pause" can be read from both the text and the waveform at once, and the end frame is a complete conversation poster

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Bar count / gap | 64 bars, gap 5px (1240px wide capsule, voiceprint area ≈820px) | Fewer than 40 bars reads as an equaliser; denser than 90 and the single bars cannot show their rise and fall |
| Scroll rate | 1.6 frames/sample point | Too fast and history flushes by like a glitch; too slow and the "scrolling feel" vanishes into jittering in place |
| Speak/pause envelope | seg trapezoid rise 5f / fall 7f; demo speak 15–57f, pause 80–124f | The pause section must truly collapse into a dotted line — without the contrast of "pause", "speak" does not hold |
| Syllable noise | 0.55+0.45·noiseAt(t/4.5) | Without the syllable layer the waveform is a smooth hill and the "cadence of a sentence" cannot be read |
| Middle weight | sin^0.8 spatial envelope | Without the weight all bars are equal height like an equaliser; an exponent >1.5 makes the middle stand out alone like a single bar jumping |
| Silence clamp | max 6px dotted line (dots in a neutral weak colour, speaking bars in an accent gradient) | Clamping to 0 makes the waveform vanish and read as a broken line; the dotted line is "listening but you are not speaking" |
| Submit collapse | 12f ease-in to 0.06 + button compress-and-rebound 3f | The collapse is "this passage has been taken away"; a fade-out cannot convey the submit semantics |
| Transcription rhythm | A word's appearance frame = that word's syllable start (within the envelope's rise section), 8f from faint to solid | A word appearing before the waveform reads as subtitles ahead of the sound; 10f or more late reads as delayed recognition |
| Tucking into the bubble | 22f EASE.swift move up + shrink to 0.72, bubble base / white text following over 10f | Fading out the transcript alone cannot convey "sent" |

## Known pitfalls
- The demo was tuned on the warm bright stage of the video-shotcraft voice-dictation storyboard ("Shotcraft is listening") — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- **When there is an audio track the waveform must follow the human voice**: if the film carries real narration / voice, the envelope's speak/pause sections must align with the track's speak/pause, and a one-second misalignment breaks the illusion; only films with music and no voice may use a purely synthetic envelope
- The demo is a bright-stage warm-white solid capsule (a 1.5px inner highlight at the top + two layers of landing shadow); for a dark-stage film switch to a glass capsule with a 1.5px gradient edge, and the voiceprint parameters stay unchanged
- The microphone is already an SVG line icon (the early emoji + grayscale placeholder has been replaced), and in real use simply replace it from the brand icon library
- Sound: the picture of this card is "the shape of sound", and it works best with a human voice; one light pop on the submit button + a short downward glide for the collapse

## Reference implementation
demos/interaction/voice-waveform-live/
(VoiceWaveformLive.tsx)
Original source: raycast-teams 19.5–26.0s
