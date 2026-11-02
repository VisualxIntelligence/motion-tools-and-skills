---
name: element-body-moves
summary: Element body feel - contact-shadow-lift (the contact shadow lifts off the surface): as a card lifts, the shadow on the table enlarges and fades in sync, and the paper leaving the table is proved by its shadow
use_when: Supplementing "position changes" with "body changes": gives a called-out card evidence of hovering; pairs with 2.5D camera moves and card-by-card call-outs
duration: A 150f 5s
energy: A low-medium
---

## Intent
All the motion cards in the library handle "position changes" - flying in, sliding, bouncing - and the element itself always stays a rigid body.
This style handles **body changes**: it gives hovering a believable piece of evidence - as the card lifts, the shadow directly beneath it enlarges and fades in sync,
the paper leaves the table, and the staging principle lays down the physical lines for the 2.5D camera moves. The difference from CameraMotionBlur:
shutter trails are the camera's business, while lifting off the surface is the body's business.

## Variant selection
| Style | Approach | Use when |
|----|------|----------|
| A contact-shadow-lift | On a desktop shot from an oblique high angle (rotateX 24°→20°), the card moves translateZ 96px along its normal + scale 1.05; the shadow is two independent solid layers lying on the desktop at z=0 (contact core + ambient shadow), which grow larger, blurrier and fainter with the lift and shift towards the side away from the light; the called-out card drops back with 8f in-cubic + a 2f slight press into the card shell, and the final selected card, after a spring lift, stays hanging in the air | Card-by-card call-out emphasis; the off-surface build-up of a 2.5D segment |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A lift amplitude | 2D: −28px + scale 1.08; 2.5D oblique high angle: translateZ 96px + scale 1.05 (visible screen displacement 40-50px) | Locked by precedent: banned when visible screen displacement is <12px (see Known pitfalls) |
| A shadow | Independent divs (2D uses an elliptical radial gradient; 2.5D uses a rounded rectangle of the same shape as the card + blur): contact core α 0.32→0.14, blur 3→25px; ambient shadow α 0.09→0.22, blur 14→54px, offset to the lower right; the card body carries no outer shadow | A box-shadow follows the card, and cannot give "the shadow stays on the table" |
| A landing | scale 0.99 press into the shell for 2f then 5f rebound to 1 | Without the slight press it reads as floating down, with no weight |
| Closing | After the last card is selected, hover for ~50f | If looping is wanted, change the last card to drop back in the same way |

## Known pitfalls
- The demo passed tuning on greyscale/placeholder material - the parameters are a tuning starting point, not battle-proven final values,
  and the first real use must re-verify them against real material
- A small-amplitude boost precedent: the original 8px lift was imperceptible, and only boosting it to 28px passed - in real use never dial it back below 12px; better not to use it than to use it weakly
- A lifts only one card at a time - with two leaving the table at once, viewers cannot tell who was called out (P4)
- Sound: a light suck on lift / a light set-down on drop (sound-design §4.5)

## Reference implementation
demos/ui-entrance/element-body-moves/
(ContactShadowLift.tsx: three video-shotcraft shot recipe cards "Pick your shot." on a porcelain oblique high-angle desktop, sweep - sweep - select, and the selected card is the logo sting bearing the mark)
