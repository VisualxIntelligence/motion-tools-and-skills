#!/usr/bin/env python3
"""Compare a checked baseline alpha layer against a six-frame visual lead.

Usage: python3 compare-timing.py talk.mp4 b-roll.mov output-directory
Requires ffmpeg and ffprobe. The layer must be aligned to recording time zero.
"""
import hashlib
import json
from fractions import Fraction
from pathlib import Path
import subprocess
import sys


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path),
    ]))


def audio_hash(path):
    return hashlib.sha256(subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0',
        '-c:a', 'copy', '-f', 'data', '-',
    ])).hexdigest()


if len(sys.argv) != 4:
    sys.exit(__doc__)
source, layer, out = map(lambda p: Path(p).resolve(), sys.argv[1:])
src, alpha = probe(source), probe(layer)
video = next(s for s in alpha['streams'] if s['codec_type'] == 'video')
fps = Fraction(video['r_frame_rate'])
source_video = next(s for s in src['streams'] if s['codec_type'] == 'video')
if Fraction(source_video['r_frame_rate']) != fps:
    sys.exit('Recording and layer must have the same frame rate.')
if (source_video['width'], source_video['height']) != (video['width'], video['height']):
    sys.exit('Recording and layer must have the same dimensions.')
if not video.get('pix_fmt', '').startswith(('yuva', 'rgba', 'bgra', 'gbrap')):
    sys.exit('Use an alpha layer such as ProRes 4444, not a flattened film.')
duration = float(src['format']['duration'])
if abs(float(alpha['format']['duration']) - duration) > 1 / float(fps):
    sys.exit('Layer and recording must have matching durations.')
if not any(s['codec_type'] == 'audio' for s in src['streams']):
    sys.exit('A spoken recording with audio is required.')
out.mkdir(parents=True, exist_ok=True)
records = []
original_audio = audio_hash(source)
for name, frames in [('baseline', 0), ('lead-6f', 6)]:
    dest = out / f'{name}.mp4'
    graph = (
        f'[1:v]trim=start_frame={frames},setpts=PTS-STARTPTS[g];'
        '[0:v][g]overlay=eof_action=pass:repeatlast=0:format=auto,format=yuv420p[v]'
    )
    subprocess.run([
        'ffmpeg', '-v', 'error', '-n', '-i', str(source), '-i', str(layer),
        '-filter_complex', graph, '-map', '[v]', '-map', '0:a:0',
        '-c:v', 'libx264', '-crf', '18', '-preset', 'fast', '-c:a', 'copy',
        '-t', str(duration), '-movflags', '+faststart', str(dest),
    ], check=True)
    result = probe(dest)
    assert audio_hash(dest) == original_audio, 'Audio changed'
    assert abs(float(result['format']['duration']) - duration) <= 1 / float(fps), 'Duration changed'
    records.append({'file': dest.name, 'leadFrames': frames, 'leadSeconds': frames / float(fps),
                    'audioPacketsUnchanged': True, 'duration': float(result['format']['duration'])})
    print(f'Created {dest}', flush=True)
(out / 'results.json').write_text(json.dumps({
    'source': str(source), 'layer': str(layer), 'layerFps': str(fps),
    'scope': 'Whole visual layer shifted; audio unchanged. Not a viewer preference result.',
    'variants': records,
}, indent=2) + '\n')
