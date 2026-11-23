# raea — notes

**Source:** [shinyobjectz/raea](https://github.com/shinyobjectz/raea) @ `a4898b7` (22 Nov 2026); latest release 0.1.6 (17 Nov 2026). **FSL-1.1-ALv2**, © Shane Murphy. Read 23 November 2026. **Nothing copied:** it installs from a release, and a fast-moving engine copied here would go stale within days (it has shipped a release most days since 11 November).

## What it is

"Render Anything Engine": video, motion graphics, 3D and games written as **React + TypeScript** and rendered on your own GPU by a Rust engine built on **Bevy 0.20**. It is the closest thing yet to a third option beside Remotion and HyperFrames, and its composition API looks like Remotion's:

```tsx
import { AbsoluteFill, Composition, interpolate, registerRoot, useCurrentFrame } from "raea";
```

```sh
raea render hello.tsx -o hello.mp4            # whole film
raea render hello.tsx -o frame.png --frame 45 # one frame for the agent to look at
raea check hello.mp4                          # clipped text, low contrast, unsafe areas, freezes, loudness
raea play hello.tsx                           # play it live, as a game
```

What sets it apart for our work:

- **Built for agents.** Everything it draws stays queryable as data, so an agent can render a frame, inspect it and fix it without a person in the loop. `raea check` is a built-in quality floor, much like our `opus-visual-motion-engine` `qa.mjs`.
- **3D in the same file.** Cameras, lights, materials, glTF, Gaussian splats; a React Three Fiber scene runs inside `<R3F>`, and a three.js page's script inside `<Three program>`.
- **Sound in the engine.** One mixer for live play and offline render, plus local models for foley and notes.
- **An app.** A desktop app with chat, a hand-editable timeline (trim, split, speed curves, freeze frames), review comments that reach the agent, and export.
- **Agent skills.** The installer puts raea's skill in `~/.claude/skills`; or in Claude Code `/plugin install raea --marketplace shinyobjectz/raea-skills` (the skill plus two hooks: a quick check after a composition is saved, and media shown in the app). `raea guide` prints its craft guides.

## Installing on the workstation (Windows)

```powershell
irm https://raea.io/install.ps1 | iex     # installs under ~\.raea and adds raea to PATH
raea --help
```

It needs a DirectX 12 or Vulkan GPU driver; the Visual C++ runtime, FFmpeg and uv ship in its `bin\` folder. Run the installer again to update. Building from source needs Rust, bun and CMake.

## Cautions

- **Windows is the newest and least tested platform**, and the README says the engine is young, with rough edges.
- **Hardware encoding on Windows isn't built yet.** raea's own GPU notes (`docs/gpu.md`, 10 Nov 2026) list Media Foundation (NVENC/AMF/QSV) and NVENC on Linux as "to build". For now, Windows encodes on the CPU (openh264, rav1e). The "renders faster than it plays" claim is measured on Apple Silicon. On the 4090, time the render, and consider rendering a PNG sequence and encoding with `hevc_nvenc` ourselves.
- **Licence.** FSL-1.1-ALv2 allows use, change and redistribution for anything except a *Competing Use*: offering it in a commercial product or service that substitutes for raea or another raea product. Client films made with it are fine. Building a hosted "render anything" service on it is not. Each version becomes Apache-2.0 two years after its release. Third-party parts keep their own licences (`NOTICE`).
- **Network.** raea sends no telemetry on its own, and `RAEA_OFFLINE=1` blocks all network access. `raea bug` sends a text report (paths, emails and keys stripped) to raea's server; `--dry-run` shows what would go. The app's Pro and Team plans add cloud storage and publishing.
- **Not tested here.** Facts are from the source at the commit named.

## Suggested first test

The same 30-second scene (title, three.js layer, beat-cut music) built three ways: Remotion, HyperFrames and raea. Run each on the 4090 and compare:

- render time;
- whether frames are deterministic (the same frame in any seek order);
- how many agent turns each took to pass its own checks;
- output quality at 1080p50 and 2160p.

That decides whether raea joins our motion-design benchmark (Three.js + GSAP, Blender, ComfyUI, Unreal) as a fifth stack.
