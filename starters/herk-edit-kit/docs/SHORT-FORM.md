# Reels and YouTube Shorts

Use `short-form-edit` for a raw talking-head recording, reel, YouTube Short, or
short advertisement. It defaults to 1080x1920. Request a separately composed
1920x1080 version when needed; a center crop is not a second composition.

## Start

Run `npm run new-video -- my-reel`, then ask Codex (`$short-form-edit`) or Claude
Code (`/short-form-edit`) to edit your local recording into that project. State
the audience, intended action, target duration, and any brand preferences.
The starter is landscape; the skill must set the reel's composition dimensions,
layout, and metadata to 1080x1920 before authoring. Keep all source footage and
outputs inside the new project.

1. Transcribe with ElevenLabs Scribe, your chosen alternative, or reuse verified word timestamps.
2. Review mistakes in context and establish one frame-aligned edit decision list.
3. Explore three opening directions and choose a truthful promise and payoff.
4. Plan scenes, exact captions, moving footage, and sound cues against retained words.
5. Build the composition with the HyperFrames and GSAP skills. Use a footage ledger
   to record provenance and prevent unintentional reuse of the same source scene.
6. Validate, preview, render a draft, inspect frames, and listen to the full edit.
7. Resolve timing, audio, and composition problems before exporting the final video.

Nate uses ElevenLabs Scribe for transcription and Kie.ai for generated video and
image assets. Students need their own keys and credits for those services. Whisper
is a transcription alternative, and existing footage can replace generated assets.
See [tools, accounts, and API keys](TOOLS-AND-API-KEYS.md) for setup and copyable
prompts. Honor existing authorization when proposing paid assets. The synthetic
validation example needs no paid service.

## Validate from the repository root

```sh
npm run validate:short-form -- video-projects/my-reel
npm run validate:footage -- video-projects/my-reel
node scripts/preflight.mjs video-projects/my-reel
```

The first validator reads `assets/plan.json`, `assets/transcript.json`, and
`assets/edit-decisions.json`. The second reads the plan and, for moving footage,
`assets/footage-ledger.json`, checks hashes, and confirms referenced files exist.
Follow the [plan schema](../.claude/skills/short-form-edit/references/plan-schema.md).
Use the [reference worksheet](../.claude/skills/short-form-edit/references/reference-analysis.md)
when analyzing a supplied reference video.

Try the synthetic fixture without a recording or API key:

```sh
npm run validate:short-form -- examples/short-form
npm run validate:footage -- examples/short-form
npm test
```

The fixture contains invented words and timing data, not a rendered reel.
Validators check structure and declared timing. They do not prove a compelling
hook, factual claims, rights to footage, correct visual cropping, or audible sync.
The skill's quality gates require watching and listening to the actual output.
