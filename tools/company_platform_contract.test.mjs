import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';

const source=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const helperSource=fs.readFileSync(new URL('../ui/core/helper-space.js',import.meta.url),'utf8');
const reportingSource=fs.readFileSync(new URL('../ui/features/reporting-intake.js',import.meta.url),'utf8');

function harness(){
  const store=new Map(),events=[],audit=[];
  let company={id:'co-a',name:'شركة أ',currency:'SAR',country:'SA'},seq=0;
  const SK={
    load:(k,d)=>store.has(k)?structuredClone(store.get(k)):structuredClone(d),
    save:(k,v)=>{store.set(k,structuredClone(v));return true},
    company:{current:()=>({...company}),updateMeta:patch=>{company={...company,...patch};return true}},
    ui:{uid:p=>p+'-'+(++seq)},
    caps:{get:id=>({id,gateway:id==='excelrecon'?'tools':'accounting'})},
    audit:{log:(...x)=>audit.push(x)},
    bus:{emit:(...x)=>events.push(x)}
  };
  const context=vm.createContext({window:{},SK,console,Blob,structuredClone,Date,Math,Number,String,Object,Array,Set,JSON,TextEncoder,crypto:webcrypto,indexedDB:{open(){throw new Error('not used')}}});
  context.window.SK=context.SK=SK;
  vm.runInContext(source,context,{filename:'company-platform.js'});
  return{api:context.window.SKosifCompanyPlatform,store,audit,events,setCompany:v=>{company={...v}},company:()=>({...company})};
}

test('company profile is explicit, validated and updates company metadata',()=>{
  const h=harness();
  const p=h.api.setProfile({activity:'تجارة أغذية',country:'EG',currency:'EGP',fiscalYearStart:'07-01',taxMode:'income',vatNo:'VAT-1'});
  assert.equal(p.activity,'تجارة أغذية');
  assert.equal(p.currency,'EGP');
  assert.equal(p.taxMode,'income');
  assert.equal(h.company().currency,'EGP');
  assert.throws(()=>h.api.setProfile({currency:'R'}),/3 أحرف/);
});

test('master data is bound to the open company and never leaks by mismatch',()=>{
  const h=harness();
  h.api.addDefinition('products',{name:'منتج أ',code:'P1',cost:10,salePrice:15});
  assert.equal(h.api.definitions('products').length,1);
  const companyA=structuredClone(h.store.get(h.api.key));
  h.setCompany({id:'co-b',name:'شركة ب',currency:'SAR',country:'SA'});
  assert.equal(h.api.definitions('products').length,0);
  assert.equal(h.api.installed('excelrecon'),false);
  h.store.set(h.api.key,companyA);
  h.setCompany({id:'co-a',name:'شركة أ',currency:'SAR',country:'SA'});
  assert.equal(h.api.definitions('products').length,1);
});

test('independent tools must come from the tools gateway',()=>{
  const h=harness();
  assert.equal(h.api.setTool('excelrecon',true),true);
  assert.equal(h.api.installed('excelrecon'),true);
  assert.throws(()=>h.api.setTool('ledger',true),/الأداة ليست ضمن بوابة الأدوات/);
});

test('reporting target, result and standard trace remain explicit non-authoritative company state',()=>{
  const h=harness();
  assert.equal(h.api.reportingTarget('cashflow'),true);
  assert.equal(h.api.reportingStatus().target,'cashflow');
  h.api.saveReportResult(
    {rows:[{code:'1000'}],balanced:true,errors:[],unclassified:0,difference:0},
    {checks:{mappedPct:100,balanced:true,cashTies:null},unmapped:[],keys:{profit:{current:2500,prior:null}}},
    'tb.csv'
  );
  assert.equal(h.api.reportingStatus().lastStatements.keys.profit.current,'2500');
  const row=h.api.addStandardTrace({operation:'journal-review',standard:'IAS 2',source:'official',result:'needs review',approved:false});
  assert.equal(row.approved,false);
  assert.equal(h.api.state().standardTraces.length,1);
});

test('company switch snapshots include the unified platform key',()=>{
  assert.match(helperSource,/skosif_company_platform_v1/);
});

test('reporting intake supports XLSX and checks document ownership before reading bytes',()=>{
  assert.match(reportingSource,/SKXlsx\.toTsv/);
  assert.match(reportingSource,/rec\.companyId!==SK\.company\.current\(\)\.id/);
  assert.match(reportingSource,/data-ri-type/);
});

test('capability registry exposes the new company operating surfaces to accounting roles',()=>{
  const file=JSON.parse(fs.readFileSync(new URL('../ui/core/capabilities.json',import.meta.url),'utf8'));
  const caps=file.capabilities,by=Object.fromEntries(caps.map(c=>[c.id,c]));
  assert.equal(by.masterdata.gateway,'accounting');
  assert.equal(by.masterdata.company,true);
  assert.equal(by.reportingintake.gateway,'reporting');
  assert.ok(by.reportingintake.data.some(x=>x.includes('skosif-company-documents-v1')));
  assert.ok(file.roles.accountant.caps.includes('masterdata'));
  assert.ok(file.roles.accountant.caps.includes('reportingintake'));
});
