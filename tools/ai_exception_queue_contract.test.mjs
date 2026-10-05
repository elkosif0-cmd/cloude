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
  assert.match(helperSource,/AI EXCEPTION QUEUE/);
  assert.match(helperSource,/data-hd-exc/);
  assert.match(helperSource,/accepted/);
  assert.match(helperSource,/rejected/);
  assert.match(helperSource,/dismissed/);
  assert.match(helperSource,/لا ينفذ قيدًا أو تعديلًا تلقائيًا/);
  assert.match(helperSource,/resolveAIException/);
});

// Execute the real feature and platform across deferred UI/AI boundaries; no network or browser.
const engineSource=fs.readFileSync(new URL('../ui/core/engines.js',import.meta.url),'utf8');
function asyncHarness(){
  const store=new Map(),writes=[],forms=[],toasts=[],listeners=new Map(),views=new Map(),requests=[];
  let company={id:'co-a',name:'Company A',country:'SA',currency:'SAR',period:{id:'p1'}},seq=0;
  const emit=(name,data)=>{for(const f of listeners.get(name)||[])f(data)};
  const SK={load:(k,d)=>structuredClone(store.get(company.id+':'+k)??d),
    save:(k,v)=>{writes.push({company:company.id,key:k});store.set(company.id+':'+k,structuredClone(v));return true},
    company:{current:()=>structuredClone(company)},ui:{uid:p=>p+'-'+(++seq)},
    caps:{get:()=>null,companyGroups:()=>[],hubsInGroup:()=>[]},perm:{can:()=>false},icons:{},
    audit:{log(){}},bus:{emit,on:(name,fn)=>{if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn)}},
    view:(name,view)=>views.set(name,view),$:()=>null,esc:String,money:String,
    toast:(text,kind)=>toasts.push({text,kind,company:company.id}),
    form:(...args)=>new Promise(resolve=>forms.push({company:company.id,args,resolve}))};
  const context={console,SK,structuredClone,TextEncoder,TextDecoder,Blob,AbortController,document:{addEventListener(){}}};
  context.window=context;
  context.SKosifAI={ready:()=>true,provider:()=> 'synthetic',conf:()=>({model:'deferred'}),generate:()=>new Promise((resolve,reject)=>requests.push({resolve,reject}))};
  vm.createContext(context);
  vm.runInContext(engineSource,context);vm.runInContext(platformSource,context);
  vm.runInContext(ledgerSource.replace(/\}\)\(\);\s*$/,'window.__reviewTest={reviewDraft,bind,setDraft:v=>{draft=v}};})();'),context);
  vm.runInContext(helperSource,context);
  const draft={date:'2026-10-05',reference:'A-reference',memo:'A-memo',lines:[{accountId:'cash-a',debit:100,credit:0},{accountId:'capital-a',debit:0,credit:100}]};
  const data={accounts:[{id:'cash-a',code:'1100',name:'Cash A',type:'asset'},{id:'capital-a',code:'3000',name:'Capital A',type:'equity'}],entries:[],lockDate:''};
  context.__reviewTest.setDraft(draft);
  const root={dataset:{},innerHTML:'',isConnected:true,handlers:{},addEventListener(name,fn){this.handlers[name]=fn},querySelector(){return null}};
  return {context,api:context.SKosifCompanyPlatform,writes,forms,toasts,requests,draft,data,root,emit,
    review:()=>context.__reviewTest.reviewDraft(data),
    resolveAI:(i=0)=>requests[i].resolve({candidates:[{content:{parts:[{text:'Analysis A'}]}}]}),
    switchCompany:(id,notify=true)=>{company={...company,id,name:id};if(notify)emit('company',{companyId:id})},
    changePeriod:()=>{company.period={id:'p2'}},
    editDraft:(value)=>{context.__reviewTest.bind(root);root.handlers.input({type:'input',target:{id:'lg-memo',value,dataset:{}}})},
    decision(status='accepted'){views.get('helperdesk').render(root);const row=context.SKosifCompanyPlatform.aiExceptions()[0];return root.handlers.click({target:{closest:s=>s==='[data-hd-exc]'?{dataset:{hdExc:row.id,hdStatus:status}}:null}})}
  };
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function noEffects(h){assert.equal(h.writes.length,0);assert.equal(h.forms.length,0);assert.equal(h.toasts.length,0)}
function noPosting(h){assert.equal(h.writes.filter(x=>x.key==='skosif_ledger_v1').length,0)}

test('deferred draft review keeps same-company trace, queue and advisory result without posting',async()=>{
  const h=asyncHarness(),p=h.review();h.resolveAI();await tick();
  assert.equal(h.api.aiExceptions().length,1);assert.equal(h.api.state().standardTraces.length,1);
  assert.equal(h.forms.length,1);assert.equal(h.forms[0].company,'co-a');h.forms[0].resolve(null);await p;noPosting(h);
});
for(const [name,change] of [
  ['company switch without an event',h=>h.switchCompany('co-b',false)],
  ['company switch away and back',h=>{h.switchCompany('co-b');h.switchCompany('co-a')}],
  ['draft changed',h=>{h.draft.memo='new draft'}],
  ['draft edited and restored',h=>{h.editDraft('temporary');h.editDraft('A-memo')}],
  ['draft cleared after saving',h=>h.context.__reviewTest.setDraft(null)],
  ['period changed without an event',h=>h.changePeriod()],
  ['profile changed',h=>{h.api.setProfile({framework:'SME'});h.writes.length=0}],
  ['navigation away and back',h=>{h.emit('nav',{view:'helperdesk'});h.emit('nav',{view:'ledger'})}],
  ['ledger context updated',h=>h.emit('data',{key:'skosif_ledger_v1'})]
])test('deferred review rejects stale '+name+' before any trace, queue or result form',async()=>{
  const h=asyncHarness(),p=h.review();change(h);h.resolveAI();await tick();
  // Release an unexpected form in the red run, so a failure cannot strand the test.
  h.forms.forEach(f=>f.resolve(null));await p;noEffects(h);noPosting(h);
});
test('canceled AI review is silent and creates no advisory side effects',async()=>{
  const h=asyncHarness(),p=h.review();h.requests[0].reject(Object.assign(new Error('Canceled'),{name:'AbortError'}));await tick();h.forms.forEach(f=>f.resolve(null));await p;noEffects(h);
});
test('only the newest concurrent draft review may write or display its result',async()=>{
  const h=asyncHarness(),old=h.review(),latest=h.review();h.resolveAI(0);await tick();
  h.forms.forEach(f=>f.resolve(null));await old;noEffects(h);
  h.resolveAI(1);await tick();assert.equal(h.api.aiExceptions().length,1);assert.equal(h.api.state().standardTraces.length,1);assert.equal(h.forms.length,1);h.forms[0].resolve(null);await latest;noPosting(h);
});
for(const [name,change] of [
  ['company switch',h=>h.switchCompany('co-b',false)],
  ['switch away and back',h=>{h.switchCompany('co-b');h.switchCompany('co-a')}],
  ['changed exception',h=>{h.api.resolveAIException(h.api.aiExceptions()[0].id,'dismissed');h.writes.length=0}],
  ['canceled dialog',()=>{}]
])test('exception decision rejects '+name+' without a success toast or write',async()=>{
  const h=asyncHarness();h.api.addAIException({source:'test',title:'Suggestion'});h.writes.length=0;
  const p=h.decision();change(h);h.forms[0].resolve(name==='canceled dialog'?null:{note:'Review'});await p;
  assert.equal(h.writes.length,0);assert.equal(h.toasts.filter(x=>x.kind==='ok').length,0);noPosting(h);
});
test('unchanged exception decision saves accepted status and reports success',async()=>{
  const h=asyncHarness();h.api.addAIException({source:'test',title:'Suggestion'});h.writes.length=0;
  const p=h.decision();h.forms[0].resolve({note:'Follow up'});await p;
  assert.equal(h.api.aiExceptions()[0].status,'accepted');assert.equal(h.toasts.filter(x=>x.kind==='ok').length,1);noPosting(h);
});
test('a false exception resolution never announces success',async()=>{
  const h=asyncHarness();h.api.addAIException({source:'test',title:'Suggestion'});h.writes.length=0;
  const p=h.decision();h.context.SKosifCompanyPlatform={...h.api,resolveAIException:()=>false};h.forms[0].resolve({note:'Follow up'});await p;
  assert.equal(h.toasts.length,0);assert.equal(h.writes.length,0);assert.equal(h.api.aiExceptions()[0].status,'open');
});
