# Using the files

| Tool | File | Notes |
|---|---|---|
| OBS Studio | `.webm` | Media Source (below) |
| OBS Studio, live text | the page | Browser Source with `?obs` (below) |
| Premiere Pro | `.mov` (ProRes 4444) | Premiere does not read WebM alpha: the see-through areas would come in black |
| DaVinci Resolve | `.mov` | If edges look dark or haloed, set Clip Attributes → Alpha Mode to Straight |
| Final Cut Pro | `.mov` | Drop it on a connected clip above the footage |
| Web page | `.webm` (+ HEVC `.mov` for Safari) | See [On a web page](#on-a-web-page) |
| An editor without alpha | `.mp4 --ground '#00ff00'` | Remove the green with its chroma key; thin text may fringe |

## OBS: Media Source

1. In the scene, **+ → Media Source**, pick the `.webm`.
2. Untick **Loop**; tick **Restart playback when source becomes active**.
3. Place it above the camera source. The file is full-frame 1920×1080 with the graphic already in position, so leave it unscaled at 0,0.
4. To fire it on cue, give the source a **Show/Hide** hotkey in Settings → Hotkeys: showing it plays it once.

One file per card: add a source per guest and show the one who is speaking.

## OBS: Browser Source (change the name without re-rendering)

The page itself is transparent and plays in OBS.

1. **+ → Browser Source**, untick **Local file**, and set the URL to `file:///full/path/to/page.html?obs&card=0` (`card` picks the entry of `CARDS`, counting from 0).
2. Width 1920, height 1080.
3. Tick **Refresh browser when scene becomes active** so it plays from the start each time.

With `?obs` the page plays once and stays empty; add `&loop` to repeat. Edit `CARDS` in the page and refresh the source to change a name.

## On a web page

Chrome and Edge play the WebM with its alpha. Safari does not play VP9 alpha; it plays HEVC with alpha, which ffmpeg can only encode on macOS (`hevc_videotoolbox`):

```bash
ffmpeg -c:v libvpx-vp9 -i lower-third.webm -c:v hevc_videotoolbox -alpha_quality 0.75 -tag:v hvc1 -b:v 2M lower-third-safari.mov
```

List the HEVC source first; browsers that can't play it fall through to the WebM:

```html
<video autoplay muted playsinline>
  <source src="lower-third-safari.mov" type='video/mp4; codecs="hvc1"'>
  <source src="lower-third.webm" type="video/webm">
</video>
```

## ProRes from an existing WebM

`render.mjs` writes ProRes 4444 straight from the frames, which is best. To convert a WebM you already have, decode it with libvpx so the alpha survives:

```bash
ffmpeg -c:v libvpx-vp9 -i lower-third.webm -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le lower-third.mov
```
