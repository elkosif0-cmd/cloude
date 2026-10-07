// Isolated preview only: public Amazon model, no customer data or external requests.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const url=process.argv[2]||'http://127.0.0.1:8766/';
assert.ok(['127.0.0.1','localhost'].includes(new URL(url).hostname),'Local preview only');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
try{
 for(const viewport of [{width:1365,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,locale:'ar-SA',reducedMotion:'reduce'});
  const origin=new URL(url).origin;
  await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('[data-gate="audit"]').click();
  for(const q of ['أمازون','Amazon']){await page.locator('#corpus-q').fill(q);assert.equal(await page.locator('.corpus-co').count(),2)}
  await page.locator('[data-corpus="amazon-2024"]').click();
  await page.waitForFunction(()=>window.SKosifTBReview&&window.SK&&SKosifTBReview.rows()?.mappingUnsupported);
  await page.waitForFunction(()=>document.querySelector('#sk-ctx')?.textContent.includes('Amazon'));
  const header=await page.locator('#sk-ctx').innerText();assert.match(header,/Amazon/);assert.match(header,/ملف المراجعة/);assert.match(header,/مليون/);
  await page.getByText('الاستوديو الثانوي غير متاح لهذا الميزان',{exact:false}).first().waitFor();
  await page.locator('#view [data-tab="close"]').first().click();
  const close=await page.locator('#view').innerText();assert.match(close,/تسهيلات بنكية غير مستخدمة \(مليون \$\)/);assert.doesNotMatch(close,/تسهيلات بنكية غير مستخدمة \(ريال\)/);
  await page.locator('#view [data-tab="fs"]').first().click();
  assert.match(await page.locator('#view').innerText(),/637,959/);
  await page.evaluate(()=>SKosifCore.go('auditreport'));
  await page.getByText('الاستوديو الثانوي غير متاح لهذا الميزان',{exact:false}).first().waitFor();
  assert.equal(await page.locator('.kx-audit-host').count(),0);assert.deepEqual(errors,[]);
  console.log(`PASS ${viewport.width}x${viewport.height}: bilingual search, audit context/scale, primary revenue, secondary guard, no page errors`);
  await context.close();
 }
}finally{await browser.close()}
