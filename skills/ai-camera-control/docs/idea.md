# The idea

This page says what the pipeline is for, why it works, who should use it, how it differs from other ways of controlling a camera, and the smallest thing to try first. Anything the files do not prove is marked UNPROVEN, with the test that would settle it. What the method cannot do is in [known-limits.md](known-limits.md).

## Words used here

- **Seedance 2.5** is a video model. **Tein** (tein.ai) hosts it. This repo is by the author of Tein's open-source work, and every video request in it goes through Tein's Seedance 2.5 ([tein-endpoint.md](tein-endpoint.md)).
- **Previs** is a rough 3D version of a shot, made before the real one. In this repo the previs is a grey clip, the **reference video**, and the method is called the pill pipeline.
- **Pill** is the nickname for the striped stand-in for a person or a product. In the code there are three: the *capsule* (the first version, one wide dome; 75 shipped pill clips use it), the *pin* (the current one, slim head and shoulders; 62 clips use it) and the *product pill* (24 cm tall). See [engine.md](engine.md) and [why/why-capsules.md](why/why-capsules.md).
- **Draft** and **4K** are defined once, in [tein-endpoint.md](tein-endpoint.md#what-a-draft-is) and [seedance-notes.md](seedance-notes.md#4k).

---

## The problem

Every AI video app sells camera presets: orbit, dolly, crane. Words alone give you "an orbit, somewhere, at some height". You do not get the exact move, the exact speed, the exact cuts or the exact timing. "Eye level" is not a number and "around him" is not a path.

The pipeline fixes this by turning the camera into a number in a file. A small three.js scene holds the set, the people and the camera. It is rendered to a grey video. The video model gets that video as a reference and copies the camera from it.

## The model sentence

> The reference video carries two things, where the camera goes and how the bodies move, and Seedance copies both. So give it a camera to follow and nobody to copy.

This is what the tests showed:

1. A clay mannequin video gave the right camera and the right cuts, and the bodies fought like game characters. A face photo fixed the face and the place but not the motion ([why/why-not-people.md](why/why-not-people.md)).
2. Pencil figures, blurred figures and a camera-only plate each fixed one thing and broke another ([failure-ladder.md](failure-ladder.md), [variants.md](variants.md)).
3. A tall striped pill gives the exact spot, size, facing and timing, and has no body to copy ([why/why-capsules.md](why/why-capsules.md)).

The pill is a stand-in with loud diagonal stripes and a white dot at eye height on the side it faces. The prompt says what everything really is.

## How it works in six steps

1. Build the shot as a template: a set, pills, a camera, timing. It is code, rendered with three.js inside Remotion at 24 fps, 2.39:1.
2. Check it with measured passes: framing, feet that do not slide, bodies that do not pass through each other.
3. Render a clean pill clip with no text on it, under 29 seconds in total.
4. Send it to Seedance 2.5 as the reference video, with a photo of your person or product as the reference image, and a long prompt. The clip decides camera, framing, timing and where people stand. The words decide everything else.
5. Look at the result against the clip: cuts, framing, spoken lines.
6. Change the words, not the clip, until the result is right.

The prompt paragraph that makes it work (from the gallery prompts): the clip is a coarse-blockout reference, use it only for the camera, framing and timing, rebuild every grey object as a real one, and never show a pill.

## Who it is for

- Filmmakers and creatives who want a real camera language in AI video.
- People building an AI video agency, product or template.
- People who already have clients and want a filmmaking workflow that is faster and more controllable.

## Who should skip it

If you make a few clips a month and do not need an exact camera, a camera preset in an app is simpler.

## What it cannot do

The limits, with their evidence, are in [known-limits.md](known-limits.md): a frame sheet has no clock, some fight scenes are blocked by the copyright filter, a repeat run is a new take, a true 4K of an existing take is UNPROVEN on Tein, speech can be doubled or dropped, and the pill has no hands, legs or feet.

## How it differs

### From camera presets in an app

UNPROVEN as a head-to-head. The repo shows what this pipeline delivers: the camera on the frame, with 9 of 9 cuts landing on one 30 second film ([stories.md](stories.md)). It does not show an app preset failing the same test. Test: send the same orbit as a preset and as a pill clip, then measure the camera with the phase-correlation check ([qa-prompt-and-video.md](qa-prompt-and-video.md)) and compare the cuts.

### From first-frame and last-frame control, and from image-to-video

Stills fix only the start and the end of a shot. The nearest thing that was tested is the frame-sheet route, a set of frames that gives angles but no clock: 1 to 3 of 9 cuts against 9 of 9 ([why/why-video-first-sheet-second.md](why/why-video-first-sheet-second.md)). Seedance also has a first-and-last-frames mode and an image-to-video mode. Neither was run as a camera baseline. UNPROVEN as a comparison. Test: run the CAM06 orbit through first-and-last-frames, through image-to-video, and through the pill clip, and measure the camera path in each.

### From Blender previs

UNPROVEN that it matches Blender. No Blender previs was sent to Seedance for this repo. Test: render the same move in Blender with the same pill and compare the result with the three.js clip.

## Why three.js and not Blender

- An agent can write the scene as code, so no modelling in an application is needed.
- Every frame is a pure function of time, so any frame renders alone and renders are identical.
- It runs headless from a command, which is what an agent needs.

When Blender is still right: UNPROVEN. No run records a case where three.js failed and Blender would have worked. Test: pick a shot that needs true global illumination, render both, and send both.

## Why a coarse blockout is the bet

The line used in every prompt is: "@Video1 is a coarse-blockout reference. Use it only for camera position, camera movement, cuts ...; do not adopt its blockout appearance, materials, or scene." Dreamina has a Clay Renderer mode that takes a grey-box video, with a coarse setting that is more stable (third-party report).

Caveat: the specs behind this come from third-party guides. UNPROVEN as "Seedance's own docs". Test: read the official Seedance 2.5 reference-video documentation and quote the blockout section.

## The smallest first thing to do

1. Open `gallery/index.html` in a browser. There is nothing to install.
2. Pick one move, for example the orbit (CAM06), and take its pill clip from `templates/CAM06-Orbit/pill.mp4`.
3. Send it to a video model as the reference video, with a photo of your own person as the reference image ([tein-endpoint.md](tein-endpoint.md)).
4. Paste the card's prompt. Keep the sentences that say what the pills are and the sentences that say to rebuild the set. Change the rest.
5. Render your own clip: `cd engine/cinematic && npm install && tools/render-pill.sh CAM06-Orbit` (here `tools/` is `engine/cinematic/tools/`, not the repo-level `tools/`). Keep at least 3 GB free; the scripts do not check.

Steps 1 to 4 are the "How to use a move" section of `gallery/GALLERY-README.md`. They work without rendering because the gallery ships finished pill clips.

## How long it takes and what it costs

- Building the 3D for the 30 s film took about 1 hour 20 minutes, with 34 minutes to the first full render, and the Seedance draft took about 3 minutes (measured on the author's run, not included).
- A 7 s draft from a pill clip cost about 1,020 credits at 480p on the earlier hosted API used in the original tests. The rates, the per-length table and a link to Tein's prices are in [costs.md](costs.md). Read the current price at tein.ai/pricing before you send.
