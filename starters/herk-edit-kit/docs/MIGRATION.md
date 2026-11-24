# Consolidated Herk Edit Kit

`nateherkai/herk-edit-kit` (formerly `nateherkai/hyperframes-student-kit`) is the canonical repository.
The reusable kit from `nateherkai/hyperframes-video-pipeline` was merged into it,
preserving both published histories and the original repository's stars and URL.

## What was added

- Codex instructions, project settings, and generated skill mirrors.
- Silence and mistake cutting, full-edit orchestration, storytelling, and beat tools.
- The new `short-form-edit` workflow, its references, and plan/footage validators.
- 406 draft cards, two reusable scene templates, a synthetic starter, and tests.
- Setup, prompt recipes, verification guidance, and CI on Windows, macOS, and Linux.

## What remains

All 12 existing `video-projects/` examples and root `assets/` were retained without
modification. The original three additional skills remain available. New reels
route to `short-form-edit`; `short-form-video` is the legacy May Shorts reference.

The package retains CommonJS behavior for older `.js` helpers; new tools use
explicit `.mjs` modules. HyperFrames is pinned in the lockfile. Older examples
were not all re-rendered against that version, and may need project-specific
asset, font, dependency, or API setup. Their historical output is not a current
compatibility guarantee. Start new work with `npm run new-video -- my-video`.

New private projects are ignored by Git. Already-tracked teaching files remain
tracked despite ignore rules, so avoid putting private footage into those folders.
No private workspace history, raw recordings, or credentials were imported.

The original MIT license remains. Imported pipeline material retains its included
use permission, and third-party licenses remain applicable. See
[resource notices](../THIRD_PARTY_NOTICES.md).
