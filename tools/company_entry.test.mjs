// The front door (unlock.html, FOUNDATION §3): the section first — accounting · audit · tools — then, in accounting, the
// sector, then the company; what each step lists, what it hands the app, and what it never shows. The reviewed unlock
// script stays byte-identical (tools/unlock_runtime.test.mjs pins it); this runs the door script with the registry's
// entry data, the way build.py inlines it.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../unlock.html',import.meta.url),'utf8');
const reg=JSON.parse(readFileSync(new URL('../ui/core/capabilities.json',import.meta.url),'utf8'));
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,2,'the reviewed unlock script first, the door second');
const door=scripts[1];
assert.ok(door.includes('/*SQC:ENTRY-DATA*/'),'build.py inlines the entry data at the marker');
assert.match(html,/id="gates-help">ثلاثة مداخل واضحة:/,'the door explains the three entry meanings before a company is chosen');
const CORPUS=[{id:'apple-2024',company:'Apple Inc.',sector:'tech',country:'الولايات المتحدة',fy:'FY2024'},{id:'aramco-2025',company:'Saudi Arabian Oil Company (Aramco)',sector:'energy',country:'السعودية',fy:'FY2025'}];
const LIBRARY='https://kosif-financial-reference-library.smartsphere152.chatgpt.site/';

function storage(init={}){const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),dump:()=>Object.fromEntries(m)}}
function page({locked=true,local={},session={},search='',hash=''}={}){
  const els={},handlers={};
  const el=id=>els[id]||(els[id]={id,innerHTML:'',hidden:false,textContent:'',value:'',focused:false,dataset:{},list:{innerHTML:''},
    addEventListener(t,fn){(handlers[id+':'+t]=handlers[id+':'+t]||[]).push(fn)},focus(){this.focused=true},querySelector(){return this.list}});
  ['gates','gate-list','sectors','sector-list','sector-back','companies','co-t','entry-help','co-list','co-add','co-form','co-name','co-cancel','corpus','co-hint','co-back','locked','locked-t','locked-back','p'].forEach(el);
  const body={dataset:{locked:locked?'1':'0',lockedName:'تصيف',lockedId:'co-private',lockedSector:'meat'}};
  const location={search,hash,href:''};
  const ctx=vm.createContext({console,JSON,Date,Math,String,Number,Object,Map,Set,localStorage:storage(local),sessionStorage:storage(session),location,
    document:{getElementById:id=>els[id]||null,body,title:''},SQC_GATES:reg.gateways,SQC_SECTORS:reg.sectors,SQC_CORPUS:CORPUS});
  ctx.window=ctx;vm.runInContext(door,ctx);
  const fire=(id,type,ev={})=>(handlers[id+':'+type]||[]).forEach(fn=>fn({preventDefault(){},...ev}));
  /* a click target whose closest("[data-x]") answers only for the attributes it carries */
  const target=ds=>({target:{closest:sel=>{const a=/\[data-([a-z-]+)\]/.exec(sel);if(!a)return null;const key=a[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return key in ds?{dataset:ds}:null}}});
  const cards=()=>[...els['co-list'].innerHTML.matchAll(/<button[^>]*data-id="([^"]*)"[^>]*data-name="([^"]*)"([^>]*)>/g)].map(m=>({id:m[1],name:m[2],locked:/data-locked="1"/.test(m[3]),demo:/data-demo="1"/.test(m[3]),scratch:/data-scratch="1"/.test(m[3]),last:/aria-current="true"/.test(m[3])}));
  const gates=()=>[...els['gate-list'].innerHTML.matchAll(/data-gate="([^"]*)"/g)].map(m=>m[1]);
  const sectors=()=>[...els['sector-list'].innerHTML.matchAll(/data-sector="([^"]*)"[^>]*>[\s\S]*?<i class="sector-n">([^<]*)<\/i>/g)].map(m=>({id:m[1],n:m[2]}));
  const corpus=()=>[...els.corpus.innerHTML.matchAll(/data-corpus="([^"]*)"/g)].map(m=>m[1]);
  const gate=id=>fire('gate-list','click',target({gate:id}));
  const sector=id=>fire('sector-list','click',target({sector:id}));
  const click=c=>fire('co-list','click',target({id:c.id,name:c.name,...(c.locked?{locked:'1'}:{}),...(c.demo?{demo:'1'}:{}),...(c.scratch?{scratch:'1'}:{})}));
  const visible=()=>['gates','sectors','companies','locked'].filter(id=>!els[id].hidden);
  return {ctx,els,location,cards,gates,sectors,corpus,gate,sector,click,fire,target,visible,title:()=>ctx.document.title,
    session:()=>ctx.sessionStorage.dump(),intent:()=>JSON.parse(ctx.sessionStorage.getItem('sqc_company_intent')||'null'),entry:()=>ctx.SQCEntry};
}
const users={active:'user-main',users:{'user-main':{id:'user-main',name:'المحاسب',spaces:{'co-a':{name:'مستشفى ألف',at:'2026-10-01T10:00:00Z'},'space-main':{name:'بيانات الجهاز',at:'2026-09-01T10:00:00Z'}}}}};
const books={companies:[{id:'co-a',name:'مستشفى ألف',currency:'SAR',sector:'health'},{id:'co-b',name:'شركة باء',currency:'SAR'},{id:'demo-co',name:'شركة الوادي التجريبية للحوم'}]};
const device={sqc_helper_users_v1:JSON.stringify(users),skosif_companies_v1:JSON.stringify(books),sqc_private_space:'space-main'};

test('the door opens on the three sections, in the registry\'s order, and on nothing else',()=>{
  const g=page();
  assert.deepEqual(g.visible(),['gates']);
  assert.deepEqual(g.gates(),['accounting','audit','tools']);
  assert.equal(g.title(),'SQC — اختر القسم');
  assert.equal(g.cards().length,0,'no company before a section is chosen');
  assert.ok(g.els['gate-list'].innerHTML.includes('البرنامج المحاسبي الكامل'));
});

test('accounting asks for the sector first: every registry sector in order, with how many companies it holds',()=>{
  const g=page({local:device});
  g.gate('accounting');
  assert.deepEqual(g.visible(),['sectors']);assert.equal(g.title(),'SQC — اختر القطاع');
  const s=g.sectors();
  assert.deepEqual(s.map(x=>x.id),reg.sectors.map(x=>x.id));
  assert.equal(s.find(x=>x.id==='meat').n,'2 شركة','the private company and the demo company are meat companies');
  assert.equal(s.find(x=>x.id==='health').n,'1 شركة');
  assert.equal(s.find(x=>x.id==='trade').n,'1 شركة','a company recorded before sectors existed is general trade');
  assert.equal(s.find(x=>x.id==='hospitality').n,'لا شركات بعد');
  assert.equal(g.entry().gate(),'accounting');
});

test('a sector lists its own companies only; the private company only as the locked card of its sector; the intent carries the section and the sector',()=>{
  const g=page({local:device});
  g.gate('accounting');g.sector('health');
  assert.deepEqual(g.visible(),['companies']);
  assert.deepEqual(g.cards().map(c=>c.id),['co-a']);
  assert.ok(g.els['co-t'].textContent.includes('المستشفيات'));
  g.fire('co-back','click');assert.deepEqual(g.visible(),['sectors'],'back from the companies of a sector returns to the sectors');
  g.sector('meat');
  assert.deepEqual(g.cards().map(c=>[c.id,c.locked,c.demo]),[['co-private',true,false],['demo-co',false,true]]);
  assert.ok(!g.cards().some(c=>c.id==='space-main'),'the private company\'s space is only the locked card');
  g.click(g.cards()[1]);
  assert.deepEqual(g.intent(),{id:'demo-co',name:'شركة الوادي التجريبية للحوم',demo:true,gate:'accounting',sector:'meat'});
  assert.equal(g.session().sqc_space_chosen,'1');assert.equal(g.session().sqc_helper_user_chosen,'1');
  assert.equal(g.location.href,'./app-safe.html');
  const e=page({local:device});e.gate('accounting');e.sector('hospitality');
  assert.equal(e.cards().length,0);assert.ok(e.els['co-list'].innerHTML.includes('لا شركات في هذا القطاع بعد'));
});

test('a new company is created under the chosen sector and starts as its own empty space',()=>{
  const g=page();
  g.gate('accounting');g.sector('construction');
  assert.ok(g.els['co-add'].textContent.includes('المقاولات'));
  g.fire('co-add','click');assert.equal(g.els['co-form'].hidden,false);assert.equal(g.els['co-name'].focused,true);
  g.els['co-name'].value='  شركة البناء الحديث  ';g.fire('co-form','submit');
  const it=g.intent();assert.ok(/^co-[a-z0-9]+$/.test(it.id));assert.equal(it.name,'شركة البناء الحديث');assert.equal(it.create,true);assert.equal(it.gate,'accounting');assert.equal(it.sector,'construction');
  assert.equal(g.location.href,'./app-safe.html');
  const e=page();e.gate('accounting');e.sector('trade');e.els['co-name'].value='   ';e.fire('co-form','submit');assert.equal(e.intent(),null,'an empty name creates nothing');
});

test('audit lists every company behind a new-file card, the bundle companies, and the reference library — no new-company form',()=>{
  const g=page({local:device});
  g.gate('audit');
  assert.deepEqual(g.visible(),['companies']);
  assert.equal(g.title(),'SQC — ابدأ المراجعة');
  const auditHtml=g.els['co-list'].innerHTML;
  assert.ok(auditHtml.includes('data-audit-new="1"'));
  assert.ok(auditHtml.includes('class="co primary"'),'new audit is the visually primary action');
  assert.ok(auditHtml.includes('ربط اختياري بشركة محاسبية'));
  assert.ok(auditHtml.indexOf('data-audit-new="1"')<auditHtml.indexOf('ربط اختياري بشركة محاسبية'),'independent audit action comes before optional company linking');
  assert.ok(g.els['entry-help'].textContent.includes('ابدأ ملف مراجعة مستقل'));
  assert.deepEqual(g.cards().map(c=>c.id),['co-private','co-a','co-b','demo-co']);
  assert.equal(g.els['co-add'].hidden,true);assert.equal(g.els.corpus.hidden,false);
  assert.deepEqual(g.corpus(),['apple-2024','aramco-2025']);
  assert.ok(g.els.corpus.innerHTML.includes(LIBRARY));
  g.fire('corpus','click',g.target({corpus:'apple-2024',name:'Apple Inc.'}));
  assert.deepEqual(g.intent(),{id:'demo-co',name:'شركة الوادي التجريبية للحوم',demo:true,gate:'audit',corpus:'apple-2024'},'a bundle company opens in the demo company\'s space when none was opened before');
  g.fire('corpus','input',{target:{id:'corpus-q',value:'aramco'}});
  assert.ok(g.els.corpus.list.innerHTML.includes('aramco-2025')&&!g.els.corpus.list.innerHTML.includes('apple-2024'));
  const h=page({local:{...device,sqc_last_company:JSON.stringify({id:'co-a',name:'مستشفى ألف',locked:false})}});
  h.gate('audit');h.fire('co-list','click',h.target({auditNew:'1'}));
  assert.deepEqual(h.intent(),{id:'co-a',name:'مستشفى ألف',demo:false,gate:'audit',fresh:'audit'},'a new audit file is hosted by the last company opened');
  g.fire('co-back','click');assert.deepEqual(g.visible(),['gates'],'back from audit returns to the sections');
});

test('tools lists the spaces and a space without a company; that space is never a company of a sector',()=>{
  const g=page({local:device});
  g.gate('tools');
  assert.equal(g.title(),'SQC — مساحة الأدوات');
  const c=g.cards();assert.deepEqual(c.map(x=>x.id),['space-tools','co-private','co-a','co-b','demo-co']);
  const toolsHtml=g.els['co-list'].innerHTML;
  assert.ok(c[0].scratch);assert.ok(toolsHtml.includes('class="co primary"'));assert.ok(toolsHtml.includes('فتح الأدوات بدون شركة'));
  assert.ok(toolsHtml.includes('ربط اختياري بشركة'));
  assert.ok(toolsHtml.indexOf('data-scratch="1"')<toolsHtml.indexOf('ربط اختياري بشركة'),'independent tools action comes before optional company linking');
  assert.ok(g.els['entry-help'].textContent.includes('ابدأ الأدوات مباشرة بدون شركة'));
  assert.ok(g.els['co-add'].textContent.includes('مساحة أدوات جديدة'));
  g.click(c[0]);
  assert.deepEqual(g.intent(),{id:'space-tools',name:'مساحة الأدوات المستقلة',create:true,scratch:true,gate:'tools'});
  const known={...device,sqc_helper_users_v1:JSON.stringify({active:'user-main',users:{'user-main':{id:'user-main',name:'المحاسب',spaces:{'space-tools':{name:'مساحة الأدوات المستقلة',at:'2026-10-02T10:00:00Z'}}}}})};
  const k=page({local:known});k.gate('tools');k.click(k.cards().find(x=>x.scratch));
  assert.equal(k.intent().create,false,'a space already on the device is opened, not emptied');
  const a=page({local:known});a.gate('accounting');
  assert.equal(a.sectors().find(s=>s.id==='trade').n,'1 شركة','the tools space is not counted as a general-trade company');
  a.sector('trade');assert.deepEqual(a.cards().map(x=>x.id),['co-b']);
});

test('the private company opens the password section in place, carrying the section it was chosen from, and never navigates by itself',()=>{
  const g=page();
  g.gate('audit');g.click(g.cards()[0]);
  assert.deepEqual(g.intent(),{id:'co-private',name:'تصيف',locked:true,gate:'audit'});
  assert.equal(g.location.href,'','only the reviewed unlock script may open the app');
  assert.deepEqual(g.visible(),['locked']);assert.equal(g.els['locked-t'].textContent,'تصيف');assert.equal(g.els.p.focused,true);
  g.fire('locked-back','click');
  assert.equal(g.intent(),null);assert.deepEqual(g.visible(),['companies']);
});

test('a preview build has no locked card in any section',()=>{
  for(const gate of ['audit','tools']){const g=page({locked:false});g.gate(gate);assert.ok(!g.cards().some(x=>x.locked));assert.ok(g.cards().some(x=>x.id==='demo-co'))}
  const g=page({locked:false});g.gate('accounting');assert.equal(g.sectors().find(s=>s.id==='meat').n,'1 شركة');
});

test('a shortcut or deep link resumes the last company in its section only when it needs no password',()=>{
  const open=page({local:{sqc_last_company:JSON.stringify({id:'co-a',name:'مستشفى ألف',locked:false,gate:'tools'})},hash:'#sales'});
  assert.deepEqual(open.intent(),{id:'co-a',name:'مستشفى ألف',resume:true,gate:'tools'});assert.equal(open.location.href,'./app-safe.html#sales');
  const locked=page({local:{sqc_last_company:JSON.stringify({id:'space-main',name:'تصيف',locked:true})},hash:'#sales'});
  assert.equal(locked.intent(),null);assert.equal(locked.location.href,'');assert.deepEqual(locked.visible(),['gates']);
  locked.gate('tools');assert.ok(locked.cards()[0].last,'the locked card is marked as the last one');
  const plain=page({local:{sqc_last_company:JSON.stringify({id:'co-a',name:'مستشفى ألف',locked:false})}});
  assert.equal(plain.intent(),null,'no link: the door is shown');plain.gate('tools');assert.ok(plain.cards().find(x=>x.id==='co-a').last);
});

test('names are escaped in every list',()=>{
  const g=page({local:{skosif_companies_v1:JSON.stringify({companies:[{id:'x',name:'<img src=x onerror=alert(1)>',sector:'trade'}]})}});
  g.gate('tools');assert.ok(!g.els['co-list'].innerHTML.includes('<img'));assert.ok(g.els['co-list'].innerHTML.includes('&lt;img'));
});
