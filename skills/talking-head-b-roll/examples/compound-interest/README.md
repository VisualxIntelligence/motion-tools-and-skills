# Compound interest

> "Add b-roll to my video talk.mp4, I'm posting it on YouTube."

Recording: `curl -o talk.mp4 https://cdn.iart.ai/video-asset/ai-b-roll/compound-original-a.mp4` (43 s, 1920×1080, 25 fps; the presenter is an AI avatar).

(Contact sheet of the finished film: see upstream [iart-ai/b-roll-skills](https://github.com/iart-ai/b-roll-skills); not copied here.)

| Time (s) | What she says | Treatment | On screen |
|---|---|---|---|
| 0–3.35 | "Here's why starting early matters more than starting big." | Speaker | She opens the film |
| 3.35–7.86 | "Say you put $10,000 somewhere, it grows 7% a year, and you never touch it." | Overlay | A card beside her builds: "$10,000", "+7% a year", "and never touch it" |
| 7.86–17.84 | "After 10 years… $19,700. After 20… $38,700, after 30… $76,000." | Cover | The growth curve draws and stops at each figure as she says it |
| 17.84–22.06 | "Now compare that to simple interest…" | Speaker | Back to her between the two charts |
| 22.06–28.42 | "After 30 years, that's $31,000. Same rate, same money. Compounding more than doubles it." | Cover | The simple-interest line against the curve, ending at $31,000; "More than double" |
| 28.42–31.48 | "There's a shortcut for this called the Rule of 72." | Speaker | |
| 31.48–38.76 | "Divide 72 by your growth rate… At 7%, that's about 10 years." | Cover | 72 ÷ growth rate ≈ years to double, built term by term, then 72 ÷ 7 ≈ 10 years |
| 38.76–43.04 | "The math doesn't care how much you start with…" | Speaker | She closes the film |

`--check` passes with one warning the agent kept and explained: the first cover runs 10 s, because it is one chart building through three figures.
