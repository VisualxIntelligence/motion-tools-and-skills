# howseen-motion-design — notes

**Source:** [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) @ `3d90d34`: `skill/motion-design/SKILL.md` (as `GUIDE.md`) and three of its scripts. MIT, © 2026 Howseen AI (Raphaël Aubry) ([LICENSE](LICENSE)). Copied 22 October 2026.

**What it is.** A field journal of rules from about ten real code-made films (an HTML page with `window.seek(t)`, Playwright and ffmpeg). It is kept as a **guide**, not an installed skill: it names its author's own project folders and assumes macOS.

**What is worth reading in `GUIDE.md`:**
- **Seeking.** Seek third-party libraries rather than banning them. GSAP skips the redraw when asked for the same time, so seek with `tl.pause(); tl.totalTime(t + 0.001, true); tl.totalTime(t, true)`.
- **Springs and camera.** Closed-form springs with presets (stiffness/damping 320/30, 170/26, 120/24); camera zoom interpolated in log space.
- **Motion blur.** A 180° shutter, with adaptive sub-frames `ceil(px / 5)` up to 64, clamped at hard cuts.
- **Cuts and loops.** Cut-seam rules (match velocity and direction across a cut), a one-frame flash detector, and position-and-velocity loop-seam checks.
- **Captions.** At least 0.7 s on screen, at most 17 characters per second, and each word lights on its start frame.
- **Voice and b-roll.** B-roll density over voiceover, with the voice timing kept in one file.
- **Honesty and tells.** Never fabricate on screen, and label example data. A table of "AI motion" tells and their fixes.

**Scripts (`scripts/`):**
- `render_template.py`: probe, beats, draft, full, pops and loop modes, with two-rAF settling and WebGL flags.
- `audio_template.py`: places SFX by measured peak and mixes to −14 LUFS (social; use −23 LUFS for broadcast).
- `analyze_song.py`: beats and sections.

They overlap the repo's renderers ([`../../../tools/headless-render/`](../../../tools/headless-render/NOTES.md), [`../../../starters/mg-styles-15/`](../../../starters/mg-styles-15/NOTES.md)), so treat them as reference, not another tool to adopt.

**Caution.** The guide also suggests fetching memes with yt-dlp and using AI-generated faces in mock UIs. Third-party footage needs rights clearance before broadcast, and generated faces should be labelled under the newsroom's AI policy.

**Changes from upstream.**
- **Renamed.** `SKILL.md` is now `GUIDE.md`, so it is not loaded as a skill.
- **Left out.**
  - The "remake" mode, which rebuilds someone else's launch video frame for frame.
  - The example film and its brand assets.
  - The Mixkit, svgl logo and 21st.dev helper scripts.
