#!/bin/zsh
# tools/bake.sh : run every scene's physics once and store it in src/kit/bakes.json (re-run after changing a spec)
cd "$(dirname $0)/.." && B="$(node tools/kf-root.mjs)/tmp" && mkdir -p "$B" && ./node_modules/.bin/esbuild tools/bake-physics.ts --bundle --platform=node --format=esm --outfile="$B/bake.mjs" --log-level=error && OUT="$PWD/src/kit/bakes.json" node "$B/bake.mjs"
