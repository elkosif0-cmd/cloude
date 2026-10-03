// Browser acceptance; synthetic data only. Run in an authorized browser environment.
// NODE_PATH=/tmp/pw/node_modules node tools/sqc_accessibility_e2e.mjs URL
import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const url=process.argv[2]||'http://localhost:8765/app-safe.html';
const browser=await chromium.launch();
const failures=[];let assertions=0;
const check=(name,value)=>{assertions++;if(!value)failures.push(name)};
fs.mkdirSync('test-results/sqc-accessibility',{recursive:true});
try{
 for(const width of [375,768,1440])for(const night of [false,true]){
  const ctx=await browser.newContext({viewport:{width,height:960}});const page=await ctx.newPage();
  await ctx.addInitScript(()=>{sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}))});
  await page.goto(url);await page.waitForFunction(()=>window.SK?.modalFocus&&window.SKosifCore&&!document.querySelector('.skdemo-overlay'),null,{timeout:60000});
  await page.evaluate(n=>{SKosifShell.setLook(n?'kosif-night':'kosif');SKosifCore.go('dash')},night);
  await page.waitForTimeout(350);
  check(`${width}/${night}: no body overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check(`${width}/${night}: body at least 16px`,await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize)>=16));
  await page.evaluate(()=>{const b=document.createElement('button');b.id='sqc-test-invoker';b.textContent='اختبار';document.body.append(b);b.focus();window.sqcResult='pending';window.sqcSaveCount=0;SK.form('اختبار',[{key:'amount',label:'المبلغ',type:'number',required:true}],{}).then(r=>{window.sqcResult=r;if(r)window.sqcSaveCount++})});
  const form=page.locator('.skd[role=dialog]').last();await form.waitFor();
  check('explicit input label',await form.locator('input').evaluate(el=>!!el.labels?.length));
  check('input at least 16px',await form.locator('input').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
  await form.locator('[type=submit]').focus();await page.keyboard.press('Tab');check('forward focus contained',await form.locator('input').evaluate(el=>document.activeElement===el));
  await page.keyboard.press('Shift+Tab');check('backward focus contained',await form.locator('[type=submit]').evaluate(el=>document.activeElement===el));
  await form.locator('[type=submit]').click();check('error announcement visible',await form.locator('[role=alert]').isVisible());
  await page.keyboard.press('Escape');check('Escape restores actual invoker',await page.evaluate(()=>document.activeElement.id==='sqc-test-invoker'&&sqcResult===null));
  await page.evaluate(()=>{document.getElementById('sqc-test-invoker').focus();SK.form('اختبار',[{key:'name',label:'الاسم',value:'Synthetic'}]).then(r=>{if(r)window.sqcSaveCount++})});
  await page.evaluate(()=>{const form=document.querySelector('.skd form')||document.querySelector('form.skd');form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))});await page.waitForTimeout(50);check('repeated submit settles once',await page.evaluate(()=>sqcSaveCount===1));
  await page.evaluate(()=>{document.getElementById('sqc-test-invoker').focus();SK.confirm('إلغاء اختبار').then(r=>window.sqcResult=r)});
  await page.locator('.skd [data-r="0"]').click();check('Cancel restores focus',await page.evaluate(()=>document.activeElement.id==='sqc-test-invoker'&&sqcResult===false));
  await page.evaluate(()=>SKosifCore.act('v12-sale-new'));
  await page.locator('#v12s-customer').waitFor();
  check('sale fields have explicit labels',await page.locator('[id^="v12s-"]').evaluateAll(els=>els.every(el=>el.labels?.length)));
  await page.locator('[data-act="v12-sale-save"]').click();check('sale error focuses and announces customer',await page.evaluate(()=>document.activeElement.id==='v12s-customer'&&document.getElementById('v12s-customer').getAttribute('aria-invalid')==='true'&&!!document.querySelector('.field [role=alert]')));
  await page.locator('#v12s-customer').fill('Synthetic validation only');await page.locator('[data-act="v12-sale-save"]').click();check('sale price error focuses field',await page.evaluate(()=>document.activeElement.id==='v12s-price'));
  await page.locator('[data-act="modal-close"]').last().click();
  await page.emulateMedia({reducedMotion:'reduce'});
  check('reduced motion disables decorative and pseudo animations',await page.evaluate(()=>{const el=document.querySelector('.sk-tb-btn');return ['','::before','::after'].every(p=>getComputedStyle(el,p).animationName==='none')}));
  await page.evaluate(()=>document.body.style.zoom='2');
  check('200% zoom has no body overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`test-results/sqc-accessibility/${width}-${night?'night':'day'}-200.png`,fullPage:true});
  await ctx.close();
 }
 console.log(`SQC accessibility: ${assertions-failures.length}/${assertions} passed`);assert.deepEqual(failures,[]);
}finally{await browser.close()}
