---
name: value-stagger-gradient
summary: As 16 bars enter, the delay is a time stagger, while four properties - height / hue / displacement / blur - are each spread into a numeric gradient from first to last; on the second beat the stagger origin is swapped to the centre and the pulse amplitude is spread afresh with the centre as the maximum
use_when: Showcase shots for technique demos and parametric capabilities; can also serve directly as the entrance of data / spectrum / equaliser-type interfaces
duration: about 5.0s (150f@30fps)
energy: Medium-high (the first beat is a continuous spread, the second beat's centre pulse is a definite single peak)
---

## Intent
Stagger is usually used only to offset time. What this card wants to say is that it can also offset **values** - the same index decides both
"when to move" and "how much to move". The two beats are a controlled experiment: in the first beat the origin is at the first position (the gradient spreads monotonically from left to
right), and in the second the origin is moved to the centre (the gradient spreads symmetrically about the central axis). What the viewer sees is not two animations,
but the same recipe with one parameter changed. The code caption on screen switches in sync to the corresponding stagger call, stating this outright.

## Motion core
- The core tool is an 8-line `staggerVal(i, n, a, b, ease)`: it normalises the index to `k = i/(n-1)`
  and then `lerp(k, a, b)` - equivalent to anime.js's `stagger([a, b])` value mode, with an optional ease to make the gradient non-linear
- Static gradients (written in setup, computed once): hue `staggerVal(i,N,200,320)`,
  max height `staggerVal(i,N,92,32)` - the 16 bars are naturally a slope from blue to purple and from tall to short
- Dynamic gradients (used every frame): displacement `staggerVal(i,N,46,14)`, blur amount `staggerVal(i,N,8,2)`
  - the first bar travels 46px and blurs 8px, while the last travels only 14px and blurs 2px. **In the same entrance every bar has a different travel**
- First-beat time stagger: `d = i*0.02`, `e = seg(t, 0.06+d, 0.28+d, E.outCubic)` - starting from the first position,
  the 16 are spread across a window of 0.3; `opacity = e`, `filter = blur((1-e)*b0)`,
  `translateY((1-e)*y0)` + height `hMax*e` (bottom-anchored, growing by height so the rounded corners are not squashed flat by scaleY), all three driven by the same e
- Second-beat origin swap: `distC = |i - 7.5| / 7.5` is the normalised distance to the centre,
  `w = seg(t, 0.56 + distC*0.13, +0.18)` - the central bars move first and the wave spreads towards both ends, which is `from:'center'`
- The second beat's amplitude is also a gradient: `amp = lerp(1-distC, 0.06, 0.42)`, with the centre bar pulsing 42% and the ends only 6%;
  `pulse = sin(w*π)` is a pure pulse, superimposed at the same time onto the height `hMax*e*(1+pulse*amp)` and
  `brightness(1+pulse*0.55)`
- The code caption is a syntax-coloured code strip, which at t≈0.52 swaps sentences with an up-and-down crossover over about 5f (the old sentence moves up and fades out, the new one replaces it from below), changing from `scale: stagger([1, 0.35])  hue: stagger([200, 320])`
  to `pulse: stagger([.06, .42], { from: 'center' })` - landing exactly between the two beats

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| Bar count | N=16 (`left: 8+i*5.4%`, width 3.4%) | 16 bars give the gradient enough steps; with <8 the gradient reads as "every bar is different" rather than one slope, and with >24 the bar spacing must be recomputed |
| Time stagger | `d = i*0.02` (≈3f/bar, total 0.3) | 3f is a flowing spread; >0.05 becomes roll-calling bar by bar and the "wholeness" of the gradient is lost |
| Single-bar travel | window 0.22 (≈33f, outCubic) | The travel is 0.73 times the total stagger → for most of the time a dozen or so bars are moving at once; with a travel < the total stagger it becomes one bar after another |
| Height gradient | `stagger([92, 32])`px | A 2.9x difference between first and last is a clear slope; a ratio <1.5 does not read as a gradient, and >4 makes the end bars too short to see |
| Hue gradient | `stagger([200, 320])` | A 120° span (blue → purple); with a span <40° the hue is wasted, and >200° wraps back round to red so the slope reads as a ring |
| Displacement / blur gradient | `stagger([46,14])`px / `stagger([8,2])`px | These two are the main evidence of this card's "value stagger" - change them to constants and the motion instantly degrades into an ordinary stagger entrance |
| Second-beat origin | `from:'center'`, `distC*0.13` | 0.13 is the propagation delay from centre to end (≈4f); at zero the whole row pulses at once and the `from` parameter has no meaning |
| Pulse amplitude gradient | `lerp(1-distC, 0.06, 0.42)` | Centre 42% / ends 6% is a 7x difference, making the waveform obvious; giving both ends large amplitudes too reads as the whole row bulging together, and the centre origin cannot be seen |
| Brightness pulse | `brightness(1 + pulse*0.55)` | A 55% brightening makes the pulse readable on a dark base; this term has no gradient (the same amplitude across all bars), which is intentional - with too many gradients stacked, viewers cannot tell which is the protagonist |

## Known pitfalls
- The first and second beats join end to start: the last bar's entrance ends at `0.28+15*0.02 = 0.58`, while the centre bar's pulse starts at 0.56.
  Adding bars or enlarging the time stagger lets the entrance eat into the pulse segment and the two beats blur into one - adding bars must push 0.56 back
- The end bars' second-beat window is `0.69→0.87`, after which until t=1 there is about 0.13 (20f) of complete stillness. This is the time given to
  viewers to see the "end-state gradient" clearly, not blank space
- The denominator of `distC`, `C=(N-1)/2`, divides by zero when N=1; `staggerVal` already guards with `n<=1 ? 0`,
  but `distC` does not - changing the bar count to 1 gives NaN
- The bar position `left: 8+i*5.4%` and width `3.4%` are hand-matched for N=16 (the last bar's right edge 8+15*5.4+3.4 = 92.4%).
  Changing the bar count means recomputing these two percentages, otherwise the bars overflow or crowd into the left half
- The caption is an anime.js API call string, which is essentially a **technique note** and not content. Used in a real finished film
  it should either be replaced with a meaningful title or removed - otherwise what viewers read is code
- The 16 small dots at the bottom (`bottom:17%`, opacity .35) are static decoration and take no part in any animation; their
  `left` offset `+1.2%` is a centring amount hand-matched to the bar width of 3.4%, and changing the bar width means changing it too
- The dark base (`#0a0b10`) + highly saturated bars (85%/66%) + 12px glow go together; in a light theme both the glow and the
  brightness pulse fail, and saturate or a shadow must be used instead to express the pulse

## Reference implementation
demos/ui-entrance/value-stagger-gradient/
(ValueStaggerGradient.tsx)
