import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './output_focus_fixture.mjs';
const key=(k,more={})=>({key:k,preventDefault(){this.prevented=true},stopPropagation(){},stopImmediatePropagation(){},...more});
test('opening focuses Close synchronously and inerts the existing background',()=>{
 const h=harness(),opener=h.document.createElement('button');h.document.body.appendChild(opener);opener.focus();h.open();
 assert.ok(h.document.activeElement===h.wrap().querySelector('[data-o="close"]'),'Close owns focus');assert.equal(opener.hasAttribute('inert'),true);
});
test('explicit closing restores opener and preserves pre-existing inert state',()=>{
 const h=harness(),opener=h.document.createElement('button'),blocked=h.document.createElement('section');blocked.setAttribute('inert','');
 h.document.body.append(opener,blocked);opener.focus();const w=h.open();h.wrap().querySelector('[data-o="close"]').focus();h.click('close');assert.ok(h.document.activeElement===opener,'opener focus restored');assert.equal(opener.hasAttribute('inert'),false);assert.equal(blocked.hasAttribute('inert'),true);
});
test('late initialization never focuses a removed preview after replacement',()=>{
 const h=harness();h.open('OLD');h.open('NEW');h.runTimers({intervals:true});assert.ok(h.document.activeElement===h.wrap().querySelector('[data-o="close"]'),'Close owns focus');
});
test('final document.open must rebind embedded Escape without persistent sentinel',()=>{
 const h=harness(),w=h.open();h.api.guard(w,{identity:{},checkSync:()=>true,check:async()=>true});
 w.document.dispatch('keydown',key('Escape'));assert.ok(!h.wrap(),'preview closed');
});

test('programmatic close uses safe current heading rather than prior report opener',()=>{
 const h=harness(),o=h.button(),heading=h.document.createElement('h1');heading.id='pg-title';h.document.body.appendChild(heading);o.focus();const w=h.open();w.close();assert.ok(h.document.activeElement===heading,'safe current heading owns focus');
});
test('Shift+Tab from the programmatic dialog fallback wraps to the final document stop',()=>{
 const h=harness(),w=h.open();h.install(w);h.wrap().focus();h.key(h.document,'Tab',true);assert.ok(w.document.activeElement===w.document.getElementById('frame-last'),'reverse cycle selects final stop');
});
test('Tab from iframe document body starts at its first content control',()=>{
 const h=harness(),w=h.open();h.install(w);w.document.body.focus();h.key(w.document,'Tab');assert.ok(w.document.activeElement===w.document.getElementById('frame-first'),'content remains reachable after native print/body focus');
});
for(const changed of ['busy','tainted','returned-generation'])test('explicit Close rejects stale strict scope '+changed,()=>{
 const h=harness();let status='stable',epoch=1;h.host.SKosifSpace={scopeSnapshot:()=>({status,token:`${epoch}:${status}`,entityId:'a',periodId:'p1'})};
 const opener=h.button(),heading=h.document.createElement('h1');heading.id='pg-title';h.document.body.appendChild(heading);opener.focus();const w=h.open();h.install(w);
 if(changed==='returned-generation')epoch=3;else status=changed;h.click('close');assert.ok(h.document.activeElement===heading,'safe current heading replaces stale opener');
});
test('one tab stop cycles to itself and zero tab stops focus the named dialog',()=>{
 const h=harness(),w=h.open();h.install(w);w.document.body.textContent='Readable report';const wrap=h.wrap(),close=wrap.querySelector('[data-o="close"]');
 for(const el of wrap.querySelectorAll('button,input,select,summary,iframe'))if(el!==close)el.setAttribute('tabindex','-1');
 close.focus();h.key(h.document,'Tab');assert.ok(h.document.activeElement===close);h.key(h.document,'Tab',true);assert.ok(h.document.activeElement===close);
 close.disabled=true;wrap.focus();h.key(h.document,'Tab');assert.ok(h.document.activeElement===wrap);h.key(h.document,'Tab',true);assert.ok(h.document.activeElement===wrap);
});
test('throwing top-change callbacks cannot strand ordinary core modal ownership',()=>{
 const h=harness({coreDialogs:true}),first=h.document.createElement('div'),second=h.document.createElement('div');first.innerHTML='<button>First</button>';second.innerHTML='<button>Second</button>';h.document.body.append(first,second);
 let release;assert.doesNotThrow(()=>release=h.context.SK.modalFocus(first,null,{managed:true,restore:false,onTopChange(){throw Error('callback')}}));
 const releaseSecond=h.context.SK.modalFocus(second,null,{restore:false});second.querySelector('button').focus();release();release();const e=h.key(h.document,'Tab');assert.equal(e.defaultPrevented,true);assert.ok(second.contains(h.document.activeElement));releaseSecond();
});
test('unsupported share announces the existing message once inside the live preview',async()=>{
 const h=harness(),w=h.open();h.install(w);h.context.navigator.canShare=()=>false;h.click('share');await h.tick();
 const status=h.wrap().querySelector('[data-output-status]');assert.ok(status,'modal owns readable status');assert.equal(status.getAttribute('role'),'status');assert.equal(status.getAttribute('aria-live'),'polite');assert.equal(status.textContent,'لم تتم المشاركة: الجهاز لا يدعم مشاركة ملف المسودة كاملاً. استخدم تنزيل HTML.');assert.equal(h.effects.toasts.length,0,'no duplicate global toast');
 h.api.invalidate(w);assert.equal(status.isConnected,false);
});
for(const [kind,message]of [['empty','لا توجد جداول في هذا المستند'],['excel','صُدّر 1 جدولاً إلى Excel'],['popup','اسمح بالنوافذ المنبثقة']])test('in-modal '+kind+' notice preserves original content',async()=>{
 const h=harness({popupBlocked:kind==='popup'}),w=h.open();h.install(w);
 if(kind==='excel')w.document.body.innerHTML='<table></table>';
 if(kind==='excel'){const query=w.document.querySelectorAll;w.document.querySelectorAll=s=>s==='table'?[{rows:[{cells:[{textContent:'Header'}]},{cells:[{textContent:'10'}]}]}]:query(s)}
 h.click(kind==='popup'?'window':'excel');await h.tick();const status=h.wrap().querySelector('[data-output-status]');assert.ok(status);assert.equal(status.textContent,message);assert.equal(h.effects.toasts.length,0);
});
test('revoked pending output never announces a success in the new preview',async()=>{
 const h=harness(),old=h.open();let resolve;h.install(old,{check:()=>new Promise(r=>resolve=r)});h.click('excel');h.open('NEW');resolve(true);await h.tick();assert.equal(h.wrap().querySelector('[data-output-status]')?.textContent,'');assert.equal(h.effects.toasts.length,0);
});
for(const kind of ['body','aria-disabled'])test('invalid '+kind+' opener uses an intentional safe fallback',()=>{
 const h=harness(),heading=h.document.createElement('h1');heading.id='pg-title';h.document.body.appendChild(heading);
 if(kind==='aria-disabled'){const o=h.button();o.setAttribute('aria-disabled','true');o.focus()}
 h.open();h.click('close');assert.ok(h.document.activeElement===heading,'current heading owns focus');
});
test('presentation navigation cannot consume keys owned by a newer app dialog',async()=>{
 const h=harness({coreDialogs:true});h.open();h.click('present');await h.tick();const label=h.presentation().querySelector('.skpres-n'),before=label.textContent;
 h.context.SK.confirm('Independent dialog');const child=h.document.querySelector('.skd');child.setAttribute('tabindex','-1');child.focus();const e=h.key(h.document,'PageDown');assert.equal(e.defaultPrevented,false);assert.equal(label.textContent,before);
});
test('new app dialog exits only its suspended presentation fullscreen and handles rejection',async()=>{
 const h=harness({coreDialogs:true});h.open();h.click('present');await h.tick();const presentation=h.presentation();h.document.fullscreenElement=presentation;let exits=0;
 h.document.exitFullscreen=()=>{exits++;return Promise.reject(Error('fullscreen unavailable'))};h.context.SK.confirm('Visible child');await h.tick();assert.equal(exits,1);assert.ok(h.document.querySelector('.skd').contains(h.document.activeElement));
});
test('late fullscreen entry cannot conceal the newer app dialog',async()=>{
 const h=harness({coreDialogs:true});let resolve;const proto=Object.getPrototypeOf(h.document.body);proto.requestFullscreen=function(){const wrap=this;return new Promise(r=>resolve=()=>{h.document.fullscreenElement=wrap;r()})};
 h.open();h.click('present');await h.tick();h.context.SK.confirm('Visible newer child');let exits=0;h.document.exitFullscreen=()=>{exits++;h.document.fullscreenElement=null;return Promise.resolve()};resolve();await h.tick();assert.equal(exits,1);assert.equal(h.document.fullscreenElement,null);
});
for(const context of ['guarded','ordinary-unknown-scope'])test('iframe Escape restores context when focused frame removal would drop document focus: '+context,()=>{
 const h=harness(),opener=h.button(),heading=h.document.createElement('h1');heading.id='pg-title';h.document.body.appendChild(heading);opener.focus();if(context==='ordinary-unknown-scope')h.host.SKosifSpace={scopeSnapshot:()=>({status:'unknown',token:'unknown'})};
 const w=h.open();if(context==='guarded')h.install(w);let focused=true;h.document.hasFocus=()=>focused;
 const wrap=h.wrap(),remove=wrap.remove.bind(wrap);wrap.remove=()=>{if(h.document.activeElement===wrap.querySelector('iframe'))focused=false;remove()};
 h.runTimers({intervals:true});w.document.getElementById('frame-first').focus();w.document.body.focus();h.key(w.document,'Escape');assert.ok(!h.wrap());assert.ok(h.document.activeElement===(context==='guarded'?opener:heading),'safe host target retains document focus through iframe disposal');
});
test('closing a background iframe never transfers or restores focus into its inactive document',()=>{
 const h=harness(),w=h.open();h.install(w);w.document.getElementById('frame-first').focus();w.document.body.focus();h.document.hasFocus=()=>false;const before=h.effects.focus.length;w.close();assert.equal(h.effects.focus.length,before);assert.ok(!h.wrap());
});
test('hidden host document never restores focus even if its hasFocus signal lags visibility',()=>{
 const h=harness(),opener=h.button();opener.focus();h.open();h.document.visibilityState='hidden';h.document.hasFocus=()=>true;const before=h.effects.focus.length;h.api.close();assert.equal(h.effects.focus.length,before);
});
test('reentrant modal registration cannot reannounce the previous top as current',()=>{
 const h=harness({coreDialogs:true}),a=h.document.createElement('div'),b=h.document.createElement('div'),c=h.document.createElement('div');h.document.body.append(a,b,c);let armed=false,lastB=null;
 h.context.SK.modalFocus(a,null,{managed:true,restore:false,onTopChange:top=>{if(armed&&!top){armed=false;h.context.SK.modalFocus(c,null,{managed:true,restore:false})}}});armed=true;
 h.context.SK.modalFocus(b,null,{managed:true,restore:false,onTopChange:top=>lastB=top});assert.equal(lastB,false,'new C keeps ownership after outer notifications finish');
});
