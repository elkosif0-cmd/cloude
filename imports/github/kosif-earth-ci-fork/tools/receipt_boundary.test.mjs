import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

// Synthetic data only. Execute the actual UI click handlers and compiled engines;
// replace only browser DOM/storage boundaries, with no network or real accounts.
const PUR='skosif_purchasing_v1', LED='skosif_ledger_v1';
const clone=x=>structuredClone(x);
const plain=x=>JSON.parse(JSON.stringify(x));
const order=()=>({id:'po1',number:'PO-1',supplier:'Synthetic supplier',date:'2026-10-01',dueDate:'2026-10-31',status:'OPEN',value:600,
  lines:[{item:'A',qty:10,cost:50,vat:'0.15'},{item:'B',qty:5,cost:20,vat:'0.15'}]});
const receipt=qty=>({id:'rc1',orderId:'po1',date:'2026-10-02',status:'RECEIVED',lines:qty.map((q,i)=>({item:i?'B':'A',qty:q})),inspection:{overallStatus:'OK'}});
function harness(receipts=[]){
  const data={[PUR]:{orders:[order()],receipts:clone(receipts),prices:[]},[LED]:{entries:[],accounts:[['1300','asset'],['1400','asset'],['2100','liability']].map(([code,type])=>({id:'acc-'+code,code,type,name:code,active:true}))}};
  const views={},toasts=[],writes=[];let id=0;
  const root=()=>({dataset:{},listeners:{},fields:{},innerHTML:'',addEventListener(k,f){this.listeners[k]=f},querySelector(q){return this.fields[q]||null}});
  const SK={load:(k,d)=>clone(k in data?data[k]:d),save:(k,v)=>{writes.push(k);data[k]=clone(v)},esc:x=>String(x??''),money:String,vatRate:()=>0.15,vatPct:()=>'15٪',
    toast:(message,type)=>toasts.push({message,type}),$:(q,r)=>r.querySelector(q),view:(k,v)=>views[k]=v,
    ui:{uid:p=>p+'-'+(++id),validate:()=>true,tabs:()=>'',state:{empty:()=>''}}};
  const context=vm.createContext({SK,console,TextEncoder,TextDecoder,Uint8Array,Uint32Array,document:{addEventListener(){}},window:{}});
  for(const file of ['ui/core/engines.js','ui/features/purchasing.js','ui/features/ledger.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context,{filename:file});
  const purchasing=root(),ledger=root();views.purchasing.render(purchasing);views.ledger.render(ledger);
  const click=(r,attr,action)=>r.listeners.click({target:{closest:q=>q==='[data-'+attr+']'?{dataset:{[attr]:action}}:null}});
  return {data,toasts,writes,context,async saveReceipt(qty){
    purchasing.fields=Object.fromEntries(Object.entries({'#rc-po':'po1','#rc-inv':'4','#rc-act':'4','#rc-max':'4','#rc-tol':'2','#rc-temp':'','#rc-notes':'',
      '[data-rq="0"]':String(qty[0]),'[data-rq="1"]':String(qty[1])}).map(([k,value])=>[k,{value}]));
    await click(purchasing,'p','save-rc');
  },post:()=>click(ledger,'l','post-receipts')};
}

test('UI saves only positive partial lines, preserves full order variance, and posts exact journal once',async()=>{
  const h=harness(),before=clone(h.data[PUR].orders[0].lines);await h.saveReceipt([4,0]);
  const saved=h.data[PUR].receipts[0];assert.deepEqual(saved.lines,[{item:'A',qty:4}]);
  assert.deepEqual(h.data[PUR].orders[0].lines,before);assert.equal(h.data[PUR].orders[0].status,'PARTIAL');
  assert.deepEqual(saved.variances.map(x=>[x.itemId,x.orderedQty,x.receivedQty,x.status]),[['A',10,4,'SHORT'],['B',5,0,'SHORT']]);
  await h.post();assert.equal(h.data[LED].entries.length,1);
  assert.deepEqual(h.data[LED].entries[0].lines.map(l=>[l.accountId,l.debit,l.credit]),[['acc-1300',200,0],['acc-1400',30,0],['acc-2100',0,230]]);
  assert.equal(h.data[LED].entries[0].sourceId,'receipt:'+saved.id);
  await h.post();assert.equal(h.data[LED].entries.length,1);
});

for(const qty of [[0,0],[4,-1],[4,'NaN'],[4,'Infinity'],[4,'abc'],[4,'-Infinity']])test('UI rejects invalid or all-zero quantities '+JSON.stringify(qty)+' without any save',async()=>{
  const h=harness(),before=clone(h.data);await h.saveReceipt(qty);
  assert.deepEqual(h.data,before);assert.equal(h.writes.length,0);assert.equal(h.toasts.at(-1).type,'warn');
});

test('historical zero lines normalize at posting boundary without changing original records',async()=>{
  const h=harness([receipt([4,0])]),before=clone(h.data[PUR]);await h.post();
  assert.equal(h.data[LED].entries.length,1);assert.deepEqual(h.data[PUR],before);
  assert.deepEqual(h.data[LED].entries[0].lines.map(l=>[l.debit,l.credit]),[[200,0],[30,0],[0,230]]);
  await h.post();assert.equal(h.data[LED].entries.length,1);
});

for(const qty of [[0,0],[4,-1],[4,'NaN'],[4,Infinity],[4,'abc'],[4,-Infinity],[4,null],[4,''],[4,' '],[4,true],[4,undefined]])test('ledger rejects malformed or all-zero historical quantities '+String(qty),async()=>{
  const h=harness([receipt(qty)]),before=clone(h.data[PUR]);await h.post();
  assert.equal(h.data[LED].entries.length,0);assert.deepEqual(h.data[PUR],before);
  assert.equal(h.toasts.at(-1).type,'warn');assert.match(h.toasts.at(-1).message,/تُرك 1/);
});

test('valid single-line receipt retains stock, payable and journal amounts from the real engine',async()=>{
  const h=harness();await h.saveReceipt([4,0]);const r=h.data[PUR].receipts[0],o=h.data[PUR].orders[0];
  const b=h.context.window.SKEngines.procurement.procurementPosting.buildReceiptPosting({...o,supplierId:o.supplier,lines:o.lines.map(l=>({itemId:l.item,quantity:l.qty,unitCostExVat:l.cost,vatRate:Number(l.vat)}))},
    {id:r.id,number:r.id,date:r.date,purchaseOrderId:o.id,status:'DRAFT',lines:r.lines.map(l=>({itemId:l.item,quantity:l.qty}))},
    {inventoryAccountId:'acc-1300',inputVatAccountId:'acc-1400',payableAccountId:'acc-2100'});
  assert.deepEqual(plain(b.stockMovements).map(l=>[l.itemId,l.quantity,l.unitCost]),[['A',4,50]]);
  assert.equal(b.payable.amount,230);assert.equal(b.taxable,200);assert.equal(b.vat,30);
});

test('locked receipt stays unposted and can be retried after the date is open',async()=>{
  const h=harness([receipt([4,0])]);h.data[LED].lockDate='2026-10-31';await h.post();
  assert.equal(h.data[LED].entries.length,0);assert.match(h.toasts.at(-1).message,/فترة مقفلة/);
  h.data[LED].lockDate='';await h.post();assert.equal(h.data[LED].entries.length,1);
});

test('legacy numeric strings retain the supported quantity contract',async()=>{
  const h=harness([receipt(['4','0'])]);await h.post();
  assert.equal(h.data[LED].entries.length,1);assert.equal(h.data[LED].entries[0].lines[0].debit,200);
});

test('UI blank unreceived quantity keeps its zero meaning',async()=>{
  const h=harness();await h.saveReceipt([4,'']);
  assert.deepEqual(h.data[PUR].receipts[0].lines,[{item:'A',qty:4}]);
  assert.equal(h.data[PUR].orders[0].status,'PARTIAL');
});

test('full two-line delivery preserves order completion and exact amounts',async()=>{
  const h=harness();await h.saveReceipt([10,5]);
  assert.equal(h.data[PUR].orders[0].status,'RECEIVED');
  assert.deepEqual(h.data[PUR].receipts[0].lines,[{item:'A',qty:10},{item:'B',qty:5}]);
  await h.post();assert.deepEqual(h.data[LED].entries[0].lines.map(l=>[l.debit,l.credit]),[[600,0],[90,0],[0,690]]);
});
