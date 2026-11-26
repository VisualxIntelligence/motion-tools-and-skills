#!/bin/zsh
# tools/motion.sh : the motion check (touch, sink, foot slide, head steadiness) on every template; ONLY=SC06 for some
cd "$(dirname $0)/.." && B="$(node tools/kf-root.mjs)/tmp" && mkdir -p "$B" && ./node_modules/.bin/esbuild tools/motion-check.ts --bundle --platform=node --format=esm --outfile="$B/motion.mjs" --log-level=error && node "$B/motion.mjs" "$@"
