import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const platformSource=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const ledgerSource=fs.readFileSync(new URL('../ui/features/ledger.js',import.meta.url),'utf8');
const helperSource=fs.readFileSync(new URL('../ui/features/helper-center.js',import.meta.url),'utf8');

function harness(){
  const store=new Map(),audit=[];let company={id:'co-a',name:'شركة أ',currency:'SAR',country:'SA'},seq=0,posted=0;
  const SK={
    load:(k,d)=>store.has(k)?structuredClone(store.get(k)):structuredClone(d),
    save:(k,v)=>{store.set(k,structuredClone(v));return true},
    company:{current:()=>({...company}),updateMeta:()=>true},
    ui:{uid:p=>p+'-'+(++seq)},
    caps:{get:id=>({id,gateway:id==='excelrecon'?'tools':'accounting'})},
    audit:{log:(...x)=>audit.push(x)},
    bus:{emit(){}}
  };
  const context=vm.createContext({window:{},SK,console,structuredClone,Date,Math,Number,String,Object,Array,Set,JSON,TextEncoder,
    crypto:{subtle:{}},Blob,indexedDB:{open(){throw new Error('not used')}}});
  context.window.SK=context.SK=SK;
  context.window.SKosifLedger={post(){posted++;throw new Error('queue must not post')}};
  vm.runInContext(platformSource,context,{filename:'company-platform.js'});
  return{api:context.window.SKosifCompanyPlatform,store,audit,setCompany:v=>{company={...v}},posted:()=>posted};
}

test('AI exception is advisory, company-scoped and confidence is normalized',()=>{
  const h=harness(),api=h.api;
  const x=api.addAIException({source:'journal-draft-review',sourceId:'draft-1',title:'قيد يحتاج مراجعة',severity:'high',confidence:1.7,
    evidenceRefs:['IAS 2','IAS 2','ISA 500'],proposedAction:'راجع القيد',provider:'gemini',model:'test-model'});
  assert.equal(x.status,'open');
  assert.equal(x.authoritative,false);
  assert.equal(x.requiresHumanDecision,true);
  assert.equal(x.confidence,1);
  assert.deepEqual([...x.evidenceRefs],['IAS 2','ISA 500']);
  assert.equal(api.aiExceptions('open').length,1);
  assert.equal(h.posted(),0);

  h.setCompany({id:'co-b',name:'شركة ب',currency:'SAR',country:'SA'});
  assert.equal(api.aiExceptions().length,0,'another company must not see company A exceptions');
  assert.equal(h.posted(),0);
});

test('same open exception dedupes instead of creating repeated alerts',()=>{
  const h=harness(),api=h.api,input={source:'journal-draft-review',sourceId:'draft-1',dedupeKey:'same',title:'ملاحظة',detail:'v1'};
  const a=api.addAIException(input),b=api.addAIException({...input,detail:'v2'});
  assert.equal(a.id,b.id);
  assert.equal(api.aiExceptions().length,1);
  assert.equal(api.aiExceptions()[0].detail,'v2');
});

test('human outcomes only classify the suggestion and never execute it',()=>{
  const h=harness(),api=h.api,x=api.addAIException({source:'ai',title:'اقتراح تعديل',proposedAction:'اقترح فقط'});
  assert.equal(api.resolveAIException(x.id,'accepted','سيتم فحص المستند'),true);
  let row=api.aiExceptions()[0];
  assert.equal(row.status,'accepted');
  assert.equal(row.humanNote,'سيتم فحص المستند');
  assert.equal(h.posted(),0);
  assert.throws(()=>api.resolveAIException(x.id,'executed'),/حالة الاستثناء/);
  assert.equal(h.posted(),0);
});

test('journal review queues issues but retains the no-post/no-authority boundary',()=>{
  const start=ledgerSource.indexOf('async function reviewDraft(d){');
  const end=ledgerSource.indexOf('/* ---------- tabs ---------- */',start);
  const review=ledgerSource.slice(start,end);
  assert.match(review,/addAIException/);
  assert.match(review,/authoritative|اقتراح لا يرحّل ولا يعتمد/);
  assert.doesNotMatch(review,/\bput\s*\(/);
  assert.doesNotMatch(review,/reverseJournalEntry/);
  assert.doesNotMatch(review,/\.entries\.push\s*\(/);
});

test('helper gateway exposes explicit accepted/rejected/dismissed human decisions',()=>{
  /* the section's label is Arabic since R10 (it read «AI EXCEPTION QUEUE») */
  assert.match(helperSource,/قائمة الاستثناءات/);
  assert.match(helperSource,/data-hd-exc/);
  assert.match(helperSource,/accepted/);
  assert.match(helperSource,/rejected/);
  assert.match(helperSource,/dismissed/);
  assert.match(helperSource,/لا ينفذ قيدًا أو تعديلًا تلقائيًا/);
  assert.match(helperSource,/resolveAIException/);
});
