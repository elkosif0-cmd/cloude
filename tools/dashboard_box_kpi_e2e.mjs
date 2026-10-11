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
 const companyName='شركة الاختبارات الاصطناعية';seed.skosif_companies_v1.companies[0].name=companyName;
 for(const user of Object.values(seed.sqc_helper_users_v1.users))for(const space of Object.values(user.spaces))space.name=companyName;
 for(const space of Object.values(seed.sqc_helper_space_v1.spaces))space.name=companyName;
  seed['aghnam-pricing-v3']=pricing(rawLoss);
  const origin=new URL(url).origin;
  await context.route('**/*',r=>{const u=r.request().url();return u.startsWith('http://127.0.0.1:8765/')||u.startsWith('https://fonts.googleapis.com/')||u.startsWith('https://fonts.gstatic.com/')||u.startsWith('data:')||u.startsWith('blob:')?r.continue():r.abort();});
  await context.addInitScript(({seed,origin})=>{
  // A context init script also runs in every preview/print iframe. Seed only
  // the first real app document; frame creation and reload must never rewrite it.
  if(window!==window.top||location.origin!==origin||sessionStorage.getItem('sqc_mercury_seeded_v1'))return;
  for(const[k,v]of Object.entries(seed))localStorage.setItem(k,JSON.stringify(v));
  localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}));
  localStorage.setItem('skosif_role_mode',JSON.stringify('admin'));
  sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');
  sessionStorage.setItem('sqc_mercury_seeded_v1','1');
 },{seed,origin});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>{const s=window.SKosifSpace?.scopeSnapshot?.();return window.SKosifCore&&window.SKosifReportPack&&window.SKosifMetrics&&window.SK?.company?.ready?.()&&s?.status==='stable'&&window.SK.org().biz===s.context.entityName});
   const identity=await page.evaluate(()=>({scope:window.SKosifSpace.scopeSnapshot(),company:window.SK.company.current(),biz:window.SK.org().biz}));
   assert.equal(identity.company.id,identity.scope.entityId);assert.equal(identity.biz,identity.scope.context.entityName);assert.equal(identity.company.period.id,identity.scope.periodId);assert.equal(identity.company.period.companyId,identity.company.id);
   const stats=await page.evaluate(()=>window.SKosifCore.stats());
   assert.deepEqual({boxes:stats.boxes,on:stats.boxOnTarget,boxLoss:stats.boxLoss,allLoss:stats.loss},{boxes:3,on:1,boxLoss:1,allLoss:rawLoss?2:1});
   await page.evaluate(()=>window.SKosifCore.go('dash'));
   const tile=page.locator('.skk4-t').filter({hasText:'بوكسات ضمن الهدف'});await tile.waitFor();
   assert.equal((await tile.locator('b').innerText()).trim(),'1');assert.match(await tile.innerText(),/من أصل 3 · 1 بخسارة/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${out}/${name}-dashboard.png`,fullPage:true});
   await page.evaluate(()=>window.SKosifCore.go('execreports'));
   await page.locator('[data-rp-period]').waitFor();assert.equal(await page.locator('.rp .sk-kpis').count(),0,'Executive controls must not present global KPI as captured facts');
   await page.locator('[data-rp="print"]').click();const frame=page.frameLocator('.skout-f');await frame.locator('.rp-cover').waitFor();
   assert.equal(await frame.locator('.rp-k>div').filter({hasText:'بوكسات بخسارة'}).count(),0);assert.match(await frame.locator('h1').innerText(),/مسودة تنفيذية محدودة/);assert.match(await frame.locator('[data-rp-unavailable]').first().innerText(),/غير متاح/);
   await page.screenshot({path:`${out}/${name}-preview.png`,fullPage:true});await page.locator('[data-o="close"]').click();
   assert.deepEqual(errors,[]);results.push({name,status:'pass',stats});
   }catch(e){
   const state=await page.evaluate(()=>({scope:window.SKosifSpace?.scopeSnapshot?.(),company:window.SK?.company?.current?.(),business:window.SK?.org?.().biz,previewCount:document.querySelectorAll('.skout').length,notices:[...document.querySelectorAll('.toast,.sk-toast,[role="alert"]')].map(n=>n.textContent.trim()).slice(-8)})).catch(err=>({unavailable:err.message}));
   console.error('KPI_SCOPE_FAILURE_DIAGNOSTICS',name,JSON.stringify({error:e.message,state}));
   fs.writeFileSync(`${out}/${name}-failure-context.json`,JSON.stringify({error:e.message,state},null,2));await page.screenshot({path:`${out}/${name}-failure.png`,fullPage:true}).catch(()=>{});
   results.push({name,status:'fail',error:e.stack});console.error(name,e.stack);
  }
  finally{await context.close();}
 }
}finally{await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify({head:process.env.SQC_TESTED_SHA,sources,results,syntheticOnly:true},null,2));}
assert.equal(results.filter(x=>x.status==='fail').length,0);
