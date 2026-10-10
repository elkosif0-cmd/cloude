import {createRequire} from 'node:module';
import os from 'node:os';import path from 'node:path';
const require=createRequire(import.meta.url);
process.env.NODE_PATH=path.join(os.homedir(),'kosif-browser-check','node_modules');require('node:module').Module._initPaths();
const {chromium}=require('playwright-core');
const b=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8992/',{waitUntil:'domcontentloaded'});
 await p.click('#gate-list .gate[data-gate="accounting"]');
 await p.click('#sector-list .sector[data-sector="manufacturing"]');
 await p.click('#co-list .co[data-id="model-earth-industrial"]');
 await p.waitForSelector('.main',{timeout:30000}); await p.waitForFunction(()=>!!window.SK?.company?.current?.()&&!!window.SKosifSpace?.scopeSnapshot,null,{timeout:25000});
 for(const t of [0,1000,4000,9000]){
  if(t)await p.waitForTimeout(t);
  console.log('SCOPE',JSON.stringify(await p.evaluate(()=>{
   let snap=null;try{snap=SKosifSpace.scopeSnapshot()}catch(e){snap={error:String(e)}}
   const c=SK.company.current();
   const j=document.querySelector('#earth-goal-journey');
   return {company:c?.id,ownerScope:c?.ownerScope,gate:SK.gate.current(),settled:SK.demo?.settled?.(),busy:SKosifSpace?.busy?.(),scope:snap,
     addonTitle:!!j?.querySelector('.earth-addon-entry'),addonBusy:!!j?.querySelector('.earth-addon-entry [disabled]'),
     currentView:SKosifCore.view(),errorCount:SK.errors?.all?.()?.length};
  })));
 }
 console.log('PAGE_ERRORS',JSON.stringify(errors.slice(0,20)));
}finally{await b.close()}