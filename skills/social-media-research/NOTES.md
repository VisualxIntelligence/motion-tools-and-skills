# social-media-research — notes

**Source:** [ScrapeCreators/social-media-research-skills](https://github.com/ScrapeCreators/social-media-research-skills) @ `64ba7b4` (26 Aug 2026), plugin 1.0.0. MIT, © 2026 ScrapeCreators ([LICENSE](LICENSE)). Copied 26 November 2026.

## What it does

Thirteen research skills that read **public social-media data** through the paid ScrapeCreators API (TikTok, Instagram, YouTube, LinkedIn, X, Reddit, Facebook, Threads, Bluesky, Pinterest, ad libraries and more) and turn it into briefs. They don't make video; they decide **what a video should be about and what format is working** before production starts.

| Skill | Use it to | For our work |
|---|---|---|
| [`outlier-post-finder`](skills/outlier-post-finder/SKILL.md) | Find posts that beat a creator's own baseline, and the patterns behind them | Which explainer topics and hooks overperform on LinkedIn and YouTube Shorts |
| [`trend-discovery`](skills/trend-discovery/SKILL.md) | Trending topics, hashtags, sounds and short formats in a niche | Picking the day's AI-news angle; trending sounds for social cuts |
| [`transcript-intelligence`](skills/transcript-intelligence/SKILL.md) | Summaries, hooks, claims and quotes from video transcripts | Reading competitor explainers' scripts and pacing (claims still need checking) |
| [`comment-mining`](skills/comment-mining/SKILL.md) | Questions, objections and audience language from comments | What viewers didn't understand, for the next episode's script |
| [`competitor-social-research`](skills/competitor-social-research/SKILL.md) | Compare several accounts' content pillars, formats and gaps | Benchmarking the news-explainer series against similar channels |
| [`creator-profile-teardown`](skills/creator-profile-teardown/SKILL.md) | Why one account works and what to copy | Studying a motion-design creator's posting pattern |
| [`content-repurposing`](skills/content-repurposing/SKILL.md) | Turn a video or post into LinkedIn posts, threads, scripts, newsletter ideas | Spinning one film into its LinkedIn post (or use `precision-post`) |
| [`social-listening-brief`](skills/social-listening-brief/SKILL.md) | What people say about a brand, product or topic, with cited examples | Reaction to an AI launch before covering it |
| [`ad-library-teardown`](skills/ad-library-teardown/SKILL.md) | Hooks, offers and CTAs in active Meta, Google and LinkedIn ads | Launch-film research for MAKEENA clients |
| [`audience-research`](skills/audience-research/SKILL.md), [`influencer-prospecting`](skills/influencer-prospecting/SKILL.md), [`product-demand-research`](skills/product-demand-research/SKILL.md) | Audience fit, creator shortlists, demand signals | Marketing work, rarely needed here |
| [`scrapecreators-api`](skills/scrapecreators-api/SKILL.md) | Route any raw lookup to the right endpoint (the others build on it) | — |

Finished research feeds the production skills: a hook list into `skills/video-production-skills/`'s evidence-linked script, a format choice into `docs/guides/explainer-grammar/`, a trending sound into the sound plan (licence it first).

## Requirements

- **A ScrapeCreators API key** in `SCRAPECREATORS_API_KEY` (from scrapecreators.com). Never put it in a file in this repo.
- **Credits.** Most calls cost 1 credit. `/v1/tiktok/user/audience` costs 26, AI-fallback TikTok transcripts add 10, and Google ad details cost 25. The skills say to warn before the expensive calls. Check the balance with `/v1/credit/balance`, and set a credit budget for a research run.
- `curl` (the skills call the REST API with Bash).

## Install

Copy `skills/social-media-research/skills/*` into your skills folder, or install upstream's plugin with `npx skills add ScrapeCreators/social-media-research-skills`. `CLAUDE.md` and `AGENTS.md` here are upstream's routing notes (which skill for which job).

## Cautions

- **Public data, but third-party collection.** ScrapeCreators collects from platforms whose terms often forbid scraping. Use the results for research and aggregate insight. Don't republish people's posts, comments or profile data. Don't use it to profile private individuals.
- **Al Jazeera work.** Social posts found this way are leads, not sources: verify through the newsroom's own verification process before anything goes on air. Quotes of individuals need the usual consent and verification.
- **Counts are snapshots.** Views and likes change by the hour; note the date of every number in a brief.
- **Not tested here.** No API key in this sandbox. Try one cheap call (`/v1/credit/balance`) first.

## Changes from upstream

- **Copied.** The 13 skills, `CLAUDE.md`, `AGENTS.md` and the licence, unchanged; the README as `UPSTREAM-README.md`.
- **Left out.** The plugin manifests (`.claude-plugin/`) and `scripts/validate-skills.py`.
