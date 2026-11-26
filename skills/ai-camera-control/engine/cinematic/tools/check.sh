#!/bin/zsh
# tools/check.sh              : the measured pass on every shot (PIECE=<template id> is required, for example PIECE=CAM06-Orbit)
# tools/check.sh 3 5 15 ...   : where each subject lands at those times, and what blocks it
# tools/check.sh --framer [t] : the bounding-box framer's self-test
cd "$(dirname $0)/.." && B="$(node tools/kf-root.mjs)/tmp" && mkdir -p "$B" && ./node_modules/.bin/esbuild tools/frame-check.ts --bundle --platform=node --format=esm --outfile="$B/fc.mjs" --log-level=error && node "$B/fc.mjs" "$@"
