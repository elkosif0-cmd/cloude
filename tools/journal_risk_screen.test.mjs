// «مخاطر القيود» scores every entry of the open company's books through SKEngines.audit.journalRisk and shows the
// distribution, the signal filter, the sortable table and Benford. This holds the screen module against the engine
// itself: the real TypeScript engine (Node strips the types), a ledger stub shaped like SKosifLedger, no core, no storage.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const journalRisk=await import(new URL('app/src/engine/fusion/audit/journal-risk-engine.ts',root));

/* a small company: system sales on weekdays, one manual suspense entry on a Friday, a duplicate pair, a reversal */
const accounts=[{id:'cash',code:'1100',name:'النقدية والبنوك',type:'asset'},{id:'rev',code:'4000',name:'إيرادات المبيعات',type:'revenue'},
  {id:'susp',code:'1990',name:'حساب معلّق',type:'asset'},{id:'exp',code:'6300',name:'مصروفات تشغيلية أخرى',type:'expense'}];
const sale=(id,date,amount)=>({id,date,source:'مبيعات',memo:'بيع '+id,reference:'INV-'+id,lines:[{accountId:'cash',debit:amount,credit:0},{accountId:'rev',debit:0,credit:amount}]});
const entries=[
  sale('s1','2025-03-10',1234.5),sale('s2','2025-03-11',2345.6),sale('s3','2025-03-12',3456.7),
  {id:'m1',date:'2025-03-14',source:'يدوي',memo:'تسوية فروق',lines:[{accountId:'susp',debit:50000,credit:0},{accountId:'cash',debit:0,credit:50000}]},
  sale('d1','2025-03-18',999),sale('d2','2025-03-19',999),
  {id:'r1',date:'2025-03-20',source:'عكس',memo:'عكس: بيع s1',reversalOf:'s1',lines:[{accountId:'cash',debit:0,credit:1234.5},{accountId:'rev',debit:1234.5,credit:0}]},
];
entries[0].reversedBy='r1';

/* the module in a page-less context: SK with what it reads, the engine on window, the ledger stub; the view is captured */
function loadModule({books=entries,lockDate='2025-03-31',charts=false}={}){
  const views={},saves=[],opened=[];
  const SK={esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money:v=>Number(v).toFixed(2)+' ر.س',icon:()=>'<svg></svg>',
    load:()=>{throw new Error('the screen must not read storage')},save:(k,v)=>{saves.push(k)},errors:{report:()=>{}},bus:{on:()=>{}},
    ui:{state:{empty:o=>'<div class="sks empty"><h3>'+o.title+'</h3></div>'}},view:(id,def)=>{views[id]=def}};
  const SKEngines={audit:{journalRisk}};
  const SKosifLedger={entries:()=>books,accounts:()=>accounts,lockDate:()=>lockDate,open:(tab,o)=>opened.push([tab,o])};
  const window={SK,SKEngines,SKosifLedger};
  if(charts)window.SKCharts={bars:o=>'<figure data-kind="bars" data-n="'+o.labels.length+'"></figure>',hbars:o=>'<figure data-kind="hbars" data-n="'+o.rows.length+'"></figure>'};
  const ctx={window,SK,SKEngines,SKosifLedger,SKCharts:window.SKCharts,Intl,console,setTimeout,clearTimeout};
  vm.runInNewContext(read('ui/features/journal-risk.js'),ctx);
  return{F:ctx.window.SKosifJournalRisk,views,saves,opened};
}
const src=()=>({entries,accounts,lockDate:'2025-03-31'});

test('the model scores every entry of the books through the engine — no sampling — with the lock date as the period end',()=>{
  const {F,views}=loadModule();
  assert.ok(views.journalrisk&&typeof views.journalrisk.render==='function','the screen registers its view');
  const m=F.model(src());
  assert.equal(m.scores.length,entries.length);
  assert.equal(m.options.periodEnd,'2025-03-31');
  assert.deepEqual(m.scores.map(s=>s.id),journalRisk.scoreEntries(entries,m.options).map(s=>s.id),'the same ranking as the engine');
  const m1=m.scores.find(s=>s.id==='m1');
  assert.deepEqual(m1.signals.map(s=>s.code),['MANUAL_ENTRY','ROUND_AMOUNT','SUSPENSE_ACCOUNT','WEEKEND_POSTING','SENSITIVE_TEXT']);
  assert.equal(m1.band,'high');
  assert.equal(m.summary.duplicateGroups.length,1);assert.deepEqual(m.summary.duplicateGroups[0].ids,['d1','d2']);
  assert.equal(m.scores.find(s=>s.id==='r1').signals.map(s=>s.code).join(),'REVERSAL');
});

test('rows: «حسب الإشارة» keeps only the entries carrying the signal; sorting follows the column and direction, ties by id',()=>{
  const {F}=loadModule();const m=F.model(src());
  assert.deepEqual(F.rows(m,{signal:'DUPLICATE',sort:'date',dir:1}).map(r=>r.id),['d1','d2']);
  assert.deepEqual(F.rows(m,{signal:'SUSPENSE_ACCOUNT',sort:'score',dir:-1}).map(r=>r.id),['m1']);
  const byAmount=F.rows(m,{signal:'',sort:'amount',dir:-1});
  assert.equal(byAmount[0].id,'m1');assert.equal(byAmount[byAmount.length-1].amount,999);
  assert.deepEqual(F.rows(m,{signal:'',sort:'score',dir:-1}).map(r=>r.id),m.scores.map(s=>s.id),'the default order is the engine order');
  assert.equal(F.rows(m,{signal:'NO_SUCH_SIGNAL',sort:'score',dir:-1}).length,0);
});

test('the overview shows the distribution, the counts per signal and the top entries with Arabic labels and no literal colours',()=>{
  const {F}=loadModule();const m=F.model(src());
  const h=F.html(m,{tab:'overview',signal:'',sort:'score',dir:-1,limit:50});
  assert.ok(h.includes('القيود المقيَّمة')&&h.includes(String(entries.length)));
  assert.ok(h.includes('نهاية الفترة: تاريخ الإقفال 2025-03-31'));
  for(const x of m.summary.bySignal)assert.ok(h.includes(x.label_ar),x.code+' labelled in Arabic');
  assert.ok(h.includes('data-jr-open="m1"'),'the top entry opens in the books');
  assert.ok(!/#[0-9a-f]{3,6}\b|rgb\(/i.test(h),'no literal colours in the markup');
  assert.ok(h.includes('jr-high')&&h.includes('jr-low'));
});

test('the entries tab carries one filter button per signal present plus «الكل», a sortable header per column, and pages at 50',()=>{
  const {F}=loadModule();const m=F.model(src());
  const h=F.html(m,{tab:'entries',signal:'',sort:'score',dir:-1,limit:50});
  const buttons=[...h.matchAll(/data-jr-sig="([A-Z_]*)"/g)].map(x=>x[1]);
  assert.deepEqual(buttons,['',...m.summary.bySignal.map(x=>x.code)]);
  for(const [k] of F.COLS)assert.ok(h.includes('data-jr-sort="'+k+'"'),k);
  assert.ok(h.includes('aria-sort="descending"'));
  const filtered=F.html(m,{tab:'entries',signal:'WEEKEND_POSTING',sort:'score',dir:-1,limit:50});
  assert.equal((filtered.match(/data-jr-row=/g)||[]).length,1);
  const many=Array.from({length:120},(_,i)=>sale('x'+i,'2025-03-1'+(i%7+1>7?1:(i%5)+1),100+i));
  const big=F.model({entries:many,accounts,lockDate:''});
  const page=F.html(big,{tab:'entries',signal:'',sort:'score',dir:-1,limit:50});
  assert.equal((page.match(/data-jr-row=/g)||[]).length,50);assert.ok(page.includes('data-jr-more'));
  assert.ok(F.html(big,{tab:'overview',signal:'',sort:'score',dir:-1,limit:50}).includes('لا تاريخ إقفال بعد'));
});

test('Benford: nine digits, the insufficiency note below 50 amounts, the chart component when present, a table when not',()=>{
  const {F}=loadModule();const m=F.model(src());
  const h=F.html(m,{tab:'benford',signal:'',sort:'score',dir:-1,limit:50});
  assert.ok(h.includes(journalRisk.BENFORD_AR.insufficient));
  assert.equal((h.match(/<tr><td>\d<\/td>/g)||[]).length,9,'the fallback table has a row per digit');
  assert.ok(h.includes('القيود المكررة')&&h.includes('data-jr-open="d2"'));
  const {F:Fc}=loadModule({charts:true});
  const hc=Fc.html(Fc.model(src()),{tab:'benford',signal:'',sort:'score',dir:-1,limit:50});
  assert.ok(hc.includes('data-kind="bars" data-n="9"'));
  const ov=Fc.html(Fc.model(src()),{tab:'overview',signal:'',sort:'score',dir:-1,limit:50});
  assert.ok(ov.includes('data-kind="hbars"'));
});

test('empty books give the empty state pointing to the ledger; a missing engine gives its own state; nothing is written to storage',()=>{
  const {F,saves}=loadModule({books:[]});
  const m=F.model({entries:[],accounts:[],lockDate:''});
  assert.equal(m.scores.length,0);
  assert.ok(F.html(m,{tab:'overview'}).includes('لا قيود في دفاتر هذه الشركة'));
  assert.ok(F.html(null,{tab:'overview'}).includes('غير محمَّل'));
  F.html(F.model(src()),{tab:'entries',signal:'',sort:'score',dir:-1,limit:50});
  assert.deepEqual(saves,[]);
});

test('render reads the ledger stub, paints into the node and opens an entry in the books on click',()=>{
  const {views,opened}=loadModule();
  let handler=null;
  const node={innerHTML:'',dataset:{},isConnected:true,clientWidth:900,addEventListener:(ev,fn)=>{if(ev==='click')handler=fn}};
  views.journalrisk.render(node);
  assert.ok(node.innerHTML.includes('القيود المقيَّمة'));
  assert.equal(node.dataset.bound,'1');
  handler({target:{closest:sel=>sel==='[data-jr-open]'?{dataset:{jrOpen:'m1'}}:null}});
  assert.deepEqual(JSON.parse(JSON.stringify(opened)),[['entries',{q:'m1'}]]);
  handler({target:{closest:sel=>sel==='[data-jr-tab]'?{dataset:{jrTab:'benford'}}:null}});
  assert.ok(node.innerHTML.includes('قانون بنفورد'));
});
