// Sales Intelligence inside the executive reports: the churn radar and the board pack's «ذكاء المبيعات» section use
// the hub's own engine (SKosifSalesIntel.snapshot), so every screen shows the same customers and numbers.
// Real report-pack.js / reports.js / engines.js; synthetic records only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fixture,render,sections,headings,tables,readSource} from './mercury-report-harness.mjs';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const engines={window:{}};vm.runInNewContext(read('ui/core/engines.js'),engines);
const SKEngines=engines.window.SKEngines,S=SKEngines.sales.salesInsights;
const pack=readSource(new URL('ui/features/report-pack.js',root));

/* six customers with their own rhythms; c5 and c6 stopped buying, c4 is a slow monthly buyer who is on time */
const customers=[1,2,3,4,5,6].map(k=>({id:'c'+k,name:'عميل '+k,phone:'05000000'+k+k,city:'الرياض'}));
const lines=[];
const END='2026-09-30';
for(const [k,every,stop] of [[1,3,0],[2,5,0],[3,7,0],[4,30,0],[5,6,40],[6,4,75]])
  for(let d=0;d<=240;d+=every){if(d<stop)continue;const date=S.dayAdd(END,-d);
    lines.push({date,amount:10000*k,qty:1,product:k%2?'نعيمي':'حري',customerId:'c'+k,invoice:'i'+k+'-'+d,channel:k<4?'المتجر':'التطبيق'})}
const engine=(period='90')=>S.salesInsights(lines,customers,{period});
const nf0=new Intl.NumberFormat('ar-SA-u-nu-latn',{maximumFractionDigits:0});
const riyal=h=>nf0.format(Math.round(h/100))+' ر.س';
const hub=calls=>({SKEngines,SKosifSalesIntel:{snapshot:async(period='90')=>{calls.push(period);return engine(period)}}});
const salesSection=html=>{const a=html.indexOf('<h2>ذكاء المبيعات</h2>');return a<0?'':html.slice(a,html.indexOf('</section>',a))};

for(const range of [6,12])test(`pack: legacy ${range}-month choice cannot invoke unbound sales aggregates`,async()=>{
 const calls=[],f=fixture('populated');f.stores.skosif_report_pack_v1.range=range;
 const r=await render(pack,f,'kosif','light',hub(calls)),sec=salesSection(r.html);
 assert.deepEqual(calls,[]);assert.match(sec,/غير متاح/);assert.match(r.html,/2026-01-01/);assert.match(r.html,/2026-12-31/);
 assert.equal(tables(sec).length,0);assert.doesNotMatch(sec,/05\d{8}|9665\d{8}/);
});
test('pack: unticked sales section is neither consulted nor printed',async()=>{const calls=[],f=fixture('populated',sections);f.stores.skosif_report_pack_v1.seen=[...sections,'sales'];const r=await render(pack,f,'kosif','light',hub(calls));assert.deepEqual(calls,[]);assert.ok(!headings(r.html).includes('ذكاء المبيعات'));assert.match(r.controls,/value="sales"> ذكاء المبيعات/)});
test('pack: missing or empty sales hub remains explicitly unavailable',async()=>{for(const extra of [{},{SKEngines,SKosifSalesIntel:{snapshot:async()=>{assert.fail('unbound hub must not run')}}}]){const r=await render(pack,fixture('populated'),'kosif','light',extra);assert.match(salesSection(r.html),/غير متاح/);assert.equal(tables(salesSection(r.html)).length,0)}});

test('pack: an older saved choice gains the new sections but keeps what the owner unticked',async()=>{
  const f=fixture('populated');f.stores.skosif_report_pack_v1={range:6,sections:['summary','trend','findings','decisions','tasks','signoff'],reviewer:'',approver:''};
  const r=await render(pack,f);
  assert.match(r.controls,/value="risks"> المخاطر/,'risks stays unticked');
  assert.match(r.controls,/value="books" checked>/);assert.match(r.controls,/value="sales" checked>/);
});

/* reports.js as shipped, with its churn pieces exposed for the test */
function reports(snapshot){
  const code=read('ui/features/reports.js').replace(/\}\)\(\);\s*$/,'window.testReports={CH,churnHTML,waLink};})();');
  assert.notEqual(code,read('ui/features/reports.js'));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ctx={console,Intl,Date,Promise,queueMicrotask,setTimeout,SKEngines,
    SK:{$:()=>null,$$:()=>[],esc,num:Number,load:(k,d)=>d,save(){},money:v=>new Intl.NumberFormat('ar-SA-u-nu-latn',{maximumFractionDigits:2}).format(v)+' ر.س',csv(){},view(){},toast(){},errors:{report(e){throw e}}},
    SKosifSalesIntel:{snapshot},document:{getElementById:()=>null},localStorage:{getItem:()=>null}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);return ctx.testReports;
}

test('churn radar: the same follow-up list, counts and order as the sales engine',()=>{
  const R=reports(async()=>engine()),res=engine();R.CH.res=res;
  const html=R.churnHTML(),rows=[...html.matchAll(/<tr><td class="s"><b>(.*?)<\/b>/g)].map(m=>m[1]);
  assert.deepEqual(rows,[...res.followup.slice(0,40).map(c=>c.name)],'engine arrays come from the sandbox realm');
  const late=res.followup.filter(c=>c.status==='overdue').length;
  assert.match(html,new RegExp('متأخرون عن إيقاعهم</span><b>'+late+'</b>'));
  assert.match(html,new RegExp('حان موعدهم</span><b>'+(res.followup.length-late)+'</b>'));
  assert.ok(!rows.includes('عميل 4'),'a monthly buyer 0–30 days after a purchase is on time, not «churned»');
});

test('churn radar: loads through the hub, then shows the list',async()=>{
  let n=0;const R=reports(async()=>{n++;return engine()});
  assert.match(R.churnHTML(),/جارٍ قياس إيقاع كل عميل/);
  assert.equal(n,1);await new Promise(r=>setTimeout(r,0));
  assert.ok(R.CH.res&&!R.CH.loading);assert.match(R.churnHTML(),/<table class="t sk-churn">/);
});

test('churn radar: empty data and a missing hub say so instead of inventing numbers',()=>{
  const R=reports(async()=>engine());R.CH.res=S.salesInsights([],[],{period:'90'});
  assert.match(R.churnHTML(),/لا توجد مبيعات مؤرخة بعد/);
  const N=reports(undefined);
  assert.match(N.churnHTML(),/جارٍ قياس|يعتمد على شاشة/);
});

test('churn radar: WhatsApp links accept every common Saudi mobile form',()=>{
  const {waLink}=reports(async()=>engine());
  for(const p of ['0501234567','501234567','+966 50 123 4567','00966501234567','966501234567'])assert.equal(waLink(p),'https://wa.me/966501234567',p);
  assert.equal(waLink('123'),'');assert.equal(waLink(''),'');
  assert.equal(waLink('0501234567','مرحباً'),'https://wa.me/966501234567?text='+encodeURIComponent('مرحباً'));
});
