import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const service=fs.readFileSync(new URL('../ui/core/standards.js',import.meta.url),'utf8');
const company=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const master=fs.readFileSync(new URL('../ui/features/master-data.js',import.meta.url),'utf8');
const assistant=fs.readFileSync(new URL('../ui/features/assistant.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('../build.py',import.meta.url),'utf8');

test('company profile carries an explicit reporting framework',()=>{
  assert.match(company,/framework:\(cur\(\)\.country==="EG"\?"EAS":"IFRS"\)/);
  assert.match(company,/\["IFRS","SME","EAS"\]/);
  assert.match(master,/data-md-profile="framework"/);
  for(const code of ['IFRS','SME','EAS'])assert.match(master,new RegExp('value="'+code+'"'));
});

test('standards layer reads deterministic codex and never approves automatically',()=>{
  assert.match(service,/SKEngines\.audit&&SKEngines\.audit\.codex/);
  assert.match(service,/searchCodex/);
  assert.match(service,/REGISTRY_DATE/);
  assert.match(service,/inFramework/);
  assert.match(service,/approved=false/);
  assert.doesNotMatch(service,/approved:true/);
  assert.match(service,/window\.SKosifStandards=Object\.freeze/);
});

test('assistant routes standards questions through the shared standards service',()=>{
  assert.match(assistant,/name:"standards_search"/);
  assert.match(assistant,/SKosifStandards/);
  assert.match(assistant,/IFRS\/IAS\/ISA\/SOCPA\/ZATCA\/EAS/);
});

test('standards service is wired before feature modules',()=>{
  const i=build.indexOf('"core/standards.js"');
  const a=build.indexOf('"features/assistant.js"');
  assert.ok(i>0,'standards core must be in build');
  assert.ok(a>i,'assistant must load after standards core');
});

// Actual bundled codex/runtime checks; no network, browser or invented legal facts.
const vm=await import('node:vm');
function runtime(){
  let active={id:'egypt-company',country:'EG',framework:'EAS'};const traces=[];
  const W={console,Date,Intl,structuredClone,TextEncoder,TextDecoder,SK:{company:{current:()=>active}},SKosifCompanyPlatform:{profile:()=>active,addStandardTrace:r=>{traces.push(r);return r;}}};
  W.window=W;vm.createContext(W);
  vm.runInContext(fs.readFileSync(new URL('../ui/core/engines.js',import.meta.url),'utf8'),W);
  vm.runInContext(service,W);
  return {W,api:W.SKosifStandards,codex:W.SKEngines.audit.codex,traces,select:next=>{active=next;}};
}
function canonical(result,record){
  for(const key of ['code','family','titleAr','titleEn','purpose','effective','latest','status','org','url'])assert.equal(result[key],record[key],key);
  for(const key of ['requirements','disclosures','audit'])assert.deepEqual(JSON.parse(JSON.stringify(result[key])),JSON.parse(JSON.stringify(record[key])),key);
  assert.equal(result.frameworkCode,record.code);
}
test('Egypt VAT resolves the actual Egyptian record before rendering its text and source',()=>{
  const h=runtime(),result=h.api.explain('ZATCA VAT'),record=h.codex.STANDARD['ضريبة القيمة المضافة (مصر)'];
  assert.equal(result.results.length,1);canonical(result.results[0],record);assert.equal(result.results[0].requestedCode,'ZATCA VAT');
  assert.match(result.text,/14%/);assert.doesNotMatch(result.text,/15%|ZATCA|zatca\.gov/i);
});
test('EAS presentation reference uses EAS1 dates and attribution rather than IFRS18 content',()=>{
  const h=runtime(),result=h.api.explain('IFRS 18');canonical(result.results[0],h.codex.STANDARD['EAS 1']);
  assert.doesNotMatch(result.text,/2027|SOCPA|ifrs-18-presentation/i);assert.match(result.text,/FRA/);
});
test('Saudi IFRS lookup preserves the full original IFRS record and effective date',()=>{
  const h=runtime();h.select({id:'saudi-company',country:'SA',framework:'IFRS'});
  canonical(h.api.explain('IFRS 18').results[0],h.codex.STANDARD['IFRS 18']);
});
test('tax jurisdiction remains Egyptian when its company chooses IFRS accounting',()=>{
  const h=runtime();h.select({id:'egypt-ifrs',country:'EG',framework:'IFRS'});
  canonical(h.api.explain('ZATCA VAT').results[0],h.codex.STANDARD['ضريبة القيمة المضافة (مصر)']);
});
test('company switching never reuses another company VAT text, source or trace',()=>{
  const h=runtime(),egypt=h.api.explain('ZATCA VAT');h.api.trace('VAT reference',egypt.results[0],'reference only');
  h.select({id:'saudi-company',country:'SA',framework:'IFRS'});const saudi=h.api.explain('ZATCA VAT');h.api.trace('VAT reference',saudi.results[0],'reference only');
  canonical(saudi.results[0],h.codex.STANDARD['ZATCA VAT']);assert.match(saudi.text,/15%/);assert.doesNotMatch(saudi.text,/14%|eta\.gov/i);
  assert.equal(h.traces[0].standard,'ضريبة القيمة المضافة (مصر)');assert.equal(h.traces[1].standard,'ZATCA VAT');assert.ok(h.traces.every(t=>t.approved===false));
  h.select({id:'egypt-company',country:'EG',framework:'EAS'});canonical(h.api.explain('ZATCA VAT').results[0],h.codex.STANDARD['ضريبة القيمة المضافة (مصر)']);
  assert.match(egypt.text,/14%/);assert.doesNotMatch(egypt.text,/15%/);
});
test('SME accounting without a canonical counterpart is explicitly unavailable',()=>{
  const h=runtime();h.select({id:'sme-company',country:'SA',framework:'SME'});const result=h.api.explain('IAS 2');
  assert.equal(result.results.length,0);assert.ok(result.unavailable.length>0);assert.match(result.text,/غير متاح/);
  assert.doesNotMatch(result.text,/2005|ifrs.org\/issued-standards\/list-of-standards\/ias-2/);
});
test('the explicit IFRS for SMEs reference preserves its own dates and source record',()=>{
  const h=runtime();h.select({id:'sme-company',country:'SA',framework:'SME'});
  canonical(h.api.explain('IFRS for SMEs').results[0],h.codex.STANDARD['IFRS for SMEs']);
});
test('missing mapped record fails closed without falling back to incompatible source content',()=>{
  const h=runtime(),C=h.codex,STANDARD={...C.STANDARD};delete STANDARD['ضريبة القيمة المضافة (مصر)'];
  h.W.SKEngines={...h.W.SKEngines,audit:{...h.W.SKEngines.audit,codex:{...C,STANDARD}}};
  const result=h.api.explain('ZATCA VAT');assert.equal(result.results.length,0);assert.ok(result.unavailable.length>0);assert.match(result.text,/غير متاح/);assert.doesNotMatch(result.text,/15%|zatca\.gov/i);
  assert.equal(h.api.trace('VAT reference',result.unavailable[0],'unavailable'),null);assert.equal(h.traces.length,0);
});
test('unsupported company jurisdictions do not inherit Saudi tax guidance',()=>{
  const h=runtime();h.select({id:'other-country',country:'US',framework:'IFRS'});const result=h.api.explain('ZATCA VAT');
  assert.equal(result.results.length,0);assert.ok(result.unavailable.length>0);assert.doesNotMatch(result.text,/15%|14%/);
});
test('family filtering applies to the resolved canonical record',()=>{
  const h=runtime(),result=h.api.search('IFRS 18',{family:'EAS'});assert.equal(result.results.length,1);canonical(result.results[0],h.codex.STANDARD['EAS 1']);
});
test('ordinary IFRS accounting references remain available outside Saudi Arabia and Egypt',()=>{
  const h=runtime();h.select({id:'other-country',country:'US',framework:'IFRS'});canonical(h.api.explain('IFRS 18').results[0],h.codex.STANDARD['IFRS 18']);
});
test('international audit references keep their actual source identity across company frameworks',()=>{
  const h=runtime();for(const [framework,country] of [['EAS','EG'],['IFRS','US'],['SME','SA']]){
    h.select({id:framework,country,framework});canonical(h.api.explain('ISA 500').results[0],h.codex.STANDARD['ISA 500']);
  }
});
test('a reference captured before a jurisdiction switch cannot create a misleading trace',()=>{
  const h=runtime(),record=h.api.explain('ZATCA VAT').results[0];
  h.select({id:'saudi-company',country:'SA',framework:'IFRS'});
  assert.equal(h.api.trace('stale VAT reference',record,'unavailable'),null);assert.equal(h.traces.length,0);
});

// Actual local planner -> tool -> send -> paint path, using the actual canonical service.
// Only the panel's host nodes and storage are synthetic; no AI/network/browser is used.
function assistantRuntime({providerFailure=false}={}){
  const h=runtime(),store=new Map(),writes=[];
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const node=()=>({innerHTML:'',textContent:'',classList:{toggle(){}},insertAdjacentHTML(_where,html){this.innerHTML+=html}});
  const nodes={'.ska-msgs':node(),'.ska-sugg':node(),'.ska-status':node()},panel={dataset:{},nodes};
  const key=k=>h.W.SK.company.current().id+':'+k;
  Object.assign(h.W.SK,{$:(sel,root)=>root?.nodes?.[sel]||null,$$:()=>[],esc:escape,
    load:(k,d)=>structuredClone(store.get(key(k))??d),save:(k,v)=>{writes.push(k);store.set(key(k),structuredClone(v));return true},
    caps:{get:()=>null,all:()=>[]},perm:{can:()=>true,label:()=> 'test'},audit:{log(){}},toast(){}});
  h.W.SKosifCore={view:()=> 'masterdata'};
  h.W.SKosifAI={ready:()=>providerFailure,generate:async()=>{throw new Error('synthetic offline')}};
  h.W.document={readyState:'loading',addEventListener(){}};h.W.addEventListener=()=>{};
  vm.runInContext(assistant.replace(/\}\)\(\);\s*$/,'window.__assistantPanelForTest=p=>{panel=p};})();'),h.W);
  h.W.__assistantPanelForTest(panel);
  return {...h,writes,send:text=>h.W.SKosifAssistant.send(text),reply:()=>h.W.SK.load('skosif_chat_v1',[]).filter(m=>m.role==='model').at(-1)?.text,
    html:()=>nodes['.ska-msgs'].innerHTML,rendered:text=>escape(text).replace(/\n/g,'<br>')};
}
for(const [name,profile,query] of [
  ['Egypt VAT',{id:'eg',country:'EG',framework:'EAS'},'ZATCA VAT'],
  ['EAS presentation',{id:'eg',country:'EG',framework:'EAS'},'IFRS 18'],
  ['Saudi IFRS',{id:'sa',country:'SA',framework:'IFRS'},'IFRS 18'],
  ['unavailable SME counterpart',{id:'sme',country:'SA',framework:'SME'},'IAS 2']
])test('local assistant displays the complete canonical '+name+' result in its reply and rendered panel',async()=>{
  const h=assistantRuntime();h.select(profile);const expected=h.api.explain(query).text;
  await h.send(query);
  assert.equal(h.reply(),expected,'tool success must not collapse to a generic Done reply');
  assert.ok(h.html().includes('<div class="ska-m ai">'+h.rendered(expected)+'</div>'),'the canonical details must appear in the actual rendered response');
  assert.deepEqual([...new Set(h.writes)],['skosif_chat_v1']);assert.equal(h.traces.length,0);
});
test('local assistant company switching displays each current jurisdiction record without mixed payloads',async()=>{
  const h=assistantRuntime();
  for(const profile of [{id:'eg',country:'EG',framework:'EAS'},{id:'sa',country:'SA',framework:'IFRS'},{id:'eg',country:'EG',framework:'EAS'}]){
    h.select(profile);const expected=h.api.explain('ZATCA VAT').text;await h.send('ZATCA VAT');assert.equal(h.reply(),expected);
    assert.match(h.reply(),profile.country==='EG'?/14%/:/15%/);assert.doesNotMatch(h.reply(),profile.country==='EG'?/15%|zatca\.gov/i:/14%|eta\.gov/i);
  }
  assert.equal(h.traces.length,0);
});
test('provider failure retains the canonical standards details in the local fallback reply',async()=>{
  const h=assistantRuntime({providerFailure:true}),expected=h.api.explain('ZATCA VAT').text;await h.send('ZATCA VAT');
  assert.ok(h.reply().includes(expected));assert.ok(h.html().includes(h.rendered(expected)));assert.match(h.reply(),/synthetic offline/);assert.equal(h.traces.length,0);
});
test('unavailable standards service is displayed rather than a misleading success reply',async()=>{
  const h=assistantRuntime();vm.runInContext('window.SKosifStandards=null',h.W);assert.equal(vm.runInContext('window.SKosifStandards',h.W),null);await h.send('IFRS 18');assert.equal(h.reply(),'خدمة المعايير غير متاحة');assert.match(h.html(),/خدمة المعايير غير متاحة/);
});
