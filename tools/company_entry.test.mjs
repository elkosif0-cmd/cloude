// The company gallery (unlock.html, SQC's front door): what it lists, what it hands the app, and what it never shows.
// The reviewed unlock script stays byte-identical (tools/unlock_runtime.test.mjs pins it); this runs the gallery script.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../unlock.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,2,'the reviewed unlock script first, the gallery second');
const gallery=scripts[1];

function storage(init={}){const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),dump:()=>Object.fromEntries(m)}}
function page({locked=true,local={},session={},search='',hash=''}={}){
  const els={},handlers={};
  const el=(id,extra={})=>els[id]||(els[id]={id,innerHTML:'',hidden:false,textContent:'',value:'',focused:false,dataset:{},
    addEventListener(t,fn){(handlers[id+':'+t]=handlers[id+':'+t]||[]).push(fn)},focus(){this.focused=true},...extra});
  ['co-list','co-add','co-form','co-name','co-cancel','companies','locked','locked-t','locked-back','p'].forEach(id=>el(id));
  const body={dataset:{locked:locked?'1':'0',lockedName:'قصيف',lockedId:'co-private'}};
  const location={search,hash,href:''};
  const ctx=vm.createContext({console,JSON,Date,Math,String,Number,Object,Map,Set,localStorage:storage(local),sessionStorage:storage(session),location,
    document:{getElementById:id=>els[id]||null,body}});
  ctx.window=ctx;vm.runInContext(gallery,ctx);
  const fire=(id,type,ev={})=>(handlers[id+':'+type]||[]).forEach(fn=>fn({preventDefault(){},...ev}));
  const cards=()=>[...els['co-list'].innerHTML.matchAll(/<button[^>]*data-id="([^"]*)"[^>]*data-name="([^"]*)"([^>]*)>/g)].map(m=>({id:m[1],name:m[2],locked:/data-locked="1"/.test(m[3]),demo:/data-demo="1"/.test(m[3]),last:/aria-current="true"/.test(m[3])}));
  const click=card=>fire('co-list','click',{target:{closest:()=>({dataset:{id:card.id,name:card.name,locked:card.locked?'1':'',demo:card.demo?'1':''}})}});
  return {ctx,els,location,cards,click,fire,session:()=>ctx.sessionStorage.dump(),intent:()=>JSON.parse(ctx.sessionStorage.getItem('sqc_company_intent')||'null')};
}
const users={active:'user-main',users:{'user-main':{id:'user-main',name:'المحاسب',spaces:{'co-a':{name:'شركة ألف',at:'2026-10-01T10:00:00Z'},'space-main':{name:'بيانات الجهاز',at:'2026-09-01T10:00:00Z'}}}}};
const books={companies:[{id:'co-a',name:'شركة ألف',currency:'SAR'},{id:'co-b',name:'شركة باء',currency:'SAR'},{id:'demo-co',name:'شركة الوادي التجريبية للحوم'}]};

test('a blank production device offers the locked private company first and the demo company',()=>{
  const g=page();const c=g.cards();
  assert.deepEqual(c.map(x=>[x.id,x.locked,x.demo]),[['co-private',true,false],['demo-co',false,true]]);
  assert.equal(c[0].name,'قصيف');
  assert.ok(g.els['co-list'].innerHTML.includes('تُفتح بكلمة المرور'));
});

test('a preview build has no locked card and no password section',()=>{
  const g=page({locked:false});
  assert.ok(!g.cards().some(x=>x.locked));
  assert.ok(g.cards().some(x=>x.id==='demo-co'));
});

test('known spaces and books companies are listed once each, and the private space never as an open card',()=>{
  const g=page({local:{sqc_helper_users_v1:JSON.stringify(users),skosif_companies_v1:JSON.stringify(books),sqc_private_space:'space-main'}});
  const ids=g.cards().map(x=>x.id);
  assert.deepEqual(ids,['co-private','co-a','co-b','demo-co']);
  assert.ok(!ids.includes('space-main'),'the private company\'s space is only the locked card');
  assert.ok(g.els['co-list'].innerHTML.includes('آخر عمل'));
});

test('choosing a company hands the app a one-time intent, silences the in-app choosers and keeps the deep link',()=>{
  const g=page({search:'?go=tbreview',hash:''});
  g.click(g.cards().find(x=>x.id==='demo-co'));
  assert.deepEqual(g.intent(),{id:'demo-co',name:'شركة الوادي التجريبية للحوم',demo:true});
  assert.equal(g.session().sqc_space_chosen,'1');assert.equal(g.session().sqc_helper_user_chosen,'1');
  assert.equal(g.location.href,'./app-safe.html?go=tbreview');
});

test('the private company opens the password section in place and never navigates by itself',()=>{
  const g=page();
  g.click(g.cards()[0]);
  assert.deepEqual(g.intent(),{id:'co-private',name:'قصيف',locked:true});
  assert.equal(g.location.href,'','only the reviewed unlock script may open the app');
  assert.equal(g.els.companies.hidden,true);assert.equal(g.els.locked.hidden,false);assert.equal(g.els['locked-t'].textContent,'قصيف');assert.equal(g.els.p.focused,true);
  g.fire('locked-back','click');
  assert.equal(g.intent(),null);assert.equal(g.els.companies.hidden,false);assert.equal(g.els.locked.hidden,true);
});

test('a new company is created by name and starts as its own empty space',()=>{
  const g=page();
  g.fire('co-add','click');assert.equal(g.els['co-form'].hidden,false);assert.equal(g.els['co-name'].focused,true);
  g.els['co-name'].value='  مؤسسة النخبة للحوم  ';g.fire('co-form','submit');
  const it=g.intent();assert.ok(/^co-[a-z0-9]+$/.test(it.id));assert.equal(it.name,'مؤسسة النخبة للحوم');assert.equal(it.create,true);
  assert.equal(g.location.href,'./app-safe.html');
  const e=page();e.els['co-name'].value='   ';e.fire('co-form','submit');assert.equal(e.intent(),null,'an empty name creates nothing');
});

test('a shortcut or deep link resumes the last company only when it needs no password',()=>{
  const open=page({local:{sqc_last_company:JSON.stringify({id:'co-a',name:'شركة ألف',locked:false})},hash:'#sales'});
  assert.deepEqual(open.intent(),{id:'co-a',name:'شركة ألف',resume:true});assert.equal(open.location.href,'./app-safe.html#sales');
  const locked=page({local:{sqc_last_company:JSON.stringify({id:'space-main',name:'قصيف',locked:true})},hash:'#sales'});
  assert.equal(locked.intent(),null);assert.equal(locked.location.href,'');assert.ok(locked.cards()[0].last,'the locked card is marked as the last one');
  const plain=page({local:{sqc_last_company:JSON.stringify({id:'co-a',name:'شركة ألف',locked:false})}});
  assert.equal(plain.intent(),null,'no link: the gallery is shown');assert.ok(plain.cards().find(x=>x.id==='co-a').last);
});

test('names are escaped in the gallery',()=>{
  const g=page({local:{skosif_companies_v1:JSON.stringify({companies:[{id:'x',name:'<img src=x onerror=alert(1)>'}]})}});
  assert.ok(!g.els['co-list'].innerHTML.includes('<img'));assert.ok(g.els['co-list'].innerHTML.includes('&lt;img'));
});
