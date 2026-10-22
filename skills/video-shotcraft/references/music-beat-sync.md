# music-beat-sync — BGM Rhythm Analysis and Beat-Hit Methodology

In a film with strong-rhythm BGM, **all transitions and key motion must land on the beat**. This document gives a fully reproducible process from
"you have a track in hand" to "finished-film cut-point error ≤3 frames". Measured: a
70s, 18-shot, 131.97 BPM strong-kick promo film was made by this method, and in the post-render back-test all cut-point
errors were ≤2.2f (the perceptual threshold is about 3f).

## Contents

- When to enable
- Measuring the beat grid
- Drum-hit classification and energy structure
- Grid acceptance and artifacts
- Arranging the timeline in beat numbers
- Post-render back-test
- Tool notes

## 0. When to enable

At stage 0, first check whether the user has already specified the music.
- Already chosen → follow this document: analyse the rhythm first, then anchor every cut point / motion in the storyboard to a beat number
- Not chosen → BGM selection moves to stage 6 (see pipeline.md); in that case the motion timeline is arranged by content rhythm, without forcing beat hits

**Iron rule: music first.** Do not design the storyboard until the grid has passed acceptance; when the durations do not fit, change the
timing parameters, and do not delete or alter the user's copy. Throughout the analysis record moments in floating-point seconds, and **convert to frames only
at the last step of entering Remotion** (rounding early makes the error snowball down the pipeline).

## 1. Measuring the beat grid (do not trust the beat_track tempo scalar)

Run a one-off script with `uv run --with librosa --with scipy --python 3.11`:

```python
import numpy as np, librosa

y, sr = librosa.load("bgm.mp3", sr=None, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, tightness=400, units="time")

# Key step: fit an equally spaced grid to the beat sequence by least squares to get the true BPM and phase.
# The tempo scalar returned by beat_track can be off by 2%+ (measured 129.2 vs true value 131.97),
# but the beat time sequence it outputs is itself good — fit the line t_i = t0 + i*T to the whole sequence:
i = np.arange(len(beats))
A = np.vstack([i, np.ones_like(i)]).T
(T, t0), *_ = np.linalg.lstsq(A, beats, rcond=None)
bpm = 60.0 / T
residual = beats - (t0 + i * T)
print(f"BPM={bpm:.2f}  t0={t0:.4f}s  T={T:.5f}s  residual ±{np.abs(residual).max()*1000:.0f}ms")
```

Acceptance criterion: a residual ≤ ±15ms (within half a frame) means the track has machine drums and the grid is trustworthy;
a large residual means there are tempo-change sections and a piecewise fit is needed.

**The half-time / double-time ambiguity must be checked**: beat detection often jumps between 2x/0.5x (a 70 BPM track reported as
140). The criterion is not how it sounds, it is the drum-hit data in the next section — under the correct grid the kicks should
mainly land on whole beats; if half the kicks land on beats and half on half-beats, the grid is most likely twice too fast.
Compute the score for the three candidates 0.5x/1x/2x using the metrics in §3, and choose the one with the highest coverage.

**For complex tracks, separate the drum stem first**: arrangements heavy on vocals/bass bury the drum attacks,
and both beat_track and onset detection will drift. The lightweight option is `librosa.effects.hpss` to take the percussive
component; the heavy option is Demucs to separate the whole drum track (see §6), after which all drum-hit detection is done on the drum stem, not on the full mix.

## 2. Drum-hit classification and energy structure (deciding what gets pinned to which beat)

### 2a. Three-class transient detection

Different drum parts drive different types of motion; measure each frequency band separately (on the drum stem or the hpss
percussive component):

| Class | Band | Motion it drives |
|-------|------|------------------|
| kick | 40–160 Hz | impact / slam / sudden shrink — the beat where the picture "gets slammed" |
| snare | 150–500 Hz body + 1–3 kHz impact face (both must be present) | replacement / flash cut / composition switch — the beat of "changing to another thing" |
| hihat | 6–14 kHz | micro-motion density — in sections where the hihat is dense the micro-motion can be dense, and in sparse sections it must be pulled back |

```python
from scipy.signal import butter, sosfilt
def band_env(y, sr, lo, hi):
    sos = butter(4, [lo, hi], btype="band", fs=sr, output="sos")
    env = librosa.onset.onset_strength(y=sosfilt(sos, y), sr=sr)
    return env, librosa.times_like(env, sr=sr)

kick_env, times = band_env(y, sr, 40, 160)
# List the env energy at each whole-beat position and sort to find the strongest hits:
for n in range(int((times[-1]-t0)/T)):
    t = t0 + n*T
    e = kick_env[np.argmin(np.abs(times - t))]
    # Record (beat number n, energy e), and take the top few as "big slam candidate beats"
```

Record hits as a list of `{t seconds, s strength, k class}` and archive it, and take from it by class when designing the storyboard.

**The hit table is a candidate pool, not a trigger.** Not every detected kick needs a matching
picture impact — in a strong-kick track (tech-house type) there is a kick on almost every beat, and executing "slam" on every beat
is "the shots shake with the rhythm" (an actual user complaint, see aesthetic-rules R4).
The kick→impact mapping is used only to pick the strongest hits of §2b from the candidate pool (2–3 in the whole film);
the other kicks serve only as **timing** references for cut points and element-level motion, and do not drive picture amplitude.

### 2b. RMS energy curve and structure table

Pull the whole-track energy curve with `librosa.feature.rms` and, together with the drum-hit density, cut out the section boundaries.
Two things are produced for the design spec:

- **Music structure table**: from which beat the energy is full, and at which beats the breakdown / silent sections fall —
  the storyboard's energy curve should be arranged to hug it (placing a brand breathing slot at a breakdown is a natural structure),
  high-energy shots may run multiple layers of motion in parallel, and low-energy sections pull back to 1–2 layers
- **Strongest-hit beat-number list**: the 2–3 biggest slams in the whole film (opening statement / climax / ending)
  must be pinned to these beats

**Pitfall (stepped on in practice)**: the biggest slam was pinned to b52.5 (between two beats) while the strongest
kick was on the whole beat b52, and the post-render back-test deviation was +5.75f. The accents of a strong-kick track almost always fall
on whole beats, and half-beat pinning must be backed by env data and cannot rely on how it sounds.

## 3. Grid acceptance and artifacts (accept first, storyboard afterwards)

Align the candidate grids (including 0.5x/1x/2x) one by one to the nearest real drum transient, and compute four metrics:

| Metric | Meaning | Threshold |
|--------|---------|-----------|
| match | Proportion of grid beats that hit a real transient | ≥98% |
| mean_abs_ms | Mean absolute alignment error | <10ms |
| drift | Slope of the linear regression of the residual against time (drift) | <5ms accumulated over the whole track |
| First-beat validity | Whether grid beat 0 lands on a real musical attack | Required |

Pick the winning grid by score, and write **all candidates and the reasons for the winner** into the analysis artifact for the record.
When unsure, synthesise a click track for each candidate grid and overlay it on the original track to listen, but the final decision is made by
the metrics, not by how it sounds.

The analysis artifacts are archived with the project (they are the audit chain for every cut point):

```text
analysis/
  beat_data.json    # bpm, t0, T, beats[], hits[{t,s,k}], rms[], sections[]
  grid_drift.json   # match/error/drift of each candidate grid, and the reasons for the winner
  click_*.wav       # candidate click tracks (optional, for audition re-checking)
```

The moments in `beat_data.json` are always floating-point seconds, never pre-rounded; downstream depends only on the field names
`bpm / beats / hits / rms / sections`.

## 4. Write the timeline in beat numbers, not frame numbers

In a Remotion project, turn the grid into constants, and express every shot boundary / motion keyframe with `beatF()`:

```ts
export const FPS = 30;
export const SOURCE_BEAT0 = 0.2244;  // t0 from source music analysis, seconds, consistent with beat_data.json
export const BEAT_INT = 0.45465;     // T, seconds
export const OUTPUT_AUDIO_OFFSET_SEC = 0; // fill in the measured value when the post-render back-test confirms an output audio track offset (§5b)
export const beatT = (n: number) =>
  SOURCE_BEAT0 + OUTPUT_AUDIO_OFFSET_SEC + n * BEAT_INT;           // beat → seconds
export const beatF = (n: number) => Math.round(beatT(n) * FPS);    // beat → frame

export const SHOTS = {
  s0_open:  { from: 0,        to: beatF(8) },
  s1_slam:  { from: beatF(8), to: beatF(16) },
  // ...every shot boundary is beatF(whole beat); motion inside a shot uses local beats:
};
export const localBeat = (shot: {from: number}, n: number) => beatF(n) - shot.from;
```

The benefit: when you change the track / section, change two constants and the whole film is rearranged; the SFX frame-pinning table is also written as `beatF(n)`,
sharing the same source of truth as the picture, so it can never misalign. The source analysis value and the render offset are accounted separately:
`SOURCE_BEAT0` is the audit truth and is never changed, and the output offset goes only into `OUTPUT_AUDIO_OFFSET_SEC`.

**Anchor-binding rules** (which use the grid, which use real transients):

- Dense regular cut points (a cut every beat / every two beats) → use the winning grid's `beatF(n)`
- Sparse accents, isolated freeze-frames → **pin to the real transient**, and do not use grid interpolation points (tiny drift of the grid
  in sparse places is magnified by a single accent into a perceptible deviation)
- Ending freeze-frame → the last real transient + RMS silence confirmation (to avoid pinning to the reverb tail)
- Video material / SFX are aligned by **internal peak**, not by file head:
  `material start = target beat time − (peak time − trim offset)`; locate the peak with the audio energy
  envelope or FFmpeg frame differencing

Design rules:
- Shot durations are in beats (4/8 beats per shot), and acceleration sections can use half-beat / quarter-beat steps
  (such as the converging approach of CUT_BEATS = [48, 49.5, 50.5, 51, 51.25])
- Step-type shots with one action per beat (a list revealed item by item, a mosaic cell by cell) map beat numbers directly
- When the BGM drum hits are already dense, keep SFX restrained: pin only actions unique to the picture, give big slams to only 2–3 places,
  and leave the rest to the BGM's drums
- **Whole-frame impacts have a hard cap** (all instantaneous impacts acting on the whole frame or camera layer, such as
  whole-frame scale pump / screen shake / flash frame / negative frame): ≤3 in the whole film, in one-to-one correspondence with the §2b strongest-hit
  list, adjacent ones ≥16 beats apart; beat-pump types hit consecutively ≤4 beats at a time
  and ≤1 time in the whole film, followed by a full hold after they finish (the values marked on each card are the floor).
  The counting unit is **one use of a technique** (one application of one card = one slot); cards containing
  multiple internal flash frames (multi-flash / multi-cut sequences) do not repeat the count frame by frame, and their internal
  structure is governed by each card's own parameter table and cap on the number of uses
- **Beat-hit motion by default lands on the hero element layer** (card / title / number), and the whole frame and camera layer
  by default do not take part in beat-by-beat motion; "one action per beat" refers to content stepping (a list item by item, a mosaic
  cell by cell), not to a picture amplitude pulse
- Structural motion (deformation / camera move / pose) uses continuous frame functions; impact events (appear / replace /
  flash / sudden shrink) switch on and off at the selected frame. Multiple layers of motion hitting on the same frame make an accent; to
  stagger them, stagger by only 1–2 frames, and it must be a design intent — an accidental misalignment coming from rounding is not allowed

## 5. Post-render back-test (closed loop, mandatory)

### 5a. Report the two kinds of error separately, without conflating them

- **Audio ground-truth error**: the distance between the designed cut-point seconds and the real transient seconds, which verifies
  the analysis pipeline; thresholds: mean <5ms, all within ±33ms, 90% within ±15ms
- **Visual quantisation error**: the rounding error introduced by converting seconds to the nearest renderable frame, which verifies
  whether the frame rate is enough; the error of the `beatF()` rounding step is this, recorded anchor by anchor

The upper bound of the nearest-frame rounding error is determined by FPS: ±16.7ms at 30fps, ±8.3ms at 60fps, and
±4.2ms at 120fps. **Do not claim a <5ms visual precision for a 30fps delivery**; when the quantisation error report exceeds tolerance, raise the frame rate, rather than
changing the audio analysis.

### 5b. Back-test by extracting the audio track from the rendered film

```bash
ffmpeg -i out/promo.mp4 -vn -acodec pcm_s16le /tmp/render-audio.wav
```

Re-run the grid fit of step 1 on the rendered audio track (measure the BGM from the video, not from the source file —
this way audio encoding / alignment offsets are verified as well), then compare one by one:
**the designed cut-point frame number vs the frame number of the nearest measured beat**, and output an error table.

| Verdict | Error |
|---------|-------|
| Pass | ≤3f (perceptual threshold) |
| Ideal | ≤1.5f |
| Must fix | Any cut point >3f |

Pinned points whose error exceeds the limit go back to step 4 to change the beat number or frame offset, then re-render and re-test, until the whole table passes.

**For a systematic same-direction offset, check the output audio track offset first; do not hand-fix point by point.** If the error table shows a same-direction,
equal-size offset (all cut points consistently +N frames), the root cause is almost always the audio track
offset of the render output chain (AAC encoder priming and other encoding / muxing steps, typically ≈1.28f at 48kHz;
mechanism and measurement method in sound-design §4.6), not an error in the beat analysis. Diagnosis: take
the original BGM file and the rendered audio track and measure the offset by normalised cross-correlation. Fix: **set the output offset as a separate
constant, and do not write it back into the source analysis value** — the t0 in `beat_data.json` is the analysis truth and audit baseline of the source music,
and mixing the render offset into it causes double compensation when the codec is changed or the track is re-analysed. In the code keep the two accounted
separately:

```ts
export const SOURCE_BEAT0 = 0.2244;        // t0 from source music analysis, consistent with beat_data.json, never mixed with the render offset
export const OUTPUT_AUDIO_OFFSET_SEC = 0.0427; // output audio track offset, measured per render pipeline (sound-design §4.6)
export const beatT = (n: number) => SOURCE_BEAT0 + OUTPUT_AUDIO_OFFSET_SEC + n * BEAT_INT;
```

All cut points in the whole film snap into place at once through `beatT`; **do not hand-edit beat numbers anchor by anchor**; compensation on the SFX side
uses the same constant via sound-design §4.6. The perceptual harm of this kind of misalignment goes beyond "inaccurate":
when the picture impact is 2–3 frames off you cannot hear that it follows the drums, and reasonable beat-hit motion is read as groundless shake.

## 6. Tool notes

- librosa is not in the system python: `uv run --with librosa --with scipy --python 3.11 script.py`
- For tracks with only vocals / a complex arrangement, beat_track drifts: first separate the percussive component with `librosa.effects.hpss`
  and then measure; if it is still not clean, bring in Demucs to separate the drum track —
  `uvx --from demucs demucs --two-stems=drums -n htdemucs bgm.mp3 -o analysis/`,
  after which all of §1/§2 is run on `drums.wav`
- When the BPM cannot be pinned down (cross-validating several methods): madmom's RNN+DBN and Essentia's
  RhythmExtractor2013 can serve as the second and third votes beyond librosa; when the three do not line up,
  go back to §3 and vote by transient coverage, do not guess
- Variable-tempo tracks (DJ transitions, accelerando): first confirm the tempo-change points with a librosa local tempogram
  (a window of about 5s), then fit piecewise by energy section, each section with its own t0/T
