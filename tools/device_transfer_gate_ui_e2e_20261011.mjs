import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright-core');
const base=process.argv[2]||'http://127.0.0.1:8945/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const data=[];
try{
 for(const viewport of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
  const context=await browser.newContext({viewport,acceptDownloads:true,serviceWorkers:'block',locale:'ar-SA',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],downloads=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('download',item=>downloads.push(item.suggestedFilename()));
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}'});
   await page.locator('#gate-list .gate[data-gate="accounting"]').click();
   await page.locator('#sector-list .sector[data-sector="meat"]').click();
   await page.locator('#co-list .co[data-id="demo-co"]').click();
   await page.waitForFunction(()=>window.SK?.demo?.settled?.()===true&&!window.SKosifSpace?.busy?.(),null,{timeout:30000});
   await page.evaluate(()=>SKosifCore.go('devices'));
   await page.locator('#dv-transfer-locked').waitFor({state:'visible',timeout:18000});
   assert.equal(await page.locator('#dv-transfer-locked').isVisible(),true);
   assert.equal(await page.locator('[data-dv="send"]').count(),0);
   assert.equal(await page.locator('[data-dv="open"]').count(),0);
   const notice=await page.locator('#dv-transfer-locked').innerText();
   assert.match(notice,/موقوفان مؤقتًا/);
   // A synthetic event targeting a tampered DOM node must not reach file export.
   await page.evaluate(()=>{
     const fake=document.createElement('button');
     fake.dataset.dv='send';
     fake.id='dv-test-injected-send';
     document.querySelector('.dv').appendChild(fake);
     fake.click();
   });
   await page.waitForTimeout(120);
   assert.deepEqual(downloads,[]);
   assert.deepEqual(errors,[]);
   data.push({viewport:viewport.name,blocked:true,sendButtons:0,receiveButtons:0,injectedDownloadCount:downloads.length,errors:errors.length});
  }finally{await context.close()}
 }
}finally{await browser.close()}
console.log('DEVICE_TRANSFER_GATE_UI_E2E',JSON.stringify({pass:data.length*6,results:data,liveBackendTested:false}));
