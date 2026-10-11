import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../ui/core/audit.js',import.meta.url),'utf8');
function harness(){
 const values=new Map([['skosif_audit_trail',JSON.stringify([{type:'legacy-record'}])]]);
 const company={id:'company-A',ownerScope:'FULL_ACCOUNTING'};
 const state={gate:'accounting',busy:false,view:'ledger',user:'user-A',space:'tools-A'};
 const registry={active:'audit-A',list:[{id:'audit-A'},{id:'audit-B'}]};
 let exported=null,writeCount=0;
 const SK={
  gate:{current:()=>state.gate},company:{current:()=>company},
  perm:{role:()=> 'admin'},
  load:(k,fallback)=>k==='skosif_engagements_v1'?registry:
       values.has(k)?JSON.parse(values.get(k)):fallback,
  errors:{report:e=>{throw e}},
  bus:{on:()=>{}},
  csv:{download:(name,headers,rows)=>{exported={name,headers,rows}}}
 };
 const space={busy:()=>state.busy,
  user:()=>state.user?{id:state.user}:null,
  current:()=>state.space?{id:state.space}:null};
 vm.runInNewContext(source,{
  SK,window:{SKosifCore:{view:()=>state.view},SKosifSpace:space,
    SKosifTBReview:{activeEngagementId:()=>registry.list.some(e=>e.id===registry.active)?registry.active:""}},
  localStorage:{setItem:(k,v)=>{writeCount++;values.set(k,v)}},
  addEventListener:()=>{},setTimeout:()=>1,Date,JSON,encodeURIComponent
 });
 return {api:SK.audit,values,company,state,registry,
  exported:()=>exported,writes:()=>writeCount};
}
test('separate accounting companies never share activity',()=>{
 const h=harness();h.api.log('ledger',{act:'post'});const keyA=h.api.scopeKey();
 h.company.id='company-B';
 assert.equal(h.api.all().length,0);
 h.api.log('ledger',{act:'approve'});const keyB=h.api.scopeKey();
 assert.notEqual(keyA,keyB);h.api.flush();
 assert.equal(JSON.parse(h.values.get(keyA))[0].act,'post');
 assert.equal(JSON.parse(h.values.get(keyB))[0].act,'approve');
 h.company.id='company-A';assert.equal(h.api.all()[0].act,'post');
});
test('audit files stay separate when switching active file',()=>{
 const h=harness();h.state.gate='audit';
 h.api.log('review',{act:'round-A'});const first=h.api.scopeKey();
 h.registry.active='audit-B';
 assert.equal(h.api.all().length,0);
 h.api.log('review',{act:'round-B'});const second=h.api.scopeKey();
 assert.notEqual(first,second);
 h.api.flush();
 assert.equal(JSON.parse(h.values.get(first))[0].act,'round-A');
 assert.equal(JSON.parse(h.values.get(second))[0].act,'round-B');
 h.registry.active='audit-A';
 assert.equal(h.api.all()[0].act,'round-A');
});
test('audit file scope does not follow accounting company',()=>{
 const h=harness();h.state.gate='audit';
 const key=h.api.scopeKey();
 h.company.id='company-B';
 assert.equal(h.api.scopeKey(),key);
});
test('unregistered audit file fails closed',()=>{
 const h=harness();h.state.gate='audit';
 h.registry.active='missing';
 assert.equal(h.api.scopeKey(),'');
 assert.equal(h.api.log('review'),false);
});
test('tools user and workspace both affect event scope',()=>{
 const h=harness();h.state.gate='tools';
 const keyA=h.api.scopeKey();h.api.log('tools',{act:'A'});
 h.state.user='user-B';const keyB=h.api.scopeKey();
 assert.notEqual(keyA,keyB);assert.equal(h.api.all().length,0);
 h.state.user='user-A';h.state.space='tools-B';
 const keyC=h.api.scopeKey();
 assert.notEqual(keyA,keyC);assert.notEqual(keyB,keyC);
 assert.equal(h.api.all().length,0);
 h.api.flush();
 assert.equal(JSON.parse(h.values.get(keyA)).length,1);
});
test('pending writes bind to original company after switch',()=>{
 const h=harness();h.api.log('ledger',{act:'first'});
 const key=h.api.scopeKey();h.company.id='company-B';
 h.api.log('ledger',{act:'second'});h.api.flush();
 assert.equal(JSON.parse(h.values.get(key))[0].act,'first');
});
test('legacy shared trail is preserved without assignment',()=>{
 const h=harness();h.api.log('ledger',{act:'new'});h.api.flush();
 assert.equal(JSON.parse(h.values.get('skosif_audit_trail'))[0].type,'legacy-record');
 assert.equal(h.api.all().some(e=>e.type==='legacy-record'),false);
});
test('export and clearing apply only to current file',()=>{
 const h=harness();h.state.gate='audit';
 h.api.log('review',{act:'first'});h.registry.active='audit-B';
 h.api.log('review',{act:'second'});h.api.csv();
 assert.equal(h.exported().rows.length,1);
 h.api.clear();h.api.flush();assert.equal(h.api.all().length,0);
 h.registry.active='audit-A';assert.equal(h.api.all().length,1);
});
test('busy and unresolved accounting company are fail closed',()=>{
 const h=harness();
 h.state.busy=true;assert.equal(h.api.log('action'),false);
 h.state.busy=false;h.company.id='space-main';
 assert.equal(h.api.scopeKey(),'');
 h.company.id='company-A';h.company.ownerScope='AUDIT_ONLY';
 assert.equal(h.api.scopeKey(),'');
});
test('records are scoped without deleting legacy data or fetching content',()=>{
 assert.doesNotMatch(source,/localStorage\.removeItem/);
 assert.doesNotMatch(source,/\bfetch\(/);
 const h=harness();h.api.log('data',{key:'synthetic'});h.api.flush();
 assert.equal(h.writes(),1);
});

test('ledger-initiated review import is filed under the registered audit engagement, not the accounting company',()=>{
 const h=harness();
 assert.equal(h.state.gate,'accounting');
 assert.equal(h.api.log('tbreview',{act:'import',source:'synthetic trial balance'}),true);
 const auditKey=h.api.scopeKey('tbreview');
 assert.match(auditKey,/audit:audit-A$/);
 assert.equal(h.api.all().length,0,'accounting bucket does not inherit audit import events');
 h.state.view='tbreview';
 assert.equal(h.api.scopeKey(),auditKey,'audit screen uses its registered file regardless of the original gate');
 assert.equal(h.api.all()[0].act,'import');
 h.registry.active='audit-B';
 assert.equal(h.api.all().length,0,'a different audit file cannot read the prior import');
 h.registry.active='missing';
 assert.equal(h.api.log('tbreview',{act:'import'}),false,'missing audit engagement is fail-closed');
});
