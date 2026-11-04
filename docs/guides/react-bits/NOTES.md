# React Bits for motion graphics — notes

**Source:** [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) @ `4dc7b5b` (31 Oct 2026), site [reactbits.dev](https://reactbits.dev). **MIT + Commons Clause** (© 2026 David Haz). Read 4 November 2026.

**Nothing from React Bits is copied into this repo.** The licence lets you use the components inside your own product, site or film, but not redistribute the components (alone, in a bundle or as a port), the browser tools or the sounds, and not sell the tools' exports as packs. A toolkit repo like this one would be redistribution. This page is our own guide to using it for video, with pointers upstream. It is our reading of the licence, not legal advice.

## What it is

An open library of animated React components, built for websites: 218 component folders at this commit (the README says "215+").

| Category | Count | Built with |
|---|---:|---|
| Text animations | 33 | GSAP (SplitText, ScrollTrigger), Motion, Canvas, one OGL shader |
| Animations (cursors, hovers, borders, image effects) | 38 | Canvas, WebGL/OGL, three.js, GSAP |
| Components (cards, galleries, carousels, menus) | 48 | Motion, GSAP, OGL, three.js / R3F |
| Micro (buttons, toggles, status marks) | 35 | Motion, Canvas |
| Backgrounds | 64 | Mostly raw WebGL or OGL fragment shaders; a few three.js, Canvas and WebGPU |

Each comes in four flavours (JS or TS, plain CSS or Tailwind). Install one at a time into your own project:

```bash
npx shadcn@latest add @react-bits/Aurora-JS-CSS          # needs "@react-bits": "https://reactbits.dev/r/{name}.json" in components.json
npx jsrepo@latest add https://reactbits.dev/r/Aurora-JS-CSS
```

Claude Code can also browse and add them through the shadcn MCP server (`npx shadcn@latest mcp init --client claude`, with the registry line above). `reactbits.dev/llms.txt` lists every component with a one-line description, which is the quickest way to brief an agent.

It also ships five free browser tools. Two matter for video: **Background Studio** (tune any background and export a looping video) and **Center Stage** (put a screenshot or screen recording on a device mock-up with tilt and depth of field, export up to 4K). The other three are Shape Magic (logo marks with 3D materials), Texture Lab (photo and video effects) and Sound Lab (UI and video sounds).

## Three ways to get it into a film

### 1. Background Studio export (no code)

Pick a background on reactbits.dev/tools/background-studio, tune it, and export MP4 or WebM. What the exporter does (from its source, `src/tools/background-studio/utils/render.js`):

- **Frame-stepped, not screen-recorded.** It steps the background one frame at a time and encodes in the browser, so dropped frames are not a problem.
- **Sizes.** Presets up to 1920×1080 (plus square, 4:5 portrait, 9:16 story, social card, X header and custom) at 1×, 2× or 3×, capped at 4096 px on the long side: Desktop × 2 = 3840×2160.
- **Frame rates: 24, 30 or 60 only.** No 25 or 50, so for 25p or 50i delivery use route 2.
- **Seamless loop** by cross-fading the first frames (up to one second) over the tail.
- **No alpha in video.** Transparency is for still images (PNG, WebP) only.
- **Lossy.** H.264/HEVC or VP9/VP8/AV1 at the browser's encoder, with a Standard / High / Max bitrate. Fine as a background plate; grade-heavy work wants route 2's PNG frames.

### 2. Install the component and render it frame-exact (any size, any frame rate)

Put the component in a small Vite + React page that fills the frame, then record it with [`../../../starters/dioramas/scripts/render-video.mjs`](../../../starters/dioramas/NOTES.md#rendering-a-diorama-to-video). That script freezes `performance.now`, `Date`, `requestAnimationFrame`, timers and CSS/Web Animations, seeds `Math.random`, and steps time frame by frame, which is what these components run on (almost all of them drive themselves from a `requestAnimationFrame` loop, and many use `Math.random`). Use `--fps 25` or `50`, `--w/--h` for any size, `--scale` for sharpness, `--clip` to record one element, `--frames dir` for a PNG sequence.

Things to set up in the page:

- **Pointer-driven effects.** Most backgrounds react to the cursor, and many components only move under it (cursors, hovers, tilts). Script the pointer with `--pointer "t:x,y;…"` and `--click t,…`, or turn the interaction props off. Effects that exist only under a live cursor (`BlobCursor`, `SplashCursor`, `TargetCursor`, `ImageTrail`, …) are a poor fit for video.
- **Scroll-triggered text.** `ScrollReveal`, `ScrollFloat`, `StrokeText`, `FoldText`, `AnimatedContent`, `FadeContent` and `SplitText` (by default) start from GSAP ScrollTrigger or an in-view check. Make the page taller and drive it with `--scroll`, or set the threshold so they start on load.
- **Reduced motion.** About 170 components check `prefers-reduced-motion` and calm or stop their motion when it is set. Playwright's default is no preference; do not turn it on.
- **Pixel ratio.** Several shader backgrounds cap their own device pixel ratio (Aurora caps at 2 and takes a `dpr` prop). Check the cap before rendering above 2×.
- **Seeking.** Only `Aurora` takes a controlled `time` prop at this commit, so only it can be driven directly by Remotion's `useCurrentFrame()` or a paused GSAP timeline. Everything else needs route 2's virtual-time capture, played forward from the start.

### 3. Rebuild the idea in our own stack

For a look you want inside a HyperFrames, Three.js + GSAP or Remotion composition as a native, seekable layer, write it fresh (a fragment shader with `uTime` from the timeline). The [GLSL cookbook](../iart-motion-fundamentals/NOTES.md) covers the usual building blocks (noise, fbm, domain warp, cosine palettes). Do not port a React Bits component into another framework: a port is explicitly covered by the Commons Clause.

## Picks for broadcast and explainer work

Names are as in the CLI. Descriptions are ours, kept to what the component is for.

| Use | Components |
|---|---|
| **Title-card and lower-third plates** (slow, dark, readable under type) | `Aurora`, `SoftAurora`, `DarkVeil`, `Silk`, `Plasma`, `LineWaves`, `Waves`, `Threads`, `Grainient`, `GradientWaves`, `GradientBlinds`, `Iridescence`, `LiquidChrome`, `GhostFibers` |
| **Light and energy** (openers, transitions, stings) | `LightRays`, `SideRays`, `LightPillar`, `Beams`, `PrismaticBurst`, `Prism`, `LightTunnel`, `Lightfall`, `Hyperspeed`, `Galaxy`, `Lightning`, `MoltenMetal`, `MagicRings`, `Orb` |
| **Tech and data texture** (AI, cyber, markets) | `GridScan`, `Scanner`, `Radar`, `FaultyTerminal`, `LetterGlitch`, `GradientASCII`, `Dither`, `PixelBlast`, `CRTWarp`, `Topography`, `RippleGrid`, `DotField`, `Particles`, `FluxLines` |
| **Headline type** | `SplitText`, `BlurText`, `DecryptedText`, `ScrambledText`, `Shuffle`, `SplitFlapText`, `TextType`, `RotatingText`, `GlitchText`, `ShinyText`, `GradientText`, `StrokeText`, `MaskedHeading`, `EchoText`, `ParticleText` |
| **Numbers** | `CountUp`, `Counter` (odometer digits, with locales) |
| **Logos and marks** | `LogoLoop`, `ElectricLogo`, `MetallicPaint`, `ElectricBorder`, `StarBorder` |
| **Galleries for stills and archive** | `CircularGallery`, `DomeGallery`, `InfiniteMenu`, `InfiniteSpiral`, `FlyingPosters`, `CardSwap`, `DepthCarousel`, `MorphSlider` |
| **Finish** | `Noise` (film grain), `GradualBlur` (edge blur), `PixelTransition` (pixel dissolve wipe) |
| **AI-product UI inserts** (for explainers about agents) | `LatticeLoader`, `StatusMark`, `ThoughtLine`, `CallChip`, `PromptBar`, `RefineFrame` |

## Cautions

- **Arabic.** Components that split text into letters (`SplitText` with its default `splitType: 'chars'`, `Shuffle`, `ScrambledText`, `DecryptedText`, `SplitFlapText`, `TextPressure`, `VariableProximity`) break Arabic letter joining. Animate Arabic by word (`BlurText` defaults to words; `SplitText` with `splitType: 'words'`) and follow the rules in [`../../techniques.md`](../../techniques.md#arabic-and-right-to-left-text).
- **Keep React Bits source out of anything we share.** Install it per project with the CLI. If a film's source repo is public, keep the installed components out of git (or keep the repo private), and do not put React Bits code into this toolkit, a starter, a template or a skill we publish.
- **Exports are fine in a film, not as a pack.** A rendered background inside a news package or a showreel is yours to use; selling or giving away the rendered loops on their own as a background pack is not allowed.
- **Pro.** React Bits Pro (paid) adds page sections, templates and an agent kit under a separate licence. Not reviewed.
- **Third-party shaders.** Some Texture Lab and Shape Magic effects are adapted from Paper Shaders (Apache-2.0) and Shaders.com (MIT); the site says `MetallicPaint` is adapted from Paper's Liquid Metal shader. Their notices live upstream.
- **Untested here.** Route 2 was checked on a small test page with the same patterns (frame-identical across runs), not on a React Bits component.
