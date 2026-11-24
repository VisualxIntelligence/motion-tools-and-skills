# MOTION PHILOSOPHY — The Gold Standard

> Deconstruction of the **Infinite — Global Payments** 30s spot. The reference every Hyperframes motion build aspires to. Re-read §0 and §4 before and during any creative session.

---

## 0 · The 11 Laws (memorize)

1. **One idea per beat. Cut fast.** Avg scene ≈ **1.5s**. Each visual lands ONE concept. If a scene says two things, split it.
2. **Black is the canvas.** ~90% of every frame is black or near-black. Negative space is the design.
3. **Light is the brand, not color.** Chrome gradients, halos, vignettes, light beams. The piece is *lit*, not *colored*.
4. **Camera never sleeps.** Grid recedes, coin rotates, particles drift, vignette breathes. Static = death.
5. **Motion blur is a feature.** Every transition rides a streak/blur trail — masks the cut AND conveys energy.
6. **Object metaphors carry meaning.** Red card = broken. Teal coin = working. Same coin returns 3×.
7. **Palette is symbolic, not decorative.** Each color owns one concept. If you can't name its meaning, it hasn't earned its place.
8. **Type is a character.** Words SCALE 8×, MORPH, GLOW. Typography drives ~60% of storytelling.
9. **Hold the hero shot.** Logo reveal ~2s. Outro card 5+s. Kinetic chaos → calm = catharsis.
10. **One unifying texture.** Perspective grid + crosshair (+) markers are the spine of the whole piece.
11. **Timelines must fill their slots.** HF hides a sub-composition the moment `timeline.duration()` < `data-duration` → black-frame flash. Every timeline ends with `tl.to({}, { duration: SLOT_DURATION }, 0)`. Non-negotiable. (Recipe §3.5; diagnostic §4.)

**Three-act structure / rule of threes:** problem→brand · benefits→surfaces→products · foundation→CTA→silence. 3 benefits, 3 surfaces, 3 product names, 3 coins.

---

## 2 · Visual Vocabulary

### 2.1 Core Backgrounds

- **Perspective grid floor** — always. `<div>` with `transform: perspective(900px) rotateX(60deg)` + two `repeating-linear-gradient` axes at `rgba(255,255,255,.05) 0 1px, transparent 1px 80px`. GSAP animates `background-position-y` for parallax.
- **Vignette** — always on top. `radial-gradient(ellipse at center, transparent 30%, #000 95%)`, `pointer-events: none`.
- **Grain overlay** — always. `npx hyperframes add grain-overlay`.
- **Sparkle particles** (grid scenes) — 20–40 absolute `+` shapes at random intersections, GSAP `stagger.from('random')` opacity, `repeat: -1, yoyo: true`.
- **Iridescent gradient stage** (wheel scenes) — soft conic-gradient or pre-rendered `<video muted loop>` for true chromatic shimmer.
- **Conical light beam** (finales) — `conic-gradient(from 180deg at 50% 0%, transparent, rgba(0,255,200,.15) 50%, transparent)`, blurred.
- **Liquid-glass card** — 4-stop diagonal gradient `rgba(255,255,255,.075/.025/.010/.055)` + `backdrop-filter: blur(14px) saturate(1.12)` + inner highlight `inset 0 1px 0 rgba(255,255,255,.22)` + 1px border. Inner highlight is the iOS-26 tell.

### 2.2 Type System

- **Single sans-serif.** Geometric, generous tracking (Inter, Suisse Int'l, SF Pro).
- **Chrome gradient on all headlines:** `background: linear-gradient(180deg, #fff 0%, #999 60%, #ccc 100%); -webkit-background-clip: text; color: transparent;`
- **Halo glow on emphasis:** `text-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.3)`
- **Word-by-word reveal** (not character-by-character):
  ```html
  <span class="clip word" data-start="0.0">Global</span>
  <span class="clip word" data-start="0.4">payments</span>
  ```
  `tl.from('.word', { y: 30, opacity: 0, scale: 0.85, duration: 0.6, ease: 'power3.out', stagger: 0.35 })`
- **Type SCALES dramatically.** Labels 48px. Hero kinetic-type 480px+. Animate via `scale`.
- **Title Case for emphasis**, not sentence-case.
- **Chrome-gradient sweep.** 8-stop gradient with DARK BOOKENDS (prevents edge tear):
  ```css
  background: linear-gradient(90deg,
    #14110a 0%, #14110a 15%,
    #5a3215 25%, #c84f1c 40%, #e2b53f 55%, #2a8a7c 70%,
    #14110a 85%, #14110a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 100%;
  background-position: 100% 0;
  ```
  Tween `backgroundPosition` `100% 0` → `0% 0` over `0.6s` `power2.out`, `stagger: 0.04`.
- **Word-reveal carrier.** First word carries momentum with a 360px slide; tail words decay: `360 → 120 → 60 → 25 → 12px`. Carrier `expo.out 0.33s`; tail `power2.out 0.20s`. Anchor to Whisper onsets. On punchlines, lead the VISUAL 0.2s ahead of audio — reads as inevitable.
- **Per-beat font discipline.** Every beat uses a DIFFERENT Google Fonts family; the contrast sells "different universes." Roster: Instrument Serif · Space Grotesk · Bebas Neue · Inter · EB Garamond italic · Cormorant Garamond italic · Azeret Mono · Geist · JetBrains Mono / SF Mono.

### 2.3 Color Discipline

For every new scene, name the one color carrying the beat. If you can't, you haven't earned it.

Reference palette (Infinite-spot specific — AIS or other briefs override): Chrome white→gray `#fff → #999` (premium/brand voice) · Red `#e10b1f` (problem/broken) · Teal `#33d4c8`/`#5ee2d9` (solution/core) · Magenta/purple `#a155ff`/`#7e42d8` (speed/energy/API) · Blue `#3b82f6`/`#5db4ff` (connection/global) · Neon orange/yellow `#ff9430`/`#ffd84a` (value/affordability).

**Palette cap: 5 active hues, each with a meaning.** Over that, you're decorating.

### 2.4 Motion Vocabulary

| Move | GSAP recipe |
|------|-------------|
| **Camera dolly through type** | `tl.fromTo(text, { scale: 1, opacity: 1 }, { scale: 8, opacity: 0, duration: 1.5, ease: 'power2.in' })` |
| **Light-streak whip** | `gsap.fromTo(streak, { xPercent: -150 }, { xPercent: 250, duration: 0.4, ease: 'power3.in' })` — fire AT the cut |
| **Word ghost reveal** | `stagger: 0.35` with exits at `+= 0.5` → 0.15s overlap |
| **Object morph drift** | `to A: { x: 200, scale: 0.5, opacity: 0 }`, `from B: { x: -200, scale: 0.5, opacity: 0 }`, both 0.5s. Light streak hides swap. |
| **Coin spin reveal** | `tl.from(coin, { rotateY: 90, duration: 0.8, ease: 'back.out(1.4)' })` — needs `transform-style: preserve-3d` |
| **Crystallize → wordmark** | Two aligned timelines: coin scales 1→0.3 + moves to logo pos, wordmark fades 0→1, both end at same X/Y |
| **Energy pulse along path** | SVG `stroke-dasharray + stroke-dashoffset` 1→0; node `boxShadow` tween at path end |
| **Color recolor (no cut)** | `tl.to(':root', { '--accent': '#ff9430', duration: 0.6 })` — CSS vars |
| **Slide-up phone reveal** | `tl.from(phone, { y: '100%', duration: 1, ease: 'power3.out' }).from(headline, { y: 30, opacity: 0, duration: 0.6 }, 0.3)` |
| **Wheel + side-panel** | `tl.to(wheel, { rotation: 120, duration: 1.5 }).from(panel, { x: -100, opacity: 0, duration: 0.6 }, '<0.3')` |
| **Floating cluster drift** | `gsap.to(coins, { y: '-=15', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.4, from: 'random' } })` |
| **Vignette breath** | `gsap.to(vignette, { opacity: 0.9, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' })` |
| **Cut-the-curve vertical whip** (default adjacent-beat transition) | **Exit:** `tl.to(wrap, { y: -150, filter: "blur(30px)", duration: 0.33, ease: "power2.in" })` · **Entry:** `gsap.set(wrap, { y: 150, filter: "blur(30px)" })` then `tl.to(wrap, { y: 0, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, 0)` — same direction both sides, velocity matched at the cut |

**Transitions menu:** light-streak whip (default) · cross-warp morph (object→object) · color recolor (related ideas same comp) · slide-up (product mockups) · flash-through-white (act break) · swirl-vortex (product-family rotations). Registry blocks for most: `whip-pan`, `cross-warp-morph`, `flash-through-white`, `swirl-vortex`, `cinematic-zoom`, `chromatic-radial-split`.

### 2.5 Pacing

- **Scene length:** 1.0–2.0s. Longer only for hero moments or outro.
- **Reveal cadence:** new element every 0.3–0.6s within a scene. No dead air > 1s mid-piece.
- **Word stagger:** 0.3–0.4s narrative, 0.5–0.6s dramatic.
- **Whip transition:** 0.3–0.4s.
- **Holds:** logo crystallize 1.5–2s · CTA card 4–6s · section headlines 1–1.5s after full reveal.
- **Breathing rule:** every ~7–8s of kinetic density, give a 1s rest beat.

### 2.6 Audio Mix

Every audio scene sets `data-volume` explicitly. Default to a 0.15 warm pad, not a music track.

| Layer | `data-volume` | Role |
|------|---------------|------|
| Voiceover | `1.0` | Primary, drives timing |
| Underscore (warm pad) | `0.15` | Barely there |
| SFX (clicks, whooshes) | `0.2` | Tails bleed into next beat |

Wire as sibling `<audio>` elements in root, never inside `<video>`.

---

## 3 · HyperFrames Recipes

### 3.1 Grid background (re-use everywhere)

```html
<div class="stage" data-composition-id="...">
  <div class="grid-floor clip" data-start="0" data-duration="30" data-track-index="0"></div>
  <svg class="crosshairs clip" data-start="0" data-duration="30" data-track-index="1">
    <!-- 16 + marks at grid intersections -->
  </svg>
  <div class="vignette clip" data-start="0" data-duration="30" data-track-index="9"></div>
  <div class="grain    clip" data-start="0" data-duration="30" data-track-index="10"></div>
  <!-- Content in tracks 2–8 -->
</div>

<style>
.grid-floor {
  position: absolute; inset: 0;
  transform: perspective(900px) rotateX(60deg) translateY(20%);
  background:
    repeating-linear-gradient(0deg,  rgba(255,255,255,.05) 0 1px, transparent 1px 80px),
    repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 80px);
  background-color: #000;
}
.vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 30%, #000 95%);
}
</style>
```

### 3.2 Whip-streak transition

```html
<div class="whip-streak clip" data-start="3.6" data-duration="0.4" data-track-index="8"></div>

<style>
.whip-streak {
  position: absolute; top: 50%; left: 0;
  width: 40%; height: 8px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  filter: blur(6px); transform: translateY(-50%);
}
</style>

<script>
gsap.fromTo('.whip-streak',
  { xPercent: -100, scaleX: 0.5 },
  { xPercent: 250, scaleX: 1.5, duration: 0.4, ease: 'power3.in' }
);
</script>
```

Next scene's `data-start` lands at the streak's peak (~halfway through) so the cut hides in the brightness.

### 3.3 Color Recolor Trick (no cut)

```html
<div class="flowchart" style="--edge: #5db4ff; --node-glow: rgba(91,180,255,.6);">
  <!-- nodes use var(--edge) for borders, var(--node-glow) for shadow -->
</div>

<script>
tl.to('.flowchart', {
  '--edge': '#ffd84a',
  '--node-glow': 'rgba(255,148,48,0.7)',
  duration: 0.6, ease: 'power2.inOut'
}, 2.5);
</script>
```

Same DOM, meaning shifts (Global → Affordable). Cheap to build, expensive to look at.

### 3.4 3D objects — pre-render or CSS?

- Iridescent chrome / chromatic refraction → **pre-render MP4** (alpha or loop). WebGL overkill.
- Planar motion, spinning flat textures → **CSS 3D + GSAP**.
- Card with motion blur → PNG + `filter: blur()` keyframe at peak.

### 3.5 Timeline-padding rule (framework-critical)

Every sub-composition ends its timeline with a no-op anchor:

```js
const tl = gsap.timeline({ paused: true });
// … tweens …
tl.to({}, { duration: SLOT_DURATION }, 0);  // forces timeline.duration() >= SLOT_DURATION
window.__timelines['my-comp'] = tl;
```

HF sets `visibility: hidden` when `timeline.duration() < data-duration` — black-frame flash at the beat tail. The anchor has zero animation cost but keeps the composition alive for its full slot.

### 3.6 GSAP proxy pattern (Canvas 2D / shaders in a timeline)

Drive procedural rendering from a single tween advancing a proxy time value:

```js
const proxy = { time: 0 };
tl.to(proxy, {
  time: DURATION, duration: DURATION, ease: "none",
  onUpdate: () => renderAtTime(proxy.time)
}, 0);
```

Rules:
1. **Canvas 2D is headless-safe; live WebGL can stall the render.** Ship a Canvas 2D fallback keyed off `renderOptions.headless`.
2. **No `Math.random()` / `Date.now()`.** Use seeded PRNGs or harmonic-sin hashes — renders must be deterministic.

### 3.7 `<video>` poster + lastframe bracketing

`<video>` tags flicker on startup and black-frame after source ends. Bracket with static JPG stills:

```html
<img id="beat-poster"    src="assets/beat4-poster.jpg">
<video id="beat-video"   src="assets/beat4-clip.mp4"
       data-start="7.1" data-duration="8.94" data-track-index="5" muted></video>
<img id="beat-lastframe" src="assets/beat4-lastframe.jpg">
```

```js
tl.set("#beat-poster",    { display: "none" }, 7.1);   // hand off at video-start
tl.set("#beat-lastframe", { opacity: 1 },      16.04); // cover video-end → beat-end
```

```bash
ffmpeg -y -ss 0        -i clip.mp4 -frames:v 1 -q:v 2 poster.jpg
ffmpeg -y -sseof -0.04 -i clip.mp4 -frames:v 1 -q:v 2 lastframe.jpg
```

### 3.8 Captions as body-level siblings

Keep captions OUT of sub-composition timelines. Place in `index.html` outside the master composition `<div>`, each with unique `data-track-index ≥ 20`:

```html
<div class="cap clip" data-start="7.29"  data-duration="1.86" data-track-index="30">HyperFrames by HeyGen.</div>
<div class="cap clip" data-start="9.10"  data-duration="3.44" data-track-index="31">Agents write HTML and render MP4s.</div>

<style>
.cap {
  position: absolute; bottom: 72px; left: 50%; transform: translateX(-50%);
  padding: 12px 22px; border-radius: 14px;
  background: rgba(10, 8, 5, 0.55);
  backdrop-filter: blur(8px);
  font: 500 28px/1.3 Inter, sans-serif; color: #fff;
}
</style>
```

### 3.9 Tween-comment convention

Every entry/exit tween's comment names the matching tween in the adjacent beat:

```js
// ENTRY — blur de-ramps from 22px to match outgoing "circle" beat's 22px exit.
gsap.set(wrap, { filter: "blur(22px)" });
tl.to(wrap, { filter: "blur(0px)", duration: 0.33, ease: "power2.out" }, 0);

// EXIT — matches incoming "engine" beat's 150px y + 30px blur entry.
tl.to(wrap, { y: -150, filter: "blur(30px)", duration: 0.33, ease: "power2.in" }, 1.89);
```

If you can't name the matching tween, you haven't designed the seam.

---

## 4 · Pre-flight Checklist (before claiming "done")

- [ ] **Avg scene length ≤ 2s** in mid-section
- [ ] **No dead air > 1s** outside deliberate holds
- [ ] **Every transition uses motion** (no hard fades)
- [ ] **Palette ≤ 5 active hues**, each with a meaning
- [ ] **Every text block uses chrome gradient + halo** — no flat white
- [ ] **Grid + crosshairs in ≥ 60% of scenes**
- [ ] **Vignette + grain on every scene**
- [ ] **One callback minimum** — a visual that returns later
- [ ] **Outro holds 4+ seconds**
- [ ] **Visual verification done** — frames extracted, Read, confirmed: no cropped faces, no text overflow, no beat on wrong word, no broken transitions
- [ ] **Every timeline ends with `tl.to({}, { duration: SLOT_DURATION }, 0)`** (Law #11)
- [ ] **All tween end-times snap to multiples of `1/fps`** — steep-tail easings (`expo.in`, `power4.in`) alias at sub-frame boundaries
- [ ] **Ran the timeline-duration diagnostic:**
  ```js
  const p = document.querySelector('hyperframes-player');
  const iw = p.shadowRoot.querySelector('iframe').contentWindow;
  Object.fromEntries(Object.entries(iw.__timelines).map(([k, v]) =>
    [k, +v.duration().toFixed(4)]));
  ```
  Any gap where `timeline.duration() < data-duration` is a black-frame risk.

### 4.1 GSAP Code Dictionary

| Purpose | Ease | Duration |
|---|---|---|
| Word reveal (slide-in) | `expo.out` | 0.20–0.33s |
| Generic enter | `power2.out` | 0.2–0.5s |
| Generic exit | `power2.in` | 0.2–0.33s |
| Beat whip EXIT | `expo.in` / `power2.in` | 0.2–0.33s |
| Beat whip ENTRY | `expo.out` / `power2.out` | 0.5–1.0s |
| Camera pan between stops | `power2.inOut` | 1.2–2.3s |
| Linear hold (after entry) | `"none"` | 0.4–0.65s |
| Bouncy card settle | `back.out(1.2–1.5)` | 0.3–0.5s |
| UI overshoot | `elastic.out(1, 0.3–0.4)` | 0.20s |
| Breathe / drift | `sine.inOut` yoyo | 2–4s, `repeat: -1` |

**Staggers:** chrome sweep across words `0.04` · dot-grid ripple per-column `0.019`, within-column `0.004` · code-stream lines `0.06`.

**No `gsap.defaults()`** — declare ease/duration per tween. Inheritance bugs are harder to diagnose than verbose tweens.

**Timeline skeleton:**
```js
(() => {
  const tl = gsap.timeline({ paused: true });
  // … tweens …
  tl.to({}, { duration: SLOT_DURATION }, 0);  // Law #11 anchor
  window.__timelines['<data-composition-id>'] = tl;
})();
```
Key must match `data-composition-id` exactly.

---

## 5 · Anti-patterns (beyond Law inversions)

- ❌ **`Math.random()` / `Date.now()` / unseeded PRNGs in a render loop.** Use harmonic hashes: `80 + 220 * Math.abs(Math.sin(i*0.7 + 0.3) * Math.cos(i*1.3 + 0.7))`.
- ❌ **Leaning on `npx hyperframes add <block>` for benchmark pieces.** The HF launch video installs ZERO registry blocks. Registry = velocity; hand-built = reference quality.
- ❌ **Shipping without viewing frames.** Lint passing ≠ design working. **VIEW THE FRAMES.**
- ❌ **Decorative grain or vignette.** Not decoration — unifying *texture*. Every scene, every time.

---

## 6 · TL;DR

> **One idea per beat, lit not colored, kinetic not still, callbacks not novelty, hold the hero, breathe the outro — the grid is always under everything, every timeline fills its slot, every exit snaps to a frame boundary, and every cut hides inside a motion-blurred whip.**
