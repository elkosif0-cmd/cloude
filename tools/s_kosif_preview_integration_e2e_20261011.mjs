import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright-core');
const base=process.argv[2]||'http://127.0.0.1:8956/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--no-sandbox']});
const done=[];
try{
 for(const v of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
  const c=await browser.newContext({viewport:{width:v.width,height:v.height},serviceWorkers:'block',reducedMotion:'reduce',locale:'ar-SA'});
  const p=await c.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await p.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response.status(),200);
   await p.waitForSelector('#gate-list .gate[data-gate="accounting"]',{timeout:30000});
   await p.locator('#gate-list .gate[data-gate="accounting"]').click();
   await p.locator('#sector-list .sector[data-sector="meat"]').click();
   await p.locator('#co-list .co[data-id="demo-co"]').click();
   await p.waitForFunction(()=>window.SK?.demo?.settled?.()===true&&!window.SKosifSpace?.busy?.(),null,{timeout:30000});
   await p.waitForFunction(()=>document.querySelector('#skn-q')!==null,{timeout:15000});
   assert.equal(await p.locator('#skn-q').count(),1);
   if(v.width>900){
     await p.evaluate(()=>window.SKosifShell.toggleRail(true));
     const miniWidth=await p.locator('#rail').evaluate(el=>el.getBoundingClientRect().width);
     assert.ok(miniWidth>=60&&miniWidth<100,'compact rail should reclaim width: '+miniWidth);
     await p.evaluate(()=>window.SKosifShell.toggleRail(false));
   }
   await p.evaluate(()=>{
     if(document.documentElement.dataset.rail==='mini')window.SKosifShell?.toggleRail(false);
     const rail=document.querySelector('#rail');
     if(rail&&(getComputedStyle(rail).visibility==='hidden'||rail.getAttribute('aria-hidden')==='true'))window.SKosifShell?.toggleSidebar();
   });
   const isVisible=await p.locator('#skn-q').isVisible();
   assert.equal(isVisible,true,'search input not accessible');
   await p.locator('#skn-q').fill('الضريبة');
   const found=await p.evaluate(()=>({
     results:[...document.querySelectorAll('#nav .nav-btn:not([hidden])')].filter(x=>getComputedStyle(x).display!=='none').length,
     status:document.querySelector('#skn-search-status')?.textContent,
     hidden:document.querySelector('#skn-search-status')?.hidden
   }));
   assert.equal(found.hidden,false);
   assert.ok(found.status?.length>0);
   await p.locator('#skn-q').press('Enter');
   await p.waitForTimeout(200);
   assert.equal(await p.locator('#skn-q').inputValue(),'');
   const where=await p.evaluate(()=>({view:window.SKosifCore?.view?.(),company:window.SK?.company?.current?.()?.id,goalCount:document.querySelectorAll('#earth-goal-journey').length}));
   assert.equal(where.company,'demo-co');
   assert.equal(errors.length,0,errors.join(' | '));
   done.push({viewport:v.name,found,view:where.view,company:where.company,pageErrors:errors.length});
  }finally{await c.close()}
 }
}finally{await browser.close()}
console.log('S_KOSIF_PREVIEW_MERGED_E2E',JSON.stringify({checks:done.length*7,passed:done.length*7,results:done}));
