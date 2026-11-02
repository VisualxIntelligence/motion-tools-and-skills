# sound-design — Sound Design

Source: sound-design practice on the template film (`template/`). Rule numbers S1–S4 are in `references/aesthetic-rules.md`.

All of the template film's sound is managed in a single file (`template/src/aifl/Main.tsx`: the `SFX[]` frame-pinning table), and the scene components contain no audio code at all — sound is a timeline-level asset, not a shot-level asset.

## Contents

- Method
- BGM selection
- SFX vocabulary
- Alignment techniques

---

## 1. Method

**Order: picture structure basically locked → lay the BGM first to set the energy skeleton → pin SFX beat by beat.**

1. **BGM first, to set the energy skeleton.** One BGM track is laid under the whole film, with the volume envelope doing a fade-in and fade-out at the head and tail using `interpolate` (template film `[0, 30, TOTAL-50, TOTAL] → [0, 0.34, 0.34, 0]`, i.e. a 1s fade-in and a 1.7s fade-out). The BGM volume is held at about 0.34 to leave headroom for the SFX. The track's energy curve must match the storyboard table's energy curve (low opening → mid-section push → outro peak), and candidate tracks must be laid into the finished film for an audition — listening to the track alone cannot tell you its character (S1). The BGM's `<Audio>` is mounted wrapped in a boolean inputProp (such as `bgm`, default `true`), and the SFX are not affected by that switch — a film with BGM always delivers two versions of the finished film in the final render, with the no-BGM version rendered from the same timeline: `npx remotion render … --props=props-nobgm.json` (the file content is `{"bgm":false}`; the Windows shell strips the double quotes from inline JSON, so going through a file is the most reliable, and macOS/Linux can also inline `--props='{"bgm":false}'`).
2. **Choose the vocabulary by "film type", not by "event" (S1).** The product promo SFX vocabulary = whoosh (camera move) / impact (landing) / riser (build-up) / sparkle (light effect, directory `light/`) / transition (transition), and game-sound-pack **timbres** (synth pluck/bloop, cartoon bounce) are banned. The template film's first version chose sounds by UI event semantics (click/drop/confirmation), and the user passed a death sentence at one listen: "too much like a game".
   **The ban is on timbre, not on the action**: if there really is a click / switch / shatter on screen it should get its Foley (the template film itself uses `click-camera.mp3` and gives it the highest loudness in the film, 0.6); but `sfx/ui/` must be auditioned file by file — it contains both real switch Foley and synthetic feedback tones, and the latter belong to the texture this entry excludes (see 3.3 for the keep/drop table); `sfx/glass/` is real shattering material sound. For the distinguishing question see aesthetic-rules S1.
3. **Pin SFX beat by beat, managed centrally in a declarative table (S2).** SFX are a `{ from, src, volume }[]` array, each entry annotated with the on-screen action it corresponds to ("hero card: whoosh up on the pop"), and at render time each entry is wrapped in a `<Sequence from={s.from}>`. This rules out laying sound effects by feel.
4. **Besides the generic sounds, leave "custom-fit to the picture" slots.** After the vocabulary is finalised, distinctive on-screen actions will still want their own Foley (a typing reveal gets keyboard sounds, week-by-week dropping in gets a pop) — a generic swoosh cannot cover these actions (S4).

Timing lesson: on the template film, the audio work did not start until after about 30 rounds of picture changes (the last few rounds of the ending); once, swapping the BGM was mixed into the same round of changes as the picture redo, the picture then kept changing, and the whole SFX table was scrapped and re-pinned. **Sound always comes after the picture is locked** (S3); see section 4 for the details.

---

## 2. BGM selection

### Evolution: three drafts (34 minutes)

| Draft | Track | Source / licence | Reason replaced |
|---|---|---|---|
| v1 | Kevin MacLeod – *Inspired* (warm ambient piano bed); a spare, *Deliberate Thought*, was downloaded in the same batch and never used | incompetech, CC-BY | The user: "change the BGM to something with more rhythm, more passionate and cheerful" — an ambient piano was not passionate enough |
| v2 | Kevin MacLeod – *Life of Riley* (cheerful folk-pop) | incompetech, CC-BY | The user: "this soundtrack and these sound effects are all too much like a game. Find me one with strong drum beats and a strong sense of rhythm" — cheerful ≠ the character of a promo film |
| v3 (final) | Mixkit tech-house drum bed (`bgm-tech-house.mp3`), volume raised to 0.34 | Mixkit license | Never replaced again, kept through to the finished film |

v1→v2 was rejected again after only 22 minutes — which shows the track was never auditioned in the context of the finished film. **Candidate tracks must be laid into the finished film for an audition before deciding** (an S1 self-check item).

### Selection criteria (inferred back from the user's own words)

- **Strong drum beats, a strong sense of rhythm**, with an electronic bed preferred (tech-house type); "pleasant / cheerful" is not a criterion.
- The benchmark character is a "typical product promo video" — listening to the audio track alone with eyes closed, it should sound like a product launch trailer and not a mobile game (S1).
- The energy curve must be able to carry the whole film's structure: a steady drum bed suits layering SFX, and a track whose melody is too prominent will fight with the Foley.

### List of free licensing sources

| Source | Licence | Suitable for | Notes |
|---|---|---|---|
| [Mixkit](https://mixkit.co/) | Mixkit License (free for commercial use, no attribution) | BGM + cinematic SFX (whoosh/impact/riser/sparkle) + all kinds of Foley | The main source of the template film's final BGM and SFX; metadata is often wiped after a bulk download, so **record the track name / URL at download time**, otherwise it cannot be traced back afterwards (the template film's `bgm-tech-house.mp3` can no longer be matched track by track to the Mixkit catalogue, and must be re-checked before commercial use) |
| [incompetech](https://incompetech.com/) (Kevin MacLeod) | CC-BY 4.0 (attribution required) | BGM, a large catalogue, filterable by mood | Source of the template film's v1/v2; note the attribution obligation of CC-BY |
| [Kenney](https://kenney.nl/assets) (sound packs) | CC0 | Game-type projects | **Banned for product promo films** (S1) — after being introduced into the template film they were deleted in one batch, and are listed here only for the licensing record |

---

## 3. SFX vocabulary

### 3.0 Directory structure and how to find a sound

```
assets/audio/
  bgm/                5 files  BGM alternates (tech-house drum bed + house/hip-hop)
  sfx/<category>/   149 files  split into 16 categories by scene/material
```

**To find a sound, first decide the category, then pick the timbre** — look up the table below by the on-screen action you want to score, and go into the corresponding directory to audition.

The mapping from the five words of the S1 vocabulary to directories (**the directory name for `sparkle` is `light/`; the library has no `sparkle/` directory**):

| Vocabulary | whoosh | impact | riser | sparkle | transition |
|---|---|---|---|---|---|
| Directory | `transition/` | `impact/` | `riser/` | **`light/`** | `transition/` |

whoosh and transition are in the same `transition/` (the timbres of camera moves and transitions overlap to begin with); the other 11 categories are the **Foley layer** outside the vocabulary (the "custom-fit to the picture" slot of S4).

| Category | Count | What it holds | When a file goes into this directory |
|---|---|---|---|
| `transition/` | 23 | whoosh / sweep / swoosh / wind | Camera moves, scene switches, elements flying in and out |
| `impact/` | 14 | impact / thud / stomp / bass hit | Landing pin-points, heavy beats, slams |
| `riser/` | 1 | Rising build-up | Energy build-up before the finale / a big shot |
| `camera/` | 10 | Shutter, lens, zoom | A photo-taking feel, crash zoom, focus, iris |
| `ui/` | 18 | Click, switch, notification, pop | UI feedback, theme switching, list drop-in |
| `text/` | 13 | Typewriter, keyboard, writing | Typing reveal, line drawing, underline |
| `paper/` | 10 | Paper, page turn, print | Page-turn transition, tearing, paper craft, riso |
| `film/` | 8 | Projector, film, tape, vinyl | Trailer grammar, film strip, rewind speed change |
| `light/` | 10 | sparkle, light effects | Sweeping light, lighting up, afterglow flash |
| `data/` | 13 | glitch, electric current, data | HUD, streaming output, skeleton screen, glitch |
| `scifi/` | 5 | Tech, space, noise floor | Space camera moves, system noise floor (long-sample bed) |
| `mech/` | 8 | Mechanical, industrial, lock | Part assembly, locking, deformation |
| `glass/` | 4 | Glass, shattering | Shatter transition, hard-cut impact |
| `fluid/` | 5 | Ink, water, fluid, particles | Ink opening, particle fill, bubbles |
| `crowd/` | 3 | Crowd, applause, breathing, heartbeat | Group-photo ending, launch-event feel, tension |
| `counter/` | 4 | Counter, gauge, clock, countdown | Number roll, readout, timeline |

For per-file duration / peak / suggested pin-point see `assets/audio/AUDITION-2026-07-27.md`; for licences and URLs see `assets/audio/ATTRIBUTION.md`.

Note: a category is an **index for finding sounds, not a criterion for scoring**. Choosing sounds still follows the film-type vocabulary discipline of section 2 — material sounds such as `glass/` `crowd/` `fluid/` are "custom-fit to the picture" slots (S4), and generic transitions still prefer `transition/` `impact/`.

### 3.1 Base layer: the 14 actually used by the template film

The table below is the batch used in the template film's final version, and the **"typical pin position"** is the only sound data in this repository with frame numbers from real use; when reusing, take their relative semantics rather than the absolute values (30fps, whole film 1085f). Durations come from ffprobe. The path column gives the post-restructuring location.

| File | Directory | Duration | Use case | Typical pin position (template film) | Source and licence |
|---|---|---|---|---|---|
| `bgm-tech-house.mp3` | `bgm/` | 288.7s | Whole-film drum-bed BGM, tech-house electronic | Laid under the whole film, volume envelope 0→0.34→0.34→0 | Mixkit (cannot be traced track by track, re-check before commercial use) |
| `transition-soft.mp3` | `sfx/transition/` | 1.27s | Soft transition: brand settle, scene cut-in | f12 / f277 / f475 / f623 / f779 (one shot on each entry into a new scene) | Mixkit |
| `whoosh-fast.mp3` | `sfx/transition/` | 1.76s | Fast camera move, batch elements flying away | f78 brand→dashboard, f340/356 deal acceleration, f435 filtered grid flying away | Mixkit |
| `whoosh-big.mp3` | `sfx/transition/` | 2.32s | Large-amplitude camera move: spring-up, pull-back, swing-back | f127 hero card spring-up, f308 orbit pull-back, f388 swoosh back to the search bar | Mixkit |
| `sparkle.mp3` | `sfx/light/` | 4.55s | Light-effect reveal: scanning beam, closing flash | f141 hero card beam, f1005 ending rule flash | Mixkit |
| `transition-snap.mp3` | `sfx/transition/` | 0.57s | A short snap of settling / returning to position | f204 hero card impact reseat | Mixkit |
| `swoosh-quick.mp3` | `sfx/transition/` | 0.78s | Uniform title-card exit sound, light push-camera | f220/565/725/885 the four title cards, f455 push-in after the click | Mixkit |
| `keyboard.mp3` | `sfx/text/` | 19.6s | Real keyboard typing Foley (long sample, trimmed per section) | f401 search box input (cut to 24f), f781 weekly report page "writes itself" (cut to 44f) | Mixkit |
| `click-camera.mp3` | `sfx/camera/` | 0.35s | Click confirmation / shutter feel (loudest in the film, vol 0.6) | f451 click a card to enter detail, f648 papers counter settles | Mixkit |
| `riser-cine.mp3` | `sfx/riser/` | 4.81s | Cinematic rising build-up, entering the finale | f945 start of the outro group-photo assembly section | Mixkit |
| `impact-cine.mp3` | **deleted from the library** | 4.06s | Cinematic heavy-beat pin-point (vol 0.55, the film's SFX peak) | f980 wordmark stamp lands | Mixkit |
| `pop.mp3` | `sfx/ui/` | 0.48s | A short pop of list items dropping in one by one | f840–865 six-shot burst of the weekly report's week list, one every 5f, volume stepping down 0.40→0.25 | **Source to be determined** |
| `impact-transition.mp3` | `sfx/impact/` | 4.87s | **Dead asset: not referenced in the whole film**, a spare impact downloaded in the same batch as the final SFX | None | Mixkit (same batch), not wired up |
| `typewriter.mp3` | **deleted from the library** | 0.22s | **Dead asset: not referenced in the whole film**. The document page reveal actually uses `keyboard.mp3` cut to 44f; this file was downloaded but not wired up | None | **Source to be determined** |

Summary: 12/14 actually sound in the film; 2 dead assets (`impact-transition.mp3` kept in the library, `typewriter.mp3` deleted); `pop.mp3`, whose source is to be determined, is still in the library.

**Handling of the two deleted files (2026-07-27 screening)**:

- `impact-cine.mp3` has been deleted from `assets/audio/`, but **the template film renders as usual** — Remotion reads the independent copy in `template/public/audio/` (`staticFile('audio/...')`), which is still there, and `Main.tsx:86` needs no change. When a new project wants to reproduce the outro's three-beat phrasing, use `sfx/impact/impact-deep-whoosh.mp3` instead: it is **byte-for-byte identical** to the original `impact-cine.mp3` (md5 `ce27fd2f`, see 3.2) and is the same Mixkit asset, Cinematic whoosh deep impact.
- `typewriter.mp3` has been deleted (it was a dead asset to begin with, and the typing reveal actually uses `keyboard.mp3` with frame truncation). For single-keystroke Foley use `sfx/text/typewriter-hit-single.mp3` or `typewriter-hit-hard.mp3` instead.

### 3.2 Same-asset duplicate names: 4 pairs of files are byte-for-byte identical

A whole-library md5 comparison on 2026-07-27 found that, among the base layer and the first batch of additions, 4 pairs are **the same Mixkit asset downloaded twice and saved under two names**:

| A pair | Actually the same asset | Current state |
|---|---|---|
| `transition/transition-soft` = `transition/air-zoom-vacuum` | Air zoom vacuum | Both sides present |
| `transition/swoosh-quick` = `transition/sweep-fast-small` | Fast small sweep transition | Both sides present |
| `impact/impact-transition` = `impact/impact-epic-trailer` | Movie trailer epic impact | Both sides present |
| `impact/impact-cine` = `impact/impact-deep-whoosh` | Cinematic whoosh deep impact | `impact-cine` deleted, `impact-deep-whoosh` kept |

**These pairs cannot be used for the "two-sample alternation" of 4.2** — the bytes are identical, so alternating means no change of sound, and the machine-gun effect stays as it was.
If you really want two samples, pick files of similar but different timbre from the same category (such as `text/typewriter-hit-hard` + `text/typewriter-hit-soft`).

Lesson: same-asset duplicate names appearing in the library are the inevitable result of "judging whether there are duplicates by file name after a bulk download". **When adding a new sound effect to the library, run an md5 de-duplication first**; don't trust names:
```bash
find assets/audio -name '*.mp3' -exec md5 -r {} \; | sort | awk '{print $1}' | uniq -d
```

A by-product of the comparison was recovering the original URLs of 7 base-layer files (see `ATTRIBUTION.md`), which originally could not be traced back because the bulk download lost the metadata.

### 3.3 The `ui/` directory must be auditioned file by file and cannot be cleared as a whole

`ui/` is the only category in the whole library with a **split in internal texture**: it holds both real-object Foley and synthetic UI feedback tones — and the latter is exactly what S1 wants to exclude. The Mixkit original name is the easiest thing to go by (`tone` / `bleep` / `alert` / `notification` are strong signals of a synthetic sound):

| File | Mixkit original name | Texture |
|---|---|---|
| `switch-light` | Light switch sound | ✅ Real light switch |
| `switch-tap` | On or off light switch tap | ✅ Real light switch |
| `switch-click-quick` | Quick switch click | ✅ Real switch |
| `pop` | (source to be determined) | ✅ Used in the template film's final version (six-shot burst of the weekly report's week list) |
| `hitech-touch-magnet` | Hi-tech touch with magnet | ⚠️ Magnetic-snap texture, leaning synthetic but with a physical feel, decide by the film's tone |
| `chime-crystal` | Crystal chime | ⚠️ Crystal wind chime, a light-effect / decorative sound rather than UI feedback, can also be used as in `light/` |
| `pop-electric` | Electric pop | ⚠️ Electronic pop, usable in rapid-fire scenes, slightly synthetic as a single shot |
| `ui-select-click` | Select click | ⚠️ Interface click, cleaner than the ones below |
| `ui-click-tone` | Cool interface click tone | ❌ Synthetic tone |
| `ui-confirm-bleep` | High tech bleep confirmation | ❌ Synthetic bleep |
| `ui-confirm-tone` | Confirmation tone | ❌ Synthetic tone |
| `ui-tone-quick` | Digital quick tone | ❌ Synthetic tone |
| `ui-success-soft` | Success software tone | ❌ Synthetic tone (the "success" semantics are exactly the kind the S1 precedent rejected) |
| `ui-notify-tech` | Technology notification | ❌ Notification tone |
| `ui-message-pop` | Message pop alert | ❌ Notification tone |
| `ui-popup-dry` | Dry pop up notification alert | ❌ Notification tone |
| `ui-option-select` | Interface option select | ❌ Synthetic interface sound |
| `ui-select-modern` | Modern technology select | ❌ Synthetic interface sound |

Usage:
- ✅ Tier one can be used directly as Foley for interactive actions (the switch in `theme-switch-moves`, the tier switching of `segmented-thumb-hero`).
- ⚠️ Tier one **must be auditioned in the context of the finished film** before deciding; don't listen to it alone.
- ❌ Tier one is by default not used in product promo films. **Exception**: a film that deliberately wants a narrative of "the system speaking" (HUD announcements, AI confirmation receipts, error demos) — then it is a deliberate stylistic choice; following the aesthetic-rules usage notes, a deliberate violation of a rule must be written into the project documentation.

The same file-by-file audition discipline applies to `data/` and `scifi/` (which are naturally full of synthetic sounds), except that the purpose of those two categories is "digital / tech texture" to begin with, so unlike `ui/` they are not mistaken for generic interaction Foley.

## 4. Alignment techniques

### 4.1 Frame-pinning method

- **A declarative central registry**: `SFX: { from, src, volume }[]`, each entry annotated with the on-screen action it corresponds to; the render layer iterates the array and wraps each entry in `<Sequence from={s.from}>`. The frame-number table and the storyboard table (`AIFL_SHOTS`) are placed in the same file for cross-reference (S2).
- **Long samples are truncated by Sequence, the audio file is not cut**: `keyboard.mp3` (19.6s original material) is given a `durationInFrames` of 24f or 44f by context; the rest uniformly use 90f so that material ≤3s plays out naturally. The audio duration is strictly equal to the on-screen action (S4). **21 files in the library are longer than 5s and must be given an explicit `durationInFrames`**; following the 90f default would drag on and keep sounding after the action ends (see the table below).
- **Volume layering**: BGM at 0.34 as the bed, SFX in the regular range 0.2–0.6 — click confirmation at 0.6 is the loudest, the pop-burst tail at 0.25 is the quietest, using loudness to express "how important this beat is" (the 0.14 that once appeared came from the deleted v2 pluck burst string and does not belong to the final range). **But the premise of 0.2–0.6 is that the material peak is close to 0dB**: `volume` is a multiplication factor and not a target volume, and the 7 files in the library that were themselves recorded quietly (peak <-12dB) may still be covered by the BGM even at 1.0 — the first choice is to swap the material or pre-normalise it, and if necessary give a gain >1 (Remotion supports it, but the preview clamps to 1.0, so the peak must be verified on the rendered output). The list and the three ways out are below. After pinning, audition on the rendered output; don't just trust the numbers.

#### Long samples that need explicit truncation (>5s, 21 of them)

| File | Duration | Usage |
|---|---|---|
| `scifi/scifi-computer-ambience` | 23.5s | Noise floor, spread over a whole shot |
| `film/projector-spin-antique` | 21.7s | Noise floor / loop, truncated by section |
| `text/keyboard` | 19.6s | Typing section, the template film truncates to 24f / 44f |
| `text/write-blackboard` | 13.9s | Line-drawing section, truncated by stroke duration |
| `mech/mech-robotic-futuristic` | 9.6s | The whole assembly / deformation |
| `camera/camera-autofocus` | 9.6s | Focusing, generally only the first 10–20f are used |
| `paper/paper-book-browse-fast` | 9.3s | Continuous page turning, truncated by number of pages |
| `scifi/space-intro-futuristic` | 8.1s | Opening build-up |
| `light/light-spell` | 8.0s | The whole lighting-up |
| `impact/impact-cine-big` | 7.9s | Landing, with a long reverb tail, truncating the tail will sound dry |
| `scifi/tech-hum-futuristic` | 6.0s | Noise floor |
| `transition/wing-flutter` `swoosh-slow` `wind-pass-vibrate` | 5.0–5.7s | Camera move, fitted to the camera-move duration |
| `paper/paper-wind-blow` | 5.5s | The whole scattering of paper |
| `mech/metal-drop-scifi-small` | 5.5s | Settling, with a tail |
| `light/light-aura` `light-transition-magic` | 5.1–5.5s | Light-effect afterglow |
| `impact/impact-movie-epic` | 5.1s | Landing, with a long tail |
| `data/power-up-electronic` | 5.0s | The whole start-up / lighting-up |
| `crowd/applause-rhythmic-loop` | 5.0s | Loopable applause |

Criterion: **noise floor / loop types** (ambience, hum, projector) are spread by shot duration; **action types** are truncated by action duration; **impacts with a long reverb tail** (`impact-cine-big` `impact-movie-epic` `metal-drop-scifi-small`) let the tail decay naturally, and a hard cut will sound dry.

#### Files recorded quietly (peak <-12dB, 7 of them)

**First get one thing straight: `volume` is a multiplication factor, not a target volume.** `volume={1}` just means "play as-is" — the material itself is -24.6dB, and after giving it 1.0 it is still -24.6dB. The BGM peak is close to 0dB, and laid at 0.34 it is about -9.4dB, so even if `data-load-os` is given the upper limit of 1.0 it is still 15dB below the BGM, **and is still covered by the drum bed**. The advice of "capping the volume at 1.0" is ineffective.

| File | Peak | Below BGM (-9.4dB) by | Needed to overcome BGM (about -6dB) |
|---|---|---|---|
| `data/data-load-os` | -24.6dB | -15.2dB | ~8.5x |
| `text/pencil-write-short` | -22.7dB | -13.3dB | ~6.8x |
| `text/write-fast` | -20.0dB | -10.6dB | ~5.0x |
| `transition/wing-flutter` | -17.9dB | -8.5dB | ~3.9x |
| `camera/ui-zoom-in` | -14.3dB | -4.9dB | ~2.6x |
| `counter/clock-knob-spin` | -14.0dB | -4.6dB | ~2.5x |
| `counter/clock-tick-single` | -13.9dB | -4.5dB | ~2.5x |

Three ways out, in order of priority:

1. **Swap the material (first choice).** Find a replacement in the same category whose peak is close to 0dB — `data/` has 12 other choices, `counter/` has 3, and `text/` has 12. Raising the gain on quiet material raises the noise floor at the same time, and swapping to one that was recorded well is easier than rescuing one.
2. **Pre-normalise** (when you want to keep this timbre). Normalise with ffmpeg before putting it into the library, dealing with it cleanly once, and then at pinning time the regular 0.2–0.6 range can be used:
   ```bash
   ffmpeg -i in.mp3 -af "loudnorm=I=-16:TP=-1.5" out.mp3   # or -af "volume=8.5"
   ```
3. **Give `volume` a gain greater than 1.** Remotion **allows** `volume>1` and genuinely amplifies — measured in this repository: `data-load-os` given `volume={4}` outputs -12.7dB, and given `{16}` outputs -0.7dB (i.e. 4x≈+12dB, 16x≈+24dB, consistent with the 20·log₁₀ conversion). I checked the Remotion source: `validateMediaProps` blocks only `volume<0` and does not block >1; the Web Audio path writes the value straight into `gainNode.gain` with no clamping.
   Two premises must be known:
   - **The preview clamps to 1.0**; `Math.min(volume, 1)` appears only in the traditional `<audio>.volume` fallback path (Safari / when Web Audio is disabled). That is, **what you hear in the preview may be quieter than the finished film**, and you must judge by the rendered output.
   - **Raising the gain raises the noise floor together, and may clip.** Always check the peak after rendering, and if `max_volume` approaches 0.0dB, back off the gain or go via way 1/2:
     ```bash
     ffmpeg -hide_banner -i out.mp4 -af volumedetect -f null /dev/null 2>&1 | grep max_volume
     ```

Conversely: most files in the library have peaks close to 0dB, and giving 0.6 is already the magnitude of "the loudest beat in the whole film". When adding a new sound effect to the library, record its peak at the same time:

```bash
ffmpeg -hide_banner -i <file>.mp3 -af volumedetect -f null /dev/null 2>&1 | grep max_volume
```

### 4.2 Pitch-shifting and preventing the machine-gun effect

**This repository has confirmed there is no playbackRate pitch-shifting** (a `grep playbackRate` across the template film's whole repository has zero hits). Preventing the machine-gun effect on rapid-fire sounds of the same kind relies on a combination of three measures (S2), not on pitch-shifting:

1. **Two-sample alternation**: the burst uses two similar samples in turn (the template film's deck-deal eight-shot burst alternates pluck_002/pluck_001).
2. **Stepped volume decrease**: decay linearly along the sequence to create a "sense of distance" — the final pop six-shot burst is 0.40/0.37/0.34/0.31/0.28/0.25.
3. **Intervals accelerate following the animation curve**: the burst intervals shrink to follow the picture's acceleration beat (8f→3f); when it gets so dense that it smears into one mass, **actively let the sound fade out into a single swoosh** and don't score each one individually — the ear, like the eye, cannot tell apart individuals that have smeared together.

Target listening feel: a rapid-fire passage is a "countable rhythm", not a mechanical repetition (the S2 self-check item).

### 4.3 riser→impact: the shot-closing phrase

The fixed three beats of a big shot (especially the outro):

```
riser-cine (start of the assembly / build-up section) → about 35f later impact-deep-whoosh (subject stamp lands, the film's loudness peak) → 25f later sparkle (afterglow light effect)
```

The template film's f945→f980→f1005 is the only phrase in the section that was never changed after the final sound direction was established (in the template film the file in the middle beat is named `impact-cine.mp3`, which has been deleted from the library; the equivalent file in the library is the byte-identical `impact-deep-whoosh.mp3`, see 3.1) — the trio of energy build-up, pin-point and afterglow came together in one go. Other reusable small phrases: scene switch = one shot of `transition-soft`; title-card exit = the uniform `swoosh-quick` sound; click confirmation = `click-camera` (given the highest SFX loudness in the film).

### 4.4 Rework lesson: the sequential account of three re-pins

The template film's whole SFX table was re-pinned three times, of which **two were purely the knock-on cost of picture rework** (S3):

| Time | Cause | Nature |
|---|---|---|
| 1 | Wrong timbre direction (game sound pack → cinematic vocabulary) | Rework of the sound itself, unavoidable |
| 2 | Picture timeline change (total length 1020→1085), the whole table's from values shifted | **Knock-on cost of pinning sound before the picture was locked** |
| 3 | Animation added to the picture of the weekly report section, SFX of that section rewritten | Same as above (local) |

Turned into a rule: **do sound after the picture is locked; any change that alters shot durations/order always ends with "re-align the frame numbers in the whole SFX table"** (S3). Counter-example: once, swapping the BGM and the deck-deal picture redo were stuffed into the same commit, the picture then changed again, and the sound effects were pinned in vain.

### 4.5 Frame pinning is always relative to the shot start, not absolute frames (hard rule)

The template film's SFX table pins **absolute frame numbers**, and a single-file array makes whole-table shifting convenient (the second re-pin was done in a single diff), but absolute frames mean zero structural reuse — if any one shot changes duration, every entry after it is invalidated.

Approach: write the pinning as `SHOTS.<shot>.from + offset` (an offset relative to that shot's start; in a beat-hit film write `beatF(n)`, see music-beat-sync.md). That way, when a shot's internal beats are unchanged, changing the duration of an earlier shot only requires updating the storyboard table in one place and the SFX follow automatically — the vast majority of re-pinning can be avoided. A new project writes with relative pinning from the very start, and never writes bare numeric frame numbers.

### 4.6 Audio-picture alignment adds two offsets (hard rule)

The design intent is "the source peak lands on the target beat frame", and between the intent and the finished film lie two offsets, which stack when neither is
compensated — measured in this repository the heaviest hit was 0.27s late, clearly reading as audio-picture out of sync;
in a beat-hit film a 2–3 frame difference is enough that the audience cannot hear "this hit follows the drums", and reasonable beat-hit
motion is read as groundless shake (the S5 precedent). The unified formula (computed in floating point, rounded at the last step):

```
Sequence.from = target peak frame − source peak lag frames − output audio track offset frames
```

**Offset one: the final output audio track offset (measured per render pipeline).**
The whole audio track of the rendered film has a fixed lag relative to the video. The root cause is in the **output encoding / muxing
chain**, not in the behaviour of `<Audio>` or `Sequence.from`: the AAC encoder has
encoder priming (warm-up samples padded at the head), with a typical value of 2048 samples
= 1.28f@30fps at 48kHz. In this repository AiflPromo measured click lag of 2032 samples and
impact lag of 2066 samples (≈1.27–1.29f), consistent with the priming fingerprint; and the audio track of the rendered product
(aifl-ref.mp4) has an edit list (elst media time=0) that does not declare trimming of this
padding at the head, so after decoding it shows up as a real offset. Remotion officially tracks a problem of the same family:
remotion-dev/remotion#7099.

- **Record per pipeline, not per "film"**: the offset is determined by four elements — Remotion version + audio codec +
  sample rate + container — and the measured value is archived together with the four elements; if the four elements are unchanged it can be reused, and if any one changes it must be re-measured. The priming magnitude varies with the encoder (ffmpeg's built-in
  aac ≈1024, fdk-aac 2048, Apple ≈2112 samples), so no constant can be assumed.
- In the promo-ink era **4f** (≈133ms/6400 samples) was measured, a magnitude far beyond
  what priming can explain, with the root cause unverified — it is kept only as a piece of warning data that "old constants cannot be carried across pipelines", and not as a statement of mechanism.

Measurement method (done after rendering; measuring once accurately is good for the same pipeline in general):

```bash
ffmpeg -i out/promo.mp4 -vn -acodec pcm_s16le /tmp/render-audio.wav
```

Take the **original files** of 2–3 sharp SFX and do a normalised cross-correlation against the rendered audio track (numpy
`np.correlate` will do); the peak position minus the designed frame number is the offset; the measurement counts as accurate only when the residuals of several probes are consistent, since measuring just one point may run into the source's own peak lag.

**Offset two: the source's own peak lag (measured per file).**
For many materials the energy peak is not at the head of the file (a crescendo attack, a leading breath), and aligning by file head means arriving
late. Measured examples: brush-write 2f, paper-slide 10f, ink-char as deep as 24f. Locate the peak position with the audio energy envelope,
and when a new sound effect is put into the library record it together with max_volume
(see 4.1; the same principle as the music-beat-sync §4 "align material by internal peak, not by file head").

Render-layer implementation — the SFX table keeps the `{ from, src, volume }` schema of §4.1 unchanged,
and the three-item split happens inside the calculation expression of `from` (a complete audit chain, never hand-editing frame numbers entry by entry):

```tsx
// Measured for this pipeline: Remotion 4.x + AAC 48kHz mp4, 2026-08-23, click/impact dual-probe cross-correlation
const OUTPUT_AUDIO_OFFSET_F = 1.28;
const PEAK_F: Record<string, number> = { 'impact-deep-whoosh.mp3': 2 /* measured per file */ };
const sfxFrom = (targetPeakF: number, src: string) =>
  Math.max(0, Math.round(targetPeakF - (PEAK_F[src] ?? 0) - OUTPUT_AUDIO_OFFSET_F));
// How to write it in the table: { from: sfxFrom(SHOTS.outro.from + 35, 'impact-deep-whoosh.mp3'), src: …, volume: 0.55 }
```

Two boundary notes:
- **durationInFrames does not get the offset added**: once the window as a whole moves forward, its start and end points return into place together by ear; lengthening the window of a truncated-type sound effect (one whose long sample is trimmed by an explicit durationInFrames) would play extra content that should have been trimmed.
- The `Math.max(0, …)` fallback means pinned points within about the first 2f of the film cannot be fully compensated, and the residual is recorded in the acceptance table; try not to design a head-of-film accent in the first 2 frames.

The BGM side is the same in principle but is accounted in a different place: the source music grid constant `SOURCE_BEAT0` keeps the analysis
truth unchanged, and the output offset is set as a separate constant that takes part in the `beatT` conversion, see music-beat-sync
§5b — both places share the same set of cross-correlation measurement methods.

Acceptance: after compensating and re-rendering, re-run the cross-correlation on 2–3 probes, and a residual ≤0.5f counts as passing.

(These media are not in this repo; fetch them from upstream https://github.com/Vincentwei1021/video-shotcraft at commit 43bd349.)
