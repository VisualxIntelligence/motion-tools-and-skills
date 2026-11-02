---
name: slam-entrance-moves
summary: Three high-energy slam-in variants: kanada-perspective-snap, a Kanada-style perspective sudden stop; score-slam, a score slamming down; impact-burst-kit, a landing-point impact kit (rippling out to neighbouring cards)
use_when: Heavy-punch entrances for hero cards/KPI cards; impact-feedback handles the feedback after landing, while this card handles the case where the entrance itself is the impact
energy: High
duration: Per-variant action segment 6–22f + impact aftermath ~16f + hold ≥45f (demo: A 120f / B 135f / C 140f)
tags: ui-entrance
---

## Intent
The ceiling of force in the library's entrance vocabulary has always been deck-deal-flyin's "dealing" — fast but not heavy.
This card fills in the "slam" tier, in three flavours: A is a sense of direction — a card is flung in hugging the camera with fisheye-level exaggerated perspective,
and flattens with a "pop", the swagger of the anime Kanada school; B is a sense of weight — a KPI card
slams down from 2.6 times its size in front of the camera, with a ring + dust motes + screen shake trio detonating on the same frame, with the
heft of a sports score pop-up; C is a sense of transmission — on top of B's trio, as the shockwave front sweeps over the left and right neighbouring cards it
visibly pushes them away and lets them spring back, "this hit shook the neighbours", saying how strong the force is in a single move.
Select by narrative need: to tell the viewer "it's coming" use A, "it's heavy" use B, "it shook
the whole room" use C.

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| A kanada-perspective-snap | perspective 260→1800px + rotate3d 62°→0 + scale 1.8→1 flung in over 18f (pose settles later than displacement), in the last 5f an overshoot of +6° springs flat + speed lines, and the long slanted shadow straightens | A single card's swaggering debut; anime/light-hearted tone |
| B score-slam | The card slams down from scale 2.6/rotate 5° in front of the camera over six frames of ease-in(quad); on the landing frame shock ring + shard sparks + screen shake + white flash on the same frame, and the score digits land a second time 3/6f later | The arrival of KPI/score-type heavyweight numbers |
| C impact-burst-kit | The main card slams from in front of the camera into an empty slot on the page + B's trio + the shockwave front is calculated precisely by radius-distance to sweep the neighbouring card frames, the neighbours are pushed out 34px + rotate ±3.5° and spring back with damping | "Whole-room shaking" when the page already has neighbours |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A fling-in | 18f: translateX −1350→0 on EASE.snappy (sudden stop), perspective/twist/scale on the late-settling curve bezier(.62,0,.3,1) 16f — the card rushes into place "twisting" and flattens only in the last few frames; horizontal SpeedBlur by x velocity (0.2× speed, ≤26px) + 7 speed lines behind it | Faster than 12f and the fisheye distortion cannot be read, slower than 24f and the energy leaks; if pose and displacement settle on the same curve at the same time, it is already flat a few frames before arrival and only the first frame has any fisheye feel |
| A settling | rotateY rushes to +6° over 15–20f, from 20f spring(damping 16) back to 0 + 8px screen shake for 2f + 48 speed lines retreating outward over 9f + the slanted long shadow straightens; text inside the card settles 3f later (the title's −10° skew straightens) | The "pop" is in the overshoot rebound, not at the end of the displacement; speed lines beyond 10f read as an effect sticker |
| B slam-down | 0–9f hovering in front of the camera (2.75→2.6, blur 10px, semi-transparent so the background shows) → 9–15f ease-in(quad) slamming to 0.965 → spring(damping 14) back to 1 | An ease-out landing is "putting down", only ease-in is "slamming" |
| B trio | Shock ring diameter 120→1500px/16f (white core 9→1.5px + gold soft glow) + 14 polygonal glass/gold-foil shards flying 280–580px (+16 sparks) + screen shake 18px exponential decay over 5f (biased vertical) + 2f white flash | The original proposal (720px/10px dust/8px shake) was imperceptible at every level, so the real render was already ×1.5–2; solid black thick rings/black square dust read as "stickers" |
| B decoupling crux | The ring/dust "spread" uses out-cubic, and the "dissipation" uses linear frame time | With out-cubic for both the early part runs too fast and fades out just after spreading |
| C ripple frame | Front passes neighbour card centre distance solved in reverse (ring radius 100→1100/16f, 514px distance ≈ 3f after the landing); envelope cos(t/2)·e^(−t/8), hard-clamped to 0 at 40f; horizontal motion trail by velocity at the instant of being pushed | A neighbour card moving on the same frame as the main card reads as the whole layout shaking; 3f later is what reads as "caught in the ripple" |
| C hover wind-up | 0–16f the main card hovers above the empty slot: lifted 20px, scale 1.55→1.6 (smooth), the contact shadow in the slot becoming more solid with the height, then 16–22f ease-in(cubic) slams into the slot | A dead stop during the hover reads as "stuck"; a wind-up amplitude above 30px becomes a different action |
| Depth of field | When B/C are close to the camera (large scale) apply blur by height (B ≤10px, C ≤7px), sharp on landing | A close-to-camera element that stays sharp instead fails to read as "slamming down from in front of the camera" |
| Close | Truly still ≥45f after all aftermath returns to zero | Give a heavy punch twice the usual hold (same as the beat-cut A precedent) |

## Known pitfalls
- The demo was tuned with video-shotcraft's promotional content (A the launch film premiere card / B the "Shotcraft vs Keyframes" final score / C the finished-film spec page Launch film card) — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- On a bright field (C) the shock ring needs a layer of white pressure disc underneath and the ring itself in a saturated accent colour, while on a dark field (A/B) use a white core + coloured glow;
  a white ring on a bright background / a black ring on a dark background is almost invisible
- All three variants carry screen shake, and for the screen-shake family (impact-feedback) the same shot
  can have only one shake source; among the three variants, only one may be chosen for the same shot as well
- Sound is strongly required: A's "pop" and B/C's sonic boom must be pinned on the same frame (sound-design §4.5),
  and in a silent version the B/C trio reads as "the card twitching"
- In the C variant the neighbour cards must first be on screen and stable for ≥15f before being caught in the ripple — if a neighbour is pushed away while still entering itself,
  the causal chain cannot be read
- At most 2 slam-ins per film; with three or more, every one being loud amounts to none being loud (P4)

## Reference implementation
demos/effects/slam-entrance-moves/
(ImpactBurstKit.tsx / KanadaPerspectiveSnap.tsx / ScoreSlam.tsx)
