/* KOSIF EARTH synthetic-only theme stress matrix.
 * Usage: node tools/earth_theme_matrix_20261010.mjs http://127.0.0.1:8992/
 */
import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
import {writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
process.env.NODE_PATH=[path.join(os.homedir(),'kosif-browser-check','node_modules'),process.env.NODE_PATH||''].filter(Boolean).join(path.delimiter);
require('node:module').Module._initPaths();
const {chromium}=require('playwright-core');
const url=process.argv[2]||'http://127.0.0.1:8992/';
const out=process.argv[3];
const sector=process.argv[4]||'meat';
const companyId=process.argv[5]||'demo-co';
const browser=await chromium.launch({headless:true,executablePath:process.env.KOSIF_EDGE||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--no-sandbox','--disable-webgl']});
const rows=[],failures=[],stages=[];
try{
for(const vp of [{name:'desktop',width:1440,height:960},{name:'phone',width:390,height:844},{name:'small-phone',width:320,height:740}]){
 const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce',serviceWorkers:'block',locale:'ar-SA'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#gate-list .gate[data-gate="accounting"]',{timeout:15000});
  await page.click('#gate-list .gate[data-gate="accounting"]');
  await page.waitForSelector('#sector-list .sector[data-sector="'+sector+'"]',{timeout:10000});
  await page.click('#sector-list .sector[data-sector="'+sector+'"]');
  await page.waitForSelector('#co-list .co[data-id="'+companyId+'"]',{timeout:15000});
  await page.click('#co-list .co[data-id="'+companyId+'"]');
  await page.waitForSelector('.main',{timeout:25000});
  const boot=await page.waitForFunction(()=>!!window.SKosifShell?.looks&&!!window.SK?.company?.current?.(),null,{timeout:25000}).then(()=>true,()=>false);
  if(!boot)throw Error('shell/company not initialized');
  const ready=await page.waitForFunction(()=>window.SK?.demo?.settled?.()===true&&!window.SKosifSpace?.busy?.(),null,{timeout:20000}).then(()=>true,()=>false);
  const scopeStatus=await page.evaluate(()=>window.SKosifSpace?.scopeSnapshot?.().status||'unavailable');
  if(!ready)failures.push({viewport:vp.name,phase:'demo-handoff-not-ready',scopeStatus});
  const before=await page.evaluate(()=>({company:SK.company.current()?.id,looks:SKosifShell.looks(),gate:SK.gate.current(),dir:document.documentElement.dir||document.body.dir}));
  stages.push({viewport:vp.name,entered:true,ready,scopeStatus,company:before.company,gate:before.gate,lookCount:before.looks.length,dir:before.dir});
  if(before.company!==companyId)throw Error('unexpected company: '+before.company);
  for(const look of before.looks){
   let row;
   try{
    row=await page.evaluate(id=>{
      SKosifShell.setLook(id);
      const root=document.documentElement,body=document.body,css=getComputedStyle(root);
      return {look:id,storedLook:SKosifShell.prefs().look,appliedLook:root.dataset.look||'',theme:root.dataset.theme||'',
        brand:root.dataset.brand||'',dir:root.dir||body.dir,
        overflow:Math.max(root.scrollWidth,body.scrollWidth)-innerWidth,
        reduceMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
        rail:css.getPropertyValue('--sk-rail').trim(),bg:css.getPropertyValue('--sk-bg').trim()};
    },look.id);
   }catch(e){row={look:look.id,error:String(e)}}
   row.viewport=vp.name;row.jsErrors=errors.slice();
   row.ok=!row.error&&row.storedLook===look.id&&row.overflow<=8&&!row.jsErrors.length&&row.reduceMotion===true;
   rows.push(row);
   if(!row.ok)failures.push(row);
  }
  const preserve=before.looks.find(x=>x.id==='navygold')||before.looks.find(x=>x.id==='graphite');
  if(preserve){
   await page.evaluate(id=>SKosifShell.setLook(id),preserve.id);
   await page.reload({waitUntil:'domcontentloaded'});
   const persisted=await page.waitForFunction(id=>window.SKosifShell?.prefs?.().look===id,preserve.id,{timeout:12000}).then(()=>true,()=>false);
   stages.push({viewport:vp.name,themeReload:preserve.id,persisted});
   if(!persisted)failures.push({viewport:vp.name,phase:'persist_after_reload',look:preserve.id});
  }
 }catch(e){failures.push({viewport:vp.name,phase:'setup',error:String(e),jsErrors:errors.slice(0,3)});stages.push({viewport:vp.name,error:String(e)})}
 await context.close();
}
}finally{await browser.close()}
const summary={total:rows.length,passed:rows.filter(x=>x.ok).length,failed:failures.length,viewports:3,stages,failures:failures.slice(0,100)};
console.log('EARTH_THEME_MATRIX_SUMMARY',JSON.stringify(summary));
if(out)writeFileSync(out,JSON.stringify({summary,rows},null,2),'utf8');
if(failures.length)process.exitCode=1;