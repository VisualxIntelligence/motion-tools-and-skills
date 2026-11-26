#!/bin/zsh
# A few renders at a time: several agents share this machine and its memory. Same arguments as render.mjs.
#   tools/render-locked.sh --stills-plan plan.json --out dir --subframes 3 --scale 0.5 --concurrency 2
# RENDER_SLOTS (default 3) is how many may run at once.
cd "$(dirname $0)/.."
N=${RENDER_SLOTS:-3}
BASE=${TMPDIR:-/tmp}/camera-control-render.slot
export DYLD_LIBRARY_PATH=
export TMPDIR="$(node tools/kf-root.mjs)/tmp/render"; mkdir -p "$TMPDIR"   # render scratch
GOT=
while [ -z "$GOT" ]; do
  for i in $(seq 1 $N); do
    L=$BASE.$i
    [ -d $L ] && [ $(( $(date +%s) - $(stat -f %m $L 2>/dev/null || date +%s) )) -gt 1200 ] && rmdir $L 2>/dev/null   # a slot held over 20 minutes is stale
    if mkdir $L 2>/dev/null; then GOT=$L; break; fi
  done
  [ -z "$GOT" ] && sleep 2
done
trap 'rmdir $GOT 2>/dev/null' EXIT INT TERM
node render.mjs "$@"
