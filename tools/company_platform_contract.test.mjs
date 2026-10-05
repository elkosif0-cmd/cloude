import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');

function harness(){
  const store=new Map(),events=[],audit=[];
  let company={id:'co-a',name:'شركة أ',currency:'SAR',country:'SA'};
  const SK={
    load:(k,d)=>store.has(k)?structuredClone(store.get(k)):structuredClone(d),
    save:(k,v)=>{store.set(k,structuredClone(v));return true},
    company:{current:()=>({...company})},
    ui:{uid:(p)=>p+'-'+Math.random().toString(36).slice(2,8)},
    caps:{get:id=>({id,gateway:id==='excelrecon'?'tools':'accounting'})},
    audit:{log:(...x)=>audit.push(x)},
    bus:{emit:(...x)=>events.push(x)}
  };
  const context=vm.createContext({window:{},SK,console,Blob,structuredClone,Date,Math,Number,String,Object,Array,Set,JSON,TextEncoder,crypto:globalThis.crypto,indexedDB:{open(){throw new Error('not used')}}});
  context.window.SK=context.SK=SK;
  vm.runInContext(source,context,{filename:'company-platform.js'});
  return{api:context.window.SKosifCompanyPlatform,store,audit,events,setCompany:v=>{company={...v}}};
}

test('master data is bound to the open company and never leaks by mismatch',()=>{
  const h=harness();
  h.api.addDefinition('products',{name:'منتج أ',code:'P1',cost:10,salePrice:15});
  assert.equal(h.api.definitions('products').length,1);
  h.setCompany({id:'co-b',name:'شركة ب',currency:'SAR',country:'SA'});
  assert.equal(h.api.definitions('products').length,0);
});

test('independent tools must come from the tools gateway',()=>{
  const h=harness();
  assert.equal(h.api.setTool('excelrecon',true),true);
  assert.equal(h.api.installed('excelrecon'),true);
  assert.throws(()=>h.api.setTool('ledger',true),/الأداة ليست ضمن بوابة الأدوات/);
});

test('reporting target and standard trace are explicit company state',()=>{
  const h=harness();
  assert.equal(h.api.reportingTarget('cashflow'),true);
  assert.equal(h.api.reportingStatus().target,'cashflow');
  const row=h.api.addStandardTrace({operation:'journal-review',standard:'IAS 2',source:'official',result:'needs review',approved:false});
  assert.equal(row.approved,false);
  assert.equal(h.api.state().standardTraces.length,1);
});

test('capability registry exposes the new company operating surfaces',()=>{
  const caps=JSON.parse(fs.readFileSync(new URL('../ui/core/capabilities.json',import.meta.url),'utf8')).capabilities;
  const by=Object.fromEntries(caps.map(c=>[c.id,c]));
  assert.equal(by.masterdata.gateway,'accounting');
  assert.equal(by.masterdata.company,true);
  assert.equal(by.reportingintake.gateway,'reporting');
  assert.ok(by.reportingintake.data.some(x=>x.includes('skosif-company-documents-v1')));
});
