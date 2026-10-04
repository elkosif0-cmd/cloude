// CI-only, synthetic before/after visual and export acceptance. Never run against production.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {managementBrowserSeed} from './management_report_fixtures.mjs';
import {fixture} from './mercury-report-harness.mjs';
assert.equal(process.env.GITHUB_ACTIONS,'true','This browser harness runs only in isolated GitHub Actions');
assert.match(process.env.SQC_TESTED_SHA||'',/^[a-f0-9]{40}$/);
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const urls={baseline:'http://127.0.0.1:8766/app-safe.html',candidate:'http://127.0.0.1:8765/app-safe.html'};
const out='artifacts/mercury',results=[],failures=[];fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sources=Object.fromEntries(['ui/ds/sqc.css','ui/features/report-pack.js','ui/core/output.js','build.py'].map(p=>[p,hash(p)]));
async function check(name,fn){try{await fn();results.push({name,status:'pass'});}catch(e){failures.push(name);results.push({name,status:'fail',error:e.stack});console.error(name,e.stack);}fs.writeFileSync(`${out}/results.json`,JSON.stringify({head:process.env.SQC_TESTED_SHA,sources,results,failures},null,2));}
async function open(role,kind='populated',width=1280){
 const data=fixture(kind),seed=managementBrowserSeed();
 if(kind==='long'){data.findings=Array.from({length:120},(_,i)=>({ref:'FROW'+String(i+1).padStart(4,'0'),title:'ملاحظة تجريبية مطولة لاختبار استمرار الجدول',detail:'تفاصيل عربية تجريبية للمراجعة والقراءة عبر صفحات متعددة',area:'اختبار',severity:'high',status:'open',owner:'اختبار'}));data.stores.skosif_tasks_v1=Array.from({length:80},(_,i)=>({title:'مهمة تجريبية TROW'+String(i+1).padStart(4,'0'),due:'2020-01-01',priority:'high',done:false}));}
 if(kind==='empty')seed.skosif_ledger_v1={accounts:[],entries:[]};
 for(const [k,v] of Object.entries(data.stores))if(k!=='skosif_companies_v1')seed[k]=v;
 const context=await browser.newContext({viewport:{width,height:1000},locale:'ar-SA',acceptDownloads:true,reducedMotion:'reduce'});
 const origin=new URL(urls[role]).origin;
 await context.route('**/*',r=>{const u=r.request().url();const publicFont=u.startsWith('https://fonts.googleapis.com/')||u.startsWith('https://fonts.gstatic.com/');return u.startsWith(origin+'/')||publicFont||u.startsWith('data:')||u.startsWith('blob:')?r.continue():r.abort();});
 await context.addInitScript(seed=>{for(const[k,v]of Object.entries(seed))localStorage.setItem(k,JSON.stringify(v));localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}));localStorage.setItem('skosif_role_mode',JSON.stringify('admin'));sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');},seed);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(urls[role],{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.SKosifReportPack&&window.SKosifShell&&window.SKosifMetrics);
 await page.evaluate(data=>{
  window.SKosifShell.setPref('look','kosif');
  document.documentElement.dataset.theme='light';
  const old=window.SKosifCore;
  window.SKosifCore={...old,stats:()=>({...old.stats(),...data.stats})};
  window.SKosifMetrics=Object.freeze({...window.SKosifMetrics,
   trend:async()=>structuredClone(data.trend),
   risks:()=>({risks:structuredClone(data.risks),findings:structuredClone(data.findings)}),
   decisions:()=>structuredClone(data.decisions)});
 },data);
 if(kind==='empty')assert.deepEqual(await page.evaluate(()=>({accounts:window.SKosifLedger.snapshot().accounts.length,entries:window.SKosifLedger.snapshot().entries.length})),{accounts:0,entries:0});
 const build=await page.locator('meta[name="sqc-build"]').getAttribute('content');
 assert.match(build,/^[a-f0-9]{10}$/);return{context,page,errors,build};
}
async function report(page,expectPlex=true){
 await page.evaluate(()=>window.SKosifCore.go('execreports'));
 await page.locator('[data-rp="print"]').click();
 await page.frameLocator('.skout-f').locator('.rp-cover').waitFor();
 const frame=await page.locator('.skout-f').elementHandle().then(h=>h.contentFrame());
 if(expectPlex){const fontState=await frame.evaluate(async()=>{await document.fonts.ready;const samples=await Promise.all(['مراجعة','0123456789'].map(text=>document.fonts.load('400 14px \"IBM Plex Sans Arabic\"',text)));return{family:getComputedStyle(document.body).fontFamily,loaded:samples.map(f=>f.length>0&&f.every(x=>x.status==='loaded'))};});
 assert.ok(fontState.family.includes('IBM Plex Sans Arabic'),JSON.stringify(fontState));assert.deepEqual(fontState.loaded,[true,true],'Actual Arabic and numeric report fonts must load');}else await frame.evaluate(()=>document.fonts.ready);
 return frame;
}
function workbook(path){
 const r=spawnSync('python3',['-c',`import json,sys,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]); ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ss=[]
if 'xl/sharedStrings.xml' in z.namelist():
 ss=[''.join(e.itertext()) for e in E.fromstring(z.read('xl/sharedStrings.xml'))]
out=[]
for p in sorted(x for x in z.namelist() if x.startswith('xl/worksheets/sheet') and x.endswith('.xml')):
 rows=[]
 for r in E.fromstring(z.read(p)).findall('.//s:row',ns):
  row=[]
  for c in r.findall('s:c',ns):
   t=c.get('t');v=c.find('s:v',ns);text=v.text if v is not None else ''
   if t=='s':text=ss[int(text)]
   if t=='inlineStr':text=''.join(c.find('s:is',ns).itertext())
   row.append([c.get('r'),t,text])
  rows.append(row)
 out.append(rows)
print(json.dumps(out,ensure_ascii=False))`,path],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}
try{
 for(const kind of ['populated','empty','large','long'])await check(`actual baseline/candidate report and download parity: ${kind}`,async()=>{
  const captured={};
  for(const role of ['baseline','candidate']){
   const {context,page,errors,build}=await open(role,kind);
   try{
    const frame=await report(page),tables=await frame.evaluate(()=>[...document.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g,' ').trim()))));
    assert.ok(tables.length>0,'Report tables missing');const sections=await frame.locator('section').evaluateAll(nodes=>nodes.map(n=>n.textContent.replace(/\s+/g,' ').trim()));
    const tiles=await frame.locator('.rp-k>div').evaluateAll(nodes=>nodes.map(n=>({label:n.querySelector('span')?.textContent.trim(),value:n.querySelector('b')?.textContent.trim()})));
    captured[role]={build,tables,sections,tiles,exports:{}};
    if(role==='candidate')assert.equal(await frame.locator('body.rp-paper').count(),1);
    for(const format of ['html','word','excel']){
     const [download]=await Promise.all([page.waitForEvent('download'),page.locator(`[data-o="${format}"]`).click()]);
     const ext={html:'html',word:'doc',excel:'xlsx'}[format],path=`${out}/${role}-${kind}.${ext}`;await download.saveAs(path);
     if(format==='excel')captured[role].exports[format]=workbook(path);
     else{
      const p=await context.newPage();await p.setContent(fs.readFileSync(path,'utf8'));
      captured[role].exports[format]=await p.evaluate(()=>[...document.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g,' ').trim()))));
      assert.deepEqual(captured[role].exports[format],tables,format+' lost table data');await p.close();
     }
    }
    await page.screenshot({path:`${out}/${role}-${kind}-preview.png`,fullPage:true});
    if(role==='candidate'){
     const p=await context.newPage();await p.setContent(await frame.content(),{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.emulateMedia({media:'print'});
     const pdf=`${out}/${kind}-A4.pdf`;await p.pdf({path:pdf,preferCSSPageSize:true,printBackground:false});
     const info=spawnSync('pdfinfo',[pdf],{encoding:'utf8'});assert.equal(info.status,0,info.stderr);fs.writeFileSync(`${out}/${kind}-pdfinfo.txt`,info.stdout);assert.match(info.stdout,/\(A4\)/);
     const fonts=spawnSync('pdffonts',[pdf],{encoding:'utf8'});assert.equal(fonts.status,0);fs.writeFileSync(`${out}/${kind}-pdffonts.txt`,fonts.stdout);assert.match(fonts.stdout,/PlexSansArabic/i,'PDF must embed the intended Arabic font');
     const text=spawnSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8'});assert.equal(text.status,0);fs.writeFileSync(`${out}/${kind}-pdf-text.txt`,text.stdout);
     if(kind==='long'){
      const clean=text.stdout.replace(/[\u200e\u200f\u202a-\u202e]/g,'');
      for(const[prefix,count]of[['FROW',120],['TROW',80]])for(let i=1;i<=count;i++){const marker=prefix+String(i).padStart(4,'0');assert.equal((clean.match(new RegExp(marker,'g'))||[]).length,1,'PDF missing/duplicating '+marker);}
      const pages=clean.split('\f');assert.ok(pages.filter(p=>p.trim()).length>=4,'Long fixture must span multiple pages');
      for(const pageText of pages){if(pageText.includes('FROW'))assert.ok(pageText.includes('الرقم')||pageText.includes('مقرلا'),'Finding continuation page must repeat header');if(pageText.includes('TROW'))assert.ok(pageText.includes('المهمة')||pageText.includes('ةمهملا'),'Task continuation page must repeat header');}
     }
     const image=spawnSync('pdftoppm',['-png','-scale-to','1200',pdf,`${out}/${kind}-page`],{encoding:'utf8'});assert.equal(image.status,0,image.stderr);await p.close();
    }
    await page.locator('[data-o="close"]').click();await page.locator('.skout').waitFor({state:'detached'});
    await report(page);await page.keyboard.press('Escape');await page.locator('.skout').waitFor({state:'detached'});
    assert.deepEqual(errors,[],'Runtime error');
   }finally{await context.close();}
  }
  assert.deepEqual(captured.candidate.tables,captured.baseline.tables,'Visible values changed');
  assert.deepEqual(captured.candidate.sections,captured.baseline.sections,'Section text or non-table amounts changed');
  assert.deepEqual(captured.candidate.tiles,captured.baseline.tiles,'Summary/books/task KPI changed');
  assert.deepEqual(captured.candidate.exports,captured.baseline.exports,'Native exported values/types changed');
  fs.writeFileSync(`${out}/${kind}-parity.json`,JSON.stringify(captured,null,2));
 });
 for(const width of [320,390,768,1180,1440])await check(`candidate responsive layout ${width}`,async()=>{
  const{context,page}=await open('candidate','large',width);
  try{for(const view of ['dash','execreports']){
   await page.evaluate(v=>window.SKosifCore.go(v),view);await page.locator(view==='dash'?'.skc-luxe':'.rp').waitFor();
   await page.screenshot({path:`${out}/${view}-${width}.png`,fullPage:true});
   const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,animations:[...document.querySelectorAll('.skc-luxe .skc-card,.rp-hero')].map(n=>getComputedStyle(n).animationName)}));
   assert.ok(geometry.scroll<=width+2,JSON.stringify(geometry));assert.ok(geometry.animations.every(x=>x==='none'),'Reduced motion');
   if(view==='dash')assert.deepEqual(await page.locator('.skk4-t').evaluateAll(cards=>cards.flatMap(c=>{const t=c.querySelector('.tx'),r=c.querySelector('.skr');if(!t||!r)return[];const a=t.getBoundingClientRect(),b=r.getBoundingClientRect();return Math.max(a.left,b.left)<Math.min(a.right,b.right)&&Math.max(a.top,b.top)<Math.min(a.bottom,b.bottom)?[c.textContent]:[]})),[],'KPI overlap');
   await page.screenshot({path:`${out}/${view}-${width}.png`,fullPage:true});
  }}finally{await context.close();}
 });
 await check('alternate look and dark remain outside calm scope',async()=>{const{context,page}=await open('candidate');try{for(const look of ['kosif-night','audit']){await page.evaluate(l=>window.SKosifShell.setPref('look',l),look);const f=await report(page,look==='kosif-night');assert.equal(await f.locator('body.rp-paper').count(),0);await page.screenshot({path:`${out}/${look}.png`,fullPage:true});await page.locator('[data-o="close"]').click();}}finally{await context.close();}});
}finally{
 await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify({head:process.env.SQC_TESTED_SHA,sources,results,failures,limits:['Synthetic contexts; no business data','Every PDF page requires visual adjudication','No native Word/Excel application rendering or physical device claim','Known readiness-source gaps remain outside this presentation change','Report fonts use existing online Google Fonts dependency; offline availability not asserted']},null,2));
}
if(failures.length)process.exitCode=1;
