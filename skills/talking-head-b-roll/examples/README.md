# Examples

Each folder is what a fresh agent made from one sentence and a recording, with no human edits: the page the b-roll is drawn from, the transcript it planned from, and a contact sheet of the finished film (one frame every second and a half).

| Example | Asked | Recording |
|---|---|---|
| [compound-interest](./compound-interest) | "Add b-roll to my video talk.mp4, I'm posting it on YouTube." | 43 s explainer on compound interest |
| [travel-times](./travel-times) | "Here's my talking head video talk.mp4. Add b-roll. I edit in DaVinci Resolve." | 41 s explainer on travel times to the Moon, Mars and Jupiter |

The presenters in both recordings are AI avatars; the recordings stand in for a real one.

To render one yourself, from its folder:

```bash
curl -o talk.mp4 <the recording's URL, in the example's README>
node ../../scripts/render.mjs page.html --check
node ../../scripts/render.mjs page.html film.mp4
```

Or open `page.html` in a browser to play it with sound.
