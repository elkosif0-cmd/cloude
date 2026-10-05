import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const source=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const helper=fs.readFileSync(new URL('../ui/core/helper-space.js',import.meta.url),'utf8');

function harness(){
  const store=new Map(),events=[],audit=[];let seq=0;
  const active={id:'co-a',name:'شركة ألف',country:'SA',currency:'SAR'};
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const SK={
    load:(k,d)=>store.has(k)?clone(store.get(k)):clone(d),
    save:(k,v)=>{store.set(k,clone(v));return true},
    ui:{uid:p=>p+'-'+(++seq)},
    company:{current:()=>({...active}),updateMeta:p=>{Object.assign(active,p);return true}},
    caps:{get:id=>id==='cost-tool'?{id,gateway:'tools'}:id==='ledger'?{id,gateway:'accounting'}:null},
    audit:{log:(area,e)=>audit.push([area,e])},
    bus:{emit:(name,e)=>events.push([name,e])}
  };
  const context={window:{},SK,crypto:webcrypto,Blob:globalThis.Blob,console,setTimeout,clearTimeout,structuredClone};
  context.window.SK=SK;vm.createContext(context);vm.runInContext(source,context,{filename:'company-platform.js'});
  return {api:context.window.SKosifCompanyPlatform,store,events,audit,active,SK};
}

test('company platform profile, definitions and tools are company-bound',()=>{
  const h=harness(),api=h.api;
  assert.equal(api.state().companyId,'co-a');
  api.setProfile({activity:'تجارة',country:'EG',currency:'EGP',taxMode:'income',fiscalYearStart:'07-01'});
  assert.equal(api.profile().activity,'تجارة');
  assert.equal(api.profile().currency,'EGP');
  assert.equal(h.active.currency,'EGP');
  const product=api.addDefinition('products',{name:'منتج أ',code:'P1',cost:10,salePrice:15,wastePct:2});
  assert.equal(api.definitions('products')[0].id,product.id);
  assert.equal(api.setTool('cost-tool',true),true);
  assert.equal(api.installed('cost-tool'),true);
  assert.throws(()=>api.setTool('ledger',true),/ليست ضمن بوابة الأدوات/);

  const companyA=JSON.parse(JSON.stringify(h.store.get(api.key)));
  h.active.id='co-b';h.active.name='شركة باء';h.active.country='SA';h.active.currency='SAR';
  assert.equal(api.state().companyId,'co-b');
  assert.deepEqual(api.definitions('products'),[]);
  assert.equal(api.installed('cost-tool'),false);

  h.store.set(api.key,companyA);h.active.id='co-a';h.active.name='شركة ألف';
  assert.equal(api.definitions('products').length,1);
  assert.equal(api.installed('cost-tool'),true);
});

test('reporting result is traceable and never changes authoritative ledger state',()=>{
  const h=harness(),api=h.api;
  api.saveReportResult(
    {rows:[{code:'1'}],balanced:true,errors:[],unclassified:0,difference:0},
    {checks:{mappedPct:100,balanced:true,cashTies:null},unmapped:[],keys:{revenue:{current:10000,prior:null},profit:{current:2500,prior:null}}},
    'tb.csv'
  );
  const s=api.reportingStatus();
  assert.equal(s.lastTrialBalance.sourceName,'tb.csv');
  assert.equal(s.lastTrialBalance.balanced,true);
  assert.equal(s.lastStatements.keys.profit.current,'2500');
  assert.ok(h.audit.some(([area,e])=>area==='company-platform'&&e.act==='reporting.generated'));
});

test('helper-space snapshots the unified company platform key',()=>{
  assert.match(helper,/skosif_company_platform_v1/);
});
