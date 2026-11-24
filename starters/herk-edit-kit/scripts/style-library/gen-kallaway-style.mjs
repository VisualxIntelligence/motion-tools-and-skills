import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../../style-library/02-kallaway/", import.meta.url));

const purposeOrder = ["section","stat","overview","lower-third","label"];
function meta(file){
  const tier = file.startsWith("t1-") ? "tier1" : "tier2";
  let purpose, treatment;
  if(file.startsWith("t1-section-")){purpose="section";treatment=file.slice("t1-section-".length);}
  else if(file.startsWith("t1-stat-")){purpose="stat";treatment=file.slice("t1-stat-".length);}
  else if(file.startsWith("t1-overview-")){purpose="overview";treatment=file.slice("t1-overview-".length);}
  else if(file.startsWith("t2-lt-")){purpose="lower-third";treatment=file.slice("t2-lt-".length);}
  else if(file.startsWith("t2-lb-")){purpose="label";treatment=file.slice("t2-lb-".length);}
  treatment = treatment.replace(/\.html$/,"");
  return {tier,purpose,treatment};
}
function extractSlots(html){
  const re = /data-slot="([^"]+)"/g; const seen=[]; let m;
  while((m=re.exec(html))){ if(!seen.includes(m[1])) seen.push(m[1]); }
  return seen;
}
function extractCompId(html){
  const m = html.match(/data-composition-id="([^"]+)"/);
  return m ? m[1] : null;
}
const richish = new Set(["headline","label","title","title_left","title_right","term","detail","root"]);

const cards = [];
for(const tierDir of ["tier1","tier2"]){
  const dir = `${ROOT}/cards/${tierDir}`;
  for(const f of readdirSync(dir).filter(x=>x.endsWith(".html") && !x.startsWith("_"))){
    const html = readFileSync(`${dir}/${f}`,"utf8");
    const {tier,purpose,treatment} = meta(f);
    const compId = extractCompId(html);
    const slots = extractSlots(html).map(name=>({name, type: richish.has(name)?"richtext":"text"}));
    const tcode = tier==="tier1"?"t1":"t2";
    const id = `kallaway.${tcode}.${purpose}.${treatment}`;
    cards.push({
      id, tier, purpose, treatment, compId,
      file: `cards/${tierDir}/${f}`,
      slots,
      duration: tier==="tier1" ? {min:6,max:8} : {min:4,max:10},
      preview: { mp4:`preview/${id}.mp4`, poster:`preview/${id}.png` },
    });
  }
}
cards.sort((a,b)=>{
  const pa=purposeOrder.indexOf(a.purpose), pb=purposeOrder.indexOf(b.purpose);
  if(pa!==pb) return pa-pb;
  return a.treatment.localeCompare(b.treatment);
});
// strip compId from final (kept only for the check print)
const compIds = cards.map(c=>c.compId);
const dupes = compIds.filter((v,i)=>compIds.indexOf(v)!==i);
for(const c of cards) delete c.compId;

const style = JSON.parse(readFileSync(`${ROOT}/style.json`,"utf8"));
style.cards = cards;
writeFileSync(`${ROOT}/style.json`, JSON.stringify(style,null,2)+"\n");

const byPurpose={};
for(const c of cards) byPurpose[c.purpose]=(byPurpose[c.purpose]||0)+1;
console.log(JSON.stringify({total:cards.length, byPurpose, duplicateCompIds:[...new Set(dupes)]},null,2));
