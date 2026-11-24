# Short-form quality gates

Apply these to the encoded final, not only the source composition.

| Gate | Required evidence | Fail examples |
|---|---|---|
| Priority 1: reason to stay | "In the first 3 seconds is someone convinced they need to watch until the end?" Specific benefit, unresolved question, and actual ending payoff | Attention grabbed with no reason to continue, vague teasing, promise not delivered |
| Story | Exact retained script, hook, complete argument, payoff, CTA | Repeated retake, missing qualification, unrelated insert |
| Open loops | Viewer question, planted unresolved state, timed partial answers, earned closure before CTA | Random question mark, recurring decoration, withheld basic context, promise never answered |
| Asset discovery | Inspected shortlist before concept lock, exact intervals, legible action and consequence | Storyboard locked before reviewing supplied assets, dense UI shown too briefly to understand |
| Rough edit | Three distinct opening drafts and a moving animatic reviewed before final polish | Choosing by impact loudness, polishing a predictable slideshow |
| Rhythm and reading load | Sequence-level density changes, anticipation/payoff, caption-versus-heading audit | Metronomic cuts, three copies of the same sentence, simultaneous competing reveals |
| Entertainment review | Timestamped critique separate from technical QA, review modality stated | Playback completion reported as audience engagement, fabricated retention score |
| First three seconds | Encoded first frame, immediately meaningful image, specific reason to stay by 3 s, sound/impact alignment, clear opening word | Caption-only opening, long audio lead-in, masked consonant, unrelated bumper |
| Word timing | EDL-derived words, fresh final-audio ASR, spot checks | Cut consonant, missing word, caption ahead of speech |
| Cadence | Shot durations and semantic visual-event map | Repeated template, >2.2 s gap without a deliberate story hold |
| Layout | Every hero frame at full size and phone scale | Face cropped, mouth covered, text beyond safe region |
| Motion | Contiguous encoded frames across every transition | Black flash, one-frame pop, unexpected freeze, conflicting moves |
| Paper depth (paper briefs only) | Close inspection of object edges, shadows, perspective | Flat rectangles used as decorative slide containers |
| Dimensional typography (when chosen) | Full-size and phone-size major headings, bevel/edge, cast shadow, readable perspective | Flat titles above dimensional objects, muddy extrusion, glowing text |
| Layered entertainment | Encoded action-to-result sequences, foreground/background separation, moving object shadows | Same idle bob on every card, title changes without consequence, settle-and-freeze beats |
| Product authenticity | Saved source URLs and reviewed real page interactions or official marks when used | Approximate invented logo, fabricated product evidence, private data in a screen capture |
| Named entities | Transcript audit, verified portrait or authentic source material where recognition matters, saved provenance | Name-only treatment when a recognizable person is central, synthetic portrait presented as real |
| Editorial variety | Adjacent silhouettes and action mechanisms compared; encoded setup, action, and consequence | Repeated card reveal with different words, identical bobbing, visual activity without a story outcome |
| Logo fidelity | Exact supplied or official asset, checksum, and every encoded occurrence compared with it | Generic star used for Claude, traced or generated brand mark, distorted proportions |
| Footage balance | Duration ledger for the supporting track and total runtime; story-based selection rationale, authentic and synthetic separated | Shot-count-only percentage, counting facecam or still-image zooms as B-roll, repetitive diagram run |
| Material realism (physical material briefs) | Encoded close-ups and motion showing fibers, imperfect edges, contact and cast shadows, directional light | Flat cream fills with blur shadows, texture that disappears at phone size, noise obscuring words |
| B-roll | Probed moving footage, sufficient source duration at the chosen speed, reviewed selected interval, exact encoded frame count per segment | Ken Burns still, irrelevant action, synthetic proof, short source clip truncating the final export |
| No repeated footage | Scene identity and file-hash/interval ledger; duplicate and overlap negative controls | Same scene replayed, renamed, recropped, reversed, or regraded as a new insert |
| Action framing | Start, middle, end, and action peaks in each ratio; full subject, action, and result visible at phone size | Enlarged B-roll hides context, captions cover evidence, unreadable UI is the only explanation |
| Minimal dimensional craft (when requested) | Readable focal object, thickness, perspective, restrained type, light and contact shadows; sequence variety | Tiny object on an empty slide, harsh strokes, repeated flat cards, decorative motion |
| Audio revision | Measured bed reduction relative to reviewed version; varied purposeful SFX with inspected contact times | Master merely quieter, bed still masks voice, more music substituted for SFX |
| Sound | Actual listening when supported, plus stem and mix measurements | Voice buried, repeated loud whoosh, onset unaligned, clipping |
| Delivery | Every requested ratio (default 1080x1920; 1920x1080 when requested), independently framed and reviewed, correct duration, fast-start MP4, final hash | Wrong aspect ratio, missing final syllable, stale export |

The artistic test: each shot advances the story or changes the emotional emphasis.
Remove an effect that only demonstrates the renderer. Most graphics should show
an object doing something: a spec filling, a test resolving, a workspace assembling.
At least one metaphor returns with a changed meaning or completed state.

Calibrate new validators with negative controls. A caption shifted by 0.3 seconds,
a one-frame scene gap, and an omitted spoken word should fail the relevant checks.
Do not make the validator accept the current output merely to reach green.

The original workspace motion checklist has brief-dependent defaults. A warm
paper reel deliberately overrides black canvas, chrome text, halos, grids, and a
long outro. Preserve timing discipline, coherent materials, callback, full timeline
coverage, and rendered visual inspection.

If a review modality is unavailable, state it explicitly. A waveform establishes
levels and timing, not whether music is emotionally right. ASR establishes spoken
content, not whether every audio edit sounds natural. Never count one as the other.

When replacing a paper scene with footage, choose caption contrast from the
actual background, including qualifiers and small secondary text. Inspect the
first encoded frame of every inserted screen recording: fractional source seeks
must not leave an empty viewport before the footage appears. Review the entire
selected generated-video interval for malformed hands, gibberish focal text,
unintended marks, and implausible actions; generation success is not asset QA.
