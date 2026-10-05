import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';

const source=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const helperSource=fs.readFileSync(new URL('../ui/core/helper-space.js',import.meta.url),'utf8');
const reportingSource=fs.readFileSync(new URL('../ui/features/reporting-intake.js',import.meta.url),'utf8');
const auditSource=fs.readFileSync(new URL('../ui/features/tb-review.js',import.meta.url),'utf8');

function harness(){
  const store=new Map(),events=[],audit=[];let ledgerPosts=0;
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
  context.window.SK=context.SK=SK;context.window.SKosifLedger={post(){ledgerPosts++;throw new Error('unexpected ledger post')}};
  vm.runInContext(source,context,{filename:'company-platform.js'});
  return{api:context.window.SKosifCompanyPlatform,store,audit,events,setCompany:v=>{company={...v}},company:()=>({...company}),ledgerPosts:()=>ledgerPosts};
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

test('fixed assets calculate straight-line depreciation deterministically and never auto-post',()=>{
  const h=harness(),api=h.api;
  const a=api.addDefinition('fixedAssets',{name:'سيارة تبريد',code:'FA-01',inServiceDate:'2026-01-15',cost:1200,residualValue:0,usefulLifeMonths:12,accountCode:'1501',accumAccount:'1509',expenseAccount:'6201'});
  const march=api.assetDepreciation(a,'2026-03-31');
  assert.equal(march.elapsedMonths,3);
  assert.equal(march.accumulatedMinor,30000);
  assert.equal(march.carryingMinor,90000);
  assert.equal(march.currentMonthChargeMinor,10000);
  const j=api.fixedAssetJournal('2026-03-31');
  assert.equal(j.totalMinor,10000);
  assert.equal(j.proposals.length,1);
  assert.equal(j.proposals[0].ready,true);
  assert.equal(j.proposals[0].lines[0].debitMinor,10000);
  assert.equal(j.proposals[0].lines[1].creditMinor,10000);
  assert.equal(j.authoritative,false);
  assert.equal(j.requiresHumanPosting,true);
  assert.equal(h.ledgerPosts(),0);
  assert.throws(()=>api.addDefinition('fixedAssets',{name:'أصل خاطئ',inServiceDate:'2026-01-01',cost:100,residualValue:120,usefulLifeMonths:12}),/القيمة التخريدية/);
});

test('independent tools must come from the tools gateway',()=>{
  const h=harness();
  assert.equal(h.api.setTool('excelrecon',true),true);
  assert.equal(h.api.installed('excelrecon'),true);
  assert.throws(()=>h.api.setTool('ledger',true),/الأداة ليست ضمن بوابة الأدوات/);
});

test('reporting-to-audit handoff is explicit and remains pending until attached',()=>{
  const h=harness(),api=h.api,s=api.state();
  s.documents.push({id:'doc-1',companyId:'co-a',name:'bank.pdf',type:'bank-statement',size:10,sha256:'a'.repeat(64),importedAt:new Date().toISOString()});
  h.store.set(api.key,structuredClone(s));
  assert.equal(api.requestAuditHandoff('doc-1'),true);
  let hand=api.auditHandoffs();
  assert.equal(hand.length,1);
  assert.equal(hand[0].status,'pending');
  assert.equal(hand[0].document.name,'bank.pdf');
  assert.equal(api.markAuditHandoff(hand[0].id,'attached','PBC-01'),true);
  hand=api.auditHandoffs();
  assert.equal(hand[0].status,'attached');
  assert.equal(hand[0].requestId,'PBC-01');
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

test('company lineage links source document to report, MPM and PBC without crossing companies',()=>{
  const h=harness(),api=h.api,s=api.state();
  s.documents.push({id:'doc-tb',companyId:'co-a',name:'tb.csv',type:'trial-balance',size:10,sha256:'b'.repeat(64),importedAt:new Date().toISOString()});
  h.store.set(api.key,structuredClone(s));
  api.saveReportResult(
    {rows:[{code:'4000'}],balanced:true,errors:[],unclassified:0,difference:0},
    {checks:{mappedPct:100,balanced:true,cashTies:null},unmapped:[],keys:{operating:{current:100000,prior:null},profit:{current:70000,prior:null}}},
    'tb.csv',
    [{key:'ebitda',ar:'EBITDA',value:120000,prior:null,note:'test',rows:[]}],
    'doc-tb'
  );
  const report=api.state().reporting.lastStatements.reportRunId;
  assert.ok(api.lineageFor('document','doc-tb').some(x=>x.toType==='report-run'&&x.toId===report));
  const m=api.registerMpm({name:'EBITDA',sourceKey:'ebitda',nearestSubtotal:'operating',purpose:'تشغيلي',communicationSource:'عرض المستثمرين'});
  assert.ok(api.lineageFor('mpm',m.id).some(x=>x.fromType==='report-run'&&x.fromId===report));
  api.requestAuditHandoff('doc-tb');
  const hand=api.auditHandoffs()[0];api.markAuditHandoff(hand.id,'attached','REQ-7');
  assert.ok(api.lineageFor('document','doc-tb').some(x=>x.toType==='pbc-request'&&x.toId==='REQ-7'));
  const companyA=structuredClone(h.store.get(api.key));
  h.setCompany({id:'co-b',name:'شركة ب',currency:'SAR',country:'SA'});
  assert.equal(api.lineage().length,0);
  h.store.set(api.key,companyA);
});

test('IFRS 18 MPM registry reconciles a candidate to the nearest statement subtotal and requires human approval',()=>{
  const h=harness(),api=h.api;
  api.saveReportResult(
    {rows:[{code:'4000'}],balanced:true,errors:[],unclassified:0,difference:0},
    {checks:{mappedPct:100,balanced:true,cashTies:null},unmapped:[],keys:{operating:{current:100000,prior:80000},profit:{current:70000,prior:50000}}},
    'tb.csv',
    [{key:'ebitda',ar:'EBITDA',value:120000,prior:90000,note:'مطابقة مع الربح التشغيلي',rows:[{ar:'الربح التشغيلي',amount:100000},{ar:'الإهلاك',amount:20000}]}]
  );
  const m=api.registerMpm({name:'EBITDA',sourceKey:'ebitda',nearestSubtotal:'operating',purpose:'قياس الأداء التشغيلي قبل الإهلاك',communicationSource:'بيان النتائج العام'});
  const r=api.mpmReconciliation(m.id);
  assert.equal(r.measure.value,'120000');
  assert.equal(r.nearestValue,'100000');
  assert.equal(r.difference,'20000');
  assert.equal(r.humanApproved,false);
  assert.equal(api.approveMpm(m.id,true),true);
  assert.equal(api.mpmReconciliation(m.id).humanApproved,true);
});

test('company switch snapshots include the unified platform key',()=>{
  assert.match(helperSource,/skosif_company_platform_v1/);
});

test('reporting intake supports XLSX, ownership checks and explicit audit transfer',()=>{
  assert.match(reportingSource,/SKXlsx\.toTsv/);
  assert.match(reportingSource,/rec\.companyId!==SK\.company\.current\(\)\.id/);
  assert.match(reportingSource,/data-ri-type/);
  assert.match(reportingSource,/requestAuditHandoff/);
  assert.match(auditSource,/مصادر واردة من مساعد التقارير/);
  assert.match(auditSource,/handoff-import/);
  assert.match(auditSource,/cp\.readDocument\(h\.documentId\)/);
  assert.match(auditSource,/cp\.markAuditHandoff\(id,"attached",reqId\)/);
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
