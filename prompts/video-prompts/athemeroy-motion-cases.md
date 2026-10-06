# Motion-relevant cases and prompt shapes from athemeroy/awesome-opus-5-5-videos

**Source:** "Awesome Claude 5.5 Videos" by athemeroy, https://github.com/athemeroy/awesome-opus-5-5-videos (commit 0b96ca1, 2026-10-03). Files used: `data/cases.csv` (168 reviewed cases), `docs/prompt-matrix.zh-CN.md`, `docs/prompt-playbook.zh-CN.md`, `docs/visual-effects-fit.md`, `data/claude55-source-review-2026-10-03.csv`.

**Licence and attribution:** The repository's original writing, case annotations, tables and diagrams are licensed under **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Per the repo's THIRD_PARTY.md, the licence does **not** cover the linked X posts, videos, music, **creator prompts**, screenshots, trademarks or external repositories. Those stay with their rightsholders.

**Changes made (CC BY 4.0 §3(a)(1)(B)):** This file is a derivative selection made by Claude on 2026-10-06 for a broadcast motion-design team. We selected 40 motion-relevant cases, **translated** the Chinese annotations into English, **condensed and paraphrased** the repo's notes, and added our own "Stack" and "Use for" fields. We also translated and lightly adapted four of the repo's seven prompt templates (Part B). None of the text below is the original wording unless it appears in quotation marks.

**Important:** This repo does **not** contain verbatim creator prompts. It paraphrases each prompt's *shape* and links to the original post. Where yihui-dev's collection holds the creator's full prompt for the same post, we note it as **[verbatim in yihui: slug]**; the text is at `https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/<slug>.md`, and the entry is in [`yihui-prompt-index.md`](yihui-prompt-index.md). Creator figures for time, cost and "one-shot" are creator claims that athemeroy did not verify.

---

## Part A: 40 curated cases

### Product launch and brand motion (UI, kinetic type, beat-cut)

1. **@twoclipping, Hooklab ad (20 s).** https://x.com/twoclipping/status/2102554209166000267
   Stack: single HTML, Playwright, ffmpeg, SFX peak-aligned. Prompt shape: a full production spec. It first asks the user for the product name, selling points, UI, 10–20 owned clips and a licensed song. It then lays out ten 120 BPM bars shot by shot and requires a pre-check of at least 20 frames. Use for: a beat-grid product-ad template. **[verbatim in yihui: twoclipping-000267]**
2. **@leo_xiaolei, reference-film procedural animation (28 s).** https://x.com/leo_xiaolei/status/2102724347446305104
   Stack: Vite/TypeScript, Canvas 2D, deterministic timeline, 1920×1080/30 fps. Prompt shape: about 4,766 Chinese characters. It rebuilds the visual language, rhythm and transitions of a supplied reference film, with a second-by-second morph chain (character → neural net → prism → sunflower → galaxy → black hole → Earth). Use for: continuous-morph briefs.
3. **@jake11moran, NotchBrowser teaser (27 s).** https://x.com/jake11moran/status/2103237884564414633
   Stack: HyperFrames. Prompt shape: a long voice-transcribed prompt. It specifies landscape at about 27 s, no audio, a single-camera Mac-desktop take and slow easing curves, with seven written shot actions. **[verbatim in yihui: jake11moran-414633]**
4. **@jake11moran, `/session-story` skill (53 s).** https://x.com/jake11moran/status/2103247490237825416
   Stack: Opus + HyperFrames skill that reads local Claude Code history. Use for: turning logs and data into an animated recap.
5. **@leodev, Social SDK launch (56 s).** https://x.com/leodev/status/2102781872107659270
   Stack: started in Remotion, then moved to HyperFrames. Opus led and Fable 5.1 handled hard segments, over many iterations. The creator specified what each segment shows, and the agent read the product codebase, animation component library, landing page and brand. Use for: a lesson in choosing a renderer.
6. **@Miguel07Code, Shotbase launch (58 s).** https://x.com/Miguel07Code/status/2102441708395041170
   Stack: HyperFrames, claimed one-shot in under 20 minutes. No full prompt was published.
7. **@WangYeruo, four-theme bilingual app ads (44 s).** https://x.com/WangYeruo/status/2103108551799632050
   Stack: Remotion reading the existing app codebase, Gemini TTS voiceover, code music and SFX. Eight cuts (four themes × CN/EN), with 3–4 rounds of human rework. Use for: versioning and localisation from one codebase.
8. **@bridgemindai, hoodie launch ad (30 s).** https://x.com/bridgemindai/status/2102462889160286423
   Stack: Remotion, "no skills". **[verbatim post in yihui: bridgemindai-286423]**
9. **@dhruvalgolakiya, UnifiedChat ad (40 s).** https://x.com/dhruvalgolakiya/status/2103037586663235713
   Stack: HTML/JS + ffmpeg, ElevenLabs v3 audio. The creator reports a 7–8 hour Mac render. Use for: render-time warning signs.
10. **@azhar_builds, Helpin launch ad (42 s).** https://x.com/azhar_builds/status/2103075805098070315
    Stack: Opus storyboard, a web page rendered frame-by-frame to 1080p, ElevenLabs music and SFX.
11. **@yrzhe_top, three-model site promo comparison (40 s).** https://x.com/yrzhe_top/status/2102752585371226241
    Stack: Remotion/HyperFrames, with the same site and content given to three models. A known title overlap persisted after three renders. Use for: designing an evaluation.
12. **@rexan_wong, pro motion workflow breakdown (11 s).** https://x.com/rexan_wong/status/2103707054108299437
    A six-step method: reference-film driven, a HyperFrames/Remotion render base, the 21st.dev UI component library, static storyboard review frame by frame, and director-style micro-feedback. It argues that one-line prompts give rough results. Use for: team process.
13. **@shushant_l, `motion-ad` skill ad (15 s).** https://x.com/shushant_l/status/2103829449359966629
    Stack: Danny Postma's open-source Claude Code `motion-ad` skill, fed with product info.
14. **@Lucas_IA_, skill-based ad (72 s).** https://x.com/Lucas_IA_/status/2103152093733253544
    Stack: a prebuilt paid skill with a drawing engine. Claude Code writes JS frames, HyperFrames exports MP4, and the stack adds ElevenLabs narration, Whisper word alignment, optional Suno and an ffmpeg mix. The visible trigger prompt is short, but it depends on that pipeline.
15. **@deedydas, inference startup ad (26 s).** https://x.com/deedydas/status/2102787937482252537
    A short prompt, with a self-reported 1 minute and about $2. **[verbatim in yihui: deedydas-252537]** (text: "make a modern slick and punchy video for a modern startup that works on inference")
16. **@marcthecreatorr, Opus launch film (32 s).** https://x.com/marcthecreatorr/status/2103133462798483752
    Prompt shape: hand-drawn Canvas brand film with the Clawd character, research of real data and font assets, 16:9, under 30 s, and skills/MCP forbidden. The related repo is github.com/Changroro/code-video.
17. **@pivi___, Dictus promo (33 s).** https://x.com/pivi___/status/2103024907965612250
    Stack: React/Remotion, six scenes. A reference video was split with ffmpeg, and logo, colours and copy came from the product repo. 4–7 keyframes per scene were sampled to fix a doubled character and misaligned bubbles, and audio was synced in Node. Use for: a concrete self-review loop.
18. **@ajith_io / @stephanlivera, 15 s showreel.** https://x.com/ajith_io/status/2103449416325890146 · https://x.com/stephanlivera/status/2103315922098470926
    The viral one-liner, quoted by athemeroy. **[verbatim in yihui: ajith-io-890146]**

### Music video, beat sync and kinetic typography

19. **@Aadidev0, Clawd era song MV (164 s).** https://x.com/Aadidev0/status/2102692569792835994
    Stack: studied an example MV repo, wrote an original song and a 120 BPM timeline, then about 3,600 lines of JS/Canvas for 39 scenes, Node-synth drums and bass, 3,936 browser-rendered frames and an ffmpeg mux.
20. **@aj_dev_smith, *No Samples* (191 s).** https://x.com/aj_dev_smith/status/2102803889183736141
    Stack: custom JS for both music and visuals, with two prompts (song, then video). The creator reports about 2 hours and about 700k tokens.
21. **@NoFollowers2023, Bellard MV (161 s).** https://x.com/NoFollowers2023/status/2102787420399825023
    Stack: p5.js visuals, Lyria 3.5 music, Grok lyrics.
22. **@atomtanstudio, *Songs for the Deaf* kinetic typography (Oct 3).** https://x.com/atomtanstudio/status/2106135196483608745
    A supplied song and lyrics with a "motion-design showreel" brief, attributed to Fable 5.5 and compared across models.
23. **@TaNapoL1, SaWaDiKa kinetic-type MV (Oct 3).** https://x.com/TaNapoL1/status/2106218137683362057
    41 plates over 2 minutes: code-made frames, public-domain archives, a loop ending.
24. **@park_danie36173, tiny-robot MV (Oct 3).** https://x.com/park_danie36173/status/2106174811282264329
    Beat-synced motion graphics and lyrics (Sonnet 5.5) over a Midjourney character and a Suno song.

### Procedural 2D, stylised surfaces and loops

25. **@hanifproduktif, ant colony (32 s).** https://x.com/hanifproduktif/status/2102742924148830211
    Public repo github.com/buildwithhanif/claude-animation-skill. It contains `examples/ant-colony/film.mjs`, a `frame(ctx,t)` film at 32 s/24 fps on a Node Canvas + ffmpeg pipeline, with rigs, sound script and frame and determinism checks. This is the strongest code-verified case.
26. **@makwired, Shaml paper-cut film (20 s).** https://x.com/makwired/status/2103008945220567166
    Repo github.com/klsoen/opus-js-animations: Canvas 2D frame-by-frame, `FILM.md` with revisions v1–v4.2. The skill asks for audio, listens, proposes a director's plan and waits for approval before coding.
27. **@NFT_Chen and @ring_hyacinth, Mid-Autumn paper collage (39–40 s).** https://x.com/NFT_Chen/status/2103380404791333144
    Stack: p5.js + p5.brush frame-by-frame, Nano Banana Pro backgrounds and torn-paper textures, Node.js SFX. The script and music were supplied.
28. **@minosdevs, Paris pixel loop.** https://x.com/minosdevs/status/2103112945341251920
    Prompt shape: about 3,027 French characters. One HTML/Canvas file, a deterministic 240 s seamless loop, 480×270 nearest-neighbour upscale to 1080p at 60 fps, keyboard capture/export.
29. **@riku720720, pixel parkour (19 s).** https://x.com/riku720720/status/2102515055116063144
    Prompt shape: about 3,459 Japanese characters. One HTML file, Canvas 2D, a 160×90 integer pixel grid, a fixed palette, no assets or libraries.
30. **@yumaeriel, painted short (30 s).** https://x.com/yumaeriel/status/2103053166006657284
    Prompt shape: 17,664 characters for a p5.js film. A reference video is treated as authoritative; it sets rough brush primitives, a blue/orange palette, a 12–15 fps paint state on 60 fps playback, named render systems, second-by-second scenes and banned clean-vector looks.
31. **@LCSlates, gold-leaf mosaic (80 s).** https://x.com/LCSlates/status/2102503027340988559
    Stack: square, WebGL2/plain JS, no external assets, frame-by-frame revisions. A similar brief by @zeezomb is verbatim in yihui as zeezomb-726206.

### 3D, real-time and DCC tools (Three.js, Blender, After Effects, Unreal, ComfyUI)

32. **@Aurelien_Gz, Clearwater (27 s).** https://x.com/Aurelien_Gz/status/2102786378282987591
    Public repo github.com/Aureliengmz/clearwater: single HTML, WebGL2 shaders, FFT waves, ripple sim, caustics, adaptive quality.
33. **@Govindaiii, brand film (52 s).** https://x.com/Govindaiii/status/2102815918049132792
    Stack: WebGL/Three.js and a browser-synthesised soundtrack; no After Effects or stock footage. The thread documents direction changes.
34. **@ish_creative, launch film in Blender (30 s).** https://x.com/ish_creative/status/2102966807376334856
    Stack: local YuE2 BGM with beat and downbeat analysis. Python built nine Blender scenes, Cycles rendered 720 frames, and Python added text overlays.
35. **@zdkiel_labs, single-image exploded architecture (14.5 s).** https://x.com/zdkiel_labs/status/2102722754172850310
    Stack: Claude Code drove Blender 5.2/EEVEE through the Higgsfield Blender bridge/MCP. Camera solve from about 30 corner points, 272 separated objects, collision-checked explode animation.
36. **@aicreataro, After Effects beat edit (15 s).** https://x.com/aicreataro/status/2102656273112326609
    Opus operated After Effects on a MiniMax H3 base clip, cut it to the beat and applied segment-specific particle, light, kaleidoscope and datamosh effects. The editable `.aep` was kept.
37. **@OGKAIM, Unreal lightning, four revisions (Oct 3).** https://x.com/OGKAIM/status/2106219817682530350
    The four passes: a silent scene, then realism and audio, then a reference-driven impact, then lightning and thunder.
38. **@OriSilver, Blender previs to Seedance (28 s).** https://x.com/OriSilver/status/2102817977812824335
    Opus sampled a style reference over MCP, rebuilt cameras, blocking and storyboard in Blender, and exported a 30 s layout. Seedance 2.5 used that layout as reference for the final shots.
39. **@Tariq_at, local ComfyUI short (20 s).** https://x.com/Tariq_at/status/2102561072624410878
    Opus wrote per-shot visual prompts, shot details and music; the images were generated entirely in local ComfyUI. Nodes and models were not disclosed.
40. **@koldo2k, infinite-zoom collage (20 s loop).** https://x.com/koldo2k/status/2103129343253778767
    Stack: Magnific MCP (Seedream 5 Pro, GPT 2.5 cutouts, Kling 2.5, Lyria 3) plus code parallax; 1920×1080/30 fps; the agent must list costs and get approval first. **[verbatim in yihui: koldo2k-778767]**

(Not motion-centred but useful for explainers: @LinearUncle Manim + edge-tts, https://x.com/LinearUncle/status/2103128559174971663; @kimmonismus Remotion/SVG/Canvas + open-source TTS + Python score, https://x.com/kimmonismus/status/2102844654169575547; @0x0funky Remotion + CosyVoice, https://x.com/0x0funky/status/2102736587708854585.)

---

## Part B: Repo prompt templates, translated from Chinese and adapted (CC BY 4.0, athemeroy, `docs/prompt-playbook.zh-CN.md`)

These are the repo's own experimental templates, not creator prompts. We translated them and made small edits for clarity.

**B1. Code animation with zero external visual assets**
```text
Using JavaScript + Canvas 2D, make a [45]-second [9:16] short on [topic] for [audience].
Do not use external images, video, fonts or visual models; the only allowed sound sources are [self-generated Web Audio / this list of audio I own].
First give me a 6–8 shot storyboard, each shot with start/end time, subject, action, on-screen text and transition. Fix one character design and a limited palette and keep them consistent throughout.
Draw the picture as deterministic frames; output one re-renderable source file and an MP4. Render the first 5 seconds as a sample first and check text overflow, character continuity and motion speed; fix, then render the full piece. Finally list the assets, code files and audio actually used, and the issues a human still needs to review.
```

**B3. Promo film from an existing product**
```text
From this product repo [directory] and the [screenshots / brand guidelines] I supply, make a [20]-second [16:9 / 9:16] promo for [audience]. Use only icons, fonts, screenshots and copy in the repo that we have rights to; do not invent features, user data or testimonials.
Read the code and product docs first and list three capabilities that can actually be shown; write a 5-shot storyboard, one core message per shot with the real UI evidence for it. Render with Remotion and keep the editable project.
Send a low-res preview for me to confirm accuracy, then output the MP4. On delivery list reused existing assets, new graphics/animation written by the model, third-party audio, and claims that still need legal/product sign-off.
```

**B4. 3D: separate building the scene from shooting the film**
```text
In [Blender / Three.js], make a [15]-second 3D shot of [subject]. First list the objects to model, materials, lights, camera path and the events per second; mark which assets you generate procedurally and which come from usable files I provide. Do not silently download unlicensed models.
Deliver a grey-box and camera preview first, then final materials/lighting; keep the project file and an asset list. Output the MP4 and record frame rate, resolution, render time and known intersection/flicker/physics issues in the delivery notes. If what is shown is a recording of a real-time interactive scene, label it a "demo capture".
```

**B7. Short trigger for an existing skill / production engine**
```text
Call the project's [named production skill / engine] to make a [duration]-second, [aspect] video for [brand / topic]. Script or fact material is in [path]; licensed images, logo, sound and fonts are in [directory].
Before starting, list the programs, renderers, external services, existing templates and cost sources the skill will call; check facts and brand naming in the script and do not rewrite unconfirmed product claims.
Follow the skill's existing flow to a low-res sample, spot-check the start/middle/end frame of every shot and subtitle/audio alignment; record reasons for revisions, then export the full MP4 and editable project. On delivery separate the contributions of this human input, the prebuilt skill and existing assets.
```

See also the repo's English `docs/production-brief.md`, a copyable brief with a shot table and three acceptance gates (storyboard and keyframes, then the hardest 2–4 s sample, then the whole film). It can be reused under CC BY 4.0 with attribution.
