# Motion-design prompt index (from yihui-dev/awesome-opus5-5-videos)

Source: https://github.com/yihui-dev/awesome-opus5-5-videos (commit 3d54892, 2026-09-30), `data/videos.json`, 475 entries; entries 41–64 added from commit 92aee2f (703 entries) on 2026-10-21. Repository licence: MIT (c) 2026 yihui-dev, but the repo states that **every video and prompt belongs to its creator**. For that reason this public index does **not** reproduce prompt text. Each entry links to the creator's original post and to the upstream prompt file.

Selection: 40 entries most useful to a broadcast motion-design team, chosen on 2026-10-06. Category, stack, word count and notes are our own summary. "Skillry remake tags" are upstream `tech_tags` and describe Skillry's remake, not necessarily the original stack. `partial=true` upstream means only part of the prompt, or only a post about it, was shared.

For the prompt-writing patterns these entries share, see [`../../docs/techniques.md`](../../docs/techniques.md#writing-video-prompts).

---



## 1. Showreel (viral template): @ajith_io

- Original post: https://x.com/ajith_io/status/2103449416325890146
- Author: [@ajith_io](https://x.com/ajith_io)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 26 words
- Stated stack: unspecified (agent's choice)
- Notes: The canonical viral one-liner; about 94 of 475 entries reuse or adapt this wording (10/15/20/30/40 s, product or self-intro variants). Useful as a baseline capability test, not as a production brief.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/ajith-io-890146.md

## 2. Product showreel: @Ishaaqahamed

- Original post: https://x.com/Ishaaqahamed/status/2103837917538107563
- Author: [@Ishaaqahamed](https://x.com/Ishaaqahamed)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 29 words
- Stated stack: unspecified; 1080x1080, loop
- Notes: Adds format constraints (square, 1 s hook, loop) to the showreel template.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/ishaaqahamed-107563.md

## 3. Showreel / technique list: @lukasersil

- Original post: https://x.com/lukasersil/status/2103742861971726495
- Author: [@lukasersil](https://x.com/lukasersil)
- Repo category: 3d | Skillry remake tags: threejs, shader, canvas, svg | partial=false | 105 words
- Stated stack: unspecified
- Notes: Enumerates techniques (kinetic type, masking, compositing, camera) and asks for art direction over effect collage.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/lukasersil-726495.md

## 4. Showreel: @reflex_cloud

- Original post: https://x.com/reflex_cloud/status/2103552840027304046
- Author: [@reflex_cloud](https://x.com/reflex_cloud)
- Repo category: motion | Skillry remake tags: shader, webgl, canvas, css | partial=false | 95 words
- Stated stack: unspecified
- Notes: Hook in first second, then a sequence of distinct techniques; good short brief.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/reflex-cloud-304046.md

## 5. Kinetic identity bumper: @techhalla

- Original post: https://x.com/techhalla/status/2103411244468498547
- Author: [@techhalla](https://x.com/techhalla)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 627 words
- Stated stack: single HTML, 1080x1080, 60 fps, seek(t), closed-form springs, 120 BPM grid
- Notes: Strongest kinetic-type spec: locked copy order, strict 4-colour palette, 3-font type system with tracking values, timecoded 6-beat arc, per-glyph springs, mask reveals from outgoing letterforms, 4-subframe motion blur, 8-still pre-pass, banned-cliché list.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/techhalla-498547.md

## 6. Kinetic typography / spoken word: @Gdgtify

- Original post: https://x.com/Gdgtify/status/2103458245213929495
- Author: [@Gdgtify](https://x.com/Gdgtify)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 648 words
- Stated stack: single HTML, SVG and/or Canvas, 1080x1080, 60 fps
- Notes: Words get architectural roles (lintel, support, platform) built from the letterforms; exact speech text; timecoded storyboard 0.00-20.00 s.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/gdgtify-929495.md

## 7. Music-product film: @brainextends

- Original post: https://x.com/brainextends/status/2103801834930606193
- Author: [@brainextends](https://x.com/brainextends)
- Repo category: motion | Skillry remake tags: shader, svg | partial=false | 1210 words
- Stated stack: MP4 1920x1080 true 60 fps + editable source; Geist/Inter
- Notes: XML-tagged brief: <deliverables>, <art_direction> (stage proportions, hex colours), <artwork>, shot list; insists on build-render-inspect-refine before delivery.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/brainextends-606193.md

## 8. Product film (Apple-level): @daniel_haida

- Original post: https://x.com/daniel_haida/status/2104139720829636937
- Author: [@daniel_haida](https://x.com/daniel_haida)
- Repo category: motion | Skillry remake tags: canvas, svg, css | partial=true | 2131 words
- Stated stack: React + Remotion; soundtrack synthesised in Python
- Notes: Role + negative framing ('This is NOT a generic SaaS explainer'), reads brand tokens/CSS/wordmark from the real repo before designing, max 15 s.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/daniel-haida-636937.md

## 9. Product launch film: @aschapmann

- Original post: https://x.com/aschapmann/status/2104230888812724497
- Author: [@aschapmann](https://x.com/aschapmann)
- Repo category: motion | Skillry remake tags: svg, gsap, css | partial=true | 217 words
- Stated stack: Remotion
- Notes: Post wrapper plus a one-paragraph reusable launch prompt: read landing page/codebase, trace logo to SVG, 4-5 scenes, word-by-word kinetic type, one SFX per element, self-check frames.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/aschapmann-724497.md

## 10. Product explainer / launch: @ik_builds

- Original post: https://x.com/ik_builds/status/2103890476885585923
- Author: [@ik_builds](https://x.com/ik_builds)
- Repo category: motion | Skillry remake tags: canvas, svg | partial=true | 247 words
- Stated stack: HyperFrames + GSAP
- Notes: Parameterised template ({{PRODUCT}}, {{COLOR_*}}): new idea every 1.5-2 s, 'set every from-state at t=0 (seek-safe)', check HyperFrames registry first, no invented metrics.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/ik-builds-585923.md

## 11. Product teaser: @jake11moran

- Original post: https://x.com/jake11moran/status/2103237884564414633
- Author: [@jake11moran](https://x.com/jake11moran)
- Repo category: motion | Skillry remake tags: canvas, svg, gsap, ai-image | partial=false | 363 words
- Stated stack: HyperFrames (registry component colorama-wipe); ~27 s landscape
- Notes: Camera language with numbers: pushes/pulls 1.5-3 s on ease-in-out, 'half the speed you'd default to', motion blur + grain; numbered shot list.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/jake11moran-414633.md

## 12. Developer-tool launch film: @HowDevelop

- Original post: https://x.com/HowDevelop/status/2103840883812733090
- Author: [@HowDevelop](https://x.com/HowDevelop)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 499 words
- Stated stack: Remotion or other code workflow; 1920x1080, 30 fps, exactly 15 s, 9:16-safe centre
- Notes: Spec includes safe-area for reframing, editable type (no AI text in images), original electronic sound design.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/howdevelop-733090.md

## 13. UI motion / morphing shape: @twoclipping

- Original post: https://x.com/twoclipping/status/2103273003555402193
- Author: [@twoclipping](https://x.com/twoclipping)
- Repo category: motion | Skillry remake tags: svg | partial=false | 474 words
- Stated stack: single HTML 1440x1440, seek(t), closed-form springs, Playwright 4 subframes + ffmpeg tmix, numpy beat grid
- Notes: Template that spawned many remixes: <inputs>/<direction>/<structure>/<build>/<gotchas>/<start>; 120 BPM, 7 bars; banned list; one-frame-per-beat proof before render.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/twoclipping-402193.md

## 14. Product ad with real footage: @twoclipping

- Original post: https://x.com/twoclipping/status/2102554209166000267
- Author: [@twoclipping](https://x.com/twoclipping)
- Repo category: 3d | Skillry remake tags: svg, css | partial=false | 444 words
- Stated stack: single HTML 1920x1080, window.seek(t), ffmpeg JPEG sequences, Playwright 3 subframes + tmix, -14 LUFS
- Notes: Adds footage handling, beat calibration to kick hits, SFX aligned by measured peak, preserve-3d gotcha, 20-frame probe.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/twoclipping-000267.md

## 15. Apple-keynote launch film: @twoclipping

- Original post: https://x.com/twoclipping/status/2103835273813496100
- Author: [@twoclipping](https://x.com/twoclipping)
- Repo category: 3d | Skillry remake tags: canvas | partial=false | 912 words
- Stated stack: 2D only, one continuous take; Archivo wdth 125/800 + Geist
- Notes: Every scene made from the previous one (no fades/cuts); 120 BPM, 54 beats; cursor-driven; screen-studio zooms.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/twoclipping-496100.md

## 16. UI product explainer: @verbove

- Original post: https://x.com/verbove/status/2103483957266268381
- Author: [@verbove](https://x.com/verbove)
- Repo category: explainer | Skillry remake tags: canvas | partial=false | 279 words
- Stated stack: single HTML, one canvas, one draw(t); headless Chrome 60 fps, 6-subframe blur, ffmpeg H.264 yuv420p
- Notes: Compact rules version of the morph template; exports all aspect ratios in parallel; contact sheet first.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/verbove-268381.md

## 17. Product promo from real UI: @AnnaCher___

- Original post: https://x.com/AnnaCher___/status/2103571096549433425
- Author: [@AnnaCher___](https://x.com/AnnaCher___)
- Repo category: motion | Skillry remake tags: svg | partial=false | 391 words
- Stated stack: single HTML 1440x1440, seek(t)
- Notes: Applies the morph template to a real product (sprites.ai) with a fully written state chain.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/annacher-433425.md

## 18. Launch ad, multi-format: @l3d1c

- Original post: https://x.com/l3d1c/status/2104649028193632524
- Author: [@l3d1c](https://x.com/l3d1c)
- Repo category: motion | Skillry remake tags: svg | partial=true | 152 words
- Stated stack: Remotion + ElevenLabs (VO/music)
- Notes: Workflow post: imports site CSS tokens, ~20-still contact sheet review, captions measured to 9:16 safe zone, 120 BPM grid, 30/15/6 s cuts in 16:9 and 9:16 from one codebase.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/l3d1c-632524.md

## 19. Portfolio showreel: @wani_shola

- Original post: https://x.com/wani_shola/status/2103769906638459278
- Author: [@wani_shola](https://x.com/wani_shola)
- Repo category: motion | Skillry remake tags: svg, gsap | partial=false | 174 words
- Stated stack: Remotion; 1920x1080, 90-100 s, ~120 BPM
- Notes: Real-site captures in browser/phone frames; three colours; cut every scene on the beat.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/wani-shola-459278.md

## 20. Title sequence: @abhinayguptha

- Original post: https://x.com/abhinayguptha/status/2103565090721259981
- Author: [@abhinayguptha](https://x.com/abhinayguptha)
- Repo category: motion | Skillry remake tags: shader, webgl, canvas | partial=false | 25 words
- Stated stack: unspecified
- Notes: Short aspirational brief for a main-title sequence (Emmy bar).

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/abhinayguptha-259981.md

## 21. Logo reveal: @Mounnna

- Original post: https://x.com/Mounnna/status/2103802871934497266
- Author: [@Mounnna](https://x.com/Mounnna)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 44 words
- Stated stack: unspecified
- Notes: Wireframe logo -> low-poly shards assemble -> app icon background -> typed brand name.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/mounnna-497266.md

## 22. Launch video, retro: @johnsavage_ai

- Original post: https://x.com/johnsavage_ai/status/2103792769982427263
- Author: [@johnsavage_ai](https://x.com/johnsavage_ai)
- Repo category: motion | Skillry remake tags: threejs, shader, canvas | partial=false | 44 words
- Stated stack: unspecified; 16:9, 20 s, film grain + CRT
- Notes: Style reference image used for vibe only.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/johnsavage-ai-427263.md

## 23. Business explainer: @alex_prompter

- Original post: https://x.com/alex_prompter/status/2103499977632997524
- Author: [@alex_prompter](https://x.com/alex_prompter)
- Repo category: explainer | Skillry remake tags: svg, gsap | partial=false | 63 words
- Stated stack: single HTML page; 30 s, 5 scenes
- Notes: Classic five-beat explainer structure (problem, what, 3 steps, proof, name).

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/alex-prompter-997524.md

## 24. History explainer: @RetropunkAI

- Original post: https://x.com/RetropunkAI/status/2103237989065277590
- Author: [@RetropunkAI](https://x.com/RetropunkAI)
- Repo category: explainer | Skillry remake tags: canvas, svg, gsap, ai-image | partial=false | 118 words
- Stated stack: GSAP; 30-60 s; supplied image folder
- Notes: Points the agent at GSAP docs and a Wikipedia source; asks it to proceed if confident.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/retropunkai-277590.md

## 25. Recipe / process explainer: @Ror_Fly

- Original post: https://x.com/Ror_Fly/status/2102853258582880547
- Author: [@Ror_Fly](https://x.com/Ror_Fly)
- Repo category: explainer | Skillry remake tags: canvas | partial=false | 65 words
- Stated stack: JavaScript or HTML; 30 s
- Notes: Ingredient-and-measurement process graphic; one reference image supplied (per athemeroy).

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/ror-fly-880547.md

## 26. Science explainer: @AstroTheWizard

- Original post: https://x.com/AstroTheWizard/status/2103629247751618782
- Author: [@AstroTheWizard](https://x.com/AstroTheWizard)
- Repo category: explainer | Skillry remake tags: canvas | partial=false | 396 words
- Stated stack: pure JavaScript, frame-by-frame; 1920x1080, 60 fps, exactly 60 s, VO script
- Notes: Autonomy instruction ('don't stop to ask'), simulate the real thing (actual random walk), real numbers with stated uncertainty.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/astrothewizard-618782.md

## 27. Technical explainer: @ParkerRex

- Original post: https://x.com/ParkerRex/status/2103206747846701462
- Author: [@ParkerRex](https://x.com/ParkerRex)
- Repo category: explainer | Skillry remake tags: canvas, physics | partial=false | 23 words
- Stated stack: Canvas only, no libraries; every frame pure function of time
- Notes: Minimal but renderer-friendly constraint wording.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/parkerrex-701462.md

## 28. Data visualisation: @GroundControl

- Original post: https://x.com/GroundControl/status/2103678647777230877
- Author: [@GroundControl](https://x.com/GroundControl)
- Repo category: motion | Skillry remake tags: canvas, audio | partial=false | 107 words
- Stated stack: JavaScript/TypeScript; 3 minutes; pulls online data
- Notes: Long-form data-driven climate visualisation from an empty repo.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/groundcontrol-230877.md

## 29. Product UI / zoom film: @dale_vaz

- Original post: https://x.com/dale_vaz/status/2103290592679879074
- Author: [@dale_vaz](https://x.com/dale_vaz)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 114 words
- Stated stack: JavaScript
- Notes: Dot -> windows -> multi-scale zoom out to a point in space -> zoom into mobile; good camera-scale choreography brief.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/dale-vaz-879074.md

## 30. Infinite zoom collage: @koldo2k

- Original post: https://x.com/koldo2k/status/2103129343253778767
- Author: [@koldo2k](https://x.com/koldo2k)
- Repo category: explainer | Skillry remake tags: canvas, ai-image | partial=false | 277 words
- Stated stack: Magnific MCP (Seedream/GPT image/Kling/Lyria) + code compositing; 1920x1080, 30 fps, 20 s loop, 96 BPM
- Notes: Hybrid pipeline with maths: layer scale = camera^Z, exponential zoom with segment duration proportional to log(zoom), cutouts on twos, green-screen key, approve credit costs first.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/koldo2k-778767.md

## 31. Generative 3D / abstract film: @zeezomb

- Original post: https://x.com/zeezomb/status/2102906701552726206
- Author: [@zeezomb](https://x.com/zeezomb)
- Repo category: motion | Skillry remake tags: threejs, shader | partial=false | 68 words
- Stated stack: single HTML, WebGL2, plain JS, no libraries/assets; 80 s square
- Notes: Material concept ('tiles never glued down') drives all figure animation.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/zeezomb-726206.md

## 32. Render pipeline recipe: @xelandre__

- Original post: https://x.com/xelandre__/status/2103473030160687413
- Author: [@xelandre__](https://x.com/xelandre__)
- Repo category: motion | Skillry remake tags: canvas, svg | partial=false | 34 words
- Stated stack: HTML/JS frame-from-time, Playwright headless capture, ffmpeg MP4, motion blur, code-generated sound
- Notes: The reusable capture pipeline in one sentence.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/xelandre-687413.md

## 33. Music video (glitch): @pound75423

- Original post: https://x.com/pound75423/status/2103722556918464968
- Author: [@pound75423](https://x.com/pound75423)
- Repo category: motion | Skillry remake tags: canvas, css | partial=false | 78 words
- Stated stack: HTML Canvas, Playwright per-frame capture, ffmpeg mux; 1280x720, 30 fps, <30 MB
- Notes: Japanese. Beat analysis (BPM, downbeats, section energy), cut every beat, effect intensity by section (40/70/100%), RGB split, kaleidoscope, difference-blend bar titles, screenshot review before final.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/pound75423-464968.md

## 34. Social 9:16 piece: @kloss_xyz

- Original post: https://x.com/kloss_xyz/status/2103664956482941143
- Author: [@kloss_xyz](https://x.com/kloss_xyz)
- Repo category: motion | Skillry remake tags: canvas, audio | partial=false | 61 words
- Stated stack: Python + ffmpeg; 9:16
- Notes: Python-rendered alternative to the browser pipeline.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/kloss-xyz-941143.md

## 35. Stylised short (paper cut): @x4b47x

- Original post: https://x.com/x4b47x/status/2103019799614034026
- Author: [@x4b47x](https://x.com/x4b47x)
- Repo category: motion | Skillry remake tags: canvas, particles, audio | partial=false | 30 words
- Stated stack: pure JavaScript; 30-60 s, 9:16; code-made audio
- Notes: Compact style spec; athemeroy lists it as a reference for its zero-asset template.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/x4b47x-034026.md

## 36. Music-driven generative: @KamStudioLabs

- Original post: https://x.com/KamStudioLabs/status/2102899866762440893
- Author: [@KamStudioLabs](https://x.com/KamStudioLabs)
- Repo category: motion | Skillry remake tags: canvas, physics, audio | partial=false | 19 words
- Stated stack: unspecified; 45 s
- Notes: Audio-visual coupling rule: every note from a visible collision.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/kamstudiolabs-440893.md

## 37. 3D / Blender: @alexalbert__

- Original post: https://x.com/alexalbert__/status/2102466523164274839
- Author: [@alexalbert__](https://x.com/alexalbert__)
- Repo category: 3d | Skillry remake tags: threejs, shader, canvas | partial=false | 165 words
- Stated stack: Blender Python; no downloaded meshes/textures/HDRIs; 10 s
- Notes: Data-sourced procedural environment with reusable generators and per-fact source confidence.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/alexalbert-274839.md

## 38. 3D / GPU simulation (post): @NathanWilbanks_

- Original post: https://x.com/NathanWilbanks_/status/2103881538592981110
- Author: [@NathanWilbanks_](https://x.com/NathanWilbanks_)
- Repo category: explainer | Skillry remake tags: threejs, shader, audio | partial=true | 199 words
- Stated stack: single HTML GPU fluid sim; offline per-frame render, scripted camera; 1080p
- Notes: Post, not prompt: describes vision-model self-critique loop (~40 rounds) and audio derived from the simulation.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/nathanwilbanks-981110.md

## 39. Animated short (post): @_Tony_TT_

- Original post: https://x.com/_Tony_TT_/status/2103227891009872147
- Author: [@_Tony_TT_](https://x.com/_Tony_TT_)
- Repo category: explainer | Skillry remake tags: canvas | partial=true | 44 words
- Stated stack: React/TypeScript Remotion, SVG + Canvas, open-source TTS, Python-synth score
- Notes: Post header; stack line is the useful part.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/tony-tt-872147.md

## 40. Product promo: @felipemoller

- Original post: https://x.com/felipemoller/status/2103846311149936736
- Author: [@felipemoller](https://x.com/felipemoller)
- Repo category: motion | Skillry remake tags: threejs, svg, gsap | partial=false | 39 words
- Stated stack: JavaScript, Playwright, FFmpeg only
- Notes: Portuguese; tool-restriction phrasing used by several creators.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/felipemoller-936736.md

---

## Added in the 21 October update

Second pass over upstream commit `92aee2f` (703 entries; 328 added since the first pass). Same rules as above: link-only, notes are our own. Selection favours briefs that carry a reusable technique for our stack.

## 41. Motion-video system brief (GSAP + three.js): @everestchris6

- Original post: https://x.com/everestchris6/status/2104965415164399895
- Author: [@everestchris6](https://x.com/everestchris6)
- Repo category: 3d | Skillry remake tags: none | partial=false | 1404 words
- Stated stack: GSAP + three.js, kit-based, unattended
- Notes: A full operating brief rather than a film: role, brief fields (audience, call to action, sizes, brand, a facts file as the only source of on-screen numbers, style references), a kit, and checks the video must pass while the user is away. Closest to how our HyperFrames/GSAP + three.js pipeline already works; compare it with our own brief.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/everestchris6-399895.md

## 42. Self-introduction showreel, one continuous line: @heyiamnick

- Original post: https://x.com/heyiamnick/status/2109174851412119558
- Author: [@heyiamnick](https://x.com/heyiamnick)
- Repo category: motion | Skillry remake tags: canvas | partial=false | 1382 words
- Stated stack: Canvas; 30 s loop; Geist; locked camera
- Notes: One pencil line promoted three times (graphite → blueprint wire → light). Strong example of a closed design system: one typeface with weights and tracking in numbers, six hex colours, each stage's accent becoming the next stage's colour, no cuts and no fades, a 150 px empty border.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/heyiamnick-119558.md

## 43. Kinetic typography of a historic speech: @Gdgtify

- Original post: https://x.com/Gdgtify/status/2105669567036989608
- Author: [@Gdgtify](https://x.com/Gdgtify)
- Repo category: 3d | Skillry remake tags: none | partial=false | 691 words
- Stated stack: Single HTML, 1080×1080, 60 fps; Canvas/SVG/WebGL
- Notes: Speech excerpt staged as a sentence that changes its own trajectory. Shows how to brief exact display text (order preserved, omissions marked, attribution separate) and a four-colour palette. A model for archive-quote graphics.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/gdgtify-989608.md

## 44. Kinetic spoken-word film: @Gdgtify

- Original post: https://x.com/Gdgtify/status/2105570411870130294
- Author: [@Gdgtify](https://x.com/Gdgtify)
- Repo category: explainer | Skillry remake tags: none | partial=false | 452 words
- Stated stack: Single HTML, 1080×1080, 60 fps; SVG/Canvas
- Notes: Companion to the above with an original text: a 'field' metaphor carried by streamlines, type staying crisp while particles are only atmosphere, and an explicit list of clichés to avoid.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/gdgtify-130294.md

## 45. Product launch inside a wordmark: @twoclipping

- Original post: https://x.com/twoclipping/status/2105927781678747965
- Author: [@twoclipping](https://x.com/twoclipping)
- Repo category: motion | Skillry remake tags: none | partial=false | 781 words
- Stated stack: 1440×1440, 60 fps, 2D, one take, loops
- Notes: The whole film happens inside the period of a wordmark; day outside, night inside under glass panels; aligned day and night photos crossfaded as a real sunrise. Inputs with defaults, so it runs unattended.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/twoclipping-747965.md

## 46. Launch trailer, loud poster style: @twoclipping

- Original post: https://x.com/twoclipping/status/2106101258834551116
- Author: [@twoclipping](https://x.com/twoclipping)
- Repo category: motion | Skillry remake tags: none | partial=false | 841 words
- Stated stack: 1440×1440, 60 fps; real clips and portraits
- Notes: Five-colour palette, condensed and expanded weights of one family, op-art sunburst, film grain; real footage plays inside the design. Lists default free sources for every input.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/twoclipping-551116.md

## 47. UI launch film, one shape: @0xnicc0

- Original post: https://x.com/0xnicc0/status/2107217691505516612
- Author: [@0xnicc0](https://x.com/0xnicc0)
- Repo category: motion | Skillry remake tags: none | partial=false | 461 words
- Stated stack: Square, 120 BPM, 24 beats
- Notes: Prompt bar → button → progress ring → preview window → full screen → toast → prompt bar, driven by cursor clicks, no cuts. A compact version of the morphing-shape briefs already in this index (#13).

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/0xnicc0-516612.md

## 48. Seamless UI motion loop with numbers: @flxrnc

- Original post: https://x.com/flxrnc/status/2108242454105251921
- Author: [@flxrnc](https://x.com/flxrnc)
- Repo category: motion | Skillry remake tags: none | partial=false | 343 words
- Stated stack: 1440×1440, 60 fps, 14 s; closed-form springs
- Notes: Asks for hex codes, seconds, damping ratios and pixel sizes instead of adjectives: shape damping 0.72 settling in 0.35 s, camera damping 1.0 in 0.6 s, 12 px blur on content swaps, a 0.5 s beat grid. The clearest example of 'motion in numbers'.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/flxrnc-251921.md

## 49. Brand film from archive material: @notdwd

- Original post: https://x.com/notdwd/status/2103995183255998633
- Author: [@notdwd](https://x.com/notdwd)
- Repo category: motion | Skillry remake tags: none | partial=false | 701 words
- Stated stack: ~55 s; archival clips, archived web pages, narrator via ElevenLabs
- Notes: Sells one idea, never features; real archival footage and real web pages only (public-domain sources named), one hero 3D object as the only saturated colour. Useful pattern for archive-led promos.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/notdwd-998633.md

## 50. Voice-led film cut to the words: @twoclipping

- Original post: https://x.com/twoclipping/status/2107822293653041659
- Author: [@twoclipping](https://x.com/twoclipping)
- Repo category: interactive | Skillry remake tags: none | partial=false | 1034 words
- Stated stack: 1440×1080, 60 fps, 20 s
- Notes: Cut to a voice-over transcript; every scene hands off on the exact last frame of the one before; a handheld float plus a slow push in every scene. Pattern for VO-driven explainers.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/twoclipping-041659.md

## 51. 12-second film with the full technical spec: @notdwd

- Original post: https://x.com/notdwd/status/2105031774904766641
- Author: [@notdwd](https://x.com/notdwd)
- Repo category: motion | Skillry remake tags: none | partial=false | 224 words
- Stated stack: 1920×1080, 30 fps; single HTML, `seek(t)`, Playwright + ffmpeg, synthesised sound
- Notes: Short and complete: story beats on a 120 BPM grid, plus motion rules in numbers ('arrive fast, land soft: cover 12–19 % of the remaining distance per frame'; 'nothing ever freezes'). A good minimal template.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/notdwd-766641.md

## 52. The method in seven steps (post): @yankis0x

- Original post: https://x.com/yankis0x/status/2103502194578174321
- Author: [@yankis0x](https://x.com/yankis0x)
- Repo category: explainer | Skillry remake tags: none | partial=false | 170 words
- Stated stack: numpy beat grid → one HTML → Playwright → ffmpeg tmix
- Notes: Not a prompt but the clearest summary of the method: every frame a pure function of time, closed-form springs, sounds on measured peaks, 4 sub-frames per frame for motion blur, one still per beat before the full render, and the arithmetic (14 s × 60 fps × 4 = 3,360 browser renders).

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/yankis0x-174321.md

## 53. Music-first motion video: @diamai_

- Original post: https://x.com/diamai_/status/2104195085508157697
- Author: [@diamai_](https://x.com/diamai_)
- Repo category: motion | Skillry remake tags: none | partial=false | 100 words
- Stated stack: 1080×1080, 60 fps, 30 s
- Notes: Measure the track with numpy first (BPM, beats, drop), start on the first downbeat, springs with small overshoot, a cursor before every change, 4-sub-frame blur. A short brief for music-first pieces.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/diamai-157697.md

## 54. Lyric music video, multi-agent: @okazaky

- Original post: https://x.com/okazaky/status/2107826563786084783
- Author: [@okazaky](https://x.com/okazaky)
- Repo category: 3d | Skillry remake tags: none | partial=false | 108 words
- Stated stack: three.js, 1080×1920, 60 fps; Demucs, Whisper, 4 sub-agents
- Notes: The full lyric-MV pipeline in eight steps: stems, transcription aligned to lyrics, one scene per line, a storyboard table, four parallel scene agents, a 16-frame contact sheet check, −14 LUFS. Pairs with `tools/song-analysis/`.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/okazaky-084783.md

## 55. Music video on an existing starter kit: @thewevr

- Original post: https://x.com/thewevr/status/2106774417732681887
- Author: [@thewevr](https://x.com/thewevr)
- Repo category: motion | Skillry remake tags: none | partial=false | 397 words
- Stated stack: JavaScript on a linked starter kit (README, `ANIMATION_GUIDE.md`, `render.mjs`: the ClaudeAnimationBase layout); no paid APIs
- Notes: Shows how to brief an agent onto an existing kit: clone it into a subfolder, read its README and guide completely, use its renderer instead of inventing one, ask before system-wide installs. Applies to any of the skills in this repo.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/thewevr-681887.md

## 56. Wireframe-first launch ad: @ArchiveExplorer

- Original post: https://x.com/ArchiveExplorer/status/2106732275685560622
- Author: [@ArchiveExplorer](https://x.com/ArchiveExplorer)
- Repo category: explainer | Skillry remake tags: none | partial=false | 94 words
- Stated stack: HyperFrames; 9 beats
- Notes: Script as nine named beats with three headline options each, built first as a colourless wireframe with one still per beat to lock timing, then skinned from a `DESIGN.md` without moving the layout; final rendered side by side with the wireframe. A useful approval gate.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/archiveexplorer-560622.md

## 57. GSAP timing with a frame-check loop: @fleyta88

- Original post: https://x.com/fleyta88/status/2108249741125443662
- Author: [@fleyta88](https://x.com/fleyta88)
- Repo category: explainer | Skillry remake tags: none | partial=false | 60 words
- Stated stack: GSAP + Playwright
- Notes: Exact durations (280 / 220 / 160 ms, 60 ms stagger), then a loop that steps the animation frame by frame in Playwright, compares screenshots for overshoot and patches the code until it passes.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/fleyta88-443662.md

## 58. Deterministic frame rendering, explained (post): @0xKarmi

- Original post: https://x.com/0xKarmi/status/2108495927988129839
- Author: [@0xKarmi](https://x.com/0xKarmi)
- Repo category: motion | Skillry remake tags: none | partial=false | 259 words
- Stated stack: Canvas, `draw(f)`, ffmpeg, three checks
- Notes: Frame-number-pure drawing (frame 720 equals frame 0 for a loop), a fixed canvas with fonts baked in, declared pixel aspect, and three automatic checks after every build. The model writes only the drawing program; the stage, renderer and checks are reused.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/0xkarmi-129839.md

## 59. Launch video in a real city model: @riyadbkhsh

- Original post: https://x.com/riyadbkhsh/status/2106467130963300736
- Author: [@riyadbkhsh](https://x.com/riyadbkhsh)
- Repo category: 3d | Skillry remake tags: none | partial=false | 38 words
- Stated stack: three.js; real NYC data; synthesised music
- Notes: One line: a 3D Times Square built from real city data with 605 billboards lighting on the beat. Directly relevant to landmark and city pieces.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/riyadbkhsh-300736.md

## 60. One-shot future timeline in space: @theSethian

- Original post: https://x.com/theSethian/status/2106447666519384517
- Author: [@theSethian](https://x.com/theSethian)
- Repo category: motion | Skillry remake tags: threejs, shader | partial=false | 72 words
- Stated stack: three.js + shaders; real planet maps
- Notes: Five stops in one continuous camera flight, every frame from real planet maps. A model for a one-take 'journey' explainer.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/thesethian-384517.md

## 61. Audio-reactive fractal demo: @Xanares

- Original post: https://x.com/Xanares/status/2105770390924738984
- Author: [@Xanares](https://x.com/Xanares)
- Repo category: 3d | Skillry remake tags: none | partial=false | 230 words
- Stated stack: One WebGL2 fragment shader; beat map JSON
- Notes: Analyse the track first into a JSON beat map (hits, breaks, kick, snare, hat); kicks pulse the light, hats add detail, each hit adds a fractal level. Path-traced look in a single shader.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/xanares-738984.md

## 62. Blender scene from one Python script: @wikiwayne

- Original post: https://x.com/wikiwayne/status/2107951058584486055
- Author: [@wikiwayne](https://x.com/wikiwayne)
- Repo category: 3d | Skillry remake tags: none | partial=false | 34 words
- Stated stack: Blender (bpy), 96 frames on twos
- Notes: A minimal agent-driven Blender brief: one script builds and animates a looping claymation scene. Useful as a smoke test for our Blender MCP setup.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/wikiwayne-486055.md

## 63. Remotion product film from real screenshots: @punit_io

- Original post: https://x.com/punit_io/status/2104468472344584518
- Author: [@punit_io](https://x.com/punit_io)
- Repo category: motion | Skillry remake tags: none | partial=false | 31 words
- Stated stack: Remotion v4, React + TypeScript
- Notes: Short Remotion brief: no generated images or video, built from attached high-resolution app screenshots.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/punit-io-584518.md

## 64. Documentary-trailer explainer with a coded score: @linke1427832

- Original post: https://x.com/linke1427832/status/2104099543839343079
- Author: [@linke1427832](https://x.com/linke1427832)
- Repo category: explainer | Skillry remake tags: none | partial=false | 86 words
- Stated stack: 1920×1080, 60 fps, 2 min
- Notes: Asks for a fully synthesised soundtrack (no samples, no VSTs) and cuts to the music. A test of long-form pacing.

- Full prompt: https://github.com/yihui-dev/awesome-opus5-5-videos/blob/main/prompts/linke1427832-343079.md
