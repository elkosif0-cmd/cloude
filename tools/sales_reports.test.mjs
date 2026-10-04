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

test('pack: a 6-month pack prints the hub engine numbers for the last 90 days',async()=>{
  const calls=[],r=await render(pack,fixture('populated'),'kosif','light',hub(calls)),res=engine('90'),sec=salesSection(r.html);
  assert.deepEqual(calls,['90']);
  assert.ok(headings(r.html).includes('ذكاء المبيعات'));
  assert.ok(headings(r.html).indexOf('ذكاء المبيعات')>headings(r.html).indexOf('اتجاهات المبيعات والمشتريات'),'after the trend section');
  assert.ok(sec.includes(riyal(res.kpis.revenue.cur)),'net revenue');
  assert.ok(sec.includes(res.period.from)&&sec.includes(res.period.to),'period dates');
  assert.ok(sec.includes(res.health.score+' / 100'));
  const t=tables(sec);
  assert.equal(t.length,2,'recommendations and follow-up tables');
  assert.equal(t[0].length-1,Math.min(6,res.recs.length));
  assert.deepEqual(t[1].slice(1).map(row=>row[0]),[...res.followup.slice(0,10).map(c=>c.name)]);
  assert.ok(res.followup.some(c=>c.id==='c6'),'the stopped customer is followed up');
  assert.ok(!/05\d{8}|9665\d{8}/.test(sec),'a board document carries no phone numbers');
});

test('pack: a 12-month pack compares the last 12 months',async()=>{
  const calls=[],f=fixture('populated');f.stores.skosif_report_pack_v1.range=12;
  const r=await render(pack,f,'kosif','light',hub(calls));
  assert.deepEqual(calls,['365']);
  assert.ok(salesSection(r.html).includes(riyal(engine('365').kpis.revenue.cur)));
});

test('pack: an unticked sales section is neither computed nor printed',async()=>{
  const calls=[],f=fixture('populated',sections);f.stores.skosif_report_pack_v1.seen=[...sections,'sales'];
  const r=await render(pack,f,'kosif','light',hub(calls));
  assert.deepEqual(calls,[]);assert.ok(!headings(r.html).includes('ذكاء المبيعات'));
  assert.match(r.controls,/value="sales"> ذكاء المبيعات/);
});

test('pack: without the sales hub the pack is unchanged and has no sales heading',async()=>{
  const r=await render(pack,fixture('populated'));
  assert.ok(!headings(r.html).includes('ذكاء المبيعات'));
});

test('pack: no sales yet prints an honest note',async()=>{
  const extra={SKEngines,SKosifSalesIntel:{snapshot:async p=>S.salesInsights([],[],{period:p})}};
  const r=await render(pack,fixture('populated'),'kosif','light',extra);
  assert.ok(salesSection(r.html).includes('لا توجد مبيعات مستوردة بعد'));
});

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
