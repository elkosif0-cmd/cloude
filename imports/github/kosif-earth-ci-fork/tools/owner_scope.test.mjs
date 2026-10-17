// FOUNDATION §3.0 rules 1 and 12: the path that creates a company owns it (owner_scope FULL_ACCOUNTING · TOOLS_ONLY ·
// AUDIT_ONLY), and a company created in the tools entry never appears by itself as an accounting company.
// Before this guard the tools entry's «شركة جديدة» wrote into skosif_companies_v1 and the accounting menu listed it.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const company=readFileSync(new URL('../ui/core/company.js',import.meta.url),'utf8');
const helper=readFileSync(new URL('../ui/core/helper-space.js',import.meta.url),'utf8');
function app({books,gate='accounting',open='co-acc'}){
  const store=new Map([['skosif_companies_v1',JSON.stringify(books)]]);
  const space={current:()=>({id:open,name:open}),list:()=>[],busy:()=>false,intent:()=>Promise.resolve(false),switchTo:async()=>true,rename:()=>true};
  const ctx={console,JSON,Date,Object,Array,String,Math,setTimeout:(fn)=>fn(),
    localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    sessionStorage:{setItem(){},getItem:()=>null,removeItem(){}},
    document:{getElementById:()=>null},addEventListener(){},
    SK:{load:(k,d)=>{try{const v=JSON.parse(store.get(k)??'null');return v==null?d:v}catch{return d}},save:(k,v)=>{store.set(k,JSON.stringify(v));return true},
      bus:{on(){},emit(){}},ui:{uid:p=>p+'-new'},gate:{current:()=>gate},caps:{sector:id=>id==='trade'||id==='meat'}},
    SKosifSpace:space,SKosifCore:{setOrg:()=>false}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(company,ctx);
  return {SK:ctx.SK,books:()=>JSON.parse(store.get('skosif_companies_v1'))};
}
const books={active:{companyId:'co-acc'},periods:[],companies:[
  {id:'co-acc',name:'شركة المحاسبة',currency:'SAR',ownerScope:'FULL_ACCOUNTING'},
  {id:'co-old',name:'شركة قديمة',currency:'SAR'},
  {id:'co-tool',name:'مساحة أدوات',currency:'SAR',ownerScope:'TOOLS_ONLY'}]};

test('the accounting entry does not list a tools-owned company; a record from before the rule is an accounting company',()=>{
  const {SK}=app({books});
  const ids=SK.company.list().map(c=>c.id);
  assert.ok(ids.includes('co-acc')&&ids.includes('co-old'));
  assert.ok(!ids.includes('co-tool'),'TOOLS_ONLY stays out of the accounting menu');
  assert.equal(SK.company.scopeOf('co-old'),'FULL_ACCOUNTING');
  assert.equal(SK.company.current().ownerScope,'FULL_ACCOUNTING');
});

test('the tools entry sees every company (explicit linking stays possible) and the open company is always listed',()=>{
  assert.ok(app({books,gate:'tools'}).SK.company.list().some(c=>c.id==='co-tool'));
  const {SK}=app({books,open:'co-tool'});
  const open=SK.company.list().find(c=>c.open);
  assert.equal(open.id,'co-tool','the open company is never hidden — the context is not lost');
  assert.equal(SK.company.current().ownerScope,'TOOLS_ONLY');
});

test('a company created in the accounting entry is stamped FULL_ACCOUNTING',async()=>{
  const a=app({books});
  await a.SK.company.create('شركة جديدة','SAR','meat');
  const rec=a.books().companies.find(c=>c.id==='co-new');
  assert.equal(rec.ownerScope,'FULL_ACCOUNTING');
});

test('the tools entry stamps TOOLS_ONLY and the door\'s accounting creation stamps FULL_ACCOUNTING',()=>{
  assert.match(helper,/currency:v\.cur,ownerScope:"TOOLS_ONLY"\}/);
  assert.match(helper,/packPending:true,ownerScope:"FULL_ACCOUNTING"/);
  assert.match(helper,/gate!=="tools"\)\{cd\.companies\.push/,'the door never creates an accounting record from the tools entry');
});
