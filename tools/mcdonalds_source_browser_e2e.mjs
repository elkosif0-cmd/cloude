// Authored for a data-free, isolated CI preview only. Never run locally or on a user profile.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
assert.equal(process.env.GITHUB_ACTIONS,'true','Native browser execution is CI-only');
assert.match(process.env.SQC_TESTED_SHA||'',/^[a-f0-9]{40}$/);
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),process.env.SQC_TESTED_SHA);
const url=process.argv[2];assert.equal(url,'http://127.0.0.1:8765/app-safe.html');
const bytes=fs.readFileSync('tools/fixtures/mcdonalds/issuer-model.json');
assert.equal(createHash('sha256').update(bytes).digest('hex'),'873af9d6ab999fa21b8c278edab2d4423bfe3e32318ce362ea27e58d5b7a327e');
const oracle=JSON.parse(bytes),index=new Map(oracle.facts.map(f=>[f.fact_id,f]));
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const out='artifacts/mcdonalds-source',results=[],errors=[],EXPECTED_CHECKS=5;fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1280,height:960},locale:'en-US',acceptDownloads:true});
const origin=new URL(url).origin;
await context.route('**/*',r=>{const u=r.request().url();return u.startsWith(origin+'/')||u.startsWith('data:')||u.startsWith('blob:')?r.continue():r.abort();});
await context.addInitScript(()=>{localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}));localStorage.setItem('skosif_role_mode',JSON.stringify('admin'));sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const check=async(name,fn)=>{await fn();results.push({name,status:'pass'});};
try{
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.SKosifTBReview&&window.SKosifCore&&window.SK&&(!SK.demo||!SK.demo.settled||SK.demo.settled()),null,{timeout:90000});
 await check('actual picker offers FY2022 source and renders every primary source cell',async()=>{
  await page.evaluate(()=>SKosifTBReview.picker());await page.locator('[data-bundle-add="mcdonalds-2022"]').click();
  await page.locator('#view [data-source-table="income_statement"]').waitFor();
  const text=await page.locator('#view .rd-source').innerText();for(const token of ['McDonald','US_GAAP','USD million','2022-12-31','2021-12-31'])assert.ok(text.includes(token),token);
  assert.doesNotMatch(text,/Apple|SOCPA|قمنا بمراجعة|rd-sign/);
  const cells=await page.locator('#view .rd-replay-table').evaluateAll(ts=>ts.flatMap(t=>Array.from(t.querySelectorAll('[data-source-row]')).flatMap(r=>Array.from(r.querySelectorAll('[data-cell-status]')).map((c,i)=>({table:t.dataset.sourceTable,row:r.dataset.sourceRow,column:i,text:c.childNodes[0]?.textContent?.trim(),status:c.dataset.cellStatus,end:c.dataset.periodEnd,kind:c.dataset.periodKind,unit:c.dataset.unit})))));
  assert.equal(cells.length,378);
  const units={USD_millions:'USD million',USD_per_share:'USD per common share',millions_of_shares:'million shares'};
  for(const c of cells){const table=oracle.tables[c.table],year=table.columns[c.column],f=index.get(c.table+'.'+c.row+'.'+year);assert.ok(f);assert.equal(c.end,f.observation_date||f.period_end);assert.equal(c.kind,f.temporal_kind);assert.equal(c.unit,units[f.unit]);
   if(f.value===null){assert.equal(c.status,'unavailable');assert.equal(c.text,'غير متاح');}else{const display=table.rows[c.row].source_display?.[year];assert.equal(c.status,'reported');if(display!==undefined)assert.equal(c.text,display);else assert.equal(Number(c.text.replace(/,/g,'')),Number(f.value),f.fact_id);}}
  fs.writeFileSync(out+'/displayed-cells.json',JSON.stringify(cells,null,2));await page.screenshot({path:out+'/mcdonalds-five-statements.png',fullPage:true});
 });
 await check('native CSV exports typed source periods and original numeric amounts',async()=>{
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#view [data-a="fs-csv"]').click()]);assert.match(download.suggestedFilename(),/McDonald.*2022-12-31/);
  const p=out+'/mcdonalds-source.csv';await download.saveAs(p);const csv=fs.readFileSync(p,'utf8');for(const token of ['US_GAAP','USD','published-statement-replay','23182.6','-6003.4','7386.7','2020-12-31','2022-01-01','unavailable'])assert.ok(csv.includes(token),token);
 });
 await check('edited FY2025 identity cannot inherit source attribution',async()=>{
  await page.evaluate(()=>{const d=SK.load('skosif_tbreview_v1',null);d.ctx.periodEnd='2025-12-31';SK.save('skosif_tbreview_v1',d);SKosifTBReview.open('fs');});
  await page.locator('#view .rd-source .rd-risk').waitFor();assert.equal(await page.locator('#view .rd-replay-table').count(),0);
  const result=await page.evaluate(()=>SKEngines.reports.corpusCompanies.companyTrialBalance('mcdonalds-2025'));assert.equal(result,null);
  await page.screenshot({path:out+'/mcdonalds-year-mismatch.png',fullPage:true});
 });
 await check('restored valid identity survives switching and source simulation remains non-assurance',async()=>{
  await page.evaluate(()=>{const d=SK.load('skosif_tbreview_v1',null);d.ctx.periodEnd='2022-12-31';SK.save('skosif_tbreview_v1',d);SKosifTBReview.open('fs');});
  await page.evaluate(async()=>{await SKosifTBReview.openClient('aramco-2025');await SKosifTBReview.openClient('mcdonalds-2022');await SKosifTBReview.showcase('mcdonalds-2022');});
  await page.locator('#view [data-source-table="cash_flow"]').waitFor();const result=await page.evaluate(()=>SKosifTBReview.rows());assert.equal(result.sourceOnly,true);assert.deepEqual(result.rows,[]);
  await page.locator('#view [data-doc="auditor"]').click();const text=await page.locator('#view .rd-source').innerText();assert.match(text,/Ernst & Young LLP/);assert.match(text,/2023-02-24/);assert.doesNotMatch(text,/Apple|قمنا بمراجعة|أجرينا مراجعة/);
 });
 await check('source context import with stripped marker stays unavailable and outside studio transport',async()=>{
  await page.locator('#view [data-file-new]').click();await page.evaluate(async()=>{const t=SKEngines.reports.corpusCompanies.companyTrialBalance('mcdonalds-2022');await SKosifTBReview.load(t.csv.replace(/^#.*\n/,''),'CI imported source',t.ctx);SKosifTBReview.open('fs');});
  await page.locator('#view .rd-source .rd-risk').waitFor();assert.equal(await page.locator('#view .rd-replay-table').count(),0);const transport=await page.evaluate(()=>SKosifTBReview.rows());assert.equal(transport.sourceOnly,true);assert.deepEqual(transport.rows,[]);
 });
 assert.equal(results.length,EXPECTED_CHECKS);assert.deepEqual(errors,[]);
}catch(error){results.push({name:'native source acceptance',status:'fail',error:error.stack});await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{fs.writeFileSync(out+'/browser-results.json',JSON.stringify({testedGitSHA:process.env.SQC_TESTED_SHA,oracleSha256:'873af9d6ab999fa21b8c278edab2d4423bfe3e32318ce362ea27e58d5b7a327e',expectedChecks:EXPECTED_CHECKS,results,errors,limits:['CI-only authored fixture; not executed locally','No deployment, professional audit, transaction reconstruction or native Office claim']},null,2)+'\n');await context.close();await browser.close();}
