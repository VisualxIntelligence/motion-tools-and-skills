import fs from 'node:fs';import path from 'node:path';
export function validatePlan(plan,transcript,edl,exists=()=>true){
 const errors=[],fail=m=>errors.push(m),fps=plan.fps,tol=1/fps+.005;
 if(!Number.isFinite(fps)||fps<=0)fail('Invalid fps');
 if(!plan.scenes?.length)fail('No scenes');
 const words=transcript.words.filter(w=>w.type!=='spacing');
 const caps=(plan.captions||[]).flatMap(g=>g.words);
 if(caps.length!==words.length)fail(`Caption word count ${caps.length} != retained word count ${words.length}`);
 words.forEach((w,i)=>{
  const cap=caps[i];if(!cap||cap.text!==w.text)fail(`Caption ${i} missing or different`);
  else if(Math.abs(cap.start-w.start)>.005||Math.abs(cap.end-w.end)>.005)fail(`Caption ${i} timing differs from transcript`);
  if(w.end<=w.start||w.start<0||w.end>plan.duration+tol)fail(`Word ${i} outside timeline`);
  const k=edl.keeps.find(k=>w.sourceStart>=k.sourceStart-.016&&w.sourceEnd<=k.sourceEnd+.016);
  if(!k)fail(`Word ${i} crosses a cut or has no source range`);
  else if(Math.abs(w.start-(k.start+w.sourceStart-k.sourceStart))>.006)fail(`Word ${i} source mapping incorrect`);
 });
 let end=0;const ids=new Set();for(const s of plan.scenes||[]){
  if(ids.has(s.id))fail(`Duplicate scene ${s.id}`);ids.add(s.id);
  if(Math.abs(s.start-end)>.005)fail(`Scene gap or overlap at ${s.id}`);
  if(s.end<=s.start)fail(`Scene ${s.id} has no duration`);
  if(Math.abs(s.start*fps-Math.round(s.start*fps))>.01)fail(`Scene ${s.id} is not frame aligned`);
  if(!s.anchor||!Number.isFinite(s.anchorTime))fail(`Scene ${s.id} has no verified anchor`);
  else if(s.anchorTime-s.start<-.15||s.anchorTime-s.start>.2)fail(`Scene ${s.id} anchor not close to cut`);
  if(s.layout.includes('broll')&&!exists('assets/'+s.kind+'.mp4'))fail(`Missing moving B-roll ${s.kind}`);
  end=s.end;
 }
 if(Math.abs(end-plan.duration)>.005)fail('Scene coverage differs from duration');
 const times=[0,...(plan.events||[]).map(e=>e.time),plan.duration].sort((a,b)=>a-b);let maxGap=0;
 for(let i=1;i<times.length;i++){const gap=times[i]-times[i-1];maxGap=Math.max(maxGap,gap);if(gap>2.2){const s=plan.scenes.find(s=>times[i-1]>=s.start&&times[i-1]<s.end);if(!s?.holdReason)fail(`Unexplained visual-event gap ${gap.toFixed(2)}s at ${times[i-1].toFixed(2)}`);}}
 for(const e of plan.events||[])if(!ids.has(e.visual)||e.time<0||e.time>=plan.duration)fail('Invalid visual event '+JSON.stringify(e));
 for(let i=0;i<(plan.captions||[]).length;i++){const g=plan.captions[i];if(g.start>g.words[0].start+.005||g.end<g.words.at(-1).end-.005)fail('Caption group truncates word '+i);if(i&&g.start<plan.captions[i-1].end-.005)fail('Caption groups overlap '+i);}
 return {ok:!errors.length,errors,metrics:{duration:plan.duration,retainedWords:words.length,scenes:plan.scenes.length,averageShotSeconds:plan.duration/plan.scenes.length,visualEvents:plan.events.length,maxEventGap:maxGap,speakerShare:plan.scenes.filter(s=>['face','split','broll-split'].includes(s.layout)).reduce((a,s)=>a+s.end-s.start,0)/plan.duration}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
 const root=path.resolve(process.argv[2]||'.');const read=n=>JSON.parse(fs.readFileSync(path.join(root,'assets',n)));
 const result=validatePlan(read('plan.json'),read('transcript.json'),read('edit-decisions.json'),p=>fs.existsSync(path.join(root,p)));
 console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
}
