#!/bin/sh
# Print the shots (id, start, end, label) of a template as JSON, read from the engine's own shot list.
# drawn_batch.py reads this with --shots, so the sheet gets its panels on the shots and not at even spacing.
#   tools/seedance/shots.sh CAM06-Orbit > shots.json
# Needs: Node 22 and `npm install` done in engine/cinematic. Scratch goes to $CAMERA_CONTROL_HOME/tmp (default engine/cinematic/.work/tmp).
set -e
ID="$1"
[ -z "$ID" ] && { echo "usage: tools/seedance/shots.sh <TEMPLATE-ID>" >&2; exit 1; }
HERE="$(cd "$(dirname "$0")" && pwd)"
ENGINE="$HERE/../../engine/cinematic"
[ -x "$ENGINE/node_modules/.bin/esbuild" ] || { echo "FAIL run npm install in engine/cinematic first" >&2; exit 1; }
cd "$ENGINE"
B="$(node tools/kf-root.mjs)/tmp"
mkdir -p "$B"
./node_modules/.bin/esbuild tools/template-info.ts --bundle --platform=node --format=esm --outfile="$B/ti.mjs" --log-level=error
node "$B/ti.mjs" | node -e '
const id = process.argv[1];
let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
  const t = JSON.parse(s).find(x => x.id === id);
  if (!t) { console.error("FAIL no template " + id); process.exit(1); }
  console.log(JSON.stringify({ id: t.id, duration: t.duration, shots: t.shots.map(x => ({ id: x.id, label: x.label, start: x.start, end: x.end })) }, null, 1));
});' "$ID"
