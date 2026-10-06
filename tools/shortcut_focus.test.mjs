import test from 'node:test';
import assert from 'node:assert/strict';
import {shortcuts} from './shortcut_focus_fixture.mjs';
const command=h=>h.host.SKosifCommand,keys=h=>h.host.SKosifKeys,assistant=h=>h.host.SKosifAssistant;
for(const cached of [false,true])test('actual palette opens above output and restores focus; cached='+cached,()=>{
 const h=shortcuts();h.button().focus();if(cached){command(h).open();command(h).close()}
 h.open();const opener=h.document.activeElement;h.document.dispatch('keydown',{key:'k',code:'KeyK',ctrlKey:true,target:opener});h.mutations();
 const wrap=h.document.getElementById('sk-palette'),input=h.document.getElementById('skp-inp');assert.equal(command(h).isOpen(),true);assert.equal(wrap.hasAttribute('inert'),false);assert.ok(h.document.activeElement===input);
 command(h).open();command(h).close();assert.ok(h.document.activeElement===opener);const n=h.effects.focus.length;command(h).close();assert.equal(h.effects.focus.length,n,'double close cannot refocus');assert.equal(wrap.hasAttribute('inert'),true,'surviving output reclaims cached background');
});
test('actual keyboard-help shares ownership and closes one layer at a time',()=>{
 const h=shortcuts();h.button().focus();h.open();const opener=h.document.activeElement;h.document.dispatch('keydown',{key:'F1',code:'F1',target:opener});h.mutations();const sheet=h.document.querySelector('.skk-wrap');assert.ok(sheet);assert.equal(sheet.hasAttribute('inert'),false);assert.ok(sheet.contains(h.document.activeElement));h.key(h.document,'Escape');assert.equal(h.document.querySelector('.skk-wrap'),null);assert.ok(h.wrap());assert.ok(h.document.activeElement===opener);
});
for(const via of ['open','toggle','shortcut','palette'])test('assistant '+via+' opening is suppressed while output is active',()=>{
 const h=shortcuts();h.button().focus();h.open();const focus=h.document.activeElement;
 if(via==='open')assistant(h).open();else if(via==='toggle')assistant(h).toggle(true);else if(via==='palette')command(h).run('assistant');else h.host.dispatch('keydown',{key:'j',code:'KeyJ',ctrlKey:true,target:focus});
 h.runTimers();assert.ok(!h.document.querySelector('.ska-panel')||h.document.querySelector('.ska-panel').hidden);assert.ok(h.document.activeElement===focus);
});
test('assistant pending focus never escapes later output or a closed drawer',()=>{
 const h=shortcuts();h.button().focus();assistant(h).open();h.open();const focus=h.document.activeElement;h.runTimers();assert.ok(h.document.activeElement===focus);assistant(h).close();assert.equal(h.document.querySelector('.ska-panel').hidden,true);h.api.close();assistant(h).open();assistant(h).close();const count=h.effects.focus.length;h.runTimers();assert.equal(h.effects.focus.length,count);
});
test('shared ownership places real palette above preview and restores original inline layer',()=>{
 const h=shortcuts();const indices={skout:500,skpres:520,'skp-wrap':400,'skk-wrap':410,'skd-wrap':420};
 h.context.getComputedStyle=node=>({visibility:'visible',zIndex:node.style.getPropertyValue('z-index')||String(indices[node.className.split(' ')[0]]||'auto')});
 command(h).open();command(h).close();const palette=h.document.getElementById('sk-palette');palette.style.setProperty('z-index','7','important');h.open();command(h).open();
 assert.ok(Number(h.context.getComputedStyle(palette).zIndex)>500,'palette must render above output');command(h).close();assert.equal(palette.style.getPropertyValue('z-index'),'7');assert.equal(palette.style.getPropertyPriority('z-index'),'important');
});
test('modal release does not overwrite a later caller z-index change',()=>{
 const h=shortcuts();h.context.getComputedStyle=node=>({visibility:'visible',zIndex:node.style.getPropertyValue('z-index')||(node.className==='skout'?'500':'400')});h.open();command(h).open();const wrap=h.document.getElementById('sk-palette');wrap.style.setProperty('z-index','909','important');command(h).close();command(h).close();assert.equal(wrap.style.getPropertyValue('z-index'),'909');assert.equal(wrap.style.getPropertyPriority('z-index'),'important');
});
test('output teardown preserves a later caller-owned inert value on cached palette',()=>{
 const h=shortcuts();command(h).open();command(h).close();h.open();const palette=h.document.getElementById('sk-palette');palette.setAttribute('inert','later-owner');h.mutations();h.api.close();assert.equal(palette.getAttribute('inert'),'later-owner');
});
test('resuming output preserves a distinct later caller inert value on its suspended wrapper',async()=>{
 const h=shortcuts();h.button().focus();h.open();const wrap=h.wrap();const child=h.context.SK.confirm('Independent dialog');wrap.setAttribute('inert','later-owner');h.key(h.document,'Escape');await child;assert.equal(wrap.getAttribute('inert'),'later-owner');
});
test('completed fullscreen exit recovers actual palette input only after native BODY reset',async()=>{
 const h=shortcuts();h.open();h.click('present');await h.tick();h.document.fullscreenElement=h.presentation();let settle;h.document.exitFullscreen=()=>new Promise(resolve=>settle=()=>{h.document.fullscreenElement=null;h.document.activeElement=h.document.body;resolve()});
 command(h).open();const input=h.document.getElementById('skp-inp');assert.ok(h.document.activeElement===input);settle();await h.tick();h.runTimers();assert.ok(h.document.activeElement===input,'fullscreen completion restores the same top palette registration');
});
test('newest modal joins a pending fullscreen exit after fullscreenElement already cleared',async()=>{
 const h=shortcuts();h.open();h.click('present');await h.tick();h.document.fullscreenElement=h.presentation();let settle;h.document.exitFullscreen=()=>{h.document.fullscreenElement=null;return new Promise(resolve=>settle=()=>{h.document.activeElement=h.document.body;resolve()})};
 command(h).open();keys(h).help();const close=h.document.querySelector('.skk [data-skk-close]');assert.ok(h.document.activeElement===close);settle();await h.tick();assert.ok(h.document.activeElement===close,'newest registration owns recovery of the same native transition');
});
