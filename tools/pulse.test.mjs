// نبض اليوم: today's figures come from the core's records, the call list from the sales engine's rhythm, and the
// month-close readiness band from the close steps — all pure, held here against hand-counted fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL(p,new URL('../',import.meta.url)),'utf8');
function load(){
  const SK={esc:s=>String(s??''),load:()=>({}),save:()=>{},store:{idbAll:async()=>[]},bus:{on:()=>{}},errors:{report:()=>{}}};
  const ctx={window:{SK},SK,setTimeout:()=>0,clearTimeout:()=>{},console,Date,Intl};ctx.window.SKosifCore=null;
  vm.runInNewContext(read('ui/features/pulse.js'),ctx);
  return ctx.window.SKosifPulse;
}
const T='2026-10-05';
const orders=[
  {id:'o1',date:T,orderTotal:120.5,status:'مكتمل',paymentStatus:'مدفوع'},
  {id:'o2',date:T+'T09:30:00Z',orderTotal:80,status:'مكتمل',paymentStatus:'غير مدفوع'},
  {id:'o3',date:T,orderTotal:999,status:'ملغي',paymentStatus:'غير مدفوع'},
  {id:'o4',date:'2026-10-01',orderTotal:50,status:'مكتمل',paymentStatus:'غير مدفوع'},
  {id:'o5',date:'2026-09-20',orderTotal:70,status:'مكتمل',paymentStatus:'مدفوع'},
];
const payments=[{date:T,capturedAmount:120.5,refundedAmount:0},{date:T,amount:30,refundedAmount:10},{date:'2026-10-04',capturedAmount:500}];

test('today: orders and revenue dated today, collection net of refunds, unpaid orders, the last seven days — cancellations never count',()=>{
  const P=load(),f=P.todayFigures(orders,payments,T);
  assert.deepEqual({...f},{orders:2,revenue:200.5,collected:140.5,unpaidCount:2,outstanding:130,week:250.5});
  assert.deepEqual({...P.todayFigures([],[],T)},{orders:0,revenue:0,collected:0,unpaidCount:0,outstanding:0,week:0});
});

test('the call list: due and overdue only, overdue first, the most valuable first, at most n',()=>{
  const P=load();
  const fu=[{id:'a',status:'ok',monthlyValue:900},{id:'b',status:'due',monthlyValue:100},{id:'c',status:'overdue',monthlyValue:50},{id:'d',status:'overdue',monthlyValue:500},{id:'e',status:'due',monthlyValue:400}];
  assert.deepEqual(Array.from(P.callList(fu),c=>c.id),['d','c','e','b']);
  assert.deepEqual(Array.from(P.callList(fu,2),c=>c.id),['d','c']);
  assert.equal(P.callList(null).length,0);
});

test('readiness: Ready when locked or all ok; Almost with one action; Blocked otherwise; At Risk when a deadline is within seven days',()=>{
  const P=load(),S=(...st)=>st.map((s,i)=>({id:i===st.length-1?'lock':'s'+i,title:'خطوة '+i,note:'ملاحظة '+i,st:s}));
  assert.equal(P.readiness(S('ok','ok','na','ok'),{today:T}).band,'ready');
  assert.equal(P.readiness(S('ok','warn','bad','ok'),{today:T}).band,'ready','a locked month is ready whatever its steps say');
  const almost=P.readiness(S('ok','warn','ok','warn'),{today:T});
  assert.equal(almost.band,'almost','the lock step itself is the outcome, not a blocker');assert.equal(almost.done,2);assert.equal(almost.of,4);assert.deepEqual(Array.from(almost.blockers,b=>b.id),['s1']);
  assert.equal(P.readiness(S('ok','warn','warn','bad'),{today:T}).band,'blocked');
  assert.equal(P.readiness(S('bad','ok','ok','bad'),{today:T}).band,'blocked');
  const risk=P.readiness(S('ok','warn','ok','warn'),{today:T,deadlines:[{id:'vat',label:'إقرار',due:'2026-10-10'},{id:'x',label:'بعيد',due:'2026-12-01'}]});
  assert.equal(risk.band,'atRisk');assert.equal(risk.next.id,'vat');assert.equal(risk.next.days,5);
  assert.equal(P.readiness(S('ok','warn','ok','warn'),{today:T,deadlines:[{id:'vat',label:'إقرار',due:'2026-10-20'}]}).band,'almost','a deadline 15 days away does not raise the alarm');
  assert.equal(P.readiness(S('ok','ok','ok','ok'),{today:T,deadlines:[{id:'vat',label:'إقرار',due:'2026-10-06'}]}).band,'ready','ready stays ready');
});
