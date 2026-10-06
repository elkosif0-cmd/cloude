import test from 'node:test';
import assert from 'node:assert/strict';
import {scopeHarness,keys} from './management_report_fixtures.mjs';
import {assistantHarness,tick} from './assistant_scope_fixture.mjs';
const freshSeed=()=>({
 [keys.companies]:{companies:[{id:'demo-co',name:'Synthetic demo A',currency:'SAR',demo:true},{id:'sample-b',name:'Synthetic demo B',currency:'SAR',demo:true}],periods:[{id:'demo-p1',companyId:'demo-co',startDate:'2026-01-01',endDate:'2026-12-31'}],active:{companyId:'demo-co',periodId:'demo-p1'}},
 [keys.ledger]:{accounts:[],entries:[]},'skosif_demo_v1':{sections:{company:true},at:'2026-01-01T00:00:00Z'},
 'aghnam-pricing-v3':{raws:[],boxes:[],exps:[],settings:{biz:'Synthetic demo A'}}
});
const protectedBytes=h=>JSON.stringify([keys.companies,keys.ledger,'aghnam-pricing-v3','skosif_chat_v1'].map(k=>h.records.get(k)));
function fresh(){const h=assistantHarness({seed:freshSeed()});h.W.SKosifSpace.current();return h}
test('unselected seeded demo stays unknown; read-only getters never register a company',()=>{
 const h=fresh(),before=[...h.records];for(let i=0;i<3;i++){assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');assert.equal(h.W.SKosifSpace.scopeSnapshot().status,'unknown')}assert.deepEqual([...h.records],before);
});
test('native bootstrap reproduction: explicit same-demo confirmation produces stable scope and a working local assistant',async()=>{
 const h=fresh();h.records.set('skosif_chat_v1','[{"text":"UNKNOWN_LEGACY"}]');const before=protectedBytes(h);assert.equal(await h.select('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');await h.send('ماذا تستطيع؟');assert.equal(h.history('user-main','demo-co').length,2);assert.doesNotMatch(h.html(),/UNKNOWN_LEGACY/);assert.equal(protectedBytes(h),before);
});
test('same-user confirmation reports missing company selection rather than false readiness',async()=>{
 const h=fresh();assert.equal(await h.user('user-main'),false);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');assert.equal(await h.select('demo-co'),true);assert.equal(await h.user('user-main'),true);
});
test('same-ID public front-door intent uses the checked explicit-selection path',async()=>{
 const h=fresh();h.W.sessionStorage.setItem('sqc_company_intent',JSON.stringify({id:'demo-co',name:'Untrusted label',demo:true}));h.run('ui/core/helper-space.js');assert.equal(await h.W.SKosifSpace.intent(),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');assert.equal(h.get(keys.spaces).spaces['demo-co'].name,'Synthetic demo A');
});
test('same-ID SK.company.open delegates to checked selection rather than bypassing it',async()=>{
 const h=fresh();h.run('ui/core/company.js');await tick();assert.equal(await h.W.SK.company.open('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');
});
test('actual demo company seeder after helper initialization is admitted only by explicit selection',async()=>{
 const h=assistantHarness({seed:{},engines:true});h.run('ui/core/demo.js');await h.W.SK.demo.fill(['company'],{quiet:true});assert.equal(h.get(keys.companies).active.companyId,'demo-co');assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');assert.equal(await h.select('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');
});
test('user initialization before the actual demo company seeder does not alter admission',async()=>{
 const h=assistantHarness({seed:{},engines:true});h.W.SKosifSpace.user();h.run('ui/core/demo.js');await h.W.SK.demo.fill(['company'],{quiet:true});assert.equal(await h.select('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');
});
test('verified selection survives reload without writing new bindings or copying legacy chat',async()=>{
 const h=fresh();await h.select('demo-co');const next=assistantHarness({records:h.records,broadcast:false});assert.equal(next.W.SKosifSpace.chatScopeSnapshot().status,'stable');assert.equal(next.writes.length,0);assert.equal(next.history('user-main','demo-co').length,0);
});
for(const [name,mutate] of [
 ['real company record',h=>{const d=h.get(keys.companies);d.companies[0].demo=false;h.set(keys.companies,d)}],
 ['missing demo provenance',h=>h.records.delete('skosif_demo_v1')],
 ['conflicting active registry',h=>h.set(keys.spaces,{active:'different',spaces:{different:{name:'Other'}}})],
 ['duplicate company ID',h=>{const d=h.get(keys.companies);d.companies.push({...d.companies[0]});h.set(keys.companies,d)}],
 ['private marker',h=>h.records.set('sqc_private_space','demo-co')],
 ['other local owner',h=>{const u=h.get(keys.users);u.users.other={id:'other',lastSpace:'demo-co',spaces:{'demo-co':{name:'Synthetic demo A'}}};h.set(keys.users,u)}],
 ['corrupt space registry',h=>h.records.set(keys.spaces,'{bad')]
])test('explicit same-ID selection refuses '+name+' without changing protected data',async()=>{
 const h=fresh();mutate(h);const before=protectedBytes(h);assert.equal(await h.select('demo-co'),false);assert.notEqual(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');assert.equal(protectedBytes(h),before);
});
for(const key of [keys.users,keys.spaces,'sqc_chat_scope_generation_v1'])for(const mode of ['throw','silent'])test('failed '+mode+' persistence at '+key+' cannot report success or reload',async()=>{
 const h=fresh(),before=protectedBytes(h),set=h.W.localStorage.setItem;let reloads=0;h.W.location.reload=()=>reloads++;h.W.localStorage.setItem=(k,v)=>{if(k===key){if(mode==='throw')throw Error('synthetic quota');return}set(k,v)};
 assert.equal(await h.W.SKosifSpace.switchTo('demo-co','Synthetic demo A'),false);assert.notEqual(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');h.flush(600);assert.equal(reloads,0);assert.equal(protectedBytes(h),before);assert.equal(await h.select('demo-co'),false);
});
test('same-ID reselect after a failed transition never clears taint or returns success',async()=>{
 const h=scopeHarness();h.setMode('restore-fail');assert.equal(await h.api.switchTo('c2','Other',{reload:false}),false);h.setMode('normal');assert.equal(await h.api.switchTo('c1','Synthetic Co',{reload:false}),false);assert.equal(h.api.chatScopeSnapshot().status,'tainted');
});
test('valid already bound same-ID confirmation remains a nonmutating no-op',async()=>{
 const h=assistantHarness();const before=[...h.records];assert.equal(await h.select('c1'),true);assert.deepEqual([...h.records],before);assert.equal(await h.user('u1'),true);
});
test('existing A-B-A and different-local-user flows remain functional',async()=>{
 const h=fresh();assert.equal(await h.select('sample-b'),true);assert.equal(await h.select('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');
 const bound=assistantHarness();assert.equal(await bound.user('u2'),true);bound.run('ui/core/company.js');await tick();assert.equal(bound.W.SKosifSpace.chatScopeSnapshot().status,'stable');
});
test('a conflicting owner stored under another user key is rejected even if its internal ID is malformed',async()=>{
 const h=fresh(),u=h.get(keys.users);u.users.other={id:'user-main',lastSpace:'demo-co',spaces:{'demo-co':{name:'Synthetic demo A'}}};h.set(keys.users,u);assert.equal(await h.select('demo-co'),false);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');
});
test('a chooser-session preference failure cannot turn verified binding into an uncaught failure',async()=>{
 const h=fresh();h.W.sessionStorage.setItem=()=>{throw Error('synthetic session storage failure')};assert.equal(await h.select('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');
});
test('fresh blocked-assistant guidance points to explicit company confirmation',async()=>{
 const h=fresh(),messages=[];h.W.SKosifCore.toast=t=>messages.push(t);await h.send('ماذا تستطيع؟');assert.match(messages[0],/مبدّل الشركات.*أكّد/);assert.doesNotMatch(messages[0],/مستخدماً محلياً صالحين/);
});
test('explicit front-door demo selection before any seed follows the existing full switch and reload reconciliation',async()=>{
 const h=assistantHarness({seed:{}});h.records.set('skosif_chat_v1','[{"text":"UNASSIGNED"}]');h.W.sessionStorage.setItem('sqc_company_intent',JSON.stringify({id:'demo-co',name:'Synthetic demo A',demo:true}));h.run('ui/core/helper-space.js');assert.equal(await h.W.SKosifSpace.intent(),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'busy');
 const next=assistantHarness({records:h.records,broadcast:false});next.run('ui/core/company.js');await tick();assert.equal(next.W.SKosifSpace.chatScopeSnapshot().status,'stable');assert.equal(next.records.get('skosif_chat_v1'),'[{"text":"UNASSIGNED"}]');
});
test('failed same-ID front-door admission does not mark selection complete or remember an unverified label',async()=>{
 const h=fresh();h.records.delete('skosif_demo_v1');h.W.sessionStorage.setItem('sqc_company_intent',JSON.stringify({id:'demo-co',name:'UNVERIFIED LABEL',demo:true}));h.run('ui/core/helper-space.js');assert.equal(await h.W.SKosifSpace.intent(),false);assert.equal(h.W.sessionStorage.getItem('sqc_space_chosen'),null);assert.equal(h.W.sessionStorage.getItem('sqc_helper_user_chosen'),null);assert.equal(h.records.has('sqc_last_company'),false);
});

import {seedCompleteDemo} from './bootstrap_demo_fixture.mjs';
test('complete actual demo seeding including all IndexedDB rows can be explicitly bound',async()=>{
 const h=assistantHarness({seed:{},engines:true}),{idb,filled}=await seedCompleteDemo(h);assert.equal(filled.done.length,14);assert.ok(idb.rows('customers').size>0);assert.ok(idb.rows('orders').size>0);assert.ok(h.get(keys.ledger).entries.length>0);assert.equal(await h.select('demo-co'),true);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'stable');
});
test('actual company-only demo fill over unowned legacy ledger never adopts it',async()=>{
 const legacy={accounts:[{id:'LEGACY_UNOWNED_ACCOUNT',name:'Synthetic legacy',type:'asset'}],entries:[]};const h=assistantHarness({seed:{[keys.ledger]:legacy},engines:true});h.W.SKosifSpace.current();h.run('ui/core/demo.js');await h.W.SK.demo.fill(['company'],{quiet:true});const before=protectedBytes(h);assert.equal(await h.select('demo-co'),false);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');assert.equal(protectedBytes(h),before);
});
for(const [name,mutate] of [
 ['non-demo customer row',({idb})=>idb.rows('customers').set('unknown',{id:'unknown',name:'Synthetic unowned'})],
 ['unknown company store',({h})=>h.records.set('skosif_ops_private','[{"memo":"Synthetic unowned"}]')],
 ['mixed purchase rows',({h})=>{const p=h.get('skosif_purchasing_v1');p.orders.push({id:'legacy',supplier:'Synthetic unowned'});h.set('skosif_purchasing_v1',p)}],
 ['unreadable IndexedDB',({h})=>{h.W.indexedDB.open=()=>{throw Error('synthetic read failure')}}]
])test('full demo marker never admits '+name,async()=>{
 const h=assistantHarness({seed:{},engines:true}),{idb}=await seedCompleteDemo(h);h.W.SKosifSpace.current();mutate({h,idb});const before=[...h.records];assert.equal(await h.select('demo-co'),false);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');assert.deepEqual([...h.records],before);
});
for(const [name,mutate] of [
 ['malformed selected membership',h=>{const u=h.get(keys.users);u.users['user-main'].spaces['demo-co']='corrupt';h.set(keys.users,u)}],
 ['malformed selected space',h=>h.set(keys.spaces,{active:'demo-co',spaces:{'demo-co':'corrupt'}})],
 ['another users lastSpace-only claim',h=>{const u=h.get(keys.users);u.users.other={id:'other',lastSpace:'demo-co',spaces:{}};h.set(keys.users,u)}],
 ['empty canonical name',h=>{const c=h.get(keys.companies);c.companies[0].name='';h.set(keys.companies,c)}]
])test('explicit bootstrap refuses '+name,async()=>{const h=fresh();mutate(h);const before=[...h.records];assert.equal(await h.select('demo-co'),false);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'unknown');assert.deepEqual([...h.records],before)});
import {corePricingFactory} from './bootstrap_demo_fixture.mjs';
test('complete demo over the actual empty core factory remains eligible after actual reload normalization',async()=>{
 const h=assistantHarness({seed:{},engines:true}),core=corePricingFactory(h);h.set('aghnam-pricing-v3',core.initial);const {filled,errors}=await seedCompleteDemo(h);assert.equal(filled.done.length,14);assert.deepEqual(errors,[]);
 const price=core.normalize(h.get('aghnam-pricing-v3'));price.settings.biz=h.get(keys.companies).companies.find(c=>c.id==='demo-co').name;h.set('aghnam-pricing-v3',price);assert.ok(price.categories.length>0);assert.equal(price.meta.source,'excel');assert.equal(await h.select('demo-co'),true);
});
test('all-store admission holds its coherent read through registry handoff before a queued writer can commit',async()=>{
 const h=assistantHarness({seed:{},engines:true}),{idb}=await seedCompleteDemo(h),original=h.W.indexedDB.open;let injected=false,writerCommitted=false,writerDuringRead=false,boundWhileRead=false;const active=new Set(),scopes=[];
 const set=h.W.localStorage.setItem;h.W.localStorage.setItem=(k,v)=>{if(k===keys.spaces&&JSON.parse(v).active==='demo-co')boundWhileRead=active.size>0;set(k,v)};
 h.W.indexedDB.open=(...args)=>{const proxy={},req=original(...args);req.onsuccess=()=>{const db=req.result,transaction=db.transaction.bind(db);db.transaction=(names,mode)=>{const tx=transaction(names,mode),store=tx.objectStore.bind(tx);
   if(mode==='readonly'){active.add(tx);scopes.push(Array.isArray(names)?[...names]:[names]);let finish;Object.defineProperty(tx,'oncomplete',{configurable:true,get:()=>e=>{active.delete(tx);finish?.(e)},set:fn=>finish=fn})}
   tx.objectStore=name=>{const s=store(name),cursor=s.openCursor;if(name==='orders'&&mode==='readonly')s.openCursor=()=>{if(!injected){injected=true;const q=transaction('customers','readwrite').objectStore('customers').put({id:'queued-unowned',name:'Synthetic future row'});q.onsuccess=()=>{writerCommitted=true;writerDuringRead=active.size>0}}return cursor()};return s};return tx};proxy.result=db;proxy.onsuccess?.()};req.onerror=()=>proxy.onerror?.();return proxy};
 assert.equal(await h.select('demo-co'),true);for(let i=0;i<3&&!writerCommitted;i++)await tick();assert.equal(boundWhileRead,true);assert.equal(writerCommitted,true);assert.equal(writerDuringRead,false);assert.equal(scopes.length,1);assert.deepEqual(scopes[0].sort(),[...idb.dbs.get('aghnam-app-v7').stores.keys()].sort());
});
test('registry rollback never overwrites a conflicting peer registry',async()=>{
 const h=fresh(),set=h.W.localStorage.setItem;let injected=false;const foreign={active:'other',users:{other:{id:'other',lastSpace:'other-company',spaces:{'other-company':{name:'Synthetic other'}}}}};
 h.W.localStorage.setItem=(k,v)=>{set(k,v);if(k===keys.users&&!injected){injected=true;h.set(keys.users,foreign)}};
 assert.equal(await h.select('demo-co'),false);assert.equal(h.W.SKosifSpace.chatScopeSnapshot().status,'tainted');assert.deepEqual(JSON.parse(JSON.stringify(h.get(keys.users))),foreign);assert.equal(h.records.has(keys.spaces),false);
});
