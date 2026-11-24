# Setup and troubleshooting

Start with [tools, accounts, and API keys](TOOLS-AND-API-KEYS.md) for Nate's
ElevenLabs and Kie.ai choices, Whisper alternatives, and optional services.

Use Node 22+ (required by the pinned HyperFrames CLI), FFmpeg with ffprobe, and
Chrome/Chromium. Run `npm ci` in the repository root before any project commands.
`npm run setup` checks tool availability; `npx hyperframes doctor` diagnoses the
renderer. If Chromium is unavailable, follow `npx hyperframes browser --help`.
Windows users should reopen their terminal after installing FFmpeg to refresh PATH.

The repository pins HyperFrames 0.7.109 and GSAP 3.14.2. Keep package-lock.json
with package.json. Upgrade deliberately, then repeat the render checks.

`npm run new-video -- lesson-one` copies the synthetic starter and local GSAP into
a new self-contained folder. Existing project names are refused so nothing is
overwritten. Replace the starter with your recording and planned compositions.
The left glass template needs your own `assets/source.mp4` with an audio stream.

Codex reads AGENTS.md and discovers `.agents/skills/`. Trust the project in Codex
if you want its project settings loaded. Restart if the skills do not appear.
Claude Code reads CLAUDE.md and `.claude/skills/`. Neither runtime needs a special
MCP server for local editing. The root `npm run check` validates the distribution;
it does not lint personal work under video-projects.

To update a skill, edit `.claude/skills/<name>/`, run `npm run sync:skills`, and
then `npm run check:skills`. No Windows symlink privileges are needed.

Scribe errors: a 401 generally means invalid authentication; a 403 can mean
missing speech_to_text access. Check the key's permissions without printing it.
No key is required for `npm test`, starter preview, or starter rendering.
For speech-free sources, supply a separate audio track before using the cutting
renderers: they expect one video stream and one audio stream.
