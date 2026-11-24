#!/usr/bin/env node
// Optional integration exercise: synthesized footage only, no API or personal media.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const dir=join(root,'tmp/media-smoke'); mkdirSync(dir,{recursive:true});
function run(command,args) {
  const r=spawnSync(command,args,{cwd:root,encoding:'utf8',windowsHide:true});
  if(r.error || r.status !== 0) throw new Error(`${command} failed: ${r.error?.message ?? r.stderr}`);
  return r.stdout;
}
function node(script,args){return run(process.execPath,[script,...args]);}
function probe(file) {return JSON.parse(run('ffprobe',['-v','error','-show_entries','stream=codec_type,duration','-show_entries','format=duration','-of','json',file]));}
const video=join(dir,'source.mp4'),silenced=join(dir,'silenced.mp4'),clean=join(dir,'clean.mp4');
run('ffmpeg',['-v','error','-y','-f','lavfi','-i','testsrc2=size=640x360:rate=30:duration=8','-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=8','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-c:a','aac','-shortest',video]);
node('.claude/skills/cut-silences/scripts/cut-silences.mjs',['examples/editing/source.json','--video',video,'--out-dir',dir,'--output',silenced,'--apply']);
const silencedTranscript=join(dir,'source.silence-transcript.json');
const doc=JSON.parse(readFileSync(silencedTranscript));
node('.claude/skills/cut-mistakes/scripts/find-cut-candidates.mjs',[silencedTranscript,'--out-dir',dir]);
const cuts=join(dir,'reviewed.json');
writeFileSync(cuts,JSON.stringify({cuts:[{start:doc.words[0].start,end:doc.words[1].start,reason:'Synthetic repeat exercise'}]}));
node('.claude/skills/cut-mistakes/scripts/apply-cuts.mjs',[silencedTranscript,'--cuts',cuts,'--video',silenced,'--out-dir',dir,'--output',clean,'--apply']);
const cleanDoc=JSON.parse(readFileSync(join(dir,'source.mistakes-transcript.json')));
const reports=[];
for(const [file,expected] of [[silenced,doc.audio_duration_secs],[clean,cleanDoc.audio_duration_secs]]) {
  const info=probe(file);
  assert.ok(info.streams.some(s=>s.codec_type==='video'));
  assert.ok(info.streams.some(s=>s.codec_type==='audio'));
  assert.ok(Math.abs(Number(info.format.duration)-expected)<.12,'Retimed transcript matches encoded media within frame/codec tolerance');
  const [v,a]=['video','audio'].map(type=>Number(info.streams.find(s=>s.codec_type===type).duration));
  assert.ok(Math.abs(v-a)<.12,'Audio and video duration stay aligned');
  reports.push({file:file.split(/[\\/]/).at(-1),expected,encoded:Number(info.format.duration),video:v,audio:a});
}
assert.equal(cleanDoc.words.map(w=>w.text).join(' '),'we build a small garden. Plants need light.');
node('scripts/build-edl-review.mjs',[join(dir,'source.mistakes-edl.json'),'--original',silenced,'--edited',clean,'--output',join(dir,'review.html')]);
writeFileSync(join(dir,'results.json'),JSON.stringify(reports,null,2));
console.log(JSON.stringify({passed:true,reports},null,2));
