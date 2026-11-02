---
name: chart-live-moves
summary: Three styles of live charts - oscilloscope-stream (the curve is written in real time at the right end + a sudden spike), unit-dot-swarm-regroup (the dot swarm migrates in three acts and gathers into a number), axis-rescale-shock (a new value bursts out of the frame and forces the y axis to rescale)
use_when: Data-narrative segments; respectively telling "real-time-ness", "every number is a person" and "growth does not fit"
duration: each 165-192f (5.5-6.4s)
energy: Medium-high (the data is the plot)
---

## Intent
A chart is not an illustration but a plot. The premise shared by the three styles (a measured precedent): **a real chart context is required**
- real axis labels / real data / real copy; greyscale placeholder bars cannot test the expressive power of a data narrative.
A oscilloscope-stream: the point where the curve is written is pinned at the right end and rises and falls, old data flows out of the frame to the left, and midway there is one
sudden spike (amplitude 2.2×, the readout jumping large and turning the accent colour) - "real-time" need not be spoken, and there is also an event;
B dot swarm regroup: 320 dots (each dot ≈40 renders) scatter → gather into three clusters (with real labels floating: Promo/Launch film/
Explainer) → line up into bars (real axis labels) → gather into a dot-matrix large number "12,847" -
the same batch of dots, and the viewer can follow one particular dot and watch it fall back into line;
C axis shock: the line climbs normally, and the new value breaks through the chart's ceiling guideline and bursts out 226px (an accent-colour thick line
inserted into the title area, crashing into the upper-right KPI number), pauses for half a beat, and the y axis rescales with a "whoosh" (old ticks fly out / new ticks slide in / the grid
densifies / the old line is flattened into the horizon), the new value drops back + a true-value label springs - using "the axis cannot hold it" to act out growth.

## Variant selection
| Style | Core action | Use when |
|----|----------|------|
| A oscilloscope-stream | Sampling window translating 8px/f + a Gaussian pulse spike (with precursor / aftershock) + a braking stop to true stillness + a slow push towards the spike after braking | Monitoring / real-time products: a "living" system |
| B unit-dot-swarm-regroup | Three-act spring staggered migration (stiffness 150, damping 13, stagger 8f), clusters packed tight in a sunflower spiral, the final act assembling the number from the dot matrix | User-count / composition narratives: "every dot is a person" |
| C axis-rescale-shock | Bursting out of the ceiling by 226px (guideline rupture + debris) + a three-way rescale linkage (ticks swap / grid densifies / old line flattened) + a 10px shake | Growth-curve highlights: a literalisation of "off the charts" |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Real context | Real title / real axis labels / real units / real readouts | **Premise for admission to the library**: the greyscale version was rejected on all three counts, and all passed after swapping in a real context |
| Protagonist colour | The accent colour marks the event / protagonist (demo: A coral-red spike, B cobalt Launch film cluster, C terracotta burst segment) | All grey does not read "where the point is" |
| A flow speed | 8px/f | 5.5 is already perceptible, 8 is clearer; the waveform is a pure function, random forbidden |
| B dot count / dot size | 320 / diameter 20px (stretched into capsules by speed during migration, capped at +20px) | Too few dots cannot assemble the number, too small and individuals cannot be seen; over-long stretching smears into one patch |
| C burst amplitude | 226px beyond the ceiling guideline | The 80px version is not "explosive" enough; actually inserting into the title area is what gives the feeling of an accident |
| Closing | All three styles need ≥36f of true stillness | A data chart drifting at the tail reads as not yet finished playing |

## Known pitfalls
- The demo is tuned with video-shotcraft's illustrative render data (A deep-blue oscilloscope screen - render farm fps, B porcelain-white infographic - render volume by film type,
  C sand-coloured Swiss poster - monthly render volume), and the values are illustrative - the parameters are a tuning starting point, not battle-proven final values, and the first real use must re-verify them against real material
- The readouts / ticks / labels of all three styles are sized for the finished film's type size (≥32px, main readout 120-176px); the chart fills the frame rather than shrinking inside a card
- The three styles are three independent techniques, not a set menu - when using two or more in the same film, each ≤1 time and in separate segments
- A's spike event and C's rescale can happen only once; repetition is cheap
- B's final-act digit glyphs must be worked out by hand beforehand (the dot count = the digit's dot positions fully used to be tidy; the reference implementation samples a single-line skeleton at equal arc lengths, in a double row along the normal, exactly 320 dots with no overlap)
- Division of labour with dataviz-landscape-open (an abstract data landscape opening): that is opening atmosphere,
  while these three styles are concrete data arguments inside a segment
- Sound: for A a warning tick at the spike; for B a whoosh per act of migration; for C a riser as it bursts out of the frame
  and a "cascade" sound for the rescale

## Reference implementation
demos/data/chart-live-moves/
(AxisRescaleShockV2.tsx / OscilloscopeStreamV2.tsx / UnitDotSwarmRegroupV2.tsx)
