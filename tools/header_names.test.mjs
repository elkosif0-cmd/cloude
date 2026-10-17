import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {harness} from './output_focus_fixture.mjs';
function setup(){
 const h=harness({root:new URL('..',import.meta.url).pathname}),d=h.document,{SK}=h.context;
 const proto=Object.getPrototypeOf(d.body);
 Object.defineProperties(proto,{firstChild:{get(){return this.firstElementChild}},childNodes:{get(){return this.children}}});
 proto.insertBefore=function(node,ref){node.parentElement?.removeChild(node);node.parentElement=this;const i=this.children.indexOf(ref);this.children.splice(i<0?this.children.length:i,0,node);return node};
 proto.after=function(...nodes){let ref=this;for(const n of nodes){ref.parentElement.insertBefore(n,ref.nextElementSibling);ref=n}};
 proto.before=function(n){this.parentElement.insertBefore(n,this)};
 const create=d.createElement;d.createElement=tag=>{const n=create(tag);if(tag==='template')n.content=n;return n};
 d.readyState='loading';
 d.body.innerHTML='<div class="maincol"><div class="topbar"><button class="menu-btn">Menu</button><div class="skt-search"></div><div class="grow"></div></div><div id="hdr"></div><main id="view"></main></div>';
 let profile={name:'فريق التسعير',title:'مراجع'};SK.$=(s,r=d)=>r.querySelector(s);SK.load=(key,fallback)=>key==='skosif_profile_v1'?profile:fallback;SK.save=()=>{};SK.org=()=>({});SK.icon=()=>'';SK.caps={get:()=>({en:'Reports'})};SK.perm={label:()=>''};SK.company={current:()=>({id:'a',name:'A',currency:'SAR',periods:[],period:{label:'2026'}}),list:()=>[]};
 h.context.matchMedia=()=>({matches:false,addEventListener(){}});h.context.window.SKosifCore={view:()=> 'reports'};
 vm.runInContext(fs.readFileSync(new URL('../ui/layouts/topbar.js',import.meta.url),'utf8'),h.context);
 return {...h,paint:()=>h.host.SKosifTopbar.paint(),profile:p=>profile=p};
}
test('avatar has a semantic name independent of compact hidden text, refreshed with profile',()=>{
 const h=setup();h.paint();const user=h.document.getElementById('sk-tb-user');user.querySelector('.tx').style.display='none';
 assert.equal(user.getAttribute('aria-label'),'قائمة المستخدم: فريق التسعير');
 h.profile({name:'سلمى'});h.paint();assert.equal(user.getAttribute('aria-label'),'قائمة المستخدم: سلمى');
 h.profile({});h.paint();assert.equal(user.getAttribute('aria-label'),'قائمة المستخدم');
});
test('quick-sale header keeps meaningful name when its only text is CSS-hidden and header repaints',()=>{
 const h=setup();h.paint();h.context.CSS={escape:s=>s};
 vm.runInContext(fs.readFileSync(new URL('../ui/core/a11y.js',import.meta.url),'utf8'),h.context);
 const hdr=h.document.getElementById('hdr');
 for(let i=0;i<2;i++){
  hdr.innerHTML='<button data-act="v12-sale-new"><svg aria-hidden="true"></svg><span class="v12-sale-text">إضافة بيع</span></button>';
  hdr.querySelector('span').style.display='none';h.mutations();h.runTimers();
  assert.equal(hdr.querySelector('button').getAttribute('aria-label'),'إضافة بيع');
 }
});

test('header exposes full current company and period names to assistive technology',()=>{
 const h=setup();h.paint();
 const co=h.document.getElementById('sk-tb-co'),pe=h.document.getElementById('sk-tb-pe');
 assert.equal(co.getAttribute('aria-label'),'الشركة الحالية: A');
 assert.match(co.getAttribute('title'),/A/);
 assert.equal(pe.getAttribute('aria-label'),'الفترة المالية: 2026');
 assert.equal(pe.getAttribute('title'),'الفترة المالية: 2026');
});
test('small-phone optional shortcuts remain reachable from user menu',()=>{
 const js=fs.readFileSync(new URL('../ui/layouts/topbar.js',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../ui/ds/luxe.css',import.meta.url),'utf8');
 assert.match(js,/data-m="go" data-v="notifications"/);
 assert.match(js,/data-m="theme"/);
 assert.match(css,/max-width:600px/);
 assert.match(css,/\.topbar #sk-tb-bell,\.topbar #sk-tb-theme\{display:none\}/);
});
