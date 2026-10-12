// SK.company (ui/core/company.js): the open space is the one company every screen shows; the books and the business
// name follow it; data that predates the service (periods without a company id, a brand-new device's unnamed space)
// is respected, never rewritten.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const src=readFileSync(new URL('../ui/core/company.js',import.meta.url),'utf8');
function app({space,books,biz='أغنام الوادي',rail=true,gate='accounting'}={}){
  const store=new Map();if(books)store.set('skosif_companies_v1',JSON.stringify(books));
  const org={biz};const events=[],setOrgCalls=[];
  const railEl={textContent:biz};
  const ctx={console,JSON,Date,Object,Array,String,Math,setTimeout:(fn)=>fn(),
    localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    document:{getElementById:id=>id==='biz-name'&&rail?railEl:null},
    addEventListener(){},
    SK:{gate:{current:()=>gate},load:(k,d)=>{try{const v=JSON.parse(store.get(k)??'null');return v==null?d:v}catch{return d}},save:(k,v)=>{store.set(k,JSON.stringify(v));return true},bus:{on(){},emit:(n,d)=>events.push([n,d])},ui:{uid:p=>p+'-x1'}},
    SKosifSpace:space,
    SKosifCore:{setOrg:(f,v)=>{setOrgCalls.push([f,v]);if(f==='biz'&&v&&v!==org.biz){org.biz=v;return true}return false}}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);
  return {ctx,store,org,events,setOrgCalls,rail:railEl,books:()=>JSON.parse(store.get('skosif_companies_v1')||'{}')};
}
const spaceOf=(id,name,extra={})=>({current:()=>({id,name,at:null}),list:()=>[{id,name}],busy:()=>false,intent:()=>Promise.resolve(false),switchTo:async()=>true,rename:()=>true,...extra});
const tick=()=>new Promise(r=>setImmediate(r));

test('the open space is the company; the books and the business name follow it',async()=>{
  const a=app({space:spaceOf('co-a','شركة ألف'),books:{active:{companyId:'co-b'},companies:[{id:'co-b',name:'شركة باء',currency:'SAR'}],periods:[]}});
  await tick();await tick();
  const c=a.ctx.SK.company.current();
  assert.equal(c.id,'co-a');assert.equal(c.name,'شركة ألف');
  assert.equal(a.books().active.companyId,'co-a','books follow the open space');
  assert.ok(a.books().companies.some(x=>x.id==='co-a'),'a books record is created for the open company');
  assert.equal(a.org.biz,'شركة ألف','business name follows');assert.equal(a.rail.textContent,'شركة ألف');
  assert.ok(a.ctx.SK.company.ready());
});

test('a period saved without a company id belongs to the open company and is never dropped',async()=>{
  const books={active:{companyId:'source-co',periodId:'source-period'},companies:[{id:'source-co',name:'شركة المصدر',currency:'SAR'}],periods:[{id:'source-period',label:'فترة',startDate:'2026-02-01',endDate:'2026-08-31'}]};
  const a=app({space:spaceOf('source-co','شركة المصدر'),books});
  await tick();await tick();
  assert.deepEqual(a.books().active,{companyId:'source-co',periodId:'source-period'},'the active period survives reconciliation');
  const c=a.ctx.SK.company.current();assert.equal(c.period&&c.period.startDate,'2026-02-01');assert.equal(c.periods.length,1);
});

test('a brand-new device\'s unnamed space is provisional: nothing is written to the books or the rail',async()=>{
  const a=app({space:spaceOf('space-main','الشركة الحالية'),books:undefined});
  await tick();await tick();
  assert.equal(a.ctx.SK.company.provisional(),true);
  assert.deepEqual(a.books(),{},'no books record for the provisional space');
  assert.deepEqual(a.setOrgCalls,[],'the business name is left to the demo company');assert.equal(a.rail.textContent,'أغنام الوادي');
});

test('rename changes the books, the space and the business name; setPeriod keeps the company',async()=>{
  const renamed=[];const a=app({space:spaceOf('co-a','شركة ألف',{rename:(id,n)=>{renamed.push([id,n]);return true}}),books:{active:{companyId:'co-a'},companies:[{id:'co-a',name:'شركة ألف',currency:'SAR'}],periods:[{id:'p1',companyId:'co-a',label:'2026',startDate:'2026-01-01',endDate:'2026-12-31'}]}});
  await tick();await tick();
  assert.equal(a.ctx.SK.company.rename('  شركة ألف الجديدة '),true);
  assert.equal(a.books().companies[0].name,'شركة ألف الجديدة');assert.deepEqual(renamed,[['co-a','شركة ألف الجديدة']]);assert.equal(a.org.biz,'شركة ألف الجديدة');
  assert.equal(a.ctx.SK.company.rename(''),false);
  assert.equal(a.ctx.SK.company.setPeriod('p1'),true);assert.deepEqual(a.books().active,{companyId:'co-a',periodId:'p1'});
  assert.equal(a.ctx.SK.company.setPeriod('nope'),false);
});

test('the private company is listed locked and opens only through the front door',async()=>{
  const a=app({space:spaceOf('demo-co','شركة الوادي التجريبية للحوم'),books:{active:{companyId:'demo-co'},companies:[{id:'demo-co',name:'شركة الوادي التجريبية للحوم'}],periods:[]}});
  a.store.set('sqc_private_space','space-main');a.ctx.location={href:''};
  await tick();await tick();
  const l=a.ctx.SK.company.list();const priv=l.find(x=>x.id==='space-main');
  assert.ok(priv&&priv.locked,'the private space is a locked entry');
  assert.equal(await a.ctx.SK.company.open('space-main'),false);assert.equal(a.ctx.location.href,'./','sent to the front door');
});

test('a brand-new tools space is registered TOOLS_ONLY, not silently upgraded to accounting',async()=>{
  const a=app({space:spaceOf('space-tools','أدوات فريق المراجعة'),books:undefined,gate:'tools'});
  await tick();await tick();
  assert.equal(a.ctx.SK.company.current().ownerScope,'TOOLS_ONLY');
  assert.equal(a.books().companies.find(c=>c.id==='space-tools')?.ownerScope,'TOOLS_ONLY');
  assert.equal(a.ctx.SK.company.list().find(c=>c.id==='space-tools')?.ownerScope,'TOOLS_ONLY');
});

test('existing explicit ownerScope survives opening via a different gate and a company rename',async()=>{
  const a=app({space:spaceOf('co-audit','شركة المراجعة'),gate:'accounting',
    books:{active:{companyId:'co-audit'},companies:[{id:'co-audit',name:'شركة المراجعة',ownerScope:'AUDIT_ONLY'}],periods:[]}});
  await tick();await tick();
  assert.equal(a.ctx.SK.company.current().ownerScope,'AUDIT_ONLY');
  assert.equal(a.ctx.SK.company.rename('ملف المراجعة الجديد'),true);
  assert.equal(a.books().companies[0].ownerScope,'AUDIT_ONLY');
  assert.equal(a.ctx.SK.company.current().ownerScope,'AUDIT_ONLY');
});

test('legacy reserved tools-home record without ownerScope is narrowly migrated to TOOLS_ONLY',async()=>{
  const a=app({space:spaceOf('space-tools','الأدوات'),gate:'tools',
    books:{active:{companyId:'space-tools'},companies:[{id:'space-tools',name:'الأدوات'}],periods:[]}});
  await tick();await tick();
  assert.equal(a.books().companies[0].ownerScope,'TOOLS_ONLY');
  assert.equal(a.ctx.SK.company.current().ownerScope,'TOOLS_ONLY');
});

test('reserved tools ID with explicit FULL_ACCOUNTING is never downgraded by opening tools',async()=>{
  const a=app({space:spaceOf('space-tools','ملف رئيسي'),gate:'tools',
    books:{active:{companyId:'space-tools'},companies:[{id:'space-tools',name:'ملف رئيسي',ownerScope:'FULL_ACCOUNTING'}],periods:[]}});
  await tick();await tick();
  assert.equal(a.books().companies[0].ownerScope,'FULL_ACCOUNTING');
  assert.equal(a.ctx.SK.company.current().ownerScope,'FULL_ACCOUNTING');
});

test('audit-only unregistered company remains audit-only when metadata creates its books record',async()=>{
  const a=app({space:spaceOf('co-audit','ملف مراجعة'),gate:'audit',books:undefined});
  await tick();await tick();
  assert.equal(a.ctx.SK.company.current().ownerScope,'AUDIT_ONLY');
  const next=a.books();next.companies=[];a.store.set('skosif_companies_v1',JSON.stringify(next));
  assert.equal(a.ctx.SK.company.updateMeta({currency:'EGP',country:'EG'}),true);
  assert.equal(a.books().companies.find(x=>x.id==='co-audit')?.ownerScope,'AUDIT_ONLY');
});
