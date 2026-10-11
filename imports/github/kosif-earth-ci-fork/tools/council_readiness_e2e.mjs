// Isolated native component acceptance. Synthetic Council evidence only, never production data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
assert.equal(process.env.GITHUB_ACTIONS,'true');
assert.match(process.env.SQC_TESTED_SHA||'',/^[a-f0-9]{40}$/);
const {chromium}=createRequire(import.meta.url)('playwright');
const out='artifacts/council-readiness';fs.mkdirSync(out,{recursive:true});
const paths=['ui/audit/v5/engagement-machine.js','ui/audit/v5/completion-engine.js','ui/audit/v5/report-approval.js','ui/audit/v5/continuous-completion.js','ui/audit/council.js','ui/audit/v5/review-loop.js','ui/audit/v5/continuous-council.js','ui/audit/v5/report-source.js','ui/audit/v5/report-model.js','tools/fixtures/council-readiness-browser.mjs'];
const sources=Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const results=[],browser=await chromium.launch({headless:true});
try{
 for(const width of [320,1280]){
  const context=await browser.newContext({viewport:{width,height:1000},locale:'ar-SA'});
  await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8767/')?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto('http://127.0.0.1:8767/fixture.html');await page.waitForFunction(()=>window.councilFixture);
   for(const kind of ['blocked','empty','malformed','missing-evidence','legacy','stale','valid']){
    const name=`${width}-${kind}`;
    try{
     const state=await page.evaluate(k=>window.councilFixture.setup(k),kind);
     assert.equal(await page.locator('#issueReportButton').isDisabled(),kind!=='valid');
     if(['blocked','empty','malformed','missing-evidence'].includes(kind)){assert.equal(state.ready,false);assert.notEqual(await page.locator('#completionScore').textContent(),'100%');}
     const before=await page.evaluate(()=>JSON.stringify(window.councilFixture.state().report));
     await page.evaluate(()=>window.councilFixture.render());await page.evaluate(()=>window.councilFixture.render());
     assert.equal(await page.evaluate(()=>JSON.stringify(window.councilFixture.state().report)),before,'render must not mutate a draft');
     if(kind==='legacy'){assert.match(await page.locator('#reportFreshness').innerText(),/^UNKNOWN/);assert.equal(await page.locator('.report-review:not([disabled])').count(),0);}
     if(kind==='stale'){assert.match(await page.locator('#reportFreshness').innerText(),/^STALE/);assert.equal(await page.locator('.report-review:not([disabled])').count(),0);}
     await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
     if(kind==='valid'){
      assert.match(await page.locator('#reportFreshness').innerText(),/^FRESH/);
      page.once('dialog',d=>d.accept('Synthetic CI issuance regression only'));
      await page.locator('#issueReportButton').click();
      assert.equal(await page.evaluate(()=>window.councilFixture.state().report.status),'issued');
      assert.equal(await page.locator('#issueReportButton').isDisabled(),true);
     }
     assert.deepEqual(errors,[]);results.push({name,status:'pass',state});
    }catch(e){results.push({name,status:'fail',error:e.stack});console.error(name,e.stack);}
   }
  }finally{await context.close();}
 }
}finally{await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify({head:process.env.SQC_TESTED_SHA,sources,results,syntheticOnly:true,limits:['Native existing completion component and real domain modules; not full application navigation','Synthetic human decisions, no professional audit sufficiency claim','Actual runCouncil adapter exercised for valid/blocked cases; its input coverage limitations remain']},null,2));}
assert.equal(results.filter(r=>r.status==='fail').length,0);
