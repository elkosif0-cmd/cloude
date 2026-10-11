// Real generated engine and UI boundaries. Synthetic records only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=process.env.SOURCE_ROOT||fileURLToPath(new URL('../',import.meta.url));
const bundleContext={window:{}};vm.runInNewContext(fs.readFileSync(root+'/ui/core/engines.js','utf8'),bundleContext);
const S=bundleContext.window.SKEngines.sales.salesInsights;
const plain=x=>JSON.parse(JSON.stringify(x));
const L=(date,amount,extra={})=>({date,amount,qty:1,product:'A',customerId:'c',invoice:date,...extra});
const insight=(ls,o={})=>{const r=S.salesInsights(ls,[],{period:'30',...o});assert.equal(r.empty,false);return r};
test('R1 invalid month does not crash hub',()=>assert.doesNotThrow(()=>S.salesInsights([L('2026-09-30',100),L('2026-13-01',200)])));
test('R1 impossible dates are rejected, valid leap dates preserved and quality reconciles',()=>{
 const bad=['2026-13-01','2026-02-30','2026-02-29'];
 assert.deepEqual(plain(S.normalize(bad.map(d=>L(d,100)))),[]);
 assert.equal(S.normalize([L('2024-02-29',100)]).length,1);
 const r=insight([L('2026-02-28',100),L('2026-02-30',200),L('2026-03-01',300)]);
 assert.equal(r.kpis.revenue.cur,400);assert.equal(r.trend.values.reduce((a,b)=>a+b,0),400);assert.equal(r.quality.missingDate,1);
});
test('R3 return-only and zero-only data cannot form purchases or bundles',()=>{
 for(const amount of [-100,0]){const rows=[...Array.from({length:3},(_,i)=>['A','B'].map(product=>L('2026-09-01',amount,{invoice:'r'+i,product}))).flat(),...Array.from({length:3},(_,i)=>L('2026-09-01',amount,{invoice:'c'+i,product:'C'}))];
 const r=insight(rows);assert.equal(r.kpis.orders.cur,0);assert.equal(r.ordersInPeriod,0);assert.equal(r.weekdays.reduce((a,w)=>a+w.orders,0),0);assert.deepEqual(plain(r.pairs),[]);assert.ok(!r.recs.some(x=>x.id==='bundle'))}
});
test('R3 positive baskets exclude refunded or zero net products and denominator excludes returns',()=>{
 const rows=[...Array.from({length:3},(_,i)=>[L('2026-09-01',200,{invoice:'p'+i,product:'A'}),L('2026-09-01',100,{invoice:'p'+i,product:'B'}),L('2026-09-01',-100,{invoice:'p'+i,product:'B'}),L('2026-09-01',-50,{invoice:'p'+i,product:'C'})]).flat(),L('2026-09-01',-100,{invoice:'r',product:'A'})];
 const r=insight(rows);assert.equal(r.kpis.orders.cur,3);assert.equal(r.ordersInPeriod,3);assert.equal(r.multiItemOrders,0);assert.deepEqual(plain(r.pairs),[]);
 const good=insight([...Array.from({length:3},(_,i)=>['A','B'].map(product=>L('2026-09-01',100,{invoice:'p'+i,product}))).flat(),...Array.from({length:3},(_,i)=>L('2026-09-01',100,{invoice:'s'+i,product:'C'})),L('2026-09-01',-100,{invoice:'r',product:'A'})]);
 assert.equal(good.pairs[0].support,.5);assert.equal(good.pairs[0].lift,2);assert.equal(good.weekdays.reduce((a,w)=>a+w.orders,0),6);assert.ok(good.recs.some(x=>x.id==='bundle'));
});
test('R5 later credit stays in its transaction period',()=>{
 const r=insight([L('2026-08-31',1000,{invoice:'original'}),L('2026-09-10',-200,{invoice:'original'}),L('2026-09-30',100,{invoice:'other'})]);
 assert.equal(r.kpis.revenue.cur,-100);assert.equal(r.kpis.revenue.prev,1000);assert.equal(r.kpis.returns.cur,200);
 assert.equal(r.kpis.revenue.cur,r.products.reduce((a,p)=>a+p.revenue,0));assert.equal(r.kpis.revenue.cur,r.channelMix.reduce((a,p)=>a+p.revenue,0));assert.equal(r.kpis.revenue.cur,r.trend.values.reduce((a,b)=>a+b,0));
});
test('R5 split-date and multi-channel references preserve date and purchase identities',()=>{
 const r=insight([L('2026-09-01',100,{invoice:'same',channel:'one'}),L('2026-09-30',200,{invoice:'same',channel:'one'}),L('2026-09-30',300,{invoice:'same',channel:'two'})]);
 assert.equal(r.trend.values[0],100);assert.equal(r.trend.values.at(-1),500);assert.equal(r.kpis.orders.cur,3);assert.equal(r.products[0].orders,3);
 const normal=insight([L('2026-09-30',100,{invoice:'one',product:'A'}),L('2026-09-30',200,{invoice:'one',product:'B'})]);assert.equal(normal.kpis.orders.cur,1);assert.equal(normal.kpis.avgOrder.cur,300);
});
function ui(records,{includeHub=true}={}){
 const events=new Map(),hooks=[],saved=[],errors=[],notices=[];
 const host=()=>({innerHTML:'',removeAttribute(){}}),si=host(),slab=host();
 const ctx={console,setTimeout,clearTimeout,queueMicrotask,Intl,Date,Promise,TextEncoder,Blob,scrollY:0,scrollTo(){},
 CustomEvent:class {constructor(type,opts){this.type=type;this.detail=opts?.detail}},
 document:{addEventListener(type,fn){(events.get(type)||events.set(type,[]).get(type)).push(fn)},dispatchEvent(e){for(const f of events.get(e.type)||[])f(e)},querySelector:q=>q==='[data-si-host]'?si:q==='[data-slab-host]'?slab:null},
 SK:{esc:s=>String(s??''),load:()=>({}),save(...a){saved.push(a)},toast(...a){notices.push(a)},errors:{report(e){errors.push(e)}}},
 SKCharts:new Proxy({compact:v=>String(v)},{get:(o,k)=>o[k]||(()=> '')}),SKosifCore:{onView(v,fn){hooks.push(fn)}}};ctx.window=ctx;
 ctx.indexedDB={open(){const q={};queueMicrotask(()=>{q.result={objectStoreNames:{contains:s=>s in records},close(){},transaction(s){return{objectStore(){return{getAll(){const g={};queueMicrotask(()=>{g.result=structuredClone(records[s]);g.onsuccess()});return g}}}}}};q.onsuccess()});return q}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/ui/core/engines.js','utf8'),ctx);if(process.env.USE_SHIPPED_ENGINE!=='1')ctx.SKEngines.sales.salesInsights=S;
 if(includeHub){const code=fs.readFileSync(root+'/ui/features/sales-intel.js','utf8').replace(/\}\)\(\);\s*$/,'window.testSI={paint,workbook,mount,getState:()=>st,setState:v=>Object.assign(st,v)};})();');vm.runInContext(code,ctx)}
 const code=fs.readFileSync(root+'/ui/features/sales-lab.js','utf8').replace(/\}\)\(\);\s*$/,'window.testLab={paint,mount,pulse,setTab:v=>tab=v};})();');vm.runInContext(code,ctx);
 return {ctx,si,slab,saved,errors,notices,events,tick:()=>new Promise(r=>setTimeout(r,10)),root:{querySelector:q=>q.includes('data-si-host')?si:q.includes('data-slab-host')?slab:null}};
}
const records=()=>({sales_lines:[{date:'2026-09-01',amountHalalas:10000,id:'i1',customerId:'c1',source:'store',descriptionOriginal:'A'},{date:'2026-09-30',amountHalalas:20000,id:'i2',customerId:'c2',source:'store',descriptionOriginal:'B'}],customers:[{id:'c1',name:'Original',phone:'0500000001'},{id:'c2',name:'Other'}]});
test('R2 reopening replaces same-count/total identities, attribution and export data',async()=>{
 const rec=records(),u=ui(rec);await u.ctx.testSI.paint(true);rec.customers[0].name='Corrected';rec.customers[0].phone='0500000009';rec.sales_lines[0].amountHalalas=25000;rec.sales_lines[1].amountHalalas=5000;rec.sales_lines[0].source='corrected';rec.sales_lines[0].descriptionOriginal='Corrected product';
 u.ctx.testSI.mount(u.root);await u.tick();const r=u.ctx.SKosifSalesIntel.result(),c=r.customers.find(c=>c.id==='c1');assert.equal(c.name,'Corrected');assert.equal(c.phone,'0500000009');assert.equal(c.revenue,25000);assert.ok(r.channels.includes('corrected'));assert.ok(r.products.some(p=>p.name==='Corrected product'));
 const row=u.ctx.testSI.workbook(r)[2].rows.find(row=>row[0]==='Corrected');assert.equal(row[1],'0500000009');assert.equal(row[11],250);assert.equal(u.errors.length,0);
});
test('R4 lab uses exact hub forecast on initial mount, filters, reloads and tab changes',async()=>{
 const rec={sales_lines:Array.from({length:120},(_,i)=>['chA','chB'].map((source,j)=>({date:S.dayAdd('2026-01-01',i),amountHalalas:j?20000:10000,id:source+i,source,descriptionOriginal:'A'}))).flat(),customers:[]},u=ui(rec);
 u.ctx.testLab.mount(u.root);u.ctx.testSI.mount(u.root);await u.tick();
 const check=async()=>{await u.tick();const r=u.ctx.SKosifSalesIntel.result();assert.ok(u.slab.innerHTML.includes('توقع 30 يوماً'));assert.ok(u.slab.innerHTML.includes((r.forecast.total/100)+' ر.س'),u.slab.innerHTML.slice(0,800));const lab=await u.ctx.SKosifSalesLab.lab();assert.strictEqual(lab.forecast,r.forecast);assert.equal(lab.forecast.total,r.forecast.total);assert.deepEqual(plain(lab.forecast.daily),plain(r.forecast.daily));};
 await check();u.ctx.testSI.setState({channel:'chA'});await u.ctx.testSI.paint(false);await check();assert.equal(u.ctx.SKosifSalesIntel.result().forecast.total,300000);
 u.ctx.testSI.setState({period:'all'});await u.ctx.testSI.paint(false);await check();u.ctx.testSI.setState({channel:''});await u.ctx.testSI.paint(false);await check();assert.equal(u.ctx.SKosifSalesIntel.result().forecast.total,900000);
 rec.sales_lines.forEach(l=>l.amountHalalas*=2);await u.ctx.testSI.paint(true);await check();assert.equal(u.ctx.SKosifSalesIntel.result().forecast.total,1800000);
 u.ctx.testLab.setTab('stats');await u.ctx.testLab.paint(u.slab);u.ctx.testLab.setTab('pulse');await u.ctx.testLab.paint(u.slab);await check();assert.equal(u.errors.length,0);
});
test('R4 before hub ready the lab cannot display an independent forecast',async()=>{const u=ui(records());await u.ctx.testLab.paint(u.slab);assert.ok(!u.slab.innerHTML.includes('توقع 30 يوماً'));});
const cls=()=>({contains:()=>false,add(){},toggle(){}}),cell=v=>({textContent:v,querySelector:()=>null,classList:cls(),hasAttribute:()=>false});
function total(values,title='Amount',nosum=false,money=false){const ctx={SK:{$(){},$$(){return[]},esc:String,load(){},save(){}},window:{},document:{readyState:'loading',addEventListener(){}},setTimeout(){},clearTimeout(){}};vm.runInNewContext(fs.readFileSync(root+'/ui/components/table.js','utf8').replace('window.SKosifTable=Object.freeze({scan,','window.testTotals=totals;window.SKosifTable=Object.freeze({scan,'),ctx);const hs=[cell('Name'),cell(title)];hs[1].hasAttribute=()=>nosum;const orig=values.map(v=>{const td=cell(v);td.classList.contains=x=>money&&x==='money';return{cells:[cell('A'),td]}});const t={tHead:{rows:[{cells:hs}]},tFoot:null,_sktb:{orig},createTFoot(){const r={cells:[cell(''),cell('')]};return this.tFoot={classList:cls(),rows:[r],insertRow:()=>r}}};ctx.window.testTotals(t,orig,new Set());return t.tFoot?.rows[0].cells[1].textContent??null;}
test('R6 large money and quantity totals are independent of commas or signs',()=>{for(const title of ['Amount','المبلغ','Revenue','القيمة (ر.س)','Quantity','الكمية']){assert.equal(total(['100000000','200000000'],title),'300,000,000');assert.equal(total(['100,000,000','200,000,000'],title),'300,000,000');assert.equal(total(['100000000','-200000000'],title),'-100,000,000')}assert.equal(total(['100000000','200000000'],'Custom total',false,true),'300,000,000');});
test('R6 identifier and opt-out columns stay unsummed',()=>{for(const title of ['الجوال','phone','VAT number','ID','رقم الفاتورة','الإيقاع (يوم)'])assert.equal(total(['966500000001','966500000002'],title),null,title);assert.equal(total(['10','20'],'Amount',true),null);assert.equal(total(['966500000001','966500000002'],'Unknown'),null);});
async function entries(blob){const a=Buffer.from(await blob.arrayBuffer()),files={};let p=0;while(a.readUInt32LE(p)===0x04034b50){const n=a.readUInt16LE(p+26),x=a.readUInt16LE(p+28),z=a.readUInt32LE(p+18);files[a.subarray(p+30,p+30+n).toString()]=a.subarray(p+30+n+x,p+30+n+x+z).toString();p+=30+n+x+z}return files}
test('R7 actual sales workbook preserves phones as text and scores/counts/money numeric',async()=>{const u=ui(records());vm.runInContext(fs.readFileSync(root+'/ui/components/xlsx.js','utf8'),u.ctx);const r=S.salesInsights([L('2026-01-01',12345,{customerId:'c1'}),L('2026-09-30',25000,{customerId:'c2'})],[{id:'c1',phone:'0500000001'},{id:'c2',phone:'0500000002'}]);const files=await entries(u.ctx.SKXlsx.book(u.ctx.testSI.workbook(r)));const customer=files['xl/worksheets/sheet3.xml'],follow=files['xl/worksheets/sheet4.xml'];assert.match(customer,/<c r="B2" t="inlineStr"[^>]*><is><t[^>]*>0500000002/);for(const ref of ['E2','F2','G2','I2','K2','L2'])assert.match(customer,new RegExp('<c r="'+ref+'" s="3"><v>'));assert.match(follow,/<c r="G2" s="3"><v>123.45<\/v>/);assert.equal(Object.keys(files).filter(k=>k.startsWith('xl/worksheets/')).length,9);});
test('R7 whole-sheet text:true remains compatible and per-column option accepts numeric phones',async()=>{const u=ui(records());vm.runInContext(fs.readFileSync(root+'/ui/components/xlsx.js','utf8'),u.ctx);const f=await entries(u.ctx.SKXlsx.book([{name:'all',headers:['a','b'],rows:[[12,34]],text:true},{name:'col',headers:['phone','amount'],rows:[[966500000001,123.45]],text:[0]}]));assert.match(f['xl/worksheets/sheet1.xml'],/<c r="B2" t="inlineStr"/);assert.match(f['xl/worksheets/sheet2.xml'],/<c r="A2" t="inlineStr"/);assert.match(f['xl/worksheets/sheet2.xml'],/<c r="B2" s="3"><v>123.45/);});
test('R4 real filter events repaint both hosts and future-dated imports share asOf',async()=>{
 const rec={sales_lines:Array.from({length:120},(_,i)=>['A','B'].map((source,j)=>({date:S.dayAdd('2027-01-01',i),amountHalalas:j?20000:10000,id:source+i,source,descriptionOriginal:'A'}))).flat(),customers:[]},u=ui(rec);
 await u.ctx.testSI.paint(true);await u.tick();
 const ch={value:'A'},change={target:{closest:q=>q==='[data-si-ch]'?ch:null}};
 for(const fn of u.events.get('change')||[])fn(change);await u.tick();
 assert.equal(u.ctx.SKosifSalesIntel.result().forecast.total,300000);assert.match(u.slab.innerHTML,/3000 ر.س/);
 const button={dataset:{siPeriod:'all'}},click={target:{closest:q=>q==='[data-si-host]'?u.si:q==='button,a'?button:null}};
 for(const fn of u.events.get('click')||[])fn(click);await u.tick();const r=u.ctx.SKosifSalesIntel.result(),lab=await u.ctx.SKosifSalesLab.lab();
 assert.equal(r.period.key,'all');assert.equal(lab.asOf,r.asOf);assert.equal(r.asOf,'2027-04-30');assert.equal(lab.forecast.total,r.forecast.total);assert.equal(u.errors.length,0);
});
for(const period of ['30','90'])test('R4 review '+period+'-day selection preserves stable 30vs30 products and 60vs60 channels',async()=>{
 const rec={sales_lines:Array.from({length:120},(_,i)=>['A','B'].map((source,j)=>({date:S.dayAdd('2026-01-01',i),amountHalalas:j?20000:10000,id:source+i,source,descriptionOriginal:'Stable'}))).flat(),customers:[]},u=ui(rec);
 await u.ctx.testSI.paint(true);u.ctx.testSI.setState({period,channel:'A'});await u.ctx.testSI.paint(false);await u.tick();
 const r=u.ctx.SKosifSalesIntel.result(),lab=await u.ctx.SKosifSalesLab.lab();assert.equal(r.forecast.total,300000);assert.equal(lab.forecast.total,r.forecast.total);
 assert.deepEqual(plain(lab.momentum.risers),[]);assert.deepEqual(plain(lab.momentum.fallers),[]);
 const c=lab.channels.find(c=>c.name==='A');assert.equal(c.cur,600000);assert.equal(c.prev,600000);assert.equal(c.growth,0);
 u.ctx.testLab.setTab('momentum');await u.ctx.testLab.paint(u.slab);assert.match(u.slab.innerHTML,/آخر 60 يوماً مقابل الستين قبلها/);assert.ok(!u.slab.innerHTML.includes('Stable'));assert.match(u.slab.innerHTML,/كامل سجل القناة «A»/);assert.equal(u.errors.length,0);
});
test('R6 review tax amount headers remain summable while VAT number is an identifier',()=>{
 for(const title of ['VAT Amount','VAT total','VAT']){assert.equal(total(Array(8).fill('10'),title),'80');assert.equal(total(['100000000','200000000'],title),'300,000,000');assert.equal(total(['100000000','200000000'],title,false,true),'300,000,000')}
 assert.equal(total(['966500000001','966500000002'],'VAT number'),null);assert.equal(total(['966500000001','966500000002'],'VAT number',false,true),null);assert.equal(total(['966500000001','966500000002'],'VAT ID'),null);assert.equal(total(['966500000001','966500000002'],'VAT registration'),null);
});
for(const title of ['Debit','Credit','مدين','دائن','رصيد'])test('R6 review '+title+' sums large unsigned, formatted and signed amounts without money metadata',()=>{
 assert.equal(total(['100000000','200000000'],title),'300,000,000',title);assert.equal(total(['100,000,000','200,000,000'],title),'300,000,000',title);assert.equal(total(['100000000','-200000000'],title),'-100,000,000',title);
 assert.equal(total(['966500000001','966500000002'],'Tax ID'),null);assert.equal(total(['10','20'],'Debit',true),null);
});
test('P3 refresh resets removed channel using full valid source channels and shows Arabic notice once',async()=>{
 const rec=records(),u=ui(rec);await u.ctx.testSI.paint(true);u.ctx.testSI.setState({channel:'store',period:'30'});await u.ctx.testSI.paint(false);
 rec.sales_lines=[{date:'2026-09-30',amountHalalas:900,id:'new',source:'replacement',descriptionOriginal:'A'}, {date:'2026-13-01',amountHalalas:100,id:'bad',source:'store',descriptionOriginal:'A'}];
 await u.ctx.testSI.paint(true);const r=u.ctx.SKosifSalesIntel.result();assert.equal(u.ctx.testSI.getState().channel,'');assert.equal(r.empty,false);assert.equal(r.kpis.revenue.cur,900);assert.equal(r.channel,'');assert.deepEqual(plain(r.channels),['replacement']);
 assert.equal(u.saved.at(-1)[0],'sqc_salesintel_v1');assert.equal(u.saved.at(-1)[1].channel,'');assert.equal(u.notices.length,1);assert.match(u.notices[0][0],/القناة السابقة.*لم تعد متاحة/);assert.match(u.notices[0][0],/كل القنوات/);
 await u.ctx.testSI.paint(false);await u.ctx.testSI.paint(true);assert.equal(u.notices.length,1);assert.equal(u.errors.length,0);
});
test('P3 existing channel with zero purchases in selected period remains selected without notice',async()=>{
 const rec={sales_lines:[{date:'2026-01-01',amountHalalas:1000,id:'old',source:'quiet',descriptionOriginal:'A'},{date:'2026-09-30',amountHalalas:2000,id:'now',source:'active',descriptionOriginal:'A'}],customers:[]},u=ui(rec);
 await u.ctx.testSI.paint(true);u.ctx.testSI.setState({channel:'quiet',period:'30'});await u.ctx.testSI.paint(true);const r=u.ctx.SKosifSalesIntel.result();assert.equal(u.ctx.testSI.getState().channel,'quiet');assert.equal(r.channel,'quiet');assert.equal(r.kpis.orders.cur,0);assert.equal(r.kpis.revenue.cur,0);assert.ok(r.channels.includes('quiet'));assert.equal(u.notices.length,0);assert.equal(u.saved.length,0);assert.equal(u.errors.length,0);
});
test('P3 default all channels emits no reset notice on first load or refresh',async()=>{
 const u=ui(records());await u.ctx.testSI.paint(true);await u.ctx.testSI.paint(true);assert.equal(u.ctx.testSI.getState().channel,'');assert.equal(u.notices.length,0);assert.equal(u.saved.length,0);assert.equal(u.errors.length,0);
});
