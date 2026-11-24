# Explainer grammar — eight ways to animate a voice-over

**Source:** [alchaincyf/huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion) @ `a97c450` (17 Nov 2026), version 1.3.1. MIT, © 2026 alchaincyf (花叔) ([LICENSE](LICENSE)).

- [`cards/`](cards/) holds the nine original grammar cards and the overview (`00-overview.zh.md`, upstream `references/09-视频动画语法.md`), **in Chinese**, unchanged.
- This page is an English translation of the overview's two tables and its cross-grammar rules, made 24 November 2026.

The cards were measured from real YouTube, tech, AI and finance explainers. Each gives shot lengths, eases, transitions, palette, pitfalls and a correction log. Upstream renders each grammar from a JSON spec with its own engine. That engine (with its fonts, 17 MB) is not copied: install the full skill with `npx skills add alchaincyf/huashu-art-motion` to render the clips. The rules below work in any engine, including HyperFrames, GSAP and Remotion.

## The eight grammars

| Grammar | Use it for | Core idea | Typical shot | Main ease | Main transition |
|---|---|---|---|---|---|
| **y1 Kurzgesagt-style flat science** | scale, "what is inside", systems | Draw an abstract idea as one concrete object in a glowing world that zooms forever; the camera travels between scales; the background moves gently, the subject changes on VO beats | hard cuts every 7–9 s; a visual unit every 4.6–6.7 s | bezier(.75,0,.25,1); loops on easy-ease | lens reveal into the object; fill-and-pull-out match cut (log zoom) |
| **y2 Vox-style collage** | arguments with real documents, news, screenshots, people | The argument laid out on a desk of real material; the camera moves like an investigator's eye; lines and highlighter draw on in steps | slow 3.3 s median (one card 3–7 s); fast 1.4–1.8 s | camera sine in-out or a long tail; elements stepped at 12 fps | hard cut; pan along a red line; push into a photo, then cut |
| **y3 whiteboard (RSA)** | chains of reasoning, steps, "why" | Write a line as it is said; the camera follows the argument across one big board, then pulls back to show it all | 6.6 s median per block | pan 1.2–2.4 s sine in-out; long jumps 0.8 s whip with motion blur | the camera move is the transition; pull back to close |
| **y4 storytime character** | first-person stories, mishaps, punchlines | The voice is the star; pictures are reaction images: a pose snaps in 0.1 s, then holds; a laugh lands on a cut to a reaction close-up, in silence | ASL 2.43 s (median 1.87 s) | 0.1 s expo-out pose change + squash settle; character at 24 fps | hard cut, smash, whip, jump-in |
| **y5 kinetic type** | lists, "X stages", quotes, number openers, chapter cards | The words are the actors: key words slam in on the stress, the main word is big enough to read at once, one focus at a time | one bar per shot (~2 s at 120 BPM) | expo-out in, spring slam, faster expo-in out | zoom into a colour block, colour bands, page push |
| **t1 3Blue1Brown-style** | how one mechanism becomes another: networks, matrices, gradients, probability | Only the thing being explained, on black; transform the last concept straight into the next; colour = concept name; almost no cuts | one animation 1–3 s + 1 s hold; a concept 8–20 s | smoothstep 6t⁵−15t⁴+10t³, almost everywhere | transform continuity; zoom through; fade-shift |
| **t2 keynote UI** | launches, version updates, tutorial steps, specs | One thing per screen: the product screenshot or object is the star and gets pushed into; names and numbers land when spoken; glow backgrounds and glass cards are optional and used sparingly | 5–8 s per keynote screen; product cuts 1.5–3 s | spring (bounce 0–0.15), Apple-style out | blur push; card expands to full frame |
| **t3 finance chart** | revenue, share prices, share, turning points: numbers viewers will screenshot and check | Build the axes first, grow the data, then annotate one thing only; **values are always honest**, animation only decides how they appear | 2.5–6 s per chart | quint-out; lines on smoothstep | panel slide-push; zoom into a detail; hard cut with the layout held |

A ninth card, **y6 presenter explainer** (finance explainer with a host), is a grammar card plus whole-film code that needs your own character frames.

## Which grammar for which stretch of voice-over

One film can change grammar between sections, but never mix two inside one section.

| When the voice-over is… | Use | Not | Why |
|---|---|---|---|
| explaining a concept or mechanism | **t1** (derivation, formulas) or **y1** (scale, friendliness) | y2 (no real material to pin, so it becomes a fake archive) | Mechanisms read through transformation and scale |
| **news, events or history, with screenshots and quotes** | **y2 Vox collage** | y1 (flat cartoon weakens credibility) | Viewers want to see the source |
| a personal story or punchline | **y4** | t2 (brings good-news emotion) | The laugh lives in the reaction pause |
| a list, a few points, stages, a quote | **y5** | t1 (nothing to transform) | The information is structure, not picture |
| a product, tutorial step, feature or spec | **t2** (screenshot full-frame and pushed into) | t1 | One thing per screen; names and numbers are the stars |
| numbers, growth, trends, comparison | **t3** | t2's big number (only when there is one number) | It needs axes and units, and must survive scrutiny |
| reasoning step by step | **y3** | one full-screen switch | Write as you speak; the final pull-back is the payoff |

Two fallbacks:
- **Real screenshots to show:** use t2 (tutorial, clean) or y2 (argument, evidence feel). Make the screenshot the main picture, near full frame, always scaled in proportion, never cropping key UI.
- **Only one number in the section:** don't draw a chart. Use t2 or y5's big counting number, landing on the frame the number is spoken.

## Rules that hold across all eight

1. **The camera is a function of time; the scene redraws at the camera's vector.** Push, pan and fly-through are one world canvas redrawn under different cameras. A 60× zoom stays sharp, and the previous shot's camera keeps moving through a transition.
2. **Zoom on a log scale, and far enough to pass an opening.** Log interpolation enlarges by the same factor each frame; linear starts slow and ends violent. To pass through a round opening of radius r, the zoom must be at least (distance from its centre to the farthest screen corner) ÷ r, about 1100 ÷ r when centred.
3. **Land the reveal on a beat or a word.** The frame where the new picture opens should fall on a bar line: segment start = bar line − (reveal point × transition length). A number should finish counting as it is spoken: count start = time of the spoken number − count length. Whiteboard writing starts about 0.5 s after the phrase.
4. **Structure, then data, then annotation.** Axes first, data grows, annotation last, one annotation per shot. 3Blue1Brown writes the question before the demonstration; keynotes go kicker → product name → subtitle.
5. **One focus per screen.** One thing enters at a time while the rest hold. Main word to secondary text at least 3:1. The background sits a step lower in saturation, contrast and line weight than the subject.
6. **Enter slowly, leave fast, hold after landing.** Enter 0.3–0.4 s, leave about 0.18 s. Hold a landed number at least 0.5 s, and a punchline at least 0.9 s. 3Blue1Brown waits about 1 s after each animation.
7. **Move on events; let the camera come back.**
   - The camera moves only when the eye needs a new place. Transitions are gentle pushes, pans and pull-backs (0.6–1.5 s, eased in and out, as measured from Vox and 3Blue1Brown).
   - Fast pushes (0.28 s, 18–32 % closer) and slams (0.17 s, scale 1.55 → 0.94 → 1.0) are only for reveals, reversals and key numbers.
   - After pushing in, pull out or pan away; never push in three shots running.
   - The same move on every shot reads as slides, whether it is a constant slow push or a fast push per shot (one 102-second film pushed in about 48 times and was judged "too many, too fast, not smooth").
   - Slam numbers and big words onto objects in the film's world (a screen, a battery bar, a price tag, a blackboard), never onto a plain colour card. In blind review such cards read as "a PowerPoint slide inserted".
8. **Two frame rates.** Smooth camera, stepped elements: Vox moves the camera smoothly but steps paper, highlighter and typing at 12 fps; storytime runs characters at 24 fps and the camera at 60. All-smooth looks corporate; all-stepped judders.
9. **Colour = concept; few accents.** One colour per concept (W in the formula and its connecting line share a blue). Beyond 3–4 meaningful colours nobody remembers them. Vox uses black, paper white and one red; the whiteboard uses black and one orange.
10. **Transitions on a breath or a topic change, never mid-sentence.** Whips land between sentences; reaction shots sit in silences; whiteboard pans mark a new point; Vox cuts on punctuation.
11. **Review logic and numbers, not just looks.** Errors caught in practice:
    - "rose 8.7 times" should have been "rose to 8.7 times";
    - a counter restarted from 0 after expanding to full screen;
    - a hidden layer was wired to pixels;
    - multiples must be computable from the numbers shown.
12. **Real material is the main picture, kept as it is.**
    - Screenshots, photos, footage and original text go full or near-full frame and are pushed into the part being discussed. Code only explains, labels and moves the camera.
    - Screenshots are scaled in proportion, never cropping key UI.
    - Animation changes how data appears, never what it is. Bars start at 0; a non-zero axis is labelled.
    - **Illustrative data is labelled "illustrative" in every shot, and real data never carries that label.**

## For our news explainers

- **y2 (Vox collage)** is the grammar for news, with real documents, screenshots and quotes.
- **t3** is the grammar for markets and figures.
- **Rules 3, 11 and 12** are the newsroom's own standards written as motion rules. Add them to the critic's checklist.
- **For Arabic**, the cards' type advice assumes Chinese and Latin text. Keep Arabic words whole (no per-letter animation), and follow `docs/techniques.md` for right-to-left layout.

## Left out

- The 53 art-style recipe cards (`references/风格配方/`): some imitate living studios and shows (Ghibli, Pixar, Kirby, Rick and Morty, South Park, Shinkai).
- The engine, demos and showcase: the showcase uses Nintendo characters and real people.
- `storyboard_lint.py`: it parses Chinese storyboards only. Its checks are listed in `cards/00-overview.zh.md` and are worth copying into an English linter: on-screen numbers must appear in the VO script, at most 8 words on screen, no text-led first or last shot.
- The two analysis scripts are in [`../../../tools/film-analysis/`](../../../tools/film-analysis/NOTES.md).
