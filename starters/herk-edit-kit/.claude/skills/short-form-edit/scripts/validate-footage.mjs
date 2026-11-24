import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
export function validateFootage(rows){
 const errors=[],seen=new Set();
 for(let i=0;i<rows.length;i++){
  const r=rows[i];if(!r.sourceSceneId)errors.push(`Missing scene identity: ${r.scene}`);
  else if(seen.has(r.sourceSceneId))errors.push(`Repeated footage scene: ${r.sourceSceneId}`);seen.add(r.sourceSceneId);
  if(!/^[a-f0-9]{64}$/.test(r.sha256||''))errors.push(`Missing asset hash: ${r.scene}`);
  if(!(r.sourceStart>=0&&r.sourceEnd>r.sourceStart))errors.push(`Invalid interval: ${r.scene}`);
  for(const previous of rows.slice(0,i))if(previous.sha256===r.sha256&&Math.min(previous.sourceEnd,r.sourceEnd)>Math.max(previous.sourceStart,r.sourceStart)+.001)errors.push(`Overlapping footage: ${previous.scene} / ${r.scene}`);
 }
 return {ok:errors.length===0,errors,scenes:rows.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
 const root=path.resolve(process.argv[2]||'.'),plan=JSON.parse(fs.readFileSync(path.join(root,'assets/plan.json')));
 const footage=plan.scenes.filter(s=>s.layout?.includes('broll')||s.mode==='footage');
 const ledgerPath=path.join(root,'assets/footage-ledger.json'),rows=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath)):[];
 const result=validateFootage(rows);
 for(const s of footage)if(rows.filter(r=>r.scene===s.id).length!==1)result.errors.push(`Missing or duplicate ledger row: ${s.id}`);
 for(const r of rows){
  const asset=path.resolve(root,r.asset);if(!asset.startsWith(root+path.sep)||!fs.existsSync(asset)){result.errors.push(`Missing local asset: ${r.scene}`);continue;}
  if(crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex')!==r.sha256)result.errors.push(`Asset hash mismatch: ${r.scene}`);
  if(!footage.some(s=>s.id===r.scene))result.errors.push(`Unselected ledger row: ${r.scene}`);
 }
 result.ok=result.errors.length===0;console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
}
