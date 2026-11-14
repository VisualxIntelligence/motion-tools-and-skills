# emil-kowalski — notes

**Source:** [emilkowalski/skills](https://github.com/emilkowalski/skills) @ `0f2e23b` (13 Nov 2026): the `animation-vocabulary`, `choreograph` and `animate` skills. MIT, © 2026 Emil Kowalski ([LICENSE](LICENSE)). Copied 14 November 2026.

Emil Kowalski's skills come from design-engineering work on product UI (Vercel, Linear). Three of the nineteen are useful for motion pieces as well as interfaces, and are kept here as guides. Each folder is still a complete skill and can be installed as one.

| Folder | What it is |
|---|---|
| `animation-vocabulary/` | **A reverse-lookup glossary**: describe a motion loosely ("the bouncy thing when a popover opens", "draws itself in") and get its exact term, with one or two alternates and how they differ. About 90 terms under entrances and exits, sequencing, transforms, state transitions, scroll, feedback, easing, springs, loops, polish, performance and principles. Use it to write precise motion prompts and briefs |
| `choreograph/` | **Several elements moving together**: cast each element (lead, support, decoration, or still), pick together / overlap / sequence for each pair, sync secondary motion to the moment that matters, direction and exits, interruption. Required output: a timeline, a list of what does not move and why, and a feel check. `RECIPES.md` has worked sequences |
| `animate/` | **One animation built in decision order**: should it animate at all, purpose, cheapest tool, properties, easing and duration or a spring, interruption and exit, reduced motion. `RECIPES.md` has worked builds |

Numbers worth keeping:

| Topic | Value |
|---|---|
| Easing | Entering or exiting `ease-out`; moving on screen `ease-in-out`; hover `ease`; constant motion `linear`. Never `ease-in` for something the viewer is watching arrive |
| Curves | `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`; `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`; `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` |
| UI durations | Press 100–160 ms; tooltip 125–200 ms; dropdown 150–250 ms; modal or drawer 200–500 ms; "marketing and explanatory can be longer" |
| Springs | `{ duration: 0.5, bounce: 0.2 }`; bounce 0.1–0.3, and none in most UI |
| Stagger | Product UI 30–80 ms per item, total under about 300 ms; hero and first-run moments 100–150 ms steps on 0.5–0.6 s entrances. Order by importance, not by DOM order; never uniform; the lead moves furthest, support less, decoration fades in place |
| Sequence | Only when overlap would look wrong (two rich states in one resizing container, one element passing through another, cause then effect), and start the second move just before the first ends |

## Using it for films

- **The choreography rules carry over unchanged**: one entrance per container, never a uniform stagger, vary distance as well as delay, overlap the handoffs so a queue reads as one gesture.
- **The durations are UI numbers.** For video, use the "marketing and explanatory" end and the broadcast scaling in [`../../../skills/motion-design-principles/NOTES.md`](../../../skills/motion-design-principles/NOTES.md#using-it-for-broadcast) (reading holds, longer stagger budgets).
- **The implementation sections are CSS, Motion and React.** For GSAP, map `ease-out` curves with `CustomEase.create('out', '0.23,1,0.32,1')` and staggers with `stagger: { each, from }`.
- Reduced-motion and pointer-gating rules apply to web deliverables, not to rendered films.

## Changes from upstream

- **Removed** the "Initial Response" section at the top of each `SKILL.md` (a fixed greeting naming the author's philosophy, shown before any question). Otherwise unchanged.
- **References to sibling skills** (`review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations` and others) point at upstream's repo; they are not copied.
- **Not copied:** the other 16 skills, which are UI- or platform-specific (`emil-design-eng`, Sonner, Expo, Swift, mobile web, gestures, UI-library picks, break-ui, Apple design, reviews and audits of app animation, animation performance), and the README's course and newsletter links.
