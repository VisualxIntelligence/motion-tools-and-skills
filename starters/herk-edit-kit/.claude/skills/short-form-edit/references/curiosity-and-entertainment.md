# Curiosity and entertainment workflow

First and highest-priority test: "In the first 3 seconds is someone convinced
they need to watch until the end?" Record the benefit, question, and earned
payoff that support the judgment. A technical validator or internal comparison
cannot establish that actual viewers are convinced.

Prioritize this gate over every aesthetic score. If the opening only earns
"that looked cool" and cannot answer "why should I stay?", revise it before
rendering the final. Document the editorial reason to pass or revise; never
invent a percentage of viewers convinced. Check again on the encoded export.

## Before composition

1. Read the exact retained speech. State the useful lesson a viewer receives by
   the end. Keep qualifications and do not manufacture a claim for a hook.
2. Pick an unresolved state viewers can understand immediately. Examples:
   three empty slots around an AI model; a project with an unfilled access slot;
   two parts that appear incompatible. Make the missing information specific.
3. Map setup, partial answer, reminder, and resolution. Use one main question
   with short subordinate questions, rather than many unrelated mysteries.
4. Draft three different openings: problem first, result glimpse, or recognition
   first. Each must lead naturally into the same source narration. Render their
   first three seconds cheaply, compare, and record the choice.
5. Build the entire moving rough edit. Use simple shapes and existing assets.
   Judge story before shadows. Recut speech only when needed and preserve its
   meaning; rebuild all timing-dependent artifacts after any EDL change.

## Loop ledger

Save OPEN-LOOPS.json as an array. Each item has:

```json
{
  "id": "main",
  "question": "What fills the three missing slots?",
  "object": "Three numbered empty slots around the model",
  "setup": 2.3,
  "updates": [{"time": 5.1, "state": "First slot becomes the specification"}],
  "closure": 38.4,
  "resolution": "All three named layers assemble around the same model",
  "supportingSpeech": "an entire system around Claude"
}
```

Times are output seconds. A checker can verify order, coverage, and source
anchors; only rendered inspection establishes whether the question is clear.
An object reappearing without resolving anything is a callback, not a closed loop.
Add an `opening` object with `benefit`, `evidenceBy3`, and `payoffTime` so the
highest-priority test has concrete evidence. Keep `supportingSpeech` verbatim
when quoting; label any paraphrased explanation as a paraphrase.

## Direct each sequence

- Expectation: what does the viewer think happens next?
- Development: what changes their understanding or gives a partial answer?
- Payoff: what result, contrast, or connection lands?
- Attention: which single thing should their eye follow?
- Rhythm: where does density increase, briefly release, then resolve?
- Sound: which cue anticipates, contacts, or releases? Which cuts stay quiet?

Do not force suspense into a straightforward explanation. Do not withhold the
topic, fabricate a failure, or add a vague "wait for it". A deliberately incomplete
editorial model must not be presented as an actual product failure or output.
Showing all answers on the first card closes a list-based loop prematurely.

## Review

At rough and final stages, review uninterrupted motion and actual sound when
the runtime supports perception of them. Record the actual modality. When only
stills/strips and signal analysis are available, use those honestly: inspect
chronological 0.25-0.5 second samples plus contiguous action strips, audit every
loop state, and do not call successful automated playback a listening/viewing pass.

Write timestamped weaknesses and decisions in ENTERTAINMENT-REVIEW.md. Compare
adjacent shots without headings; remove generic footage and repeated headline
copy that add no information. Distinguish audience measurements from editorial
judgment. If future user-provided retention data exists, relate drop-offs to exact
edit moments without assuming the edit caused them.
