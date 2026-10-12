// Close management on screen (ui/features/month-close.js + ui/features/ledger.js posting guard): the checklist with
// owners, sign-offs and certified reconciliations, the period locks with their append-only log, one per-company storage
// key, and the ledger refusing a posting into a locked period with the engine's Arabic reason.
// The engine is imported from its TypeScript source (Node strips the types) so the test does not depend on a rebuilt engines.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const closeChecklist=await import('../app/src/engine/fusion/finance/close-checklist-engine.ts');
const HELPER_KEY=new Function('k','return '+read('ui/core/helper-space.js').match(/const HELPER_KEY=k=>([\s\S]*?); \/\* the original CRM/)[1]);

/* the books of a company that reconciled September fully: every system fact satisfied, the human tasks waiting */
function books(){
  return{accounts:[{id:'a1',code:'1100',name:'النقدية والبنوك',type:'asset'},{id:'a2',code:'1300',name:'المخزون',type:'asset'},{id:'a3',code:'4000',name:'إيرادات',type:'revenue'}],
    entries:[],lockDate:'',bank:{history:[{end:'2026-09-30'}]},count:{posted:true,date:'2026-09-28'}};
}
function loadModule(opts={}){
  const store={},audit=[];
  const SK={esc:s=>String(s??''),load:(k,d)=>store[k]===undefined?d:JSON.parse(JSON.stringify(store[k])),save:(k,v)=>{store[k]=JSON.parse(JSON.stringify(v));return true},money:v=>String(v),toast:()=>{},confirm:async()=>true,form:async()=>opts.form||null,
    audit:{log:(t,d)=>audit.push({t,...d})},perm:{label:()=>'المحاسب',role:()=>'accountant',list:()=>[{id:'admin',label:'مدير النظام'},{id:'accountant',label:'المحاسب'}]},company:{current:()=>({currency:'SAR'})},errors:{report:(e)=>{throw e}}};
  const d=books();
  const ledger={snapshot:()=>d,pending:()=>({total:0,oldest:null}),parties:()=>null,vat:()=>({settled:true,q:{due:'2026-10-31',label:'الربع الثالث'},r:{net:0}}),trialBalance:()=>({balanced:true,rows:[],totals:{debit:0,credit:0}}),
    trail:null,revenueRecon:null,lockTo:date=>{if(d.lockDate&&d.lockDate>=date)return false;d.lockDate=date;return true},unlockTo:date=>{d.lockDate=date||'';return true},open:()=>{},sendToReview:async()=>false};
  const doc={addEventListener:()=>{},querySelector:()=>null};
  const SKEngines={finance:{closeChecklist}};
  const ctx={window:{SK,SKEngines,SKosifLedger:ledger,SKosifSpace:{user:()=>({name:'سارة'})}},SK,SKEngines,setTimeout:()=>0,clearTimeout:()=>{},document:doc,console,Date,indexedDB:undefined};
  ctx.window.SKosifCore=null;ctx.window.SKosifClose=undefined;
  vm.runInNewContext(read('ui/features/month-close.js'),ctx);
  return{C:ctx.window.SKosifClose,store,audit,d};
}
const SEP='2026-09';

test('the checklist reads the books for system facts and waits for people on human tasks; one per-company key',()=>{
  const {C,store}=loadModule();
  assert.equal(HELPER_KEY(C.STORAGE_KEY),true,'the close state swaps with the company');
  const c=C.checklist(SEP),by=id=>c.tasks.find(t=>t.id===id);
  assert.equal(c.period.start,'2026-09-01');assert.equal(c.period.end,'2026-09-30');
  assert.equal(by('bank_recon').fact,true);assert.equal(by('bank_recon').status,'pending','reconciled but not certified');
  assert.equal(by('inventory_count').status,'done');assert.equal(by('vat_return').status,'done','September ends a quarter');
  assert.equal(by('ar_aging').status,'pending');assert.equal(by('ar_aging').owner,'accountant');assert.equal(by('management_review').owner,'admin');
  assert.equal(by('fx_revaluation').status,'na');assert.equal(by('depreciation').status,'na','no fixed-asset accounts in the chart');
  assert.equal(by('final_lock').status,'blocked');
  assert.equal(Object.keys(store).length,0,'reading writes nothing');
});

test('owner, sign-off and certification are stored under the one key and change the engine statuses',()=>{
  const {C,store,audit}=loadModule();
  C.setOwner(SEP,'ar_aging','admin');
  assert.equal(C.checklist(SEP).tasks.find(t=>t.id==='ar_aging').owner,'admin');
  for(const id of ['ar_aging','ap_aging','accruals','management_review']){const r=C.sign(SEP,id,'لا فروق','خالد','2026-10-05T09:00:00Z');assert.equal(r.ok,true,id)}
  assert.equal(C.sign(SEP,'bank_recon','x').ok,false,'a system task is not signed by hand');
  assert.equal(C.sign(SEP,'fx_revaluation','x').ok,false,'an na task is not signed');
  const cert=C.certify(SEP,'bank_recon','b'.repeat(64),'سارة','2026-10-03T09:00:00Z','كشف سبتمبر.pdf');
  assert.equal(cert.ok,true);assert.equal(C.certify(SEP,'bank_recon','nothex').ok,false);
  const s=store[C.STORAGE_KEY];
  assert.deepEqual(Object.keys(s).sort(),['certifications','lock','owners','signOffs']);
  assert.equal(s.owners[SEP].ar_aging,'admin');assert.equal(s.signOffs[SEP].ar_aging.who,'خالد');assert.equal(s.signOffs[SEP].ar_aging.role,'accountant');
  assert.equal(s.certifications[SEP].bank_recon.evidenceHash,'b'.repeat(64));assert.equal(s.certifications[SEP].bank_recon.note,'كشف سبتمبر.pdf');
  const R=C.readiness(SEP);
  assert.deepEqual([R.pct,R.done,R.of,R.ready,R.locked],[100,7,7,true,false]);
  assert.ok(audit.some(a=>a.t==='close'&&a.act==='signoff')&&audit.some(a=>a.t==='close'&&a.act==='certify'),'every decision is in the audit log');
  assert.equal(Object.keys(store).filter(k=>!HELPER_KEY(k)).length,0,'nothing is written outside the company');
});

test('the lock step waits for the checklist; lock and unlock keep an append-only log and the books\' lock date follows',()=>{
  const {C,store,d}=loadModule();
  assert.equal(C.steps(SEP).find(s=>s.id==='lock').act.disabled,true,'open checklist tasks block the final lock');
  const no=C.lock(SEP,'المدير','2026-10-12T08:00:00Z');
  assert.equal(no.ok,true,'the API locks regardless; the screen disables the button');
  const un=C.unlock(SEP,'المدير','','2026-10-12T08:05:00Z');assert.equal(un.ok,false);assert.equal(un.reason_ar,'سبب فتح الإقفال مطلوب');
  const u=C.unlock(SEP,'المدير','فاتورة مورد وصلت بعد الإقفال','2026-10-12T08:10:00Z');assert.equal(u.ok,true);
  assert.equal(d.lockDate,'2026-08-31','the single lock date steps back to the day before the period');
  for(const id of ['ar_aging','ap_aging','accruals','management_review'])C.sign(SEP,id,'',undefined,'2026-10-05T09:00:00Z');
  C.certify(SEP,'bank_recon','c'.repeat(64),undefined,'2026-10-03T09:00:00Z');
  assert.equal(C.steps(SEP).find(s=>s.id==='lock').act.disabled,false,'every sign-off and certification in: the lock step opens');
  const r=C.lock(SEP,'المدير','2026-10-12T09:00:00Z');assert.equal(r.ok,true);
  assert.equal(C.lock(SEP,'آخر','2026-10-12T09:30:00Z').ok,false,'locked once');
  assert.equal(d.lockDate,'2026-09-30');
  const log=C.lockLog();
  assert.deepEqual(log.map(e=>[e.seq,e.kind,e.who,e.reason]),[[1,'lock','المدير',undefined],[2,'unlock','المدير','فاتورة مورد وصلت بعد الإقفال'],[3,'lock','المدير',undefined]]);
  assert.deepEqual(store[C.STORAGE_KEY].lock.log.map(e=>e.seq),[1,2,3],'the log is persisted as written');
  assert.equal(C.steps(SEP).find(s=>s.id==='lock').st,'ok');
  assert.equal(C.readiness(SEP).locked,true);
});

test('the ledger refuses a posting into a locked period with the engine\'s Arabic reason, and accepts outside it',()=>{
  const {C}=loadModule();
  C.lock(SEP,'المدير','2026-10-12T09:00:00Z');
  assert.deepEqual(JSON.parse(JSON.stringify(C.canPost('2026-10-01'))),{ok:true});
  const r=C.canPost('2026-09-15');
  assert.equal(r.ok,false);assert.match(r.reason_ar,/2026-09-01 → 2026-09-30 مقفلة/);assert.match(r.reason_ar,/المدير/);
  /* ledger.js consults SKosifClose.canPost in its lock check and shows the reason */
  const lg=read('ui/features/ledger.js');
  assert.match(lg,/const periodLock=date=>\{[^\n]*SKosifClose[^\n]*canPost/);
  assert.match(lg,/const locked=\(d,date\)=>E\(\)\.ledger\.isPeriodLocked\(date,d\.lockDate\)\|\|!periodLock\(date\)\.ok/);
  assert.match(lg,/if\(locked\(d,date\)\)return \{ok:false,code:"LOCKED_PERIOD",error:lockWhy\(d,date\)\}/,'postEntry returns the reason');
  assert.match(lg,/if\(locked\(d,entry\.date\)\)\{err\.textContent=lockWhy\(d,entry\.date\)/,'the journal form shows the reason');
  assert.ok(!/التاريخ داخل فترة مقفلة \(حتى "\+d\.lockDate/.test(lg),'no screen prints the old lock-date-only message');
});

test('the checklist card renders tokens only: owner picker, sign-off, evidence file, ring, lock controls',()=>{
  const {C}=loadModule();
  const h=C.html();
  assert.match(h,/class="skcl-ring tone-\w+" style="--p:\d+"/);
  assert.match(h,/<select class="skcl-owner" data-cl-owner="ar_aging"/);assert.match(h,/<option value="accountant" selected>/);
  assert.match(h,/data-cl="sign" data-task="ar_aging"/);
  assert.match(h,/<input type="file" data-cl-file="bank_recon"/,'the reconciled bank waits for its evidence file');
  assert.match(h,/data-cl="plock" disabled/);
  assert.ok(!/#[0-9a-f]{3,6}\b|style="[^"]*(color|background)/i.test(h),'no literal colours');
  /* the close-management block only (.skcl-*), not the older .skclose-* rules the baseline already carries */
  const css=read('ui/ds/shell.css').split('\n').filter(l=>/^(\.skcl[ -]|@media \(max-width:620px\)\{\.skcl-)/.test(l)).join('\n');
  assert.ok(css.length>500&&!/#[0-9a-f]{3,6}\b|!important|:focus/.test(css),'tokens only, no !important, no :focus rules');
  for(const m of css.matchAll(/(?:padding|margin|gap|inset)[a-z-]*:\s*([^;}]*)/g))for(const v of m[1].matchAll(/(\d+)px/g))assert.equal(+v[1]%4,0,'4 px grid: '+m[0]);
});
