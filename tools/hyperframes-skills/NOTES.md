# HyperFrames official skills — notes

**Source:** [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) @ `3152860` (26 Nov 2026), CLI and packages 0.9.99. Apache-2.0. Read 26 November 2026. **Nothing is copied**: the skills move with each CLI release and must match the CLI that runs them, so install them rather than vendor them.

Several skills here build on HyperFrames (`hyperframes-motion-reel`, `cinetic`, `animated-diagrams`, `saas-motion-video`, `starters/hyperframes-motion-library/`, `starters/herk-edit-kit/`), but until now nothing said which official skill to reach for. This table does.

## The nine skills

| Skill | Use it when | Notes |
|---|---|---|
| `hyperframes` | Any HyperFrames video: read first | The render contract (time-pure page, one paused timeline), the work loop, and what each kind of video needs. **Core** |
| `hyperframes-cli` | Scaffolding, `check`, timeline edits, preview, render, share, project history, recovering from a failed run | **Core** |
| `hyperframes-registry` | **Before hand-building any named visual**: about 450 ready blocks installed as editable source (transitions, overlays, titles, kinetic type, captions, charts, map overlays, 3D, camera moves) | `npx hyperframes add <block>`. Check it before writing a CRT pass, a glitch or a bar chart from scratch. **Core** |
| `media-use` | Getting music, SFX, images, icons, logos, voice-over, transcripts, cutouts, grades and looks, and mixing placed audio | Free with a HeyGen sign-in (music catalogue, asset search, 3 min/month of voice); or local tools: Kokoro TTS (`npx hyperframes tts`), MusicGen, FLUX. It also offers paid HeyGen generation. **Core** |
| `reverse-any-video` | Rebuilding a video file as an editable project that matches the original frame for frame (`npx hyperframes measure cuts`, `diff`) | **A HyperFrames Pro feature.** People on screen are re-shot as HeyGen avatars. Only reverse videos you have the rights to; for studying a reference, [`tools/film-analysis/`](../film-analysis/NOTES.md) and [`skills/awwwards-motion-study/`](../../skills/awwwards-motion-study/NOTES.md) need no licence |
| `style-sampling` | A new episode in a proven explainer style on your topic: Collage, Finance, Animated Science, 3D Brand, 3D True Crime | Compare with the eight grammars in [`docs/guides/explainer-grammar/`](../../docs/guides/explainer-grammar/NOTES.md); one video to copy is `reverse-any-video` |
| `remotion-to-hyperframes` | Porting Remotion, Motion Canvas, Lottie, three.js, p5 or canvas work (or Manim, After Effects or Blender renders) into HyperFrames, checked frame by frame | The way out of Remotion's company-licence limit for a piece already built in Remotion. Install on demand |
| `figma` | Using a Figma design, frame, logo or brand in a video (assets, tokens, components, storyboard frames read as states) | Pairs with the connected Figma MCP. Install on demand |
| `slideshow` | A deck to present live (`hyperframes present`) rather than a rendered video | Install on demand |

## Install

```bash
npx skills add heygen-com/hyperframes        # pick "Core Skills" in the picker
npx hyperframes skills update                # or: install the core set matching your CLI version
```

`skills add` reads a registry copy that can lag `main` by hours; `npx hyperframes skills update` installs from the release tag that matches the CLI, which is safer. As a Claude Code plugin: `claude plugin install hyperframes@hyperframes`, then turn on auto-update under `/plugin` → Marketplaces. Run project-local installs from the video project's folder.

## Cautions

- **Usage notes.** Some skills (`reverse-any-video` among them) send HeyGen a usage event at the start, tied to your account if signed in, after telling you once. Say no to skip it.
- **Credits.** `media-use` is written to plan for the best result rather than the cheapest. If cost matters, say so up front or give a credit limit.
- **Cloud render.** `reverse-any-video` ends with `npx hyperframes cloud render`. For client footage, render locally with `npx hyperframes render` instead.
- **Arabic.** The skills say nothing specific about right-to-left text. Follow the RTL rules in [`docs/techniques.md`](../../docs/techniques.md#arabic-and-right-to-left-text) and test shaping in a still before rendering.
- **Not tested here.** Installing and running the skills needs the CLI and, for some, a HeyGen sign-in.
