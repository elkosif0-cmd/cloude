import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = p => fs.readFileSync(new URL('../'+p, import.meta.url), 'utf8');

function storage(seed={}) {
  const map=new Map(Object.entries(seed).map(([k,v])=>[k,String(v)])),writes=[];
  return {
    get length(){return map.size},
    key:i=>[...map.keys()][i]??null,
    getItem:k=>map.has(k)?map.get(k):null,
    setItem(k,v){writes.push(['set',k,String(v)]);map.set(k,String(v))},
    removeItem(k){writes.push(['remove',k]);map.delete(k)},
    dump:()=>Object.fromEntries(map),
    writes
  };
}
const jsonSeed={
  sqc_helper_users_v1:{active:'u1',users:{u1:{id:'u1',name:'Synthetic Accountant',lastSpace:'c1',spaces:{c1:{name:'Accounting A'},c2:{name:'Accounting B'}}}}},
  sqc_helper_space_v1:{active:'c1',spaces:{c1:{name:'Accounting A'},c2:{name:'Accounting B'}}},
  skosif_companies_v1:{active:{companyId:'c1',periodId:'p1'},companies:[{id:'c1',name:'Accounting A',currency:'SAR'},{id:'c2',name:'Accounting B',currency:'USD'}],periods:[{id:'p1',companyId:'c1',startDate:'2026-01-01',endDate:'2026-12-31'}]},
  skosif_ledger_v1:{accounts:[],entries:[]}
};
const encodedSeed=()=>Object.fromEntries(Object.entries(jsonSeed).map(([k,v])=>[k,JSON.stringify(v)]));

async function helperIntent(intent) {
  const localStorage=storage(encodedSeed()),sessionStorage=storage({sqc_company_intent:JSON.stringify(intent)});
  let indexedOpens=0;
  const indexedDB={databases:async()=>[],open(){indexedOpens++;throw new Error('independent Audit intent must not open IndexedDB')}};
  const busHandlers={};
  const SK={
    esc:String,
    load(k,f){const raw=localStorage.getItem(k);if(raw==null)return f;try{return JSON.parse(raw)}catch{return f}},
    save(k,v){localStorage.setItem(k,JSON.stringify(v));return true},
    toast(){},
    errors:{report(e){throw e}},
    bus:{on(t,fn){busHandlers[t]=fn},emit(){}},
    caps:{gateway:id=>['accounting','audit','tools'].includes(id)?{id}:null,gatewayHome:id=>id==='audit'?'tbreview':id==='tools'?'helperdesk':'ledger',get:()=>null},
    audit:{log(){}}
  };
  const document={readyState:'complete',addEventListener(){},getElementById:()=>null,body:{appendChild(){}}};
  const context=vm.createContext({
    window:{},SK,document,localStorage,sessionStorage,indexedDB,console,Date,Intl,Math,JSON,String,Number,Object,Map,Set,
    TextEncoder,Uint8Array,setTimeout(){return 0},clearTimeout(){},location:{search:'',hash:'',reload(){}},addEventListener(){}
  });
  context.window=context;
  const before=localStorage.dump();
  vm.runInContext(read('ui/core/helper-space.js'),context,{filename:'ui/core/helper-space.js'});
  const ok=await context.SKosifSpace.intent();
  return {ok,before,after:localStorage.dump(),localWrites:localStorage.writes,session:sessionStorage.dump(),indexedOpens};
}

test('new Audit engagement intent never switches or snapshots the accounting/helper company', async()=>{
  const h=await helperIntent({gate:'audit',auditNew:true});
  assert.equal(h.ok,true);
  assert.deepEqual(h.after,h.before,'independent Audit start leaves all local company/helper data byte-equivalent');
  assert.deepEqual(h.localWrites,[],'independent Audit start performs no localStorage ownership/data write');
  assert.equal(h.indexedOpens,0,'independent Audit start never opens helper snapshot IndexedDB');
  assert.equal(h.session.sqc_gate,'audit');
  assert.equal(h.session.sqc_gate_audit_new,'1');
  assert.equal(h.session.sqc_company_after_open,'tbreview');
  assert.equal(h.session.sqc_gate_pin,'tbreview');
  assert.equal(h.session.sqc_space_chosen,'1');
  assert.equal(h.session.sqc_helper_user_chosen,'1');
});

test('reference-corpus Audit intent never switches or snapshots the accounting/helper company', async()=>{
  const h=await helperIntent({gate:'audit',corpus:'apple-2024'});
  assert.equal(h.ok,true);
  assert.deepEqual(h.after,h.before);
  assert.deepEqual(h.localWrites,[]);
  assert.equal(h.indexedOpens,0);
  assert.equal(h.session.sqc_gate,'audit');
  assert.equal(h.session.sqc_gate_corpus,'apple-2024');
  assert.equal(h.session.sqc_company_after_open,'tbreview');
  assert.equal(h.session.sqc_gate_pin,'tbreview');
});

function gateHarness(session, review) {
  const sessionStorage=storage(session);
  const SK={
    caps:{
      gateways:()=>[{id:'accounting'},{id:'audit'},{id:'tools'}],
      get:()=>null,inGatewayOf:()=>true,gatewayHome:g=>g==='audit'?'tbreview':'ledger',
      gateway:g=>({id:g,label:g})
    },
    perm:{can:()=>true},bus:{emit(){}}
  };
  const document={readyState:'complete',addEventListener(){}};
  const context=vm.createContext({window:{},SK,document,sessionStorage,console,setTimeout:fn=>{fn();return 1}});
  context.window=context;
  context.SKosifTBReview=review;
  vm.runInContext(read('ui/core/gate.js'),context,{filename:'ui/core/gate.js'});
  return {context,session:sessionStorage.dump(),writes:sessionStorage.writes};
}

test('gate dispatches independent new Audit without SK.company existing',()=>{
  let calls=0;
  const h=gateHarness({sqc_gate:'audit',sqc_gate_audit_new:'1'},{newEngagement(){calls++}});
  assert.equal(calls,1);
  assert.equal(h.session.sqc_gate_audit_new,undefined,'one-shot new-audit command is consumed');
  assert.equal('company' in h.context.SK,false,'dispatcher does not require a global company service');
});

test('gate dispatches corpus Audit without SK.company existing',()=>{
  const ids=[];
  const h=gateHarness({sqc_gate:'audit',sqc_gate_corpus:'apple-2024'},{loadCorpus(id){ids.push(id)}});
  assert.deepEqual(ids,['apple-2024']);
  assert.equal(h.session.sqc_gate_corpus,undefined,'one-shot corpus command is consumed');
  assert.equal('company' in h.context.SK,false);
});

test('TB review exposes Audit-owned newEngagement and keeps accounting import explicit',()=>{
  const s=read('ui/features/tb-review.js');
  assert.match(s,/function newEngagement\(\)\s*\{[\s\S]*?newFile\(blank\(\),\{source:"user"\}\)/);
  assert.match(s,/Object\.freeze\(\{newEngagement,fromBooks,loadCorpus/);
  const body=s.slice(s.indexOf('function newEngagement()'),s.indexOf('/* open the engagement on a tab'));
  assert.doesNotMatch(body,/SK\.company|SKosifSpace|skosif_companies_v1|switchTo\(/,'new engagement creation must not read or switch company context');
});

test('front door no longer contains an Audit host selector',()=>{
  const s=read('unlock.html');
  assert.doesNotMatch(s,/function host\(\)/);
  assert.match(s,/data-audit-new[\s\S]*?go\(\{gate:"audit",auditNew:true\}\)/);
  assert.match(s,/data-corpus[\s\S]*?go\(\{gate:"audit",corpus:b\.dataset\.corpus\}\)/);
});
