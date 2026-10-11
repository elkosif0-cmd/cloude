import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
try {
 for(const viewport of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  try{
   const response=await page.goto('http://127.0.0.1:8953/',{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response.status(),200);
   await page.waitForSelector('#gate-list .gate',{timeout:30000});
   if(await page.locator('#kosif-earth-skip').isVisible())await page.locator('#kosif-earth-skip').click();
   await page.waitForFunction(()=>document.querySelector('#gates')&&!document.querySelector('#gates').hidden,{timeout:20000});
   const data=await page.evaluate(()=>{
     const b=getComputedStyle(document.body),v=getComputedStyle(document.querySelector('.visual'));
     return {background:b.backgroundImage,visual:v.backgroundImage,width:document.documentElement.scrollWidth,client:innerWidth,
       css:[...document.styleSheets].map(s=>s.href).filter(Boolean),
       steps:document.querySelector('.earth-door-steps')?.textContent?.trim(),
       gates:document.querySelectorAll('#gate-list .gate').length};
   });
   assert.match(data.background,/earth-office-sunlit-/);
   assert.match(data.visual,/earth-office-sunlit-/);
   assert(data.css.some(x=>x.includes('/earth-office-door.css')));
   assert.match(data.steps,/هدفك.*الخطوات.*النتيجة/s);
   assert(data.gates>=3);
   assert(data.width<=data.client+2,'horizontal overflow on '+viewport.name+': '+data.width+'/'+data.client);
   assert.equal(errors.length,0,errors.join(' | '));
   const asset=await page.request.get('http://127.0.0.1:8953/art/brand/'+(viewport.name==='phone'?'earth-office-sunlit-mobile.webp':'earth-office-sunlit-4k.webp'));
   assert.equal(asset.status(),200);
   results.push({viewport:viewport.name,gates:data.gates,overflow:false,style:true,asset:true,pageErrors:errors.length,previewOnly:true});
  } finally {await context.close();}
 }
}finally{await browser.close();}
console.log('SAFE_MAIN_DOOR_SMOKE',JSON.stringify({passed:results.length*9,results}));
