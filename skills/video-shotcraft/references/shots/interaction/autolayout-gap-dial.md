---
name: autolayout-gap-dial
summary: A gap dial drives the layout — a row of link blocks with a selection outline + gap spacing annotations, the badge number ticking up notch by notch, the blocks pushed apart in real time by the parameter and then springing back into place; a visualisation of "parameter-driven layout"
use_when: The "change one number and the interface moves with it" selling-point shot for design-tool / low-code products; the category language of "packaging with design-tool semantics"
duration: ~5s (150f: selection entrance + wind-up retract 10f + loosening 34f + held-breath hold 20f + spring rebound + settle hold)
energy: Medium (tool-rationality type, the thrill lies in the locked synchronisation of number and displacement)
---

## Intent
"The parameter changed, the UI changed" is the core promise of a design tool, but it is usually shot as a before/after comparison of "click the panel → cut to
the result", with the causality cut out. This card shoots the causality as one continuous shot: the gap badge
number ticks up notch by notch, the link blocks are pushed apart **on the same frame**, and the measurement line lengthens in real time — the number is the rein,
the layout is the horse. The selection outline + 8 handles + gap annotations are all the native language of design tools, so the audience recognises at a glance
"this is parameters being adjusted in a tool". The return deliberately uses an underdamped spring overshoot (shrinking tighter than the start
and then settling), making "settling back into place" an elastic closing beat. Division of labour with type-and-filter:
that is the search causality of "type content → list converges", while this card is the parameter causality of "dial a value → geometry rearranges".

## Motion core
- **One gap parameter governs everything**: block positions are recomputed from gap (the whole row stays centred), measurement
  line width = gap, the badge is pinned to the gap centre, and the large readout at the top and the dial scale — all elements derive from the same value, and locked synchronisation
  is the whole of this card's persuasiveness
- Parameter curve: first a wind-up retract 12→6 (10f swift, "pull back before rushing out"); the outbound 6→104 takes 34f swift
  (asymmetric in-out: slightly fast at the start, a very soft landing); held-breath hold 20f; the return is spring(damping 9, stiffness 80,
  mass 1.1) deliberately overshooting below the start before settling (overshoot section ×0.45 compressed: 104→about 7 then back to 12, gap never negative)
- The readout is the protagonist: a 196px thin-weight tabular number at the top + px unit + a 760px dial scale (the ticks roll horizontally with gap through the centre
  gold needle); while being dialled the readout turns from white to measurement gold (with ~6f of afterglow), and fades back to white after release and settling; the value is displayed in steps of 2,
  with a scale pulse of 1+0.06·|sin| × a speed gate on each tick
- The navigation blocks get a horizontal motion blur according to their own speed (block speed = (i−2)·dgap/dt, the outer blocks drag the longest trails), and zero at rest
- The selection outline springs in from 26px outside, the 8 handles pop out staggered by 1.2f, and the overall row size is shown live next to the layer name;
  gap annotation = dashed extension lines ×2 + a measurement line with end ticks + a following badge, rising in a stagger
- Demo art direction: graphite dark stage, two colour semantics of selection white + measurement gold (in the picture only the number being dialled has colour);
  the camera pushes in very slowly by 2.5% throughout

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| gap amplitude | 12→104px (original film 20→24, the demo enlarged per ruling) | The original film's amplitude is almost imperceptible to the eye — perceptibility precedent: if it cannot be seen, enlarge it into an extreme version; in real use at least 4–5× the travel |
| Wind-up | 12→6, 10f swift | Retracting first and releasing after builds force for the main action; a retract >30% reads as number jitter |
| Outbound duration | 34f swift | Too fast reads as a twitch; slower than 60f and the binding between the number ticking and the displacement loosens |
| Held-breath hold | 20f | Lets the audience read the "loosest" frame clearly; <12f and the peak is not read |
| Return spring | damping 9 → overshoots below the start then settles (overshoot section ×0.45, tightest about 7px) | The overshoot is the source of the "rebound on release" feel; damping ≥13 drops straight in, which is a pity |
| Number stepping | Step 2 + tick scale pulse 0.06 × speed gate | Ticking by 1 is too fine and reads as a stopwatch; the step is the granularity of the "dial click" |
| Motion blur | Horizontal stdDeviation = min(9, \|block speed\|×0.5) | Appears only during the dialling section; permanently on, it makes the block text unreadable |
| Annotation geometry | Extension line 58px, measurement line pinned at block bottom +74px, badge pinned to the gap centre | Annotations must be recomputed in real time with gap — a lag anywhere breaks the illusion at once |
| Block width | Unequal (252/206/278/268/220, height 120) | Equal widths read as a schematic; unequal widths feel like real navigation |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are tuning starting points, not battle-tested final values,
  and the first real use must re-verify against real footage
- Number and displacement must share a source and a frame: the badge's displayed value and the block coordinates both derive from the same gap, and if animated separately, even a 1f difference shatters the trust in "parameter-driven"
- The demo's large top readout + dial scale share a source and frame with the layout; in real use, if the picture already has a real tool panel (an inspector value box), delete the large readout so the number is not reported twice
- Family extension: gap is only one dimension, and radius/padding/rotation can swap in as the parameter with the same grammar — but dial only one parameter per shot, two or more read as random fiddling
- The selection outline + handles are a borrowing of "design-tool semantics" (the native language of figma/framer), so use with caution in films for non-design-tool audiences; if the selection is not understood, all that remains is blocks shifting
- Sound: one very light tick per badge notch (dial click), one pop on the rebound settle; tick density follows the stepping

## Reference implementation
demos/interaction/autolayout-gap-dial/
(AutolayoutGapDial.tsx)
Original source: framer-ai 4.5–5.5s
