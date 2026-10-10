// Synthetic isolated UI smoke, NOT full-application acceptance or server authorization.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright-core');
const base=process.argv[2]||'http://127.0.0.1:8944';
const evidence=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--no-sandbox']});
try{
 for(const viewport of [{width:1440,height:900,name:'desktop'},{width:390,height:844,name:'phone'}]){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},acceptDownloads:true,locale:'ar-SA',serviceWorkers:'block'});
  // Offline isolated component smoke: never exercise or claim health of production APIs.
  await context.route('https://kosif-audit-realtime.kosif199022.workers.dev/**',route=>route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:'{"status":"offline-test-only"}'}));
  await context.route('**/favicon.ico',route=>route.fulfill({status:200,contentType:'image/x-icon',body:''}));
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE: '+m.text())});page.on('requestfailed',r=>errors.push('NETWORK: '+r.url()+' '+r.failure()?.errorText));
  try{
   await page.goto(base+'/audit/markup.html',{waitUntil:'domcontentloaded'});
   try{await page.evaluate(async()=>{
     const host=document.createElement('main');document.body.appendChild(host);
     await (await import('/audit/mount.js')).mount(host,'council');
     window.__testCouncilHost=host;
   })}catch(error){console.error('MOUNT_FAILED',JSON.stringify(errors),String(error));throw error}
   const loc=(selector)=>page.locator('main').locator(selector);
   const buttons=page.locator('main').locator('#exportCouncilRoundsCsv, #exportCouncilRoundsJson');
   assert.equal(await buttons.count(),2);
   assert.equal(await loc('#exportCouncilRoundsCsv').isDisabled(),true);
   const initial={hiddenBeforeScope:await loc('#exportCouncilRoundsCsv').isDisabled()};
   await page.evaluate(async()=>{
     const {store}=await import('/audit/v5/continuous-store.js');
     const {createEngagement}=await import('/audit/v5/engagement-machine.js');
     const {renderCouncil}=await import('/audit/v5/continuous-council.js');
     const e=createEngagement({id:'ENG-UI-DEMO',entity:'Synthetic demo entity',companyId:'test-company',workspaceId:'test-workspace',createdAt:'2026-10-11T00:00:00Z'});
     e.documents.push({id:'DOC-1',sha256:'a'.repeat(64)});
     e.evidence.push({id:'EV-1',title:'Synthetic evidence',reviewStatus:'reviewed',documentIds:['DOC-1']});
     e.councilRounds.push({id:'RND-1',number:1,status:'completed',evidenceIds:['EV-1'],issueIds:[],
       positions:[{seatId:'rules',stance:'caution',statement:'=1+1'},{seatId:'other',stance:'objection',statement:'Synthetic objection'}]});
     store.engagement=e;renderCouncil();
   });
   assert.equal(await loc('#exportCouncilRoundsCsv').isDisabled(),false);
   await loc('#exportCouncilRoundsCsv').scrollIntoViewIfNeeded();
   const csvPromise=page.waitForEvent('download',{timeout:20000});
   await loc('#exportCouncilRoundsCsv').click();
   const csv=await csvPromise;
   const csvPath=path.join(process.env.TEMP||'.','kosif-council-'+viewport.name+'.csv');
   await csv.saveAs(csvPath);
   const content=fs.readFileSync(csvPath,'utf8');fs.unlinkSync(csvPath);
   assert.match(content,/test-company/);
   assert.match(content,/advisory/);
   assert.match(content,/"'=1\+1"/);
   const jsonPromise=page.waitForEvent('download',{timeout:20000});
   await loc('#exportCouncilRoundsJson').click();
   const json=await jsonPromise;
   const jsonPath=path.join(process.env.TEMP||'.','kosif-council-'+viewport.name+'.json');
   await json.saveAs(jsonPath);
   const payload=JSON.parse(fs.readFileSync(jsonPath,'utf8'));fs.unlinkSync(jsonPath);
   assert.equal(payload.scope.companyId,'test-company');
   assert.equal(payload.roundSummary.length,1);
   assert.equal(payload.humanApprovalVerified,false);
   assert.deepEqual(errors,[]);
   evidence.push({viewport:viewport.name,downloadCsv:true,downloadJson:true,scope:'test-company',initial,...{errors:errors.length}});
  }finally{await context.close()}
 }
}finally{await browser.close()}
console.log('COUNCIL_EXPORT_UI_E2E',JSON.stringify({passed:evidence.length*6,results:evidence,syntheticOnly:true}));
