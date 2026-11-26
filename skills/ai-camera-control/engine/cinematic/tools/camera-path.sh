#!/bin/zsh
# tools/camera-path.sh <piece> [--step 0.5 | t1 t2 ...] : the camera measured against its subject (see camera-path.ts)
cd "$(dirname $0)/.." && B="$(node tools/kf-root.mjs)/tmp" && mkdir -p "$B" && ./node_modules/.bin/esbuild tools/camera-path.ts --bundle --platform=node --format=esm --outfile="$B/cp.mjs" --log-level=error && node "$B/cp.mjs" "$@"
