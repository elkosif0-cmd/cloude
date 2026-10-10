import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const OLD_KEY='skosif_company_platform_v1';
const clones=x=>x==null?x:JSON.parse(JSON.stringify(x));
function environment(id='account-a',seed={}){
  const db=new Map(Object.entries(seed).map(([k,v])=>[k,clones(v)]));
  let selected=id;let fail=false;
  const caps=[
    {id:'analyzer',gateway:'tools',group:'product',tier:'ADVANCED'},
    {id:'salesintel',gateway:'tools',group:'customer',tier:'ADVANCED'}
  ];
  const SK={
    load:(k,def)=>db.has(k)?clones(db.get(k)):def,
    save:(k,v)=>{if(fail)return false;db.set(k,clones(v));return true},
    company:{current:()=>({id:selected,name:'Current '+selected,sector:'trade',country:'SA',currency:'SAR'})},
    caps:{get:k=>caps.find(x=>x.id===k)||null,all:()=>caps,inGatewayOf:(cap,gate)=>cap.gateway===gate},
    bus:{emit:()=>{}},
    audit:{log:()=>{}},
    ui:{uid:prefix=>prefix+'-test-id'}
  };
  const env={window:null,SK,console,TextEncoder,Date,Blob,crypto:{subtle:{}},Uint8Array,setTimeout,clearTimeout};
  env.window=env;
  vm.runInNewContext(source,env,{filename:'company-platform.js'});
  const platform=env.SKosifCompanyPlatform;
  return{platform,db,select:v=>selected=v,stopSaving:()=>fail=true};
}
const owners={
  'account-a':{id:'account-a',name:'Company A',ownerScope:'FULL_ACCOUNTING'},
  'account-b':{id:'account-b',name:'Company B',ownerScope:'FULL_ACCOUNTING'}
};
const seed={'skosif_companies_v1':{companies:Object.values(owners),periods:[],active:{companyId:'account-a'}}};
test('company platform saves add-on activation only under the current exact company id',()=>{
  const e=environment('account-a',seed),p=e.platform;
  assert.equal(p.state().companyId,'account-a');
  assert.equal(p.capEnabled('analyzer'),false);
  p.setTool('analyzer',true);
  p.setAI(true);
  assert.equal(p.installed('analyzer'),true);
  assert.equal(p.aiEnabled(),true);
  const keyA=p.storageKey('account-a');
  assert.ok(e.db.has(keyA));
  assert.equal(e.db.has(OLD_KEY),false);
  e.select('account-b');
  assert.equal(p.state().companyId,'account-b');
  assert.equal(p.installed('analyzer'),false,'no company-A add-ons in B');
  assert.equal(p.aiEnabled(),false,'no A AI authorization in B');
  p.setTool('salesintel',true);
  const keyB=p.storageKey('account-b');
  assert.equal(p.installed('salesintel'),true);
  assert.equal(p.installed('analyzer'),false);
  assert.notEqual(keyA,keyB);
  e.select('account-a');
  assert.equal(p.installed('analyzer'),true);
  assert.equal(p.installed('salesintel'),false);
  assert.equal(p.aiEnabled(),true);
  e.select('account-b');
  assert.equal(p.installed('salesintel'),true);
});
test('legacy migration copies only when the explicit owner matches, and preserves original',()=>{
  const old={version:1,companyId:'account-a',installedTools:['analyzer'],reporting:{target:'income'},profile:{activity:'Trade'},definitions:{products:[{id:'private-a',name:'Item A'}]}};
  const e=environment('account-b',{...seed,[OLD_KEY]:old}),p=e.platform;
  assert.equal(p.state().companyId,'account-b');
  assert.equal(p.state().installedTools.length,0);
  assert.equal(p.state().definitions.products.length,0);
  assert.equal(e.db.has(p.storageKey('account-b')),false);
  e.select('account-a');
  assert.equal(p.installed('analyzer'),true);
  assert.equal(p.state().definitions.products[0].id,'private-a');
  assert.ok(e.db.has(p.storageKey('account-a')));
  assert.equal(e.db.get(OLD_KEY).companyId,'account-a','legacy untouched');
  e.select('account-b');
  p.setTool('salesintel',true);
  assert.equal(e.db.get(OLD_KEY).companyId,'account-a');
  assert.equal(e.db.get(p.storageKey('account-a')).installedTools[0],'analyzer');
});
test('failed migration refuses silent fallback and never assigns record to another company',()=>{
  const old={version:1,companyId:'account-a',installedTools:['analyzer']};
  const e=environment('account-a',{...seed,[OLD_KEY]:old});
  e.stopSaving();
  assert.throws(()=>e.platform.state(),/ترحيل/);
  e.select('account-b');
  assert.equal(e.platform.state().companyId,'account-b');
  assert.equal(e.platform.state().installedTools.length,0);
});
test('workspace keys are canonical, collision-resistant for ids with separators and unicode',()=>{
  const p=environment('account-a',seed).platform;
  assert.notEqual(p.storageKey('abc/def'),p.storageKey('abc:def'));
  assert.notEqual(p.storageKey('company-أ'),p.storageKey('company-A'));
  assert.equal(p.storageKey('account-a'),OLD_KEY+'::account-a');
});
test('no company selected cannot save any company tool state',()=>{
  const e=environment('',seed),p=e.platform;
  assert.equal(p.state().companyId,'');
  assert.throws(()=>p.setTool('analyzer',true),/اختر شركة/);
  assert.equal(e.db.has(p.storageKey('')),false);
});

test('write path rejects a stale cross-company record before mutating its owner',()=>{
  const first=source.indexOf('function commit(');
  const section=source.slice(first,source.indexOf('function uid(',first));
  const checked=section.indexOf('if(v.companyId!==c.id)');
  const mutated=section.indexOf('v.version=1');
  const saved=section.indexOf('save(companyKey(c.id),v)');
  assert.ok(checked>=0 && checked<mutated && mutated<saved,
    'ownership check must precede any mutation and the company-scoped write');
});

test('add-on UI waits for both company handoff and demo seeding before permitting edits',()=>{
  const addon=readFileSync(new URL('../ui/features/earth-company-addons.js',import.meta.url),'utf8');
  assert.match(addon,/SKosifSpace\?\.busy\?\.\(\)/,'front-door company handoff blocks edits');
  assert.match(addon,/SK\?\.demo\?\.settled/,'asynchronous demo seed blocks edits');
  assert.match(addon,/if\(pending\)refreshWhenReady\(\)/,'disabled CTA becomes available after initialization');
  assert.match(addon,/if\(!activeCompany\(companyId\)\)/,'live context is verified before any add-on action');
});
