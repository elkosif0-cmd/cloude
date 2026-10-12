// The bank statement screen (ui/features/bank-statement.js) over the real engine (app/src/engine/fusion/finance/
// bank-statement-engine.ts, bundled here with esbuild because engines.js is rebuilt by the integrator): an import lands
// under one per-company key, a re-import adds nothing, the lines feed the ledger's own statement card, the suggestions
// and the pulse counter follow the state, and the certification shape is what the close checklist reads.
// Synthetic lines only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const require=createRequire(path.join(root,'app/package.json'));
const esbuild=require('esbuild');
function bundle(entry){
  const out=esbuild.buildSync({entryPoints:[path.join(root,entry)],bundle:true,write:false,format:'cjs',platform:'node',target:'es2020',logLevel:'silent'});
  const m={exports:{}};new Function('module','exports','require',out.outputFiles[0].text)(m,m.exports,require);return m.exports;
}
const bankStatement=bundle('app/src/engine/fusion/finance/bank-statement-engine.ts');
const bankReconciliation=bundle('app/src/engine/fusion/finance/bank-reconciliation-engine.ts');

/* the per-company rule of helper-space: the screen's key must swap with the company */
const hs=read('ui/core/helper-space.js');
const HELPER_KEY=new Function('k','return '+hs.match(/const HELPER_KEY=k=>([\s\S]*?); \/\* the original CRM/)[1]);

const entries=[
  {id:'e1',date:'2026-05-01',reference:'INV-1001',memo:'تحصيل مطعم الوادي',lines:[{accountId:'cash',debit:1150,credit:0},{accountId:'ar',debit:0,credit:1150}]},
  {id:'e2',date:'2026-05-03',reference:'PO-77',memo:'سداد مورد الأعلاف',lines:[{accountId:'ap',debit:800,credit:0},{accountId:'cash',debit:0,credit:800}]},
  {id:'e3',date:'2026-05-09',reference:'INV-1002',lines:[{accountId:'cash',debit:400,credit:0},{accountId:'ar',debit:0,credit:400}]},
];
const ROWS=[
  ['مصرف الراجحي'],
  ['التاريخ','البيان','المرجع','مدين','دائن','الرصيد'],
  ['٠٢/٠٥/٢٠٢٦','حوالة واردة من مطعم الوادي INV-1001','TRX-1','','١٬١٥٠٫٠٠','١٬١٥٠٫٠٠'],
  ['٠٣/٠٥/٢٠٢٦','سداد مورد الأعلاف','TRX-2','٨٠٠٫٠٠','','٣٥٠٫٠٠'],
  ['٠٣/٠٥/٢٠٢٦','رسوم خدمات بنكية','FEE','٣٥','','٣١٥٫٠٠'],
];

/* the module in a page-less context: SK with what it reads, the engines, a ledger with a cash account, no core */
function loadModule(){
  const store={},events=[];
  const SK={$:(s,r)=>r&&r.querySelector?r.querySelector(s):null,esc:s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),
    load:(k,d)=>k in store?JSON.parse(store[k]):d,save:(k,v)=>{store[k]=JSON.stringify(v);return true},money:v=>Number(v).toFixed(2)+' ر.س',toast:()=>{},
    bus:{on:()=>{},emit:(n,e)=>events.push([n,e])},audit:{log:(c,e)=>events.push(['audit',c,e])},templates:{parse:()=>[]},perm:{label:()=>'المحاسب'}};
  const SKEngines={finance:{bankStatement,bankReconciliation}};
  const SKosifLedger={entries:()=>entries,accounts:()=>[{id:'cash',code:'1100',name:'النقدية والبنوك'},{id:'ar',code:'1200'},{id:'ap',code:'2100'}]};
  const SKosifSpace={user:()=>({id:'u1',name:'سارة'})};
  const ctx={window:{SK,SKEngines,SKosifLedger,SKosifSpace},SK,SKEngines,SKosifLedger,SKosifSpace,setTimeout,clearTimeout,console,Date};
  vm.runInNewContext(read('ui/features/bank-statement.js'),ctx);
  return {B:ctx.window.SKosifBankStatement,store,events};
}

test('the storage key is per company (HELPER_KEY) and is the one the module declares',()=>{
  const {B}=loadModule();
  assert.equal(B.KEY,'skosif_erp_bank_statement_v1');
  assert.equal(HELPER_KEY(B.KEY),true);
  assert.equal(HELPER_KEY('skosif_ledger_v1'),true);
});

test('an import lands under the key, a re-import adds nothing, and the lines feed the ledger statement card',()=>{
  const {B,store}=loadModule();
  const first=B.importRows(ROWS);
  assert.equal(first.added,3);assert.equal(first.duplicates,0);assert.equal(first.bank.guess,'alrajhi');
  const saved=JSON.parse(store[B.KEY]);
  assert.equal(saved.lines.length,3);assert.equal(saved.imports.length,1);
  assert.ok(saved.lines.every(l=>/^[0-9a-f]{24}$/.test(l.id)),'stable hashes');
  const again=B.importRows(ROWS);
  assert.equal(again.added,0);assert.equal(again.duplicates,3);
  assert.equal(JSON.parse(store[B.KEY]).lines.length,3);
  const ledger=JSON.parse(store.skosif_ledger_v1);
  assert.deepEqual(ledger.bank.lines.map(l=>[l.date,l.amount]),[['2026-05-02',1150],['2026-05-03',-800],['2026-05-03',-35]]);
  assert.equal(ledger.bank.closing,315);
  assert.deepEqual(ledger.bank.manual,[]);
  /* the ledger's own engine still reconciles from what was fed */
  const m=bankReconciliation.matchBankLines(ledger.bank.lines,bankReconciliation.bookCashLines(entries,'cash'),{days:5});
  assert.equal(m.matches.length,2);
});

test('the model proposes matches with a confidence and reasons, and the card draws them',()=>{
  const {B}=loadModule();
  B.importRows(ROWS);
  const s=B.state(),book=bankReconciliation.bookCashLines(entries,'cash'),m=B.model(s,book,'2026-05-10');
  assert.deepEqual(m.sugg.map(x=>x.kind),['reference','amount','fee']);
  assert.ok(m.sugg.every(x=>x.confidence>0&&x.confidence<=1&&x.reasons_ar.length));
  assert.equal(m.r.unmatchedBank.length,3);assert.equal(m.r.unmatchedBook.length,3);
  assert.equal(m.period,'2026-05');assert.equal(m.cert,null);
  const html=B.html(s,m,'2026-05-10');
  for(const t of ['كشف البنك والمطابقة المستمرة','اقتراحات المطابقة','في البنك بلا مطابقة','في الدفاتر بلا مطابقة','القواعد المتعلَّمة','اعتماد الفترة','data-bs="confirm"','data-bs="reject"','data-bs="certify"','data-bs-file','INV-1001'])assert.ok(html.includes(t),t);
  assert.ok(!/#[0-9a-f]{3,6}\b|!important|:focus/.test(html),'no literal colours or focus rules in the markup');
});

test('confirming through the engine, then certifying, is what the pulse counter and the close checklist read',()=>{
  const {B,store}=loadModule();
  B.importRows(ROWS);
  const E=bankStatement,book=bankReconciliation.bookCashLines(entries,'cash');
  let s=B.state();
  for(const x of B.model(s,book,'2026-05-10').sugg){s=E.applyConfirmation(s,x,'سارة','2026-05-10T08:00:00Z');s=E.learnRule(s,x,book,'2026-05-10T08:00:00Z')}
  store[B.KEY]=JSON.stringify(s);
  assert.equal(s.confirmed.length,3);assert.ok(s.rules.length>=2,'rules learned from the confirmations');
  let p=B.pulse();
  assert.equal(p.unmatched,1,'only e3 stays open');assert.equal(p.certifiedUntil,'');
  const c=E.certify(s,'2026-05','سارة','2026-06-01T07:00:00Z',undefined,book);
  store[B.KEY]=JSON.stringify(c.state);
  const cert=B.certification('2026-05');
  assert.deepEqual(Object.keys(cert).sort(),['evidenceHash','matched','period','range','ts','unmatchedCount','who']);
  assert.equal(cert.period,'2026-05');assert.equal(cert.who,'سارة');assert.equal(cert.ts,'2026-06-01T07:00:00Z');assert.equal(cert.unmatchedCount,1);
  assert.match(cert.evidenceHash,/^[0-9a-f]{64}$/);
  assert.equal(B.certification('2026-04'),null);
  p=B.pulse();
  assert.equal(p.certifiedUntil,'2026-05-31');assert.equal(p.unmatched,0,'May\'s open item is behind the certified date');assert.equal(p.tone,'ok');
});

test('a statement with no readable header saves nothing',()=>{
  const {B,store}=loadModule();
  const r=B.importRows([['a','b'],['1','2']]);
  assert.equal(r.added,0);assert.equal(JSON.parse(store[B.KEY]).lines.length,0);assert.ok(r.warnings_ar[0].includes('صف العناوين'));
});
