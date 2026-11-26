# Answers: the idea and its limits (section A)

This file answers 10 questions; 1 is UNPROVEN, 4 partly, and the other 5 are proven.

One entry per question: the number, a short answer, the evidence, a status and, for anything not proven, the test that would settle it. Evidence is a path in this repo, or "measured on the author's runs, not included". Statuses:

- **PROVEN**: shown by a file in this repo or a number that can be re-measured.
- **PARTLY**: the core is shown; the part that is not is named, with its test.
- **UNPROVEN**: not supported by the files. The test is named.

## A. The idea

- **A1. What problem does this solve that prompts and camera presets do not?**
  Apps sell camera presets, and words give "an orbit, somewhere, at some height". The pipeline turns the camera into a number in a file, renders a grey clip, and the video model copies the camera from the clip. "Eye level" is not a number and "around him" is not a path; a template's `numbers` and `cam(t)` are.
  Evidence: `docs/idea.md`; `docs/camera-language.md`, section 1; `engine/cinematic/src/templates/cameras.ts` (CAM06 `numbers` and `cam`).
  Status: PROVEN.

- **A2. What is the one-sentence model of why it works?**
  The reference video carries two things, where the camera goes and how the bodies move, and Seedance copies both; so give it a camera to follow and nobody to copy.
  Evidence: `docs/why/why-capsules.md` (the model sentence and the six-rung table); `docs/failure-ladder.md`, ladder 1 (the clay video copied stiff bodies, the pill did not).
  Status: PROVEN.

- **A3. Who is it for, and who should skip it?**
  Filmmakers and creatives, people starting an AI video agency or company, builders shipping an app or template, and people with clients who want a faster and more controllable workflow. Skip it if you make about three clips a month: pay for an app with presets.
  Evidence: `docs/idea.md`.
  Status: PROVEN (a statement of scope, not a measurement).

- **A4. What do you get that an app's preset camera cannot give (exact move, speed, cuts, timing)?**
  The pipeline side is shown: with the pill clip as video input, 9 of 9 cuts landed on the same frame on the 30 s film, and the CAM06 orbit followed the clip's camera (front three-quarter, side-on at 4 s, over the back, same rise). The claim that an app preset cannot do this was never tested.
  Evidence: `release-media/SHOW01-TheHandoff/result.mp4` and `release-media/CAM06-Orbit/result.mp4` (the cuts count is measured on the author's runs, not included).
  Status: PARTLY. UNPROVEN: the comparison with an app preset.
  Test: send one orbit to an app's preset and to the pill route, then compare the camera with the phase-correlation check in `tools/seedance/qa_video.py` and count cuts on the frame.

- **A5. What can it not do?**
  A frame sheet has no clock (cuts drift 0.2 to 0.8 s; 1 of 9 and 3 of 9 cuts held against 9 of 9 for video). The multi-shot fight ACT07 was blocked by the copyright filter every time. Keep the reference video under 29 s (the earlier hosted API refused 30.00 s). A true 4K of an existing take is UNPROVEN on Tein; on the earlier API the final ignored the 4K field and returned 1080p. The pill has no hands or feet, so those come from the prompt. Statues come out as odd stand-in shapes. Signs get invented. Lines can be doubled or dropped. A good take cannot be repeated, because there is no seed.
  Evidence: `docs/known-limits.md`; `docs/seedance-notes.md`, sections 1 to 3; `docs/why/why-limbs-never.md`; `templates/ACT07-FightCoverage/README.md`.
  Status: PROVEN.

- **A6. How long does a first result take, and what does it cost?**
  A 7 s 480p draft from a pill clip costs about 1,000 credits (1,020 to 1,170 observed); a final costs about 5.5 times a draft. Current prices are at tein.ai/pricing. Building the 3D for the 30 s film took about 1 hour 20 minutes (34 minutes to the first full render) and a draft took about 3 minutes (measured on the author's runs, not included). For a stranger starting from the repo, the time is not measured.
  Evidence: `docs/costs.md`; `docs/engine.md`, section 5 (a clean checkout rendered CAM06-Orbit in 11 s).
  Status: PARTLY. UNPROVEN: the time for a newcomer.
  Test: time a clean checkout from clone to first Seedance draft on a machine that has never run it.

- **A7. What is the smallest useful thing someone can do on day one?**
  Download one pill clip from a template, send it as the reference video with a photo and the card's prompt, and keep the stand-in and rebuild-the-set sentences. Or render your own: `cd engine/cinematic && npm install && tools/render-pill.sh CAM06-Orbit` (verified from an empty folder, `docs/engine.md`, section 14).
  Evidence: `templates/CAM06-Orbit/README.md`; `templates/CAM06-Orbit/reproduce.md`; `docs/engine.md`, section 14.
  Status: PROVEN.

- **A8. How is this different from first/last-frame control, from image-to-video, from Blender previs?**
  Stills fix only the start and the end of a shot, and the nearest tested route, the frame sheet, kept the story but lost the clock. Seedance lists a first-and-last-frames mode and an image-to-video mode. None was run as a camera baseline, and no Blender previs was sent to Seedance.
  Evidence: `docs/why/why-video-first-sheet-second.md`; `docs/seedance-notes.md` (the mode list).
  Status: UNPROVEN as a comparison.
  Test: run CAM06 through first-and-last-frames, image-to-video, a Blender clip and the pill clip, then measure camera path and cuts in each result.

- **A9. Why three.js and not Blender, and when would Blender still be right?**
  The scene is written as code, so an agent can write and check it; every frame is a pure function of time, so renders repeat; and it runs headless from a command. When Blender is still right: no record shows a case.
  Evidence: `docs/engine.md`, sections 1 and 2.
  Status: PARTLY. UNPROVEN: a case where Blender wins.
  Test: find a shot where three.js lighting fails, render it in Blender, send both and compare.

- **A10. What does "coarse blockout" mean in Seedance's own docs, and why is that the bet?**
  The wording used in every prompt is: "@video1 is a coarse-blockout reference ... Use it for the camera ... do not adopt its grey clay set or its stand-in shapes." Dreamina has a Clay Renderer mode for a grey-box video, with a coarse setting that is more stable (third-party source). That the official ByteDance page says this was never checked.
  Evidence: `tools/seedance/gallery_v4.py` (`ROLE_SHOT`).
  Status: PARTLY. UNPROVEN: the official wording.
  Test: read the official Seedance 2.5 reference-video page and quote its blockout section.
