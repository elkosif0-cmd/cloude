import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Executes the actual shell closure. DOM/storage are synthetic boundaries;
// this suite does NOT claim viewport layout or browser focus validation.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=()=>fs.readFileSync(path.join(root,process.env.SIDEBAR_SOURCE||'ui/layouts/shell.js'),'utf8');
function harness(initial={},width=1280){
  let writeFailure=false;
  const events={},docEvents={},toasts=[],actions=[],data={'skosif_prefs':{migrated:1,kosif:1,look:'kosif',rail:'full',...initial}};
  const node=(id='')=>{const attrs={},classes=new Set();return {id,attrs,dataset:{},style:{setProperty(){},removeProperty(){}},children:[],isConnected:true,inert:false,hidden:false,
    classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:v=>classes.has(v),toggle(v,on){const next=on??!classes.has(v);next?classes.add(v):classes.delete(v);return next}},
    setAttribute(k,v){attrs[k]=String(v)},getAttribute:k=>attrs[k]??null,removeAttribute:k=>delete attrs[k],toggleAttribute(k,on){if(on)attrs[k]='';else delete attrs[k]},
    appendChild(n){this.children.push(n)},append(n){this.children.push(n)},contains(other){return other===this||this.children.some(n=>n===other||n.contains?.(other))},querySelector(s){return s==='span'?this.span:null},querySelectorAll:()=>[],addEventListener(){},remove(){},after(){},before(){},focus(){document.activeElement=this},getBoundingClientRect:()=>({width:50,height:40}),getClientRects:()=>[{}]};};
  const rail=node('rail'),menu=node('menu'),main=node('main'),scrim=node('scrim'),compact=node('sk-rail-mini');compact.span={textContent:''};rail.children.push(compact);
  const de=node('html');de.dir='rtl';const body=node('body');const nodes={'#rail':rail,'.menu-btn':menu,'.topbar .menu-btn':menu,'.maincol':main,'#scrim':scrim,'.scrim':scrim,'#sk-rail-mini':compact};
  const document={documentElement:de,body,head:node('head'),readyState:'loading',activeElement:menu,createElement:()=>node(),getElementById:id=>id.startsWith('sk-font')?node(id):nodes['#'+id],querySelector:s=>nodes[s]||null,querySelectorAll:s=>s.includes('menu-btn')?[menu]:[],addEventListener:(k,f)=>{(docEvents[k]??=[]).push(f)}};
  const core={act(action){actions.push(action);rail.classList.toggle('open',action==='rail-open');scrim.classList.toggle('open',action==='rail-open')},view:()=> 'dash'};
  const SK={load:(k,d)=>structuredClone(data[k]??d),save:(k,v)=>{if(writeFailure)throw new Error('synthetic storage failure');data[k]=structuredClone(v)},$:(s,r)=>r?r.querySelector(s):document.querySelector(s),$$:(s,r)=>r?r.querySelectorAll(s):document.querySelectorAll(s),esc:String,toast:(...x)=>toasts.push(x),bus:{on(){},emit(){}},device:{keyHint:k=>'Ctrl+'+k}};
  const context=vm.createContext({SK,window:{SK,SKosifCore:core},document,innerWidth:width,localStorage:{getItem:()=>null,setItem(){},removeItem(){}},console,
    matchMedia:q=>({matches:q.includes('max-width')?context.innerWidth<=900:false,addEventListener(){}}),getComputedStyle:()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'}),
    addEventListener:(k,f)=>{(events[k]??=[]).push(f)},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:f=>f(),MutationObserver:class{observe(){} disconnect(){}},navigator:{},CSS:{escape:String}});
  vm.runInContext(source(),context,{filename:'shell.js'});
  return {api:context.window.SKosifShell,data,de,rail,menu,main,scrim,compact,actions,toasts,document,context,events,docEvents,failWrites(){writeFailure=true}};
}
test('existing compact toggle remains independent and reversible',()=>{const h=harness();h.api.toggleRail();assert.equal(h.data.skosif_prefs.rail,'mini');h.api.toggleRail(false);assert.equal(h.data.skosif_prefs.rail,'full');});
test('desktop hide and show preserve remembered compact mode',()=>{const h=harness({rail:'mini'});assert.equal(typeof h.api.toggleSidebar,'function');h.api.toggleSidebar();assert.equal(h.data.skosif_prefs.sidebarHidden,true);assert.equal(h.data.skosif_prefs.rail,'mini');assert.equal(h.de.getAttribute('data-sidebar'),'hidden');h.api.toggleSidebar();assert.equal(h.data.skosif_prefs.sidebarHidden,false);assert.equal(h.data.skosif_prefs.rail,'mini');});
test('Ctrl+B implementation changes compact preference without revealing hidden desktop',()=>{const h=harness({rail:'full',sidebarHidden:true});h.api.toggleRail();assert.equal(h.data.skosif_prefs.rail,'mini');assert.equal(h.data.skosif_prefs.sidebarHidden,true);assert.equal(h.de.getAttribute('data-sidebar'),'hidden');h.api.toggleRail();assert.equal(h.data.skosif_prefs.rail,'full');assert.equal(h.data.skosif_prefs.sidebarHidden,true);});
test('desktop hidden preference is restored without losing visible opener',()=>{const h=harness({rail:'mini',sidebarHidden:true});assert.equal(h.de.getAttribute('data-sidebar'),'hidden');assert.equal(h.menu.inert,false);assert.equal(h.menu.hidden,false);});
test('mobile toggles delegate to existing core and never save desktop visibility',()=>{const h=harness({rail:'mini',sidebarHidden:true},390);const before=JSON.stringify(h.data.skosif_prefs);assert.equal(typeof h.api.toggleSidebar,'function');h.api.toggleSidebar();assert.equal(h.actions.at(-1),'rail-open');h.api.toggleSidebar();assert.equal(h.actions.at(-1),'rail-close');assert.equal(JSON.stringify(h.data.skosif_prefs),before);});
test('900 uses mobile controller while901 uses desktop preference',()=>{const h=harness({},900);assert.equal(typeof h.api.toggleSidebar,'function');h.api.toggleSidebar();assert.equal(h.actions.at(-1),'rail-open');h.context.innerWidth=901;h.api.toggleSidebar();assert.equal(h.data.skosif_prefs.sidebarHidden,true);});
test('missing or malformed visibility preference defaults visible',()=>{for(const value of [undefined,null,'true','false',1,{}]){const h=harness({sidebarHidden:value});assert.equal(h.de.getAttribute('data-sidebar'),'visible');}});
test('hiding while a rail child is focused moves focus to visible topbar opener',()=>{const h=harness();h.compact.focus();h.api.toggleSidebar();assert.equal(h.document.activeElement,h.menu);assert.equal(h.rail.inert,true);assert.equal(h.rail.getAttribute('aria-hidden'),'true');assert.equal(h.menu.getAttribute('aria-controls'),'rail');});
test('throwing preference storage cannot persist half-hidden unreachable sidebar',()=>{const h=harness(),before=JSON.stringify(h.data);h.failWrites();assert.throws(()=>h.api.toggleSidebar(),/synthetic storage failure/);assert.equal(JSON.stringify(h.data),before);assert.equal(h.de.getAttribute('data-sidebar'),'visible');assert.equal(h.menu.inert,false);assert.equal(h.menu.hidden,false);});
