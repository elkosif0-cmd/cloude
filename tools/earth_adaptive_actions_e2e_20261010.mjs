/* Synthetic-only Edge desktop/phone acceptance for adaptive KOSIF EARTH actions. */
import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
const require=createRequire(import.meta.url);
process.env.NODE_PATH=path.join(os.homedir(),'kosif-browser-check','node_modules');
require('node:module').Module._initPaths();
const {chromium}=require('playwright-core');
const url=process.argv[2]||'http://127.0.0.1:8996/';
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--no-sandbox']});
const results=[];
try{
 for(const vp of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce',serviceWorkers:'block',locale:'ar-SA'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.click('#gate-list .gate[data-gate="accounting"]');
   await page.click('#sector-list .sector[data-sector="meat"]');
   await page.click('#co-list .co[data-id="demo-co"]');
   await page.waitForSelector('.main',{timeout:25000});
   await page.waitForFunction(()=>window.SK?.demo?.settled?.()===true&&!window.SKosifSpace?.busy?.(),null,{timeout:25000});
   await page.evaluate(()=>SKosifCore.go('inventory'));
   await page.waitForFunction(()=>window.SKosifCore?.view?.()==='inventory'&&!!document.querySelector('#earth-adaptive-actions'),null,{timeout:12000});
   const initial=await page.evaluate(()=>{
     const ui=window.KOSIFEarthIntelligentUI,p=ui.plan(),dom=document.querySelector('#earth-adaptive-actions');
     return {company:SK.company.current()?.id,gate:p.gate,view:p.view,ready:p.ready,
       suggestions:p.candidates.map(x=>x.id),hasDisclosure:!!dom,dir:dom?.querySelector('.earth-adaptive__contents')?.dir,
       overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
       reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
   });
   const checks={company:initial.company==='demo-co',gate:initial.gate==='accounting',
     ready:initial.ready===true,visible:initial.hasDisclosure,rtl:initial.dir==='rtl',
     responsive:initial.overflow<=8,reducedMotion:initial.reducedMotion,
     noJsErrors:errors.length===0};
   if(initial.suggestions.length){
     await page.locator('#earth-adaptive-actions summary').click();
     await page.locator('#earth-adaptive-actions .earth-adaptive__action').first().click();
     checks.sameCompany=await page.evaluate(()=>SK.company.current()?.id==='demo-co');
     checks.sameGate=await page.evaluate(()=>SK.gate.current()==='accounting');
     checks.navigation=await page.evaluate(()=>SKosifCore.view()!=='inventory');
   }
   results.push({viewport:vp.name,checks,initial,errors:errors.slice(0,4)});
  }catch(e){results.push({viewport:vp.name,error:String(e),errors:errors.slice(0,4)})}
  await ctx.close();
 }
}finally{await browser.close()}
const failed=results.flatMap(x=>x.error?[x.viewport+':'+x.error]:Object.entries(x.checks).filter(([,v])=>!v).map(([k])=>x.viewport+':'+k));
console.log('EARTH_ADAPTIVE_E2E',JSON.stringify({passed:results.reduce((n,x)=>n+Object.values(x.checks||{}).filter(Boolean).length,0),failed,results}));
if(failed.length)process.exitCode=1;
