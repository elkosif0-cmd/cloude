// CI-only: exercise the real pricing engine, dashboard and report against synthetic data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {managementBrowserSeed} from './management_report_fixtures.mjs';
assert.equal(process.env.GITHUB_ACTIONS,'true');
assert.match(process.env.SQC_TESTED_SHA||'',/^[a-f0-9]{40}$/);
const {chromium}=createRequire(import.meta.url)('playwright');
const url='http://127.0.0.1:8765/app-safe.html',out='artifacts/mercury/kpi';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true}),results=[];
const sources=Object.fromEntries(['ui/features/command-center.js','ui/features/report-pack.js',...fs.readdirSync('payload').filter(x=>/^index.html.gz.b64.part/.test(x)).sort().map(x=>'payload/'+x)].map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
function pricing(rawLoss){
 const raw=(id,price)=>({id,name:'Synthetic '+id,kind:'raw',status:'active',buy:100,vat:'none',waste:0,price});
 const box=(id,price,status='active')=>({id,name:'Synthetic '+id,status,price,dishes:0,dishCost:0,comps:[{t:'raw',id:'r1',q:1}],ohs:[]});
 return {v:4,settings:{vat:0,target:25,excellent:25,good:15,base:'gross',waste:'yield',sv:4,biz:'Synthetic KPI'},raws:[raw('r1',200),raw('r2',rawLoss?90:200)],boxes:[box('b1',200),box('b2',120),box('b3',90),box('archived',10,'archived')],exps:[],memos:[],memo:{items:[],rows:[],notes:[]},log:[],snaps:[],meta:{source:'synthetic'}};
}
try{
 for(const width of [320,390,1280])for(const rawLoss of [false,true]){
  const name=`${width}-raw-loss-${rawLoss}`,context=await browser.newContext({viewport:{width,height:1000},locale:'ar-SA',reducedMotion:'reduce'}),seed=managementBrowserSeed();
  seed['aghnam-pricing-v3']=pricing(rawLoss);
  await context.route('**/*',r=>{const u=r.request().url();return u.startsWith('http://127.0.0.1:8765/')||u.startsWith('https://fonts.googleapis.com/')||u.startsWith('https://fonts.gstatic.com/')||u.startsWith('data:')||u.startsWith('blob:')?r.continue():r.abort();});
  await context.addInitScript(seed=>{for(const[k,v]of Object.entries(seed))localStorage.setItem(k,JSON.stringify(v));localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}));localStorage.setItem('skosif_role_mode',JSON.stringify('admin'));sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');},seed);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.SKosifCore&&window.SKosifReportPack&&window.SKosifMetrics);
   const stats=await page.evaluate(()=>window.SKosifCore.stats());
   assert.deepEqual({boxes:stats.boxes,on:stats.boxOnTarget,boxLoss:stats.boxLoss,allLoss:stats.loss},{boxes:3,on:1,boxLoss:1,allLoss:rawLoss?2:1});
   await page.evaluate(()=>window.SKosifCore.go('dash'));
   const tile=page.locator('.skk4-t').filter({hasText:'بوكسات ضمن الهدف'});await tile.waitFor();
   assert.equal((await tile.locator('b').innerText()).trim(),'1');assert.match(await tile.innerText(),/من أصل 3 · 1 بخسارة/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${out}/${name}-dashboard.png`,fullPage:true});
   await page.evaluate(()=>window.SKosifCore.go('execreports'));
   const reportTile=page.locator('.sk-kpis>div').filter({hasText:'بوكسات بخسارة'});await reportTile.waitFor();assert.equal((await reportTile.locator('b').innerText()).trim(),'1');
   await page.locator('[data-rp="print"]').click();const frame=page.frameLocator('.skout-f');await frame.locator('.rp-cover').waitFor();
   assert.equal((await frame.locator('.rp-k>div').filter({hasText:'بوكسات بخسارة'}).locator('b').innerText()).trim(),'1');
   await page.screenshot({path:`${out}/${name}-preview.png`,fullPage:true});await page.locator('[data-o="close"]').click();
   assert.deepEqual(errors,[]);results.push({name,status:'pass',stats});
  }catch(e){results.push({name,status:'fail',error:e.stack});console.error(name,e.stack);}
  finally{await context.close();}
 }
}finally{await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify({head:process.env.SQC_TESTED_SHA,sources,results,syntheticOnly:true},null,2));}
assert.equal(results.filter(x=>x.status==='fail').length,0);
