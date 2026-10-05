// Independent CI-only acceptance. Never launch this in a local/user browser.
// Oracle: hand-calculated synthetic journals, not the implementation's model output.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Browser acceptance is authorized only in GitHub Actions');
assert.match(process.env.SQC_TESTED_SHA || '', /^[a-f0-9]{40}$/, 'Supply the exact 40-character tested head');
const head = process.env.SQC_TESTED_SHA;
const git = spawnSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'});
assert.equal(git.status, 0, git.stderr);
assert.equal(git.stdout.trim(), head, 'Checkout must equal the declared tested head');
const url = process.argv[2] || 'http://127.0.0.1:8765/app-safe.html';
const parsed = new URL(url);
assert.equal(parsed.protocol, 'http:');
assert.equal(parsed.hostname, '127.0.0.1', 'Only the workflow-owned CI loopback server is allowed');
assert.equal(parsed.port, '8765');
assert.equal(parsed.pathname, '/app-safe.html');
const origin = parsed.origin, out = 'artifacts/executive-context';
fs.mkdirSync(out, {recursive:true});
const sha256 = value => createHash('sha256').update(value).digest('hex');
const sourcePaths = [
  'build.py', 'ui/core/sk.js', 'ui/core/output.js', 'ui/core/bus.js',
  'ui/core/helper-space.js', 'ui/core/company.js', 'ui/core/management-report-model.js',
  'ui/layouts/topbar.js', 'ui/layouts/shell.js', 'ui/components/xlsx.js',
  'ui/core/registry.js', 'ui/core/capabilities.json', 'ui/features/helper-center.js',
  'ui/features/management-report-source.js', 'ui/features/report-pack.js',
  'ui/ds/sqc.css', 'tools/executive_pack_context_e2e.mjs',
  '.github/workflows/sqc-executive-context.yml',
];
const sources = Object.fromEntries(sourcePaths.map(file => [file, {
  sha256:sha256(fs.readFileSync(file)),
  url:`https://github.com/kosif199022-jpg/cloude/blob/${head}/${file}`,
}]));
const results = [], artifacts = [], network = [], failures = [];
const limits = [
  'Synthetic data only. This verifies captured scope consistency, not historical data ownership, privacy certification, professional assurance, or all application modules.',
  'No local browser/server was authorized. This harness runs only in GitHub Actions at the exact recorded head.',
  'Actual SK.company, helper-space, source, output, and report modules are bundled without scope-reader replacements. Async gates wrap real capture/freshness results; IndexedDB failure is an explicit boundary fault injection.',
  'Share recipient is a synthetic navigator sink with no external transmission. Stale print uses a sink counter plus an independent raw beforeprint DOM test.',
  'Headless Chromium PDF is a file-rendering check, not physical printing, native print-dialog UX, Safari/mobile hardware, assistive technology, or native Word/Excel application rendering.',
  'Downloaded static files cannot be revoked after delivery. Staleness gates cover issuance and still-open output windows.',
  'SKosifCore.go does not push browser history; app-navigation cancellation is tested separately from a genuine browser Back lifecycle case.',
  'Public Google Fonts requests are allowed; no private source paths, account credentials, or production data are used.',
];
function flush() {
  fs.writeFileSync(`${out}/results.json`, JSON.stringify({
    head, run:process.env.GITHUB_RUN_ID || null,
    runUrl:process.env.GITHUB_RUN_ID ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
    sources, results, failures, artifacts, blockedNetwork:network, limits,
  }, null, 2));
}
function record(file, role) {
  artifacts.push({file:path.relative(out,file), role, bytes:fs.statSync(file).size, sha256:sha256(fs.readFileSync(file))});
}
async function check(id, fn) {
  const start=Date.now();
  try { const evidence=await fn(); results.push({id,status:'pass',milliseconds:Date.now()-start,evidence}); console.log('PASS',id); }
  catch(error) { failures.push(id); results.push({id,status:'fail',milliseconds:Date.now()-start,error:error.stack||String(error)}); console.error('FAIL',id,error.stack); }
  flush();
}
flush();
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({headless:true});
const K = {ledger:'skosif_ledger_v1', companies:'skosif_companies_v1', spaces:'sqc_helper_space_v1', users:'sqc_helper_users_v1'};
const A = {id:'synthetic-a', name:'Synthetic Cedar A', period:'period-a', currency:'SAR', revenue:300, expense:100, profit:200, cash:1200, total:1300};
const B = {id:'synthetic-b', name:'Synthetic Birch B', period:'period-b', currency:'USD', revenue:700, expense:50, profit:650, cash:1650, total:1700};
const period={start:'2026-01-01',end:'2026-12-31'};
const sections=['summary','books','trend','sales','risks','findings','decisions','tasks','signoff'];
const unsupported=['اتجاهات المبيعات والمشتريات','ذكاء المبيعات','المخاطر','الملاحظات المفتوحة','ما يحتاج قراراً','حالة المهام'];
const CANARIES=['GLOBAL_TASK_CANARY','GLOBAL_RISK_CANARY','GLOBAL_FINDING_CANARY','GLOBAL_DECISION_CANARY','UNBOUND_SALES_CANARY','UNBOUND_TREND_CANARY','INDEPENDENT_REVIEW_CANARY'];
function ledger(co=A, zero=false) {
  const entry=(id,date,dr,cr,amount)=>({id,date,memo:`Synthetic ${id}`,lines:[{accountId:dr,debit:amount,credit:0},{accountId:cr,debit:0,credit:amount}]});
  const accounts=[['cash','1100','asset'],['equity','3000','equity'],['rev','4000','revenue'],['exp','6000','expense']].map(([id,code,type])=>({id,code,type,name:`${co.id}-${id}`,active:true}));
  const entries=zero ? [entry('sale','2026-02-01','cash','rev',300),entry('reverse-sale','2026-02-02','rev','cash',300),entry('expense','2026-02-03','exp','cash',100),entry('reverse-expense','2026-02-04','cash','exp',100)] : [entry('opening','2025-12-31','cash','equity',1000),entry('sale','2026-02-01','cash','rev',co.revenue),entry('expense','2026-02-02','exp','cash',co.expense),entry('future-excluded','2027-01-01','cash','rev',9000)];
  return {accounts,entries};
}
function fixture(zero=false) {
  const spaces=Object.fromEntries([A,B].map(c=>[c.id,{name:c.name}]));
  return {
    [K.users]:{active:'synthetic-report-user',users:{'synthetic-report-user':{id:'synthetic-report-user',name:'Synthetic preparer',pinHash:null,pinSalt:null,lastSpace:A.id,spaces}}},
    [K.spaces]:{active:A.id,spaces},
    [K.companies]:{active:{companyId:A.id,periodId:A.period},companies:[A,B].map(c=>({id:c.id,name:c.name,currency:c.currency})),periods:[A,B].map(c=>({id:c.period,companyId:c.id,label:'Synthetic 2026',startDate:period.start,endDate:period.end}))},
    [K.ledger]:ledger(A,zero),
    'aghnam-pricing-v3':{raws:[],boxes:[],exps:[],settings:{biz:A.name,preparer:'Synthetic preparer'}},
    skosif_profile_v1:{name:'Synthetic preparer'},
    skosif_demo_v1:{off:true,sections:{},dismissed:true},
    skosif_report_pack_v1:{sections,seen:sections,reviewer:'Synthetic reviewer',approver:'Synthetic approver'},
    skosif_tasks_v1:[{title:CANARIES[0],done:false,due:'2020-01-01',priority:'high'}],
    sqc_executive_independent_review_fixture:{marker:CANARIES[6],untouched:true},
  };
}
const clean=s=>String(s).replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,'').replace(/\s+/g,' ').trim();
const money=(n,c)=>`${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} ${c}`;
function noCanary(text) { for(const c of CANARIES)assert.ok(!text.includes(c),`unbound data escaped: ${c}`); }
async function openPage(width=1280, zero=false) {
  const context=await browser.newContext({viewport:{width,height:1000},locale:'ar-SA',acceptDownloads:true,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.route('**/*',route=>{
    const u=new URL(route.request().url());
    const allowed=(u.origin===origin && !u.pathname.startsWith('/secure/')) || ['data:','blob:','about:'].includes(u.protocol) || (u.protocol==='https:'&&['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname));
    if(!allowed)network.push({host:u.hostname,path:u.pathname,reason:'external-or-private-network-blocked'});
    return allowed?route.continue():route.abort();
  });
  await context.addInitScript(seed=>{
    if(window!==window.top)return;
    // Preserve the real company switch/reload. Reseeding each navigation would hide it.
    if(!sessionStorage.getItem('sqc-executive-synthetic-seeded')){
      localStorage.clear();for(const [k,v] of Object.entries(seed))localStorage.setItem(k,JSON.stringify(v));
      localStorage.setItem('skosif_role_mode',JSON.stringify('admin'));
      sessionStorage.setItem('sqc-executive-synthetic-seeded','1');
    }
    sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1');
    window.__ciSinks={print:0,share:[]};
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
    Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{
      window.__ciSinks.share.push({title:payload.title||'',text:payload.text||'',files:await Promise.all((payload.files||[]).map(async f=>({name:f.name,text:await f.text()})))});
    }});
  },fixture(zero));
  const page=await context.newPage(), errors=[],downloads=[];
  page.setDefaultTimeout(12000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('download',d=>downloads.push(d));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.SK?.company?.ready()&&window.SKosifReportPack&&window.SKosifManagementSource&&window.SKosifSpace?.scopeSnapshot().status==='stable');
  await page.evaluate(()=>{SKosifShell.setPref('look','kosif');document.documentElement.dataset.theme='light';SKosifCore.go('execreports')});
  await page.locator('[data-rp="print"]').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.documentElement.dataset.domain==='reports');
  // PR124 preserves the route ID but moves it into the company-scoped reports studio.
  // Assert the real registry/banner rather than replacing company recognition in the fixture.
  assert.deepEqual(await page.evaluate(()=>{const cap=SK.caps.get('execreports');return{group:cap.group,company:cap.company,domain:document.documentElement.dataset.domain}}),{group:'reports',company:true,domain:'reports'});
  await page.locator('.sqc-space-bar').waitFor({state:'visible'});
  assert.ok((await page.locator('.sqc-space-bar').innerText()).includes(A.name));
  const build=await page.locator('meta[name="sqc-build"]').getAttribute('content');assert.match(build,/^[a-f0-9]{10}$/);
  // B is a synthetic IndexedDB snapshot, restored through the actual helper service.
  await page.evaluate(async ({co,book})=>{
    const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('sqc-spaces',1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('spaces'))q.result.createObjectStore('spaces')};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
    await new Promise((resolve,reject)=>{const tx=db.transaction('spaces','readwrite');tx.objectStore('spaces').put({ls:{skosif_ledger_v1:JSON.stringify(book),'aghnam-pricing-v3':JSON.stringify({raws:[],boxes:[],exps:[],settings:{biz:co.name,preparer:'Synthetic preparer'}}),skosif_demo_v1:JSON.stringify({off:true,sections:{},dismissed:true})},app:null,at:'2026-10-05T00:00:00Z'},'synthetic-report-user::'+co.id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();
  },{co:B,book:ledger(B)});
  return {context,page,errors,downloads,build};
}
async function withPage(fn,width=1280,zero=false) {
  const env=await openPage(width,zero);
  try { return await fn(env); }
  catch(e) {const file=`${out}/failure-${results.length+1}-${width}.png`;try{await env.page.screenshot({path:file,fullPage:true});record(file,'failure screenshot')}catch{}throw e;}
  finally {await env.context.close();}
}
async function report(page) {
  await page.locator('[data-rp="print"]').click();
  await page.frameLocator('.skout-f').locator('.rp-cover').waitFor();
  const element=await page.locator('.skout-f').elementHandle();
  return element.contentFrame();
}
async function inspect(frame,co=A,zero=false) {
  assert.equal(clean(await frame.locator('.rp-cover h1').innerText()),'مسودة تنفيذية محدودة');
  assert.equal(clean(await frame.locator('.rp-cover > p').innerText()),co.name);
  const meta=clean(await frame.locator('.rp-cover .meta').innerText());
  assert.ok(meta.includes(period.start)&&meta.includes(period.end)&&meta.includes(co.currency),meta);
  assert.equal(await frame.locator('meta[name="sqc-company"]').getAttribute('content'),co.id);
  assert.equal(await frame.locator('meta[name="sqc-period"]').getAttribute('content'),`${period.start}/${period.end}`);
  assert.match(await frame.locator('meta[name="sqc-source-sha256"]').getAttribute('content'),/^[a-f0-9]{64}$/);
  const tiles=await frame.locator('.rp-k > div').evaluateAll(ns=>Object.fromEntries(ns.map(n=>[n.querySelector('span').textContent.trim(),n.querySelector('b').textContent.trim()])));
  for(const [label,n] of [['إيرادات الدفاتر',co.revenue],['مصروفات الدفاتر',co.expense],['نتيجة الدفاتر',co.profit]])assert.equal(clean(tiles[label]),money(zero?0:n,co.currency),label);
  const rows=await frame.locator('.rp-books tbody tr').evaluateAll(ns=>ns.map(n=>[...n.cells].map(c=>c.textContent.trim())));
  for(const [account,debit,credit] of [['cash',co.cash,0],['equity',0,1000],['rev',0,co.revenue],['exp',co.expense,0]]){
    const row=rows.find(r=>r[0].includes(`${co.id}-${account}`));assert.ok(row,`missing ${account}`);
    assert.deepEqual(row.slice(1).map(clean),[money(zero?0:debit,co.currency),money(zero?0:credit,co.currency)]);
  }
  assert.deepEqual(rows.at(-1).slice(1).map(clean),[money(zero?0:co.total,co.currency),money(zero?0:co.total,co.currency)]);
  const unavailable=await frame.locator('[data-rp-unavailable]').evaluateAll(ns=>ns.map(n=>({heading:n.querySelector('h2').textContent,text:n.textContent,tables:n.querySelectorAll('table').length,kpis:n.querySelectorAll('.rp-k').length})));
  assert.deepEqual(unavailable.map(n=>n.heading),unsupported);
  for(const n of unavailable){assert.match(n.text,/غير متاح/);assert.match(n.text,/لا يعني ذلك/);assert.equal(n.tables,0);assert.equal(n.kpis,0)}
  const text=await frame.locator('body').innerText();noCanary(text);assert.ok(!text.includes(co.id===A.id?B.name:A.name));
  assert.ok(!text.includes('9,000.00'),'future period leaked');
  return {tiles,rows,unavailable:unavailable.map(n=>n.heading)};
}
async function noReport(page) {
  await page.locator('.skout').waitFor({state:'detached'});
  await page.waitForFunction(()=>!document.querySelector('.skout-f')?.contentDocument?.querySelector('.rp-cover'));
  assert.equal(await page.locator('.skpres').count(),0);
}
async function rawMemo(page, value='Changed source, same counts and totals') {
  await page.evaluate(({key,value})=>{const d=JSON.parse(localStorage.getItem(key));d.entries[0].memo=value;localStorage.setItem(key,JSON.stringify(d))},{key:K.ledger,value});
}
async function switchSameDocument(page,co) {
  const result=await page.evaluate(async c=>{
    const switched=await SKosifSpace.switchTo(c.id,c.name,{reload:false,demo:false});
    SK.company.reconcile();
    const before=SKosifSpace.scopeSnapshot(),selected=SK.company.setPeriod(c.period),after=SKosifSpace.scopeSnapshot();
    return {switched,before,selected,after,company:SK.company.current().id};
  },co);
  assert.equal(result.switched,true);assert.equal(result.before.status,'unknown','switch must drop previous active period');
  assert.equal(result.selected,true);assert.equal(result.after.status,'stable');assert.equal(result.company,co.id);
  return result;
}
async function gateCapture(page) {
  await page.evaluate(()=>{
    const actual=window.SKosifManagementSource;window.__ciCaptureGates=[];
    window.SKosifManagementSource={...actual,capture:async(...args)=>{const result=await actual.capture(...args);await new Promise(resolve=>window.__ciCaptureGates.push({resolve,result}));return result}};
  });
}
async function startCapture(page) {
  await page.evaluate(()=>{window.__ciPending=window.SKosifReportPack.print()});
  await page.waitForFunction(()=>window.__ciCaptureGates?.length>0);
}
async function releaseCapture(page,index=0) {
  await page.evaluate(async i=>{window.__ciCaptureGates[i].resolve();await window.__ciPending},index);
}
async function armPrintCounter(page) {
  await page.evaluate(()=>{const w=document.querySelector('.skout-f').contentWindow;w.__skRealPrint=()=>window.__ciSinks.print++});
}
async function assertNoSink(env,beforePages=1) {
  await env.page.waitForTimeout(150);
  assert.equal(env.downloads.length,0,'stale download');
  assert.deepEqual(await env.page.evaluate(()=>window.__ciSinks),{print:0,share:[]},'stale print/share sink');
  assert.equal(env.context.pages().length,beforePages,'stale detached popup');
  await noReport(env.page);
}
function workbook(file) {
  const result=spawnSync('python3',['-c',String.raw`import json,sys,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]); ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ss=[]
if 'xl/sharedStrings.xml' in z.namelist():
 ss=[''.join(e.itertext()) for e in E.fromstring(z.read('xl/sharedStrings.xml'))]
out=[]
for name in sorted(x for x in z.namelist() if x.startswith('xl/worksheets/sheet') and x.endswith('.xml')):
 rows=[]
 for r in E.fromstring(z.read(name)).findall('.//s:row',ns):
  row=[]
  for c in r.findall('s:c',ns):
   t=c.get('t');v=c.find('s:v',ns);value=v.text if v is not None else ''
   if t=='s':value=ss[int(value)]
   if t=='inlineStr':value=''.join(c.find('s:is',ns).itertext())
   row.append(value)
  rows.append(row)
 out.append(rows)
print(json.dumps(out,ensure_ascii=False))`,file],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
}

try {
  await check('exact-head preview contains real modules and no private folder',async()=>{
    assert.equal(fs.existsSync('dist/secure'),false);
    const bundle=fs.readFileSync('dist/skosif.js','utf8');
    for(const file of sourcePaths.filter(p=>p.startsWith('ui/')&&p.endsWith('.js'))){
      assert.ok(bundle.includes(`/* ---- ${file} ---- */`),`missing module ${file}`);
      assert.ok(bundle.includes(fs.readFileSync(file,'utf8')),`bundle differs from exact source ${file}`);
    }
    const app=fs.readFileSync('dist/app-safe.html','utf8');
    assert.ok(app.includes('const SEED_B64 = "";'),'preview has no safe empty-seed marker');
    const front=fs.readFileSync('dist/index.html','utf8');
    assert.ok(!front.includes('crypto.json')&&!front.includes('id="f"'),'private unlock form survived preview');
    return {bundleSHA256:sha256(bundle),previewSHA256:sha256(app),privateFolderAbsent:true};
  });

  for(const width of [320,390,1280])await check(`real controls, scoped paper and hand-calculated ledger at ${width}`,()=>withPage(async env=>{
    const {page}=env;
    const geometry=await page.locator('[data-rp="print"]').evaluate(b=>{const r=b.getBoundingClientRect();return{left:r.left,right:r.right,width:innerWidth,scroll:document.documentElement.scrollWidth}});
    assert.ok(geometry.left>=-1&&geometry.right<=width+1,JSON.stringify(geometry));
    assert.ok(geometry.scroll<=width+2,'whole app horizontally overflows');
    assert.equal(await page.locator('.rp-sec input').count(),9);
    await page.locator('.rp-sec input[value="tasks"]').uncheck();await page.locator('.rp-sec input[value="tasks"]').check();
    await page.locator('#rp-rev').fill('Synthetic reviewer edited');await page.locator('#rp-rev').blur();
    const frame=await report(page),evidence=await inspect(frame);
    assert.ok((await frame.locator('body').innerText()).includes('Synthetic reviewer edited'));
    for(const action of ['print','present','word','excel','html','share','window','close']){
      const button=page.locator(`[data-o="${action}"]`);assert.equal(await button.count(),1);
      await button.focus();assert.ok(await button.evaluate(b=>b===document.activeElement));
    }
    const screenshot=`${out}/limited-paper-${width}.png`;await page.screenshot({path:screenshot,fullPage:true});record(screenshot,'valid limited report and controls');
    const paperShot=`${out}/limited-paper-body-${width}.png`;await frame.locator('body').screenshot({path:paperShot});record(paperShot,'valid limited paper');
    await page.locator('[data-o="close"]').click();await page.locator('.skout').waitFor({state:'detached'});
    assert.deepEqual(env.errors,[],'runtime errors');
    return {build:env.build,geometry,...evidence};
  },width));

  await check('genuine zero from balanced reversals remains distinguishable from unavailable',()=>withPage(async({page})=>{
    const frame=await report(page);return inspect(frame,A,true);
  },1280,true));

  await check('actual company and period UI menus, SK.company.open reload, and B ledger identity',()=>withPage(async({page})=>{
    const reload=page.waitForEvent('load');
    await page.locator('#sk-tb-co').click();
    await page.locator(`.sk-menu [data-m="co"][data-id="${B.id}"]`).click();
    await reload;
    await page.waitForFunction(id=>window.SK?.company?.ready()&&SK.company.current().id===id,B.id);
    const before=await page.evaluate(()=>({scope:SKosifSpace.scopeSnapshot(),period:SK.company.current().period}));
    assert.equal(before.scope.status,'unknown');assert.equal(before.period,null);
    await page.evaluate(()=>SKosifCore.go('execreports'));
    await page.evaluate(()=>SKosifReportPack.print());await noReport(page);
    await page.locator('#sk-tb-pe').click();
    await page.locator(`.sk-menu [data-m="pe"][data-id="${B.period}"]`).click();
    assert.equal(await page.evaluate(()=>SK.company.current().period?.id),B.period);
    assert.equal(await page.evaluate(()=>SKosifSpace.scopeSnapshot().status),'stable');
    assert.ok((await page.locator('[data-rp-period]').innerText()).includes(period.start));
    const frame=await report(page),checked=await inspect(frame,B);
    return {periodRequired:true,...checked};
  }));

  await check('A to B to A real helper restoration invalidates the earlier A window',()=>withPage(async({page})=>{
    const frame=await report(page);await inspect(frame);
    await page.evaluate(()=>{window.__oldReport=document.querySelector('.skout-f').contentWindow;window.__oldDocument=window.__oldReport.document;window.__initialScope=SKosifSpace.scopeSnapshot().token});
    await switchSameDocument(page,B);await switchSameDocument(page,A);
    await noReport(page);
    const old=await page.evaluate(()=>({oldText:window.__oldDocument.documentElement?.textContent||'',initial:window.__initialScope,now:SKosifSpace.scopeSnapshot().token,scope:SKosifSpace.scopeSnapshot().status}));
    assert.equal(old.oldText,'');assert.notEqual(old.initial,old.now);assert.equal(old.scope,'stable');
    await page.evaluate(()=>SKosifCore.go('execreports'));await inspect(await report(page));
    // Closing the obsolete exact window must not close a newer A preview.
    await page.evaluate(()=>window.__oldReport.close());
    assert.equal(await page.frameLocator('.skout-f').locator('.rp-cover').count(),1);
    return {oldScopeInvalidated:true,newScopeStable:true};
  }));

  await check('unbound operational and global canaries never enter a limited report',()=>withPage(async({page})=>{
    await page.evaluate(canaries=>{
      const old=window.SKosifMetrics;window.__unboundCalls=[];
      window.SKosifMetrics={...old,
        risks:()=>{window.__unboundCalls.push('risks');return{risks:[{title:canaries[1],status:'open',likelihood:3,impact:3}],findings:[{title:canaries[2],status:'open',severity:'high'}]}},
        decisions:()=>{window.__unboundCalls.push('decisions');return[{title:canaries[3]}]},
        trend:async()=>{window.__unboundCalls.push('trend');return{tip:[canaries[5]],labels:[canaries[5]],s:[999999],p:[0],o:[0],net:[999999]}},
      };
      window.SKosifSalesIntel={...window.SKosifSalesIntel,snapshot:async()=>{window.__unboundCalls.push('sales');return{empty:false,customers:[{name:canaries[4]}]}}};
    },CANARIES);
    const reviewBefore=await page.evaluate(()=>localStorage.getItem('sqc_executive_independent_review_fixture'));
    const frame=await report(page);await inspect(frame);
    assert.deepEqual(await page.evaluate(()=>window.__unboundCalls),[],'pack must not query unbound APIs');
    assert.equal(await page.evaluate(()=>localStorage.getItem('sqc_executive_independent_review_fixture')),reviewBefore);
    return {unboundReadersCalled:0,independentFixtureUntouched:true};
  }));

  const invalidCases=[
    ['missing ledger',()=>localStorage.removeItem('skosif_ledger_v1')],
    ['empty journal',()=>{const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));d.entries=[];localStorage.setItem('skosif_ledger_v1',JSON.stringify(d))}],
    ['corrupt ledger JSON',()=>localStorage.setItem('skosif_ledger_v1','{broken')],
    ['unknown active period',()=>{const d=JSON.parse(localStorage.getItem('skosif_companies_v1'));d.active.periodId='missing';localStorage.setItem('skosif_companies_v1',JSON.stringify(d))}],
    ['legacy period without explicit company',()=>{const d=JSON.parse(localStorage.getItem('skosif_companies_v1'));delete d.periods[0].companyId;localStorage.setItem('skosif_companies_v1',JSON.stringify(d))}],
    ['invalid fiscal date',()=>{const d=JSON.parse(localStorage.getItem('skosif_companies_v1'));d.periods[0].startDate='2026-02-30';localStorage.setItem('skosif_companies_v1',JSON.stringify(d))}],
    ['reversed fiscal dates',()=>{const d=JSON.parse(localStorage.getItem('skosif_companies_v1'));d.periods[0].startDate='2026-12-31';d.periods[0].endDate='2026-01-01';localStorage.setItem('skosif_companies_v1',JSON.stringify(d))}],
    ['books versus real space mismatch',()=>{const d=JSON.parse(localStorage.getItem('skosif_companies_v1'));d.active={companyId:'synthetic-b',periodId:'period-b'};localStorage.setItem('skosif_companies_v1',JSON.stringify(d))}],
    ['business name versus company mismatch',()=>{const d=JSON.parse(localStorage.getItem('aghnam-pricing-v3'));d.settings.biz='Wrong Synthetic Business';SK.save('aghnam-pricing-v3',d)}],
  ];
  for(const [name,mutate] of invalidCases)await check(`fail closed: ${name}`,()=>withPage(async env=>{
    await env.page.evaluate(mutate);await env.page.evaluate(()=>SKosifReportPack.print());await noReport(env.page);
    assert.equal(env.downloads.length,0);return {rejected:true};
  }));

  await check('fail closed while the actual helper switch is busy',()=>withPage(async({page})=>{
    const evidence=await page.evaluate(async co=>{
      const pending=SKosifSpace.switchTo(co.id,co.name,{reload:false,demo:false});
      const busy=SKosifSpace.scopeSnapshot();await SKosifReportPack.print();await pending;
      return {busy,rendered:!!document.querySelector('.skout-f')?.contentDocument?.querySelector('.rp-cover')};
    },B);
    assert.equal(evidence.busy.status,'busy');assert.equal(evidence.rendered,false);return {busyRejected:true};
  }));

  await check('failed real IndexedDB switch taints the scope and blocks report capture',()=>withPage(async({page})=>{
    const evidence=await page.evaluate(async co=>{
      const actual=IDBFactory.prototype.open;IDBFactory.prototype.open=function(){throw new Error('Synthetic IDB failure')};
      let changed;try{changed=await SKosifSpace.switchTo(co.id,co.name,{reload:false,demo:false})}finally{IDBFactory.prototype.open=actual}
      const status=SKosifSpace.scopeSnapshot().status;await SKosifReportPack.print();return {changed,status};
    },B);
    assert.equal(evidence.changed,false);assert.equal(evidence.status,'tainted');await noReport(page);return evidence;
  }));

  for(const change of ['same-count source edit','period A to B to A','actual company switch'])await check(`in-flight capture rejected after ${change}`,()=>withPage(async env=>{
    const {page}=env;await gateCapture(page);await startCapture(page);
    if(change==='same-count source edit')await rawMemo(page);
    else if(change==='actual company switch')await switchSameDocument(page,B);
    else await page.evaluate(()=>{
      const d=SK.load('skosif_companies_v1',{});d.periods.push({id:'period-a-alt',companyId:'synthetic-a',startDate:'2025-01-01',endDate:'2025-12-31'});SK.save('skosif_companies_v1',d);
      SK.company.setPeriod('period-a-alt');SK.company.setPeriod('period-a');
    });
    await releaseCapture(page);await assertNoSink(env);return {lateCaptureSuppressed:true};
  }));

  await check('same source changed and restored through SK.save never revives an old capture',()=>withPage(async env=>{
    const {page}=env;await report(page);await armPrintCounter(page);
    const result=await page.evaluate(()=>{
      const original=localStorage.getItem('skosif_ledger_v1'),before=SKosifSpace.scopeSnapshot().token;
      const data=JSON.parse(original);data.entries[0].memo='Temporary source edit';SK.save('skosif_ledger_v1',data);
      SK.save('skosif_ledger_v1',JSON.parse(original));
      return {sameSource:localStorage.getItem('skosif_ledger_v1')===original,sameScope:SKosifSpace.scopeSnapshot().token===before};
    });
    assert.deepEqual(result,{sameSource:true,sameScope:true});await assertNoSink(env);return {...result,oldCaptureRevoked:true};
  }));

  await check('reverse completion and an old close cannot replace or close the newer report',()=>withPage(async({page})=>{
    await gateCapture(page);
    await page.evaluate(()=>{window.__ciFirst=SKosifReportPack.print()});await page.waitForFunction(()=>window.__ciCaptureGates.length===1);
    await page.evaluate(()=>{window.__ciFirstWindow=document.querySelector('.skout-f').contentWindow;window.__ciSecond=SKosifReportPack.print()});
    await page.waitForFunction(()=>window.__ciCaptureGates.length===2);
    await page.evaluate(async()=>{window.__ciCaptureGates[1].resolve();await window.__ciSecond});
    await page.frameLocator('.skout-f').locator('.rp-cover').waitFor();
    const currentFrame=await page.locator('.skout-f').elementHandle().then(h=>h.contentFrame());await inspect(currentFrame);
    await page.evaluate(async()=>{window.__ciCaptureGates[0].resolve();await window.__ciFirst;window.__ciFirstWindow.close()});
    assert.equal(await page.locator('.skout').count(),1);assert.equal(await page.frameLocator('.skout-f').locator('.rp-cover').count(),1);
    return {newestWins:true};
  }));

  for(const cancel of ['close','Escape','navigation away'])await check(`pending capture cannot resurrect after ${cancel}`,()=>withPage(async env=>{
    const {page}=env;await gateCapture(page);await startCapture(page);
    if(cancel==='close')await page.locator('[data-o="close"]').click();
    else if(cancel==='Escape')await page.keyboard.press('Escape');
    else await page.evaluate(()=>SKosifCore.go('dash'));
    // Actual app navigation closes its output; it does not use browser history.
    if(await page.evaluate(()=>!!window.__ciCaptureGates))await releaseCapture(page);
    await noReport(page);assert.equal(env.downloads.length,0);return {latePreviewAbsent:true};
  }));

  await check('persisted pagehide and pageshow events cannot resurrect a pending real capture',()=>withPage(async env=>{
    const {page}=env;await gateCapture(page);await startCapture(page);
    await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))});
    await releaseCapture(page);await assertNoSink(env);
    return {persistedLifecycleEventSimulation:true,actualBFCacheAvailabilityNotAssumed:true};
  }));

  await check('genuine browser Back and Forward cannot resume a cancelled pending preview',()=>withPage(async env=>{
    const {page}=env;
    await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SK?.company?.ready()&&window.SKosifReportPack);
    await page.evaluate(()=>SKosifCore.go('execreports'));
    await gateCapture(page);await startCapture(page);
    await page.goBack({waitUntil:'domcontentloaded'});
    assert.equal(new URL(page.url()).pathname,'/index.html');await noReport(page);
    await page.goForward({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SK?.company?.ready()&&window.SKosifReportPack);
    // If the engine restores the prior JS realm, resolve only the synthetic pending gate.
    // If it reloads the document, there is no old operation to resume.
    if(await page.evaluate(()=>!!window.__ciCaptureGates?.length))await releaseCapture(page);
    await noReport(page);assert.equal(env.downloads.length,0);
    return {browserBack:true,browserForward:true,latePreviewAbsent:true};
  }));

  for(const action of ['print','word','excel','html','share','present','window'])await check(`same-count source mutation blocks stale ${action}`,()=>withPage(async env=>{
    const {page}=env;await report(page);await armPrintCounter(page);
    const before=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));return{count:d.entries.length,amounts:d.entries.flatMap(e=>e.lines.map(l=>[l.debit,l.credit]))}});
    // Mutation and click are one JS task: no polling/event invalidation may mask the action boundary.
    await page.evaluate(a=>{
      const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));d.entries[0].memo='Same totals changed source';localStorage.setItem('skosif_ledger_v1',JSON.stringify(d));
      document.querySelector(`[data-o="${a}"]`).click();
    },action);
    await assertNoSink(env);
    const after=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));return{count:d.entries.length,amounts:d.entries.flatMap(e=>e.lines.map(l=>[l.debit,l.credit]))}});
    assert.deepEqual(after,before);return {sameCountsAndAmounts:true,blocked:action};
  }));

  for(const action of ['print','word','excel','html','share','present','window'])await check(`async freshness rechecks before ${action} issuance`,()=>withPage(async env=>{
    const {page}=env;await report(page);await armPrintCounter(page);
    await page.evaluate(()=>{
      const actual=window.SKosifManagementSource;window.__ciFreshRelease=null;
      window.SKosifManagementSource={...actual,checkFresh:async(...args)=>{const checked=await actual.checkFresh(...args);await new Promise(resolve=>window.__ciFreshRelease=resolve);return checked}};
    });
    await page.locator(`[data-o="${action}"]`).click();await page.waitForFunction(()=>!!window.__ciFreshRelease);
    await rawMemo(page,'Changed only after actual freshness hash completed');await page.evaluate(()=>window.__ciFreshRelease());
    await assertNoSink(env);return {asyncBoundaryBlocked:action};
  }));

  for(const action of ['word','excel','html','share','window'])await check(`source mutation inside real serialization blocks ${action}`,()=>withPage(async env=>{
    const {page}=env;await report(page);await armPrintCounter(page);
    await page.evaluate(a=>{
      const mutate=()=>{const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));d.entries[0].memo='Changed inside final serializer';localStorage.setItem('skosif_ledger_v1',JSON.stringify(d))};
      if(a==='excel'){
        const actual=window.SKXlsx;window.SKXlsx={...actual,book:(...args)=>{const file=actual.book(...args);mutate();return file}};
      }else{
        const root=document.querySelector('.skout-f').contentDocument.documentElement,actual=root.cloneNode;
        root.cloneNode=function(...args){const clone=actual.apply(this,args);mutate();return clone};
      }
      document.querySelector(`[data-o="${a}"]`).click();
    },action);
    await assertNoSink(env);return {realSerializationCompleted:true,issuanceBlocked:action};
  }));

  await check('beforeprint listener survives actual document.open and removes stale DOM synchronously',()=>withPage(async({page})=>{
    await page.evaluate(()=>{
      window.__ciDocumentOpen=0;window.__ciEarlyPrint=0;
      const actual=window.open;window.open=function(...args){const w=actual.apply(this,args);w.addEventListener('beforeprint',()=>window.__ciEarlyPrint++);const open=w.document.open.bind(w.document);w.document.open=(...args)=>{window.__ciDocumentOpen++;return open(...args)};return w};
    });
    await report(page);
    const evidence=await page.evaluate(()=>{
      const w=document.querySelector('.skout-f').contentWindow,d=w.document;
      const before=!!d.querySelector('.rp-cover');
      const data=JSON.parse(localStorage.getItem('skosif_ledger_v1'));data.entries[0].memo='Raw beforeprint stale source';localStorage.setItem('skosif_ledger_v1',JSON.stringify(data));
      w.dispatchEvent(new w.Event('beforeprint'));
      return {before,opens:window.__ciDocumentOpen,early:window.__ciEarlyPrint,remaining:d.documentElement?.textContent||'',preview:!!document.querySelector('.skout')};
    });
    assert.equal(evidence.before,true);assert.ok(evidence.opens>=1);assert.equal(evidence.early,0,'document.open did not exercise event-reset boundary');
    assert.equal(evidence.remaining,'','stale raw DOM survived beforeprint');assert.equal(evidence.preview,false);return evidence;
  }));

  await check('host-window raw beforeprint also invalidates stale embedded paper',()=>withPage(async({page})=>{
    await report(page);
    const evidence=await page.evaluate(()=>{
      const d=document.querySelector('.skout-f').contentDocument;
      const source=JSON.parse(localStorage.getItem('skosif_ledger_v1'));source.entries[0].memo='Host beforeprint stale';localStorage.setItem('skosif_ledger_v1',JSON.stringify(source));
      window.dispatchEvent(new Event('beforeprint'));
      return {remaining:d.documentElement?.textContent||'',preview:!!document.querySelector('.skout')};
    });
    assert.equal(evidence.remaining,'');assert.equal(evidence.preview,false);return evidence;
  }));

  await check('detached native CI window is bound and blanks on raw beforeprint after source mutation',()=>withPage(async({page,context})=>{
    await report(page);
    const popupPromise=context.waitForEvent('page');await page.locator('[data-o="window"]').click();const popup=await popupPromise;
    await popup.locator('.rp-cover').waitFor();assert.equal(clean(await popup.locator('.rp-cover > p').innerText()),A.name);
    await popup.evaluate(()=>{window.opener.__ciDetached=window;window.opener.__ciDetachedDocument=document});
    const evidence=await page.evaluate(()=>{
      const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));d.entries[0].memo='Detached stale source';localStorage.setItem('skosif_ledger_v1',JSON.stringify(d));
      const w=window.__ciDetached;w.dispatchEvent(new w.Event('beforeprint'));
      return {remaining:window.__ciDetachedDocument.documentElement?.textContent||'',closed:w.closed};
    });
    assert.equal(evidence.remaining,'');assert.equal(evidence.closed,true);await noReport(page);return evidence;
  }));

  await check('active presentation ends when the real company changes',()=>withPage(async({page})=>{
    await report(page);await page.locator('[data-o="present"]').click();await page.frameLocator('.skpres-f').locator('.sl.on').waitFor();
    const before=await page.frameLocator('.skpres-f').locator('body').innerText();noCanary(before);assert.ok(before.includes(A.name));
    await switchSameDocument(page,B);await page.locator('.skpres').waitFor({state:'detached'});await noReport(page);return {presentationInvalidated:true};
  }));

  await check('actual HTML, Word and XLSX bytes retain captured identity, fiscal period and ledger values',()=>withPage(async({page,context})=>{
    const frame=await report(page),expected=await inspect(frame);const evidence={};
    const source=await frame.locator('meta[name="sqc-source-sha256"]').getAttribute('content');
    for(const format of ['html','word','excel']){
      const promise=page.waitForEvent('download');await page.locator(`[data-o="${format}"]`).click();const downloaded=await promise;
      assert.equal(downloaded.suggestedFilename(),`SQC-executive-${A.id}-${period.start}-${period.end}.${{html:'html',word:'doc',excel:'xlsx'}[format]}`);
      const file=`${out}/valid-a.${{html:'html',word:'doc',excel:'xlsx'}[format]}`;await downloaded.saveAs(file);record(file,`actual ${format} download`);
      assert.ok(fs.statSync(file).size>200);let text;
      if(format==='excel'){
        assert.equal(fs.readFileSync(file).subarray(0,2).toString(),'PK');const sheets=workbook(file);text=JSON.stringify(sheets);
        const book=sheets.find(rows=>rows.some(r=>r.some(c=>String(c).includes('synthetic-a-cash'))));assert.ok(book,'ledger worksheet absent');
        for(const row of expected.rows){
          const actual=book.find(r=>clean(r[0])===clean(row[0]));assert.ok(actual,`Excel lost ${row[0]}`);
          // Existing SKXlsx converts SAR-formatted amounts to numeric cells. Check numeric value,
          // not a false requirement that the browser's formatted currency text survives as text.
          for(const col of [1,2])assert.equal(Number(actual[col]),Number(clean(row[col]).replace(/,/g,'').replace(/ SAR$/,'')),`Excel amount changed for ${row[0]}`);
        }
        evidence.excel={sheets:sheets.length};
      }else{
        text=fs.readFileSync(file,'utf8');const downloadedPage=await context.newPage();await downloadedPage.setContent(text,{waitUntil:'domcontentloaded'});
        const actual=await inspect(downloadedPage);assert.deepEqual(actual.rows,expected.rows);await downloadedPage.close();
        assert.ok(text.includes(`content="${A.id}"`));
      }
      for(const s of [A.name,A.id,period.start,period.end,A.currency,source])assert.ok(text.includes(s),`${format} loses identity/source ${s}`);
      noCanary(text);evidence[format]={...evidence[format],filename:downloaded.suggestedFilename(),sha256:sha256(fs.readFileSync(file))};
    }
    // Synthetic recipient sink confirms what would be shared without sending it anywhere.
    await page.locator('[data-o="share"]').click();await page.waitForFunction(()=>window.__ciSinks.share.length===1);
    const shares=await page.evaluate(()=>window.__ciSinks.share);assert.equal(shares[0].files.length,1);
    noCanary(shares[0].files[0].text);assert.ok(shares[0].files[0].text.includes(source));assert.ok(shares[0].files[0].text.includes(A.name));
    return {...evidence,syntheticShareOnly:true};
  }));

  for(const capability of ['false','absent'])await check(`long guarded report blocks text-only share when canShare is ${capability}`,()=>withPage(async({page})=>{
    await page.evaluate(mode=>{
      const d=JSON.parse(localStorage.getItem('skosif_ledger_v1'));
      for(let i=0;i<90;i++)d.accounts.push({id:'long-'+i,code:String(7000+i),name:'SYNTHETIC LONG ACCOUNT '+String(i).padStart(3,'0')+' FOR SHARED REPORT PROVENANCE BOUNDARY',type:'expense',active:true});
      SK.save('skosif_ledger_v1',d);
      if(mode==='absent')Object.defineProperty(navigator,'canShare',{configurable:true,value:undefined});
      else Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});
    },capability);
    if(capability==='absent')assert.equal(await page.evaluate(()=>typeof navigator.canShare),'undefined');
    const frame=await report(page),text=await frame.locator('body').innerText();
    assert.ok(text.length>5000,'long report must exceed legacy 3000-character fallback');
    const binding=await frame.locator('meta[name="sqc-source-sha256"]').getAttribute('content');
    assert.ok(!text.slice(0,3000).includes(binding),'fixture must place source binding beyond the unsafe fallback');
    await page.locator('[data-o="share"]').click();await page.waitForTimeout(150);
    assert.deepEqual(await page.evaluate(()=>window.__ciSinks.share),[],'guarded text fallback must not send incomplete provenance');
    assert.equal(await frame.locator('.rp-cover').count(),1,'valid preview should remain available for HTML download');
    return {longCharacters:text.length,textOnlyShareBlocked:true};
  }));

  await check('native headless A4 PDF contains limited A identity and real ledger numbers',async()=>{
    const file=`${out}/valid-a.html`;assert.ok(fs.existsSync(file),'valid HTML download prerequisite failed');
    const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
    try{
      await context.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===origin||['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?route.continue():route.abort()});
      await page.setContent(fs.readFileSync(file,'utf8'),{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
      const pdf=`${out}/limited-a-A4.pdf`;await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:false});record(pdf,'native headless Chromium PDF, not physical print');
      assert.equal(fs.readFileSync(pdf).subarray(0,4).toString(),'%PDF');
      const info=spawnSync('pdfinfo',[pdf],{encoding:'utf8'});assert.equal(info.status,0,info.stderr);assert.match(info.stdout,/\(A4\)/);fs.writeFileSync(`${out}/pdfinfo.txt`,info.stdout);record(`${out}/pdfinfo.txt`,'native PDF size');
      const extracted=spawnSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8'});assert.equal(extracted.status,0,extracted.stderr);const text=clean(extracted.stdout);noCanary(text);
      for(const item of [A.name,'300.00','100.00','200.00','1,200.00','1,300.00'])assert.ok(text.includes(item),`PDF missing ${item}`);
      assert.ok(!text.includes(B.name));assert.ok(!text.includes('9,000.00'));
      fs.writeFileSync(`${out}/pdf-text.txt`,extracted.stdout);record(`${out}/pdf-text.txt`,'synthetic PDF extracted text');
      const render=spawnSync('pdftoppm',['-png','-scale-to','1200',pdf,`${out}/limited-a-page`],{encoding:'utf8'});assert.equal(render.status,0,render.stderr);
      for(const name of fs.readdirSync(out).filter(n=>/^limited-a-page-.*\.png$/.test(n)))record(`${out}/${name}`,'PDF raster page for visual review');
      return {nativePDF:true,physicalPrint:false};
    }finally{await context.close()}
  });
} finally {
  await browser.close();
  const summary=[`# Executive report context acceptance`, ``, `Tested head: ${head}`, ``, `${results.filter(r=>r.status==='pass').length} passed; ${failures.length} failed.`, ``, `## Cases`,...results.map(r=>`- ${r.status.toUpperCase()}: ${r.id}`),``,`## Exact sources`,...Object.entries(sources).map(([name,v])=>`- [${name}](${v.url}) — SHA-256 ${v.sha256}`),``,`## Artifacts`,...artifacts.map(a=>`- [${a.file}](${a.file}): ${a.role}; SHA-256 ${a.sha256}`),``,`## Limits`,...limits.map(l=>`- ${l}`),``].join('\n');
  fs.writeFileSync(`${out}/README.md`,summary);flush();
}
if(failures.length)process.exitCode=1;
