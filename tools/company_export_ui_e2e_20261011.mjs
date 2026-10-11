import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright-core');
const base=process.argv[2]||'http://127.0.0.1:8945/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
try{
 for(const shape of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
  const context=await browser.newContext({viewport:shape,acceptDownloads:true,serviceWorkers:'block',locale:'ar-SA'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.locator('#gate-list .gate[data-gate="accounting"]').click();
   await page.locator('#sector-list .sector[data-sector="meat"]').click();
   await page.locator('#co-list .co[data-id="demo-co"]').click();
   await page.waitForFunction(()=>window.SK?.demo?.settled?.()===true&&!window.SKosifSpace?.busy?.(),null,{timeout:30000});
   await page.evaluate(()=>SKosifCore.go('exports'));
   await page.waitForFunction(()=>{
     if(window.SKosifCore?.view?.()!=='exports')return false;
     const enabled=window.SKosifCompanyPlatform?.capEnabled?.('exports');
     return enabled===false?!!document.querySelector('[data-skcap-on="exports"]'):
       enabled===true&&!!document.querySelector('[data-x="all"]')?.getClientRects().length;
   },null,{timeout:18000});
   const needsActivation=await page.evaluate(()=>!window.SKosifCompanyPlatform?.capEnabled?.('exports'));
   if(needsActivation){
     await page.locator('[data-skcap-on="exports"]').click();
     await page.waitForFunction(()=>window.SKosifCompanyPlatform?.capEnabled?.('exports')===true,null,{timeout:12000});
   }
   await page.locator('[data-x="all"]').waitFor({state:'visible',timeout:12000});
   assert.equal(await page.locator('[data-x="all"]').isVisible(),true);
   await page.evaluate(()=>localStorage.setItem('skosif_extra_company_canary','FOREIGN_COMPANY_MARKER'));
   const labels=await page.locator('[data-x="all"]').evaluate(button=>button.closest('.card')?.innerText||'');
   assert.match(labels,/تصدير بيانات الشركة المؤكدة فقط/);
   assert.match(labels,/بانتظار تحقق ملكية بيانات الشركة/);
   assert.equal(await page.locator('[data-x="manual-sales"]').count(),0);
   const task=page.waitForEvent('download',{timeout:20000});
   await page.locator('[data-x="all"]').click();
   const download=await task;
   const filename=download.suggestedFilename();
   const save=await download.path();
   const fs=await import('node:fs/promises');
   const body=JSON.parse(await fs.readFile(save,'utf8'));
   assert.equal(body.format,'kosif-company-scoped-local-export');
   assert.equal(body.scope.companyId,'demo-co');
   assert.equal(body.restorable,false);
   assert.deepEqual(Object.keys(body.stores).sort(),['customers','orders','sales_lines']);
   assert.doesNotMatch(JSON.stringify(body),/FOREIGN_COMPANY_MARKER/);
   const previewFile=page.locator('#sk-restore-preview-file');
   const previewButton=page.locator('[data-x="restore-preview"]');
   assert.equal(await previewFile.isVisible(),true);
   const supply=async content=>previewFile.setInputFiles({
      name:'company-test-preview.json',mimeType:'application/json',
      buffer:Buffer.from(JSON.stringify(content),'utf8')
   });
   await supply(body);
   await previewButton.click();
   await page.waitForFunction(()=>/نتيجة فحص|تم رفض المعاينة/.test(
      document.querySelector('#sk-restore-preview-status')?.textContent||''),null,{timeout:18000});
   const approvedMessage=await page.locator('#sk-restore-preview-status').textContent();
   assert.match(approvedMessage,/نتيجة فحص للقراءة فقط/);
   const different={...body,scope:{companyId:'foreign-company'}};
   await supply(different);
   await previewButton.click();
   await page.waitForFunction(()=>/RESTORE_PREVIEW_CROSS_COMPANY_MANIFEST/.test(
      document.querySelector('#sk-restore-preview-status')?.textContent||''),null,{timeout:18000});
   assert.match(await page.locator('#sk-restore-preview-status').textContent(),/تم رفض المعاينة/);
   assert.equal(await page.locator('[data-x="restore"]').count(),0);
   assert.deepEqual(errors,[]);
   results.push({viewport:shape.name,download:filename,company:body.scope.companyId,stores:Object.keys(body.stores),errors:errors.length});
  }finally{await context.close()}
 }
}finally{await browser.close()}
console.log('COMPANY_EXPORT_UI_E2E',JSON.stringify({passed:results.length*13,results,synthetic:true,serverAuthorizationTested:false}));
