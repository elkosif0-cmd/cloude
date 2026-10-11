// Identity audit: how far the stylesheets and modules drift from the SQC identity (docs/design/SQC-IDENTITY-ar.md).
// Measures, never fixes. A ratchet: tools/fixtures/identity-baseline.json holds the last accepted numbers and no metric
// may get worse; `--write-baseline` records the current numbers after a deliberate improvement.
//   node tools/identity_audit.mjs            # print the report, exit 1 on a regression
//   node tools/identity_audit.mjs --json     # also write artifacts/identity/report.json
//   node tools/identity_audit.mjs --write-baseline
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const list=(dir,ext)=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith(ext)).map(f=>dir+'/'+f).sort();
const CSS=[...list('ui/ds','.css'),...list('ui/features','.css')];
const JS=[...list('ui/core','.js'),...list('ui/components','.js'),...list('ui/layouts','.js'),...list('ui/features','.js')].filter(f=>!f.endsWith('engines.js'));
const TOKENS='ui/ds/tokens.css';
/* the identity's two families for the SQC look; other looks may add their own */
const FAMILIES=['IBM Plex Sans Arabic','Montserrat'];

const hex=/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const px=/(?:^|[\s:;,(])(?:padding|margin|gap|row-gap|column-gap|inset|top|left|right|bottom)[a-z-]*\s*:\s*([^;}]*)/gi;
function spacingOffGrid(css){
  let n=0,m;px.lastIndex=0;
  while((m=px.exec(css))){for(const v of m[1].matchAll(/(-?\d*\.?\d+)px/g)){const x=Math.abs(parseFloat(v[1]));if(x>=2&&x%4!==0)n++}}
  return n;
}
function metrics(){
  const perFile={};let colours=0,offGrid=0,radiusLiterals=0,weights={},families=new Set(),focusRules=new Set(),inlineColours=0,importantCount=0;
  for(const f of CSS){
    const css=read(f),isTokens=f===TOKENS;
    const c=isTokens?0:(css.match(hex)||[]).length;colours+=c;
    const g=spacingOffGrid(css);offGrid+=g;
    const r=(css.match(/border-radius\s*:\s*\d+px/g)||[]).length;radiusLiterals+=r;
    for(const w of css.matchAll(/font-weight\s*:\s*(\d{3})|font\s*:\s*(\d{3})\s/g)){const k=w[1]||w[2];weights[k]=(weights[k]||0)+1}
    for(const fam of css.matchAll(/font-family\s*:\s*"([^"]+)"|--sk-font(?:-display|-latin)?\s*:\s*"([^"]+)"/g))families.add(fam[1]||fam[2]);
    for(const fr of css.matchAll(/:focus-visible\s*\{([^}]*)\}/g))focusRules.add(fr[1].replace(/\s+/g,''));
    importantCount+=(css.match(/!important/g)||[]).length;
    perFile[f]={colours:c,offGrid:g,radiusLiterals:r};
  }
  for(const f of JS){const js=read(f);const n=(js.match(/style="[^"]*(?:#[0-9a-f]{3,8}\b|rgba?\()/gi)||[]).length;inlineColours+=n;if(n)perFile[f]={inlineColours:n}}
  const heavy=(weights['900']||0)+(weights['650']||0);
  return {colours,offGrid,radiusLiterals,inlineColours,importantCount,heavyWeights:heavy,weightVariants:Object.keys(weights).length,focusVariants:focusRules.size,
    families:[...families].sort(),extraFamilies:[...families].filter(x=>!FAMILIES.includes(x)).length,perFile};
}
/* lower is better for every ratcheted metric */
export const RATCHET=['colours','offGrid','radiusLiterals','inlineColours','importantCount','heavyWeights','weightVariants','focusVariants'];
export function run({write=false,json=false}={}){
  const m=metrics(),file=path.join(root,'tools/fixtures/identity-baseline.json');
  const base=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
  const rows=RATCHET.map(k=>({metric:k,now:m[k],baseline:base?base[k]:null,worse:!!base&&m[k]>base[k]}));
  const worse=rows.filter(r=>r.worse);
  if(write||!base){const out={};for(const k of RATCHET)out[k]=m[k];out.recordedAt=new Date().toISOString().slice(0,10);fs.writeFileSync(file,JSON.stringify(out,null,1)+'\n')}
  if(json){fs.mkdirSync(path.join(root,'artifacts/identity'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/identity/report.json'),JSON.stringify({metrics:m,rows},null,1)+'\n')}
  return {metrics:m,rows,worse};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
  const r=run({write:process.argv.includes('--write-baseline'),json:process.argv.includes('--json')});
  console.log('| metric | now | baseline |\n|---|---|---|');
  for(const x of r.rows)console.log(`| ${x.metric} | ${x.now} | ${x.baseline==null?'—':x.baseline}${x.worse?' ⚠ worse':''} |`);
  console.log('families:',r.metrics.families.join(' · '));
  const top=Object.entries(r.metrics.perFile).filter(([,v])=>v.colours).sort((a,b)=>b[1].colours-a[1].colours).slice(0,6).map(([f,v])=>f+' '+v.colours).join(', ');
  console.log('most hard-coded colours:',top);
  if(r.worse.length){console.error('identity regression:',r.worse.map(x=>x.metric).join(', '));process.exit(1)}
}
