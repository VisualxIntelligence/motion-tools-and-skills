#!/bin/sh
# Package the large result videos as release downloads. Nothing is uploaded.
#   tools/package_release.sh <output dir>
# Writes <output dir>/camera-control-results.zip (release-media/: what Seedance made from each template, 480p drafts and finals,
# the camera-only plates and the looks) and SHA256SUMS. Upload them to the GitHub release by hand after reading NOTICE.md.
set -e
OUT="${1:?usage: tools/package_release.sh <output dir>}"
cd "$(dirname "$0")/.."
mkdir -p "$OUT"
rm -f "$OUT/camera-control-results.zip"
zip -q -r "$OUT/camera-control-results.zip" release-media -x "*.DS_Store"
( cd "$OUT" && shasum -a 256 camera-control-results.zip > SHA256SUMS )
du -h "$OUT/camera-control-results.zip"; cat "$OUT/SHA256SUMS"
