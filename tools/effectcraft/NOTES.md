# EffectCraft — notes

**Source:** [storytold/effectcraft](https://github.com/storytold/effectcraft) @ `86af5cb` (23 Nov 2026). MIT or Apache-2.0. Read 24 November 2026. **Nothing copied:** it is an application with release builds.

## What it is

A free, open-source **After Effects-style compositor written in Rust**: compositions, layers, keyframes, 308 effects, layer styles, expressions, 3D cameras and lights, Roto Brush (optional MobileSAM) and face tracking (optional MediaPipe).

- **Render queue with pure-Rust encoders** (no FFmpeg inside): H.264, ProRes Proxy to 4444 XQ with alpha, HEVC Main/Main 10, AV1, WebM VP9 with alpha, and EXR, PNG, TIFF and Targa sequences.
- **Lottie import and export** (precomps, shapes, text, masks, mattes, eased keyframes, optionally expressions), with a list of anything Lottie can't express.
- **Built for agents.** `effectcraft-cli mcp` is an MCP server over stdio, headless or bridged to the running app (`--bridge 9877`); a ready `.mcp.json` ships in the repo. One-shot CLI calls return JSON:
  ```bash
  effectcraft-cli set Main '#1' transform/position '[100,360]' --time 0 main.ecproj --save
  effectcraft-cli render --comp Main --out main.mp4
  effectcraft-cli exec file.exportLottie '{"comp":"Main","path":"main.json"}' main.ecproj
  ```
- Projects are readable, versioned JSON (`.ecproj`). Native on macOS, Windows (x64, x86, ARM64) and Linux, and in the browser (WebAssembly).

## Status for us: watch

- **Alpha.** The first commit was 1 October 2026. The project estimates it is about 45 % of the way to professional production, and says it **isn't yet recommended for production client work**.
- **macOS is the most tested platform.** Windows and Linux users have hit basic interaction bugs.
- **No After Effects plug-ins and no `.aep` import.**

It is the first open, agent-drivable stand-in for the After Effects slot dropped from our motion-design benchmark. Try it on the benchmark's generic test when it reaches beta, and check its Windows build on the workstation.

**Not tested here.**
