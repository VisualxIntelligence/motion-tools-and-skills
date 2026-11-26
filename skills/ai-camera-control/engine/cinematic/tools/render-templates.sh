#!/bin/zsh
# The template library, end to end: physics bakes, info cards, key stills (sub-frame motion blur), moving previews,
# path-traced heroes and the gallery with both checks. Everything lands in $OUT (default: the project's render folder).
#   tools/render-templates.sh                 -> everything
#   STEPS="videos gallery" tools/render-templates.sh
#   IDS="ACT01-BulletTimeOrbit,SC07-AlleyFight" tools/render-templates.sh   -> only these (stills, videos, heroes)
set -e
cd "$(dirname $0)/.."
OUT=${OUT:-$PWD/../.work/render}
STEPS=${STEPS:-"bake info stills videos gallery pathtraced"}
B="$(node tools/kf-root.mjs)/tmp" && mkdir -p "$B"         # where the node tools are bundled (small)
export DYLD_LIBRARY_PATH=
export TMPDIR=${RENDER_TMP:-${TMPDIR:-/tmp}/camera-control-render}   # render scratch
mkdir -p $TMPDIR $OUT/stills $OUT/videos $OUT/pathtraced $OUT/gallery
ES=./node_modules/.bin/esbuild
build() { $ES $1 --bundle --platform=node --format=esm --outfile=$B/$2 --log-level=error; }
step() { [[ " $STEPS " == *" $1 "* ]]; }
BOX="${BOXES:+--boxes}${INK:+ --storyboard}"   # BOXES=1: people are drawn as our striped pill (the capsule stand-in), never as a mannequin; INK=1: the set in ink line on paper, the pill painted over it

step bake && tools/bake.sh
if step info; then build tools/template-info.ts ti.mjs && node "$B/ti.mjs" > $OUT/info.json && echo "info: $(python3 -c "import json;print(len(json.load(open('$OUT/info.json'))))") templates"; fi
ALL=$(python3 -c "import json;print(','.join(t['id'] for t in json.load(open('$OUT/info.json'))))")
IDS=${IDS:-$ALL}
if step stills; then
  python3 -c "
import json,sys; ids=set('$IDS'.split(','))
print(json.dumps({t['id']: [x for s in t['shots'] for x in s['times']] for t in json.load(open('$OUT/info.json')) if t['id'] in ids}))" > $OUT/stills-plan.json
  node render.mjs --stills-plan $OUT/stills-plan.json --out $OUT/stills --subframes ${STILL_SUB:-4} --scale ${STILL_SCALE:-0.5} --concurrency 3 $BOX
fi
step videos && node render.mjs --videos "$IDS" --out $OUT/videos --subframes 5 --scale 0.5 --concurrency 4 $BOX
if step pathtraced; then
  python3 -c "
import json; ids=set('$IDS'.split(','))
print(json.dumps({t['id']: [t['shots'][len(t['shots'])//2]['times'][1]] for t in json.load(open('$OUT/info.json')) if t['id'] in ids}))" > $OUT/hero-plan.json
  node render.mjs --stills-plan $OUT/hero-plan.json --out $OUT/pathtraced --pathtrace 128 --concurrency 1
fi
if step gallery; then
  build tools/frame-check.ts fc3.mjs && build tools/sheet-data.ts sd.mjs && build tools/motion-check.ts motion.mjs
  TMPDIR="$B" python3 tools/build-gallery.py $OUT/stills $OUT/info.json $OUT/gallery
fi
echo "done: $OUT"
