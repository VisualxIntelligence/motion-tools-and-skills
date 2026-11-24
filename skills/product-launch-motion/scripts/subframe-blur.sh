#!/usr/bin/env bash
# subframe-blur.sh — average N sub-frames per output frame into real motion blur.
#
# Render the page at fps*N with motion-kit.mjs subT(i) times (sub-frames centred
# on each frame time), save them as frames/s00000.png…, then:
#
#   bash subframe-blur.sh <frames-dir> <out.mp4> [fps=60] [n=4] [crf=15]
#
# From references/technique.md (product-launch-motion, MIT). Tags BT.709 so
# players and editors do not shift the colours. Added in motion-tools-and-skills.
set -euo pipefail
DIR="${1:?frames dir}"; OUT="${2:?out.mp4}"; FPS="${3:-60}"; N="${4:-4}"; CRF="${5:-15}"
W=$(printf '1 %.0s' $(seq 1 "$N")); W="${W% }"
ffmpeg -hide_banner -loglevel error -y -framerate $((FPS * N)) -i "$DIR/s%05d.png" \
  -vf "tmix=frames=${N}:weights='${W}',select='eq(mod(n\,${N})\,$((N - 1)))',setpts=N/(${FPS}*TB),scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -r "$FPS" -c:v libx264 -preset slow -crf "$CRF" -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 "$OUT"
echo "subframe-blur: wrote $OUT ($FPS fps, $N sub-frames per frame)"
