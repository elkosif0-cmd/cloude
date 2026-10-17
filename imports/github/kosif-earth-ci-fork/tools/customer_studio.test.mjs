// The customer studio shows the sales engine's own numbers (the same people, rhythm and segments the sales hub and
// the churn radar show) plus the core's orders and payments; this holds its model against both sources.
// Real engines.js and customer-flow.js; synthetic records only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const engines={window:{}};vm.runInNewContext(read('ui/core/engines.js'),engines);
const SKEngines=engines.window.SKEngines,S=SKEngines.sales.salesInsights;

/* four customers with their own rhythms; c3 stopped buying */
const END='2026-09-30';
const customers=[1,2,3,4].map(k=>({id:'c'+k,name:'عميل '+k,phone:'05000000'+k+k,city:'الرياض'}));
const lines=[],orders=[],payments=[];let n=0;
for(const [k,every,stop] of [[1,3,0],[2,7,0],[3,5,60],[4,30,0]])
  for(let d=0;d<=240;d+=every){if(d<stop)continue;const date=S.dayAdd(END,-d),id='o'+(++n),amount=10000*k;
    lines.push({date,amount:amount/100,amountHalalas:amount,qty:1,descriptionOriginal:k%2?'نعيمي':'حري',customerId:'c'+k,source:k<3?'المتجر':'التطبيق',ref:id});
    orders.push({id,externalOrderId:'R'+n,customerId:'c'+k,date,orderTotal:amount/100,status:'مكتمل',paymentStatus:d%2?'مدفوع':'غير مدفوع',paymentMethod:'نقدي',itemCount:1,source:k<3?'المتجر':'التطبيق'});
    if(d%2)payments.push({id:'p'+n,customerId:'c'+k,orderId:id,date,amount:amount/100,capturedAmount:amount/100,refundedAmount:d%4===1?10:0,status:'captured',method:'نقدي'})}
const res=S.salesInsights(lines.map(l=>({date:l.date,amount:l.amountHalalas,qty:l.qty,product:l.descriptionOriginal,customerId:l.customerId,invoice:l.ref,channel:l.source})),customers,{period:'all'});
const records=[{date:'2026-09-20',phone:'0500000011',source:'واتساب',order:'نعيمي',notes:'',got:true},{date:'2026-08-01',phone:'966500000011',source:'اتصال'},{date:'2026-09-01',phone:'0500000022',source:'زيارة المحل'}];

/* the module in a page-less context: SK with what it reads, no core, the engine on window and as a global */
function loadModule(){
  const store={};const SK={esc:s=>String(s??''),load:(k,d)=>store[k]??d,save:(k,v)=>{store[k]=v},icon:()=>'',ui:{state:{empty:()=>'',loading:()=>'',error:()=>''}},store:{idbAll:async()=>[]},view:()=>{},bus:{on:()=>{}},studio:{}};
  const ctx={window:{SKEngines,SK},SKEngines,SK,setTimeout,clearTimeout,console};
  vm.runInNewContext(read('ui/features/customer-flow.js'),ctx);
  return ctx.window.SKosifCustomerFlow;
}
const data={res,orders,payments,lines,records};

test("the studio's person is the engine's follow-up entry when the customer is due, else the engine's customer with the same rhythm formulas",()=>{
  const F=loadModule();
  assert.ok(res.followup.length&&res.followup.length<res.customers.length,'the fixture has both kinds');
  for(const c of customers){const m=F.model(data,c.id),e=res.followup.find(x=>x.id===c.id),p=res.customers.find(x=>x.id===c.id);
    assert.ok(m&&p,c.id);
    if(e)assert.equal(m.person,e,c.id+' is the follow-up entry itself');
    else{const cad=p.cadence??res.typicalCadence;
      assert.equal(m.person.status,'ok');assert.equal(m.person.orders,p.orders);assert.equal(m.person.revenue,p.revenue);assert.equal(m.person.segment,p.segment);
      assert.equal(m.person.cadenceUsed,Math.round(cad*10)/10);assert.equal(m.person.expected,S.dayAdd(p.last,Math.round(cad)));assert.equal(m.person.monthlyValue,Math.round(p.avgOrder*(30/Math.max(7,cad))))}}
  assert.equal(F.model(data,'nobody'),null);
});

test("orders, receivables and payments come from the core's records, per customer",()=>{
  const F=loadModule(),m=F.model(data,'c2');
  const mine=orders.filter(o=>o.customerId==='c2');
  assert.equal(m.orders.length,mine.length);assert.equal(m.orders[0].date,mine.map(o=>o.date).sort().reverse()[0],'newest first');
  const unpaid=mine.filter(o=>o.paymentStatus==='غير مدفوع');
  assert.equal(m.unpaid.length,unpaid.length);assert.equal(m.outstanding,unpaid.reduce((s,o)=>s+o.orderTotal,0));
  const pays=payments.filter(p=>p.customerId==='c2');
  assert.equal(m.paid,pays.reduce((s,p)=>s+p.capturedAmount,0));assert.equal(m.refunded,pays.reduce((s,p)=>s+p.refundedAmount,0));
  assert.ok(m.checks.some(c=>c.level==='bad'&&c.text.includes(String(unpaid.length))),'the unpaid orders are a control');
});

test('products, channel and contacts: the lines, the orders and the follow-up log, matched by phone in any form',()=>{
  const F=loadModule(),m=F.model(data,'c1');
  assert.deepEqual(Array.from(m.products,p=>p.name),['نعيمي']);assert.equal(m.products[0].amount,lines.filter(l=>l.customerId==='c1').reduce((s,l)=>s+l.amountHalalas,0));
  assert.deepEqual(JSON.parse(JSON.stringify(m.channels)),[['المتجر',orders.filter(o=>o.customerId==='c1').length]]);
  assert.deepEqual(Array.from(m.contacts,c=>c.date),['2026-09-20','2026-08-01'],'966… and 05… are the same phone; newest first');
  assert.equal(F.model(data,'c4').contacts.length,0);
});

test("the rhythm controls follow the engine's status",()=>{
  const F=loadModule(),gone=F.model(data,'c3'),fine=F.model(data,'c1');
  assert.equal(gone.person.status,'overdue');assert.ok(gone.checks.some(c=>c.level==='warn'&&c.text.includes('تأخر')));
  assert.equal(fine.person.status,'ok');assert.ok(fine.checks.some(c=>c.level==='ok'));
});
