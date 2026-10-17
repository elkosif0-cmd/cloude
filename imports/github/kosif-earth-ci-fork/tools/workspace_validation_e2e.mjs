// CI-only, synthetic UI acceptance. No storage seeding, service replacement,
// SK.company.create call, or navigation API bypass is used to create records.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Workspace browser acceptance is CI-only');
assert.equal(process.env.GITHUB_REPOSITORY, 'elkosif0-cmd/cloude'); // the repository's home since 2026-10 (was kosif199022-jpg/cloude)
assert.equal(process.env.SQC_BUILD_MODE, 'preview', 'Only the data-free preview is allowed');
const head = process.env.SQC_TESTED_SHA || '';
assert.match(head, /^[a-f0-9]{40}$/);
const git = spawnSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'});
assert.equal(git.status, 0, git.stderr);
assert.equal(git.stdout.trim(), head, 'The checkout must equal the tested head');
const base = process.argv[2] || 'http://127.0.0.1:8765/';
assert.equal(base, 'http://127.0.0.1:8765/', 'Only the workflow-owned CI loopback origin is allowed');
assert.equal(fs.existsSync('dist/secure'), false);
assert.ok(fs.readFileSync('dist/app-safe.html', 'utf8').includes('const SEED_B64 = "";'));
const out = 'artifacts/workspace-validation';
fs.mkdirSync(out, {recursive:true});
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const files = ['ui/features/workspace.js','ui/components/states.js','ui/core/company.js','ui/core/helper-space.js','ui/core/engines.js','tools/workspace_validation_e2e.mjs','.github/workflows/sqc-workspace-validation.yml'];
const sources = Object.fromEntries(files.map(file => [file,{sha256:sha256(fs.readFileSync(file)),url:`https://github.com/${process.env.GITHUB_REPOSITORY}/blob/${head}/${file}`} ]));
const results = [], screenshots = [], blockedNetwork = [];
const flush = () => fs.writeFileSync(`${out}/results.json`, JSON.stringify({head,sources,results,screenshots,blockedNetwork,
  runUrl:`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  limitations:['Synthetic data only; no private companies or account credentials.','CI Chromium at two viewports; not native mobile hardware or assistive technology.','No storage seeding or test replacement of production services; state evaluations below are read-only.','This checks creation validation; it does not certify every report or historical company ownership.']},null,2));
flush();
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({headless:true});
const snapshot = page => page.evaluate(() => {
  const d=JSON.parse(localStorage.getItem('skosif_companies_v1') || '{}'), c=SK.company.current();
  return {companies:d.companies || [],periods:d.periods || [],active:d.active || {},company:{id:c.id,name:c.name,period:c.period},space:SKosifSpace.current().id};
});
const ready = page => page.waitForFunction(() => window.SK?.company?.ready() && window.SKosifSpace && !SKosifSpace.busy() && SK.demo?.settled() && !document.querySelector('.skdemo-overlay'), null, {timeout:90000});
async function companies(page) {
  await page.locator('#sk-tb-pe').click();
  await page.locator('.sk-menu [data-m="go"][data-v="companies"]').click();
  await page.locator('#view [data-w="add-pe"]').waitFor({state:'visible'});
}
async function required(page,id) {
  const error=await page.locator('#'+id).evaluate(field=>{
    const message=field.closest('.sk-field').querySelector('.sk-field-err');
    return {invalid:field.getAttribute('aria-invalid'),focused:document.activeElement===field,message:message?.textContent,role:message?.getAttribute('role'),described:!!message&&String(field.getAttribute('aria-describedby')).split(/\s+/).includes(message.id)};
  });
  assert.deepEqual(error,{invalid:'true',focused:true,message:'هذا الحقل مطلوب',role:'alert',described:true});
}
async function shot(page,name) {
  const file=`${out}/${name}.png`;await page.screenshot({path:file,fullPage:true});
  screenshots.push({file:name+'.png',bytes:fs.statSync(file).size,sha256:sha256(fs.readFileSync(file))});flush();
}
try {
  for (const [tag,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'}), page=await context.newPage(), errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await context.route('**/*',route=>{
      const req=route.request(),u=new URL(req.url());
      const safeMethod=['GET','HEAD'].includes(req.method());
      const local=u.origin==='http://127.0.0.1:8765'&&!/\/secure\/|crypto\.json/i.test(u.pathname);
      const font=['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname);
      if(safeMethod&&(local||font))return route.continue();
      blockedNetwork.push({viewport:tag,method:req.method(),url:u.origin+u.pathname});return route.abort();
    });
    try {
      await page.goto(base+'index.html');
      // the door asks the section, then the sector, then the company (FOUNDATION: section → sector → company)
      await page.locator('[data-gate="accounting"]').click();
      await page.locator('[data-sector="meat"]').click();
      await page.locator('#co-list .co[data-id="demo-co"]').click();
      await page.waitForURL(/app-safe\.html/);await ready(page);await companies(page);
      const initial=await snapshot(page);assert.equal(initial.company.id,'demo-co');assert.equal(initial.space,'demo-co');
      assert.equal(await page.locator('#co-name').inputValue(),'');assert.equal(await page.locator('#pe-label').inputValue(),'');

      // Both blank: only the action's own label receives the accessible error.
      await page.locator('[data-w="add-pe"]').click();await required(page,'pe-label');
      assert.equal(await page.locator('#co-name').getAttribute('aria-invalid'),null);
      assert.deepEqual(await snapshot(page),initial);

      // Correct the label, but preserve the real date/business-rule rejection.
      await page.locator('#pe-label').fill(`Synthetic ${tag} FY 2026`);
      await page.locator('#pe-from').fill('2026-12-31');await page.locator('#pe-to').fill('2026-01-01');
      await page.locator('[data-w="add-pe"]').click();
      await page.getByText('تاريخ البداية يجب أن يسبق النهاية',{exact:true}).waitFor({state:'visible'});
      assert.deepEqual(await snapshot(page),initial);
      assert.equal(await page.locator('#pe-label').getAttribute('aria-invalid'),'false');
      assert.equal(await page.locator('#pe-label').getAttribute('aria-describedby'),null);
      assert.equal(await page.locator('#co-name').inputValue(),'');

      // The valid period is created through the actual button under the demo.
      await page.locator('#pe-from').fill('2026-01-01');await page.locator('#pe-to').fill('2026-12-31');
      await page.locator('[data-w="add-pe"]').click();
      await page.waitForFunction(count=>(JSON.parse(localStorage.getItem('skosif_companies_v1')||'{}').periods||[]).length===count+1,initial.periods.length);
      const periodAdded=await snapshot(page),created=periodAdded.periods.find(p=>!initial.periods.some(old=>old.id===p.id));
      assert.ok(created);assert.equal(created.companyId,initial.company.id);assert.equal(created.label,`Synthetic ${tag} FY 2026`);
      assert.equal(created.startDate,'2026-01-01');assert.equal(created.endDate,'2026-12-31');
      assert.equal(periodAdded.active.companyId,initial.company.id);assert.equal(periodAdded.active.periodId,created.id);
      assert.deepEqual(periodAdded.company.period,created);assert.deepEqual(periodAdded.companies,initial.companies);
      assert.equal(await page.locator('#co-name').inputValue(),'');
      assert.ok((await page.locator('#view').innerText()).includes(created.label));
      await shot(page,`${tag}-period-created`);

      // Repaint clears its label; another click cannot duplicate the period.
      assert.equal(await page.locator('#pe-label').inputValue(),'');
      await page.locator('[data-w="add-pe"]').click();await required(page,'pe-label');
      assert.deepEqual(await snapshot(page),periodAdded);

      // Add Company still requires its own name, even with a period selected.
      await page.locator('[data-w="add-co"]').click();await required(page,'co-name');
      assert.deepEqual(await snapshot(page),periodAdded);
      const name=`Synthetic ${tag} New Company`;
      await page.locator('#co-name').fill(name);await page.locator('#co-cur').selectOption('EGP');
      assert.equal(await page.locator('#pe-label').inputValue(),'');
      await Promise.all([page.waitForEvent('framenavigated',{predicate:frame=>frame===page.mainFrame(),timeout:60000}),page.locator('[data-w="add-co"]').click()]);
      await ready(page);
      const companyAdded=await snapshot(page),newCo=companyAdded.companies.find(c=>!periodAdded.companies.some(old=>old.id===c.id));
      assert.ok(newCo);assert.equal(newCo.name,name);assert.equal(newCo.currency,'EGP');assert.equal(newCo.country,'EG');
      assert.equal(companyAdded.companies.length,initial.companies.length+1);assert.deepEqual(companyAdded.periods,periodAdded.periods);
      assert.equal(companyAdded.company.id,newCo.id);assert.equal(companyAdded.space,newCo.id);assert.equal(companyAdded.active.companyId,newCo.id);
      assert.equal(companyAdded.company.period,null);assert.equal(companyAdded.active.periodId,undefined);

      // The same actual UI creates a new period bound to the newly opened company.
      await companies(page);await page.locator('#pe-label').fill(`Synthetic ${tag} FY 2027`);
      await page.locator('#pe-from').fill('2027-01-01');await page.locator('#pe-to').fill('2027-12-31');
      assert.equal(await page.locator('#co-name').inputValue(),'');await page.locator('[data-w="add-pe"]').click();
      const final=await snapshot(page),own=final.periods.find(p=>p.companyId===newCo.id);
      assert.ok(own);assert.equal(final.periods.length,periodAdded.periods.length+1);assert.equal(final.active.periodId,own.id);
      assert.deepEqual(final.company.period,own);assert.deepEqual(final.periods.find(p=>p.id===created.id),created);
      assert.equal(final.company.id,newCo.id);assert.equal(final.space,newCo.id);
      await shot(page,`${tag}-new-company-period-created`);
      assert.deepEqual(errors,[],'unexpected application page errors');
      results.push({viewport:tag,status:'pass',originalCompanyId:initial.company.id,originalPeriod:created,newCompany:newCo,newPeriod:own});flush();
    } catch(error) {
      results.push({viewport:tag,status:'fail',error:error.stack||String(error),pageErrors:errors});
      await shot(page,`${tag}-failure`).catch(()=>{});flush();
    } finally { await context.close(); }
  }
} finally { await browser.close();flush(); }
assert.equal(blockedNetwork.length,0,'unexpected outbound or private-resource request');
assert.equal(results.length,2);assert.ok(results.every(result=>result.status==='pass'),JSON.stringify(results));
console.log('Workspace validation: actual UI creation passed at desktop and phone viewports');
