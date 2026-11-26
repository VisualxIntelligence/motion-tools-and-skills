#!/bin/sh
# Render one template as the pill clip that is sent to Seedance as the reference video:
# 24 fps, no sound, 21:9 (1280x534), the same conversion the published clips went through.
#   tools/render-pill.sh CAM06-Orbit [--standin capsule]
# Output: .work/out/pill/<ID>.pill.mp4 (override the folder with CAMERA_CONTROL_HOME).
set -e
cd "$(dirname "$0")/.."
ID="$1"; shift || true
[ -z "$ID" ] && { echo "usage: tools/render-pill.sh <TEMPLATE-ID> [--standin capsule|pin]"; exit 1; }
HOME_DIR="${CAMERA_CONTROL_HOME:-$PWD/.work}"
OUT="$HOME_DIR/out/pill"
mkdir -p "$OUT"
TAG=""; case " $* " in *" --standin capsule "*) TAG=".capsule";; esac   # the capsule never overwrites the pin clip
node render.mjs --videos "$ID" --boxes --clean --subframes 5 --scale 0.6667 --concurrency 3 --out "$OUT" "$@"
ffmpeg -v error -y -i "$OUT/$ID.mp4" -vf "crop=1280:534" -r 24 -an -c:v libx264 -crf 18 -pix_fmt yuv420p "$OUT/$ID$TAG.pill.mp4"
echo "$OUT/$ID$TAG.pill.mp4"
echo "Keep every reference video under 29 s in total (trim a longer clip)."
