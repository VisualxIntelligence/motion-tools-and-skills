# Travel times to the planets

> "Here's my talking head video talk.mp4. Add b-roll. I edit in DaVinci Resolve."

Recording: `curl -o talk.mp4 https://cdn.iart.ai/video-asset/ai-b-roll/space-original-a.mp4` (41 s, 1920×1080, 25 fps; the presenter is an AI avatar).

(Contact sheet of the finished film: see upstream [iart-ai/b-roll-skills](https://github.com/iart-ai/b-roll-skills); not copied here.)

| Time (s) | What he says | Treatment | On screen |
|---|---|---|---|
| 0–6.50 | "How long does it take to get to the moon, Mars, or Jupiter? It depends. The fastest Apollo mission, Apollo 8," | Speaker | The hook: the viewer meets him first |
| 6.50–8.95 | "took just under three days to reach the moon." | Overlay | "Apollo 8": a craft crosses an Earth→Moon line, then "just under 3 days" |
| 8.95–14.90 | "Mars is about 50% further from the sun… Getting there takes seven to ten months." | Cover | Earth's and Mars's orbits, Mars's growing to 1.5× on "50%", then the transfer arc and "7–10 months" |
| 14.90–20.90 | "NASA's Mars Reconnaissance Orbiter took about seven and a half months. Maven took about ten." | Overlay | Two bars on one scale, each on its word |
| 20.90–28.55 | "Jupiter is five times further… spacecraft fly past Earth or Venus first to pick up speed." | Cover | Orbits to scale, Jupiter's on "five times"; a route loops past Venus and Earth on its way out |
| 28.55–31.00 | "That way, it takes five to six years." | Speaker | |
| 31.00–34.42 | "Galileo took just over six. Juno took just under five." | Overlay | Two bars: just over 6 / just under 5 years |
| 34.42–41.00 | "So, the moon, a few days. Mars, seven to ten months. Jupiter, five to six years." | Overlay | A recap that builds row by row |

Delivered with `b-roll.mov` (ProRes 4444 with alpha) for Resolve. `--check` passes with one warning the agent kept: the film closes on the recap overlay rather than the speaker alone, since the recap is the closing line and he stays in view.
