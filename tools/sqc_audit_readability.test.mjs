import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const css=fs.readFileSync(new URL('../ui/audit/app.css',import.meta.url),'utf8');
const fixture=`<div class="kx-body"><div class="shell"><section class="cash-flow-workspace panel"><p class="cash-flow-note">مراجعة التدفقات النقدية</p><div class="cash-flow-balances"><label>الرصيد<input value="1234"></label></div><div class="cash-movement-form"><input value="اختبار"><select><option>النشاط</option></select><input><input><input><button class="primary">إضافة الحركة</button></div><div class="report-intake-state"><small>تتبّع المستندات والأدلة</small></div><div class="lineage-search"><label>بحث</label><input></div><div class="statement-lineage-table-wrap"><table class="statement-lineage-table"><tbody><tr><td>التدفقات النقدية</td><td>1234</td></tr></tbody></table></div></section></div></div>`;
async function inspect(width,fn){
  const executablePath=process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  const browser=await chromium.launch({headless:true,executablePath});
  try{const page=await browser.newPage({viewport:{width,height:844}});
    await page.setContent('<html dir="rtl"><style>body{margin:16px}#host{--sk-font:monospace;--kx-font:monospace;--sk-fs:16px;--sk-ink:#172b45;--sk-surface:#fff;--sk-line:#ddd;--sk-line-2:#aaa;--sk-brand:#1668e3;--kx-ink:#172b45;--kx-surface:#fff;--kx-brand:#1668e3}</style><div id="host"></div></html>');
    await page.evaluate(({css,fixture})=>{document.querySelector('#host').attachShadow({mode:'open'}).innerHTML='<style>'+css+'</style>'+fixture},{css,fixture});
    await fn(page);
  }finally{await browser.close()}
}
test('audit content follows the selected application font',async()=>inspect(1100,async page=>{
  const family=await page.evaluate(()=>getComputedStyle(document.querySelector('#host').shadowRoot.querySelector('.cash-flow-note')).fontFamily);
  assert.match(family,/monospace/,'audit paragraphs must inherit the selected theme font');
}));
test('audit metadata and data tables have a readable 13px floor',async()=>inspect(1100,async page=>{
  const values=await page.evaluate(()=>['.report-intake-state>small','.statement-lineage-table','.cash-flow-balances label'].map(s=>({selector:s,size:parseFloat(getComputedStyle(document.querySelector('#host').shadowRoot.querySelector(s)).fontSize)})));
  for(const value of values)assert.ok(value.size>=13,`${value.selector}: ${value.size}px is below 13px`);
}));
test('audit form controls remain readable and inside a narrow RTL viewport',async()=>inspect(320,async page=>{
  const result=await page.evaluate(()=>{const root=document.querySelector('#host').shadowRoot;return [...root.querySelectorAll('input,select,button')].map(el=>{const r=el.getBoundingClientRect();return {size:parseFloat(getComputedStyle(el).fontSize),height:r.height,left:r.left,right:r.right}})});
  for(const r of result){assert.ok(r.size>=16,`control font is ${r.size}px`);assert.ok(r.height>=44,`control height is ${r.height}px`);assert.ok(r.left>=0&&r.right<=320,`control lies outside viewport: ${r.left}–${r.right}`)}
}));
test('focused desktop workspaces remain single-column and wide-left ratios are preserved',async()=>inspect(1440,async page=>{
  const result=await page.evaluate(()=>{const root=document.querySelector('#host').shadowRoot;
    const shell=root.querySelector('.shell');
    shell.insertAdjacentHTML('beforeend','<div class="workspace-grid workspace-focus-single"><section>Focused content</section></div><div class="workspace-grid wide-left"><section>Main</section><aside>Inspector</aside></div>');
    const single=root.querySelector('.workspace-focus-single');const wide=root.querySelector('.wide-left');
    return {singleWidth:single.getBoundingClientRect().width,childWidth:single.firstElementChild.getBoundingClientRect().width,columns:getComputedStyle(wide).gridTemplateColumns.split(' ').map(parseFloat)};
  });
  assert.ok(Math.abs(result.singleWidth-result.childWidth)<2,'focused content must fill its workspace');
  assert.equal(result.columns.length,2);
  assert.ok(Math.abs(result.columns[0]/result.columns[1]-1.55/.85)<.03,'wide-left proportions must remain unchanged');
}));
test('runtime theme font and text-size preferences reach shadow content',async()=>inspect(1100,async page=>{
  const result=await page.evaluate(()=>{const host=document.querySelector('#host');const root=host.shadowRoot;
    host.style.setProperty('--kx-font','serif');host.style.setProperty('--kx-ink','#eeeeee');host.style.setProperty('--sk-fs','20px');
    return {font:getComputedStyle(root.querySelector('.cash-flow-note')).fontFamily,color:getComputedStyle(root.querySelector('.kx-body')).color,bodySize:parseFloat(getComputedStyle(root.querySelector('.kx-body')).fontSize),controlSize:parseFloat(getComputedStyle(root.querySelector('input')).fontSize)};
  });
  assert.equal(result.font,'serif');assert.equal(result.color,'rgb(238, 238, 238)');assert.ok(result.bodySize>=20);assert.ok(result.controlSize>=20);
}));
