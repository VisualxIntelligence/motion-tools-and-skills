# Skills

Claude Code agent skills for making motion graphics and video. Each folder is a complete skill (`SKILL.md` plus references, scripts and templates) copied from its upstream repo with its licence. Each has a `NOTES.md` with our summary: what it makes, when to use it, what it needs, and what we changed.

| Skill | Makes | Stack | Needs | Source |
|---|---|---|---|---|
| [`kinetic-reel`](kinetic-reel/NOTES.md) | Kinetic-typography reels: showreels, promos, intros, with three.js layers and a synthesised beat-locked score | Canvas 2D + three.js + WebGL post, headless Chrome, ffmpeg | Node, Chrome, ffmpeg | opus-video-skills (MIT) |
| [`painted-animation`](painted-animation/NOTES.md) | Hand-painted watercolour-and-ink cartoons, music and lyric videos, loops | p5.js + p5.brush, headless Chrome, ffmpeg | Node, Chrome, ffmpeg; Python + numpy for beat detection | opus-video-skills (MIT) + ClaudeAnimationBase (MIT) |
| [`motion-graphics-music-video`](motion-graphics-music-video/NOTES.md) | Full animated-character music videos from a song: plan, character sheets, video-model animation, p5 graphics, SFX, VFX | Ruby CLI over Fal.ai models, Python, p5 + puppeteer, Swift Core Image, ffmpeg | Ruby, Node 22, Python, ffmpeg, ImageMagick, Chrome, a paid **Fal.ai key**; VFX needs **macOS** | makevoid (MIT) |
| [`lemo-opuscar`](lemo-opuscar/NOTES.md) | Short films in any of 43 film styles, made entirely in code | Canvas 2D, three.js, WebGL2, Playwright, Python audio, ffmpeg | Node 20+, Python 3.11+, ffmpeg; clones the upstream library | lemo-opuscar (MIT) |

All four share one method: storyboard first with a sign-off, every frame a pure function of time, the agent reviews contact sheets and strips of its own frames, then a parallel render and an ffmpeg encode. See [`../docs/techniques.md`](../docs/techniques.md).

## Installing a skill

Claude Code loads skills from `~/.claude/skills/<name>/` (all projects) or `<project>/.claude/skills/<name>/` (one project).

**Windows (our workstation).** Copy the folder:

```powershell
Copy-Item -Recurse "G:\Claude-Code-Projects\MOTION DESIGN\motion-tools-and-skills\skills\kinetic-reel" "$env:USERPROFILE\.claude\skills\kinetic-reel"
```

**macOS / Linux / WSL.** A symlink keeps it in step with this repo:

```bash
ln -s "$PWD/skills/kinetic-reel" ~/.claude/skills/kinetic-reel
```

Then start Claude Code and describe the video you want; the skill loads from its description, or call it by name (`/kinetic-reel`).

**Windows caveat.** The scaffold scripts (`scripts/new_project.sh`) are bash and use `rsync` and `sed -i`. Run them under WSL, or copy the skill's `template/` folder to a new project by hand and run `npm install` there.

The upstream repos can also be installed as Claude Code plugins straight from GitHub; each `NOTES.md` gives the command.
