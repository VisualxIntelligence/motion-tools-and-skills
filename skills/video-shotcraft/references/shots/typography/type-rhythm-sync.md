---
name: type-rhythm-sync
summary: Two variants of text synchronised to sound — font-weight-pump (strokes thicken on drum hits and spring back) and karaoke-fill-sync (words light up one by one with the narration)
use_when: Passages where a title / tagline is strongly bound to the audio track; A binds to the beat (drum hits), B binds to speech (narration word by word)
duration: A FontWeightPump 165f / B KaraokeFillSync 150f; A 128 BPM with 14f per beat and a 9–13f decay window, B each word 18–33f according to speaking rate
energy: A high (club feel) / B medium (read-along guidance)
tags: rhythm
---

## Intent
Everything in the text-motion library until now was about "how it enters", and nothing governed "how text already on screen comes alive with the sound".
These two variants fill that gap: A turns the title into a rhythm organ — strokes twitching thicker on the bass drum and springing back,
the text dancing, suited to a visual subwoofer for high-energy passages; B turns the tagline into read-along captions —
whichever word the narration reads, that word fills with colour and lights up from left to right, the gaze led along, suited to voice-over /
tagline emphasis passages. What they share is **the text does not move, the attributes do**: no displacement, no entrance or exit,
purely weight / colour breathing on the sound's beat points.

## Variant selection
| Variant | Technique | Use when |
|---------|-----------|----------|
| A font-weight-pump | On the hit frame thin-weight text is instantly propped up into black weight (variable weight interpolated continuously), decaying and springing back over 9–13f; accent beats widen an extra 6%; from bar 2 echo lines with top and bottom outlines grow and follow the beat, and the drop beat settles into a bold gradient poster | Music-driven high-energy passages; the title as subwoofer |
| B karaoke-fill-sync (fill colour as read) | A two-line tagline on a light ground (demo "FRAME MOTION / CRAFT SHOTS"), each word filled bright from left to right with a soft edge, progress following speaking rate, the word being read filled with the accent colour, then dropping back to the primary ink colour and holding once read; a read-along underline beneath the active word | Narration / voice-over emphasis passages; gaze guidance for multi-word taglines |

## Parameters
| Parameter | Typical value | Tuning feel |
|-----------|---------------|-------------|
| A pulse envelope | `env=(1−t/D)^0.8` (t = frames after the hit; in the demo each character's rebound is staggered from 9f at the centre → 13f at the edge, returning exactly to 0 at ≥D); fontWeight `250+650·env` interpolated continuously (SF Pro variable weight); each character is pinned in a slot laid out at **weight 900** — at rest thin-weight text leaves gaps between characters, and on a hit the strokes fill the slot and "close up", with the whole line not reflowing; without a variable font, fall back to an env>0.15 window with a 300↔900 jump + `-webkit-text-stroke` continuous decay to patch the transition | Laying the slots out at the heaviest weight is the key: laid out at the regular weight, the characters squeeze and overlap each other at the peak |
| A beat | 128 BPM one beat per 14f (16/30/…/114) + a drop at beat 9 (128f); the first beat of each bar is an accent `scaleX = 1+0.06·env` and tinted pink; after the drop surges to 900 it does not return to thin, falling back over ~16f and freezing at weight 780 + a purple→pink per-character gradient + a horizontal light band | The beat spacing must be > the longest decay window (14>13), and two overlapping beats read as twitching |
| A echo lines | from bar 2 one line each above and below with the same text in a 2px outline, pulsing 2f late following the beat and pushed apart 26px each beat (the drop pushes apart 60px and then returns) | Progression comes from "adding layers" rather than increasing amplitude; put echoes on already in bar 1 and there is no card left to play afterwards |
| A beat reference object | an 8+1-cell step sequencer below the frame (two bars + a DROP cell), the cell for whichever beat is hit lights up and enlarges 12%, with cells already passed keeping a dim glow | In a muted environment (preview / still frame), without this row of cells it cannot be read as "following the beat"; only let the cells and the text move, and do not pump the whole frame per beat |
| B word-level timetable | per-word [start,end] frame ranges, linear fill within a word; 4–10f pause between words (a breath) | In real use the timestamps come from the narration's marking table; even distribution reads as machine reading aloud |
| B word-level timetable (demo) | FRAME 20–38, MOTION 42–75 (long word read slowly), CRAFT 85–103, SHOTS 107–130; 0–19f preparation, 130–149f truly still | Giving long words a longer reading window reads as real human speaking rate |
| B fill implementation | each word is two layers of the same text stacked: the bottom layer light grey (ink at 13% transparency) + the top layer revealed by progress: `mask-image: linear-gradient(90deg, #000 e−4%, transparent e+4%)`, e=p·108−4 (a ±4% soft-edge front; for a hard cut use `clipPath: inset(0 (1−p)·100% 0 0)`); the word being read is filled with the accent colour, dropping back to the primary ink colour 10f after it is read | Independent per-word layers avoid measuring each word's width proportion; a single clip layer for the whole line needs a precise pixel table and easily drifts |
| B read-along marker | an 8px rounded underline beneath the active word (the demo uses the accent colour), width = p·100%; after reading it is drawn away from left to right over 6f | A 4px light grey is invisible in a 1080p thumbnail (a pit hit in this batch's real render); words already read leave no line |
| B narration reference object | a 48-bar narration waveform beneath the tagline: rising and falling where words are read, dropping back at breaths, with the already-played part tinted the accent colour | In a muted preview / still frame, without this waveform it cannot be read as "reading along" |
| Ending | A: after the last beat's decay returns to zero / B: after the last word is filled, truly still ≥20f | R1 breathing precedent |

## Known pitfalls
- The demo was tuned on greyscale / placeholder material — the parameters are a tuning starting point, not a battle-tested final version;
  the first real use must be re-verified against real material
- Both variants are techniques **heavily dependent on sound**: A's hit frame must be on the same frame as the drum hit, and B's fill ranges must
  follow the narration's word boundaries (frame pinning follows sound-design §4.5 relative start) — put in a silent film, A reads as
  a seizure and B reads as an inexplicable colour change, so do not use them in passages without an audio track
- Variant A depends on the system's variable font (macOS SF Pro) for continuous wght interpolation; with another font or on a render machine without a variable font
  it falls back to a few jumping steps, so first confirm font loading and renderer support, and if not possible use the stroke + jump fallback
- Variant A at most 1 passage per film (P4) — a title dancing to the beat is a big scene-stealer, and two passages in the same film undermine each other
- Variant B at most 6 words per screen: with more words the fill progress cannot be read in time, so split into lines or shots

## Reference implementation
demos/typography/type-rhythm-sync/
(FontWeightPump.tsx / KaraokeFillSync.tsx)
