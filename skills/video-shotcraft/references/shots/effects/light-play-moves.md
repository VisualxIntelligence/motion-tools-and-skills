---
name: light-play-moves
summary: Two light-effect variants: spotlight-sweep, a spotlight sweeping across text, and sheen, a single-point sweep of light
use_when: Treating light as another kind of brush stroke (sweep/wipe): dark-field headline reveal (A), crowning a hero card (B)
duration: A 170f ~5.7s / B 150f ~5s
energy: A medium / B low
tags: typography
---

## Intent
"Light" in the library had only ever had one spot-shot technique, spotlight-hero-card; these two variants make light into a
system, with two kinds of brush stroke and two duties: A is the **sweep** — a headline almost invisible on a dark field is swept bright
by a swinging cone of light, lighting up wherever the light goes; the difference from spotlight-hero-card is that that one lights a card,
this one sweeps text; B is the **wipe** — a 45° highlight band wipes slowly across a dark-ink hero card once, clipped by its
rounded corners, a silent coronation.
Everything is on a dark background or a dark hero — **brightening is invisible on a white background** (precedent), and that is the foundation of this whole card.

## Variant selection
| Variant | Method | Use when |
|----|------|------|
| A spotlight-sweep | Two layers of the same text: the dark version stays at 0.07, the bright version follows the light spot via a radial mask, the pendulum-style follow-spot swings two and a half back-and-forths and damps to rest at dead centre, then the iris opens to full brightness and holds (the demo headline is "Craft the shot.", closing on the video-shotcraft wordmark) | Dark-field big-headline reveal opener |
| B sheen-sweep | A dark-ink card (demo: a titanium-black metal card with the single-colour video-shotcraft logo and wordmark etched in) turns toward the light source while a 115° highlight band sweeps once, clipped by overflow hidden at the rounded corners | One coronation during the still section of a hero card |

## Parameters
| Parameter | Typical value | Tuning feel |
|------|--------|----------|
| A contrast | Dark version 0.07 vs full bright 1.0; the demo is warm-white #f8efe2 serif type against a burgundy-black velvet curtain (#1a0a0d→#070203), and the curtain itself is also lit only inside the light spot | Contrast is the whole of this variant; with a dark version >0.15 there is no "lighting up" |
| A light spot | ellipse 360px (hard core + long soft edge), pendulum: x = 960+600·sin θ·env, θ starting from −π/2 (far left), period 50f, running 2.25 periods to f121; y follows a downward-concave arc (lowest at centre, 44px); env smooth-eases to 0 after the first back-and-forth, with x and velocity both reaching zero at f121 (a pure sin would brake hard at the centre where it is fastest); on switch-on, a tungsten-filament warm-up flicker twice over 4–10f | f121–141 the iris opens 360→1080px to full brightness (out-cubic), and the light cone narrows linearly into a soft top light (precedent: diffusion/dissipation decoupled) |
| B highlight band | Width 2× card width, 115° gradient: wide soft light 0.14 + narrow bright core 0.5 (warm white, screen), swept once over 58–90f swift; over the same period the card rotateY 21°→14° (turning toward the light source = the physical motivation for the sweep); the brushed-grain texture under the band and the bright duplicate of the etched text are revealed by the same mask | A 0.5 core is loud enough on titanium black without smearing; two-way clamp + conditional mounting guarantee a single sweep |
| Removing the layer | The sweep (B) is conditionally mounted and unmounted once finished; the A light cone narrows into a permanent soft top light | A layer with opacity 0 is still composited every frame — unmount unused light-effect layers directly |
| Close | A ~30f / B ~55f hold; the hold section keeps only very slow motion (A dust motes and top-light breathing, B card rotateY another 1.5°) | No handheld shake (Q3) |

## Known pitfalls
- The demo was tuned on greyscale/placeholder footage — the parameters are a tuning starting point, not a final production setting,
  and on first real use they must be re-verified with real footage
- **At most 2 light effects in total across the whole film** — light is the quickest technique to cheapen; every card flashing once
  amounts to a cheap template
- The B variant passed on a high-bar retry: the old rejection (2026-07-13 precedent) was because the implementation at the time looked bad,
  not because the approach was infeasible; the four constraints = single point + hero + rounded-corner clipping + one sweep only; violating any
  one of them returns it to the rejected zone
- A dark background is the foundation: both variants depend entirely on a dark background/dark hero; for light effects on a white background skip this card directly
- A and spotlight-hero-card are an either-or within the same film, both being "spotlight" vocabulary

## Reference implementation
demos/effects/light-play-moves/
(SheenSweepRetry.tsx / SpotlightSweepReveal.tsx)
