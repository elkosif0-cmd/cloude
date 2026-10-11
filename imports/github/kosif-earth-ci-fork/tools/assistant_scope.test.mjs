import test from 'node:test';import assert from 'node:assert/strict';
import {assistantHarness as harness,chatKey,deferred,tick,reply,scopeFixture,keys} from './assistant_scope_fixture.mjs';
const texts=request=>JSON.stringify(request.contents);
test('actual global storage isolates A-B-A history and mock provider contents',async()=>{
 const h=harness({provider:async()=>reply('mock')});await h.send('SYNTHETIC_A');await h.select('c2');await h.send('SYNTHETIC_B');
 assert.doesNotMatch(texts(h.requests[1]),/SYNTHETIC_A/);assert.doesNotMatch(h.html(),/SYNTHETIC_A/);assert.match(h.html(),/SYNTHETIC_B/);
 await h.select('c1');await h.send('SYNTHETIC_A_AGAIN');assert.match(texts(h.requests[2]),/SYNTHETIC_A/);assert.doesNotMatch(texts(h.requests[2]),/SYNTHETIC_B/);
 assert.equal(h.get('skosif_chat_v1'),null);assert.ok(h.get(chatKey()));assert.ok(h.get(chatKey('u1','c2')));
});
test('unknown-owner legacy chat remains byte-for-byte untouched, unpainted and unsent',async()=>{
 const h=harness({provider:async()=>reply('mock')});const raw='[{"role":"user","text":"LEGACY_UNKNOWN_OWNER"}]';h.records.set('skosif_chat_v1',raw);await h.send('fresh');
 assert.doesNotMatch(h.html(),/LEGACY_UNKNOWN_OWNER/);assert.doesNotMatch(texts(h.requests[0]),/LEGACY_UNKNOWN_OWNER/);assert.equal(h.records.get('skosif_chat_v1'),raw);assert.ok(!h.writes.includes('skosif_chat_v1'));
});
test('same-company local-user switch never inherits prior user chat',async()=>{
 const h=harness({provider:async()=>reply('mock')});await h.send('USER_ONE');const u=h.get(keys.users);u.users.u2.lastSpace='c1';u.users.u2.spaces.c1={name:'Synthetic Co'};h.set(keys.users,u);await h.user('u2');await h.send('USER_TWO');
 assert.doesNotMatch(h.html(),/USER_ONE/);assert.doesNotMatch(texts(h.requests[1]),/USER_ONE/);assert.ok(h.get(chatKey('u2','c1')));
});
test('scope transition immediately clears draft, messages and delayed reply',async()=>{
 const d=deferred(),h=harness({provider:()=>d.promise});const pending=h.send('OLD_REQUEST');h.panel.children.textarea.value='OLD_DRAFT';const changing=h.select('c2');
 assert.doesNotMatch(h.html(),/OLD_REQUEST/);assert.equal(h.panel.children.textarea.value,'');await changing;d.resolve(reply('OLD_RESPONSE'));await pending;
 assert.doesNotMatch(h.html(),/OLD_RESPONSE/);assert.ok(!JSON.stringify([...h.records]).includes('OLD_RESPONSE'));
});
test('returning to original company does not revive delayed provider tool calls',async()=>{
 const d=deferred(),h=harness({provider:()=>d.promise});const pending=h.send('OLD');await h.select('c2');await h.select('c1');d.resolve({candidates:[{content:{parts:[{functionCall:{name:'set_appearance',args:{mode:'dark'}}}]}}]});await pending;
 assert.ok(!h.effects.includes('dark'));assert.equal(h.requests.length,1);
});
test('delayed destructive confirmation cannot execute after a company switch',async()=>{
 const d=deferred(),h=harness();h.W.SK.confirm=()=>d.promise;h.W.SKosifCommand={actions:()=>[{id:'lock',t:'lock'}],run:()=>h.effects.push('unsafe')};
 const pending=h.tool('run_action',{action:'lock'});await h.select('c2');d.resolve(true);const r=await pending;assert.equal(r.ok,false);assert.ok(!h.effects.includes('unsafe'));
});
test('actual lock entry point clears visible chat and denies send/tools before redirect completes',async()=>{
 const h=harness({provider:async()=>reply('mock')});await h.send('BEFORE_LOCK');h.W.SK.lock.now();assert.doesNotMatch(h.html(),/BEFORE_LOCK/);await h.send('AFTER_LOCK');assert.equal((await h.tool('set_appearance',{mode:'dark'})).ok,false);assert.equal(h.requests.length,1);assert.ok(!h.effects.includes('dark'));
});
for(const [name,edit] of [['missing users',d=>delete d[keys.users]],['missing owner membership',d=>delete d[keys.users].users.u1.spaces.c1],['mismatched company',d=>d[keys.companies].active.companyId='c2']])test(name+' denies all assistant data paths',async()=>{
 const seed=scopeFixture();edit(seed);const h=harness({seed,provider:async()=>reply('mock')});await h.send('REFUSED');assert.equal(h.requests.length,0);assert.equal((await h.tool('set_appearance',{mode:'dark'})).ok,false);assert.ok(!h.effects.includes('dark'));
});
test('new tab reads only same-owner scoped messages after reload',async()=>{
 const h=harness({provider:async()=>reply('mock')});await h.send('PERSISTED_A');const other=harness({records:h.records});assert.match(other.html(),/PERSISTED_A/);await other.select('c2');await other.send('OTHER_B');assert.doesNotMatch(other.html(),/PERSISTED_A/);
});
test('cross-tab transition invalidates stale request before storage event delivery',async()=>{
 const d=deferred(),h=harness({provider:()=>d.promise}),other=harness({records:h.records});const pending=h.send('TAB_A');await other.select('c2');await other.select('c1');d.resolve(reply('STALE_TAB_REPLY'));await pending;assert.doesNotMatch(h.html(),/STALE_TAB_REPLY/);await h.send('SHOULD_BLOCK');assert.equal(h.requests.length,1);
});
test('cross-tab storage event immediately removes old visible state',async()=>{
 const h=harness();await h.send('VISIBLE_A');const other=harness({records:h.records});await other.select('c2');h.emit('storage',{key:'sqc_helper_space_v1'});assert.doesNotMatch(h.html(),/VISIBLE_A/);assert.equal(h.panel.children.textarea.value,'');
});
test('scoped envelope owner mismatch is preserved and denies send rather than overwriting unknown data',async()=>{
 const h=harness({provider:async()=>reply('mock')});h.set(chatKey(),{version:2,userId:'different',companyId:'c1',messages:[{role:'user',text:'WRONG_OWNER'}]});const raw=h.records.get(chatKey());await h.send('FRESH');assert.doesNotMatch(h.html(),/WRONG_OWNER/);assert.equal(h.requests.length,0);assert.equal(h.records.get(chatKey()),raw);
});
test('no-provider standards uses actual codex and keeps the complete response',async()=>{
 const h=harness({engines:true}),co=h.get(keys.companies);co.companies[0].country='EG';co.companies[0].framework='EAS';h.set(keys.companies,co);await h.send('ZATCA VAT');assert.match(h.html(),/14%/);assert.doesNotMatch(h.html(),/15%|zatca.gov/i);assert.equal(h.requests.length,0);
});

test('clearing chat cancels an existing request even without a company change',async()=>{
 const d=deferred(),h=harness({provider:()=>d.promise});const pending=h.send('CLEAR_ME');await h.clear();d.resolve(reply('MUST_NOT_RETURN'));await pending;assert.doesNotMatch(h.html(),/CLEAR_ME|MUST_NOT_RETURN/);assert.equal(h.history().length,0);
});
test('switch aborts the configured provider request signal',async()=>{
 let signal;const d=deferred(),h=harness({provider:(_body,opts)=>{signal=opts.signal;return d.promise}});const pending=h.send('PENDING');await h.select('c2');assert.equal(signal?.aborted,true);d.resolve(reply('ignored'));await pending;
});
test('full backup excludes all company chat envelopes and preserves unknown-owner legacy bytes',async()=>{
 const h=harness();await h.send('PRIVATE_SYNTHETIC_CHAT');h.records.set('skosif_chat_v1','[{"text":"LEGACY"}]');delete h.W.indexedDB;h.run('ui/core/store.js');
 const data=await h.W.SK.store.data();assert.ok(!Object.keys(data.local).some(k=>k.startsWith('skosif_chat_')));assert.equal(h.records.get('skosif_chat_v1'),'[{"text":"LEGACY"}]');
});
test('old provider failure cannot trigger local fallback tools in the newly selected company',async()=>{
 const d=deferred(),h=harness({provider:()=>d.promise});const pending=h.send('الوضع الليلي');await h.select('c2');d.reject(new Error('synthetic provider failed'));await pending;assert.ok(!h.effects.includes('dark'));assert.equal(h.history('u1','c2').length,0);
});
test('stale request completion cannot clear the newer company request or append to its history',async()=>{
 const a=deferred(),b=deferred();let n=0;const h=harness({provider:()=>++n===1?a.promise:b.promise});const first=h.send('FIRST');await h.select('c2');const second=h.send('SECOND');a.resolve(reply('FIRST_REPLY'));await first;
 assert.match(h.html(),/typing/);assert.doesNotMatch(h.html(),/FIRST_REPLY/);b.resolve(reply('SECOND_REPLY'));await second;assert.match(h.html(),/SECOND_REPLY/);assert.doesNotMatch(h.html(),/FIRST_REPLY/);
});
test('chat works without a selected reporting period while report scope remains unknown',async()=>{
 const seed=scopeFixture();delete seed[keys.companies].active.periodId;const h=harness({seed});assert.equal(h.W.SKosifSpace.scopeSnapshot().status,'unknown');await h.send('ماذا تستطيع؟');assert.equal(h.history().length,2);
});
test('empty and duplicate-company registries fail closed without creating users',async()=>{
 for(const seed of [{},(()=>{const d=scopeFixture();d[keys.companies].companies.push({...d[keys.companies].companies[0]});return d})()]){const h=harness({seed,provider:async()=>reply('never')});await h.send('no');assert.equal(h.requests.length,0);assert.equal(h.writes.length,0);}
});
test('a cancelled clear confirmation cannot erase the newly selected company history',async()=>{
 const h=harness();await h.send('KEEP_A');await h.select('c2');await h.send('KEEP_B');await h.select('c1');const d=deferred();h.W.SK.confirm=()=>d.promise;const clear=h.clear();await h.select('c2');d.resolve(true);await clear;assert.match(JSON.stringify(h.history('u1','c2')),/KEEP_B/);assert.match(JSON.stringify(h.history('u1','c1')),/KEEP_A/);
});
test('delayed CSV click checks scope again rather than acting on the next company menu',async()=>{
 const h=harness();let clicks=0;const button={click:()=>clicks++},table={offsetParent:{},getClientRects:()=>[{}],_sktb:{bar:{querySelector:()=>button}}};
 h.W.SKosifTable={};h.W.document.querySelector=s=>s==='#view'?{querySelectorAll:()=>[table]}:button;
 await h.tool('export_table',{format:'csv'});assert.equal(clicks,1);await h.select('c2');h.flush(60);assert.equal(clicks,1);
});

test('malformed scoped JSON is preserved by send and clear',async()=>{
 const h=harness({provider:async()=>reply('never')});const raw='{"broken":';h.records.set(chatKey(),raw);await h.send('blocked');await h.clear();assert.equal(h.requests.length,0);assert.equal(h.records.get(chatKey()),raw);
});
for(const action of ['item','box'])test('actual palette '+action+' delayed callback cannot execute in another company',async()=>{
 const h=harness(),actions=[];h.W.SKosifCore.go=()=>{};h.W.SKosifCore.act=name=>actions.push({name,company:h.W.SK.company.current().id});h.run('ui/components/palette.js');
 const pending=h.tool('run_action',{action});await tick();await h.select('c2');h.flush(150);const result=await pending;assert.deepEqual(actions,[]);assert.equal(result.ok,false);
});
test('actual palette scoped delayed item succeeds only after the current-context action executes',async()=>{
 const h=harness(),actions=[];h.W.SKosifCore.go=()=>{};h.W.SKosifCore.act=name=>actions.push(name);h.run('ui/components/palette.js');let settled=false;
 const pending=h.tool('run_action',{action:'item'}).then(r=>{settled=true;return r});await tick();assert.equal(settled,false);assert.deepEqual(actions,[]);h.flush(150);assert.equal((await pending).ok,true);assert.deepEqual(actions,['item-new']);
});
test('scoped palette refuses unsupported asynchronous backup while ordinary palette keeps it',async()=>{
 const h=harness();let backups=0;h.W.SK.store={backup:async()=>{backups++}};h.run('ui/components/palette.js');assert.equal((await h.tool('run_action',{action:'backup'})).ok,false);assert.equal(backups,0);assert.equal(h.W.SKosifCommand.run('backup'),true);assert.equal(backups,1);
});
test('a detached or replaced click target is revalidated after its own confirmation',async()=>{
 const h=harness(),d=deferred();let clicks=0;const el={textContent:'مسح تنفيذ',offsetParent:{},isConnected:true,getClientRects:()=>[{}],closest:()=>null,getAttribute:()=>null,scrollIntoView(){},click(){clicks++}};
 let root={querySelectorAll:()=>[el]};h.W.document.querySelector=s=>s==='#view'?root:null;h.W.SK.confirm=()=>d.promise;const pending=h.tool('click',{label:'تنفيذ'});el.isConnected=false;el.offsetParent=null;root={querySelectorAll:()=>[]};d.resolve(true);assert.equal((await pending).ok,false);assert.equal(clicks,0);
});
test('failed chat clear preserves bytes and reports the failed save',async()=>{
 const h=harness(),toasts=[];h.W.SKosifCore.toast=(...a)=>toasts.push(a);await h.send('KEEP');const raw=h.records.get(chatKey()),set=h.W.localStorage.setItem;h.W.localStorage.setItem=(k,v)=>{if(k===chatKey())throw Error('synthetic quota');set(k,v)};await h.clear();assert.equal(h.records.get(chatKey()),raw);assert.ok(toasts.some(([t])=>/تعذر/.test(t)));
});

test('delivered cross-tab lifecycle signal fails closed even when generation storage write fails',async()=>{
 const a=harness(),b=harness({records:a.records,provider:async()=>reply('must not send')});const set=a.W.localStorage.setItem;a.W.localStorage.setItem=(k,v)=>{if(k==='sqc_chat_scope_generation_v1')throw Error('quota');set(k,v)};
 a.W.SK.lock.now();assert.equal((await a.tool('set_appearance',{mode:'dark'})).ok,false);await tick();await b.send('BLOCKED');assert.equal(b.requests.length,0);
});
test('when both transports are unavailable local lock still fails closed without claiming other-tab invalidation',async()=>{
 const a=harness({broadcast:false}),b=harness({records:a.records,broadcast:false});a.W.localStorage.setItem=()=>{throw Error('quota')};a.W.SK.lock.now();assert.equal(a.W.SKosifSpace.chatScopeSnapshot().status,'locked');assert.equal((await a.tool('set_appearance',{mode:'dark'})).ok,false);assert.equal(b.W.SKosifSpace.chatScopeSnapshot().status,'stable','documented transport-failure limitation, not an authentication guarantee');
});
test('a late old-recorder onend cannot orphan the newer recorder during scope invalidation',async()=>{
 const h=harness(),recorders=[];h.W.SpeechRecognition=class {constructor(){this.stops=0;recorders.push(this)}start(){}stop(){this.stops++}};
 const button={dataset:{a:'mic'},classList:{add(){},remove(){}}},mic=()=>h.panel.handlers.click({target:{closest:s=>s==='[data-a]'?button:null}});
 await mic();const oldEnd=recorders[0].onend;await h.select('c2');await mic();oldEnd();await h.select('c1');assert.equal(recorders[0].stops,1);assert.equal(recorders[1].stops,1);
});
test('unsupported generic field fill does not dispatch arbitrary input or change handlers',async()=>{
 const h=harness(),events=[];h.W.Event=class{constructor(type){this.type=type}};
 const el={tagName:'SELECT',options:[{textContent:'x',value:'x'}],name:'حقل خاص',offsetParent:{},getClientRects:()=>[{}],getAttribute:()=>null,dataset:{},closest:()=>({textContent:'حقل خاص'}),scrollIntoView(){},dispatchEvent:e=>events.push(e.type)};
 const root={querySelectorAll:()=>[el]};h.W.document.querySelector=s=>s==='#view'?root:null;const r=await h.tool('fill_field',{label:'حقل خاص',value:'x'});assert.deepEqual(events,[]);assert.equal(r.ok,false);assert.match(r.text,/يدوياً/);
});
test('assistant page printing never delegates to an arbitrary asynchronous page button',async()=>{
 const h=harness(),effects=[];const b={offsetParent:{},getClientRects:()=>[{}],className:'print-button',click:()=>effects.push('unsafe-handler')};const root={querySelectorAll:()=>[b]};h.W.document.querySelector=s=>s==='#view'?root:null;h.W.print=()=>effects.push('native-print');assert.equal((await h.tool('print_page',{})).ok,true);assert.deepEqual(effects,['native-print']);
});
test('assistant table print refuses unguarded delayed preview while other export methods remain available',async()=>{
 const h=harness(),effects=[];const table={offsetParent:{},getClientRects:()=>[{}]},root={querySelectorAll:()=>[table]};h.W.document.querySelector=s=>s==='#view'?root:null;h.W.SKosifTable={printTable:()=>effects.push('print'),exportXlsx:()=>effects.push('xlsx')};
 assert.equal((await h.tool('export_table',{format:'print'})).ok,false);assert.equal((await h.tool('export_table',{format:'xlsx'})).ok,true);assert.deepEqual(effects,['xlsx']);
});
test('assistant refuses async demo management without changing ordinary palette use',async()=>{
 const h=harness();let demos=0;h.W.SK.demo={panel:async()=>{demos++}};h.run('ui/components/palette.js');assert.equal((await h.tool('run_action',{action:'demo'})).ok,false);assert.equal(demos,0);assert.equal(h.W.SKosifCommand.run('demo'),true);assert.equal(demos,1);
});
test('provider failure fallback never claims execution for a refused local action',async()=>{
 const h=harness({provider:async()=>{throw Error('synthetic offline')}});let backups=0;h.W.SK.store={backup:async()=>{backups++}};h.run('ui/components/palette.js');await h.send('نسخة كاملة');assert.equal(backups,0);const response=h.history().filter(m=>m.role==='model').at(-1).text;assert.doesNotMatch(response,/نفّذت ذلك محلياً/);assert.match(response,/لم يكتمل|لم يُنفّذ/);
});
test('provider system instructions disclose unsupported actions and require truthful refusal reporting',async()=>{
 const h=harness({provider:async()=>reply('mock')});await h.send('synthetic question');const instruction=h.requests[0].systemInstruction.parts[0].text;assert.match(instruction,/ok:false/);assert.match(instruction,/يدوياً/);assert.match(instruction,/لا تدّع/);
});
