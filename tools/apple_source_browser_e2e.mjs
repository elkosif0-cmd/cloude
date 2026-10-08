// Authored CI-only browser acceptance. Never run against a user's profile or production.
// This file was not executed locally; actual-browser status comes only from Actions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
assert.equal(process.env.GITHUB_ACTIONS,'true','Browser execution is restricted to isolated GitHub Actions');
assert.match(process.env.SQC_TESTED_SHA||'',/^[a-f0-9]{40}$/);
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),process.env.SQC_TESTED_SHA);
const url=process.argv[2];assert.equal(url,'http://127.0.0.1:8765/app-safe.html');
const bytes=fs.readFileSync('tools/fixtures/apple-fy2024-source.json');
assert.equal(createHash('sha256').update(bytes).digest('hex'),'f35bbc22c3438262c35b63d226d62b88c3e252a9da054d9b7a4da4093e46e7f5');
const oracle=JSON.parse(bytes),fact=id=>oracle.items.find(x=>x.id===id).values['2024'];
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const EXPECTED_CHECKS=6;
const out='artifacts/apple-source',results=[];fs.mkdirSync(out,{recursive:true});
const sources=Object.fromEntries(['ui/core/engines.js','ui/features/tb-review.js','ui/features/report-docs.js','ui/features/audit-bridge.js', 'tools/apple_source_browser_e2e.mjs','dist/app-safe.html','dist/skosif.js','dist/skosif.css'].map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:960},locale:'ar-SA',reducedMotion:'reduce',acceptDownloads:true});
const origin=new URL(url).origin;
await context.route('**/*',r=>{const u=r.request().url();return u.startsWith(origin+'/')||u.startsWith('data:')||u.startsWith('blob:')?r.continue():r.abort();});
await context.addInitScript(()=>{
  localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}));
  localStorage.setItem('skosif_role_mode',JSON.stringify('admin'));
  sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');
});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
async function check(name,fn){await fn();results.push({name,status:'pass'});}
const save=()=>fs.writeFileSync(out+'/browser-results.json',JSON.stringify({testedGitSHA:process.env.SQC_TESTED_SHA,sources,expectedChecks:EXPECTED_CHECKS,completedChecks:results.filter(r=>r.status==='pass').length,results,errors,limits:['CI-only isolated data-free preview','Published Apple source plus synthetic import records','No deployment, professional-assurance or native Office rendering claim']},null,2)+'\n');
try{
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.SKosifTBReview&&window.SKosifCore&&window.SK&&(!SK.demo||!SK.demo.settled||SK.demo.settled()),null,{timeout:90000});
  await check('actual Apple picker selection and source report',async()=>{
    await page.evaluate(()=>SKosifTBReview.picker());
    await page.locator('[data-bundle-add="apple-2024"]').click();
    await page.locator('#view .tbr-source-replay').waitFor(); // opening is async (bundle data, the on-demand source adapters)
    assert.equal(await page.locator('#view .tbr-source-replay').count(),1);
    assert.equal(await page.locator('#view [data-tab], #view [data-a="demo-audit"]').count(),0);
    const build=await page.locator('meta[name="sqc-build"]').getAttribute('content');assert.match(build,/^[a-f0-9]{10}$/);
    const report=page.locator('#view .rd-source');await report.waitFor();const text=await report.innerText();
    for(const value of ['Apple Inc.','US_GAAP','USD million','2024-09-28','2023-09-30',Number(fact('revenue')).toLocaleString('en-US'),Number(fact('operating_income')).toLocaleString('en-US')])assert.ok(text.includes(value),value);
    assert.doesNotMatch(text,/SOCPA|الريال السعودي|الزكاة|قمنا بمراجعة|أجرينا/);
    assert.equal(await page.locator('#view [data-studio-host]').count(),0);
    await page.screenshot({path:out+'/apple-source-report.png',fullPage:true});
  });
  await check('saved and repeated Apple opens retain the source-only shell',async()=>{
    const assertSourceShell=async()=>{
      await page.locator('#view .tbr-source-replay .rd-source').waitFor();
      assert.match(await page.locator('#view .rd-source').innerText(),/Apple Inc\./);
      assert.equal(await page.locator('#view [data-tab], #view [data-a="demo-audit"], #view [data-studio-host]').count(),0);
    };
    await page.locator('#view [data-bundle-open]').click();
    await page.locator('[data-bundle-add="pg-2026"]').click();
    await page.locator('#view [data-bundle-open]').click();
    await page.locator('[data-bundle-go="apple-2024"]').click();await assertSourceShell();
    await page.locator('#view [data-bundle-open]').click();
    await page.locator('[data-bundle-add="apple-2024"]').click();await assertSourceShell();
    await page.evaluate(()=>SKosifTBReview.open('tb'));await assertSourceShell();
    await page.screenshot({path:out+'/apple-saved-source-reopen.png',fullPage:true});
  });
  await check('blocked Excel refusal is visible inside the preview and emits no download',async()=>{
    const downloads=[],onDownload=download=>downloads.push(download);page.on('download',onDownload);
    try{
      await page.locator('#view [data-a="print"]').click();
      const preview=page.getByRole('dialog',{name:'معاينة المستند',exact:true});
      await preview.getByRole('button',{name:'Excel',exact:true}).click();
      const notice=preview.getByRole('status');await notice.waitFor({state:'visible'});
      assert.match(await notice.innerText(),/Excel.*غير متاح.*CSV/);
      assert.equal(await notice.getAttribute('aria-live'),'polite');
      assert.equal(await notice.evaluate(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));}),true);
      await preview.getByRole('button',{name:'Excel',exact:true}).press('Enter');
      await page.screenshot({path:out+'/apple-excel-in-modal-refusal.png',fullPage:true});
      assert.equal(downloads.length,0);
      await preview.getByRole('button',{name:'إغلاق',exact:true}).click();
    }finally{page.off('download',onDownload);}
  });
  await check('native CSV keeps source identity and unavailable cash flow',async()=>{
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#view [data-a="fs-csv"]').click()]);
    assert.match(download.suggestedFilename(),/Apple Inc.*2024-09-28/);
    const path=out+'/apple-source.csv';await download.saveAs(path);const csv=fs.readFileSync(path,'utf8');
    for(const token of ['US_GAAP','USD','million','2023-09-30','unavailable; cash-tie not-tested',Number(fact('operating_income')).toFixed(2)])assert.ok(csv.includes(token),token);
  });
  await check('deep-linked ordinary studio cannot ingest Apple as a Saudi audit',async()=>{
    await page.evaluate(()=>SKosifCore.go('auditreport'));
    await page.getByText('أدوات الاستوديو غير متاحة لنموذج القوائم المنشورة',{exact:false}).waitFor();
    assert.equal(await page.locator('.kx-audit-host').count(),0);
    const transport=await page.evaluate(()=>SKosifTBReview.rows());assert.equal(transport.sourceOnly,true);assert.deepEqual(transport.rows,[]);
  });
  await check('public stripped-marker import and context-only restore fail closed',async()=>{
    await page.evaluate(()=>SKosifCore.go('tbreview'));await page.locator('#view [data-file-new]').click();
    const imported=await page.evaluate(async()=>{
      const t=SKEngines.reports.corpusCompanies.companyTrialBalance('apple-2024');
      return SKosifTBReview.load(t.csv.replace(/^#.*\n/,''),'CI public source import',t.ctx);
    });assert.equal(imported,true);
    await page.evaluate(()=>SKosifTBReview.open('fs'));
    await page.locator('#view .rd-source .rd-risk').waitFor();
    assert.doesNotMatch(await page.locator('#view .rd-source').innerText(),/391,035/);
    await page.evaluate(()=>{
      const d=SK.load('skosif_tbreview_v1',null);delete d.sourceKind;delete d.sourceId;delete d.bundleId;
      if(!d.ctx.sourceModel)throw Error('Source metadata missing from test setup');
      SK.save('skosif_tbreview_v1',d);SKosifTBReview.open('fs');
    });
    const transport=await page.evaluate(()=>SKosifTBReview.rows());assert.equal(transport.sourceOnly,true);assert.deepEqual(transport.rows,[]);
    await page.locator('#view .rd-source .rd-risk').waitFor();assert.equal(await page.locator('#view [data-studio-host]').count(),0);
    await page.screenshot({path:out+'/source-import-unavailable.png',fullPage:true});
  });
  assert.equal(results.length,EXPECTED_CHECKS,'All authored browser checks must execute');
  assert.equal(results.filter(r=>r.status==='pass').length,EXPECTED_CHECKS);
  assert.deepEqual(errors,[],'Unexpected app runtime errors');
}catch(error){results.push({name:'browser acceptance',status:'fail',error:error.stack});await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{save();await context.close();await browser.close();}
