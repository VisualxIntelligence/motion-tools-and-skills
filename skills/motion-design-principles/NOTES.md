# motion-design-principles — notes

**Source:** [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) @ `f9a8a04`, the `skills/motion-design/` folder. MIT, © 2025 LottieFiles ([LICENSE](LICENSE)). Copied 22 October 2026.

## What it is

A skill that makes the agent **decide the motion before writing animation code**. It works through an 8-step checklist:

1. emotion;
2. personality;
3. duration;
4. easing;
5. choreography;
6. property choice;
7. quality checks;
8. troubleshooting.

The output is a set of decisions an implementation then follows. It has no code and no renderer, so it works with GSAP, HyperFrames, CSS, Three.js or After Effects.

| Path | What it is |
|---|---|
| `SKILL.md` | The checklist, personality presets, recipes (button press, card entrance, success, error shake) |
| `director/` | Philosophy, decision framework, Disney principles in UI numbers, personality, emotion map, choreography, narrative, context adaptation |
| `patterns/` | Entrance and exit, state feedback, ambient loops, multi-element stagger |
| `reference/` | `timing-easing-tables.md`, property selection, quality checklist, troubleshooting |

The numbers it gives:

| Topic | Values |
|---|---|
| Durations | Tooltip 80–120 ms; card 200–350 ms; modal 300–400 ms; page 400–600 ms; dramatic reveal 600–1200 ms |
| Distance and exits | Distance scaling: 100 px = 1.0×, full screen 1.8–2.0×. Exits take 65–75% of the entrance |
| Stagger | Micro 20–40 ms; standard 50–100 ms; dramatic 100–200 ms |
| Overshoot | Success 5–10%; error 0%; celebration 15–25% |
| Choreography | The 1/3 distance and 1/3 simultaneity rules; counter-motion at 20–30% speed; parallax at 1.0 / 0.5 / 0.2; 100–200 ms of stillness after a sequence; setup / action / resolution at about 25 / 35 / 40% |

## Using it for broadcast

The numbers are tuned for **app UI** and a viewer at arm's length. For 1080p video seen across a room, scale them:

- **Durations.** Use the upper end of each range, or more: a news number needs to land and then hold.
- **Holds.** Give a reading hold of at least 1 s, plus about 0.25 s per word beyond three. The reading window, not the entrance, is the constraint.
- **Stagger budgets.** "Total stagger under 500 ms" is a UI rule; a 6-item list in a package can take 0.6–1.0 s.
- **Fix a motion language per show.** One easing family, three durations and one stagger value.
- **Map them into GSAP:**
  - `gsap.defaults({ ease: 'power3.out', duration: 0.45 })`;
  - `stagger: { each: 0.06 }`;
  - a `CustomEase` for the signature curve.

## When to use it

At the start of any motion piece, before the build; and when reviewing a draft that "feels off", using `reference/troubleshooting.md`.

## Changes from upstream

- **Renamed.** The skill's `name` is changed from `motion-design` to `motion-design-principles`. Two other skills copied into this repo also use `motion-design`, and installed skills must have unique names.
- **Otherwise unchanged.**
- **Left out.** The README.
